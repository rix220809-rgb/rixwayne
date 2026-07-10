-- Our Memories v6.3 Supabase setup / 權限修正版
-- 到 Supabase → SQL Editor 執行整段即可。可重複執行。

create table if not exists public.kapi_feed_records (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  feed_date date not null,
  status text not null check (status in ('fed', 'refused')),
  food text,
  amount text,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.period_records (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.mood_posts (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  author text not null,
  mood text not null,
  message text not null,
  mood_date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists public.mood_replies (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  post_id uuid references public.mood_posts(id) on delete cascade,
  author text not null,
  message text not null,
  created_at timestamptz default now()
);

grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.kapi_feed_records to anon, authenticated;
grant select, insert, update, delete on public.period_records to anon, authenticated;
grant select, insert, update, delete on public.mood_posts to anon, authenticated;
grant select, insert, update, delete on public.mood_replies to anon, authenticated;

alter table public.kapi_feed_records enable row level security;
alter table public.period_records enable row level security;
alter table public.mood_posts enable row level security;
alter table public.mood_replies enable row level security;

drop policy if exists "om read kapi" on public.kapi_feed_records;
drop policy if exists "om insert kapi" on public.kapi_feed_records;
drop policy if exists "om delete kapi" on public.kapi_feed_records;
drop policy if exists "allow all kapi" on public.kapi_feed_records;
create policy "allow all kapi" on public.kapi_feed_records for all to anon, authenticated using (true) with check (true);

drop policy if exists "om read period" on public.period_records;
drop policy if exists "om insert period" on public.period_records;
drop policy if exists "om delete period" on public.period_records;
drop policy if exists "allow all period" on public.period_records;
create policy "allow all period" on public.period_records for all to anon, authenticated using (true) with check (true);

drop policy if exists "om read mood posts" on public.mood_posts;
drop policy if exists "om insert mood posts" on public.mood_posts;
drop policy if exists "om delete mood posts" on public.mood_posts;
drop policy if exists "allow all mood posts" on public.mood_posts;
create policy "allow all mood posts" on public.mood_posts for all to anon, authenticated using (true) with check (true);

drop policy if exists "om read mood replies" on public.mood_replies;
drop policy if exists "om insert mood replies" on public.mood_replies;
drop policy if exists "om delete mood replies" on public.mood_replies;
drop policy if exists "allow all mood replies" on public.mood_replies;
create policy "allow all mood replies" on public.mood_replies for all to anon, authenticated using (true) with check (true);


-- v6.8：清除 period_records 重複資料，同一 space_id + start_date + end_date 只保留一筆
delete from public.period_records a
using public.period_records b
where a.id > b.id
  and a.space_id = b.space_id
  and a.start_date = b.start_date
  and a.end_date = b.end_date;

-- v6.8：避免之後同一段經期重複新增
create unique index if not exists period_records_unique_range
on public.period_records (space_id, start_date, end_date);



-- Our Memories v7.4 additions

create table if not exists public.daily_couple_answers (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  question_date date not null,
  question text not null,
  category text,
  author text not null,
  self_answer text not null,
  guess_partner_answer text,
  created_at timestamptz default now()
);

create table if not exists public.period_daily_logs (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  log_date date not null,
  has_period boolean default true,
  flow text,
  pain integer,
  mood text,
  symptoms text,
  note text,
  created_at timestamptz default now()
);

alter table public.daily_couple_answers enable row level security;
alter table public.period_daily_logs enable row level security;

drop policy if exists "daily_couple_answers_select" on public.daily_couple_answers;
drop policy if exists "daily_couple_answers_insert" on public.daily_couple_answers;
drop policy if exists "daily_couple_answers_delete" on public.daily_couple_answers;
drop policy if exists "period_daily_logs_select" on public.period_daily_logs;
drop policy if exists "period_daily_logs_insert" on public.period_daily_logs;
drop policy if exists "period_daily_logs_delete" on public.period_daily_logs;

create policy "daily_couple_answers_select"
on public.daily_couple_answers for select
to anon
using (space_id = 'shun-wayne-kapi-period');

create policy "daily_couple_answers_insert"
on public.daily_couple_answers for insert
to anon
with check (space_id = 'shun-wayne-kapi-period');

create policy "daily_couple_answers_delete"
on public.daily_couple_answers for delete
to anon
using (space_id = 'shun-wayne-kapi-period');

create policy "period_daily_logs_select"
on public.period_daily_logs for select
to anon
using (space_id = 'shun-wayne-kapi-period');

create policy "period_daily_logs_insert"
on public.period_daily_logs for insert
to anon
with check (space_id = 'shun-wayne-kapi-period');

create policy "period_daily_logs_delete"
on public.period_daily_logs for delete
to anon
using (space_id = 'shun-wayne-kapi-period');
