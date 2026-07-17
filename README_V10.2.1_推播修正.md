# V10.2.1 Firebase Push 修正版

問題原因：
上一個 V10.2 完整包的 index.html 有載入 `js/push-notifications.js`，
但壓縮包內實際漏放了這個檔案，因此按「開啟手機通知」時會顯示：
「Firebase 推播模組尚未載入」。

本版已補上：
- js/push-notifications.js
- Firebase Messaging 初始化
- VAPID Token 取得
- 裝置 Token 寫入 Supabase push_subscriptions
- 蕭小舜／懷寶裝置身分選擇
- Service Worker 與快取版本更新為 V10.2.1

安裝：
1. 完整覆蓋 GitHub repository。
2. 等 GitHub Pages 部署完成。
3. iPhone 刪除舊主畫面 App。
4. 設定 → Safari → 進階 → 網站資料 → 刪除 rix220809-rgb.github.io。
5. Safari 開啟網站並重新加入主畫面。
6. 從主畫面開啟 Our Memories。
7. 按「開啟手機通知」，選擇這支手機屬於蕭小舜或懷寶。

若選錯身分，可在 Safari Console 執行：
resetPushOwner()
再重新按通知按鈕。
