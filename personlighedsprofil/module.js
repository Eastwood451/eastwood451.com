// Extracted from SMFI Nested Actor. Rendering and model calculations are preserved.
let personalityData=Object.create(null), profilePeople=[], currentPMTarget=null, pmActivePreset=null;
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function resolvePersonId(target){return profilePeople.find(p=>p.id===target||p.name===target)?.id;}
function getPersonLabel(id){return profilePeople.find(p=>p.id===id)?.name||'Ukendt';}
function pmEnsure(target){const id=resolvePersonId(target);if(!id)throw new Error('Personen findes ikke.');return personalityData[id]||(personalityData[id]=pmDefaultProfile());}
function profileChanged(){window.dispatchEvent(new Event('profile-changed'));}
function saveCurrentPersonToLibrary(){profileChanged();}
function pmShowImportDialog(){document.getElementById('pmImportText').value='';document.getElementById('pmImportError').style.display='none';document.getElementById('pmImportDialog').classList.add('open');}
function pmCloseImport(){document.getElementById('pmImportDialog').classList.remove('open');}
window.ProfileModule={setPeople(people){profilePeople=people;personalityData=Object.create(null);for(const person of people)personalityData[person.id]=person.profile;pmCompareState.selected.clear();if(people.length)openPersonality(people[0].id);else{currentPMTarget=null;document.getElementById('pmOverlay').classList.remove('open');}if(pmCompareState.open){pmBuildCompareList();pmRenderCompare();}},select(id){openPersonality(id);},get currentId(){return currentPMTarget;}};
        const PERSONALITY_DIMS = {
            attachment: { label: 'Tilknytning' },
            affect: { label: 'Affekttone' },
            activation: { label: 'Aktivering' },
            selfworth: { label: 'Selvværd' },
            identity: { label: 'Identitet' },
            changeTol: { label: 'Forandringstol.' },
            sufferResponse: { label: 'Resp. lidelse' },
            joyResponse: { label: 'Resp. lykke' },
            cogEmpathy: { label: 'Kogn. empati' },
            selfMent: { label: 'Selv-ment.' },
            otherMent: { label: 'Andre-ment.' },
            selfBoundary: { label: 'Selvafgrænsning' },
            affectiveOpenness: { label: 'Affektiv åbenhed' },
            dominance: { label: 'Dominans' },
            normative: { label: 'Normativ orient.' },
            zeroSum: { label: 'Nulsums-perc.' },
            enemyInversion: { label: 'Fjendskabs-inv.' },
            regulation: { label: 'Regulering' },
            ambivalence: { label: 'Ambivalens' },
            agency: { label: 'Agency' },
            temporal: { label: 'Temporal orient.' },
            mofLof: { label: 'MOF-LOF kongr.' },
            valence: { label: 'Valens' },
            satisfaction: { label: 'Tilfredshed' },
            arousal: { label: 'Arousal' },
            returnSpeed: { label: 'Return to base.' },
        };

        const PM_DIM_KEYS = Object.keys(PERSONALITY_DIMS);

        const PM_PRESETS = [
            {
                category: 'Personlighedsforstyrrelser', items: [
                    { label: 'Borderline', values: { attachment: 1, selfBoundary: 2, affectiveOpenness: 9, selfworth: 1, identity: 1, affect: 1, activation: 5, changeTol: 3, sufferResponse: 8, joyResponse: 7, cogEmpathy: 3, selfMent: 2, otherMent: 3, dominance: 3, normative: 5, zeroSum: 4, enemyInversion: 8, regulation: 1, ambivalence: 1, agency: 2, temporal: 2, mofLof: 3, valence: 2, satisfaction: 1, arousal: 8, returnSpeed: 1 } },
                    { label: 'Narcissistisk', values: { attachment: 2, selfBoundary: 8, affectiveOpenness: 2, selfworth: 2, identity: 4, affect: 3, activation: 6, changeTol: 4, sufferResponse: 2, joyResponse: 2, cogEmpathy: 7, selfMent: 2, otherMent: 5, dominance: 9, normative: 2, zeroSum: 8, enemyInversion: 7, regulation: 4, ambivalence: 2, agency: 8, temporal: 5, mofLof: 1, valence: 5, satisfaction: 3, arousal: 6, returnSpeed: 4 } },
                    { label: 'Kovert narc.', values: { attachment: 2, selfBoundary: 6, affectiveOpenness: 3, selfworth: 1, identity: 3, affect: 2, activation: 4, changeTol: 3, sufferResponse: 3, joyResponse: 2, cogEmpathy: 6, selfMent: 3, otherMent: 4, dominance: 6, normative: 2, zeroSum: 7, enemyInversion: 6, regulation: 3, ambivalence: 2, agency: 5, temporal: 4, mofLof: 2, valence: 3, satisfaction: 2, arousal: 5, returnSpeed: 3 } },
                    { label: 'Antisocial', values: { attachment: 2, selfBoundary: 8, affectiveOpenness: 2, selfworth: 5, identity: 5, affect: 4, activation: 6, changeTol: 6, sufferResponse: 2, joyResponse: 5, cogEmpathy: 7, selfMent: 3, otherMent: 6, dominance: 7, normative: 1, zeroSum: 6, enemyInversion: 4, regulation: 3, ambivalence: 4, agency: 7, temporal: 2, mofLof: 3, valence: 4, satisfaction: 4, arousal: 6, returnSpeed: 5 } },
                    { label: 'Paranoid', values: { attachment: 1, selfBoundary: 8, affectiveOpenness: 2, selfworth: 3, identity: 5, affect: 2, activation: 5, changeTol: 2, sufferResponse: 3, joyResponse: 2, cogEmpathy: 4, selfMent: 3, otherMent: 2, dominance: 5, normative: 4, zeroSum: 8, enemyInversion: 9, regulation: 3, ambivalence: 2, agency: 5, temporal: 4, mofLof: 3, valence: 3, satisfaction: 2, arousal: 7, returnSpeed: 2 } },
                    { label: 'Skizoid', values: { attachment: 3, selfBoundary: 9, affectiveOpenness: 1, selfworth: 4, identity: 5, affect: 4, activation: 1, changeTol: 5, sufferResponse: 5, joyResponse: 5, cogEmpathy: 5, selfMent: 5, otherMent: 4, dominance: 3, normative: 5, zeroSum: 3, enemyInversion: 3, regulation: 6, ambivalence: 5, agency: 5, temporal: 6, mofLof: 6, valence: 4, satisfaction: 5, arousal: 2, returnSpeed: 7 } },
                    { label: 'Histrionisk', values: { attachment: 2, selfBoundary: 2, affectiveOpenness: 9, selfworth: 2, identity: 2, affect: 3, activation: 8, changeTol: 6, sufferResponse: 7, joyResponse: 8, cogEmpathy: 3, selfMent: 2, otherMent: 3, dominance: 5, normative: 3, zeroSum: 4, enemyInversion: 5, regulation: 2, ambivalence: 2, agency: 5, temporal: 2, mofLof: 2, valence: 5, satisfaction: 2, arousal: 9, returnSpeed: 2 } },
                    { label: 'Afhængig', values: { attachment: 1, selfBoundary: 1, affectiveOpenness: 9, selfworth: 1, identity: 2, affect: 2, activation: 4, changeTol: 2, sufferResponse: 7, joyResponse: 8, cogEmpathy: 4, selfMent: 3, otherMent: 4, dominance: 1, normative: 6, zeroSum: 3, enemyInversion: 4, regulation: 3, ambivalence: 3, agency: 1, temporal: 2, mofLof: 4, valence: 3, satisfaction: 2, arousal: 5, returnSpeed: 3 } },
                    { label: 'OCD', values: { attachment: 4, selfBoundary: 7, affectiveOpenness: 5, selfworth: 3, identity: 6, affect: 4, activation: 6, changeTol: 2, sufferResponse: 5, joyResponse: 4, cogEmpathy: 6, selfMent: 6, otherMent: 5, dominance: 4, normative: 8, zeroSum: 4, enemyInversion: 4, regulation: 5, ambivalence: 3, agency: 6, temporal: 7, mofLof: 5, valence: 4, satisfaction: 3, arousal: 6, returnSpeed: 5 } },
                ]
            },
            {
                category: 'Personlighedstyper', items: [
                    { label: 'Moden', values: { attachment: 8, selfBoundary: 8, affectiveOpenness: 8, selfworth: 8, identity: 8, affect: 7, activation: 6, changeTol: 7, sufferResponse: 8, joyResponse: 8, cogEmpathy: 8, selfMent: 8, otherMent: 8, dominance: 5, normative: 8, zeroSum: 2, enemyInversion: 4, regulation: 8, ambivalence: 8, agency: 8, temporal: 8, mofLof: 9, valence: 7, satisfaction: 7, arousal: 5, returnSpeed: 7 } },
                    { label: 'Sårbar', values: { attachment: 4, selfBoundary: 6, affectiveOpenness: 6, selfworth: 3, identity: 4, affect: 3, activation: 5, changeTol: 4, sufferResponse: 7, joyResponse: 6, cogEmpathy: 5, selfMent: 4, otherMent: 5, dominance: 3, normative: 6, zeroSum: 4, enemyInversion: 5, regulation: 4, ambivalence: 4, agency: 4, temporal: 4, mofLof: 5, valence: 4, satisfaction: 3, arousal: 6, returnSpeed: 4 } },
                    { label: 'Kontrollerende', values: { attachment: 3, selfBoundary: 7, affectiveOpenness: 4, selfworth: 4, identity: 6, affect: 4, activation: 6, changeTol: 3, sufferResponse: 4, joyResponse: 3, cogEmpathy: 6, selfMent: 4, otherMent: 5, dominance: 8, normative: 4, zeroSum: 6, enemyInversion: 6, regulation: 5, ambivalence: 3, agency: 8, temporal: 6, mofLof: 4, valence: 4, satisfaction: 4, arousal: 6, returnSpeed: 5 } },
                    { label: 'Jacob (underholdning)', values: { attachment: 6, selfBoundary: 8, affectiveOpenness: 6, selfworth: 6, identity: 9, affect: 4, activation: 3, changeTol: 7, sufferResponse: 8, joyResponse: 6, cogEmpathy: 8, selfMent: 9, otherMent: 7, dominance: 6, normative: 8, zeroSum: 3, enemyInversion: 6, regulation: 5, ambivalence: 7, agency: 9, temporal: 8, mofLof: 7, valence: 4, satisfaction: 4, arousal: 7, returnSpeed: 3 } },
                    { label: 'Line (underholdning)', values: { attachment: 3, selfBoundary: 3, affectiveOpenness: 7, selfworth: 4, identity: 5, affect: 3, activation: 7, changeTol: 4, sufferResponse: 6, joyResponse: 5, cogEmpathy: 5, selfMent: 3, otherMent: 4, dominance: 7, normative: 5, zeroSum: 6, enemyInversion: 7, regulation: 3, ambivalence: 3, agency: 6, temporal: 4, mofLof: 3, valence: 5, satisfaction: 4, arousal: 8, returnSpeed: 2 } },
                    { label: 'Nulstil', values: { attachment: 5, selfBoundary: 5, affectiveOpenness: 5, selfworth: 5, identity: 5, affect: 5, activation: 5, changeTol: 5, sufferResponse: 5, joyResponse: 5, cogEmpathy: 5, selfMent: 5, otherMent: 5, dominance: 5, normative: 5, zeroSum: 5, enemyInversion: 5, regulation: 5, ambivalence: 5, agency: 5, temporal: 5, mofLof: 5, valence: 5, satisfaction: 5, arousal: 5, returnSpeed: 5 } },
                ]
            }
        ];

        const PM_DIM_GROUPS = [
            { name: 'Fundament', keys: ['attachment', 'affect', 'activation'] },
            { name: 'Selvsystem', keys: ['selfworth', 'identity', 'changeTol'] },
            { name: 'Empati', keys: ['sufferResponse', 'joyResponse', 'cogEmpathy'] },
            { name: 'Mentalisering', keys: ['selfMent', 'otherMent'] },
            { name: 'Relationel struktur', keys: ['selfBoundary', 'affectiveOpenness', 'dominance', 'normative', 'zeroSum', 'enemyInversion'] },
            { name: 'Regulering & kapacitet', keys: ['regulation', 'ambivalence', 'agency', 'temporal', 'mofLof'] },
            { name: 'Tilstande', keys: ['valence', 'satisfaction', 'arousal', 'returnSpeed'] },
        ];

        const PM_DIM_ENDS = {
            attachment: ['"Alle forlader mig"', '"Jeg er okay alene"'],
            affect: ['Skam/frygt/tomhed', 'Grundlæggende ro'],
            activation: ['Social udtømning', 'Social genopladning'],
            selfworth: ['"Jeg er ingenting"', '"Jeg er nok"'],
            identity: ['Fragmenteret', 'Sammenhængende'],
            changeTol: ['Stabilitetssøgning', 'Novitetssøgning'],
            sufferResponse: ['Fryd/Schadenfreude', 'Medfølende sorg'],
            joyResponse: ['Misundelse/Gluckschmerz', 'Empatisk glæde/Mudita'],
            cogEmpathy: ['Forstår ikke andres logik', 'Præcis perspektivmodellering'],
            selfMent: ['"Jeg er bare sådan"', '"Jeg tror jeg føler X fordi..."'],
            otherMent: ['"Han er vred" (faktum)', '"Jeg tror han er vred"'],
            selfBoundary: ['Fusion', 'Klare grænser'],
            affectiveOpenness: ['Afskåret', 'Åben/tilgængelig'],
            dominance: ['submissiv', 'tyrannisk'],
            normative: ['Instrumentel', 'Intrinsisk bindende'],
            zeroSum: ['Der er nok til alle', 'Din gevinst er mit tab'],
            enemyInversion: ['Ingen ændring', 'Fuld spejlvending'],
            regulation: ['"Tsunami"', '"Føler det, men styret"'],
            ambivalence: ['"Alt eller intet"', '"Godt og skidt"'],
            agency: ['"Livet sker for mig"', '"Jeg former det næste"'],
            temporal: ['Øjeblikkelig tilfredsstillelse', 'Langsigtet planlægning'],
            mofLof: ['Narrativ ≠ drivkraft', 'Selvmodel matcher adfærd'],
            valence: ['Lidelse', 'Eufori'],
            satisfaction: ['"Jeg mangler alt"', '"Jeg har nok"'],
            arousal: ['Lav aktivering', 'Høj aktivering'],
            returnSpeed: ['Minutter', 'Døgn'],
        };

        function pmDefaultProfile() {
            const rest = {}, stress = {};
            PM_DIM_KEYS.forEach(k => { rest[k] = 5; stress[k] = 5; });
            return { rest, stress };
        }

        function cloneProfile(profile) {
            return JSON.parse(JSON.stringify(profile || pmDefaultProfile()));
        }

        let pmDualInitialized = false;

        function pmClamp(x) {
            const n = Number(x);
            return !Number.isFinite(n) ? 5 : Math.max(0, Math.min(10, n));
        }

        function openPersonality(target, fallbackName) {
            currentPMTarget = resolvePersonId(target, fallbackName);
            const profile = pmEnsure(currentPMTarget, fallbackName);
            pmActivePreset = null;

            document.getElementById('pmTitle').textContent = 'Personlighedsprofil - ' + getPersonLabel(currentPMTarget, fallbackName);
            document.getElementById('pmOverlay').classList.add('open');

            // Build presets grid
            pmBuildPresets();

            // Load values into sliders
            PM_DIM_KEYS.forEach(k => {
                const rEl = document.getElementById('pm-' + k + '-rest');
                const sEl = document.getElementById('pm-' + k + '-stress');
                if (rEl) { rEl.value = profile.rest[k]; rEl.style.setProperty('--val', profile.rest[k] * 10); }
                if (sEl) { sEl.value = profile.stress[k]; sEl.style.setProperty('--val', profile.stress[k] * 10); }
                pmUpdateReadout(k);
            });

            // Initialize dual-thumb sliders on first open
            if (!pmDualInitialized) {
                pmUpgradeToDualRange();
                pmDualInitialized = true;
            } else {
                // Re-sync slider values for already-initialized dual sliders
                PM_DIM_KEYS.forEach(k => {
                    const rEl = document.getElementById('pm-' + k + '-rest');
                    const sEl = document.getElementById('pm-' + k + '-stress');
                    if (rEl) { rEl.value = profile.rest[k]; rEl.style.setProperty('--val', profile.rest[k] * 10); }
                    if (sEl) { sEl.value = profile.stress[k]; sEl.style.setProperty('--val', profile.stress[k] * 10); }
                });
            }

            pmRenderAll();
        }

        function closePersonality() {
            // The profile is a page in the standalone app.
        }

        function pmUpdateReadout(id) {
            const ve = document.getElementById('pm-val-' + id);
            if (!ve || !currentPMTarget) return;
            const p = personalityData[currentPMTarget];
            if (!p) return;
            ve.textContent = 'R' + p.rest[id] + ' | S' + p.stress[id];
        }

        function pmUpdate(id, val, mode) {
            if (!currentPMTarget) return;
            const p = pmEnsure(currentPMTarget);
            const v = pmClamp(val);
            if (mode !== 'rest' && mode !== 'stress') mode = 'rest';
            p[mode][id] = v;
            pmUpdateReadout(id);
            pmRenderAll();
            profileChanged();
        }

        function pmApplyPreset(preset, btn) {
            if (!currentPMTarget) return;
            pmActivePreset = preset.label;
            document.querySelectorAll('.pm-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const p = pmEnsure(currentPMTarget);
            Object.entries(preset.values).forEach(([k, v0]) => {
                if (!PERSONALITY_DIMS[k]) return;
                const vv = pmClamp(v0);
                p.rest[k] = vv;
                p.stress[k] = vv;
                const rEl = document.getElementById('pm-' + k + '-rest');
                const sEl = document.getElementById('pm-' + k + '-stress');
                if (rEl) { rEl.value = vv; rEl.style.setProperty('--val', vv * 10); }
                if (sEl) { sEl.value = vv; sEl.style.setProperty('--val', vv * 10); }
                pmUpdateReadout(k);
            });
            pmRenderAll();
            profileChanged();
        }

        function pmBuildPresets() {
            const grid = document.getElementById('pmPresetsGrid');
            if (!grid) return;
            grid.innerHTML = '';
            PM_PRESETS.forEach(group => {
                const cat = document.createElement('div');
                cat.className = 'pm-preset-category';
                cat.textContent = group.category;
                grid.appendChild(cat);
                group.items.forEach(preset => {
                    const btn = document.createElement('button');
                    btn.className = 'pm-preset-btn';
                    btn.textContent = preset.label;
                    btn.onclick = () => pmApplyPreset(preset, btn);
                    grid.appendChild(btn);
                });
            });
        }

        function pmV(k, mode) {
            if (!currentPMTarget) return 5;
            const p = personalityData[currentPMTarget];
            return p ? (p[mode || 'rest'][k] ?? 5) : 5;
        }

        function pmRenderDarkTriad() {
            const narc = Math.round(
                (pmV('dominance') * 2 + (10 - pmV('mofLof')) * 2 + pmV('zeroSum') + (10 - pmV('sufferResponse')) + (10 - pmV('joyResponse'))) / 8
            );
            const mach = Math.round(
                (pmV('cogEmpathy') + (10 - pmV('normative')) * 2 + pmV('agency') + pmV('temporal') + pmV('zeroSum')) / 6
            );
            const psyc = Math.round(
                ((10 - pmV('sufferResponse')) * 2 + pmV('cogEmpathy') + (10 - pmV('normative')) * 2 + (10 - pmV('regulation'))) / 7
            );
            ['narc', 'mach', 'psyc'].forEach((k, i) => {
                const score = [narc, mach, psyc][i];
                const scoreEl = document.getElementById('pm-dt-' + k);
                const barEl = document.getElementById('pm-dt-' + k + '-bar');
                if (scoreEl) scoreEl.textContent = score;
                if (barEl) barEl.style.width = (score * 10) + '%';
            });
        }

        function pmRenderMatrix() {
            const sr = pmV('sufferResponse'), jr = pmV('joyResponse'), ei = pmV('enemyInversion');
            const sufferRow = sr < 4 ? 'fryd' : sr > 6 ? 'sorg' : 'lig';
            const joyCol = jr < 4 ? 'mis' : jr > 6 ? 'glad' : 'lig';
            const allyId = 'pm-m-' + sufferRow + '-' + joyCol;

            document.querySelectorAll('[id^="pm-m-"]').forEach(td => td.classList.remove('active-cell'));
            const allyActive = document.getElementById(allyId);
            if (allyActive) allyActive.classList.add('active-cell');

            const allyLabels = {
                'pm-m-sorg-glad': 'Sund person', 'pm-m-sorg-lig': 'Depressiv', 'pm-m-sorg-mis': 'Bitter / Ressentiment',
                'pm-m-lig-glad': 'Pollyanna', 'pm-m-lig-lig': 'Skizoid', 'pm-m-lig-mis': 'Kompetitiv',
                'pm-m-fryd-glad': 'Affektiv smitte', 'pm-m-fryd-lig': 'Psykopat', 'pm-m-fryd-mis': 'Malignant narcissist'
            };
            const mt = document.getElementById('pm-matrix-position-text');
            if (mt) mt.textContent = allyActive ? 'Allieret position: ' + allyLabels[allyId] : 'Position: midterzone';

            // Enemy position
            const invFactor = ei / 10;
            const srInv = sr + (5 - sr) * 2 * invFactor;
            const jrInv = jr + (5 - jr) * 2 * invFactor;
            const eSufferRow = srInv < 4 ? 'fryd' : srInv > 6 ? 'sorg' : 'lig';
            const eJoyCol = jrInv < 4 ? 'mis' : jrInv > 6 ? 'glad' : 'lig';
            const enemyId = 'pm-e-' + eSufferRow + '-' + eJoyCol;

            document.querySelectorAll('[id^="pm-e-"]').forEach(td => td.classList.remove('active-cell'));
            const enemyActive = document.getElementById(enemyId);
            if (enemyActive) enemyActive.classList.add('active-cell');

            const invDesc = ei < 3 ? 'lav inversion' : ei > 7 ? 'fuld spejlvending' : 'delvis inversion';
            const et = document.getElementById('pm-enemy-matrix-text');
            if (et) et.textContent = enemyActive ? 'Fjende-position: ' + (invDesc) + ' (' + ei + '/10)' : 'Fjende: midterzone';
        }

        function pmRenderReport() {
            const profileEl = document.getElementById('pmProfileLabel');
            if (profileEl) profileEl.textContent = pmActivePreset || 'Manuelt konfigureret';

            const overall = PM_DIM_KEYS.reduce((s, k) => s + pmV(k), 0) / PM_DIM_KEYS.length;
            const title = overall >= 7.5 ? 'Moden & integreret profil'
                : overall >= 5.5 ? 'Funktionel med sårbare zoner'
                    : overall >= 3.5 ? 'Moderat sårbar profil'
                        : 'Alvorligt sårbar profil';
            const titleEl = document.getElementById('pmReportTitle');
            if (titleEl) titleEl.textContent = title;

            let html = '';
            const att = pmV('attachment'), sb = pmV('selfBoundary'), ao = pmV('affectiveOpenness');
            let relStr;
            if (sb < 4 && ao > 6) relStr = 'Uklare grænser kombineret med høj affektiv åbenhed — fusionerende mønstre.';
            else if (sb > 6 && ao > 6) relStr = 'Klare grænser og høj affektiv åbenhed — sund synergi.';
            else if (sb > 6 && ao < 4) relStr = 'Klare grænser men lav affektiv åbenhed — afskårethed.';
            else if (sb < 4 && ao < 4) relStr = 'Uklare grænser og lav affektiv åbenhed — dissociativ isolation.';
            else relStr = 'Selvafgrænsning: ' + sb + '/10. Affektiv åbenhed: ' + ao + '/10. Tilknytning: ' + att + '/10.';
            html += '<div class="pm-report-section"><h3>Relationsregulering</h3><p>' + relStr + '</p></div>';

            const sr = pmV('sufferResponse'), jr = pmV('joyResponse'), ce = pmV('cogEmpathy');
            let empStr = '';
            if (sr < 4 && jr < 4) empStr = 'Lav respons på andres lidelse og lykke. Sadistisk-misundelig konfiguration.';
            else if (sr > 6 && jr > 6) empStr = 'Medfølende sorg og empatisk glæde — den sunde konfiguration.';
            else if (sr > 6 && jr < 4) empStr = 'Medfølende ved smerte men misundelig ved lykke — ressentiment.';
            else empStr = 'Resp. lidelse: ' + sr + '/10. Resp. lykke: ' + jr + '/10. Kogn. empati: ' + ce + '/10.';
            html += '<div class="pm-report-section"><h3>Empati & Affektiv kobling</h3><p>' + empStr + '</p></div>';

            const reg = pmV('regulation'), amb = pmV('ambivalence'), age = pmV('agency'), temp = pmV('temporal');
            let regStr = '';
            if (reg < 3 && amb < 3) regStr = 'Lav regulering og lav ambivalenstolerance. Splitting sandsynligt.';
            else if (age > 7 && temp > 7) regStr = 'Høj agency og langsigtet orientering.';
            else regStr = 'Regulering: ' + reg + '/10. Ambivalens: ' + amb + '/10. Agency: ' + age + '/10. Temporal: ' + temp + '/10.';
            html += '<div class="pm-report-section"><h3>Regulering & Kapacitet</h3><p>' + regStr + '</p></div>';

            const mof = pmV('mofLof');
            const mofStr = mof < 3 ? 'Lav MOF–LOF kongruens (' + mof + '/10). Narrativet stemmer ikke med drivkraften.'
                : mof > 7 ? 'God MOF–LOF kongruens (' + mof + '/10). Selvmodellen matcher adfærd.'
                    : 'Moderat MOF–LOF kongruens (' + mof + '/10).';
            html += '<div class="pm-report-section"><h3>MOF–LOF Kongruens</h3><p>' + mofStr + '</p></div>';

            const val = pmV('valence'), sat = pmV('satisfaction'), aro = pmV('arousal'), ret = pmV('returnSpeed');
            const affStr = 'Valens: ' + val + '/10. Tilfredshed: ' + sat + '/10. Arousal: ' + aro + '/10. Return to baseline: ' + (ret < 3 ? 'minutter' : ret > 7 ? 'døgn+' : 'timer') + '.';
            html += '<div class="pm-report-section"><h3>Affektive tilstande</h3><p>' + affStr + '</p></div>';

            const bodyEl = document.getElementById('pmReportBody');
            if (bodyEl) bodyEl.innerHTML = html;
        }

        function pmDrawRadar() {
            const canvas = document.getElementById('pmRadar');
            if (!canvas || !currentPMTarget) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const p = personalityData[currentPMTarget];
            if (!p) return;

            const cx = 150, cy = 150, r = 118;
            const n = PM_DIM_KEYS.length;
            ctx.clearRect(0, 0, 300, 300);

            for (let level = 1; level <= 5; level++) {
                ctx.beginPath();
                for (let i = 0; i < n; i++) {
                    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                    const x = cx + (r * level / 5) * Math.cos(angle);
                    const y = cy + (r * level / 5) * Math.sin(angle);
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.closePath(); ctx.strokeStyle = '#d4c9b0'; ctx.lineWidth = 1; ctx.stroke();
            }
            for (let i = 0; i < n; i++) {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                ctx.beginPath(); ctx.moveTo(cx, cy);
                ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
                ctx.strokeStyle = '#d4c9b0'; ctx.lineWidth = 1; ctx.stroke();
                const lx = cx + (r + 16) * Math.cos(angle);
                const ly = cy + (r + 16) * Math.sin(angle);
                ctx.fillStyle = '#8a7d68'; ctx.font = '500 7px monospace';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(PERSONALITY_DIMS[PM_DIM_KEYS[i]].label, lx, ly);
            }

            function drawPoly(mode, stroke, fill) {
                ctx.beginPath();
                for (let i = 0; i < n; i++) {
                    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                    const vv = (p[mode][PM_DIM_KEYS[i]] ?? 5) / 10;
                    const x = cx + r * vv * Math.cos(angle);
                    const y = cy + r * vv * Math.sin(angle);
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
                ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
                for (let i = 0; i < n; i++) {
                    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                    const vv = (p[mode][PM_DIM_KEYS[i]] ?? 5) / 10;
                    ctx.beginPath();
                    ctx.arc(cx + r * vv * Math.cos(angle), cy + r * vv * Math.sin(angle), 3, 0, Math.PI * 2);
                    ctx.fillStyle = stroke; ctx.fill();
                }
            }
            drawPoly('rest', '#4a7c6f', 'rgba(74,124,111,0.12)');
            drawPoly('stress', '#c4553a', 'rgba(196,85,58,0.10)');
        }

        function pmRenderBars() {
            const c = document.getElementById('pmDimBars');
            if (!c || !currentPMTarget) return;
            const p = personalityData[currentPMTarget];
            if (!p) return;
            c.innerHTML = '';
            PM_DIM_KEYS.forEach(k => {
                const restW = (p.rest[k] ?? 5) * 10;
                const stressW = (p.stress[k] ?? 5) * 10;
                const row = document.createElement('div');
                row.className = 'pm-dim-bar-row';
                row.innerHTML = '<span class="pm-dim-bar-label">' + PERSONALITY_DIMS[k].label + '</span>' +
                    '<div class="pm-dim-bar-track"><div class="pm-dim-bar-fill" style="width:' + restW + '%; background:#4a7c6f;"></div>' +
                    '<div class="pm-dim-bar-fill" style="width:' + stressW + '%; background:#c4553a; opacity:0.55; position:absolute; left:0; top:0;"></div></div>' +
                    '<span class="pm-dim-bar-num">R' + p.rest[k] + '/S' + p.stress[k] + '</span>';
                c.appendChild(row);
            });
        }

        function pmRenderAll() {
            pmRenderDarkTriad();
            pmRenderMatrix();
            pmRenderReport();
            pmDrawRadar();
            pmRenderBars();
        }

        // Sync slider positions + readouts from personalityData (called after AI edits)
        function pmSyncSlidersFromData() {
            if (!currentPMTarget) return;
            const p = personalityData[currentPMTarget];
            if (!p) return;
            PM_DIM_KEYS.forEach(k => {
                const rEl = document.getElementById('pm-' + k + '-rest');
                const sEl = document.getElementById('pm-' + k + '-stress');
                if (rEl) { rEl.value = p.rest[k]; rEl.style.setProperty('--val', p.rest[k] * 10); }
                if (sEl) { sEl.value = p.stress[k]; sEl.style.setProperty('--val', p.stress[k] * 10); }
                pmUpdateReadout(k);
            });
            pmRenderAll();
        }

function pmUpgradeToDualRange() {
 document.querySelectorAll('#pmOverlay .pm-range').forEach(inp => {
  const key=inp.dataset.dim; if(!PERSONALITY_DIMS[key])return;
  inp.removeAttribute('oninput'); inp.dataset.mode='rest'; inp.id='pm-'+key+'-rest';
  const stress=inp.cloneNode(true);stress.dataset.mode='stress';stress.id='pm-'+key+'-stress';
  inp.insertAdjacentElement('afterend',stress);
  for(const el of [inp,stress]){
   el.value=personalityData[currentPMTarget][el.dataset.mode][key];
   el.style.setProperty('--val',Number(el.value)*10);
   el.setAttribute('aria-label',PERSONALITY_DIMS[key].label+' · '+(el.dataset.mode==='rest'?'I ro':'Under pres'));
   el.addEventListener('input',()=>pmUpdate(key,Number(el.value),el.dataset.mode));
  }
 });
}
        // PM Compare
        const pmCompareState = { open: false, selected: new Set(), mode: 'rest', layout: 'grid' };

        function pmOpenCompare() {
            pmCompareState.open = true;
            document.getElementById('pmCompareModal').classList.add('open');
            pmBuildCompareList();
            pmRenderCompare();
        }
        function pmCloseCompare() {
            pmCompareState.open = false;
            document.getElementById('pmCompareModal').classList.remove('open');
        }

function pmGetAllProfileNames(){return profilePeople.map(p=>p.name);}
        function pmBuildCompareList() {
            const list = document.getElementById('pmCompareList');
            if (!list) return;
            list.innerHTML = '';
            const names = pmGetAllProfileNames();
            if (pmCompareState.selected.size === 0 && names.length >= 2) {
                pmCompareState.selected.add(names[0]);
                if (names[1]) pmCompareState.selected.add(names[1]);
            }
            names.forEach(name => {
                const id = 'pmcmp-' + name.replace(/[^a-z0-9]+/gi, '-');
                const wrap = document.createElement('div');
                wrap.className = 'pm-compare-item';
                const cb = document.createElement('input');
                cb.type = 'checkbox'; cb.id = id;
                cb.checked = pmCompareState.selected.has(name);
                cb.addEventListener('change', () => {
                    if (cb.checked) pmCompareState.selected.add(name); else pmCompareState.selected.delete(name);
                    pmRenderCompare();
                });
                const lab = document.createElement('label');
                lab.htmlFor = id; lab.textContent = name;
                wrap.appendChild(cb); wrap.appendChild(lab);
                list.appendChild(wrap);
            });
        }

        function pmRenderCompare() {
            const sel = Array.from(pmCompareState.selected);
            const box = document.getElementById('pmCompareAnalysis');
            const btn = document.getElementById('pmCompareAnalyzeBtn');
            const hint = document.getElementById('pmCompareAnalysisHint');
            if (box) box.style.display = sel.length >= 1 ? 'block' : 'none';
            if (btn) btn.disabled = sel.length !== 2;
            if (hint) hint.textContent = sel.length === 2
                ? 'Klar: ' + sel[0] + ' vs ' + sel[1] + ' · mode: ' + (pmCompareState.mode === 'stress' ? 'Stress' : 'Rest')
                : 'Vælg præcis 2 profiler.';

            const grid = document.getElementById('pmCompareGrid');
            const overlay = document.getElementById('pmCompareOverlay');
            if (pmCompareState.layout === 'overlay') {
                if (grid) grid.style.display = 'none';
                if (overlay) overlay.style.display = 'block';
                pmRenderCompareOverlay();
            } else {
                if (grid) grid.style.display = 'grid';
                if (overlay) overlay.style.display = 'none';
                pmRenderCompareGrid();
            }
        }

        function pmRenderCompareGrid() {
            const grid = document.getElementById('pmCompareGrid');
            if (!grid) return;
            grid.innerHTML = '';
            const mode = pmCompareState.mode;
            Array.from(pmCompareState.selected).forEach(name => {
                const p = pmEnsure(name);
                const card = document.createElement('div');
                card.className = 'pm-compare-radar';
                const title = document.createElement('h4');
                title.textContent = name + ' · ' + (mode === 'stress' ? 'Stress' : 'Rest');
                const c = document.createElement('canvas');
                c.width = 260; c.height = 260;
                card.appendChild(title); card.appendChild(c);
                grid.appendChild(card);
                pmDrawRadarForProfile(c, p[mode], mode);
            });
        }

        function pmDrawRadarForProfile(canvas, vals, mode) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const w = canvas.width, h = canvas.height;
            const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.38;
            const n = PM_DIM_KEYS.length;
            ctx.clearRect(0, 0, w, h);
            for (let level = 1; level <= 5; level++) {
                ctx.beginPath();
                for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; const x = cx + (r * level / 5) * Math.cos(a); const y = cy + (r * level / 5) * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
                ctx.closePath(); ctx.strokeStyle = '#d4c9b0'; ctx.lineWidth = 1; ctx.stroke();
            }
            const stroke = mode === 'stress' ? '#c4553a' : '#4a7c6f';
            const fill = mode === 'stress' ? 'rgba(196,85,58,0.10)' : 'rgba(74,124,111,0.12)';
            ctx.beginPath();
            for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; const v = pmClamp(vals[PM_DIM_KEYS[i]] ?? 5) / 10; const x = cx + r * v * Math.cos(a); const y = cy + r * v * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
            ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
        }

        function pmHexToRgba(hex, a) {
            let h = String(hex || '').trim();
            if (!h.startsWith('#')) return 'rgba(0,0,0,' + a + ')';
            if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
            const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
            if ([r, g, b].some(x => Number.isNaN(x))) return 'rgba(0,0,0,' + a + ')';
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        }

        function pmRenderCompareOverlay() {
            const canvas = document.getElementById('pmCompareOverlayCanvas');
            const legend = document.getElementById('pmCompareLegend');
            const title = document.getElementById('pmCompareOverlayTitle');
            if (!canvas || !legend) return;
            const mode = pmCompareState.mode;
            const names = Array.from(pmCompareState.selected);
            const palette = ['#3d5e8a', '#7a5c8a', '#8a5c3a', '#5a6e3a', '#c4553a', '#4a7c6f', '#2a2016', '#8a7d68'];
            if (title) title.textContent = 'Overlay · ' + (mode === 'stress' ? 'Stress' : 'Rest') + ' · ' + names.length + ' profiler';
            legend.innerHTML = '';
            names.forEach((name, i) => {
                const item = document.createElement('div');
                item.className = 'pm-legend-item';
                item.innerHTML = '<span class="pm-legend-swatch" style="background:' + palette[i % palette.length] + '"></span><span class="pm-legend-label">' + esc(name) + '</span>';
                legend.appendChild(item);
            });

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.38;
            const n = PM_DIM_KEYS.length;
            ctx.clearRect(0, 0, w, h);
            for (let level = 1; level <= 5; level++) {
                ctx.beginPath();
                for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; const x = cx + (r * level / 5) * Math.cos(a); const y = cy + (r * level / 5) * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
                ctx.closePath(); ctx.strokeStyle = '#d4c9b0'; ctx.lineWidth = 1; ctx.stroke();
            }
            names.forEach((name, idx) => {
                const p = pmEnsure(name);
                const vals = p[mode];
                const stroke = palette[idx % palette.length];
                const fill = pmHexToRgba(stroke, 0.12);
                ctx.beginPath();
                for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; const v = pmClamp(vals[PM_DIM_KEYS[i]] ?? 5) / 10; const x = cx + r * v * Math.cos(a); const y = cy + r * v * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
                ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
            });
        }

        function pmRenderCompareAnalysis() {
            const body = document.getElementById('pmCompareAnalysisBody');
            if (!body) return;
            const sel = Array.from(pmCompareState.selected);
            if (sel.length !== 2) { body.innerHTML = ''; return; }
            const mode = pmCompareState.mode;
            const aP = pmEnsure(sel[0]), bP = pmEnsure(sel[1]);
            const aVals = aP[mode], bVals = bP[mode];

            const meanAll = PM_DIM_KEYS.map(k => Math.abs((aVals[k] ?? 5) - (bVals[k] ?? 5))).reduce((s, x) => s + x, 0) / PM_DIM_KEYS.length;
            const diffs = PM_DIM_KEYS.map(k => ({ k, av: aVals[k] ?? 5, bv: bVals[k] ?? 5, d: Math.abs((aVals[k] ?? 5) - (bVals[k] ?? 5)) })).sort((a, b) => b.d - a.d).slice(0, 7);
            const sims = PM_DIM_KEYS.map(k => ({ k, av: aVals[k] ?? 5, bv: bVals[k] ?? 5, d: Math.abs((aVals[k] ?? 5) - (bVals[k] ?? 5)) })).filter(x => x.d <= 1).sort((a, b) => a.d - b.d).slice(0, 7);

            let html = '<p><b>' + esc(sel[0]) + '</b> vs <b>' + esc(sel[1]) + '</b>. Gennemsnitlig afstand: <b>' + meanAll.toFixed(2) + '</b>. Mode: <b>' + (mode === 'stress' ? 'Stress' : 'Rest') + '</b>.</p>';
            html += '<h3>Største forskelle</h3><ul>';
            diffs.forEach(x => { html += '<li><b>' + esc(PERSONALITY_DIMS[x.k].label) + '</b>: ' + esc(sel[0]) + '=' + x.av + ', ' + esc(sel[1]) + '=' + x.bv + ' (Δ=' + x.d + ')</li>'; });
            html += '</ul><h3>Ligheder</h3>';
            if (sims.length === 0) html += '<p>Ingen næsten-identiske dimensioner (±1).</p>';
            else { html += '<ul>'; sims.forEach(x => { html += '<li><b>' + esc(PERSONALITY_DIMS[x.k].label) + '</b>: ' + esc(sel[0]) + '=' + x.av + ', ' + esc(sel[1]) + '=' + x.bv + '</li>'; }); html += '</ul>'; }
            body.innerHTML = html;
        }

        // Wire compare UI controls
        document.getElementById('pmCompareMode').addEventListener('change', function () {
            pmCompareState.mode = this.value;
            pmBuildCompareList();
            pmRenderCompare();
        });
        document.getElementById('pmCompareLayout').addEventListener('change', function () {
            pmCompareState.layout = this.value;
            pmRenderCompare();
        });
        document.getElementById('pmCompareModal').addEventListener('click', function (e) {
            if (e.target === this) pmCloseCompare();
        });
        
        document.getElementById('pmImportDialog').addEventListener('click', function (e) {
            if (e.target === this) pmCloseImport();
        });
