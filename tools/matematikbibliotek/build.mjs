import {execFileSync} from 'node:child_process';
import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
const output=path.resolve('dist');
if(path.dirname(output)!==process.cwd()||path.basename(output)!=='dist')throw new Error('Invalid build directory');
await rm(output,{recursive:true,force:true});
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const extra=execFileSync('git',['ls-files','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const denied=/^(?:\.git|\.github|\.agents|tools\/|tests\/|supabase\/|functions\/|node_modules\/|dist\/)|(?:^|\/)(?:\.env|\.dev.vars)|\.(?:pdf|sqlite|db|jsonl|sql|toml)$/i;
// Existing public poster used by another app; library originals are never allowed.
const legacyPublicAssets=new Set(['Belief-map - Antigravity/Proposition-tester - Antigravity/SchoolOfThought_FallaciesPoster_A3.pdf']);
for(const file of new Set([...files,...extra])){
 if((denied.test(file)&&!legacyPublicAssets.has(file))||['package.json','package-lock.json','wrangler.jsonc'].includes(file))continue;
 const dest=path.join('dist',file);await mkdir(path.dirname(dest),{recursive:true});await copyFile(file,dest);
}
await writeFile('dist/_routes.json',JSON.stringify({version:1,include:['/api/*'],exclude:[]}));
console.log('Public assets built; private imports and original PDFs are outside this repository.');
