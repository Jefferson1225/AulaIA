-- Las matrículas no guardan porcentajes: el avance se calcula sobre las lecciones vigentes.
create table public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null references public.courses(slug) on update cascade on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);

create index enrollments_course_idx on public.enrollments(course_slug);

create table public.lesson_completions (
  user_id uuid not null,
  course_slug text not null,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_slug),
  foreign key (user_id, course_slug) references public.enrollments(user_id, course_slug) on update cascade on delete cascade,
  foreign key (course_slug, lesson_slug) references public.lessons(course_slug, slug) on update cascade on delete cascade
);

create index lesson_completions_lesson_idx on public.lesson_completions(course_slug, lesson_slug);

alter table public.enrollments enable row level security;
alter table public.lesson_completions enable row level security;
revoke all on public.enrollments, public.lesson_completions from anon, authenticated;
grant select, insert on public.enrollments to authenticated;
grant select, insert, delete on public.lesson_completions to authenticated;

create policy "Users read their enrollments" on public.enrollments
for select to authenticated using (user_id = (select auth.uid()));

create policy "Users enroll themselves in published courses" on public.enrollments
for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.courses c where c.slug = course_slug and c.is_published)
);

create policy "Users read their completed lessons" on public.lesson_completions
for select to authenticated using (user_id = (select auth.uid()));

create policy "Enrolled users complete lessons of published courses" on public.lesson_completions
for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.enrollments e where e.user_id = (select auth.uid()) and e.course_slug = lesson_completions.course_slug)
  and exists (select 1 from public.courses c where c.slug = course_slug and c.is_published)
);

create policy "Users unmark their completed lessons" on public.lesson_completions
for delete to authenticated using (user_id = (select auth.uid()));
