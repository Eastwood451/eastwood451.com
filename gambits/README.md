# Gambitregister

Det publicerede GUI ligger i `gambits/index.html`. Projektets standardgren er `main`.

## Data og gemning

Den kanoniske database er Supabase-projektet `wpriingzftsboauvkmsj`, tabellen `public.smfi_gambits`. Kildeeksempler, navne og øvrige brugerredigeringer skal **ikke** gemmes direkte i dette offentlige GitHub-repository.

- Opdateringer sker med Supabase Auth og rækkeadgang (RLS).
- Gemmekøen gemmer midlertidige nødudkast i browseren, indtil Supabase bekræfter skrivningen.
- UI viser særskilt status for uafsendte og bekræftede rettelser.
- Ændringer versionsstyres, og database-revisioner arkiveres i `public.smfi_gambit_revisions`.
- Eksportrer brugeren en JSON-backup, skal den sammenholdes med den aktuelle database inden eventuel gendannelse. En backup må ikke blindt overskrive nyere versioner.

## Gendannelse 2026-11-14

En manuelt eksporteret JSON-backup blev sammenholdt felt for felt med Supabase.

16 manglende `example`-felter blev gendannet med kontrol af både tidligere indhold og rækkernes versionsnumre:

`GAM-0041`, `GAM-0042`, `GAM-0043`, `GAM-0045`, `GAM-0046`, `GAM-0047`, `GAM-0049`, `GAM-0050`, `GAM-0051`, `GAM-0052`, `GAM-0053`, `GAM-0054`, `GAM-0055`, `GAM-0056`, `GAM-0057` og `GAM-0058`.

Et forældet navn i backupfilen (`GAM-0040`) blev med vilje **ikke** importeret, fordi Supabase allerede indeholdt en nyere version.

Gendannelsen ændrede ingen andre felter end de 16 eksempler. Hele backupfilen og de potentielt private eksempler er holdt uden for det offentlige repository.
