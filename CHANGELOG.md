# Changelog

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
