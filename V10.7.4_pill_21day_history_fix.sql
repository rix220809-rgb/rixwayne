-- Our Memories V10.7.4
-- 可選：修正舊版 28 天假設留下的 2026/07/06 歷史 pill cycle。
-- 21 天週期下，若 2026/08/02 是 Day 21，Day 1 = 2026/07/13。

delete from public.pill_cycles
where space_id = 'shun-wayne-kapi-period'
  and start_date = '2026-07-06';

insert into public.pill_cycles (space_id, start_date, note)
values (
  'shun-wayne-kapi-period',
  '2026-07-13',
  'V10.7.4 更正：21 天服藥週期；2026/08/02 為 Day 21'
)
on conflict (space_id, start_date)
do update set
  note = excluded.note,
  updated_at = now();
