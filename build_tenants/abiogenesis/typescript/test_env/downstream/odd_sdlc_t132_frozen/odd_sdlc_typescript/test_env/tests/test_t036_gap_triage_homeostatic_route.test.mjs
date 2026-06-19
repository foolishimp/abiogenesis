// Validates: REQ-F-ODDSDLC-033
// Validates: REQ-F-ODDSDLC-034
// Validates: REQ-F-ODDSDLC-035
// Validates: REQ-F-ODDSDLC-036
// Validates: REQ-F-ODDSDLC-037
// Investigates: T-036

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  bindSdlcRoute,
  classifySdlcGapObservation,
  constructSdlcGraphFunctionCatalog,
  constructSdlcGtlModule,
  deriveSdlcGapDossier,
  deriveSdlcLineageLedger,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  observeSdlcGapPressure,
  projectSdlcQueryDomain,
  projectSdlcRequirementClosureRegister,
  proposeSdlcConstitutionalRepricing,
  retireSdlcGapAfterLoopback,
  routeSdlcTicketWorkItem,
  SDLC_TRIAGE_CLASSIFICATION_POLICY,
  SDLC_TRIAGE_ROUTE_POLICY
} from "../../build/semantic/code/src/index.js";

function moduleBasis(handle = "bootstrap_release_self_test") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t036",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle
      },
      until: "blocked"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t036/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t036",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t036",
    workKey: "wk://odd-sdlc/t036",
    frameId: null,
    frameLineageId: null
  });
}

function ingressReport(requirementsText) {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "fixture://t036",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t036",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["gap_triage", "ticket_routing"]
    }),
    sourceInputs:
      requirementsText.length === 0
        ? []
        : [
            deriveSdlcSourceInput({
              uri: "fixture://t036/specification/REQUIREMENTS.md",
              relativePath: "specification/REQUIREMENTS.md",
              content: requirementsText
            })
          ]
  });
}

function closureRegisterFor(requirementsText) {
  const ingress = ingressReport(requirementsText);
  const ledger = deriveSdlcLineageLedger({
    ingressReport: ingress,
    workReports: [],
    proofClaims: []
  });
  return projectSdlcRequirementClosureRegister({
    ingressReport: ingress,
    lineageLedger: ledger
  });
}

function closureRegisterWithOpenReasons(
  openReasons,
  sourceInputUris = ["fixture://t036/specification/REQUIREMENTS.md"]
) {
  return Object.freeze({
    kind: "sdlc_requirement_closure_register",
    entries: Object.freeze([
      Object.freeze({
        kind: "sdlc_requirement_closure_entry",
        requirementId: "REQ-T036-TEST",
        sourceInputUris: Object.freeze(sourceInputUris),
        assetIds: Object.freeze(["asset://trace-only"]),
        producedByGraphFunctions: Object.freeze(["derive_code_surface"]),
        proofKinds: Object.freeze(["trace_tag"]),
        authorityVerbs: Object.freeze(["implements"]),
        evidenceRefs: Object.freeze(["trace://t036/REQ-T036-TEST"]),
        traceabilityStatus: "trace_only",
        fulfillmentStatus: "partial",
        carryStatus: "carried_forward",
        openReasons: Object.freeze(openReasons)
      })
    ]),
    fulfilledRequirementIds: Object.freeze([]),
    carriedForwardRequirementIds: Object.freeze(["REQ-T036-TEST"]),
    unresolvedRequirementIds: Object.freeze(["REQ-T036-TEST"]),
    emittedRuntimeEventKinds: Object.freeze([])
  });
}

function openGapDossier() {
  return deriveSdlcGapDossier({
    basis: moduleBasis(),
    events: [],
    triageInput: "operator-review",
    evidenceRefs: ["event://graph-call-open"]
  });
}

test("T-036 observation, classification, and route binding remain separate carriers", () => {
  const closureRegister = closureRegisterFor(
    "REQ-T036-001: Unresolved pressure must route to lawful re-entry."
  );
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister,
    analysisRef: "analysis://t036/current"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.equal(observation.kind, "sdlc_gap_observation");
  assert.equal(observation.gapStatus, "open");
  assert.deepStrictEqual(observation.requirementPressureIds, ["REQ-T036-001"]);
  assert.deepStrictEqual(observation.requirementOpenReasonCodes, [
    "no_generated_asset_lineage"
  ]);
  assert.equal(observation.requirementTransformLineage.length, 1);
  assert.equal(
    observation.requirementTransformLineage[0].kind,
    "sdlc_requirement_transform_lineage"
  );
  assert.equal(
    observation.requirementTransformLineage[0].requirementId,
    "REQ-T036-001"
  );
  assert.equal(
    observation.requirementTransformLineage[0].immediateTransformObligationRef,
    `transform-obligation://odd-sdlc/${observation.currentEdge}/REQ-T036-001`
  );
  assert.equal(
    observation.requirementTransformLineage[0].transformLineageRef,
    `requirement-lineage://odd-sdlc/${observation.currentEdge}/REQ-T036-001`
  );
  assert.equal(
    observation.requirementTransformLineage[0].transformInputAuthorityRef,
    "requirement-authority://odd-sdlc/REQ-T036-001/An"
  );
  assert.equal(
    observation.requirementTransformLineage[0].transformOutputExpectationRef,
    `requirement-expectation://odd-sdlc/${observation.currentEdge}/REQ-T036-001/Bn`
  );
  assert.equal(observation.requirementTransformLineage[0].lineageStatus, "lineage_observed");
  assert.equal(
    observation.requirementTransformLineage[0].lineageSource,
    "closure_register_fallback"
  );
  assert.deepStrictEqual(
    observation.requirementTransformLineage[0].predecessorTransformRefs,
    []
  );
  assert.equal(observation.requirementTransformLineage[0].lineageDepth, 1);
  assert(
    observation.requirementTransformLineage[0].lineageBasisRefs.includes(
      "fixture://t036/specification/REQUIREMENTS.md"
    )
  );
  assert.deepStrictEqual(observation.emittedRuntimeEventKinds, []);

  assert.equal(classification.kind, "sdlc_triage_classification");
  assert.equal(classification.frameworkLayer, "code");
  assert.equal(classification.frameworkCondition, "open_gap");
  assert.equal(classification.processOutcome, "route_selected");

  assert.equal(route.kind, "sdlc_route_binding");
  assert.equal(route.reEntryLayer, "code");
  assert.equal(route.routeKind, "fixed_vector_repair");
  assert.equal(route.targetGraphFunction, "derive_code_surface");
  assert.equal(route.lawfulStartTarget.handle, "derive_code_surface");
  assert.equal(route.mayApplyConstitutionalChange, false);
});

test("T-004 trace-only requirement closure routes to test proof re-entry", () => {
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons([
      "behavioral_evidence_missing"
    ]),
    analysisRef: "analysis://t036/test-proof-pressure"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.equal(classification.frameworkLayer, "test");
  assert.equal(classification.frameworkCondition, "trace_only_closure");
  assert.equal(route.reEntryLayer, "test");
  assert.equal(route.targetGraphFunction, "derive_test_run_archive_surface");
});

test("T-004 requirement lineage authority failure routes upstream before code repair", () => {
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons([
      "requirement_authority_contradictory",
      "no_generated_asset_lineage"
    ]),
    analysisRef: "analysis://t036/lineage-authority-pressure"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.equal(
    observation.requirementTransformLineage[0].lineageStatus,
    "lineage_authority_failure"
  );
  assert.equal(classification.frameworkLayer, "requirements");
  assert.equal(classification.frameworkCondition, "approval_required");
  assert.equal(route.reEntryLayer, "requirements");
  assert.equal(route.targetGraphFunction, "derive_requirement_surface");
});

test("T-004 lineage records predecessor transform refs without widening edge-local closure", () => {
  const predecessor =
    "transform-obligation://odd-sdlc/derive_requirement_surface/REQ-T036-TEST";
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons(
      ["no_generated_asset_lineage"],
      [
        "fixture://t036/specification/REQUIREMENTS.md",
        predecessor
      ]
    ),
    analysisRef: "analysis://t036/nested-lineage"
  });
  const lineage = observation.requirementTransformLineage[0];
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.deepStrictEqual(lineage.predecessorTransformRefs, [predecessor]);
  assert.equal(lineage.lineageDepth, 2);
  assert.equal(lineage.lineageStatus, "lineage_observed");
  assert.equal(classification.frameworkLayer, "code");
  assert.equal(route.targetGraphFunction, "derive_code_surface");
});

test("T-004 ingress produces typed requirement-transform lineage authority", () => {
  const predecessor =
    "transform-obligation://odd-sdlc/derive_requirement_surface/REQ-T036-SEED";
  const ingress = ingressReport(
    `REQ-T036-TEST: current requirement authority. Prior transform: ${predecessor}`
  );
  const authority = ingress.requirementTransformAuthorities.find(
    (entry) => entry.requirementId === "REQ-T036-TEST"
  );
  assert(authority);
  assert.equal(authority.kind, "sdlc_requirement_transform_authority");
  assert.equal(authority.status, "current");
  assert.deepStrictEqual(authority.predecessorTransformRefs, [predecessor]);

  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons(["no_generated_asset_lineage"]),
    requirementTransformAuthorities: ingress.requirementTransformAuthorities,
    analysisRef: "analysis://t036/typed-lineage-authority"
  });
  const lineage = observation.requirementTransformLineage[0];
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.equal(lineage.lineageSource, "requirement_transform_authority");
  assert.equal(lineage.lineageStatus, "lineage_observed");
  assert.deepStrictEqual(lineage.predecessorTransformRefs, [predecessor]);
  assert.equal(lineage.lineageDepth, 2);
  assert(lineage.lineageAuthorityRefs.includes(authority.transformRef));
  assert(lineage.lineageBasisRefs.includes(authority.transformRef));
  assert.equal(classification.frameworkLayer, "code");
  assert.equal(route.targetGraphFunction, "derive_code_surface");
});

test("T-004 stale typed requirement-transform lineage routes upstream", () => {
  const staleAuthority = Object.freeze({
    kind: "sdlc_requirement_transform_authority",
    requirementId: "REQ-T036-TEST",
    transformRef:
      "requirement-transform://odd-sdlc/ingress/REQ-T036-TEST/sha256:stale",
    predecessorTransformRefs: Object.freeze([
      "requirement-transform://odd-sdlc/ingress/REQ-T036-SEED/sha256:seed"
    ]),
    transformInputAuthorityRef: "source-authority://odd-sdlc/REQ-T036-TEST/stale",
    transformOutputAuthorityRef:
      "requirement-authority://odd-sdlc/REQ-T036-TEST/An",
    sourceInputUris: Object.freeze(["fixture://t036/specification/REQUIREMENTS.md"]),
    evidenceRefs: Object.freeze([
      "requirement-transform://odd-sdlc/ingress/REQ-T036-TEST/sha256:stale"
    ]),
    status: "stale"
  });
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons(["no_generated_asset_lineage"]),
    requirementTransformAuthorities: Object.freeze([staleAuthority]),
    analysisRef: "analysis://t036/stale-typed-lineage-authority"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.equal(
    observation.requirementTransformLineage[0].lineageSource,
    "requirement_transform_authority"
  );
  assert.equal(
    observation.requirementTransformLineage[0].lineageStatus,
    "lineage_authority_failure"
  );
  assert.equal(classification.frameworkLayer, "requirements");
  assert.equal(route.targetGraphFunction, "derive_requirement_surface");
});

test("T-004 design pressure routes to design before code repair", () => {
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons([
      "design_surface_missing",
      "no_generated_asset_lineage"
    ]),
    analysisRef: "analysis://t036/design-pressure"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });

  assert.equal(classification.frameworkLayer, "design");
  assert.equal(classification.frameworkCondition, "open_gap");
  assert.equal(route.reEntryLayer, "design");
  assert.equal(route.routeKind, "fixed_vector_repair");
  assert.equal(route.targetGraphFunction, "derive_design_surface");
});

test("T-004 constitutional authority failures route to gated repricing", () => {
  const cases = [
    {
      reason: "intent_authority_contradictory",
      layer: "intent"
    },
    {
      reason: "goals_surface_missing",
      layer: "goals"
    },
    {
      reason: "declared_product_target_missing",
      layer: "product"
    }
  ];

  for (const item of cases) {
    const observation = observeSdlcGapPressure({
      gapDossier: openGapDossier(),
      closureRegister: closureRegisterWithOpenReasons([
        item.reason,
        "no_generated_asset_lineage"
      ]),
      analysisRef: `analysis://t036/${item.layer}-reprice`
    });
    const classification = classifySdlcGapObservation({ observation });
    const route = bindSdlcRoute({ observation, classification });

    assert.equal(classification.frameworkLayer, item.layer);
    assert.equal(classification.frameworkCondition, "approval_required");
    assert.equal(classification.processOutcome, "constitutional_reprice_required");
    assert.equal(route.reEntryLayer, item.layer);
    assert.equal(route.routeKind, "constitutional_reprice");
    assert.equal(route.targetGraphFunction, "propose_constitutional_repricing");
    assert.equal(route.lawfulStartTarget.handle, "propose_constitutional_repricing");
    assert.equal(route.mayApplyConstitutionalChange, false);
  }
});

test("T-057 triage classification and route policy are declared data", () => {
  assert.deepStrictEqual(
    SDLC_TRIAGE_CLASSIFICATION_POLICY.map((entry) => entry.condition),
    [
      "converged_without_requirement_pressure",
      "intent_authority_failure",
      "goals_authority_failure",
      "product_authority_failure",
      "requirement_lineage_authority_failure",
      "design_pressure_present",
      "code_pressure_present",
      "test_pressure_present",
      "requirement_pressure_present",
      "open_or_partial_gap",
      "fallback"
    ]
  );
  assert.deepStrictEqual(
    SDLC_TRIAGE_ROUTE_POLICY.map((entry) => entry.routePolicy),
    [
      "gap_retired",
      "intent_reprice",
      "goals_reprice",
      "product_reprice",
      "design_repair",
      "code_repair",
      "test_repair",
      "requirements_pressure",
      "default_repair"
    ]
  );
  assert(
    SDLC_TRIAGE_ROUTE_POLICY.some(
      (entry) =>
        entry.routePolicy === "requirements_pressure" &&
        entry.targetStrategy === "derive_requirement_surface"
    )
  );
});

test("T-004 non-constitutional classifications cannot author repricing proposals", () => {
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterFor("REQ-T036-002: Intent may need renewal."),
    analysisRef: "analysis://t036/intent-pressure"
  });
  const classification = classifySdlcGapObservation({
    observation,
    ambiguityCarried: true
  });

  assert.equal(classification.processOutcome, "route_selected");
  assert.throws(
    () =>
      proposeSdlcConstitutionalRepricing({
        classification,
        targetSurface: "INTENT.md",
        proposedChangeSummary: "Clarify whether the current product intent admits this route."
      }),
    /not constitutional_reprice_required/u
  );
});

test("T-036 constitutional repricing is explicit and never applied by triage", () => {
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterWithOpenReasons([
      "intent_authority_contradictory"
    ]),
    analysisRef: "analysis://t036/intent-pressure"
  });
  const classification = classifySdlcGapObservation({
    observation,
    ambiguityCarried: true
  });
  const proposal = proposeSdlcConstitutionalRepricing({
    classification,
    targetSurface: "INTENT.md",
    proposedChangeSummary: "Clarify whether the current product intent admits this route."
  });

  assert.equal(classification.processOutcome, "constitutional_reprice_required");
  assert.equal(proposal.kind, "sdlc_constitutional_repricing_proposal");
  assert.equal(proposal.approvalRequired, true);
  assert.equal(proposal.approvalOutcome, null);
  assert.equal(proposal.proposalApplied, false);
  assert.deepStrictEqual(proposal.emittedRuntimeEventKinds, []);
});

test("T-036 ticket routing is a TICKET_METHOD proposal and does not write process state", () => {
  const observation = observeSdlcGapPressure({
    gapDossier: openGapDossier(),
    closureRegister: closureRegisterFor("REQ-T036-003: Ticket route remains governed."),
    analysisRef: "analysis://t036/ticket-route"
  });
  const classification = classifySdlcGapObservation({ observation });
  const route = bindSdlcRoute({ observation, classification });
  const workItemRoute = routeSdlcTicketWorkItem({
    routeBinding: route,
    workItemRef: "ticket://T-NEW",
    lawfulReEntryPoint: "requirement_reprice"
  });

  assert.equal(workItemRoute.kind, "sdlc_ticket_work_item_route");
  assert.equal(workItemRoute.ticketAuthority, "TICKET_METHOD");
  assert.equal(workItemRoute.ticketStatus, "proposed");
  assert.equal(workItemRoute.writesTicket, false);
});

test("T-036 loopback retirement is visible and keeps open gaps open", () => {
  const closureRegister = closureRegisterFor("");
  const observation = observeSdlcGapPressure({
    gapDossier: {
      kind: "sdlc_gap_dossier",
      readOnly: true,
      choosesNextTraversal: false,
      edge: null,
      status: "converged",
      evidenceRefs: ["event://all-vectors-closed"],
      triageInput: "loopback",
      nextLawfulActions: []
    },
    closureRegister,
    analysisRef: "analysis://t036/loopback"
  });
  const retirement = retireSdlcGapAfterLoopback({
    observation,
    closureRegister,
    evidenceRefs: ["event://all-vectors-closed"]
  });

  assert.equal(retirement.kind, "sdlc_gap_retirement");
  assert.equal(retirement.status, "gap_retired");
  assert.deepStrictEqual(retirement.unresolvedRequirementIds, []);
  assert.deepStrictEqual(retirement.emittedRuntimeEventKinds, []);
});

test("T-036 triage graph functions are published and queryable", () => {
  const catalog = constructSdlcGraphFunctionCatalog();
  const module = constructSdlcGtlModule();
  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport: ingressReport("")
  });

  assert(catalog.functions.some((entry) => entry.name === "observe_gap_pressure"));
  assert(catalog.functions.some((entry) => entry.name === "bind_gap_route"));
  assert(
    queryDomain.graphFunctions.some(
      (entry) => entry.name === "propose_constitutional_repricing"
    )
  );
  assert(
    queryDomain.assetOwnership.some(
      (entry) => entry.assetType === "ticket_work_item_route_surface"
    )
  );
});
