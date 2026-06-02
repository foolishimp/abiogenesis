// Validates: T-129
// Validates: REQ-R-ABG3-TRANSPORT-025
// Validates: REQ-R-ABG3-TRANSPORT-026
// Validates: REQ-R-ABG3-TRANSPORT-027
// Validates: REQ-R-ABG3-TRANSPORT-028
// Validates: REQ-R-ABG3-TRANSPORT-029
// Validates: REQ-R-ABG3-EVENTS-022
// Validates: REQ-R-ABG3-EVENTS-023
// Validates: REQ-R-ABG3-PROJECTION-016
// Validates: REQ-R-ABG3-PROJECTION-017
// Validates: REQ-R-ABG3-RETRY-009

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  assertRuntimeEvent,
  constructActorInvocationStartedEvent,
  constructActorProcessExitedEvent,
  constructActorProcessHeartbeatEvent,
  constructActorProcessSignalSentEvent,
  constructActorProcessStartedEvent,
  constructActorProcessStreamObservedEvent,
  constructActorProcessTimeoutEvent,
  constructActorResultArtifactObservedEvent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructRuntimeActivityProbeObservedEvent,
  constructRuntimeExternalInterruptionObservedEvent,
  constructRuntimeFluent,
  constructRuntimeSystemProbeContract,
  constructRuntimeWatchdogPolicy,
  constructVectorTraversalPlannedEvent,
  deriveRuntimeEventCalculusProjection,
  deriveRuntimeLivenessObserverProjection,
  holdsAt,
  invokeSupervisedProcessActor
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function runtimeFixture({ vectorIndex = 1, actorInvocationId = "actor://t129/1" } = {}) {
  const basis = buildThreeStageBasis();
  const graphCall = constructGraphCallOpenedEvent(basis);
  const frame = constructFrameOpenedEvent(basis);
  const planned = constructVectorTraversalPlannedEvent({ basis, vectorIndex });
  const invocation = Object.freeze({
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
    attemptIndex: 1,
    dispatchRef: "dispatch://t129",
    workerId: "worker://t129",
    backendId: "backend://node",
    resultRef: "result://t129",
    causationEventRefs: ["dispatch://t129"],
    correlationId: "correlation://t129"
  });
  const baseEvents = Object.freeze([
    graphCall,
    frame,
    planned,
    constructActorInvocationStartedEvent(invocation)
  ]);
  return { basis, graphCall, frame, planned, invocation, baseEvents };
}

function processStartedEvent(invocation) {
  return constructActorProcessStartedEvent({
    invocation,
    command: "claude",
    args: ["--print"],
    cwd: "/workspace/t129",
    pid: 1290,
    terminalSessionId: "terminal://t129",
    timeoutMs: 1_200_000,
    stdoutRef: "asset://t129/stdout",
    stderrRef: "asset://t129/stderr"
  });
}

function policy(overrides = {}) {
  return constructRuntimeWatchdogPolicy({
    policyRef: "runtime-watchdog-policy://t129",
    startupSilenceLeaseMs: 1_000,
    inactivityLeaseMs: 3_000,
    terminationGraceMs: 500,
    hardSafetyCapMs: 1_200_000,
    nowElapsedMs: 7_500,
    retryBudgetRemaining: 1,
    ...overrides
  });
}

function explicitProbe({ invocation, source, activityRef, elapsedMs, evidenceRefs }) {
  return constructRuntimeActivityProbeObservedEvent({
    basisId: invocation.basisId,
    graphFunctionId: invocation.graphFunctionId,
    runId: invocation.runId,
    workKey: invocation.workKey,
    graphCallId: invocation.graphCallId,
    frameId: invocation.frameId,
    vectorIndex: invocation.vectorIndex,
    edge: invocation.edge,
    actorInvocationId: invocation.actorInvocationId,
    workerId: invocation.workerId,
    backendId: invocation.backendId,
    systemRef: invocation.actorInvocationId,
    probeRef: `runtime-probe:${invocation.actorInvocationId}:${source}`,
    probeSource: source,
    activityRef,
    elapsedMs,
    observedAtMs: elapsedMs,
    evidenceRefs,
    causationEventRefs: [activityRef],
    correlationId: invocation.correlationId
  });
}

function explicitInterruption({ invocation, elapsedMs = 20_000, signal = "SIGTERM" } = {}) {
  return constructRuntimeExternalInterruptionObservedEvent({
    basisId: invocation.basisId,
    graphFunctionId: invocation.graphFunctionId,
    runId: invocation.runId,
    workKey: invocation.workKey,
    graphCallId: invocation.graphCallId,
    frameId: invocation.frameId,
    vectorIndex: invocation.vectorIndex,
    edge: invocation.edge,
    actorInvocationId: invocation.actorInvocationId,
    workerId: invocation.workerId,
    backendId: invocation.backendId,
    systemRef: invocation.actorInvocationId,
    interruptionRef: `external-interruption:${invocation.actorInvocationId}:${elapsedMs}`,
    interruptionSource: "harness_safety_cap",
    signal,
    elapsedMs,
    observedAtMs: elapsedMs,
    evidenceRefs: [`signal:${signal}:${elapsedMs}`],
    causationEventRefs: [`signal:${signal}:${elapsedMs}`],
    correlationId: invocation.correlationId
  });
}

function probeContractsFor(events) {
  return events
    .filter((event) => event.kind === "runtime_activity_probe_observed")
    .map((event) =>
      constructRuntimeSystemProbeContract({
        probeRef: event.probeRef,
        systemRef: event.systemRef,
        source: event.probeSource,
        basisId: event.basisId,
        graphFunctionId: event.graphFunctionId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        actorInvocationId: event.actorInvocationId,
        evidenceRefs: event.evidenceRefs
      })
    );
}

test("T-129 normalizes process streams and runtime asset writes into one active observer", () => {
  const { basis, invocation, baseEvents } = runtimeFixture();
  const events = [
    ...baseEvents,
    processStartedEvent(invocation),
    constructActorProcessStreamObservedEvent({
      invocation,
      streamName: "stdout",
      streamRef: "asset://t129/stdout",
      chunkIndex: 0,
      byteLength: 10
    }),
    constructActorProcessStreamObservedEvent({
      invocation,
      streamName: "stderr",
      streamRef: "asset://t129/stderr",
      chunkIndex: 0,
      byteLength: 8
    }),
    constructActorProcessHeartbeatEvent({
      invocation,
      heartbeatIndex: 0,
      elapsedMs: 4_000
    }),
    explicitProbe({
      invocation,
      source: "pty_transcript",
      activityRef: "terminal://t129/transcript#1",
      elapsedMs: 5_000,
      evidenceRefs: ["terminal://t129/transcript"]
    }),
    explicitProbe({
      invocation,
      source: "runtime_event_append",
      activityRef: "event://t129/runtime-events#5",
      elapsedMs: 5_200,
      evidenceRefs: ["event://t129/runtime-events"]
    }),
    explicitProbe({
      invocation,
      source: "runtime_ledger_write",
      activityRef: "ledger://t129/traversal#2",
      elapsedMs: 5_400,
      evidenceRefs: ["ledger://t129/traversal"]
    }),
    explicitProbe({
      invocation,
      source: "runtime_manifest_write",
      activityRef: "manifest://t129/handoff#1",
      elapsedMs: 5_600,
      evidenceRefs: ["manifest://t129/handoff"]
    }),
    explicitProbe({
      invocation,
      source: "structured_agent_stream",
      activityRef: "structured://t129/stream#1",
      elapsedMs: 6_000,
      evidenceRefs: ["structured://t129/stream"]
    }),
    explicitProbe({
      invocation,
      source: "archive_write",
      activityRef: "archive://t129/report",
      elapsedMs: 7_000,
      evidenceRefs: ["archive://t129/report"]
    }),
    explicitProbe({
      invocation,
      source: "runtime_projection_write",
      activityRef: "projection://t129/gaps#1",
      elapsedMs: 7_200,
      evidenceRefs: ["projection://t129/gaps"]
    })
  ];

  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events,
    probeContracts: probeContractsFor(events),
    policy: policy()
  });

  assert.equal(projection.kind, "runtime_liveness_observer_projection");
  assert.equal(projection.leaseState, "active");
  assert.equal(projection.disposition.action, "continue_waiting");
  assert.equal(projection.lastActivity.activityRef, "projection://t129/gaps#1");
  assert.equal(projection.activityRows.some((row) => row.source === "local_spawn_stdout"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "local_spawn_stderr"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "pty_transcript"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "runtime_event_append"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "runtime_ledger_write"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "runtime_manifest_write"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "actor_process_heartbeat"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "archive_write"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "runtime_projection_write"), true);
  assert.equal(projection.activityRows.some((row) => row.source === "structured_agent_stream"), true);
  assert.deepEqual(projection.interruptedSystemRefs, []);
  assert.equal(projection.activeSystemRefs.includes(invocation.actorInvocationId), true);
});

test("T-129 rejects explicit probe activity with no declared probe contract", () => {
  const { basis, invocation } = runtimeFixture();
  const events = [
    explicitProbe({
      invocation,
      source: "runtime_ledger_write",
      activityRef: "ledger://t129/undeclared",
      elapsedMs: 1_000,
      evidenceRefs: ["ledger://t129/undeclared"]
    })
  ];

  assert.throws(
    () =>
      deriveRuntimeLivenessObserverProjection({
        basis,
        events,
        policy: policy({ nowElapsedMs: 1_500 })
      }),
    /requires declared probe contract/u
  );
});

test("T-129 projection identity changes when same-count activity evidence changes", () => {
  const { basis, invocation } = runtimeFixture();
  const firstEvents = [
    explicitProbe({
      invocation,
      source: "runtime_ledger_write",
      activityRef: "ledger://t129/traversal#first",
      elapsedMs: 1_000,
      evidenceRefs: ["ledger://t129/traversal#first"]
    })
  ];
  const secondEvents = [
    explicitProbe({
      invocation,
      source: "runtime_ledger_write",
      activityRef: "ledger://t129/traversal#second",
      elapsedMs: 1_000,
      evidenceRefs: ["ledger://t129/traversal#second"]
    })
  ];
  const firstProjection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: firstEvents,
    probeContracts: probeContractsFor(firstEvents),
    policy: policy({ nowElapsedMs: 1_500 })
  });
  const secondProjection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: secondEvents,
    probeContracts: probeContractsFor(secondEvents),
    policy: policy({ nowElapsedMs: 1_500 })
  });

  assert.equal(firstProjection.leaseState, "active");
  assert.equal(secondProjection.leaseState, "active");
  assert.notEqual(firstProjection.projectionRef, secondProjection.projectionRef);
});

test("T-129 no activity past startup lease becomes retryable inactivity truth", () => {
  const { basis, baseEvents } = runtimeFixture();
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: baseEvents,
    policy: policy({ nowElapsedMs: 5_000, retryBudgetRemaining: 1 })
  });

  assert.equal(projection.leaseState, "startup_silence_exceeded");
  assert.equal(projection.disposition.action, "retry");
  assert.equal(projection.disposition.reason, "startup_silence_exceeded");
});

test("T-129 admitted worker progress resets an otherwise expired inactivity lease", () => {
  const { basis, invocation, baseEvents } = runtimeFixture();
  const staleEvents = [
    ...baseEvents,
    processStartedEvent(invocation),
    constructActorProcessHeartbeatEvent({
      invocation,
      heartbeatIndex: 0,
      elapsedMs: 1_000
    })
  ];
  const expiredProjection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: staleEvents,
    policy: policy({ nowElapsedMs: 5_500, retryBudgetRemaining: 1 })
  });
  const sensorEvent = explicitProbe({
    invocation,
    source: "structured_agent_stream",
    activityRef: "structured://t129/worker-progress",
    elapsedMs: 5_200,
    evidenceRefs: ["structured://t129/worker-progress"]
  });
  const resetEvents = [...staleEvents, sensorEvent];
  const resetProjection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: resetEvents,
    probeContracts: probeContractsFor([sensorEvent]),
    policy: policy({ nowElapsedMs: 5_500, retryBudgetRemaining: 1 })
  });

  assert.equal(expiredProjection.leaseState, "inactivity_exceeded");
  assert.equal(expiredProjection.disposition.action, "retry");
  assert.equal(resetProjection.leaseState, "active");
  assert.equal(resetProjection.disposition.action, "continue_waiting");
  assert.equal(resetProjection.lastActivity.activityRef, "structured://t129/worker-progress");
});

test("T-188 heartbeat-only liveness does not reset worker progress inactivity lease", () => {
  const { basis, invocation, baseEvents } = runtimeFixture();
  const heartbeat = constructActorProcessHeartbeatEvent({
    invocation,
    heartbeatIndex: 1,
    elapsedMs: 7_000
  });
  const heartbeatProbe = explicitProbe({
    invocation,
    source: "actor_process_heartbeat",
    activityRef: `actor-process-heartbeat:${invocation.actorInvocationId}:1`,
    elapsedMs: 7_000,
    evidenceRefs: [`event:${heartbeat.kind}:${invocation.actorInvocationId}:1`]
  });
  const events = [
    ...baseEvents,
    processStartedEvent(invocation),
    heartbeat,
    heartbeatProbe
  ];
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events,
    probeContracts: probeContractsFor([heartbeatProbe]),
    policy: policy({ nowElapsedMs: 7_500, retryBudgetRemaining: 1 })
  });

  assert.equal(projection.lastActivity.source, "actor_process_heartbeat");
  assert.equal(projection.leaseState, "inactivity_exceeded");
  assert.equal(projection.disposition.action, "retry");
  assert.equal(projection.disposition.reason, "inactivity_lease_exceeded");
  assert.deepEqual(projection.activeSystemRefs, []);
  assert.equal(projection.inactiveSystemRefs.includes(invocation.actorInvocationId), true);
});

test("T-129 legacy activity without elapsed time cannot suppress inactivity forever", () => {
  const { basis, invocation, baseEvents } = runtimeFixture();
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: [
      ...baseEvents,
      constructActorProcessStreamObservedEvent({
        invocation,
        streamName: "stdout",
        streamRef: "asset://t129/stdout",
        chunkIndex: 0,
        byteLength: 12
      })
    ],
    policy: policy({ nowElapsedMs: 10_000, retryBudgetRemaining: 1 })
  });

  assert.equal(projection.leaseState, "inactivity_exceeded");
  assert.equal(projection.disposition.action, "retry");
});

test("T-129 retry budget exhaustion blocks before dispatch after inactivity lease expiry", () => {
  const { basis, invocation, baseEvents } = runtimeFixture();
  const events = [
    ...baseEvents,
    processStartedEvent(invocation),
    constructActorProcessHeartbeatEvent({
      invocation,
      heartbeatIndex: 0,
      elapsedMs: 1_000
    })
  ];
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events,
    policy: policy({ nowElapsedMs: 8_000, retryBudgetRemaining: 0 })
  });

  assert.equal(projection.leaseState, "inactivity_exceeded");
  assert.equal(projection.disposition.action, "block");
  assert.equal(
    projection.disposition.reason,
    "retry_budget_exhausted_before_dispatch"
  );
});

test("T-129 external SIGTERM interruption is admitted and blocks through Event Calculus truth", () => {
  const { basis, invocation } = runtimeFixture();
  const activity = explicitProbe({
    invocation,
    source: "runtime_event_append",
    activityRef: "event://t129/activity",
    elapsedMs: 1_000,
    evidenceRefs: ["event://t129/activity"]
  });
  const interruption = explicitInterruption({ invocation });

  for (const event of [activity, interruption]) {
    assertRuntimeEvent(event);
  }

  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: [activity, interruption],
    probeContracts: probeContractsFor([activity]),
    policy: policy({ nowElapsedMs: 20_000, retryBudgetRemaining: 1 })
  });
  assert.equal(projection.leaseState, "externally_interrupted");
  assert.equal(projection.disposition.action, "block");
  assert.equal(projection.interruptedSystemRefs[0], invocation.actorInvocationId);

  const ec = deriveRuntimeEventCalculusProjection({
    basis,
    events: [activity, interruption]
  });
  assert.equal(
    holdsAt(
      ec,
      constructRuntimeFluent({
        name: "runtime_externally_interrupted",
        scope: "liveness",
        basisId: invocation.basisId,
        graphFunctionId: invocation.graphFunctionId,
        graphCallId: invocation.graphCallId,
        frameId: invocation.frameId,
        runId: invocation.runId,
        workKey: invocation.workKey,
        vectorIndex: invocation.vectorIndex,
        edge: invocation.edge,
        constraintRef: invocation.actorInvocationId,
        ref: interruption.interruptionRef
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      ec,
      constructRuntimeFluent({
        name: "runtime_invocation_blocked",
        scope: "liveness",
        basisId: invocation.basisId,
        graphFunctionId: invocation.graphFunctionId,
        graphCallId: invocation.graphCallId,
        frameId: invocation.frameId,
        runId: invocation.runId,
        workKey: invocation.workKey,
        vectorIndex: invocation.vectorIndex,
        edge: invocation.edge,
        constraintRef: invocation.actorInvocationId,
        ref: interruption.interruptionRef
      })
    ),
    true
  );
});

test("T-129 hard safety cap without typed interruption requires interruption evidence instead of retry authority", () => {
  const { basis, invocation } = runtimeFixture();
  const events = [
    explicitProbe({
      invocation,
      source: "runtime_event_append",
      activityRef: "event://t129/recent",
      elapsedMs: 9_000,
      evidenceRefs: ["event://t129/recent"]
    })
  ];
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events,
    probeContracts: probeContractsFor(events),
    policy: policy({
      nowElapsedMs: 20_000,
      inactivityLeaseMs: 30_000,
      hardSafetyCapMs: 10_000,
      retryBudgetRemaining: 2
    })
  });

  assert.equal(
    projection.leaseState,
    "hard_safety_cap_requires_interruption_event"
  );
  assert.equal(projection.requiresExternalInterruptionEvent, true);
  assert.equal(projection.disposition.action, "controlled_terminate");
  assert.equal(
    projection.disposition.reason,
    "hard_safety_cap_requires_external_interruption_event"
  );
});

test("T-129 result artifact salvage is inspected before non-progress retry after timeout evidence", () => {
  const { basis, invocation, baseEvents } = runtimeFixture();
  const events = [
    ...baseEvents,
    processStartedEvent(invocation),
    constructActorResultArtifactObservedEvent({
      invocation,
      artifactRef: "artifact://t129/result"
    }),
    constructActorProcessTimeoutEvent({
      invocation,
      timeoutMs: 10_000,
      elapsedMs: 10_001
    }),
    constructActorProcessSignalSentEvent({
      invocation,
      signal: "SIGTERM",
      elapsedMs: 10_002
    }),
    constructActorProcessExitedEvent({
      invocation,
      status: null,
      signal: "SIGTERM",
      elapsedMs: 10_500,
      timedOut: true,
      error: null
    })
  ];
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events,
    policy: policy({ nowElapsedMs: 10_500, retryBudgetRemaining: 1 })
  });

  assert.equal(projection.leaseState, "externally_interrupted");
  assert.equal(projection.lastArtifactActivity.activityRef, "artifact://t129/result");
  assert.equal(projection.disposition.action, "inspect_archive");
  assert.equal(projection.disposition.reason, "artifact_observed_before_failure");
});

test("T-129 supervised actor emits generic probe facts for stdout stderr and heartbeat", async () => {
  const { basis, invocation } = runtimeFixture();
  const root = mkdtempSync(join(tmpdir(), "abg-t129-liveness-"));
  const result = await invokeSupervisedProcessActor({
    invocation,
    command: process.execPath,
    args: [
      "-e",
      "console.log('stdout-probe'); console.error('stderr-probe'); setTimeout(() => console.log('late-stdout-probe'), 80);"
    ],
    cwd: root,
    environment: process.env,
    stdoutPath: join(root, "stdout.log"),
    stderrPath: join(root, "stderr.log"),
    stdoutRef: "asset://t129/supervised/stdout",
    stderrRef: "asset://t129/supervised/stderr",
    processEventsPath: join(root, "process-events.jsonl"),
    timeoutMs: 1_000,
    terminationGraceMs: 50,
    heartbeatMs: 10
  });

  assert.equal(result.status, 0);
  const probeSources = new Set(
    result.events
      .filter((event) => event.kind === "runtime_activity_probe_observed")
      .map((event) => event.probeSource)
  );
  assert.equal(probeSources.has("local_spawn_stdout"), true);
  assert.equal(probeSources.has("local_spawn_stderr"), true);
  assert.equal(probeSources.has("actor_process_heartbeat"), true);

  const latestElapsedMs = Math.max(
    ...result.events
      .filter((event) => event.kind === "runtime_activity_probe_observed")
      .map((event) => event.elapsedMs)
  );
  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: result.events,
    probeContracts: result.probeContracts,
    policy: policy({
      inactivityLeaseMs: 1_000,
      nowElapsedMs: latestElapsedMs + 50
    })
  });
  assert.equal(projection.leaseState, "active");
  assert.equal(projection.disposition.action, "continue_waiting");
});
