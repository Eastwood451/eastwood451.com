// ============================================================
// KLADISTISKE STIER PER ORGANISM  (clade-data.js)
// Fylogenetiske grene fra Biota ned til arten.
// rank = "BIOTA", "KLAD" eller "ART"
// ============================================================

const cladePaths = {

  // ── Løve ────────────────────────────────────────────────
  "løve": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden nedstammer fra LUCA (Last Universal Common Ancestor)." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med en membranbundet cellekerne. Opstod for ~2 mia. år siden." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr. Flagelcellen peger bagud (opisth = bagved)." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr med specialiserede celler og væv." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Dyr med bilateral symmetri og tre kimlag. Langt størstedelen af alle dyrearter." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes SIDST under fosterudviklingen. Inkl. pighuder og rygstrengsdyr." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har en notochord (rygstreng) i mindst ét livsstadium. Inkl. fisk, fugle og pattedyr." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Rygstrengsdyr med en rygsøjle af knogler eller brusk der beskytter rygmarven." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Hvirveldyr med en bevægelig, benomsluttet underkæbe. Muliggør aktivt rovdyrliv." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Hvirveldyr med fire lemmer. Koloniserede land ~375 mya." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Landdyr med fosterhinde (amnion) der beskytter embryoet i æg eller livmoder." },
    { name:"Synapsida",        danish:"Synapsider",            rank:"KLAD",  desc:"Amnioter med ét tindingshul i kraniet. Pattedyrenes evolutionære linje." },
    { name:"Mammalia",         danish:"Pattedyr",              rank:"KLAD",  desc:"Varmblodede synapsider med pels/hår, tre mellemøreknogler og mælkekirtler." },
    { name:"Placentalia",      danish:"Placentale pattedyr",   rank:"KLAD",  desc:"Pattedyr der ernærer fostre via en moderkage (placenta). ~95 % af alle pattedyrarter." },
    { name:"Boreoeutheria",    danish:"Boreoeutheria",         rank:"KLAD",  desc:"Stor gruppe placentale pattedyr fra den nordlige halvkugle. Inkl. gnavere, rovdyr og primater." },
    { name:"Laurasiatheria",   danish:"Laurasiatheria",        rank:"KLAD",  desc:"Gruppe opstået på superkontinentet Laurasia. Inkl. rovdyr, flagermus, hovdyr og hvaler." },
    { name:"Ferae",            danish:"Ferae",                 rank:"KLAD",  desc:"Nærtbeslægtede ordner inkl. Carnivora (rovdyr) og Pholidota (skældyr)." },
    { name:"Carnivora",        danish:"Rovdyr",                rank:"KLAD",  desc:"Pattedyr tilpasset kødæderdiæt med specialiserede rovtænder (carnassials)." },
    { name:"Feliformia",       danish:"Kattelignende rovdyr",  rank:"KLAD",  desc:"Inkl. katte, hyæner, manguster og desmerdyr. Søster til Caniformia (hunde m.fl.)." },
    { name:"Felidae",          danish:"Kattefamilien",         rank:"KLAD",  desc:"Smidige solitære jægere med retraktærbare kløer og fremragende nattesyn." },
    { name:"Pantherinae",      danish:"Store katte",           rank:"KLAD",  desc:"Underfamilien af store brølende katte: løve, tiger, jaguar og leopard." },
    { name:"Panthera",         danish:"Brølekatte",            rank:"KLAD",  desc:"De fire store brølende katte. Elastisk tungeben adskiller dem fra andre katte." },
    { name:"Panthera leo",     danish:"Løve",                  rank:"ART",   desc:"Den sociale storkat fra Afrikas savanner og Indiens Gir-skov." }
  ],

  // ── Kongeørn ─────────────────────────────────────────────
  "ørn": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden, der nedstammer fra LUCA." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr; flagelcelle bagud." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Dyr med bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord i mindst ét livsstadium." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Hvirveldyr med fire lemmer der koloniserede land." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Fosterhinde beskytter embryoet. Inkl. reptiler, fugle og pattedyr." },
    { name:"Sauropsida",       danish:"Sauropsider (Reptilia)",rank:"KLAD",  desc:"Amnioter med to eller ét tindingshul (excl. synapsider). Inkl. ALLE reptiler OG fugle." },
    { name:"Archosauria",      danish:"Archosauria",           rank:"KLAD",  desc:"Herskende krybdyr: krokodiller, fugle og alle uddøde dinosaurer." },
    { name:"Dinosauria",       danish:"Dinosaurer",            rank:"KLAD",  desc:"Fugle ER dinosaurer — ekstremt vellykkede theropoder der overlevede K-Pg-udryddelsen." },
    { name:"Theropoda",        danish:"Theropoder",            rank:"KLAD",  desc:"Tobenede, overvejende kødædende dinosaurer. Inkl. T. rex og alle fugle." },
    { name:"Avialae",          danish:"Fugle og nære slægtn.", rank:"KLAD",  desc:"Theropoder inkl. nutidens fugle og de nærmeste fossile slægtninge." },
    { name:"Aves",             danish:"Fugle",                 rank:"KLAD",  desc:"Fjerklædte dinosaurer med vinger og hornæb. ~10.000 nulevende arter." },
    { name:"Neognathae",       danish:"Moderne fugle",         rank:"KLAD",  desc:"Alle moderne fugle undtagen strudse m.fl. Udgør ~99 % af alle fuglearter." },
    { name:"Accipitriformes",  danish:"Rovfugle (daglige)",    rank:"KLAD",  desc:"Dagaktive rovfugle med krogede næb og skarpe klør." },
    { name:"Accipitridae",     danish:"Høgefamilien",          rank:"KLAD",  desc:"Høge, glenter, ørne og våger. Mestrer svæveflyvning på termik." },
    { name:"Aquila",           danish:"Ægte ørne",             rank:"KLAD",  desc:"Store kraftige ørne med fjerklædte løb helt ned til tæerne." },
    { name:"Aquila chrysaetos",danish:"Kongeørn",              rank:"ART",   desc:"En af Europas største rovfugle med op til 2 meters vingefang." }
  ],

  // ── Hestereje ────────────────────────────────────────────
  "reje": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes FØRST. Inkl. leddyr og bløddyr." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Dyr der skifter hud (ekdysis). Inkl. leddyr og rundorme." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton, segmenteret krop, leddelte ben. Den artsrigeste dyreklasse." },
    { name:"Crustacea",        danish:"Krebsdyr",              rank:"KLAD",  desc:"Leddyr med to par antenner og gæller. Overvejende marine." },
    { name:"Malacostraca",     danish:"Storkrebs",             rank:"KLAD",  desc:"Den største klasse af krebsdyr. Inkl. rejer, krabber og hummere." },
    { name:"Decapoda",         danish:"Tibenede krebsdyr",     rank:"KLAD",  desc:"Krebsdyr med ti gangben. Inkl. rejer, krabber, hummere og søkrebse." },
    { name:"Caridea",          danish:"Egentlige rejer",       rank:"KLAD",  desc:"Slanke kroppe, lange antenner og halet bagkrop. Inkl. hesterejer." },
    { name:"Crangonidae",      danish:"Sandrejefamilien",      rank:"KLAD",  desc:"Rejer med reduceret første klosaks. Lever i sandede habitater." },
    { name:"Crangon",          danish:"Sandrejer",             rank:"KLAD",  desc:"Grå-gennemsigtig farve giver fremragende kamuflage på sandbund." },
    { name:"Crangon crangon",  danish:"Hestereje",             rank:"ART",   desc:"Meget almindelig i Nordsøen og Østersøen. Vigtig kommerciel art og fødekæde-led." }
  ],

  // ── Blæksprutte ──────────────────────────────────────────
  "blæksprutte": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Lophotrochozoa",   danish:"Lophotrochozoa",        rank:"KLAD",  desc:"Stor gruppe protostomer inkl. bløddyr og ledorme. Søsterklade til Ecdysozoa." },
    { name:"Mollusca",         danish:"Bløddyr",               rank:"KLAD",  desc:"Oftest med skal, muskelrig fod og en kappe (mantle). ~85.000 arter." },
    { name:"Cephalopoda",      danish:"Blæksprutter",          rank:"KLAD",  desc:"Bløddyr med fod omdannet til tentakler rundt om hovedet. Meget intelligente." },
    { name:"Coleoidea",        danish:"Coleoidea",             rank:"KLAD",  desc:"Blæksprutter med intern eller ingen skal. Inkl. ottearme og tiarmede." },
    { name:"Octopodiformes",   danish:"Ottearmsblæksprutter",  rank:"KLAD",  desc:"Coleoidea med otte arme. Inkl. ottearme og vampyrblæksprutter." },
    { name:"Octopoda",         danish:"Ottearme",              rank:"KLAD",  desc:"Otte arme med sugekopper, blød formbar krop, ingen skjold." },
    { name:"Octopodidae",      danish:"Ottearme-familien",     rank:"KLAD",  desc:"Den største familie af ottearme. Benthiske jægere på havbunden." },
    { name:"Octopus",          danish:"Octopus-slægten",       rank:"KLAD",  desc:"Mesterlige camouflagekunstnere der kan ændre farve og tekstur på millisekunder." },
    { name:"Octopus vulgaris", danish:"Alm. blæksprutte",      rank:"ART",   desc:"Intelligent solitær jæger. Tre hjerner og blåt blod (hæmocyanin)." }
  ],

  // ── Blåhval ──────────────────────────────────────────────
  "hval": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Hvaler nedstammer fra landdyr — vendte sekundært tilbage til havet." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Fosterhinde beskytter embryoet." },
    { name:"Synapsida",        danish:"Synapsider",            rank:"KLAD",  desc:"Pattedyrenes evolutionære linje." },
    { name:"Mammalia",         danish:"Pattedyr",              rank:"KLAD",  desc:"Pels, mælkekirtler, varmblodede." },
    { name:"Placentalia",      danish:"Placentale pattedyr",   rank:"KLAD",  desc:"Ernærer fostre via moderkage." },
    { name:"Boreoeutheria",    danish:"Boreoeutheria",         rank:"KLAD",  desc:"Nordlige placentale pattedyr." },
    { name:"Laurasiatheria",   danish:"Laurasiatheria",        rank:"KLAD",  desc:"Opstod på Laurasia. Inkl. rovdyr, flagermus, hovdyr og hvaler." },
    { name:"Cetartiodactyla",  danish:"Klovdyr og hvaler",     rank:"KLAD",  desc:"Flodhestene er hvalernes nærmeste nulevende slægtning — en overraskende opdagelse fra DNA!" },
    { name:"Cetacea",          danish:"Hvaler",                rank:"KLAD",  desc:"Fuldstændigt akvatiske pattedyr der vendte tilbage til havet ~50 mya." },
    { name:"Mysticeti",        danish:"Bardehvaler",           rank:"KLAD",  desc:"Hvaler med bardeplader af keratin i stedet for tænder. Filtrerer krill og planktonfisk." },
    { name:"Balaenopteridae",  danish:"Finhvaler",             rank:"KLAD",  desc:"Slanke, hurtige bardehvaler med rygfinne. Inkl. fin-, sejval og blåhval." },
    { name:"Balaenoptera",     danish:"Finhvalslægten",        rank:"KLAD",  desc:"Den største slægt af finhvaler med seks arter." },
    { name:"Balaenoptera musculus", danish:"Blåhval",          rank:"ART",   desc:"Verdens største dyr nogensinde. Op til 33 m og 190 ton." }
  ],

  // ── Stor Regnorm ─────────────────────────────────────────
  "regnorm": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Lophotrochozoa",   danish:"Lophotrochozoa",        rank:"KLAD",  desc:"Stor gruppe inkl. bløddyr, ledorme m.fl. Søsterklade til Ecdysozoa." },
    { name:"Annelida",         danish:"Ledorme",               rank:"KLAD",  desc:"Segmenterede orme med leddelt krop og børster (chaetae). ~22.000 arter." },
    { name:"Clitellata",       danish:"Clitellata",            rank:"KLAD",  desc:"Ledorme med en kirtelsadel (clitellum) brugt til reproduktion. Inkl. regnorme og igler." },
    { name:"Oligochaeta",      danish:"Fåbørsteorme",          rank:"KLAD",  desc:"Clitellata med få børster pr. segment. Typisk i jord eller ferskvand." },
    { name:"Haplotaxida",      danish:"Haplotaxida",           rank:"KLAD",  desc:"Orden af fåbørsteorme. Indeholder de fleste kendte regnorme." },
    { name:"Lumbricidae",      danish:"Regnormefamilien",      rank:"KLAD",  desc:"Europæiske regnorme. Afgørende nedbrydere der løsner og beriger jordstrukturen." },
    { name:"Lumbricus",        danish:"Regnormeslægten",       rank:"KLAD",  desc:"Den mest kendte slægt. Globalt udbredt via menneskelig aktivitet." },
    { name:"Lumbricus terrestris", danish:"Stor regnorm",      rank:"ART",   desc:"Jordens travleste landmand — graver gange op til 2 m dybde og blander jordens næringsstoffer." }
  ],

  // ── Rød Skovmyre ─────────────────────────────────────────
  "myre": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Skifter hud. Inkl. leddyr og rundorme." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton, segmenteret krop, leddelte ben." },
    { name:"Hexapoda",         danish:"Seksbenet",             rank:"KLAD",  desc:"Arthropoda med seks ben. Inkl. insekter og collembola." },
    { name:"Insecta",          danish:"Insekter",              rank:"KLAD",  desc:"Tre kropsdele, seks ben, to antenner, oftest vinger. ~1 mio. kendte arter." },
    { name:"Hymenoptera",      danish:"Hvepse, bier og myrer", rank:"KLAD",  desc:"Insekter med membranvinger. Mange sociale arter med komplekse kolonier." },
    { name:"Apocrita",         danish:"Apocrita",              rank:"KLAD",  desc:"Hymenoptera med smal 'hvepsetalje'. Inkl. hvepse, bier og myrer." },
    { name:"Aculeata",         danish:"Brodinsekter",          rank:"KLAD",  desc:"Apocrita med en brod der sprøjter gift. Inkl. myrer, bier og hvepse." },
    { name:"Formicidae",       danish:"Myrer",                 rank:"KLAD",  desc:"Altid sociale. Estimeret 20.000 milliarder individer på Jorden i dag." },
    { name:"Formicinae",       danish:"Myreunderfamilien",     rank:"KLAD",  desc:"Myrer der sprøjter myresyre i stedet for at stikke med brod." },
    { name:"Formica",          danish:"Skovmyreslægten",       rank:"KLAD",  desc:"Bygger store myretuer af kviste og nåle. Afgørende for skovøkosystemer." },
    { name:"Formica rufa",     danish:"Rød skovmyre",          rank:"ART",   desc:"Koloni med op til 500.000 individer der forsvarer et territorium på hundredevis af m²." }
  ],

  // ── Mørk Jordhumle ───────────────────────────────────────
  "humlebi": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Skifter hud." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton." },
    { name:"Hexapoda",         danish:"Seksbenet",             rank:"KLAD",  desc:"Arthropoda med seks ben." },
    { name:"Insecta",          danish:"Insekter",              rank:"KLAD",  desc:"Tre kropsdele, seks ben, oftest vinger." },
    { name:"Hymenoptera",      danish:"Hvepse, bier og myrer", rank:"KLAD",  desc:"Membranvingede insekter med mange sociale arter." },
    { name:"Apocrita",         danish:"Apocrita",              rank:"KLAD",  desc:"Hvepsetalje. Inkl. bier og myrer." },
    { name:"Aculeata",         danish:"Brodinsekter",          rank:"KLAD",  desc:"Giftig brod." },
    { name:"Apidae",           danish:"Bier (Apidae)",         rank:"KLAD",  desc:"Den store bifamilie inkl. humlebier, honningbier og enlige bier." },
    { name:"Bombus",           danish:"Humlebier",             rank:"KLAD",  desc:"Pelsbeklædte, kolde-tolerante sociale bier. Vigtige bestøvere i kolde klimaer." },
    { name:"Bombus terrestris",danish:"Mørk jordhumle",        rank:"ART",   desc:"En af Europas mest almindelige bestøvere. Buzz-pollination frigiver pollen ved vibration." }
  ],

  // ── Korsedderkop ─────────────────────────────────────────
  "edderkop": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Skifter hud." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton." },
    { name:"Chelicerata",      danish:"Chelicerater",          rank:"KLAD",  desc:"Kloformede munddele (chelicerae), ingen mandiblar, ingen antenner." },
    { name:"Arachnida",        danish:"Spindlere",             rank:"KLAD",  desc:"Chelicerata på land med otte ben og to kropsdele. ~100.000 beskrevne arter." },
    { name:"Araneae",          danish:"Edderkopper",           rank:"KLAD",  desc:"Spindlere med spindekirtler og giftkirtler. ~47.000 arter. Alle er rovdyr." },
    { name:"Araneomorphae",    danish:"Ægte edderkopper",      rank:"KLAD",  desc:"Edderkopper med diagonalt krydsende giftkirtler. Udgør >90 % af alle edderkoppearter." },
    { name:"Araneidae",        danish:"Hjulspind-edderkopper", rank:"KLAD",  desc:"Bygger de klassiske cirkulære orb-webs. ~3.000 arter." },
    { name:"Araneus",          danish:"Hjulspind-slægten",     rank:"KLAD",  desc:"Europæiske hjulspindsedderkopper. Sidder i midten af nettet om natten." },
    { name:"Araneus diadematus",danish:"Korsedderkop",         rank:"ART",   desc:"Hvid kors-aftegning på bagkroppen. Meget almindelig i Europa om efteråret." }
  ],

  // ── Torsk ────────────────────────────────────────────────
  "torsk": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Osteichthyes",     danish:"Benfisk",               rank:"KLAD",  desc:"Fisk med benknogler. Udgør >96 % af alle fiskearter." },
    { name:"Actinopterygii",   danish:"Strålefinnede fisk",    rank:"KLAD",  desc:"Benfisk med finner støttet af benstrålor. ~30.000 arter — den artsrigeste gruppe af hvirveldyr." },
    { name:"Teleostei",        danish:"Benpladefisk",          rank:"KLAD",  desc:"Avancerede benfisk med bevægeligt overkæbeapparat. Dominerer marine og ferskvands habitater." },
    { name:"Paracanthomorphacea",danish:"Paracanthomorphacea", rank:"KLAD",  desc:"Stor gruppe inkl. torsk, kvabbe og barsefisk." },
    { name:"Gadiformes",       danish:"Torskefisk",            rank:"KLAD",  desc:"Koldtvandsadapterede benfisk. Afgørende for den nordatlantiske fiskeriindustri." },
    { name:"Gadidae",          danish:"Torskefamilien",        rank:"KLAD",  desc:"Torsk, sej, kuller og hvilling. Primært Nordatlantens og Nordpolarhavet." },
    { name:"Gadus",            danish:"Torske-slægten",        rank:"KLAD",  desc:"Fire nordatlantiske torskarter." },
    { name:"Gadus morhua",     danish:"Torsk",                 rank:"ART",   desc:"En af historiens vigtigste kommercielle fisk. Kraftigt decimeret af overfiskeri." }
  ],

  // ── Hvidhaj ──────────────────────────────────────────────
  "hvidhaj": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Opisthokonta",     danish:"Opisthokonta",          rank:"KLAD",  desc:"Svampe og dyr." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Chondrichthyes",   danish:"Bruskfisk",             rank:"KLAD",  desc:"Fisk med brusk-skelet. Inkl. hajer og rokker. Meget gammel evolutionær linje (~450 mya)." },
    { name:"Elasmobranchii",   danish:"Hajer og rokker",       rank:"KLAD",  desc:"Bruskfisk med 5–7 gællespalter og hud dækket af dermalrikler (placoidsskæl)." },
    { name:"Selachii",         danish:"Hajer",                 rank:"KLAD",  desc:"Elasmobranchii med torpedoformet krop. ~500 nulevende arter." },
    { name:"Lamniformes",      danish:"Sildehajer",            rank:"KLAD",  desc:"Store, aktive og varmblodede hajer. Inkl. hvid-, makrel- og kæmpehai." },
    { name:"Lamnidae",         danish:"Makrellhajfamilien",    rank:"KLAD",  desc:"Strømlinet krop med halvmåneformet halefinne. Apex-prædatorer." },
    { name:"Carcharodon",      danish:"Hvidhajslægten",        rank:"KLAD",  desc:"Monotypisk slægt — kun hvidhaj er nulevende. Muligvis beslægtet med den uddøde megalodon." },
    { name:"Carcharodon carcharias",danish:"Hvidhaj",          rank:"ART",   desc:"Havets ultimative apex-prædator. Op til 6 m. Elektroreceptorer i snuden registrerer byttet." }
  ],

  // ── Grøn Leguan ──────────────────────────────────────────
  "leguan": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Hvirveldyr med fire lemmer." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Fosterhinde beskytter embryoet." },
    { name:"Sauropsida",       danish:"Sauropsider (Reptilia)",rank:"KLAD",  desc:"Inkl. alle reptiler OG fugle. Søsterklade til Synapsida (pattedyr)." },
    { name:"Lepidosauria",     danish:"Skælkrybdyr",           rank:"KLAD",  desc:"Overlappende skæl og periodisk hudskift. Inkl. øgler og slanger." },
    { name:"Squamata",         danish:"Skælklædte",            rank:"KLAD",  desc:"Den artsrigeste orden af reptiler. Inkl. øgler og slanger (~10.000 arter)." },
    { name:"Iguania",          danish:"Iguanaer",              rank:"KLAD",  desc:"Primært planteædende øgler fra Amerika og Madagaskar." },
    { name:"Iguanidae",        danish:"Iguanafamilien",        rank:"KLAD",  desc:"Store planteædende øgler fra Central- og Sydamerika." },
    { name:"Iguana",           danish:"Iguanaslægten",         rank:"KLAD",  desc:"To store tropiske iguanaarter med karakteristisk kam langs ryggen." },
    { name:"Iguana iguana",    danish:"Grøn leguan",           rank:"ART",   desc:"Op til 2 m lang. Fremragende klatrere i regnskovens trækroner. Primært planteæder." }
  ],

  // ── Hugorm ───────────────────────────────────────────────
  "slange": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Slanger nedstammer fra firebenede forfædre og mistede lemmerne sekundært." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Fosterhinde beskytter embryoet." },
    { name:"Sauropsida",       danish:"Sauropsider (Reptilia)",rank:"KLAD",  desc:"Inkl. alle reptiler og fugle." },
    { name:"Lepidosauria",     danish:"Skælkrybdyr",           rank:"KLAD",  desc:"Overlappende skæl og periodisk hudskift." },
    { name:"Squamata",         danish:"Skælklædte",            rank:"KLAD",  desc:"Øgler og slanger. Den artsrigeste orden af reptiler." },
    { name:"Serpentes",        danish:"Slanger",               rank:"KLAD",  desc:"Øgler der sekundært mistede lemmerne. ~3.700 arter. Alle er rovdyr." },
    { name:"Caenophidia",      danish:"Caenophidia",           rank:"KLAD",  desc:"Avancerede slanger med én lunge og oftest giftige. Udgør de fleste slangearter." },
    { name:"Viperidae",        danish:"Hugormefamilien",        rank:"KLAD",  desc:"Lange, foldelige gifttænder. Trekantet hoved og lodrette pupiller." },
    { name:"Vipera",           danish:"Egentlige hugorme",      rank:"KLAD",  desc:"Europæiske og asiatiske hugorme tilpasset kolde klimaer." },
    { name:"Vipera berus",     danish:"Hugorm",                rank:"ART",   desc:"Danmarks eneste giftige slange med karakteristisk siksak-mønster langs ryggen." }
  ],

  // ── Komodovaran ──────────────────────────────────────────
  "komodovaran": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Hvirveldyr med fire lemmer." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Fosterhinde beskytter embryoet." },
    { name:"Sauropsida",       danish:"Sauropsider (Reptilia)",rank:"KLAD",  desc:"Inkl. alle reptiler og fugle." },
    { name:"Lepidosauria",     danish:"Skælkrybdyr",           rank:"KLAD",  desc:"Overlappende skæl og periodisk hudskift." },
    { name:"Squamata",         danish:"Skælklædte",            rank:"KLAD",  desc:"Øgler og slanger." },
    { name:"Toxicofera",       danish:"Toxicofera",            rank:"KLAD",  desc:"Squamata med giftkirtler. Inkl. slanger, varanere og agamer." },
    { name:"Anguimorpha",      danish:"Anguimorpha",           rank:"KLAD",  desc:"Gruppen af øgler inkl. varanere og stålorme. Kendetegnes ved bifurkeret tunge." },
    { name:"Varanidae",        danish:"Varanfamilien",         rank:"KLAD",  desc:"Store intelligente prædatorøgler med lang gaffeltunge og kraftige kræfter." },
    { name:"Varanus",          danish:"Varanslægten",          rank:"KLAD",  desc:"Over 80 arter på tværs af Afrika, Asien og Australien." },
    { name:"Varanus komodoensis",danish:"Komodovaran",         rank:"ART",   desc:"Verdens største nulevende øgle. Op til 3 m og 70 kg. Giftkirtler i underkæben." }
  ],

  // ── Kejserskorpion ───────────────────────────────────────
  "skorpion": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Skifter hud." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton." },
    { name:"Chelicerata",      danish:"Chelicerater",          rank:"KLAD",  desc:"Kloformede munddele, ingen mandiblar, ingen antenner." },
    { name:"Arachnida",        danish:"Spindlere",             rank:"KLAD",  desc:"Otte ben, to kropsdele. Inkl. edderkopper, skorpioner, mejere og mider." },
    { name:"Scorpiones",       danish:"Skorpioner",            rank:"KLAD",  desc:"Spindlere med gribetænger (pedipalps) og giftbrod i halen. ~2.600 arter." },
    { name:"Iurida",           danish:"Iurida",                rank:"KLAD",  desc:"Den artsrigeste overorden af skorpioner." },
    { name:"Scorpionidae",     danish:"Kejserskorpionfamilien",rank:"KLAD",  desc:"Store tropiske skovsko-rpioner med relativt mild gift." },
    { name:"Pandinus",         danish:"Pandinus-slægten",      rank:"KLAD",  desc:"Afrikanske skovsko-rpioner. Blandt de største skorpioner i verden." },
    { name:"Pandinus imperator",danish:"Kejserskorpion",       rank:"ART",   desc:"Op til 20 cm. Gift er relativt mild. Lyser blågrønt under UV-lys (fluorescens)." }
  ],

  // ── Almindelig Mejer ─────────────────────────────────────
  "mejer": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Skifter hud." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton." },
    { name:"Chelicerata",      danish:"Chelicerater",          rank:"KLAD",  desc:"Kloformede munddele, ingen mandiblar." },
    { name:"Arachnida",        danish:"Spindlere",             rank:"KLAD",  desc:"Otte ben, to kropsdele." },
    { name:"Opiliones",        danish:"Mejere",                rank:"KLAD",  desc:"Sammensmeltet krop (ingen synlig 'talje'), ingen spind, ingen gift. ~6.700 arter." },
    { name:"Eupnoi",           danish:"Eupnoi",                rank:"KLAD",  desc:"Mejere med ekstremt lange ben hos mange arter. Inkl. Phalangiidae." },
    { name:"Phalangiidae",     danish:"Egentlige mejere",      rank:"KLAD",  desc:"Den mest artsrige mejerfamilie. Ekstremt lange spinkle ben." },
    { name:"Phalangium",       danish:"Phalangium-slægten",    rank:"KLAD",  desc:"Meget almindelige europæiske mejere på mure, hegn og i vegetation." },
    { name:"Phalangium opilio",danish:"Alm. mejer",            rank:"ART",   desc:"Ben op til 5 cm på en 3–9 mm krop. Spiser insekter, svampe og organisk materiale." }
  ],

  // ── Skovflåt ─────────────────────────────────────────────
  "skovflat": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Protostomia",      danish:"Protostomer",           rank:"KLAD",  desc:"Mundåbningen dannes først." },
    { name:"Ecdysozoa",        danish:"Hudskiftende dyr",      rank:"KLAD",  desc:"Skifter hud." },
    { name:"Arthropoda",       danish:"Leddyr",                rank:"KLAD",  desc:"Eksternt kitinskeleton." },
    { name:"Chelicerata",      danish:"Chelicerater",          rank:"KLAD",  desc:"Kloformede munddele, ingen mandiblar." },
    { name:"Arachnida",        danish:"Spindlere",             rank:"KLAD",  desc:"Otte ben, to kropsdele." },
    { name:"Acari",            danish:"Mider og flåter",       rank:"KLAD",  desc:"Meget diverse spindlere med sammensmeltet krop. ~55.000 beskrevne arter." },
    { name:"Parasitiformes",   danish:"Parasitiforme mider",   rank:"KLAD",  desc:"Store mider inkl. flåter der parasiterer på hvirveldyr." },
    { name:"Ixodida",          danish:"Flåter",                rank:"KLAD",  desc:"Obligatoriske blodparasitter på hvirveldyr. Kan overføre mange alvorlige sygdomme." },
    { name:"Ixodidae",         danish:"Hårde flåter",          rank:"KLAD",  desc:"Flåter med et hårdt skjold (scutum). Vektor for borrelia og TBE." },
    { name:"Ixodes",           danish:"Skovflåtslægten",       rank:"KLAD",  desc:"Den epidemiologisk vigtigste flåtslægt. Overfører Lyme borreliose og hjernebetændelse (TBE)." },
    { name:"Ixodes ricinus",   danish:"Skovflåt",              rank:"ART",   desc:"Den mest udbredte flåt i Europa. Suger blod i tre livsstadier." }
  ],

  // ── Næbdyr ───────────────────────────────────────────────
  "naebdyr": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Metazoa",          danish:"Dyr (flercellede)",     rank:"KLAD",  desc:"Alle flercellede dyr." },
    { name:"Bilateria",        danish:"Bilaterale dyr",        rank:"KLAD",  desc:"Bilateral symmetri." },
    { name:"Deuterostomia",    danish:"Deuterostomer",         rank:"KLAD",  desc:"Gataåbningen dannes sidst." },
    { name:"Chordata",         danish:"Rygstrengsdyr",         rank:"KLAD",  desc:"Har notochord." },
    { name:"Vertebrata",       danish:"Hvirveldyr",            rank:"KLAD",  desc:"Har rygsøjle." },
    { name:"Gnathostomata",    danish:"Kæbedyr",               rank:"KLAD",  desc:"Bevægelig underkæbe." },
    { name:"Tetrapoda",        danish:"Firbenede",             rank:"KLAD",  desc:"Hvirveldyr med fire lemmer." },
    { name:"Amniota",          danish:"Amnioter",              rank:"KLAD",  desc:"Fosterhinde beskytter embryoet." },
    { name:"Synapsida",        danish:"Synapsider",            rank:"KLAD",  desc:"Pattedyrenes evolutionære linje med ét tindingshul." },
    { name:"Mammalia",         danish:"Pattedyr",              rank:"KLAD",  desc:"Pels, mælkekirtler, varmblodede." },
    { name:"Monotremata",      danish:"Kloakdyr",              rank:"KLAD",  desc:"Den mest basale og arkaiske gren af nulevende pattedyr. Lægger æg — adskilte sig fra andre pattedyr >166 mya." },
    { name:"Ornithorhynchidae",danish:"Næbdyrfamilien",        rank:"KLAD",  desc:"Monotypisk familie — kun én nulevende art. En evolutionær levende fossil." },
    { name:"Ornithorhynchus",  danish:"Næbdyrslægten",         rank:"KLAD",  desc:"'Fuglenæb' på græsk — reference til det karakteristiske andesnabel-lignende næb." },
    { name:"Ornithorhynchus anatinus",danish:"Næbdyr",          rank:"ART",   desc:"Æglæggende pattedyr med elektroreceptorer i næbbet og giftsporer på hannernes bagben." }
  ],

  // ── E. coli ──────────────────────────────────────────────
  "ecoli": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden, nedstammer fra LUCA." },
    { name:"Bacteria",         danish:"Bakterier",             rank:"KLAD",  desc:"Prokaryoter uden cellekerne. Millioner af arter. Allestedsnærværende på Jorden." },
    { name:"Pseudomonadota",   danish:"Proteobakterier",       rank:"KLAD",  desc:"Den artsrigeste gruppe af gram-negative bakterier. Mange vigtige patogener og symbioter." },
    { name:"Gammaproteobacteria",danish:"Gammaproteobakterier",rank:"KLAD",  desc:"Inkl. mange medicinske vigtige slægter som Escherichia, Salmonella og Vibrio." },
    { name:"Enterobacterales", danish:"Enterobakterier",       rank:"KLAD",  desc:"Stavformede gram-negative bakterier der oftest lever i tarmen hos dyr." },
    { name:"Enterobacteriaceae",danish:"Tarmbakteriefamilien", rank:"KLAD",  desc:"Inkl. tarmflorabakterier og patogener som Salmonella og Shigella." },
    { name:"Escherichia",      danish:"Escherichia-slægten",   rank:"KLAD",  desc:"Opkaldt efter Theodor Escherich. Gram-negative stavbakterier." },
    { name:"Escherichia coli", danish:"E. coli",               rank:"ART",   desc:"Den mest undersøgte modelorganisme i biologi. Producerer K2-vitamin i tyktarmen." }
  ],

  // ── Sulfolobus ───────────────────────────────────────────
  "sulfolobus": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Archaea",          danish:"Arkæer",                rank:"KLAD",  desc:"Prokaryoter der biokemisk er tættere på eukaryoter end på bakterier. Opstod ~3,5 mia. år siden." },
    { name:"Thermoproteota",   danish:"Thermoproteota",        rank:"KLAD",  desc:"Arkæer med mange termofile (varmeelskende) og hyperthermofile arter." },
    { name:"Thermoprotei",     danish:"Thermoprotei",          rank:"KLAD",  desc:"Klasse af ekstremofile arkæer typisk fundet i vulkanske varme vandkilder." },
    { name:"Sulfolobales",     danish:"Sulfolobales",          rank:"KLAD",  desc:"Orden af thermoacidofile arkæer der lever i svovlholdige, kogende, sure miljøer." },
    { name:"Sulfolobaceae",    danish:"Sulfolobaceae",         rank:"KLAD",  desc:"Irregulært lobede celler. Lever optimalt ved 75–80°C og pH 2–3." },
    { name:"Sulfolobus",       danish:"Sulfolobus-slægten",    rank:"KLAD",  desc:"Beskrevet i 1972. Afgørende modelorganisme for studiet af DNA-reparation i arkæer." },
    { name:"Sulfolobus acidocaldarius",danish:"Sulfolobus",    rank:"ART",   desc:"Lever i kogende svovlsyre ved 80°C og pH 2. Besidder unikke arkæa-vira." }
  ],

  // ── Rose ─────────────────────────────────────────────────
  "rose": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Archaeplastida",   danish:"Archaeplastida",        rank:"KLAD",  desc:"Eukaryoter med fotosyntese via primær endosymbiose med cyanobakterie. Inkl. grønalger og planter." },
    { name:"Viridiplantae",    danish:"Grønne planter",        rank:"KLAD",  desc:"Arkæplastider med klorofyl a og b. Inkl. grønalger og alle landplanter." },
    { name:"Streptophyta",     danish:"Streptophyta",          rank:"KLAD",  desc:"Viridiplantae inkl. ferskvandets charalger og alle landplanter." },
    { name:"Embryophyta",      danish:"Landplanter",           rank:"KLAD",  desc:"Planter der reproducerer med beskyttede fostre (embryoner). Koloniserede land ~470 mya." },
    { name:"Tracheophyta",     danish:"Karplanter",            rank:"KLAD",  desc:"Landplanter med et veludviklet ledningssystem (xylem og phloem)." },
    { name:"Spermatophyta",    danish:"Frøplanter",            rank:"KLAD",  desc:"Karplanter der reproducerer via frø. Dominerer landjordens vegetation." },
    { name:"Angiospermae",     danish:"Blomsterplanter",       rank:"KLAD",  desc:"Frøplanter med blomster og frø i frugter. Den artsrigeste planteklasse (~300.000 arter)." },
    { name:"Eudicotyledones",  danish:"Ægte tokimbladede",     rank:"KLAD",  desc:"Blomsterplanter med tri-aperturate pollen og netformet bladåremønster." },
    { name:"Rosidae",          danish:"Rosider",               rank:"KLAD",  desc:"Stor gruppe eudicotyledoner. Inkl. roser, æbler, bønner og mange træer." },
    { name:"Rosales",          danish:"Rosenordenen",          rank:"KLAD",  desc:"Rosider inkl. rosenfamilien, hampfamilien og morbærfamilien." },
    { name:"Rosaceae",         danish:"Rosenfamilien",         rank:"KLAD",  desc:"Træer, buske og urter med femtallige symmetriske blomster. Inkl. æble, pære og jordbær." },
    { name:"Rosa",             danish:"Roser",                 rank:"KLAD",  desc:"Tornede buske med store, duftende blomster. ~100 vildarter plus tusindvis af kultivarer." },
    { name:"Rosa 'Precious Platinum'",danish:"Rose 'Precious Platinum'", rank:"ART", desc:"Hybrid Tea-rose fremavlet 1974. Store blodrøde blomster og høj sygdomsresistens." }
  ],

  // ── Kaffebusk ────────────────────────────────────────────
  "kaffe": [
    { name:"Biota",            danish:"Livet på Jorden",       rank:"BIOTA", desc:"Alt liv på Jorden." },
    { name:"Eukaryota",        danish:"Eukaryoter",            rank:"KLAD",  desc:"Organismer med membranbundet cellekerne." },
    { name:"Archaeplastida",   danish:"Archaeplastida",        rank:"KLAD",  desc:"Eukaryoter med fotosyntese via primær endosymbiose." },
    { name:"Viridiplantae",    danish:"Grønne planter",        rank:"KLAD",  desc:"Inkl. grønalger og alle landplanter." },
    { name:"Streptophyta",     danish:"Streptophyta",          rank:"KLAD",  desc:"Inkl. landplanter." },
    { name:"Embryophyta",      danish:"Landplanter",           rank:"KLAD",  desc:"Planter med beskyttede fostre." },
    { name:"Tracheophyta",     danish:"Karplanter",            rank:"KLAD",  desc:"Med veludviklet ledningssystem." },
    { name:"Spermatophyta",    danish:"Frøplanter",            rank:"KLAD",  desc:"Reproducerer via frø." },
    { name:"Angiospermae",     danish:"Blomsterplanter",       rank:"KLAD",  desc:"Med blomster og frø i frugter." },
    { name:"Eudicotyledones",  danish:"Ægte tokimbladede",     rank:"KLAD",  desc:"Netformet bladåremønster." },
    { name:"Asteridae",        danish:"Asterider",             rank:"KLAD",  desc:"Stor gruppe eudicotyledoner. Inkl. kartofler, tomater og kaffefamilien." },
    { name:"Gentianales",      danish:"Ensianordenen",         rank:"KLAD",  desc:"Asterider inkl. krapfamilien (Rubiaceae) der rummer kaffe." },
    { name:"Rubiaceae",        danish:"Kaffefamilien",         rank:"KLAD",  desc:"Stor plantefamilie med modsatte blade. Inkl. kaffe og kinabark (kinin)." },
    { name:"Coffea",           danish:"Kaffebuske",            rank:"KLAD",  desc:"Buske og småtræer fra tropisk Afrika og Asien. Producerer de berømte kaffebær." },
    { name:"Coffea arabica",   danish:"Kaffebusk (Arabica)",   rank:"ART",   desc:"Udgør ~60 % af verdensproduktionen. Stammer fra Etiopiens højland. Mild og kompleks smag." }
  ]
};
