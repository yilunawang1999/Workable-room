import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
export type ViewRequest={id:number;position:[number,number,number];target:[number,number,number]};
export const VIEWS={room:{position:[2.3,2.25,3.5] as [number,number,number],target:[0,1.18,-.35] as [number,number,number]},work:{position:[0,1.7,1.62] as [number,number,number],target:[-.08,1.35,0] as [number,number,number]},window:{position:[-.48,1.85,-.28] as [number,number,number],target:[-1.88,1.31,-2.3] as [number,number,number]}};
export default function Player({enabled,request}:{enabled:boolean;request:ViewRequest}){
 const {camera,gl}=useThree();const keys=useRef(new Set<string>());const tween=useRef(true);const goal=useRef(new THREE.Vector3(...request.position));const targetQ=useRef(new THREE.Quaternion());const lookDrag=useRef(false);const euler=useRef(new THREE.Euler(0,0,0,'YXZ'));
 useEffect(()=>{goal.current.set(...request.position);const temp=camera.clone();temp.position.copy(goal.current);temp.lookAt(new THREE.Vector3(...request.target));targetQ.current.copy(temp.quaternion);tween.current=true;if(!('isWebGLRenderer' in gl && gl.isWebGLRenderer)||window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(goal.current);camera.quaternion.copy(targetQ.current);tween.current=false;}},[request,camera,gl]);
 useEffect(()=>{
  const canvas=gl.domElement;
  const down=(e:KeyboardEvent)=>{if(!enabled||e.target instanceof HTMLButtonElement)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.current.add(e.code);tween.current=false;}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.code);
  const pd=(e:PointerEvent)=>{if(enabled&&e.button===2){lookDrag.current=true;tween.current=false;canvas.setPointerCapture(e.pointerId);}};
  const pm=(e:PointerEvent)=>{if(!lookDrag.current||!enabled||gl.xr.isPresenting)return;euler.current.setFromQuaternion(camera.quaternion);euler.current.y-=e.movementX*.003;euler.current.x=THREE.MathUtils.clamp(euler.current.x-e.movementY*.003,-1.1,.7);camera.quaternion.setFromEuler(euler.current);};
  const pu=()=>{lookDrag.current=false;};const blur=()=>{keys.current.clear();lookDrag.current=false;};
  const wheel=(e:WheelEvent)=>{if(!enabled||gl.xr.isPresenting)return;e.preventDefault();tween.current=false;const d=camera.getWorldDirection(new THREE.Vector3());d.y=0;d.normalize().multiplyScalar(-e.deltaY*.002);move(d);};
  function move(d:THREE.Vector3){const p=camera.position.clone().add(d);p.x=THREE.MathUtils.clamp(p.x,-3.2,3.2);p.z=THREE.MathUtils.clamp(p.z,-2.1,4.8);if(!(Math.abs(p.x)<1.77&&p.z>-.99&&p.z<1.05)){camera.position.copy(p);} }
  const touch=(e:Event)=>{const code=(e as CustomEvent).detail;const forward=camera.getWorldDirection(new THREE.Vector3());forward.y=0;forward.normalize();move(forward.multiplyScalar(code==='forward'?.3:-.3));tween.current=false;};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);window.addEventListener('room-step',touch);canvas.addEventListener('pointerdown',pd);canvas.addEventListener('pointermove',pm);window.addEventListener('pointerup',pu);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('contextmenu',context);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);window.removeEventListener('room-step',touch);canvas.removeEventListener('pointerdown',pd);canvas.removeEventListener('pointermove',pm);window.removeEventListener('pointerup',pu);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('contextmenu',context);};
 },[enabled,camera,gl]);
 useEffect(()=>{if(!enabled)keys.current.clear();},[enabled]);
 useFrame((_,dt)=>{
  if(gl.xr.isPresenting)return;
  if(tween.current){const t=1-Math.exp(-Math.min(dt,.05)*3);camera.position.lerp(goal.current,t);camera.quaternion.slerp(targetQ.current,t);if(camera.position.distanceTo(goal.current)<.004)tween.current=false;}
  if(!enabled||keys.current.size===0)return;
  const f=camera.getWorldDirection(new THREE.Vector3());f.y=0;f.normalize();const right=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0));const d=new THREE.Vector3();
  if(keys.current.has('KeyW')||keys.current.has('ArrowUp'))d.add(f);if(keys.current.has('KeyS')||keys.current.has('ArrowDown'))d.sub(f);if(keys.current.has('KeyD')||keys.current.has('ArrowRight'))d.add(right);if(keys.current.has('KeyA')||keys.current.has('ArrowLeft'))d.sub(right);
  d.normalize().multiplyScalar(Math.min(dt,.05)*1.1);const p=camera.position.clone().add(d);p.x=THREE.MathUtils.clamp(p.x,-3.2,3.2);p.z=THREE.MathUtils.clamp(p.z,-2.1,4.8);if(!(Math.abs(p.x)<1.77&&p.z>-.99&&p.z<1.05))camera.position.copy(p);
 });return null;
}
function context(e:Event){e.preventDefault();}
