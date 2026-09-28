import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {runInstalledCliRequest} from '../../../../../build_tenants/abiogenesis/typescript/test_env/support/registered-graph-selection.mjs';
const evidence=new URL('./attempt-04/',import.meta.url);
const read=async name=>JSON.parse(await readFile(new URL(name,evidence)));
const setup=await read('setup.json'),receipt=(await read('case-unsupported.json')).output.receipt;
const resultRead=await read('read-unsupported-run_result.json');
const handoff=await read('final-handoff.json');
assert.equal(resultRead.output.receipt.ownerOutput.outcomeKind,'refusal');
assert.equal(resultRead.output.receipt.ownerOutput.value.code,'not_found');
assert.deepEqual(resultRead.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
const prior=JSON.parse(await readFile(setup.scratch+'/st4-human-run_replay-request.jsonl'));
const installedRoot=setup.installedRoots[0];
const product=await import(pathToFileURL(installedRoot+'/build/code/src/product/index.js'));
const publicApi=await import(pathToFileURL(installedRoot+'/build/code/src/public/index.js'));
const issued=prior.invocation.invocation;
// Reuse the Product-issued member coordinates retained in the successful
// Public replay read. Construct new request identity through the installed owner.
const coordinates={operations:[{operationId:issued.definitionKey.operationId,members:[{memberKey:'run_replay',slots:{
  request:issued.requestContract,result:issued.expectedResultContract,refusal:issued.expectedRefusalContract,nonTerminal:issued.expectedNonTerminalContract}}]}]};
const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
const call=publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates:coordinates,
  contractCatalog:issued.contractCatalog,operationId:issued.definitionKey.operationId,memberKey:'run_replay',
  request:{...issued.request,source:{sourceKind:'run',sourceRef:receipt.resources.run.ref,sourceDigest:receipt.resources.run.digest},
    projectionBasis:{projectionBasisRef:handoff.prefix.eventLogRef,projectionBasisDigest:handoff.prefix.coordinateDigest}},
  slots:issued.invocationAuthority.slots,resources:{...prior.invocation.resources,eventResource},
  requestRef:'public-request://registered-selection/unsupported-replay-readback',correlationRef:'correlation://registered-selection/unsupported-replay-readback',
  eventTime:issued.eventTime,provenanceRefs:issued.provenanceRefs});
const replay=await runInstalledCliRequest({scratch:setup.scratch,installedRoot,identity:'unsupported-run_replay-readback',acquisition:{kind:'reopen',closeHandoff:handoff},call});
await writeFile(new URL('read-unsupported-run_replay.json',evidence),JSON.stringify(replay,null,2)+'\n');
assert.equal(replay.output.receipt.ownerOutput.outcomeKind,'result');
assert.deepEqual(replay.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
assert.deepEqual(replay.output.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);
assert.deepEqual(replay.output.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
await writeFile(new URL('events.jsonl',evidence),await readFile(new URL(handoff.prefix.eventLogRef)));
console.log(JSON.stringify({gapResult:'not_found',gapReplay:'agrees',prefixUnchanged:true,resultWallMs:resultRead.wallMs,replayWallMs:replay.wallMs,providerInvocations:0}));
