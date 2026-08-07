# Our Memories V10.7.1 — Photo System Refactor

## 這版已處理

### 經期紀錄
- 每日經期狀況改為 `upsert`。
- 衝突鍵固定使用 `space_id,log_date`，與目前 Supabase 已建立的 UNIQUE constraint 一致。
- 同一天重新儲存會更新該天，不會再新增重複資料。

### 首頁
- 保留原本所有生活功能：經期預估、避孕藥、卡皮、遊戲、留言等。
- 今日回憶仍然只顯示 1 張，不增加照片牆。
- 增加「查看其他回憶」入口，進入小舜×懷寶回憶頁。

### 照片
- 小舜×懷寶：專區左右滑。
- Pretty 舜：小舜頁左右滑。
- 小舜食堂：小舜頁左右滑。
- Kapi Diary：卡皮頁左右滑。
- 點照片仍可閱讀完整故事、Tag、收藏與上一張／下一張。
- `photos.json` 是主要資料來源，舊 JS 圖片陣列只保留 fallback，不再與新資料合併造成重複。

### 卡皮重複
- 移除「終於團聚了！」新增重複項目。
- 既有的「卡皮登場」照片保留，因此同一張照片只會出現一次。

### 小舜食堂
- 重新逐張核對本次 10 張照片。
- 修正菜名與照片不符的問題。
- 不確定細節的照片採較保守的名稱，不硬猜食材。

## 更新方式
1. 完整覆蓋目前 GitHub 專案（保留 `.git`）。
2. Commit：`V10.7.1 Photo System Refactor`
3. Push origin。
4. GitHub Pages 更新完成後，iPhone/PWA 請完全關閉再開；若仍看到舊版，清除網站快取後再開。

## 本版不需要再執行 SQL
你已經在 Supabase 建立 `period_daily_logs(space_id, log_date)` UNIQUE constraint，因此這個壓縮檔只需要更新網站程式。
