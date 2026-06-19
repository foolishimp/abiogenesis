// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  admitSdlcTicketExecutionContract,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  createSdlcTerminalGapTicketsFromOperatorRun,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain,
  projectSdlcTicketWorkflow,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";

function writeJson(filePath, payload) {
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-retry-ticket-"));
  mkdirSync(join(root, ".ai-workspace", "runtime", "odd_sdlc", "operator-runs", "run-1"), {
    recursive: true
  });
  return root;
}

function context(root) {
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(root).href,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t162",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["transport_contract"]
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot: root,
    constraintsText: [
      "project:",
      "  name: t162",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject };
}

function startTicket(root, ticketId) {
  const { module, queryDomain, conformedProject } = context(root);
  return publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: root,
      target: { kind: "asset", handle: `ticket/${ticketId}` },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });
}

function writeRetryExhaustedRun(root) {
  const runRoot = join(root, ".ai-workspace", "runtime", "odd_sdlc", "operator-runs", "run-1");
  writeJson(join(runRoot, "operator_summary.json"), {
    kind: "sdlc_operator_summary",
    currentEdge: "derive_component_code_surface",
    status: "blocked",
    blockingReason: "retry_budget_exhausted",
    blockingReasons: [
      {
        kind: "sdlc_blocking_reason",
        code: "review_grade_edge_fulfillment_blocked",
        lawfulReentryPoint: "same_edge_retry",
        evidenceRefs: [
          "workspace://build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md",
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/run-1/review_grade_edge_fulfillment_assessment.json"
        ]
      }
    ]
  });
  writeJson(join(runRoot, "sdlc_edge_closure_decision.json"), {
    kind: "sdlc_edge_closure_decision",
    disposition: "retry"
  });
  writeJson(join(runRoot, "review_grade_edge_fulfillment_assessment.json"), {
    kind: "sdlc_review_grade_edge_fulfillment_assessment",
    edgeName: "derive_component_code_surface",
    status: "blocked",
    findings: [
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "requirement:data_mapper.requirements.req_int_006",
        fulfillmentStatus: "blocked",
        failureClass: "semantic_not_realized",
        requiredAction: "Implement versioned lookup lineage.",
        evidenceRefs: [
          "workspace://specification/REQUIREMENTS.md",
          "workspace://build_tenants/scala_spark/cdme-compiler/src/main/scala/CdmeCompiler.scala"
        ]
      },
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "requirement:data_mapper.mapper_requirements.req_int_006",
        fulfillmentStatus: "blocked",
        failureClass: "semantic_not_realized",
        requiredAction: "Implement versioned lookup lineage.",
        evidenceRefs: [
          "workspace://specification/mapper_requirements.md",
          "workspace://build_tenants/scala_spark/cdme-engine/src/main/scala/CdmeEngine.scala"
        ]
      },
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "requirement:data_mapper.requirements.req_int_008",
        fulfillmentStatus: "blocked",
        failureClass: "semantic_not_realized",
        requiredAction: "Implement external computational morphism registration.",
        evidenceRefs: [
          "workspace://specification/REQUIREMENTS.md",
          "workspace://build_tenants/scala_spark/cdme-engine/src/main/scala/CdmeEngine.scala"
        ]
      }
    ]
  });
  return runRoot;
}

function writeReviewGradeTriageBlockRun(root) {
  const runRoot = join(root, ".ai-workspace", "runtime", "odd_sdlc", "operator-runs", "run-1");
  writeJson(join(runRoot, "operator_summary.json"), {
    kind: "sdlc_operator_summary",
    currentEdge: "derive_component_code_surface",
    status: "blocked",
    blockingReason:
      "evaluation_set_incomplete blocked:evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp:review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
    blockingReasons: [
      {
        kind: "sdlc_blocking_reason",
        code: "review_grade_assessment_invalid",
        reasonClass: "assurance",
        lawfulReentryPoint: "triage_gap",
        detail: "review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
        evidenceRefs: [
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/run-1/review_grade_edge_fulfillment_assessment.json",
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/run-1/review_grade_edge_fulfillment_stdout.log"
        ]
      }
    ]
  });
  writeJson(join(runRoot, "sdlc_edge_closure_decision.json"), {
    kind: "sdlc_edge_closure_decision",
    disposition: "block"
  });
  writeJson(join(runRoot, "review_grade_edge_fulfillment_assessment.json"), {
    kind: "sdlc_review_grade_edge_fulfillment_assessment",
    edgeName: "derive_component_code_surface",
    status: "blocked",
    findings: [
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "requirement:data_mapper.ai_workspace_context_project_bootstrap.req_ldm_004_a",
        fulfillmentStatus: "blocked",
        failureClass: "trace_missing",
        requiredAction:
          "Repair component_code_surface lineage through builder workflow evidence.",
        evidenceRefs: [
          "workspace://.ai-workspace/context/project_bootstrap.md",
          "workspace://build_tenants/scala_spark/design/component_code_surface.md",
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/run-1/worker_result_report.json"
        ]
      },
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "requirement:data_mapper.requirements.req_int_006",
        fulfillmentStatus: "fulfilled",
        failureClass: "none",
        requiredAction: "Already fulfilled.",
        evidenceRefs: [
          "workspace://specification/REQUIREMENTS.md",
          "workspace://build_tenants/scala_spark/cdme-compiler/src/main/scala/MappingCompiler.scala"
        ]
      }
    ]
  });
  return runRoot;
}

function writeAssessmentInvalidBlockingReasonOnlyRun(root) {
  const runRoot = join(root, ".ai-workspace", "runtime", "odd_sdlc", "operator-runs", "run-1");
  writeJson(join(runRoot, "operator_summary.json"), {
    kind: "sdlc_operator_summary",
    currentEdge: "derive_component_code_surface",
    status: "blocked",
    blockingReason:
      "evaluation_set_incomplete blocked:evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp:review_grade_fulfillment_binding_requirement_mismatch:target_asset:component_code_surface",
    blockingReasons: [
      {
        kind: "sdlc_blocking_reason",
        code: "review_grade_assessment_invalid",
        reasonClass: "assurance",
        lawfulReentryPoint: "triage_gap",
        detail:
          "review_grade_fulfillment_binding_requirement_mismatch:target_asset:component_code_surface",
        evidenceRefs: [
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/run-1/review_grade_edge_fulfillment_assessment.json",
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/run-1/review_grade_edge_fulfillment_stdout.log"
        ]
      }
    ]
  });
  writeJson(join(runRoot, "sdlc_edge_closure_decision.json"), {
    kind: "sdlc_edge_closure_decision",
    disposition: "block"
  });
  writeJson(join(runRoot, "review_grade_edge_fulfillment_assessment.json"), {
    kind: "sdlc_review_grade_edge_fulfillment_assessment",
    edgeName: "derive_component_code_surface",
    status: "blocked",
    findings: [
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "module:cdme-compiler",
        fulfillmentStatus: "fulfilled",
        failureClass: "none",
        requiredAction: "Already fulfilled.",
        evidenceRefs: [
          "workspace://build_tenants/scala_spark/design/component_code_surface.md"
        ]
      }
    ]
  });
  return runRoot;
}

test("T-162 retry exhaustion emits gap tickets and admits ticket workflow start", () => {
  const root = workspace();
  const runRoot = writeRetryExhaustedRun(root);
  const intake = createSdlcTerminalGapTicketsFromOperatorRun({
    workspaceRoot: root,
    operatorRunRoot: runRoot,
    intakeKind: "code_review_triage"
  });

  assert.equal(intake.kind, "sdlc_terminal_gap_ticket_intake_result");
  assert.equal(intake.sourceStopKind, "retry_exhaustion");
  assert.equal(intake.blockingReason, "retry_budget_exhausted");
  assert.equal(intake.closureDisposition, "retry");
  assert.equal(intake.gapTickets.length, 2);
  assert.equal(intake.createdTicketRefs.length, 3);
  assert.deepStrictEqual(intake.residualFindingRefs, [
    "requirement:data_mapper.mapper_requirements.req_int_006",
    "requirement:data_mapper.requirements.req_int_006",
    "requirement:data_mapper.requirements.req_int_008"
  ]);

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const parent = admitSdlcTicketExecutionContract({
    workflow,
    ticketId: intake.parentTicket.ticketId
  });
  assert.equal(parent.reviewDecisionRows.length, 3);
  assert(parent.reviewDecisionRows.every((row) => row.ruling === "split_ticket"));
  assert.equal(parent.bugTriageRows[0].firstMissingLayer, "realization");
  assert(parent.bugTriageRows[0].governingRequirementRefs.length > 0);
  assert(parent.bugTriageRows[0].governingDesignRefs.length > 0);

  for (const gapTicket of intake.gapTickets) {
    const contract = admitSdlcTicketExecutionContract({
      workflow,
      ticketId: gapTicket.ticketId
    });
    assert.equal(contract.bugTriageRows.length, 1);
    assert.equal(contract.bugTriageRows[0].firstMissingLayer, "realization");
    assert(contract.bugTriageRows[0].governingRequirementRefs.length > 0);
    assert(contract.bugTriageRows[0].governingDesignRefs.length > 0);
  }

  const start = startTicket(root, intake.parentTicket.ticketId);
  assert.equal(start.kind, "sdlc_public_start_projected");
  assert.equal(start.executionContract.targetGraphFunction, "route_ticket_work_item");
  assert.equal(start.executionContract.overlayRef, SDLC_TICKET_WORKFLOW_OVERLAY_REF);
  assert.equal(
    start.executionContract.ticketExecutionContract?.ticketId,
    intake.parentTicket.ticketId
  );
});

test("T-162 terminal assessment-invalid blocking reason emits admitted tickets without product requirement findings", () => {
  const root = workspace();
  const runRoot = writeAssessmentInvalidBlockingReasonOnlyRun(root);
  const intake = createSdlcTerminalGapTicketsFromOperatorRun({
    workspaceRoot: root,
    operatorRunRoot: runRoot,
    intakeKind: "code_review_triage"
  });

  assert.equal(intake.sourceStopKind, "review_grade_triage_gap");
  assert.deepStrictEqual(intake.residualFindingRefs, [
    "blocking-reason://odd-sdlc/review_grade_assessment_invalid/1"
  ]);
  assert.deepStrictEqual(intake.governingRequirementRefs, [
    "requirement:REQ-F-ODDSDLC-034",
    "requirement:REQ-F-ODDSDLC-035"
  ]);
  assert.equal(intake.gapTickets.length, 1);

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const createdTicketIds = [
    intake.parentTicket.ticketId,
    ...intake.gapTickets.map((ticket) => ticket.ticketId)
  ];
  for (const ticketId of createdTicketIds) {
    const row = workflow.rows.find((candidate) => candidate.ticketId === ticketId);
    assert(row, `expected workflow row for ${ticketId}`);
    assert.equal(row.workflowStatus, "valid");
    assert.equal(
      row.diagnostics.some((diagnostic) => diagnostic.code === "missing_governing_requirement"),
      false
    );
    const contract = admitSdlcTicketExecutionContract({ workflow, ticketId });
    assert(contract.bugTriageRows[0].governingRequirementRefs.length > 0);
  }

  const start = startTicket(root, intake.parentTicket.ticketId);
  assert.equal(start.kind, "sdlc_public_start_projected");
  assert.equal(start.executionContract.targetGraphFunction, "route_ticket_work_item");
  assert.equal(start.executionContract.overlayRef, SDLC_TICKET_WORKFLOW_OVERLAY_REF);
});

test("T-162 review-grade triage block emits gap tickets and admits ticket workflow start", () => {
  const root = workspace();
  const runRoot = writeReviewGradeTriageBlockRun(root);
  const intake = createSdlcTerminalGapTicketsFromOperatorRun({
    workspaceRoot: root,
    operatorRunRoot: runRoot,
    intakeKind: "code_review_triage"
  });

  assert.equal(intake.kind, "sdlc_terminal_gap_ticket_intake_result");
  assert.equal(intake.sourceStopKind, "review_grade_triage_gap");
  assert.match(intake.blockingReason, /review_grade_fulfillment_binding_requirement_mismatch/u);
  assert.equal(intake.closureDisposition, "block");
  assert.equal(intake.gapTickets.length, 1);
  assert.deepStrictEqual(intake.residualFindingRefs, [
    "requirement:data_mapper.ai_workspace_context_project_bootstrap.req_ldm_004_a"
  ]);

  const parentMarkdown = readFileSync(intake.parentTicket.ticketPath, "utf8");
  assert.match(parentMarkdown, /Review-grade triage gap for derive_component_code_surface/u);
  assert.match(parentMarkdown, /source_operator_run_ref:/u);
  assert.doesNotMatch(parentMarkdown, /source_retry_exhaustion_run_ref/u);
  assert.doesNotMatch(parentMarkdown, /exhausted same-edge retry run/u);

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const parent = admitSdlcTicketExecutionContract({
    workflow,
    ticketId: intake.parentTicket.ticketId
  });
  assert.equal(parent.reviewDecisionRows.length, 1);
  assert.equal(parent.reviewDecisionRows[0].ruling, "split_ticket");
  assert.equal(parent.bugTriageRows[0].firstMissingLayer, "realization");
  assert(parent.bugTriageRows[0].governingRequirementRefs.length > 0);
  assert(parent.bugTriageRows[0].governingDesignRefs.length > 0);

  const gapContract = admitSdlcTicketExecutionContract({
    workflow,
    ticketId: intake.gapTickets[0].ticketId
  });
  assert.equal(gapContract.bugTriageRows.length, 1);
  assert.equal(gapContract.bugTriageRows[0].firstMissingLayer, "realization");

  const start = startTicket(root, intake.parentTicket.ticketId);
  assert.equal(start.kind, "sdlc_public_start_projected");
  assert.equal(start.executionContract.targetGraphFunction, "route_ticket_work_item");
  assert.equal(start.executionContract.overlayRef, SDLC_TICKET_WORKFLOW_OVERLAY_REF);
  assert.equal(
    start.executionContract.ticketExecutionContract?.ticketId,
    intake.parentTicket.ticketId
  );
});
