import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Html} from '@react-three/drei';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {LooseThread} from './Thread';
import {stitchPoints} from './TeddyBear';
export default function StitchingInteraction({index,onStitch,onActive,enabled}:{index:number;onStitch:(i:number)=>void;onActive:(v:boolean)=>void;enabled:boolean}){
 const [drawing,setDrawing]=useState(false);const start=useRef({time:0,x:0,y:0}),end=useRef<HTMLButtonElement>(null),group=useRef<THREE.Group>(null!),drawingRef=useRef(false),keyboard=useRef(false),tip=useRef(new THREE.Vector3());
 const {camera,gl}=useThree();const [a,b]=useMemo(()=>stitchPoints(Math.min(index,2)),[index]);
 const math=useMemo(()=>({ray:new THREE.Raycaster(),pointer:new THREE.Vector2(),plane:new THREE.Plane(),localPlane:new THREE.Plane(new THREE.Vector3(0,0,1),-.255),hit:new THREE.Vector3()}),[]),rect=useRef<DOMRect|null>(null);
 const cancel=useCallback(()=>{drawingRef.current=false;keyboard.current=false;setDrawing(false);onActive(false);},[onActive]);
 useEffect(()=>{if(!enabled)cancel();},[enabled,cancel]);
 useEffect(()=>{
  const move=(e:PointerEvent)=>{if(!drawingRef.current||keyboard.current||!rect.current)return;const r=rect.current;math.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);};
  const finish=(e:PointerEvent)=>{if(!drawingRef.current||keyboard.current)return;const r=end.current?.getBoundingClientRect(),near=r&&e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-12&&e.clientY<=r.bottom+12,deliberate=performance.now()-start.current.time>=220&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>=8;cancel();if(near&&deliberate&&enabled)onStitch(index);};
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')cancel();};
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel);window.addEventListener('resize',cancel);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);window.removeEventListener('resize',cancel);window.removeEventListener('keydown',key);};
 },[index,onStitch,enabled,cancel,math]);
 useEffect(()=>()=>onActive(false),[onActive]);
 useFrame(()=>{if(!drawingRef.current||keyboard.current||!group.current)return;group.current.updateWorldMatrix(true,false);math.plane.copy(math.localPlane).applyMatrix4(group.current.matrixWorld);math.ray.setFromCamera(math.pointer,camera);if(math.ray.ray.intersectPlane(math.plane,math.hit)){group.current.worldToLocal(math.hit);tip.current.copy(math.hit);}});
 if(index>=3||!enabled)return null;
 return <group ref={group}>
  {drawing&&<LooseThread start={a} end={tip}/>}
  <Html position={a} zIndexRange={[30,0]}><button className={'seam-point'+(drawing?' active':'')} aria-label={`Start stitch ${index+1}`} title="stitch" onPointerDown={e=>{e.stopPropagation();if(e.button!==0)return;rect.current=gl.domElement.getBoundingClientRect();const r=rect.current;math.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);start.current={time:performance.now(),x:e.clientX,y:e.clientY};tip.current.set(...a);keyboard.current=false;drawingRef.current=true;setDrawing(true);onActive(true);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tip.current.set(...b);keyboard.current=true;drawingRef.current=true;setDrawing(true);onActive(true);end.current?.focus();}}}/></Html>
  <Html position={b} zIndexRange={[30,0]}><button ref={end} className="seam-point seam-end" aria-label={`Finish stitch ${index+1}`} title="draw the thread here" onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&drawingRef.current){e.preventDefault();cancel();onStitch(index);}}}/></Html>
 </group>;
}
