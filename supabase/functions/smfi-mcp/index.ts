import { createDatabase, createHandler } from './server.js';
// Gateway JWT verification is disabled because this function implements its own
// OAuth 2.1 / diagram-capability checks. No anonymous access to diagram data.
const db = createDatabase(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(createHandler(db));
