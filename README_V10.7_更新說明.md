# Our Memories V10.7 — Memory Story Update

## 本版內容
- 延續 V10.6.1 的經期資料庫修正。
- 修正 Day 1 Popup 因資料未即時讀到而漏播的情況：若 Day 1 漏掉，Day 2 第一次開啟會補播一次。
- Today Brief 看過後不會當天重複。
- 新增 41 張本次照片並壓縮為 WebP。
- 相簿改為「故事相簿」：小標、故事、Tag、收藏、上一張／下一張。
- 相簿只保留：全部／回憶／小舜／卡皮／收藏。
- 卡皮頁增加 Kapi Diary 照片列。
- 小舜頁增加漂亮小舜與 #小舜食堂，使用 Tag 篩選，不再增加更多主專區。
- 首頁 Flashback 會優先顯示照片的小標與故事。
- 舊照片也會自動套用小標／故事 fallback，不再只顯示拍攝技術資訊。

## 不需要 SQL
V10.7 沿用 V10.6.1 已建立的資料表，不需新增 migration。

## 更新
1. 將本壓縮檔完整覆蓋目前 GitHub 專案（保留 `.git`）。
2. Commit：`V10.7 Memory Story Update`
3. Push origin。
4. 等 GitHub Pages 完成後強制重新整理／完全關閉 PWA 再開。

## 測試 Popup
若要重新測試今天的 Today Brief：
```js
resetTodayBriefForTesting();
showTodayBrief({force:true});
```
