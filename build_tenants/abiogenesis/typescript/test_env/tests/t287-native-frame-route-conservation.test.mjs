import assert from 'node:assert/strict';import test from 'node:test';import fs from 'node:fs';import {join,resolve} from 'node:path';
import {owners,historyFixture,lifecycleComponent,structuralComponent,sha} from '../support/t287-native-frame-route-conservation.mjs';
const root=resolve(import.meta.dirname,'../..'),proof=process.env.ABI5_ROUTE_PROOF_ROOT;
const historyPath=process.env.ABI5_FRAME_HISTORY_PATH,historySha=process.env.ABI5_FRAME_HISTORY_SHA256;
test('F1 complete HoG and atomic consumers conserve post-probe selection for hold and blocked retry',async()=>{
 assert.ok(proof);const o=await owners(root),f=historyFixture(o,historyPath,historySha),reports=[];
 for(const kind of ['hold','blocked'])for(const options of [{},{stale:true},{intervene:true},{changeEvidence:true}])reports.push(lifecycleComponent(o,f,kind,options));
 assert.equal(sha(fs.readFileSync(historyPath)),historySha);fs.writeFileSync(join(proof,'planned-prefix-components.json'),JSON.stringify(reports,null,2)+'\n');
});
test('F2 exact completed structural progress causation conserves producer law and rejects foreign chains',async()=>{
 const o=await owners(root),f=historyFixture(o,historyPath,historySha),report=await structuralComponent(o,f);
 fs.writeFileSync(join(proof,'structural-causation-components.json'),JSON.stringify(report,null,2)+'\n');
});
test('D4 descriptor and retained history EC/replay remain byte-value equal to rejected source baseline',async()=>{
 assert.ok(process.env.ABI5_ROUTE_BASELINE_ROOT);const before=await owners(process.env.ABI5_ROUTE_BASELINE_ROOT),after=await owners(root),bytes=fs.readFileSync(historyPath);
 assert.equal(sha(bytes),historySha);assert.deepEqual(after.events.ROOT_EVENT_CONTRACT_DESCRIPTOR,before.events.ROOT_EVENT_CONTRACT_DESCRIPTOR);
 assert.equal(after.events.ROOT_EVENT_CONTRACT_DIGEST,'sha256:3e8f2d4cb80c3c263c44fdadf6c23a46a5c510c3466f1f2cf31fe6016e01cc6a');
 const cuts=[];for(const count of [240,246,388]){
  const a=before.prefix.selectValidatedRuntimeEventPrefix(before.immutable.deepFreeze(before.events.validateHistoricalEvents(bytes).slice(0,count)));
  const b=after.prefix.selectValidatedRuntimeEventPrefix(after.immutable.deepFreeze(after.events.validateHistoricalEvents(bytes).slice(0,count)));
  const ae=before.calculus.deriveRuntimeEventCalculusProjection(a),be=after.calculus.deriveRuntimeEventCalculusProjection(b);
  assert.deepEqual(be,ae);assert.deepEqual(after.replay.replayValidatedRuntimeEventPrefix(b),before.replay.replayValidatedRuntimeEventPrefix(a));cuts.push({count,eventCalculusDigest:sha(JSON.stringify(be))});
 }
 fs.writeFileSync(join(proof,'historical-equality.json'),JSON.stringify({d4:after.events.ROOT_EVENT_CONTRACT_DIGEST,descriptorEqual:true,cuts},null,2)+'\n');
});
