const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const gains=[],sources=[],button={dataset:{},setAttribute(){}},events={};let audio,filter;
 class Context{
  constructor(){audio=this;this.currentTime=10;this.destination={};}
  async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){}
  async decodeAudioData(){return {length:10385280,duration:216.36};}
  createGain(){const node={gain:{value:1,setTargetAtTime(value,time,fade){this.value=value;this.fade=fade;}},connect(){}};gains.push(node);return node;}
  createBiquadFilter(){filter={frequency:{value:0},gain:{value:0,setTargetAtTime(value,time,fade){this.value=value;this.fade=fade;}},connect(target){this.target=target;}};return filter;}
  createBufferSource(){const node={connect(target){this.target=target;},start(time){this.time=time;}};sources.push(node);return node;}
 }
 const window={AudioContext:Context},document={getElementById:id=>id==='music'?button:{textContent:'{"bed":"AA==","rhythm":"AA=="}'},addEventListener:(n,f)=>events[n]=f};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/soundtrack.js'),'utf8'),{window,document,Uint8Array,atob});
 assert.equal(sources.length,0);await window.soundtrack.start();
 assert.equal(button.dataset.musicState,'playing');assert.equal(sources.length,2);assert.equal(sources[0].time,sources[1].time);assert(sources.every(s=>s.loop));assert.equal(button.dataset.aligned,'true');
 assert.equal(filter.type,'highshelf');assert(Math.abs(filter.gain.value)<1e-9);window.soundtrack.setSubmersion(1);assert.equal(filter.gain.value,-5);assert.equal(filter.gain.fade,.22);window.soundtrack.setSubmersion(.5);assert.equal(filter.gain.value,-2.5);window.soundtrack.setSubmersion(0);assert(Math.abs(filter.gain.value)<1e-9);
 window.soundtrack.setGrounded(false);assert.equal(gains[1].gain.value,0);assert.equal(gains[0].gain.value,.7);
 window.soundtrack.setGrounded(true);assert.equal(gains[1].gain.value,1);assert.equal(gains[1].gain.fade,.12);
 window.soundtrack.setPaused(true);await new Promise(resolve=>setImmediate(resolve));assert.equal(audio.state,'suspended');window.soundtrack.setPaused(false);await new Promise(resolve=>setImmediate(resolve));assert.equal(audio.state,'running');
 button.onclick();await new Promise(resolve=>setImmediate(resolve));assert.equal(gains[0].gain.value,0);assert.equal(sources.length,2);
 console.log('PASS: depth-driven treble fade and restoration, common start/loop clock, airborne percussion-only fade, landing restoration, pause/resume and mute without track restart');
})();
