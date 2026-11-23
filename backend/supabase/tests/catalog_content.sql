-- La primera entrega debe permitir estudiar y evaluar cada curso del catálogo.
begin;
do $$ declare course record; begin
 for course in select slug from public.courses where is_published loop
  if (select count(*) from public.modules where course_slug=course.slug)<2 then raise exception 'Curso sin módulos suficientes: %',course.slug; end if;
  if (select count(*) from public.lessons where course_slug=course.slug)<4 then raise exception 'Curso sin lecciones suficientes: %',course.slug; end if;
  if not exists(select 1 from public.assessments where course_slug=course.slug and is_published) then raise exception 'Curso sin evaluación: %',course.slug; end if;
 end loop;
 if exists(select 1 from public.assessments a where a.is_published and (
   (select count(*) from public.assessment_questions q where q.assessment_id=a.id)<3
   or exists(select 1 from public.assessment_questions q left join aulaia_private.assessment_answer_keys k on k.question_id=q.id where q.assessment_id=a.id and k.question_id is null)
 )) then raise exception 'Evaluación incompleta'; end if;
 if exists(select 1 from public.modules m where not exists(select 1 from public.lessons l where l.course_slug=m.course_slug and l.module_slug=m.slug)) then raise exception 'Módulo vacío'; end if;
end $$;
rollback;
