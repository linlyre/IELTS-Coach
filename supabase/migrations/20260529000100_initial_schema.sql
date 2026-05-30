create extension if not exists pgcrypto with schema extensions;

create type public.report_status as enum ('pending', 'completed', 'failed');
create type public.essay_status as enum ('pending_reflection', 'in_progress', 'completed');
create type public.drill_status as enum ('pending', 'completed');
create type public.weakness_severity as enum ('low', 'medium', 'high');
create type public.preview_item_type as enum ('red_sentence', 'yellow_sentence', 'criteria_advice');

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  target_band numeric(2, 1) not null default 6.5
    check (target_band in (6.0, 6.5, 7.0, 7.5)),
  current_level text not null default '不确定'
    check (current_level in ('5.0', '5.5', '6.0', '不确定')),
  exam_date date,
  main_goal text not null default '提分'
    check (main_goal in ('提分', '纠错', '积累表达', '稳定发挥', '稳定冲击 7.0')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_owner_required check (is_demo or user_id is not null),
  constraint user_profiles_demo_owner_empty check (not is_demo or user_id is null)
);

create unique index user_profiles_user_id_key
  on public.user_profiles(user_id)
  where user_id is not null;

create table public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid references public.user_profiles(id) on delete set null,
  is_demo boolean not null default false,
  task_type text not null default 'task_2' check (task_type = 'task_2'),
  prompt text not null,
  essay_text text not null,
  word_count integer not null check (word_count >= 0),
  source text not null default 'user_submission'
    check (source in ('user_submission', 'sample_seed')),
  status public.essay_status not null default 'pending_reflection',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint essays_owner_required check (is_demo or user_id is not null),
  constraint essays_demo_owner_empty check (not is_demo or user_id is null)
);

create table public.writing_reports (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essays(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  status public.report_status not null default 'completed',
  coach_summary text not null,
  diagnostic_band numeric(2, 1) not null check (diagnostic_band between 0 and 9),
  target_band numeric(2, 1) not null check (target_band in (6.0, 6.5, 7.0, 7.5)),
  word_count integer not null check (word_count >= 0),
  biggest_gap text not null,
  priority_fix text not null,
  next_practice_suggestion text not null,
  criteria jsonb not null default '{}'::jsonb,
  ai_json jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint writing_reports_essay_unique unique (essay_id),
  constraint writing_reports_owner_required check (is_demo or user_id is not null),
  constraint writing_reports_demo_owner_empty check (not is_demo or user_id is null)
);

create table public.weakness_tags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.writing_reports(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  category text not null,
  tag text not null,
  severity public.weakness_severity not null default 'medium',
  explanation text not null,
  evidence text not null,
  created_at timestamptz not null default now(),
  constraint weakness_tags_owner_required check (is_demo or user_id is not null),
  constraint weakness_tags_demo_owner_empty check (not is_demo or user_id is null)
);

create table public.improvement_preview_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.writing_reports(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  item_type public.preview_item_type not null,
  sort_order integer not null default 0,
  original_text text,
  ai_response text,
  issue text,
  category text,
  explanation text,
  why_it_works text,
  practice_tip text,
  evaluation text,
  evidence text,
  next_step text,
  created_at timestamptz not null default now(),
  constraint improvement_preview_items_owner_required check (is_demo or user_id is not null),
  constraint improvement_preview_items_demo_owner_empty check (not is_demo or user_id is null)
);

create table public.reflection_notes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.writing_reports(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  questions jsonb not null default '[]'::jsonb,
  note text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reflection_notes_report_unique unique (report_id),
  constraint reflection_notes_owner_required check (is_demo or user_id is not null),
  constraint reflection_notes_demo_owner_empty check (not is_demo or user_id is null)
);

create table public.drill_tasks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.writing_reports(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  title text not null,
  description text not null,
  focus_area text not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  status public.drill_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drill_tasks_owner_required check (is_demo or user_id is not null),
  constraint drill_tasks_demo_owner_empty check (not is_demo or user_id is null)
);

create index essays_user_id_created_at_idx on public.essays(user_id, created_at desc);
create index essays_is_demo_idx on public.essays(is_demo) where is_demo;
create index writing_reports_user_id_created_at_idx on public.writing_reports(user_id, created_at desc);
create index writing_reports_essay_id_idx on public.writing_reports(essay_id);
create index writing_reports_is_demo_idx on public.writing_reports(is_demo) where is_demo;
create index weakness_tags_report_id_idx on public.weakness_tags(report_id);
create index weakness_tags_user_id_idx on public.weakness_tags(user_id);
create index improvement_preview_items_report_order_idx
  on public.improvement_preview_items(report_id, sort_order);
create index reflection_notes_user_id_idx on public.reflection_notes(user_id);
create index drill_tasks_report_id_idx on public.drill_tasks(report_id);
create index drill_tasks_user_id_status_idx on public.drill_tasks(user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

create trigger set_essays_updated_at
  before update on public.essays
  for each row execute function public.set_updated_at();

create trigger set_writing_reports_updated_at
  before update on public.writing_reports
  for each row execute function public.set_updated_at();

create trigger set_reflection_notes_updated_at
  before update on public.reflection_notes
  for each row execute function public.set_updated_at();

create trigger set_drill_tasks_updated_at
  before update on public.drill_tasks
  for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.essays enable row level security;
alter table public.writing_reports enable row level security;
alter table public.weakness_tags enable row level security;
alter table public.improvement_preview_items enable row level security;
alter table public.reflection_notes enable row level security;
alter table public.drill_tasks enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.user_profiles to anon;
grant select on public.essays to anon;
grant select on public.writing_reports to anon;
grant select on public.weakness_tags to anon;
grant select on public.improvement_preview_items to anon;
grant select on public.reflection_notes to anon;
grant select on public.drill_tasks to anon;

grant select, insert, update, delete on public.user_profiles to authenticated;
grant select, insert, update, delete on public.essays to authenticated;
grant select, insert, update, delete on public.writing_reports to authenticated;
grant select, insert, update, delete on public.weakness_tags to authenticated;
grant select, insert, update, delete on public.improvement_preview_items to authenticated;
grant select, insert, update, delete on public.reflection_notes to authenticated;
grant select, insert, update, delete on public.drill_tasks to authenticated;

create policy "Demo profiles are publicly readable"
  on public.user_profiles
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own profile"
  on public.user_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own profile"
  on public.user_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Demo essays are publicly readable"
  on public.essays
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own essays"
  on public.essays
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own essays"
  on public.essays
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own essays"
  on public.essays
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own essays"
  on public.essays
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Demo reports are publicly readable"
  on public.writing_reports
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own reports"
  on public.writing_reports
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own reports"
  on public.writing_reports
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own reports"
  on public.writing_reports
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own reports"
  on public.writing_reports
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Demo weakness tags are publicly readable"
  on public.weakness_tags
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own weakness tags"
  on public.weakness_tags
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own weakness tags"
  on public.weakness_tags
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own weakness tags"
  on public.weakness_tags
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own weakness tags"
  on public.weakness_tags
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Demo preview items are publicly readable"
  on public.improvement_preview_items
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own preview items"
  on public.improvement_preview_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own preview items"
  on public.improvement_preview_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own preview items"
  on public.improvement_preview_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own preview items"
  on public.improvement_preview_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Demo reflections are publicly readable"
  on public.reflection_notes
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own reflections"
  on public.reflection_notes
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own reflections"
  on public.reflection_notes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own reflections"
  on public.reflection_notes
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own reflections"
  on public.reflection_notes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Demo drill tasks are publicly readable"
  on public.drill_tasks
  for select
  to anon, authenticated
  using (is_demo);

create policy "Users can read own drill tasks"
  on public.drill_tasks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own drill tasks"
  on public.drill_tasks
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can update own drill tasks"
  on public.drill_tasks
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and not is_demo);

create policy "Users can delete own drill tasks"
  on public.drill_tasks
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
