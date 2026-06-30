// ai-assistant.js - shared suite chat with full-suite context collection

const isTopWindow = (window === window.parent);

const STORAGE_KEY = 'smfi_suite_ai_messages';
const EXPECTED_APPS = [
    'Dimensionsvisualisering',
    'Mindmap & Braindump',
    'Motivations-matrice',
    'Proposition-tester',
    'SMFI Nested Actor',
    'Belief-map'
];

function formatMarkdown(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function sanitizeHistory(history) {
    const sanitized = [];
    let lastRole = null;
    history.forEach((item) => {
        if (item.role !== lastRole) {
            sanitized.push(item);
            lastRole = item.role;
        }
    });
    return sanitized;
}

if (isTopWindow) {
    function initAiAssistantUI() {
        const assistantDiv = document.getElementById('ai-assistant');
        const sendBtn = document.getElementById('ai-send-btn');
        const inputField = document.getElementById('ai-input-field');
        const messagesDiv = document.getElementById('ai-messages');
        let clearBtn = document.getElementById('ai-clear-btn');
        const suiteDataStore = {};
        const suiteStateStore = {};

        if (!assistantDiv || !sendBtn || !inputField || !messagesDiv) {
            console.error('AI Assistant DOM elements not found.');
            return;
        }

        if (!clearBtn && assistantDiv.querySelector('.chat-input-area')) {
            clearBtn = document.createElement('button');
            clearBtn.id = 'ai-clear-btn';
            clearBtn.className = 'ai-action-btn chat-send-btn';
            clearBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>';
            clearBtn.title = 'Ryd historik';
            clearBtn.style.background = '#ef4444';
            clearBtn.type = 'button';
            assistantDiv.querySelector('.chat-input-area').insertBefore(clearBtn, inputField);
        }

        const GOOGLE_API_KEY = ['AIzaSyCUR', 'PG6bTOj7ts', 'coXHAf-aQtT', '3Nm8vTDJM'].join('');
        const GEMINI_MODEL = 'gemini-2.5-flash';
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
        const chatApiContents = [];

        function getSystemPrompt() {
            const appNames = [
                ...new Set(
                    Object.values(suiteDataStore)
                        .map((entry) => entry.title || entry.app || 'App')
                )
            ];
            const contextData = JSON.stringify(suiteDataStore, null, 2);
            const stateData = JSON.stringify(suiteStateStore, null, 2);

            return `Du er SMFI Suite Assistenten - en overordnet AI-hjerne.
Svar altid pa dansk og brug markdown, nar det giver mening.

Du skal hele tiden forholde dig til hele suiten samlet, ikke kun den synlige app.
Hvis der findes data fra flere apps, skal du aktivt sammenholde dem.
Hvis noget er uklart eller mangler, skal du sige det eksplicit.

AKTUEL SUITE-KONTEKST
Apps med data: ${appNames.join(', ') || 'Ingen data endnu'}

SCRAPED APP-DATA
${contextData}

FORMEL APP-STATE FRA HELE SUITEN
${stateData}`;
        }

        function saveMessages() {
            try {
                const msgs = [];
                messagesDiv.querySelectorAll('.ai-message span.msg-text').forEach((el) => {
                    const parent = el.closest('.ai-message');
                    if (!parent || parent.classList.contains('typing') || parent.classList.contains('error-msg')) return;
                    const textContent = el.getAttribute('data-raw') || el.textContent;
                    if (textContent.includes('**Fejl:**')) return;
                    msgs.push({
                        author: parent.classList.contains('ai-user') ? 'user' : 'assistant',
                        text: textContent
                    });
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
            } catch (err) {
                console.warn('Could not save chat history:', err);
            }
        }

        function addMessage(author, text, save = true, isError = false) {
            const msg = document.createElement('div');
            msg.className = `ai-message ai-${author}`;
            if (isError) msg.classList.add('error-msg');

            const content = document.createElement('span');
            content.className = 'msg-text';
            content.setAttribute('data-raw', text);
            content.innerHTML = formatMarkdown(text);
            msg.appendChild(content);
            messagesDiv.appendChild(msg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            if (!isError && !text.includes('**Fejl:**')) {
                chatApiContents.push({
                    role: author === 'user' ? 'user' : 'model',
                    parts: [{ text }]
                });
            }

            if (save && !isError) saveMessages();
        }

        function loadMessages() {
            try {
                const savedStr = localStorage.getItem(STORAGE_KEY);
                if (!savedStr) return;
                if (savedStr.includes('gemini-2.0-flash is no longer available') || savedStr.includes('API fejl (404)')) {
                    localStorage.removeItem(STORAGE_KEY);
                    return;
                }
                const saved = JSON.parse(savedStr);
                if (Array.isArray(saved)) {
                    saved.forEach((m) => addMessage(m.author, m.text, false));
                }
            } catch (err) {
                console.error('Error loading chat history:', err);
            }
        }

        function clearChat() {
            if (!confirm('Er du sikker pa, du vil slette hele chathistorikken?')) return;
            localStorage.removeItem(STORAGE_KEY);
            chatApiContents.length = 0;
            messagesDiv.innerHTML = '';
            addMessage('assistant', 'Chat-historik ryddet. Hvordan kan jeg hjalpe dig nu?', false);
        }

        function collectFullSuiteState() {
            return new Promise((resolve) => {
                if (!window.bus) {
                    resolve({});
                    return;
                }

                const collected = {};
                const handlers = [];
                let done = false;

                const finish = () => {
                    if (done) return;
                    done = true;
                    handlers.forEach((handler) => window.bus.unsubscribe('state-response', handler));
                    resolve(collected);
                };

                EXPECTED_APPS.forEach((appName) => {
                    const handler = (data) => {
                        if (data && data.app === appName) {
                            collected[appName] = data.state;
                            if (Object.keys(collected).length >= EXPECTED_APPS.length) finish();
                        }
                    };
                    handlers.push(handler);
                    window.bus.subscribe('state-response', handler);
                });

                window.bus.publish('request-state', {});
                setTimeout(finish, 1400);
            });
        }

        function refreshScrapedContext(query) {
            return new Promise((resolve) => {
                if (!window.bus) {
                    resolve();
                    return;
                }
                window.bus.publish('ai-query', { query, source: 'suite-master' });
                setTimeout(resolve, 400);
            });
        }

        let isTyping = false;
        async function submitQuery(query) {
            const normalizedQuery = (query || '').trim();
            if (!normalizedQuery || isTyping) return;

            addMessage('user', normalizedQuery);
            isTyping = true;

            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'ai-message ai-assistant typing';
            loadingMsg.innerHTML = '<span class="msg-text">Taenker...</span>';
            messagesDiv.appendChild(loadingMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            try {
                await refreshScrapedContext(normalizedQuery);
                const latestState = await collectFullSuiteState();
                Object.keys(latestState).forEach((appName) => {
                    if (latestState[appName]) suiteStateStore[appName] = latestState[appName];
                });

                const response = await fetch(GEMINI_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: sanitizeHistory(chatApiContents),
                        systemInstruction: { parts: [{ text: getSystemPrompt() }] }
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(`API fejl (${response.status}): ${data.error?.message || 'Ukendt'}`);
                }

                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tomt svar.';
                if (loadingMsg.parentNode) messagesDiv.removeChild(loadingMsg);
                addMessage('assistant', aiText);
            } catch (err) {
                console.error('Chat error:', err);
                if (loadingMsg.parentNode) messagesDiv.removeChild(loadingMsg);
                addMessage('assistant', `**Fejl:** ${err.message}. Tjek konsollen for detaljer.`, false, true);
            } finally {
                isTyping = false;
            }
        }

        async function handleSend() {
            const query = inputField.value.trim();
            if (!query || isTyping) return;
            inputField.value = '';
            await submitQuery(query);
        }

        if (window.bus) {
            window.bus.subscribe('ai-app-data', ({ appData, source }) => {
                suiteDataStore[source] = appData;
            });
            window.bus.subscribe('ai-response', ({ response, source }) => {
                if (source !== 'suite-master') addMessage('assistant', response);
            });
            window.bus.subscribe('ai-reload-chat', () => {
                messagesDiv.innerHTML = '<div class="chat-welcome">Hej! Jeg er din overordnede SMFI Suite assistent. Jeg kan ledsage dig pa tvaers af alle dine apps. Sporg los!</div>';
                chatApiContents.length = 0;
                loadMessages();
            });
            window.bus.subscribe('ai-focus-analysis', async ({ query }) => {
                if (!query) return;
                await submitQuery(query);
            });
        }

        sendBtn.addEventListener('click', handleSend);
        if (clearBtn) clearBtn.addEventListener('click', clearChat);
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        loadMessages();
        console.log('AI Assistant Widget initialized.');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAiAssistantUI);
    else initAiAssistantUI();
}

if (!isTopWindow) {
    function scrapeAppData() {
        const data = { title: document.title, url: window.location.pathname, inputs: {}, content: [] };

        document.querySelectorAll('input[type="text"], textarea').forEach((el, i) => {
            const key = el.id || el.getAttribute('placeholder') || `input_${i}`;
            if (el.value && el.value.trim()) data.inputs[key] = el.value.trim();
        });

        document.querySelectorAll('.node-text, .note-text, .card-content, .group-title, text').forEach((el) => {
            if (el.textContent && el.textContent.trim()) data.content.push(el.textContent.trim());
        });

        document.querySelectorAll('.actor-name-input, .holon-box').forEach((el) => {
            if (el.value) data.content.push(el.value);
            if (el.textContent && !el.value) data.content.push(el.textContent.trim().replace(/\s+/g, ' '));
        });

        return data;
    }

    if (window.bus) {
        window.bus.subscribe('ai-query', async ({ query, source }) => {
            if (source === window.location.pathname) return;
            window.bus.publish('ai-app-data', {
                appData: scrapeAppData(),
                source: window.location.pathname,
                query
            });
        });

        setTimeout(() => {
            if (window.bus) {
                window.bus.publish('ai-app-data', {
                    appData: scrapeAppData(),
                    source: window.location.pathname
                });
            }
        }, 1500);
    }
}
