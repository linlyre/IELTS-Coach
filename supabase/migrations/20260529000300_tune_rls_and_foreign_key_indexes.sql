create index essays_profile_id_idx on public.essays(profile_id);
create index improvement_preview_items_user_id_idx
  on public.improvement_preview_items(user_id);

drop policy "Demo profiles are publicly readable" on public.user_profiles;
drop policy "Users can read own profile" on public.user_profiles;
create policy "Demo profiles are publicly readable"
  on public.user_profiles
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo profiles"
  on public.user_profiles
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);

drop policy "Demo essays are publicly readable" on public.essays;
drop policy "Users can read own essays" on public.essays;
create policy "Demo essays are publicly readable"
  on public.essays
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo essays"
  on public.essays
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);

drop policy "Demo reports are publicly readable" on public.writing_reports;
drop policy "Users can read own reports" on public.writing_reports;
create policy "Demo reports are publicly readable"
  on public.writing_reports
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo reports"
  on public.writing_reports
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);

drop policy "Demo weakness tags are publicly readable" on public.weakness_tags;
drop policy "Users can read own weakness tags" on public.weakness_tags;
create policy "Demo weakness tags are publicly readable"
  on public.weakness_tags
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo weakness tags"
  on public.weakness_tags
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);

drop policy "Demo preview items are publicly readable" on public.improvement_preview_items;
drop policy "Users can read own preview items" on public.improvement_preview_items;
create policy "Demo preview items are publicly readable"
  on public.improvement_preview_items
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo preview items"
  on public.improvement_preview_items
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);

drop policy "Demo reflections are publicly readable" on public.reflection_notes;
drop policy "Users can read own reflections" on public.reflection_notes;
create policy "Demo reflections are publicly readable"
  on public.reflection_notes
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo reflections"
  on public.reflection_notes
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);

drop policy "Demo drill tasks are publicly readable" on public.drill_tasks;
drop policy "Users can read own drill tasks" on public.drill_tasks;
create policy "Demo drill tasks are publicly readable"
  on public.drill_tasks
  for select
  to anon
  using (is_demo);
create policy "Authenticated users can read own or demo drill tasks"
  on public.drill_tasks
  for select
  to authenticated
  using (is_demo or (select auth.uid()) = user_id);
