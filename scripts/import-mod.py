"""Import tested release artifacts and recipe data. Usage: python scripts/import-mod.py MOD_ROOT"""
from pathlib import Path
import sys,json,re,base64,hashlib,shutil,zipfile
root=Path(sys.argv[1]);out=Path(__file__).resolve().parents[1]/'public'
guide=(root/'GOTOWY MOD/PROMOD - CRAFTINGI.html').read_text(encoding='utf-8')
data=json.loads(re.search(r'<script id="guide-data" type="application/json">(.*?)</script>',guide,re.S).group(1))
names={'zinc':'Zinc','bronze':'Bronze','chromium':'Chromium','platinum':'Platinum','silicon':'Silicon','propylene':'Propylene','tin':'Tin'}
extra={'coal_mixing_smelter':'Coal mixing smelter','electric_mixing_smelter':'Electric mixing smelter','copper_wire':'Copper wire','propylene_sheet':'Propylene sheet','electric_press':'Electric press','coal_press':'Coal press','copper_ingot':'Copper ingot','iron_ingot':'Iron ingot','shears':'Shears','oak_planks':'Any planks','coal_block':'Block of coal','coal':'Coal'}
(out/'assets/items').mkdir(parents=True,exist_ok=True)
for key,item in data['items'].items():
    ext='svg' if item['image'].startswith('data:image/svg+xml') else 'png'
    path='assets/items/'+key+'.'+ext
    (out/path).write_bytes(base64.b64decode(item['image'].split(',',1)[1]))
    if key in extra:name=extra[key]
    else:
        metal=next(m for m in names if m in key)
        name=('Deepslate ' if key.startswith('deepslate_') else '')+names[metal]+(' ore' if key.endswith('_ore') else ' ingot')
    item.update(name=name,image=path)
rarities={'zinc':'Common','bronze':'Common','propylene':'Gold-like rarity','platinum':'Rare, shallow deposits','silicon':'Rare, shallow deposits','chromium':'Rarest'}
best={'zinc':'16 to 48','bronze':'0 to 32','propylene':'−56 to −40','platinum':'0 to 10','silicon':'0 to 10','chromium':'−59 to −54'}
for key,b in data['balance'].items():b.update(name=names[key],rarity=rarities[key],best=best[key],tool='Iron' if key in ['chromium','platinum'] else 'Stone')
data.pop('shots',None)
(out/'data/catalog.js').write_text('window.PROMOD_DATA = '+json.dumps(data,ensure_ascii=False)+';\n',encoding='utf-8')
releases=[]
for name,version in [('promod-protel','1.2.2'),('promod-materials','0.3.0')]:
    source=root/'GOTOWY MOD'/f'{name}-{version}.jar'
    with zipfile.ZipFile(source) as jar: assert json.loads(jar.read('fabric.mod.json'))['version']==version
    target=out/'downloads'/source.name;shutil.copy2(source,target)
    releases.append({'id':name,'version':version,'file':'downloads/'+source.name,'bytes':source.stat().st_size,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'minecraft':'1.21.11','loader':'Fabric','java':21})
(out/'downloads/manifest.json').write_text(json.dumps(releases,indent=2)+'\n',encoding='utf-8')
(out/'downloads/SHA256SUMS.txt').write_text(''.join(r['sha256']+'  '+Path(r['file']).name+'\n' for r in releases),encoding='utf-8')
shutil.copy2(root/'GOTOWY MOD/LICENCJE CZCIONEK.txt',out/'downloads/FONT-LICENSES.txt')
print('Imported actual textures, recipes, ore balance and verified JARs.')
