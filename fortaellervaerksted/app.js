const STORAGE_KEY = "fortaellervaerkstedet-v1";
const PROJECT_CATALOG_KEY = "fortaellervaerkstedet-projects-v1";
const ACTIVE_PROJECT_KEY = "fortaellervaerkstedet-active-project-v1";
const PROJECT_STATE_PREFIX = "fortaellervaerkstedet-project-v1:";
const API_BASE = location.protocol === "file:" ? "http://127.0.0.1:6210" : "";
const IS_CLOUD = location.protocol === "https:";
const SCENE_GRID = { x: 360, y: 250, z: 220 };
const SCENE_PANEL_HEIGHT = 218;
const SCENE_GROUND_Y = 330;
const SCENE_FLOAT_Y = SCENE_GROUND_Y - SCENE_PANEL_HEIGHT * 1.5;
const SCENE_PERSPECTIVE = 1200;
const CHAPTER_FRAME_GAP = 24;
const CHAPTER_MEMBER_GAP = 28;
const STORY_UNIT_GAP = 96;
const STORY_ROW_GAP = 190;

const modules = [
  { id: "scenes", label: "Scener", icon: "▦" },
  { id: "start", label: "Kom i gang", icon: "✦" },
  { id: "foundation", label: "Historiens DNA", icon: "⌁" },
  { id: "characters", label: "Personer", icon: "♙" },
  { id: "world", label: "Miljøer", icon: "◉" },
  { id: "plot", label: "Forløb", icon: "⌇" },
  { id: "storyboard", label: "Storyboard", icon: "▤" },
  { id: "draft", label: "Skriv & revidér", icon: "✎" }
];

const defaultState = {
  uiVersion: 2,
  active: "scenes",
  title: "",
  foundation: { premise: "", genre: "", audience: "", tone: "", theme: "", question: "", ending: "", promise: "" },
  world: { place: "", time: "", rules: "", pressure: "", sensory: "", history: "", contrast: "" },
  environments: [],
  characters: [],
  plot: { act1: "", act2: "", act3: "", act4: "", act5: "", opening: "", finalImage: "" },
  scenes: [],
  separators: [],
  sceneLineBreaks: [],
  sceneLinks: [],
  sceneLinksInitialized: false,
  sceneSpatialModel: 2,
  sceneCameraModel: 4,
  sceneLayoutModel: 4,
  sceneCamera: { x: 0, y: 0, z: 720, yaw: 0, pitch: -4 },
  sceneMoveSpeed: 1,
  backend: { brainDump: "", storyMood: "clear" },
  fullStory: "",
  fullStoryGeneratedAt: "",
  comicPages: [],
  comicGeneratedAt: "",
  draft: { ritual: "", weeklyGoal: "", pov: "", tense: "", voice: "", firstLine: "", notes: "" },
  idea: { person: "en pligtopfyldende fyrvogter", disturbance: "modtager et nødsignal fra et skib, der sank for tyve år siden", stake: "må vælge mellem sandheden og den familie, han beskytter" },
  ai: { chat: [] }
};

const ideas = {
  people: ["en pligtopfyldende fyrvogter", "en skoleelev, der aldrig lyver", "en pensioneret illusionist", "to søstre, som ikke har talt sammen i ti år", "en arkivar med fotografisk hukommelse", "en ung kok, der kan smage minder"],
  disturbances: ["modtager et nødsignal fra et skib, der sank for tyve år siden", "finder sit eget navn i en hundrede år gammel dagbog", "opdager, at alle byens ure går baglæns", "arver et hus, som kun findes om natten", "bliver forvekslet med den person, de frygter mest", "skal holde en hemmelighed, der ændrer sig hver gang den fortælles"],
  stakes: ["må vælge mellem sandheden og den familie, personen beskytter", "har kun tre døgn til at gøre en gammel uret ret", "risikerer at miste det eneste menneske, der tror på dem", "må ofre sit gode navn for at redde en fremmed", "kan få sit største ønske, men kun ved at blive den, personen hader", "må afsløre sin egen skyld for at stoppe katastrofen"]
};

const acts = [
  { n: 1, title: "Den kendte verden", prompt: "Vis hverdagen, fejlen og den forandring, der gør stilstand umulig.", label: "Opsætning · ca. 0–20%" },
  { n: 2, title: "Ind i det ukendte", prompt: "Din hovedperson handler efter sin gamle strategi og møder voksende modstand.", label: "Første forsøg · ca. 20–40%" },
  { n: 3, title: "Sandheden i midten", prompt: "En afsløring eller falsk sejr ændrer personens forståelse af konflikten.", label: "Midtpunkt · ca. 40–60%" },
  { n: 4, title: "Prisen stiger", prompt: "Konsekvenserne lukkes omkring personen. Det gamle selv slår ikke længere til.", label: "Krise · ca. 60–80%" },
  { n: 5, title: "Opgøret", prompt: "Et afgørende valg viser forandringen. Slutbilledet beviser historiens mening.", label: "Klimaks · ca. 80–100%" }
];

const lessons = [
  { no: "01", title: "Hvad en historie er", text: "En person vil noget, møder meningsfuld modstand og må forandre sig eller betale prisen.", time: "5 min", tag: "Fundament" },
  { no: "02", title: "Karakterens hellige fejl", text: "En overbevisning, der engang beskyttede personen, skaber nu problemer og former plottet.", time: "8 min", tag: "Person" },
  { no: "03", title: "Begær, behov og indsats", text: "Det synlige mål driver handlingen. Det skjulte behov skaber den indre bevægelse.", time: "7 min", tag: "Person" },
  { no: "04", title: "Fem akter som forandring", text: "Struktur er ikke en formel. Det er trykket, der tvinger en person fra tese gennem modsætning til et nyt selv.", time: "10 min", tag: "Plot" },
  { no: "05", title: "Vendepunkter og årsag", text: "Hver stor begivenhed bør ændre mulighederne og være en konsekvens af det, der kom før.", time: "8 min", tag: "Plot" },
  { no: "06", title: "Den proaktive scene", text: "Mål → konflikt → tilbageslag. Læseren ved, hvad personen vil, og frygter, at det mislykkes.", time: "6 min", tag: "Scene" },
  { no: "07", title: "Den reaktive scene", text: "Reaktion → dilemma → beslutning. Følelsen får plads, og næste handling vælges.", time: "6 min", tag: "Scene" },
  { no: "08", title: "Synsvinkel og distance", text: "Vælg, hvis sanser og fortolkning styrer scenen. Begrænsning skaber nærvær og spænding.", time: "8 min", tag: "Stil" },
  { no: "09", title: "Vis, fortæl og vælg", text: "Dramatisér forandringens øjeblikke. Sammenfat transporten mellem dem.", time: "7 min", tag: "Stil" },
  { no: "10", title: "Dialog og undertekst", text: "Mennesker siger sjældent præcis, hvad de vil. Lad målene støde sammen under ordene.", time: "9 min", tag: "Stil" },
  { no: "11", title: "Læs meget. Skriv meget.", text: "Byg dit sproglige værktøjssæt gennem læsning, og skriv fremad med en enkel rutine, før du forsøger at perfektionere.", time: "5 min", tag: "Praksis" },
  { no: "12", title: "Revision i lag", text: "Ret først historie, så scener, derefter afsnit og til sidst sætninger. Store problemer før små.", time: "10 min", tag: "Revision" }
];

const lessonDetails = [
  {
    lead: "En historie er en forandring, vi oplever gennem et menneske, der forsøger at få noget.",
    why: "Begivenheder er ikke automatisk en historie. De bliver til en historie, når de hænger sammen som årsag og virkning, presser en person til at handle og fører til en tilstand, der er anderledes end begyndelsen. Læseren følger både et ydre spørgsmål—lykkes det?—og et indre spørgsmål—hvem bliver personen undervejs?",
    method: ["Giv nogen et konkret ønske, som kan ses i handling.", "Skab modstand, der er personlig og bliver sværere.", "Lad handlinger få konsekvenser, som tvinger nye valg frem.", "Afslut med et valg, der besvarer historiens centrale spørgsmål."],
    example: "En kvinde mister toget er en hændelse. En kvinde mister toget med medicinen til sin søn, stjæler en bil og må vælge mellem at flygte fra politiet eller hjælpe en såret fremmed—det er begyndelsen på en historie.",
    exercise: "Skriv tre linjer: Min hovedperson vil ___. Men ___. Derfor må personen ___. Hvis du kan mærke et valg og en risiko, har du en brugbar kerne.",
    check: ["Kan jeg sige, hvad personen vil?", "Bliver noget sværere på grund af personens egne valg?", "Er verden eller personen forandret til sidst?"]
  },
  {
    lead: "Den stærkeste karakterfejl er ofte en gammel overlevelsesstrategi, ikke en tilfældig dårlig vane.",
    why: "En person bliver interessant, når deres måde at forstå verden på både hjælper og skader dem. Måske lærte de, at kontrol skaber sikkerhed, at tavshed beskytter familien, eller at kærlighed skal fortjenes. Strategien virkede engang. Nu gør den det umuligt at få det, de længes efter. Plottet bliver en række prøver af denne overbevisning.",
    method: ["Find en tidligere oplevelse, som gjorde fejlen forståelig.", "Formulér den som en overbevisning: ‘Hvis jeg ___, så ___.’", "Lad overbevisningen skabe et aktivt valg tidligt i historien.", "Byg klimakset omkring muligheden for at handle anderledes."],
    example: "Elias tror, at tavshed er loyalitet. Det gør ham til en pålidelig fyrvogter og søn, men også til medskyldig i øens løgn. Hans styrke og fejl er to sider af samme strategi.",
    exercise: "Fuldfør: Min person lærte engang, at ___. Derfor gør personen altid ___. Det beskytter dem mod ___, men forhindrer dem i ___.",
    check: ["Er fejlen forståelig?", "Skaber den konkrete problemer?", "Kan klimakset bevise, om overbevisningen er sand eller falsk?"]
  },
  {
    lead: "Det ydre mål skaber fremdrift. Det indre behov skaber betydning.",
    why: "Det, personen vil have, skal være konkret nok til at sætte scener i gang: vinde sagen, finde barnet, skjule brevet. Behovet er den ændring, personen ikke selv kan formulere endnu: turde stole på andre, tage ansvar eller opgive kontrollen. Indsatsen er det, der mistes ved nederlag—og den bør være både ydre, relationel og indre.",
    method: ["Skriv målet som et verbum: finde, vinde, beskytte, flygte.", "Gør målet målbart: Hvordan ved vi, om det lykkes?", "Find behovet ved at spørge, hvorfor personens normale strategi ikke er nok.", "Forbind indsatsen med det menneske eller den identitet, personen værdsætter mest."],
    example: "Mara vil finde bevis på, at hendes bror overlevede. Hun har brug for at acceptere en sandhed, hun ikke kan kontrollere. Hvis hun fejler, mister hun både svaret og den identitet, hun har bygget sin søgen på.",
    exercise: "Lav tre kolonner med overskrifterne VIL, BEHØVER og KAN MISTE. Skriv mindst tre svar i hver, og sæt ring om den kombination, der skaber det sværeste valg.",
    check: ["Kan målet filmes eller observeres?", "Er behovet forskelligt fra målet?", "Stiger indsatsen gennem historien?"]
  },
  {
    lead: "Akter er faser af forandring—ikke beholdere, der skal fyldes efter en matematisk opskrift.",
    why: "Fem akter gør midten lettere at forstå. Først ser vi den gamle orden. Så prøver personen at løse problemet med sin kendte strategi. Ved midtpunktet ændres forståelsen. Derefter rammer konsekvenserne hårdt, indtil et afgørende valg skaber en ny orden. Strukturen virker, fordi menneskelig forandring ofte bevæger sig gennem modstand og erkendelse.",
    method: ["Akt 1: Vis ubalancen og gør stilstand umulig.", "Akt 2: Lad den gamle strategi skabe både fremskridt og nye problemer.", "Akt 3: Afslør en sandhed, der ændrer historiens betydning.", "Akt 4: Fjern de lette udveje og lad prisen blive personlig.", "Akt 5: Lad handling, ikke forklaring, bevise forandringen."],
    example: "I begyndelsen beskytter Elias tavsheden. I anden akt undersøger han uden at udfordre øen. Midtvejs forstår han, at signalet kræver et vidne. I fjerde akt tilbydes han sikkerhed mod tavshed. I klimakset taler han offentligt.",
    exercise: "Skriv én beslutning for hver akt. Begynd hver linje med personens navn og et aktivt verbum. Hvis en akt kun rummer noget, der ‘sker for’ personen, så giv dem et valg.",
    check: ["Har hver akt en ny situation?", "Ændrer midtpunktet forståelsen?", "Spejler sidste akt den første på en meningsfuld måde?"]
  },
  {
    lead: "Et vendepunkt er en ændring i muligheder, mål eller forståelse—ikke bare en høj lyd.",
    why: "Tilfældige overraskelser kan skabe et kort chok, men årsag og virkning skaber tilfredshed. Et stærkt vendepunkt vokser ud af tidligere valg og gør næste handling nødvendig. Læseren skal både kunne blive overrasket nu og bagefter se, hvorfor det måtte ske.",
    method: ["Spørg: Hvilken tidligere handling forårsager dette?", "Gør ændringen uigenkaldelig eller dyr at omgøre.", "Lad den nye viden ændre personens næste mål.", "Plant nødvendige oplysninger tidligt uden at forklare deres fulde betydning."],
    example: "At en storm pludselig opstår, er en komplikation. At stormen afskærer øen, fordi Elias tidligere ignorerede varslet for at skjule sin undersøgelse, er en konsekvens—og derfor dramatisk stærkere.",
    exercise: "Tag tre store plotpunkter og forbind dem med ‘derfor’ i stedet for ‘og så’. Hvis sætningen ikke virker, mangler forbindelsen måske et valg eller en plantning.",
    check: ["Er vendepunktet forårsaget af noget?", "Ændrer det den næste handling?", "Kan læseren bagefter se de tidlige spor?"]
  },
  {
    lead: "En proaktiv scene giver læseren noget at håbe på og noget at frygte.",
    why: "I en proaktiv scene går synsvinkelpersonen efter et konkret mål. Modstanden vokser, og scenen ender med et tilbageslag: et nej, en ny fare, en sejr med en skjult pris eller et svar, der skaber et større spørgsmål. Klarheden om målet skaber spænding, fordi læseren kan vurdere hvert forsøg.",
    method: ["Mål: Hvad vil personen have inden scenen slutter?", "Konflikt: Hvem eller hvad modsætter sig det—og hvorfor?", "Eskalering: Lad hvert forsøg ændre taktikken eller prisen.", "Tilbageslag: Slut dårligere eller mere kompliceret end forventet."],
    example: "Mara vil finde sin brors navn i logbogen. Elias tøver, mens Søren nærmer sig fyret. Hun får gulvet op og finder bogen—men den afgørende side er revet ud. Målet lykkes delvist, mens problemet vokser.",
    exercise: "Planlæg en scene på fire linjer: Mål. Første hindring. Værre hindring. Tilbageslag. Skriv derefter scenen uden at forklare modellen.",
    check: ["Er målet specifikt og aktuelt?", "Kan modkraften også begrunde sin adfærd?", "Efterlader slutningen et nyt pres?"]
  },
  {
    lead: "Efter et slag har læseren og personen brug for at mærke det, forstå valget og vælge en retning.",
    why: "En reaktiv scene eller passage består af reaktion, dilemma og beslutning. Reaktionen gør konsekvensen følelsesmæssigt virkelig. Dilemmaet viser, at ingen mulighed er gratis. Beslutningen skaber næste mål og sender historien fremad igen. Den kan være en hel scene eller blot nogle få afsnit.",
    method: ["Reaktion: Lad kroppen og følelsen komme før analysen.", "Dilemma: Stil mindst to muligheder op med hver sin pris.", "Beslutning: Vælg aktivt—og skab det næste scenemål.", "Tilpas længden til slagets størrelse; store tab kræver mere plads."],
    example: "Efter den tomme redningsflåde benægter Elias først betydningen. Han kan fortælle Mara sandheden og miste øen eller tie og lade hende sejle i blinde. Han beslutter at hente den manglende logbogsside fra Søren.",
    exercise: "Skriv 150 ord efter din hovedpersons største tilbageslag. Brug rækkefølgen krop → følelse → muligheder → valg. Undgå at lade en anden person træffe beslutningen.",
    check: ["Får konsekvensen lov at mærkes?", "Har alle muligheder en pris?", "Skaber beslutningen handling?"]
  },
  {
    lead: "Synsvinkel er ikke kun, hvem der ser. Det er den bevidsthed, som giver verden betydning.",
    why: "Den samme stue er forskellig for en indbrudstyv, et barn og en person, der vender hjem efter tyve år. Vælg den synsvinkelperson, der har mest på spil i scenen. Begræns derefter informationen til det, personen kan sanse, vide og fortolke. Distance afgør, om fortælleren står tæt i kroppen eller længere tilbage med overblik.",
    method: ["Vælg scenens synsvinkel før du skriver.", "Filtrér detaljer gennem personens mål, erfaring og humør.", "Undgå umærkede spring ind i andre hoveder midt i scenen.", "Gå tættere på ved afgørende valg og længere væk ved overgange."],
    example: "‘Regnen løb ned ad ruden’ er neutral. For fyrvogteren kan den skjule revet; for Mara kan den ligne de lodrette ridser i hendes brors sidste fotografi. Detaljen bliver karakter og spænding på samme tid.",
    exercise: "Beskriv det samme køkken på 80 ord gennem to forskellige personer. Lad dem bemærke forskellige ting uden at nævne deres følelser direkte.",
    check: ["Har denne person mest at tabe i scenen?", "Ved teksten kun det, personen kan vide?", "Afslører detaljerne personens blik?"]
  },
  {
    lead: "Vis de øjeblikke, hvor noget ændrer sig. Fortæl det, der blot bringer os hen til dem.",
    why: "‘Vis, ikke fortæl’ er ikke en absolut regel. Dramatiseret handling giver nærvær, men sammenfatning giver tempo og rækkevidde. En roman, der viser alt, bliver langsom og betydningsløs. Vælg scene til konflikter, opdagelser og valg. Brug fortælling til rejser, gentagelser, baggrund og tidsforløb, som ikke behøver fuld oplevelse.",
    method: ["Dramatisér det uigenkaldelige øjeblik.", "Sammenfat gentagelser og transport.", "Brug specifikke sanser frem for en lang inventarliste.", "Lad beskrivelsen slutte i læserens forestilling; forklar ikke alt."],
    example: "Fortæl: ‘I tre uger undgik hun havnen.’ Vis: Den morgen hun endelig går derned, rækker havnefogeden hende broderens våde ur. Sammenfatningen skaber tid; scenen bærer ændringen.",
    exercise: "Markér en side med V for levende scene og F for fortællende sammenfatning. Er historiens vigtigste valg V? Er der transport eller gentagelse, som med fordel kan blive F?",
    check: ["Får vendepunkterne plads som scener?", "Springer teksten effektivt over det uvigtige?", "Kan læseren selv færdiggøre billedet?"]
  },
  {
    lead: "God dialog er handling med ord: nogen forsøger at ændre nogen eller skjule noget.",
    why: "Virkelige samtaler er fulde af gentagelser; fiktiv dialog udvælger de linjer, der bærer mål, relation og stemme. Undertekst opstår, når det sagte og det ønskede ikke er det samme. Personerne må gerne tale om kaffen, mens scenen i virkeligheden handler om svigt—så længe læseren kan mærke trykket.",
    method: ["Giv hver taler et mål med samtalen.", "Lad dem bruge forskellige taktikker: lokke, true, aflede, tie.", "Skær hilsner og forklaringer, som begge allerede kender.", "Brug kropslig handling, pauser og ordvalg i stedet for mange adverbier."],
    example: "‘Du kom sent,’ siger hun. ‘Færgen var forsinket.’ Han stiller den tørre paraply i hjørnet. Ordene handler om færgen; paraplyen afslører løgnen.",
    exercise: "Skriv en samtale, hvor A vil have B til at blive, men ingen må bruge ordene blive, gå, savne eller elske. Lad en genstand bære en del af underteksten.",
    check: ["Vil begge personer noget?", "Lyder de forskelligt?", "Er der spænding mellem ord og hensigt?"]
  },
  {
    lead: "En forfatter bygger sit værktøjssæt ved at læse opmærksomt og skrive regelmæssigt.",
    why: "Ordforråd, grammatik og stil er ikke pynt; de er redskaber til klarhed. Læsning viser, hvad prosa kan gøre, og afslører også det, du ikke selv vil gøre. En enkel rutine gør skrivningen mindre afhængig af inspiration. Første udkast må gerne opdage noget, planen ikke vidste.",
    method: ["Læs både i og uden for din valgte genre.", "Læg mærke til, hvor du bliver opslugt eller mister interessen.", "Vælg et gentageligt tidsrum og et beskedent mål.", "Skriv fremad i udkastet; lav korte noter om rettelser i stedet for at stoppe."],
    example: "Et mål på 300 ord fem dage om ugen bliver til omtrent 75.000 ord på et år. Det afgørende er ikke en heroisk weekend, men at vende tilbage til historien, mens den stadig lever i hukommelsen.",
    exercise: "Lav en syvdages aftale: hvornår, hvor, hvor længe og mindstemålet. Efter hver session noterer du kun: Hvad gjorde arbejdet let? Hvad er det næste konkrete øjeblik?",
    check: ["Er rutinen realistisk på en dårlig uge?", "Læser jeg som håndværker, ikke kun forbruger?", "Ved jeg, hvilken scene jeg åbner næste gang?"]
  },
  {
    lead: "Revision virker bedst udefra og ind: historie før kommaer.",
    why: "Det er spild at polere en scene, som senere skal slettes. Læg først udkastet væk længe nok til at læse det med friskere øjne. Undersøg derefter den store bevægelse, karakterens valg og slutningen. Gå videre til scenernes funktion, så afsnittenes fokus og til sidst sætningernes præcision.",
    method: ["Lag 1—historie: præmis, årsag, karakterbue og slutning.", "Lag 2—scener: mål, konflikt, vendepunkt, rækkefølge og tempo.", "Lag 3—afsnit: synsvinkel, dialog, beskrivelse og overgange.", "Lag 4—sætninger: præcise verber, rytme, gentagelser og korrektur."],
    example: "Hvis klimakset løses af en tilfældig redning, hjælper bedre adjektiver ikke. Først må hovedpersonens tidligere valg skabe løsningen eller prisen. Derefter kan scenen og sproget forfines.",
    exercise: "Skriv historien fra hukommelsen på én side uden at åbne manuskriptet. Det, du husker, er sandsynligvis rygraden. Sammenlign med udkastet, og markér alt, der ikke støtter eller udfordrer den.",
    check: ["Løser jeg store problemer før små?", "Har hver scene en funktion og et skift?", "Har jeg læst teksten højt i sidste lag?"]
  }
];

let currentLessonIndex = 0;

const exampleState = {
  uiVersion: 2,
  active: "scenes",
  title: "Lyset fra Vesterhavet",
  foundation: {
    premise: "Da en skyldbetynget fyrvogter modtager et nødsignal fra det skib, hans far lod synke, må han trodse øens tavshed og redde den eneste overlevende, før stormen udsletter beviset.",
    genre: "Mysterie / magisk realisme", audience: "Voksne", tone: "Mørk, salt og håbefuld",
    theme: "Sandheden kan koste os et tilhørsforhold, men løgnen koster os os selv.",
    question: "Vil Elias bryde familiens tavshed og nå vraget før stormfloden?",
    ending: "Elias tænder det gamle tågehorn og leder redningsbåden ind. Han fortæller øboerne, hvad hans far gjorde, og mister sit embede, men vinder et ærligt liv.",
    promise: "Et kammerspilsagtigt ø-mysterium, hvor havet synes at huske alt det, menneskene forsøger at glemme."
  },
  world: {
    place: "Den fiktive ø Gråholm i Vesterhavet; fyrtårnet, havnen, den lukkede kro og revet Sorte Tand.",
    time: "November 1998 over fem døgn", rules: "Havet gentager lyde fra uafsluttede dødsfald. Kun skyldige eller efterladte kan høre dem.",
    pressure: "Stormen afskærer færgen, radioen svigter, og øens råd kontrollerer redningsbåden.",
    sensory: "Salt i sprækkerne, petroleum, fugtigt uld, tågehornets dybe tone og grønt lys gennem regn.",
    history: "I 1978 sank fragtskibet Aurora. Øen byggede sin velstand på den last, der skyllede i land.",
    contrast: "Det trygge, varme fyr over for det åbne, sorte hav."
  },
  environments: [
    { id: "e1", name: "Gråholm", type: "Øsamfund", description: "En isoleret ø i Vesterhavet med fyrtårn, havn, kro og revet Sorte Tand.", rules: "Havet gentager lyde fra uafsluttede dødsfald; kun skyldige og efterladte kan høre dem.", atmosphere: "Mørk, salt, indelukket og hjemsøgt af tavshed", pressure: "Stormen afskærer færgen, radioen svigter, og øens råd kontrollerer redningsbåden.", sensory: "Salt i sprækkerne, petroleum, fugtigt uld, tågehorn og grønt lys gennem regn." }
  ],
  characters: [
    { id: "c1", name: "Elias Vinter", role: "Hovedperson", want: "Beholde fyret og familiens gode navn", need: "Tage ansvar for den sandhed, han har arvet", flaw: "Han forveksler tavshed med loyalitet", fear: "At blive udstødt som sin mor", secret: "Som barn hørte han sin far ignorere nødsignalet", change: "Fra vogter af løgnen til vidne for sandheden" },
    { id: "c2", name: "Mara Holm", role: "Modkraft / allieret", want: "Finde sin bror, som hun tror overlevede forliset", need: "Acceptere et svar, hun ikke kan kontrollere", flaw: "Hun bruger vrede til at undgå sorg", fear: "At hendes søgen har været meningsløs", secret: "Hun forfalskede signalet én gang før", change: "Fra ensom anklager til en, der tør stole på Elias" },
    { id: "c3", name: "Søren Vinter", role: "Antagonist", want: "Beskytte øens ry og økonomi", need: "Se, at fællesskab uden sandhed er medskyld", flaw: "Han mener, at flertallets overlevelse retfærdiggør alt", fear: "At øen tømmes", secret: "Han gav Elias’ far ordren", change: "Han vælger tavsheden helt og taber dermed Elias" }
  ],
  plot: {
    act1: "Elias passer fyret og undgår 20-årsdagen for Aurora-forliset. Et nødsignal med hans fars kaldesignal bryder ind over radioen. Mara ankommer med sidste færge.",
    act2: "Elias og Mara undersøger signalet. Ørådet spærrer arkivet. De finder skibets logbog under gulvet i fyret, men den afgørende side mangler.",
    act3: "Ved Sorte Tand finder de en redningsflåde og tror, nogen lever. Signalets stemme viser sig at være Maras bror – men fra fortiden. Elias indser, at havet ikke beder om redning, men om vidnesbyrd.",
    act4: "Søren afslører Elias’ fars rolle og tilbyder ham tavshed mod at beholde fyret. Stormfloden kommer, Mara sejler alene ud, og Elias mister både radio og adgang til redningsbåden.",
    act5: "Elias bryder fyrets tågehorn fri, kalder øboerne sammen og bekender sandheden. Tonen viser Mara en sikker rute hjem. Ved daggry slukker Elias fyret for sidste gang og forlader øen med logbogen.",
    opening: "Elias pudser fyrlinsen, mens resten af øen slukker lysene for mindedagen.", finalImage: "Det mørke fyr bag ham og morgensolen foran færgen."
  },
  scenes: [
    { id: "s1", act: 1, title: "Lyset slukkes", summary: "Elias gennemfører øens mindedagsritual og hører det umulige signal.", actorIds: ["c1"], locationId: "e1", pov: "Elias", setting: "Fyret · nat", goal: "Holde fyret stabilt", conflict: "Signalet bruger hans fars kode", turn: "Stemmen nævner Elias ved navn", audienceFeeling: "Tryghed i ritualet, som langsomt bliver til isnende uro.", purpose: "Fremdriver plottet" },
    { id: "s2", act: 1, title: "Sidste færge", summary: "Mara ankommer og kræver adgang til forlisets arkiv.", actorIds: ["c1","c2"], locationId: "e1", pov: "Elias", setting: "Havnen · morgen", goal: "Få Mara til at rejse", conflict: "Færgen er aflyst", turn: "Hun afspiller det samme signal", audienceFeeling: "Mistillid til Mara, efterfulgt af nysgerrighed og tvivl om Elias.", purpose: "Skaber relationel forandring" },
    { id: "s3", act: 2, title: "Under gulvet", summary: "De bryder fyrkammerets gulv op og finder logbogen.", actorIds: ["c1","c2","c3"], locationId: "e1", pov: "Mara", setting: "Fyret · aften", goal: "Finde sin brors navn", conflict: "Elias tøver og Søren er på vej", turn: "Den afgørende side er revet ud", audienceFeeling: "Forventningsfuld spænding, der knækker over i frustration.", purpose: "Planter eller indfrier noget" },
    { id: "s4", act: 3, title: "Sorte Tand", summary: "De når revet og opdager, hvad signalet virkelig er.", actorIds: ["c1","c2"], locationId: "e1", pov: "Elias", setting: "Revet · skumring", goal: "Redde den nødstedte", conflict: "Stormen og en tom flåde", turn: "Fortidens stemme beder ham fortælle sandheden", audienceFeeling: "Fysisk fare, der forvandles til sorg og ærefrygt.", purpose: "Afslører karakter" },
    { id: "s5", act: 4, title: "Sørens tilbud", summary: "Søren viser den manglende side og tilbyder Elias en handel.", actorIds: ["c1","c3"], locationId: "e1", pov: "Elias", setting: "Kroen · nat", goal: "Få siden", conflict: "Prisen er fortsat tavshed", turn: "Mara sejler ud alene", audienceFeeling: "Klaustrofobisk afmagt og vrede over den pris, Elias tilbydes.", purpose: "Skaber relationel forandring" },
    { id: "s6", act: 5, title: "Tågehornet", summary: "Elias bekender sandheden og bruger hornets tone til at lede Mara hjem.", actorIds: ["c1","c2","c3"], locationId: "e1", pov: "Elias", setting: "Fyret · stormnat", goal: "Redde Mara", conflict: "Øboerne forsøger at stoppe ham", turn: "Søren slipper rebet og lader hornet lyde", audienceFeeling: "Intens frygt, som udløses i mod, lettelse og forløsning.", purpose: "Fremdriver plottet" },
    { id: "s7", act: 5, title: "Morgensol", summary: "Elias forlader øen med logbogen, mens fyret står mørkt.", actorIds: ["c1","c2"], locationId: "e1", pov: "Mara", setting: "Færgen · daggry", goal: "Forstå hvad de vandt", conflict: "Tabet af hjem og embede", turn: "Havets stemmer er endelig stille", audienceFeeling: "Melankoli over tabet, men også en stille følelse af frihed.", purpose: "Afslører karakter" }
  ],
  separators: [
    { id: "sep1", type: "Akt", title: "Efterforskningen begynder", position: 2 },
    { id: "sep2", type: "Kapitel", title: "Sandheden kræver en pris", position: 4 }
  ],
  backend: { brainDump: "En skyldbetynget fyrvogter opdager, at et umuligt nødsignal forbinder øens gamle forlis med hans egen familie. Historien skal bevare tvivlen om, hvorvidt havets stemmer er overnaturlige eller menneskeskabte, indtil midtpunktet." },
  draft: { ritual: "45 minutter før morgenmad ved køkkenbordet", weeklyGoal: "2.500 ord", pov: "Tæt tredje person, skift mellem Elias og Mara", tense: "Datid", voice: "Sanselig, præcis, underspillet", firstLine: "Den nat øen mindedes de døde, talte havet med Elias’ fars stemme.", notes: "Hold magien tvetydig indtil midtpunktet. Gentag motivet med lys, der slukkes og tændes." },
  idea: { person: "en pligtopfyldende fyrvogter", disturbance: "modtager et nødsignal fra et skib, der sank for tyve år siden", stake: "må vælge mellem sandheden og den familie, han beskytter" },
  ai: { chat: [] }
};

const projectSetup = initializeProjectStorage();
let projectCatalog = projectSetup.catalog;
let activeProjectId = projectSetup.activeId;
let state = loadState();
let saveTimer;
let diskSaveTimer;
let diskHydrationFinished = false;
let diskSaveInFlight = false;
let diskSyncInFlight = false;
let aiConfigured = false;
let activeSuggestion = null;
let scene3DRuntime = null;
let pendingScenePosition = null;
let pendingSceneInsertIndex = null;
let sceneDraftWaitingForCharacter = null;
let selectedSceneIds = new Set();
let focusedSceneId = null;
let comicBackgroundJob = null;
let comicReadyPdf = null;
let projectNameAction = { mode:"create", projectId:"" };

const storyMoods = [
  { id:"clear", icon:"☀", label:"Solskin" },
  { id:"golden", icon:"◐", label:"Gylden time" },
  { id:"overcast", icon:"☁", label:"Gråvejr" },
  { id:"fog", icon:"≋", label:"Tåge" },
  { id:"storm", icon:"ϟ", label:"Storm" },
  { id:"night", icon:"☾", label:"Nat" },
  { id:"bleak", icon:"◆", label:"Dyster" }
];

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function projectStateKey(projectId) { return PROJECT_STATE_PREFIX + projectId; }
function initializeProjectStorage() {
  try {
    const existing = JSON.parse(localStorage.getItem(PROJECT_CATALOG_KEY) || "[]");
    if (Array.isArray(existing) && existing.length) {
      const requested = localStorage.getItem(ACTIVE_PROJECT_KEY);
      const activeId = existing.some(project => project.id === requested) ? requested : (existing.find(project => !project.archived) || existing[0]).id;
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeId); return { catalog:existing, activeId };
    }
  } catch {}
  const id = uid("project-"), legacy = localStorage.getItem(STORAGE_KEY);
  let migrated;
  try { migrated = legacy ? JSON.parse(legacy) : clone(defaultState); } catch { migrated = clone(defaultState); }
  const now = new Date().toISOString(), name = migrated.title || "Min første historie";
  const catalog = [{ id, name, archived:false, createdAt:now, updatedAt:now }];
  localStorage.setItem(projectStateKey(id), JSON.stringify(migrated));
  localStorage.setItem(PROJECT_CATALOG_KEY, JSON.stringify(catalog));
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  return { catalog, activeId:id };
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(projectStateKey(activeProjectId)) || "{}");
    const loaded = { ...clone(defaultState), ...saved, foundation: { ...defaultState.foundation, ...(saved.foundation || {}) }, world: { ...defaultState.world, ...(saved.world || {}) }, plot: { ...defaultState.plot, ...(saved.plot || {}) }, backend: { ...defaultState.backend, ...(saved.backend || {}) }, draft: { ...defaultState.draft, ...(saved.draft || {}) }, ai: { ...defaultState.ai, ...(saved.ai || {}) } };
    if (saved.uiVersion !== 2) { loaded.active = "scenes"; loaded.uiVersion = 2; }
    if (!Array.isArray(loaded.environments)) loaded.environments = [];
    if (!loaded.environments.length && nonempty(loaded.world?.place)) {
      loaded.environments.push({ id: "e-migrated", name: loaded.world.place.split(/[;,]/)[0].trim() || "Historiens verden", type: "Miljø", description: loaded.world.place, rules: loaded.world.rules, atmosphere: loaded.world.contrast, pressure: loaded.world.pressure, sensory: loaded.world.sensory });
    }
    loaded.scenes = (loaded.scenes || []).map(scene => ({ ...scene, actorIds: Array.isArray(scene.actorIds) ? scene.actorIds : [], locationId: scene.locationId || "", worldZ: 0 }));
    loaded.comicPages = Array.isArray(loaded.comicPages) ? loaded.comicPages : [];
    loaded.sceneLineBreaks = Array.isArray(loaded.sceneLineBreaks) ? loaded.sceneLineBreaks : [];
    if (saved.sceneSpatialModel !== 2 && loaded.scenes.length) {
      const positioned = loaded.scenes.filter(scene => Number.isFinite(Number(scene.worldY)));
      const averageY = positioned.length ? positioned.reduce((sum, scene) => sum + Number(scene.worldY), 0) / positioned.length : SCENE_FLOAT_Y;
      loaded.scenes = loaded.scenes.map(scene => ({ ...scene, worldY: Number.isFinite(Number(scene.worldY)) ? Number(scene.worldY) + SCENE_FLOAT_Y - averageY : SCENE_FLOAT_Y }));
    }
    loaded.sceneSpatialModel = 2;
    loaded.separators = Array.isArray(loaded.separators) ? loaded.separators.map(separator => ({
      ...separator,
      sceneIds: Array.isArray(separator.sceneIds)
        ? separator.sceneIds.filter(id => loaded.scenes.some(scene => scene.id === id))
        : loaded.scenes.slice(0, Math.max(1, Number(separator.position) || 1)).map(scene => scene.id)
    })).filter(separator => separator.sceneIds.length) : [];
    loaded.sceneLinks = Array.isArray(loaded.sceneLinks) ? loaded.sceneLinks : [];
    loaded.sceneLinksInitialized = Boolean(loaded.sceneLinksInitialized);
    if (saved.sceneCameraModel === 4) loaded.sceneCamera = { ...defaultState.sceneCamera, ...(loaded.sceneCamera || {}) };
    else {
      const count = loaded.scenes.length || 1;
      const center = loaded.scenes.reduce((sum, scene) => ({ x: sum.x + (Number(scene.worldX) || 0), y: sum.y + (Number(scene.worldY) || 0), z: sum.z + (Number(scene.worldZ) || 0) }), { x: 0, y: 0, z: 0 });
      loaded.sceneCamera = { x: center.x / count, y: center.y / count, z: center.z / count + 720, yaw: 0, pitch: 0 };
    }
    loaded.sceneCameraModel = 4;
    loaded.sceneLayoutNeedsMigration = saved.sceneLayoutModel !== 4;
    loaded.sceneLayoutModel = 4;
    if (loaded.sceneLayoutNeedsMigration) loaded.sceneCamera = { x:0, y:0, z:1100, yaw:0, pitch:0 };
    return loaded;
  }
  catch { return clone(defaultState); }
}
function saveState(show = false) {
  const now = new Date().toISOString();
  state.localRevisionAt = now;
  localStorage.setItem(projectStateKey(activeProjectId), JSON.stringify(state));
  projectCatalog = projectCatalog.map(project => project.id === activeProjectId ? { ...project, name:state.title?.trim() || project.name || "Uden titel", updatedAt:now } : project);
  localStorage.setItem(PROJECT_CATALOG_KEY, JSON.stringify(projectCatalog));
  localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
  document.querySelector("#save-status").textContent = IS_CLOUD ? "Gemmer i skyen…" : "Gemt lokalt";
  document.querySelector(".save-dot").style.background = "#6c9b76";
  if (show) toast("Dit arbejde er gemt");
  updateChrome();
  if (diskHydrationFinished && projectHasContent(state)) queueDiskAutosave();
}
function scheduleSave() {
  clearTimeout(saveTimer);
  const status = document.querySelector("#save-status");
  if (status) status.textContent = "Gemmer…";
  saveTimer = setTimeout(() => saveState(), 350);
}

function projectHasContent(projectState) {
  if (!projectState) return false;
  return Boolean(
    (projectState.scenes || []).length ||
    (projectState.characters || []).length ||
    (projectState.environments || []).length ||
    (projectState.separators || []).length ||
    String(projectState.backend?.brainDump || "").trim() ||
    String(projectState.fullStory || "").trim() ||
    Object.values(projectState.foundation || {}).some(value => String(value || "").trim()) ||
    (String(projectState.title || "").trim() && !/^(uden titel|min første historie|ny historie)$/i.test(String(projectState.title).trim()))
  );
}

function queueDiskAutosave() {
  clearTimeout(diskSaveTimer);
  diskSaveTimer = setTimeout(async () => {
    diskSaveTimer = null;
    diskSaveInFlight = true;
    try {
      const meta = projectCatalog.find(item => item.id === activeProjectId);
      const project = { ...clone(state), projectId:activeProjectId, title:state.title?.trim() || "Ny historie" };
      const result = await apiRequest("/api/autosave-story-project", { projectId:activeProjectId, project, archived:Boolean(meta?.archived) });
      state.diskFolder = result.folderName;
      state.savedToDiskAt = result.savedAt;
      localStorage.setItem(projectStateKey(activeProjectId), JSON.stringify(state));
      const status = document.querySelector("#save-status");
      if (status && IS_CLOUD) status.textContent = "Synkroniseret med skyen";
    } catch (error) {
      console.warn("Automatisk cloud-gemning er midlertidigt utilgængelig", error);
      const status = document.querySelector("#save-status");
      if (status && IS_CLOUD) status.textContent = "Kun gemt i denne browser";
    } finally {
      diskSaveInFlight = false;
    }
  }, 1200);
}

function persistProjectCatalog() {
  localStorage.setItem(PROJECT_CATALOG_KEY, JSON.stringify(projectCatalog));
  localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
}

function resetProjectRuntime() {
  clearTimeout(saveTimer);
  clearTimeout(diskSaveTimer);
  stopScene3D();
  selectedSceneIds.clear();
  focusedSceneId = null;
  pendingScenePosition = null;
  pendingSceneInsertIndex = null;
}

function projectDate(value) {
  try { return new Intl.DateTimeFormat("da-DK", { dateStyle:"medium", timeStyle:"short" }).format(new Date(value)); }
  catch { return ""; }
}

function renderProjectList() {
  const host = document.querySelector("#project-list");
  if (!host) return;
  const section = (title, projects, archived = false) => {
    if (!projects.length) return archived ? "" : `<div class="project-empty">Ingen aktive historier endnu.</div>`;
    return `<div class="project-section-title">${title}</div>${projects.map(project => `
      <div class="project-row ${project.id === activeProjectId ? "active" : ""} ${archived ? "archived" : ""}">
        <button type="button" class="project-open" data-switch-project="${escapeHTML(project.id)}">
          <strong>${escapeHTML(project.name || "Uden titel")}${project.id === activeProjectId ? " · åben" : ""}</strong>
          <small>Senest gemt ${escapeHTML(projectDate(project.updatedAt))}</small>
        </button>
        <div class="project-actions">
          <button type="button" data-project-action="rename" data-project-id="${escapeHTML(project.id)}">Omdøb</button>
          <button type="button" data-project-action="duplicate" data-project-id="${escapeHTML(project.id)}">Duplikér</button>
          <button type="button" data-project-action="${archived ? "unarchive" : "archive"}" data-project-id="${escapeHTML(project.id)}">${archived ? "Gendan" : "Arkivér"}</button>
          <button type="button" class="project-delete" data-project-action="delete" data-project-id="${escapeHTML(project.id)}">Slet</button>
        </div>
      </div>`).join("")}`;
  };
  host.innerHTML = section("Aktive historier", projectCatalog.filter(project => !project.archived)) + section("Arkiv", projectCatalog.filter(project => project.archived), true);
}

function openProjectDialog() {
  saveState();
  renderProjectList();
  document.querySelector("#project-dialog").showModal();
}

function switchProject(projectId, message = "Historien er åbnet") {
  const project = projectCatalog.find(item => item.id === projectId);
  if (!project) return;
  saveState();
  resetProjectRuntime();
  activeProjectId = projectId;
  persistProjectCatalog();
  state = loadState();
  document.querySelector("#project-dialog")?.close();
  render();
  renderChat();
  applyStoryMood();
  toast(message);
}

function createProjectRecord(name, activate = true) {
  const id = uid("project-");
  const now = new Date().toISOString();
  const newState = { ...clone(defaultState), title:name, active:"scenes" };
  localStorage.setItem(projectStateKey(id), JSON.stringify(newState));
  projectCatalog.push({ id, name, archived:false, createdAt:now, updatedAt:now });
  persistProjectCatalog();
  if (activate) switchProject(id, "Den nye historie er klar");
  return id;
}

function openProjectNameDialog(mode, projectId = "") {
  const project = projectCatalog.find(item => item.id === projectId);
  projectNameAction = { mode, projectId };
  document.querySelector("#project-name-eyebrow").textContent = mode === "rename" ? "Omdøb historie" : "Ny historie";
  document.querySelector("#project-name-heading").textContent = mode === "rename" ? "Giv historien et nyt navn" : "Hvad skal historien hedde?";
  document.querySelector("#submit-project-name").textContent = mode === "rename" ? "Gem navn" : "Opret historie";
  const input = document.querySelector("#project-name-input");
  input.value = mode === "rename" ? project?.name || "" : "Ny historie";
  const dialog = document.querySelector("#project-name-dialog");
  dialog.showModal(); input.focus(); input.select();
}
function closeProjectNameDialog() { document.querySelector("#project-name-dialog")?.close(); }
function createProject() { openProjectNameDialog("create"); }
function submitProjectName(event) {
  event.preventDefault();
  const name = document.querySelector("#project-name-input").value.trim();
  if (!name) { document.querySelector("#project-name-input").focus(); return toast("Skriv et navn til historien"); }
  if (projectNameAction.mode === "rename") {
    const project = projectCatalog.find(item => item.id === projectNameAction.projectId); if (!project) return closeProjectNameDialog();
    project.name = name; project.updatedAt = new Date().toISOString();
    try { const projectState = JSON.parse(localStorage.getItem(projectStateKey(project.id)) || "{}"); projectState.title = name; localStorage.setItem(projectStateKey(project.id), JSON.stringify(projectState)); } catch {}
    if (project.id === activeProjectId) { state.title = name; saveState(); render(); }
    else if (IS_CLOUD) {
      try {
        const projectState = JSON.parse(localStorage.getItem(projectStateKey(project.id)) || "{}");
        apiRequest("/api/autosave-story-project", { projectId:project.id, project:{ ...projectState, projectId:project.id, title:name }, archived:Boolean(project.archived) }).catch(error => console.warn("Navnet kunne ikke synkroniseres", error));
      } catch {}
    }
    persistProjectCatalog(); closeProjectNameDialog(); renderProjectList(); toast("Historien er omdøbt");
    return;
  }
  closeProjectNameDialog(); createProjectRecord(name);
}

function renameProject(projectId) {
  const project = projectCatalog.find(item => item.id === projectId);
  if (!project) return;
  openProjectNameDialog("rename", projectId);
}

function duplicateProject(projectId) {
  const source = projectCatalog.find(item => item.id === projectId);
  if (!source) return;
  let copy;
  try { copy = JSON.parse(localStorage.getItem(projectStateKey(projectId)) || "{}"); }
  catch { copy = clone(defaultState); }
  const id = uid("project-"), now = new Date().toISOString(), name = `${source.name || "Uden titel"} – kopi`;
  copy.title = name;
  localStorage.setItem(projectStateKey(id), JSON.stringify(copy));
  projectCatalog.push({ id, name, archived:false, createdAt:now, updatedAt:now });
  persistProjectCatalog(); renderProjectList(); toast("Historien er duplikeret");
  if (IS_CLOUD) apiRequest("/api/autosave-story-project", { projectId:id, project:{ ...copy, projectId:id }, archived:false }).catch(error => console.warn("Kopien kunne ikke synkroniseres", error));
}

function archiveProject(projectId, archived) {
  const project = projectCatalog.find(item => item.id === projectId);
  if (!project) return;
  project.archived = archived; project.updatedAt = new Date().toISOString();
  persistProjectCatalog();
  if (IS_CLOUD) {
    try {
      const stored = JSON.parse(localStorage.getItem(projectStateKey(projectId)) || "{}");
      apiRequest("/api/autosave-story-project", { projectId, project:{ ...stored, projectId, title:stored.title || project.name }, archived }).catch(error => console.warn("Arkivstatus kunne ikke synkroniseres", error));
    } catch {}
  }
  if (archived && projectId === activeProjectId) {
    let next = projectCatalog.find(item => !item.archived && item.id !== projectId);
    if (!next) { const id = createProjectRecord("Ny historie", false); next = projectCatalog.find(item => item.id === id); }
    switchProject(next.id, "Historien er arkiveret");
  } else { renderProjectList(); toast(archived ? "Historien er arkiveret" : "Historien er gendannet"); }
}

async function deleteProject(projectId) {
  const project = projectCatalog.find(item => item.id === projectId);
  if (!project || !confirm(`Slet “${project.name || "Uden titel"}” permanent? Denne handling kan ikke fortrydes.`)) return;
  if (IS_CLOUD) {
    try { await apiRequest("/api/delete-story-project", { projectId }); }
    catch (error) { alert(error.message || "Historien kunne ikke slettes fra skyen."); return; }
  }
  localStorage.removeItem(projectStateKey(projectId));
  projectCatalog = projectCatalog.filter(item => item.id !== projectId);
  if (projectId === activeProjectId) {
    let next = projectCatalog.find(item => !item.archived) || projectCatalog[0];
    if (!next) { const id = createProjectRecord("Ny historie", false); next = projectCatalog.find(item => item.id === id); }
    activeProjectId = next.id; persistProjectCatalog(); resetProjectRuntime(); state = loadState(); render(); renderChat(); applyStoryMood();
  } else persistProjectCatalog();
  renderProjectList(); toast("Historien er slettet");
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Billedet kunne ikke læses");
  const blob = await response.blob();
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
}

async function exportProjectBackup() {
  saveState();
  const button = document.querySelector("#export-project-backup");
  const oldText = button.textContent, suggestedName = `fortaellervaerkstedet-backup-${new Date().toISOString().slice(0,10)}.json`;
  button.disabled = true; button.textContent = "Samler backup…";
  const assets = {}; let missing = 0;
  try {
    const projects = projectCatalog.map(meta => {
      let projectState; try { projectState = JSON.parse(localStorage.getItem(projectStateKey(meta.id)) || "{}"); } catch { projectState = clone(defaultState); }
      return { meta:{ ...meta }, state:projectState };
    });
    for (const project of projects) {
      const candidates = [
        ...(project.state.characters || []).filter(item => item.portraitUrl).map(item => ({ key:`${project.meta.id}/characters/${item.id}`, url:item.portraitUrl })),
        ...(project.state.scenes || []).filter(item => item.imageUrl).map(item => ({ key:`${project.meta.id}/scenes/${item.id}`, url:item.imageUrl })),
        ...(project.state.comicPages || []).filter(item => item.url).map((item,index) => ({ key:`${project.meta.id}/comic/${index}`, url:item.url }))
      ];
      for (const asset of candidates) { try { assets[asset.key] = await imageUrlToDataUrl(asset.url); } catch { missing += 1; } }
    }
    const backup = { format:"fortaellervaerkstedet-backup", version:1, exportedAt:new Date().toISOString(), projects, assets };
    const blob = new Blob([JSON.stringify(backup)], { type:"application/json" });
    button.textContent = "Vælg placering…";
    const fileHandle = typeof window.showSaveFilePicker === "function"
      ? await window.showSaveFilePicker({
          suggestedName,
          types:[{ description:"Fortællerværkstedets fulde sikkerhedskopi", accept:{ "application/json":[".json"] } }]
        })
      : null;
    if (fileHandle) {
      button.textContent = "Gemmer backup…";
      const writable = await fileHandle.createWritable(); await writable.write(blob); await writable.close();
    } else {
      const url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = suggestedName; link.click(); URL.revokeObjectURL(url);
    }
    toast(missing ? `Backup gemt · ${missing} billede(r) kunne ikke medtages` : "Fuld sikkerhedskopi er gemt");
  } catch (error) {
    if (error?.name !== "AbortError") toast(error.message || "Sikkerhedskopien kunne ikke gemmes");
  } finally { button.disabled = false; button.textContent = oldText; }
}

async function restoreStoriesFromDisk() {
  const button = document.querySelector("#restore-stories-from-disk"), oldText = button.textContent;
  button.disabled = true; button.textContent = "Finder historier…";
  try {
    saveState();
    const result = await fetch(`${API_BASE}/api/story-folders`, { cache:"no-store" });
    const payload = await result.json();
    if (!result.ok) throw new Error(payload.error || "Stories-mappen kunne ikke læses.");
    const candidates = Array.isArray(payload.projects) ? payload.projects : [];
    if (!candidates.length) return toast(IS_CLOUD ? "Ingen gemte historier blev fundet i skyen" : "Ingen gemte historier blev fundet i Stories");
    const restoredIds = [];
    for (const candidate of candidates) {
      const incoming = candidate.state || {};
      const diskIdentity = String(candidate.folderName || incoming.diskFolder || "");
      const existing = projectCatalog.find(meta => {
        try {
          const stored = JSON.parse(localStorage.getItem(projectStateKey(meta.id)) || "{}");
          return diskIdentity && (stored.recoveredFromDiskFolder === diskIdentity || stored.diskFolder === diskIdentity);
        } catch { return false; }
      });
      if (existing) continue;
      const preferredId = String(incoming.projectId || "").trim();
      const id = preferredId && !projectCatalog.some(item => item.id === preferredId) ? preferredId : uid("project-"), now = new Date().toISOString();
      const projectState = { ...clone(defaultState), ...incoming, recoveredFromDiskFolder:diskIdentity };
      let name = candidate.title || projectState.title || diskIdentity || "Gendannet historie";
      if (projectCatalog.some(item => item.name === name)) name += " (gendannet)";
      projectState.title = name;
      localStorage.setItem(projectStateKey(id), JSON.stringify(projectState));
      projectCatalog.push({ id, name, archived:Boolean(candidate.archived), createdAt:candidate.createdAt || candidate.savedAt || now, updatedAt:now });
      restoredIds.push(id);
    }
    persistProjectCatalog();
    if (restoredIds.length) switchProject(restoredIds[0], `${restoredIds.length} historie(r) er gendannet ${IS_CLOUD ? "fra skyen" : "fra Stories"}`);
    else toast(IS_CLOUD ? "Historierne fra skyen er allerede i projektbiblioteket" : "Historierne fra Stories er allerede i projektbiblioteket");
    renderProjectList();
  } catch (error) { alert(error.message || "Historierne kunne ikke gendannes fra disk."); }
  finally { button.disabled = false; button.textContent = oldText; }
}

async function hydrateProjectsFromDisk({ notify = false } = {}) {
  if (diskSyncInFlight) return;
  diskSyncInFlight = true;
  try {
    const response = await fetch(`${API_BASE}/api/story-folders`, { cache:"no-store" });
    if (!response.ok) return;
    const payload = await response.json(), candidates = Array.isArray(payload.projects) ? payload.projects : [];
    if (!candidates.length) return;

    const localStates = projectCatalog.map(meta => {
      try { return { meta, state:JSON.parse(localStorage.getItem(projectStateKey(meta.id)) || "{}") }; }
      catch { return { meta, state:{} }; }
    });
    const onlyEmptyPlaceholders = localStates.length > 0 && localStates.every(item => !projectHasContent(item.state));
    if (onlyEmptyPlaceholders) {
      for (const item of localStates) localStorage.removeItem(projectStateKey(item.meta.id));
      projectCatalog = [];
    }

    const importedIds = [], updatedIds = [];
    let activeProjectUpdated = false;
    for (const candidate of candidates) {
      const incoming = candidate.state || {}, diskIdentity = String(candidate.folderName || incoming.diskFolder || ""), incomingId = String(incoming.projectId || "").trim();
      const existing = projectCatalog.find(meta => {
        if (incomingId && meta.id === incomingId) return true;
        try {
          const stored = JSON.parse(localStorage.getItem(projectStateKey(meta.id)) || "{}");
          return (incomingId && stored.projectId === incomingId) || (diskIdentity && (stored.diskFolder === diskIdentity || stored.recoveredFromDiskFolder === diskIdentity));
        } catch { return false; }
      });
      if (existing) {
        let stored = {};
        try { stored = JSON.parse(localStorage.getItem(projectStateKey(existing.id)) || "{}"); } catch {}
        const diskSavedAt = candidate.savedAt || incoming.savedToDiskAt || "";
        const diskTime = Date.parse(diskSavedAt) || 0;
        const localDiskTime = Date.parse(stored.savedToDiskAt || "") || 0;
        const localEditTime = Date.parse(stored.localRevisionAt || "") || 0;
        const hasUnsavedLocalChanges = localEditTime > localDiskTime + 250;
        existing.archived = Boolean(candidate.archived);
        if (diskTime > localDiskTime + 250 && !hasUnsavedLocalChanges) {
          const projectState = { ...clone(defaultState), ...incoming, projectId:existing.id, diskFolder:diskIdentity || incoming.diskFolder, recoveredFromDiskFolder:diskIdentity };
          projectState.title = candidate.title || projectState.title || existing.name || diskIdentity || "Gendannet historie";
          localStorage.setItem(projectStateKey(existing.id), JSON.stringify(projectState));
          existing.name = projectState.title;
          existing.updatedAt = diskSavedAt || new Date().toISOString();
          updatedIds.push(existing.id);
          if (existing.id === activeProjectId) activeProjectUpdated = true;
        }
        continue;
      }
      const id = incomingId && !projectCatalog.some(item => item.id === incomingId) ? incomingId : uid("project-"), now = new Date().toISOString();
      const projectState = { ...clone(defaultState), ...incoming, projectId:id, diskFolder:diskIdentity || incoming.diskFolder, recoveredFromDiskFolder:diskIdentity };
      const name = candidate.title || projectState.title || diskIdentity || "Gendannet historie";
      projectState.title = name;
      localStorage.setItem(projectStateKey(id), JSON.stringify(projectState));
      projectCatalog.push({ id, name, archived:Boolean(candidate.archived), createdAt:candidate.createdAt || candidate.savedAt || now, updatedAt:candidate.savedAt || now });
      importedIds.push(id);
    }

    if (!projectCatalog.length) return;
    if (onlyEmptyPlaceholders || !projectCatalog.some(item => item.id === activeProjectId)) {
      activeProjectId = importedIds[0] || projectCatalog[0].id;
      persistProjectCatalog();
      resetProjectRuntime();
      state = loadState();
      render();
      renderChat();
      applyStoryMood();
      if (importedIds.length) toast(`${importedIds.length} historie(r) hentet ${IS_CLOUD ? "fra skyen" : "fra Stories"}`);
    } else if (activeProjectUpdated) {
      persistProjectCatalog();
      resetProjectRuntime();
      state = loadState();
      render();
      renderChat();
      applyStoryMood();
      if (notify) toast("Historien er opdateret fra Stories");
    } else {
      persistProjectCatalog();
      renderProjectList();
      if (importedIds.length) toast(`${importedIds.length} manglende historie(r) hentet ${IS_CLOUD ? "fra skyen" : "fra Stories"}`);
    }
  } catch (error) {
    console.warn(IS_CLOUD ? "Cloudlageret kunne ikke indlæses ved opstart" : "Stories-mappen kunne ikke indlæses ved opstart", error);
  } finally {
    diskHydrationFinished = true;
    diskSyncInFlight = false;
  }
}

async function importProjectBackup(file) {
  if (!file) return;
  const button = document.querySelector("#import-project-backup"), oldText = button.textContent;
  button.disabled = true; button.textContent = "Importerer…";
  try {
    const backup = JSON.parse(await file.text());
    if (backup.format !== "fortaellervaerkstedet-backup" || backup.version !== 1 || !Array.isArray(backup.projects)) throw new Error("Filen er ikke en gyldig sikkerhedskopi fra Fortællerværkstedet.");
    saveState(); const importedIds = [];
    for (const incoming of backup.projects) {
      const oldId = incoming.meta?.id, id = uid("project-"), now = new Date().toISOString();
      const projectState = { ...clone(defaultState), ...(incoming.state || {}) };
      let name = incoming.meta?.name || projectState.title || "Importeret historie";
      if (projectCatalog.some(item => item.name === name)) name += " (importeret)";
      projectState.title = name;
      for (const character of projectState.characters || []) {
        const dataUrl = backup.assets?.[`${oldId}/characters/${character.id}`];
        if (dataUrl) { const result = await apiRequest("/api/project-asset", { projectId:id, kind:"characters", entityId:character.id, dataUrl }); character.portraitUrl = result.url; }
      }
      for (const scene of projectState.scenes || []) {
        const dataUrl = backup.assets?.[`${oldId}/scenes/${scene.id}`];
        if (dataUrl) { const result = await apiRequest("/api/project-asset", { projectId:id, kind:"scenes", entityId:scene.id, dataUrl }); scene.imageUrl = result.url; }
      }
      for (const [index, page] of (projectState.comicPages || []).entries()) {
        const dataUrl = backup.assets?.[`${oldId}/comic/${index}`];
        if (dataUrl) { const result = await apiRequest("/api/project-asset", { projectId:id, kind:"comic", entityId:`page-${String(index + 1).padStart(2,"0")}`, dataUrl }); page.url = result.url; }
      }
      localStorage.setItem(projectStateKey(id), JSON.stringify(projectState));
      projectCatalog.push({ id, name, archived:Boolean(incoming.meta?.archived), createdAt:incoming.meta?.createdAt || now, updatedAt:now }); importedIds.push(id);
    }
    persistProjectCatalog();
    if (importedIds.length) switchProject(importedIds[0], `${importedIds.length} historie(r) er importeret`);
    renderProjectList();
  } catch (error) { alert(error.message || "Sikkerhedskopien kunne ikke importeres."); }
  finally { button.disabled = false; button.textContent = oldText; document.querySelector("#project-backup-file").value = ""; }
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function nonempty(v) { return typeof v === "string" && v.trim().length > 2; }

function moduleProgress(id) {
  const checks = {
    start: [state.title],
    foundation: Object.values(state.foundation),
    characters: [state.characters.length >= 2 ? "yes" : ""],
    world: [state.environments?.length ? "yes" : ""],
    plot: Object.values(state.plot),
    scenes: [state.scenes.length >= 5 ? "yes" : ""],
    storyboard: [state.scenes.length >= 5 ? "yes" : ""],
    draft: Object.values(state.draft)
  }[id] || [];
  return checks.length ? Math.round(checks.filter(v => typeof v === "string" ? nonempty(v) : Boolean(v)).length / checks.length * 100) : 0;
}
function totalProgress() { return Math.round(modules.reduce((sum, m) => sum + moduleProgress(m.id), 0) / modules.length); }

function updateChrome() {
  const current = modules.find(m => m.id === state.active);
  document.querySelector("#breadcrumb").textContent = current?.label || "Håndværksbibliotek";
  document.querySelector("#sidebar-title").textContent = state.title || "Uden titel";
  const pct = totalProgress();
  document.querySelector("#top-progress").textContent = pct + "%";
  document.querySelector("#top-progress-bar").style.width = pct + "%";
  renderNav();
}

function renderNav() {
  document.querySelector("#main-nav").innerHTML = modules.map(m => {
    const progress = moduleProgress(m.id);
    return `<button class="nav-item ${state.active === m.id ? "active" : ""} ${progress >= 80 ? "done" : ""}" data-nav="${m.id}" type="button"><span class="nav-icon">${m.icon}</span><span>${m.label}</span><span class="nav-number">${progress >= 80 ? "✓" : progress ? `${progress}%` : ""}</span></button>`;
  }).join("");
}

function pageHead(kicker, title, lead) {
  const progress = moduleProgress(state.active);
  return `<header class="page-head"><div class="page-title"><span class="eyebrow">${kicker}</span><h1>${title}</h1><p class="lead">${lead}</p></div><div class="page-meta"><strong>${progress}%</strong>udfyldt i dette kapitel</div></header>`;
}
function lessonStrip(title, text, target = "academy") {
  return `<div class="lesson-strip"><div class="lesson-icon">⌘</div><div><strong>${title}</strong><p>${text}</p></div><button type="button" data-nav="${target}">Åbn lektionen →</button></div>`;
}
function field(path, label, placeholder, opts = {}) {
  const value = getPath(path) || "";
  const tag = opts.type === "select" ? "select" : opts.rows ? "textarea" : "input";
  const hint = opts.hint ? `<p class="hint">${opts.hint}</p>` : "";
  let control;
  if (tag === "textarea") control = `<textarea data-path="${path}" rows="${opts.rows}" placeholder="${escapeHTML(placeholder)}" class="${opts.big ? "big-input" : ""}">${escapeHTML(value)}</textarea>`;
  else if (tag === "select") control = `<select data-path="${path}"><option value="">Vælg…</option>${opts.options.map(o => `<option ${value === o ? "selected" : ""}>${escapeHTML(o)}</option>`).join("")}</select>`;
  else control = `<input data-path="${path}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" class="${opts.big ? "big-input" : ""}>`;
  const aiAllowed = tag !== "select" && opts.ai !== false;
  const aiButton = aiAllowed ? `<button class="ai-field-button" type="button" data-ai-path="${path}" data-ai-label="${escapeHTML(label)}">✦ Giv AI-forslag</button>` : (opts.optional ? "<em>valgfrit</em>" : "");
  return `<label class="field"><span><span>${label}${opts.optional ? " <em>valgfrit</em>" : ""}</span>${aiButton}</span>${control}${hint}</label>`;
}
function getPath(path) { return path.split(".").reduce((o, k) => o?.[k], state); }
function setPath(path, value) {
  const parts = path.split("."); let cursor = state;
  parts.slice(0, -1).forEach(k => cursor = cursor[k]); cursor[parts.at(-1)] = value;
}

function aiConnectionBanner() {
  if (aiConfigured) return "";
  const message = location.protocol === "file:"
    ? "AI-funktionerne kræver den lokale værkstedsserver. Start fremover med “Start værkstedet.cmd”."
    : "Forbind din OpenAI-nøgle for at få forslag og bruge den kreative sparringspartner.";
  return `<div class="ai-offline-banner"><span><strong>AI er ikke forbundet endnu.</strong> ${message}</span><button type="button" data-open-ai>Forbind AI →</button></div>`;
}

function projectSnapshot() {
  return {
    projectId: activeProjectId,
    title: state.title,
    foundation: state.foundation,
    characters: state.characters,
    environments: state.environments,
    world: state.world,
    plot: state.plot,
    scenes: state.scenes,
    separators: state.separators,
    sceneLinks: state.sceneLinks,
    backend: state.backend,
    draft: state.draft
  };
}

async function apiRequest(path, payload, options = {}) {
  let response;
  const controller = options.timeoutMs || options.signal ? new AbortController() : null;
  const externalAbort = () => controller?.abort(options.signal?.reason);
  if (options.signal?.aborted) externalAbort(); else options.signal?.addEventListener("abort", externalAbort, { once:true });
  const timeout = options.timeoutMs && controller ? setTimeout(() => controller.abort(), options.timeoutMs) : null;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: controller?.signal
    });
  } catch (error) {
    if (error?.name === "AbortError" && options.signal?.aborted) {
      const cancelled = new Error("Genereringen blev annulleret"); cancelled.name = "ComicGenerationCancelledError"; throw cancelled;
    }
    if (error?.name === "AbortError") throw new Error("AI-billedet overskred tidsgrænsen og prøves igen.");
    throw new Error("Værkstedsserveren svarer ikke. Genindlæs appen eller start værkstedet igen.");
  } finally {
    if (timeout) clearTimeout(timeout);
    options.signal?.removeEventListener("abort", externalAbort);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "AI-forbindelsen svarede ikke som forventet.");
  return data;
}

async function checkAiStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    const data = await response.json();
    aiConfigured = Boolean(data.configured);
    document.querySelector("#ai-status-dot")?.classList.toggle("online", aiConfigured);
    document.querySelector("#ai-setup").hidden = aiConfigured;
    document.querySelectorAll(".ai-offline-banner").forEach(banner => { banner.hidden = aiConfigured; });
    return aiConfigured;
  } catch {
    aiConfigured = false;
    document.querySelector("#ai-status-dot")?.classList.remove("online");
    document.querySelector("#ai-setup").hidden = false;
    return false;
  }
}

async function openAiDrawer(focusInput = true) {
  document.querySelector("#ai-drawer").classList.add("open");
  document.querySelector("#ai-drawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("coach-open");
  renderChat();
  await checkAiStatus();
  if (focusInput) setTimeout(() => document.querySelector("#chat-input")?.focus(), 180);
}

async function openApiKeyPanel() {
  if (IS_CLOUD) {
    await openAiDrawer(false);
    toast(aiConfigured ? "AI-nøglen administreres sikkert i Cloudflare" : "AI-nøglen mangler i Cloudflare");
    return;
  }
  await openAiDrawer(false);
  document.querySelector("#ai-setup").hidden = false;
  document.querySelector("#api-key-heading").textContent = aiConfigured ? "Udskift API-nøgle" : "Giv coachen en nøgle";
  setTimeout(() => document.querySelector("#api-key-input")?.focus(), 80);
}

function closeAiDrawer() {
  document.querySelector("#ai-drawer").classList.remove("open");
  document.querySelector("#ai-drawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("coach-open");
}
function toggleAiDrawer(focusInput = false) { document.querySelector("#ai-drawer")?.classList.contains("open") ? closeAiDrawer() : openAiDrawer(focusInput); }

function renderChat(pending = false) {
  const messages = state.ai?.chat || [];
  const target = document.querySelector("#chat-messages");
  if (!target) return;
  const welcome = messages.length ? "" : `<div class="chat-welcome"><span class="eyebrow">Kreativ sparring</span><h3>Hvor skal vi begynde?</h3><p>Jeg kan se din nuværende historieplan og hjælpe med karakterer, konflikt, struktur, scener og sproglige muligheder. Jeg stiller også gerne kritiske spørgsmål.</p></div>`;
  target.innerHTML = welcome + messages.map(message => `<div class="chat-message ${message.role}"><div class="chat-bubble">${escapeHTML(message.content)}</div></div>`).join("") + (pending ? `<div class="chat-message assistant pending"><div class="chat-bubble">Tænker med din historie…</div></div>` : "");
  target.scrollTop = target.scrollHeight;
  const pieces = [state.characters.length && `${state.characters.length} personer`, state.environments.length && `${state.environments.length} miljøer`, state.scenes.length && `${state.scenes.length} scener`, nonempty(state.backend?.brainDump) && "braindump", nonempty(state.foundation.premise) && "præmis", nonempty(state.plot.act5) && "slutning"].filter(Boolean);
  document.querySelector("#chat-context-label").textContent = pieces.length ? `Ser ${pieces.join(" · ")}` : "Ser hele din historie";
}

async function saveApiKey() {
  const input = document.querySelector("#api-key-input");
  const key = input.value.trim();
  if (!key) return toast("Indsæt din OpenAI API-nøgle");
  const button = document.querySelector("#save-api-key"); button.disabled = true; button.textContent = "Forbinder…";
  try {
    await apiRequest("/api/config", { apiKey: key });
    input.value = ""; aiConfigured = true; await checkAiStatus(); toast("AI-coachen er forbundet");
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; button.textContent = "Gem og forbind"; }
}

function formValues(formName) {
  const form = document.querySelector(`#${formName}-form`);
  if (!form) return {};
  const values = Object.fromEntries([...form.elements].filter(element => element.name && element.type !== "checkbox").map(element => [element.name, element.value]));
  if (formName === "scene") values.actorIds = [...form.querySelectorAll('input[name="actorIds"]:checked')].map(input => input.value);
  return values;
}

async function requestSceneBlueprint(mode) {
  const button = document.querySelector(mode === "links" ? "#ai-scene-links" : "#ai-complete-scene");
  if (mode === "links" && (!state.characters.length || !state.environments.length)) return toast("Opret mindst én person og ét miljø, før AI forbinder scenen");
  const original = button.textContent; button.disabled = true; button.textContent = "Tænker…";
  const configured = await checkAiStatus();
  if (!configured) { button.disabled = false; button.textContent = original; openAiDrawer(); return toast("Forbind AI først"); }
  try {
    const result = await apiRequest("/api/scene-blueprint", { mode, currentScene: formValues("scene"), project: projectSnapshot() });
    const form = document.querySelector("#scene-form");
    let additions = 0;
    if (mode === "full") {
      ["title","summary","pov","setting","goal","conflict","turn","purpose","act","audienceFeeling","mood"].forEach(key => {
        const element = form.elements[key], suggestion = result.scene[key];
        if (element && !String(element.value || "").trim() && suggestion !== undefined && String(suggestion || "").trim()) {
          element.value = suggestion; additions++;
        }
      });
    }
    const actorInputs = [...form.querySelectorAll('input[name="actorIds"]')];
    const hasSelectedActors = actorInputs.some(input => input.checked);
    if (mode === "links" || !hasSelectedActors) {
      const suggestedActorIds = result.scene.actorIds || [];
      actorInputs.forEach(input => input.checked = suggestedActorIds.includes(input.value));
      if (!hasSelectedActors && suggestedActorIds.length) additions++;
    }
    const suggestedLocationExists = result.scene.locationId && [...form.elements.locationId.options].some(option => option.value === result.scene.locationId);
    if ((mode === "links" || !form.elements.locationId.value) && suggestedLocationExists) {
      if (!form.elements.locationId.value) additions++;
      form.elements.locationId.value = result.scene.locationId;
    }
    toast(mode === "links"
      ? "AI har foreslået aktører og lokation"
      : additions
        ? `AI udfyldte ${additions} manglende ${additions === 1 ? "felt" : "felter"} og bevarede resten`
        : "Alle relevante felter havde allerede indhold—intet blev ændret");
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; button.textContent = original; }
}

async function writeSceneWithAi() {
  const button = document.querySelector("#ai-write-scene");
  const draftBox = document.querySelector("#ai-scene-draft");
  const draftText = document.querySelector("#ai-scene-draft-text");
  const status = document.querySelector("#ai-scene-draft-status");
  const currentScene = formValues("scene");
  const hasSceneMaterial = [currentScene.title, currentScene.summary, currentScene.goal, currentScene.conflict, currentScene.turn, currentScene.setting].some(value => String(value || "").trim()) || currentScene.actorIds?.length;
  if (!hasSceneMaterial) return toast("Giv AI’en mindst en titel, handling, aktør eller dramatisk retning først");
  const configured = await checkAiStatus();
  if (!configured) { openAiDrawer(); return toast("Forbind AI først"); }
  const original = button.textContent;
  button.disabled = true; button.textContent = "Skriver scenen…";
  draftBox.hidden = false; status.textContent = "AI’en skriver handling, sansning og dialog…";
  try {
    const result = await apiRequest("/api/scene-draft", { scene:currentScene, project:projectSnapshot() });
    draftText.value = result.text || "";
    status.textContent = "Klar til redigering og kopiering";
    draftText.focus();
    toast("Det fulde sceneudkast er skrevet");
  } catch (error) { status.textContent = "Udkastet kunne ikke skrives"; toast(error.message); }
  finally { button.disabled = false; button.textContent = original; }
}

async function copyAiSceneDraft() {
  const textarea = document.querySelector("#ai-scene-draft-text");
  if (!textarea.value.trim()) return toast("Der er ikke noget sceneudkast at kopiere endnu");
  try { await navigator.clipboard.writeText(textarea.value); }
  catch { textarea.select(); document.execCommand("copy"); }
  const button = document.querySelector("#copy-ai-scene"), original = button.textContent;
  button.textContent = "Kopieret ✓"; setTimeout(() => button.textContent = original, 1400);
  toast("Sceneudkastet er kopieret");
}

async function requestSceneImage(sceneId, button) {
  const scene = state.scenes.find(item => item.id === sceneId); if (!scene) return;
  const configured = await checkAiStatus();
  if (!configured) { openApiKeyPanel(); return toast("Indsæt din API-nøgle før du skaber scenebilledet"); }
  const original = button.innerHTML; button.disabled = true; button.innerHTML = `<span class="scene-image-spinner"></span>Skaber billede…`;
  button.closest(".scene-card")?.classList.add("generating-image");
  try {
    const result = await apiRequest("/api/scene-image", { scene, project:projectSnapshot() });
    state.scenes = state.scenes.map(item => item.id === sceneId ? { ...item, imageUrl:result.url, imagePrompt:result.prompt, imageModel:result.model } : item);
    saveState(); updateSceneImageCanvas(sceneId); toast("Scenebilledet er skabt og lagt på canvas’et");
  } catch (error) {
    button.disabled = false; button.innerHTML = original; button.closest(".scene-card")?.classList.remove("generating-image"); toast(error.message);
  }
}

async function requestCharacterImage(characterId, button) {
  const character = state.characters.find(item => item.id === characterId); if (!character) return;
  if (!String(character.appearance || "").trim()) return toast("Beskriv personens udseende, før du genererer et personbillede");
  const configured = await checkAiStatus();
  if (!configured) { openApiKeyPanel(); return toast("Indsæt din API-nøgle før du skaber personbilledet"); }
  const original = button.innerHTML; button.disabled = true; button.innerHTML = `<span class="scene-image-spinner"></span>Skaber person…`;
  try {
    const result = await apiRequest("/api/character-image", { character, project:projectSnapshot() });
    state.characters = state.characters.map(item => item.id === characterId ? { ...item, portraitUrl:result.url, portraitPrompt:result.prompt, portraitModel:result.model } : item);
    saveState(); render(); toast("Personbilledet er gemt som visuel reference");
  } catch (error) {
    button.disabled = false; button.innerHTML = original; toast(error.message);
  }
}

async function uploadLocalImage(kind, entityId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png,image/jpeg,image/webp";
  input.hidden = true;
  document.body.appendChild(input);
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) { input.remove(); return; }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      input.remove(); return toast("Vælg et PNG-, JPG- eller WebP-billede");
    }
    if (file.size > 20_000_000) {
      input.remove(); return toast("Billedet må højst fylde 20 MB");
    }
    toast("Billedet uploades…");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Billedet kunne ikke læses"));
        reader.readAsDataURL(file);
      });
      const result = await apiRequest("/api/project-asset", {
        projectId:activeProjectId,
        kind,
        entityId,
        dataUrl
      });
      if (kind === "characters") {
        state.characters = state.characters.map(character => character.id === entityId
          ? { ...character, portraitUrl:result.url, portraitSource:"upload", portraitPrompt:"", portraitModel:"local-upload" }
          : character);
        saveState();
        render();
        toast("Fotoet er gemt på personkortet");
      } else {
        state.scenes = state.scenes.map(scene => scene.id === entityId
          ? { ...scene, imageUrl:result.url, imageSource:"upload", imagePrompt:"", imageModel:"local-upload" }
          : scene);
        saveState();
        updateSceneImageCanvas(entityId);
        toast("Billedet er gemt på scenen");
      }
    } catch (error) {
      toast(error.message || "Billedet kunne ikke uploades");
    } finally {
      input.remove();
    }
  }, { once:true });
  input.click();
}

async function requestSuggestion(button) {
  const configured = await checkAiStatus();
  if (!configured) { openAiDrawer(); return toast("Forbind AI først"); }
  const path = button.dataset.aiPath;
  const form = button.dataset.aiForm;
  const name = button.dataset.aiName;
  const label = button.dataset.aiLabel || "feltet";
  const element = path ? document.querySelector(`[data-path="${path}"]`) : document.querySelector(`#${form}-form [name="${name}"]`);
  activeSuggestion = { button, path, form, name, label, element, text: "" };
  const dialog = document.querySelector("#suggestion-dialog");
  document.querySelector("#suggestion-loading").hidden = false;
  document.querySelector("#suggestion-text").textContent = "";
  document.querySelector("#use-suggestion").disabled = true;
  if (!dialog.open) dialog.showModal();
  button.disabled = true;
  try {
    const result = await apiRequest("/api/suggest", { label, field: path || `${form}.${name}`, currentValue: element?.value || "", localForm: form ? formValues(form) : null, project: projectSnapshot() });
    activeSuggestion.text = result.text;
    document.querySelector("#suggestion-text").textContent = result.text;
    document.querySelector("#use-suggestion").disabled = false;
  } catch (error) {
    document.querySelector("#suggestion-text").textContent = error.message;
  } finally {
    document.querySelector("#suggestion-loading").hidden = true;
    button.disabled = false;
  }
}

function useSuggestion() {
  if (!activeSuggestion?.text || !activeSuggestion.element) return;
  activeSuggestion.element.value = activeSuggestion.text;
  if (activeSuggestion.path) {
    setPath(activeSuggestion.path, activeSuggestion.text);
    activeSuggestion.element.dispatchEvent(new Event("input", { bubbles: true }));
  }
  document.querySelector("#suggestion-dialog").close(); scheduleSave(); toast("Forslaget er lagt ind—ret det frit til");
}

async function submitChat(message) {
  const text = message.trim(); if (!text) return;
  const configured = await checkAiStatus();
  if (!configured) { openAiDrawer(); return toast("Forbind AI først"); }
  state.ai ||= { chat: [] };
  state.ai.chat.push({ role: "user", content: text });
  state.ai.chat = state.ai.chat.slice(-20); saveState(); renderChat(true);
  document.querySelector("#chat-input").value = "";
  try {
    const result = await apiRequest("/api/chat", { messages: state.ai.chat, project: projectSnapshot() });
    state.ai.chat.push({ role: "assistant", content: result.text });
    state.ai.chat = state.ai.chat.slice(-20); saveState(); renderChat();
  } catch (error) {
    state.ai.chat.push({ role: "assistant", content: `Jeg kunne ikke svare: ${error.message}` }); saveState(); renderChat();
  }
}

function characterById(id) { return state.characters.find(character => character.id === id); }
function environmentById(id) { return state.environments.find(environment => environment.id === id); }
function actorNames(scene) { return (scene.actorIds || []).map(id => characterById(id)?.name).filter(Boolean); }

function overviewBoard() {
  const narrativeCards = [
    nonempty(state.foundation.premise) ? `<button class="overview-card narrative" data-nav="foundation"><small>Præmis</small><strong>${escapeHTML(state.foundation.premise)}</strong></button>` : `<button class="board-empty-card" data-nav="foundation">+ Tilføj præmis eller konflikt</button>`,
    nonempty(state.plot.finalImage) ? `<button class="overview-card narrative" data-nav="plot"><small>Slutbillede</small><strong>${escapeHTML(state.plot.finalImage)}</strong></button>` : ""
  ].join("");
  const peopleCards = state.characters.map(character => `<button class="overview-card" data-board-character="${character.id}"><small>${escapeHTML(character.role || "Person")}</small><strong>${escapeHTML(character.name || "Navnløs")}</strong><span>${escapeHTML(character.want || character.flaw || "Åbn og udforsk personen")}</span></button>`).join("") || `<button class="board-empty-card" data-board-add="character">+ Opret den første person</button>`;
  const environmentCards = state.environments.map(environment => `<button class="overview-card environment" data-board-environment="${environment.id}"><small>${escapeHTML(environment.type || "Miljø")}</small><strong>${escapeHTML(environment.name || "Uden navn")}</strong><span>${escapeHTML(environment.atmosphere || environment.description || "Åbn og udforsk miljøet")}</span></button>`).join("") || `<button class="board-empty-card" data-board-add="environment">+ Opret det første miljø</button>`;
  const sceneCards = state.scenes.map(scene => `<button class="overview-card scene" data-board-scene="${scene.id}"><small>Akt ${scene.act || "?"} · ${actorNames(scene).length} aktører</small><strong>${escapeHTML(scene.title || "Uden titel")}</strong><span>${escapeHTML(environmentById(scene.locationId)?.name || scene.setting || "Ingen lokation valgt")}</span></button>`).join("") || `<button class="board-empty-card" data-board-add="scene">+ Opret den første scene</button>`;
  return `<section class="section"><div class="section-head"><div><span class="eyebrow">Historiens levende kort</span><h2>Alt hænger sammen</h2><p>Klik på et kort for at åbne det. Scener refererer direkte til dine personer og miljøer.</p></div></div><div class="overview-board"><section class="overview-column"><header><span>⌁</span><div><strong>Narrativ</strong><small>Historiens samlede retning</small></div><button data-nav="foundation">+</button></header><div class="overview-stack">${narrativeCards}</div></section><section class="overview-column"><header><span>♙</span><div><strong>Personer</strong><small>${state.characters.length} kort</small></div><button data-board-add="character">+</button></header><div class="overview-stack">${peopleCards}</div></section><section class="overview-column"><header><span>◉</span><div><strong>Miljøer</strong><small>${state.environments.length} kort</small></div><button data-board-add="environment">+</button></header><div class="overview-stack">${environmentCards}</div></section><section class="overview-column"><header><span>▦</span><div><strong>Scener</strong><small>${state.scenes.length} kort</small></div><button data-board-add="scene">+</button></header><div class="overview-stack">${sceneCards}</div></section></div></section>`;
}

function renderStart() {
  return `${aiConnectionBanner()}<section class="hero-panel" style="display:block"><div class="hero-copy" style="padding-bottom:38px"><span class="eyebrow" style="color:#f0c68f">Begynd dér, hvor idéen lever</span><h1>Hvad kom til dig først?</h1><p>En person? Et enkelt billede? En konflikt eller måske slutningen? Der er ingen rigtig rækkefølge. Vælg din indgang—værkstedet stiller de næste vigtige spørgsmål.</p><div class="idea-entry-grid"><button class="idea-entry" data-start="character" type="button"><i>♙</i><strong>En person</strong><small>Jeg kan mærke nogen, men kender ikke historien endnu.</small></button><button class="idea-entry" data-start="scene" type="button"><i>▦</i><strong>En scene</strong><small>Jeg ser et øjeblik, en samtale eller en handling.</small></button><button class="idea-entry" data-start="world" type="button"><i>◉</i><strong>Et miljø</strong><small>Et sted, en tid eller et univers kalder på mig.</small></button><button class="idea-entry" data-start="conflict" type="button"><i>⌁</i><strong>En konflikt</strong><small>Jeg ved, hvad der støder sammen eller står på spil.</small></button><button class="idea-entry" data-start="ending" type="button"><i>↯</i><strong>En slutning</strong><small>Jeg kender det sidste billede eller afgørende valg.</small></button></div><span class="free-path-note">✦ Du kan altid springe frit mellem alle dele i menuen</span></div></section>
  ${overviewBoard()}
  <div class="grid three"><article class="card step-card"><span class="step-no">?</span><h3>Vigtige spørgsmål</h3><p>Hvert arbejdsrum viser kun de spørgsmål, der gør netop din idé mere dramatisk og konkret.</p></article><article class="card step-card"><span class="step-no">✦</span><h3>AI som mulighed</h3><p>Du skriver altid selv. Når du sidder fast, kan AI give et forslag, du frit kan bruge, ændre eller afvise.</p><button class="micro-link" id="start-chat-card" type="button">Åbn sparringspartneren →</button></article><article class="card step-card"><span class="step-no">↗</span><h3>Historien vokser på tværs</h3><p>En ny person kan afsløre en scene. En scene kan ændre slutningen. Coachen bruger hele dit projekt som kontekst.</p></article></div>
  <section class="section card idea-generator" id="idea-generator"><div class="idea-top"><div><span class="eyebrow">Idémaskinen</span><h2>Eller sæt tre gnister sammen</h2><p>Behold det, der vækker spørgsmål. Ændr resten.</p></div><button class="button secondary" id="shuffle-idea" type="button">↻ Ny kombination</button></div><div class="idea-parts"><div class="idea-part"><small>En person</small><strong id="idea-person">${escapeHTML(state.idea.person)}</strong></div><div class="idea-part"><small>En forstyrrelse</small><strong id="idea-disturbance">${escapeHTML(state.idea.disturbance)}</strong></div><div class="idea-part"><small>En pris</small><strong id="idea-stake">${escapeHTML(state.idea.stake)}</strong></div></div><div style="padding:0 25px 25px; display:flex;justify-content:flex-end"><button class="button primary" id="use-idea" type="button">Brug som afsæt</button></div></section>
  <div class="divider-title">Dit projekt</div>
  <div class="card card-pad"><div class="form-grid two">${field("title", "Arbejdstitel", "Fx Den sidste dag i august", { big: true, hint: "En arbejdstitel må gerne være foreløbig." })}<div><span class="eyebrow">Din eneste opgave nu</span><h3>Gør historien lidt mere virkelig.</h3><p class="lead" style="font-size:12px;margin-top:7px">Skriv en titel, eller prøv idémaskinen. Resten tager vi i små, overskuelige beslutninger.</p></div></div></div>`;
}

function foundationChecks() {
  const f = state.foundation;
  return [
    [nonempty(f.premise) && f.premise.length < 300, "Præmissen samler person, forstyrrelse og indsats"],
    [nonempty(f.question), "Historien stiller ét dramatisk spørgsmål"],
    [nonempty(f.theme), "Temaet er formuleret som en spænding eller påstand"],
    [nonempty(f.ending), "Slutningen besvarer spørgsmålet og viser en pris"]
  ];
}
function coachCard(title, intro, checks, tip) {
  const ok = checks.filter(c => c[0]).length;
  return `<aside class="card coach-card"><div class="coach-head"><span>Din skrivecoach</span><h3>${title}</h3></div><div class="coach-body"><div class="coach-score"><strong>${ok}/${checks.length}</strong><span>byggesten på plads</span></div><p>${intro}</p><div class="checklist">${checks.map(c => `<div class="check ${c[0] ? "ok" : ""}"><i>✓</i><span>${c[1]}</span></div>`).join("")}</div><div class="coach-tip" style="margin-top:17px"><strong>Prøv dette:</strong><br>${tip}</div></div></aside>`;
}
function questionLab(kind, questions) {
  return `<section class="question-lab"><div><span class="eyebrow">Coachen spørger videre</span><h3>${kind}</h3><p>Du behøver ikke svare på alt nu. Vælg det spørgsmål, der åbner mest.</p></div><div class="question-list">${questions.map(question => `<button type="button" data-chat-prompt="${escapeHTML(question)}"><span>?</span>${question}<i>Drøft med AI →</i></button>`).join("")}</div></section>`;
}
function renderFoundation() {
  return `${aiConnectionBanner()}${pageHead("Arbejdsrum · Fundament", "Historiens DNA", "Start her, hvis din idé er en konflikt, et tema, et løfte eller en slutning. Udfyld kun det, du ved; resten kan vokse senere.")}
  ${lessonStrip("En historie er forandring under pres", "En person forfølger et mål, møder modstand og må handle, lære og vælge.")}
  <div class="form-layout"><div class="card form-card">
    <section class="form-section"><h3>Historiens løfte</h3><p>Præmissen er dit kompas, ikke din bagsidetekst. Den må gerne være rå.</p>${field("foundation.premise", "Én-sætnings-præmis", "Da [person] oplever [forstyrrelse], må de [handling] før [konsekvens].", { rows: 3, big: true, hint: "Sigt efter én person, én forstyrrelse, én hovedhandling og en konkret risiko." })}</section>
    <section class="form-section"><h3>Form og forventning</h3><p>Genre er en aftale med læseren om, hvilken slags følelsesmæssig rejse de får.</p><div class="form-grid two">${field("foundation.genre", "Genre", "Fx coming-of-age", { type: "select", options: ["Drama", "Krimi / mysterium", "Thriller", "Romance", "Fantasy", "Science fiction", "Historisk fiktion", "Gyser", "Komedie", "Magisk realisme", "Litterær fiktion"] })}${field("foundation.audience", "Læser", "Hvem skriver du til?", { type: "select", options: ["Børn", "Mellemtrin", "Unge", "New adult", "Voksne", "Alle aldre"] })}${field("foundation.tone", "Tone", "Fx varm, rastløs og humoristisk")}${field("foundation.promise", "Læserløftet", "Hvilken særlig oplevelse lover historien?")}</div></section>
    <section class="form-section"><h3>Spørgsmål og mening</h3><p>Plottet skaber spørgsmålet. Karakterens valg skaber meningen.</p>${field("foundation.question", "Det dramatiske spørgsmål", "Vil hovedpersonen lykkes med …?", { hint: "Det skal kunne besvares i klimakset." })}${field("foundation.theme", "Tema som påstand eller spænding", "Fx Sandhed koster tilhørsforhold, men tavshed koster identitet.", { rows: 2 })}${field("foundation.ending", "Slutningen i grove træk", "Hvad vælger personen, hvad koster det, og hvilket nyt liv ser vi?", { rows: 4, hint: "Du binder dig ikke. En foreløbig slutning gør resten af planlægningen skarpere." })}</section>
  </div>${coachCard("Kan idéen bære?", "En brugbar kerne skaber både ydre handling og indre forandring.", foundationChecks(), "Hvis præmissen føles flad, så gør risikoen personlig: Hvad mister netop denne person, som en anden ikke ville miste?")}</div>`;
}

function renderCharacters() {
  const cards = renderCharacterCards();
  return `${aiConnectionBanner()}${pageHead("Arbejdsrum · Mennesket", "Personer med noget på spil", "Begynd gerne her. En karakter kan være selve frøet til historien; spørgsmålene hjælper dig med at opdage, hvilket plot netop dette menneske fremkalder.")}
  ${lessonStrip("Den hellige fejl", "Den bedste karakterfejl er en overbevisning, der engang beskyttede personen, men nu skader dem.")}
  <div class="section-head"><div><h2>Dit persongalleri</h2><p>Skab få personer med tydelige, modstridende mål.</p></div><button class="button primary" id="toggle-character-form" type="button">+ Tilføj person</button></div>
  <div class="character-list">${cards}</div>
  ${questionLab("Hvad vil afsløre personen i handling?", ["Hvilket valg træffer personen tidligt, fordi den beskyttende fejl føles rigtig?", "Hvem i historien ønsker det modsatte—og har en lige så forståelig grund?", "Hvilken scene vil tvinge personen til at vælge mellem sit ydre mål og sit indre behov?"])}
  ${renderCharacterForm()}
  <section class="section principle"><blockquote>“Plottet er den række prøver, som afslører, om personens gamle måde at være i verden på stadig virker.”</blockquote><p>Brug derfor modstandere, allierede og relationer til at angribe forskellige sider af hovedpersonens selvbillede.</p></section>`;
}
function renderCharacterCards() {
  return state.characters.length ? state.characters.map(c => {
    const sceneCount = state.scenes.filter(scene => (scene.actorIds || []).includes(c.id)).length;
    const initials = escapeHTML((c.name || "?").split(/\s+/).map(x => x[0]).slice(0,2).join(""));
    const portrait = c.portraitUrl ? `<img src="${escapeHTML(c.portraitUrl)}" alt="Visuel reference for ${escapeHTML(c.name || "personen")}">` : `<span>${initials}</span>`;
    return `<article class="card character-card"><div class="character-portrait-shell"><div class="character-portrait ${c.portraitUrl ? "has-image" : ""}">${portrait}</div><div class="character-image-actions"><button class="character-image-button" data-generate-character-image="${c.id}" type="button">✦ ${c.portraitUrl ? "Nyt AI-billede" : "AI-generér personbillede"}</button><button class="character-image-button local-upload-button" data-upload-character-image="${c.id}" type="button">↑ Upload foto</button></div></div><div><h3>${escapeHTML(c.name || "Navnløs")}<small>${escapeHTML(c.role || "rolle ukendt")}</small></h3><div class="character-chips"><span class="chip">${sceneCount} scener</span>${c.age ? `<span class="chip">${escapeHTML(c.age)} år</span>` : ""}${c.want ? `<span class="chip">Vil: ${escapeHTML(c.want)}</span>` : ""}${c.traits ? `<span class="chip">${escapeHTML(c.traits)}</span>` : ""}</div><div class="character-appearance"><b>Udseende</b><p>${escapeHTML(c.appearance || "Beskriv ansigt, hår, krop, tøj og særlige kendetegn.")}</p></div><p class="character-detail">${escapeHTML(c.motivation || c.change || c.need || c.notes || "Udforsk personens egenskaber, motiver og forandring.")}</p></div><div class="card-actions"><button class="mini-button" data-edit-character="${c.id}" type="button">Redigér</button><button class="mini-button" data-delete-character="${c.id}" type="button">×</button></div></article>`;
  }).join("") : `<div class="empty-state"><div class="empty-icon">♙</div><h3>Din historie venter på nogen</h3><p>Start med den person, som har mest at tabe og mest at lære.</p></div>`;
}
function renderCharacterForm() {
  return `<section class="section inline-character-form" id="character-form-wrap" hidden><span class="eyebrow">Karakterværksted</span><h2 id="character-form-title">Ny person</h2><form id="character-form"><input type="hidden" name="id"><div class="form-grid two">${characterInput("name", "Navn", "Fx Asta Lund")}${characterInput("age", "Alder", "Fx 34", false, "number")}${characterInput("role", "Dramatisk rolle", "Hovedperson, modkraft, mentor …")}${characterInput("appearance", "Udseende", "Ansigt, hår, hud, kropsbygning, tøj, alderstegn og særlige kendetegn. Vær konkret, så billedet kan genbruges.", true)}${characterInput("traits", "Egenskaber", "Temperament, styrker, vaner og særpræg", true)}${characterInput("motivation", "Motivation", "Hvorfor betyder målet så meget for personen?", true)}${characterInput("want", "Vil have (ydre mål)", "Hvad forsøger personen konkret at opnå?")}${characterInput("need", "Har brug for (indre behov)", "Hvad må personen lære eller acceptere?")}${characterInput("flaw", "Beskyttende fejl", "Hvilken gammel strategi skaber problemer?")}${characterInput("fear", "Frygt", "Hvad vil personen gøre næsten alt for at undgå?")}${characterInput("secret", "Hemmelighed", "Hvad skjuler personen?")}${characterInput("change", "Forandring", "Fra … til …")}${characterInput("notes", "Frie noter", "Historik, relationer, replikker og løse idéer", true)}</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:17px"><button class="button secondary" id="cancel-character" type="button">Annullér</button><button class="button primary" type="submit">Gem person</button></div></form></section>`;
}
function characterInput(name, label, placeholder, multiline = false, type = "text") { return `<label class="field"><span><span>${label}</span><button class="ai-field-button" type="button" data-ai-form="character" data-ai-name="${name}" data-ai-label="${label}">✦ Giv AI-forslag</button></span>${multiline ? `<textarea name="${name}" rows="3" placeholder="${placeholder}"></textarea>` : `<input name="${name}" type="${type}" ${type === "number" ? 'min="0" max="150" step="1" inputmode="numeric"' : ""} placeholder="${placeholder}">`}</label>`; }

function renderWorld() {
  const cards = state.environments.length ? state.environments.map(environment => {
    const sceneCount = state.scenes.filter(scene => scene.locationId === environment.id).length;
    return `<article class="card environment-card"><div class="environment-visual"><span>◉</span><small>${escapeHTML(environment.type || "Miljø")}</small></div><div class="environment-copy"><h3>${escapeHTML(environment.name || "Uden navn")}</h3><p>${escapeHTML(environment.description || environment.atmosphere || "Udforsk dette miljø.")}</p><div class="character-chips"><span class="chip">${sceneCount} scener</span>${environment.atmosphere ? `<span class="chip">${escapeHTML(environment.atmosphere)}</span>` : ""}</div></div><div class="card-actions"><button class="mini-button" data-edit-environment="${environment.id}" type="button">Redigér</button><button class="mini-button" data-delete-environment="${environment.id}" type="button">×</button></div></article>`;
  }).join("") : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">◉</div><h3>Historien mangler et sted at ske</h3><p>Opret et rumskib, et køkken, en planet eller en hel tidsalder.</p></div>`;
  return `${aiConnectionBanner()}${pageHead("Arbejdsrum · Verden", "Miljøer, der påvirker handlingen", "Miljøer er genanvendelige kort. Scener vælger en lokation herfra, så stedets regler, atmosfære og pres følger med gennem hele narrativet.")}
  ${lessonStrip("Et miljø er en dramatisk kraft", "Det bedste miljø gør bestemte handlinger mulige, andre umulige og presser personernes valg.")}
  <div class="section-head"><div><h2>Historiens miljøkort</h2><p>Hvert miljø kan forbindes med så mange scener, som historien kræver.</p></div><button class="button primary" id="toggle-environment-form" type="button">+ Opret miljø</button></div>
  <div class="environment-grid">${cards}</div>
  ${questionLab("Hvordan presser miljøet historien?", ["Hvilken regel i miljøet gør hovedpersonens normale strategi farlig eller umulig?", "Hvad kan kun ske netop her—og ikke i et neutralt rum?", "Hvordan vil samme miljø opleves anderledes efter historiens klimaks?"])}
  <section class="section inline-character-form" id="environment-form-wrap" hidden><span class="eyebrow">Miljøværksted</span><h2 id="environment-form-title">Nyt miljø</h2><form id="environment-form"><input type="hidden" name="id"><div class="form-grid two">${environmentInput("name", "Navn", "Fx Rumskibet Athorius")}${environmentInput("type", "Type", "Rumskib, by, hjem, planet …")}${environmentInput("description", "Hvad er det?", "Beskriv stedet konkret og kort")}${environmentInput("atmosphere", "Atmosfære", "Hvordan føles det at være her?")}${environmentInput("rules", "Regler og begrænsninger", "Hvad kan og kan ikke ske her?")}${environmentInput("pressure", "Dramatisk pres", "Hvordan gør miljøet konflikten sværere?")}${environmentInput("sensory", "Sansesignatur", "Lyde, lys, lugte og teksturer")}</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:17px"><button class="button secondary" id="cancel-environment" type="button">Annullér</button><button class="button primary" type="submit">Gem miljø</button></div></form></section>`;
}
function environmentInput(name, label, placeholder) { return `<label class="field"><span><span>${label}</span><button class="ai-field-button" type="button" data-ai-form="environment" data-ai-name="${name}" data-ai-label="Miljøets ${label.toLowerCase()}">✦ Giv AI-forslag</button></span><textarea name="${name}" rows="${["name","type"].includes(name) ? 1 : 2}" placeholder="${placeholder}"></textarea></label>`; }

function renderPlot() {
  return `${aiConnectionBanner()}${pageHead("Arbejdsrum · Bevægelsen", "Fra begyndelse til slutning", "Begynd ved den akt eller det billede, du allerede kender. Fem akter er fem faser af én forandring—ikke en rækkefølge, du skal udfylde slavisk.")}
  ${lessonStrip("Struktur er årsag og virkning", "Et vendepunkt er ikke bare noget stort. Det ændrer målet, mulighederne eller forståelsen af konflikten.")}
  <div class="card arc"><div class="arc-line">${acts.map(a => `<div class="arc-point"><i></i><span>Akt ${a.n}</span><small>${["Forstyrrelse", "Første vendepunkt", "Sandhed", "Krise", "Valg"][a.n-1]}</small></div>`).join("")}</div></div>
  <div class="section"><div class="section-head"><div><h2>Din femaktsrejse</h2><p>Skriv 2–4 sætninger pr. akt. Fokuser på beslutninger og konsekvenser.</p></div></div><div class="act-grid">${acts.map(a => `<article class="card act-card"><span class="act-no">Akt ${a.n}</span><h3>${a.title}</h3><p>${a.prompt}</p>${field(`plot.act${a.n}`, "Hvad sker der?", "Beslutning → konsekvens → ny situation", { rows: 5 })}<p class="hint">${a.label}</p></article>`).join("")}</div></div>
  <section class="section card form-card"><div class="form-grid two">${field("plot.opening", "Åbningsbillede", "Vis det gamle liv og dets ubalance", { rows: 3 })}${field("plot.finalImage", "Slutbillede", "Vis konkret, hvad der nu er anderledes", { rows: 3 })}</div><div class="coach-tip" style="margin-top:16px"><strong>Spejltesten:</strong> Åbning og slutning bør have en tydelig forbindelse—samme sted, handling, motiv eller valg—så læseren kan mærke forandringen.</div></section>`;
}

function renderScenes() {
  const withTurns = state.scenes.filter(s => nonempty(s.turn)).length;
  const withActors = state.scenes.filter(s => (s.actorIds || []).length).length;
  const withLocations = state.scenes.filter(s => s.locationId && environmentById(s.locationId)).length;
  const withFeelings = state.scenes.filter(s => nonempty(s.audienceFeeling)).length;
  return `${aiConnectionBanner()}${pageHead("Historiens hovedskærm · 3D-værksted", "Scenerummet", "Flyv gennem fortællingen, arranger scenerne som svævende flader, og tegn forbindelser mellem de øjeblikke, der skaber hinanden.")}
  <div class="scene-workspace card">
    <div class="board-toolbar scene-toolbar"><div><span class="eyebrow">Fortællingens rum</span><h2>${state.scenes.length} scener · <span id="scene-link-count">${state.sceneLinksInitialized ? state.sceneLinks.length : Math.max(0,state.scenes.length-1)}</span> forbindelser</h2><p class="hint">Shift+klik vælger scener til kapitler. Vælg én scene for at starte en ny storyboard-række.</p></div><div class="toolbar-actions">${state.scenes.length ? `<button class="button secondary" id="read-full-story" type="button">▤ Læs den samlede historie</button><button class="button secondary" id="reset-scene-layout" type="button">Nulstil 3D-rum</button>` : ""}<button class="button secondary" id="toggle-linebreak" type="button" disabled>↵ Ny række</button><button class="button secondary" id="add-separator" type="button" disabled>＋ Kapitel om valgte <span id="selected-scene-count">(0)</span></button><button class="button primary" id="add-scene" type="button">＋ Ny scene</button></div></div>
    <div class="flow-legend"><span><i class="legend-scene"></i>Svævende scene</span><span>Shift+klik · vælg flere</span><span>Højreklik i mellemrum · rækkeskift</span><span>Højre mus + WASD · kig og flyv</span><span>R / F · op / ned</span><span>G · sceneniveau</span><span>Q · fuldskærm</span><span>Mousewheel · zoom</span><span>Træk håndtag · forbind scener</span></div>
    <div class="story-flow" id="story-flow" tabindex="0">${renderStoryFlow()}</div>
  </div>
  ${questionLab("Hvad gør scenen uundværlig?", ["Hvilken konkret værdi ændrer sig fra scenens begyndelse til dens slutning?", "Hvordan skaber scenens vendepunkt målet eller problemet i den næste scene?", "Hvis scenen blev fjernet, hvad ville resten af historien så ikke længere kunne forstå eller opleve?"])}
  <div class="diagnostic"><article class="card diagnostic-item"><small>Scener i alt</small><strong>${state.scenes.length}</strong><p>Kortene er historiens konkrete begivenheder.</p></article><article class="card diagnostic-item"><small>Aktører valgt</small><strong>${withActors}/${state.scenes.length || 0}</strong><p>Hvem handler og påvirkes?</p></article><article class="card diagnostic-item"><small>Lokation valgt</small><strong>${withLocations}/${state.scenes.length || 0}</strong><p>Hvorfor sker det netop dér?</p></article><article class="card diagnostic-item"><small>Publikumsfølelse</small><strong>${withFeelings}/${state.scenes.length || 0}</strong><p>Hvad skal scenen få os til at føle?</p></article><article class="card diagnostic-item"><small>Vendepunkt</small><strong>${withTurns}/${state.scenes.length || 0}</strong><p>Hvad er anderledes bagefter?</p></article></div>
  <section class="section principle"><blockquote>Scener, der kun leverer information, føles flade. Giv nogen et mål, og lad informationen blive et våben, en hindring eller en overraskelse.</blockquote><p>Scene-triage: Kan scenen fjernes uden at ændre resten? Hvis ja, så skær den væk, slå den sammen med en anden eller giv den et uigenkaldeligt vendepunkt.</p></section>
  ${renderStoryBackend()}`;
}
function renderStoryBackend() {
  return `<section class="section story-backend" id="story-backend"><div class="backend-head"><div><span class="eyebrow">Historiens backend</span><h2>Alt det AI’en skal have i baghovedet</h2><p>Rå idéer er velkomne. Skriv handling, univers, miljøer, twists, slutning, stemning, research og modstridende muligheder. Backend er kontekst—ikke færdig tekst.</p></div><button class="button secondary" data-open-ai type="button">✦ Drøft visionen med AI</button></div><div class="backend-brain card">${field("backend.brainDump", "Braindump af hele din vision", "Skriv frit: Hvad handler historien egentlig om? Hvilke billeder, personer, steder, konflikter og overraskelser ser du? Hvad må AI aldrig glemme?", { rows: 14, big: true, hint: "Gemmes automatisk og sendes som tavs kontekst til AI-coachen." })}</div><div class="backend-gallery"><div class="section-head"><div><span class="eyebrow">Persongalleri</span><h2>${state.characters.length} personer i historien</h2><p>Egenskaber, motiver og noter følger personerne ind i scener og AI-sparring.</p></div><button class="button primary" id="toggle-character-form" type="button">＋ Opret person</button></div><div class="character-list">${renderCharacterCards()}</div>${renderCharacterForm()}</div></section>`;
}
function movementSpeed() { return Math.max(1, Math.min(10, Number(state.sceneMoveSpeed) || 1)); }
function formatMovementSpeed(value = movementSpeed()) { return `${Number.isInteger(value) ? value : value.toFixed(1)}×`; }
function setMovementSpeed(value) {
  state.sceneMoveSpeed = Math.max(1, Math.min(10, Number(value) || 1));
  const formatted = formatMovementSpeed();
  document.querySelectorAll("#scene-speed-range,#fullscreen-speed-range").forEach(input => { input.value = state.sceneMoveSpeed; });
  document.querySelectorAll("#scene-speed-value,#fullscreen-speed-value").forEach(output => { output.textContent = formatted; });
  const hud = document.querySelector(".hud-speed");
  if (hud) hud.textContent = `Fart ${formatted}`;
  scheduleSave();
}
function renderStoryFlow() {
  if (!state.scenes.length) return `<div class="empty-state flow-empty"><div class="empty-icon">▦</div><h3>Din første scene starter forløbet</h3><p>Begynd med det øjeblik, du allerede kan se. Resten kan vokse frem derfra.</p><button class="button primary" id="empty-add-scene" type="button">＋ Opret første scene</button></div>`;
  const speed = movementSpeed(), speedLabel = formatMovementSpeed(speed);
  return `<div class="scene-sky" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="scene-camera" id="scene-camera"><div class="scene-world" id="scene-world">${(state.sceneLineBreaks || []).map((sceneId, index) => `<button class="story-row-marker" data-row-break="${sceneId}" type="button" title="Fjern dette rækkeskift">↵ Række ${index + 2}<span>×</span></button>`).join("")}${state.separators.map(separator => `<section class="world-chapter" data-world-separator="${separator.id}">${separatorCard(separator)}</section>`).join("")}${state.scenes.map(scene => `<div class="flow-node" data-scene-node="${scene.id}" style="--scene-width:${sceneCanvasWidth(scene)}px">${sceneCard(scene)}${["top","right","bottom","left"].map(side => `<button class="connector-handle handle-${side}" data-link-handle="${side}" type="button" aria-label="Træk forbindelse fra ${side}"></button>`).join("")}</div>`).join("")}</div></div>
    <svg class="world-links" aria-hidden="true"><defs><marker id="world-arrowhead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z"></path></marker></defs><g></g></svg>
    <aside class="fullscreen-toolbox" aria-label="Værktøjskasse"><strong>Værktøjskasse</strong><button id="fullscreen-add-scene" type="button">＋ Scene</button><button id="fullscreen-toggle-linebreak" type="button" disabled>↵ Ny række</button><button id="fullscreen-add-chapter" type="button" disabled>▣ Kapitel <span>(0)</span></button><button id="fullscreen-add-person" type="button">♙ Person</button><button id="fullscreen-add-environment" type="button">◉ Miljø</button><button id="fullscreen-open-backend" type="button">⌁ Backend</button><button id="fullscreen-read-story" type="button">▤ Læs historien</button><button id="fullscreen-open-ai" type="button">✦ AI-coach</button><button id="fullscreen-open-api-key" type="button">⌑ API-nøgle</button><label><span id="fullscreen-mood-label">Mood</span><select id="fullscreen-mood-select">${moodOptionsHTML()}</select></label><label class="movement-speed-control"><span>Fart <b id="fullscreen-speed-value">${speedLabel}</b></span><input id="fullscreen-speed-range" type="range" min="1" max="10" step="0.5" value="${speed}" aria-label="Bevægelseshastighed"></label><button id="fullscreen-level" type="button">◎ Sceneniveau</button><button id="fullscreen-reset" type="button">↺ Nulstil rum</button><button id="fullscreen-save" type="button">💾 Gem historie</button><button id="fullscreen-sync-obsidian" type="button">◈ Obsidian</button><button id="fullscreen-exit" type="button">× Luk fuldskærm</button></aside>
    <div class="scene-mood-console"><span id="scene-mood-label">Historiens mood</span><select id="scene-mood-select" aria-label="Vælg vejr og mood">${moodOptionsHTML()}</select><label class="movement-speed-control"><span>Fart <b id="scene-speed-value">${speedLabel}</b></span><input id="scene-speed-range" type="range" min="1" max="10" step="0.5" value="${speed}" aria-label="Bevægelseshastighed"></label><button id="mood-focus-project" type="button">Helhed</button></div>
    <button class="chapter-selection-action" id="chapter-selection-action" type="button" hidden></button><div class="flight-crosshair" aria-hidden="true"></div><div class="scene-hud"><span class="hud-mode">MARKERING</span><span class="hud-coordinates">X 0 · Y 0 · Z 720</span><span class="hud-speed">Fart ${speedLabel}</span><span>Højre mus: flyv</span></div>`;
}
function moodOptionsHTML() { return storyMoods.map(mood => `<option value="${mood.id}">${mood.icon} ${mood.label}</option>`).join(""); }
function currentStoryMood() { return state.scenes.find(scene => scene.id === focusedSceneId)?.mood || state.backend?.storyMood || "clear"; }
function applyStoryMood(mood = currentStoryMood()) {
  const valid = storyMoods.some(item => item.id === mood) ? mood : "clear";
  document.documentElement.dataset.storyMood = valid;
  [document.querySelector("#scene-mood-select"), document.querySelector("#fullscreen-mood-select")].filter(Boolean).forEach(select => { select.value = valid; });
  const scene = state.scenes.find(item => item.id === focusedSceneId), label = document.querySelector("#scene-mood-label"), fullLabel = document.querySelector("#fullscreen-mood-label");
  if (label) label.textContent = scene ? `Mood · ${scene.title || "fokuseret scene"}` : "Historiens mood";
  if (fullLabel) fullLabel.textContent = scene ? `Mood · ${scene.title || "scene"}` : "Historiens mood";
}
function focusSceneMood(sceneId) { focusedSceneId = sceneId; applyStoryMood(); document.querySelectorAll("[data-scene-node]").forEach(node => node.classList.toggle("scene-focused", node.dataset.sceneNode === sceneId)); }
function changeStoryMood(value) {
  const scene = state.scenes.find(item => item.id === focusedSceneId);
  if (scene) scene.mood = value; else { state.backend ||= {}; state.backend.storyMood = value; }
  applyStoryMood(value); saveState();
  const chip = scene && document.querySelector(`[data-scene="${scene.id}"] [data-scene-mood-chip]`), mood = storyMoods.find(item => item.id === value);
  if (chip && mood) chip.textContent = `${mood.icon} ${mood.label}`;
}
function separatorCard(separator) {
  return `<header class="chapter-heading"><button class="chapter-drag-handle" data-chapter-drag="${separator.id}" type="button" aria-label="Træk hele kapitlet" title="Træk hele kapitlet">⠿</button><span>${escapeHTML(separator.type || "Kapitel")}</span><strong contenteditable="true" spellcheck="true" data-chapter-title="${separator.id}" aria-label="Redigér kapitlets titel">${escapeHTML(separator.title || "Uden titel")}</strong><button data-edit-separator="${separator.id}" type="button" aria-label="Redigér kapitel">•••</button></header>`;
}
function toggleSceneSelection(sceneId) {
  if (selectedSceneIds.has(sceneId)) selectedSceneIds.delete(sceneId);
  else selectedSceneIds.add(sceneId);
  updateSceneSelectionUI();
}
function lineBreakTargetForScene(sceneId) {
  const unit = storyUnits().find(item => item.scenes.some(scene => scene.id === sceneId));
  return unit?.scenes[0]?.id || "";
}
function updateLineBreakButton(button) {
  if (!button) return;
  const selectedId = selectedSceneIds.size === 1 ? [...selectedSceneIds][0] : "";
  const targetId = selectedId ? lineBreakTargetForScene(selectedId) : "";
  const firstId = storyUnits()[0]?.scenes[0]?.id || "";
  const removable = Boolean(targetId && (state.sceneLineBreaks || []).includes(targetId));
  button.disabled = !targetId || targetId === firstId;
  button.textContent = removable ? "↵ Fjern rækkeskift" : "↵ Ny række før valgte";
}
function toggleLineBreakBeforeSelected() {
  if (selectedSceneIds.size !== 1) return toast("Vælg præcis én scene for at placere et rækkeskift");
  const targetId = lineBreakTargetForScene([...selectedSceneIds][0]);
  const firstId = storyUnits()[0]?.scenes[0]?.id || "";
  if (!targetId || targetId === firstId) return toast("Historien begynder allerede på første række");
  const breaks = new Set(state.sceneLineBreaks || []);
  const removing = breaks.delete(targetId);
  if (!removing) breaks.add(targetId);
  state.sceneLineBreaks = [...breaks];
  normalizeStoryStructure();
  layoutStoryRow();
  refreshStoryRowMarkers();
  positionSceneWorld();
  updateSceneSelectionUI();
  saveState();
  toast(removing ? "Rækkeskiftet er fjernet" : "Historien fortsætter på en ny række");
}
function removeLineBreak(sceneId) {
  state.sceneLineBreaks = (state.sceneLineBreaks || []).filter(id => id !== sceneId);
  normalizeStoryStructure();
  layoutStoryRow();
  refreshStoryRowMarkers();
  positionSceneWorld();
  updateSceneSelectionUI();
  saveState();
  toast("Rækkeskiftet er fjernet");
}
function insertLineBreakBefore(sceneId) {
  const targetId = lineBreakTargetForScene(sceneId), firstId = storyUnits()[0]?.scenes[0]?.id || "";
  if (!targetId || targetId === firstId) return toast("Der skal være mindst én scene før rækkeskiftet");
  if ((state.sceneLineBreaks || []).includes(targetId)) return toast("Der er allerede et rækkeskift her");
  state.sceneLineBreaks = [...(state.sceneLineBreaks || []), targetId];
  normalizeStoryStructure();
  layoutStoryRow();
  refreshStoryRowMarkers();
  positionSceneWorld();
  updateSceneSelectionUI();
  saveState();
  toast("De følgende scener er flyttet til rækken under");
}
function refreshStoryRowMarkers(viewport = document.querySelector("#story-flow")) {
  const world = viewport?.querySelector("#scene-world"); if (!world) return;
  world.querySelectorAll("[data-row-break]").forEach(marker => marker.remove());
  (state.sceneLineBreaks || []).forEach((sceneId, index) => {
    const marker = document.createElement("button");
    marker.className = "story-row-marker"; marker.type = "button"; marker.dataset.rowBreak = sceneId;
    marker.title = "Fjern dette rækkeskift"; marker.innerHTML = `↵ Række ${index + 2}<span>×</span>`;
    marker.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); removeLineBreak(sceneId); });
    world.prepend(marker);
  });
}
function updateSceneSelectionUI() {
  document.querySelectorAll("[data-scene-node]").forEach(node => node.classList.toggle("scene-selected", selectedSceneIds.has(node.dataset.sceneNode)));
  const count = document.querySelector("#selected-scene-count"); if (count) count.textContent = `(${selectedSceneIds.size})`;
  const button = document.querySelector("#add-separator"); if (button) button.disabled = selectedSceneIds.size === 0;
  const fullscreenChapter = document.querySelector("#fullscreen-add-chapter");
  if (fullscreenChapter) { fullscreenChapter.disabled = selectedSceneIds.size === 0; fullscreenChapter.querySelector("span").textContent = `(${selectedSceneIds.size})`; }
  updateLineBreakButton(document.querySelector("#toggle-linebreak"));
  updateLineBreakButton(document.querySelector("#fullscreen-toggle-linebreak"));
  const action = document.querySelector("#chapter-selection-action"); if (!action) return;
  action.hidden = selectedSceneIds.size === 0;
  if (!selectedSceneIds.size) return;
  const touching = state.separators.filter(separator => (separator.sceneIds || []).some(id => selectedSceneIds.has(id)));
  const chapter = touching.length === 1 ? touching[0] : null;
  const sameMembers = chapter && chapter.sceneIds.length === selectedSceneIds.size && chapter.sceneIds.every(id => selectedSceneIds.has(id));
  action.dataset.updateChapter = chapter?.id || "";
  action.disabled = Boolean(sameMembers);
  action.textContent = sameMembers
    ? `✓ ${chapter.title || chapter.type || "Kapitlet"} omslutter de valgte`
    : chapter
      ? `▣ Udvid ${chapter.title || chapter.type || "kapitlet"} omkring ${selectedSceneIds.size} valgte`
      : `＋ Opret kapitel omkring ${selectedSceneIds.size} valgte`;
}
function applySelectedScenesToChapter() {
  const action = document.querySelector("#chapter-selection-action"), chapterId = action?.dataset.updateChapter;
  if (!selectedSceneIds.size) return;
  if (!chapterId) return openSeparator();
  const chapter = state.separators.find(separator => separator.id === chapterId); if (!chapter) return openSeparator();
  const movingIds = new Set(selectedSceneIds);
  state.separators = state.separators.map(item => item.id === chapter.id ? item : { ...item, sceneIds:(item.sceneIds || []).filter(id => !movingIds.has(id)) }).filter(item => item.sceneIds.length);
  chapter.sceneIds = [...new Set([...(chapter.sceneIds || []), ...selectedSceneIds])]; selectedSceneIds.clear();
  saveState(); positionChapterFrames(); updateSceneSelectionUI();
  toast(`${chapter.title || chapter.type || "Kapitlet"} omslutter nu de valgte scener`);
}
function sceneVisualMarkup(s) {
  return s.imageUrl
    ? `<figure class="scene-visual"><img src="${escapeHTML(s.imageUrl)}" alt="Visualisering af ${escapeHTML(s.title || "scenen")}"><div class="scene-image-actions"><button class="scene-image-action" data-generate-scene-image="${s.id}" type="button">✦ Nyt AI-billede</button><button class="scene-image-action" data-upload-scene-image="${s.id}" type="button">↑ Upload</button></div></figure>`
    : `<div class="scene-image-empty"><span>▧</span><strong>Tilføj scenebillede</strong><small>Vælg AI eller et billede fra computeren</small><div class="scene-empty-actions"><button data-generate-scene-image="${s.id}" type="button">✦ AI-generér</button><button data-upload-scene-image="${s.id}" type="button">↑ Upload billede</button></div></div>`;
}
function updateSceneImageCanvas(sceneId) {
  const scene = state.scenes.find(item => item.id === sceneId);
  const card = document.querySelector(`.scene-card[data-scene="${sceneId}"]`);
  const currentVisual = card?.querySelector(".scene-visual, .scene-image-empty");
  if (!scene || !card || !currentVisual) return;
  const template = document.createElement("template");
  template.innerHTML = sceneVisualMarkup(scene).trim();
  const nextVisual = template.content.firstElementChild;
  currentVisual.replaceWith(nextVisual);
  card.classList.toggle("has-scene-image", Boolean(scene.imageUrl));
  card.classList.remove("generating-image");
  const node = card.closest(".flow-node");
  node?.style.setProperty("--scene-width", `${sceneCanvasWidth(scene)}px`);
  nextVisual.querySelector("[data-generate-scene-image]")?.addEventListener("click", event => {
    event.preventDefault(); event.stopPropagation();
    requestSceneImage(sceneId, event.currentTarget);
  });
  nextVisual.querySelector("[data-upload-scene-image]")?.addEventListener("click", event => {
    event.preventDefault(); event.stopPropagation();
    uploadLocalImage("scenes", sceneId);
  });
  const refreshGeometry = () => refreshSceneGeometryAndLayout();
  nextVisual.querySelector("img")?.addEventListener("load", refreshGeometry, { once:true });
  refreshGeometry();
}
function sceneCard(s, i) {
  const globalIndex = state.scenes.findIndex(x => x.id === s.id) + 1;
  const actors = actorNames(s);
  const location = environmentById(s.locationId)?.name || s.setting;
  const mood = storyMoods.find(item => item.id === (s.mood || "clear")) || storyMoods[0];
  const visual = sceneVisualMarkup(s);
  return `<article class="scene-card scene-canvas ${s.imageUrl ? "has-scene-image" : ""}" draggable="true" data-scene="${s.id}" tabindex="0">${visual}<span class="scene-number">Scene ${String(globalIndex).padStart(2,"0")} · Akt ${s.act || 1}</span><h4>${escapeHTML(s.title || "Uden titel")}</h4><div class="scene-essentials"><div><b>Aktører</b><span>${actors.length ? actors.map(escapeHTML).join(", ") : "Ikke valgt"}</span></div><div><b>Begivenhed</b><span>${escapeHTML(s.summary || "Ikke beskrevet")}</span></div><div><b>Lokation</b><span>${escapeHTML(location || "Ikke valgt")}</span></div><div class="scene-feeling"><b>Publikum skal føle</b><span>${escapeHTML(s.audienceFeeling || "Ikke besluttet")}</span></div></div><div class="scene-meta"><span class="chip scene-mood-chip" data-scene-mood-chip>${mood.icon} ${mood.label}</span>${s.pov ? `<span class="chip">POV: ${escapeHTML(s.pov)}</span>` : ""}${s.turn ? `<span class="chip">↻ vendepunkt</span>` : ""}</div><button class="scene-menu" data-edit-scene="${s.id}" type="button" aria-label="Redigér scene">•••</button></article>`;
}
function sceneCanvasWidth(scene) {
  const contentLength = [scene.summary, scene.audienceFeeling, scene.goal, scene.conflict, scene.turn].filter(Boolean).join(" ").length;
  return Math.round(Math.min(420, Math.max(scene.imageUrl ? 350 : 280, 276 + Math.sqrt(contentLength) * 5.5)));
}

function renderStoryboard() {
  const frames = state.scenes.length ? state.scenes.map((s, i) => `<article class="card story-frame"><div class="frame-image"><span class="frame-number">Akt ${s.act} · Scene ${String(i+1).padStart(2,"0")}</span><div class="frame-title">${escapeHTML(s.title || "Uden titel")}</div></div><div class="frame-body"><dl><dt>Aktører</dt><dd>${escapeHTML(actorNames(s).join(", ") || "Vælg scenens aktører")}</dd><dt>Lokation</dt><dd>${escapeHTML(environmentById(s.locationId)?.name || s.setting || "Vælg et miljø")}</dd><dt>Handling</dt><dd>${escapeHTML(s.summary || "Beskriv den synlige handling")}</dd><dt>Spænding</dt><dd>${escapeHTML(s.goal && s.conflict ? `${s.goal} — men ${s.conflict}` : s.conflict || "Tilføj mål og modstand")}</dd><dt>Forandring</dt><dd>${escapeHTML(s.turn || "Hvad er anderledes bagefter?")}</dd></dl><div class="emotion-shift"><span>Før</span><i></i><span>Efter</span></div><div style="margin-top:12px;text-align:right"><button class="mini-button" data-edit-scene="${s.id}" type="button">Udfyld billedet</button></div></div></article>`).join("") : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">▤</div><h3>Storyboardet vokser ud af dine scener</h3><p>Opret først scener. Så bliver hver scene automatisk til en billedramme her.</p><button class="button primary" data-nav="scenes" type="button">Gå til scener</button></div>`;
  return `${pageHead("Kapitel 6 · Overblikket", "Se historien som et storyboard", "Et storyboard for prosa viser ikke kameravinkler. Det viser scenens stærkeste billede, synlige handling, følelsesmæssige skift og det vendepunkt, som fører os videre.")}
  <div class="lesson-strip"><div class="lesson-icon">▤</div><div><strong>Én ramme, ét dramatisk skift</strong><p>Hvis du ikke kan finde scenens “før” og “efter”, mangler den måske et vendepunkt.</p></div><button type="button" data-nav="scenes">Redigér scener →</button></div>
  <div class="board-toolbar"><div><h2>${state.scenes.length} billeder i din historie</h2><p class="hint">Rækkefølgen følger din scenetavle.</p></div><button class="button secondary" id="print-board" type="button">Udskriv storyboard</button></div><div class="storyboard">${frames}</div>`;
}

function renderDraft() {
  return `${pageHead("Kapitel 7 · Siderne", "Skriv fremad. Revidér i lag.", "Planen skal gøre dig modig nok til at skrive—ikke så forsigtig, at du aldrig begynder. Vælg en lille rytme, skriv det første udkast, og ret de største ting først.")}
  ${lessonStrip("Første udkast er opdagelse", "Skriv med døren lukket. Revidér med døren åben og læserens oplevelse for øje.")}
  <div class="form-layout"><div>
    <section class="card form-card"><span class="eyebrow">Din skriveaftale</span><h2>Gør arbejdet gentageligt</h2><p class="lead" style="font-size:12px">Motivation svinger. En konkret tid, et sted og et lille mål kan gentages.</p><div class="form-grid two" style="margin-top:20px">${field("draft.ritual", "Hvornår og hvor?", "Fx hverdage 07.00 ved køkkenbordet")}${field("draft.weeklyGoal", "Ugens mål", "Fx 2.000 ord eller tre scener")}${field("draft.pov", "Synsvinkel", "Fx tæt tredje person")}${field("draft.tense", "Tid", "Fx datid")}${field("draft.voice", "Sproglig ledestjerne", "Fx enkel, sanselig og tør humor")}</div></section>
    <section class="section card form-card"><span class="eyebrow">Åbn døren</span><h2>Din første linje</h2><p class="lead" style="font-size:12px">Den behøver ikke være genial. Den skal skabe en lille ændring, et spørgsmål eller en stemme, vi vil følge.</p><div style="margin-top:18px">${field("draft.firstLine", "Skriv den her", "Den morgen …", { rows: 3, big: true })}</div></section>
    <section class="section card form-card"><span class="eyebrow">Revisionstrappen</span><h2>Ret i den rigtige rækkefølge</h2><div class="grid two" style="margin-top:18px"><div class="step-card card"><span class="step-no">1</span><h3>Historien</h3><p>Præmis, slutning, karakterforandring og årsag/virkning.</p></div><div class="step-card card"><span class="step-no">2</span><h3>Scenerne</h3><p>Mål, modstand, vendepunkt, tempo og rækkefølge.</p></div><div class="step-card card"><span class="step-no">3</span><h3>Afsnittene</h3><p>Synsvinkel, handling, dialog, beskrivelse og rytme.</p></div><div class="step-card card"><span class="step-no">4</span><h3>Sætningerne</h3><p>Præcision, verber, gentagelser, klang og korrektur.</p></div></div><div style="margin-top:20px">${field("draft.notes", "Noter til dig selv", "Motiver, løfter, research og ting du vil huske i udkastet", { rows: 5 })}</div></section>
  </div>${coachCard("Klar til første udkast?", "Du behøver ikke vide alt. Du skal vide nok til den næste scene.", [[state.scenes.length >= 3,"Mindst tre scener er planlagt"],[nonempty(state.draft.ritual),"En konkret skriverutine er valgt"],[nonempty(state.draft.pov),"Synsvinklen er besluttet"],[nonempty(state.draft.firstLine),"Den første linje findes"]], "Sæt 25 minutter. Skriv kun scenens mål, modstand og vendepunkt som levende handling. Stop midt i noget, du glæder dig til at fortsætte.")}</div>`;
}

function renderAcademy() {
  return `${pageHead("Håndværksbibliotek", "Lær håndværket, når du har brug for det", "Korte lektioner samlet fra projektets fagbøger og omsat til praktiske beslutninger. Læs en lektion, brug den straks i din egen historie.")}
  <section class="principle"><blockquote>Håndværk er ikke regler, der begrænser fantasien. Det er et sprog for at se, hvorfor en historie lever—og hvor den mister sin kraft.</blockquote><p>Værktøjets model forener gradvis Snowflake-planlægning, karakterbaseret struktur, fem akter, scene- og reaktionscyklusser samt praksis for udkast og revision.</p></section>
  <div class="section academy-grid">${lessons.map(l => `<article class="card academy-card" data-lesson="${l.no}" role="button" tabindex="0" aria-label="Læs lektion ${l.no}: ${l.title}"><span class="lesson-number">Lektion ${l.no} · ${l.tag}</span><h3>${l.title}</h3><p>${l.text}</p><footer><span>${l.time}</span><span>Læs →</span></footer></article>`).join("")}</div>
  <section class="section card form-card"><span class="eyebrow">Den samlede metode</span><h2>Din vej gennem en historie</h2><div class="grid three" style="margin-top:20px">${["Komprimer idéen til én sætning","Find personens mål, fejl og behov","Gør verden til en aktiv modkraft","Fordel forandringen over fem akter","Byg scener med mål og vendepunkt","Se rækkefølgen i et storyboard","Skriv fremad i en lille rytme","Revidér fra helhed til sætning","Lad læserens oplevelse være dommeren"].map((x,i)=>`<div class="check ok"><i>${i+1}</i><span>${x}</span></div>`).join("")}</div></section>`;
}

function render() {
  const restoreSceneFullscreen = document.fullscreenElement?.id === "story-flow";
  stopScene3D();
  const app = document.querySelector("#app");
  app.classList.toggle("scene-page", state.active === "scenes");
  const renderer = { start: renderStart, foundation: renderFoundation, characters: renderCharacters, world: renderWorld, plot: renderPlot, scenes: renderScenes, storyboard: renderStoryboard, draft: renderDraft, academy: renderAcademy }[state.active] || renderStart;
  app.innerHTML = renderer();
  bindPageEvents();
  updateChrome();
  applyStoryMood();
  if (restoreSceneFullscreen) {
    const nextViewport = document.querySelector("#story-flow");
    nextViewport?.requestFullscreen?.().catch(() => toast("Scenen blev gemt, men browseren kunne ikke gendanne fuldskærm"));
  }
  app.focus({ preventScroll: true });
}

function openLesson(number) {
  const index = lessons.findIndex(lesson => lesson.no === String(number).padStart(2, "0"));
  if (index < 0) return;
  currentLessonIndex = index;
  const lesson = lessons[index];
  const detail = lessonDetails[index];
  document.querySelector("#lesson-kicker").textContent = `Lektion ${lesson.no} · ${lesson.tag} · ${lesson.time}`;
  document.querySelector("#lesson-title").textContent = lesson.title;
  document.querySelector("#lesson-content").innerHTML = `
    <p class="lesson-lead">${escapeHTML(detail.lead)}</p>
    <h3>Hvorfor det virker</h3>
    <p>${escapeHTML(detail.why)}</p>
    <h3>Sådan bruger du det</h3>
    <ul>${detail.method.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    <div class="example-box"><strong>Eksempel</strong><p>${escapeHTML(detail.example)}</p></div>
    <div class="exercise-box"><strong>Din øvelse</strong><p>${escapeHTML(detail.exercise)}</p></div>
    <h3>Tjek dit arbejde</h3>
    <ul>${detail.check.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
  document.querySelector("#lesson-position").textContent = `${index + 1} af ${lessons.length}`;
  document.querySelector("#previous-lesson").disabled = index === 0;
  document.querySelector("#next-lesson").textContent = index === lessons.length - 1 ? "Luk ✓" : "Næste →";
  document.querySelector("#lesson-content").scrollTop = 0;
  const dialog = document.querySelector("#lesson-dialog");
  if (!dialog.open) dialog.showModal();
}

function moveLesson(direction) {
  const next = currentLessonIndex + direction;
  if (next < 0) return;
  if (next >= lessons.length) return document.querySelector("#lesson-dialog").close();
  openLesson(lessons[next].no);
}

function bindPageEvents() {
  document.querySelectorAll("[data-path]").forEach(el => el.addEventListener("input", e => {
    setPath(e.target.dataset.path, e.target.value);
    if (e.target.dataset.path === "title") document.querySelector("#sidebar-title").textContent = e.target.value || "Uden titel";
    scheduleSave();
  }));
  document.querySelectorAll("[data-scroll]").forEach(b => b.addEventListener("click", () => document.getElementById(b.dataset.scroll)?.scrollIntoView({ behavior: "smooth" })));
  document.querySelector("#shuffle-idea")?.addEventListener("click", shuffleIdea);
  document.querySelector("#use-idea")?.addEventListener("click", useIdea);
  document.querySelector("#toggle-character-form")?.addEventListener("click", () => openCharacterForm());
  document.querySelector("#cancel-character")?.addEventListener("click", closeCharacterForm);
  document.querySelector("#character-form")?.addEventListener("submit", saveCharacter);
  document.querySelectorAll("[data-edit-character]").forEach(b => b.addEventListener("click", () => openCharacterForm(b.dataset.editCharacter)));
  document.querySelectorAll("[data-delete-character]").forEach(b => b.addEventListener("click", () => deleteCharacter(b.dataset.deleteCharacter)));
  document.querySelectorAll("[data-generate-character-image]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); requestCharacterImage(button.dataset.generateCharacterImage, button); }));
  document.querySelectorAll("[data-upload-character-image]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); uploadLocalImage("characters", button.dataset.uploadCharacterImage); }));
  document.querySelector("#toggle-environment-form")?.addEventListener("click", () => openEnvironmentForm());
  document.querySelector("#cancel-environment")?.addEventListener("click", closeEnvironmentForm);
  document.querySelector("#environment-form")?.addEventListener("submit", saveEnvironment);
  document.querySelectorAll("[data-edit-environment]").forEach(button => button.addEventListener("click", () => openEnvironmentForm(button.dataset.editEnvironment)));
  document.querySelectorAll("[data-delete-environment]").forEach(button => button.addEventListener("click", () => deleteEnvironment(button.dataset.deleteEnvironment)));
  document.querySelector("#add-scene")?.addEventListener("click", () => openScene());
  document.querySelector("#empty-add-scene")?.addEventListener("click", () => openScene());
  document.querySelector("#add-separator")?.addEventListener("click", () => openSeparator());
  document.querySelector("#toggle-linebreak")?.addEventListener("click", toggleLineBreakBeforeSelected);
  document.querySelectorAll("[data-row-break]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); removeLineBreak(button.dataset.rowBreak); }));
  document.querySelector("#chapter-selection-action")?.addEventListener("click", applySelectedScenesToChapter);
  document.querySelector("#reset-scene-layout")?.addEventListener("click", resetSceneLayout);
  document.querySelector("#fullscreen-add-scene")?.addEventListener("click", () => openScene());
  document.querySelector("#fullscreen-add-chapter")?.addEventListener("click", () => openSeparator());
  document.querySelector("#fullscreen-toggle-linebreak")?.addEventListener("click", toggleLineBreakBeforeSelected);
  document.querySelector("#fullscreen-add-person")?.addEventListener("click", () => leaveFullscreenThen(() => openCharacterForm()));
  document.querySelector("#fullscreen-add-environment")?.addEventListener("click", () => leaveFullscreenThen(() => { navigate("world"); setTimeout(() => openEnvironmentForm(), 100); }));
  document.querySelector("#fullscreen-open-backend")?.addEventListener("click", () => leaveFullscreenThen(() => document.querySelector("#story-backend")?.scrollIntoView({ behavior:"smooth", block:"start" })));
  document.querySelector("#read-full-story")?.addEventListener("click", openFullStoryDialog);
  document.querySelector("#fullscreen-read-story")?.addEventListener("click", () => leaveFullscreenThen(openFullStoryDialog));
  document.querySelector("#fullscreen-open-ai")?.addEventListener("click", () => leaveFullscreenThen(openAiDrawer));
  document.querySelector("#fullscreen-open-api-key")?.addEventListener("click", () => leaveFullscreenThen(openApiKeyPanel));
  document.querySelector("#scene-mood-select")?.addEventListener("change", event => changeStoryMood(event.target.value));
  document.querySelector("#fullscreen-mood-select")?.addEventListener("change", event => changeStoryMood(event.target.value));
  document.querySelector("#scene-speed-range")?.addEventListener("input", event => setMovementSpeed(event.target.value));
  document.querySelector("#fullscreen-speed-range")?.addEventListener("input", event => setMovementSpeed(event.target.value));
  document.querySelector("#mood-focus-project")?.addEventListener("click", () => { focusedSceneId = null; document.querySelectorAll("[data-scene-node]").forEach(node => node.classList.remove("scene-focused")); applyStoryMood(); });
  document.querySelector("#fullscreen-level")?.addEventListener("click", levelSceneCamera);
  document.querySelector("#fullscreen-reset")?.addEventListener("click", resetSceneLayout);
  document.querySelector("#fullscreen-save")?.addEventListener("click", saveStoryProjectToDisk);
  document.querySelector("#fullscreen-sync-obsidian")?.addEventListener("click", syncStoryToObsidian);
  document.querySelector("#fullscreen-exit")?.addEventListener("click", () => document.exitFullscreen?.());
  document.querySelectorAll("[data-edit-scene]").forEach(b => b.addEventListener("click", () => openScene(b.dataset.editScene)));
  document.querySelectorAll("[data-generate-scene-image]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); requestSceneImage(button.dataset.generateSceneImage, button); }));
  document.querySelectorAll("[data-upload-scene-image]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); uploadLocalImage("scenes", button.dataset.uploadSceneImage); }));
  document.querySelectorAll("[data-edit-separator]").forEach(button => button.addEventListener("click", event => { event.stopPropagation(); openSeparator(button.dataset.editSeparator); }));
  document.querySelectorAll("[data-chapter-title]").forEach(title => {
    title.addEventListener("pointerdown", event => event.stopPropagation());
    title.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); title.blur(); } });
    title.addEventListener("input", () => {
      const separator = state.separators.find(item => item.id === title.dataset.chapterTitle); if (!separator) return;
      separator.title = title.textContent.trim(); scheduleSave();
    });
  });
  document.querySelectorAll(".scene-card").forEach(card => {
    card.addEventListener("click", event => {
      if (card._justDragged) { card._justDragged = false; return; }
      focusSceneMood(card.dataset.scene);
      if (event.shiftKey && !event.target.closest("button")) { event.preventDefault(); toggleSceneSelection(card.dataset.scene); return; }
      if (!event.target.closest("button")) openScene(card.dataset.scene);
    });
    card.addEventListener("keydown", event => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button")) { event.preventDefault(); openScene(card.dataset.scene); } });
  });
  document.querySelector("#print-board")?.addEventListener("click", () => window.print());
  document.querySelectorAll(".ai-field-button").forEach(button => {
    if (button.dataset.aiBound) return;
    button.dataset.aiBound = "true";
    button.addEventListener("click", event => { event.preventDefault(); requestSuggestion(button); });
  });
  document.querySelectorAll("[data-start]").forEach(button => button.addEventListener("click", () => startIdea(button.dataset.start)));
  document.querySelectorAll("[data-board-add]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.boardAdd;
    if (kind === "character") return startIdea("character");
    if (kind === "scene") return startIdea("scene");
    navigate("world"); setTimeout(() => openEnvironmentForm(), 120);
  }));
  document.querySelectorAll("[data-board-character]").forEach(button => button.addEventListener("click", () => { navigate("characters"); setTimeout(() => openCharacterForm(button.dataset.boardCharacter), 120); }));
  document.querySelectorAll("[data-board-environment]").forEach(button => button.addEventListener("click", () => { navigate("world"); setTimeout(() => openEnvironmentForm(button.dataset.boardEnvironment), 120); }));
  document.querySelectorAll("[data-board-scene]").forEach(button => button.addEventListener("click", () => { navigate("scenes"); setTimeout(() => openScene(button.dataset.boardScene), 120); }));
  document.querySelectorAll("[data-open-ai]").forEach(button => button.addEventListener("click", openAiDrawer));
  document.querySelector("#start-chat-card")?.addEventListener("click", openAiDrawer);
  document.querySelectorAll("[data-chat-prompt]").forEach(button => button.addEventListener("click", () => { openAiDrawer(); document.querySelector("#chat-input").value = button.dataset.chatPrompt; }));
  document.querySelectorAll("[data-lesson]").forEach(card => {
    card.addEventListener("click", () => openLesson(card.dataset.lesson));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openLesson(card.dataset.lesson); }
    });
  });
  initScene3D();
}

function navigate(id) {
  state.active = id;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#sidebar").classList.remove("open");
}
function leaveFullscreenThen(action) {
  if (!document.fullscreenElement) return action();
  document.exitFullscreen?.().then(() => setTimeout(action, 80)).catch(() => action());
}
function resetSceneLayout() {
  layoutStoryRow();
  saveState(); render();
  requestAnimationFrame(() => { fitStoryToViewport(); scheduleSave(); });
  toast("Scenerummet er nulstillet");
}
function levelSceneCamera() {
  if (!state.scenes.length) return;
  state.sceneCamera.y = state.scenes.reduce((sum, scene) => sum + (Number(scene.worldY) || 0), 0) / state.scenes.length;
  state.sceneCamera.pitch = 0; state.sceneCamera.yaw = 0;
  applySceneCamera(); scheduleSave(); toast("Kameraet er rettet mod sceneplanet");
}
function startIdea(type) {
  if (type === "character") { navigate("characters"); return setTimeout(() => openCharacterForm(), 120); }
  if (type === "scene") { navigate("scenes"); return setTimeout(() => openScene(), 120); }
  if (type === "world") { navigate("world"); return setTimeout(() => openEnvironmentForm(), 120); }
  const routes = { conflict: ["foundation", "foundation.question"], ending: ["plot", "plot.finalImage"] };
  const [page, path] = routes[type] || ["start", null]; navigate(page);
  if (path) setTimeout(() => { const element = document.querySelector(`[data-path="${path}"]`); element?.focus(); element?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150);
}
function shuffleIdea() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  state.idea = { person: pick(ideas.people), disturbance: pick(ideas.disturbances), stake: pick(ideas.stakes) };
  document.querySelector("#idea-person").textContent = state.idea.person;
  document.querySelector("#idea-disturbance").textContent = state.idea.disturbance;
  document.querySelector("#idea-stake").textContent = state.idea.stake;
  saveState();
}
function useIdea() {
  state.foundation.premise = `Da ${state.idea.person} ${state.idea.disturbance}, ${state.idea.stake}.`;
  saveState(); navigate("foundation"); toast("Idéen er lagt ind som en foreløbig præmis");
}

function openCharacterForm(id) {
  const wrap = document.querySelector("#character-form-wrap");
  wrap.hidden = false;
  const form = document.querySelector("#character-form");
  form.reset();
  document.querySelector("#character-form-title").textContent = id ? "Redigér person" : "Ny person";
  if (id) {
    const c = state.characters.find(x => x.id === id);
    if (c) Object.entries(c).forEach(([k,v]) => { if (form.elements[k]) form.elements[k].value = v; });
  }
  wrap.scrollIntoView({ behavior: "smooth", block: "center" });
}
function closeCharacterForm() {
  if (sceneDraftWaitingForCharacter) return restoreSceneAfterCharacter();
  const w = document.querySelector("#character-form-wrap"); if (w) w.hidden = true;
}
function saveCharacter(e) {
  e.preventDefault(); const data = Object.fromEntries(new FormData(e.target));
  if (!data.name.trim()) return toast("Giv personen et navn først");
  let createdId = null;
  if (data.id) state.characters = state.characters.map(c => c.id === data.id ? { ...c, ...data } : c);
  else { createdId = uid("c"); state.characters.push({ ...data, id: createdId }); }
  saveState();
  if (sceneDraftWaitingForCharacter && createdId) return restoreSceneAfterCharacter(createdId);
  render(); toast("Personen er gemt");
}
function deleteCharacter(id) {
  const c = state.characters.find(x => x.id === id); if (!c) return;
  const usage = state.scenes.filter(scene => (scene.actorIds || []).includes(id)).length;
  const message = usage ? `${c.name} medvirker i ${usage} scener. Sletning fjerner personen fra dem. Fortsæt?` : `Vil du fjerne ${c.name}?`;
  if (confirm(message)) { state.characters = state.characters.filter(x => x.id !== id); state.scenes = state.scenes.map(scene => ({ ...scene, actorIds: (scene.actorIds || []).filter(actorId => actorId !== id) })); saveState(); render(); }
}

function openEnvironmentForm(id) {
  const wrap = document.querySelector("#environment-form-wrap");
  if (!wrap) return;
  wrap.hidden = false;
  const form = document.querySelector("#environment-form"); form.reset();
  document.querySelector("#environment-form-title").textContent = id ? "Redigér miljø" : "Nyt miljø";
  if (id) {
    const environment = state.environments.find(item => item.id === id);
    if (environment) Object.entries(environment).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
  }
  wrap.scrollIntoView({ behavior: "smooth", block: "center" });
}
function closeEnvironmentForm() { const wrap = document.querySelector("#environment-form-wrap"); if (wrap) wrap.hidden = true; }
function saveEnvironment(event) {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.target));
  if (!data.name.trim()) return toast("Giv miljøet et navn først");
  if (data.id) state.environments = state.environments.map(environment => environment.id === data.id ? data : environment);
  else state.environments.push({ ...data, id: uid("e") });
  saveState(); render(); toast("Miljøet er gemt");
}
function deleteEnvironment(id) {
  const environment = environmentById(id); if (!environment) return;
  const usage = state.scenes.filter(scene => scene.locationId === id).length;
  const message = usage ? `${environment.name} bruges i ${usage} scener. Sletning fjerner lokationen fra dem. Fortsæt?` : `Vil du fjerne ${environment.name}?`;
  if (confirm(message)) {
    state.environments = state.environments.filter(item => item.id !== id);
    state.scenes = state.scenes.map(scene => scene.locationId === id ? { ...scene, locationId: "" } : scene);
    saveState(); render();
  }
}

function openScene(id, position = null, insertIndex = null) {
  const dialog = document.querySelector("#scene-dialog"); const form = document.querySelector("#scene-form"); form.reset();
  form.elements.sceneId.value = "";
  form.elements.sceneId.defaultValue = "";
  document.querySelector("#ai-scene-draft").hidden = true;
  document.querySelector("#ai-scene-draft-text").value = "";
  document.querySelector("#ai-scene-draft-status").textContent = "Klar til redigering og kopiering";
  pendingScenePosition = id ? null : position;
  pendingSceneInsertIndex = id || !Number.isInteger(insertIndex) ? null : Math.max(0, Math.min(state.scenes.length, insertIndex));
  document.querySelector("#scene-dialog-title").textContent = id ? "Redigér scene" : "Tilføj scene";
  document.querySelector("#delete-scene").hidden = !id;
  const current = id ? state.scenes.find(scene => scene.id === id) : null;
  if (current) focusSceneMood(current.id);
  document.querySelector("#scene-actor-options").innerHTML = state.characters.length ? state.characters.map(character => `<label class="actor-option"><input type="checkbox" name="actorIds" value="${character.id}"><span>${escapeHTML(character.name || "Navnløs")}${character.age ? ` · ${escapeHTML(character.age)} år` : ""}</span></label>`).join("") : `<div class="actor-picker-empty">Opret personer først for at forbinde dem med scenen.</div>`;
  document.querySelector("#scene-location-select").innerHTML = `<option value="">Vælg lokation…</option>${state.environments.map(environment => `<option value="${environment.id}">${escapeHTML(environment.name || "Uden navn")}</option>`).join("")}`;
  if (id) {
    const s = current;
    if (s) { Object.entries(s).forEach(([k,v]) => { if (form.elements[k === "id" ? "sceneId" : k]) form.elements[k === "id" ? "sceneId" : k].value = v; }); }
    (s?.actorIds || []).forEach(actorId => { const checkbox = form.querySelector(`input[name="actorIds"][value="${actorId}"]`); if (checkbox) checkbox.checked = true; });
    form.elements.locationId.value = s?.locationId || "";
  }
  form.elements.mood.value = current?.mood || state.backend?.storyMood || "clear";
  dialog.showModal();
}
function createCharacterFromScene() {
  const form = document.querySelector("#scene-form");
  if (!form) return;
  sceneDraftWaitingForCharacter = {
    values: formValues("scene"),
    position: pendingScenePosition ? { ...pendingScenePosition } : null,
    insertIndex: pendingSceneInsertIndex,
    draftText: document.querySelector("#ai-scene-draft-text")?.value || "",
    draftVisible: !document.querySelector("#ai-scene-draft")?.hidden
  };
  document.querySelector("#scene-dialog")?.close();
  navigate("characters");
  setTimeout(() => openCharacterForm(), 80);
}
function restoreSceneAfterCharacter(createdId = null) {
  const draft = sceneDraftWaitingForCharacter;
  if (!draft) return;
  sceneDraftWaitingForCharacter = null;
  navigate("scenes");
  setTimeout(() => {
    openScene(draft.values.sceneId || null, draft.position, draft.insertIndex);
    const form = document.querySelector("#scene-form");
    Object.entries(draft.values).forEach(([name, value]) => {
      if (name === "actorIds") return;
      const element = form?.elements[name];
      if (element) element.value = value ?? "";
    });
    const actorIds = new Set([...(draft.values.actorIds || []), ...(createdId ? [createdId] : [])]);
    actorIds.forEach(actorId => {
      const checkbox = form?.querySelector(`input[name="actorIds"][value="${CSS.escape(actorId)}"]`);
      if (checkbox) checkbox.checked = true;
    });
    const draftPanel = document.querySelector("#ai-scene-draft"), draftText = document.querySelector("#ai-scene-draft-text");
    if (draftText) draftText.value = draft.draftText;
    if (draftPanel) draftPanel.hidden = !draft.draftVisible;
    toast(createdId ? "Personen er oprettet og valgt i scenen" : "Tilbage til scenen");
  }, 80);
}
function saveScene(e) {
  e.preventDefault(); const form = document.querySelector("#scene-form"); const data = Object.fromEntries(new FormData(form));
  if (!data.title.trim()) return toast("Giv scenen en titel");
  const id = data.sceneId; delete data.sceneId; data.act = +data.act; data.actorIds = [...form.querySelectorAll('input[name="actorIds"]:checked')].map(input => input.value); data.locationId = form.elements.locationId.value;
  if (id) state.scenes = state.scenes.map(s => s.id === id ? { ...s, ...data, id } : s);
  else {
    const newId = uid("s"), insertAt = Number.isInteger(pendingSceneInsertIndex) ? pendingSceneInsertIndex : state.scenes.length;
    const previous = state.scenes[insertAt - 1] || null, next = state.scenes[insertAt] || null;
    state.scenes.splice(insertAt, 0, { ...data, id:newId, ...(pendingScenePosition || {}) });
    if (state.sceneLinksInitialized) {
      if (previous && next) state.sceneLinks = state.sceneLinks.filter(link => !(link.from === previous.id && link.to === next.id));
      if (previous) state.sceneLinks.push({ id:uid("link"), from:previous.id, to:newId, fromSide:"right", toSide:"left" });
      if (next) state.sceneLinks.push({ id:uid("link"), from:newId, to:next.id, fromSide:"right", toSide:"left" });
    }
  }
  pendingScenePosition = null;
  pendingSceneInsertIndex = null;
  document.querySelector("#scene-dialog").close(); saveState(); render(); toast("Scenen er gemt");
}
function deleteScene() {
  const id = document.querySelector("#scene-form").elements.sceneId.value;
  if (!id) return;
  if (confirm("Vil du slette scenen?")) {
    state.scenes = state.scenes.filter(scene => scene.id !== id);
    if (focusedSceneId === id) focusedSceneId = null;
    state.sceneLinks = state.sceneLinks.filter(link => link.from !== id && link.to !== id);
    selectedSceneIds.delete(id);
    state.separators = state.separators.map(separator => ({ ...separator, sceneIds: (separator.sceneIds || []).filter(sceneId => sceneId !== id) })).filter(separator => separator.sceneIds.length);
    document.querySelector("#scene-dialog").close(); saveState(); render(); toast("Scenen er slettet");
  }
}
function openSeparator(id) {
  if (!id && !selectedSceneIds.size) return toast("Shift+klik på de scener, kapitlet skal omslutte");
  const dialog = document.querySelector("#separator-dialog");
  const form = document.querySelector("#separator-form");
  form.reset();
  const separator = id ? state.separators.find(item => item.id === id) : null;
  const sceneIds = separator?.sceneIds || [...selectedSceneIds];
  document.querySelector("#separator-dialog-title").textContent = separator ? "Redigér kapitel" : "Opret kapitel omkring valgte scener";
  document.querySelector("#delete-separator").hidden = !separator;
  form.elements.separatorId.value = separator?.id || "";
  form.elements.type.value = separator?.type || "Kapitel";
  form.elements.title.value = separator?.title || "";
  form.dataset.sceneIds = sceneIds.join(",");
  document.querySelector("#chapter-scene-summary").innerHTML = sceneIds.map(sceneId => `<span>${escapeHTML(state.scenes.find(scene => scene.id === sceneId)?.title || "Ukendt scene")}</span>`).join("");
  dialog.showModal();
  setTimeout(() => form.elements.title.focus(), 80);
}
function saveSeparator(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  if (!data.title.trim()) return toast("Giv skillekortet en titel");
  const id = data.separatorId; delete data.separatorId; data.sceneIds = event.target.dataset.sceneIds.split(",").filter(Boolean);
  const assignedIds = new Set(data.sceneIds);
  state.separators = state.separators.map(separator => separator.id === id ? separator : { ...separator, sceneIds:(separator.sceneIds || []).filter(sceneId => !assignedIds.has(sceneId)) }).filter(separator => separator.sceneIds.length);
  if (id) state.separators = state.separators.map(separator => separator.id === id ? { ...data, id } : separator);
  else state.separators.push({ ...data, id: uid("sep") });
  selectedSceneIds.clear();
  document.querySelector("#separator-dialog").close(); saveState(); render(); toast("Kapitlet omslutter de valgte scener");
}
function deleteSeparator() {
  const id = document.querySelector("#separator-form").elements.separatorId.value;
  if (!id) return;
  state.separators = state.separators.filter(separator => separator.id !== id);
  document.querySelector("#separator-dialog").close(); saveState(); render(); toast("Kapitlet er fjernet");
}
function stopScene3D() {
  if (!scene3DRuntime) return;
  cancelAnimationFrame(scene3DRuntime.frame);
  scene3DRuntime.cleanup.forEach(dispose => dispose());
  if (document.pointerLockElement === scene3DRuntime.viewport) document.exitPointerLock?.();
  scene3DRuntime = null;
}
function ensureScene3DData() {
  let changed = false;
  state.scenes.forEach((scene, index) => {
    if (!Number.isFinite(Number(scene.worldX))) { scene.worldX = (index % 4 - Math.min(1.5, (state.scenes.length - 1) / 2)) * SCENE_GRID.x; changed = true; }
    if (!Number.isFinite(Number(scene.worldY))) { scene.worldY = SCENE_FLOAT_Y; changed = true; }
    if (Number(scene.worldZ) !== 0) { scene.worldZ = 0; changed = true; }
  });
  if (!state.sceneLinksInitialized) {
    state.sceneLinks = state.scenes.slice(0, -1).map((scene, index) => ({ id: uid("link"), from: scene.id, to: state.scenes[index + 1].id, fromSide: "right", toSide: "left" }));
    state.sceneLinksInitialized = true; changed = true;
  }
  state.sceneLinks = state.sceneLinks.filter(link => state.scenes.some(scene => scene.id === link.from) && state.scenes.some(scene => scene.id === link.to));
  if (changed) saveState();
}
function initScene3D() {
  const viewport = document.querySelector("#story-flow"); const cameraRig = document.querySelector("#scene-camera"); const world = document.querySelector("#scene-world");
  if (!viewport || !cameraRig || !world || !state.scenes.length) return;
  ensureScene3DData();
  const runtime = scene3DRuntime = { viewport, cameraRig, world, keys: new Set(), navigating: false, cleanup: [], lastFrame: performance.now(), frame: 0, linkDraft: null };
  const on = (target, type, handler, options) => { target.addEventListener(type, handler, options); runtime.cleanup.push(() => target.removeEventListener(type, handler, options)); };
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(runtime.layoutRefreshFrame);
      runtime.layoutRefreshFrame = requestAnimationFrame(() => refreshSceneGeometryAndLayout(runtime));
    });
    viewport.querySelectorAll(".scene-card").forEach(card => observer.observe(card));
    runtime.cleanup.push(() => { cancelAnimationFrame(runtime.layoutRefreshFrame); observer.disconnect(); });
  }
  syncSceneCanvasGeometry(runtime);
  const storyLayoutChanged = layoutStoryRow();
  const migratedStoryLayout = state.sceneLayoutNeedsMigration;
  if (migratedStoryLayout) {
    state.sceneLayoutNeedsMigration = false;
    state.sceneCamera = { x:0, y:0, z:Math.max(900, Math.min(2600, storyRowWidth() * .42)), yaw:0, pitch:0 };
  }
  if (storyLayoutChanged || migratedStoryLayout) saveState();
  positionSceneWorld();
  updateSceneSelectionUI();
  runtime.viewport.querySelectorAll(".scene-visual img").forEach(image => on(image, "load", () => refreshSceneGeometryAndLayout(runtime)));
  on(viewport, "contextmenu", event => {
    event.preventDefault();
    const link = event.target instanceof Element ? event.target.closest("[data-scene-link]") : null;
    const blocked = event.target instanceof Element && event.target.closest(".flow-node, .world-chapter, .scene-hud");
    const movement = runtime.rightPress?.movement || 0;
    if (movement < 5 && (link || !blocked)) showSceneContextMenu(event.clientX, event.clientY, link?.dataset.sceneLink || "");
  });
  on(window, "mousedown", event => { if (event.button !== 2 && !(event.target instanceof Element && event.target.closest(".scene-context-menu"))) closeSceneContextMenu(); });
  on(viewport, "mousedown", event => {
    if (event.button !== 2) return;
    event.preventDefault(); closeSceneContextMenu();
    const link = event.target instanceof Element ? event.target.closest("[data-scene-link]") : null;
    const blocked = event.target instanceof Element && event.target.closest(".flow-node, .world-chapter, .scene-hud");
    runtime.rightPress = { x:event.clientX, y:event.clientY, movement:0, linkId:link?.dataset.sceneLink || "", blank:!link && !blocked };
    if (link) return;
    runtime.navigating = true; viewport.classList.add("flight-mode"); viewport.focus({ preventScroll: true });
    viewport.requestPointerLock?.();
  });
  on(window, "mouseup", event => {
    if (event.button !== 2 || !runtime.rightPress) return;
    const press = runtime.rightPress; runtime.rightPress = null;
    runtime.navigating = false; viewport.classList.remove("flight-mode");
    if (document.pointerLockElement === viewport) document.exitPointerLock?.(); saveState();
  });
  on(window, "mousemove", event => {
    if (!runtime.navigating) return;
    if (runtime.rightPress) runtime.rightPress.movement += Math.abs(event.movementX) + Math.abs(event.movementY);
    state.sceneCamera.yaw = (Number(state.sceneCamera.yaw) || 0) - event.movementX * .13;
    state.sceneCamera.pitch = Math.max(-75, Math.min(75, (Number(state.sceneCamera.pitch) || 0) + event.movementY * .13));
  });
  on(viewport, "wheel", event => {
    event.preventDefault();
    const camera = state.sceneCamera, forward = cameraForward(camera);
    const amount = Math.max(-180, Math.min(180, event.deltaY)) * .8;
    camera.x -= forward.x * amount; camera.y -= forward.y * amount; camera.z -= forward.z * amount;
    applySceneCamera(); draw3DLinks(); scheduleSave();
  }, { passive: false });
  on(window, "keydown", event => {
    const editing = event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']");
    if (event.code === "KeyQ" && !editing && !event.repeat) {
      event.preventDefault();
      if (document.fullscreenElement === viewport) document.exitFullscreen?.();
      else viewport.requestFullscreen?.().catch(() => toast("Browseren tillod ikke fuldskærmsvisning"));
      return;
    }
    if (event.code === "KeyG" && !editing) {
      event.preventDefault();
      levelSceneCamera();
      return;
    }
    if (!editing && ["KeyW","KeyA","KeyS","KeyD","KeyR","KeyF","ShiftLeft","ShiftRight"].includes(event.code)) { event.preventDefault(); runtime.keys.add(event.code); }
  });
  on(window, "keyup", event => runtime.keys.delete(event.code));
  on(document, "fullscreenchange", () => {
    requestAnimationFrame(() => {
      refreshSceneGeometryAndLayout(runtime);
      fitStoryToViewport(runtime);
      scheduleSave();
    });
  });
  on(window, "blur", () => { runtime.navigating = false; runtime.keys.clear(); viewport.classList.remove("flight-mode"); });
  bindScenePanelDragging(runtime, on);
  bindChapterDragging(runtime, on);
  bindSceneLinkHandles(runtime, on);
  const animate = now => {
    if (scene3DRuntime !== runtime) return;
    const dt = Math.min(.05, (now - runtime.lastFrame) / 1000); runtime.lastFrame = now;
    if ([...runtime.keys].some(code => ["KeyW","KeyA","KeyS","KeyD","KeyR","KeyF"].includes(code))) moveSceneCamera(dt, runtime.keys);
    applySceneCamera(); draw3DLinks(runtime.linkDraft); runtime.frame = requestAnimationFrame(animate);
  };
  runtime.frame = requestAnimationFrame(animate);
}
function closeSceneContextMenu() { document.querySelector(".scene-context-menu")?.remove(); }
function scenePositionFromScreen(clientX, clientY) {
  const runtime = scene3DRuntime, camera = state.sceneCamera; if (!runtime) return null;
  const rect = runtime.viewport.getBoundingClientRect(), yaw = (Number(camera.yaw) || 0) * Math.PI / 180;
  const forward = { x:-Math.sin(yaw), z:-Math.cos(yaw) }, right = { x:Math.cos(yaw), z:-Math.sin(yaw) };
  const dx = clientX - (rect.left + rect.width / 2), distance = 720, scale = 1.55;
  return { worldX:Math.round((camera.x + forward.x * distance + right.x * dx * scale) / SCENE_GRID.x) * SCENE_GRID.x, worldY:SCENE_FLOAT_Y, worldZ:0 };
}
function lineBreakTargetFromScreen(clientX, clientY) {
  const viewport = scene3DRuntime?.viewport; if (!viewport) return null;
  const allUnits = storyUnits(), rows = storyRows();
  const rowEntries = rows.map(row => {
    const units = row.map(unit => {
      const rects = unit.scenes.map(scene => viewport.querySelector(`[data-scene-node="${scene.id}"]`)?.getBoundingClientRect()).filter(Boolean);
      if (!rects.length) return null;
      return { unit, left:Math.min(...rects.map(rect => rect.left)), right:Math.max(...rects.map(rect => rect.right)), top:Math.min(...rects.map(rect => rect.top)), bottom:Math.max(...rects.map(rect => rect.bottom)) };
    }).filter(Boolean).sort((a, b) => a.left - b.left);
    if (!units.length) return null;
    return { units, top:Math.min(...units.map(item => item.top)), bottom:Math.max(...units.map(item => item.bottom)) };
  }).filter(Boolean);
  const row = rowEntries.sort((a, b) => {
    const distance = item => clientY < item.top ? item.top - clientY : clientY > item.bottom ? clientY - item.bottom : 0;
    return distance(a) - distance(b);
  })[0];
  if (!row) return null;
  const following = row.units.find(item => clientX < item.left);
  const preceding = [...row.units].reverse().find(item => clientX > item.right);
  let targetUnit = following?.unit || null;
  if (!targetUnit && preceding) {
    const globalIndex = allUnits.findIndex(unit => unit.id === preceding.unit.id);
    targetUnit = allUnits[globalIndex + 1] || null;
  }
  if (!targetUnit) {
    const nearest = row.units.reduce((best, item) => Math.abs((item.left + item.right) / 2 - clientX) < Math.abs((best.left + best.right) / 2 - clientX) ? item : best, row.units[0]);
    const globalIndex = allUnits.findIndex(unit => unit.id === nearest.unit.id);
    targetUnit = clientX < (nearest.left + nearest.right) / 2 ? nearest.unit : allUnits[globalIndex + 1] || null;
  }
  const sceneId = targetUnit?.scenes[0]?.id || "";
  return sceneId ? { sceneId, existing:(state.sceneLineBreaks || []).includes(sceneId), first:sceneId === allUnits[0]?.scenes[0]?.id } : null;
}
function sceneInsertIndexFromScreen(clientX, clientY) {
  const viewport = scene3DRuntime?.viewport; if (!viewport || !state.scenes.length) return state.scenes.length;
  const rows = storyRows().map(row => ({
    units:row.map(unit => {
      const rects = unit.scenes.map(scene => viewport.querySelector(`[data-scene-node="${scene.id}"]`)?.getBoundingClientRect()).filter(Boolean);
      return rects.length ? { unit, left:Math.min(...rects.map(rect => rect.left)), right:Math.max(...rects.map(rect => rect.right)), top:Math.min(...rects.map(rect => rect.top)), bottom:Math.max(...rects.map(rect => rect.bottom)) } : null;
    }).filter(Boolean)
  })).filter(row => row.units.length).map(row => ({ ...row, top:Math.min(...row.units.map(item => item.top)), bottom:Math.max(...row.units.map(item => item.bottom)) }));
  const row = rows.find(item => clientY >= item.top - 90 && clientY <= item.bottom + 90) || rows.reduce((best, item) => Math.abs((item.top + item.bottom) / 2 - clientY) < Math.abs((best.top + best.bottom) / 2 - clientY) ? item : best, rows[0]);
  const ordered = [...row.units].sort((a,b) => a.left - b.left);
  const following = ordered.find(item => clientX < (item.left + item.right) / 2);
  if (following) return Math.max(0, state.scenes.findIndex(scene => scene.id === following.unit.scenes[0]?.id));
  const lastId = ordered.at(-1)?.unit.scenes.at(-1)?.id, lastIndex = state.scenes.findIndex(scene => scene.id === lastId);
  return lastIndex < 0 ? state.scenes.length : lastIndex + 1;
}
function showSceneContextMenu(clientX, clientY, linkId = "") {
  closeSceneContextMenu();
  const menu = document.createElement("div"); menu.className = "scene-context-menu"; menu.style.left = `${clientX}px`; menu.style.top = `${clientY}px`;
  const lineBreakTarget = linkId ? null : lineBreakTargetFromScreen(clientX, clientY);
  if (linkId) menu.innerHTML = `<button type="button" data-context-delete-link="${linkId}"><span>×</span>Slet forbindelse</button>`;
  else menu.innerHTML = `<button type="button" data-context-add-scene><span>＋</span>Indsæt scene her</button><button type="button" data-context-linebreak ${!lineBreakTarget || lineBreakTarget.first ? "disabled" : ""}><span>↵</span>${lineBreakTarget?.existing ? "Fjern rækkeskift" : lineBreakTarget ? "Indsæt rækkeskift" : "Ingen følgende scener"}</button>`;
  const menuHost = document.fullscreenElement === scene3DRuntime?.viewport ? scene3DRuntime.viewport : document.body;
  menuHost.appendChild(menu);
  menu.addEventListener("mousedown", event => event.stopPropagation());
  menu.querySelector("[data-context-delete-link]")?.addEventListener("click", event => {
    event.preventDefault(); event.stopPropagation();
    state.sceneLinks = state.sceneLinks.filter(link => link.id !== linkId); closeSceneContextMenu(); saveState(); draw3DLinks();
    const count = document.querySelector("#scene-link-count"); if (count) count.textContent = state.sceneLinks.length; toast("Forbindelsen er slettet");
  });
  menu.querySelector("[data-context-add-scene]")?.addEventListener("click", () => { const position = scenePositionFromScreen(clientX, clientY), insertIndex = sceneInsertIndexFromScreen(clientX, clientY); closeSceneContextMenu(); openScene(null, position, insertIndex); });
  menu.querySelector("[data-context-linebreak]")?.addEventListener("click", () => {
    if (!lineBreakTarget || lineBreakTarget.first) return;
    closeSceneContextMenu();
    if (lineBreakTarget.existing) removeLineBreak(lineBreakTarget.sceneId);
    else insertLineBreakBefore(lineBreakTarget.sceneId);
  });
}
function cameraForward(camera) {
  const yaw = (Number(camera.yaw) || 0) * Math.PI / 180, pitch = (Number(camera.pitch) || 0) * Math.PI / 180;
  return { x: -Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: -Math.cos(yaw) * Math.cos(pitch) };
}
function moveSceneCamera(dt, keys) {
  const camera = state.sceneCamera, forward = cameraForward(camera), yaw = (Number(camera.yaw) || 0) * Math.PI / 180;
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) }; const speed = 380 * movementSpeed() * (keys.has("ShiftLeft") || keys.has("ShiftRight") ? 3 : 1) * dt;
  const fb = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0), lr = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
  camera.x += (forward.x * fb + right.x * lr) * speed; camera.y += forward.y * fb * speed; camera.z += (forward.z * fb + right.z * lr) * speed;
  camera.y += ((keys.has("KeyF") ? 1 : 0) - (keys.has("KeyR") ? 1 : 0)) * speed;
}
function applySceneCamera() {
  const runtime = scene3DRuntime; if (!runtime) return;
  const camera = state.sceneCamera;
  runtime.cameraRig.style.transform = `translateZ(${SCENE_PERSPECTIVE}px) rotateX(${-camera.pitch}deg) rotateY(${-camera.yaw}deg) translateZ(${-SCENE_PERSPECTIVE}px)`;
  runtime.world.style.transform = `translate3d(${-camera.x}px,${-camera.y}px,${-camera.z}px)`;
  const keyboardFlying = [...runtime.keys].some(code => ["KeyW","KeyA","KeyS","KeyD","KeyR","KeyF"].includes(code));
  runtime.viewport.querySelector(".hud-mode").textContent = runtime.navigating || keyboardFlying ? "FLYVNING" : "MARKERING";
  runtime.viewport.querySelector(".hud-coordinates").textContent = `X ${Math.round(camera.x)} · Y ${Math.round(camera.y)} · Z ${Math.round(camera.z)}`;
}
function positionSceneWorld() {
  const viewport = document.querySelector("#story-flow"); if (!viewport) return;
  state.scenes.forEach(scene => {
    const node = viewport.querySelector(`[data-scene-node="${scene.id}"]`); if (!node) return;
    node.style.transform = `translate3d(${scene.worldX}px,${scene.worldY}px,${scene.worldZ}px) translate(-50%,-50%)`;
  });
  positionChapterFrames(viewport);
  positionStoryRowMarkers(viewport);
}
function positionStoryRowMarkers(viewport = document.querySelector("#story-flow")) {
  if (!viewport) return;
  const rows = storyRows();
  (state.sceneLineBreaks || []).forEach(sceneId => {
    const marker = viewport.querySelector(`[data-row-break="${sceneId}"]`); if (!marker) return;
    const row = rows.find(items => items.some(unit => unit.scenes[0]?.id === sceneId));
    const scenes = row?.flatMap(unit => unit.scenes) || [];
    if (!scenes.length) { marker.hidden = true; return; }
    marker.hidden = false;
    const bounds = scenes.map(scene => sceneWorldBounds(scene));
    const left = Math.min(...bounds.map(rect => rect.left));
    const top = Math.min(...bounds.map(rect => rect.top)) - 58;
    marker.style.transform = `translate3d(${left}px,${top}px,-12px)`;
  });
}
function positionChapterFrames(viewport = document.querySelector("#story-flow")) {
  if (!viewport) return;
  state.separators.forEach(separator => {
    const frame = viewport.querySelector(`[data-world-separator="${separator.id}"]`); if (!frame) return;
    const members = (separator.sceneIds || []).map(id => {
      const scene = state.scenes.find(item => item.id === id), node = viewport.querySelector(`[data-scene-node="${id}"]`);
      if (!scene || !node || node.querySelector(".scene-card.dragging")) return null;
      return { scene, width:node.offsetWidth || sceneCanvasWidth(scene), height:node.offsetHeight || SCENE_PANEL_HEIGHT };
    }).filter(Boolean);
    if (!members.length) { frame.hidden = true; return; }
    frame.hidden = false;
    const left = Math.min(...members.map(({scene,width}) => Number(scene.worldX) - width / 2)) - 34;
    const right = Math.max(...members.map(({scene,width}) => Number(scene.worldX) + width / 2)) + 34;
    const top = Math.min(...members.map(({scene,height}) => Number(scene.worldY) - height / 2)) - 48;
    const bottom = Math.max(...members.map(({scene,height}) => Number(scene.worldY) + height / 2)) + 34;
    const behind = Math.min(...members.map(({scene}) => Number(scene.worldZ) || 0)) - 24;
    frame.style.width = `${right - left}px`; frame.style.height = `${bottom - top}px`;
    frame.style.transform = `translate3d(${left}px,${top}px,${behind}px)`;
  });
}
function syncSceneCanvasGeometry(runtime = scene3DRuntime) {
  if (!runtime) return;
  runtime.viewport.querySelectorAll(".flow-node").forEach(node => {
    const canvas = node.querySelector(".scene-canvas"); if (!canvas) return;
    node.style.setProperty("--scene-height", `${Math.ceil(canvas.offsetHeight)}px`);
  });
  positionChapterFrames(runtime.viewport);
  positionStoryRowMarkers(runtime.viewport);
}
function refreshSceneGeometryAndLayout(runtime = scene3DRuntime) {
  if (!runtime) return;
  syncSceneCanvasGeometry(runtime);
  const changed = layoutStoryRow();
  positionSceneWorld();
  draw3DLinks();
  if (changed) scheduleSave();
}
function fitStoryToViewport(runtime = scene3DRuntime) {
  if (!runtime || !state.scenes.length) return;
  const bounds = state.scenes.map(scene => sceneWorldBounds(scene));
  const left = Math.min(...bounds.map(rect => rect.left)) - 50;
  const right = Math.max(...bounds.map(rect => rect.right)) + 50;
  const top = Math.min(...bounds.map(rect => rect.top)) - 70;
  const bottom = Math.max(...bounds.map(rect => rect.bottom)) + 50;
  const availableWidth = Math.max(280, runtime.viewport.clientWidth - 64);
  const availableHeight = Math.max(260, runtime.viewport.clientHeight - 100);
  const scale = Math.max(.18, Math.min(1, availableWidth / (right - left), availableHeight / (bottom - top)));
  state.sceneCamera = {
    x:(left + right) / 2,
    y:(top + bottom) / 2,
    z:Math.max(0, Math.min(5400, SCENE_PERSPECTIVE * (1 / scale - 1))),
    yaw:0,
    pitch:0
  };
  applySceneCamera();
  draw3DLinks();
}
function normalizeStoryStructure() {
  let changed = false;
  const validIds = new Set(state.scenes.map(scene => scene.id)), sceneIndex = new Map(state.scenes.map((scene, index) => [scene.id, index])), claimed = new Set();
  const chapters = [];
  state.separators.forEach(chapter => {
    const sceneIds = [];
    (chapter.sceneIds || []).forEach(id => {
      if (validIds.has(id) && !claimed.has(id)) { claimed.add(id); sceneIds.push(id); }
    });
    sceneIds.sort((a,b) => sceneIndex.get(a) - sceneIndex.get(b));
    if (sceneIds.length) chapters.push({ ...chapter, sceneIds });
  });
  if (chapters.length !== state.separators.length || chapters.some((chapter, index) => chapter.sceneIds.join("|") !== (state.separators[index]?.sceneIds || []).join("|"))) changed = true;
  state.separators = chapters;
  const chapterByScene = new Map();
  chapters.forEach(chapter => chapter.sceneIds.forEach(id => chapterByScene.set(id, chapter)));
  const sceneById = new Map(state.scenes.map(scene => [scene.id, scene])), emittedChapters = new Set(), ordered = [];
  state.scenes.forEach(scene => {
    const chapter = chapterByScene.get(scene.id);
    if (!chapter) { ordered.push(scene); return; }
    if (emittedChapters.has(chapter.id)) return;
    emittedChapters.add(chapter.id);
    chapter.sceneIds.forEach(id => { const member = sceneById.get(id); if (member) ordered.push(member); });
  });
  if (ordered.map(scene => scene.id).join("|") !== state.scenes.map(scene => scene.id).join("|")) changed = true;
  state.scenes = ordered;
  const units = storyUnits(), unitStarts = units.map(unit => unit.scenes[0]?.id).filter(Boolean), startByScene = new Map();
  units.forEach(unit => unit.scenes.forEach(scene => startByScene.set(scene.id, unit.scenes[0]?.id)));
  const normalizedBreaks = [...new Set((state.sceneLineBreaks || []).map(id => startByScene.get(id)).filter(Boolean))]
    .filter(id => id !== unitStarts[0])
    .sort((a, b) => unitStarts.indexOf(a) - unitStarts.indexOf(b));
  if (normalizedBreaks.join("|") !== (state.sceneLineBreaks || []).join("|")) changed = true;
  state.sceneLineBreaks = normalizedBreaks;
  return changed;
}
function storyUnits() {
  const chapterByScene = new Map();
  state.separators.forEach(chapter => (chapter.sceneIds || []).forEach(id => chapterByScene.set(id, chapter)));
  const emitted = new Set(), units = [];
  state.scenes.forEach(scene => {
    const chapter = chapterByScene.get(scene.id);
    if (!chapter) { units.push({ kind:"scene", id:scene.id, scenes:[scene] }); return; }
    if (emitted.has(chapter.id)) return;
    emitted.add(chapter.id);
    const memberIds = new Set(chapter.sceneIds || []);
    units.push({ kind:"chapter", id:chapter.id, chapter, scenes:state.scenes.filter(item => memberIds.has(item.id)) });
  });
  return units;
}
function sceneLayoutMetrics(scene) {
  const node = scene3DRuntime?.viewport.querySelector(`[data-scene-node="${scene.id}"]`);
  return { width:node?.offsetWidth || sceneCanvasWidth(scene), height:node?.offsetHeight || SCENE_PANEL_HEIGHT };
}
function storyUnitWidth(unit) {
  const content = unit.scenes.reduce((sum, scene) => sum + sceneLayoutMetrics(scene).width, 0) + Math.max(0, unit.scenes.length - 1) * CHAPTER_MEMBER_GAP;
  return content + (unit.kind === "chapter" ? 68 : 0);
}
function storyRows() {
  const breaks = new Set(state.sceneLineBreaks || []), rows = [[]];
  storyUnits().forEach(unit => {
    const startId = unit.scenes[0]?.id;
    if (breaks.has(startId) && rows[rows.length - 1].length) rows.push([]);
    rows[rows.length - 1].push(unit);
  });
  return rows.filter(row => row.length);
}
function storyUnitsWidth(units) {
  return units.reduce((sum, unit) => sum + storyUnitWidth(unit), 0) + Math.max(0, units.length - 1) * STORY_UNIT_GAP;
}
function storyRowWidth() {
  return Math.max(0, ...storyRows().map(storyUnitsWidth));
}
function storyUnitCenter(unit) {
  const bounds = unit.scenes.map(scene => sceneWorldBounds(scene));
  return bounds.length ? (Math.min(...bounds.map(rect => rect.left)) + Math.max(...bounds.map(rect => rect.right))) / 2 : 0;
}
function layoutStoryRow() {
  let changed = normalizeStoryStructure();
  let rowTop = SCENE_FLOAT_Y - SCENE_PANEL_HEIGHT / 2;
  storyRows().forEach(row => {
    let cursor = -storyUnitsWidth(row) / 2;
    const rowHeight = Math.max(SCENE_PANEL_HEIGHT, ...row.flatMap(unit => unit.scenes).map(scene => sceneLayoutMetrics(scene).height));
    row.forEach(unit => {
      const unitWidth = storyUnitWidth(unit);
      let inner = cursor + (unit.kind === "chapter" ? 34 : 0);
      unit.scenes.forEach(scene => {
        const { width, height } = sceneLayoutMetrics(scene), x = inner + width / 2, y = rowTop + height / 2;
        if (Math.abs((Number(scene.worldX) || 0) - x) > .5 || Math.abs((Number(scene.worldY) || 0) - y) > .5 || Number(scene.worldZ) !== 0) changed = true;
        scene.worldX = x; scene.worldY = y; scene.worldZ = 0;
        inner += width + CHAPTER_MEMBER_GAP;
      });
      cursor += unitWidth + STORY_UNIT_GAP;
    });
    rowTop += rowHeight + STORY_ROW_GAP;
  });
  return changed;
}
function chapterDropBounds(chapter, excludedSceneId = "", fallback = null) {
  const positions = (chapter.sceneIds || []).filter(id => id !== excludedSceneId).map(id => state.scenes.find(scene => scene.id === id)).filter(Boolean).map(scene => ({ scene, x:Number(scene.worldX) || 0, y:Number(scene.worldY) || 0 }));
  return positions.length ? chapterWorldBounds(positions) : fallback;
}
function chapterAtDropPoint(sceneId, x, y, fallbackChapterId = "", fallbackBounds = null) {
  const matches = state.separators.map(chapter => ({ chapter, bounds:chapterDropBounds(chapter, sceneId, chapter.id === fallbackChapterId ? fallbackBounds : null) })).filter(({ bounds }) => bounds && x >= bounds.left - 54 && x <= bounds.right + 54 && y >= bounds.top - 72 && y <= bounds.bottom + 72);
  matches.sort((a,b) => Math.abs(storyUnitCenter({ scenes:(a.chapter.sceneIds || []).map(id => state.scenes.find(scene => scene.id === id)).filter(Boolean) }) - x) - Math.abs(storyUnitCenter({ scenes:(b.chapter.sceneIds || []).map(id => state.scenes.find(scene => scene.id === id)).filter(Boolean) }) - x));
  return matches[0]?.chapter || null;
}
function showChapterDropTarget(chapter) {
  scene3DRuntime?.viewport.querySelectorAll(".world-chapter").forEach(frame => frame.classList.toggle("drop-target", frame.dataset.worldSeparator === chapter?.id));
}
function placeSceneInStory(scene, targetChapter, dropX, dropY) {
  state.separators.forEach(chapter => { chapter.sceneIds = (chapter.sceneIds || []).filter(id => id !== scene.id); });
  state.separators = state.separators.filter(chapter => chapter.sceneIds.length || chapter.id === targetChapter?.id);
  state.scenes = state.scenes.filter(item => item.id !== scene.id);
  if (targetChapter) {
    const liveChapter = state.separators.find(chapter => chapter.id === targetChapter.id);
    if (liveChapter) {
      const members = (liveChapter.sceneIds || []).map(id => state.scenes.find(item => item.id === id)).filter(Boolean).sort((a,b) => (Number(a.worldX) || 0) - (Number(b.worldX) || 0));
      const memberIndex = members.findIndex(member => dropX < (Number(member.worldX) || 0));
      const insertAt = memberIndex < 0 ? members.length : memberIndex;
      const reference = members[insertAt];
      const stateIndex = reference ? state.scenes.findIndex(item => item.id === reference.id) : members.length ? state.scenes.findIndex(item => item.id === members[members.length - 1].id) + 1 : state.scenes.length;
      state.scenes.splice(Math.max(0, stateIndex), 0, scene);
      liveChapter.sceneIds = members.map(member => member.id);
      liveChapter.sceneIds.splice(insertAt, 0, scene.id);
    }
  } else {
    const units = storyUnits(), groupedRows = [];
    units.forEach(unit => {
      const centerY = unit.scenes.reduce((sum, item) => sum + (Number(item.worldY) || 0), 0) / Math.max(1, unit.scenes.length);
      let row = groupedRows.find(item => Math.abs(item.centerY - centerY) < 4);
      if (!row) { row = { centerY, units:[] }; groupedRows.push(row); }
      row.units.push(unit);
    });
    const targetRow = groupedRows.sort((a, b) => Math.abs(a.centerY - dropY) - Math.abs(b.centerY - dropY))[0];
    const rowUnits = (targetRow?.units || units).sort((a, b) => storyUnitCenter(a) - storyUnitCenter(b));
    const reference = rowUnits.find(unit => dropX < storyUnitCenter(unit));
    const oldRowStart = rowUnits[0]?.scenes[0]?.id || "";
    const insertingAtRowStart = reference === rowUnits[0] && (state.sceneLineBreaks || []).includes(oldRowStart);
    const lastRowScene = rowUnits[rowUnits.length - 1]?.scenes.at(-1);
    const stateIndex = reference ? state.scenes.findIndex(item => item.id === reference.scenes[0]?.id) : lastRowScene ? state.scenes.findIndex(item => item.id === lastRowScene.id) + 1 : state.scenes.length;
    state.scenes.splice(Math.max(0, stateIndex), 0, scene);
    if (insertingAtRowStart) state.sceneLineBreaks = (state.sceneLineBreaks || []).map(id => id === oldRowStart ? scene.id : id);
  }
  normalizeStoryStructure();
  layoutStoryRow();
}
function sceneWorldBounds(scene, x = Number(scene.worldX) || 0, y = Number(scene.worldY) || 0) {
  const node = scene3DRuntime?.viewport.querySelector(`[data-scene-node="${scene.id}"]`);
  const width = node?.offsetWidth || sceneCanvasWidth(scene), height = node?.offsetHeight || SCENE_PANEL_HEIGHT;
  return { left:x - width / 2, right:x + width / 2, top:y - height / 2, bottom:y + height / 2 };
}
function chapterWorldBounds(memberPositions) {
  const bounds = memberPositions.map(({ scene, x, y }) => sceneWorldBounds(scene, x, y));
  return {
    left:Math.min(...bounds.map(rect => rect.left)) - 34,
    right:Math.max(...bounds.map(rect => rect.right)) + 34,
    top:Math.min(...bounds.map(rect => rect.top)) - 48,
    bottom:Math.max(...bounds.map(rect => rect.bottom)) + 34
  };
}
function bindScenePanelDragging(runtime, on) {
  runtime.viewport.querySelectorAll(".scene-card").forEach(card => {
    on(card, "dragstart", event => event.preventDefault());
    on(card, "pointerdown", event => {
      if (event.button !== 0 || event.shiftKey || runtime.navigating || event.target.closest("button")) return;
      const node = card.closest(".flow-node"), scene = state.scenes.find(item => item.id === card.dataset.scene); if (!scene) return;
      focusSceneMood(scene.id);
      const currentChapter = state.separators.find(chapter => (chapter.sceneIds || []).includes(scene.id));
      const currentPositions = (currentChapter?.sceneIds || []).map(id => state.scenes.find(item => item.id === id)).filter(Boolean).map(item => ({ scene:item, x:Number(item.worldX) || 0, y:Number(item.worldY) || 0 }));
      const originalChapterBounds = currentPositions.length ? chapterWorldBounds(currentPositions) : null;
      const start = { px:event.clientX, py:event.clientY, x:Number(scene.worldX) || 0, y:Number(scene.worldY) || 0 }; let moved = false, dropTarget = currentChapter || null;
      card.setPointerCapture(event.pointerId);
      const move = pointer => {
        const dx = pointer.clientX - start.px, dy = pointer.clientY - start.py; if (Math.hypot(dx, dy) > 4) moved = true; if (!moved) return;
        pointer.preventDefault(); card.classList.add("dragging");
        const scale = Math.max(.25, 1200 / (1200 + Math.max(0, state.sceneCamera.z)));
        const yaw = (Number(state.sceneCamera.yaw) || 0) * Math.PI / 180, facing = Math.cos(yaw);
        const planarScale = Math.sign(facing || 1) * Math.max(.2, Math.abs(facing));
        scene.worldX = start.x + dx / scale / planarScale; scene.worldZ = 0; scene.worldY = start.y + dy / scale;
        node.style.transform = `translate3d(${scene.worldX}px,${scene.worldY}px,${scene.worldZ}px) translate(-50%,-50%)`;
        positionChapterFrames(runtime.viewport);
        dropTarget = chapterAtDropPoint(scene.id, scene.worldX, scene.worldY, currentChapter?.id || "", originalChapterBounds);
        showChapterDropTarget(dropTarget);
      };
      const finish = () => {
        card.removeEventListener("pointermove", move); card.removeEventListener("pointerup", finish); card.removeEventListener("pointercancel", finish); card.classList.remove("dragging");
        showChapterDropTarget(null);
        if (!moved) return;
        card._justDragged = true;
        const dropX = Number(scene.worldX) || 0, dropY = Number(scene.worldY) || 0;
        placeSceneInStory(scene, dropTarget, dropX, dropY);
        positionSceneWorld(); update3DSceneNumbers(); saveState();
        toast(dropTarget ? `Scenen er placeret i ${dropTarget.title || dropTarget.type || "kapitlet"}` : "Scenen er placeret i fortællingsrækken");
      };
      card.addEventListener("pointermove", move); card.addEventListener("pointerup", finish); card.addEventListener("pointercancel", finish);
    });
  });
}
function bindChapterDragging(runtime, on) {
  runtime.viewport.querySelectorAll("[data-chapter-drag]").forEach(handle => on(handle, "pointerdown", event => {
    if (event.button !== 0 || runtime.navigating) return;
    const chapter = state.separators.find(item => item.id === handle.dataset.chapterDrag); if (!chapter) return;
    const members = (chapter.sceneIds || []).map(id => state.scenes.find(scene => scene.id === id)).filter(Boolean); if (!members.length) return;
    event.preventDefault(); event.stopPropagation(); handle.setPointerCapture(event.pointerId);
    const originals = members.map(scene => ({ scene, x:Number(scene.worldX) || 0, y:Number(scene.worldY) || 0 }));
    const start = { x:event.clientX }; let moved = false, rawDX = 0;
    handle.classList.add("dragging");
    const move = pointer => {
      rawDX = pointer.clientX - start.x; if (Math.abs(rawDX) > 3) moved = true; if (!moved) return;
      pointer.preventDefault();
      const scale = Math.max(.25, 1200 / (1200 + Math.max(0, state.sceneCamera.z)));
      const yaw = (Number(state.sceneCamera.yaw) || 0) * Math.PI / 180, facing = Math.cos(yaw);
      const planarScale = Math.sign(facing || 1) * Math.max(.2, Math.abs(facing));
      originals.forEach(({scene,x,y}) => { scene.worldX = x + rawDX / scale / planarScale; scene.worldY = y; scene.worldZ = 0; });
      positionSceneWorld();
    };
    const finish = () => {
      handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", finish); handle.removeEventListener("pointercancel", finish); handle.classList.remove("dragging");
      if (!moved) return;
      const memberIds = new Set(chapter.sceneIds || []), block = state.scenes.filter(scene => memberIds.has(scene.id));
      const targetCenter = storyUnitCenter({ scenes:block });
      const otherUnits = storyUnits().filter(unit => unit.id !== chapter.id);
      const reference = otherUnits.find(unit => targetCenter < storyUnitCenter(unit));
      const remaining = state.scenes.filter(scene => !memberIds.has(scene.id));
      const insertAt = reference ? remaining.findIndex(scene => scene.id === reference.scenes[0]?.id) : remaining.length;
      remaining.splice(Math.max(0, insertAt), 0, ...block);
      state.scenes = remaining;
      normalizeStoryStructure(); layoutStoryRow();
      positionSceneWorld(); update3DSceneNumbers(); saveState(); toast("Kapitlet er flyttet i fortællingsrækken");
    };
    handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", finish); handle.addEventListener("pointercancel", finish);
  }));
}
function update3DSceneNumbers() {
  state.scenes.forEach((scene, index) => { const label = document.querySelector(`[data-scene="${scene.id}"] .scene-number`); if (label) label.textContent = `Scene ${String(index + 1).padStart(2,"0")} · Akt ${scene.act || 1}`; });
}
function bindSceneLinkHandles(runtime, on) {
  runtime.viewport.querySelectorAll("[data-link-handle]").forEach(handle => on(handle, "pointerdown", event => {
    if (event.button !== 0 || runtime.navigating) return; event.preventDefault(); event.stopPropagation();
    const from = handle.closest(".flow-node").dataset.sceneNode; handle.setPointerCapture(event.pointerId);
    const viewportRect = runtime.viewport.getBoundingClientRect(); runtime.linkDraft = { from, fromSide: handle.dataset.linkHandle, x: event.clientX - viewportRect.left, y: event.clientY - viewportRect.top };
    const move = pointer => { runtime.linkDraft.x = pointer.clientX - viewportRect.left; runtime.linkDraft.y = pointer.clientY - viewportRect.top; };
    const finish = pointer => {
      handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", finish); handle.removeEventListener("pointercancel", finish);
      const target = document.elementFromPoint(pointer.clientX, pointer.clientY)?.closest(".flow-node");
      if (target && target.dataset.sceneNode !== from) {
        const rect = target.getBoundingClientRect(), dx = pointer.clientX - (rect.left + rect.width / 2), dy = pointer.clientY - (rect.top + rect.height / 2);
        const toSide = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "top" : "bottom");
        const duplicate = state.sceneLinks.some(link => link.from === from && link.to === target.dataset.sceneNode && link.fromSide === runtime.linkDraft.fromSide && link.toSide === toSide);
        if (!duplicate) state.sceneLinks.push({ id:uid("link"), from, to:target.dataset.sceneNode, fromSide:runtime.linkDraft.fromSide, toSide });
        const count = document.querySelector("#scene-link-count"); if (count) count.textContent = state.sceneLinks.length;
        saveState(); toast(duplicate ? "Forbindelsen findes allerede" : "Scenerne er forbundet");
      }
      runtime.linkDraft = null; draw3DLinks();
    };
    handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", finish); handle.addEventListener("pointercancel", finish);
  }));
}
function linkAnchor(node, side, viewportRect) {
  const rect = node.getBoundingClientRect();
  const points = { left:[rect.left,rect.top+rect.height/2], right:[rect.right,rect.top+rect.height/2], top:[rect.left+rect.width/2,rect.top], bottom:[rect.left+rect.width/2,rect.bottom] };
  const point = points[side] || points.right; return { x:point[0]-viewportRect.left, y:point[1]-viewportRect.top };
}
function draw3DLinks(draft = null) {
  const runtime = scene3DRuntime; const svg = runtime?.viewport.querySelector(".world-links"), group = svg?.querySelector("g"); if (!runtime || !svg || !group) return;
  const viewportRect = runtime.viewport.getBoundingClientRect(); svg.setAttribute("viewBox", `0 0 ${runtime.viewport.clientWidth} ${runtime.viewport.clientHeight}`); group.innerHTML = "";
  const draw = (a,b,isDraft=false,linkId="") => {
    const dx = b.x-a.x, bend = Math.max(55, Math.abs(dx)*.45); const d = `M ${a.x} ${a.y} C ${a.x+(dx>=0?bend:-bend)} ${a.y}, ${b.x-(dx>=0?bend:-bend)} ${b.y}, ${b.x} ${b.y}`;
    const path = document.createElementNS("http://www.w3.org/2000/svg","path"); path.setAttribute("d",d); path.setAttribute("marker-end","url(#world-arrowhead)"); if (isDraft) path.classList.add("draft-link"); group.appendChild(path);
    if (linkId) { const hit = document.createElementNS("http://www.w3.org/2000/svg","path"); hit.setAttribute("d",d); hit.classList.add("scene-link-hit"); hit.dataset.sceneLink = linkId; group.appendChild(hit); }
  };
  state.sceneLinks.forEach(link => { const from=runtime.viewport.querySelector(`[data-scene-node="${link.from}"]`), to=runtime.viewport.querySelector(`[data-scene-node="${link.to}"]`); if (from&&to) draw(linkAnchor(from,link.fromSide,viewportRect),linkAnchor(to,link.toSide,viewportRect),false,link.id); });
  if (draft) { const from=runtime.viewport.querySelector(`[data-scene-node="${draft.from}"]`); if (from) draw(linkAnchor(from,draft.fromSide,viewportRect),{x:draft.x,y:draft.y},true); }
}

function fullStoryTimestamp() {
  if (!state.fullStoryGeneratedAt) return "Ikke genereret endnu";
  try { return `Senest genereret ${new Intl.DateTimeFormat("da-DK", { dateStyle:"medium", timeStyle:"short" }).format(new Date(state.fullStoryGeneratedAt))}`; }
  catch { return "Samlet historie gemt"; }
}
function openFullStoryDialog() {
  const dialog = document.querySelector("#full-story-dialog");
  document.querySelector("#full-story-text").value = state.fullStory || "";
  document.querySelector("#full-story-status").textContent = fullStoryTimestamp();
  document.querySelector("#generate-full-story").textContent = state.fullStory ? "✦ Generér historien på ny" : "✦ Generér hele historien";
  const comicPages = Array.isArray(state.comicPages) ? state.comicPages : [], missingComicPages = comicPages.filter(page => !page.url).length;
  document.querySelector("#open-comic").textContent = missingComicPages ? `▦ Færdiggør ${missingComicPages} manglende ${missingComicPages === 1 ? "side" : "sider"}` : "▦ Generér tegneserie i baggrunden";
  dialog.showModal();
}
async function generateFullStory() {
  if (!state.scenes.length) return toast("Opret mindst én scene først");
  if (state.fullStory?.trim() && !confirm("En ny generering erstatter den nuværende samlede tekst. Fortsæt?")) return;
  const configured = await checkAiStatus();
  if (!configured) { document.querySelector("#full-story-dialog").close(); openApiKeyPanel(); return toast("Forbind AI først"); }
  const button = document.querySelector("#generate-full-story"), status = document.querySelector("#full-story-status"), original = button.textContent;
  button.disabled = true; button.textContent = "Skriver hele historien…"; status.textContent = "AI’en forbinder scener, kapitler og karakterbuer…";
  try {
    const result = await apiRequest("/api/full-story", { project:projectSnapshot() });
    if (!result.complete) throw new Error("Serveren returnerede ikke en bekræftet, færdig historie. Din tidligere tekst er bevaret.");
    state.fullStory = result.text || ""; state.fullStoryGeneratedAt = new Date().toISOString(); saveState();
    document.querySelector("#full-story-text").value = state.fullStory; status.textContent = `${fullStoryTimestamp()} · ${state.fullStory.trim().split(/\s+/).length.toLocaleString("da-DK")} ord`; button.textContent = "✦ Generér historien på ny";
    toast(result.attempts > 1 ? `Den samlede historie blev færdiggjort i ${result.attempts} dele og gemt` : "Den samlede historie er skrevet og gemt");
  } catch (error) { status.textContent = "Historien kunne ikke genereres"; toast(error.message); button.textContent = original; }
  finally { button.disabled = false; }
}
function fullStoryBodyHtml(text) {
  return String(text || "").split(/\n\s*\n/).map(block => {
    const trimmed = block.trim(); if (!trimmed) return "";
    const content = escapeHTML(trimmed).replace(/\n/g, "<br>");
    return /^(kapitel|akt|del)\b/i.test(trimmed) && trimmed.length < 100 ? `<h2>${content}</h2>` : `<p>${content}</p>`;
  }).join("\n");
}
function fullStoryDocumentHtml() {
  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><title>${escapeHTML(state.title || "Min historie")}</title><style>@page{size:A4;margin:24mm 22mm}body{max-width:760px;margin:0 auto;color:#272823;font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.65}h1{margin:0 0 2em;text-align:center;font-size:26pt}h2{margin:2.2em 0 1em;text-align:center;font-size:18pt;page-break-after:avoid}p{margin:0 0 1em;orphans:3;widows:3}@media print{body{max-width:none}}</style></head><body><h1>${escapeHTML(state.title || "Min historie")}</h1>${fullStoryBodyHtml(state.fullStory)}</body></html>`;
}
async function copyFullStory() {
  const text = document.querySelector("#full-story-text").value;
  if (!text.trim()) return toast("Generér historien først");
  try { await navigator.clipboard.writeText(text); }
  catch { const area = document.querySelector("#full-story-text"); area.select(); document.execCommand("copy"); }
  toast("Den samlede historie er kopieret");
}
function exportFullStoryPdf() {
  if (!state.fullStory?.trim()) return toast("Generér historien først");
  const printWindow = window.open("", "_blank");
  if (!printWindow) return toast("Browseren blokerede PDF-vinduet");
  printWindow.document.write(fullStoryDocumentHtml()); printWindow.document.close(); printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}
function exportFullStoryDoc() {
  if (!state.fullStory?.trim()) return toast("Generér historien først");
  const wordHtml = `\ufeff<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page{size:595.3pt 841.9pt;margin:68pt 62pt}body{font-family:Georgia,serif;font-size:12pt;line-height:1.55}h1{text-align:center;font-size:24pt;margin-bottom:36pt}h2{text-align:center;font-size:17pt;page-break-after:avoid}p{margin:0 0 11pt}</style></head><body><h1>${escapeHTML(state.title || "Min historie")}</h1>${fullStoryBodyHtml(state.fullStory)}</body></html>`;
  const blob = new Blob([wordHtml], { type:"application/msword;charset=utf-8" }), url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = `${(state.title || "min-historie").replace(/[^a-z0-9æøå]+/gi,"-").replace(/^-|-$/g,"").toLowerCase() || "min-historie"}.doc`; link.click(); URL.revokeObjectURL(url); toast("Word-dokumentet er eksporteret");
}

function comicTimestamp() {
  if (!state.comicGeneratedAt) return state.comicPages?.length ? `${state.comicPages.filter(page => page.url).length}/${state.comicPages.length} sider skabt` : "Ikke genereret endnu";
  try { return `Senest genereret ${new Intl.DateTimeFormat("da-DK", { dateStyle:"medium", timeStyle:"short" }).format(new Date(state.comicGeneratedAt))}`; }
  catch { return "Tegneserien er gemt"; }
}
function renderComicPages(generatingIndex = -1) {
  const container = document.querySelector("#comic-pages"), status = document.querySelector("#comic-status"); if (!container) return;
  const pages = Array.isArray(state.comicPages) ? state.comicPages : [];
  if (!pages.length) container.innerHTML = `<div class="comic-empty"><div><strong>Historien venter på sine billeder</strong><p>AI’en opdeler den samlede fortælling i sider og paneler og skaber derefter én sammenhængende tegneserie.</p></div></div>`;
  else container.innerHTML = pages.map((page, index) => `<figure class="comic-page ${generatingIndex === index ? "generating" : ""}">${page.url ? `<img src="${escapeHTML(page.url)}" alt="Tegneserieside ${index + 1}: ${escapeHTML(page.title || "")}">` : `<div class="comic-page-placeholder"><div><span>${generatingIndex === index ? "◌" : "▦"}</span><strong>${generatingIndex === index ? "AI tegner siden…" : escapeHTML(page.title || `Side ${index + 1}`)}</strong><p>${escapeHTML((page.panels || []).map(panel => panel.caption || panel.action).filter(Boolean).slice(0,3).join(" · "))}</p></div></div>`}<figcaption><strong>Side ${index + 1}${page.title ? ` · ${escapeHTML(page.title)}` : ""}</strong><button type="button" data-regenerate-comic-page="${index}">${page.url ? "Generér igen" : "Generér side"}</button></figcaption><label class="comic-page-direction"><span>Visuel rettelse til AI</span><textarea data-comic-direction="${index}" placeholder="Fx: CAS har robotkrop, men bærer Elias’ genkendelige, blodige menneskeansigt som en maske.">${escapeHTML(page.visualDirection || page.mustShow || "")}</textarea></label></figure>`).join("");
  if (status) status.textContent = generatingIndex >= 0 ? `Genererer side ${generatingIndex + 1} af ${pages.length}…` : comicTimestamp();
}
function openComicDialog() {
  document.querySelector("#full-story-dialog")?.close();
  renderComicPages();
  const pages = Array.isArray(state.comicPages) ? state.comicPages : [], missing = pages.filter(page => !page.url).length;
  document.querySelector("#generate-comic").textContent = missing ? `✦ Færdiggør ${missing} manglende ${missing === 1 ? "side" : "sider"}` : pages.length ? "✦ Generér tegneserien på ny" : "✦ Generér tegneserie";
  document.querySelector("#comic-dialog").showModal();
}
function comicCompletedCount(pages) { return (pages || []).filter(page => page?.url).length; }
function comicMissingIndexes(pages) { return (pages || []).map((page, index) => page?.url ? -1 : index).filter(index => index >= 0); }
function comicCancelledError() { const error = new Error("Genereringen blev annulleret"); error.name = "ComicGenerationCancelledError"; return error; }
function waitForComicDelay(ms, signal) {
  if (signal?.aborted) return Promise.reject(comicCancelledError());
  return new Promise((resolve, reject) => {
    const timer = setTimeout(done, ms);
    function done() { signal?.removeEventListener("abort", cancel); resolve(); }
    function cancel() { clearTimeout(timer); signal?.removeEventListener("abort", cancel); reject(comicCancelledError()); }
    signal?.addEventListener("abort", cancel, { once:true });
  });
}
function retryableComicError(error) {
  const message = String(error?.message || "");
  if (/budget|forbrugsgrænse|billing|API-nøglen|modeladgang|indholdsfilter|policy/i.test(message)) return false;
  return /hastighedsgrænse|midlertid|tidsgrænse|svarer ikke|kunne ikke nå|network|fetch|timeout|timed out|overloaded|server error|status 5\d\d/i.test(message);
}
async function requestComicPageWithRetry({ page, index, project, onWait, signal }) {
  const waits = [15_000, 30_000, 60_000, 90_000, 90_000, 120_000];
  let lastError;
  for (let attempt = 0; attempt <= waits.length; attempt++) {
    if (signal?.aborted) throw comicCancelledError();
    try {
      return await apiRequest("/api/comic-page", { page, pageIndex:index, project }, { timeoutMs:240_000, signal });
    } catch (error) {
      lastError = error;
      if (!retryableComicError(error) || attempt === waits.length) throw error;
      const waitMs = waits[attempt];
      onWait?.({ attempt:attempt + 1, max:waits.length, waitMs, error });
      await waitForComicDelay(waitMs, signal);
    }
  }
  throw lastError;
}
async function createComicPageImage(index, announce = true) {
  const page = state.comicPages?.[index]; if (!page) return;
  const configured = await checkAiStatus(); if (!configured) throw new Error("Forbind AI først");
  renderComicPages(index);
  const result = await requestComicPageWithRetry({ page, index, project:projectSnapshot(), onWait:({ attempt, max, waitMs }) => {
    document.querySelector("#comic-status").textContent = `Side ${index + 1} venter ${Math.round(waitMs / 1000)} sek. på billedkapacitet · forsøg ${attempt}/${max}`;
  } });
  state.comicPages[index] = { ...page, url:result.url, generatedAt:new Date().toISOString() };
  saveState(); renderComicPages();
  if (announce) toast(`Tegneserieside ${index + 1} er skabt`);
}
function updateComicJobUI() {
  const job = comicBackgroundJob, panel = document.querySelector("#comic-job"); if (!panel) return;
  panel.hidden = !job; if (!job) return;
  panel.className = `comic-job ${job.phase || "running"}`;
  const titles = { planning:"Planlægger tegneserien", running:"Tegneserien genereres", pdf:"Samler PDF-filen", saving:"Tegneserien er færdig", ready:"PDF-filen er klar", done:"Tegneserien er gemt", cancelled:"Genereringen er annulleret", error:"Tegneserien stoppede" };
  document.querySelector("#comic-job-title").textContent = titles[job.phase] || "Tegneserien genereres";
  document.querySelector("#comic-job-status").textContent = job.message || "Arbejder i baggrunden…";
  document.querySelector("#comic-job-icon").textContent = job.phase === "error" ? "!" : ["done","ready","cancelled"].includes(job.phase) ? "✓" : "◌";
  const progress = job.total ? Math.round((job.completed || 0) / job.total * 100) : job.phase === "planning" ? 4 : 0;
  document.querySelector("#comic-job-progress").style.width = `${["done","ready","saving"].includes(job.phase) ? 100 : progress}%`;
  document.querySelector("#comic-job-open").hidden = !(job.pages?.length);
  document.querySelector("#comic-job-cancel").hidden = !["planning","running","pdf"].includes(job.phase);
  document.querySelector("#comic-job-save").hidden = job.phase !== "ready";
}
function cancelComicGeneration() {
  const job = comicBackgroundJob;
  if (!job || !["planning","running","pdf"].includes(job.phase)) return toast("Der kører ingen tegneseriegenerering");
  job.cancelled = true; job.abortController?.abort(); job.completed = comicCompletedCount(job.pages);
  job.phase = "cancelled"; job.message = `${job.completed} af ${job.total || "?"} sider er bevaret. Du kan færdiggøre resten senere.`;
  persistComicJob(job); updateComicJobUI(); renderComicPages(); toast("Tegneseriegenereringen er annulleret");
}
function persistComicJob(job, complete = false) {
  const generatedAt = complete ? new Date().toISOString() : "";
  if (activeProjectId === job.projectId) {
    state.comicPages = clone(job.pages || []); state.comicGeneratedAt = generatedAt; saveState(); renderComicPages();
  } else {
    let saved; try { saved = JSON.parse(localStorage.getItem(projectStateKey(job.projectId)) || "{}"); } catch { saved = {}; }
    saved.comicPages = clone(job.pages || []); saved.comicGeneratedAt = generatedAt;
    localStorage.setItem(projectStateKey(job.projectId), JSON.stringify(saved));
  }
}
async function createComicPageForJob(job, index) {
  const page = job.pages[index]; job.phase = "running"; job.message = `Tegner side ${index + 1} af ${job.total}…`; updateComicJobUI();
  const result = await requestComicPageWithRetry({ page, index, project:job.project, signal:job.abortController?.signal, onWait:({ attempt, max, waitMs }) => {
    job.message = `Side ${index + 1} venter ${Math.round(waitMs / 1000)} sek. · nyt forsøg ${attempt}/${max}`; updateComicJobUI();
  } });
  job.pages[index] = { ...page, url:result.url, generatedAt:new Date().toISOString() };
  job.completed = comicCompletedCount(job.pages); job.message = `${job.completed} af ${job.total} sider er færdige`; persistComicJob(job); updateComicJobUI();
}
function concatPdfBytes(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0), result = new Uint8Array(size); let offset = 0;
  parts.forEach(part => { result.set(part, offset); offset += part.length; }); return result;
}
function pdfText(value) { return new TextEncoder().encode(value); }
async function comicPageJpeg(url) {
  const response = await fetch(new URL(url, location.href)); if (!response.ok) throw new Error("En tegneserieside kunne ikke læses til PDF");
  const bitmap = await createImageBitmap(await response.blob()), maxWidth = 1800, scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d", { alpha:false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PDF-siden kunne ikke samles")), "image/jpeg", .9));
  return { bytes:new Uint8Array(await blob.arrayBuffer()), width:canvas.width, height:canvas.height };
}
async function buildComicPdf(pages, signal) {
  const images = [];
  for (const page of pages) { if (signal?.aborted) throw comicCancelledError(); images.push(await comicPageJpeg(page.url)); }
  const objects = [null], pageWidth = 595.28, pageHeight = 841.89;
  objects[1] = pdfText("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds = images.map((_, index) => 3 + index * 3);
  objects[2] = pdfText(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${images.length} >>`);
  images.forEach((image, index) => {
    const pageId = 3 + index * 3, contentId = pageId + 1, imageId = pageId + 2, name = `Im${index + 1}`;
    const scale = Math.min(pageWidth / image.width, pageHeight / image.height), width = image.width * scale, height = image.height * scale, x = (pageWidth - width) / 2, y = (pageHeight - height) / 2;
    const stream = `q\n${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/${name} Do\nQ\n`;
    objects[pageId] = pdfText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /${name} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects[contentId] = pdfText(`<< /Length ${pdfText(stream).length} >>\nstream\n${stream}endstream`);
    objects[imageId] = concatPdfBytes([pdfText(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`), image.bytes, pdfText("\nendstream")]);
  });
  const chunks = [concatPdfBytes([pdfText("%PDF-1.4\n%"), new Uint8Array([226,227,207,211]), pdfText("\n")])], offsets = [0]; let length = chunks[0].length;
  for (let id = 1; id < objects.length; id++) { offsets[id] = length; const chunk = concatPdfBytes([pdfText(`${id} 0 obj\n`), objects[id], pdfText("\nendobj\n")]); chunks.push(chunk); length += chunk.length; }
  const xrefOffset = length, xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10,"0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(pdfText(xref)); return new Blob(chunks, { type:"application/pdf" });
}
function comicPdfName(title = state.title) {
  return `${String(title || "min-tegneserie").replace(/[^a-z0-9æøå]+/gi,"-").replace(/^-|-$/g,"").toLowerCase() || "min-tegneserie"}.pdf`;
}
async function blobBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer()); let binary = "";
  for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768));
  return btoa(binary);
}
async function requestComicPdfSave(record, userInitiated = false) {
  try {
    const result = await apiRequest("/api/save-comic-pdf", { projectId:record.projectId || activeProjectId, suggestedName:record.name, pdfBase64:await blobBase64(record.blob) });
    return result;
  } catch (serverError) {
    if (typeof window.showSaveFilePicker === "function") {
      try {
        const handle = await window.showSaveFilePicker({ suggestedName:record.name, types:[{ description:"PDF-tegneserie", accept:{ "application/pdf":[".pdf"] } }] });
        const writable = await handle.createWritable(); await writable.write(record.blob); await writable.close(); return { saved:true, path:handle.name };
      } catch (error) { if (error?.name === "AbortError") return { cancelled:true }; if (!userInitiated) return { ready:true }; }
    }
    if (!userInitiated) return { ready:true };
    const url = URL.createObjectURL(record.blob), link = document.createElement("a"); link.href = url; link.download = record.name; link.click(); URL.revokeObjectURL(url); return { saved:true, path:record.name };
  }
}
async function saveReadyComicPdf() {
  if (!comicReadyPdf || !comicBackgroundJob) return;
  comicBackgroundJob.phase = "saving"; comicBackgroundJob.message = "Vælg filnavn og placering…"; updateComicJobUI();
  const result = await requestComicPdfSave(comicReadyPdf, true);
  comicBackgroundJob.phase = result.cancelled || result.ready ? "ready" : "done";
  comicBackgroundJob.message = result.cancelled || result.ready ? "PDF-filen er klar til at blive gemt" : `Gemt som ${String(result.path || comicReadyPdf.name).split(/[\\/]/).at(-1)}`;
  updateComicJobUI();
}
async function saveStoryProjectToDisk() {
  saveState();
  const buttons = [document.querySelector("#save-story-button"), document.querySelector("#fullscreen-save")].filter(Boolean), originals = buttons.map(button => button.textContent);
  buttons.forEach(button => { button.disabled = true; button.textContent = "Gemmer…"; });
  const status = document.querySelector("#save-status"); if (status) status.textContent = "Samler projektmappe…";
  try {
    let comicPdfBase64 = "";
    const comicPages = Array.isArray(state.comicPages) ? state.comicPages : [];
    if (comicPages.length && comicPages.every(page => page.url)) {
      try { comicPdfBase64 = await blobBase64(await buildComicPdf(comicPages)); }
      catch (error) { console.warn("Tegneserie-PDF kunne ikke samles; projektmappen gemmes uden den.", error); }
    }
    const project = { ...clone(state), projectId:activeProjectId, title:state.title?.trim() || "Ny historie" };
    const meta = projectCatalog.find(item => item.id === activeProjectId);
    const result = await apiRequest("/api/save-story-project", { projectId:activeProjectId, project, comicPdfBase64, archived:Boolean(meta?.archived) });
    state.diskFolder = result.folderName; state.savedToDiskAt = result.savedAt || new Date().toISOString(); saveState();
    if (status) status.textContent = IS_CLOUD ? "Synkroniseret med skyen" : `Gemt i Stories\\${result.folderName}`;
    const imageTotal = Object.values(result.imageCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
    toast(IS_CLOUD ? `Historien er gemt sikkert i skyen${imageTotal ? ` · ${imageTotal} billeder` : ""}` : `Historien er gemt i Stories\\${result.folderName}${imageTotal ? ` · ${imageTotal} billeder` : ""}`);
  } catch (error) {
    console.error("Historien kunne ikke gemmes i Stories-mappen", error);
    if (status) status.textContent = IS_CLOUD ? "Kun gemt i denne browser" : "Kun gemt lokalt";
    toast(error.message || (IS_CLOUD ? "Historien kunne ikke gemmes i skyen" : "Historien kunne ikke gemmes i Stories-mappen"));
  } finally {
    buttons.forEach((button, index) => { button.disabled = false; button.textContent = originals[index]; });
  }
}
async function syncStoryToObsidian() {
  saveState();
  const buttons = [document.querySelector("#sync-obsidian-button"), document.querySelector("#fullscreen-sync-obsidian")].filter(Boolean), originals = buttons.map(button => button.textContent);
  buttons.forEach(button => { button.disabled = true; button.textContent = "Synkroniserer…"; });
  const status = document.querySelector("#save-status"); if (status) status.textContent = "Skriver Obsidian-noter…";
  try {
    const project = { ...clone(state), projectId:activeProjectId, title:state.title?.trim() || "Ny historie" };
    const result = await apiRequest("/api/export-obsidian", { projectId:activeProjectId, project });
    state.obsidianFolder = result.relativeFolder; state.obsidianSyncedAt = new Date().toISOString(); saveState();
    if (status) status.textContent = "Synkroniseret med Obsidian";
    toast(`Obsidian opdateret · ${result.filesWritten} filer`);
  } catch (error) {
    console.error("Obsidian-synkroniseringen mislykkedes", error);
    if (status) status.textContent = "Obsidian blev ikke opdateret";
    toast(error.message || "Historien kunne ikke synkroniseres med Obsidian");
  } finally {
    buttons.forEach((button,index) => { button.disabled = false; button.textContent = originals[index]; });
  }
}
async function generateComic() {
  if (comicBackgroundJob && ["planning","running","pdf","saving"].includes(comicBackgroundJob.phase)) return toast("Tegneserien genereres allerede i baggrunden");
  if (!state.fullStory?.trim()) return toast("Generér den samlede historie først");
  const configured = await checkAiStatus();
  if (!configured) { document.querySelector("#comic-dialog")?.close(); openApiKeyPanel(); return toast("Forbind AI først"); }
  const existingPages = Array.isArray(state.comicPages) ? state.comicPages : [], missingExisting = comicMissingIndexes(existingPages);
  const isResume = existingPages.length > 0 && missingExisting.length > 0;
  const estimate = isResume ? missingExisting.length : Math.max(6, Math.min(14, state.scenes.length || 8));
  const question = isResume
    ? `${comicCompletedCount(existingPages)} af ${existingPages.length} sider er allerede færdige. Fortsæt kun med de ${estimate} manglende ${estimate === 1 ? "side" : "sider"}?`
    : `Tegneserien vil bestå af cirka ${estimate} AI-genererede billedsider og bruger ét billedkald pr. side. Fortsæt?`;
  if (!confirm(question)) return;
  document.querySelector("#comic-dialog")?.close(); document.querySelector("#full-story-dialog")?.close();
  const job = comicBackgroundJob = { projectId:activeProjectId, project:clone(projectSnapshot()), story:state.fullStory, title:state.title, phase:isResume ? "running" : "planning", message:isResume ? `Genoptager de ${estimate} manglende sider…` : "AI’en omsætter historien til sider og paneler…", pages:isResume ? clone(existingPages) : [], completed:isResume ? comicCompletedCount(existingPages) : 0, total:isResume ? existingPages.length : 0, abortController:new AbortController(), cancelled:false };
  comicReadyPdf = null; updateComicJobUI(); toast("Tegneserien genereres nu i baggrunden");
  try {
    if (!isResume) {
      const plan = await apiRequest("/api/comic-plan", { story:job.story, project:job.project }, { signal:job.abortController.signal, timeoutMs:240_000 });
      job.pages = (plan.pages || []).map((page, index) => ({ ...page, styleBible:plan.styleBible || "", pageNumber:index + 1, url:"" })); job.total = job.pages.length;
      if (!job.total) throw new Error("AI’en oprettede ingen tegneseriesider");
      persistComicJob(job); updateComicJobUI();
    }
    const missingIndexes = comicMissingIndexes(job.pages);
    for (const [position, index] of missingIndexes.entries()) {
      await createComicPageForJob(job, index);
      if (position < missingIndexes.length - 1) {
        job.message = `Side ${index + 1} er færdig · giver billedtjenesten 5 sekunder…`; updateComicJobUI();
        await waitForComicDelay(5_000, job.abortController.signal);
      }
    }
    persistComicJob(job, true); job.phase = "pdf"; job.message = "Samler siderne til én PDF…"; updateComicJobUI();
    comicReadyPdf = { blob:await buildComicPdf(job.pages, job.abortController.signal), name:comicPdfName(job.title), projectId:job.projectId };
    job.phase = "saving"; job.message = "Tegneserien er klar – vælg placering…"; updateComicJobUI();
    const result = await requestComicPdfSave(comicReadyPdf, false);
    job.phase = result.cancelled || result.ready ? "ready" : "done";
    job.message = result.cancelled || result.ready ? "PDF-filen er klar til at blive gemt" : `Gemt som ${String(result.path || comicReadyPdf.name).split(/[\\/]/).at(-1)}`;
    updateComicJobUI(); toast(job.phase === "done" ? `${job.total} tegneseriesider er skabt og gemt som PDF` : `${job.total} tegneseriesider er klar`);
  } catch (error) {
    if (job.cancelled || error?.name === "ComicGenerationCancelledError") return;
    job.phase = "error"; job.message = `${job.completed || 0} af ${job.total || "?"} sider færdige · ${error.message} · Åbn siderne og tryk Færdiggør for at fortsætte.`; updateComicJobUI();
    toast(error.message);
  }
}
async function regenerateComicPage(index) {
  try { await createComicPageImage(index, true); }
  catch (error) { renderComicPages(); toast(error.message); }
}
function exportComicPdf() {
  const pages = (state.comicPages || []).filter(page => page.url);
  if (!pages.length) return toast("Generér mindst én tegneserieside først");
  const printWindow = window.open("", "_blank"); if (!printWindow) return toast("Browseren blokerede PDF-vinduet");
  const figures = pages.map((page, index) => `<figure><img src="${escapeHTML(new URL(page.url, location.href).href)}" alt="Side ${index + 1}"><figcaption>Side ${index + 1}${page.title ? ` · ${escapeHTML(page.title)}` : ""}</figcaption></figure>`).join("");
  printWindow.document.write(`<!doctype html><html lang="da"><head><meta charset="utf-8"><title>${escapeHTML(state.title || "Tegneserie")}</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;background:#fff}figure{position:relative;width:210mm;height:297mm;margin:0;overflow:hidden;page-break-after:always}img{display:block;width:100%;height:100%;object-fit:contain}figcaption{position:absolute;left:8mm;bottom:5mm;padding:2mm 3mm;color:#fff;background:rgba(0,0,0,.62);font:10pt Georgia,serif}@media print{figcaption{display:none}}</style></head><body>${figures}</body></html>`);
  printWindow.document.close(); printWindow.focus(); printWindow.addEventListener("load", () => printWindow.print(), { once:true });
}

function exportMarkdown() {
  const f = state.foundation, w = state.world;
  const md = `# ${state.title || "Min historie"}\n\n## Historiens DNA\n\n**Præmis:** ${f.premise || "—"}\n\n**Genre og tone:** ${f.genre || "—"} · ${f.tone || "—"}\n\n**Dramatisk spørgsmål:** ${f.question || "—"}\n\n**Tema:** ${f.theme || "—"}\n\n**Slutning:** ${f.ending || "—"}\n\n## Miljøer\n\n${state.environments.map(environment => `### ${environment.name}\n- Type: ${environment.type || "—"}\n- Beskrivelse: ${environment.description || "—"}\n- Regler: ${environment.rules || "—"}\n- Dramatisk pres: ${environment.pressure || "—"}`).join("\n\n") || "Ingen miljøer endnu."}\n\n## Personer\n\n${state.characters.map(c => `### ${c.name}\n- Rolle: ${c.role || "—"}\n- Vil: ${c.want || "—"}\n- Behøver: ${c.need || "—"}\n- Fejl: ${c.flaw || "—"}\n- Forandring: ${c.change || "—"}`).join("\n\n") || "Ingen personer endnu."}\n\n## Fem akter\n\n${acts.map(a => `### Akt ${a.n} · ${a.title}\n${state.plot[`act${a.n}`] || "—"}`).join("\n\n")}\n\n## Sceneliste\n\n${state.scenes.map((s,i) => `### ${i+1}. ${s.title} (Akt ${s.act})\n${s.summary || "—"}\n\n- Aktører: ${actorNames(s).join(", ") || "—"}\n- Lokation: ${environmentById(s.locationId)?.name || s.setting || "—"}\n- Synsvinkel: ${s.pov || "—"}\n- Mål: ${s.goal || "—"}\n- Modstand: ${s.conflict || "—"}\n- Vendepunkt: ${s.turn || "—"}`).join("\n\n") || "Ingen scener endnu."}\n\n## Skriveaftale\n\n- Rutine: ${state.draft.ritual || "—"}\n- Mål: ${state.draft.weeklyGoal || "—"}\n- Synsvinkel: ${state.draft.pov || "—"}\n- Første linje: ${state.draft.firstLine || "—"}\n`;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(state.title || "historieplan").replace(/[^a-z0-9æøå]+/gi,"-").toLowerCase()}.md`; a.click(); URL.revokeObjectURL(url); toast("Historieplanen er eksporteret");
}

function toast(message) {
  const el = document.querySelector("#toast");
  const openDialog = [...document.querySelectorAll("dialog[open]")].at(-1);
  (openDialog || document.body).appendChild(el);
  el.textContent = message; el.classList.add("show"); clearTimeout(el._timer); el._timer = setTimeout(() => el.classList.remove("show"), 2400);
}

document.addEventListener("click", e => {
  const nav = e.target.closest("[data-nav]"); if (nav) navigate(nav.dataset.nav);
});
document.querySelector("#menu-button").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));
document.querySelector("#export-button").addEventListener("click", exportMarkdown);
document.querySelector("#save-story-button").addEventListener("click", saveStoryProjectToDisk);
document.querySelector("#sync-obsidian-button").addEventListener("click", syncStoryToObsidian);
document.querySelector("#open-api-key").addEventListener("click", openApiKeyPanel);
document.querySelector("#project-switcher").addEventListener("click", openProjectDialog);
document.querySelector("#close-project-dialog").addEventListener("click", () => document.querySelector("#project-dialog").close());
document.querySelector("#new-project").addEventListener("click", createProject);
document.querySelector("#project-name-form").addEventListener("submit", submitProjectName);
document.querySelector("#close-project-name").addEventListener("click", closeProjectNameDialog);
document.querySelector("#cancel-project-name").addEventListener("click", closeProjectNameDialog);
document.querySelector("#export-project-backup").addEventListener("click", exportProjectBackup);
document.querySelector("#restore-stories-from-disk").addEventListener("click", restoreStoriesFromDisk);
document.querySelector("#import-project-backup").addEventListener("click", () => document.querySelector("#project-backup-file").click());
document.querySelector("#project-backup-file").addEventListener("change", event => importProjectBackup(event.target.files?.[0]));
document.querySelector("#project-list").addEventListener("click", event => {
  const opener = event.target.closest("[data-switch-project]");
  if (opener) return switchProject(opener.dataset.switchProject);
  const action = event.target.closest("[data-project-action]");
  if (!action) return;
  const id = action.dataset.projectId;
  if (action.dataset.projectAction === "rename") renameProject(id);
  if (action.dataset.projectAction === "duplicate") duplicateProject(id);
  if (action.dataset.projectAction === "archive") archiveProject(id, true);
  if (action.dataset.projectAction === "unarchive") archiveProject(id, false);
  if (action.dataset.projectAction === "delete") deleteProject(id);
});
document.querySelector("#close-full-story").addEventListener("click", () => document.querySelector("#full-story-dialog").close());
document.querySelector("#generate-full-story").addEventListener("click", generateFullStory);
document.querySelector("#copy-full-story").addEventListener("click", copyFullStory);
document.querySelector("#export-full-story-pdf").addEventListener("click", exportFullStoryPdf);
document.querySelector("#export-full-story-doc").addEventListener("click", exportFullStoryDoc);
document.querySelector("#open-comic").addEventListener("click", generateComic);
document.querySelector("#close-comic").addEventListener("click", () => document.querySelector("#comic-dialog").close());
document.querySelector("#generate-comic").addEventListener("click", generateComic);
document.querySelector("#export-comic-pdf").addEventListener("click", exportComicPdf);
document.querySelector("#comic-pages").addEventListener("click", event => { const button = event.target.closest("[data-regenerate-comic-page]"); if (button) regenerateComicPage(Number(button.dataset.regenerateComicPage)); });
document.querySelector("#comic-pages").addEventListener("input", event => {
  const field = event.target.closest("[data-comic-direction]"); if (!field) return;
  const index = Number(field.dataset.comicDirection); if (!state.comicPages?.[index]) return;
  state.comicPages[index].visualDirection = field.value; scheduleSave();
});
document.querySelector("#comic-job-open").addEventListener("click", () => {
  if (comicBackgroundJob?.projectId && comicBackgroundJob.projectId !== activeProjectId) switchProject(comicBackgroundJob.projectId, "Historien med tegneserien er åbnet");
  openComicDialog();
});
document.querySelector("#comic-job-cancel").addEventListener("click", cancelComicGeneration);
document.querySelector("#comic-job-save").addEventListener("click", saveReadyComicPdf);
document.querySelector("#full-story-text").addEventListener("input", event => { state.fullStory = event.target.value; scheduleSave(); });
document.querySelector("#load-example").addEventListener("click", () => {
  const hasWork = totalProgress() > 4;
  if (!hasWork || confirm("Eksemplet erstatter det, du har udfyldt. Fortsæt?")) { state = clone(exampleState); saveState(); render(); toast("Eksempelhistorien er indlæst"); }
});
document.querySelector("#scene-form").addEventListener("submit", saveScene);
document.querySelector("#separator-form").addEventListener("submit", saveSeparator);
document.querySelector("#delete-separator").addEventListener("click", deleteSeparator);
document.querySelectorAll(".close-separator").forEach(button => button.addEventListener("click", () => document.querySelector("#separator-dialog").close()));
document.querySelectorAll(".close-dialog").forEach(button => button.addEventListener("click", () => document.querySelector("#scene-dialog").close()));
document.querySelector("#delete-scene").addEventListener("click", deleteScene);
document.querySelectorAll(".close-lesson").forEach(button => button.addEventListener("click", () => document.querySelector("#lesson-dialog").close()));
document.querySelector("#previous-lesson").addEventListener("click", () => moveLesson(-1));
document.querySelector("#next-lesson").addEventListener("click", () => moveLesson(1));
document.querySelector("#open-ai-chat").addEventListener("click", openAiDrawer);
document.querySelector("#close-ai-chat").addEventListener("click", closeAiDrawer);
document.addEventListener("keydown", event => {
  const editing = event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']");
  const coachShortcut = event.code === "F2" || (event.code === "KeyC" && !editing && !event.ctrlKey && !event.metaKey && !event.altKey);
  if (!coachShortcut || event.repeat) return;
  event.preventDefault(); toggleAiDrawer(false);
});
document.querySelector("#save-api-key").addEventListener("click", saveApiKey);
document.querySelector("#chat-form").addEventListener("submit", event => { event.preventDefault(); submitChat(document.querySelector("#chat-input").value); });
document.querySelectorAll("#chat-starters button").forEach(button => button.addEventListener("click", () => submitChat(button.textContent)));
document.querySelector("#clear-chat").addEventListener("click", () => { state.ai = { chat: [] }; saveState(); renderChat(); });
document.querySelectorAll(".close-suggestion").forEach(button => button.addEventListener("click", () => document.querySelector("#suggestion-dialog").close()));
document.querySelector("#use-suggestion").addEventListener("click", useSuggestion);
document.querySelector("#another-suggestion").addEventListener("click", () => activeSuggestion?.button && requestSuggestion(activeSuggestion.button));
document.querySelector("#ai-complete-scene").addEventListener("click", () => requestSceneBlueprint("full"));
document.querySelector("#ai-scene-links").addEventListener("click", () => requestSceneBlueprint("links"));
document.querySelector("#create-scene-character").addEventListener("click", createCharacterFromScene);
document.querySelector("#ai-write-scene").addEventListener("click", writeSceneWithAi);
document.querySelector("#copy-ai-scene").addEventListener("click", copyAiSceneDraft);
window.addEventListener("resize", () => { if (scene3DRuntime) requestAnimationFrame(() => { syncSceneCanvasGeometry(); positionSceneWorld(); draw3DLinks(); }); });
window.addEventListener("focus", () => {
  if (diskHydrationFinished && !saveTimer && !diskSaveTimer && !diskSaveInFlight) hydrateProjectsFromDisk({ notify:true });
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && diskHydrationFinished && !saveTimer && !diskSaveTimer && !diskSaveInFlight) hydrateProjectsFromDisk({ notify:true });
});

if (IS_CLOUD) {
  document.body.classList.add("cloud-mode");
  document.querySelector("#open-api-key").hidden = true;
  document.querySelector("#sync-obsidian-button").hidden = true;
  document.querySelectorAll("#fullscreen-sync-obsidian").forEach(button => { button.hidden = true; });
  const restoreButton = document.querySelector("#restore-stories-from-disk");
  if (restoreButton) restoreButton.textContent = "↻ Hent fra skyen";
  const saveButton = document.querySelector("#save-story-button");
  if (saveButton) { saveButton.title = "Gem hele historien sikkert i skyen"; saveButton.innerHTML = "☁ Gem i skyen"; }
  const status = document.querySelector("#save-status");
  if (status) status.textContent = "Forbinder til skyen…";
}

render();
renderChat();
checkAiStatus();
hydrateProjectsFromDisk();
