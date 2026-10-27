create schema if not exists aulaia_private;
revoke all on schema aulaia_private from public, anon, authenticated;

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.courses(slug) on update cascade on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  passing_score integer not null default 12 check (passing_score between 1 and 20),
  is_published boolean not null default false,
  version integer not null default 1 check(version>0),
  created_at timestamptz not null default now()
);
create index assessments_course_idx on public.assessments(course_slug);

create table public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  prompt text not null check (char_length(trim(prompt)) between 3 and 2000),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  position integer not null check (position between 1 and 10000)
);
create index assessment_questions_order_idx on public.assessment_questions(assessment_id,position,id);

-- Este esquema no se expone por la API y no tiene permisos para los roles de la aplicación.
create table aulaia_private.assessment_answer_keys (
  question_id uuid primary key references public.assessment_questions(id) on delete cascade,
  correct_option integer not null check (correct_option between 0 and 3)
);
revoke all on aulaia_private.assessment_answer_keys from public, anon, authenticated;

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  course_slug text not null,
  assessment_title text not null,
  score numeric(4,2) not null check (score between 0 and 20),
  passing_score integer not null check (passing_score between 1 and 20),
  correct_count integer not null check (correct_count >= 0),
  total_questions integer not null check (total_questions between 1 and 50 and correct_count <= total_questions),
  passed boolean not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  unique(user_id,request_id)
);
create index assessment_attempts_user_idx on public.assessment_attempts(user_id,assessment_id,submitted_at desc);
create index assessment_attempts_assessment_idx on public.assessment_attempts(assessment_id);

alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;
revoke all on public.assessments,public.assessment_questions,public.assessment_attempts from anon,authenticated;
grant select on public.assessments,public.assessment_questions,public.assessment_attempts to authenticated;

create policy "Admins read all assessments" on public.assessments for select to authenticated
using ((select public.is_content_admin()));
create policy "Members read published assessments" on public.assessments for select to authenticated
using (is_published and exists (select 1 from public.courses c where c.slug=course_slug and c.is_published));
create policy "Admins read assessment questions" on public.assessment_questions for select to authenticated
using ((select public.is_content_admin()));
create policy "Enrolled members read published assessment questions" on public.assessment_questions for select to authenticated
using (exists (
  select 1 from public.assessments a join public.enrollments e on e.course_slug=a.course_slug
  join public.courses c on c.slug=a.course_slug
  where a.id=assessment_id and a.is_published and c.is_published and e.user_id=(select auth.uid())
));
create policy "Users read their assessment attempts" on public.assessment_attempts for select to authenticated
using (user_id=(select auth.uid()));

-- El bloqueo se comparte con el envío de intentos: evita modificar preguntas mientras se califica.
create function aulaia_private.require_editable_assessment(p_id uuid) returns void
language plpgsql set search_path='' as $$
declare assessment public.assessments;
begin
  if not public.is_content_admin() then raise exception 'Solo administración.' using errcode='42501'; end if;
  select * into assessment from public.assessments where id=p_id for update;
  if not found then raise exception 'Evaluación inexistente.' using errcode='22023'; end if;
  if assessment.is_published or exists (select 1 from public.assessment_attempts where assessment_id=p_id) then
    raise exception 'Solo se editan borradores sin intentos.' using errcode='22023';
  end if;
end $$;

create function public.save_assessment(p_id uuid,p_course_slug text,p_title text,p_description text,p_passing_score integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  if not public.is_content_admin() then raise exception 'Solo administración.' using errcode='42501'; end if;
  if p_id is null then
    insert into public.assessments(course_slug,title,description,passing_score)
    values(p_course_slug,trim(p_title),trim(p_description),p_passing_score) returning id into result;
  else
    perform aulaia_private.require_editable_assessment(p_id);
    update public.assessments set title=trim(p_title),description=trim(p_description),passing_score=p_passing_score,version=version+1
    where id=p_id and course_slug=p_course_slug returning id into result;
    if not found then raise exception 'Curso de evaluación inválido.' using errcode='22023'; end if;
  end if;
  return result;
end $$;

create function public.save_assessment_question(p_assessment_id uuid,p_question_id uuid,p_prompt text,p_options jsonb,p_correct_option integer,p_position integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  perform aulaia_private.require_editable_assessment(p_assessment_id);
  if jsonb_typeof(p_options) is distinct from 'array' then raise exception 'Se requieren cuatro alternativas.' using errcode='22023'; end if;
  if jsonb_array_length(p_options) <> 4 or exists (
    select 1 from jsonb_array_elements(p_options) v where jsonb_typeof(v)<>'string' or char_length(trim(v #>> '{}')) not between 1 and 500
  ) then raise exception 'Alternativas inválidas.' using errcode='22023'; end if;
  if p_correct_option is null or p_correct_option not between 0 and 3 then raise exception 'Clave inválida.' using errcode='22023'; end if;
  if p_question_id is null then
    if (select count(*) from public.assessment_questions where assessment_id=p_assessment_id)>=50 then raise exception 'Máximo 50 preguntas.' using errcode='22023'; end if;
    insert into public.assessment_questions(assessment_id,prompt,options,position)
    values(p_assessment_id,trim(p_prompt),p_options,p_position) returning id into result;
  else
    update public.assessment_questions set prompt=trim(p_prompt),options=p_options,position=p_position
    where id=p_question_id and assessment_id=p_assessment_id returning id into result;
    if not found then raise exception 'Pregunta inexistente.' using errcode='22023'; end if;
  end if;
  insert into aulaia_private.assessment_answer_keys(question_id,correct_option) values(result,p_correct_option)
  on conflict(question_id) do update set correct_option=excluded.correct_option;
  update public.assessments set version=version+1 where id=p_assessment_id;
  return result;
end $$;

create function public.delete_assessment_question(p_assessment_id uuid,p_question_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform aulaia_private.require_editable_assessment(p_assessment_id);
  delete from public.assessment_questions where id=p_question_id and assessment_id=p_assessment_id;
  if not found then raise exception 'Pregunta inexistente.' using errcode='22023'; end if;
  update public.assessments set version=version+1 where id=p_assessment_id;
end $$;

create function public.delete_assessment(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform aulaia_private.require_editable_assessment(p_id);
  delete from public.assessments where id=p_id;
end $$;

create function public.set_assessment_published(p_id uuid,p_published boolean) returns void
language plpgsql security definer set search_path='' as $$
declare assessment public.assessments; question_count integer;
begin
  if not public.is_content_admin() then raise exception 'Solo administración.' using errcode='42501'; end if;
  select * into assessment from public.assessments where id=p_id for update;
  if not found or p_published is null then raise exception 'Evaluación inválida.' using errcode='22023'; end if;
  if p_published then
    select count(*) into question_count from public.assessment_questions where assessment_id=p_id;
    if question_count not between 1 and 50 or exists (
      select 1 from public.assessment_questions q left join aulaia_private.assessment_answer_keys k on k.question_id=q.id
      where q.assessment_id=p_id and k.question_id is null
    ) or not exists (select 1 from public.courses where slug=assessment.course_slug and is_published) then
      raise exception 'Se necesitan preguntas completas y un curso publicado.' using errcode='22023';
    end if;
  end if;
  update public.assessments set is_published=p_published,version=version+1 where id=p_id;
end $$;

create function public.get_managed_assessment(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not public.is_content_admin() then raise exception 'Solo administración.' using errcode='42501'; end if;
  select jsonb_build_object('id',a.id,'courseSlug',a.course_slug,'title',a.title,'description',a.description,
    'passingScore',a.passing_score,'isPublished',a.is_published,'version',a.version,
    'hasAttempts',exists(select 1 from public.assessment_attempts t where t.assessment_id=a.id),
    'questions',coalesce((select jsonb_agg(jsonb_build_object('id',q.id,'prompt',q.prompt,'options',q.options,'position',q.position,'correctOption',k.correct_option) order by q.position,q.id)
      from public.assessment_questions q join aulaia_private.assessment_answer_keys k on k.question_id=q.id where q.assessment_id=a.id),'[]'::jsonb))
  into result from public.assessments a where a.id=p_id;
  return result;
end $$;

create function public.submit_assessment(p_assessment_id uuid,p_answers jsonb,p_request_id uuid,p_version integer) returns uuid
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

revoke all on all functions in schema aulaia_private from public,anon,authenticated;
revoke all on function public.save_assessment(uuid,text,text,text,integer),
 public.save_assessment_question(uuid,uuid,text,jsonb,integer,integer),public.delete_assessment_question(uuid,uuid),
 public.delete_assessment(uuid),public.set_assessment_published(uuid,boolean),public.get_managed_assessment(uuid),
 public.submit_assessment(uuid,jsonb,uuid,integer) from public,anon,authenticated;
grant execute on function public.save_assessment(uuid,text,text,text,integer),
 public.save_assessment_question(uuid,uuid,text,jsonb,integer,integer),public.delete_assessment_question(uuid,uuid),
 public.delete_assessment(uuid),public.set_assessment_published(uuid,boolean),public.get_managed_assessment(uuid),
 public.submit_assessment(uuid,jsonb,uuid,integer) to authenticated;

-- Ejemplo inicial para probar el recorrido con el curso de Python existente.
insert into public.assessments(id,course_slug,title,description,passing_score) values
 ('ea100000-0000-4000-8000-000000000001','fundamentos-python','Variables y tipos de datos','Comprueba los conceptos de la lección de Python.',12);
insert into public.assessment_questions(id,assessment_id,prompt,options,position) values
 ('ea200000-0000-4000-8000-000000000001','ea100000-0000-4000-8000-000000000001','¿Cuál es el tipo de 24 en Python?','["int","str","bool","float"]',1),
 ('ea200000-0000-4000-8000-000000000002','ea100000-0000-4000-8000-000000000001','¿Cuál de estos valores es booleano?','["24","True","1.68","hola"]',2),
 ('ea200000-0000-4000-8000-000000000003','ea100000-0000-4000-8000-000000000001','¿Qué función permite consultar el tipo de un valor?','["print()","input()","type()","len()"]',3);
insert into aulaia_private.assessment_answer_keys(question_id,correct_option) values
 ('ea200000-0000-4000-8000-000000000001',0),('ea200000-0000-4000-8000-000000000002',1),('ea200000-0000-4000-8000-000000000003',2);
update public.assessments set is_published=true where id='ea100000-0000-4000-8000-000000000001';
