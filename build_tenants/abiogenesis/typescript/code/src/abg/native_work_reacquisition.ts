import { isDeepStrictEqual } from "node:util";
/** Deterministic preparation of an existing closed native child, not new authorship. */
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { materializeGraph } from "../gtl/materialize.js";
import { nativeWorkReacquisitionGraphFunction } from "../gtl/worksite_command_execution.js";
import { NATIVE_WORK_REACQUISITION_IDS as ids, constructNativeWorksiteCommandExecutionTask,
  isNativeWorksiteCommandReacquisitionRequest,
  type NativeWorksiteCommandReacquisitionRequest, type NativeWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { observeWorksiteContext } from "../product/worksite_operations.js";
import { readRuntimeEventsAtDurablePrefix, authenticateRuntimePrefixAncestry, reidentifyHistoricalDurablePrefixCoordinate,
  runtimeEventPhysicalPrefix, type DurablePrefixCoordinate } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix, runtimeEventsFromValidatedPrefix, runtimePrefixComputation, unscopedRuntimeEventPrefix, isImmutableRuntimeValue,
  validatedRuntimeEventPrefixThroughEvent, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectClosedGraphCallTerminalAtDurablePrefix } from "./project_read_ports.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { projectWorksiteRevisionBindingCover } from "./worksite_revision.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix, projectAdmittedCCallStateAtPrefix } from "./c_call.js";
import { rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { projectNativeWorkCommandSourceAtPrefix } from "./native_worksite_execution.js";
import { NATIVE_WORKSPACE_WORK_IDS as native } from "../product/native_workspace_work.js";
import { constructAbgHistoricalDeclarationReference, hasUniqueHistoricalDeclarationDependencies,
  type AbgHistoricalDeclarationProof, type AbgHistoricalGraphCallSourceResource } from "./terminal_result_contracts.js";
const same = (a: unknown, b: unknown) => a === b || isDeepStrictEqual(a, b) || canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
const hash = (a: unknown) => sha256Canonical(a as JsonValue);
const record = (v: unknown): v is Record<string, JsonValue> => v !== null && typeof v === "object" && !Array.isArray(v);
const one = <T>(rows: readonly T[], predicate: (row: T) => boolean): T | null => { const selected = rows.filter(predicate); return selected.length === 1 ? selected[0]! : null; };
export interface NativeWorkReacquisitionBasis { readonly predecessorPrefix: DurablePrefixCoordinate; readonly cCallRef: string }
/** Resolve untrusted preimages before consulting retained establishment facts.
 * A prior successful preparation cannot supply a missing or different resource. */
function declarationProofFor(request: NativeWorksiteCommandReacquisitionRequest,
  resource?: AbgHistoricalGraphCallSourceResource): AbgHistoricalDeclarationProof | null {
  if (request.source.declarationReference === undefined) return request.source.declarationProof;
  if (resource === undefined || !hasUniqueHistoricalDeclarationDependencies(resource)) return null;
  return one([resource.declarationProof, ...(resource.declarationDependencies ?? [])], proof =>
    same(constructAbgHistoricalDeclarationReference(proof), request.source.declarationReference));
}
/** Local facts from one already admitted request and exact current prefix.
 * The historical terminal and latest source checks retain their own owners. */
function deriveNativeWorkReacquisitionTask(current: DurablePrefixCoordinate,
  prefix: ValidatedRuntimeEventPrefix, request: NativeWorksiteCommandReacquisitionRequest,
  nativeBasis: NativeWorkReacquisitionBasis, declarationProof: AbgHistoricalDeclarationProof) {
  if (!authenticateRuntimePrefixAncestry(request.source.prefix, current)) return null;
  const historical = reidentifyHistoricalDurablePrefixCoordinate(current, request.source.prefix);
  const terminal = projectClosedGraphCallTerminalAtDurablePrefix(historical, request.source.graphCallRef, declarationProof);
  if (terminal === null || terminal.producer.graphFunction.ref !== native.graphFunctionRef || !same(terminal.value, request.sourceNativeWork) ||
    terminal.producer.cCallRef !== request.sourceNativeWork.provenance.cCallRef) return null;
  const sourceBasis = projectExactExecutionBasisAtPrefix(prefix, terminal.producer.executionBasis.ref);
  const environment = projectExactPrefixWorkspaceEnvironment(current, { ref: request.workspaceBinding.bindingId, digest: request.workspaceBinding.bindingDigest });
  if (sourceBasis === null || environment.kind !== "exact_prefix_workspace_environment" ||
    !same(environment.workspaceAuthorityBasis, request.workspaceAuthorityBasis) || !same(environment.workspaceBinding, request.workspaceBinding)) return null;
  const covers = projectWorksiteRevisionBindingCover(prefix, request.sourceNativeWork.task.workspaceBinding, request.workspaceBinding, [sourceBasis]);
  if (covers === null) return null;
  const task = constructNativeWorksiteCommandExecutionTask({ ...request,
    sourceReacquisition: { request, nativeBasis, bindingCoverEventRefs: covers } });
  const source = projectNativeWorkCommandSourceAtPrefix(prefix, task);
  return source !== null && source.sourceResult.eventId === terminal.producer.resultAdmissionEventRef &&
    source.sourceJudgment.eventId === terminal.producer.judgmentAdmissionEventRef ? { task, source } : null;
}
/** The source selector is evidence. R10 owns terminal scope; the binding-cover
 * owner and current native source projection own its present applicability. */
export function projectNativeWorkReacquisitionTask(current: DurablePrefixCoordinate, request: NativeWorksiteCommandReacquisitionRequest,
  nativeBasis: NativeWorkReacquisitionBasis, historicalSource?: AbgHistoricalGraphCallSourceResource): NativeWorksiteCommandExecutionTask | null {
  try {
    if (!isNativeWorksiteCommandReacquisitionRequest(request)) return null;
    const declarationProof = declarationProofFor(request, historicalSource);
    if (declarationProof === null) return null;
    const prefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(current));
    return deriveNativeWorkReacquisitionTask(current, prefix, request, nativeBasis, declarationProof)?.task ?? null;
  } catch { return null; }
}
const REACQUISITION_PROOF = Symbol("native_reacquisition_proof");
/** Immutable preparation facts survive ordinary Result copying only inside
 * the existing authenticated prefix lineage. Current C2 invalidators remain
 * in projectNativeWorkCommandSourceAtPrefix and its same-Run join. */
export function authenticateNativeWorkReacquisition(basis: NativeWorkReacquisitionBasis, input: unknown, requireCurrent = false,
  historicalSource?: AbgHistoricalGraphCallSourceResource) {
  try {
    if (!isNativeWorksiteCommandReacquisitionRequest(input)) return null;
    const declarationProof = declarationProofFor(input, historicalSource);
    if (declarationProof === null) return null;
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix, { requireCurrent });
    const prefix = selectValidatedRuntimeEventPrefix(events);
    const facts = runtimePrefixComputation(prefix, REACQUISITION_PROOF,
      () => new Map<string, { owner: NonNullable<ReturnType<typeof deriveAuthenticatedNativeWorkReacquisition>>;
        declarationProof: AbgHistoricalDeclarationProof }>());
    const key = basis.predecessorPrefix.coordinateDigest + ":" + basis.cCallRef, known = facts.get(key);
    if (known !== undefined && known.declarationProof === declarationProof && same(known.owner.task.sourceReacquisition!.request, input)) return { ...known.owner };
    const owner = deriveAuthenticatedNativeWorkReacquisition(basis, input, prefix, declarationProof);
    // Preserve the editable projection API while keeping retained authority private.
    if (owner !== null && isImmutableRuntimeValue(declarationProof)) facts.set(key, { owner: Object.freeze({ ...owner }), declarationProof });
    return owner;
  } catch { return null; }
}
/** Current ordinary CCall owner. A supplied prefix or output never grants this occurrence. */
function projectNativeWorkReacquisitionOccurrence(basis: NativeWorkReacquisitionBasis, input: unknown, prefix: ValidatedRuntimeEventPrefix) {
  try {
    if (!isNativeWorksiteCommandReacquisitionRequest(input)) return null;
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const opened = one(events, e => e.kind === "c_call_opened" && e.aggregateId === basis.cCallRef);
    const execution = opened?.basisId == null ? null : projectExactExecutionBasisAtPrefix(prefix, opened.basisId);
    const gf = nativeWorkReacquisitionGraphFunction();
    if (execution === null || execution.graphFunctionRef !== gf.name || execution.graphFunctionDigest !== hash(gf) || !same(execution.rawInputValue, input) ||
      execution.workspaceBindingId !== input.workspaceBinding.bindingId || execution.workspaceBindingDigest !== input.workspaceBinding.bindingDigest) return null;
    const graph = materializeGraph(gf, { invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
      admittedInputDigest: execution.rawInputDigest, admittedInput: input as unknown as Readonly<Record<string, JsonValue>> });
    const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCallRef);
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.rootImplementationSetRef);
    const invocation = projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
    if (graph.materializationDigest !== execution.graphDigest || graph.materializationRef !== execution.graphRef || call === null ||
      call.basisId !== execution.basisRef || call.callClass !== "leaf" || call.regime !== "F_D" || call.implementationRef !== ids.implementationRef ||
      call.implementationBindingRef !== ids.implementationBindingRef || call.judgmentPredicateRef !== ids.predicateRef ||
      set === null || set.implementationSetDigest !== execution.rootImplementationSetDigest ||
      set.rows.filter(r => r.graphFunctionRef === call.graphFunctionRef && r.programLocusRef === call.programLocusRef &&
        r.implementationRef === ids.implementationRef && r.implementationBindingRef === ids.implementationBindingRef &&
        r.inputContractRef === call.inputContractRef && r.outputContractRef === call.outputContractRef).length !== 1 ||
      invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.capabilityGrant)) return null;
    return { call, execution, prefix };
  } catch { return null; }
}
function deriveAuthenticatedNativeWorkReacquisition(basis: NativeWorkReacquisitionBasis, input: NativeWorksiteCommandReacquisitionRequest,
  prefix: ValidatedRuntimeEventPrefix, declarationProof: AbgHistoricalDeclarationProof) {
  const occurrence = projectNativeWorkReacquisitionOccurrence(basis, input, prefix);
  if (occurrence === null || projectCCallCarrierPhaseAtPrefix(prefix, occurrence.call)?.phase !== "selected_no_evidence") return null;
  const derived = deriveNativeWorkReacquisitionTask(basis.predecessorPrefix, prefix, input, basis, declarationProof);
  return derived !== null && derived.source.sourceResult.runId !== occurrence.call.runId
    ? { ...occurrence, task: derived.task } : null;
}
/** Read-only existing physical observation owner; all read-scope files, not just C2 sources. */
export async function nativeWorkReacquisitionContextCurrent(request: NativeWorksiteCommandReacquisitionRequest): Promise<boolean> {
  const { readRoots, maxFiles, maxBytes } = request.currentContext;
  return same(await observeWorksiteContext({ workspaceAuthorityBasis: request.workspaceAuthorityBasis,
    workspaceBinding: request.workspaceBinding, readRoots, maxFiles, maxBytes }), request.currentContext);
}
/** The optional owner coordinate only reidentifies an already authenticated
 * historical preparation cut; it confers no current-source or effect authority. */
export function nativeWorkReacquisitionResultMatches(input: unknown, value: unknown, currentOwnerPrefix?: DurablePrefixCoordinate,
  historicalSource?: AbgHistoricalGraphCallSourceResource): boolean {
  if (!record(value) || !record(value.sourceReacquisition) || !record(value.sourceReacquisition.nativeBasis) ||
      !same(input, value.sourceReacquisition.request)) return false;
  try {
    const original = value.sourceReacquisition.nativeBasis as unknown as NativeWorkReacquisitionBasis;
    const basis = currentOwnerPrefix === undefined ? original : { ...original,
      predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix) };
    const owner = authenticateNativeWorkReacquisition(basis, input, false, historicalSource);
    return owner !== null && same(owner.task, value);
  } catch { return false; }
}
/** Authenticated current-Run preparation carries historical child provenance.
 * The original F_P result remains in its own Run and invocation. */
function sameEventResource(a: DurablePrefixCoordinate, b: DurablePrefixCoordinate): boolean {
  return a.eventLogRef === b.eventLogRef && a.storeIdentity.device === b.storeIdentity.device && a.storeIdentity.inode === b.storeIdentity.inode;
}
/** Recover an exact recorded cut from already decoded physical coordinates.
 * No declaration resource or second journal read enters admitted consumption. */
function preparationCut(prefix: ValidatedRuntimeEventPrefix, coordinate: DurablePrefixCoordinate): ValidatedRuntimeEventPrefix | null {
  const authority = unscopedRuntimeEventPrefix(prefix), events = runtimeEventsFromValidatedPrefix(authority);
  let low = 1, high = events.length;
  while (low <= high) {
    const count = (low + high) >>> 1, physical = runtimeEventPhysicalPrefix(events.slice(0, count));
    if (physical.byteLength < coordinate.prefixLength) low = count + 1;
    else if (physical.byteLength > coordinate.prefixLength) high = count - 1;
    else return physical.digest === coordinate.prefixDigest
      ? validatedRuntimeEventPrefixThroughEvent(authority, events[count - 1]!.eventId) : null;
  }
  return null;
}

export function projectReacquiredNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate) {
  try {
  const proof = input.task.sourceReacquisition;
  if (proof === undefined || !isNativeWorksiteCommandReacquisitionRequest(proof.request) ||
    !same(constructNativeWorksiteCommandExecutionTask({ ...proof.request, sourceReacquisition: proof }), input.task) ||
    !sameEventResource(proof.request.source.prefix, proof.nativeBasis.predecessorPrefix) ||
    (currentOwnerPrefix !== undefined && (!sameEventResource(proof.nativeBasis.predecessorPrefix, currentOwnerPrefix) ||
      proof.nativeBasis.predecessorPrefix.prefixLength > currentOwnerPrefix.prefixLength))) return null;
  const preparedPrefix = preparationCut(prefix, proof.nativeBasis.predecessorPrefix);
  if (preparedPrefix === null) return null;
  const occurrence = projectNativeWorkReacquisitionOccurrence(proof.nativeBasis, proof.request, preparedPrefix);
  if (occurrence === null || projectCCallCarrierPhaseAtPrefix(preparedPrefix, occurrence.call)?.phase !== "selected_no_evidence") return null;
  const { execution: basis, call } = occurrence;
  const historicalPrefix = preparationCut(preparedPrefix, proof.request.source.prefix);
  const original = historicalPrefix === null ? null : projectNativeWorkCommandSourceAtPrefix(historicalPrefix, input.task);
  if (original === null || original.sourceResult.graphCallId !== proof.request.source.graphCallRef ||
    original.sourceResult.runId === call.runId) return null;
  const recordedCover = projectWorksiteRevisionBindingCover(preparedPrefix, input.task.sourceNativeWork.task.workspaceBinding,
    input.task.workspaceBinding, [original.sourceBasis]);
  if (recordedCover === null || !same(recordedCover, proof.bindingCoverEventRefs)) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const result = one(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === proof.nativeBasis.cCallRef);
  const judgment = one(events, e => e.kind === "c_call_judged" && e.aggregateId === proof.nativeBasis.cCallRef);
  const parentCall = one(events, e => e.kind === "c_call_opened" && e.aggregateId === input.parentCCallRef && e.basisId === input.parentBasis.basisRef);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, input.parentBasis.invocationAdmissionRef);
  if (basis.invocationAdmissionRef !== input.parentBasis.invocationAdmissionRef || basis.invocationRef !== input.parentBasis.invocationRef ||
    basis.rootImplementationSetRef !== input.parentBasis.rootImplementationSetRef || basis.rootImplementationSetDigest !== input.parentBasis.rootImplementationSetDigest ||
    result === null || judgment === null || result.runId !== input.runId || result.runId !== call.runId ||
    result.graphCallId !== call.graphCallId || result.basisId !== basis.basisRef || !record(result.payload) ||
    result.payload.resultClass !== "success" || !same(result.payload.value, input.task) || result.payload.valueDigest !== hash(input.task) ||
    result.payload.contractRef !== call.outputContractRef || !Array.isArray(result.payload.evidenceRefs) || result.payload.evidenceRefs.length !== 1 ||
    judgment.runId !== call.runId || judgment.graphCallId !== call.graphCallId || judgment.basisId !== basis.basisRef ||
    !record(judgment.payload) || judgment.payload.predicateRef !== ids.predicateRef || judgment.payload.contractRef !== call.judgmentContractRef ||
    judgment.payload.judgment !== "advance" || judgment.payload.resultRef !== result.payload.resultRef ||
    judgment.payload.resultDigest !== result.payload.resultDigest || !judgment.causationEventRefs.includes(result.eventId) ||
    parentCall === null || parentCall.runId !== input.runId || parentCall.admissionOrdinal <= judgment.admissionOrdinal ||
    !record(parentCall.payload) || parentCall.payload.callClass !== "workflow" ||
    parentCall.payload.childGraphFunctionRef !== "graph-function://abiogenesis/worksite/command-execution@5" ||
    invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.task.capabilityGrant)) return null;
  const evidenceRefs = result.payload.evidenceRefs;
  const evidence = one(events, e => e.kind === "c_call_evidenced" && e.aggregateId === call.cCallRef &&
    e.basisId === basis.basisRef && e.runId === call.runId && e.graphCallId === call.graphCallId && record(e.payload) &&
    evidenceRefs.includes(e.payload.evidenceRef!));
  if (evidence === null || !record(evidence.payload) || evidence.payload.evidenceClass !== "deterministic" ||
    evidence.payload.contractRef !== call.evidenceContractRef || evidence.payload.implementationRef !== ids.implementationRef ||
    evidence.payload.inputDigest !== basis.rawInputDigest || evidence.payload.outputDigest !== result.payload.valueDigest ||
    projectAdmittedCCallStateAtPrefix(prefix, call as unknown as Readonly<Record<string, JsonValue>>,
      { ...result.payload, kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: result.eventId },
      { ...judgment.payload, kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: judgment.eventId }) === null) return null;
  const source = projectNativeWorkCommandSourceAtPrefix(prefix, input.task);
  if (source === null) return null;
  const covers = projectWorksiteRevisionBindingCover(prefix, input.task.sourceNativeWork.task.workspaceBinding, input.task.workspaceBinding, [source.sourceBasis]);
  return covers !== null && proof.bindingCoverEventRefs.every(ref => covers.includes(ref)) ? source : null;
  } catch { return null; }
}
