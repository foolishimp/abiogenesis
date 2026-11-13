// Root-only staged operator. Existing Product helpers/owners; no automatic retry.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,lstat,stat,realpath,readdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {dualEntryConsumerDeclaration,constructRetainedBStart,retainedTestingAssetHandle} from './operator.mjs';
const D=dirname(fileURLToPath(import.meta.url)),P=join(D,'proof'),mode=process.argv[2],bindingDigest=process.argv[3];
const stages=['setup','run-a','acquire-a','read-a','prepare-b','interrupt-b','recover-b','prepare-continue','continue-b','read-b','proof'];assert(stages.includes(mode),'One explicit Root stage required');
const read=p=>readFile(p,'utf8').then(JSON.parse),hash=b=>createHash('sha256').update(b).digest('hex');
const record=async(n,v)=>writeFile(join(P,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const raw=await readFile(join(D,'BINDING.DRAFT.json'));assert.equal(hash(raw),bindingDigest,'Exact selected packet required');const selection=JSON.parse(raw);if(mode==='setup'){assert(['REVIEWABLE_PROVISIONAL_C3_SETUP_ONLY','FROZEN_HC2_CANDIDATE_OPERATOR_READY'].includes(selection.status),'Exact setup packet required');}else{assert.equal(selection.status,'FROZEN_HC2_CANDIDATE_OPERATOR_READY','Paid/read/recovery stages require final accepted candidate binding');assert(selection.acceptedCandidate?.sha256&&selection.acceptedCandidate?.path,'Root accepted candidate receipt must be pinned');}
const approval=await read(join(D,'ROOT_SELECTION-'+mode+'.json')); assert.equal(approval.bindingSha256,bindingDigest);assert(approval.allowedStages.includes(mode),'Stage not selected by Root');
for(const r of selection.files){const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256,r.path);}
const custodyBytes=await readFile(selection.candidateCustody.path);assert.equal(custodyBytes.length,selection.candidateCustody.bytes);assert.equal(hash(custodyBytes),selection.candidateCustody.sha256);const custody=JSON.parse(custodyBytes);
for(const root of selection.operatorRoots){const st=await lstat(root.path);assert(st.isDirectory()&&!st.isSymbolicLink());assert.equal(await realpath(root.path),root.path);assert.equal(st.dev,root.device);assert.equal(st.ino,root.inode);assert.equal(st.uid,root.uid);}
async function checkPackage(root){for(const r of custody.allArchiveMembers){const p=join(root,r.path),s=await lstat(p);assert(s.isFile()&&!s.isSymbolicLink());const b=await readFile(p);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256,p);}}
const archive=await readFile(custody.archive.path);assert.equal(hash(archive),custody.archive.sha256);if(mode==='setup')await checkPackage(custody.bootstrapPackage);
assert(!Object.keys(process.env).some(k=>k.startsWith('ABI5_SCRIPTED_ACTOR')),'Scripted provider forbidden');
process.env.TMPDIR=selection.runtimeTmp;delete process.env.NPM_CONFIG_CACHE;
process.env.PATH=selection.environment.PATH;process.env.HOME=selection.environment.HOME;process.env.LANG='C.UTF-8';process.env.LC_ALL='C.UTF-8';
process.env.ABG_TS_CLAUDE_COMMAND=selection.provider.wrapper.path;process.env.ABG_TS_WORKER_SANDBOX='agent_default';
process.env.ABG_TS_CLAUDE_APPEND_ARGS=JSON.stringify(['--model',selection.provider.model,'--max-turns',String(selection.provider.maxTurns),'--effort',selection.provider.effort]);
process.env.ABG_TS_FP_TIMEOUT_MS=String(selection.provider.inactivityTimeoutMs);process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS=String(selection.provider.absoluteTimeoutMs);process.env.ABG_TS_FP_TERMINATION_GRACE_MS='5000';
process.env.NODE_OPTIONS='--max-old-space-size=8192';process.env.BASH_DEFAULT_TIMEOUT_MS='4500000';process.env.BASH_MAX_TIMEOUT_MS='4500000';process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS='1';
const support=selection.referenceSupport;
const fixtureSupport=await import(pathToFileURL(join(support,'registered-graph-selection.mjs')).href); // Fixture packaging only; no call-population imports.
const lib=await import(pathToFileURL(join(support,'default-library.mjs')).href);
// Exact C3 shipped signatures are bound for provisional setup only; final accepted candidate gates all later stages.
const loadAt=(root,n)=>import(pathToFileURL(join(root,'build/code/src',n+'.js')).href);
let env,state,product,abg,api,storeOwner,cc;
const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:state.handoff,handoffDigest:product.sha256Canonical(state.handoff)});
const rows=()=>storeOwner.readRuntimeEventsAtDurablePrefix(state.handoff.prefix);
// Exact helper-return relation, checked before any worksite read/write/call preparation.
async function checkedWorkspace(e) {
 assert.equal(typeof e.scratch,'string');assert.equal(typeof e.installedRoot,'string');
 const authority=e.workspaceAuthority,binding=e.workspaceBinding;
 assert.equal(authority?.kind,'workspace_authority_basis');assert.equal(binding?.kind,'workspace_binding');
 for(const field of ['workspaceId','authorityBasisId','authorityBasisDigest','authorizedActorRef'])assert.equal(binding[field],authority[field],'Binding/authority relation: '+field);
 const root=authority.canonicalRoot;assert.equal(typeof root,'string');assert(root.length>0);assert.equal(root,join(e.scratch,'workspace'),'Exact helper-created workspace');
 const st=await lstat(root);assert(st.isDirectory()&&!st.isSymbolicLink());assert.equal(await realpath(root),root);
 for(const name of ['toolchainRoot','productRoot','eventLogRoot','runtimeStateRoot','projectionRoot','archiveRoot'])assert.equal(typeof binding.roots?.[name],'string');
 assert(Array.isArray(e.admittedInstalls)&&e.admittedInstalls.length>0);assert(Array.isArray(e.installedRoots)&&e.installedRoots.includes(e.installedRoot));
 assert(Array.isArray(e.verified?.definitionContractCoordinates?.operations));
 assert.equal(e.catalog?.kind,'graph_function_catalog');assert.equal(e.catalogView?.kind,'graph_function_catalog_view');
 assert(Array.isArray(e.additionalPublications)&&e.additionalPublications.length===1);assert(Array.isArray(e.additionalPublications[0].programs)&&e.additionalPublications[0].programs.length===1);
 assert(Array.isArray(e.additionalProducts)&&e.additionalProducts.length===1);const supplied=e.additionalProducts[0];
 for(const name of ['programRef','graphFunctionRef','startRef'])assert.equal(typeof supplied.ids?.[name],'string');assert.equal(typeof supplied.artifactPath,'string');assert.equal(typeof supplied.basis?.artifactDigest,'string');
 return {canonicalRoot:root,device:st.dev,inode:st.ino,authorityBasisId:authority.authorityBasisId,authorityBasisDigest:authority.authorityBasisDigest,bindingId:binding.bindingId,bindingDigest:binding.bindingDigest};
}
function checkedStart(value) {
 assert.equal(value?.kind,'installed_start_call',JSON.stringify(value));
 assert.equal(value.population?.kind,'populated_product_run_invocation');
 assert(value.call?.invocation?.request&&value.call.resources);
 assert.equal(value.population.resolution?.kind,'loaded_product_execution_resolution');
 assert.equal(typeof value.population.authority?.authorityRef,'string');return value;
}
// Scenario identity only; the shipped owner populates request/slots/resources.
const envelope=identity=>({definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:`public-request://default-library-witness/${identity}`,correlationRef:`correlation://default-library-witness/${identity}`,eventTime:new Date().toISOString(),provenanceRefs:['provenance://default-library-witness/retained-source@5']});
const startIntent=(input,identity,target,programRef,runEnvironmentResources)=>({selection:{memberKey:'start',target,rootMode:'direct',fhMode:'direct'},programRef,catalog:env.catalog,catalogView:env.catalogView,applications:[],admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(env.artifactTruth,install),actorRef:env.workspaceBinding.authorizedActorRef,input:{value:input},inputValueRef:`value://default-library-witness/${identity}/input`,source:{kind:'none'},eventResource:resource(),envelope:envelope(identity),runEnvironmentResources});
const checkedFile=async r=>{const bytes=await readFile(r.path);assert.equal(bytes.length,r.bytes);assert.equal(hash(bytes),r.sha256,r.path);return JSON.parse(bytes);};
async function saveState(n){
 const {env:omitEnv,startA:omitA,input:omitInput,accounting:omitAccounting,workspaceRootRelation:omitRelation,startB:omitB,...delta}=state;
 const baseline=await readFile(join(P,'baseline.json'));await record(n,{baseline:{path:join(P,'baseline.json'),bytes:baseline.length,sha256:hash(baseline)},...delta});
}
async function restore(file=null,{interrupted=false}={}){
 assert(file,'A genuine stage resume is required');const delta=await read(join(P,file));assert.equal(delta.baseline.path,join(P,'baseline.json'));const baseline=await checkedFile(delta.baseline);state={...baseline,...delta};
 if(state.startBRef)state.startB=await checkedFile(state.startBRef);
 env=state.env;product=await loadAt(env.installedRoot,'product/index');abg=await loadAt(env.installedRoot,'abg/index');api=await loadAt(env.installedRoot,'public/index');storeOwner=await loadAt(env.installedRoot,'abg/event_store');cc=await loadAt(env.installedRoot,'abg/construction_continuation');
 env.product=product;env.abg=abg;
 if(!interrupted){env.artifactTruth=abg.projectOwnedPrefixArtifactTruth(state.handoff.prefix);assert(abg.validateExactPrefixArtifactTruthProjection(env.artifactTruth,{requireCurrent:true}));}
 else delete env.artifactTruth;
 const relation=await checkedWorkspace(env);assert.deepEqual(relation,state.workspaceRootRelation,'Retained authority/root relation changed');
 process.env.ABG_WITNESS_PROVIDER_TMP=join(relation.canonicalRoot,'operator-scratch/tmp');await checkPackage(env.installedRoot);
}
async function authenticatedAdmission(prefix,coordinate,run,publicInvocation){
 const owner=await loadAt(env.installedRoot,'abg/invocation_admission');
 for(const name of ['rehydrateInvocationAdmissionAtPrefix','hasInvocationRunBindingAtPrefix','deriveInvocationSourceResultBasisAtPrefix'])assert.equal(typeof owner[name],'function',name);
 const admission=owner.rehydrateInvocationAdmissionAtPrefix(prefix,coordinate.ref);assert(admission,'Exact admission unavailable');
 if(coordinate.digest!==undefined)assert.equal(admission.invocationAdmissionDigest,coordinate.digest);
 assert(owner.hasInvocationRunBindingAtPrefix(prefix,admission,run),'Invocation is not bound to selected Run');
 assert.equal(admission.publicRequestInvocationRef,publicInvocation.invocationRef,'Original Public invocation must match');
 return {owner,admission};
}
async function acquireASource(){
 await restore('a.resume.json');const transport=await read(join(P,'a.transport.json')),receipt=transport.output?.receipt;assert(receipt);assert.equal(receipt.failure,null);assert.equal(receipt.ownerOutput.value.disposition,'blocked');
 assert.deepEqual(receipt.resources.run,receipt.ownerOutput.value.run);assert.deepEqual(receipt.resources.eventResource.closeHandoff,state.handoff);
 const A=receipt.resources.run.ref,current=rows(),prefix=abg.selectValidatedRuntimeEventPrefix(current);
 const {owner,admission}=await authenticatedAdmission(prefix,receipt.resources.invocationAdmission,A,state.startA.call.invocation);
 const natives=current.filter(e=>e.runId===A&&e.kind==='c_call_result_admitted'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);assert.equal(natives.length,1);assert.equal(natives[0].payload.resultClass,'success');
 const latest=current.filter(e=>e.runId===A&&e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success'&&e.payload.value?.kind==='governance_work_state').at(-1);assert(latest);
 const sourceInput={publicAuthorityDigest:state.startA.call.invocation.invocationDigest,runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:admission.invocationAdmissionRef,runId:A,resultRef:latest.payload.resultRef};
 const source=owner.deriveInvocationSourceResultBasisAtPrefix(prefix,sourceInput);assert(source,'Existing source owner refuses A eligibility');
 const observed=source.sourceResultValue.observations.find(o=>o.resultRef===natives[0].payload.resultRef);assert.deepEqual(observed&&[observed.purpose,observed.resultDigest,observed.cCallRef],['construction',natives[0].payload.resultDigest,natives[0].aggregateId]);
 assert(!current.some(e=>e.runId===A&&e.kind==='traversal_cursor_entered'&&e.payload.graphFunctionRef===product.governanceRef('graph-function','testing')));
 state.source=source;state.runA=A;state.nativeResult=natives[0];state.eventsAfterA=current.length;state.eventsInA=current.filter(e=>e.runId===A).length;
 state.aAdmission={ref:admission.invocationAdmissionRef,digest:admission.invocationAdmissionDigest};
 return {owner,admission,prefix,sourceInput,source};
}
const command=(await import(pathToFileURL(selection.operatorRunner).href)).commandRecorder(P,{timeoutMs:selection.provider.outerTimeoutMs,maxOutputBytes:67108864});
async function cli(identity,call){
 if(identity==='a'||identity==='continue')assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Real provider credential unavailable');
 const requestPath=join(P,identity+'.request.jsonl');await writeFile(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:state.handoff},invocation:call})+'\n',{flag:'wx'});
 const execution=await command(identity,process.execPath,[join(env.installedRoot,'build/code/src/public/cli.js'),'--jsonl',requestPath],{environment:{...process.env}});
 const result={execution,wallMs:execution.wallMs,output:null};
 try{result.output=JSON.parse(execution.stdout.trim());}catch{}
 await record(identity+'.transport.json',result);const receipt=result.output?.receipt,handoff=receipt?.resources?.eventResource?.closeHandoff;
 assert(handoff,'Null/fault resources retained; do not reuse stale handoff');state.handoff=handoff;
 await saveState(identity+'.resume.json');assert.equal(receipt.failure,null,'Typed failure retained');return result;
}
async function prepared(name,call){await record(name+'.call.json',call);await record(name+'.identity.json',{sha256:hash(await readFile(join(P,name+'.call.json'))),invocationRef:call.invocation.invocationRef,sourceCommit:selection.sourceCommit,providerCalls:0,RunAdmissions:0});}
async function selectedCall(name){const file=join(P,name+'.call.json'),b=await readFile(file);assert.equal(approval.callSha256,hash(b),'Root must select exact prepared call');return JSON.parse(b);}
try{
 if(mode==='setup'){
  const {setupInstalledRootCatalog}=await import(pathToFileURL(join(support,'root-installed-environment.mjs')).href);let selectedEnvironment;
  // Retain the setup for later cold stages. No disposal callback is executed now.
  const cleanup=[];const accounting={wallMs:{}};
  process.env.TMPDIR=join(D,'setup-host');process.env.npm_config_cache=join(D,'setup-cache');process.env.npm_config_offline='true';
  const actual=await setupInstalledRootCatalog({after:f=>cleanup.push(f)},selection.referenceAssetsRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,setupAccounting:accounting,
   frozenArtifact:{artifactPath:custody.archive.path,artifactSha256:'sha256:'+custody.archive.sha256,installHost:D},
   additionalCorePublicationConstructors:['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'],
   prepareAdditionalProducts:async setup=>{
    for(const name of ['scratch','bootstrapPackage','abiPackageArchivePath'])assert.equal(typeof setup[name],'string');assert.equal(typeof setup.product?.sha256Canonical,'function');assert.equal(typeof setup.gtl?.constructDefaultGovernanceLibraryModulePublication,'function');assert.equal(typeof setup.abiPublication?.owningProductId,'string');
    selectedEnvironment=await lib.libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
    const m=JSON.parse(await readFile(join(setup.bootstrapPackage,'product-toolchain-manifest.json'),'utf8'));
    assert.equal(setup.product.sha256Canonical(m),custody.manifestDigest);assert.equal(m.productContentDigest,custody.productContentDigest);
    const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({productId:m.productId,packageName:m.packageName,packageVersion:m.packageVersion,artifactDigest:'sha256:'+custody.archive.sha256,productContentDigest:m.productContentDigest,productManifestDigest:custody.manifestDigest});
    const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(lib.assessmentSchema)+'\n');
    return [await fixtureSupport.prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,declarationFactory:gtl=>{const declaration=dualEntryConsumerDeclaration({gtl,library,runEnvironment:selectedEnvironment.declaration,libraryConsumerDeclaration:lib.libraryConsumerDeclaration,witnessRef:lib.witnessRef});/* Same constructor/topology; artifact-bound declaration identity is derived anew. */return declaration;},fixtureFiles:[{path:'build/index.mjs',source:pathToFileURL(join(selection.referenceAssetsRoot,'test_env/fixtures/default-library-product/index.mjs'))}],schemaAssets:[{path:lib.schemaPath,source:schema,contractId:lib.witnessRef('contract','assessment'),requirementAuthorityRefs:[lib.witnessRef('support','complete-source-outcome')]}]})];
   }});
  delete process.env.npm_config_cache;delete process.env.npm_config_offline;
  const workspaceRootRelation=await checkedWorkspace(actual,{setup:true});await record('workspace-root-relation.json',workspaceRootRelation);
  product=actual.product;abg=actual.abg;api=await loadAt(actual.installedRoot,'public/index');
  const work=workspaceRootRelation.canonicalRoot;assert(!selection.runtimeTmp.startsWith(work+'/'));assert(!work.startsWith(selection.runtimeTmp+'/'));await cp(selection.seedRoot,work,{recursive:true});await mkdir(join(work,'operator-scratch/tmp'),{recursive:true});
  process.env.ABG_WITNESS_PROVIDER_TMP=join(work,'operator-scratch/tmp');
  const awaitedSeedSelection=await read(selection.seedSelection.path);const original=await lib.witnessInput({product,selection:awaitedSeedSelection,seedRoot:work});
  const input=product.constructGovernanceWorkState({...original.original,task:original.original.task+'\n\nCommissioned witness: first produce the corrected CLI through native Construction. The first root is ordinarily bounded after one child; a separately declared root will later verify the exact retained work. Do not manufacture observations or selection evidence.',readRoots:[...original.original.readRoots,'operator-scratch'],workOrders:{...original.original.workOrders,construction:{...original.original.workOrders.construction,writeRoots:[...original.original.workOrders.construction.writeRoots,'operator-scratch'],instructions:[...original.original.workOrders.construction.instructions,'Use operator-scratch only for temporary tooling; retain compact evidence and remove own disposable artifacts before returning. Preserve all protected seed files.']}}});
  actual.catalogView=product.narrowGraphFunctionCatalog(actual.catalog,actual.additionalPublications[0].programs[0].callableMembership);assert.equal(actual.catalogView.kind,'graph_function_catalog_view');
  const handoff=actual.store.projectReopenAuthorityAndClose();process.env.TMPDIR=selection.runtimeTmp;
  env=Object.fromEntries(['scratch','installedRoot','installedRoots','verified','admittedInstalls','workspaceBinding','workspaceAuthority','catalog','catalogView','additionalPublications','additionalProducts'].map(k=>[k,actual[k]]));
  env.additionalProducts=actual.additionalProducts.map(p=>({ids:p.ids,basis:p.basis,artifactPath:p.artifactPath}));state={env,handoff,input,accounting,workspaceRootRelation};
  // Reconstruct authenticated current artifact truth before preparing A.
  env.product=product;env.abg=abg;env.artifactTruth=abg.projectOwnedPrefixArtifactTruth(handoff.prefix);
  state.startA=await api.constructInstalledStartCall(startIntent(input,'real-a',{kind:'next'},env.additionalProducts[0].ids.programRef,selectedEnvironment.resources));
  checkedStart(state.startA);assert.deepEqual(state.startA.call.invocation.request.target,{kind:'next'});assert.equal(state.startA.population.resolution.resolution.graphFunctionRef,lib.witnessRef('graph-function','executive-a'));
  const previewB=await api.constructInstalledStartCall(startIntent(input,'preview-b-not-dispatched',{kind:'asset',handle:retainedTestingAssetHandle},state.startA.call.invocation.request.program.ref,selectedEnvironment.resources));
  checkedStart(previewB);assert.deepEqual(previewB.call.invocation.request.target,{kind:'asset',handle:retainedTestingAssetHandle});assert.equal(previewB.population.resolution.resolution.graphFunctionRef,lib.witnessRef('graph-function','executive-b'));assert.deepEqual(previewB.call.invocation.request.program,state.startA.call.invocation.request.program);assert.deepEqual(previewB.call.invocation.request.sourceBasis,{kind:'none'});assert.deepEqual(previewB.call.invocation.request.input.value,input);assert.notEqual(previewB.population.authority.authorityRef,state.startA.population.authority.authorityRef);
  await record('b-structural-preview.json',{status:'NON_DISPATCHED_INITIAL_INPUT_PREVIEW_ONLY',sourceBasis:'none',meaning:'Owner-resolved B entry, own authority and run-environment resources; not the future retained B call.',call:previewB.call,workAuthority:previewB.population.authority,resolution:previewB.population.resolution.resolution});
  const actor=await loadAt(env.installedRoot,'abg/actor_process');const ambient=actor.selectedWorksiteCommandAmbientEnvironment();assert.equal(ambient.find(r=>r.name==='TMPDIR')?.value,selection.runtimeTmp);
  const c2=await loadAt(env.installedRoot,'product/worksite_command_execution'),authority={workspaceAuthorityBasis:actual.workspaceAuthority,workspaceBinding:actual.workspaceBinding};
  const protectedSubjects=input.original.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
  c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects,commands:input.original.testing.commands,outcomePredicates:input.original.testing.outcomePredicates,allowedWriteTerritories:input.original.testing.allowedWriteTerritories},ambient);
  const observed=await product.observeWorksiteContext({...authority,protectedInstallRoots:actual.installedRoots,readRoots:input.original.readRoots,maxFiles:input.original.maxContextFiles,maxBytes:input.original.maxContextBytes});assert.equal(observed.kind,'worksite_context_observation');
  for(const path of awaitedSeedSelection.protectedSeedPaths){const entry=observed.entries.find(e=>e.relativePath===path),expected=awaitedSeedSelection.seedFiles[path];assert(entry?.state==='file','Missing required protected source: '+path);assert.equal(entry.digest,'sha256:'+expected.sha256,path);assert.equal(entry.byteLength,expected.bytes,path);}
  const continuation=await loadAt(env.installedRoot,'abg/construction_continuation');for(const name of ['projectPendingExecutionContinuations','selectPendingExecutionUse','projectPendingExecutionInputAtPrefix'])assert.equal(typeof continuation[name],'function',name);for(const name of ['constructInstalledPublicDefinitionCall','constructInstalledStartCall','constructInstalledPendingCall','constructInstalledRunReadCall'])assert.equal(typeof api[name],'function',name);
  await record('pending-helper-readiness.json',{stage:'BEFORE_PAID_A_SIGNATURE_AND_OWNER_COMPATIBILITY_ONLY',exports:['constructInstalledPendingCall'],actualPendingCall:'Requires genuine B entered Testing frontier after actual A/B; no fabricated preview Run',providerCalls:0,RunAdmissions:0});
  await record('preflight.json',{contextDigest:observed.observationDigest,contextEntries:observed.entries.length,ambient,c2Commands:input.original.testing.commands.length,providerCalls:0,RunAdmissions:0,initialStateEmpty:input.observations.length===0,sourceBasis:state.startA.call.invocation.request.sourceBasis,definitionCoordinates:actual.verified.definitionContractCoordinates,archive:custody.archive});
  checkedStart(state.startA);await checkPackage(env.installedRoot);await record('definition-roots.json',actual.verified.definitionContractCoordinates);await record('input.json',input);await record('common-program.json',actual.additionalPublications[0]);
  await prepared('a',state.startA.call);await record('baseline.json',{...state,env:{...env,product:undefined,abg:undefined,artifactTruth:undefined}});await saveState('setup.resume.json');await record('setup-summary.json',{providerCalls:0,RunAdmissions:0,sourceCommit:selection.sourceCommit,installedRoot:env.installedRoot,workspaceRoot:work,accounting,callbackCount:cleanup.length,cleanup:'Retained until proof custody and Root cleanup selection; runtime store closed explicitly.'});
 }else if(mode==='run-a'){
  await restore('setup.resume.json');const result=await cli('a',await selectedCall('a'));assert.equal(result.output.receipt.ownerOutput.value?.disposition,'blocked','A must stop normally under its existing declared bound');
 }else if(mode==='acquire-a'){
  await acquireASource();await record('a-source.json',state.source);await saveState('a-source.resume.json');
 }else if(mode==='read-a'){
  await restore('a-source.resume.json');const receipt=(await read(join(P,'a.transport.json'))).output.receipt,contracts=await loadAt(env.installedRoot,'abg/project_read_operation_contracts');assert(receipt.resources.run,'No genuine A Run coordinate');
  for(const memberKey of ['run_result','run_replay']){const readCall=api.constructInstalledRunReadCall({memberKey,workspaceBinding:{ref:env.workspaceBinding.bindingId,digest:env.workspaceBinding.bindingDigest},sourceRef:receipt.resources.run.ref,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},eventResource:resource(),envelope:envelope('real-a-'+memberKey)});if(readCall.kind!=='installed_run_read_call'){await record('a-'+memberKey+'-population-refusal.json',readCall);throw Error('Read owner refused');}await cli('a-'+memberKey,readCall.call);}
  await saveState('read-a.resume.json');
 }else if(mode==='prepare-b'){
  await restore('read-a.resume.json');const admissions=await loadAt(env.installedRoot,'abg/invocation_admission');const S=state.source;assert.equal(typeof S.sourceInvocationRef,'string','Exact returned source basis coordinate');
  const fresh=admissions.deriveInvocationSourceResultBasisAtPrefix(abg.selectValidatedRuntimeEventPrefix(rows()),{publicAuthorityDigest:S.publicAuthorityDigest,runtimeInvocationRef:S.sourceInvocationRef,invocationAdmissionRef:S.sourceInvocationAdmissionRef,runId:S.sourceRunId,resultRef:S.sourceResultRef});assert(fresh);assert.deepEqual(fresh.sourceResultValue,S.sourceResultValue);
  const selected=await lib.libraryEnvironment({gtl:await loadAt(env.installedRoot,'gtl/index'),product,packageRoot:env.installedRoot});
  state.startB=await constructRetainedBStart({product,publicApi:api,env,startA:state.startA,sourceBasis:fresh,eventResource:resource(),envelope:envelope('real-b'),identity:'real-b',assetHandle:retainedTestingAssetHandle,runEnvironmentResources:selected.resources});
  const current=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding:env.workspaceBinding,protectedInstallRoots:env.installedRoots,readRoots:state.input.original.readRoots,maxFiles:state.input.original.maxContextFiles,maxBytes:state.input.original.maxContextBytes});assert.equal(current.kind,'worksite_context_observation');const effect=await loadAt(env.installedRoot,'product/worksite_effect');assert(effect.sameWorksiteContextIdentity(current,state.nativeResult.payload.value.after),'Context changed: stop before B; historical source dependency not implicitly fabricated');await record('b-context-readiness.json',{currentRef:current.observationRef,currentDigest:current.observationDigest,afterRef:state.nativeResult.payload.value.after.observationRef,afterDigest:state.nativeResult.payload.value.after.observationDigest,identityEqual:true,providerCalls:0});
  checkedStart(state.startB);state.source=fresh;await record('b-start.owner.json',state.startB);const startBytes=await readFile(join(P,'b-start.owner.json'));state.startBRef={path:join(P,'b-start.owner.json'),bytes:startBytes.length,sha256:hash(startBytes)};await prepared('b',state.startB.call);await saveState('b-prepared.resume.json');
 }else if(mode==='interrupt-b'){
  await restore('b-prepared.resume.json');assert(process.env.CLAUDE_CODE_OAUTH_TOKEN);const call=await selectedCall('b');
  const requestPath=join(P,'b.request.jsonl');await writeFile(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:state.handoff},invocation:call})+'\n',{flag:'wx'});
  const hostInput=join(P,'host-input.json');await record('host-input.json',{installedRoot:env.installedRoot,requestPath,eventLogPath:fileURLToPath(state.handoff.prefix.eventLogRef),proof:P,closeHandoff:state.handoff,profileDigest:state.handoff.prefix.storeIdentity.eventContractDigest,testingGraphFunctionRef:product.governanceRef('graph-function','testing')});
  const execution=await command('b-host',process.execPath,[selection.enteredTestingHost.path],{environment:{...process.env,ABI5_PENDING_TESTING_HOST:hostInput}});await record('b-host-return.json',execution);assert.equal(execution.signal,'SIGKILL');
  assert.equal(await readFile(join(P,'observer-failure.json'),'utf8').catch(e=>e.code==='ENOENT'?null:Promise.reject(e)),null);
  const interruption=await read(join(P,'interruption.json'));assert.equal(interruption.entered.length,1);assert.equal(interruption.openedAtInterruption,0);
 }else if(mode==='recover-b'){
  assert.equal(approval.quiescenceConfirmed,true,'Root must confirm host/provider quiescence before resource recovery');await restore('b-prepared.resume.json',{interrupted:true});const origin=await read(join(P,'recovery-origin.json'));try{process.kill(origin.ownerPid,0);throw Error('Host remains live')}catch(e){assert.equal(e.code,'ESRCH');}
  const bytes=await readFile(fileURLToPath(state.handoff.prefix.eventLogRef));assert.deepEqual(bytes,await readFile(join(P,'interrupted-prefix.jsonl')));
  const physical=state.handoff.reopenAuthority,lockPath=join(selection.runtimeTmp,'abiogenesis-event-store-locks-v5',physical.device+'-'+physical.inode+'.lock'),lock=await stat(lockPath),lockBytes=await readFile(lockPath);
  const recovered=storeOwner.recoverInterruptedEventStore({...origin,expectedCurrent:{byteLength:bytes.length,digest:product.sha256Bytes(bytes)},abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:product.sha256Bytes(lockBytes)}});await record('b-resource-recovery.json',recovered);assert.equal(recovered.kind,'recovered');state.handoff=recovered.closeHandoff;env.artifactTruth=abg.projectOwnedPrefixArtifactTruth(state.handoff.prefix);assert(abg.validateExactPrefixArtifactTruthProjection(env.artifactTruth,{requireCurrent:true}));
  const interruption=await read(join(P,'interruption.json'));assert.equal(interruption.entered.length,1);const entered=interruption.entered[0],prefix=abg.selectValidatedRuntimeEventPrefix(rows()),open=await loadAt(env.installedRoot,'abg/open_call'),scope=open.projectOpenedTraversalScopeForFrameAtPrefix(prefix,entered.frameId);assert(scope);assert.equal(scope.runId,entered.runId);const {admission}=await authenticatedAdmission(prefix,{ref:scope.invocationAdmissionRef},scope.runId,state.startB.call.invocation);state.runB=scope.runId;state.bAdmission={ref:admission.invocationAdmissionRef,digest:admission.invocationAdmissionDigest};state.bEntered={runId:entered.runId,frameId:entered.frameId,cursorRef:entered.cursorRef};assert.notEqual(state.runA,state.runB);await saveState('b-recovered.resume.json');
 }else if(mode==='prepare-continue'){
  await restore('b-recovered.resume.json');const prefix=abg.selectValidatedRuntimeEventPrefix(rows()),interruption=await read(join(P,'interruption.json'));
  const [pending,...extra]=cc.projectPendingExecutionContinuations(prefix,state.runB);assert(pending&&extra.length===0&&pending.phase==='undispatched');assert.equal(interruption.openedAtInterruption,0);assert.equal(interruption.entered.length,1);assert.equal(pending.pendingCursorRef,interruption.entered[0].cursorRef);assert(pending.progressedInputRef&&pending.progressedInputDigest);
  const selectedEnvironment=await lib.libraryEnvironment({gtl:await loadAt(env.installedRoot,'gtl/index'),product,packageRoot:env.installedRoot});
  const preparedPending=await api.constructInstalledPendingCall({selection:{kind:'pending_execution',runRef:state.runB,continuation:{ref:pending.continuationRef,digest:pending.continuationDigest}},catalog:env.catalog,catalogView:env.catalogView,applications:[],eventResource:resource(),envelope:envelope('continue-b'),runEnvironmentResources:selectedEnvironment.resources});
  if(preparedPending.kind!=='installed_pending_call'){await record('pending-owner-refusal.json',preparedPending);throw Error('Existing continuation owner refused; retained exact output');}
  const use=cc.selectPendingExecutionUse(prefix,preparedPending.population.request);assert.equal(use.kind,'pending_execution_use');state.pending=pending;assert.equal(use.invocation.invocationAdmissionRef,state.bAdmission.ref);assert.equal(use.invocation.invocationAdmissionDigest,state.bAdmission.digest);assert.equal(use.rootScope.runId,state.runB);
  state.pendingOrigin={invocation:{ref:use.invocation.invocationAdmissionRef,digest:use.invocation.invocationAdmissionDigest},publicInvocationRef:use.invocation.publicRequestInvocationRef,rootBasis:{ref:use.rootBasis.basisRef,digest:use.rootBasis.basisDigest},rootScope:{ref:use.rootScope.scopeRef,digest:use.rootScope.scopeDigest},runId:use.rootScope.runId};
  await prepared('continue',preparedPending.call);await record('pending-preflight.json',{stage:'AFTER_ACTUAL_B_FRONTIER_BEFORE_CONTINUATION_PROVIDER',invocation:state.pendingOrigin,providerCalls:0,RunAdmissions:0});await saveState('continue-prepared.resume.json');
 }else if(mode==='continue-b'){
  await restore('continue-prepared.resume.json');const result=await cli('continue',await selectedCall('continue'));assert.equal(result.output.receipt.ownerOutput.value?.disposition,'completed');assert.equal(result.output.receipt.ownerOutput.value?.run?.ref,state.runB);await checkPackage(env.installedRoot);
 }else if(mode==='read-b'){
  await restore('continue.resume.json');const receipt=(await read(join(P,'continue.transport.json'))).output.receipt,contracts=await loadAt(env.installedRoot,'abg/project_read_operation_contracts');
  for(const memberKey of ['run_result','run_replay']){
   const readCall=api.constructInstalledRunReadCall({memberKey,workspaceBinding:{ref:env.workspaceBinding.bindingId,digest:env.workspaceBinding.bindingDigest},sourceRef:receipt.resources.run.ref,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},eventResource:resource(),envelope:envelope('real-b-'+memberKey)});if(readCall.kind!=='installed_run_read_call'){await record(memberKey+'-population-refusal.json',readCall);throw Error('Read owner refused');}await cli(memberKey,readCall.call);
  }
  await saveState('read-b.resume.json');
 }else if(mode==='proof'){
  await restore('read-b.resume.json');const all=rows(),prefix=abg.selectValidatedRuntimeEventPrefix(all),B=all.filter(e=>e.runId===state.runB),A=all.filter(e=>e.runId===state.runA);
  assert.equal(A.length,state.eventsInA,'A admits nothing after its normal bound stop');
  const results=B.filter(e=>e.kind==='c_call_result_admitted'),choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>e.payload.value.graphFunctionRef);
  assert.deepEqual(choices,[product.governanceRef('graph-function','testing'),product.governanceRef('graph-function','uat')],'No repeated initial selector; normal post-Testing selection');
  assert(!B.some(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef),'No repeated Construction');
  assert.equal(B.filter(e=>e.kind==='run_closed').length,1);assert(!B.some(e=>e.kind==='runtime_failure_observed'));
  const commands=results.filter(e=>e.payload.value?.kind==='worksite_command_execution_observation'&&e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);assert.equal(commands.length,1);assert(commands[0].payload.value.commandResults.every(c=>c.exitStatus===0));
  const post=results.filter(e=>e.payload.value?.kind==='framed_synthesis_task'&&e.admissionOrdinal>commands[0].admissionOrdinal);assert.equal(post.length,1);
  const task=post[0].payload.value,started=B.filter(e=>e.kind==='actor_invocation_started'&&e.payload.inputDigest===product.sha256Canonical(task));assert.equal(started.length,1);
  const transport=B.find(e=>e.kind==='actor_transport_binding_admitted'&&e.payload.cCallRef===started[0].payload.cCallRef&&e.payload.promptDigest===started[0].payload.promptDigest);assert(transport?.payload.paths.prompt);
  const bytes=await readFile(transport.payload.paths.prompt),prompt=new TextDecoder('utf-8',{fatal:true}).decode(bytes);assert.equal(product.sha256Canonical(prompt),started[0].payload.promptDigest);await writeFile(join(P,'post-testing-submitted-prompt.txt'),bytes,{flag:'wx'});
  const truth=await loadAt(env.installedRoot,'abg/invocation_execution_truth'),bodies=await loadAt(env.installedRoot,'abg/event_prefix');assert.equal(state.pendingOrigin.runId,state.runB);const {admission}=await authenticatedAdmission(prefix,state.pendingOrigin.invocation,state.runB,state.startB.call.invocation);assert.equal(admission.publicRequestInvocationRef,state.pendingOrigin.publicInvocationRef);const use=truth.governanceContextBodyUse(admission,state.runB);
  assert.deepEqual(admission.sourceResultBasis,state.source);assert(use.sourceResults.some(x=>x.resultRef===state.nativeResult.payload.resultRef));
  const view=JSON.parse(prompt.split('\n\n').find(x=>x.startsWith('## task\n')).slice('## task\n'.length)),lineage=[];
  for(const source of state.input.original.sources){
   const entry=task.context.entries.find(e=>e.relativePath===source.path);assert.equal(entry?.encoding,'admitted_member');const holder=all.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===entry.member.resultRef);assert.equal(holder?.runId,state.runA);
   const body=bodies.resolveWorksiteContextBodyAtPrefix(prefix,task.context,source.path,use);assert.equal(body.kind,'worksite_context_body');const seed=await readFile(join(selection.seedRoot,source.path));assert.deepEqual(body.bytes,seed);
   const presented=view.worksite.files.find(f=>f.path===source.path);assert.equal(presented?.contentRole,'declared_source');const text=presented.encoding==='utf8'?presented.content:view.originalTask.slice(presented.startCharacter,presented.endCharacter);assert.equal(text,seed.toString('utf8'));
   lineage.push({path:source.path,holderRun:state.runA,holderResult:holder.payload.resultRef,member:entry.member,digest:entry.digest});
  }
  const finalReceipt=(await read(join(P,'continue.transport.json'))).output.receipt;
  const resultRead=(await read(join(P,'run_result.transport.json'))).output.receipt.ownerOutput.value,replayRead=(await read(join(P,'run_replay.transport.json'))).output.receipt.ownerOutput.value;
  assert.equal(resultRead.projection.terminalResult.producer.runRef,state.runB);const parent=results.filter(e=>e.graphFunctionRef===lib.witnessRef('graph-function','executive-b')).at(-1);assert(parent?.payload.value.terminal);assert.deepEqual(resultRead.projection.terminalResult.result,{ref:parent.payload.resultRef,digest:parent.payload.resultDigest});assert.equal(resultRead.projection.terminalResult.producer.graphCallRef,finalReceipt.ownerOutput.value.graphCall.ref);assert.deepEqual(replayRead.projection.replay,finalReceipt.ownerOutput.value.replay);assert.deepEqual(cc.projectPendingExecutionContinuations(prefix,state.runB),[]);
  const operations=all.filter(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='pending_execution');assert.equal(operations.length,1);
  const archiveBytes=await readFile(fileURLToPath(state.handoff.prefix.eventLogRef));await writeFile(join(P,'final-events.jsonl'),archiveBytes,{flag:'wx'});
  const providerUsage=[];
  for(const event of all.filter(e=>e.kind==='actor_transport_binding_admitted')){
   const path=event.payload.paths.stdout,data=await readFile(path);const result=data.toString('utf8').split(/\r?\n/u).flatMap(line=>{try{const v=JSON.parse(line);return v.type==='result'?[v]:[];}catch{return [];}}).at(-1);
   providerUsage.push({eventId:event.eventId,cCallRef:event.payload.cCallRef,path,bytes:data.length,sha256:hash(data),totalCostUsd:result?.total_cost_usd??null,turns:result?.num_turns??null,durationMs:result?.duration_ms??null,usage:result?.usage??null});
  }
  await record('PROVIDER_MEASUREMENTS.json',{roles:providerUsage,knownCostUsd:providerUsage.reduce((n,r)=>n+(typeof r.totalCostUsd==='number'?r.totalCostUsd:0),0),unknownCharges:providerUsage.filter(r=>r.totalCostUsd===null).length,meaning:'Reported provider artifacts; not independent billing or matched comparison.'});
  await record('SUMMARY.json',{status:'BOUNDED_REAL_PROVIDER_WITNESS_OBSERVED',sourceCommit:selection.sourceCommit,candidateArchive:custody.archive,runA:state.runA,runB:state.runB,sourceBasisRef:state.source.basisRef,lineage,postTestingPrompt:{transportEvent:transport.eventId,cCallRef:started[0].payload.cCallRef,startedEvent:started[0].eventId,canonicalDigest:started[0].payload.promptDigest,fileSha256:hash(bytes),bytes:bytes.length,limit:'Exact retained submitted transport input; not independent model/read-side receipt.'},events:all.length,eventBytes:archiveBytes.length,eventFileSha256:hash(archiveBytes),actorStarts:all.filter(e=>e.kind==='actor_invocation_started').map(e=>({runId:e.runId,eventId:e.eventId,at:e.eventTime,cCallRef:e.payload.cCallRef})),providerTransportArchives:all.filter(e=>e.kind==='actor_transport_binding_admitted').map(e=>({eventId:e.eventId,paths:e.payload.paths})),cost:'Read actual retained provider result/usage artifacts; no invented estimate or matched comparison.',qualification:false,release:false});
 }else throw Error('Unknown explicit Root stage');
 console.log(JSON.stringify({stage:mode,status:'returned',proof:P}));
}catch(error){await record('FAULT-'+mode+'.json',{at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,6000),meaning:'Actual fault retained; no automatic retry, fabricated state, stale handoff or acceptance.'});throw error;}
