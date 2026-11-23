create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Users read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users update their own name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'student');
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Cupo compartido entre instancias de Vercel: 30 preguntas por usuario y día UTC.
create table public.tutor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  request_count integer not null check (request_count between 1 and 30),
  primary key (user_id, day)
);

alter table public.tutor_daily_usage enable row level security;
revoke all on public.tutor_daily_usage from anon, authenticated;

create or replace function public.claim_tutor_request()
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  claimed_count integer;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  insert into public.tutor_daily_usage (user_id, day, request_count)
  values ((select auth.uid()), (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update
    set request_count = public.tutor_daily_usage.request_count + 1
    where public.tutor_daily_usage.request_count < 30
  returning request_count into claimed_count;

  return claimed_count is not null;
end;
$$;

revoke all on function public.claim_tutor_request() from public, anon, authenticated;
grant execute on function public.claim_tutor_request() to authenticated;
