# Our Memories V10.6.1｜Cycle Record Hotfix

## 問題原因

網站的 Cycle Engine 需要 `public.period_cycles` 來保存「尚未結束」的經期，
但目前 Supabase 只有 `period_records`。`period_records.end_date` 不允許空值，
因此它只能保存已完成的歷史紀錄，不能直接取代進行中的週期。

## 必做步驟

### 1. 先執行 SQL

Supabase → SQL Editor → New query

執行：

`V10.6.1_cycle_record_hotfix.sql`

看到 `period_cycles ready` 即表示完成。

### 2. 更新網站

將本壓縮檔完整覆蓋 GitHub 專案後 Commit / Push。

### 3. 清除舊快取

GitHub Pages 部署完成後：

- 瀏覽器強制重新整理。
- 手機 PWA 完全關閉再打開。
- 頁面版本應顯示 V10.6.1。

## 本版修正

- 建立正式的 `period_cycles` 資料表。
- 保留 `period_records` 作為已完成的經期歷史。
- 開始經期時寫入 `period_cycles`。
- 結束經期時同步更新 `period_cycles`，並寫入 `period_records`。
- 舊歷史資料會自動匯入 `period_cycles`。
- `period_daily_logs` 缺少 `cycle_id` 時自動相容。
- SQL 尚未執行時，開始經期仍可暫存在目前裝置，不會直接失敗。
- 修正 Pill Engine 儲存時重複 `.select()` 的程式瑕疵。

## 測試

1. 按「今天開始經期」。
2. 頁面應顯示「進行中 / Day 1」。
3. SQL Editor 查詢：

```sql
select *
from public.period_cycles
order by start_date desc;
```

應看到一筆 `end_date = null` 的資料。
