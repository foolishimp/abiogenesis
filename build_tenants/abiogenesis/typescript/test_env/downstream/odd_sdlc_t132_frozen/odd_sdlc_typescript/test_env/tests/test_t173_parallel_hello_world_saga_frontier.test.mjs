// Validates: T-173
// Synthetic proof that SDLC dependency topology can be consumed as an ABG
// bounded-parallel saga frontier without making the live harness choose stages.

import test from "node:test";
import assert from "node:assert/strict";

import {
  selectSdlcDependencyMapTraversal
} from "../../build/semantic/code/src/index.js";
import {
  constructBranchExecutionPolicy,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchFanInProjectionFromEvents,
  deriveBranchIdempotencyKey,
  runEventedNativeSagaFrontier
} from "@abiogenesis/typescript-tenant/abg/m03";

const EMPTY_ATTRS = Object.freeze({ entries: Object.freeze([]) });
const EMPTY_GRAPH = Object.freeze({
  name: "parallel_hello_world",
  inputs: Object.freeze([]),
  outputs: Object.freeze([]),
  nodes: Object.freeze([]),
  vectors: Object.freeze([]),
  contexts: Object.freeze([]),
  rules: Object.freeze([]),
  effects: Object.freeze([]),
  tags: Object.freeze([]),
  id: "graph://odd-sdlc/t173/parallel-hello-world"
});

function executionBasis() {
  return Object.freeze({
    id: "basis://odd-sdlc/t173/parallel-hello-world",
    workspaceRoot: "/workspace/parallel-hello-world",
    moduleName: "odd_sdlc_t173_parallel_hello_world",
    graphFunction: Object.freeze({
      name: "parallel_hello_world_frontier",
      environment: Object.freeze({
        requires: Object.freeze([]),
        provides: Object.freeze([]),
        carries: Object.freeze([])
      }),
      inputs: Object.freeze([]),
      outputs: Object.freeze([]),
      template: Object.freeze({
        kind: "symbolic",
        ref: "graph://odd-sdlc/t173/parallel-hello-world",
        graph: null,
        version: null
      }),
      effects: Object.freeze([]),
      declarations: EMPTY_ATTRS,
      tags: Object.freeze([]),
      id: "graph-function://odd-sdlc/t173/parallel-hello-world"
    }),
    graph: EMPTY_GRAPH,
    job: Object.freeze({
      name: "parallel_hello_world_frontier_job",
      contracts: Object.freeze([]),
      roles: Object.freeze([]),
      tags: Object.freeze([]),
      policyHooks: EMPTY_ATTRS,
      id: "job://odd-sdlc/t173/parallel-hello-world"
    }),
    modulePolicyHooks: EMPTY_ATTRS,
    runtimeIdentity: Object.freeze({
      workerId: "worker://synthetic",
      backendId: "backend://node-test",
      buildId: "build://odd-sdlc/t173",
      resolvedRuntimeRef: "runtime://abiogenesis/saga-frontier"
    }),
    resolvedPolicy: Object.freeze({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t173/parallel-frontier",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    startIntent: Object.freeze({
      target: Object.freeze({
        handle: "parallel_hello_world_frontier"
      }),
      scope: Object.freeze({
        workspaceRoot: "/workspace/parallel-hello-world"
      })
    }),
    runId: "run://odd-sdlc/t173/parallel-hello-world",
    workKey: "work://odd-sdlc/t173/parallel-hello-world",
    frameId: "frame://odd-sdlc/t173/parallel-hello-world",
    frameLineageId: "lineage://odd-sdlc/t173/parallel-hello-world"
  });
}

function branch(input) {
  return constructBranchRef({
    branchRef: `branch://odd-sdlc/t173/${input.key}`,
    graphCallId: "graph-call://odd-sdlc/t173/parallel-hello-world",
    frameId: "frame://odd-sdlc/t173/parallel-hello-world",
    vectorIndex: input.vectorIndex,
    branchKey: input.key,
    fanInScopeRef: "fan-in://odd-sdlc/t173/parallel-hello-world",
    workKey: `work://odd-sdlc/t173/${input.key}`,
    basisId: "basis://odd-sdlc/t173/parallel-hello-world",
    graphFunctionId: "graph-function://odd-sdlc/t173/parallel-hello-world",
    frameLineageId: "lineage://odd-sdlc/t173/parallel-hello-world",
    frameAttemptId: "attempt://odd-sdlc/t173/0",
    frontierRef: "frontier://odd-sdlc/t173/parallel-hello-world"
  });
}

function declaration(input) {
  const idempotency = deriveBranchIdempotencyKey({
    commandKind: "materialize_parallel_hello_branch",
    branchRef: input.branchRef,
    observedStateRefs: input.observedStateRefs,
    outputAllocationRefs: input.outputAllocationRefs,
    writeTerritoryRefs: input.writeTerritoryRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef: input.branchRef,
    parentBranchRefs: input.parentBranchRefs ?? Object.freeze([]),
    observedStateRefs: input.observedStateRefs,
    readRefs: input.readRefs,
    writeTerritoryRefs: input.writeTerritoryRefs,
    outputAllocationRefs: input.outputAllocationRefs,
    idempotencyKey: idempotency,
    declaredPriority: input.declaredPriority ?? 1,
    criticalPathCost: input.criticalPathCost ?? 1
  });
}

function task(branchRef, payloadDigest, evidenceRefs) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef,
    run: async () =>
      Object.freeze({
        kind: "native_branch_task_result",
        branchRef,
        payloadDigest,
        evidenceRefs
      })
  });
}

test("T-173 parallel hello-world declares SDLC topology and ABG executes disjoint branches before fan-in", async () => {
  const dependencyMap = Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t173/parallel-hello-world",
    summaryRef: "decomposition-summary://odd-sdlc/t173/parallel-hello-world",
    nodes: Object.freeze([
      Object.freeze({
        nodeId: "module://hello-branch",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://composition"]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-002"]),
        materializationTargetRefs: Object.freeze(["src/hello.js"])
      }),
      Object.freeze({
        nodeId: "module://world-branch",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://composition"]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-003"]),
        materializationTargetRefs: Object.freeze(["src/world.js"])
      }),
      Object.freeze({
        nodeId: "module://composition",
        predecessorNodeIds: Object.freeze([
          "module://hello-branch",
          "module://world-branch"
        ]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-004"]),
        materializationTargetRefs: Object.freeze(["src/index.js"])
      })
    ]),
    steelThreadCandidateNodeIds: Object.freeze(["module://hello-branch"]),
    parallelPartitionRefs: Object.freeze([
      "partition://parallel-hello-world/hello-branch",
      "partition://parallel-hello-world/world-branch"
    ]),
    cycleRefs: Object.freeze([])
  });
  const traversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t173/parallel-hello-world",
    dependencyMap,
    policy: "parallel_when_partitioned",
    basisRefs: Object.freeze([
      "decomposition-summary://odd-sdlc/t173/parallel-hello-world",
      "dependency-map://odd-sdlc/t173/parallel-hello-world"
    ])
  });
  assert.equal(traversal.selectedMethod, "parallel");
  assert.deepEqual(traversal.parallelGroupRefs, [
    "partition://parallel-hello-world/hello-branch",
    "partition://parallel-hello-world/world-branch"
  ]);

  const hello = branch({ key: "hello", vectorIndex: 0 });
  const world = branch({ key: "world", vectorIndex: 1 });
  const compose = branch({ key: "compose", vectorIndex: 2 });
  const declarations = Object.freeze([
    declaration({
      branchRef: hello,
      observedStateRefs: ["observed://requirements/hello"],
      readRefs: ["requirement://REQ-T174-PARALLEL-HELLO-002"],
      writeTerritoryRefs: ["workspace://build_tenants/parallel_hello_world/src/hello.js"],
      outputAllocationRefs: ["artifact://parallel_hello_world/src/hello.js"],
      declaredPriority: 2
    }),
    declaration({
      branchRef: world,
      observedStateRefs: ["observed://requirements/world"],
      readRefs: ["requirement://REQ-T174-PARALLEL-HELLO-003"],
      writeTerritoryRefs: ["workspace://build_tenants/parallel_hello_world/src/world.js"],
      outputAllocationRefs: ["artifact://parallel_hello_world/src/world.js"],
      declaredPriority: 2
    }),
    declaration({
      branchRef: compose,
      parentBranchRefs: [hello.branchRef, world.branchRef],
      observedStateRefs: ["observed://requirements/composition"],
      readRefs: [
        "artifact://parallel_hello_world/src/hello.js",
        "artifact://parallel_hello_world/src/world.js",
        "requirement://REQ-T174-PARALLEL-HELLO-004"
      ],
      writeTerritoryRefs: ["workspace://build_tenants/parallel_hello_world/src/index.js"],
      outputAllocationRefs: ["artifact://parallel_hello_world/src/index.js"],
      declaredPriority: 1
    })
  ]);
  const policy = constructBranchExecutionPolicy({
    policyRef: "policy://odd-sdlc/t173/parallel-hello-world/max-two",
    maxConcurrency: 2,
    maxRetryAttempts: 0,
    leaseTtlMs: 10_000,
    resolvedSystemPolicyRefs: [
      "abg://abiogenesis/event-sourced-saga-frontier",
      traversal.selectionRef
    ]
  });
  const emittedEvents = [];
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: "frontier://odd-sdlc/t173/parallel-hello-world",
    declarations,
    policy,
    tasks: [
      task(hello.branchRef, "payload://hello", ["evidence://hello"]),
      task(world.branchRef, "payload://world", ["evidence://world"]),
      task(compose.branchRef, "payload://hello-world", ["evidence://compose"])
    ],
    eventSink: (event) => emittedEvents.push(event),
    maxBatches: 3,
    correlationId: "correlation://odd-sdlc/t173/parallel-hello-world"
  });

  assert.equal(run.kind, "evented_native_saga_frontier_run_result");
  assert.equal(run.batchCount, 2);
  assert.deepEqual(run.batches[0].selection.selectedBranchRefs, [
    hello.branchRef,
    world.branchRef
  ]);
  assert.deepEqual(run.batches[1].selection.selectedBranchRefs, [
    compose.branchRef
  ]);
  assert.deepEqual(run.completedBranchRefs, [
    compose.branchRef,
    hello.branchRef,
    world.branchRef
  ].sort());
  assert.deepEqual(run.failedBranchRefs, []);
  assert.equal(emittedEvents.length, run.emittedEvents.length);
  assert.ok(
    run.emittedEvents.some((event) => event.kind === "branch_lease_acquired")
  );
  assert.ok(
    run.emittedEvents.some((event) => event.kind === "branch_fan_in_projected")
  );

  const replayFanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: "fan-in://odd-sdlc/t173/parallel-hello-world",
    events: run.replayEvents,
    declaredOrderBranchRefs: [
      hello.branchRef,
      world.branchRef,
      compose.branchRef
    ]
  });
  assert.deepEqual(replayFanIn.orderedBranchRefs, [
    hello.branchRef,
    world.branchRef,
    compose.branchRef
  ]);
  assert.deepEqual(replayFanIn.payloadDigests, [
    "payload://hello",
    "payload://world",
    "payload://hello-world"
  ]);
});

test("T-173 four-lane frontier fans out two dev lanes and two test lanes before fan-in", async () => {
  const dependencyMap = Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t173/four-lane-hello-world",
    summaryRef: "decomposition-summary://odd-sdlc/t173/four-lane-hello-world",
    nodes: Object.freeze([
      Object.freeze({
        nodeId: "module://dev/hello",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://fan-in"]),
        ownedRequirementRefs: Object.freeze(["REQ-T173-FOUR-LANE-001"]),
        materializationTargetRefs: Object.freeze(["src/hello.js"])
      }),
      Object.freeze({
        nodeId: "module://dev/world",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://fan-in"]),
        ownedRequirementRefs: Object.freeze(["REQ-T173-FOUR-LANE-002"]),
        materializationTargetRefs: Object.freeze(["src/world.js"])
      }),
      Object.freeze({
        nodeId: "test://hello",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://fan-in"]),
        ownedRequirementRefs: Object.freeze(["TESTCASE-T173-FOUR-LANE-HELLO"]),
        materializationTargetRefs: Object.freeze(["test/hello.test.js"])
      }),
      Object.freeze({
        nodeId: "test://world",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://fan-in"]),
        ownedRequirementRefs: Object.freeze(["TESTCASE-T173-FOUR-LANE-WORLD"]),
        materializationTargetRefs: Object.freeze(["test/world.test.js"])
      }),
      Object.freeze({
        nodeId: "module://fan-in",
        predecessorNodeIds: Object.freeze([
          "module://dev/hello",
          "module://dev/world",
          "test://hello",
          "test://world"
        ]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T173-FOUR-LANE-003"]),
        materializationTargetRefs: Object.freeze(["src/index.js"])
      })
    ]),
    steelThreadCandidateNodeIds: Object.freeze(["module://dev/hello"]),
    parallelPartitionRefs: Object.freeze([
      "partition://four-lane-hello-world/dev-hello",
      "partition://four-lane-hello-world/dev-world",
      "partition://four-lane-hello-world/test-hello",
      "partition://four-lane-hello-world/test-world"
    ]),
    cycleRefs: Object.freeze([])
  });
  const traversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t173/four-lane-hello-world",
    dependencyMap,
    policy: "parallel_when_partitioned",
    basisRefs: Object.freeze([
      "decomposition-summary://odd-sdlc/t173/four-lane-hello-world",
      "dependency-map://odd-sdlc/t173/four-lane-hello-world"
    ])
  });
  assert.equal(traversal.selectedMethod, "parallel");
  assert.deepEqual(traversal.parallelGroupRefs, [
    "partition://four-lane-hello-world/dev-hello",
    "partition://four-lane-hello-world/dev-world",
    "partition://four-lane-hello-world/test-hello",
    "partition://four-lane-hello-world/test-world"
  ]);

  const devHello = branch({ key: "four-lane-dev-hello", vectorIndex: 0 });
  const devWorld = branch({ key: "four-lane-dev-world", vectorIndex: 1 });
  const testHello = branch({ key: "four-lane-test-hello", vectorIndex: 2 });
  const testWorld = branch({ key: "four-lane-test-world", vectorIndex: 3 });
  const fanIn = branch({ key: "four-lane-fan-in", vectorIndex: 4 });
  const rootBranchRefs = [
    devHello.branchRef,
    devWorld.branchRef,
    testHello.branchRef,
    testWorld.branchRef
  ];
  const declarations = Object.freeze([
    declaration({
      branchRef: devHello,
      observedStateRefs: ["observed://requirements/dev-hello"],
      readRefs: ["requirement://REQ-T173-FOUR-LANE-001"],
      writeTerritoryRefs: [
        "workspace://build_tenants/four_lane_hello_world/src/hello.js"
      ],
      outputAllocationRefs: ["artifact://four_lane_hello_world/src/hello.js"],
      declaredPriority: 2
    }),
    declaration({
      branchRef: devWorld,
      observedStateRefs: ["observed://requirements/dev-world"],
      readRefs: ["requirement://REQ-T173-FOUR-LANE-002"],
      writeTerritoryRefs: [
        "workspace://build_tenants/four_lane_hello_world/src/world.js"
      ],
      outputAllocationRefs: ["artifact://four_lane_hello_world/src/world.js"],
      declaredPriority: 2
    }),
    declaration({
      branchRef: testHello,
      observedStateRefs: ["observed://testcases/hello"],
      readRefs: ["testcase://TESTCASE-T173-FOUR-LANE-HELLO"],
      writeTerritoryRefs: [
        "workspace://build_tenants/four_lane_hello_world/test/hello.test.js"
      ],
      outputAllocationRefs: [
        "artifact://four_lane_hello_world/test/hello.test.js"
      ],
      declaredPriority: 2
    }),
    declaration({
      branchRef: testWorld,
      observedStateRefs: ["observed://testcases/world"],
      readRefs: ["testcase://TESTCASE-T173-FOUR-LANE-WORLD"],
      writeTerritoryRefs: [
        "workspace://build_tenants/four_lane_hello_world/test/world.test.js"
      ],
      outputAllocationRefs: [
        "artifact://four_lane_hello_world/test/world.test.js"
      ],
      declaredPriority: 2
    }),
    declaration({
      branchRef: fanIn,
      parentBranchRefs: rootBranchRefs,
      observedStateRefs: ["observed://requirements/fan-in"],
      readRefs: [
        "artifact://four_lane_hello_world/src/hello.js",
        "artifact://four_lane_hello_world/src/world.js",
        "artifact://four_lane_hello_world/test/hello.test.js",
        "artifact://four_lane_hello_world/test/world.test.js",
        "requirement://REQ-T173-FOUR-LANE-003"
      ],
      writeTerritoryRefs: ["workspace://build_tenants/four_lane_hello_world/src/index.js"],
      outputAllocationRefs: ["artifact://four_lane_hello_world/src/index.js"],
      declaredPriority: 1
    })
  ]);
  const policy = constructBranchExecutionPolicy({
    policyRef: "policy://odd-sdlc/t173/four-lane-hello-world/max-four",
    maxConcurrency: 4,
    maxRetryAttempts: 0,
    leaseTtlMs: 10_000,
    resolvedSystemPolicyRefs: [
      "abg://abiogenesis/event-sourced-saga-frontier",
      traversal.selectionRef
    ]
  });
  const emittedEvents = [];
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: "frontier://odd-sdlc/t173/four-lane-hello-world",
    declarations,
    policy,
    tasks: [
      task(devHello.branchRef, "payload://dev/hello", ["evidence://dev/hello"]),
      task(devWorld.branchRef, "payload://dev/world", ["evidence://dev/world"]),
      task(testHello.branchRef, "payload://test/hello", ["evidence://test/hello"]),
      task(testWorld.branchRef, "payload://test/world", ["evidence://test/world"]),
      task(fanIn.branchRef, "payload://four-lane/hello-world", ["evidence://fan-in"])
    ],
    eventSink: (event) => emittedEvents.push(event),
    maxBatches: 3,
    correlationId: "correlation://odd-sdlc/t173/four-lane-hello-world"
  });

  assert.equal(run.kind, "evented_native_saga_frontier_run_result");
  assert.equal(run.batchCount, 2);
  assert.equal(run.batches[0].selection.selectedBranchRefs.length, 4);
  assert.deepEqual(
    [...run.batches[0].selection.selectedBranchRefs].sort(),
    [...rootBranchRefs].sort()
  );
  assert.deepEqual(run.batches[1].selection.selectedBranchRefs, [
    fanIn.branchRef
  ]);
  assert.deepEqual(run.completedBranchRefs, [
    ...rootBranchRefs,
    fanIn.branchRef
  ].sort());
  assert.deepEqual(run.failedBranchRefs, []);
  assert.equal(emittedEvents.length, run.emittedEvents.length);
  assert.equal(
    run.emittedEvents.filter((event) => event.kind === "branch_lease_acquired")
      .length,
    5
  );
  assert.equal(
    run.emittedEvents.filter((event) => event.kind === "branch_payload_admitted")
      .length,
    5
  );
  assert.equal(
    run.emittedEvents.filter((event) => event.kind === "branch_lease_released")
      .length,
    5
  );

  const replayFanIn = deriveBranchFanInProjectionFromEvents({
    fanInRef: "fan-in://odd-sdlc/t173/parallel-hello-world",
    events: run.replayEvents,
    declaredOrderBranchRefs: [
      devHello.branchRef,
      devWorld.branchRef,
      testHello.branchRef,
      testWorld.branchRef,
      fanIn.branchRef
    ]
  });
  assert.deepEqual(replayFanIn.orderedBranchRefs, [
    devHello.branchRef,
    devWorld.branchRef,
    testHello.branchRef,
    testWorld.branchRef,
    fanIn.branchRef
  ]);
  assert.deepEqual(replayFanIn.payloadDigests, [
    "payload://dev/hello",
    "payload://dev/world",
    "payload://test/hello",
    "payload://test/world",
    "payload://four-lane/hello-world"
  ]);
});
