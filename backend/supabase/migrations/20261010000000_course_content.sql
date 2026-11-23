-- Administración de cursos y contenido. El rol se consulta en el servidor y se vuelve
-- a comprobar en PostgreSQL para que ninguna llamada directa a la API lo eluda.
create or replace function public.is_content_admin()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_content_admin() from public, anon, authenticated;
grant execute on function public.is_content_admin() to authenticated;

grant insert, update, delete on public.courses to authenticated;

create policy "Admins read all courses"
on public.courses for select to authenticated
using ((select public.is_content_admin()));

create policy "Admins create courses"
on public.courses for insert to authenticated
with check ((select public.is_content_admin()));

create policy "Admins update courses"
on public.courses for update to authenticated
using ((select public.is_content_admin()))
with check ((select public.is_content_admin()));

create policy "Admins delete courses"
on public.courses for delete to authenticated
using ((select public.is_content_admin()));

create table public.modules (
  course_slug text not null references public.courses(slug) on update cascade on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) > 0),
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  primary key (course_slug, slug)
);

create index modules_course_position_idx on public.modules (course_slug, position, slug);

create table public.lessons (
  course_slug text not null,
  module_slug text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) > 0),
  position integer not null check (position > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  intro text not null check (char_length(trim(intro)) > 0),
  content text not null check (char_length(trim(content)) > 0),
  example_code text not null default '',
  tip text not null default '',
  created_at timestamptz not null default now(),
  primary key (course_slug, slug),
  foreign key (course_slug, module_slug) references public.modules(course_slug, slug)
    on update cascade on delete cascade
);

create index lessons_module_position_idx on public.lessons (course_slug, module_slug, position, slug);

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
revoke all on public.modules, public.lessons from anon, authenticated;
grant select, insert, update, delete on public.modules, public.lessons to authenticated;

create policy "Members read modules of published courses"
on public.modules for select to authenticated
using (exists (
  select 1 from public.courses c
  where c.slug = course_slug and c.is_published
));

create policy "Admins read all modules"
on public.modules for select to authenticated
using ((select public.is_content_admin()));

create policy "Admins create modules"
on public.modules for insert to authenticated
with check ((select public.is_content_admin()));

create policy "Admins update modules"
on public.modules for update to authenticated
using ((select public.is_content_admin()))
with check ((select public.is_content_admin()));

create policy "Admins delete modules"
on public.modules for delete to authenticated
using ((select public.is_content_admin()));

create policy "Members read lessons of published courses"
on public.lessons for select to authenticated
using (exists (
  select 1 from public.courses c
  where c.slug = course_slug and c.is_published
));

create policy "Admins read all lessons"
on public.lessons for select to authenticated
using ((select public.is_content_admin()));

create policy "Admins create lessons"
on public.lessons for insert to authenticated
with check ((select public.is_content_admin()));

create policy "Admins update lessons"
on public.lessons for update to authenticated
using ((select public.is_content_admin()))
with check ((select public.is_content_admin()));

create policy "Admins delete lessons"
on public.lessons for delete to authenticated
using ((select public.is_content_admin()));

-- Mantiene disponible la lección de muestra al activar la lectura desde Supabase.
insert into public.modules (course_slug, slug, title, position) values
  ('fundamentos-python', 'fundamentos', 'Módulo 1 · Fundamentos', 1);

insert into public.lessons (
  course_slug, module_slug, slug, title, position, duration_minutes,
  intro, content, example_code, tip
) values (
  'fundamentos-python', 'fundamentos', 'variables-y-tipos',
  'Variables y tipos de datos', 1, 18,
  'Aprende cómo guardar información y reconocer los valores básicos que usarás en tus programas.',
  'En Python, una variable es un nombre que guarda un valor para usarlo más tarde. No necesitas declarar su tipo: Python lo identifica automáticamente. Los tipos básicos son int, float, str y bool.',
  E'nombre = "Valentina"\nedad = 24\naltura = 1.68\nes_estudiante = True',
  'Puedes consultar el tipo de un valor con type(). Por ejemplo, type(24) devuelve int.'
);
