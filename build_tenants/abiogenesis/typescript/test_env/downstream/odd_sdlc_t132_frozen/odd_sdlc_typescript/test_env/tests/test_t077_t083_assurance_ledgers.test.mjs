// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-030
// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-055
// Validates: T-077
// Validates: T-078
// Validates: T-079
// Validates: T-080
// Validates: T-081
// Validates: T-082
// Validates: T-083
// Validates: T-085

import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveAmbiguityAssuranceLedger,
  deriveCapabilityAssuranceLedger,
  deriveMaterializationAssuranceLedger,
  deriveObligationCarryAssuranceLedger,
  deriveRequirementFulfillmentAssuranceLedger,
  deriveSemanticConvergenceAssuranceLedger,
  deriveShallowRealizationAssuranceLedger
} from "../../build/semantic/code/src/index.js";

function manifest(input = {}) {
  return {
    kind: "sdlc_worker_handoff_manifest",
    reportFile: "proof://worker-report",
    productMaterialization: {
      kind: "sdlc_product_materialization_contract",
      required: input.materializationRequired ?? true,
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      tenantRoot: "/workspace/build_tenants/scala_spark",
      relativePathBasis: "tenant_root",
      declaredModuleNames: [],
      buildExecutionContract: "sbt clean assembly",
      testExecutionContract: "sbt test",
      manifestFile: "proof://materialization-manifest",
      requiredRoles: ["source"]
    },
    retryContext: input.retryContext ?? {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: []
    }
  };
}

function postflight(blockingReasons) {
  return {
    kind: "sdlc_operator_postflight_result",
    status: blockingReasons.length === 0 ? "passed" : "blocked",
    blockingReasons,
    blockingReasonCarriers: [],
    evidenceRefs: ["proof://postflight"]
  };
}

function workerReport(input = {}) {
  return {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_code_surface",
    targetAssetType: "code_surface",
    outputFile: "proof://code-surface",
    digest: "sha256:code",
    summary: "result",
    unresolvedReasons: [],
    materializedFiles: input.materializedFiles ?? []
  };
}

function closureRegister(entries) {
  return {
    kind: "sdlc_requirement_closure_register",
    entries,
    fulfilledRequirementIds: entries
      .filter((entry) => entry.fulfillmentStatus === "fulfilled")
      .map((entry) => entry.requirementId),
    carriedForwardRequirementIds: entries
      .filter((entry) => entry.carryStatus === "carried_forward")
      .map((entry) => entry.requirementId),
    unresolvedRequirementIds: entries
      .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
      .map((entry) => entry.requirementId),
    emittedRuntimeEventKinds: []
  };
}

function requirementEntry(input = {}) {
  return {
    kind: "sdlc_requirement_closure_entry",
    requirementId: input.requirementId ?? "REQ-DM-001",
    sourceInputUris: input.sourceInputUris ?? ["fixture://requirements"],
    assetIds: input.assetIds ?? ["asset://code"],
    producedByGraphFunctions: input.producedByGraphFunctions ?? [
      "derive_code_surface"
    ],
    proofKinds: input.proofKinds ?? ["behavioral_test"],
    authorityVerbs: input.authorityVerbs ?? ["validates"],
    evidenceRefs: input.evidenceRefs ?? ["proof://requirement"],
    traceabilityStatus: input.traceabilityStatus ?? "behavioral_evidence",
    fulfillmentStatus: input.fulfillmentStatus ?? "fulfilled",
    carryStatus: input.carryStatus ?? "fulfilled",
    openReasons: input.openReasons ?? []
  };
}

function gapDossier(reasons) {
  return {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_code_surface",
    vectorIndex: 11,
    targetAssetType: "code_surface",
    reasons: reasons.map((reason) => ({
      kind: "sdlc_postflight_gap_reason",
      reason,
      reasonClass: "contract_violation"
    })),
    evidenceRefs: ["proof://gap"],
    priorManifestId: "proof://manifest",
    currentGapDossierRef: `proof://gap/${reasons.join("-")}`,
    retryEligible: true,
    nextLawfulActions: ["retry_same_edge"]
  };
}

test("T-077 materialization ledger rejects path-basis contract drift", () => {
  const ledger = deriveMaterializationAssuranceLedger({
    manifest: manifest(),
    report: workerReport(),
    postflight: postflight(["materialized_product_relative_path_mismatch"])
  });

  assert.equal(ledger.dimension, "materialization");
  assert.equal(ledger.verdict, "blocked");
  assert.deepStrictEqual(
    ledger.reasons.map((reason) => reason.code),
    ["materialized_product_relative_path_mismatch"]
  );
});

test("T-077 materialization ledger covers closure, blocked, and open-gap states", () => {
  const closed = deriveMaterializationAssuranceLedger({
    manifest: manifest(),
    report: workerReport({
      materializedFiles: [
        {
          kind: "sdlc_materialized_product_file",
          role: "source",
          relativePath: "src/main/scala/Mapper.scala",
          absolutePath: "/workspace/build_tenants/scala_spark/src/main/scala/Mapper.scala",
          digest: "sha256:mapper",
          byteCount: 32
        }
      ]
    }),
    postflight: postflight([])
  });
  const notApplicable = deriveMaterializationAssuranceLedger({
    manifest: manifest({ materializationRequired: false }),
    report: null,
    postflight: null
  });
  const missingReport = deriveMaterializationAssuranceLedger({
    manifest: manifest(),
    report: null,
    postflight: null
  });
  const outsideRoot = deriveMaterializationAssuranceLedger({
    manifest: manifest(),
    report: workerReport(),
    postflight: postflight(["materialized_product_file_outside_tenant_root"])
  });
  const markdownOnly = deriveMaterializationAssuranceLedger({
    manifest: manifest(),
    report: workerReport(),
    postflight: postflight(["materialized_product_files_missing"])
  });

  assert.equal(closed.verdict, "satisfied");
  assert.equal(notApplicable.verdict, "not_applicable");
  assert.equal(missingReport.verdict, "blocked");
  assert.deepStrictEqual(missingReport.reasons.map((reason) => reason.code), [
    "materialization_report_missing"
  ]);
  assert.equal(outsideRoot.verdict, "blocked");
  assert.equal(outsideRoot.reasons[0].lawfulReentryPoint, "repair_worker_output");
  assert.equal(markdownOnly.verdict, "open_gap");
});

test("T-078 semantic convergence ledger distinguishes restatement from coverage", () => {
  const open = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://mapper/lineage"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "target://mapper/lineage",
        status: "restated",
        evidenceRefs: ["proof://summary"]
      }
    ]
  });
  const closed = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://mapper/lineage"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "target://mapper/lineage",
        status: "covered",
        evidenceRefs: ["proof://source"]
      }
    ]
  });

  assert.equal(open.verdict, "open_gap");
  assert.equal(closed.verdict, "satisfied");
});

test("T-078 semantic convergence ledger covers missing, insufficient, and contradictory meaning", () => {
  const missingTarget = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: [],
    claims: []
  });
  const missingClaim = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://mapper/lineage"],
    claims: []
  });
  const contradicted = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://mapper/lineage"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "target://mapper/lineage",
        status: "contradicted",
        evidenceRefs: ["proof://semantic-conflict"]
      }
    ]
  });

  assert.equal(missingTarget.verdict, "reprice_required");
  assert.equal(missingClaim.verdict, "open_gap");
  assert.deepStrictEqual(missingClaim.reasons.map((reason) => reason.code), [
    "semantic_claim_missing:target://mapper/lineage"
  ]);
  assert.equal(contradicted.verdict, "reprice_required");
  assert.equal(contradicted.reasons[0].lawfulReentryPoint, "design_reframe");
});

test("T-079 obligation carry ledger rejects dropped retry obligations", () => {
  const prior = gapDossier(["materialized_product_relative_path_mismatch"]);
  const dropped = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: null
  });
  const carried = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: prior
  });

  assert.equal(dropped.verdict, "open_gap");
  assert.deepStrictEqual(dropped.reasons.map((reason) => reason.code), [
    "dropped_prior_obligation:materialized_product_relative_path_mismatch"
  ]);
  assert.equal(carried.verdict, "satisfied");
});

test("T-079 obligation carry ledger accepts projected current reason frontier", () => {
  const prior = gapDossier([
    "REQ-ACC-001:obligation_partial",
    "dropped_prior_obligation:REQ-ACC-001:obligation_partial",
    "obligation_assessment_open:prior_gap:dropped_prior_obligation:REQ-ACC-001:obligation_partial"
  ]);
  const carriedByProjection = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: null,
    currentReasonCodes: ["REQ-ACC-001:obligation_partial"]
  });
  const resolvedByProjection = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: null,
    closedReasonCodes: ["REQ-ACC-001:obligation_partial"],
    currentReasonCodes: []
  });

  assert.equal(carriedByProjection.verdict, "satisfied");
  assert.deepStrictEqual(carriedByProjection.reasons, []);
  assert.equal(resolvedByProjection.verdict, "satisfied");
});

test("T-079 obligation carry ledger covers omitted, closed, blocked, and reprice states", () => {
  const prior = gapDossier(["materialized_product_relative_path_mismatch"]);
  const omitted = deriveObligationCarryAssuranceLedger({
    manifest: manifest(),
    expectedPriorGapDossiers: [prior],
    currentGapDossier: null
  });
  const closed = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: null,
    closedReasonCodes: ["materialized_product_relative_path_mismatch"]
  });
  const contradictory = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: null,
    contradictoryReasonCodes: ["materialized_product_relative_path_mismatch"]
  });
  const stale = deriveObligationCarryAssuranceLedger({
    manifest: manifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: prior,
    staleReasonCodes: ["materialized_product_relative_path_mismatch"]
  });

  assert.equal(omitted.verdict, "blocked");
  assert.deepStrictEqual(omitted.reasons.map((reason) => reason.code), [
    "missing_prior_obligation_in_handoff:materialized_product_relative_path_mismatch"
  ]);
  assert.equal(closed.verdict, "satisfied");
  assert.equal(contradictory.verdict, "blocked");
  assert.equal(stale.verdict, "reprice_required");
});

test("T-080 requirement fulfillment ledger blocks missing trace basis and carries open requirements", () => {
  const blocked = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: null,
    requiredRequirementIds: ["REQ-DM-001"]
  });
  const open = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: closureRegister([
      requirementEntry({
        assetIds: [],
        producedByGraphFunctions: [],
        proofKinds: [],
        authorityVerbs: [],
        evidenceRefs: [],
        traceabilityStatus: "absent",
        fulfillmentStatus: "missing",
        carryStatus: "carried_forward",
        openReasons: ["no_generated_asset_lineage"]
      })
    ])
  });

  assert.equal(blocked.verdict, "blocked");
  assert.equal(open.verdict, "open_gap");
  assert.deepStrictEqual(open.carryForwardObligationRefs, [
    "requirement://REQ-DM-001"
  ]);
});

test("T-080 requirement fulfillment ledger covers satisfied, outside-authority, and repricing states", () => {
  const satisfied = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: closureRegister([requirementEntry()])
  });
  const outsideAuthority = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: closureRegister([
      requirementEntry(),
      requirementEntry({
        requirementId: "REQ-FOREIGN-001",
        evidenceRefs: ["proof://foreign"]
      })
    ]),
    requiredRequirementIds: ["REQ-DM-001"],
    admittedRequirementIds: ["REQ-DM-001"]
  });
  const reprice = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: closureRegister([requirementEntry()]),
    requiredRequirementIds: ["REQ-DM-001"],
    ambiguousRequirementIds: ["REQ-DM-001"],
    contradictoryRequirementIds: ["REQ-DM-002"]
  });

  assert.equal(satisfied.verdict, "satisfied");
  assert.equal(outsideAuthority.verdict, "blocked");
  assert.deepStrictEqual(outsideAuthority.reasons.map((reason) => reason.code), [
    "requirement_outside_edge_authority:REQ-FOREIGN-001"
  ]);
  assert.equal(reprice.verdict, "reprice_required");
  assert.deepStrictEqual(reprice.reasons.map((reason) => reason.code), [
    "ambiguous_requirement_authority:REQ-DM-001",
    "contradictory_requirement_authority:REQ-DM-002"
  ]);
});

test("T-081 ambiguity ledger sends authority ambiguity to repricing", () => {
  const ledger = deriveAmbiguityAssuranceLedger({
    findings: [
      {
        kind: "sdlc_ambiguity_finding",
        ambiguityKind: "target_asset_identity",
        code: "target_asset_identity_ambiguous",
        message: "Target asset identity is unclear.",
        evidenceRefs: ["proof://intent"]
      }
    ]
  });

  assert.equal(ledger.verdict, "reprice_required");
  assert.equal(ledger.reasons[0].lawfulReentryPoint, "requirement_reprice");
});

test("T-081 ambiguity ledger distinguishes blocked evidence from repairable evidence", () => {
  const blocked = deriveAmbiguityAssuranceLedger({
    findings: [
      {
        kind: "sdlc_ambiguity_finding",
        ambiguityKind: "candidate_evidence",
        code: "required_evidence_missing",
        message: "Required evidence is absent.",
        evidenceRefs: ["proof://postflight"],
        resolution: "blocked"
      }
    ]
  });
  const repairable = deriveAmbiguityAssuranceLedger({
    findings: [
      {
        kind: "sdlc_ambiguity_finding",
        ambiguityKind: "candidate_evidence",
        code: "candidate_evidence_incomplete",
        message: "Candidate evidence can be repaired on the same edge.",
        evidenceRefs: ["proof://postflight"],
        resolution: "repairable"
      }
    ]
  });

  assert.equal(blocked.verdict, "blocked");
  assert.equal(blocked.reasons[0].lawfulReentryPoint, "operator_blocked");
  assert.equal(repairable.verdict, "open_gap");
  assert.equal(repairable.reasons[0].lawfulReentryPoint, "same_edge_retry");
});

test("T-082 capability ledger rejects missing and shallow required capabilities", () => {
  const requiredCapabilities = [
    {
      kind: "sdlc_required_capability",
      capabilityId: "lineage_preservation",
      evidenceContract: "lineage links source and target fields",
      requirementRefs: ["REQ-LIN-001"]
    },
    {
      kind: "sdlc_required_capability",
      capabilityId: "type_resolution",
      evidenceContract: "types are resolved before mapping",
      requirementRefs: ["REQ-TYP-001"]
    }
  ];
  const ledger = deriveCapabilityAssuranceLedger({
    requiredCapabilities,
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: ["file://Lineage.scala"],
        substantive: false
      }
    ]
  });

  assert.equal(ledger.verdict, "open_gap");
  assert.deepStrictEqual(
    ledger.reasons.map((reason) => reason.code),
    ["capability_missing:type_resolution", "capability_shallow:lineage_preservation"]
  );
});

test("T-082 capability ledger covers missing inventory, evidence quality, and authority contradiction", () => {
  const requiredCapabilities = [
    {
      kind: "sdlc_required_capability",
      capabilityId: "lineage_preservation",
      evidenceContract: "lineage links source and target fields",
      requirementRefs: ["REQ-LIN-001"]
    },
    {
      kind: "sdlc_required_capability",
      capabilityId: "type_resolution",
      evidenceContract: "types are resolved before mapping",
      requirementRefs: ["REQ-TYP-001"]
    }
  ];
  const missingInventory = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [],
    observedCapabilities: [],
    inventoryRequired: true
  });
  const shallowEvidence = deriveCapabilityAssuranceLedger({
    requiredCapabilities,
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: ["file://Lineage.scala"],
        substantive: false,
        evidenceQuality: "placeholder"
      },
      {
        kind: "sdlc_observed_capability",
        capabilityId: "type_resolution",
        evidenceRefs: ["file://Types.scala"],
        substantive: false,
        evidenceQuality: "identity_only"
      }
    ]
  });
  const contradiction = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [requiredCapabilities[0]],
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: ["file://Lineage.scala"],
        substantive: true
      }
    ],
    contradictoryCapabilityIds: ["lineage_preservation"]
  });

  assert.equal(missingInventory.verdict, "blocked");
  assert.equal(shallowEvidence.verdict, "open_gap");
  assert.deepStrictEqual(shallowEvidence.reasons.map((reason) => reason.code), [
    "capability_placeholder:lineage_preservation",
    "capability_identity_only:type_resolution"
  ]);
  assert.equal(contradiction.verdict, "reprice_required");
});

test("T-083 shallow realization ledger rejects placeholder, identity, and trace-only proof", () => {
  const ledger = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: true,
    executableProofRequired: true,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://Mapper.scala",
        content: "object Mapper { def map(input: String) = input }"
      },
      {
        kind: "sdlc_realization_text_surface",
        role: "test",
        ref: "file://MapperSpec.scala",
        content: "// Validates: REQ-LIN-001"
      }
    ]
  });
  const closed = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: true,
    executableProofRequired: true,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://Mapper.scala",
        content: "object Mapper { def map(input: String) = input.reverse }"
      },
      {
        kind: "sdlc_realization_text_surface",
        role: "test",
        ref: "file://MapperSpec.scala",
        content: "test(\"mapper\") { assert(Mapper.map(\"ab\") == \"ba\") }"
      }
    ]
  });

  assert.equal(ledger.verdict, "open_gap");
  assert.deepStrictEqual(
    ledger.reasons.map((reason) => reason.code),
    [
      "identity_only_surface:file://Mapper.scala",
      "trace_only_test_surface:file://MapperSpec.scala"
    ]
  );
  assert.equal(closed.verdict, "satisfied");
});

test("T-083 shallow realization ledger rejects constant-success logic", () => {
  const ledger = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: false,
    executableProofRequired: true,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://AlwaysPass.scala",
        content: "object AlwaysPass { def ok(): Boolean = { return true } }"
      },
      {
        kind: "sdlc_realization_text_surface",
        role: "test",
        ref: "file://AlwaysPassSpec.scala",
        content: "test(\"always pass\") { assert(true) }"
      }
    ]
  });

  assert.equal(ledger.verdict, "open_gap");
  assert.deepStrictEqual(ledger.reasons.map((reason) => reason.code), [
    "constant_success_surface:file://AlwaysPass.scala",
    "constant_success_surface:file://AlwaysPassSpec.scala"
  ]);
});

test("T-083 shallow realization ledger does not treat Scala default true params as constant success", () => {
  const ledger = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: false,
    executableProofRequired: false,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://DataProfiler.scala",
        content: [
          "class DataProfiler {",
          "  def profileDryRun(ds: Dataset[Row], dryRun: Boolean = true): DatasetProfile =",
          "    if (dryRun) profile(ds.limit(10000)) else profile(ds)",
          "}"
        ].join("\n")
      }
    ]
  });

  assert.equal(ledger.verdict, "satisfied");
});

test("T-083 shallow realization ledger admits guarded invariant success paths", () => {
  const ledger = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: false,
    executableProofRequired: false,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://FidelityContract.scala",
        content: [
          "object FidelityContract {",
          "  def evaluate(actualCount: Long, expectedCount: Long): Boolean = {",
          "    if (actualCount == 0L && expectedCount == 0L) return true",
          "    if (expectedCount == 0L) return false",
          "    val ratio = actualCount.toDouble / expectedCount.toDouble",
          "    ratio >= 0.95 && ratio <= 1.05",
          "  }",
          "}"
        ].join("\n")
      }
    ]
  });

  assert.equal(ledger.verdict, "satisfied");
});

test("T-083 shallow realization ledger admits test double return values", () => {
  const ledger = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: false,
    executableProofRequired: true,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "test",
        ref: "file://Hello.test.js",
        content: [
          "test('captures stdout', () => {",
          "  process.stdout.write = () => true;",
          "  assert.equal(render(), 'Hello, world!');",
          "});"
        ].join("\n")
      }
    ]
  });

  assert.equal(ledger.verdict, "satisfied");
});
