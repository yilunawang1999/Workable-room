'use client';
import {Component,useCallback,useEffect,useReducer,useRef,useState,type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import * as THREE from 'three';
import {MaterialsProvider,Box,useMaterials} from './materials';
import RoomEnvironment,{WINDOW_BEAR} from './RoomEnvironment';
import EnvironmentTransition from './EnvironmentTransition';
import TeddyBear,{Arm,BEAR_BASE} from './TeddyBear';
import StitchingInteraction from './StitchingInteraction';
import {InteractiveObject,CarriedObject,type Cue} from './InteractiveObject';
import Player,{VIEWS,type ViewRequest} from './Player';
import {progression,initialState,richness,type Action,type ExperienceState} from './progression';
import {RoomAudio,AudioListener} from './AudioState';
import TextFragments from './TextFragments';
import XRBridge from './XRBridge';
import {createRoomRenderer} from './renderer';
import {Dialog,DialogContent,DialogTitle} from '@/components/ui/dialog';

class SceneBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<div className="error-room"><h1>The room couldn’t open.</h1><p>The renderer could not start. Try reloading, or enable hardware acceleration in your desktop browser.</p><button className="quiet-button" onClick={()=>location.reload()}>Try again</button></div>:this.props.children;}}
export default function Experience(){
 const [state,dispatch]=useReducer(progression,initialState);const [resetId,setResetId]=useState(0);const [entered,setEntered]=useState(false);const [paused,setPaused]=useState(false);const [muted,setMuted]=useState(false);const [cue,setCue]=useState<Cue|null>(null);const [stitching,setStitching]=useState(false);const [view,setView]=useState<ViewRequest>({id:0,position:[3.2,2.6,4.65],target:[-.3,1.07,-.55]});const [viewName,setViewName]=useState('entry');const [xrSupported,setXRSupported]=useState(false);const [xrMessage,setXRMessage]=useState('');const [inXR,setInXR]=useState(false);const [ready,setReady]=useState(false);
 const audio=useRef<RoomAudio|null>(null);const enterXR=useRef<(()=>Promise<void>)|null>(null);const amount=richness(state);
 useEffect(()=>{audio.current=new RoomAudio();navigator.xr?.isSessionSupported('immersive-vr').then(setXRSupported).catch(()=>setXRSupported(false));return()=>audio.current?.dispose();},[]);
 useEffect(()=>{audio.current?.update(amount);},[amount]);
 useEffect(()=>{audio.current?.mute(muted);},[muted]);
 useEffect(()=>{audio.current?.setPaused(paused);},[paused]);
 useEffect(()=>{const visibility=()=>audio.current?.setPaused(paused||document.hidden);document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[paused]);
 const focus=useCallback((name:keyof typeof VIEWS)=>{setView(v=>({id:v.id+1,...VIEWS[name]}));setViewName(name);setCue(null);},[]);
 const command=useCallback((action:Action)=>{dispatch(action);setCue(null);if(action.type!=='RESET')audio.current?.fabric(action.type==='STITCH');if(action.type==='ATTACH')focus('work');if(action.type==='PICK'&&action.object==='arm')focus('work');if(action.type==='PICK'&&action.object==='bear')focus('window');if(action.type==='PLACE_WINDOW')focus('window');},[focus]);
 const restart=useCallback(()=>{dispatch({type:'RESET'});setResetId(n=>n+1);setPaused(false);setStitching(false);setCue(null);audio.current?.reset();focus('room');},[focus]);
 const finishStitch=useCallback((index:number)=>command({type:'STITCH',index}),[command]);
 const handleXRReady=useCallback((fn:()=>Promise<void>)=>{enterXR.current=fn;},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(!entered)return;if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.code==='KeyR'){e.preventDefault();restart();return;}if(e.key==='Escape'){e.preventDefault();setPaused(v=>!v);setCue(null);}if(e.code==='KeyQ'&&!paused){command({type:'DROP'});}if(e.code==='KeyH'){setPaused(true);}if(e.code==='KeyM'){setMuted(v=>!v);}if(e.code==='KeyT'&&!paused&&!state.held)focus('work');if(e.code==='KeyV'&&!paused)focus('window');};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[entered,paused,state.held,command,focus,restart]);
 function enter(){setEntered(true);focus('room');void audio.current?.start().catch(()=>setMuted(true));}
 function walk(point:THREE.Vector3){if(state.held==='cloth-blue'||state.held==='cloth-green'){command({type:'DROP'});return;}if(Math.abs(point.x)<1.7&&point.z>-.9&&point.z<1) return;const p:[number,number,number]=[THREE.MathUtils.clamp(point.x,-3.15,3.15),1.75,THREE.MathUtils.clamp(point.z,-1.88,4.6)];setView(v=>({id:v.id+1,position:p,target:[p[0],1.3,p[2]-2]}));setViewName('free');}
 return <main className="experience" aria-label="A workable world, an interactive sewing room">
  <div className="scene" style={{'--saturation':.88} as React.CSSProperties}>
   <SceneBoundary><Canvas shadows dpr={[1,1.7]} camera={{position:[3.2,2.6,4.65],fov:47,near:.05,far:35}} gl={createRoomRenderer} onCreated={({gl,scene})=>{gl.setClearColor('#d3d8cf');gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.07;scene.fog=new THREE.Fog('#d3d7ce',9,19);setReady(true);}}>
    <MaterialsProvider>
     <EnvironmentTransition amount={amount}/>
     <AudioListener audio={audio}/>
     <TextFragments key={`text-${resetId}`} index={state.fragment} entered={entered&&!paused&&!inXR} reoriented={state.atWindow}/>
     <RoomEnvironment amount={amount} entered={entered&&!paused} onFloor={walk} onWindow={()=>{if(!paused)command({type:'PLACE_WINDOW'});}} windowActive={entered&&!paused&&state.held==='bear'}/>
     <Objects key={resetId} state={state} enabled={entered&&!paused&&!inXR} command={command} onCue={setCue} finishStitch={finishStitch} setStitching={setStitching}/>
     {entered&&!paused&&!state.atWindow&&!state.held&&viewName!=='work'&&<Html position={[0,1.99,-.03]} center zIndexRange={[10,0]}><button className="space-cue" onClick={()=>focus('work')}>approach the table</button></Html>}
     <Player enabled={entered&&!paused&&!stitching} request={view}/>
     <XRBridge onReady={handleXRReady} onSession={setInXR}/>
    </MaterialsProvider>
   </Canvas></SceneBoundary>
  </div>
  {!entered&&<div className="entry"><div className="entry-copy"><p className="eyebrow">A literary room</p><h1>A workable<br/>world.</h1><p className="inspiration">After Xi Xi’s <i>The Teddy Bear Chronicles</i><br/><span>縫熊志</span></p><button className="enter" onClick={enter} disabled={!ready}>{ready?'Enter the room':'Opening the room…'}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></button><p className="entry-note">Take your time. Sound is quiet; headphones are welcome.</p></div><div className="entry-footer"><span>Literature · making · attention</span><span>An interactive research prototype</span></div></div>}
  {entered&&!inXR&&<div className="room-ui">
   {!paused&&<><div className="controls-hint">W A S D to move · hold right mouse to look<br/>Click an object to handle it · Esc for room controls</div>{state.atWindow&&<div className="reflection" role="status">What changes when the world becomes workable again?</div>}{cue&&<div className="cue" style={{left:cue.x,top:cue.y}}>{cue.text}</div>}{stitching&&<div className="stitch-help">Draw the thread to the other hole.</div>}{state.attached&&state.stitches<3&&!stitching&&<div className="stitch-help">Hold one hole. Draw slowly to the other.</div>}<div className="touch-nav"><button aria-label="Move forward" onClick={()=>window.dispatchEvent(new CustomEvent('room-step',{detail:'forward'}))}>↑</button><button aria-label="Move backward" onClick={()=>window.dispatchEvent(new CustomEvent('room-step',{detail:'back'}))}>↓</button><button aria-label="Look at the table" onClick={()=>focus('work')}>table</button><button aria-label="Look towards the window" onClick={()=>focus('window')}>view</button></div></>}
   <button className="pause-button" aria-label="Room controls" onClick={()=>setPaused(true)}>Ⅱ</button>
   <Dialog open={paused} onOpenChange={setPaused}><DialogContent className="room-dialog" showCloseButton={false} aria-describedby={undefined} onEscapeKeyDown={e=>e.stopPropagation()}><section className="pause-card"><p className="eyebrow">A workable world</p><DialogTitle>A moment to pause.</DialogTitle><dl><dt>W A S D / arrows</dt><dd>Move through the room</dd><dt>Right mouse + drag</dt><dd>Look around</dd><dt>Click</dt><dd>Pick up or place</dd><dt>Hold + drag</dt><dd>Draw a stitch between holes</dd><dt>Q</dt><dd>Put a held object back</dd><dt>T / V</dt><dd>Turn to the table / window</dd><dt>M</dt><dd>Sound on / off</dd><dt>Esc</dt><dd>Pause / return</dd></dl><div className="pause-actions"><button className="enter" onClick={()=>setPaused(false)}>Return to the room</button><button className="quiet-button" onClick={()=>setMuted(v=>!v)}>{muted?'Turn sound on':'Mute sound'}</button><button className="quiet-button" onClick={restart}>Begin again</button></div>{xrSupported&&<><p className="xr-note">Immersive room viewing is available. Sewing currently uses desktop controls.</p><button className="quiet-button" onClick={async()=>{try{setPaused(false);await enterXR.current?.();}catch(e){setXRMessage(e instanceof Error?e.message:'Immersive viewing could not start.');setPaused(true);}}}>View in headset</button></>}{xrMessage&&<p role="status" className="xr-note">{xrMessage}</p>}</section></DialogContent></Dialog>
  </div>}
 </main>;
}
function Objects({state,enabled,command,onCue,finishStitch,setStitching}:{state:ExperienceState;enabled:boolean;command:(a:Action)=>void;onCue:(c:Cue|null)=>void;finishStitch:(i:number)=>void;setStitching:(v:boolean)=>void}){
 const m=useMaterials();const [cloth,setCloth]=useState<Record<string,[number,number,number]>>({'cloth-blue':[-.78,.88,.35],'cloth-green':[-1.17,.89,.22]});
 const heldCloth=state.held==='cloth-blue'||state.held==='cloth-green';
 function dropCloth(e:any){if(!heldCloth)return;e.stopPropagation();setCloth(c=>({...c,[state.held!]:[THREE.MathUtils.clamp(e.point.x,-1.33,1.33),.895,THREE.MathUtils.clamp(e.point.z,-.66,.66)]}));command({type:'DROP'});}
 return <>
  {heldCloth&&<mesh position={[0,.897,0]} rotation={[-Math.PI/2,0,0]} onClick={dropCloth}><planeGeometry args={[2.9,1.46]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>}
  {Object.entries(cloth).map(([name,pos])=>state.held!==name?<InteractiveObject key={name} position={pos} enabled={enabled&&!state.held} label="pick up" onCue={onCue} onSelect={()=>command({type:'PICK',object:name as 'cloth-blue'|'cloth-green'})}><Box size={[.41,.016,.31]} material={name==='cloth-blue'?m.blue:m.green} rotation={[0,name==='cloth-blue'?.3:-.4,0]}/><Box position={[.03,.016,.04]} size={[.31,.015,.25]} material={name==='cloth-blue'?m.blue:m.green} rotation={[0,.1,0]}/></InteractiveObject>:<CarriedObject key={name} kind="table"><Box size={[.41,.025,.31]} material={name==='cloth-blue'?m.blue:m.green}/></CarriedObject>)}
  {!state.attached&&state.held!=='arm'&&<InteractiveObject position={[-.63,1.028,.03]} enabled={enabled&&!state.held} label="pick up" onCue={onCue} onSelect={()=>command({type:'PICK',object:'arm'})}><Arm loose/>{enabled&&!state.held&&<Html position={[-.05,.22,0]} center zIndexRange={[12,0]}><button className="space-cue" aria-label="Pick up the loose arm" onClick={()=>command({type:'PICK',object:'arm'})}>pick up</button></Html>}</InteractiveObject>}
  {state.held==='arm'&&<CarriedObject kind="table"><Arm loose/></CarriedObject>}
  {state.held==='bear'?<CarriedObject kind="bear"><group scale={.78}><TeddyBear attached stitches={3}/></group></CarriedObject>:<group position={state.atWindow?WINDOW_BEAR:BEAR_BASE} rotation={[0,state.atWindow?.22:0,0]}>
   <InteractiveObject enabled={enabled&&state.stitches===3&&!state.atWindow&&!state.held} label="pick up" onCue={onCue} onSelect={()=>command({type:'PICK',object:'bear'})}><TeddyBear attached={state.attached} stitches={state.stitches} animateStitches={!state.atWindow} paused={!enabled}/></InteractiveObject>
   {enabled&&state.held==='arm'&&<Html position={[-.26,.66,.25]} center zIndexRange={[20,0]}><button className="space-cue" aria-label="Place the arm on the bear" onClick={()=>command({type:'ATTACH'})}>place</button></Html>}
   {state.attached&&<StitchingInteraction index={state.stitches} enabled={enabled&&!state.held&&!state.atWindow} onStitch={finishStitch} onActive={setStitching}/>}
   {enabled&&state.stitches===3&&!state.atWindow&&!state.held&&<Html position={[0,1.15,0]} center zIndexRange={[20,0]}><button className="space-cue" aria-label="Pick up the repaired bear" onClick={()=>command({type:'PICK',object:'bear'})}>pick up</button></Html>}
  </group>}
 </>;
}
