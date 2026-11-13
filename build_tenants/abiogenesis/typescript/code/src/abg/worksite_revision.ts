import { RuntimeEventBodyView } from "./runtime_history.js";
import type { RuntimeEventScan } from "./runtime_history.js";
import { checkedRecordAtPrefix, indexedRuntimeEvents } from "./event_prefix.js";
import type { RuntimeEventPrefix } from "./event_prefix.js";
import type { ProductTruthQuestion } from "../shared/capability_contracts.js";
import { isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { projectNativeWorkCommandSourceAtPrefix, worksiteCommandSourcesInvalidatedAfter } from "./native_worksite_execution.js";
import { projectWorksiteInputLeafResultAtPrefix } from "./worksite_input_provenance.js";
import { isSemanticJobEnvelope } from "../product/semantic_job.js";
import { isSemanticJobRevisionEnvelope, deriveSemanticJobRevision, type SemanticJobRevisionEnvelope } from "../product/semantic_revision.js";
import { semanticJobConstructionSourceAtPrefix, semanticJobReadDependenciesAtPrefix } from "./semantic_job.js";
import { isWorksiteFileParentsSuccess } from "../product/worksite_effect.js";
/** D2's single prefix-owned observation projection. No caller grants or ledger. */
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { pathRelation, pathStrictlyWithin } from "../shared/path_confinement.js";
import { constructWorksiteObservation, isWorksiteObservation, type WorksiteObservation, type WorksiteSubject } from "../product/worksite_effect.js";
import { isSemanticStageEnvelope, projectSemanticWorksiteCoordinates, type SemanticWorksiteBasis } from "../product/semantic_stage.js";
import { isSemanticRevisionEnvelope, isSemanticRevisionRequest, isSemanticRevisionSelectionInput, isSemanticRevisionSelection,
  deriveSemanticRevision, semanticRevisionSelectionInputMatchesRequest, type SemanticRevisionCoordinate, type SemanticRevisionEnvelope } from "../product/semantic_revision.js";
import { WORKSITE_REVISION_IDS, worksiteExecutionSources, type WorksiteExecutionTask, type WorksiteRevisionDependencyObservation, type WorksiteRevisionObservationOrigin } from "../product/worksite_revision.js";
import { isWorksiteRevisionCommandExecutionObservation } from "../product/worksite_command_execution.js";
import { isWorksitePreparationInput } from "../product/worksite_preparation.js";
import { WORKSITE_C0_IDS } from "../gtl/worksite_c0.js";
import { runtimeEventBodiesAtPrefix, validatedRuntimeEventPrefixBeforeEvent, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";
import { projectAdmittedCCallStateAtPrefix, type RehydratedAdmittedCCallState } from "./c_call.js";
import { admittedInstallLocksAnswerStrictAtPrefix, projectArtifactTruth, type ArtifactTruthRow } from "./artifact_truth.js";
import { validatePublicOperationBasis } from "./environment_admission.js";
import { WITNESS_CONTENT_CONTRACTS } from "./witness_admission_operation.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import type { WorkspaceBinding, WorkspaceAuthorityBasis } from "../product/environment.js";
import type { GraphFunction } from "../gtl/contracts.js";
import { projectRuntimeEventFromValidatedHistory, type RuntimeEvent } from "./event_store.js";
import { projectWorksiteTransitionForResult, deriveRuntimeHeldFluentProjection, holdsAt,
  constructWorksiteObservationCurrentFluent } from "./event_calculus.js";
import type { ChildExecutionBasisInput, ExecutionBasis } from "./execution_basis.js";
import { readFileSync, lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalEquals, presentMember } from "../shared/value/index.js";
import { checkExactRecord, onlyExactMatch, resolveExactMatch, type ExactMatch, type RecordCheck } from "../shared/select/index.js";
import { ok, type Outcome, type StructuralRefusal } from "../shared/refusal.js";
const record = (v: unknown): v is Record<string, JsonValue> => v !== null && typeof v === "object" && !Array.isArray(v);
const isRevisionEnvelope = (value: unknown): value is SemanticRevisionEnvelope | SemanticJobRevisionEnvelope => isSemanticRevisionEnvelope(value) || isSemanticJobRevisionEnvelope(value);
function sameSemanticSubject(a: unknown,b: unknown): boolean {
  if (isSemanticJobEnvelope(a) && isSemanticJobEnvelope(b)) return canonicalEquals(a.job, b.job) && canonicalEquals(a.basis, b.basis) && canonicalEquals(a.declaration, b.declaration);
  return isSemanticStageEnvelope(a) && isSemanticStageEnvelope(b) && canonicalEquals(a.lifecycle, b.lifecycle) && canonicalEquals(a.sourceHandoff, b.sourceHandoff);
}
const hash = (v: JsonValue) => sha256Canonical(v);
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;
const sameScope = (a: RuntimeEvent, b: RuntimeEvent) => a.basisId === b.basisId && a.runId === b.runId &&
  a.graphCallId === b.graphCallId && a.frameId === b.frameId;

/** Reconstruct the recorded native leaf carrier, then reuse CCall's outcome
 * validator. No GraphFunction is synthesized and no value-equivalent wrapper
 * is admitted as its producer. The installed resolution row owns the locus. */
export function projectWorksiteRevisionNativeResult(prefix: ValidatedRuntimeEventPrefix,
  coordinate: SemanticRevisionCoordinate): RehydratedAdmittedCCallState | null;
/** @internal */
export function projectWorksiteRevisionNativeResult(prefix: RuntimeEventPrefix,
  coordinate: SemanticRevisionCoordinate): RehydratedAdmittedCCallState | null;
export function projectWorksiteRevisionNativeResult(prefix: RuntimeEventPrefix,
  coordinate: SemanticRevisionCoordinate): RehydratedAdmittedCCallState | null {
  try {
    runtimeEventBodiesAtPrefix(prefix);
    const opened = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + coordinate.cCallRef), e => e.kind === "c_call_opened" && e.aggregateId === coordinate.cCallRef));
    const fibre = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + coordinate.cCallRef), e => e.kind === "c_call_fibre_selected" && e.aggregateId === coordinate.cCallRef));
    const result = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + coordinate.cCallRef), e => e.kind === "c_call_result_admitted" && e.aggregateId === coordinate.cCallRef));
    const judgment = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + coordinate.cCallRef), e => e.kind === "c_call_judged" && e.aggregateId === coordinate.cCallRef));
    if (opened === null || fibre === null || result === null || judgment === null || !record(opened.payload) ||
      !record(fibre.payload) || !record(result.payload) || !record(judgment.payload) || opened.payload.callClass !== "leaf" ||
      fibre.payload.callClass !== "leaf" || typeof opened.basisId !== "string" ||
      ![fibre,result,judgment].every(e => sameScope(e, opened)) ||
      result.eventId !== coordinate.resultAdmissionEventRef || judgment.eventId !== coordinate.judgmentEventRef ||
      result.payload.resultRef !== coordinate.resultRef || result.payload.resultDigest !== coordinate.resultDigest ||
      !fibre.causationEventRefs.includes(opened.eventId)) return null;
    const openedPayload = opened.payload, fibrePayload = fibre.payload;
    const basis = projectExactExecutionBasisAtPrefix(prefix, opened.basisId);
    const set = basis === null ? null : rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
    const row = set === null ? null : exactOrNull(resolveExactMatch(set.rows, r => r.graphFunctionRef === basis!.graphFunctionRef &&
      r.programLocusRef === openedPayload.programLocusRef && r.implementationRef === fibrePayload.implementationRef &&
      r.implementationBindingRef === fibrePayload.implementationBindingRef && r.requirementKey === fibrePayload.implementationRequirementKey));
    if (basis === null || set === null || row === null || set.implementationSetDigest !== basis.implementationSetDigest ||
      fibre.payload.implementationSetRef !== set.implementationSetRef || row.computeRegime !== fibre.payload.regime ||
      opened.graphFunctionRef !== basis.graphFunctionRef || opened.payload.graphFunctionRef !== basis.graphFunctionRef ||
      result.payload.contractRef !== (result.payload.resultClass === "success" ? row.outputContractRef : row.failureContractRef) ||
      judgment.payload.contractRef !== basis.judgmentContractRef) return null;
    const call = { ...opened.payload, ...fibre.payload, kind: "c_call", schemaVersion: "5.0.0", runId: opened.runId,
      inputContractRef: row.inputContractRef, outputContractRef: row.outputContractRef, failureContractRef: row.failureContractRef,
      refusalContractRef: row.refusalContractRef, refusalValueKind: basis.refusalValueKind,
      evidenceContractRef: basis.evidenceContractRef, judgmentContractRef: basis.judgmentContractRef,
      rejectionContractRef: row.refusalContractRef, transitionContractRef: basis.transitionContractRef,
      closureContractRef: basis.closureContractRef, closureContractDigest: basis.closureContractDigest,
      judgmentPredicateRef: judgment.payload.predicateRef, terminalPredicateRef: basis.terminalPredicateRef,
      replayProjectionRef: basis.replayProjectionRef, terminalKind: basis.terminalKind, childGraphFunctionRef: null,
      interactionSetRef: basis.interactionSetRef, interactionRequirementKey: null, interactionKind: null,
      actorCapabilityRef: null, responseContractRef: null, continuationContractRef: null,
      openedEventRef: opened.eventId, fibreSelectedEventRef: fibre.eventId };
    return projectAdmittedCCallStateAtPrefix(prefix, call as Record<string, JsonValue>,
      { kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", ...result.payload, admissionEventRef: result.eventId },
      { kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", ...judgment.payload, admissionEventRef: judgment.eventId });
  } catch { return null; }
}

/** One exact binding row of the fold. Work requires strict install locks;
 * replay passes the recorded question through the same provenance checks. */
function admittedBindingRow(prefix: RuntimeEventPrefix, match: (row: ArtifactTruthRow) => boolean, question: ProductTruthQuestion): ArtifactTruthRow | null {
  const row = exactOrNull(resolveExactMatch(projectArtifactTruth(prefix).artifacts,
    r => r.operationId === "abg.operation.workspace.bind" && match(r)));
  return row !== null && (question === "recorded" || admittedInstallLocksAnswerStrictAtPrefix(prefix, row.causationEventRefs)) ? row : null;
}

/** Artifact truth already reconstructs and validates the causal installs,
 * lock, ProductSet, A and W. This is an exact coordinate selection of it. */
function nativeBinding(prefix: RuntimeEventPrefix, binding: WorkspaceBinding, question: ProductTruthQuestion) {
  const row = admittedBindingRow(prefix, r =>
    r.authorityScopeRef === binding.bindingId && r.authorityScopeDigest === binding.bindingDigest &&
    r.admissionEventRef === binding.admissionEventRef, question);
  if (row === null || !record(row.artifact) || !record(row.workspaceAuthorityBasis)) return null;
  const {kind: _kind,...body} = row.artifact;
  return canonicalEquals({kind:"workspace_binding",...body,admissionEventRef:row.admissionEventRef}, binding)
    ? { row, binding, authority: row.workspaceAuthorityBasis as unknown as WorkspaceAuthorityBasis } : null;
}
export function projectAdmittedWorkspaceBindingAtCoordinate(prefix:ValidatedRuntimeEventPrefix,ref:string,digest:string):WorkspaceBinding|null;
/** @internal */
export function projectAdmittedWorkspaceBindingAtCoordinate(prefix:RuntimeEventPrefix,ref:string,digest:string,question?:ProductTruthQuestion):WorkspaceBinding|null;
export function projectAdmittedWorkspaceBindingAtCoordinate(prefix:RuntimeEventPrefix,ref:string,digest:string,question:ProductTruthQuestion="strict"):WorkspaceBinding|null {
  const row=admittedBindingRow(prefix,r=>r.authorityScopeRef===ref&&r.authorityScopeDigest===digest,question);
  if(row===null||!record(row.artifact))return null;
  const {kind:_kind,...body}=row.artifact;
  return {kind:"workspace_binding",...body,admissionEventRef:row.admissionEventRef} as unknown as WorkspaceBinding;
}

/** All exact covering witness occurrences, not a latest/first chosen token. */
export function projectWorksiteRevisionBindingCover(prefix: ValidatedRuntimeEventPrefix,
  before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[]): readonly string[] | null;
/** @internal */
export function projectWorksiteRevisionBindingCover(prefix: RuntimeEventPrefix,
  before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[], question?: ProductTruthQuestion): readonly string[] | null;
export function projectWorksiteRevisionBindingCover(prefix: RuntimeEventPrefix,
  before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[], question: ProductTruthQuestion = "strict"): readonly string[] | null {
  if (canonicalEquals(before, after)) return [];
  const old = nativeBinding(prefix, before, question), current = nativeBinding(prefix, after, question);
  if (old === null || current === null || !canonicalEquals(old.authority, current.authority) ||
    before.workspaceId !== after.workspaceId || before.authorizedActorRef !== after.authorizedActorRef) return null;
  return projectWitnessedWorkspaceBindingCover(prefix, before, after, historicalBases, question);
}

/** Exact witnessed cover only. Each caller still owns applicability and current
 * work permission; D2's stricter authority continuity remains above. */
export function projectWitnessedWorkspaceBindingCover(prefix: ValidatedRuntimeEventPrefix,
  before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[]): readonly string[] | null;
/** @internal */
export function projectWitnessedWorkspaceBindingCover(prefix: RuntimeEventPrefix,
  before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[], question?: ProductTruthQuestion): readonly string[] | null;
export function projectWitnessedWorkspaceBindingCover(prefix: RuntimeEventPrefix,
  before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[], question: ProductTruthQuestion = "strict"): readonly string[] | null {
  try {
    if (canonicalEquals(before, after)) return [];
    const old = nativeBinding(prefix,before,question), current = nativeBinding(prefix,after,question);
    if (old === null || current === null) return null;
    const events = runtimeEventBodiesAtPrefix(prefix);
    const bases = historicalBases.flatMap((b,index) => {
      const actual = projectExactExecutionBasisAtPrefix(prefix,b.basisRef);
      return actual !== null && canonicalEquals(actual, b) && historicalBases.findIndex(row=>row.basisRef===b.basisRef)===index &&
        b.workspaceBindingId === before.bindingId && b.workspaceBindingDigest === before.bindingDigest ? [b] : [];
    });
    if (bases.length === 0) return null;
    const covers = events.filter(event => {
      const p = event.payload;
      if (event.kind !== "declaration_reprice_admitted" || !record(p) || p.act !== "reprice" ||
        event.aggregateId !== after.bindingId || p.declarationRef !== before.bindingId || p.beforeDigest !== before.bindingDigest ||
        p.afterDigest !== after.bindingDigest || p.subjectKind !== "authority_basis" || !record(p.context) || p.context.kind !== "basis" ||
        !record(p.context.basis) || p.subjectRef === undefined || p.subjectDigest === undefined ||
        !canonicalEquals(p.context.basis, {ref:p.subjectRef,digest:p.subjectDigest}) ||
        p.contentKind !== "typed_payload" || p.contentContractRef !== WITNESS_CONTENT_CONTRACTS.reprice.ref || p.contentContractDigest !== WITNESS_CONTENT_CONTRACTS.reprice.digest ||
        !record(p.contentValue) || p.changeClass === undefined || p.owningTicketRef === undefined || p.reason === undefined ||
        !canonicalEquals(
          p.contentValue,
          {declarationRef:p.declarationRef,beforeDigest:p.beforeDigest,afterDigest:p.afterDigest,
            changeClass:p.changeClass,owningTicketRef:p.owningTicketRef,reason:p.reason},
        ) ||
        !Array.isArray(p.evidence)) return false;
      const evidence=p.evidence;
      if(![before,after].every(w => evidence.filter(c => record(c) && c.ref === w.bindingId && c.digest === w.bindingDigest).length === 1))return false;
      const historical = exactOrNull(resolveExactMatch(bases,b => b.basisRef === p.subjectRef && b.basisDigest === p.subjectDigest));
      const admitted = historical === null ? null : indexedRuntimeEvents(prefix, "id:" + historical.admissionEventRef).find(e => e.eventId === historical.admissionEventRef);
      const operation = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "kind:" + "public_operation_admitted"),e => e.kind === "public_operation_admitted" && event.causationEventRefs.includes(e.eventId) &&
        record(e.payload) && e.payload.operationId === "abg.operation.witness.admit" && e.payload.memberKey === "reprice"));
      if (admitted === null || admitted === undefined || operation === null || !record(operation.payload) ||
        [old.row.admissionOrdinal,current.row.admissionOrdinal,admitted.admissionOrdinal,operation.admissionOrdinal].some(o => o >= event.admissionOrdinal) ||
        event.basisId !== historical!.basisRef || event.parentAggregateId !== operation.parentAggregateId ||
        event.correlationId !== operation.correlationId || event.eventTime !== operation.eventTime ||
        operation.aggregateId !== after.bindingId || operation.basisId !== after.bindingId ||
        operation.payload.authorityScopeRef !== after.bindingId || operation.payload.authorityScopeDigest !== after.bindingDigest ||
        operation.payload.workspaceBindingRef !== after.bindingId || operation.payload.workspaceBindingDigest !== after.bindingDigest ||
        operation.payload.productSetRef !== after.productSetId || operation.payload.productSetDigest !== after.productSetDigest ||
        operation.payload.dependencyLockRef !== after.lockId || operation.payload.dependencyLockDigest !== after.lockDigest ||
        operation.payload.actorRef !== p.actorRef || operation.payload.actorDigest !== p.actorDigest || p.operatorActorRef !== p.actorRef ||
        p.actorRef !== after.authorizedActorRef) return false;
      const {eventId:_eventId,admissionOrdinal:_ordinal,payloadDigest:_payloadDigest,eventContractDigest:_eventContractDigest,...candidate}=event;
      if(!canonicalEquals(projectRuntimeEventFromValidatedHistory(events.filter(e=>e.admissionOrdinal<event.admissionOrdinal),candidate), event))return false;
      return validatePublicOperationBasis({ ...operation.payload,
        eventTime:operation.eventTime, correlationId:operation.correlationId, causationEventRefs:operation.causationEventRefs } as never,
        "abg.operation.witness.admit","reprice") === null;
    });
    return covers.length === 0 ? null : covers.map(e=>e.eventId);
  } catch { return null; }
}
function inputWorksite(basis: ExecutionBasis, prefix?: RuntimeEventPrefix): SemanticWorksiteBasis | null {
  const input = basis.rawInputValue;
  if (isRevisionEnvelope(input)) return input.current.worksite;
  if (isSemanticStageEnvelope(input) || isSemanticJobEnvelope(input)) return input.worksite;
  if (prefix !== undefined && isWorksiteFileParentsSuccess(input)) {
    const source = indexedRuntimeEvents(prefix, "payload:resultRef:" + input.request.sourceEnvelopeRef).find(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultRef === input.request.sourceEnvelopeRef);
    const value = record(source?.payload) ? source.payload.value : null;
    const original = isSemanticJobEnvelope(value) ? semanticJobConstructionSourceAtPrefix(prefix, value) : null;
    return original?.seed.basisRef === basis.basisRef ? original.worksite : null;
  }
  return null;
}
type WorksiteRow = SemanticWorksiteBasis["targets"][number];
/** Binding coordinates may change; domain meaning and effect bounds may not. */
export function worksiteRevisionMeaningMatches(prior:SemanticWorksiteBasis,current:SemanticWorksiteBasis):boolean {
  return canonicalEquals(prior.workspaceAuthorityBasis, current.workspaceAuthorityBasis)&&
    prior.workspaceBinding.workspaceId===current.workspaceBinding.workspaceId&&prior.targets.length===current.targets.length&&
    prior.capabilityGrant.actorRef===current.capabilityGrant.actorRef&&prior.capabilityGrant.capabilityRef===current.capabilityGrant.capabilityRef&&
    prior.capabilityGrant.operationId===current.capabilityGrant.operationId&&canonicalEquals(prior.capabilityGrant.definitionKey, current.capabilityGrant.definitionKey)&&
    prior.capabilityGrant.authorityBasisRef===current.capabilityGrant.authorityBasisRef&&prior.capabilityGrant.authorityBasisDigest===current.capabilityGrant.authorityBasisDigest&&
    canonicalEquals(prior.commands, current.commands)&&canonicalEquals(prior.outcomePredicates, current.outcomePredicates)&&canonicalEquals(prior.allowedWriteTerritories, current.allowedWriteTerritories);
}
export type WorksiteRevisionOriginProof = WorksiteRevisionObservationOrigin | Readonly<{
  kind: "pending_binding_correspondence";
  source: WorksiteRevisionObservationOrigin;
}>;
interface NativeHistory {
  seed: ExecutionBasis;
  prior: SemanticWorksiteBasis;
  bases: ExecutionBasis[];
  eligible: string[];
  heads:ExecutionBasis[];
}
function coordinateFor(events: RuntimeEventScan, result: RuntimeEvent): SemanticRevisionCoordinate | null {
  if (!record(result.payload) || typeof result.payload.resultRef !== "string" || typeof result.payload.resultDigest !== "string") return null;
  const judged = exactOrNull(resolveExactMatch(events,e => e.kind === "c_call_judged" && e.aggregateId === result.aggregateId));
  return judged === null ? null : {cCallRef:result.aggregateId,resultRef:result.payload.resultRef,
    resultDigest:result.payload.resultDigest as SemanticRevisionCoordinate["resultDigest"],resultAdmissionEventRef:result.eventId,judgmentEventRef:judged.eventId};
}
function nativeHistory(prefix: RuntimeEventPrefix, parentRef: SemanticRevisionCoordinate,
  causeRefs: readonly SemanticRevisionCoordinate[]): NativeHistory | null {
  runtimeEventBodiesAtPrefix(prefix);
  const bases: ExecutionBasis[] = [], eligible = new Set<string>();
  const parent = projectWorksiteRevisionNativeResult(prefix,parentRef);
  const first = parent === null ? null : isRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
  if (parent === null || parent.result.resultClass !== "success" || parent.judgment.judgment !== "advance" ||
    (!isSemanticStageEnvelope(first) && !isSemanticJobEnvelope(first))) return null;
  function addBasis(ref:string): ExecutionBasis | null {
    const b=projectExactExecutionBasisAtPrefix(prefix,ref);if(b===null)return null;
    if(!bases.some(r=>r.basisRef===b.basisRef))bases.push(b);eligible.add(b.invocationAdmissionRef);return b;
  }
  const jobSource = isSemanticJobEnvelope(first) ? semanticJobConstructionSourceAtPrefix(prefix,first) : null;
  const firstWorksite = first.worksite ?? jobSource?.worksite ?? null;
  if (firstWorksite === null) return null;
  const firstBasis=addBasis(parent.cCall.basisId);
  if(firstBasis===null||firstBasis.workspaceBindingId!==firstWorksite.workspaceBinding.bindingId||
    firstBasis.workspaceBindingDigest!==firstWorksite.workspaceBinding.bindingDigest)return null;
  const heads=[firstBasis];
  for(const ref of causeRefs){
    const cause=projectWorksiteRevisionNativeResult(prefix,ref),b=cause===null?null:addBasis(cause.cCall.basisId);
    const invocation=b===null?null:projectExactInvocationAdmissionAtPrefix(prefix,b.invocationAdmissionRef);
    if(cause===null||b===null||cause.cCall.cCallRef===parent.cCall.cCallRef||
      (b.invocationAdmissionRef!==firstBasis.invocationAdmissionRef&&invocation?.sourceResultBasis?.sourceResultRef!==parent.result.resultRef))return null;
    heads.push(b);
    let ancestor=b;const seen=new Set<string>();
    while(ancestor.parentExecutionBasisRef!==null){
      if(seen.has(ancestor.basisRef))return null;seen.add(ancestor.basisRef);
      const next=addBasis(ancestor.parentExecutionBasisRef);
      if(next===null||next.invocationAdmissionRef!==b.invocationAdmissionRef)return null;ancestor=next;
    }
  }
  let ancestor=parent,seed=firstBasis;const visited=new Set<string>();
  while(isRevisionEnvelope(ancestor.result.value)){
    const envelope=ancestor.result.value;
    if(visited.has(envelope.revisionBasis.basisRef)||!sameSemanticSubject(envelope.current,first))return null;
    visited.add(envelope.revisionBasis.basisRef);
    const ordinal=indexedRuntimeEvents(prefix, "id:" + ancestor.result.admissionEventRef).find(e=>e.eventId===ancestor.result.admissionEventRef)!.admissionOrdinal;
    for(const coordinate of [envelope.revisionBasis.request.parent,...envelope.revisionBasis.request.causes]){
      const source=projectWorksiteRevisionNativeResult(prefix,coordinate),b=source===null?null:addBasis(source.cCall.basisId);
      const judged=indexedRuntimeEvents(prefix, "id:" + coordinate.judgmentEventRef).find(e=>e.eventId===coordinate.judgmentEventRef);
      if(source===null||b===null||judged===undefined||judged.admissionOrdinal>=ordinal)return null;
    }
    const source=projectWorksiteRevisionNativeResult(prefix,envelope.revisionBasis.request.parent);
    if(source===null||source.result.resultClass!=="success"||source.judgment.judgment!=="advance")return null;
    const b=addBasis(source.cCall.basisId);if(b===null)return null;ancestor=source;seed=b;
  }
  if (isSemanticJobEnvelope(ancestor.result.value)) {
    const source = semanticJobConstructionSourceAtPrefix(prefix,ancestor.result.value);
    if (source === null || !sameSemanticSubject(ancestor.result.value,first)) return null;
    seed = source.seed; addBasis(seed.basisRef);
  } else {
    const initial=seed.rawInputValue;
    if(!isSemanticStageEnvelope(ancestor.result.value)||!isSemanticStageEnvelope(initial)||initial.worksite===null||
      !canonicalEquals(initial.worksite, ancestor.result.value.worksite)||!sameSemanticSubject(initial,first))return null;
  }
  return {seed,prior:firstWorksite,bases,eligible:[...eligible],heads};
}
interface OriginCandidate {
  origin:WorksiteRevisionObservationOrigin;
  basis:ExecutionBasis;
  worksite:SemanticWorksiteBasis;
  row:WorksiteRow;
  ordinal:number;
  ancestors:readonly string[];
}
interface BindingProjectionFacts {
  state:RehydratedAdmittedCCallState;
  basis:ExecutionBasis;
  envelope:SemanticRevisionEnvelope | SemanticJobRevisionEnvelope;
  origins:readonly OriginCandidate[];
  ordinal:number;
  history:NativeHistory;
}
interface ProjectionSession { readonly question:ProductTruthQuestion; readonly cache:Map<string,BindingProjectionFacts|null>; readonly active:Set<string> }
// One recursive derivation asks one question; its cached facts never cross it.
const session=(question:ProductTruthQuestion):ProjectionSession=>({question,cache:new Map(),active:new Set()});
const originKey=(origin:WorksiteRevisionObservationOrigin)=>canonicalJson(origin);
function observationPhysicalEqual(a:WorksiteObservation,b:WorksiteObservation):boolean {
  return a.state===b.state&&(a.state==="absent"||(b.state==="file"&&a.fileIdentity===b.fileIdentity&&a.fileDigest===b.fileDigest&&a.byteLength===b.byteLength));
}
function samePhysicalSubject(prefix:RuntimeEventPrefix,a:WorksiteSubject,b:WorksiteSubject,question:ProductTruthQuestion):boolean {
  if(a.relativePath!==b.relativePath||a.subjectUri!==b.subjectUri)return false;
  if(a.workspaceBindingIdentity===b.workspaceBindingIdentity&&a.workspaceBindingDigest===b.workspaceBindingDigest)return true;
  const authority=(subject:WorksiteSubject)=>admittedBindingRow(prefix,r=>
    r.authorityScopeRef===subject.workspaceBindingIdentity&&r.authorityScopeDigest===subject.workspaceBindingDigest,question)?.workspaceAuthorityBasis;
  const left=authority(a),right=authority(b);
  return left!==undefined&&right!==undefined&&canonicalEquals(left, right);
}
/** A known native write under any W for this physical subject invalidates an
 * older alias. It never provides a replacement from an unrelated invocation. */
function invalidatedAcrossBindings(prefix:RuntimeEventPrefix,subject:WorksiteSubject,ordinal:number,question:ProductTruthQuestion):boolean {
  // Authority identity still owns provenance transfer in samePhysicalSubject.
  // Physical invalidation resolves the admitted root and exact path only.
  const binding = admittedBindingRow(prefix, row =>
    row.authorityScopeRef === subject.workspaceBindingIdentity && row.authorityScopeDigest === subject.workspaceBindingDigest, question);
  const authority = binding?.workspaceAuthorityBasis;
  const root = record(authority) ? authority.canonicalRoot : undefined;
  return typeof root !== "string" || worksiteCommandSourcesInvalidatedAfter(prefix, ordinal, root, [subject.relativePath]);
}

/** The admitted projection result's coordinates and the digests of its
 * request and envelope: the deterministic evidence row the result cites is
 * checked against them. Absent scope members stay absent. */
type RevisionEvidenceContext = Readonly<{
  aggregateId: string; basisId: string; runId?: string; graphCallId?: string; frameId?: string;
  causationEventRefs: readonly string[]; admissionOrdinal: number;
  cCallRef: string; evidenceContractRef: string | null; evidenceRefs: readonly string[];
  requestDigest: Sha256Digest; envelopeDigest: Sha256Digest;
}>;
const REVISION_EVIDENCE_MISMATCH: StructuralRefusal = Object.freeze({
  kind: "structural_refusal", stage: "validate", code: "worksite_revision_evidence_mismatch",
  path: Object.freeze(["payload"]), evidence: Object.freeze({}),
});
/** One `c_call_evidenced` row as the projection result's deterministic
 * evidence: the projection checks scope, contract, implementation, the
 * request and envelope digests, citation and order; the digest leg compares
 * the evidence body digest with the recorded `evidenceDigest`. */
const REVISION_EVIDENCE_RECORD: RecordCheck<RuntimeEvent, Readonly<Record<string, JsonValue>>, RevisionEvidenceContext> = Object.freeze({
  project: (evidence: RuntimeEvent, c: RevisionEvidenceContext): Outcome<Readonly<Record<string, JsonValue>>> =>
    !record(evidence.payload)||evidence.basisId!==c.basisId||evidence.runId!==c.runId||evidence.graphCallId!==c.graphCallId||
      evidence.frameId!==c.frameId||evidence.payload.evidenceClass!=="deterministic"||
      evidence.payload.cCallRef!==c.cCallRef||evidence.payload.contractRef!==c.evidenceContractRef||
      evidence.payload.implementationRef!==SEMANTIC_REVISION_IDS.projectionImplementationRef||evidence.payload.inputDigest!==c.requestDigest||
      evidence.payload.outputDigest!==c.envelopeDigest||!c.evidenceRefs.includes(String(evidence.payload.evidenceRef))||
      !c.causationEventRefs.includes(evidence.eventId)||evidence.admissionOrdinal>=c.admissionOrdinal
      ? REVISION_EVIDENCE_MISMATCH : ok(evidence.payload),
  digest: Object.freeze({
    expected: (_evidence: RuntimeEvent, payload: Readonly<Record<string, JsonValue>>) => payload.evidenceDigest as Sha256Digest,
    actual: (payload: Readonly<Record<string, JsonValue>>) => {
      const {evidenceRef:_evidenceRef,evidenceDigest:_evidenceDigest,...evidenceBody}=payload;
      return hash(evidenceBody);
    },
  }),
});

function projectionFacts(prefix:RuntimeEventPrefix,result:RuntimeEvent,work:ProjectionSession):BindingProjectionFacts|null {
  if(work.cache.has(result.eventId))return work.cache.get(result.eventId)!;
  if(work.active.has(result.eventId))return null;
  work.active.add(result.eventId);
  let answer:BindingProjectionFacts|null=null;
  try {
    const events=runtimeEventBodiesAtPrefix(prefix),coordinate=coordinateFor(events,result);
    const state=coordinate===null?null:projectWorksiteRevisionNativeResult(prefix,coordinate);
    const basis=state===null?null:projectExactExecutionBasisAtPrefix(prefix,state.cCall.basisId);
    if(state===null||basis===null||state.cCall.implementationRef!==SEMANTIC_REVISION_IDS.projectionImplementationRef||
      state.cCall.implementationBindingRef!==SEMANTIC_REVISION_IDS.projectionBindingRef||state.cCall.regime!=="F_D"||
      state.result.resultClass!=="success"||state.judgment.judgment!=="advance"||state.judgment.predicateRef!==SEMANTIC_REVISION_IDS.projectionPredicateRef||
      !isRevisionEnvelope(state.result.value)||!isSemanticRevisionRequest(basis.rawInputValue))return null;
    const request=basis.rawInputValue,envelope=state.result.value;
    if(!canonicalEquals(envelope.revisionBasis.request, request)||envelope.current.worksite===null)return null;
    const before=validatedRuntimeEventPrefixBeforeEvent(prefix,result.eventId);
    const history=nativeHistory(before,request.parent,request.causes);
    const parent=projectWorksiteRevisionNativeResult(before,request.parent),selection=projectWorksiteRevisionNativeResult(before,request.selection);
    if(history===null||parent===null||selection===null||(!isSemanticStageEnvelope(parent.result.value)&&!isSemanticJobEnvelope(parent.result.value)&&!isRevisionEnvelope(parent.result.value))||!isSemanticRevisionSelection(selection.result.value)||
      selection.result.resultClass!=="success"||selection.judgment.judgment!=="advance"||
      !["F_P","F_H"].includes(selection.cCall.regime)||selection.cCall.outputContractRef!==SEMANTIC_REVISION_IDS.selectionContractRef||
      !canonicalEquals(
        (isSemanticJobRevisionEnvelope(envelope) && (isSemanticJobEnvelope(parent.result.value) || isSemanticJobRevisionEnvelope(parent.result.value))
          ? deriveSemanticJobRevision(parent.result.value,request,selection.result.value,request.currentWorksite!,history.prior)
          : deriveSemanticRevision(parent.result.value as import("../product/semantic_stage.js").SemanticStageEnvelope | SemanticRevisionEnvelope,request,selection.result.value)),
        envelope,
      ))return null;
    const selectionBasis=projectExactExecutionBasisAtPrefix(before,selection.cCall.basisId);
    if(selectionBasis===null||!semanticRevisionSelectionInputMatchesRequest(selectionBasis.rawInputValue,request))return null;
    const current=envelope.current.worksite,environment=nativeBinding(before,current.workspaceBinding,work.question);
    const invocation=projectExactInvocationAdmissionAtPrefix(before,basis.invocationAdmissionRef);
    if(environment===null||!canonicalEquals(environment.authority, current.workspaceAuthorityBasis)||
      current.workspaceBinding.bindingId!==basis.workspaceBindingId||current.workspaceBinding.bindingDigest!==basis.workspaceBindingDigest||
      invocation?.capabilityGrants.length!==1||invocation.capabilityGrants[0]===undefined||!canonicalEquals(invocation.capabilityGrants[0], current.capabilityGrant))return null;
    const evidenceContext:RevisionEvidenceContext={aggregateId:result.aggregateId,basisId:result.basisId,
      ...(result.runId===undefined?{}:{runId:result.runId}),...(result.graphCallId===undefined?{}:{graphCallId:result.graphCallId}),
      ...(result.frameId===undefined?{}:{frameId:result.frameId}),causationEventRefs:result.causationEventRefs,
      admissionOrdinal:result.admissionOrdinal,cCallRef:state.cCall.cCallRef,evidenceContractRef:state.cCall.evidenceContractRef,
      evidenceRefs:state.result.evidenceRefs,requestDigest:hash(request),envelopeDigest:hash(envelope)};
    const evidence=checkedRecordAtPrefix(prefix,REVISION_EVIDENCE_RECORD,evidenceContext,()=>checkExactRecord(
      resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + result.aggregateId),e=>e.kind==="c_call_evidenced"&&e.aggregateId===result.aggregateId),
      REVISION_EVIDENCE_RECORD,evidenceContext));
    // Owner boundary: `absent`, `many` and `invalid` are the existing `null`.
    if(evidence.kind!=="one"||evidence.value.evidenceRef!==`evidence://abiogenesis/${String(evidence.value.evidenceDigest).slice(7)}`)return null;
    const origins=deriveCurrentOrigins(before,history.seed,history.prior,current,history.eligible,history.bases,work);
    if(origins===null)return null;
    answer={state,basis,envelope,origins,ordinal:result.admissionOrdinal,history};return answer;
  } catch {return null;} finally {work.active.delete(result.eventId);work.cache.set(result.eventId,answer);}
}

function deriveCurrentOrigins(prefix:RuntimeEventPrefix,seedBasis:ExecutionBasis,historical:SemanticWorksiteBasis,
  current:SemanticWorksiteBasis,eligible:readonly string[],bases:readonly ExecutionBasis[],work:ProjectionSession):readonly OriginCandidate[]|null {
  const seed=inputWorksite(seedBasis,prefix),events=runtimeEventBodiesAtPrefix(prefix);
  if(seed===null||!worksiteRevisionMeaningMatches(historical,current)||!canonicalEquals(seed.workspaceAuthorityBasis, current.workspaceAuthorityBasis))return null;
  const results:OriginCandidate[]=[];
  for(const [ordinal,row] of current.targets.entries()){
    const prior=historical.targets[ordinal];
    if(prior===undefined||prior.role!==row.role||prior.target.subject.subjectUri!==row.target.subject.subjectUri||
      prior.target.subject.relativePath!==row.target.subject.relativePath||prior.target.territory.territoryUri!==row.target.territory.territoryUri||
      prior.target.territory.relativeRoot!==row.target.territory.relativeRoot||!canonicalEquals(prior.target.territory.operations, row.target.territory.operations))return null;
    const candidates:OriginCandidate[]=[];
    const original=seed.targets.find(t=>samePhysicalSubject(prefix,t.target.subject,row.target.subject,work.question)&&t.role===row.role);
    const seedEvent=indexedRuntimeEvents(prefix, "id:" + seedBasis.admissionEventRef).find(e=>e.eventId===seedBasis.admissionEventRef);
    if(original!==undefined&&seedEvent!==undefined&&!invalidatedAcrossBindings(prefix,original.target.subject,seedEvent.admissionOrdinal,work.question))candidates.push({
      origin:{kind:"admitted_input",basisAdmissionEventRef:seedBasis.admissionEventRef,inputAdmissionRef:seedBasis.rawInputAdmissionRef,inputDigest:seedBasis.rawInputDigest},
      basis:seedBasis,worksite:seed,row:original,ordinal:seedEvent.admissionOrdinal,ancestors:[]});
    for(const event of events){
      if(event.kind!=="c_call_result_admitted"||!record(event.payload)||event.payload.resultClass!=="success")continue;
      const transition=projectWorksiteTransitionForResult(event,events.filter(p=>p.admissionOrdinal<event.admissionOrdinal));
      if(transition?.successorObservation!==null&&transition!==null){
        const replacement=currentReplacement(prefix,transition.successorObservation),b=replacement?.basis;
        if(replacement===null||b===undefined||!eligible.includes(b.invocationAdmissionRef)||!record(b.rawInputValue.subject)||
          !samePhysicalSubject(prefix,b.rawInputValue.subject as unknown as WorksiteSubject,row.target.subject,work.question)||
          invalidatedAcrossBindings(prefix,row.target.subject,event.admissionOrdinal,work.question))continue;
        const request=b.rawInputValue;
        const sourceBinding=projectAdmittedWorkspaceBindingAtCoordinate(prefix,b.workspaceBindingId,b.workspaceBindingDigest,work.question);
        if(sourceBinding===null||!canonicalEquals(presentMember(request.workspaceAuthorityBasis), current.workspaceAuthorityBasis))continue;
        const source={...historical,workspaceAuthorityBasis:request.workspaceAuthorityBasis,workspaceBinding:sourceBinding,
          capabilityGrant:request.capabilityGrant} as unknown as SemanticWorksiteBasis;
        const target={...prior.target,subject:request.subject,territory:request.territory,predecessorObservation:transition.successorObservation} as unknown as WorksiteRow["target"];
        candidates.push({origin:{kind:"admitted_replacement",resultAdmissionEventRef:replacement.event.eventId,evidenceEventRef:replacement.evidence.eventId},
          basis:b,worksite:source,row:{role:row.role,target,base64:String(request.replacementBytes)},ordinal:event.admissionOrdinal,ancestors:[]});
      } else if(isRevisionEnvelope(event.payload.value)){
        const b=typeof event.basisId==="string"?projectExactExecutionBasisAtPrefix(prefix,event.basisId):null;
        if(b===null||!eligible.includes(b.invocationAdmissionRef))continue;
        const projection=projectionFacts(prefix,event,work);
        if(projection===null||projection.history.seed.basisRef!==seedBasis.basisRef||!canonicalEquals(projection.envelope.current.worksite!.workspaceAuthorityBasis, current.workspaceAuthorityBasis))continue;
        const source=projection.envelope.current.worksite!,sourceRow=source.targets.find(t=>samePhysicalSubject(prefix,t.target.subject,row.target.subject,work.question)&&t.role===row.role);
        if(sourceRow===undefined||invalidatedAcrossBindings(prefix,sourceRow.target.subject,event.admissionOrdinal,work.question))continue;
        const sourceProof=projection.origins[source.targets.indexOf(sourceRow)];if(sourceProof===undefined)continue;
        candidates.push({origin:{kind:"admitted_binding_projection",resultAdmissionEventRef:event.eventId,judgmentEventRef:projection.state.judgment.admissionEventRef},
          basis:projection.basis,worksite:source,row:sourceRow,ordinal:event.admissionOrdinal,ancestors:[originKey(sourceProof.origin),...sourceProof.ancestors]});
      }
    }
    const matching=candidates.filter(candidate=>{
      if(!observationPhysicalEqual(candidate.row.target.predecessorObservation,row.target.predecessorObservation)||candidate.row.base64!==row.base64)return false;
      const projected=projectSemanticWorksiteCoordinates({...candidate.worksite,targets:[candidate.row]},current);
      if(projected===null||!canonicalEquals(presentMember(projected.targets[0]?.target), row.target))return false;
      return projectWorksiteRevisionBindingCover(prefix,candidate.worksite.workspaceBinding,current.workspaceBinding,[...bases,candidate.basis],work.question)!==null;
    });
    const survivors=matching.filter(c=>!matching.some(other=>other!==c&&other.ancestors.includes(originKey(c.origin))));
    if(survivors.length!==1)return null;results.push(survivors[0]!);
  }
  return results;
}

/** One selected native D2 admission gate, shared by new actions, child bases
 * and later assembly. Raw kind strings cannot select an owner or grant. */
export function worksiteRevisionEntryBindingDisposition(prefix:ValidatedRuntimeEventPrefix,graphFunction:Readonly<GraphFunction>,
  input:unknown,currentBinding:WorkspaceBinding,
  admittedInput?:Pick<ChildExecutionBasisInput,"admittedInputRef"|"admittedInputDigest">):"not_applicable"|"covered"|"basis_fork_detected";
/** @internal */
export function worksiteRevisionEntryBindingDisposition(prefix:RuntimeEventPrefix,graphFunction:Readonly<GraphFunction>,
  input:unknown,currentBinding:WorkspaceBinding,
  admittedInput?:Pick<ChildExecutionBasisInput,"admittedInputRef"|"admittedInputDigest">):"not_applicable"|"covered"|"basis_fork_detected";
export function worksiteRevisionEntryBindingDisposition(prefix:RuntimeEventPrefix,graphFunction:Readonly<GraphFunction>,
  input:unknown,currentBinding:WorkspaceBinding,
  admittedInput?:Pick<ChildExecutionBasisInput,"admittedInputRef"|"admittedInputDigest">):"not_applicable"|"covered"|"basis_fork_detected" {
  if(graphFunction.declarations["abg.semantic_revision_history"]!==SEMANTIC_REVISION_IDS.historicalOwnerDependencyRef)return "not_applicable";
  try {
    const nativeRequest = isSemanticJobRevisionEnvelope(input) ? input.revisionBasis.request : input;
    if ((isSemanticRevisionSelectionInput(nativeRequest) || isSemanticRevisionRequest(nativeRequest)) && nativeRequest.nativeWorksite !== undefined) {
      const native = nativeRequest.nativeWorksite;
      if (!canonicalEquals(native.workspaceBinding, currentBinding)) return "basis_fork_detected";
      const {acquisition:_acquisition,...retained} = native;
      const prepared = {kind:"semantic_revision_selection_input",schemaVersion:"5.0.0",parent:nativeRequest.parent,causes:nativeRequest.causes,currentWorksite:null,nativeWorksite:retained};
      const events = runtimeEventBodiesAtPrefix(prefix);
      const inputSource = admittedInput === undefined ? null : projectWorksiteInputLeafResultAtPrefix(prefix,
        admittedInput.admittedInputRef, admittedInput.admittedInputDigest);
      const candidates = admittedInput === undefined ? events : new RuntimeEventBodyView(inputSource === null ? [] : [inputSource]);
      const sources = native.acquisition === undefined ? candidates.flatMap(event=>{
        if(event.kind!=="c_call_result_admitted"||!record(event.payload)||!canonicalEquals(presentMember(event.payload.value), prepared))return [];
        const c=coordinateFor(events,event),state=c===null?null:projectWorksiteRevisionNativeResult(prefix,c);
        return state===null?[]:[state];
      }) : [projectWorksiteRevisionNativeResult(prefix,native.acquisition)];
      return sources.length===1 && sources[0]?.cCall.implementationRef===SEMANTIC_REVISION_IDS.nativeIntakeImplementationRef &&
        sources[0].result.resultClass==="success" && sources[0].judgment.judgment==="advance" && canonicalEquals(sources[0].result.value, prepared) ? "covered" : "basis_fork_detected";
    }
    if(isWorksiteRevisionCommandExecutionObservation(input)){
      // Evidence-input consumes the actual C2 producer, not a request. Resolve
      // its earlier preparation revision; the existing evidence owner still
      // performs the complete C1/bridge/command/evidence join after this gate.
      if(!canonicalEquals(input.task.workspaceBinding, currentBinding))return "basis_fork_detected";
      const observed=input,events=runtimeEventBodiesAtPrefix(prefix);
      const sources=events.flatMap(e=>{
        if(e.kind!=="c_call_result_admitted"||!record(e.payload)||!canonicalEquals(presentMember(e.payload.value), observed))return [];
        const coordinate=coordinateFor(events,e),state=coordinate===null?null:projectWorksiteRevisionNativeResult(prefix,coordinate);
        return state!==null&&state.cCall.graphFunctionRef===WORKSITE_REVISION_IDS.graphFunctionRef&&state.cCall.regime==="F_P"&&
          state.cCall.implementationRef===WORKSITE_REVISION_IDS.implementationRef&&state.cCall.implementationBindingRef===WORKSITE_REVISION_IDS.implementationBindingRef&&
          state.cCall.outputContractRef===WORKSITE_REVISION_IDS.observationContractRef&&state.result.resultClass==="success"&&
          state.judgment.judgment==="advance"&&state.judgment.predicateRef===WORKSITE_REVISION_IDS.judgmentPredicateRef?[state]:[];
      });
      if(sources.length!==1)return "basis_fork_detected";
      const sourceOrdinal=indexedRuntimeEvents(prefix, "id:" + sources[0]!.result.admissionEventRef).find(e=>e.eventId===sources[0]!.result.admissionEventRef)!.admissionOrdinal,work=session("strict");
      const projections=events.flatMap(e=>{
        if(e.kind!=="c_call_result_admitted"||e.admissionOrdinal>=sourceOrdinal||!record(e.payload)||!isRevisionEnvelope(e.payload.value)||
          e.payload.value.revisionBasis.basisRef!==observed.task.revisionBasisRef||e.payload.value.revisionBasis.basisDigest!==observed.task.revisionBasisDigest)return [];
        const p=projectionFacts(prefix,e,work);
        return p!==null&&canonicalEquals(p.envelope.current.worksite!.workspaceBinding, currentBinding)&&
          canonicalEquals(p.envelope.current.worksite!.workspaceAuthorityBasis, observed.task.workspaceAuthorityBasis)?[p.envelope]:[];
      });
      if(projections.length!==1)return "basis_fork_detected";
      input=projections[0];
    }
    const request=isRevisionEnvelope(input)?input.revisionBasis.request:input;
    if(!isSemanticRevisionSelectionInput(request)&&!isSemanticRevisionRequest(request))return "basis_fork_detected";
    const carried=isRevisionEnvelope(input)?input.current.worksite:isSemanticRevisionRequest(input)?input.currentWorksite:null;
    if(carried!==null&&!canonicalEquals(carried.workspaceBinding, currentBinding))return "basis_fork_detected";
    const history=nativeHistory(prefix,request.parent,request.causes);if(history===null)return "basis_fork_detected";
    // Preserve the exact old same-W admission path; no foreign origin is minted.
    if(history.bases.every(b=>b.workspaceBindingId===currentBinding.bindingId&&b.workspaceBindingDigest===currentBinding.bindingDigest))return "covered";
    if(nativeBinding(prefix,currentBinding,"strict")===null)return "basis_fork_detected";
    const events=runtimeEventBodiesAtPrefix(prefix),work=session("strict");
    const projections=events.flatMap(e=>{
      if(e.kind!=="c_call_result_admitted"||typeof e.basisId!=="string")return [];
      const b=projectExactExecutionBasisAtPrefix(prefix,e.basisId);
      if(b===null||!history.eligible.includes(b.invocationAdmissionRef))return [];
      const p=projectionFacts(prefix,e,work);
      return p!==null&&p.history.seed.basisRef===history.seed.basisRef?[p]:[];
    });
    const bindings=[...history.heads.map(b=>({basis:b,binding:projectAdmittedWorkspaceBindingAtCoordinate(prefix,b.workspaceBindingId,b.workspaceBindingDigest),projection:null as BindingProjectionFacts|null})),
      ...projections.map(p=>({basis:p.basis,binding:p.envelope.current.worksite!.workspaceBinding,projection:p}))];
    // A projection's actual history, not time or byte equality, covers its
    // earlier binding aliases. Every surviving branch must be covered.
    const frontier=bindings.filter(candidate=>!projections.some(p=>p.history.bases.some(b=>b.basisRef===candidate.basis.basisRef)));
    const frontierProjections=new Set(frontier.flatMap(row=>row.projection===null?[]:[row.projection.state.result.admissionEventRef]));
    return frontier.length>0&&frontierProjections.size<=1&&frontier.every(row=>row.binding!==null&&
      projectWorksiteRevisionBindingCover(prefix,row.binding,currentBinding,[...history.bases,row.basis])!==null)?"covered":"basis_fork_detected";
  } catch {return "basis_fork_detected";}
}

/** Actual already admitted projection, selected by its revision identity.
 * This is used only when serializing a pending correspondence into E_D. */
export function projectWorksiteRevisionBindingOrigin(prefix:ValidatedRuntimeEventPrefix,envelope:SemanticRevisionEnvelope | SemanticJobRevisionEnvelope):WorksiteRevisionObservationOrigin|null;
/** @internal */
export function projectWorksiteRevisionBindingOrigin(prefix:RuntimeEventPrefix,envelope:SemanticRevisionEnvelope | SemanticJobRevisionEnvelope):WorksiteRevisionObservationOrigin|null;
export function projectWorksiteRevisionBindingOrigin(prefix:RuntimeEventPrefix,envelope:SemanticRevisionEnvelope | SemanticJobRevisionEnvelope):WorksiteRevisionObservationOrigin|null {
  const events=runtimeEventBodiesAtPrefix(prefix),work=session("strict");
  const matches=events.flatMap(e=>{
    if(e.kind!=="c_call_result_admitted"||!record(e.payload)||!isRevisionEnvelope(e.payload.value)||
      e.payload.value.revisionBasis.basisRef!==envelope.revisionBasis.basisRef||e.payload.value.revisionBasis.basisDigest!==envelope.revisionBasis.basisDigest)return [];
    const p=projectionFacts(prefix,e,work);
    return p!==null&&canonicalEquals(p.envelope.current.worksite, envelope.current.worksite)?[p]:[];
  });
  const match=onlyExactMatch(matches);
  return match.kind==="one"?{kind:"admitted_binding_projection",resultAdmissionEventRef:match.value.state.result.admissionEventRef,
    judgmentEventRef:match.value.state.judgment.admissionEventRef}:null;
}
/** The root seed is an exact earlier input, never the current revision request. */
export function worksiteRevisionSeedMatches(seedBasis: ExecutionBasis, ancestor: unknown,
  current: SemanticWorksiteBasis): boolean {
  const input = seedBasis.rawInputValue;
  if (isSemanticJobEnvelope(ancestor)) return isWorksiteFileParentsSuccess(input) && input.request.jobRef === ancestor.basis.jobRef && input.request.jobDigest === ancestor.basis.jobDigest && canonicalEquals(input.request.workspaceAuthorityBasis, current.workspaceAuthorityBasis) && input.request.workspaceBindingIdentity === current.workspaceBinding.bindingId && input.request.workspaceBindingDigest === current.workspaceBinding.bindingDigest;
  return isSemanticStageEnvelope(input) && isSemanticStageEnvelope(ancestor) && input.worksite !== null &&
    canonicalEquals(input.sourceHandoff, ancestor.sourceHandoff) && canonicalEquals(input.lifecycle, ancestor.lifecycle) &&
    canonicalEquals(input.worksite, ancestor.worksite) &&
    canonicalEquals(input.worksite.workspaceAuthorityBasis, current.workspaceAuthorityBasis) &&
    canonicalEquals(input.worksite.workspaceBinding, current.workspaceBinding);
}
function currentReplacement(prefix: RuntimeEventPrefix, observation: WorksiteObservation) {
  const events = runtimeEventBodiesAtPrefix(prefix);
  const calculus = deriveRuntimeHeldFluentProjection(prefix);
  if (!holdsAt(calculus, constructWorksiteObservationCurrentFluent(observation.observationRef))) return null;
  const candidates = events.flatMap(event => {
    if (event.kind !== "c_call_result_admitted" || !record(event.payload) || event.payload.resultClass !== "success") return [];
    const transition = projectWorksiteTransitionForResult(event, events.filter(row => row.admissionOrdinal < event.admissionOrdinal));
    if (transition?.successorObservation === null || transition === null || !canonicalEquals(transition.successorObservation, observation)) return [];
    const basis = typeof event.basisId === "string" ? projectExactExecutionBasisAtPrefix(prefix, event.basisId) : null;
    const opened = events.filter(row => row.kind === "c_call_fibre_selected" && row.aggregateId === event.aggregateId && row.basisId === event.basisId);
    const evidenceRefs = event.payload.evidenceRefs;
    const evidence = events.filter(row => row.kind === "c_call_evidenced" && row.aggregateId === event.aggregateId && record(row.payload) &&
      row.payload.evidenceClass === "worksite_file_replace" && Array.isArray(evidenceRefs) &&
      evidenceRefs.includes(row.payload.evidenceRef!) && event.causationEventRefs.includes(row.eventId));
    if (basis === null || basis.graphFunctionRef !== WORKSITE_C0_IDS.graphFunctionRef || opened.length !== 1 ||
      !record(opened[0]!.payload) || opened[0]!.payload.implementationRef !== "implementation://abiogenesis/worksite/file-replace-fd@5" || evidence.length !== 1 ||
      basis.workspaceBindingId !== observation.workspaceBindingIdentity) return [];
    return [{ basis, event, evidence: evidence[0]! }];
  });
  return candidates.at(-1) ?? null;
}
/** Rehydrates the exact recorded origin and rejects all native supersession. */
export function worksiteRevisionOriginSurvives(prefix: ValidatedRuntimeEventPrefix,
  row: WorksiteRevisionDependencyObservation): boolean;
/** @internal */
export function worksiteRevisionOriginSurvives(prefix: RuntimeEventPrefix,
  row: WorksiteRevisionDependencyObservation, question?: ProductTruthQuestion): boolean;
export function worksiteRevisionOriginSurvives(prefix: RuntimeEventPrefix,
  row: WorksiteRevisionDependencyObservation, question: ProductTruthQuestion = "strict"): boolean {
  const events = runtimeEventBodiesAtPrefix(prefix), origin = row.origin;
  if (origin.kind === "admitted_initial_job_bridge") {
    const event = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "id:" + origin.resultAdmissionEventRef), e => e.kind === "c_call_result_admitted" && e.eventId === origin.resultAdmissionEventRef));
    const coordinate = event === null ? null : coordinateFor(events, event);
    const result = coordinate === null ? null : projectWorksiteRevisionNativeResult(prefix, coordinate);
    const value = result?.result.value;
    if (result === null || result.cCall.implementationRef !== SEMANTIC_STAGE_IDS.jobBridgeImplementationRef ||
      result.result.resultClass !== "success" || result.judgment.judgment !== "advance" ||
      result.judgment.admissionEventRef !== origin.judgmentEventRef || !isWorksitePreparationInput(value) ||
      value.kind !== "worksite_command_preparation_input" || value.readDependencyBasis === undefined) return false;
    const source = semanticJobReadDependenciesAtPrefix(prefix, value.readDependencyBasis);
    const member = value.readDependencyBasis.members.find(member => member.sourceMemberRef === row.designTargetRef);
    return source !== null && source.result.resultRef === result.result.resultRef && member !== undefined &&
      canonicalEquals(member.subject, row.subject) && canonicalEquals(member.observation, row.observation) &&
      !invalidatedAcrossBindings(prefix, row.subject, source.contextEvent.admissionOrdinal,question);
  }
  if(origin.kind==="admitted_binding_projection"){
    const result=exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "id:" + origin.resultAdmissionEventRef),e=>e.kind==="c_call_result_admitted"&&e.eventId===origin.resultAdmissionEventRef));
    const p=result===null?null:projectionFacts(prefix,result,session(question));
    return p!==null&&p.state.judgment.admissionEventRef===origin.judgmentEventRef&&
      p.envelope.current.worksite!.targets.filter(t=>canonicalEquals(t.target.subject, row.subject)&&canonicalEquals(t.target.predecessorObservation, row.observation)).length===1&&
      !invalidatedAcrossBindings(prefix,row.subject,p.ordinal,question);
  }
  const replacement = currentReplacement(prefix, row.observation);
  if (origin.kind === "admitted_replacement") return replacement !== null &&
    replacement.event.eventId === origin.resultAdmissionEventRef && replacement.evidence.eventId === origin.evidenceEventRef&&
    !invalidatedAcrossBindings(prefix,row.subject,replacement.event.admissionOrdinal,question);
  // Once there is a native successor, the old input is not an alternative origin.
  if (replacement !== null) return false;
  const event = indexedRuntimeEvents(prefix, "id:" + origin.basisAdmissionEventRef).find(e => e.eventId === origin.basisAdmissionEventRef && e.kind === "basis_admitted");
  const basis = event?.basisId === undefined ? null : projectExactExecutionBasisAtPrefix(prefix, event.basisId);
  const worksite = basis === null ? null : inputWorksite(basis,prefix);
  if (basis === null || worksite === null || basis.rawInputAdmissionRef !== origin.inputAdmissionRef || basis.rawInputDigest !== origin.inputDigest ||
    !worksite.targets.some(t => canonicalEquals(t.target.subject, row.subject) && canonicalEquals(t.target.predecessorObservation, row.observation))) return false;
  // Failure after publication terminates O0 but creates no successful O1.
  return !invalidatedAcrossBindings(prefix,row.subject,event!.admissionOrdinal,question)&&!indexedRuntimeEvents(prefix, "kind:" + "c_call_result_admitted").some(e => e.kind === "c_call_result_admitted" &&
    projectWorksiteTransitionForResult(e, events.filter(p => p.admissionOrdinal < e.admissionOrdinal))?.before === row.observation.observationRef);
}
export function projectWorksiteRevisionOrigins(prefix: ValidatedRuntimeEventPrefix, seedBasis: ExecutionBasis,
  historical: SemanticWorksiteBasis, current: SemanticWorksiteBasis, eligibleInvocationRefs: readonly string[]): readonly WorksiteRevisionOriginProof[] | null;
/** @internal */
export function projectWorksiteRevisionOrigins(prefix: RuntimeEventPrefix, seedBasis: ExecutionBasis,
  historical: SemanticWorksiteBasis, current: SemanticWorksiteBasis, eligibleInvocationRefs: readonly string[]): readonly WorksiteRevisionOriginProof[] | null;
export function projectWorksiteRevisionOrigins(prefix: RuntimeEventPrefix, seedBasis: ExecutionBasis,
  historical: SemanticWorksiteBasis, current: SemanticWorksiteBasis, eligibleInvocationRefs: readonly string[]): readonly WorksiteRevisionOriginProof[] | null {
  const seed = inputWorksite(seedBasis,prefix);
  if (seed === null || current.targets.length !== historical.targets.length) return null;
  const prefixEvents=runtimeEventBodiesAtPrefix(prefix);
  const crossedHistory=prefixEvents.some(e=>{
    if(e.kind!=="basis_admitted"||typeof e.basisId!=="string")return false;
    const b=projectExactExecutionBasisAtPrefix(prefix,e.basisId);
    return b!==null&&eligibleInvocationRefs.includes(b.invocationAdmissionRef)&&
      (b.workspaceBindingId!==current.workspaceBinding.bindingId||b.workspaceBindingDigest!==current.workspaceBinding.bindingDigest);
  });
  if(!canonicalEquals(seed.workspaceBinding, current.workspaceBinding)||crossedHistory){
    const events=runtimeEventBodiesAtPrefix(prefix),bases=events.flatMap(e=>{
      const b=e.kind==="basis_admitted"&&typeof e.basisId==="string"?projectExactExecutionBasisAtPrefix(prefix,e.basisId):null;
      return b!==null&&eligibleInvocationRefs.includes(b.invocationAdmissionRef)?[b]:[];
    });
    const origins=deriveCurrentOrigins(prefix,seedBasis,historical,current,eligibleInvocationRefs,bases,session("strict"));
    return origins===null?null:origins.map(origin=>canonicalEquals(origin.worksite.workspaceBinding, current.workspaceBinding)?origin.origin:
      {kind:"pending_binding_correspondence" as const,source:origin.origin});
  }
  const origins: WorksiteRevisionObservationOrigin[] = [];
  for (const [ordinal, row] of current.targets.entries()) {
    const prior = historical.targets[ordinal];
    if (prior === undefined || row.role !== prior.role || row.target.subject.relativePath !== prior.target.subject.relativePath ||
      !canonicalEquals(row.target.territory.operations, prior.target.territory.operations) || row.target.territory.relativeRoot !== prior.target.territory.relativeRoot) return null;
    const observation = row.target.predecessorObservation;
    const replacement = currentReplacement(prefix, observation);
    let origin: WorksiteRevisionObservationOrigin;
    if (replacement !== null) {
      if (!eligibleInvocationRefs.includes(replacement.basis.invocationAdmissionRef) ||
        !record(replacement.basis.rawInputValue.subject) || !canonicalEquals(replacement.basis.rawInputValue.subject, row.target.subject)) return null;
      origin = { kind: "admitted_replacement", resultAdmissionEventRef: replacement.event.eventId, evidenceEventRef: replacement.evidence.eventId };
      if(invalidatedAcrossBindings(prefix,row.target.subject,replacement.event.admissionOrdinal,"strict"))return null;
    } else {
      if (!seed.targets.some(t => canonicalEquals(t.target.subject, row.target.subject) && canonicalEquals(t.target.predecessorObservation, observation) && t.base64 === row.base64)) return null;
      origin = { kind: "admitted_input", basisAdmissionEventRef: seedBasis.admissionEventRef,
        inputAdmissionRef: seedBasis.rawInputAdmissionRef, inputDigest: seedBasis.rawInputDigest };
      // The initial file/absence seed is allowed only while no native transition invalidates it.
      const events = runtimeEventBodiesAtPrefix(prefix);
      const initial=indexedRuntimeEvents(prefix, "id:" + seedBasis.admissionEventRef).find(e=>e.eventId===seedBasis.admissionEventRef);
      if(initial===undefined||invalidatedAcrossBindings(prefix,row.target.subject,initial.admissionOrdinal,"strict")||indexedRuntimeEvents(prefix, "kind:" + "c_call_result_admitted").some(e => e.kind === "c_call_result_admitted" &&
        projectWorksiteTransitionForResult(e, events.filter(p => p.admissionOrdinal < e.admissionOrdinal))?.before === observation.observationRef)) return null;
    }
    if (observation.state === "file" && (sha256Bytes(Buffer.from(row.base64, "base64")) !== observation.fileDigest ||
      Buffer.from(row.base64, "base64").length !== observation.byteLength)) return null;
    origins.push(origin);
  }
  return origins;
}
/** Exact physical observation is a check, never a replacement origin. */
export function worksiteRevisionPhysicalMatches(current: SemanticWorksiteBasis): boolean {
  try {
    const root = current.workspaceAuthorityBasis.canonicalRoot;
    if (resolve(root) !== root || realpathSync(root) !== root) return false;
    return current.targets.every(row => {
      const path = resolve(root, row.target.subject.relativePath);
      if (!pathStrictlyWithin(pathRelation(root, path))) return false;
      let cursor = root;
      for (const part of row.target.subject.relativePath.split("/").slice(0, -1)) {
        cursor = resolve(cursor, part);
        if (realpathSync(cursor) !== cursor || !lstatSync(cursor).isDirectory() || lstatSync(cursor).isSymbolicLink()) return false;
      }
      let observed: ReturnType<typeof constructWorksiteObservation>;
      try {
        const stat = lstatSync(path), bytes = readFileSync(path);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || realpathSync(path) !== path || bytes.toString("base64") !== row.base64) return false;
        observed = constructWorksiteObservation({ subject: row.target.subject, state: "file", fileIdentity: `${stat.dev}:${stat.ino}`,
          fileDigest: sha256Bytes(bytes), byteLength: bytes.length });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT" || row.base64 !== "") return false;
        observed = constructWorksiteObservation({ subject: row.target.subject, state: "absent" });
      }
      return isWorksiteObservation(observed) && canonicalEquals(observed, row.target.predecessorObservation);
    });
  } catch { return false; }
}
/** Read-only, non-minting currentness check for a receipt-backed retained vector. */
export function retainedWorksitePhysicalMatches(authority:WorkspaceAuthorityBasis,
  rows:readonly Readonly<{subject:WorksiteSubject;observation:WorksiteObservation}>[]):boolean {
  try{
    const root=authority.canonicalRoot;
    if(resolve(root)!==root||realpathSync(root)!==root)return false;
    return rows.every(row=>{
      const target=resolve(root,row.subject.relativePath);
      if(!pathStrictlyWithin(pathRelation(root,target))||row.observation.state!=="file")return false;
      let cursor=root;
      for(const part of row.subject.relativePath.split("/").slice(0,-1)){
        cursor=resolve(cursor,part);const stat=lstatSync(cursor);
        if(!stat.isDirectory()||stat.isSymbolicLink()||realpathSync(cursor)!==cursor)return false;
      }
      const stat=lstatSync(target),bytes=readFileSync(target);
      return stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1&&realpathSync(target)===target&&
        canonicalEquals(
          constructWorksiteObservation({subject:row.subject,state:"file",fileIdentity:`${stat.dev}:${stat.ino}`,
            fileDigest:sha256Bytes(bytes),byteLength:bytes.length}),
          row.observation,
        );
    });
  }catch{return false;}
}
export function worksiteExecutionSourcesCurrent(prefix: ValidatedRuntimeEventPrefix, task: WorksiteExecutionTask): boolean;
/** @internal */
export function worksiteExecutionSourcesCurrent(prefix: RuntimeEventPrefix, task: WorksiteExecutionTask, question?: ProductTruthQuestion): boolean;
export function worksiteExecutionSourcesCurrent(prefix: RuntimeEventPrefix, task: WorksiteExecutionTask, question: ProductTruthQuestion = "strict"): boolean {
  // Observed source currentness is relative to its exact root input admission,
  // authenticated by execution_basis; this ancestor-only projection grants none.
  if (isObservedWorksiteCommandExecutionTask(task)) return false;
  if (isNativeWorksiteCommandExecutionTask(task)) return projectNativeWorkCommandSourceAtPrefix(prefix, task) !== null;
  const calculus = deriveRuntimeHeldFluentProjection(prefix);
  const readBasis = task.kind === "worksite_command_execution_task" ? task.readDependencyBasis : undefined;
  const readSource = readBasis === undefined ? null : semanticJobReadDependenciesAtPrefix(prefix, readBasis);
  if (readBasis !== undefined && readSource === null) return false;
  return worksiteExecutionSources(task).every(row => {
    if (readBasis?.members.some(member => member.sourceMemberRef === ("sourceMemberRef" in row ? row.sourceMemberRef : null))) {
      const member = readBasis.members.find(member => member.subject.subjectRef === row.subject.subjectRef);
      return member !== undefined && canonicalEquals(member.observation, row.observation) &&
        !invalidatedAcrossBindings(prefix, row.subject, readSource!.contextEvent.admissionOrdinal,question);
    }
    if("source" in row && row.source.kind === "retained_dependency")return worksiteRevisionOriginSurvives(prefix,
      {designTargetRef:row.designTargetRef,subject:row.subject,observation:row.observation,origin:row.source.origin},question);
    if(!holdsAt(calculus,constructWorksiteObservationCurrentFluent(row.observation.observationRef)))return false;
    const replacement=currentReplacement(prefix,row.observation);
    // The unchanged closed C1/C3 source gate authenticates these producers.
    // Conjoin cross-W invalidation; an old binding alias is not current merely
    // because its W-qualified Event Calculus fluent was not the later O0.
    return replacement===null||!invalidatedAcrossBindings(prefix,row.subject,replacement.event.admissionOrdinal,question);
  });
}
