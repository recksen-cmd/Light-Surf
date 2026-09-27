const assert=require('node:assert/strict'),P=require('../src/physics.js');
const s=P.reset(),input={steer:0,drive:1,crouch:true};
let previous=s.position.y;
for(let i=0;i<360;i++){P.step(s,input);assert(Math.abs(s.position.y-previous)<1);previous=s.position.y;assert(s.sink<8);}
assert(s.sink>4);assert.equal(s.launches,0);
input.drive=0;
for(let i=0;i<60;i++)P.step(s,input);
assert(s.sink>3,'Dive should release gradually');
for(let i=0;i<540;i++)P.step(s,input);
assert(Math.abs(s.sink)<1,'Rider should recover after release');
for(const drive of [-1,0,.5,1]){const s=P.reset();for(let i=0;i<36000;i++){P.step(s,{steer:.4,drive,crouch:false});assert(Object.values(s.position).every(Number.isFinite));assert(s.sink>=-1.2&&s.sink<=12);} }
console.log('PASS: gradual dive entry, sustained depth, gradual release, surface recovery, and five-minute mixed-posture stability');
