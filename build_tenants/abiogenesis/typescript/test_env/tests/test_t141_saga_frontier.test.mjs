// Validates: T-141
// Validates: REQ-R-ABG3-SAGA-FRONTIER

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitBranchOutputPublication,
  admitBranchPayloadResult,
  assertRuntimeEvent,
  constructBranchAttemptRef,
  constructBranchExecutionPolicy,
  constructBranchFanInInputRow,
  constructBranchFanInProjectedEvent,
  constructBranchLeaseAcquiredEvent,
  constructBranchLeaseRecord,
  constructBranchLeaseReleasedEvent,
  constructBranchLeaseSupersededEvent,
  constructBranchOutputStageRecord,
  constructBranchPayloadAdmittedEvent,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchIdempotencyKey,
  deriveBranchFanInProjection,
  deriveBranchFanInProjectionFromEvents,
  deriveBranchLeaseProjection,
  deriveBranchLeaseProjectionFromEvents,
  deriveDependencyFrontierProjection,
  derivePublicConstructionProgressProjection,
  deriveWriteTerritoryConflictProjection,
  runEventedNativeSagaFrontier,
  runNativeSagaFrontier,
  selectDisjointReadyBranches
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function branch(branchKey, input = {}) {
  return constructBranchRef({
    graphCallId: "graph-call://t141/1",
    frameId: "frame://t141/root",
    vectorIndex: 0,
    branchKey,
    fanInScopeRef: "fan-in://t141/root",
    ...input
  });
}

function declaration(branchRef, input = {}) {
  const key = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef,
    branchAttemptRef: input.branchAttemptRef ?? null,
    observedStateRefs: input.observedStateRefs ?? ["observed://t141/current"],
    writeTerritoryRefs: input.writeTerritoryRefs ?? [`write://t141/${branchRef.branchKey}`],
    outputAllocationRefs: input.outputAllocationRefs ?? [`output://t141/${branchRef.branchKey}`]
  });
  return constructDependencyFrontierDeclaration({
    branchRef,
    parentBranchRefs: input.parentBranchRefs ?? [],
    observedStateRefs: input.observedStateRefs ?? ["observed://t141/current"],
    readRefs: input.readRefs ?? ["read://t141/shared"],
    writeTerritoryRefs: input.writeTerritoryRefs ?? [`write://t141/${branchRef.branchKey}`],
    outputAllocationRefs: input.outputAllocationRefs ?? [`output://t141/${branchRef.branchKey}`],
    idempotencyKey: key,
    declaredPriority: input.declaredPriority ?? 0,
    criticalPathCost: input.criticalPathCost ?? 0
  });
}

function nativeTask(branchRef, counters) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: branchRef.branchRef,
    run: async () => {
      counters.active += 1;
      counters.maxActive = Math.max(counters.maxActive, counters.active);
      counters.started.push(branchRef.branchRef);
      await new Promise((resolve) => setTimeout(resolve, 5));
      counters.active -= 1;
      counters.completed.push(branchRef.branchRef);
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: branchRef.branchRef,
        payloadDigest: `sha256:t141:${branchRef.branchKey}`,
        evidenceRefs: [`evidence://t141/${branchRef.branchKey}`]
      });
    }
  });
}

test("T-141 serial fallback selects one ready branch without changing the frontier truth", () => {
  const alpha = branch("alpha");
  const beta = branch("beta");
  const gamma = branch("gamma");
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/serial",
    declarations: [
      declaration(alpha, { declaredPriority: 30 }),
      declaration(beta, { declaredPriority: 20 }),
      declaration(gamma, { declaredPriority: 10 })
    ]
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/serial",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/serial",
      maxConcurrency: 1,
      resolvedSystemPolicyRefs: ["resolved-runtime://t141/max-concurrency"]
    })
  });

  assert.deepEqual(selection.selectedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(selection.deferredReadyBranchRefs, [
    beta.branchRef,
    gamma.branchRef
  ].sort());
  assert.deepEqual(frontier.readyBranchRefs, [
    alpha.branchRef,
    beta.branchRef,
    gamma.branchRef
  ].sort());
});

test("T-141 bounded selection admits disjoint ready branches up to configured capacity", () => {
  const alpha = branch("alpha");
  const beta = branch("beta");
  const gamma = branch("gamma");
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/disjoint",
    declarations: [
      declaration(alpha, { declaredPriority: 30 }),
      declaration(beta, { declaredPriority: 20 }),
      declaration(gamma, { declaredPriority: 10 })
    ]
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/disjoint",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/bounded",
      maxConcurrency: 2
    })
  });

  assert.deepEqual(selection.selectedBranchRefs, [alpha.branchRef, beta.branchRef]);
  assert.deepEqual(selection.deferredReadyBranchRefs, [gamma.branchRef]);
});

test("T-141 branch execution policy exposes resolved runtime control surfaces", () => {
  const policy = constructBranchExecutionPolicy({
    policyRef: "policy://t141/full-control",
    maxConcurrency: 3,
    maxRetryAttempts: 2,
    retryBudgetExhaustedDisposition: "escalate",
    noOutputTimeoutMs: 1000,
    inactivityTimeoutMs: 2000,
    hardSafetyCapMs: 3000,
    humanWaitTimeoutMs: 4000,
    cancellationSignalKind: "process_signal",
    cancellationGraceMs: 500,
    preserveEvidenceOnCancellation: true,
    leaseTtlMs: 6000,
    leaseRenewalMs: 3000,
    resourceLimits: [
      {
        resourceKind: "worker",
        resourceRef: "worker://claude",
        maxConcurrent: 2,
        resolvedSystemPolicyRefs: ["abg-default://worker/claude/max-concurrent"]
      },
      {
        resourceKind: "transport",
        resourceRef: "transport://local-process",
        maxConcurrent: 3,
        resolvedSystemPolicyRefs: ["abg-default://transport/local/max-concurrent"]
      }
    ],
    workerLimitRefs: ["worker-limit://claude"],
    transportLimitRefs: ["transport-limit://local-process"],
    preemptionPolicy: "cooperative_cancel_low_priority",
    resolvedSystemPolicyRefs: ["abg-default://saga-frontier"]
  });

  assert.equal(policy.maxConcurrency, 3);
  assert.equal(policy.maxRetryAttempts, 2);
  assert.equal(policy.retryBudgetExhaustedDisposition, "escalate");
  assert.equal(policy.noOutputTimeoutMs, 1000);
  assert.equal(policy.inactivityTimeoutMs, 2000);
  assert.equal(policy.hardSafetyCapMs, 3000);
  assert.equal(policy.humanWaitTimeoutMs, 4000);
  assert.equal(policy.cancellationSignalKind, "process_signal");
  assert.equal(policy.cancellationGraceMs, 500);
  assert.equal(policy.preserveEvidenceOnCancellation, true);
  assert.equal(policy.leaseTtlMs, 6000);
  assert.equal(policy.leaseRenewalMs, 3000);
  assert.equal(policy.preemptionPolicy, "cooperative_cancel_low_priority");
  assert.deepEqual(policy.workerLimitRefs, ["worker-limit://claude"]);
  assert.deepEqual(policy.transportLimitRefs, ["transport-limit://local-process"]);
  assert.equal(policy.resourceLimits.length, 2);
  assert.equal(policy.resourceLimits[0].resourceKind, "worker");
  assert.equal(Object.isFrozen(policy), true);
  assert.equal(Object.isFrozen(policy.resourceLimits), true);
  assert.equal(Object.isFrozen(policy.resourceLimits[0]), true);
  assert.throws(() => {
    policy.resourceLimits.push(policy.resourceLimits[0]);
  }, TypeError);
  const noRetryPolicy = constructBranchExecutionPolicy({
    policyRef: "policy://t141/no-retry",
    maxConcurrency: 1,
    maxRetryAttempts: 0
  });
  assert.equal(noRetryPolicy.maxRetryAttempts, 0);
  assert.throws(() => {
    constructBranchExecutionPolicy({
      policyRef: "policy://t141/invalid-retry",
      maxConcurrency: 1,
      maxRetryAttempts: -1
    });
  }, TypeError);
});

test("T-141 native saga frontier runner honors serial fallback cap", async () => {
  const alpha = branch("runner-serial-alpha");
  const beta = branch("runner-serial-beta");
  const child = branch("runner-serial-child");
  const counters = { active: 0, maxActive: 0, started: [], completed: [] };
  const result = await runNativeSagaFrontier({
    frontierRef: "frontier://t141/native-serial",
    declarations: [
      declaration(alpha, { declaredPriority: 30 }),
      declaration(beta, { declaredPriority: 20 }),
      declaration(child, {
        declaredPriority: 10,
        parentBranchRefs: [alpha.branchRef]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/native-serial",
      maxConcurrency: 1
    }),
    tasks: [
      nativeTask(alpha, counters),
      nativeTask(beta, counters),
      nativeTask(child, counters)
    ]
  });

  assert.equal(counters.maxActive, 1);
  assert.equal(result.batchCount, 3);
  assert.deepEqual(result.completedBranchRefs, [
    alpha.branchRef,
    beta.branchRef,
    child.branchRef
  ].sort());
});

test("T-141 native saga frontier runner exploits disjoint fan-out only within policy cap", async () => {
  const alpha = branch("runner-parallel-alpha");
  const beta = branch("runner-parallel-beta");
  const child = branch("runner-parallel-child");
  const counters = { active: 0, maxActive: 0, started: [], completed: [] };
  const result = await runNativeSagaFrontier({
    frontierRef: "frontier://t141/native-parallel",
    declarations: [
      declaration(alpha, { declaredPriority: 30 }),
      declaration(beta, { declaredPriority: 20 }),
      declaration(child, {
        declaredPriority: 10,
        parentBranchRefs: [alpha.branchRef]
      })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/native-parallel",
      maxConcurrency: 2
    }),
    tasks: [
      nativeTask(alpha, counters),
      nativeTask(beta, counters),
      nativeTask(child, counters)
    ]
  });

  assert.equal(counters.maxActive, 2);
  assert.equal(result.batchCount, 2);
  assert.deepEqual(result.batches[0].selection.selectedBranchRefs, [
    alpha.branchRef,
    beta.branchRef
  ]);
  assert.deepEqual(result.batches[1].selection.selectedBranchRefs, [
    child.branchRef
  ]);
});

test("T-141 system parallelism returns immutable semantic carriers over mutable effect tasks", async () => {
  const alpha = branch("runner-prime-alpha");
  const beta = branch("runner-prime-beta");
  const counters = { active: 0, maxActive: 0, started: [], completed: [] };
  const declarations = Object.freeze([
    declaration(alpha, { declaredPriority: 20 }),
    declaration(beta, { declaredPriority: 10 })
  ]);
  const policy = constructBranchExecutionPolicy({
    policyRef: "policy://t141/prime-parallel",
    maxConcurrency: 2
  });
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/prime-parallel",
    declarations
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/prime-parallel",
    frontier,
    policy
  });
  const result = await runNativeSagaFrontier({
    frontierRef: "frontier://t141/prime-parallel",
    declarations,
    policy,
    tasks: [
      nativeTask(alpha, counters),
      nativeTask(beta, counters)
    ]
  });

  assert.equal(counters.maxActive, 2);
  assert.equal(Object.isFrozen(frontier), true);
  assert.equal(Object.isFrozen(frontier.rows), true);
  assert.equal(Object.isFrozen(frontier.rows[0]), true);
  assert.equal(Object.isFrozen(selection), true);
  assert.equal(Object.isFrozen(selection.rows), true);
  assert.equal(Object.isFrozen(selection.rows[0]), true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.completedBranchRefs), true);
  assert.equal(Object.isFrozen(result.batches), true);
  assert.equal(Object.isFrozen(result.batches[0]), true);
  assert.equal(Object.isFrozen(result.batches[0].selection.selectedBranchRefs), true);
  assert.equal(Object.isFrozen(result.results), true);
  assert.equal(Object.isFrozen(result.results[0]), true);
  assert.throws(() => {
    frontier.rows[0].rowState = "closed";
  }, TypeError);
  assert.throws(() => {
    result.completedBranchRefs[0] = "branch://mutated";
  }, TypeError);
  assert.throws(() => {
    result.results.push(result.results[0]);
  }, TypeError);
});

test("T-141 evented native saga frontier emits replay-visible lease, payload, release, and fan-in events", async () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("evented-alpha");
  const beta = branch("evented-beta");
  const counters = { active: 0, maxActive: 0, started: [], completed: [] };
  const emitted = [];
  const result = await runEventedNativeSagaFrontier({
    basis,
    frontierRef: "frontier://t141/evented-native",
    declarations: [
      declaration(alpha, { declaredPriority: 20 }),
      declaration(beta, { declaredPriority: 10 })
    ],
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/evented-native",
      maxConcurrency: 2,
      leaseTtlMs: 1_000
    }),
    tasks: [
      nativeTask(alpha, counters),
      nativeTask(beta, counters)
    ],
    eventSink: (event) => {
      emitted.push(event);
    },
    correlationId: "correlation://t141/evented-native",
    leaseStartMs: 100,
    releaseStartMs: 200
  });
  const leaseProjection = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "lease-projection://t141/evented-native",
    nowMs: 300,
    events: result.replayEvents
  });
  const fanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: alpha.fanInScopeRef,
    events: result.replayEvents,
    declaredOrderBranchRefs: [alpha.branchRef, beta.branchRef]
  });

  assert.equal(counters.maxActive, 2);
  assert.equal(result.batchCount, 1);
  assert.deepEqual(result.completedBranchRefs, [alpha.branchRef, beta.branchRef].sort());
  assert.deepEqual(
    emitted.map((event) => event.kind),
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
  assert.deepEqual(result.emittedEvents, emitted);
  assert.deepEqual(result.replayEvents, emitted);
  assert.deepEqual([...leaseProjection.releasedLeaseRefs].sort(), [
    result.batches[0].leaseAcquiredEvents[0].leaseRef,
    result.batches[0].leaseAcquiredEvents[1].leaseRef
  ].sort());
  assert.deepEqual(leaseProjection.activeLeaseRefs, []);
  assert.deepEqual(fanIn.orderedBranchRefs, [alpha.branchRef, beta.branchRef]);
  assert.deepEqual(result.batches[0].fanInProjectedEvent.orderedBranchRefs, [
    alpha.branchRef,
    beta.branchRef
  ]);
});

test("T-141 overlapping write territory serializes even when concurrency is available", () => {
  const alpha = branch("alpha");
  const beta = branch("beta");
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/conflict",
    declarations: [
      declaration(alpha, {
        declaredPriority: 20,
        writeTerritoryRefs: ["write://t141/shared"]
      }),
      declaration(beta, {
        declaredPriority: 10,
        writeTerritoryRefs: ["write://t141/shared"]
      })
    ]
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/conflict",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/conflict",
      maxConcurrency: 2
    })
  });
  const conflicts = deriveWriteTerritoryConflictProjection({
    projectionRef: "write-conflict://t141/conflict",
    frontier
  });

  assert.deepEqual(selection.selectedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(selection.conflictBranchRefs, [beta.branchRef]);
  assert.equal(conflicts.staticConflicts.length, 1);
  assert.deepEqual(conflicts.conflictingBranchRefs, [
    alpha.branchRef,
    beta.branchRef
  ].sort());
});

test("T-141 child branch stays blocked until parent branch closure is admitted", () => {
  const parent = branch("parent");
  const child = branch("child");
  const blocked = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/dependency/blocked",
    declarations: [
      declaration(parent, { declaredPriority: 20 }),
      declaration(child, {
        declaredPriority: 10,
        parentBranchRefs: [parent.branchRef]
      })
    ]
  });
  const unblocked = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/dependency/unblocked",
    declarations: [
      declaration(parent, { declaredPriority: 20 }),
      declaration(child, {
        declaredPriority: 10,
        parentBranchRefs: [parent.branchRef]
      })
    ],
    closedBranchRefs: [parent.branchRef]
  });

  assert.equal(
    blocked.rows.find((row) => row.branchRef.branchRef === child.branchRef).rowState,
    "blocked_by_parents"
  );
  assert.equal(
    unblocked.rows.find((row) => row.branchRef.branchRef === child.branchRef).rowState,
    "ready"
  );
});

test("T-141 stale observed state blocks dispatch and remains visible in progress projection", () => {
  const alpha = branch("alpha");
  const observedStateRef = "observed://t141/stale";
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/stale",
    declarations: [
      declaration(alpha, {
        observedStateRefs: [observedStateRef],
        declaredPriority: 10
      })
    ],
    staleObservedStateRefs: [observedStateRef]
  });
  const progress = derivePublicConstructionProgressProjection({
    projectionRef: "progress://t141/stale",
    frontier
  });

  assert.deepEqual(frontier.readyBranchRefs, []);
  assert.deepEqual(frontier.blockedBranchRefs, [alpha.branchRef]);
  assert.equal(progress.rows[0].state, "blocked");
  assert.equal(progress.aggregateCounts.blocked, 1);
});

test("T-141 underdeclared safety proof blocks instead of selecting empty observed/write rows", () => {
  const alpha = branch("underdeclared-alpha");
  const beta = branch("underdeclared-beta");
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/underdeclared",
    declarations: [
      constructDependencyFrontierDeclaration({ branchRef: alpha }),
      constructDependencyFrontierDeclaration({ branchRef: beta })
    ]
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/underdeclared",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/underdeclared",
      maxConcurrency: 2
    })
  });

  assert.deepEqual(frontier.readyBranchRefs, []);
  assert.deepEqual(selection.selectedBranchRefs, []);
  assert.deepEqual(
    frontier.rows.map((row) => row.rowState),
    ["underdeclared_safety", "underdeclared_safety"]
  );
  assert.deepEqual(
    frontier.rows[0].missingSafetyProofRefs,
    [
      "missing_observed_state_refs",
      "missing_write_territory_or_output_allocation_refs",
      "missing_idempotency_key"
    ]
  );
});

test("T-141 output allocation can prove dispatch territory and still conflicts when shared", () => {
  const alpha = branch("output-alpha");
  const beta = branch("output-beta");
  const sharedOutput = "output://t141/shared";
  const alphaKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: [sharedOutput]
  });
  const betaKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: beta,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: [sharedOutput]
  });
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/output-conflict",
    declarations: [
      constructDependencyFrontierDeclaration({
        branchRef: alpha,
        observedStateRefs: ["observed://t141/current"],
        outputAllocationRefs: [sharedOutput],
        idempotencyKey: alphaKey,
        declaredPriority: 10
      }),
      constructDependencyFrontierDeclaration({
        branchRef: beta,
        observedStateRefs: ["observed://t141/current"],
        outputAllocationRefs: [sharedOutput],
        idempotencyKey: betaKey
      })
    ]
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/output-conflict",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/output-conflict",
      maxConcurrency: 2
    })
  });
  const conflicts = deriveWriteTerritoryConflictProjection({
    projectionRef: "write-conflict://t141/output-conflict",
    frontier
  });

  assert.deepEqual(frontier.readyBranchRefs, [alpha.branchRef, beta.branchRef].sort());
  assert.deepEqual(selection.selectedBranchRefs, [alpha.branchRef]);
  assert.deepEqual(selection.conflictBranchRefs, [beta.branchRef]);
  assert.equal(conflicts.staticConflicts.length, 1);
  assert.deepEqual(conflicts.staticConflicts[0].writeTerritoryRefs, [
    `output:${sharedOutput}`
  ]);
});

test("T-141 leased output allocation blocks a ready sibling that shares the output", () => {
  const alpha = branch("leased-output-alpha");
  const beta = branch("leased-output-beta");
  const sharedOutput = "output://t141/leased-shared";
  const alphaKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: [sharedOutput]
  });
  const betaKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: beta,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: [sharedOutput]
  });
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/leased-output-conflict",
    declarations: [
      constructDependencyFrontierDeclaration({
        branchRef: alpha,
        observedStateRefs: ["observed://t141/current"],
        outputAllocationRefs: [sharedOutput],
        idempotencyKey: alphaKey,
        declaredPriority: 10
      }),
      constructDependencyFrontierDeclaration({
        branchRef: beta,
        observedStateRefs: ["observed://t141/current"],
        outputAllocationRefs: [sharedOutput],
        idempotencyKey: betaKey
      })
    ],
    activeLeaseBranchRefs: [alpha.branchRef]
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://t141/leased-output-conflict",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://t141/leased-output-conflict",
      maxConcurrency: 2
    })
  });
  const conflicts = deriveWriteTerritoryConflictProjection({
    projectionRef: "write-conflict://t141/leased-output-conflict",
    frontier
  });

  assert.deepEqual(
    frontier.rows.map((row) => row.rowState),
    ["leased", "ready"]
  );
  assert.deepEqual(selection.selectedBranchRefs, []);
  assert.deepEqual(selection.conflictBranchRefs, [beta.branchRef]);
  assert.ok(
    conflicts.dynamicConflicts.some(
      (row) =>
        row.branchRefs.includes(beta.branchRef) &&
        row.writeTerritoryRefs.includes(`output:${sharedOutput}`)
    )
  );
});

test("T-141 branch result admission is idempotent per attempt and conflict-safe", () => {
  const alpha = branch("alpha");
  const firstAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 0
  });
  const retryAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 1,
    retryAttemptRef: "retry://t141/alpha/1"
  });
  const firstKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    branchAttemptRef: firstAttempt,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: ["output://t141/alpha"],
    writeTerritoryRefs: ["write://t141/alpha"]
  });
  const first = admitBranchPayloadResult({
    key: firstKey,
    payloadDigest: "sha256:t141:first"
  });
  assert.equal(first.decision, "admitted");
  assert.ok(first.admittedRecord);

  const duplicate = admitBranchPayloadResult({
    existingRecords: [first.admittedRecord],
    key: firstKey,
    payloadDigest: "sha256:t141:first"
  });
  const conflict = admitBranchPayloadResult({
    existingRecords: [first.admittedRecord],
    key: firstKey,
    payloadDigest: "sha256:t141:different"
  });
  const retryKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    branchAttemptRef: retryAttempt,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: ["output://t141/alpha"],
    writeTerritoryRefs: ["write://t141/alpha"]
  });
  const retry = admitBranchPayloadResult({
    existingRecords: [first.admittedRecord],
    key: retryKey,
    payloadDigest: "sha256:t141:retry"
  });

  assert.equal(duplicate.decision, "duplicate");
  assert.equal(duplicate.admittedRecord, first.admittedRecord);
  assert.equal(conflict.decision, "conflict");
  assert.equal(conflict.admittedRecord, null);
  assert.equal(retry.decision, "admitted");
});

test("T-141 lease projection keeps active leases out of selection and expires them by replay time", () => {
  const alpha = branch("alpha");
  const attempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 0
  });
  const lease = constructBranchLeaseRecord({
    branchRef: alpha,
    branchAttemptRef: attempt,
    leasedWriteTerritoryRefs: ["write://t141/alpha"],
    leasedAtMs: 100,
    expiresAtMs: 200
  });
  const activeLeaseProjection = deriveBranchLeaseProjection({
    projectionRef: "lease-projection://t141/active",
    nowMs: 150,
    leases: [lease]
  });
  const expiredLeaseProjection = deriveBranchLeaseProjection({
    projectionRef: "lease-projection://t141/expired",
    nowMs: 250,
    leases: [lease]
  });
  const activeFrontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/leased",
    declarations: [declaration(alpha)],
    activeLeaseBranchRefs: activeLeaseProjection.activeBranchRefs
  });
  const recoveredFrontier = deriveDependencyFrontierProjection({
    frontierRef: "frontier://t141/recovered",
    declarations: [declaration(alpha)],
    activeLeaseBranchRefs: expiredLeaseProjection.activeBranchRefs
  });

  assert.deepEqual(activeLeaseProjection.activeBranchRefs, [alpha.branchRef]);
  assert.deepEqual(activeFrontier.readyBranchRefs, []);
  assert.equal(activeFrontier.rows[0].rowState, "leased");
  assert.deepEqual(expiredLeaseProjection.expiredLeaseRefs, [lease.leaseRef]);
  assert.deepEqual(expiredLeaseProjection.activeBranchRefs, []);
  assert.deepEqual(recoveredFrontier.readyBranchRefs, [alpha.branchRef]);
});

test("T-141 branch lease events are admitted and replay to active, released, expired, and superseded states", () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("lease-alpha");
  const beta = branch("lease-beta");
  const gamma = branch("lease-gamma");
  const delta = branch("lease-delta");
  const alphaAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 0
  });
  const betaAttempt = constructBranchAttemptRef({
    branchRef: beta,
    attemptOrdinal: 0
  });
  const gammaAttempt = constructBranchAttemptRef({
    branchRef: gamma,
    attemptOrdinal: 0
  });
  const deltaAttempt = constructBranchAttemptRef({
    branchRef: delta,
    attemptOrdinal: 0
  });
  const active = constructBranchLeaseAcquiredEvent({
    basis,
    frontierRef: "frontier://t141/event-lease",
    branchRef: alpha,
    branchAttemptRef: alphaAttempt,
    leaseRef: "lease://t141/active",
    leasedWriteTerritoryRefs: ["write://t141/active"],
    leasedAtMs: 100,
    expiresAtMs: 500,
    correlationId: "correlation://t141/event-lease"
  });
  const releasable = constructBranchLeaseAcquiredEvent({
    basis,
    frontierRef: "frontier://t141/event-lease",
    branchRef: beta,
    branchAttemptRef: betaAttempt,
    leaseRef: "lease://t141/released",
    leasedWriteTerritoryRefs: ["write://t141/released"],
    leasedAtMs: 100,
    expiresAtMs: 500,
    correlationId: "correlation://t141/event-lease"
  });
  const released = constructBranchLeaseReleasedEvent({
    basis,
    frontierRef: "frontier://t141/event-lease",
    branchRef: beta,
    branchAttemptRef: betaAttempt,
    leaseRef: releasable.leaseRef,
    releasedAtMs: 150,
    causationEventRefs: [releasable.leaseRef],
    correlationId: "correlation://t141/event-lease"
  });
  const expiring = constructBranchLeaseAcquiredEvent({
    basis,
    frontierRef: "frontier://t141/event-lease",
    branchRef: gamma,
    branchAttemptRef: gammaAttempt,
    leaseRef: "lease://t141/expired",
    leasedWriteTerritoryRefs: ["write://t141/expired"],
    leasedAtMs: 100,
    expiresAtMs: 120,
    correlationId: "correlation://t141/event-lease"
  });
  const supersededSource = constructBranchLeaseAcquiredEvent({
    basis,
    frontierRef: "frontier://t141/event-lease",
    branchRef: delta,
    branchAttemptRef: deltaAttempt,
    leaseRef: "lease://t141/superseded",
    leasedWriteTerritoryRefs: ["write://t141/superseded"],
    leasedAtMs: 100,
    expiresAtMs: 500,
    correlationId: "correlation://t141/event-lease"
  });
  const superseded = constructBranchLeaseSupersededEvent({
    basis,
    frontierRef: "frontier://t141/event-lease",
    branchRef: delta,
    branchAttemptRef: deltaAttempt,
    leaseRef: supersededSource.leaseRef,
    supersededByLeaseRef: active.leaseRef,
    causationEventRefs: [supersededSource.leaseRef],
    correlationId: "correlation://t141/event-lease"
  });
  for (const event of [
    active,
    releasable,
    released,
    expiring,
    supersededSource,
    superseded
  ]) {
    assertRuntimeEvent(event);
  }

  const projection = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "lease-projection://t141/events",
    nowMs: 200,
    events: [active, releasable, released, expiring, supersededSource, superseded]
  });

  assert.deepEqual(projection.activeLeaseRefs, [active.leaseRef]);
  assert.deepEqual(projection.releasedLeaseRefs, [released.leaseRef]);
  assert.deepEqual(projection.expiredLeaseRefs, [expiring.leaseRef]);
  assert.deepEqual(projection.supersededLeaseRefs, [supersededSource.leaseRef]);
  assert.deepEqual(projection.activeBranchRefs, [alpha.branchRef]);
});

test("T-141 fan-in projection is deterministic across wall-clock completion order", () => {
  const alpha = branch("alpha");
  const beta = branch("beta");
  const gamma = branch("gamma");
  const alphaRow = constructBranchFanInInputRow({
    branchRef: alpha,
    payloadDigest: "sha256:t141:alpha",
    evidenceRefs: ["evidence://t141/alpha"]
  });
  const betaRow = constructBranchFanInInputRow({
    branchRef: beta,
    payloadDigest: "sha256:t141:beta",
    evidenceRefs: ["evidence://t141/beta"]
  });
  const gammaRow = constructBranchFanInInputRow({
    branchRef: gamma,
    payloadDigest: "sha256:t141:gamma",
    evidenceRefs: ["evidence://t141/gamma"]
  });
  const declaredOrderBranchRefs = [
    beta.branchRef,
    alpha.branchRef,
    gamma.branchRef
  ];
  const first = deriveBranchFanInProjection({
    fanInRef: "fan-in://t141/deterministic",
    rows: [gammaRow, alphaRow, betaRow],
    declaredOrderBranchRefs
  });
  const second = deriveBranchFanInProjection({
    fanInRef: "fan-in://t141/deterministic",
    rows: [betaRow, gammaRow, alphaRow],
    declaredOrderBranchRefs
  });

  assert.deepEqual(first.orderedBranchRefs, declaredOrderBranchRefs);
  assert.deepEqual(second.orderedBranchRefs, declaredOrderBranchRefs);
  assert.equal(first.fanInDigest, second.fanInDigest);
});

test("T-141 fan-in replays from admitted branch payload events and admits projected fan-in event", () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("fan-in-alpha");
  const beta = branch("fan-in-beta");
  const alphaAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 0
  });
  const betaAttempt = constructBranchAttemptRef({
    branchRef: beta,
    attemptOrdinal: 0
  });
  const fanInRef = "fan-in://t141/evented";
  const alphaKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    branchAttemptRef: alphaAttempt,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: ["output://t141/alpha"]
  });
  const betaKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: beta,
    branchAttemptRef: betaAttempt,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: ["output://t141/beta"]
  });
  const betaEvent = constructBranchPayloadAdmittedEvent({
    basis,
    frontierRef: "frontier://t141/evented-fan-in",
    fanInScopeRef: fanInRef,
    key: betaKey,
    payloadDigest: "sha256:t141:beta-event",
    evidenceRefs: ["evidence://t141/beta-event"],
    correlationId: "correlation://t141/evented-fan-in"
  });
  const alphaEvent = constructBranchPayloadAdmittedEvent({
    basis,
    frontierRef: "frontier://t141/evented-fan-in",
    fanInScopeRef: fanInRef,
    key: alphaKey,
    payloadDigest: "sha256:t141:alpha-event",
    evidenceRefs: ["evidence://t141/alpha-event"],
    correlationId: "correlation://t141/evented-fan-in"
  });
  assertRuntimeEvent(betaEvent);
  assertRuntimeEvent(alphaEvent);

  const fanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef,
    events: [betaEvent, alphaEvent],
    declaredOrderBranchRefs: [alpha.branchRef, beta.branchRef]
  });
  const projected = constructBranchFanInProjectedEvent({
    basis,
    frontierRef: "frontier://t141/evented-fan-in",
    fanIn,
    causationEventRefs: [alphaEvent.idempotencyKey, betaEvent.idempotencyKey],
    correlationId: "correlation://t141/evented-fan-in"
  });
  assertRuntimeEvent(projected);

  assert.deepEqual(fanIn.orderedBranchRefs, [alpha.branchRef, beta.branchRef]);
  assert.deepEqual(projected.payloadDigests, [
    "sha256:t141:alpha-event",
    "sha256:t141:beta-event"
  ]);
});

test("T-141 staged branch output is invisible until matching payload admission", () => {
  const basis = buildThreeStageBasis();
  const alpha = branch("stage-alpha");
  const firstAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 0
  });
  const secondAttempt = constructBranchAttemptRef({
    branchRef: alpha,
    attemptOrdinal: 1,
    retryAttemptRef: "retry://t141/stage-alpha/1"
  });
  const stage = constructBranchOutputStageRecord({
    branchRef: alpha,
    branchAttemptRef: firstAttempt,
    outputAllocationRefs: ["output://t141/stage-alpha"],
    stagedArtifactRefs: ["artifact://t141/stage-alpha/partial"],
    evidenceRefs: ["evidence://t141/stage-alpha/staged"]
  });
  const firstKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    branchAttemptRef: firstAttempt,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: ["output://t141/stage-alpha"]
  });
  const secondKey = deriveBranchIdempotencyKey({
    commandKind: "admit_branch_result",
    branchRef: alpha,
    branchAttemptRef: secondAttempt,
    observedStateRefs: ["observed://t141/current"],
    outputAllocationRefs: ["output://t141/stage-alpha"]
  });
  const wrongAttemptPayload = constructBranchPayloadAdmittedEvent({
    basis,
    frontierRef: "frontier://t141/staging",
    fanInScopeRef: alpha.fanInScopeRef,
    key: secondKey,
    payloadDigest: "sha256:t141:stage-alpha-wrong",
    evidenceRefs: ["evidence://t141/stage-alpha/wrong-attempt"],
    correlationId: "correlation://t141/staging"
  });
  const matchingPayload = constructBranchPayloadAdmittedEvent({
    basis,
    frontierRef: "frontier://t141/staging",
    fanInScopeRef: alpha.fanInScopeRef,
    key: firstKey,
    payloadDigest: "sha256:t141:stage-alpha",
    evidenceRefs: ["evidence://t141/stage-alpha/admitted"],
    correlationId: "correlation://t141/staging"
  });

  const blocked = admitBranchOutputPublication({ stage });
  const rejected = admitBranchOutputPublication({
    stage,
    admittedPayloadEvent: wrongAttemptPayload
  });
  const published = admitBranchOutputPublication({
    stage,
    admittedPayloadEvent: matchingPayload
  });

  assert.equal(blocked.decision, "blocked_unadmitted");
  assert.deepEqual(blocked.visibleArtifactRefs, []);
  assert.equal(rejected.decision, "rejected_mismatch");
  assert.deepEqual(rejected.visibleArtifactRefs, []);
  assert.equal(published.decision, "published");
  assert.deepEqual(published.visibleArtifactRefs, stage.stagedArtifactRefs);
});
