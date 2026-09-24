import { getSupabaseClient } from "/supabase-client.js";
import { DANISH_WORDS, LANGUAGES, fallbackRows } from "./vocabulary.js";

const TOTAL_WORDS = DANISH_WORDS.length;
const STORAGE_PREFIX = "eastwood451:flashcards:v1:";
const LANGUAGE_STORAGE_KEY = STORAGE_PREFIX + "language";
const MODE_NAMES = {
  recognition: "Genkend",
  recall: "Genkald"
};

const languageSelect = document.querySelector("#language-select");
const dataSource = document.querySelector("#data-source");
const learnedCount = document.querySelector("#learned-count");
const progressTrack = document.querySelector(".progress-track");
const overallProgress = document.querySelector("#overall-progress");
const deckCount = document.querySelector("#deck-count");
const quiz = document.querySelector("#quiz");
const feedback = document.querySelector("#feedback");
const activeWordsList = document.querySelector("#active-words");
const recognitionTab = document.querySelector("#recognition-tab");
const recallTab = document.querySelector("#recall-tab");
const modeStep = document.querySelector("#mode-step");
const resetButton = document.querySelector("#reset-progress");

let languageCode = readStorage(LANGUAGE_STORAGE_KEY) || LANGUAGES[0].code;
let vocabulary = [];
let progress = freshProgress();
let mode = "recognition";
let question = null;
let answerLocked = false;
let answerTimer = null;
let loadSequence = 0;
let questionCursors = { recognition: 0, recall: 0 };
let feedbackState = { text: "", kind: "" };

languageSelect.innerHTML = LANGUAGES.map((language) =>
  '<option value="' + escapeHtml(language.code) + '">' +
    escapeHtml(language.label + " · " + language.native) +
  "</option>"
).join("");
languageSelect.value = languageCode;

languageSelect.addEventListener("change", () => {
  changeLanguage(languageSelect.value);
});

recognitionTab.addEventListener("click", () => setMode("recognition"));
recallTab.addEventListener("click", () => setMode("recall"));
resetButton.addEventListener("click", resetLanguage);

function freshProgress() {
  return { introduced: 3, learned: [], streaks: {} };
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + languageCode, JSON.stringify(progress));
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
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

  return { introduced, learned, streaks };
}

function clampStreak(value) {
  return Number.isInteger(value) ? Math.max(0, Math.min(3, value)) : 0;
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

async function changeLanguage(code) {
  const sequence = ++loadSequence;
  languageCode = LANGUAGES.some((language) => language.code === code) ? code : LANGUAGES[0].code;
  languageSelect.value = languageCode;
  writeLanguagePreference();
  clearTimeout(answerTimer);
  answerLocked = false;
  question = null;
  mode = "recognition";
  questionCursors = { recognition: 0, recall: 0 };
  feedbackState = { text: "", kind: "" };
  vocabulary = [];
  progress = loadProgress(languageCode);
  dataSource.dataset.source = "";
  dataSource.textContent = "Henter ordliste …";
  quiz.innerHTML = '<p class="loading">Gør ordkortene klar …</p>';
  renderProgress();

  const result = await getVocabulary(languageCode);
  if (sequence !== loadSequence) return;

  vocabulary = result.words;
  dataSource.dataset.source = result.source;
  dataSource.textContent = result.source === "supabase" ? "Ord fra Supabase" : "Lokal ordliste";
  question = null;
  render();
}

function writeLanguagePreference() {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
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

function readyWords(trainingMode) {
  return getActiveWords().filter((word) => getStreak(word.word_id)[trainingMode] < 3);
}

function setMode(nextMode) {
  if (nextMode === mode || !readyWords(nextMode).length) return;
  clearTimeout(answerTimer);
  mode = nextMode;
  question = null;
  answerLocked = false;
  feedbackState = { text: "", kind: "" };
  render();
}

function nextQuestion() {
  const candidates = readyWords(mode);
  if (!candidates.length) return null;

  const index = questionCursors[mode] % candidates.length;
  questionCursors[mode] += 1;
  return candidates[index];
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
  if (!vocabulary.length) return;
  if (!readyWords(mode).length) {
    const otherMode = mode === "recognition" ? "recall" : "recognition";
    if (readyWords(otherMode).length) mode = otherMode;
  }

  renderProgress();
  renderActiveWords();
  renderModeTabs();
  renderQuiz();
  renderFeedback();
}

function renderProgress() {
  const learned = new Set(progress.learned);
  const learnedTotal = Math.min(TOTAL_WORDS, learned.size);
  learnedCount.innerHTML = learnedTotal + " <span>/ " + TOTAL_WORDS + "</span>";
  overallProgress.style.width = (learnedTotal / TOTAL_WORDS * 100) + "%";
  progressTrack.setAttribute("aria-valuemax", String(TOTAL_WORDS));
  progressTrack.setAttribute("aria-valuenow", String(learnedTotal));

  const activeCount = getActiveWords().length;
  deckCount.textContent = activeCount
    ? "Aktivt sæt · " + activeCount + " ord"
    : "Hele sættet er gennemført";
}

function renderActiveWords() {
  const active = getActiveWords();
  if (!active.length) {
    activeWordsList.innerHTML = '<li class="word-row"><span class="word-row-name">Alle 21 ord er lært</span></li>';
    return;
  }

  activeWordsList.innerHTML = active.map((word) => {
    const streak = getStreak(word.word_id);
    return '<li class="word-row">' +
      '<span class="word-row-name">' + escapeHtml(word.danish) + "</span>" +
      '<span class="word-metrics">' +
        metric("Genkend", streak.recognition) +
        metric("Genkald", streak.recall) +
      "</span>" +
    "</li>";
  }).join("");
}

function metric(label, value) {
  const done = value >= 3 ? " is-done" : "";
  return '<span class="metric' + done + '" aria-label="' + label + " " + value + " ud af 3 i træk\">" +
    label + " " + value + "/3" +
  "</span>";
}

function renderModeTabs() {
  const canRecognize = readyWords("recognition").length > 0;
  const canRecall = readyWords("recall").length > 0;
  recognitionTab.disabled = !canRecognize;
  recallTab.disabled = !canRecall;
  recognitionTab.setAttribute("aria-selected", String(mode === "recognition"));
  recallTab.setAttribute("aria-selected", String(mode === "recall"));
  modeStep.textContent = "0" + (mode === "recognition" ? "1" : "2") + " / 03";
}

function renderQuiz() {
  const active = getActiveWords();
  if (!active.length) {
    quiz.innerHTML = '<div class="complete-message"><div><strong>Hele sættet er lært.</strong><span>Du har klaret alle 21 ord på ' +
      escapeHtml(currentLanguage().label.toLowerCase()) +
      ". Vælg et andet sprog, eller nulstil sættet for at begynde igen.</span></div></div>";
    return;
  }

  if (!question || !active.some((word) => word.word_id === question.word_id)) {
    question = nextQuestion();
  }
  if (!question) {
    quiz.innerHTML = '<p class="loading">Vælg en øvelse for at fortsætte.</p>';
    return;
  }

  const language = currentLanguage();
  const targetDirection = language.direction || "ltr";
  const streak = getStreak(question.word_id)[mode];
  modeStep.textContent = "0" + (streak + 1) + " / 03";

  const questionLabel = mode === "recognition"
    ? "Vælg det danske ord, der passer til dette ord på " + language.label.toLowerCase() + "."
    : "Skriv ordet på " + language.label.toLowerCase() + ".";
  const promptWord = mode === "recognition" ? question.target : question.danish;
  const promptLanguage = mode === "recognition" ? language.code : "da";
  const promptDirection = mode === "recognition" ? targetDirection : "ltr";
  const reading = mode === "recognition" && question.reading && question.reading !== question.target
    ? '<span class="question-reading" lang="' + escapeHtml(language.code) + '" dir="' +
      (language.code === "ar" ? "ltr" : "auto") + '">' + escapeHtml(question.reading) + "</span>"
    : "";

  quiz.innerHTML = '<div class="question-card">' +
    '<p class="question-label">' + escapeHtml(questionLabel) + "</p>" +
    '<p class="question-word" lang="' + escapeHtml(promptLanguage) + '" dir="' + escapeHtml(promptDirection) + '">' +
      escapeHtml(promptWord) + reading +
    "</p>" +
  "</div>";

  if (mode === "recognition") {
    const answers = shuffle(active);
    const answerGrid = document.createElement("div");
    answerGrid.className = "answer-grid";
    answerGrid.setAttribute("role", "group");
    answerGrid.setAttribute("aria-label", "Vælg den danske oversættelse");

    answers.forEach((word) => {
      const button = document.createElement("button");
      button.className = "answer-choice";
      button.type = "button";
      button.textContent = word.danish;
      button.disabled = answerLocked;
      button.addEventListener("click", () => submitAnswer(word.word_id));
      answerGrid.append(button);
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
  input.spellcheck = false;
  input.placeholder = "Skriv oversættelsen …";
  input.setAttribute("aria-label", "Skriv ordet på " + language.label.toLowerCase());
  input.lang = language.code;
  input.dir = targetDirection;
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
    submitAnswer(input.value);
  });
  quiz.append(form);
  if (!answerLocked) input.focus({ preventScroll: true });
}

function renderFeedback() {
  feedback.textContent = feedbackState.text;
  feedback.dataset.kind = feedbackState.kind;
}

function setFeedback(text, kind) {
  feedbackState = { text, kind };
  renderFeedback();
}

function submitAnswer(answer) {
  if (answerLocked || !question) return;

  const testedMode = mode;
  const testedWord = question;
  const correct = testedMode === "recognition"
    ? answer === testedWord.word_id
    : isAcceptedAnswer(testedWord, answer);
  const streak = getStreak(testedWord.word_id);

  if (correct) {
    streak[testedMode] = Math.min(3, streak[testedMode] + 1);
    answerLocked = true;
    const mastered = streak.recognition === 3 && streak.recall === 3;

    if (mastered) {
      const learned = new Set(progress.learned);
      learned.add(testedWord.word_id);
      progress.learned = [...learned];
      const nextWord = vocabulary[progress.introduced];
      if (nextWord) progress.introduced += 1;
      const nextText = nextWord
        ? " Nyt ord føjet til sættet: " + nextWord.danish + "."
        : "";
      const completedText = progress.learned.length === TOTAL_WORDS
        ? "Du kan nu alle 21 ord."
        : "Ordet er lært." + nextText;
      setFeedback(completedText, "learned");
    } else {
      setFeedback("Rigtigt. " + MODE_NAMES[testedMode] + ": " + streak[testedMode] +
        "/3 i træk for dette ord.", "success");
    }
  } else {
    streak[testedMode] = 0;
    answerLocked = true;
    const clue = [testedWord.target, testedWord.reading].filter(Boolean).join(" · ");
    setFeedback("Ikke helt. " + clue + " betyder " + testedWord.danish +
      ". " + MODE_NAMES[testedMode] + "-streaken starter forfra.", "error");
  }

  saveProgress();
  const alternateMode = mode === "recognition" ? "recall" : "recognition";
  if (!readyWords(mode).length && readyWords(alternateMode).length) {
    mode = alternateMode;
  }
  render();

  clearTimeout(answerTimer);
  answerTimer = window.setTimeout(() => {
    answerLocked = false;
    question = null;
    render();
  }, 850);
}

function isAcceptedAnswer(word, answer) {
  const submitted = normalizeAnswer(answer, languageCode);
  if (!submitted) return false;
  const accepted = [word.target, word.reading, ...(word.accepted_answers || [])]
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
  const language = currentLanguage();
  const confirmed = window.confirm("Nulstille alle kort og streaks for " + language.label + "?");
  if (!confirmed) return;

  clearTimeout(answerTimer);
  answerLocked = false;
  question = null;
  mode = "recognition";
  progress = freshProgress();
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

changeLanguage(languageCode);

