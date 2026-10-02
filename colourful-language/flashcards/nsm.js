// Original teaching drafts: these are not published or validated NSM explications.
// English prime names follow the NSM chart; Danish labels are learner glosses.
export const NSM_SOURCES = [
  { label: "NSM: primitiver og danske ressourcer", url: "https://nsm-approach.net/resources" },
  { label: "NSM: semantiske molekyler", url: "https://nsm-approach.net/archives/category/nsm-toolkit/semantic-molecules" }
];

export const NSM_PRIMES = {
  thing: ["noget / ting", "SOMETHING~THING"], someone: ["nogen", "SOMEONE"],
  people: ["mennesker", "PEOPLE"], body: ["krop", "BODY"], kind: ["slags", "KINDS"],
  part: ["dele", "(HAVE) PARTS"], one: ["én", "ONE"], two: ["to", "TWO"],
  many: ["meget / mange", "MUCH~MANY"], some: ["noget / nogle", "SOME"],
  big: ["stor", "BIG"], small: ["lille", "SMALL"], do: ["gøre", "DO"],
  happen: ["ske", "HAPPEN"], move: ["bevæge sig", "MOVE"], touch: ["berøre", "TOUCH"],
  want: ["ville", "WANT"], can: ["kunne", "CAN"], feel: ["føle", "FEEL"],
  see: ["se", "SEE"], live: ["leve", "LIVE"], die: ["dø", "DIE"],
  good: ["god", "GOOD"], bad: ["dårlig", "BAD"], inside: ["indeni", "INSIDE"],
  above: ["over", "ABOVE"], near: ["nær", "NEAR"], place: ["sted", "PLACE"],
  not: ["ikke", "NOT~DON’T"], because: ["fordi", "BECAUSE"], if: ["hvis", "IF"],
  after: ["efter", "AFTER"], longTime: ["lang tid", "A LONG TIME"],
  like: ["som / sådan", "LIKE~AS~WAY"], other: ["anden", "OTHER~ELSE"]
};

// Molecule notes are brief Danish reading aids, not recursive formal analyses.
export const NSM_MOLECULES = {
  make: ["lave", "Nogen gør noget, så en ting kommer til at være der eller får en anden form."],
  hands: ["hænder", "Dele af kroppen, som mennesker kan bevæge og bruge til at røre ved eller holde ting."],
  mouth: ["mund", "En del af kroppen. Noget kan komme ind i kroppen gennem denne del."],
  teeth: ["tænder", "Hårde dele i munden, som blandt andet kan dele mad i mindre dele."],
  eat: ["spise", "Noget føres ind i munden og videre ind i kroppen; kroppen kan få noget godt af det."],
  drink: ["drikke", "Noget flydende føres ind i munden og videre ind i kroppen."],
  food: ["mad", "Noget mennesker eller dyr kan spise, så noget godt kan ske i kroppen."],
  metal: ["metal", "En slags materiale; det er ofte hårdt og kan få en anden form ved stærk opvarmning."],
  hard: ["hård", "Noget giver ikke let efter, når nogen trykker på det."],
  long: ["lang", "Afstanden fra den ene ende til den anden er stor i forhold til afstanden på tværs."],
  thin: ["tynd", "Afstanden mellem to modsatte sider er lille."],
  flat: ["flad", "En side har næsten samme niveau mange steder på siden."],
  round: ["rund", "Kanten eller formen går rundt om et midtpunkt uden tydelige hjørner."],
  pointed: ["spids", "En del bliver meget smal ved enden og kan gå lidt ind i noget andet."],
  cut: ["skære", "Nogen bevæger noget mod en ting, så dele af tingen bliver adskilt."],
  write: ["skrive", "Nogen frembringer synlige tegn, så andre kan vide, hvilke ord nogen vil sige."],
  taste: ["smag", "Noget man kan mærke, når noget berører dele inde i munden."],
  liquid: ["flydende", "Noget kan flytte sig og tage form efter det sted, det er i."],
  animal: ["dyr", "Et levende væsen med en krop; det er ikke et menneske og kan normalt bevæge sig fra sted til sted."],
  legs: ["ben", "Dele under kroppen, som et dyr eller et menneske kan bruge til at bevæge sig."],
  fur: ["pels", "Mange små hår, som dækker dele af et dyrs krop."],
  claws: ["kløer", "Hårde, spidse dele ved enderne af visse dyrs ben."],
  meat: ["kød", "Dele af et dyrs krop, som nogle dyr og mennesker kan spise."],
  dog: ["hund", "En slags dyr, som ofte lever nær mennesker og kan gøre ting sammen med dem."],
  tail: ["hale", "En del bag på visse dyrs krop, som dyret kan bevæge."],
  hooves: ["hove", "Hårde dele ved enderne af nogle dyrs ben; de berører jorden, når dyret bevæger sig."],
  ears: ["ører", "Dele af kroppen, som gør, at et dyr eller et menneske kan høre."],
  trunk: ["snabel", "En lang del foran på en elefants hoved, som kan bevæges og gribe ting."],
  tusks: ["stødtænder", "Meget store tænder, som stikker ud fra munden hos visse dyr."]
};

function entry(summary, primes, molecules, lines) {
  return { summary, primes, molecules, lines };
}

export const NSM_ENTRIES = {
  sword: entry("Et sværd som våben.", ["thing","kind","people","do","want","body","bad","can","die"],
    ["make","metal","long","hands","cut"], [
      "Dette er en ting af en slags, som mennesker {make}.",
      "En del er af {metal}; denne del er {long}.",
      "Nogen kan holde en anden del med {hands}.",
      "Nogen kan {cut} en anden persons krop med denne ting.",
      "Mennesker vil nogle gange gøre dette, fordi de vil have, at noget dårligt sker med den anden person; personen kan dø."
    ]),
  knife: entry("En kniv som redskab til at skære.", ["thing","kind","people","part","do","can","move"],
    ["make","metal","hands","cut"], [
      "Dette er en ting af en slags, som mennesker {make}.",
      "Nogen kan holde én del med {hands}.",
      "En anden del er ofte af {metal}.",
      "Nogen kan bevæge denne del mod noget andet.",
      "Når nogen gør dette, kan denne ting {cut} det andet i dele."
    ]),
  fork: entry("En gaffel som spiseredskab.", ["thing","kind","people","part","some","small","move","can"],
    ["make","pointed","hands","food","mouth","eat"], [
      "Dette er en ting af en slags, som mennesker {make}.",
      "I den ene ende er der nogle små {pointed} dele.",
      "Nogen kan holde den anden ende med {hands}.",
      "De spidse dele kan gå lidt ind i noget {food}.",
      "Nogen kan derefter bevæge maden til {mouth} med denne ting, når nogen vil {eat}."
    ]),
  plate: entry("En tallerken til mad.", ["thing","kind","people","part","above","can"],
    ["make","flat","round","food","eat"], [
      "Dette er en ting af en slags, som mennesker {make}.",
      "En stor del af den er {flat}; dens form er ofte {round}.",
      "Nogen kan have noget {food} oven på denne del.",
      "Mennesker kan {eat} maden, mens den er på denne ting."
    ]),
  paper: entry("Papir som materiale til blandt andet skrift.", ["thing","kind","people","small","do","see","can"],
    ["make","thin","flat","hands","write"], [
      "Dette er noget af en slags, som mennesker {make}.",
      "En ting af denne slags kan være {thin} og {flat}.",
      "Mennesker kan holde den med {hands}.",
      "Mennesker kan {write} på den; andre mennesker kan bagefter se det, der er skrevet.",
      "En sådan ting kan let blive til mindre dele."
    ]),
  metal: entry("Metal som materiale.", ["thing","kind","people","do","can","touch","feel"],
    ["hard","make"], [
      "Dette er noget af en slags.",
      "Noget af denne slags er ofte {hard}.",
      "Når nogen rører ved det, kan nogen føle noget på en bestemt måde.",
      "Mennesker kan gøre noget ved det, så det får en anden form.",
      "Mennesker kan {make} mange slags ting med det."
    ]),
  salt: entry("Salt i betydningen det salt, vi kommer i mad.", ["thing","kind","small","many","some","feel","can"],
    ["food","mouth","taste"], [
      "Dette er noget af en slags; det kan være mange meget små dele.",
      "Mennesker kommer ofte noget af det i {food}.",
      "Når lidt af det er i {mouth}, kan man mærke en bestemt {taste}.",
      "Hvis meget af det er i maden, er smagen meget anderledes end før."
    ]),
  water: entry("Vand som det almindelige stof, vi drikker.", ["thing","kind","people","place","inside","body","live","can","see"],
    ["liquid","drink"], [
      "Dette er noget af en slags; det er {liquid}.",
      "Der er meget af det mange steder.",
      "Mennesker kan {drink} noget af det.",
      "Noget af det må være inde i menneskers kroppe, hvis de skal leve.",
      "Når det er rent, kan man ofte se noget på den anden side af det."
    ]),
  food: entry("Mad som noget at spise.", ["thing","kind","people","body","inside","good","live","can"],
    ["eat","mouth"], [
      "Dette er noget af en slags.",
      "Mennesker kan {eat} det; det kommer ind i kroppen gennem {mouth}.",
      "Efter dette kan noget godt ske inde i kroppen.",
      "Mennesker må gøre dette på mange tidspunkter for at leve."
    ]),
  bear: entry("En bjørn som dyretype.", ["kind","body","big","some","two","can","move"],
    ["animal","fur","legs","claws"], [
      "Dette er et {animal} af en slags.",
      "Kroppen er ofte stor; der er {fur} på den.",
      "Det bevæger sig normalt på fire {legs}.",
      "Det kan nogle gange være oppe på to ben.",
      "Ved enderne af benene har det {claws}."
    ]),
  wolf: entry("En ulv som dyretype.", ["kind","body","like","people","near","some","live","can"],
    ["animal","dog","fur","teeth","meat"], [
      "Dette er et {animal} af en slags; kroppen ligner en {dog}s krop.",
      "Der er {fur} på kroppen og {teeth} i munden.",
      "Det kan spise {meat} fra andre dyr.",
      "Dyr af denne slags lever ofte nær andre dyr af samme slags.",
      "De lever normalt ikke sammen med mennesker på den måde, hunde gør."
    ]),
  dog: entry("En hund som dyretype.", ["kind","people","near","body","some","want","do","can"],
    ["animal","fur","legs","tail"], [
      "Dette er et {animal} af en slags.",
      "Mange dyr af denne slags lever nær mennesker.",
      "Kroppen har normalt {fur}, fire {legs} og en {tail}.",
      "Mennesker vil ofte have, at et dyr af denne slags gør bestemte ting.",
      "Dyret kan gøre nogle af disse ting sammen med mennesker."
    ]),
  horse: entry("En hest som dyretype.", ["kind","body","big","people","above","move","can"],
    ["animal","legs","hooves","tail"], [
      "Dette er et {animal} af en slags; kroppen er stor.",
      "Det bevæger sig på fire {legs}; ved enderne er der {hooves}.",
      "Der er en {tail} bag på kroppen.",
      "Et menneske kan være oven på kroppen.",
      "Dyret kan bevæge sig fra et sted til et andet med mennesket oven på sig."
    ]),
  elephant: entry("En elefant som dyretype.", ["kind","body","big","part","some","move","can"],
    ["animal","legs","ears","trunk","tusks"], [
      "Dette er et {animal} af en slags; kroppen er meget stor.",
      "Det bevæger sig på fire store {legs}.",
      "Der er store {ears} på hovedet.",
      "Foran på hovedet er der en {trunk}; dyret kan bevæge den og tage ting med den.",
      "Nogle dyr af denne slags har {tusks}."
    ])
};


