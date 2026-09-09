import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useMaterials} from './materials';
/** Availability changes through depth, local light and material response, without a colour-temperature arc. */
export default function EnvironmentTransition({amount}:{amount:number}){
 const key=useRef<THREE.DirectionalLight>(null!),fill=useRef<THREE.HemisphereLight>(null!),shelf=useRef<THREE.DirectionalLight>(null!),current=useRef(0),m=useMaterials();
 const woodStart=useMemo(()=>new THREE.Color('#8a8070'),[]),woodEnd=useMemo(()=>new THREE.Color('#796e5b'),[]);
 useFrame(({scene},dt)=>{
  current.current=THREE.MathUtils.lerp(current.current,amount,1-Math.exp(-Math.min(dt,.1)*.32));const t=current.current;
  key.current.intensity=1.95+t*.07;fill.current.intensity=1.22-t*.12;shelf.current.intensity=.14+Math.pow(t,1.5)*.13;key.current.shadow.radius=5-t*1.3;
  if(scene.fog instanceof THREE.Fog){scene.fog.near=6.2+t*2.7;scene.fog.far=13.8+t*3.4;}
  m.darkWood.color.copy(woodStart).lerp(woodEnd,t*.72);m.wood.bumpScale=.008+t*.006;m.wood.roughness=.85-t*.035;m.bear.bumpScale=.005+t*.004;m.bearRepair.bumpScale=.005+t*.005;m.ivory.bumpScale=.004+t*.003;
 });
 return <><hemisphereLight ref={fill} args={['#e4e9e7','#a29d90',1.22]}/><directionalLight ref={key} position={[-3,5.5,1]} intensity={1.95} color="#e7edea" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-normalBias={.025} shadow-bias={-.0002} shadow-radius={5}/><directionalLight ref={shelf} position={[1,2.8,1]} color="#d6e0dc" intensity={.14}/><ambientLight intensity={.12}/></>;
}
