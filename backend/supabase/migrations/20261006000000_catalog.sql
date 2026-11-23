-- Fichas de catálogo. Los módulos y lecciones se incorporarán en otra migración.
create table public.categories (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) > 0),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now()
);

create table public.courses (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) > 0),
  category_slug text not null references public.categories(slug) on update cascade,
  level text not null check (level in ('principiante', 'intermedio', 'avanzado')),
  duration_hours integer not null check (duration_hours > 0),
  description text not null default '',
  symbol text not null default '◈',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index courses_published_category_idx on public.courses (category_slug) where is_published;
create index courses_published_title_idx on public.courses (title) where is_published;

alter table public.categories enable row level security;
alter table public.courses enable row level security;

revoke all on public.categories, public.courses from anon, authenticated;
grant select on public.categories, public.courses to authenticated;

create policy "Authenticated users read categories"
on public.categories for select to authenticated
using (true);

create policy "Authenticated users read published courses"
on public.courses for select to authenticated
using (is_published = true);

insert into public.categories (slug, name, position) values
  ('programacion', 'Programación', 1),
  ('datos', 'Ciencia de datos', 2),
  ('matematicas', 'Matemáticas', 3),
  ('idiomas', 'Idiomas', 4),
  ('diseno', 'Diseño', 5),
  ('negocios', 'Negocios', 6);

insert into public.courses (slug, title, category_slug, level, duration_hours, description, symbol, is_published) values
  ('fundamentos-python', 'Fundamentos de Python', 'programacion', 'principiante', 18, 'Aprende a programar desde cero con ejercicios y ejemplos prácticos.', '⟨/⟩', true),
  ('analisis-datos', 'Análisis de datos con Excel y SQL', 'datos', 'principiante', 24, 'Organiza, consulta y visualiza información para tomar mejores decisiones.', 'ƒ(x)', true),
  ('ingles-profesional', 'Inglés profesional para negocios', 'idiomas', 'intermedio', 16, 'Comunícate con seguridad en reuniones, correos y presentaciones.', 'Aa', true),
  ('algebra-machine-learning', 'Álgebra lineal para Machine Learning', 'matematicas', 'intermedio', 20, 'Domina vectores, matrices y conceptos que sustentan los modelos de IA.', '∑', true),
  ('diseno-interfaces', 'Diseño de interfaces digitales', 'diseno', 'principiante', 10, 'Crea interfaces claras y consistentes centradas en las personas.', '◐', true),
  ('introduccion-ia', 'Introducción a la Inteligencia Artificial', 'datos', 'principiante', 14, 'Explora los principios, aplicaciones y límites de la IA actual.', '✦', true);
