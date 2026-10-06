import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {caller,verificationRequest,schemaVersion} from './ordinary-caller.mjs';
import {loadRuntime} from './public-support.mjs';
import {verifyInstalledCurrent,preparePairColdRead} from './caller-draft.mjs';
import {originalConsumers} from './original-consumers.mjs';
import {renderPublicGapHandoff} from './sole-output-renderer.mjs';
const D=import.meta.dirname,G=dirname(D),F=join(G,'rc1-s03-installed-execution-04');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const save=(n,v)=>fs.writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const sha=b=>createHash('sha256').update(b).digest('hex');
const began=performance.now(),deadline=began+600000;
let c,phase='preflight';
const progress=p=>{phase=p;console.log(JSON.stringify({phase,elapsedMs:performance.now()-began}));};
async function physical(label){
 const plan=await read(join(D,'resource-plan.json')),path=plan.eventLogPath;
 const before=await fs.stat(path),bytes=await fs.readFile(path),after=await fs.stat(path);
 assert.equal(before.dev,after.dev);assert.equal(before.ino,after.ino);assert.equal(before.size,after.size);assert.equal(before.mtimeMs,after.mtimeMs);
 const lockPath=join(D,'tmp/abiogenesis-event-store-locks-v5',after.dev+'-'+after.ino+'.lock');
 let lockPresent=false;try{await fs.stat(lockPath);lockPresent=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 assert.equal(lockPresent,false);
 const value={path,bytes:bytes.length,sha256:sha(bytes),device:after.dev,inode:after.ino,mtimeMs:after.mtimeMs,stableDuringRead:true,
  lockPath,lockPresent,prefix:c?.state.closeHandoff?.prefix??null};
 await save(label+'-physical.json',value);
 return {value,bytes};
}
try{
 const packageIdentity=await read(join(D,'selected-core.json')),prospect=await read(join(D,'prospective-cases.json'));
 const runtime=await loadRuntime(packageIdentity.installedRoot),{product,abg}=runtime;
 const boundary=await read(join(F,'failure-final-handoff.json')),oldState=await read(join(F,'setup-state.json'));
 const environment=abg.projectExactPrefixWorkspaceEnvironment(boundary.prefix,oldState.binding);
 assert.equal(environment.kind,'exact_prefix_workspace_environment');assert.deepEqual(environment.workspaceAuthorityBasis,oldState.workspaceAuthority);
 progress('same-process-owned-core-verification');
 const verification=await verifyInstalledCurrent({product,packet:{kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',
  request:verificationRequest(prospect.core)},expected:prospect.core.basis});
 c=await caller('s03',verification,deadline,D,environment.workspaceBinding.authorizedActorRef);
 c.state.closeHandoff=boundary;c.state.binding=oldState.binding;c.state.resolvedLock=environment.resolvedProductLock;c.refresh();
 await save('same-process-verification.json',{kind:verification.kind,coordinates:verification.coordinates,
  ownerSelection:'Actual same-process Product owner selected the identical nominal verified object; saved JSON is evidence only',
  role:'pure preparatory verification only; no CLI setup or Product mutation'});
 const priorReceipt=(await read(join(F,'s03-no-action-start-stdout.json'))).receipt;
 assert.equal(priorReceipt.failure,null);assert.equal(priorReceipt.ownerOutput.outcomeKind,'nonterminal');assert.equal(priorReceipt.exitCode,3);
 const startDefinition=c.installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId==='abg.operation.run.invoke'&&d.definitionKey.memberKey==='start');
 assert.equal(startDefinition.adapterExitMap.acceptedNonTerminal,priorReceipt.exitCode);
 const readDefinitions=['run_result','run_replay','run_status','run_gaps'].map(memberKey=>{
  const definition=c.installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId==='abg.operation.project.read'&&d.definitionKey.memberKey===memberKey);
  assert.ok(definition);return {definitionKey:definition.definitionKey,definitionDigest:definition.definitionDigest,adapterExitMap:definition.adapterExitMap};
 });
 await save('output-consumption-contracts.json',{readDefinitions,oldNegativeStart:{definitionKey:startDefinition.definitionKey,
  adapterExitMap:startDefinition.adapterExitMap,outcomeKind:priorReceipt.ownerOutput.outcomeKind,exitCode:priorReceipt.exitCode,
  interpretation:'valid published acceptedNonTerminal preserved unchanged, never relabeled result'},mapping:{result:'acceptedTerminal',refusal:'refused',nonterminal:'acceptedNonTerminal'}});
 const initial=await physical('initial');assert.equal(initial.value.bytes,4709556);assert.equal(initial.value.sha256,'26339994e902ccafa5c1f6da9d8df471d77a1a3e144843f7472e5f1558f989df');
 const fixture=await import(pathToFileURL(prospect.originalFixtureImplementation.path).href),oracle=await read(join(D,'original-oracle.json'));
 const consumers=originalConsumers(fixture),run=priorReceipt.resources.run;
 const identity=abg.projectRunTruthAtDurablePrefix(boundary.prefix,run.ref);
 assert.equal(identity.kind,'abg_run_truth_projection',JSON.stringify(identity));assert.equal(identity.runtimeStatus,'gap_stopped');
 assert.deepEqual(identity.run,run);assert.deepEqual(identity.run,priorReceipt.ownerOutput.value.run);
 const oldPreparation=await read(join(F,'no-action/start-preparation.json'));
 const prepared={call:oldPreparation.call,workAuthority:oldPreparation.authority,capabilityBasis:{policy:oldPreparation.policy},resolution:{program:oldState.program}};
 const rows=abg.readRuntimeEventsAtDurablePrefix(boundary.prefix);
 progress('original-negative-causal-oracle');
 const semantic=consumers.assertNativeDomain({rows,run,identity,prepared,oracle,correctionAvailable:false});
 assert.deepEqual(identity.executionBasis,{ref:semantic.basis.payload.basisRef,digest:semantic.basis.payload.basisDigest});
 await save('negative-causal-oracle.json',{status:'passed',identity,semantic,
  originalPreparedInputSources:{startPreparation:join(F,'no-action/start-preparation.json'),program:join(F,'setup-state.json')},
  interpretation:'Read-only original causal oracle on existing admitted Run; no preparation/invocation/retry of a start'});
 const currentEnvironment=()=>({...c.state.environment,product:c.product,abg:c.abg,admittedInstalls:c.state.environment.productInstalls,
  workspaceBinding:c.state.environment.workspaceBinding,workspaceAuthority:c.state.environment.workspaceAuthorityBasis,verified:c.verified});
 const cold={};
 for(const memberKey of ['run_result','run_replay','run_status','run_gaps']){
  progress('no-action-'+memberKey);c.refresh();
  const preparedRead=preparePairColdRead({environment:currentEnvironment(),publicApi:c.installedPublic,projectReadContracts:c.abg,
   memberKey,run:identity.run,eventResource:c.reopen(),identity:'c03-s03-05-no-action-'+memberKey,eventTime:new Date().toISOString()});
  const expected=memberKey==='run_result'?{outcomeKind:'refusal',code:'not_ready'}:{outcomeKind:'result'};
  const result=await c.invoke('no-action-'+memberKey,preparedRead.call,'read',expected);
  assert.deepEqual(c.state.closeHandoff,boundary,'Every actual cold owner preserves the exact existing close handoff');
  cold[memberKey]=result.receipt.ownerOutput;
 }
 progress('original-negative-cold-oracle');
 const proof=consumers.assertColdDomain({cold,identity,boundary,semantic,rows,oracle,correctionAvailable:false,product:c.product});
 const rendering=renderPublicGapHandoff(cold.run_gaps);assert.equal(rendering,proof.handoff);
 const frontier=cold.run_gaps.value.projection.frontiers[0];
 assert.deepEqual(frontier.basis.value.observationSnapshot.domain.unaffected,oracle.initialDomain.unaffected,'Public data itself supplies unaffected work');
 assert.equal(frontier.basis.value.observationSnapshot.domain.target.value,3);
 for(const evidence of frontier.basis.inputEvidence){
  const event=rows.find(e=>e.eventId===evidence.admissionEventRef);assert.ok(event);assert.equal(event.runId,identity.run.ref);
  assert.equal(event.aggregateId,frontier.nextAction.cCallRef);assert.equal(event.payload.evidenceRef,evidence.evidence.ref);
  assert.equal(event.payload.evidenceDigest,evidence.evidence.digest);assert.equal(event.payload.inputDigest,frontier.basis.valueDigest);
 }
 const after=await physical('final');assert.deepEqual(after.bytes,initial.bytes);assert.deepEqual(after.value.prefix,initial.value.prefix);
 await fs.writeFile(join(D,'no-action/public-handoff.txt'),rendering,{flag:'wx'});
 await save('no-action/oracle-result.json',{status:'passed',identity,boundary,semantic,cold,proof,rendering,
  physical:{before:initial.value,after:after.value},PublicFrontierSuppliesActualDesiredMissingCapabilityUnfulfilledAndUnaffected:true,
  limits:'Bounded original S03a negative only; no fullS03 or qualification claim'});
 const positive=await read(join(F,'positive/oracle-result.json'));assert.equal(positive.status,'passed');
 const positivePrepared=await read(join(F,'positive/start-preparation.json'));
 assert.deepEqual({...positivePrepared.input,correctionAvailable:false},oldPreparation.input);
 assert.deepEqual(positivePrepared.policy,oldPreparation.policy);assert.deepEqual(positivePrepared.resolution,oldPreparation.resolution);
 assert.deepEqual(positive.identity.workspaceBinding,identity.workspaceBinding);
 await save('final-handoff.json',c.state.closeHandoff);
 await save('pair-result.json',{status:'passed',activation:'T287_RC1_S03_INSTALLED_COLD_READS_05',
  positive:{proof:join(F,'positive/oracle-result.json'),run:positive.identity.run,executionBasis:positive.identity.executionBasis,status:'passed',actual:10,desired:10,freshReads:4},
  noAction:{proof:join(D,'no-action/oracle-result.json'),run:identity.run,executionBasis:identity.executionBasis,status:'passed',actual:3,desired:10,freshReads:4,rendering},
  pair:{sameC03:true,sameProgramResolution:true,sameRootPolicy:true,sameWorkspaceBinding:true,inputDiffOnlyCorrectionAvailable:true,twoExistingActualRuns:true,
   newStarts:0,newSetupConformanceCalls:0,combinedFreshReads:8,originalOraclesUnchanged:true},
  currentReadCalls:c.state.calls,initial:initial.value,final:after.value,elapsedMs:performance.now()-began,budgetMs:600000,
  coldAppendBytes:0,zeroModelCalls:true,qualificationClaim:false,acceptanceClaim:false,
  limits:['bounded original S03a pair only','fullS03/control/disposition/consequence remains open','Root separately assures/conjoins'],
 });
 console.log(JSON.stringify({status:'passed',newCalls:c.state.calls.length,combinedFreshReads:8,newStarts:0,elapsedMs:performance.now()-began}));
}catch(error){
 let observed=null;try{observed=(await physical('failure-final')).value;}catch(e){observed={observationError:e.message};}
 if(c?.state.closeHandoff)await save('failure-final-handoff.json',c.state.closeHandoff);
 await save('failure.json',{status:'first_failure_stopped',phase,message:error.message,stack:error.stack,
  actualCalls:c?.state.calls??[],lastGenuineHandoff:c?.state.closeHandoff??null,physical:observed,ownedDriverPid:process.pid,elapsedMs:performance.now()-began});
 console.error(error.stack);process.exitCode=1;
}
