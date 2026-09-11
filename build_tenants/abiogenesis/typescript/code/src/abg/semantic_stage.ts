import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { isWorksitePreparationInput, prepareWorksiteCommandTask } from "../product/worksite_preparation.js";
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { materializeGraph } from "../gtl/materialize.js";
import { SEMANTIC_IMPLEMENTATION_REFS, SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { validSemanticProgramOwners } from "../gtl/semantic_stage.js";
import type { SemanticStageDeclaration } from "../gtl/semantic_stage.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { readRuntimeEventsAtDurablePrefix, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { hasAdmittedTraversalCursorAtPrefix, type TraversalCursorCandidate } from "./traversal_cursor.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix, projectAdmittedCCallStateAtPrefix,
  type CCall, type RehydratedAdmittedCCallState } from "./c_call.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope,
  deriveSemanticWorksitePreparation, type SemanticStageEnvelope, type SemanticActorSource } from "../product/semantic_stage.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { rehydrateInvocationAdmissionAtPrefix } from "./invocation_admission.js";
import { constructWorksiteObservation } from "../product/worksite_effect.js";
import { WORKSITE_COMMAND_EXECUTION_IDS, isWorksiteCommandExecutionObservation } from "../product/worksite_command_execution.js";
import { WORKSITE_CONSTRUCTION_IDS, isWorksiteConstructionResult } from "../product/worksite_construction.js";
import { readFileSync, lstatSync, realpathSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { sha256Bytes } from "../shared/digests.js";

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
}
const hash = (x: unknown) => sha256Canonical(x as JsonValue);
function record(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function owningGraph(prefix: ValidatedRuntimeEventPrefix, publication: Readonly<ModulePublication>, basisRef: string, graphFunctions: readonly Readonly<GraphFunction>[] = publication.graphFunctions) {
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
  prefix: ValidatedRuntimeEventPrefix, events: readonly RuntimeEvent[], publication: Readonly<ModulePublication>, cCallRef: string, graphFunctions: readonly Readonly<GraphFunction>[] = publication.graphFunctions,
): RehydratedAdmittedCCallState | null {
  try {
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === cCallRef);
    if (opened?.basisId === undefined) return null;
    const owner = owningGraph(prefix, publication, opened.basisId, graphFunctions);
    if (owner === null) return null;
    const call = projectOpenedCCallCarrierAtPrefix(prefix, owner.graph, cCallRef);
    const result = events.filter(e => e.kind === "c_call_result_admitted" && e.aggregateId === cCallRef);
    const judgment = events.filter(e => e.kind === "c_call_judged" && e.aggregateId === cCallRef);
    if (call === null || result.length !== 1 || judgment.length !== 1 || !record(result[0]!.payload) || !record(judgment[0]!.payload)) return null;
    return projectAdmittedCCallStateAtPrefix(prefix, call as unknown as Readonly<Record<string, JsonValue>>,
      { kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", ...result[0]!.payload,
        admissionEventRef: result[0]!.eventId },
      { kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", ...judgment[0]!.payload,
        admissionEventRef: judgment[0]!.eventId });
  } catch { return null; }
}

export function authenticateSemanticStageBasis(basis: SemanticStageNativeBasis) {
  try {
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix);
    const prefix = selectValidatedRuntimeEventPrefix(events);
    const lifecyclePublication = basis.lifecyclePublication ?? basis.publication;
    const program = basis.publication.programs.find(p => p.programRef === basis.executionBasis.programRef);
    const sourcePublication = basis.sourcePublication ?? lifecyclePublication;
    if (program === undefined || !validSemanticProgramOwners(basis.publication, program, lifecyclePublication, sourcePublication)) return null;
    const owner = owningGraph(prefix, lifecyclePublication, basis.executionBasis.basisRef, basis.declarationGraphFunctions);
    if (owner === null || hash(owner.execution) !== hash(basis.executionBasis) || hash(owner.graph) !== hash(basis.graph) ||
      hash(owner.graphFunction) !== hash(basis.graphFunction)) return null;
    const call = projectOpenedCCallCarrierAtPrefix(prefix, owner.graph, basis.cCall.cCallRef);
    const opened = events.find(e => e.eventId === call?.openedEventRef);
    if (call === null || hash(call) !== hash(basis.cCall) || call.callClass !== "leaf" ||
      !hasAdmittedTraversalCursorAtPrefix(prefix, basis.cursor) || !record(opened?.payload) ||
      opened.payload.cursorRef !== basis.cursor.cursorRef || opened.payload.cursorDigest !== basis.cursor.cursorDigest ||
      basis.cursor.executionBasisRef !== owner.execution.basisRef || basis.cursor.graphCallId !== call.graphCallId ||
      basis.cursor.frameId !== call.frameId || basis.cursor.graphRef !== owner.graph.materializationRef ||
      !SEMANTIC_IMPLEMENTATION_REFS.includes(call.implementationRef ?? "") ||
      projectCCallCarrierPhaseAtPrefix(prefix, call)?.phase !== "selected_no_evidence") return null;
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, owner.execution.implementationSetRef);
    const rootSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, owner.execution.rootImplementationSetRef);
    if (set === null || rootSet === null || set.implementationSetDigest !== owner.execution.implementationSetDigest ||
      rootSet.implementationSetDigest !== owner.execution.rootImplementationSetDigest || rootSet.publicationDigest !== hash(basis.publication) ||
      !basis.publication.programs.some(p => p.programRef === owner.execution.programRef && hash(p) === owner.execution.programDigest)) return null;
    const resolutions = set.rows.filter(row => row.graphFunctionRef === call.graphFunctionRef && row.programLocusRef === call.programLocusRef &&
      row.implementationRef === call.implementationRef && row.implementationBindingRef === call.implementationBindingRef &&
      row.inputContractRef === call.inputContractRef && row.outputContractRef === call.outputContractRef && row.computeRegime === call.regime);
    if (resolutions.length !== 1) return null;
    const lifecycle = lifecyclePublication.semanticLifecycle!;
    const stages = lifecycle.stages.filter(s => (s.graphFunctionRef === call.graphFunctionRef || basis.graphFunction.declarations["abg.semantic_revision_stage"] === s.declarationRef) &&
      (s.authorLocusRef === call.programLocusRef || s.assessorLocusRef === call.programLocusRef));
    const role: "author" | "assessor" | null = (call.implementationRef === SEMANTIC_STAGE_IDS.authorImplementationRef || call.implementationRef === SEMANTIC_REVISION_IDS.authorImplementationRef) ? "author"
      : (call.implementationRef === SEMANTIC_STAGE_IDS.assessorImplementationRef || call.implementationRef === SEMANTIC_REVISION_IDS.assessorImplementationRef) ? "assessor" : null;
    if (role !== null && (call.regime !== "F_P" || stages.length !== 1 ||
      (role === "author" ? stages[0]!.authorLocusRef : stages[0]!.assessorLocusRef) !== call.programLocusRef)) return null;
    const source = sourcePublication.requirementHandoffs!.find(d => d.declarationRef === lifecycle.sourceDeclarationRef)!;
    const environment = projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix,
      { ref: owner.execution.workspaceBindingId, digest: owner.execution.workspaceBindingDigest });
    if (environment.kind !== "exact_prefix_workspace_environment" ||
      ![sourcePublication, lifecyclePublication].every(publication => environment.productInstalls.filter(install =>
        install.productId === publication.owningProductId && install.artifactDigest === publication.artifactDigest &&
        install.productContentDigest === publication.productContentDigest && install.manifestDigest === publication.productManifestDigest &&
        install.contributionManifest.publicationBindings.filter(p => p.moduleRef === publication.moduleRef &&
          p.publicationDigest === modulePublicationSemanticDigest(publication)).length === 1).length === 1)) return null;
    return { events, prefix, execution: owner.execution, graph: owner.graph, call, resolution: resolutions[0]!,
      lifecycle, source, sourcePublication, role, inputRef: basis.cursor.inputRef, inputDigest: basis.cursor.inputDigest,
      stage: stages[0] as SemanticStageDeclaration | undefined };
  } catch { return null; }
}

export function constructSemanticStageNativeBasis(basis: SemanticStageNativeBasis): Readonly<SemanticStageNativeBasis> | null {
  return authenticateSemanticStageBasis(basis) === null ? null : deepFreeze(basis);
}

export function semanticInputValueAtBasis(basis: SemanticStageNativeBasis): unknown {
  const owner = authenticateSemanticStageBasis(basis);
  if (owner === null) return undefined;
  if (owner.inputRef === owner.execution.rawInputAdmissionRef) return owner.execution.rawInputValue;
  const event = owner.events.find(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultRef === owner.inputRef);
  return record(event?.payload) ? event.payload.value : undefined;
}

/** A read-only whole-value projector over an independently admitted prefix.
 * Individual valid assets cannot authorize a caller-spliced envelope. */
export function semanticEnvelopeMatchesAdmittedPredecessor(prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[], publication: Readonly<ModulePublication>,
  graphFunctions: readonly Readonly<GraphFunction>[], input: SemanticStageEnvelope): boolean {
  const exactSources = events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
    hash(e.payload.value) === hash(input)).filter(event => {
    const source = projectSemanticPredecessorAtPrefix(prefix, events, publication, event.aggregateId, graphFunctions);
    return source !== null && source.result.resultClass === "success" && source.judgment.judgment === "advance" &&
      [SEMANTIC_STAGE_IDS.authorImplementationRef, SEMANTIC_STAGE_IDS.assessorImplementationRef,
        SEMANTIC_STAGE_IDS.evidenceInputImplementationRef].some(ref => ref === source.cCall.implementationRef) &&
      hash(source.result.value) === hash(input);
  });
  return exactSources.length === 1;
}

/** The current input must be the actual root admission or preceding native result. */
export function semanticInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticStageEnvelope {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || !isSemanticStageEnvelope(input) || hash(input.lifecycle) !== hash(owner.lifecycle) ||
      hash(input.sourceHandoff.declaration) !== hash(owner.source)) return false;
    const expectedValue = semanticInputValueAtBasis(basis);
    if (hash(expectedValue) !== hash(input) || hash(input) !== owner.inputDigest) return false;
    const handoff = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, owner.sourcePublication, input.sourceHandoff.basis.cCallRef);
    if (handoff === null || handoff.result.resultClass !== "success" || handoff.judgment.judgment !== "advance" ||
      hash(handoff.result.value) !== hash(input.sourceHandoff) ||
      input.sourceHandoff.basis.publicationDigest !== hash(owner.sourcePublication) ||
      input.sourceHandoff.basis.graphFunctionRef !== owner.source.graphFunctionRef) return false;
    if (input.assets.length > 0 && !semanticEnvelopeMatchesAdmittedPredecessor(owner.prefix, owner.events,
      basis.publication, basis.declarationGraphFunctions, input)) return false;
    if (input.evidence !== null) {
      const evidenceSources = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
        isSemanticStageEnvelope(e.payload.value) && hash(e.payload.value.evidence) === hash(input.evidence)).filter(event => {
        const source = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, event.aggregateId, basis.declarationGraphFunctions);
        if (source === null || source.cCall.implementationRef !== SEMANTIC_STAGE_IDS.evidenceInputImplementationRef ||
          source.result.resultClass !== "success" || source.judgment.judgment !== "advance" || !isSemanticStageEnvelope(source.result.value)) return false;
        const value = source.result.value;
        return hash(value.sourceHandoff) === hash(input.sourceHandoff) && hash(value.lifecycle) === hash(input.lifecycle) &&
          hash(value.worksite) === hash(input.worksite) && hash(value.taskData) === hash(input.taskData) && hash(value.evaluationData) === hash(input.evaluationData);
      });
      if (evidenceSources.length !== 1) return false;
    }
    for (const asset of input.assets) {
      const author = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, asset.source.cCallRef, basis.declarationGraphFunctions);
      if (author === null || author.result.resultClass !== "success" || author.judgment.judgment !== "advance" ||
        !isSemanticStageEnvelope(author.result.value)) return false;
      const admittedAsset = author.result.value.assets.find(a => a.assetRef === asset.assetRef);
      if (admittedAsset === undefined || hash({ ...asset, assessment: null }) !== hash(admittedAsset)) return false;
      if (asset.assessment !== null) {
        const assessment = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, asset.assessment.source.cCallRef, basis.declarationGraphFunctions);
        if (assessment === null || assessment.result.resultClass !== "success" || assessment.judgment.judgment !== "advance" ||
          !isSemanticStageEnvelope(assessment.result.value) ||
          hash(assessment.result.value.assets.find(a => a.assetRef === asset.assetRef)) !== hash(asset)) return false;
      }
    }
    return true;
  } catch { return false; }
}

export function semanticResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || owner.role === null || owner.stage === undefined || !semanticInputMatchesBasis(basis, input) || !isSemanticStageEnvelope(output)) return false;
    const last = output.assets.at(-1);
    if (last === undefined) return false;
    const source: SemanticActorSource | undefined = owner.role === "author" ? last.source : last.assessment?.source;
    const raw = owner.role === "author" ? last.candidate : last.assessment?.candidate;
    if (source === undefined || source.cCallRef !== owner.call.cCallRef || source.inputDigest !== owner.inputDigest) return false;
    const expected = owner.role === "author" ? deriveSemanticAsset(input, owner.stage.declarationRef, raw, source)
      : deriveSemanticAssessment(input, owner.stage.declarationRef, raw, source);
    return expected !== null && hash(expected) === hash(output);
  } catch { return false; }
}

/** Changes only the published wire contract. Every carried byte remains the
 * exact authenticated current input; semantic and application claims do not change. */
export function projectSemanticEnvelopeOutput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticStageEnvelope> | null {
  const owner = authenticateSemanticStageBasis(basis);
  return owner !== null && owner.call.implementationRef === SEMANTIC_STAGE_IDS.terminalImplementationRef &&
    owner.call.regime === "F_D" && owner.call.inputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef &&
    owner.call.outputContractRef === SEMANTIC_STAGE_IDS.outputContractRef && semanticInputMatchesBasis(basis, input)
    ? deepFreeze(input) : null;
}

export function projectSemanticWorksitePreparation(basis: SemanticStageNativeBasis, input: unknown) {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || owner.call.implementationRef !== SEMANTIC_STAGE_IDS.bridgeImplementationRef ||
      !semanticInputMatchesBasis(basis, input) || input.worksite === null) return null;
    const worksite = input.worksite;
    const environment = projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix,
      { ref: owner.execution.workspaceBindingId, digest: owner.execution.workspaceBindingDigest });
    const invocation = rehydrateInvocationAdmissionAtPrefix(owner.prefix, owner.execution.invocationAdmissionRef);
    if (environment.kind !== "exact_prefix_workspace_environment" || hash(environment.workspaceAuthorityBasis) !== hash(worksite.workspaceAuthorityBasis) ||
      environment.workspaceBinding.workspaceId !== worksite.workspaceBinding.workspaceId || invocation?.capabilityGrants.length !== 1) return null;
    const current = { workspaceAuthorityBasis: environment.workspaceAuthorityBasis, workspaceBinding: environment.workspaceBinding,
      capabilityGrant: invocation.capabilityGrants[0]! };
    const prepared = deriveSemanticWorksitePreparation(input, current);
    if (prepared === null) return null;
    const root = worksite.workspaceAuthorityBasis.canonicalRoot;
    if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return null;
    for (const row of worksite.targets) {
      const target = resolve(root, row.target.subject.relativePath); const rel = relative(root, target);
      if (rel.length === 0 || rel.startsWith("..") || isAbsolute(rel)) return null;
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
      if (hash(actual) !== hash(expected)) return null;
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
export function selectedSemanticPredecessor(basis: SemanticStageNativeBasis, implementationRef: string, value: unknown) {
  const owner = authenticateSemanticStageBasis(basis);
  if (owner === null) return null;
  const matches = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && hash(e.payload.value) === hash(value))
    .map(event => {
      const previous = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, event.aggregateId, basis.declarationGraphFunctions);
      if (previous === null || previous.cCall.implementationRef !== implementationRef || previous.result.resultClass !== "success" ||
        previous.judgment.judgment !== "advance") return null;
      const execution = rehydrateExecutionBasisAtPrefix(owner.prefix, previous.cCall.basisId);
      return execution !== null && sameInvocation(execution, owner.execution) ? { previous, execution, event } : null;
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  return matches.length === 1 ? matches[0]! : null;
}

/** C2's stored protected snapshot is the evidence content locus. It is derived
 * from the admitted helper plan, never a caller-selected path. */
export function projectSemanticEvidenceInput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticStageEnvelope> | null {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || owner.call.implementationRef !== SEMANTIC_STAGE_IDS.evidenceInputImplementationRef ||
      !isWorksiteCommandExecutionObservation(input) || hash(input) !== owner.inputDigest ||
      hash(semanticInputValueAtBasis(basis)) !== hash(input)) return null;
    const execution = selectedSemanticPredecessor(basis, WORKSITE_COMMAND_EXECUTION_IDS.implementationRef, input);
    const construction = selectedSemanticPredecessor(basis, WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef, input.task.sourceConstructionResult);
    if (execution === null || construction === null || !isWorksiteConstructionResult(construction.previous.result.value)) return null;
    const candidates = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && record(e.payload.value) &&
      e.payload.value.kind === "worksite_command_preparation_input").map(event => {
      const value = (event.payload as Readonly<Record<string, JsonValue>>).value;
      const source = selectedSemanticPredecessor(basis, SEMANTIC_STAGE_IDS.bridgeImplementationRef, value);
      if (source === null || source.event.eventId !== event.eventId ||
        source.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;
      const original = source.execution.rawInputValue;
      if (!isSemanticStageEnvelope(original) || original.worksite === null) return null;
      if (!isWorksitePreparationInput(value) || value.kind !== "worksite_command_preparation_input") return null;
      // Current coordinates belong to the admitted bridge output. Reconstruct
      // the structural join from those saved bytes, not the now-mutated app.
      const expected = deriveSemanticWorksitePreparation(original, value.constructionTask);
      if (expected === null || hash(expected) !== hash(value) ||
        value.constructionTask.workspaceBinding.bindingId !== owner.execution.workspaceBindingId ||
        value.constructionTask.workspaceBinding.bindingDigest !== owner.execution.workspaceBindingDigest) return null;
      return { original, expected };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    if (candidates.length !== 1) return null;
    const { original, expected } = candidates[0]!;
    const prepared = prepareWorksiteCommandTask({ kind: "worksite_command_preparation_bound_input", schemaVersion: "5.0.0",
      entry: expected, source: input.task.sourceConstructionResult });
    if (hash(prepared) !== hash(input.task)) return null;
    const root = input.provenance.helperPlan.sandboxRoot;
    if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return null;
    const artifacts = input.snapshotMembers.map(member => {
      const path = resolve(root, member.relativePath); const rel = relative(root, path);
      if (rel.length === 0 || rel.startsWith("..") || isAbsolute(rel) || realpathSync(path) !== path) throw new TypeError("snapshot path crossed native locus");
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
      executionResultDigest: execution.previous.result.resultDigest, constructionResult: input.task.sourceConstructionResult as unknown as Readonly<Record<string, JsonValue>>,
      executionObservation: input as unknown as Readonly<Record<string, JsonValue>>, artifacts } });
  } catch { return null; }
}
