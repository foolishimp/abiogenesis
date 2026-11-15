// External test Operator only. Imports Product exclusively through package exports.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {populateAmendment,constructAmendmentCall} from './amendment-setup.mjs';
import {amendmentCoverage} from './coverage.mjs';
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
const root=join(b.rawRoot,'amendment');await mkdir(root);
const record=(path,value,raw=false)=>R.exclusiveRecord(root,path,value,raw);
const config={...b.configuration,sourceCommit:b.candidate.sourceCommit,runId:b.runId,
  package:{archivePath:b.candidate.archivePath,sha256:b.candidate.archiveSha256},
  archiveRoot:b.rawRoot,fixtureRoot:join(tenant,'test_env/fixtures/amendment-witness'),
  worksiteRoot:b.worksiteRoot,setupEnvironment:b.setupEnvironment,
  inheritEnvironment:[],toolchainEnvironment:b.setupEnvironment};
assert.equal(config.provider.enabled,true);
const executionDeadline=new Date(Date.parse(b.deadlineUtc)-b.exitAuditReserveMs).toISOString();
// Delegate command custody to the byte-identical accepted Python owner. The
// bridge inherits this host's group; its child has an explicit PID/group receipt.
async function command(label,executable,args,{cwd=root,environment=config.setupEnvironment,timeoutMs=config.processTimeoutMs,maxBytes=config.maxProcessOutputBytes}={}) {
  assert(/^[A-Za-z0-9_-]+$/.test(label));
  for(const key of config.provider.inheritEnvironment)assert(!Object.hasOwn(environment,key),'Credentials may reach only native worker environment');
  const folder=join(root,'commands',label);await mkdir(join(root,'commands'),{recursive:true});
  const job={folder,argv:[executable,...args],cwd,environment,deadlineUtc:executionDeadline,capMs:timeoutMs,maxBytes};
  const child=spawn(b.pythonPath,[join(control,'command-owner.py')],{cwd:root,env:{...config.setupEnvironment,PYTHONDONTWRITEBYTECODE:'1'},stdio:['pipe','pipe','pipe']});
  const out=[],err=[];let captured=0,truncated=false,launchError=null;
  const collect=target=>chunk=>{captured+=chunk.length;if(captured<=65536)target.push(chunk);else truncated=true;};
  child.stdout.on('data',collect(out));child.stderr.on('data',collect(err));child.on('error',e=>{launchError=String(e);});
  const closing=new Promise(resolve=>child.on('close',(exitCode,signal)=>resolve({exitCode,signal})));
  child.stdin.on('error',e=>{launchError??=String(e);});child.stdin.end(JSON.stringify(job));
  await record('commands/'+label+'.bridge-launch.json',{pid:child.pid??null,enclosingHostPid:process.pid,commandOwner:join(control,'command-owner.py'),deadlineUtc:executionDeadline});
  const closed=await closing;
  await record('commands/'+label+'.bridge-close.json',{...closed,launchError,truncated,captured});
  await record('commands/'+label+'.bridge.stdout',Buffer.concat(out),true);await record('commands/'+label+'.bridge.stderr',Buffer.concat(err),true);
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
let caller,summary={status:'incomplete',scenario:'amendment',qualified:false};
try {
  await record('run.json',{runId:b.runId,sourceCommit:b.candidate.sourceCommit,
    controlSourceCommit:b.controlSourceCommit,configuration:config,
    claim:'One ordinary installed Public amendment invocation; no qualification or scripted choice claim'});
  const definition=JSON.parse(await readFile(join(control,'PROCESS.json'),'utf8'));
  const amendment=JSON.parse(await readFile(join(config.fixtureRoot,'amendment-approval-threshold.json'),'utf8'));
  const oracle=JSON.parse(await readFile(join(control,'ORACLE.json'),'utf8'));
  await record('process-definition.json',definition);await record('amendment.json',amendment);await record('prospective-oracle.json',oracle);
  const probes=[['node',config.nodePath,['--version']],['npm',config.toolchains.npm.executable,config.toolchains.npm.versionArgs],
    ['provider',config.provider.command,config.provider.versionArgs??['--version']]];
  const observations=[];
  for(const [name,executable,args] of probes){const observed=await command('preflight-'+name,executable,args,{timeoutMs:20000});observations.push({name,...observed});assert.equal(observed.exitCode,0);}
  await record('preflight.json',{disposition:'ready',observations,providerReachability:'Version observed; no semantic provider dispatch yet'});
  const manifest=JSON.parse(await readFile(join(b.candidate.bootstrapPackageRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await P.verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,
    expectedArtifactDigest:config.package.sha256},record,'abg');
  caller=P.publicCaller({root,runtime,native,command,record,config});
  const {installations}=await populateAmendment(caller,{definition,A,D,P,tenant,packageRoot:b.candidate.bootstrapPackageRoot});
  const overlays={'review/ORACLE.json':'ORACLE.json','review/amendment-oracle.mjs':'oracle.mjs','review/baseline-rubric.md':'baseline-rubric.md'};
  for(const relativePath of definition.system.files) {
    const target=S.fixturePath(config.worksiteRoot,relativePath),bytes=await readFile(Object.hasOwn(overlays,relativePath)?join(control,overlays[relativePath]):S.fixturePath(join(config.fixtureRoot,'seed'),relativePath));
    await mkdir(new URL('.',pathToFileURL(target)),{recursive:true});await writeFile(target,bytes,{flag:'wx'});
  }
  const joined=await A.amendmentWitnessInput({processDefinition:definition,amendment,seedRoot:config.worksiteRoot,product:runtime.product});
  const input=joined.state;
  assert.deepEqual(joined.derivation.writeRoots,oracle.writePaths,'Only prospectively declared amendment writes');
  await record('amendment-derivation.json',joined.derivation);
  const before=await tree(config.worksiteRoot);await record('worksite-before.json',before);
  async function observeLayout(phase) {
    assert.equal(S.digest(await readFile(join(control,'physical-topology.py'))),'sha256:eb5d0028cf7cb27d233c4512a57882785698c301ba83575396c3fc9eb045fc31');
    const environment=caller.refresh(),binding=environment.workspaceBinding;
    const roots=Object.values(binding.roots);assert(roots.every(value=>typeof value==='string'));
    const installRoots=environment.productInstalls.map(row=>row.installedRoot);assert.equal(installRoots.length,2);
    const writes=[...new Set([...Object.values(input.original.workOrders).flatMap(order=>order.writeRoots),
      ...input.original.testing.allowedWriteTerritories.map(row=>row.relativePath)])].map(path=>S.fixturePath(config.worksiteRoot,path));
    const layout={worksite:config.worksiteRoot,writePaths:writes,
      protectedRoots:[...new Set([...roots,...installRoots,b.candidate.bootstrapPackageRoot,b.candidate.archivePath,b.controlSourceRoot,control,b.smokeSourceRoot,b.rawRoot,...b.protectedRoots])].sort(),archiveRoot:b.rawRoot};
    const layoutPath=await record('topology-'+phase+'.layout.json',{...layout});
    const observed=await command('topology-'+phase,b.pythonPath,[join(control,'physical-topology.py'),layoutPath],{timeoutMs:60000,maxBytes:4194304});
    assert.equal(observed.exitCode,0);const value=JSON.parse(observed.stdout);
    await record('topology-'+phase+'.observation.json',{layout,bindingId:binding.bindingId??null,installRoots,observed:value,at:new Date().toISOString()});
    assert.equal(value.ok,true);assert.equal(value.disposition,'separated');
  }
  await observeLayout('after-setup');
  // Initial counterevidence must arrive through the declared Testing owner.
  await record('original-input.json',input);
  const prepared=await constructAmendmentCall(caller,input,P);
  await record('prepared-definition-call.json',prepared.call);
  await observeLayout('before-dispatch');
  await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'native-start-call'});
  // The maintained invocation scope installs this environment only across the
  // native call and restores the credential-free ambient environment in finally.
  const execution=await R.invokeLifecycle(caller,installations,prepared.call,{...providerCredentials,...R.workerEnvironment(config)});
  const events=await R.readOracleEvents(runtime.abg,caller.prefix(),record);
  const held=await R.heldReadbacks(caller,execution);await record('held-readback.json',R.freshReadbackRecord(held,runtime.product.sha256Canonical));
  await record('session-close.json',caller.close());
  const fresh=await R.freshReadbacks(caller,execution);await record('fresh-readback.json',R.freshReadbackRecord(fresh,runtime.product.sha256Canonical));
  for(const read of fresh)assert.deepEqual(read.ownerOutput,held.find(r=>r.memberKey===read.memberKey)?.ownerOutput);
  const after=await tree(config.worksiteRoot);await record('worksite-after.json',after);
  const old=new Map(before),now=new Map(after);
  const changes=[...new Set([...old.keys(),...now.keys()])].filter(p=>old.get(p)!==now.get(p)).sort();
  // The amendment derivation declares five concrete file outputs.
  const writes=[...new Set(Object.values(input.original.workOrders).flatMap(o=>o.writeRoots))]
    .map(relativePath=>({pathKind:'file',relativePath})).concat(input.original.testing.allowedWriteTerritories);
  const archive=caller.state.environment.workspaceBinding.roots.archiveRoot;
  const archiveRelative=relative(config.worksiteRoot,archive);
  const insideArchive=!isAbsolute(archiveRelative)&&archiveRelative!==''&&archiveRelative!=='..'&&!archiveRelative.startsWith('../');
  const inRoots=(p,roots)=>roots.some(r=>p===r||p.startsWith(r+'/'));
  const permitted=p=>writes.some(r=>p===r.relativePath||r.pathKind==='subtree'&&p.startsWith(r.relativePath+'/'));
  const forbidden=changes.filter(p=>!permitted(p)&&!(insideArchive&&inRoots(p,[archiveRelative])));
  await record('worksite-file-link-conservation.json',{changes,writes,archive,forbidden,
    measured:'Regular-file bytes and symbolic-link targets, including entry additions/removals; directory metadata, modes, ownership and timestamps are not compared.'});assert.deepEqual(forbidden,[]);
  for(const source of input.original.sources)assert.equal(S.digest(await readFile(S.fixturePath(config.worksiteRoot,source.path))),source.digest);
  const finalObservation=await command('final-amendment-oracle',config.nodePath,[join(control,'oracle.mjs'),config.worksiteRoot,'final'],{timeoutMs:20000});
  assert.equal(finalObservation.exitCode,0);await record('final-application-observation.json',JSON.parse(finalObservation.stdout));
  const coverage=amendmentCoverage(events,input,oracle);await record('amendment-coverage.json',coverage);
  await record('initial-counterevidence.json',{provenance:'admitted C2 Testing',observations:coverage.initialCounterevidence});
  await record('actor-calls.json',await A.summarizeActorCalls(events));
  const receipt=execution.receipt,terminal=receipt.ownerOutput.value?.terminalResult?.value;
  assert.equal(receipt.exitCode,0);assert.equal(receipt.ownerOutput.outcomeKind,'result');
  assert.equal(terminal?.kind,'governance_work_state');assert.equal(terminal.terminal,true);assert.deepEqual(terminal.unresolvedSupportRefs,[]);
  assert(terminal.reviewStanding?.every(row=>!row.required||row.satisfied&&row.current),'Required current satisfied reviews');
  const acceptance=terminal.observations.filter(row=>row.purpose==='uat').at(-1);assert.equal(acceptance?.value?.disposition,'satisfied');
  const testing=terminal.observations.filter(row=>row.purpose==='testing').at(-1);assert(testing?.value?.commandResults?.length>0&&testing.value.commandResults.every(row=>row.exitStatus===0),'Actual admitted final Testing');
  assert.equal(coverage.status,'observed','Amendment succeeded but selected correction/currentness coverage remains unobserved; no automatic retry');
  assert.equal(fresh.length,2);assert(fresh.every(r=>r.ownerOutput.outcomeKind==='result'));
  assert.equal(fresh.find(r=>r.memberKey==='run_replay')?.projection?.status,'closed');
  summary={...summary,status:'passed',uatPass:true};
} catch(error) {
  summary={...summary,status:'failed',reason:String(error),boundary:error.stage??null,observation:error.observation??null};
  await record('failure.json',summary);process.exitCode=1;
} finally {
  const held=caller?.state.resource;
  if(held)try{await record('session-close.json',caller.close(runtime.abg.selectHeldEventStoreDurablePrefix(held.store)));}
  catch(error){runtime.abg.abandonAbgEventResource(held);caller.state.resource=null;caller.state.selection=null;
    await record('session-abandon.json',{reason:String(error),completedClose:false});process.exitCode=1;summary.status='failed';}
  if(caller?.state.closeHandoff)await record('final-close-handoff.json',caller.state.closeHandoff);
  await record('summary.json',summary);await record('SEALED.json',{at:new Date().toISOString(),...summary,retained:true});
  console.log(JSON.stringify(summary));
}
