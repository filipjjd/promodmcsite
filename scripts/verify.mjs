import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../public/',import.meta.url));
let checked=0;
for(const name of (await readdir(root)).filter(n=>n.endsWith('.html'))){
  const source=await readFile(path.join(root,name),'utf8');assert(source.includes('lang="en"'),name+' must be English');
  assert(!/[A-Z]:[\\/]|file:\/\//.test(source),'Local path in '+name);
  for(const match of source.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
    const ref=match[1].split('#')[0];if(/^(https?:|data:|mailto:)/.test(ref))continue;
    assert((await stat(path.resolve(root,ref))).isFile(),name+': broken link '+ref);checked++;
  }
}
const context={window:{}};vm.runInNewContext(await readFile(path.join(root,'data/catalog.js'),'utf8'),context);
const d=context.window.PROMOD_DATA;
for(const item of Object.values(d.items))assert((await stat(path.join(root,item.image))).isFile());
for(const metal of ['platinum','silicon'])assert.equal(JSON.stringify(d.balance[metal].range),'[-6,16]');
assert.equal(d.recipes.electric_press.pattern.join('/'),'WZW/IPI/DID');
assert.equal(d.recipes.coal_press.pattern.join('/'),'WBW/C C/DDD');
for(const r of JSON.parse(await readFile(path.join(root,'downloads/manifest.json'),'utf8'))){
  const bytes=await readFile(path.join(root,r.file));assert.equal(bytes.length,r.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256);assert.equal(bytes.subarray(0,2).toString(),'PK');
}
new vm.Script(await readFile(path.join(root,'assets/site.js'),'utf8'));
console.log(`PASS: ${checked} local references; English pages; current ore ranges; recipes; download sizes and SHA-256; JavaScript syntax.`);
