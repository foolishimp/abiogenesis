import { SEMANTIC_STAGE_IDS as ids } from "../gtl/semantic_stage_identity.js";
import { semanticStageImplementationBindings } from "../gtl/semantic_stage_publication.js";
import { constructNativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { authenticateSemanticStageBasis, projectSemanticWorksitePreparation, projectSemanticEvidenceInput, projectSemanticEnvelopeOutput } from "../abg/semantic_stage.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope, type SemanticActorSource } from "../product/semantic_stage.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, ABI5_PRODUCT_ID } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";

const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const placeholder = `sha256:${"0".repeat(64)}` as const;
const bindings = semanticStageImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  productId: ABI5_PRODUCT_ID, artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder });
const descriptors = bindings.map(({ kind: _kind, bindingRef: _bindingRef, ...body }) => deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const, schemaVersion: "5.0.0" as const,
  ...body, descriptorDigest: hash(body) }) as PackagedLeafImplementationDescriptor);
export const SEMANTIC_AUTHOR_IMPLEMENTATION_DESCRIPTOR = descriptors[0]!;
export const SEMANTIC_ASSESSOR_IMPLEMENTATION_DESCRIPTOR = descriptors[1]!;
export const SEMANTIC_WORKSITE_BRIDGE_IMPLEMENTATION_DESCRIPTOR = descriptors[2]!;
export const SEMANTIC_EVIDENCE_INPUT_IMPLEMENTATION_DESCRIPTOR = descriptors[3]!;
export const SEMANTIC_ENVELOPE_OUTPUT_IMPLEMENTATION_DESCRIPTOR = descriptors[4]!;

function failure(failureClass: string, deterministic?: Readonly<{
  input: Readonly<Record<string, JsonValue>>;
  implementationRef: string;
}>): Readonly<LeafRealizationCandidate> {
  const diagnosticRef = `diagnostic://abiogenesis/semantic-stage/${failureClass}@5`;
  const resultCandidate = { kind: "semantic_stage_failure", schemaVersion: "5.0.0", failureClass, diagnosticRef };
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure",
    evidenceCandidates: deterministic === undefined ? [] : [{
      kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef: deterministic.implementationRef,
      inputDigest: hash(deterministic.input), outputDigest: hash(resultCandidate),
    }], resultCandidate, diagnosticRef });
}
function success(input: Readonly<Record<string, JsonValue>>, output: unknown, implementationRef: string, deterministic: boolean): Readonly<LeafRealizationCandidate> {
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    resultCandidate: output as Readonly<Record<string, JsonValue>>, evidenceCandidates: deterministic ? [{
      kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(output) }] : [] });
}
function semanticActor(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>, role: "author" | "assessor"):
  Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  const basis = occurrence.semanticStageBasis;
  const owner = basis === undefined ? null : authenticateSemanticStageBasis(basis);
  const assembly = basis === undefined ? null : constructNativeInstructionAssembly(basis, input);
  if (owner === null || owner.role !== role || assembly === null || owner.stage === undefined || !isSemanticStageEnvelope(input)) {
    throw new TypeError("semantic actor requires current native instruction assembly and declared role");
  }
  const stage = owner.stage;
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
    complete(exchange) {
      const observation = exchange.observation;
      if (hash(exchange.request) !== hash(assembly.request) || observation.disposition !== "success" ||
        observation.promptDigest !== assembly.manifest.promptDigest || observation.toolCallCount !== 0 ||
        observation.inputDigest !== owner.inputDigest || observation.implementationRef !== owner.call.implementationRef ||
        observation.actorRef !== ids.workerActorRef || observation.workerBindingRef !== ids.workerBindingRef ||
        observation.transportLane !== "closed_prompt_proof") return failure("transport_relation_mismatch");
      try {
        const raw = JSON.parse(observation.finalOutput) as unknown;
        const source: SemanticActorSource = { cCallRef: occurrence.cCallRef, inputDigest: owner.inputDigest,
          actorInvocationRef: observation.actorInvocationRef, promptDigest: observation.promptDigest, transportDigest: observation.transportDigest };
        const output = role === "author" ? deriveSemanticAsset(input, stage.declarationRef, raw, source)
          : deriveSemanticAssessment(input, stage.declarationRef, raw, source);
        return output === null ? failure("semantic_candidate_relation_mismatch") : success(input, output, owner.call.implementationRef!, false);
      } catch { return failure("semantic_candidate_malformed"); }
    } });
}
export function realizeSemanticAuthor(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) {
  return semanticActor(input, occurrence, "author");
}
export function realizeSemanticAssessor(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>) {
  return semanticActor(input, occurrence, "assessor");
}
export function realizeSemanticWorksiteBridge(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate> {
  const output = occurrence.semanticStageBasis === undefined ? null : projectSemanticWorksitePreparation(occurrence.semanticStageBasis, input);
  return output === null ? failure("design_worksite_relation_mismatch", { input, implementationRef: ids.bridgeImplementationRef }) : success(input, output, ids.bridgeImplementationRef, true);
}
export function realizeSemanticEvidenceInput(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate> {
  const output = occurrence.semanticStageBasis === undefined ? null : projectSemanticEvidenceInput(occurrence.semanticStageBasis, input);
  return output === null ? failure("evidence_source_relation_mismatch", { input, implementationRef: ids.evidenceInputImplementationRef }) : success(input, output, ids.evidenceInputImplementationRef, true);
}
export function realizeSemanticEnvelopeOutput(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate> {
  const output = occurrence.semanticStageBasis === undefined ? null : projectSemanticEnvelopeOutput(occurrence.semanticStageBasis, input);
  return output === null ? failure("envelope_output_relation_mismatch", { input, implementationRef: ids.terminalImplementationRef }) : success(input, output, ids.terminalImplementationRef, true);
}
