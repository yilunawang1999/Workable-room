import {useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
/** Project-owned synthesis only: room air, cloth friction and sparse, unresolved musical tones. */
export class RoomAudio {
 context:AudioContext|null=null;master:GainNode|null=null;layers:GainNode[]=[];sources:AudioBufferSourceNode[]=[];enabled=true;
 private amount=0;private paused=false;private musicTimer:ReturnType<typeof setTimeout>|null=null;private note=0;private cloth:AudioBuffer|null=null;
 private nodes:AudioNode[]=[];private voices=new Set<AudioScheduledSourceNode>();private musicGain:GainNode|null=null;private musicPan:StereoPannerNode|null=null;
 async start(){
  if(this.context){if(this.context.state==='suspended')await this.context.resume();return;}
  const ctx=new AudioContext();this.context=ctx;this.master=ctx.createGain();this.master.gain.value=this.enabled?.7:0;this.master.connect(ctx.destination);
  const buffer=ctx.createBuffer(2,ctx.sampleRate*7,ctx.sampleRate);let seed=241;
  for(let c=0;c<2;c++){let last=0;const d=buffer.getChannelData(c);for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;last=(last+(seed/4294967296*2-1)*.023)/1.022;d[i]=last;}}
  for(let i=0;i<3;i++){
   const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.playbackRate.value=[.82,1,1.23][i];
   const filter=ctx.createBiquadFilter();filter.type=i===2?'bandpass':'lowpass';filter.frequency.value=[240,1050,740][i];filter.Q.value=.45;
   const gain=ctx.createGain();gain.gain.value=i===0?.09:0;const pan=ctx.createPanner();pan.panningModel='equalpower';pan.refDistance=2;pan.rolloffFactor=.35;
   const pos=[[0,1,1],[-1.9,2,-3.3],[1.6,1.5,-2.5]][i];pan.positionX.value=pos[0];pan.positionY.value=pos[1];pan.positionZ.value=pos[2];
   source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(this.master);source.start(0,i*1.3);this.layers.push(gain);this.sources.push(source);this.nodes.push(filter,gain,pan);
  }
  this.cloth=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.7),ctx.sampleRate);const d=this.cloth.getChannelData(0);for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=(seed/4294967296*2-1)*(.7+.3*Math.sin(i*.019));}
  this.musicGain=ctx.createGain();this.musicGain.gain.value=1;this.musicPan=ctx.createStereoPanner();this.musicPan.pan.value=-.17;this.musicGain.connect(this.musicPan);this.musicPan.connect(this.master);this.nodes.push(this.musicGain,this.musicPan);
  this.update(this.amount);if(ctx.state==='suspended')await ctx.resume();this.scheduleMusic(7500);
 }
 update(amount:number){this.amount=amount;if(!this.context)return;const now=this.context.currentTime;this.layers.forEach((g,i)=>g.gain.setTargetAtTime(i===0?.09:amount*(i===1?.105:.055),now,3.2));if(this.musicPan)this.musicPan.pan.setTargetAtTime(-.17+amount*.24,now,4);}
 mute(value:boolean){this.enabled=!value;if(this.context&&this.master)this.master.gain.setTargetAtTime(value?0:.7,this.context.currentTime,.18);}
 setPaused(value:boolean){this.paused=value;if(this.musicTimer)clearTimeout(this.musicTimer);this.musicTimer=null;const ctx=this.context;if(!ctx)return;if(value){void ctx.suspend().catch(()=>{});}else{void ctx.resume().then(()=>this.scheduleMusic(4000)).catch(()=>{});}}
 reset(){this.note=0;this.update(0);if(this.musicTimer)clearTimeout(this.musicTimer);this.musicTimer=null;for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();if(!this.paused)this.scheduleMusic(7500);}
 private scheduleMusic(delay:number){if(this.paused||!this.context||this.musicTimer)return;this.musicTimer=setTimeout(()=>{this.musicTimer=null;this.tone();const gap=this.amount<.15?18500:this.amount<1?14500:16500;this.scheduleMusic(gap+(this.note%3)*1400);},delay);}
 private tone(){
  const ctx=this.context;if(!ctx||!this.musicGain||ctx.state!=='running'||!this.enabled||this.paused)return;
  const now=ctx.currentTime,voice=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
  const pitches=[146.83,207.65,130.81,195.99,174.61];voice.type='triangle';voice.frequency.value=pitches[this.note%pitches.length];voice.detune.value=[-7,4,-3,6,-4][this.note%5];filter.type='lowpass';filter.frequency.value=420;
  const peak=.00115+this.amount*.0002,duration=7.5+this.amount*1.5;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(peak,now+2.8);gain.gain.setTargetAtTime(.00001,now+duration-3,1.1);gain.gain.linearRampToValueAtTime(0,now+duration);
  voice.connect(filter);filter.connect(gain);gain.connect(this.musicGain);this.voices.add(voice);voice.start(now);voice.stop(now+duration+.1);voice.onended=()=>{voice.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(voice);};this.note++;
 }
 fabric(stitch=false){
  const ctx=this.context;if(!ctx||!this.master||!this.cloth||!this.enabled||this.paused||ctx.state!=='running')return;
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),pan=ctx.createStereoPanner(),now=ctx.currentTime;
  source.buffer=this.cloth;source.playbackRate.value=stitch?.87:1.35;filter.type='bandpass';filter.frequency.value=stitch?1250:850;filter.Q.value=.55;pan.pan.value=-.12;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(stitch?.014:.019,now+.045);gain.gain.exponentialRampToValueAtTime(.0001,now+(stitch?.58:.24));
  source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(this.master);source.start();source.stop(now+(stitch?.64:.3));this.voices.add(source);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();this.voices.delete(source);};
 }
 listener(position:THREE.Vector3,forward:THREE.Vector3,up:THREE.Vector3){const ctx=this.context;if(!ctx||ctx.state!=='running')return;const l=ctx.listener,t=ctx.currentTime;l.positionX.setTargetAtTime(position.x,t,.08);l.positionY.setTargetAtTime(position.y,t,.08);l.positionZ.setTargetAtTime(position.z,t,.08);l.forwardX.setTargetAtTime(forward.x,t,.08);l.forwardY.setTargetAtTime(forward.y,t,.08);l.forwardZ.setTargetAtTime(forward.z,t,.08);l.upX.setTargetAtTime(up.x,t,.08);l.upY.setTargetAtTime(up.y,t,.08);l.upZ.setTargetAtTime(up.z,t,.08);}
 dispose(){if(this.musicTimer)clearTimeout(this.musicTimer);this.musicTimer=null;for(const source of [...this.sources,...this.voices]){try{source.stop();}catch{}}this.nodes.forEach(n=>n.disconnect());this.master?.disconnect();const ctx=this.context;this.context=null;if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});this.layers=[];this.sources=[];this.voices.clear();this.nodes=[];}
}
export function AudioListener({audio}:{audio:RefObject<RoomAudio|null>}){
 const elapsed=useRef(0),v=useMemo(()=>({forward:new THREE.Vector3(),up:new THREE.Vector3()}),[]);
 useFrame(({camera},dt)=>{elapsed.current+=dt;if(elapsed.current<.1)return;elapsed.current=0;camera.getWorldDirection(v.forward);v.up.set(0,1,0).applyQuaternion(camera.quaternion);audio.current?.listener(camera.position,v.forward,v.up);});return null;
}
