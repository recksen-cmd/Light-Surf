const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../src/motion.js'),'utf8');
function setup({phone=true,permission='granted',secure=true,support=true}={}){
 let now=0,requested=0;const nodes={},events={},docEvents={},timers=new Map();let id=0;
 const document={hidden:false,getElementById:k=>nodes[k]??={setAttribute(){},textContent:''},addEventListener:(n,f)=>docEvents[n]=f};
 const window={isSecureContext:secure,matchMedia:()=>({matches:phone}),screen:{orientation:{angle:0,addEventListener:(n,f)=>events.rotation=f}},DeviceOrientationEvent:support?{requestPermission(){requested++;return Promise.resolve(permission);}}:undefined,addEventListener:(n,f)=>events[n]=f,removeEventListener:n=>delete events[n]};
 vm.runInNewContext(source,{window,document,performance:{now:()=>now},setTimeout:f=>{timers.set(++id,f);return id;},clearTimeout:i=>timers.delete(i)});
 return {motion:window.phoneMotion,nodes,events,window,document,docEvents,requested:()=>requested,sample(beta,gamma){now+=70;events.deviceorientation?.({beta,gamma});},advance(ms){now+=ms;},timeout(){for(const f of [...timers.values()])f();}};
}
(async()=>{
 const desktop=setup({phone:false});await desktop.motion.start();assert.equal(desktop.requested(),0);
 for(const opts of [{permission:'denied'},{secure:false},{support:false}]){const c=setup(opts);await c.motion.start();assert.equal(c.motion.input(.1).steer,0);assert.match(c.nodes['motion-hint'].textContent,/touch stick/);}
 const c=setup(),start=c.motion.start();assert.equal(c.requested(),1,'permission requested in click stack');await new Promise(resolve=>setImmediate(resolve));for(let i=0;i<7;i++)c.sample(35,0);await start;
 assert.equal(c.motion.input(.1).steer,0);c.sample(35,25);assert(c.motion.input(.5).steer>.6);c.sample(10,0);assert(c.motion.input(.5).drive>.8);
 c.advance(1200);assert.equal(c.motion.input(.1).drive,0,'stale sensor must stop steering');
 c.window.screen.orientation.angle=90;c.events.rotation();for(let i=0;i<7;i++)c.sample(0,0);c.sample(25,0);assert(c.motion.input(.5).steer>.9,'landscape axes follow screen');
 c.nodes.tilt.onclick();assert.equal(c.motion.input(.1).steer,0);c.document.hidden=true;c.docEvents.visibilitychange();assert.equal(c.motion.input(.1).drive,0);
 const missing=setup(),pending=missing.motion.start();await new Promise(resolve=>setImmediate(resolve));missing.timeout();await pending;assert.match(missing.nodes['motion-hint'].textContent,/unavailable/);
 console.log('PASS: phone-only permission in click stack, denial/insecure/missing-sensor fallbacks, neutral calibration, steering/dive, landscape axes, stale samples and tilt-off');
})();
