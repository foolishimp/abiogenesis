import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {borrowCurrentOperationResource} from './operation-resource.mjs';
import {publicOperationBasis} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs';

const root=dirname(fileURLToPath(import.meta.url)),inputs=JSON.parse(readFileSync(join(root,'inputs.json'),'utf8'));
const host=JSON.parse(readFileSync(inputs.host.path,'utf8')),compiled=join(host.installedRoot,'build/code/src');
const load=name=>import(pathToFileURL(join(compiled,name+'.js')).href);
const [resourceOwner,storeOwner,environmentOwner,product,admission]=await Promise.all([
 load('abg/definition_event_resource'),load('abg/event_store'),load('abg/environment_admission'),load('product/index'),load('product/admission_authority'),
]);
const source='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/event-memory-repair-35/owner-history.physical-prefix.jsonl';
const bytes=readFileSync(source),sourceDigest=createHash('sha256').update(bytes).digest('hex');
assert.equal(sourceDigest,'d37d30df4ba656cab7b31e233ca566fa9ba97b830f564568f13f9bac3990a89f');
assert.equal(bytes.length,6191541);
const fixtureRoot=join(root,'fixture');mkdirSync(fixtureRoot,{recursive:true});
const opened=[];
function acquireCopy(label) {
 const path=join(fixtureRoot,label+'.jsonl');writeFileSync(path,bytes,{flag:'wx'});const stat=statSync(path);
 const body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath:path,device:stat.dev,inode:stat.ino,eventLogDigest:'sha256:'+sourceDigest,durableByteLength:bytes.length,eventContractDigest:storeOwner.ROOT_EVENT_CONTRACT_DIGEST};
 const initial=storeOwner.reopenEventStore({...body,authorityDigest:product.sha256Canonical(body)});
 assert.equal(initial.kind,'reopened_event_store_context',JSON.stringify(initial));
 const handoff=storeOwner.closeHeldEventStoreAtDurablePrefix(initial.store,initial.prefix);
 const result=resourceOwner.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
 assert.equal(result.kind,'acquired_abg_event_resource',JSON.stringify(result));opened.push(result.resource);return result.resource;
}
const failures=[];
function refuses(label,operation,pattern) {
 let error;try{operation();}catch(e){error=e;}
 assert.ok(error,label+' must refuse before use');if(pattern)assert.match(String(error.message),pattern);
 failures.push({label,name:error.name,message:error.message});
}
let output;
try {
 const enclosing=acquireCopy('advancing'),initial=resourceOwner.selectAcquiredAbgEventResource(enclosing,enclosing.entryPrefix);
 const truth=environmentOwner.projectExactPrefixWorkspaceEnvironment(initial.prefix,{
  ref:JSON.parse(bytes.toString('utf8').split('\n')[2]).payload.artifactRef,
  digest:JSON.parse(bytes.toString('utf8').split('\n')[2]).payload.authorityScopeDigest,
 });
 assert.equal(truth.kind,'exact_prefix_workspace_environment',JSON.stringify(truth));
 assert.equal(truth.artifactTruth.prefixEventCount,434);
 const binding={ref:truth.workspaceBinding.bindingId,digest:truth.workspaceBinding.bindingDigest};
 assert.equal(admission.admitCapabilityEnvironment(product.admissionEnvironmentSelection(initial.prefix,binding),enclosing).kind,'exact_prefix_workspace_environment');
 const operation=borrowCurrentOperationResource(resourceOwner,enclosing,initial);
 const manifest={workspaceId:'workspace://abi5-tests/174/fixture-sibling',canonicalRoot:join(fixtureRoot,'workspace-sibling'),authorityMode:'trusted_developer',authorizedActorRef:'actor://abi5-tests/174/fixture-owner'};
 const authority=product.constructWorkspaceAuthorityBasis({...manifest,authorityManifestRef:'manifest://abi5-tests/174/fixture-sibling',authorityManifestDigest:product.sha256Canonical(manifest)});
 assert.equal(authority.kind,'workspace_authority_basis',JSON.stringify(authority));
 const candidate=product.constructWorkspaceBinding(authority,truth.productSet,truth.resolvedProductLock,Object.fromEntries(Object.keys(truth.workspaceBinding.roots).map(key=>[key,join(fixtureRoot,'workspace-sibling',key)])));
 assert.equal(candidate.kind,'workspace_binding_candidate',JSON.stringify(candidate));
 const appended=environmentOwner.admitWorkspaceBinding(operation.store,candidate,{
  ...publicOperationBasis(product,'abg.operation.workspace.bind',candidate.bindingId,candidate.bindingDigest,'invocation://abi5-tests/174/fixture-bind',truth.productInstalls.map(x=>x.admissionEventRef)),
  predecessorPrefix:operation.entryPrefix,
 },authority);
 assert.equal(appended.kind,'artifact_owner_result',JSON.stringify(appended));assert.equal(appended.disposition,'admitted');
 const completed=resourceOwner.completeAbgEventResource(operation,appended.successorPrefix);
 assert.equal(completed.kind,'abg_event_resource_completion');
 assert.deepEqual(completed.entryPrefix,initial.prefix);
 assert.ok(completed.successor.prefix.prefixLength>initial.prefix.prefixLength);
 const successor=completed.successor,bound=product.admissionEnvironmentSelection(successor.prefix,binding);
 refuses('initial enclosing acquisition at advancing cut',()=>admission.admitCapabilityEnvironment(bound,enclosing),/held store differs from the selected durable prefix/);
 refuses('stale nominal selection',()=>borrowCurrentOperationResource(resourceOwner,enclosing,initial),/held store differs from the selected durable prefix/);
 refuses('copied current nominal selection',()=>borrowCurrentOperationResource(resourceOwner,enclosing,structuredClone(successor)),/acquired_abg_event_resource/);
 const current=borrowCurrentOperationResource(resourceOwner,enclosing,successor);
 const accepted=admission.admitCapabilityEnvironment(bound,current);
 assert.equal(accepted.kind,'exact_prefix_workspace_environment');assert.deepEqual(accepted.workspaceBinding,truth.workspaceBinding);
 const sibling=admission.admitCapabilityEnvironment(product.admissionEnvironmentSelection(successor.prefix,{ref:appended.value.bindingId,digest:appended.value.bindingDigest}),current);
 assert.deepEqual(sibling.workspaceBinding,appended.value);
 assert.deepEqual(storeOwner.selectHeldEventStoreDurablePrefix(enclosing.store),successor.prefix,'Borrowed completion must leave enclosing store held');
 const foreign=acquireCopy('foreign'),foreignSelection=resourceOwner.selectAcquiredAbgEventResource(foreign,foreign.entryPrefix);
 refuses('foreign nominal selection',()=>borrowCurrentOperationResource(resourceOwner,enclosing,foreignSelection),/Foreign operation resource/);
 const foreignClose=resourceOwner.closeAbgEventResource(foreign,foreign.entryPrefix);opened.splice(opened.indexOf(foreign),1);
 const closed=resourceOwner.closeAbgEventResource(enclosing,successor.prefix);opened.splice(opened.indexOf(enclosing),1);
 assert.deepEqual(closed.entryPrefix,initial.prefix);assert.deepEqual(closed.closeHandoff.prefix,successor.prefix);
 refuses('closed enclosing owner',()=>storeOwner.selectHeldEventStoreDurablePrefix(enclosing.store),/held|owner|closed|durable/i);
 output={disposition:'PASS',source:{path:source,sha256:sourceDigest,byteCount:bytes.length,events:434},actualOwnerRoot:host.installedRoot,initialPrefix:initial.prefix,successorPrefix:successor.prefix,append:{admissionEventRef:appended.admissionEventRef,invocationRef:'invocation://abi5-tests/174/fixture-bind',binding:{ref:appended.value.bindingId,digest:appended.value.bindingDigest}},completionKind:completed.kind,currentBorrowedEnvironmentAccepted:true,originalBindingConserved:true,newBindingProjected:true,enclosingHeldAfterCompletion:true,normalClose:closed,foreignClose,refusals:failures,limits:'Real copied434-row owner history plus one controlled canonical sibling binding admission. Exact admitCapabilityEnvironment guard only; no actual campaign resource, current source-use, full nominal capability grant, installed dispatch, native/model/UAT or capacity claim.'};
 writeFileSync(join(root,'fixture-result.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
 process.stdout.write(JSON.stringify({disposition:output.disposition,events:434,newAdmissions:1,guard:'admitCapabilityEnvironment',refusals:failures.map(x=>x.label),fullNominalGrant:false})+'\n');
} finally {
 for(const resource of opened){const prefix=storeOwner.selectHeldEventStoreDurablePrefix(resource.store);resourceOwner.closeAbgEventResource(resource,prefix);}
}
