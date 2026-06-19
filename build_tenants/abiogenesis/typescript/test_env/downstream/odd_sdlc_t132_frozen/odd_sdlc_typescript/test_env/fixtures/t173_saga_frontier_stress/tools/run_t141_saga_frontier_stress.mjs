import {
  selectSdlcDependencyMapTraversal
} from "@odd-sdlc/typescript-tenant";
import {
  constructBranchExecutionPolicy,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchIdempotencyKey,
  deriveBranchLeaseProjectionFromEvents,
  runEventedNativeSagaFrontier
} from "@abiogenesis/typescript-tenant/abg/m03";

const EMPTY_ATTRS = Object.freeze({ entries: Object.freeze([]) });
const FRONTIER_REF = "frontier://odd-sdlc/t173/stress-50-fan-out";
const FAN_IN_REF = "fan-in://odd-sdlc/t173/stress-50-fan-out";
const GRAPH_CALL_ID = "graph-call://odd-sdlc/t173/stress-50-fan-out";
const FRAME_ID = "frame://odd-sdlc/t173/stress-50-fan-out";
const BASIS_ID = "basis://odd-sdlc/t173/stress-50-fan-out";
const GRAPH_FUNCTION_ID =
  "graph-function://odd-sdlc/t173/stress-50-fan-out";
const FRAME_LINEAGE_ID = "lineage://odd-sdlc/t173/stress-50-fan-out";
const FRAME_ATTEMPT_ID = "attempt://odd-sdlc/t173/stress-50-fan-out/0";

function executionBasis() {
  return Object.freeze({
    id: BASIS_ID,
    workspaceRoot: "/workspace/t173-saga-frontier-stress",
    moduleName: "odd_sdlc_t173_saga_frontier_stress",
    graphFunction: Object.freeze({
      name: "t173_saga_frontier_stress",
      environment: Object.freeze({
        requires: Object.freeze([]),
        provides: Object.freeze([]),
        carries: Object.freeze([])
      }),
      inputs: Object.freeze([]),
      outputs: Object.freeze([]),
      template: Object.freeze({
        kind: "symbolic",
        ref: "graph://odd-sdlc/t173/stress-50-fan-out",
        graph: null,
        version: null
      }),
      effects: Object.freeze([]),
      declarations: EMPTY_ATTRS,
      tags: Object.freeze([]),
      id: GRAPH_FUNCTION_ID
    }),
    graph: Object.freeze({
      name: "t173_saga_frontier_stress",
      inputs: Object.freeze([]),
      outputs: Object.freeze([]),
      nodes: Object.freeze([]),
      vectors: Object.freeze([]),
      contexts: Object.freeze([]),
      rules: Object.freeze([]),
      effects: Object.freeze([]),
      tags: Object.freeze([]),
      id: "graph://odd-sdlc/t173/stress-50-fan-out"
    }),
    job: Object.freeze({
      name: "t173_saga_frontier_stress_job",
      contracts: Object.freeze([]),
      roles: Object.freeze([]),
      tags: Object.freeze([]),
      policyHooks: EMPTY_ATTRS,
      id: "job://odd-sdlc/t173/stress-50-fan-out"
    }),
    modulePolicyHooks: EMPTY_ATTRS,
    runtimeIdentity: Object.freeze({
      workerId: "worker://synthetic",
      backendId: "backend://node-test",
      buildId: "build://odd-sdlc/t173",
      resolvedRuntimeRef: "runtime://abg/3.8/saga-frontier"
    }),
    resolvedPolicy: Object.freeze({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t173/stress-50-fan-out",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    startIntent: Object.freeze({
      target: Object.freeze({ handle: "t173_saga_frontier_stress" }),
      scope: Object.freeze({ workspaceRoot: "/workspace/t173-saga-frontier-stress" })
    }),
    runId: "run://odd-sdlc/t173/stress-50-fan-out",
    workKey: "work://odd-sdlc/t173/stress-50-fan-out",
    frameId: FRAME_ID,
    frameLineageId: FRAME_LINEAGE_ID
  });
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function uniqueBranches(branches) {
  const byRef = new Map();
  for (const branch of branches) {
    byRef.set(branch.branchRef, branch);
  }
  return [...byRef.values()].sort((left, right) =>
    left.branchRef.localeCompare(right.branchRef)
  );
}

function randomMembers(branches, count, random, excludedRefs = new Set()) {
  const selected = [];
  const selectedRefs = new Set(excludedRefs);
  while (selected.length < count && selectedRefs.size < branches.length) {
    const candidate = branches[Math.floor(random() * branches.length)];
    if (!selectedRefs.has(candidate.branchRef)) {
      selected.push(candidate);
      selectedRefs.add(candidate.branchRef);
    }
  }
  return selected;
}

function branch(branchKey, vectorIndex) {
  return constructBranchRef({
    branchRef: `branch://odd-sdlc/t173/stress/${branchKey}`,
    graphCallId: GRAPH_CALL_ID,
    frameId: FRAME_ID,
    vectorIndex,
    branchKey,
    fanInScopeRef: FAN_IN_REF,
    workKey: `work://odd-sdlc/t173/stress/${branchKey}`,
    basisId: BASIS_ID,
    graphFunctionId: GRAPH_FUNCTION_ID,
    frameLineageId: FRAME_LINEAGE_ID,
    frameAttemptId: FRAME_ATTEMPT_ID,
    frontierRef: FRONTIER_REF
  });
}

function declaration(branchRef, input = {}) {
  const observedStateRefs =
    input.observedStateRefs ?? ["observed://odd-sdlc/t173/stress/current"];
  const writeTerritoryRefs =
    input.writeTerritoryRefs ?? [`write://odd-sdlc/t173/stress/${branchRef.branchKey}`];
  const outputAllocationRefs =
    input.outputAllocationRefs ??
    [`output://odd-sdlc/t173/stress/${branchRef.branchKey}`];
  const idempotencyKey = deriveBranchIdempotencyKey({
    commandKind: "admit_sdlc_stress_branch_result",
    branchRef,
    observedStateRefs,
    writeTerritoryRefs,
    outputAllocationRefs
  });
  return constructDependencyFrontierDeclaration({
    branchRef,
    parentBranchRefs: input.parentBranchRefs ?? [],
    observedStateRefs,
    readRefs: input.readRefs ?? ["read://odd-sdlc/t173/stress/shared"],
    writeTerritoryRefs,
    outputAllocationRefs,
    idempotencyKey,
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

function delayedTask(branchRef, runCounters) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef: branchRef.branchRef,
    run: async () => {
      runCounters.active += 1;
      runCounters.maxActive = Math.max(runCounters.maxActive, runCounters.active);
      runCounters.started.push(branchRef.branchRef);
      await new Promise((resolve) => setTimeout(resolve, 1));
      runCounters.active -= 1;
      runCounters.completed.push(branchRef.branchRef);
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: branchRef.branchRef,
        payloadDigest: `sha256:odd-sdlc:t173:stress:${branchRef.branchKey}`,
        evidenceRefs: [`evidence://odd-sdlc/t173/stress/${branchRef.branchKey}`]
      });
    }
  });
}

function successorMap(declarations) {
  const successors = new Map();
  for (const item of declarations) {
    const itemRef = branchRefString(item.branchRef);
    for (const parent of item.parentBranchRefs) {
      const list = successors.get(parent) ?? [];
      list.push(itemRef);
      successors.set(parent, list);
    }
  }
  return successors;
}

function branchRefString(value) {
  return typeof value === "string" ? value : value.branchRef;
}

function branchKeyFromRef(value) {
  return branchRefString(value).split("/").at(-1);
}

function dependencyMapFromDeclarations(declarations) {
  const successors = successorMap(declarations);
  return Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t173/stress-50-fan-out",
    summaryRef: "decomposition-summary://odd-sdlc/t173/stress-50-fan-out",
    nodes: Object.freeze(
      declarations.map((item) =>
        Object.freeze({
          nodeId: `module://${branchKeyFromRef(item.branchRef)}`,
          predecessorNodeIds: Object.freeze(
            item.parentBranchRefs.map((ref) => `module://${branchKeyFromRef(ref)}`)
          ),
          successorNodeIds: Object.freeze(
            (successors.get(branchRefString(item.branchRef)) ?? []).map(
              (ref) => `module://${branchKeyFromRef(ref)}`
            )
          ),
          ownedRequirementRefs: Object.freeze([
            `REQ-T173-STRESS-${branchKeyFromRef(item.branchRef)}`
          ]),
          materializationTargetRefs: Object.freeze(item.outputAllocationRefs)
        })
      )
    ),
    steelThreadCandidateNodeIds: Object.freeze([
      `module://${branchKeyFromRef(declarations[0].branchRef)}`
    ]),
    parallelPartitionRefs: Object.freeze(
      declarations
        .filter((item) => item.parentBranchRefs.length === 0)
        .map((item) => `partition://${branchKeyFromRef(item.branchRef)}`)
    ),
    cycleRefs: Object.freeze([])
  });
}

async function main() {
  const random = seededRandom(0x141167);
  const rootBranches = Array.from({ length: 50 }, (_value, index) =>
    branch(`stress-root-${String(index).padStart(2, "0")}`, index)
  );
  const reducerBranches = Array.from({ length: 10 }, (_value, index) =>
    branch(`stress-reducer-${String(index).padStart(2, "0")}`, 50 + index)
  );
  const leafBranches = Array.from({ length: 5 }, (_value, index) =>
    branch(`stress-leaf-${String(index).padStart(2, "0")}`, 60 + index)
  );
  const rootDeclarations = rootBranches.map((branchRef, index) =>
    declaration(branchRef, {
      declaredPriority: 1_000 - index,
      readRefs: ["work://odd-sdlc/t173/stress/source"],
      outputAllocationRefs: [
        `output://odd-sdlc/t173/stress/root/${branchRef.branchKey}`
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
        (parent) => `output://odd-sdlc/t173/stress/root/${parent.branchKey}`
      ),
      outputAllocationRefs: [
        `output://odd-sdlc/t173/stress/reducer/${branchRef.branchKey}`
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
        (parent) => `output://odd-sdlc/t173/stress/reducer/${parent.branchKey}`
      ),
      outputAllocationRefs: [
        `output://odd-sdlc/t173/stress/leaf/${branchRef.branchKey}`
      ]
    });
  });
  const declarations = [
    ...rootDeclarations,
    ...reducerDeclarations,
    ...leafDeclarations
  ];
  const allBranches = [...rootBranches, ...reducerBranches, ...leafBranches];
  const dependencyMap = dependencyMapFromDeclarations(declarations);
  const traversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t173/stress-50-fan-out",
    dependencyMap,
    policy: "parallel_when_partitioned",
    basisRefs: Object.freeze([
      dependencyMap.summaryRef,
      dependencyMap.mapRef,
      "abg://3.8/event-sourced-saga-frontier"
    ])
  });
  if (traversal.selectedMethod !== "parallel") {
    throw new Error(`Expected parallel traversal, saw ${traversal.selectedMethod}`);
  }

  const runCounters = counters();
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: FRONTIER_REF,
    declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://odd-sdlc/t173/stress-50-fan-out",
      maxConcurrency: 50,
      resolvedSystemPolicyRefs: [
        "abg-default://saga-frontier/max-concurrency/fifty",
        traversal.selectionRef
      ]
    }),
    tasks: allBranches.map((branchRef) => delayedTask(branchRef, runCounters)),
    eventSink: () => {},
    correlationId: "correlation://odd-sdlc/t173/stress-50-fan-out"
  });
  const emittedKinds = run.emittedEvents.map((event) => event.kind);
  const leaseProjection = deriveBranchLeaseProjectionFromEvents({
    projectionRef: "branch-lease-projection://odd-sdlc/t173/stress-50-fan-out",
    nowMs: 100_000,
    events: run.replayEvents
  });
  const summary = Object.freeze({
    scenario: "t173_saga_frontier_stress",
    selectedMethod: traversal.selectedMethod,
    rootCount: rootBranches.length,
    reducerCount: reducerBranches.length,
    leafCount: leafBranches.length,
    declarationCount: declarations.length,
    dependencyMapNodeCount: dependencyMap.nodes.length,
    parallelGroupCount: traversal.parallelGroupRefs.length,
    maxActive: runCounters.maxActive,
    batchCount: run.batchCount,
    batchSizes: run.batches.map(
      (batch) => batch.selection.selectedBranchRefs.length
    ),
    completedCount: run.completedBranchRefs.length,
    failedCount: run.failedBranchRefs.length,
    leaseAcquiredCount: emittedKinds.filter(
      (kind) => kind === "branch_lease_acquired"
    ).length,
    payloadAdmittedCount: emittedKinds.filter(
      (kind) => kind === "branch_payload_admitted"
    ).length,
    leaseReleasedCount: emittedKinds.filter(
      (kind) => kind === "branch_lease_released"
    ).length,
    fanInProjectedCount: emittedKinds.filter(
      (kind) => kind === "branch_fan_in_projected"
    ).length,
    activeLeaseCount: leaseProjection.activeLeaseRefs.length,
    releasedLeaseCount: leaseProjection.releasedLeaseRefs.length
  });

  const expected = {
    rootCount: 50,
    reducerCount: 10,
    leafCount: 5,
    declarationCount: 65,
    dependencyMapNodeCount: 65,
    batchCount: 3,
    maxActive: 50,
    completedCount: 65,
    failedCount: 0,
    leaseAcquiredCount: 65,
    payloadAdmittedCount: 65,
    leaseReleasedCount: 65,
    fanInProjectedCount: 3,
    activeLeaseCount: 0,
    releasedLeaseCount: 65
  };
  for (const [field, value] of Object.entries(expected)) {
    if (summary[field] !== value) {
      throw new Error(
        `stress summary ${field} expected ${value}, saw ${summary[field]}`
      );
    }
  }
  if (JSON.stringify(summary.batchSizes) !== JSON.stringify([50, 10, 5])) {
    throw new Error(`stress batch sizes ${JSON.stringify(summary.batchSizes)}`);
  }

  console.log(JSON.stringify(summary));
}

await main();
