import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
const glc='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-05';
const core=glc+'/products/core47/node_modules/@abiogenesis/typescript-tenant';
const pkg=JSON.parse(await fs.readFile(core+'/package.json','utf8'));
const product=await import(core+'/'+pkg.exports['./product'].import);
const {decodeEventBody,inlineEventBody}=await import(core+'/build/code/src/abg/event_body_encoding.js');
const here=new URL('./',import.meta.url),bounds=JSON.parse(await fs.readFile(glc+'/execution/diagnostic-boundaries.json','utf8'));
const receiptBytes=await fs.readFile(glc+'/execution/graphExecution.json'),receiptText=receiptBytes.toString('utf8');
const start=1122208468,end=1169924627,hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(bounds.entry.prefixLength,start);assert.equal(bounds.close.prefixLength,end);
assert(receiptText.includes(bounds.close.coordinateDigest));
const fd=await fs.open(new URL(bounds.close.eventLogRef),'r'),before=await fd.stat(),bytes=Buffer.alloc(end-start),t=performance.now();
let read=0;while(read<bytes.length){const result=await fd.read(bytes,read,bytes.length-read,start+read);assert(result.bytesRead>0);read+=result.bytesRead;}
const readMs=performance.now()-t,after=await fd.stat();await fd.close();
assert.equal(bytes.at(-1),10);
const inline=new Map(),events=[],unresolved=[];let position=start;
for(const line of bytes.toString('utf8').split('\n').slice(0,-1)) {
  const raw=JSON.parse(line),begin=position;position+=Buffer.byteLength(line)+1;
  try {
    const decoded=decodeEventBody(raw,inline),event=decoded.event;
    if(decoded.physicallyInline){const body=inlineEventBody(event);if(body)inline.set(event.eventId,body);}
    events.push({event,begin,end:position,physicalRowSha256:hash(Buffer.from(line+'\n'))});
  } catch(error) {unresolved.push({eventId:raw.event?.eventId,kind:raw.event?.kind,begin,end:position,reason:error.message});}
}
const native='c-call:sha256:664e6adc49a9662af635da294e6cca86d65b7f82009aaac627b2aba2a4300a67';
const prepare='c-call:sha256:4ce7adaf7ac98c9648dbba555cbe2ab827b3860ba6f943e93e230bfebe13a96a';
const one=rows=>{assert.equal(rows.length,1);return rows[0];};
const opened=one(events.filter(r=>r.event.kind==='c_call_opened'&&r.event.aggregateId===native));
const basis=one(events.filter(r=>r.event.kind==='basis_admitted'&&r.event.aggregateId===opened.event.basisId));
const result=one(events.filter(r=>r.event.kind==='c_call_result_admitted'&&r.event.aggregateId===prepare));
const task=result.event.payload.value,taskDigest=product.sha256Canonical(task);
assert.equal(taskDigest,result.event.payload.valueDigest);assert.equal(taskDigest,basis.event.payload.rawInputDigest);
assert.deepEqual(task,basis.event.payload.rawInputValue);assert(product.isNativeWorkspaceWorkTask(task));
const relevant=events.filter(r=>r.event.aggregateId===native||r.event.aggregateId===prepare||r===basis||
  /instruction|environment|implementation_set/.test(r.event.kind));
const metadata=relevant.map(({event,begin,end,physicalRowSha256})=>{
  const {rawInputValue,value,...payload}=event.payload??{};
  return {...event,payload,begin,end,physicalRowSha256,payloadDigestMatches:product.sha256Canonical(event.payload)===event.payloadDigest,
    ...(rawInputValue===undefined?{}:{rawInputValueDigest:product.sha256Canonical(rawInputValue)}),
    ...(value===undefined?{}:{valueDigest:product.sha256Canonical(value)}),
    retainedBoundaryMatch:bounds.rows.some(row=>row.eventId===event.eventId&&row.aggregateId===event.aggregateId&&row.basisId===event.basisId)};
});
await fs.writeFile(new URL('selected-task.json',here),JSON.stringify(task)+'\n');
await fs.writeFile(new URL('selected-events.json',here),JSON.stringify(metadata,null,2)+'\n');
const summary={status:'bounded_raw_suffix_diagnostic_not_owner_projection',range:{start,end,bytes:bytes.length,sha256:hash(bytes)},readMs,
  receiptSha256:hash(receiptBytes),receiptCloseCoordinateMatches:true,runRef:opened.event.runId,
  openedEventRef:opened.event.eventId,basisEventRef:basis.event.eventId,preparedResultEventRef:result.event.eventId,
  nativeCCallRef:native,preparationCCallRef:prepare,taskDigest,taskBytes:Buffer.byteLength(product.canonicalJson(task)),
  taskValid:true,taskInputAndAdmittedResultDigestEqual:true,responseContract:task.assessment.resultContract,
  physicalRows:events.length+unresolved.length,unresolved,assemblyEvents:events.filter(r=>/instruction|actor_invocation|actor_process/.test(r.event.kind)).map(r=>({kind:r.event.kind,eventId:r.event.eventId})),
  unchangedFile:{bytes:before.size===after.size,mtime:before.mtimeMs===after.mtimeMs,inode:before.ino===after.ino},
  limits:'Read precisely one authorized suffix interval; pure installed body codec checks resolvable local body references. No full prefix/stamp/replay acquisition or native owner authentication. Original receipt and Root boundary event coordinates are corroborating retained data.'};
await fs.writeFile(new URL('suffix-result.json',here),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
