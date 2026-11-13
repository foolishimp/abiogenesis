// Read-only custody of three actual physical rows, not a standalone admitted history.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),campaign=dirname(dir);
const baseline=JSON.parse(await readFile(join(campaign,'F4_BASELINE_MEASUREMENT.json'),'utf8'));
const selection=baseline.rows.find(r=>r.ordinal===37961);
assert(selection.exactPriorResultEqual);assert.equal(selection.sourceBytes,1461164);
const log=join(campaign,'../rc4-native-recovery-01/runtime-003/resources/events/runtime.events.jsonl');
const hash=b=>createHash('sha256').update(b).digest('hex');
const streamHash=createHash('sha256');let total=0;
for await(const b of createReadStream(log)){streamHash.update(b);total+=b.length;}
assert.equal(total,879927317);
assert.equal(streamHash.digest('hex'),'93fea1f65a4cc268cfe386e82a4d24eb7894251eba09c488b0b0769a784f5f46');
const rows=new Map();let offset=0,sourceRef;
for await(const line of createInterface({input:createReadStream(log),crlfDelay:Infinity})){
 const physical=JSON.parse(line),event=physical.kind==='abg_admitted_body_reference_record'?physical.event:physical;
 const bytes=Buffer.byteLength(line)+1;
 if([37953,37961].includes(event.admissionOrdinal)){
  rows.set(event.admissionOrdinal,{ordinal:event.admissionOrdinal,eventRef:event.eventId,offset,bytes,physicalLineSha256:hash(line+'\n'),physical});
  if(event.admissionOrdinal===37953){assert.equal(physical.kind,'abg_admitted_body_reference_record');sourceRef=physical.bodyReference.sourceEventRef;}
 }
 offset+=bytes;
}
assert.equal(rows.size,2);assert(sourceRef);offset=0;
for await(const line of createInterface({input:createReadStream(log),crlfDelay:Infinity})){
 const physical=JSON.parse(line),event=physical.kind==='abg_admitted_body_reference_record'?physical.event:physical;
 const bytes=Buffer.byteLength(line)+1;
 if(event.eventId===sourceRef){assert.notEqual(physical.kind,'abg_admitted_body_reference_record');rows.set(event.admissionOrdinal,
  {ordinal:event.admissionOrdinal,eventRef:event.eventId,offset,bytes,physicalLineSha256:hash(line+'\n'),physical});break;}
 offset+=bytes;
}
assert.equal(rows.size,3);
const installed='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.4/node_modules/@abiogenesis/typescript-tenant';
const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(installed,'build/code/src/abg/event_body_encoding.js')));
const {sha256Canonical}=await import(pathToFileURL(join(installed,'build/code/src/shared/digests.js')));
const inline=new Map(),logical=new Map();
for(const row of [...rows.values()].sort((a,b)=>a.ordinal-b.ordinal)){
 const d=decodeEventBody(row.physical,inline),e=d.event;assert.equal(sha256Canonical(e.payload),e.payloadDigest);
 logical.set(e.admissionOrdinal,e);if(d.physicallyInline){const body=inlineEventBody(e);if(body)inline.set(body.eventRef,body);}
}
const result=logical.get(37953),route=logical.get(37961);
assert.equal(result.kind,'c_call_result_admitted');assert.equal(route.kind,'traversal_route_admitted');
assert.equal(result.runId,route.runId);assert.equal(result.payload.cCallRef,route.payload.cCallRef);
assert.deepEqual(result.payload.value,route.payload.boundInput.value.source);
const record={kind:'rc5_retained_route_captured_codec_sample',recordedUtc:new Date().toISOString(),
 source:{path:log,bytes:total,sha256:'93fea1f65a4cc268cfe386e82a4d24eb7894251eba09c488b0b0769a784f5f46'},
 routeOrdinal:37961,resultOrdinal:37953,runId:route.runId,resultRef:result.payload.resultRef,
 grossSourceBytes:1461164,rows:[...rows.values()].sort((a,b)=>a.ordinal-b.ordinal),
 limits:['Exact physical rows from the pinned accepted historical stream; original ordinals/stamps unchanged.',
 'Three-row codec sample is not a complete history or independent runtime admission proof.',
 'Old Result is physically referenced. Exact Result membership must remain distinct from its earlier inline body.',
 'Use for representation byte/digest comparison; conjoin actual owner/atomic/cold/installed tests. No whole campaign or latency saving inferred.']};
const bytes=JSON.stringify(record)+'\n';await writeFile(join(dir,'CAPTURED_ROUTE_SAMPLE.json'),bytes,{flag:'wx'});
console.log(JSON.stringify({path:join(dir,'CAPTURED_ROUTE_SAMPLE.json'),bytes:Buffer.byteLength(bytes),sha256:hash(bytes),
 rowOrdinals:record.rows.map(r=>r.ordinal),routeOrdinal:record.routeOrdinal,resultOrdinal:record.resultOrdinal,grossSourceBytes:record.grossSourceBytes}));
