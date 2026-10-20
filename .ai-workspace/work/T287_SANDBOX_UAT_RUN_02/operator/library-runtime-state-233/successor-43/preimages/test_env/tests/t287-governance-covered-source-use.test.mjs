import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {syncBuiltinESMExports} from 'node:module';

const root=process.env.ABG_GOVERNANCE_COVERED_BUILD_ROOT??path.resolve('build/code/src');
const load=name=>import(pathToFileURL(path.join(root,name+'.js')).href);
const p=await load('product/index'),gtl=await load('gtl/index'),semantics=await load('product/semantics');
const prefixOwner=await load('abg/event_prefix'),eventOwner=await load('abg/event_store'),truth=await load('abg/invocation_execution_truth');
const terminal=await load('abg/terminal_result_contracts'),decl=await load('product/declaration_closure');
const freeze=(await load('shared/immutable')).deepFreeze,hash=p.sha256Canonical;
const fixturePath=process.env.ABG_GOVERNANCE_COVERED_FIXTURE;
const declarationPairPath=process.env.ABG_GOVERNANCE_COVERED_DECLARATION_PAIR;
const proofRoot=process.env.ABG_GOVERNANCE_COVERED_PROOF_ROOT;
const clone=value=>JSON.parse(JSON.stringify(value));
async function moduleAt(name,replacements={},names=[]) {
  const file=path.join(root,name+'.js'),m=new SourceTextModule(fs.readFileSync(file,'utf8')+(names.length?'\nexport { '+names.join(',')+' };':''),{identifier:file});
  await m.link(async spec=>{const actual=await import(spec.startsWith('node:')||!spec.startsWith('.')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href);
    const values={...actual,...replacements[spec]};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();return m.namespace;
}
const oldIdentity={productId:p.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-rc.1',artifactDigest:hash('old archive'),productContentDigest:hash('old content'),productManifestDigest:hash('old manifest')};
const newIdentity={...oldIdentity,artifactDigest:hash('new archive'),productContentDigest:hash('new content'),productManifestDigest:hash('new manifest')};
const publications=identity=>['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'].map(n=>gtl[n](identity));

test('normal close preserves the owned ArtifactTruth snapshot while copies and fresh reads validate bytes',{skip:!proofRoot},async t=>{
  fs.mkdirSync(proofRoot,{recursive:true});const scratch=fs.mkdtempSync(path.join(proofRoot,'closed-owner-'));
  t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
  const eventLogPath=path.join(scratch,'events.jsonl'),resourceOwner=await load('abg/definition_event_resource'),artifact=await load('abg/artifact_truth');
  const opened=eventOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath});assert.ok(opened.store);
  let handoff;
  try {
    const basisRef='basis://finite/owned-snapshot-fixture';
    eventOwner.admitRuntimeEvent(opened.store,{kind:'basis_admitted',eventTime:'2026-09-23T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://owned-snapshot-fixture',
      parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://finite/owned-snapshot',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:basisRef,
      payload:{basisRef,basisDigest:hash('finite owned snapshot'),basisClass:'root',rawInputValue:{kind:'component-premise'}}});
    handoff=opened.store.projectReopenAuthorityAndClose();
  } finally {opened.store.closeDurableLog();}
  const acquired=resourceOwner.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)});
  assert.equal(acquired.kind,'acquired_abg_event_resource');
  const nominal=acquired.resource.entryPrefix,bytes=fs.readFileSync(eventLogPath);
  let physicalOpens=0,closed=false;const originalOpen=fs.openSync;
  fs.openSync=function(file,...args){if(String(file)===eventLogPath)physicalOpens++;return originalOpen.call(fs,file,...args);};syncBuiltinESMExports();
  try {
    const before=artifact.projectOwnedPrefixArtifactTruth(nominal);assert.equal(before.kind,'exact_prefix_artifact_truth_projection');
    const meaning=JSON.stringify(before),digest=before.projectionDigest;
    const receipt=resourceOwner.closeAbgEventResource(acquired.resource,nominal);closed=true;assert.deepEqual(receipt.closeHandoff.prefix,nominal);
    assert.notStrictEqual(receipt.closeHandoff.prefix,nominal,'portable close metadata is detached from the retained owner prefix');
    assert.strictEqual(eventOwner.captureDurablePrefixCoordinate(nominal),nominal);
    assert.notStrictEqual(eventOwner.captureDurablePrefixCoordinate(receipt.closeHandoff.prefix),receipt.closeHandoff.prefix,
      'portable close metadata has no nominal runtime-history association');
    assert.throws(()=>resourceOwner.selectAcquiredAbgEventResource(acquired.resource,nominal),TypeError,'closed owner grants no acquired selection');
    const after=artifact.projectOwnedPrefixArtifactTruth(nominal);
    assert.strictEqual(after,before,'the closed append lease leaves the actual snapshot-local receipt intact');
    assert.equal(JSON.stringify(after),meaning);assert.equal(after.projectionDigest,digest);
    assert.equal(physicalOpens,0,'owned internal projection performs no second physical acquisition after close');
    const portable=artifact.projectOwnedPrefixArtifactTruth(receipt.closeHandoff.prefix);assert.deepEqual(portable,before);
    const portableOpens=physicalOpens;assert.equal(portableOpens,1,'portable close metadata undergoes ordinary cold validation');
    const fresh=artifact.projectExactPrefixArtifactTruth(nominal);assert.equal(fresh.kind,'exact_prefix_artifact_truth_projection');assert.deepEqual(fresh,before);
    const freshOpens=physicalOpens-portableOpens;assert.equal(freshOpens,1,'explicit fresh API still validates physical bytes');
    const copied=artifact.projectOwnedPrefixArtifactTruth(structuredClone(nominal));assert.equal(copied.kind,'exact_prefix_artifact_truth_projection');assert.deepEqual(copied,before);
    const copiedOpens=physicalOpens-portableOpens-freshOpens;assert.equal(copiedOpens,1,'a raw copy has no nominal receipt');
    const resign=coordinate=>{const {coordinateDigest,...body}=coordinate;return {...body,coordinateDigest:hash(body)};};
    const foreign=structuredClone(nominal);foreign.storeIdentity.inode+=1;
    assert.equal(artifact.projectOwnedPrefixArtifactTruth(resign(foreign)).code,'file_identity_mismatch');
    const changed=Buffer.from(bytes);changed[0]^=1;fs.writeFileSync(eventLogPath,changed);
    assert.equal(artifact.projectExactPrefixArtifactTruth(nominal).code,'prefix_digest_mismatch');
    assert.equal(artifact.projectOwnedPrefixArtifactTruth(receipt.closeHandoff.prefix).code,'prefix_digest_mismatch');
    assert.equal(artifact.projectOwnedPrefixArtifactTruth(structuredClone(nominal)).code,'prefix_digest_mismatch');
    fs.writeFileSync(eventLogPath,Buffer.concat([bytes,Buffer.from(' ')]));
    assert.throws(()=>eventOwner.readRuntimeEventsAtDurablePrefix(nominal,{requireCurrent:true}),e=>e.code==='prefix_length_mismatch');
    fs.writeFileSync(eventLogPath,bytes);assert.deepEqual(fs.readFileSync(eventLogPath),bytes);
    console.log(JSON.stringify({kind:'closed_owner_artifact_snapshot',ownedAdditionalPhysicalOpens:0,portableHandoffPhysicalOpens:portableOpens,freshPhysicalOpens:freshOpens,copiedPhysicalOpens:copiedOpens,
      projectionDigest:digest,prefixLength:nominal.prefixLength,scope:'one real contract-admitted fixture event/resource/ArtifactTruth; no installed environment, covered-source admission, campaign capacity or UAT credit'}));
  } finally {
    fs.openSync=originalOpen;syncBuiltinESMExports();if(!closed)resourceOwner.closeAbgEventResource(acquired.resource,nominal);fs.writeFileSync(eventLogPath,bytes);
  }
});

test('complete canonical declarations permit only publication identity consequences',()=>{
  const old=publications(oldIdentity),next=publications(newIdentity),compared=semantics.compareGovernanceDeclarationPublications(old,next);
  assert.ok(compared);assert.equal(compared.owners.length,3);
  for(const row of compared.owners){assert.equal(row.historicalPublicationDigest,hash(old.find(p=>p.moduleRef===row.moduleRef)));assert.equal(row.currentPublicationDigest,hash(next.find(p=>p.moduleRef===row.moduleRef)));}
  const cases=[['Program',x=>x[0].programs[0].policies['abg.default_start_ref']='start://foreign'],
    ['membership',x=>x[0].programs[0].callableMembership.pop()],['graph',x=>x[0].graphFunctions[0].tags.push('changed meaning')],
    ['contract',x=>x[0].contracts[0].valueKind='different_value'],['closure',x=>x[0].closureContracts[0].predicateRef='predicate://foreign'],
    ['implementation',x=>x[0].implementationBindings[0].namedSymbol='foreignRealizer'],['policy',x=>x[0].runEnvironments[0].roles[0].policy.text+=' changed'],
    ['contribution',x=>x[0].contributions[0].readinessPrerequisiteRefs.push('program://foreign')],
    ['source identity owner',x=>x[0].descriptorRef='descriptor://foreign/'+newIdentity.productContentDigest.slice(7)],
    ['arbitrary provenance',x=>x[0].contributions[0].provenanceRefs.push('event://invented')]];
  for(const [name,alter]of cases){const changed=clone(next);alter(changed);assert.equal(semantics.compareGovernanceDeclarationPublications(old,changed),null,name);}
  assert.equal(semantics.compareGovernanceDeclarationPublications([...old,old[0]],next),null);
  assert.equal(semantics.compareGovernanceDeclarationPublications(old,[...next.slice(0,2),next[0]]),null);
  assert.equal(semantics.compareGovernanceDeclarationPublications(old,next.slice(0,2)),null);
});

test('frozen176 selected declarations compare across artifact and manifest hash-order reversal',
  {skip:!declarationPairPath},t=>{
  const pair=JSON.parse(fs.readFileSync(declarationPairPath,'utf8'));
  assert.equal(pair.kind,'frozen_selected_declaration_pair');
  assert.equal(pair.historical.length,4);assert.equal(pair.current.length,4);
  const before=JSON.stringify(pair),forward=semantics.compareGovernanceDeclarationPublications(pair.historical,pair.current);
  const reverse=semantics.compareGovernanceDeclarationPublications(pair.current,pair.historical);
  assert.ok(forward);assert.ok(reverse);assert.equal(forward.meaningDigest,reverse.meaningDigest);
  assert.equal(forward.owners.length,4);
  for(const row of forward.owners){
    assert.equal(row.historicalPublicationDigest,hash(pair.historical.find(x=>x.moduleRef===row.moduleRef&&x.owningProductId===row.productId)));
    assert.equal(row.currentPublicationDigest,hash(pair.current.find(x=>x.moduleRef===row.moduleRef&&x.owningProductId===row.productId)));
  }
  assert.equal(JSON.stringify(pair),before,'private ordering never mutates the actual owned publication values');
  t.diagnostic(JSON.stringify({selectedCapturedPublications:4,meaningDigest:forward.meaningDigest,
    scope:'pure comparison of frozen176 selected declaration values; no whole Catalog reconstruction, admission or installed current-use credit'}));
});

test('only the substituted provenance inventory is ordered and every reference remains material',()=>{
  const old=publications({...oldIdentity,artifactDigest:'sha256:'+'f'.repeat(64),productManifestDigest:'sha256:'+'1'.repeat(64)});
  const next=publications({...newIdentity,artifactDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'e'.repeat(64)});
  assert.deepEqual(old[0].contributions[0].provenanceRefs,['sha256:'+'1'.repeat(64),'sha256:'+'f'.repeat(64)]);
  assert.deepEqual(next[0].contributions[0].provenanceRefs,['sha256:'+'2'.repeat(64),'sha256:'+'e'.repeat(64)]);
  assert.ok(semantics.compareGovernanceDeclarationPublications(old,next));
  assert.ok(semantics.compareGovernanceDeclarationPublications(next,old));
  const bad=[
    ['missing provenance',x=>x[0].contributions[0].provenanceRefs.pop()],
    ['duplicate provenance',x=>x[0].contributions[0].provenanceRefs.push(x[0].artifactDigest)],
    ['arbitrary provenance',x=>x[0].contributions[0].provenanceRefs.push('event://unowned')],
    ['foreign provenance',x=>x[0].contributions[0].provenanceRefs[0]='sha256:'+'3'.repeat(64)],
    ['contract',x=>x[0].contracts[0].valueKind='different_value'],
    ['rule',x=>x[0].rules[0].config={changedRuleMeaning:true}],
    ['policy',x=>x[0].runEnvironments[0].roles[0].policy.text+=' changed'],
    ['permission prerequisite',x=>x[0].contributions[0].readinessPrerequisiteRefs.push('program://foreign')],
    ['other declared vector',x=>{
      const evaluator=x[0].evaluators.find(row=>row.name===p.governanceRef('evaluator','select'));
      assert.ok(evaluator);assert.deepEqual(evaluator.consumedFieldRefs,['$.context','$.state']);
      const before=JSON.stringify(evaluator.consumedFieldRefs);evaluator.consumedFieldRefs.reverse();
      assert.notEqual(JSON.stringify(evaluator.consumedFieldRefs),before,'the negative must change the actual declared vector');
    }],
  ];
  for(const [name,alter]of bad){const changed=clone(next);alter(changed);assert.equal(semantics.compareGovernanceDeclarationPublications(old,changed),null,name);}
  // Unknown references and repeated occurrences are preserved, not discarded
  // by the private comparison. Their actual ownership is a separate guard.
  const left=clone(old),right=clone(next),unknown=['event://opaque/\u{1f600}','event://opaque/\uffff'];
  for(const population of [left,right])population[0].contributions[0].provenanceRefs.push(...unknown,unknown[0]);
  assert.ok(semantics.compareGovernanceDeclarationPublications(left,right));
  right[0].contributions[0].provenanceRefs.pop();
  assert.equal(semantics.compareGovernanceDeclarationPublications(left,right),null,'arbitrary reference multiplicity is not deduplicated');
});

// Complete original declaration/verified asset values are retained inputs.
// Current physical environment, occurrence and witnessed cover lookups in the
// following component proof are explicitly controlled premises. They do not
// establish an installed transition, an admitted DataMapper Run or UAT success.
function captured(){assert.ok(fixturePath,'select the frozen bounded fixture');return JSON.parse(fs.readFileSync(fixturePath,'utf8'));}
function eventsFixture(){const rows=[];return {rows,append(kind,payload,extra={}){
  const candidate={kind,payload,eventTime:'2026-10-09T01:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://covered-test',parentAggregateId:null,
    causationEventRefs:[],correlationId:'correlation://covered-test',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'authority://covered-test',...extra};
  const row=eventOwner.projectRuntimeEventFromValidatedHistory(rows,candidate);rows.push(row);return row;
},prefix:()=>prefixOwner.selectValidatedRuntimeEventPrefix(freeze([...rows]))};}
function coordinate(rows){const physical=eventOwner.runtimeEventPhysicalPrefix(rows),body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///unopened/covered-component.events.jsonl',prefixLength:physical.byteLength,prefixDigest:physical.digest,storeIdentity:{device:0,inode:0,eventContractDigest:eventOwner.ROOT_EVENT_CONTRACT_DIGEST}};return freeze({...body,coordinateDigest:hash(body)});}
function invokeRow(f,fields){
  const body={invocationRef:'invocation://covered-test/'+f.rows.length,invocationDigest:hash(['invocation',f.rows.length]),invocationVariant:'direct',
    rawInputAdmissionRef:'raw://covered-test',rawInputDigest:hash('raw'),publicRequestAdmissionRef:'request://covered-test',publicRequestDigest:hash('request'),publicRequestInvocationRef:'public://covered-test/'+f.rows.length,
    workspaceId:'workspace://covered-test',workspaceBindingId:'binding://covered-test',workspaceBindingDigest:hash('binding'),catalogBasisRef:'catalog://covered-test',catalogBasisDigest:hash('catalog'),catalogViewId:'view://covered-test',catalogViewDigest:hash('view'),catalogApplicationRefs:[],catalogApplicationDigests:[],
    programRef:'program://covered-test',programDigest:hash('program'),catalogHandle:'graph://covered-test',graphFunctionRef:'graph://covered-test',graphFunctionDigest:hash('graph'),selectedDefinitionRef:'graph://covered-test',selectedDefinitionDigest:hash('definition'),gtlEntryCoordinate:{kind:'controlled-coordinate'},gtlEntryTerm:{kind:'controlled-term'},
    inputContractRef:p.governanceContract('state'),inputContractDigest:hash('input contract'),inputContractOwner:{owner:'input'},outputContractRef:p.governanceContract('state'),outputContractDigest:hash('output contract'),outputContractOwner:{owner:'output'},productExecutionResolutionRef:'resolution://covered-test',productExecutionResolutionDigest:hash('resolution'),programValidationRef:'validation://covered-test',programValidationDigest:hash('validation'),policyRef:'policy://covered-test',policyDigest:hash('policy'),capabilityGrants:[],capabilityGrantRefs:[],authorityRef:'authority://covered-test',authorityDigest:hash('authority'),actorRef:'actor://covered-test',publicStart:null,reentryBasis:null,sourceResultBasis:null,...fields};
  const admissionDigest=hash(body),admissionRef='invocation-admission://abiogenesis/'+admissionDigest.slice(7);
  // This component fixture supplies the Public definition/authority premise.
  // Project the same closed coordinate fields as the invoking owner; the full
  // InvocationAdmission body belongs only to its own event.
  const publicPayload={operationId:'abg.operation.run.invoke',memberKey:'invoke',definitionDigest:hash('controlled definition'),variant:body.invocationVariant};
  for(const key of ['invocationRef','invocationDigest','actorRef','authorityRef','authorityDigest','capabilityGrantRefs',
    'catalogApplicationRefs','catalogApplicationDigests','policyRef','policyDigest','workspaceBindingId','catalogBasisRef',
    'catalogBasisDigest','catalogViewId','programRef','catalogHandle','graphFunctionRef','selectedDefinitionRef',
    'selectedDefinitionDigest','programValidationRef','programValidationDigest','gtlEntryCoordinate','gtlEntryTerm']) publicPayload[key]=body[key];
  const common={aggregateId:body.workspaceBindingId,parentAggregateId:body.invocationRef};
  const operation=f.append('public_operation_admitted',publicPayload,{...common,basisId:body.authorityRef});
  const admission=f.append('invocation_admitted',{...body,invocationAdmissionRef:admissionRef,invocationAdmissionDigest:admissionDigest},{...common,basisId:admissionRef,causationEventRefs:[operation.eventId]});
  return {operation,admission,body};
}
async function coveredFixture(){
  const c=captured(),old={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:c.oldCatalog,catalogView:c.oldView};
  const readiness=c.oldCatalog.readinessBasis,oldCandidate=readiness.workspaceBinding;
  const nextReady=clone(readiness),authority=c.authority;
  // This controlled binding transition has the same A/root and installed
  // meaning. Catalog construction is genuine; witness/environment membership
  // is supplied below rather than invented by a path or copied source state.
  nextReady.workspaceBinding=clone(oldCandidate);nextReady.workspaceBinding.roots.projectionRoot+='/covered-test';
  const {kind,schemaVersion,bindingId,bindingDigest,...bindingBody}=nextReady.workspaceBinding;
  nextReady.workspaceBinding={kind,schemaVersion,...bindingBody,bindingDigest:hash(bindingBody),bindingId:'workspace-binding://abiogenesis/'+hash(bindingBody).slice(7)};
  const nextCatalog=p.admitGraphFunctionCatalog(nextReady);assert.equal(nextCatalog.kind,'graph_function_catalog',JSON.stringify(nextCatalog));
  const nextView=p.narrowGraphFunctionCatalog(nextCatalog,c.oldView.allowlist);assert.equal(nextView.kind,'graph_function_catalog_view');
  const current={kind:old.kind,schemaVersion:old.schemaVersion,catalog:nextCatalog,catalogView:nextView};
  const oldW={...oldCandidate,kind:'workspace_binding',admissionEventRef:'event://old-binding'},newW={...nextReady.workspaceBinding,kind:'workspace_binding',admissionEventRef:'event://new-binding'};
  const program=readiness.publications.flatMap(p=>p.programs).find(p=>p.programRef===c.sourceBasisPremise.sourceResultValue.synthesis?.basis?.programRef)??readiness.publications.flatMap(p=>p.programs).find(p=>p.programRef.includes('sandbox-uat'));
  assert.ok(program,'select the actual retained consumer Program');
  const gf=readiness.publications.flatMap(p=>p.graphFunctions).find(g=>g.name===program.starts[0].graphFunctionRef);assert.ok(gf);
  const closure=decl.resolveExecutionDeclarationClosure(old.catalog,old.catalogView,program.programRef,gf.name);assert.equal(closure.kind,'resolved_execution_declaration_closure');
  const input=decl.selectExactClosureContract(closure,p.governanceContract('state')),output=decl.selectExactClosureContract(closure,p.governanceContract('state'));assert.ok(input&&output);
  const f=eventsFixture(),inv=invokeRow(f,{workspaceId:oldW.workspaceId,workspaceBindingId:oldW.bindingId,workspaceBindingDigest:oldW.bindingDigest,actorRef:oldW.authorizedActorRef,
    programRef:program.programRef,programDigest:hash(program),graphFunctionRef:gf.name,graphFunctionDigest:hash(gf),catalogBasisDigest:old.catalog.basisDigest,catalogViewDigest:old.catalogView.viewDigest,
    catalogBasisRef:'graph-function-catalog://abiogenesis/'+old.catalog.basisDigest.slice(7),catalogViewId:'graph-function-catalog-view://abiogenesis/'+old.catalogView.viewDigest.slice(7),
    inputContractDigest:hash(input.contract),inputContractOwner:input.owner,outputContractDigest:hash(output.contract),outputContractOwner:output.owner});
  const oldInvocation=truth.projectExactInvocationAdmissionAtPrefix(f.prefix(),inv.admission.payload.invocationAdmissionRef);assert.ok(oldInvocation,'actual complete cold invocation record');
  const runId='run://covered-source',graphCallId='graph-call://covered-source',frameId='frame://covered-source',basisRef='basis://covered-source';
  const run=f.append('run_segment_opened',{runId,runDigest:hash(runId),invocationAdmissionRef:oldInvocation.invocationAdmissionRef,invocationRef:oldInvocation.invocationRef,
    workspaceBindingId:oldW.bindingId,programRef:program.programRef,graphFunctionRef:gf.name,graphRef:gf.name,graphDigest:hash(gf.template),executionBasisRef:basisRef,executionBasisDigest:hash('controlled source basis')},
    {aggregateType:'run',aggregateId:runId,parentAggregateId:oldW.bindingId,scopeClass:'run',basisId:basisRef,runId,graphFunctionRef:gf.name,causationEventRefs:[inv.admission.eventId]});
  const callScope={aggregateType:'c_call',aggregateId:'c-call://covered-source',parentAggregateId:frameId,scopeClass:'run',basisId:basisRef,runId,graphCallId,frameId,graphFunctionRef:gf.name};
  const fibre=f.append('c_call_fibre_selected',{cCallRef:callScope.aggregateId,callClass:'leaf',regime:'F_D',armId:'arm://covered-source',implementationRef:p.governanceRef('implementation','fold')},
    {...callScope,causationEventRefs:[run.eventId]});
  const resultBody={cCallRef:callScope.aggregateId,resultClass:'success',contractRef:p.governanceContract('state'),valueKind:'governance_work_state',value:c.state34,valueDigest:hash(c.state34),evidenceRefs:[]};
  const result=f.append('c_call_result_admitted',{...resultBody,resultRef:'result://abiogenesis/'+hash(resultBody).slice(7),resultDigest:hash(resultBody)},
    {...callScope,causationEventRefs:[fibre.eventId]});
  const judgmentBody={cCallRef:callScope.aggregateId,contractRef:p.governanceContract('judgment'),judgment:'advance',retryAttemptRef:null,resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest};
  const judgment=f.append('c_call_judged',{...judgmentBody,judgmentRef:'judgment://abiogenesis/'+hash(judgmentBody).slice(7),judgmentDigest:hash(judgmentBody)},
    {...callScope,causationEventRefs:[result.eventId]});
  const {kind:sk,schemaVersion:sv,basisRef:sr,basisDigest:sd,...sourceBody}=c.sourceBasisPremise;
  Object.assign(sourceBody,{sourceInvocationAdmissionRef:oldInvocation.invocationAdmissionRef,sourceInvocationRef:oldInvocation.invocationRef,sourceWorkspaceId:oldW.workspaceId,
    sourceGraphCallId:graphCallId,sourceGraphFunctionRef:gf.name,sourceResultAdmissionEventRef:result.eventId,sourceResultJudgmentEventRef:judgment.eventId,sourceResultRef:result.payload.resultRef,sourceResultDigest:result.payload.resultDigest,
    sourceResultValueDigest:result.payload.valueDigest,sourceResultValue:c.state34,sourceCCallRef:result.aggregateId,sourceRunId:runId,workspaceBindingId:oldW.bindingId,workspaceBindingDigest:oldW.bindingDigest});
  const source={kind:sk,schemaVersion:sv,...sourceBody,basisDigest:hash(sourceBody),basisRef:'invocation-source-result://abiogenesis/'+hash(sourceBody).slice(7)};
  const oldBasis={basisRef,basisDigest:hash('controlled source basis'),invocationAdmissionRef:oldInvocation.invocationAdmissionRef,invocationRef:oldInvocation.invocationRef,
    workspaceBindingId:oldW.bindingId,workspaceBindingDigest:oldW.bindingDigest,catalogBasisDigest:old.catalog.basisDigest,catalogViewDigest:old.catalogView.viewDigest,graphFunctionRef:gf.name};
  const gates={cover:true,environment:true,install:true,artifact:true,reads:0};
  // Both ArtifactTruth and environment authentication are controlled lower
  // premises here; the actual closed-owner lifetime is proved separately.
  const controlledArtifactTruth=freeze({kind:'exact_prefix_artifact_truth_projection'});
  const environment=(w,proof)=>({kind:'exact_prefix_workspace_environment',workspaceBinding:w,workspaceBindingCandidate:proof.catalog.readinessBasis.workspaceBinding,resolvedProductLock:proof.catalog.readinessBasis.resolvedLock,
    productInstalls:proof.catalog.readinessBasis.installedProducts.map((candidate,index)=>({admissionEventRef:'install:'+w.bindingId+':'+index,candidate})),artifactTruth:{}});
  const oldEnv=environment(oldW,old),nextEnv=environment(newW,current);
  const overrides={'./artifact_truth.js':{projectOwnedPrefixArtifactTruth:()=>gates.artifact?controlledArtifactTruth:{kind:'exact_prefix_artifact_truth_projection_refusal'}},
    './environment_admission.js':{projectWorkspaceEnvironmentFromArtifactTruth:(artifact,id)=>{assert.strictEqual(artifact,controlledArtifactTruth);gates.reads++;return gates.environment?(id.ref===oldW.bindingId?oldEnv:nextEnv):{kind:'unavailable'};},projectAdmittedProductInstallByAdmissionEventRef:(_a,id)=>gates.install?[...oldEnv.productInstalls,...nextEnv.productInstalls].find(p=>p.admissionEventRef===id):null},
    './worksite_revision.js':{projectAdmittedWorkspaceBindingAtCoordinate:(_p,id,d)=>[oldW,newW].find(w=>w.bindingId===id&&w.bindingDigest===d)??null,projectWorksiteRevisionBindingCover:(_p,a,b,bases)=>gates.cover&&a.bindingId===oldW.bindingId&&b.bindingId===newW.bindingId&&bases.every(x=>x.basisRef===oldBasis.basisRef)?['event://controlled-cover']:null},
  };
  // The exact source execution lookup is a lower premise; retain the owning
  // invocation and complete Catalog/closure comparison implementation intact.
  const sourceFile=path.join(root,'abg/invocation_execution_truth.js');let text=fs.readFileSync(sourceFile,'utf8');
  text+='\nexport function __controlledExecutionLookup(fn) { __testExecutionLookup = fn; }\n';
  text=text.replace('export function projectExactExecutionBasisAtPrefix(', 'let __testExecutionLookup = null;\nexport function projectExactExecutionBasisAtPrefix(');
  const marker=text.indexOf('export function projectExactExecutionBasisAtPrefix('),brace=text.indexOf('{',marker);
  text=text.slice(0,brace+1)+'\nif (__testExecutionLookup !== null) return __testExecutionLookup(prefix, basisRef);'+text.slice(brace+1);
  const m=new SourceTextModule(text,{identifier:sourceFile});await m.link(async spec=>{const actual=await import(pathToFileURL(path.resolve(path.dirname(sourceFile),spec)).href),values={...actual,...overrides[spec]};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const owner=m.namespace;owner.__controlledExecutionLookup((_p,id)=>id===oldBasis.basisRef?oldBasis:null);
  const inputUse={predecessorPrefix:coordinate(f.rows),source,workspaceBinding:newW,program,graphFunction:gf,currentDeclaration:current,historicalDeclarations:[old]};
  return {c,f,source,oldW,newW,old,current,program,gf,oldBasis,gates,owner,inputUse,result,judgment,oldInvocation,beforeRows:freeze([...f.rows])};
}

test('covered use binds exact original state, complete canonical Catalog and cold admitted coordinates',async t=>{
  const x=await coveredFixture(),stateBytes=JSON.stringify(x.c.state34),sourceBytes=JSON.stringify(x.source),valueDigest=x.result.payload.valueDigest;
  const use=x.owner.projectGovernanceCoveredSourceUse(x.f.prefix(),x.inputUse);assert.ok(use);
  assert.deepEqual(use.historicalDeclaration,terminal.constructAbgHistoricalDeclarationReference(x.old));assert.deepEqual(use.currentDeclaration,terminal.constructAbgHistoricalDeclarationReference(x.current));
  assert.equal(JSON.stringify(x.c.state34),stateBytes);assert.equal(JSON.stringify(x.source),sourceBytes);assert.equal(x.result.payload.valueDigest,valueDigest);
  assert.equal(use.sourceBasisDigest,x.source.basisDigest);assert.equal(use.declarationOwners.length,decl.resolveProgramDeclarationClosure(x.old.catalog,x.old.catalogView,x.program.programRef).publications.length);
  assert.ok(!Object.hasOwn(use,'readinessBasis'),'no Catalog/lock/state bodies in the private comparison result');
  const row=invokeRow(x.f,{workspaceId:x.newW.workspaceId,workspaceBindingId:x.newW.bindingId,workspaceBindingDigest:x.newW.bindingDigest,actorRef:x.newW.authorizedActorRef,
    programRef:x.program.programRef,programDigest:hash(x.program),graphFunctionRef:x.gf.name,graphFunctionDigest:hash(x.gf),catalogBasisDigest:x.current.catalog.basisDigest,catalogViewDigest:x.current.catalogView.viewDigest,
    catalogBasisRef:'graph-function-catalog://abiogenesis/'+x.current.catalog.basisDigest.slice(7),catalogViewId:'graph-function-catalog-view://abiogenesis/'+x.current.catalogView.viewDigest.slice(7),
    rawInputDigest:x.source.sourceResultValueDigest,sourceResultBasis:x.source});
  const invocation=x.owner.projectExactInvocationAdmissionAtPrefix(x.f.prefix(),row.admission.payload.invocationAdmissionRef);assert.ok(invocation);
  assert.equal(Object.hasOwn(row.admission.payload,'currentSourceUse'),false,'the existing event profile and invocation body remain unchanged');
  assert.equal(Object.hasOwn(invocation,'currentSourceUse'),false,'cold consumers do not depend on an extra admission field');
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(x.f.prefix(),invocation),true);
  assert.deepEqual(x.owner.governanceHistoricalDeclarationReferenceAtPrefix(x.f.prefix(),invocation,x.oldBasis),use.historicalDeclaration);
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(x.f.prefix(),{...invocation,actorRef:'actor://foreign'}),false,'copied comparison cannot replace invocation identity');
  const cold=prefixOwner.selectValidatedRuntimeEventPrefix(freeze(clone(x.f.rows)));
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(cold,clone(invocation)),true,'cold exact admitted record, not object identity, is consumed');
  const coverWas=x.gates.cover;x.gates.cover=false;
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(cold,invocation),false,'a missing crossing cannot be replaced by the admitted state value');
  x.gates.cover=coverWas;
  assert.equal(x.owner.governanceHistoricalDeclarationReferenceAtPrefix(cold,invocation,{...x.oldBasis,catalogViewDigest:hash('foreign View')}),null);
  assert.equal(x.owner.governanceHistoricalDeclarationReferenceAtPrefix(cold,invocation,{...x.oldBasis,invocationAdmissionRef:'invocation-admission://foreign'}),null);
  for(const gate of ['cover','environment','install']){x.gates[gate]=false;assert.equal(x.owner.projectGovernanceCoveredSourceUse(prefixOwner.selectValidatedRuntimeEventPrefix(x.beforeRows),x.inputUse),null,gate);x.gates[gate]=true;}
  const variants=[['Program',q=>q.program={...q.program,programRef:'program://foreign'}],['actor',q=>q.workspaceBinding={...q.workspaceBinding,authorizedActorRef:'actor://foreign'}],
    ['state',q=>q.source={...q.source,sourceResultValue:{...q.source.sourceResultValue,terminal:true}}],['source digest',q=>q.source={...q.source,sourceResultDigest:hash('forged')}],
    ['missing declarations',q=>q.historicalDeclarations=[]],['duplicate declarations',q=>q.historicalDeclarations=[x.old,x.old]],['foreign View',q=>q.currentDeclaration={...x.current,catalogView:{...x.current.catalogView,viewDigest:hash('foreign')}}],
    ['wrong prefix',q=>q.predecessorPrefix={...q.predecessorPrefix,prefixDigest:hash('wrong')}]];
  const before=prefixOwner.selectValidatedRuntimeEventPrefix(x.beforeRows);
  for(const[name,alter]of variants){const input={...x.inputUse};alter(input);assert.equal(x.owner.projectGovernanceCoveredSourceUse(before,input),null,name);}
  t.diagnostic(JSON.stringify({controlledPremises:['environment/install membership','execution source lookup','witnessed cover'],actualStateObservations:34,historicalStateDigest:valueDigest,
    privateComparisonBytes:Buffer.byteLength(JSON.stringify(use)),extraAdmissionBytes:0,owners:use.declarationOwners.map(o=>({moduleRef:o.moduleRef,historicalPublicationDigest:o.historicalPublicationDigest,currentPublicationDigest:o.currentPublicationDigest})),installedContinuation:false}));
});

test('later completed work follows actual admitted covered-source ancestry without root or value guesses',async t=>{
  const x=await coveredFixture();
  const replay={runId:x.result.runId,runtimeStatus:'blocked',runClosedEventRef:null,runStoppedEventRef:'event://controlled-source-stop',runtimeFailureEventRef:null,
    replayRef:'replay://controlled-source',replayDigest:hash('controlled semantic replay'),actorProcesses:[],cCalls:[{
      cCallRef:x.result.aggregateId,status:'judged',judgment:'advance',judgmentRef:x.judgment.payload.judgmentRef,
      resultRef:x.result.payload.resultRef,resultDigest:x.result.payload.resultDigest,resultContractRef:p.governanceContract('state'),resultClass:'success',resultValue:x.c.state34}]};
  // Replay is a disclosed lower premise. The production source derivation,
  // existing complete admitted-record guards, ancestry walk and later-progress
  // exclusion run unchanged. This does not authenticate a campaign producer.
  const admission=await moduleAt('abg/invocation_admission',{'./replay.js':{replayValidatedRuntimeEventPrefix:()=>replay},
    './invocation_execution_truth.js':{hasAdmittedGovernanceCoveredSourceUse:x.owner.hasAdmittedGovernanceCoveredSourceUse}});
  const selection={publicAuthorityDigest:x.oldInvocation.publicRequestDigest,runtimeInvocationRef:x.oldInvocation.invocationRef,
    invocationAdmissionRef:x.oldInvocation.invocationAdmissionRef,runId:x.result.runId,resultRef:x.result.payload.resultRef};
  const originalRows=clone(x.f.rows),derive=()=>admission.deriveInvocationSourceResultBasisAtPrefix(x.f.prefix(),selection);
  const initial=derive();assert.ok(initial);assert.deepEqual(initial.sourceResultValue,x.c.state34);
  const appendSuccessor=(linked=true)=>invokeRow(x.f,{workspaceId:x.newW.workspaceId,workspaceBindingId:x.newW.bindingId,workspaceBindingDigest:x.newW.bindingDigest,actorRef:x.newW.authorizedActorRef,
    programRef:x.program.programRef,programDigest:hash(x.program),graphFunctionRef:x.gf.name,graphFunctionDigest:hash(x.gf),catalogBasisDigest:x.current.catalog.basisDigest,catalogViewDigest:x.current.catalogView.viewDigest,
    catalogBasisRef:'graph-function-catalog://abiogenesis/'+x.current.catalog.basisDigest.slice(7),catalogViewId:'graph-function-catalog-view://abiogenesis/'+x.current.catalogView.viewDigest.slice(7),
    rawInputDigest:x.source.sourceResultValueDigest,sourceResultBasis:linked?x.source:null});
  const later=(successor,implementationRef,contractRef,value)=>{
    const scope={aggregateType:'c_call',aggregateId:'c-call://later-completed',parentAggregateId:'frame://later',scopeClass:'run',basisId:'basis://later',runId:'run://later',graphCallId:'graph-call://later',frameId:'frame://later',graphFunctionRef:x.gf.name};
    const basis=x.f.append('basis_admitted',{basisRef:scope.basisId,basisDigest:hash('controlled later basis'),basisClass:'root',rawInputValue:x.c.state34,
      invocationAdmissionRef:successor.admission.payload.invocationAdmissionRef},{aggregateId:x.newW.bindingId,basisId:scope.basisId,causationEventRefs:[successor.admission.eventId]});
    const fibre=x.f.append('c_call_fibre_selected',{cCallRef:scope.aggregateId,callClass:'leaf',regime:'F_D',armId:'arm://later',implementationRef},{...scope,causationEventRefs:[basis.eventId]});
    const body={cCallRef:scope.aggregateId,resultClass:'success',contractRef,value,valueDigest:hash(value),evidenceRefs:[]};
    x.f.append('c_call_result_admitted',{...body,resultRef:'result://abiogenesis/'+hash(body).slice(7),resultDigest:hash(body)},{...scope,causationEventRefs:[fibre.eventId]});
  };
  const linked=appendSuccessor();assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(x.f.prefix(),
    x.owner.projectExactInvocationAdmissionAtPrefix(x.f.prefix(),linked.admission.payload.invocationAdmissionRef)),true);
  assert.ok(derive(),'new admitted invocation and preparation do not manufacture completed progress');
  later(linked,p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,p.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,{kind:'controlled_later_command_observation'});
  assert.equal(derive(),null,'a later complete C2 result across the actual covered-use ancestry cannot disappear');
  x.f.rows.splice(0,x.f.rows.length,...clone(originalRows));
  const foreign=appendSuccessor(false);later(foreign,p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,p.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,{kind:'controlled_later_command_observation'});
  assert.ok(derive(),'same A/root/value without the admitted source link is not fabricated ancestry');
  x.f.rows.splice(0,x.f.rows.length,...clone(originalRows));
  const next=appendSuccessor(),progress=clone(x.c.state34),additional={...progress.observations[0],resultRef:'result://later-observation',resultDigest:hash('later-observation'),cCallRef:'c-call://later-observation'};
  progress.observations.push(additional);assert.ok(p.isGovernanceWorkState(progress));
  later(next,p.governanceRef('implementation','fold'),p.governanceContract('state'),progress);
  assert.equal(derive(),null,'a later state with completed additions also invalidates the older source');
  assert.deepEqual(initial.sourceResultValue,x.c.state34);assert.deepEqual(x.source.sourceResultValue,x.c.state34);
  t.diagnostic('Source derivation and actual admitted-coordinate ancestry exercised; semantic replay, environment/cover and later-result producer premises are controlled, with no native/current-app admission credit.');
});

test('built-in ingress preserves the whole captured34 state and independent assessment subject',async()=>{
  const c=captured(),s=c.state34;assert.ok(p.isGovernanceWorkState(s));assert.equal(s.observations.length,34);
  const builtin=(await load('product/builtin_semantics')).ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS,retained=p.retainedGovernanceWorkInput(s),original=JSON.stringify(s);
  const source={sourceResultContractRef:p.governanceContract('state'),sourceWorkspaceId:'workspace://same',workspaceBindingId:'binding://old',workspaceBindingDigest:hash('old'),sourceResultValue:s,basisRef:'source://same',basisDigest:hash('source')};
  const basis={input:retained,sourceResultBasis:source,workspaceId:'workspace://same',workspaceBindingId:'binding://new',workspaceBindingDigest:hash('new')};
  const use={sourceBasisRef:source.basisRef,sourceBasisDigest:source.basisDigest,currentWorkspaceBindingId:basis.workspaceBindingId,currentWorkspaceBindingDigest:basis.workspaceBindingDigest};
  assert.equal(builtin.validateInvocationBasis(basis),false);assert.equal(builtin.validateInvocationBasis({...basis,currentSourceUse:use}),false,'raw current-use record is not the owner handoff');
  assert.equal(builtin.validateInvocationBasis({...basis,currentSourceUse:()=>use}),true,'the callback is a private preparation premise; ABG separately rederives it');
  for(const altered of [{...basis,input:{...retained,observations:retained.observations.slice(1)}},{...basis,input:{...retained,original:{...retained.original,task:'rewritten'}}},
    {...basis,workspaceId:'workspace://foreign'},{...basis,currentSourceUse:()=>({...use,sourceBasisDigest:hash('foreign')})}])
    assert.equal(builtin.validateInvocationBasis({...altered,currentSourceUse:altered.currentSourceUse??(()=>use)}),false);
  assert.equal(JSON.stringify(s),original);assert.deepEqual(retained.original.assessment,s.original.assessment);assert.deepEqual(retained.observations,s.observations);
  assert.deepEqual(retained.original.testing,s.original.testing);assert.equal(retained.original.testing.selectedPaths.length,26);assert.equal(retained.original.testing.commands[0].expectedReports.length,8);
  assert.equal(retained.terminal,false);assert.deepEqual(retained.unresolvedSupportRefs,s.unresolvedSupportRefs);
});
