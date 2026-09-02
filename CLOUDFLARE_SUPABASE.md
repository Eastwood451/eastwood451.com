# Cloudflare + Supabase integration

This repository is configured for Cloudflare Pages.

## Cloudflare Pages

- Project name: `eastwood451-com`
- Production branch: `main`
- Build command: empty
- Build output directory: `/`
- Pages URL: `https://eastwood451-com.pages.dev`
- Custom domains: `eastwood451.com`, `www.eastwood451.com`

The repository root is the deployable static site. Cloudflare Pages Functions live in `functions/`.

## Supabase

Runtime values belong in Cloudflare Pages environment variables, not in GitHub:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The browser helper in `supabase-client.js` loads these values through `/api/config` and creates a Supabase client with `@supabase/supabase-js`.

Example usage:

```js
import { getSupabaseClient } from "/supabase-client.js";

const supabase = await getSupabaseClient();
const { data, error } = await supabase.from("example_table").select("*");
```

Do not commit Supabase service-role keys or database passwords to this repository.

## DNS activation

The Cloudflare zone was created in full setup mode. At the registrar, change nameservers from One.com to:

- `damon.ns.cloudflare.com`
- `katelyn.ns.cloudflare.com`

Cloudflare will activate the zone after the registrar change propagates.
