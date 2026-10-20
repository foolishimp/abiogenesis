import assert from 'node:assert/strict';
import {readFile,writeFile,symlink} from 'node:fs/promises';
import {join} from 'node:path';
import {installedFullSandboxApis} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
import {definitionCall} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/generic-live-workflow-support.mjs';
const D=import.meta.dirname,P=join(D,'../preparation'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const prepared=await read(join(P,'prepared.json')),basis=await read(join(P,'readback-basis.json'));
const previous=await read(join(P,'intake-start.jsonl')),old=previous.invocation;
const witness=await read(join(D,'../witness-01/result.json'));
assert.equal(witness.status,'PUBLIC_ROOT_AND_WITNESS_ADMITTED');
const close=(await read(join(D,'../witness-01/setup-resource-close.json'))).receipt.closeHandoff;
const {product,installedPublic}=await installedFullSandboxApis(basis.abiRoot),hash=product.sha256Canonical;
const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:close,handoffDigest:hash(close)};
const digest=hash(eventResource);
const call=definitionCall({publicApi:installedPublic,product,verified:basis.abiArtifact,...old.invocation.definitionKey,ordinal:3001,
 request:old.invocation.request,slots:{...old.invocation.invocationAuthority.slots,transport_steering:{ref:'transport-steering://abiogenesis/'+digest.slice(7),digest}},resources:{...old.resources,eventResource}});
assert.equal(hash(call.invocation.request),hash(old.invocation.request));
assert.deepEqual(call.invocation.request.input.value.sourceRun,prepared.sourceRun);
assert.deepEqual(call.invocation.request.input.value.sourcePrefix,prepared.sourcePrefix);
await save('intake-start.jsonl',{kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:close},invocation:call});
await symlink(join(P,'readback-basis.json'),join(D,'readback-basis.json'));
const abiRoot=basis.abiRoot,consumerRoot=basis.environment.productInstalls.find(x=>x.productId===prepared.consumer.basis.productId).installedRoot;
const record={kind:'odd_glc_full_sandbox_prepared',schemaVersion:'3',key:'bootstrap-native-d2-intake',scenarioId:'SCN-GLC-HELLO-WORLD-JS-SDLC-BOOTSTRAP',status:'prepared_not_live_qualified',scratch:D,setupRoot:P,workspaceRoot:prepared.workspaceRoot,
 freshNative:true,maximumActorOccurrences:1,abiRoot,consumerRoot,cliPath:join(abiRoot,'build/code/src/public/cli.js'),launchPath:join(D,'intake-start.jsonl'),launchDigest:await product.sha256File(join(D,'intake-start.jsonl')),ordinal:3001,inputDigest:hash(prepared.input),setupPrefix:close.prefix,
 abiArtifact:prepared.core.basis,oddGlcArtifact:prepared.consumer.basis,transport:prepared.transport,readbackMs:prepared.readbackMs,
 lifecycle:{declarationRef:basis.declaration.declarationRef,declarationDigest:hash(basis.declaration),stageRefs:basis.declaration.stages.map(x=>x.stageRef),programRef:prepared.programRef,programDigest:prepared.programDigest,actorLeafCount:1},
 boundary:'One native intake after genuine original-public-root binding reprice; original source Run/prefix unchanged. Only actual returned selectionChoice may choose one published whole correction suffix.'};
await save('native-prepared.json',record);
await save('constructor-checks.json',{status:'CLOSED ordinary caller construction; actual admission pending',invocation:{ref:call.invocation.invocationRef,digest:call.invocation.invocationDigest},sourceRun:prepared.sourceRun,sourcePrefix:prepared.sourcePrefix,currentPrefix:close.prefix,witnessInvocation:witness.witnessInvocation,requestUnchanged:true,resourceChange:'actual witness close and dependent transport slot through definitionCall',basisPath:join(P,'readback-basis.json'),basisSha256:await product.sha256File(join(P,'readback-basis.json'))});
console.log(JSON.stringify({status:'prepared',invocationRef:call.invocation.invocationRef,currentPrefix:close.prefix.coordinateDigest}));
