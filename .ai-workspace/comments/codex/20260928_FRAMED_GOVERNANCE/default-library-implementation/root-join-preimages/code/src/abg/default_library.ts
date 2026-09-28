import { isDeepStrictEqual as same } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { authenticateNativeInstructionAssemblyBasis, type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import { worksiteCommandSourcesInvalidatedAfter, projectNativeWorkspaceWorkSourceAtPrefix } from "./native_worksite_execution.js";
import { isGovernanceWorkState, governanceTestingConfiguration, governanceAssessmentContract, governanceVerdict, GOVERNANCE_POLICIES,
  GOVERNANCE_IMPLEMENTATION_REFS, governanceRef as ref, governanceContract as contract, type GovernanceWorkState, type GovernancePurpose } from "../product/default_library.js";
import { isRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { constructNativeWorkspaceWorkTask, isNativeWorkspaceWorkTask, isNativeWorkspaceWorkObservation } from "../product/native_workspace_work.js";
import { constructObservedWorksiteCommandExecutionTask, constructNativeWorksiteCommandExecutionTask,
  isObservedWorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionObservation,
  isNativeWorksiteCommandExecutionObservation, type ObservedWorksiteCommandExecutionTaskInput } from "../product/worksite_command_execution.js";
import { constructWorksiteSubject, isWorksiteContextObservation, type WorksiteContextObservation } from "../product/worksite_effect.js";
import { observeWorksiteContext, observeWorksiteSubject } from "../product/worksite_operations.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { RuntimeEvent } from "./event_store.js";
const record = (x: unknown): x is Readonly<Record<string, JsonValue>> => typeof x === "object" && x !== null && !Array.isArray(x);
const asJson = (x: unknown) => x as Readonly<Record<string, JsonValue>>;
function owner(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const owned = authenticateNativeInstructionAssemblyBasis(basis);
  if (owned === null || !same(owned.inputValue, input) || !GOVERNANCE_IMPLEMENTATION_REFS.includes(owned.call.implementationRef ?? "") || owned.environment.kind !== "exact_prefix_workspace_environment") return null;
  const invocation = projectExactInvocationAdmissionAtPrefix(owned.prefix, owned.execution.invocationAdmissionRef);
  if (invocation === null || invocation.capabilityGrants.length !== 1) return null;
  const roots = indexedRuntimeEvents(owned.prefix, "invocation:" + invocation.invocationRef).filter(e =>
    e.kind === "basis_admitted" && e.runId === owned.call.runId && record(e.payload) && e.payload.basisClass === "root" && e.payload.invocationAdmissionRef === invocation.invocationAdmissionRef);
  const initial = roots.length === 1 && record(roots[0]!.payload) ? roots[0]!.payload.rawInputValue : null;
  if (!isGovernanceWorkState(initial) || initial.observations.length !== 0 || initial.terminal) return null;
  const state = isRetainedGraphInput(input) ? input.entry : input;
  if (isGovernanceWorkState(state) && !same(state.original, initial.original)) return null;
  return { ...owned, environment: owned.environment, grant: invocation.capabilityGrants[0]! };
}
type Owner = NonNullable<ReturnType<typeof owner>>;
function operating(o: Owner) { return { workspaceAuthorityBasis: o.environment.workspaceAuthorityBasis, workspaceBinding: o.environment.workspaceBinding,
  capabilityGrant: o.grant }; }
function contextMatches(o: Owner, state: GovernanceWorkState, context: WorksiteContextObservation) {
  return isWorksiteContextObservation(context) && context.workspaceAuthorityBasisRef === o.environment.workspaceAuthorityBasis.authorityBasisId &&
    context.workspaceAuthorityBasisDigest === o.environment.workspaceAuthorityBasis.authorityBasisDigest && context.workspaceBindingIdentity === o.execution.workspaceBindingId &&
    context.workspaceBindingDigest === o.execution.workspaceBindingDigest && same(context.readRoots, state.original.readRoots) &&
    context.maxFiles === state.original.maxContextFiles && context.maxBytes === state.original.maxContextBytes &&
    state.original.sources.every(s => context.entries.some(e => e.relativePath === s.path && e.state === "file" && e.digest === s.digest));
}
async function currentContext(o: Owner, state: GovernanceWorkState) {
  const context = await observeWorksiteContext({ ...operating(o), protectedInstallRoots: o.environment.productInstalls.map(i => i.installedRoot), readRoots: state.original.readRoots, maxFiles: state.original.maxContextFiles, maxBytes: state.original.maxContextBytes });
  return isWorksiteContextObservation(context) && contextMatches(o, state, context) ? context : null;
}
function result(o: Owner, resultRef: string, resultDigest?: string): RuntimeEvent | null {
  const rows = indexedRuntimeEvents(o.prefix, "payload:resultRef:" + resultRef).filter(e => e.kind === "c_call_result_admitted" &&
    e.runId === o.call.runId && record(e.payload) && e.payload.resultClass === "success" && (resultDigest === undefined || e.payload.resultDigest === resultDigest));
  return rows.length === 1 ? rows[0]! : null;
}
function sourceResult(o: Owner, source: Readonly<Record<string, JsonValue>>) {
  const provenance = source.provenance;
  if (!record(provenance) || typeof provenance.cCallRef !== "string") return null;
  const rows = indexedRuntimeEvents(o.prefix, "related:" + provenance.cCallRef).filter(e => e.kind === "c_call_result_admitted" &&
    e.runId === o.call.runId && record(e.payload) && e.payload.resultClass === "success" && same(e.payload.value, source));
  return rows.length === 1 ? rows[0]! : null;
}
function selectionTask(state: GovernanceWorkState, context: WorksiteContextObservation) {
  if (state.terminal) throw new TypeError("completed parent cannot select work");
  return { kind: "registered_selection_task", schemaVersion: "5.0.0", workerActorRef: ref("actor", "executive"), workerBindingRef: ref("worker", "selector"),
    task: state.original.task, observations: [ { observationRef: state.original.taskRef, qualification: "Original admitted task, source and authority; no expected graph schedule.", value: asJson(state.original) },
      { observationRef: context.observationRef, qualification: "Current owned worksite observations; supplied files need no invented author.", value: asJson(context) },
      ...state.observations.map(o => ({ observationRef: o.resultRef, qualification: `Actual admitted ${o.purpose} result. Successful measurement does not imply application success.`, value: asJson(o) })) ],
    requiredSupportRefs: state.unresolvedSupportRefs, childInput: { contractRef: contract("state"), value: asJson(state) }, maxPromptBytes: state.original.maxPromptBytes };
}
export async function projectGovernanceSelection(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input)) return null;
  const context = await currentContext(o, input); return context === null ? null : selectionTask(input, context);
}
function producer(o: Owner, state: GovernanceWorkState) {
  const selected = [...state.observations].reverse().find(r => r.purpose === "construction");
  if (selected === undefined) return null;
  const event = result(o, selected.resultRef, selected.resultDigest);
  return event !== null && record(event.payload) && isNativeWorkspaceWorkObservation(event.payload.value) && event.payload.value.task.assessment === undefined
    ? { event, value: event.payload.value } : null;
}
function nativeTask(o: Owner, state: GovernanceWorkState, purpose: GovernancePurpose, context: WorksiteContextObservation) {
  const order = state.original.workOrders[purpose]; if (order === undefined || !contextMatches(o, state, context)) return null;
  const instructions = [GOVERNANCE_POLICIES[purpose], ...order.instructions,
    `Conserved original task: ${state.original.task}`, `Unresolved parent outcomes: ${JSON.stringify(state.unresolvedSupportRefs)}`,
    `Actual admitted observations: ${JSON.stringify(state.observations)}`];
  if (purpose !== "uat") return constructNativeWorkspaceWorkTask({ ...operating(o), context, ...order, instructions });
  const p = producer(o, state), selection = governanceAssessmentContract(state);
  if (p === null || !record(p.event.payload) || typeof p.event.payload.resultRef !== "string" || typeof p.event.payload.resultDigest !== "string") return null;
  const native = projectNativeWorkspaceWorkSourceAtPrefix(o.prefix, p.value);
  if (native === null || native.sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef ||
    worksiteCommandSourcesInvalidatedAfter(o.prefix, p.event.admissionOrdinal, p.value.task.workspaceAuthorityBasis.canonicalRoot, [selection.candidatePath])) return null;
  const asset = (path: string) => { const e = context.entries.find(e => e.relativePath === path); if (e?.state !== "file") throw new TypeError("assessment file missing"); return { path, digest: e.digest }; };
  return constructNativeWorkspaceWorkTask({ ...operating(o), context, ...order, instructions, writeRoots: [],
    assessment: { resultContract: selection.resultContract, schemaAsset: selection.schemaAsset, sources: selection.sources.map(asset),
      candidate: asset(selection.candidatePath), rubric: asset(selection.rubricPath), producer: { resultRef: p.event.payload.resultRef,
        resultDigest: p.event.payload.resultDigest as `sha256:${string}`, cCallRef: p.value.provenance.cCallRef, actorInvocationRef: p.value.provenance.actorInvocationRef } } });
}
export async function projectGovernanceNativeTask(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input), purpose = basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (o === null || !isGovernanceWorkState(input) || !Object.hasOwn(GOVERNANCE_POLICIES, purpose) || purpose === "testing") return null;
  const context = await currentContext(o, input); return context === null ? null : nativeTask(o, input, purpose, context);
}
/** Shared pure task/input relation for preparation admission and observed child provenance. */
export function observedGovernanceTaskMatches(state: unknown, task: unknown): boolean {
  if (!isGovernanceWorkState(state) || !isObservedWorksiteCommandExecutionTask(task) ||
    !same(state.original.testing.selectedPaths, task.protectedObservations.map(p => p.subject.relativePath))) return false;
  try { return same(task, constructObservedWorksiteCommandExecutionTask({ workspaceAuthorityBasis: task.workspaceAuthorityBasis, workspaceBinding: task.workspaceBinding,
    capabilityGrant: task.capabilityGrant, observedFiles: task.protectedObservations, ...governanceTestingConfiguration(state) })); } catch { return false; }
}
export async function projectGovernanceTestingTask(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input) || basis.graphFunction.declarations["abg.default_library_purpose"] !== "testing") return null;
  const context = await currentContext(o, input); if (context === null) return null;
  const current = operating(o), p = producer(o, input);
  if (p !== null && same(p.value.after, context)) return constructNativeWorksiteCommandExecutionTask({ ...current, sourceNativeWork: p.value,
    selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
    ...governanceTestingConfiguration(input) });
  const observedFiles: ObservedWorksiteCommandExecutionTaskInput["observedFiles"][number][] = [];
  for (const relativePath of input.original.testing.selectedPaths) {
    const subject = constructWorksiteSubject({ ...current, relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, relativePath)).href });
    if (subject.kind !== "worksite_subject") return null;
    const observation = await observeWorksiteSubject(current.workspaceAuthorityBasis, current.workspaceBinding, subject);
    if (observation.kind !== "worksite_observation" || observation.state !== "file") return null;
    observedFiles.push({ subject, observation });
  }
  return constructObservedWorksiteCommandExecutionTask({ ...current, observedFiles, ...governanceTestingConfiguration(input) });
}
export function projectGovernanceFold(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null {
  const o = owner(basis, input), purpose = basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (o === null || !isRetainedGraphInput(input) || !isGovernanceWorkState(input.entry) || !Object.hasOwn(GOVERNANCE_POLICIES, purpose)) return null;
  const event = sourceResult(o, input.source); if (event === null || !record(event.payload) || typeof event.payload.resultRef !== "string" || typeof event.payload.resultDigest !== "string") return null;
  const source = input.source;
  let value: Readonly<Record<string, JsonValue>>, actorInvocationRef: string | null;
  if (purpose === "testing") {
    if (!isObservedWorksiteCommandExecutionObservation(source) && !isNativeWorksiteCommandExecutionObservation(source)) return null;
    const stream = (row: typeof source.commandResults[number]["stdout"]) => {
      const bytes = Buffer.from(row.payload, "base64");
      try { return { digest: row.digest, byteLength: row.byteLength, encoding: "utf8", text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) }; }
      catch { return row; }
    };
    value = asJson({ commandResults: source.commandResults.map(r => ({ ...r, stdout: stream(r.stdout), stderr: stream(r.stderr) })), predicateObservations: source.predicateObservations }); actorInvocationRef = source.provenance.actorInvocationRef;
  } else {
    if (!isNativeWorkspaceWorkObservation(source) || !same(source.task, nativeTask(o, input.entry, purpose, source.before))) return null;
    value = purpose === "uat" ? source.assessment ?? null! : asJson({ report: source.report, changedPaths: source.changedPaths });
    if (!record(value)) return null; actorInvocationRef = source.provenance.actorInvocationRef;
  }
  return { ...input.entry, observations: [...input.entry.observations, { purpose, resultRef: event.payload.resultRef,
    resultDigest: event.payload.resultDigest as `sha256:${string}`, cCallRef: event.aggregateId, actorInvocationRef, value }], terminal: false,
    unresolvedSupportRefs: [...input.entry.original.requiredSupportRefs] };
}
export function projectGovernanceParent(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input)) return null;
  let terminal = false;
  if (governanceVerdict(input)) {
    const last = input.observations.at(-1)!, event = result(o, last.resultRef, last.resultDigest);
    if (event === null || !record(event.payload) || !isNativeWorkspaceWorkObservation(event.payload.value) || event.payload.value.assessment === undefined ||
      !same(event.payload.value.assessment, last.value) || event.aggregateId !== last.cCallRef || event.payload.value.provenance.actorInvocationRef !== last.actorInvocationRef) return null;
    const source = projectNativeWorkspaceWorkSourceAtPrefix(o.prefix, event.payload.value);
    if (source === null || source.sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef) return null;
    terminal = !worksiteCommandSourcesInvalidatedAfter(o.prefix, event.admissionOrdinal, event.payload.value.task.workspaceAuthorityBasis.canonicalRoot,
      [], event.payload.value.after.readRoots);
  }
  return { ...input, terminal, unresolvedSupportRefs: terminal ? [] : [...input.original.requiredSupportRefs] };
}
/** Reuses the exact constructed occurrence; admission adds no second definition authentication. */
export function governanceResultMatches(basis: NativeInstructionAssemblyBasis, input: unknown, output: unknown): boolean {
  try {
    const o = owner(basis, input); if (o === null) return false;
    const implementation = o.call.implementationRef;
    if (implementation === ref("implementation", "fold")) return same(output, projectGovernanceFold(basis, input));
    if (implementation === ref("implementation", "evaluate-parent")) return same(output, projectGovernanceParent(basis, input));
    if (!isGovernanceWorkState(input)) return false;
    if (implementation === ref("implementation", "prepare-selection")) {
      if (!record(output) || !Array.isArray(output.observations) || !record(output.observations[1])) return false;
      const context = output.observations[1].value;
      return isWorksiteContextObservation(context) && contextMatches(o, input, context) && same(output, selectionTask(input, context));
    }
    if (implementation === ref("implementation", "prepare-native")) return isNativeWorkspaceWorkTask(output) && same(output,
      nativeTask(o, input, basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose, output.context));
    if (implementation === ref("implementation", "prepare-testing")) {
      if (!isObservedWorksiteCommandExecutionTask(output) && !isNativeWorksiteCommandExecutionTask(output)) return false;
      if (!same(output.workspaceAuthorityBasis, o.environment.workspaceAuthorityBasis) || !same(output.workspaceBinding, o.environment.workspaceBinding) || !same(output.capabilityGrant, o.grant)) return false;
      if (isObservedWorksiteCommandExecutionTask(output)) return observedGovernanceTaskMatches(input, output);
      const p = producer(o, input);
      return p !== null && same(output, constructNativeWorksiteCommandExecutionTask({ ...operating(o), sourceNativeWork: p.value,
        selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath, subjectUri: pathToFileURL(resolve(o.environment.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
        ...governanceTestingConfiguration(input) }));
    }
    return false;
  } catch { return false; }
}
