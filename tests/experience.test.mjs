import test from 'node:test';
import assert from 'node:assert/strict';
import {progression,initialState} from '../components/experience/progression.ts';
test('a bear can only move to the window after attachment and three ordered stitches',()=>{
 let s=initialState;
 assert.equal(progression(s,{type:'PICK',object:'bear'}),s);
 assert.equal(progression(s,{type:'ATTACH'}),s);
 assert.equal(progression(s,{type:'STITCH',index:0}),s);
 s=progression(s,{type:'PICK',object:'arm'});assert.equal(s.phase,'MAKING');
 assert.equal(progression(s,{type:'PICK',object:'cloth-blue'}),s);
 s=progression(s,{type:'ATTACH'});assert.equal(s.attached,true);assert.equal(s.held,null);
 assert.equal(progression(s,{type:'STITCH',index:2}),s);
 for(let i=0;i<3;i++)s=progression(s,{type:'STITCH',index:i});
 assert.equal(s.stitches,3);assert.equal(s.phase,'MAKING');
 assert.equal(progression(s,{type:'PLACE_WINDOW'}),s);
 s=progression(s,{type:'PICK',object:'bear'});s=progression(s,{type:'PLACE_WINDOW'});
 assert.equal(s.phase,'REORIENTED');assert.equal(s.atWindow,true);assert.equal(s.held,null);
 assert.equal(progression(s,{type:'PICK',object:'bear'}),s);
 assert.deepEqual(progression(s,{type:'RESET'}),initialState);
});
test('putting a piece down preserves completed work and permits picking it up again',()=>{
 let s=progression(initialState,{type:'PICK',object:'arm'});
 s=progression(s,{type:'DROP'});assert.equal(s.held,null);
 s=progression(s,{type:'PICK',object:'arm'});s=progression(s,{type:'ATTACH'});s=progression(s,{type:'STITCH',index:0});
 s=progression(s,{type:'PICK',object:'cloth-green'});s=progression(s,{type:'DROP'});
 assert.equal(s.stitches,1);assert.equal(s.attached,true);
 assert.equal(progression(s,{type:'STITCH',index:0}),s);
});
