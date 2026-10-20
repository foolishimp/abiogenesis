import {open,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {decodeEventBody,inlineEventBody} from '/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-composite28-install-l3d6qzfi/node_modules/@abiogenesis/typescript-tenant/build/code/src/abg/event_body_encoding.js';
import {sha256Bytes,sha256Canonical} from '/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-composite28-install-l3d6qzfi/node_modules/@abiogenesis/typescript-tenant/build/code/src/shared/digests.js';
const D=join(import.meta.dirname,'../installed-01'),first=149839258,last=216334690;
const close=JSON.parse(await readFile(join(D,'suffix-01/live-receipt.json'),'utf8')).receipt.resources.eventResource.closeHandoff;
const path=new URL(close.prefix.eventLogRef),handle=await open(path,'r'),stat=await handle.stat();
if(stat.size!==last||stat.ino!==close.prefix.storeIdentity.inode)throw Error('closed subject changed');
const bytes=Buffer.alloc(last-first);await handle.read(bytes,0,bytes.length,first);await handle.close();
const inline=new Map(),counts={},meta=[],results=[],targets=[],unresolved=[];let offset=first;
for(const line of bytes.toString('utf8').split('\n')){if(!line)continue;const physical=JSON.parse(line);let e;
 try{const r=decodeEventBody(physical,inline);e=r.event;if(r.physicallyInline){const b=inlineEventBody(e);if(b)inline.set(e.eventId,b);}}
 catch(error){e=physical.event;unresolved.push({offset,kind:e?.kind,reference:physical.bodyReference});}
 counts[e.kind]=(counts[e.kind]??0)+1;
 if(!/activity|stdout|stderr/.test(e.kind)){
  const p=e.payload??{};const payload={...p};for(const key of ['rawInputValue','value','result','evidence','bytes','body'])if(key in payload)payload[key]={omittedBody:true,digest:sha256Canonical(payload[key])};
  meta.push({offset,byteLength:Buffer.byteLength(line)+1,eventId:e.eventId,kind:e.kind,runId:e.runId,cCallRef:e.cCallRef,payload});
  if(e.kind==='basis_admitted'&&p.rawInputValue!==undefined&&sha256Canonical(p.rawInputValue)==='sha256:b18bc0a6c74426fdf145ca3a9bf4e9275816b2fab8643271468c7c906f19d185')targets.push({offset,event:e});
  if(e.kind==='c_call_result_admitted'&&p.value!==undefined)results.push({offset,event:e});
 }
 offset+=Buffer.byteLength(line)+1;
}
const write=(name,value)=>writeFile(join(import.meta.dirname,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await write('suffix-metadata.json',{scope:'Direct retained suffix inspection, no runtime authentication or caller authority constructed',first,last,suffixDigest:sha256Bytes(bytes),counts,unresolved,events:meta});
await write('design-input.json',{scope:'Exact decoded retained basis input; not a new admission',targets});
await write('result-events.json',{scope:'Exact retained suffix leaf result events; no new proof packets',results});
console.log(JSON.stringify({counts,metadataRows:meta.length,unresolved:unresolved.length,targets:targets.length,results:results.length}));
