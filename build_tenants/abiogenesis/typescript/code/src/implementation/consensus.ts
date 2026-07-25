import {
  CONSENSUS_IDS,
  evaluateConsensusAction,
  evaluateConsensusGap,
  finalizeConsensusEscalation,
  initializeConsensus,
  isConsensusActionEvaluationBasis,
  isConsensusActionEvaluationProjection,
  isConsensusEscalationDecision,
  isConsensusFindingsVector,
  isConsensusInvocation,
  isConsensusNextActionBasis,
  isConsensusObservationSnapshot,
  isConsensusReviewerTask,
  isConsensusRoundState,
  projectConsensusResult,
  refreshConsensusGap,
  refreshConsensusModel,
  refreshConsensusNextAction,
  reduceConsensusRound,
  selectConsensusNextAction,
  synthesizeConsensusModel,
  type ConsensusEscalationDecision,
  type ConsensusFindingsVector,
  type ConsensusInvocation,
  type ConsensusReviewerTask,
  type ConsensusRoundState,
  type ReviewFinding,
  type ReviewFindings,
} from "../gtl/consensus.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProbabilisticLeafEffectPort } from "./contracts.js";

interface ConsensusLeafCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure" | "success";
  readonly evidenceCandidates: readonly [];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef?: string;
}

interface ReviewerSemanticCandidate {
  readonly kind: "consensus_reviewer_candidate";
  readonly schemaVersion: "5.0.0";
  readonly recommendation: "accept" | "revise";
  readonly findings: readonly {
    readonly findingContractRef: string;
    readonly findingPayloadRef: string;
  }[];
  readonly residualRefs: readonly string[];
}

function descriptor(input: {
  readonly implementationRef: string;
  readonly namedSymbol: string;
  readonly computeRegime: "F_D" | "F_P";
  readonly inputContractRef: string;
  readonly outputContractRef: string;
}): PackagedLeafImplementationDescriptor {
  const body = {
    ...input,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/consensus.js",
    failureContractRef: CONSENSUS_IDS.failureContractRef,
    refusalContractRef: CONSENSUS_IDS.refusalContractRef,
  };
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(body),
    ...body,
  }) as PackagedLeafImplementationDescriptor;
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
  namedSymbol: "realizeConsensusReviewer",
  computeRegime: "F_P",
  inputContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
  outputContractRef: CONSENSUS_IDS.findingsContractRef,
});

export const CONSENSUS_REDUCER_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: CONSENSUS_IDS.reducerImplementationRef,
  namedSymbol: "realizeConsensusReduction",
  computeRegime: "F_D",
  inputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
  outputContractRef: CONSENSUS_IDS.stateContractRef,
});

export const CONSENSUS_PROJECTOR_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: CONSENSUS_IDS.projectorImplementationRef,
  namedSymbol: "realizeConsensusResultProjection",
  computeRegime: "F_D",
  inputContractRef: CONSENSUS_IDS.stateContractRef,
  outputContractRef: CONSENSUS_IDS.resultContractRef,
});

export const CONSENSUS_ESCALATION_FINALIZER_IMPLEMENTATION_DESCRIPTOR =
  descriptor({
    implementationRef: CONSENSUS_IDS.escalationFinalizerImplementationRef,
    namedSymbol: "realizeConsensusEscalationFinalization",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.escalationDecisionContractRef,
    outputContractRef: CONSENSUS_IDS.resultContractRef,
  });

export const CONSENSUS_SYNTHESIZE_MODEL_IMPLEMENTATION_DESCRIPTOR =
  descriptor({
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

export const CONSENSUS_REFRESH_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR =
  descriptor({
    implementationRef:
      CONSENSUS_IDS.refreshEvaluateNextImplementationRef,
    namedSymbol: "realizeConsensusNextActionRefresh",
    computeRegime: "F_D",
    inputContractRef: CONSENSUS_IDS.nextActionBasisContractRef,
    outputContractRef: CONSENSUS_IDS.nextActionContractRef,
  });

function deterministicSuccess(
  implementationRef: string,
  input: Readonly<Record<string, JsonValue>>,
  resultCandidate: Readonly<Record<string, JsonValue>>,
) {
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function realizeConsensusInitialization(
  input: Readonly<ConsensusInvocation>,
) {
  if (!isConsensusInvocation(input)) {
    throw new TypeError(
      "Consensus initializer requires one exact admitted invocation",
    );
  }
  const result = initializeConsensus(input);
  return deterministicSuccess(
    CONSENSUS_IDS.initializerImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export function realizeConsensusRoundEvaluation(
  input: Readonly<ConsensusRoundState>,
) {
  if (!isConsensusRoundState(input)) {
    throw new TypeError(
      "Consensus round evaluator requires one exact admitted state",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.roundEvaluatorImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    input as unknown as Readonly<Record<string, JsonValue>>,
  );
}

function reviewerPrompt(input: Readonly<ConsensusReviewerTask>): string {
  return [
    "Evaluate the exact Consensus subject under the attributed reviewer profile.",
    `Subject: ${input.subject.subjectRef}`,
    `Subject digest: ${input.subject.subjectDigest}`,
    `Round: ${input.roundOrdinal}`,
    `Profile: ${input.profile.profileRef}`,
    `Profile configuration: ${input.profile.configurationDigest}`,
    `Role contract: ${input.profile.roleContractRef}`,
    `Capabilities: ${input.profile.capabilityRefs.join(", ")}`,
    `Prior findings: ${input.priorFindingSetRefs.join(", ") || "none"}`,
    `Task: ${JSON.stringify(input)}`,
    "Return only the declared reviewer candidate JSON.",
  ].join("\n");
}

function reviewerResponseSchema(): Readonly<Record<string, JsonValue>> {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "kind",
      "schemaVersion",
      "recommendation",
      "findings",
      "residualRefs",
    ],
    properties: {
      kind: { const: "consensus_reviewer_candidate" },
      schemaVersion: { const: "5.0.0" },
      recommendation: { enum: ["accept", "revise"] },
      findings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["findingContractRef", "findingPayloadRef"],
          properties: {
            findingContractRef: { type: "string", minLength: 1 },
            findingPayloadRef: { type: "string", minLength: 1 },
          },
        },
      },
      residualRefs: {
        type: "array",
        items: { type: "string", minLength: 1 },
        uniqueItems: true,
      },
    },
  } as Readonly<Record<string, JsonValue>>;
}

function isSemanticCandidate(value: unknown): value is ReviewerSemanticCandidate {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) return false;
  const candidate = value as Partial<ReviewerSemanticCandidate>;
  if (
    Object.keys(value).sort().join("\0") !==
      [
        "findings",
        "kind",
        "recommendation",
        "residualRefs",
        "schemaVersion",
      ].sort().join("\0") ||
    candidate.kind !== "consensus_reviewer_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    !["accept", "revise"].includes(String(candidate.recommendation)) ||
    !Array.isArray(candidate.findings) ||
    !Array.isArray(candidate.residualRefs) ||
    !candidate.residualRefs.every(
      (ref) => typeof ref === "string" && ref.length > 0,
    ) ||
    new Set(candidate.residualRefs).size !== candidate.residualRefs.length ||
    !candidate.findings.every((finding) =>
      typeof finding === "object" &&
      finding !== null &&
      !Array.isArray(finding) &&
      Object.keys(finding).sort().join("\0") ===
        ["findingContractRef", "findingPayloadRef"].sort().join("\0") &&
      typeof finding.findingContractRef === "string" &&
      finding.findingContractRef.length > 0 &&
      typeof finding.findingPayloadRef === "string" &&
      finding.findingPayloadRef.length > 0
    )
  ) return false;
  return candidate.recommendation === "accept"
    ? candidate.findings.length === 0
    : candidate.findings.length > 0;
}

function parseSemanticCandidate(output: string): ReviewerSemanticCandidate | null {
  try {
    const value = JSON.parse(output) as unknown;
    return isSemanticCandidate(value) ? value : null;
  } catch {
    return null;
  }
}

function finding(
  task: Readonly<ConsensusReviewerTask>,
  semantic: ReviewerSemanticCandidate["findings"][number],
  ordinal: number,
  transportDigest: string,
): Readonly<ReviewFinding> {
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

export async function realizeConsensusReviewer(
  input: Readonly<ConsensusReviewerTask>,
  effects: Readonly<ProbabilisticLeafEffectPort>,
): Promise<Readonly<ConsensusLeafCandidate>> {
  if (!isConsensusReviewerTask(input)) {
    throw new TypeError(
      "Consensus reviewer requires one exact attributed reviewer task",
    );
  }
  const transport = await effects.invokeWorker({
    actorRef: input.profile.actorRef,
    workerBindingRef: input.profile.workerBindingRef,
    implementationRef: CONSENSUS_IDS.reviewerImplementationRef,
    inputDigest: sha256Canonical(input as unknown as JsonValue),
    materializationPlanRef:
      "materialization-plan://abg/consensus/reviewer-prompt@5",
    rendererRef: "renderer://abg/consensus/reviewer-prompt@5",
    instructionContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
    resultContractRef: input.profile.resultContractRef,
    transportLane: input.transportLane,
    prompt: reviewerPrompt(input),
    responseJsonSchema: reviewerResponseSchema(),
  });
  const semantic = parseSemanticCandidate(transport.finalOutput);
  if (transport.disposition !== "success" || semantic === null) {
    const diagnosticRef =
      "diagnostic://abg/consensus/reviewer-output-refused@5";
    return deepFreeze({
      kind: "leaf_realization_candidate" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "failure" as const,
      evidenceCandidates: [] as const,
      resultCandidate: {
        kind: "consensus_failure",
        schemaVersion: "5.0.0",
        failureClass: transport.failureClass ?? "invalid_reviewer_output",
        diagnosticRef,
      },
      diagnosticRef,
    });
  }
  const evidenceRef =
    `transport-evidence://abg/${transport.transportDigest.slice("sha256:".length)}`;
  const body = {
    kind: "review_findings" as const,
    schemaVersion: "5.0.0" as const,
    profileRef: input.profile.profileRef,
    configurationDigest: input.profile.configurationDigest,
    invocationRef: input.invocationRef,
    roundRef: input.roundRef,
    roundOrdinal: input.roundOrdinal,
    recommendation: semantic.recommendation,
    evidenceRefs: [evidenceRef],
    findings: semantic.findings.map((row, ordinal) =>
      finding(input, row, ordinal, transport.transportDigest)),
    residualRefs: [...semantic.residualRefs],
    refusalRef: null,
    task: input,
  };
  const resultCandidate: ReviewFindings = deepFreeze({
    ...body,
    outputDigest: sha256Canonical(body as unknown as JsonValue),
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [] as const,
    resultCandidate:
      resultCandidate as unknown as Readonly<Record<string, JsonValue>>,
  });
}

export function realizeConsensusReduction(
  input: Readonly<ConsensusFindingsVector>,
) {
  if (!isConsensusFindingsVector(input)) {
    throw new TypeError(
      "Consensus reducer requires one exact admitted findings vector",
    );
  }
  const result = reduceConsensusRound(input);
  return deterministicSuccess(
    CONSENSUS_IDS.reducerImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export function realizeConsensusResultProjection(
  input: Readonly<ConsensusRoundState>,
) {
  if (!isConsensusRoundState(input)) {
    throw new TypeError(
      "Consensus result projector requires one exact terminal state",
    );
  }
  const result = projectConsensusResult(input);
  return deterministicSuccess(
    CONSENSUS_IDS.projectorImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export function realizeConsensusEscalationFinalization(
  input: Readonly<ConsensusEscalationDecision>,
) {
  if (!isConsensusEscalationDecision(input)) {
    throw new TypeError(
      "Consensus escalation finalizer requires one exact human decision",
    );
  }
  const result = finalizeConsensusEscalation(input);
  return deterministicSuccess(
    CONSENSUS_IDS.escalationFinalizerImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export function realizeConsensusModelSynthesis(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusObservationSnapshot(input)) {
    throw new TypeError(
      "Consensus model synthesis requires one admitted observation",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.synthesizeModelImplementationRef,
    input,
    synthesizeConsensusModel(input) as unknown as Readonly<
      Record<string, JsonValue>
    >,
  );
}

export function realizeConsensusGapEvaluation(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusObservationSnapshot(input)) {
    throw new TypeError(
      "Consensus gap evaluation requires one admitted observation",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.evalGapImplementationRef,
    input,
    evaluateConsensusGap(input),
  );
}

export function realizeConsensusNextActionSelection(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusNextActionBasis(input)) {
    throw new TypeError(
      "Consensus action selection requires one admitted basis",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.evaluateNextImplementationRef,
    input,
    selectConsensusNextAction(input),
  );
}

export function realizeConsensusActionEvaluation(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusActionEvaluationBasis(input)) {
    throw new TypeError(
      "Consensus action evaluation requires admitted child evidence",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.evaluateActionImplementationRef,
    input,
    evaluateConsensusAction(input),
  );
}

export function realizeConsensusModelRefresh(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusActionEvaluationProjection(input)) {
    throw new TypeError(
      "Consensus model refresh requires one admitted action evaluation",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.refreshModelImplementationRef,
    input,
    refreshConsensusModel(input) as unknown as Readonly<
      Record<string, JsonValue>
    >,
  );
}

export function realizeConsensusGapRefresh(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusObservationSnapshot(input)) {
    throw new TypeError(
      "Consensus gap refresh requires one refreshed observation",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.refreshGapImplementationRef,
    input,
    refreshConsensusGap(input),
  );
}

export function realizeConsensusNextActionRefresh(
  input: Readonly<Record<string, JsonValue>>,
) {
  if (!isConsensusNextActionBasis(input)) {
    throw new TypeError(
      "Consensus convergence requires one refreshed basis",
    );
  }
  return deterministicSuccess(
    CONSENSUS_IDS.refreshEvaluateNextImplementationRef,
    input,
    refreshConsensusNextAction(input),
  );
}
