import { isDeepStrictEqual } from "node:util";
/** Deterministic preparation of an existing closed native child, not new authorship. */
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { materializeGraph } from "../gtl/materialize.js";
import { defaultGovernanceGraphFunctions } from "../gtl/default_library.js";
import { isGovernanceWorkState, governanceTestingConfiguration, governanceRef, type GovernanceWorkState } from "../product/default_library.js";
import { constructNativeWorksiteCommandReacquisitionRequest, constructWorksiteCommandConfiguration,
  worksiteCommandConfigurationMatches } from "../product/worksite_command_execution.js";
import { constructWorksiteSubject, type WorksiteContextObservation } from "../product/worksite_effect.js";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
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
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix, hasAdmittedGovernanceSourceUse,
  hasAdmittedGovernanceCoveredSourceUse, governanceHistoricalDeclarationReferenceAtPrefix } from "./invocation_execution_truth.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { projectWorksiteRevisionBindingCover } from "./worksite_revision.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix, projectAdmittedCCallStateAtPrefix } from "./c_call.js";
import { rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { projectNativeWorkCommandSourceAtPrefix, projectNativeWorkspaceWorkSourceAtPrefix } from "./native_worksite_execution.js";
import { authenticateNativeInstructionAssemblyBasis, type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { NATIVE_WORKSPACE_WORK_IDS as native, isNativeWorkspaceWorkObservation } from "../product/native_workspace_work.js";
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
    const library = execution?.graphFunctionRef === governanceRef("graph-function", "testing");
    const gf = library ? defaultGovernanceGraphFunctions().find(g => g.name === execution!.graphFunctionRef)! : nativeWorkReacquisitionGraphFunction();
    const implementationRef = library ? governanceRef("implementation", "prepare-testing") : ids.implementationRef;
    const implementationBindingRef = library ? governanceRef("implementation-binding", "prepare-testing") : ids.implementationBindingRef;
    const predicateRef = library ? governanceRef("predicate", "prepare-testing") : ids.predicateRef;
    if (execution === null || execution.graphFunctionRef !== gf.name || execution.graphFunctionDigest !== hash(gf) ||
      (library ? !governanceReacquisitionRequestMatches(prefix, execution, input) : !same(execution.rawInputValue, input)) ||
      execution.workspaceBindingId !== input.workspaceBinding.bindingId || execution.workspaceBindingDigest !== input.workspaceBinding.bindingDigest) return null;
    const graph = materializeGraph(gf, { invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
      admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue as Readonly<Record<string, JsonValue>> });
    const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCallRef);
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.rootImplementationSetRef);
    const invocation = projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
    if (graph.materializationDigest !== execution.graphDigest || graph.materializationRef !== execution.graphRef || call === null ||
      call.basisId !== execution.basisRef || call.callClass !== "leaf" || call.regime !== "F_D" || call.implementationRef !== implementationRef ||
      call.implementationBindingRef !== implementationBindingRef || call.judgmentPredicateRef !== predicateRef ||
      set === null || set.implementationSetDigest !== execution.rootImplementationSetDigest ||
      set.rows.filter(r => r.graphFunctionRef === call.graphFunctionRef && r.programLocusRef === call.programLocusRef &&
        r.implementationRef === implementationRef && r.implementationBindingRef === implementationBindingRef &&
        r.inputContractRef === call.inputContractRef && r.outputContractRef === call.outputContractRef).length !== 1 ||
      invocation === null || invocation.capabilityGrants.length !== 1 || !same(invocation.capabilityGrants[0], input.capabilityGrant)) return null;
    return { call, execution, prefix };
  } catch { return null; }
}

/** Exact library input -> existing reacquisition request relation. This proves
 * no producer by itself: occurrence, native Result/J/closure and binding cover
 * remain mandatory in preparation and later admitted C2 consumption. */
function governanceReacquisitionRequestMatches(prefix: ValidatedRuntimeEventPrefix, execution: ExecutionBasis,
  request: NativeWorksiteCommandReacquisitionRequest): boolean {
  const state = execution.rawInputValue;
  if (!isGovernanceWorkState(state) || state.terminal || state.synthesis?.judgment.nextGraphFunctionRef !== governanceRef("graph-function", "testing") ||
      !same(state.original.readRoots, request.currentContext.readRoots) || state.original.maxContextFiles !== request.currentContext.maxFiles ||
      state.original.maxContextBytes !== request.currentContext.maxBytes) return false;
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
  const source = projectNativeWorkspaceWorkSourceAtPrefix(prefix, request.sourceNativeWork);
  const payload = source?.sourceResult.payload;
  if (invocation === null || source === null || !hasAdmittedGovernanceSourceUse(invocation, source.sourceResult) ||
      !hasAdmittedGovernanceCoveredSourceUse(prefix, invocation, source.sourceBasis) || !record(payload) ||
      payload.resultRef !== state.synthesis.judgment.subjectEvidenceRef ||
      state.observations.filter(o => o.resultRef === payload.resultRef && o.resultDigest === payload.resultDigest &&
        o.cCallRef === source.sourceResult.aggregateId && o.actorInvocationRef === request.sourceNativeWork.provenance.actorInvocationRef).length !== 1 ||
      request.source.graphCallRef !== source.sourceResult.graphCallId || request.source.declarationReference === undefined ||
      !same(request.source.declarationReference, governanceHistoricalDeclarationReferenceAtPrefix(prefix, invocation, source.sourceBasis))) return false;
  const subjects = request.selectedSources.map(s => constructWorksiteSubject({ ...request, ...s }));
  if (subjects.some(s => s.kind !== "worksite_subject")) return false;
  return same(state.original.testing.selectedPaths, request.selectedSources.map(s => s.relativePath)) &&
    request.selectedSources.every(s => s.subjectUri === pathToFileURL(resolve(request.workspaceAuthorityBasis.canonicalRoot, s.relativePath)).href) &&
    worksiteCommandConfigurationMatches({ ...governanceTestingConfiguration(state), workspaceAuthorityBasis: request.workspaceAuthorityBasis,
      workspaceBinding: request.workspaceBinding, protectedSubjects: subjects.filter(s => s.kind === "worksite_subject") },
      constructWorksiteCommandConfiguration({ ...request, protectedSubjects: subjects.filter(s => s.kind === "worksite_subject"),
        outcomePredicates: request.outcomePredicates ?? [] }));
}

/** Private invoking-owner operation for the existing prepare-testing F_D leaf.
 * The explicit resource is resolved before any retained establishment facts. */
export function prepareGovernanceNativeWorkReacquisition(basis: NativeInstructionAssemblyBasis, input: unknown,
  context: WorksiteContextObservation, historicalSource?: AbgHistoricalGraphCallSourceResource): NativeWorksiteCommandExecutionTask | null {
  try {
    const owned = authenticateNativeInstructionAssemblyBasis(basis);
    if (owned === null || !same(owned.inputValue, input) || !isGovernanceWorkState(input) ||
        owned.call.implementationRef !== governanceRef("implementation", "prepare-testing") || historicalSource === undefined ||
        !hasUniqueHistoricalDeclarationDependencies(historicalSource)) return null;
    const selected = input.synthesis?.judgment.subjectEvidenceRef;
    const rows = runtimeEventsFromValidatedPrefix(owned.prefix).filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
      e.payload.resultRef === selected && e.payload.resultClass === "success");
    if (rows.length !== 1 || !record(rows[0]!.payload)) return null;
    const value = rows[0]!.payload.value;
    if (!isNativeWorkspaceWorkObservation(value) || value.task.assessment !== undefined) return null;
    const source = projectNativeWorkspaceWorkSourceAtPrefix(owned.prefix, value);
    const invocation = projectExactInvocationAdmissionAtPrefix(owned.prefix, owned.execution.invocationAdmissionRef);
    if (source === null || invocation === null || invocation.capabilityGrants.length !== 1 || owned.environment.kind !== "exact_prefix_workspace_environment") return null;
    const environment = owned.environment;
    const reference = governanceHistoricalDeclarationReferenceAtPrefix(owned.prefix, invocation, source.sourceBasis);
    if (reference === null) return null;
    const request = constructNativeWorksiteCommandReacquisitionRequest({
      workspaceAuthorityBasis: environment.workspaceAuthorityBasis, workspaceBinding: environment.workspaceBinding,
      capabilityGrant: invocation.capabilityGrants[0]!, sourceNativeWork: value as NativeWorksiteCommandExecutionTask["sourceNativeWork"], currentContext: context,
      source: { prefix: basis.predecessorPrefix, graphCallRef: source.sourceResult.graphCallId!, declarationReference: reference },
      selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath,
        subjectUri: pathToFileURL(resolve(environment.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
      ...governanceTestingConfiguration(input) });
    const nativeBasis = { predecessorPrefix: basis.predecessorPrefix, cCallRef: owned.call.cCallRef };
    const declaration = declarationProofFor(request, historicalSource);
    if (declaration === null) return null;
    return deriveAuthenticatedNativeWorkReacquisition(nativeBasis, request, owned.prefix, declaration)?.task ?? null;
  } catch { return null; }
}

/** Admission matching borrows already authenticated declarations through the
 * admitted covered-use fact, not a copied resource or self-certified task. */
export function governanceNativeWorkReacquisitionResultMatches(basis: NativeInstructionAssemblyBasis, input: unknown, value: unknown): boolean {
  try {
    const owned = authenticateNativeInstructionAssemblyBasis(basis);
    if (owned === null || !same(owned.inputValue, input) || !record(value) || !record(value.sourceReacquisition)) return false;
    const task = value as unknown as NativeWorksiteCommandExecutionTask, proof = task.sourceReacquisition;
    if (proof === undefined || !same(proof.nativeBasis, { predecessorPrefix: basis.predecessorPrefix, cCallRef: owned.call.cCallRef }) ||
        !isNativeWorksiteCommandReacquisitionRequest(proof.request) || !same(constructNativeWorksiteCommandExecutionTask({ ...proof.request, sourceReacquisition: proof }), task)) return false;
    const occurrence = projectNativeWorkReacquisitionOccurrence(proof.nativeBasis, proof.request, owned.prefix);
    if (occurrence === null || occurrence.call.implementationRef !== governanceRef("implementation", "prepare-testing") ||
        projectCCallCarrierPhaseAtPrefix(owned.prefix, occurrence.call)?.phase !== "selected_no_evidence") return false;
    const source = projectNativeWorkCommandSourceAtPrefix(owned.prefix, task);
    if (source === null) return false;
    const covers = projectWorksiteRevisionBindingCover(owned.prefix, task.sourceNativeWork.task.workspaceBinding, task.workspaceBinding, [source.sourceBasis]);
    return covers !== null && same(covers, proof.bindingCoverEventRefs);
  } catch { return false; }
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
    !record(judgment.payload) || judgment.payload.predicateRef !== call.judgmentPredicateRef || judgment.payload.contractRef !== call.judgmentContractRef ||
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
    evidence.payload.contractRef !== call.evidenceContractRef || evidence.payload.implementationRef !== call.implementationRef ||
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
