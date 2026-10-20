import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {installedFullSandboxApis} from './caller/test/full-sandbox-support.mjs';
const D=import.meta.dirname,read=async name=>JSON.parse(await readFile(join(D,name),'utf8'));
const prepared=await read('prepared.json'),basis=await read('readback-basis.json');
assert.equal(prepared.status,'CLOSED_PREPARED_NOT_LAUNCHED');
const {product}=await installedFullSandboxApis(prepared.core.packageRoot);
assert.equal(await product.sha256File(prepared.launchPath),prepared.launchDigest);
const launch=await read('intake-start.jsonl'),input=launch.invocation.invocation.request.input.value;
assert.equal(product.sha256Canonical(input),product.sha256Canonical(prepared.input));
assert.deepEqual(input.sourceRun,prepared.sourceRun);assert.deepEqual(input.sourcePrefix,prepared.sourcePrefix);
const consumer=basis.environment.productInstalls.find(row=>row.productId===prepared.consumer.basis.productId);assert(consumer);
const record={kind:'odd_glc_full_sandbox_prepared',schemaVersion:'3',key:'bootstrap-native-d2-intake',scenarioId:'SCN-GLC-HELLO-WORLD-JS-SDLC-BOOTSTRAP',
 status:'prepared_not_live_qualified',scratch:D,setupRoot:D,workspaceRoot:prepared.workspaceRoot,freshNative:true,maximumActorOccurrences:1,
 abiRoot:basis.abiRoot,consumerRoot:consumer.installedRoot,cliPath:join(prepared.core.packageRoot,'build/code/src/public/cli.js'),
 launchPath:prepared.launchPath,launchDigest:prepared.launchDigest,ordinal:basis.ordinal,inputDigest:product.sha256Canonical(input),
 setupPrefix:prepared.successorCloseHandoff.prefix,abiArtifact:prepared.core.basis,oddGlcArtifact:prepared.consumer.basis,
 lifecycle:{declarationRef:basis.declaration.declarationRef,declarationDigest:product.sha256Canonical(basis.declaration),stageRefs:basis.declaration.stages.map(row=>row.declarationRef),programRef:prepared.programRef,programDigest:prepared.programDigest,actorLeafCount:1},
 transport:prepared.transport,noSubjectExecution:true,noLiveActors:true,
 boundary:'Root authorized one complete declared intake; any next invocation requires its ordinary Result selectionChoice and unique published suffix. No local stages or retry.'};
await writeFile(join(D,'native-prepared.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'existing_launcher_record_selected',programRef:prepared.programRef,inputDigest:record.inputDigest,setupPrefix:record.setupPrefix}));
