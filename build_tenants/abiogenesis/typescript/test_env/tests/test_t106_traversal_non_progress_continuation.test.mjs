// Validates: T-106
// Validates: REQ-R-ABG3-TRANSPORT-020
// Validates: REQ-R-ABG3-TRANSPORT-021
// Validates: REQ-R-ABG3-TRANSPORT-022
// Validates: REQ-R-ABG3-RETRY-007
// Validates: REQ-R-ABG3-RETRY-008
// Validates: REQ-R-ABG3-PROJECTION-011

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertTraversalContinuationSummaryAgreement,
  constructEnginePluginContract,
  constructActorInvocationStartedEvent,
  constructActorProcessExitedEvent,
  constructActorProcessSignalSentEvent,
  constructActorProcessStartedEvent,
  constructActorProcessStreamObservedEvent,
  constructActorProcessTimeoutEvent,
  constructActorResultArtifactObservedEvent,
  constructFpDispatchOutcome,
  constructFrameOpenedEvent,
  defaultFpEvaluatorPlugin,
  constructGraphCallOpenedEvent,
  constructRetryRepairPlannedEvent,
  constructVectorTraversalPlannedEvent,
  deriveRuntimeAggregateProjection,
  deriveTraversalContinuationActionProjection,
  deriveTraversalContinuationSummary,
  deriveTraversalNonProgressCarrier,
  runtimeFailureClassForTraversalTimeout,
  runEngineIterate
} from "../../build/semantic/code/src/abg/m03/index.js";
import { canonicalRuntimeEvents } from "./support/canonical-runtime-events.mjs";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

function invocationFor({ basis, vectorIndex = 1, actorInvocationId = "actor://t106/1", attemptIndex = 1 } = {}) {
  const graphCall = constructGraphCallOpenedEvent(basis);
  const frame = constructFrameOpenedEvent(basis);
  const planned = constructVectorTraversalPlannedEvent({ basis, vectorIndex });
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId,
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    graphCallId: graphCall.graphCallId,
    frameId: frame.frameId,
    vectorIndex,
    edge: planned.edge,
    attemptIndex,
    dispatchRef: `dispatch://t106/${attemptIndex}`,
    workerId: "worker://t106",
    backendId: "backend://node",
    resultRef: `result://t106/${attemptIndex}`,
    causationEventRefs: [`dispatch://t106/${attemptIndex}`],
    correlationId: `correlation://t106/${vectorIndex}/${attemptIndex}`
  });
}

function runnerActorInvocationId({ basis, vectorIndex, attemptIndex }) {
  return `actor-invocation:${JSON.stringify({
    basisId: basis.id,
    vectorIndex,
    attemptIndex
  })}`;
}

function runnerInvocationFor({ basis, vectorIndex, attemptIndex }) {
  return invocationFor({
    basis,
    vectorIndex,
    attemptIndex,
    actorInvocationId: runnerActorInvocationId({
      basis,
      vectorIndex,
      attemptIndex
    })
  });
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fulfilledArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "actor result accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function baseEvents({ basis, vectorIndex = 1, invocation } = {}) {
  return [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex }),
    constructActorInvocationStartedEvent(invocation)
  ];
}

function processStartedEvent({ invocation, pid = 4242 } = {}) {
  return constructActorProcessStartedEvent({
    invocation,
    command: "claude",
    args: ["--print"],
    cwd: "/workspace/t106",
    pid,
    terminalSessionId: null,
    timeoutMs: 120000,
    stdoutRef: "asset://t106/stdout",
    stderrRef: "asset://t106/stderr"
  });
}

function silentTimeoutEvents({ basis, invocation, vectorIndex = 1 } = {}) {
  return [
    ...baseEvents({ basis, vectorIndex, invocation }),
    processStartedEvent({ invocation }),
    constructActorProcessTimeoutEvent({
      invocation,
      timeoutMs: 120000,
      elapsedMs: 120001
    }),
    constructActorProcessSignalSentEvent({
      invocation,
      signal: "SIGTERM",
      elapsedMs: 120002
    }),
    constructActorProcessExitedEvent({
      invocation,
      status: null,
      signal: "SIGTERM",
      elapsedMs: 120500,
      timedOut: true,
      error: null
    })
  ];
}

function silentProcessTimeoutEvents({ invocation } = {}) {
  return canonicalRuntimeEvents([
    processStartedEvent({ invocation }),
    constructActorProcessTimeoutEvent({
      invocation,
      timeoutMs: 120000,
      elapsedMs: 120001
    }),
    constructActorProcessSignalSentEvent({
      invocation,
      signal: "SIGTERM",
      elapsedMs: 120002
    }),
    constructActorProcessExitedEvent({
      invocation,
      status: null,
      signal: "SIGTERM",
      elapsedMs: 120500,
      timedOut: true,
      error: null
    })
  ]);
}

function deriveSilentProjection() {
  const basis = buildThreeStageBasis();
  const vectorIndex = 1;
  const invocation = invocationFor({ basis, vectorIndex });
  const events = silentTimeoutEvents({ basis, invocation, vectorIndex });
  const projection = deriveRuntimeAggregateProjection(basis, events);
  return { basis, vectorIndex, invocation, events, projection };
}

test("T-106 derives one retryable no-progress action from silent actor timeout", () => {
  const { basis, vectorIndex, invocation, projection } = deriveSilentProjection();
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId,
    timeoutClass: "inactivity_timeout"
  });

  assert.equal(carrier.kind, "traversal_non_progress_carrier");
  assert.equal(carrier.classification, "non_progress");
  assert.equal(carrier.runtimeFailureClass, "no_output");
  assert.equal(carrier.timeoutClass, "inactivity_timeout");
  assert.equal(carrier.pid, 4242);
  assert.equal(carrier.stdoutBytes, 0);
  assert.equal(carrier.stderrBytes, 0);
  assert.equal(carrier.timeoutObserved, true);
  assert.deepEqual(carrier.signalSequence, [
    { signal: "SIGTERM", elapsedMs: 120002 }
  ]);

  const action = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2
  });
  const summary = deriveTraversalContinuationSummary(action);

  assert.equal(action.action, "retry_same_edge");
  assert.equal(action.publicSummaryAction, "retry_same_edge");
  assert.equal(action.retryEligible, true);
  assert.equal(action.terminal, false);
  assert.equal(action.reason, "retryable_traversal_non_progress");
  assert.equal(summary.action, action.action);
  assert.equal(summary.retryEligible, action.retryEligible);
  assert.equal(summary.reason, action.reason);
  assert.doesNotThrow(() =>
    assertTraversalContinuationSummaryAgreement({
      projection: action,
      summary
    })
  );
});

test("T-106 maps exhausted same-edge no-progress to retry_exhausted, not a private loop", () => {
  const { basis, vectorIndex, invocation, events } = deriveSilentProjection();
  const retryOne = constructRetryRepairPlannedEvent({
    basis,
    vectorIndex,
    edge: invocation.edge,
    attempt: {
      runId: "run://t106/retry/1",
      callId: "call://t106/retry/1",
      manifestId: "manifest://t106/retry/1",
      attemptIndex: 1
    },
    budget: {
      observedAttemptCount: 0,
      maxAttempts: 2,
      remainingAttempts: 2,
      stationary: false
    },
    promptRegeneration: {
      workspaceRoot: basis.workspaceRoot,
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      vectorIndex,
      edge: invocation.edge,
      sourceProjectionRef: "runtime_projection://t106/0"
    },
    manifestRegeneration: {
      priorManifestId: "manifest://t106/0",
      currentManifestId: "manifest://t106/retry/1",
      sourceProjectionRef: "runtime_projection://t106/0"
    },
    continuationRepair: null,
    kind: "retry_planned"
  });
  const retryTwo = constructRetryRepairPlannedEvent({
    basis,
    vectorIndex,
    edge: invocation.edge,
    attempt: {
      runId: "run://t106/retry/2",
      callId: "call://t106/retry/2",
      manifestId: "manifest://t106/retry/2",
      attemptIndex: 2
    },
    budget: {
      observedAttemptCount: 1,
      maxAttempts: 2,
      remainingAttempts: 1,
      stationary: false
    },
    promptRegeneration: {
      workspaceRoot: basis.workspaceRoot,
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      vectorIndex,
      edge: invocation.edge,
      sourceProjectionRef: "runtime_projection://t106/1"
    },
    manifestRegeneration: {
      priorManifestId: "manifest://t106/retry/1",
      currentManifestId: "manifest://t106/retry/2",
      sourceProjectionRef: "runtime_projection://t106/1"
    },
    continuationRepair: null,
    kind: "retry_planned"
  });
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...events,
    retryOne,
    retryTwo
  ]);
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId
  });
  const action = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2
  });

  assert.equal(action.action, "retry_exhausted");
  assert.equal(action.retryEligible, false);
  assert.equal(action.terminal, true);
  assert.equal(action.reason, "retry_budget_exhausted");
  assert.equal(action.retryBudget.observedAttemptCount, 2);
});

test("T-106 refuses no-progress classification when artifact salvage exists", () => {
  const { basis, vectorIndex, invocation, events } = deriveSilentProjection();
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...events,
    constructActorResultArtifactObservedEvent({
      invocation,
      artifactRef: "asset://t106/result.json"
    })
  ]);

  assert.throws(
    () =>
      deriveTraversalNonProgressCarrier({
        basis,
        projection,
        vectorIndex,
        actorInvocationId: invocation.actorInvocationId
      }),
    /artifact salvage/
  );
});

test("T-106 stream progress is not collapsed into silent no-output retry", () => {
  const basis = buildThreeStageBasis();
  const vectorIndex = 1;
  const invocation = invocationFor({ basis, vectorIndex });
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...baseEvents({ basis, vectorIndex, invocation }),
    constructActorProcessStartedEvent({
      invocation,
      command: "claude",
      args: ["--print"],
      cwd: "/workspace/t106",
      pid: 4343,
      terminalSessionId: null,
      timeoutMs: 120000,
      stdoutRef: "asset://t106/stdout",
      stderrRef: "asset://t106/stderr"
    }),
    constructActorProcessStreamObservedEvent({
      invocation,
      streamName: "stdout",
      streamRef: "asset://t106/stdout",
      chunkIndex: 0,
      byteLength: 37
    })
  ]);
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId
  });
  const action = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2
  });

  assert.equal(carrier.classification, "progress_without_result");
  assert.equal(carrier.stdoutBytes, 37);
  assert.equal(action.action, "yield_same_edge_continuation");
  assert.equal(action.retryEligible, false);
  assert.equal(action.terminal, false);
});

test("T-106 missing process evidence pauses for archive inspection", () => {
  const basis = buildThreeStageBasis();
  const vectorIndex = 1;
  const invocation = invocationFor({ basis, vectorIndex });
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...baseEvents({ basis, vectorIndex, invocation })
  ]);
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId
  });
  const action = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2
  });

  assert.equal(carrier.processEvidenceComplete, false);
  assert.equal(carrier.classification, "incomplete_runtime_archive");
  assert.equal(action.action, "inspect_runtime_archive");
  assert.equal(action.retryEligible, false);
  assert.equal(action.terminal, true);
});

test("T-106 timeout classes map through the T-100 retry taxonomy", () => {
  assert.equal(
    runtimeFailureClassForTraversalTimeout("inactivity_timeout"),
    "no_output"
  );
  assert.equal(
    runtimeFailureClassForTraversalTimeout("hard_timeout"),
    "transport_failure"
  );
  assert.equal(
    runtimeFailureClassForTraversalTimeout("transport_exit"),
    "transport_failure"
  );
});

test("T-106 rejects downstream summary action drift", () => {
  const { basis, vectorIndex, invocation, projection } = deriveSilentProjection();
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId
  });
  const action = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2
  });
  const driftedSummary = Object.freeze({
    kind: "traversal_continuation_summary",
    action: "blocked",
    retryEligible: action.retryEligible,
    terminal: action.terminal,
    reason: action.reason,
    evidenceRefs: action.evidenceRefs
  });

  assert.throws(
    () =>
      assertTraversalContinuationSummaryAgreement({
        projection: action,
        summary: driftedSummary
      }),
    /summary action drift/
  );
});

test("T-106 rejects replay drift when a caller forges the carrier", () => {
  const { basis, vectorIndex, invocation, projection } = deriveSilentProjection();
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId
  });
  const forged = Object.freeze({
    ...carrier,
    classification: "progress_without_result"
  });

  assert.throws(
    () =>
      deriveTraversalContinuationActionProjection({
        basis,
        projection,
        carrier: forged,
        maxAttempts: 2
      }),
    /carrier replay drift/
  );
});

test("T-106 refuses report refs before no-progress classification", () => {
  const { basis, vectorIndex, invocation, projection } = deriveSilentProjection();

  assert.throws(
    () =>
      deriveTraversalNonProgressCarrier({
        basis,
        projection,
        vectorIndex,
        actorInvocationId: invocation.actorInvocationId,
        reportRefs: ["report://t106/worker"]
      }),
    /admitted report truth/
  );
});

test("T-106 progress signals and stderr evidence yield same-edge continuation", () => {
  const basis = buildThreeStageBasis();
  const vectorIndex = 1;
  const invocation = invocationFor({ basis, vectorIndex });
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...baseEvents({ basis, vectorIndex, invocation }),
    processStartedEvent({ invocation }),
    constructActorProcessStreamObservedEvent({
      invocation,
      streamName: "stderr",
      streamRef: "asset://t106/stderr",
      chunkIndex: 0,
      byteLength: 19
    })
  ]);
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId,
    progressSignalRefs: ["progress://t106/heartbeat"]
  });
  const action = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2
  });

  assert.equal(carrier.classification, "progress_without_result");
  assert.equal(carrier.stderrBytes, 19);
  assert.deepEqual(carrier.progressSignalRefs, ["progress://t106/heartbeat"]);
  assert.equal(action.action, "yield_same_edge_continuation");
});

test("T-106 infers hard timeout, abnormal transport exit, and clean no-output exit", () => {
  const basis = buildThreeStageBasis();
  const vectorIndex = 1;
  const hardTimeoutInvocation = invocationFor({
    basis,
    vectorIndex,
    actorInvocationId: "actor://t106/hard-timeout"
  });
  const transportExitInvocation = invocationFor({
    basis,
    vectorIndex,
    actorInvocationId: "actor://t106/transport-exit"
  });
  const cleanNoOutputInvocation = invocationFor({
    basis,
    vectorIndex,
    actorInvocationId: "actor://t106/clean-no-output"
  });

  const hardTimeoutProjection = deriveRuntimeAggregateProjection(basis, [
    ...baseEvents({ basis, vectorIndex, invocation: hardTimeoutInvocation }),
    processStartedEvent({ invocation: hardTimeoutInvocation }),
    constructActorProcessExitedEvent({
      invocation: hardTimeoutInvocation,
      status: null,
      signal: "SIGKILL",
      elapsedMs: 200000,
      timedOut: true,
      error: null
    })
  ]);
  const transportExitProjection = deriveRuntimeAggregateProjection(basis, [
    ...baseEvents({ basis, vectorIndex, invocation: transportExitInvocation }),
    processStartedEvent({ invocation: transportExitInvocation }),
    constructActorProcessExitedEvent({
      invocation: transportExitInvocation,
      status: 143,
      signal: null,
      elapsedMs: 2000,
      timedOut: false,
      error: null
    })
  ]);
  const cleanNoOutputProjection = deriveRuntimeAggregateProjection(basis, [
    ...baseEvents({ basis, vectorIndex, invocation: cleanNoOutputInvocation }),
    processStartedEvent({ invocation: cleanNoOutputInvocation }),
    constructActorProcessExitedEvent({
      invocation: cleanNoOutputInvocation,
      status: 0,
      signal: null,
      elapsedMs: 2000,
      timedOut: false,
      error: null
    })
  ]);

  const hardTimeout = deriveTraversalNonProgressCarrier({
    basis,
    projection: hardTimeoutProjection,
    vectorIndex,
    actorInvocationId: hardTimeoutInvocation.actorInvocationId
  });
  const transportExit = deriveTraversalNonProgressCarrier({
    basis,
    projection: transportExitProjection,
    vectorIndex,
    actorInvocationId: transportExitInvocation.actorInvocationId
  });
  const cleanNoOutput = deriveTraversalNonProgressCarrier({
    basis,
    projection: cleanNoOutputProjection,
    vectorIndex,
    actorInvocationId: cleanNoOutputInvocation.actorInvocationId
  });

  assert.equal(hardTimeout.timeoutClass, "hard_timeout");
  assert.equal(hardTimeout.runtimeFailureClass, "transport_failure");
  assert.equal(transportExit.timeoutClass, "transport_exit");
  assert.equal(transportExit.runtimeFailureClass, "transport_failure");
  assert.equal(cleanNoOutput.timeoutClass, null);
  assert.equal(cleanNoOutput.runtimeFailureClass, "no_output");
});

test("T-106 projects policy reprice, blocked, and stationary retry branches", () => {
  const { basis, vectorIndex, invocation, projection } = deriveSilentProjection();
  const carrier = deriveTraversalNonProgressCarrier({
    basis,
    projection,
    vectorIndex,
    actorInvocationId: invocation.actorInvocationId
  });
  const reprice = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2,
    runtimePolicyContradiction: true
  });
  const blocked = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2,
    retryableRuntimeFailureClasses: []
  });
  const stationary = deriveTraversalContinuationActionProjection({
    basis,
    projection,
    carrier,
    maxAttempts: 2,
    stationary: true
  });

  assert.equal(reprice.action, "reprice_runtime_policy");
  assert.equal(reprice.retryEligible, false);
  assert.equal(blocked.action, "blocked");
  assert.equal(blocked.reason, "runtime_failure_class_not_retryable");
  assert.equal(stationary.action, "retry_exhausted");
  assert.equal(stationary.reason, "stationary_retry");
});

test("T-106 runner path consumes silent process truth and retries same edge", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t106-runner"
  });
  const vectorIndex = 0;
  const firstInvocation = runnerInvocationFor({
    basis,
    vectorIndex,
    attemptIndex: 1
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t106-runner-retry"),
    dispatch: (input) => {
      if (input.vectorIndex === 0 && input.actorInvocationRef.attemptIndex === 1) {
        return constructFpDispatchOutcome({
          status: "blocked",
          resultRef: "result://t106-runner/no-output",
          reason: "worker produced no output"
        });
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t106-runner/${input.vectorIndex}/${input.actorInvocationRef.attemptIndex}`,
        attachedResultArtifact: fulfilledArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    runtimeEvents: silentProcessTimeoutEvents({ invocation: firstInvocation }),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(
    events.some((event) => event.kind === "retry_repair_planned"),
    true
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "actor_invocation_started" && event.vectorIndex === 0)
      .map((event) => event.attemptIndex),
    [1, 2]
  );
});

test("T-106 runner path renders inspect archive when process evidence is missing", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t106-runner"
  });
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t106-runner-inspect"),
    dispatch: () =>
      constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t106-runner/missing-process",
        reason: "worker status unavailable"
      })
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => {},
    plugins: { fpDispatch }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason ?? "", /inspect_runtime_archive/u);
  assert.match(result.transition.reason ?? "", /missing_process_evidence/u);
});
