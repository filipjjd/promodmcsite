/* Small progressive enhancements; downloads and all guides work without JS. */
'use strict';
const $ = s => document.querySelector(s);
let toastTimer;
function notify(message) { const el=$('#toast'); if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4000); }
if ($('#recipe-cards') && window.PROMOD_DATA) {
  const D=window.PROMOD_DATA,items=D.items;
  const entries=[{id:'coal_press',type:'craft',description:'Fuel your first workshop.'},{id:'electric_press',type:'craft',description:'A press for your powered line.'},{id:'copper_wire',type:'craft',description:'1 ingot + shears → 2 wires'},{id:'propylene_sheet',type:'press',description:'1 ingot → 1 sheet'},...Object.keys(D.balance).map(m=>({id:m+'_ingot',type:'smelt',description:D.balance[m].rarity}))];
  const types={craft:'Crafting',press:'Pressing',smelt:'Smelting'};
  const tags={'#c:wires/copper':'copper_wire','#c:ingots/zinc':'zinc_ingot','#c:ingots/platinum':'platinum_ingot','#c:ingots/bronze':'bronze_ingot','#c:ingots/iron':'iron_ingot','#minecraft:planks':'oak_planks','#c:storage_blocks/coal':'coal_block','#c:ingots/propylene':'propylene_ingot','#c:ingots/copper':'copper_ingot'};
  let filter='all',current='',opener;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const image=(id,cls='')=>`<img class="${cls}" src="${items[id].image}" alt="${esc(items[id].name)}">`;
  const resolve=s=>tags[s]||s.split(':').pop();
  function render(){
    const q=$('#search').value.trim().toLowerCase();
    const list=entries.filter(e=>(filter==='all'||filter===e.type)&&`${items[e.id].name} ${e.id} ${e.description}`.toLowerCase().includes(q));
    $('#recipe-cards').innerHTML=list.map(e=>`<button class="recipe-card" data-recipe="${e.id}" aria-label="Recipe: ${items[e.id].name}"><div class="recipe-art"><small>${types[e.type]}</small>${image(e.id,e.id.endsWith('press')?'machine':'')}</div><div class="recipe-body"><h2>${items[e.id].name}</h2><p>${e.description}</p></div></button>`).join('');
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
      note='Either ProMod press takes 100 ticks (5 seconds at 20 TPS). The electric press uses 800 E; the coal press needs fuel. With Create Fly installed, its mechanical press also supports this recipe, at a speed determined by Create.';
    }else{
      const m=id.replace('_ingot',''),r=D.recipes[`${id}_from_smelting_${m}_ore`];
      options='<div class="recipe-options"><label for="ore-variant">Ore</label><select id="ore-variant"><option value="">Stone</option><option value="deepslate_">Deepslate</option></select><label for="furnace-type">Machine</label><select id="furnace-type"><option value="smelting">Furnace</option><option value="blasting">Blast furnace</option></select></div>';
      ingredients=[[m+'_ore',1,'promod-materials:'+m+'_ore']];
      stage=`<div id="smelt-input">${slot(m+'_ore')}</div><span class="arrow" aria-hidden="true">→</span>${slot(id,1,true)}`;
      note=`<span id="smelt-time">${r.cookingtime/20} seconds</span> at 20 TPS · ${r.experience} XP · 1 ore → 1 ingot. Add fuel to the furnace. Correctly tagged ores and raw materials from other mods also work; an existing recipe may produce that mod’s equivalent ingot.`;
    }
    if(!stage)stage=`<div class="craft-grid" aria-label="Crafting grid, three rows by three columns">${cells.map(c=>slot(c)).join('')}</div><span class="arrow" aria-hidden="true">→</span>${slot(id,count,true)}`;
    return `${options}<div class="recipe-stage">${stage}</div><div class="ingredient-list" id="ingredient-list">${legend(ingredients)}</div><div class="callout">${note}</div><div class="actions"><button class="button light" id="copy-command">Copy /give command</button><a class="text-link" href="guide.html#${type==='smelt'?'mining':'machines'}">Read the guide →</a></div><p class="command"><code>/give @s promod-materials:${id}</code></p>`;
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
