import { canonicalJson } from "../shared/canonical_json.js";
import { isDeepStrictEqual } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { JsonValue } from "../shared/canonical_json.js";
import * as v from "valibot";
import { sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { materializeGraph } from "../gtl/materialize.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { reconstructHistoricalDeclarationCatalog, resolveExecutionDeclarationClosure, selectExactClosureContract } from "../product/declaration_closure.js";
import { projectExactPrefixWorkspaceEnvironment, projectWorkspaceEnvironmentFromArtifactTruth, projectAdmittedProductInstallByAdmissionEventRef } from "./environment_admission.js";
import { projectExactPrefixArtifactTruth, runtimePrefixFromArtifactTruth, type ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix, projectAdmittedCCallStateAtPrefix,
  type RehydratedAdmittedCCallState, type AdmittedCCallEvidence } from "./c_call.js";
import { readRuntimeEventsAtDurablePrefix, assertDurableRuntimePrefixCurrent, reidentifyHistoricalDurablePrefixCoordinate, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix, runtimeEventsFromValidatedPrefix, runtimePrefixComputation } from "./event_prefix.js";
import { projectFhContinuations } from "./fh_continuation_projection.js";
import { deriveRuntimeEventCalculusProjection } from "./event_calculus.js";
import { GraphCallProjectionPort, projectRunTruthAtDurablePrefix } from "./project_read_ports.js";
import { isWorksiteCandidateBundle, WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction.js";
import { isObservedWorksiteCommandExecutionObservation, WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import type { AbgHistoricalDeclarationProof } from "./terminal_result_contracts.js";
import {
  qualificationHash as hash, sameQualificationValue as same, uniqueQualificationRefs as unique,
  isQualificationJudgment, isQualificationVerdict, isQualificationProofResource,
  QUALIFICATION_ROLE_POLICY,
  qualificationIdentity,
  type QualificationNativeBasis, type QualificationProofResource, type QualificationAssessmentPlan,
  type QualificationEvidenceSelection, type QualificationJudgment, type QualificationOwnerRuling,
  type QualificationSelfConformanceSummary, type QualificationMaterial, type QualificationVerdictInput,
  type TenantConformanceManifest, type MalformedGtlAssessment, type MalformedGtlAssessmentInput,
  type NativeRuntimeAssessmentInput, type NativeRuntimeAssessment,
  type ExactCandidateQualification, type QualificationCoordinate, constructQualificationIdentity,
  type QualificationVerificationSelection, type QualificationVerificationMaterial, type QualificationSubjectInventory,
} from "../validator/qualification_contracts.js";
import { isQualificationAssessmentInput, qualificationPlanMatches, qualificationWorkerRequest, qualificationRawMatches,
  qualificationRulingMatches, isQualificationVerdictInput, reduceExactCandidateQualification, constructQualificationVerificationMaterial } from "../validator/qualification.js";
import { qualificationCoverageIsPublished, isQualificationBasisReady, projectExternalConstructionAttribution,
  isMalformedGtlAssessmentInput, isMalformedGtlAssessment,
  isNativeRuntimeAssessmentInput, isNativeRuntimeAssessment, constructNativeRuntimeAssessment } from "../validator/qualification.js";
import { isSelfConformanceResult, type SelfConformanceOwner } from "../validator/self_conformance_contracts.js";
const ASSESS = "implementation://abiogenesis/qualification/assess-fp@5";
const VERDICT = "implementation://abiogenesis/qualification/exact-candidate-fd@5";
const SELF = "implementation://abiogenesis/qualification/self-conformance-fd@5";
const RULING = "implementation://abiogenesis/qualification/ruling-fd@5";
const MALFORMED_ASSESS = "implementation://abiogenesis/qualification/malformed-gtl-assess-fd@5";
const RUNTIME_ASSESS = "implementation://abiogenesis/qualification/native-runtime-assess-fd@5";
export const QUALIFICATION_IMPLEMENTATION_REFS = Object.freeze([ASSESS, VERDICT, SELF, RULING, MALFORMED_ASSESS, RUNTIME_ASSESS]);
const record = (x: unknown): x is Record<string, JsonValue> => x !== null && typeof x === "object" && !Array.isArray(x);
const one = <T>(xs: readonly T[]): T | null => xs.length === 1 ? xs[0]! : null;
const coord = (ref: string, digest: string) => ({ ref, digest: digest as `sha256:${string}` });
function declarationsOf(input: unknown): readonly AbgHistoricalDeclarationProof[] {
  if (!record(input)) return [];
  if (input.kind === "native_runtime_assessment" && record(input.input)) return declarationsOf(input.input);
  if (input.kind === "malformed_gtl_assessment" && record(input.input) && Array.isArray(input.input.declarations))
    return input.input.declarations as unknown as AbgHistoricalDeclarationProof[];
  if (isQualificationAssessmentInput(input)) return input.task.declarations;
  if (Array.isArray(input.declarations)) return input.declarations as unknown as AbgHistoricalDeclarationProof[];
  if (record(input.proof) && Array.isArray(input.proof.declarations)) return input.proof.declarations as unknown as AbgHistoricalDeclarationProof[];
  if (record(input.qualification) && record(input.qualification.proof) && Array.isArray(input.qualification.proof.declarations))
    return input.qualification.proof.declarations as unknown as AbgHistoricalDeclarationProof[];
  return [];
}
// Facts belong to the existing immutable-prefix derivation scope. They are
// discarded with its owner and never authorize a caller's claimed coordinate.
const NATIVE_PROOF = Symbol("qualification_native_proof");
type GraphOwner = NonNullable<ReturnType<typeof deriveGraphOwner>>;
class NativeProofDerivation {
  readonly graphs = new Map<string, GraphOwner>();
  readonly executionSources = new Map<string, { declaration: NonNullable<QualificationProofResource["executionSources"]>[number];
    proof: QualificationProofResource }>();
  readonly declarations = new Map<string, { proof: AbgHistoricalDeclarationProof;
    environment: Parameters<typeof reconstructHistoricalDeclarationCatalog>[1];
    value: ReturnType<typeof reconstructHistoricalDeclarationCatalog> }>();
  readonly states = new Map<string, { result: RuntimeEvent; judgment: RuntimeEvent; value: RehydratedAdmittedCCallState }>();
  readonly terminals = new Map<string, { rows: readonly RuntimeEvent[];
    terminal: ReturnType<typeof GraphCallProjectionPort.graph_call_result>; replay: ReturnType<typeof projectRunTruthAtDurablePrefix> }>();
  readonly assessments = new Map<string, { input: NativeRuntimeAssessmentInput; value: Readonly<NativeRuntimeAssessment> }>();
  readonly verdicts = new Map<string, { input: QualificationVerdictInput; value: Readonly<ExactCandidateQualification<"verdict">> }>();
}
const nativeFacts = (prefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>) =>
  runtimePrefixComputation(prefix, NATIVE_PROOF, () => new NativeProofDerivation());
// Equality is only a positive reuse discriminator for an already authenticated
// immutable fact. The canonical relation remains the fallback for all data.
const sameFact = (a: unknown, b: unknown) => a === b || isDeepStrictEqual(a, b) || same(a, b);
// One operation borrows each authenticated source prefix and workspace
// projection. These private associations cannot be supplied in JSON or confer
// authority on copied coordinates. The existing cold owners still acquire it.
type ExecutionSourceFacts = { events: readonly RuntimeEvent[];
  artifactTruth?: ExactPrefixArtifactTruthProjection;
  environments: Map<string, ReturnType<typeof projectExactPrefixWorkspaceEnvironment>> };
const executionProofFacts = new WeakMap<QualificationProofResource, ExecutionSourceFacts>();
function acquireExecutionSource(coordinate: DurablePrefixCoordinate): ExecutionSourceFacts | null {
  const artifactTruth = projectExactPrefixArtifactTruth(coordinate);
  if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection") return null;
  const prefix = runtimePrefixFromArtifactTruth(artifactTruth);
  if (prefix === null) return null;
  return { events: runtimeEventsFromValidatedPrefix(prefix), artifactTruth, environments: new Map() };
}
function proofEvents(proof: QualificationProofResource): readonly RuntimeEvent[] {
  return executionProofFacts.get(proof)?.events ?? readRuntimeEventsAtDurablePrefix(proof.prefix as DurablePrefixCoordinate);
}
function graphOwner(coordinate: DurablePrefixCoordinate, ref: string, declarations: readonly AbgHistoricalDeclarationProof[], source?: ExecutionSourceFacts) {
  const events = source?.events ?? readRuntimeEventsAtDurablePrefix(coordinate), prefix = selectValidatedRuntimeEventPrefix(events);
  const opened = one(events.filter(e => e.kind === "c_call_opened" && e.aggregateId === ref));
  if (opened === null) return null;
  const facts = nativeFacts(prefix), known = facts.graphs.get(ref);
  const selectedProofs = known === undefined ? [] : (declarations.length === 0 ? [known.proof] :
    declarations.filter(d => d.catalog?.basisDigest === known.root.catalogBasisDigest && d.catalogView?.viewDigest === known.root.catalogViewDigest));
  if (known !== undefined && known.opened === opened && selectedProofs.length === 1 && sameFact(selectedProofs[0], known.proof))
    return { ...known, events, prefix };
  const owner = deriveGraphOwner(coordinate, ref, declarations, events, prefix, opened, source);
  // Retention owns a distinct small wrapper. The returned projection view
  // remains caller-editable without editing an authenticated retained fact.
  if (owner !== null) facts.graphs.set(ref, Object.freeze({ ...owner }));
  return owner;
}
/** Reuses the historical Product verifier and native CCall owner. No supplied
 * declaration becomes authority by passing its own structural guard. */
function deriveGraphOwner(prefixCoordinate: DurablePrefixCoordinate, cCallRef: string, declarations: readonly AbgHistoricalDeclarationProof[],
  events: readonly RuntimeEvent[], prefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>, opened: RuntimeEvent, source?: ExecutionSourceFacts) {
  const execution = opened?.basisId === undefined ? null : projectExactExecutionBasisAtPrefix(prefix, opened.basisId);
  if (execution === null || opened === null) return null;
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
  if (invocation === null) return null;
  let root = execution; const seen = new Set<string>();
  while (root.basisClass === "child") {
    if (seen.has(root.basisRef) || root.parentExecutionBasisRef === null) return null;
    seen.add(root.basisRef);
    const parent = projectExactExecutionBasisAtPrefix(prefix, root.parentExecutionBasisRef);
    if (parent === null || parent.invocationAdmissionRef !== invocation.invocationAdmissionRef ||
        parent.programDigest !== execution.programDigest || parent.workspaceBindingDigest !== execution.workspaceBindingDigest) return null;
    root = parent;
  }
  const environmentKey = root.workspaceBindingId + ":" + root.workspaceBindingDigest;
  const environment = source?.environments.get(environmentKey) ??
    (source?.artifactTruth === undefined
      ? projectExactPrefixWorkspaceEnvironment(prefixCoordinate, coord(root.workspaceBindingId, root.workspaceBindingDigest))
      : projectWorkspaceEnvironmentFromArtifactTruth(source.artifactTruth, coord(root.workspaceBindingId, root.workspaceBindingDigest)));
  source?.environments.set(environmentKey, environment);
  if (environment.kind !== "exact_prefix_workspace_environment") return null;
  const invocationEvent = one(events.filter(e => e.eventId === invocation.admissionEventRef));
  if (invocationEvent === null || [...environment.productInstalls.map(i => i.admissionEventRef), environment.workspaceBinding.admissionEventRef].some(ref =>
    events.filter(e => e.eventId === ref && e.admissionOrdinal < invocationEvent.admissionOrdinal).length !== 1)) return null;
  const supplied = declarations.length === 0 ? declarationsOf(root.rawInputValue) : declarations;
  const proofs = supplied.filter(d => d.catalog?.basisDigest === root.catalogBasisDigest && d.catalogView?.viewDigest === root.catalogViewDigest);
  const proof = one(proofs); if (proof === null) return null;
  const installs = environment.productInstalls.map(i => projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth, i.admissionEventRef));
  if (installs.some(i => i === null)) return null;
  const declaredEnvironment = { workspaceBinding: environment.workspaceBindingCandidate,
    resolvedLock: environment.resolvedProductLock, installedProducts: installs.map(i => i!.candidate) };
  const facts = nativeFacts(prefix), declarationKey = root.catalogBasisDigest + ":" + root.catalogViewDigest;
  const priorDeclaration = facts.declarations.get(declarationKey);
  const rebuilt = priorDeclaration !== undefined && sameFact(priorDeclaration.proof, proof) &&
      sameFact(priorDeclaration.environment, declaredEnvironment) ? priorDeclaration.value
    : reconstructHistoricalDeclarationCatalog(proof, declaredEnvironment);
  const ownedProof = deepFreeze({ ...proof, catalog: rebuilt.catalog, catalogView: rebuilt.catalogView });
  facts.declarations.set(declarationKey, { proof: ownedProof, environment: declaredEnvironment, value: rebuilt });
  const closure = resolveExecutionDeclarationClosure(rebuilt.catalog, rebuilt.catalogView, root.programRef, root.graphFunctionRef);
  if (closure.kind !== "resolved_execution_declaration_closure" ||
      hash(one(closure.programPublication.programs.filter(p => p.programRef === root.programRef))) !== root.programDigest) return null;
  const rootContract = selectExactClosureContract(closure, root.resultContractRef);
  if (rootContract === null || rootContract.contract.contractRef !== invocation.outputContractRef ||
      hash(rootContract.contract) !== invocation.outputContractDigest || !same(rootContract.owner, invocation.outputContractOwner)) return null;
  const owner = one(closure.graphFunctionOwners.filter(o => o.declarationRef === execution.graphFunctionRef));
  if (owner === null) return null;
  const publication = one(closure.publications.filter(p => p.owningProductId === owner.productId && p.moduleRef === owner.moduleRef &&
    modulePublicationSemanticDigest(p) === owner.publicationDigest));
  const fn = publication === null ? null : one(publication.graphFunctions.filter(f => f.name === execution.graphFunctionRef && hash(f) === execution.graphFunctionDigest));
  if (fn === null || publication === null) return null;
  const graph = materializeGraph(fn, { invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
    admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
  if (graph.materializationDigest !== execution.graphDigest || graph.materializationRef !== execution.graphRef) return null;
  const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, cCallRef);
  if (call === null || call.basisId !== execution.basisRef || call.runId !== opened.runId) return null;
  const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.implementationSetRef);
  if (set === null || set.implementationSetDigest !== execution.implementationSetDigest) return null;
  const resolution = call.regime === "F_H" ? null : one(set.rows.filter(r => r.graphFunctionRef === call.graphFunctionRef &&
    r.programLocusRef === call.programLocusRef && r.implementationRef === call.implementationRef &&
    r.implementationBindingRef === call.implementationBindingRef && r.inputContractRef === call.inputContractRef &&
    r.outputContractRef === call.outputContractRef && r.computeRegime === call.regime));
  if (call.callClass === "leaf" && call.regime !== "F_H" && resolution === null) return null;
  // Qualification executable GraphFunctions each have one atomic input locus;
  // an outer workflow passes each child's own admitted raw input. This does not
  // infer arbitrary same-graph intermediate values from result bytes.
  const input = execution.rawInputValue;
  return { events, prefix, opened, execution, root, invocation, environment, closure, publication, graph, call, resolution, input, proof: ownedProof };
}
function stateAt(owner: NonNullable<ReturnType<typeof graphOwner>>): RehydratedAdmittedCCallState | null {
  const result = one(owner.events.filter(e => e.kind === "c_call_result_admitted" && e.aggregateId === owner.call.cCallRef));
  const judgment = one(owner.events.filter(e => e.kind === "c_call_judged" && e.aggregateId === owner.call.cCallRef));
  if (result === null || judgment === null || !record(result.payload) || !record(judgment.payload)) return null;
  const facts = nativeFacts(owner.prefix), known = facts.states.get(owner.call.cCallRef);
  if (known?.result === result && known.judgment === judgment) return known.value;
  const value = projectAdmittedCCallStateAtPrefix(owner.prefix, owner.call as unknown as Record<string, JsonValue>,
    { ...result.payload, kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: result.eventId },
    { ...judgment.payload, kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: judgment.eventId });
  if (value !== null) facts.states.set(owner.call.cCallRef, { result, judgment, value });
  return value;
}
/** Finite declaration count in the selected qualification Program. This is
 * not traversal: no branch, retry, actor or result is executed or inferred. */
function soleDeclaredReducer(owner: NonNullable<ReturnType<typeof graphOwner>>): boolean {
  const functions = owner.closure.publications.flatMap(p => p.graphFunctions);
  const bindings = owner.closure.publications.flatMap(p => p.implementationBindings);
  const countGraph = (ref: string, stack: readonly string[]): number => {
    if (stack.includes(ref)) return Number.POSITIVE_INFINITY;
    const fn = one(functions.filter(f => f.name === ref));
    if (fn === null || fn.template.kind !== "inline_graph") return Number.POSITIVE_INFINITY;
    return fn.template.nodes.reduce((sum, n) => sum + (n.nodeKind === "c_locus" ? countTerm(n.term, [...stack, ref]) : 0), 0);
  };
  const countTerm = (term: CProgramNode, stack: readonly string[]): number => {
    switch (term.kind) {
      case "c_of": {
        const requirement = term.requirement;
        return term.resultBearing && requirement.kind === "executable_leaf_requirement" &&
          bindings.some(b => b.bindingRef === requirement.implementationBindingRef && b.implementationRef === VERDICT) ? 1 : 0;
      }
      case "c_identity": return 0;
      case "c_workflow": return countGraph(term.graphFunctionRef, stack);
      case "c_compose": return term.terms.reduce((n, t) => n + countTerm(t, stack), 0);
      case "c_batch": return term.tasks.reduce((n, t) => n + countTerm(t, stack), 0);
      case "c_edge": return [term.transform, term.evaluate, term.consequence].reduce((n, t) => n + countTerm(t, stack), 0);
      case "c_retry": return countTerm(term.term, stack);
    }
  };
  return countGraph(owner.root.graphFunctionRef, []) === 1;
}
export function projectQualificationConsumer(basis: QualificationNativeBasis, input: unknown, requireCurrent = false) {
  try {
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix as DurablePrefixCoordinate, { requireCurrent });
    const owner = graphOwner(basis.predecessorPrefix as DurablePrefixCoordinate, basis.cCallRef, declarationsOf(input),
      { events, environments: new Map() });
    if (owner === null || !QUALIFICATION_IMPLEMENTATION_REFS.includes(owner.call.implementationRef ?? "") ||
        !sameFact(owner.input, input) || projectCCallCarrierPhaseAtPrefix(owner.prefix, owner.call)?.phase !== "selected_no_evidence") return null;
    if (requireCurrent && owner.call.implementationRef === SELF && record(input) && record(input.qualification) &&
        isQualificationProofResource(input.qualification.proof) && input.qualification.proof.executionSources !== undefined &&
        (!record(input.basis) || executionSourceProofs(input.qualification.proof,
          input.basis as unknown as ExactCandidateQualification<"basis">, basis, true) === null)) return null;
    if (owner.call.implementationRef === VERDICT && (!record(input) || input.slotRef !== owner.call.programLocusRef || !soleDeclaredReducer(owner))) return null;
    if (owner.call.implementationRef === MALFORMED_ASSESS &&
        (!isMalformedGtlAssessmentInput(input) || !malformedSubjectMatches(owner, input))) return null;
    if (owner.call.implementationRef === RUNTIME_ASSESS &&
        (!isNativeRuntimeAssessmentInput(input) || !malformedSubjectMatches(owner, input))) return null;
    if (isQualificationAssessmentInput(input)) {
      const slot = one(input.plan.slots.filter(s => s.slotRef === input.task.slotRef));
      if (slot === null || slot.graphFunctionRef !== owner.call.graphFunctionRef || slot.programLocusRef !== owner.call.programLocusRef) return null;
      const declaration = owner.publication.graphFunctions.find(g => g.name === owner.call.graphFunctionRef);
      if (declaration?.declarations["abg.qualification_role_policy"] !== hash(QUALIFICATION_ROLE_POLICY) ||
          input.plan.ownerActorRef !== owner.execution.actorRef || input.plan.ownerAuthorityRef !== QUALIFICATION_ROLE_POLICY.authorityRef) return null;
    }
    return owner;
  } catch { return null; }
}
function malformedSubjectMatches(owner: NonNullable<ReturnType<typeof graphOwner>>, input: { basis: ExactCandidateQualification<"basis"> }): boolean {
  const row = owner.resolution, basis = input.basis;
  const install = row === null ? null : one(owner.environment.productInstalls.filter(i =>
    i.productId === row.implementationOwnerProductId && i.packageName === row.packageName && i.packageVersion === row.packageVersion));
  return install !== null && basis.productId === install.productId && basis.productVersion === install.packageVersion &&
    basis.productContentDigest === install.productContentDigest && basis.artifact.digest === install.artifactDigest &&
    basis.productManifest.digest === install.manifestDigest && basis.toolchain.digest === install.manifestDigest &&
    same(basis.installedProduct, coord(install.installId, hash(install))) &&
    same(basis.workspaceBinding, coord(owner.execution.workspaceBindingId, owner.execution.workspaceBindingDigest));
}
/** Reuse the native producer relation; the cited assessment is its exact typed
 * value, not a caller-authored assertion or an invented runtime Result ref. */
export function malformedGtlAssessmentHasNativeOwner(proof: QualificationProofResource, assessment: MalformedGtlAssessment): boolean {
  try {
    if (!isMalformedGtlAssessment(assessment) || !isQualificationProofResource(proof) ||
        !proofWithin({ ...proof, prefix: assessment.nativeBasis.predecessorPrefix }, { cCallRef: assessment.nativeBasis.cCallRef, predecessorPrefix: proof.prefix })) return false;
    const source = nativeState(proof, assessment.nativeBasis.cCallRef);
    if (source === null || source.state.cCall.callClass !== "leaf" || source.state.cCall.implementationRef !== MALFORMED_ASSESS ||
        source.state.result.resultClass !== "success" || source.state.judgment.judgment !== "advance" ||
        source.state.result.contractRef !== "contract://abiogenesis/qualification/malformed-gtl-assessment@5" ||
        source.state.result.valueKind !== "malformed_gtl_assessment" ||
        !same(source.state.result.value, assessment) || !sameFact(source.owner.input, assessment.input) ||
        !malformedSubjectMatches(source.owner, assessment.input) ||
        projectQualificationConsumer(assessment.nativeBasis, assessment.input) === null) return false;
    const competitors = source.owner.events.filter(e => e.kind === "c_call_opened" && e.aggregateId !== source.state.cCall.cCallRef)
      .map(e => nativeState(proof, e.aggregateId)).filter(s => s !== null && s.state.cCall.callClass === "leaf" &&
        s.state.cCall.implementationRef === MALFORMED_ASSESS && s.state.cCall.programLocusRef === source.state.cCall.programLocusRef &&
        s.owner.execution.invocationAdmissionRef === source.owner.execution.invocationAdmissionRef &&
        s.state.result.resultClass === "success" && s.state.judgment.judgment === "advance");
    return competitors.length === 0;
  } catch { return false; }
}
/** Exclude only calls unable to affect the selected uniqueness relation.
 * Every potentially eligible successful producer still enters nativeState. */
function eligibleCalls(events: readonly RuntimeEvent[], selected: GraphOwner, implementation?: string) {
  const results = new Set(events.filter(e => e.kind === "c_call_result_admitted").map(e => e.aggregateId));
  const implementations = implementation === undefined ? null : new Set(events.filter(e =>
    e.kind === "c_call_fibre_selected" && record(e.payload) && e.payload.implementationRef === implementation).map(e => e.aggregateId));
  return events.filter(e => e.kind === "c_call_opened" && record(e.payload) &&
    e.payload.callClass === "leaf" && e.payload.programLocusRef === selected.call.programLocusRef &&
    results.has(e.aggregateId) && (implementations === null || implementations.has(e.aggregateId)) &&
    // All callers select uniqueness within this admitted invocation. Resolve
    // that small owner fact before reconstructing an unrelated declaration.
    e.basisId !== undefined && projectExactExecutionBasisAtPrefix(selected.prefix, e.basisId)?.invocationAdmissionRef ===
      selected.execution.invocationAdmissionRef);
}
type RuntimeCase = NativeRuntimeAssessmentInput["cases"][number];
type RuntimeStep = Extract<RuntimeCase, { steps: unknown }>["steps"][number];
/** One producer relation shared by fibre and structural rows. Structural input
 * chaining is checked below against the actual preceding admitted value. */
function nativeRuntimeStep(input: NativeRuntimeAssessmentInput, c: RuntimeCase, step: RuntimeStep,
  proof: QualificationProofResource) {
  const selected = producerForResult(proof, step.result);
  if (selected === null || !malformedSubjectMatches(selected.owner, input) || selected.state.cCall.regime !== "F_D" ||
    selected.state.cCall.callClass !== "leaf" || selected.state.cCall.programLocusRef !== step.slotRef ||
    selected.state.cCall.implementationRef !== step.implementationRef || selected.owner.execution.programRef !== c.programRef ||
    selected.owner.execution.invocationAdmissionRef !== c.invocationAdmissionRef ||
    !same(coord(selected.owner.execution.graphFunctionRef, selected.owner.execution.graphFunctionDigest), c.graphFunction) ||
    selected.state.result.resultClass !== "success" || selected.state.judgment.judgment !== "advance" ||
    !same(coord(selected.state.result.resultRef, selected.state.result.resultDigest), step.result)) return null;
  const evidence = selected.state.evidence;
  if (evidence.length !== 1 || evidence[0]!.evidenceClass !== "deterministic" ||
    evidence[0]!.implementationRef !== step.implementationRef || evidence[0]!.inputDigest !== step.inputDigest ||
    evidence[0]!.outputDigest !== selected.state.result.valueDigest) return null;
  const peers = eligibleCalls(selected.owner.events, selected.owner).map(e => nativeState(proof, e.aggregateId)).filter(s =>
    s !== null && s.state.cCall.callClass === "leaf" && s.state.cCall.programLocusRef === step.slotRef &&
    s.owner.execution.invocationAdmissionRef === c.invocationAdmissionRef && s.owner.execution.graphFunctionRef === c.graphFunction.ref &&
    s.state.result.resultClass === "success" && s.state.judgment.judgment === "advance");
  if (peers.length !== 1 || peers[0]!.state.cCall.cCallRef !== selected.state.cCall.cCallRef) return null;
  return selected;
}
/** Native evidence assessment; no test runner, caller assertion or synthetic event supplies a case. */
function nativeRuntimeCases(input: NativeRuntimeAssessmentInput, proof: QualificationProofResource): NativeRuntimeAssessment["cases"] | null {
  const cases: NativeRuntimeAssessment["cases"][number][] = [];
  for (const c of input.cases) {
    const steps = "structure" in c ? c.steps : [c];
    const sources = steps.map(step => nativeRuntimeStep(input, c, step, proof));
    if (sources.some(s => s === null)) return null;
    const first = sources[0]!, selected = sources.at(-1)!;
    if (steps[0]!.inputDigest !== first.owner.execution.rawInputDigest) return null;
    if ("structure" in c) {
      const node = one(first.owner.graph.template.nodes.filter(n => n.nodeRef === c.structure.nodeRef));
      if (node === null || node.nodeKind !== "c_locus" || hash(node.term) !== c.structure.termDigest ||
          node.term.kind !== (c.structure.kind === "atomic_call" ? "c_of" :
            c.structure.kind === "edge_program" ? "c_edge" : "c_compose")) return null;
      const terms = node.term.kind === "c_compose" ? node.term.terms : node.term.kind === "c_edge"
        ? [node.term.transform, node.term.evaluate, node.term.consequence] : [node.term];
      if (terms.length !== steps.length) return null;
      for (const [i, term] of terms.entries()) {
        const source = sources[i]!, call = source.state.cCall;
        if (term.kind !== "c_of" || term.fibre !== "F_D" || (i === terms.length - 1 && !term.resultBearing) ||
            (node.term.kind === "c_edge" && term.stageRole !== ["transform", "evaluate", "consequence"][i]) ||
            term.requirement.kind !== "executable_leaf_requirement" || term.programLocusRef !== steps[i]!.slotRef ||
            term.requirement.implementationBindingRef !== call.implementationBindingRef ||
            call.graphCallId !== first.state.cCall.graphCallId || call.runId !== first.state.cCall.runId ||
            call.frameId !== first.state.cCall.frameId || call.basisId !== first.state.cCall.basisId) return null;
        if (i > 0) {
          const previous = sources[i - 1]!;
          const judgment = one(previous.owner.events.filter(e => e.kind === "c_call_judged" && e.aggregateId === previous.state.cCall.cCallRef));
          if (judgment === null || judgment.admissionOrdinal >= source.owner.opened.admissionOrdinal ||
              steps[i]!.inputDigest !== previous.state.result.valueDigest) return null;
        }
      }
    }
    const observed = sources.map((source, i) => {
      const step = steps[i]!;
      return { cCallRef: source!.state.cCall.cCallRef, result: step.result,
        evidence: source!.state.evidence.map(e => coord(e.evidenceRef, e.evidenceDigest)),
        actualValueDigest: source!.state.result.valueDigest, matched: source!.state.result.valueDigest === step.expectedValueDigest,
        substituteRefused: producerForResult(proof, coord(step.result.ref, step.substituteResultDigest)) === null };
    });
    const facts = nativeFacts(selected.owner.prefix), terminalKey = selected.state.cCall.graphCallId;
    const runRows = selected.owner.events.filter(e => e.runId === selected.state.cCall.runId);
    const knownTerminal = facts.terminals.get(terminalKey);
    const retainedTerminal = knownTerminal !== undefined && runRows.length === knownTerminal.rows.length &&
      runRows.every((e, i) => e === knownTerminal.rows[i]) ? knownTerminal : undefined;
    const terminal = retainedTerminal?.terminal ?? GraphCallProjectionPort.graph_call_result({ kind: "abg_project_read_packet", schemaVersion: "5.0.0",
      memberKey: "graph_call_result", prefix: proof.prefix as DurablePrefixCoordinate,
      targetRef: selected.state.cCall.graphCallId, declarationProof: selected.owner.proof });
    const replay = retainedTerminal?.replay ?? projectRunTruthAtDurablePrefix(proof.prefix as DurablePrefixCoordinate, selected.state.cCall.runId);
    if (terminal.kind !== "abg_project_read_projection" || !record(terminal.value) || !record(terminal.value.terminalResult) ||
      !same(terminal.value.terminalResult.value, selected.state.result.value) ||
      replay.kind !== "abg_run_truth_projection" || replay.runtimeStatus !== "closed") return null;
    facts.terminals.set(terminalKey, { rows: runRows, terminal, replay });
    const t = terminal.value.terminalResult;
    if (!record(t.result) || typeof t.result.ref !== "string" || typeof t.result.digest !== "string") return null;
    if ("structure" in c && producerForResult(proof, coord(t.result.ref, t.result.digest))?.state.cCall.cCallRef !== selected.state.cCall.cCallRef) return null;
    cases.push({ caseRef: c.caseRef, ...observed.at(-1)!, terminal: coord(t.result.ref, t.result.digest), replay: replay.replay,
      matched: observed.every(s => s.matched), substituteRefused: observed.every(s => s.substituteRefused),
      ...("structure" in c ? { steps: observed } : {}) });
  }
  return cases;
}
export function projectNativeRuntimeAssessment(basis: QualificationNativeBasis, input: unknown, requireCurrent = false): Readonly<NativeRuntimeAssessment> | null {
  try {
    const coordinate = basis.predecessorPrefix as DurablePrefixCoordinate;
    const events = readRuntimeEventsAtDurablePrefix(coordinate, { requireCurrent });
    const facts = nativeFacts(selectValidatedRuntimeEventPrefix(events)), key = coordinate.coordinateDigest + ":" + basis.cCallRef;
    const known = facts.assessments.get(key);
    if (known !== undefined && sameFact(known.input, input)) return known.value;
    if (!isNativeRuntimeAssessmentInput(input) || !proofWithin(input.proof, basis)) return null;
    readRuntimeEventsAtDurablePrefix(reidentifyHistoricalDurablePrefixCoordinate(coordinate, input.proof.prefix as DurablePrefixCoordinate));
    const owner = projectQualificationConsumer(basis, input, requireCurrent);
    if (owner === null || owner.call.implementationRef !== RUNTIME_ASSESS) return null;
    const cases = nativeRuntimeCases(input, { ...input.proof, prefix: basis.predecessorPrefix });
    if (cases === null) return null;
    const value = constructNativeRuntimeAssessment(input, basis, cases);
    facts.assessments.set(key, { input: value.input, value });
    return value;
  } catch { return null; }
}
export function nativeRuntimeAssessmentHasNativeOwner(proof: QualificationProofResource, assessment: NativeRuntimeAssessment): boolean {
  try {
    if (!isNativeRuntimeAssessment(assessment) || !isQualificationProofResource(proof) ||
      !proofWithin({ ...proof, prefix: assessment.nativeBasis.predecessorPrefix }, { cCallRef: assessment.nativeBasis.cCallRef, predecessorPrefix: proof.prefix })) return false;
    const source = nativeState(proof, assessment.nativeBasis.cCallRef);
    if (source === null || source.state.cCall.implementationRef !== RUNTIME_ASSESS || source.state.cCall.callClass !== "leaf" ||
      source.state.result.resultClass !== "success" || source.state.judgment.judgment !== "advance" ||
      source.state.result.contractRef !== "contract://abiogenesis/qualification/native-runtime-assessment@5" ||
      source.state.result.valueKind !== "native_runtime_assessment" || !sameFact(source.owner.input, assessment.input) ||
      !sameFact(source.state.result.value, assessment) || !sameFact(projectNativeRuntimeAssessment({ ...assessment.nativeBasis,
        predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(proof.prefix as DurablePrefixCoordinate,
          assessment.nativeBasis.predecessorPrefix as DurablePrefixCoordinate) }, assessment.input), assessment)) return false;
    const peers = eligibleCalls(source.owner.events, source.owner, RUNTIME_ASSESS).map(e => nativeState(proof, e.aggregateId)).filter(s =>
      s !== null && s.state.cCall.callClass === "leaf" && s.state.cCall.implementationRef === RUNTIME_ASSESS &&
      s.state.cCall.programLocusRef === source.state.cCall.programLocusRef && s.owner.execution.invocationAdmissionRef === source.owner.execution.invocationAdmissionRef &&
      s.state.result.resultClass === "success" && s.state.judgment.judgment === "advance");
    return peers.length === 1 && peers[0]!.state.cCall.cCallRef === source.state.cCall.cCallRef &&
      nativeRuntimeCases(assessment.input, proof) !== null;
  } catch { return false; }
}
export function projectQualificationRulingForConsumer(basis: QualificationNativeBasis, input: unknown, requireCurrent = false): Readonly<QualificationOwnerRuling> | null {
  try {
    const owner = projectQualificationConsumer(basis, input, requireCurrent);
    if (owner === null || owner.call.implementationRef !== RULING) return null;
    const rows = projectFhContinuations(owner.prefix, deriveRuntimeEventCalculusProjection(owner.prefix)).filter(c =>
      c.runId === owner.call.runId && (c.status === "responded" || c.status === "resolved") && same(c.responseValue, input));
    const row = one(rows); if (row === null) return null;
    const requestOwner = graphOwner(basis.predecessorPrefix as DurablePrefixCoordinate, row.cCallRef, [owner.proof]);
    const response = one(owner.events.filter(e => e.eventId === row.respondedEventRef));
    if (requestOwner === null || requestOwner.call.regime !== "F_H" || requestOwner.call.actorCapabilityRef !== QUALIFICATION_ROLE_POLICY.authorityRef ||
        response === null || response.kind !== "fh_interaction_responded" || !record(response.payload) || typeof response.payload.actorRef !== "string" ||
        response.payload.capabilityRef !== QUALIFICATION_ROLE_POLICY.authorityRef ||
        !qualificationRulingMatches(requestOwner.input, input, response.payload.actorRef)) return null;
    return deepFreeze(input as QualificationOwnerRuling);
  } catch { return null; }
}
function proofWithin(proof: QualificationProofResource, consumer: QualificationNativeBasis): boolean {
  return same(proof.prefix.storeIdentity, consumer.predecessorPrefix.storeIdentity) &&
    proof.prefix.eventLogRef === consumer.predecessorPrefix.eventLogRef &&
    proof.prefix.prefixLength <= consumer.predecessorPrefix.prefixLength;
}
function nativeState(proof: QualificationProofResource, ref: string) {
  const owner = graphOwner(proof.prefix as DurablePrefixCoordinate, ref, proof.declarations, executionProofFacts.get(proof));
  const state = owner === null ? null : stateAt(owner);
  if (owner === null || state === null) return null;
  // These rows are consumed only after the existing native outcome projector
  // authenticates the exact evidence/result/judgment relation above.
  const evidence = owner.events.filter(e => e.kind === "c_call_evidenced" && e.aggregateId === ref &&
    record(e.payload) && state.result.evidenceRefs.includes(String(e.payload.evidenceRef))).map(e =>
      ({ ...e.payload as Record<string, JsonValue>, admissionEventRef: e.eventId }) as unknown as AdmittedCCallEvidence);
  return { owner, state: { ...state, evidence } };
}
/** Parent folds alias only through the authenticated sub-traversal evidence. */
function producerForResult(proof: QualificationProofResource, result: QualificationCoordinate) {
  const events = proofEvents(proof);
  const event = one(events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
    e.payload.resultRef === result.ref && e.payload.resultDigest === result.digest));
  if (event === null) return null;
  let current = nativeState(proof, event.aggregateId); const seen = new Set<string>();
  while (current !== null && current.state.cCall.callClass !== "leaf") {
    if (seen.has(current.state.cCall.cCallRef)) return null;
    seen.add(current.state.cCall.cCallRef);
    const evidence = one(current.state.evidence.filter(e => e.evidenceClass === "sub_traversal"));
    if (evidence?.childResultRef === undefined || evidence.childResultDigest === undefined) return null;
    const child = one(events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
      e.payload.resultRef === evidence.childResultRef && e.payload.resultDigest === evidence.childResultDigest));
    if (child === null || child.graphCallId !== evidence.childGraphCallId) return null;
    const next = nativeState(proof, child.aggregateId);
    if (next === null || !same(current.state.result.value, next.state.result.value)) return null;
    current = next;
  }
  return current;
}
/** A selection cannot manufacture slots by assigning result IDs. */
export function projectQualificationJudgment(proof: QualificationProofResource, plan: QualificationAssessmentPlan,
  selection: Extract<QualificationEvidenceSelection, { kind: "judgment_selection" }>): Readonly<QualificationJudgment> | null {
  try {
    if (!isQualificationProofResource(proof) || !qualificationPlanMatches(plan)) return null;
    const slot = one(plan.slots.filter(s => s.slotRef === selection.slotRef));
    if (slot === null || !same(slot.task, selection.task)) return null;
    const selected = producerForResult(proof, selection.result);
    if (selected === null || selected.owner.execution.programRef !== selection.programRef ||
        selected.owner.execution.invocationAdmissionRef !== selection.invocationAdmissionRef) return null;
    const eligible: { cCallRef: string; value: QualificationJudgment }[] = [];
    for (const event of selected.owner.events.filter(e => e.kind === "c_call_opened")) {
      const candidate = nativeState(proof, event.aggregateId);
      if (candidate === null || candidate.state.cCall.callClass !== "leaf" || candidate.state.cCall.implementationRef !== ASSESS ||
          candidate.owner.execution.programRef !== selection.programRef || candidate.owner.execution.invocationAdmissionRef !== selection.invocationAdmissionRef ||
          candidate.state.result.resultClass !== "success" || candidate.state.judgment.judgment !== "advance" ||
          !isQualificationAssessmentInput(candidate.owner.input) || !same(candidate.owner.input.plan, plan) ||
          candidate.owner.input.task.slotRef !== slot.slotRef || candidate.owner.input.task.taskDigest !== slot.task.digest ||
          candidate.state.cCall.graphFunctionRef !== slot.graphFunctionRef || candidate.state.cCall.programLocusRef !== slot.programLocusRef ||
          !isQualificationJudgment(candidate.state.result.value)) continue;
      const value = candidate.state.result.value, transport = one(candidate.state.evidence.filter(e => e.evidenceClass === "probabilistic_transport"));
      const request = qualificationWorkerRequest(candidate.owner.input);
      if (!same(value.task, candidate.owner.input.task) || !same(value.plan, plan) ||
          !qualificationRawMatches(candidate.owner.input, value.raw) || projectQualificationConsumer(value.nativeBasis, candidate.owner.input) === null ||
          value.source.cCallRef !== candidate.state.cCall.cCallRef || transport === null ||
          transport.transportDisposition !== "success" || transport.transportFailureClass !== null ||
          transport.actorRef !== slot.role.actorRef || transport.workerBindingRef !== slot.role.workerBindingRef ||
          transport.rendererRef !== slot.role.rendererRef || transport.materializationPlanRef !== slot.role.materializationPlanRef ||
          transport.instructionContractRef !== request.instructionContractRef || transport.resultContractRef !== request.resultContractRef ||
          transport.requestDigest !== hash(request) || transport.promptDigest !== hash(request.prompt) ||
          value.source.requestDigest !== transport.requestDigest || value.source.actorInvocationRef !== transport.actorInvocationRef ||
          value.source.transportBindingRef !== transport.transportBindingRef || value.source.transportBindingDigest !== transport.transportBindingDigest ||
          value.source.rawValueDigest !== hash(value.raw)) continue;
      const artifact = one(candidate.owner.events.filter(e => e.kind === "actor_result_artifact_observed" &&
        e.aggregateId === value.source.actorInvocationRef && e.parentAggregateId === candidate.state.cCall.cCallRef));
      if (artifact === null || !record(artifact.payload) || typeof artifact.payload.finalOutput !== "string" ||
          !same(JSON.parse(artifact.payload.finalOutput), value.raw)) continue;
      const { cCallRef: _call, requestRef: _request, requestDigest: _digest, ...observation } = artifact.payload;
      if (hash(observation) !== value.source.observationDigest || value.source.inputDigest !== hash(candidate.owner.input) ||
          value.source.actorRef !== transport.actorRef || value.source.workerBindingRef !== transport.workerBindingRef ||
          value.source.promptDigest !== transport.promptDigest) continue;
      eligible.push({ cCallRef: candidate.state.cCall.cCallRef, value });
    }
    return eligible.length === 1 && eligible[0]!.cCallRef === selected.state.cCall.cCallRef ? deepFreeze(eligible[0]!.value) : null;
  } catch { return null; }
}
export function projectQualificationOwnerRuling(proof: QualificationProofResource, plan: QualificationAssessmentPlan,
  selection: Extract<QualificationEvidenceSelection, { kind: "ruling_selection" }>): Readonly<QualificationOwnerRuling> | null {
  try {
    const events = readRuntimeEventsAtDurablePrefix(proof.prefix as DurablePrefixCoordinate), prefix = selectValidatedRuntimeEventPrefix(events);
    const rows = projectFhContinuations(prefix, deriveRuntimeEventCalculusProjection(prefix)).filter(c =>
      c.continuationRef === selection.continuationRef && c.requestRef === selection.request.ref &&
      c.requestDigest === selection.request.digest && (c.status === "responded" || c.status === "resolved"));
    const row = one(rows); if (row === null) return null;
    const owner = graphOwner(proof.prefix as DurablePrefixCoordinate, row.cCallRef, proof.declarations);
    const response = one(events.filter(e => e.eventId === row.respondedEventRef));
    if (owner === null || owner.call.regime !== "F_H" || owner.call.actorCapabilityRef !== plan.ownerAuthorityRef ||
        response === null || response.kind !== "fh_interaction_responded" || !record(response.payload) || response.payload.actorRef !== plan.ownerActorRef || response.payload.capabilityRef !== plan.ownerAuthorityRef ||
        !record(owner.input) || owner.input.slotRef !== selection.slotRef || owner.input.actorRef !== plan.ownerActorRef ||
        !same(owner.input.subjectBasis, plan.subjectBasis) || !same(owner.input.lawBasis, plan.lawBasis) ||
        !qualificationRulingMatches(owner.input, row.responseValue, response.payload.actorRef)) return null;
    return deepFreeze(row.responseValue as unknown as QualificationOwnerRuling);
  } catch { return null; }
}
/** Missing or conflicting attribution is blocked. This validates a concrete
 * record chain under the declared trusted-desktop authority; labels alone fail. */
export function projectQualificationConstructionAuthors(proof: QualificationProofResource, plan: QualificationAssessmentPlan,
  judgment: QualificationJudgment): readonly string[] | null {
  try {
    const provenance = judgment.task.provenance;
    if (!same(provenance.subjectInventory, judgment.task.inventory)) return null;
    if (provenance.kind === "native_construction") {
      const actors: string[] = [], covered = new Set<string>();
      if (!unique(provenance.producers.map(p => p.cCallRef))) return null;
      for (const p of provenance.producers) {
        const source = producerForResult(proof, p.result);
        if (source === null || source.state.cCall.cCallRef !== p.cCallRef || source.state.result.resultClass !== "success" ||
            source.state.judgment.judgment !== "advance" || source.state.cCall.implementationRef !== WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef ||
            !isWorksiteCandidateBundle(source.state.result.value)) return null;
        // C1's actual admitted candidate owner establishes byte authorship,
        // not C0 publication success. Scope derives from its typed target/file
        // relation and this frozen subject, never from an unused caller label.
        const bundle = source.state.result.value;
        const actualScope = judgment.task.subjectMembers.filter(m => bundle.task.targets.some(t => {
          if (t.subject.relativePath !== m.path) return false;
          const files = bundle.files.filter(f => f.targetRef === t.targetRef);
          if (files.length !== 1) return false;
          const bytes = Buffer.from(files[0]!.replacementBase64, "base64");
          return bytes.length === m.byteCount && sha256Bytes(bytes) === m.digest;
        })).map(m => m.ref);
        if (actualScope.length === 0 || !unique(p.scopeRefs) || !same([...actualScope].sort(), [...p.scopeRefs].sort())) return null;
        const transport = one(source.state.evidence.filter(e => e.evidenceClass === "probabilistic_transport"));
        if (transport === null || transport.actorRef !== p.actorRef || transport.workerBindingRef !== p.workerBindingRef) return null;
        actors.push(p.actorRef);
        actualScope.forEach(ref => covered.add(ref));
      }
      return judgment.task.subjectMembers.every(m => covered.has(m.ref)) ? [...new Set(actors)] : null;
    }
    const attribution = projectExternalConstructionAttribution(judgment, plan);
    if (attribution.status === "invalid") return null;
    const identityPairs = provenance.chains.map(c => ({ authorRef: c.authorRef, actorIdentityRef: c.actorIdentityRef }));
    const adequate = attribution.status === "grounded";
    if (!adequate) {
      const selected = proof.selections.filter(s => s.kind === "ruling_selection" && s.selectionRef === provenance.acknowledgmentSelectionRef);
      if (selected.length !== 1 || selected[0]!.kind !== "ruling_selection") return null;
      const ruling = projectQualificationOwnerRuling(proof, plan, selected[0]!);
      if (ruling?.disposition !== "acknowledged") return null;
      const selectedContinuationRef = selected[0]!.continuationRef;
      const events = proofEvents(proof);
      const continuation = projectFhContinuations(selectValidatedRuntimeEventPrefix(events), deriveRuntimeEventCalculusProjection(selectValidatedRuntimeEventPrefix(events)))
        .find(c => c.continuationRef === selectedContinuationRef);
      const request = continuation === undefined ? null : graphOwner(proof.prefix as DurablePrefixCoordinate, continuation.cCallRef, proof.declarations)?.input;
      if (!record(request) || !same(request.recordSet, provenance.recordSet) || !same(request.attributedIdentities, identityPairs)) return null;
    }
    return [...new Set(identityPairs.map(p => p.actorIdentityRef))];
  } catch { return null; }
}
export function resolveQualificationAssessments(proof: QualificationProofResource, plan: QualificationAssessmentPlan,
  consumer: QualificationNativeBasis): readonly Readonly<QualificationJudgment>[] | null {
  try {
    if (!proofWithin(proof, consumer) || !qualificationPlanMatches(plan)) return null;
    // Re-read the exact resource prefix: a declared earlier prefix cannot stand
    // for bytes from another store, even when their values match.
    readRuntimeEventsAtDurablePrefix(proof.prefix as DurablePrefixCoordinate);
    const currentProof = { ...proof, prefix: consumer.predecessorPrefix };
    const out: QualificationJudgment[] = [];
    for (const slot of plan.slots) {
      const selections = proof.selections.filter((s): s is Extract<QualificationEvidenceSelection, { kind: "judgment_selection" }> =>
        s.kind === "judgment_selection" && s.slotRef === slot.slotRef);
      if (selections.length !== 1) return null;
      const judgment = projectQualificationJudgment(currentProof, plan, selections[0]!);
      if (judgment === null) return null;
      const authors = projectQualificationConstructionAuthors(currentProof, plan, judgment);
      if (authors === null || slot.role.independence !== "not_required" && authors.includes(judgment.source.actorRef)) return null;
      out.push(judgment);
    }
    if (plan.sharedCoverage === "declared_independent_peers" && !unique(out.map(j => j.source.actorInvocationRef))) return null;
    return deepFreeze(out);
  } catch { return null; }
}
/** Exact finite tenant/public/capability ownership is native install data;
 * realization and evidence adequacy remain the declared assessment's task. */
export function qualificationTenantClaimsMatch(basis: QualificationNativeBasis, input: unknown, manifest: TenantConformanceManifest): boolean {
  try {
    const owner = graphOwner(basis.predecessorPrefix as DurablePrefixCoordinate, basis.cCallRef, declarationsOf(input));
    if (owner === null) return false;
    const install = one(owner.environment.productInstalls.filter(i => i.productId === manifest.productId));
    if (install === null || !same(manifest.publicContractCatalog, coord(install.catalogId, install.catalogDigest)) ||
        !same(manifest.capabilityDefinitionGraph, coord(install.capabilityDefinitionGraph.graphId, install.capabilityDefinitionGraph.graphDigest))) return false;
    return manifest.claims.every(claim => {
      const row = one(install.capabilityDefinitionGraph.rows.filter(r => r.capabilityId === claim.capabilityRef || r.capabilityDefinitionRef === claim.capabilityRef));
      return row !== null && claim.publicContractRefs.every(ref => install.publicContracts.filter(c => c.contractId === ref &&
        c.owningProduct === install.productId && c.capabilityIdentities.includes(row.capabilityId)).length === 1);
    });
  } catch { return false; }
}
/** Runtime location is a producer fact. Every other exact qualification field
 * is conserved, including source, release claim, toolchain, catalog and law. */
function sameImmutableCandidate(a: ExactCandidateQualification<"basis">, b: ExactCandidateQualification<"basis">): boolean {
  if (!qualificationIdentity(a, "basisRef", "basisDigest", "qualification-basis://abiogenesis/") ||
      !qualificationIdentity(b, "basisRef", "basisDigest", "qualification-basis://abiogenesis/")) return false;
  const immutable = ({ basisRef: _r, basisDigest: _d, installedProduct: _i, workspaceBinding: _w, ...value }: ExactCandidateQualification<"basis">) => value;
  return same(immutable(a), immutable(b));
}
function executionSourceProofs(proof: QualificationProofResource, basis: ExactCandidateQualification<"basis">,
  consumer: QualificationNativeBasis, requireCurrent = false): Map<string, QualificationProofResource> | null {
  if (!isQualificationProofResource(proof) || !proofWithin(proof, consumer)) return null;
  const sources = proof.executionSources ?? [], selections = proof.selections.filter(s => s.kind === "execution_selection"),
    refs = new Set(selections.flatMap(s => s.source === undefined ? [] : [s.source.sourceRef]));
  if (!unique(sources.map(s => s.sourceRef)) || !unique(sources.map(s => hash([s.prefix, s.basis, s.declarations]))) ||
      refs.size !== sources.length || sources.some(s => !refs.has(s.sourceRef))) return null;
  const events = readRuntimeEventsAtDurablePrefix(consumer.predecessorPrefix as DurablePrefixCoordinate),
    facts = nativeFacts(selectValidatedRuntimeEventPrefix(events)), out = new Map<string, QualificationProofResource>(),
    acquired = new Map<string, ExecutionSourceFacts>(), currentChecked = new Set<string>();
  for (const source of sources) {
    if (!sameImmutableCandidate(source.basis, basis) || source.basis.installedProduct === null || source.basis.workspaceBinding === null) return null;
    const key = consumer.cCallRef + ":" + consumer.predecessorPrefix.coordinateDigest + ":" + source.sourceRef;
    const known = facts.executionSources.get(key);
    const prefixKey = hash(source.prefix);
    const retained = known !== undefined && sameFact(known.declaration, source) ? executionProofFacts.get(known.proof) : undefined;
    // Artifact truth authenticates cold ingress and owns its one event array.
    // Equal caller data alone cannot supply this private acquisition relation.
    const sourceFacts = acquired.get(prefixKey) ?? retained ?? acquireExecutionSource(source.prefix as DurablePrefixCoordinate);
    if (sourceFacts === null) return null;
    // Observe replacement/advance/truncation at each current consumer without
    // decoding or retaining another copy of already authenticated history.
    if (requireCurrent && !currentChecked.has(prefixKey)) {
      assertDurableRuntimePrefixCurrent(sourceFacts.artifactTruth!.prefix);
      currentChecked.add(prefixKey);
    }
    acquired.set(prefixKey, sourceFacts);
    if (retained !== undefined && known !== undefined) {
      out.set(source.sourceRef, known.proof); continue;
    }
    const sourceProof: QualificationProofResource = { kind: proof.kind, schemaVersion: proof.schemaVersion,
      prefix: sourceFacts.artifactTruth!.prefix, declarations: source.declarations, selections: [] };
    executionProofFacts.set(sourceProof, sourceFacts);
    facts.executionSources.set(key, { declaration: deepFreeze(source), proof: sourceProof });
    out.set(source.sourceRef, sourceProof);
  }
  return out;
}
/** Existing native Result/C/J ownership is shared evidence, not a new gate.
 * Material includes actual disposition and evidence; F11 independently judges
 * its applicability and sufficiency for each source-grounded coverage claim. */
export function resolveQualificationExecutionEvidence(proof: QualificationProofResource,
  basis: ExactCandidateQualification<"basis">, consumer: QualificationNativeBasis): readonly QualificationMaterial[] | null {
  return resolveQualificationExecutionMaterial(proof, basis, consumer)?.evidence ?? null;
}
/** The existing join resolves each producer once for both general assessment
 * material and the selected QUAL-056 projection. This is no new proof carrier. */
export function resolveQualificationExecutionMaterial(proof: QualificationProofResource,
  basis: ExactCandidateQualification<"basis">, consumer: QualificationNativeBasis,
  verificationSelection?: QualificationVerificationSelection,
  inventory?: QualificationSubjectInventory | null): { evidence: readonly QualificationMaterial[]; verification: QualificationVerificationMaterial | null } | null {
  try {
    if (!isQualificationProofResource(proof) || !proofWithin(proof, consumer)) return null;
    readRuntimeEventsAtDurablePrefix(proof.prefix as DurablePrefixCoordinate);
    const current = { ...proof, prefix: consumer.predecessorPrefix };
    const selections = proof.selections.filter(s => s.kind === "execution_selection"), sources = executionSourceProofs(proof, basis, consumer);
    if (sources === null || !unique(selections.map(s => s.selectionRef)) || !unique(selections.map(s => s.result.ref))) return null;
    const producers = new Set<string>();
    const material: QualificationMaterial[] = [];
    let verification: QualificationVerificationMaterial | null = null;
    for (const selection of selections) {
      const sourceProof = selection.source === undefined ? current : sources.get(selection.source.sourceRef);
      if (sourceProof === undefined) return null;
      const sourceBasis = selection.source === undefined ? basis : proof.executionSources!.find(s => s.sourceRef === selection.source!.sourceRef)!.basis;
      const selected = producerForResult(sourceProof, selection.result);
      if (selected === null || selected.state.cCall.programLocusRef !== selection.slotRef ||
          selected.owner.execution.programRef !== selection.programRef ||
          selected.owner.execution.invocationAdmissionRef !== selection.invocationAdmissionRef) return null;
      if (selection.source !== undefined && (!same(selection.source.cCall, coord(selected.state.cCall.cCallRef, selected.state.cCall.cCallDigest)) ||
          !same(selection.source.executionBasis, coord(selected.owner.execution.basisRef, selected.owner.execution.basisDigest)) ||
          !same(selection.source.graphFunction, coord(selected.owner.execution.graphFunctionRef, selected.owner.execution.graphFunctionDigest)))) return null;
      const producerKey = sourceProof.prefix.eventLogRef + ":" + hash(sourceProof.prefix.storeIdentity) + ":" + selected.state.cCall.cCallRef;
      if (producers.has(producerKey)) return null;
      producers.add(producerKey);
      const peers = eligibleCalls(selected.owner.events, selected.owner).map(e => nativeState(sourceProof, e.aggregateId)).filter(s =>
        s !== null && s.state.cCall.programLocusRef === selection.slotRef && s.owner.execution.programRef === selection.programRef &&
        s.owner.execution.invocationAdmissionRef === selection.invocationAdmissionRef && s.state.result.resultClass === "success" &&
        s.state.judgment.judgment === "advance");
      if (peers.some(s => s!.state.cCall.cCallRef !== selected.state.cCall.cCallRef)) return null;
      const install = one(selected.owner.environment.productInstalls.filter(i => i.productId === basis.productId));
      if (install === null || install.packageVersion !== basis.productVersion || install.artifactDigest !== basis.artifact.digest ||
          install.productContentDigest !== basis.productContentDigest || install.manifestDigest !== basis.productManifest.digest ||
          install.manifestDigest !== basis.toolchain.digest || !same(sourceBasis.installedProduct, coord(install.installId, hash(install))) ||
          !same(sourceBasis.workspaceBinding, coord(selected.owner.execution.workspaceBindingId, selected.owner.execution.workspaceBindingDigest))) return null;
      const value = selected.state.result.value;
      if (selected.state.cCall.implementationRef === MALFORMED_ASSESS &&
          (!isMalformedGtlAssessment(value) || !same(value.input.basis, sourceBasis) || !malformedGtlAssessmentHasNativeOwner(sourceProof, value))) return null;
      if (selected.state.cCall.implementationRef === RUNTIME_ASSESS &&
          (!isNativeRuntimeAssessment(value) || !same(value.input.basis, sourceBasis) || !nativeRuntimeAssessmentHasNativeOwner(sourceProof, value))) return null;
      if (verificationSelection?.executionSelectionRef === selection.selectionRef && inventory != null &&
          selected.state.cCall.implementationRef === WORKSITE_COMMAND_EXECUTION_IDS.implementationRef &&
          selected.owner.execution.basisClass === "root" && selected.owner.execution.programRef === WORKSITE_COMMAND_EXECUTION_IDS.programRef &&
          selected.owner.execution.graphFunctionRef === WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef &&
          selected.state.cCall.regime === "F_P" && selected.state.result.resultClass === "success" &&
          selected.state.result.contractRef === WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef &&
          selected.state.judgment.judgment === "advance" && isObservedWorksiteCommandExecutionObservation(value) &&
          same(selected.owner.input, value.task) &&
          same(sourceBasis.workspaceBinding, coord(value.task.workspaceBinding.bindingId, value.task.workspaceBinding.bindingDigest))) {
        verification = constructQualificationVerificationMaterial({ basis, inventory, selection: verificationSelection,
          execution: selection.result, cCall: coord(selected.state.cCall.cCallRef, selected.state.cCall.cCallDigest), observation: value });
      }
      const raw = Buffer.from(canonicalJson({ result: selected.state.result, judgment: selected.state.judgment,
        evidence: selected.state.evidence, ...(selection.source === undefined ? {} : { origin: {
          subjectBasis: coord(basis.basisRef, basis.basisDigest), lawBasis: basis.lawBasis, sourceBasis,
          prefix: sourceProof.prefix, cCall: selection.source.cCall, executionBasis: selection.source.executionBasis,
          programRef: selected.owner.execution.programRef, invocationAdmissionRef: selected.owner.execution.invocationAdmissionRef,
          graphFunction: selection.source.graphFunction, input: selected.owner.input,
          catalogBasisDigest: selected.owner.proof.catalog.basisDigest,
          catalogViewDigest: selected.owner.proof.catalogView.viewDigest,
        } }) } as unknown as JsonValue));
      material.push({ ref: selection.result.ref, path: selection.result.ref, digest: sha256Bytes(raw),
        byteCount: raw.length, contentBase64: raw.toString("base64") });
    }
    return deepFreeze({ evidence: material, verification });
  } catch { return null; }
}
/** One whole F11 result replaces the per-behavior owning-result adapters.
 * Current competing producers still refuse; wrapper aliases are resolved by
 * the existing sub-traversal relation, never treated as independent evidence. */
export function projectQualificationSelfConformance(proof: QualificationProofResource,
  selection: Extract<QualificationEvidenceSelection, { kind: "self_conformance_selection" }>,
  basis: ExactCandidateQualification<"basis">): Readonly<QualificationSelfConformanceSummary> | null {
  try {
    const selected = producerForResult(proof, selection.result);
    if (selected === null || selected.state.cCall.implementationRef !== SELF ||
        selected.state.cCall.programLocusRef !== selection.slotRef ||
        selected.state.result.contractRef !== "contract://abiogenesis/qualification/self-conformance/output@5" ||
        selected.state.result.resultClass !== "success" || selected.state.judgment.judgment !== "advance" ||
        selected.owner.execution.programRef !== selection.programRef ||
        selected.owner.execution.invocationAdmissionRef !== selection.invocationAdmissionRef) return null;
    const peers = eligibleCalls(selected.owner.events, selected.owner, SELF).map(e => nativeState(proof, e.aggregateId)).filter(s =>
      s !== null && s.state.cCall.callClass === "leaf" && s.state.cCall.implementationRef === SELF &&
      s.state.cCall.programLocusRef === selection.slotRef && s.owner.execution.invocationAdmissionRef === selection.invocationAdmissionRef &&
      s.state.result.resultClass === "success" && s.state.judgment.judgment === "advance");
    if (peers.length !== 1 || peers[0]!.state.cCall.cCallRef !== selected.state.cCall.cCallRef) return null;
    const value = selected.state.result.value;
    if (!isSelfConformanceResult(value) || !same(value.subjectBasis, coord(basis.basisRef, basis.basisDigest)) ||
        !same(value.lawBasis, basis.lawBasis)) return null;
    return deepFreeze({ subjectBasis: value.subjectBasis, lawBasis: value.lawBasis,
      disposition: value.disposition === "passed" ? "green" : value.disposition === "failed" ? "red" : "blocked",
      assessment: coord(selected.state.result.resultRef, selected.state.result.resultDigest),
      bypassRefs: value.findings.filter(f => f.disposition === "accepted_reentry").flatMap(f => f.evidenceRefs),
      ...(value.verification === undefined ? {} : { verification: value.verification }) });
  } catch { return null; }
}
export function qualificationHasNativeSelfConformance(input: QualificationVerdictInput, consumer: QualificationNativeBasis): boolean {
  try {
    if (!isQualificationVerdictInput(input) || !proofWithin(input.proof, consumer)) return false;
    readRuntimeEventsAtDurablePrefix(reidentifyHistoricalDurablePrefixCoordinate(
      consumer.predecessorPrefix as DurablePrefixCoordinate, input.proof.prefix as DurablePrefixCoordinate));
    const selections = input.proof.selections.filter((s): s is Extract<QualificationEvidenceSelection, { kind: "self_conformance_selection" }> =>
      s.kind === "self_conformance_selection" && s.selectionRef === input.selectionRef);
    if (selections.length !== 1) return false;
    const actual = projectQualificationSelfConformance({ ...input.proof, prefix: consumer.predecessorPrefix }, selections[0]!, input.basis);
    return actual !== null && same(actual, input.selfConformance);
  } catch { return false; }
}
/** AF22 construction belongs to its authenticated immutable preparation cut.
 * The retained input is the admitted owner's value, never a caller-editable
 * wrapper. A new cut or changed input must establish the relation anew. */
export function projectExactCandidateQualification(basis: QualificationNativeBasis, input: unknown, requireCurrent = false): Readonly<ExactCandidateQualification<"verdict">> | null {
  try {
    const coordinate = basis.predecessorPrefix as DurablePrefixCoordinate;
    const events = readRuntimeEventsAtDurablePrefix(coordinate, { requireCurrent });
    const facts = nativeFacts(selectValidatedRuntimeEventPrefix(events)), key = coordinate.coordinateDigest + ":" + basis.cCallRef;
    const known = facts.verdicts.get(key);
    if (known !== undefined && sameFact(known.input, input)) return known.value;
    const owner = projectQualificationConsumer(basis, input, requireCurrent);
    if (owner === null || owner.call.implementationRef !== VERDICT ||
        !qualificationHasNativeSelfConformance(input as QualificationVerdictInput, basis)) return null;
    const value = reduceExactCandidateQualification(input as QualificationVerdictInput, basis);
    facts.verdicts.set(key, { input: owner.input as unknown as QualificationVerdictInput, value });
    return value;
  } catch { return null; }
}
/** D6 consumes the sole AF22 verdict; it never reinterprets F11 findings. */
export function projectQualificationVerdict(input: Readonly<{
  proof: QualificationProofResource; selection: Extract<QualificationEvidenceSelection, { kind: "verdict_selection" }>;
  subjectBasis: QualificationCoordinate; lawBasis: QualificationCoordinate;
}>): Readonly<ExactCandidateQualification<"verdict">> | null {
  try {
    const selected = producerForResult(input.proof, input.selection.result);
    if (selected === null || selected.state.cCall.implementationRef !== VERDICT ||
        selected.state.cCall.programLocusRef !== input.selection.slotRef ||
        selected.owner.execution.programRef !== input.selection.programRef ||
        selected.owner.execution.invocationAdmissionRef !== input.selection.invocationAdmissionRef ||
        selected.state.result.resultClass !== "success" || selected.state.judgment.judgment !== "advance" ||
        !isQualificationVerdict(selected.state.result.value)) return null;
    const value = selected.state.result.value;
    if (!same(value.subjectBasis, input.subjectBasis) || !same(value.lawBasis, input.lawBasis)) return null;
    const originalInput = selected.owner.input as unknown as QualificationVerdictInput;
    const nativeBasis = { ...value.nativeBasis, predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(
      input.proof.prefix as DurablePrefixCoordinate, value.nativeBasis.predecessorPrefix as DurablePrefixCoordinate) };
    if (!sameFact(projectExactCandidateQualification(nativeBasis, originalInput), value)) return null;
    const peers = eligibleCalls(selected.owner.events, selected.owner, VERDICT).map(e => nativeState(input.proof, e.aggregateId)).filter(s =>
      s !== null && s.state.cCall.callClass === "leaf" && s.state.cCall.implementationRef === VERDICT &&
      s.owner.execution.invocationAdmissionRef === input.selection.invocationAdmissionRef &&
      s.state.cCall.programLocusRef === input.selection.slotRef && s.state.result.resultClass === "success" && s.state.judgment.judgment === "advance");
    if (peers.length !== 1 || peers[0]!.state.cCall.cCallRef !== selected.state.cCall.cCallRef) return null;
    const facts = nativeFacts(selected.owner.prefix), terminalKey = selected.state.cCall.graphCallId;
    const runRows = selected.owner.events.filter(e => e.runId === selected.state.cCall.runId);
    const knownTerminal = facts.terminals.get(terminalKey);
    const retainedTerminal = knownTerminal !== undefined && runRows.length === knownTerminal.rows.length &&
      runRows.every((e, i) => e === knownTerminal.rows[i]) ? knownTerminal : undefined;
    const terminal = retainedTerminal?.terminal ?? GraphCallProjectionPort.graph_call_result({ kind: "abg_project_read_packet", schemaVersion: "5.0.0",
      memberKey: "graph_call_result", prefix: input.proof.prefix as DurablePrefixCoordinate,
      targetRef: selected.state.cCall.graphCallId, declarationProof: selected.owner.proof });
    if (terminal.kind !== "abg_project_read_projection" || !record(terminal.value) ||
        !record(terminal.value.terminalResult) || !same(terminal.value.terminalResult.value, value)) return null;
    return deepFreeze(value);
  } catch { return null; }
}
/** Exact current conformance owner, including child use. Catalog bytes remain
 * the immutable installed asset; assessment resources never replace it. */
export function resolveQualificationSelfConformanceOwner(basis: QualificationNativeBasis, input: unknown, requireCurrent = false): SelfConformanceOwner | null {
  try {
    const owner = projectQualificationConsumer(basis, input, requireCurrent);
    if (owner === null || owner.call.implementationRef !== SELF || owner.resolution === null) return null;
    const row = owner.resolution;
    const install = one(owner.environment.productInstalls.filter(i => i.productId === row.implementationOwnerProductId &&
      i.packageName === row.packageName && i.packageVersion === row.packageVersion));
    if (install === null) return null;
    const asset = one(install.publicContracts.filter(c => c.contractId === "abg.asset.qualification.rule-catalog"));
    if (asset?.assetLocator?.path !== "contracts/qualification/rule-catalog.json") return null;
    const bytes = readFileSync(join(install.installedRoot, asset.assetLocator.path));
    if (sha256Bytes(bytes) !== asset.assetLocator.contentDigest) return null;
    const catalog = JSON.parse(bytes.toString("utf8"));
    return deepFreeze({ installId: install.installId, installDigest: hash(install), artifactDigest: install.artifactDigest,
      productId: install.productId, productVersion: install.packageVersion, productContentDigest: install.productContentDigest,
      manifestDigest: install.manifestDigest, publicationDigest: hash(owner.publication),
      workspaceBinding: coord(owner.execution.workspaceBindingId, owner.execution.workspaceBindingDigest),
      executionBasis: coord(owner.execution.basisRef, owner.execution.basisDigest), cCallDigest: owner.call.cCallDigest,
      nativeBasis: basis, catalogDigest: sha256Bytes(bytes), catalogRef: catalog.catalogRef, catalogVersion: catalog.catalogVersion,
      catalogAssetPath: asset.assetLocator.path });
  } catch { return null; }
}
