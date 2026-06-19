// Validates: T-188

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { deriveRuntimeAggregateProjection } from "@abiogenesis/typescript-tenant";

import {
  SDLC_BLOCKING_REASON_REENTRY_POINTS,
  constructOddSdlcAbiogenesisExecutionBasis,
  deriveSdlcClosureStateTransition,
  makeSdlcClosureResidualPressureCarrier,
  makeSdlcBlockingReason,
  sdlcClosureStateBucketForLawfulReentryPoint,
  syntheticGapDossierFromClosureRefs
} from "../../build/semantic/code/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "../..");
const OPERATOR_SRC_ROOT = path.join(PACKAGE_ROOT, "code/src/operator");
const INSTALLED_OPERATOR_SOURCE = readFileSync(
  path.join(OPERATOR_SRC_ROOT, "installed_operator.ts"),
  "utf8"
);

const EXPECTED_BUCKET_BY_REENTRY_POINT = Object.freeze({
  same_edge_retry: "retry",
  escalate_to_fp: "re-enter",
  repair_worker_output: "repair",
  attach_worker: "block",
  repair_installed_topology: "block",
  fix_target_or_run_gaps: "block",
  repair_project_conformance: "block",
  reprice_runtime_policy: "block",
  reprice_requirement_or_design: "reprice",
  triage_gap: "block",
  rerun_start: "block",
  inspect_worker_archive: "block",
  repair_install: "block",
  operator_blocked: "block"
});

function transitionFor(patch = {}) {
  const basis = constructOddSdlcAbiogenesisExecutionBasis({
    workspaceRoot: "/workspace/odd-sdlc-t188-closure-state-machine",
    defaultRegime: "F_P",
    runId: "run://odd-sdlc/t188/closure-state-machine",
    workKey: "wk://odd-sdlc/t188/closure-state-machine",
    frameId: null,
    frameLineageId: null
  });
  return deriveSdlcClosureStateTransition({
    abgRuntimeTransitionContext: {
      basis,
      runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
      vectorIndex: 0
    },
    runRef: "20260603T153222191Z_pid19186",
    blockingReasonCarriers: [],
    residualPressureRefs: [],
    abgTerminalRetryRefs: [],
    structuralBlockReasonRefs: [],
    postActionBlockReasonRefs: [],
    yieldResumeBasis: null,
    edgeAssuranceDisposition: null,
    ...patch
  });
}

function tsFilesUnder(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return tsFilesUnder(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".ts") ? [fullPath] : [];
  });
}

test("T-188 every lawful reentry point maps to one closure-state bucket", () => {
  assert.deepStrictEqual(
    [...SDLC_BLOCKING_REASON_REENTRY_POINTS].sort(),
    Object.keys(EXPECTED_BUCKET_BY_REENTRY_POINT).sort()
  );
  for (const reentryPoint of SDLC_BLOCKING_REASON_REENTRY_POINTS) {
    assert.equal(
      sdlcClosureStateBucketForLawfulReentryPoint(reentryPoint),
      EXPECTED_BUCKET_BY_REENTRY_POINT[reentryPoint],
      reentryPoint
    );
  }
});

test("T-188 evaluator process failure blocks instead of product-transform retry", () => {
  for (const code of [
    "design_depth_fp_evaluator_process_failed",
    "review_grade_evaluator_process_failed"
  ]) {
    const transition = transitionFor({
      blockingReasonCarriers: [
        makeSdlcBlockingReason({
          code,
          detail: "exitCode=null;signal=SIGTERM",
          evidenceRefs: [
            `file:///tmp/${code}.json`,
            "runtime-event://odd-sdlc/t188/abg-inactivity-timeout"
          ]
        })
      ],
      abgTerminalRetryRefs: [`terminal-retry://odd-sdlc/t188/${code}`],
      edgeAssuranceDisposition: "retry"
    });

    assert.equal(transition.disposition, "block", code);
    assert.equal(transition.explanationCode, "typed_block_or_triage", code);
    assert.equal(
      transition.abgIterationOutcomeProjection.outcome.kind,
      "terminate",
      code
    );
    assert.equal(
      transition.abgIterationOutcomeProjection.outcome.disposition,
      "blocked",
      code
    );
    assert.equal(
      transition.abgIterationOutcomeProjection.outcome.reason,
      "runtime_failure",
      code
    );
    assert.deepStrictEqual(transition.retryReasonRefs, [], code);
    assert(
      transition.blockReasonRefs.some((ref) => ref.includes(code)),
      transition.blockReasonRefs.join("\n")
    );
    assert(
      transition.evidenceRefs.includes(
        "runtime-event://odd-sdlc/t188/abg-inactivity-timeout"
      ),
      transition.evidenceRefs.join("\n")
    );
  }
});

test("T-188 ABG terminal retry is only the no-typed-reason fallback", () => {
  const fallbackTransition = transitionFor({
    abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"]
  });
  assert.equal(fallbackTransition.disposition, "retry");
  assert.equal(fallbackTransition.explanationCode, "abg_terminal_retry");
  assert.equal(
    fallbackTransition.abgIterationOutcomeProjection.outcome.kind,
    "redispatch"
  );
  assert.equal(
    fallbackTransition.abgIterationOutcomeProjection.outcome.reason,
    "terminal_retry_fallback"
  );

  for (const reentryPoint of SDLC_BLOCKING_REASON_REENTRY_POINTS) {
    const transition = transitionFor({
      blockingReasonCarriers: [
        makeSdlcBlockingReason({
          code: "unknown_blocking_reason",
          reasonClass: "assurance",
          lawfulReentryPoint: reentryPoint,
          evidenceRefs: [`evidence://odd-sdlc/t188/${reentryPoint}`]
        })
      ],
      abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"]
    });

    assert.notEqual(
      transition.explanationCode,
      "abg_terminal_retry",
      reentryPoint
    );
    assert.notEqual(
      transition.abgIterationOutcomeProjection.outcome.reason,
      "terminal_retry_fallback",
      reentryPoint
    );
    assert.equal(
      transition.disposition,
      EXPECTED_BUCKET_BY_REENTRY_POINT[reentryPoint],
      reentryPoint
    );
    if (reentryPoint !== "same_edge_retry") {
      assert.deepStrictEqual(transition.retryReasonRefs, [], reentryPoint);
    } else {
      assert.equal(
        transition.retryReasonRefs.some((ref) => ref.includes("abg-terminal")),
        false,
        transition.retryReasonRefs.join("\n")
      );
    }
  }
});

test("T-188 edge-assurance close emits satisfied ABG row", () => {
  const transition = transitionFor({
    edgeAssuranceDisposition: "close"
  });

  assert.equal(transition.disposition, "close");
  assert.equal(transition.explanationCode, "closed");
  assert.equal(
    transition.abgIterationOutcomeProjection.outcome.kind,
    "terminate"
  );
  assert.equal(
    transition.abgIterationOutcomeProjection.outcome.disposition,
    "converged"
  );
  assert.equal(
    transition.abgIterationOutcomeProjection.satisfactionRows.length,
    1
  );
  assert.equal(
    transition.abgIterationOutcomeProjection.satisfactionRows[0].status,
    "satisfied"
  );
  assert.equal(
    transition.abgIterationOutcomeProjection.satisfactionRows[0].reason,
    null
  );
  assert.match(
    transition.abgIterationOutcomeProjection.satisfactionRows[0].authorityRef,
    /edge-assurance-disposition:\/\/odd-sdlc\/20260603T153222191Z_pid19186\/close/u
  );
});

test("T-188 review-grade same-edge pressure remains redispatch, not structural block", () => {
  const transition = transitionFor({
    blockingReasonCarriers: [
      makeSdlcBlockingReason({
        code: "review_grade_edge_fulfillment_blocked",
        reasonClass: "assurance",
        lawfulReentryPoint: "same_edge_retry",
        evidenceRefs: [
          "file:///tmp/review_grade_edge_fulfillment_assessment.json",
          "file:///tmp/worker_result_report.json"
        ]
      })
    ],
    residualPressureRefs: [
      "obligation://odd-sdlc/target_asset%3Acomponent_code_surface/partial",
      "pressure://odd-sdlc/fp-evaluate/run/review_grade_edge_fulfillment_blocked",
      "pressure://odd-sdlc/review-grade/run/target_asset%3Acomponent_code_surface"
    ],
    edgeAssuranceDisposition: "retry"
  });

  assert.equal(transition.disposition, "retry");
  assert.equal(transition.explanationCode, "typed_retry");
  assert.equal(
    transition.abgIterationOutcomeProjection.outcome.kind,
    "redispatch"
  );
  assert.equal(
    transition.abgIterationOutcomeProjection.outcome.reason,
    "missing_evidence"
  );
  assert.equal(transition.blockReasonRefs.length, 0);
  assert(
    transition.retryReasonRefs.some((ref) =>
      ref.includes("review_grade_edge_fulfillment_blocked")
    ),
    transition.retryReasonRefs.join("\n")
  );
});

test("T-188 SDLC repair adapters are ABG redispatch rows", () => {
  const testExecutionFailureTransition = transitionFor({
    residualPressureRefs: [
      "pressure://odd-sdlc/test_execution_result_failed/run%3A%2F%2Ft188%2Ffailed/failed/failed-count:1"
    ],
    edgeAssuranceDisposition: "block"
  });

  assert.equal(testExecutionFailureTransition.disposition, "repair");
  assert.equal(
    testExecutionFailureTransition.abgIterationOutcomeProjection.outcome.kind,
    "redispatch"
  );
  assert(
    testExecutionFailureTransition.repairReasonRefs.some((ref) =>
      ref.includes("test_execution_result_failed")
    ),
    testExecutionFailureTransition.repairReasonRefs.join("\n")
  );

  const repairOnlyTransition = transitionFor({
    blockingReasonCarriers: [
      makeSdlcBlockingReason({
        code: "unknown_blocking_reason",
        reasonClass: "assurance",
        lawfulReentryPoint: "repair_worker_output",
        evidenceRefs: ["evidence://odd-sdlc/t188/repair-only"]
      })
    ],
    abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"]
  });

  assert.equal(repairOnlyTransition.disposition, "repair");
  assert.equal(
    repairOnlyTransition.abgIterationOutcomeProjection.outcome.kind,
    "redispatch"
  );
  assert.equal(
    repairOnlyTransition.abgIterationOutcomeProjection.outcome.target.reEntryPoint,
    "realization"
  );

  const reenterOnlyTransition = transitionFor({
    blockingReasonCarriers: [
      makeSdlcBlockingReason({
        code: "unknown_blocking_reason",
        reasonClass: "assurance",
        lawfulReentryPoint: "escalate_to_fp",
        evidenceRefs: ["evidence://odd-sdlc/t188/reenter-only"]
      })
    ],
    abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"]
  });

  assert.equal(reenterOnlyTransition.disposition, "re-enter");
  assert.equal(
    reenterOnlyTransition.abgIterationOutcomeProjection.outcome.kind,
    "redispatch"
  );
  assert.equal(
    reenterOnlyTransition.abgIterationOutcomeProjection.outcome.target.reEntryPoint,
    "proof"
  );
});

test("T-188 ABG reprice priority outranks SDLC redispatch labels", () => {
  const repriceCarrier = makeSdlcBlockingReason({
    code: "unknown_blocking_reason",
    reasonClass: "runtime_policy",
    lawfulReentryPoint: "reprice_requirement_or_design",
    evidenceRefs: ["evidence://odd-sdlc/t188/reprice"]
  });
  const repairTransition = transitionFor({
    blockingReasonCarriers: [
      makeSdlcBlockingReason({
        code: "unknown_blocking_reason",
        reasonClass: "assurance",
        lawfulReentryPoint: "repair_worker_output",
        evidenceRefs: ["evidence://odd-sdlc/t188/repair"]
      }),
      repriceCarrier
    ],
    abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"]
  });

  assert.equal(repairTransition.disposition, "reprice");
  assert.equal(
    repairTransition.abgIterationOutcomeProjection.outcome.kind,
    "terminate"
  );
  assert.equal(
    repairTransition.abgIterationOutcomeProjection.outcome.reason,
    "missing_authority"
  );
  assert(
    repairTransition.repriceReasonRefs.includes(
      "evidence://odd-sdlc/t188/reprice"
    ),
    repairTransition.repriceReasonRefs.join("\n")
  );

  const reenterTransition = transitionFor({
    blockingReasonCarriers: [
      makeSdlcBlockingReason({
        code: "unknown_blocking_reason",
        reasonClass: "assurance",
        lawfulReentryPoint: "escalate_to_fp",
        evidenceRefs: ["evidence://odd-sdlc/t188/reenter"]
      }),
      repriceCarrier
    ],
    abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"]
  });

  assert.equal(reenterTransition.disposition, "reprice");
  assert.equal(
    reenterTransition.abgIterationOutcomeProjection.outcome.kind,
    "terminate"
  );
  assert.equal(
    reenterTransition.abgIterationOutcomeProjection.outcome.reason,
    "missing_authority"
  );
  assert(
    reenterTransition.repriceReasonRefs.includes(
      "evidence://odd-sdlc/t188/reprice"
    ),
    reenterTransition.repriceReasonRefs.join("\n")
  );
});

test("T-188 admitted yield progress outranks ABG terminal retry fallback", () => {
  const transition = transitionFor({
    abgTerminalRetryRefs: ["terminal-retry://odd-sdlc/t188/abg-terminal"],
    yieldResumeBasis: {
      yieldKind: "partial_product_evidence_admitted_current_edge_should_resume",
      resumeBasisRef:
        "resume-basis://odd-sdlc/t188/materialized-product-lineage",
      currentEdgeRef: "edge://odd-sdlc/t188/component_code_surface",
      admittedProgressRefs: ["workspace://src/hello.js"],
      livenessProjectionRef: null,
      resumePolicyRef:
        "resume-policy://odd-sdlc/materialized-product-lineage/operator-iterate"
    }
  });

  assert.equal(transition.disposition, "yield");
  assert.equal(transition.explanationCode, "yield_progress");
  assert.deepStrictEqual(transition.retryReasonRefs, []);
  assert.equal(
    transition.yieldResumeBasis?.admittedProgressRefs[0],
    "workspace://src/hello.js"
  );
});

test("T-197 typed residual pressure carrier routes opaque closure refs", () => {
  const pressureRef = "pressure://odd-sdlc/t197/opaque-residual/a1";
  const carrier = makeSdlcClosureResidualPressureCarrier({
    pressureRef,
    lawfulReentryPoint: "repair_worker_output",
    message: "Opaque residual pressure requires repair.",
    detail: "opaque repair pressure",
    evidenceRefs: ["evidence://odd-sdlc/t197/opaque-residual"]
  });
  const transition = transitionFor({
    residualPressureRefs: [pressureRef],
    residualPressureCarriers: [carrier]
  });

  assert.equal(transition.disposition, "repair");
  assert.equal(transition.explanationCode, "residual_repair");
  assert(transition.repairReasonRefs.includes(pressureRef));

  const dossier = syntheticGapDossierFromClosureRefs({
    manifest: {
      archiveRoot: "/tmp/t197-typed-residual-pressure",
      edgeName: "derive_component_code_surface",
      graphFunctionName: "derive_component_code_surface",
      targetAssetType: "component_code_surface",
      vectorIndex: 0
    },
    decisionRef: "closure-decision://odd-sdlc/t197/typed-residual-pressure",
    reasonRefs: [pressureRef],
    sourceProjectionRef: "source-projection://odd-sdlc/t197/typed-residual-pressure",
    residualPressureCarriers: [carrier]
  });

  assert.notEqual(dossier, null);
  assert.equal(dossier.reasons.length, 1);
  assert.equal(dossier.reasons[0].reason, "opaque repair pressure");
  assert.equal(
    dossier.reasons[0].blockingReason.lawfulReentryPoint,
    "repair_worker_output"
  );
  assert.equal(
    dossier.reasons[0].blockingReason.detail,
    "opaque repair pressure"
  );
});

test("T-197 upstream repair-surface triage yields through ABG handoff", () => {
  const pressureRef = "pressure://odd-sdlc/t197/upstream-repair-surface/a1";
  const repairGraphFunctionRef =
    "graph-function://odd-sdlc/repair/upstream-authority";
  const repairGraphVectorRef =
    "graph-vector://odd-sdlc/repair/upstream-authority/0";
  const repairAssetRef =
    "asset://odd-sdlc/repair/upstream-authority/design-surface";
  const carrier = makeSdlcClosureResidualPressureCarrier({
    pressureRef,
    lawfulReentryPoint: "escalate_to_fp",
    message: "Opaque review-grade pressure names upstream repair.",
    detail: "review grade upstream re-entry",
    evidenceRefs: ["evidence://odd-sdlc/t197/upstream-review-grade"],
    repairSurfaceTriage: {
      kind: "sdlc_repair_surface_triage",
      disposition: "upstream_reentry",
      repairGraphFunctionRef,
      repairGraphVectorRef,
      repairAssetRef,
      evidenceRefs: [
        "evidence://odd-sdlc/t197/upstream-review-grade",
        repairGraphFunctionRef,
        repairGraphVectorRef,
        repairAssetRef
      ],
      rationale: "The current edge cannot repair the upstream design gap."
    }
  });
  const transition = transitionFor({
    residualPressureRefs: [pressureRef],
    residualPressureCarriers: [carrier],
    yieldResumeBasis: {
      yieldKind: "nonlocal_repair_surface_admitted_upstream_reentry",
      resumeBasisRef:
        "resume-basis://odd-sdlc/t197/upstream-repair-surface",
      currentEdgeRef: "edge://odd-sdlc/t197/current",
      admittedProgressRefs: [
        pressureRef,
        repairGraphFunctionRef,
        repairGraphVectorRef,
        repairAssetRef
      ],
      livenessProjectionRef: null,
      resumePolicyRef:
        "resume-policy://odd-sdlc/nonlocal-repair-surface/upstream-reentry"
    },
    edgeAssuranceDisposition: "retry"
  });

  assert.equal(transition.disposition, "yield");
  assert.equal(transition.explanationCode, "yield_progress");
  assert.equal(transition.abgIterationOutcomeProjection.outcome.kind, "suspend");
  assert.equal(transition.abgIterationOutcomeProjection.outcome.reason, "handoff");
  assert.deepStrictEqual(transition.retryReasonRefs, []);
  assert(transition.reenterReasonRefs.includes(pressureRef));
  assert(transition.evidenceRefs.includes(repairGraphVectorRef));

  const dossier = syntheticGapDossierFromClosureRefs({
    manifest: {
      archiveRoot: "/tmp/t197-upstream-repair-surface",
      edgeName: "derive_component_code_surface",
      graphFunctionName: "derive_component_code_surface",
      targetAssetType: "component_code_surface",
      vectorIndex: 0
    },
    decisionRef: "closure-decision://odd-sdlc/t197/upstream-repair-surface",
    reasonRefs: [pressureRef],
    sourceProjectionRef: "source-projection://odd-sdlc/t197/upstream-repair-surface",
    residualPressureCarriers: [carrier]
  });

  assert.notEqual(dossier, null);
  assert.equal(
    dossier.reasons[0].blockingReason.lawfulReentryPoint,
    "escalate_to_fp"
  );
  assert.equal(dossier.nextLawfulActions[0], "escalate_to_fp");
  assert.match(
    dossier.reasons[0].blockingReason.detail,
    /review grade upstream re-entry/u
  );
});

test("T-188 synthetic gap dossiers preserve typed carrier reentry class", () => {
  const carrier = makeSdlcBlockingReason({
    code: "unknown_blocking_reason",
    reasonClass: "runtime_policy",
    lawfulReentryPoint: "reprice_requirement_or_design",
    detail: "policy-disposition-mismatch",
    evidenceRefs: ["evidence://odd-sdlc/t188/runtime-policy"]
  });
  const dossier = syntheticGapDossierFromClosureRefs({
    manifest: {
      archiveRoot: "/tmp/t188-preserve-carrier",
      edgeName: "derive_component_code_surface",
      graphFunctionName: "derive_component_code_surface",
      targetAssetType: "component_code_surface",
      vectorIndex: 0
    },
    decisionRef: "closure-decision://odd-sdlc/t188/preserve-carrier",
    reasonRefs: [
      "blocking-reason://odd-sdlc/run-188/state/0/unknown_blocking_reason",
      "evidence://odd-sdlc/t188/runtime-policy"
    ],
    sourceProjectionRef: "source-projection://odd-sdlc/t188/preserve-carrier",
    blockingReasonCarriers: [carrier],
    runRef: "run-188",
    scope: "state"
  });

  assert.notEqual(dossier, null);
  assert.equal(dossier.reasons.length, 1);
  assert.equal(
    dossier.reasons[0].blockingReason.lawfulReentryPoint,
    "reprice_requirement_or_design"
  );
  assert.equal(dossier.reasons[0].reasonClass, "runtime_policy");
});

test("T-188 continuation decider is not reintroduced outside closure_state_machine", () => {
  const closureStateMachineSource = readFileSync(
    path.join(OPERATOR_SRC_ROOT, "closure_state_machine.ts"),
    "utf8"
  );
  assert.match(
    closureStateMachineSource,
    /deriveIterationOutcomeProjection\(\{/u
  );
  assert.match(
    closureStateMachineSource,
    /abgIterationOutcomeProjection/u
  );
  assert.equal(
    /\bderiveRuntimeContinuationTransitionProjection\(/u.test(closureStateMachineSource),
    false
  );

  const scannedSources = tsFilesUnder(OPERATOR_SRC_ROOT).filter(
    (sourcePath) => path.basename(sourcePath) !== "closure_state_machine.ts"
  );
  assert(scannedSources.length > 0);
  const forbiddenPatterns = [
    /\bderiveRuntimeContinuationTransitionProjection\(/u,
    "function blockingReasonRefsForReentry",
    "function closurePressureRefLawfulReentryPoint",
    "function closurePressureRefMessage",
    "function repairReasonFromClosurePressureRef",
    "closurePressureRefRequiresTriage",
    "closurePressureRefRequiresRepair"
  ];
  for (const forbidden of forbiddenPatterns) {
    for (const sourcePath of scannedSources) {
      const source = readFileSync(sourcePath, "utf8");
      const found =
        forbidden instanceof RegExp ? forbidden.test(source) : source.includes(forbidden);
      assert.equal(found, false, `${path.relative(PACKAGE_ROOT, sourcePath)}:${forbidden}`);
    }
  }
});

test("T-188 re-entered close preserves overlay segment completion authority", () => {
  assert.match(
    INSTALLED_OPERATOR_SOURCE,
    /input\.start\.executionContract\?\.overlayRef \?\? input\.state\.manifest\.overlayRef/u
  );
  assert.match(
    INSTALLED_OPERATOR_SOURCE,
    /const completedGraphFunctionRef = input\.state\.manifest\.edgeName/u
  );
  assert.match(
    INSTALLED_OPERATOR_SOURCE,
    /overlay\.overlayRef === activeOverlayRef/u
  );
  assert.match(
    INSTALLED_OPERATOR_SOURCE,
    /const normalizedPostCloseVectorIndex = normalizePostCloseContinuationVectorIndex\(\{/u
  );
  assert.match(
    INSTALLED_OPERATOR_SOURCE,
    /normalizedPostCloseVectorIndex === null &&\s+activeOverlay !== null/u
  );
  assert.match(
    INSTALLED_OPERATOR_SOURCE,
    /nextVectorIndex: normalizedPostCloseVectorIndex/u
  );
});
