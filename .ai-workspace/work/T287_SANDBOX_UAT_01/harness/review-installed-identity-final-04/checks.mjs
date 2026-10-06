// Independent, bounded caller-order controls. Checker outputs and invocation
// are controlled doubles; the retained actual Public-owner physical probe is
// separately authenticated. No installed payload, native Run or provider call
// is changed or executed by this script.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const reviewRoot=dirname(fileURLToPath(import.meta.url));
const repoRoot=fileURLToPath(new URL('../../../../../',import.meta.url));
const harnessRoot=join(repoRoot,'.ai-workspace/work/T287_SANDBOX_UAT_01/harness');
const tenantRoot=join(repoRoot,'build_tenants/abiogenesis/typescript');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
async function verifyFile(path,expected,byteCount) {
  const bytes=await readFile(path);
  assert.equal(sha(bytes),expected,path+' digest');
  if(byteCount!==undefined)assert.equal(bytes.length,byteCount,path+' size');
  return bytes;
}
const freezeSHA256='22c8e8e3e144eee5bcf5eedfac47703829ca459f3c9c98a8a82643a219cf6382';
const workerReturnSHA256='34ae388e0fb2654e68dfac15fa98b4990feb3eb9f6b8973d7b9d96ac0f135fb4';
const freeze=JSON.parse(await verifyFile(join(harnessRoot,'freeze-installed-identity-04.json'),freezeSHA256));
await verifyFile(join(harnessRoot,'return-installed-identity-04.md'),workerReturnSHA256);
const subjectPins=[...freeze.sources,...freeze.evidence,...freeze.retainedEvidence];
async function verifySubject() {
  for(const pin of subjectPins)await verifyFile(join(repoRoot,pin.path),pin.sha256,pin.bytes);
}
await verifySubject();
assert.equal(freeze.sources.filter(pin=>pin.changed).length,3);

const snapshotRoot=join(harnessRoot,'review-oracle-snapshot-03');
const snapshotFreeze=JSON.parse(await verifyFile(join(snapshotRoot,'freeze.json'),
  '3370bf81cb6d2e4b2b8864dbe8fc7112db3194ba01e860a20c24573de067b6da'));
for(const member of snapshotFreeze.members)await verifyFile(join(snapshotRoot,member.path),member.digest.slice(7),member.byteCount);
const snapshotEvidence=await readJson(join(snapshotRoot,'checks.json'));
assert.equal(snapshotEvidence.disposition,'satisfied');
assert.equal(snapshotEvidence.checks.length,14);
assert.equal(snapshotEvidence.checks.filter(row=>row.id.startsWith('archive-local-selected-case-')).every(row=>row.disposition!=='satisfied'),true);

const physicalEvidence=await readJson(join(harnessRoot,'review-installed-identity-04/checks.json'));
assert.equal(physicalEvidence.disposition,'satisfied_controlled_physical_checker_discriminator');
assert.equal(physicalEvidence.trustedBootstrapUnchanged,true);
assert.equal(physicalEvidence.originalInstalledChecks.length,2);
assert.equal(physicalEvidence.originalInstalledChecks.every(row=>row.unchanged),true);
assert.equal(physicalEvidence.controlledCopyChecks.find(row=>row.phase==='payload-changed').contentMatches,false);
assert.equal(physicalEvidence.controlledCopyChecks.find(row=>row.phase==='extra-payload-member').contentMatches,false);
assert.equal(physicalEvidence.genuineArchiveRunOrCCallEvents,0);

const archive=join(tenantRoot,'test_env/test_runs/sandbox-uat/basic-cli/2026-10-06T00-49-50-139Z-5971a701-5228-4d17-99c2-e7173098f44c');
const setup=await readJson(join(archive,'setup-identity.json'));
const installations=setup.installations;
assert.equal(installations.length,2);
assert.deepEqual(installations.map(row=>row.packageName),['@abiogenesis/typescript-tenant','@abi5-tests/sandbox-uat']);
assert.notEqual(installations[0].installedRoot,installations[1].installedRoot);
const run=await readJson(join(archive,'run.json'));
const summary=await readJson(join(archive,'summary.json'));
assert.equal(summary.status,'prepared');assert.equal(summary.uatPass,false);
assert.equal(typeof run.sourceCommit,'string');assert.ok(run.sourceCommit.trim());
await verifyFile(run.configuration.package.archivePath,freeze.unchangedCandidateArchiveSHA256);
const close=await readJson(join(archive,'final-close-handoff.json'));
const eventBytes=await verifyFile(fileURLToPath(close.prefix.eventLogRef),close.prefix.prefixDigest.slice(7),close.prefix.prefixLength);
const events=eventBytes.toString('utf8').trim().split('\n').map(line=>JSON.parse(line));
assert.equal(events.filter(event=>/^run_|^c_call_/u.test(event.kind)).length,0);
assert.equal(events.filter(event=>event.kind==='public_operation_artifact_admitted').length,3);

const runnerPath=join(tenantRoot,'test_env/uat/runner.mjs');
const runner=await readFile(runnerPath,'utf8');
const flow=runner.slice(runner.indexOf('export async function runScenario'));
const ordered=[
  'const runtime=await installedModules(effective.bootstrapRoot)',
  'caller=publicCaller({root,runtime,native,command,record,config:effective})',
  'const {installations}=await populateSandbox(caller)',
  'const execution=await invokeLifecycle(caller,installations,prepared.call,workerEnvironment(config))',
  'const reads=await freshReadbacks(caller,execution)',
  'const archivedSelection=await acquireArchivedScenario(oracleSnapshot)',
  'oracle=await import(pathToFileURL(oraclePath).href)',
  'const installedOwner=(await installedModules(caller.installedRoot)).product',
].map(text=>flow.indexOf(text));
assert.equal(ordered.every((index,i)=>index>=0&&(i===0||index>ordered[i-1])),true);
assert.ok(flow.indexOf('snapshotScenario(fixtures,selected,root)')<flow.indexOf('const execution=await invokeLifecycle'));
assert.match(runner,/Explicit nonempty sourceCommit metadata is required/u);
assert.match(runner,/installedProductContentMatches\(install\)===true/u);
const {invokeLifecycle}=await import(pathToFileURL(runnerPath).href);

const controls=[
  {id:'positive-two-root-order'},
  ...['before-run','after-run'].flatMap(phase=>[0,1].map(index=>({id:phase+'-root-'+index+'-false',phase,index,value:false}))),
  {id:'after-run-missing-owner-result',phase:'after-run',index:1,value:undefined},
  {id:'before-run-unavailable-owner-api',phase:'before-run',unavailable:true},
  {id:'after-run-unavailable-owner-api',phase:'after-run',unavailable:true},
  {id:'after-run-owner-check-throws',phase:'after-run',index:1,ownerThrows:true},
  {id:'invocation-rejection-still-checks-both-roots',invokeThrows:true},
];
const controlResults=[];
const fields=['installId','admissionEventRef','productId','packageName','installedRoot','artifactDigest','productContentDigest','manifestDigest'];
for(const control of controls) {
  const steps=[],records=[],ownerCalls=[];
  let phase='before-run',installedReadReached=false;
  const invocationError=new Error('Reviewer-controlled invocation rejection');
  const call=Object.freeze({reviewerControlledCall:true}),environment=Object.freeze({reviewerControlledEnvironment:true});
  const owner={async installedProductContentMatches(install) {
    const index=installations.indexOf(install);assert.ok(index>=0);
    ownerCalls.push({phase,index});steps.push('check:'+phase+':'+index);
    if(control.phase===phase&&control.index===index) {
      if(control.ownerThrows)throw new Error('Reviewer-controlled public owner check error');
      return control.value;
    }
    return true;
  }};
  if(control.unavailable&&control.phase==='before-run')delete owner.installedProductContentMatches;
  const caller={installedRoot:installations[0].installedRoot,runtime:{product:owner},
    async record(path,record) {
      assert.equal(path,'installed-content-'+record.phase+'.json');
      assert.equal(record.observations.length,2);
      record.observations.forEach((row,index)=>fields.forEach(field=>assert.equal(row[field],installations[index][field])));
      steps.push('record:'+record.phase);records.push({path,record});
    },
    async invoke(label,receivedCall,options) {
      assert.equal(label,'lifecycle-start');assert.equal(receivedCall,call);
      assert.equal(options.runtimeRoot,installations[0].installedRoot);
      assert.equal(options.environment,environment);assert.equal(options.expectResult,false);
      steps.push('invoke');phase='after-run';
      if(control.unavailable&&control.phase==='after-run')delete owner.installedProductContentMatches;
      if(control.invokeThrows)throw invocationError;
      return {reviewerControlledCompletion:true};
    }};
  let caught=null;
  try {
    assert.deepEqual(await invokeLifecycle(caller,installations,call,environment),{reviewerControlledCompletion:true});
    steps.push('installed-reader-marker');installedReadReached=true;
  }catch(error){caught=error;}
  const refusal=control.phase!==undefined;
  if(refusal) {
    assert.equal(caught?.stage,'installed-content-'+control.phase);
    assert.equal(installedReadReached,false);
    assert.equal(steps.includes('invoke'),control.phase==='after-run');
    const affected=records.at(-1).record.observations;
    if(control.unavailable)assert.equal(affected.every(row=>row.contentMatches===false&&typeof row.error==='string'),true);
    else {
      assert.equal(affected[control.index].contentMatches,false);
      if(control.ownerThrows)assert.match(affected[control.index].error,/Reviewer-controlled public owner check error/u);
    }
  }else if(control.invokeThrows) {
    assert.equal(caught,invocationError);assert.equal(installedReadReached,false);
  }else {assert.equal(caught,null);assert.equal(installedReadReached,true);}
  const expected=[];
  for(const selectedPhase of control.phase==='before-run'?['before-run']:['before-run','after-run']) {
    if(selectedPhase==='after-run')expected.push('invoke');
    if(!(control.unavailable&&control.phase===selectedPhase))expected.push('check:'+selectedPhase+':0','check:'+selectedPhase+':1');
    expected.push('record:'+selectedPhase);
  }
  if(!refusal&&!control.invokeThrows)expected.push('installed-reader-marker');
  assert.deepEqual(steps,expected);
  controlResults.push({id:control.id,disposition:'satisfied',steps,installedReadReached,
    failureStage:caught?.stage??null,invocationRejected:control.invokeThrows===true,
    recordIdentityFieldsExact:true,ownerCalls,
    records:records.map(({path,record})=>({path,phase:record.phase,observations:record.observations.map((row,index)=>({
      installIndex:index,contentMatches:row.contentMatches,...(row.error?{error:row.error}:{})}))}))});
}

const scenarios=await import(pathToFileURL(join(tenantRoot,'test_env/uat/scenarios.mjs')).href);
const fixtures=await scenarios.loadScenarios(join(tenantRoot,'test_env/fixtures/sandbox-uat'));
assert.equal(fixtures.manifestDigest,'sha256:'+freeze.unchangedFixtureManifestSHA256);
const fixtureInventories=[];
for(const row of fixtures.rows) {
  const selected=await scenarios.acquireScenario(fixtures.root,row);
  fixtureInventories.push({key:row.key,assets:selected.assets.length,sources:selected.sources.length});
}
await verifyFile(join(fixtures.root,fixtures.rows[0].oracleModule),freeze.unchangedOracleModuleSHA256);
await verifySubject();
const report={activation:'T287_UAT_INSTALLED_IDENTITY_FINAL_REVIEW_04',
  classification:'Bounded independent controls of frozen test caller; controlled checker/invoke doubles. Prior actual public API physical mutation evidence reused without another mutation or Run.',
  candidateFreezeSHA256:freezeSHA256,workerReturnSHA256,verifiedFrozenMembers:subjectPins.length,
  changedSourceCount:3,controls:controlResults,independentControlCount:controlResults.length,
  trustedBootstrapToInstalledReadOrderConfirmed:true,exactTwoRetainedAdmittedInstalls:true,
  previousSnapshotControlsAuthenticated:14,fixtureInventories,
  retainedPhysicalProbeSHA256:'4851309b5e09a7e964e6757ad90ede3359e962f4fcf45f4663e07e7198f0a109',
  priorSnapshotSubjectDigest:snapshotFreeze.subjectDigest,
  cleanPublicPrepare:{status:summary.status,uatPass:summary.uatPass,sourceCommit:run.sourceCommit,
    packageArchiveSHA256:freeze.unchangedCandidateArchiveSHA256,
    eventPrefixDigest:close.prefix.prefixDigest,genuineRunOrCCallEvents:0,admittedPublicArtifacts:3},
  disposition:'satisfied',providerDispatched:false,nativeRunExecuted:false,reinstallation:false,candidateMutated:false,
  applicationUATPass:false,limits:['Live native route and provider reachability unexecuted','Full Data Mapper requires genuine admitted baseline/mutant/restoration and original outcome proof','No identical legacy 28-stage traversal, qualification or release credit']};
if(process.argv.includes('--record'))await writeFile(join(reviewRoot,'checks.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({disposition:report.disposition,verifiedFrozenMembers:subjectPins.length,independentControls:controlResults.length,previousSnapshotControlsAuthenticated:14,fixtureCases:fixtureInventories.length,nativeRunExecuted:false,providerDispatched:false}));
