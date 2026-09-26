import { getSupabaseClient } from "/supabase-client.js";
import { DANISH_WORDS, LANGUAGES, fallbackRows } from "./vocabulary.js";

const TOTAL_WORDS = DANISH_WORDS.length;
const VOCABULARY_TIMEOUT_MS = 10000;
const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_DAYS = [1, 3, 7, 14, 30];
const STORAGE_PREFIX = "eastwood451:flashcards:v1:";
const LANGUAGE_STORAGE_KEY = STORAGE_PREFIX + "language";
const MODE_NAMES = {
  recognition: "Genkendelse",
  recall: "Genkaldelse"
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
const multipleChoiceButton = document.querySelector("#multiple-choice-button");
const typingButton = document.querySelector("#typing-button");
const modeStep = document.querySelector("#mode-step");
const resetButton = document.querySelector("#reset-progress");

let languageCode = readStorage(LANGUAGE_STORAGE_KEY) || LANGUAGES[0].code;
let vocabulary = [];
let progress = freshProgress();
let mode = "recognition";
let answerMethod = "multiple-choice";
let question = null;
let revealedHintIndices = new Set();
let hintMode = "first";
let answerLocked = false;
let answerTimer = null;
let loadSequence = 0;
let feedbackState = { text: "", kind: "" };
let reviewSlots = [];
let forceReview = false;

languageSelect.innerHTML = LANGUAGES.map((language) =>
  '<option value="' + escapeHtml(language.code) + '">' +
    escapeHtml(language.label + " · " + language.native) +
  "</option>"
).join("");
languageSelect.value = languageCode;

languageSelect.addEventListener("change", () => {
  changeLanguage(languageSelect.value);
});

multipleChoiceButton.addEventListener("click", () => setAnswerMethod("multiple-choice"));
typingButton.addEventListener("click", () => setAnswerMethod("typing"));
resetButton.addEventListener("click", resetLanguage);

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

async function changeLanguage(code) {
  const sequence = ++loadSequence;
  languageCode = LANGUAGES.some((language) => language.code === code) ? code : LANGUAGES[0].code;
  languageSelect.value = languageCode;
  writeLanguagePreference();
  clearTimeout(answerTimer);
  answerLocked = false;
  question = null;
  revealedHintIndices = new Set();
  mode = "recognition";
  reviewSlots = [];
  forceReview = false;
  feedbackState = { text: "", kind: "" };
  vocabulary = [];
  progress = loadProgress(languageCode);
  dataSource.dataset.source = "";
  dataSource.textContent = "Henter ordliste …";
  quiz.innerHTML = '<p class="loading">Gør ordkortene klar …</p>';
  renderProgress();

  const result = await getVocabularyWithTimeout(languageCode);
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
  if (!vocabulary.length) return;
  renderProgress();
  renderActiveWords();
  renderAnswerMethodToggle();
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
    : "Alle ord lært · repetition";
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

function renderAnswerMethodToggle() {
  multipleChoiceButton.setAttribute("aria-pressed", String(answerMethod === "multiple-choice"));
  typingButton.setAttribute("aria-pressed", String(answerMethod === "typing"));
}

function renderQuiz() {
  const active = getActiveWords();
  if (!question || !vocabulary.some((word) => word.word_id === question.word_id)) {
    question = nextQuestion();
    revealedHintIndices = new Set();
  }
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

  const questionLabel = (reviewing ? "Repetition · " : "") + (mode === "recognition"
    ? "Genkendelse · find det danske svar, der passer til " + language.label.toLowerCase() + "."
    : "Genkaldelse · find ordet på " + language.label.toLowerCase() + ", der svarer til det danske ord.");
  const promptWord = mode === "recognition"
    ? '<span class="question-roman" lang="und-Latn" dir="ltr">' + escapeHtml(question.reading) + "</span>" +
      '<span class="question-target" lang="' + escapeHtml(language.code) + '" dir="' + escapeHtml(targetDirection) + '">' +
      escapeHtml(question.target) + "</span>"
    : '<span class="question-danish" lang="da" dir="ltr">' + escapeHtml(question.danish) + "</span>";

  quiz.innerHTML = '<div class="question-card">' +
    '<p class="question-label">' + escapeHtml(questionLabel) + "</p>" +
    '<p class="question-word">' + promptWord +
    "</p>" +
  "</div>";

  if (answerMethod === "multiple-choice") {
    const otherWords = shuffle(vocabulary.slice(0, progress.introduced)
      .filter((word) => word.word_id !== question.word_id)).slice(0, 2);
    const answers = shuffle([question, ...otherWords]);
    const answerGrid = document.createElement("div");
    answerGrid.className = "answer-grid";
    answerGrid.setAttribute("role", "group");
    answerGrid.setAttribute("aria-label", mode === "recognition"
      ? "Vælg den danske oversættelse"
      : "Vælg ordet på " + language.label.toLowerCase());

    answers.forEach((word) => {
      const button = document.createElement("button");
      button.className = "answer-choice";
      button.type = "button";
      button.disabled = answerLocked;
      button.addEventListener("click", () => submitAnswer(word.word_id));
      if (mode === "recognition") {
        button.textContent = word.danish;
      } else {
        if (word.reading) {
          const pronunciation = document.createElement("span");
          pronunciation.className = "answer-reading";
          pronunciation.textContent = word.reading;
          pronunciation.lang = "und-Latn";
          pronunciation.dir = "ltr";
          button.append(pronunciation);
        }
        const target = document.createElement("span");
        target.className = "answer-target";
        target.textContent = word.target;
        target.lang = language.code;
        target.dir = targetDirection;
        button.append(target);
      }
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
  const hintText = mode === "recall" ? (question.reading || question.target) : question.danish;
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
  feedback.textContent = feedbackState.text;
  feedback.dataset.kind = feedbackState.kind;
}

function setFeedback(text, kind) {
  feedbackState = { text, kind };
  renderFeedback();
}

function submitAnswer(answer, isTyped = false) {
  if (answerLocked || !question) return;

  const testedMode = mode;
  const testedWord = question;
  const correct = isTyped
    ? testedMode === "recognition"
      ? normalizeAnswer(answer, "da") === normalizeAnswer(testedWord.danish, "da")
      : isAcceptedAnswer(testedWord, answer)
    : answer === testedWord.word_id;
  const reviewing = progress.learned.includes(testedWord.word_id);
  const rawReading = String(testedWord.reading || "").trim();
  const displayReading = rawReading
    ? rawReading.charAt(0).toLocaleUpperCase() + rawReading.slice(1)
    : "";
  const incorrectFeedback = displayReading
    ? displayReading + " betyder " + testedWord.danish + ". Ordet kommer snart igen"
    : testedWord.danish + ". Ordet kommer snart igen";
  progress.answered += 1;
  answerLocked = true;

  if (reviewing) {
    const review = getReview(testedWord.word_id);
    review.lastReviewed = progress.answered;
    if (correct) {
      review.failures = 0;
      if (revealedHintIndices.size > 0) {
        review.dueQuestion = progress.answered + 6;
        review.dueAt = Date.now() + DAY_MS;
        setFeedback("Rigtigt med hint. Ordet kommer snart igen.", "success");
      } else {
        review.level = Math.min(4, review.level + 1);
        review.weakness[testedMode] = Math.max(0, review.weakness[testedMode] - 1);
        scheduleReview(review);
        setFeedback("Rigtigt. Ordet er planlagt til en senere repetition.", "success");
      }
    } else {
      review.level = Math.max(0, review.level - 2);
      review.failures = Math.min(9, review.failures + 1);
      review.weakness[testedMode] = Math.min(5, review.weakness[testedMode] + 1);
      review.dueQuestion = progress.answered + Math.max(2, 6 - 2 * review.failures);
      review.dueAt = Date.now() + DAY_MS;
      setFeedback(incorrectFeedback, "error");
    }
  } else {
    const streak = getStreak(testedWord.word_id);
    if (correct) {
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
        const nextText = nextWord
          ? " Nyt ord føjet til sættet: " + nextWord.danish + "."
          : "";
        const completedText = progress.learned.length === TOTAL_WORDS
          ? "Du kan nu alle " + TOTAL_WORDS + " ord. Repetition fortsætter."
          : "Ordet er lært." + nextText;
        setFeedback(completedText, "learned");
      } else {
        setFeedback("Rigtigt. " + MODE_NAMES[testedMode] + ": " + streak[testedMode] +
          "/3 i træk for dette ord.", "success");
      }
    } else {
      streak[testedMode] = 0;
      setFeedback(incorrectFeedback, "error");
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
  revealedHintIndices = new Set();
  mode = "recognition";
  reviewSlots = [];
  forceReview = false;
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

