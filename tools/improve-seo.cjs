const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'public');
const origin = 'https://athomegrower.com';
const {plants} = JSON.parse(fs.readFileSync(path.join(root,'data/plant-library-expanded.json'),'utf8'));
const plantMap = new Map(plants.map(p=>[`plants/${p.pageSlug}.html`,p]));
const brand = 'AtHomeGrower';
const defaultImage = '/assets/images/commons-plants/pet-friendly-spider-plant.webp';
const aliases = new Map([['products.html','store.html'],['advertise.html','sponsor.html'],['sponsor/index.html','sponsor.html']]);
const noindex = new Set(['404.html','search.html']);
const overrides = {
 'index.html':['Plant Care, Gardening Guides & Supplies | AtHomeGrower','Find plants for your space, understand yellow leaves and other symptoms, and compare gardening supplies. Practical plant care for homes, patios, and gardens.'],
 'plant-library.html':['Plant Care Library: Light, Water & Soil | AtHomeGrower','Search houseplants, herbs, vegetables, fruits, and cover crops. Compare light, watering, soil, and care notes before choosing plants for your home or garden.'],
 'fill-your-space.html':['Find Plants for Your Light & Space | AtHomeGrower','Build a plant shortlist around your room, light, watering routine, and garden needs. Compare plant profiles with the AtHomeGrower plant finder.'],
 'plant-diagnoser.html':["What's Wrong With My Plant? Symptom Checker | AtHomeGrower",'Explore likely causes of yellow leaves, brown tips, spots, webbing, and wilting. Compare symptoms with watering, light, and pest clues before choosing a response.'],
 'pests.html':['Common Plant Pests: Signs & Next Checks | AtHomeGrower','Compare signs of aphids, spider mites, fungus gnats, and other plant pests. Check leaves and growing conditions before choosing a control method.'],
 'diseases.html':['Plant Disease Symptoms & Troubleshooting | AtHomeGrower','Compare plant disease clues with watering, roots, pests, and growing conditions. Use the guides to organize observations and know when to seek local advice.'],
 'deficiencies.html':['Plant Nutrient Deficiency Signs & Lookalikes | AtHomeGrower','Explore yellowing, leaf discoloration, and nutrient-deficiency lookalikes. Check watering, light, soil, and roots before adding fertilizer.'],
 'how-to.html':['Home Gardening & Houseplant Care Guides | AtHomeGrower','Choose plants for your light, investigate yellow leaves, and plan practical plant-care routines. Read guides and open the matching AtHomeGrower tools.'],
 'tools.html':['Gardening Tools & Plant Planners | AtHomeGrower','Find plant-matching, symptom-checking, and garden-planning tools. Start with your conditions, compare care profiles, and plan your next growing step.'],
 'store.html':['Gardening Supplies: Seeds, Soil & Tools | AtHomeGrower','Compare affiliate gardening supplies by task: seeds, seed-starting gear, soil amendments, organic fertilizers, watering equipment, and tools.'],
 'organic-additives.html':['Organic Soil Additives & Amendments Guide | AtHomeGrower','Explore soil amendments, nutrients, and growing-media options. Match an additive to a specific soil or plant need before comparing affiliate shopping links.'],
 'seasonal-checklists.html':['Seasonal Gardening & Plant Care Checklists | AtHomeGrower','Plan seasonal plant checks for your home and garden. Review light, watering, maintenance, and growing conditions as the seasons change.'],
 'troubleshooting.html':['Plant Troubleshooting: Leaves, Roots & Growth | AtHomeGrower','Investigate common plant problems by checking the symptom pattern, soil, light, watering, roots, and pests. Find the next useful question to ask.'],
 'air-purifying.html':['Houseplants & Indoor Air: What to Know | AtHomeGrower','Explore houseplants often discussed for indoor air, with realistic limits. Choose by light and care needs, alongside ventilation and other indoor-air measures.'],
 'sponsor.html':['Garden Brand Sponsorship & Ad Placements | AtHomeGrower','Explore AtHomeGrower sponsorship placements for gardening and plant-care brands. Compare placement locations, current pricing, and subscription terms.'],
 'community.html':['Gardening Community Plans | AtHomeGrower','Read about planned AtHomeGrower community features and explore the plant library, practical guides, and troubleshooting tools available now.'],
 'contact.html':['Contact AtHomeGrower | Plant & Website Questions','Contact AtHomeGrower about the website, gardening content, image credits, or business inquiries. Include the page or plant profile relevant to your question.'],
 'sources.html':['Gardening Sources & References | AtHomeGrower','Explore the horticultural references used across AtHomeGrower, including university extension and botanical resources. Check source context for specific advice.'],
 'about/editorial-policy.html':['Editorial Policy & Care Guidance | AtHomeGrower','Read how AtHomeGrower approaches plant-care references, uncertainty, safety notes, and affiliate content. Learn what profiles and symptom tools can establish.'],
 'affiliate-disclosure.html':['Affiliate Disclosure | AtHomeGrower','Learn how AtHomeGrower affiliate links work, how qualifying purchases may earn commission, and why product details should be checked before buying.'],
};
const categoryNames={'pet-friendly':'houseplant','toxic':'houseplant','herbs':'herb','vegetables':'vegetable','fruits':'fruit','cover-crops':'cover crop'};
const sameNameCounts = new Map();
for(const p of plants) sameNameCounts.set(p.name,(sameNameCounts.get(p.name)||0)+1);
const esc = s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const decode = s=>String(s).replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const urlFor=file=>origin+(file==='index.html'?'/':'/'+file.replace(/\/index\.html$/,'/').replace(/\.html$/,''));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);}
const files=walk(root); const urls=[];
for(const full of files){
 const file=path.relative(root,full).replaceAll('\\','/');
 let html=fs.readFileSync(full,'utf8');
 if(!/<head[\s>]/i.test(html))continue;
 // Auth verification records stay intact; only SEO tags managed here are replaced.
 const originalTitle=decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||brand);
 const oldDesc=html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0]||'';
 let title=originalTitle,description=decode(oldDesc.match(/content="([^"]*)"/i)?.[1]||`Explore ${brand} plant care and gardening resources.`);
 const canonicalFile=aliases.get(file)||file; const url=urlFor(canonicalFile);
 const plant=plantMap.get(file);
 let image=defaultImage;
 if(plant){
  const category=categoryNames[plant.plantTypeCategory]||'plant';
  const context=sameNameCounts.get(plant.name)>1?` (${category})`:'';
  title=`${plant.name}${context} Care: Light, Water & Soil | ${brand}`;
  description=`${plant.name}${context}: ${plant.lightText}; ${plant.waterText.charAt(0).toLowerCase()+plant.waterText.slice(1)}. Compare soil, placement, and care notes for ${plant.botanicalName || plant.name}.`;
  image=plant.image;
  // Use the plant's existing specific summary fields rather than contradictory cohort boilerplate.
  const careValues=[['Light',plant.lightText],['Soil mix',plant.soilText],['When to water',plant.waterText]];
  for(const [label,value] of careValues)if(value)html=html.replace(new RegExp(`(<div class="care-note"><strong>${label}:<\\/strong><p>)[\\s\\S]*?(<\\/p><\\/div>)`),(_,a,b)=>a+esc(value)+b);
  let heroDone=false;
  html=html.replace(/(<div class="plant-detail-media[\s\S]*?<\/section>)/,section=>section.replace(/<img\b[^>]*>/g,tag=>{if(heroDone)return tag;heroDone=true;return tag.replace(/ loading="lazy"/,'') .replace(/>$/,' loading="eager" fetchpriority="high">');}));
 }
 if(overrides[canonicalFile])[title,description]=overrides[canonicalFile];
 const isGuide=file.startsWith('guides/');
 if(file.startsWith('store/')){
  const h1=decode(html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]||'Gardening Supplies');
  title=`${h1}: Gardening Supplies & Buying Notes | ${brand}`;
  description=`Compare ${h1.toLowerCase()} affiliate shopping options for home gardening. Review product purpose, label directions, size, and current seller details before buying.`;
 }
 const isNoindex=noindex.has(file);
 if(!isNoindex&&!aliases.has(file))urls.push(url);
 const graph=[{'@type':file==='plant-library.html'||file.startsWith('store/')?'CollectionPage':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'en',isPartOf:{'@id':origin+'/#website'}}];
 if(file==='index.html')graph.push({'@type':'Organization','@id':origin+'/#organization',name:brand,url:origin+'/'},{'@type':'WebSite','@id':origin+'/#website',name:brand,alternateName:['At Home Grower','AtHomeGrowers'],url:origin+'/',publisher:{'@id':origin+'/#organization'},inLanguage:'en'});
 if(file!=='index.html'){
  const crumbs=[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'}];
  if(plant)crumbs.push({'@type':'ListItem',position:2,name:'Plant Library',item:origin+'/plant-library'});
  crumbs.push({'@type':'ListItem',position:crumbs.length+1,name:plant?.name||decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g,'')||title),item:url});
  graph.push({'@type':'BreadcrumbList',itemListElement:crumbs});
 }
 if(plant)graph[0].about={'@type':'Thing',name:plant.name,alternateName:plant.botanicalName};
 // Preserve source-backed Article markup already authored in the two guides.
 const schemas=isGuide?'':`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`;
 html=html.replace(/<title>[\s\S]*?<\/title>\s*/i,'')
 .replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>\s*/gi,'')
 .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi,'');
 if(!isGuide)html=html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi,'');
 const meta=`\n  <title>${esc(title)}</title>\n  <meta name="description" content="${esc(description)}">\n  <link rel="canonical" href="${url}">\n  <meta name="robots" content="${isNoindex?'noindex, follow':'index, follow, max-image-preview:large'}">\n  <meta property="og:type" content="${isGuide?'article':'website'}">\n  <meta property="og:site_name" content="${brand}">\n  <meta property="og:title" content="${esc(title)}">\n  <meta property="og:description" content="${esc(description)}">\n  <meta property="og:url" content="${url}">\n  <meta property="og:image" content="${origin+image}">\n  <meta property="og:image:alt" content="${esc(plant?.alt||brand+' plant care')}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="${esc(title)}">\n  <meta name="twitter:description" content="${esc(description)}">\n  <meta name="twitter:image" content="${origin+image}">\n  ${isNoindex?'':schemas}\n`;
 html=html.replace(/<\/head>/i,meta+'</head>');
 // Link to canonical HTML routes without an unnecessary .html redirect, preserving parameters and anchors.
 html=html.replace(/href="(\/[^"?#]*?)\.html([?#][^"]*)?"/g,(_,p,q='')=>`href="${p==='/index'?'/':p.replace(/\/index$/,'/')}${q}"`);
 html=html.replace(/<script src="\/assets\/app\.js(?:\?[^"]*)?"/g,'<script defer src="/assets/app.js?v=seo-20261028"');
 html=html.replace(/<link rel="stylesheet" href="\/assets\/styles\.css(?:\?[^"]*)?">/g,'<link rel="stylesheet" href="/assets/styles.css?v=seo-20261028">');
 // Paid affiliate links should be identifiable to crawlers as well as disclosed to readers.
 html=html.replace(/<a\b[^>]*href="https?:\/\/(?:www\.)?(?:amazon\.[^/" ]+|amzn\.to)[^>]*>/gi,tag=>{
  const rel=tag.match(/\brel="([^"]*)"/);const values=new Set([...(rel?.[1]||'').split(/\s+/).filter(Boolean),'sponsored','nofollow','noopener']);
  return rel?tag.replace(rel[0],`rel="${[...values].join(' ')}"`):tag.replace(/>$/,` rel="${[...values].join(' ')}">`);
 });
 html=html.replace(/[ \t]+$/gm,'');
 fs.writeFileSync(full,html);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].sort().map(url=>`  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(JSON.stringify({htmlPages:files.length,plantProfiles:plantMap.size,sitemapUrls:new Set(urls).size,primaryOrigin:origin}));
