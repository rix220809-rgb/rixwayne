
-- Our Memories v8.2.5 push subscriptions

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  space_id text not null default 'shun-wayne-kapi-period',
  owner text not null,
  fcm_token text not null unique,
  platform text,
  enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.push_subscriptions
  add column if not exists space_id text default 'shun-wayne-kapi-period',
  add column if not exists owner text,
  add column if not exists fcm_token text,
  add column if not exists platform text,
  add column if not exists enabled boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists push_subscriptions_fcm_token_key
on public.push_subscriptions(fcm_token);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
on table public.push_subscriptions
to anon, authenticated;

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select" on public.push_subscriptions;
drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
drop policy if exists "push_subscriptions_update" on public.push_subscriptions;
drop policy if exists "push_subscriptions_delete" on public.push_subscriptions;

create policy "push_subscriptions_select"
on public.push_subscriptions for select
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

create policy "push_subscriptions_insert"
on public.push_subscriptions for insert
to anon, authenticated
with check (space_id = 'shun-wayne-kapi-period');

create policy "push_subscriptions_update"
on public.push_subscriptions for update
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period')
with check (space_id = 'shun-wayne-kapi-period');

create policy "push_subscriptions_delete"
on public.push_subscriptions for delete
to anon, authenticated
using (space_id = 'shun-wayne-kapi-period');

notify pgrst, 'reload schema';
