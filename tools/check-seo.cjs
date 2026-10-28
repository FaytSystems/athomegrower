const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'../public');
const origin='https://athomegrower.com';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);
const files=walk(root);const htmlByUrl=new Map();const failures=[];let affiliateCount=0;let schemaCount=0;
function resolveAsset(url,file){
 const parsed=new URL(url,origin+'/'+path.relative(root,file).replaceAll('\\','/'));
 if(parsed.origin!==origin)return true;
 const target=path.join(root,decodeURIComponent(parsed.pathname));
 return [target,target+'.html',path.join(target,'index.html')].some(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
}
for(const file of files){
 const html=fs.readFileSync(file,'utf8');const rel=path.relative(root,file).replaceAll('\\','/');
 for(const [label,pattern] of [['title',/<title>[\s\S]*?<\/title>/gi],['description',/<meta\b[^>]*name="description"[^>]*>/gi],['canonical',/<link\b[^>]*rel="canonical"[^>]*>/gi]])if((html.match(pattern)||[]).length!==1)failures.push(`${rel}: ${label} count`);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 if(!canonical?.startsWith(origin+'/'))failures.push(`${rel}: canonical origin`);
 const ownUrl=origin+(rel==='index.html'?'/':'/'+rel.replace(/\/index\.html$/,'/').replace(/\.html$/,''));
 htmlByUrl.set(ownUrl,{html,rel,canonical});
 for(const schema of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(schema[1]);schemaCount++;}catch{failures.push(`${rel}: invalid structured data`);}}
 const image=html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
 if(!image||!resolveAsset(image,file))failures.push(`${rel}: missing social preview image`);
 for(const attr of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=attr[1];if(!value||/^(?:https?:|mailto:|tel:|data:|#|javascript:)/.test(value))continue;
  if(!resolveAsset(value,file))failures.push(`${rel}: broken ${value}`);
 }
 for(const link of html.matchAll(/<a\b[^>]*href="https?:\/\/(?:www\.)?(?:amazon\.[^/" ]+|amzn\.to)[^>]*>/gi)){affiliateCount++;if(!link[0].match(/rel="[^"]*sponsored/))failures.push(`${rel}: affiliate link missing sponsored`);}
 if(rel.startsWith('plants/')&&!html.match(/class="plant-detail-media[\s\S]*?<img[^>]+loading="eager"[^>]+fetchpriority="high"/))failures.push(`${rel}: hero loading priority`);
}
const urls=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length,'Sitemap URLs must be unique');
for(const url of urls){const page=htmlByUrl.get(url);if(!page)failures.push(`Sitemap missing local page: ${url}`);else{if(page.canonical!==url)failures.push(`Noncanonical sitemap entry: ${url}`);if(page.html.includes('content="noindex'))failures.push(`Noindex in sitemap: ${url}`);}}
assert(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes(origin+'/sitemap.xml'));
console.log(JSON.stringify({pagesChecked:files.length,sitemapUrls:urls.length,structuredDataBlocks:schemaCount,affiliateLinks:affiliateCount,failures:failures.slice(0,30),failureCount:failures.length},null,2));
if(failures.length)process.exitCode=1;
