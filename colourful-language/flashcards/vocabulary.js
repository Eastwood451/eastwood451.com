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
  ]
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
    row("elephant", "ελέφαντας", "elefantas")
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
    row("elephant", "elephantus", "e-le-phan-tus")
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
    row("elephant", "فيل", "fil")
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
    row("elephant", "象", "zou", ["ぞう"])
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
    row("elephant", "слон", "slon")
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
    row("elephant", "слон", "slon")
  ]
};

export function fallbackRows(languageCode) {
  return (FALLBACK_VOCABULARY[languageCode] || []).map((entry, index) => ({
    ...entry,
    language_code: languageCode,
    sort_order: index + 1
  }));
}
