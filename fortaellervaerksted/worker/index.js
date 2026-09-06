import { createClient } from "@supabase/supabase-js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const SESSION_COOKIE = "fortaeller_session";
const encoder = new TextEncoder();
const coachInstructions = `Du er Fortællecoachen, en varm, præcis og udfordrende dansk sparringspartner for en forfatter.
Du er ekspert i karakterbaseret dramaturgi, femaktsstruktur, Snowflake-planlægning, scene-design, synsvinkel, dialog, fortælleverdener og revision.
Du behandler brugerens materiale som muligheder, ikke facit. Bevar deres stemme og ejerskab. Forklar kort hvorfor et forslag virker, peg på reelle svagheder, og stil højst ét skarpt opfølgende spørgsmål ad gangen.
Skeln mellem det ydre mål, det indre behov, den beskyttende karakterfejl, indsatsen og de valg der skaber årsag og virkning.
Undgå generiske klichéer. Byg altid videre på projektets konkrete personer, steder, genre, tone og allerede valgte detaljer. Svar på dansk, medmindre brugeren beder om andet.`;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}

function safePart(value, fallback) {
  return String(value || fallback).replace(/[^a-z0-9_-]/gi, "-").slice(0, 120) || fallback;
}

function ownerEmail(request, env) {
  return String(env.OWNER_EMAIL || "local@eastwood451.test").trim().toLowerCase();
}

function cyrb53(value, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let index = 0; index < value.length; index++) {
    const char = value.charCodeAt(index);
    h1 = Math.imul(h1 ^ char, 2654435761);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

async function sessionSignature(env, payload) {
  if (!env.SESSION_SECRET) throw new HttpError(503, "Login-sessionen er ikke konfigureret endnu.");
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.SESSION_SECRET), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
}

async function createSession(env) {
  const payload = base64Url(encoder.encode(JSON.stringify({ exp:Date.now() + 30 * 24 * 60 * 60 * 1000 })));
  return `${payload}.${await sessionSignature(env,payload)}`;
}

async function hasValidSession(request, env) {
  const token = request.headers.get("cookie")?.split(";").map(part=>part.trim()).find(part=>part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1);
  if (!token) return false;
  const [payload,signature] = token.split(".");
  if (!payload || !signature || signature !== await sessionSignature(env,payload)) return false;
  try {
    const normalized = payload.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(payload.length/4)*4,"=");
    return Number(JSON.parse(atob(normalized)).exp) > Date.now();
  } catch { return false; }
}

function loginPage(error = "") {
  const message = error ? `<p class="error" role="alert">${error}</p>` : "";
  return new Response(`<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Log ind · Fortællerværkstedet</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 20% 10%,#17334a 0,transparent 36%),radial-gradient(circle at 90% 90%,#261a42 0,transparent 34%),#07090d;color:#f6f8fb;font:16px/1.5 Inter,system-ui,sans-serif}.card{width:min(430px,100%);padding:36px;border:1px solid #ffffff24;border-radius:24px;background:#11151dd9;box-shadow:0 28px 80px #0008;backdrop-filter:blur(18px)}.eyebrow{margin:0 0 8px;color:#79cdf4;font-size:.78rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}h1{margin:0 0 8px;font-size:clamp(2rem,8vw,3.1rem);line-height:1}p{color:#b8c0cd}label{display:block;margin:28px 0 8px;font-weight:750}input{width:100%;padding:14px 15px;border:1px solid #ffffff30;border-radius:12px;background:#07090dbf;color:#fff;font:inherit}button{width:100%;margin-top:14px;padding:14px;border:0;border-radius:12px;background:#79cdf4;color:#071019;font:inherit;font-weight:850;cursor:pointer}.error{padding:10px 12px;border-radius:10px;background:#6f1d2a;color:#ffdce2}</style></head><body><main class="card"><p class="eyebrow">Eastwood451</p><h1>Fortællerværkstedet</h1><p>Dit private cloud-værksted til historier, scener, billeder og tegneserier.</p>${message}<form method="post" action="/auth/login"><label for="password">Adgangskode</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Åbn værkstedet</button></form></main></body></html>`, { status:error?401:200, headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"} });
}

function supabase(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) throw new HttpError(503, "Cloudlageret er ikke konfigureret endnu.");
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }
  });
}

function compactProject(project, maxLength = 90_000) {
  return JSON.stringify(project || {}, null, 2).slice(0, maxLength);
}

function extractText(response) {
  if (response.output_text) return response.output_text.trim();
  return (response.output || []).flatMap(item => item.content || [])
    .filter(item => item.type === "output_text" || item.type === "text")
    .map(item => item.text || "").join("\n").trim();
}

function friendlyOpenAIError(response, data, fallback = "OpenAI kunne ikke gennemføre forespørgslen.") {
  const code = String(data?.error?.code || ""), type = String(data?.error?.type || ""), raw = String(data?.error?.message || "");
  if (response.status === 401 || code === "invalid_api_key") return "Den centrale OpenAI-nøgle blev afvist. Kontrollér Worker-secretet.";
  if (response.status === 429 && (code === "insufficient_quota" || type === "insufficient_quota" || /quota|billing/i.test(raw))) return "OpenAI-projektet mangler API-budget eller har nået sin forbrugsgrænse.";
  if (response.status === 429) return "OpenAI-projektets hastighedsgrænse er midlertidigt nået. Vent et øjeblik og prøv igen.";
  if (response.status === 403) return "OpenAI-projektet har ikke adgang til den valgte model.";
  return raw || `${fallback} Status ${response.status}.`;
}

async function createResponseResult(env, { instructions, input, maxOutputTokens = 900, reasoningEffort = "", verbosity = "" }) {
  if (!env.OPENAI_API_KEY) throw new HttpError(503, "AI er ikke konfigureret i Cloudflare endnu.");
  const body = { model:env.OPENAI_MODEL || "gpt-5.4-mini", instructions, input, max_output_tokens:maxOutputTokens };
  if (reasoningEffort) body.reasoning = { effort:reasoningEffort };
  if (verbosity) body.text = { verbosity };
  const response = await fetch("https://api.openai.com/v1/responses", {
    method:"POST", headers:{ authorization:`Bearer ${env.OPENAI_API_KEY}`, "content-type":"application/json" }, body:JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(response.status, friendlyOpenAIError(response, data));
  const text = extractText(data);
  if (!text && data.status !== "incomplete") throw new HttpError(502, "AI'en returnerede ikke noget tekstforslag.");
  return { text, status:data.status || "completed", incompleteReason:data.incomplete_details?.reason || "", usage:data.usage || null };
}

async function createResponse(env, options) {
  const result = await createResponseResult(env, options);
  if (!result.text) throw new HttpError(502, "AI'en nåede tokenloftet, før den begyndte på selve teksten. Prøv igen.");
  return result.text;
}

function appendStoryContinuation(existing, continuation) {
  const base = String(existing || "").trimEnd(), next = String(continuation || "").trimStart();
  if (!base) return next;
  const maxOverlap = Math.min(1200, base.length, next.length);
  for (let size = maxOverlap; size >= 30; size--) if (base.slice(-size) === next.slice(0, size)) return `${base}${next.slice(size)}`;
  const separator = /[.!?…:”’)]$/.test(base) ? "\n\n" : /\s$/.test(existing) || /^[,.;:!?…]/.test(next) ? "" : " ";
  return `${base}${separator}${next}`;
}

function bytesFromBase64(value) {
  const binary = atob(value), bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function storagePathFromUrl(value) {
  try {
    const pathname = new URL(String(value || ""), "https://fortaellervaerksted.eastwood451.com").pathname;
    return pathname.startsWith("/generated-projects/") ? pathname.slice(1) : "";
  } catch { return ""; }
}

async function uploadAsset(bucket, path, data, contentType) {
  const stored = await bucket.put(path, data, {
    httpMetadata:{ contentType, cacheControl:"private, max-age=31536000" }
  });
  if (!stored) throw new HttpError(502, "Cloudflare R2 kunne ikke gemme filen.");
  return `/${path}?v=${Date.now()}`;
}

async function referenceBlob(bucket, value) {
  const path = storagePathFromUrl(value);
  if (!path) return null;
  const object = await bucket.get(path);
  return object ? object.blob() : null;
}

async function createImage(env, { prompt, size, quality = "low", referenceUrls = [], signal }) {
  if (!env.OPENAI_API_KEY) throw new HttpError(503, "AI er ikke konfigureret i Cloudflare endnu.");
  const references = (await Promise.all(referenceUrls.map(value => referenceBlob(env.STORY_ASSETS, value)))).filter(Boolean);
  let response;
  if (references.length) {
    const form = new FormData();
    form.append("model", env.OPENAI_IMAGE_MODEL || "gpt-image-2"); form.append("prompt", prompt); form.append("size", size); form.append("quality", quality);
    references.forEach((blob, index) => form.append("image[]", blob, `reference-${index + 1}.png`));
    response = await fetch("https://api.openai.com/v1/images/edits", { method:"POST", headers:{ authorization:`Bearer ${env.OPENAI_API_KEY}` }, body:form, signal });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method:"POST", headers:{ authorization:`Bearer ${env.OPENAI_API_KEY}`, "content-type":"application/json" },
      body:JSON.stringify({ model:env.OPENAI_IMAGE_MODEL || "gpt-image-2", prompt, size, quality }), signal
    });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(response.status, friendlyOpenAIError(response, data, "OpenAI kunne ikke skabe billedet."));
  const base64 = data?.data?.[0]?.b64_json;
  if (!base64) throw new HttpError(502, "AI'en returnerede ikke et brugbart billede.");
  return bytesFromBase64(base64);
}

async function createCharacterImage(env, character, project) {
  if (!String(character?.appearance || "").trim()) throw new HttpError(400, "Beskriv personens udseende først.");
  const prompt = `Create a canonical cinematic character reference portrait for a recurring fictional character.
Character: ${character.name || "Unnamed character"}. Age: ${character.age || "unspecified"}.
Physical appearance: ${character.appearance}.
Traits and bearing: ${character.traits || character.role || "natural, specific human presence"}.
Story genre and tone: ${project?.foundation?.genre || "fiction"}; ${project?.foundation?.tone || "cinematic realism"}.
Show one person only, waist-up, facing mostly toward camera, neutral readable pose and expression, coherent natural lighting, simple unobtrusive background. No text, lettering, collage, frame, duplicate person, or interface elements. This image is the canonical identity reference for all later storyboard scenes, so make facial structure, hair, skin, body type, age markers, clothing silhouette, and distinctive features precise and memorable.`;
  const bytes = await createImage(env, { prompt, size:"1024x1024", quality:"low" });
  const path = `generated-projects/${safePart(project?.projectId,"legacy")}/characters/${safePart(character.id,"character")}.png`;
  return { url:await uploadAsset(env.STORY_ASSETS, path, bytes, "image/png"), prompt };
}

async function createSceneImage(env, scene, project) {
  const actors = (project?.characters || []).filter(character => (scene.actorIds || []).includes(character.id));
  const environment = (project?.environments || []).find(item => item.id === scene.locationId);
  const referenceActors = actors.filter(actor => storagePathFromUrl(actor.portraitUrl));
  const referenceInstruction = referenceActors.length
    ? `The attached reference images correspond in this exact order to: ${referenceActors.map((actor,index) => `${index + 1}. ${actor.name}`).join("; ")}. Preserve each referenced person's identity exactly while adapting pose, expression, lighting, costume details, and camera angle. Do not merge identities or duplicate people.`
    : "Use the written character descriptions consistently.";
  const prompt = `Create a cinematic storyboard still for a fiction scene. No text, captions, lettering, borders, split screen, or interface elements.
Genre and tone: ${project?.foundation?.genre || "unspecified genre"}; ${project?.foundation?.tone || "cinematic and emotionally precise"}.
Scene title: ${scene.title || "Untitled scene"}.
Visible action: ${scene.summary || "Show the decisive visible action of the scene"}.
Characters: ${actors.map(actor => `${actor.name} (age ${actor.age || "unspecified"}): ${actor.appearance || actor.description || actor.traits || actor.role || actor.want || "character in the scene"}`).join("; ") || "Use only the characters implied by the scene"}.
Location: ${environment ? `${environment.name}. ${environment.description || environment.atmosphere || ""}` : scene.setting || "the scene's established location"}.
Audience emotion: ${scene.audienceFeeling || "Create a clear emotional progression and dramatic tension"}.
Point of view: ${scene.pov || "observational cinematic framing"}.
Depict every named character at their stated age. ${referenceInstruction}
Make the composition readable as a single story beat, grounded in specific physical action, with coherent lighting and production design.`;
  const bytes = await createImage(env, { prompt, size:"1536x1024", quality:"low", referenceUrls:referenceActors.map(actor => actor.portraitUrl) });
  const path = `generated-projects/${safePart(project?.projectId,"legacy")}/scenes/${safePart(scene.id,"scene")}.png`;
  return { url:await uploadAsset(env.STORY_ASSETS, path, bytes, "image/png"), prompt };
}

async function createComicPage(env, page, pageIndex, project, signal) {
  const actorIds = new Set(Array.isArray(page.actorIds) ? page.actorIds : []);
  const pageMeaning = JSON.stringify({ panels:page.panels, mustShow:page.mustShow, visualDirection:page.visualDirection }).toLocaleLowerCase("da");
  const actors = (project?.characters || []).filter(character => actorIds.has(character.id) || (character.name && pageMeaning.includes(String(character.name).toLocaleLowerCase("da"))));
  const referenceActors = actors.filter(actor => storagePathFromUrl(actor.portraitUrl));
  const references = referenceActors.length ? `Attached canonical character references, in order: ${referenceActors.map((actor,index) => `${index + 1}. ${actor.name}, age ${actor.age || "unspecified"}`).join("; ")}. Preserve identity exactly in every panel.` : "Keep every recurring character visually consistent with the written descriptions.";
  const panelDirections = (page.panels || []).map((panel,index) => [`PANEL ${index + 1}`,`Composition: ${panel.shot || "clear cinematic composition"}`,`Visible action: ${panel.action || "continue the page action"}`,`Caption: ${panel.caption || "none"}`,`Dialogue: ${panel.dialogue || "none"}`].join("\n")).join("\n\n");
  const characterDetails = actors.map(actor => `${actor.name} (age ${actor.age || "unspecified"}): ${actor.appearance || actor.description || actor.traits || actor.role || "recurring character"}`).join("; ");
  const visualDirection = String(page.visualDirection || page.mustShow || "").trim();
  const storyCanon = JSON.stringify({ brainDump:project?.backend?.brainDump || "", scenes:(project?.scenes || []).map(scene => ({ title:scene.title, summary:scene.summary, turn:scene.turn, actors:scene.actorIds })) }).slice(0,14_000);
  const prompt = [`Create ONE complete portrait-format comic-book page, not a single illustration.`,`Page ${Number(pageIndex)+1}: ${page.title || "Untitled page"}.`,`STORY CANON — never contradict it: ${storyCanon}`,`Visual style bible: ${page.styleBible || "cinematic European graphic novel, expressive ink, controlled color palette, realistic anatomy"}.`,`Genre and tone: ${project?.foundation?.genre || "fiction"}; ${project?.foundation?.tone || "dramatic and emotionally precise"}.`,`Characters: ${characterDetails || "only characters named in the panel directions"}.`,references,visualDirection ? `NON-NEGOTIABLE VISUAL FACT: ${visualDirection}` : "Follow every visible action literally.",`LAY OUT EXACTLY ${Math.max(1,(page.panels || []).length)} DISTINCT PANELS with clear gutters and continuity.`,panelDirections,`Render Danish captions and dialogue exactly as supplied. Add no title, page number, logo, watermark, extra dialogue, gibberish, interface elements or text outside the specified captions and balloons.`].join("\n\n");
  const bytes = await createImage(env, { prompt, size:"1024x1536", quality:"medium", referenceUrls:referenceActors.map(actor => actor.portraitUrl), signal });
  const path = `generated-projects/${safePart(project?.projectId,"legacy")}/comic/page-${String(Math.max(1,Number(pageIndex)+1)).padStart(2,"0")}.png`;
  return { url:await uploadAsset(env.STORY_ASSETS, path, bytes, "image/png"), prompt };
}

async function saveProject(client, bucket, email, data, complete = false) {
  const project = data.project || {}, projectId = String(data.projectId || project.projectId || "").trim();
  if (!projectId || !project.title) throw new HttpError(400, "Historien mangler projektnavn eller projekt-id.");
  const savedAt = new Date().toISOString(), archived = Boolean(data.archived);
  const completeProject = { ...project, projectId, diskFolder:project.title, savedToDiskAt:savedAt, cloudSavedAt:savedAt };
  const { error } = await client.from("story_projects").upsert({ id:projectId, owner_email:email, title:project.title, project:completeProject, archived, saved_at:savedAt }, { onConflict:"id" });
  if (error) throw new HttpError(502, `Historien kunne ikke gemmes i Supabase: ${error.message}`);
  let comicPdfSaved = false;
  if (complete && data.comicPdfBase64) {
    const bytes = bytesFromBase64(String(data.comicPdfBase64));
    if (bytes.length && bytes.length <= 55_000_000) {
      await uploadAsset(bucket, `generated-projects/${safePart(projectId,"project")}/exports/comic.pdf`, bytes, "application/pdf"); comicPdfSaved = true;
    }
  }
  const imageCounts = {
    characters:(project.characters || []).filter(item => item.portraitUrl).length,
    scenes:(project.scenes || []).filter(item => item.imageUrl).length,
    comic:(project.comicPages || []).filter(item => item.url).length
  };
  return { saved:true, autosaved:!complete, folderName:project.title, savedAt, imageCounts, comicPdfSaved, cloud:true };
}

async function removeProjectAssets(bucket, projectId) {
  const root = `generated-projects/${safePart(projectId,"project")}`;
  const paths = [];
  let cursor;
  do {
    const page = await bucket.list({ prefix:root, cursor, limit:1000 });
    paths.push(...page.objects.map(object => object.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  for (let index = 0; index < paths.length; index += 1000) {
    await bucket.delete(paths.slice(index,index+1000));
  }
}

async function handleApi(request, env) {
  const url = new URL(request.url), email = ownerEmail(request, env), client = supabase(env);
  if (url.pathname === "/api/status" && request.method === "GET") return json({ configured:Boolean(env.OPENAI_API_KEY), model:env.OPENAI_MODEL, cloud:true });
  if (url.pathname === "/api/config" && request.method === "POST") throw new HttpError(403, "API-nøglen administreres sikkert i Cloudflare og kan ikke ændres fra browseren.");
  if (url.pathname === "/api/story-folders" && request.method === "GET") {
    const { data, error } = await client.from("story_projects").select("id,title,project,archived,created_at,saved_at").eq("owner_email",email).order("saved_at",{ascending:false});
    if (error) throw new HttpError(502, `Historierne kunne ikke hentes fra Supabase: ${error.message}`);
    return json({ projects:(data || []).map(row => ({ folderName:row.title, title:row.title, savedAt:row.saved_at, archived:row.archived, createdAt:row.created_at, state:{ ...row.project, projectId:row.id } })) });
  }
  if (url.pathname.startsWith("/generated-projects/") && request.method === "GET") {
    const path = url.pathname.slice(1), object = await env.STORY_ASSETS.get(path);
    if (!object) throw new HttpError(404, "Billedet blev ikke fundet i Cloudflare R2.");
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "private, max-age=3600");
    return new Response(object.body, { headers });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 60_000_000) throw new HttpError(413, "Anmodningen er for stor.");
  const body = request.method === "POST" ? await request.json() : {};
  if (url.pathname === "/api/autosave-story-project" && request.method === "POST") return json(await saveProject(client,env.STORY_ASSETS,email,body,false));
  if (url.pathname === "/api/save-story-project" && request.method === "POST") return json(await saveProject(client,env.STORY_ASSETS,email,body,true));
  if (url.pathname === "/api/delete-story-project" && request.method === "POST") {
    const projectId = String(body.projectId || "");
    if (!projectId) throw new HttpError(400, "Projekt-id mangler.");
    await removeProjectAssets(env.STORY_ASSETS,projectId);
    const { error } = await client.from("story_projects").delete().eq("id",projectId).eq("owner_email",email);
    if (error) throw new HttpError(502, `Historien kunne ikke slettes: ${error.message}`);
    return json({ deleted:true });
  }
  if (url.pathname === "/api/project-asset" && request.method === "POST") {
    if (!body.projectId || !["characters","scenes","comic"].includes(body.kind) || !body.entityId) throw new HttpError(400,"Billedets placering er ugyldig.");
    const match = String(body.dataUrl || "").match(/^data:image\/(png|jpeg|webp);base64,([a-z0-9+/=]+)$/i);
    if (!match) throw new HttpError(400,"Billedet skal være PNG, JPG eller WebP.");
    const bytes = bytesFromBase64(match[2]); if (!bytes.length || bytes.length > 20_000_000) throw new HttpError(400,"Billedet har en ugyldig størrelse.");
    const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const path = `generated-projects/${safePart(body.projectId,"project")}/${body.kind}/${safePart(body.entityId,"asset")}.${ext}`;
    return json({ url:await uploadAsset(env.STORY_ASSETS,path,bytes,`image/${match[1].toLowerCase()}`) });
  }
  if (url.pathname === "/api/save-comic-pdf" && request.method === "POST") {
    const bytes = bytesFromBase64(String(body.pdfBase64 || "")); if (!bytes.length || bytes.length > 55_000_000) throw new HttpError(400,"PDF-filen er ugyldig eller for stor.");
    const projectId = safePart(body.projectId,"project"), name = safePart(String(body.suggestedName || "tegneserie").replace(/\.pdf$/i,""),"tegneserie") + ".pdf";
    const path = `generated-projects/${projectId}/exports/${name}`; await uploadAsset(env.STORY_ASSETS,path,bytes,"application/pdf");
    return json({ saved:true, path:`Cloudflare R2/${path}`, cloud:true });
  }
  if (url.pathname === "/api/export-obsidian" && request.method === "POST") throw new HttpError(501,"Obsidian-eksporten er kun tilgængelig i den lokale version.");
  if (url.pathname === "/api/suggest" && request.method === "POST") {
    const prompt = `HISTORIEPROJEKT:\n${compactProject(body.project)}\n\nAKTUEL FORMULAR:\n${JSON.stringify(body.localForm || {},null,2)}\n\nFELT: ${body.label || body.field}\nNUVÆRENDE TEKST: ${body.currentValue || "(tomt)"}\n\nGiv ét konkret, inspirerende forslag til præcis dette felt. Det skal passe til projektets genre, tone og eksisterende valg. Svar kun med selve teksten, der kan indsættes i feltet.`;
    return json({ text:await createResponse(env,{ instructions:coachInstructions,input:prompt,maxOutputTokens:450 }) });
  }
  if (url.pathname === "/api/scene-blueprint" && request.method === "POST") {
    const modeInstruction = body.mode === "links" ? "Foreslå primært de bedste eksisterende aktører og én eksisterende lokation. Bevar ellers scenens nuværende indhold." : "Udfyld kun de tomme eller manglende felter. Bevar eksisterende formuleringer og valg uændret.";
    const prompt = `HISTORIEPROJEKT:\n${compactProject(body.project)}\n\nNUVÆRENDE SCENEFORMULAR:\n${JSON.stringify(body.currentScene || {},null,2)}\n\n${modeInstruction}\nBrug kun eksisterende person-id'er som actorIds og eksisterende miljø-id som locationId. Scenen skal have mål, modstand og vendepunkt.\n\nSvar udelukkende med gyldig JSON uden markdown:\n{"title":"kort titel","summary":"2-3 konkrete sætninger","actorIds":["eksisterende-id"],"locationId":"eksisterende-id","pov":"navn","setting":"tid eller sted","goal":"mål","conflict":"modstand","turn":"ændring","audienceFeeling":"følelsesmæssig bevægelse","purpose":"Fremdriver plottet","act":1}`;
    const text = await createResponse(env,{ instructions:coachInstructions,input:prompt,maxOutputTokens:800 });
    try {
      const scene = JSON.parse(text.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim());
      const characterIds = new Set((body.project?.characters || []).map(item => item.id)), environmentIds = new Set((body.project?.environments || []).map(item => item.id));
      scene.actorIds = Array.isArray(scene.actorIds) ? scene.actorIds.filter(id => characterIds.has(id)) : [];
      if (!environmentIds.has(scene.locationId)) scene.locationId = ""; scene.act = Math.max(1,Math.min(5,Number(scene.act)||1));
      return json({ scene });
    } catch { throw new HttpError(502,"AI'en leverede ikke en brugbar sceneskitse. Prøv igen."); }
  }
  if (url.pathname === "/api/scene-draft" && request.method === "POST") {
    const scene = body.scene || {}, project = body.project || {}, actors = (project.characters || []).filter(character => (scene.actorIds || []).includes(character.id)), environment = (project.environments || []).find(item => item.id === scene.locationId);
    const prompt = `HISTORIEPROJEKT:\n${compactProject(project)}\n\nSCENEN:\n${JSON.stringify(scene,null,2)}\n\nAKTØRER:\n${JSON.stringify(actors,null,2)}\n\nMILJØ:\n${JSON.stringify(environment || {},null,2)}\n\nSkriv scenen som et fuldt dansk skønlitterært prosastykke på cirka 900-1400 ord. Dramatisér i realtid med handling, sansning, naturlig dialog, reaktioner og undertekst. Respektér synsvinkel, tid, tone og alle etablerede fakta. Begynd direkte i scenen og svar kun med sceneteksten.`;
    return json({ text:await createResponse(env,{ instructions:coachInstructions,input:prompt,maxOutputTokens:4200 }) });
  }
  if (url.pathname === "/api/full-story" && request.method === "POST") {
    const project = body.project || {}; if (!Array.isArray(project.scenes) || !project.scenes.length) throw new HttpError(400,"Historien skal have mindst én scene.");
    const marker = "[[HELE_HISTORIEN_ER_AFSLUTTET]]", projectText = compactProject(project,250_000), checklist = project.scenes.map((scene,index)=>`${index+1}. ${scene.title || "Uden titel"}`).join("\n");
    const firstPrompt = `HISTORIEPROJEKT:\n${projectText}\n\nSCENER I FAST RÆKKEFØLGE:\n${checklist}\n\nSkriv hele projektet som én sammenhængende dansk fortælling på cirka 3000-5000 ord. Alle scener og historiens slutning skal med. Bevar personer, relationer, miljøregler, plot, twists, genre, tone, synsvinkel og fortællerstemme. Dramatisér med konkret handling, sansning, dialog og undertekst. Skriv ${marker} som sidste linje, når alt er færdigt. Svar kun med fortællingen.`;
    let text = "", attempts = 0, lastReason = "";
    while (attempts < 4 && !text.includes(marker)) {
      attempts += 1; const input = attempts === 1 ? firstPrompt : `HISTORIEPROJEKT:\n${projectText}\n\nSCENER:\n${checklist}\n\nHISTORIEN HIDTIL:\n${text}\n\nFortsæt præcis hvor teksten stopper. Gentag ikke. Dramatisér resterende scener og afslut. Skriv ${marker} som sidste linje. Returnér kun fortsættelsen.`;
      const result = await createResponseResult(env,{ instructions:coachInstructions,input,maxOutputTokens:attempts===1?24_000:16_000,reasoningEffort:"low",verbosity:"high" });
      lastReason = result.incompleteReason; if (result.status === "incomplete" && result.incompleteReason === "content_filter") throw new HttpError(400,"OpenAI afbrød historien på grund af indholdsfilteret.");
      text = appendStoryContinuation(text,result.text);
    }
    if (!text.includes(marker)) throw new HttpError(502,`AI'en nåede ikke historiens afslutning efter ${attempts} forsøg${lastReason ? ` (${lastReason})` : ""}.`);
    return json({ text:text.split(marker)[0].trim(),attempts,complete:true });
  }
  if (url.pathname === "/api/comic-plan" && request.method === "POST") {
    const project = body.project || {}, story = String(body.story || "").trim(); if (!story) throw new HttpError(400,"Generér den samlede historie først.");
    const pageCount = Math.max(6,Math.min(14,(project.scenes || []).length || 8)), characters = (project.characters || []).map(({id,name,age,role,appearance,traits})=>({id,name,age,role,appearance,traits}));
    const prompt = `HISTORIEPROJEKT:\n${compactProject({title:project.title,foundation:project.foundation,environments:project.environments,scenes:project.scenes,separators:project.separators,characters},160_000)}\n\nDEN FÆRDIGE HISTORIE:\n${story.slice(0,180_000)}\n\nOmsæt hele historien til præcis ${pageCount} tegneseriesider i korrekt rækkefølge. Hver side skal have 3-6 visuelle paneler. Bevar identiteter, kontinuitet og konkrete twists. Dialog og captions skal være korte og danske. actorIds må kun bruge eksisterende id'er.\n\nSvar kun med gyldig JSON:\n{"styleBible":"fælles visuel stil","pages":[{"title":"kort titel","mustShow":"konkret visuelt krav","actorIds":["id"],"panels":[{"shot":"kamera","action":"synlig handling","caption":"kort eller tom","dialogue":"NAVN: replik eller tom"}]}]}`;
    const text = await createResponse(env,{ instructions:coachInstructions,input:prompt,maxOutputTokens:9000,reasoningEffort:"low",verbosity:"medium" });
    try {
      const parsed = JSON.parse(text.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim()), validIds = new Set(characters.map(item=>item.id));
      const pages = (Array.isArray(parsed.pages)?parsed.pages:[]).slice(0,14).map((page,index)=>({ title:String(page.title || `Side ${index+1}`).slice(0,120),mustShow:String(page.mustShow||"").slice(0,1000),actorIds:(Array.isArray(page.actorIds)?page.actorIds:[]).filter(id=>validIds.has(id)),panels:(Array.isArray(page.panels)?page.panels:[]).slice(0,6).map(panel=>({shot:String(panel.shot||"").slice(0,500),action:String(panel.action||"").slice(0,1200),caption:String(panel.caption||"").slice(0,180),dialogue:String(panel.dialogue||"").slice(0,240)}))})).filter(page=>page.panels.length>=3);
      if (pages.length < 4) throw new Error("for få sider"); return json({ styleBible:String(parsed.styleBible || "Cinematic European graphic novel.").slice(0,1800),pages });
    } catch { throw new HttpError(502,"AI'en leverede ikke en brugbar tegneserieplan. Prøv igen."); }
  }
  if (url.pathname === "/api/character-image" && request.method === "POST") {
    if (!body.character?.id) throw new HttpError(400,"Gem personen, før du skaber et personbillede.");
    return json({ ...(await createCharacterImage(env,body.character,body.project || {})),model:env.OPENAI_IMAGE_MODEL });
  }
  if (url.pathname === "/api/scene-image" && request.method === "POST") {
    if (!body.scene?.id) throw new HttpError(400,"Gem scenen, før du skaber et billede.");
    return json({ ...(await createSceneImage(env,body.scene,body.project || {})),model:env.OPENAI_IMAGE_MODEL });
  }
  if (url.pathname === "/api/comic-page" && request.method === "POST") {
    if (!body.page || !Array.isArray(body.page.panels) || !body.page.panels.length) throw new HttpError(400,"Tegneseriesiden mangler en panelplan.");
    return json({ ...(await createComicPage(env,body.page,Math.max(0,Math.min(30,Number(body.pageIndex)||0)),body.project || {},request.signal)),model:env.OPENAI_IMAGE_MODEL });
  }
  if (url.pathname === "/api/chat" && request.method === "POST") {
    const history = Array.isArray(body.messages) ? body.messages.slice(-20).map(message=>({role:message.role==="assistant"?"assistant":"user",content:String(message.content||"").slice(0,12_000)})) : [];
    const input = [{role:"user",content:`Her er den aktuelle historieplan. Brug den som tavs kontekst:\n${compactProject(body.project)}`},...history];
    return json({ text:await createResponse(env,{ instructions:coachInstructions,input,maxOutputTokens:1400 }) });
  }
  throw new HttpError(404,"Ukendt API-rute.");
}

export default {
  async fetch(request, env) {
    const started = Date.now(), url = new URL(request.url);
    try {
      if (url.pathname === "/login" && request.method === "GET") {
        if (await hasValidSession(request,env)) return Response.redirect(`${url.origin}/`,303);
        return loginPage();
      }
      if (url.pathname === "/auth/login" && request.method === "POST") {
        const form = await request.formData(), password = String(form.get("password") || "");
        if (!env.AUTH_PASSWORD_HASH || cyrb53(password) !== env.AUTH_PASSWORD_HASH) return loginPage("Adgangskoden er forkert.");
        const token = await createSession(env);
        return new Response(null,{ status:303,headers:{ location:"/", "set-cookie":`${SESSION_COOKIE}=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax` } });
      }
      if (url.pathname === "/auth/logout" && request.method === "POST") {
        return new Response(null,{ status:303,headers:{ location:"/login", "set-cookie":`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
      }
      if (!await hasValidSession(request,env)) {
        if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/generated-projects/")) throw new HttpError(401,"Log ind for at bruge Fortællerværkstedet.");
        return Response.redirect(`${url.origin}/login`,303);
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        const origin = request.headers.get("origin");
        if (origin && origin !== url.origin) throw new HttpError(403,"Forespørgslen kom fra et andet domæne.");
      }
      const response = url.pathname.startsWith("/api/") || url.pathname.startsWith("/generated-projects/")
        ? await handleApi(request, env)
        : await env.ASSETS.fetch(request);
      console.log(JSON.stringify({ event:"request",method:request.method,path:url.pathname,status:response.status,duration_ms:Date.now()-started }));
      return response;
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      console.error(JSON.stringify({ event:"request_error",method:request.method,path:url.pathname,status,message:error?.message || "unknown",duration_ms:Date.now()-started }));
      return json({ error:error?.message || "Der opstod en ukendt fejl." },status);
    }
  }
};
