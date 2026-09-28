'use strict';
/* Phone orientation stays local. No sensor readings are stored or transmitted. */
(() => {
 const button=document.getElementById('tilt'),center=document.getElementById('recenter'),hint=document.getElementById('motion-hint');
 const phone=!!window.matchMedia?.('(pointer: coarse)').matches;
 let enabled=false,allowed=false,neutral=null,latest=null,lastSample=0,steer=0,drive=0,calibration=[],finish=null,timer;
 const clamp=x=>Math.max(-1,Math.min(1,x));
 const status=text=>{hint.textContent=text;button.textContent=enabled?'Tilt on':'Tilt off';button.setAttribute('aria-pressed',String(enabled));center.disabled=!enabled;};
 function angles(beta,gamma,angle){
  const r=Math.PI/180,b=beta*r,g=gamma*r,a=angle*r;
  const x=Math.sin(g)*Math.cos(b),y=Math.sin(b),z=Math.cos(g)*Math.cos(b);
  const sx=x*Math.cos(a)+y*Math.sin(a),sy=y*Math.cos(a)-x*Math.sin(a);
  return {x:Math.atan2(sx,Math.hypot(sy,z))/r,y:Math.atan2(sy,Math.hypot(sx,z))/r};
 }
 function complete(ok){clearTimeout(timer);const resolve=finish;finish=null;if(!ok){enabled=false;neutral=null;status('Tilt unavailable · use the touch stick');}if(resolve)resolve();}
 function calibrate(){neutral=null;steer=drive=0;calibration=[];status('Hold your phone comfortably and still…');return new Promise(resolve=>{if(finish)finish();finish=resolve;clearTimeout(timer);timer=setTimeout(()=>complete(false),2500);});}
 function sample(e){if(!enabled||document.hidden||!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;lastSample=performance.now();latest=angles(e.beta,e.gamma,window.screen?.orientation?.angle??window.orientation??0);
  if(!neutral){calibration.push({...latest,time:lastSample});if(calibration.length>60)calibration.shift();if(calibration.length>=5&&lastSample-calibration[0].time>=350){const xs=calibration.map(v=>v.x),ys=calibration.map(v=>v.y);if(Math.max(...xs)-Math.min(...xs)>4||Math.max(...ys)-Math.min(...ys)>4){calibration=[{...latest,time:lastSample}];return;}neutral={x:xs.reduce((a,b)=>a+b)/xs.length,y:ys.reduce((a,b)=>a+b)/ys.length};status('Tilt to carve and lean · hold GRIP to stay attached');complete(true);}}
 }
 async function start(){
  if(!phone)return;
  button.hidden=center.hidden=hint.hidden=false;
  const api=window.DeviceOrientationEvent;
  if(!window.isSecureContext||!api){status('Tilt unavailable here · use the touch stick');return;}
  try{
   // Called synchronously from Start surfing, before awaiting music decoding.
   if(!allowed&&typeof api.requestPermission==='function'&&await api.requestPermission()!=='granted'){status('Motion permission declined · use the touch stick');return;}
   allowed=true;enabled=true;window.removeEventListener('deviceorientation',sample);window.addEventListener('deviceorientation',sample);await calibrate();
  }catch{enabled=false;status('Tilt unavailable · use the touch stick');}
 }
 function input(dt){if(!enabled||!neutral||document.hidden||performance.now()-lastSample>1000){steer=drive=0;return {steer:0,drive:0};}const axis=v=>Math.abs(v)<=3?0:Math.sign(v)*clamp((Math.abs(v)-3)/22),blend=1-Math.exp(-12*dt);steer+=(axis(latest.x-neutral.x)-steer)*blend;drive+=(axis(neutral.y-latest.y)-drive)*blend;return {steer,drive};}
 function recenter(){if(enabled)void calibrate();}
 button.onclick=()=>{if(enabled){enabled=false;steer=drive=0;if(finish)complete(true);status('Touch controls');}else void start();};center.onclick=recenter;
 window.screen?.orientation?.addEventListener('change',recenter);window.addEventListener('orientationchange',recenter);
 document.addEventListener('visibilitychange',()=>{steer=drive=0;if(!document.hidden&&enabled)recenter();});
 button.hidden=center.hidden=hint.hidden=true;
 window.phoneMotion={start,input,angles};
})();
