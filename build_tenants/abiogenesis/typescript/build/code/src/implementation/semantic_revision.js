import { selectedWorksiteCommandExecutionLimits } from "./worksite_command_execution.js";
import { SEMANTIC_REVISION_IDS as ids } from "../gtl/semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS as old } from "../gtl/semantic_stage_identity.js";
import { semanticRevisionImplementationBindings } from "../gtl/semantic_revision_publication.js";
import { requireNativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { authenticateSemanticStageBasis } from "../abg/semantic_stage.js";
import { authenticateSemanticJobBasis } from "../abg/semantic_job.js";
import { projectSemanticRevision, semanticRevisionInputMatchesBasis, projectRevisionWorksitePreparation, projectRevisionEvidenceInput, semanticRevisionSelectionMatchesBasis, prepareNativeSemanticRevisionIntake, projectNativeSemanticRevisionRequest, projectNativeRevisionConstructionTask, projectNativeRevisionExecutionTask, projectNativeRevisionEvidence, projectSemanticJobRevision, semanticJobRevisionInputMatchesBasis, projectJobRevisionPreparation, jobRevisionSelectionMatchesBasis } from "../abg/semantic_revision.js";
import { deriveRevisionAsset, deriveRevisionAssessment, isSemanticRevisionEnvelope, isSemanticJobRevisionEnvelope, deriveJobRevisionAsset, deriveJobRevisionAssessment } from "../product/semantic_revision.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, ABI5_PRODUCT_ID } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const hash = (x) => sha256Canonical(x);
const placeholder = `sha256:${"0".repeat(64)}`;
export const SEMANTIC_REVISION_IMPLEMENTATION_DESCRIPTORS = semanticRevisionImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
    productId: ABI5_PRODUCT_ID, artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder }).map(({ kind: _kind, bindingRef: _ref, ...body }) => deepFreeze({
    kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...body, descriptorDigest: hash(body)
}));
export const [SEMANTIC_REVISION_SELECTION_DESCRIPTOR, SEMANTIC_REVISION_PROJECTION_DESCRIPTOR, SEMANTIC_REVISION_AUTHOR_DESCRIPTOR, SEMANTIC_REVISION_ASSESSOR_DESCRIPTOR, SEMANTIC_REVISION_BRIDGE_DESCRIPTOR, SEMANTIC_REVISION_EVIDENCE_INPUT_DESCRIPTOR, SEMANTIC_REVISION_TERMINAL_DESCRIPTOR, SEMANTIC_REVISION_NATIVE_INTAKE_DESCRIPTOR, SEMANTIC_REVISION_NATIVE_REQUEST_DESCRIPTOR, SEMANTIC_REVISION_NATIVE_CONSTRUCTION_DESCRIPTOR, SEMANTIC_REVISION_NATIVE_EXECUTION_DESCRIPTOR, SEMANTIC_REVISION_NATIVE_EVIDENCE_DESCRIPTOR] = SEMANTIC_REVISION_IMPLEMENTATION_DESCRIPTORS;
function result(input, output, implementationRef, deterministic, failureClass = "revision_basis_or_evidence_unavailable") {
    const failure = output === null;
    const value = failure ? { kind: "semantic_stage_failure", schemaVersion: "5.0.0", failureClass,
        diagnosticRef: failureClass === "revision_basis_or_evidence_unavailable" ? "diagnostic://abiogenesis/semantic-revision/basis-or-evidence-unavailable@5" : `diagnostic://abiogenesis/semantic-revision/${failureClass}@5` } : output;
    const evidenceCandidates = deterministic ? [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(value) }] : [];
    if (failure)
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", resultCandidate: value, evidenceCandidates, diagnosticRef: value.diagnosticRef });
    return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
        resultCandidate: value, evidenceCandidates: deterministic ? [{
                kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(value)
            }] : [],
        ...(failure ? { diagnosticRef: "diagnostic://abiogenesis/semantic-revision/basis-or-evidence-unavailable@5" } : {}) });
}
export function realizeSemanticRevisionProjection(input, occurrence) {
    const basis = occurrence.semanticStageBasis;
    return result(input, basis === undefined ? null : (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
        ? projectSemanticJobRevision(basis, input) : projectSemanticRevision(basis, input), ids.projectionImplementationRef, true);
}
function actor(input, occurrence, role, prepareAssembly) {
    const basis = occurrence.semanticStageBasis;
    const owner = basis === undefined ? null : (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
        ? authenticateSemanticJobBasis(basis) : authenticateSemanticStageBasis(basis);
    const assembly = basis === undefined ? null : (prepareAssembly === undefined ? requireNativeInstructionAssembly(basis, input) : prepareAssembly());
    if (owner === null || owner.role !== role || owner.stage === undefined || assembly === null ||
        (!isSemanticRevisionEnvelope(input) && !isSemanticJobRevisionEnvelope(input)))
        throw new TypeError("revision actor requires native basis and assembly");
    const stage = owner.stage;
    return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
        complete(exchange) {
            const o = exchange.observation;
            if (hash(exchange.request) !== hash(assembly.request) || o.disposition !== "success" || o.promptDigest !== assembly.manifest.promptDigest ||
                o.toolCallCount !== 0 || o.inputDigest !== owner.inputDigest || o.implementationRef !== owner.call.implementationRef ||
                o.actorRef !== old.workerActorRef || o.workerBindingRef !== old.workerBindingRef || o.transportLane !== "closed_prompt_proof")
                return result(input, null, owner.call.implementationRef, false);
            try {
                const raw = JSON.parse(o.finalOutput);
                const source = { cCallRef: occurrence.cCallRef, inputDigest: owner.inputDigest,
                    actorInvocationRef: o.actorInvocationRef, promptDigest: o.promptDigest, transportDigest: o.transportDigest };
                return result(input, isSemanticJobRevisionEnvelope(input) ? role === "author" ? deriveJobRevisionAsset(input, stage.declarationRef, raw, source)
                    : deriveJobRevisionAssessment(input, stage.declarationRef, raw, source) : role === "author" ? deriveRevisionAsset(input, stage.declarationRef, raw, source)
                    : deriveRevisionAssessment(input, stage.declarationRef, raw, source), owner.call.implementationRef, false);
            }
            catch {
                return result(input, null, owner.call.implementationRef, false);
            }
        } });
}
export function realizeSemanticRevisionAuthor(input, occurrence, prepareAssembly) { return actor(input, occurrence, "author", prepareAssembly); }
export function realizeSemanticRevisionAssessor(input, occurrence, prepareAssembly) { return actor(input, occurrence, "assessor", prepareAssembly); }
export function realizeSemanticRevisionBridge(input, occurrence) {
    return result(input, occurrence.semanticStageBasis === undefined ? null : isSemanticJobRevisionEnvelope(input)
        ? projectJobRevisionPreparation(occurrence.semanticStageBasis, input) : projectRevisionWorksitePreparation(occurrence.semanticStageBasis, input), ids.bridgeImplementationRef, true);
}
export function realizeSemanticRevisionEvidenceInput(input, occurrence) {
    return result(input, occurrence.semanticStageBasis === undefined ? null : projectRevisionEvidenceInput(occurrence.semanticStageBasis, input), ids.evidenceInputImplementationRef, true);
}
export function realizeSemanticRevisionTerminal(input, occurrence) {
    return result(input, occurrence.semanticStageBasis !== undefined && (isSemanticJobRevisionEnvelope(input)
        ? semanticJobRevisionInputMatchesBasis(occurrence.semanticStageBasis, input) : semanticRevisionInputMatchesBasis(occurrence.semanticStageBasis, input)) ? input : null, ids.terminalImplementationRef, true);
}
export function realizeSemanticRevisionSelection(input, occurrence, prepareAssembly) {
    const basis = occurrence.semanticStageBasis, job = basis !== undefined && (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined;
    const owner = basis === undefined ? null : job ? authenticateSemanticJobBasis(basis) : authenticateSemanticStageBasis(basis);
    const assembly = basis === undefined ? null : (prepareAssembly === undefined ? requireNativeInstructionAssembly(basis, input) : prepareAssembly());
    if (owner === null || basis === undefined || owner.call.implementationRef !== ids.selectionImplementationRef || assembly === null)
        throw new TypeError("selection requires native admitted parent and cause");
    return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
        complete(exchange) {
            const o = exchange.observation;
            if (hash(exchange.request) !== hash(assembly.request) || o.disposition !== "success" || o.promptDigest !== assembly.manifest.promptDigest ||
                o.toolCallCount !== 0 || o.inputDigest !== owner.inputDigest || o.implementationRef !== ids.selectionImplementationRef ||
                o.actorRef !== old.workerActorRef || o.workerBindingRef !== old.workerBindingRef || o.transportLane !== "closed_prompt_proof")
                return result(input, null, ids.selectionImplementationRef, false);
            try {
                const raw = JSON.parse(o.finalOutput);
                return result(input, (job ? jobRevisionSelectionMatchesBasis(basis, input, raw) : semanticRevisionSelectionMatchesBasis(basis, input, raw)) ? raw : null, ids.selectionImplementationRef, false);
            }
            catch {
                return result(input, null, ids.selectionImplementationRef, false);
            }
        } });
}
export async function realizeSemanticRevisionNativeIntake(input, occurrence) {
    let failureClass = "native_revision_basis_unavailable";
    const output = occurrence.semanticStageBasis === undefined ? null : await prepareNativeSemanticRevisionIntake(occurrence.semanticStageBasis, input, selectedWorksiteCommandExecutionLimits(), reason => { failureClass = reason; });
    return result(input, output, ids.nativeIntakeImplementationRef, true, failureClass);
}
export function realizeSemanticRevisionNativeRequest(input, occurrence) {
    return result(input, occurrence.semanticStageBasis === undefined ? null : projectNativeSemanticRevisionRequest(occurrence.semanticStageBasis, input), ids.nativeRequestImplementationRef, true);
}
export function realizeSemanticRevisionNativeConstruction(input, occurrence) {
    if (!isSemanticJobRevisionEnvelope(input) || hash(input.revisionBasis.request.nativeWorksite?.commandExecutionLimits) !== hash(selectedWorksiteCommandExecutionLimits()))
        return result(input, null, ids.nativeConstructionImplementationRef, true);
    return result(input, occurrence.semanticStageBasis === undefined ? null : projectNativeRevisionConstructionTask(occurrence.semanticStageBasis, input), ids.nativeConstructionImplementationRef, true);
}
export function realizeSemanticRevisionNativeExecution(input, occurrence) {
    return result(input, occurrence.semanticStageBasis === undefined ? null : projectNativeRevisionExecutionTask(occurrence.semanticStageBasis, input), ids.nativeExecutionImplementationRef, true);
}
export function realizeSemanticRevisionNativeEvidence(input, occurrence) {
    return result(input, occurrence.semanticStageBasis === undefined ? null : projectNativeRevisionEvidence(occurrence.semanticStageBasis, input), ids.nativeEvidenceImplementationRef, true);
}
