# Our Memories V8.0

蕭小舜 ♡ 懷寶的互動式回憶網站。

## 內容

- 首頁、遊戲、心情、卡皮、小舜五個分頁
- 底部導覽列平均五等分
- 每日必答問題
- 卡皮餵食月份折疊
- 經期智慧預估與月份折疊
- 漂亮小舜隨機照片
- 經期警報照片牆與警語
- 69 張回憶照片
- Supabase 心情、卡皮、經期、每日必答同步
- `image-check.html` 圖片檢查頁

## 上傳新 Repository

1. 在 GitHub 建立新的空白 Repository，例如 `our-memories`。
2. 用 GitHub Desktop Clone 新 Repository。
3. 解壓縮這個專案包。
4. 把解壓縮後的所有內容放進 Clone 下來的專案資料夾。
5. GitHub Desktop 按 `Commit to main`。
6. 按 `Push origin`。
7. 到 Repository `Settings → Pages`，選擇 `Deploy from a branch`、`main`、`/(root)`。

## Supabase

請到 Supabase SQL Editor 執行：

`supabase_setup.sql`

## 圖片檢查

部署完成後開啟：

`https://你的帳號.github.io/你的專案名稱/image-check.html?v=8`

## 正確根目錄

```text
index.html
image-check.html
manifest.json
sw.js
supabase_setup.sql
css/
js/
data/
images/
Deploy V8.2.5

```
