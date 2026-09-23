import test from 'node:test';
import assert from 'node:assert/strict';
import * as v from 'valibot';
import {jsonValueSchema} from '../../build/code/src/shared/public_function_contracts.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';

test('one recursive JSON schema definition preserves old values and refusal issue paths without per-node construction',async t=>{
 let oldBuilds=0;
 const old=v.lazy(()=>{oldBuilds++;return v.union([v.null(),v.boolean(),v.pipe(v.number(),v.finite()),v.string(),v.array(old),v.record(v.string(),old)]);});
 let constructions=0;
 const owner=await privateOwner('shared/public_function_contracts.js',[],{valibot:{union:(...args)=>{constructions++;return v.union(...args);}}});
 const afterLoad=constructions;
 const good={body:Array.from({length:400},(_,i)=>({i,rows:[null,true,false,1.5,'x'.repeat(80),{nested:['y']}]}))};
 const samples=[good,null,[],{},NaN,Infinity,undefined,{bad:undefined},{nested:[1,Infinity]},()=>1,1n];
 const project=r=>({success:r.success,issues:r.issues?.map(x=>({type:x.type,message:x.message,path:x.path?.map(p=>p.key)}))});
 for(const sample of samples){assert.deepEqual(project(v.safeParse(jsonValueSchema,sample)),project(v.safeParse(old,sample)));
  assert.deepEqual(project(v.safeParse(owner.jsonValueSchema,sample)),project(v.safeParse(old,sample)));}
 assert.equal(constructions,afterLoad);assert(oldBuilds>1000);
 t.diagnostic(JSON.stringify({oldPerValueDefinitionBuilds:oldBuilds,newDuringValidation:constructions-afterLoad,loadedUnionDefinitions:afterLoad,
  limit:'Schema and validation semantics only; no installed latency or peak-live-retention claim.'}));
});
