# Changelog

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
