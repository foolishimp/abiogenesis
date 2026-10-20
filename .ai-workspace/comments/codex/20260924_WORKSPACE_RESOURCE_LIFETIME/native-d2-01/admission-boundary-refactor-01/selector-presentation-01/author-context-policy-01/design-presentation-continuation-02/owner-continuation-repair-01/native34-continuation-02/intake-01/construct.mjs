import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
import {installedFullSandboxApis,prepareFullSandboxTransport} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
const D=import.meta.dirname,OLD="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/admission-boundary-refactor-01/selector-presentation-01/author-context-policy-01/design-presentation-continuation-02/owner-continuation-repair-01/native34-continuation-01",read=async p=>JSON.parse(await readFile(p,'utf8')),save=async(n,v)=>writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const started=performance.now(),original=await read(join(OLD,'intake-01/native-prepared.json')),selection=await read(join(D,'../preparation/selection.json'));
const {product,abg}=await installedFullSandboxApis(original.abiRoot);
const receipt=await read(join(OLD,'intake-01/live-receipt.json')),close=receipt.receipt.resources.eventResource.closeHandoff;
assert.equal(close.prefix.prefixLength,324503143);assert.equal(close.prefix.coordinateDigest,'sha256:7c7e80d791372ef31f52b4cb0076cdab9ab5a5818ffc7f50943d29f8c189a83f');
assert.equal(receipt.receipt.ownerOutput.value.result,null);
const transport=await prepareFullSandboxTransport(selection.transportConfiguration,{product,abg});
assert.deepEqual({...transport.configuration,extraArgs:['--max-budget-usd','5']},original.transport.configuration);
assert.equal(transport.executableDigest,original.transport.executableDigest);
const fresh={...original,scratch:D,setupRoot:D,transport};
await copyFile(join(OLD,'intake-01/readback-basis.json'),join(D,'readback-basis.json'));
await save('native-prepared.json',fresh);
await save('constructor-checks.json',{status:'CLOSED_FILE_CONSTRUCTION_NO_RUNTIME',elapsedMs:performance.now()-started,afterReceiptPath:join(OLD,'intake-01/live-receipt.json'),afterReceiptDigest:await product.sha256File(join(OLD,'intake-01/live-receipt.json')),currentClose:close.prefix,sourceRun:selection.sourceRun,sourcePrefix:selection.sourcePrefix,existingLaunchPath:original.launchPath,existingLaunchDigest:original.launchDigest,unchangedInputDigest:original.inputDigest,currentBindingSource:join(OLD,'intake-01/readback-basis.json'),copiedRequiredReadbackBasisByteIdentity:(await product.sha256File(join(D,'readback-basis.json'))) === (await product.sha256File(join(OLD,'intake-01/readback-basis.json'))),transport,actualNewInvocation:'Not constructed here; existing executeFullSandbox afterReceiptPath/definitionCall owns successor resource/steering at execution.',runtimeCalls:0,providerCalls:0});
console.log(JSON.stringify({status:'CLOSED_FILE_CONSTRUCTION_NO_RUNTIME',transportDigest:transport.transportDigest,currentClose:close.prefix.coordinateDigest}));

