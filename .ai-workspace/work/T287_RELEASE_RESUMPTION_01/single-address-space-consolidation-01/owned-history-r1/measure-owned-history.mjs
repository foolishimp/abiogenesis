// Root diagnostic Writer: read-only owner acquisition and equivalent projections.
// No Product edits, append ownership, native actor, provider, tests or new Run.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {syncBuiltinESMExports} from 'node:module';
import {Session} from 'node:inspector';

const out='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/owned-history-r1';
const eventPath='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/runtime-001/resources/events/runtime.events.jsonl';
const expectedSha256='532079454749d20def4aa6c02bac7bf591a369ef01cb5152462eaf07fa1cf20c';
const packageRoot='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.4/node_modules/@abiogenesis/typescript-tenant';
const load=name=>import(pathToFileURL(join(packageRoot,'build/code/src',name+'.js')).href);
const [events,prefixes,liveness,derivation,digests]=await Promise.all([
  load('abg/event_store'),load('abg/event_prefix'),load('abg/runtime_liveness'),load('abg/runtime_derivation'),load('shared/digests')]);
const hash=async path=>{const h=createHash('sha256');for await(const b of fs.createReadStream(path))h.update(b);return h.digest('hex');};
const before=await stat(eventPath);assert.equal(before.size,586361364);assert.equal(await hash(eventPath),expectedSha256);
const body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:pathToFileURL(eventPath).href,
  prefixLength:before.size,prefixDigest:'sha256:'+expectedSha256,
  storeIdentity:{device:before.dev,inode:before.ino,eventContractDigest:events.ROOT_EVENT_CONTRACT_DIGEST}};
const coordinate={...body,coordinateDigest:digests.sha256Canonical(body)};
const result={kind:'readonly_owned_history_discriminator',startedUtc:new Date().toISOString(),packageRoot,eventPath,
  sourceCommit:'3c113133d96d013743c1c1ec77d562abb0b2c05b',logSha256:expectedSha256,coordinate,
  limits:['One captured historical cut; not a native workflow speedup.','Inspector instrumentation affects absolute durations.',
    'Cold file acquisition is reported separately from repeated same-address-space projection.',
    'Measures this history/materialization path, not all CPU causes of observed event silence.'],measurements:[]};
const session=new Session();session.connect();
const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,value)=>error?reject(error):resolve(value)));
await post('Profiler.enable');
async function measure(name,action,{coverage=false,cpuProfile=false}={}){
  console.log(JSON.stringify({phase:name,status:'started',utc:new Date().toISOString()}));
  if(global.gc)global.gc();
  if(coverage)await post('Profiler.startPreciseCoverage',{callCount:true,detailed:false});
  if(cpuProfile)await post('Profiler.start');
  const old=fs.readSync;let reads=0,bytes=0;
  fs.readSync=(...args)=>{const n=old(...args);reads++;bytes+=n;return n;};syncBuiltinESMExports();
  const memoryBefore=process.memoryUsage(),cpu=process.cpuUsage(),start=performance.now();
  let value;
  try{value=action();}finally{fs.readSync=old;syncBuiltinESMExports();}
  const wallMs=performance.now()-start,used=process.cpuUsage(cpu),memoryAfter=process.memoryUsage();
  const measurement={name,wallMs,cpuUserMs:used.user/1000,cpuSystemMs:used.system/1000,readCalls:reads,readBytes:bytes,memoryBefore,memoryAfter};
  if(cpuProfile){const p=await post('Profiler.stop');const filename=name+'.cpuprofile';await writeFile(join(out,filename),JSON.stringify(p.profile),{flag:'wx'});measurement.cpuProfile=filename;}
  if(coverage){const c=await post('Profiler.takePreciseCoverage');await post('Profiler.stopPreciseCoverage');
    measurement.ownerCalls=c.result.filter(r=>r.url.startsWith(pathToFileURL(packageRoot).href)).flatMap(r=>r.functions
      .filter(f=>f.ranges[0].count>0).map(f=>({file:r.url.slice(pathToFileURL(packageRoot).href.length+1),name:f.functionName,count:f.ranges[0].count})));}
  result.measurements.push(measurement);
  console.log(JSON.stringify({phase:name,status:'completed',wallMs,cpuUserMs:measurement.cpuUserMs,cpuSystemMs:measurement.cpuSystemMs,reads,bytes}));
  return value;
}
try{
  const history=await measure('cold_readonly_authentication',()=>events.readOwnedRuntimeHistoryAtDurablePrefix(coordinate,{requireCurrent:true}));
  assert.equal(history.length,25016);
  const cut=history.cut(23799),envelope=cut.row(cut.length-1).envelope;
  assert.equal(envelope.kind,'c_call_fibre_selected');
  result.subject={ordinal:23799,eventRef:envelope.eventId,cCallRef:envelope.aggregateId,frameId:envelope.frameId};
  const owned=await measure('owned_prefix_and_liveness',()=>liveness.projectFrameLivenessContext(prefixes.selectOwnedRuntimeEventPrefix(cut),envelope.frameId),{coverage:true,cpuProfile:true});
  assert(owned!==null,'owned context must exist');
  let expanded;
  await measure('expanded_full_history_prefix',()=>{expanded=prefixes.selectValidatedRuntimeEventPrefix(new derivation.RuntimeDerivationSource().snapshot(cut.materialize()));},{coverage:true,cpuProfile:true});
  const legacy=await measure('expanded_prefix_liveness',()=>liveness.projectFrameLivenessContext(expanded,envelope.frameId),{coverage:true,cpuProfile:true});
  assert.deepEqual(legacy,owned,'equivalent exact liveness context');
  result.contextDigest=digests.sha256Canonical(owned);result.equalContext=true;
  expanded=null;
  const repeat=await measure('owned_prefix_and_liveness_repeat',()=>liveness.projectFrameLivenessContext(prefixes.selectOwnedRuntimeEventPrefix(cut),envelope.frameId),{coverage:true,cpuProfile:true});
  assert.deepEqual(repeat,owned);
  const after=await stat(eventPath);assert.equal(after.dev,before.dev);assert.equal(after.ino,before.ino);assert.equal(after.size,before.size);
  assert.equal(await hash(eventPath),expectedSha256);
  result.status='COMPARISON_PASSED';result.eventLogUnchanged=true;result.eventAppends=0;result.storeAcquisitions=0;result.providerCalls=0;
}catch(error){result.status='DIAGNOSTIC_FAILED';result.error={name:error.name,message:error.message,stack:error.stack};process.exitCode=1;}
finally{session.disconnect();result.endedUtc=new Date().toISOString();await writeFile(join(out,'OWNED_HISTORY_MEASUREMENT.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify({status:result.status,output:join(out,'OWNED_HISTORY_MEASUREMENT.json')}));
