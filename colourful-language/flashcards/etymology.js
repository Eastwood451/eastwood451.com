// Editorial Danish summaries of the linked dictionary entries, checked 2026-10-02.
// Stage periods describe languages, never the date on which a particular word was coined.
export const HISTORY_STAGES = {
  pie: ["Urindoeuropæisk", "Forhistorisk; datering omstridt"],
  pg: ["Urgermansk", "Før og omkring begyndelsen af vores tidsregning"],
  pwg: ["Urvestgermansk", "Før de vestgermanske skriftlige kilder"],
  on: ["Oldnordisk", "Ca. 800–1300"], od: ["Gammeldansk", "Middelalderen"],
  os: ["Oldsaksisk", "Ca. 800–1100"], mlg: ["Middelnedertysk", "Ca. 1100–1600"],
  of: ["Oldfransk", "Ca. 800–1400"], mhg: ["Middelhøjtysk", "Ca. 1050–1350"],
  de: ["Tysk", "Nyere tid"], fr: ["Fransk", "Nyere tid"], pl: ["Polsk", "Fra middelalderen"],
  myc: ["Mykensk græsk", "2. årtusinde f.v.t."], ag: ["Oldgræsk", "1. årtusinde f.v.t."],
  koine: ["Koinégræsk", "Ca. 300 f.v.t.–600 e.v.t."], mg: ["Middelaldergræsk", "Ca. 600–1453"],
  ph: ["Urgræsk", "Før de græske skriftlige kilder"],
  pi: ["Uritalisk", "Før de italiske skriftlige kilder"], la: ["Latin", "Oldtiden; senere også lærdomssprog"],
  vl: ["Vulgærlatin", "Romersk tid og tidlig middelalder"], it: ["Italiensk", "Fra middelalderen"],
  pc: ["Urkeltisk", "Før de keltiske skriftlige kilder"],
  ps: ["Urslavisk", "Før og i det 1. årtusinde e.v.t."], pbs: ["Urbaltoslavisk", "Forhistorisk"],
  oes: ["Oldøstslavisk", "Ca. 900–1400"], ocs: ["Oldkirkeslavisk", "Fra 800-tallet"],
  ot: ["Osmannisk tyrkisk", "Ca. 1300–1900"], cp: ["Persisk", "Middelalderen og senere"],
  turk: ["Tidlige tyrkiske sprog", "Før og i middelalderen; konkret sprog usikkert"],
  mp: ["Middelpersisk", "Oldtiden og tidlig middelalder"], iran: ["Iranske sprog", "Oldtiden; mellemled usikre"],
  sem: ["Ursemitisk", "Forhistorisk; datering usikker"], ws: ["Urvestsemitisk", "Før de vestsemitiske skriftlige kilder"],
  akk: ["Akkadisk", "Oldtidens Mesopotamien"], sum: ["Sumerisk", "Oldtidens Mesopotamien"],
  aram: ["Aramæisk", "Oldtiden og senere"], arOld: ["Klassisk arabisk", "Oldtid og middelalder"],
  pj: ["Urjapansk", "Før de japanske skriftlige kilder"], oj: ["Oldjapansk", "700-tallet"],
  jhist: ["Historisk japansk", "Efter oldjapansk; flere lydstadier"], mc: ["Middelkinesisk", "Ca. 600–1000; rekonstrueret udtale"],
  oe: ["Oldengelsk", "Ca. 450–1100"], me: ["Middelengelsk", "Ca. 1100–1500"], en: ["Engelsk", "Nyere tid"],
  da: ["Dansk", "Nutid"], el: ["Græsk", "Nutid"], ar: ["Arabisk", "Nutidens standardsprog"],
  ja: ["Japansk", "Nutid"], sr: ["Serbisk", "Nutid"], ru: ["Russisk", "Nutid"]
};

export const WORD_HISTORIES = {};
const wiki = (term) => "https://en.wiktionary.org/wiki/" + term.split("/").map(encodeURIComponent).join("/");
function add(code, id, summary, steps, boundary, terms, relatives = "") {
  WORD_HISTORIES[code + ":" + id] = {
    summary, boundary, relatives,
    steps: steps.map(([stage, form, change, kind = "arv", reading = "", uncertain = false]) => ({
      stage, form, change, kind, reading,
      status: uncertain ? "hypothesis" : form.startsWith("*") || stage === "mc" || stage === "jhist" ? "reconstructed" : "attested"
    })),
    sources: [...new Set(terms)].map((term) => ({ label: "Wiktionary · " + term, url: wiki(term) }))
  };
}
const stop = "Den ældste form er allerede et ord i et sprog. Vi kender ikke den første ytring eller grunden til, at netop disse lyde fik denne betydning.";
const unclear = "Ophavet før dette led er uafklaret. Forslag til en ældre rod er ikke en dokumenteret kæde tilbage til menneskets første lyde.";

add("da", "sword", "Et nedarvet germansk ord, hvis slutning gradvist forsvandt.", [
  ["pg", "*swerdą", "Rekonstrueret germansk navn for sværd."],
  ["on", "sverð", "Den gamle endevokal falder bort; ð betegner en stemt friktionslyd."],
  ["od", "swærth", "Gammeldansk skrivemåde; th skal ikke læses som nutidens danske t+h."],
  ["da", "sværd", "Slutkonsonanten er forsvundet i almindelig moderne udtale, mens d stadig skrives.", "arv", "[ˈsʋɛˀɐ̯]"]
], unclear, ["sværd", "Reconstruction:Proto-Germanic/swerdą"], "Engelsk sword og tysk Schwert er søsterord, ikke mellemled på vejen til dansk.");
add("da", "knife", "Kniv og engelsk knife har fælles germansk ophav.", [
  ["pg", "*knībaz", "Rekonstrueret germansk form. En forbindelse med *gneybʰ- er foreslået; den tidligste orddannelse er usikker."],
  ["on", "knífr", "Endelsen ændres til -r; f mellem stemte lyde kan have v-agtig udtale."],
  ["od", "knif", "Kasusendelsen -r falder bort."],
  ["da", "kniv", "Den lange i-lyd og k+n bevares; slutlyden skrives v.", "arv", "[kʰniwˀ]"]
], unclear, ["kniv", "Reconstruction:Proto-Germanic/knībaz"]);
add("da", "fork", "Gaffel kom til dansk gennem nedertysk.", [
  ["pwg", "*gabulu", "Rekonstrueret ord for et forgrenet redskab."],
  ["os", "gafala", "Den indre konsonant er blevet en friktionslyd; vokalerne har ændret sig."],
  ["mlg", "gaffel / gaffele", "Ubetonede vokaler svækkes; ordet får sin middelalderlige form."],
  ["da", "gaffel", "Dansk låner ordet. Skriftens -el udtales ofte med stavelsesbærende l.", "lån", "[ˈɡ̊äfl̩]"]
], unclear, ["gaffel"]);
add("da", "plate", "Tallerken er et lånt ord, der oprindelig betød en lille tallerken.", [
  ["mlg", "tallorken", "-ken er en diminutivendelse: en lille tallerken."],
  ["da", "tallerken", "Ord og endelse lånes samlet; vokaler og tryk tilpasses dansk.", "lån", "[tˢæˈlɛɐ̯ɡ̊ŋ̩]"]
], "Det sikre låneled her er nedertysk. En længere historie kræver særskilt dokumentation af tallor; vi gør ikke moderne tysk Tellerchen til et historisk mellemled.", ["tallerken"]);
add("da", "paper", "Papir har navn efter papyrusplanten og kom gennem flere europæiske sprog.", [
  ["ag", "πάπυρος", "Navnet på papyrusplanten og dens skrivemateriale.", "arv", "pápyros"],
  ["la", "papȳrus", "Latin låner plantenavnet fra græsk.", "lån"],
  ["of", "papier", "En afledt fransk form bliver navn på skrivematerialet.", "orddannelse"],
  ["mlg", "papir / pappir", "Fransk ord lånes og tilpasses nedertysk.", "lån"],
  ["da", "papir", "Dansk låner den nedertyske form med lang i-lyd.", "lån", "[pʰaˈpʰiːˀɐ̯]"]
], "Græsk pápyros har ukendt ophav. Et egyptisk ophav er foreslået, men vi kender ikke et sikkert egyptisk forlæg.", ["papir", "papier", "πάπυρος"]);
add("da", "metal", "Et internationalt låneord, der går tilbage til et græsk ord for mine eller stenbrud.", [
  ["ag", "μέταλλον", "Betød mine eller stenbrud; også metal i senere græsk.", "arv", "métallon"],
  ["la", "metallum", "Græsk -on tilpasses latinsk -um.", "lån"],
  ["da", "metal", "Det internationale ord mister den antikke bøjningsendelse. Det konkrete sidste lånesprog fastlægges ikke her.", "overblik"]
], "Ophavet til græsk métallon er omstridt. Historien stopper ved dette ord; en forbindelse med et verbum for at søge er ikke sikker.", ["metal", "metallum", "μέταλλον"]);
add("da", "salt", "Et meget gammelt ord, med søsterformer i flere indoeuropæiske grene.", [
  ["pie", "*sḗh₂l", "Rekonstrueret ord for salt; h₂ er en hypotetisk konsonant, ikke et kendt grynt."],
  ["pg", "*saltą", "En germansk t-udvidelse og bøjningsendelse giver salt-stammen.", "orddannelse"],
  ["on", "salt", "Endelsen falder bort."],
  ["da", "salt", "Stammen overlever i dansk; identisk stavning betyder ikke identisk udtale gennem tiderne."]
], stop, ["salt", "Reconstruction:Proto-Germanic/saltą", "sal"], "Latinsk sāl, græsk háls og slavisk solь er beslægtede grene.");
add("da", "water", "Vand skjuler et gammelt ord med skiftende r- og n-stammer.", [
  ["pie", "*wódr̥", "Rekonstrueret vandord med r/n-bøjning; r̥ betyder et stavelsesbærende r."],
  ["pg", "*watōr", "Germansk har t svarende til indoeuropæisk d; bøjningen havde også en n-stamme."],
  ["on", "vatn", "Nordisk viderefører n-stammen. Vatn er ikke blot watōr med en tilfældig r→n-ændring."],
  ["od", "watn / wand", "Konsonantrækkefølgen ændres: tn bliver til nt/nd, med flere skrevne varianter."],
  ["da", "vand", "d står i skriften, men udtales ikke som en selvstændig d-lyd.", "arv", "[ˈʋænˀ]"]
], stop, ["vand", "Reconstruction:Proto-Germanic/watōr"], "Russisk voda er en beslægtet gren. Latinsk aqua er et andet vandord.");
add("da", "food", "Mad er et gammelt germansk ord; dets engelske søster meat har indsnævret betydningen til kød.", [
  ["pg", "*matiz", "Rekonstrueret ord for mad."],
  ["on", "matr", "De ubetonede lyde i endelsen reduceres; nominativ slutter på -r."],
  ["da", "mad", "-r falder bort, og t svækkes til dansk blødt d.", "arv", "[ˈmæð̠˕ˠ]"]
], unclear, ["mad", "Reconstruction:Proto-Germanic/matiz"], "Engelsk meat er beslægtet med mad; engelsk food har en anden rod.");
add("da", "bear", "Bjørn har en germansk historie; forklaringen »den brune« er en hypotese om et endnu ældre ophav.", [
  ["pg", "*bernuz", "Nordlig germansk form, knyttet til *berô. Den ofte nævnte rod for brun er omstridt."],
  ["on", "bjǫrn", "Nordisk brydning og vokalpåvirkning giver bj- og en rundet vokal."],
  ["od", "biørn / biorn", "Middelalderlige danske stavemåder."],
  ["da", "bjørn", "Vokal og r-udtale ændres yderligere; stammen bevares.", "arv", "[ˈb̥jœɐ̯ˀn]"]
], "Det germanske ord kan muligvis betyde »den brune« og være en tabu-erstatning. Der findes andre etymologier; hverken motivet eller den første navngivning er sikkert kendt.", ["bjørn", "bear"]);
add("da", "wolf", "Ulv har mistet den begyndelseslyd, som engelsk wolf stadig har.", [
  ["pie", "*wĺ̥kʷos", "Rekonstrueret indoeuropæisk ulveord."],
  ["pg", "*wulfaz", "Germanske lydskift og vokaludvikling giver wulf-stammen."],
  ["on", "úlfr", "Begyndelses-w falder bort foran den rundede u-vokal; endelsen reduceres."],
  ["da", "ulv", "-r forsvinder, og friktionslyden skrives v."]
], stop, ["ulv", "wolf"], "Russisk volk, serbisk vuk og græsk lýkos går tilbage til samme rekonstruerede ulveord.");
add("da", "dog", "Hund og latinsk canis er fjerne slægtninge, selv om lydene er meget forskellige.", [
  ["pie", "*ḱwṓ / *ḱun-", "Et rekonstrueret hundeord med flere bøjningsstammer."],
  ["pie", "*ḱwn̥tós", "En udvidet form af hundestammen; t er en del af orddannelsen.", "orddannelse"],
  ["pg", "*hundaz", "Indledende ḱ bliver germansk h; n̥ får vokal, og t-leddet bliver stemt i denne form."],
  ["on", "hundr", "De ubetonede endelseslyde reduceres til -r."],
  ["da", "hund", "-r falder bort. Nutidens udtale er ikke en lydoptagelse af urgermansk."]
], stop, ["hund", "canis"], "Canis og hund er søstergrene. Russisk sobaka er kommet via en iransk gren af samme gamle hundeord.");
add("da", "horse", "Hest og hingst har fælles germansk baggrund, men nåede dansk ad forskellige veje.", [
  ["pg", "*hanhistaz", "En germansk variant ved siden af *hangistaz; skiftet h/g forbindes med Verners lov."],
  ["on", "hestr", "Indre lydgrupper reduceres, vokalen påvirkes, og endelsen bliver -r."],
  ["od", "hæst", "-r er væk; gammeldansk skriver æ."],
  ["da", "hest", "Ordet videreføres som dansk hest."]
], "Et endnu ældre indoeuropæisk ophav er ikke sikkert fastlagt her. Hest er heller ikke lydligt udviklet fra latinsk equus.", ["hest"], "Hingst er lånt fra nedertysk; tysk Hengst bevarer en længere konsonantgruppe.");
add("da", "elephant", "Elefant følger en gammel græsk-latinsk lånevej.", [
  ["myc", "e-re-pa", "Linear B gengiver en tidlig græsk form for elfenben. Skriften er en stavelsesskrift, ikke præcis lydskrift."],
  ["ag", "ἐλέφας / ἐλέφαντ-", "Nominativ eléphās og bøjningsstammen elephant- betegner elfenben og elefant.", "arv", "eléphās / elephant-"],
  ["la", "elephantus", "Latin låner den længere elephant-stamme med latinsk -us.", "lån"],
  ["da", "elefant", "Den antikke endelse falder bort; ph skrives f. Det sidste europæiske låneled er ikke fastlagt her.", "lån"]
], "Græsk ords ophav er omstridt; et egyptisk led er foreslået. Vi fører ikke dette forslag videre som en sikker kæde.", ["elefant", "elephantus", "ἐλέφας"]);

add("el", "sword", "Spathí kom fra en diminutiv af et ord for en bred klinge.", [
  ["ag", "σπάθη", "Et gammelt ord for en bred klinge eller et fladt redskab.", "arv", "spáthē"],
  ["ag", "σπαθίον", "-íon danner en diminutiv.", "orddannelse", "spathíon"],
  ["mg", "σπαθίν", "Den ubetonede slutning -ion trækkes sammen til -in.", "arv", "spathín"],
  ["el", "σπαθί", "Slut-n falder bort; gammel aspireret th er blevet friktionslyden /θ/.", "arv", "spathí · /spaˈθi/"]
], "Et indoeuropæisk ophav for spáthē er foreslået, men den tidlige orddannelse er usikker. Den vises derfor ikke som et sikkert første led.", ["σπαθί", "Reconstruction:Proto-Hellenic/spátʰā"]);
add("el", "knife", "Machaíri var oprindelig en lille mákhaira.", [
  ["ag", "μάχαιρα", "Ord for kniv eller kort sværd.", "arv", "mákhaira"],
  ["koine", "μαχαίριον", "En diminutiv dannes med -ion.", "orddannelse", "makhaírion"],
  ["el", "μαχαίρι", "Endelsen reduceres; ai bliver /e/, og aspireret kh bliver en friktionslyd.", "arv", "machaíri · /maˈçeri/"]
], unclear, ["μαχαίρι", "μάχαιρα"]);
add("el", "fork", "Et navn for en lille nål blev navn på gaflen.", [
  ["ag", "περόνη", "Betød nål eller spænde.", "arv", "perónē"],
  ["koine", "περόνιον", "Diminutiv: en lille nål eller et lille spidst redskab.", "orddannelse", "perónion"],
  ["mg", "περούνιν / πιρούνιν", "Vokaler og endelse ændres til middelalderlige former.", "arv", "peroúnin / piroúnin"],
  ["el", "πιρούνι", "Slut-n forsvinder; ου gengiver /u/.", "arv", "piroúni · /piˈruni/"]
], unclear, ["πιρούνι"]);
add("el", "plate", "Piáto rejste fra græsk til latin og italiensk og tilbage til græsk.", [
  ["pie", "*pléth₂us", "Rekonstrueret ord for bred eller flad; denne betydning hører til ordets historie."],
  ["ag", "πλατύς", "Et nedarvet græsk adjektiv.", "arv", "platýs"],
  ["vl", "*plattus / *plattum", "Latinsk låneform rekonstrueres; betydningen knyttes til fladt service.", "lån"],
  ["it", "piatto", "Italiensk pl bliver pi-/pj-/; tt bevares som lang konsonant."],
  ["mg", "πιάτο", "Italiensk navn på service lånes tilbage til græsk.", "lån", "piáto"],
  ["el", "πιάτο", "Videreført i nutidsgræsk med enkelt t.", "arv", "piáto · /ˈpjato/"]
], stop, ["πιάτο", "piatto", "piâto"]);
add("el", "paper", "Chartí følger en græsk diminutiv, ikke dansk papirs papyrus-stamme.", [
  ["ag", "χάρτης", "Navn for et ark eller en papyrusrulle.", "arv", "khártēs"],
  ["koine", "χαρτίον", "Diminutiv dannet af khártēs.", "orddannelse", "khartíon"],
  ["mg", "χαρτίν", "-ion reduceres til -in; aspireret kh udvikles til /x/."],
  ["el", "χαρτί", "Slut-n falder bort.", "arv", "chartí · /xarˈti/"]
], "Ophavet til khártēs er omstridt. En forbindelse med »ridse« eller et fønikisk ord er foreslået, men ikke sikkert fastlagt.", ["χαρτί", "χάρτης"]);
add("el", "metal", "Métallo fortsætter det græske mineord.", [
  ["ag", "μέταλλον", "Betød mine eller stenbrud; udtalen havde dobbelt l.", "arv", "métallon · /mé.tal.lon/"],
  ["koine", "μέταλλον", "Betydningen metal findes i koinégræsk; tryk erstatter den gamle toneaccent."],
  ["el", "μέταλλο", "Slut-n forsvinder, og dobbelt l udtales som enkelt l i standardsproget.", "arv", "métallo · /ˈmetalo/"]
], "Den ældre etymologi er omstridt. Vi ved ikke, hvilken første lydlig navngivning der ligger bag mineordet.", ["μέταλλο", "μέταλλον"]);
add("el", "salt", "Aláti deler et meget gammelt ophav med dansk salt.", [
  ["pie", "*sḗh₂l", "Rekonstrueret indoeuropæisk saltord."],
  ["ag", "ἅλς / ἅλας", "Begyndelses-s bliver græsk h; en udvidet form hálas findes ved siden af háls.", "arv", "háls / hálas"],
  ["koine", "ἁλάτιον", "En diminutiv dannes.", "orddannelse", "halátion"],
  ["mg", "ἁλάτιν", "-ion reduceres; begyndelses-h er forsvundet."],
  ["el", "αλάτι", "Slut-n falder bort.", "arv", "aláti · /aˈlati/"]
], stop, ["αλάτι", "sal"]);
add("el", "water", "Neró kommer fra »friskt vand«; det er ikke en lydlig efterkommer af det gamle hýdōr.", [
  ["pie", "*newr̥ós", "Rekonstrueret form knyttet til *néwos, ny."],
  ["ag", "νεαρὸν ὕδωρ", "Et udtryk for friskt vand.", "arv", "nearòn hýdōr"],
  ["koine", "νηρόν", "Det adjektiviske led forkortes og kan bruges uden selve ordet for vand.", "orddannelse", "nērón"],
  ["mg", "νερό(ν)", "Den middelalderlige vandbetegnelse.", "arv", "neró(n)"],
  ["el", "νερό", "Slut-n forsvinder; adjektivet har overtaget rollen som almindeligt vandord.", "arv", "neró · /neˈro/"]
], stop, ["νερό", "νεαρός"], "Oldgræsk hýdōr er beslægtet med dansk vand, men det er ikke et lydligt mellemled til neró.");
add("el", "food", "Fagitó er dannet af et græsk spiseverbum.", [
  ["ag", "ἔφαγον", "En verbalform med betydningen »jeg spiste«.", "arv", "éphagon"],
  ["el", "φαγητό", "En afledning af spise-stammen; aspireret ph bliver /f/, og η har i-lyd.", "orddannelse", "fagitó · /faʝiˈto/"]
], "En fuldstændig mellemledskæde fra verbet til substantivet er ikke fastlagt her. Vi kender ikke den oprindelige navngivning bag spise-stammen.", ["φαγητό"]);
add("el", "bear", "Arkoúda bevarer en afledning af det gamle indoeuropæiske bjørneord.", [
  ["pie", "*h₂ŕ̥tḱos", "Rekonstrueret bjørneord; r̥ bærer en stavelse."],
  ["ag", "ἄρκτος", "Den græske arkt-stamme.", "arv", "árktos"],
  ["mg", "ἀρκούδα", "En afledt middelalderlig form med ændret slutning og reduceret konsonantgruppe.", "orddannelse", "arkoúda"],
  ["el", "αρκούδα", "Videreført i moderne græsk; δ udtales /ð/.", "arv", "arkoúda · /arˈkuða/"]
], stop, ["αρκούδα", "ursus"], "Latinsk ursus har samme gamle ophav. Dansk bjørn og slavisk medved har andre navnestammer.");
add("el", "wolf", "Lýkos viser, hvor forskelligt samme gamle ulveord kan udvikle sig.", [
  ["pie", "*wĺ̥kʷos", "Rekonstrueret ulveord."],
  ["ph", "*lúkos", "Omstilling af begyndelseslydene og tab af læberundingen i kʷ giver en græsk form."],
  ["ag", "λύκος", "I klassisk græsk har υ en rundet y-agtig vokal.", "arv", "lýkos · /lý.kos/"],
  ["el", "λύκος", "υ bliver /i/, og den gamle toneaccent bliver tryk.", "arv", "lýkos · /ˈlikos/"]
], stop, ["λύκος", "wolf"]);
add("el", "dog", "Skýlos fortsætter en græsk hundestamme; den ligner ikke længere den klassiske udtale.", [
  ["koine", "σκύλος", "Hundebetegnelsen dannes af skyl-stammen med -os.", "orddannelse", "skýlos"],
  ["mg", "σκύλος", "υ ændres fra rundet y-lyd mod i-lyd."],
  ["el", "σκύλος", "k foran den forreste vokal får palatal udtale.", "arv", "skýlos · /ˈscilos/"]
], "Den gamle hundestammes ophav er ikke sikkert fastlagt her. Det oldgræske ensstavede neutrum skýlos for dyrehud må ikke ukritisk behandles som samme ord.", ["σκύλος"]);
add("el", "horse", "Álogo betyder historisk »det umælende/ufornuftige« og erstattede et andet hesteord.", [
  ["ag", "ἄλογος", "Adjektiv dannet med a- og logos-leddet: uden tale eller fornuft.", "orddannelse", "álogos"],
  ["koine", "ἄλογον", "Neutrumsformen bruges som navn for hest eller kavaleri.", "orddannelse", "álogon"],
  ["el", "άλογο", "Slut-n forsvinder; g mellem vokaler bliver en friktionslyd.", "arv", "álogo · /ˈaloɣo/"]
], "Dette er en historisk ombenævnelse. Álogo er ikke lydligt udviklet fra híppos; den tidligste historie bag de enkelte ordled vises ikke som én ubrudt ordkæde.", ["άλογο", "ἄλογος"]);
add("el", "elephant", "Eléfantas er en lærd videreførelse af et gammelt græsk elefantord.", [
  ["myc", "e-re-pa", "En tidlig græsk skrivemåde for elfenben i Linear B."],
  ["ag", "ἐλέφας / ἐλέφαντ-", "Bøjningen har den længere elephant-stamme.", "arv", "eléphās / elephant-"],
  ["el", "ελέφαντας", "En lærd form bygget på den gamle stamme. Aspireret /pʰ/ er blevet /f/; den moderne endelse er -as.", "lån", "eléfantas · /eˈlefantas/"]
], "Ophavet før mykensk græsk er omstridt. Et egyptisk forslag behandles ikke som sikkert.", ["ελέφαντας", "ἐλέφας"]);

add("la", "sword", "Gladius kan være et tidligt keltisk lån, men forbindelsen er omstridt.", [
  ["pie", "*kelh₂-", "Foreslået rod med betydningen slå eller bryde.", "arv", "", true],
  ["pc", "*kladiwos", "Foreslået keltisk sværdord.", "orddannelse", "", true],
  ["la", "gladius", "Latin kan have lånt en gallisk form *kladyos. Forbindelsen er en hypotese.", "lån", "/ˈɡla.di.us/"]
], "Lånevejen fra keltisk er foreslået, ikke bevist. Vi kan ikke føre gladius sikkert tilbage til en første menneskelig lyd.", ["gladius"]);
add("la", "knife", "Culter er belagt latin; den ældre lydkæde er usikker.", [
  ["la", "culter", "Et ord for kniv eller skærende redskab, med klassisk k-udtale.", "arv", "[ˈkʊɫ.tɛr]"]
], "Der er konkurrerende forslag fra rødderne *(s)kelH- og *(s)ker-, begge for at skære. Forslaget *kor-tro- → culter kræver bl.a. rtr → ltr. Det er ikke en sikker kæde.", ["culter"]);
add("la", "fork", "Furca er et gammelt navn for et forgrenet redskab; dets ældre ophav er omstridt.", [
  ["la", "furca", "Belagt ord for bl.a. fork, forgrenet stolpe og galge.", "arv", "/ˈfur.ka/"]
], "En forbindelse med *ǵʰerk(ʷ)- er foreslået, men konsonantudviklingen er vanskelig. Andre forklaringer findes. Vi viser ikke en af dem som bevist.", ["furca"]);
add("la", "plate", "Catillus er en latinsk diminutiv af et navn for et madkar.", [
  ["la", "catīnus", "Navn for et kar eller fad."],
  ["la", "catillus", "Diminutiv dannes: den mindre beholder. Dannelsen ændrer endelsen og giver dobbelt l.", "orddannelse", "/kaˈtil.lus/"]
], unclear, ["catillus", "catinus"]);
add("la", "paper", "Charta er et græsk lån, ikke efterkommer af papȳrus.", [
  ["ag", "χάρτης", "Ark eller papyrusrulle.", "arv", "khártēs"],
  ["la", "charta", "Latin låner ordet og bøjer det med -a; klassisk ch var en aspireret k-lyd.", "lån", "/ˈkʰar.ta/"]
], "Det græske ord har omstridt ophav. Forslag om at ridse eller et fønikisk ord er ikke sikkert fastlagt.", ["χάρτης", "chart"]);
add("la", "metal", "Metallum er lånt fra det græske mineord.", [
  ["ag", "μέταλλον", "Mine eller stenbrud; senere også metal.", "arv", "métallon"],
  ["la", "metallum", "-on tilpasses latinsk -um; dobbelt l bevares.", "lån", "[mɛˈtal.lũː]"]
], "Det græske ophav før métallon er omstridt.", ["metallum", "μέταλλον"]);
add("la", "salt", "Sāl er en italisk gren af samme gamle saltord som dansk salt.", [
  ["pie", "*sḗh₂l", "Rekonstrueret indoeuropæisk saltord."],
  ["pi", "*sāls", "Laryngalen er ikke bevaret som selvstændig lyd; vokalen er lang."],
  ["la", "sāl", "Slut-s falder bort i nominativ. Bøjningen sālis viser stammen med l.", "arv", "/saːl/"]
], stop, ["sal"]);
add("la", "water", "Aqua har et andet gammelt ophav end dansk vand.", [
  ["pie", "*h₂ékʷeh₂", "Rekonstrueret vandord med læberundet kʷ."],
  ["pi", "*akʷā", "h₂ påvirker vokalen til a; slutningen bliver lang ā."],
  ["la", "aqua", "qu skriver den læberundede /kʷ/-lyd.", "arv", "[ˈa.kʷa]"]
], stop, ["aqua"], "Dansk vand og russisk voda har *wódr̥ som ophav; samme betydning betyder ikke samme rod.");
add("la", "food", "Cibus er et latinsk ord med uafklaret ældre ophav.", [
  ["la", "cibus", "Klassisk c udtales k; i senere kirkelig italiensk udtale bliver det en tj-lyd foran i.", "arv", "klassisk [ˈkɪ.bʊs]"]
], "Et græsk lån fra et ord for kasse eller pose er foreslået, men ikke sikkert. Der findes ikke en underbygget kæde fra cibus til et ursprogs første lyde.", ["cibus"]);
add("la", "bear", "Ursus viderefører det gamle indoeuropæiske bjørneord, med omstridte mellemændringer.", [
  ["pie", "*h₂ŕ̥tḱos", "Rekonstrueret bjørneord."],
  ["la", "ursus", "Konsonantgruppen er blevet rs, men især udviklingen til begyndelses-u er omdiskuteret.", "arv", "[ˈur.sus]"]
], "Slægtskabet er stærkt underbygget; den nøjagtige italiske lydvej er ikke entydigt forklaret. Ingen første navngivningslyd er kendt.", ["ursus"]);
add("la", "wolf", "Lupus har en omstridt vej til sin p-lyd.", [
  ["pie", "*wĺ̥kʷos", "Det almindelige forslag er det indoeuropæiske ulveord.", "arv", "", true],
  ["pi", "*lukʷos", "En mulig omstilling af begyndelseslydene. Lån via et oskisk-umbrisk sprog kan forklare kʷ → p.", "arv", "", true],
  ["la", "lupus", "Den latinske form er belagt; det foregående låneled er en hypotese.", "lån", "[ˈɫʊ.pʊs]"]
], "Der findes alternative etymologier. Især kʷ → p er ikke en almindelig latinsk lydændring, der bare kan antages her.", ["lupus"]);
add("la", "dog", "Canis er beslægtet med hund, men dets latinske vokal og bøjning er blevet omformet.", [
  ["pie", "*ḱwṓ / *ḱun-", "Rekonstrueret hundeord med skiftende stammer."],
  ["la", "canēs", "En førklassisk latinsk form. Udviklingen fra den gamle bøjning er ikke fuldt regelmæssig."],
  ["la", "canis", "Bøjningen omformes; klassisk c har k-lyd. Hvor a præcis kommer fra, er omdiskuteret.", "arv", "[ˈka.nɪs]"]
], stop, ["canis"]);
add("la", "horse", "Equus bevarer et indoeuropæisk hesteord.", [
  ["pie", "*h₁éḱwos", "Rekonstrueret hesteord."],
  ["pi", "*ekwos", "Laryngalen forsvinder, og den palatale konsonant får k-udtale."],
  ["la", "equus", "Latinsk qu gengiver /kʷ/; endelsen er -us.", "arv", "/ˈe.kʷus/"]
], stop, ["equus"], "Græsk híppos er beslægtet. Dansk hest og nutidsgræsk álogo har andre navnestammer.");
add("la", "elephant", "Elephantus lånes fra den længere bøjningsstamme i græsk.", [
  ["myc", "e-re-pa", "Tidligt græsk navn for elfenben i stavelsesskrift."],
  ["ag", "ἐλέφας / ἐλέφαντ-", "Nominativ og bøjningsstamme har forskellig slutning.", "arv", "eléphās / elephant-"],
  ["la", "elephantus", "Græsk elephant- får latinsk -us; klassisk ph er aspireret /pʰ/.", "lån", "[ɛ.ɫɛˈpʰan.tʊs]"]
], "Et egyptisk ophav er foreslået, men den førgræske lånevej er ikke sikkert forklaret.", ["elephantus", "ἐλέφας"]);

add("ar", "sword", "Sayf er gammelt, men dets vej mellem oldtidens sprog er uafklaret.", [
  ["arOld", "سَيْف", "Et belagt arabisk sværdord. Lignende ord findes i hebraisk og aramæisk.", "arv", "sayf"],
  ["ar", "سيف", "Standardsproget viderefører sayf; ay er en diftong, ikke blot en lang e-lyd.", "arv", "sayf · /sajf/"]
], "En forbindelse med græsk xíphos og egyptiske former er foreslået. Låneretning og fælles ophav er ikke sikkert kendt, så de sættes ikke i en sikker rækkefølge.", ["سيف"]);
add("ar", "knife", "Sikkīn følger en lånevej fra Mesopotamien gennem aramæisk.", [
  ["sum", "zigan", "Navn for åre eller styreblad i sumerisk."],
  ["akk", "sikkānum", "Sumerisk redskabsnavn lånes og tilpasses akkadisk.", "lån"],
  ["aram", "סכינא", "Aramæisk viderefører en form for kniv; betydningen og endelsen har ændret sig.", "lån", "sakkīnā"],
  ["ar", "سكين", "Arabisk låneform med dobbelt k og lang ī.", "lån", "sikkīn · /sikˈkiːn/"]
], "Den kendte kæde stopper ved sumerisk zigan. Der er ikke belæg for at forklare det som en oprindelig skære- eller gryntelyd.", ["سكين"]);
add("ar", "fork", "Shawka bruger et gammelt ord for en torn som navn på gaflen.", [
  ["arOld", "شَوْك", "Et gammelt ord for torne; beslægtet med hebraiske former.", "arv", "shawk"],
  ["ar", "شوكة", "En enkelt torn betegnes med -a(t); samme ord bruges om gaflen. Det er en betydningsudvikling.", "orddannelse", "shawka · /ˈʃaw.ka/"]
], "De præcise forhistoriske lydled og dateringen af bestikbetydningen er ikke fastlagt her. Rodens konsonanter er ikke i sig selv bevis for et første menneskeligt råb.", ["شوك", "thorn"]);
add("ar", "plate", "Ṭabaq har ifølge den citerede ordbog en persisk lånebaggrund.", [
  ["mp", "tābag / tābaq", "Navn for et stegekar eller en pande."],
  ["arOld", "طَابَق", "Persisk form lånes til arabisk med tilpassede konsonanter.", "lån", "ṭābaq"],
  ["ar", "طبق", "Den kortere variant har kort a i første stavelse; betydningen omfatter tallerken.", "orddannelse", "ṭabaq · /ˈtˤa.baq/"]
], "Den persiske form er knyttet til en ældre iransk varmestamme, men den fulde tidligere lydkæde vises ikke her. Det arabiske rodmønster må ikke forveksles med et oprindeligt grynt.", ["طبق", "طابق"]);
add("ar", "paper", "Waraq var et bladord før det blev et papirord.", [
  ["sem", "*waraḳ-", "Rekonstrueret semitisk ord for blad."],
  ["arOld", "وَرَق", "Arabisk viderefører konsonanterne og betydningen blade.", "arv", "waraq"],
  ["ar", "ورق", "Ordet bruges også om papir og ark. q er en bagtil artikuleret stoplyd.", "arv", "waraq · /ˈwa.raq/"]
], stop, ["ورق"]);
add("ar", "metal", "Maʿdin har historisk også betegnet stedet, hvor et mineral findes.", [
  ["arOld", "مَعْدِن", "Et arabisk sted-/redskabsnavn af ʿ-d-n-stammen; bl.a. mine eller mineralforekomst.", "orddannelse", "maʿdin"],
  ["ar", "معدن", "Betydningen omfatter mineral og metal. ʿ er en svælglyd, som ordlistens madin skjuler.", "arv", "maʿdin · /ˈmaʕ.din/"]
], "Et rodmønster beskriver orddannelse, ikke en dateret sekvens fra et grynt. Et sikkert forhistorisk forlæg og alle mellemtrin er ikke fastlagt her.", ["معدن"]);
add("ar", "salt", "Milḥ viderefører et vestsemitisk saltord.", [
  ["ws", "*milḥ-", "Rekonstrueret vestsemitisk saltord."],
  ["ar", "ملح", "Konsonanterne videreføres. ḥ er /ħ/, en ustemt svælglyd, ikke dansk h.", "arv", "milḥ · /milħ/"]
], stop, ["ملح"]);
add("ar", "water", "Māʾ har semitisk ophav; den sidste lyd er en glottal lukning.", [
  ["sem", "*māy-", "Rekonstrueret vandstamme; hebraisk máyim og akkadisk mû er beslægtede former."],
  ["ar", "ماء", "Den arabiske form har lang ā og hamza /ʔ/. Dette er ikke dokumentation for, at den første vandlyd var ma.", "arv", "māʾ · /maːʔ/"]
], "Endnu dybere afroasiatiske rekonstruktioner er foreslået, men vises ikke som en sikker første lyd. Vi ved ikke, hvorfor den semitiske vandstamme fik netop disse lyde.", ["ماء", "מים", "mû"]);
add("ar", "food", "Ṭaʿām hører til en gammel spise- og smagsstamme.", [
  ["arOld", "طَعَام", "Belagt arabisk madord med beslægtet hebraisk ṭāʿām.", "orddannelse", "ṭaʿām"],
  ["ar", "طعام", "Standardsproget viderefører ordet. ṭ er en emfatisk t-lyd, ʿ en svælglyd og ā lang.", "arv", "ṭaʿām · /tˤaˈʕaːm/"]
], "Slægtskabet med andre semitiske ord er ikke en fuld lydkæde. Den tidligste navngivning og en nøjagtig forhistorisk form fastlægges ikke her.", ["طعام"]);
add("ar", "bear", "Dubb fortsætter et semitisk bjørneord.", [
  ["sem", "*dubb-", "Rekonstrueret semitisk bjørnestamme."],
  ["ar", "دب", "Arabisk bevarer den dobbelte b-lyd. Hebraisk dov er en søsterform med en anden slutlyd.", "arv", "dubb · /dubb/"]
], "Et dybere afroasiatisk ophav er foreslået. Det giver ikke belæg for en første menneskelig dyrelyd, og føres ikke videre som sikker kæde.", ["دب"]);
add("ar", "wolf", "Dhiʾb bevarer både en interdental konsonant og en glottal lukning.", [
  ["sem", "*ḏiʔb-", "Rekonstrueret semitisk ulvestamme."],
  ["ar", "ذئب", "Standardsprogets ḏ er /ð/, og ʾ er /ʔ/. Ordlistens dhib er en forenklet læsning.", "arv", "ḏiʾb · /ðiʔb/"]
], stop, ["ذئب"]);
add("ar", "dog", "Kalb er en semitisk hundestamme, uafhængig af indoeuropæisk hund/canis.", [
  ["sem", "*kalb-", "Rekonstrueret semitisk ord for hund; akkadisk kalbum og hebraisk kélev er søsterformer."],
  ["ar", "كلب", "Arabisk bevarer kalb-stammen.", "arv", "kalb · /kalb/"]
], stop, ["كلب"]);
add("ar", "horse", "Ḥiṣān er et arabisk navn for hest eller hingst; dets ældste ophav fastlægges ikke her.", [
  ["arOld", "حِصَان", "Et belagt arabisk hesteord, knyttet til ḥ-ṣ-n-stammen.", "arv", "ḥiṣān"],
  ["ar", "حصان", "Standardsproget bevarer ordet. ḥ er /ħ/ og ṣ en emfatisk s-lyd; ā er lang.", "arv", "ḥiṣān · /ħiˈsˤaːn/"]
], "En analyse af ḥ-ṣ-n som rod viser ikke i sig selv ordets historiske lydvej. Der sættes ikke et udokumenteret ursprogsord foran det belagte arabiske ord.", ["حصان"]);
add("ar", "elephant", "Fīl følger en lånevej fra akkadisk gennem persisk.", [
  ["akk", "pīru", "Et akkadisk elefantord."],
  ["mp", "pīl", "Persisk låneform med l i stedet for r.", "lån"],
  ["ar", "فيل", "Arabisk tilpasser persisk p til f og bevarer den lange ī.", "lån", "fīl · /fiːl/"]
], "Kæden stopper ved det akkadiske ord i de anvendte kilder. Dyrets lyd eller en første navngivning kan ikke udledes af pīru.", ["فيل"]);

add("ja", "sword", "Ken er en kinesisk lånelæsning. Tsurugi, som også læser 剣, har en anden historie.", [
  ["mc", "劍 · *kjaemH", "Middelkinesisk udtale rekonstrueres; H er en tonekategori i denne notation, ikke et udtalt h.", "arv", "*kjaemH"],
  ["jhist", "kem", "Lånet får japansk lydform med slut-m.", "lån"],
  ["ja", "剣", "Slut-m ændres til den japanske nasale slutlyd /ɴ/.", "arv", "ken · /keɴ/"]
], "Ken skal ikke kædes sammen med oldjapansk turuki/tsurugi som om de var successive former. Det kinesiske ords tidligste navngivning er ikke kendt her.", ["剣"], "Tsurugi er en nedarvet japansk læsning med uafklaret ældre ophav; modulets hovedord er ken.");
add("ja", "knife", "Naifu er et engelsk lån med japansk tilpassede lyde.", [
  ["pg", "*knībaz", "Germansk knivord; også ophav til dansk kniv."],
  ["oe", "cnīf", "Den engelske gren bevarer oprindelig k+n og en lang i-lyd."],
  ["me", "knif", "Middelengelsk knivord."],
  ["en", "knife", "k bliver stumt, og lang i bliver diftongen /aɪ/.", "arv", "/naɪf/"],
  ["ja", "ナイフ", "Engelsk knife lånes som nai-fu: en u-vokal tilføjes efter f.", "lån", "naifu · /naifɯ/"]
], unclear, ["ナイフ", "knife", "kniv"]);
add("ja", "fork", "Fōku følger et latinsk redskabsord gennem engelsk.", [
  ["la", "furca", "Latinsk ord for et forgrenet redskab."],
  ["oe", "forca / force", "Latin lånes ind i den germanske/engelske gren.", "lån"],
  ["me", "forke", "Den engelske form; påvirkes også af franske låneformer."],
  ["en", "fork", "Den ubetonede endevokal forsvinder. Engelsk udtale varierer med dialekt."],
  ["ja", "フォーク", "Engelsk fork tilpasses med lang ō og en slutvokal efter k.", "lån", "fōku · /foːkɯ/"]
], "Ophavet til latinsk furca er omstridt. Det japanske lån giver ingen vej til en første gryntelyd.", ["フォーク", "fork"]);
add("ja", "plate", "Sara er et nedarvet japansk ord, belagt i 720.", [
  ["pj", "*sara", "Rekonstrueret japansk ord for fad eller tallerken."],
  ["oj", "娑羅", "Phonetisk stavet sara i Nihon Shoki fra 720. Tegnene bruges her for deres lyde.", "arv", "sara"],
  ["ja", "皿", "Ordet skrives nu normalt med et betydningstegn, men læses stadig sara.", "arv", "sara · /saɾa/"]
], stop, ["皿"]);
add("ja", "paper", "Kami har en gammel japansk historie, hvor en nasal konsonantgruppe er vigtig.", [
  ["pj", "*kanpi", "En rekonstruktion som forklarer både japanske og ryukyuanske former."],
  ["oj", "kami", "Den indre lydgruppe har en prenasaliseret lydværdi; latinsk stavning alene skjuler den."],
  ["ja", "紙", "En sporadisk ændring fra [ᵐb] til [m] giver standardjapansk kami.", "arv", "kami"]
], "Et kinesisk lån fra et ord for bambus-skrivetavle er en alternativ hypotese. Kami for papir må ikke uden belæg forbindes med kami for gud/ånd.", ["紙"]);
add("ja", "metal", "Kinzoku er et kinesisk låneord med japansk lydtilpasning.", [
  ["mc", "金屬 · *kim dzyowk", "Kinesisk sammensætning af metal og kategori/tilhørsforhold; historisk udtale rekonstrueres."],
  ["ja", "金属", "kim får nasal slutlyd n; den anden stavelse tilpasses til zoku med vokal efter slut-k.", "lån", "kinzoku"]
], "Tegnenes betydninger forklarer sammensætningen, men ikke menneskehedens første lyde. Den præcise lånedatering og ældre kinesiske lydled fastlægges ikke her.", ["金属"]);
add("ja", "salt", "Shio har mistet en indre konsonant, som oldjapansk sipo havde.", [
  ["oj", "sipo", "Oldjapansk saltord, citeret i Kojiki fra 712."],
  ["jhist", "shiwo", "Indre p svækkes gennem /ɸ/ til /w/; w-leddet er allerede dokumenteret i ordbogen fra 1603."],
  ["ja", "塩", "w falder bort mellem vokalerne: shio.", "arv", "shio · /ɕio/"]
], "Det ældre ophav er ikke sikkert forklaret her. Lighed eller kontakt med ainus former fastlægger ikke en første lyd.", ["塩"]);
add("ja", "water", "Mizu har en sporbar ændring fra oldjapansk d til nutidens z-lyd.", [
  ["pj", "*mentu", "Rekonstrueret urjapansk vandord; ryukyuanske former støtter den ældre e-vokal."],
  ["oj", "mi₁du", "Oldjapansk form, belagt i Kojiki fra 712. d havde en anden historisk lydværdi end moderne dansk d."],
  ["jhist", "midzu", "d udvikles til affrikaten /d͡z/."],
  ["ja", "水", "Affrikaten svækkes i den almindelige udtale; læsningen er mizu.", "arv", "mizu · [mʲizɨ]"]
], stop, ["水"], "Den kinesiske læsning sui er en anden gren; den står ikke mellem mi₁du og mizu.");
add("ja", "food", "Tabemono blev dannet som »spise-ting« af et verbum med en ældre høflighedsbetydning.", [
  ["oj", "tabu", "Et verbum for ydmygt at modtage, knyttet til høfligt at give."],
  ["ja", "食べる", "Den gamle bøjning -u bliver til -eru; verbet får spisebetydning.", "arv", "taberu"],
  ["ja", "食べ物", "Verbets forbindelsesform tabe- sættes sammen med mono, ting.", "orddannelse", "tabemono"]
], "Sammensætningen har to ordhistoriers grene. Den viser ikke én første lyd for mad, og vi fastlægger ikke det førjapanske ophav her.", ["食べ物", "食べる"]);
add("ja", "bear", "Kuma er belagt i 712; dets forhold til andre østasiatiske bjørneord er omstridt.", [
  ["oj", "kuma", "Oldjapansk bjørneord, citeret i Kojiki fra 712."],
  ["ja", "熊", "Den nedarvede læsning kuma skrives med et kinesisk betydningstegn.", "arv", "kuma"]
], "Forbindelser til koreansk gom, et japansk huleord og kinesiske bjørneord er foreslået. Ingen af dem vises her som en sikker lånekæde.", ["熊"]);
add("ja", "wolf", "Ōkami har en japansk historie som »stor ånd/gud«.", [
  ["oj", "opo kami₂", "En sammensætning af stor og gud/ånd.", "orddannelse"],
  ["jhist", "ofokami → owokami", "Den indre p-lyd svækkes gennem /ɸ/ til /w/."],
  ["ja", "狼", "Vokalerne trækkes sammen til lang ō; betydningstegnet læses ōkami.", "arv", "ōkami · /oːkami/"]
], "Sammensætningen forklarer et historisk navn. Den giver ikke belæg for at tolke ordet som efterligning af ulvens hyl; de to leds tidligste navngivning er ukendt.", ["狼"]);
add("ja", "dog", "Inu er en japansk læsning med urjapansk baggrund.", [
  ["pj", "*enu", "Rekonstrueret japansk hundeord."],
  ["oj", "inu", "Den første vokal er hævet fra e til i."],
  ["ja", "犬", "Læses inu; det kinesiske tegn er ikke bevis for et kinesisk lydlån.", "arv", "inu"]
], "Forslag om afledning af andre japanske ord eller lån fra et ukendt sprog er omstridte. Det tidligste lydlige ophav er ikke kendt.", ["犬"]);
add("ja", "horse", "Uma er gammel japansk; lighed med andre asiatiske hesteord beviser ikke en bestemt lånevej.", [
  ["pj", "*uma", "En urjapansk rekonstruktion. Alternative analyser af begyndelseslyden findes."],
  ["oj", "uma", "Hesteord belagt i Nihon Shoki fra 720."],
  ["jhist", "muma", "En historisk variant med ekstra begyndelses-m bliver udbredt i Heian-perioden."],
  ["ja", "馬", "Standardformen er igen uma; muma er nu forældet.", "arv", "uma"]
], "Muligt slægtskab eller lån fra andre asiatiske hesteord er omstridt. Kinesisk mǎ er derfor ikke sat foran uma som et sikkert mellemled.", ["馬"]);
add("ja", "elephant", "Zō viser en kinesisk lånestavelse, der er trukket sammen til en lang vokal.", [
  ["mc", "象 · *zjangX", "Middelkinesisk elefantord; X er en tonekategori, ikke en x-lyd."],
  ["jhist", "zau", "Tidlig japansk lånelæsning med au-vokalsekvens.", "lån"],
  ["jhist", "zɔ̄", "au smelter sammen til en lang åben o-lyd."],
  ["ja", "象", "Den lange vokal hæves til /oː/; skrevet zou, læst zō.", "arv", "zō · /zoː/"]
], "Kinesisk ords ældre ophav og dets forhold til andre elefantord er ikke fastlagt her. Det japanske tegns billede er ikke lydens oprindelse.", ["象"]);

for (const code of ["sr", "ru"]) {
  const russian = code === "ru";
  add(code, "sword", "De slaviske sværdord har et fælles, men uafklaret ældre ophav.", [
    ["ps", russian ? "*mečь" : "*mьčь", "To beslægtede urslaviske former rekonstrueres; en lånebaggrund er foreslået."],
    [code, russian ? "меч" : "мач", russian ? "Slutvokalen falder bort; č er en tj-lignende lyd." : "Den reducerede ь-vokal bliver a i denne stilling; slutvokalen falder bort.", "arv", russian ? "meč · /mʲetɕ/" : "mač · /matʃ/"]
  ], "Det urslaviske ophav er uafklaret. Ordet kan være lånt, men der vælges ikke et udokumenteret donorsprog.", [russian ? "меч" : "мач"]);
  add(code, "knife", "Nož har en gammel orddannelse, hvor en konsonant blev ændret foran j.", [
    ["pie", "*h₁noǵʰ-yos", "Rekonstrueret form med betydningen noget, der stikker eller trænger ind."],
    ["ps", "*nožь", "En j-afledning knyttet til *noziti; konsonanterne smelter sammen til ž.", "orddannelse"],
    ...(russian ? [["oes", "ножь", "Oldøstslavisk form med en kort slutvokal.", "arv", "nožĭ"]] : []),
    [code, "нож", russian ? "Slutvokalen forsvinder, og slut-ž udtales ustemt som /ʂ/." : "Slutvokalen forsvinder; ž er en stemt sj-lignende lyd.", "arv", russian ? "nož · [noʂ]" : "nož · /noːʒ/"]
  ], stop, ["Reconstruction:Proto-Slavic/nožь", "нож", "ножь"]);
  add(code, "fork", "Bestikkets navn er dannet af et ældre ord for høtyv.", [
    ["ps", russian ? "*vidla" : "*vidly", "Rekonstrueret slavisk høtyvsord; forskellige bøjningsformer forekommer."],
    [code, russian ? "вилы" : "виле", "d falder bort i gruppen dl i disse slaviske grene.", "arv", russian ? "víly" : "vile"],
    [code, russian ? "вилка" : "виљушка", russian ? "Diminutiv med -ka: en lille høtyv. Bestikbetydningen kan være påvirket af fransk fourchette." : "En afledning af vile med palatal lj og -uška bliver navn på spisegaflen.", "orddannelse", russian ? "vílka" : "viljuška"]
  ], "Det ældre ophav til høtyvsstammen og den præcise tidlige navngivning fastlægges ikke her. Dette er orddannelse og betydningsændring, ikke blot lydmutation.", [russian ? "вилка" : "виљушка", russian ? "вилы" : "виле"]);
  add(code, "metal", "Et internationalt ord med en græsk-latinsk baggrund.", [
    ["ag", "μέταλλον", "Mine eller stenbrud; senere metal.", "arv", "métallon"],
    ["la", "metallum", "Græsk ord tilpasses latin med endelsen -um.", "lån"],
    [code, russian ? "металл" : "метал", "Det internationale ord tilpasses uden den antikke endelse. De konkrete europæiske mellemled fastlægges ikke her.", "overblik", "metal"]
  ], "Græsk ords endnu ældre ophav er omstridt. Pilen fra latin opsummerer en lånefamilie og er ikke påstand om direkte lån fra latin til nutidssproget.", [russian ? "металл" : "метал", "metallum", "μέταλλον"]);
  add(code, "salt", "De slaviske saltord deler ophav med dansk salt og latinsk sāl.", [
    ["pie", "*sḗh₂l", "Rekonstrueret indoeuropæisk saltord."],
    ["ps", "*solь", "Slavisk har en sol-stamme og en kort slutvokal."],
    ...(russian ? [["oes", "соль", "Oldøstslavisk saltord.", "arv", "solĭ"]] : []),
    [code, russian ? "соль" : "со", russian ? "Slutvokalen forsvinder; ь markerer nu blød l-lyd." : "Slutvokalen forsvinder; slut-l udvikles til o, og vokalerne sammentrækkes til lang o.", "arv", russian ? "solʹ · /solʲ/" : "so · /soː/"]
  ], stop, [russian ? "соль" : "со", "sal"]);
  add(code, "water", "Voda er en slavisk gren af samme gamle vandord som dansk vand.", [
    ["pie", "*wódr̥ / *wédōr", "Et gammelt r/n-stammeord med en kollektiv form *wédōr."],
    ["pbs", "*wandō", "Den baltoslaviske n-stamme rekonstrueres."],
    ["ps", "*voda", "Slavisk omformer ordet til en a-stamme; o-vokalen videreføres."],
    ...(russian ? [["oes", "вода", "Den oldøstslaviske form.", "arv", "voda"]] : []),
    [code, "вода", russian ? "Nutidsrussisk har tryk på sidste stavelse; det første o reduceres i udtalen." : "Serbisk viderefører voda med egen vokal- og accentudvikling.", "arv", russian ? "vodá · [vɐˈda]" : "voda"]
  ], stop, ["Reconstruction:Proto-Slavic/voda", "вода"]);
  add(code, "bear", "Bjørnen fik et slavisk navn, som betyder honningæder.", [
    ["pie", "*médʰu + *h₁ed-", "To rekonstruerede ordled: honning og spise. Dette er en sammensætning, ikke ét grynt."],
    ["pbs", "*medwḗˀdis", "Rekonstrueret betegnelse for honningæder.", "orddannelse"],
    ["ps", "*medvědь", "Konsonanter og bøjning får slavisk form; et muligt tabunavn for bjørnen."],
    ...(russian ? [["oes", "медвѣдь", "Oldøstslavisk form med den gamle ѣ-vokal.", "arv", "medvědĭ"]] : []),
    [code, russian ? "медведь" : "медвед", russian ? "ѣ falder sammen med e i russisk; slutvokalen forsvinder, men slutkonsonanten er blød." : "ѣ bliver e i den ekaviske form i ordlisten; slutvokalen forsvinder.", "arv", russian ? "medvedʹ · [mʲɪdˈvʲetʲ]" : "medved"]
  ], "Honningæder er en historisk etymologi. Tabu kan forklare ombenævnelsen, men den konkrete første navngivning er ukendt; de to rods tidligste lydophav er heller ikke kendt.", ["Reconstruction:Proto-Slavic/medvědь", russian ? "медведь" : "медвед"]);
  add(code, "wolf", "Samme gamle ulvestamme giver russisk volk og serbisk vuk.", [
    ["pie", "*wĺ̥kʷos", "Rekonstrueret indoeuropæisk ulveord."],
    ["pbs", "*wilkás", "Stavelsesbærende l får en vokal; kʷ mister læberundingen."],
    ["ps", "*vьlkъ", "En slavisk form med reducerede vokaler, de såkaldte jers."],
    ...(russian ? [["oes", "вълкъ", "Oldøstslavisk ulveord.", "arv", "vŭlkŭ"]] : []),
    [code, russian ? "волк" : "вук", russian ? "En indre reduceret vokal udvikles til o; slutvokalen forsvinder." : "Den stavelsesbærende l-gruppe udvikles til u, og slutvokalen forsvinder.", "arv", russian ? "volk · /voɫk/" : "vuk · /vuːk/"]
  ], stop, [russian ? "вълкъ" : "вук", "wolf"]);
  add(code, "elephant", "Slon er et gammelt slavisk navn med omstridt ophav.", [
    ["ps", "*slonъ", "En fælles slavisk elefantbetegnelse rekonstrueres."],
    [code, "слон", "Den korte slutvokal falder bort; slon-stammen videreføres.", "arv", "slon"]
  ], "Der findes forslag om et tyrkisk lån, et kinesisk ord via ukendte mellemled og en afledning af »læne sig«. Ingen af disse er sat ind som en sikker lydkæde.", ["слон"]);
}
add("sr", "plate", "Tanjir er et lån gennem osmannisk tyrkisk.", [
  ["cp", "تنور", "Den citerede ordbog angiver persisk tannūr som forlæg.", "arv", "tannūr"],
  ["ot", "تنور", "Osmannisk form tennür.", "lån", "tennür"],
  ["sr", "тањир", "Lånet tilpasses serbisk med den palatale nj-lyd.", "lån", "tanjir"]
], "Det ældre persiske ophav og detaljerne i vokaludviklingen er ikke underbygget her. En længere førhistorie konstrueres ikke ud fra lighed alene.", ["тањир"]);
add("ru", "plate", "Tarelka kom gennem polsk og har byttet om på l og r.", [
  ["mhg", "talier", "Et middelhøjtysk tallerkenord."],
  ["pl", "talerz", "Ordet lånes til polsk og tilpasses dets lyde.", "lån"],
  ["ru", "тарелка", "l og r bytter plads, og -ka tilføjes: taler- bliver tarel-.", "lån", "tarelka · [tɐˈrʲeɫkə]"]
], "Den sikre kæde i den citerede kilde begynder med talier. Dateringen af hver enkelt lånehandling er ikke fastlagt her.", ["тарелка"]);
add("sr", "paper", "Papir kom til serbisk fra tysk og går tilbage til papyrus.", [
  ["ag", "πάπυρος", "Papyrusplanten og dens skrivemateriale.", "arv", "pápyros"],
  ["la", "papȳrus", "Latin låner plantenavnet.", "lån"],
  ["of", "papier", "Afledt fransk navn på skrivematerialet.", "orddannelse"],
  ["mhg", "papier", "Fransk ord lånes til tysk.", "lån"],
  ["de", "Papier", "Den tyske form videreføres."],
  ["sr", "папир", "Det tyske ord tilpasses serbisk.", "lån", "papir"]
], "Det græske plantenavns tidligere ophav er uafklaret. Et egyptisk forslag er ikke et sikkert første led.", ["папир", "Papier", "papier", "πάπυρος"]);
add("ru", "paper", "Bumaga har sandsynligvis en lånehistorie knyttet til bomuld, men mellemleddene er omstridte.", [
  ["mp", "pambak", "Et persisk bomuldsord foreslås som det fjernere ophav.", "arv", "", true],
  ["it", "bambagia", "Et muligt middelhavsled for bomuld eller bomuldsstof.", "lån", "", true],
  ["ru", "бумага", "Den belagte russiske form blev også brugt om bomuld. En tidligere *bubaga med b→m-ændring er foreslået.", "lån", "bumaga"]
], "Lånevejen, de konkrete mellemformer og forbindelsen fra bomuld til papir er ikke entydigt fastlagt. Derfor er de ældre led markeret som hypoteser.", ["бумага", "бумажный"]);
add("sr", "food", "Hrana viderefører en gammel slavisk madstamme med omstridt tidligere ophav.", [
  ["ps", "*xorna", "Rekonstrueret slavisk mad- og foderord."],
  ["sr", "храна", "Sydslavisk omstilling af vokal og r giver hrana; х gengiver /x/.", "arv", "hrana · /xraːna/"]
], "Der findes konkurrerende iranske låneforklaringer og indoeuropæiske afledninger. Ingen af dem vises som et sikkert ophav.", ["храна", "Reconstruction:Proto-Slavic/xorna"]);
add("ru", "food", "Eda er dannet af en gammel spise-stamme.", [
  ["pie", "*h₁ed-", "Rekonstrueret rod for at spise."],
  ["ps", "*ěda", "Et substantiv dannes af spiseverbet *(j)ěsti.", "orddannelse"],
  ["ru", "ѣда → еда", "Den gamle ě-vokal falder sammen med e; stavningen ændres. Nutidsudtalen har tryk på a.", "arv", "edá · [(j)ɪˈda]"]
], stop, ["еда"]);
add("sr", "dog", "Pas kommer fra et gammelt slavisk hundeord, hvis ældre etymologi er uafklaret.", [
  ["ps", "*pьsъ", "En fælles slavisk hundestamme rekonstrueres."],
  ["sr", "пас", "Den stærke indre ь-vokal bliver a, og den svage slutvokal falder bort.", "arv", "pas"]
], "Forslag om plettet, bidsk, vagtsom eller hyrdehund konkurrerer. Det er ikke belagt, hvilken af disse betydninger der lå bag den første navngivning.", ["pas", "Reconstruction:Proto-Slavic/pьsъ"]);
add("ru", "dog", "Sobaka er kommet gennem en iransk gren, selv om det nu er et almindeligt russisk hundeord.", [
  ["pie", "*ḱwṓ", "Rekonstrueret hundeord; også ophav til dansk hund og latinsk canis."],
  ["iran", "*spaka → *sabāka", "Iranske former; den konkrete dialekt og alle mellemændringer er ikke sikkert fastlagt."],
  ["ps", "*sobaka", "Det iranske hundeord lånes ind i slavisk.", "lån"],
  ["oes", "собака", "Den oldøstslaviske form.", "arv", "sobaka"],
  ["ru", "собака", "Stammen bevares; ubetonede o og a reduceres i russisk udtale.", "arv", "sobaka · [sɐˈbakə]"]
], "Det overordnede iranske lån er underbygget i kilden, men ikke hvert dialektled. Ingen oprindelig hundelyd eller navngivningsytring er kendt.", ["собака"]);
add("sr", "horse", "Konj fortsætter et slavisk hesteord med uafklaret ældre ophav.", [
  ["ps", "*koňь", "Rekonstrueret hesteord med palatal n-lyd."],
  ["sr", "коњ", "Slutvokalen falder bort; њ skriver den palatale /ɲ/-lyd.", "arv", "konj · /koɲ/"]
], "Der findes flere konkurrerende forklaringer fra længere former og beslægtede hesteord. Ingen af dem er et sikkert første led.", ["коњ", "Reconstruction:Proto-Slavic/koňь"]);
add("ru", "horse", "Loshadʹ er dannet af et tyrkisk låneord med en slavisk endelse.", [
  ["turk", "*laša / *loša", "Foreslået tidlig tyrkisk form; petjenegisk eller bulgarsk er mulige donorsprog.", "arv", "", true],
  ["oes", "лоша", "Det tyrkiske hesteord lånes som loša.", "lån", "loša"],
  ["oes", "лошадь", "-dь tilføjes i slavisk orddannelse.", "orddannelse", "lošadĭ"],
  ["ru", "лошадь", "Slutvokalen forsvinder; d er blødt og bliver ustemt i slutposition.", "arv", "lošadʹ · /ˈɫoʂətʲ/"]
], "Det konkrete tyrkiske donorsprog er usikkert. Vi kan ikke føre låneordet tilbage til en første menneskelig hestelyd.", ["лошадь", "лоша"]);
