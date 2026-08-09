-- Our Memories V10.7.3 notification schedule
-- Supabase Cron 使用 UTC。請先把 YOUR_CRON_SECRET 換成 Edge Function 目前的 CRON_SECRET。
-- 如果 Dashboard 已有同時間舊排程，可先停用舊排程，避免重複呼叫（通知紀錄仍會防重複）。

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('our-memories-period-1100', '0 3 * * *', $$
  select net.http_post(
    url := 'https://hcrrqcqmhszllrnaqzin.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object('content-type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{"mode":"period"}'::jsonb
  );
$$);

select cron.schedule('our-memories-special-1900', '0 11 * * *', $$
  select net.http_post(
    url := 'https://hcrrqcqmhszllrnaqzin.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object('content-type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{"mode":"special_event"}'::jsonb
  );
$$);

select cron.schedule('our-memories-question-2030', '30 12 * * *', $$
  select net.http_post(
    url := 'https://hcrrqcqmhszllrnaqzin.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object('content-type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{"mode":"daily_question","round":"first"}'::jsonb
  );
$$);

select cron.schedule('our-memories-pill-2100', '0 13 * * *', $$
  select net.http_post(
    url := 'https://hcrrqcqmhszllrnaqzin.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object('content-type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{"mode":"pill"}'::jsonb
  );
$$);

select cron.schedule('our-memories-question-2230', '30 14 * * *', $$
  select net.http_post(
    url := 'https://hcrrqcqmhszllrnaqzin.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object('content-type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{"mode":"daily_question","round":"second"}'::jsonb
  );
$$);
