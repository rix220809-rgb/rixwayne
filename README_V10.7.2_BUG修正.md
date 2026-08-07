# Our Memories V10.7.2 — Pretty / 回顧按鈕 Bugfix

## 修正內容
- 重新逐張核對本次新增的 10 張 Pretty 舜照片，修正照片與標題／描述／故事錯配。
- 修正首頁「查看其他回憶」按鈕無反應：原本誤呼叫不存在的 `showPage()`，改為現有的 `showTab('album')`。
- 在 `setupTabs()` 再綁一次按鈕事件，避免資料載入時序造成事件遺失。
- 其餘 V10.7.1 功能不變：經期紀錄、Popup、卡皮去重、小舜食堂、左右滑相簿皆保留。

## 更新方式
完整覆蓋 GitHub 專案後 Commit / Push。建議 Commit：`V10.7.2 Pretty Memory Bugfix`。
