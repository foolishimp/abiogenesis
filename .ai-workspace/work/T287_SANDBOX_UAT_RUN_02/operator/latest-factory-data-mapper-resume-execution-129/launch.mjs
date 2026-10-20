import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const phase=work+'/operator/latest-factory-data-mapper-resume-execution-129',prep=work+'/operator/uat-measurement-assessment-successor-124',checker=work+'/operator/uat-owned-report-inventory-repair-126',review=work+'/operator/uat-measurement-assessment-publication-review-127',checkerReview=work+'/operator/uat-owned-report-inventory-review-128';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const pin=async p=>{const s=await lstat(p);assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(p),p);const h=createHash('sha256');let byteCount=0;for await(const b of createReadStream(p)){h.update(b);byteCount+=b.length;}return {path:p,sha256:h.digest('hex'),byteCount};};
const selected=[
 [prep+'/freeze.json','14de15c7f111f85fd79af71699c8922e37d767c304794bf79984bb7c45dddf3c'],
 [checker+'/freeze.json','495a4e3f53dbc6acfe8a49ea8153538e55d9e71bef08a83f6318660cb3ba057d'],
 [prep+'/resume-config.json','9fbca1db1155351fd5b28a613ec786a84e268257767a6333c748b4e4f285bd09'],
 [prep+'/setup.json','4086dd8b70fb4a785a40f26e473d018d10c9ad26d875d2132cfb7b25be1e4a51'],
 [review+'/return.md','92a3a5a291a3eac3d536f8efda406866a2fa867629aec78261d0e64fa637186b'],
 [review+'/pins.json','52ddf1e660ea4c0fed816cf7f37e7fe045f2962066d8ee2c94619736955e20c1'],
 [checkerReview+'/return.md','b8fcebea9a3dab9ba12baca70c2fb690dce111e69fcf04820e275ad0ab5776e8'],
 [checkerReview+'/pins.json','bd88db0ac4906f916a70e4430715aecb091c9a4f79155edf33df4c35ee20787e']
];
for(const [p,sha]of selected)assert.equal((await pin(p)).sha256,sha);
const freeze=await json(prep+'/freeze.json');for(const expected of freeze.evidencePins)assert.deepEqual(await pin(expected.path),expected);
const checkerFreeze=await json(checker+'/freeze.json');for(const expected of checkerFreeze.ledger)assert.deepEqual(await pin(expected.path),expected);
const setup=await json(prep+'/setup.json'),config=await json(prep+'/resume-config.json');
assert.equal(setup.limits.outerRecorderMs,19260000);assert.equal(setup.limits.outerRecorderBytes,536870912);
assert.deepEqual(await pin(setup.candidateArchive.path),setup.candidateArchive);
for(const selector of Object.values(config.resumeEvidence))assert.equal('sha256:'+(await pin(selector.path)).sha256,selector.digest);
const material=await json(config.resumeEvidence.freeze.path),observation=await json(config.resumeEvidence.observation.path);assert.equal(observation.retainedAuthorFiles.length,44);assert.equal(material.ledger.length,52);
for(const expected of material.ledger.filter(r=>!r.path.endsWith('/resources/events/runtime.events.jsonl')))assert.deepEqual(await pin(expected.path),expected);
const eventPin=material.ledger.find(r=>r.path.endsWith('/resources/events/runtime.events.jsonl')),s=await lstat(eventPin.path,{bigint:true}),identity=material.storeIdentity;
assert(s.isFile()&&!s.isSymbolicLink());assert.equal(await realpath(eventPin.path),eventPin.path);for(const [actual,key]of [[s.dev,'device'],[s.ino,'inode'],[s.size,'byteCount'],[s.mtimeNs,'mtimeNs']])assert.equal(actual,BigInt(identity[key]));
const record=async(name,value)=>writeFile(phase+'/'+name,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await record('execution-activation.json',{role:'Operator129',selectedAt:new Date().toISOString(),authority:'Root RELEASE129 conjoins Source120/123, Publication124/127, externalChecker126/128 closing125 HOLD; one original full Data Mapper resume',method:'fixed15 ABI5 GOAL035/T287 STDO2.5.1RC2',frames:['f-end-to-end-interface-integration','f-worksite-causality'],selectedInputs:selected.map(([path,sha256])=>({path,sha256})),package:config.package,launch:setup.launch,recording:{timeoutMs:setup.limits.outerRecorderMs,maxOutputBytes:setup.limits.outerRecorderBytes},limits:setup.limits,executionAuthority:setup.rootQualityWindow,stop:setup.stop,sourceState:{kind:'none',observations:[],synthesis:null,terminal:false,oldProducerCredit:false},material:{originals:4,authors:44,ledgerRows:52,oldStoreCopyOrReplay:false},criteria:setup.originalDemand,firstSelectorProof:'Actual current selected structured carrier/native Result/choice/next-child equality; current-dossier UAT preparation and same-C2 inventory/report consumer; no old11 or1738 credit',noOperatorSourceOrApplicationEdits:true});
console.log(JSON.stringify({phase:'dispatch',recorderPid:process.pid,phasePath:phase,exactSetup:true}));
const {commandRecorder}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const result=await commandRecorder(phase,{environment:process.env,timeoutMs:setup.limits.outerRecorderMs,maxOutputBytes:setup.limits.outerRecorderBytes})('data-mapper-full',setup.launch.executable,setup.launch.args,{cwd:setup.launch.cwd});
console.log(JSON.stringify({phase:'outer_closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
