# V10.3.2 Notification Hotfix

修正：
- `period_cycles` 不存在時，自動改讀 `period_records`。
- 20:30 每日必答完全不再依賴經期資料，因此不會再被經期資料表錯誤拖垮。
- 21:00 避孕藥提醒維持 Day 1～4 暫停、Day 5 起第 1/28 天。

必做：
Supabase → Edge Functions → send-daily-reminders → Code
用 `supabase/functions/send-daily-reminders/index.ts` 覆蓋後按 Deploy updates。

測試：
- daily_question 成功時 `cycleSource` 應為 `not-needed`
- pill 成功且沒有 period_cycles 時，`cycleSource` 應為 `period_records`
