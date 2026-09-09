import * as THREE from 'three';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
/** Shared-scene CPU fallback. Geometry and hit testing stay in Three.js. */
export function createRoomRenderer(props:any):THREE.WebGLRenderer{
 const canvas=props.canvas as HTMLCanvasElement;
 const context=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
 if(context)return new THREE.WebGLRenderer({...props,context,antialias:true,alpha:false});
 const svg=new SVGRenderer();svg.setQuality('low');svg.setPrecision(2);svg.sortElements=false;
 svg.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
 canvas.parentElement?.insertBefore(svg.domElement,canvas);canvas.style.position='relative';
 let pixelRatio=1,width=1,height=1,previous=0;
 const events=new THREE.EventDispatcher();
 const renderer={
  domElement:canvas,isWebGLRenderer:false,autoClear:true,outputColorSpace:THREE.SRGBColorSpace,toneMapping:THREE.NoToneMapping,toneMappingExposure:1,
  shadowMap:{enabled:false,type:THREE.PCFSoftShadowMap},
  xr:{enabled:false,isPresenting:false,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),setAnimationLoop:()=>{},getSession:()=>null,setReferenceSpaceType:()=>{},setSession:async()=>{throw new Error('Immersive viewing needs WebGL.');}},
  setPixelRatio:(v:number)=>{pixelRatio=v;},getPixelRatio:()=>pixelRatio,
  setSize:(w:number,h:number)=>{width=w;height=h;canvas.width=w;canvas.height=h;svg.setSize(w,h);},getSize:(v:THREE.Vector2)=>v.set(width,height),
  setClearColor:(v:THREE.ColorRepresentation)=>svg.setClearColor(new THREE.Color(v),1),
  render:(scene:THREE.Scene,camera:THREE.Camera)=>{const now=performance.now();if(now-previous<75)return;previous=now;svg.render(scene,camera);},
  renderLists:{dispose:()=>{}},forceContextLoss:()=>{},dispose:()=>svg.domElement.remove(),
 };
 return renderer as unknown as THREE.WebGLRenderer;
}
