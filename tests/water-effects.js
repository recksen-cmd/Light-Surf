const assert=require('node:assert/strict'),W=require('../src/water-effects.js'),P=require('../src/physics.js');
const packet={x:0,z:0,fx:0,fz:1,age:.5,amplitude:3,amplitude_dt:-1};
const s={wake:[packet]},eps=1e-5;
for(const [x,z] of [[0,22],[8,25],[-12,16],[15,40]]){
 const w=W.sample(s,x,z);
 for(const axis of ['x','z']){
  const hi=W.sample(s,x+(axis==='x'?eps:0),z+(axis==='z'?eps:0));
  const lo=W.sample(s,x-(axis==='x'?eps:0),z-(axis==='z'?eps:0));
  assert(Math.abs((hi.height-lo.height)/(2*eps)-w['d'+axis])<1e-6);
 }
 const evolve=t=>W.sample({wake:[{...packet,age:packet.age+t,amplitude:packet.amplitude+packet.amplitude_dt*t}]},x,z).height;
 assert(Math.abs((evolve(eps)-evolve(-eps))/(2*eps)-w.dt)<1e-6);
}
assert(W.sample(s,0,22).height<0);assert(W.sample(s,10,22).height>0);
assert.equal(W.sample(s,100,100).height,0);
assert.equal(W.cue(9,[[10,30]]).amount,0);assert.equal(W.cue(15,[[10,30]]).amount,1);assert.equal(W.cue(30,[[10,30]]).amount,0);
for(const mode of [0,1,2]){
 const sim=P.reset();
 for(let i=0;i<120*180;i++){
  P.step(sim,{steer:mode===1?Math.sin(i/340)*.8:0,drive:mode===2?-.5:0,crouch:mode===0});
  assert(Object.values(sim.position).every(Number.isFinite));assert(Number.isFinite(sim.velocity.y));
  assert.equal(sim.wake.length,24);assert(sim.sink<=12);
 }
 assert(sim.speed>=60&&sim.speed<=220);
}
console.log('PASS: analytic spatial/time derivatives, wake channel/ridges, bounded support, chorus envelopes, three 3-minute simulations');

assert.equal(W.flight({grounded:false,velocity:{y:70}},40).space,0);
assert.equal(W.flight({grounded:false,velocity:{y:70}},150).space,1);
assert.equal(W.flight({grounded:true,velocity:{y:70}},150).space,0);
