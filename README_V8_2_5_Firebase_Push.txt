Our Memories V8.2.5 Push Ready

完成：
- Firebase Web App 設定與 VAPID 公開金鑰已整合
- 新增 js/push-notifications.js
- sw.js 改為可長期接收 FCM 背景訊息
- 新增 PWA 192/512 圖示
- 新增 push_subscriptions Supabase SQL
- 小舜頁「開啟手機通知」會註冊 FCM Token 並存到 Supabase

先做：
1. 到 Supabase SQL Editor 執行 supabase_push_subscriptions.sql。
2. 上傳整包到 GitHub Pages。
3. iPhone 用 Safari 打開網站並加入主畫面。
4. 從主畫面打開，進小舜頁按「開啟手機通知」。
5. 選擇允許，並輸入這支手機是蕭小舜或懷寶。

注意：
這一版完成「手機訂閱與接收推播」。
要在網站完全關閉時每天自動發送經期提醒，仍需部署 Supabase Edge Function / Cron，並把 Firebase Admin 憑證放在後端 Secrets，不能放進 GitHub。
