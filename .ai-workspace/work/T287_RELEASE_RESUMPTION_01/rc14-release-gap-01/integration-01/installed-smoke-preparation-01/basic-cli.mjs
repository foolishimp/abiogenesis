// External test Operator only. Imports Product exclusively through package exports.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile,readdir,lstat,readlink} from 'node:fs/promises';
import {join,relative,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';

const b=JSON.parse(await readFile(process.argv[2],'utf8'));
assert.equal(b.executionAuthorized,true,'Root must separately authorize execution');
const tenant=join(b.controlSourceRoot,'build_tenants/abiogenesis/typescript');
const load=path=>import(pathToFileURL(join(tenant,path)).href);
const R=await load('test_env/uat/runner.mjs'), S=await load('test_env/uat/scenarios.mjs');
const P=await load('test_env/uat/public-setup.mjs'), C=await load('test_env/uat/consumer.mjs');
const root=join(b.rawRoot,'basic-cli');await mkdir(root);
const record=(path,value,raw=false)=>R.exclusiveRecord(root,path,value,raw);
const config={...b.configuration,sourceCommit:b.candidate.sourceCommit,runId:b.runId,
  package:{archivePath:b.candidate.archivePath,sha256:b.candidate.archiveSha256},
  archiveRoot:b.rawRoot,fixtureRoot:join(tenant,'test_env/fixtures/sandbox-uat'),
  worksiteRoot:join(root,'sandbox/worksite'),setupEnvironment:b.setupEnvironment,
  inheritEnvironment:[],toolchainEnvironment:b.setupEnvironment};
assert.equal(config.provider.enabled,true);
const command=R.commandRecorder(root,{environment:config.setupEnvironment,
  timeoutMs:config.processTimeoutMs,maxOutputBytes:config.maxProcessOutputBytes});
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
  const ready=await R.preflight(config,[row],root);await record('preflight.json',ready);
  assert.equal(ready.disposition,'ready');
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
  const prepared=await P.constructLifecycleCall(caller,input);
  await record('prepared-definition-call.json',prepared.call);
  await record('dispatch.json',{at:new Date().toISOString(),provider:config.provider,phase:'native-start-call'});
  const execution=await R.invokeLifecycle(caller,installations,prepared.call,R.workerEnvironment(config));
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
  await record('whole-worksite-conservation.json',{changes,writes,archive,forbidden});assert.deepEqual(forbidden,[]);
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
