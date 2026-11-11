import { runtimeEventBodiesAtPrefix, indexedRuntimeEvents, type RuntimeEventPrefix } from "./event_prefix.js";
import type { RuntimeEventScan } from "./runtime_history.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { authenticateOwnedSemanticJobBasis } from "./semantic_job.js";
import { worksiteRevisionPhysicalMatches } from "./worksite_revision.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { isWorksitePreparationInput, rederiveWorksiteCommandTask } from "../product/worksite_preparation.js";
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { materializeGraph } from "../gtl/materialize.js";
import { SEMANTIC_IMPLEMENTATION_REFS, SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { validSemanticProgramOwners } from "../gtl/semantic_stage.js";
import type { SemanticStageDeclaration } from "../gtl/semantic_stage.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { pathRelation, pathStrictlyConfined } from "../shared/path_confinement.js";
import { deepFreeze } from "../shared/immutable.js";
import { rehydrateExecutionBasisAtPrefix, authenticateOwnedNativeInstructionAssemblyBasis, constructNativeInstructionAssemblyBasis, type ExecutionBasis } from "./execution_basis.js";
import { type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import type { ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import { projectOpenedCCallCarrierAtPrefix, projectAdmittedCCallStateAtPrefix,
  type CCall, type RehydratedAdmittedCCallState } from "./c_call.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope,
  deriveSemanticWorksitePreparation, type SemanticStageEnvelope, type SemanticActorSource, type SemanticWorksiteBasis } from "../product/semantic_stage.js";
import { rehydrateInvocationAdmissionAtPrefix } from "./invocation_admission.js";
import { constructWorksiteObservation } from "../product/worksite_effect.js";
import { WORKSITE_COMMAND_EXECUTION_IDS, isWorksiteCommandExecutionObservation, type WorksiteCommandAmbientEnvironment, type WorksiteCommandExecutionLimits } from "../product/worksite_command_execution.js";
import { WORKSITE_CONSTRUCTION_IDS, isWorksiteConstructionResult } from "../product/worksite_construction.js";
import { readFileSync, lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { sha256Bytes } from "../shared/digests.js";
import { canonicalEquals, presentMember } from "../shared/value/index.js";
import { onlyExactMatch, type ExactMatch } from "../shared/select/index.js";
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;

export interface SemanticStageNativeBasis {
  readonly publication: Readonly<ModulePublication>;
  readonly lifecyclePublication?: Readonly<ModulePublication>;
  readonly sourcePublication?: Readonly<ModulePublication>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly declarationGraphFunctions: readonly Readonly<GraphFunction>[];
  readonly executionBasis: Readonly<ExecutionBasis>;
  readonly cCall: Readonly<CCall>;
  readonly cursor: Readonly<TraversalCursorCandidate>;
  readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
  /** The selected command execution limits, read once by the validating
   * reader where the basis is constructed; `null` when the reader refuses or
   * the basis is rebuilt for result admission, which selects no limits. */
  readonly commandExecutionLimits: Readonly<WorksiteCommandExecutionLimits> | null;
  /** The ambient command environment rows, read once by the one reader where
   * the basis is constructed; `null` when the reader refuses. Only the live
   * native semantic constructors read it; every re-deriver re-derives under the
   * bound law from the recorded task, so the basis rebuilt for result admission
   * carries none. */
  readonly commandAmbientEnvironment?: WorksiteCommandAmbientEnvironment | null;
}
const hash = (x: JsonValue) => sha256Canonical(x);
function record(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function owningGraph(prefix: RuntimeEventPrefix, publication: Readonly<ModulePublication>, basisRef: string, graphFunctions: readonly Readonly<GraphFunction>[] = publication.graphFunctions) {
  const execution = rehydrateExecutionBasisAtPrefix(prefix, basisRef);
  if (execution === null) return null;
  const functions = graphFunctions.filter(g => g.name === execution.graphFunctionRef && hash(g) === execution.graphFunctionDigest);
  if (functions.length !== 1) return null;
  const graph = materializeGraph(functions[0]!, { invocationAdmissionRef: execution.invocationAdmissionRef,
    admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
  if (graph.materializationRef !== execution.graphRef || graph.materializationDigest !== execution.graphDigest) return null;
  return { execution, graph, graphFunction: functions[0]! };
}

/** Reuses the native CCall outcome projector; raw event payloads are not authority. */
export function projectSemanticPredecessorAtPrefix(
  prefix: ValidatedRuntimeEventPrefix, events: readonly RuntimeEvent[], publication: Readonly<ModulePublication>, cCallRef: string, graphFunctions?: readonly Readonly<GraphFunction>[] ,
): RehydratedAdmittedCCallState | null;
/** @internal */
export function projectSemanticPredecessorAtPrefix(
  prefix: RuntimeEventPrefix, events: RuntimeEventScan, publication: Readonly<ModulePublication>, cCallRef: string, graphFunctions?: readonly Readonly<GraphFunction>[] ,
): RehydratedAdmittedCCallState | null;
export function projectSemanticPredecessorAtPrefix(
  prefix: RuntimeEventPrefix, events: RuntimeEventScan, publication: Readonly<ModulePublication>, cCallRef: string, graphFunctions: readonly Readonly<GraphFunction>[] = publication.graphFunctions,
): RehydratedAdmittedCCallState | null {
  try {
    const selected = indexedRuntimeEvents(prefix, "related:" + cCallRef);
    const opened = selected.find(e => e.kind === "c_call_opened" && e.aggregateId === cCallRef);
    if (opened?.basisId === undefined) return null;
    const owner = owningGraph(prefix, publication, opened.basisId, graphFunctions);
    if (owner === null) return null;
    const call = projectOpenedCCallCarrierAtPrefix(prefix, owner.graph, cCallRef);
    const result = selected.filter(e => e.kind === "c_call_result_admitted" && e.aggregateId === cCallRef);
    const judgment = selected.filter(e => e.kind === "c_call_judged" && e.aggregateId === cCallRef);
    if (call === null || result.length !== 1 || judgment.length !== 1 || !record(result[0]!.payload) || !record(judgment[0]!.payload)) return null;
    return projectAdmittedCCallStateAtPrefix(prefix, call,
      { kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", ...result[0]!.payload,
        admissionEventRef: result[0]!.eventId },
      { kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", ...judgment[0]!.payload,
        admissionEventRef: judgment[0]!.eventId });
  } catch { return null; }
}

/** @internal */
export function authenticateOwnedSemanticStageBasis(basis: SemanticStageNativeBasis) {
  try {
    const ownedNative = authenticateOwnedNativeInstructionAssemblyBasis(basis);
    const native = ownedNative === null ? null : { ...ownedNative, events: runtimeEventBodiesAtPrefix(ownedNative.prefix) };
    if (native === null) return null;
    const { events, prefix, call } = native;
    const lifecyclePublication = basis.lifecyclePublication ?? basis.publication;
    const program = basis.publication.programs.find(p => p.programRef === basis.executionBasis.programRef);
    const sourcePublication = basis.sourcePublication ?? lifecyclePublication;
    if (program === undefined || !validSemanticProgramOwners(basis.publication, program, lifecyclePublication, sourcePublication)) return null;
    const owner = native;
    if (!SEMANTIC_IMPLEMENTATION_REFS.includes(call.implementationRef ?? "")) return null;
    const lifecycle = lifecyclePublication.semanticLifecycle!;
    const stages = lifecycle.stages.filter(s => (s.graphFunctionRef === call.graphFunctionRef || basis.graphFunction.declarations["abg.semantic_revision_stage"] === s.declarationRef) &&
      (s.authorLocusRef === call.programLocusRef || s.assessorLocusRef === call.programLocusRef));
    const role: "author" | "assessor" | null = (call.implementationRef === SEMANTIC_STAGE_IDS.authorImplementationRef || call.implementationRef === SEMANTIC_REVISION_IDS.authorImplementationRef) ? "author"
      : (call.implementationRef === SEMANTIC_STAGE_IDS.assessorImplementationRef || call.implementationRef === SEMANTIC_REVISION_IDS.assessorImplementationRef) ? "assessor" : null;
    if (role !== null && (call.regime !== "F_P" || stages.length !== 1 ||
      (role === "author" ? stages[0]!.authorLocusRef : stages[0]!.assessorLocusRef) !== call.programLocusRef)) return null;
    const source = sourcePublication.requirementHandoffs!.find(d => d.declarationRef === lifecycle.sourceDeclarationRef)!;
    const environment = owner.environment;
    if (environment.kind !== "exact_prefix_workspace_environment" ||
      ![sourcePublication, lifecyclePublication].every(publication => environment.productInstalls.filter(install =>
        install.productId === publication.owningProductId && install.artifactDigest === publication.artifactDigest &&
        install.productContentDigest === publication.productContentDigest && install.manifestDigest === publication.productManifestDigest &&
        install.contributionManifest.publicationBindings.filter(p => p.moduleRef === publication.moduleRef &&
          p.publicationDigest === modulePublicationSemanticDigest(publication)).length === 1).length === 1)) return null;
    return { events, prefix, execution: owner.execution, graph: owner.graph, call, resolution: native.resolution,
      environment, lifecycle, source, sourcePublication, role, inputRef: basis.cursor.inputRef, inputDigest: basis.cursor.inputDigest,
      stage: stages[0] as SemanticStageDeclaration | undefined };
  } catch { return null; }
}

export function constructSemanticStageNativeBasis(basis: SemanticStageNativeBasis): Readonly<SemanticStageNativeBasis> | null {
  const captured = constructNativeInstructionAssemblyBasis(basis);
  if (captured === null) return null;
  return (captured.lifecyclePublication ?? captured.publication).semanticJobLifecycle !== undefined
    ? authenticateOwnedSemanticJobBasis(captured) === null ? null : captured
    : authenticateOwnedSemanticStageBasis(captured) === null ? null : captured;
}

/** Private pure projection; only this owner's fresh authentication supplies it. */
function semanticInputValueFromOwner(owner: NonNullable<ReturnType<typeof authenticateOwnedSemanticStageBasis>>): JsonValue | undefined {
  if (owner.inputRef === owner.execution.rawInputAdmissionRef) return owner.execution.rawInputValue;
  const event = owner.events.find(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultRef === owner.inputRef);
  return record(event?.payload) ? event.payload.value : undefined;
}

export function semanticInputValueAtBasis(basis: SemanticStageNativeBasis): JsonValue | undefined {
  if ((basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined)
    return authenticateOwnedSemanticJobBasis(basis)?.inputValue;
  const owner = authenticateOwnedSemanticStageBasis(basis);
  return owner === null ? undefined : semanticInputValueFromOwner(owner);
}

/** The owner's admitted input at the basis is canonically `input`; an absent owner input is unequal. */
export function semanticInputAtBasisEquals(basis: SemanticStageNativeBasis, input: JsonValue): boolean {
  const value = semanticInputValueAtBasis(basis);
  return value !== undefined && canonicalEquals(value, input);
}

/** A read-only whole-value projector over an independently admitted prefix.
 * Individual valid assets cannot authorize a caller-spliced envelope. */
export function semanticEnvelopeMatchesAdmittedPredecessor(prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[], publication: Readonly<ModulePublication>,
  graphFunctions: readonly Readonly<GraphFunction>[], input: SemanticStageEnvelope): boolean;
/** @internal */
export function semanticEnvelopeMatchesAdmittedPredecessor(prefix: RuntimeEventPrefix,
  events: RuntimeEventScan, publication: Readonly<ModulePublication>,
  graphFunctions: readonly Readonly<GraphFunction>[], input: SemanticStageEnvelope): boolean;
export function semanticEnvelopeMatchesAdmittedPredecessor(prefix: RuntimeEventPrefix,
  events: RuntimeEventScan, publication: Readonly<ModulePublication>,
  graphFunctions: readonly Readonly<GraphFunction>[], input: SemanticStageEnvelope): boolean {
  const exactSources = events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
    canonicalEquals(presentMember(e.payload.value), input)).filter(event => {
    const source = projectSemanticPredecessorAtPrefix(prefix, events, publication, event.aggregateId, graphFunctions);
    return source !== null && source.result.resultClass === "success" && source.judgment.judgment === "advance" &&
      [SEMANTIC_STAGE_IDS.authorImplementationRef, SEMANTIC_STAGE_IDS.assessorImplementationRef,
        SEMANTIC_STAGE_IDS.evidenceInputImplementationRef].some(ref => ref === source.cCall.implementationRef) &&
      canonicalEquals(source.result.value, input);
  });
  return exactSources.length === 1;
}

/** The current input must be the actual root admission or preceding native result. */
export function semanticInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticStageEnvelope {
  try {
    const owner = authenticateOwnedSemanticStageBasis(basis);
    if (owner === null || !isSemanticStageEnvelope(input) || !canonicalEquals(input.lifecycle, owner.lifecycle) ||
      !canonicalEquals(input.sourceHandoff.declaration, owner.source)) return false;
    const expectedValue = semanticInputValueFromOwner(owner);
    if (expectedValue === undefined || !canonicalEquals(expectedValue, input) || hash(input) !== owner.inputDigest) return false;
    const handoff = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, owner.sourcePublication, input.sourceHandoff.basis.cCallRef);
    if (handoff === null || handoff.result.resultClass !== "success" || handoff.judgment.judgment !== "advance" ||
      !canonicalEquals(handoff.result.value, input.sourceHandoff) ||
      input.sourceHandoff.basis.publicationDigest !== hash(owner.sourcePublication) ||
      input.sourceHandoff.basis.graphFunctionRef !== owner.source.graphFunctionRef) return false;
    if (input.assets.length > 0 && !semanticEnvelopeMatchesAdmittedPredecessor(owner.prefix, owner.events,
      basis.publication, basis.declarationGraphFunctions, input)) return false;
    if (input.evidence !== null) {
      const evidenceSources = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
        isSemanticStageEnvelope(e.payload.value) && canonicalEquals(e.payload.value.evidence, input.evidence)).filter(event => {
        const source = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, event.aggregateId, basis.declarationGraphFunctions);
        if (source === null || source.cCall.implementationRef !== SEMANTIC_STAGE_IDS.evidenceInputImplementationRef ||
          source.result.resultClass !== "success" || source.judgment.judgment !== "advance" || !isSemanticStageEnvelope(source.result.value)) return false;
        const value = source.result.value;
        return canonicalEquals(value.sourceHandoff, input.sourceHandoff) && canonicalEquals(value.lifecycle, input.lifecycle) &&
          canonicalEquals(value.worksite, input.worksite) && canonicalEquals(value.taskData, input.taskData) && canonicalEquals(value.evaluationData, input.evaluationData);
      });
      if (evidenceSources.length !== 1) return false;
    }
    for (const asset of input.assets) {
      const author = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, asset.source.cCallRef, basis.declarationGraphFunctions);
      if (author === null || author.result.resultClass !== "success" || author.judgment.judgment !== "advance" ||
        !isSemanticStageEnvelope(author.result.value)) return false;
      const admittedAsset = author.result.value.assets.find(a => a.assetRef === asset.assetRef);
      if (admittedAsset === undefined || !canonicalEquals({ ...asset, assessment: null }, admittedAsset)) return false;
      if (asset.assessment !== null) {
        const assessment = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, asset.assessment.source.cCallRef, basis.declarationGraphFunctions);
        if (assessment === null || assessment.result.resultClass !== "success" || assessment.judgment.judgment !== "advance" ||
          !isSemanticStageEnvelope(assessment.result.value) ||
          !canonicalEquals(assessment.result.value.assets.find(a => a.assetRef === asset.assetRef) ?? null, asset)) return false;
      }
    }
    return true;
  } catch { return false; }
}

/** The current content boundary reuses the admitted input and exact environment.
 * Physical checks run only before dispatch; recorded assembly rederivation is pure. */
export function semanticWorksiteContextMatchesBasis(basis: SemanticStageNativeBasis, worksite: SemanticWorksiteBasis,
  readPhysical = false): boolean {
  try {
    const owner = authenticateOwnedSemanticStageBasis(basis);
    if (owner === null) return false;
    const value = semanticInputValueFromOwner(owner);
    const input = record(value) && record(value.current) ? value.current : value;
    if (!record(input) || input.worksite === undefined || !canonicalEquals(input.worksite, worksite)) return false;
    const environment = owner.environment;
    const invocation = rehydrateInvocationAdmissionAtPrefix(owner.prefix, owner.execution.invocationAdmissionRef);
    return environment.kind === "exact_prefix_workspace_environment" &&
      canonicalEquals(environment.workspaceAuthorityBasis, worksite.workspaceAuthorityBasis) &&
      canonicalEquals(environment.workspaceBinding, worksite.workspaceBinding) && invocation?.capabilityGrants.length === 1 &&
      invocation.capabilityGrants[0] !== undefined && canonicalEquals(invocation.capabilityGrants[0], worksite.capabilityGrant) &&
      (!readPhysical || worksiteRevisionPhysicalMatches(worksite));
  } catch { return false; }
}

export function semanticResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean {
  try {
    const owner = authenticateOwnedSemanticStageBasis(basis);
    if (owner === null || owner.role === null || owner.stage === undefined || !semanticInputMatchesBasis(basis, input) || !isSemanticStageEnvelope(output)) return false;
    const last = output.assets.at(-1);
    if (last === undefined) return false;
    const source: SemanticActorSource | undefined = owner.role === "author" ? last.source : last.assessment?.source;
    const raw = owner.role === "author" ? last.candidate : last.assessment?.candidate;
    if (source === undefined || source.cCallRef !== owner.call.cCallRef || source.inputDigest !== owner.inputDigest) return false;
    const expected = owner.role === "author" ? deriveSemanticAsset(input, owner.stage.declarationRef, raw, source)
      : deriveSemanticAssessment(input, owner.stage.declarationRef, raw, source);
    return expected !== null && canonicalEquals(expected, output);
  } catch { return false; }
}

/** Changes only the published wire contract. Every carried byte remains the
 * exact authenticated current input; semantic and application claims do not change. */
export function projectSemanticEnvelopeOutput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticStageEnvelope> | null {
  const owner = authenticateOwnedSemanticStageBasis(basis);
  return owner !== null && owner.call.implementationRef === SEMANTIC_STAGE_IDS.terminalImplementationRef &&
    owner.call.regime === "F_D" && owner.call.inputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef &&
    owner.call.outputContractRef === SEMANTIC_STAGE_IDS.outputContractRef && semanticInputMatchesBasis(basis, input)
    ? deepFreeze(input) : null;
}

export function projectSemanticWorksitePreparation(basis: SemanticStageNativeBasis, input: unknown) {
  try {
    const owner = authenticateOwnedSemanticStageBasis(basis);
    if (owner === null || owner.call.implementationRef !== SEMANTIC_STAGE_IDS.bridgeImplementationRef ||
      !semanticInputMatchesBasis(basis, input) || input.worksite === null) return null;
    const worksite = input.worksite;
    const environment = owner.environment;
    const invocation = rehydrateInvocationAdmissionAtPrefix(owner.prefix, owner.execution.invocationAdmissionRef);
    if (environment.kind !== "exact_prefix_workspace_environment" || !canonicalEquals(environment.workspaceAuthorityBasis, worksite.workspaceAuthorityBasis) ||
      environment.workspaceBinding.workspaceId !== worksite.workspaceBinding.workspaceId || invocation?.capabilityGrants.length !== 1) return null;
    const current = { workspaceAuthorityBasis: environment.workspaceAuthorityBasis, workspaceBinding: environment.workspaceBinding,
      capabilityGrant: invocation.capabilityGrants[0]! };
    const prepared = deriveSemanticWorksitePreparation(input, current);
    if (prepared === null) return null;
    const root = worksite.workspaceAuthorityBasis.canonicalRoot;
    if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return null;
    for (const row of worksite.targets) {
      const target = resolve(root, row.target.subject.relativePath);
      if (!pathStrictlyConfined(pathRelation(root, target))) return null;
      const expected = row.target.predecessorObservation;
      let cursor = root;
      for (const segment of row.target.subject.relativePath.split("/").slice(0, -1)) {
        cursor = resolve(cursor, segment);
        if (realpathSync(cursor) !== cursor || !lstatSync(cursor).isDirectory() || lstatSync(cursor).isSymbolicLink()) return null;
      }
      let actual;
      try {
        const stat = lstatSync(target);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || realpathSync(target) !== target) return null;
        const bytes = readFileSync(target);
        actual = constructWorksiteObservation({ subject: row.target.subject, state: "file", fileIdentity: `${stat.dev}:${stat.ino}`,
          fileDigest: sha256Bytes(bytes), byteLength: bytes.length });
        if (bytes.toString("base64") !== row.base64) return null;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        actual = constructWorksiteObservation({ subject: row.target.subject, state: "absent" });
      }
      if (!canonicalEquals(actual, expected)) return null;
    }
    return prepared;
  } catch { return null; }
}

function sameInvocation(a: ExecutionBasis, b: ExecutionBasis): boolean {
  return a.invocationAdmissionRef === b.invocationAdmissionRef && a.invocationRef === b.invocationRef &&
    a.invocationDigest === b.invocationDigest && a.programRef === b.programRef && a.programDigest === b.programDigest &&
    a.rootImplementationSetRef === b.rootImplementationSetRef && a.rootImplementationSetDigest === b.rootImplementationSetDigest &&
    a.workspaceBindingId === b.workspaceBindingId && a.workspaceBindingDigest === b.workspaceBindingDigest;
}

/** Finds only the named leaf's admitted, judged result in this invocation. */
export function selectedSemanticPredecessor(basis: SemanticStageNativeBasis, implementationRef: string, value: JsonValue) {
  const owner = (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
    ? authenticateOwnedSemanticJobBasis(basis) : authenticateOwnedSemanticStageBasis(basis);
  if (owner === null) return null;
  const matches = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && canonicalEquals(presentMember(e.payload.value), value))
    .map(event => {
      const previous = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, event.aggregateId, basis.declarationGraphFunctions);
      if (previous === null || previous.cCall.implementationRef !== implementationRef || previous.result.resultClass !== "success" ||
        previous.judgment.judgment !== "advance") return null;
      const execution = rehydrateExecutionBasisAtPrefix(owner.prefix, previous.cCall.basisId);
      return execution !== null && sameInvocation(execution, owner.execution) ? { previous, execution, event } : null;
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  return exactOrNull(onlyExactMatch(matches));
}

/** C2's stored protected snapshot is the evidence content locus. It is derived
 * from the admitted helper plan, never a caller-selected path. */
export function projectSemanticEvidenceInput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticStageEnvelope> | null {
  try {
    const owner = authenticateOwnedSemanticStageBasis(basis);
    if (owner === null || owner.call.implementationRef !== SEMANTIC_STAGE_IDS.evidenceInputImplementationRef ||
      !isWorksiteCommandExecutionObservation(input) || hash(input) !== owner.inputDigest ||
      !semanticInputAtBasisEquals(basis, input)) return null;
    const execution = selectedSemanticPredecessor(basis, WORKSITE_COMMAND_EXECUTION_IDS.implementationRef, input);
    const construction = selectedSemanticPredecessor(basis, WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef, input.task.sourceConstructionResult);
    if (execution === null || construction === null || !isWorksiteConstructionResult(construction.previous.result.value)) return null;
    const candidates = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && record(e.payload.value) &&
      e.payload.value.kind === "worksite_command_preparation_input").map(event => {
      const payload = event.payload;
      if (!record(payload) || payload.value === undefined) return null;
      const value = payload.value;
      const source = selectedSemanticPredecessor(basis, SEMANTIC_STAGE_IDS.bridgeImplementationRef, value);
      if (source === null || source.event.eventId !== event.eventId ||
        source.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;
      const original = source.execution.rawInputValue;
      if (!isSemanticStageEnvelope(original) || original.worksite === null) return null;
      if (!isWorksitePreparationInput(value) || value.kind !== "worksite_command_preparation_input") return null;
      // Current coordinates belong to the admitted bridge output. Reconstruct
      // the structural join from those saved bytes, not the now-mutated app.
      const expected = deriveSemanticWorksitePreparation(original, value.constructionTask);
      if (expected === null || !canonicalEquals(expected, value) ||
        value.constructionTask.workspaceBinding.bindingId !== owner.execution.workspaceBindingId ||
        value.constructionTask.workspaceBinding.bindingDigest !== owner.execution.workspaceBindingDigest) return null;
      return { original, expected };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    if (candidates.length !== 1) return null;
    const { original, expected } = candidates[0]!;
    const prepared = rederiveWorksiteCommandTask({ kind: "worksite_command_preparation_bound_input", schemaVersion: "5.0.0",
      entry: expected, source: input.task.sourceConstructionResult }, input.task);
    if (!canonicalEquals(prepared, input.task)) return null;
    const root = input.provenance.helperPlan.sandboxRoot;
    if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return null;
    const artifacts = input.snapshotMembers.map(member => {
      const path = resolve(root, member.relativePath);
      if (!pathStrictlyConfined(pathRelation(root, path)) || realpathSync(path) !== path) throw new TypeError("snapshot path crossed native locus");
      const stat = lstatSync(path); const bytes = readFileSync(path);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || bytes.length !== member.byteLength || sha256Bytes(bytes) !== member.digest) throw new TypeError("snapshot content differs from admitted C2");
      const currentTarget = expected.constructionTask.targets.find(t => t.targetRef === member.sourceMemberRef);
      const target = original.worksite!.targets.find(t => t.target.subject.relativePath === currentTarget?.subject.relativePath);
      if (target === undefined || currentTarget === undefined) throw new TypeError("snapshot has no selected Design target");
      const selection = original.assets.at(-1)!.candidate.worksiteDesign!.targets.find(t => t.targetRef === target.target.targetRef);
      if (selection === undefined || (selection.obligationRefs.length === 0 && bytes.toString("base64") !== target.base64)) {
        throw new TypeError("admitted snapshot dependency bytes changed");
      }
      return { subjectRef: currentTarget.subject.subjectRef, observationRef: member.sourceObservationRef,
        base64: bytes.toString("base64"), role: target.role === "verifier" ? "verifier_artifact" as const : "realization" as const };
    });
    return deepFreeze({ ...original, evidence: { kind: "semantic_worksite_evidence", constructionResultRef: construction.previous.result.resultRef,
      constructionResultDigest: construction.previous.result.resultDigest, executionResultRef: execution.previous.result.resultRef,
      executionResultDigest: execution.previous.result.resultDigest, constructionResult: input.task.sourceConstructionResult,
      executionObservation: input, artifacts } });
  } catch { return null; }
}
