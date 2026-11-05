import { indexedRuntimeEvents, indexedRuntimeEventEnvelopes, projectOwnedRuntimeEventPrefixAtDurablePrefix, readOwnedRuntimeEventPrefixAtDurablePrefix,
  runtimeEventPrefixDigest, runtimeEventPrefixExtent, runtimeEventPrefixLastEnvelope, runtimeEventPrefixesHaveSameOwnedCut,
  selectRuntimeEventPrefixFromAuthority, validatedRuntimeEventPrefixThroughEvent, type RuntimeEventPrefix } from "./event_prefix.js";
/** One native forward relation. Historical coordinates never become current-Run causation. */
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { isWorksiteCommandForwardGraphFunction } from "../gtl/worksite_command_forward.js";
import { materializeGraph } from "../gtl/materialize.js";
import { WORKSITE_COMMAND_FORWARD_IDS as F } from "../product/worksite_command_forward_identity.js";
import { isWorksiteCommandForwardRequest, isWorksiteCommandForwardTask,
  constructWorksiteCommandForwardTask, type WorksiteCommandForwardRequest } from "../product/worksite_command_forward.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as C2, isWorksiteCommandExecutionTask, isWorksiteCommandForwardObservation } from "../product/worksite_command_execution.js";
import { isWorksiteConstructionResult } from "../product/worksite_construction.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { reconstructHistoricalDeclarationCatalog, resolveExecutionDeclarationClosure } from "../product/declaration_closure.js";
import type { WorkspaceBinding } from "../product/environment.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { authenticateRuntimePrefixAncestry, type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { hasExactInvocationRunBindingAtPrefix, projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { projectExactPrefixWorkspaceEnvironment, projectAdmittedProductInstallByAdmissionEventRef } from "./environment_admission.js";
import { projectOpenedCCallCarrierAtPrefix, projectAdmittedCCallStateAtPrefix, projectCCallCarrierPhaseAtPrefix, type CCall } from "./c_call.js";
import { projectClosedGraphCallTerminalAtDurablePrefix } from "./project_read_ports.js";
import { projectSameRunWorksiteCommandSourceAtPrefix } from "./worksite_input_provenance.js";
import { projectClosedConstructionRetainedVector, retainedWorksitePhysicalMatches } from "./worksite_revision.js";
import { rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { hasAdmittedTraversalCursorAtPrefix, type TraversalCursorCandidate } from "./traversal_cursor.js";
import { projectRuntimeReplayRouteRefsAndCCalls, projectRuntimeReplayStatus } from "./replay.js";
import { constructRunActiveFluent, runtimeFluentKey } from "./event_calculus.js";
import { canonicalEquals } from "../shared/value/index.js";
import { admitJson } from "../shared/admit/index.js";
import { resolveExactMatch, type ExactMatch } from "../shared/select/index.js";
const hash=(a:JsonValue)=>sha256Canonical(a);
const record=(v:unknown):v is Record<string,JsonValue>=>v!==null&&typeof v==="object"&&!Array.isArray(v);
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;
/** Actor ownership is native parent/child lineage, not a guessed payload on
 * each process/stream event. A dispatch intent alone consumes this eligibility. */
export function hasWorksiteCommandForwardDispatchAtPrefix(prefix:ValidatedRuntimeEventPrefix,cCallRef:string):boolean;
/** @internal Same dispatch relation on the owner-selected prefix. */
export function hasWorksiteCommandForwardDispatchAtPrefix(prefix:RuntimeEventPrefix,cCallRef:string):boolean;
export function hasWorksiteCommandForwardDispatchAtPrefix(prefix:RuntimeEventPrefix,cCallRef:string):boolean {
  // Kind and aggregate selections hold every row the predicates can accept;
  // with no started actor, no other actor row can belong to one.
  const owned=(e:{parentAggregateId?:string|null|undefined;payload:unknown})=>e.parentAggregateId===cCallRef||(record(e.payload)&&e.payload.cCallRef===cCallRef);
  return indexedRuntimeEvents(prefix,"kind:actor_invocation_started").some(owned)||
    indexedRuntimeEvents(prefix,"kind:actor_transport_binding_admitted").some(owned)||
    indexedRuntimeEvents(prefix,"related:"+cCallRef).some(e=>e.kind==="c_call_evidenced"&&e.aggregateId===cCallRef&&
      record(e.payload)&&e.payload.evidenceClass==="probabilistic_transport");
}
/** Exact decoded-history ancestry of an owned historical cut within the current
 * cut: one owner cut relation, or the canonical event-vector digest when cold. */
function historicalPrefixOf(historical:RuntimeEventPrefix,current:RuntimeEventPrefix):boolean {
  const extent=runtimeEventPrefixExtent(historical),last=runtimeEventPrefixLastEnvelope(historical);
  if(last===undefined)return extent.count===0;
  const cut=validatedRuntimeEventPrefixThroughEvent(current,last.eventId),through=runtimeEventPrefixExtent(cut);
  return through.count===extent.count&&through.lastOrdinal===extent.lastOrdinal&&
    (runtimeEventPrefixesHaveSameOwnedCut(historical,cut)||runtimeEventPrefixDigest(historical)===runtimeEventPrefixDigest(cut));
}
function graphFor(basis:ExecutionBasis,gf:GraphFunction) {
  if(gf.name!==basis.graphFunctionRef||hash(gf)!==basis.graphFunctionDigest)return null;
  const graph=materializeGraph(gf,{invocationAdmissionRef:basis.invocationAdmissionRef,admittedInputRef:basis.rawInputAdmissionRef,
    admittedInputDigest:basis.rawInputDigest,admittedInput:basis.rawInputValue});
  return graph.materializationRef===basis.graphRef&&graph.materializationDigest===basis.graphDigest?graph:null;
}
function nativeLeaf(prefix:RuntimeEventPrefix,ref:string,gf:GraphFunction) {
  const events=indexedRuntimeEvents(prefix,"aggregate:c_call:"+ref),open=exactOrNull(resolveExactMatch(events,e=>e.kind==="c_call_opened"&&e.aggregateId===ref));
  const basis=open?.basisId===undefined?null:projectExactExecutionBasisAtPrefix(prefix,open.basisId);
  const graph=basis===null?null:graphFor(basis,gf),call=graph===null?null:projectOpenedCCallCarrierAtPrefix(prefix,graph,ref);
  const result=exactOrNull(resolveExactMatch(events,e=>e.kind==="c_call_result_admitted"&&e.aggregateId===ref)),judged=exactOrNull(resolveExactMatch(events,e=>e.kind==="c_call_judged"&&e.aggregateId===ref));
  if(basis===null||call===null||call.callClass!=="leaf"||result===null||judged===null||!record(result.payload)||!record(judged.payload))return null;
  const state=projectAdmittedCCallStateAtPrefix(prefix,call as unknown as Record<string,JsonValue>,
    {kind:"admitted_c_call_result",schemaVersion:"5.0.0",disposition:"admitted",...result.payload,admissionEventRef:result.eventId},
    {kind:"admitted_c_call_judgment",schemaVersion:"5.0.0",disposition:"admitted",...judged.payload,admissionEventRef:judged.eventId});
  return state===null?null:{...state,basis,resultEvent:result,judgmentEvent:judged};
}
/** Pure authentic historical proof. No filesystem worksite observation occurs here. */
export function projectWorksiteCommandForwardSource(request:WorksiteCommandForwardRequest) {
  const source=forwardSourceAt(request);
  if(source===null)return null;
  const {prefix:_prefix,...proof}=source;
  return proof;
}
/** The owner-selected historical prefix stays private to this owner's relations. */
function forwardSourceAt(request:WorksiteCommandForwardRequest) {
  try{
    if(!isWorksiteCommandForwardRequest(request))return null;
    const s=request.source,prefix=projectOwnedRuntimeEventPrefixAtDurablePrefix(s.prefix);
    const invocation=projectExactInvocationAdmissionAtPrefix(prefix,s.invocationAdmissionRef);
    const opened=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix,"aggregate:c_call:"+s.failedCCallRef),
      e=>e.kind==="c_call_opened"&&e.aggregateId===s.failedCCallRef&&e.runId===s.runId));
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
      const owner=exactOrNull(resolveExactMatch(closure.graphFunctionOwners,o=>o.declarationRef===ref));
      const publication=owner===null?null:exactOrNull(resolveExactMatch(closure.publications,p=>p.moduleRef===owner.moduleRef&&p.owningProductId===owner.productId&&
        modulePublicationSemanticDigest(p)===owner.publicationDigest));
      return publication===null?null:exactOrNull(resolveExactMatch(publication.graphFunctions,g=>g.name===ref));
    };
    const gf=definition(sourceBasis.graphFunctionRef),failed=gf===null?null:nativeLeaf(prefix,s.failedCCallRef,gf);
    const failure=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix,"id:"+s.failureEventRef),e=>e.eventId===s.failureEventRef));
    const runFailure=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix,"id:"+s.runFailureEventRef),e=>e.eventId===s.runFailureEventRef));
    if(failed===null||failed.cCall.regime!=="F_P"||failed.cCall.implementationRef!==C2.implementationRef||
      failed.cCall.implementationBindingRef!==C2.implementationBindingRef||failed.result.resultClass==="success"||failed.judgment.judgment==="advance"||
      failure===null||failure.kind!=="c_call_evidenced"||failure.aggregateId!==s.failedCCallRef||failure.runId!==s.runId||
      !record(failure.payload)||failure.payload.evidenceClass!=="admission_rejection"||
      !failed.result.evidenceRefs.includes(String(failure.payload.evidenceRef))||!failed.resultEvent.causationEventRefs.includes(failure.eventId)||
      runFailure===null||runFailure.kind!=="runtime_failure_observed"||runFailure.runId!==s.runId||
      runFailure.admissionOrdinal<=failed.judgmentEvent.admissionOrdinal||
      projectRuntimeReplayStatus(selectRuntimeEventPrefixFromAuthority(prefix,{runId:s.runId}),prefix).runtimeStatus!=="failed"||
      hasWorksiteCommandForwardDispatchAtPrefix(prefix,s.failedCCallRef))return null;
    const parent=projectExactExecutionBasisAtPrefix(prefix,sourceBasis.parentExecutionBasisRef);
    const retained=parent===null?null:projectSameRunWorksiteCommandSourceAtPrefix(prefix,{
      parentBasis:parent,parentCCallRef:sourceBasis.parentCCallRef,runId:s.runId,task:originalTask});
    if(retained===null||retained.preparationResult?.eventId!==s.preparationResultEventRef||
      retained.preparationJudgment?.eventId!==s.preparationJudgmentEventRef)return null;
    const construction=projectClosedGraphCallTerminalAtDurablePrefix(s.prefix,s.constructionGraphCallRef,s.declarationProof);
    if(construction===null||construction.producer.runRef!==s.runId||construction.producer.invocationAdmissionRef!==s.invocationAdmissionRef||
      construction.producer.executionBasis.ref!==retained.sourceBasis.basisRef||!isWorksiteConstructionResult(construction.value)||
      !canonicalEquals(construction.value, originalTask.sourceConstructionResult))return null;
    const preparationGF=definition(parent!.graphFunctionRef),preparation=preparationGF===null?null:nativeLeaf(prefix,retained.preparationResult.aggregateId,preparationGF);
    if(preparation===null||preparation.result.resultClass!=="success"||preparation.judgment.judgment!=="advance"||
      preparation.resultEvent.eventId!==s.preparationResultEventRef||!canonicalEquals(preparation.result.value, originalTask))return null;
    // Count actual declared preparation producers only, not their workflow aliases.
    const producers=indexedRuntimeEventEnvelopes(prefix,"basis:"+parent!.basisRef).filter(e=>e.kind==="c_call_opened"&&e.basisId===parent!.basisRef).flatMap(e=>{
      const candidate=preparationGF===null?null:nativeLeaf(prefix,e.aggregateId,preparationGF);
      return candidate!==null&&candidate.cCall.implementationRef===preparation.cCall.implementationRef&&
        candidate.cCall.programLocusRef===preparation.cCall.programLocusRef&&candidate.result.resultClass==="success"&&
        candidate.judgment.judgment==="advance"?[candidate]:[];
    });
    if(producers.length!==1||producers[0]!.cCall.cCallRef!==preparation.cCall.cCallRef)return null;
    return {prefix,originalTask,construction,preparation,failed,bases:[sourceBasis,parent!,retained.sourceBasis],
      installedRoots:environment.productInstalls.map(i=>i.installedRoot)};
  }catch{return null;}
}

/** A failed successor does not reserve the original obligation forever. This
 * proof only removes consumption; it never selects or admits another attempt. */
function isFailedUndispatchedForwardSuccessor(prefix:RuntimeEventPrefix,
  invocation:NonNullable<ReturnType<typeof projectExactInvocationAdmissionAtPrefix>>,basis:ExecutionBasis):boolean {
  try{
    if(basis.basisClass!=="root"||basis.invocationAdmissionRef!==invocation.invocationAdmissionRef||
      basis.invocationRef!==invocation.invocationRef||basis.graphFunctionRef!==F.graphFunctionRef)return false;
    const runOpen=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix,"kind:run_segment_opened"),e=>e.kind==="run_segment_opened"&&(e.basisId===basis.basisRef||
      (record(e.payload)&&e.payload.invocationAdmissionRef===invocation.invocationAdmissionRef))));
    if(runOpen?.runId===undefined||runOpen.basisId!==basis.basisRef||!record(runOpen.payload)||
      runOpen.payload.executionBasisRef!==basis.basisRef||runOpen.payload.executionBasisDigest!==basis.basisDigest||
      !hasExactInvocationRunBindingAtPrefix(prefix,invocation,runOpen.runId))return false;
    const runPrefix=selectRuntimeEventPrefixFromAuthority(prefix,{runId:runOpen.runId});
    const replayed=projectRuntimeReplayRouteRefsAndCCalls(runPrefix,prefix);
    const terminal=exactOrNull(resolveExactMatch((["runtime_failure_observed","run_stopped","run_closed"] as const).flatMap(kind=>
      indexedRuntimeEventEnvelopes(runPrefix,"kind:"+kind)),e=>e.runId===runOpen.runId));
    if(replayed.runId!==runOpen.runId||replayed.runtimeStatus!=="failed"||replayed.runClosedEventRef!==null||
      replayed.activeFluents.includes(runtimeFluentKey(constructRunActiveFluent(runOpen.runId)))||
      terminal===null||terminal.aggregateType!=="run"||terminal.aggregateId!==runOpen.runId||
      terminal.admissionOrdinal<=runOpen.admissionOrdinal||
      (terminal.eventId!==replayed.runtimeFailureEventRef&&terminal.eventId!==replayed.runStoppedEventRef))return false;
    // Native Run membership also catches an orphaned/ambiguous dispatch; the
    // CCall owner preserves parent/child transport and evidence lineage.
    if((["actor_invocation_started","actor_transport_binding_admitted"] as const).some(kind=>
      indexedRuntimeEventEnvelopes(runPrefix,"kind:"+kind).some(e=>e.runId===runOpen.runId)))return false;
    return !replayed.cCalls.some(call=>hasWorksiteCommandForwardDispatchAtPrefix(prefix,call.cCallRef)||
      isWorksiteCommandForwardObservation(call.resultValue)||
      (call.resultClass==="success"&&indexedRuntimeEvents(runPrefix,"related:"+call.cCallRef).some(e=>e.kind==="c_call_fibre_selected"&&
        e.aggregateId===call.cCallRef&&record(e.payload)&&e.payload.regime==="F_P")));
  }catch{return false;}
}

/** Current-prefix consumption; coordinates in another invocation are never aliases of this one. */
export function worksiteCommandForwardUnconsumed(prefix:ValidatedRuntimeEventPrefix,request:WorksiteCommandForwardRequest,
  currentInvocationRef:string|null):boolean;
/** @internal Same consumption relation on the owner-selected prefix. */
export function worksiteCommandForwardUnconsumed(prefix:RuntimeEventPrefix,request:WorksiteCommandForwardRequest,
  currentInvocationRef:string|null):boolean;
export function worksiteCommandForwardUnconsumed(prefix:RuntimeEventPrefix,request:WorksiteCommandForwardRequest,
  currentInvocationRef:string|null):boolean {
  return !indexedRuntimeEvents(prefix,"kind:invocation_admitted").some(e=>{
    if(e.kind!=="invocation_admitted"||!record(e.payload)||typeof e.payload.invocationAdmissionRef!=="string"||
      e.payload.invocationAdmissionRef===currentInvocationRef)return false;
    const invocation=projectExactInvocationAdmissionAtPrefix(prefix,e.payload.invocationAdmissionRef);
    if(invocation===null)return e.payload.graphFunctionRef===F.graphFunctionRef&&
      e.payload.workspaceId===request.workspaceBinding.workspaceId;
    if(invocation.graphFunctionRef!==F.graphFunctionRef)return false;
    const basisEvent=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix,"payload:invocationAdmissionRef:"+invocation.invocationAdmissionRef),row=>row.kind==="basis_admitted"&&record(row.payload)&&row.payload.basisClass==="root"&&row.payload.invocationAdmissionRef===invocation.invocationAdmissionRef));
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
    const prefix=readOwnedRuntimeEventPrefixAtDurablePrefix(current),s=request.source;
    if(!isWorksiteCommandForwardRequest(request)||!authenticateRuntimePrefixAncestry(s.prefix,current)||
      !worksiteCommandForwardUnconsumed(prefix,request,currentInvocationRef))return null;
    const owned=forwardSourceAt(request);
    if(owned===null||!historicalPrefixOf(owned.prefix,prefix))return null;
    const {prefix:_sourcePrefix,...source}=owned;
    const environment=projectExactPrefixWorkspaceEnvironment(current,{ref:request.workspaceBinding.bindingId,digest:request.workspaceBinding.bindingDigest});
    if(environment.kind!=="exact_prefix_workspace_environment"||!canonicalEquals(environment.workspaceAuthorityBasis, request.workspaceAuthorityBasis)||
      !canonicalEquals(environment.workspaceBinding, request.workspaceBinding))return null;
    const retained=projectClosedConstructionRetainedVector(prefix,source.originalTask,request,source.bases);
    if(retained===null)return null;
    const task=constructWorksiteCommandForwardTask({request,originalTask:source.originalTask,...retained});
    if(physical&&!retainedWorksitePhysicalMatches(request.workspaceAuthorityBasis,task.snapshotSources))return null;
    return {task,source,installedRoots:[...new Set([...source.installedRoots,...environment.productInstalls.map(i=>i.installedRoot)])]};
  }catch{return null;}
}
export function worksiteCommandForwardEntryDisposition(prefix:DurablePrefixCoordinate,gf:GraphFunction,input:unknown,
  binding:WorkspaceBinding,grants:readonly JsonValue[],sourceResultBasis:unknown):"not_applicable"|"covered"|"basis_fork_detected" {
  if(!isWorksiteCommandForwardRequest(input)&&gf.declarations["abg.worksite_command_forward"]===undefined&&
    gf.name!==F.graphFunctionRef&&gf.name!==F.childGraphFunctionRef)return "not_applicable";
  if(!isWorksiteCommandForwardRequest(input)||!isWorksiteCommandForwardGraphFunction(gf)||gf.name!==F.graphFunctionRef||
    sourceResultBasis!=null||!canonicalEquals(binding, input.workspaceBinding)||grants.length!==1||grants[0]===undefined||!canonicalEquals(grants[0], input.capabilityGrant))return "basis_fork_detected";
  return projectWorksiteCommandForwardRelation(prefix,input,null,true)===null?"basis_fork_detected":"covered";
}
export interface WorksiteCommandForwardNativeBasis {
  readonly publication:Readonly<ModulePublication>;readonly graph:Readonly<GtlGraph>;readonly graphFunction:Readonly<GraphFunction>;
  readonly executionBasis:Readonly<ExecutionBasis>;readonly cCall:Readonly<CCall>;readonly cursor:Readonly<TraversalCursorCandidate>;
  readonly predecessorPrefix:Readonly<DurablePrefixCoordinate>;
}
export function authenticateWorksiteCommandForwardBasis(basis:WorksiteCommandForwardNativeBasis,physical=false) {
  try{
    const prefix=readOwnedRuntimeEventPrefixAtDurablePrefix(basis.predecessorPrefix);
    const execution=projectExactExecutionBasisAtPrefix(prefix,basis.executionBasis.basisRef);
    if(execution===null||!canonicalEquals(execution, basis.executionBasis)||!isWorksiteCommandForwardGraphFunction(basis.graphFunction))return null;
    const graph=graphFor(execution,basis.graphFunction),call=graph===null?null:projectOpenedCCallCarrierAtPrefix(prefix,graph,basis.cCall.cCallRef);
    if(graph===null||!canonicalEquals(graph, basis.graph)||call===null||!canonicalEquals(call, basis.cCall)||call.callClass!=="leaf"||
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
      invocation.capabilityGrants.length!==1||(invocation.capabilityGrants[0] === undefined || !canonicalEquals(invocation.capabilityGrants[0], request.capabilityGrant)))return null;
    if(call.implementationRef===F.prepareImplementationRef){
      if(execution.basisClass!=="root"||execution.graphFunctionRef!==F.graphFunctionRef||!canonicalEquals(execution.rawInputValue, request)||
        call.programLocusRef!==F.prepareNodeRef||basis.cursor.inputDigest!==hash(request))return null;
    }else if(!worksiteCommandForwardChildSourceAtPrefix(prefix,basis.predecessorPrefix,execution.parentExecutionBasisRef,
      execution.parentCCallRef,execution.rawInputValue,false))return null;
    return {relation,execution,call};
  }catch{return null;}
}
export function constructWorksiteCommandForwardNativeBasis(basis:WorksiteCommandForwardNativeBasis) {
  return authenticateWorksiteCommandForwardBasis(basis)===null?null:deepFreeze(basis);
}
export function worksiteCommandForwardChildSourceAtPrefix(prefix:ValidatedRuntimeEventPrefix,durable:DurablePrefixCoordinate,
  parentRef:string|null,parentCCallRef:string|null,input:unknown,physical?:boolean):boolean;
/** @internal Same exact Source guards on the owner-selected prefix. */
export function worksiteCommandForwardChildSourceAtPrefix(prefix:RuntimeEventPrefix,durable:DurablePrefixCoordinate,
  parentRef:string|null,parentCCallRef:string|null,input:unknown,physical?:boolean):boolean;
export function worksiteCommandForwardChildSourceAtPrefix(prefix:RuntimeEventPrefix,durable:DurablePrefixCoordinate,
  parentRef:string|null,parentCCallRef:string|null,input:unknown,physical=true):boolean {
  try{
    if(parentRef===null||parentCCallRef===null||!isWorksiteCommandForwardTask(input))return false;
    const parent=projectExactExecutionBasisAtPrefix(prefix,parentRef),events=indexedRuntimeEvents(prefix,"aggregate:c_call:"+parentCCallRef);
    if(parent===null||parent.graphFunctionRef!==F.graphFunctionRef||!canonicalEquals(parent.rawInputValue, input.request)||parent.basisClass!=="root")return false;
    const parentCall=exactOrNull(resolveExactMatch(events,e=>e.kind==="c_call_opened"&&e.aggregateId===parentCCallRef&&e.basisId===parentRef));
    if(parentCall===null||!record(parentCall.payload)||parentCall.payload.callClass!=="workflow"||parentCall.payload.childGraphFunctionRef!==F.childGraphFunctionRef)return false;
    const parentPayload=parentCall.payload;
    const route=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix,"payload:targetCursorRef:"+parentPayload.cursorRef),e=>e.kind==="traversal_route_admitted"&&e.basisId===parentRef&&record(e.payload)&&
      e.payload.targetCursorRef===parentPayload.cursorRef&&e.payload.targetCursorDigest===parentPayload.cursorDigest));
    if(route===null||!record(route.payload)||typeof route.payload.cCallRef!=="string"||route.payload.routeKind!=="advance")return false;
    const gf=(awaitFreeForwardRoot()),producer=nativeLeaf(prefix,route.payload.cCallRef,gf);
    if(producer===null||producer.cCall.implementationRef!==F.prepareImplementationRef||producer.cCall.programLocusRef!==F.prepareNodeRef||
      producer.basis.basisRef!==parentRef||producer.result.resultClass!=="success"||producer.judgment.judgment!=="advance"||
      producer.judgment.judgmentRef!==route.payload.judgmentRef||!route.causationEventRefs.includes(producer.judgmentEvent.eventId)||
      !canonicalEquals(producer.result.value, input))return false;
    const relation=projectWorksiteCommandForwardRelation(durable,input.request,parent.invocationAdmissionRef,physical);
    return relation!==null&&canonicalEquals(relation.task, input);
  }catch{return false;}
}
// The declaration is reconstructed, not selected by a caller or loaded by a host controller.
import { worksiteCommandForwardGraphFunctions } from "../gtl/worksite_command_forward.js";
function awaitFreeForwardRoot():GraphFunction{return worksiteCommandForwardGraphFunctions()[0]!;}
export function worksiteCommandForwardResultMatches(basis:WorksiteCommandForwardNativeBasis,input:unknown,value:unknown):boolean {
  const owner=authenticateWorksiteCommandForwardBasis(basis,true);
  if(owner===null)return false;
  const admittedInput=admitJson(input);
  if(admittedInput.kind!=="ok")return false;
  if(owner.call.implementationRef===F.prepareImplementationRef){
    const admittedValue=admitJson(value);
    return admittedValue.kind==="ok"&&canonicalEquals(admittedInput.value, owner.relation.task.request)&&canonicalEquals(admittedValue.value, owner.relation.task);
  }
  return isWorksiteCommandForwardObservation(value)&&canonicalEquals(value.task, owner.relation.task)&&canonicalEquals(admittedInput.value, owner.relation.task);
}
