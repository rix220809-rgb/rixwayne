# Our Memories V10.4.1 Milestone Hotfix

## 新增功能
- 交往起始日：2026/01/09，當天計為第 1 天。
- 每滿 100 天推播一次：100、200、300、400……。
- 首頁 Dashboard 顯示目前第幾天與下一個 100 天里程碑。
- 里程碑提醒已整合進 `special_event` 模式，不需要新增 Cron。
- 也保留獨立測試模式：`milestone`。

## 安裝方式
1. 用壓縮檔完整覆蓋 GitHub 專案。
2. Supabase → Edge Functions → `send-daily-reminders`。
3. 用 `supabase/functions/send-daily-reminders/index.ts` 覆蓋原程式。
4. Deploy updates。

## 測試
今天若剛好是 100 的倍數：

```json
{"mode":"milestone"}
```

測試里程碑模式：

```json
{"mode":"milestone","force":true}
```

注意：`force:true` 只用於測試；正式通知仍只會在當天剛好為 100、200、300……天時送出。

## Cron
沿用既有的重要日期 Cron：

```json
{"mode":"special_event"}
```

不需新增另一個排程。
