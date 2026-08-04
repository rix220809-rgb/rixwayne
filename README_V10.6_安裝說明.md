# Our Memories V10.6 Stable

## Update
1. Back up the current local repository.
2. Replace the website files with this complete package while keeping the hidden `.git` directory.
3. Commit and Push.
4. Wait for GitHub Pages deployment.
5. Fully close and reopen the mobile PWA, or force refresh in the browser.

## No database change
This release does not require a new SQL migration.

## No Edge Function change
The current push-notification Edge Function remains unchanged.

## Test Today Brief
Open the browser developer console and run:

```js
resetTodayBriefForTesting();
showTodayBrief({force:true});
```

`force:true` only shows briefs that actually match today's conditions. To test a period-start brief immediately after starting a cycle, the website automatically opens that brief.
