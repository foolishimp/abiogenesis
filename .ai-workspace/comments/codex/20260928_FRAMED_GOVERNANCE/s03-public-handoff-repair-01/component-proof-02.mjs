import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
import {createHash} from 'node:crypto';
const proof=fileURLToPath(new URL('.',import.meta.url)),repo=fileURLToPath(new URL('../../../../../',import.meta.url));
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url),'utf8'));
const save=async(name,value)=>writeFile(proof+name,JSON.stringify(value,null,2)+'\n');
const h=await read('historical-handoff.json'),live=fileURLToPath(h.prefix.eventLogRef),guarded=[];
for(const key of ['readFileSync','openSync','statSync','lstatSync','realpathSync']){
 const original=fs[key];fs[key]=function(path,...args){const p=path instanceof URL?fileURLToPath(path):String(path);if(p===live){guarded.push(key);throw new Error('Forbidden live resource access');}return original.call(this,path,...args);};
}
syncBuiltinESMExports();
const load=name=>import(new URL('compiled/'+name+'.js',import.meta.url));
const [ev,ep,pr,replay,bind,contracts,common,digests,immutable,product,pub]=await Promise.all(['abg/event_store','abg/event_prefix','abg/project_read_ports','abg/replay','abg/project_read_definition_bindings','abg/project_read_operation_contracts','shared/public_function_contracts','shared/digests','shared/immutable','product/index','public/index'].map(load));
const {assertPublicGapDomain,renderPublicGapHandoff}=await import(pathToFileURL(repo+'build_tenants/abiogenesis/typescript/test_env/support/t287-s03-automatic.mjs'));
const started=performance.now(),bytes=await readFile(proof+'snapshot.jsonl'),rows=ev.validateHistoricalEvents(bytes,h.prefix.storeIdentity.eventContractDigest),prefix=ep.selectValidatedRuntimeEventPrefix(rows);
const inputSha=createHash('sha256').update(bytes).digest('hex');assert.equal(inputSha,'e7f7de0e3fd801436b3e3d559e7fdb1bc41a54d52ce57c2505afd3f9ae863f59');
const runs={positive:'run://abiogenesis/6f642652d6a55bda784eacdebf63038fd2e767c939a28dc59d86a72c24d51e11',negative:'run://abiogenesis/fc9ca55bd6e4a3164c546b9bcb2df1c10b1e9d55884c34fc98f4524a7b7396e8'};
const packet=(run,coordinate=h.prefix)=>({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'run_gaps',prefix:coordinate,targetRef:run});
const request=(identity,coordinate=h.prefix)=>({caseKey:'run_gaps',source:{sourceKind:'run',sourceRef:identity.run.ref,sourceDigest:identity.run.digest},projectionBasis:{projectionBasisRef:coordinate.eventLogRef,projectionBasisDigest:coordinate.coordinateDigest},selector:{kind:'none'}});
const oracle=JSON.parse(await readFile(new URL('../s03-automatic-01/oracle.json',import.meta.url),'utf8'));
const results={},red=[];
try{
 for(const [name,run]of Object.entries(runs)){
  const identity=replay.projectRunIdentityAtPrefix(prefix,run),native=pr.projectGapReadAtValidatedPrefix(packet(run),prefix);assert.equal(native.kind,'abg_project_read_projection',JSON.stringify(native));
  const req=request(identity),output=bind.projectAbgReadOutput(contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps,req,'run_gaps',native);
  assert.equal(common.admitRuntimeContract(contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps.resultSchema,output.value).disposition,'admitted');
  const local=rows.filter(e=>e.runId===run),stop=local.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.disposition==='no_action');
  const semantic=name==='positive'?{}:{stop,gap:local.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.basisRef===stop.payload.value.nextActionBasisRef),gapRoute:local.find(e=>e.kind==='traversal_route_admitted'&&e.payload.routeKind==='gap_stop'),stopped:local.find(e=>e.kind==='run_stopped')};
  const rendering=assertPublicGapDomain({output,identity,boundary:h,semantic,oracle,correctionAvailable:name==='positive',product});
  const isolatedOutput=JSON.parse(JSON.stringify(output));assert.equal(renderPublicGapHandoff(isolatedOutput),rendering.handoff);
  results[name]={identity,native,request:req,output,...rendering};await save(name+'-component.json',results[name]);
 }
 await writeFile(proof+'caller-handoff.txt',results.negative.handoff);
 const basisIndex=rows.findIndex(e=>e.eventId===results.negative.output.value.projection.frontiers[0].basis.resultAdmissionEventRef);
 const positiveBasis=rows.find(e=>e.runId===runs.positive&&e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='next_action_basis');
 const peerIndex=rows.findIndex(e=>e.runId===runs.negative&&e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='observation_snapshot');
 const basisRef=rows[basisIndex].payload.value.basisRef;
 for(const [name,mutate]of [
  ['missing_basis',copy=>{delete copy[basisIndex].payload.value.basisRef;}],
  ['crossed_positive_basis',copy=>{copy[basisIndex].payload.value=JSON.parse(JSON.stringify(positiveBasis.payload.value));}],
  ['ambiguous_basis',copy=>{assert.ok(peerIndex>=0);copy[peerIndex].payload.value.basisRef=basisRef;}],
 ]){
  const copy=JSON.parse(JSON.stringify(rows));mutate(copy);immutable.deepFreeze(copy);
  assert.notEqual(copy[basisIndex],rows[basisIndex]);assert.equal(rows[basisIndex].payload.value.basisRef,basisRef);
  const altered=ep.selectValidatedRuntimeEventPrefix(copy),physical=ev.runtimeEventPhysicalPrefix(copy);
  const {coordinateDigest,...body}=h.prefix;const coordinateBody={...body,prefixLength:physical.byteLength,prefixDigest:physical.digest};
  const candidate={...coordinateBody,coordinateDigest:digests.sha256Canonical(coordinateBody)};
  const outcome=pr.projectGapReadAtValidatedPrefix(packet(runs.negative,candidate),altered);
  assert.equal(outcome.kind,'abg_project_read_refusal',name);assert.equal(outcome.code,'invalid_history',name);
  const output=bind.projectAbgReadOutput(contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps,request(results.negative.identity,candidate),'run_gaps',outcome);
  assert.equal(output.outcomeKind,'refusal');assert.equal(common.admitRuntimeContract(contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps.refusalSchema,output.value).disposition,'admitted');
  red.push({name,syntheticCandidateOnly:true,candidateRowsDigest:digests.sha256Canonical(copy),coordinate:candidate,outcome,output});
 }
 const wrongPrefix=pr.projectGapReadAtValidatedPrefix({...packet(runs.negative),prefix:{...h.prefix,prefixDigest:'sha256:'+'0'.repeat(64)}},prefix);assert.equal(wrongPrefix.kind,'abg_project_read_refusal');red.push({name:'crossed_physical_prefix',outcome:wrongPrefix});
 const wrongRun=pr.projectGapReadAtValidatedPrefix(packet('run://absent'),prefix);assert.equal(wrongRun.kind,'abg_project_read_refusal');red.push({name:'missing_run',outcome:wrongRun});
 assert.throws(()=>bind.projectAbgReadOutput(contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps,request(results.positive.identity),'run_gaps',results.negative.native),/crosses the selected source/);red.push({name:'crossed_supported_run_source',outcome:'projection rejects source mismatch'});
 const extra=JSON.parse(JSON.stringify(results.negative.output.value));extra.projection.frontiers[0].privateRoute={};assert.equal(common.admitRuntimeContract(contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps.resultSchema,extra).disposition,'refused');red.push({name:'strict_frontier_rejects_extra_internal_route',outcome:'schema refused'});
 // Shared companion contract receives the same closed carrier, not route interiors.
 const companion=JSON.parse(JSON.stringify(results.negative.output.value));companion.caseKey='workspace_gaps';companion.projection.kind='workspace_gap_projection';assert.equal(common.admitRuntimeContract(contracts.ABG_PROJECT_READ_CONTRACTS.workspace_gaps.resultSchema,companion).disposition,'admitted');
 const environment=JSON.parse(await readFile(new URL('../s03-automatic-01/environment.json',import.meta.url),'utf8'));
 const packetContract=contracts.ABG_PROJECT_READ_CONTRACTS.run_gaps;
 const grants=packetContract.metadata.capabilityRefs.map(capability=>product.constructCapabilityGrant(environment.workspaceAuthority,environment.workspaceBinding.authorizedActorRef,packetContract.definitionKey.operationId,capability,{admittedInstalls:environment.admittedInstalls,workspaceBinding:environment.workspaceBinding,fixedPacket:packetContract}));
 for(const grant of grants){assert.equal(product.validateCapabilityGrantForProductBasis(grant,environment.workspaceAuthority,environment.workspaceBinding.authorizedActorRef,grant.capabilityRef,{admittedInstalls:environment.admittedInstalls,workspaceBinding:environment.workspaceBinding,fixedPacket:packetContract}),true);}
 const currentDefinition=pub.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId==='abg.operation.project.read'&&d.definitionKey.memberKey==='run_gaps');
 const historicalPub=await import(pathToFileURL(environment.installedRoot+'/build/code/src/public/index.js'));
 const historicalDefinition=historicalPub.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===currentDefinition.definitionKey.operationId&&d.definitionKey.memberKey==='run_gaps');
 assert.notEqual(currentDefinition.definitionDigest,historicalDefinition.definitionDigest);assert.ok(grants.every(g=>g.definitionDigest===currentDefinition.definitionDigest));
 const compatibility={status:'pure_constructed_and_validated',executingDefinition:{ref:currentDefinition.definitionRef,digest:currentDefinition.definitionDigest},historicalDefinition:{ref:historicalDefinition.definitionRef,digest:historicalDefinition.definitionDigest},historicalWorkspace:environment.workspaceBinding,grants,preconditions:['Verify and load actual final reader Product; its manifest/catalog and nested slot coordinates must feed the caller constructor.','Keep historical admitted installs/ProductSet/lock/WorkspaceBinding and exact Run identity as read subject.','Use Product grants constructed by final reader under historical workspace authority; grant operationContract remains historical source capability permission.','Reacquire actual unchanged live resource using then-current genuine handoff under a separately authorized no-append grant.','Final reader event-contract support must admit retained physical snapshot; component decoder already does.'],nativeRead:'not executed'};
 await save('future-reader-compatibility.json',compatibility);await save('counterexamples.json',red);
 assert.deepEqual(guarded,[]);
 await save('component-result.json',{status:'passed',inputSha,events:rows.length,positiveGapCount:results.positive.projection.frontiers.length,negativeGapCount:results.negative.projection.frontiers.length,redCases:red.map(r=>r.name),workspaceCompanion:'strict shared carrier only; no workspace-wide acceptance',futureReader:'pure grant construction and validation only',liveResourceAccesses:guarded,elapsedMs:performance.now()-started});
 console.log(JSON.stringify({status:'passed',redCases:red.length,elapsedMs:performance.now()-started}));
}catch(error){await save('component-failure.json',{message:error.message,stack:error.stack,redCompleted:red,liveResourceAccesses:guarded,elapsedMs:performance.now()-started});throw error;}
