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
import { readRuntimeEventsAtDurablePrefix, authenticateRuntimePrefixAncestry, reidentifyHistoricalDurablePrefixCoordinate, type DurablePrefixCoordinate } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix, runtimeEventsFromValidatedPrefix, runtimePrefixComputation, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectClosedGraphCallTerminalAtDurablePrefix } from "./project_read_ports.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { projectWorksiteRevisionBindingCover } from "./worksite_revision.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix } from "./c_call.js";
import { rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { projectNativeWorkCommandSourceAtPrefix } from "./native_worksite_execution.js";
import { NATIVE_WORKSPACE_WORK_IDS as native } from "../product/native_workspace_work.js";
const same = (a: unknown, b: unknown) => a === b || isDeepStrictEqual(a, b) || canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
const hash = (a: unknown) => sha256Canonical(a as JsonValue);
const record = (v: unknown): v is Record<string, JsonValue> => v !== null && typeof v === "object" && !Array.isArray(v);
const one = <T>(rows: readonly T[], predicate: (row: T) => boolean): T | null => { const selected = rows.filter(predicate); return selected.length === 1 ? selected[0]! : null; };
export interface NativeWorkReacquisitionBasis { readonly predecessorPrefix: DurablePrefixCoordinate; readonly cCallRef: string }
/** Local facts from one already admitted request and exact current prefix.
 * The historical terminal and latest source checks retain their own owners. */
function deriveNativeWorkReacquisitionTask(current: DurablePrefixCoordinate,
  prefix: ValidatedRuntimeEventPrefix, request: NativeWorksiteCommandReacquisitionRequest,
  nativeBasis: NativeWorkReacquisitionBasis) {
  if (!authenticateRuntimePrefixAncestry(request.source.prefix, current)) return null;
  const historical = reidentifyHistoricalDurablePrefixCoordinate(current, request.source.prefix);
  const terminal = projectClosedGraphCallTerminalAtDurablePrefix(historical, request.source.graphCallRef, request.source.declarationProof);
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
  nativeBasis: NativeWorkReacquisitionBasis): NativeWorksiteCommandExecutionTask | null {
  try {
    if (!isNativeWorksiteCommandReacquisitionRequest(request)) return null;
    const prefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(current));
    return deriveNativeWorkReacquisitionTask(current, prefix, request, nativeBasis)?.task ?? null;
  } catch { return null; }
}
const REACQUISITION_PROOF = Symbol("native_reacquisition_proof");
/** Immutable preparation facts survive ordinary Result copying only inside
 * the existing authenticated prefix lineage. Current C2 invalidators remain
 * in projectNativeWorkCommandSourceAtPrefix and its same-Run join. */
export function authenticateNativeWorkReacquisition(basis: NativeWorkReacquisitionBasis, input: unknown, requireCurrent = false) {
  try {
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix, { requireCurrent });
    const prefix = selectValidatedRuntimeEventPrefix(events);
    const facts = runtimePrefixComputation(prefix, REACQUISITION_PROOF,
      () => new Map<string, NonNullable<ReturnType<typeof deriveAuthenticatedNativeWorkReacquisition>>>());
    const key = basis.predecessorPrefix.coordinateDigest + ":" + basis.cCallRef, known = facts.get(key);
    if (known !== undefined && same(known.task.sourceReacquisition!.request, input)) return { ...known };
    const owner = deriveAuthenticatedNativeWorkReacquisition(basis, input, prefix);
    // Preserve the editable projection API while keeping retained authority private.
    if (owner !== null) facts.set(key, Object.freeze({ ...owner }));
    return owner;
  } catch { return null; }
}
/** Current ordinary CCall owner. A supplied prefix or output never grants this occurrence. */
function deriveAuthenticatedNativeWorkReacquisition(basis: NativeWorkReacquisitionBasis, input: unknown, prefix: ValidatedRuntimeEventPrefix) {
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
      call.implementationBindingRef !== ids.implementationBindingRef || projectCCallCarrierPhaseAtPrefix(prefix, call)?.phase !== "selected_no_evidence" ||
      set === null || set.implementationSetDigest !== execution.rootImplementationSetDigest ||
      set.rows.filter(r => r.graphFunctionRef === call.graphFunctionRef && r.programLocusRef === call.programLocusRef &&
        r.implementationRef === ids.implementationRef && r.implementationBindingRef === ids.implementationBindingRef &&
        r.inputContractRef === call.inputContractRef && r.outputContractRef === call.outputContractRef).length !== 1 ||
      invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.capabilityGrant)) return null;
    const derived = deriveNativeWorkReacquisitionTask(basis.predecessorPrefix, prefix, input, basis);
    return derived !== null && derived.source.sourceResult.runId !== call.runId
      ? { task: derived.task, call, execution, prefix } : null;
  } catch { return null; }
}
/** Read-only existing physical observation owner; all read-scope files, not just C2 sources. */
export async function nativeWorkReacquisitionContextCurrent(request: NativeWorksiteCommandReacquisitionRequest): Promise<boolean> {
  const { readRoots, maxFiles, maxBytes } = request.currentContext;
  return same(await observeWorksiteContext({ workspaceAuthorityBasis: request.workspaceAuthorityBasis,
    workspaceBinding: request.workspaceBinding, readRoots, maxFiles, maxBytes }), request.currentContext);
}
/** The optional owner coordinate only reidentifies an already authenticated
 * historical preparation cut; it confers no current-source or effect authority. */
export function nativeWorkReacquisitionResultMatches(input: unknown, value: unknown, currentOwnerPrefix?: DurablePrefixCoordinate): boolean {
  if (!record(value) || !record(value.sourceReacquisition) || !record(value.sourceReacquisition.nativeBasis) ||
      !same(input, value.sourceReacquisition.request)) return false;
  try {
    const original = value.sourceReacquisition.nativeBasis as unknown as NativeWorkReacquisitionBasis;
    const basis = currentOwnerPrefix === undefined ? original : { ...original,
      predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix) };
    const owner = authenticateNativeWorkReacquisition(basis, input);
    return owner !== null && same(owner.task, value);
  } catch { return false; }
}
/** Authenticated current-Run preparation carries historical child provenance.
 * The original F_P result remains in its own Run and invocation. */
export function projectReacquiredNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate) {
  const proof = input.task.sourceReacquisition;
  if (proof === undefined || !nativeWorkReacquisitionResultMatches(proof.request, input.task, currentOwnerPrefix)) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix), basis = projectExactExecutionBasisAtPrefix(prefix,
    one(events, e => e.kind === "c_call_opened" && e.aggregateId === proof.nativeBasis.cCallRef)?.basisId ?? "");
  const result = one(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === proof.nativeBasis.cCallRef);
  const judgment = one(events, e => e.kind === "c_call_judged" && e.aggregateId === proof.nativeBasis.cCallRef);
  const parentCall = one(events, e => e.kind === "c_call_opened" && e.aggregateId === input.parentCCallRef && e.basisId === input.parentBasis.basisRef);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, input.parentBasis.invocationAdmissionRef);
  if (basis === null || basis.invocationAdmissionRef !== input.parentBasis.invocationAdmissionRef ||
    basis.rootImplementationSetRef !== input.parentBasis.rootImplementationSetRef || basis.rootImplementationSetDigest !== input.parentBasis.rootImplementationSetDigest ||
    result === null || judgment === null || result.runId !== input.runId || result.basisId !== basis.basisRef || !record(result.payload) ||
    result.payload.resultClass !== "success" || !same(result.payload.value, input.task) || result.payload.valueDigest !== hash(input.task) ||
    !record(judgment.payload) || judgment.payload.judgment !== "advance" || judgment.payload.resultRef !== result.payload.resultRef ||
    judgment.payload.resultDigest !== result.payload.resultDigest || !judgment.causationEventRefs.includes(result.eventId) ||
    parentCall === null || parentCall.runId !== input.runId || parentCall.admissionOrdinal <= judgment.admissionOrdinal ||
    !record(parentCall.payload) || parentCall.payload.callClass !== "workflow" ||
    parentCall.payload.childGraphFunctionRef !== "graph-function://abiogenesis/worksite/command-execution@5" ||
    invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.task.capabilityGrant)) return null;
  const source = projectNativeWorkCommandSourceAtPrefix(prefix, input.task);
  if (source === null) return null;
  const covers = projectWorksiteRevisionBindingCover(prefix, input.task.sourceNativeWork.task.workspaceBinding, input.task.workspaceBinding, [source.sourceBasis]);
  return covers !== null && proof.bindingCoverEventRefs.every(ref => covers.includes(ref)) ? source : null;
}
