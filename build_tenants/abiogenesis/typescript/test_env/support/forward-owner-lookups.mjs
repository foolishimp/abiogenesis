import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {product,retainedSource,packageRoot,hash} from './forward-command-harness.mjs';
import * as eventOwner from '../../build/code/src/abg/event_store.js';
import {WITNESS_CONTENT_CONTRACTS as contracts} from '../../build/code/src/abg/witness_admission_operation.js';

// Execute the exact compiled owner algorithms. New bindings, CCalls, C0
// transitions, invocation and Public-operation lookups are explicit synthetic
// assumptions, not admitted events. The original task/receipts/observations
// come from the actual closed prefix. Witness construction uses the unchanged
// native event constructor; no store is opened or appended.
export async function ownerLookups(){
  const actual=retainedSource(),old=actual.originalTask,events=[],artifacts=[],bases=new Map(),transitions=new Map(),invocations=new Map();
  const time='2026-09-11T11:00:00.000Z';let serial=0,transitionReads=0;
  function event(kind,payload,fields={}){const e={kind,payload,eventId:'lookup-event:'+ ++serial,admissionOrdinal:events.length+1,
    eventTime:time,correlationId:'correlation://forward-mechanical',causationEventRefs:[],aggregateId:'lookup-aggregate',...fields};events.push(e);return e;}
  const snapshot=()=>({assumption:'unadmitted forward lookup prefix',events:structuredClone(events)});
  const present=(p,id)=>p.events.some(e=>e.eventId===id);
  function bindingRow(binding){const {kind,admissionEventRef,...body}=binding;
    const e=event('public_operation_artifact_admitted',{}, {eventId:admissionEventRef,aggregateId:binding.bindingId});
    const row={operationId:'abg.operation.workspace.bind',authorityScopeRef:binding.bindingId,authorityScopeDigest:binding.bindingDigest,
      admissionEventRef,admissionOrdinal:e.admissionOrdinal,artifact:{kind:'workspace_binding_candidate',...body},workspaceAuthorityBasis:old.workspaceAuthorityBasis};
    artifacts.push(row);return row;}
  bindingRow(old.workspaceBinding);
  const {kind,schemaVersion,bindingId,bindingDigest,admissionEventRef,...wb}=old.workspaceBinding;
  const nextBody={...wb,productSetId:'product-set://forward-mechanical/current',productSetDigest:hash('new set'),
    lockId:'lock://forward-mechanical/current',lockDigest:hash('new lock')},wd=hash(nextBody);
  const workspaceBinding={kind,schemaVersion,...nextBody,bindingId:'workspace-binding://abiogenesis/'+wd.slice(7),bindingDigest:wd,admissionEventRef:'lookup-binding:current'};
  bindingRow(workspaceBinding);
  const {kind:gk,schemaVersion:gs,grantRef,grantDigest,...gb}=old.capabilityGrant;
  const nextGrant={...gb,scopeRef:workspaceBinding.bindingId,scopeDigest:workspaceBinding.bindingDigest},gd=hash(nextGrant);
  const capabilityGrant={kind:gk,schemaVersion:gs,...nextGrant,grantRef:'capability-grant://abiogenesis/'+gd.slice(7),grantDigest:gd};
  const protectedObservations=old.protectedObservations.map(row=>{
    const subject=product.constructWorksiteSubject({workspaceAuthorityBasis:old.workspaceAuthorityBasis,workspaceBinding,
      relativePath:row.subject.relativePath,subjectUri:row.subject.subjectUri});
    const observation=product.constructWorksiteObservation({subject,state:'file',fileIdentity:row.observation.fileIdentity,
      fileDigest:row.observation.fileDigest,byteLength:row.observation.byteLength});return {subject,observation};});
  const request=product.constructWorksiteCommandForwardRequest({...actual.request,workspaceBinding,capabilityGrant,protectedObservations});
  const base={...actual.basis,basisRef:'basis://forward-mechanical/source',basisDigest:hash('source-basis'),admissionEventRef:'lookup-basis:source'};
  bases.set(base.basisRef,base);event('basis_admitted',{basisRef:base.basisRef},{basisId:base.basisRef,eventId:base.admissionEventRef});
  const c0=[];
  function addC0(index,name,{foreign=false,failed=false,afterBinding=false}={}){
    const row=old.protectedObservations[index],member=old.sourceConstructionResult.members[index],ref='c-call://forward-mechanical/'+name,
      b={...base,basisRef:'basis://forward-mechanical/'+name,basisDigest:hash(name),admissionEventRef:'lookup-basis:'+name,
        graphFunctionRef:'graph-function://abiogenesis/worksite/file-replace@5',rawInputValue:{subject:afterBinding?protectedObservations[index].subject:row.subject},
        invocationAdmissionRef:foreign?'invocation://foreign':base.invocationAdmissionRef};
    bases.set(b.basisRef,b);event('basis_admitted',{basisRef:b.basisRef},{basisId:b.basisRef,eventId:b.admissionEventRef});
    event('c_call_fibre_selected',{implementationRef:'implementation://abiogenesis/worksite/file-replace-fd@5'},{aggregateId:ref,basisId:b.basisRef});
    const evidence=event('c_call_evidenced',{evidenceClass:'worksite_file_replace',evidenceRef:'evidence://'+name},{aggregateId:ref,basisId:b.basisRef});
    const result=event('c_call_result_admitted',{resultClass:failed?'failure':'success',value:{receipt:member.receipt},evidenceRefs:[evidence.payload.evidenceRef]},
      {aggregateId:ref,basisId:b.basisRef,causationEventRefs:[evidence.eventId]});
    transitions.set(result.eventId,{before:afterBinding?protectedObservations[index].observation.observationRef:'old-preimage:'+index,
      successorObservation:failed?null:row.observation});return {basis:b,evidence,result};
  }
  for(let i=0;i<22;i++)c0.push(addC0(i,'original-'+i));
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
  const modulePath=path.join(packageRoot,'build/code/src/abg/worksite_revision.js');
  const overrides={
    './event_prefix.js':{runtimeEventsFromValidatedPrefix:p=>p.events,selectValidatedRuntimeEventPrefix:rows=>({events:rows})},
    './artifact_truth.js':{projectArtifactTruth:p=>({artifacts:artifacts.filter(a=>present(p,a.admissionEventRef))})},
    './invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:(p,ref)=>{const b=bases.get(ref);return b&&present(p,b.admissionEventRef)?b:null;},
      projectExactInvocationAdmissionAtPrefix:(_p,ref)=>invocations.get(ref)??null},
    './event_calculus.js':{deriveRuntimeEventCalculusProjection:p=>p,constructWorksiteObservationCurrentFluent:ref=>ref,
      holdsAt:(p,ref)=>!p.events.some(e=>transitions.get(e.eventId)?.before===ref),
      projectWorksiteTransitionForResult:e=>{transitionReads++;return transitions.get(e.eventId)??null;}},
  };
  async function moduleAt(file){
    const module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file}),links=new Map();
    await module.link(async spec=>{if(links.has(spec))return links.get(spec);
      const native=await import(spec.startsWith('node:')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href),values={...native,...overrides[spec]};
      const linked=new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});links.set(spec,linked);return linked;});
    await module.evaluate();return module.namespace;
  }
  const owner=await moduleAt(modulePath),forward=await moduleAt(path.join(packageRoot,'build/code/src/abg/worksite_command_forward.js'));
  const current={workspaceBinding},before={workspaceBinding:old.workspaceBinding};
  return {actual,old,request,events,artifacts,bases,transitions,invocations,base,c0,event,snapshot,addC0,owner,forward,
    cover:(options)=>cover(before,current,base,options),
    project:()=>owner.projectClosedConstructionRetainedVector(snapshot(),old,request,[base]),get transitionReads(){return transitionReads;}};
}
