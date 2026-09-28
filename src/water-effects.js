'use strict';
// A bounded CPU heightfield, intended for a direct C/LUT port. No textures,
// particle emitters, render targets, or fragment-shader water simulation.
const WaterEffects = (() => {
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 // User-confirmed Plastic Wave Boy cues; browser edits can preview alternate ranges.
 let choruses=[[45,64.97],[107.83,142.27],[162,180.03]];
 function cue(time,ranges=choruses){
  for(const [start,end] of ranges)if(time>=start&&time<end)
   return {amount:smooth((time-start)/2)*smooth((end-time)/3),age:time-start};
  return {amount:0,age:-1};
 }
 function sample(s,x,z){
  let h=0,dx=0,dz=0,dt=0,foam=0;
  for(const p of s.wake){
   if(p.amplitude<=0)continue;
   // Move the visible packet to the tail; the original contact model stays intact.
   const px=x-p.x-p.fx*22,pz=z-p.z-p.fz*22;
   const along=(px*p.fx+pz*p.fz)/30;
   if(Math.abs(along)>=1)continue;
   const side=px*p.fz-pz*p.fx,spread=5+8*p.age;
   if(Math.abs(side)>spread+13)continue;
   const a=1-along*along,envelope=a*a*a,da=-6*along*a*a/30;
   // Twin outward ridges plus a displaced-water trough; signed relief, no decals.
   for(let lobe=-1;lobe<=1;lobe++){
    const width=lobe===0?spread+3:13,q=(side-lobe*spread)/width;
    if(Math.abs(q)>=1)continue;
    const b=1-q*q,profile=b*b*b,derivative=-6*q*b*b/width;
    const weight=lobe===0?-.55:.82*(1+lobe*(p.bias||0)),strength=p.amplitude*weight;
    h+=strength*envelope*profile;
    dt+=p.amplitude_dt*weight*envelope*profile
      +strength*envelope*derivative*(-lobe*8-q*(lobe===0?8:0));
    const u=strength*da*profile,v=strength*envelope*derivative;
    dx+=u*p.fx+v*p.fz;dz+=u*p.fz-v*p.fx;
    if(lobe!==0)foam+=p.amplitude*.16*envelope*profile;
   }
  }
  const limiter=1/(1+Math.abs(h)*.12);
  return {height:h*limiter,dx:dx*limiter*limiter,dz:dz*limiter*limiter,dt:dt*limiter*limiter,foam:clamp(foam,0,.85)};
 }
 function flight(s,altitude){
  // Match the original altitude-driven camera pullback, not manual camera zoom.
  const automaticZoom=Math.min(Math.max(0,altitude)*.65,95);
  const space=s.grounded?0:smooth((automaticZoom-35)/60);
  const climb=s.grounded?0:smooth((s.velocity.y-5)/65)*space;
  return {space,climb};
 }
 return {sample,cue,choruses,flight};
})();
if(typeof module!=='undefined')module.exports=WaterEffects;
