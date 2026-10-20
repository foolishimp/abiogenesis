import assert from 'node:assert/strict';
import {readFile,writeFile,symlink} from 'node:fs/promises';
import {join} from 'node:path';
import {installedFullSandboxApis,constructFullSandboxEnvironmentResources} from '../bootstrap-preparation-03/caller/test/full-sandbox-support.mjs';
import {definitionCall} from '../bootstrap-preparation-03/caller/test/generic-live-workflow-support.mjs';
const D=import.meta.dirname,P=join(D,'../bootstrap-preparation-03'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const [prepared,priorRecord,basis,oldTransport,receipt,closedResolution,selection]=await Promise.all(['prepared.json','native-prepared.json','readback-basis.json','live-start.jsonl','live-receipt.json','execution-resolution.json','selection.json'].map(n=>read(join(P,n))));
const {product,gtl,installedPublic}=await installedFullSandboxApis(priorRecord.abiRoot),hash=product.sha256Canonical;
const old=oldTransport.invocation,slots=old.invocation.invocationAuthority.slots,environment=basis.environment;
const close=receipt.receipt.resources.eventResource.closeHandoff;
assert.equal(receipt.receipt.ownerOutput.value.code,'invalid_capability');assert.equal(receipt.receipt.resources.run,null);
assert.equal(hash(close),hash(prepared.successorCloseHandoff));
const program=basis.publication.programs.find(p=>p.programRef===old.invocation.request.program.ref);assert(program);
assert.equal(hash(program),closedResolution.resolution.programDigest);
const packet=product.RUN_OPERATION_CONTRACTS.invoke.start;
// Same exact selected Program and reviewed F_D/F_P, no F_H or local stage selection.
const policy=product.constructRootInvocationPolicy(environment.workspaceBinding,program,[],['F_D','F_P'],old.resources.applications);
const grantBasis={admittedInstalls:environment.productInstalls,workspaceBinding:environment.workspaceBinding,fixedPacket:packet};
const grants=[product.constructCapabilityGrant(policy,basis.actorRef,packet.definitionKey.operationId,product.DIRECT_INVOKE_CAPABILITY,grantBasis)];
const entries=old.resources.catalogView.entries.filter(row=>row.definitionRef===closedResolution.resolution.graphFunctionRef);assert.equal(entries.length,1);
const authority=product.constructInvocationAuthority(basis.actorRef,environment.workspaceBinding,old.resources.catalogView,program.programRef,entries[0],policy,grants,grantBasis);
assert.equal(authority.kind,'invocation_authority');
const envDeclaration=basis.publication.runEnvironments.find(row=>row.declarationRef===program.policies[gtl.RUN_ENVIRONMENT_POLICY]);assert(envDeclaration);
const configuration=await read(selection.configurationSource);
const runEnvironmentResources=constructFullSandboxEnvironmentResources({product,declaration:envDeclaration,configuration:configuration.runEnvironmentResources,authority,program,temporaryRoot:old.resources.runEnvironmentResources.temporaryRoot});
assert.equal(hash(runEnvironmentResources),hash(old.resources.runEnvironmentResources),'reconstructed permission remains identical');
const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:close,handoffDigest:hash(close)};
const remintedSlots={...slots,
 product_set:environment.productInstalls.map(install=>({ref:install.installId,digest:install.productContentDigest})),
 session_policy:{ref:policy.policyRef,digest:policy.policyDigest},
 capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},
 actor:{actor:{ref:basis.actorRef,digest:hash({actorRef:basis.actorRef})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},
 transport_steering:{ref:'transport-steering://abiogenesis/'+hash(eventResource).slice(7),digest:hash(eventResource)}};
assert.equal(grants.length,1);
for(const key of Object.keys(slots).filter(k=>k!=='product_set'))assert.equal(hash(remintedSlots[key]),hash(slots[key]),key+' reconstructed from unchanged basis');
const corrected=definitionCall({publicApi:installedPublic,product,verified:basis.abiArtifact,...packet.definitionKey,ordinal:2301,
 request:old.invocation.request,slots:remintedSlots,resources:{...old.resources,runEnvironmentResources,eventResource}});
assert.equal(hash(corrected.invocation.request),hash(old.invocation.request),'source Run/prefix and request unchanged');
assert.equal(hash(corrected.resources),hash(old.resources),'resource/permission/binding/close unchanged');
assert.notEqual(corrected.invocation.invocationDigest,old.invocation.invocationDigest);
const {invocationRef,invocationDigest,...body}=corrected.invocation;assert.equal(hash(body),invocationDigest);assert.equal(invocationRef,'invocation://abiogenesis/'+invocationDigest.slice(7));
const {authorityDigest,...authorityBody}=corrected.invocation.invocationAuthority;assert.equal(hash(authorityBody),authorityDigest);
const changes=remintedSlots.product_set.map(row=>({installId:row.ref,oldDigest:slots.product_set.find(old=>old.ref===row.ref).digest,newDigest:row.digest}));assert.equal(changes.length,2);assert(changes.every(row=>row.oldDigest!==row.newDigest));
await save('intake-start.jsonl',{kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:close},invocation:corrected});
// Existing launcher reads this immutable setup record; a filesystem reference avoids copying its body.
await symlink(join(P,'readback-basis.json'),join(D,'readback-basis.json'));
await save('basis-reference.json',{path:join(P,'readback-basis.json'),sha256:await product.sha256File(join(P,'readback-basis.json')),localReadReference:'readback-basis.json',mode:'symlink to immutable predecessor; no semantic rehydration or runtime acquisition'});
const record={...priorRecord,scratch:D,setupRoot:P,launchPath:join(D,'intake-start.jsonl'),launchDigest:await product.sha256File(join(D,'intake-start.jsonl')),ordinal:2301,
 setupPrefix:close.prefix,boundary:'Root-authorized corrected ordinary intake over unchanged setup. Only current Product content authority coordinates are corrected through constructors; one launch, no local progression.'};
await save('native-prepared.json',record);
await save('constructor-checks.json',{status:'CLOSED caller construction and shape checks passed; native owner admission unexecuted',producer:'construct.mjs',predecessor:{request:join(P,'live-start.jsonl'),requestDigest:await product.sha256File(join(P,'live-start.jsonl')),receipt:join(P,'live-receipt.json'),receiptDigest:await product.sha256File(join(P,'live-receipt.json'))},changes,oldInvocation:{ref:old.invocation.invocationRef,digest:old.invocation.invocationDigest},newInvocation:{ref:invocationRef,digest:invocationDigest},ownerConstructors:['constructRootInvocationPolicy','constructCapabilityGrant','constructInvocationAuthority','constructRunEnvironmentResources','definitionCall'],grantCount:grants.length,program:old.invocation.request.program,sourceRun:old.invocation.request.input.value.sourceRun,sourcePrefix:old.invocation.request.input.value.sourcePrefix,currentPrefix:close.prefix,unchanged:{request:true,resources:true,policyAndGrant:true,environmentPermission:true,transport:hash(record.transport)===hash(priorRecord.transport)},limits:'No private predicate or runtime owner called. Independent review established the complete authority predicate; actual installed start is the next discriminator.'});
console.log(JSON.stringify({status:'corrected constructor frozen',invocationRef,changes,closeBytes:close.prefix.prefixLength}));
