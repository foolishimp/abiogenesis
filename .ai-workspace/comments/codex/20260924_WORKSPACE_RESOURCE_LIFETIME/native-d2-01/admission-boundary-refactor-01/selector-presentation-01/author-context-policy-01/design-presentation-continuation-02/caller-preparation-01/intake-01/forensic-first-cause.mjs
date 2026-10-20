import {open,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {decodeEventBody,inlineEventBody} from '/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-composite30-install-gb08bzfk/node_modules/@abiogenesis/typescript-tenant/build/code/src/abg/event_body_encoding.js';
import {sha256Bytes,sha256Canonical} from '/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-composite30-install-gb08bzfk/node_modules/@abiogenesis/typescript-tenant/build/code/src/shared/digests.js';
const started=performance.now(),D=import.meta.dirname,first=218675806,last=223704751;
const close=JSON.parse(await readFile(join(D,'live-receipt.json'),'utf8')).receipt.resources.eventResource.closeHandoff;
const h=await open(new URL(close.prefix.eventLogRef),'r'),stat=await h.stat();
if(stat.size!==last||stat.ino!==close.prefix.storeIdentity.inode)throw Error('closed subject changed');
const bytes=Buffer.alloc(last-first);const acquired=await h.read(bytes,0,bytes.length,first);await h.close();if(acquired.bytesRead!==bytes.length)throw Error('short suffix read');
const inline=new Map(),counts={},events=[],diagnostics=[],unresolved=[];let offset=first;
for(const line of bytes.toString('utf8').split('\n')){if(!line)continue;const physical=JSON.parse(line);let e;
 try{const decoded=decodeEventBody(physical,inline);e=decoded.event;if(decoded.physicallyInline){const b=inlineEventBody(e);if(b)inline.set(e.eventId,b);}}
 catch(error){e=physical.event;unresolved.push({offset,kind:e?.kind,eventId:e?.eventId,reference:physical.bodyReference,error:error.message});}
 counts[e.kind]=(counts[e.kind]??0)+1;
 if(!/activity|stdout|stderr/.test(e.kind)){
  const payload={...(e.payload??{})};for(const k of Object.keys(payload)){const v=JSON.stringify(payload[k]);if(v.length>4000)payload[k]={retainedValueOmittedFromMetadata:true,byteCount:Buffer.byteLength(v),digest:sha256Canonical(payload[k]),keys:typeof payload[k]==='object'&&payload[k]!==null?Object.keys(payload[k]):undefined};}
  events.push({offset,byteLength:Buffer.byteLength(line)+1,eventId:e.eventId,kind:e.kind,runId:e.runId,cCallRef:e.cCallRef,payload});
  if(/fail|refus|stop|judgment|result_admitted|evidenced/.test(e.kind))diagnostics.push({offset,event:e});
 }
 offset+=Buffer.byteLength(line)+1;
}
const save=(name,value)=>writeFile(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await save('forensic-suffix.json',{scope:'Read-only retained suffix decoded through installed core30 storage codec; no complete runtime authentication, authority or new admission',first,last,suffixDigest:sha256Bytes(bytes),counts,unresolved,events});
await save('forensic-diagnostic-events.json',{scope:'Exact decoded finite suffix diagnostics/results/evidence/J; forensic observation only',diagnostics});
await save('forensic-timing.json',{elapsedMs:performance.now()-started,readBytes:bytes.length,metadataRows:events.length,diagnosticRows:diagnostics.length,unresolved:unresolved.length,resourceUnchanged:true});
console.log(JSON.stringify({counts,metadataRows:events.length,diagnosticRows:diagnostics.length,unresolved}));
