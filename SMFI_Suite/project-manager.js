// project-manager.js - Håndterer global gem/indlæs for hele SMFI Suiten

const STORAGE_KEY_AI = 'smfi_suite_ai_messages';
const STORAGE_KEY_BELIEF_MAP = 'smfi_suite_belief_map_state';

document.addEventListener('DOMContentLoaded', () => {
    const btnSave = document.getElementById('btn-save-project');
    const btnLoad = document.getElementById('btn-load-project');
    const fileInput = document.getElementById('project-file-input');

    if (!btnSave || !btnLoad || !fileInput) return;

    btnSave.addEventListener('click', async () => {
        // Skift ikon til loading
        const originalHtml = btnSave.innerHTML;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Gemmer...';
        btnSave.disabled = true;

        try {
            const projectData = {
                metadata: {
                    version: '1.0',
                    timestamp: new Date().toISOString(),
                    name: 'SMFI_Projekt'
                },
                apps: {},
                aiChat: []
            };

            // Hent AI-chat historik
            const chatStr = localStorage.getItem(STORAGE_KEY_AI);
            if (chatStr) {
                try {
                    projectData.aiChat = JSON.parse(chatStr);
                } catch (e) { }
            }

            // Bed alle under-apps om deres state via bus'en
            const EXPECTED_APPS = [
                'Dimensionsvisualisering',
                'Mindmap & Braindump',
                'Motivations-matrice',
                'Proposition-tester',
                'SMFI Nested Actor',
                'Belief-map'
            ];

            // Vi sender en generel 'request-state' på bus'en. 
            // Hver app modtager den og kvitterer med 'state-response' og dens eget app-navn.
            const statePromises = EXPECTED_APPS.map(appName => {
                return new Promise((resolve) => {
                    const timeoutId = setTimeout(() => {
                        window.bus.unsubscribe('state-response', handler);
                        console.warn(`Timeout venter på data fra ${appName}`);
                        resolve({ app: appName, state: null });
                    }, 2000); // Max ventetid 2 sekunder pr. app

                    const handler = (data) => {
                        if (data && data.app === appName) {
                            clearTimeout(timeoutId);
                            window.bus.unsubscribe('state-response', handler);
                            resolve({ app: appName, state: data.state });
                        }
                    };
                    window.bus.subscribe('state-response', handler);
                });
            });

            // Udsend signalet via broadcast bus'en
            if (window.bus) {
                window.bus.publish('request-state', {});
            }

            // Afvent at alle apps svarer
            const results = await Promise.all(statePromises);

            results.forEach(res => {
                if (res.state) {
                    projectData.apps[res.app] = res.state;
                }
            });

            if (!projectData.apps['Belief-map']) {
                const beliefMapSnapshot = localStorage.getItem(STORAGE_KEY_BELIEF_MAP);
                if (beliefMapSnapshot) {
                    try {
                        projectData.apps['Belief-map'] = JSON.parse(beliefMapSnapshot);
                    } catch (e) {
                        console.warn('Kunne ikke læse lokal Belief-map snapshot:', e);
                    }
                }
            }

            // Foretag download af den kombinerede JSON fil
            const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smfi_komplet_projekt_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Fejl ved gemning:', err);
            alert('Der skete en fejl under gemning af projektet: ' + err.message);
        } finally {
            btnSave.innerHTML = originalHtml;
            btnSave.disabled = false;
        }
    });

    btnLoad.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const originalHtml = btnLoad.innerHTML;
        btnLoad.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Åbner...';
        btnLoad.disabled = true;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);

                // Bagudkompatibilitet: direkte belief-map fil (har nodes+edges men ikke metadata/apps)
                if (!data.metadata && !data.apps && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
                    const beliefMapState = {
                        mapTitle: data.mapTitle || data.canvasTitle || 'Argument Map',
                        slots: Array.isArray(data.slots) && data.slots.length ? data.slots : undefined,
                        nodes: data.nodes,
                        edges: data.edges
                    };
                    localStorage.setItem(STORAGE_KEY_BELIEF_MAP, JSON.stringify(beliefMapState));
                    if (window.bus) window.bus.publish('load-state', { apps: { 'Belief-map': beliefMapState } });
                    alert('Argument-map indlæst i Belief-map.');
                    return;
                }

                // Validering
                if (!data.metadata || !data.apps) {
                    throw new Error('Ugyldig format. Filen mangler nødvendig system-arkitektur.');
                }

                // 1. Gendan AI Chat Historik til den lokale sessionStorage buffer
                if (data.aiChat && Array.isArray(data.aiChat)) {
                    localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(data.aiChat));
                } else {
                    localStorage.removeItem(STORAGE_KEY_AI);
                }
                if (window.bus) window.bus.publish('ai-reload-chat', {});

                // 2. Gendan alle sub-apps via bus signal 'load-state'
                if (data.apps['Belief-map']) {
                    localStorage.setItem(STORAGE_KEY_BELIEF_MAP, JSON.stringify(data.apps['Belief-map']));
                }
                if (window.bus) {
                    window.bus.publish('load-state', { apps: data.apps });
                }

                alert('Projektet blev indlæst succesfuldt i baggrunden!');

            } catch (err) {
                console.error('Fejl ved indlæsning:', err);
                alert('Kunne ikke læse filen. Fejl: ' + err.message);
            } finally {
                btnLoad.innerHTML = originalHtml;
                btnLoad.disabled = false;
                fileInput.value = '';
            }
        };
        reader.onerror = () => {
            alert('Fejl under fillæsning.');
            btnLoad.innerHTML = originalHtml;
            btnLoad.disabled = false;
            fileInput.value = '';
        };
        reader.readAsText(file);
    });
});
