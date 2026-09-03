# Our Memories V10.7.6 — Period Backdate Fix

## 經期登記更新
- 「今天開始經期」改為「登記經期開始日」。
- 可快速選「昨天 / 今天」，也可用日期選擇器回溯補登。
- 最多回溯 14 天，不能選未來日期。
- 若目前已有進行中的經期，按鈕改為「修改開始日期」，可修正忘記登記或登錯日期。
- 修改後 Day 幾、首頁經期狀態、下次預估會立即依真正的開始日重新計算。
- 若本輪避孕藥是「經期 Day 5 自動建立」，修改經期 Day 1 時會同步調整自動建立的 pill cycle；手動設定的 pill cycle 不會被覆蓋。
- 若已有每日狀況紀錄，不允許把開始日改到最早紀錄之後，避免資料矛盾。

## Supabase
這版不需要新增資料表或執行 migration SQL。
`period_cycles.start_date` 原本就支援指定日期，因此只需更新 GitHub Pages 前端。

## Edge Function / Cron
- 21 天避孕藥 Edge Function 與 Cron 邏輯沒有變更。
- 如果 V10.7.5 的 21 天版 `send-daily-reminders` 已部署成功，本版不需要重新 Deploy Edge Function。
- Cron 不需要重建。

## 更新方式
完整覆蓋 GitHub Pages 專案後 Commit / Push。
建議 Commit：`V10.7.6 Period Backdate Fix`
