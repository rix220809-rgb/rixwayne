# Our Memories V10.0 完整包

本包以你上傳的最新 GitHub 專案為基礎，已完整保留原有資料、圖片、Supabase 與 Firebase 設定。

## 本次完成
- 修正經期「儲存當天狀況」卡住／無法儲存。
- 修正 Service Worker 重複顯示 Firebase 通知，避免吃藥提醒跳兩次。
- 快取與版本統一更新為 V10.0.0。
- 新增 photo0070～photo0073：
  - 談和解之日
  - 卡皮跟爸爸一起看手機
  - 卡皮看世足
  - 和解之日之合照
- `data/photos.json` 已直接合併為 73 張，不用再手動貼 JSON。

## 上傳方式
將 ZIP 解壓後的所有內容完整覆蓋到 GitHub repository 根目錄，再 Commit / Push。

## 手機更新
1. 等 GitHub Pages 部署完成。
2. 兩支 iPhone 刪除主畫面舊版 Our Memories。
3. 設定 → Safari → 進階 → 網站資料。
4. 刪除 `rix220809-rgb.github.io`。
5. Safari 重新開啟網站、加入主畫面、重新允許通知。

## 注意
此版本是「最新專案的完整整合與除錯包」，不是從零改寫所有程式架構，因此完整保留你目前可用的功能與資料。
