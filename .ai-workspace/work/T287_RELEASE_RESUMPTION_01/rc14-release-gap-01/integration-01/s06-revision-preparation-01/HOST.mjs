// External test Operator only. Imports Product exclusively through package exports.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {populateS06,constructPhaseCall} from './setup.mjs';
import {closedSource,sourcePins,pinnedJson,admitBindingCover,authenticateRequest,currentProjection} from './revision-source.mjs';
import {selectAdmittedExecution,authenticateExecutionEvidence,authenticateObservedFiles} from './c2-evidence.mjs';
import {d1Input,d2Input,sourceRecords,amendmentRecords,witnessCommand,witnessProtocol,applicationScopes} from './inputs.mjs';

import {readFile,mkdir,writeFile,readdir,lstat,readlink} from 'node:fs/promises';
import {dirname,join,relative,isAbsolute} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const b=JSON.parse(await readFile(process.argv[2],'utf8'));
assert.equal(b.executionAuthorized,true,'Root must separately authorize execution');
// Retain selected values only in memory. Public installation inherits ambient
// environment, so remove them before importing Product or running any setup.
const providerCredentials=Object.fromEntries(b.configuration.provider.inheritEnvironment.map(key=>[key,process.env[key]]));
for(const key of Object.keys(providerCredentials)) {
  assert(providerCredentials[key],'Missing selected credential key: '+key);
  delete process.env[key];
}
const control=dirname(fileURLToPath(import.meta.url));
const tenant=join(b.controlSourceRoot,'build_tenants/abiogenesis/typescript');
const load=path=>import(pathToFileURL(join(tenant,path)).href);
const R=await load('test_env/uat/runner.mjs'), S=await load('test_env/uat/scenarios.mjs');
const P=await load('test_env/uat/public-setup.mjs');
const A=await load('test_env/support/amendment-witness.mjs'),D=await load('test_env/support/default-library.mjs');
const toolchainBytes=await readFile(join(control,'TOOLCHAIN.json'));
assert.equal(S.digest(toolchainBytes),'sha256:'+b.application.toolchainSha256);
const toolchain=JSON.parse(toolchainBytes);
assert.equal(b.application.commandExecutable,join(sourcePins.originalControls,'tool-launcher.py'),'Original immutable Tool/task coordinate');
const protocol=witnessProtocol(b,toolchain),protocolEnvironment=protocol.environment;
const root=join(b.rawRoot,'witness');await mkdir(root);let phaseTag='setup';
const record=(path,value,raw=false)=>R.exclusiveRecord(root,phaseTag+'/'+path,value,raw);
const config={...b.configuration,sourceCommit:b.candidate.sourceCommit,runId:b.runId,
  package:{archivePath:b.candidate.archivePath,sha256:b.candidate.archiveSha256},
  archiveRoot:b.rawRoot,fixtureRoot:control,
  worksiteRoot:b.worksiteRoot,setupEnvironment:b.setupEnvironment,
  inheritEnvironment:[],toolchainEnvironment:b.setupEnvironment};
assert.equal(config.provider.enabled,true);
const executionDeadline=new Date(Date.parse(b.deadlineUtc)-b.exitAuditReserveMs).toISOString();
// Delegate command custody to the byte-identical accepted Python owner. The
// bridge inherits this host's group; its child has an explicit PID/group receipt.
async function command(label,executable,args,{cwd=root,environment=config.setupEnvironment,timeoutMs=config.processTimeoutMs,maxBytes=config.maxProcessOutputBytes}={}) {
  assert(/^[A-Za-z0-9_-]+$/.test(label));
  for(const key of config.provider.inheritEnvironment)assert(!Object.hasOwn(environment,key),'Credentials may reach only native worker environment');
  label=phaseTag+'-'+label;const folder=join(root,'commands',label);await mkdir(join(root,'commands'),{recursive:true});
  const job={folder,argv:[executable,...args],cwd,environment,deadlineUtc:executionDeadline,capMs:timeoutMs,maxBytes};
  const child=spawn(b.pythonPath,[join(control,'command-owner.py')],{cwd:root,env:{...config.setupEnvironment,PYTHONDONTWRITEBYTECODE:'1'},stdio:['pipe','pipe','pipe']});
  const out=[],err=[];let captured=0,truncated=false,launchError=null;
  const collect=target=>chunk=>{captured+=chunk.length;if(captured<=65536)target.push(chunk);else truncated=true;};
  child.stdout.on('data',collect(out));child.stderr.on('data',collect(err));child.on('error',e=>{launchError=String(e);});
  const closing=new Promise(resolve=>child.on('close',(exitCode,signal)=>resolve({exitCode,signal})));
  child.stdin.on('error',e=>{launchError??=String(e);});child.stdin.end(JSON.stringify(job));
  await R.exclusiveRecord(root,'commands/'+label+'.bridge-launch.json',{pid:child.pid??null,enclosingHostPid:process.pid,commandOwner:join(control,'command-owner.py'),deadlineUtc:executionDeadline});
  const closed=await closing;
  await R.exclusiveRecord(root,'commands/'+label+'.bridge-close.json',{...closed,launchError,truncated,captured});
  await R.exclusiveRecord(root,'commands/'+label+'.bridge.stdout',Buffer.concat(out),true);await R.exclusiveRecord(root,'commands/'+label+'.bridge.stderr',Buffer.concat(err),true);
  if(launchError||truncated)throw new P.BoundaryFailure(label+'-command-bridge',{launchError,truncated,folder});
  const result=JSON.parse(await readFile(join(folder,'result.json'),'utf8'));
  const finalCapture=JSON.parse(await readFile(join(root,'commands',label+'.final-capture.json'),'utf8'));
  if(result.stopReason||!result.cleanup.ownedProcessGroupAbsent||!finalCapture.withinLimit)
    throw new P.BoundaryFailure(label+'-command-custody',{result,finalCapture});
  return {...result,stdout:await readFile(join(folder,'stdout.raw'),'utf8'),stderr:await readFile(join(folder,'stderr.raw'),'utf8'),timedOut:false,truncated:false};
}
// The authenticated package declares import-only public exports. Select those
// exact declarations; a CommonJS resolver does not activate the import condition.
const packageJsonPath=join(b.candidate.bootstrapPackageRoot,'package.json');
const packageJson=JSON.parse(await readFile(packageJsonPath,'utf8'));
assert.equal(packageJson.name,'@abiogenesis/typescript-tenant');
assert.equal(packageJson.version,b.candidate.packageVersion);
const packageUrl=pathToFileURL(packageJsonPath);
const runtime={};
for(const [name,key] of [['product','product'],['abg','abg'],['gtl','gtl'],['validator','validator'],['public','api']]) {
  const declared=packageJson.exports?.['./'+name];
  assert(declared&&typeof declared==='object'&&!Array.isArray(declared),'missing public export: '+name);
  const target=declared.import;
  assert(typeof target==='string'&&target.startsWith('./'),'missing import target: '+name);
  const url=new URL(target,packageUrl);
  assert.equal(url.protocol,'file:');assert.equal(url.search,'');assert.equal(url.hash,'');
  const entry=fileURLToPath(url);
  const rel=relative(b.candidate.bootstrapPackageRoot,entry);
  assert(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'),'foreign package export');
  assert.equal((await lstat(entry)).isFile(),true,'public export must be a regular file');
  runtime[key]=await import(pathToFileURL(entry).href);
}
// No private invocation_execution_truth import and no historical producer credit.
const tree=async(dir,prefix='')=>{
  const rows=[];
  for(const name of (await readdir(join(dir,prefix))).sort()) {
    const path=prefix?prefix+'/'+name:name, full=join(dir,path), st=await lstat(full);
    if(st.isSymbolicLink())rows.push([path,'link:'+await readlink(full)]);
    else if(st.isDirectory())rows.push(...await tree(dir,path));
    else if(st.isFile())rows.push([path,S.digest(await readFile(full))]);
    else throw new Error('Unsupported worksite entry: '+path);
  }
  return rows;
};
function topologyLayouts(environment,writePaths,b,control,worksiteRoot) {
  const binding=environment.workspaceBinding,roots=Object.values(binding.roots);
  assert(roots.every(value=>typeof value==='string'));
  const installRoots=environment.productInstalls.map(row=>row.installedRoot);assert.equal(installRoots.length,2);
  const unique=values=>[...new Set(values)].sort();
  const external=unique([b.candidate.bootstrapPackageRoot,b.candidate.archivePath,b.controlSourceRoot,control,...b.protectedRoots]);
  assert(![...roots,...installRoots,...external].includes(b.rawRoot),'Outer capture container is a separate declared custody role');
  const completeProtectedRoots=unique([...roots,...installRoots,...external,b.rawRoot]);
  const layouts=[
    {role:'operator-custody',layout:{worksite:worksiteRoot,writePaths,protectedRoots:unique([b.rawRoot,...external]),archiveRoot:b.rawRoot}},
    {role:'runtime-owner',layout:{worksite:worksiteRoot,writePaths,protectedRoots:unique([...roots,...installRoots,...external]),archiveRoot:binding.roots.archiveRoot}},
  ];
  assert.equal(layouts[0].layout.writePaths,layouts[1].layout.writePaths,'Both roles share exact W');
  assert.deepEqual(unique(layouts.flatMap(row=>row.layout.protectedRoots)),completeProtectedRoots,'Complete original protected set conserved');
  return {bindingId:binding.bindingId??null,installRoots,completeProtectedRoots,layouts};
}
let caller,summary={status:'incomplete',scenario:'s06-d1-d2',qualified:false};
try {
 await R.exclusiveRecord(root,'run.json',{runId:b.runId,candidate:b.candidate,controlSourceCommit:b.controlSourceCommit,claim:'Actual closed04 adverse revision then real D2; complete original history retained; no03 source credit'});
 const inputs=JSON.parse(await readFile(join(control,'INPUTS.json'),'utf8'));
 for(const tool of [['node',config.nodePath,['--version']],['npm',config.toolchains.npm.executable,['--version']],['provider',config.provider.command,['--version']]]){
  const [name,exe,args]=tool;const value=await command('preflight-'+name,exe,args,{timeoutMs:20000});assert.equal(value.exitCode,0);
 }
 const nativeDeclarations=await import(pathToFileURL(inputs.declarations.find(r=>r.path.endsWith('/native-lifecycle-declarations.mjs')).path).href);
 const manifest=JSON.parse(await readFile(join(b.candidate.bootstrapPackageRoot,'product-toolchain-manifest.json'),'utf8'));
 const native=await P.verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,expectedArtifactDigest:config.package.sha256},record,'abg');
 caller=P.publicCaller({root,runtime,native,command,record,config,actorRef:closedSource.actorRef});
 const {fixture,installations}=await populateS06(caller,{D,P,nativeDeclarations,tenant,packageRoot:b.candidate.bootstrapPackageRoot});
 // Setup must retain the generic declared role context for both selected
 // Programs before any native lifecycle dispatch. This is not a verdict.
 for(const phase of ['intake','revision','d2']) {
  const publication=fixture.publications.find(row=>row.programs.some(program=>program.programRef===fixture.programRefs[phase]));
  const program=publication?.programs.find(row=>row.programRef===fixture.programRefs[phase]);
  const environments=publication?.runEnvironments?.filter(row=>row.declarationRef===program?.policies[runtime.gtl.RUN_ENVIRONMENT_POLICY]);
  assert.equal(environments?.length,1,phase+' requires its exact declared run environment');
  assert(runtime.gtl.isRunEnvironmentDeclaration(environments[0]),phase+' run environment must be canonical');
 }
 // Original worksite is retained exactly at entry. No reseeding, new workspace or old asset rewriting.
 const originalInput=await pinnedJson(closedSource.originalInput);assert(runtime.product.isSemanticJobInput(originalInput));
 const before=await tree(config.worksiteRoot);await record('worksite-before.json',before);
 async function topology(label) {
  const writes=['application','semantic-assets','evidence','source/d2-input.json','source/d2-rubric.md','source/d1-admitted-source.json'].map(p=>join(config.worksiteRoot,p));
  const base=topologyLayouts(caller.refresh(),writes,b,control,config.worksiteRoot);
  const prepared=topologyLayouts(caller.refresh(),writes,{...b,protectedRoots:[...b.protectedRoots,toolchain.stateRoot,toolchain.receiptRoot]},control,config.worksiteRoot);
  const protectedRoots=[...new Set(base.layouts.flatMap(({layout})=>[layout.worksite,layout.archiveRoot,...layout.protectedRoots]).concat(toolchain.frozenRoot))];
  prepared.layouts.push({role:'consumer-tool-state',layout:{worksite:toolchain.stateRoot,writePaths:[join(toolchain.stateRoot,'attempts')],archiveRoot:toolchain.receiptRoot,protectedRoots}});
  await record('topology-'+label+'.roles.json',prepared);
  for(const {role,layout} of prepared.layouts) {
   const path=await record('topology-'+label+'-'+role+'.layout.json',layout);
   const result=await command('topology-'+label+'-'+role,b.pythonPath,[join(control,'physical-topology.py'),path],{timeoutMs:60000,maxBytes:4194304});
   const observation=JSON.parse(result.stdout);await record('topology-'+label+'-'+role+'.json',observation);
   assert.equal(result.exitCode,0);assert.equal(observation.ok,true);assert.equal(observation.disposition,'separated');
  }
 }
 await topology('after-setup');
 const buildRoots=['target','project/target','project/project/target',...['core','compiler','executor','adjoint','accounting','assurance','fidelity','engine'].map(n=>'cdme-'+n+'/target')].map(p=>'application/scala_spark/'+p);
 const d1=originalInput;assert.deepEqual(d1.taskData.witnessCommands,protocol.commands,'Original task command protocol conserved');
 // The fixed prospective command protocol is an ordinary task constraint;
 // native Design must select it in its own admitted plan.
 const expectedD1=protocol.commands.d1;
 await record('declared-command-protocol.json',protocol);
 let d1Result,d1Observation,d1QueryOutputs,d1Files,d1Application,d1Evidence;
 async function readAndClose(execution) {
  // The recorder and maintained cold reader must name the same phase path.
  // Only external file custody changes; all actual owner references are shared.
  const phase=phaseTag,phaseRoot=join(root,phase);
  const phaseCaller={...caller,root:phaseRoot};
  await record('run.json',{runId:b.runId,phase,run:execution.receipt.resources.run,
   sourceRunRecord:pathToFileURL(join(root,'run.json')).href,claim:'Phase-local custody of the same actual Run and owner resources'});
  const events=await R.readOracleEvents(runtime.abg,caller.prefix(),record),held=await R.heldReadbacks(phaseCaller,execution);
  await record('held-readback.json',R.freshReadbackRecord(held,runtime.product.sha256Canonical));await record('session-close.json',caller.close());
  const fresh=await R.freshReadbacks(phaseCaller,execution);await record('fresh-readback.json',R.freshReadbackRecord(fresh,runtime.product.sha256Canonical));
  assert.equal(fresh.length,2);for(const r of fresh)assert.deepEqual(r.ownerOutput,held.find(x=>x.memberKey===r.memberKey)?.ownerOutput);
  assert.equal(fresh.find(r=>r.memberKey==='run_replay')?.projection?.status,'closed');
  await record('actor-calls.json',await A.summarizeActorCalls(events));
  assert.equal(execution.receipt.exitCode,0);assert.equal(execution.receipt.ownerOutput.outcomeKind,'result');
  return {events,value:execution.receipt.ownerOutput.value.terminalResult.value,run:execution.receipt.resources.run};
 }
 async function authenticateToolReceipt(evidence,phase) {
  const rows=[];
  for(const name of await readdir(join(toolchain.receiptRoot,'attempts'))) {
   const folder=join(toolchain.receiptRoot,'attempts',name);
   const value=JSON.parse(await readFile(join(folder,'RETURN.json')));
   if(value.kind==='witness'&&value.phase===phase&&value.cwd===evidence.sandboxRoot)rows.push({folder,value});
  }
  assert.equal(rows.length,1,'One Tool observation joined to the actual C2 sandbox');
  const {folder,value}=rows[0],launch=JSON.parse(await readFile(join(folder,'launch.json')));
  assert.equal(value.disposition,'child_completed');assert.equal(value.inputSha256,b.application.toolchainSha256);
  assert.equal(value.toolSha256,b.tools.s06Tool.sha256);assert.equal(launch.tool,b.application.commandExecutable);
  assert.equal(launch.toolSha256,value.toolSha256);assert.equal(launch.inputSha256,value.inputSha256);
  assert.deepEqual(value.suppliedArgs,witnessCommand(b.application.commandExecutable,phase,b.application.commandTimeoutMs).args);
  assert.equal(value.child.exitCode,0);assert.equal(value.child.failure,null);assert.equal(value.child.childReaped,true);
  let absent=false;try{process.kill(-value.child.processGroup,0);}catch(error){if(error.code==='ESRCH')absent=true;else throw error;}
  assert.equal(absent,true,'Actual enclosing C2 command group remains present');
  const artifact=JSON.parse(await readFile(evidence.helperArtifact.path));
  const result=artifact.commandResults.find(r=>r.commandId==='command://s06-witness/'+phase+'@5');assert(result);
  for(const key of ['stdout','stderr']) {
   const bytes=await readFile(join(folder,key+'.raw')),row=value.child.streams[key+'.raw'];
   assert.equal(bytes.length,row.bytes);assert.equal(S.digest(bytes),'sha256:'+row.sha256);
   assert.equal(result[key].byteLength,bytes.length);assert.equal(result[key].digest,S.digest(bytes),'Actual C2 stream/Tool capture join');
  }
  await record('tool-custody.json',{folder,value,launch,claim:'Tool setup/child observations only; C2 owns command/result and application acceptance is separate'});
 }
 async function observeApplication(phase,evidence) {
  const result=await command('application-oracle-'+phase,b.pythonPath,[join(control,'observe.py'),evidence.sandboxRoot,phase,inputs.oracle.path,inputs.scalaRuntime.sha256],{timeoutMs:60000});
  const observation=JSON.parse(result.stdout);await record('application-'+phase+'.json',observation);assert.equal(observation.passed,true);await authenticateObservedFiles(runtime.product,evidence,observation);
  const q=observation.query,outputs=[];
  for(let i=0;i<2;i++){
   const value=await command('fresh-query-'+phase+'-'+i,b.application.commandExecutable,['--query',phase,q.classpath.join(':'),q.runRoot,...q.queries],{cwd:evidence.sandboxRoot,environment:protocolEnvironment,timeoutMs:30000});
   outputs.push(value.stdout);assert.equal(value.exitCode,0);
  }
  await record('fresh-query-'+phase+'.json',{outputs,observation});assert.equal(outputs[0],outputs[1]);
  assert(outputs[0].includes('output:src-101 -> found=true')&&outputs[0].includes('sourceKeys=[src-101]'));
  assert(outputs[0].includes('filtered:src-102 -> found=true')&&outputs[0].includes('conditionId=include-true'));
  assert(outputs[0].includes('error:src-103 -> found=true')&&outputs[0].includes('not-an-integer')&&outputs[0].includes('failedConstraint=cast:integer'));
  const after=await command('application-oracle-'+phase+'-after',b.pythonPath,[join(control,'observe.py'),evidence.sandboxRoot,phase,inputs.oracle.path,inputs.scalaRuntime.sha256],{timeoutMs:60000});
  assert.deepEqual(JSON.parse(after.stdout),observation,'query-only actual input conservation');await authenticateObservedFiles(runtime.product,evidence,observation);return {observation,outputs};
 }
 phaseTag='revision-intake';
 const intake=await admitBindingCover(caller);await record('input.json',intake);await topology('before-dispatch');
 const intakeCall=await constructPhaseCall(caller,intake,P,fixture,'intake');await record('prepared-call.json',intakeCall.call);
 await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'revision-intake',sourceRun:closedSource.sourceRun});
 const intakeExecution=await R.invokeLifecycle(caller,installations,intakeCall.call,{...providerCredentials,...R.workerEnvironment(config)});
 const intakeResult=await readAndClose(intakeExecution),request=authenticateRequest(runtime.product,intakeResult.value);
 const publication=fixture.publications.find(p=>p.programs.some(q=>q.programRef===fixture.programRefs.intake));
 const selected=nativeDeclarations.selectNativeSemanticRevisionStart({product:runtime.product,publication,request});
 await record('admitted-request-and-selection.json',{request,selected,run:intakeResult.run});
 assert(selected,'Canonical declaration selector must resolve the actual admitted request');
 assert.equal(selected.programRef,fixture.programRefs.revision,'This bounded preparation covers the actual from-Intent choice only');
 caller.acquire(caller.reopen());phaseTag='d1';await record('input.json',request);await topology('before-dispatch');
 const first=await constructPhaseCall(caller,request,P,fixture,'revision');await record('prepared-call.json',first.call);
 await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'revision-from-intent',selected});
 const firstExecution=await R.invokeLifecycle(caller,installations,first.call,{...providerCredentials,...R.workerEnvironment(config)});
 const revisionResult=await readAndClose(firstExecution);await record('complete-revision-terminal.json',revisionResult.value);
 d1Result=currentProjection(runtime.product,revisionResult,request);
 await record('current-projection.json',{revisionBasis:revisionResult.value.revisionBasis,current:d1Result.value,projection:'owner-defined semantic_revision_envelope.current; full source retained separately'});
 const design=d1Result.value.assets.find(a=>a.candidate?.design)?.candidate.design;assert(design,'actual admitted Design');
 assert(design.commands.some(c=>c.executable===expectedD1.executable&&JSON.stringify(c.args)===JSON.stringify(expectedD1.args)),'D1 actually declares the prospectively selected application protocol');
 const d1Admission=selectAdmittedExecution(runtime.product,d1Result,'d1');
 d1Evidence=await authenticateExecutionEvidence(runtime.product,d1Admission,{expectedCommand:{...expectedD1,environment:protocolEnvironment},worksiteRoot:config.worksiteRoot,workspaceBinding:caller.refresh().workspaceBinding,phase:'d1',expectedInput:sourceRecords});
 await record('c2-evidence-custody.json',d1Evidence);await authenticateToolReceipt(d1Evidence,'d1');
 const inspected=await observeApplication('d1',d1Evidence);d1Observation=inspected.observation;d1QueryOutputs=inspected.outputs;d1Files=await tree(join(d1Evidence.sandboxRoot,'evidence/d1'));
 d1Application=new Map(await tree(config.worksiteRoot));
 phaseTag='d2';
 const incoming={'source/d2-input.json':Buffer.from(runtime.product.canonicalJson(amendmentRecords)+'\n'),'source/d2-rubric.md':await readFile(join(control,'D2_RUBRIC.md')),'source/d1-admitted-source.json':Buffer.from(runtime.product.canonicalJson({run:d1Result.run,invocation:{ref:firstExecution.call.invocation.invocationRef,digest:firstExecution.call.invocation.invocationDigest},terminal:{result:firstExecution.receipt.ownerOutput.value.terminalResult.result,producer:firstExecution.receipt.ownerOutput.value.terminalResult.producer},revisionEnvelope:d1Result.revisionEnvelope,projection:'semantic_revision_envelope.current',job:d1Result.value.basis,assets:d1Result.value.assets.map(a=>({assetRef:a.assetRef,assetDigest:a.assetDigest,stageRef:a.stageRef,assessmentDisposition:a.assessment?.disposition??null})),claim:'Exact new Public revision terminal and complete adverse revision history; current is an explicit projection, not replacement authority'})+'\n')};
 for(const [path,bytes] of Object.entries(incoming))await writeFile(join(config.worksiteRoot,path),bytes,{flag:'wx'});
 await record('incoming-amendment-custody.json',{afterD1Run:d1Result.run,afterD1Close:caller.state.closeHandoff,files:Object.entries(incoming).map(([path,bytes])=>({path,bytes:bytes.length,digest:S.digest(bytes)})),meaning:'New external task input only; no host implementation/configuration edit'});
 caller.acquire(caller.reopen());
 const applicationRows=await tree(join(config.worksiteRoot,'application'));assert(applicationRows.every(([,digest])=>!digest.startsWith('link:')),'Command dependencies must be regular files');
 const files=applicationRows.map(([p])=>'application/'+p).filter(p=>!p.includes('/target/'));
 const sourcePaths=inputs.sources.map(r=>r.relativePath).concat('source/d1-input.json','source/d2-input.json','source/d2-rubric.md','source/selection.md','source/d1-admitted-source.json');
 const command2=protocol.commands.d2;
 const state0=await d2Input({product:runtime.product,D,worksite:config.worksiteRoot,d1Output:d1Result.value,applicationFiles:files,commands:[command2],sourcePaths});
 const state=runtime.product.constructGovernanceWorkState({...state0.original,testing:{...state0.original.testing,allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence/d2'},...buildRoots.map(relativePath=>({pathKind:'subtree',relativePath}))]}});
 await record('input.json',state);await record('same-history-d1-source.json',{run:d1Result.run,prefix:caller.prefix(),source:'new admitted D1 revision current, with original04 adverse lineage retained'});
 await topology('before-dispatch');const second=await constructPhaseCall(caller,state,P,fixture,'d2');await record('prepared-call.json',second.call);
 await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'d2'});
 const execution=await R.invokeLifecycle(caller,installations,second.call,{...providerCredentials,...R.workerEnvironment(config)}),result=await readAndClose(execution);
 const terminal=result.value;assert.equal(terminal.kind,'governance_work_state');assert.equal(terminal.terminal,true);assert.deepEqual(terminal.unresolvedSupportRefs,[]);
 assert(terminal.reviewStanding.every(r=>!r.required||r.satisfied&&r.current));
 assert(terminal.observations.some(o=>o.purpose==='testing'&&o.value.commandResults?.every(r=>r.exitStatus===0)));
 assert.equal(terminal.observations.filter(o=>o.purpose==='uat').at(-1)?.value?.disposition,'satisfied');
 const d2Admission=selectAdmittedExecution(runtime.product,result,'d2');
 const d2Evidence=await authenticateExecutionEvidence(runtime.product,d2Admission,{expectedCommand:command2,worksiteRoot:config.worksiteRoot,workspaceBinding:caller.refresh().workspaceBinding,phase:'d2',expectedInput:amendmentRecords});
 await record('c2-evidence-custody.json',d2Evidence);await authenticateToolReceipt(d2Evidence,'d2');await observeApplication('d2',d2Evidence);
 const retainedD1=await authenticateExecutionEvidence(runtime.product,d1Admission,{expectedCommand:{...expectedD1,environment:protocolEnvironment},worksiteRoot:config.worksiteRoot,workspaceBinding:d1Evidence.workspaceBinding,phase:'d1',expectedInput:sourceRecords});
 assert.deepEqual(retainedD1,d1Evidence,'Original admitted D1 custody conserved');
 assert.deepEqual(await tree(join(d1Evidence.sandboxRoot,'evidence/d1')),d1Files,'Actual retained D1 durable evidence preserved');
 const oldQuery=await observeApplication('d1',d1Evidence);assert.deepEqual(oldQuery.observation,d1Observation);assert.deepEqual(oldQuery.outputs,d1QueryOutputs);
 const after=await tree(config.worksiteRoot);await record('worksite-after.json',after);
 const old=new Map(before),now=new Map(after),changes=[...new Set([...old.keys(),...now.keys()])].filter(p=>old.get(p)!==now.get(p));
 const allowed=[...applicationScopes,'semantic-assets','evidence',...buildRoots];
 const incomingPaths=Object.keys(incoming);for(const p of incomingPaths)assert.equal(now.get(p),S.digest(incoming[p]));
 const forbidden=changes.filter(p=>!incomingPaths.includes(p)&&!allowed.some(r=>p===r||p.startsWith(r+'/')));await record('conservation.json',{changes,forbidden});assert.deepEqual(forbidden,[]);
 assert(files.some(p=>now.get(p)!==d1Application.get(p)),'D2 needs actual changed application mapping/job, not relabelled Run');
 summary={...summary,status:'observed',sourceRun:closedSource.sourceRun,intakeRun:intakeResult.run,d1Run:d1Result.run,d2Run:result.run,limits:['Independent semantic review of impact/invalidation and all selected falsifier evidence is still required; process exit is not qualification']};
} catch(error){try{await record('failure-worksite-inventory.json',await tree(config.worksiteRoot));}catch(captureError){await record('failure-worksite-capture.json',{reason:String(captureError),retainedRoot:config.worksiteRoot});}summary={...summary,status:'failed',reason:String(error),boundary:error.stage??null};await record('FIRST_FAILURE.json',summary);process.exitCode=1;}
finally {
 if(caller?.state.resource)try{await record('final-close.json',caller.close(runtime.abg.selectHeldEventStoreDurablePrefix(caller.state.resource.store)));}
 catch(error){runtime.abg.abandonAbgEventResource(caller.state.resource);caller.state.resource=null;caller.state.selection=null;await record('abandon.json',{reason:String(error),closed:false});process.exitCode=1;summary.status='failed';}
 await record('SUMMARY.json',summary);console.log(JSON.stringify(summary));
}
