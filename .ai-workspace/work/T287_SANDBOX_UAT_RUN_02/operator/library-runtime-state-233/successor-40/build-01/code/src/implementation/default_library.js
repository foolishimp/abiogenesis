import { isDeepStrictEqual as same, types } from "node:util";
import { defaultLibraryImplementationBindings } from "../gtl/default_library.js";
import { governanceRef as ref, GOVERNANCE_OPERATIONS } from "../product/default_library.js";
import { bindFramedSynthesisResult, isFramedSynthesisTask } from "../product/default_library.js";
import { admitIJsonText } from "../shared/i_json.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { projectGovernanceSelection, projectGovernanceNativeTask, projectGovernanceTestingTask, projectGovernanceFold, projectGovernanceParent, projectGovernanceChoice as projectChoice } from "../abg/default_library.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructRuntimeFailureDiagnosticRef } from "../abg/runtime_failure.js";
import { sanitizeUndispatchedOwnerError } from "../abg/event_contract_profiles.js";
const hash = (x) => sha256Canonical(x);
const descriptors = defaultLibraryImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION })
    .map(({ kind: _kind, bindingRef: _bindingRef, ...body }) => deepFreeze({ kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...body, descriptorDigest: hash(body) }));
export const GOVERNANCE_SELECTION_TASK_DESCRIPTOR = descriptors[0];
export const GOVERNANCE_SELECTOR_DESCRIPTOR = descriptors[1];
export const GOVERNANCE_PARENT_DESCRIPTOR = descriptors[2];
export const GOVERNANCE_NATIVE_TASK_DESCRIPTOR = descriptors[3];
export const GOVERNANCE_TESTING_TASK_DESCRIPTOR = descriptors[4];
export const GOVERNANCE_FOLD_DESCRIPTOR = descriptors[5];
export const GOVERNANCE_CHOICE_DESCRIPTOR = descriptors[6];
function realized(operation, input, output, refusalDiagnosticRef) {
    const diagnosticRef = refusalDiagnosticRef ?? ref("diagnostic", "missing-owned-" + operation), success = output !== null;
    const resultCandidate = (output ?? { kind: "governance_failure", schemaVersion: "5.0.0", diagnosticRef });
    const evidenceCandidates = operation === "select" ? [] : [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0",
            implementationRef: ref("implementation", operation), inputDigest: hash(input), outputDigest: hash(resultCandidate) }];
    return success ? { kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success", resultCandidate, evidenceCandidates }
        : { kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", resultCandidate, evidenceCandidates, diagnosticRef };
}
export async function prepareGovernanceSelection(input, occurrence) {
    return realized("prepare-selection", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceSelection(occurrence.nativeInstructionAssemblyBasis, input));
}
export async function prepareGovernanceNativeTask(input, occurrence) {
    return realized("prepare-native", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceNativeTask(occurrence.nativeInstructionAssemblyBasis, input));
}
export async function prepareObservedTestingTask(input, occurrence, _resolution, _inputDigest, proof) {
    let diagnosticRef;
    const refusal = (stage, relation, selectors = {}, error) => {
        if (diagnosticRef !== undefined)
            return;
        const caught = relation === "caught" && !types.isProxy(error) ? error : null;
        diagnosticRef = constructRuntimeFailureDiagnosticRef({
            diagnosticClassRef: ref("diagnostic", "missing-owned-prepare-testing"), computeRegime: "F_D",
            implementationRef: ref("implementation", "prepare-testing"), inputDigest: hash(input),
            occurrence: { cCallRef: occurrence.cCallRef, runId: occurrence.runId ?? null, graphCallId: occurrence.graphCallId ?? null,
                frameId: occurrence.frameId ?? null, programLocusRef: occurrence.programLocusRef ?? null,
                taskOrdinal: occurrence.taskOrdinal ?? null, attempt: occurrence.attempt ?? null },
            stage, relation, selectors, cause: relation === "caught" ? sanitizeUndispatchedOwnerError(caught) : null,
        });
    };
    const basis = occurrence.nativeInstructionAssemblyBasis;
    if (basis === undefined)
        refusal("testing_basis", "assembly_basis_absent");
    const output = basis === undefined ? null : await projectGovernanceTestingTask(basis, input, proof?.governanceTestingReacquisition === undefined ? undefined :
        (context, report) => proof.governanceTestingReacquisition(input, occurrence, context, report), refusal);
    return realized("prepare-testing", input, output, output === null ? diagnosticRef : undefined);
}
export function foldGovernanceWork(input, occurrence) {
    return realized("fold", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectGovernanceFold(occurrence.nativeInstructionAssemblyBasis, input));
}
export function evaluateGovernanceParent(input, occurrence) {
    return realized("evaluate-parent", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectGovernanceParent(occurrence.nativeInstructionAssemblyBasis, input));
}
export function projectGovernanceChoice(input, occurrence) {
    return realized("project-choice", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectChoice(occurrence.nativeInstructionAssemblyBasis, input));
}
export function selectGovernanceWork(input, _occurrence, prepareAssembly) {
    if (!isFramedSynthesisTask(input))
        throw new TypeError("framed synthesis task required");
    const assembly = prepareAssembly();
    return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
        complete(exchange) {
            const o = exchange.observation;
            if (!same(exchange.request, assembly.request) || o.disposition !== "success" || o.toolCallCount !== 0 ||
                o.promptDigest !== assembly.manifest.promptDigest || o.inputDigest !== hash(input) || o.implementationRef !== ref("implementation", "select"))
                throw new TypeError("native selector exchange mismatch");
            const output = bindFramedSynthesisResult(input, assembly.envelope.targetBindings, assembly.envelope.boundBasis, admitIJsonText(o.finalOutput, "framed synthesis raw result"));
            if (output === null)
                throw new TypeError("native selector choice binding refused");
            return realized("select", input, output);
        } });
}
