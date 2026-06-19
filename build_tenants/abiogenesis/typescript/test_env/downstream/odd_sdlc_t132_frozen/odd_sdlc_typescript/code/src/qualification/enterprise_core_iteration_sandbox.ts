// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-043
// Investigates: B-068

import {
  admitExecutionBasis,
  admitEvaluator,
  admitModule,
  admitNode,
  admitOperator,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructRetryProgressRecordedEvent,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  deriveIterationAdvanceDecision,
  deriveRetryRepairDecision,
  deriveRuntimeAggregateProjection,
  edge,
  graphFunctionForVector,
  runtimeEventsForIterationDecision,
  runtimeEventsForRetryRepairDecision,
  type ExecutionBasis,
  type GraphFunction,
  type GraphVector,
  type Module,
  type RuntimeEvent
} from "@abiogenesis/typescript-tenant";
import {
  ENTERPRISE_CORE_CAPABILITY_INVENTORY,
  ENTERPRISE_CORE_COMPONENTS,
  evaluateEnterpriseCoreInventory,
  type EnterpriseCoreComponent,
  type EnterpriseCoreEvidenceState,
  type EnterpriseCoreInventoryEvaluationStatus
} from "./enterprise_core_inventory.js";

export type EnterpriseCoreEvaluationStatus =
  EnterpriseCoreInventoryEvaluationStatus;
export type EnterpriseCoreSandboxLaneVerdict = "passed" | "failed";
export type EnterpriseCoreSandboxCapabilityVerdict = "proved" | "not_proved";
export type EnterpriseCoreSandboxSuccessMode =
  | "iteration_proven"
  | "abg_gap_detected"
  | "failed";

export interface EnterpriseCoreArtifactState {
  readonly kind: "enterprise_core_artifact_state";
  readonly attemptIndex: number;
  readonly sourceComponents: readonly EnterpriseCoreComponent[];
  readonly testComponents: readonly EnterpriseCoreComponent[];
  readonly buildEvidence: EnterpriseCoreEvidenceState;
  readonly testEvidence: EnterpriseCoreEvidenceState;
  readonly evidenceRefs: readonly string[];
}

export interface EnterpriseCoreConstructorPluginInput {
  readonly kind: "enterprise_core_constructor_plugin_input";
  readonly graphFunctionName: string;
  readonly attemptIndex: number;
  readonly currentState: EnterpriseCoreArtifactState | null;
  readonly unresolvedReasons: readonly string[];
}

export interface EnterpriseCoreConstructorPlugin {
  readonly kind: "enterprise_core_constructor_plugin";
  readonly pluginRef: string;
  readonly construct: (
    input: EnterpriseCoreConstructorPluginInput
  ) => EnterpriseCoreArtifactState;
}

export interface EnterpriseCoreEvaluation {
  readonly kind: "enterprise_core_evaluation";
  readonly status: EnterpriseCoreEvaluationStatus;
  readonly missingSourceComponents: readonly EnterpriseCoreComponent[];
  readonly missingTestComponents: readonly EnterpriseCoreComponent[];
  readonly blockingReasons: readonly string[];
  readonly progressSignalRefs: readonly string[];
}

export interface EnterpriseCoreAttemptHandoffEvidence {
  readonly kind: "enterprise_core_attempt_handoff_evidence";
  readonly currentStateAttemptIndex: number | null;
  readonly currentStateSourceComponents: readonly EnterpriseCoreComponent[];
  readonly currentStateTestComponents: readonly EnterpriseCoreComponent[];
  readonly currentStateBuildEvidence: EnterpriseCoreEvidenceState | null;
  readonly currentStateTestEvidence: EnterpriseCoreEvidenceState | null;
  readonly unresolvedReasons: readonly string[];
}

export interface EnterpriseCoreEvaluatorPlugin {
  readonly kind: "enterprise_core_evaluator_plugin";
  readonly pluginRef: string;
  readonly evaluate: (artifact: EnterpriseCoreArtifactState) => EnterpriseCoreEvaluation;
}

export interface EnterpriseCoreAttemptRecord {
  readonly kind: "enterprise_core_attempt_record";
  readonly attemptIndex: number;
  readonly constructorPluginRef: string;
  readonly evaluatorPluginRef: string;
  readonly sourceComponents: readonly EnterpriseCoreComponent[];
  readonly testComponents: readonly EnterpriseCoreComponent[];
  readonly buildEvidence: EnterpriseCoreEvidenceState;
  readonly testEvidence: EnterpriseCoreEvidenceState;
  readonly evaluationStatus: EnterpriseCoreEvaluationStatus;
  readonly blockingReasons: readonly string[];
  readonly handoffEvidence: EnterpriseCoreAttemptHandoffEvidence;
}

export interface EnterpriseCoreAbgGap {
  readonly kind: "enterprise_core_abg_gap";
  readonly gap: string;
  readonly evidenceRefs: readonly string[];
}

export type EnterpriseCoreOutcomeIterationEvent =
  | "execution_basis_constructed"
  | "graph_function_admitted"
  | "graph_call_opened"
  | "frame_opened"
  | "vector_traversal_planned"
  | "fp_plugin_turn_completed"
  | "fd_fp_evaluation_blocked"
  | "closure_denied"
  | "abg_retry_repair_planned"
  | "abg_retry_attempt_opened"
  | "abg_continuation_terminated"
  | "abg_continuation_reopened"
  | "abg_retry_progress_recorded"
  | "abg_retry_attempt_stopped"
  | "abg_retry_attempt_escalated"
  | "fd_fp_evaluation_accepted"
  | "vector_closed"
  | "terminal_reached";

export interface EnterpriseCoreOutcomeIterationArchive {
  readonly kind: "odd_sdlc_enterprise_core_outcome_iteration_sandbox_archive";
  readonly ticketId: "B-068";
  readonly scenarioId: "b068_enterprise_core_minimal";
  readonly outcomeCriteria: "outcome_iteration";
  readonly successMode: EnterpriseCoreSandboxSuccessMode;
  readonly laneVerdict: EnterpriseCoreSandboxLaneVerdict;
  readonly capabilityVerdict: EnterpriseCoreSandboxCapabilityVerdict;
  readonly verdict: "passed" | "failed";
  readonly graphFunctionName: "derive_enterprise_core_code_surface";
  readonly constructorPluginRef: string;
  readonly evaluatorPluginRef: string;
  readonly maxAttempts: number;
  readonly retryBudgetMaxAttempts: number;
  readonly reentryCount: number;
  readonly attempts: readonly EnterpriseCoreAttemptRecord[];
  readonly expectedEventSequence: readonly EnterpriseCoreOutcomeIterationEvent[];
  readonly actualEventSequence: readonly EnterpriseCoreOutcomeIterationEvent[];
  readonly runtimeEventKinds: readonly RuntimeEvent["kind"][];
  readonly finalArtifact: EnterpriseCoreArtifactState | null;
  readonly abgGap: EnterpriseCoreAbgGap | null;
  readonly diagnostics: readonly string[];
  readonly residualGaps: readonly string[];
}

const ENTERPRISE_CORE_GRAPH_FUNCTION_NAME =
  "derive_enterprise_core_code_surface" as const;

const ENTERPRISE_CORE_EXPECTED_EVENT_SEQUENCE = Object.freeze([
  "execution_basis_constructed",
  "graph_function_admitted",
  "graph_call_opened",
  "frame_opened",
  "vector_traversal_planned",
  "fp_plugin_turn_completed",
  "fd_fp_evaluation_blocked",
  "closure_denied",
  "abg_retry_repair_planned",
  "abg_retry_attempt_opened",
  "abg_continuation_terminated",
  "abg_continuation_reopened",
  "abg_retry_progress_recorded",
  "fp_plugin_turn_completed",
  "fd_fp_evaluation_blocked",
  "closure_denied",
  "abg_retry_repair_planned",
  "abg_retry_attempt_opened",
  "abg_continuation_terminated",
  "abg_continuation_reopened",
  "abg_retry_progress_recorded",
  "fp_plugin_turn_completed",
  "fd_fp_evaluation_accepted",
  "vector_closed",
  "terminal_reached"
] satisfies readonly EnterpriseCoreOutcomeIterationEvent[]);

const ENTERPRISE_CORE_OPERATOR = admitOperator({
  name: "odd_sdlc_enterprise_core_fp_plugin",
  regime: "F_P",
  binding: "plugin://odd_sdlc/enterprise-core-constructor",
  tags: ["odd_sdlc", "enterprise_core", "plugin"]
});

function enterpriseCoreNode(name: string) {
  return admitNode({
    id: `node:odd_sdlc:b068:${name}`,
    name,
    schema: { kind: "symbolic", ref: `schema://odd_sdlc/${name}` },
    markov: [],
    assetSurface: {
      kind: name,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: [`${name}_present`]
    },
    tags: ["odd_sdlc", "enterprise_core", `asset:${name}`]
  });
}

function firstVector(graphName: string, vectors: readonly GraphVector[]): GraphVector {
  const vector = vectors[0];
  if (vector === undefined) {
    throw new TypeError(`${graphName}: expected one vector`);
  }
  return vector;
}

export function constructEnterpriseCoreOutcomeGraphFunction(): GraphFunction {
  const source = enterpriseCoreNode("enterprise_core_requirements_surface");
  const target = enterpriseCoreNode("enterprise_core_code_surface");
  const graph = edge([source], target, {
    id: "vector:odd_sdlc:b068:derive_enterprise_core_code_surface",
    name: ENTERPRISE_CORE_GRAPH_FUNCTION_NAME,
    operators: [ENTERPRISE_CORE_OPERATOR],
    evaluators: [
      admitEvaluator({
        name: "enterprise_core_inventory_fd",
        regime: "F_D",
        description: "Reject shallow enterprise-core source/test inventory.",
        binding: "plugin://odd_sdlc/enterprise-core-inventory-fd",
        tags: ["odd_sdlc", "enterprise_core", "plugin"]
      }),
      admitEvaluator({
        name: "enterprise_core_semantic_fp",
        regime: "F_P",
        description: "Reject semantically incomplete enterprise-core artifacts.",
        binding: "plugin://odd_sdlc/enterprise-core-semantic-fp",
        tags: ["odd_sdlc", "enterprise_core", "plugin"]
      })
    ],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: {
      entries: Object.freeze([
        {
          key: "capability",
          value: {
            kind: "scalar",
            value: "ABG-governed realization-edge continuation"
          }
        },
        {
          key: "required_enterprise_core_components",
          value: {
            kind: "string_list",
            value: ENTERPRISE_CORE_COMPONENTS
          }
        },
        {
          key: "required_enterprise_core_capabilities",
          value: {
            kind: "string_list",
            value: ENTERPRISE_CORE_CAPABILITY_INVENTORY.map(
              (entry) => entry.capabilityId
            )
          }
        }
      ])
    },
    tags: ["odd_sdlc", "enterprise_core", "b068", "outcome_iteration"]
  });
  return graphFunctionForVector(firstVector(ENTERPRISE_CORE_GRAPH_FUNCTION_NAME, graph.vectors), {
    name: ENTERPRISE_CORE_GRAPH_FUNCTION_NAME,
    declarations: {
      entries: Object.freeze([
        {
          key: "function_kind",
          value: { kind: "scalar", value: "odd_outcome_iteration_probe" }
        }
      ])
    },
    tags: ["odd_sdlc", "enterprise_core", "b068"]
  });
}

export function constructEnterpriseCoreOutcomeModule(): Module {
  const graphFunction = constructEnterpriseCoreOutcomeGraphFunction();
  return admitModule({
    name: "odd_sdlc_enterprise_core_outcome_iteration",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job:odd_sdlc:b068:enterprise_core",
        name: "derive_enterprise_core_code_surface_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["odd_sdlc", "enterprise_core", "b068"]
      }
    ],
    roles: [],
    operators: [ENTERPRISE_CORE_OPERATOR],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
}

export function constructEnterpriseCoreOutcomeBasis(): ExecutionBasis {
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/b068_enterprise_core_minimal",
        moduleName: "odd_sdlc_enterprise_core_outcome_iteration"
      },
      target: {
        kind: "graph_function",
        handle: ENTERPRISE_CORE_GRAPH_FUNCTION_NAME
      },
      until: "converged"
    }),
    module: constructEnterpriseCoreOutcomeModule(),
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript/b068",
      backendId: "backend://node/plugin-sandbox",
      buildId: "build://odd-sdlc/typescript/b068",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/b068/F_P",
      defaultRegime: "F_P",
      dispatchRef: "plugin://odd_sdlc/enterprise-core-constructor",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/b068/enterprise-core",
    workKey: "wk://odd-sdlc/b068/enterprise-core",
    frameId: null,
    frameLineageId: null
  });
}

function artifact(input: {
  readonly attemptIndex: number;
  readonly sourceComponents: readonly EnterpriseCoreComponent[];
  readonly testComponents: readonly EnterpriseCoreComponent[];
  readonly buildEvidence: EnterpriseCoreEvidenceState;
  readonly testEvidence: EnterpriseCoreEvidenceState;
  readonly evidenceRefs?: readonly string[];
}): EnterpriseCoreArtifactState {
  return Object.freeze({
    kind: "enterprise_core_artifact_state",
    attemptIndex: input.attemptIndex,
    sourceComponents: Object.freeze([...input.sourceComponents]),
    testComponents: Object.freeze([...input.testComponents]),
    buildEvidence: input.buildEvidence,
    testEvidence: input.testEvidence,
    evidenceRefs: Object.freeze([
      `plugin://odd_sdlc/enterprise-core/attempt/${input.attemptIndex}`,
      ...(input.evidenceRefs ?? [])
    ])
  });
}

function handoffEvidence(input: {
  readonly currentState: EnterpriseCoreArtifactState | null;
  readonly unresolvedReasons: readonly string[];
}): EnterpriseCoreAttemptHandoffEvidence {
  return Object.freeze({
    kind: "enterprise_core_attempt_handoff_evidence",
    currentStateAttemptIndex: input.currentState?.attemptIndex ?? null,
    currentStateSourceComponents: Object.freeze([
      ...(input.currentState?.sourceComponents ?? [])
    ]),
    currentStateTestComponents: Object.freeze([
      ...(input.currentState?.testComponents ?? [])
    ]),
    currentStateBuildEvidence: input.currentState?.buildEvidence ?? null,
    currentStateTestEvidence: input.currentState?.testEvidence ?? null,
    unresolvedReasons: Object.freeze([...input.unresolvedReasons])
  });
}

export function constructScriptedEnterpriseCoreConstructorPlugin():
  EnterpriseCoreConstructorPlugin {
  return Object.freeze({
    kind: "enterprise_core_constructor_plugin",
    pluginRef: "plugin://odd_sdlc/enterprise-core-constructor/scripted",
    construct: (input: EnterpriseCoreConstructorPluginInput) => {
      if (input.attemptIndex === 1) {
        if (input.currentState !== null || input.unresolvedReasons.length !== 0) {
          throw new TypeError("attempt 1 must start without prior state or gaps");
        }
        return artifact({
          attemptIndex: input.attemptIndex,
          sourceComponents: ["ProbeParser"],
          testComponents: [],
          buildEvidence: "missing",
          testEvidence: "missing"
        });
      }
      if (input.attemptIndex === 2) {
        if (
          input.currentState === null ||
          input.currentState.attemptIndex !== 1 ||
          !input.unresolvedReasons.includes(
            "missing_source_component:ProbePlanner"
          ) ||
          !input.unresolvedReasons.includes("missing_governed_test_evidence")
        ) {
          throw new TypeError(
            "attempt 2 requires attempt 1 state and blocking reasons"
          );
        }
        return artifact({
          attemptIndex: input.attemptIndex,
          sourceComponents: Object.freeze([
            ...input.currentState.sourceComponents,
            "ProbePlanner",
            "ProbeRunner",
            "ProbeSynthesizer",
            "ProbeRunLedger"
          ]),
          testComponents: ["ProbeParser", "ProbePlanner"],
          buildEvidence: "missing",
          testEvidence: "missing"
        });
      }
      if (
        input.currentState === null ||
        input.currentState.attemptIndex !== 2 ||
        !input.unresolvedReasons.includes(
          "missing_behavioral_test:ProbeRunner"
        ) ||
        !input.unresolvedReasons.includes("missing_governed_build_evidence") ||
        !input.unresolvedReasons.includes("missing_governed_test_evidence")
      ) {
        throw new TypeError("attempt 3 requires attempt 2 state and blocking reasons");
      }
      return artifact({
        attemptIndex: input.attemptIndex,
        sourceComponents: ENTERPRISE_CORE_COMPONENTS,
        testComponents: ENTERPRISE_CORE_COMPONENTS,
        buildEvidence: "governed",
        testEvidence: "governed",
        evidenceRefs: [
          "build://odd-sdlc/b068/governed-build",
          "test-report://odd-sdlc/b068/enterprise-core"
        ]
      });
    }
  });
}

export function constructEnterpriseCoreEvaluatorPlugin():
  EnterpriseCoreEvaluatorPlugin {
  return Object.freeze({
    kind: "enterprise_core_evaluator_plugin",
    pluginRef: "plugin://odd_sdlc/enterprise-core-evaluator/fd-fp",
    evaluate: (state: EnterpriseCoreArtifactState) => {
      const inventory = evaluateEnterpriseCoreInventory({ state });
      return Object.freeze({
        kind: "enterprise_core_evaluation",
        status: inventory.status,
        missingSourceComponents: inventory.missingSourceComponents,
        missingTestComponents: inventory.missingTestComponents,
        blockingReasons: inventory.blockingReasons,
        progressSignalRefs: state.evidenceRefs
      });
    }
  });
}

function runtimeEventKinds(events: readonly RuntimeEvent[]): readonly RuntimeEvent["kind"][] {
  return Object.freeze(events.map((event) => event.kind));
}

function attemptRecord(input: {
  readonly artifactState: EnterpriseCoreArtifactState;
  readonly evaluation: EnterpriseCoreEvaluation;
  readonly constructorPluginRef: string;
  readonly evaluatorPluginRef: string;
  readonly handoffEvidence: EnterpriseCoreAttemptHandoffEvidence;
}): EnterpriseCoreAttemptRecord {
  return Object.freeze({
    kind: "enterprise_core_attempt_record",
    attemptIndex: input.artifactState.attemptIndex,
    constructorPluginRef: input.constructorPluginRef,
    evaluatorPluginRef: input.evaluatorPluginRef,
    sourceComponents: input.artifactState.sourceComponents,
    testComponents: input.artifactState.testComponents,
    buildEvidence: input.artifactState.buildEvidence,
    testEvidence: input.artifactState.testEvidence,
    evaluationStatus: input.evaluation.status,
    blockingReasons: input.evaluation.blockingReasons,
    handoffEvidence: input.handoffEvidence
  });
}

function sequenceMatches(
  left: readonly EnterpriseCoreOutcomeIterationEvent[],
  right: readonly EnterpriseCoreOutcomeIterationEvent[]
): boolean {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

export function runEnterpriseCoreOutcomeIterationSandbox(input: {
  readonly constructorPlugin?: EnterpriseCoreConstructorPlugin;
  readonly evaluatorPlugin?: EnterpriseCoreEvaluatorPlugin;
  readonly maxAttempts?: number;
  readonly retryBudgetMaxAttempts?: number;
} = {}): EnterpriseCoreOutcomeIterationArchive {
  const constructorPlugin =
    input.constructorPlugin ?? constructScriptedEnterpriseCoreConstructorPlugin();
  const evaluatorPlugin =
    input.evaluatorPlugin ?? constructEnterpriseCoreEvaluatorPlugin();
  const maxAttempts = input.maxAttempts ?? 3;
  const retryBudgetMaxAttempts =
    input.retryBudgetMaxAttempts ?? Math.max(0, maxAttempts - 1);
  const basis = constructEnterpriseCoreOutcomeBasis();
  const events: RuntimeEvent[] = [];
  const actualEventSequence: EnterpriseCoreOutcomeIterationEvent[] = [
    "execution_basis_constructed",
    "graph_function_admitted"
  ];
  const attempts: EnterpriseCoreAttemptRecord[] = [];
  let currentState: EnterpriseCoreArtifactState | null = null;
  let finalArtifact: EnterpriseCoreArtifactState | null = null;
  let abgGap: EnterpriseCoreAbgGap | null = null;
  let priorManifestId = "manifest://odd-sdlc/b068/initial";
  let unresolvedReasons: readonly string[] = Object.freeze([]);

  const initialDecision = deriveIterationAdvanceDecision(
    basis,
    deriveRuntimeAggregateProjection(basis, events)
  );
  if (initialDecision.kind !== "advance_vector") {
    abgGap = Object.freeze({
      kind: "enterprise_core_abg_gap",
      gap: "abg_failed_to_open_first_realization_vector",
      evidenceRefs: [initialDecision.reason]
    });
  } else {
    const openingEvents = runtimeEventsForIterationDecision(initialDecision);
    events.push(...openingEvents);
    actualEventSequence.push(
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned"
    );
  }

  for (
    let attemptIndex = 1;
    abgGap === null && finalArtifact === null && attemptIndex <= maxAttempts;
    attemptIndex += 1
  ) {
    const attemptHandoffEvidence = handoffEvidence({
      currentState,
      unresolvedReasons
    });
    const artifactState = constructorPlugin.construct({
      kind: "enterprise_core_constructor_plugin_input",
      graphFunctionName: ENTERPRISE_CORE_GRAPH_FUNCTION_NAME,
      attemptIndex,
      currentState,
      unresolvedReasons
    });
    const evaluation = evaluatorPlugin.evaluate(artifactState);
    attempts.push(
      attemptRecord({
        artifactState,
        evaluation,
        constructorPluginRef: constructorPlugin.pluginRef,
        evaluatorPluginRef: evaluatorPlugin.pluginRef,
        handoffEvidence: attemptHandoffEvidence
      })
    );
    actualEventSequence.push("fp_plugin_turn_completed");

    if (evaluation.status === "accepted") {
      events.push(
        constructVectorEvaluatedEvent({
          basis,
          vectorIndex: 0,
          status: "accepted"
        }),
        constructVectorClosedEvent({
          basis,
          vectorIndex: 0,
          closureKind: "advanced"
        })
      );
      actualEventSequence.push(
        "fd_fp_evaluation_accepted",
        "vector_closed"
      );
      finalArtifact = artifactState;
    } else {
      events.push(
        constructVectorEvaluatedEvent({
          basis,
          vectorIndex: 0,
          status: "blocked"
        })
      );
      actualEventSequence.push("fd_fp_evaluation_blocked", "closure_denied");

      const projection = deriveRuntimeAggregateProjection(basis, events);
      const candidateManifestId = `manifest://odd-sdlc/b068/attempt-${attemptIndex}`;
      const retryDecision = deriveRetryRepairDecision({
        basis,
        projection,
        failedVectorIndex: 0,
        priorManifestId,
        candidateManifestId,
        maxAttempts: retryBudgetMaxAttempts,
        stationary: false,
        continuationRepair: {
          terminatedContinuationId: `continuation://odd-sdlc/b068/${attemptIndex - 1}`,
          reopenedContinuationId: `continuation://odd-sdlc/b068/${attemptIndex}`
        }
      });

      if (retryDecision.kind !== "retry_planned") {
        events.push(...runtimeEventsForRetryRepairDecision(retryDecision));
        actualEventSequence.push(
          retryDecision.kind === "retry_stopped"
            ? "abg_retry_attempt_stopped"
            : "abg_retry_attempt_escalated"
        );
        abgGap = Object.freeze({
          kind: "enterprise_core_abg_gap",
          gap:
            retryDecision.kind === "retry_stopped"
              ? `abg_retry_repair_stopped:${retryDecision.reason}`
              : `abg_retry_repair_escalated:${retryDecision.gateReason}`,
          evidenceRefs: evaluation.blockingReasons
        });
      } else {
        events.push(
          ...runtimeEventsForRetryRepairDecision(retryDecision),
          constructRetryProgressRecordedEvent({
            decision: retryDecision,
            progressSignalRefs: evaluation.progressSignalRefs,
            stationary: false
          })
        );
        actualEventSequence.push(
          "abg_retry_repair_planned",
          "abg_retry_attempt_opened",
          "abg_continuation_terminated",
          "abg_continuation_reopened",
          "abg_retry_progress_recorded"
        );
        priorManifestId = candidateManifestId;
        currentState = artifactState;
        unresolvedReasons = evaluation.blockingReasons;
      }
    }
  }

  if (finalArtifact === null && abgGap === null) {
    abgGap = Object.freeze({
      kind: "enterprise_core_abg_gap",
      gap: "sandbox_attempt_bound_exhausted_before_abg_stop",
      evidenceRefs: unresolvedReasons
    });
  }

  if (finalArtifact !== null) {
    const terminalDecision = deriveIterationAdvanceDecision(
      basis,
      deriveRuntimeAggregateProjection(basis, events)
    );
    events.push(...runtimeEventsForIterationDecision(terminalDecision));
    if (terminalDecision.kind === "converged") {
      actualEventSequence.push("terminal_reached");
    }
  }

  const reentryCount = attempts.filter(
    (attempt) => attempt.evaluationStatus === "blocked"
  ).length;
  const iterationProven =
    finalArtifact !== null &&
    reentryCount >= 2 &&
    sequenceMatches(ENTERPRISE_CORE_EXPECTED_EVENT_SEQUENCE, actualEventSequence);
  const successMode: EnterpriseCoreSandboxSuccessMode =
    iterationProven ? "iteration_proven" : abgGap !== null ? "abg_gap_detected" : "failed";
  const laneVerdict: EnterpriseCoreSandboxLaneVerdict =
    successMode === "failed" ? "failed" : "passed";
  const capabilityVerdict: EnterpriseCoreSandboxCapabilityVerdict =
    iterationProven ? "proved" : "not_proved";
  const diagnostics =
    successMode === "failed"
      ? Object.freeze(["outcome_iteration_not_proven_and_no_abg_gap_identified"])
      : Object.freeze([]);

  return Object.freeze({
    kind: "odd_sdlc_enterprise_core_outcome_iteration_sandbox_archive",
    ticketId: "B-068",
    scenarioId: "b068_enterprise_core_minimal",
    outcomeCriteria: "outcome_iteration",
    successMode,
    laneVerdict,
    capabilityVerdict,
    verdict: capabilityVerdict === "proved" ? "passed" : "failed",
    graphFunctionName: ENTERPRISE_CORE_GRAPH_FUNCTION_NAME,
    constructorPluginRef: constructorPlugin.pluginRef,
    evaluatorPluginRef: evaluatorPlugin.pluginRef,
    maxAttempts,
    retryBudgetMaxAttempts,
    reentryCount,
    attempts: Object.freeze(attempts),
    expectedEventSequence: ENTERPRISE_CORE_EXPECTED_EVENT_SEQUENCE,
    actualEventSequence: Object.freeze(actualEventSequence),
    runtimeEventKinds: runtimeEventKinds(events),
    finalArtifact,
    abgGap,
    diagnostics,
    residualGaps: Object.freeze([
      "T-041: external live F_P worker substitution remains full Python-replacement RC scope.",
      "T-041: live data_mapper generation and governed build/test evidence dispatch remain operational RC scope."
    ])
  });
}

export function renderEnterpriseCoreOutcomeIterationPostmortem(
  archive: EnterpriseCoreOutcomeIterationArchive
): string {
  const attempts = archive.attempts
    .map(
      (attempt) =>
        [
          `### Attempt ${attempt.attemptIndex}`,
          "",
          `- evaluation: ${attempt.evaluationStatus}`,
          `- source: ${attempt.sourceComponents.join(", ") || "none"}`,
          `- tests: ${attempt.testComponents.join(", ") || "none"}`,
          `- build evidence: ${attempt.buildEvidence}`,
          `- test evidence: ${attempt.testEvidence}`,
          `- blocking: ${attempt.blockingReasons.join(", ") || "none"}`,
          `- handoff prior attempt: ${
            attempt.handoffEvidence.currentStateAttemptIndex ?? "none"
          }`,
          `- handoff prior source: ${
            attempt.handoffEvidence.currentStateSourceComponents.join(", ") || "none"
          }`,
          `- handoff prior tests: ${
            attempt.handoffEvidence.currentStateTestComponents.join(", ") || "none"
          }`,
          `- handoff unresolved: ${
            attempt.handoffEvidence.unresolvedReasons.join(", ") || "none"
          }`
        ].join("\n")
    )
    .join("\n\n");
  return [
    "# B-068 Enterprise Core Outcome Iteration Sandbox",
    "",
    `Verdict: ${archive.verdict}`,
    `Lane verdict: ${archive.laneVerdict}`,
    `Capability verdict: ${archive.capabilityVerdict}`,
    `Success mode: ${archive.successMode}`,
    `Scenario: ${archive.scenarioId}`,
    `Graph function: ${archive.graphFunctionName}`,
    `Constructor plugin: ${archive.constructorPluginRef}`,
    `Evaluator plugin: ${archive.evaluatorPluginRef}`,
    `Retry budget max attempts: ${archive.retryBudgetMaxAttempts}`,
    `Re-entry count: ${archive.reentryCount}`,
    "",
    "## Actual Event Sequence",
    "",
    archive.actualEventSequence
      .map((event, index) => `${index + 1}. ${event}`)
      .join("\n"),
    "",
    "## ABG Runtime Events",
    "",
    archive.runtimeEventKinds
      .map((event, index) => `${index + 1}. ${event}`)
      .join("\n"),
    "",
    "## Attempts",
    "",
    attempts,
    "",
    "## ABG Gap",
    "",
    archive.abgGap === null
      ? "- none"
      : [
          `- ${archive.abgGap.gap}`,
          `- evidence: ${archive.abgGap.evidenceRefs.join(", ") || "none"}`
        ].join("\n"),
    "",
    "## Residual Gaps",
    "",
    archive.residualGaps.map((gap) => `- ${gap}`).join("\n"),
    ""
  ].join("\n");
}
