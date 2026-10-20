import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const phase=work+'/operator/latest-factory-data-mapper-resume-execution-118',prep=work+'/operator/crosscut-selector-structured-successor-116',review=work+'/operator/crosscut-selector-structured-publication-review-117';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const pin=async p=>{const s=await lstat(p);assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(p),p);const h=createHash('sha256');let byteCount=0;for await(const b of createReadStream(p)){h.update(b);byteCount+=b.length;}return {path:p,sha256:h.digest('hex'),byteCount};};
const selected=[
 [prep+'/return.md','b0f17b2328ea79f9e7599579079d2a8caee0cc65ae1360964546ce9e4f5f24fd'],
 [prep+'/readiness.json','65d555fde885c9dfb786ab81cb30fd87b66dd8905b48965ffc885f67c9368d17'],
 [prep+'/freeze.json','f070607f4eb3a548e2e8a394fe851d81b6d9712426f4eb1aac1719df230bfdf0'],
 [prep+'/setup.json','1b44c759f8981dab6c56b8282d81d704072d05e6b4456b3138f532daac851c45'],
 [prep+'/resume-config.json','6243d33d39a08647cc3db9b277632c377b886452fa19448a58fd70de0c904fe6'],
 [review+'/return.md','ea2f708c4b215b9f95c2c964a91808774c733f4710e1ab255ccaa698bab95c84'],
 [review+'/pins.json','bd64d7b880e7795c54dfafe30a43bbfd880fddd5716e17eb13577348e2ed5891']
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
await record('execution-activation.json',{role:'Operator118',selectedAt:new Date().toISOString(),authority:'Root RELEASE118 conjoins 113/114, actual115, frozen116 and independent117; one original full Data Mapper resume',method:'fixed15 ABI5 GOAL035/T287 STDO2.5.1RC2',frames:['f-end-to-end-interface-integration','f-worksite-causality'],selectedInputs:selected.map(([path,sha256])=>({path,sha256})),package:config.package,launch:setup.launch,recording:{timeoutMs:setup.limits.outerRecorderMs,maxOutputBytes:setup.limits.outerRecorderBytes},limits:setup.limits,executionAuthority:setup.rootQualityWindow,stop:setup.stop,sourceState:{kind:'none',observations:[],synthesis:null,terminal:false,oldProducerCredit:false},material:{originals:4,authors:44,ledgerRows:52,oldStoreCopyOrReplay:false},criteria:setup.originalDemand,firstSelectorProof:'Actual structured_output carrier argv with separate canonical/carrier identities; canonical full response schema retained in prompt and strict native binder; actual native completion/admission/choice/next-task ownership',noOperatorSourceOrApplicationEdits:true});
console.log(JSON.stringify({phase:'dispatch',recorderPid:process.pid,phasePath:phase,exactSetup:true}));
const {commandRecorder}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const result=await commandRecorder(phase,{environment:process.env,timeoutMs:setup.limits.outerRecorderMs,maxOutputBytes:setup.limits.outerRecorderBytes})('data-mapper-full',setup.launch.executable,setup.launch.args,{cwd:setup.launch.cwd});
console.log(JSON.stringify({phase:'outer_closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
