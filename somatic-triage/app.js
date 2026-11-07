(() => {
  const DATA_KEY = "eastwood451.somatic-triage.v1";
  const PREF_KEY = "eastwood451.somatic-triage.autosave";
  const DEFAULT_GREEN = 34;
  const DEFAULT_YELLOW = 66;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CX = 170;
  const CY = 152;
  const GAUGES = ["approach", "yes", "last", "cost", "refusal"];

  const COPY = {
    approach: {
      lamp: "Retning",
      low: "hen imod og ro",
      high: "væk fra og tilbagetrækning",
      yellow: "Retning står i gult. Du har sat noget midt imellem hen imod og væk. Mærk efter, før du går videre. Det er ikke Stop og korrigér.",
      red: "Retning står i rødt. Du har sat, at kroppen vil væk. Stop og korrigér: hold pause og juster, før du går videre. Argumenter ikke viseren væk. Den beviser ikke, hvad situationen er.",
    },
    yes: {
      lamp: "Ja-billedet",
      low: "ro ved ja",
      high: "anspændthed ved ja",
      yellow: "Ja-billedet står i gult. Mærk efter, hvad der strammer, før du svarer. Det er ikke Stop og korrigér.",
      red: "Ja-billedet står i rødt. Du har sat anspændthed ved tanken om ja. Lad svaret vente, mens du justerer. Viseren mærker ikke kroppen. Den viser tallet, du selv har sat.",
    },
    last: {
      lamp: "Sidste gang",
      low: "ro efter timerne",
      high: "belastning efter timerne",
      yellow: "Sidste gang står i gult. Timernes efterklang er hverken rolig eller rød. Mærk efter.",
      red: "Sidste gang står i rødt. Du har sat, at timerne efterlod belastning. Brug det som din egen erindring, når du korrigerer. Det fastslår ikke den andens hensigt.",
    },
    cost: {
      lamp: "Omkostning",
      low: "oplevet balance",
      high: "oplevet skæv omkostning",
      yellow: "Omkostning står i gult. Du oplever en skævhed, der ikke er rød endnu. Det er stadig din vurdering, ikke en dom over den anden.",
      red: "Omkostning står i rødt. Du oplever byrden som skæv. Stop og korrigér rammerne. Det er din vurdering af ubalance, ikke en dom over den anden.",
    },
    refusal: {
      lamp: "Nej'et",
      low: "nej uden undskyldning",
      high: "at undskyldningen skal øves",
      yellow: "Nej'et står i gult. Der er noget pres, men du har ikke sat det i rødt. Mærk efter, om nej kan siges uden manuskript.",
      red: "Nej'et står i rødt. Du har sat, at et nej kræver en øvet undskyldning. Stop og korrigér, så der bliver plads til at sige nej uden manuskript. Viseren beviser ikke et pres, du ikke selv har angivet.",
    },
  };

  const state = {
    values: Object.fromEntries(GAUGES.map((id) => [id, null])),
    greenMax: DEFAULT_GREEN,
    yellowMax: DEFAULT_YELLOW,
    note: "",
    autosave: true,
    signature: "",
  };

  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let saveTimer = 0;
  let dialogMode = "reset";
  let suppressToggle = false;
  let booted = false;

  function angle(t) {
    return ((150 + t * 240) * Math.PI) / 180;
  }

  function polar(t, r) {
    const a = angle(t);
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }

  function arcPath(t0, t1, r) {
    const a0 = angle(t0);
    const a1 = angle(t1);
    const p0 = { x: CX + r * Math.cos(a0), y: CY + r * Math.sin(a0) };
    const p1 = { x: CX + r * Math.cos(a1), y: CY + r * Math.sin(a1) };
    const large = (t1 - t0) * 240 > 180 ? 1 : 0;
    return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }

  function needleDeg(value) {
    if (value == null) return 180;
    return 240 + (value / 100) * 240;
  }

  function svgEl(name, attrs, parent) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (parent) parent.append(node);
    return node;
  }

  function mountDial(id) {
    const svg = svgEl("svg", { viewBox: "0 0 340 300", role: "presentation" });
    const defs = svgEl("defs", {}, svg);
    const faceGrad = svgEl("radialGradient", { id: `face-${id}`, cx: "42%", cy: "36%", r: "72%" }, defs);
    svgEl("stop", { class: "face-a", offset: "0%", "stop-color": "#f4e7cf" }, faceGrad);
    svgEl("stop", { class: "face-b", offset: "68%", "stop-color": "#e6d5b2" }, faceGrad);
    svgEl("stop", { class: "face-c", offset: "100%", "stop-color": "#c9b48e" }, faceGrad);
    const brass = svgEl("linearGradient", { id: `brass-${id}`, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    svgEl("stop", { offset: "0%", "stop-color": "#f0ddb4" }, brass);
    svgEl("stop", { offset: "45%", "stop-color": "#b8924e" }, brass);
    svgEl("stop", { offset: "100%", "stop-color": "#6e542c" }, brass);

    svgEl("circle", { cx: CX, cy: CY, r: 136, fill: "#141a1d", stroke: "#5c4c32", "stroke-width": "3" }, svg);
    svgEl("circle", {
      cx: CX, cy: CY, r: 128, fill: `url(#brass-${id})`, stroke: "#3a2e1c", "stroke-width": "2",
    }, svg);
    svgEl("circle", { class: "face", cx: CX, cy: CY, r: 118, fill: `url(#face-${id})` }, svg);
    svgEl("circle", { cx: CX, cy: CY, r: 112, fill: "none", stroke: "rgba(60,48,32,0.28)", "stroke-width": "1" }, svg);

    for (const band of ["green", "yellow", "red"]) {
      svgEl("path", {
        class: `band band-${band}`,
        fill: "none",
        "stroke-linecap": "butt",
        "stroke-width": "14",
        stroke: band === "green" ? "#1f7a45" : band === "yellow" ? "#c4841a" : "#a33a32",
      }, svg);
      svgEl("circle", { class: `dot dot-${band}`, r: "6", display: "none" }, svg);
    }

    for (let v = 0; v <= 100; v += 5) {
      const major = v % 20 === 0;
      const mid = v % 10 === 0;
      const t = v / 100;
      const a = angle(t);
      const r1 = major ? 84 : mid ? 89 : 93;
      const r2 = 100;
      svgEl("line", {
        x1: (CX + r1 * Math.cos(a)).toFixed(2),
        y1: (CY + r1 * Math.sin(a)).toFixed(2),
        x2: (CX + r2 * Math.cos(a)).toFixed(2),
        y2: (CY + r2 * Math.sin(a)).toFixed(2),
        stroke: "#2e281f",
        "stroke-width": major ? "2.2" : "1.1",
        "stroke-linecap": "round",
      }, svg);
      if (v === 0 || v === 40 || v === 60 || v === 100) {
        const lp = polar(t, 64);
        const text = svgEl("text", {
          x: lp.x.toFixed(2),
          y: lp.y.toFixed(2),
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          fill: "#2a241c",
          "font-size": "12",
          "font-family": "Georgia, Palatino, serif",
          "font-weight": "700",
        }, svg);
        text.textContent = String(v);
      }
    }

    svgEl("ellipse", {
      cx: CX, cy: CY - 48, rx: 62, ry: 24, fill: "#fff", opacity: "0.09",
    }, svg);

    const unset = svgEl("text", {
      class: "unset-label",
      x: CX,
      y: CY - 24,
      "text-anchor": "middle",
      fill: "#3a342b",
      "font-size": "13",
      "font-family": "Palatino, Georgia, serif",
      "letter-spacing": "1.4",
    }, svg);
    unset.textContent = "IKKE VURDERET";

    const needle = svgEl("g", { class: "needle" }, svg);
    svgEl("polygon", {
      points: "0,-98 -8,-8 -4.5,24 0,31 4.5,24 8,-8",
      fill: "#1c1e1a",
      stroke: "#d7b56a",
      "stroke-width": "1.2",
      "stroke-linejoin": "round",
    }, needle);
    svgEl("circle", { class: "marker", r: "5.5", fill: "#1f7a45", stroke: "#1c140c", "stroke-width": "1.4", display: "none" }, svg);
    svgEl("circle", { cx: CX, cy: CY, r: 13, fill: `url(#brass-${id})`, stroke: "#2a2116", "stroke-width": "1" }, svg);
    svgEl("circle", { cx: CX, cy: CY, r: 4, fill: "#241c14" }, svg);

    $(`dial-${id}`).append(svg);
    if (reduceMotion) svg.style.setProperty("transition", "none");
  }

  function placeBand(svg, name, t0, t1, color) {
    const path = svg.querySelector(`.band-${name}`);
    const dot = svg.querySelector(`.dot-${name}`);
    if (t1 - t0 < 0.008) {
      path.setAttribute("display", "none");
      const p = polar(t0, 102);
      dot.setAttribute("display", "");
      dot.setAttribute("cx", p.x.toFixed(2));
      dot.setAttribute("cy", p.y.toFixed(2));
      dot.setAttribute("fill", color);
    } else {
      dot.setAttribute("display", "none");
      path.setAttribute("display", "");
      path.setAttribute("d", arcPath(t0, t1, 102));
    }
  }

  function bandOf(value) {
    if (value == null) return "unset";
    if (value <= state.greenMax) return "green";
    if (value <= state.yellowMax) return "yellow";
    return "red";
  }

  function bandLabel(band) {
    if (band === "green") return "Grønt bånd";
    if (band === "yellow") return "Gult bånd";
    if (band === "red") return "Rødt bånd";
    return "Ikke vurderet";
  }

  function updateDial(id) {
    const svg = $(`dial-${id}`).querySelector("svg");
    const value = state.values[id];
    const band = bandOf(value);
    const gEnd = state.greenMax / 100;
    const yEnd = state.yellowMax / 100;
    placeBand(svg, "green", 0, gEnd, "#1f7a45");
    placeBand(svg, "yellow", gEnd, yEnd, "#c4841a");
    placeBand(svg, "red", yEnd, 1, "#a33a32");
    const active = band === "unset" ? null : band;
    for (const name of ["green", "yellow", "red"]) {
      const opacity = active == null ? "0.8" : name === active ? "1" : "0.38";
      svg.querySelector(`.band-${name}`).setAttribute("opacity", opacity);
      svg.querySelector(`.dot-${name}`).setAttribute("opacity", opacity);
    }
    const stops = {
      a: band === "unset" ? "#e5e1d6" : "#f4e7cf",
      b: band === "unset" ? "#d0cbc0" : "#e6d5b2",
      c: band === "unset" ? "#b7b3a8" : "#c9b48e",
    };
    svg.querySelector(".face-a").setAttribute("stop-color", stops.a);
    svg.querySelector(".face-b").setAttribute("stop-color", stops.b);
    svg.querySelector(".face-c").setAttribute("stop-color", stops.c);
    svg.querySelector(".unset-label").setAttribute("display", band === "unset" ? "" : "none");
    const needle = svg.querySelector(".needle");
    needle.setAttribute("transform", `translate(${CX} ${CY}) rotate(${needleDeg(value)})`);
    const poly = needle.querySelector("polygon");
    poly.setAttribute("fill", band === "unset" ? "#8a867c" : "#1c1e1a");
    poly.setAttribute("opacity", band === "unset" ? "0.8" : "1");
    const marker = svg.querySelector(".marker");
    if (value == null) {
      marker.setAttribute("display", "none");
    } else {
      const p = polar(value / 100, 102);
      const fill = band === "green" ? "#146b3a" : band === "yellow" ? "#8a5a08" : "#8e241f";
      marker.setAttribute("display", "");
      marker.setAttribute("cx", p.x.toFixed(2));
      marker.setAttribute("cy", p.y.toFixed(2));
      marker.setAttribute("fill", fill);
    }
  }

  function ariaFor(id, value) {
    const copy = COPY[id];
    if (value == null) {
      return `Ikke vurderet. 0 til venstre er ${copy.low}. 100 til højre er ${copy.high}.`;
    }
    const band = bandOf(value);
    const name = band === "red" ? "rødt bånd, Stop og korrigér" : band === "yellow" ? "gult bånd" : "grønt bånd";
    return `${value}. ${name}. 0 er ${copy.low}. 100 er ${copy.high}.`;
  }

  function setFlag(id, unset) {
    const flag = $(`flag-${id}`);
    const range = $(`range-${id}`);
    range.classList.toggle("is-unset", unset);
    if (unset) flag.hidden = false;
    else flag.hidden = true;
    range.setAttribute("aria-valuetext", ariaFor(id, unset ? null : state.values[id]));
  }

  function renderGauge(id, note) {
    const value = state.values[id];
    const band = bandOf(value);
    const article = $(`instrument-${id}`);
    article.dataset.state = band;
    article.dataset.value = value == null ? "" : String(value);
    const status = $(`status-${id}`);
    if (band === "unset") status.textContent = "Ikke vurderet. En tom viser er ikke et grønt nul.";
    else if (band === "green") status.textContent = `Grønt bånd · ${value}. Inden for din grønne tærskel.`;
    else if (band === "yellow") status.textContent = `Gult bånd · ${value}. Mærk efter. Det er ikke Stop og korrigér.`;
    else status.textContent = `Rødt bånd · ${value}. Stop og korrigér.`;
    const prompt = $(`prompt-${id}`);
    if (band === "red" || band === "yellow") {
      prompt.hidden = false;
      prompt.textContent = COPY[id][band];
    } else {
      prompt.hidden = true;
      prompt.textContent = "";
    }
    const msg = $(`msg-${id}`);
    msg.textContent = note || "";
    const lamp = $(`lamp-${id}`);
    lamp.dataset.state = band;
    $(`lamp-state-${id}`).textContent = value == null ? "Ikke vurderet" : `${bandLabel(band)} · ${value}`;
    setFlag(id, value == null);
    updateDial(id);
  }

  function renderBands() {
    const custom = state.greenMax !== DEFAULT_GREEN || state.yellowMax !== DEFAULT_YELLOW;
    const greenSpan = state.greenMax + 1;
    const yellowSpan = state.yellowMax - state.greenMax;
    const redSpan = 100 - state.yellowMax;
    const bar = $("band-bar");
    bar.querySelector('[data-part="green"]').style.flexGrow = String(greenSpan);
    bar.querySelector('[data-part="yellow"]').style.flexGrow = String(yellowSpan);
    bar.querySelector('[data-part="red"]').style.flexGrow = String(redSpan);
    const root = document.documentElement;
    root.style.setProperty("--g", `${state.greenMax + 0.5}%`);
    root.style.setProperty("--y", `${state.yellowMax + 0.5}%`);
    const kind = custom ? "Dine egne tal, ikke en målt grænse." : "Foreslåede udgangsværdier.";
    $("band-summary").textContent =
      `Bånd i brug: 0–${state.greenMax} grønt, ${state.greenMax + 1}–${state.yellowMax} gult, ${state.yellowMax + 1}–100 rødt. ${kind}`;
  }

  function renderMaster(announceChange) {
    const rows = GAUGES.map((id) => ({ id, value: state.values[id], band: bandOf(state.values[id]) }));
    const reds = rows.filter((row) => row.band === "red");
    const yellows = rows.filter((row) => row.band === "yellow");
    const unset = rows.filter((row) => row.band === "unset");
    let mode;
    let title;
    let text;
    if (reds.length) {
      mode = "stop";
      title = "Stop og korrigér";
      text = "Mindst én viser står i dit røde bånd. De grønne vejer det ikke op, og panelet laver ikke et gennemsnit. Hold pause, juster og vurder igen. Det er ikke et nødkald.";
      if (unset.length) text += " Nogle visere er stadig ikke vurderet. Det røde står alligevel.";
    } else if (unset.length) {
      mode = "open";
      title = "Ikke afklaret";
      text = "Tomme visere er ikke grønne. Panelet viser ikke fri bane, før alle fem er sat, og ingen står i rødt.";
      if (yellows.length) text += " Der er gult blandt dem, du har sat. Gult er heller ikke fri bane.";
    } else if (yellows.length) {
      mode = "watch";
      title = "Mærk efter";
      text = "Alle fem er sat. Ingen er røde, men mindst én er i det gule bånd. Gult er ikke fri bane, og det er ikke Stop og korrigér.";
    } else {
      mode = "clear";
      title = "Inden for dine grønne bånd";
      text = "Alle fem visere er sat, og ingen er i gult eller rødt efter de bånd, du bruger nu. Det er stadig dine tal, ikke en måling og ikke et bevis.";
    }
    $("annunciator").dataset.state = mode;
    $("master-title").textContent = title;
    $("master-text").textContent = text;
    const box = $("master-reflections");
    box.replaceChildren();
    if (reds.length) {
      const intro = document.createElement("p");
      intro.className = "reflection-intro";
      intro.textContent = "Det, de røde visere viser. De er dine indtastninger, ikke en måling.";
      const list = document.createElement("ul");
      list.className = "reflections";
      for (const row of reds) {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = COPY[row.id].lamp;
        li.append(strong, document.createTextNode(` ${COPY[row.id].red}`));
        list.append(li);
      }
      box.append(intro, list);
    }
    const signature = `${mode}:${rows.map((row) => row.band).join("")}`;
    if (announceChange && booted && signature !== state.signature) {
      $("live").textContent = `${title}. ${text}`;
    }
    state.signature = signature;
  }

  function renderAll(noteById = {}) {
    renderBands();
    for (const id of GAUGES) renderGauge(id, noteById[id] || "");
    renderMaster(true);
  }

  function isDirty() {
    if (state.note.trim()) return true;
    if (state.greenMax !== DEFAULT_GREEN || state.yellowMax !== DEFAULT_YELLOW) return true;
    return GAUGES.some((id) => state.values[id] != null);
  }

  function payload() {
    return {
      v: 1,
      note: state.note,
      thresholds: { greenMax: state.greenMax, yellowMax: state.yellowMax },
      values: state.values,
    };
  }

  function setSaveStatus(text) {
    $("save-status").textContent = text;
  }

  function persistNow() {
    if (!state.autosave) {
      setSaveStatus("Ikke gemt. Lokal gemning er slået fra, og intet sendes.");
      return;
    }
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(payload()));
      setSaveStatus("Gemt lokalt i denne browser. Intet er sendt.");
    } catch {
      setSaveStatus("Kunne ikke gemme i denne browser. Tallene bliver kun stående, mens siden er åben. Intet er sendt.");
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(persistNow, 180);
  }

  function flushSave() {
    clearTimeout(saveTimer);
    if (state.autosave) persistNow();
  }

  function setGauge(id, value, options = {}) {
    state.values[id] = value;
    const range = $(`range-${id}`);
    const num = $(`num-${id}`);
    range.value = String(value);
    if (options.source !== "number" || options.note) num.value = String(value);
    num.setAttribute("aria-invalid", "false");
    renderAll({ [id]: options.note || "" });
    if (options.persist !== false) scheduleSave();
  }

  function clearGauge(id, options = {}) {
    state.values[id] = null;
    const range = $(`range-${id}`);
    const num = $(`num-${id}`);
    range.value = "50";
    num.value = "";
    num.setAttribute("aria-invalid", "false");
    renderAll({ [id]: options.message || "" });
    if (options.persist !== false) scheduleSave();
  }

  function parseGauge(raw) {
    const trimmed = String(raw).trim().replace(",", ".");
    if (trimmed === "") return { kind: "empty" };
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return { kind: "invalid" };
    let note = "";
    let value = n;
    if (!Number.isInteger(n)) {
      value = Math.round(n);
      note = "Afrundet til et helt tal.";
    }
    if (value < 0) {
      value = 0;
      note = "Skalaen starter ved 0. Tallet er sat til 0.";
    } else if (value > 100) {
      value = 100;
      note = "Skalaen slutter ved 100. Tallet er sat til 100.";
    }
    return { kind: "value", value, note };
  }

  function onNumber(id) {
    const input = $(`num-${id}`);
    if (input.validity && input.validity.badInput) {
      $(`msg-${id}`).textContent = "Skriv et tal mellem 0 og 100.";
      input.setAttribute("aria-invalid", "true");
      return;
    }
    const parsed = parseGauge(input.value);
    if (parsed.kind === "empty") {
      clearGauge(id, { message: "Viseren er tømt. Den er ikke grøn." });
      return;
    }
    if (parsed.kind === "invalid") {
      $(`msg-${id}`).textContent = "Skriv et tal mellem 0 og 100.";
      input.setAttribute("aria-invalid", "true");
      return;
    }
    input.setAttribute("aria-invalid", "false");
    setGauge(id, parsed.value, { source: "number", note: parsed.note });
  }

  function readThresholds() {
    const greenEl = $("green-max");
    const yellowEl = $("yellow-max");
    const bad = (el) => (el.validity && el.validity.badInput) || el.value.trim() === "";
    if (bad(greenEl) || bad(yellowEl)) {
      return { ok: false, message: "Skriv hele tal i begge felter." };
    }
    const green = Number(greenEl.value.replace(",", "."));
    const yellow = Number(yellowEl.value.replace(",", "."));
    if (!Number.isInteger(green) || !Number.isInteger(yellow)) {
      return { ok: false, message: "Skriv hele tal. Båndene springer ikke i decimaler." };
    }
    if (green < 0 || green > 98 || yellow < 1 || yellow > 99) {
      return { ok: false, message: "Grønt skal være fra 0 til 98. Gult skal være fra 1 til 99, så 100 kan ligge i rødt." };
    }
    if (green >= yellow) {
      return { ok: false, message: "Det grønne bånd skal slutte før det gule." };
    }
    return { ok: true, greenMax: green, yellowMax: yellow };
  }

  function applyThresholdsFromInputs() {
    const result = readThresholds();
    const greenEl = $("green-max");
    const yellowEl = $("yellow-max");
    const error = $("threshold-error");
    if (!result.ok) {
      error.textContent = result.message;
      greenEl.setAttribute("aria-invalid", "true");
      yellowEl.setAttribute("aria-invalid", "true");
      return;
    }
    error.textContent = "";
    greenEl.setAttribute("aria-invalid", "false");
    yellowEl.setAttribute("aria-invalid", "false");
    if (result.greenMax === state.greenMax && result.yellowMax === state.yellowMax) {
      renderBands();
      return;
    }
    state.greenMax = result.greenMax;
    state.yellowMax = result.yellowMax;
    renderAll();
    scheduleSave();
  }

  function restoreDefaults() {
    if (state.greenMax === DEFAULT_GREEN && state.yellowMax === DEFAULT_YELLOW && $("threshold-error").textContent === "") {
      $("threshold-error").textContent = "";
      $("reset-status").textContent = "De foreslåede udgangsværdier er allerede i brug.";
      return;
    }
    state.greenMax = DEFAULT_GREEN;
    state.yellowMax = DEFAULT_YELLOW;
    $("green-max").value = String(DEFAULT_GREEN);
    $("yellow-max").value = String(DEFAULT_YELLOW);
    $("green-max").setAttribute("aria-invalid", "false");
    $("yellow-max").setAttribute("aria-invalid", "false");
    $("threshold-error").textContent = "";
    $("reset-status").textContent = "Foreslåede bånd er sat tilbage. Viserne er uændrede.";
    renderAll();
    scheduleSave();
  }

  function applyNote() {
    state.note = $("situation").value.slice(0, 400);
    $("note-count").textContent = `${state.note.length} / 400`;
    scheduleSave();
  }

  function fillFromState() {
    $("situation").value = state.note;
    $("note-count").textContent = `${state.note.length} / 400`;
    $("green-max").value = String(state.greenMax);
    $("yellow-max").value = String(state.yellowMax);
    for (const id of GAUGES) {
      const value = state.values[id];
      const num = $(`num-${id}`);
      const range = $(`range-${id}`);
      if (value == null) {
        num.value = "";
        range.value = "50";
      } else {
        num.value = String(value);
        range.value = String(value);
      }
    }
    renderAll();
  }

  function validPayload(data) {
    if (!data || data.v !== 1 || !data.values || !data.thresholds) return null;
    const values = {};
    for (const id of GAUGES) {
      const n = data.values[id];
      values[id] = Number.isInteger(n) && n >= 0 && n <= 100 ? n : null;
    }
    const green = data.thresholds.greenMax;
    const yellow = data.thresholds.yellowMax;
    if (!Number.isInteger(green) || !Number.isInteger(yellow) || green < 0 || yellow > 99 || green >= yellow) {
      return null;
    }
    const note = typeof data.note === "string" ? data.note.slice(0, 400) : "";
    return { values, greenMax: green, yellowMax: yellow, note };
  }

  function loadStorage() {
    let pref = null;
    try { pref = localStorage.getItem(PREF_KEY); } catch { pref = null; }
    state.autosave = pref !== "off";
    $("autosave").checked = state.autosave;
    if (!state.autosave) {
      try { localStorage.removeItem(DATA_KEY); } catch { /* ignorer */ }
      setSaveStatus("Lokal gemning er slået fra. Intet sendes, og nye tal gemmes ikke i browseren.");
      return;
    }
    let raw = null;
    try { raw = localStorage.getItem(DATA_KEY); } catch { raw = null; }
    if (!raw) {
      setSaveStatus("Intet gemt endnu. Når du sætter en viser, gemmes det kun i denne browser. Intet sendes.");
      return;
    }
    try {
      const parsed = validPayload(JSON.parse(raw));
      if (!parsed) throw new Error("bad");
      state.values = parsed.values;
      state.greenMax = parsed.greenMax;
      state.yellowMax = parsed.yellowMax;
      state.note = parsed.note;
      setSaveStatus("Hentet fra denne browser. Intet er sendt.");
    } catch {
      setSaveStatus("Gemte data kunne ikke læses. Panelet starter uden vurdering. Intet er sendt.");
    }
  }

  function doReset() {
    clearTimeout(saveTimer);
    for (const id of GAUGES) state.values[id] = null;
    state.note = "";
    state.greenMax = DEFAULT_GREEN;
    state.yellowMax = DEFAULT_YELLOW;
    $("threshold-error").textContent = "";
    $("green-max").setAttribute("aria-invalid", "false");
    $("yellow-max").setAttribute("aria-invalid", "false");
    fillFromState();
    try { localStorage.removeItem(DATA_KEY); } catch { /* ignorer */ }
    setSaveStatus(state.autosave
      ? "Panelet er nulstillet. Der ligger ingen kopi i denne browser. Intet er sendt."
      : "Panelet er nulstillet på skærmen. Lokal gemning er slået fra, og intet sendes.");
    $("reset-status").textContent = "Panelet er nulstillet.";
    $("live").textContent = "Panelet er nulstillet. Viserne er ikke vurderet.";
  }

  function applyAutosaveOff() {
    clearTimeout(saveTimer);
    state.autosave = false;
    try {
      localStorage.setItem(PREF_KEY, "off");
      localStorage.removeItem(DATA_KEY);
    } catch { /* ignorer */ }
    setSaveStatus("Lokal gemning er slået fra, og kopien i denne browser er slettet. Intet er sendt. Det på skærmen bliver væk, når du lukker siden.");
  }

  function openDialog(mode) {
    dialogMode = mode;
    const title = $("reset-title");
    const copy = $("reset-copy");
    const confirm = document.querySelector("#reset-dialog button[value='confirm']");
    if (mode === "reset") {
      title.textContent = "Nulstil panelet?";
      copy.textContent = "Viserne, situationen og de personlige bånd, som ligger i denne browser, slettes og sættes tilbage til udgangspunktet. Det kan ikke fortrydes her.";
      confirm.textContent = "Nulstil";
    } else {
      title.textContent = "Slå lokal gemning fra?";
      copy.textContent = "Kopien i denne browser slettes. Det, du ser nu, bliver på skærmen, indtil du lukker siden. Intet sendes.";
      confirm.textContent = "Slå fra og slet kopi";
    }
    window.setTimeout(() => {
      const dialog = $("reset-dialog");
      if (!dialog.open) dialog.showModal();
    }, 0);
  }

  function bind() {
    for (const id of GAUGES) {
      $(`range-${id}`).addEventListener("input", () => {
        setGauge(id, Number($(`range-${id}`).value), { source: "slider" });
      });
      $(`num-${id}`).addEventListener("input", () => onNumber(id));
      $(`clear-${id}`).addEventListener("click", () => {
        if (state.values[id] == null && $(`num-${id}`).value === "") {
          $(`msg-${id}`).textContent = "Viseren er allerede tom. Den er ikke grøn.";
          return;
        }
        clearGauge(id, { message: "Viseren er tømt. Den er ikke grøn." });
      });
    }
    $("green-max").addEventListener("input", applyThresholdsFromInputs);
    $("yellow-max").addEventListener("input", applyThresholdsFromInputs);
    $("restore-bands").addEventListener("click", restoreDefaults);
    $("situation").addEventListener("input", applyNote);
    $("reset").addEventListener("click", () => {
      let stored = null;
      try { stored = localStorage.getItem(DATA_KEY); } catch { stored = null; }
      if (!isDirty() && !stored) {
        $("reset-status").textContent = "Intet at nulstille. Panelet står allerede på udgangspunktet.";
        return;
      }
      openDialog("reset");
    });
    $("autosave").addEventListener("change", () => {
      if (suppressToggle) return;
      if ($("autosave").checked) {
        state.autosave = true;
        try { localStorage.setItem(PREF_KEY, "on"); } catch { /* ignorer */ }
        persistNow();
        return;
      }
      let stored = null;
      try { stored = localStorage.getItem(DATA_KEY); } catch { stored = null; }
      if (!stored && !isDirty()) {
        applyAutosaveOff();
        return;
      }
      openDialog("autosave");
    });
    $("reset-dialog").addEventListener("close", () => {
      if (dialogMode === "reset") {
        if ($("reset-dialog").returnValue === "confirm") doReset();
        return;
      }
      if ($("reset-dialog").returnValue === "confirm") {
        applyAutosaveOff();
        return;
      }
      suppressToggle = true;
      $("autosave").checked = true;
      state.autosave = true;
      suppressToggle = false;
    });
    document.querySelectorAll("input[type='number'], input[type='range']").forEach((el) => {
      el.addEventListener("wheel", (event) => {
        if (document.activeElement === el) event.preventDefault();
      }, { passive: false });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushSave();
    });
    window.addEventListener("pagehide", flushSave);
  }

  function buildLamps() {
    const list = $("lamps");
    for (const id of GAUGES) {
      const li = document.createElement("li");
      li.id = `lamp-${id}`;
      li.dataset.state = "unset";
      const name = document.createElement("span");
      name.className = "lamp-name";
      name.textContent = COPY[id].lamp;
      const status = document.createElement("span");
      status.className = "lamp-state";
      status.id = `lamp-state-${id}`;
      status.textContent = "Ikke vurderet";
      li.append(name, status);
      list.append(li);
    }
  }

  buildLamps();
  for (const id of GAUGES) mountDial(id);
  bind();
  loadStorage();
  fillFromState();
  booted = true;
})();
