// One installed Public start of the amendment witness over the default-library
// topology, shared by the witness and the recoverable-failure unit file.
import assert from 'node:assert/strict';
import {readFile,writeFile,cp,chmod,readdir} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as product from '../../build/code/src/product/index.js';
import {setupInstalledRootCatalog,installTenantOnce,openCaseEnvironment} from './root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest} from './registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessRef,schemaPath} from './default-library.mjs';
import {amendmentWitnessInput,amendmentPrerequisites,amendmentRef,witnessFixtureRoot} from './amendment-witness.mjs';

export const packageRoot=new URL('../..',import.meta.url).pathname;
export const seed=join(witnessFixtureRoot,'seed'),standIn=join(witnessFixtureRoot,'stand-in');
const actorModule=new URL('./amendment-witness-actor.mjs',import.meta.url).pathname;
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
export const PURPOSES=['induction','design','construction','testing','review','uat'],BOUND=16;
export const json=async path=>JSON.parse(await readFile(path,'utf8'));
export const definitionPath=join(witnessFixtureRoot,'process-definition.json');
export const amendmentPath=name=>join(witnessFixtureRoot,`amendment-${name}.json`);
export async function tree(root,prefix=''){
  const out=new Map();
  for(const e of await readdir(join(root,prefix),{withFileTypes:true})){const rel=prefix?prefix+'/'+e.name:e.name;
    if(e.isDirectory())for(const [k,v] of await tree(root,rel))out.set(k,v);else if(e.isFile())out.set(rel,product.sha256Bytes(await readFile(join(root,rel))));}
  return out;
}
export const within=(path,roots)=>roots.some(r=>r===path||path.startsWith(r+'/'));
export async function standInActor(dir){
  const actor=join(dir,'amendment-actor.mjs');await writeFile(actor,`#!${process.execPath}\nimport ${JSON.stringify(pathToFileURL(actorModule).href)};\n`);await chmod(actor,0o755);return actor;
}
// What is installed: the tenant and the consumer fixture Product, whose
// declaration depends on the process definition and the recursion bound.
function witnessInstallOptions(definition,bound,selected){
  return {candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',
    prepareAdditionalProducts:async setup=>{
      selected.environment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,
        declarationFactory:g=>libraryConsumerDeclaration(g,library,selected.environment.declaration,{purposes:PURPOSES,bound,prerequisites:amendmentPrerequisites(definition)}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:join(seed,definition.acceptance.resultSchema),contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[amendmentRef('support','amended-requirement-realized')]}]})];
    }};
}
const caseOptions={workspaceProductIndex:1,additionalCorePublicationConstructors:constructors};
/** One install for the witness Runs of a test file at one recursion bound:
 * the tenant and the consumer fixture Product, packed, verified and installed
 * once (installOncePerFile). Each Run still opens its own store, workspace and
 * scratch root on it. */
export async function installWitnessTenant({bound=BOUND}={}){
  const selected={},install=await installTenantOnce(packageRoot,witnessInstallOptions(await json(definitionPath),bound,selected));
  return {install,bound,selectedEnvironment:selected.environment,dispose:()=>install.dispose()};
}
/** One installed Public start. Returns this Run's admitted events, the whole
 * admitted log (`allEvents`) and the worksite; the caller supplies the actor.
 * With `shared` (bound => the file's install for that bound) the Run opens its
 * own environment on the shared install; otherwise it installs for itself. */
export async function runWitness(t,{amendment,actorEnvironment,keep=false,accounting,adjust=input=>input,bound=BOUND,shared}){
  const definition=await json(definitionPath),selected={};let env,selectedEnvironment;
  if(shared===undefined){
    env=await setupInstalledRootCatalog(keep?{after:()=>{}}:t,packageRoot,{...caseOptions,
      ...(accounting?{setupAccounting:accounting}:{}),...witnessInstallOptions(definition,bound,selected)});
    selectedEnvironment=selected.environment;
  }else{
    assert.ok(!keep&&accounting===undefined,'a kept or accounted Run installs for itself');
    const witnessInstall=await shared(bound);assert.equal(witnessInstall.bound,bound);
    env=await openCaseEnvironment(t,witnessInstall.install,caseOptions);selectedEnvironment=witnessInstall.selectedEnvironment;
  }
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  const preexisting=await tree(worksite);
  await cp(seed,worksite,{recursive:true});
  const joined=await amendmentWitnessInput({processDefinition:definition,amendment,seedRoot:worksite,product}),input=adjust(joined.state),derivation=joined.derivation;
  const initialTree=await tree(worksite);
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'amendment-witness',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'amendment-witness-start',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,
    environment:{...process.env,...actorEnvironment}});
  const receipt=execution.output?.receipt;assert.ok(receipt,JSON.stringify(execution).slice(0,4000));
  if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;
  const allEvents=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),events=allEvents.slice(before);
  return {env,worksite,definition,input,derivation,preexisting,initialTree,execution,receipt,events,allEvents,results:events.filter(e=>e.kind==='c_call_result_admitted')};
}
/** Worksite paths a Run changed: framework entries present before the seed copy and the declared archive root excluded. */
export async function changedPaths(run){
  const archives=[...new Set(run.events.filter(e=>e.kind==='actor_transport_binding_admitted').map(e=>relative(run.worksite,e.payload.archiveRoot)))],finalTree=await tree(run.worksite);
  return [...new Set([...run.initialTree.keys(),...finalTree.keys()])].filter(p=>!run.preexisting.has(p)&&!within(p,archives)&&run.initialTree.get(p)!==finalTree.get(p)).sort();
}
