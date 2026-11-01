import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jar':'application/java-archive','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT||8767);
http.createServer(async(req,res)=>{
  try{
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';
    let file=path.resolve(root,'.'+name);if(!file.startsWith(root)){res.writeHead(403).end();return;}
    if(!(await stat(file)).isFile())throw Error('Not found');
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    if(file.endsWith('.jar'))res.setHeader('Content-Disposition','attachment');
    res.end(await readFile(file));
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')));}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
