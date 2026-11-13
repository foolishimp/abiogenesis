import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {installedModules,publicCaller,requireKind} from '../operator-client/public-setup.mjs';
import {exclusiveRecord,workerEnvironment} from '../operator-client/runner.mjs';
const B=dirname(fileURLToPath(import.meta.url)),D=dirname(B),json=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const retained=await json(join(D,'q23-author-03/execution/after-run-resume.json')),selection=await json(join(B,'ROOT_SELECTION.json'));
assert.equal(hash(await readFile(selection.resume.path)),selection.resume.sha256);
const config={...retained.config,runId:'release-qualification-native-author-binding-01',provider:{enabled:false}};
const environment=workerEnvironment(config);for(const k of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(k)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(k))delete process.env[k];Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),{product,abg}=runtime,record=(p,v,raw=false)=>exclusiveRecord(B,p,v,raw),caller=publicCaller({root:B,runtime,native:retained.native,config,record,command:()=>{throw Error('No commands/providers selected')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
const {state}=caller;assert.equal(state.resource,null);assert.equal(state.selection,null);
await record('run.json',{kind:'existing_owner_binding_selection',sourceCommit:config.sourceCommit,providerCalls:0,setupRepeats:0});
await record('CONSUMER_BINDING_RETAINED.json',{binding:state.binding,catalog:state.catalog,catalogView:state.catalogView,closeHandoff:state.closeHandoff,workspaceAuthority:retained.workspaceAuthority});
const before=await json(join(D,'q23-author-03/SOURCE_BEFORE.json'));for(const f of before.files)assert.equal(hash(await readFile(join(config.worksiteRoot,f.relativePath))),f.sha256,f.relativePath);
const oldReadiness=state.catalog.readinessBasis,workspaceManifest=await json(join(D,'runtime-001/workspace-manifest.json')),acquisitions=await Promise.all(['abg','consumer'].map(n=>json(join(D,'runtime-001',n+'-acquisition.json'))));
const verifiedProducts=oldReadiness.verifiedProducts,publications=oldReadiness.publications,resolvedLock=state.resolvedLock,lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
let failure;
try {
 caller.acquire(caller.reopen());const env=caller.refresh(),installations=env.productInstalls,roots={...env.workspaceBinding.roots,productRoot:retained.installedRoot},fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
 const bound=await caller.invoke('workspace-bind',await caller.authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,{workspaceAuthority:{ref:retained.workspaceAuthority.authorityBasisId,digest:retained.workspaceAuthority.authorityBasisDigest},installedSet:installations.map(product.productInstallCoordinate),resolvedLock:lock,declaredRoots:Object.entries(fields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},{kind:'product_workspace_binding_resource_assertion',schemaVersion:'5.0.0',eventResource:state.selection,workspaceAuthority:retained.workspaceAuthority,workspaceManifest,admittedInstalls:installations,resolvedLock,declaredRoots:roots},{product_set:installations.map(product.productInstallCoordinate),dependency_lock:lock,actor:caller.actor}));
 state.binding=bound.receipt.ownerOutput.value.binding;caller.refresh();assert.equal(state.environment.workspaceBinding.roots.productRoot,retained.installedRoot);
 const published=await caller.invoke('catalog-admit',await caller.authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,{workspaceBinding:state.binding,descriptors:acquisitions.map(x=>x.verification.coordinates.descriptor),contributionManifests:verifiedProducts.map(x=>({ref:x.contributionManifestRef,digest:x.contributionManifestDigest})),resolvedLock:lock},{kind:'catalog_admission_resource_assertion',schemaVersion:'5.0.0',eventResource:state.selection,workspaceBinding:state.environment.workspaceBinding,resolvedLock,verifiedProducts,admittedInstalls:state.environment.productInstalls,publications},{...caller.boundSlots(),dependency_lock:lock}));
 caller.refresh();const installedProducts=state.environment.productInstalls.map(i=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,i.admissionEventRef).candidate);
 state.catalog=requireKind(product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:'5.0.0',memberKey:'admit',readinessBasis:{workspaceBinding:state.environment.workspaceBindingCandidate,resolvedLock,verifiedProducts,installedProducts,publications}}),'graph_function_catalog','catalog-projection');assert.equal(published.receipt.ownerOutput.value.catalog.digest,state.catalog.basisDigest);
 const allowlist=[product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef];
 await caller.invoke('catalog-view',await caller.authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,{catalog:published.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion:'5.0.0',catalog:state.catalog},{...caller.boundSlots(),dependency_lock:lock}));
 state.catalogView=requireKind(product.narrowGraphFunctionCatalog(state.catalog,allowlist),'graph_function_catalog_view','catalog-view-projection');
 await record('BINDING_RESULT.json',{status:'EXISTING_NATIVE_AUTHOR_BINDING_ADMITTED',binding:state.binding,productRoot:state.environment.workspaceBinding.roots.productRoot,catalogBasisDigest:state.catalog.basisDigest,catalogViewDigest:state.catalogView.viewDigest,allowlist,providerCalls:0,ProductEdits:0,setupRepeats:0});
}catch(e){failure=e;await record('BINDING_FAILURE.json',{name:e.name,message:e.message,observation:e.observation??null});}
finally {if(state.resource!==null)await record('ACTUAL_CLOSE.json',caller.close());await record('after-binding-resume.json',{...retained,config,state:{...state,environment:null}});}
for(const f of before.files)assert.equal(hash(await readFile(join(config.worksiteRoot,f.relativePath))),f.sha256,f.relativePath);
if(failure)throw failure;
console.log(JSON.stringify({status:'EXISTING_NATIVE_AUTHOR_BINDING_ADMITTED',binding:state.binding,prefix:state.closeHandoff.prefix,providerCalls:0}));
