/* Input/lifecycle integration with deterministic requestAnimationFrame timing. */
(async()=>{
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),P=require('../src/physics.js');
let nextFrame,time=1000,pads=[];const events={},docEvents={},elements={};
function element(){return {hidden:false,style:{},classList:{toggle(){},add(){},remove(){}},focus(){},setAttribute(){},addEventListener(){},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:120,height:120};}};}
const document={getElementById:id=>elements[id]??=element(),addEventListener:(n,f)=>docEvents[n]=f,hidden:false};
const window={addEventListener:(n,f)=>events[n]=f};
class Renderer{constructor(){this.eye=[0,0,0];this.drawMs=0;this.triangles=1;}reset(){}update(){}render(){}}
const ctx=vm.createContext({Physics:P,WaterEffects:require('../src/water-effects.js'),SurfRenderer:Renderer,document,window,navigator:{getGamepads:()=>pads},HTMLButtonElement:class{},requestAnimationFrame:f=>nextFrame=f,console});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../src/game.js'),'utf8'),ctx);
const key=(code,type='keydown')=>events[type]({code,preventDefault(){},target:{},repeat:false});
const frames=n=>{for(let i=0;i<n;i++){time+=1000/60;nextFrame(time);}};
const snap=()=>window.lightSurf.snapshot();frames(60);assert(snap().paused);assert.equal(snap().state.position.z,80);await elements.start.onclick();assert(!snap().paused);frames(1);key('ArrowRight');frames(60);key('ArrowRight','keyup');assert(snap().state.heading>.8);key('Escape');const before=JSON.stringify(snap().state);frames(60);assert.equal(JSON.stringify(snap().state),before);key('KeyR');assert.equal(snap().state.launches,0);assert.equal(snap().state.heading,0);key('Escape');key('Space');frames(300);assert.equal(snap().state.launches,0);assert(snap().state.crouched);key('Space','keyup');events.blur();assert(snap().paused);key('Escape');frames(1);assert(!snap().state.crouched);
key('KeyR');pads=[{mapping:'standard',axes:[-.8,0,0,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===6}))}];frames(60);assert(snap().state.heading<-.5);assert(snap().state.crouched);pads=[];key('KeyR');elements.pad.onpointerdown({pointerId:1,clientX:105,clientY:60});frames(60);assert(snap().state.heading>.8);elements.pad.onpointerup();elements.grip.onpointerdown({pointerId:2,currentTarget:elements.grip});frames(1);assert(snap().state.crouched);elements.grip.onpointerup();frames(1);assert(!snap().state.crouched);document.hidden=true;docEvents.visibilitychange();assert(snap().paused);
console.log('PASS: held keyboard steering/grip, pause freeze, reset, blur release, standard gamepad mapping, touch steering/grip, hidden-tab pause');

})();
