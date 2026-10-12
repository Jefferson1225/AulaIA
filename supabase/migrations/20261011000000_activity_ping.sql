-- Consulta mínima de solo lectura para comprobar actividad desde un cliente público.
-- No devuelve datos de las tablas ni modifica registros.
create or replace function public.aulaia_activity_ping()
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.categories);
$$;

revoke all on function public.aulaia_activity_ping() from public, anon, authenticated;
grant execute on function public.aulaia_activity_ping() to anon;
