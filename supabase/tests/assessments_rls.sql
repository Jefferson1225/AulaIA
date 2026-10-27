-- Solo para una base de pruebas con las migraciones aplicadas. Datos revertidos al terminar.
begin;
insert into auth.users (id,raw_user_meta_data) values
 ('eca00000-0000-4000-8000-000000000001','{}'),
 ('eca00000-0000-4000-8000-000000000002','{}'),
 ('eca00000-0000-4000-8000-000000000003','{}');
update public.profiles set role='admin' where id='eca00000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','eca00000-0000-4000-8000-000000000003',true);
select public.save_assessment(null,'fundamentos-python','Borrador de prueba','',12);
-- Las pruebas usan un registro temporal para compartir identificadores entre bloques.
reset role;
create temporary table assessment_test_ids (id uuid);
insert into assessment_test_ids select id from public.assessments where title='Borrador de prueba';
grant select on assessment_test_ids to authenticated;
set local role authenticated;
do $$ declare question_id uuid; draft_id uuid := (select id from assessment_test_ids); begin
  begin
    perform public.set_assessment_published((select id from assessment_test_ids),true);
    raise exception 'Se publicó una evaluación sin preguntas';
  exception when invalid_parameter_value then null; end;
  question_id:=public.save_assessment_question(draft_id,null,'Pregunta de prueba','["A","B","C","D"]',0,1);
  perform public.save_assessment_question(draft_id,question_id,'Pregunta editada','["A","B","C","D"]',1,1);
  if public.get_managed_assessment(draft_id)->'questions'->0->>'correctOption'<>'1' then raise exception 'No se guardó la clave administrativa'; end if;
  perform public.set_assessment_published(draft_id,true);
  begin
    perform public.save_assessment_question(draft_id,question_id,'Edición indebida','["A","B","C","D"]',0,1);
    raise exception 'Se editó una evaluación publicada';
  exception when invalid_parameter_value then null; end;
  perform public.set_assessment_published(draft_id,false);
  perform public.delete_assessment_question(draft_id,question_id);
  perform public.delete_assessment(draft_id);
end $$;

select set_config('request.jwt.claim.sub','eca00000-0000-4000-8000-000000000001',true);
do $$ begin
  if exists (select 1 from public.assessment_questions) then raise exception 'Un usuario sin matrícula puede leer preguntas'; end if;
  begin
    perform 1 from aulaia_private.assessment_answer_keys;
    raise exception 'Se filtraron claves correctas';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_managed_assessment('ea100000-0000-4000-8000-000000000001');
    raise exception 'Un estudiante leyó el panel administrativo';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_assessment(null,'fundamentos-python','Intrusión','',12);
    raise exception 'Un estudiante creó una evaluación';
  exception when insufficient_privilege then null; end;
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[]','eca00000-0000-4000-8000-000000000010',1);
    raise exception 'Se aceptó un envío sin matrícula';
  exception when insufficient_privilege then null; end;
end $$;

insert into public.enrollments(user_id,course_slug) values(auth.uid(),'fundamentos-python');
do $$ begin
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":0},{"questionId":"ea200000-0000-4000-8000-000000000002","optionIndex":1},{"questionId":"ea200000-0000-4000-8000-000000000003","optionIndex":2}]','eca00000-0000-4000-8000-000000000010',0);
    raise exception 'Se calificó un formulario de versión antigua';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[]','eca00000-0000-4000-8000-000000000010',1);
    raise exception 'Se aceptó un envío incompleto';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":0},{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":0},{"questionId":"ea200000-0000-4000-8000-000000000003","optionIndex":2}]','eca00000-0000-4000-8000-000000000010',1);
    raise exception 'Se aceptaron preguntas duplicadas';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":4},{"questionId":"ea200000-0000-4000-8000-000000000002","optionIndex":1},{"questionId":"ea200000-0000-4000-8000-000000000003","optionIndex":2}]','eca00000-0000-4000-8000-000000000010',1);
    raise exception 'Se aceptó una alternativa inválida';
  exception when invalid_parameter_value then null; end;
end $$;

select public.submit_assessment('ea100000-0000-4000-8000-000000000001','[{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":0},{"questionId":"ea200000-0000-4000-8000-000000000002","optionIndex":1},{"questionId":"ea200000-0000-4000-8000-000000000003","optionIndex":0}]','eca00000-0000-4000-8000-000000000010',1);
select public.submit_assessment('ea100000-0000-4000-8000-000000000001','[]','eca00000-0000-4000-8000-000000000010',1);
do $$ declare result public.assessment_attempts; begin
  if (select count(*) from public.assessment_attempts) <> 1 then raise exception 'El reenvío duplicó un intento'; end if;
  select * into result from public.assessment_attempts limit 1;
  if result.score <> 13.33 or result.correct_count <> 2 or result.total_questions <> 3 or not result.passed then raise exception 'Calificación incorrecta'; end if;
  if result.answers::text like '%correctOption%' or result.answers::text like '%correct_option%' then raise exception 'Se expuso la clave en el resultado'; end if;
  begin
    update public.assessment_attempts set score=20;
    raise exception 'Se permitió falsificar una nota';
  exception when insufficient_privilege then null; end;
end $$;

select public.submit_assessment('ea100000-0000-4000-8000-000000000001','[{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":1},{"questionId":"ea200000-0000-4000-8000-000000000002","optionIndex":0},{"questionId":"ea200000-0000-4000-8000-000000000003","optionIndex":0}]','eca00000-0000-4000-8000-000000000013',1);
select public.submit_assessment('ea100000-0000-4000-8000-000000000001','[{"questionId":"ea200000-0000-4000-8000-000000000001","optionIndex":0},{"questionId":"ea200000-0000-4000-8000-000000000002","optionIndex":1},{"questionId":"ea200000-0000-4000-8000-000000000003","optionIndex":2}]','eca00000-0000-4000-8000-000000000014',1);
do $$ begin
  if not exists(select 1 from public.assessment_attempts where score=0 and not passed and correct_count=0) then raise exception 'Calificación mínima incorrecta'; end if;
  if not exists(select 1 from public.assessment_attempts where score=20 and passed and correct_count=3) then raise exception 'Calificación máxima incorrecta'; end if;
end $$;

select set_config('request.jwt.claim.sub','eca00000-0000-4000-8000-000000000002',true);
do $$ begin
  if exists (select 1 from public.assessment_attempts) then raise exception 'Se filtró un resultado ajeno'; end if;
end $$;
select set_config('request.jwt.claim.sub','eca00000-0000-4000-8000-000000000003',true);
select public.set_assessment_published('ea100000-0000-4000-8000-000000000001',false);
do $$ begin
  begin
    perform public.save_assessment_question('ea100000-0000-4000-8000-000000000001','ea200000-0000-4000-8000-000000000001','Pregunta modificada','["A","B","C","D"]',0,1);
    raise exception 'Se modificó una pregunta con intentos';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.delete_assessment('ea100000-0000-4000-8000-000000000001');
    raise exception 'Se eliminó una evaluación con historial';
  exception when invalid_parameter_value then null; end;
end $$;
select set_config('request.jwt.claim.sub','eca00000-0000-4000-8000-000000000001',true);
do $$ begin
  if (select count(*) from public.assessment_attempts) <> 3 then raise exception 'Se perdió el resultado al despublicar'; end if;
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[]','eca00000-0000-4000-8000-000000000011',1);
    raise exception 'Se aceptó un intento en una evaluación despublicada';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin
    perform public.submit_assessment('ea100000-0000-4000-8000-000000000001','[]','eca00000-0000-4000-8000-000000000012',1);
    raise exception 'Se aceptó un envío anónimo';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
