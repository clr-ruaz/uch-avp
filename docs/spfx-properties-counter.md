# AVP Home Page — SPFx replacement

The `src/sharepoint/spfx` project replaces the Properties Counter canvas app with a lightweight SharePoint web part. It retains the six workload categories and the import, dropped-property and search links. It can be added to a modern page or used as a full-page SharePoint app.

## Query design

- Render the shell immediately. Resolve the configured list’s DefaultViewUrl before enabling its links, then load counts. No Power Apps runtime or Power Automate request is involved.
- Read `Title` and `Filter` from the existing OData Filters list once per refresh. The live DEV list and all six rules were inspected on 27 October 2026. Intake and Junior Review contain financial, issue, lookup, cancellation and status conditions; they must not be replaced with simple status counts.
- Run at most three category requests concurrently. Each query selects only `Id`, requests pages of up to 2,000 items and follows all SharePoint continuation links before displaying a count. Results are not capped at 5,000. Rows are counted and discarded page by page.
- On a confirmed `SPQueryThrottledException`, queue the failed categories for one shared, unfiltered traversal ordered by ID. Select only the fields referenced by those rules, explicitly expand lookup titles, and follow all continuation links. Evaluate each page in memory and discard its rows. No list records, indexes, permissions or threshold settings are changed.
- Read the complete field schema before fallback evaluation (without a `$top` cap on the field collection). Use `EntityPropertyName` for REST field names and `TypeAsString` to identify dates. Date-looking text remains text. Invalid rules and evaluation failures affect only their own category; transport/page failures invalidate all unfinished counts.
- The fallback accepts a strict, non-executable OData subset: parenthesized `and`/`or`, field-to-literal `eq`/`ne`/`gt`/`ge`/`lt`/`le`, strings (including escaped quotes), numbers, booleans and null. Unsupported syntax, omitted required fields and invalid types fail closed. Date-only cutoffs retain their midnight-UTC meaning. Future rules using functions need explicit evaluator support before they can use the fallback.
- Progress reports properties checked; counts become final only after every page succeeds. The fallback reads the visible list once for all failed categories, so its cost grows with list size. Concurrent edits are not a transactional snapshot.
- Preserve the existing UTC-08 calendar-date cutoff for Intake, Junior Review, Junior Input and Senior Review. The existing flow appends a date-only literal; this implementation retains that behavior, rather than changing to Pacific daylight-saving time.
- Preserve zero as a valid result. Missing/duplicate rules, denied access, invalid responses, failed pages and threshold errors display Unavailable, never zero or a partial count.
- Retry 429/503 responses up to twice, respecting Retry-After. Long retry intervals produce a visible error. Refresh rereads both rules and results. No persistent/shared count cache is used, so counts run under the current user's SharePoint permissions.
- Disposal or replacement of a render suppresses late results and stops further page requests. Existing in-flight SPHttpClient requests may still finish.

This removes six flow invocations and five redundant configuration reads per refresh, and projects IDs for successful direct queries. The fallback additionally downloads the fields required by its rules. It does **not** bypass SharePoint list thresholds or provide a transactional snapshot while records change. Successful filtered queries execute on SharePoint; threshold failures use the paged evaluator. Measure large-list performance and count parity in DEV. A stored summary is deliberately not introduced because it would add background maintenance, stale counts and potentially different permission semantics.

## Build

Requires Node 22 LTS (22.14 or newer in the 22.x line) and npm. The project uses SPFx **1.23.2** and the Heft build tooling. Dependencies are installed in this project and locked in `package-lock.json`; there is no dependency link to the sibling DHA project.

```sh
cd src/sharepoint/spfx
npm ci
npm run verify
npm audit
```

`verify` runs the 21 regression tests, a clean production build (including TypeScript and ESLint), and packaging. Output: `src/sharepoint/spfx/sharepoint/solution/avp-home-page.sppkg`.

For local debugging, copy `config/serve.example.json` to ignored `config/serve.json`, enter the DEV hosted workbench URL, then run `npm run serve -- --nobrowser`. The tooling may prompt for trust of a localhost development certificate; complete the macOS system prompt yourself. Open the hosted workbench with the debug query printed by the server (`debugManifestsFile` now points to `/temp/build/manifests.js`). Only load scripts from your own trusted development server. The previous Gulp commands no longer apply.

### Dependency security

The 28 October 2026 npm audit reports **zero known vulnerabilities**, including development dependencies. A clean `npm ci` and full verification run also pass. This is the advisory status at verification time, not a guarantee against future disclosures. Some upstream packages still emit deprecation notices during installation.

SPFx was upgraded using the Microsoft 365 CLI migration report, following [Microsoft's 1.23.2 guidance](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.2). Compatible transitive patches were applied. Targeted overrides pin `serialize-javascript` 7.1.3, `uuid` 11.1.1 and `qs` 6.16.0; they address advisories beyond the parent packages’ pinned/ranged versions. The uuid callers use supported CommonJS `v1`/`v4` APIs; regression tests exercise these callers' resolved dependencies and the minifier serializer. Packaging and the development server were exercised with these overrides. Keep them until upstream dependency ranges include safe versions, then re-audit and rerun verification before removing them. The Heft and React-types overrides follow the migration configuration.

## Deployment and immediate cutover

1. Upload `avp-home-page.sppkg` to the same SharePoint app catalog as the previously installed package. Its app/product ID remains `a8765e03-0be3-4af8-9c0e-ddeffae787a3`, and its version is now `1.0.1.0`, so it updates the existing app. Both the package title and new web-part picker title are **AVP Home Page**. The generated package manifest was inspected to confirm this. Deployment/enablement remains a separate step; this update has not been uploaded or deployed by the agent.
2. Add **AVP Home Page** to a modern page in `/Automation/UCH-AVP/DEV`. It uses the page’s current site URL and resolves navigation from the configured property list. The predefined AVP view IDs apply only to the original property list; a different list opens its own default view. Import properties remains an AVP site-specific tool link. The default list IDs match the verified DEV lists. Other sites require matching lists and views; this package does not provision them.
3. Confirm all six counts against the existing rules under the intended users' permissions. Check empty results, date boundaries, a category over 5,000 matches if available, and all nine links. Counts follow the OData Filters list; linked views are separately maintained and can differ if someone changes only one of them.
4. Measure cold navigation and time to the final count against the old app. Verify lookup/filter query behavior and list indexes if any card reports an error. The SharePoint connector used to inspect configuration does not execute these REST count queries; authenticated browser acceptance remains required.
5. Publish the replacement page and replace the existing Power Apps embed/navigation link with that page or web part. The replacement has no dependency on the canvas app or Get Items Count flow, so the user-facing cutover can happen immediately after acceptance.
6. Retain the old app as a rollback option until acceptance is complete. Stop sharing/remove it after confirming there are no other entry points. Do not disable/delete Get Items Count until its other callers are checked and the user explicitly approves that flow change, as required by AGENTS.md. Do not delete other AVP automation.

Version 1.0.1.0 source, tests, packaging and DEV workbench verification are complete. The user previously uploaded version 1.0.0.0; this updated package has not been deployed. Page publication, independent legacy count parity/performance comparison and Power Apps retirement remain separate acceptance steps. No cloud flows, SharePoint records or app permissions were changed.

## Test coverage

The Node tests exercise the actual transpiled count service: date boundaries and filter grouping; all-page counting beyond 5,000; bounded concurrency; one configuration read; ID-only projection; error isolation; missing/duplicate filters; paging-link validation; disposal; and invalid list identifiers. The fallback tests cover shared paging beyond 5,000, field projection, lookup expansion and null lookup IDs, unsupported syntax, missing fields, cancellation and failed pages without partial totals. Build/type checking and solution packaging validate the SPFx output. Broader user-permission and performance acceptance remains as described above.

## Workbench threshold investigation (27 October 2026)

Browser inspection confirmed HTTP 500 / `Microsoft.SharePoint.SPQueryThrottledException` for Intake and Junior Review. The previous ID-range fallback still failed at IDs 1–250, including with explicit ID ordering and either bound first. It has been replaced by the shared paged evaluation described above. Error cards now show short actionable text with full diagnostics available in the title, and long text wraps within the card.

Live DEV workbench verification on 27 October 2026 at 10:09 PM Asia/Manila completed with Intake **2**, Junior Review **394**, Junior Input **19**, Senior Review **3**, Pipeline **5**, and Watchlist **56**. All six cards rendered without errors. The fallback was observed progressing past 32,000 properties, so it is materially slower than the four successful direct queries. This verifies successful live execution; independent parity with the legacy app has not been established. The 11 regression tests, production bundle and solution packaging pass. No deployment or publication was performed.

## Security and regression verification (28 October 2026)

The review fixes cover schema-based date handling, per-category fallback errors, order-independent duplicate detection (including blank/malformed rules), configured-list navigation, root-site URL handling, and same-resource continuation validation with SharePoint’s casing/encoding normalization. The Heft migration also required changing the global stylesheet to a supported SCSS module; the final layout was visually checked in the hosted workbench.

The final run completed at 12:02 AM Asia/Manila: Intake **2**, Junior Review **391**, Junior Input **19**, Senior Review **3**, Pipeline **5**, and Watchlist **56**. These matched the values visible immediately before the upgrade. Counts can change as list records change. The package contains one production bundle and no localhost development-server reference. Verification logs, the audit report and package SHA-256 are saved locally under ignored `.artifacts/spfx/2026-10-28/`.

The fallback still reads required fields across the current user’s visible list and is slower than a successful filtered query. No background/shared cache, record changes or permission changes were introduced. Browser acceptance used the signed-in DEV administrator; acceptance under intended non-admin roles and independent comparison with the legacy app are not implied by these checks.

## Soft cards design verification (28 October 2026)

Applied the approved Soft cards layout: removed the eyebrow/title/subtitle, reduced normal cards to a 136px minimum height with border-box sizing, softened borders, and moved refresh status into the compact top toolbar. All successful cards now say “View property listing”; loading progress and error guidance remain available. The UTC−08 explanatory note was removed from the UI without changing counting rules. The grid adapts to two columns on narrow screens and one on very narrow screens.

All 21 regression tests, ESLint, clean production build and solution packaging pass. The resulting package was inspected for the new copy/styles and absence of the removed text. DEV workbench edit and preview layouts were visually checked; loading completed with counts 2 / 391 / 19 / 3 / 5 / 56 at 12:25 AM Asia/Manila. Screenshot: ignored `.artifacts/spfx/2026-10-28/soft-cards-workbench.png`. The existing 1.0.1.0 candidate package was rebuilt; it has not been uploaded or deployed.
