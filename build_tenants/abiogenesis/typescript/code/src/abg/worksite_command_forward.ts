/** One native forward relation. Historical coordinates never become current-Run causation. */
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { isWorksiteCommandForwardGraphFunction } from "../gtl/worksite_command_forward.js";
import { materializeGraph } from "../gtl/materialize.js";
import { WORKSITE_COMMAND_FORWARD_IDS as F } from "../product/worksite_command_forward_identity.js";
import { isWorksiteCommandForwardRequest, isWorksiteCommandForwardTask,
  constructWorksiteCommandForwardTask, type WorksiteCommandForwardRequest, type WorksiteCommandForwardTask } from "../product/worksite_command_forward.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as C2, isWorksiteCommandExecutionTask, isWorksiteCommandForwardObservation } from "../product/worksite_command_execution.js";
import { isWorksiteConstructionResult } from "../product/worksite_construction.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { reconstructHistoricalDeclarationCatalog, resolveExecutionDeclarationClosure } from "../product/declaration_closure.js";
import type { WorkspaceBinding } from "../product/environment.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { authenticateRuntimePrefixAncestry, readRuntimeEventsAtDurablePrefix, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { hasExactInvocationRunBindingAtPrefix, projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { projectExactPrefixWorkspaceEnvironment, projectAdmittedProductInstallByAdmissionEventRef } from "./environment_admission.js";
import { projectOpenedCCallCarrierAtPrefix, projectAdmittedCCallStateAtPrefix, projectCCallCarrierPhaseAtPrefix, type CCall } from "./c_call.js";
import { projectClosedGraphCallTerminalAtDurablePrefix } from "./project_read_ports.js";
import { projectSameRunWorksiteCommandSourceAtPrefix } from "./worksite_input_provenance.js";
import { projectClosedConstructionRetainedVector, retainedWorksitePhysicalMatches } from "./worksite_revision.js";
import { rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { hasAdmittedTraversalCursorAtPrefix, type TraversalCursorCandidate } from "./traversal_cursor.js";
import { replayValidatedRuntimeEventPrefix } from "./replay.js";
import { constructRunActiveFluent, runtimeFluentKey } from "./event_calculus.js";

const same=(a:unknown,b:unknown)=>canonicalJson(a as JsonValue)===canonicalJson(b as JsonValue);
const hash=(a:unknown)=>sha256Canonical(a as JsonValue);
const record=(v:unknown):v is Record<string,JsonValue>=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const one=<T>(rows:readonly T[],test:(row:T)=>boolean):T|null=>{const selected=rows.filter(test);return selected.length===1?selected[0]!:null;};
/** Actor ownership is native parent/child lineage, not a guessed payload on
 * each process/stream event. A dispatch intent alone consumes this eligibility. */
export function hasWorksiteCommandForwardDispatchAtPrefix(prefix:ValidatedRuntimeEventPrefix,cCallRef:string):boolean {
  const events=runtimeEventsFromValidatedPrefix(prefix);
  const actors=events.filter(e=>e.kind==="actor_invocation_started"&&
    (e.parentAggregateId===cCallRef||(record(e.payload)&&e.payload.cCallRef===cCallRef)));
  return actors.length!==0||events.some(e=>
    (e.kind==="actor_transport_binding_admitted"&&(e.parentAggregateId===cCallRef||
      (record(e.payload)&&e.payload.cCallRef===cCallRef)))||
    (e.kind==="c_call_evidenced"&&e.aggregateId===cCallRef&&record(e.payload)&&e.payload.evidenceClass==="probabilistic_transport")||
    (e.kind.startsWith("actor_")&&actors.some(a=>e.aggregateId===a.aggregateId||e.parentAggregateId===a.aggregateId)));
}
function graphFor(basis:ExecutionBasis,gf:GraphFunction) {
  if(gf.name!==basis.graphFunctionRef||hash(gf)!==basis.graphFunctionDigest)return null;
  const graph=materializeGraph(gf,{invocationAdmissionRef:basis.invocationAdmissionRef,admittedInputRef:basis.rawInputAdmissionRef,
    admittedInputDigest:basis.rawInputDigest,admittedInput:basis.rawInputValue});
  return graph.materializationRef===basis.graphRef&&graph.materializationDigest===basis.graphDigest?graph:null;
}
function nativeLeaf(prefix:ValidatedRuntimeEventPrefix,ref:string,gf:GraphFunction) {
  const events=runtimeEventsFromValidatedPrefix(prefix),open=one(events,e=>e.kind==="c_call_opened"&&e.aggregateId===ref);
  const basis=open?.basisId===undefined?null:projectExactExecutionBasisAtPrefix(prefix,open.basisId);
  const graph=basis===null?null:graphFor(basis,gf),call=graph===null?null:projectOpenedCCallCarrierAtPrefix(prefix,graph,ref);
  const result=one(events,e=>e.kind==="c_call_result_admitted"&&e.aggregateId===ref),judged=one(events,e=>e.kind==="c_call_judged"&&e.aggregateId===ref);
  if(basis===null||call===null||call.callClass!=="leaf"||result===null||judged===null||!record(result.payload)||!record(judged.payload))return null;
  const state=projectAdmittedCCallStateAtPrefix(prefix,call as unknown as Record<string,JsonValue>,
    {kind:"admitted_c_call_result",schemaVersion:"5.0.0",disposition:"admitted",...result.payload,admissionEventRef:result.eventId},
    {kind:"admitted_c_call_judgment",schemaVersion:"5.0.0",disposition:"admitted",...judged.payload,admissionEventRef:judged.eventId});
  return state===null?null:{...state,basis,resultEvent:result,judgmentEvent:judged};
}
/** Pure authentic historical proof. No filesystem worksite observation occurs here. */
export function projectWorksiteCommandForwardSource(request:WorksiteCommandForwardRequest) {
  try{
    if(!isWorksiteCommandForwardRequest(request))return null;
    const s=request.source,events=readRuntimeEventsAtDurablePrefix(s.prefix),prefix=selectValidatedRuntimeEventPrefix(events);
    const invocation=projectExactInvocationAdmissionAtPrefix(prefix,s.invocationAdmissionRef);
    const opened=one(events,e=>e.kind==="c_call_opened"&&e.aggregateId===s.failedCCallRef&&e.runId===s.runId);
    const sourceBasis=opened?.basisId===undefined?null:projectExactExecutionBasisAtPrefix(prefix,opened.basisId);
    if(invocation===null||invocation.invocationRef!==s.invocationRef||sourceBasis===null||
      sourceBasis.invocationAdmissionRef!==s.invocationAdmissionRef||sourceBasis.invocationRef!==s.invocationRef||
      sourceBasis.graphFunctionRef!==C2.graphFunctionRef||sourceBasis.parentExecutionBasisRef===null||sourceBasis.parentCCallRef===null||
      !isWorksiteCommandExecutionTask(sourceBasis.rawInputValue))return null;
    const originalTask=sourceBasis.rawInputValue;
    const environment=projectExactPrefixWorkspaceEnvironment(s.prefix,{ref:sourceBasis.workspaceBindingId,digest:sourceBasis.workspaceBindingDigest});
    if(environment.kind!=="exact_prefix_workspace_environment")return null;
    const installs=environment.productInstalls.map(i=>projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth,i.admissionEventRef));
    if(installs.some(i=>i===null))return null;
    const rebuilt=reconstructHistoricalDeclarationCatalog(s.declarationProof,{workspaceBinding:environment.workspaceBindingCandidate,
      resolvedLock:environment.resolvedProductLock,installedProducts:installs.map(i=>i!.candidate)});
    const closure=resolveExecutionDeclarationClosure(rebuilt.catalog,rebuilt.catalogView,invocation.programRef,invocation.graphFunctionRef);
    if(closure.kind!=="resolved_execution_declaration_closure")return null;
    const definition=(ref:string):GraphFunction|null=>{
      const owner=one(closure.graphFunctionOwners,o=>o.declarationRef===ref);
      const publication=owner===null?null:one(closure.publications,p=>p.moduleRef===owner.moduleRef&&p.owningProductId===owner.productId&&
        modulePublicationSemanticDigest(p)===owner.publicationDigest);
      return publication===null?null:one(publication.graphFunctions,g=>g.name===ref);
    };
    const gf=definition(sourceBasis.graphFunctionRef),failed=gf===null?null:nativeLeaf(prefix,s.failedCCallRef,gf);
    const failure=one(events,e=>e.eventId===s.failureEventRef),runFailure=one(events,e=>e.eventId===s.runFailureEventRef);
    if(failed===null||failed.cCall.regime!=="F_P"||failed.cCall.implementationRef!==C2.implementationRef||
      failed.cCall.implementationBindingRef!==C2.implementationBindingRef||failed.result.resultClass==="success"||failed.judgment.judgment==="advance"||
      failure===null||failure.kind!=="c_call_evidenced"||failure.aggregateId!==s.failedCCallRef||failure.runId!==s.runId||
      !record(failure.payload)||failure.payload.evidenceClass!=="admission_rejection"||
      !failed.result.evidenceRefs.includes(String(failure.payload.evidenceRef))||!failed.resultEvent.causationEventRefs.includes(failure.eventId)||
      runFailure===null||runFailure.kind!=="runtime_failure_observed"||runFailure.runId!==s.runId||
      runFailure.admissionOrdinal<=failed.judgmentEvent.admissionOrdinal||
      replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(events,{runId:s.runId}),prefix).runtimeStatus!=="failed"||
      hasWorksiteCommandForwardDispatchAtPrefix(prefix,s.failedCCallRef))return null;
    const parent=projectExactExecutionBasisAtPrefix(prefix,sourceBasis.parentExecutionBasisRef);
    const retained=parent===null?null:projectSameRunWorksiteCommandSourceAtPrefix(prefix,{
      parentBasis:parent,parentCCallRef:sourceBasis.parentCCallRef,runId:s.runId,task:originalTask});
    if(retained===null||retained.preparationResult?.eventId!==s.preparationResultEventRef||
      retained.preparationJudgment?.eventId!==s.preparationJudgmentEventRef)return null;
    const construction=projectClosedGraphCallTerminalAtDurablePrefix(s.prefix,s.constructionGraphCallRef,s.declarationProof);
    if(construction===null||construction.producer.runRef!==s.runId||construction.producer.invocationAdmissionRef!==s.invocationAdmissionRef||
      construction.producer.executionBasis.ref!==retained.sourceBasis.basisRef||!isWorksiteConstructionResult(construction.value)||
      !same(construction.value,originalTask.sourceConstructionResult))return null;
    const preparationGF=definition(parent!.graphFunctionRef),preparation=preparationGF===null?null:nativeLeaf(prefix,retained.preparationResult.aggregateId,preparationGF);
    if(preparation===null||preparation.result.resultClass!=="success"||preparation.judgment.judgment!=="advance"||
      preparation.resultEvent.eventId!==s.preparationResultEventRef||!same(preparation.result.value,originalTask))return null;
    // Count actual declared preparation producers only, not their workflow aliases.
    const producers=events.filter(e=>e.kind==="c_call_opened"&&e.basisId===parent!.basisRef).flatMap(e=>{
      const candidate=preparationGF===null?null:nativeLeaf(prefix,e.aggregateId,preparationGF);
      return candidate!==null&&candidate.cCall.implementationRef===preparation.cCall.implementationRef&&
        candidate.cCall.programLocusRef===preparation.cCall.programLocusRef&&candidate.result.resultClass==="success"&&
        candidate.judgment.judgment==="advance"?[candidate]:[];
    });
    if(producers.length!==1||producers[0]!.cCall.cCallRef!==preparation.cCall.cCallRef)return null;
    return {prefix,events,originalTask,construction,preparation,failed,bases:[sourceBasis,parent!,retained.sourceBasis],
      installedRoots:environment.productInstalls.map(i=>i.installedRoot)};
  }catch{return null;}
}

/** A failed successor does not reserve the original obligation forever. This
 * proof only removes consumption; it never selects or admits another attempt. */
function isFailedUndispatchedForwardSuccessor(prefix:ValidatedRuntimeEventPrefix,
  invocation:NonNullable<ReturnType<typeof projectExactInvocationAdmissionAtPrefix>>,basis:ExecutionBasis):boolean {
  try{
    const events=runtimeEventsFromValidatedPrefix(prefix);
    if(basis.basisClass!=="root"||basis.invocationAdmissionRef!==invocation.invocationAdmissionRef||
      basis.invocationRef!==invocation.invocationRef||basis.graphFunctionRef!==F.graphFunctionRef)return false;
    const runOpen=one(events,e=>e.kind==="run_segment_opened"&&(e.basisId===basis.basisRef||
      (record(e.payload)&&e.payload.invocationAdmissionRef===invocation.invocationAdmissionRef)));
    if(runOpen?.runId===undefined||runOpen.basisId!==basis.basisRef||!record(runOpen.payload)||
      runOpen.payload.executionBasisRef!==basis.basisRef||runOpen.payload.executionBasisDigest!==basis.basisDigest||
      !hasExactInvocationRunBindingAtPrefix(prefix,invocation,runOpen.runId))return false;
    const runPrefix=selectValidatedRuntimeEventPrefix(events,{runId:runOpen.runId});
    const runEvents=runtimeEventsFromValidatedPrefix(runPrefix),replayed=replayValidatedRuntimeEventPrefix(runPrefix,prefix);
    const terminal=one(runEvents,e=>e.runId===runOpen.runId&&
      (e.kind==="runtime_failure_observed"||e.kind==="run_stopped"||e.kind==="run_closed"));
    if(replayed.runId!==runOpen.runId||replayed.runtimeStatus!=="failed"||replayed.runClosedEventRef!==null||
      replayed.activeFluents.includes(runtimeFluentKey(constructRunActiveFluent(runOpen.runId)))||
      terminal===null||terminal.aggregateType!=="run"||terminal.aggregateId!==runOpen.runId||
      terminal.admissionOrdinal<=runOpen.admissionOrdinal||
      (terminal.eventId!==replayed.runtimeFailureEventRef&&terminal.eventId!==replayed.runStoppedEventRef))return false;
    // Native Run membership also catches an orphaned/ambiguous dispatch; the
    // CCall owner preserves parent/child transport and evidence lineage.
    if(runEvents.some(e=>e.runId===runOpen.runId&&
      (e.kind==="actor_invocation_started"||e.kind==="actor_transport_binding_admitted")))return false;
    return !replayed.cCalls.some(call=>hasWorksiteCommandForwardDispatchAtPrefix(prefix,call.cCallRef)||
      isWorksiteCommandForwardObservation(call.resultValue)||
      (call.resultClass==="success"&&runEvents.some(e=>e.kind==="c_call_fibre_selected"&&
        e.aggregateId===call.cCallRef&&record(e.payload)&&e.payload.regime==="F_P")));
  }catch{return false;}
}

/** Current-prefix consumption; coordinates in another invocation are never aliases of this one. */
export function worksiteCommandForwardUnconsumed(prefix:ValidatedRuntimeEventPrefix,request:WorksiteCommandForwardRequest,
  currentInvocationRef:string|null):boolean {
  const events=runtimeEventsFromValidatedPrefix(prefix);
  return !events.some(e=>{
    if(e.kind!=="invocation_admitted"||!record(e.payload)||typeof e.payload.invocationAdmissionRef!=="string"||
      e.payload.invocationAdmissionRef===currentInvocationRef)return false;
    const invocation=projectExactInvocationAdmissionAtPrefix(prefix,e.payload.invocationAdmissionRef);
    if(invocation===null)return e.payload.graphFunctionRef===F.graphFunctionRef&&
      e.payload.workspaceId===request.workspaceBinding.workspaceId;
    if(invocation.graphFunctionRef!==F.graphFunctionRef)return false;
    const basisEvent=one(events,row=>row.kind==="basis_admitted"&&record(row.payload)&&row.payload.basisClass==="root"&&row.payload.invocationAdmissionRef===invocation.invocationAdmissionRef);
    const basis=basisEvent!==null&&record(basisEvent.payload)&&typeof basisEvent.payload.basisRef==="string"
      ?projectExactExecutionBasisAtPrefix(prefix,basisEvent.payload.basisRef):null;
    // An admitted but not yet based forward invocation is unresolved, not an
    // available obligation. Do not guess its source from a digest.
    if(basis===null)return invocation.workspaceId===request.workspaceBinding.workspaceId;
    const raw=basis.rawInputValue;
    if(!isWorksiteCommandForwardRequest(raw))return invocation.workspaceId===request.workspaceBinding.workspaceId;
    return raw.source.failedCCallRef===request.source.failedCCallRef&&
      raw.source.invocationAdmissionRef===request.source.invocationAdmissionRef&&
      !isFailedUndispatchedForwardSuccessor(prefix,invocation,basis);
  });
}
/** Reused at entry, F_D result, child/leaf and observation admission. */
export function projectWorksiteCommandForwardRelation(current:DurablePrefixCoordinate,request:WorksiteCommandForwardRequest,
  currentInvocationRef:string|null=null,physical=false) {
  try{
    const events=readRuntimeEventsAtDurablePrefix(current),prefix=selectValidatedRuntimeEventPrefix(events),s=request.source;
    if(!isWorksiteCommandForwardRequest(request)||!authenticateRuntimePrefixAncestry(s.prefix,current)||
      !worksiteCommandForwardUnconsumed(prefix,request,currentInvocationRef))return null;
    const source=projectWorksiteCommandForwardSource(request);
    if(source===null||!source.events.every((e,i)=>same(e,events[i])))return null;
    const environment=projectExactPrefixWorkspaceEnvironment(current,{ref:request.workspaceBinding.bindingId,digest:request.workspaceBinding.bindingDigest});
    if(environment.kind!=="exact_prefix_workspace_environment"||!same(environment.workspaceAuthorityBasis,request.workspaceAuthorityBasis)||
      !same(environment.workspaceBinding,request.workspaceBinding))return null;
    const retained=projectClosedConstructionRetainedVector(prefix,source.originalTask,request,source.bases);
    if(retained===null)return null;
    const task=constructWorksiteCommandForwardTask({request,originalTask:source.originalTask,...retained});
    if(physical&&!retainedWorksitePhysicalMatches(request.workspaceAuthorityBasis,task.snapshotSources))return null;
    return {task,source,prefix,installedRoots:[...new Set([...source.installedRoots,...environment.productInstalls.map(i=>i.installedRoot)])]};
  }catch{return null;}
}
export function worksiteCommandForwardEntryDisposition(prefix:DurablePrefixCoordinate,gf:GraphFunction,input:unknown,
  binding:WorkspaceBinding,grants:readonly unknown[],sourceResultBasis:unknown):"not_applicable"|"covered"|"basis_fork_detected" {
  if(!isWorksiteCommandForwardRequest(input)&&gf.declarations["abg.worksite_command_forward"]===undefined&&
    gf.name!==F.graphFunctionRef&&gf.name!==F.childGraphFunctionRef)return "not_applicable";
  if(!isWorksiteCommandForwardRequest(input)||!isWorksiteCommandForwardGraphFunction(gf)||gf.name!==F.graphFunctionRef||
    sourceResultBasis!=null||!same(binding,input.workspaceBinding)||grants.length!==1||!same(grants[0],input.capabilityGrant))return "basis_fork_detected";
  return projectWorksiteCommandForwardRelation(prefix,input,null,true)===null?"basis_fork_detected":"covered";
}
export interface WorksiteCommandForwardNativeBasis {
  readonly publication:Readonly<ModulePublication>;readonly graph:Readonly<GtlGraph>;readonly graphFunction:Readonly<GraphFunction>;
  readonly executionBasis:Readonly<ExecutionBasis>;readonly cCall:Readonly<CCall>;readonly cursor:Readonly<TraversalCursorCandidate>;
  readonly predecessorPrefix:Readonly<DurablePrefixCoordinate>;
}
export function authenticateWorksiteCommandForwardBasis(basis:WorksiteCommandForwardNativeBasis,physical=false) {
  try{
    const events=readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix),prefix=selectValidatedRuntimeEventPrefix(events);
    const execution=projectExactExecutionBasisAtPrefix(prefix,basis.executionBasis.basisRef);
    if(execution===null||!same(execution,basis.executionBasis)||!isWorksiteCommandForwardGraphFunction(basis.graphFunction))return null;
    const graph=graphFor(execution,basis.graphFunction),call=graph===null?null:projectOpenedCCallCarrierAtPrefix(prefix,graph,basis.cCall.cCallRef);
    if(graph===null||!same(graph,basis.graph)||call===null||!same(call,basis.cCall)||call.callClass!=="leaf"||
      !([F.prepareImplementationRef,F.implementationRef] as readonly string[]).includes(call.implementationRef??"")||
      !hasAdmittedTraversalCursorAtPrefix(prefix,basis.cursor)||basis.cursor.executionBasisRef!==execution.basisRef||
      basis.cursor.graphCallId!==call.graphCallId||basis.cursor.frameId!==call.frameId||
      projectCCallCarrierPhaseAtPrefix(prefix,call)?.phase!=="selected_no_evidence")return null;
    const set=rehydrateAdmittedImplementationSetAtPrefix(prefix,execution.rootImplementationSetRef);
    if(set===null||set.publicationDigest!==hash(basis.publication)||set.implementationSetDigest!==execution.rootImplementationSetDigest||
      !basis.publication.programs.some(p=>p.programRef===F.programRef&&hash(p)===execution.programDigest)||
      set.rows.filter(r=>r.graphFunctionRef===call.graphFunctionRef&&r.programLocusRef===call.programLocusRef&&
        r.implementationRef===call.implementationRef&&r.implementationBindingRef===call.implementationBindingRef).length!==1)return null;
    const request=isWorksiteCommandForwardRequest(execution.rawInputValue)?execution.rawInputValue:
      isWorksiteCommandForwardTask(execution.rawInputValue)?execution.rawInputValue.request:null;
    if(request===null||execution.workspaceBindingId!==request.workspaceBinding.bindingId||
      execution.workspaceBindingDigest!==request.workspaceBinding.bindingDigest||call.runId===request.source.runId)return null;
    const relation=projectWorksiteCommandForwardRelation(basis.predecessorPrefix,request,execution.invocationAdmissionRef,physical);
    const invocation=projectExactInvocationAdmissionAtPrefix(prefix,execution.invocationAdmissionRef);
    if(relation===null||invocation?.graphFunctionRef!==F.graphFunctionRef||invocation.sourceResultBasis!==null||
      invocation.capabilityGrants.length!==1||!same(invocation.capabilityGrants[0],request.capabilityGrant))return null;
    if(call.implementationRef===F.prepareImplementationRef){
      if(execution.basisClass!=="root"||execution.graphFunctionRef!==F.graphFunctionRef||!same(execution.rawInputValue,request)||
        call.programLocusRef!==F.prepareNodeRef||basis.cursor.inputDigest!==hash(request))return null;
    }else if(!worksiteCommandForwardChildSourceAtPrefix(prefix,basis.predecessorPrefix,execution.parentExecutionBasisRef,
      execution.parentCCallRef,execution.rawInputValue,false))return null;
    return {relation,execution,call,prefix};
  }catch{return null;}
}
export function constructWorksiteCommandForwardNativeBasis(basis:WorksiteCommandForwardNativeBasis) {
  return authenticateWorksiteCommandForwardBasis(basis)===null?null:deepFreeze(basis);
}
export function worksiteCommandForwardChildSourceAtPrefix(prefix:ValidatedRuntimeEventPrefix,durable:DurablePrefixCoordinate,
  parentRef:string|null,parentCCallRef:string|null,input:unknown,physical=true):boolean {
  try{
    if(parentRef===null||parentCCallRef===null||!isWorksiteCommandForwardTask(input))return false;
    const parent=projectExactExecutionBasisAtPrefix(prefix,parentRef),events=runtimeEventsFromValidatedPrefix(prefix);
    if(parent===null||parent.graphFunctionRef!==F.graphFunctionRef||!same(parent.rawInputValue,input.request)||parent.basisClass!=="root")return false;
    const parentCall=one(events,e=>e.kind==="c_call_opened"&&e.aggregateId===parentCCallRef&&e.basisId===parentRef);
    if(parentCall===null||!record(parentCall.payload)||parentCall.payload.callClass!=="workflow"||parentCall.payload.childGraphFunctionRef!==F.childGraphFunctionRef)return false;
    const parentPayload=parentCall.payload;
    const route=one(events,e=>e.kind==="traversal_route_admitted"&&e.basisId===parentRef&&record(e.payload)&&
      e.payload.targetCursorRef===parentPayload.cursorRef&&e.payload.targetCursorDigest===parentPayload.cursorDigest);
    if(route===null||!record(route.payload)||typeof route.payload.cCallRef!=="string"||route.payload.routeKind!=="advance")return false;
    const gf=(awaitFreeForwardRoot()),producer=nativeLeaf(prefix,route.payload.cCallRef,gf);
    if(producer===null||producer.cCall.implementationRef!==F.prepareImplementationRef||producer.cCall.programLocusRef!==F.prepareNodeRef||
      producer.basis.basisRef!==parentRef||producer.result.resultClass!=="success"||producer.judgment.judgment!=="advance"||
      producer.judgment.judgmentRef!==route.payload.judgmentRef||!route.causationEventRefs.includes(producer.judgmentEvent.eventId)||
      !same(producer.result.value,input))return false;
    const relation=projectWorksiteCommandForwardRelation(durable,input.request,parent.invocationAdmissionRef,physical);
    return relation!==null&&same(relation.task,input);
  }catch{return false;}
}
// The declaration is reconstructed, not selected by a caller or loaded by a host controller.
import { worksiteCommandForwardGraphFunctions } from "../gtl/worksite_command_forward.js";
function awaitFreeForwardRoot():GraphFunction{return worksiteCommandForwardGraphFunctions()[0]!;}
export function worksiteCommandForwardResultMatches(basis:WorksiteCommandForwardNativeBasis,input:unknown,value:unknown):boolean {
  const owner=authenticateWorksiteCommandForwardBasis(basis,true);
  return owner!==null&&(owner.call.implementationRef===F.prepareImplementationRef
    ? same(input,owner.relation.task.request)&&same(value,owner.relation.task)
    : isWorksiteCommandForwardObservation(value)&&same(value.task,owner.relation.task)&&same(input,owner.relation.task));
}
