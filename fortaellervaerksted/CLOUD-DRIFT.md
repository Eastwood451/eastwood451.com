# Fortællerværkstedet i skyen

Produktionsløsningen bruger:

- GitHub til versionsstyring og ændringshistorik.
- Cloudflare Workers + Static Assets til website, API, adgangskontrol og logs.
- Cloudflare R2-bucket `fortaellervaerksted-assets` til private billeder og PDF-filer.
- Supabase Postgres kun til strukturerede historieprojekter.
- Google Analytics 4 med måle-id `G-C2P8VD70GG`.

## Hemmeligheder

Disse værdier skal ligge som krypterede Cloudflare Worker-secrets og må aldrig committes:

- `OPENAI_API_KEY`
- `SUPABASE_SECRET_KEY`

## Lokal drift

Den eksisterende lokale version kan fortsat startes med `Start værkstedet.cmd`. Cloud-versionen bygges og testes med Wrangler via scripts i `package.json`.

## Database

Kør migrationen i `supabase/migrations/20260905110000_create_story_projects.sql` i Supabase-projektet `eastwood451.com` før første deployment.

## Mediefiler

Worker-bindingen `STORY_ASSETS` peger på den private R2-bucket `fortaellervaerksted-assets`. Filerne er ikke offentligt eksponeret fra R2; de udleveres kun gennem den Access-beskyttede Worker.
