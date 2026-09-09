export type Phase = 'FRAGMENTED' | 'MAKING' | 'REORIENTED';
export type Held = 'arm' | 'bear' | 'cloth-blue' | 'cloth-green' | null;
export interface ExperienceState { phase:Phase; held:Held; attached:boolean; stitches:number; fragment:number; atWindow:boolean; }
export type Action = {type:'PICK';object:Exclude<Held,null>} | {type:'ATTACH'} | {type:'STITCH';index:number} | {type:'PLACE_WINDOW'} | {type:'DROP'} | {type:'RESET'};
export const initialState:ExperienceState = {phase:'FRAGMENTED',held:null,attached:false,stitches:0,fragment:0,atWindow:false};
/** Shared command boundary for mouse, keyboard and XR rays. */
export function progression(s:ExperienceState,a:Action):ExperienceState {
  switch(a.type){
    case 'PICK':
      if(s.held || (a.object==='arm'&&s.attached) || (a.object==='bear'&&(s.stitches!==3||s.atWindow))) return s;
      return {...s,held:a.object,phase:s.phase==='REORIENTED'?s.phase:'MAKING',fragment:a.object==='arm'?1:s.fragment};
    case 'ATTACH':return s.held==='arm'?{...s,held:null,attached:true,fragment:2}:s;
    case 'STITCH':return s.attached&&!s.held&&a.index===s.stitches&&s.stitches<3?{...s,stitches:s.stitches+1,fragment:Math.min(5,s.stitches+3)}:s;
    case 'PLACE_WINDOW':return s.held==='bear'&&s.stitches===3?{...s,held:null,atWindow:true,phase:'REORIENTED',fragment:-1}:s;
    case 'DROP':return {...s,held:null};
    case 'RESET':return initialState;
  }
}
export const richness = (s:ExperienceState) => s.atWindow?1:s.attached?.2+s.stitches*.15:s.phase==='MAKING'?.12:0;
