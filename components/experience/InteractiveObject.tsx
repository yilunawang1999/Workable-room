import {useMemo,useRef,type ReactNode} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import * as THREE from 'three';
export interface Cue {text:string;x:number;y:number}
export function InteractiveObject({children,enabled,label,onSelect,onCue,...rest}:{children:ReactNode;enabled:boolean;label:string;onSelect:()=>void;onCue:(cue:Cue|null)=>void;[key:string]:any}){
 function hover(e:ThreeEvent<PointerEvent>){if(!enabled)return;e.stopPropagation();onCue({text:label,x:e.nativeEvent.clientX,y:e.nativeEvent.clientY-15});document.body.style.cursor='pointer';}
 return <group {...rest} onPointerOver={hover} onPointerMove={hover} onPointerOut={()=>{onCue(null);document.body.style.cursor='auto';}} onClick={(e)=>{if(!enabled)return;e.stopPropagation();onCue(null);document.body.style.cursor='auto';onSelect();}}>{children}</group>;
}
export function CarriedObject({children,kind}:{children:ReactNode;kind:'table'|'bear'}){
 const ref=useRef<THREE.Group>(null!);const {plane,intersection,target}=useMemo(()=>({plane:new THREE.Plane(new THREE.Vector3(0,1,0),-1.08),intersection:new THREE.Vector3(),target:new THREE.Vector3()}),[]);const initial=useRef(true);
 useFrame(({camera,raycaster,pointer},dt)=>{
  if(kind==='bear'){camera.getWorldDirection(target).multiplyScalar(1.05).add(camera.position);target.y-=.72;}
  else{raycaster.setFromCamera(pointer,camera);if(!raycaster.ray.intersectPlane(plane,intersection))return;target.set(THREE.MathUtils.clamp(intersection.x,-1.36,1.36),1.03,THREE.MathUtils.clamp(intersection.z,-.66,.66));}
  if(initial.current){ref.current.position.copy(target);initial.current=false;}else ref.current.position.lerp(target,1-Math.exp(-dt*6));
  if(kind==='bear')ref.current.rotation.y=camera.rotation.y;
 });return <group ref={ref}>{children}</group>;
}
