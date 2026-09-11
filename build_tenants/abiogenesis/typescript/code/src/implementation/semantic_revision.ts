import { SEMANTIC_REVISION_IDS as ids } from "../gtl/semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS as old } from "../gtl/semantic_stage_identity.js";
import { semanticRevisionImplementationBindings } from "../gtl/semantic_revision_publication.js";
import { constructNativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { authenticateSemanticStageBasis } from "../abg/semantic_stage.js";
import { projectSemanticRevision, semanticRevisionInputMatchesBasis, projectRevisionWorksitePreparation, projectRevisionEvidenceInput, semanticRevisionSelectionMatchesBasis } from "../abg/semantic_revision.js";
import { deriveRevisionAsset, deriveRevisionAssessment, isSemanticRevisionEnvelope } from "../product/semantic_revision.js";
import type { SemanticActorSource } from "../product/semantic_stage.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, ABI5_PRODUCT_ID } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const placeholder = `sha256:${"0".repeat(64)}` as const;
export const SEMANTIC_REVISION_IMPLEMENTATION_DESCRIPTORS = semanticRevisionImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  productId: ABI5_PRODUCT_ID, artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder }).map(({ kind: _kind, bindingRef: _ref, ...body }) => deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const, schemaVersion: "5.0.0" as const, ...body, descriptorDigest: hash(body) }) as PackagedLeafImplementationDescriptor);
export const [SEMANTIC_REVISION_SELECTION_DESCRIPTOR, SEMANTIC_REVISION_PROJECTION_DESCRIPTOR, SEMANTIC_REVISION_AUTHOR_DESCRIPTOR,
  SEMANTIC_REVISION_ASSESSOR_DESCRIPTOR, SEMANTIC_REVISION_BRIDGE_DESCRIPTOR, SEMANTIC_REVISION_EVIDENCE_INPUT_DESCRIPTOR,
  SEMANTIC_REVISION_TERMINAL_DESCRIPTOR] = SEMANTIC_REVISION_IMPLEMENTATION_DESCRIPTORS;
function result(input: Readonly<Record<string, JsonValue>>, output: unknown, implementationRef: string, deterministic: boolean): Readonly<LeafRealizationCandidate> {
  const failure = output === null;
  const value = failure ? { kind: "semantic_stage_failure", schemaVersion: "5.0.0", failureClass: "revision_basis_or_evidence_unavailable",
    diagnosticRef: "diagnostic://abiogenesis/semantic-revision/basis-or-evidence-unavailable@5" } : output;
  const evidenceCandidates = deterministic ? [{ kind: "deterministic_evidence_candidate" as const, schemaVersion: "5.0.0" as const, implementationRef, inputDigest: hash(input), outputDigest: hash(value) }] : [];
  if (failure) return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", resultCandidate: value as Readonly<Record<string, JsonValue>>, evidenceCandidates, diagnosticRef: "diagnostic://abiogenesis/semantic-revision/basis-or-evidence-unavailable@5" });
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    resultCandidate: value as Readonly<Record<string, JsonValue>>, evidenceCandidates: deterministic ? [{
      kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(value) }] : [],
    ...(failure ? { diagnosticRef: "diagnostic://abiogenesis/semantic-revision/basis-or-evidence-unavailable@5" } : {}) });
}
export function realizeSemanticRevisionProjection(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) {
  return result(input, occurrence.semanticStageBasis === undefined ? null : projectSemanticRevision(occurrence.semanticStageBasis, input), ids.projectionImplementationRef, true);
}
function actor(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>, role: "author" | "assessor"):
  Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  const basis = occurrence.semanticStageBasis;
  const owner = basis === undefined ? null : authenticateSemanticStageBasis(basis);
  const assembly = basis === undefined ? null : constructNativeInstructionAssembly(basis, input);
  if (owner === null || owner.role !== role || owner.stage === undefined || assembly === null || !isSemanticRevisionEnvelope(input)) throw new TypeError("revision actor requires native basis and assembly");
  const stage = owner.stage;
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
    complete(exchange) {
      const o = exchange.observation;
      if (hash(exchange.request) !== hash(assembly.request) || o.disposition !== "success" || o.promptDigest !== assembly.manifest.promptDigest ||
        o.toolCallCount !== 0 || o.inputDigest !== owner.inputDigest || o.implementationRef !== owner.call.implementationRef ||
        o.actorRef !== old.workerActorRef || o.workerBindingRef !== old.workerBindingRef || o.transportLane !== "closed_prompt_proof") return result(input, null, owner.call.implementationRef!, false);
      try {
        const raw = JSON.parse(o.finalOutput) as unknown;
        const source: SemanticActorSource = { cCallRef: occurrence.cCallRef, inputDigest: owner.inputDigest,
          actorInvocationRef: o.actorInvocationRef, promptDigest: o.promptDigest, transportDigest: o.transportDigest };
        return result(input, role === "author" ? deriveRevisionAsset(input, stage.declarationRef, raw, source)
          : deriveRevisionAssessment(input, stage.declarationRef, raw, source), owner.call.implementationRef!, false);
      } catch { return result(input, null, owner.call.implementationRef!, false); }
    } });
}
export function realizeSemanticRevisionAuthor(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) { return actor(input, occurrence, "author"); }
export function realizeSemanticRevisionAssessor(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) { return actor(input, occurrence, "assessor"); }
export function realizeSemanticRevisionBridge(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) {
  return result(input, occurrence.semanticStageBasis === undefined ? null : projectRevisionWorksitePreparation(occurrence.semanticStageBasis, input), ids.bridgeImplementationRef, true);
}
export function realizeSemanticRevisionEvidenceInput(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) {
  return result(input, occurrence.semanticStageBasis === undefined ? null : projectRevisionEvidenceInput(occurrence.semanticStageBasis, input), ids.evidenceInputImplementationRef, true);
}
export function realizeSemanticRevisionTerminal(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) {
  return result(input, occurrence.semanticStageBasis !== undefined && semanticRevisionInputMatchesBasis(occurrence.semanticStageBasis, input) ? input : null, ids.terminalImplementationRef, true);
}

export function realizeSemanticRevisionSelection(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  const basis = occurrence.semanticStageBasis, owner = basis === undefined ? null : authenticateSemanticStageBasis(basis);
  const assembly = basis === undefined ? null : constructNativeInstructionAssembly(basis, input);
  if (owner === null || basis === undefined || owner.call.implementationRef !== ids.selectionImplementationRef || assembly === null) throw new TypeError("selection requires native admitted parent and cause");
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
    complete(exchange) {
      const o = exchange.observation;
      if (hash(exchange.request) !== hash(assembly.request) || o.disposition !== "success" || o.promptDigest !== assembly.manifest.promptDigest ||
        o.toolCallCount !== 0 || o.inputDigest !== owner.inputDigest || o.implementationRef !== ids.selectionImplementationRef ||
        o.actorRef !== old.workerActorRef || o.workerBindingRef !== old.workerBindingRef || o.transportLane !== "closed_prompt_proof") return result(input, null, ids.selectionImplementationRef, false);
      try { const raw = JSON.parse(o.finalOutput) as unknown; return result(input, semanticRevisionSelectionMatchesBasis(basis, input, raw) ? raw : null, ids.selectionImplementationRef, false); }
      catch { return result(input, null, ids.selectionImplementationRef, false); }
    } });
}
