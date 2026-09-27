'use strict';
(() => {
 const button=document.getElementById('music'),FADE=4;
 let context,master,rhythm,loading,enabled=true,paused=false,grounded=true,ready=false,timer;
 let tracks=[],queue=[],nextStart=0,nextTrack=0,first=true;
 const incoming=Float32Array.from({length:128},(_,i)=>Math.sin(i/127*Math.PI/2));
 const outgoing=Float32Array.from(incoming,x=>Math.sqrt(Math.max(0,1-x*x)));
 function label(){
  button.textContent=loading&&!ready?'Music loading':!enabled?'Music off':paused&&ready?'Music paused':'Music on';
  button.setAttribute('aria-pressed',String(enabled));
  button.dataset.musicState=ready?(paused?'paused':!enabled?'muted':context.state==='running'?'playing':'waiting-for-gesture'):'waiting';
  button.dataset.arrangement=grounded?'full':'air';
  const active=queue.filter(x=>x.start<=context?.currentTime&&x.end>context.currentTime);
  button.dataset.track=active.map(x=>x.title).join(' → ')||tracks[0]?.title||'Plastic Wave Boy';
  button.title=button.dataset.track+' · percussion drops out in flight';
 }
 function mix(){if(!ready)return;master.gain.setTargetAtTime(enabled?.7:0,context.currentTime,.04);rhythm.gain.setTargetAtTime(grounded?1:0,context.currentTime,.12);}
 function schedule(){
  // Keep at least two complete songs ahead, including when a background tab throttles timers.
  queue=queue.filter(x=>x.end>context.currentTime);
  const horizon=context.currentTime+tracks.reduce((sum,t)=>sum+t.duration,0);
  while(nextStart<horizon){
   const track=tracks[nextTrack],start=nextStart,end=start+track.duration;
   track.buffers.forEach((buffer,i)=>{
    const envelope=context.createGain(),source=context.createBufferSource();
    envelope.connect(i?rhythm:master);envelope.gain.setValueAtTime(first?1:0,start);
    if(!first)envelope.gain.setValueCurveAtTime(incoming,start,FADE);
    envelope.gain.setValueCurveAtTime(outgoing,end-FADE,FADE);
    source.buffer=buffer;source.connect(envelope);source.start(start);source.stop(end);
    source.onended=()=>{source.disconnect();envelope.disconnect();};
   });
   queue.push({title:track.title,start,end});nextStart=end-FADE;nextTrack=(nextTrack+1)%tracks.length;first=false;
  }
  label();
 }
 async function sync(){if(!context)return;mix();if(paused)await context.suspend();else await context.resume();label();}
 async function unlock(){
  if(context){await sync();return;}
  try{
   context=new (window.AudioContext||window.webkitAudioContext)();context.onstatechange=label;
   await context.resume();loading=true;label();
   const encoded=JSON.parse(document.getElementById('music-data').textContent);
   const decode=async text=>{const bytes=Uint8Array.from(atob(text),c=>c.charCodeAt(0));return context.decodeAudioData(bytes.buffer);};
   tracks=[];
   for(const track of encoded.tracks){const buffers=await Promise.all([decode(track.bed),decode(track.rhythm)]);if(buffers[0].length!==buffers[1].length)throw Error('Music layers have unequal decoded lengths');if(buffers[0].duration<=FADE*2)throw Error('Track too short for crossfade');tracks.push({title:track.title,buffers,duration:buffers[0].duration});}
   master=context.createGain();master.gain.value=enabled?.7:0;master.connect(context.destination);
   rhythm=context.createGain();rhythm.gain.value=grounded?1:0;rhythm.connect(master);
   queue=[];first=true;nextTrack=0;nextStart=context.currentTime+.05;
   ready=true;loading=false;button.dataset.aligned='true';button.dataset.crossfadeSeconds=String(FADE);button.dataset.trackCount=String(tracks.length);
   schedule();timer=setInterval(schedule,1000);await sync();
  }catch(e){clearInterval(timer);button.textContent='Retry music';button.title=e.message;loading=false;ready=false;if(context)await context.close();context=null;}
 }
 button.onclick=()=>{if(ready&&(!enabled||paused||context.state==='running'))enabled=!enabled;else enabled=true;void unlock();};
 window.soundtrack={start(){paused=false;return unlock();},setPaused(value){paused=value;void sync();label();},setGrounded(value){if(grounded!==value){grounded=value;mix();label();}}};
 label();
})();
