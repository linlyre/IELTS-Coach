alter table public.essays
add column if not exists topic_type text not null default 'Task 2 写作练习';
