import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import {Line} from './Thread';
import * as THREE from 'three';
import {Box,SoftPart,useMaterials} from './materials';
export const WINDOW_BEAR:[number,number,number]=[-1.88,.86,-2.3];
export default function RoomEnvironment({amount,onFloor,onWindow,windowActive,entered}:{amount:number;onFloor:(point:THREE.Vector3)=>void;onWindow:()=>void;windowActive:boolean;entered:boolean}){
 const m=useMaterials();const veil=useRef<THREE.MeshBasicMaterial>(null!),landscape=useRef<THREE.Group>(null!),distanceVeil=useRef<THREE.MeshBasicMaterial>(null!);
 useFrame(({camera},dt)=>{const ease=1-Math.exp(-Math.min(dt,.1)*.3);veil.current.opacity=THREE.MathUtils.lerp(veil.current.opacity,.62-Math.pow(amount,1.4)*.22,ease);distanceVeil.current.opacity=THREE.MathUtils.lerp(distanceVeil.current.opacity,.32-amount*.13,ease);landscape.current.position.x=THREE.MathUtils.clamp((camera.position.x+1.9)*-.012,-.035,.035);});
 return <group>
  <Box position={[0,-.07,1]} size={[7.2,.14,8]} material={m.floor} onClick={(e:any)=>{e.stopPropagation();if(entered)onFloor(e.point);}}/>
  {Array.from({length:19},(_,i)=><Box key={i} position={[-3.6+i*.4,.004,1]} size={[.009,.005,8]} material={m.darkWood} renderOrder={-99}/>)}
  <Box position={[0,1.65,-3]} size={[7.2,3.3,.16]} material={m.wall}/>
  <Box position={[-3.6,1.65,1]} size={[.16,3.3,8]} material={m.wallGreen}/>
  <Box position={[3.6,1.65,1]} size={[.16,3.3,8]} material={m.wall}/>
  <Box position={[0,.12,-2.89]} size={[7.1,.23,.08]} material={m.darkWood}/>
  <Box position={[-3.49,.12,1]} size={[.08,.23,8]} material={m.darkWood}/>
  <Box position={[3.49,.12,1]} size={[.08,.23,8]} material={m.darkWood}/>
  {/* Window recess: deliberately obscured painted landscape behind translucent glazing. */}
  <group position={[-1.9,2.02,-2.895]}>
   <Box size={[2.06,1.91,.12]} material={m.darkWood}/>
   <mesh position={[0,0,.074]}><planeGeometry args={[1.83,1.66]}/><meshBasicMaterial color="#cbd7d2"/></mesh>
   <group ref={landscape} position={[0,0,.08]}>
    <mesh position={[.19,-.45,0]}><planeGeometry args={[1.4,.68]}/><meshBasicMaterial color="#a6b4ac"/></mesh>
    <mesh position={[-.58,-.59,.002]}><planeGeometry args={[.64,.52]}/><meshBasicMaterial color="#819287"/></mesh>
    <mesh position={[0,0,.004]}><planeGeometry args={[1.79,1.62]}/><meshBasicMaterial ref={distanceVeil} color="#d1d9d2" transparent opacity={.32} depthWrite={false}/></mesh>
    <Box position={[.5,-.4,.006]} size={[.023,.74,.005]} material={m.darkWood}/>
    <SoftPart position={[.5,-.05,.008]} scale={[.3,.32,.018]} material={m.green}/>
    <SoftPart position={[.33,-.18,.009]} scale={[.23,.19,.018]} material={m.green}/>
   </group>
   <mesh position={[0,0,.12]}><planeGeometry args={[1.85,1.69]}/><meshBasicMaterial ref={veil} color="#dce1d6" transparent opacity={.62} depthWrite={false}/></mesh>
   <Box position={[0,0,.16]} size={[.065,1.73,.07]} material={m.ivory}/><Box position={[0,-.09,.16]} size={[1.9,.055,.07]} material={m.ivory}/>
   {[-.96,.96].map(x=><Box key={x} position={[x,0,.14]} size={[.12,1.86,.12]} material={m.ivory}/>)}
   {[-.9,.9].map(y=><Box key={y} position={[0,y,.14]} size={[2.05,.11,.13]} material={m.ivory}/>)}
   <Box position={[0,-1,.28]} size={[2.3,.13,.46]} material={m.wood}/>
   <Curtain/>
  </group>
  {/* The worktable stays in place for the whole sequence. */}
  <Box position={[0,.8,0]} size={[3.05,.13,1.6]} material={m.wood} renderOrder={-5}/>
  <Box position={[0,.65,0]} size={[2.8,.22,1.34]} material={m.darkWood}/>
  {[-1.32,1.32].flatMap(x=>[-.61,.61].map(z=><Box key={`${x}-${z}`} position={[x,.35,z]} size={[.12,.72,.13]} material={m.wood}/>))}
  <Box position={[0,.47,-.56]} size={[2.68,.07,.08]} material={m.wood}/>
  <Box position={[.64,.61,.68]} size={[.54,.022,.08]} material={m.darkWood}/>
  <Box position={[.64,.61,.745]} size={[.18,.035,.035]} material={m.darkWood}/>
  {/* Work mat, paper pattern and pencilled contour. */}
  <Box position={[.03,.872,-.12]} size={[1.13,.008,1.03]} material={m.ivory} renderOrder={-4} rotation={[0,-.035,0]}/>
  <Box position={[.99,.878,.38]} size={[.5,.006,.49]} material={m.paper} renderOrder={-4} rotation={[0,-.18,0]}/>
  <Line points={[[.86,.885,.3],[.86,.885,.46],[.94,.885,.53],[1.06,.885,.49],[1.07,.885,.36],[1.01,.885,.28],[.94,.885,.28],[.86,.885,.3]]} color="#a6a090" lineWidth={.6}/>
  <Box position={[1.14,.894,.18]} size={[.009,.008,.43]} material={m.darkWood} rotation={[0,.31,0]}/>
  <Box position={[1.16,.89,.58]} size={[.12,.004,.07]} material={m.paper} rotation={[.08,-.18,.07]}/>
  <Line points={[[.92,.887,.31],[.95,.887,.34],[1,.887,.34]]} color="#8d897c" lineWidth={.45}/>
  {[0,1,2].map(i=><Line key={`pattern-${i}`} points={[[.91+i*.052,.889,.47],[.925+i*.052,.889,.465]]} color="#9e9888" lineWidth={.45}/>)}
  {/* Spools, pin cushion, loose thread and scissors. */}
  {[[-1.12,-.44,.13],[-.83,-.48,.095],[1.15,-.51,.11]].map(([x,z,h],i)=><group key={i} position={[x,.87,z]}><mesh position={[0,h/2,0]} material={i===1?m.blue:m.thread} castShadow><cylinderGeometry args={[.048,.048,h,18]}/></mesh>{[.009,h].map(y=><mesh key={y} position={[0,y,0]} material={m.darkWood} castShadow><cylinderGeometry args={[.059,.059,.015,18]}/></mesh>)}</group>)}
  <SoftPart position={[.88,.92,-.38]} scale={[.14,.056,.12]} material={m.green}/>
  {Array.from({length:5},(_,i)=><group key={i} position={[.81+i*.03,.982,-.38+Math.sin(i)*.03]}><Box size={[.004,.057,.004]} material={m.metal} rotation={[0,0,(i-2)*.12]}/><SoftPart position={[0,.033,0]} scale={[.008,.008,.008]} material={m.ivory}/></group>)}
  <Line points={[[-1.08,.88,-.42],[-1.18,.88,-.29],[-1.32,.88,-.31],[-1.35,.88,-.1],[-1.19,.88,-.05],[-1.09,.88,-.12]]} color="#c6bca2" lineWidth={1}/>
  <group position={[.67,.884,.49]} rotation={[-Math.PI/2,0,.2]}><mesh position={[-.048,0,0]} material={m.dark}><torusGeometry args={[.041,.009,8,20]}/></mesh><mesh position={[.048,0,0]} material={m.dark}><torusGeometry args={[.041,.009,8,20]}/></mesh><Box position={[-.025,.12,0]} size={[.014,.2,.01]} rotation={[0,0,-.22]} material={m.metal}/><Box position={[.025,.12,0]} size={[.014,.2,.01]} rotation={[0,0,.22]} material={m.metal}/></group>
  {/* Chair, worn folded cloth over the back. */}
  <group position={[1.9,0,.85]} rotation={[0,-.3,0]}><Box position={[0,.44,0]} size={[.58,.065,.55]} material={m.wood}/><SoftPart position={[0,.499,.01]} scale={[.25,.043,.225]} material={m.upholstery}/><Line points={[[-.18,.512,.17],[-.1,.53,.213],[.08,.529,.214],[.2,.512,.16]]} color="#b0b4a3" lineWidth={.9}/><Box position={[-.12,.538,.1]} size={[.11,.007,.08]} material={m.patch} rotation={[0,.2,0]}/>{Array.from({length:4},(_,i)=><Line key={`cushion-${i}`} points={[[-.173+i*.023,.545,.13],[-.168+i*.023,.545,.15]]} color="#7e826f" lineWidth={.8}/>)}{[-.23,.23].flatMap(x=>[-.22,.22].map(z=><Box key={`${x},${z}`} position={[x,.23,z]} size={[.055,.46,.055]} material={m.darkWood}/>))}{[-.24,.24].map(x=><Box key={x} position={[x,.74,-.22]} size={[.055,.65,.055]} material={m.darkWood}/>)}<Box position={[0,.95,-.22]} size={[.54,.19,.055]} material={m.wood}/><Box position={[.08,.87,-.17]} size={[.28,.35,.035]} material={m.blue} rotation={[.08,0,.05]}/><Line points={[[-.03,.73,-.138],[.06,.715,-.134],[.19,.73,-.14]]} color="#b9bda9" lineWidth={.8}/></group>
  {/* Low cabinet at the window: destination for the bear. */}
  <Box position={[-1.88,.4,-2.38]} size={[1.92,.8,.69]} material={m.wood}/>
  <Box position={[-1.88,.827,-2.34]} size={[2.02,.055,.78]} material={m.darkWood}/>
  {[-2.34,-1.42].map(x=><group key={x}><Box position={[x,.44,-2.018]} size={[.83,.55,.03]} material={m.wood}/><SoftPart position={[x+.22,.5,-1.99]} scale={[.028,.028,.024]} material={m.darkWood}/></group>)}
  <Box position={[-1.88,.86,-2.3]} size={[.83,.022,.48]} material={m.ivory}/>
  {windowActive&&<group position={[-1.88,1.25,-2.24]}><Html center zIndexRange={[20,0]}><button className="space-cue" aria-label="Place the bear by the window" onClick={onWindow}>place by the window</button></Html></group>}
  {/* Shelves with books, thread box, glass jar and folded cloth. */}
  {[1.6,2.28].map((y,i)=><group key={y} position={[1.63,y,-2.71]}><Box size={[2.2,.055,.36]} material={m.wood}/>{[-.8,.8].map(x=><Box key={x} position={[x,-.12,0]} size={[.038,.24,.22]} material={m.darkWood}/>)}{i===0?<><Box position={[-.68,.073,0]} size={[.64,.095,.26]} material={m.blue}/><Box position={[-.64,.14,0]} size={[.57,.037,.24]} material={m.ivory}/><Box position={[.6,.16,0]} size={[.52,.27,.29]} material={m.green}/><Box position={[.6,.3,0]} size={[.54,.025,.3]} material={m.darkWood}/></>:<>{Array.from({length:5},(_,j)=><Box key={j} position={[-.78+j*.105,.19,0]} size={[.077,.34+j%2*.065,.22]} rotation={[0,0,(j-2)*.028]} material={j%2?m.paper:m.darkWood}/>)}<mesh position={[.5,.16,0]} material={m.ceramic} castShadow><cylinderGeometry args={[.105,.092,.27,20]}/></mesh><Box position={[.49,.39,0]} size={[.011,.43,.013]} rotation={[0,0,-.16]} material={m.darkWood}/></>}</group>)}
  <Line points={[[-2.245,.875,-2.07],[-1.91,.875,-2.055],[-1.5,.875,-2.074]]} color="#9e9f8b" lineWidth={.85}/>
  {Array.from({length:7},(_,i)=><Line key={`hem-${i}`} points={[[-2.23+i*.095,.878,-2.077],[-2.204+i*.095,.878,-2.073]]} color="#b7ae97" lineWidth={.7}/>)}
  <Box position={[.11,2.19,-2.873]} size={[.14,.035,.006]} material={m.patch} rotation={[0,0,-.07]}/>
  {/* Quiet domestic traces. */}
  <group position={[-2.59,.93,-2.36]}><mesh material={m.ceramic} castShadow><cylinderGeometry args={[.083,.068,.16,24]}/></mesh><mesh position={[.1,.025,0]} rotation={[0,Math.PI/2,0]} material={m.ceramic}><torusGeometry args={[.045,.013,8,20]}/></mesh><mesh position={[0,.082,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.07,24]}/><meshStandardMaterial color="#777561" roughness={1}/></mesh></group>
  <group position={[-2.92,.22,-.65]}><mesh material={m.darkWood} castShadow><cylinderGeometry args={[.29,.23,.44,20]}/></mesh><SoftPart position={[.03,.23,0]} scale={[.24,.065,.21]} material={m.ivory}/><SoftPart position={[-.08,.25,.07]} scale={[.17,.07,.14]} material={m.blue}/></group>
  <Box position={[.1,2.34,-2.882]} size={[.28,.39,.008]} material={m.paper} rotation={[0,0,-.05]}/>
  <Box position={[-.18,2.11,-2.88]} size={[.18,.25,.008]} material={m.paper} rotation={[0,0,.08]}/>
 </group>;
}

function Curtain(){
 const m=useMaterials();const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(.38,2.05,12,16),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.sin((x+.19)*49)*.027+.006*Math.sin(y*4));p.setY(i,y+Math.sin(x*22)*.01);}g.computeVertexNormals();return g;},[]);
 return <group position={[-1.16,0,.2]} rotation={[0,.08,-.014]}><mesh geometry={geometry} material={m.ivory} castShadow receiveShadow/><Line points={[[-.145,.94,.03],[-.146,.35,.032],[-.14,-.3,.03],[-.14,-.96,.036]]} color="#b1b1a0" lineWidth={.65}/><Line points={[[-.17,-.965,.027],[-.06,-.975,.03],[.07,-.962,.031],[.18,-.97,.025]]} color="#b8b4a4" lineWidth={.8}/></group>;
}
