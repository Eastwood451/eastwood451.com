# Agent Skolelærer

Public entry: `/agent-skolelaerer/`, linked from the homepage.

Cloudflare Pages serves the login shell and same-origin API proxy. The existing
Eastwood Supabase account authenticates the user. A separate HttpOnly, Secure,
SameSite=Strict cookie authorizes same-origin API and PDF image requests. Every
request is validated by the Supabase Auth server and restricted to the existing
owner account; being signed into an unrelated Eastwood account is insufficient.

The `agent-skolelaerer` Edge Function on the existing preparation project forwards
only explicitly allowed routes to the existing owner-private Sites backend.
Its service credentials stay in the existing Supabase Vault. The established
Google OAuth connection, preparation database, edit-conflict checks, and scheduled
five-minute material-register sync remain in place. Google reconnection continues
through the existing private Sites settings page.

The app's React source and generated JS/CSS remain in its **private** source
repository. They contain pupil-specific presentation rules and must not be copied
into this public repository. The authenticated `/assets/app.js` and `/assets/app.css`
routes deliver them without public caching. The original private Sites build now
runs `eastwood/build.mjs` before its normal build, so later app updates also refresh
the Eastwood UI. The ordinary Sites UI still works independently.

This is a new Eastwood entry point with shared backend services, not an independent
replacement of the Sites backend. Do not delete the original Site or its private
Google connection while this integration is in use.

Validation: `node --test tests/agent-skolelaerer.test.mjs` and
`node tools/matematikbibliotek/build.mjs`. Deploy by updating main; the existing
Cloudflare Pages Git integration publishes the site and its Functions.
