// Implements: REQ-F-ODDSDLC-024
// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-041
// Implements: REQ-F-ODDSDLC-043

export const ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT = Object.freeze({
  kind: "odd_sdlc_typescript_rc_qualification_report",
  reportId: "odd-sdlc-ts-rc-qualification-20260506",
  releaseClaim: "bounded_odd_native_typescript_rc",
  verdict: "retired_superseded_by_test35_uplift_wave",
  verdictScope:
    "The older bounded TypeScript RC blocker map is retained as historical qualification evidence. T-041 and B-085 are closed as superseded/retired; current feature-gap closure is governed by the test35 uplift sequence in GOALS.md, T-004, and T-002.",
  nonClaimedScope: Object.freeze([
    "full operational Python replacement at Python historical multi-edge data_mapper realization depth",
    "current test35 feature-gap closure while T-004/T-002 remain active"
  ]),
  gates: Object.freeze([
    Object.freeze({
      name: "semantic unit and module-derived proof",
      category: "unit",
      command: "npm run test:semantic",
      status: "passed",
      evidenceRef: "build_tenants/typescript/test_env/test_surface_map.md"
    }),
    Object.freeze({
      name: "T-038 composed harnessed sandbox",
      category: "harnessed_sandbox",
      command: "npm run test:t038",
      status: "passed",
      evidenceRef:
        "build_tenants/typescript/test_env/tests/test_t038_rc_qualification.test.mjs"
    }),
    Object.freeze({
      name: "T-052 ABG-populated installed sandbox contract",
      category: "installed_sandbox",
      command: "npm run test:sandbox",
      status: "passed",
      evidenceRef:
        "build_tenants/typescript/test_env/sandbox/test_t052_abg_installed_sandbox_contract.test.mjs"
    }),
    Object.freeze({
      name: "T-058/T-120 Spec Method entrypoint",
      category: "spec_method",
      command: "npm run test:t058",
      status: "passed",
      evidenceRef:
        ".ai-workspace/tickets/completed/T-058-realize-typescript-public-cli-adapter-over-graph-query-start-surfaces.md"
    }),
    Object.freeze({
      name: "T-139 public requirements-fulfillment gaps view",
      category: "spec_method",
      command: "npm run test:t139",
      status: "passed",
      evidenceRef:
        "build_tenants/typescript/test_env/tests/test_t139_public_gaps_read_only_evaluator_view.test.mjs"
    }),
    Object.freeze({
      name: "T-140 no local forced-iteration authority",
      category: "runner_spine",
      command: "npm run test:t140",
      status: "passed",
      evidenceRef:
        "build_tenants/typescript/test_env/tests/test_t140_no_local_forced_iteration_authority.test.mjs"
    }),
    Object.freeze({
      name: "T-059 install and release-cut adapter",
      category: "install_release",
      command: "npm run test:t059",
      status: "passed",
      evidenceRef:
        ".ai-workspace/tickets/completed/T-059-realize-typescript-install-normalize-and-release-cut-adapters.md"
    }),
    Object.freeze({
      name: "data_mapper reference comparison",
      category: "reference",
      command: "npm run test:reference:data-mapper",
      status: "optional_passed",
      evidenceRef:
        "build_tenants/typescript/test_env/fixtures/data_mapper_reference_manifest.md"
    }),
    Object.freeze({
      name: "live F_P worker traversal",
      category: "live",
      command: "ODD_SDLC_TS_LIVE_FP=1 npm run test:live",
      status: "passed",
      evidenceRef:
        ".ai-workspace/tickets/completed/T-053-build-typescript-live-fp-data-mapper-qualification-lane.md"
    }),
    Object.freeze({
      name: "B-085 current live data_mapper release-depth parity",
      category: "live_rc_blocker",
      command: "odd-sdlc-ts gaps --workspace .",
      status: "completed_retired",
      evidenceRef:
        ".ai-workspace/tickets/completed/B-085-consume-component-repair-schedule-for-generated-scala-test-compile-failure.md"
    }),
    Object.freeze({
      name: "T-060 TypeScript/Python archive comparison",
      category: "comparison",
      command: "npm run test:t038",
      status: "passed",
      evidenceRef:
        "build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_LIVE_PYTHON_ARCHIVE_COMPARISON.md"
    })
  ]),
  pythonParity: Object.freeze([
    Object.freeze({
      area: "install and normalize",
      pythonEvidence: "normalization.py and installation tests mutate target workspaces.",
      typescriptEvidence:
        "workspace ingress admits source inputs, project constraints, imported requirement authority, and bootstrap lineage as pure carriers; T-059 installs the package and ABG runtime into a target workspace and writes normalization/bootstrap surfaces.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "start",
      pythonEvidence: "public_start.py exposes operator start against installed workspaces.",
      typescriptEvidence:
        "start/public_start.ts admits a public boundary, resolves graph-function targets, constructs an ABG ExecutionBasis, and refuses tenant-local continuation.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "gaps and query",
      pythonEvidence: "query.py, gap_dossier.py, and span_analysis.py publish domain read models.",
      typescriptEvidence:
        "projection/query_domain.ts publishes read-only query, gap, dossier, span, start-target, ownership, and requirements-fulfillment measurement surfaces over admitted module and T-135 consequence truth.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "triage",
      pythonEvidence: "triage.py and homeostatic_loop.py classify gaps and route follow-up work.",
      typescriptEvidence:
        "triage/ splits observation, classification, route binding, repricing proposal, ticket work-item route, and loopback retirement without mutating ticket state.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "constructors and evaluators",
      pythonEvidence: "constructor.py and fd_checks.py construct assets and evaluate closure.",
      typescriptEvidence:
        "hooks/ declares per-edge contracts, preflight/postflight F_D, F_P work-report admission, generated-asset authority, and ambiguity preservation; T-053 proves one live external F_P data_mapper result admitted through the same hook contract.",
      status: "bounded_parity_with_live_fp_proof",
      gapTicket: null
    }),
    Object.freeze({
      area: "traceability",
      pythonEvidence:
        "traceability.py, traceability_index.py, traceability_report.py, and requirement_closure.py publish closure evidence.",
      typescriptEvidence:
        "projection/requirement_closure.ts publishes lineage ledger, closure register, and repair frontier while keeping trace-only proof partial.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "operational return",
      pythonEvidence: "operational_dispatch.py handles cooperative operational return.",
      typescriptEvidence:
        "operational/ prepares capability-gated command surfaces, admits returned results, projects state, and feeds runtime-return observations back into graph functions.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "release",
      pythonEvidence:
        "Python can produce operational release/run evidence inside installed workspaces.",
      typescriptEvidence:
        "graph catalog publishes prepare_release_surface and operational graph functions; T-059 proves package release-cut artifact and odd-sdlc-ts binary binding.",
      status: "bounded_parity",
      gapTicket: null
    }),
    Object.freeze({
      area: "archive comparison and multi-edge depth",
      pythonEvidence:
        "Python has passing historical live code-edge archives and richer data_mapper yield-chain archives with multi-edge continuation/yield depth.",
      typescriptEvidence:
        "T-053 proves one current live data_mapper derive_code_surface traversal; T-060 publishes the side-by-side comparison. T-041 and B-085 are now completed as retired/superseded historical RC surfaces; current test35 feature-gap work is governed by the GOALS.md uplift sequence.",
      status: "retired_superseded",
      gapTicket: null
    })
  ])
} as const);

export type OddSdlcTypescriptRcQualificationReport =
  typeof ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT;

export type OddSdlcTypescriptPythonParityEntry =
  OddSdlcTypescriptRcQualificationReport["pythonParity"][number];

export function describeOddSdlcTypescriptRcQualification():
  OddSdlcTypescriptRcQualificationReport {
  return ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT;
}

export function remainingOddSdlcTypescriptRcGaps():
  readonly OddSdlcTypescriptPythonParityEntry[] {
  return Object.freeze(
    ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT.pythonParity.filter(
      (entry) => entry.gapTicket !== null
    )
  );
}
