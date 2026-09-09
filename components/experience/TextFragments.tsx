import {useEffect,useState} from 'react';
import {Html} from '@react-three/drei';
import {fragments} from '@/data/fragments';
/** Temporary annotation beside the handled cloth or paper. */
export default function TextFragments({index,entered,reoriented}:{index:number;entered:boolean;reoriented:boolean}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{setVisible(false);if(!entered||reoriented)return;const show=setTimeout(()=>setVisible(true),index===0?6000:950),hide=setTimeout(()=>setVisible(false),index===0?14000:8950);return()=>{clearTimeout(show);clearTimeout(hide);};},[index,entered,reoriented]);
 if(!entered||reoriented||!visible||!fragments[index])return null;
 return <Html position={index===1?[-.95,1.12,.3]:[.96,.96,.43]} center zIndexRange={[5,0]} style={{pointerEvents:'none'}}><span className="material-fragment" key={index} aria-live="polite">{fragments[index].text}</span></Html>;
}
