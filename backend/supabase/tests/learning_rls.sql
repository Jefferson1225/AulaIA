-- Ejecutar únicamente en una base de pruebas con las migraciones aplicadas.
-- Todos los datos de prueba se deshacen al terminar.
begin;

insert into auth.users (id, raw_user_meta_data) values
  ('dada0000-0000-4000-8000-000000000001', '{}'),
  ('dada0000-0000-4000-8000-000000000002', '{}');
insert into public.courses (slug,title,category_slug,level,duration_hours,is_published) values
  ('prueba-daniel', 'Prueba de progreso', 'programacion', 'principiante', 1, true),
  ('borrador-daniel', 'Curso borrador', 'programacion', 'principiante', 1, false);
insert into public.modules (course_slug,slug,title,position) values ('prueba-daniel','base','Base',1);
insert into public.lessons (course_slug,module_slug,slug,title,position,duration_minutes,intro,content)
values ('prueba-daniel','base','primera','Primera',1,10,'Introducción','Contenido');

set local role authenticated;
select set_config('request.jwt.claim.sub','dada0000-0000-4000-8000-000000000001',true);

do $$ begin
  begin
    insert into public.enrollments (user_id,course_slug) values ('dada0000-0000-4000-8000-000000000002','prueba-daniel');
    raise exception 'ERROR: se permitió matricular a otra persona';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.enrollments (user_id,course_slug) values (auth.uid(),'borrador-daniel');
    raise exception 'ERROR: se permitió matricularse en un borrador';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.lesson_completions (user_id,course_slug,lesson_slug) values (auth.uid(),'prueba-daniel','primera');
    raise exception 'ERROR: se permitió completar sin matrícula';
  exception when insufficient_privilege then null; end;
end $$;

insert into public.enrollments (user_id,course_slug) values (auth.uid(),'prueba-daniel') on conflict (user_id,course_slug) do nothing;
insert into public.enrollments (user_id,course_slug) values (auth.uid(),'prueba-daniel') on conflict (user_id,course_slug) do nothing;
insert into public.lesson_completions (user_id,course_slug,lesson_slug) values (auth.uid(),'prueba-daniel','primera') on conflict (user_id,course_slug,lesson_slug) do nothing;
insert into public.lesson_completions (user_id,course_slug,lesson_slug) values (auth.uid(),'prueba-daniel','primera') on conflict (user_id,course_slug,lesson_slug) do nothing;

do $$ begin
  if (select count(*) from public.enrollments) <> 1 then raise exception 'ERROR: matrícula duplicada'; end if;
  if (select count(*) from public.lesson_completions) <> 1 then raise exception 'ERROR: completado duplicado'; end if;
  begin
    insert into public.lesson_completions (user_id,course_slug,lesson_slug) values (auth.uid(),'prueba-daniel','no-existe');
    raise exception 'ERROR: se permitió completar una lección inexistente';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.lesson_completions (user_id,course_slug,lesson_slug) values ('dada0000-0000-4000-8000-000000000002','prueba-daniel','primera');
    raise exception 'ERROR: se permitió escribir progreso ajeno';
  exception when insufficient_privilege then null; end;
  begin
    update public.enrollments set user_id='dada0000-0000-4000-8000-000000000002';
    raise exception 'ERROR: se permitió reasignar una matrícula';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','dada0000-0000-4000-8000-000000000002',true);
do $$ begin
  if exists (select 1 from public.enrollments) then raise exception 'ERROR: se pudo leer matrícula ajena'; end if;
  if exists (select 1 from public.lesson_completions) then raise exception 'ERROR: se pudo leer progreso ajeno'; end if;
end $$;
delete from public.lesson_completions where user_id='dada0000-0000-4000-8000-000000000001';

select set_config('request.jwt.claim.sub','dada0000-0000-4000-8000-000000000001',true);
do $$ begin
  if (select count(*) from public.lesson_completions) <> 1 then raise exception 'ERROR: otro usuario pudo borrar el progreso'; end if;
end $$;
delete from public.lesson_completions where user_id=auth.uid() and course_slug='prueba-daniel';
do $$ begin
  if exists (select 1 from public.lesson_completions) then raise exception 'ERROR: no se pudo desmarcar la lección propia'; end if;
end $$;
insert into public.lesson_completions (user_id,course_slug,lesson_slug) values (auth.uid(),'prueba-daniel','primera');

set local role anon;
do $$ begin
  begin
    perform 1 from public.enrollments;
    raise exception 'ERROR: lectura anónima de matrículas';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.lesson_completions;
    raise exception 'ERROR: lectura anónima de progreso';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
delete from public.lessons where course_slug='prueba-daniel' and slug='primera';
do $$ begin
  if exists (select 1 from public.lesson_completions where course_slug='prueba-daniel') then raise exception 'ERROR: progreso huérfano después de eliminar lección'; end if;
end $$;
rollback;
