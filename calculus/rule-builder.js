// ===== RULE BUILDER MODE =====
// A Dragonbox-inspired exercise: choose the right rule skeleton, then place parts.

const RULE_BUILDER_PROBLEMS = [
    {
        label: "Differentier funktionen",
        expression: "\\frac{d}{dx}\\left[\\sin(x^2)\\right]",
        prompt: "Vælg reglen, og byg kædereglen.",
        correctRule: "chain",
        rules: ["chain", "product", "quotient", "substitution"],
        elements: {
            title: "Identificer grundelementerne",
            slots: [
                { id: "f_u", label: "f(u)", correct: "\\sin(u)" },
                { id: "g_x", label: "g(x)", correct: "x^2" },
                { id: "fprime_u", label: "f'(u)", correct: "\\cos(u)" },
                { id: "gprime_x", label: "g'(x)", correct: "2x" }
            ],
            tiles: ["\\sin(u)", "x^2", "\\cos(u)", "2x", "\\cos(x^2)", "\\sin(x)"]
        },
        skeleton: {
            title: "Kædereglen",
            formula: "\\frac{d}{dx} f(g(x)) =",
            slots: [
                { id: "outerDerivative", label: "f'(g(x))", correct: "\\cos(x^2)" },
                { id: "times", label: "\\cdot", fixed: true },
                { id: "innerDerivative", label: "g'(x)", correct: "2x" },
                { id: "equals", label: "=", fixed: true },
                { id: "result", label: "resultat", correct: "2x\\cos(x^2)" }
            ],
            tiles: ["\\cos(x^2)", "2x", "2x\\cos(x^2)", "\\sin(x^2)", "x^2", "\\cos(x)"]
        },
        explanation: "Kædereglen passer, fordi \\sin(x^2) er en ydre funktion med en indre funktion x^2."
    },
    {
        label: "Differentier funktionen",
        expression: "\\frac{d}{dx}\\left[x^2 e^x\\right]",
        prompt: "Vælg reglen, og placer faktorerne i produktreglen.",
        correctRule: "product",
        rules: ["product", "chain", "quotient", "power"],
        elements: {
            title: "Identificer grundelementerne",
            slots: [
                { id: "f", label: "f(x)", correct: "x^2" },
                { id: "g", label: "g(x)", correct: "e^x" },
                { id: "fprime", label: "f'(x)", correct: "2x" },
                { id: "gprime", label: "g'(x)", correct: "e^x" }
            ],
            tiles: ["x^2", "e^x", "2x", "x^3", "e^{2x}", "2xe^x"]
        },
        skeleton: {
            title: "Produktreglen",
            formula: "(f\\cdot g)' =",
            slots: [
                { id: "fprime", label: "f'", correct: "2x" },
                { id: "g1", label: "g", correct: "e^x" },
                { id: "plus", label: "+", fixed: true },
                { id: "f1", label: "f", correct: "x^2" },
                { id: "gprime", label: "g'", correct: "e^x" },
                { id: "equals", label: "=", fixed: true },
                { id: "result", label: "resultat", correct: "2xe^x+x^2e^x" }
            ],
            tiles: ["2x", "e^x", "x^2", "2xe^x+x^2e^x", "2xe^x", "x^2e^x"]
        },
        explanation: "Produktreglen passer, fordi funktionen er et produkt af x^2 og e^x."
    },
    {
        label: "Integrer funktionen",
        expression: "\\int 2x\\cos(x^2)\\,dx",
        prompt: "Vælg reglen, og byg substitutionen.",
        correctRule: "substitution",
        rules: ["substitution", "chain", "product", "power"],
        elements: {
            title: "Identificer grundelementerne",
            slots: [
                { id: "u", label: "u", correct: "x^2" },
                { id: "du", label: "du", correct: "2x\\,dx" },
                { id: "fu", label: "f(u)", correct: "\\cos(u)" }
            ],
            tiles: ["x^2", "2x\\,dx", "\\cos(u)", "2x", "\\sin(x^2)", "2x\\cos(x^2)"]
        },
        skeleton: {
            title: "Substitution",
            formula: "\\int f(g(x))g'(x)\\,dx \\Rightarrow",
            slots: [
                { id: "u", label: "u", correct: "x^2" },
                { id: "du", label: "du", correct: "2x\\,dx" },
                { id: "outer", label: "f(u)", correct: "\\cos(u)" },
                { id: "primitive", label: "\\int f(u)du", correct: "\\sin(u)+C" },
                { id: "result", label: "tilbage i x", correct: "\\sin(x^2)+C" }
            ],
            tiles: ["x^2", "2x\\,dx", "\\cos(u)", "\\sin(u)+C", "\\sin(x^2)+C", "\\cos(x^2)+C"]
        },
        explanation: "Substitution passer, fordi den afledte af x^2 er 2x, som allerede ligger i integralet."
    },
    {
        label: "Differentier funktionen",
        expression: "\\frac{d}{dx}\\left[(3x+1)^4\\right]",
        prompt: "Vælg reglen, og fyld kædereglens byggesten.",
        correctRule: "chain",
        rules: ["chain", "power", "product", "substitution"],
        elements: {
            title: "Identificer grundelementerne",
            slots: [
                { id: "f_u", label: "f(u)", correct: "u^4" },
                { id: "g_x", label: "g(x)", correct: "3x+1" },
                { id: "fprime_u", label: "f'(u)", correct: "4u^3" },
                { id: "gprime_x", label: "g'(x)", correct: "3" }
            ],
            tiles: ["u^4", "3x+1", "4u^3", "3", "(3x+1)^3", "12(3x+1)^3"]
        },
        skeleton: {
            title: "Kædereglen med potens",
            formula: "\\frac{d}{dx}(g(x))^n =",
            slots: [
                { id: "outerDerivative", label: "n(g(x))^{n-1}", correct: "4(3x+1)^3" },
                { id: "times", label: "\\cdot", fixed: true },
                { id: "innerDerivative", label: "g'(x)", correct: "3" },
                { id: "equals", label: "=", fixed: true },
                { id: "result", label: "resultat", correct: "12(3x+1)^3" }
            ],
            tiles: ["4(3x+1)^3", "3", "12(3x+1)^3", "(3x+1)^4", "4(3x+1)^4", "3x+1"]
        },
        explanation: "Det er stadig kædereglen: potensen er den ydre funktion, og 3x+1 er den indre."
    },
    {
        label: "Differentier funktionen",
        expression: "\\frac{d}{dx}\\left[\\frac{x^2+1}{x}\\right]",
        prompt: "Vælg reglen, og byg kvotientreglen.",
        correctRule: "quotient",
        rules: ["quotient", "product", "chain", "power"],
        elements: {
            title: "Identificer grundelementerne",
            slots: [
                { id: "f", label: "f(x)", correct: "x^2+1" },
                { id: "g", label: "g(x)", correct: "x" },
                { id: "fprime", label: "f'(x)", correct: "2x" },
                { id: "gprime", label: "g'(x)", correct: "1" }
            ],
            tiles: ["x^2+1", "x", "2x", "1", "2x\\cdot x", "x^2"]
        },
        skeleton: {
            title: "Kvotientreglen",
            formula: "\\left(\\frac{f}{g}\\right)' =",
            slots: [
                { id: "topLeft", label: "f'g", correct: "2x\\cdot x" },
                { id: "minus", label: "-", fixed: true },
                { id: "topRight", label: "fg'", correct: "(x^2+1)\\cdot 1" },
                { id: "over", label: "\\over", fixed: true },
                { id: "bottom", label: "g^2", correct: "x^2" },
                { id: "equals", label: "=", fixed: true },
                { id: "result", label: "resultat", correct: "\\frac{x^2-1}{x^2}" }
            ],
            tiles: ["2x\\cdot x", "(x^2+1)\\cdot 1", "x^2", "\\frac{x^2-1}{x^2}", "2x", "x^2+1"]
        },
        explanation: "Kvotientreglen passer, fordi funktionen er skrevet som en brøk med tæller og nævner."
    }
];

const RULE_LABELS = {
    chain: "Kædereglen",
    substitution: "Substitution",
    product: "Produktreglen",
    quotient: "Kvotientreglen",
    power: "Potensreglen"
};

var ruleBuilderAutoAdvanceTimeout = null;

let ruleBuilderState = {
    problems: [],
    currentProblem: 0,
    xp: 0,
    streak: 0,
    maxStreak: 0,
    phase: "rule",
    selectedRule: null,
    selectedTile: null,
    placements: {}
};

function startRuleBuilder() {
    document.getElementById('formula-ref-btn').classList.add('hidden');
    ruleBuilderState.problems = shuffleArray([...RULE_BUILDER_PROBLEMS]);
    ruleBuilderState.currentProblem = 0;
    ruleBuilderState.xp = 0;
    ruleBuilderState.streak = 0;
    ruleBuilderState.maxStreak = 0;
    ruleBuilderState.phase = "rule";
    ruleBuilderState.selectedRule = null;
    ruleBuilderState.selectedTile = null;
    ruleBuilderState.placements = {};
    loadRuleBuilderProblem();
}

function loadRuleBuilderProblem() {
    if (ruleBuilderState.currentProblem >= ruleBuilderState.problems.length) {
        showRuleBuilderComplete();
        return;
    }

    hideFeedback();
    hideHint();
    hintBtn.classList.add('hidden');
    continueBtn.classList.remove('hidden');
    continueBtn.className = 'check';
    continueBtn.textContent = 'Tjek';
    continueBtn.disabled = true;

    const problem = getCurrentRuleBuilderProblem();
    ruleBuilderState.phase = "rule";
    ruleBuilderState.selectedRule = null;
    ruleBuilderState.selectedTile = null;
    ruleBuilderState.placements = {};

    document.getElementById('problem-label').textContent = problem.label;
    problemIntegral.innerHTML = `$$${problem.expression}$$`;
    typeset(problemIntegral);

    const graphContainer = document.getElementById('problem-graph');
    if (graphContainer) graphContainer.classList.add('hidden');

    updateRuleBuilderStats();
    renderRuleChoiceStep();
}

function getCurrentRuleBuilderProblem() {
    return ruleBuilderState.problems[ruleBuilderState.currentProblem];
}

function updateRuleBuilderStats() {
    heartsCount.textContent = '∞';
    xpCount.textContent = ruleBuilderState.xp;
    streakCount.textContent = ruleBuilderState.streak;
    const total = ruleBuilderState.problems.length || RULE_BUILDER_PROBLEMS.length;
    const pct = (ruleBuilderState.currentProblem / total) * 100;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `${Math.min(ruleBuilderState.currentProblem + 1, total)} / ${total}`;
}

function renderRuleChoiceStep() {
    const problem = getCurrentRuleBuilderProblem();
    stepPrompt.textContent = problem.prompt;
    choicesGrid.className = 'rule-builder-grid';
    choicesGrid.innerHTML = '';

    const intro = document.createElement('div');
    intro.className = 'rule-builder-note';
    intro.textContent = 'Start med at vælge det skelet, der passer til udtrykket.';
    choicesGrid.appendChild(intro);

    const ruleGrid = document.createElement('div');
    ruleGrid.className = 'rule-choice-grid';
    problem.rules.forEach(rule => {
        const btn = document.createElement('button');
        btn.className = 'rule-choice-btn';
        btn.textContent = RULE_LABELS[rule] || rule;
        btn.dataset.rule = rule;
        btn.addEventListener('click', () => selectRuleSkeleton(btn, rule));
        ruleGrid.appendChild(btn);
    });
    choicesGrid.appendChild(ruleGrid);
}

function selectRuleSkeleton(btn, rule) {
    if (ruleBuilderState.phase !== "rule") return;
    choicesGrid.querySelectorAll('.rule-choice-btn').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    ruleBuilderState.selectedRule = rule;
    continueBtn.disabled = false;
}

function renderSkeletonStep() {
    const problem = getCurrentRuleBuilderProblem();
    const skeleton = problem.skeleton;
    ruleBuilderState.phase = "slots";
    ruleBuilderState.selectedTile = null;
    ruleBuilderState.placements = {};

    hideFeedback();
    continueBtn.className = 'check';
    continueBtn.textContent = 'Tjek';
    continueBtn.disabled = true;
    stepPrompt.textContent = `Fyld skelettet: ${skeleton.title}`;
    choicesGrid.className = 'rule-builder-grid';
    choicesGrid.innerHTML = '';

    const board = document.createElement('div');
    board.className = 'skeleton-board';

    const formula = document.createElement('div');
    formula.className = 'skeleton-formula';
    formula.innerHTML = `$${skeleton.formula}$`;
    board.appendChild(formula);

    const slots = document.createElement('div');
    slots.className = 'skeleton-slots';
    skeleton.slots.forEach(slot => {
        if (slot.fixed) {
            const fixed = document.createElement('div');
            fixed.className = 'skeleton-fixed';
            fixed.innerHTML = `$${slot.label}$`;
            slots.appendChild(fixed);
            return;
        }

        const drop = document.createElement('button');
        drop.className = 'skeleton-slot';
        drop.dataset.slot = slot.id;
        drop.innerHTML = `<span class="slot-label">${slot.label}</span>`;
        drop.addEventListener('click', () => placeSelectedTile(slot.id));
        drop.addEventListener('dragover', onRuleBuilderDragOver);
        drop.addEventListener('drop', (e) => onRuleBuilderDrop(e, slot.id));
        slots.appendChild(drop);
    });
    board.appendChild(slots);
    choicesGrid.appendChild(board);

    const tileBank = document.createElement('div');
    tileBank.className = 'tile-bank';
    shuffleArray([...skeleton.tiles]).forEach(tile => {
        const btn = document.createElement('button');
        btn.className = 'math-tile';
        btn.draggable = true;
        btn.dataset.value = tile;
        btn.innerHTML = `$${tile}$`;
        btn.addEventListener('click', () => selectMathTile(btn, tile));
        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tile);
            ruleBuilderState.selectedTile = tile;
        });
        tileBank.appendChild(btn);
    });
    choicesGrid.appendChild(tileBank);

    const footer = document.createElement('div');
    footer.className = 'rule-builder-note';
    footer.textContent = 'Tip: klik på en brik og derefter på en tom plads, eller træk brikken op.';
    choicesGrid.appendChild(footer);

    typeset(choicesGrid);
}

function selectMathTile(btn, tile) {
    if (ruleBuilderState.phase !== "slots" && ruleBuilderState.phase !== "elements") return;
    choicesGrid.querySelectorAll('.math-tile').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    ruleBuilderState.selectedTile = tile;
}

function placeSelectedTile(slotId) {
    if (!ruleBuilderState.selectedTile) return;
    setRuleBuilderSlot(slotId, ruleBuilderState.selectedTile);
}

function onRuleBuilderDragOver(e) {
    e.preventDefault();
}

function onRuleBuilderDrop(e, slotId) {
    e.preventDefault();
    const value = e.dataTransfer.getData('text/plain') || ruleBuilderState.selectedTile;
    if (value) setRuleBuilderSlot(slotId, value);
}

function setRuleBuilderSlot(slotId, value) {
    ruleBuilderState.placements[slotId] = value;
    const slotEl = choicesGrid.querySelector(`[data-slot="${slotId}"]`);
    if (!slotEl) return;
    slotEl.classList.add('filled');
    slotEl.classList.remove('correct', 'incorrect');
    slotEl.innerHTML = `$${value}$`;
    typeset(slotEl);
    updateRuleBuilderCheckState();
}

function updateRuleBuilderCheckState() {
    if (ruleBuilderState.phase === "slots") {
        const skeleton = getCurrentRuleBuilderProblem().skeleton;
        const requiredSlots = skeleton.slots.filter(slot => !slot.fixed);
        continueBtn.disabled = requiredSlots.some(slot => !ruleBuilderState.placements[slot.id]);
    } else if (ruleBuilderState.phase === "elements") {
        const elements = getCurrentRuleBuilderProblem().elements;
        continueBtn.disabled = elements.slots.some(slot => !ruleBuilderState.placements[slot.id]);
    }
}

function onRuleBuilderContinue() {
    if (ruleBuilderState.phase === "rule") {
        checkRuleSkeletonChoice();
        return;
    }
    if (ruleBuilderState.phase === "elements") {
        checkRuleBuilderElements();
        return;
    }
    if (ruleBuilderState.phase === "slots") {
        checkRuleBuilderSlots();
        return;
    }
    if (ruleBuilderState.phase === "feedback") {
        if (ruleBuilderAutoAdvanceTimeout) {
            clearTimeout(ruleBuilderAutoAdvanceTimeout);
            ruleBuilderAutoAdvanceTimeout = null;
        }
        advanceRuleBuilderProblem();
    }
}

function checkRuleSkeletonChoice() {
    const problem = getCurrentRuleBuilderProblem();
    const isCorrect = ruleBuilderState.selectedRule === problem.correctRule;

    if (isCorrect) {
        showFeedback(true, 'Korrekt skelet!', `${problem.explanation}<br><br>Nu skal du identificere grundelementerne.`);
        continueBtn.className = 'next-correct';
        continueBtn.textContent = 'Identificer elementer';
        continueBtn.disabled = true;
        ruleBuilderState.phase = "feedback-rule";
        setTimeout(renderElementsStep, 800);
        return;
    }

    ruleBuilderState.streak = 0;
    showFeedback(false, 'Ikke det skelet', `Prøv at kigge efter strukturen: er det en sammensat funktion, et produkt, en brøk eller et integral med en indre afledt?`);
    shakeHearts();
    continueBtn.className = 'next-incorrect';
    continueBtn.textContent = 'Prøv igen';
    continueBtn.disabled = false;
    choicesGrid.querySelectorAll('.rule-choice-btn').forEach(btn => {
        if (btn.dataset.rule === ruleBuilderState.selectedRule) btn.classList.add('incorrect');
    });
    ruleBuilderState.selectedRule = null;
    setTimeout(() => {
        ruleBuilderState.phase = "rule";
        continueBtn.className = 'check';
        continueBtn.textContent = 'Tjek';
        continueBtn.disabled = true;
        choicesGrid.querySelectorAll('.rule-choice-btn').forEach(btn => btn.classList.remove('selected', 'incorrect'));
    }, 900);
    updateRuleBuilderStats();
}

function renderElementsStep() {
    const problem = getCurrentRuleBuilderProblem();
    const elements = problem.elements;
    ruleBuilderState.phase = "elements";
    ruleBuilderState.selectedTile = null;
    ruleBuilderState.placements = {};

    hideFeedback();
    continueBtn.className = 'check';
    continueBtn.textContent = 'Tjek';
    continueBtn.disabled = true;
    stepPrompt.textContent = elements.title;
    choicesGrid.className = 'rule-builder-grid';
    choicesGrid.innerHTML = '';

    const board = document.createElement('div');
    board.className = 'elements-board';

    const grid = document.createElement('div');
    grid.className = 'elements-grid';
    elements.slots.forEach(slot => {
        const row = document.createElement('div');
        row.className = 'elements-row';

        const label = document.createElement('div');
        label.className = 'elements-label';
        label.innerHTML = `$${slot.label} = $`;
        row.appendChild(label);

        const drop = document.createElement('button');
        drop.className = 'skeleton-slot element-slot';
        drop.dataset.slot = slot.id;
        drop.innerHTML = `<span class="slot-label">?</span>`;
        drop.addEventListener('click', () => placeSelectedTile(slot.id));
        drop.addEventListener('dragover', onRuleBuilderDragOver);
        drop.addEventListener('drop', (e) => onRuleBuilderDrop(e, slot.id));
        row.appendChild(drop);

        grid.appendChild(row);
    });
    board.appendChild(grid);
    choicesGrid.appendChild(board);

    const tileBank = document.createElement('div');
    tileBank.className = 'tile-bank';
    shuffleArray([...elements.tiles]).forEach(tile => {
        const btn = document.createElement('button');
        btn.className = 'math-tile';
        btn.draggable = true;
        btn.dataset.value = tile;
        btn.innerHTML = `$${tile}$`;
        btn.addEventListener('click', () => selectMathTile(btn, tile));
        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tile);
            ruleBuilderState.selectedTile = tile;
        });
        tileBank.appendChild(btn);
    });
    choicesGrid.appendChild(tileBank);

    const footer = document.createElement('div');
    footer.className = 'rule-builder-note';
    footer.textContent = 'Tip: klik på en brik og derefter på en tom plads, eller træk brikken op.';
    choicesGrid.appendChild(footer);

    typeset(choicesGrid);
}

function checkRuleBuilderElements() {
    const problem = getCurrentRuleBuilderProblem();
    const elements = problem.elements;
    let allCorrect = true;

    elements.slots.forEach(slot => {
        const placed = ruleBuilderState.placements[slot.id];
        const slotEl = choicesGrid.querySelector(`[data-slot="${slot.id}"]`);
        const isCorrect = placed === slot.correct;
        if (!isCorrect) allCorrect = false;
        if (slotEl) slotEl.classList.add(isCorrect ? 'correct' : 'incorrect');
    });

    if (allCorrect) {
        showFeedback(true, 'Grundelementer fundet!', 'Flot! Nu skal du placere dem i det endelige formel-skelet.');
        continueBtn.className = 'next-correct';
        continueBtn.textContent = 'Byg formel';
        continueBtn.disabled = true;
        ruleBuilderState.phase = "feedback-elements";
        setTimeout(renderSkeletonStep, 800);
    } else {
        showFeedback(false, 'Næsten', 'Nogle af grundelementerne er ikke korrekte. Ret dem og prøv igen.');
        shakeHearts();
        continueBtn.className = 'next-incorrect';
        continueBtn.textContent = 'Ret felter';
        ruleBuilderState.phase = "elements";
        setTimeout(() => {
            choicesGrid.querySelectorAll('.skeleton-slot').forEach(slot => slot.classList.remove('correct', 'incorrect'));
            continueBtn.className = 'check';
            continueBtn.textContent = 'Tjek';
            updateRuleBuilderCheckState();
        }, 1000);
    }
}

function checkRuleBuilderSlots() {
    const problem = getCurrentRuleBuilderProblem();
    const skeleton = problem.skeleton;
    const requiredSlots = skeleton.slots.filter(slot => !slot.fixed);
    let allCorrect = true;

    requiredSlots.forEach(slot => {
        const placed = ruleBuilderState.placements[slot.id];
        const slotEl = choicesGrid.querySelector(`[data-slot="${slot.id}"]`);
        const isCorrect = placed === slot.correct;
        if (!isCorrect) allCorrect = false;
        if (slotEl) slotEl.classList.add(isCorrect ? 'correct' : 'incorrect');
    });

    ruleBuilderState.phase = "feedback";
    if (allCorrect) {
        const streakBonus = Math.min(ruleBuilderState.streak, 5);
        const xpGain = 20 + streakBonus * 2;
        ruleBuilderState.xp += xpGain;
        ruleBuilderState.streak++;
        ruleBuilderState.maxStreak = Math.max(ruleBuilderState.maxStreak, ruleBuilderState.streak);
        showFeedback(true, 'Skelettet holder!', `Alle dele sidder rigtigt.<br><br>${problem.explanation}`);
        showXpPop(`+${xpGain} XP`);
        continueBtn.className = 'next-correct';
        continueBtn.textContent = 'Fortsæt';
        ruleBuilderAutoAdvanceTimeout = setTimeout(() => {
            ruleBuilderAutoAdvanceTimeout = null;
            advanceRuleBuilderProblem();
        }, 800);
    } else {
        ruleBuilderState.streak = 0;
        showFeedback(false, 'Næsten', 'De røde felter passer ikke til rollen i skelettet. Flyt brikkerne og prøv igen.');
        shakeHearts();
        continueBtn.className = 'next-incorrect';
        continueBtn.textContent = 'Ret felter';
        ruleBuilderState.phase = "slots";
        setTimeout(() => {
            choicesGrid.querySelectorAll('.skeleton-slot').forEach(slot => slot.classList.remove('correct', 'incorrect'));
            continueBtn.className = 'check';
            continueBtn.textContent = 'Tjek';
            updateRuleBuilderCheckState();
        }, 1000);
    }
    updateRuleBuilderStats();
}

function advanceRuleBuilderProblem() {
    ruleBuilderState.currentProblem++;
    loadRuleBuilderProblem();
}

function showRuleBuilderComplete() {
    overlayIcon.textContent = '🏆';
    overlayTitle.textContent = 'Regelbygger klaret!';
    overlayMessage.innerHTML = `Flot bygget! Du fik <strong>${ruleBuilderState.xp} XP</strong> med en max streak på ${ruleBuilderState.maxStreak}.`;
    overlayBtn.textContent = 'Spil igen';
    overlayBtn.dataset.action = 'restart-rule-builder';
    overlay.classList.remove('hidden');

    progressFill.style.width = '100%';
    progressLabel.textContent = `${ruleBuilderState.problems.length} / ${ruleBuilderState.problems.length}`;
}

function onRuleBuilderOverlayAction() {
    document.getElementById('overlay').classList.add('hidden');
    startRuleBuilder();
}
