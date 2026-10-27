-- El cliente solo lee su historial y valora respuestas. La facturación y las
-- respuestas se escriben exclusivamente mediante funciones del servidor.
create table public.tutor_requests (
 id uuid primary key,
 conversation_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 course_slug text not null,
 lesson_slug text not null,
 question text not null check(char_length(trim(question)) between 1 and 1000),
 answer text,
 status text not null default 'pending' check(status in ('pending','succeeded','failed')),
 model text,
 prompt_tokens integer check(prompt_tokens>=0),
 completion_tokens integer check(completion_tokens>=0),
 cached_tokens integer check(cached_tokens>=0),
 latency_ms integer check(latency_ms>=0),
 reserved_cost_usd numeric(12,8) not null check(reserved_cost_usd>0),
 cost_usd numeric(12,8) not null check(cost_usd>=0),
 error_code text,
 truncated boolean not null default false,
 feedback text check(feedback in ('positive','negative')),
 feedback_comment text check(char_length(feedback_comment)<=500),
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 foreign key(course_slug,lesson_slug) references public.lessons(course_slug,slug) on update cascade on delete cascade
);
create index tutor_requests_owner_idx on public.tutor_requests(user_id,course_slug,lesson_slug,created_at desc);
create index tutor_requests_conversation_idx on public.tutor_requests(conversation_id,created_at);
alter table public.tutor_requests enable row level security;
revoke all on public.tutor_requests from public,anon,authenticated,service_role;
grant select on public.tutor_requests to authenticated;
create policy "Users read their tutor history" on public.tutor_requests for select to authenticated
using(user_id=(select auth.uid()));

-- El consumo no desaparece al eliminar una cuenta o una lección. Este registro
-- privado conserva solo el UUID técnico y el importe, sin texto ni usuario.
create table aulaia_private.tutor_cost_ledger (
 request_id uuid primary key,
 cost_usd numeric(12,8) not null check(cost_usd>=0)
);
alter table aulaia_private.tutor_cost_ledger enable row level security;
revoke all on aulaia_private.tutor_cost_ledger from public,anon,authenticated,service_role;

create function public.begin_tutor_request(p_id uuid,p_conversation_id uuid,p_user_id uuid,
 p_course_slug text,p_lesson_slug text,p_question text,p_reserved_cost numeric,p_budget numeric)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 -- Serializa la admisión entre todas las instancias, sin depender de memoria local.
 perform pg_advisory_xact_lock(73194268);
 if exists(select 1 from aulaia_private.tutor_cost_ledger where request_id=p_id) then return jsonb_build_object('code','duplicate'); end if;
 if p_budget is null or p_budget<=0 or p_reserved_cost is null or p_reserved_cost<=0 then
  return jsonb_build_object('code','budget');
 end if;
 if not exists(select 1 from public.enrollments e join public.courses c on c.slug=e.course_slug
   join public.lessons l on l.course_slug=c.slug
   where e.user_id=p_user_id and c.slug=p_course_slug and l.slug=p_lesson_slug and c.is_published) then
  raise exception 'Se requiere una matrícula y una lección publicada.' using errcode='42501';
 end if;
 if exists(select 1 from public.tutor_requests where conversation_id=p_conversation_id
   and (user_id<>p_user_id or course_slug<>p_course_slug or lesson_slug<>p_lesson_slug)) then
  raise exception 'Conversación inválida.' using errcode='42501';
 end if;
 if exists(select 1 from public.tutor_requests where user_id=p_user_id and status='pending' and created_at>now()-interval '60 seconds') then
  return jsonb_build_object('code','busy');
 end if;
 if (select count(*) from public.tutor_requests where user_id=p_user_id
   and created_at>=date_trunc('day',now() at time zone 'utc') at time zone 'utc')>=30 then
  return jsonb_build_object('code','quota');
 end if;
 if (select coalesce(sum(cost_usd),0) from aulaia_private.tutor_cost_ledger)+p_reserved_cost>p_budget then
  return jsonb_build_object('code','budget');
 end if;
 insert into public.tutor_requests(id,conversation_id,user_id,course_slug,lesson_slug,question,reserved_cost_usd,cost_usd)
 values(p_id,p_conversation_id,p_user_id,p_course_slug,p_lesson_slug,trim(p_question),p_reserved_cost,p_reserved_cost);
 insert into aulaia_private.tutor_cost_ledger(request_id,cost_usd) values(p_id,p_reserved_cost);
 return jsonb_build_object('code','ok');
end $$;

create function public.finish_tutor_request(p_id uuid,p_answer text,p_model text,p_prompt_tokens integer,
 p_completion_tokens integer,p_cached_tokens integer,p_latency_ms integer,p_error_code text,p_truncated boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 -- Los fallos o interrupciones conservan la reserva: el proveedor podría haber
 -- cobrado aunque no se recibiera el resultado. No se liberan fondos a ciegas.
 update public.tutor_requests set
 status=case when p_error_code is null then 'succeeded' else 'failed' end,
 answer=p_answer,model=p_model,prompt_tokens=p_prompt_tokens,completion_tokens=p_completion_tokens,
 cached_tokens=p_cached_tokens,latency_ms=p_latency_ms,error_code=p_error_code,truncated=p_truncated,finished_at=now(),
 cost_usd=case when p_error_code is null then round((p_prompt_tokens::numeric*0.30+p_completion_tokens::numeric*1.20)/1000000,8) else cost_usd end
 where id=p_id and status='pending';
 if not found then raise exception 'Consulta no pendiente.' using errcode='22023'; end if;
 update aulaia_private.tutor_cost_ledger set cost_usd=(select cost_usd from public.tutor_requests where id=p_id) where request_id=p_id;
end $$;

create function public.rate_tutor_response(p_id uuid,p_feedback text,p_comment text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_feedback is null or p_feedback not in ('positive','negative') or char_length(coalesce(p_comment,''))>500 then
  raise exception 'Valoración inválida.' using errcode='22023';
 end if;
 update public.tutor_requests set feedback=p_feedback,feedback_comment=nullif(trim(p_comment),'')
 where id=p_id and user_id=(select auth.uid()) and status='succeeded';
 if not found then raise exception 'Respuesta no disponible.' using errcode='42501'; end if;
end $$;

create function public.get_tutor_metrics()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_content_admin() then raise exception 'Solo administración.' using errcode='42501'; end if;
 return (select jsonb_build_object(
  'total',count(*),'succeeded',count(*) filter(where status='succeeded'),
  'failed',count(*) filter(where status='failed'),'pending',count(*) filter(where status='pending'),
  'meanLatencyMs',avg(latency_ms) filter(where status='succeeded'),
  'promptTokens',coalesce(sum(prompt_tokens),0),'completionTokens',coalesce(sum(completion_tokens),0),
  'estimatedCostUsd',(select coalesce(sum(cost_usd),0) from aulaia_private.tutor_cost_ledger),
  'rated',count(*) filter(where status='succeeded' and feedback is not null),
  'positive',count(*) filter(where feedback='positive'),'negative',count(*) filter(where feedback='negative'),
  'truncated',count(*) filter(where truncated),
  'models',coalesce(jsonb_agg(distinct model) filter(where model is not null),'[]'::jsonb)
 ) from public.tutor_requests);
end $$;

revoke all on function public.begin_tutor_request(uuid,uuid,uuid,text,text,text,numeric,numeric),
 public.finish_tutor_request(uuid,text,text,integer,integer,integer,integer,text,boolean),
 public.rate_tutor_response(uuid,text,text),public.get_tutor_metrics() from public,anon,authenticated,service_role;
grant execute on function public.begin_tutor_request(uuid,uuid,uuid,text,text,text,numeric,numeric),
 public.finish_tutor_request(uuid,text,text,integer,integer,integer,integer,text,boolean) to service_role;
grant execute on function public.rate_tutor_response(uuid,text,text),public.get_tutor_metrics() to authenticated;
