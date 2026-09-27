const assert=require('node:assert/strict'),P=require('../src/physics.js');
// Dive input must not pin the rider below the surface or latch after release.
const s=P.reset();for(let i=0;i<360;i++)P.step(s,{steer:0,drive:1,crouch:true});assert(s.sink<1);
// An actual hard landing still gets the softened underwater recovery.
const impact=P.reset();impact.position.y+=.4;impact.velocity.y=-110;impact.grounded=false;let underwater=0;
for(let i=0;i<600;i++){P.step(impact,{steer:0,drive:0,crouch:true});if(impact.sink>2.5)underwater++;assert(impact.sink>=-1.2&&impact.sink<=12);}
assert(underwater/120>.65);assert(Math.abs(impact.sink)<1);
for(const drive of [-1,0,.5,1]){const s=P.reset();for(let i=0;i<36000;i++){P.step(s,{steer:.4,drive,crouch:false});assert(Object.values(s.position).every(Number.isFinite));assert(s.sink>=-1.2&&s.sink<=12);}if(drive===0)assert(s.launches>20);}
console.log('PASS: no forced submersion, softened landing recovery, free crest launches and mixed-posture stability');
