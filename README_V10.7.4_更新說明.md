# Our Memories V10.7.4 — 21-Day Pill + Photo Update

## 避孕藥週期更正
- 服藥天數由 28 天更正為 **21 天**。
- 前端卡片改為 Day 1/21 ～ Day 21/21。
- Day 21 顯示「今天最後一天」。
- Day 22 起不再發 21:00 避孕藥提醒，畫面顯示本輪完成並等待下一輪。
- Edge Function `send-daily-reminders` 同步只在 Day 1～21 發送避孕藥 Push。
- 目前仍維持「經期 Day 5 = 下一輪 Day 1」的既有設定；實際開始日仍可手動修改。

### 歷史資料更正
舊版曾把 2026/08/02 當成第 28 天，因此把上一輪 Day 1 推成 2026/07/06。
改為 21 天後，2026/08/02 若為最後一顆（Day 21），Day 1 應為 2026/07/13。
包內附 `V10.7.4_pill_21day_history_fix.sql`，可選擇執行來修正這筆舊的歷史週期；不影響目前 2026/08/10 開始的新一輪。

## 新照片
新增 5 張：
- 4 張加入「小舜 × 懷寶回憶」
- 1 張加入「Kapi Diary」
- 每張均使用不同的標題／小標／故事，不再重複同一句。

## 部署
1. GitHub Pages 完整覆蓋此版本。
2. **重新 Deploy** `supabase/functions/send-daily-reminders/index.ts`，21 天推播限制才會在線上生效。
3. 若要修正舊的 7 月 pill cycle，再執行 `V10.7.4_pill_21day_history_fix.sql`。
