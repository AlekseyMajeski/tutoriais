import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SITE='https://alekseymajeski.github.io/tutoriais';
const BASE=path.join(ROOT,'impressoras-termicas');
const SITEMAP=path.join(ROOT,'sitemap.xml');
const today=new Date().toISOString().slice(0,10);

function walk(dir){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return walk(full);
    return entry.isFile()&&entry.name==='index.html'?[full]:[];
  });
}
function canonical(html){
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1]
    ||html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i)?.[1]
    ||null;
}
function urlBlock(url,priority='0.8'){
  return `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
}

let xml=fs.readFileSync(SITEMAP,'utf8');
const existing=new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
const additions=[];

const hub=`${SITE}/impressoras-termicas/xprinter/`;
if(!existing.has(hub)){
  additions.push(urlBlock(hub,'0.8'));
  existing.add(hub);
}

for(const file of walk(BASE)){
  const rel=path.relative(ROOT,file).replaceAll(path.sep,'/');
  if(rel.split('/').length!==4)continue;
  const html=fs.readFileSync(file,'utf8');
  if(!/body[^>]+class=["'][^"']*model-page/i.test(html))continue;
  const url=canonical(html);
  if(!url||!url.startsWith(SITE)||existing.has(url))continue;
  additions.push(urlBlock(url,'0.8'));
  existing.add(url);
}

if(additions.length){
  xml=xml.replace(/\s*<\/urlset>\s*$/,`\n${additions.join('\n')}\n</urlset>\n`);
  fs.writeFileSync(SITEMAP,xml);
}
console.log(`Sitemap sync: ${additions.length} URL(s) adicionada(s).`);
for(const row of additions)console.log(row.match(/<loc>([^<]+)/)?.[1]||row);
