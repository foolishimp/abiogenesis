import { SEMANTIC_STAGE_IDS as ids } from "../gtl/semantic_stage_identity.js";
import { semanticStageImplementationBindings } from "../gtl/semantic_stage_publication.js";
import { requireNativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { authenticateSemanticStageBasis, projectSemanticWorksitePreparation, projectSemanticEvidenceInput, projectSemanticEnvelopeOutput } from "../abg/semantic_stage.js";
import { deriveSemanticAsset, deriveSemanticAssessment, isSemanticStageEnvelope } from "../product/semantic_stage.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, ABI5_PRODUCT_ID } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectNativeSemanticTask, projectNativeSemanticFold, projectNativeSemanticExecution, projectNativeSemanticEvidence, authenticateSemanticJobBasis, projectSemanticJobContext, projectSemanticJobPlan, projectSemanticJobBridge, projectSemanticJobEvidence, semanticJobInputMatchesBasis } from "../abg/semantic_job.js";
import { isSemanticJobEnvelope, deriveSemanticJobAsset, deriveSemanticJobAssessment, evaluateSemanticJobActorCandidate, semanticJobUsesDesignResponse, materializeSemanticJobDesignResponse } from "../product/semantic_job.js";
import { selectedWorksiteCommandExecutionLimits } from "./worksite_command_execution.js";
const hash = (x) => sha256Canonical(x);
const placeholder = `sha256:${"0".repeat(64)}`;
const bindings = semanticStageImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
    productId: ABI5_PRODUCT_ID, artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder });
const descriptors = bindings.map(({ kind: _kind, bindingRef: _bindingRef, ...body }) => deepFreeze({
    kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0",
    ...body, descriptorDigest: hash(body)
}));
export const SEMANTIC_AUTHOR_IMPLEMENTATION_DESCRIPTOR = descriptors[0];
export const SEMANTIC_ASSESSOR_IMPLEMENTATION_DESCRIPTOR = descriptors[1];
export const SEMANTIC_WORKSITE_BRIDGE_IMPLEMENTATION_DESCRIPTOR = descriptors[2];
export const SEMANTIC_EVIDENCE_INPUT_IMPLEMENTATION_DESCRIPTOR = descriptors[3];
export const SEMANTIC_ENVELOPE_OUTPUT_IMPLEMENTATION_DESCRIPTOR = descriptors[4];
export const SEMANTIC_JOB_CONTEXT_IMPLEMENTATION_DESCRIPTOR = descriptors[6];
export const SEMANTIC_JOB_PLAN_IMPLEMENTATION_DESCRIPTOR = descriptors[7];
export const SEMANTIC_JOB_BRIDGE_IMPLEMENTATION_DESCRIPTOR = descriptors[8];
function failure(failureClass, deterministic, issues = []) {
    const diagnosticRef = `diagnostic://abiogenesis/semantic-stage/${failureClass}@5`;
    const resultCandidate = { kind: "semantic_stage_failure", schemaVersion: "5.0.0", failureClass, diagnosticRef,
        ...(issues.length === 0 ? {} : { contractIssues: issues }) };
    return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure",
        evidenceCandidates: deterministic === undefined ? [] : [{
                kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef: deterministic.implementationRef,
                inputDigest: hash(deterministic.input), outputDigest: hash(resultCandidate),
            }], resultCandidate, diagnosticRef });
}
function success(input, output, implementationRef, deterministic) {
    return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
        resultCandidate: output, evidenceCandidates: deterministic ? [{
                kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(output)
            }] : [] });
}
function semanticActor(input, occurrence, role, prepareAssembly) {
    const basis = occurrence.semanticStageBasis;
    const owner = basis === undefined ? null : (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
        ? authenticateSemanticJobBasis(basis) : authenticateSemanticStageBasis(basis);
    const assembly = basis === undefined ? null : (prepareAssembly === undefined ? requireNativeInstructionAssembly(basis, input) : prepareAssembly());
    if (owner === null || owner.role !== role || assembly === null || owner.stage === undefined || (!isSemanticStageEnvelope(input) && !isSemanticJobEnvelope(input))) {
        throw new TypeError("semantic actor requires current native instruction assembly and declared role");
    }
    const stage = owner.stage;
    return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
        complete(exchange) {
            const observation = exchange.observation;
            if (hash(exchange.request) !== hash(assembly.request) ||
                observation.promptDigest !== assembly.manifest.promptDigest || observation.toolCallCount !== 0 ||
                observation.inputDigest !== owner.inputDigest || observation.implementationRef !== owner.call.implementationRef ||
                observation.actorRef !== ids.workerActorRef || observation.workerBindingRef !== ids.workerBindingRef ||
                observation.transportLane !== "closed_prompt_proof")
                return failure("transport_relation_mismatch");
            if (observation.disposition !== "success")
                return failure(observation.failureClass ?? "transport_failure");
            try {
                const raw = JSON.parse(observation.finalOutput);
                const designResponse = isSemanticJobEnvelope(input) && semanticJobUsesDesignResponse(role, stage.bodyCapabilities);
                const candidate = designResponse ? materializeSemanticJobDesignResponse(input, stage.declarationRef, raw) : raw;
                if (designResponse && candidate === null)
                    return failure("semantic_candidate_relation_mismatch", undefined, [{ path: "$", rule: "design_reference_response", expected: "input_bound_semantic_job_design_response", actual: null }]);
                const source = { cCallRef: occurrence.cCallRef, inputDigest: owner.inputDigest,
                    actorInvocationRef: observation.actorInvocationRef, promptDigest: observation.promptDigest, transportDigest: observation.transportDigest };
                const output = isSemanticJobEnvelope(input) ? role === "author" ? deriveSemanticJobAsset(input, stage.declarationRef, candidate, source)
                    : deriveSemanticJobAssessment(input, stage.declarationRef, candidate, source) : role === "author" ? deriveSemanticAsset(input, stage.declarationRef, candidate, source)
                    : deriveSemanticAssessment(input, stage.declarationRef, candidate, source);
                return output === null ? failure("semantic_candidate_relation_mismatch", undefined, isSemanticJobEnvelope(input) ? evaluateSemanticJobActorCandidate(input, stage.declarationRef, role, candidate) : []) : success(input, output, owner.call.implementationRef, false);
            }
            catch {
                return failure("semantic_candidate_malformed");
            }
        } });
}
export function realizeSemanticAuthor(input, occurrence, prepareAssembly) {
    return semanticActor(input, occurrence, "author", prepareAssembly);
}
export function realizeSemanticAssessor(input, occurrence, prepareAssembly) {
    return semanticActor(input, occurrence, "assessor", prepareAssembly);
}
export function realizeSemanticWorksiteBridge(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : projectSemanticWorksitePreparation(occurrence.semanticStageBasis, input);
    return output === null ? failure("design_worksite_relation_mismatch", { input, implementationRef: ids.bridgeImplementationRef }) : success(input, output, ids.bridgeImplementationRef, true);
}
export function realizeSemanticEvidenceInput(input, occurrence) {
    const basis = occurrence.semanticStageBasis;
    const output = basis === undefined ? null : (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
        ? projectSemanticJobEvidence(basis, input) : projectSemanticEvidenceInput(basis, input);
    return output === null ? failure("evidence_source_relation_mismatch", { input, implementationRef: ids.evidenceInputImplementationRef }) : success(input, output, ids.evidenceInputImplementationRef, true);
}
export function realizeSemanticEnvelopeOutput(input, occurrence) {
    const basis = occurrence.semanticStageBasis;
    const output = basis === undefined ? null : (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
        ? semanticJobInputMatchesBasis(basis, input) ? input : null : projectSemanticEnvelopeOutput(basis, input);
    return output === null ? failure("envelope_output_relation_mismatch", { input, implementationRef: ids.terminalImplementationRef }) : success(input, output, ids.terminalImplementationRef, true);
}
export async function realizeSemanticJobContext(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : await projectSemanticJobContext(occurrence.semanticStageBasis, input);
    return output === null ? failure("job_context_relation_mismatch", { input, implementationRef: ids.jobContextImplementationRef }) : success(input, output, ids.jobContextImplementationRef, true);
}
export async function realizeSemanticJobPlan(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : await projectSemanticJobPlan(occurrence.semanticStageBasis, input);
    return output === null ? failure("job_plan_relation_mismatch", { input, implementationRef: ids.jobPlanImplementationRef }) : success(input, output, ids.jobPlanImplementationRef, true);
}
export async function realizeSemanticJobBridge(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : await projectSemanticJobBridge(occurrence.semanticStageBasis, input);
    return output === null ? failure("job_bridge_relation_mismatch", { input, implementationRef: ids.jobBridgeImplementationRef }) : success(input, output, ids.jobBridgeImplementationRef, true);
}
// Existing owner adapters; actors remain the native workspace child Calls.
export async function realizeNativeSemanticAuthorTask(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : await projectNativeSemanticTask(occurrence.semanticStageBasis, input, selectedWorksiteCommandExecutionLimits());
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeAuthorTaskImplementationRef })
        : success(input, output, ids.nativeAuthorTaskImplementationRef, true);
}
export const NATIVE_SEMANTIC_AUTHOR_TASK_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeAuthorTaskImplementationRef);
export function realizeNativeSemanticAuthorFold(input, occurrence) {
    let contractIssues = [];
    const output = occurrence.semanticStageBasis === undefined ? null : projectNativeSemanticFold(occurrence.semanticStageBasis, input, issues => { contractIssues = issues; });
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeAuthorFoldImplementationRef }, contractIssues)
        : success(input, output, ids.nativeAuthorFoldImplementationRef, true);
}
export const NATIVE_SEMANTIC_AUTHOR_FOLD_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeAuthorFoldImplementationRef);
export async function realizeNativeSemanticAssessorTask(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : await projectNativeSemanticTask(occurrence.semanticStageBasis, input, selectedWorksiteCommandExecutionLimits());
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeAssessorTaskImplementationRef })
        : success(input, output, ids.nativeAssessorTaskImplementationRef, true);
}
export const NATIVE_SEMANTIC_ASSESSOR_TASK_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeAssessorTaskImplementationRef);
export function realizeNativeSemanticAssessorFold(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : projectNativeSemanticFold(occurrence.semanticStageBasis, input);
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeAssessorFoldImplementationRef })
        : success(input, output, ids.nativeAssessorFoldImplementationRef, true);
}
export const NATIVE_SEMANTIC_ASSESSOR_FOLD_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeAssessorFoldImplementationRef);
export async function realizeNativeSemanticConstructionTask(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : await projectNativeSemanticTask(occurrence.semanticStageBasis, input, selectedWorksiteCommandExecutionLimits());
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeConstructionTaskImplementationRef })
        : success(input, output, ids.nativeConstructionTaskImplementationRef, true);
}
export const NATIVE_SEMANTIC_CONSTRUCTION_TASK_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeConstructionTaskImplementationRef);
export function realizeNativeSemanticExecutionTask(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : projectNativeSemanticExecution(occurrence.semanticStageBasis, input);
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeExecutionTaskImplementationRef })
        : success(input, output, ids.nativeExecutionTaskImplementationRef, true);
}
export const NATIVE_SEMANTIC_EXECUTION_TASK_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeExecutionTaskImplementationRef);
export function realizeNativeSemanticEvidence(input, occurrence) {
    const output = occurrence.semanticStageBasis === undefined ? null : projectNativeSemanticEvidence(occurrence.semanticStageBasis, input);
    return output === null ? failure("native_semantic_source_relation_mismatch", { input, implementationRef: ids.nativeEvidenceImplementationRef })
        : success(input, output, ids.nativeEvidenceImplementationRef, true);
}
export const NATIVE_SEMANTIC_EVIDENCE_DESCRIPTOR = descriptors.find(d => d.implementationRef === ids.nativeEvidenceImplementationRef);
