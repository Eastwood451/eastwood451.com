# Agent Skolelærer

Public entry: `/agent-skolelaerer/`, linked from the homepage.

Cloudflare Pages serves the app loader and same-origin API proxy. The owner
explicitly enabled public read/write access on 2026-09-21: anyone with the link
can view and edit the app's content. No password, Supabase account, or session
cookie is required. The homepage's separate browser password gate is unchanged.
The legacy session endpoint only expires the old app cookie for existing tabs.

The `agent-skolelaerer` Edge Function on the existing preparation project forwards
only explicitly allowed routes to the existing owner-private Sites backend.
Its service credentials stay in the existing Supabase Vault. The established
Google OAuth connection, preparation database, edit-conflict checks, and scheduled
five-minute material-register sync remain in place. Google reconnection continues
through the existing private Sites settings page.

The app's React source and generated JS/CSS remain in its **private** source
repository. Do not copy them into this repository. The public `/assets/app.js`
and `/assets/app.css` routes now deliver the UI without requiring login, with
`Cache-Control: no-store`. The original private Sites build now
runs `eastwood/build.mjs` before its normal build, so later app updates also refresh
the Eastwood UI. The ordinary Sites UI still works independently.

This is a new Eastwood entry point with shared backend services, not an independent
replacement of the Sites backend. Do not delete the original Site or its private
Google connection while this integration is in use.

Validation: `node --test tests/agent-skolelaerer.test.mjs` and
`node tools/matematikbibliotek/build.mjs`. Deploy by updating main; the existing
Cloudflare Pages Git integration publishes the site and its Functions.
Deploy `supabase/functions/agent-skolelaerer/index.ts` separately to the preparation
project with `verify_jwt: false` (the existing setting).
