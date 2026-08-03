# Our Memories V10.4.1 Final

這是以 V10.4 Relationship Engine 完整專案為基礎製作的正式修正版。

## 已完成

- 全站顯示版本統一為 `V10.4.1`
- Service Worker、快取名稱與靜態檔案版本同步更新
- Manifest 名稱與啟動網址同步更新
- 首頁新增「交往里程碑」卡片
- 2026/01/09 計為交往第 1 天
- 每滿 100 天提醒：100、200、300、400……
- 重要節日提醒保留：
  - 1/9 交往週年
  - 1/21 懷寶生日
  - 2/14 西洋情人節
  - 3/14 白色情人節
  - 七夕
  - 10/11 小舜生日
  - 12/25 聖誕節
- 重要節日倒數：30、21、14、7、3、1、0 天
- 里程碑已整合進既有 `special_event` 模式，不需新增 Cron
- 保留獨立 `milestone` 模式供測試

## 部署網站

將本壓縮檔的全部內容覆蓋 GitHub Pages 專案，提交並等待 Pages 部署完成。

部署後若仍看到舊版：
1. 關閉網站分頁再重新開啟。
2. 強制重新整理。
3. 手機 PWA 可先完全關閉再開啟；必要時移除舊捷徑後重新加入。

## 部署 Supabase Edge Function

使用：

`supabase/functions/send-daily-reminders/index.ts`

覆蓋 Supabase 的 `send-daily-reminders`，再按 **Deploy updates**。

## Cron

沿用原本的重要節日排程，Request Body：

```json
{"mode":"special_event"}
```

不需要新增第二個 Cron。這個模式會同時檢查重要節日與 100 天里程碑。

## 測試里程碑

```json
{"mode":"milestone","force":true}
```

如果當天剛好是 100 的倍數，會顯示正式里程碑通知；其他日期則顯示測試資訊。

## 今日補發

若今天正好是第 200 天，部署完成後執行：

```json
{"mode":"milestone","force":true}
```

即可立即補發。
