# Our Memories V10.5.3.1 Cycle UI Fix

這版修正 V10.5.3 的兩個問題：

1. 新版 UI 寫入了不存在的 `#periodHero`，所以畫面仍停留在舊的「讀取中」區塊。
2. 新版程式呼叫了不存在的歷史資料函式，導致 `renderPeriod()` 中斷，避孕藥專區沒有渲染。

本版改回使用專案實際存在的：
- `#periodCard`
- `#cycleStatusPanel`
- `#periodTable`

並保留原本可正常運作的：
- 經期開始／結束
- 每日紀錄
- 補登過去經期
- 歷史資料
- Pill Engine
- 推播功能

## 更新方式
1. 將整包覆蓋目前 GitHub 專案。
2. Commit / Push。
3. 等 GitHub Pages 部署完成。
4. 強制重新整理。

不需要執行 SQL，也不需要重新部署 Edge Function。
