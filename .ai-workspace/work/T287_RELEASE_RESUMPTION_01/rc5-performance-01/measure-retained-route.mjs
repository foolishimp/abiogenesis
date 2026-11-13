// Read-only retrospective occupancy discriminator. No Runtime admission or event writes.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const installed='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.4/node_modules/@abiogenesis/typescript-tenant';
const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(installed,'build/code/src/abg/event_body_encoding.js')));
const {canonicalJson}=await import(pathToFileURL(join(installed,'build/code/src/shared/canonical_json.js')));
const path=join(dir,'../rc4-native-recovery-01/runtime-003/resources/events/runtime.events.jsonl');
const expected='93fea1f65a4cc268cfe386e82a4d24eb7894251eba09c488b0b0769a784f5f46';
const stream=createReadStream(path),hash=createHash('sha256');let bytes=0;
stream.on('data',chunk=>{bytes+=chunk.length;hash.update(chunk);});
const lines=createInterface({input:stream,crlfDelay:Infinity}),inline=new Map(),results=new Map(),routes=[];
let eventCount=0,totalRouteBytes=0;
for await(const line of lines){
  const record=JSON.parse(line),decoded=decodeEventBody(record,inline),event=decoded.event;eventCount++;
  if(decoded.physicallyInline){const body=inlineEventBody(event);if(body!==null)inline.set(body.eventRef,body);}
  const p=event.payload;
  if(event.kind==='c_call_result_admitted')results.set(event.runId+'\n'+p.cCallRef,event);
  if(event.kind!=='traversal_route_admitted')continue;
  const rowBytes=Buffer.byteLength(line)+1;totalRouteBytes+=rowBytes;
  const value=p?.boundInput?.value,retained=value?.kind==='retained_graph_input',source=retained?value.source:undefined;
  const result=results.get(event.runId+'\n'+p.cCallRef);
  const eligible=source!==undefined&&result!==undefined&&result.admissionOrdinal<event.admissionOrdinal&&canonicalJson(source)===canonicalJson(result.payload.value);
  routes.push({ordinal:event.admissionOrdinal,eventRef:event.eventId,runId:event.runId,cCallRef:p.cCallRef,rowBytes,retained,
    exactPriorResultEqual:eligible,sourceBytes:source===undefined?0:Buffer.byteLength(canonicalJson(source)),
    boundInputBytes:p.boundInput===undefined?0:Buffer.byteLength(canonicalJson(p.boundInput)),
    sourceResult:result?{eventRef:result.eventId,payloadDigest:result.payloadDigest,ordinal:result.admissionOrdinal,physicallyInline:inline.has(result.eventId)}:null});
}
const actual=hash.digest('hex');assert.equal(actual,expected);assert.equal(bytes,879927317);
const selected=routes.filter(r=>r.exactPriorResultEqual),cut='run://abiogenesis/28df42dd9f8e102009cd97534ed9bc7b2236131ac4477ea0f636711fcc2475e5';
const sum=(rows,k)=>rows.reduce((n,r)=>n+r[k],0);
const result={kind:'retained_route_exact_result_storage_discriminator',recordedUtc:new Date().toISOString(),input:{path,bytes,sha256:actual,eventCount},
  decodeOwner:join(installed,'build/code/src/abg/event_body_encoding.js'),campaignBuilder:'RC3 building RC4',routeRows:routes.length,totalRouteBytes,
  eligibleRows:selected.length,grossEligibleSourceBytes:sum(selected,'sourceBytes'),routeOccupancyPercent:100*totalRouteBytes/bytes,
  selectedCutRun:{runId:cut,routeRows:routes.filter(r=>r.runId===cut).length,eligibleRows:selected.filter(r=>r.runId===cut).length,
    grossEligibleSourceBytes:sum(selected.filter(r=>r.runId===cut),'sourceBytes')},rows:routes,
  limits:['Read-only decode plus exact prior same-Run cCall Result equality; full event-store validation not repeated.',
    'Gross nested source bytes precede codec reference overhead; no realized saving or latency claim.',
    'A referenced Result can require acquisition of an earlier physically inline body; eligibility remains exact Result membership.',
    'Retrospective RC3 campaign, not RC4 native workflow performance.']};
await writeFile(join(dir,'F4_BASELINE_MEASUREMENT.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({...result,rows:undefined}));
