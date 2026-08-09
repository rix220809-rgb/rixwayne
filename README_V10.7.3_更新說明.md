# Our Memories V10.7.3 — Notification + Pill + Story Fix

## 這版修正

### 1. 每日遊戲通知
- 20:30 與 22:30 改為不同 notification type。
- 22:30 會重新檢查當天回答狀態；已回答者不通知，未回答者才收到第二次提醒。
- 即使兩個 Cron 都使用 `mode: daily_question`，Edge Function 也會依台灣時間判斷 first / second；建議排程仍明確帶 `round`。

### 2. 經期通知
- 保留 11:00 經期通知邏輯：預估前 3/2/1 天，以及 active cycle Day 1～4。
- ZIP 無法直接修改線上的 Supabase Cron；請在 Supabase 確認 11:00 排程存在。
- 本包附 `V10.7.3_notification_schedule.sql`，可用來重建 5 個通知排程。執行前把 `YOUR_CRON_SECRET` 換成目前 Edge Function 的 CRON_SECRET。

### 3. 避孕藥下一輪
- 已完成上一輪、且新經期已開始時，不再永遠停在舊的 07/06。
- 經期 Day 1～3：顯示下一輪等待中。
- 經期 Day 4：顯示「明天開始新一輪」與預計日期。
- 經期 Day 5：自動建立新的 `pill_cycles` 起始日，並從當晚 21:00 開始 Day 1/28 推播。
- Edge Function 也會做相同補建，因此即使當天沒有打開網站，21:00 排程仍可自動建立新一輪。
- 手動修改實際開始日仍保留，手動資料優先。

### 4. 照片故事三層內容
- 修正 title / subtitle / story 三欄重複同一句的問題。
- 原本使用者補充文字保存於 `originalCaption`。
- 標題改為短標；小標提供情境；故事以原始補充為核心再延伸。
- 另加 UI 防呆：若資料未來又出現完全相同內容，不會在 Modal 連續顯示三次同一句。

## 部署
1. GitHub Pages：完整覆蓋本 ZIP 內容並 Push。
2. Supabase Edge Function：用 `supabase/functions/send-daily-reminders/index.ts` 覆蓋後 Deploy updates。
3. Supabase Cron：確認 11:00 period、19:00 special_event、20:30 daily_question first、21:00 pill、22:30 daily_question second。

## 目前 2026/08/09 預期畫面
如果 active period 是 2026/08/06 開始，今天是 Day 4：
- 避孕藥卡片顯示「下一輪準備中」
- 主狀態顯示「明天開始新一輪」
- 預計開始日 08/10
- 08/10 Day 5 自動建立新 pill cycle 並開始 21:00 提醒。
