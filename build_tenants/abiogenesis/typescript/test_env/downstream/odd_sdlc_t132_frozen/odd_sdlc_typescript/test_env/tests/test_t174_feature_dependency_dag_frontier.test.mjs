// Validates: T-174
// Proves that odd_sdlc, not the test harness, derives the feature dependency
// DAG and publishes it to ABG's event-sourced saga frontier.

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  compileSdlcFeatureDependencyDagToAbgFrontier,
  constructSdlcLiveFpParallelMaterializationFrontier,
  deriveSdlcFeatureDependencyDagFromMaps,
  deriveSdlcLiveFpParallelMaterializationBranchOverrides,
  deriveSdlcStagedConstructionAuditCarriers,
  deriveSdlcTestDependencyMapFromImplementationDependencyMap,
  deriveSdlcUatTestDependencyMapFromTestDependencyMap,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  isSdlcLiveFpParallelMaterializationFrontier,
  materializeSdlcProjectConformance,
  normalizeSdlcLiveFpParallelMaterializationTarget,
  resolveSdlcLiveFpParallelBatchSize,
  selectSdlcDependencyMapTraversal,
  sdlcLiveParallelMaterializationTargetKey,
  typecheckCurrentSdlcGtlProgram,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";
import {
  constructBranchExecutionPolicy,
  deriveDependencyFrontierProjection,
  runEventedNativeSagaFrontier,
  selectDisjointReadyBranches
} from "@abiogenesis/typescript-tenant/abg/m03";

const EMPTY_ATTRS = Object.freeze({ entries: Object.freeze([]) });
const EMPTY_GRAPH = Object.freeze({
  name: "t174_feature_dependency_dag",
  inputs: Object.freeze([]),
  outputs: Object.freeze([]),
  nodes: Object.freeze([]),
  vectors: Object.freeze([]),
  contexts: Object.freeze([]),
  rules: Object.freeze([]),
  effects: Object.freeze([]),
  tags: Object.freeze([]),
  id: "graph://odd-sdlc/t174/feature-dependency-dag"
});

function designDepthGtlSelectedComposition() {
  const resultInterface = typecheckCurrentSdlcGtlProgram()
    .pluginResultInterfaceCatalog.interfaces.find(
      (contract) =>
        contract.compositionRef ===
          "abg.fn_composition://odd-sdlc/derive_implementation_design_surface" &&
        contract.stageRole === "evaluate" &&
        contract.computeMeans === "F_P" &&
        contract.outputCarrierRefs.includes("SdlcDesignDepthRegister")
    );
  assert.ok(resultInterface, "admitted design-depth GTL result interface exists");
  return {
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: resultInterface.compositionRef,
    compositionDigest: resultInterface.compositionDigest,
    resultInterfaceRef: resultInterface.resultInterfaceRef,
    resultEnvelopeContractRef: resultInterface.resultEnvelopeContractRef,
    resultInterfaceContractDigest:
      resultInterface.resultInterfaceContractDigest,
    compositionSelectionRef:
      "abg.fn_composition_selection://odd-sdlc/derive_implementation_design_surface/t174",
    selectedRegimeBindingRef:
      "abg.fn_composition.regime_binding://odd-sdlc/derive_implementation_design_surface/evaluate/F_P",
    graphFunctionRef: "derive_implementation_design_surface",
    graphVectorRef: "derive_implementation_design_surface",
    basisRef: "basis://t174/implementation-design"
  };
}

function executionBasis() {
  return Object.freeze({
    id: "basis://odd-sdlc/t174/feature-dependency-dag",
    workspaceRoot: "/workspace/t174-feature-dependency-dag",
    moduleName: "odd_sdlc_t174_feature_dependency_dag",
    graphFunction: Object.freeze({
      name: "t174_feature_dependency_dag_frontier",
      environment: Object.freeze({
        requires: Object.freeze([]),
        provides: Object.freeze([]),
        carries: Object.freeze([])
      }),
      inputs: Object.freeze([]),
      outputs: Object.freeze([]),
      template: Object.freeze({
        kind: "symbolic",
        ref: "graph://odd-sdlc/t174/feature-dependency-dag",
        graph: null,
        version: null
      }),
      effects: Object.freeze([]),
      declarations: EMPTY_ATTRS,
      tags: Object.freeze([]),
      id: "graph-function://odd-sdlc/t174/feature-dependency-dag"
    }),
    graph: EMPTY_GRAPH,
    job: Object.freeze({
      name: "t174_feature_dependency_dag_job",
      contracts: Object.freeze([]),
      roles: Object.freeze([]),
      tags: Object.freeze([]),
      policyHooks: EMPTY_ATTRS,
      id: "job://odd-sdlc/t174/feature-dependency-dag"
    }),
    modulePolicyHooks: EMPTY_ATTRS,
    runtimeIdentity: Object.freeze({
      workerId: "worker://synthetic",
      backendId: "backend://node-test",
      buildId: "build://odd-sdlc/t174",
      resolvedRuntimeRef: "runtime://abiogenesis/saga-frontier"
    }),
    resolvedPolicy: Object.freeze({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t174/feature-dependency-dag",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    startIntent: Object.freeze({
      target: Object.freeze({
        handle: "t174_feature_dependency_dag_frontier"
      }),
      scope: Object.freeze({
        workspaceRoot: "/workspace/t174-feature-dependency-dag"
      })
    }),
    runId: "run://odd-sdlc/t174/feature-dependency-dag",
    workKey: "work://odd-sdlc/t174/feature-dependency-dag",
    frameId: "frame://odd-sdlc/t174/feature-dependency-dag",
    frameLineageId: "lineage://odd-sdlc/t174/feature-dependency-dag"
  });
}

function moduleMap(nodes) {
  return Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t174/modules",
    summaryRef: "decomposition-summary://odd-sdlc/t174/modules",
    nodes: Object.freeze(nodes),
    steelThreadCandidateNodeIds: Object.freeze(["module://dev/hello"]),
    parallelPartitionRefs: Object.freeze([
      "partition://t174/dev-hello",
      "partition://t174/dev-world"
    ]),
    cycleRefs: Object.freeze([])
  });
}

function testMap() {
  return Object.freeze({
    kind: "sdlc_test_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t174/tests",
    summaryRef: "decomposition-summary://odd-sdlc/t174/tests",
    nodes: Object.freeze([
      Object.freeze({
        nodeId: "test://hello",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["TESTCASE-T174-HELLO"]),
        materializationTargetRefs: Object.freeze(["test/hello.test.js"])
      }),
      Object.freeze({
        nodeId: "test://world",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["TESTCASE-T174-WORLD"]),
        materializationTargetRefs: Object.freeze(["test/world.test.js"])
      })
    ]),
    steelThreadCandidateNodeIds: Object.freeze(["test://hello"]),
    parallelShardRefs: Object.freeze([
      "shard://t174/test-hello",
      "shard://t174/test-world"
    ]),
    cycleRefs: Object.freeze([])
  });
}

function fourLaneModuleMap() {
  return moduleMap([
    Object.freeze({
      nodeId: "module://dev/hello",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze([]),
      ownedRequirementRefs: Object.freeze(["REQ-T174-HELLO"]),
      materializationTargetRefs: Object.freeze(["src/hello.js"])
    }),
    Object.freeze({
      nodeId: "module://dev/world",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze([]),
      ownedRequirementRefs: Object.freeze(["REQ-T174-WORLD"]),
      materializationTargetRefs: Object.freeze(["src/world.js"])
    })
  ]);
}

function rootedHelloWorldImplementationMap() {
  return Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t174/live-rooted/modules",
    summaryRef: "decomposition-summary://odd-sdlc/t174/live-rooted",
    nodes: Object.freeze([
      Object.freeze({
        nodeId: "module://package-metadata",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-001"]),
        materializationTargetRefs: Object.freeze([
          "build_tenants/parallel_hello_world/package.json"
        ])
      }),
      Object.freeze({
        nodeId: "module://hello-branch",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://composition-export"]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-002"]),
        materializationTargetRefs: Object.freeze([
          "build_tenants/parallel_hello_world/src/hello.js"
        ])
      }),
      Object.freeze({
        nodeId: "module://world-branch",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://composition-export"]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-003"]),
        materializationTargetRefs: Object.freeze([
          "build_tenants/parallel_hello_world/src/world.js"
        ])
      }),
      Object.freeze({
        nodeId: "module://composition-export",
        predecessorNodeIds: Object.freeze([
          "module://hello-branch",
          "module://world-branch"
        ]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-004"]),
        materializationTargetRefs: Object.freeze([
          "build_tenants/parallel_hello_world/src/index.js"
        ])
      }),
      Object.freeze({
        nodeId: "module://hello-branch-test",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-005"]),
        materializationTargetRefs: Object.freeze([
          "build_tenants/parallel_hello_world/test/hello.test.js"
        ])
      }),
      Object.freeze({
        nodeId: "module://world-branch-test",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-PARALLEL-HELLO-006"]),
        materializationTargetRefs: Object.freeze([
          "build_tenants/parallel_hello_world/test/world.test.js"
        ])
      })
    ]),
    steelThreadCandidateNodeIds: Object.freeze(["module://hello-branch"]),
    parallelPartitionRefs: Object.freeze([
      "partition://module/hello-branch",
      "partition://module/world-branch",
      "partition://module/hello-branch-test",
      "partition://module/world-branch-test"
    ]),
    cycleRefs: Object.freeze([])
  });
}

function liveRootedDevMap() {
  const source = rootedHelloWorldImplementationMap();
  const selectedNodes = source.nodes.filter((node) =>
    node.materializationTargetRefs.some((targetRef) => {
      const normalized = normalizeSdlcLiveFpParallelMaterializationTarget({
        targetRef,
        selectedOutputRoot: "build_tenants/parallel_hello_world",
        tenantRoot: "build_tenants/parallel_hello_world"
      });
      return /^src\//u.test(normalized) && !/\/index\.[cm]?[jt]sx?$/u.test(normalized);
    })
  );
  const selectedIds = new Set(selectedNodes.map((node) => node.nodeId));
  const sourceIds = new Set(source.nodes.map((node) => node.nodeId));
  const preserveSelectedOrMalformed = (nodeId) =>
    selectedIds.has(nodeId) || !sourceIds.has(nodeId);
  return Object.freeze({
    ...source,
    nodes: Object.freeze(
      selectedNodes.map((node) =>
        Object.freeze({
          ...node,
          predecessorNodeIds: Object.freeze(
            node.predecessorNodeIds.filter(preserveSelectedOrMalformed)
          ),
          successorNodeIds: Object.freeze(
            node.successorNodeIds.filter(preserveSelectedOrMalformed)
          )
        })
      )
    )
  });
}

function targetRefsForDagNode(node) {
  return node.targetAssetRefs.length > 0
    ? node.targetAssetRefs
    : node.outputAllocationRefs.map((ref) => ref.replace(/^artifact:\/\//u, ""));
}

function branchRowsForSyntheticLiveFrontier({ dag, compilation }) {
  return dag.nodes.flatMap((node, index) => {
    if (node.nodeKind === "fan_in") return [];
    const branchRef = compilation.branchRefs[index];
    assert(branchRef);
    return [
      Object.freeze({
        branchRef: branchRef.branchRef,
        branchKey: branchRef.branchKey,
        nodeId: node.nodeRef,
        laneKind:
          node.nodeKind === "test_materialization" ||
          node.nodeKind === "uat_test_materialization"
            ? "test"
            : "dev",
        workerProcessRef: `abg-native-branch-task://odd-sdlc/t174/${branchRef.branchKey}`,
        materializationTargetRefs: targetRefsForDagNode(node),
        readRefs: node.readRefs,
        writeTerritoryRefs: node.writeTerritoryRefs,
        outputAllocationRefs: node.outputAllocationRefs
      })
    ];
  });
}

function fanInRowsForSyntheticLiveFrontier({ dag, compilation }) {
  const branchByNodeRef = new Map(
    dag.nodes.flatMap((node, index) => {
      const branchRef = compilation.branchRefs[index];
      return branchRef === undefined ? [] : [[node.nodeRef, branchRef]];
    })
  );
  return dag.nodes.flatMap((node) => {
    if (node.nodeKind !== "fan_in") return [];
    const branchRef = branchByNodeRef.get(node.nodeRef);
    assert(branchRef);
    const declaration = compilation.declarations.find(
      (candidate) => candidate.branchRef.branchRef === branchRef.branchRef
    );
    return [
      Object.freeze({
        branchRef: branchRef.branchRef,
        nodeId: node.nodeRef,
        predecessorBranchRefs: declaration?.parentBranchRefs ?? Object.freeze([]),
        materializationTargetRefs: targetRefsForDagNode(node),
        payloadDigest: "payload://odd-sdlc/live/derive-component-code-surface/fan-in"
      })
    ];
  });
}

function countedTask(branchRef, payloadDigest, counters) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef,
    run: async () => {
      counters.active += 1;
      counters.maxActive = Math.max(counters.maxActive, counters.active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      counters.active -= 1;
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef,
        payloadDigest,
        evidenceRefs: Object.freeze([`evidence://${payloadDigest.slice("payload://".length)}`])
      });
    }
  });
}

function assertNoWorkerSystemJsonLeak(label, content) {
  const forbidden = [
    /"kind"\s*:\s*"sdlc_worker_handoff_manifest"/u,
    /"kind"\s*:\s*"sdlc_worker_invocation_package"/u,
    /"kind"\s*:\s*"sdlc_worker_construction_brief"/u,
    /"kind"\s*:\s*"sdlc_handoff_replay_index"/u,
    /"kind"\s*:\s*"sdlc_live_fp_parallel_materialization_frontier"/u,
    /"graphTruthSource"\s*:/u,
    /sdlc_live_fp_parallel_materialization_frontier\.json/u,
    /\.ai-workspace\/runtime\/odd_sdlc\/operator-runs\/[0-9]{8}T/u,
    /test_env\/test_runs\//u,
    /\/Users\/jim\/src\/apps\//u
  ];
  for (const pattern of forbidden) {
    assert.doesNotMatch(content, pattern, `${label} leaked ${pattern}`);
  }
}

function writeT174SyntheticWorkspace(root) {
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants/parallel_hello_world/spec"), {
    recursive: true
  });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t174_parallel_hello_world_js",
      "  kind: imported_workspace",
      "active_tenant: parallel_hello_world",
      "selected_output_root: build_tenants/parallel_hello_world",
      "runtime:",
      "  root: .ai-workspace/runtime/odd_sdlc",
      "  transform_asset_root: .ai-workspace/runtime/odd_sdlc/assets",
      "  operator_run_root: .ai-workspace/runtime/odd_sdlc/operator-runs",
      "  product_materialization_root_policy: selected_output_root",
      "build_tenants:",
      "  parallel_hello_world:",
      "    output_dir: build_tenants/parallel_hello_world",
      "    language: JavaScript",
      "    build_tool: node",
      "    test_runner: node",
      "    test_execution_contract: node --test test/hello.test.js test/world.test.js",
      "    capability_contracts:",
      "      trivial_product: false",
      "      parallel_frontier_probe: true",
      "    module_structure:",
      "      - hello_branch",
      "      - world_branch",
      "      - hello_branch_test",
      "      - world_branch_test",
      "      - composition"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "bootstrap.md"),
    [
      "# T-174 Parallel Hello-World Bootstrap",
      "",
      "REQ-T174-PARALLEL-HELLO-001: provide package metadata.",
      "REQ-T174-PARALLEL-HELLO-002: hello branch returns hello.",
      "REQ-T174-PARALLEL-HELLO-003: world branch returns world.",
      "REQ-T174-PARALLEL-HELLO-004: composition returns hello world.",
      "REQ-T174-PARALLEL-HELLO-005: hello branch test verifies hello.",
      "REQ-T174-PARALLEL-HELLO-006: world branch test verifies world.",
      "REQ-T174-PARALLEL-HELLO-007: execution proof runs branch tests."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/parallel_hello_world/spec/TECH_STACK.json"),
    JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "JavaScript",
        runtime: { name: "Node.js", moduleSystem: "esm" },
        buildTool: "node",
        packageManager: "npm",
        testingTechStack: {
          testRunner: "node",
          testCommand: "node --test test/hello.test.js test/world.test.js"
        },
        dependencyPolicy: "no_external_runtime_packages"
      },
      null,
      2
    ),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  const adrPath = path.join(
    root,
    "build_tenants/parallel_hello_world/design/adrs/ADR-002-implementation-design-surface.md"
  );
  mkdirSync(path.dirname(adrPath), { recursive: true });
  writeFileSync(
    adrPath,
    [
      "# ADR-002: Parallel Hello World Implementation Design Surface",
      "",
      "## Module Boundary",
      "",
      "| Component | Kind | Product target | Owns | Depends on |",
      "| --- | --- | --- | --- | --- |",
      "| `package_metadata` | build config | `package.json` | Package identity. | None |",
      "| `hello_branch` | source | `src/hello.js` | `hello()` returns `hello`. | None |",
      "| `world_branch` | source | `src/world.js` | `world()` returns `world`. | None |",
      "| `composition_export` | source | `src/index.js` | Export `helloWorld()`. | `hello_branch`; `world_branch` |",
      "| `hello_branch_test` | test | `test/hello.test.js` | Assert hello. | `hello_branch` |",
      "| `world_branch_test` | test | `test/world.test.js` | Assert world. | `world_branch` |",
      "",
      "## Product File Targets",
      "",
      "| Role | Path | Owning component | Implementation note |",
      "| --- | --- | --- | --- |",
      "| build_config | `build_tenants/parallel_hello_world/package.json` | `package_metadata` | Package metadata. |",
      "| source | `build_tenants/parallel_hello_world/src/hello.js` | `hello_branch` | Hello branch. |",
      "| source | `build_tenants/parallel_hello_world/src/world.js` | `world_branch` | World branch. |",
      "| source | `build_tenants/parallel_hello_world/src/index.js` | `composition_export` | Fan-in and direct entry. |",
      "| test | `build_tenants/parallel_hello_world/test/hello.test.js` | `hello_branch_test` | Hello test. |",
      "| test | `build_tenants/parallel_hello_world/test/world.test.js` | `world_branch_test` | World test. |",
      "",
      "## Requirement Lineage",
      "",
      "| Obligation | Owning component | Downstream target | Source refs |",
      "| --- | --- | --- | --- |",
      "| `REQ-T174-PARALLEL-HELLO-001` | `package_metadata` | `package.json` | bootstrap |",
      "| `REQ-T174-PARALLEL-HELLO-002` | `hello_branch` | `src/hello.js` | bootstrap |",
      "| `REQ-T174-PARALLEL-HELLO-003` | `world_branch` | `src/world.js` | bootstrap |",
      "| `REQ-T174-PARALLEL-HELLO-004` | `composition_export` | `src/index.js` | bootstrap |",
      "| `REQ-T174-PARALLEL-HELLO-005` | `hello_branch_test` | `test/hello.test.js` | bootstrap |",
      "| `REQ-T174-PARALLEL-HELLO-006` | `world_branch_test` | `test/world.test.js` | bootstrap |"
    ].join("\n"),
    "utf8"
  );
}

function writeT174AdmittedImplementationDesignArchive(root, manifest) {
  const archiveRoot = path.join(
    root,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/20260523T000000000Z_pid174"
  );
  mkdirSync(archiveRoot, { recursive: true });
  const designOutputFile = path.join(
    root,
    "build_tenants/parallel_hello_world/design/implementation_design_surface.md"
  );
  const registerPath = path.join(archiveRoot, "design_depth_fp_evaluator_register.json");
  const contentRegisterPath = path.join(
    archiveRoot,
    "design_depth_fp_evaluator_content_register.json"
  );
  const ruleOutcomePath = path.join(
    archiveRoot,
    "design_depth_fp_evaluator_rule_outcome.json"
  );
  const registerRef = pathToFileURL(registerPath).href;
  const contentRegisterRef = pathToFileURL(contentRegisterPath).href;
  const ruleOutcomeRef = pathToFileURL(ruleOutcomePath).href;
  const composition = designDepthGtlSelectedComposition();
  const componentRows = [
    {
      componentId: "package_metadata",
      moduleName: "package_metadata",
      relativePath: "build_tenants/parallel_hello_world/package.json",
      concernRole: "other",
      targetRole: "source",
      requirementIds: ["REQ-T174-PARALLEL-HELLO-001"]
    },
    {
      componentId: "hello_branch",
      moduleName: "hello_branch",
      relativePath: "build_tenants/parallel_hello_world/src/hello.js",
      concernRole: "other",
      targetRole: "source",
      requirementIds: ["REQ-T174-PARALLEL-HELLO-002"]
    },
    {
      componentId: "world_branch",
      moduleName: "world_branch",
      relativePath: "build_tenants/parallel_hello_world/src/world.js",
      concernRole: "other",
      targetRole: "source",
      requirementIds: ["REQ-T174-PARALLEL-HELLO-003"]
    },
    {
      componentId: "composition_export",
      moduleName: "composition",
      relativePath: "build_tenants/parallel_hello_world/src/index.js",
      concernRole: "other",
      targetRole: "source",
      requirementIds: ["REQ-T174-PARALLEL-HELLO-004"]
    },
    {
      componentId: "hello_branch_test",
      moduleName: "hello_branch_test",
      relativePath: "build_tenants/parallel_hello_world/test/hello.test.js",
      concernRole: "validator",
      targetRole: "source",
      requirementIds: ["REQ-T174-PARALLEL-HELLO-005"]
    },
    {
      componentId: "world_branch_test",
      moduleName: "world_branch_test",
      relativePath: "build_tenants/parallel_hello_world/test/world.test.js",
      concernRole: "validator",
      targetRole: "source",
      requirementIds: ["REQ-T174-PARALLEL-HELLO-006"]
    }
  ];
  const topologyRows = componentRows.map((row) => ({
    kind: "sdlc_component_topology_row",
    componentId: row.componentId,
    moduleName: row.moduleName,
    relativePath: row.relativePath,
    concernRole: row.concernRole,
    requirementIds: row.requirementIds,
    publicBoundary: `${row.componentId} accepted F_P design-depth boundary`,
    sourceAssetRefs: [registerRef]
  }));
  const realizationRows = topologyRows.map((row) => ({
    kind: "sdlc_component_realization_row",
    componentId: row.componentId,
    moduleName: row.moduleName,
    relativePath: row.relativePath,
    publicBoundary: row.publicBoundary,
    trancheId: null,
    firstProductFileToChange: row.relativePath,
    upstreamComponentIds:
      row.componentId === "composition_export"
        ? ["hello_branch", "world_branch"]
        : [],
    requirementIds: row.requirementIds,
    sourceAssetRefs: [registerRef]
  }));
  writeFileSync(
    path.join(archiveRoot, "handoff_manifest.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_worker_handoff_manifest",
        contractVersion: "synthetic-v1",
        workspaceRoot: root,
        archiveRoot,
        graphFunctionName: "derive_implementation_design_surface",
        edgeName: "derive_implementation_design_surface",
        vectorIndex: 0,
        inputAssetTypes: ["scenario_surface"],
        targetAssetType: "implementation_design_surface",
        outputFile: designOutputFile,
        reportFile: path.join(archiveRoot, "worker_result_report.json"),
        productMaterialization: {
          tenantRoot: manifest.productMaterialization.tenantRoot
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    contentRegisterPath,
    `${JSON.stringify(
      {
        kind: "sdlc_evaluate_content_register",
        registerVersion: "ts-evaluate-content-register-v1",
        stage: "evaluate.C",
        ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
        ruleRole: "semantic_judgment",
        computeMeans: "F_P",
        authorityFunction: "synthesize_model",
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
        compositionContributionRef: composition.selectedRegimeBindingRef,
        sourceBasisRefs: [pathToFileURL(designOutputFile).href],
        candidateArtifactRefs: [pathToFileURL(designOutputFile).href],
        evidenceRefs: [pathToFileURL(designOutputFile).href],
        contentRows: [
          {
            kind: "sdlc_evaluate_content_register_row",
            rowRef: "evaluate-content-row://t174/design-depth-register",
            authorityFunction: "synthesize_model",
            carrierFamily: "ProductAssetModel",
            contentKind: "sdlc_design_depth_register",
            payload: {
              kind: "sdlc_design_depth_register",
              registerVersion: "ts-design-depth-v1",
              targetAssetType: "implementation_design_surface",
              stackProfileRows: [],
              implementationModuleRows: [],
              aggregateDomainModelRows: [],
              moduleSchemaFragments: [],
              moduleStateDiagramFragments: [],
              aggregateDomainModel: null,
              sunnyDaySequenceRows: [],
              aggregateSunnyDaySequence: null,
              componentTopologyRows: topologyRows,
              componentRealizationRows: realizationRows,
              fileTargetRows: componentRows.map((row) => ({
                kind: "sdlc_file_target_row",
                relativePath: row.relativePath,
                role: row.targetRole
              })),
              designCompletenessVerdict: null
            },
            sourceBasisRefs: [pathToFileURL(designOutputFile).href],
            evidenceRefs: [pathToFileURL(designOutputFile).href]
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    registerPath,
    `${JSON.stringify(
      {
        kind: "sdlc_design_depth_register",
        registerVersion: "ts-design-depth-v1",
        targetAssetType: "implementation_design_surface",
        stackProfileRows: [
          {
            kind: "sdlc_stack_profile_row",
            stackRef: "stack://t174/node-esm",
            language: "javascript",
            buildTool: "node"
          }
        ],
        implementationModuleRows: [
          "package_metadata",
          "hello_branch",
          "world_branch",
          "composition",
          "hello_branch_test",
          "world_branch_test"
        ].map((moduleName) => ({
          kind: "sdlc_implementation_module_row",
          moduleName,
          moduleRef: `module://t174/${moduleName}`
        })),
        aggregateDomainModelRows: [],
        moduleSchemaFragments: [],
        moduleStateDiagramFragments: [],
        aggregateDomainModel: null,
        sunnyDaySequenceRows: [],
        aggregateSunnyDaySequence: null,
        componentTopologyRows: topologyRows,
        componentRealizationRows: realizationRows,
        fileTargetRows: componentRows.map((row) => ({
          kind: "sdlc_file_target_row",
          relativePath: row.relativePath,
          role: row.targetRole
        })),
        designCompletenessVerdict: null
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "fp_evaluate_result.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_fp_evaluate_result",
        stage: "F_P.evaluate",
        computeNotationStage: "evaluate.C",
        stageAuthority: "typed_fp_stage_carriers",
        selectedComposition: composition,
        compositionRef: composition.compositionRef,
        compositionDigest: composition.compositionDigest,
        compositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
        evaluationRef: "evaluation://t174/implementation-design",
        findings: [
          {
            findingRef: "finding://t174/implementation-design/depth-register",
            compositionRef: composition.compositionRef,
            compositionDigest: composition.compositionDigest,
            authorityRefs: [contentRegisterRef, registerRef],
            evidenceRefs: [contentRegisterRef, registerRef]
          }
        ],
        evaluation: {
          evaluationRef: "evaluation://t174/implementation-design",
          status: "passed",
          findingRefs: ["finding://t174/implementation-design/depth-register"]
        },
        status: "passed",
        postflightStatus: "passed",
        blockingReasons: [],
        evidenceRefs: [ruleOutcomeRef, contentRegisterRef, registerRef]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    ruleOutcomePath,
    `${JSON.stringify(
      {
        kind: "evaluation_rule_outcome",
        status: "accepted",
        ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
        ruleRole: "semantic_judgment",
        computeMeans: "F_P",
        producedRegisterRefs: [contentRegisterRef, registerRef],
        evidenceRefs: [contentRegisterRef, registerRef],
        findingRefs: ["finding://t174/implementation-design/depth-register"],
        humanResponseRefs: [],
        residualPressureRefs: [],
        continuationRefs: [],
        diagnosticRefs: [],
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
        compositionContributionRef: composition.selectedRegimeBindingRef,
        reason: null
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const envelopeRef = "plugin-result-envelope:t174:implementation-design";
  writeFileSync(
    path.join(archiveRoot, "runtime_events.json"),
    `${JSON.stringify(
      [
        {
          kind: "payload_observed",
          payloadClass: "admitted_plugin_result_envelope",
          payloadRef: envelopeRef,
          authorityRef: composition.resultInterfaceRef,
          contractRef: composition.resultEnvelopeContractRef
        },
        {
          kind: "payload_validated",
          payloadRef: envelopeRef,
          contractRef: composition.resultEnvelopeContractRef,
          contractDigest: composition.resultInterfaceContractDigest
        },
        {
          kind: "evidence_admitted",
          payloadRef: envelopeRef,
          evidenceRef: contentRegisterRef
        },
        {
          kind: "evidence_admitted",
          payloadRef: envelopeRef,
          evidenceRef: registerRef
        },
        {
          kind: "evidence_admitted",
          payloadRef: envelopeRef,
          evidenceRef: ruleOutcomeRef
        }
      ],
      null,
      2
    )}\n`,
    "utf8"
  );
  return archiveRoot;
}

function compileFourLaneDag() {
  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/t174/four-lane",
    graphFunctionName: "t174_feature_dependency_dag_frontier",
    moduleDependencyMap: fourLaneModuleMap(),
    testDependencyMap: testMap(),
    traversalSelectionRef: "selection://odd-sdlc/t174/four-lane",
    fanInTargetRefs: Object.freeze(["reports/t174-four-lane-result.json"])
  });
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: "frontier://odd-sdlc/t174/four-lane",
    graphCallId: "graph-call://odd-sdlc/t174/four-lane",
    frameId: "frame://odd-sdlc/t174/four-lane",
    basisId: "basis://odd-sdlc/t174/feature-dependency-dag",
    graphFunctionId: "graph-function://odd-sdlc/t174/feature-dependency-dag",
    frameLineageId: "lineage://odd-sdlc/t174/feature-dependency-dag",
    frameAttemptId: "attempt://odd-sdlc/t174/0"
  });
  return { dag, compilation };
}

function task(branchRef, payloadDigest) {
  return Object.freeze({
    kind: "native_branch_task",
    branchRef,
    run: async () =>
      Object.freeze({
        kind: "native_branch_task_result",
        branchRef,
        payloadDigest,
        evidenceRefs: Object.freeze([`evidence://${payloadDigest.slice("payload://".length)}`])
      })
  });
}

test("T-174 compiles module and test dependency maps into SDLC DAG start_nodes", () => {
  const { dag, compilation } = compileFourLaneDag();

  assert.equal(dag.kind, "sdlc_feature_dependency_dag");
  assert.equal(dag.blockingReasons.length, 0);
  assert.equal(dag.startNodes.length, 4);
  assert.equal(dag.fanInNodeRefs.length, 1);
  assert.equal(dag.sourceDependencyMapRefs.length, 2);

  const fanInNode = dag.nodes.find((node) => node.nodeKind === "fan_in");
  assert.ok(fanInNode);
  assert.equal(fanInNode.predecessorNodeRefs.length, 4);
  assert.deepEqual(fanInNode.readRefs, [
    "artifact://src/hello.js",
    "artifact://src/world.js",
    "artifact://test/hello.test.js",
    "artifact://test/world.test.js"
  ]);

  const rootDeclarations = compilation.declarations.filter(
    (declaration) => declaration.parentBranchRefs.length === 0
  );
  assert.equal(rootDeclarations.length, 4);
  assert.equal(compilation.readyBranchRefs.length, 4);
  assert.equal(compilation.fanInBranchRefs.length, 1);
  assert.deepEqual(compilation.writeTerritoryConflictRefs, []);
  assert.deepEqual(compilation.outputAllocationConflictRefs, []);
  assert.ok(
    rootDeclarations.every(
      (declaration) =>
        declaration.writeTerritoryRefs.length === 1 &&
        declaration.outputAllocationRefs.length === 1 &&
        declaration.idempotencyKey !== null
    )
  );
});

test("T-174 ABG frontier runner consumes compiled SDLC DAG without harness branch ordering", async () => {
  const { compilation } = compileFourLaneDag();
  const policy = constructBranchExecutionPolicy({
    policyRef: "policy://odd-sdlc/t174/four-lane/max-four",
    maxConcurrency: 4,
    maxRetryAttempts: 0,
    leaseTtlMs: 10_000,
    resolvedSystemPolicyRefs: Object.freeze([
      "abg://abiogenesis/event-sourced-saga-frontier",
      compilation.frontierRef
    ])
  });
  const emittedEvents = [];
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: compilation.frontierRef,
    declarations: compilation.declarations,
    policy,
    tasks: compilation.declarations.map((declaration) =>
      task(
        declaration.branchRef.branchRef,
        `payload://${declaration.branchRef.branchKey}`
      )
    ),
    eventSink: (event) => emittedEvents.push(event),
    maxBatches: 3,
    correlationId: "correlation://odd-sdlc/t174/four-lane"
  });

  assert.equal(run.kind, "evented_native_saga_frontier_run_result");
  assert.equal(run.batchCount, 2);
  assert.equal(run.batches[0].selection.selectedBranchRefs.length, 4);
  assert.deepEqual(
    [...run.batches[0].selection.selectedBranchRefs].sort(),
    [...compilation.readyBranchRefs].sort()
  );
  assert.deepEqual(run.batches[1].selection.selectedBranchRefs, [
    compilation.fanInBranchRefs[0]
  ]);
  assert.equal(run.completedBranchRefs.length, 5);
  assert.deepEqual(run.failedBranchRefs, []);
  assert.equal(emittedEvents.length, run.emittedEvents.length);
  assert.equal(
    run.emittedEvents.filter((event) => event.kind === "branch_lease_acquired")
      .length,
    5
  );
  assert.ok(
    run.emittedEvents.some((event) => event.kind === "branch_fan_in_projected")
  );
});

test("T-203 unit and UAT dependency maps derive from source-only module definitions", () => {
  const testDependencyMap =
    deriveSdlcTestDependencyMapFromImplementationDependencyMap({
      moduleDependencyMap: liveRootedDevMap()
    });
  assert(testDependencyMap);
  assert.deepEqual(
    testDependencyMap.nodes.map((node) => node.materializationTargetRefs[0]).sort(),
    [
      "build_tenants/parallel_hello_world/test/hello.test.js",
      "build_tenants/parallel_hello_world/test/world.test.js"
    ]
  );
  const uatTestDependencyMap =
    deriveSdlcUatTestDependencyMapFromTestDependencyMap({
      testDependencyMap
    });
  assert(uatTestDependencyMap);
  assert.deepEqual(
    uatTestDependencyMap.nodes
      .map((node) => node.materializationTargetRefs[0])
      .sort(),
    [
      "build_tenants/parallel_hello_world/test/uat/hello.uat.test.js",
      "build_tenants/parallel_hello_world/test/uat/world.uat.test.js"
    ]
  );

  const jvmSourceDirectory = ["sc", "ala"].join("");
  const jvmModuleMap = moduleMap([
    Object.freeze({
      nodeId: "module://core",
      predecessorNodeIds: Object.freeze([]),
      successorNodeIds: Object.freeze([]),
      ownedRequirementRefs: Object.freeze(["REQ-T203-CORE"]),
      materializationTargetRefs: Object.freeze([
        `build_tenants/example/core/src/main/${jvmSourceDirectory}`
      ])
    })
  ]);
  const jvmTestDependencyMap =
    deriveSdlcTestDependencyMapFromImplementationDependencyMap({
      moduleDependencyMap: jvmModuleMap
    });
  assert(jvmTestDependencyMap);
  assert.deepEqual(
    jvmTestDependencyMap.nodes.map((node) => node.materializationTargetRefs[0]),
    [
      `build_tenants/example/core/src/test/${jvmSourceDirectory}/CoreSpec.${jvmSourceDirectory}`
    ]
  );
  const jvmUatTestDependencyMap =
    deriveSdlcUatTestDependencyMapFromTestDependencyMap({
      testDependencyMap: jvmTestDependencyMap
    });
  assert(jvmUatTestDependencyMap);
  assert.deepEqual(
    jvmUatTestDependencyMap.nodes.map((node) => node.materializationTargetRefs[0]),
    [
      `build_tenants/example/core/src/test/${jvmSourceDirectory}/uat/CoreSpecUatSpec.${jvmSourceDirectory}`
    ]
  );
});

test("T-174 synthetic hello-world multilane proof derives live frontier artifact shape", async () => {
  const implementationMap = rootedHelloWorldImplementationMap();
  const testDependencyMap =
    deriveSdlcTestDependencyMapFromImplementationDependencyMap({
      moduleDependencyMap: implementationMap
    });
  assert(testDependencyMap);
  assert.deepEqual(
    testDependencyMap.nodes.map((node) => node.materializationTargetRefs[0]).sort(),
    [
      "build_tenants/parallel_hello_world/test/hello.test.js",
      "build_tenants/parallel_hello_world/test/world.test.js"
    ]
  );
  const uatTestDependencyMap =
    deriveSdlcUatTestDependencyMapFromTestDependencyMap({
      testDependencyMap
    });
  assert(uatTestDependencyMap);
  assert.deepEqual(
    uatTestDependencyMap.nodes
      .map((node) => node.materializationTargetRefs[0])
      .sort(),
    [
      "build_tenants/parallel_hello_world/test/uat/hello.uat.test.js",
      "build_tenants/parallel_hello_world/test/uat/world.uat.test.js"
    ]
  );
  const moduleTraversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t174/live-rooted/modules",
    dependencyMap: liveRootedDevMap(),
    policy: "parallel_when_partitioned"
  });
  const testTraversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t174/live-rooted/tests",
    dependencyMap: testDependencyMap,
    policy: "parallel_when_partitioned"
  });
  const uatTestTraversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t174/live-rooted/uat-tests",
    dependencyMap: uatTestDependencyMap,
    policy: "parallel_when_partitioned"
  });
  assert.equal(moduleTraversal.selectedMethod, "parallel");
  assert.equal(testTraversal.selectedMethod, "parallel");
  assert.equal(uatTestTraversal.selectedMethod, "parallel");

  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/live/derive-component-code-surface/parallel-materialization",
    graphFunctionName: "derive_component_code_surface",
    moduleDependencyMap: liveRootedDevMap(),
    testDependencyMap,
    uatTestDependencyMap,
    traversalSelectionRef: moduleTraversal.selectionRef,
    fanInTargetRefs: Object.freeze([
      "build_tenants/parallel_hello_world/src/index.js"
    ]),
    evidenceRefs: Object.freeze([
      implementationMap.mapRef,
      testDependencyMap.mapRef,
      uatTestDependencyMap.mapRef,
      moduleTraversal.selectionRef,
      testTraversal.selectionRef,
      uatTestTraversal.selectionRef
    ])
  });
  const branchOverrides =
    deriveSdlcLiveFpParallelMaterializationBranchOverrides({
      edgeName: "derive_component_code_surface",
      selectedOutputRoot: "build_tenants/parallel_hello_world",
      tenantRoot: "build_tenants/parallel_hello_world",
      dag
    });
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: "frontier://odd-sdlc/live/derive-component-code-surface/parallel-materialization",
    graphCallId: "graph-call://odd-sdlc/live/derive-component-code-surface/parallel-materialization",
    frameId: "frame://odd-sdlc/live/derive-component-code-surface/parallel-materialization",
    basisId: "basis://odd-sdlc/t174/live-rooted",
    graphFunctionId: "graph-function://odd-sdlc/t174/live-rooted",
    frameLineageId: "lineage://odd-sdlc/t174/live-rooted",
    frameAttemptId: "attempt://odd-sdlc/t174/live-rooted/0",
    commandKind: "materialize_live_parallel_sdlc_branch:derive_component_code_surface",
    branchKeyByNodeRef: branchOverrides.branchKeyByNodeRef,
    branchRefByNodeRef: branchOverrides.branchRefByNodeRef
  });

  const expectedBranchRefs = [
    "branch://odd-sdlc/live/derive-component-code-surface/b000-dev-src-hello-js",
    "branch://odd-sdlc/live/derive-component-code-surface/b001-test-test-hello-test-js",
    "branch://odd-sdlc/live/derive-component-code-surface/b002-uat-test-test-uat-hello-uat-test-js",
    "branch://odd-sdlc/live/derive-component-code-surface/b003-dev-src-world-js",
    "branch://odd-sdlc/live/derive-component-code-surface/b004-test-test-world-test-js",
    "branch://odd-sdlc/live/derive-component-code-surface/b005-uat-test-test-uat-world-uat-test-js"
  ];
  assert.deepEqual(
    compilation.readyBranchRefs.toSorted(),
    expectedBranchRefs.toSorted()
  );
  assert.equal(dag.startNodes.length, 6);
  assert.equal(compilation.declarations.length, 7);
  assert.deepEqual(compilation.writeTerritoryConflictRefs, []);
  assert.deepEqual(compilation.outputAllocationConflictRefs, []);

  const counters = { active: 0, maxActive: 0 };
  const emittedEvents = [];
  const fanInRows = fanInRowsForSyntheticLiveFrontier({ dag, compilation });
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: compilation.frontierRef,
    declarations: compilation.declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://odd-sdlc/t174/live-rooted/max-four",
      maxConcurrency: 4,
      maxRetryAttempts: 0,
      leaseTtlMs: 10_000,
      resolvedSystemPolicyRefs: Object.freeze([
        "abg://abiogenesis/event-sourced-saga-frontier",
        moduleTraversal.selectionRef
      ])
    }),
    tasks: compilation.declarations.map((declaration) => {
      const fanInPayloadDigest =
        fanInRows.find((row) => row.branchRef === declaration.branchRef.branchRef)
          ?.payloadDigest;
      return countedTask(
        declaration.branchRef.branchRef,
        fanInPayloadDigest ??
          `payload://odd-sdlc/live/derive-component-code-surface/${declaration.branchRef.branchKey}`,
        counters
      );
    }),
    eventSink: (event) => emittedEvents.push(event),
    maxBatches: 3,
    correlationId: "correlation://odd-sdlc/t174/live-rooted"
  });
  const branchRows = branchRowsForSyntheticLiveFrontier({ dag, compilation });
  const frontier = constructSdlcLiveFpParallelMaterializationFrontier({
    edgeName: "derive_component_code_surface",
    executionAuthority: "abg_evented_saga_frontier",
    parallelismControl: "abg_branch_execution_policy",
    graphTruthSource: "sdlc_feature_dependency_dag",
    selectedMethod: moduleTraversal.selectedMethod,
    dependencyMapRef: implementationMap.mapRef,
    testDependencyMapRef: testDependencyMap.mapRef,
    uatTestDependencyMapRef: uatTestDependencyMap.mapRef,
    dependencyMapRefs: Object.freeze([
      implementationMap.mapRef,
      testDependencyMap.mapRef,
      uatTestDependencyMap.mapRef
    ]),
    traversalSelectionRef: moduleTraversal.selectionRef,
    testTraversalSelectionRef: testTraversal.selectionRef,
    uatTestTraversalSelectionRef: uatTestTraversal.selectionRef,
    traversalSelectionRefs: Object.freeze([
      moduleTraversal.selectionRef,
      testTraversal.selectionRef,
      uatTestTraversal.selectionRef
    ]),
    dagRef: dag.dagRef,
    startNodes: dag.startNodes,
    frontierRef: run.frontierRef,
    policyRef: run.policyRef,
    laneCount: 6,
    devLaneCount: 2,
    componentTestLaneCount: 2,
    uatTestLaneCount: 2,
    testLaneCount: 4,
    fanInCount: 1,
    batchCount: run.batchCount,
    batchSizes: run.batches.map((batch) => batch.selection.selectedBranchRefs.length),
    maxActive: counters.maxActive,
    readyBranchRefs: run.batches[0]?.selection.selectedBranchRefs ?? Object.freeze([]),
    compiledReadyBranchRefs: compilation.readyBranchRefs,
    completedBranchRefs: run.completedBranchRefs,
    failedBranchRefs: run.failedBranchRefs,
    writeTerritoryConflictRefs: compilation.writeTerritoryConflictRefs,
    outputAllocationConflictRefs: compilation.outputAllocationConflictRefs,
    branchRows,
    fanInRows,
    emittedEventKinds: Object.freeze(
      [...new Set(run.emittedEvents.map((event) => event.kind))].sort()
    ),
    emittedEventCount: emittedEvents.length,
    replayEventCount: run.replayEvents.length
  });
  assert.equal(isSdlcLiveFpParallelMaterializationFrontier(frontier), true);
  assert.equal(
    isSdlcLiveFpParallelMaterializationFrontier({
      ...frontier,
      executionAuthority: "sdlc_local_parallel_scheduler"
    }),
    false
  );
  assert.equal(
    isSdlcLiveFpParallelMaterializationFrontier({
      ...frontier,
      parallelismControl: "sdlc_local_batch_loop"
    }),
    false
  );
  const firstBatchBranchRefs =
    run.batches[0]?.selection.selectedBranchRefs ?? Object.freeze([]);
  assert.ok(
    firstBatchBranchRefs.some((branchRef) => branchRef.includes("-dev-")),
    "first ABG batch must include implementation code work"
  );
  assert.ok(
    firstBatchBranchRefs.some((branchRef) => branchRef.includes("-test-test-")),
    "first ABG batch must include component/unit test work"
  );
  assert.ok(
    firstBatchBranchRefs.some((branchRef) => branchRef.includes("-uat-test-")),
    "first ABG batch must include UAT test-source work"
  );
  assert.equal(frontier.laneCount, 6);
  assert.equal(frontier.maxActive, 4);
  assert.deepEqual(frontier.batchSizes, [4, 2, 1]);
  assert.deepEqual(
    frontier.branchRows.map((row) => row.branchRef).sort(),
    expectedBranchRefs.toSorted()
  );
  assert.equal(
    frontier.fanInRows[0]?.payloadDigest,
    "payload://odd-sdlc/live/derive-component-code-surface/fan-in"
  );
});

test("T-174 ABG live branch refs preserve full target identity for same basenames", async () => {
  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/t174/same-basename-branches",
    graphFunctionName: "derive_component_code_surface",
    moduleDependencyMap: moduleMap([
      Object.freeze({
        nodeId: "module://dev/a-index",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-A"]),
        materializationTargetRefs: Object.freeze(["src/a/index.js"])
      }),
      Object.freeze({
        nodeId: "module://dev/b-index",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-B"]),
        materializationTargetRefs: Object.freeze(["src/b/index.js"])
      })
    ]),
    includeFanIn: false
  });
  const branchOverrides =
    deriveSdlcLiveFpParallelMaterializationBranchOverrides({
      edgeName: "derive_component_code_surface",
      selectedOutputRoot: "",
      tenantRoot: "",
      dag
    });
  assert.deepEqual(
    Object.values(branchOverrides.branchKeyByNodeRef).sort(),
    ["b000-dev-src-a-index-js", "b001-dev-src-b-index-js"]
  );
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: "frontier://odd-sdlc/t174/same-basename-branches",
    graphCallId: "graph-call://odd-sdlc/t174/same-basename-branches",
    frameId: "frame://odd-sdlc/t174/same-basename-branches",
    branchKeyByNodeRef: branchOverrides.branchKeyByNodeRef,
    branchRefByNodeRef: branchOverrides.branchRefByNodeRef
  });
  assert.equal(
    new Set(compilation.declarations.map((declaration) => declaration.branchRef.branchRef))
      .size,
    2
  );

  const counters = { active: 0, maxActive: 0 };
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: compilation.frontierRef,
    declarations: compilation.declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://odd-sdlc/t174/same-basename-branches/max-two",
      maxConcurrency: 2
    }),
    tasks: compilation.declarations.map((declaration) =>
      countedTask(
        declaration.branchRef.branchRef,
        `payload://odd-sdlc/t174/${declaration.branchRef.branchKey}`,
        counters
      )
    ),
    eventSink: () => {},
    maxBatches: 1,
    correlationId: "correlation://odd-sdlc/t174/same-basename-branches"
  });
  assert.equal(run.completedBranchRefs.length, 2);
  assert.equal(counters.maxActive, 2);
});

test("T-174 data-mapper-style Scala modules form batched independent dev frontier", async () => {
  const modules = [
    "cdme-compiler",
    "cdme-assurance",
    "cdme-executor",
    "cdme-adjoint",
    "cdme-accounting",
    "cdme-fidelity",
    "cdme-engine"
  ];
  const implementationMap = Object.freeze({
    kind: "sdlc_module_dependency_map",
    mapRef: "dependency-map://odd-sdlc/t174/data-mapper/modules",
    summaryRef: "decomposition-summary://odd-sdlc/t174/data-mapper/modules",
    nodes: Object.freeze(
      modules.map((moduleName) =>
        Object.freeze({
          nodeId: `module://${moduleName}`,
          predecessorNodeIds: Object.freeze([]),
          successorNodeIds: Object.freeze([]),
          ownedRequirementRefs: Object.freeze([`REQ-${moduleName}`]),
          materializationTargetRefs: Object.freeze([
            `build_tenants/scala_spark/${moduleName}/src/main/scala`
          ])
        })
      )
    ),
    steelThreadCandidateNodeIds: Object.freeze(["module://cdme-compiler"]),
    parallelPartitionRefs: Object.freeze(
      modules.map((moduleName) => `partition://module/${moduleName}`)
    ),
    cycleRefs: Object.freeze([])
  });
  const traversal = selectSdlcDependencyMapTraversal({
    selectionRef: "selection://odd-sdlc/t174/data-mapper/modules",
    dependencyMap: implementationMap,
    policy: "parallel_when_partitioned"
  });
  assert.equal(traversal.selectedMethod, "parallel");
  assert.equal(
    sdlcLiveParallelMaterializationTargetKey("cdme-adjoint/src/main/scala"),
    "cdme-adjoint/src/main/scala"
  );

  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/t174/data-mapper/module-only",
    graphFunctionName: "derive_component_code_surface",
    moduleDependencyMap: implementationMap,
    traversalSelectionRef: traversal.selectionRef,
    evidenceRefs: Object.freeze([implementationMap.mapRef, traversal.selectionRef])
  });
  const branchOverrides =
    deriveSdlcLiveFpParallelMaterializationBranchOverrides({
      edgeName: "derive_component_code_surface",
      selectedOutputRoot: "build_tenants/scala_spark",
      tenantRoot: "build_tenants/scala_spark",
      dag
    });
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: "frontier://odd-sdlc/t174/data-mapper/module-only",
    graphCallId: "graph-call://odd-sdlc/t174/data-mapper/module-only",
    frameId: "frame://odd-sdlc/t174/data-mapper/module-only",
    basisId: "basis://odd-sdlc/t174/data-mapper",
    graphFunctionId: "graph-function://odd-sdlc/t174/data-mapper",
    frameLineageId: "lineage://odd-sdlc/t174/data-mapper",
    commandKind: "materialize_live_parallel_sdlc_branch:derive_component_code_surface",
    branchKeyByNodeRef: branchOverrides.branchKeyByNodeRef,
    branchRefByNodeRef: branchOverrides.branchRefByNodeRef
  });

  assert.equal(dag.startNodes.length, 7);
  assert.equal(compilation.readyBranchRefs.length, 7);
  assert(
    compilation.readyBranchRefs.some((branchRef) =>
      branchRef.endsWith("-dev-cdme-adjoint-src-main-scala")
    )
  );
  const maxConcurrency = resolveSdlcLiveFpParallelBatchSize({
    laneCount: dag.startNodes.length
  });
  assert.equal(maxConcurrency, 4);

  const counters = { active: 0, maxActive: 0 };
  const run = await runEventedNativeSagaFrontier({
    basis: executionBasis(),
    frontierRef: compilation.frontierRef,
    declarations: compilation.declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://odd-sdlc/t174/data-mapper/module-only/max-four",
      maxConcurrency,
      maxRetryAttempts: 0,
      leaseTtlMs: 10_000,
      resolvedSystemPolicyRefs: Object.freeze([
        "abg://abiogenesis/event-sourced-saga-frontier",
        traversal.selectionRef
      ])
    }),
    tasks: compilation.declarations.map((declaration) =>
      countedTask(
        declaration.branchRef.branchRef,
        `payload://odd-sdlc/t174/data-mapper/${declaration.branchRef.branchKey}`,
        counters
      )
    ),
    eventSink: () => {},
    maxBatches: 4,
    correlationId: "correlation://odd-sdlc/t174/data-mapper/module-only"
  });
  assert.deepEqual(
    run.batches.map((batch) => batch.selection.selectedBranchRefs.length),
    [4, 3, 1]
  );
  assert.equal(counters.maxActive, 4);
  assert.equal(run.completedBranchRefs.length, 8);
});

test("T-174 synthetic hello-world handoff payload is hygienic and admits derived test topology", () => {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t174-prompt-hygiene-"));
  try {
    writeT174SyntheticWorkspace(root);
    const contract = hookContractByEdgeName("derive_component_code_surface");
    const baseManifest = deriveWorkerHandoffManifest({
      workspaceRoot: root,
      graphFunctionName: "derive_component_code_surface",
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: "t174-synthetic-multilane-prompt"
    });
    const predecessorArchiveRoot =
      writeT174AdmittedImplementationDesignArchive(root, baseManifest);
    const manifest = {
      ...baseManifest,
      traversalObligationContext: {
        ...baseManifest.traversalObligationContext,
        priorEdgeRefs: Object.freeze([
          ...baseManifest.traversalObligationContext.priorEdgeRefs,
          pathToFileURL(
            path.join(predecessorArchiveRoot, "handoff_manifest.json")
          ).href
        ])
      }
    };
    const files = writeHandoffFiles(manifest);
    const prompt = readFileSync(files.promptPath, "utf8");
    const workerResponse = [
      "# Component Code Surface",
      "",
      "## Execution Plan",
      "",
      "| Branch | Target |",
      "| --- | --- |",
      "| hello | `build_tenants/parallel_hello_world/src/hello.js` |",
      "| world | `build_tenants/parallel_hello_world/src/world.js` |",
      "",
      "## Component Realization Register",
      "",
      "| Component | Target | Requirement |",
      "| --- | --- | --- |",
      "| `hello_branch` | `src/hello.js` | `REQ-T174-PARALLEL-HELLO-002` |",
      "| `world_branch` | `src/world.js` | `REQ-T174-PARALLEL-HELLO-003` |"
    ].join("\n");

    assertNoWorkerSystemJsonLeak("component-code worker prompt", prompt);
    assertNoWorkerSystemJsonLeak("component-code worker response", workerResponse);
    assert.match(prompt, /worker_construction_brief\.json as the single prompt source carrier/u);
    assert.match(prompt, /For component_code_surface, materialize implementation\/source files/u);
    assert.match(prompt, /Do not create test files, test component rows, repair schedules, or execution evidence/u);
    assert.doesNotMatch(prompt, /feature_decomp_surface\.md[\s\S]*"kind"\s*:/u);

    const carriers = deriveSdlcStagedConstructionAuditCarriers(manifest);
    const artifactRefs = carriers.map((carrier) => carrier.artifactRef).sort();
    assert(artifactRefs.includes("operator-run-artifact://module-dependency-map"));
    assert(artifactRefs.includes("operator-run-artifact://test-dependency-map"));
    assert(artifactRefs.includes("operator-run-artifact://test-dependency-traversal-selection"));
    assert(artifactRefs.includes("operator-run-artifact://uat-test-dependency-map"));
    assert(
      artifactRefs.includes(
        "operator-run-artifact://uat-test-dependency-traversal-selection"
      )
    );
    const testMap = carriers.find(
      (carrier) => carrier.artifactRef === "operator-run-artifact://test-dependency-map"
    )?.payload;
    assert.equal(testMap?.kind, "sdlc_test_dependency_map");
    assert.deepEqual(
      testMap.nodes.map((node) => node.materializationTargetRefs[0]).sort(),
      [
        "build_tenants/parallel_hello_world/test/hello.test.js",
        "build_tenants/parallel_hello_world/test/world.test.js"
      ]
    );
    const uatTestMap = carriers.find(
      (carrier) =>
        carrier.artifactRef === "operator-run-artifact://uat-test-dependency-map"
    )?.payload;
    assert.equal(uatTestMap?.kind, "sdlc_test_dependency_map");
    assert.deepEqual(
      uatTestMap.nodes.map((node) => node.materializationTargetRefs[0]).sort(),
      [
        "build_tenants/parallel_hello_world/test/uat/hello.uat.test.js",
        "build_tenants/parallel_hello_world/test/uat/world.uat.test.js"
      ]
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T-174 write territory conflicts are visible before ABG lease selection", () => {
  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/t174/conflict",
    graphFunctionName: "t174_feature_dependency_dag_frontier",
    moduleDependencyMap: moduleMap([
      Object.freeze({
        nodeId: "module://dev/left",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-CONFLICT-LEFT"]),
        materializationTargetRefs: Object.freeze(["src/shared.js"])
      }),
      Object.freeze({
        nodeId: "module://dev/right",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-CONFLICT-RIGHT"]),
        materializationTargetRefs: Object.freeze(["src/shared.js"])
      })
    ]),
    includeFanIn: false
  });
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: "frontier://odd-sdlc/t174/conflict",
    graphCallId: "graph-call://odd-sdlc/t174/conflict",
    frameId: "frame://odd-sdlc/t174/conflict"
  });
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: compilation.frontierRef,
    declarations: compilation.declarations
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: "selection://odd-sdlc/t174/conflict",
    frontier,
    policy: constructBranchExecutionPolicy({
      policyRef: "policy://odd-sdlc/t174/conflict/max-two",
      maxConcurrency: 2
    })
  });

  assert.deepEqual(compilation.writeTerritoryConflictRefs, [
    "workspace://src/shared.js"
  ]);
  assert.deepEqual(compilation.outputAllocationConflictRefs, [
    "artifact://src/shared.js"
  ]);
  assert.equal(compilation.readyBranchRefs.length, 2);
  assert.equal(selection.selectedBranchRefs.length, 1);
  assert.equal(selection.conflictBranchRefs.length, 1);
});

test("T-174 serial dependency chains normalize to DAGs with singleton start_nodes", () => {
  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: "dag://odd-sdlc/t174/serial",
    graphFunctionName: "t174_feature_dependency_dag_frontier",
    moduleDependencyMap: moduleMap([
      Object.freeze({
        nodeId: "module://dev/base",
        predecessorNodeIds: Object.freeze([]),
        successorNodeIds: Object.freeze(["module://dev/adapter"]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-SERIAL-BASE"]),
        materializationTargetRefs: Object.freeze(["src/base.js"])
      }),
      Object.freeze({
        nodeId: "module://dev/adapter",
        predecessorNodeIds: Object.freeze(["module://dev/base"]),
        successorNodeIds: Object.freeze([]),
        ownedRequirementRefs: Object.freeze(["REQ-T174-SERIAL-ADAPTER"]),
        materializationTargetRefs: Object.freeze(["src/adapter.js"])
      })
    ]),
    includeFanIn: false
  });
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: "frontier://odd-sdlc/t174/serial",
    graphCallId: "graph-call://odd-sdlc/t174/serial",
    frameId: "frame://odd-sdlc/t174/serial"
  });

  assert.equal(dag.blockingReasons.length, 0);
  assert.equal(dag.startNodes.length, 1);
  assert.equal(dag.edges.length, 1);
  assert.equal(compilation.readyBranchRefs.length, 1);
  assert.equal(
    compilation.declarations.find(
      (declaration) => declaration.parentBranchRefs.length === 1
    )?.parentBranchRefs[0],
    compilation.readyBranchRefs[0]
  );
});
