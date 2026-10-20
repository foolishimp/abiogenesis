import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const phase=work+'/operator/latest-factory-data-mapper-resume-execution-101',prep=work+'/operator/latest-factory-data-mapper-resume-prep-98';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const pin=async path=>{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(path),path);const h=createHash('sha256');let byteCount=0;for await(const b of createReadStream(path)){h.update(b);byteCount+=b.length;}return {path,sha256:h.digest('hex'),byteCount};};
const selected=[["return.md","895bc3b1722cb490f986409c6271d77187e5d9ae1a96d44a8695bef1e530e75d"],["readiness.json","26a5e7c6922e8818be896206738d6626412a053b7db43c6168d4220c16d8a63b"],["freeze.json","42595bba8d7a9b161b6dad613111213ae3b8d1f3f8cd23f2abaf557486623a97"],["config.json","4f53ac591c692f542ab4057c63f95433f97aebfcf3d5b32b96d30e298b9651a9"],["setup.json","54e698910b0cf1a05db5d36d5e8c1a1644a1466cddaacd9ab1e6d5ca2e9fb286"]];
for(const [name,sha]of selected)assert.equal((await pin(prep+'/'+name)).sha256,sha);
const freeze=await json(prep+'/freeze.json');for(const expected of freeze.ledger)assert.deepEqual(await pin(expected.path),expected);
const controls=await json(prep+'/pins.json');for(const expected of controls.freshPins)assert.deepEqual(await pin(expected.path),expected);
const material=await json(prep+'/material-freeze.json'),eventPath=material.storeIdentity;
// Existing resume owner authenticates the entire selected log by streaming once
// during acquisition. This wrapper checks the already frozen physical identity;
// it neither hydrates history nor serializes any acquired asset bytes.
for(const expected of material.ledger.filter(r=>!r.path.endsWith('/resources/events/runtime.events.jsonl')))assert.deepEqual(await pin(expected.path),expected);
const eventPin=material.ledger.find(r=>r.path.endsWith('/resources/events/runtime.events.jsonl')),s=await lstat(eventPin.path,{bigint:true});assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(eventPin.path),eventPin.path);assert.equal(s.dev,BigInt(eventPath.device));assert.equal(s.ino,BigInt(eventPath.inode));assert.equal(s.size,BigInt(eventPath.byteCount));assert.equal(s.mtimeNs,BigInt(eventPath.mtimeNs));
const setup=await json(prep+'/setup.json'),config=await json(prep+'/config.json');
const record=async(name,value)=>writeFile(phase+'/'+name,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await record('execution-activation.json',{role:'Operator101',selectedAt:new Date().toISOString(),authority:'Root explicit execution release invokes this prepared ordinary recorder; preparation alone grants no dispatch',method:'fixed15 ABI5 GOAL035/T287 STDO2.5.1RC2',frame:'f-worksite-causality',preparation:freeze.ledger.find(r=>r.path===prep+'/return.md'),preparationFreeze:await pin(prep+'/freeze.json'),package:config.package,launch:setup.launch,recording:setup.recording,executionAuthority:setup.executionAuthority,stop:setup.stop,sourceState:{kind:'none',observations:[],synthesis:null,terminal:false,oldProducerCredit:false},material:{originals:4,authors:44,ledgerRows:52,oldStoreCopyOrReplay:false},criteria:'Full unchanged sixteen distinct compiled mutants/restorations and independent original UAT; honest unmet app evidence remains iterative',noOperatorSourceOrApplicationEdits:true});
console.log(JSON.stringify({phase:'dispatch',recorderPid:process.pid,phasePath:phase,exactSetup:true}));
const {commandRecorder}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const result=await commandRecorder(phase,{environment:process.env,timeoutMs:setup.recording.timeoutMs,maxOutputBytes:setup.recording.maxOutputBytes})('data-mapper-full',setup.launch.executable,setup.launch.args,{cwd:setup.launch.cwd});
console.log(JSON.stringify({phase:'outer_closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
