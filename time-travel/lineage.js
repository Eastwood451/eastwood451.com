(() => {
  'use strict';

  // Schematic visual stages, not species' exact first/last appearances.
  // Fossils are representatives of branches, not claims of direct ancestry.
  const existing = '../biology/evolution-timeline/images/';
  const atlas = 'images/lineage-atlas.png';
  const picture = file => ({ src: existing + file });
  const cell = index => ({ src: atlas, cell: index });
  const stage = (from, name, art, description) => ({ from, name, art, description });
  const million = 1e6;

  const shared = [
    stage(320 * million, 'Tidlige landhvirveldyr', picture('shared_10_amniote_1779704533314.png'), 'Fælles ophav: små landdyr nær amnioternes tidlige udvikling.'),
    stage(360 * million, 'Tidlige tetrapoder', picture('shared_9_tetrapod_1779704518598.png'), 'Fælles ophav: fire lemmer med tæer; livet er stadig tæt knyttet til vand.'),
    stage(375 * million, 'Overgangen fra fisk til landdyr', picture('shared_8_tiktaalik_1779704503935.png'), 'En Tiktaalik-lignende slægtning illustrerer finner med lem-lignende knogler.'),
    stage(390 * million, 'Kødfligefinnede fisk', picture('shared_7_lobe_finned_1779704491003.png'), 'Fælles ophav: fisk med kraftige, kødfulde finner.'),
    stage(430 * million, 'Tidlige kæbebærende fisk', picture('shared_6_placoderm_1779704475687.png'), 'En panserfisk illustrerer tidlige kæbebærende hvirveldyr, ikke en kendt direkte forfader.'),
    stage(480 * million, 'Kæbeløse hvirveldyr', picture('shared_5_jawless_fish_1779704462207.png'), 'Fælles ophav: tidlige fiskelignende hvirveldyr uden kæber.'),
    stage(520 * million, 'Tidlige rygstrengsdyr', picture('shared_4_chordate_1779704446396.png'), 'En Pikaia-lignende slægtning illustrerer den tidlige kropsplan med rygstreng.'),
    stage(600 * million, 'Tidlige flercellede dyr', picture('shared_3_metazoan_1779704430656.png'), 'Skematisk billede af simple dyr. Den præcise fælles forfaders udseende er ukendt.'),
    stage(800 * million, 'Encellede eukaryoter', picture('shared_2_eukaryote_1779704416021.png'), 'Fælles ophav: celler med cellekerne, længe før mennesker og fugle.'),
    stage(1800 * million, 'Tidligt encellet liv', picture('shared_1_bacterium_1779704401539.png'), 'Et symbolsk cellebillede; det er ikke en rekonstruktion af en bestemt forfader.'),
    stage(3800 * million, 'Ukendt tidligt ophav', null, 'Livets tidligste historie er usikker. Der findes ingen pålidelig rekonstruktion her.'),
    stage(4600 * million, 'Før Jordens dannelse', null, 'Ingen jordiske organismer at vise på dette tidspunkt.')
  ];

  const lineages = {
    human: [
      stage(0, 'Moderne menneske', { src: 'images/modern-human-man.png' }, 'Homo sapiens. Tøjet illustrerer nutiden; vores art går cirka 300.000 år tilbage.'),
      stage(300000, 'Tidlige mennesker', cell(7), 'Repræsentativ Homo-rekonstruktion. Flere menneskearter og populationer indgår i historien.'),
      stage(2 * million, 'Australopithecus-lignende', picture('human_3_australopithecus.png'), 'To ben til gang og flere abelignende træk. Et repræsentativt trin nær Homo-slægtens ophav.'),
      stage(4 * million, 'Tidlige homininer', picture('human_3_australopithecus.png'), 'Skematisk rekonstruktion af tidlige medlemmer af menneskelinjen.'),
      stage(7 * million, 'Tidlige menneskeaber', cell(8), 'En tidlig haleløs abe illustrerer vores ældre udviklingslinje.'),
      stage(25 * million, 'Tidlige primater', cell(9), 'Små trælevende pattedyr med gribehænder. Udseendet er en skematisk tilnærmelse.'),
      stage(66 * million, 'Tidlige pattedyr', cell(10), 'Små pelsklædte dyr illustrerer den lange udvikling frem mod primater.'),
      stage(205 * million, 'Pattedyrlignende synapsider', cell(11), 'En cynodont-lignende form med flere af de træk, som senere kendetegner pattedyr.'),
      stage(260 * million, 'Tidlige synapsider', picture('synapsid_1_synapsid.png'), 'En Dimetrodon-lignende slægtning illustrerer pattedyrenes gren, ikke en dinosaur eller sikker direkte forfader.'),
      ...shared
    ],
    eagle: [
      stage(0, 'Moderne havørn', cell(0), 'Haliaeetus albicilla, den europæiske havørn. Nutidsformen vises i det yngste, skematiske trin.'),
      stage(2 * million, 'Tidlige havørne', cell(1), 'Repræsentativ fiskeædende ørn; den præcise artslinje og dens alder er usikre.'),
      stage(25 * million, 'Tidlige rovfugle', cell(2), 'En høgelignende fugl illustrerer grenen mod høge og ørne.'),
      stage(60 * million, 'Tidlige moderne fugle', cell(3), 'En lille fugl illustrerer den tidlige udvikling af de nulevende fugles linjer.'),
      stage(100 * million, 'Tidlige fugle', cell(4), 'Archaeopteryx-lignende rekonstruktion som eksempel på fuglenes tidlige kropsplan, ikke en direkte forfader.'),
      stage(150 * million, 'Fjerklædte theropoder', picture('eagle_1_theropod.png'), 'Fugle tilhører theropode dinosaurer. Billedet viser en repræsentativ fjerklædt slægtning.'),
      stage(230 * million, 'Tidlige arkosaurer', cell(5), 'Små arkosaurer på grenen mod dinosaurer og fugle.'),
      stage(250 * million, 'Tidlige sauropsider', cell(6), 'Tidlige krybdyrlignende dyr på fuglenes gren, efter adskillelsen fra pattedyrlinjen.'),
      ...shared
    ]
  };

  function stageAt(stages, years) {
    let index = stages.length - 1;
    while (index > 0 && years < stages[index].from) index--;
    return index;
  }

  function age(years) {
    if (years >= 1e9) return (years / 1e9).toLocaleString('da-DK', { maximumFractionDigits: 2 }) + ' mia.';
    if (years >= million) return (years / million).toLocaleString('da-DK', { maximumFractionDigits: 2 }) + ' mio.';
    return years.toLocaleString('da-DK');
  }

  const panel = document.createElement('aside');
  panel.id = 'lineage-panel';
  panel.setAttribute('aria-label', 'Menneskets og havørnens udvikling gennem tiden');
  const cards = [];
  for (const [key, stages] of Object.entries(lineages)) {
    const card = document.createElement('article');
    card.className = 'lineage-card';
    card.dataset.lineage = key;
    card.innerHTML = `
      <h2 class="lineage-heading"><span>${key === 'human' ? 'Menneskets' : 'Havørnens'}</span> udvikling</h2>
      <div class="lineage-art">
        <div class="lineage-image-window"><img alt="" decoding="async" /></div>
        <div class="lineage-empty">Ingen sikker rekonstruktion</div>
      </div>
      <div class="lineage-copy">
        <h3 class="lineage-name"></h3>
        <div class="lineage-period"></div>
        <p class="lineage-description"></p>
      </div>`;
    panel.appendChild(card);
    const art = card.querySelector('.lineage-art');
    const img = card.querySelector('img');
    img.addEventListener('error', () => {
      art.classList.add('image-unavailable');
      card.querySelector('.lineage-empty').textContent = 'Billedet kunne ikke indlæses';
    });
    img.addEventListener('load', () => art.classList.remove('image-unavailable'));
    cards.push({ card, art, img, stages, index: -1,
      name: card.querySelector('.lineage-name'),
      period: card.querySelector('.lineage-period'),
      description: card.querySelector('.lineage-description') });
  }

  const note = document.createElement('details');
  note.className = 'lineage-note';
  note.innerHTML = `<summary>Om illustrationerne</summary>
    <p>Billederne er kunstneriske rekonstruktioner af repræsentative udviklingstrin. De viser et muligt udseende, ikke en dokumenteret kæde af direkte forfædre.</p>
    <p>Intervallerne er afrundede visningstrin, ikke præcise artsdateringer. Især havørnens tidlige slægtslinje og livets ældste historie er usikre. Farver, pels og fjer er delvist fortolkede.</p>
    <p>Grundlag: <a href="https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens" target="_blank" rel="noopener noreferrer">Smithsonian: mennesker</a> ·
    <a href="https://www.nhm.ac.uk/discover/how-dinosaurs-evolved-into-birds.html" target="_blank" rel="noopener noreferrer">Natural History Museum: fugle</a> ·
    <a href="https://www.bto.org/learn/about-birds/birdfacts/white-tailed-eagle" target="_blank" rel="noopener noreferrer">BTO: havørn</a>.</p>`;
  panel.appendChild(note);
  document.body.appendChild(panel);

  function update(years) {
    if (!Number.isFinite(years)) return;
    years = Math.max(0, years);
    for (const entry of cards) {
      const index = stageAt(entry.stages, years);
      if (index === entry.index) continue;
      entry.index = index;
      const current = entry.stages[index];
      const next = entry.stages[index + 1];
      entry.card.dataset.stage = String(current.from);
      entry.name.textContent = current.name;
      entry.period.textContent = 'Ca. ' + age(current.from) + (next ? '–' + age(next.from) : '+') + ' år siden';
      entry.description.textContent = current.description;
      entry.card.title = current.description;
      entry.art.classList.toggle('is-unknown', !current.art);
      entry.art.classList.remove('image-unavailable');
      entry.card.querySelector('.lineage-empty').textContent = 'Ingen sikker rekonstruktion';
      if (!current.art) {
        entry.img.removeAttribute('src');
        entry.img.alt = '';
        continue;
      }
      const isAtlas = current.art.cell !== undefined;
      entry.img.classList.toggle('is-atlas', isAtlas);
      entry.img.style.left = isAtlas ? -(current.art.cell % 4) * 100 + '%' : '0';
      entry.img.style.top = isAtlas ? -Math.floor(current.art.cell / 4) * 100 + '%' : '0';
      entry.img.alt = current.name + ' – kunstnerisk illustration';
      // Only two persistent image elements. An atlas cell change does not reload
      // the image; no preload queue, crossfade buffers or per-frame allocations.
      if (entry.img.getAttribute('src') !== current.art.src) entry.img.src = current.art.src;
    }
  }

  window.TimeTravelLineages = Object.freeze({ update });
  update(0);
})();
