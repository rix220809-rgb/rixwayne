# Our Memories V10.4 — Relationship Engine

## 功能一：每日必答 2.0

- 新增 120 題每日必答。
- 題庫依月份逐步開放：2026-07、08、09、10 各新增 30 題。
- 已經指派過的題目不會再次抽取。
- 最近 7 天不會連續出現相同分類。
- 題庫全部用完後，最近 180 天仍禁止重複。
- 每天抽到的題目會寫入 `daily_question_assignments`，換手機、重新整理或兩人同時開啟，都會看到同一題。
- 每月更新時，只要在 `data/daily_question_bank.json` 新增 30～35 題，並填入 `introduced_month`。

## 功能二：重要日期倒數提醒

包含：

- 1/9 交往週年
- 1/21 懷寶生日
- 2/14 西洋情人節
- 3/14 白色情人節
- 農曆七月初七（七夕，自動換算）
- 10/11 小舜生日
- 12/25 聖誕節

提醒節點：剩 30、21、14、7、3、1 天，以及當天。

首頁 Dashboard 會顯示下一個重要日子與剩餘天數。

## 安裝順序

1. Supabase SQL Editor 執行 `supabase_v10_4_relationship_engine.sql`。
2. Edge Functions → `send-daily-reminders` → Code。
3. 使用 `supabase/functions/send-daily-reminders/index.ts` 完整覆蓋並按 Deploy updates。
4. 將整包檔案完整覆蓋 GitHub repository。
5. 建立新的 Cron Job：
   - 名稱：`20:00-important-date-reminder`
   - Cron：`0 12 * * *`
   - Edge Function：`send-daily-reminders`
   - Method：POST
   - Body：`{"mode":"special_event"}`
   - Headers：與其他 Cron 相同，包含 `x-cron-secret` 和 `content-type: application/json`
   - Timeout：10000
6. `0 12 * * *` 使用 UTC，等於台灣每天 20:00。
7. 等 GitHub Pages 部署完成。手機若仍顯示舊版，清除 Safari 網站資料後重新加入主畫面。

## 測試重要日期通知

```json
{
  "mode": "special_event",
  "force": true
}
```

`force:true` 會立即發送目前最近的重要日子倒數，不必等到指定倒數天數。

## 測試每日必答

完成 SQL 更新後，網站第一次開啟會建立今天的固定指派題目。可在 SQL Editor 查看：

```sql
select *
from public.daily_question_assignments
order by question_date desc;
```
