// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-RETRY
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: T-084

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitFpDispatchOutcome,
  constructConsequenceProjectionOutcome,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  defaultFpEvaluatorPlugin,
  runEngineIterate,
  start
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

const INSTRUCTION_WIRING_EVENT_KINDS = new Set([
  "registry_entry_admitted",
  "graph_function_selected",
  "instruction_prompt_manifest_projected",
  "instruction_response_contract_admitted"
]);

function legacyCoreEventKinds(events) {
  return events
    .map((event) => event.kind)
    .filter((kind) => !INSTRUCTION_WIRING_EVENT_KINDS.has(kind));
}

function attachedArtifact(input, options = {}) {
  const fulfillmentStatus = options.fulfillmentStatus ?? "fulfilled";
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: options.edge ?? input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: fulfillmentStatus,
      fulfillment_detail:
        fulfillmentStatus === "fulfilled"
          ? "attached worker result accepted"
          : "missing generated asset",
      blocking_reasons:
        fulfillmentStatus === "fulfilled" ? [] : ["missing generated asset"],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function fpEvaluationFinding(input, closeDisposition, attempt) {
  return constructFpEvaluationFinding({
    findingRef: [
      "finding://t084/assurance-retry",
      encodeURIComponent(input.edge),
      String(attempt)
    ].join("/"),
    evaluatorRef: input.contract.ref,
    gainReportRef: [
      "gain://t084/assurance-retry",
      encodeURIComponent(input.edge),
      String(attempt)
    ].join("/"),
    metricRefs: [
      [
        "metric://t084/assurance-retry",
        encodeURIComponent(input.edge),
        String(attempt)
      ].join("/")
    ],
    closeDisposition,
    residualPressureRefs:
      closeDisposition === "retry"
        ? [
            [
              "pressure://t084/assurance-retry",
              encodeURIComponent(input.edge),
              String(attempt)
            ].join("/")
          ]
        : [],
    evidenceRefs: [input.sourceProjectionRef],
    authorityRefs:
      input.expectedAssessmentIds.length > 0
        ? input.expectedAssessmentIds
        : [
            [
              "authority://t084/assurance-retry",
              encodeURIComponent(input.edge),
              String(attempt)
            ].join("/")
          ],
    compositionContributionRef:
      input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
    compositionRef: input.selectedCompositionRef,
    compositionDigest: input.selectedCompositionDigest
  });
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

test("T-084 engine runner: attached F_P worker retries from replay state, then continues to convergence", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  const observedInputs = [];
  const attemptByEdge = new Map();
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-attached-worker"),
    dispatch: (input) => {
      const nextAttempt = (attemptByEdge.get(input.edge) ?? 0) + 1;
      attemptByEdge.set(input.edge, nextAttempt);
      observedInputs.push(input);

      if (input.edge === "input_set→requirements" && nextAttempt === 2) {
        assert.deepStrictEqual(input.closedVectorIndexes, []);
        assert.equal(input.retryAttemptRefs.length, 1);
        assert.equal(input.retryAttemptRefs[0].attemptIndex, 1);
        assert.equal(input.retryProgressRefs.length, 1);
        assert.ok(
          input.retryProgressRefs[0].progressSignalRefs.some((ref) =>
            ref.includes("missing generated asset")
          )
        );
      }

      const fulfillmentStatus =
        input.edge === "input_set→requirements" && nextAttempt === 1
          ? "blocked"
          : "fulfilled";
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084/${encodeURIComponent(input.edge)}/${nextAttempt}`,
        attachedResultArtifact: attachedArtifact(input, { fulfillmentStatus }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(result.iterationCount, 3);
  assert.deepStrictEqual(
    observedInputs.map((input) => input.edge),
    [
      "input_set→requirements",
      "input_set→requirements",
      "requirements→design",
      "design→code"
    ]
  );
  assert.deepStrictEqual(result.projection.closedVectorIndexes, [0, 1, 2]);
  assert.deepStrictEqual(result.projection.retryAttemptRefs, [
    {
      vectorIndex: 0,
      retryRunId: "run://m03-iteration:retry:1",
      retryCallId: `graph-call:${basis.id}:retry:1`,
      manifestId: `manifest:fp_retry:${JSON.stringify({
        basisId: basis.id,
        vectorIndex: 0,
        attemptIndex: 1
      })}`,
      priorManifestId: "result://t084/input_set%E2%86%92requirements/1",
      attemptIndex: 1,
      sourceProjectionRef: `runtime_projection:${basis.id}:closed=:retry=0:leaf=0`
    }
  ]);
  const successfulFpClosureEvents = [
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "payload_observed",
    "payload_validated",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "c_call_opened",
    "c_call_fibre_selected",
    "payload_observed",
    "payload_validated",
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "evidence_admitted",
    "ambiguity_observation_admitted",
    "executive_pressure_fact_projected",
    "closure_input_published",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "vector_evaluated"
  ];
  const composedStageOutcomeEvents = ["payload_observed", "payload_validated"];
  assert.deepStrictEqual(
    legacyCoreEventKinds(events),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "actor_invocation_started",
      ...composedStageOutcomeEvents,
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_evaluated",
      "retry_repair_planned",
      "retry_attempt_opened",
      "continuation_terminated",
      "continuation_reopened",
      "retry_progress_recorded",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "actor_invocation_started",
      ...composedStageOutcomeEvents,
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      ...successfulFpClosureEvents,
      ...composedStageOutcomeEvents,
      "vector_closed",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "instruction_causal_context_bound",
      "actor_invocation_started",
      ...composedStageOutcomeEvents,
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      ...successfulFpClosureEvents,
      ...composedStageOutcomeEvents,
      "vector_closed",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "instruction_causal_context_bound",
      "actor_invocation_started",
      ...composedStageOutcomeEvents,
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      ...successfulFpClosureEvents,
      ...composedStageOutcomeEvents,
      "vector_closed",
      "terminal_reached"
    ]
  );
});

test("T-084 engine runner: assurance retry over an accepted artifact redispatches inside ABG", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker-assurance-retry"
  });
  const events = [];
  const dispatchAttemptByEdge = new Map();
  const evaluationAttemptByEdge = new Map();
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-assurance-retry-dispatch"),
    dispatch: (input) => {
      const nextAttempt = (dispatchAttemptByEdge.get(input.edge) ?? 0) + 1;
      dispatchAttemptByEdge.set(input.edge, nextAttempt);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084/assurance/${encodeURIComponent(input.edge)}/${nextAttempt}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
  const fpEvaluator = Object.freeze({
    contract: defaultFpEvaluatorPlugin.contract,
    evaluate: (input) => {
      const nextAttempt = (evaluationAttemptByEdge.get(input.edge) ?? 0) + 1;
      evaluationAttemptByEdge.set(input.edge, nextAttempt);
      if (input.edge !== "input_set→requirements" || nextAttempt > 1) {
        return defaultFpEvaluatorPlugin.evaluate(input);
      }
      return constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [fpEvaluationFinding(input, "retry", nextAttempt)],
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.deepStrictEqual([...dispatchAttemptByEdge.entries()], [
    ["input_set→requirements", 2],
    ["requirements→design", 1],
    ["design→code", 1]
  ]);
  assert.deepStrictEqual(result.projection.retryAttemptRefs, [
    {
      vectorIndex: 0,
      retryRunId: "run://m03-iteration:retry:1",
      retryCallId: `graph-call:${basis.id}:retry:1`,
      manifestId: `manifest:assurance_retry:${JSON.stringify({
        basisId: basis.id,
        vectorIndex: 0,
        attemptIndex: 1
      })}`,
      priorManifestId: "result://t084/assurance/input_set%E2%86%92requirements/1",
      attemptIndex: 1,
      sourceProjectionRef: `runtime_projection:${basis.id}:closed=:retry=0:leaf=0`
    }
  ]);
  assert.equal(
    events.some((event) => event.kind === "retry_repair_planned"),
    true
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "retry_progress_recorded" &&
        event.progressSignalRefs.includes(
          "partial_or_missing_evidence_requires_retry_or_repair"
        )
    ),
    true
  );
  assert.equal(
    events.filter((event) => event.kind === "terminal_reached").length,
    1
  );
});

test("T-159 typed F_P continuation reaches consequence before assurance retry", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://typed-continuation-before-retry"
  });
  const events = [];
  const consequenceInputs = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t159-continuation-dispatch"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t159/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });
  const fpEvaluator = Object.freeze({
    contract: defaultFpEvaluatorPlugin.contract,
    evaluate: (input) =>
      constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://t159/typed-continuation/${input.vectorIndex}`,
            evaluatorRef: input.contract.ref,
            gainReportRef: `gain://t159/typed-continuation/${input.vectorIndex}`,
            metricRefs: [`metric://t159/typed-continuation/${input.vectorIndex}`],
            closeDisposition: "retry",
            residualPressureRefs: [
              `pressure://t159/typed-continuation/${input.vectorIndex}`
            ],
            continuationRefs: [
              `continuation://t159/typed-reentry/${input.vectorIndex}`
            ],
            evidenceRefs: [input.sourceProjectionRef],
            authorityRefs:
              input.expectedAssessmentIds.length > 0
                ? input.expectedAssessmentIds
                : [`authority://t159/typed-continuation/${input.vectorIndex}`],
            compositionContributionRef:
              input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
            compositionRef: input.selectedCompositionRef,
            compositionDigest: input.selectedCompositionDigest
          })
        ],
        evidenceRefs: [input.sourceProjectionRef]
      })
  });
  const consequenceProjection = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://test/t159-consequence-before-retry",
      pluginKind: "consequence_projection",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "ConsequenceProjectionOutcome"
    }),
    project: (input) => {
      consequenceInputs.push(input);
      return constructConsequenceProjectionOutcome({
        status: "blocked",
        reason: "typed_continuation_consequence_seen",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator, consequenceProjection }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(result.transition.reason, "typed_continuation_consequence_seen");
  assert.equal(consequenceInputs.length, 1);
  assert.equal(
    events.some((event) => event.kind === "retry_repair_planned"),
    false
  );
  assert.equal(
    events.some((event) => event.kind === "vector_closed"),
    false
  );
});

test("T-084 public start: attached F_P graph converges without caller-owned loop", () => {
  const { input, context, basis } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-public-start"),
    dispatch: (pluginInput) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084-public/${encodeURIComponent(pluginInput.edge)}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      })
  });

  const outcome = start(
    input,
    {
      ...context,
      ...m03InstructionAssemblyRequestFields(basis)
    },
    (event) => {
      events.push(event);
    },
    { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  );

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.terminalKind, "converged");
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === "fp_dispatch_requested")
      .map((event) => event.dispatchRef),
    [
      "dispatch://attached-worker",
      "dispatch://attached-worker",
      "dispatch://attached-worker"
    ]
  );
  assert.deepStrictEqual(
    events.filter((event) => event.kind === "vector_closed").map((event) => event.edge),
    ["input_set→requirements", "requirements→design", "design→code"]
  );
});

test("T-084 non-retryable runtime failures stop without same-edge retry", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  let dispatchCount = 0;
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-runtime-failure-stop"),
    dispatch: (input) => {
      dispatchCount += 1;
      return constructFpDispatchOutcome({
        status: "blocked",
        resultRef: `result://t084-runtime-failure/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: {
          kind: "runtime_failure",
          failureClass: "runtime_failure",
          detail: "invalid model selection"
        },
        evidenceRefs: [input.sourceProjectionRef],
        reason: "invalid model selection"
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch }
  });

  assert.equal(dispatchCount, 1);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(
    events.some((event) => event.kind === "retry_repair_planned"),
    false
  );
  assert.equal(
    events.some((event) => event.kind === "retry_attempt_opened"),
    false
  );
  assert.equal(
    events.filter((event) => event.kind === "retry_attempt_stopped").length,
    1
  );
});

test("T-084 negative: F_P plugin output cannot carry hidden traversal authority", () => {
  assert.throws(
    () =>
      admitFpDispatchOutcome({
        kind: "fp_dispatch",
        status: "dispatched",
        resultRef: "result://malicious",
        attachedResultArtifact: {},
        nextVectorIndex: 2
      }),
    /engine authority/i
  );

  assert.throws(
    () =>
      admitFpDispatchOutcome({
        kind: "fp_dispatch",
        status: "dispatched",
        resultRef: "result://malicious",
        attachedResultArtifact: {},
        runtimeEvents: []
      }),
    /engine authority/i
  );
});

test("T-084 negative: wrong-edge attached artifact cannot close a vector", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-wrong-edge"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084-wrong/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input, {
          edge: "wrong_source→wrong_target"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.deepStrictEqual(result.projection.closedVectorIndexes, []);
  assert.deepStrictEqual(
    events.filter((event) => event.kind === "assessed"),
    []
  );
  assert.equal(
    events.some((event) => event.kind === "retry_attempt_stopped"),
    true
  );
});
