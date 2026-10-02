import { getSupabaseClient } from "/supabase-client.js";
import { HIRAGANA_MEMOS } from "./hiragana-memos.js?v=20261002-1";
import { NSM_ENTRIES, NSM_PRIMES, NSM_MOLECULES, NSM_SOURCES } from "./nsm.js?v=20261002-pronouns-1";
import { DANISH_WORDS, LANGUAGES, fallbackRows, PRONOUN_IDS, wordNote } from "./vocabulary.js?v=20261002-pronouns-1";

const TOTAL_WORDS = DANISH_WORDS.length;
const VOCABULARY_TIMEOUT_MS = 10000;
const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_DAYS = [1, 3, 7, 14, 30];
const STORAGE_PREFIX = "eastwood451:flashcards:v2:";
const LANGUAGE_STORAGE_KEY = STORAGE_PREFIX + "language";
const LANGUAGES_STORAGE_KEY = STORAGE_PREFIX + "languages";
const MODE_NAMES = {
  recognition: "Genkendelse",
  recall: "Genkaldelse"
};

const languageChoices = document.querySelector("#language-choices");
const deckTitle = document.querySelector("#deck-title");
const dataSource = document.querySelector("#data-source");
const learnedCount = document.querySelector("#learned-count");
const progressTrack = document.querySelector(".progress-track");
const overallProgress = document.querySelector("#overall-progress");
const deckCount = document.querySelector("#deck-count");
const quiz = document.querySelector("#quiz");
const feedback = document.querySelector("#feedback");
const activeWordsList = document.querySelector("#active-words");
const wordListToggle = document.querySelector("#word-list-toggle");
const wordListPanel = document.querySelector("#word-list-panel");
const wordListLanguage = document.querySelector("#word-list-language");
const wordListSummary = document.querySelector("#word-list-summary");
const wordListItems = document.querySelector("#word-list-items");
const multipleChoiceButton = document.querySelector("#multiple-choice-button");
const typingButton = document.querySelector("#typing-button");
const modeStep = document.querySelector("#mode-step");
const resetButton = document.querySelector("#reset-progress");
const nsmDialog = document.querySelector("#nsm-dialog");
const nsmTitle = document.querySelector("#nsm-title");
const nsmSubtitle = document.querySelector("#nsm-subtitle");
const nsmContent = document.querySelector("#nsm-content");
const nsmHintNote = document.querySelector("#nsm-hint-note");
const kanaDialog = document.querySelector("#kana-dialog");
const kanaTitle = document.querySelector("#kana-title");
const kanaNote = document.querySelector("#kana-note");
const kanaImages = document.querySelector("#kana-images");

let selectedLanguageCodes = readLanguageSelection();
let languageCode = selectedLanguageCodes[0] || LANGUAGES[0].code;
const languageSessions = new Map();
let vocabulary = [];
let progress = freshProgress();
let mode = "recognition";
let answerMethod = "multiple-choice";
let question = null;
let revealedHintIndices = new Set();
let hintUsedForQuestion = false;
let hintMode = "first";
let answerLocked = false;
let answerTimer = null;
let loadSequence = 0;
let feedbackState = { text: "", kind: "" };
let reviewSlots = [];
let forceReview = false;

languageChoices.innerHTML = LANGUAGES.map((language) =>
  '<label class="language-choice">' +
    '<input type="checkbox" name="languages" value="' + escapeHtml(language.code) + '"' +
      (selectedLanguageCodes.includes(language.code) ? " checked" : "") + ">" +
    '<span>' + escapeHtml(language.label) + "</span>" +
  "</label>"
).join("");

languageChoices.addEventListener("change", () => {
  const codes = [...languageChoices.querySelectorAll("input:checked")].map((input) => input.value);
  changeLanguages(codes);
});

multipleChoiceButton.addEventListener("click", () => setAnswerMethod("multiple-choice"));
typingButton.addEventListener("click", () => setAnswerMethod("typing"));
resetButton.addEventListener("click", resetLanguage);
wordListToggle.addEventListener("click", () => {
  const open = wordListPanel.hidden;
  wordListPanel.hidden = !open;
  wordListToggle.setAttribute("aria-expanded", String(open));
  wordListToggle.textContent = open ? "Skjul ordlisten" : "Vis alle ord";
  if (open) renderWordList();
});

document.addEventListener("click", (event) => {
  const kana = event.target.closest(".kana-memo-button");
  if (kana) {
    openKanaMemo(kana.dataset.kana);
    return;
  }
  const button = event.target.closest(".nsm-button");
  if (!button) return;
  openNsm(button.dataset.nsmWord, button.dataset.nsmCode, button.dataset.nsmHint === "true");
});
document.querySelector("#kana-close").addEventListener("click", () => kanaDialog.close());
kanaDialog.addEventListener("click", (event) => {
  if (event.target !== kanaDialog) return;
  const bounds = kanaDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) kanaDialog.close();
});
document.querySelector("#nsm-close").addEventListener("click", () => nsmDialog.close());
nsmDialog.addEventListener("click", (event) => {
  if (event.target === nsmDialog) {
    const bounds = nsmDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) nsmDialog.close();
  }
});

function freshProgress() {
  return { introduced: 3, learned: [], streaks: {}, answered: 0, reviews: {} };
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readLanguageSelection() {
  try {
    const stored = JSON.parse(readStorage(LANGUAGES_STORAGE_KEY) || "null");
    if (Array.isArray(stored)) {
      return LANGUAGES.filter((language) => stored.includes(language.code)).map((language) => language.code);
    }
  } catch {
    // Fall back to the previously selected single language.
  }
  const previous = readStorage(LANGUAGE_STORAGE_KEY);
  return [LANGUAGES.some((language) => language.code === previous) ? previous : LANGUAGES[0].code];
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + languageCode, JSON.stringify(progress));
  } catch {
    dataSource.dataset.source = "local";
    dataSource.textContent = "Fremgang kun i denne fane";
  }
}

function loadProgress(code) {
  let stored;
  try {
    stored = JSON.parse(window.localStorage.getItem(STORAGE_PREFIX + code) || "null");
  } catch {
    stored = null;
  }

  if (!stored || typeof stored !== "object") return freshProgress();

  const knownIds = new Set(DANISH_WORDS.map(([id]) => id));
  const learned = Array.isArray(stored.learned)
    ? [...new Set(stored.learned.filter((id) => knownIds.has(id)))]
    : [];
  const streaks = {};

  if (stored.streaks && typeof stored.streaks === "object") {
    for (const id of knownIds) {
      const value = stored.streaks[id];
      if (!value || typeof value !== "object") continue;
      streaks[id] = {
        recognition: clampStreak(value.recognition),
        recall: clampStreak(value.recall)
      };
    }
  }

  const minimumIntroduced = Math.min(3 + learned.length, TOTAL_WORDS);
  const introduced = Number.isInteger(stored.introduced)
    ? Math.max(minimumIntroduced, Math.min(TOTAL_WORDS, stored.introduced))
    : minimumIntroduced;

  const answered = Number.isSafeInteger(stored.answered) ? Math.max(0, stored.answered) : 0;
  const reviews = {};
  for (const id of learned) {
    reviews[id] = normalizeReview(stored.reviews?.[id], answered);
  }

  return { introduced, learned, streaks, answered, reviews };
}

function clampStreak(value) {
  return Number.isInteger(value) ? Math.max(0, Math.min(3, value)) : 0;
}

function clampInteger(value, minimum, maximum, fallback) {
  return Number.isSafeInteger(value)
    ? Math.max(minimum, Math.min(maximum, value))
    : fallback;
}

function normalizeReview(value, answered) {
  if (!value || typeof value !== "object") {
    return {
      level: 0,
      dueQuestion: answered,
      dueAt: Date.now(),
      failures: 0,
      weakness: { recognition: 0, recall: 0 },
      lastReviewed: 0
    };
  }

  return {
    level: clampInteger(value.level, 0, 4, 0),
    dueQuestion: clampInteger(value.dueQuestion, 0, Number.MAX_SAFE_INTEGER, answered),
    dueAt: Number.isFinite(value.dueAt) && value.dueAt >= 0 ? value.dueAt : Date.now(),
    failures: clampInteger(value.failures, 0, 9, 0),
    weakness: {
      recognition: clampInteger(value.weakness?.recognition, 0, 5, 0),
      recall: clampInteger(value.weakness?.recall, 0, 5, 0)
    },
    lastReviewed: clampInteger(value.lastReviewed, 0, answered, 0)
  };
}

async function getVocabulary(code) {
  const localWords = fallbackRows(code);
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("flashcard_vocabulary")
      .select("language_code, word_id, danish, target, reading, accepted_answers, sort_order")
      .eq("language_code", code)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const expected = new Set(localWords.map((word) => word.word_id));
    const received = Array.isArray(data) ? data : [];
    const receivedIds = new Set(received.map((word) => word.word_id));
    const complete = received.length === TOTAL_WORDS &&
      receivedIds.size === TOTAL_WORDS &&
      [...expected].every((id) => receivedIds.has(id));

    if (complete) {
      return {
        words: received.map((word) => ({
          ...word,
          accepted_answers: Array.isArray(word.accepted_answers) ? word.accepted_answers : []
        })),
        source: "supabase"
      };
    }
  } catch (error) {
    console.info("Supabase-ordlisten blev ikke hentet. Den lokale ordliste bruges.", error);
  }

  return { words: localWords, source: "local" };
}

function getVocabularyWithTimeout(code) {
  let timeout;
  return Promise.race([
    getVocabulary(code),
    new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve({ words: fallbackRows(code), source: "local" });
      }, VOCABULARY_TIMEOUT_MS);
    })
  ]).finally(() => clearTimeout(timeout));
}

async function changeLanguages(codes) {
  const sequence = ++loadSequence;
  selectedLanguageCodes = LANGUAGES.filter((language) => codes.includes(language.code)).map((language) => language.code);
  writeLanguagePreference();
  clearTimeout(answerTimer);
  answerLocked = false;
  question = null;
  revealedHintIndices = new Set();
  hintUsedForQuestion = false;
  forceReview = false;
  feedbackState = { text: "", kind: "" };
  feedback.replaceChildren();
  feedback.dataset.kind = "";
  wordListItems.replaceChildren();
  resetButton.disabled = true;

  if (!selectedLanguageCodes.length) {
    learnedCount.innerHTML = '0 <span>/ 0</span>';
    overallProgress.style.width = "0%";
    progressTrack.setAttribute("aria-valuemax", "0");
    progressTrack.setAttribute("aria-valuenow", "0");
    deckCount.textContent = "Ingen sprog valgt";
    deckTitle.textContent = "Tre ord i spil";
    activeWordsList.replaceChildren();
    wordListLanguage.textContent = "de valgte sprog";
    wordListSummary.textContent = "Vælg mindst ét sprog";
    modeStep.textContent = "—";
    quiz.innerHTML = '<p class="loading">Vælg mindst ét sprog ovenfor for at begynde.</p>';
    dataSource.textContent = "Ingen sprog valgt";
    dataSource.dataset.source = "";
    return;
  }

  dataSource.dataset.source = "";
  dataSource.textContent = "Henter ordlister …";
  quiz.innerHTML = '<p class="loading">Gør ordkortene klar …</p>';
  const missing = selectedLanguageCodes.filter((code) => !languageSessions.has(code));
  await Promise.all(missing.map(async (code) => {
    const result = await getVocabularyWithTimeout(code);
    if (!languageSessions.has(code)) {
      languageSessions.set(code, {
        words: result.words,
        progress: loadProgress(code),
        source: result.source,
        reviewSlots: []
      });
    }
  }));
  if (sequence !== loadSequence) return;

  activateLanguage(selectedLanguageCodes[0]);
  render();
}

function activateLanguage(code) {
  const previous = languageSessions.get(languageCode);
  if (previous) previous.reviewSlots = reviewSlots;
  const session = languageSessions.get(code);
  languageCode = code;
  vocabulary = session.words;
  progress = session.progress;
  reviewSlots = session.reviewSlots;
  dataSource.dataset.source = session.source;
  dataSource.textContent = currentLanguage().label + " · " +
    (session.source === "supabase" ? "Ord fra Supabase" : "Lokal ordliste");
  resetButton.disabled = false;
  resetButton.textContent = "Nulstil " + currentLanguage().label.toLowerCase();
}

function writeLanguagePreference() {
  try {
    window.localStorage.setItem(LANGUAGES_STORAGE_KEY, JSON.stringify(selectedLanguageCodes));
  } catch {
    // The app remains usable when browser storage is disabled.
  }
}

function currentLanguage() {
  return LANGUAGES.find((language) => language.code === languageCode) || LANGUAGES[0];
}

function getActiveWords() {
  const learned = new Set(progress.learned);
  return vocabulary
    .slice(0, progress.introduced)
    .filter((word) => !learned.has(word.word_id));
}

function getStreak(wordId) {
  if (!progress.streaks[wordId]) {
    progress.streaks[wordId] = { recognition: 0, recall: 0 };
  }
  return progress.streaks[wordId];
}

function getLearnedWords() {
  const learned = new Set(progress.learned);
  return vocabulary.filter((word) => learned.has(word.word_id));
}

function getReview(wordId) {
  if (!progress.reviews[wordId]) {
    progress.reviews[wordId] = normalizeReview(null, progress.answered);
  }
  return progress.reviews[wordId];
}

function reviewQuestionInterval(level) {
  const count = Math.max(1, progress.learned.length);
  return [6, 18, 45, Math.max(90, 2 * count), Math.max(90, 3 * count)][level];
}

function scheduleReview(review) {
  review.dueQuestion = progress.answered + reviewQuestionInterval(review.level);
  review.dueAt = Date.now() + REVIEW_DAYS[review.level] * DAY_MS;
}

function reviewIsDue(review) {
  return progress.answered >= review.dueQuestion || Date.now() >= review.dueAt;
}

function chooseReviewWord(words) {
  return shuffle(words).sort((first, second) => {
    const a = getReview(first.word_id);
    const b = getReview(second.word_id);
    const urgencyA = a.failures * 100 + (a.weakness.recognition + a.weakness.recall) * 10;
    const urgencyB = b.failures * 100 + (b.weakness.recognition + b.weakness.recall) * 10;
    return urgencyB - urgencyA || a.lastReviewed - b.lastReviewed;
  })[0] || null;
}

function chooseReviewMode(review) {
  const recognitionWeight = 1 + 2 * review.weakness.recognition;
  const recallWeight = 1 + 2 * review.weakness.recall;
  return Math.random() * (recognitionWeight + recallWeight) < recognitionWeight
    ? "recognition"
    : "recall";
}

function readyWords(trainingMode) {
  return getActiveWords().filter((word) => getStreak(word.word_id)[trainingMode] < 3);
}

function setAnswerMethod(nextMethod) {
  if (nextMethod === answerMethod) return;
  answerMethod = nextMethod;
  revealedHintIndices = new Set();
  render();
}

function nextReviewSlot() {
  if (!reviewSlots.length) reviewSlots = shuffle([false, false, true]);
  return reviewSlots.shift();
}

function nextQuestion() {
  const available = selectedLanguageCodes.filter((code) => {
    const session = languageSessions.get(code);
    if (!session) return false;
    const learned = new Set(session.progress.learned);
    const active = session.words.slice(0, session.progress.introduced).some((word) => !learned.has(word.word_id));
    const due = session.progress.learned.some((id) => {
      const review = session.progress.reviews[id];
      return review && (session.progress.answered >= review.dueQuestion || Date.now() >= review.dueAt);
    });
    return active || due || (forceReview && learned.size > 0);
  });
  for (const code of shuffle(available)) {
    activateLanguage(code);
    const word = nextQuestionForLanguage();
    if (word) return word;
  }
  return null;
}

function nextQuestionForLanguage() {
  const active = getActiveWords();
  const learned = getLearnedWords();
  const due = learned.filter((word) => reviewIsDue(getReview(word.word_id)));
  const useReview = !active.length || forceReview || (due.length > 0 && nextReviewSlot());

  if (useReview) {
    const reviewWord = chooseReviewWord(due.length ? due : forceReview ? learned : []);
    if (reviewWord) {
      forceReview = false;
      mode = chooseReviewMode(getReview(reviewWord.word_id));
      return reviewWord;
    }
  }

  if (!active.length) return null;
  const availableModes = ["recognition", "recall"]
    .filter((trainingMode) => readyWords(trainingMode).length > 0);
  if (!availableModes.length) return null;

  mode = availableModes[Math.floor(Math.random() * availableModes.length)];
  const candidates = readyWords(mode);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function shuffle(values) {
  const shuffled = values.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function render() {
  if (!selectedLanguageCodes.length || !selectedLanguageCodes.every((code) => languageSessions.has(code))) return;
  if (!question) {
    question = nextQuestion();
    revealedHintIndices = new Set();
    hintUsedForQuestion = false;
  }
  renderProgress();
  renderActiveWords();
  renderWordList();
  renderAnswerMethodToggle();
  renderQuiz();
  renderFeedback();
}

function renderProgress() {
  const sessions = selectedLanguageCodes.map((code) => languageSessions.get(code));
  const learnedTotal = sessions.reduce((sum, session) => sum + session.progress.learned.length, 0);
  const total = TOTAL_WORDS * sessions.length;
  learnedCount.innerHTML = learnedTotal + " <span>/ " + total + "</span>";
  overallProgress.style.width = (total ? learnedTotal / total * 100 : 0) + "%";
  progressTrack.setAttribute("aria-valuemax", String(total));
  progressTrack.setAttribute("aria-valuenow", String(learnedTotal));
  const activeCount = getActiveWords().length;
  deckCount.textContent = currentLanguage().label + " · " +
    (activeCount ? "Aktivt sæt · " + activeCount + " ord" : "Alle ord lært · repetition");
  deckTitle.textContent = currentLanguage().label + " · tre ord i spil";
}

function renderActiveWords() {
  const active = getActiveWords();
  if (!active.length) {
    activeWordsList.innerHTML = '<li class="word-row"><span class="word-row-name">Alle ' + TOTAL_WORDS + ' ord er lært</span></li>';
    return;
  }

  activeWordsList.innerHTML = active.map((word) => {
    const streak = getStreak(word.word_id);
    return '<li class="word-row">' +
      '<div class="word-row-heading">' +
        '<span class="word-row-name">' + escapeHtml(word.danish) + "</span>" +
        '<span class="word-tools">' + nsmButtonMarkup(word, "da") +
          mirarisLinkMarkup(word.danish, "da") + "</span>" +
      "</div>" +
      '<span class="word-metrics">' +
        metric("Genkend", streak.recognition) +
        metric("Genkald", streak.recall) +
      "</span>" +
    "</li>";
  }).join("");
}

function renderWordList() {
  if (wordListPanel.hidden) return;
  const languages = LANGUAGES.filter((language) => selectedLanguageCodes.includes(language.code));
  wordListLanguage.textContent = languages.map((language) => language.label.toLowerCase()).join(", ");
  const learnedTotal = languages.reduce((sum, language) => sum +
    (languageSessions.get(language.code)?.progress.learned.length || 0), 0);
  wordListSummary.textContent = learnedTotal + " af " + (TOTAL_WORDS * languages.length) + " ord lært";
  wordListItems.innerHTML = languages.map((language) => {
    const session = languageSessions.get(language.code);
    if (!session) return "";
    const learned = new Set(session.progress.learned);
    const direction = language.direction || "ltr";
    return session.words.map((word) => {
      const isLearned = learned.has(word.word_id);
      const reading = visibleReading(word, language.code);
      const readingMarkup = reading
        ? '<span class="word-list-reading" lang="und-Latn" dir="ltr">' + escapeHtml(reading) + "</span>"
        : "";
      return '<li class="word-list-item' + (isLearned ? " is-learned" : "") + '">' +
        '<div class="word-list-terms">' +
          '<span class="word-list-language">' + escapeHtml(language.label) + "</span>" +
          '<div class="word-list-danish-line">' +
            '<span class="word-list-danish" lang="da">' + escapeHtml(word.danish) + "</span>" +
            '<span class="word-tools">' + nsmButtonMarkup(word, "da") +
              mirarisLinkMarkup(word.danish, "da") + "</span>" +
          "</div>" +
          readingMarkup +
          '<span class="word-list-target' + (reading ? "" : " is-primary") +
            '" lang="' + escapeHtml(language.code) + '" dir="' + escapeHtml(direction) + '">' +
            (language.code === "ja" ? japaneseMarkup(word) : escapeHtml(word.target)) + "</span>" +
        "</div>" +
        '<div class="word-list-actions">' +
          '<span class="word-list-status">' + (isLearned ? "Lært" : "Ikke lært") + "</span>" +
          '<span class="word-tools">' + nsmButtonMarkup(word, language.code) +
            mirarisLinkMarkup(word.target, language.code) + "</span>" +
        "</div>" +
      "</li>";
    }).join("");
  }).join("");
}

function metric(label, value) {
  const done = value >= 3 ? " is-done" : "";
  return '<span class="metric' + done + '" aria-label="' + label + " " + value + " ud af 3 i træk\">" +
    label + " " + value + "/3" +
  "</span>";
}

function renderAnswerMethodToggle() {
  multipleChoiceButton.setAttribute("aria-pressed", String(answerMethod === "multiple-choice"));
  typingButton.setAttribute("aria-pressed", String(answerMethod === "typing"));
}

function nsmButtonMarkup(word, code, asHint = false) {
  return '<button class="nsm-button" type="button" data-nsm-word="' +
    escapeHtml(word.word_id) + '" data-nsm-code="' + escapeHtml(code) +
    '" data-nsm-hint="' + asHint + '" aria-haspopup="dialog" aria-controls="nsm-dialog" aria-label="' +
    escapeHtml("Se semantiske primitiver og molekyler for " + (code === "da" ? word.danish : word.target)) +
    '">NSM</button>';
}

function createNsmButton(word, code, asHint = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "nsm-button";
  button.dataset.nsmWord = word.word_id;
  button.dataset.nsmCode = code;
  button.dataset.nsmHint = String(asHint);
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "nsm-dialog");
  button.setAttribute("aria-label", "Se semantiske primitiver og molekyler for " +
    (code === "da" ? word.danish : word.target));
  button.textContent = "NSM";
  return button;
}

function nsmLineMarkup(line) {
  return escapeHtml(line).replace(/\{([a-z]+)\}/g, (_, key) => {
    const molecule = NSM_MOLECULES[key];
    return molecule ? '<span class="nsm-molecule">' + escapeHtml(molecule[0]) + " [m]</span>" : key;
  });
}

function openNsm(wordId, code, asHint = false) {
  const sourceCode = code === "da" ? languageCode : code;
  const language = LANGUAGES.find((item) => item.code === sourceCode);
  if (!language) return;
  const words = languageSessions.get(sourceCode)?.words || fallbackRows(sourceCode);
  const word = words.find((item) => item.word_id === wordId);
  const analysis = NSM_ENTRIES[wordId];
  if (!word || !analysis) return;

  const givesHint = !answerLocked && question &&
    (asHint || question.word_id === wordId);
  if (givesHint) hintUsedForQuestion = true;
  nsmHintNote.hidden = !givesHint;
  const displayWord = code === "da" ? word.danish : visibleReading(word, sourceCode) || word.target;
  nsmTitle.textContent = "NSM · " + displayWord;
  nsmSubtitle.textContent = code === "da" ? "Dansk · " + word.danish :
    language.label + " · " + word.target + " · " + word.danish;

  const primes = analysis.primes.map((key) => {
    const [danish, english] = NSM_PRIMES[key];
    return '<li><strong>' + escapeHtml(danish) + "</strong><span>" + escapeHtml(english) + "</span></li>";
  }).join("");
  const molecules = analysis.molecules.map((key) => {
    const [label, description] = NSM_MOLECULES[key];
    return '<details><summary>' + escapeHtml(label) + ' <span>[m]</span></summary><p>' +
      escapeHtml(description) + "</p></details>";
  }).join("");
  const sources = NSM_SOURCES.map((source) =>
    '<a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener noreferrer">' +
    escapeHtml(source.label) + " ↗</a>").join("");
  nsmContent.innerHTML =
    '<p class="nsm-scope">' + escapeHtml(analysis.summary) + "</p>" +
    '<section><h3>Betydning i enkle led</h3><ol class="nsm-explication">' +
      analysis.lines.map((line) => "<li>" + nsmLineMarkup(line) + "</li>").join("") +
    "</ol></section>" +
    '<section><h3>Semantiske primitiver</h3><p>Grundbetydninger fra NSM-inventaret. Her vises danske læsegloser og de engelske betegnelser.</p>' +
      '<ul class="nsm-primes">' + primes + "</ul></section>" +
    '<section><h3>Semantiske molekyler [m]</h3><p>Komplekse støttebegreber i forklaringen. Åbn et begreb for en kort dansk læsehjælp.</p>' +
      '<div class="nsm-molecules">' + molecules + "</div></section>" +
    '<p class="nsm-draft">NSM-inspireret læringsudkast med almindeligt dansk. Forklaringen og molekylernes læsehjælp er egne formuleringer og er ikke en publiceret eller fagligt valideret NSM-analyse. Udgangspunktet er ordlistens danske betydning; nuancer kan variere mellem sprogene.</p>' +
    '<nav class="nsm-sources" aria-label="Kilder til NSM-metoden">' + sources + "</nav>";
  if (!nsmDialog.open) nsmDialog.showModal();
  nsmDialog.scrollTop = 0;
}

function mirarisUrl(term, code) {
  const query = code === "da" ? term.toLocaleLowerCase("da-DK") : term;
  return "https://miraris.app/search?q=" + encodeURIComponent(query) +
    "&lang=" + encodeURIComponent(code) + "&pos=" + (
      (code === "da"
        ? DANISH_WORDS.some(([id, word]) => PRONOUN_IDS.includes(id) && word.toLocaleLowerCase("da-DK") === query)
        : fallbackRows(code).some((word) => PRONOUN_IDS.includes(word.word_id) && word.target === term))
      ? "pronoun" : "noun");
}

function mirarisDescription(term, code) {
  const language = code === "da" ? "Dansk" : LANGUAGES.find((item) => item.code === code)?.label || code;
  return "Slå " + term + " op på Miraris (" + language + ") – åbner i ny fane";
}

function mirarisLinkMarkup(term, code, label = "Miraris ↗") {
  return '<a class="miraris-link" href="' + escapeHtml(mirarisUrl(term, code)) +
    '" target="_blank" rel="noopener noreferrer" aria-label="' +
    escapeHtml(mirarisDescription(term, code)) + '">' + escapeHtml(label) + "</a>";
}

function createMirarisLink(term, code, label = "Miraris ↗") {
  const link = document.createElement("a");
  link.className = "miraris-link";
  link.href = mirarisUrl(term, code);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", mirarisDescription(term, code));
  link.textContent = label;
  return link;
}


const JAPANESE_HIRAGANA = {
  sword: "けん", knife: "ないふ", fork: "ふぉーく", plate: "さら",
  paper: "かみ", metal: "きんぞく", salt: "しお", water: "みず",
  food: "たべもの", bear: "くま", wolf: "おおかみ", dog: "いぬ",
  horse: "うま", elephant: "ぞう",
  i: "わたし", you: "あなた", he: "かれ", she: "かのじょ",
  my: "わたしの", your: "あなたの", his: "かれの", her: "かのじょの", their: "かれらの"
};

function japaneseForms(word) {
  const hiragana = JAPANESE_HIRAGANA[word.word_id] || "";
  const katakana = hiragana.replace(/[ぁ-ゖ]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) + 0x60));
  const kanji = /[一-龯]/u.test(word.target) ? word.target : "";
  return { hiragana, katakana, kanji };
}

function memoForKana(character) {
  const small = { "ぁ": "あ", "ぃ": "い", "ぅ": "う", "ぇ": "え", "ぉ": "お", "っ": "つ", "ゃ": "や", "ゅ": "ゆ", "ょ": "よ", "ゎ": "わ" };
  const base = small[character] || character.normalize("NFD")[0];
  const memo = HIRAGANA_MEMOS[base];
  return memo ? { ...memo, base } : null;
}

function hiraganaMarkup(value) {
  return [...value].map((character) => {
    if (!memoForKana(character)) return escapeHtml(character);
    return '<button class="kana-memo-button" type="button" data-kana="' +
      escapeHtml(character) + '" aria-haspopup="dialog" aria-controls="kana-dialog" aria-label="' +
      escapeHtml("Se memo-billede for " + character) + '">' + escapeHtml(character) + '</button>';
  }).join("");
}

function openKanaMemo(character) {
  const memo = memoForKana(character);
  if (!memo) return;
  const givesHint = !answerLocked && question && languageCode === "ja";
  if (givesHint) hintUsedForQuestion = true;
  kanaTitle.textContent = character + " · " + memo.reading;
  const variant = character !== memo.base
    ? "Anki-filen har et billede for grundtegnet " + memo.base + ". Her vises det som memo til " + character + ". "
    : "";
  kanaNote.textContent = variant + (givesHint
    ? "Memo-hjælpen tæller som et hint. Et rigtigt svar vises stadig som korrekt, men ordet kommer igen."
    : "Memo-billeder fra Japanese - Hiragana memo.");
  kanaImages.replaceChildren();
  for (const [index, filename] of memo.images.entries()) {
    const image = document.createElement("img");
    image.src = "./hiragana-memos/" + encodeURIComponent(filename);
    image.alt = "Anki-memo for " + memo.base + " (" + memo.reading + "), billede " + (index + 1);
    image.decoding = "async";
    kanaImages.append(image);
  }
  kanaDialog.showModal();
  kanaDialog.scrollTop = 0;
}

function japaneseMarkup(word, interactive = true) {
  const forms = japaneseForms(word);
  return '<span class="japanese-scripts" lang="ja" dir="ltr">' +
    [["Hiragana", forms.hiragana], ["Katakana", forms.katakana], ["Kanji", forms.kanji || "—"]]
      .map(([label, value]) => '<span class="japanese-script"><span class="script-label">' +
        label + '</span><span class="script-value">' +
        (label === "Hiragana" && interactive ? hiraganaMarkup(value) : escapeHtml(value)) + '</span></span>').join("") +
    '</span>';
}

function visibleReading(word, code = languageCode) {
  // Latin already uses the Roman alphabet; its reading field contains syllable breaks.
  return code === "la" ? "" : String(word.reading || "").trim();
}

function renderQuiz() {
  const active = getActiveWords();
  if (!question) {
    if (!active.length) {
      modeStep.textContent = "AJOUR";
      quiz.innerHTML = '<div class="complete-message"><div><strong>Du er ajour.</strong><span>De lærte ord vender tilbage, når de skal repeteres.</span><p><button class="submit-button" type="button">Øv et ord nu</button></p></div></div>';
      quiz.querySelector("button").addEventListener("click", () => {
        forceReview = true;
        render();
      });
      return;
    }
    quiz.innerHTML = '<p class="loading">Vælg en øvelse for at fortsætte.</p>';
    return;
  }

  const language = currentLanguage();
  const targetDirection = language.direction || "ltr";
  const reviewing = progress.learned.includes(question.word_id);
  const streak = getStreak(question.word_id)[mode];
  modeStep.textContent = reviewing ? "REPETITION" : "0" + (streak + 1) + " / 03";

  const questionLabel = (reviewing ? "Repetition · " : "") + MODE_NAMES[mode];
  const translationCue = "På " + language.label.toLowerCase() +
    (mode === "recognition" ? " betyder" : " hedder");
  const reading = visibleReading(question);
  const promptWord = mode === "recognition"
    ? (reading ? '<span class="question-roman" lang="und-Latn" dir="ltr">' + escapeHtml(reading) + "</span>" : "") +
      '<span class="question-target' + (reading ? "" : " is-primary") + '" lang="' + escapeHtml(language.code) + '" dir="' + escapeHtml(targetDirection) + '">' +
      (language.code === "ja" ? japaneseMarkup(question) : escapeHtml(question.target)) + "</span>"
    : '<span class="question-danish" lang="da" dir="ltr">' + escapeHtml(question.danish) + "</span>";

  const promptLanguage = mode === "recognition" ? language.label : "Dansk";
  const note = wordNote(question.word_id, language.code);
  quiz.innerHTML = '<p class="translation-cue">' + escapeHtml(translationCue) + "</p>" +
    '<div class="question-card">' +
    '<p class="question-label">' + escapeHtml(questionLabel) + "</p>" +
    '<div class="word-pair question-pair">' +
      '<span class="word-language">' + escapeHtml(promptLanguage) + "</span>" +
      '<div class="question-content">' +
        '<p class="question-word">' + promptWord + "</p>" +
        '<span class="word-tools question-tools">' +
          mirarisLinkMarkup(mode === "recognition" ? question.target : question.danish,
            mode === "recognition" ? language.code : "da") +
          nsmButtonMarkup(question, mode === "recognition" ? language.code : "da", true) +
        "</span>" +
      "</div>" +
    "</div>" +
    (note ? '<p class="question-label">' + escapeHtml(note) + "</p>" : "") +
  "</div>";

  if (answerMethod === "multiple-choice") {
    const otherWords = shuffle(vocabulary.slice(0, progress.introduced)
      .filter((word) => word.word_id !== question.word_id && !sameTranslation(word, question))).slice(0, 2);
    const answers = shuffle([question, ...otherWords]);
    const answerGrid = document.createElement("div");
    answerGrid.className = "answer-grid";
    answerGrid.setAttribute("role", "group");
    answerGrid.setAttribute("aria-label", mode === "recognition"
      ? "Vælg den danske oversættelse"
      : "Vælg ordet på " + language.label.toLowerCase());

    answers.forEach((word) => {
      let japaneseTarget = null;
      const button = document.createElement("button");
      button.className = "answer-choice";
      button.type = "button";
      button.disabled = answerLocked;
      button.addEventListener("click", () => submitAnswer(word.word_id));
      if (mode === "recognition") {
        button.textContent = word.danish;
      } else {
        const wordReading = visibleReading(word);
        if (wordReading) {
          const pronunciation = document.createElement("span");
          pronunciation.className = "answer-reading";
          pronunciation.textContent = wordReading;
          pronunciation.lang = "und-Latn";
          pronunciation.dir = "ltr";
          button.append(pronunciation);
        }
        const target = document.createElement("span");
        target.className = "answer-target" + (wordReading ? "" : " is-primary");
        if (language.code === "ja") target.innerHTML = japaneseMarkup(word);
        else target.textContent = word.target;
        target.lang = language.code;
        target.dir = targetDirection;
        if (language.code === "ja") japaneseTarget = target;
        else button.append(target);
      }
      const option = document.createElement("div");
      option.className = "answer-option";
      const tools = document.createElement("span");
      tools.className = "word-tools";
      tools.append(createNsmButton(word, mode === "recognition" ? "da" : language.code, true),
        createMirarisLink(mode === "recognition" ? word.danish : word.target,
          mode === "recognition" ? "da" : language.code));
      option.append(button, tools);
      if (japaneseTarget) {
        option.classList.add("has-kana");
        option.append(japaneseTarget);
        japaneseTarget.addEventListener("click", (event) => {
          if (!event.target.closest(".kana-memo-button")) submitAnswer(word.word_id);
        });
      }
      answerGrid.append(option);
    });
    quiz.append(answerGrid);
    return;
  }

  const form = document.createElement("form");
  form.className = "answer-form";
  form.autocomplete = "off";
  const input = document.createElement("input");
  input.id = "recall-input";
  input.name = "answer";
  input.type = "text";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.placeholder = mode === "recognition"
    ? "Skriv det danske svar …"
    : "Skriv ordet på " + language.label.toLowerCase() + " …";
  input.setAttribute("aria-label", mode === "recognition"
    ? "Skriv det danske svar"
    : "Skriv ordet på " + language.label.toLowerCase());
  input.lang = mode === "recognition" ? "da" : language.code;
  input.dir = mode === "recognition" ? "ltr" : "auto";
  input.disabled = answerLocked;

  const label = document.createElement("label");
  label.className = "sr-only";
  label.htmlFor = input.id;
  label.textContent = "Dit svar";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "submit-button";
  submit.textContent = "Svar";
  submit.disabled = answerLocked;

  form.append(label, input, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAnswer(input.value, true);
  });
  quiz.append(createHintPanel(), form);
  if (!answerLocked) input.focus({ preventScroll: true });
}

function createHintPanel() {
  const panel = document.createElement("section");
  panel.className = "hint-panel";
  panel.setAttribute("aria-label", "Bogstavhint");

  const heading = document.createElement("div");
  heading.className = "hint-heading";
  const label = document.createElement("p");
  label.className = "hint-label";
  label.textContent = mode === "recall"
    ? "Hint · romerske bogstaver"
    : "Hint · dansk svar";

  const revealButton = document.createElement("button");
  revealButton.className = "hint-button";
  revealButton.type = "button";

  const methods = document.createElement("div");
  methods.className = "hint-methods";
  methods.setAttribute("role", "group");
  methods.setAttribute("aria-label", "Vælg hintmetode");
  const description = document.createElement("p");
  description.className = "hint-description";
  description.textContent = hintMode === "random"
    ? "Afslører ét tilfældigt bogstav, der stadig mangler."
    : "Starter med første bogstav og fylder ud for hvert tryk.";
  const methodButtons = [
    { value: "first", label: "Giv et bogstav" },
    { value: "random", label: "Giv random bogstav" }
  ].map((method) => {
    const button = document.createElement("button");
    button.className = "hint-method";
    button.type = "button";
    button.textContent = method.label;
    button.setAttribute("aria-pressed", String(hintMode === method.value));
    button.addEventListener("click", () => {
      hintMode = method.value;
      methodButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      description.textContent = hintMode === "random"
        ? "Afslører ét tilfældigt bogstav, der stadig mangler."
        : "Starter med første bogstav og fylder ud for hvert tryk.";
    });
    methods.append(button);
    return button;
  });

  const pattern = document.createElement("div");
  pattern.className = "hint-pattern";
  pattern.lang = mode === "recall" ? "und-Latn" : "da";
  pattern.dir = "ltr";
  pattern.setAttribute("aria-live", "polite");
  const hintText = mode === "recall" ? (visibleReading(question) || question.target) : question.danish;
  renderHintPattern(pattern, hintText);

  function updateRevealButton() {
    const letters = [...hintText].filter((character) => /\p{L}/u.test(character)).length;
    const complete = revealedHintIndices.size >= letters;
    revealButton.textContent = complete ? "Alle bogstaver vist" : "Hint";
    revealButton.disabled = complete || answerLocked;
  }

  revealButton.addEventListener("click", () => {
    const characters = [...hintText];
    const remaining = characters
      .map((character, index) => ({ character, index }))
      .filter(({ character, index }) => /\p{L}/u.test(character) && !revealedHintIndices.has(index));
    if (!remaining.length) {
      updateRevealButton();
      return;
    }

    const next = hintMode === "random"
      ? remaining[Math.floor(Math.random() * remaining.length)]
      : remaining[0];
    revealedHintIndices.add(next.index);
    hintUsedForQuestion = true;
    renderHintPattern(pattern, hintText);
    updateRevealButton();
  });

  updateRevealButton();
  heading.append(label, revealButton);
  panel.append(heading, methods, description, pattern);
  return panel;
}

function renderHintPattern(pattern, hintText) {
  const characters = [...hintText];
  pattern.replaceChildren();
  const accessibleCharacters = [];

  characters.forEach((character, index) => {
    if (/\p{L}/u.test(character)) {
      const slot = document.createElement("span");
      const revealed = revealedHintIndices.has(index);
      slot.className = revealed ? "hint-letter is-revealed" : "hint-letter";
      slot.textContent = revealed ? character : "·";
      slot.setAttribute("aria-hidden", "true");
      pattern.append(slot);
      accessibleCharacters.push(revealed ? character : "tomt felt");
    } else {
      const symbol = document.createElement("span");
      symbol.className = character.trim() ? "hint-symbol" : "hint-space";
      symbol.textContent = character.trim() ? character : "\u00a0";
      symbol.setAttribute("aria-hidden", "true");
      pattern.append(symbol);
      if (character.trim()) accessibleCharacters.push(character);
      else if (character) accessibleCharacters.push("mellemrum");
    }
  });

  pattern.setAttribute("aria-label", "Hint: " + accessibleCharacters.join(" "));
}

function renderFeedback() {
  feedback.replaceChildren();
  feedback.dataset.kind = feedbackState.kind;
  if (feedbackState.kind !== "error" || !feedbackState.correction) {
    feedback.textContent = feedbackState.text;
    if (feedbackState.kind === "success" && feedbackState.lookup) {
      const { word, language } = feedbackState.lookup;
      const links = document.createElement("span");
      links.className = "feedback-word-links";
      links.append(createNsmButton(word, language.code),
        createMirarisLink(word.target, language.code, "Miraris · " + language.label + " ↗"),
        createMirarisLink(word.danish, "da", "Miraris · Dansk ↗"));
      feedback.append(links);
    }
    return;
  }

  const { correctWord, selectedWord, submitted, testedMode, language } = feedbackState.correction;
  const title = document.createElement("strong");
  title.className = "feedback-title";
  title.textContent = "FORKERT";

  const matrix = document.createElement("table");
  matrix.className = "correction-matrix";
  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Det rigtige ordpar øverst og dit svar nedenunder";
  const header = document.createElement("tr");
  for (const label of [language.label, "Dansk"]) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    header.append(cell);
  }
  const head = document.createElement("thead");
  head.append(header);
  const body = document.createElement("tbody");

  function addRow(word, rowClass, entered = "") {
    const row = document.createElement("tr");
    row.className = rowClass;
    row.setAttribute("aria-label", rowClass === "is-correct" ? "Rigtigt ordpar" : "Dit svar");
    const target = document.createElement("td");
    const danish = document.createElement("td");
    const reading = word ? visibleReading(word, language.code) : "";
    target.textContent = word ? capitalize(reading || word.target) : (testedMode === "recall" ? entered : "—");
    if (word && language.code === "ja") {
      target.innerHTML = (reading ? '<span class="matrix-reading">' + escapeHtml(reading) + "</span>" : "") + japaneseMarkup(word);
    }
    target.lang = word && reading && language.code !== "ja" ? "und-Latn" : language.code;
    target.dir = word && reading ? "ltr" : (language.direction || "ltr");
    danish.textContent = word ? word.danish : (testedMode === "recognition" ? entered : "—");
    danish.lang = "da";
    if (word) {
      const targetTools = document.createElement("span");
      targetTools.className = "word-tools";
      targetTools.append(createNsmButton(word, language.code), createMirarisLink(word.target, language.code));
      const danishTools = document.createElement("span");
      danishTools.className = "word-tools";
      danishTools.append(createNsmButton(word, "da"), createMirarisLink(word.danish, "da"));
      target.append(targetTools);
      danish.append(danishTools);
    } else if (entered) {
      (testedMode === "recall" ? target : danish).append(
        createMirarisLink(entered, testedMode === "recall" ? language.code : "da")
      );
    }
    row.append(target, danish);
    body.append(row);
  }

  addRow(correctWord, "is-correct");
  if (selectedWord && selectedWord.word_id !== correctWord.word_id) {
    addRow(selectedWord, "is-selected");
  } else if (submitted) {
    addRow(null, "is-selected", submitted);
  }
  matrix.append(caption, head, body);

  const note = document.createElement("p");
  note.className = "feedback-note";
  note.textContent = "Ordet kommer snart igen.";
  feedback.append(title, matrix, note);
}

function setFeedback(text, kind, correction = null) {
  feedbackState = {
    text, kind, correction,
    lookup: question ? { word: question, language: currentLanguage() } : null
  };
  renderFeedback();
}

function capitalize(value) {
  return value ? value.charAt(0).toLocaleUpperCase() + value.slice(1) : "";
}

function sameTranslation(first, second) {
  return normalizeAnswer(first.target, languageCode) === normalizeAnswer(second.target, languageCode);
}

function submitAnswer(answer, isTyped = false) {
  if (answerLocked || !question) return;

  const testedMode = mode;
  const testedWord = question;
  const correct = isTyped
    ? testedMode === "recognition"
      ? vocabulary.some((word) => sameTranslation(word, testedWord) &&
          normalizeAnswer(answer, "da") === normalizeAnswer(word.danish, "da"))
      : isAcceptedAnswer(testedWord, answer)
    : vocabulary.some((word) => word.word_id === answer && sameTranslation(word, testedWord));
  const reviewing = progress.learned.includes(testedWord.word_id);
  const countsAsCorrect = correct && !hintUsedForQuestion;
  const displayReading = capitalize(visibleReading(testedWord) || testedWord.target);
  const correctFeedback = 'KORREKT! "' + displayReading + '" betyder "' + testedWord.danish + '"';
  const shownCorrectFeedback = hintUsedForQuestion
    ? correctFeedback + ". Hint brugt – ordet kommer snart igen."
    : correctFeedback;
  const selectedWord = correct ? null : vocabulary.find((word) => isTyped
    ? testedMode === "recognition"
      ? normalizeAnswer(answer, "da") === normalizeAnswer(word.danish, "da")
      : isAcceptedAnswer(word, answer)
    : word.word_id === answer);
  const correction = correct ? null : {
    correctWord: testedWord,
    selectedWord,
    submitted: isTyped ? String(answer).trim() : "",
    testedMode,
    language: currentLanguage()
  };
  progress.answered += 1;
  answerLocked = true;

  if (reviewing) {
    const review = getReview(testedWord.word_id);
    review.lastReviewed = progress.answered;
    if (countsAsCorrect) {
      review.failures = 0;
      review.level = Math.min(4, review.level + 1);
      review.weakness[testedMode] = Math.max(0, review.weakness[testedMode] - 1);
      scheduleReview(review);
      setFeedback(correctFeedback, "success");
    } else {
      review.level = Math.max(0, review.level - 2);
      review.failures = Math.min(9, review.failures + 1);
      review.weakness[testedMode] = Math.min(5, review.weakness[testedMode] + 1);
      review.dueQuestion = progress.answered + Math.max(2, 6 - 2 * review.failures);
      review.dueAt = Date.now() + DAY_MS;
      setFeedback(correct ? shownCorrectFeedback : "FORKERT", correct ? "success" : "error", correction);
    }
  } else {
    const streak = getStreak(testedWord.word_id);
    if (countsAsCorrect) {
      streak[testedMode] = Math.min(3, streak[testedMode] + 1);
      const mastered = streak.recognition === 3 && streak.recall === 3;

      if (mastered) {
        progress.learned.push(testedWord.word_id);
        const review = normalizeReview(null, progress.answered);
        review.lastReviewed = progress.answered;
        progress.reviews[testedWord.word_id] = review;
        scheduleReview(review);
        const nextWord = vocabulary[progress.introduced];
        if (nextWord) progress.introduced += 1;
        setFeedback(correctFeedback, "success");
      } else {
        setFeedback(correctFeedback, "success");
      }
    } else {
      streak[testedMode] = 0;
      setFeedback(correct ? shownCorrectFeedback : "FORKERT", correct ? "success" : "error", correction);
    }
  }

  saveProgress();
  render();

  clearTimeout(answerTimer);
  answerTimer = window.setTimeout(() => {
    answerLocked = false;
    question = null;
    revealedHintIndices = new Set();
    render();
  }, 850);
}

function isAcceptedAnswer(word, answer) {
  const submitted = normalizeAnswer(answer, languageCode);
  if (!submitted) return false;
  const accepted = [word.target, word.reading, ...(word.accepted_answers || []),
    ...(languageCode === "ja" ? Object.values(japaneseForms(word)) : [])]
    .filter(Boolean)
    .map((value) => normalizeAnswer(value, languageCode));
  return accepted.includes(submitted);
}

function normalizeAnswer(value, code) {
  let normalized = String(value).normalize("NFKC").trim().toLocaleLowerCase();

  if (code === "ar") {
    normalized = normalized
      .replace(/[ـ]/g, "")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[أإآ]/g, "ا");
  } else if (code === "el" || code === "sr" || code === "ru") {
    normalized = normalized.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  }

  return normalized
    .replace(/['’‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/^'+|'+$/g, "");
}

function resetLanguage() {
  if (!selectedLanguageCodes.includes(languageCode) || !languageSessions.has(languageCode)) return;
  const language = currentLanguage();
  const confirmed = window.confirm("Nulstille alle kort og streaks for " + language.label + "?");
  if (!confirmed) return;

  clearTimeout(answerTimer);
  answerLocked = false;
  question = null;
  revealedHintIndices = new Set();
  mode = "recognition";
  reviewSlots = [];
  forceReview = false;
  progress = freshProgress();
  languageSessions.get(languageCode).progress = progress;
  languageSessions.get(languageCode).reviewSlots = reviewSlots;
  feedbackState = { text: "Sættet er nulstillet. Vi begynder med de første tre ord.", kind: "" };
  saveProgress();
  render();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

changeLanguages(selectedLanguageCodes);
