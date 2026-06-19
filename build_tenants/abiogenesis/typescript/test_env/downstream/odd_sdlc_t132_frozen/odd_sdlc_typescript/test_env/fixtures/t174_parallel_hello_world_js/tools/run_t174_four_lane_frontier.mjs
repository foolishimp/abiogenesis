import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  selectSdlcDependencyMapTraversal
} from "@odd-sdlc/typescript-tenant";
import {
  constructBranchExecutionPolicy,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchFanInProjectionFromEvents,
  deriveBranchIdempotencyKey,
  runEventedNativeSagaFrontier
} from "@abiogenesis/typescript-tenant/abg/m03";

const EMPTY_ATTRS = Object.freeze({ entries: Object.freeze([]) });
const FRONTIER_REF = "frontier://odd-sdlc/t174/four-lane-hello-world";
const FAN_IN_REF = "fan-in://odd-sdlc/t174/four-lane-hello-world";
const GRAPH_CALL_ID = "graph-call://odd-sdlc/t174/four-lane-hello-world";
const FRAME_ID = "frame://odd-sdlc/t174/four-lane-hello-world";
const BASIS_ID = "basis://odd-sdlc/t174/four-lane-hello-world";
const GRAPH_FUNCTION_ID =
  "graph-function://odd-sdlc/t174/four-lane-hello-world";
const FRAME_LINEAGE_ID = "lineage://odd-sdlc/t174/four-lane-hello-world";
const FRAME_ATTEMPT_ID = "attempt://odd-sdlc/t174/four-lane-hello-world/0";

function packageVersion(specifier, expectedName) {
  const resolved = import.meta.resolve(specifier);
  let current = dirname(fileURLToPath(resolved));
  for (let depth = 0; depth < 12; depth += 1) {
    const packageJson = resolve(current, "package.json");
    try {
      const payload = JSON.parse(readFileSync(packageJson, "utf8"));
      if (payload.name === expectedName) {
        return String(payload.version ?? "unknown");
      }
    } catch {
      // Keep walking toward the package root.
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return "unknown";
}

function executionBasis() {
  return Object.freeze({
    id: BASIS_ID,
    workspaceRoot: "/workspace/t174-four-lane-hello-world",
    moduleName: "odd_sdlc_t174_four_lane_hello_world",
    graphFunction: Object.freeze({
      name: "t174_four_lane_hello_world_frontier",
      environment: Object.freeze({
        requires: Object.freeze([]),
        provides: Object.freeze([]),
        carries: Object.freeze([])
      }),
      inputs: Object.freeze([]),
      outputs: Object.freeze([]),
      template: Object.freeze({
        kind: "symbolic",
        ref: "graph://odd-sdlc/t174/four-lane-hello-world",
        graph: null,
        version: null
      }),
      effects: Object.freeze([]),
      declarations: EMPTY_ATTRS,
      tags: Object.freeze([]),
      id: GRAPH_FUNCTION_ID
    }),
    graph: Object.freeze({
      name: "t174_four_lane_hello_world_frontier",
      inputs: Object.freeze([]),
      outputs: Object.freeze([]),
      nodes: Object.freeze([]),
      vectors: Object.freeze([]),
      contexts: Object.freeze([]),
      rules: Object.freeze([]),
      effects: Object.freeze([]),
      tags: Object.freeze([]),
      id: "graph://odd-sdlc/t174/four-lane-hello-world"
    }),
    job: Object.freeze({
      name: "t174_four_lane_hello_world_frontier_job",
      contracts: Object.freeze([]),
      roles: Object.freeze([]),
      tags: Object.freeze([]),
      policyHooks: EMPTY_ATTRS,
      id: "job://odd-sdlc/t174/four-lane-hello-world"
    }),
    modulePolicyHooks: EMPTY_ATTRS,
    runtimeIdentity: Object.freeze({
      workerId: "worker://synthetic",
      backendId: "backend://node-test",
      buildId: "build://odd-sdlc/t174",
      resolvedRuntimeRef: "runtime://abg/3.8/saga-frontier"
    }),
    resolvedPolicy: Object.freeze({
      resolvedPolicyBundleRef:
        "policy://odd-sdlc/t174/four-lane-hello-world",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    startIntent: Object.freeze({
      target: Object.freeze({
        handle: "t174_four_lane_hello_world_frontier"
      }),
      scope: Object.freeze({
        workspaceRoot: "/workspace/t174-four-lane-hello-world"
      })
    }),
    runId: "run://odd-sdlc/t174/four-lane-hello-world",
    workKey: "work://odd-sdlc/t174/four-lane-hello-world",
    frameId: FRAME_ID,
    frameLineageId: FRAME_LINEAGE_ID
  });
}

function branch(branchKey, vectorIndex) {
  return constructBranchRef({
    branchRef: `branch://odd-sdlc/t174/four-lane/${branchKey}`,
    graphCallId: GRAPH_CALL_ID,
    frameId: FRAME_ID,
    vectorIndex,
    branchKey,
    fanInScopeRef: FAN_IN_REF,
    workKey: `work://odd-sdlc/t174/four-lane/${branchKey}`,
    basisId: BASIS_ID,
    graphFunctionId: GRAPH_FUNCTION_ID,
    frameLineageId: FRAME_LINEAGE_ID,
    frameAttemptId: FRAME_ATTEMPT_ID,
    frontierRef: FRONTIER_REF
  });
}

function declaration(input) {
  const idempotencyKey = deriveBranchIdempotencyKey({
    commandKind: "admit_t174_four_lane_branch_result",
    branchRef: input.branch,
    observedStateRefs: input.observedStateRefs,
    writeTerritoryRefs: input.writeTerritoryRefs,
    outputAllocationRefs: input.outputAllocationRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef: input.branch,
    parentBranchRefs: input.parentBranchRefs ?? [],
    observedStateRefs: input.observedStateRefs,
    readRefs: input.readRefs,
    writeTerritoryRefs: input.writeTerritoryRefs,
    outputAllocationRefs: input.outputAllocationRefs,
    idempotencyKey,
    declaredPriority: input.declaredPriority ?? 1,
    criticalPathCost: input.criticalPathCost ?? 1
  });
}

function counters() {
  return {
    active: 0,
    maxActive: 0
  };
}

function delayedTask(branchRef, payloadDigest, evidenceRefs, runCounters) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef,
    run: async () => {
      runCounters.active += 1;
      runCounters.maxActive = Math.max(runCounters.maxActive, runCounters.active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      runCounters.active -= 1;
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef,
        payloadDigest,
        evidenceRefs
      });
    }
  });
}

const dependencyMap = Object.freeze({
  kind: "sdlc_module_dependency_map",
  mapRef: "dependency-map://odd-sdlc/t174/four-lane-hello-world",
  summaryRef: "decomposition-summary://odd-sdlc/t174/four-lane-hello-world",
  nodes: Object.freeze([
    Object.freeze({
      nodeId: "module://dev/hello",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze(["module://fan-in"]),
      ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-002"]),
      materializationTargetRefs: Object.freeze(["src/hello.js"])
    }),
    Object.freeze({
      nodeId: "module://dev/world",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze(["module://fan-in"]),
      ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-003"]),
      materializationTargetRefs: Object.freeze(["src/world.js"])
    }),
    Object.freeze({
      nodeId: "test://hello",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze(["module://fan-in"]),
      ownedRequirementRefs: Object.freeze(["TESTCASE-T174-HELLO"]),
      materializationTargetRefs: Object.freeze(["test/hello.test.js"])
    }),
    Object.freeze({
      nodeId: "test://world",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze(["module://fan-in"]),
      ownedRequirementRefs: Object.freeze(["TESTCASE-T174-WORLD"]),
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
      ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-004"]),
      materializationTargetRefs: Object.freeze(["src/index.js"])
    })
  ]),
  steelThreadCandidateNodeIds: Object.freeze(["module://dev/hello"]),
  parallelPartitionRefs: Object.freeze([
    "partition://t174-four-lane/dev-hello",
    "partition://t174-four-lane/dev-world",
    "partition://t174-four-lane/test-hello",
    "partition://t174-four-lane/test-world"
  ]),
  cycleRefs: Object.freeze([])
});

const traversal = selectSdlcDependencyMapTraversal({
  selectionRef: "selection://odd-sdlc/t174/four-lane-hello-world",
  dependencyMap,
  policy: "parallel_when_partitioned",
  basisRefs: Object.freeze([
    "decomposition-summary://odd-sdlc/t174/four-lane-hello-world",
    "dependency-map://odd-sdlc/t174/four-lane-hello-world"
  ])
});

const devHello = branch("dev-hello", 0);
const devWorld = branch("dev-world", 1);
const testHello = branch("test-hello", 2);
const testWorld = branch("test-world", 3);
const fanIn = branch("fan-in", 4);
const rootBranchRefs = [
  devHello.branchRef,
  devWorld.branchRef,
  testHello.branchRef,
  testWorld.branchRef
];

const declarations = Object.freeze([
  declaration({
    branch: devHello,
    observedStateRefs: ["observed://t174/dev-hello"],
    readRefs: ["requirement://REQ-T174-PARALLEL-HELLO-002"],
    writeTerritoryRefs: ["workspace://parallel_hello_world/src/hello.js"],
    outputAllocationRefs: ["artifact://parallel_hello_world/src/hello.js"],
    declaredPriority: 2
  }),
  declaration({
    branch: devWorld,
    observedStateRefs: ["observed://t174/dev-world"],
    readRefs: ["requirement://REQ-T174-PARALLEL-HELLO-003"],
    writeTerritoryRefs: ["workspace://parallel_hello_world/src/world.js"],
    outputAllocationRefs: ["artifact://parallel_hello_world/src/world.js"],
    declaredPriority: 2
  }),
  declaration({
    branch: testHello,
    observedStateRefs: ["observed://t174/test-hello"],
    readRefs: ["testcase://T174-HELLO-BRANCH"],
    writeTerritoryRefs: ["workspace://parallel_hello_world/test/hello.test.js"],
    outputAllocationRefs: ["artifact://parallel_hello_world/test/hello.test.js"],
    declaredPriority: 2
  }),
  declaration({
    branch: testWorld,
    observedStateRefs: ["observed://t174/test-world"],
    readRefs: ["testcase://T174-WORLD-BRANCH"],
    writeTerritoryRefs: ["workspace://parallel_hello_world/test/world.test.js"],
    outputAllocationRefs: ["artifact://parallel_hello_world/test/world.test.js"],
    declaredPriority: 2
  }),
  declaration({
    branch: fanIn,
    parentBranchRefs: rootBranchRefs,
    observedStateRefs: ["observed://t174/fan-in"],
    readRefs: [
      "artifact://parallel_hello_world/src/hello.js",
      "artifact://parallel_hello_world/src/world.js",
      "artifact://parallel_hello_world/test/hello.test.js",
      "artifact://parallel_hello_world/test/world.test.js",
      "requirement://REQ-T174-PARALLEL-HELLO-004"
    ],
    writeTerritoryRefs: ["workspace://parallel_hello_world/src/index.js"],
    outputAllocationRefs: ["artifact://parallel_hello_world/src/index.js"],
    declaredPriority: 1
  })
]);

const runCounters = counters();
const emittedEvents = [];
const branchExecutionPolicy = constructBranchExecutionPolicy({
  policyRef: "policy://odd-sdlc/t174/four-lane-hello-world/max-four",
  maxConcurrency: 4,
  maxRetryAttempts: 0,
  leaseTtlMs: 10_000,
  resolvedSystemPolicyRefs: [
    "abg://3.8/event-sourced-saga-frontier",
    traversal.selectionRef
  ]
});
const run = await runEventedNativeSagaFrontier({
  basis: executionBasis(),
  frontierRef: FRONTIER_REF,
  declarations,
  policy: branchExecutionPolicy,
  tasks: [
    delayedTask(devHello.branchRef, "payload://dev/hello", ["evidence://dev/hello"], runCounters),
    delayedTask(devWorld.branchRef, "payload://dev/world", ["evidence://dev/world"], runCounters),
    delayedTask(testHello.branchRef, "payload://test/hello", ["evidence://test/hello"], runCounters),
    delayedTask(testWorld.branchRef, "payload://test/world", ["evidence://test/world"], runCounters),
    delayedTask(fanIn.branchRef, "payload://four-lane/hello-world", ["evidence://fan-in"], runCounters)
  ],
  eventSink: (event) => emittedEvents.push(event),
  maxBatches: 3,
  correlationId: "correlation://odd-sdlc/t174/four-lane-hello-world"
});

const replayFanIn = deriveBranchFanInProjectionFromEvents({
  fanInRef: FAN_IN_REF,
  events: run.replayEvents,
  declaredOrderBranchRefs: [
    devHello.branchRef,
    devWorld.branchRef,
    testHello.branchRef,
    testWorld.branchRef,
    fanIn.branchRef
  ]
});

const countEvents = (kind) =>
  run.emittedEvents.filter((event) => event.kind === kind).length;

console.log(JSON.stringify({
  scenario: "t174_four_lane_hello_world_frontier",
  oddSdlcVersion: packageVersion(
    "@odd-sdlc/typescript-tenant",
    "@odd-sdlc/typescript-tenant"
  ),
  abgVersion: packageVersion(
    "@abiogenesis/typescript-tenant/abg/m03",
    "@abiogenesis/typescript-tenant"
  ),
  sdlcAuthority: "topology_and_proportionality_declaration",
  executionAuthority: "abg_evented_saga_frontier",
  parallelismControl: "abg_branch_execution_policy",
  selectedMethod: traversal.selectedMethod,
  abgPolicyMaxConcurrency: branchExecutionPolicy.maxConcurrency,
  parallelGroupCount: traversal.parallelGroupRefs.length,
  declarationCount: declarations.length,
  laneCount: rootBranchRefs.length,
  devLaneCount: 2,
  testLaneCount: 2,
  fanInCount: 1,
  batchCount: run.batchCount,
  batchSizes: run.batches.map((batch) => batch.selection.selectedBranchRefs.length),
  abgSelectedFirstBatchLaneCount:
    run.batches[0]?.selection.selectedBranchRefs.length ?? 0,
  firstBatchLaneRefs: run.batches[0]?.selection.selectedBranchRefs ?? [],
  completedCount: run.completedBranchRefs.length,
  failedCount: run.failedBranchRefs.length,
  maxActive: runCounters.maxActive,
  leaseAcquiredCount: countEvents("branch_lease_acquired"),
  payloadAdmittedCount: countEvents("branch_payload_admitted"),
  leaseReleasedCount: countEvents("branch_lease_released"),
  fanInProjectedCount: countEvents("branch_fan_in_projected"),
  replayPayloadDigests: replayFanIn.payloadDigests,
  emittedEventCount: emittedEvents.length
}));
