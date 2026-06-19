// Validates: T-173

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
import { fileURLToPath } from "node:url";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcDecompositionSummary,
	  deriveSdlcTraversalHopSelection,
	  deriveSdlcWorkspaceIngressReport,
	  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
	  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
	  projectSdlcQueryDomain,
	  projectSdlcWorkerAttachment,
	  publicStartOnce,
	  SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
	  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
	  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";
import {
  analyzeSdlcFdRunArchive,
  renderSdlcFdRunAnalysisMarkdown
} from "../../build/semantic/code/src/analysis/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(TEST_DIR, "../..");

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

function publicStartContext(workspaceRoot = "/workspace/t173-hello-world") {
  const module = constructSdlcGtlModule();
  const projectConstraints = admitSdlcProjectConstraints({
    projectSlug: "t173_hello_world",
    activeTenant: "hello_world_javascript",
    selectedOutputRoot: "build_tenants/hello_world_javascript",
    ambiguityRiskAppetite: "low",
    capabilityContracts: ["trivial_product"]
  });
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints,
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: t173_hello_world",
      "  kind: imported_workspace",
      "  overlay_strategy: full_lifecycle",
      "  overlay_ref: overlay://odd-sdlc/current-full-traversal",
      "active_tenant: hello_world_javascript",
      "selected_output_root: build_tenants/hello_world_javascript",
      "ambiguity_risk_appetite: low",
      "build_tenants:",
      "  hello_world_javascript:",
      "    output_dir: build_tenants/hello_world_javascript",
      "    capability_contracts:",
      "      trivial_product: true"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject, workspaceRoot };
}

test("T-173 selects single-hop typed-template traversal for admitted framework smoke", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/hello-world/template",
    outcomeClass: "framework_smoke",
    decompositionSummary: summary([
      row({
        downstreamId: "component://hello-world",
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["src/hello.js"],
        materializationTargetRefs: ["src/hello.js"]
      })
    ]),
    typedTemplateAvailable: true,
    evidenceRefs: ["template://hello-world/javascript"]
  });

  assert.equal(selection.hopClass, "single_hop");
  assert.equal(selection.outcomeClass, "framework_smoke");
  assert.equal(
    selection.pressurePreservation.mechanism,
    "typed_template"
  );
  assert.equal(selection.zoomAdmission.disposition, "continue");
  assert.deepEqual(selection.blockingReasons, []);
});

test("T-173 public start selects framework-smoke Min(F_P) graph from trivial proportionality", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } =
    publicStartContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "next",
        handle: "default"
      },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "fp_worker_unattached");
  assert(outcome.executionContract);
  assert.equal(
    outcome.executionContract.targetGraphFunction,
    FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
  );
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF
  );
  assert.equal(
    outcome.executionContract.traversalDecompositionSummary?.upstreamCount,
    1
  );
  assert.equal(
    outcome.executionContract.traversalDecompositionSummary?.downstreamCount,
    1
  );
  assert.equal(
    outcome.executionContract.traversalHopSelection?.hopClass,
    "single_hop"
  );
  assert.equal(
    outcome.executionContract.traversalHopSelection?.pressurePreservation.mechanism,
    "outcome_class_graph_variant"
  );
});

test("T-173 direct lite overlay start carries reduced traversal selection", () => {
  const { module, queryDomain, conformedProject, workspaceRoot } =
    publicStartContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot,
      target: {
        kind: "overlay",
        handle: SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
      },
      until: "first_traversal",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "fp_worker_unattached");
  assert(outcome.executionContract);
  assert.equal(
    outcome.executionContract.targetGraphFunction,
    FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
  );
  assert.equal(
    outcome.executionContract.overlayRef,
    SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  );
  assert.equal(
    outcome.executionContract.traversalDecompositionSummary?.upstreamCount,
    1
  );
  assert.equal(
    outcome.executionContract.traversalHopSelection?.outcomeClass,
    "framework_smoke"
  );
  assert.equal(
    outcome.executionContract.traversalHopSelection?.hopClass,
    "single_hop"
  );
  assert.equal(
    outcome.executionContract.traversalHopSelection?.pressurePreservation.mechanism,
    "outcome_class_graph_variant"
  );
});

test("T-173 selects dual-hop bundle for coupled low-complexity test pressure", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/hello-world/bundle",
    outcomeClass: "framework_smoke",
    decompositionSummary: summary([
      row({
        downstreamId: "component://source",
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["src/hello.js"],
        substantiveResponsibilityRefs: ["function://hello"],
        materializationTargetRefs: ["src/hello.js"]
      }),
      row({
        downstreamId: "test-class://hello",
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["test/hello.test.js"],
        substantiveResponsibilityRefs: ["test://exact-stdout"],
        materializationTargetRefs: ["test/hello.test.js"]
      })
    ]),
    bundleEligible: true,
    skippedEdgeRefs: ["edge://derive_component_test_surface"],
    evidenceRefs: ["bundle://hello-world/source-and-test"]
  });

  assert.equal(selection.hopClass, "dual_hop");
  assert.equal(
    selection.pressurePreservation.mechanism,
    "bundled_fp_output"
  );
  assert.deepEqual(selection.pressurePreservation.skippedEdgeRefs, [
    "edge://derive_component_test_surface"
  ]);
  assert.deepEqual(selection.blockingReasons, []);
});

test("T-173 keeps single-hop eligible bundle input as single-hop", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/hello-world/bundle-single",
    outcomeClass: "framework_smoke",
    decompositionSummary: summary([
      row({
        downstreamId: "component://hello-world",
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["src/hello.js"],
        substantiveResponsibilityRefs: ["function://hello"],
        materializationTargetRefs: ["src/hello.js"]
      })
    ]),
    bundleEligible: true,
    evidenceRefs: ["outcome-variant://hello-world/minimal"]
  });

  assert.equal(selection.hopClass, "single_hop");
  assert.equal(
    selection.pressurePreservation.mechanism,
    "outcome_class_graph_variant"
  );
});

test("T-173 keeps substantive domain products on staged traversal", () => {
  const rows = Array.from({ length: 12 }, (_, index) =>
    row({
      downstreamId: `component://data-mapper-${index + 1}`,
      ownedUpstreamRefs: [`REQ-DM-${index + 1}`],
      publicBoundaryRefs: [`src/component-${index + 1}.ts`],
      substantiveResponsibilityRefs: [`function://dm-${index + 1}`],
      materializationTargetRefs: [`src/component-${index + 1}.ts`]
    })
  );
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/data-mapper/staged",
    outcomeClass: "domain_product",
    decompositionSummary: summary(rows),
    typedTemplateAvailable: true,
    bundleEligible: true,
    evidenceRefs: ["decomposition-summary://data-mapper/substantive"]
  });

  assert.equal(selection.hopClass, "staged");
  assert.equal(selection.outcomeClass, "domain_product");
  assert.equal(selection.pressurePreservation.mechanism, "none");
});

test("T-173 rejects Min(F_P) shortcut for small domain products", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/domain/small",
    outcomeClass: "domain_product",
    decompositionSummary: summary([
      row({
        downstreamId: "component://tiny-domain",
        ownedUpstreamRefs: ["REQ-DOMAIN-001"],
        publicBoundaryRefs: ["src/domain.ts"],
        substantiveResponsibilityRefs: ["function://domain"],
        materializationTargetRefs: ["src/domain.ts"]
      })
    ]),
    typedTemplateAvailable: true,
    bundleEligible: true,
    evidenceRefs: ["template://domain/tiny"]
  });

  assert.equal(selection.hopClass, "staged");
  assert.equal(selection.pressurePreservation.mechanism, "none");
});

test("T-173 permits tutorial examples through explicit Min(F_P) outcome class", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/tutorial/template",
    outcomeClass: "tutorial_example",
    decompositionSummary: summary([
      row({
        downstreamId: "component://tutorial",
        ownedUpstreamRefs: ["REQ-TUTORIAL-001"],
        publicBoundaryRefs: ["src/tutorial.js"],
        substantiveResponsibilityRefs: ["function://tutorial"],
        materializationTargetRefs: ["src/tutorial.js"]
      })
    ]),
    typedTemplateAvailable: true,
    evidenceRefs: ["template://tutorial/javascript"]
  });

  assert.equal(selection.hopClass, "single_hop");
  assert.equal(selection.pressurePreservation.mechanism, "typed_template");
});

test("T-173 ratio thresholds affect small-hop selection", () => {
  const twoOutputSummary = summary([
    row({
      downstreamId: "component://source",
      ownedUpstreamRefs: ["REQ-HELLO-001"],
      publicBoundaryRefs: ["src/hello.js"],
      substantiveResponsibilityRefs: ["function://hello"],
      materializationTargetRefs: ["src/hello.js"]
    }),
    row({
      downstreamId: "test-class://source",
      ownedUpstreamRefs: ["REQ-HELLO-001"],
      publicBoundaryRefs: ["test/hello.test.js"],
      substantiveResponsibilityRefs: ["test://hello"],
      materializationTargetRefs: ["test/hello.test.js"]
    })
  ]);
  const admittedAtBoundary = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/ratio/boundary",
    outcomeClass: "framework_smoke",
    decompositionSummary: twoOutputSummary,
    bundleEligible: true,
    evidenceRefs: ["bundle://hello-world/source-and-test"]
  });
  const rejectedOverBoundary = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/ratio/over",
    outcomeClass: "framework_smoke",
    decompositionSummary: twoOutputSummary,
    bundleEligible: true,
    evidenceRefs: ["bundle://hello-world/source-and-test"],
    thresholds: {
      kind: "sdlc_traversal_complexity_thresholds",
      profileRef: "profile://t173/strict-expansion",
      maxSingleHopInputObligations: 1,
      maxSingleHopOutputRows: 1,
      maxSingleHopUpstreamPerDownstreamRatio: 1,
      maxSingleHopDownstreamPerUpstreamRatio: 1,
      maxDualHopInputObligations: 2,
      maxDualHopOutputRows: 2,
      maxDualHopUpstreamPerDownstreamRatio: 2,
      maxDualHopDownstreamPerUpstreamRatio: 1,
      maxResidualRefsForSmallHop: 0,
      maxResidualOutsideSubsurfaceRefsForSmallHop: 0
    }
  });

  assert.equal(admittedAtBoundary.hopClass, "dual_hop");
  assert.equal(rejectedOverBoundary.hopClass, "staged");
});

test("T-173 admits projection-only rollup only with pressure evidence", () => {
  const admitted = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/projection/with-evidence",
    outcomeClass: "framework_smoke",
    decompositionSummary: null,
    projectionOnlyEligible: true,
    skippedEdgeRefs: ["edge://derive_code_surface"],
    evidenceRefs: ["carrier://component-code/admitted"]
  });
  const rejected = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/projection/no-evidence",
    outcomeClass: "framework_smoke",
    decompositionSummary: null,
    projectionOnlyEligible: true,
    skippedEdgeRefs: ["edge://derive_code_surface"]
  });

  assert.equal(admitted.hopClass, "single_hop");
  assert.equal(
    admitted.pressurePreservation.mechanism,
    "replay_visible_projection"
  );
  assert.deepEqual(admitted.blockingReasons, []);
  assert.equal(rejected.hopClass, "blocked");
  assert.ok(
    rejected.blockingReasons.includes(
      "complexity_decomposition_summary_missing"
    )
  );
});

test("T-173 selects zoom when decomposition pressure exceeds the next stage", () => {
  const overloaded = summary([
    row({
      downstreamId: "component://god-module",
      ownedUpstreamRefs: Array.from({ length: 9 }, (_, index) => `REQ-${index + 1}`),
      publicBoundaryRefs: ["src/god.ts"],
      substantiveResponsibilityRefs: ["function://god"]
    })
  ]);
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/zoom/high-density",
    outcomeClass: "domain_product",
    decompositionSummary: overloaded,
    evidenceRefs: ["decomposition-summary://overloaded"]
  });

  assert.equal(selection.hopClass, "zoom_required");
  assert.equal(selection.zoomAdmission.disposition, "zoom_required");
  assert.ok(
    selection.zoomAdmission.reasonRefs.includes(
      "decomposition_high_density_downstream_rows"
    )
  );
});

test("T-173 blocks when pressure ownership is ambiguous", () => {
  const invalid = summary([
    row({
      downstreamId: "component://placeholder",
      ownedUpstreamRefs: [],
      publicBoundaryRefs: ["src/placeholder.ts"],
      substantiveResponsibilityRefs: ["function://placeholder"]
    })
  ]);
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/block/unowned",
    outcomeClass: "framework_smoke",
    decompositionSummary: invalid,
    typedTemplateAvailable: true,
    evidenceRefs: ["decomposition-summary://invalid"]
  });

  assert.equal(selection.hopClass, "blocked");
  assert.equal(selection.zoomAdmission.disposition, "blocked");
  assert.ok(
    selection.blockingReasons.includes(
      "decomposition_downstream_rows_without_upstream_basis"
    )
  );
});

test("T-173 analyze-run reports traversal selection as read-only projection", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t173-analysis-"));
  try {
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "hello_world",
      nowMs: Date.parse("2026-05-20T00:00:00.000Z")
    });
    const markdown = renderSdlcFdRunAnalysisMarkdown(result);

    assert.equal(result.traversalHopSelection.kind, "sdlc_traversal_hop_selection");
    assert.equal(result.profile, "hello_world");
    assert.equal(result.traversalHopSelection.outcomeClass, "domain_product");
    assert.equal(result.traversalHopSelection.hopClass, "blocked");
    assert.ok(markdown.includes("## Traversal Selection"));
    assert.ok(markdown.includes("- outcome class: domain_product"));
    assert.ok(
      markdown.includes(
        "- blocking reasons: complexity_decomposition_summary_missing"
      )
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-173 analyze-run reads archived traversal selection carrier", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t173-archived-"));
  try {
    const runRoot = path.join(
      workspaceRoot,
      ".ai-workspace/runtime/odd_sdlc/operator-runs/20260520T010203004Z_pid173"
    );
    mkdirSync(runRoot, { recursive: true });
    writeFileSync(
      path.join(runRoot, "operator_summary.json"),
      JSON.stringify({
        kind: "sdlc_operator_summary",
        graphFunctionName: "bootstrap_release_self_test",
        currentEdge: null,
        status: "converged",
        nextLawfulAction: "disposition://close",
        archiveRoot: runRoot
      }),
      "utf8"
    );
    const archivedSummary = summary([
      row({
        downstreamId: "component://hello-world",
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["src/hello.js"],
        substantiveResponsibilityRefs: ["function://hello"],
        materializationTargetRefs: ["src/hello.js"]
      })
    ]);
    const archivedSelection = deriveSdlcTraversalHopSelection({
      selectionRef: "selection://t173/archive/hello-world",
      outcomeClass: "framework_smoke",
      decompositionSummary: archivedSummary,
      typedTemplateAvailable: true,
      evidenceRefs: ["template://hello-world/javascript"]
    });
    writeFileSync(
      path.join(runRoot, "sdlc_decomposition_summary.json"),
      JSON.stringify(archivedSummary),
      "utf8"
    );
    writeFileSync(
      path.join(runRoot, "sdlc_traversal_hop_selection.json"),
      JSON.stringify(archivedSelection),
      "utf8"
    );

    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "hello_world",
      nowMs: Date.parse("2026-05-20T00:00:00.000Z")
    });

    assert.equal(result.traversalHopSelection.selectionRef, archivedSelection.selectionRef);
    assert.equal(result.traversalHopSelection.hopClass, "single_hop");
    assert.equal(
      result.traversalHopSelection.pressurePreservation.mechanism,
      "typed_template"
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-173 analyze-run rejects malformed archived traversal selection carrier", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t173-forged-"));
  try {
    const runRoot = path.join(
      workspaceRoot,
      ".ai-workspace/runtime/odd_sdlc/operator-runs/20260520T020304005Z_pid173"
    );
    mkdirSync(runRoot, { recursive: true });
    writeFileSync(
      path.join(runRoot, "operator_summary.json"),
      JSON.stringify({
        kind: "sdlc_operator_summary",
        graphFunctionName: "bootstrap_release_self_test",
        currentEdge: null,
        status: "converged",
        nextLawfulAction: "disposition://close",
        archiveRoot: runRoot
      }),
      "utf8"
    );
    writeFileSync(
      path.join(runRoot, "sdlc_traversal_hop_selection.json"),
      JSON.stringify({
        kind: "sdlc_traversal_hop_selection",
        selectionRef: "selection://t173/forged",
        outcomeClass: "framework_smoke",
        hopClass: "single_hop",
        pressurePreservation: { mechanism: "typed_template" },
        complexityAssessment: { decompositionSummaryRef: null },
        blockingReasons: [],
        evidenceRefs: []
      }),
      "utf8"
    );

    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "hello_world",
      nowMs: Date.parse("2026-05-20T00:00:00.000Z")
    });
    const malformed = result.runtimeArtifactGaps.find(
      (gap) =>
        gap.artifact === "sdlc_traversal_hop_selection.json" &&
        gap.status === "malformed"
    );

    assert.equal(result.traversalHopSelection.hopClass, "blocked");
    assert.notEqual(malformed, undefined);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-173 installed operator archives traversal selection without local F_D runtime authorship", () => {
  const source = readFileSync(
    path.join(PACKAGE_ROOT, "code/src/operator/installed_operator.ts"),
    "utf8"
  );

  assert.match(source, /sdlc_decomposition_summary\.json/u);
  assert.match(source, /sdlc_traversal_hop_selection\.json/u);
  assert.match(source, /sdlc_frontdoor_decomposition_summary\.json/u);
  assert.match(source, /sdlc_frontdoor_traversal_hop_selection\.json/u);
  assert.match(source, /readArchivedFrontDoorTraversalSelection/u);
  assert.match(source, /sdlc_frontdoor_traversal_hop_selection/u);
  assert.doesNotMatch(source, /constructFdAuthorityOutcomeAdmittedEvent/u);
  assert.doesNotMatch(source, /odd-sdlc-frontdoor-traversal-hop-selection/u);
  assert.doesNotMatch(source, /emitted\.push\(frontDoorTraversalAuditEvent\)/u);
  assert.doesNotMatch(source, /input\.eventSink\(traversalAuditEvent\)/u);
});
