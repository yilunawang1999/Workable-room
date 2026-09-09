import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
export type ThreadPoint=[number,number,number];
/** Physical thread geometry works in both GPU and CPU scene renderers. */
export function Line({points,color,lineWidth=1}:{points:ThreadPoint[];color:string;lineWidth?:number}){
 const geometry=useMemo(()=>{const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');return new THREE.TubeGeometry(path,Math.max(5,points.length*3),lineWidth*.0011,5,false);},[points,lineWidth]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} renderOrder={1}><meshStandardMaterial color={color} roughness={.94}/></mesh>;
}
const STEPS=18,SIDES=5;
function threadGeometry(){
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array((STEPS+1)*(SIDES+1)*3),3).setUsage(THREE.DynamicDrawUsage));
 geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array((STEPS+1)*(SIDES+1)*3),3).setUsage(THREE.DynamicDrawUsage));
 const indices=[];for(let i=0;i<STEPS;i++)for(let j=0;j<SIDES;j++){const a=i*(SIDES+1)+j,b=a+SIDES+1;indices.push(a,b,a+1,b,b+1,a+1);}geometry.setIndex(indices);return geometry;
}
/** Updates existing buffers without frame-loop geometry/vector allocations. */
function shapeThread(g:THREE.BufferGeometry,a:THREE.Vector3,c:THREE.Vector3,b:THREE.Vector3,radius:number){
 const positions=g.attributes.position,normals=g.attributes.normal;
 for(let i=0;i<=STEPS;i++){
  const t=i/STEPS,u=1-t,x=u*u*a.x+2*u*t*c.x+t*t*b.x,y=u*u*a.y+2*u*t*c.y+t*t*b.y,z=u*u*a.z+2*u*t*c.z+t*t*b.z;
  let tx=u*(c.x-a.x)+t*(b.x-c.x),ty=u*(c.y-a.y)+t*(b.y-c.y),tz=u*(c.z-a.z)+t*(b.z-c.z);
  const len=Math.hypot(tx,ty,tz)||1;tx/=len;ty/=len;tz/=len;
  const xy=Math.hypot(tx,ty),nx=xy>1e-5?ty/xy:1,ny=xy>1e-5?-tx/xy:0,bx=-tz*ny,by=tz*nx,bz=tx*ny-ty*nx;
  for(let j=0;j<=SIDES;j++){const angle=j/SIDES*Math.PI*2,co=Math.cos(angle),si=Math.sin(angle),dx=nx*co+bx*si,dy=ny*co+by*si,dz=bz*si,k=i*(SIDES+1)+j;positions.setXYZ(k,x+dx*radius,y+dy*radius,z+dz*radius);normals.setXYZ(k,dx,dy,dz);}
 }
 positions.needsUpdate=true;normals.needsUpdate=true;
}
export function LooseThread({start,end}:{start:ThreadPoint;end:RefObject<THREE.Vector3>}){
 const geometry=useMemo(threadGeometry,[]),a=useMemo(()=>new THREE.Vector3(...start),[start]),control=useMemo(()=>new THREE.Vector3(),[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame(()=>{const b=end.current;control.copy(a).lerp(b,.48);control.y-=Math.min(.085,a.distanceTo(b)*.26);control.z+=.027;shapeThread(geometry,a,control,b,.0023);});
 return <mesh geometry={geometry} renderOrder={2} frustumCulled={false} raycast={()=>{}}><meshStandardMaterial color="#c8bca0" roughness={.94}/></mesh>;
}
export function SewnThread({a,b,index,animate=false,paused=false}:{a:ThreadPoint;b:ThreadPoint;index:number;animate?:boolean;paused?:boolean}){
 const geometry=useMemo(threadGeometry,[]),points=useMemo(()=>[new THREE.Vector3(...a),new THREE.Vector3(...b),new THREE.Vector3()],[a,b]);
 const elapsed=useRef(animate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:2),done=useRef(false);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame((_,dt)=>{if(done.current)return;if(!paused)elapsed.current+=Math.min(dt,.05);const t=Math.min(elapsed.current/1.25,1),ease=1-Math.pow(1-t,3),[start,end,control]=points;control.copy(start).lerp(end,.43+index*.045);control.y+=.014-index*.004-(1-ease)*.063;control.z+=.018+(1-ease)*.082;shapeThread(geometry,start,control,end,.0022+index*.00012);if(t===1)done.current=true;});
 return <mesh geometry={geometry} renderOrder={2} frustumCulled={false} raycast={()=>{}}><meshStandardMaterial color={['#cfc3a7','#c4b89e','#d0c4aa'][index]} roughness={.94}/></mesh>;
}
