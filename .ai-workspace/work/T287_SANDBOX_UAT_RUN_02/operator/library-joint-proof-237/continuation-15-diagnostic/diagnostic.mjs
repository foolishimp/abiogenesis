import assert from 'node:assert/strict';
import { readFile, writeFile, stat, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root=dirname(fileURLToPath(import.meta.url));
const selected=JSON.parse(await readFile(join(root,'inputs.json'),'utf8'));
const record=(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const started=process.hrtime.bigint();
const elapsed=()=>Number(process.hrtime.bigint()-started)/1e6;
async function frozen(ref) {
  const bytes=await readFile(ref.path);
  assert.equal(bytes.length,ref.byteCount);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),ref.sha256);
  return JSON.parse(bytes.toString('utf8'));
}
async function filePin(path) {
  const bytes=await readFile(path);
  return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};
}
let stage='preflight',resource=null,a=null,hash=null;
try {
  const oldFreeze=await frozen(selected.references.frozen15);
  const helper=oldFreeze.references.find(row=>row.path===selected.references.installedModulesHelper.path);
  assert.deepEqual(helper,selected.references.installedModulesHelper);
  assert.deepEqual(await filePin(helper.path),helper);
  const closed=await frozen(selected.references.close),setup=await frozen(selected.references.setup);
  const native=await frozen(selected.references.nativeOutcome),catalogOutcome=await frozen(selected.references.catalogOutcome);
  const conserved=await frozen(selected.references.conservation),comparison=await frozen(selected.references.definitionComparison);
  const source=await frozen(selected.references.source43),emission=await frozen(selected.references.emission43);
  assert.equal(source.files.length,264); assert.equal(emission.files.length,528);
  const runtimeRoot=setup.installedRoot;
  const modules=['abg/definition_event_resource','abg/event_prefix','abg/event_store','abg/invocation_execution_truth',
    'abg/environment_admission','abg/native_work_reacquisition','gtl/default_library','gtl/materialize',
    'product/catalog','product/declaration_closure','product/default_library'];
  const ownerPins=[];
  for(const name of modules) {
    const expected=emission.files.find(row=>row.relativePath===name+'.js'); assert(expected);
    const actual=await filePin(join(runtimeRoot,'build/code/src',name+'.js'));
    assert.equal(actual.sha256,expected.sha256); assert.equal(actual.byteCount,expected.bytes);
    ownerPins.push({...actual,frozenEmission:expected.path});
  }
  const physical=async()=>{
    const s=await stat(conserved.physicalLog.path,{bigint:true});
    return {device:String(s.dev),inode:String(s.ino),byteCount:String(s.size),mtimeNs:String(s.mtimeNs)};
  };
  const checkQuiet=async()=>{
    const locks=[];
    for(const path of conserved.checkedLockPaths) { try {await access(path);locks.push(path);} catch(error) {if(error.code!=='ENOENT')throw error;} }
    const processes=execFileSync('ps',['-axo','pid=,ppid=,pgid=,args='],{encoding:'utf8'}).split('\n')
      .filter(line=>line.includes('/library-joint-proof-237/') && /(?:cli\.js|responder\.mjs)/.test(line) && /(?:^|\s)(?:\S*\/)?node(?:\s|$)/.test(line));
    assert.equal(locks.length,0); assert.equal(processes.length,0);
    return {locks,processes};
  };
  const fixture=async()=>{
    const pins=[];
    for(const row of [...conserved.fixtureInputs,conserved.actualCandidate]) {
      const actual=await filePin(row.path);assert.equal(actual.sha256,row.sha256);assert.equal(actual.byteCount,row.byteCount);pins.push(actual);
    }
    return pins;
  };
  assert.deepEqual(await physical(),selected.expectedPhysical);
  const quiet=await checkQuiet(),fixtureBefore=await fixture();
  assert.equal(closed.prefix.prefixLength,28289480);
  assert.equal(closed.prefix.coordinateDigest,'sha256:6ed5b246e326095cadc1a4732d81f44a0104709c1147ef95f5fdb9e825ac8e10');
  assert.equal(native.receipt.ownerOutput.value.disposition,'runtime_failed');
  await record('preflight.json',{kind:'diagnostic_preflight',physical:await physical(),quiet,fixture:fixtureBefore,ownerPins,elapsedMs:elapsed(),resourceAcquisitions:0});
  const {installedModules}=await import(pathToFileURL(helper.path).href);
  const runtime=await installedModules(runtimeRoot);a=runtime.abg;const p=runtime.product;hash=p.sha256Canonical;
  const load=name=>import(pathToFileURL(join(runtimeRoot,'build/code/src',name+'.js')).href);
  const prefixes=await load('abg/event_prefix'),truth=runtime.invocationTruth;
  const declarations=await load('product/declaration_closure'),library=await load('gtl/default_library');
  const materializer=await load('gtl/materialize'),stateOwner=await load('product/default_library');
  stage='acquire';
  const request={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed,handoffDigest:hash(closed)};
  const acquired=a.acquireAbgEventResource(request);
  if(acquired.kind!=='acquired_abg_event_resource') {await record('owner-refusal.json',acquired);throw new Error('Selected resource owner refused');}
  resource=acquired.resource;
  const durable=a.selectHeldEventStoreDurablePrefix(resource.store);assert.deepEqual(durable,closed.prefix);
  const prefix=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable);
  await record('acquisition.json',{kind:acquired.kind,closeSelector:selected.references.close,requestDigest:hash(request),prefix:durable,elapsedMs:elapsed()});
  stage='opened_call_and_execution_basis';
  const rows=prefixes.indexedRuntimeEvents(prefix,'related:'+selected.target.cCallRef);
  const openedRows=rows.filter(e=>e.kind==='c_call_opened' && e.aggregateId===selected.target.cCallRef);assert.equal(openedRows.length,1);
  const opened=openedRows[0];assert.equal(opened.runId,selected.target.runId);assert.equal(opened.graphCallId,selected.target.graphCallId);
  assert.equal(hash(opened.payload),opened.payloadDigest);
  const execution=truth.projectExactExecutionBasisAtPrefix(prefix,opened.basisId);assert(execution);
  assert.equal(execution.graphFunctionRef,selected.target.graphFunctionRef);
  assert.equal(hash(execution.rawInputValue),execution.rawInputDigest);assert.equal(execution.rawInputDigest,selected.target.inputDigest);
  const bases=prefixes.indexedRuntimeEvents(prefix,'payload:basisRef:'+execution.basisRef).filter(e=>e.kind==='basis_admitted' && e.basisId===execution.basisRef);assert.equal(bases.length,1);
  const basisEvent=bases[0];assert.equal(hash(basisEvent.payload),basisEvent.payloadDigest);
  const {rawInputValue,...basisScalars}=basisEvent.payload;
  const {rawInputValue:projectedInput,...executionScalars}=execution;
  await record('opened-execution.json',{installedOwnerRoot:runtimeRoot,prefix:durable,opened,basisEvent:{eventId:basisEvent.eventId,admissionOrdinal:basisEvent.admissionOrdinal,kind:basisEvent.kind,basisId:basisEvent.basisId,payloadDigest:basisEvent.payloadDigest,payloadScalars:basisScalars},execution:executionScalars,
    input:{digest:hash(projectedInput),isGovernanceWorkState:stateOwner.isGovernanceWorkState(projectedInput),terminal:projectedInput.terminal,originalDigest:hash(projectedInput.original),selectedProducerRef:projectedInput.synthesis?.judgment.subjectEvidenceRef??null,nextGraphFunctionRef:projectedInput.synthesis?.judgment.nextGraphFunctionRef??null}});
  stage='current_admitted_environment';
  const invocation=truth.projectExactInvocationAdmissionAtPrefix(prefix,execution.invocationAdmissionRef);assert(invocation);
  assert.equal(invocation.invocationAdmissionRef,native.receipt.resources.invocationAdmission.ref);
  const artifactTruth=a.projectOwnedPrefixArtifactTruth(durable);
  assert.equal(artifactTruth.kind,'exact_prefix_artifact_truth_projection');
  const environment=a.projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth,{ref:execution.workspaceBindingId,digest:execution.workspaceBindingDigest});
  assert.equal(environment.kind,'exact_prefix_workspace_environment');assert.deepEqual(environment.workspaceBinding,setup.workspaceBinding);
  const nativeInstall=environment.productInstalls.filter(i=>i.installedRoot===runtimeRoot);assert.equal(nativeInstall.length,1);assert.equal(nativeInstall[0].productContentDigest,selected.target.nativeContentDigest);
  const installedProducts=environment.productInstalls.map(i=>{
    const actual=a.projectAdmittedProductInstallByAdmissionEventRef(artifactTruth,i.admissionEventRef);assert(actual);assert.deepEqual(actual.install,i);return actual.candidate;
  });
  stage='exact_supplied_catalog_reconstruction';
  let sdk=await frozen(selected.references.sdkRequest);
  const supplied=sdk.invocation.resources;
  const reconstructed=declarations.reconstructHistoricalDeclarationCatalog({catalog:supplied.catalog,catalogView:supplied.catalogView},
    {workspaceBinding:environment.workspaceBindingCandidate,resolvedLock:environment.resolvedProductLock,installedProducts});
  const catalog=reconstructed.catalog;
  assert.equal(catalog.basisDigest,catalogOutcome.receipt.ownerOutput.value.catalog.digest);
  assert.equal(catalog.basisDigest,invocation.catalogBasisDigest);assert.equal(reconstructed.catalogView.viewDigest,invocation.catalogViewDigest);
  assert.deepEqual({ref:'graph-function-catalog-view://abiogenesis/'+reconstructed.catalogView.viewDigest.slice('sha256:'.length),digest:reconstructed.catalogView.viewDigest},setup.view);
  const entries=catalog.entries.filter(e=>e.definitionRef===execution.graphFunctionRef);assert.equal(entries.length,1);
  const entry=p.lookupGraphFunction(catalog,entries[0].handle);assert(entry);assert.deepEqual(entry,entries[0]);
  const publicRows=catalogOutcome.receipt.ownerOutput.value.rows.filter(row=>row.subject.ref===entry.handle && row.subject.digest===entry.entryDigest);assert.equal(publicRows.length,1);assert.equal(publicRows[0].disposition,'admitted');
  const publications=catalog.boundPublications.filter(pub=>pub.moduleRef===entry.moduleRef && p.modulePublicationSemanticDigest(pub)===entry.publicationDigest);assert.equal(publications.length,1);
  const publication=publications[0],published=publication.graphFunctions.filter(g=>g.name===execution.graphFunctionRef);assert.equal(published.length,1);
  assert.equal(hash(entry.definition),entry.definitionDigest);assert.equal(hash(published[0]),entry.definitionDigest);assert.equal(entry.definitionDigest,execution.graphFunctionDigest);
  await record('selected-testing-definition.json',entry.definition);
  const raw=library.defaultGovernanceGraphFunctions().filter(g=>g.name===execution.graphFunctionRef);assert.equal(raw.length,1);
  const rawDigest=hash(raw[0]);assert.equal(rawDigest,comparison.testing.authoredDigest);
  const basis={invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue};
  const actualGraph=materializer.materializeGraph(entry.definition,basis),rawGraph=materializer.materializeGraph(raw[0],basis);
  assert.equal(actualGraph.materializationDigest,execution.graphDigest);assert.equal(actualGraph.materializationRef,execution.graphRef);
  const differences=[];
  function difference(left,right,path='') {
    if(hash(left)===hash(right))return;
    if(left && right && typeof left==='object' && typeof right==='object' && !Array.isArray(left) && !Array.isArray(right)) {
      for(const key of new Set([...Object.keys(left),...Object.keys(right)])) {
        if(!Object.hasOwn(left,key) || !Object.hasOwn(right,key))differences.push({path:path+'/'+key,left:left[key]??null,right:right[key]??null});
        else difference(left[key],right[key],path+'/'+key);
      }
    } else differences.push({path,left,right});
  }
  difference(raw[0],entry.definition);
  const result={kind:'selected_definition_occurrence_join',installedOwnerRoot:runtimeRoot,prefix:durable,elapsedMs:elapsed(),
    actualExecution:{basisRef:execution.basisRef,basisDigest:execution.basisDigest,openedEventRef:opened.eventId,basisEventRef:basisEvent.eventId,graphFunctionRef:execution.graphFunctionRef,graphFunctionDigest:execution.graphFunctionDigest,graphRef:execution.graphRef,graphDigest:execution.graphDigest,inputDigest:execution.rawInputDigest},
    catalog:{basisDigest:catalog.basisDigest,viewDigest:reconstructed.catalogView.viewDigest,handle:entry.handle,entryDigest:entry.entryDigest,definitionDigest:entry.definitionDigest,publicAdmittedSubject:publicRows[0].subject,publicSubjectMeaning:'Catalog entry.entryDigest, not complete GraphFunction definitionDigest',moduleRef:entry.moduleRef,owningProductId:entry.owningProductId,publicationDigest:entry.publicationDigest,publishedDefinitionDigest:hash(published[0]),boundPublicationEqualsFinalDefinition:p.canonicalJson(published[0])===p.canonicalJson(entry.definition)},
    guardFacts:{executionAvailable:true,referenceMatchesRawBuilder:execution.graphFunctionRef===raw[0].name,rawBuilderDigest:rawDigest,executionDigestEqualsRawBuilder:execution.graphFunctionDigest===rawDigest,executionDigestEqualsPriorCanonicalPublication:execution.graphFunctionDigest===comparison.testing.publishedDigest,workspaceBindingMatchesCurrentOwner:execution.workspaceBindingId===environment.workspaceBinding.bindingId && execution.workspaceBindingDigest===environment.workspaceBinding.bindingDigest,libraryInputHasSelectedTestingChoice:stateOwner.isGovernanceWorkState(projectedInput) && !projectedInput.terminal && projectedInput.synthesis?.judgment.nextGraphFunctionRef===selected.target.graphFunctionRef},
    materialization:{actual:{graphFunctionDigest:actualGraph.graphFunctionDigest,ref:actualGraph.materializationRef,digest:actualGraph.materializationDigest,matchesAdmitted:true},raw:{graphFunctionDigest:rawGraph.graphFunctionDigest,ref:rawGraph.materializationRef,digest:rawGraph.materializationDigest,matchesAdmitted:rawGraph.materializationDigest===execution.graphDigest && rawGraph.materializationRef===execution.graphRef}},
    rawToFinalDefinitionDifferences:differences,
    authenticatedEnvironment:{bindingId:environment.workspaceBinding.bindingId,bindingDigest:environment.workspaceBinding.bindingDigest,lockId:environment.resolvedProductLock.lockId,lockDigest:environment.resolvedProductLock.lockDigest,installs:environment.productInstalls.map(i=>({ref:i.installId,admissionEventRef:i.admissionEventRef,content:i.productContentDigest})),invocationAdmissionRef:invocation.invocationAdmissionRef},
    limits:['No callback/native reacquisition constructor/effect was invoked.','Fresh private reacquisition request/current-context tuple is not retained; later input/request/grant/physical conjuncts are not claimed proved.','These are current closed-prefix read models; no new Run/admission/Source authority.']};
  await record('diagnostic-result.json',result);
  sdk=null;
  console.log(JSON.stringify({stage:'selected_definition_complete',execution:result.actualExecution,catalog:result.catalog,guardFacts:result.guardFacts,materialization:result.materialization,elapsedMs:elapsed()}));
  stage='normal_close';
  const closing=a.closeAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));resource=null;
  await record('normal-close.json',closing);assert.deepEqual(closing.closeHandoff,closed);
  assert.deepEqual(await physical(),selected.expectedPhysical);
  await record('conservation.json',{physical:await physical(),quiet:await checkQuiet(),fixture:await fixture(),unchangedClose:true,acquisitions:1,newRuntimeAdmissions:0,nativeWorksiteEffects:0,elapsedMs:elapsed()});
  console.log(JSON.stringify({stage:'normal_close_complete',elapsedMs:elapsed()}));
} catch(error) {
  await record('first-cause.json',{stage,errorClass:error.constructor.name,message:error.message,stack:String(error.stack).split('\n').slice(0,6),elapsedMs:elapsed()});
  console.error(JSON.stringify({stage,errorClass:error.constructor.name,message:error.message}));process.exitCode=1;
} finally {
  if(resource!==null) {
    const closing=a.closeAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));
    await record('failure-normal-close.json',closing);resource=null;
  }
}
