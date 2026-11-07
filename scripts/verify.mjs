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
assert.equal(d.recipes.tin_ingot.type,'promod-materials:mixing_smelting');
assert.equal(JSON.stringify(d.recipes.tin_ingot.ingredients),JSON.stringify(['#c:ingots/zinc','#c:ingots/bronze','#c:ingots/copper']));
assert.equal(d.recipes.tin_ingot.result.id,'promod-materials:tin_ingot');
assert.equal(d.recipes.tin_ingot.result.count,1);
assert.equal(d.recipes.cleared_silicon.type,'promod-materials:mixing_smelting');
assert.equal(JSON.stringify(d.recipes.cleared_silicon.ingredients),JSON.stringify(['#c:ingots/silicon','#c:gems/quartz','#c:ingots/tin','#c:ingots/platinum']));
assert.equal(d.recipes.cleared_silicon.fluid,'promod-materials:uv_solution');
assert.equal(d.recipes.cleared_silicon.fluid_amount,1000);
assert.equal(d.recipes.cleared_silicon.result.id,'promod-materials:cleared_silicon');
assert.equal(d.recipes.cleared_silicon.result.count,1);
assert.equal(d.recipes.uv_solution_bucket.type,'promod-materials:uv_solution');
assert.equal(JSON.stringify(d.recipes.uv_solution_bucket.ingredients),JSON.stringify(['minecraft:milk_bucket','minecraft:water_bucket','#c:ingots/copper','#c:ingots/zinc']));
assert.equal(d.recipes.uv_solution_bucket.result.id,'promod-materials:uv_solution_bucket');
assert.equal(d.recipes.uv_solution_bucket.result.count,1);
for(const [id,expected] of Object.entries({coal_mixing_smelter:{'#c:storage_blocks/coal':3,'#c:plates/propylene':1,'#c:ingots/zinc':1,'#c:gems/diamond':1,'#minecraft:planks':3},electric_mixing_smelter:{'#c:storage_blocks/iron':3,'#c:plates/propylene':2,'#c:gems/diamond':2,'#c:ingots/tin':2}})){
  const r=d.recipes[id],counts={};assert.equal(r.type,'minecraft:crafting_shaped');
  for(const symbol of r.pattern.join(''))if(symbol!==' ')counts[r.key[symbol]]=(counts[r.key[symbol]]||0)+1;
  assert.deepEqual(counts,expected,id+' exact ingredients');
  assert.equal(r.result.id,'promod-materials:'+id);assert.equal(r.result.count,1);
}
for(const r of JSON.parse(await readFile(path.join(root,'downloads/manifest.json'),'utf8'))){
  const bytes=await readFile(path.join(root,r.file));assert.equal(bytes.length,r.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256);assert.equal(bytes.subarray(0,2).toString(),'PK');
}
new vm.Script(await readFile(path.join(root,'assets/site.js'),'utf8'));
console.log(`PASS: ${checked} local references; English pages; current ore ranges; recipes; download sizes and SHA-256; JavaScript syntax.`);
