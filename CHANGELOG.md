# Changelog

## V10.7.6
- 經期 Day 1 支援昨天 / 今天 / 自訂日期回溯登記。
- active period 可修改開始日期。
- 修改經期開始日會重新計算 Day 與預估。
- 僅同步「由經期 Day 5 自動建立」的避孕藥週期，保護手動設定的 pill cycle。
- 新增日期範圍與既有 daily log 衝突防呆。


## V10.7.5
- 更新 M048、M049、M051 的標題、小標與故事。
- 保留使用者原始補充文案於 `originalCaption`。
- V10.7.4 的 21 天避孕藥週期與通知邏輯不變。
- 更新 PWA cache/version 至 10.7.5，避免照片文案仍顯示舊快取。


## V10.7.4
- Correct pill reminder duration from 28 days to 21 days across UI and Edge Function.
- Stop pill push reminders after Day 21.
- Add five new memory/Kapi photos with distinct title, subtitle, and story copy.
- Add optional SQL to correct the historical July pill-cycle start from 2026-07-06 to 2026-07-13 under the 21-day rule.

## V10.7.3
- Fixed two-stage daily-question notification deduplication.
- Added active-period-aware automatic next pill cycle on period Day 5.
- Added Day 4 pill UI state: next round starts tomorrow.
- Cleaned duplicate photo title/subtitle/story copy and preserved original captions.
- Added defensive UI rendering against repeated story fields.
- Added notification Cron schedule template.


## V10.7.2
- Corrected Pretty Shun P001–P010 captions/stories to match the actual photos.
- Fixed the home “查看其他回憶” button by routing through `showTab('album')`.


## V10.7.1
- Period daily logs now upsert on `space_id,log_date`.
- Homepage keeps a single Daily Flashback.
- Couple, Pretty Shun, Kapi, and Shun Food photos use horizontal rails in their own sections.
- Removed exact duplicate Kapi "終於團聚了！" image entry.
- Corrected the ten newly added Shun Food photo titles/stories.
- `photos.json` is the primary photo source; legacy photo arrays are fallback only.


## V10.7
- Memory Story gallery with only three core content families: couple memories, Shun, Kapi.
- 41 new photos from 2026-08 update.
- Rich subtitles, stories, tags and favorites.
- Shun Food remains a tag/series rather than a separate navigation section.
- Day 2 catch-up for a missed Day 1 period popup.


## V10.6.1
- Added permanent period_cycles migration.
- Fixed starting and ending active period cycles.
- Added local fallback before migration is installed.
- Preserved period_records as completed history.
- Added period_daily_logs cycle_id compatibility.


## V10.6 Stable
### Added
- Mandatory Today Brief sequence before entering the home experience
- Multiple important briefs shown one by one with progress
- Period warning photos for pre-period and first-day alerts
- Text library stored in `data/today_brief_texts.json`
- Testing helpers: `resetTodayBriefForTesting()` and `showTodayBrief({force:true})`

### Changed
- Old pill Day 5 popup is no longer part of the automatic home-entry flow
- Period popup logic is routed through Today Brief
- Service Worker cache updated to V10.6

### Preserved
- Existing website data, Cycle UI, Pill Engine, push notifications and Supabase logic
