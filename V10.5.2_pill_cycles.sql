-- Our Memories V10.5.2 Pill Engine
-- 在 Supabase SQL Editor 執行一次。

create table if not exists public.pill_cycles (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  start_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(space_id, start_date)
);

alter table public.pill_cycles enable row level security;

grant select, insert, update, delete
on table public.pill_cycles
to anon, authenticated;

drop policy if exists "pill_cycles_select" on public.pill_cycles;
drop policy if exists "pill_cycles_insert" on public.pill_cycles;
drop policy if exists "pill_cycles_update" on public.pill_cycles;
drop policy if exists "pill_cycles_delete" on public.pill_cycles;

create policy "pill_cycles_select"
on public.pill_cycles for select
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

create policy "pill_cycles_insert"
on public.pill_cycles for insert
to anon, authenticated
with check (space_id = 'shun-wayne-kapi-period');

create policy "pill_cycles_update"
on public.pill_cycles for update
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period')
with check (space_id = 'shun-wayne-kapi-period');

create policy "pill_cycles_delete"
on public.pill_cycles for delete
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

-- 依你的實際紀錄：2026/08/02 是第 28 天，因此本輪 Day 1 是 2026/07/06。
insert into public.pill_cycles (space_id, start_date, note)
values (
  'shun-wayne-kapi-period',
  '2026-07-06',
  '依實際服藥紀錄補登：2026/08/02 為第 28 天'
)
on conflict (space_id, start_date)
do update set
  note = excluded.note,
  updated_at = now();

notify pgrst, 'reload schema';
