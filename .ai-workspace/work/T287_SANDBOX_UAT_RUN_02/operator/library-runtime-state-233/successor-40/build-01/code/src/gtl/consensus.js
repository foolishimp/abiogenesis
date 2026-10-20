import { isRecord, hasNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { sha256Bytes, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isNonBlankRef } from "../shared/references.js";
import { C, cCarrier, cGraphFunctionRef, workflow, } from "./c_algebra.js";
import { fanInApplication, fanOutApplication, graphEdge, recurseApplication, } from "./graph_applications.js";
import { evaluatorDeclaration, modulePublication, productSemanticsBinding, ruleDeclaration, } from "./declarations.js";
import { CONSENSUS_CLASSIFICATION_VALUES, CONSENSUS_FH_DECISION_VALUES, CONSENSUS_REVIEWER_RESPONSE_SCHEMA, CONSENSUS_ROUND_OUTCOME_VALUES, CONSENSUS_SCHEMA_ASSET_BINDINGS, CONSENSUS_SCHEMA_REQUIRED_KEYS, CONSENSUS_SUBMITTER_RESPONSE_SCHEMA, isConsensusReviewerCandidate, isConsensusSubmitterResponseCandidate, REVIEW_RULING_KIND_VALUES, } from "./consensus_schema.js";
export { CONSENSUS_CLASSIFICATION_VALUES, CONSENSUS_FH_DECISION_VALUES, CONSENSUS_PUBLIC_SCHEMA, CONSENSUS_REVIEWER_RESPONSE_SCHEMA, CONSENSUS_ROUND_OUTCOME_VALUES, CONSENSUS_SCHEMA_ASSET_BINDINGS, CONSENSUS_SCHEMA_REQUIRED_KEYS, CONSENSUS_SUBMITTER_RESPONSE_SCHEMA, isConsensusReviewerCandidate, isConsensusSubmitterResponseCandidate, REVIEW_RULING_KIND_VALUES, } from "./consensus_schema.js";
export const CONSENSUS_IDS = Object.freeze({
    handle: "gtl://abg/consensus/submitter-reviewer-rounds",
    ownerRef: "owner://abg/substrate",
    moduleRef: "module://abg/consensus@5",
    oneSurfaceProgramRef: "program://abg/system/consensus-one-surface@5",
    oneSurfaceStartRef: "start://abg/consensus/one-surface@5",
    oneSurfaceGraphFunctionRef: "graph-function://abg/consensus/one-surface@5",
    oneSurfaceGraphRef: "graph://abg/consensus/one-surface@5",
    oneSurfaceNodeRef: "locus://abg/consensus/one-surface@5",
    oneSurfaceCompositionRef: "composition://abg/consensus/one-surface@5",
    synthesizeModelLocusRef: "locus://abg/consensus/one-surface/synthesize-model@5",
    evalGapLocusRef: "locus://abg/consensus/one-surface/eval-gap@5",
    evaluateNextLocusRef: "locus://abg/consensus/one-surface/evaluate-next@5",
    evaluateActionLocusRef: "locus://abg/consensus/one-surface/evaluate-action@5",
    refreshModelLocusRef: "locus://abg/consensus/one-surface/refresh-model@5",
    refreshGapLocusRef: "locus://abg/consensus/one-surface/refresh-gap@5",
    refreshEvaluateNextLocusRef: "locus://abg/consensus/one-surface/refresh-evaluate-next@5",
    synthesizeModelAuthorityRef: "authority://abg/consensus/synthesize-model@5",
    evalGapAuthorityRef: "authority://abg/consensus/eval-gap@5",
    evaluateNextAuthorityRef: "authority://abg/consensus/evaluate-next@5",
    evaluateActionAuthorityRef: "authority://abg/consensus/evaluate-action@5",
    consensusActionRef: "action://abg/consensus/invoke@5",
    consensusObligationRef: "obligation://abg/consensus/result@5",
    consensusInputAssetRef: "asset://abg/consensus/invocation@5",
    consensusOutputAssetRef: "asset://abg/consensus/result@5",
    consensusExpectedDeltaRef: "delta-expectation://abg/consensus/result@5",
    consensusProgressConditionRef: "condition://abg/consensus/result-admitted@5",
    consensusStopConditionRef: "condition://abg/consensus/non-close@5",
    consensusTargetOutcomeRef: "outcome://abg/consensus/ordinary-path-result@5",
    consensusPrioritySchemeRef: "priority://abg/consensus/canonical-callable-first@5",
    consensusClosurePolicyRef: "policy://abg/consensus/complete-evidence-refresh@5",
    graphFunctionRef: "graph-function://abg/consensus/submitter-reviewer-rounds",
    graphRef: "graph://abg/consensus/submitter-reviewer-rounds@5",
    nodeRef: "locus://abg/consensus/root@5",
    roundLoopGraphFunctionRef: "graph-function://abg/consensus/round-loop@5",
    roundLoopGraphRef: "graph://abg/consensus/round-loop@5",
    roundLoopNodeRef: "locus://abg/consensus/round-loop@5",
    roundGraphFunctionRef: "graph-function://abg/consensus/round@5",
    roundGraphRef: "graph://abg/consensus/round@5",
    roundNodeRef: "locus://abg/consensus/round@5",
    reviewerGraphFunctionRef: "graph-function://abg/consensus/reviewer@5",
    reviewerGraphRef: "graph://abg/consensus/reviewer@5",
    reviewerNodeRef: "locus://abg/consensus/reviewer@5",
    submitterGraphFunctionRef: "graph-function://abg/consensus/submitter@5",
    submitterGraphRef: "graph://abg/consensus/submitter@5",
    submitterNodeRef: "locus://abg/consensus/submitter@5",
    submitterTaskGraphFunctionRef: "graph-function://abg/consensus/prepare-submitter-task@5",
    submitterTaskGraphRef: "graph://abg/consensus/prepare-submitter-task@5",
    submitterTaskNodeRef: "locus://abg/consensus/prepare-submitter-task@5",
    roundReducerGraphFunctionRef: "graph-function://abg/consensus/submitter-reviewer-fold@5",
    roundReducerGraphRef: "graph://abg/consensus/submitter-reviewer-fold@5",
    reducerGraphFunctionRef: "graph-function://abg/consensus/reducer@5",
    reducerGraphRef: "graph://abg/consensus/reducer@5",
    reducerNodeRef: "locus://abg/consensus/reducer@5",
    finalizationLoopGraphFunctionRef: "graph-function://abg/consensus/finalization-loop@5",
    finalizationLoopGraphRef: "graph://abg/consensus/finalization-loop@5",
    finalizationLoopNodeRef: "locus://abg/consensus/finalization-loop@5",
    finalizationPreparationNodeRef: "locus://abg/consensus/prepare-finalization/root@5",
    projectorGraphFunctionRef: "graph-function://abg/consensus/project-result@5",
    projectorGraphRef: "graph://abg/consensus/project-result@5",
    projectorNodeRef: "locus://abg/consensus/project-result@5",
    escalationGraphFunctionRef: "graph-function://abg/consensus/fh-escalation@5",
    escalationGraphRef: "graph://abg/consensus/fh-escalation@5",
    escalationNodeRef: "locus://abg/consensus/fh-escalation@5",
    escalationFinalizerGraphFunctionRef: "graph-function://abg/consensus/fh-escalation-finalizer@5",
    escalationFinalizerGraphRef: "graph://abg/consensus/fh-escalation-finalizer@5",
    escalationFinalizerNodeRef: "locus://abg/consensus/fh-escalation-finalizer@5",
    subjectContractRef: "contract://abg/schema/consensus-subject@5",
    subjectMaterializationContractRef: "contract://abg/consensus/subject-materialization@5",
    panelContractRef: "contract://abg/schema/consensus-panel@5",
    profileContractRef: "contract://abg/schema/consensus-reviewer-profile@5",
    reviewerInstructionContractRef: "contract://abg/consensus/reviewer-instruction@5",
    submitterProfileContractRef: "contract://abg/schema/consensus-submitter-profile@5",
    submitterInstructionContractRef: "contract://abg/consensus/submitter-instruction@5",
    submitterTaskContractRef: "contract://abg/consensus/submitter-task@5",
    submitterResponseContractRef: "contract://abg/consensus/submitter-response@5",
    findingsContractRef: "contract://abg/schema/review-findings@5",
    rulingsContractRef: "contract://abg/schema/review-rulings@5",
    rulingOverlayContractRef: "contract://abg/schema/consensus-ruling-overlay@5",
    policyContractRef: "contract://abg/schema/consensus-round-policy@5",
    roundOutcomeContractRef: "contract://abg/schema/consensus-round-outcome@5",
    resultCandidateContractRef: "contract://abg/consensus/result-candidate@5",
    resultContractRef: "contract://abg/schema/consensus-result@5",
    ticketProjectionContractRef: "contract://abg/schema/ticket-consensus-projection@5",
    invocationContractRef: "contract://abg/consensus/invocation@5",
    observationContractRef: "contract://abg/consensus/observation-snapshot@5",
    modelContractRef: "contract://abg/consensus/model-snapshot@5",
    nextActionBasisContractRef: "contract://abg/consensus/next-action-basis@5",
    nextActionContractRef: "contract://abg/consensus/next-action-projection@5",
    actionEvaluationBasisContractRef: "contract://abg/consensus/action-evaluation-basis@5",
    actionEvaluationContractRef: "contract://abg/consensus/action-evaluation@5",
    stateContractRef: "contract://abg/consensus/round-state@5",
    resolutionContractRef: "contract://abg/consensus/resolution@5",
    reviewerTaskContractRef: "contract://abg/consensus/reviewer-task@5",
    findingsVectorContractRef: "contract://abg/consensus/findings-vector@5",
    escalationDecisionContractRef: "contract://abg/consensus/fh-escalation-decision@5",
    escalationRequestContractRef: "contract://abg/consensus/fh-escalation-request@5",
    failureContractRef: "contract://abg/consensus/failure@5",
    refusalContractRef: "contract://abg/consensus/refusal@5",
    evidenceContractRef: "contract://abg/consensus/evidence@5",
    judgmentContractRef: "contract://abg/consensus/judgment@5",
    transitionContractRef: "contract://abg/consensus/transition@5",
    rootClosureContractRef: "closure://abg/consensus/root@5",
    childClosureContractRef: "closure://abg/consensus/child@5",
    reviewerClosureContractRef: "closure://abg/consensus/reviewer@5",
    submitterClosureContractRef: "closure://abg/consensus/submitter@5",
    resultClosureContractRef: "closure://abg/consensus/result@5",
    finalizationClosureContractRef: "closure://abg/consensus/finalization@5",
    oneSurfaceClosureContractRef: "closure://abg/consensus/one-surface@5",
    initializerPredicateRef: "predicate://abg/consensus/initialize@5",
    roundEvaluatorPredicateRef: "predicate://abg/consensus/round-terminal@5",
    rootWorkflowPredicateRef: "predicate://abg/consensus/root-workflow-foldback@5",
    roundWorkflowPredicateRef: "predicate://abg/consensus/round-workflow-foldback@5",
    roundReducerPredicateRef: "predicate://abg/consensus/submitter-reviewer-fold@5",
    roundEvaluatorRef: "evaluator://abg/consensus/round-terminal@5",
    roundTerminationRuleRef: "rule://abg/consensus/round-terminal@5",
    finalizationEvaluatorRef: "evaluator://abg/consensus/finalization-terminal@5",
    finalizationTerminationRuleRef: "rule://abg/consensus/finalization-terminal@5",
    convergenceRuleRef: "rule://abg/consensus/exact-agreement@5",
    disagreementRuleRef: "rule://abg/consensus/material-dispute@5",
    escalationRuleRef: "rule://abg/consensus/unresolved-to-fh@5",
    foldbackContractRef: "contract://abg/consensus/round-foldback@5",
    reviewerPredicateRef: "predicate://abg/consensus/reviewer-attribution@5",
    submitterTaskPredicateRef: "predicate://abg/consensus/prepare-submitter-task@5",
    submitterPredicateRef: "predicate://abg/consensus/submitter-attribution@5",
    reducerPredicateRef: "predicate://abg/consensus/reduce-round@5",
    projectorPredicateRef: "predicate://abg/consensus/project-result@5",
    escalationFinalizerPredicateRef: "predicate://abg/consensus/finalize-fh-escalation@5",
    finalizationPreparationPredicateRef: "predicate://abg/consensus/prepare-finalization@5",
    finalizationEvaluatorPredicateRef: "predicate://abg/consensus/finalization-terminal@5",
    oneSurfacePredicateRef: "predicate://abg/consensus/one-surface-stage@5",
    initializerImplementationBindingRef: "implementation-binding://abg/consensus/initialize@5",
    initializerImplementationRef: "implementation://abg/consensus/initialize@5",
    roundEvaluatorImplementationBindingRef: "implementation-binding://abg/consensus/round-evaluator@5",
    roundEvaluatorImplementationRef: "implementation://abg/consensus/round-evaluator@5",
    reviewerImplementationBindingRef: "implementation-binding://abg/consensus/reviewer@5",
    reviewerImplementationRef: "implementation://abg/consensus/reviewer@5",
    submitterTaskImplementationBindingRef: "implementation-binding://abg/consensus/prepare-submitter-task@5",
    submitterTaskImplementationRef: "implementation://abg/consensus/prepare-submitter-task@5",
    submitterImplementationBindingRef: "implementation-binding://abg/consensus/submitter@5",
    submitterImplementationRef: "implementation://abg/consensus/submitter@5",
    reducerImplementationBindingRef: "implementation-binding://abg/consensus/reducer@5",
    reducerImplementationRef: "implementation://abg/consensus/reducer@5",
    finalizationPreparationImplementationBindingRef: "implementation-binding://abg/consensus/prepare-finalization@5",
    finalizationPreparationImplementationRef: "implementation://abg/consensus/prepare-finalization@5",
    finalizationEvaluatorImplementationBindingRef: "implementation-binding://abg/consensus/finalization-evaluator@5",
    finalizationEvaluatorImplementationRef: "implementation://abg/consensus/finalization-evaluator@5",
    projectorImplementationBindingRef: "implementation-binding://abg/consensus/project-result@5",
    projectorImplementationRef: "implementation://abg/consensus/project-result@5",
    escalationFinalizerImplementationBindingRef: "implementation-binding://abg/consensus/finalize-fh-escalation@5",
    escalationFinalizerImplementationRef: "implementation://abg/consensus/finalize-fh-escalation@5",
    synthesizeModelImplementationBindingRef: "implementation-binding://abg/consensus/synthesize-model@5",
    synthesizeModelImplementationRef: "implementation://abg/consensus/synthesize-model@5",
    evalGapImplementationBindingRef: "implementation-binding://abg/consensus/eval-gap@5",
    evalGapImplementationRef: "implementation://abg/consensus/eval-gap@5",
    evaluateNextImplementationBindingRef: "implementation-binding://abg/consensus/evaluate-next@5",
    evaluateNextImplementationRef: "implementation://abg/consensus/evaluate-next@5",
    evaluateActionImplementationBindingRef: "implementation-binding://abg/consensus/evaluate-action@5",
    evaluateActionImplementationRef: "implementation://abg/consensus/evaluate-action@5",
    refreshModelImplementationBindingRef: "implementation-binding://abg/consensus/refresh-model@5",
    refreshModelImplementationRef: "implementation://abg/consensus/refresh-model@5",
    refreshGapImplementationBindingRef: "implementation-binding://abg/consensus/refresh-gap@5",
    refreshGapImplementationRef: "implementation://abg/consensus/refresh-gap@5",
    refreshEvaluateNextImplementationBindingRef: "implementation-binding://abg/consensus/refresh-evaluate-next@5",
    refreshEvaluateNextImplementationRef: "implementation://abg/consensus/refresh-evaluate-next@5",
    roundApplicationRef: "application://abg/consensus/round-loop@5",
    finalizationApplicationRef: "application://abg/consensus/finalization-loop@5",
    roundBatchRef: "batch://abg/consensus/reviewers@5",
    interactionKind: "consensus_resolution",
    actorCapabilityRef: "capability://abg/consensus/fh-resolution@5",
    continuationContractRef: "contract://abg/consensus/continuation@5",
    productSemanticsBindingRef: "product-semantics://abiogenesis/system@5",
    subjectCatalogHandle: "catalog://abg/consensus/subject",
    reviewerProfileCatalogHandle: "catalog://abg/consensus/profile/reviewer",
    reviewerInstructionCatalogHandle: "catalog://abg/consensus/instruction/reviewer",
    submitterProfileCatalogHandle: "catalog://abg/consensus/profile/submitter",
    submitterInstructionCatalogHandle: "catalog://abg/consensus/instruction/submitter",
    policyCatalogHandle: "catalog://abg/consensus/policy/round",
    rulingOverlayCatalogHandle: "catalog://abg/consensus/overlay/ruling",
    rulingVocabularyRef: "abg.vocabulary.review-ruling-kind",
    roundOutcomeVocabularyRef: "abg.vocabulary.consensus-round-outcome",
    fhDecisionVocabularyRef: "abg.vocabulary.consensus-fh-decision",
});
function isRef(value) {
    return isNonBlankRef(value);
}
function isConsensusActionCatalog(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "catalogDigest",
            "catalogRef",
            "kind",
            "rows",
            "schemaVersion",
        ]) ||
        value.kind !== "action_catalog" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.catalogRef) ||
        !isDigest(value.catalogDigest) ||
        !Array.isArray(value.rows) ||
        value.rows.length !== 1 ||
        !isRecord(value.rows[0]))
        return false;
    const row = value.rows[0];
    if (!hasExactKeys(row, [
        "actionKind",
        "actionRef",
        "expectedDeltaRef",
        "graphFunctionRef",
        "inputAssetRefs",
        "kind",
        "outputAssetRefs",
        "programRef",
        "progressConditionRef",
        "stopConditionRef",
        "targetObligationRefs",
        "targetProgramLocusRef",
    ]) ||
        row.kind !== "action_catalog_row" ||
        row.actionRef !== CONSENSUS_IDS.consensusActionRef ||
        row.actionKind !== "invoke_graph_function" ||
        row.programRef !== CONSENSUS_IDS.oneSurfaceProgramRef ||
        row.graphFunctionRef !== CONSENSUS_IDS.graphFunctionRef ||
        row.targetProgramLocusRef !== CONSENSUS_IDS.graphFunctionRef ||
        !Array.isArray(row.targetObligationRefs) ||
        row.targetObligationRefs.join("\0") !==
            CONSENSUS_IDS.consensusObligationRef ||
        !Array.isArray(row.inputAssetRefs) ||
        row.inputAssetRefs.join("\0") !== CONSENSUS_IDS.consensusInputAssetRef ||
        !Array.isArray(row.outputAssetRefs) ||
        row.outputAssetRefs.join("\0") !==
            CONSENSUS_IDS.consensusOutputAssetRef ||
        row.expectedDeltaRef !== CONSENSUS_IDS.consensusExpectedDeltaRef ||
        row.progressConditionRef !==
            CONSENSUS_IDS.consensusProgressConditionRef ||
        row.stopConditionRef !== CONSENSUS_IDS.consensusStopConditionRef)
        return false;
    const { catalogRef: _catalogRef, catalogDigest: _catalogDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.catalogDigest === digest &&
        value.catalogRef ===
            `action-catalog://product/${digest.slice("sha256:".length)}`;
}
export function constructConsensusObservationSnapshot(input) {
    const body = {
        kind: "observation_snapshot",
        schemaVersion: "5.0.0",
        workspaceBinding: {
            workspaceBindingId: input.workspaceBindingId,
            workspaceBindingDigest: input.workspaceBindingDigest,
        },
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        targetObligationRefs: [CONSENSUS_IDS.consensusObligationRef],
        actionCatalog: input.actionCatalog,
        availableActionRefs: [CONSENSUS_IDS.consensusActionRef],
        constructionState: null,
        consensusInvocation: input.consensusInvocation,
        consensusResultRef: null,
        modelRef: null,
    };
    const snapshotDigest = sha256Canonical(body);
    const snapshot = deepFreeze({
        ...body,
        snapshotRef: `observation-snapshot://product/${snapshotDigest.slice("sha256:".length)}`,
        snapshotDigest,
    });
    if (!isConsensusObservationSnapshot(snapshot)) {
        throw new TypeError("Consensus observation requires one exact workspace, action catalog, and invocation");
    }
    return snapshot;
}
export function isConsensusObservationSnapshot(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "actionCatalog",
            "availableActionRefs",
            "consensusInvocation",
            "consensusResultRef",
            "constructionState",
            "kind",
            "modelRef",
            "schemaVersion",
            "snapshotDigest",
            "snapshotRef",
            "targetObligationRefs",
            "targetOutcomeRef",
            "workspaceBinding",
        ]) ||
        value.kind !== "observation_snapshot" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.snapshotRef) ||
        !isDigest(value.snapshotDigest) ||
        !isRecord(value.workspaceBinding) ||
        !hasExactKeys(value.workspaceBinding, [
            "workspaceBindingDigest",
            "workspaceBindingId",
        ]) ||
        !isRef(value.workspaceBinding.workspaceBindingId) ||
        !isDigest(value.workspaceBinding.workspaceBindingDigest) ||
        value.targetOutcomeRef !== CONSENSUS_IDS.consensusTargetOutcomeRef ||
        !Array.isArray(value.targetObligationRefs) ||
        value.targetObligationRefs.join("\0") !==
            CONSENSUS_IDS.consensusObligationRef ||
        !isConsensusActionCatalog(value.actionCatalog) ||
        !Array.isArray(value.availableActionRefs) ||
        value.availableActionRefs.join("\0") !==
            CONSENSUS_IDS.consensusActionRef ||
        !isConsensusInvocation(value.consensusInvocation) ||
        (value.consensusResultRef !== null && !isRef(value.consensusResultRef)) ||
        (value.modelRef !== null && !isRef(value.modelRef)) ||
        (value.constructionState !== null &&
            !isRecord(value.constructionState)))
        return false;
    const { snapshotRef: _snapshotRef, snapshotDigest: _snapshotDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.snapshotDigest === digest &&
        value.snapshotRef ===
            `observation-snapshot://product/${digest.slice("sha256:".length)}`;
}
function consensusGapProjection(snapshot, phase) {
    const body = {
        kind: "consensus_gap_projection",
        schemaVersion: "5.0.0",
        modelRef: snapshot.modelRef,
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        pressure: phase === "initial"
            ? "consensus_required"
            : "none",
        resultRef: snapshot.consensusResultRef,
    };
    const digest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        gapRef: `gap://abg/consensus/${digest.slice("sha256:".length)}`,
    });
}
function consensusConstructionPolicy() {
    return deepFreeze({
        kind: "construction_policy",
        policyRef: CONSENSUS_IDS.consensusClosurePolicyRef,
        requireCompleteEvidence: true,
        requirePostEvidenceRefresh: true,
    });
}
export function synthesizeConsensusModel(input) {
    if (!isConsensusObservationSnapshot(input)) {
        throw new TypeError("Consensus model synthesis requires one observation");
    }
    const { snapshotRef: _snapshotRef, snapshotDigest: _snapshotDigest, ...prior } = input;
    const modelDigest = sha256Canonical({
        invocationRef: input.consensusInvocation.invocationRef,
        subjectRef: input.consensusInvocation.subject.subjectRef,
        workspaceBinding: input.workspaceBinding,
    });
    const body = {
        ...prior,
        modelRef: `model://abg/consensus/${modelDigest.slice("sha256:".length)}`,
    };
    const snapshotDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        snapshotRef: `observation-snapshot://product/${snapshotDigest.slice("sha256:".length)}`,
        snapshotDigest,
    });
}
export function evaluateConsensusGap(input) {
    if (!isConsensusObservationSnapshot(input) ||
        input.modelRef === null) {
        throw new TypeError("Consensus gap evaluation requires the observed model");
    }
    const phase = input.consensusResultRef === null
        ? "initial"
        : "post_evidence";
    const gapProjection = consensusGapProjection(input, phase);
    const targetInputDigest = sha256Canonical(input.consensusInvocation);
    const body = {
        kind: "next_action_basis",
        schemaVersion: "5.0.0",
        observationSnapshot: input,
        gapProjection,
        targetObligationRefs: [CONSENSUS_IDS.consensusObligationRef],
        admittedActionCatalog: input.actionCatalog,
        priorityScheme: {
            kind: "construction_priority_scheme",
            schemeRef: CONSENSUS_IDS.consensusPrioritySchemeRef,
        },
        runtimeFrontier: {
            kind: "runtime_frontier",
            phase,
            openObligationRefs: phase === "initial"
                ? [CONSENSUS_IDS.consensusObligationRef]
                : [],
            snapshotRef: input.snapshotRef,
        },
        declaredPolicy: consensusConstructionPolicy(),
        targetInputRef: input.consensusInvocation.invocationRef,
        targetInputDigest,
        targetInput: input.consensusInvocation,
    };
    const basisDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        basisRef: `next-action-basis://product/${basisDigest.slice("sha256:".length)}`,
        basisDigest,
    });
}
export function isConsensusNextActionBasis(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "admittedActionCatalog",
            "basisDigest",
            "basisRef",
            "declaredPolicy",
            "gapProjection",
            "kind",
            "observationSnapshot",
            "priorityScheme",
            "runtimeFrontier",
            "schemaVersion",
            "targetInput",
            "targetInputDigest",
            "targetInputRef",
            "targetObligationRefs",
        ]) ||
        value.kind !== "next_action_basis" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.basisRef) ||
        !isDigest(value.basisDigest) ||
        !isConsensusObservationSnapshot(value.observationSnapshot) ||
        !isRecord(value.gapProjection) ||
        !isConsensusActionCatalog(value.admittedActionCatalog) ||
        !isRecord(value.priorityScheme) ||
        value.priorityScheme.kind !== "construction_priority_scheme" ||
        value.priorityScheme.schemeRef !==
            CONSENSUS_IDS.consensusPrioritySchemeRef ||
        !isRecord(value.runtimeFrontier) ||
        !["initial", "post_evidence"].includes(String(value.runtimeFrontier.phase)) ||
        !isRecord(value.declaredPolicy) ||
        sha256Canonical(value.declaredPolicy) !==
            sha256Canonical(consensusConstructionPolicy()) ||
        !isConsensusInvocation(value.targetInput) ||
        value.targetInputRef !== value.targetInput.invocationRef ||
        value.targetInputDigest !==
            sha256Canonical(value.targetInput) ||
        !Array.isArray(value.targetObligationRefs) ||
        value.targetObligationRefs.join("\0") !==
            CONSENSUS_IDS.consensusObligationRef)
        return false;
    const { basisRef: _basisRef, basisDigest: _basisDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.basisDigest === digest &&
        value.basisRef ===
            `next-action-basis://product/${digest.slice("sha256:".length)}`;
}
function obligationBinding(disposition, eligibleActionRefs) {
    return {
        kind: "target_obligation_binding",
        obligationRef: CONSENSUS_IDS.consensusObligationRef,
        disposition,
        eligibleActionRefs,
    };
}
function priorityProjection(orderedActionRefs) {
    return {
        kind: "deterministic_priority_projection",
        schemeRef: CONSENSUS_IDS.consensusPrioritySchemeRef,
        orderedActionRefs,
    };
}
export function selectConsensusNextAction(input) {
    if (!isConsensusNextActionBasis(input)) {
        throw new TypeError("Consensus action selection requires one exact basis");
    }
    const frontier = input.runtimeFrontier;
    if (frontier.phase !== "initial") {
        throw new TypeError("Initial Consensus selection requires initial pressure");
    }
    const gap = input.gapProjection;
    const body = {
        kind: "next_action_projection",
        schemaVersion: "5.0.0",
        disposition: "selected",
        actionKind: "invoke_graph_function",
        nextActionBasisRef: input.basisRef,
        nextActionBasisDigest: input.basisDigest,
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        selectedActionRef: CONSENSUS_IDS.consensusActionRef,
        programRef: CONSENSUS_IDS.oneSurfaceProgramRef,
        graphFunctionRef: CONSENSUS_IDS.graphFunctionRef,
        targetProgramLocusRef: CONSENSUS_IDS.graphFunctionRef,
        gapRef: gap.gapRef,
        targetObligationRefs: [CONSENSUS_IDS.consensusObligationRef],
        targetObligationBindings: [
            obligationBinding("bound", [CONSENSUS_IDS.consensusActionRef]),
        ],
        inputAssetRefs: [CONSENSUS_IDS.consensusInputAssetRef],
        outputAssetRefs: [CONSENSUS_IDS.consensusOutputAssetRef],
        expectedDeltaRef: CONSENSUS_IDS.consensusExpectedDeltaRef,
        progressConditionRef: CONSENSUS_IDS.consensusProgressConditionRef,
        stopConditionRef: CONSENSUS_IDS.consensusStopConditionRef,
        priorityProjection: priorityProjection([
            CONSENSUS_IDS.consensusActionRef,
        ]),
        lawfulBasisRefs: [
            String(input.basisRef),
            String(gap.gapRef),
            CONSENSUS_IDS.oneSurfaceProgramRef,
        ],
        rejectedAlternativeRefs: [],
    };
    const projectionDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        projectionRef: `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
export function isConsensusNextActionProjection(value) {
    if (!isRecord(value) || value.kind !== "next_action_projection") {
        return false;
    }
    const { projectionRef, projectionDigest, ...body } = value;
    if (!isRef(projectionRef) ||
        !isDigest(projectionDigest) ||
        projectionDigest !== sha256Canonical(body) ||
        projectionRef !==
            `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`)
        return false;
    if (value.disposition === "selected") {
        return value.actionKind === "invoke_graph_function" &&
            value.selectedActionRef === CONSENSUS_IDS.consensusActionRef &&
            value.programRef === CONSENSUS_IDS.oneSurfaceProgramRef &&
            value.graphFunctionRef === CONSENSUS_IDS.graphFunctionRef &&
            value.targetProgramLocusRef === CONSENSUS_IDS.graphFunctionRef;
    }
    return value.disposition === "converged" &&
        isRef(value.constructionIntentRef) &&
        isRef(value.edgeClosureDecisionRef) &&
        value.targetOutcomeRef === CONSENSUS_IDS.consensusTargetOutcomeRef;
}
export function isConsensusActionEvaluationBasis(value) {
    if (!isRecord(value) ||
        value.kind !== "action_evaluation_basis" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.basisRef) ||
        !isDigest(value.basisDigest) ||
        !isRecord(value.constructionIntent) ||
        !isConsensusNextActionBasis(value.nextActionBasis) ||
        !Array.isArray(value.admittedEvidence) ||
        value.admittedEvidence.length !== 1 ||
        !isRecord(value.admittedEvidence[0]) ||
        !isConsensusResultCandidate(value.admittedEvidence[0].responseValue) ||
        !isRecord(value.workspaceBinding) ||
        !isRecord(value.actionCatalog) ||
        !isRecord(value.closurePolicy) ||
        !Array.isArray(value.runtimeEvidenceEventRefs) ||
        value.runtimeEvidenceEventRefs.length !== 5)
        return false;
    const evidence = value.admittedEvidence[0];
    const intent = value.constructionIntent;
    const { basisRef: _basisRef, basisDigest: _basisDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.basisDigest === digest &&
        value.basisRef ===
            `action-evaluation-basis://abiogenesis/${digest.slice("sha256:".length)}` &&
        intent.actionKind === "invoke_graph_function" &&
        intent.selectedGraphFunctionRef === CONSENSUS_IDS.graphFunctionRef &&
        evidence.responseDigest ===
            sha256Canonical(evidence.responseValue) &&
        Array.isArray(evidence.semanticEvidenceAssetRefs) &&
        evidence.semanticEvidenceAssetRefs.join("\0") ===
            CONSENSUS_IDS.consensusOutputAssetRef;
}
export function evaluateConsensusAction(input) {
    if (!isConsensusActionEvaluationBasis(input)) {
        throw new TypeError("Consensus action evaluation requires admitted child evidence");
    }
    const intent = input.constructionIntent;
    const evidence = input.admittedEvidence[0];
    const ledgerBody = {
        kind: "edge_fulfillment_ledger",
        schemaVersion: "5.0.0",
        constructionIntentRef: intent.constructionIntentRef,
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        rows: [{
                obligationRef: CONSENSUS_IDS.consensusObligationRef,
                evidenceRefs: [evidence.responseRef],
                evidenceAssetRefs: [CONSENSUS_IDS.consensusOutputAssetRef],
                disposition: "fulfilled",
            }],
    };
    const ledgerDigest = sha256Canonical(ledgerBody);
    const edgeFulfillmentLedger = {
        ...ledgerBody,
        ledgerRef: `edge-fulfillment-ledger://product/${ledgerDigest.slice("sha256:".length)}`,
        ledgerDigest,
    };
    const decisionBody = {
        kind: "edge_closure_decision",
        schemaVersion: "5.0.0",
        constructionIntentRef: intent.constructionIntentRef,
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        ledgerRef: edgeFulfillmentLedger.ledgerRef,
        disposition: "close_candidate",
        correctionDisposition: null,
    };
    const decisionDigest = sha256Canonical(decisionBody);
    const edgeClosureDecision = {
        ...decisionBody,
        decisionRef: `edge-closure-decision://product/${decisionDigest.slice("sha256:".length)}`,
        decisionDigest,
    };
    const basis = input.nextActionBasis;
    const evaluationBody = {
        kind: "action_evaluation_projection",
        schemaVersion: "5.0.0",
        actionEvaluationBasisRef: input.basisRef,
        actionEvaluationBasisDigest: input.basisDigest,
        constructionIntentRef: intent.constructionIntentRef,
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        admittedEvidenceRefs: [evidence.responseRef],
        semanticEvidenceAssetRefs: [CONSENSUS_IDS.consensusOutputAssetRef],
        observationSnapshot: basis.observationSnapshot,
        runtimeArchiveInspection: null,
        edgeFulfillmentLedger,
        edgeClosureDecision,
    };
    const actionEvaluationDigest = sha256Canonical(evaluationBody);
    return deepFreeze({
        ...evaluationBody,
        actionEvaluationRef: `action-evaluation://product/${actionEvaluationDigest.slice("sha256:".length)}`,
        actionEvaluationDigest,
    });
}
export function isConsensusActionEvaluationProjection(value) {
    if (!isRecord(value) ||
        value.kind !== "action_evaluation_projection" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.actionEvaluationRef) ||
        !isDigest(value.actionEvaluationDigest) ||
        !isRecord(value.edgeFulfillmentLedger) ||
        !isRecord(value.edgeClosureDecision) ||
        !isConsensusObservationSnapshot(value.observationSnapshot))
        return false;
    const { actionEvaluationRef: _actionEvaluationRef, actionEvaluationDigest: _actionEvaluationDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.actionEvaluationDigest === digest &&
        value.actionEvaluationRef ===
            `action-evaluation://product/${digest.slice("sha256:".length)}`;
}
export function refreshConsensusModel(input) {
    if (!isConsensusActionEvaluationProjection(input)) {
        throw new TypeError("Consensus refresh requires one exact action evaluation");
    }
    const prior = input.observationSnapshot;
    const ledger = input.edgeFulfillmentLedger;
    const rows = ledger.rows;
    if (!Array.isArray(rows) ||
        rows.length !== 1 ||
        !isRecord(rows[0]) ||
        !Array.isArray(rows[0].evidenceRefs) ||
        rows[0].evidenceRefs.length !== 1 ||
        !isRef(rows[0].evidenceRefs[0])) {
        throw new TypeError("Consensus refresh requires one admitted result identity");
    }
    const evaluationBasisRef = String(input.actionEvaluationBasisRef);
    const { snapshotRef: _snapshotRef, snapshotDigest: _snapshotDigest, ...priorBody } = prior;
    const body = {
        ...priorBody,
        constructionState: {
            actionEvaluationRef: String(input.actionEvaluationRef),
            actionEvaluationBasisRef: evaluationBasisRef,
            constructionIntentRef: String(input.constructionIntentRef),
            edgeClosureDecisionRef: String(input.edgeClosureDecision.decisionRef),
        },
        consensusResultRef: rows[0].evidenceRefs[0],
    };
    const snapshotDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        snapshotRef: `observation-snapshot://product/${snapshotDigest.slice("sha256:".length)}`,
        snapshotDigest,
    });
}
export function refreshConsensusGap(input) {
    if (!isConsensusObservationSnapshot(input) ||
        input.consensusResultRef === null) {
        throw new TypeError("Consensus gap refresh requires admitted result truth");
    }
    return evaluateConsensusGap(input);
}
export function refreshConsensusNextAction(input) {
    if (!isConsensusNextActionBasis(input)) {
        throw new TypeError("Consensus convergence requires one refreshed basis");
    }
    const frontier = input.runtimeFrontier;
    const observation = input.observationSnapshot;
    if (frontier.phase !== "post_evidence" ||
        observation.constructionState === null ||
        observation.consensusResultRef === null) {
        throw new TypeError("Consensus convergence requires post-evidence result truth");
    }
    const gap = input.gapProjection;
    const body = {
        kind: "next_action_projection",
        schemaVersion: "5.0.0",
        disposition: "converged",
        constructionIntentRef: observation.constructionState.constructionIntentRef,
        targetOutcomeRef: CONSENSUS_IDS.consensusTargetOutcomeRef,
        gapRef: gap.gapRef,
        edgeClosureDecisionRef: observation.constructionState.edgeClosureDecisionRef,
        nextActionBasisRef: input.basisRef,
        nextActionBasisDigest: input.basisDigest,
        targetObligationBindings: [obligationBinding("fulfilled", [])],
        priorityProjection: priorityProjection([]),
        lawfulBasisRefs: [
            observation.constructionState.constructionIntentRef,
            observation.constructionState.edgeClosureDecisionRef,
            gap.gapRef,
        ],
    };
    const projectionDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        projectionRef: `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
function isDigest(value) {
    return typeof value === "string" && /^sha256:[0-9a-f]{64}$/u.test(value);
}
function uniqueRefs(value, allowEmpty = true) {
    return Array.isArray(value) &&
        (allowEmpty || value.length > 0) &&
        value.every(isRef) &&
        new Set(value).size === value.length;
}
export function constructConsensusSubjectMaterialization(input) {
    const contentDigest = sha256Bytes(input.content);
    const materialization = deepFreeze({
        kind: "consensus_subject_materialization",
        schemaVersion: "5.0.0",
        materializationRef: `subject-materialization://abg/${contentDigest.slice("sha256:".length)}`,
        subjectContractRef: input.subjectContractRef,
        subjectRef: input.subjectRef,
        contentDigest,
        mediaType: "text/markdown; charset=utf-8",
        content: input.content,
    });
    if (!isConsensusSubjectMaterialization(materialization)) {
        throw new TypeError("Consensus subject materialization requires exact UTF-8 content");
    }
    return materialization;
}
export function constructConsensusRoleInstruction(input) {
    const kind = input.role === "reviewer"
        ? "consensus_reviewer_instruction"
        : "consensus_submitter_instruction";
    const body = {
        kind,
        schemaVersion: "5.0.0",
        instructionContractRef: input.value.instructionContractRef,
        roleContractRef: input.value.roleContractRef,
        instructionText: input.value.instructionText,
        responseSchema: input.value.responseSchema,
    };
    const instruction = deepFreeze({
        ...body,
        instructionDigest: sha256Canonical(body),
    });
    if (!isConsensusRoleInstruction(input.role, instruction)) {
        throw new TypeError(`Consensus ${input.role} instruction requires one exact body and response schema`);
    }
    return instruction;
}
export function constructConsensusReviewerInstruction(input) {
    return constructConsensusRoleInstruction({
        role: "reviewer",
        value: input,
    });
}
export function constructConsensusSubmitterInstruction(input) {
    return constructConsensusRoleInstruction({
        role: "submitter",
        value: input,
    });
}
export function constructConsensusRoleProfile(input) {
    const kind = input.role === "reviewer"
        ? "consensus_reviewer_profile"
        : "consensus_submitter_profile";
    const body = {
        kind,
        schemaVersion: "5.0.0",
        profileRef: input.value.profileRef,
        roleContractRef: input.value.roleContractRef,
        instructionContractRef: input.value.instructionContractRef,
        instructionDigest: input.value.instructionDigest,
        resultContractRef: input.value.resultContractRef,
        capabilityRefs: [...input.value.capabilityRefs],
        actorRef: input.value.actorRef,
        workerBindingRef: input.value.workerBindingRef,
    };
    const profile = deepFreeze({
        ...body,
        configurationDigest: sha256Canonical(body),
    });
    if (!isConsensusRoleProfile(input.role, profile)) {
        throw new TypeError(`Consensus ${input.role} profile is incomplete`);
    }
    return profile;
}
export function constructConsensusReviewerProfile(input) {
    return constructConsensusRoleProfile({
        role: "reviewer",
        value: input,
    });
}
export function constructConsensusSubmitterProfile(input) {
    return constructConsensusRoleProfile({
        role: "submitter",
        value: input,
    });
}
export function constructConsensusPanel(panelRef, profiles) {
    const body = {
        kind: "consensus_panel",
        schemaVersion: "5.0.0",
        panelRef,
        profiles: [...profiles],
    };
    const panel = deepFreeze({
        ...body,
        panelDigest: sha256Canonical(body),
    });
    if (!isConsensusPanel(panel)) {
        throw new TypeError("Consensus panel requires one non-empty vector of unique exact reviewer profiles");
    }
    return panel;
}
export function constructConsensusRulingOverlay(input) {
    const body = {
        kind: "consensus_ruling_overlay",
        schemaVersion: "5.0.0",
        overlayRef: input.overlayRef,
        programRef: input.programRef,
        graphFunctionRef: input.graphFunctionRef,
        policyContractRef: input.policyContractRef,
        disagreementRuleRef: input.disagreementRuleRef,
        acceptedFindingRulingKind: input.acceptedFindingRulingKind,
    };
    const overlay = deepFreeze({
        ...body,
        overlayDigest: sha256Canonical(body),
    });
    if (!isConsensusRulingOverlay(overlay)) {
        throw new TypeError("Consensus ruling overlay requires one exact non-deferment ruling");
    }
    return overlay;
}
export function constructConsensusRoundPolicy(input) {
    const body = {
        kind: "consensus_round_policy",
        schemaVersion: "5.0.0",
        policyRef: input.policyRef,
        roundBudget: input.roundBudget,
        convergenceRuleRef: input.convergenceRuleRef,
        disagreementRuleRef: input.disagreementRuleRef,
        rulingOverlay: input.rulingOverlay,
        escalationRuleRef: input.escalationRuleRef,
        foldbackContractRef: input.foldbackContractRef,
    };
    const policy = deepFreeze({
        ...body,
        policyDigest: sha256Canonical(body),
    });
    if (!isConsensusRoundPolicy(policy)) {
        throw new TypeError("Consensus round policy requires one positive bounded budget and exact rules");
    }
    return policy;
}
export function consensusCatalogApplicationBindings(invocation) {
    if (!isConsensusInvocation(invocation)) {
        throw new TypeError("Consensus catalog bindings require one exact invocation");
    }
    const bind = (handle, valueRef, value, applicationVariant = "node_type") => deepFreeze({
        handle,
        applicationVariant,
        valueRef,
        valueDigest: sha256Canonical(value),
        value,
        nodeTypeTarget: applicationVariant === "node_type"
            ? {
                kind: "program",
                programRef: CONSENSUS_IDS.oneSurfaceProgramRef,
            }
            : null,
    });
    const bindings = [
        bind(CONSENSUS_IDS.subjectCatalogHandle, invocation.subject.subjectRef, invocation.subject),
        ...invocation.panel.profiles.map((profile) => bind(CONSENSUS_IDS.reviewerProfileCatalogHandle, profile.profileRef, profile)),
        ...invocation.instructions.map((instruction) => bind(CONSENSUS_IDS.reviewerInstructionCatalogHandle, instruction.instructionContractRef, instruction)),
        bind(CONSENSUS_IDS.submitterProfileCatalogHandle, invocation.submitterProfile.profileRef, invocation.submitterProfile),
        bind(CONSENSUS_IDS.submitterInstructionCatalogHandle, invocation.submitterInstruction.instructionContractRef, invocation.submitterInstruction),
        bind(CONSENSUS_IDS.policyCatalogHandle, invocation.policy.policyRef, invocation.policy),
    ];
    if (invocation.policy.rulingOverlay !== null) {
        bindings.push(bind(CONSENSUS_IDS.rulingOverlayCatalogHandle, invocation.policy.rulingOverlay.overlayRef, invocation.policy.rulingOverlay, "overlay"));
    }
    return deepFreeze(bindings);
}
export function constructConsensusSubject(input) {
    const subject = deepFreeze({
        kind: "consensus_subject",
        schemaVersion: "5.0.0",
        ...input,
    });
    if (!isConsensusSubject(subject)) {
        throw new TypeError("Consensus subject requires one exact immutable identity");
    }
    return subject;
}
export function constructConsensusInvocation(input) {
    const invocation = deepFreeze({
        kind: "consensus_invocation",
        schemaVersion: "5.0.0",
        ...input,
        instructions: [...input.instructions],
    });
    if (!isConsensusInvocation(invocation)) {
        throw new TypeError("Consensus invocation requires one matching subject, panel, and policy");
    }
    return invocation;
}
export function isConsensusSubject(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubject))
        return false;
    return value.kind === "consensus_subject" &&
        value.schemaVersion === "5.0.0" &&
        isRef(value.subjectContractRef) &&
        isRef(value.subjectRef) &&
        isDigest(value.subjectDigest) &&
        isRef(value.submittingActorRef) &&
        isRef(value.panelRef) &&
        isRef(value.roundPolicyRef) &&
        isRef(value.workspaceRef) &&
        ((value.ticketRef === null && value.ticketDigest === null) ||
            (isRef(value.ticketRef) &&
                isDigest(value.ticketDigest) &&
                value.ticketRef === value.subjectRef &&
                value.ticketDigest === value.subjectDigest));
}
export function isConsensusSubjectMaterialization(value) {
    return isRecord(value) &&
        hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubjectMaterialization) &&
        value.kind === "consensus_subject_materialization" &&
        value.schemaVersion === "5.0.0" &&
        isRef(value.subjectContractRef) &&
        isRef(value.subjectRef) &&
        typeof value.content === "string" &&
        value.content.length > 0 &&
        value.mediaType === "text/markdown; charset=utf-8" &&
        value.contentDigest === sha256Bytes(value.content) &&
        value.materializationRef ===
            `subject-materialization://abg/${value.contentDigest.slice("sha256:".length)}`;
}
export function isConsensusRoleInstruction(role, value) {
    const reviewer = role === "reviewer";
    const requiredKeys = reviewer
        ? CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusReviewerInstruction
        : CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubmitterInstruction;
    const expectedKind = reviewer
        ? "consensus_reviewer_instruction"
        : "consensus_submitter_instruction";
    const expectedSchema = reviewer
        ? CONSENSUS_REVIEWER_RESPONSE_SCHEMA
        : CONSENSUS_SUBMITTER_RESPONSE_SCHEMA;
    if (!isRecord(value) ||
        !hasExactKeys(value, requiredKeys) ||
        value.kind !== expectedKind ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.instructionContractRef) ||
        !isRef(value.roleContractRef) ||
        !isDigest(value.instructionDigest) ||
        typeof value.instructionText !== "string" ||
        value.instructionText.length === 0 ||
        !isRecord(value.responseSchema) ||
        sha256Canonical(value.responseSchema) !==
            sha256Canonical(expectedSchema))
        return false;
    const { instructionDigest: _instructionDigest, ...body } = value;
    return value.instructionDigest ===
        sha256Canonical(body);
}
export function isConsensusReviewerInstruction(value) {
    return isConsensusRoleInstruction("reviewer", value);
}
export function isConsensusSubmitterInstruction(value) {
    return isConsensusRoleInstruction("submitter", value);
}
function isConsensusInstructionSet(value, panel) {
    if (!Array.isArray(value) ||
        value.length < 1 ||
        value.length > panel.profiles.length ||
        !value.every(isConsensusReviewerInstruction))
        return false;
    const instructions = value;
    return (new Set(instructions.map((instruction) => `${instruction.instructionContractRef}\0${instruction.roleContractRef}`)).size === instructions.length &&
        instructions.every((instruction) => panel.profiles.some((profile) => instruction.instructionContractRef ===
            profile.instructionContractRef &&
            instruction.instructionDigest === profile.instructionDigest &&
            instruction.roleContractRef === profile.roleContractRef)) &&
        panel.profiles.every((profile) => instructions.some((instruction) => instruction.instructionContractRef ===
            profile.instructionContractRef &&
            instruction.instructionDigest === profile.instructionDigest &&
            instruction.roleContractRef === profile.roleContractRef)));
}
export function isConsensusRoleProfile(role, value) {
    const reviewer = role === "reviewer";
    const requiredKeys = reviewer
        ? CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusReviewerProfile
        : CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubmitterProfile;
    const expectedKind = reviewer
        ? "consensus_reviewer_profile"
        : "consensus_submitter_profile";
    const expectedResultContractRef = reviewer
        ? CONSENSUS_IDS.findingsContractRef
        : CONSENSUS_IDS.submitterResponseContractRef;
    if (!isRecord(value) ||
        !hasExactKeys(value, requiredKeys))
        return false;
    const { configurationDigest, ...configuration } = value;
    return value.kind === expectedKind &&
        value.schemaVersion === "5.0.0" &&
        isRef(value.profileRef) &&
        isRef(value.roleContractRef) &&
        isDigest(configurationDigest) &&
        configurationDigest ===
            sha256Canonical(configuration) &&
        isRef(value.instructionContractRef) &&
        isDigest(value.instructionDigest) &&
        value.resultContractRef === expectedResultContractRef &&
        uniqueRefs(value.capabilityRefs) &&
        isRef(value.actorRef) &&
        isRef(value.workerBindingRef);
}
export function isConsensusReviewerProfile(value) {
    return isConsensusRoleProfile("reviewer", value);
}
export function isConsensusSubmitterProfile(value) {
    return isConsensusRoleProfile("submitter", value);
}
export function isConsensusPanel(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusPanel) ||
        value.kind !== "consensus_panel" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.panelRef) ||
        !isDigest(value.panelDigest) ||
        !Array.isArray(value.profiles) ||
        value.profiles.length < 1 ||
        !value.profiles.every(isConsensusReviewerProfile))
        return false;
    if (new Set(value.profiles.map((profile) => profile.profileRef)).size !==
        value.profiles.length)
        return false;
    const { panelDigest: _panelDigest, ...body } = value;
    return value.panelDigest ===
        sha256Canonical(body);
}
export function isConsensusRulingOverlay(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusRulingOverlay) ||
        value.kind !== "consensus_ruling_overlay" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.overlayRef) ||
        !isDigest(value.overlayDigest) ||
        value.programRef !== CONSENSUS_IDS.oneSurfaceProgramRef ||
        value.graphFunctionRef !==
            CONSENSUS_IDS.roundReducerGraphFunctionRef ||
        value.policyContractRef !== CONSENSUS_IDS.policyContractRef ||
        value.disagreementRuleRef !== CONSENSUS_IDS.disagreementRuleRef ||
        !REVIEW_RULING_KIND_VALUES.includes(value.acceptedFindingRulingKind) ||
        value.acceptedFindingRulingKind === "deferment")
        return false;
    const { overlayDigest: _overlayDigest, ...body } = value;
    return value.overlayDigest ===
        sha256Canonical(body);
}
export function isConsensusRoundPolicy(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusRoundPolicy) ||
        value.kind !== "consensus_round_policy" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.policyRef) ||
        !isDigest(value.policyDigest) ||
        !Number.isSafeInteger(value.roundBudget) ||
        Number(value.roundBudget) < 1 ||
        value.convergenceRuleRef !== CONSENSUS_IDS.convergenceRuleRef ||
        value.disagreementRuleRef !== CONSENSUS_IDS.disagreementRuleRef ||
        (value.rulingOverlay !== null &&
            !isConsensusRulingOverlay(value.rulingOverlay)) ||
        value.escalationRuleRef !== CONSENSUS_IDS.escalationRuleRef ||
        value.foldbackContractRef !== CONSENSUS_IDS.foldbackContractRef)
        return false;
    const { policyDigest: _policyDigest, ...body } = value;
    return value.policyDigest ===
        sha256Canonical(body);
}
export function isConsensusInvocation(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "kind",
            "schemaVersion",
            "invocationRef",
            "subject",
            "subjectMaterialization",
            "panel",
            "instructions",
            "submitterProfile",
            "submitterInstruction",
            "policy",
            "transportLane",
        ]) &&
        value.kind === "consensus_invocation" &&
        value.schemaVersion === "5.0.0" &&
        isRef(value.invocationRef) &&
        isConsensusSubject(value.subject) &&
        isConsensusSubjectMaterialization(value.subjectMaterialization) &&
        value.subjectMaterialization.subjectContractRef ===
            value.subject.subjectContractRef &&
        value.subjectMaterialization.subjectRef === value.subject.subjectRef &&
        value.subjectMaterialization.contentDigest === value.subject.subjectDigest &&
        (value.subject.ticketDigest === null ||
            value.subject.ticketDigest === value.subjectMaterialization.contentDigest) &&
        isConsensusPanel(value.panel) &&
        isConsensusInstructionSet(value.instructions, value.panel) &&
        isConsensusSubmitterProfile(value.submitterProfile) &&
        isConsensusSubmitterInstruction(value.submitterInstruction) &&
        value.submitterProfile.actorRef === value.subject.submittingActorRef &&
        value.submitterInstruction.instructionContractRef ===
            value.submitterProfile.instructionContractRef &&
        value.submitterInstruction.instructionDigest ===
            value.submitterProfile.instructionDigest &&
        value.submitterInstruction.roleContractRef ===
            value.submitterProfile.roleContractRef &&
        isConsensusRoundPolicy(value.policy) &&
        value.subject.panelRef === value.panel.panelRef &&
        value.subject.roundPolicyRef === value.policy.policyRef &&
        ["closed_prompt_proof", "worker_executes"].includes(String(value.transportLane));
}
function validateConsensusReviewerTask(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusReviewerTask) ||
        value.kind !== "consensus_reviewer_task" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.taskRef) ||
        !isDigest(value.taskDigest) ||
        !isRef(value.invocationRef) ||
        !isRef(value.roundRef) ||
        !Number.isSafeInteger(value.roundOrdinal) ||
        Number(value.roundOrdinal) < 1 ||
        !Number.isSafeInteger(value.panelPosition) ||
        Number(value.panelPosition) < 0 ||
        !isConsensusSubject(value.subject) ||
        !isConsensusSubjectMaterialization(value.subjectMaterialization) ||
        !isConsensusPanel(value.panel) ||
        !isConsensusRoundPolicy(value.policy) ||
        !isConsensusReviewerProfile(value.profile) ||
        !isConsensusReviewerInstruction(value.instruction) ||
        !isConsensusSubmitterProfile(value.submitterProfile) ||
        !isConsensusSubmitterInstruction(value.submitterInstruction) ||
        !uniqueRefs(value.priorRoundRefs) ||
        !uniqueRefs(value.priorFindingSetRefs) ||
        !Array.isArray(value.priorRulings) ||
        !value.priorRulings.every(isReviewRuling) ||
        !uniqueRefs(value.priorDissentProfileRefs) ||
        !Array.isArray(value.priorSubmitterResponses) ||
        !value.priorSubmitterResponses.every(isConsensusSubmitterResponseRecord) ||
        !uniqueRefs(value.priorEvidenceRefs) ||
        !["closed_prompt_proof", "worker_executes"].includes(String(value.transportLane)))
        return false;
    const task = value;
    const { taskRef: _taskRef, taskDigest: _taskDigest, ...taskBody } = task;
    const expectedTaskDigest = sha256Canonical(taskBody);
    const panelProfile = task.panel.profiles.find((profile) => profile.profileRef === task.profile.profileRef);
    return task.taskDigest === expectedTaskDigest &&
        task.taskRef ===
            `consensus-reviewer-task://abg/${expectedTaskDigest.slice("sha256:".length)}` &&
        task.panel.profiles[task.panelPosition]?.profileRef ===
            task.profile.profileRef &&
        task.subjectMaterialization.subjectContractRef ===
            task.subject.subjectContractRef &&
        task.subjectMaterialization.subjectRef === task.subject.subjectRef &&
        task.subjectMaterialization.contentDigest === task.subject.subjectDigest &&
        task.subject.panelRef === task.panel.panelRef &&
        panelProfile !== undefined &&
        sha256Canonical(panelProfile) ===
            sha256Canonical(task.profile) &&
        task.subject.roundPolicyRef === task.policy.policyRef &&
        task.instruction.instructionContractRef ===
            task.profile.instructionContractRef &&
        task.instruction.instructionDigest === task.profile.instructionDigest &&
        task.instruction.roleContractRef === task.profile.roleContractRef &&
        task.submitterProfile.actorRef === task.subject.submittingActorRef &&
        task.submitterInstruction.instructionContractRef ===
            task.submitterProfile.instructionContractRef &&
        task.submitterInstruction.instructionDigest ===
            task.submitterProfile.instructionDigest &&
        task.submitterInstruction.roleContractRef ===
            task.submitterProfile.roleContractRef &&
        task.priorRoundRefs.length === task.roundOrdinal - 1 &&
        task.priorSubmitterResponses.length === task.roundOrdinal - 1 &&
        task.priorSubmitterResponses.every((response, index) => response.roundOrdinal === index + 1 &&
            response.roundRef === task.priorRoundRefs[index] &&
            response.submittingActorRef === task.subject.submittingActorRef);
}
function isReviewFinding(value) {
    return isRecord(value) &&
        hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ReviewFinding) &&
        isRef(value.findingRef) &&
        isRef(value.findingContractRef) &&
        isRef(value.findingPayloadRef) &&
        uniqueRefs(value.evidenceRefs);
}
export function isReviewFindings(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ReviewFindings) ||
        value.kind !== "review_findings" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.reviewerTaskRef) ||
        !isDigest(value.reviewerTaskDigest) ||
        !isRef(value.panelRef) ||
        !Number.isSafeInteger(value.panelPosition) ||
        Number(value.panelPosition) < 0 ||
        !isRef(value.cCallRef) ||
        !Number.isSafeInteger(value.cCallAttempt) ||
        Number(value.cCallAttempt) < 1 ||
        !isRef(value.profileRef) ||
        !isDigest(value.configurationDigest) ||
        !isRef(value.invocationRef) ||
        !isRef(value.roundRef) ||
        !Number.isSafeInteger(value.roundOrdinal) ||
        !["accept", "revise"].includes(String(value.recommendation)) ||
        !isDigest(value.outputDigest) ||
        !uniqueRefs(value.evidenceRefs) ||
        !Array.isArray(value.findings) ||
        !value.findings.every(isReviewFinding) ||
        !uniqueRefs(value.residualRefs) ||
        !(value.refusalRef === null || isRef(value.refusalRef)) ||
        !isConsensusReviewerTask(value.task))
        return false;
    if (value.reviewerTaskRef !== value.task.taskRef ||
        value.reviewerTaskDigest !== value.task.taskDigest ||
        value.panelRef !== value.task.panel.panelRef ||
        value.panelPosition !== value.task.panelPosition ||
        value.profileRef !== value.task.profile.profileRef ||
        value.configurationDigest !== value.task.profile.configurationDigest ||
        value.invocationRef !== value.task.invocationRef ||
        value.roundRef !== value.task.roundRef ||
        value.roundOrdinal !== value.task.roundOrdinal)
        return false;
    if (value.refusalRef === null) {
        if ((value.recommendation === "accept" && value.findings.length !== 0) ||
            (value.recommendation === "revise" && value.findings.length === 0))
            return false;
    }
    else if (value.recommendation !== "revise" ||
        value.findings.length !== 0 ||
        value.residualRefs.length === 0)
        return false;
    const { outputDigest: _outputDigest, ...body } = value;
    return value.outputDigest === sha256Canonical(body);
}
export function isReviewRuling(value) {
    return isRecord(value) &&
        hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ReviewRuling) &&
        isRef(value.rulingRef) &&
        REVIEW_RULING_KIND_VALUES.includes(value.rulingKind) &&
        uniqueRefs(value.findingRefs) &&
        isRef(value.rationaleRef) &&
        isRef(value.payloadRef);
}
export function isReviewRulings(value) {
    return Array.isArray(value) && value.every(isReviewRuling);
}
export function isConsensusRoundOutcome(value) {
    return isRecord(value) &&
        hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusRoundOutcome) &&
        value.kind === "consensus_round_outcome" &&
        value.schemaVersion === "5.0.0" &&
        isRef(value.roundRef) &&
        CONSENSUS_ROUND_OUTCOME_VALUES.includes(value.outcome) &&
        uniqueRefs(value.findingSetRefs) &&
        uniqueRefs(value.rulingRefs) &&
        uniqueRefs(value.evidenceRefs);
}
export function isConsensusRoundState(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "schemaVersion",
            "invocationRef",
            "subject",
            "subjectMaterialization",
            "panel",
            "instructions",
            "submitterProfile",
            "submitterInstruction",
            "policy",
            "transportLane",
            "roundOrdinal",
            "roundRefs",
            "findingSetRefs",
            "findingSets",
            "submitterResponses",
            "rulings",
            "dissentProfileRefs",
            "evidenceRefs",
            "terminalOutcome",
            "terminal",
            "members",
        ]) ||
        value.kind !== "consensus_round_state" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.invocationRef) ||
        !isConsensusSubject(value.subject) ||
        !isConsensusSubjectMaterialization(value.subjectMaterialization) ||
        !isConsensusPanel(value.panel) ||
        !isConsensusInstructionSet(value.instructions, value.panel) ||
        !isConsensusSubmitterProfile(value.submitterProfile) ||
        !isConsensusSubmitterInstruction(value.submitterInstruction) ||
        !isConsensusRoundPolicy(value.policy) ||
        !["closed_prompt_proof", "worker_executes"].includes(String(value.transportLane)) ||
        !Number.isSafeInteger(value.roundOrdinal) ||
        Number(value.roundOrdinal) < 1 ||
        !uniqueRefs(value.roundRefs) ||
        !uniqueRefs(value.findingSetRefs) ||
        !Array.isArray(value.findingSets) ||
        !value.findingSets.every(isReviewFindings) ||
        !Array.isArray(value.submitterResponses) ||
        !value.submitterResponses.every(isConsensusSubmitterResponseRecord) ||
        !Array.isArray(value.rulings) ||
        !value.rulings.every(isReviewRuling) ||
        !uniqueRefs(value.dissentProfileRefs) ||
        !uniqueRefs(value.evidenceRefs) ||
        !(value.terminalOutcome === null ||
            isConsensusRoundOutcome(value.terminalOutcome)) ||
        typeof value.terminal !== "boolean" ||
        !Array.isArray(value.members))
        return false;
    const state = value;
    return state.subjectMaterialization.subjectRef === state.subject.subjectRef &&
        state.subjectMaterialization.subjectContractRef ===
            state.subject.subjectContractRef &&
        state.subjectMaterialization.contentDigest === state.subject.subjectDigest &&
        state.submitterProfile.actorRef === state.subject.submittingActorRef &&
        state.submitterInstruction.instructionContractRef ===
            state.submitterProfile.instructionContractRef &&
        state.submitterInstruction.instructionDigest ===
            state.submitterProfile.instructionDigest &&
        state.submitterInstruction.roleContractRef ===
            state.submitterProfile.roleContractRef &&
        state.subject.panelRef === state.panel.panelRef &&
        state.subject.roundPolicyRef === state.policy.policyRef &&
        state.submitterResponses.length === state.roundRefs.length &&
        state.submitterResponses.every((response, index) => response.invocationRef === state.invocationRef &&
            response.roundRef === state.roundRefs[index] &&
            response.roundOrdinal === index + 1 &&
            response.submittingActorRef === state.subject.submittingActorRef &&
            response.profileRef === state.submitterProfile.profileRef) &&
        state.terminal === (state.terminalOutcome !== null) &&
        (state.terminal
            ? state.members.length === 0
            : state.members.length === state.panel.profiles.length) &&
        state.members.every((member, ordinal) => isRecord(member) &&
            hasExactKeys(member, ["ordinal", "memberRef", "value"]) &&
            member.ordinal === ordinal &&
            isRef(member.memberRef) &&
            isConsensusReviewerTask(member.value) &&
            member.memberRef === member.value.taskRef &&
            member.value.panelPosition === ordinal &&
            member.value.profile.profileRef ===
                state.panel.profiles[ordinal]?.profileRef &&
            member.value.subjectMaterialization.materializationRef ===
                state.subjectMaterialization.materializationRef &&
            member.value.roundOrdinal === state.roundOrdinal);
}
function consensusReviewerRoundBasisDigest(task) {
    return sha256Canonical({
        invocationRef: task.invocationRef,
        roundRef: task.roundRef,
        roundOrdinal: task.roundOrdinal,
        subject: task.subject,
        subjectMaterialization: task.subjectMaterialization,
        panel: task.panel,
        policy: task.policy,
        submitterProfile: task.submitterProfile,
        submitterInstruction: task.submitterInstruction,
        priorRoundRefs: task.priorRoundRefs,
        priorFindingSetRefs: task.priorFindingSetRefs,
        priorRulings: task.priorRulings,
        priorDissentProfileRefs: task.priorDissentProfileRefs,
        priorSubmitterResponses: task.priorSubmitterResponses,
        priorEvidenceRefs: task.priorEvidenceRefs,
        transportLane: task.transportLane,
    });
}
export function isConsensusFindingsVector(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "schemaVersion",
            "applicationRef",
            "members",
        ]) ||
        value.kind !== "gtl_fan_out_vector" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.applicationRef) ||
        !Array.isArray(value.members) ||
        value.members.length < 1 ||
        !value.members.every((member, ordinal) => isRecord(member) &&
            hasExactKeys(member, [
                "ordinal",
                "inputMemberRef",
                "outputMemberRef",
                "value",
            ]) &&
            member.ordinal === ordinal &&
            isRef(member.inputMemberRef) &&
            isRef(member.outputMemberRef) &&
            isReviewFindings(member.value)))
        return false;
    const vector = value;
    const firstTask = vector.members[0].value.task;
    const panel = firstTask.panel;
    const roundBasisDigest = consensusReviewerRoundBasisDigest(firstTask);
    return vector.members.length === panel.profiles.length &&
        new Set(vector.members.map((member) => member.value.cCallRef)).size === vector.members.length &&
        vector.members.every((member, ordinal) => {
            const task = member.value.task;
            const expectedProfile = panel.profiles[ordinal];
            return expectedProfile !== undefined &&
                member.inputMemberRef === task.taskRef &&
                member.value.reviewerTaskRef === task.taskRef &&
                member.value.reviewerTaskDigest === task.taskDigest &&
                member.value.panelRef === panel.panelRef &&
                member.value.panelPosition === ordinal &&
                sha256Canonical(task.panel) ===
                    sha256Canonical(panel) &&
                sha256Canonical(task.profile) ===
                    sha256Canonical(expectedProfile) &&
                consensusReviewerRoundBasisDigest(task) === roundBasisDigest;
        });
}
function submitterResponseRecordBody(value) {
    const { outputDigest: _outputDigest, responseRef: _responseRef, ...body } = value;
    return body;
}
export function isConsensusSubmitterResponseRecord(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubmitterResponseRecord) ||
        !isRef(value.invocationRef) ||
        !isRef(value.responseRef) ||
        !isDigest(value.outputDigest) ||
        !isDigest(value.findingsVectorDigest) ||
        !isRef(value.roundRef) ||
        !Number.isSafeInteger(value.roundOrdinal) ||
        Number(value.roundOrdinal) < 1 ||
        !isRef(value.submittingActorRef) ||
        !isRef(value.profileRef) ||
        ![
            "acknowledge",
            "address_findings",
            "dispute_findings",
        ].includes(String(value.disposition)) ||
        typeof value.responseText !== "string" ||
        value.responseText.length === 0 ||
        !uniqueRefs(value.addressedFindingRefs) ||
        !uniqueRefs(value.residualFindingRefs) ||
        !uniqueRefs(value.evidenceRefs))
        return false;
    const body = submitterResponseRecordBody(value);
    const outputDigest = sha256Canonical(body);
    return value.outputDigest === outputDigest &&
        value.responseRef ===
            `submitter-response://abg/${outputDigest.slice("sha256:".length)}`;
}
function validateConsensusSubmitterTask(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubmitterTask) ||
        value.kind !== "consensus_submitter_task" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.invocationRef) ||
        !isRef(value.roundRef) ||
        !Number.isSafeInteger(value.roundOrdinal) ||
        Number(value.roundOrdinal) < 1 ||
        !isConsensusSubject(value.subject) ||
        !isConsensusSubjectMaterialization(value.subjectMaterialization) ||
        value.subjectMaterialization.subjectContractRef !==
            value.subject.subjectContractRef ||
        value.subjectMaterialization.subjectRef !== value.subject.subjectRef ||
        value.subjectMaterialization.contentDigest !== value.subject.subjectDigest ||
        !isConsensusPanel(value.panel) ||
        value.subject.panelRef !== value.panel.panelRef ||
        !isConsensusRoundPolicy(value.policy) ||
        value.subject.roundPolicyRef !== value.policy.policyRef ||
        !isConsensusSubmitterProfile(value.profile) ||
        value.profile.actorRef !== value.subject.submittingActorRef ||
        !isConsensusSubmitterInstruction(value.instruction) ||
        value.instruction.instructionContractRef !==
            value.profile.instructionContractRef ||
        value.instruction.instructionDigest !== value.profile.instructionDigest ||
        value.instruction.roleContractRef !== value.profile.roleContractRef ||
        !isConsensusFindingsVector(value.findingsVector) ||
        value.findingsVector.members.some((member) => member.value.invocationRef !== value.invocationRef ||
            member.value.roundRef !== value.roundRef ||
            member.value.roundOrdinal !== value.roundOrdinal) ||
        !uniqueRefs(value.priorRoundRefs) ||
        !uniqueRefs(value.priorSubmitterResponseRefs) ||
        !uniqueRefs(value.priorEvidenceRefs) ||
        !["closed_prompt_proof", "worker_executes"].includes(String(value.transportLane)))
        return false;
    const task = value;
    return task.priorRoundRefs.length === task.roundOrdinal - 1 &&
        task.priorSubmitterResponseRefs.length === task.roundOrdinal - 1 &&
        sha256Canonical(task.findingsVector.members[0].value.task.panel) ===
            sha256Canonical(task.panel) &&
        task.findingsVector.members[0]?.value.task.priorRoundRefs
            .every((ref, index) => ref === task.priorRoundRefs[index]) === true &&
        task.findingsVector.members[0]?.value.task.priorSubmitterResponses
            .every((response, index) => response.responseRef === task.priorSubmitterResponseRefs[index]) === true;
}
export function isConsensusRoleTask(role, value) {
    return role === "reviewer"
        ? validateConsensusReviewerTask(value)
        : validateConsensusSubmitterTask(value);
}
export function isConsensusReviewerTask(value) {
    return isConsensusRoleTask("reviewer", value);
}
export function isConsensusSubmitterTask(value) {
    return isConsensusRoleTask("submitter", value);
}
export function isConsensusSubmitterResponse(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusSubmitterResponse) ||
        value.kind !== "consensus_submitter_response" ||
        value.schemaVersion !== "5.0.0" ||
        !isConsensusSubmitterTask(value.task) ||
        !isDigest(value.configurationDigest) ||
        value.configurationDigest !== value.task.profile.configurationDigest)
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, configurationDigest: _configurationDigest, task: _task, ...record } = value;
    if (!isConsensusSubmitterResponseRecord(record))
        return false;
    if (value.invocationRef !== value.task.invocationRef ||
        value.roundRef !== value.task.roundRef ||
        value.roundOrdinal !== value.task.roundOrdinal ||
        value.submittingActorRef !== value.task.subject.submittingActorRef ||
        value.submittingActorRef !== value.task.profile.actorRef ||
        value.profileRef !== value.task.profile.profileRef ||
        value.findingsVectorDigest !==
            sha256Canonical(value.task.findingsVector))
        return false;
    const findingRefs = value.task.findingsVector.members.flatMap((member) => member.value.findings.map((finding) => finding.findingRef));
    const response = value;
    const addressed = new Set(response.addressedFindingRefs);
    const residual = new Set(response.residualFindingRefs);
    if ([...addressed].some((ref) => residual.has(ref)) ||
        [...addressed, ...residual].some((ref) => !findingRefs.includes(ref)) ||
        new Set([...addressed, ...residual]).size !== new Set(findingRefs).size)
        return false;
    if (findingRefs.length === 0) {
        return response.disposition === "acknowledge" &&
            addressed.size === 0 &&
            residual.size === 0;
    }
    if (response.disposition === "address_findings") {
        return addressed.size === new Set(findingRefs).size && residual.size === 0;
    }
    return response.disposition === "dispute_findings" && residual.size > 0;
}
export function isConsensusRoleOccurrence(role, value) {
    return role === "reviewer"
        ? isReviewFindings(value)
        : isConsensusSubmitterResponse(value);
}
export function isConsensusResultCandidate(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusResultCandidate) ||
        value.kind !== "consensus_result_candidate" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.subjectRef) ||
        !isDigest(value.subjectDigest) ||
        !isRef(value.panelRef) ||
        !isRef(value.policyRef) ||
        !uniqueRefs(value.roundRefs, false) ||
        !uniqueRefs(value.findingSetRefs) ||
        !uniqueRefs(value.submitterResponseRefs) ||
        value.submitterResponseRefs.length !== value.roundRefs.length ||
        !Array.isArray(value.rulings) ||
        !value.rulings.every(isReviewRuling) ||
        !CONSENSUS_CLASSIFICATION_VALUES.includes(value.classification) ||
        !uniqueRefs(value.dissentProfileRefs) ||
        !isConsensusRoundOutcome(value.terminalOutcome) ||
        !uniqueRefs(value.evidenceRefs) ||
        !uniqueRefs(value.lineageRefs, false) ||
        !(value.contractFailureRef === null || isRef(value.contractFailureRef)))
        return false;
    return (value.classification === "contract_failure") ===
        (value.contractFailureRef !== null);
}
export function bindConsensusReplay(candidate, admittedResultRef, replayRef) {
    if (!isConsensusResultCandidate(candidate) ||
        !isRef(admittedResultRef) ||
        !isRef(replayRef)) {
        throw new TypeError("Consensus replay projection requires one admitted result identity and replay");
    }
    return deepFreeze({
        ...candidate,
        kind: "consensus_result",
        resultRef: admittedResultRef,
        replayRef,
    });
}
export function isConsensusResult(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusResult) ||
        value.kind !== "consensus_result" ||
        !isRef(value.resultRef) ||
        !isRef(value.replayRef))
        return false;
    const { resultRef: _resultRef, replayRef: _replayRef, ...candidateBody } = value;
    const candidate = {
        ...candidateBody,
        kind: "consensus_result_candidate",
    };
    return isConsensusResultCandidate(candidate);
}
function constructConsensusRoundDecision(result) {
    if (!isConsensusResultCandidate(result)) {
        throw new TypeError("Consensus round decision requires one exact result candidate");
    }
    const body = {
        kind: "consensus_resolution",
        resolutionKind: "round_decision",
        schemaVersion: "5.0.0",
        outcome: result.terminalOutcome,
        result,
        resolutionTerminal: result.terminalOutcome.outcome !== "escalate_fh",
    };
    const decisionDigest = sha256Canonical(body);
    const decision = deepFreeze({
        ...body,
        decisionRef: `consensus-round-decision://abg/${decisionDigest.slice("sha256:".length)}`,
        decisionDigest,
    });
    if (!isConsensusRoundDecision(decision)) {
        throw new TypeError("Consensus round decision must preserve one total historical outcome");
    }
    return decision;
}
export function isConsensusRoundDecision(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusRoundDecision) ||
        value.kind !== "consensus_resolution" ||
        value.resolutionKind !== "round_decision" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.decisionRef) ||
        !isDigest(value.decisionDigest) ||
        !isConsensusRoundOutcome(value.outcome) ||
        !isConsensusResultCandidate(value.result) ||
        typeof value.resolutionTerminal !== "boolean" ||
        sha256Canonical(value.outcome) !==
            sha256Canonical(value.result.terminalOutcome) ||
        value.resolutionTerminal !==
            (value.outcome.outcome !== "escalate_fh"))
        return false;
    const { decisionRef: _decisionRef, decisionDigest: _decisionDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.decisionDigest === digest &&
        value.decisionRef ===
            `consensus-round-decision://abg/${digest.slice("sha256:".length)}`;
}
export function isConsensusHumanFinalization(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusHumanFinalization) ||
        value.kind !== "consensus_resolution" ||
        value.resolutionKind !== "human_finalization" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.finalizationRef) ||
        !isDigest(value.finalizationDigest) ||
        !isConsensusRoundDecision(value.roundDecision) ||
        value.roundDecision.resolutionTerminal ||
        value.roundDecision.outcome.outcome !== "escalate_fh" ||
        !CONSENSUS_FH_DECISION_VALUES.includes(value.decision) ||
        !isRef(value.humanActorRef) ||
        !isRef(value.rationaleRef) ||
        !isConsensusResultCandidate(value.result) ||
        value.resolutionTerminal !== true ||
        sha256Canonical(value.result.terminalOutcome) !== sha256Canonical(value.roundDecision.outcome) ||
        value.result.contractFailureRef !== null ||
        value.result.classification !==
            (value.decision === "accept_with_dissent"
                ? "partial_agreement_with_dissent"
                : "unresolved_disagreement") ||
        !value.result.lineageRefs.includes(value.roundDecision.decisionRef))
        return false;
    const { finalizationRef: _finalizationRef, finalizationDigest: _finalizationDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.finalizationDigest === digest &&
        value.finalizationRef ===
            `consensus-human-finalization://abg/${digest.slice("sha256:".length)}`;
}
export function isConsensusResolution(value) {
    return isConsensusRoundDecision(value) ||
        isConsensusHumanFinalization(value);
}
export function isConsensusEscalationRequest(value) {
    return isConsensusRoundDecision(value) &&
        value.outcome.outcome === "escalate_fh" &&
        value.resolutionTerminal === false;
}
export function isConsensusEscalationDecision(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.ConsensusEscalationDecision) ||
        value.kind !== "consensus_escalation_decision" ||
        value.schemaVersion !== "5.0.0" ||
        !isConsensusEscalationRequest(value.roundDecision) ||
        !isRef(value.decisionRef) ||
        !isDigest(value.decisionDigest) ||
        !CONSENSUS_FH_DECISION_VALUES.includes(value.decision) ||
        !isRef(value.humanActorRef) ||
        !isRef(value.rationaleRef))
        return false;
    const { decisionRef: _decisionRef, decisionDigest: _decisionDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.decisionDigest === digest &&
        value.decisionRef ===
            `consensus-escalation-decision://abg/${digest.slice("sha256:".length)}`;
}
export function isTicketConsensusProjection(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, CONSENSUS_SCHEMA_REQUIRED_KEYS.TicketConsensusProjection) ||
        value.kind !== "ticket_consensus_projection" ||
        value.schemaVersion !== "5.0.0" ||
        !isRef(value.projectionRef) ||
        !isDigest(value.projectionDigest) ||
        !isRef(value.ticketRef) ||
        !isDigest(value.ticketDigest) ||
        value.subjectRef !== value.ticketRef ||
        value.subjectDigest !== value.ticketDigest ||
        !isRef(value.panelRef) ||
        !isRef(value.policyRef) ||
        !uniqueRefs(value.roundRefs, false) ||
        !uniqueRefs(value.findingSetRefs) ||
        !uniqueRefs(value.submitterResponseRefs) ||
        value.submitterResponseRefs.length !== value.roundRefs.length ||
        !Array.isArray(value.rulings) ||
        !value.rulings.every(isReviewRuling) ||
        !CONSENSUS_CLASSIFICATION_VALUES.includes(value.classification) ||
        !uniqueRefs(value.dissentProfileRefs) ||
        !isConsensusRoundOutcome(value.terminalOutcome) ||
        !uniqueRefs(value.evidenceRefs) ||
        !uniqueRefs(value.lineageRefs, false) ||
        !isRef(value.resultRef) ||
        !isRef(value.replayRef))
        return false;
    const { projectionRef: _projectionRef, projectionDigest: _projectionDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.projectionDigest === digest &&
        value.projectionRef ===
            `ticket-consensus-projection://abg/${digest.slice("sha256:".length)}`;
}
function roundRef(invocationRef, ordinal) {
    const digest = sha256Canonical({ invocationRef, ordinal });
    return `consensus-round://abg/${digest.slice("sha256:".length)}`;
}
function constructReviewerRoleTask(basis) {
    const { invocation, ordinal, panelPosition, profile, priorRoundRefs, priorFindingSetRefs, priorRulings, priorDissentProfileRefs, priorSubmitterResponses, priorEvidenceRefs, } = basis;
    const currentRoundRef = roundRef(invocation.invocationRef, ordinal);
    const instruction = invocation.instructions.find((candidate) => candidate.instructionContractRef === profile.instructionContractRef &&
        candidate.instructionDigest === profile.instructionDigest &&
        candidate.roleContractRef === profile.roleContractRef);
    if (instruction === undefined) {
        throw new TypeError("Consensus reviewer task requires one exact profile instruction");
    }
    const body = {
        kind: "consensus_reviewer_task",
        schemaVersion: "5.0.0",
        invocationRef: invocation.invocationRef,
        roundRef: currentRoundRef,
        roundOrdinal: ordinal,
        panelPosition,
        subject: invocation.subject,
        subjectMaterialization: invocation.subjectMaterialization,
        panel: invocation.panel,
        policy: invocation.policy,
        profile,
        instruction,
        submitterProfile: invocation.submitterProfile,
        submitterInstruction: invocation.submitterInstruction,
        priorRoundRefs: [...priorRoundRefs],
        priorFindingSetRefs: [...priorFindingSetRefs],
        priorRulings: [...priorRulings],
        priorDissentProfileRefs: [...priorDissentProfileRefs],
        priorSubmitterResponses: [...priorSubmitterResponses],
        priorEvidenceRefs: [...priorEvidenceRefs],
        transportLane: invocation.transportLane,
    };
    const taskDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        taskRef: `consensus-reviewer-task://abg/${taskDigest.slice("sha256:".length)}`,
        taskDigest,
    });
}
function stateMembers(invocation, ordinal, priorRoundRefs, priorFindingSetRefs, priorRulings, priorDissentProfileRefs, priorSubmitterResponses, priorEvidenceRefs) {
    return invocation.panel.profiles.map((profile, index) => {
        const task = constructConsensusRoleTask({
            role: "reviewer",
            invocation,
            ordinal,
            panelPosition: index,
            profile,
            priorRoundRefs,
            priorFindingSetRefs,
            priorRulings,
            priorDissentProfileRefs,
            priorSubmitterResponses,
            priorEvidenceRefs,
        });
        return {
            ordinal: index,
            memberRef: task.taskRef,
            value: task,
        };
    });
}
export function initializeConsensus(invocation) {
    if (!isConsensusInvocation(invocation)) {
        throw new TypeError("Consensus initialization requires one exact invocation");
    }
    return deepFreeze({
        kind: "consensus_round_state",
        schemaVersion: "5.0.0",
        invocationRef: invocation.invocationRef,
        subject: invocation.subject,
        subjectMaterialization: invocation.subjectMaterialization,
        panel: invocation.panel,
        instructions: invocation.instructions,
        submitterProfile: invocation.submitterProfile,
        submitterInstruction: invocation.submitterInstruction,
        policy: invocation.policy,
        transportLane: invocation.transportLane,
        roundOrdinal: 1,
        roundRefs: [],
        findingSetRefs: [],
        findingSets: [],
        submitterResponses: [],
        rulings: [],
        dissentProfileRefs: [],
        evidenceRefs: [],
        terminalOutcome: null,
        terminal: false,
        members: stateMembers(invocation, 1, [], [], [], [], [], []),
    });
}
function findingSetRef(findings) {
    return `finding-set://abg/${findings.outputDigest.slice("sha256:".length)}`;
}
function rulingFor(findings, overlay) {
    const findingRefs = findings.findings.map((finding) => finding.findingRef);
    const rulingKind = findings.refusalRef === null
        ? overlay?.acceptedFindingRulingKind ?? "decision_row"
        : "deferment";
    const body = {
        rulingKind,
        findingRefs,
        rationaleRef: findings.refusalRef !== null
            ? "rationale://abg/consensus/reviewer-contract-failure@5"
            : findings.recommendation === "accept"
                ? "rationale://abg/consensus/profile-acceptance@5"
                : "rationale://abg/consensus/profile-revision@5",
        payloadRef: findingSetRef(findings),
    };
    const digest = sha256Canonical(body);
    return deepFreeze({
        rulingRef: `review-ruling://abg/${digest.slice("sha256:".length)}`,
        ...body,
    });
}
function constructSubmitterRoleTask(vector) {
    if (!isConsensusFindingsVector(vector)) {
        throw new TypeError("Consensus submitter task requires one exact findings vector");
    }
    const first = vector.members[0].value.task;
    if (vector.members.some((member) => member.value.invocationRef !== first.invocationRef ||
        member.value.roundRef !== first.roundRef ||
        member.value.roundOrdinal !== first.roundOrdinal ||
        member.value.task.subject.subjectRef !== first.subject.subjectRef ||
        member.value.task.subject.subjectDigest !== first.subject.subjectDigest ||
        sha256Canonical(member.value.task.panel) !==
            sha256Canonical(first.panel) ||
        member.value.task.policy.policyDigest !== first.policy.policyDigest ||
        member.value.task.priorSubmitterResponses.length !==
            first.priorSubmitterResponses.length ||
        member.value.task.priorSubmitterResponses.some((response, index) => response.responseRef !==
            first.priorSubmitterResponses[index]?.responseRef))) {
        throw new TypeError("Consensus submitter task requires one complete attributed panel round");
    }
    const invocation = vector.members[0].value.task;
    const task = deepFreeze({
        kind: "consensus_submitter_task",
        schemaVersion: "5.0.0",
        invocationRef: invocation.invocationRef,
        roundRef: invocation.roundRef,
        roundOrdinal: invocation.roundOrdinal,
        subject: invocation.subject,
        subjectMaterialization: invocation.subjectMaterialization,
        panel: invocation.panel,
        policy: invocation.policy,
        profile: invocation.submitterProfile,
        instruction: invocation.submitterInstruction,
        findingsVector: vector,
        priorRoundRefs: [...invocation.priorRoundRefs],
        priorSubmitterResponseRefs: invocation.priorSubmitterResponses.map((response) => response.responseRef),
        priorEvidenceRefs: [...invocation.priorEvidenceRefs],
        transportLane: invocation.transportLane,
    });
    if (!isConsensusSubmitterTask(task)) {
        throw new TypeError("Consensus submitter task failed exact subject, round, or attribution binding");
    }
    return task;
}
export function constructConsensusRoleTask(basis) {
    return basis.role === "reviewer"
        ? constructReviewerRoleTask(basis)
        : constructSubmitterRoleTask(basis.findingsVector);
}
export function constructConsensusSubmitterTask(vector) {
    return constructConsensusRoleTask({
        role: "submitter",
        findingsVector: vector,
    });
}
function responseRecord(response) {
    const { kind: _kind, schemaVersion: _schemaVersion, configurationDigest: _configurationDigest, task: _task, ...record } = response;
    return deepFreeze(record);
}
export function reduceConsensusRound(response) {
    if (!isConsensusSubmitterResponse(response)) {
        throw new TypeError("Consensus reduction requires one exact admitted submitter response");
    }
    const vector = response.task.findingsVector;
    const findings = vector.members.map((member) => member.value);
    const first = findings[0];
    const task = first.task;
    if (findings.some((row, ordinal) => row.invocationRef !== task.invocationRef ||
        row.roundRef !== task.roundRef ||
        row.roundOrdinal !== task.roundOrdinal ||
        row.task.subject.subjectRef !== task.subject.subjectRef ||
        row.task.subject.subjectDigest !== task.subject.subjectDigest ||
        sha256Canonical(row.task.panel) !==
            sha256Canonical(task.panel) ||
        row.task.policy.policyDigest !== task.policy.policyDigest ||
        row.profileRef === findings[ordinal - 1]?.profileRef)) {
        throw new TypeError("Consensus reduction requires one attributed ordered panel round");
    }
    const panel = task.panel;
    const findingSetRefs = findings.map(findingSetRef);
    const rulings = findings.map((row) => rulingFor(row, task.policy.rulingOverlay));
    const rulingRefs = rulings.map((ruling) => ruling.rulingRef);
    const evidenceRefs = [
        ...new Set([
            ...findings.flatMap((row) => row.evidenceRefs),
            ...response.evidenceRefs,
        ]),
    ];
    const roundDissentProfileRefs = findings
        .filter((row) => row.recommendation === "revise")
        .map((row) => row.profileRef);
    const dissentProfileRefs = [
        ...new Set([
            ...task.priorDissentProfileRefs,
            ...roundDissentProfileRefs,
        ]),
    ];
    const hasContractFailure = findings.some((row) => row.refusalRef !== null);
    const outcome = hasContractFailure
        ? "closed_done"
        : roundDissentProfileRefs.length === 0 &&
            response.disposition === "acknowledge"
            ? "closed_done"
            : task.roundOrdinal >= task.policy.roundBudget
                ? "escalate_fh"
                : "recurse_next_round";
    const terminalOutcome = deepFreeze({
        kind: "consensus_round_outcome",
        schemaVersion: "5.0.0",
        roundRef: task.roundRef,
        outcome,
        findingSetRefs,
        rulingRefs,
        evidenceRefs,
    });
    const invocation = {
        kind: "consensus_invocation",
        schemaVersion: "5.0.0",
        invocationRef: task.invocationRef,
        subject: task.subject,
        subjectMaterialization: task.subjectMaterialization,
        panel,
        instructions: findings.map((row) => row.task.instruction),
        submitterProfile: response.task.profile,
        submitterInstruction: response.task.instruction,
        policy: task.policy,
        transportLane: task.transportLane,
    };
    const nextOrdinal = task.roundOrdinal + 1;
    return deepFreeze({
        kind: "consensus_round_state",
        schemaVersion: "5.0.0",
        invocationRef: task.invocationRef,
        subject: task.subject,
        subjectMaterialization: task.subjectMaterialization,
        panel,
        instructions: invocation.instructions,
        submitterProfile: invocation.submitterProfile,
        submitterInstruction: invocation.submitterInstruction,
        policy: task.policy,
        transportLane: task.transportLane,
        roundOrdinal: outcome === "recurse_next_round"
            ? nextOrdinal
            : task.roundOrdinal,
        roundRefs: [...task.priorRoundRefs, task.roundRef],
        findingSetRefs: [...task.priorFindingSetRefs, ...findingSetRefs],
        findingSets: findings,
        submitterResponses: [
            ...task.priorSubmitterResponses,
            responseRecord(response),
        ],
        rulings: [...task.priorRulings, ...rulings],
        dissentProfileRefs,
        evidenceRefs: [...new Set([...task.priorEvidenceRefs, ...evidenceRefs])],
        terminalOutcome: outcome === "recurse_next_round" ? null : terminalOutcome,
        terminal: outcome !== "recurse_next_round",
        members: outcome === "recurse_next_round"
            ? stateMembers(invocation, nextOrdinal, [...task.priorRoundRefs, task.roundRef], [...task.priorFindingSetRefs, ...findingSetRefs], [...task.priorRulings, ...rulings], dissentProfileRefs, [...task.priorSubmitterResponses, responseRecord(response)], [...new Set([...task.priorEvidenceRefs, ...evidenceRefs])])
            : [],
    });
}
export function projectConsensusResult(state) {
    if (!isConsensusRoundState(state) ||
        !state.terminal ||
        state.terminalOutcome === null) {
        throw new TypeError("Consensus result projection requires terminal round truth");
    }
    const refusalRefs = [
        ...new Set(state.findingSets.flatMap((findings) => findings.refusalRef === null ? [] : [findings.refusalRef])),
    ];
    const contractFailureRef = refusalRefs.length === 0
        ? null
        : `consensus-contract-failure://abg/${sha256Canonical({
            invocationRef: state.invocationRef,
            refusalRefs,
        }).slice("sha256:".length)}`;
    const classification = contractFailureRef !== null
        ? "contract_failure"
        : state.terminalOutcome.outcome === "escalate_fh"
            ? "unresolved_disagreement"
            : state.dissentProfileRefs.length === 0
                ? "unanimous_agreement"
                : "partial_agreement_with_dissent";
    const body = {
        kind: "consensus_result_candidate",
        schemaVersion: "5.0.0",
        subjectRef: state.subject.subjectRef,
        subjectDigest: state.subject.subjectDigest,
        panelRef: state.panel.panelRef,
        policyRef: state.policy.policyRef,
        roundRefs: state.roundRefs,
        findingSetRefs: state.findingSetRefs,
        submitterResponseRefs: state.submitterResponses.map((response) => response.responseRef),
        rulings: state.rulings,
        classification,
        dissentProfileRefs: state.dissentProfileRefs,
        terminalOutcome: state.terminalOutcome,
        evidenceRefs: state.evidenceRefs,
        lineageRefs: [
            state.invocationRef,
            state.subject.subjectRef,
            ...state.roundRefs,
            ...state.submitterResponses.map((response) => response.responseRef),
            ...refusalRefs,
        ],
        contractFailureRef,
    };
    return deepFreeze(body);
}
export function prepareConsensusResolution(state) {
    return constructConsensusRoundDecision(projectConsensusResult(state));
}
export function projectConsensusFinalResult(resolution) {
    if (!isConsensusResolution(resolution)) {
        throw new TypeError("Consensus result projection requires one exact resolution");
    }
    if (isConsensusRoundDecision(resolution) &&
        !resolution.resolutionTerminal) {
        throw new TypeError("Consensus unresolved round requires one admitted F_H decision");
    }
    return resolution.result;
}
export function finalizeConsensusEscalation(decision) {
    if (!isConsensusEscalationDecision(decision)) {
        throw new TypeError("Consensus escalation requires one exact human decision");
    }
    const unresolvedResult = decision.roundDecision.result;
    const result = deepFreeze({
        kind: "consensus_result_candidate",
        schemaVersion: "5.0.0",
        subjectRef: unresolvedResult.subjectRef,
        subjectDigest: unresolvedResult.subjectDigest,
        panelRef: unresolvedResult.panelRef,
        policyRef: unresolvedResult.policyRef,
        roundRefs: unresolvedResult.roundRefs,
        findingSetRefs: unresolvedResult.findingSetRefs,
        submitterResponseRefs: unresolvedResult.submitterResponseRefs,
        rulings: unresolvedResult.rulings,
        classification: decision.decision === "accept_with_dissent"
            ? "partial_agreement_with_dissent"
            : "unresolved_disagreement",
        dissentProfileRefs: unresolvedResult.dissentProfileRefs,
        terminalOutcome: unresolvedResult.terminalOutcome,
        evidenceRefs: unresolvedResult.evidenceRefs,
        lineageRefs: [
            ...unresolvedResult.lineageRefs,
            decision.roundDecision.decisionRef,
            decision.decisionRef,
            decision.humanActorRef,
            decision.rationaleRef,
        ],
        contractFailureRef: null,
    });
    const body = {
        kind: "consensus_resolution",
        resolutionKind: "human_finalization",
        schemaVersion: "5.0.0",
        roundDecision: decision.roundDecision,
        decision: decision.decision,
        humanActorRef: decision.humanActorRef,
        rationaleRef: decision.rationaleRef,
        result,
        resolutionTerminal: true,
    };
    const finalizationDigest = sha256Canonical(body);
    const finalization = deepFreeze({
        ...body,
        finalizationRef: `consensus-human-finalization://abg/${finalizationDigest.slice("sha256:".length)}`,
        finalizationDigest,
    });
    if (!isConsensusHumanFinalization(finalization)) {
        throw new TypeError("Consensus F_H finalization must preserve its historical escalation outcome");
    }
    return finalization;
}
export function projectTicketConsensus(result) {
    if (!isConsensusResult(result) ||
        !result.subjectRef.startsWith("ticket://")) {
        throw new TypeError("Ticket Consensus projection requires one admitted ticket result and replay");
    }
    const body = {
        kind: "ticket_consensus_projection",
        schemaVersion: "5.0.0",
        ticketRef: result.subjectRef,
        ticketDigest: result.subjectDigest,
        subjectRef: result.subjectRef,
        subjectDigest: result.subjectDigest,
        panelRef: result.panelRef,
        policyRef: result.policyRef,
        roundRefs: result.roundRefs,
        findingSetRefs: result.findingSetRefs,
        submitterResponseRefs: result.submitterResponseRefs,
        rulings: result.rulings,
        classification: result.classification,
        dissentProfileRefs: result.dissentProfileRefs,
        terminalOutcome: result.terminalOutcome,
        evidenceRefs: result.evidenceRefs,
        lineageRefs: result.lineageRefs,
        resultRef: result.resultRef,
        replayRef: result.replayRef,
    };
    const projectionDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        projectionRef: `ticket-consensus-projection://abg/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
function isConsensusRoundFold(input, output) {
    if (!isConsensusFindingsVector(input) ||
        !isConsensusRoundState(output))
        return false;
    const first = input.members[0]?.value;
    const response = output.submitterResponses.at(-1);
    return first !== undefined &&
        response !== undefined &&
        response.invocationRef === first.invocationRef &&
        response.roundRef === first.roundRef &&
        response.roundOrdinal === first.roundOrdinal &&
        response.findingsVectorDigest ===
            sha256Canonical(input) &&
        output.findingSets.length === input.members.length &&
        output.findingSets.every((row, ordinal) => row.outputDigest === input.members[ordinal]?.value.outputDigest);
}
export function resolveConsensusJudgmentRelation(predicateRef) {
    const relation = (evaluate, name) => Object.freeze({
        predicateRef,
        advanceReasonRef: `reason://abg/consensus/${name}-accepted@5`,
        rejectionReasonRef: `reason://abg/consensus/${name}-rejected@5`,
        evaluate,
    });
    switch (predicateRef) {
        case CONSENSUS_IDS.initializerPredicateRef:
            return relation((input, output) => isConsensusInvocation(input) &&
                isConsensusRoundState(output) &&
                sha256Canonical(output) ===
                    sha256Canonical(initializeConsensus(input)), "initialization");
        case CONSENSUS_IDS.roundEvaluatorPredicateRef:
            return relation((input, output) => isConsensusRoundState(input) &&
                isConsensusRoundState(output) &&
                sha256Canonical(input) ===
                    sha256Canonical(output), "round-evaluation");
        case CONSENSUS_IDS.rootWorkflowPredicateRef:
            return relation((input, output) => isConsensusRoundState(input) &&
                isConsensusRoundState(output) &&
                output.invocationRef === input.invocationRef &&
                output.roundOrdinal >= input.roundOrdinal &&
                output.terminal, "root-workflow-foldback");
        case CONSENSUS_IDS.roundWorkflowPredicateRef:
            return relation((input, output) => (isConsensusReviewerTask(input) &&
                isReviewFindings(output) &&
                sha256Canonical(output.task) ===
                    sha256Canonical(input) &&
                output.profileRef === input.profile.profileRef &&
                output.configurationDigest === input.profile.configurationDigest &&
                output.roundRef === input.roundRef) ||
                (isConsensusFindingsVector(input) &&
                    isConsensusSubmitterTask(output) &&
                    sha256Canonical(output) ===
                        sha256Canonical(constructConsensusSubmitterTask(input))) ||
                (isConsensusSubmitterTask(input) &&
                    isConsensusSubmitterResponse(output) &&
                    sha256Canonical(output.task) ===
                        sha256Canonical(input) &&
                    output.task.invocationRef === input.invocationRef &&
                    output.task.roundRef === input.roundRef &&
                    output.task.roundOrdinal === input.roundOrdinal) ||
                (isConsensusSubmitterResponse(input) &&
                    isConsensusRoundState(output) &&
                    sha256Canonical(output) ===
                        sha256Canonical(reduceConsensusRound(input))) ||
                (isConsensusRoundFold(input, output)), "round-workflow-foldback");
        case CONSENSUS_IDS.roundReducerPredicateRef:
            return relation((input, output) => (isConsensusSubmitterTask(input) &&
                isConsensusSubmitterResponse(output) &&
                sha256Canonical(output.task) ===
                    sha256Canonical(input) &&
                output.submittingActorRef === input.profile.actorRef) ||
                isConsensusRoundFold(input, output), "submitter-reviewer-fold");
        case CONSENSUS_IDS.reviewerPredicateRef:
            return relation((input, output) => isConsensusReviewerTask(input) &&
                isReviewFindings(output) &&
                sha256Canonical(output.task) ===
                    sha256Canonical(input) &&
                output.profileRef === input.profile.profileRef &&
                output.configurationDigest === input.profile.configurationDigest &&
                output.roundRef === input.roundRef, "reviewer-attribution");
        case CONSENSUS_IDS.submitterTaskPredicateRef:
            return relation((input, output) => isConsensusFindingsVector(input) &&
                isConsensusSubmitterTask(output) &&
                sha256Canonical(output) ===
                    sha256Canonical(constructConsensusSubmitterTask(input)), "submitter-task-preparation");
        case CONSENSUS_IDS.submitterPredicateRef:
            return relation((input, output) => isConsensusSubmitterTask(input) &&
                isConsensusSubmitterResponse(output) &&
                sha256Canonical(output.task) ===
                    sha256Canonical(input) &&
                output.task.invocationRef === input.invocationRef &&
                output.task.roundRef === input.roundRef &&
                output.task.roundOrdinal === input.roundOrdinal &&
                output.submittingActorRef === input.profile.actorRef, "submitter-attribution");
        case CONSENSUS_IDS.reducerPredicateRef:
            return relation((input, output) => isConsensusSubmitterResponse(input) &&
                isConsensusRoundState(output) &&
                sha256Canonical(output) ===
                    sha256Canonical(reduceConsensusRound(input)), "round-reduction");
        case CONSENSUS_IDS.finalizationPreparationPredicateRef:
            return relation((input, output) => isConsensusRoundState(input) &&
                isConsensusRoundDecision(output) &&
                sha256Canonical(output) ===
                    sha256Canonical(prepareConsensusResolution(input)), "finalization-preparation");
        case CONSENSUS_IDS.finalizationEvaluatorPredicateRef:
            return relation((input, output) => isConsensusResolution(input) &&
                isConsensusResolution(output) &&
                sha256Canonical(input) ===
                    sha256Canonical(output), "finalization-evaluation");
        case CONSENSUS_IDS.projectorPredicateRef:
            return relation((input, output) => isConsensusResolution(input) &&
                isConsensusResultCandidate(output) &&
                sha256Canonical(output) ===
                    sha256Canonical(projectConsensusFinalResult(input)), "result-projection");
        case CONSENSUS_IDS.escalationFinalizerPredicateRef:
            return relation((input, output) => isConsensusEscalationDecision(input) &&
                isConsensusHumanFinalization(output) &&
                sha256Canonical(output) ===
                    sha256Canonical(finalizeConsensusEscalation(input)), "fh-escalation");
        case CONSENSUS_IDS.oneSurfacePredicateRef:
            return relation((input, output) => {
                try {
                    if (isConsensusObservationSnapshot(input)) {
                        if (isConsensusObservationSnapshot(output)) {
                            return sha256Canonical(output) === sha256Canonical(synthesizeConsensusModel(input));
                        }
                        if (isConsensusNextActionBasis(output)) {
                            return sha256Canonical(output) === sha256Canonical(evaluateConsensusGap(input));
                        }
                    }
                    if (isConsensusNextActionBasis(input)) {
                        const frontier = input.runtimeFrontier;
                        const expected = frontier.phase === "initial"
                            ? selectConsensusNextAction(input)
                            : refreshConsensusNextAction(input);
                        return isConsensusNextActionProjection(output) &&
                            sha256Canonical(output) ===
                                sha256Canonical(expected);
                    }
                    if (isConsensusNextActionProjection(input) &&
                        input.disposition === "selected" &&
                        isConsensusActionEvaluationBasis(output)) {
                        const basis = output.nextActionBasis;
                        const intent = output.constructionIntent;
                        return basis.basisRef === input.nextActionBasisRef &&
                            basis.basisDigest === input.nextActionBasisDigest &&
                            intent.selectedActionRef === input.selectedActionRef &&
                            intent.selectedGraphFunctionRef ===
                                CONSENSUS_IDS.graphFunctionRef;
                    }
                    if (isConsensusActionEvaluationBasis(input) &&
                        isConsensusActionEvaluationProjection(output)) {
                        return sha256Canonical(output) === sha256Canonical(evaluateConsensusAction(input));
                    }
                    if (isConsensusActionEvaluationProjection(input) &&
                        isConsensusObservationSnapshot(output)) {
                        return sha256Canonical(output) === sha256Canonical(refreshConsensusModel(input));
                    }
                    return false;
                }
                catch {
                    return false;
                }
            }, "one-surface-stage");
        default:
            return null;
    }
}
function executableRequirement(bindingRef, inputContractRef, outputContractRef) {
    return {
        kind: "executable_leaf_requirement",
        implementationBindingRef: bindingRef,
        inputContractRef,
        outputContractRef,
        evidenceContractRef: CONSENSUS_IDS.evidenceContractRef,
        failureContractRef: CONSENSUS_IDS.failureContractRef,
        refusalContractRef: CONSENSUS_IDS.refusalContractRef,
        judgmentContractRef: CONSENSUS_IDS.judgmentContractRef,
    };
}
function leafGraphFunction(input) {
    if (input.fibre === "F_P" && input.effectRef === undefined) {
        throw new TypeError("Consensus F_P leaves require one declared effect");
    }
    const leaf = C.of({
        input: cCarrier(input.inputContractRef),
        output: cCarrier(input.outputContractRef),
        programLocusRef: input.nodeRef,
        stageRole: input.stageRole,
        fibre: input.fibre,
        armId: `arm://${input.nodeRef.slice("locus://".length)}`,
        compositionRef: null,
        vectorIndex: 0,
        judgmentPredicateRef: input.predicateRef,
        resultBearing: true,
        requirement: executableRequirement(input.bindingRef, input.inputContractRef, input.outputContractRef),
    });
    return {
        kind: "graph_function",
        name: input.name,
        version: "5.0.0",
        environment: {
            requires: [input.inputContractRef],
            provides: [input.outputContractRef],
            carries: [input.inputContractRef, input.outputContractRef],
        },
        inputs: [input.inputContractRef],
        outputs: [input.outputContractRef],
        template: {
            kind: "inline_graph",
            graphRef: input.graphRef,
            startNodeRef: input.nodeRef,
            terminalNodeRefs: [input.nodeRef],
            nodes: [{
                    nodeRef: input.nodeRef,
                    nodeKind: "c_locus",
                    term: input.retryBudget === undefined
                        ? leaf
                        : C.retry(leaf, input.retryBudget),
                }],
            edges: [],
            applications: [],
        },
        effects: input.effectRef === undefined ? [] : [input.effectRef],
        declarations: {
            "abg.compute_regime": input.fibre,
            "abg.closure_contract": input.closureContractRef,
            "abg.child_closure_contract": input.closureContractRef,
            "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
            "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
            "abg.judgment_predicate": input.predicateRef,
            "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
        },
        tags: ["abiogenesis", "consensus", input.stageRole.toLowerCase()],
    };
}
function closure(closureContractRef, scope, resultContractRef) {
    const common = {
        kind: "closure_contract",
        closureContractRef,
        predicateRef: "predicate://abg/consensus/terminal@5",
        evidenceContractRef: CONSENSUS_IDS.evidenceContractRef,
        resultContractRef,
        refusalContractRef: CONSENSUS_IDS.refusalContractRef,
        refusalValueKind: "consensus_refusal",
        judgmentContractRef: CONSENSUS_IDS.judgmentContractRef,
        rejectionContractRef: CONSENSUS_IDS.refusalContractRef,
        transitionContractRef: CONSENSUS_IDS.transitionContractRef,
        replayProjectionRef: "projection://abg/consensus/replay@5",
        terminalKind: "completed",
    };
    return scope === "run"
        ? {
            ...common,
            closureScope: "run",
            eventKindRefs: [
                "terminal_reached",
                "frame_closed",
                "graph_call_closed",
                "run_closed",
            ],
        }
        : {
            ...common,
            closureScope: "graph_call",
            eventKindRefs: [
                "terminal_reached",
                "frame_closed",
                "graph_call_closed",
            ],
        };
}
function consensusContract(contractRef, contractKind, valueKind, validate) {
    return Object.freeze({
        contractRef,
        contractVersion: "5.0.0",
        contractKind,
        valueKind,
        validate,
    });
}
export const CONSENSUS_NATIVE_CONTRACT_DEFINITIONS = Object.freeze([
    consensusContract(CONSENSUS_IDS.subjectContractRef, "input", "consensus_subject", isConsensusSubject),
    consensusContract(CONSENSUS_IDS.panelContractRef, "input", "consensus_panel", isConsensusPanel),
    consensusContract(CONSENSUS_IDS.profileContractRef, "input", "consensus_reviewer_profile", isConsensusReviewerProfile),
    consensusContract(CONSENSUS_IDS.reviewerInstructionContractRef, "input", "consensus_reviewer_instruction", isConsensusReviewerInstruction),
    consensusContract(CONSENSUS_IDS.submitterProfileContractRef, "input", "consensus_submitter_profile", isConsensusSubmitterProfile),
    consensusContract(CONSENSUS_IDS.submitterInstructionContractRef, "input", "consensus_submitter_instruction", isConsensusSubmitterInstruction),
    consensusContract(CONSENSUS_IDS.findingsContractRef, "output", "review_findings", isReviewFindings),
    consensusContract(CONSENSUS_IDS.rulingsContractRef, "output", "review_rulings", isReviewRulings),
    consensusContract(CONSENSUS_IDS.rulingOverlayContractRef, "input", "consensus_ruling_overlay", isConsensusRulingOverlay),
    consensusContract(CONSENSUS_IDS.policyContractRef, "input", "consensus_round_policy", isConsensusRoundPolicy),
    consensusContract(CONSENSUS_IDS.roundOutcomeContractRef, "output", "consensus_round_outcome", isConsensusRoundOutcome),
    consensusContract(CONSENSUS_IDS.resultCandidateContractRef, "output", "consensus_result_candidate", isConsensusResultCandidate),
    consensusContract(CONSENSUS_IDS.resultContractRef, "output", "consensus_result", isConsensusResult),
    consensusContract(CONSENSUS_IDS.ticketProjectionContractRef, "output", "ticket_consensus_projection", isTicketConsensusProjection),
    consensusContract(CONSENSUS_IDS.invocationContractRef, "input", "consensus_invocation", isConsensusInvocation),
    consensusContract(CONSENSUS_IDS.observationContractRef, "input", "observation_snapshot", isConsensusObservationSnapshot),
    consensusContract(CONSENSUS_IDS.modelContractRef, "output", "observation_snapshot", isConsensusObservationSnapshot),
    consensusContract(CONSENSUS_IDS.nextActionBasisContractRef, "output", "next_action_basis", isConsensusNextActionBasis),
    consensusContract(CONSENSUS_IDS.nextActionContractRef, "output", "next_action_projection", isConsensusNextActionProjection),
    consensusContract(CONSENSUS_IDS.actionEvaluationBasisContractRef, "output", "action_evaluation_basis", isConsensusActionEvaluationBasis),
    consensusContract(CONSENSUS_IDS.actionEvaluationContractRef, "output", "action_evaluation_projection", isConsensusActionEvaluationProjection),
    consensusContract(CONSENSUS_IDS.stateContractRef, "output", "consensus_round_state", isConsensusRoundState),
    consensusContract(CONSENSUS_IDS.resolutionContractRef, "output", "consensus_resolution", isConsensusResolution),
    consensusContract(CONSENSUS_IDS.reviewerTaskContractRef, "input", "consensus_reviewer_task", isConsensusReviewerTask),
    consensusContract(CONSENSUS_IDS.findingsVectorContractRef, "output", "consensus_findings_vector", isConsensusFindingsVector),
    consensusContract(CONSENSUS_IDS.submitterTaskContractRef, "output", "consensus_submitter_task", isConsensusSubmitterTask),
    consensusContract(CONSENSUS_IDS.submitterResponseContractRef, "output", "consensus_submitter_response", isConsensusSubmitterResponse),
    consensusContract(CONSENSUS_IDS.escalationDecisionContractRef, "output", "consensus_escalation_decision", isConsensusEscalationDecision),
    consensusContract(CONSENSUS_IDS.failureContractRef, "failure", "consensus_failure", (value) => isRecord(value) && value.kind === "consensus_failure"),
    consensusContract(CONSENSUS_IDS.refusalContractRef, "refusal", "consensus_refusal", (value) => isRecord(value) && value.kind === "consensus_refusal"),
    consensusContract(CONSENSUS_IDS.evidenceContractRef, "evidence", "probabilistic_transport_evidence_candidate", null),
    consensusContract(CONSENSUS_IDS.judgmentContractRef, "judgment", "consensus_judgment", null),
    consensusContract(CONSENSUS_IDS.transitionContractRef, "transition", "consensus_transition", null),
    consensusContract(CONSENSUS_IDS.continuationContractRef, "transition", "consensus_continuation", null),
]);
export function validateConsensusContractValue(valueKind, value) {
    const definitions = CONSENSUS_NATIVE_CONTRACT_DEFINITIONS.filter((definition) => definition.valueKind === valueKind);
    return definitions.length > 0 &&
        definitions.every((definition) => definition.validate !== null && definition.validate(value));
}
export function constructConsensusModulePublication(artifact) {
    const invocationCarrier = cCarrier(CONSENSUS_IDS.invocationContractRef);
    const stateCarrier = cCarrier(CONSENSUS_IDS.stateContractRef);
    const resolutionCarrier = cCarrier(CONSENSUS_IDS.resolutionContractRef);
    const resultCarrier = cCarrier(CONSENSUS_IDS.resultCandidateContractRef);
    const observationCarrier = cCarrier(CONSENSUS_IDS.observationContractRef);
    const modelCarrier = cCarrier(CONSENSUS_IDS.modelContractRef);
    const nextActionBasisCarrier = cCarrier(CONSENSUS_IDS.nextActionBasisContractRef);
    const nextActionCarrier = cCarrier(CONSENSUS_IDS.nextActionContractRef);
    const actionEvaluationBasisCarrier = cCarrier(CONSENSUS_IDS.actionEvaluationBasisContractRef);
    const actionEvaluationCarrier = cCarrier(CONSENSUS_IDS.actionEvaluationContractRef);
    const reviewerTaskCarrier = cCarrier(CONSENSUS_IDS.reviewerTaskContractRef);
    const findingsCarrier = cCarrier(CONSENSUS_IDS.findingsContractRef);
    const findingsVectorCarrier = cCarrier(CONSENSUS_IDS.findingsVectorContractRef);
    const submitterTaskCarrier = cCarrier(CONSENSUS_IDS.submitterTaskContractRef);
    const submitterResponseCarrier = cCarrier(CONSENSUS_IDS.submitterResponseContractRef);
    const roundRef = cGraphFunctionRef({
        graphFunctionRef: CONSENSUS_IDS.roundGraphFunctionRef,
        input: stateCarrier,
        output: stateCarrier,
    });
    const reviewerRef = cGraphFunctionRef({
        graphFunctionRef: CONSENSUS_IDS.reviewerGraphFunctionRef,
        input: reviewerTaskCarrier,
        output: findingsCarrier,
    });
    const submitterRef = cGraphFunctionRef({
        graphFunctionRef: CONSENSUS_IDS.submitterGraphFunctionRef,
        input: submitterTaskCarrier,
        output: submitterResponseCarrier,
    });
    const roundReducerRef = cGraphFunctionRef({
        graphFunctionRef: CONSENSUS_IDS.roundReducerGraphFunctionRef,
        input: findingsVectorCarrier,
        output: stateCarrier,
    });
    const recursion = recurseApplication({
        inputContractRef: CONSENSUS_IDS.stateContractRef,
        outputContractRef: CONSENSUS_IDS.stateContractRef,
        graphFunctionRef: CONSENSUS_IDS.roundGraphFunctionRef,
        terminationRuleRef: CONSENSUS_IDS.roundTerminationRuleRef,
        terminationEvaluatorRefs: [
            CONSENSUS_IDS.roundEvaluatorRef,
        ],
        terminationFieldRef: "$.terminal",
        foldback: {
            mode: "rebind",
            binding: "$",
            requiresParentEvaluation: true,
        },
        bound: Number.MAX_SAFE_INTEGER,
    });
    const finalizationRecursion = recurseApplication({
        inputContractRef: CONSENSUS_IDS.resolutionContractRef,
        outputContractRef: CONSENSUS_IDS.resolutionContractRef,
        graphFunctionRef: CONSENSUS_IDS.escalationGraphFunctionRef,
        terminationRuleRef: CONSENSUS_IDS.finalizationTerminationRuleRef,
        terminationEvaluatorRefs: [
            CONSENSUS_IDS.finalizationEvaluatorRef,
        ],
        terminationFieldRef: "$.resolutionTerminal",
        foldback: {
            mode: "rebind",
            binding: "$",
            requiresParentEvaluation: true,
        },
        bound: 2,
    });
    const fanOut = fanOutApplication({
        inputContractRef: CONSENSUS_IDS.stateContractRef,
        outputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
        batchRef: CONSENSUS_IDS.roundBatchRef,
        elementGraphFunctionRef: CONSENSUS_IDS.reviewerGraphFunctionRef,
        inputVectorRef: CONSENSUS_IDS.stateContractRef,
        outputVectorRef: CONSENSUS_IDS.findingsVectorContractRef,
        inputMemberContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
        outputMemberContractRef: CONSENSUS_IDS.findingsContractRef,
    });
    const fanIn = fanInApplication({
        inputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
        outputContractRef: CONSENSUS_IDS.stateContractRef,
        reducerGraphFunctionRef: CONSENSUS_IDS.roundReducerGraphFunctionRef,
        inputVectorRef: CONSENSUS_IDS.findingsVectorContractRef,
    });
    const initializerLeaf = C.of({
        input: invocationCarrier,
        output: stateCarrier,
        programLocusRef: "locus://abg/consensus/initialize@5",
        stageRole: "initialize",
        fibre: "F_D",
        armId: "arm://abg/consensus/initialize@5",
        compositionRef: null,
        vectorIndex: 0,
        judgmentPredicateRef: CONSENSUS_IDS.initializerPredicateRef,
        resultBearing: false,
        requirement: executableRequirement(CONSENSUS_IDS.initializerImplementationBindingRef, CONSENSUS_IDS.invocationContractRef, CONSENSUS_IDS.stateContractRef),
    });
    const finalizationPreparationLeaf = C.of({
        input: stateCarrier,
        output: resolutionCarrier,
        programLocusRef: CONSENSUS_IDS.finalizationPreparationNodeRef,
        stageRole: "prepare_finalization",
        fibre: "F_D",
        armId: "arm://abg/consensus/prepare-finalization/root@5",
        compositionRef: null,
        vectorIndex: 1,
        judgmentPredicateRef: CONSENSUS_IDS.finalizationPreparationPredicateRef,
        resultBearing: false,
        requirement: executableRequirement(CONSENSUS_IDS.finalizationPreparationImplementationBindingRef, CONSENSUS_IDS.stateContractRef, CONSENSUS_IDS.resolutionContractRef),
    });
    const projectorLeaf = C.of({
        input: resolutionCarrier,
        output: resultCarrier,
        programLocusRef: CONSENSUS_IDS.projectorNodeRef,
        stageRole: "project_result",
        fibre: "F_D",
        armId: "arm://abg/consensus/project-result/root@5",
        compositionRef: null,
        vectorIndex: 3,
        judgmentPredicateRef: CONSENSUS_IDS.projectorPredicateRef,
        resultBearing: true,
        requirement: executableRequirement(CONSENSUS_IDS.projectorImplementationBindingRef, CONSENSUS_IDS.resolutionContractRef, CONSENSUS_IDS.resultCandidateContractRef),
    });
    const roundEvaluator = C.of({
        input: stateCarrier,
        output: stateCarrier,
        programLocusRef: CONSENSUS_IDS.roundLoopNodeRef,
        stageRole: "round_termination",
        fibre: "F_D",
        armId: "arm://abg/consensus/round-termination@5",
        compositionRef: recursion.applicationRef,
        vectorIndex: 0,
        judgmentPredicateRef: CONSENSUS_IDS.roundEvaluatorPredicateRef,
        resultBearing: false,
        requirement: executableRequirement(CONSENSUS_IDS.roundEvaluatorImplementationBindingRef, CONSENSUS_IDS.stateContractRef, CONSENSUS_IDS.stateContractRef),
    });
    const finalizationEvaluator = C.of({
        input: resolutionCarrier,
        output: resolutionCarrier,
        programLocusRef: CONSENSUS_IDS.finalizationLoopNodeRef,
        stageRole: "finalization_termination",
        fibre: "F_D",
        armId: "arm://abg/consensus/finalization-termination@5",
        compositionRef: finalizationRecursion.applicationRef,
        vectorIndex: 0,
        judgmentPredicateRef: CONSENSUS_IDS.finalizationEvaluatorPredicateRef,
        resultBearing: false,
        requirement: executableRequirement(CONSENSUS_IDS.finalizationEvaluatorImplementationBindingRef, CONSENSUS_IDS.resolutionContractRef, CONSENSUS_IDS.resolutionContractRef),
    });
    const rootGraphFunction = {
        kind: "graph_function",
        name: CONSENSUS_IDS.graphFunctionRef,
        version: "5.0.0",
        environment: {
            requires: [CONSENSUS_IDS.invocationContractRef],
            provides: [CONSENSUS_IDS.resultCandidateContractRef],
            carries: [
                CONSENSUS_IDS.stateContractRef,
                CONSENSUS_IDS.resolutionContractRef,
                CONSENSUS_IDS.findingsContractRef,
                CONSENSUS_IDS.roundOutcomeContractRef,
            ],
        },
        inputs: [CONSENSUS_IDS.invocationContractRef],
        outputs: [CONSENSUS_IDS.resultCandidateContractRef],
        template: {
            kind: "inline_graph",
            graphRef: CONSENSUS_IDS.graphRef,
            startNodeRef: CONSENSUS_IDS.nodeRef,
            terminalNodeRefs: [CONSENSUS_IDS.projectorNodeRef],
            nodes: [
                {
                    nodeRef: CONSENSUS_IDS.nodeRef,
                    nodeKind: "c_locus",
                    term: initializerLeaf,
                },
                {
                    nodeRef: CONSENSUS_IDS.roundLoopNodeRef,
                    nodeKind: "c_locus",
                    term: roundEvaluator,
                },
                {
                    nodeRef: CONSENSUS_IDS.finalizationPreparationNodeRef,
                    nodeKind: "c_locus",
                    term: finalizationPreparationLeaf,
                },
                {
                    nodeRef: CONSENSUS_IDS.finalizationLoopNodeRef,
                    nodeKind: "c_locus",
                    term: finalizationEvaluator,
                },
                {
                    nodeRef: CONSENSUS_IDS.projectorNodeRef,
                    nodeKind: "c_locus",
                    term: projectorLeaf,
                },
            ],
            edges: [
                graphEdge({
                    fromNodeRef: CONSENSUS_IDS.nodeRef,
                    toNodeRef: CONSENSUS_IDS.roundLoopNodeRef,
                }),
                graphEdge({
                    fromNodeRef: CONSENSUS_IDS.roundLoopNodeRef,
                    toNodeRef: CONSENSUS_IDS.finalizationPreparationNodeRef,
                }),
                graphEdge({
                    fromNodeRef: CONSENSUS_IDS.finalizationPreparationNodeRef,
                    toNodeRef: CONSENSUS_IDS.finalizationLoopNodeRef,
                }),
                graphEdge({
                    fromNodeRef: CONSENSUS_IDS.finalizationLoopNodeRef,
                    toNodeRef: CONSENSUS_IDS.projectorNodeRef,
                }),
            ],
            applications: [recursion, finalizationRecursion],
        },
        effects: [
            "effect://abg/consensus/reviewer-worker@5",
            "effect://abg/consensus/submitter-worker@5",
            "effect://abg/consensus/human-resolution@5",
        ],
        declarations: {
            "abg.compute_regime": "mixed",
            "abg.closure_contract": CONSENSUS_IDS.rootClosureContractRef,
            "abg.child_closure_contract": CONSENSUS_IDS.resultClosureContractRef,
            "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
            "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
            "abg.judgment_predicate": CONSENSUS_IDS.rootWorkflowPredicateRef,
            "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
            "abg.owner": CONSENSUS_IDS.ownerRef,
        },
        tags: ["abiogenesis", "system", "consensus", "direct-gtl"],
    };
    const roundGraphFunction = {
        kind: "graph_function",
        name: CONSENSUS_IDS.roundGraphFunctionRef,
        version: "5.0.0",
        environment: {
            requires: [CONSENSUS_IDS.stateContractRef],
            provides: [CONSENSUS_IDS.stateContractRef],
            carries: [
                CONSENSUS_IDS.reviewerTaskContractRef,
                CONSENSUS_IDS.findingsContractRef,
                CONSENSUS_IDS.findingsVectorContractRef,
                CONSENSUS_IDS.submitterTaskContractRef,
                CONSENSUS_IDS.submitterResponseContractRef,
            ],
        },
        inputs: [CONSENSUS_IDS.stateContractRef],
        outputs: [CONSENSUS_IDS.stateContractRef],
        template: {
            kind: "inline_graph",
            graphRef: CONSENSUS_IDS.roundGraphRef,
            startNodeRef: CONSENSUS_IDS.roundNodeRef,
            terminalNodeRefs: [CONSENSUS_IDS.roundNodeRef],
            nodes: [{
                    nodeRef: CONSENSUS_IDS.roundNodeRef,
                    nodeKind: "c_locus",
                    term: C.compose(C.batch([workflow.C(reviewerRef)], CONSENSUS_IDS.roundBatchRef, { input: stateCarrier, output: findingsVectorCarrier }), workflow.C(roundReducerRef)),
                }],
            edges: [],
            applications: [fanOut, fanIn],
        },
        effects: [
            "effect://abg/consensus/reviewer-worker@5",
            "effect://abg/consensus/submitter-worker@5",
        ],
        declarations: {
            "abg.compute_regime": "mixed",
            "abg.closure_contract": CONSENSUS_IDS.childClosureContractRef,
            "abg.child_closure_contract": CONSENSUS_IDS.childClosureContractRef,
            "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
            "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
            "abg.judgment_predicate": CONSENSUS_IDS.roundWorkflowPredicateRef,
            "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
        },
        tags: ["abiogenesis", "consensus", "round", "fan-out", "fan-in"],
    };
    const reviewerGraphFunction = leafGraphFunction({
        name: CONSENSUS_IDS.reviewerGraphFunctionRef,
        graphRef: CONSENSUS_IDS.reviewerGraphRef,
        nodeRef: CONSENSUS_IDS.reviewerNodeRef,
        inputContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
        outputContractRef: CONSENSUS_IDS.findingsContractRef,
        bindingRef: CONSENSUS_IDS.reviewerImplementationBindingRef,
        predicateRef: CONSENSUS_IDS.reviewerPredicateRef,
        stageRole: "reviewer_assessment",
        fibre: "F_P",
        closureContractRef: CONSENSUS_IDS.reviewerClosureContractRef,
        effectRef: "effect://abg/consensus/reviewer-worker@5",
        retryBudget: 2,
    });
    const submitterTaskTerm = C.of({
        input: findingsVectorCarrier,
        output: submitterTaskCarrier,
        programLocusRef: CONSENSUS_IDS.submitterTaskNodeRef,
        stageRole: "prepare_submitter_task",
        fibre: "F_D",
        armId: "arm://abg/consensus/prepare-submitter-task@5",
        compositionRef: null,
        vectorIndex: 0,
        judgmentPredicateRef: CONSENSUS_IDS.submitterTaskPredicateRef,
        resultBearing: false,
        requirement: executableRequirement(CONSENSUS_IDS.submitterTaskImplementationBindingRef, CONSENSUS_IDS.findingsVectorContractRef, CONSENSUS_IDS.submitterTaskContractRef),
    });
    const submitterGraphFunction = leafGraphFunction({
        name: CONSENSUS_IDS.submitterGraphFunctionRef,
        graphRef: CONSENSUS_IDS.submitterGraphRef,
        nodeRef: CONSENSUS_IDS.submitterNodeRef,
        inputContractRef: CONSENSUS_IDS.submitterTaskContractRef,
        outputContractRef: CONSENSUS_IDS.submitterResponseContractRef,
        bindingRef: CONSENSUS_IDS.submitterImplementationBindingRef,
        predicateRef: CONSENSUS_IDS.submitterPredicateRef,
        stageRole: "submitter_response",
        fibre: "F_P",
        closureContractRef: CONSENSUS_IDS.submitterClosureContractRef,
        effectRef: "effect://abg/consensus/submitter-worker@5",
    });
    const reducerTerm = C.of({
        input: submitterResponseCarrier,
        output: stateCarrier,
        programLocusRef: CONSENSUS_IDS.reducerNodeRef,
        stageRole: "round_reduction",
        fibre: "F_D",
        armId: "arm://abg/consensus/reducer@5",
        compositionRef: null,
        vectorIndex: 2,
        judgmentPredicateRef: CONSENSUS_IDS.reducerPredicateRef,
        resultBearing: false,
        requirement: executableRequirement(CONSENSUS_IDS.reducerImplementationBindingRef, CONSENSUS_IDS.submitterResponseContractRef, CONSENSUS_IDS.stateContractRef),
    });
    const roundReducerGraphFunction = {
        kind: "graph_function",
        name: CONSENSUS_IDS.roundReducerGraphFunctionRef,
        version: "5.0.0",
        environment: {
            requires: [CONSENSUS_IDS.findingsVectorContractRef],
            provides: [
                CONSENSUS_IDS.submitterTaskContractRef,
                CONSENSUS_IDS.submitterResponseContractRef,
                CONSENSUS_IDS.stateContractRef,
            ],
            carries: [
                CONSENSUS_IDS.findingsVectorContractRef,
                CONSENSUS_IDS.submitterTaskContractRef,
                CONSENSUS_IDS.submitterResponseContractRef,
                CONSENSUS_IDS.stateContractRef,
            ],
        },
        inputs: [CONSENSUS_IDS.findingsVectorContractRef],
        outputs: [CONSENSUS_IDS.stateContractRef],
        template: {
            kind: "inline_graph",
            graphRef: CONSENSUS_IDS.roundReducerGraphRef,
            startNodeRef: CONSENSUS_IDS.reducerNodeRef,
            terminalNodeRefs: [CONSENSUS_IDS.reducerNodeRef],
            nodes: [{
                    nodeRef: CONSENSUS_IDS.reducerNodeRef,
                    nodeKind: "c_locus",
                    term: C.compose(C.compose(submitterTaskTerm, C.retry(workflow.C(submitterRef), 2)), reducerTerm),
                }],
            edges: [],
            applications: [],
        },
        effects: [...submitterGraphFunction.effects],
        declarations: {
            "abg.compute_regime": "mixed",
            "abg.closure_contract": CONSENSUS_IDS.childClosureContractRef,
            "abg.child_closure_contract": CONSENSUS_IDS.childClosureContractRef,
            "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
            "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
            "abg.judgment_predicate": CONSENSUS_IDS.roundReducerPredicateRef,
            "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
        },
        tags: [
            "abiogenesis",
            "consensus",
            "submitter-reviewer-fold",
            "fan-in",
        ],
    };
    const escalationDecisionCarrier = cCarrier(CONSENSUS_IDS.escalationDecisionContractRef);
    const escalationFinalizerRef = cGraphFunctionRef({
        graphFunctionRef: CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
        input: escalationDecisionCarrier,
        output: resolutionCarrier,
    });
    const escalationGraphFunction = {
        kind: "graph_function",
        name: CONSENSUS_IDS.escalationGraphFunctionRef,
        version: "5.0.0",
        environment: {
            requires: [CONSENSUS_IDS.resolutionContractRef],
            provides: [CONSENSUS_IDS.resolutionContractRef],
            carries: [CONSENSUS_IDS.escalationDecisionContractRef],
        },
        inputs: [CONSENSUS_IDS.resolutionContractRef],
        outputs: [CONSENSUS_IDS.resolutionContractRef],
        template: {
            kind: "inline_graph",
            graphRef: CONSENSUS_IDS.escalationGraphRef,
            startNodeRef: CONSENSUS_IDS.escalationNodeRef,
            terminalNodeRefs: [CONSENSUS_IDS.escalationNodeRef],
            nodes: [{
                    nodeRef: CONSENSUS_IDS.escalationNodeRef,
                    nodeKind: "c_locus",
                    term: C.compose(C.of({
                        input: resolutionCarrier,
                        output: escalationDecisionCarrier,
                        programLocusRef: CONSENSUS_IDS.escalationNodeRef,
                        stageRole: "consensus_fh_escalation",
                        fibre: "F_H",
                        armId: "arm://abg/consensus/fh-escalation@5",
                        compositionRef: null,
                        vectorIndex: 0,
                        judgmentPredicateRef: CONSENSUS_IDS.escalationFinalizerPredicateRef,
                        resultBearing: false,
                        requirement: {
                            kind: "interaction_leaf_requirement",
                            interactionKind: CONSENSUS_IDS.interactionKind,
                            actorCapabilityRef: CONSENSUS_IDS.actorCapabilityRef,
                            requestContractRef: CONSENSUS_IDS.resolutionContractRef,
                            responseContractRef: CONSENSUS_IDS.escalationDecisionContractRef,
                            continuationContractRef: CONSENSUS_IDS.continuationContractRef,
                        },
                    }), workflow.C(escalationFinalizerRef)),
                }],
            edges: [],
            applications: [],
        },
        effects: ["effect://abg/consensus/human-resolution@5"],
        declarations: {
            "abg.compute_regime": "mixed",
            "abg.closure_contract": CONSENSUS_IDS.finalizationClosureContractRef,
            "abg.child_closure_contract": CONSENSUS_IDS.finalizationClosureContractRef,
            "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
            "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
            "abg.judgment_predicate": CONSENSUS_IDS.escalationFinalizerPredicateRef,
            "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
        },
        tags: ["abiogenesis", "consensus", "fh-escalation"],
    };
    const escalationFinalizerGraphFunction = leafGraphFunction({
        name: CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
        graphRef: CONSENSUS_IDS.escalationFinalizerGraphRef,
        nodeRef: CONSENSUS_IDS.escalationFinalizerNodeRef,
        inputContractRef: CONSENSUS_IDS.escalationDecisionContractRef,
        outputContractRef: CONSENSUS_IDS.resolutionContractRef,
        bindingRef: CONSENSUS_IDS.escalationFinalizerImplementationBindingRef,
        predicateRef: CONSENSUS_IDS.escalationFinalizerPredicateRef,
        stageRole: "fh_escalation_finalization",
        fibre: "F_D",
        closureContractRef: CONSENSUS_IDS.finalizationClosureContractRef,
    });
    const oneSurfaceLeaf = (input, output, programLocusRef, stageRole, vectorIndex, implementationBindingRef, resultBearing = false) => C.of({
        input,
        output,
        programLocusRef,
        stageRole,
        fibre: "F_D",
        armId: `arm://${programLocusRef.slice("locus://".length)}`,
        compositionRef: CONSENSUS_IDS.oneSurfaceCompositionRef,
        vectorIndex,
        judgmentPredicateRef: CONSENSUS_IDS.oneSurfacePredicateRef,
        resultBearing,
        requirement: executableRequirement(implementationBindingRef, input.ref, output.ref),
    });
    const oneSurfaceWorkflowRef = cGraphFunctionRef({
        graphFunctionRef: CONSENSUS_IDS.graphFunctionRef,
        input: nextActionCarrier,
        output: actionEvaluationBasisCarrier,
    });
    const oneSurfaceTerm = C.compose(C.compose(C.compose(C.compose(oneSurfaceLeaf(observationCarrier, modelCarrier, CONSENSUS_IDS.synthesizeModelLocusRef, "synthesizeModel", 0, CONSENSUS_IDS.synthesizeModelImplementationBindingRef), oneSurfaceLeaf(modelCarrier, nextActionBasisCarrier, CONSENSUS_IDS.evalGapLocusRef, "evalGap", 1, CONSENSUS_IDS.evalGapImplementationBindingRef)), oneSurfaceLeaf(nextActionBasisCarrier, nextActionCarrier, CONSENSUS_IDS.evaluateNextLocusRef, "evaluateNext", 2, CONSENSUS_IDS.evaluateNextImplementationBindingRef)), workflow.C(oneSurfaceWorkflowRef)), C.compose(C.compose(oneSurfaceLeaf(actionEvaluationBasisCarrier, actionEvaluationCarrier, CONSENSUS_IDS.evaluateActionLocusRef, "evaluateAction", 4, CONSENSUS_IDS.evaluateActionImplementationBindingRef), oneSurfaceLeaf(actionEvaluationCarrier, modelCarrier, CONSENSUS_IDS.refreshModelLocusRef, "synthesizeModelRefresh", 5, CONSENSUS_IDS.refreshModelImplementationBindingRef)), C.compose(oneSurfaceLeaf(modelCarrier, nextActionBasisCarrier, CONSENSUS_IDS.refreshGapLocusRef, "evalGapRefresh", 6, CONSENSUS_IDS.refreshGapImplementationBindingRef), oneSurfaceLeaf(nextActionBasisCarrier, nextActionCarrier, CONSENSUS_IDS.refreshEvaluateNextLocusRef, "evaluateNextRefresh", 7, CONSENSUS_IDS.refreshEvaluateNextImplementationBindingRef))));
    const oneSurfaceGraphFunction = {
        kind: "graph_function",
        name: CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        version: "5.0.0",
        environment: {
            requires: [CONSENSUS_IDS.observationContractRef],
            provides: [CONSENSUS_IDS.nextActionContractRef],
            carries: [
                CONSENSUS_IDS.observationContractRef,
                CONSENSUS_IDS.modelContractRef,
                CONSENSUS_IDS.nextActionBasisContractRef,
                CONSENSUS_IDS.nextActionContractRef,
                CONSENSUS_IDS.actionEvaluationBasisContractRef,
                CONSENSUS_IDS.actionEvaluationContractRef,
                CONSENSUS_IDS.resultCandidateContractRef,
            ],
        },
        inputs: [CONSENSUS_IDS.observationContractRef],
        outputs: [CONSENSUS_IDS.nextActionContractRef],
        template: {
            kind: "inline_graph",
            graphRef: CONSENSUS_IDS.oneSurfaceGraphRef,
            startNodeRef: CONSENSUS_IDS.oneSurfaceNodeRef,
            terminalNodeRefs: [CONSENSUS_IDS.oneSurfaceNodeRef],
            nodes: [{
                    nodeRef: CONSENSUS_IDS.oneSurfaceNodeRef,
                    nodeKind: "c_locus",
                    term: oneSurfaceTerm,
                }],
            edges: [],
            applications: [],
        },
        effects: [
            "effect://abg/consensus/reviewer-worker@5",
            "effect://abg/consensus/submitter-worker@5",
            "effect://abg/consensus/human-resolution@5",
        ],
        declarations: {
            "abg.compute_regime": "mixed",
            "abg.closure_contract": CONSENSUS_IDS.oneSurfaceClosureContractRef,
            "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
            "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
            "abg.judgment_predicate": CONSENSUS_IDS.oneSurfacePredicateRef,
            "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
        },
        tags: ["abiogenesis", "system", "consensus", "one-surface"],
    };
    const graphFunctions = [
        rootGraphFunction,
        roundGraphFunction,
        reviewerGraphFunction,
        submitterGraphFunction,
        roundReducerGraphFunction,
        escalationGraphFunction,
        escalationFinalizerGraphFunction,
        oneSurfaceGraphFunction,
    ];
    const oneSurfaceCallableMembership = [
        CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        CONSENSUS_IDS.graphFunctionRef,
        CONSENSUS_IDS.roundGraphFunctionRef,
        CONSENSUS_IDS.reviewerGraphFunctionRef,
        CONSENSUS_IDS.submitterGraphFunctionRef,
        CONSENSUS_IDS.roundReducerGraphFunctionRef,
        CONSENSUS_IDS.escalationGraphFunctionRef,
        CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
    ];
    const actionCatalogBody = {
        kind: "action_catalog",
        schemaVersion: "5.0.0",
        rows: [{
                kind: "action_catalog_row",
                actionRef: CONSENSUS_IDS.consensusActionRef,
                actionKind: "invoke_graph_function",
                programRef: CONSENSUS_IDS.oneSurfaceProgramRef,
                graphFunctionRef: CONSENSUS_IDS.graphFunctionRef,
                targetProgramLocusRef: CONSENSUS_IDS.graphFunctionRef,
                targetObligationRefs: [CONSENSUS_IDS.consensusObligationRef],
                inputAssetRefs: [CONSENSUS_IDS.consensusInputAssetRef],
                outputAssetRefs: [CONSENSUS_IDS.consensusOutputAssetRef],
                expectedDeltaRef: CONSENSUS_IDS.consensusExpectedDeltaRef,
                progressConditionRef: CONSENSUS_IDS.consensusProgressConditionRef,
                stopConditionRef: CONSENSUS_IDS.consensusStopConditionRef,
            }],
    };
    const actionCatalogDigest = sha256Canonical(actionCatalogBody);
    const constructionCompositionBody = {
        kind: "construction_composition",
        schemaVersion: "5.0.0",
        compositionRef: CONSENSUS_IDS.oneSurfaceCompositionRef,
        graphFunctionRef: CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        authorities: [{
                kind: "construction_authority_binding",
                semanticAuthority: "synthesizeModel",
                authorityRef: CONSENSUS_IDS.synthesizeModelAuthorityRef,
                initialProgramLocusRef: CONSENSUS_IDS.synthesizeModelLocusRef,
                refreshProgramLocusRef: CONSENSUS_IDS.refreshModelLocusRef,
            }, {
                kind: "construction_authority_binding",
                semanticAuthority: "evalGap",
                authorityRef: CONSENSUS_IDS.evalGapAuthorityRef,
                initialProgramLocusRef: CONSENSUS_IDS.evalGapLocusRef,
                refreshProgramLocusRef: CONSENSUS_IDS.refreshGapLocusRef,
            }, {
                kind: "construction_authority_binding",
                semanticAuthority: "evaluateNext",
                authorityRef: CONSENSUS_IDS.evaluateNextAuthorityRef,
                initialProgramLocusRef: CONSENSUS_IDS.evaluateNextLocusRef,
                refreshProgramLocusRef: CONSENSUS_IDS.refreshEvaluateNextLocusRef,
            }, {
                kind: "construction_authority_binding",
                semanticAuthority: "evaluateAction",
                authorityRef: CONSENSUS_IDS.evaluateActionAuthorityRef,
                initialProgramLocusRef: CONSENSUS_IDS.evaluateActionLocusRef,
                refreshProgramLocusRef: null,
            }],
        interactionProgramLocusRef: CONSENSUS_IDS.graphFunctionRef,
        closurePolicy: consensusConstructionPolicy(),
    };
    const constructionCompositionDigest = sha256Canonical(constructionCompositionBody);
    const oneSurfaceProgram = {
        kind: "gtl_program",
        programRef: CONSENSUS_IDS.oneSurfaceProgramRef,
        version: "5.0.0",
        moduleRef: CONSENSUS_IDS.moduleRef,
        starts: [{
                startRef: CONSENSUS_IDS.oneSurfaceStartRef,
                graphFunctionRef: CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
            }],
        callableMembership: oneSurfaceCallableMembership,
        closureContractRef: CONSENSUS_IDS.oneSurfaceClosureContractRef,
        actionCatalog: {
            ...actionCatalogBody,
            catalogRef: `action-catalog://product/${actionCatalogDigest.slice("sha256:".length)}`,
            catalogDigest: actionCatalogDigest,
        },
        constructionComposition: {
            ...constructionCompositionBody,
            compositionDigest: constructionCompositionDigest,
        },
        policies: {
            "abg.root_mode": "supervised",
            "abg.owner": CONSENSUS_IDS.ownerRef,
            "abg.consensus.round_budget_max": "4",
        },
        publicAssetTargets: [{
                kind: "program_public_asset_target",
                handle: CONSENSUS_IDS.handle,
                assetRef: CONSENSUS_IDS.graphFunctionRef,
                startRef: CONSENSUS_IDS.oneSurfaceStartRef,
            }],
    };
    const contracts = CONSENSUS_NATIVE_CONTRACT_DEFINITIONS.map(({ validate: _validate, ...declaration }) => declaration);
    const binding = (bindingRef, implementationRef, namedSymbol, computeRegime, inputContractRef, outputContractRef) => ({
        kind: "implementation_binding",
        bindingRef,
        implementationRef,
        packageName: artifact.packageName,
        packageVersion: artifact.packageVersion,
        modulePath: "build/code/src/implementation/consensus.js",
        namedSymbol,
        computeRegime,
        inputContractRef,
        outputContractRef,
        failureContractRef: CONSENSUS_IDS.failureContractRef,
        refusalContractRef: CONSENSUS_IDS.refusalContractRef,
    });
    const implementationBindings = [
        binding(CONSENSUS_IDS.initializerImplementationBindingRef, CONSENSUS_IDS.initializerImplementationRef, "realizeConsensusInitialization", "F_D", CONSENSUS_IDS.invocationContractRef, CONSENSUS_IDS.stateContractRef),
        binding(CONSENSUS_IDS.roundEvaluatorImplementationBindingRef, CONSENSUS_IDS.roundEvaluatorImplementationRef, "realizeConsensusRoundEvaluation", "F_D", CONSENSUS_IDS.stateContractRef, CONSENSUS_IDS.stateContractRef),
        binding(CONSENSUS_IDS.reviewerImplementationBindingRef, CONSENSUS_IDS.reviewerImplementationRef, "realizeConsensusRole", "F_P", CONSENSUS_IDS.reviewerTaskContractRef, CONSENSUS_IDS.findingsContractRef),
        binding(CONSENSUS_IDS.submitterTaskImplementationBindingRef, CONSENSUS_IDS.submitterTaskImplementationRef, "realizeConsensusSubmitterTaskPreparation", "F_D", CONSENSUS_IDS.findingsVectorContractRef, CONSENSUS_IDS.submitterTaskContractRef),
        binding(CONSENSUS_IDS.submitterImplementationBindingRef, CONSENSUS_IDS.submitterImplementationRef, "realizeConsensusRole", "F_P", CONSENSUS_IDS.submitterTaskContractRef, CONSENSUS_IDS.submitterResponseContractRef),
        binding(CONSENSUS_IDS.reducerImplementationBindingRef, CONSENSUS_IDS.reducerImplementationRef, "realizeConsensusReduction", "F_D", CONSENSUS_IDS.submitterResponseContractRef, CONSENSUS_IDS.stateContractRef),
        binding(CONSENSUS_IDS.finalizationPreparationImplementationBindingRef, CONSENSUS_IDS.finalizationPreparationImplementationRef, "realizeConsensusFinalizationPreparation", "F_D", CONSENSUS_IDS.stateContractRef, CONSENSUS_IDS.resolutionContractRef),
        binding(CONSENSUS_IDS.finalizationEvaluatorImplementationBindingRef, CONSENSUS_IDS.finalizationEvaluatorImplementationRef, "realizeConsensusFinalizationEvaluation", "F_D", CONSENSUS_IDS.resolutionContractRef, CONSENSUS_IDS.resolutionContractRef),
        binding(CONSENSUS_IDS.projectorImplementationBindingRef, CONSENSUS_IDS.projectorImplementationRef, "realizeConsensusResultProjection", "F_D", CONSENSUS_IDS.resolutionContractRef, CONSENSUS_IDS.resultCandidateContractRef),
        binding(CONSENSUS_IDS.escalationFinalizerImplementationBindingRef, CONSENSUS_IDS.escalationFinalizerImplementationRef, "realizeConsensusEscalationFinalization", "F_D", CONSENSUS_IDS.escalationDecisionContractRef, CONSENSUS_IDS.resolutionContractRef),
        binding(CONSENSUS_IDS.synthesizeModelImplementationBindingRef, CONSENSUS_IDS.synthesizeModelImplementationRef, "realizeConsensusModelSynthesis", "F_D", CONSENSUS_IDS.observationContractRef, CONSENSUS_IDS.modelContractRef),
        binding(CONSENSUS_IDS.evalGapImplementationBindingRef, CONSENSUS_IDS.evalGapImplementationRef, "realizeConsensusGapEvaluation", "F_D", CONSENSUS_IDS.modelContractRef, CONSENSUS_IDS.nextActionBasisContractRef),
        binding(CONSENSUS_IDS.evaluateNextImplementationBindingRef, CONSENSUS_IDS.evaluateNextImplementationRef, "realizeConsensusNextActionSelection", "F_D", CONSENSUS_IDS.nextActionBasisContractRef, CONSENSUS_IDS.nextActionContractRef),
        binding(CONSENSUS_IDS.evaluateActionImplementationBindingRef, CONSENSUS_IDS.evaluateActionImplementationRef, "realizeConsensusActionEvaluation", "F_D", CONSENSUS_IDS.actionEvaluationBasisContractRef, CONSENSUS_IDS.actionEvaluationContractRef),
        binding(CONSENSUS_IDS.refreshModelImplementationBindingRef, CONSENSUS_IDS.refreshModelImplementationRef, "realizeConsensusModelRefresh", "F_D", CONSENSUS_IDS.actionEvaluationContractRef, CONSENSUS_IDS.modelContractRef),
        binding(CONSENSUS_IDS.refreshGapImplementationBindingRef, CONSENSUS_IDS.refreshGapImplementationRef, "realizeConsensusGapRefresh", "F_D", CONSENSUS_IDS.modelContractRef, CONSENSUS_IDS.nextActionBasisContractRef),
        binding(CONSENSUS_IDS.refreshEvaluateNextImplementationBindingRef, CONSENSUS_IDS.refreshEvaluateNextImplementationRef, "realizeConsensusNextActionRefresh", "F_D", CONSENSUS_IDS.nextActionBasisContractRef, CONSENSUS_IDS.nextActionContractRef),
    ];
    const closureContracts = [
        closure(CONSENSUS_IDS.rootClosureContractRef, "run", CONSENSUS_IDS.resultCandidateContractRef),
        closure(CONSENSUS_IDS.childClosureContractRef, "graph_call", CONSENSUS_IDS.stateContractRef),
        closure(CONSENSUS_IDS.reviewerClosureContractRef, "graph_call", CONSENSUS_IDS.findingsContractRef),
        closure(CONSENSUS_IDS.submitterClosureContractRef, "graph_call", CONSENSUS_IDS.submitterResponseContractRef),
        closure(CONSENSUS_IDS.resultClosureContractRef, "graph_call", CONSENSUS_IDS.resultCandidateContractRef),
        closure(CONSENSUS_IDS.finalizationClosureContractRef, "graph_call", CONSENSUS_IDS.resolutionContractRef),
        closure(CONSENSUS_IDS.oneSurfaceClosureContractRef, "run", CONSENSUS_IDS.nextActionContractRef),
    ];
    const contribution = (graphFunctionRef, handle = graphFunctionRef) => ({
        handle,
        kind: "graph_function",
        declarationOrContractRef: graphFunctionRef,
        owningProductId: artifact.productId,
        programMembershipRefs: [
            ...(oneSurfaceCallableMembership.includes(graphFunctionRef)
                ? [CONSENSUS_IDS.oneSurfaceProgramRef]
                : []),
        ],
        readinessPrerequisiteRefs: [
            ...(oneSurfaceCallableMembership.includes(graphFunctionRef)
                ? [CONSENSUS_IDS.oneSurfaceProgramRef]
                : []),
        ],
        compatibilityRefs: ["compatibility://abiogenesis/major/5"],
        provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    });
    const contributions = graphFunctions.map((graphFunction) => contribution(graphFunction.name, graphFunction.name === CONSENSUS_IDS.graphFunctionRef
        ? CONSENSUS_IDS.handle
        : graphFunction.name));
    const catalogSurface = (handle, kind, declarationOrContractRef, programMembershipRefs = []) => ({
        handle,
        kind,
        declarationOrContractRef,
        owningProductId: artifact.productId,
        programMembershipRefs,
        readinessPrerequisiteRefs: programMembershipRefs,
        compatibilityRefs: ["compatibility://abiogenesis/major/5"],
        provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    });
    contributions.push(catalogSurface(CONSENSUS_IDS.subjectCatalogHandle, "node_type", CONSENSUS_IDS.subjectContractRef), catalogSurface(CONSENSUS_IDS.reviewerProfileCatalogHandle, "node_type", CONSENSUS_IDS.profileContractRef), catalogSurface(CONSENSUS_IDS.reviewerInstructionCatalogHandle, "node_type", CONSENSUS_IDS.reviewerInstructionContractRef), catalogSurface(CONSENSUS_IDS.submitterProfileCatalogHandle, "node_type", CONSENSUS_IDS.submitterProfileContractRef), catalogSurface(CONSENSUS_IDS.submitterInstructionCatalogHandle, "node_type", CONSENSUS_IDS.submitterInstructionContractRef), catalogSurface(CONSENSUS_IDS.policyCatalogHandle, "node_type", CONSENSUS_IDS.policyContractRef), catalogSurface(CONSENSUS_IDS.rulingOverlayCatalogHandle, "overlay", CONSENSUS_IDS.rulingOverlayContractRef, [CONSENSUS_IDS.oneSurfaceProgramRef]));
    return modulePublication({
        kind: "module_publication",
        moduleRef: CONSENSUS_IDS.moduleRef,
        moduleVersion: "5.0.0",
        owningProductId: artifact.productId,
        artifactDigest: artifact.artifactDigest,
        productContentDigest: artifact.productContentDigest,
        productManifestDigest: artifact.productManifestDigest,
        descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice("sha256:".length)}`,
        contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice("sha256:".length)}`,
        productSemanticsBinding: productSemanticsBinding({
            kind: "product_semantics_binding",
            bindingRef: CONSENSUS_IDS.productSemanticsBindingRef,
            packageName: artifact.packageName,
            packageVersion: artifact.packageVersion,
            modulePath: "build/code/src/product/builtin_semantics.js",
            namedSymbol: "ABI5_SYSTEM_PRODUCT_SEMANTICS",
        }),
        contracts,
        evaluators: [
            evaluatorDeclaration({
                name: CONSENSUS_IDS.roundEvaluatorRef,
                regime: "F_D",
                description: "Evaluates the declared Consensus round terminal field.",
                binding: CONSENSUS_IDS.roundEvaluatorImplementationRef,
                consumedFieldRefs: ["$.terminal"],
                tags: ["consensus", "bounded", "recursion"],
            }),
            evaluatorDeclaration({
                name: CONSENSUS_IDS.finalizationEvaluatorRef,
                regime: "F_D",
                description: "Evaluates whether Consensus finalization is complete or requires the same-Run F_H child.",
                binding: CONSENSUS_IDS.finalizationEvaluatorImplementationRef,
                consumedFieldRefs: ["$.resolutionTerminal"],
                tags: ["consensus", "finalization", "same-run"],
            }),
        ],
        rules: [
            ruleDeclaration({
                name: CONSENSUS_IDS.roundTerminationRuleRef,
                kind: "boolean_field_termination",
                config: {
                    fieldRef: "$.terminal",
                    terminalValue: true,
                },
                tags: ["consensus", "bounded", "recursion"],
            }),
            ruleDeclaration({
                name: CONSENSUS_IDS.finalizationTerminationRuleRef,
                kind: "boolean_field_termination",
                config: {
                    fieldRef: "$.resolutionTerminal",
                    terminalValue: true,
                },
                tags: ["consensus", "finalization", "same-run"],
            }),
        ],
        implementationBindings,
        closureContracts,
        programs: [oneSurfaceProgram],
        graphFunctions,
        contributions,
    });
}
