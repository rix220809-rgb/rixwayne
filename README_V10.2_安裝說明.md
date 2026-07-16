# Our Memories V10.2 — Cycle Engine + Dashboard

這個完整包同時完成：

## V10.1 Cycle Engine
- 新增 `period_cycles`：每次經期只有一個開始日與結束日。
- 每日狀況只會附加到目前進行中的週期，不會把 Day 8 重設成 Day 1。
- 「今天開始經期」：建立新週期。
- 「今天經期結束」：關閉目前週期。
- 尚未結束時不顯示下一次經期。
- Day 1～4 發送小舜警報；Day 5 起進入最多 28 天避孕藥提醒。
- Edge Function 已改用 `period_cycles` 判斷。

## V10.2 Dashboard
首頁新增六張狀態卡：
- 在一起天數
- 本次經期 Day
- 避孕藥提醒狀態
- 雙方每日必答完成度
- 卡皮餵食區間
- 照片總數

## 安裝順序
1. Supabase SQL Editor 執行 `supabase_v10_1_cycle_engine.sql`。
2. Edge Functions → `send-daily-reminders` → Code，使用：
   `supabase/functions/send-daily-reminders/index.ts`
   覆蓋並 Deploy updates。
3. 將本 ZIP 內所有檔案完整覆蓋 GitHub repository 根目錄。
4. Commit / Push，等待 GitHub Pages 部署完成。
5. 兩支 iPhone 刪除舊主畫面 App、清除 Safari 網站資料，再重新加入主畫面及開啟通知。

## 現有進行中的經期
部署後第一次請：
1. 到小舜頁把日期設成這次真正開始日。
2. 按「今天開始經期」。
3. 今天是第 8 天時，系統就會顯示 Day 8。
4. 經期真的結束時，再把日期設為結束日並按「今天經期結束」。

實際服藥方式仍以醫師指示與藥袋標示為準。
