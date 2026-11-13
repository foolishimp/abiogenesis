import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {capturedEnvelope,load,packageRoot} from './d2-bounded-harness.mjs';

// Explicit mechanical boundary: native basis/install/CCall/C0 lookups below
// are table assumptions, NOT event admissions. Product target/observation,
// revision identities, witness event construction and the complete compiled
// binding/origin algorithm are real. No store, Public call or actor is used.
export async function bindingHarness(){
  const product={...await load('build/code/src/product/index.js'),...await load('build/code/src/product/worksite_effect.js'),
    ...await load('build/code/src/product/semantic_stage.js'),...await load('build/code/src/product/semantic_revision.js')};
  const {SEMANTIC_REVISION_IDS:R}=await load('build/code/src/gtl/semantic_revision_identity.js');
  const {SEMANTIC_STAGE_IDS:D}=await load('build/code/src/gtl/semantic_stage_identity.js');
  const {WORKSITE_C0_IDS:C0}=await load('build/code/src/gtl/worksite_c0.js');
  const eventOwner=await load('build/code/src/abg/event_store.js');
  const {WITNESS_CONTENT_CONTRACTS:contracts}=await load('build/code/src/abg/witness_admission_operation.js');
  const hash=product.sha256Canonical,stage=capturedEnvelope(),events=[],bases=new Map(),sets=new Map(),invocations=new Map(),artifacts=[],transitions=new Map(),calls=new Map();
  const installPremises=new Map();
  const graphFunction={name:'graph-function://mechanical/d2',declarations:{'abg.semantic_revision_history':R.historicalOwnerDependencyRef}};
  const time='2026-09-11T08:00:00.000Z';let serial=0,physicalReads=0;
  const physicalOperations=[];
  const refusePhysical=(operation,path)=>{physicalReads++;physicalOperations.push({operation,path});throw Error('no original '+operation+' in replay');};
  const physicalRealpath=path=>refusePhysical('realpathSync',path);
  physicalRealpath.native=path=>refusePhysical('realpathSync.native',path);
  function event(kind,payload,fields={}){
    const row={kind,payload,eventId:`lookup-event:${++serial}`,admissionOrdinal:events.length+1,eventTime:time,correlationId:'correlation://mechanical',
      causationEventRefs:[],aggregateId:'aggregate://mechanical',...fields};events.push(row);return row;
  }
  function snapshot(){return {assumption:'lookup-only, not an ABG admitted prefix',events:structuredClone(events)};}
  function present(prefix,eventRef){return prefix.events.some(e=>e.eventId===eventRef);}
  // ArtifactTruth's causal-install and retained strict answer are one explicit
  // lookup premise. These markers are not runtime events or an admitted log;
  // the real fold must never be asked to establish facts from this fixture.
  function addBinding(worksite,{lockAnswersStrict=true}={}){
    const binding=worksite.workspaceBinding,{kind:_kind,admissionEventRef,...body}=binding;
    const install=event('lookup_install_premise',{lockId:binding.lockId,lockDigest:binding.lockDigest},
      {eventId:`lookup-install:${admissionEventRef}`,aggregateId:binding.lockId});
    installPremises.set(install.eventId,{lookupDigest:hash(install),lockAnswersStrict});
    const e=event('public_operation_artifact_admitted',{}, {eventId:admissionEventRef,aggregateId:binding.bindingId,causationEventRefs:[install.eventId]});
    const row={operationId:'abg.operation.workspace.bind',authorityScopeRef:binding.bindingId,authorityScopeDigest:binding.bindingDigest,
      admissionEventRef,admissionOrdinal:e.admissionOrdinal,causationEventRefs:[...e.causationEventRefs],
      artifact:{kind:'workspace_binding_candidate',...body},workspaceAuthorityBasis:worksite.workspaceAuthorityBasis};
    artifacts.push(row);return row;
  }
  function lookupInstallLocksAnswerStrictAtPrefix(prefix,refs){
    if(!Array.isArray(prefix?.events)||!Array.isArray(refs)||refs.length===0)return false;
    return refs.every(ref=>{
      const premise=installPremises.get(ref),matches=prefix.events.filter(e=>e.eventId===ref);
      return premise?.lockAnswersStrict===true&&matches.length===1&&hash(matches[0])===premise.lookupDigest;
    });
  }
  function operating(worksite,name){
    const {kind,schemaVersion,bindingId,bindingDigest,admissionEventRef,...oldBody}=worksite.workspaceBinding;
    const body={...oldBody,productSetId:`product-set://mechanical/${name}`,productSetDigest:hash(['set',name]),lockId:`lock://mechanical/${name}`,lockDigest:hash(['lock',name])};
    const digest=hash(body),binding={kind,schemaVersion,...body,bindingId:`workspace-binding://abiogenesis/${digest.slice(7)}`,bindingDigest:digest,admissionEventRef:`lookup-binding:${name}`};
    const {grantRef,grantDigest,kind:gKind,schemaVersion:gVersion,...grantBody}=worksite.capabilityGrant;
    const nextGrant={...grantBody,scopeRef:binding.bindingId,scopeDigest:digest},gDigest=hash(nextGrant);
    const grant={kind:gKind,schemaVersion:gVersion,...nextGrant,grantDigest:gDigest,grantRef:`capability-grant://abiogenesis/${gDigest.slice(7)}`};
    const result=product.projectSemanticWorksiteCoordinates(worksite,{workspaceAuthorityBasis:worksite.workspaceAuthorityBasis,workspaceBinding:binding,capabilityGrant:grant});
    assert.ok(result,'real Product coordinate constructor');addBinding(result);return result;
  }
  function reobserve(worksite,indices,name,{sameBytes=true}={}){
    const rows=worksite.targets.map((row,index)=>{
      if(!indices.includes(index))return row;
      const bytes=sameBytes?Buffer.from(row.base64,'base64'):Buffer.from(`mechanical successor ${name}/${index}\n`);
      const observation=product.constructWorksiteObservation({subject:row.target.subject,state:'file',fileIdentity:`mechanical-device:${name}-${index}`,
        fileDigest:product.sha256Bytes(bytes),byteLength:bytes.length});
      assert.equal(observation.kind,'worksite_observation');return {...row,base64:bytes.toString('base64'),target:{...row.target,predecessorObservation:observation}};
    });
    const task=product.constructWorksiteConstructionTask({...worksite,targets:rows.map(row=>({subject:row.target.subject,territory:row.target.territory,
      predecessorObservation:row.target.predecessorObservation})),prompt:'mechanical identity derivation only'});
    const result={...worksite,targets:rows.map((row,index)=>({...row,target:task.targets[index]}))};
    assert.ok(product.isSemanticWorksiteBasis(result));return result;
  }
  function addCall(name,value,{input=stage,worksite=stage.worksite,invocation='invocation://mechanical/initial',implementation=D.assessorImplementationRef,
    binding='binding://mechanical/assessment',regime='F_P',predicate='predicate://mechanical/assessment',resultClass='success',judgment='advance',
    graphRef=`graph-function://mechanical/${name}`,sourceResultRef=null,deterministic=false,worksiteEvidence=false,parentBasis=null,callRef=null,outputContract=null}={}){
    const cCallRef=callRef??`c-call://mechanical/${name}`,basisRef=`basis://mechanical/${name}`,scope={basisId:basisRef,runId:`run://${invocation}`,graphCallId:`graph-call://${name}`,frameId:`frame://${name}`,graphFunctionRef:graphRef,aggregateId:cCallRef};
    const row={graphFunctionRef:graphRef,programLocusRef:`locus://${name}`,implementationRef:implementation,implementationBindingRef:binding,requirementKey:`requirement://${name}`,
      computeRegime:regime,inputContractRef:`contract://${name}/input`,outputContractRef:outputContract??(implementation===R.selectionImplementationRef?R.selectionContractRef:`contract://${name}/output`),
      failureContractRef:`contract://${name}/failure`,refusalContractRef:`contract://${name}/refusal`};
    const set={implementationSetRef:`set://${name}`,implementationSetDigest:hash(row),rows:[row]};sets.set(set.implementationSetRef,set);
    const basis={basisRef,basisDigest:hash(['basis',name]),admissionEventRef:`lookup-basis:${name}`,rawInputValue:input,rawInputAdmissionRef:`input://${name}`,rawInputDigest:hash(input),
      invocationAdmissionRef:invocation,workspaceBindingId:worksite.workspaceBinding.bindingId,workspaceBindingDigest:worksite.workspaceBinding.bindingDigest,
      graphFunctionRef:graphRef,implementationSetRef:set.implementationSetRef,implementationSetDigest:set.implementationSetDigest,parentExecutionBasisRef:parentBasis,
      judgmentContractRef:`contract://${name}/judgment`,evidenceContractRef:`contract://${name}/evidence`};
    bases.set(basisRef,basis);invocations.set(invocation,{capabilityGrants:[worksite.capabilityGrant],sourceResultBasis:sourceResultRef===null?null:{sourceResultRef}});
    event('basis_admitted',{basisRef},{...scope,eventId:basis.admissionEventRef});
    const opened=event('c_call_opened',{callClass:'leaf',cCallRef,basisId:basisRef,programLocusRef:row.programLocusRef,graphFunctionRef:graphRef},scope);
    const fibre=event('c_call_fibre_selected',{callClass:'leaf',cCallRef,regime,implementationRef:implementation,implementationBindingRef:binding,
      implementationRequirementKey:row.requirementKey,implementationSetRef:set.implementationSetRef},{...scope,causationEventRefs:[opened.eventId]});
    let evidence=null;
    if(deterministic){const body={cCallRef,evidenceClass:'deterministic',contractRef:basis.evidenceContractRef,implementationRef:implementation,inputDigest:hash(input),outputDigest:hash(value)};
      const digest=hash(body);evidence=event('c_call_evidenced',{...body,evidenceDigest:digest,evidenceRef:`evidence://abiogenesis/${digest.slice(7)}`},{...scope,causationEventRefs:[fibre.eventId]});}
    if(worksiteEvidence)evidence=event('c_call_evidenced',{evidenceClass:'worksite_file_replace',evidenceRef:`evidence://${name}`},{...scope,causationEventRefs:[fibre.eventId]});
    const evidenceRefs=evidence===null?[]:[evidence.payload.evidenceRef],resultBody={cCallRef,resultClass,contractRef:resultClass==='success'?row.outputContractRef:row.failureContractRef,value,
      valueDigest:hash(value),evidenceRefs},resultDigest=hash(resultBody),resultRef=`result://abiogenesis/${resultDigest.slice(7)}`;
    const result=event('c_call_result_admitted',{...resultBody,resultRef,resultDigest},{...scope,causationEventRefs:[(evidence??fibre).eventId]});
    const judged=event('c_call_judged',{cCallRef,resultRef,resultDigest,contractRef:basis.judgmentContractRef,predicateRef:predicate,judgment},
      {...scope,causationEventRefs:[result.eventId]});
    const coordinate={cCallRef,resultRef,resultDigest,resultAdmissionEventRef:result.eventId,judgmentEventRef:judged.eventId};
    const call={coordinate,basis,opened,fibre,result,judged,worksite,value,evidence};calls.set(cCallRef,call);return call;
  }
  function cover(before,after,basis,{name=`cover-${serial}`,mutate=()=>{}}={}){
    const old=before.workspaceBinding,current=after.workspaceBinding;
    const content={declarationRef:old.bindingId,beforeDigest:old.bindingDigest,afterDigest:current.bindingDigest,
      changeClass:'realization_refactor',owningTicketRef:'ticket://T-287',reason:'mechanical binding transition'};
    const actor={ref:current.authorizedActorRef,digest:hash(current.authorizedActorRef)},subject={kind:'authority_basis',ref:basis.basisRef,digest:basis.basisDigest};
    const packet={act:'reprice',actor,subject,content:{kind:'typed_payload',contractRef:contracts.reprice.ref,contractDigest:contracts.reprice.digest,
      valueRef:`value://${name}`,valueDigest:hash(content),value:content},context:{kind:'basis',basis:{ref:basis.basisRef,digest:basis.basisDigest}},
      evidence:[{ref:old.bindingId,digest:old.bindingDigest},{ref:current.bindingId,digest:current.bindingDigest}],provenance:[{ref:basis.basisRef,digest:basis.basisDigest}]};
    const operationBody={operationId:'abg.operation.witness.admit',memberKey:'reprice',definitionDigest:hash('mechanical definition'),invocationRef:`public://${name}`,invocationPayloadDigest:hash(packet)};
    const operation=event('public_operation_admitted',{...operationBody,invocationDigest:hash(operationBody),authorityScopeRef:current.bindingId,authorityScopeDigest:current.bindingDigest,
      workspaceBindingRef:current.bindingId,workspaceBindingDigest:current.bindingDigest,productSetRef:current.productSetId,productSetDigest:current.productSetDigest,
      dependencyLockRef:current.lockId,dependencyLockDigest:current.lockDigest,actorRef:actor.ref,actorDigest:actor.digest},
      {aggregateId:current.bindingId,basisId:current.bindingId,parentAggregateId:operationBody.invocationRef});
    const witnessedActDigest=hash(packet),{reason,...repriceBody}=content;
    const payload={act:'reprice',actorRef:actor.ref,actorDigest:actor.digest,subjectKind:subject.kind,subjectRef:subject.ref,subjectDigest:subject.digest,
      contentKind:packet.content.kind,contentContractRef:packet.content.contractRef,contentContractDigest:packet.content.contractDigest,
      contentValueRef:packet.content.valueRef,contentValueDigest:packet.content.valueDigest,contentValue:content,context:packet.context,evidence:packet.evidence,provenance:packet.provenance,
      witnessedActDigest,witnessedActRef:`witnessed-act://abiogenesis/${witnessedActDigest.slice(7)}`,...content,
      repriceRef:`declaration-reprice:${hash(repriceBody)}`,operatorActorRef:actor.ref};
    const candidate={kind:'declaration_reprice_admitted',eventTime:time,aggregateType:'workspace',aggregateId:current.bindingId,parentAggregateId:operationBody.invocationRef,
      causationEventRefs:[operation.eventId],correlationId:operation.correlationId,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:basis.basisRef,payload};
    const row=structuredClone(eventOwner.projectRuntimeEventFromValidatedHistory(events,candidate));events.push(row);mutate(row,operation);return row;
  }
  function replace(worksite,index,name,{invocation='invocation://mechanical/initial',failed=false,sameBytes=true}={}){
    const next=reobserve(worksite,[index],name,{sameBytes}),old=worksite.targets[index],row=next.targets[index];
    const request=product.constructWorksiteFileReplaceRequest({...worksite,subject:old.target.subject,territory:old.target.territory,
      predecessorObservation:old.target.predecessorObservation,replacementBytes:Buffer.from(row.base64,'base64')});
    assert.equal(request.kind,'worksite_file_replace_request');
    const call=addCall(name,{assumption:'C0 outcome lookup',observation:row.target.predecessorObservation},{input:request,worksite,invocation,implementation:'implementation://abiogenesis/worksite/file-replace-fd@5',
      graphRef:C0.graphFunctionRef,regime:'F_D',resultClass:failed?'failure':'success',judgment:failed?'block':'advance',worksiteEvidence:true});
    // Table-stub transition/evidence relation, deliberately not a persisted or
    // event-contract-qualified receipt. The retained diagnostic covers native C0.
    transitions.set(call.result.eventId,{before:old.target.predecessorObservation.observationRef,successorObservation:failed?null:row.target.predecessorObservation});
    return {next,call};
  }
  function revision(parent,cause,current,name,{invocation=`invocation://mechanical/${name}`,mode='construction_repair'}={}){
    const prior=parent.value.kind==='semantic_revision_envelope'?parent.value.current:parent.value;
    // Separate selector-policy/grant table assumption, not imported authority.
    // The shared Product mapper, not grant equality, joins the same observed files.
    const {kind,schemaVersion,grantRef,grantDigest,...oldGrant}=current.capabilityGrant;
    const grantBody={...oldGrant,policyRef:`policy://mechanical/${name}-selection`,policyDigest:hash(['selection-policy',name])};
    const selectorDigest=hash(grantBody),selectorGrant={kind,schemaVersion,...grantBody,grantDigest:selectorDigest,
      grantRef:`capability-grant://abiogenesis/${selectorDigest.slice(7)}`};
    const selectorWorksite=product.projectSemanticWorksiteCoordinates(current,{...current,capabilityGrant:selectorGrant});
    assert.ok(selectorWorksite,'real coordinate mapping over explicit selector-grant assumption');
    const selectionInput={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:parent.coordinate,causes:[cause.coordinate],currentWorksite:selectorWorksite};
    assert.ok(product.isSemanticRevisionSelectionInput(selectionInput));
    const selected=['implementation','verifier'].map(role=>prior.worksite.targets.find(row=>row.role===role));assert.ok(selected.every(Boolean));
    const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:parent.coordinate,causes:[cause.coordinate],mode,selectedStageRef:mode==='construction_repair'?null:stage.assets.at(-1).stageRef,
      selectedObligationRefs:[stage.sourceHandoff.declaration.fulfillmentBindings[0].obligationRef],selectedTargetRefs:selected.map(row=>row.target.targetRef),reasonRef:`reason://${name}`};
    assert.ok(product.isSemanticRevisionSelection(selection));
    assert.equal(Object.hasOwn(selection,'currentWorksite'),false,'selection output remains a distinct strict carrier');
    const decision=addCall(`${name}-selection`,selection,{input:selectionInput,worksite:selectorWorksite,invocation:`${invocation}/selection`,implementation:R.selectionImplementationRef});
    const request={kind:'semantic_revision_request',schemaVersion:'5.0.0',parent:parent.coordinate,causes:[cause.coordinate],selection:decision.coordinate,currentWorksite:current};
    assert.notDeepEqual(selectorWorksite.capabilityGrant,current.capabilityGrant);
    assert.equal(product.semanticRevisionSelectionInputMatchesRequest(selectionInput,request),true,'same current subject across distinct granted Programs');
    const value=product.deriveSemanticRevision(parent.value,request,selection);assert.ok(value,'actual Product revision, not runtime admission');
    const call=addCall(name,value,{input:request,worksite:current,invocation,implementation:R.projectionImplementationRef,binding:R.projectionBindingRef,regime:'F_D',
      predicate:R.projectionPredicateRef,deterministic:true,sourceResultRef:parent.coordinate.resultRef});
    return {...call,request,selection,decision};
  }
  const modulePath=resolve(packageRoot,'build/code/src/abg/worksite_revision.js');
  // The owners read a prefix through the runtime-history readers (the body
  // view, the selector index, checked records and the extent). Over the
  // lookup-only rows the substitutes are the real body view and the real
  // selector-key vocabulary (`runtimeHistorySelectorKeys`); a checked record is
  // acquired on every read; nothing is admitted or validated. The historical
  // cut (`validatedRuntimeEventPrefixBeforeEvent`) keeps the lookup rows before
  // its exact boundary row and refuses an absent boundary.
  const {RuntimeEventBodyView,runtimeHistorySelectorKeys}=await load('build/code/src/abg/runtime_history.js');
  const {nativeWorkspacePathWithin}=await load('build/code/src/product/native_workspace_work.js');
  const overrides={
    './event_prefix.js':{validatedRuntimeEventPrefixBeforeEvent:(p,eventId)=>{
        const boundary=p.events.find(e=>e.eventId===eventId);
        if(boundary===undefined)throw new TypeError('historical event-prefix boundary requires one exact admitted event');
        return {assumption:'lookup-only',events:p.events.filter(e=>e.admissionOrdinal<boundary.admissionOrdinal)};},
      runtimeEventBodiesAtPrefix:p=>new RuntimeEventBodyView(p.events),
      indexedRuntimeEvents:(p,key)=>p.events.filter(e=>runtimeHistorySelectorKeys(e).includes(key)),
      checkedRecordAtPrefix:(_p,_reader,_context,acquire)=>acquire(),
      runtimeEventPrefixExtent:p=>({count:p.events.length,lastOrdinal:p.events.at(-1)?.admissionOrdinal??0})},
    './invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:(p,ref)=>{const b=bases.get(ref);return b&&present(p,b.admissionEventRef)?b:null;},
      projectExactInvocationAdmissionAtPrefix:(_p,ref)=>invocations.get(ref)??null},
    './execution_basis.js':{rehydrateAdmittedImplementationSetAtPrefix:(_p,ref)=>sets.get(ref)??null},
    './artifact_truth.js':{projectArtifactTruth:p=>({artifacts:artifacts.filter(row=>present(p,row.admissionEventRef))}),
      admittedInstallLocksAnswerStrictAtPrefix:lookupInstallLocksAnswerStrictAtPrefix},
    './c_call.js':{projectAdmittedCCallStateAtPrefix:(_p,cCall,result,judgment)=>({cCall,result,judgment})},
    './event_calculus.js':{deriveRuntimeHeldFluentProjection:p=>p,constructWorksiteObservationCurrentFluent:ref=>ref,
      holdsAt:(p,ref)=>!p.events.some(e=>transitions.get(e.eventId)?.before===ref),projectWorksiteTransitionForResult:e=>transitions.get(e.eventId)??null},
    // Cross-binding invalidation is the shared native worksite-observation
    // dependency reader (400d763d1): a later write under the same admitted
    // root touching the subject's path invalidates its older alias. Over the
    // lookup rows the writes are the C0 outcome lookups of the `transitions`
    // table, the same table premise the transition stub above uses.
    './native_worksite_execution.js':{worksiteCommandSourcesInvalidatedAfter:(p,afterOrdinal,canonicalRoot,selectedPaths,readRoots)=>p.events.some(e=>{
      if(e.admissionOrdinal<=afterOrdinal||!transitions.has(e.eventId))return false;
      const request=bases.get(e.basisId)?.rawInputValue,path=request?.subject?.relativePath;
      if(request?.workspaceAuthorityBasis?.canonicalRoot!==canonicalRoot||typeof path!=='string')return false;
      return readRoots===undefined?selectedPaths.includes(path):nativeWorkspacePathWithin(path,readRoots);})},
    'node:fs':{readFileSync:path=>refusePhysical('readFileSync',path),lstatSync:path=>refusePhysical('lstatSync',path),realpathSync:physicalRealpath},
  };
  // Keep the actual shared owner inside this fixture's filesystem boundary.
  // Importing it natively would let realpathSync.native bypass the spy.
  const spellingPath=resolve(packageRoot,'build/code/src/shared/stored_spelling.js');
  const spelling=new SourceTextModule(readFileSync(spellingPath,'utf8'),{identifier:spellingPath});
  await spelling.link(async specifier=>{
    assert.equal(specifier,'node:fs');
    return new SyntheticModule(['realpathSync'],function(){this.setExport('realpathSync',physicalRealpath);});
  });
  await spelling.evaluate();overrides['../shared/stored_spelling.js']={...spelling.namespace};
  // The foldback provenance owner itself is real; only the same declared
  // basis/install/prefix lookup premises above are substituted for this fixture.
  const provenancePath=resolve(packageRoot,'build/code/src/abg/worksite_input_provenance.js');
  const provenance=new SourceTextModule(readFileSync(provenancePath,'utf8'),{identifier:provenancePath});
  await provenance.link(async specifier=>{
    const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(provenancePath),specifier)).href);
    const values={...native,...overrides[specifier]};
    return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
  });
  await provenance.evaluate();
  overrides['./worksite_input_provenance.js']={...provenance.namespace};
  const module=new SourceTextModule(readFileSync(modulePath,'utf8'),{identifier:modulePath}),links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(modulePath),specifier)).href),values={...native,...overrides[specifier]};
    const linked=new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});links.set(specifier,linked);return linked;
  });
  await module.evaluate();addBinding(stage.worksite);
  const authored={...stage,assets:[...stage.assets.slice(0,-1),{...stage.assets.at(-1),assessment:null}]};
  const author=addCall('original-design-author',authored,{callRef:stage.assets.at(-1).source.cCallRef,implementation:D.authorImplementationRef});
  const parent=addCall('initial-assessed',stage),cause=addCall('initial-command',{assumption:'actual command exit1 lookup'},{input:stage,worksite:stage.worksite});
  let semanticModule=null,semanticOwner=null,semanticBasis=null;
  async function semantic(value,method='projectRevisionWorksitePreparation'){
    const projection=[...calls.values()].find(call=>call.value.kind==='semantic_revision_envelope'&&
      call.value.revisionBasis.basisRef===value.revisionBasis.basisRef&&call.fibre.payload.implementationRef===R.projectionImplementationRef);
    assert.ok(projection);
    semanticOwner={prefix:snapshot(),events:structuredClone(events),execution:projection.basis,lifecycle:stage.lifecycle,source:stage.sourceHandoff.declaration,
      call:{implementationRef:R.bridgeImplementationRef},inputDigest:hash(value)};
    semanticBasis={input:value,publication:{},graphFunction,declarationGraphFunctions:[],predecessorPrefix:{assumption:'lookup-only'}};
    if(semanticModule===null){
      const path=resolve(packageRoot,'build/code/src/abg/semantic_revision.js');
      semanticModule=new SourceTextModule(readFileSync(path,'utf8'),{identifier:path});
      const semanticOverrides={
        // The revision owner authenticates through the owned stage
        // authenticator (`authenticateOwnedSemanticStageBasis`, 67c333799).
        './semantic_stage.js':{authenticateOwnedSemanticStageBasis:()=>semanticOwner,semanticInputValueAtBasis:b=>b.input,
          semanticInputAtBasisEquals:(b,value)=>hash(b.input)===hash(value),
          projectSemanticPredecessorAtPrefix:(p,_events,_publication,ref)=>{const c=calls.get(ref);return c===undefined?null:module.namespace.projectWorksiteRevisionNativeResult(p,c.coordinate);}},
        './execution_basis.js':{rehydrateExecutionBasisAtPrefix:(_p,ref)=>bases.get(ref)??null},
        './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:(_p,ref)=>invocations.get(ref)??null},
        './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>({kind:'exact_prefix_workspace_environment',
          workspaceBinding:semanticBasis.input.current.worksite.workspaceBinding,workspaceAuthorityBasis:semanticBasis.input.current.worksite.workspaceAuthorityBasis})},
        // Existing mechanical dispatch-currentness assumption only; the
        // installed fixture below this test boundary observes real files.
        './worksite_revision.js':{...module.namespace,worksiteRevisionPhysicalMatches:()=>true},
        // The revision owner reads the same lookup rows through the same
        // history readers and the same invalidation reader as above.
        './event_prefix.js':overrides['./event_prefix.js'],
        './native_worksite_execution.js':overrides['./native_worksite_execution.js'],
        '../shared/stored_spelling.js':overrides['../shared/stored_spelling.js'],
      };
      const linked=new Map();await semanticModule.link(async specifier=>{
        if(linked.has(specifier))return linked.get(specifier);
        const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(path),specifier)).href),values={...native,...semanticOverrides[specifier]};
        const child=new SyntheticModule(Object.keys(values),function(){for(const [key,v]of Object.entries(values))this.setExport(key,v);});linked.set(specifier,child);return child;
      });await semanticModule.evaluate();
    }
    return semanticModule.namespace[method](semanticBasis,value);
  }
  return {product,R,D,C0,hash,stage,events,bases,sets,invocations,artifacts,transitions,calls,graphFunction,owner:module.namespace,parent,cause,author,
    event,snapshot,addBinding,operating,reobserve,addCall,cover,replace,revision,semantic,
    get physicalReads(){return physicalReads;},get physicalOperations(){return structuredClone(physicalOperations);}};
}
