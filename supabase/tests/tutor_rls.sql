-- Ejecutar solo en una base de pruebas con las migraciones aplicadas.
begin;
insert into auth.users(id,raw_user_meta_data) values
 ('eca30000-0000-4000-8000-000000000001','{}'),
 ('eca30000-0000-4000-8000-000000000002','{}');
insert into public.enrollments(user_id,course_slug) values
 ('eca30000-0000-4000-8000-000000000001','fundamentos-python');
set local role service_role;
do $$ declare result jsonb; begin
 result:=public.begin_tutor_request('eca30000-0000-4000-8000-000000000011','eca30000-0000-4000-8000-000000000021',
  'eca30000-0000-4000-8000-000000000001','fundamentos-python','variables-y-tipos','¿Qué es int?',0.001,0.002);
 if result->>'code'<>'ok' then raise exception 'No se admitió la consulta'; end if;
 result:=public.begin_tutor_request('eca30000-0000-4000-8000-000000000012','eca30000-0000-4000-8000-000000000021',
  'eca30000-0000-4000-8000-000000000001','fundamentos-python','variables-y-tipos','Otra',0.001,0.002);
 if result->>'code'<>'busy' then raise exception 'Se admitieron consultas simultáneas del mismo usuario'; end if;
 perform public.finish_tutor_request('eca30000-0000-4000-8000-000000000011','Una variable.', 'deepseek-flash',100,20,0,1000,null,false);
 result:=public.begin_tutor_request('eca30000-0000-4000-8000-000000000012','eca30000-0000-4000-8000-000000000022',
  'eca30000-0000-4000-8000-000000000001','fundamentos-python','variables-y-tipos','Otra',0.002,0.002);
 if result->>'code'<>'budget' then raise exception 'Se rebasó el presupuesto acumulado'; end if;
 result:=public.begin_tutor_request('eca30000-0000-4000-8000-000000000011','eca30000-0000-4000-8000-000000000021',
  'eca30000-0000-4000-8000-000000000001','fundamentos-python','variables-y-tipos','¿Qué es int?',0.001,0.002);
 if result->>'code'<>'duplicate' then raise exception 'Se repitió una llamada ya facturada'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','eca30000-0000-4000-8000-000000000001',true);
do $$ begin
 if (select count(*) from public.tutor_requests)<>1 then raise exception 'No se recuperó el historial propio'; end if;
 perform public.rate_tutor_response('eca30000-0000-4000-8000-000000000011','positive','Claro');
 begin
  update public.tutor_requests set answer='Falsificada';
  raise exception 'Se pudo falsificar una respuesta';
 exception when insufficient_privilege then null; end;
 begin
  perform public.begin_tutor_request(gen_random_uuid(),gen_random_uuid(),auth.uid(),'fundamentos-python','variables-y-tipos','Gratis',0.001,100);
  raise exception 'Un cliente pudo ampliar su presupuesto';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','eca30000-0000-4000-8000-000000000002',true);
do $$ begin
 if exists(select 1 from public.tutor_requests) then raise exception 'Se filtró una conversación ajena'; end if;
 begin
  perform public.rate_tutor_response('eca30000-0000-4000-8000-000000000011','negative','Ajena');
  raise exception 'Se valoró una respuesta ajena';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin
  perform 1 from public.tutor_requests;
  raise exception 'Se permitió historial anónimo';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set role='admin' where id='eca30000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','eca30000-0000-4000-8000-000000000001',true);
do $$ declare metrics jsonb; begin
 metrics:=public.get_tutor_metrics();
 if (metrics->>'total')::integer<>1 or (metrics->>'positive')::integer<>1
  or (metrics->>'meanLatencyMs')::numeric<>1000 then raise exception 'Agregación incorrecta'; end if;
end $$;
select set_config('request.jwt.claim.sub','eca30000-0000-4000-8000-000000000002',true);
do $$ begin
 begin
  perform public.get_tutor_metrics();
  raise exception 'Un estudiante consultó las métricas globales';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.enrollments(user_id,course_slug) values ('eca30000-0000-4000-8000-000000000002','fundamentos-python');
insert into public.tutor_requests(id,conversation_id,user_id,course_slug,lesson_slug,question,status,reserved_cost_usd,cost_usd)
select gen_random_uuid(),gen_random_uuid(),'eca30000-0000-4000-8000-000000000002','fundamentos-python','variables-y-tipos','Prueba de cupo','failed',0.001,0.001
from generate_series(1,30);
set local role service_role;
do $$ declare result jsonb; begin
 begin
  perform public.begin_tutor_request(gen_random_uuid(),'eca30000-0000-4000-8000-000000000021',
   'eca30000-0000-4000-8000-000000000002','fundamentos-python','variables-y-tipos','Ajena',0.001,1);
  raise exception 'Se reutilizó una conversación de otro usuario';
 exception when insufficient_privilege then null; end;
 result:=public.begin_tutor_request(gen_random_uuid(),gen_random_uuid(),
  'eca30000-0000-4000-8000-000000000002','fundamentos-python','variables-y-tipos','Consulta 31',0.001,1);
 if result->>'code'<>'quota' then raise exception 'Se rebasó el cupo diario'; end if;
end $$;
reset role;
delete from auth.users where id='eca30000-0000-4000-8000-000000000001';
delete from public.tutor_requests where user_id='eca30000-0000-4000-8000-000000000002';
set local role service_role;
do $$ declare result jsonb; begin
 result:=public.begin_tutor_request(gen_random_uuid(),gen_random_uuid(),
  'eca30000-0000-4000-8000-000000000002','fundamentos-python','variables-y-tipos','No reembolsar consumo',0.002,0.002);
 if result->>'code'<>'budget' then raise exception 'Borrar un usuario liberó un consumo ya realizado'; end if;
end $$;
rollback;
