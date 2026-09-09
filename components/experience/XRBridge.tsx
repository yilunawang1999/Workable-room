import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
/** Session boundary only: controller command adapters can dispatch to progression.ts. */
export default function XRBridge({onReady,onSession}:{onReady:(enter:()=>Promise<void>)=>void;onSession:(active:boolean)=>void}){
 const {gl,camera}=useThree();
 useEffect(()=>{
  gl.xr.enabled=true;
  const enter=async()=>{if(!navigator.xr)throw new Error('Immersive viewing is unavailable in this browser.');const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});gl.xr.setReferenceSpaceType('local-floor');await gl.xr.setSession(session);};
  const start=()=>onSession(true);const end=()=>onSession(false);gl.xr.addEventListener('sessionstart',start);gl.xr.addEventListener('sessionend',end);onReady(enter);
  return()=>{gl.xr.removeEventListener('sessionstart',start);gl.xr.removeEventListener('sessionend',end);};
 },[gl,camera,onReady,onSession]);return null;
}
