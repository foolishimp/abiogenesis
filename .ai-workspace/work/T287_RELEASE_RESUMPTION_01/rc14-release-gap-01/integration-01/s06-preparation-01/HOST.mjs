// External test Operator only. Imports Product exclusively through package exports.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {populateS06,constructPhaseCall} from './setup.mjs';
import {d1Input,d2Input,sourceRecords,amendmentRecords,witnessCommand,applicationScopes} from './inputs.mjs';

import {readFile,mkdir,writeFile,readdir,lstat,readlink} from 'node:fs/promises';
import {join,relative,isAbsolute} from 'node:path';
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
const control=fileURLToPath(new URL('.',import.meta.url));
const tenant=join(b.controlSourceRoot,'build_tenants/abiogenesis/typescript');
const load=path=>import(pathToFileURL(join(tenant,path)).href);
const R=await load('test_env/uat/runner.mjs'), S=await load('test_env/uat/scenarios.mjs');
const P=await load('test_env/uat/public-setup.mjs');
const A=await load('test_env/support/amendment-witness.mjs'),D=await load('test_env/support/default-library.mjs');
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
let caller,summary={status:'incomplete',scenario:'s06-d1-d2',qualified:false};
try {
 await R.exclusiveRecord(root,'run.json',{runId:b.runId,candidate:b.candidate,controlSourceCommit:b.controlSourceCommit,claim:'Fresh Public D1 then real D2; imported source is not historical runtime evidence'});
 const inputs=JSON.parse(await readFile(join(control,'INPUTS.json'),'utf8'));
 for(const tool of [['node',config.nodePath,['--version']],['npm',config.toolchains.npm.executable,['--version']],['java',b.application.java,['-version']],['provider',config.provider.command,['--version']]]){
  const [name,exe,args]=tool;const value=await command('preflight-'+name,exe,args,{timeoutMs:20000});assert.equal(value.exitCode,0);
 }
 const nativeDeclarations=await import(pathToFileURL(inputs.declarations.find(r=>r.path.endsWith('/native-lifecycle-declarations.mjs')).path).href);
 const manifest=JSON.parse(await readFile(join(b.candidate.bootstrapPackageRoot,'product-toolchain-manifest.json'),'utf8'));
 const native=await P.verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,expectedArtifactDigest:config.package.sha256},record,'abg');
 caller=P.publicCaller({root,runtime,native,command,record,config});
 const {fixture,installations}=await populateS06(caller,{D,P,nativeDeclarations,tenant,packageRoot:b.candidate.bootstrapPackageRoot});
 // Fresh imported source bytes only, after successful Public workspace create.
 for(const row of [...inputs.sources,...inputs.application]) {
  const bytes=await readFile(row.path);assert.equal(S.digest(bytes),'sha256:'+row.sha256);
  const target=join(config.worksiteRoot,row.relativePath);await mkdir(new URL('.',pathToFileURL(target)),{recursive:true});await writeFile(target,bytes,{flag:'wx'});
 }
 await writeFile(join(config.worksiteRoot,'source/d1-input.json'),runtime.product.canonicalJson(sourceRecords)+'\n',{flag:'wx'});
 await writeFile(join(config.worksiteRoot,'source/selection.md'),await readFile(join(control,'SELECTION.md')),{flag:'wx'});
 await writeFile(join(config.worksiteRoot,'source/lifecycle-rubric.json'),runtime.product.canonicalJson(fixture.lifecycle)+'\n',{flag:'wx'});
 const before=await tree(config.worksiteRoot);await record('worksite-before.json',before);
 async function topology(label) {
  const env=caller.refresh(),roots=[...Object.values(env.workspaceBinding.roots),...env.productInstalls.map(i=>i.installedRoot)];
  const layout={worksite:config.worksiteRoot,writePaths:['application','semantic-assets','evidence'].map(p=>join(config.worksiteRoot,p)),protectedRoots:[...new Set([...roots,b.candidate.bootstrapPackageRoot,b.candidate.archivePath,b.controlSourceRoot,control,b.rawRoot,...b.protectedRoots])].sort(),archiveRoot:b.rawRoot};
  const path=await record('topology-'+label+'.layout.json',layout);
  const result=await command('topology-'+label,b.pythonPath,[join(control,'physical-topology.py'),path],{timeoutMs:60000,maxBytes:4194304});
  const observation=JSON.parse(result.stdout);await record('topology-'+label+'.json',observation);assert.equal(observation.ok,true);assert.equal(observation.disposition,'separated');
 }
 await topology('after-setup');
 const buildRoots=['target','project/target','project/project/target',...['core','compiler','executor','adjoint','accounting','assurance','fidelity','engine'].map(n=>'cdme-'+n+'/target')].map(p=>'application/scala_spark/'+p);
 const protocolEnvironment={JAVA_HOME:b.application.javaHome,PATH:b.application.path};
 const capabilities=[{executable:config.nodePath,relativeCwdRoots:['.'],environment:{JAVA_HOME:b.application.javaHome,PATH:b.application.path},maxTimeoutMs:b.application.commandTimeoutMs,maxTerminationGraceMs:10000}];
 const initial=await d1Input({product:runtime.product,gtl:runtime.gtl,lifecycle:fixture.lifecycle,inputs,worksite:config.worksiteRoot,capabilities,limits:{inactivityTimeoutMs:config.provider.inactivityTimeoutMs,absoluteTimeoutMs:config.provider.absoluteTimeoutMs}});
 const d1=runtime.product.constructSemanticJobInput({...initial,taskData:{...initial.taskData,witnessCommands:{d1:{...witnessCommand(config.nodePath,'d1',b.application.commandTimeoutMs),environment:protocolEnvironment},d2:{...witnessCommand(config.nodePath,'d2',b.application.commandTimeoutMs),environment:protocolEnvironment}}},worksiteScope:{...initial.worksiteScope,evidenceWriteRoots:['evidence',...buildRoots]}});
 // The fixed prospective command protocol is an ordinary task constraint;
 // native Design must select it in its own admitted plan.
 const expectedD1=witnessCommand(config.nodePath,'d1',b.application.commandTimeoutMs);
 await record('declared-command-protocol.json',{d1:expectedD1,d2:witnessCommand(config.nodePath,'d2',b.application.commandTimeoutMs)});
 let d1Result,d1Observation,d1QueryOutputs,d1Files,d1Application; 
 async function readAndClose(execution) {
  const events=await R.readOracleEvents(runtime.abg,caller.prefix(),record),held=await R.heldReadbacks(caller,execution);
  await record('held-readback.json',R.freshReadbackRecord(held,runtime.product.sha256Canonical));await record('session-close.json',caller.close());
  const fresh=await R.freshReadbacks(caller,execution);await record('fresh-readback.json',R.freshReadbackRecord(fresh,runtime.product.sha256Canonical));
  assert.equal(fresh.length,2);for(const r of fresh)assert.deepEqual(r.ownerOutput,held.find(x=>x.memberKey===r.memberKey)?.ownerOutput);
  assert.equal(fresh.find(r=>r.memberKey==='run_replay')?.projection?.status,'closed');
  await record('actor-calls.json',await A.summarizeActorCalls(events));
  assert.equal(execution.receipt.exitCode,0);assert.equal(execution.receipt.ownerOutput.outcomeKind,'result');
  return {events,value:execution.receipt.ownerOutput.value.terminalResult.value,run:execution.receipt.resources.run};
 }
 async function observeApplication(phase) {
  const result=await command('application-oracle-'+phase,b.pythonPath,[join(control,'observe.py'),config.worksiteRoot,phase,inputs.oracle.path,inputs.scalaRuntime.sha256],{timeoutMs:60000});
  const observation=JSON.parse(result.stdout);await record('application-'+phase+'.json',observation);assert.equal(observation.passed,true);
  const q=observation.query,outputs=[];
  for(let i=0;i<2;i++){
   const value=await command('fresh-query-'+phase+'-'+i,b.application.java,['-cp',q.classpath.join(':'),q.main,'query',q.runRoot,...q.queries],{cwd:root,environment:{PATH:b.application.path,LANG:'en_US.UTF-8',LC_ALL:'C'},timeoutMs:30000});
   outputs.push(value.stdout);assert.equal(value.exitCode,0);
  }
  await record('fresh-query-'+phase+'.json',{outputs,observation});assert.equal(outputs[0],outputs[1]);
  assert(outputs[0].includes('output:src-101 -> found=true')&&outputs[0].includes('sourceKeys=[src-101]'));
  assert(outputs[0].includes('filtered:src-102 -> found=true')&&outputs[0].includes('conditionId=include-true'));
  assert(outputs[0].includes('error:src-103 -> found=true')&&outputs[0].includes('not-an-integer')&&outputs[0].includes('failedConstraint=cast:integer'));
  const after=await command('application-oracle-'+phase+'-after',b.pythonPath,[join(control,'observe.py'),config.worksiteRoot,phase,inputs.oracle.path,inputs.scalaRuntime.sha256],{timeoutMs:60000});
  assert.deepEqual(JSON.parse(after.stdout),observation,'query-only actual input conservation');return {observation,outputs};
 }
 phaseTag='d1';await record('input.json',d1);await topology('before-dispatch');
 const first=await constructPhaseCall(caller,d1,P,fixture,'d1');await record('prepared-call.json',first.call);
 await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'d1'});
 const firstExecution=await R.invokeLifecycle(caller,installations,first.call,{...providerCredentials,...R.workerEnvironment(config)});
 d1Result=await readAndClose(firstExecution);assert(runtime.product.isSemanticJobEnvelope(d1Result.value),'actual admitted semantic envelope');
 const design=d1Result.value.assets.find(a=>a.candidate?.design)?.candidate.design;assert(design,'actual admitted Design');
 assert(design.commands.some(c=>c.executable===expectedD1.executable&&JSON.stringify(c.args)===JSON.stringify(expectedD1.args)),'D1 actually declares the prospectively selected application protocol');
 const inspected=await observeApplication('d1');d1Observation=inspected.observation;d1QueryOutputs=inspected.outputs;d1Files=await tree(join(config.worksiteRoot,'evidence/d1'));
 d1Application=new Map(await tree(config.worksiteRoot));
 phaseTag='d2';
 const incoming={'source/d2-input.json':Buffer.from(runtime.product.canonicalJson(amendmentRecords)+'\n'),'source/d2-rubric.md':await readFile(join(control,'D2_RUBRIC.md')),'source/d1-admitted-source.json':Buffer.from(runtime.product.canonicalJson({run:d1Result.run,invocation:{ref:firstExecution.call.invocation.invocationRef,digest:firstExecution.call.invocation.invocationDigest},terminal:{result:firstExecution.receipt.ownerOutput.value.terminalResult.result,producer:firstExecution.receipt.ownerOutput.value.terminalResult.producer},job:d1Result.value.basis,assets:d1Result.value.assets.map(a=>({assetRef:a.assetRef,assetDigest:a.assetDigest,stageRef:a.stageRef,assessmentDisposition:a.assessment?.disposition??null})),claim:'Fresh Public-admitted D1 coordinates only; historical proof is not imported and this projection is not new runtime authority'})+'\n')};
 for(const [path,bytes] of Object.entries(incoming))await writeFile(join(config.worksiteRoot,path),bytes,{flag:'wx'});
 await record('incoming-amendment-custody.json',{afterD1Run:d1Result.run,afterD1Close:caller.state.closeHandoff,files:Object.entries(incoming).map(([path,bytes])=>({path,bytes:bytes.length,digest:S.digest(bytes)})),meaning:'New external task input only; no host implementation/configuration edit'});
 caller.acquire(caller.reopen());
 const files=(await tree(join(config.worksiteRoot,'application'))).map(([p])=>'application/'+p).filter(p=>!p.includes('/target/'));
 const sourcePaths=inputs.sources.map(r=>r.relativePath).concat('source/d1-input.json','source/d2-input.json','source/d2-rubric.md','source/selection.md','source/d1-admitted-source.json');
 const command2={...witnessCommand(config.nodePath,'d2',b.application.commandTimeoutMs),environment:{JAVA_HOME:b.application.javaHome,PATH:b.application.path}};
 const state0=await d2Input({product:runtime.product,D,worksite:config.worksiteRoot,d1Output:d1Result.value,applicationFiles:files,commands:[command2],sourcePaths});
 const state=runtime.product.constructGovernanceWorkState({...state0.original,testing:{...state0.original.testing,allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence/d2'},...buildRoots.map(relativePath=>({pathKind:'subtree',relativePath}))]}});
 await record('input.json',state);await record('same-history-d1-source.json',{run:d1Result.run,prefix:caller.prefix(),source:'fresh admitted D1 in this session, not historical import'});
 await topology('before-dispatch');const second=await constructPhaseCall(caller,state,P,fixture,'d2');await record('prepared-call.json',second.call);
 await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'d2'});
 const execution=await R.invokeLifecycle(caller,installations,second.call,{...providerCredentials,...R.workerEnvironment(config)}),result=await readAndClose(execution);
 const terminal=result.value;assert.equal(terminal.kind,'governance_work_state');assert.equal(terminal.terminal,true);assert.deepEqual(terminal.unresolvedSupportRefs,[]);
 assert(terminal.reviewStanding.every(r=>!r.required||r.satisfied&&r.current));
 assert(terminal.observations.some(o=>o.purpose==='testing'&&o.value.commandResults?.every(r=>r.exitStatus===0)));
 assert.equal(terminal.observations.filter(o=>o.purpose==='uat').at(-1)?.value?.disposition,'satisfied');
 await observeApplication('d2');assert.deepEqual(await tree(join(config.worksiteRoot,'evidence/d1')),d1Files,'D1 durable evidence preserved');
 const oldQuery=await observeApplication('d1');assert.deepEqual(oldQuery.observation,d1Observation);assert.deepEqual(oldQuery.outputs,d1QueryOutputs);
 const after=await tree(config.worksiteRoot);await record('worksite-after.json',after);
 const old=new Map(before),now=new Map(after),changes=[...new Set([...old.keys(),...now.keys()])].filter(p=>old.get(p)!==now.get(p));
 const allowed=[...applicationScopes,'semantic-assets','evidence',...buildRoots];
 const incomingPaths=Object.keys(incoming);for(const p of incomingPaths)assert.equal(now.get(p),S.digest(incoming[p]));
 const forbidden=changes.filter(p=>!incomingPaths.includes(p)&&!allowed.some(r=>p===r||p.startsWith(r+'/')));await record('conservation.json',{changes,forbidden});assert.deepEqual(forbidden,[]);
 assert(files.some(p=>now.get(p)!==d1Application.get(p)),'D2 needs actual changed application mapping/job, not relabelled Run');
 summary={...summary,status:'observed',d1Run:d1Result.run,d2Run:result.run,limits:['Independent semantic review of impact/invalidation and all selected falsifier evidence is still required; process exit is not qualification']};
} catch(error){try{await record('failure-worksite-inventory.json',await tree(config.worksiteRoot));}catch(captureError){await record('failure-worksite-capture.json',{reason:String(captureError),retainedRoot:config.worksiteRoot});}summary={...summary,status:'failed',reason:String(error),boundary:error.stage??null};await record('FIRST_FAILURE.json',summary);process.exitCode=1;}
finally {
 if(caller?.state.resource)try{await record('final-close.json',caller.close(runtime.abg.selectHeldEventStoreDurablePrefix(caller.state.resource.store)));}
 catch(error){runtime.abg.abandonAbgEventResource(caller.state.resource);caller.state.resource=null;caller.state.selection=null;await record('abandon.json',{reason:String(error),closed:false});process.exitCode=1;summary.status='failed';}
 await record('SUMMARY.json',summary);console.log(JSON.stringify(summary));
}
