// Two genuine cold reads through the existing immutable RC7 read owners.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const load=async(path,expected)=>{const bytes=await readFile(path);if(expected)assert.equal(sha(bytes),expected);return {value:JSON.parse(bytes),pin:{path,bytes:bytes.length,sha256:sha(bytes)}};};
const binding=await load(join(dir,'BINDING.002.json'),'c619ad12377b3f25eb1550a4855351cc6564c4574b9e958ce5552122c52384f2'),b=binding.value;
const prepared=await load(join(b.runtimeRoot,'PREPARED.json'),'2a5f8be6eb079f13441ed935faa9fa91d1cd02af1c8bc5164305b4c53e682986');
const closed=await load(join(b.runtimeRoot,'resource-close.json'),'469e6ab2f2bc0818a8e8c9629a242fd885e6e0ea46fde66d6360d583294ead73');
const outcome=await load(join(b.runtimeRoot,'calls/lifecycle-start.outcome.json'),'3dd78a68391b946907dd578ed21f7b51957d3a826167af3040f26072eab98b51');
const acquisition=await load(join(b.runtimeRoot,'abg-acquisition.json'));
for(const p of Object.values(b.sourceHelpers)){const bytes=await readFile(p.path);assert.equal(bytes.length,p.bytes);assert.equal(sha(bytes),p.sha256);}
const environment={...b.environment};for(const k of Object.keys(environment))if(/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/u.test(k))delete environment[k];
Object.assign(process.env,environment);
const owner=await import(pathToFileURL(b.sourceHelpers['public-setup.mjs'].path)),runner=await import(pathToFileURL(b.sourceHelpers['runner.mjs'].path));
const root=join(dir,'readbacks-001');await mkdir(root);
const record=(p,v,raw=false)=>runner.exclusiveRecord(root,p,v,raw),runtime=await owner.installedModules(b.bootstrapRoot);
const native={...acquisition.value,verified:acquisition.value.verification.verifiedArtifact};
const caller=owner.publicCaller({root,runtime,native,record,command:runner.commandRecorder(root,{environment,timeoutMs:b.proofTimeoutMs}),
  config:{runId:'rc8-reference-preservation-01-native-fresh-readbacks',nodePath:process.execPath,setupEnvironment:environment}});
caller.state.binding=prepared.value.workspaceBinding;caller.state.closeHandoff=closed.value.closeHandoff;caller.installedRoot=prepared.value.installedRoot;
const prefix=closed.value.closeHandoff.prefix,before=await runner.eventResourceIdentity(fileURLToPath(prefix.eventLogRef));
const startedUtc=new Date().toISOString(),started=performance.now();
await record('run.json',{status:'EXACT_CLOSED_READ_SUBJECT_PINNED_BEFORE_CALL',startedUtc,authority:'Root selected fresh result/replay from actual native close; existing read owners only',
  binding:binding.pin,prepared:prepared.pin,close:closed.pin,outcome:outcome.pin,acquisition:acquisition.pin,run:outcome.value.receipt.resources.run,
  prefix,physicalIdentity:before,installedRoot:caller.installedRoot,sourceHelpers:b.sourceHelpers,providerDispatch:false,sourceAcceptance:false});
try{
  const reads=await runner.freshReadbacks(caller,{receipt:outcome.value.receipt});
  const after=await runner.eventResourceIdentity(fileURLToPath(prefix.eventLogRef));assert.deepEqual(after,before);assert.deepEqual(caller.state.closeHandoff.prefix,prefix);
  const observations=runner.freshReadbackRecord(reads,runtime.product.sha256Canonical);
  assert.equal(observations.length,2);assert(observations.every(r=>r.outcomeKind==='result'));assert.equal(observations.find(r=>r.memberKey==='run_replay').status,'closed');
  const result={status:'READBACKS_PASSED_UNCHANGED_PREFIX',startedUtc,completedUtc:new Date().toISOString(),wallMs:performance.now()-started,observations,physicalIdentity:after,prefixUnchanged:true,sourceAccepted:false,qualified:false};
  await record('RESULT.json',result);console.log(JSON.stringify({status:result.status,wallMs:result.wallMs,observations:observations.map(r=>({memberKey:r.memberKey,outcomeKind:r.outcomeKind,status:r.status})),root}));
}catch(error){await record('FAILURE.json',{completedUtc:new Date().toISOString(),wallMs:performance.now()-started,name:error.name,message:error.message,observation:error.observation??null});throw error;}
