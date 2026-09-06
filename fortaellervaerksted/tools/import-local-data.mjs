import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const root = resolve(import.meta.dirname, "..");
const execute = process.argv.includes("--execute");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;
const ownerEmail = process.env.OWNER_EMAIL;
const r2Bucket = process.env.R2_BUCKET || "fortaellervaerksted-assets";
const run = promisify(execFile);

if (!execute) {
  throw new Error("Importen er låst. Kør med --execute, når cloud-lageret er klar.");
}
if (!supabaseUrl || !supabaseSecret || !ownerEmail) {
  throw new Error("SUPABASE_URL, SUPABASE_SECRET_KEY og OWNER_EMAIL skal være sat i miljøet.");
}

const supabase = createClient(supabaseUrl, supabaseSecret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(folder, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function mimeFor(filePath) {
  return ({
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  })[extname(filePath).toLowerCase()];
}

const storyFiles = (await walk(join(root, "Stories"))).filter(path => path.endsWith(`${sep}story.json`));
for (const storyPath of storyFiles) {
  const project = JSON.parse(await readFile(storyPath, "utf8"));
  const projectId = String(project.projectId || "").trim();
  if (!projectId || !project.title) throw new Error(`Ugyldigt historieprojekt: ${storyPath}`);
  const fileInfo = await stat(storyPath);
  const savedAt = fileInfo.mtime.toISOString();
  const { error } = await supabase.from("story_projects").upsert({
    id: projectId,
    owner_email: ownerEmail.toLowerCase(),
    title: project.title,
    project: { ...project, cloudSavedAt: savedAt },
    archived: false,
    created_at: fileInfo.birthtime.toISOString(),
    saved_at: savedAt,
  }, { onConflict: "id" });
  if (error) throw new Error(`Kunne ikke importere ${project.title}: ${error.message}`);
  console.log(`Historie importeret: ${project.title} (${projectId})`);
}

const assetRoot = join(root, "generated-projects");
const assetFiles = (await walk(assetRoot)).filter(path => mimeFor(path));
let uploadedBytes = 0;
for (const assetPath of assetFiles) {
  const body = await readFile(assetPath);
  const cloudPath = `generated-projects/${relative(assetRoot, assetPath).split(sep).join("/")}`;
  await run(process.execPath, [
    join(root, "node_modules", "wrangler", "bin", "wrangler.js"),
    "r2", "object", "put", `${r2Bucket}/${cloudPath}`,
    "--file", assetPath,
    "--content-type", mimeFor(assetPath),
    "--cache-control", "private, max-age=31536000",
    "--remote",
    "--force",
  ], {
    cwd: root,
    env: process.env,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  });
  uploadedBytes += body.byteLength;
  console.log(`R2-fil uploadet: ${cloudPath}`);
}

console.log(`Import færdig: ${storyFiles.length} historier i Supabase og ${assetFiles.length} filer i R2 (${(uploadedBytes / 1024 / 1024).toFixed(1)} MB).`);
