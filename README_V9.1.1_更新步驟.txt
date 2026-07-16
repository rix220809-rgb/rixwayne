Our Memories V9.1.1 Hotfix

已修正
- 經期「儲存當天狀況」卡住／無法儲存
- app.js 誤貼在函式外的重複程式碼
- 最後一版 renderPeriod() 未綁定儲存按鈕
- 吃藥推播每支手機顯示兩次
- Service Worker 舊快取版本

請覆蓋
1. js/app.js
2. 專案根目錄 sw.js

index.html 版本參數請改為
- css/style.css?v=9.1.1
- js/app.js?v=9.1.1
- js/push-notifications.js?v=9.1.1

更新手機快取
1. Commit / Push 並等 GitHub Pages 完成部署。
2. 兩支手機刪除主畫面的 Our Memories。
3. iPhone：設定 → Safari → 進階 → 網站資料。
4. 刪除 rix220809-rgb.github.io 的網站資料。
5. Safari 重新開啟網站，再加入主畫面並開啟通知。
