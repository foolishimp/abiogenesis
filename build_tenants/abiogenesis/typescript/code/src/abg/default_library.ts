import { framedSynthesisAtLocus } from "../gtl/stdo_run_environment.js";
import { resolveRegisteredSelection } from "../gtl/registered_selection.js";
import { isFramedSynthesisTask, isFramedSynthesisResult, type FramedSynthesisTask } from "../product/default_library.js";
import { isDeepStrictEqual as same } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { authenticateOwnedNativeInstructionAssemblyBasis, rehydrateExecutionBasisAtPrefix, type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { reuseWorksiteContextBodiesAtPrefix, worksiteContextBodyReaderAtPrefix, type RuntimeEventPrefix } from "./event_prefix.js";
import { sha256Bytes } from "../shared/digests.js";
import { projectExactInvocationAdmissionAtPrefix, projectExactExecutionBasisAtPrefix, hasAdmittedGovernanceSourceUse,
  hasAdmittedGovernanceCoveredSourceUse, governanceContextBodyUse } from "./invocation_execution_truth.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import { invocationRootAtPrefix } from "./semantic_job.js";
import { worksiteCommandSourcesInvalidatedAfter, projectNativeWorkspaceWorkSourceAtPrefix, projectNativeWorkspaceWorkResultTaskAtPrefix } from "./native_worksite_execution.js";
import { isGovernanceWorkState, governanceTestingConfiguration, governanceAssessmentContract, governanceAssessmentDependencies, governanceSelectedReview, governanceVerdicts, GOVERNANCE_POLICIES,
  GOVERNANCE_IMPLEMENTATION_REFS, governanceRef as ref, governanceContract as contract, type GovernanceWorkState, type GovernancePurpose,
  type GovernanceObservation, type GovernanceReviewStanding } from "../product/default_library.js";
import { isRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { constructNativeWorkspaceWorkTask, isNativeWorkspaceWorkTask, isNativeWorkspaceWorkObservation, type NativeWorkspaceWorkTask } from "../product/native_workspace_work.js";
import { constructObservedWorksiteCommandExecutionTask, constructNativeWorksiteCommandExecutionTask, worksiteCommandConfigurationMatches, boundWorksiteCommandDeclarations,
  isObservedWorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionObservation,
  isNativeWorksiteCommandExecutionObservation, type ObservedWorksiteCommandExecutionTaskInput, type WorksiteObservedStream } from "../product/worksite_command_execution.js";
import { constructWorksiteSubject, isWorksiteContextObservation, sameWorksiteContextIdentity, type WorksiteContextObservation } from "../product/worksite_effect.js";
import { observeWorksiteContext, observeWorksiteSubject } from "../product/worksite_operations.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { RuntimeEvent } from "./event_store.js";
import { governanceNativeWorkReacquisitionResultMatches, type GovernanceTestingRefusal } from "./native_work_reacquisition.js";
import type { NativeWorksiteCommandExecutionTask, WorksiteCommandAmbientEnvironment } from "../product/worksite_command_execution.js";
import { governanceFulfillmentSelection, initialGovernanceFulfillment, governanceFulfillmentSourceMatches, deriveGovernanceObligations,
  bindGovernanceFulfillmentAssessment, projectGovernanceFulfillment, invalidateGovernanceFulfillment, governanceFulfillmentActive,
  type GovernanceFulfillmentEvidence } from "../product/default_library_fulfillment.js";
import { framedSynthesisEvidenceRefs, governanceSubjectEvidenceRefs, projectGovernanceObservationFacts, governanceDirectFixedState as directFixedState,
  GOVERNANCE_DIRECT_PURPOSES as DIRECT_PURPOSES, GOVERNANCE_DIRECT_WRAPPERS as DIRECT_WRAPPERS } from "../product/default_library.js";
import { onlyExactMatch, type ExactMatch } from "../shared/select/index.js";
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;
/** Owner boundary: `absent` and `many` map to `undefined`. */
const exactOrUndefined = <T>(match: ExactMatch<T>): T | undefined => match.kind === "one" ? match.value : undefined;
const record = (x: JsonValue | undefined): x is Readonly<Record<string, JsonValue>> => typeof x === "object" && x !== null && !Array.isArray(x);
function testingRefused(refusal: GovernanceTestingRefusal | undefined, stage: string, relation: string,
  selectors: Readonly<Record<string, string | number | boolean | null>> = {}): null {
  refusal?.(stage, relation, selectors); return null;
}
function owner(basis: NativeInstructionAssemblyBasis, input: unknown, refusal?: GovernanceTestingRefusal) {
  const owned = authenticateOwnedNativeInstructionAssemblyBasis(basis);
  if (owned === null) return testingRefused(refusal, "testing_owner", "assembly_authentication");
  if (!same(owned.inputValue, input) || !GOVERNANCE_IMPLEMENTATION_REFS.includes(owned.call.implementationRef ?? "") || owned.environment.kind !== "exact_prefix_workspace_environment") return testingRefused(refusal, "testing_owner", "input_implementation_environment", { basisRef: owned.execution.basisRef });
  const invocation = projectExactInvocationAdmissionAtPrefix(owned.prefix, owned.execution.invocationAdmissionRef);
  if (invocation === null || invocation.capabilityGrants.length !== 1) return testingRefused(refusal, "testing_owner", "invocation_grant", { invocationAdmissionRef: owned.execution.invocationAdmissionRef });
  // The one governance-root projection: the index population of one and the
  // ancestry walk to that same root.
  const root = invocationRootAtPrefix(owned.prefix, owned.execution);
  const initial: JsonValue = root === null ? null : root.rawInputValue;
  // The ingress already admitted exact source -> raw input equality. Consume
  // those bound identities rather than revalidate/hash the retained state here.
  const retained = invocation.sourceResultBasis?.sourceResultContractRef === contract("state") &&
    invocation.sourceResultBasis.sourceResultValueDigest === invocation.rawInputDigest;
  if (!isGovernanceWorkState(initial) || initial.terminal || (!retained &&
    (initial.observations.length !== 0 || initial.synthesis !== null))) return testingRefused(refusal, "testing_owner", "retained_root_state", { invocationAdmissionRef: invocation.invocationAdmissionRef, rootProjected: root !== null, retainedInput: retained });
  if (governanceFulfillmentSelection(owned.program, initial.original) === "invalid" || initial.original.fulfillment !== undefined &&
    !retained && !same(initial.fulfillment, initialGovernanceFulfillment(initial.original.fulfillment))) return testingRefused(refusal, "testing_owner", "fulfillment_selection");
  const state = isRetainedGraphInput(input) ? input.entry : isFramedSynthesisTask(input) || isFramedSynthesisResult(input) ? input.state : input;
  if (isGovernanceWorkState(state) && !same(state.original, initial.original)) return testingRefused(refusal, "testing_owner", "original_task");
  // RC7 fixed route: the invoked Testing or UAT wrapper is itself the invocation
  // root over a selector-free state. A selected state keeps the relation above.
  // The Product library owns the finite direct relation shared with admission.
  const direct = root !== null && root.basisRef === owned.execution.basisRef && owned.execution.parentExecutionBasisRef === null &&
    initial.synthesis === null ? DIRECT_PURPOSES.find(p => owned.execution.graphFunctionRef === DIRECT_WRAPPERS[p]) ?? null : null;
  if (direct !== null && !directFixedState(initial, direct, invocation.sourceResultBasis)) return testingRefused(refusal, "testing_owner", "direct_fixed_route", { invocationAdmissionRef: invocation.invocationAdmissionRef, retainedInput: retained });
  return { ...owned, environment: owned.environment, invocation, grant: invocation.capabilityGrants[0]!, direct };
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
/** The preparation leaves' worksite observation, an admitted observation. */
type GovernanceWorksiteObservation = Readonly<{
  context: WorksiteContextObservation;
  observedFiles: ObservedWorksiteCommandExecutionTaskInput["observedFiles"];
}>;
/**
 * The one effect of the three governance preparation leaves, under the worksite
 * operations' own contracts: the context under the original read roots
 * (`observeWorksiteContext`; every file by path, digest and bytes within the
 * original `maxContextFiles` and `maxContextBytes`) and, for observed testing
 * only, each selected path (`observeWorksiteSubject`). This owner admits the
 * context only when it binds the current authority, binding, read roots, bounds
 * and every original source (`contextMatches`). The task constructions read the
 * admitted observation, the declared input and the admitted prefix, never the
 * worksite; the observation is carried in the constructed task, so the leaf's
 * deterministic evidence binds it by the output digest and result admission
 * (`governanceResultMatches`) re-derives the task from the carried observation.
 */
async function observeGovernanceWorksite(o: Owner, state: GovernanceWorkState, observedPaths: readonly string[],
  refusal?: GovernanceTestingRefusal): Promise<GovernanceWorksiteObservation | null> {
  const observed = await observeWorksiteContext({ ...operating(o), protectedInstallRoots: o.environment.productInstalls.map(i => i.installedRoot), readRoots: state.original.readRoots, maxFiles: state.original.maxContextFiles, maxBytes: state.original.maxContextBytes });
  if (!isWorksiteContextObservation(observed)) return testingRefused(refusal, "testing_context", "context_observation");
  // Current W is reobserved above; unchanged bodies already held by this Run's
  // admitted Results, or declared by its admitted retained source's native
  // task context, are carried by member reference, changed bytes inline.
  const context = reuseWorksiteContextBodiesAtPrefix(o.prefix, observed, governanceContextBodyUse(o.invocation, o.call.runId));
  if (!contextMatches(o, state, context)) return testingRefused(refusal, "testing_context", "authority_binding_sources", { contextRef: context.observationRef, workspaceBindingRef: o.execution.workspaceBindingId });
  const current = operating(o), observedFiles: ObservedWorksiteCommandExecutionTaskInput["observedFiles"][number][] = [];
  for (const relativePath of observedPaths) {
    const subject = constructWorksiteSubject({ ...current, relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, relativePath)).href });
    if (subject.kind !== "worksite_subject") return testingRefused(refusal, "testing_observed_subject", "subject_construction");
    const observation = await observeWorksiteSubject(current.workspaceAuthorityBasis, current.workspaceBinding, subject);
    if (observation.kind !== "worksite_observation" || observation.state !== "file") return testingRefused(refusal, "testing_observed_subject", "file_observation");
    observedFiles.push({ subject, observation });
  }
  return { context, observedFiles };
}
function result(o: Owner, resultRef: string, resultDigest?: string): RuntimeEvent | null {
  const rows = indexedRuntimeEvents(o.prefix, "payload:resultRef:" + resultRef).filter(e => e.kind === "c_call_result_admitted" &&
    (e.runId === o.call.runId || hasAdmittedGovernanceUse(o, e)) && record(e.payload) && e.payload.resultClass === "success" && (resultDigest === undefined || e.payload.resultDigest === resultDigest));
  return exactOrNull(onlyExactMatch(rows));
}
function hasAdmittedGovernanceUse(o: Owner, event: RuntimeEvent): boolean {
  return hasAdmittedGovernanceSourceUse(o.invocation, event);
}
function sourceResult(o: Owner, input: unknown) {
  const retained = o.inputOrigin.retainedProjection;
  return retained !== undefined && retained.entryBasis.basisRef === o.execution.basisRef &&
    retained.input.admissionRef === o.inputRef && same(retained.input.value, input) ? retained.sourceResult : null;
}
/** One consumer's selected-body reader for an admitted context at this owner's prefix. */
function bodies(o: Owner, context: WorksiteContextObservation) {
  return worksiteContextBodyReaderAtPrefix(o.prefix, context, governanceContextBodyUse(o.invocation, o.call.runId));
}
/** Selection task construction over the admitted context; reads no worksite. */
function selectionTask(o: Owner, state: GovernanceWorkState, context: WorksiteContextObservation): FramedSynthesisTask | null {
  if (state.original.fulfillment !== undefined && state.synthesis === null &&
    !governanceFulfillmentSourceMatches(state.original.fulfillment, context, bodies(o, context))) return null;
  if (state.terminal) throw new TypeError("completed parent cannot select work");
  return { kind: "framed_synthesis_task", schemaVersion: "5.0.0", state, context };
}
export function projectGovernanceChoice(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isFramedSynthesisResult(input)) return null;
  const profile = framedSynthesisAtLocus(basis.graphFunction, basis.graphFunction.declarations["abg.framed_synthesis_locus"] ?? "");
  const event = o.inputOrigin.event;
  if (!profile || profile.projection.nodeRef !== basis.cursor.currentNodeRef || event?.kind !== "c_call_result_admitted" ||
    event.runId !== o.call.runId || event.basisId !== o.execution.basisRef || event.graphCallId !== o.call.graphCallId ||
    !record(event.payload) || event.payload.resultClass !== "success" || event.payload.resultRef !== o.inputRef || typeof event.payload.resultDigest !== "string") return null;
  const opened = indexedRuntimeEvents(o.prefix, "related:" + event.aggregateId).filter(e => e.kind === "c_call_opened" &&
    e.runId === o.call.runId && e.basisId === o.execution.basisRef && record(e.payload) && e.payload.programLocusRef === profile.node.nodeRef);
  if (opened.length !== 1) return null;
  const j = input.judgment, common = { kind: "registered_graph_choice", schemaVersion: "5.0.0", reason: j.nextReason, evidenceRefs: j.nextEvidenceRefs };
  let projected = input.state;
  if (input.state.original.fulfillment !== undefined) {
    // The selector's actual admitted input owns this context. Do not reread a
    // mutable worksite or reconstruct the proposal from arbitrary payloads.
    const inputEvents = indexedRuntimeEvents(o.prefix, "payload:resultRef:" + input.basis.inputRef)
      .filter(e => e.kind === "c_call_result_admitted" && e.runId === o.call.runId && e.basisId === event.basisId &&
        record(e.payload) && e.payload.valueDigest === input.basis.inputDigest && isFramedSynthesisTask(e.payload.value));
    const inputEvent = exactOrUndefined(onlyExactMatch(inputEvents));
    const task = record(inputEvent?.payload) && isFramedSynthesisTask(inputEvent.payload.value) ? inputEvent.payload.value : null;
    if (task === null || j.requirementProposals === undefined || !same(task.state, input.state)) return null;
    const fulfillment = deriveGovernanceObligations(input.state.original.fulfillment, input.state.fulfillment!, j.requirementProposals,
      input.state.original.taskRef, o.inputRef, task.context, framedSynthesisEvidenceRefs(task), bodies(o, task.context));
    if (fulfillment === null) return null;
    projected = { ...input.state, fulfillment, unresolvedSupportRefs: fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef) };
  }
  if (j.nextGraphFunctionRef === null) return { ...common, evidenceRefs: projected.fulfillment === undefined ? common.evidenceRefs : [...new Set([...common.evidenceRefs, o.inputRef])],
    disposition: "gap", missingSupportRefs: [...new Set([...j.gaps.flatMap(g => g.supportRefs), ...(projected.fulfillment === undefined ? [] : projected.unresolvedSupportRefs)])] };
  const next: GovernanceWorkState = { ...projected, synthesis: { resultRef: o.inputRef, resultDigest: event.payload.resultDigest as `sha256:${string}`,
    basis: input.basis, judgment: j } };
  // An unregistered target has no definition digest and is no selection.
  const definitionDigest = o.execution.registeredSelectionDefinitionDigests?.[j.nextGraphFunctionRef];
  if (definitionDigest === undefined) return null;
  const choice = { ...common, disposition: "selected", graphFunctionRef: j.nextGraphFunctionRef,
    definitionDigest, input: { contractRef: contract("state"), value: next } };
  try { return resolveRegisteredSelection(o.graph.template, basis.cursor, o.call.outputContractRef, choice,
    o.execution.registeredSelectionDefinitionDigests ?? {})?.disposition === "selected" ? choice : null; } catch { return null; }
}
export async function projectGovernanceSelection(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input)) return null;
  const observation = await observeGovernanceWorksite(o, input, []);
  return observation === null ? null : selectionTask(o, input, observation.context);
}
function subjectEvidence(o: Owner, state: GovernanceWorkState, purpose: GovernancePurpose, refusal?: GovernanceTestingRefusal) {
  // Selector-free direct UAT: the owner admitted exactly one Testing row as its
  // declared single producer. Every Result/source/actor check below still applies.
  const direct = o.direct === "uat" && purpose === "uat" && state.synthesis === null;
  const ref = direct ? state.observations[0]?.resultRef : state.synthesis?.judgment.subjectEvidenceRef;
  if (ref === null || ref === undefined || !governanceSubjectEvidenceRefs(state, purpose).includes(ref)) return testingRefused(refusal, "testing_subject", "selected_evidence_ref", { resultRef: ref ?? null });
  const selected = state.observations.filter(r => r.resultRef === ref);
  if (selected.length !== 1) return testingRefused(refusal, "testing_subject", "observation_population", { resultRef: ref });
  const event = result(o, ref, selected[0]!.resultDigest);
  if (event === null || !record(event.payload) || event.aggregateId !== selected[0]!.cCallRef || typeof event.basisId !== "string") return testingRefused(refusal, "testing_subject", "admitted_result_identity", { resultRef: ref, resultDigest: selected[0]!.resultDigest });
  const sourceBasis = projectExactExecutionBasisAtPrefix(o.prefix, event.basisId);
  const retainedUse = hasAdmittedGovernanceUse(o, event);
  if (sourceBasis === null) return testingRefused(refusal, "testing_subject", "source_basis", { basisRef: event.basisId });
  if (!retainedUse && (sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef ||
    sourceBasis.rootImplementationSetRef !== o.execution.rootImplementationSetRef)) return testingRefused(refusal, "testing_subject", "source_use", { sourceBasisRef: sourceBasis.basisRef });
  if ((sourceBasis.workspaceBindingId !== o.execution.workspaceBindingId || sourceBasis.workspaceBindingDigest !== o.execution.workspaceBindingDigest) &&
      (!retainedUse || !hasAdmittedGovernanceCoveredSourceUse(o.prefix, o.invocation, sourceBasis))) return testingRefused(refusal, "testing_subject", "covered_current_use", { sourceBasisRef: sourceBasis.basisRef, workspaceBindingRef: o.execution.workspaceBindingId });
  const value = event.payload.value;
  if (!(isNativeWorkspaceWorkObservation(value) && value.assessment === undefined) &&
    !isObservedWorksiteCommandExecutionObservation(value) && !isNativeWorksiteCommandExecutionObservation(value)) return testingRefused(refusal, "testing_subject", "work_observation", { resultRef: ref });
  if (value.provenance.actorInvocationRef !== selected[0]!.actorInvocationRef) return testingRefused(refusal, "testing_subject", "producer_actor", { resultRef: ref });
  if (direct) {
    // Its one actual C2 child: the source Run and invocation, under that
    // invocation's root Testing wrapper basis.
    const source = o.invocation.sourceResultBasis;
    const parent = sourceBasis.parentExecutionBasisRef === null ? null : projectExactExecutionBasisAtPrefix(o.prefix, sourceBasis.parentExecutionBasisRef);
    if (source === null || (!isObservedWorksiteCommandExecutionObservation(value) && !isNativeWorksiteCommandExecutionObservation(value)) ||
      event.runId !== source.sourceRunId || sourceBasis.invocationAdmissionRef !== source.sourceInvocationAdmissionRef || parent === null ||
      parent.parentExecutionBasisRef !== null || parent.graphFunctionRef !== DIRECT_WRAPPERS.testing ||
      parent.invocationAdmissionRef !== source.sourceInvocationAdmissionRef) return testingRefused(refusal, "testing_subject", "direct_testing_child", { resultRef: ref });
  }
  return { event, value };
}
/** A `uat` producer stream whole: UTF-8 text when its admitted bytes decode as
 * strict UTF-8 (a leading BOM kept), else the admitted base64 row as it is. */
function producerStream(row: WorksiteObservedStream) {
  try { return { byteLength: row.byteLength, digest: row.digest, encoding: "utf8",
    text: new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(Buffer.from(row.payload, "base64")) }; }
  catch { return row; }
}
/** Native task construction over the admitted context and prefix; reads no worksite. */
function nativeTask(o: Owner, state: GovernanceWorkState, purpose: GovernancePurpose, context: WorksiteContextObservation) {
  // A review runs the selected declared review's own order; none is selectable otherwise.
  const review = purpose === "review" ? governanceSelectedReview(state) : null, assessed = purpose === "uat" || purpose === "review";
  const order = purpose === "review" ? review?.order : state.original.workOrders[purpose];
  if (order === undefined || !contextMatches(o, state, context)) return null;
  const authority = state.original.authorityRefs;
  const instructions = [GOVERNANCE_POLICIES[purpose], ...order.instructions, `Conserved original task: ${state.original.task}`,
    ...(authority.length === 0 ? [] : [`Conserved original authority selections: ${JSON.stringify(authority)}`]),
    `Unresolved parent outcomes: ${JSON.stringify(state.unresolvedSupportRefs)}`,
    `Actual admitted observations: ${JSON.stringify(projectGovernanceObservationFacts(state, context))}`,
    "This parent-context view retains admitted causal coordinates, command/report/predicate facts and bounded literal diagnostics. A strict UTF-8 stream of at most 8192 bytes appears whole as one exact excerpt marked complete; longer or non-UTF-8 stream bodies and predicate bodies remain in the cited admitted Result; field paths are relative to its value and confer no additional access. Excerpts are exact byte-range diagnostics, not interpreted verdicts. Reacquire all mandatory selected source and assessment material through the declared reads."];
  const synthesis = state.synthesis, judgment = synthesis?.judgment;
  const selectedContribution = judgment !== undefined && judgment.nextGraphFunctionRef === ref("graph-function", purpose)
    ? judgment.contributions.find(c => c.graphFunctionRef === judgment.nextGraphFunctionRef) : undefined;
  // An assessment keeps its declared outcome; a selected UAT or review contribution
  // is advisory planner context and cannot add, narrow or replace its criteria.
  const outcome = assessed ? order.outcome : selectedContribution?.contribution ?? order.outcome;
  const advisory = synthesis !== null && judgment !== undefined && judgment.nextGraphFunctionRef === ref("graph-function", purpose)
    ? `${assessed ? "Advisory planner selection (non-governing context; it cannot add, narrow, replace or reword any original outcome, criterion, rubric or subject)" : "Current admitted selection for this work unit"}: ${JSON.stringify({ resultRef: synthesis.resultRef, resultDigest: synthesis.resultDigest,
      interpretation: judgment.interpretation, contributions: judgment.contributions.filter(c => c.graphFunctionRef === judgment.nextGraphFunctionRef),
      nextReason: judgment.nextReason, nextEvidenceRefs: judgment.nextEvidenceRefs })}` : null;
  // The full-original UAT instructions govern with or without advisory synthesis.
  if (purpose === "uat") instructions.push(`Governing full-original assessment outcome: ${order.outcome}`, ...(advisory === null ? [] : [advisory]),
    "The full original outcome, complete original sources, exact consumer rubric and all current criteria govern this independent assessment, including unmet and unresolved outcomes. Assess the exact declared subject against all of them. Return one consumer assessment object matching the exact declared JSON schema, preserving every unmet or indeterminate criterion. A judgment about only the selected contribution cannot establish full-original satisfaction. The advisory planner selection adds no governing criterion: a condition that appears only there is not an assessment criterion.");
  else if (review !== null) instructions.push(`Declared review: ${JSON.stringify({ reviewRef: review.reviewRef, frame: review.frame, required: review.required })}`,
    `Governing review outcome: ${order.outcome}`, ...(advisory === null ? [] : [advisory]),
    "The declared reference frame, its declared sources, rubric and result contract govern this independent review. Assess the exact declared subject under that frame only. Only the declared read-first material, sources, candidate and rubric may support this verdict. Return one assessment object matching the exact declared JSON schema, preserving every unmet or indeterminate criterion. This review neither establishes nor replaces full-original acceptance. The advisory planner selection adds no governing criterion: a condition that appears only there is not a review criterion.");
  else if (advisory !== null) instructions.push(`Supplied purpose outcome (parent context): ${order.outcome}`, advisory,
    "This native task's outcome is the selected bounded contribution. The supplied purpose outcome, conserved original task and unresolved outcomes are parent context. Work within the supplied order and write roots; return a truthful partial report with remaining gaps for parent reassessment when this work unit does not complete the parent obligations.");
  if (state.original.fulfillment !== undefined) instructions.push(`Active source-grounded paired obligations: ${JSON.stringify(governanceFulfillmentActive(state.original.fulfillment, state.fulfillment!))}`);
  if (!assessed) return constructNativeWorkspaceWorkTask({ ...operating(o), context, ...order, outcome, instructions });
  const p = subjectEvidence(o, state, purpose), selection = governanceAssessmentContract(state, purpose === "review" ? "review" : "uat");
  if (p === null || selection === null || !record(p.event.payload) || typeof p.event.payload.resultRef !== "string" || typeof p.event.payload.resultDigest !== "string") return null;
  const candidate = context.entries.find(e => e.relativePath === selection.candidatePath);
  if (candidate?.state !== "file") return null;
  if (isNativeWorkspaceWorkObservation(p.value)) {
    const native = projectNativeWorkspaceWorkSourceAtPrefix(o.prefix, p.value);
    if (native === null || native.sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef && !hasAdmittedGovernanceUse(o, p.event)) return null;
  }
  // Producer support keeps its admitted dependency set. Fresh assessment-only
  // inputs are bound below to the current context, not to the producer's time.
  const dependencies = isNativeWorkspaceWorkObservation(p.value)
    ? p.value.after.entries.flatMap(e => e.state === "file" ? [{ path: e.relativePath, digest: e.digest }] : [])
    : p.value.task.protectedObservations.map(e => ({ path: e.subject.relativePath, digest: e.observation.fileDigest }));
  if ((isNativeWorkspaceWorkObservation(p.value) &&
      !dependencies.some(e => e.path === candidate.relativePath && e.digest === candidate.digest)) ||
    !dependencies.every(e => context.entries.some(c => c.relativePath === e.path && c.state === "file" && c.digest === e.digest)) ||
    worksiteCommandSourcesInvalidatedAfter(o.prefix, p.event.admissionOrdinal,
      o.environment.workspaceAuthorityBasis.canonicalRoot, dependencies.map(e => e.path))) return null;
  // An assessment consumes its full authenticated producer; the parent-context view above stays bounded.
  if (isObservedWorksiteCommandExecutionObservation(p.value) || isNativeWorksiteCommandExecutionObservation(p.value)) instructions.push(
    "This independent assessment consumes its full authenticated producer, the admitted Testing Result cited here: its command streams complete, each as UTF-8 text when its admitted bytes decode as strict UTF-8, else the admitted base64 payload, each with its admitted byte length and digest, and its predicate observations complete. Field paths are relative to the cited admitted Result's value and confer no additional access or authority. The parent-context view above stays bounded; this producer is carried whole, nothing withheld, and the declared prompt bound refuses a prompt that overflows it. Reacquire all mandatory selected source and assessment material through the declared reads. " +
    JSON.stringify({ resultRef: p.event.payload.resultRef, resultDigest: p.event.payload.resultDigest, cCallRef: p.event.aggregateId,
      actorInvocationRef: p.value.provenance.actorInvocationRef, commandResults: p.value.commandResults.map(r => ({ commandId: r.commandId,
        ordinal: r.ordinal, observationRef: r.observationRef, observationDigest: r.observationDigest, exitStatus: r.exitStatus,
        stdout: producerStream(r.stdout), stderr: producerStream(r.stderr) })), predicateObservations: p.value.predicateObservations }));
  const asset = (path: string) => { const e = context.entries.find(e => e.relativePath === path); if (e?.state !== "file") throw new TypeError("assessment file missing"); return { path, digest: e.digest }; };
  if (purpose === "uat" && state.original.fulfillment !== undefined) instructions.push(
    "Return the installed structural fulfillment response. Use exactly one row per current obligation, criterion, depth class and discovery class. Meanings and sufficiency are your independent judgments. Unknown support is indeterminate, never implicit success.",
    "Select only prior Result refs, roles, paths and command ids from the owned domains below. Do not emit digests, CCall/actor identities or your own future Result ref. The owner attaches this assessment after admission. Realization and verifier artifacts are different selected subjects. Current support must match current dependency bytes. AdverseEvidenceRefs are historical C2 counterevidence for the declared adverse-command criterion, not proof of current behavior.",
    `Selected policy and dynamic domains: ${JSON.stringify({ declaration: state.original.fulfillment,
      active: governanceFulfillmentActive(state.original.fulfillment, state.fulfillment!), evidence: state.observations.map(o => o.fulfillmentEvidence).filter(Boolean) })}`);
  return constructNativeWorkspaceWorkTask({ ...operating(o), context, ...order, outcome, instructions,
    readFirst: governanceAssessmentDependencies(order, selection), writeRoots: [],
    assessment: { resultContract: selection.resultContract, schemaAsset: selection.schemaAsset, sources: selection.sources.map(asset),
      candidate: asset(selection.candidatePath), rubric: asset(selection.rubricPath), producer: { resultRef: p.event.payload.resultRef,
        resultDigest: p.event.payload.resultDigest as `sha256:${string}`, cCallRef: p.event.aggregateId, actorInvocationRef: p.value.provenance.actorInvocationRef } } });
}
export async function projectGovernanceNativeTask(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input), purpose = basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (o === null || !isGovernanceWorkState(input) || !Object.hasOwn(GOVERNANCE_POLICIES, purpose) || purpose === "testing") return null;
  const observation = await observeGovernanceWorksite(o, input, []);
  return observation === null ? null : nativeTask(o, input, purpose, observation.context);
}
/** Shared pure task/input relation for preparation admission and observed child provenance. */
export function observedGovernanceTaskMatches(state: unknown, task: unknown): boolean {
  if (!isGovernanceWorkState(state) || (state.synthesis !== null && state.synthesis.judgment.subjectEvidenceRef !== null) || !isObservedWorksiteCommandExecutionTask(task) ||
    !same(state.original.testing.selectedPaths, task.protectedObservations.map(p => p.subject.relativePath))) return false;
  return worksiteCommandConfigurationMatches({ ...governanceTestingConfiguration(state), workspaceAuthorityBasis: task.workspaceAuthorityBasis, workspaceBinding: task.workspaceBinding,
    protectedSubjects: task.protectedObservations.map(row => row.subject) },
  { commands: task.commands, predicates: task.outcomePredicates, allowedWriteTerritories: task.allowedWriteTerritories });
}
export async function projectGovernanceTestingTask(basis: NativeInstructionAssemblyBasis, input: unknown,
  reacquire?: (context: WorksiteContextObservation) => NativeWorksiteCommandExecutionTask | null): Promise<NativeWorksiteCommandExecutionTask | import("../product/worksite_command_execution.js").ObservedWorksiteCommandExecutionTask | null>;
/** @internal Call-local refusal through the unchanged nullable task projection. */
export async function projectGovernanceTestingTask(basis: NativeInstructionAssemblyBasis, input: unknown,
  reacquire: ((context: WorksiteContextObservation, refusal?: GovernanceTestingRefusal) => NativeWorksiteCommandExecutionTask | null) | undefined,
  refusal: GovernanceTestingRefusal, ambient?: WorksiteCommandAmbientEnvironment | null): Promise<NativeWorksiteCommandExecutionTask | import("../product/worksite_command_execution.js").ObservedWorksiteCommandExecutionTask | null>;
export async function projectGovernanceTestingTask(basis: NativeInstructionAssemblyBasis, input: unknown,
  reacquire?: (context: WorksiteContextObservation, refusal?: GovernanceTestingRefusal) => NativeWorksiteCommandExecutionTask | null,
  refusal?: GovernanceTestingRefusal, ambient?: WorksiteCommandAmbientEnvironment | null) {
  const o = owner(basis, input, refusal);
  if (o === null) return null;
  if (!isGovernanceWorkState(input) || basis.graphFunction.declarations["abg.default_library_purpose"] !== "testing") return testingRefused(refusal, "testing_input", "state_purpose");
  const selectedSource = input.synthesis?.judgment.subjectEvidenceRef, observed = selectedSource === null || selectedSource === undefined;
  const observation = await observeGovernanceWorksite(o, input, observed ? input.original.testing.selectedPaths : [], refusal);
  return observation === null ? null : testingTask(o, input, observation, reacquire, refusal, ambient);
}
/** Testing task construction over the admitted observation and prefix; reads no
 * worksite. A changed selected native source is the reacquisition operation's,
 * entered through the caller's callback. */
function testingTask(o: Owner, input: GovernanceWorkState, observation: GovernanceWorksiteObservation,
  reacquire?: (context: WorksiteContextObservation, refusal?: GovernanceTestingRefusal) => NativeWorksiteCommandExecutionTask | null,
  refusal?: GovernanceTestingRefusal, ambient?: WorksiteCommandAmbientEnvironment | null) {
  const current = operating(o), context = observation.context, selectedSource = input.synthesis?.judgment.subjectEvidenceRef;
  if (selectedSource === null || selectedSource === undefined)
    return constructObservedWorksiteCommandExecutionTask({ ...current, observedFiles: observation.observedFiles, ...governanceTestingConfiguration(input) }, ambient ?? null);
  const p = subjectEvidence(o, input, "testing", refusal);
  if (p === null || !isNativeWorkspaceWorkObservation(p.value) || p.value.assessment !== undefined) return testingRefused(refusal, "testing_subject", "native_work_required", { resultRef: selectedSource });
  if (!sameWorksiteContextIdentity(p.value.after, context)) {
    if (reacquire === undefined) return testingRefused(refusal, "testing_reacquisition", "callback_absent", { resultRef: selectedSource, contextRef: context.observationRef });
    const task = refusal === undefined ? reacquire(context) : reacquire(context, refusal);
    return task ?? testingRefused(refusal, "testing_reacquisition", "callback_entered_refused", { resultRef: selectedSource, contextRef: context.observationRef });
  }
  return constructNativeWorksiteCommandExecutionTask({ ...current, sourceNativeWork: p.value,
    selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
    ...governanceTestingConfiguration(input) }, ambient ?? null);
}
export function projectGovernanceFold(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null {
  const o = owner(basis, input), purpose = basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (o === null || !isRetainedGraphInput(input) || !isGovernanceWorkState(input.entry) || !Object.hasOwn(GOVERNANCE_POLICIES, purpose)) return null;
  // A selected child keeps its synthesis target guard; a selector-free fold is
  // only the owner-authenticated fixed direct route of this exact wrapper.
  const synthesis = input.entry.synthesis;
  if (synthesis === null ? o.direct !== purpose : synthesis.judgment.nextGraphFunctionRef !== basis.graphFunction.name) return null;
  const event = sourceResult(o, input); if (event === null || !record(event.payload) || typeof event.payload.resultRef !== "string" || typeof event.payload.resultDigest !== "string") return null;
  const source = input.source;
  let value: Readonly<Record<string, JsonValue>>, actorInvocationRef: string | null, sourceTask: NativeWorkspaceWorkTask | null = null;
  if (purpose === "testing") {
    if (!isObservedWorksiteCommandExecutionObservation(source) && !isNativeWorksiteCommandExecutionObservation(source)) return null;
    const stream = (row: typeof source.commandResults[number]["stdout"]) => {
      const bytes = Buffer.from(row.payload, "base64");
      try { return { digest: row.digest, byteLength: row.byteLength, encoding: "utf8", text: new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes) }; }
      catch { return row; }
    };
    value = { commandResults: source.commandResults.map(r => ({ ...r, stdout: stream(r.stdout), stderr: stream(r.stderr) })), predicateObservations: source.predicateObservations }; actorInvocationRef = source.provenance.actorInvocationRef;
  } else {
    // The source's task is its admitted basis input, resolved through its Result's own basis.
    if (!isNativeWorkspaceWorkObservation(source)) return null;
    const task = projectNativeWorkspaceWorkResultTaskAtPrefix(o.prefix, event);
    if (task === null || !same(task, nativeTask(o, input.entry, purpose, task.context))) return null;
    sourceTask = task;
    const candidate: JsonValue = purpose === "uat" || purpose === "review" ? source.assessment ?? null : { report: source.report, changedPaths: source.changedPaths };
    if (!record(candidate)) return null; value = candidate; actorInvocationRef = source.provenance.actorInvocationRef;
  }
  // A review row names its declared review; the re-derived task above already bound it.
  const reviewRef = purpose === "review" ? synthesis?.judgment.reviewRef : undefined;
  if (purpose === "review" && typeof reviewRef !== "string") return null;
  const observation = { purpose, resultRef: event.payload.resultRef,
    resultDigest: event.payload.resultDigest as `sha256:${string}`, cCallRef: event.aggregateId, actorInvocationRef,
    synthesisResultRef: synthesis?.resultRef ?? null, selectedGraphFunctionRef: basis.graphFunction.name, value,
    ...(typeof reviewRef === "string" ? { reviewRef } : {}) };
  if (input.entry.original.fulfillment === undefined) return { ...input.entry, observations: [...input.entry.observations, observation],
    terminal: false, unresolvedSupportRefs: [...input.entry.original.requiredSupportRefs] };
  // A review is no fulfillment evidence: coverage and obligations stay as admitted.
  if (purpose === "review") return { ...input.entry, observations: [...input.entry.observations, observation], terminal: false };
  if (typeof event.payload.contractRef !== "string" || actorInvocationRef === null) return null;
  const native = isNativeWorkspaceWorkObservation(source), execution = !native && (isObservedWorksiteCommandExecutionObservation(source) || isNativeWorksiteCommandExecutionObservation(source));
  if (!native && !execution) return null;
  const files = native ? source.after.entries.flatMap(e => e.state === "file" ? [{ path: e.relativePath, digest: e.digest }] : [])
    : source.snapshotMembers.map(e => ({ path: e.relativePath, digest: e.digest }));
  const producer = native ? sourceTask?.assessment?.producer : undefined;
  const fact: GovernanceFulfillmentEvidence = { resultRef: observation.resultRef, resultDigest: observation.resultDigest,
    contractRef: event.payload.contractRef, cCallRef: event.aggregateId, actorInvocationRef, kind: purpose === "uat" ? "assessment" : native ? "native" : "execution",
    files, dependencies: files, commands: native ? [] : source.commandResults.map(c => ({ commandId: c.commandId, exitStatus: c.exitStatus, timedOut: c.timedOut })),
    assessmentContractRef: native ? sourceTask?.assessment?.resultContract.contractRef ?? null : null,
    producerResultRef: producer?.resultRef ?? null, producerActorRef: producer?.actorInvocationRef ?? null };
  let fulfillment = input.entry.fulfillment!;
  if (purpose === "uat") {
    const facts = input.entry.observations.flatMap(o => o.fulfillmentEvidence === undefined ? [] : [o.fulfillmentEvidence]);
    const assessment = bindGovernanceFulfillmentAssessment(input.entry.original.fulfillment, fulfillment, value.fulfillment, facts);
    if (assessment === null) return null;
    fulfillment = projectGovernanceFulfillment(input.entry.original.fulfillment, fulfillment, assessment, fact, facts);
  } else if (native) fulfillment = invalidateGovernanceFulfillment(fulfillment, files, source.changedPaths);
  return { ...input.entry, observations: [...input.entry.observations, { ...observation, fulfillmentEvidence: fact }], fulfillment,
    terminal: false, unresolvedSupportRefs: fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef) };
}
export function projectGovernanceParent(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input)) return null;
  // One authentication of an admitted assessment row: its exact Result, producer actor and use.
  const admitted = (row: GovernanceObservation) => {
    const event = result(o, row.resultRef, row.resultDigest);
    if (event === null || !record(event.payload) || !isNativeWorkspaceWorkObservation(event.payload.value) || event.payload.value.assessment === undefined ||
      !same(event.payload.value.assessment, row.value) || event.aggregateId !== row.cCallRef || event.payload.value.provenance.actorInvocationRef !== row.actorInvocationRef) return null;
    const source = projectNativeWorkspaceWorkSourceAtPrefix(o.prefix, event.payload.value);
    return source === null || source.sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef && !hasAdmittedGovernanceUse(o, event) ? null
      : { event, value: event.payload.value, root: source.sourceTask.workspaceAuthorityBasis.canonicalRoot };
  };
  const verdicts = governanceVerdicts(input);
  let terminal = false, retained = false;
  if (verdicts.acceptance.satisfied) {
    const a = admitted(verdicts.acceptance.observation!); if (a === null) return null;
    // Retained assessment/coverage is attributed history. A fresh invocation
    // must acquire its current context and obtain its own parent outcome.
    retained = a.event.runId !== o.call.runId;
    terminal = !retained && !worksiteCommandSourcesInvalidatedAfter(o.prefix, a.event.admissionOrdinal, a.root, [], a.value.after.readRoots);
  }
  // Each declared review's latest verdict is current only in this Run while no
  // later admitted change lies at or under a member of its dependency set; the
  // read-roots form gives every effect branch that subtree reading.
  const rows = input.original.reviews === undefined ? undefined : verdicts.reviews.map(({ review, observation, satisfied }) => {
    if (observation === null) return { reviewRef: review.reviewRef, required: review.required, resultRef: null, satisfied: false, current: false };
    const a = admitted(observation);
    return a === null ? null : { reviewRef: review.reviewRef, required: review.required, resultRef: observation.resultRef, satisfied,
      current: a.event.runId === o.call.runId && !worksiteCommandSourcesInvalidatedAfter(o.prefix, a.event.admissionOrdinal, a.root, [],
        governanceAssessmentDependencies(review.order, review.assessment)) };
  });
  if (rows?.includes(null)) return null;
  const standing = rows as GovernanceReviewStanding[] | undefined, reviewStanding = standing === undefined ? {} : { reviewStanding: standing };
  if (retained) return { ...input, terminal: false, ...reviewStanding };
  terminal &&= standing?.every(row => !row.required || row.satisfied && row.current) ?? true;
  if (input.fulfillment !== undefined) {
    terminal = terminal && input.fulfillment.coverage.length > 0 && input.fulfillment.coverage.every(r => r.disposition === "eligible" && r.assessmentResultRef === verdicts.acceptance.observation?.resultRef);
    return { ...input, ...reviewStanding, terminal, unresolvedSupportRefs: input.fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef) };
  }
  return { ...input, ...reviewStanding, terminal, unresolvedSupportRefs: terminal ? [] : [...input.original.requiredSupportRefs] };
}
/** Reuses the exact constructed occurrence; admission adds no second definition authentication. */
export function governanceResultMatches(basis: NativeInstructionAssemblyBasis, input: unknown, output: unknown): boolean {
  try {
    const o = owner(basis, input); if (o === null) return false;
    const implementation = o.call.implementationRef;
    if (implementation === ref("implementation", "fold")) return same(output, projectGovernanceFold(basis, input));
    if (implementation === ref("implementation", "evaluate-parent")) return same(output, projectGovernanceParent(basis, input));
    if (implementation === ref("implementation", "project-choice")) return same(output, projectGovernanceChoice(basis, input));
    if (!isGovernanceWorkState(input)) return false;
    if (implementation === ref("implementation", "prepare-selection")) return isFramedSynthesisTask(output) &&
      contextMatches(o, input, output.context) && same(output, selectionTask(o, input, output.context));
    if (implementation === ref("implementation", "prepare-native")) return isNativeWorkspaceWorkTask(output) && same(output,
      nativeTask(o, input, basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose, output.context));
    if (implementation === ref("implementation", "prepare-testing")) {
      if (!isObservedWorksiteCommandExecutionTask(output) && !isNativeWorksiteCommandExecutionTask(output)) return false;
      if (!same(output.workspaceAuthorityBasis, o.environment.workspaceAuthorityBasis) || !same(output.workspaceBinding, o.environment.workspaceBinding) || !same(output.capabilityGrant, o.grant)) return false;
      if (isObservedWorksiteCommandExecutionTask(output)) return observedGovernanceTaskMatches(input, output);
      if (output.sourceReacquisition !== undefined) return governanceNativeWorkReacquisitionResultMatches(basis, input, output);
      // Re-derived under the bound law: the recorded task's bound rows, nothing captured.
      const p = subjectEvidence(o, input, "testing"), configuration = governanceTestingConfiguration(input);
      return p !== null && isNativeWorkspaceWorkObservation(p.value) && same(output, constructNativeWorksiteCommandExecutionTask({ ...operating(o), sourceNativeWork: p.value,
        selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath, subjectUri: pathToFileURL(resolve(o.environment.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
        ...configuration, ...boundWorksiteCommandDeclarations(configuration, output) }, null));
    }
    return false;
  } catch { return false; }
}

/**
 * Governed-context support (RC3 B): the governance state behind one native
 * Construction leaf and its unique same-Run Testing field. The current wrapper
 * Construction state is recovered from the leaf's execution-basis ancestry in
 * the same invocation and its parent CCall; the native task must be that
 * state's Construction work order and conserve its original task. Exactly one
 * Testing observation of that state must join one successful admitted Result
 * of this Run with its CCall, digest and producer actor; the selected field
 * must be one admitted stream whose decoded bytes match its byteLength and
 * digest. Any missing or ambiguous join returns null; nothing is reconstructed
 * from prompt text and no historical Result stands in for this Run's producer.
 */
export function projectGovernedContextTestingAtPrefix(prefix: RuntimeEventPrefix, execution: {
  readonly invocationAdmissionRef: string; readonly parentExecutionBasisRef: string | null; readonly parentCCallRef: string | null;
}, task: unknown, runId: string, fieldPath: readonly (string | number)[]) {
  if (!isNativeWorkspaceWorkTask(task) || task.assessment !== undefined) return null;
  let current = execution, state: GovernanceWorkState | null = null, parentCCallRef: string | null = null;
  for (let depth = 0; depth < 4 && state === null && current.parentExecutionBasisRef !== null; depth++) {
    const parent = rehydrateExecutionBasisAtPrefix(prefix, current.parentExecutionBasisRef);
    if (parent === null || parent.invocationAdmissionRef !== execution.invocationAdmissionRef) return null;
    const raw: unknown = parent.rawInputValue;
    const candidate = isRetainedGraphInput(raw) ? raw.entry : isFramedSynthesisTask(raw) || isFramedSynthesisResult(raw) ? raw.state : raw;
    if (isGovernanceWorkState(candidate)) { state = candidate; parentCCallRef = current.parentCCallRef; }
    current = parent;
  }
  const order = state?.original.workOrders.construction;
  if (state === null || parentCCallRef === null || state.terminal || order === undefined || !same(task.writeRoots, order.writeRoots) ||
    !task.instructions.includes(`Conserved original task: ${state.original.task}`)) return null;
  const joined = state.observations.filter(o => o.purpose === "testing").flatMap(o => {
    const rows = indexedRuntimeEvents(prefix, "payload:resultRef:" + o.resultRef).filter(e => e.kind === "c_call_result_admitted" && e.runId === runId &&
      e.aggregateId === o.cCallRef && record(e.payload) && e.payload.resultClass === "success" && e.payload.resultDigest === o.resultDigest);
    return rows.length === 1 ? [{ observation: o, event: rows[0]! }] : [];
  });
  if (joined.length !== 1) return null;
  const { observation, event } = joined[0]!, value = record(event.payload) ? event.payload.value : undefined;
  if (!(isObservedWorksiteCommandExecutionObservation(value) || isNativeWorksiteCommandExecutionObservation(value)) ||
    observation.actorInvocationRef === null || value.provenance.actorInvocationRef !== observation.actorInvocationRef) return null;
  let field: unknown = value;
  for (const step of fieldPath) field = field !== null && typeof field === "object" ? (field as Record<string | number, unknown>)[step] : undefined;
  const stream = field as Record<string, unknown> | undefined;
  if (stream === undefined || stream === null || typeof stream.payload !== "string" || !Number.isSafeInteger(stream.byteLength) || typeof stream.digest !== "string") return null;
  const bytes = Buffer.from(stream.payload, "base64");
  if (bytes.toString("base64") !== stream.payload || bytes.length !== stream.byteLength || sha256Bytes(bytes) !== stream.digest) return null;
  return Object.freeze({ parentCCallRef, resultRef: observation.resultRef, resultDigest: observation.resultDigest, cCallRef: observation.cCallRef,
    actorInvocationRef: observation.actorInvocationRef, eventRef: event.eventId, fieldPath: Object.freeze([...fieldPath]), bytes });
}
