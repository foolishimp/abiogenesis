import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const repo='/Users/jim/src/apps/abiogenesis';
const proof=join(repo,'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s03-automatic-02');
const prior=join(proof,'../s03-automatic-01');
const support=join(repo,'build_tenants/abiogenesis/typescript/test_env/support/t287-s03-automatic.mjs');
const {assertNativeDomain,assertColdDomain}=await import(pathToFileURL(support));
const shared=await import(pathToFileURL(join(repo,'build_tenants/abiogenesis/typescript/test_env/support/registered-graph-selection.mjs')));
const fixture=await import(pathToFileURL(join(repo,'build_tenants/abiogenesis/typescript/test_env/fixtures/t287-s03-automatic-product/index.mjs')));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const save=async(name,data)=>{const path=join(proof,name);await mkdir(join(path,'..'),{recursive:true});await writeFile(path,JSON.stringify(data,null,2)+'\n',{flag:'wx'});};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const mode=process.argv[2];assert.ok(['pure','remaining'].includes(mode));
const saved=await read(join(prior,'environment.json')),oracle=await read(join(prior,'oracle.json'));
const load=name=>import(pathToFileURL(join(saved.installedRoot,`build/code/src/${name}.js`)));
const [product,abg,publicApi,eventOwner,replay,reads]=await Promise.all(['product/index','abg/index','public/index','abg/event_store','abg/replay','abg/project_read_operation_contracts'].map(load));
const originalHandoff=await read(join(prior,'latest-handoff.json'));
const originalBytes=await readFile(join(prior,'failed-native-prefix.jsonl'));
assert.equal(sha(originalBytes),'c00b129cb95ec9d89d8f73e3f40fe85eeb646001616bfe100a7fee75f4b7d564');
const launch=await read(join(prior,'phase-b-launch.json'));
assert.equal(process.env.TMPDIR,launch.selected_environment.TMPDIR,'Preserve original owner lock namespace');
let handoff=originalHandoff,callOrdinal=0;
const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
async function physical(){
 const path=fileURLToPath(handoff.prefix.eventLogRef),bytes=await readFile(path),s=await stat(path);
 assert.equal(s.dev,16777230);assert.equal(s.ino,463811526);assert.deepEqual(bytes.subarray(0,originalBytes.length),originalBytes,'Initial positive bytes remain the exact prefix');
 assert.equal(bytes.length,handoff.prefix.prefixLength);assert.equal('sha256:'+sha(bytes),handoff.prefix.prefixDigest);
 const lockPath=join(process.env.TMPDIR,'abiogenesis-event-store-locks-v5',`${s.dev}-${s.ino}.lock`);let lock='absent';try{await stat(lockPath);lock='present';}catch(e){if(e.code!=='ENOENT')throw e;}assert.equal(lock,'absent','No active owner before next acquisition');
 const rows=eventOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);
 return {path,bytes:bytes.length,sha256:sha(bytes),device:s.dev,inode:s.ino,mtimeMs:s.mtimeMs,lockPath,lock,eventCount:rows.length,prefix:handoff.prefix};
}
const started=performance.now();
try{
 const initial=await physical();
 const environment={...saved,product,abg,artifactTruth:abg.projectExactPrefixArtifactTruth(handoff.prefix)};
 const prospective=await read(join(prior,'positive/prospective-start.json'));
 const positiveReceipt=await read(join(prior,'positive/start-receipt.json'));
 const resolution=await product.ProductExecutionResolutionPort.resolve({catalog:environment.catalog,catalogView:environment.catalogView,admittedInstalls:environment.admittedInstalls,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(environment.artifactTruth,i),programRef:fixture.ref('program','root'),selection:{kind:'start',scope:'program',target:fixture.ref('start','root'),startRef:fixture.ref('start','root'),until:'converged',rootMode:'supervised'}});
 assert.equal(resolution.kind,'loaded_product_execution_resolution');assert.deepEqual(resolution.resolution,prospective.resolution);
 assert.deepEqual(fixture.fixtureInput({workspaceBinding:environment.workspaceBinding,program:resolution.program},true),prospective.input);
 const prepared={call:prospective.call,workAuthority:prospective.workAuthority,capabilityBasis:{policy:prospective.policy},resolution};
 const rows=eventOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),prefix=abg.selectValidatedRuntimeEventPrefix(rows),identity=replay.projectRunIdentityAtPrefix(prefix,positiveReceipt.output.receipt.resources.run.ref);
 assert.deepEqual(identity.run,positiveReceipt.output.receipt.resources.run);assert.deepEqual(identity.run,positiveReceipt.output.receipt.ownerOutput.value.run);
 const semantic=assertNativeDomain({rows,run:identity.run,identity,prepared,oracle,correctionAvailable:true});
 const supportIdentity={path:support,sha256:sha(await readFile(support))};
 if(mode==='pure'){
  await save('pure-positive.json',{status:'passed',scope:'Complete repaired semantic oracle on retained positive; no resource acquisition or native invocation',supportIdentity,identity,semantic,initial,final:await physical(),elapsedMs:performance.now()-started});
  console.log(JSON.stringify({status:'passed',scope:'pure retained-positive',run:identity.run,elapsedMs:performance.now()-started}));
 }else{
  const pure=await read(join(proof,'pure-positive.json'));assert.equal(pure.status,'passed');assert.deepEqual(pure.supportIdentity,supportIdentity);assert.deepEqual(pure.identity,identity);
  await save('remaining-activation.json',{status:'active',startedAt:new Date().toISOString(),pid:process.pid,supportIdentity,initial,operation:'Only retained positive cold reads then one missing no-action start and cold reads',originalLockNamespace:process.env.TMPDIR});
  async function cli(caseName,name,call){
   const ordinal=++callOrdinal,dir=join(proof,caseName);await mkdir(dir,{recursive:true});await save(`${caseName}/${name}-pre-effect.json`,{ordinal,at:new Date().toISOString(),physical:await physical(),handoff});await save(`${caseName}/${name}-call.json`,call);
   const output=await shared.runInstalledCliRequest({scratch:dir,installedRoot:environment.installedRoot,identity:name,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:{TMPDIR:process.env.TMPDIR}});
   await save(`${caseName}/${name}-receipt.json`,output);const receipt=output.output.receipt;assert.ok(receipt);assert.ok(receipt.resources?.eventResource?.closeHandoff,'Actual current owner close authority required');handoff=receipt.resources.eventResource.closeHandoff;await save(`handoff-${ordinal}.json`,handoff);assert.equal(receipt.failure,null,JSON.stringify(receipt));await save(`${caseName}/${name}-post-effect.json`,await physical());return receipt;
  }
  async function coldCase(caseName,runIdentity,caseRows,caseSemantic,correctionAvailable){
   const boundary=handoff,cold={};
   for(const memberKey of ['run_result','run_replay','run_status']){
    const made=shared.constructInstalledRunReadCall({environment,publicApi,projectReadContracts:reads,memberKey,selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:2048}:{kind:'none'},source:runIdentity.run,eventResource:resource(),identity:'s03-02-'+caseName+'-'+memberKey});
    const receipt=await cli(caseName,memberKey,made.call);assert.deepEqual(handoff.prefix,boundary.prefix,'Cold read cannot append');cold[memberKey]=receipt.ownerOutput;
   }
   const result=assertColdDomain({cold,identity:runIdentity,boundary,semantic:caseSemantic,rows:caseRows,oracle,correctionAvailable,product});await save(`${caseName}/oracle-result.json`,{status:'passed',identity:runIdentity,boundary,semantic:caseSemantic,cold,result});return result;
  }
  const positive=await coldCase('positive',identity,rows,semantic,true);
  environment.artifactTruth=abg.projectExactPrefixArtifactTruth(handoff.prefix);
  const negativePrepared=await shared.constructInstalledStartCall({environment,publicApi,eventResource:resource(),identity:'s03-no-action',programRef:fixture.ref('program','root'),rootMode:'supervised',declaredStartRef:fixture.ref('start','root'),inputFactory:args=>fixture.fixtureInput(args,false)});
  assert.deepEqual(negativePrepared.call.invocation.request.input.value,{...prospective.input,correctionAvailable:false});assert.deepEqual(negativePrepared.capabilityBasis.policy,prospective.policy);assert.deepEqual(negativePrepared.resolution.program,resolution.program);
  const ownerPrepared=await product.ProductRunInvocationPort.prepare({memberKey:'start',invocation:negativePrepared.call.invocation,resources:negativePrepared.call.resources,admittedInstalls:environment.admittedInstalls,workspaceBinding:environment.workspaceBinding,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(environment.artifactTruth,i),transportResourceAssertion:resource()});assert.equal(ownerPrepared.kind,'prepared_product_run_invocation');assert.deepEqual(ownerPrepared.authority,negativePrepared.workAuthority);
  await save('no-action/prospective-start.json',{call:negativePrepared.call,workAuthority:negativePrepared.workAuthority,policy:negativePrepared.capabilityBasis.policy,resolution:negativePrepared.resolution.resolution,input:negativePrepared.call.invocation.request.input.value});
  const negativeReceipt=await cli('no-action','start',negativePrepared.call);assert.equal(negativeReceipt.ownerOutput.value.disposition,'gap_stop');
  const negativeRows=eventOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),negativePrefix=abg.selectValidatedRuntimeEventPrefix(negativeRows),negativeIdentity=replay.projectRunIdentityAtPrefix(negativePrefix,negativeReceipt.resources.run.ref);assert.deepEqual(negativeIdentity.run,negativeReceipt.resources.run);assert.deepEqual(negativeIdentity.run,negativeReceipt.ownerOutput.value.run);
  const negativeSemantic=assertNativeDomain({rows:negativeRows,run:negativeIdentity.run,identity:negativeIdentity,prepared:negativePrepared,oracle,correctionAvailable:false});
  const noAction=await coldCase('no-action',negativeIdentity,negativeRows,negativeSemantic,false);await writeFile(join(proof,'no-action/handoff.txt'),negativeSemantic.handoff,{flag:'wx'});
  await save('final-handoff.json',handoff);const final=await physical();await writeFile(join(proof,'final-native-prefix.jsonl'),await readFile(final.path),{flag:'wx'});await save('installed-result.json',{status:'candidate_ready',positive,noAction,positiveIdentity:identity,negativeIdentity,initial,final,handoff,calls:callOrdinal,elapsedMs:performance.now()-started});console.log(JSON.stringify({status:'candidate_ready',calls:callOrdinal,final,elapsedMs:performance.now()-started}));
 }
}catch(error){
 const path=fileURLToPath(handoff.prefix.eventLogRef),bytes=await readFile(path),s=await stat(path);await save(`${mode}-${process.argv[3]??'01'}-failure.json`,{message:error.message,stack:error.stack,lastGenuineHandoff:handoff,completedCallOrdinal:callOrdinal,physical:{path,bytes:bytes.length,sha256:sha(bytes),device:s.dev,inode:s.ino},elapsedMs:performance.now()-started});console.error(error.stack);process.exitCode=1;
}
