import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '../../portefolje-simulator');
await mkdir(output, { recursive: true });
const result = await build({
  absWorkingDir: here,
  entryPoints: ['main.tsx'],
  bundle: true,
  minify: true,
  target: ['es2020'],
  entryNames: 'app-[hash]',
  outdir: output,
  metafile: true,
  define: { 'process.env.NODE_ENV': '"production"' }
});
execFileSync(process.execPath, [
  path.join(here, 'node_modules/tailwindcss/lib/cli.js'),
  '-c', 'tailwind.config.cjs', '-i', 'input.css',
  '-o', path.join(output, 'styles.css'), '--minify'
], { cwd: here, stdio: 'inherit' });
const bundle = path.basename(Object.keys(result.metafile.outputs).find(name => name.endsWith('.js')));
await writeFile(path.join(output, 'index.html'), `<!doctype html>
<html lang="da">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#020617" />
    <title>Portefølje- og tradingsimulator · Eastwood451</title>
    <meta name="description" content="Simulér aktiehandel og sammenlign porteføljer på almindeligt depot og aktiesparekonto." />
    <script src="/auth.js?v=20261002-shortcuts"></script>
    <link rel="stylesheet" href="./styles.css" />
    <script src="./${bundle}" defer></script>
  </head>
  <body>
    <div id="root"></div>
    <noscript>Slå JavaScript til for at bruge simulatoren.</noscript>
  </body>
</html>
`);
console.log('Built portefolje-simulator/');
