export const LANGUAGES = [
  {
    code: "el",
    label: "Græsk",
    native: "Ελληνικά"
  },
  {
    code: "la",
    label: "Latin",
    native: "Lingua Latina"
  },
  {
    code: "ar",
    label: "Arabisk",
    native: "العربية",
    direction: "rtl"
  },
  {
    code: "ja",
    label: "Japansk",
    native: "日本語"
  },
  {
    code: "sr",
    label: "Serbisk",
    native: "Српски"
  },
  {
    code: "ru",
    label: "Russisk",
    native: "Русский"
  }
];

export const DANISH_WORDS = [
  [
    "sword",
    "Sværd"
  ],
  [
    "knife",
    "Kniv"
  ],
  [
    "fork",
    "Gaffel"
  ],
  [
    "plate",
    "Tallerken"
  ],
  [
    "paper",
    "Papir"
  ],
  [
    "metal",
    "Metal"
  ],
  [
    "salt",
    "Salt"
  ],
  [
    "water",
    "Vand"
  ],
  [
    "food",
    "Mad"
  ],
  [
    "bear",
    "Bjørn"
  ],
  [
    "wolf",
    "Ulv"
  ],
  [
    "dog",
    "Hund"
  ],
  [
    "horse",
    "Hest"
  ],
  [
    "elephant",
    "Elefant"
  ],
  ["i","Jeg"],
  ["you","Du"],
  ["he","Han"],
  ["she","Hun"],
  ["my","Min"],
  ["your","Din"],
  ["his","Hans"],
  ["her","Hendes"],
  ["their","Deres"]
];

function row(word, target, reading = "", accepted = []) {
  return { word_id: word, danish: DANISH_WORDS.find(([id]) => id === word)[1], target, reading, accepted_answers: accepted };
}

export const FALLBACK_VOCABULARY = {
  el: [
    row("sword", "σπαθί", "spathi"),
    row("knife", "μαχαίρι", "machairi"),
    row("fork", "πιρούνι", "pirouni"),
    row("plate", "πιάτο", "piato"),
    row("paper", "χαρτί", "charti"),
    row("metal", "μέταλλο", "metallo"),
    row("salt", "αλάτι", "alati"),
    row("water", "νερό", "nero"),
    row("food", "φαγητό", "fagito"),
    row("bear", "αρκούδα", "arkouda"),
    row("wolf", "λύκος", "lykos"),
    row("dog", "σκύλος", "skylos"),
    row("horse", "άλογο", "alogo"),
    row("elephant", "ελέφαντας", "elefantas"),
    row("i", "εγώ", "ego", []),
    row("you", "εσύ", "esy", []),
    row("he", "αυτός", "aftos", []),
    row("she", "αυτή", "afti", []),
    row("my", "μου", "mou", []),
    row("your", "σου", "sou", []),
    row("his", "του", "tou", []),
    row("her", "της", "tis", []),
    row("their", "τους", "tous", [])
  ],
  la: [
    row("sword", "gladius", "gla-di-us", ["ensis"]),
    row("knife", "culter", "cul-ter", ["cultellus"]),
    row("fork", "furca", "fur-ca"),
    row("plate", "catillus", "ca-til-lus", ["patina"]),
    row("paper", "charta", "char-ta"),
    row("metal", "metallum", "me-tal-lum"),
    row("salt", "sal", "sal"),
    row("water", "aqua", "a-qua"),
    row("food", "cibus", "ci-bus"),
    row("bear", "ursus", "ur-sus"),
    row("wolf", "lupus", "lu-pus"),
    row("dog", "canis", "ca-nis"),
    row("horse", "equus", "e-quus"),
    row("elephant", "elephantus", "e-le-phan-tus"),
    row("i", "ego", "e-go", []),
    row("you", "tu", "tu", []),
    row("he", "is", "is", ["ille"]),
    row("she", "ea", "e-a", ["illa"]),
    row("my", "meus", "me-us", ["mea","meum"]),
    row("your", "tuus", "tu-us", ["tua","tuum"]),
    row("his", "eius", "ei-us", []),
    row("her", "eius", "ei-us", []),
    row("their", "eorum", "e-o-rum", ["earum"])
  ],
  ar: [
    row("sword", "سيف", "sayf"),
    row("knife", "سكين", "sikkin"),
    row("fork", "شوكة", "shawka"),
    row("plate", "طبق", "tabaq"),
    row("paper", "ورق", "waraq"),
    row("metal", "معدن", "madin"),
    row("salt", "ملح", "milh"),
    row("water", "ماء", "maa"),
    row("food", "طعام", "taam"),
    row("bear", "دب", "dubb"),
    row("wolf", "ذئب", "dhib"),
    row("dog", "كلب", "kalb"),
    row("horse", "حصان", "hisan"),
    row("elephant", "فيل", "fil"),
    row("i", "أنا", "ana", ["anaa"]),
    row("you", "أنتَ", "anta", ["أنتِ","anti"]),
    row("he", "هو", "huwa", []),
    row("she", "هي", "hiya", []),
    row("my", "ـي", "ii", ["i","-i","-ii"]),
    row("your", "ـكَ", "ka", ["ـكِ","ki","-ka","-ki"]),
    row("his", "ـهُ", "hu", ["-hu"]),
    row("her", "ـها", "ha", ["haa","-ha"]),
    row("their", "ـهم", "hum", ["-hum","ـهن","hunna"])
  ],
  ja: [
    row("sword", "剣", "ken", ["けん","つるぎ","tsurugi"]),
    row("knife", "ナイフ", "naifu", ["ないふ"]),
    row("fork", "フォーク", "fooku", ["ふぉーく"]),
    row("plate", "皿", "sara", ["さら"]),
    row("paper", "紙", "kami", ["かみ"]),
    row("metal", "金属", "kinzoku", ["きんぞく"]),
    row("salt", "塩", "shio", ["しお"]),
    row("water", "水", "mizu", ["みず"]),
    row("food", "食べ物", "tabemono", ["たべもの","食物","shokumotsu","しょくもつ"]),
    row("bear", "熊", "kuma", ["くま"]),
    row("wolf", "狼", "ookami", ["おおかみ"]),
    row("dog", "犬", "inu", ["いぬ"]),
    row("horse", "馬", "uma", ["うま"]),
    row("elephant", "象", "zou", ["ぞう"]),
    row("i", "私", "watashi", ["わたし"]),
    row("you", "あなた", "anata", []),
    row("he", "彼", "kare", ["かれ"]),
    row("she", "彼女", "kanojo", ["かのじょ"]),
    row("my", "私の", "watashi no", ["わたしの","watashino"]),
    row("your", "あなたの", "anata no", ["anatano"]),
    row("his", "彼の", "kare no", ["かれの","kareno"]),
    row("her", "彼女の", "kanojo no", ["かのじょの","kanojono"]),
    row("their", "彼らの", "karera no", ["かれらの","彼女たちの","かのじょたちの","kanojotachi no","karerano"])
  ],
  sr: [
    row("sword", "мач", "mač"),
    row("knife", "нож", "nož"),
    row("fork", "виљушка", "viljuška"),
    row("plate", "тањир", "tanjir"),
    row("paper", "папир", "papir"),
    row("metal", "метал", "metal"),
    row("salt", "со", "so"),
    row("water", "вода", "voda"),
    row("food", "храна", "hrana"),
    row("bear", "медвед", "medved"),
    row("wolf", "вук", "vuk"),
    row("dog", "пас", "pas"),
    row("horse", "коњ", "konj"),
    row("elephant", "слон", "slon"),
    row("i", "ја", "ja", []),
    row("you", "ти", "ti", []),
    row("he", "он", "on", []),
    row("she", "она", "ona", []),
    row("my", "мој", "moj", ["моја","моје","moja","moje"]),
    row("your", "твој", "tvoj", ["твоја","твоје","tvoja","tvoje"]),
    row("his", "његов", "njegov", ["његова","његово","njegova","njegovo"]),
    row("her", "њен", "njen", ["њена","њено","njena","njeno"]),
    row("their", "њихов", "njihov", ["њихова","њихово","njihova","njihovo"])
  ],
  ru: [
    row("sword", "меч", "mech"),
    row("knife", "нож", "nozh"),
    row("fork", "вилка", "vilka"),
    row("plate", "тарелка", "tarelka"),
    row("paper", "бумага", "bumaga"),
    row("metal", "металл", "metall"),
    row("salt", "соль", "sol"),
    row("water", "вода", "voda"),
    row("food", "еда", "yeda"),
    row("bear", "медведь", "medved"),
    row("wolf", "волк", "volk"),
    row("dog", "собака", "sobaka"),
    row("horse", "лошадь", "loshad"),
    row("elephant", "слон", "slon"),
    row("i", "я", "ya", ["ja"]),
    row("you", "ты", "ty", []),
    row("he", "он", "on", []),
    row("she", "она", "ona", []),
    row("my", "мой", "moy", ["моя","моё","мои","moi","moja","moya","moe","moyo","moi"]),
    row("your", "твой", "tvoy", ["твоя","твоё","твои","tvoi","tvoya","tvoja","tvoyo","tvoe"]),
    row("his", "его", "yego", ["ego"]),
    row("her", "её", "yeyo", ["ее","eyo","ejo","yoyo"]),
    row("their", "их", "ikh", ["ih"])
  ]
};

export function fallbackRows(languageCode) {
  return (FALLBACK_VOCABULARY[languageCode] || []).map((entry, index) => ({
    ...entry,
    language_code: languageCode,
    sort_order: index + 1
  }));
}

export const PRONOUN_IDS = ["i","you","he","she","my","your","his","her","their"];
export function wordNote(wordId, code) {
  if (!PRONOUN_IDS.includes(wordId)) return "";
  if (code === "la" && ["his", "her"].includes(wordId)) return "Samme form bruges for en mandlig og en kvindelig ejer; begge betydninger godkendes.";
  if (code === "ar" && ["my", "your", "his", "her", "their"].includes(wordId)) return "Ejefaldsendelse: sættes direkte efter et navneord.";
  if (code === "ar" && wordId === "you") return "Formen afhænger af, om du taler til en mand eller en kvinde.";
  if (["la", "sr", "ru"].includes(code) && ["my", "your"].includes(wordId)) return "Her vises hankønsformen. Hunkøns- og intetkønsformer godkendes også.";
  if (code === "ja" && wordId === "you") return "I samtaler bruges ofte personens navn i stedet for dette stedord.";
  if (code === "el" && ["my", "your", "his", "her", "their"].includes(wordId)) return "Kort ejefaldsform: bruges efter det navneord, den hører til.";
  return "";
}
