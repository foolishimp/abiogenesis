// Non-mutating independent record/delta check and actual retained failure refusal.
// Does not import or execute the successor's fixture-creating check.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,G=path.dirname(D),R=path.resolve(G,'../../../..'),P=path.join(G,'final-c2-output-consumer-repair-01'),N=path.join(G,'final-observed-c2-01'),I=path.join(G,'final-candidate-construction-02/install/node_modules/@abiogenesis/typescript-tenant');
const bytes=p=>fs.readFileSync(p),read=p=>JSON.parse(bytes(p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected={
 'final-c2-output-consumer-review-controls-01/request.txt':'b76ac609dad0865d23a73bdd89ccf49606b4be9c0db471df5567a1dd779d51ce',
 'final-c2-output-consumer-repair-01/freeze.json':'5b705555a5ebd9a58e0402667a0f31f9256e3e3ce643930f065d33bee34650f6',
 'final-c2-output-consumer-repair-01/return.md':'1deaeb5758fdefd6bcda6a2f278e1b8130d636590a74504016ad7b319925d45b',
 'final-c2-output-consumer-repair-01/output-checks.mjs':'d59cebeeed35234f4d69f978030a5a1094919291513c523a0d34b07fcb6f8b2a',
 'final-end-to-end-forward-review-01/freeze.json':'4397713136caac64f7d7d434429efe20d95f7fd22d388d1613e2ef2de9bf488e'
};
for(const [p,h] of Object.entries(expected))assert.equal(sha(bytes(path.join(G,p))),h,p);
const freeze=read(path.join(P,'freeze.json'));let fileCount=0,symlinkCount=0,totalBytes=0;
for(const r of freeze.records){const p=path.join(P,r.path),s=fs.lstatSync(p);assert.ok(p.startsWith(P+'/'));if(r.kind==='symlink'){assert.ok(s.isSymbolicLink());assert.equal(fs.readlinkSync(p),r.target);symlinkCount++;}else{assert.equal(r.kind,'file');assert.ok(s.isFile());assert.equal(s.mode&0o777,r.mode);const b=bytes(p);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);fileCount++;totalBytes+=b.length;}}
assert.equal(fileCount,43);assert.equal(symlinkCount,1);
const sourceRecords=read(path.join(P,'source-relations.json')).map(r=>r.source);for(const r of sourceRecords){const b=bytes(path.join(R,r.path));assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
assert.ok(bytes(path.join(P,'preimages/output-checks.mjs')).equals(bytes(path.join(N,'output-checks.mjs'))));
assert.ok(bytes(path.join(P,'preimages/driver.mjs')).equals(bytes(path.join(N,'driver.mjs'))));
const old=bytes(path.join(P,'preimages/output-checks.mjs')).toString(),next=bytes(path.join(P,'output-checks.mjs')).toString(),driver=bytes(path.join(P,'preimages/driver.mjs')).toString();
const segment=(s,a,b)=>{const start=s.indexOf(a);assert.ok(start>=0,a);const end=s.indexOf(b,start);assert.ok(end>start,b);return s.slice(start,end);};
assert.equal(segment(next,' const v=',' async function consume('),segment(old,' const v=',' async function consume('));
assert.equal(segment(next,"  assert.equal(value.disposition",'  const {helper,outputRoot,readOutput}='),segment(old,"  assert.equal(value.disposition",'  const helperBytes='));
assert.equal(segment(next,'assert.deepEqual(helper.commandResults,o.commandResults);','  for(let i=0;i<13;i++)'),segment(old,'assert.deepEqual(helper.commandResults,o.commandResults);','  for(let i=0;i<13;i++)'));
assert.equal(segment(next,'  for(let i=0;i<13;i++)','  for(let i=0;i<14;i++)').replace('await readOutput(r.relativePath)','await fs.readFile(join(workspaceRoot,r.relativePath))'),segment(old,'  for(let i=0;i<13;i++)','  for(let i=0;i<14;i++)'));
assert.equal(segment(next,'  for(let i=0;i<14;i++)','  const comparison='),segment(old,'  for(let i=0;i<14;i++)','  const comparison='));
assert.equal(segment(next,'  const comparison=','  const result=').replace("await readOutput('verification/reports/generated-comparison.json')","await fs.readFile(join(workspaceRoot,'verification/reports/generated-comparison.json'),'utf8')").replace("await readOutput(join('verification',r.path))","await fs.readFile(join(workspaceRoot,'verification',r.path))"),segment(old,'  const comparison=','  const result='));
assert.equal(next.slice(next.indexOf('  const result=')).replace("status:'passed',outputRoot,actualRun","status:'passed',actualRun"),old.slice(old.indexOf('  const result=')));
assert.equal((next.match(/await readOutput\(/g)||[]).length,3);assert.equal(next.includes('workspaceRoot'),false);assert.ok(driver.includes('fs.readFile(join(root,f.target))'));
const handoff=read(path.join(P,'future-caller-handoff.json'));assert.equal(handoff.successor,path.join(P,'output-checks.mjs'));assert.ok(handoff.argumentChange.includes('consume({value,task,recipe,selection,expected,write,mark})'));assert.ok(next.includes('async function consume({value,task,recipe,selection,expected,write,mark})'));
const recorded=read(path.join(P,'checks.json'));assert.equal(recorded.checks.length,10);assert.ok(recorded.checks.every(c=>c.status==='passed'));
assert.equal(read(path.join(P,'relation-process.json')).exitCode,1);assert.equal(read(path.join(P,'relation02-process.json')).exitCode,0);
const manifest=read(path.join(I,'package.json')),entry=manifest.exports['./product'];
const product=await import(pathToFileURL(path.join(I,typeof entry==='string'?entry:entry.import))),successor=await import(pathToFileURL(path.join(P,'output-checks.mjs')));
const failed=read(path.join(N,'actual-c2-owner-value.json'));assert.equal(failed.disposition,'runtime_failed');let callbacks=0;
await assert.rejects(successor.makeOutputChecks({product,installedRoot:I}).consume({value:failed,write:()=>{callbacks++;throw Error('unexpected write');},mark:()=>{callbacks++;}}),/runtime_failed/);assert.equal(callbacks,0);
// This retained component comparison file is a Buffer, matching the new JSON.parse input.
const comparison=freeze.records.find(r=>r.kind==='file'&&r.path.includes('/sandbox/')&&r.path.endsWith('/reports/generated-comparison.json'));assert.ok(comparison);assert.deepEqual(JSON.parse(bytes(path.join(P,comparison.path))),{fixture:'snapshot-comparison'});
const observation={status:'passed bounded independent delta review',subjects:expected,freeze:{records:44,fileCount,symlinkCount,totalBytes},sourceRecords,originalsMatch:true,preservation:{schemaStreamProcessChecks:true,terminalTaskChecks:true,protected716AndProductChecks:true,command13:true,predicates14:true,testAndLintBlocks:true,comparison925Oracles:true,resultAndColdChecks:true,originalDriverBytes:true},changedRelation:{allPhysicalReadSites:3,callerRootParameterRemoved:true,successorHandoffAgrees:true,planArtifactSnapshotJoin:'independently source reviewed',canonicalContainmentAndNoAlias:'independently source reviewed',outputVectorConservation:'independently source reviewed'},focusedWorkerEvidence:{checks:10,initialProbeExit:1,correctedProbeExit:0,rerun:false,nativeCredit:false,sourceReview:'read all frozen harness checks and retained failure triage; did not execute or reconstruct fixtures'},independentActualFailedCheck:{disposition:failed.disposition,refusedBeforeCallbacks:true,callbacks,positiveSuccessExecuted:false},limits:['No new fixtures, helper commands, native/provider/network/current resource reads, repairs or qualification.','A valid supplied component carrier does not establish native admission.','Future driver import/argument handoff is specified, not installed or executed.','C2 success and both fresh native reads remain open.']};
fs.writeFileSync(path.join(D,'observations.json'),JSON.stringify(observation,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:observation.status,records:44,fileCount,symlinkCount,unchangedCallerObligations:true,recordedChecks:10,actualFailedRefusal:true,nativeCalls:0},null,2));
