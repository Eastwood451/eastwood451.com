# Matematikbiblioteket

Public, shared PDF catalogue at /matematikbibliotek/, explicitly requested by the owner. No login is required. Everyone can search, read previews, correct manual tags, save filters and edit collections. Original PDFs stay in Drive with their existing sharing settings. R2 remains private and serves derived JPEGs through Pages Functions.

## Setup

- Apply migrations in supabase/migrations using the existing authorized Supabase connection. RLS permits public catalogue reads and shared manual edits. Anonymous users cannot modify source files, extracted text, AI assessments or import jobs. Never use a service key in the browser.
- Configure SUPABASE_URL and the publishable SUPABASE_ANON_KEY in Pages; bind private R2 bucket as MATH_PREVIEWS. Keep r2.dev public access disabled. No Auth provider or redirect configuration is required for this app.
- Cloudflare Pages build: npm run build:library, output dist. The GitHub Pages workflow also publishes only dist. Build output excludes tools, tests, database migrations, original PDFs, extraction data and credentials.

## Local import

Use Python 3.13 with requirements.txt. Keep --data outside this repository and outside the original PDF tree. Never commit local data, SQL payloads, extracted text, previews or CLI credentials.

1. Refresh the Drive inventory using the connected Drive account. Save folders to DATA/drive/folders.json and PDF metadata to DATA/drive/pdf-NNN.json. Folder rows: id, name, parents (root has []); file rows: id, name, size as integer, parents. Enumerate the selected root and every descendant; preserve ambiguous matches for review.
2. python tools/matematikbibliotek/import.py ingest --root ORIGINALS --data DATA
3. python tools/matematikbibliotek/import.py pilot --root ORIGINALS --data DATA
4. python tools/matematikbibliotek/render_all.py --root ORIGINALS --data DATA
5. python tools/matematikbibliotek/export_sql.py --data DATA
6. Apply DATA/sql/manifest.json in order via the authorized database connector. Upserts do not overwrite analysis or user corrections.

## AI analysis and budget

The current runner uses Antigravity CLI with the owner's included Google AI Pro quota, model gemini-3.8-flash-low. Extra AI credits must remain off; the runner checks before every batch. It never switches to a paid API. Paid API spending is therefore 0 USD against the approved 50 USD ceiling. A future paid provider requires its own reservation-based budget enforcement before it can be enabled.

The CLI exposes a model slug, not an immutable snapshot. Store CLI version, prompt hash and analysis version with the run. Do not claim an immutable model snapshot.

- Pilot: python tools/matematikbibliotek/analyse.py --data DATA --max-pages 100
- Inspect all 100 actual page images against the classifications. The first pilot scored 91/100 for the main topic or justified absence; 9 main-topic errors were corrected after the rules were refined. This was Codex visual inspection, not teacher/human validation. Record the audit privately in pilot-review.json.
- Remaining pages: python tools/matematikbibliotek/analyse.py --data DATA --all-pending --max-pages 20000 --batch-size 15
- The runner stops on quota, CLI failure, timeout or invalid structured output. Restarting selects only pending pages. Facit and uncertain classifications remain marked for review.
- Generate exact remaining-page and review lists with status_report.py. Never describe the catalogue as fully tagged until every readable unique page has an analysis result; review-needed is distinct from pending.

## Preview uploads and database sync

upload_previews.py uploads only small JPEGs using the existing Wrangler login and a rate limit; uploaded-previews.json is the resume checkpoint. Keep it private. It refreshes the existing OAuth session periodically through Wrangler.

Run sync_analysis.py --data DATA to create delta SQL under DATA/sync. Apply every file in sync/manifest.json using the authorized database connector. Only after every file succeeds, copy sync/pending-state.json to DATA/synced-state.json. A failed/uncertain run can be replayed safely. AI updates delete only origin=ai; manual page overrides survive.

Updates are manual. There is no scheduler, automatic paid fallback, or PDF merging.

## Validation and deployment

- npm run test:library: owner/API boundary, anonymous/nonowner denial, filter validation and cross-origin writes.
- python tests/test_library_import.py: duplicate hashes, empty file, ambiguous Drive match and resumable import.
- tests/library-regression.sql: real database assertions for same-page/assessment filtering, manual corrections, reimport, saved filters, collections, Danish text and RLS. All fixture changes roll back.
- node tests/library-ui.mjs DATA: browser interaction using private real-material fixtures and a mocked transport; this complements, not replaces, actual auth/database tests.
- node tests/preview.mjs: actual deployed public access smoke test.
- Build then deploy a preview; inspect actual materials and public search/preview access before production. Do not include fixture screenshots or data in the deployment.

The optimized database query selects the result page before fetching details. Measured on 17,385 unique pages: about 200 ms for an unfiltered search and 107 ms for grade+topic+difficulty. These are database timings, not an end-to-end network guarantee.
