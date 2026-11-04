# Agent Skolelærer

Public entry: `/agent-skolelaerer/`, linked from the homepage and from
Matematikbiblioteket ("Forberedelse ↗").

Cloudflare Pages serves the app loader and a same-origin API proxy
(`functions/api/agent-skolelaerer/[[path]].js`). That proxy only accepts browser
requests whose `Origin` is `https://eastwood451.com` (otherwise 403). The owner
explicitly enabled public read/write access on 2026-09-21: anyone with the link
can view and edit the app's content. No password, Supabase account, or session
cookie is required. The homepage's separate browser password gate is unchanged.

## Backend: Supabase directly (no ChatGPT Sites dependency)

The `agent-skolelaerer` Edge Function on the preparation project
(`uxbrnmcbvxgpsvdbzcov`) reads and writes the preparation tables itself with the
project's built-in `SUPABASE_SERVICE_ROLE_KEY` (never stored in this repo):

| Route | Implementation |
| --- | --- |
| `GET /session` | static `{authenticated: true}` |
| `GET /data` | `preparation_plans` + `preparation_homework` (owner-filtered, paged), merged like the app expects |
| `POST /lesson` | fields 1/2/5 → `save_preparation_cell` (`p_previous` conflict check); notes → `save_preparation_note`; fields 0/3/4 → `save_preparation_homework` with the client's `expectedVersion` |
| `POST /annual` | `save_preparation_annual` with `expectedVersion` |
| `POST /material` | appends a `label\nurl` block to one cell, using the current value as `previous` / current homework version as `expectedVersion`; duplicate URLs are skipped |

Every conflict reported by the database (HTTP 409 / `PT409`) is returned as
**409** and nothing is overwritten. `preparation_homework` is only ever written
through `save_preparation_homework` with an expected version. Invalid input is
rejected with 400 before any RPC call.

Optional extras still come from the old Sites backend on a best-effort basis
(service credentials in the existing Supabase Vault): calendar events in
`/data`, `/google/config`, `/materials`, `/materials/resolve-file`, `/pdf-cover`
and `POST /register/sync`. If that backend is gone, `/data` returns
`events: []`, `/google/config` reports "not connected", and the other extras
answer 503 — lessons, annual plan, saving and adding materials keep working.
The legacy `/assets/app.js` and `/assets/app.css` routes remain only so tabs
opened before the switch keep working.

## UI

The app's compiled bundle is vendored at `agent-skolelaerer/app/app.js` and
`app.css` (the same files that were already publicly served at
`/api/agent-skolelaerer/assets/*`). `login.js` loads them with `?v=APP_VERSION`;
bump `APP_VERSION` when replacing them.

Visible track labels are renamed in the browser only, by
`agent-skolelaerer/display-labels.js`: Klassen → **Hovedspor**, Nicki →
**Støttespor**, Malthe D → **Ekstra**. Stored row names, `name` on
`POST /lesson`/`/material`, recipient keys, and homework keys stay the
original names.

### Tilføj materiale

`agent-skolelaerer/material.js` adds a "＋ Tilføj materiale" dialog (button in
the top bar, or opened automatically by
`/agent-skolelaerer/?materiale=1&title=…&drive=…&page=…`, which is what
Matematikbiblioteket's "Tilføj til forberedelse" links now open). The user picks
a date, exactly one of **Hovedspor / Støttespor / Ekstra** (sent as Klassen /
Nicki / Malthe D) and a placement, and the dialog calls `POST /material`.
Only `https://drive.google.com` / `https://docs.google.com` links are accepted.

## Validation and deploy

```
node --test tests/agent-skolelaerer.test.mjs tests/agent-skolelaerer-material.test.mjs \
  tests/display-labels.test.mjs tests/preparation-link.test.mjs
node tools/matematikbibliotek/build.mjs
```

Pages and its Functions deploy from `main` through the Cloudflare Pages Git
integration. Deploy the Edge Function separately, keeping JWT verification off
(the existing setting):

```
supabase functions deploy agent-skolelaerer --project-ref uxbrnmcbvxgpsvdbzcov --no-verify-jwt
```

The new function is backward compatible with the old page, so it can be
deployed right before or right after the Pages deploy. Rollback: redeploy the
previous `index.ts` from git (`git show <previous-main>:supabase/functions/agent-skolelaerer/index.ts`)
and revert the merge commit.
