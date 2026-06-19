// Validates: T-172

import test from "node:test";
import assert from "node:assert/strict";

import {
  SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
  deriveSdlcDecompositionSummary,
  deriveSdlcStagedImplementationTopologyAuthority,
  selectSdlcDependencyMapTraversal
} from "../../build/semantic/code/src/index.js";

function row(overrides = {}) {
  return {
    downstreamId: "component://core",
    parentId: "module://app",
    ownedUpstreamRefs: ["REQ-001"],
    publicBoundaryRefs: ["src/index.ts"],
    substantiveResponsibilityRefs: ["function://main"],
    materializationTargetRefs: ["src/index.ts"],
    residualRefs: [],
    ...overrides
  };
}

function summary(rows, overrides = {}) {
  return deriveSdlcDecompositionSummary({
    stageId: "requirements_to_components",
    upstreamKind: "requirement",
    downstreamKind: "component",
    thresholds: SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    rows,
    ...overrides
  });
}

function thresholds(overrides = {}) {
  return {
    ...SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    ...overrides
  };
}

test("T-172 admits proportional decomposition rows", () => {
  const admitted = summary([
    row({
      downstreamId: "component://parser",
      ownedUpstreamRefs: ["REQ-001", "REQ-002"],
      substantiveResponsibilityRefs: ["function://parse"]
    }),
    row({
      downstreamId: "component://mapper",
      ownedUpstreamRefs: ["REQ-003"],
      substantiveResponsibilityRefs: ["function://map"]
    })
  ]);

  assert.equal(admitted.kind, "sdlc_decomposition_summary");
  assert.equal(admitted.upstreamCount, 3);
  assert.equal(admitted.downstreamCount, 2);
  assert.equal(admitted.upstreamPerDownstreamRatio, 1.5);
  assert.equal(admitted.downstreamPerUpstreamRatio, 2 / 3);
  assert.equal(admitted.admissionDecision, "admit");
  assert.deepEqual(admitted.blockingReasons, []);
});

test("T-172 implementation topology projects structural boundary refs, not semantic boundary prose", () => {
  const authority = deriveSdlcStagedImplementationTopologyAuthority({
    requireTrivialDegenerateProduct: true,
    register: {
      kind: "sdlc_design_depth_register",
      registerVersion: "ts-design-depth-v1",
      targetAssetType: "implementation_design_surface",
      implementationModuleRows: [
        {
          kind: "sdlc_implementation_module_row",
          moduleName: "hello_world_javascript",
          moduleRef: "module://hello-world-javascript"
        }
      ],
      componentTopologyRows: [
        {
          kind: "sdlc_component_topology_row",
          componentId: "hello_world_javascript:hello_entry",
          moduleName: "hello_world_javascript",
          relativePath: "build_tenants/hello_world_javascript/src/hello.js",
          publicBoundary: "stdout Hello, world!",
          concernRole: "io_adapter",
          requirementIds: ["REQ-T132-001"],
          sourceAssetRefs: ["fixture://t172/implementation-design"]
        }
      ],
      componentRealizationRows: [
        {
          kind: "sdlc_component_realization_row",
          componentId: "hello_world_javascript:hello_entry",
          moduleName: "hello_world_javascript",
          relativePath: "build_tenants/hello_world_javascript/src/hello.js",
          publicBoundary: "stdout Hello, world!",
          trancheId: "tranche-1",
          firstProductFileToChange:
            "build_tenants/hello_world_javascript/src/hello.js",
          upstreamComponentIds: [],
          requirementIds: ["REQ-T132-001"],
          sourceAssetRefs: ["fixture://t172/implementation-design"]
        }
      ]
    }
  });

  assert.equal(authority.summary.admissionDecision, "admit");
  assert.deepEqual(authority.summary.invalidReferenceFields, []);
  assert.deepEqual(authority.summary.rows[0].publicBoundaryRefs, [
    "build_tenants/hello_world_javascript/src/hello.js"
  ]);
  assert.equal(
    authority.summary.rows[0].publicBoundaryRefs.includes("stdout Hello, world!"),
    false
  );
});

test("T-172 rejects high-density downstream rows before materialization", () => {
  const rejected = summary([
    row({
      downstreamId: "component://god-module",
      ownedUpstreamRefs: Array.from({ length: 9 }, (_, index) => `REQ-${index + 1}`),
      publicBoundaryRefs: ["src/god.ts"],
      substantiveResponsibilityRefs: ["function://all"]
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.overloadedDownstreamIds, ["component://god-module"]);
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_high_density_downstream_rows"
    )
  );
});

test("T-172 rejects explosion when one upstream fans into too many downstream rows", () => {
  const rejected = summary(
    Array.from({ length: 9 }, (_, index) =>
      row({
        downstreamId: `component://split-${index + 1}`,
        ownedUpstreamRefs: ["REQ-001"],
        publicBoundaryRefs: [`src/split-${index + 1}.ts`],
        substantiveResponsibilityRefs: [`function://split-${index + 1}`],
        materializationTargetRefs: [`src/split-${index + 1}.ts`]
      })
    )
  );

  assert.equal(rejected.admissionDecision, "reject");
  assert.equal(rejected.downstreamPerUpstreamRatio, 9);
  assert.deepEqual(rejected.explosionUpstreamRefs, ["REQ-001"]);
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_explosion_downstream_rows"
    )
  );
});

test("T-172 rejects facade rows that carry obligations without boundary or responsibility", () => {
  const rejected = summary([
    row({
      downstreamId: "component://facade",
      ownedUpstreamRefs: ["REQ-001", "REQ-002"],
      publicBoundaryRefs: [],
      substantiveResponsibilityRefs: []
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.facadeDownstreamIds, ["component://facade"]);
  assert.ok(rejected.blockingReasons.includes("decomposition_facade_downstream_rows"));
});

test("T-172 rejects under-decomposed parents whose children are only facade rows", () => {
  const rejected = summary([
    row({
      downstreamId: "component://facade-a",
      parentId: "module://broad",
      ownedUpstreamRefs: ["REQ-001", "REQ-002", "REQ-003", "REQ-004", "REQ-005"],
      publicBoundaryRefs: [],
      substantiveResponsibilityRefs: []
    }),
    row({
      downstreamId: "component://facade-b",
      parentId: "module://broad",
      ownedUpstreamRefs: ["REQ-006", "REQ-007", "REQ-008", "REQ-009"],
      publicBoundaryRefs: [],
      substantiveResponsibilityRefs: []
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.underDecomposedParentIds, ["module://broad"]);
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_under_decomposed_parent_rows"
    )
  );
});

test("T-172 rejects residuals carried outside the owning subsurface", () => {
  const rejected = summary([
    row({
      downstreamId: "component://parser",
      ownedUpstreamRefs: ["REQ-001"],
      residualRefs: ["REQ-999"]
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.residualOutsideSubsurfaceRefs, ["REQ-999"]);
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_residual_outside_subsurface"
    )
  );
});

test("T-172 admits residuals owned by an explicit stage upstream universe", () => {
  const rejectedWithoutUniverse = summary([
    row({
      downstreamId: "component://parser",
      ownedUpstreamRefs: ["REQ-001"],
      residualRefs: ["REQ-002"]
    })
  ]);

  assert.equal(rejectedWithoutUniverse.admissionDecision, "reject");
  assert.deepEqual(rejectedWithoutUniverse.residualOutsideSubsurfaceRefs, [
    "REQ-002"
  ]);

  const admittedWithUniverse = summary(
    [
      row({
        downstreamId: "component://parser",
        ownedUpstreamRefs: ["REQ-001"],
        residualRefs: ["REQ-002"]
      })
    ],
    {
      stageUpstreamUniverseRefs: ["REQ-001", "REQ-002"]
    }
  );

  assert.equal(admittedWithUniverse.admissionDecision, "admit");
  assert.deepEqual(admittedWithUniverse.stageUpstreamUniverseRefs, [
    "REQ-001",
    "REQ-002"
  ]);
  assert.deepEqual(admittedWithUniverse.residualOutsideSubsurfaceRefs, []);
});

test("T-172 admits trivial products only through an explicit single-component decomposition", () => {
  const admitted = summary(
    [
      row({
        downstreamId: "component://hello-world",
        parentId: null,
        ownedUpstreamRefs: ["REQ-HELLO-001", "REQ-HELLO-002"],
        publicBoundaryRefs: ["src/index.js"],
        substantiveResponsibilityRefs: ["function://hello"],
        materializationTargetRefs: ["src/index.js"]
      })
    ],
    { requireTrivialDegenerateProduct: true }
  );

  assert.equal(admitted.admissionDecision, "admit");
  assert.equal(admitted.upstreamCount, 2);
  assert.equal(admitted.downstreamCount, 1);

  const rejected = summary(
    [
      row({
        downstreamId: "component://hello-world",
        parentId: null,
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["src/index.js"],
        substantiveResponsibilityRefs: ["function://hello"],
        materializationTargetRefs: ["src/index.js"]
      }),
      row({
        downstreamId: "component://hello-world-proof",
        parentId: null,
        ownedUpstreamRefs: ["REQ-HELLO-002"],
        publicBoundaryRefs: ["test/hello.test.js"],
        substantiveResponsibilityRefs: ["function://proof"],
        materializationTargetRefs: ["test/hello.test.js"]
      })
    ],
    { requireTrivialDegenerateProduct: true }
  );

  assert.equal(rejected.admissionDecision, "reject");
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_trivial_product_not_single_component"
    )
  );
});

test("T-172 admits compression threshold boundary and rejects one epsilon over", () => {
  const rows = [
    row({
      downstreamId: "component://a",
      ownedUpstreamRefs: ["REQ-001", "REQ-002"],
      publicBoundaryRefs: ["src/a.ts"],
      substantiveResponsibilityRefs: ["function://a"]
    }),
    row({
      downstreamId: "component://b",
      ownedUpstreamRefs: ["REQ-003"],
      publicBoundaryRefs: ["src/b.ts"],
      substantiveResponsibilityRefs: ["function://b"]
    })
  ];
  const admitted = summary(rows, {
    thresholds: thresholds({ maxUpstreamPerDownstreamRatio: 1.5 })
  });
  const rejected = summary(rows, {
    thresholds: thresholds({ maxUpstreamPerDownstreamRatio: 1.499999 })
  });

  assert.equal(admitted.upstreamPerDownstreamRatio, 1.5);
  assert.equal(admitted.admissionDecision, "admit");
  assert.equal(rejected.admissionDecision, "reject");
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_compression_ratio_exceeds_threshold"
    )
  );
});

test("T-172 rejects downstream rows without upstream basis", () => {
  const rejected = summary([
    row({
      downstreamId: "component://placeholder",
      ownedUpstreamRefs: [],
      publicBoundaryRefs: ["src/placeholder.ts"],
      substantiveResponsibilityRefs: ["function://placeholder"]
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.unownedDownstreamIds, ["component://placeholder"]);
  assert.ok(
    rejected.blockingReasons.includes(
      "decomposition_downstream_rows_without_upstream_basis"
    )
  );
});

test("T-172 rejects empty upstream refs instead of silently dropping them", () => {
  const rejected = summary([
    row({
      downstreamId: "component://parser",
      ownedUpstreamRefs: ["REQ-001", ""],
      publicBoundaryRefs: ["src/parser.ts"],
      substantiveResponsibilityRefs: ["function://parse"]
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.invalidReferenceFields, [
    "component://parser.ownedUpstreamRefs[1]"
  ]);
  assert.ok(
    rejected.blockingReasons.includes("decomposition_invalid_reference_values")
  );
});

test("T-172 rejects invalid downstream and parent identity refs", () => {
  const rejected = summary([
    row({
      downstreamId: "   ",
      parentId: " module://app ",
      ownedUpstreamRefs: ["REQ-001"],
      publicBoundaryRefs: ["src/parser.ts"],
      substantiveResponsibilityRefs: ["function://parse"]
    })
  ]);

  assert.equal(rejected.admissionDecision, "reject");
  assert.deepEqual(rejected.invalidReferenceFields, [
    "<blank>.downstreamId",
    "<blank>.parentId"
  ]);
  assert.ok(
    rejected.blockingReasons.includes("decomposition_invalid_reference_values")
  );
});

function dependencyNode(nodeId, predecessorNodeIds = []) {
  return {
    nodeId,
    predecessorNodeIds,
    successorNodeIds: [],
    ownedRequirementRefs: [`REQ-${nodeId}`],
    materializationTargetRefs: [`src/${nodeId}.ts`]
  };
}

test("T-172 selects steel-thread traversal over admitted dependency maps", () => {
  const selection = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://t172/steel-thread",
    dependencyMap: {
      kind: "sdlc_module_dependency_map",
      mapRef: "dependency-map://t172/modules",
      summaryRef: "decomposition-summary://t172/modules",
      nodes: [dependencyNode("parser"), dependencyNode("mapper", ["parser"])],
      steelThreadCandidateNodeIds: ["parser"],
      parallelPartitionRefs: ["partition://parser", "partition://mapper"],
      cycleRefs: []
    }
  });

  assert.equal(selection.kind, "sdlc_dependency_traversal_selection");
  assert.equal(selection.selectedMethod, "steel_thread");
  assert.deepEqual(selection.selectedNodeIds, ["parser"]);
  assert.deepEqual(selection.parallelGroupRefs, []);
});

test("T-172 selects parallel traversal when evaluator policy admits partitions", () => {
  const selection = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://t172/parallel",
    policy: "parallel_when_partitioned",
    dependencyMap: {
      kind: "sdlc_test_dependency_map",
      mapRef: "dependency-map://t172/tests",
      summaryRef: "decomposition-summary://t172/tests",
      nodes: [dependencyNode("unit"), dependencyNode("integration")],
      steelThreadCandidateNodeIds: ["unit"],
      parallelShardRefs: ["shard://unit", "shard://integration"],
      cycleRefs: []
    }
  });

  assert.equal(selection.selectedMethod, "parallel");
  assert.deepEqual(selection.selectedNodeIds, ["integration", "unit"]);
  assert.deepEqual(selection.parallelGroupRefs, [
    "shard://integration",
    "shard://unit"
  ]);
});

test("T-172 blocks dependency traversal when the admitted map carries cycles", () => {
  const selection = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://t172/blocked",
    dependencyMap: {
      kind: "sdlc_module_dependency_map",
      mapRef: "dependency-map://t172/cycle",
      summaryRef: "decomposition-summary://t172/cycle",
      nodes: [dependencyNode("a", ["b"]), dependencyNode("b", ["a"])],
      steelThreadCandidateNodeIds: ["a"],
      parallelPartitionRefs: ["partition://a", "partition://b"],
      cycleRefs: ["cycle://a-b"]
    }
  });

  assert.equal(selection.selectedMethod, "blocked");
  assert.deepEqual(selection.selectedNodeIds, []);
  assert.deepEqual(selection.blockingReasons, ["dependency_cycle:cycle://a-b"]);
});
