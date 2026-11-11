import assert from "node:assert/strict";
import { readFile, lstat } from "node:fs/promises";
import { resolveInstalledPackageExport } from "./root-cli-environment.mjs";
import { pathToFileURL, fileURLToPath } from "node:url";
export async function resolveFreshSdkReplayModule(cliHost) {
  return pathToFileURL(await resolveInstalledPackageExport({cliHost}, "@abiogenesis/typescript-tenant/abg")).href;
}
// Select retained caller evidence only. Existing installed owners reconstruct its basis below.
export function selectPreservedCatalogReceipt(priorCall, receipt) {
  assert.deepEqual(priorCall.invocation.definitionKey, {operationId:"abg.operation.catalog.admit",memberKey:"admit"});
  assert.deepEqual(receipt.definitionKey, priorCall.invocation.definitionKey);
  assert.equal(receipt.invocationRef, priorCall.invocation.invocationRef);
  assert.equal(receipt.resources.disposition,"read_only_unchanged");
  const closeHandoff=receipt.resources.eventResource.closeHandoff;
  assert.deepEqual(closeHandoff.prefix,receipt.resources.eventResource.entryPrefix);
  assert.deepEqual(closeHandoff,priorCall.resources.eventResource.closeHandoff);
  if(receipt.ownerOutput.outcomeKind==="result") {
    assert.equal(receipt.exitCode,0);
    assert.deepEqual(receipt.ownerOutput.value.catalog,receipt.resources.catalog);
    return {closeHandoff,preservedCatalogReceipt:receipt};
  }
  assert.equal(receipt.ownerOutput.outcomeKind,"refusal");
  assert.equal(receipt.ownerOutput.value.code,"conservation_failure");
  return {closeHandoff,preservedCatalogReceipt:null};
}
export function validateRetainedStdoSourceEvidence(evidence,{product,abg}) {
  const {setup,source,missing,catalogReceipt,viewCall,viewReceipt}=evidence;
  const closeHandoff=missing.closeHandoff;
  assert.equal(source.call.invocation.request.program.ref,PILOT_IDS.sourceProgramRef);
  assert.equal(source.ran.exitCode,0);assert.equal(source.ran.ownerOutput.outcomeKind,"result");
  assert.equal(source.ran.ownerOutput.value.disposition,"completed");
  assert.equal(source.ran.invocationRef,source.call.invocation.invocationRef);
  assert.deepEqual(source.closeHandoff,closeHandoff);
  const events=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix),prefix=abg.selectValidatedRuntimeEventPrefix(events);
  const admission=abg.rehydrateInvocationAdmissionAtPrefix(prefix,source.ran.resources.invocationAdmission.ref);
  assert.ok(admission);
  const resultBasis=abg.deriveInvocationSourceResultBasisAtPrefix(prefix,{publicAuthorityDigest:source.call.invocation.invocationDigest,
    runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:source.ran.resources.invocationAdmission.ref,
    runId:source.ran.ownerOutput.value.run.ref,resultRef:source.ran.ownerOutput.value.result.ref});
  assert.ok(resultBasis);assert.deepEqual(resultBasis,source.resultBasis,"saved source equals current installed-owner projection");
  for(const read of Object.values(source.reads)){
    assert.equal(read.exitCode,0);assert.equal(read.ownerOutput.outcomeKind,"result");
    assert.deepEqual(read.resources.eventResource.closeHandoff,closeHandoff);
  }
  assert.deepEqual(source.reads.run_result.ownerOutput.value.projection.result,source.ran.ownerOutput.value.result);
  const replay=abg.projectRunSemanticReplayProjection(prefix,source.ran.ownerOutput.value.run.ref);
  assert.deepEqual(source.reads.run_replay.ownerOutput.value.projection.replay,
    {ref:replay.physicalCoordinates.scopedReplayRef,digest:replay.physicalCoordinates.scopedReplayDigest});
  assert.deepEqual(source.input,setup.fixture.source.input);
  assert.deepEqual(resultBasis.sourceResultValue.declaration,setup.fixture.source.declaration);
  assert.equal(resultBasis.sourceResultValue.coverage.obligations.length,2);
  const envelope=product.constructSemanticStageEnvelope({sourceHandoff:resultBasis.sourceResultValue,lifecycle:setup.fixture.lifecycle,
    taskData:setup.fixture.scenario,evaluationData:setup.fixture.oracle,worksite:null});
  const refused=missing.outcome.receipt;
  assert.equal(missing.call.invocation.request.program.ref,PILOT_IDS.programRef);
  assert.equal(missing.call.resources.stdoEnvironmentResources,undefined);
  assert.equal(refused.invocationRef,missing.call.invocation.invocationRef);
  assert.equal(refused.ownerOutput.outcomeKind,"refusal");assert.equal(refused.ownerOutput.value.code,"invalid_capability");
  assert.ok(refused.ownerOutput.value.issuePaths.includes("/stdoEnvironment/cause/missing_binding"));
  assert.deepEqual(refused.resources.eventResource.closeHandoff,closeHandoff);
  assert.deepEqual(refused.resources.eventResource.entryPrefix,closeHandoff.prefix);
  assert.deepEqual(missing.call.invocation.request.input.value,envelope,"retained refusal applies to the exact reconstructed native input");
  assert.deepEqual(missing.call.resources.catalog,setup.catalog);assert.deepEqual(missing.call.resources.catalogView,setup.catalogView);
  assert.equal(events.filter(event=>event.kind==="actor_transport_binding_admitted").length,0);
  assert.equal(catalogReceipt.exitCode,0);assert.equal(catalogReceipt.ownerOutput.outcomeKind,"result");
  assert.deepEqual(catalogReceipt.ownerOutput.value.catalog,setup.catalogScope.catalog);
  assert.equal(viewReceipt.invocationRef,viewCall.invocation.invocationRef);
  assert.equal(viewReceipt.exitCode,0);assert.equal(viewReceipt.ownerOutput.outcomeKind,"result");
  assert.deepEqual(viewReceipt.ownerOutput.value.view,setup.catalogScope.view);
  assert.deepEqual(viewCall.invocation.request.catalog,setup.catalogScope.catalog);
  return {...evidence,closeHandoff,envelope,eventCount:events.length};
}
export async function readRetainedStdoSourceEvidence(path,{product,abg}) {
  const packet=JSON.parse(await readFile(path,"utf8"));
  assert.equal(packet.kind,"stdo_pilot_source_evidence");
  const evidence={};
  for(const name of ["setup","source","missing","catalogReceipt","viewCall","viewReceipt"]){
    const member=packet.members[name],bytes=await readFile(member.path);
    assert.equal(product.sha256Bytes(bytes),"sha256:"+member.sha256,`retained ${name} bytes`);
    const value=JSON.parse(bytes);evidence[name]=name.endsWith("Receipt")?value.receipt:name==="viewCall"?value.invocation:value;
  }
  const current=evidence.missing.closeHandoff.prefix;
  assert.equal(current.coordinateDigest,packet.prefixCoordinateDigest);
  const eventPath=fileURLToPath(current.eventLogRef),bytes=await readFile(eventPath),info=await lstat(eventPath);
  assert.equal(bytes.length,current.prefixLength);assert.equal(product.sha256Bytes(bytes),current.prefixDigest);
  assert.equal(info.dev,current.storeIdentity.device);assert.equal(info.ino,current.storeIdentity.inode);
  return validateRetainedStdoSourceEvidence(evidence,{product,abg});
}
export const PILOT_IDS = Object.freeze({
  productId:"product://stdo-note.example/pilot@5.0.0",packageName:"@abiogenesis-fixtures/stdo-note-pilot",packageVersion:"5.0.0",
  sourceModuleRef:"module://stdo-note.example/source@5",moduleRef:"module://stdo-note.example/note@5",
  sourceProgramRef:"program://stdo-note.example/source@5",programRef:"program://stdo-note.example/note@5",
  sourceGraphFunctionRef:"graph-function://stdo-note.example/source@5",graphFunctionRef:"graph-function://stdo-note.example/note@5",
  stageRef:"declaration://stdo-note.example/note-stage@5",stageGraphFunctionRef:"graph-function://stdo-note.example/note-stage@5",
  authorLocusRef:"locus://stdo-note.example/note/author@5",assessorLocusRef:"locus://stdo-note.example/note/assessor@5",
  sourceDeclarationRef:"declaration://stdo-note.example/source@5",environmentRef:"declaration://stdo-note.example/stdo-environment@5",
  descriptorRef:"descriptor://stdo-note.example/pilot@5",contributionManifestRef:"contribution-manifest://stdo-note.example/pilot@5",
});
