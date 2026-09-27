/* No dependencies: node build.js */
const fs=require('node:fs'),path=require('node:path');
const root=__dirname;let html=fs.readFileSync(path.join(root,'src/index.template.html'),'utf8');
for(const [tag,file]of [['PHYSICS','physics.js'],['RENDERER','renderer.js'],['SOUNDTRACK','soundtrack.js'],['GAME','game.js']])html=html.replace(`/* ${tag} */`,()=>fs.readFileSync(path.join(root,'src',file),'utf8'));
html=html.replace('SOUNDTRACK_DATA',()=>JSON.stringify(Object.fromEntries(['bed','rhythm'].map(name=>[name,fs.readFileSync(path.join(root,'assets',name+'.mp3')).toString('base64')]))));
fs.writeFileSync(path.join(root,'index.html'),html);console.log('Built index.html ('+Buffer.byteLength(html)+' bytes; no external dependencies)');
