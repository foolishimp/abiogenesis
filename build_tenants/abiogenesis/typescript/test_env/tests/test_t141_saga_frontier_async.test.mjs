// Validates: T-141
// Validates: REQ-R-ABG3-SAGA-FRONTIER

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructBranchAttemptRef,
  constructBranchExecutionPolicy,
  constructBranchLeaseAcquiredEvent,
  constructBranchLeaseReleasedEvent,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchFanInProjectionFromEvents,
  deriveBranchIdempotencyKey,
  deriveBranchLeaseProjectionFromEvents,
  deriveDependencyFrontierProjection,
  runEventedNativeSagaFrontier,
  runNativeSagaFrontier,
  selectDisjointReadyBranches
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function branch(branchKey, input = {}) {
  return constructBranchRef({
    graphCallId: "graph-call://t141/async/1",
    frameId: "frame://t141/async/root",
    vectorIndex: 0,
    branchKey,
    fanInScopeRef: "fan-in://t141/async/root",
    ...input
  });
}

function declaration(branchRef, input = {}) {
  const observedStateRefs = input.observedStateRefs ?? ["observed://t141/async/current"];
  const writeTerritoryRefs =
    input.writeTerritoryRefs ?? [`write://t141/async/${branchRef.branchKey}`];
  const outputAllocationRefs =
    input.outputAllocationRefs ?? [`output://t141/async/${branchRef.branchKey}`];
  const key = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef,
    branchAttemptRef: input.branchAttemptRef ?? null,
    observedStateRefs,
    writeTerritoryRefs,
    outputAllocationRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef,
    parentBranchRefs: input.parentBranchRefs ?? [],
    observedStateRefs,
    readRefs: input.readRefs ?? ["read://t141/async/shared"],
    writeTerritoryRefs,
    outputAllocationRefs,
    idempotencyKey: key,
    declaredPriority: input.declaredPriority ?? 0,
    criticalPathCost: input.criticalPathCost ?? 0
  });
}

function counters() {
  return {
    active: 0,
    maxActive: 0,
    started: [],
    completed: []
  };
}

function delayedTask(branchRef, input = {}) {
  const delayMs = input.delayMs ?? 0;
  const runCounters = input.counters ?? counters();
  const log = input.log ?? [];
  const emittedEvents = input.emittedEvents ?? null;
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: branchRef.branchRef,
    run: async () => {
      if (emittedEvents !== null) {
        log.push(
          `start-visible-events:${branchRef.branchKey}:${emittedEvents
            .map((event) => event.kind)
            .join(",")}`
        );
      }
      runCounters.active += 1;
      runCounters.maxActive = Math.max(runCounters.maxActive, runCounters.active);
      runCounters.started.push(branchRef.branchRef);
      log.push(`start:${branchRef.branchKey}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      runCounters.active -= 1;
      runCounters.completed.push(branchRef.branchRef);
      log.push(`finish:${branchRef.branchKey}`);
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: branchRef.branchRef,
        payloadDigest: `sha256:t141:async:${branchRef.branchKey}`,
        evidenceRefs: [`evidence://t141/async/${branchRef.branchKey}`]
      });
    }
  });
}

function failingTask(branchRef, input = {}) {
  const delayMs = input.delayMs ?? 0;
  const runCounters = input.counters ?? counters();
  const log = input.log ?? [];
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: branchRef.branchRef,
    run: async () => {
      runCounters.active += 1;
      runCounters.maxActive = Math.max(runCounters.maxActive, runCounters.active);
      runCounters.started.push(branchRef.branchRef);
      log.push(`start:${branchRef.branchKey}`);
      try {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        throw new Error(`planned failure for ${branchRef.branchKey}`);
      } finally {
        runCounters.active -= 1;
        log.push(`fail:${branchRef.branchKey}`);
      }
    }
  });
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function randomMembers(values, count, random, excludedRefs = new Set()) {
  const candidates = values.filter((value) => !excludedRefs.has(value.branchRef));
  const selected = [];
  while (selected.length < count && candidates.length > 0) {
    const index = Math.floor(random() * candidates.length);
    selected.push(candidates.splice(index, 1)[0]);
  }
  return selected;
}

function uniqueBranches(values) {
  const byRef = new Map();
  for (const value of values) {
    byRef.set(value.branchRef, value);
  }
  return [...byRef.values()];
}

test("T-141 async suite proves serial and bounded-parallel realization preserve product meaning", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("meaning-alpha");
  const beta = branch("meaning-beta");
  const child = branch("meaning-child");
  const declarations = Object.freeze([
    declaration(alpha, { declaredPriority: 30 }),
    declaration(beta, { declaredPriority: 20 }),
    declaration(child, {
      declaredPriority: 10,
      parentBranchRefs: [alpha.branchRef, beta.branchRef]
    })
  ]);
  const declaredOrderBranchRefs = [alpha.branchRef, beta.branchRef, child.branchRef];
  const serialCounters = counters();
  const parallelCounters = counters();
  const serialEvents = [];
  const parallelEvents = [];
  const serialLog = [];
  const parallelLog = [];

  const serial = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/serial-meaning",
    declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/serial-meaning",
      maxConcurrency: 1,
      resolvedSystemPolicyRefs: ["abg-default://saga-frontier/max-concurrency/serial"]
    }),
    tasks: [
      delayedTask(alpha, { delayMs: 8, counters: serialCounters, log: serialLog }),
      delayedTask(beta, { delayMs: 1, counters: serialCounters, log: serialLog }),
      delayedTask(child, { delayMs: 0, counters: serialCounters, log: serialLog })
    ],
    eventSink: (event) => {
      serialEvents.push(event);
    },
    correlationId: "correlation://t141/async/serial-meaning"
  });
  const parallel = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/parallel-meaning",
    declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/parallel-meaning",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: ["abg-default://saga-frontier/max-concurrency/two"]
    }),
    tasks: [
      delayedTask(alpha, { delayMs: 8, counters: parallelCounters, log: parallelLog }),
      delayedTask(beta, { delayMs: 1, counters: parallelCounters, log: parallelLog }),
      delayedTask(child, { delayMs: 0, counters: parallelCounters, log: parallelLog })
    ],
    eventSink: (event) => {
      parallelEvents.push(event);
    },
    correlationId: "correlation://t141/async/parallel-meaning"
  });
  const serialFanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: alpha.fanInScopeRef,
    events: serial.replayEvents,
    declaredOrderBranchRefs
  });
  const parallelFanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: alpha.fanInScopeRef,
    events: parallel.replayEvents,
    declaredOrderBranchRefs
  });

  assert.equal(serialCounters.maxActive, 1);
  assert.equal(parallelCounters.maxActive, 2);
  assert.equal(serial.batchCount, 3);
  assert.equal(parallel.batchCount, 2);
  assert.deepEqual(serial.completedBranchRefs, declaredOrderBranchRefs.slice().sort());
  assert.deepEqual(parallel.completedBranchRefs, declaredOrderBranchRefs.slice().sort());
  assert.deepEqual(parallel.batches[0].selection.selectedBranchRefs, [
    alpha.branchRef,
    beta.branchRef
  ]);
  assert.deepEqual(parallel.batches[1].selection.selectedBranchRefs, [child.branchRef]);
  const firstParentFinish = Math.min(
    parallelLog.indexOf("finish:meaning-alpha"),
    parallelLog.indexOf("finish:meaning-beta")
  );
  const lastParentFinish = Math.max(
    parallelLog.indexOf("finish:meaning-alpha"),
    parallelLog.indexOf("finish:meaning-beta")
  );
  assert.ok(parallelLog.indexOf("start:meaning-alpha") < firstParentFinish);
  assert.ok(parallelLog.indexOf("start:meaning-beta") < firstParentFinish);
  assert.ok(parallelLog.indexOf("start:meaning-child") > lastParentFinish);
  assert.deepEqual(serialFanIn.orderedBranchRefs, declaredOrderBranchRefs);
  assert.deepEqual(parallelFanIn.orderedBranchRefs, declaredOrderBranchRefs);
  assert.equal(serialFanIn.fanInDigest, parallelFanIn.fanInDigest);
  assert.deepEqual(serial.emittedEvents, serialEvents);
  assert.deepEqual(parallel.emittedEvents, parallelEvents);
});

test("T-141/T-167 synthetic scenario fans out configured reviewers before ticket routing", async () => {
  const basis = buildThreeStageBasis();
  const reviewerFanInRef = "fan-in://t141/async/t167/reviewer-findings";
  const reducerFanInRef = "fan-in://t141/async/t167/reduction";
  const routeFanInRef = "fan-in://t141/async/t167/ticket-routing";
  const codexReviewer = branch("t167-reviewer-codex", {
    fanInScopeRef: reviewerFanInRef
  });
  const claudeReviewer = branch("t167-reviewer-claude", {
    fanInScopeRef: reviewerFanInRef
  });
  const reducer = branch("t167-reduce-findings", {
    fanInScopeRef: reducerFanInRef
  });
  const router = branch("t167-route-ticket-decisions", {
    fanInScopeRef: routeFanInRef
  });
  const runCounters = counters();
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/t167-review-ticket-routing",
    declarations: [
      declaration(codexReviewer, {
        declaredPriority: 40,
        readRefs: ["ticket://odd-sdlc/T-167"],
        outputAllocationRefs: [
          "output://t141/async/t167/reviewer-findings/codex"
        ]
      }),
      declaration(claudeReviewer, {
        declaredPriority: 30,
        readRefs: ["ticket://odd-sdlc/T-167"],
        outputAllocationRefs: [
          "output://t141/async/t167/reviewer-findings/claude"
        ]
      }),
      declaration(reducer, {
        declaredPriority: 20,
        parentBranchRefs: [
          codexReviewer.branchRef,
          claudeReviewer.branchRef
        ],
        readRefs: [
          "output://t141/async/t167/reviewer-findings/codex",
          "output://t141/async/t167/reviewer-findings/claude"
        ],
        outputAllocationRefs: ["output://t141/async/t167/decision-rows"]
      }),
      declaration(router, {
        declaredPriority: 10,
        parentBranchRefs: [reducer.branchRef],
        readRefs: ["output://t141/async/t167/decision-rows"],
        outputAllocationRefs: ["output://t141/async/t167/draft-tickets"]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/t167-review-ticket-routing",
      maxConcurrency: 2
    }),
    tasks: [
      delayedTask(codexReviewer, { delayMs: 8, counters: runCounters }),
      delayedTask(claudeReviewer, { delayMs: 1, counters: runCounters }),
      delayedTask(reducer, { delayMs: 1, counters: runCounters }),
      delayedTask(router, { delayMs: 1, counters: runCounters })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/async/t167-review-ticket-routing"
  });
  const reviewerFanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: reviewerFanInRef,
    events: result.replayEvents,
    declaredOrderBranchRefs: [
      codexReviewer.branchRef,
      claudeReviewer.branchRef
    ]
  });

  assert.equal(runCounters.maxActive, 2);
  assert.equal(result.batchCount, 3);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [
    codexReviewer.branchRef,
    claudeReviewer.branchRef
  ]);
  assert.deepEqual(result.batches[1].selection.selectedBranchRefs, [
    reducer.branchRef
  ]);
  assert.deepEqual(result.batches[2].selection.selectedBranchRefs, [
    router.branchRef
  ]);
  assert.deepEqual(reviewerFanIn.orderedBranchRefs, [
    codexReviewer.branchRef,
    claudeReviewer.branchRef
  ]);
  assert.deepEqual(result.failedBranchRefs, []);
});

test("T-141 async suite emits branch leases before any native branch effect begins", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("lease-before-effect-alpha");
  const beta = branch("lease-before-effect-beta");
  const emitted = [];
  const log = [];
  await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/lease-before-effect",
    declarations: [
      declaration(alpha, { declaredPriority: 20 }),
      declaration(beta, { declaredPriority: 10 })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/lease-before-effect",
      maxConcurrency: 2
    }),
    tasks: [
      delayedTask(alpha, { delayMs: 2, emittedEvents: emitted, log }),
      delayedTask(beta, { delayMs: 2, emittedEvents: emitted, log })
    ],
    eventSink: (event) => {
      emitted.push(event);
    },
    correlationId: "correlation://t141/async/lease-before-effect"
  });

  assert.deepEqual(
    log
      .filter((entry) => entry.startsWith("start-visible-events:"))
      .map((entry) => entry.split(":").at(-1)),
    [
      "branch_lease_acquired,branch_lease_acquired",
      "branch_lease_acquired,branch_lease_acquired"
    ]
  );
});

test("T-141 async suite pins replay event order within each branch batch", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("event-order-alpha");
  const beta = branch("event-order-beta");
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/event-order",
    declarations: [
      declaration(alpha, { declaredPriority: 20 }),
      declaration(beta, { declaredPriority: 10 })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/event-order",
      maxConcurrency: 2
    }),
    tasks: [
      delayedTask(alpha, { delayMs: 1 }),
      delayedTask(beta, { delayMs: 1 })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/async/event-order"
  });

  assert.deepEqual(
    result.batches[0].emittedEvents.map((event) => event.kind),
    [
      "branch_lease_acquired",
      "branch_lease_acquired",
      "branch_payload_admitted",
      "branch_payload_admitted",
      "branch_lease_released",
      "branch_lease_released",
      "branch_fan_in_projected"
    ]
  );
});

test("T-141 async suite treats event-store failure as a hard boundary before dispatch", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("event-store-alpha");
  const runCounters = counters();
  await assert.rejects(
    async () =>
      runEventedNativeSagaFrontier({
        basis,
        frontierRef: "frontier://t141/async/event-store-boundary",
        declarations: [declaration(alpha)],
        policy: constructBranchExecutionPolicy({
          policyRef: "policy://t141/async/event-store-boundary",
          maxConcurrency: 1
        }),
        tasks: [delayedTask(alpha, { counters: runCounters })],
        eventSink: () => {
          throw new Error("event append unavailable");
        },
        correlationId: "correlation://t141/async/event-store-boundary"
      }),
    /event append unavailable/
  );

  assert.deepEqual(runCounters.started, []);
  assert.equal(runCounters.maxActive, 0);
});

test("T-141 async suite emits failure and releases leases when a native branch task rejects", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("throwing-alpha");
  const beta = branch("throwing-beta");
  const emitted = [];
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/task-rejection",
    declarations: [
      declaration(alpha, { declaredPriority: 20 }),
      declaration(beta, { declaredPriority: 10 })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/task-rejection",
      maxConcurrency: 2,
      preserveEvidenceOnCancellation: true
    }),
    tasks: [
      failingTask(alpha, { delayMs: 1 }),
      delayedTask(beta, { delayMs: 1 })
    ],
    eventSink: (event) => {
      emitted.push(event);
    },
    correlationId: "correlation://t141/async/task-rejection"
  });

  assert.equal(result.batchCount, 1);
  assert.deepEqual(result.completedBranchRefs, [beta.branchRef]);
  assert.deepEqual(result.deferredBranchRefs, []);
  assert.deepEqual(result.failedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(result.emittedEvents, emitted);
  assert.deepEqual(
    result.batches[0].emittedEvents.map((event) => event.kind),
    [
      "branch_lease_acquired",
      "branch_lease_acquired",
      "branch_payload_admitted",
      "branch_task_failed",
      "branch_lease_released",
      "branch_lease_released",
      "branch_fan_in_projected"
    ]
  );
  const failureEvent = result.batches[0].taskFailureEvents[0];
  assert.equal(failureEvent.branchRef, alpha.branchRef);
  assert.equal(failureEvent.failureClass, "runtime_failure");
  assert.equal(failureEvent.disposition, "block");
  assert.equal(failureEvent.preserveEvidence, true);
  assert.match(failureEvent.failureDigest, /^branch-task-failure:/u);

  const leaseProjection = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "branch-lease-projection://t141/async/task-rejection",
    nowMs: 10_000,
    events: result.replayEvents
  });
  assert.deepEqual(leaseProjection.activeLeaseRefs, []);
  assert.deepEqual(
    leaseProjection.releasedLeaseRefs,
    result.batches[0].leaseAcquiredEvents
      .map((event) => event.leaseRef)
      .sort()
  );
});

test("T-141 async suite serializes shared output allocation over a mutable effect target", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("shared-output-alpha");
  const beta = branch("shared-output-beta");
  const sharedOutput = "output://t141/async/shared-target";
  const runCounters = counters();
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/shared-output",
    declarations: [
      declaration(alpha, {
        declaredPriority: 20,
        writeTerritoryRefs: [],
        outputAllocationRefs: [sharedOutput]
      }),
      declaration(beta, {
        declaredPriority: 10,
        writeTerritoryRefs: [],
        outputAllocationRefs: [sharedOutput]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/shared-output",
      maxConcurrency: 2
    }),
    tasks: [
      delayedTask(alpha, { delayMs: 3, counters: runCounters }),
      delayedTask(beta, { delayMs: 3, counters: runCounters })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/async/shared-output"
  });

  assert.equal(runCounters.maxActive, 1);
  assert.equal(result.batchCount, 2);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(result.batches[1].selection.selectedBranchRefs, [beta.branchRef]);
});

test("T-141 async suite does not dispatch stale or underdeclared frontier rows", async () => {
  const basis = buildThreeStageBasis();
  const stale = branch("stale-row");
  const underdeclared = branch("underdeclared-row");
  const staleCounters = counters();
  const underdeclaredCounters = counters();
  const staleResult = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/stale-row",
    declarations: [
      declaration(stale, {
        observedStateRefs: ["observed://t141/async/stale"]
      })
    ],
    staleObservedStateRefs: ["observed://t141/async/stale"],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/stale-row",
      maxConcurrency: 2
    }),
    tasks: [delayedTask(stale, { counters: staleCounters })],
    eventSink: () => {},
    correlationId: "correlation://t141/async/stale-row"
  });
  const underdeclaredResult = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/underdeclared-row",
    declarations: [constructDependencyFrontierDeclaration({ branchRef: underdeclared })],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/underdeclared-row",
      maxConcurrency: 2
    }),
    tasks: [delayedTask(underdeclared, { counters: underdeclaredCounters })],
    eventSink: () => {},
    correlationId: "correlation://t141/async/underdeclared-row"
  });

  assert.equal(staleResult.batchCount, 0);
  assert.deepEqual(staleResult.emittedEvents, []);
  assert.deepEqual(staleCounters.started, []);
  assert.equal(underdeclaredResult.batchCount, 0);
  assert.deepEqual(underdeclaredResult.emittedEvents, []);
  assert.deepEqual(underdeclaredCounters.started, []);
});

test("T-141 async suite gates overlapping branches from replayed active lease truth", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("active-lease-alpha");
  const beta = branch("active-lease-beta");
  const sharedOutput = "output://t141/async/active-lease-shared";
  const alphaAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 0
  });
  const acquired = constructBranchLeaseAcquiredEvent({
    basis,
    frontierRef: "frontier://t141/async/active-lease",
    branchRef: alpha,
    branchAttemptRef: alphaAttempt,
    leaseRef: "lease://t141/async/active-lease-alpha",
    leasedWriteTerritoryRefs: [],
    leasedOutputAllocationRefs: [sharedOutput],
    leasedAtMs: 100,
    expiresAtMs: 1_000,
    causationEventRefs: ["selection://t141/async/active-lease"],
    correlationId: "correlation://t141/async/active-lease"
  });
  const activeLease = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "lease-projection://t141/async/active",
    nowMs: 200,
    events: [acquired]
  });
  const replayFrontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/async/active-output-from-replay",
    declarations: [
      declaration(beta, {
        writeTerritoryRefs: [],
        outputAllocationRefs: [sharedOutput]
      })
    ]
  });
  const replaySelection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/async/active-output-from-replay",
    frontier: replayFrontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/active-output-from-replay",
      maxConcurrency: 2
    }),
    activeOutputAllocationRefs: activeLease.activeOutputAllocationRefs
  });
  const blockedCounters = counters();
  const declarations = [
    declaration(alpha, {
      declaredPriority: 20,
      writeTerritoryRefs: [],
      outputAllocationRefs: [sharedOutput]
    }),
    declaration(beta, {
      declaredPriority: 10,
      writeTerritoryRefs: [],
      outputAllocationRefs: [sharedOutput]
    })
  ];
  const blocked = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/active-lease-blocked",
    declarations,
    activeLeaseBranchRefs: activeLease.activeBranchRefs,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/active-lease-blocked",
      maxConcurrency: 2
    }),
    tasks: [
      delayedTask(alpha, { counters: blockedCounters }),
      delayedTask(beta, { counters: blockedCounters })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/async/active-lease-blocked"
  });
  const released = constructBranchLeaseReleasedEvent({
    basis,
    frontierRef: "frontier://t141/async/active-lease",
    branchRef: alpha,
    branchAttemptRef: alphaAttempt,
    leaseRef: acquired.leaseRef,
    releasedAtMs: 250,
    causationEventRefs: [acquired.leaseRef],
    correlationId: "correlation://t141/async/active-lease"
  });
  const releasedLease = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "lease-projection://t141/async/released",
    nowMs: 300,
    events: [acquired, released]
  });
  const recoveredCounters = counters();
  const recovered = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/active-lease-recovered",
    declarations,
    initialClosedBranchRefs: [alpha.branchRef],
    activeLeaseBranchRefs: releasedLease.activeBranchRefs,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/active-lease-recovered",
      maxConcurrency: 2
    }),
    tasks: [
      delayedTask(alpha, { counters: recoveredCounters }),
      delayedTask(beta, { counters: recoveredCounters })
    ],
    eventSink: () => {},
    correlationId: "correlation://t141/async/active-lease-recovered"
  });

  assert.deepEqual(activeLease.activeBranchRefs, [alpha.branchRef]);
  assert.deepEqual(activeLease.activeOutputAllocationRefs, [sharedOutput]);
  assert.deepEqual(activeLease.activeDispatchConflictRefs, [`output:${sharedOutput}`]);
  assert.deepEqual(replaySelection.selectedBranchRefs, []);
  assert.deepEqual(replaySelection.conflictBranchRefs, [beta.branchRef]);
  assert.equal(blocked.batchCount, 0);
  assert.deepEqual(blockedCounters.started, []);
  assert.deepEqual(releasedLease.activeBranchRefs, []);
  assert.equal(recovered.batchCount, 1);
  assert.deepEqual(recovered.batches[0].selection.selectedBranchRefs, [beta.branchRef]);
});

test("T-141 async suite deduplicates duplicate admitted payload delivery before fan-in", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("duplicate-delivery-alpha");
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/duplicate-delivery",
    declarations: [declaration(alpha)],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/duplicate-delivery",
      maxConcurrency: 1
    }),
    tasks: [delayedTask(alpha)],
    eventSink: () => {},
    correlationId: "correlation://t141/async/duplicate-delivery"
  });
  const payloadEvent = result.batches[0].payloadAdmittedEvents[0];
  const fanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: alpha.fanInScopeRef,
    events: [...result.replayEvents, payloadEvent],
    declaredOrderBranchRefs: [alpha.branchRef]
  });

  assert.deepEqual(fanIn.orderedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(fanIn.payloadDigests, [payloadEvent.payloadDigest]);
});

test("T-141 async suite enforces system max-concurrency caps across a wide fan-out", async () => {
  const branches = ["one", "two", "three", "four", "five"].map((key) =>
    branch(`wide-${key}`)
  );
  const runCounters = counters();
  const result = await runNativeSagaFrontier({
    frontierRef: "frontier://t141/async/wide-fan-out",
    declarations: branches.map((branchRef, index) =>
      declaration(branchRef, { declaredPriority: 50 - index })
    ),
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/wide-fan-out",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: ["abg-default://saga-frontier/max-concurrency/two"]
    }),
    tasks: branches.map((branchRef) =>
      delayedTask(branchRef, { delayMs: 2, counters: runCounters })
    )
  });

  assert.equal(runCounters.maxActive, 2);
  assert.equal(result.batchCount, 3);
  assert.deepEqual(result.completedBranchRefs, branches.map((item) => item.branchRef).sort());
});

test("T-141 async suite runs a real 50-way fan-out through a three-deep dependency graph", async () => {
  const basis = buildThreeStageBasis();
  const random = seededRandom(0x141167);
  const rootBranches = Array.from({ length: 50 }, (_value, index) =>
    branch(`stress-root-${String(index).padStart(2, "0")}`)
  );
  const reducerBranches = Array.from({ length: 10 }, (_value, index) =>
    branch(`stress-reducer-${String(index).padStart(2, "0")}`)
  );
  const leafBranches = Array.from({ length: 5 }, (_value, index) =>
    branch(`stress-leaf-${String(index).padStart(2, "0")}`)
  );
  const rootDeclarations = rootBranches.map((branchRef, index) =>
    declaration(branchRef, {
      declaredPriority: 1_000 - index,
      readRefs: ["ticket://odd-sdlc/T-167"],
      outputAllocationRefs: [
        `output://t141/async/stress/root/${branchRef.branchKey}`
      ]
    })
  );
  const reducerDeclarations = reducerBranches.map((branchRef, index) => {
    const assignedParents = rootBranches.filter(
      (_root, rootIndex) => rootIndex % reducerBranches.length === index
    );
    const randomParents = randomMembers(
      rootBranches,
      3,
      random,
      new Set(assignedParents.map((parent) => parent.branchRef))
    );
    const parents = uniqueBranches([...assignedParents, ...randomParents]);
    return declaration(branchRef, {
      declaredPriority: 500 - index,
      parentBranchRefs: parents.map((parent) => parent.branchRef),
      readRefs: parents.map(
        (parent) => `output://t141/async/stress/root/${parent.branchKey}`
      ),
      outputAllocationRefs: [
        `output://t141/async/stress/reducer/${branchRef.branchKey}`
      ]
    });
  });
  const leafDeclarations = leafBranches.map((branchRef, index) => {
    const baseParents = reducerBranches.slice(index * 2, index * 2 + 2);
    const randomParents = randomMembers(
      reducerBranches,
      2,
      random,
      new Set(baseParents.map((parent) => parent.branchRef))
    );
    const parents = uniqueBranches([...baseParents, ...randomParents]);
    return declaration(branchRef, {
      declaredPriority: 100 - index,
      parentBranchRefs: parents.map((parent) => parent.branchRef),
      readRefs: parents.map(
        (parent) => `output://t141/async/stress/reducer/${parent.branchKey}`
      ),
      outputAllocationRefs: [
        `output://t141/async/stress/leaf/${branchRef.branchKey}`
      ]
    });
  });
  const declarations = [
    ...rootDeclarations,
    ...reducerDeclarations,
    ...leafDeclarations
  ];
  const allBranches = [...rootBranches, ...reducerBranches, ...leafBranches];
  const runCounters = counters();
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/stress-50-fan-out",
    declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/stress-50-fan-out",
      maxConcurrency: 50,
      resolvedSystemPolicyRefs: [
        "abg-default://saga-frontier/max-concurrency/fifty"
      ]
    }),
    tasks: allBranches.map((branchRef) =>
      delayedTask(branchRef, { delayMs: 1, counters: runCounters })
    ),
    eventSink: () => {},
    correlationId: "correlation://t141/async/stress-50-fan-out"
  });
  const rootRefs = new Set(rootBranches.map((item) => item.branchRef));
  const reducerRefs = new Set(reducerBranches.map((item) => item.branchRef));
  const leafRefs = new Set(leafBranches.map((item) => item.branchRef));
  const parentRefs = new Set(declarations.flatMap((item) => item.parentBranchRefs));
  const reducerParentRefs = new Set(
    reducerDeclarations.flatMap((item) => item.parentBranchRefs)
  );
  const leafParentRefs = new Set(
    leafDeclarations.flatMap((item) => item.parentBranchRefs)
  );
  const terminalRefs = allBranches
    .map((item) => item.branchRef)
    .filter((branchRef) => !parentRefs.has(branchRef))
    .sort();
  const emittedKinds = result.emittedEvents.map((event) => event.kind);
  const leaseProjection = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "branch-lease-projection://t141/async/stress-50-fan-out",
    nowMs: 100_000,
    events: result.replayEvents
  });

  assert.equal(rootBranches.length, 50);
  assert.equal(reducerBranches.length, 10);
  assert.equal(leafBranches.length, 5);
  assert.equal(declarations.length, 65);
  assert.equal(runCounters.maxActive, 50);
  assert.equal(result.batchCount, 3);
  assert.deepEqual(
    result.batches.map((batch) => batch.selection.selectedBranchRefs.length),
    [50, 10, 5]
  );
  assert.equal(
    result.batches[0].selection.selectedBranchRefs.every((branchRef) =>
      rootRefs.has(branchRef)
    ),
    true
  );
  assert.equal(
    result.batches[1].selection.selectedBranchRefs.every((branchRef) =>
      reducerRefs.has(branchRef)
    ),
    true
  );
  assert.equal(
    result.batches[2].selection.selectedBranchRefs.every((branchRef) =>
      leafRefs.has(branchRef)
    ),
    true
  );
  assert.deepEqual(terminalRefs, leafBranches.map((item) => item.branchRef).sort());
  assert.equal(
    rootBranches.every((item) => reducerParentRefs.has(item.branchRef)),
    true
  );
  assert.equal(
    reducerBranches.every((item) => leafParentRefs.has(item.branchRef)),
    true
  );
  assert.equal(
    emittedKinds.filter((kind) => kind === "branch_lease_acquired").length,
    65
  );
  assert.equal(
    emittedKinds.filter((kind) => kind === "branch_payload_admitted").length,
    65
  );
  assert.equal(
    emittedKinds.filter((kind) => kind === "branch_lease_released").length,
    65
  );
  assert.equal(
    emittedKinds.filter((kind) => kind === "branch_fan_in_projected").length,
    3
  );
  assert.deepEqual(leaseProjection.activeLeaseRefs, []);
  assert.equal(leaseProjection.releasedLeaseRefs.length, 65);
  assert.equal(result.completedBranchRefs.length, 65);
  assert.deepEqual(result.failedBranchRefs, []);
});

test("T-141 async suite enforces the same caps through the evented runner", async () => {
  const basis = buildThreeStageBasis();
  const branches = ["one", "two", "three", "four", "five"].map((key) =>
    branch(`evented-wide-${key}`)
  );
  const runCounters = counters();
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/async/evented-wide-fan-out",
    declarations: branches.map((branchRef, index) =>
      declaration(branchRef, { declaredPriority: 50 - index })
    ),
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/async/evented-wide-fan-out",
      maxConcurrency: 2,
      resolvedSystemPolicyRefs: ["abg-default://saga-frontier/max-concurrency/two"]
    }),
    tasks: branches.map((branchRef) =>
      delayedTask(branchRef, { delayMs: 2, counters: runCounters })
    ),
    eventSink: () => {},
    correlationId: "correlation://t141/async/evented-wide-fan-out"
  });

  assert.equal(runCounters.maxActive, 2);
  assert.equal(result.batchCount, 3);
  assert.deepEqual(result.completedBranchRefs, branches.map((item) => item.branchRef).sort());
});
