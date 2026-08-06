-- Our Memories V10.6.1 Cycle Record Hotfix
-- Supabase → SQL Editor → New query → 貼上整份並按 Run
-- 可重複執行。

create table if not exists public.period_cycles (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  start_date date not null,
  end_date date,
  note text,
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

alter table public.period_cycles enable row level security;

grant select, insert, update, delete
on table public.period_cycles
to anon, authenticated;

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

-- Existing completed history remains available in the new cycle table.
insert into public.period_cycles (
  space_id,
  start_date,
  end_date,
  note,
  created_at
)
select
  pr.space_id,
  pr.start_date,
  pr.end_date,
  coalesce(pr.note, '由 period_records 匯入'),
  coalesce(pr.created_at, now())
from public.period_records pr
where not exists (
  select 1
  from public.period_cycles pc
  where pc.space_id = pr.space_id
    and pc.start_date = pr.start_date
    and pc.end_date is not distinct from pr.end_date
);

-- Link daily records to a cycle when the column is available.
alter table public.period_daily_logs
  add column if not exists cycle_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'period_daily_logs_cycle_id_fkey'
  ) then
    alter table public.period_daily_logs
      add constraint period_daily_logs_cycle_id_fkey
      foreign key (cycle_id)
      references public.period_cycles(id)
      on delete set null;
  end if;
end $$;

create index if not exists period_daily_logs_cycle_idx
on public.period_daily_logs(cycle_id);

notify pgrst, 'reload schema';

-- Verification
select
  'period_cycles ready' as status,
  count(*) as imported_cycles
from public.period_cycles;
