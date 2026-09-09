import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Line,SewnThread} from './Thread';
import {Box,SoftPart,useMaterials} from './materials';
export const BEAR_BASE:[number,number,number]=[0,.89,-.12];
export const stitchPoints=(i:number):[[number,number,number],[number,number,number]]=>[[-.322+i*.002,.574-i*.076,.175+i*.002],[-.205-i*.001,.56-i*.076+(i===1?.004:0),.232]];
export function Arm({loose=false,repaired=true}:{loose?:boolean;repaired?:boolean}){const m=useMaterials();return <group rotation={loose?[0,0,1.13]:[0,0,-.24]}><SoftPart scale={repaired?[.137,.265,.132]:[.135,.273,.137]} material={repaired?m.bearRepair:m.bear}/><SoftPart position={[0,-.175,.063]} scale={[.088,.085,.071]} material={m.patch}/><Line points={[[0,-.235,.113],[.006,-.05,.133],[0,.19,.104]]} color="#76644f" lineWidth={.8}/></group>;}
export default function TeddyBear({attached,stitches,animateStitches=false,paused=false}:{attached:boolean;stitches:number;animateStitches?:boolean;paused?:boolean}){
 const m=useMaterials();const shoulder=useRef<THREE.Group>(null!),previous=useRef(stitches),pulling=useRef(2);const reduced=useMemo(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
 useEffect(()=>{if(stitches>previous.current&&animateStitches&&!reduced)pulling.current=0;previous.current=stitches;},[stitches,animateStitches,reduced]);
 useFrame((_,dt)=>{if(!shoulder.current)return;if(!paused)pulling.current+=Math.min(dt,.05);const t=Math.min(pulling.current/1.25,1),pull=Math.sin(Math.PI*t)*Math.exp(-t*1.4);shoulder.current.scale.set(1-pull*.026,1+pull*.012,1-pull*.015);shoulder.current.position.x=-.337+pull*.005;shoulder.current.rotation.z=pull*.018;});
 return <group>
 <SoftPart position={[0,.42,0]} scale={[.271,.349,.208]} material={m.bear} rotation={[0,0,-.035]}/>
 <SoftPart position={[.019,.844,-.02]} scale={[.238,.224,.21]} material={m.bear} rotation={[0,0,.045]}/>
 <SoftPart position={[-.175,1.001,-.03]} scale={[.103,.121,.071]} material={m.bear} rotation={[0,0,.2]}/><SoftPart position={[.199,1.005,-.03]} scale={[.106,.116,.075]} material={m.bear} rotation={[0,0,-.18]}/>
 <SoftPart position={[-.175,1.007,.023]} scale={[.068,.079,.024]} material={m.patch}/><SoftPart position={[.198,1.01,.026]} scale={[.066,.074,.024]} material={m.patch}/>
 <SoftPart position={[.02,.788,.161]} scale={[.12,.086,.061]} material={m.patch}/>
 <SoftPart position={[.019,.822,.22]} scale={[.035,.021,.018]} material={m.dark}/>
 <Line points={[[.019,.811,.236],[.019,.771,.224]]} color="#585347" lineWidth={1}/>
 {[-.073,.116].map((x,i)=><group key={x} position={[x,.869+i*.005,.18]}><mesh rotation={[Math.PI/2,0,0]} material={m.dark}><cylinderGeometry args={[.017,.019,.009,14]}/></mesh><Line points={[[-.005,0,.007],[.005,0,.008]]} color="#b2a085" lineWidth={.5}/></group>)}
 <SoftPart position={[-.182,.127,.105]} scale={[.145,.169,.217]} material={m.bear} rotation={[-.18,0,.16]}/><SoftPart position={[.18,.124,.102]} scale={[.139,.164,.225]} material={m.bearSide} rotation={[-.18,0,-.18]}/>
 {[-.184,.184].map(x=><SoftPart key={x} position={[x,.123,.283]} scale={[.102,.115,.038]} material={m.patch}/>)}
 <group position={[.338,.438,0]} rotation={[0,0,.29]}><Arm repaired={false}/></group>
 {attached?<group ref={shoulder} position={[-.337,.438,.005]}><Arm/></group>:<SoftPart position={[-.233,.555,.022]} scale={[.047,.101,.08]} material={m.dark}/>}
 <SoftPart position={[.025,.436,.18]} scale={[.17,.214,.036]} material={m.patch}/>
 <Line points={[[.021,.638,.206],[.015,.52,.224],[.01,.35,.221],[.005,.237,.183]]} color="#8b7d63" lineWidth={.75}/>
 {Array.from({length:9},(_,i)=><Line key={i} points={[[-.14,.46+Math.sin(i/8*Math.PI-.5)*.18,.208],[-.127,.453+Math.sin(i/8*Math.PI-.5)*.18,.214]]} color="#b7ac90" lineWidth={.8}/>)}
 <Line points={[[-.183,.912,.12],[-.121,.975,.163],[-.025,1.043,.085]]} color="#716451" lineWidth={.65}/>
 <SoftPart position={[.139,.294,.207]} scale={[.046,.065,.01]} rotation={[0,0,-.29]} material={m.bearSide}/>
 {Array.from({length:4},(_,i)=><Line key={`old-${i}`} points={[[.113+i*.01,.306-i*.016,.218],[.13+i*.01,.31-i*.016,.214]]} color="#716b59" lineWidth={.9}/>)}
 {Array.from({length:11},(_,i)=>{const t=i/11*Math.PI*2;return <Line key={`edge-${i}`} points={[[.025+Math.sin(t)*.164,.436+Math.cos(t)*.205,.2],[.025+Math.sin(t)*.151,.436+Math.cos(t)*.19,.212]]} color="#8d8068" lineWidth={.65}/>;})}
 {Array.from({length:stitches},(_,i)=>{const [a,b]=stitchPoints(i);return <SewnThread key={i} a={a} b={b} index={i} animate={animateStitches&&i===stitches-1} paused={paused}/>;})}
 </group>;
}
