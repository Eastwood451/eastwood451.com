# SMFI ↔ ChatGPT

The Nested Actor Mapper exposes its existing diagram through an OAuth-protected
MCP endpoint at `https://eastwood451.com/api/smfi/mcp`. This bridge makes no model
API calls. Inference stays in the user's ChatGPT conversation.

## Connect

Open an existing diagram in the Nested Actor Mapper and click **Forbind ChatGPT**.
This creates a private cloud copy and stores its randomly generated owner
capability in that browser. Open the setup page, add the MCP URL to ChatGPT with
OAuth authentication, and explicitly approve access to that diagram. Both pages
must use the same browser and the `eastwood451.com` origin.

Once installed, invoke the plugin and ask it to read the model. Supported tools
read the diagram, update notes and K1–K7 tags, create or move custom holons, and
add nested actors. Standard holons retain their structural meaning and cannot
be moved with the custom-holon tool.

## Data and authentication

Cloudflare Pages Functions proxy `/api/smfi/*` to the `smfi-mcp` Supabase Edge
Function. The `.well-known` function publishes the OAuth issuer's discovery
metadata. The Edge Function authenticates its own diagram capabilities and
OAuth tokens, so Supabase gateway JWT verification is disabled for this function.
The built-in `SUPABASE_SERVICE_ROLE_KEY` stays inside the Edge runtime.

The three `smfi_mcp_*` tables have RLS enabled and all browser-role grants
revoked. No anonymous or ordinary authenticated client can read them. A random
256-bit capability identifies a browser-owned diagram; only its SHA-256 hash is
stored. OAuth clients receive separate access and rotating refresh tokens scoped
to the approved diagram. PKCE is mandatory. Codes and refresh tokens are
atomically consumed. Redirect URIs are restricted to official ChatGPT callbacks.
Tokens and raw owner capabilities must never be logged or committed.

The bridge intentionally does not treat the site's frontend password gate as an
account identity. Possession of the browser's private diagram capability is the
owner credential. Clearing this browser's storage removes its owner access.
Export diagrams before changing browsers; importing a file and clicking
**Forbind ChatGPT** creates a separate private workspace. Existing cloud diagrams
can still be accessed by their already-authorized plugin until disconnected or
the tokens expire. The setup page can revoke all plugin tokens for its workspace.

## Sync and history

The browser polls every two seconds. Writes require the current revision, checked
again by an atomic database update. A three-way merge combines independent local
and remote edits. Overlapping edits pause sync and preserve the local copy for
review. Arrays, including actor trees, are treated as a unit during conflict
resolution. Diagram content is rendered as text rather than HTML.

A database trigger retains the previous 30 revisions. The setup page can restore
a revision. Close the mapper tab before restoring and reopen it afterward.
Snapshots exclude the legacy provider's chat history and credentials.

## Verification and deployment

- `node --test tests/smfi-mcp.test.mjs`
- `node tools/smfi-mcp/browser-test.cjs` (set `SMFI_TEST_CHROMIUM` to an installed Chromium executable)
- `python tools/smfi-mcp/live-test.py https://eastwood451.com/api/smfi`
- `npm run build:library`
- `npx wrangler pages functions build --outdir /tmp/smfi-functions-build`

The browser test uses an isolated mocked origin. The live test creates and deletes
its own test workspace and exercises OAuth, read/create/move, conflict rejection,
history, refresh and revocation. It never prints credentials. Its browser user agent
avoids Cloudflare's automated-client integrity rejection.

Apply the tracked SQL migration once to Supabase. Deploy `index.ts`, `server.js`
and `model.js` together as the `smfi-mcp` Edge Function. Push source changes to
GitHub `main`; Cloudflare Pages deploys the frontend and proxy functions. Keep
`.well-known/oauth-*` in the generated routes, and check the Cloudflare deployment
check plus the production health and metadata URLs after deployment.
