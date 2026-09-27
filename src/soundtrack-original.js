'use strict';
(() => {
 const button=document.getElementById('music');
 let context,master,rhythm,loading,enabled=true,paused=false,grounded=true,ready=false;
 function label(){button.textContent=loading&&!ready?'Music loading':!enabled?'Music off':paused&&ready?'Music paused':ready&&context.state==='running'?'Music on':'Music on';button.setAttribute('aria-pressed',String(enabled));button.dataset.musicState=ready?(paused?'paused':!enabled?'muted':context.state==='running'?'playing':'waiting-for-gesture'):'waiting';button.dataset.arrangement=grounded?'full':'air';button.title='Plastic Wave Boy · percussion drops out in flight and returns on landing';}
 function mix(){if(!ready)return;master.gain.setTargetAtTime(enabled?.7:0,context.currentTime,.04);rhythm.gain.setTargetAtTime(grounded?1:0,context.currentTime,.12);}
 async function sync(){if(!context)return;mix();if(paused)await context.suspend();else void context.resume().then(label).catch(label);label();}
 async function unlock(){
  if(context){await sync();return;}
  try{
   context=new (window.AudioContext||window.webkitAudioContext)();
   context.onstatechange=label;
   void context.resume().then(label).catch(label);
   loading=true;label();
   const encoded=JSON.parse(document.getElementById('music-data').textContent);
   const decode=async text=>{const bytes=Uint8Array.from(atob(text),c=>c.charCodeAt(0));return context.decodeAudioData(bytes.buffer);};
   const buffers=await Promise.all([decode(encoded.bed),decode(encoded.rhythm)]);
   if(buffers[0].length!==buffers[1].length)throw Error('Music layers have unequal decoded lengths');
   master=context.createGain();master.gain.value=enabled?.7:0;master.connect(context.destination);
   rhythm=context.createGain();rhythm.gain.value=grounded?1:0;rhythm.connect(master);
   const start=context.currentTime+.05;
   buffers.forEach((buffer,i)=>{const source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(i?rhythm:master);source.start(start);});
   ready=true;button.dataset.duration=String(buffers[0].duration);button.dataset.aligned='true';await sync();
  }catch(e){button.textContent='Retry music';button.title=e.message;loading=false;ready=false;if(context)await context.close();context=null;}
 }
 button.onclick=()=>{if(ready&&(!enabled||paused||context.state==='running'))enabled=!enabled;else enabled=true;void unlock();};
 window.soundtrack={start(){paused=false;return unlock();},setPaused(value){paused=value;void sync();label();},setGrounded(value){if(grounded!==value){grounded=value;mix();label();}}};
 label();
})();
