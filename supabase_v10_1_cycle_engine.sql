
-- Our Memories V10.1 Cycle Engine migration
-- Run once in Supabase SQL Editor.

create table if not exists public.period_cycles (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  start_date date not null,
  end_date date,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint period_cycles_valid_dates
    check (end_date is null or end_date >= start_date)
);

create unique index if not exists period_cycles_one_open_cycle_per_space
on public.period_cycles(space_id)
where end_date is null;

create index if not exists period_cycles_space_start_idx
on public.period_cycles(space_id, start_date desc);

alter table public.period_daily_logs
  add column if not exists cycle_id uuid references public.period_cycles(id) on delete set null;

create unique index if not exists period_daily_logs_space_date_unique
on public.period_daily_logs(space_id, log_date);

grant select, insert, update, delete
on table public.period_cycles
to anon, authenticated;

alter table public.period_cycles enable row level security;

drop policy if exists "period_cycles_select" on public.period_cycles;
drop policy if exists "period_cycles_insert" on public.period_cycles;
drop policy if exists "period_cycles_update" on public.period_cycles;
drop policy if exists "period_cycles_delete" on public.period_cycles;

create policy "period_cycles_select"
on public.period_cycles for select
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

create policy "period_cycles_insert"
on public.period_cycles for insert
to anon, authenticated
with check (space_id = 'shun-wayne-kapi-period');

create policy "period_cycles_update"
on public.period_cycles for update
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period')
with check (space_id = 'shun-wayne-kapi-period');

create policy "period_cycles_delete"
on public.period_cycles for delete
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

-- Import completed historical ranges without duplicating them.
insert into public.period_cycles (space_id, start_date, end_date, note)
select
  pr.space_id,
  pr.start_date,
  pr.end_date,
  coalesce(pr.note, '由 period_records 匯入')
from public.period_records pr
where pr.space_id = 'shun-wayne-kapi-period'
  and pr.end_date is not null
  and not exists (
    select 1
    from public.period_cycles pc
    where pc.space_id = pr.space_id
      and pc.start_date = pr.start_date
      and pc.end_date = pr.end_date
  );

notify pgrst, 'reload schema';
