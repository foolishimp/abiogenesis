import { CONSENSUS_IDS, constructConsensusSubmitterTask, evaluateConsensusAction, evaluateConsensusGap, finalizeConsensusEscalation, initializeConsensus, isConsensusActionEvaluationBasis, isConsensusActionEvaluationProjection, isConsensusEscalationDecision, isConsensusFindingsVector, isConsensusResolution, isConsensusInvocation, isConsensusNextActionBasis, isConsensusObservationSnapshot, isConsensusReviewerCandidate, isConsensusReviewerTask, isConsensusRoleTask, isConsensusRoundState, isConsensusSubmitterResponse, isConsensusSubmitterResponseCandidate, isConsensusSubmitterTask, prepareConsensusResolution, projectConsensusFinalResult, refreshConsensusGap, refreshConsensusModel, refreshConsensusNextAction, reduceConsensusRound, selectConsensusNextAction, synthesizeConsensusModel, } from "../gtl/consensus.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function descriptor(input) {
    const body = {
        ...input,
        packageName: ABI5_PACKAGE_NAME,
        packageVersion: ABI5_PACKAGE_VERSION,
        modulePath: "build/code/src/implementation/consensus.js",
        failureContractRef: CONSENSUS_IDS.failureContractRef,
        refusalContractRef: CONSENSUS_IDS.refusalContractRef,
    };
    return deepFreeze({
        kind: "packaged_leaf_implementation_descriptor",
        schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(body),
        ...body,
    });
}
export const CONSENSUS_INITIALIZER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.initializerImplementationRef,
    namedSymbol: "realizeConsensusInitialization",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.invocationContractRef,
    outputContractRef: CONSENSUS_IDS.stateContractRef,
});
export const CONSENSUS_ROUND_EVALUATOR_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.roundEvaluatorImplementationRef,
    namedSymbol: "realizeConsensusRoundEvaluation",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.stateContractRef,
    outputContractRef: CONSENSUS_IDS.stateContractRef,
});
export const CONSENSUS_REVIEWER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.reviewerImplementationRef,
    namedSymbol: "realizeConsensusRole",
    computeRegime: "F_P",
    inputContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
    outputContractRef: CONSENSUS_IDS.findingsContractRef,
});
export const CONSENSUS_SUBMITTER_TASK_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.submitterTaskImplementationRef,
    namedSymbol: "realizeConsensusSubmitterTaskPreparation",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
    outputContractRef: CONSENSUS_IDS.submitterTaskContractRef,
});
export const CONSENSUS_SUBMITTER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.submitterImplementationRef,
    namedSymbol: "realizeConsensusRole",
    computeRegime: "F_P",
    inputContractRef: CONSENSUS_IDS.submitterTaskContractRef,
    outputContractRef: CONSENSUS_IDS.submitterResponseContractRef,
});
export const CONSENSUS_REDUCER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.reducerImplementationRef,
    namedSymbol: "realizeConsensusReduction",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.submitterResponseContractRef,
    outputContractRef: CONSENSUS_IDS.stateContractRef,
});
export const CONSENSUS_FINALIZATION_PREPARATION_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.finalizationPreparationImplementationRef,
    namedSymbol: "realizeConsensusFinalizationPreparation",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.stateContractRef,
    outputContractRef: CONSENSUS_IDS.resolutionContractRef,
});
export const CONSENSUS_FINALIZATION_EVALUATOR_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.finalizationEvaluatorImplementationRef,
    namedSymbol: "realizeConsensusFinalizationEvaluation",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.resolutionContractRef,
    outputContractRef: CONSENSUS_IDS.resolutionContractRef,
});
export const CONSENSUS_PROJECTOR_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.projectorImplementationRef,
    namedSymbol: "realizeConsensusResultProjection",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.resolutionContractRef,
    outputContractRef: CONSENSUS_IDS.resultCandidateContractRef,
});
export const CONSENSUS_ESCALATION_FINALIZER_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.escalationFinalizerImplementationRef,
    namedSymbol: "realizeConsensusEscalationFinalization",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.escalationDecisionContractRef,
    outputContractRef: CONSENSUS_IDS.resolutionContractRef,
});
export const CONSENSUS_SYNTHESIZE_MODEL_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.synthesizeModelImplementationRef,
    namedSymbol: "realizeConsensusModelSynthesis",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.observationContractRef,
    outputContractRef: CONSENSUS_IDS.modelContractRef,
});
export const CONSENSUS_EVAL_GAP_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.evalGapImplementationRef,
    namedSymbol: "realizeConsensusGapEvaluation",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.modelContractRef,
    outputContractRef: CONSENSUS_IDS.nextActionBasisContractRef,
});
export const CONSENSUS_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.evaluateNextImplementationRef,
    namedSymbol: "realizeConsensusNextActionSelection",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.nextActionBasisContractRef,
    outputContractRef: CONSENSUS_IDS.nextActionContractRef,
});
export const CONSENSUS_EVALUATE_ACTION_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.evaluateActionImplementationRef,
    namedSymbol: "realizeConsensusActionEvaluation",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.actionEvaluationBasisContractRef,
    outputContractRef: CONSENSUS_IDS.actionEvaluationContractRef,
});
export const CONSENSUS_REFRESH_MODEL_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.refreshModelImplementationRef,
    namedSymbol: "realizeConsensusModelRefresh",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.actionEvaluationContractRef,
    outputContractRef: CONSENSUS_IDS.modelContractRef,
});
export const CONSENSUS_REFRESH_GAP_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.refreshGapImplementationRef,
    namedSymbol: "realizeConsensusGapRefresh",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.modelContractRef,
    outputContractRef: CONSENSUS_IDS.nextActionBasisContractRef,
});
export const CONSENSUS_REFRESH_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR = descriptor({
    implementationRef: CONSENSUS_IDS.refreshEvaluateNextImplementationRef,
    namedSymbol: "realizeConsensusNextActionRefresh",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.nextActionBasisContractRef,
    outputContractRef: CONSENSUS_IDS.nextActionContractRef,
});
function deterministicSuccess(implementationRef, input, resultCandidate) {
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [{
                kind: "deterministic_evidence_candidate",
                schemaVersion: "5.0.0",
                implementationRef,
                inputDigest: sha256Canonical(input),
                outputDigest: sha256Canonical(resultCandidate),
            }],
        resultCandidate,
    });
}
export function realizeConsensusInitialization(input) {
    if (!isConsensusInvocation(input)) {
        throw new TypeError("Consensus initializer requires one exact admitted invocation");
    }
    const result = initializeConsensus(input);
    return deterministicSuccess(CONSENSUS_IDS.initializerImplementationRef, input, result);
}
export function realizeConsensusRoundEvaluation(input) {
    if (!isConsensusRoundState(input)) {
        throw new TypeError("Consensus round evaluator requires one exact admitted state");
    }
    return deterministicSuccess(CONSENSUS_IDS.roundEvaluatorImplementationRef, input, input);
}
function rolePrompt(role, input) {
    const common = [
        input.instruction.instructionText,
        `Instruction contract: ${input.instruction.instructionContractRef}`,
        `Instruction digest: ${input.instruction.instructionDigest}`,
        `Subject: ${input.subject.subjectRef}`,
        `Subject digest: ${input.subject.subjectDigest}`,
        `Subject media type: ${input.subjectMaterialization.mediaType}`,
        "Subject materialization:",
        input.subjectMaterialization.content,
        "End subject materialization.",
        `Round: ${input.roundOrdinal}`,
        `Profile: ${input.profile.profileRef}`,
        `Profile configuration: ${input.profile.configurationDigest}`,
        `Role contract: ${input.profile.roleContractRef}`,
        `Capabilities: ${input.profile.capabilityRefs.join(", ")}`,
    ];
    if (role === "reviewer") {
        const task = input;
        return [
            ...common,
            `Prior findings: ${task.priorFindingSetRefs.join(", ") || "none"}`,
            `Prior submitter responses: ${task.priorSubmitterResponses.length === 0
                ? "none"
                : JSON.stringify(task.priorSubmitterResponses)}`,
            `Task: ${JSON.stringify(task)}`,
            "Return only the declared reviewer candidate JSON.",
        ].join("\n");
    }
    const task = input;
    return [
        ...common,
        `Submitting actor: ${task.profile.actorRef}`,
        `Prior rounds: ${task.priorRoundRefs.join(", ") || "none"}`,
        `Prior submitter responses: ${task.priorSubmitterResponseRefs.join(", ") || "none"}`,
        `Admitted reviewer findings vector: ${JSON.stringify(task.findingsVector)}`,
        `Task: ${JSON.stringify(task)}`,
        "Return only the declared submitter response candidate JSON.",
    ].join("\n");
}
function parseRoleCandidate(role, output) {
    try {
        const value = JSON.parse(output);
        return role === "reviewer"
            ? (isConsensusReviewerCandidate(value) ? value : null)
            : (isConsensusSubmitterResponseCandidate(value) ? value : null);
    }
    catch {
        return null;
    }
}
function finding(task, semantic, ordinal, transportDigest) {
    const body = {
        profileRef: task.profile.profileRef,
        roundRef: task.roundRef,
        ordinal,
        findingContractRef: semantic.findingContractRef,
        findingPayloadRef: semantic.findingPayloadRef,
    };
    const digest = sha256Canonical(body);
    return deepFreeze({
        findingRef: `review-finding://abg/${digest.slice("sha256:".length)}`,
        findingContractRef: semantic.findingContractRef,
        findingPayloadRef: semantic.findingPayloadRef,
        evidenceRefs: [
            `transport-evidence://abg/${transportDigest.slice("sha256:".length)}`,
        ],
    });
}
function projectReviewerRoleResult(input, occurrence, transport, semantic) {
    if (semantic === null) {
        const diagnosticRef = "diagnostic://abg/consensus/reviewer-output-refused@5";
        const evidenceRef = `transport-evidence://abg/${transport.transportDigest.slice("sha256:".length)}`;
        const body = {
            kind: "review_findings",
            schemaVersion: "5.0.0",
            reviewerTaskRef: input.taskRef,
            reviewerTaskDigest: input.taskDigest,
            panelRef: input.panel.panelRef,
            panelPosition: input.panelPosition,
            cCallRef: occurrence.cCallRef,
            cCallAttempt: occurrence.attempt,
            profileRef: input.profile.profileRef,
            configurationDigest: input.profile.configurationDigest,
            invocationRef: input.invocationRef,
            roundRef: input.roundRef,
            roundOrdinal: input.roundOrdinal,
            recommendation: "revise",
            evidenceRefs: [evidenceRef],
            findings: [],
            residualRefs: [diagnosticRef],
            refusalRef: diagnosticRef,
            task: input,
        };
        const resultCandidate = deepFreeze({
            ...body,
            outputDigest: sha256Canonical(body),
        });
        return deepFreeze({
            kind: "leaf_realization_candidate",
            schemaVersion: "5.0.0",
            disposition: "success",
            evidenceCandidates: [],
            resultCandidate: resultCandidate,
        });
    }
    const evidenceRef = `transport-evidence://abg/${transport.transportDigest.slice("sha256:".length)}`;
    const body = {
        kind: "review_findings",
        schemaVersion: "5.0.0",
        reviewerTaskRef: input.taskRef,
        reviewerTaskDigest: input.taskDigest,
        panelRef: input.panel.panelRef,
        panelPosition: input.panelPosition,
        cCallRef: occurrence.cCallRef,
        cCallAttempt: occurrence.attempt,
        profileRef: input.profile.profileRef,
        configurationDigest: input.profile.configurationDigest,
        invocationRef: input.invocationRef,
        roundRef: input.roundRef,
        roundOrdinal: input.roundOrdinal,
        recommendation: semantic.recommendation,
        evidenceRefs: [evidenceRef],
        findings: semantic.findings.map((row, ordinal) => finding(input, row, ordinal, transport.transportDigest)),
        residualRefs: [...semantic.residualRefs],
        refusalRef: null,
        task: input,
    };
    const resultCandidate = deepFreeze({
        ...body,
        outputDigest: sha256Canonical(body),
    });
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [],
        resultCandidate: resultCandidate,
    });
}
export function realizeConsensusSubmitterTaskPreparation(input) {
    if (!isConsensusFindingsVector(input)) {
        throw new TypeError("Consensus submitter preparation requires one exact findings vector");
    }
    const result = constructConsensusSubmitterTask(input);
    return deterministicSuccess(CONSENSUS_IDS.submitterTaskImplementationRef, input, result);
}
function projectSubmitterRoleResult(input, transport, semantic) {
    if (semantic === null) {
        const diagnosticRef = "diagnostic://abg/consensus/submitter-output-refused@5";
        return deepFreeze({
            kind: "leaf_realization_candidate",
            schemaVersion: "5.0.0",
            disposition: "failure",
            evidenceCandidates: [],
            resultCandidate: deepFreeze({
                kind: "consensus_failure",
                schemaVersion: "5.0.0",
                failureClass: "result_contract_failure",
                diagnosticRef,
            }),
            diagnosticRef,
        });
    }
    const evidenceRef = `transport-evidence://abg/${transport.transportDigest.slice("sha256:".length)}`;
    const responseBody = {
        invocationRef: input.invocationRef,
        findingsVectorDigest: sha256Canonical(input.findingsVector),
        roundRef: input.roundRef,
        roundOrdinal: input.roundOrdinal,
        submittingActorRef: input.profile.actorRef,
        profileRef: input.profile.profileRef,
        disposition: semantic.disposition,
        responseText: semantic.responseText,
        addressedFindingRefs: [...semantic.addressedFindingRefs],
        residualFindingRefs: [...semantic.residualFindingRefs],
        evidenceRefs: [evidenceRef],
    };
    const outputDigest = sha256Canonical(responseBody);
    const resultCandidate = deepFreeze({
        kind: "consensus_submitter_response",
        schemaVersion: "5.0.0",
        configurationDigest: input.profile.configurationDigest,
        task: input,
        ...responseBody,
        responseRef: `submitter-response://abg/${outputDigest.slice("sha256:".length)}`,
        outputDigest,
    });
    if (!isConsensusSubmitterResponse(resultCandidate)) {
        const diagnosticRef = "diagnostic://abg/consensus/submitter-response-basis-refused@5";
        return deepFreeze({
            kind: "leaf_realization_candidate",
            schemaVersion: "5.0.0",
            disposition: "failure",
            evidenceCandidates: [],
            resultCandidate: deepFreeze({
                kind: "consensus_failure",
                schemaVersion: "5.0.0",
                failureClass: "result_contract_failure",
                diagnosticRef,
            }),
            diagnosticRef,
        });
    }
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "success",
        evidenceCandidates: [],
        resultCandidate: resultCandidate,
    });
}
function roleFailure(role, failureClass) {
    const diagnosticRef = `diagnostic://abg/consensus/${role}-transport-${failureClass.replaceAll("_", "-")}@5`;
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "failure",
        evidenceCandidates: [],
        resultCandidate: deepFreeze({
            kind: "consensus_failure",
            schemaVersion: "5.0.0",
            failureClass,
            diagnosticRef,
        }),
        diagnosticRef,
    });
}
export function realizeConsensusRole(input, occurrence) {
    const role = isConsensusRoleTask("reviewer", input)
        ? "reviewer"
        : isConsensusRoleTask("submitter", input)
            ? "submitter"
            : null;
    if (role === null) {
        throw new TypeError("Consensus role evaluation requires one exact attributed role task");
    }
    const implementationRef = role === "reviewer"
        ? CONSENSUS_IDS.reviewerImplementationRef
        : CONSENSUS_IDS.submitterImplementationRef;
    const promptKind = role === "reviewer"
        ? "reviewer-prompt"
        : "submitter-response";
    const workerRequest = deepFreeze({
        actorRef: input.profile.actorRef,
        workerBindingRef: input.profile.workerBindingRef,
        implementationRef,
        inputDigest: sha256Canonical(input),
        materializationPlanRef: `materialization-plan://abg/consensus/${promptKind}@5`,
        rendererRef: `renderer://abg/consensus/${promptKind}@5`,
        instructionContractRef: input.profile.instructionContractRef,
        resultContractRef: input.profile.resultContractRef,
        transportLane: input.transportLane,
        prompt: rolePrompt(role, input),
        responseJsonSchema: input.instruction.responseSchema,
    });
    return deepFreeze({
        kind: "prepared_probabilistic_leaf_invocation",
        schemaVersion: "5.0.0",
        workerRequest,
        complete(actorProcessExchange) {
            const transport = actorProcessExchange.observation;
            const semantic = parseRoleCandidate(role, transport.finalOutput);
            const salvaged = transport.disposition === "failure" &&
                transport.failureClass === "transport_failure" &&
                semantic !== null;
            return transport.disposition !== "success" && !salvaged
                ? roleFailure(role, transport.failureClass ?? "transport_failure")
                : role === "reviewer"
                    ? projectReviewerRoleResult(input, occurrence, transport, semantic)
                    : projectSubmitterRoleResult(input, transport, semantic);
        },
    });
}
export function realizeConsensusReduction(input) {
    if (!isConsensusSubmitterResponse(input)) {
        throw new TypeError("Consensus reducer requires one exact admitted submitter response");
    }
    const result = reduceConsensusRound(input);
    return deterministicSuccess(CONSENSUS_IDS.reducerImplementationRef, input, result);
}
export function realizeConsensusFinalizationPreparation(input) {
    if (!isConsensusRoundState(input)) {
        throw new TypeError("Consensus finalization preparation requires one exact terminal round state");
    }
    const result = prepareConsensusResolution(input);
    return deterministicSuccess(CONSENSUS_IDS.finalizationPreparationImplementationRef, input, result);
}
export function realizeConsensusFinalizationEvaluation(input) {
    if (!isConsensusResolution(input)) {
        throw new TypeError("Consensus finalization evaluation requires one exact finalization state");
    }
    return deterministicSuccess(CONSENSUS_IDS.finalizationEvaluatorImplementationRef, input, input);
}
export function realizeConsensusResultProjection(input) {
    if (!isConsensusResolution(input)) {
        throw new TypeError("Consensus result projector requires one exact terminal finalization state");
    }
    const result = projectConsensusFinalResult(input);
    return deterministicSuccess(CONSENSUS_IDS.projectorImplementationRef, input, result);
}
export function realizeConsensusEscalationFinalization(input) {
    if (!isConsensusEscalationDecision(input)) {
        throw new TypeError("Consensus escalation finalizer requires one exact human decision");
    }
    const result = finalizeConsensusEscalation(input);
    return deterministicSuccess(CONSENSUS_IDS.escalationFinalizerImplementationRef, input, result);
}
export function realizeConsensusModelSynthesis(input) {
    if (!isConsensusObservationSnapshot(input)) {
        throw new TypeError("Consensus model synthesis requires one admitted observation");
    }
    return deterministicSuccess(CONSENSUS_IDS.synthesizeModelImplementationRef, input, synthesizeConsensusModel(input));
}
export function realizeConsensusGapEvaluation(input) {
    if (!isConsensusObservationSnapshot(input)) {
        throw new TypeError("Consensus gap evaluation requires one admitted observation");
    }
    return deterministicSuccess(CONSENSUS_IDS.evalGapImplementationRef, input, evaluateConsensusGap(input));
}
export function realizeConsensusNextActionSelection(input) {
    if (!isConsensusNextActionBasis(input)) {
        throw new TypeError("Consensus action selection requires one admitted basis");
    }
    return deterministicSuccess(CONSENSUS_IDS.evaluateNextImplementationRef, input, selectConsensusNextAction(input));
}
export function realizeConsensusActionEvaluation(input) {
    if (!isConsensusActionEvaluationBasis(input)) {
        throw new TypeError("Consensus action evaluation requires admitted child evidence");
    }
    return deterministicSuccess(CONSENSUS_IDS.evaluateActionImplementationRef, input, evaluateConsensusAction(input));
}
export function realizeConsensusModelRefresh(input) {
    if (!isConsensusActionEvaluationProjection(input)) {
        throw new TypeError("Consensus model refresh requires one admitted action evaluation");
    }
    return deterministicSuccess(CONSENSUS_IDS.refreshModelImplementationRef, input, refreshConsensusModel(input));
}
export function realizeConsensusGapRefresh(input) {
    if (!isConsensusObservationSnapshot(input)) {
        throw new TypeError("Consensus gap refresh requires one refreshed observation");
    }
    return deterministicSuccess(CONSENSUS_IDS.refreshGapImplementationRef, input, refreshConsensusGap(input));
}
export function realizeConsensusNextActionRefresh(input) {
    if (!isConsensusNextActionBasis(input)) {
        throw new TypeError("Consensus convergence requires one refreshed basis");
    }
    return deterministicSuccess(CONSENSUS_IDS.refreshEvaluateNextImplementationRef, input, refreshConsensusNextAction(input));
}
