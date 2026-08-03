# Our Memories V10.5.2｜Pill Engine Hotfix

## 修正內容

避孕藥提醒不再直接用「最近經期開始日 + 4 天」永久推算。

現在優先使用 `pill_cycles.start_date`，也就是你實際開始吃這一輪藥的日期：

- Day 1～28：顯示並於 21:00 提醒。
- 第 28 天後：顯示本輪完成，不再繼續提醒。
- 下一輪開始時：在網站「小舜」頁輸入新的實際服藥 Day 1。
- 經期長短、經期結束日、預估下次經期都不會改動避孕藥天數。
- 尚未建立 `pill_cycles` 資料時，才暫時相容舊制（經期 Day 5 起算）。

依你提供的紀錄：
- 2026/08/02 = 第 28 天
- 因此這輪 Day 1 = 2026/07/06
- SQL 已包含這筆補登。

## 更新順序

### 1. 執行 SQL

Supabase → SQL Editor

執行：

`V10.5.2_pill_cycles.sql`

成功後會建立 `pill_cycles`，並補登 2026/07/06。

### 2. 更新網站

將壓縮檔內容完整覆蓋 GitHub Pages 專案，再 Commit / Push。

網站更新後，在「小舜」頁的避孕藥卡片下方會看到：

- 本輪實際服藥 Day 1
- 日期輸入欄
- 儲存按鈕

以後每次開始新的一輪，只要輸入實際開始吃藥的日期。

### 3. 更新 Edge Function

Supabase → Edge Functions → send-daily-reminders → Code

用：

`supabase/functions/send-daily-reminders/index.ts`

完整覆蓋，然後按 `Deploy updates`。

### 4. 測試

Request Body：

```json
{
  "mode": "pill",
  "force": true
}
```

在 2026/08/03 測試時，因為 2026/08/02 已是第 28 天，正常結果應為：

- `pillStartDate: "2026-07-06"`
- `pillDay: 29`
- `sent: 0`
- 原因：本輪 28 天已完成

這是正確結果，不應再顯示第 22 天。
