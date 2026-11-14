// External test Operator only. Imports Product exclusively through package exports.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
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
const P=await load('test_env/uat/public-setup.mjs'), C=await load('test_env/uat/consumer.mjs');
const root=join(b.rawRoot,'basic-cli');await mkdir(root);
const record=(path,value,raw=false)=>R.exclusiveRecord(root,path,value,raw);
const config={...b.configuration,sourceCommit:b.candidate.sourceCommit,runId:b.runId,
  package:{archivePath:b.candidate.archivePath,sha256:b.candidate.archiveSha256},
  archiveRoot:b.rawRoot,fixtureRoot:join(tenant,'test_env/fixtures/sandbox-uat'),
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
const require=createRequire(pathToFileURL(join(b.candidate.bootstrapPackageRoot,'package.json')));
const runtime={};
for(const [name,key] of [['product','product'],['abg','abg'],['gtl','gtl'],['validator','validator'],['public','api']]) {
  const entry=require.resolve('@abiogenesis/typescript-tenant/'+name);
  const rel=relative(b.candidate.bootstrapPackageRoot,entry);
  assert(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'),'foreign package export');
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
let caller,summary={status:'incomplete',scenario:'basic-cli',qualified:false};
try {
  await record('run.json',{runId:b.runId,sourceCommit:b.candidate.sourceCommit,
    controlSourceCommit:b.controlSourceCommit,configuration:config,
    claim:'First fresh ordinary installed Public basic-cli composition; not qualification'});
  const fixtures=await S.loadScenarios(config.fixtureRoot);
  const [row]=S.selectScenarios(fixtures.rows,{caseKey:'basic-cli'});
  const selected=await S.acquireScenario(fixtures.root,row);
  const snapshot=await S.snapshotScenario(fixtures,selected,root);await record('oracle-acquisition.json',snapshot);
  // Same selected version probes as maintained preflight, through the retained
  // finite owner. No provider credential is forwarded to these probes.
  const probes=[['node',config.nodePath,['--version']],...['npm',...(row.toolchainObligations.requiredExecutables??[]).filter(x=>x!=='node'&&x!=='npm')].map(name=>[name,config.toolchains[name].executable,config.toolchains[name].versionArgs]),
    ['provider',config.provider.command,config.provider.versionArgs??['--version']]];
  const observations=[];
  for(const [name,executable,args] of probes){const observed=await command('preflight-'+name,executable,args,{timeoutMs:20000});observations.push({name,...observed});assert.equal(observed.exitCode,0);}
  await record('preflight.json',{disposition:'ready',observations,providerReachability:'Version observed; no semantic provider dispatch yet'});
  const manifest=JSON.parse(await readFile(join(b.candidate.bootstrapPackageRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await P.verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,
    expectedArtifactDigest:config.package.sha256},record,'abg');
  caller=P.publicCaller({root,runtime,native,command,record,config});
  const {installations}=await P.populateSandbox(caller,{retain:true});
  for(const source of selected.sources) {
    const path=S.fixturePath(config.worksiteRoot,source.path);
    await mkdir(new URL('.',pathToFileURL(path)),{recursive:true});
    await writeFile(path,source.bytes,{flag:'wx'});
  }
  const before=await tree(config.worksiteRoot);await record('worksite-before.json',before);
  const input=S.constructWorkloadInput(runtime.product,selected,C.assessmentSelection,config.toolchains);
  async function observeLayout(phase) {
    assert.equal(S.digest(await readFile(join(control,'physical-topology.py'))),'sha256:eb5d0028cf7cb27d233c4512a57882785698c301ba83575396c3fc9eb045fc31');
    const environment=caller.refresh(),binding=environment.workspaceBinding;
    const roots=Object.values(binding.roots);assert(roots.every(value=>typeof value==='string'));
    const installRoots=environment.productInstalls.map(row=>row.installedRoot);assert.equal(installRoots.length,2);
    const writes=[...new Set([...Object.values(input.original.workOrders).flatMap(order=>order.writeRoots),
      ...input.original.testing.allowedWriteTerritories.map(row=>row.relativePath)])].map(path=>S.fixturePath(config.worksiteRoot,path));
    const layout={worksite:config.worksiteRoot,writePaths:writes,
      protectedRoots:[...new Set([...roots,...installRoots,b.candidate.bootstrapPackageRoot,b.candidate.archivePath,b.controlSourceRoot,b.rawRoot,...b.protectedRoots])].sort(),archiveRoot:b.rawRoot};
    const layoutPath=await record('topology-'+phase+'.layout.json',{...layout});
    const observed=await command('topology-'+phase,b.pythonPath,[join(control,'physical-topology.py'),layoutPath],{timeoutMs:60000,maxBytes:4194304});
    assert.equal(observed.exitCode,0);const value=JSON.parse(observed.stdout);
    await record('topology-'+phase+'.observation.json',{layout,bindingId:binding.bindingId??null,installRoots,observed:value,at:new Date().toISOString()});
    assert.equal(value.ok,true);assert.equal(value.disposition,'separated');
  }
  await observeLayout('after-setup');
  const prepared=await P.constructLifecycleCall(caller,input);
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
  // The acquired basic-cli work orders declare seven concrete file outputs.
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
  for(const source of selected.sources)assert.equal(S.digest(await readFile(S.fixturePath(config.worksiteRoot,source.path))),source.digest);
  const archived=await S.acquireArchivedScenario(snapshot);
  const oracle=await import(pathToFileURL(S.fixturePath(snapshot.root,archived.row.oracleModule)).href);
  const owner=R.commandObservationOwner(runtime.product,execution);
  const relation=runtime.product.resolveWorksiteCommandExecutionJudgmentRelation(runtime.product.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
  assert(relation,'published C2 judgment relation required');
  const judged=await oracle.evaluate({worksiteRoot:config.worksiteRoot,runArchive:root,commands:caller.state.calls,events,
    source:archived.row,request:{...selected.request,testing:input.original.testing},observationOwner:owner,
    validateObservation:o=>relation.evaluate(o.task,o)});
  await record('independent-oracle.json',judged);
  const receipt=execution.receipt,terminal=receipt.ownerOutput.value?.terminalResult?.value;
  assert.equal(receipt.exitCode,0);assert.equal(receipt.ownerOutput.outcomeKind,'result');
  assert.equal(terminal?.kind,'governance_work_state');assert.equal(terminal.terminal,true);assert.deepEqual(terminal.unresolvedSupportRefs,[]);
  assert(['satisfied'].includes(judged.disposition??judged.status));
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
