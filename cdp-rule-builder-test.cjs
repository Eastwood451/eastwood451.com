const fs = require('fs');

const port = 9230;
const url = 'http://127.0.0.1:5186/calculus/index.html';

async function getJson(endpoint) {
    const res = await fetch(`http://127.0.0.1:${port}${endpoint}`);
    if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`);
    return res.json();
}

async function connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    let id = 0;

    ws.addEventListener('message', event => {
        const msg = JSON.parse(event.data);
        if (!msg.id || !pending.has(msg.id)) return;
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
    });

    await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve, { once: true });
        ws.addEventListener('error', reject, { once: true });
    });

    function send(method, params = {}) {
        const callId = ++id;
        ws.send(JSON.stringify({ id: callId, method, params }));
        return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
    }

    return { send, close: () => ws.close() };
}

async function main() {
    console.error('fetch-targets');
    const targets = await getJson('/json/list');
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    if (!pageTarget) throw new Error('No Chrome page target found');

    console.error('connect');
    const cdp = await connect(pageTarget.webSocketDebuggerUrl);
    const send = cdp.send;

    async function evaluate(expression) {
        const result = await send('Runtime.evaluate', {
            expression,
            awaitPromise: true,
            returnByValue: true
        });
        if (result.exceptionDetails) {
            throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        }
        return result.result.value;
    }

    console.error('enable');
    await send('Runtime.enable');
    await send('Page.enable');
    console.error('navigate');
    await send('Page.navigate', { url });
    await new Promise(resolve => setTimeout(resolve, 1800));

    console.error('initial');
    const initial = await evaluate(`({
        url: location.href,
        title: document.title,
        hasRuleCard: !!document.querySelector('[data-mode="rule-builder"]'),
        cards: [...document.querySelectorAll('.menu-card-title')].map(e => e.textContent.trim())
    })`);

    console.error('click-card');
    await evaluate(`document.querySelector('[data-mode="rule-builder"]').click()`);
    await new Promise(resolve => setTimeout(resolve, 900));

    console.error('after-open');
    const afterOpen = await evaluate(`({
        mode: window.gameMode,
        prompt: document.querySelector('#step-prompt')?.textContent,
        problem: document.querySelector('#problem-integral')?.textContent,
        rules: [...document.querySelectorAll('.rule-choice-btn')].map(e => e.textContent.trim()),
        buttonDisabled: document.querySelector('#continue-btn').disabled
    })`);

    console.error('choose-rule');
    const correctRule = await evaluate(`ruleBuilderState.problems[ruleBuilderState.currentProblem].correctRule`);
    await evaluate(`document.querySelector('.rule-choice-btn[data-rule="${correctRule}"]').click()`);
    await evaluate(`document.querySelector('#continue-btn').click()`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    console.error('skeleton-ready');
    const skeletonReady = await evaluate(`({
        phase: ruleBuilderState.phase,
        prompt: document.querySelector('#step-prompt')?.textContent,
        slots: [...document.querySelectorAll('.skeleton-slot')].map(e => e.dataset.slot),
        tiles: [...document.querySelectorAll('.math-tile')].map(e => e.dataset.value),
        feedback: document.querySelector('#feedback-title')?.textContent
    })`);

    console.error('fill-slots');
    await evaluate(`(() => {
        const problem = ruleBuilderState.problems[ruleBuilderState.currentProblem];
        for (const slot of problem.skeleton.slots) {
            if (!slot.fixed) setRuleBuilderSlot(slot.id, slot.correct);
        }
        document.querySelector('#continue-btn').click();
    })()`);
    await new Promise(resolve => setTimeout(resolve, 650));

    console.error('after-check');
    const afterCheck = await evaluate(`({
        phase: ruleBuilderState.phase,
        feedbackTitle: document.querySelector('#feedback-title')?.textContent,
        feedbackText: document.querySelector('#feedback-explanation')?.textContent,
        xp: ruleBuilderState.xp,
        streak: ruleBuilderState.streak,
        correctSlots: document.querySelectorAll('.skeleton-slot.correct').length,
        incorrectSlots: document.querySelectorAll('.skeleton-slot.incorrect').length
    })`);

    console.error('screenshot');
    try {
        const screenshot = await Promise.race([
            send('Page.captureScreenshot', {
                format: 'png',
                captureBeyondViewport: false
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('screenshot timeout')), 3000))
        ]);
        fs.writeFileSync('rule-builder-test.png', Buffer.from(screenshot.data, 'base64'));
    } catch (err) {
        console.error(`screenshot skipped: ${err.message}`);
    }

    cdp.close();
    console.log(JSON.stringify({ initial, afterOpen, correctRule, skeletonReady, afterCheck }, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
