-- Our Memories V10.4 Relationship Engine
-- Run once in Supabase SQL Editor.

create table if not exists public.daily_question_assignments (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  question_date date not null,
  question_id text not null,
  question text not null,
  category text not null,
  month_key text,
  created_at timestamptz not null default now(),
  unique(space_id, question_date)
);

create index if not exists daily_question_assignments_question_idx
on public.daily_question_assignments(space_id, question_id);

alter table public.daily_couple_answers
  add column if not exists question_id text;

grant select, insert, update, delete
on table public.daily_question_assignments
to anon, authenticated;

alter table public.daily_question_assignments enable row level security;

drop policy if exists "daily_question_assignments_select" on public.daily_question_assignments;
drop policy if exists "daily_question_assignments_insert" on public.daily_question_assignments;
drop policy if exists "daily_question_assignments_update" on public.daily_question_assignments;
drop policy if exists "daily_question_assignments_delete" on public.daily_question_assignments;

create policy "daily_question_assignments_select"
on public.daily_question_assignments for select
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

create policy "daily_question_assignments_insert"
on public.daily_question_assignments for insert
to anon, authenticated
with check (space_id = 'shun-wayne-kapi-period');

create policy "daily_question_assignments_update"
on public.daily_question_assignments for update
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period')
with check (space_id = 'shun-wayne-kapi-period');

create policy "daily_question_assignments_delete"
on public.daily_question_assignments for delete
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

notify pgrst, 'reload schema';
