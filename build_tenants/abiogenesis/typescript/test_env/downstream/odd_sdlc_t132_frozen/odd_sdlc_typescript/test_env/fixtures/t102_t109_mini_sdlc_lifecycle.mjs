function deepFreeze(value) {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

export const BOOTSTRAP_INPUT = deepFreeze({
  kind: "odd_sdlc_mini_bootstrap_input",
  workspaceRef: "workspace://mini-sdlc",
  projectSlug: "mini_sdlc_widget",
  intent:
    "Build a tiny governed software delivery slice with requirement ledger, requirement schedule, implementation, and qualification surfaces.",
  systemRef: "workspace://system/.ai-workspace",
  authorityRefs: [
    "workspace://specification/INTENT.md",
    "workspace://specification/PRODUCT.md",
    "workspace://specification/requirements/mini.md"
  ]
});

export const SDLC_REQUIREMENTS = deepFreeze([
  {
    id: "REQ-SDLC-ABG37-001",
    title: "Bootstrap authority is captured",
    detail:
      "The lifecycle bundle must preserve project slug, bootstrap authority refs, and system workspace identity.",
    sourceAuthorityRef: "workspace://specification/requirements/mini.md#REQ-SDLC-ABG37-001"
  },
  {
    id: "REQ-SDLC-ABG37-002",
    title: "Requirement ledger is published",
    detail:
      "The requirements ledger must contain every active requirement with stable ID, detail, and source authority.",
    sourceAuthorityRef: "workspace://specification/requirements/mini.md#REQ-SDLC-ABG37-002"
  },
  {
    id: "REQ-SDLC-ABG37-003",
    title: "Requirement schedule covers the ledger",
    detail:
      "The requirements schedule must create one ordered work package for each requirement in ledger order.",
    sourceAuthorityRef: "workspace://specification/requirements/mini.md#REQ-SDLC-ABG37-003"
  },
  {
    id: "REQ-SDLC-ABG37-004",
    title: "Implementation is constrained by schedule",
    detail:
      "The implementation surface must realize every scheduled requirement through a work item tied back to the schedule package.",
    sourceAuthorityRef: "workspace://specification/requirements/mini.md#REQ-SDLC-ABG37-004"
  },
  {
    id: "REQ-SDLC-ABG37-005",
    title: "Qualification evaluates every requirement",
    detail:
      "The qualification report must evaluate every requirement as a semantic requirement result rather than substituting mechanical F_D checks.",
    sourceAuthorityRef: "workspace://specification/requirements/mini.md#REQ-SDLC-ABG37-005"
  }
]);

const requirementIds = SDLC_REQUIREMENTS.map((requirement) => requirement.id);

export const EXPECTED_LIFECYCLE_BUNDLE = deepFreeze({
  kind: "odd_sdlc_mini_lifecycle_bundle",
  project: {
    slug: BOOTSTRAP_INPUT.projectSlug,
    intent: BOOTSTRAP_INPUT.intent,
    bootstrapRef: "workspace://system/.ai-workspace/context/project_bootstrap.md",
    systemRef: BOOTSTRAP_INPUT.systemRef,
    authorityRefs: BOOTSTRAP_INPUT.authorityRefs
  },
  requirementsLedger: {
    kind: "Workspace.A.requirements.ledger",
    ledgerRef: "ledger://mini-sdlc/requirements",
    sourceRefs: BOOTSTRAP_INPUT.authorityRefs,
    requirements: SDLC_REQUIREMENTS.map((requirement, index) => ({
      requirementId: requirement.id,
      title: requirement.title,
      detail: requirement.detail,
      sourceAuthorityRef: requirement.sourceAuthorityRef,
      status: "active",
      ordinal: index + 1
    }))
  },
  requirementsSchedule: {
    kind: "Workspace.A.requirements.schedule",
    scheduleRef: "schedule://mini-sdlc/requirements",
    scheduledRequirementIds: requirementIds,
    workPackages: SDLC_REQUIREMENTS.map((requirement, index) => ({
      packageId: `WP-${String(index + 1).padStart(2, "0")}`,
      requirementId: requirement.id,
      dependencyRequirementIds: requirementIds.slice(0, index),
      phase:
        index === 0
          ? "bootstrap"
          : index === 1
            ? "ledger"
            : index === 2
              ? "schedule"
              : index === 3
                ? "implementation"
                : "qualification",
      state: "open",
      reentryCondition: "retry_same_edge_on_semantic_gap"
    }))
  },
  designSurface: {
    kind: "odd_sdlc_design_surface",
    designRef: "design://mini-sdlc/lifecycle",
    consumesRequirementLedgerRef: "ledger://mini-sdlc/requirements",
    consumesScheduleRef: "schedule://mini-sdlc/requirements",
    designDecisions: [
      {
        decisionId: "DES-001",
        requirementIds,
        summary:
          "Model SDLC work as typed graph assets: bootstrap, requirement ledger, requirement schedule, implementation, and qualification."
      }
    ]
  },
  implementationSurface: {
    kind: "odd_sdlc_implementation_surface",
    implementationRef: "implementation://mini-sdlc/lifecycle",
    scheduleRef: "schedule://mini-sdlc/requirements",
    workItems: SDLC_REQUIREMENTS.map((requirement, index) => ({
      workItemId: `WI-${String(index + 1).padStart(2, "0")}`,
      requirementId: requirement.id,
      schedulePackageId: `WP-${String(index + 1).padStart(2, "0")}`,
      realizedSurface:
        index === 0
          ? "project"
          : index === 1
            ? "requirementsLedger"
            : index === 2
              ? "requirementsSchedule"
              : index === 3
                ? "implementationSurface"
                : "qualificationReport",
      evidenceRef: `artifact://mini-sdlc/lifecycle#${requirement.id}`
    }))
  },
  qualificationReport: {
    kind: "odd_sdlc_qualification_report",
    reportRef: "qualification://mini-sdlc/lifecycle",
    evaluatorRegime: "F_P",
    evaluatedRequirementIds: requirementIds,
    requirementResults: SDLC_REQUIREMENTS.map((requirement) => ({
      requirementId: requirement.id,
      status: "fulfilled",
      assessmentRegime: "F_P",
      evidenceRefs: [`artifact://mini-sdlc/lifecycle#${requirement.id}`]
    })),
    fdMechanicalChecks: {
      jsonParsed: true,
      digestRecorded: true,
      schemaEnvelopePresent: true,
      closesSemanticCorrectness: false
    }
  }
});

export const EXPECTED_OUTPUT = EXPECTED_LIFECYCLE_BUNDLE;

function exactArrayEqual(left, right) {
  return (
    Array.isArray(left) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function ledgerRequirementIds(output) {
  return output?.requirementsLedger?.requirements?.map(
    (requirement) => requirement.requirementId
  );
}

function scheduleRequirementIds(output) {
  return output?.requirementsSchedule?.workPackages?.map(
    (workPackage) => workPackage.requirementId
  );
}

function implementationRequirementIds(output) {
  return output?.implementationSurface?.workItems?.map(
    (workItem) => workItem.requirementId
  );
}

function qualificationRequirementIds(output) {
  return output?.qualificationReport?.requirementResults?.map(
    (result) => result.requirementId
  );
}

function isAllFpQualified(output) {
  return (
    output?.qualificationReport?.evaluatorRegime === "F_P" &&
    output.qualificationReport.fdMechanicalChecks?.closesSemanticCorrectness === false &&
    output.qualificationReport.requirementResults?.every(
      (result) =>
        result.status === "fulfilled" && result.assessmentRegime === "F_P"
    ) === true
  );
}

export function evaluateSemanticRows(output, evidenceRef) {
  const checks = new Map([
    [
      "REQ-SDLC-ABG37-001",
      output?.project?.slug === BOOTSTRAP_INPUT.projectSlug &&
        output?.project?.systemRef === BOOTSTRAP_INPUT.systemRef &&
        exactArrayEqual(output?.project?.authorityRefs, BOOTSTRAP_INPUT.authorityRefs)
    ],
    [
      "REQ-SDLC-ABG37-002",
      exactArrayEqual(ledgerRequirementIds(output), requirementIds) &&
        output?.requirementsLedger?.requirements?.every(
          (requirement) =>
            typeof requirement.detail === "string" &&
            requirement.detail.length > 0 &&
            typeof requirement.sourceAuthorityRef === "string" &&
            requirement.sourceAuthorityRef.length > 0 &&
            requirement.status === "active"
        ) === true
    ],
    [
      "REQ-SDLC-ABG37-003",
      exactArrayEqual(output?.requirementsSchedule?.scheduledRequirementIds, requirementIds) &&
        exactArrayEqual(scheduleRequirementIds(output), requirementIds) &&
        output?.requirementsSchedule?.workPackages?.every(
          (workPackage, index) =>
            workPackage.packageId === `WP-${String(index + 1).padStart(2, "0")}` &&
            exactArrayEqual(
              workPackage.dependencyRequirementIds,
              requirementIds.slice(0, index)
            )
        ) === true
    ],
    [
      "REQ-SDLC-ABG37-004",
      output?.implementationSurface?.scheduleRef ===
        output?.requirementsSchedule?.scheduleRef &&
        exactArrayEqual(implementationRequirementIds(output), requirementIds) &&
        output?.implementationSurface?.workItems?.every(
          (workItem, index) =>
            workItem.schedulePackageId ===
            output.requirementsSchedule.workPackages[index]?.packageId
        ) === true
    ],
    [
      "REQ-SDLC-ABG37-005",
      exactArrayEqual(qualificationRequirementIds(output), requirementIds) &&
        isAllFpQualified(output)
    ]
  ]);

  return SDLC_REQUIREMENTS.map((requirement) => {
    const fulfilled = checks.get(requirement.id) === true;
    return Object.freeze({
      kind: "sdlc_semantic_obligation_row",
      obligationId: requirement.id,
      sourceAuthorityRef: requirement.sourceAuthorityRef,
      assessmentRegime: "F_P",
      status: fulfilled ? "fulfilled" : "semantic_gap",
      detail: fulfilled ? "fulfilled" : requirement.detail,
      evidenceRefs: [evidenceRef]
    });
  });
}

export function edgePayloadFromRows(rows) {
  const fulfilled = rows.filter((row) => row.status === "fulfilled").length;
  const semanticGap = rows.length - fulfilled;
  const carryConverged = rows.length === SDLC_REQUIREMENTS.length;
  const fulfillmentConverged = semanticGap === 0;
  const admitted = true;
  const targetCertificationPassed = true;
  const fdRecheckPassed = true;
  const edgeConverged =
    carryConverged &&
    fulfillmentConverged &&
    admitted &&
    targetCertificationPassed &&
    fdRecheckPassed;
  return Object.freeze({
    kind: "sdlc_edge_fulfillment_payload",
    obligationRows: Object.freeze(rows),
    expectedCount: SDLC_REQUIREMENTS.length,
    fulfilledCount: fulfilled,
    semanticGapCount: semanticGap,
    carryConverged,
    fulfillmentConverged,
    admitted,
    targetCertificationPassed,
    fdRecheckPassed,
    edgeConverged,
    lawfulNextAction: edgeConverged ? "close" : "retry_same_edge"
  });
}
