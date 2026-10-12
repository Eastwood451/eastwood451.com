# SMFI ↔ ChatGPT / Grok

Two OAuth-protected Streamable HTTP MCP servers connect the existing editors to
an assistant's own conversation, with no model API calls:

| Editor | MCP URL | Scopes |
| --- | --- | --- |
| Nested Actor Mapper | `https://eastwood451.com/api/smfi/mcp` | `smfi:read smfi:write offline_access` |
| Belief Map | `https://eastwood451.com/api/smfi/belief/mcp` | `belief:read belief:write offline_access` |

Open the editor in the browser holding the existing diagram and click **Forbind AI**.
This creates a private cloud copy. The setup page explains ChatGPT and Grok OAuth
configuration. Consent must happen in the same browser and on `eastwood451.com`.
For Grok, use Connectors → New Connector → Custom. If a Client ID is required,
the setup page registers a public client restricted to Grok's web callback. Leave
the secret empty and choose `none (PKCE only)`. The public ID confers no access
without owner consent. ChatGPT's existing dynamic registration remains supported.

Both assistants can connect to the same workspace and see each other's changes.
Inference uses each service's normal subscription and usage limits. No model API
key is required by these bridges. Infrastructure uses the existing hosting/database.

Nested Actor tools read the diagram, update notes/tags, create/move custom holons,
and add actors. Standard holons keep their structural meaning.

Belief Map tools list/read/select/create saved maps, edit titles/notes, and apply
atomic batches of node/edge/timeline actions. The active map is displayed by the
browser. IDs, flat nesting, clusters, node fields and timeline steps are preserved.
Derived `subNodes` copies are rebuilt locally; viewport, legacy chat and proposition
tester state stay local. Confidence and weights are model values, not independently
verified probabilities. New AI-created nodes default to hypothesis / 0.5 confidence.
The connected library has limits of 50 maps, 1 MB total, 1,000 nodes and 2,000 edges
per map. Oversized libraries report an error without discarding local data.

## Authentication and storage

Cloudflare Pages proxies `/api/smfi/*` to `smfi-mcp` and `/api/smfi/belief/*` to
`belief-mcp` Supabase Edge Functions. Path-specific `.well-known` routes publish
each issuer's OAuth discovery. Both authenticate every data operation themselves,
so Supabase gateway JWT verification is disabled. Service role credentials stay
inside the Edge runtime. Both use the existing RLS-protected `smfi_mcp_*` tables;
browser-role grants are revoked. No new schema is required for Belief Map.

A random 256-bit browser owner capability is stored locally, with only its SHA-256
hash in the database. This is independent of the site's frontend password gate.
OAuth access and rotating refresh tokens are bound to the approved workspace AND
MCP resource; owner credentials, clients, codes and tokens cannot cross editors.
S256 PKCE is mandatory. Codes/refresh tokens are atomically consumed. Redirects
accept only exact official ChatGPT callbacks and Grok's HTTPS web callback:
`https://grok.com/connectors-oauth-exchange-code/`.
Raw capabilities, tokens and client secrets must never be logged or committed.

Clearing browser storage removes owner access. Export diagrams before changing
browsers; importing and connecting creates another private workspace. Existing
OAuth connections remain authorized until disconnected or expired. The setup
page explicitly revokes **all** AI connections to its workspace.

## Sync and history

Polling every two seconds uses atomic compare-and-swap revisions. Three-way merge
combines independent edits. Belief maps/nodes/edges merge by stable ID; actor trees
and index-addressed timeline steps merge atomically. Overlapping changes or jointly
invalid graph references pause sync, preserving the local copy for review/export.
Text is rendered as text, including names/notes supplied by assistants.

A trigger retains the previous 30 revisions. Restore through setup after closing
the editor, then reopen. Separate local connection/cache keys keep both editors
independent. Revision history records browser, ChatGPT or Grok as the source.

## Verification

- `node --test tests/smfi-mcp.test.mjs tests/belief-mcp.test.mjs`
- `node tools/smfi-mcp/browser-test.cjs`
- `node tools/smfi-mcp/belief-browser-test.cjs`
- `python tools/smfi-mcp/live-test.py https://eastwood451.com/api/smfi grok`
- `python tools/smfi-mcp/live-test.py https://eastwood451.com/api/smfi/belief grok belief`
- `npm run build:library`
- `npm exec --package=wrangler -- wrangler pages functions build --outdir /tmp/smfi-functions-build`

Browser tests use an isolated mocked origin and an installed Chromium executable
(`SMFI_TEST_CHROMIUM`). The Belief test needs downloaded React 18.3.1, ReactDOM
18.3.1 and Babel standalone UMD files named react.js, react-dom.js and babel.js in
`SMFI_BELIEF_VENDOR` (default `/tmp/smfi-belief-vendor`). The live tests create and
delete their own test workspace, never touching user diagrams or printing tokens.
They test Grok-compatible OAuth at protocol level; user-account installation in
Grok must still be completed by the user.

## Deployment

Apply the original SQL migration once. `smfi-mcp` deploys index.ts, server.js and
model.js. `belief-mcp` deploys index.ts plus the same server/model and belief-model.js.
The three shared source files in its folder are deployment bundle copies; synchronize
from `smfi-mcp` before deploying. Both entrypoints implement their own authentication.
Publish GitHub main and check Cloudflare's deployment check, production health,
issuer/resource metadata and live OAuth tests.

Native Grok setup and callback references:
- https://docs.x.ai/grok/connectors
- https://docs.x.com/x-ads-api/mcp (Grok web OAuth recipe)
