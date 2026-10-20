import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const phase=work+'/operator/latest-factory-data-mapper-resume-execution-109',prep=work+'/operator/crosscut-selector-successor-107',review=work+'/operator/crosscut-selector-publication-review-108';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const pin=async p=>{const s=await lstat(p);assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(p),p);const h=createHash('sha256');let byteCount=0;for await(const b of createReadStream(p)){h.update(b);byteCount+=b.length;}return {path:p,sha256:h.digest('hex'),byteCount};};
const selected=[
 [prep+'/return.md','6ec9fbb2568b6bf15b719d648b9c3d5108b2f700d0e271e19f9ca806773b32c9'],
 [prep+'/readiness.json','6600f71194e84497d9ad7c87fc1a09b5fa959cb7521ad7cc72ef46dda63d38fb'],
 [prep+'/freeze.json','1e60e3d9e14fb63783673941807dfb8fc96185a78a928af4c2098a9b0e098c79'],
 [prep+'/setup.json','e359582024069413a71d50c5cbb3c1b5a2b539582fc6fba5f8c4df9a44a306c7'],
 [prep+'/resume-config.json','8220ea387b1aee6eb52f2bd61f55592caf3a23fb87c569de8880fca7355a952c'],
 [review+'/return.md','4c59f0fbb7f3e51b2ad1cd65b0c948d0162268733aad8c1b8b2a47f24ca233a9'],
 [review+'/pins.json','b11f784ca129a4a344e389d7260f68eecfad30042e87d862b535eeb8d44fc4af']
];
for(const [p,sha]of selected)assert.equal((await pin(p)).sha256,sha);
const freeze=await json(prep+'/freeze.json');for(const expected of freeze.ledger)assert.deepEqual(await pin(expected.path),expected);
const setup=await json(prep+'/setup.json'),config=await json(prep+'/resume-config.json');
assert.equal(setup.limits.outerRecorderMs,19260000);assert.equal(setup.limits.outerRecorderBytes,536870912);
assert.deepEqual(await pin(setup.candidateArchive.path),setup.candidateArchive);
for(const selector of Object.values(config.resumeEvidence))assert.equal('sha256:'+(await pin(selector.path)).sha256,selector.digest);
const material=await json(config.resumeEvidence.freeze.path);
for(const expected of material.ledger.filter(r=>!r.path.endsWith('/resources/events/runtime.events.jsonl')))assert.deepEqual(await pin(expected.path),expected);
const eventPin=material.ledger.find(r=>r.path.endsWith('/resources/events/runtime.events.jsonl')),s=await lstat(eventPin.path,{bigint:true}),identity=material.storeIdentity;
assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(eventPin.path),eventPin.path);for(const [actual,key]of [[s.dev,'device'],[s.ino,'inode'],[s.size,'byteCount'],[s.mtimeNs,'mtimeNs']])assert.equal(actual,BigInt(identity[key]));
const record=async(name,value)=>writeFile(phase+'/'+name,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await record('execution-activation.json',{role:'Operator109',selectedAt:new Date().toISOString(),authority:'Root RELEASE109 conjoins frozen107 and independent108; one original full Data Mapper resume',method:'fixed15 ABI5 GOAL035/T287 STDO2.5.1RC2',frames:['f-end-to-end-interface-integration','f-worksite-causality'],selectedInputs:selected.map(([path,sha256])=>({path,sha256})),package:config.package,launch:setup.launch,recording:{timeoutMs:setup.limits.outerRecorderMs,maxOutputBytes:setup.limits.outerRecorderBytes},limits:setup.limits,executionAuthority:setup.rootQualityWindow,stop:setup.stop,sourceState:{kind:'none',observations:[],synthesis:null,terminal:false,oldProducerCredit:false},material:{originals:4,authors:44,ledgerRows:52,oldStoreCopyOrReplay:false},criteria:setup.originalDemand,firstSelectorProof:'Actual result_text argv/no json-schema; canonical full response schema retained; raw JSON completion/admission/choice/next-task ownership',noOperatorSourceOrApplicationEdits:true});
console.log(JSON.stringify({phase:'dispatch',recorderPid:process.pid,phasePath:phase,exactSetup:true}));
const {commandRecorder}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const result=await commandRecorder(phase,{environment:process.env,timeoutMs:setup.limits.outerRecorderMs,maxOutputBytes:setup.limits.outerRecorderBytes})('data-mapper-full',setup.launch.executable,setup.launch.args,{cwd:setup.launch.cwd});
console.log(JSON.stringify({phase:'outer_closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
