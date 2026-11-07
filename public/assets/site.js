/* Small progressive enhancements; downloads and all guides work without JS. */
'use strict';
const $ = s => document.querySelector(s);
let toastTimer;
function notify(message) { const el=$('#toast'); if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4000); }
if ($('#recipe-cards') && window.PROMOD_DATA) {
  const D=window.PROMOD_DATA,items=D.items;
  const entries=[{id:'cleared_silicon',type:'mix',description:'4 ingredients + 1000 mB UV · electric only'},{id:'uv_solution_bucket',type:'craft',description:'Milk + water + copper + zinc → UV Solution'},{id:'tin_ingot',type:'mix',description:'1 zinc + 1 bronze + 1 copper → 1 tin'},{id:'coal_mixing_smelter',type:'machine',description:'6 inputs · 10 seconds · coal'},{id:'electric_mixing_smelter',type:'machine',description:'9 inputs · 5 seconds · 8-bucket tank'},{id:'coal_press',type:'craft',description:'Fuel your first workshop.'},{id:'electric_press',type:'craft',description:'A press for your powered line.'},{id:'copper_wire',type:'craft',description:'1 ingot + shears → 2 wires'},{id:'propylene_sheet',type:'press',description:'1 ingot → 1 sheet'},...Object.keys(D.balance).map(m=>({id:m+'_ingot',type:'smelt',description:D.balance[m].rarity}))];
  const types={mix:'Mixing',machine:'Machine crafting',craft:'Crafting',press:'Pressing',smelt:'Smelting'};
  const tags={'#c:plates/propylene':'propylene_sheet','#c:storage_blocks/iron':'iron_block','#c:gems/diamond':'diamond','#c:ingots/silicon':'silicon_ingot','#c:ingots/tin':'tin_ingot','#c:gems/quartz':'quartz','#c:wires/copper':'copper_wire','#c:ingots/zinc':'zinc_ingot','#c:ingots/platinum':'platinum_ingot','#c:ingots/bronze':'bronze_ingot','#c:ingots/iron':'iron_ingot','#minecraft:planks':'oak_planks','#c:storage_blocks/coal':'coal_block','#c:ingots/propylene':'propylene_ingot','#c:ingots/copper':'copper_ingot'};
  let filter='all',current='',opener;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const image=(id,cls='')=>`<img class="${cls}" src="${items[id].image}" alt="${esc(items[id].name)}">`;
  const resolve=s=>tags[s]||s.split(':').pop();
  function render(){
    const q=$('#search').value.trim().toLowerCase();
    const list=entries.filter(e=>(filter==='all'||filter===e.type||(filter==='craft'&&e.type==='machine')||(filter==='machine'&&(e.id.endsWith('press')||e.id.endsWith('smelter'))))&&`${items[e.id].name} ${e.id} ${e.description}`.toLowerCase().includes(q));
    $('#recipe-cards').innerHTML=list.map(e=>`<button class="recipe-card" data-recipe="${e.id}" aria-label="Recipe: ${items[e.id].name}"><div class="recipe-art"><small>${types[e.type]}</small>${image(e.id,(e.id.endsWith('press')||e.id.endsWith('smelter'))?'machine':'')}</div><div class="recipe-body"><h2>${items[e.id].name}</h2><p>${e.description}</p></div></button>`).join('');
    $('#recipe-count').textContent=`${list.length} OF ${entries.length} RECIPES · SELECT AN ITEM`;
    $('#empty').hidden=!!list.length;
  }
  function slot(id,count=1,result=false){return `<div class="slot${result?' result':''}"${id?` title="${esc(items[id].name)}"`:''}>${id?image(id):''}${count>1?`<b>${count}</b>`:''}</div>`;}
  function legend(list){return list.map(([id,n,tag])=>`<div class="ingredient">${image(id)}<div>${n} × ${esc(items[id].name)}<small>${esc(tag)}</small></div></div>`).join('');}
  function body(id){
    const type=entries.find(e=>e.id===id).type;
    let cells=[],ingredients=[],count=1,note='',options='',stage='';
    if(id==='copper_wire'){
      cells=['copper_ingot','shears','','','','','','',''];count=2;
      ingredients=[['copper_ingot',1,'#c:ingots/copper'],['shears',1,'minecraft:shears']];
      note='Shapeless: any arrangement works, including a 2×2 grid. Shears remain in the crafting grid and lose 1 durability; they break when exhausted. Unbreakable shears are preserved. Copper wire is a crafting ingredient, not a placeable power cable.';
    }else if(type==='machine'){
      const r=D.recipes[id],counts={};
      cells=r.pattern.flatMap(row=>[...row].map(c=>c===' '?'':resolve(r.key[c])));
      for(const row of r.pattern)for(const c of row)if(c!==' ')counts[r.key[c]]=(counts[r.key[c]]||0)+1;
      ingredients=Object.entries(counts).map(([tag,n])=>[resolve(tag),n,tag]);count=r.result.count||1;
      note=id==='coal_mixing_smelter'?'6 input slots, 1 output slot and a separate fuel slot. One batch takes 10 seconds. Coal, charcoal or coal blocks supply heat.':'9 input slots, 1 output slot and an 8000 mB fluid tank. One batch takes 5 seconds and 4000 E. Pipes using Fabric Transfer API connect from all sides. Tin requires no fluid.';
      note+=' Craft one machine using the 3×3 arrangement above. Equivalent tagged materials from other mods are accepted. Wood types can be mixed. Iron and coal ingredients are full blocks.';
    }else if(type==='mix'){
      const r=D.recipes[id];ingredients=r.ingredients.map(t=>[resolve(t),1,t]);count=r.result.count;
      stage=`<div class="craft-grid" aria-label="Mixing smelter inputs, any order">${[...r.ingredients.map(resolve),...Array(6-r.ingredients.length).fill('')].map(c=>slot(c)).join('')}</div><span class="arrow">→</span>${slot(id,count,true)}`;
      if(r.fluid){
        ingredients.push(['uv_solution_bucket',1,`Tank: ${r.fluid_amount} mB UV Solution`]);
        note='Electric Mixing Smelter only: put the four solids into input slots in any order. Fill its tank with 1000 mB UV Solution using a bucket or compatible pipe. One batch consumes one of each solid and exactly 1000 mB of fluid to produce 1 Cleared Silicon in 100 ticks (5 seconds), using 4000 E. The bucket itself is not an input item. A full output slot or insufficient UV pauses processing without consuming resources. Equivalent tagged materials work. Times assume 20 TPS.';
      }else note='Combine the three ingots in any input slots of a Mixing Smelter. Coal: 200 ticks (10 seconds). Electric: 100 ticks (5 seconds), 4000 E. Times assume 20 TPS. No fluid is consumed. Equivalent tagged ingots from other mods work. Tin has no natural ore in ProMod.';
    }else if(id==='uv_solution_bucket'){
      const r=D.recipes[id];cells=[...r.ingredients.map(resolve),...Array(5).fill('')];
      ingredients=r.ingredients.map(t=>[resolve(t),1,t]);count=r.result.count;
      note='Shapeless: one milk bucket + one water bucket + one copper ingot + one zinc ingot. Works in a 2×2 or 3×3 grid, in any order. Produces one bucket containing 1000 mB UV Solution and returns one empty bucket. The water bucket becomes the UV bucket; the milk bucket is returned empty. Tagged copper and zinc from other mods are accepted. Pour the solution into the electric Mixing Smelter tank to make Cleared Silicon.';
    }else if(type==='craft'){
      const r=D.recipes[id],counts={};
      cells=r.pattern.flatMap(row=>[...row].map(c=>c===' '?'':resolve(r.key[c])));
      for(const row of r.pattern)for(const c of row)if(c!==' ')counts[r.key[c]]=(counts[r.key[c]]||0)+1;
      ingredients=Object.entries(counts).map(([tag,n])=>[resolve(tag),n,tag]);
      count=r.result.count||1;
      note='Use this 3×3 arrangement on a crafting table. Any planks may be mixed, including Nether planks and correctly tagged modded planks. Zinc, platinum and bronze are the existing smelted ingots.';
      note+=id==='electric_press'?' The press requires a compatible external energy source; ProMod does not yet include a generator.':' Fuel the machine with coal, charcoal or coal blocks.';
    }else if(type==='press'){
      const r=D.recipes.propylene_sheet;ingredients=[[resolve(r.ingredient),1,r.ingredient]];count=r.result.count||1;
      stage=`${slot(resolve(r.ingredient))}<span class="arrow" aria-hidden="true">→</span>${slot(id,count,true)}`;
      note='The coal press takes 100 ticks (5 seconds); the electric press takes 20 ticks (1 second), at 20 TPS. The electric press uses 800 E at 40 E/t; the coal press needs fuel. With Create Fly installed, its mechanical press also supports this recipe, at a speed determined by Create.';
    }else{
      const m=id.replace('_ingot',''),r=D.recipes[`${id}_from_smelting_${m}_ore`];
      options='<div class="recipe-options"><label for="ore-variant">Ore</label><select id="ore-variant"><option value="">Stone</option><option value="deepslate_">Deepslate</option></select><label for="furnace-type">Machine</label><select id="furnace-type"><option value="smelting">Furnace</option><option value="blasting">Blast furnace</option></select></div>';
      ingredients=[[m+'_ore',1,'promod-materials:'+m+'_ore']];
      stage=`<div id="smelt-input">${slot(m+'_ore')}</div><span class="arrow" aria-hidden="true">→</span>${slot(id,1,true)}`;
      note=`<span id="smelt-time">${r.cookingtime/20} seconds</span> at 20 TPS · ${r.experience} XP · 1 ore → 1 ingot. Add fuel to the furnace. Correctly tagged ores and raw materials from other mods also work; an existing recipe may produce that mod’s equivalent ingot.`;
    }
    if(!stage)stage=`<div class="craft-grid" aria-label="Crafting grid, three rows by three columns">${cells.map(c=>slot(c)).join('')}</div><span class="arrow" aria-hidden="true">→</span>${slot(id,count,true)}`;
    return `${options}<div class="recipe-stage">${stage}</div><div class="ingredient-list" id="ingredient-list">${legend(ingredients)}</div><div class="callout">${note}</div><div class="actions"><button class="button light" id="copy-command">Copy /give command</button><a class="text-link" href="guide.html#${type==='smelt'?'mining':(type==='mix'||type==='machine'||id==='uv_solution_bucket')?'mixing':'machines'}">Read the guide →</a></div><p class="command"><code>/give @s promod-materials:${id}</code></p>`;
  }
  function show(id){
    const entry=entries.find(e=>e.id===id);if(!entry)return;
    opener=document.activeElement;current=id;
    $('#recipe-title').textContent=items[id].name;$('#recipe-type').textContent=types[entry.type];$('#recipe-detail').innerHTML=body(id);
    $('#recipe-dialog').showModal();$('#recipe-dialog').scrollTop=0;
    if($('#ore-variant')){
      const update=()=>{const m=id.replace('_ingot',''),ore=$('#ore-variant').value+m+'_ore',r=D.recipes[`${id}_from_${$('#furnace-type').value}_${ore}`];$('#smelt-input').innerHTML=slot(ore);$('#smelt-time').textContent=r.cookingtime/20+' seconds';$('#ingredient-list').innerHTML=legend([[ore,1,'promod-materials:'+ore]]);};
      $('#ore-variant').onchange=update;$('#furnace-type').onchange=update;
    }
    $('#copy-command').onclick=async()=>{try{await navigator.clipboard.writeText('/give @s promod-materials:'+current);notify('Command copied.');}catch{notify('Copy the command shown below the button.');}};
  }
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
  $('#search').addEventListener('input',render);
  $('#recipe-cards').addEventListener('click',e=>{const b=e.target.closest('[data-recipe]');if(b)show(b.dataset.recipe);});
  $('.close').onclick=()=>$('#recipe-dialog').close();
  $('#recipe-dialog').addEventListener('close',()=>opener?.focus());
  $('#recipe-dialog').addEventListener('click',e=>{if(e.target!==$('#recipe-dialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
  render();show(location.hash.slice(1));
}
