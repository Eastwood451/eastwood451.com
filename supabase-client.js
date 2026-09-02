const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let clientPromise;

export async function getSupabaseClient() {
  if (!clientPromise) {
    clientPromise = createClient();
  }

  return clientPromise;
}

async function createClient() {
  const [{ createClient }, config] = await Promise.all([
    import(SUPABASE_CDN),
    fetch("/api/config", { cache: "no-store" }).then((response) => {
      if (!response.ok) {
        throw new Error("Could not load runtime configuration.");
      }
      return response.json();
    })
  ]);

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase is not configured for this environment.");
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}
