-- El progreso se comprueba con las lecciones actuales y el usuario de la sesión.
create function aulaia_private.assessment_course_completed(p_course_slug text)
returns boolean language sql stable security invoker set search_path='' as $$
  select exists (
    select 1 from public.enrollments e
    where e.course_slug=p_course_slug and e.user_id=(select auth.uid())
  )
  and exists (select 1 from public.lessons l where l.course_slug=p_course_slug)
  and not exists (
    select 1 from public.lessons l
    where l.course_slug=p_course_slug
    and not exists (
      select 1 from public.lesson_completions lc
      where lc.course_slug=l.course_slug and lc.lesson_slug=l.slug
        and lc.user_id=(select auth.uid())
    )
  );
$$;

revoke all on function aulaia_private.assessment_course_completed(text) from public, anon;
grant execute on function aulaia_private.assessment_course_completed(text) to authenticated;

drop policy "Enrolled members read published assessment questions" on public.assessment_questions;
create policy "Course completion unlocks published assessment questions"
on public.assessment_questions for select to authenticated
using (exists (
  select 1 from public.assessments a join public.courses c on c.slug=a.course_slug
  where a.id=assessment_id and a.is_published and c.is_published
    and aulaia_private.assessment_course_completed(a.course_slug)
));

-- Se conservan la calificación, el historial y la idempotencia de los intentos existentes.
create or replace function public.submit_assessment(p_assessment_id uuid,p_answers jsonb,p_request_id uuid,p_version integer) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  owner_id uuid := auth.uid(); assessment public.assessments; existing public.assessment_attempts;
  question record; total integer; correct_count integer:=0; selected_index integer; selected_text text;
  results jsonb:='[]'; result_id uuid;
begin
  if owner_id is null then raise exception 'Inicia sesión.' using errcode='42501'; end if;
  if p_request_id is null or p_assessment_id is null then raise exception 'Falta identificador de envío.' using errcode='22023'; end if;
  select * into existing from public.assessment_attempts where user_id=owner_id and request_id=p_request_id;
  if found then
    if existing.assessment_id<>p_assessment_id then raise exception 'Identificador reutilizado.' using errcode='22023'; end if;
    return existing.id;
  end if;
  select * into assessment from public.assessments where id=p_assessment_id for update;
  if not found or not assessment.is_published
    or not exists(select 1 from public.courses where slug=assessment.course_slug and is_published)
    or not exists(select 1 from public.enrollments where user_id=owner_id and course_slug=assessment.course_slug)
  then raise exception 'Evaluación no disponible o sin matrícula.' using errcode='42501'; end if;
  -- Repite la comprobación después del bloqueo para tolerar envíos simultáneos del mismo formulario.
  select * into existing from public.assessment_attempts where user_id=owner_id and request_id=p_request_id;
  if found then
    if existing.assessment_id<>p_assessment_id then raise exception 'Identificador reutilizado.' using errcode='22023'; end if;
    return existing.id;
  end if;
  if not aulaia_private.assessment_course_completed(assessment.course_slug) then
    raise exception 'Completa las lecciones del curso antes de rendir la evaluación.' using errcode='42501';
  end if;
  if p_version is distinct from assessment.version then raise exception 'La evaluación cambió. Recarga antes de enviarla.' using errcode='22023'; end if;
  select count(*) into total from public.assessment_questions where assessment_id=p_assessment_id;
  if total not between 1 and 50 or jsonb_typeof(p_answers) is distinct from 'array' then raise exception 'Respuestas inválidas.' using errcode='22023'; end if;
  if jsonb_array_length(p_answers)<>total or (select count(distinct value->>'questionId') from jsonb_array_elements(p_answers))<>total then
    raise exception 'Responde una vez cada pregunta.' using errcode='22023';
  end if;
  for question in select q.*,k.correct_option from public.assessment_questions q
    join aulaia_private.assessment_answer_keys k on k.question_id=q.id where q.assessment_id=p_assessment_id order by q.position,q.id
  loop
    select value->>'optionIndex' into selected_text from jsonb_array_elements(p_answers) where value->>'questionId'=question.id::text;
    if selected_text is null or selected_text !~ '^[0-3]$' then raise exception 'Pregunta o alternativa inválida.' using errcode='22023'; end if;
    selected_index:=selected_text::integer;
    if selected_index=question.correct_option then correct_count:=correct_count+1; end if;
    results:=results||jsonb_build_array(jsonb_build_object('questionId',question.id,'prompt',question.prompt,
      'selectedOption',question.options->>selected_index,'correct',selected_index=question.correct_option));
  end loop;
  if jsonb_array_length(results)<>total then raise exception 'Evaluación incompleta.' using errcode='22023'; end if;
  insert into public.assessment_attempts(assessment_id,user_id,request_id,course_slug,assessment_title,score,passing_score,correct_count,total_questions,passed,answers)
  values(p_assessment_id,owner_id,p_request_id,assessment.course_slug,assessment.title,round(correct_count::numeric*20/total,2),
    assessment.passing_score,correct_count,total,correct_count*20>=assessment.passing_score*total,results) returning id into result_id;
  return result_id;
end $$;
