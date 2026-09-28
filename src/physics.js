/* Light Surf R7: port of releases/milestone2-r7/src/surf.c.
   Fixed 120 Hz simulation; rendering never changes the simulation step. */
'use strict';
const Physics = (() => {
const wakeField=typeof WaterEffects!=='undefined'?WaterEffects:require('./water-effects.js');
const TAU=Math.PI*2, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const table=Float32Array.from({length:2049},(_,i)=>Math.sin(i*TAU/2048));
function sincos(phase){const c=phase*2048/TAU,n=Math.floor(c),f=c-n,i=n&2047,j=(i+512)&2047;return [table[i]+f*(table[i+1]-table[i]),table[j]+f*(table[j+1]-table[j])];}
function wave(x,z,time){const w={height:0,dx:0,dz:0,dt:0,wake:0};for(const [a,b,c,d] of [[42,1,9,-3],[19,-5,21,-7],[6,19,7,5]]){const kx=b*TAU/8192,kz=c*TAU/8192,om=d*TAU/256,[sn,cs]=sincos(x*kx+z*kz+time*om);w.height+=a*sn;w.dx+=a*cs*kx;w.dz+=a*cs*kz;w.dt+=a*cs*om;}return w;}
function surface(s,x,z){const w=wave(x,z,s.time);const relief=wakeField.sample(s,x,z);let h=relief.height,dx=relief.dx,dz=relief.dz,dt=relief.dt;
 w.foam=relief.foam;
 if(s.splash_strength>0&&s.splash_age<.9){const age=s.splash_age,radius=18+30*age,px=x-s.splash_x,pz=z-s.splash_z,inv=1/(radius*radius),q=(px*px+pz*pz)*inv;if(q<1){const u=age/.9,fade=1-u,b=1-q,amp=s.splash_strength*16*u*u*fade*fade,ad=s.splash_strength*32*u*fade*(1-2*u)/.9,shape=-b*b*b*(1-5*q),der=b*b*(8-20*q);h+=amp*shape;dx+=amp*der*2*px*inv;dz+=amp*der*2*pz*inv;dt+=ad*shape-amp*der*2*q*30/radius;}}
 let scale=1/(1+Math.abs(h)*.1);w.wake=h*scale;w.height+=w.wake;scale*=scale;w.dx+=dx*scale;w.dz+=dz*scale;w.dt+=dt*scale;return w;}
function emptyWake(){return {x:0,z:0,fx:0,fz:0,age:0,strength:0,spread:0,amplitude:0,amplitude_dt:0,bound_x:0,bound_z:0};}
function reset(){const s={position:{x:0,y:0,z:80},velocity:{x:0,y:0,z:125},heading:0,lean:0,pitch:0,time:28,speed:125,air_time:0,launches:0,landings:0,grounded:true,crouched:false,wake_clock:.16,wake_head:0,wake:Array.from({length:24},emptyWake),sink:0,sink_velocity:0,splash_age:2,splash_strength:0,splash_x:0,splash_y:0,splash_z:0};const w=wave(0,80,28);s.position.y=w.height+2.5;s.velocity.y=w.dz*125+w.dt;return s;}
function ageWake(s,dt){for(const p of s.wake){if(p.strength<=0)continue;p.age+=dt;if(p.age>=3.2){p.strength=p.amplitude=0;continue;}const u=clamp(p.age/.12,0,1),on=u*u*(3-2*u),od=u<1?6*u*(1-u)/.12:0,fade=1-p.age/3.2;p.amplitude=p.strength*on*fade*fade;p.amplitude_dt=p.strength*(od*fade*fade-on*2*fade/3.2);p.spread=5+8*p.age;p.bound_x=Math.abs(p.fx)*34+Math.abs(p.fz)*(p.spread+14);p.bound_z=Math.abs(p.fz)*34+Math.abs(p.fx)*(p.spread+14);}}
function rebase(s,x,z){s.position.x-=x;s.position.z-=z;s.splash_x-=x;s.splash_z-=z;for(const p of s.wake){p.x-=x;p.z-=z;}}
function step(s,input,dt=1/120){const steer=clamp(input.steer,-1,1),posture=clamp(input.drive,-1,1);s.crouched=input.crouch;s.time+=dt;if(s.time>=256)s.time-=256;ageWake(s,dt);s.splash_age+=dt;s.heading+=steer*(s.grounded?1.05:.38)*dt;if(s.heading>Math.PI)s.heading-=TAU;if(s.heading<-Math.PI)s.heading+=TAU;s.lean+=(-steer*.65-s.lean)*5*dt;
 const fx=Math.sin(s.heading),fz=Math.cos(s.heading),before=surface(s,s.position.x,s.position.z);
 if(s.grounded){const speed=Math.hypot(s.velocity.x,s.velocity.z),slope=(before.dx*s.velocity.x+before.dz*s.velocity.z)/Math.max(speed,1),force=95*(1+.45*Math.max(posture,0));s.speed=clamp(s.speed+((125-s.speed)*.18-slope*force/(1+slope*slope))*dt,60,220);}
 const grip=(s.grounded?(input.crouch?6:4):.45)*dt;s.velocity.x+=(fx*s.speed-s.velocity.x)*grip;s.velocity.z+=(fz*s.speed-s.velocity.z)*grip;s.position.x+=s.velocity.x*dt;s.position.z+=s.velocity.z*dt;
 const w=surface(s,s.position.x,s.position.z),contact=w.height+2.5,tangent=w.dx*s.velocity.x+w.dz*s.velocity.z+w.dt,gravity=18+(posture>0?110:4)*posture;
 if(s.grounded){const cg=input.crouch?140:18+(posture>0?75:9)*posture,previous=s.velocity.y+s.sink_velocity;if(previous-tangent>cg*dt&&previous>3&&s.sink<.4&&s.splash_age>.3){s.grounded=false;s.sink=s.sink_velocity=0;s.air_time=0;s.launches++;}else{s.sink_velocity+=(tangent-previous)*.2;const deep=Math.max(0,s.sink-4),drag=6+.045*Math.abs(s.sink_velocity)+2*deep,buoyancy=22*s.sink+30*deep*deep;s.sink_velocity+=(-buoyancy-drag*s.sink_velocity)*dt;s.sink+=s.sink_velocity*dt;if(s.sink>12){s.sink=12;s.sink_velocity=Math.min(0,s.sink_velocity);}if(s.sink<-1.2){s.sink=-1.2;s.sink_velocity=Math.max(0,s.sink_velocity);}s.position.y=contact-s.sink;s.velocity.y=tangent-s.sink_velocity;}}
 if(!s.grounded){s.air_time+=dt;s.velocity.y-=gravity*dt;s.position.y+=s.velocity.y*dt;if(s.position.y<=contact&&s.velocity.y<=tangent){const impact=Math.max(0,tangent-s.velocity.y),slope=w.dx*fx+w.dz*fz,alignment=clamp(1-Math.abs(s.pitch-Math.atan(slope))/.65,0,1),carry=Math.max(0,s.velocity.y*slope)/(1+slope*slope);s.speed=clamp(s.speed+Math.min(carry*.45,24)*alignment,60,220);s.grounded=true;s.sink=clamp(contact-s.position.y,0,12);s.sink_velocity=impact;s.position.y=contact-s.sink;s.velocity.y=tangent-s.sink_velocity;if(impact>12){s.splash_age=0;s.splash_strength=clamp(impact/30,0,4);s.splash_x=s.position.x;s.splash_y=w.height;s.splash_z=s.position.z;}s.landings++;}}
 const target=s.grounded?Math.atan(w.dx*fx+w.dz*fz):clamp(Math.atan(s.velocity.y/(s.speed+.01))-posture*.7,-1.1,1.1);s.pitch+=(target-s.pitch)*dt*6;
 if(s.grounded){s.wake_clock+=dt;if(s.wake_clock>=.16){s.wake_clock-=.16;const velocityLength=Math.hypot(s.velocity.x,s.velocity.z)||1,wfx=s.velocity.x/velocityLength,wfz=s.velocity.z/velocityLength;s.wake[s.wake_head]={...emptyWake(),x:s.position.x-wfx*36,z:s.position.z-wfz*36,fx:wfx,fz:wfz,bias:clamp(s.lean*.6,-.3,.3),strength:4.5*(s.speed/125)*(.85+Math.abs(s.lean)*.4)};s.wake_head=(s.wake_head+1)%24;}}else s.wake_clock=.16;
}
return {reset,step,wave,surface,rebase,clamp};
})();
if(typeof module!=='undefined')module.exports=Physics;
