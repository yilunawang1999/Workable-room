import {createContext,useContext,useEffect,useMemo,type ReactNode} from 'react';
import * as THREE from 'three';
function texture(kind:'wood'|'weave'|'plaster'|'paper'){
  const n=128,data=new Uint8Array(n*n*4);let seed=932;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const grain=kind==='wood'?Math.sin(x*.65+Math.sin(y*.055)*1.4)*12+Math.sin(x*.17)*8:kind==='weave'?((x%4===0||y%4===0)?-25:7)+Math.sin(y*.23+x*.08)*4:kind==='paper'?Math.sin(y*.9+x*.05)*3:0;
    const v=210+grain+random()*22;let i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
  }
  const t=new THREE.DataTexture(data,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?3:5,kind==='wood'?1:5);t.needsUpdate=true;t.colorSpace=THREE.SRGBColorSpace;return t;
}
function makeMaterials(){
 const wood=texture('wood'),weave=texture('weave'),plaster=texture('plaster'),paper=texture('paper');
 const fabric=(color:string,roughness=.98)=>new THREE.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.006,roughness});
 return {wood:new THREE.MeshStandardMaterial({color:'#a0815e',map:wood,bumpMap:wood,bumpScale:.01,roughness:.83}),darkWood:new THREE.MeshStandardMaterial({color:'#6d604d',map:wood,roughness:1}),wall:new THREE.MeshStandardMaterial({color:'#e3e0d2',map:plaster,roughness:1}),wallGreen:new THREE.MeshStandardMaterial({color:'#a8b0a0',map:plaster,roughness:1}),floor:new THREE.MeshStandardMaterial({color:'#918778',map:wood,roughness:.98}),bear:fabric('#968169'),bearRepair:fabric('#8d9080',.94),bearSide:fabric('#8d7962'),patch:fabric('#b4ad94'),upholstery:fabric('#7d8c89'),paper:new THREE.MeshStandardMaterial({color:'#d9d4c5',map:paper,bumpMap:paper,bumpScale:.0015,roughness:.88}),blue:fabric('#819798'),green:fabric('#939b80'),ivory:fabric('#dfdacc'),thread:new THREE.MeshStandardMaterial({color:'#d6cbb0',roughness:1}),dark:new THREE.MeshStandardMaterial({color:'#4c4a3e',roughness:.87}),ceramic:new THREE.MeshStandardMaterial({color:'#bfc3b9',roughness:.51}),metal:new THREE.MeshStandardMaterial({color:'#747a71',roughness:.48,metalness:.5})};
}
type Materials=ReturnType<typeof makeMaterials>;
const Context=createContext<Materials>(null!);
export function MaterialsProvider({children}:{children:ReactNode}){const materials=useMemo(()=>{const m=makeMaterials();m.floor.name='floor';m.wall.name='wall';m.wallGreen.name='wall';return m;},[]);useEffect(()=>()=>{const textures=new Set<THREE.Texture>();Object.values(materials).forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());},[materials]);return <Context.Provider value={materials}>{children}</Context.Provider>;}
export const useMaterials=()=>useContext(Context);
export function Box({position=[0,0,0],size=[1,1,1],material,rotation=[0,0,0],...rest}:any){return <mesh position={position} rotation={rotation} material={material} renderOrder={material?.name==='floor'?-100:material?.name==='wall'?-90:0} castShadow receiveShadow {...rest}><boxGeometry args={[...size,...size.map((v:number)=>Math.max(1,Math.ceil(v*3)))] as any}/></mesh>;}
export function SoftPart({position=[0,0,0],scale=[1,1,1],material,rotation=[0,0,0],...rest}:any){
 const geometry=useMemo(()=>{const g=new THREE.SphereGeometry(1,16,12);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const d=1+.014*Math.sin(x*17+y*8)*Math.cos(z*12)+.008*Math.sin(y*11-z*7);const compression=y<-.62?1-(Math.abs(y)-.62)*.07:1;p.setXYZ(i,x*d,y*d*compression,z*d);}g.computeVertexNormals();return g;},[]);
 return <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} material={material} castShadow receiveShadow {...rest}/>;
}
