# Fortællerværkstedet i skyen

Produktionsløsningen bruger:

- GitHub til versionsstyring og ændringshistorik.
- Cloudflare Workers + Static Assets til website, API, adgangskontrol og logs.
- Supabase Postgres til historieprojekter og en privat Storage-bucket til billeder/PDF-filer.
- Google Analytics 4 med måle-id `G-C2P8VD70GG`.

## Hemmeligheder

Disse værdier skal ligge som krypterede Cloudflare Worker-secrets og må aldrig committes:

- `OPENAI_API_KEY`
- `SUPABASE_SECRET_KEY`

## Lokal drift

Den eksisterende lokale version kan fortsat startes med `Start værkstedet.cmd`. Cloud-versionen bygges og testes med Wrangler via scripts i `package.json`.

## Database

Kør migrationen i `supabase/migrations/20260905110000_create_story_projects.sql` i Supabase-projektet `eastwood451.com` før første deployment.
