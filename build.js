const fs=require('node:fs'),path=require('node:path'),root=__dirname;
const tracks=[['Plastic Wave Boy','plastic'],['Watching Me Close','watching']].map(([title,prefix])=>({title,...Object.fromEntries(['bed','rhythm'].map(bus=>[bus,fs.readFileSync(path.join(root,'assets',prefix+'-'+bus+'.mp3')).toString('base64')]))}));
let html=fs.readFileSync(path.join(root,'src/index.template.html'),'utf8').replace('/* SOUNDTRACK */',()=>fs.readFileSync(path.join(root,'src/soundtrack.js'),'utf8')).replace('SOUNDTRACK_DATA',()=>JSON.stringify({tracks}));


for(const [tag,file] of [['PHYSICS','physics'],['RENDERER','renderer'],['MOTION','motion'],['GAME','game']])html=html.replace('/* '+tag+' */',()=>fs.readFileSync(path.join(root,'src',file+'.js'),'utf8'));
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('Built standalone game:',Buffer.byteLength(html),'bytes');
