// Validates: T-280; REQ-L-GTL3-CONTRACT-LAW-API One Surface.

import assert from "node:assert/strict";
import test from "node:test";

import {
  ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES,
  ONE_SURFACE_RESULT_CONTRACT_FAMILY,
  admitEvaluateActionResult,
  admitOneSurfaceResultValue,
  compileOneSurfaceGtlProgramApplication,
  constructAdmittedOneSurfaceAuthorityResult,
  constructConstructionGraphActionInvokedEvent,
  constructEdgeAssuranceContract,
  constructOneSurfaceAuthorityInputBasis,
  constructOneSurfaceTypedRefusal,
  constructTargetObligationBinding,
  oneSurfaceEvaluateActionInputBasis,
  resolveEdgeAssuranceContract,
  typecheckGtlProgram
} from "../../build/semantic/code/src/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

const T280_ACTION_AUTHORITY_DIGEST = stableSha256Digest({
  authority: "t280-action"
});
const T280_ACTION_INPUT_DIGEST = stableSha256Digest({ input: "t280-action" });
const T280_ACTION_AUTHORITY_SNAPSHOT_REF =
  "authority-snapshot://t280/action/evidence";

function candidate(selectedActionRef = "action://t280/normalize") {
  return Object.freeze({
    kind: "construction_intent_candidate",
    candidateId: "candidate://t280/normalize",
    episodeId: "episode://t280",
    rank: 0,
    valueScore: 1,
    priorityScore: 1,
    affectAdjustmentRefs: Object.freeze([]),
    selectedActionRef,
    selectedBindingRef: "binding://t280/normalize",
    selectedOutcomeRef: "outcome://t280/normalized",
    targetGraphFunctionRef: "graph-function://t280/normalize",
    targetVectorRef: null,
    targetReentryRef: null,
    inputAssetRefs: Object.freeze(["asset://t280/raw"]),
    expectedOutputAssetRefs: Object.freeze(["asset://t280/normalized"]),
    gapRefs: Object.freeze(["gap://t280/normalize"]),
    obligationRefs: Object.freeze(["obligation://t280/normalize"]),
    lawfulBasisRefs: Object.freeze(["authority://t280/program"]),
    expectedDelta: "normalized observation appears",
    progressCondition: "normalization evidence admitted",
    stopCondition: "normalization obligation closes",
    escalationCondition: "normalization remains blocked",
    rejectedAlternativeRefs: Object.freeze([]),
    rationale: "highest admitted priority",
    hiddenConfigRefs: Object.freeze([]),
    runtimeEventPayloadRefs: Object.freeze([]),
    fdSemanticCanonicalizationRequired: false
  });
}

function nativeEvaluateNextResult({
  actionRef = null,
  actionVariant = "no_action",
  intentCandidate = null
} = {}) {
  const nextBasisValue = Object.freeze({
    basisKind: "initial_selection",
    causalRefs: Object.freeze(["authority://t280/native-next"])
  });
  const nextBasis = Object.freeze({
    kind: "next_action_basis",
    ...nextBasisValue,
    basisDigest: stableSha256Digest(nextBasisValue)
  });
  const priorityProjection = Object.freeze({
    kind: "construction_priority_projection",
    projectionRef: "priority://t280/native-next",
    episodeId: "episode://t280",
    bindingProjectionRef: "binding-projection://t280/native-next",
    prioritySchemeRef: "priority-scheme://t280/native-next",
    affectPolicyRefs: Object.freeze([]),
    affectAdjustments: Object.freeze([]),
    rows: Object.freeze([])
  });
  const selected = actionRef === null
    ? null
    : constructTargetObligationBinding({
      snapshotRef: "observation://t280/native-next",
      snapshotDigest: stableSha256Digest({ observation: "t280/native-next" }),
      sourceBindingRef: "binding://t280/normalize",
      pressureRef: "pressure://t280/native-next",
      actionRef,
      targetOutcomeRef: "outcome://t280/normalized",
      obligationRefs: ["obligation://t280/normalize"],
      requiredEvidenceAuthorityRefs: ["authority://t280/normalize"]
    });
  const disposition = actionRef === null
    ? Object.freeze({
      variant: "no_action",
      actionKind: null,
      actionRef: null,
      targetRef: null
    })
    : actionVariant === "fh_outcome"
      ? Object.freeze({
        variant: "fh_outcome",
        actionKind: "open_fh_gate",
        actionRef,
        targetRef: null
      })
      : Object.freeze({
        variant: "callable_member_action",
        actionKind: "invoke_graph_function",
        actionRef,
        targetRef: "graph-function://t280/normalize"
      });
  return Object.freeze({
    targetBindings: Object.freeze(selected === null ? [] : [selected]),
    priorityProjection,
    nextActionProjection: Object.freeze({
      nextBasis,
      admittedProgram: Object.freeze({
        ref: "gtl-program://t280/native-next",
        digest: stableSha256Digest({ program: "t280/native-next" })
      }),
      catalogView: Object.freeze({
        ref: "catalog-view://t280/native-next",
        digest: stableSha256Digest({ catalog: "t280/native-next" })
      }),
      observationRef: "observation://t280/native-next",
      currentObservationRef: "current-observation://t280/native-next",
      currentObservationDigest: stableSha256Digest({
        currentObservation: "t280/native-next"
      }),
      actionCatalogRef: "action-catalog://t280/native-next",
      bindingProjectionRef: priorityProjection.bindingProjectionRef,
      priorityProjectionRef: priorityProjection.projectionRef,
      selectedBindingRef: selected?.sourceBindingRef ?? null,
      selectedOutcomeRef: selected?.targetOutcomeRef ?? null,
      intentCandidate,
      disposition
    })
  });
}

function authorityResultWithInputDigest(result, inputDigest) {
  return constructAdmittedOneSurfaceAuthorityResult({
    functionKind: result.functionKind,
    stageAuthorityRef: result.stageAuthorityRef,
    stageAuthorityDigest: result.stageAuthorityDigest,
    replayBindingRef: result.replayBindingRef,
    replayBindingDigest: result.replayBindingDigest,
    cCallRef: result.cCallRef,
    authoritySnapshotRef: result.authoritySnapshotRef,
    inputDigest,
    admittedOutput: Object.freeze({
      ...result.admittedOutput,
      inputDigest
    }),
    targetCarrierValidationRef: result.targetCarrierValidationRef,
    decodedValueDigest: result.decodedValueDigest,
    decodedValue: result.decodedValue
  });
}

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

function compileFixture(fixture = scenario09OneSurfaceProgramFixture()) {
  return compileOneSurfaceGtlProgramApplication({
    gtlProgram: fixture.gtlProgram,
    stageAuthorities: stageAuthorities(fixture),
    recursePlan: fixture.recursePlan
  });
}

test("T-280 owns one exact four-member result family", () => {
  assert.deepEqual(
    Object.keys(ONE_SURFACE_RESULT_CONTRACT_FAMILY),
    ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES
  );
  assert.equal(
    new Set(Object.values(ONE_SURFACE_RESULT_CONTRACT_FAMILY)
      .map((row) => row.schemaRef)).size,
    4
  );
  assert.deepEqual(
    admitOneSurfaceResultValue("synthesize_model", {
      desiredAssetRefs: ["asset://t280/desired"],
      knownAssetRefs: ["asset://t280/known"]
    }),
    {
      desiredAssetRefs: ["asset://t280/desired"],
      knownAssetRefs: ["asset://t280/known"]
    }
  );
  assert.throws(
    () => admitOneSurfaceResultValue("synthesize_model", {
      desiredAssetRefs: ["asset://t280/desired"],
      knownAssetRefs: [],
      hiddenController: true
    }),
    /OneSurfaceResult\.synthesize_model/u
  );
});

test("T-280 authority input bases reject duplicate coordinates", () => {
  assert.throws(
    () => constructOneSurfaceAuthorityInputBasis({
      functionKind: "synthesize_model",
      inputRefs: ["authority://t280/duplicate", "authority://t280/duplicate"],
      inputValue: Object.freeze({ source: "duplicate-coordinate" })
    }),
    /inputRefs must not contain duplicates/u
  );
});

test("T-280 evaluate-next native admission preserves the three constitutional shapes", () => {
  const noAction = nativeEvaluateNextResult();
  assert.deepEqual(
    admitOneSurfaceResultValue("evaluate_next", noAction),
    noAction
  );
  const fhAction = nativeEvaluateNextResult({
    actionRef: "action://t280/open-fh",
    actionVariant: "fh_outcome"
  });
  assert.deepEqual(
    admitOneSurfaceResultValue("evaluate_next", fhAction),
    fhAction
  );
  const effectAction = nativeEvaluateNextResult({
    actionRef: "action://t280/normalize",
    intentCandidate: candidate()
  });
  assert.deepEqual(
    admitOneSurfaceResultValue("evaluate_next", effectAction)
      .nextActionProjection.intentCandidate,
    candidate()
  );
  assert.throws(
    () => admitOneSurfaceResultValue("evaluate_next", Object.freeze({
      ...effectAction,
      nextActionProjection: Object.freeze({
        ...effectAction.nextActionProjection,
        disposition: Object.freeze({
          ...effectAction.nextActionProjection.disposition,
          actionRef: "action://t280/other"
        })
      })
    })),
    /intentCandidate must identify the selected disposition action/u
  );
  assert.throws(
    () => admitOneSurfaceResultValue("evaluate_next", Object.freeze({
      ...noAction,
      nextActionProjection: Object.freeze({
        ...noAction.nextActionProjection,
        intentCandidate: candidate()
      })
    })),
    /intentCandidate must identify the selected disposition action/u
  );
});

test("T-280 typed refusals are sealed and never masquerade as success", () => {
  const refusal = constructOneSurfaceTypedRefusal({
    functionKind: "evaluate_next",
    judgment: "blocked",
    reasonRefs: ["reason://t280/no-lawful-action"]
  });
  assert.equal(refusal.kind, "one_surface_typed_refusal");
  assert.equal(refusal.functionKind, "evaluate_next");
  assert.equal(refusal.judgment, "blocked");
  assert.match(refusal.refusalDigest, /^sha256:[a-f0-9]{64}$/u);
});

test("T-280 lab program is source-valid while runtime startup remains separately blocked", () => {
  const fixture = scenario09OneSurfaceProgramFixture();
  const report = typecheckGtlProgram(fixture.gtlProgram);
  assert.equal(report.passed, true, JSON.stringify(report.issues, null, 2));
  assert.deepEqual(
    fixture.compiled.map((row) => row.sourceInput.outcome.status),
    [
      "published_startup_blocked",
      "published_startup_blocked",
      "published_startup_blocked",
      "published_startup_blocked"
    ]
  );
  assert.equal(
    fixture.callableCompiled.sourceInput.outcome.status,
    "published_startup_blocked"
  );
});

test("T-280 compiler derives native schemas and retains only the external AF-15 gap", async () => {
  const result = await compileFixture();
  assert.equal(result.status, "semantic_not_realized");
  assert.notEqual(result.authorityProgram, null);
  assert.equal(result.authorityProgram.runtimeAddressable, false);
  assert.equal(result.authorityProgram.effectsPermitted, false);
  assert.equal(result.authorityProgram.stages.length, 4);
  assert(result.authorityProgram.stages.every((stage) =>
    /^sha256:[a-f0-9]{64}$/u.test(stage.nativeResultSchema.schemaDigest)
  ));
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].classification, "semantic_not_realized");
  assert.equal(result.diagnostics[0].diagnosticId, "one_surface_semantic_not_realized");
  assert.equal(result.diagnostics[0].path, "$.af15Slot");
  assert.equal(result.diagnostics[0].actualRelation, "external_unbound");
  assert(!result.diagnostics.some((row) =>
    row.actualRelation.includes("native_schema_projection")
  ));
});

test("T-280 compiler refuses reordered and duplicate authority topology before execution", async () => {
  const fixture = scenario09OneSurfaceProgramFixture();
  const binding = fixture.gtlProgram.runtimeBindings[0];
  const reorderedProgram = Object.freeze({
    ...fixture.gtlProgram,
    runtimeBindings: Object.freeze([Object.freeze({
      ...binding,
      stageBindingRefs: Object.freeze([
        binding.stageBindingRefs[1],
        binding.stageBindingRefs[0],
        ...binding.stageBindingRefs.slice(2)
      ])
    })])
  });
  const reordered = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: reorderedProgram,
    stageAuthorities: stageAuthorities(fixture),
    recursePlan: fixture.recursePlan
  });
  assert.equal(reordered.status, "invalid");
  assert(reordered.diagnostics.some((row) =>
    row.diagnosticId === "one_surface_authority_order_invalid"
  ));

  const duplicate = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: fixture.gtlProgram,
    stageAuthorities: Object.freeze([
      ...stageAuthorities(fixture),
      stageAuthorities(fixture)[0]
    ]),
    recursePlan: fixture.recursePlan
  });
  assert.equal(duplicate.status, "invalid");
  assert(duplicate.diagnostics.some((row) =>
    row.diagnosticId === "one_surface_program_join_invalid"
  ));
});

function sealedIntentAdmission(program) {
  const workspaceBinding = Object.freeze({
    ref: "workspace-binding://t280/scenario09",
    digest: stableSha256Digest({ workspace: "scenario09" })
  });
  const intent = Object.freeze({
    kind: "admitted_construction_intent",
    intentId: "construction-intent:episode://t280:candidate://t280/action",
    candidateId: "candidate://t280/action",
    episodeId: "episode://t280",
    selectedActionRef: "action://t280/normalize",
    selectedBindingRef: "binding://t280/normalize",
    selectedOutcomeRef: "outcome://t280/normalized",
    iterationOrdinal: 0,
    basisProjectionRef: "projection://t280/observation",
    priorIntentId: null,
    causationRef: "causation://t280/selection",
    selectedGraphFunctionRef: "graph-function://t280/normalize",
    selectedVectorRef: null,
    selectedReentryRef: null,
    runtimeInvocationPlanRef: "runtime-invocation-plan://t280/normalize",
    inputAssetRefs: Object.freeze(["asset://t280/raw"]),
    expectedOutputAssetRefs: Object.freeze(["asset://t280/normalized"]),
    gapRefs: Object.freeze(["gap://t280/normalize"]),
    obligationRefs: Object.freeze(["obligation://t280/normalize"]),
    lawfulBasisRefs: Object.freeze(["authority://t280/action"]),
    expectedDelta: "normalized observation appears",
    progressCondition: "normalization evidence admitted",
    stopCondition: "normalization obligation closes",
    escalationCondition: "normalization remains blocked",
    lineageRefs: Object.freeze(["lineage://t280/selection"]),
    authorityRefs: Object.freeze(["authority://t280/action"]),
    admissionDecisionRef: "construction-admission://t280/action",
    correlationId: "correlation://t280/action"
  });
  const constructionIntentAdmission = Object.freeze({
    kind: "construction_intent_admission",
    admissionRef: intent.admissionDecisionRef,
    candidateId: intent.candidateId,
    episodeId: intent.episodeId,
    selectedBindingRef: intent.selectedBindingRef,
    selectedOutcomeRef: intent.selectedOutcomeRef,
    candidateRank: 0,
    iterationOrdinal: intent.iterationOrdinal,
    basisProjectionRef: intent.basisProjectionRef,
    priorIntentId: intent.priorIntentId,
    causationRef: intent.causationRef,
    correlationId: intent.correlationId,
    decision: "admitted",
    rejectionReasonRefs: Object.freeze([]),
    admittedIntent: intent
  });
  const targetBinding = constructTargetObligationBinding({
    snapshotRef: "observation://t280/action",
    snapshotDigest: stableSha256Digest({ observation: "t280/action" }),
    sourceBindingRef: intent.selectedBindingRef,
    pressureRef: "pressure://t280/action",
    actionRef: intent.selectedActionRef,
    targetOutcomeRef: intent.selectedOutcomeRef,
    obligationRefs: intent.obligationRefs,
    requiredEvidenceAuthorityRefs: Object.freeze([
      "authority://t280/action"
    ])
  });
  const basis = Object.freeze({
    program: Object.freeze({
      ref: program.admittedProgramRef,
      digest: program.admittedProgramDigest
    }),
    nextAction: Object.freeze({
      ref: "next-action://t280/normalize",
      digest: stableSha256Digest({ next: "normalize" })
    }),
    catalogView: Object.freeze({
      ref: "catalog-view://t280/scenario09",
      digest: stableSha256Digest({ catalog: "scenario09" })
    }),
    workspaceBinding,
    invocationAuthority: Object.freeze({
      ref: "invocation-authority://t280/scenario09",
      digest: stableSha256Digest({ invocation: "scenario09" })
    }),
    targetBindingRefs: Object.freeze([targetBinding.bindingRef]),
    constructionIntentAdmission
  });
  const admissionDigest = stableSha256Digest(basis);
  return Object.freeze({
    workspaceBinding,
    intent,
    targetBinding,
    admission: Object.freeze({
      kind: "one_surface_construction_intent_admission",
      status: "admitted",
      admissionRef:
        `abg://one-surface/intent-admission/${admissionDigest.slice("sha256:".length)}`,
      admissionDigest,
      ...basis
    })
  });
}

function admittedEvidence(scope, stage, index) {
  const payloadClass = `evidence-kind://t280/${String(index)}`;
  const evidenceRef = `evidence://t280/action/${String(index)}`;
  return Object.freeze({
    kind: "admitted_output_authority_projection",
    scope,
    targetCarrierContractRef: stage.targetCarrierContract.targetCarrierContractRef,
    targetCarrierContractDigest: stage.targetCarrierContract.targetCarrierContractDigest,
    status: "admitted",
    reason: null,
    payloadRef: `payload://t280/action/${String(index)}`,
    payloadClass,
    payloadDigest: stableSha256Digest({ payload: index }),
    payloadContractRef: stage.targetCarrierContract.targetCarrierContractRef,
    producerRef: "producer://t280/scenario09",
    sourceEventRef: `event://t280/action/${String(index)}`,
    authorityRef: T280_ACTION_AUTHORITY_SNAPSHOT_REF,
    inputDigest: T280_ACTION_INPUT_DIGEST,
    validationRefs: Object.freeze([`validation://t280/action/${String(index)}`]),
    evidenceRefs: Object.freeze([evidenceRef]),
    relatedPayloadRefs: Object.freeze([]),
    projectionRef: `projection://t280/action/${String(index)}`
  });
}

async function af16Fixture() {
  const fixture = scenario09OneSurfaceProgramFixture();
  const compilation = await compileFixture(fixture);
  assert.notEqual(compilation.authorityProgram, null);
  const program = compilation.authorityProgram;
  const stage = program.stages[3];
  const intentRows = sealedIntentAdmission(program);
  const invokedEvent = constructConstructionGraphActionInvokedEvent({
    constructionEventRef: "construction-event://t280/action",
    admittedIntent: intentRows.intent,
    basisId: "basis://t280/action",
    graphFunctionId: intentRows.intent.selectedGraphFunctionRef,
    runId: "run://t280/action",
    workKey: "work://t280/action",
    eventSequence: 1,
    graphCallId: "graph-call://t280/action",
    frameId: "frame://t280/action"
  });
  const scope = Object.freeze({
    kind: "payload_ledger_scope",
    basisId: invokedEvent.basisId,
    graphFunctionId: invokedEvent.graphFunctionId,
    graphCallId: invokedEvent.graphCallId,
    frameId: invokedEvent.frameId,
    vectorIndex: 0,
    edge: "edge://t280/action"
  });
  const evidence = Object.freeze([
    admittedEvidence(scope, stage, 0),
    admittedEvidence(scope, stage, 1)
  ]);
  const assuranceScope = Object.freeze({ ...scope, continuationId: null });
  const authorityDigest = T280_ACTION_AUTHORITY_DIGEST;
  const inputDigest = T280_ACTION_INPUT_DIGEST;
  const policyRefs = Object.freeze([
    "policy://t280/evidence",
    "policy://t280/action"
  ]);
  const assuranceEvidenceRows = Object.freeze(evidence.map((row) => Object.freeze({
    kind: "assurance_evidence_row",
    evidenceRef: row.evidenceRefs[0],
    scope: assuranceScope,
    authorityRef: T280_ACTION_AUTHORITY_SNAPSHOT_REF,
    authorityDigest,
    inputDigest,
    eventRefs: Object.freeze([row.sourceEventRef]),
    providerRefs: Object.freeze(["provider://t280/scenario09"]),
    policyRefs,
    boundToScope: true,
    complete: true,
    shallow: false,
    contradictsAuthority: false,
    deferred: false,
    lifecycle: "active"
  })));
  const assuranceProjection = Object.freeze({
    kind: "assurance_projection",
    scope: assuranceScope,
    authoritySnapshot: Object.freeze({
      kind: "assurance_authority_snapshot",
      authoritySnapshotRef: T280_ACTION_AUTHORITY_SNAPSHOT_REF,
      scope: assuranceScope,
      authorityRefs: Object.freeze(["authority://t280/action"]),
      inputRefs: Object.freeze([intentRows.intent.intentId]),
      authorityDigest,
      inputDigest,
      closureCapable: true,
      contradictoryAuthority: false,
      deferredAuthorityRefs: Object.freeze([]),
      providerRefs: Object.freeze(["provider://t280/scenario09"]),
      policyRefs
    }),
    evidenceRows: assuranceEvidenceRows,
    ambiguityRows: Object.freeze([Object.freeze({
      kind: "assurance_ambiguity_row",
      rowId: "assurance-row://t280/action/authority",
      status: "fulfilled",
      scope: assuranceScope,
      authorityRef: "authority://t280/action",
      evidenceRefs: Object.freeze(
        assuranceEvidenceRows.map((row) => row.evidenceRef)
      ),
      authorityDigest,
      inputDigest,
      eventRefs: Object.freeze(
        assuranceEvidenceRows.flatMap((row) => row.eventRefs)
      ),
      providerRefs: Object.freeze(["provider://t280/scenario09"]),
      policyRefs,
      reason: "evidence_fulfills_current_authority"
    })]),
    sourceProjectionRef: "projection://t280/action/source",
    projectionRef: "assurance-projection://t280/action"
  });
  const contract = constructEdgeAssuranceContract({
    hookRef: stage.closureContract.ref,
    targetOutcomeRef: intentRows.intent.selectedOutcomeRef,
    authoritySurfaceRefs: intentRows.intent.authorityRefs,
    targetObligationBindingRefs: intentRows.admission.targetBindingRefs,
    transformFpContractRef: "contract://t280/action/transform",
    evalFpContractRef: "contract://t280/action/evaluate",
    evalPromptInputContractRef: "contract://t280/action/evaluate-input",
    evalExpectedOutputContractRef: "contract://t280/action/evaluate-output",
    admissibleEvidencePolicyRef: "policy://t280/evidence",
    admittedEvidenceKindRefs: evidence.map((row) => row.payloadClass),
    gainReportSchemaRef: "schema://t280/action/gain",
    metricFunctionRef: "graph-function://t280/action/metric",
    closeDecisionSchemaRef: stage.nativeResultSchema.schemaRef,
    residualPressureSchemaRef: "schema://t280/action/residual",
    continuationSchemaRef: "schema://t280/action/continuation",
    compositionLawRef: "law://t280/action/composition",
    policyRefs: ["policy://t280/action"]
  });
  const assuranceSelection = resolveEdgeAssuranceContract({
    vector: fixture.members[3].finalVector,
    graphFunction: fixture.members[3].finalHost,
    module: fixture.aggregateModule,
    defaults: Object.freeze({
      sourceRef: "defaults://t280/action",
      contract
    })
  });
  assert.equal(assuranceSelection.kind, "edge_assurance_contract_selection");
  const decodedValue = Object.freeze({
    closureContractRef: stage.closureContract.ref,
    evidenceRefs: Object.freeze(evidence.flatMap((row) => row.evidenceRefs).sort()),
    disposition: "close",
    reasonRefs: Object.freeze(["all_required_rows_are_fulfilled"])
  });
  const actionInput = Object.freeze({
    program,
    intentAdmission: intentRows.admission,
    targetBinding: intentRows.targetBinding,
    invokedEvent,
    workspaceBinding: intentRows.workspaceBinding,
    admittedEvidence: evidence,
    assuranceSelection,
    assuranceProjection,
    priorLedger: null
  });
  const actionInputBasis = oneSurfaceEvaluateActionInputBasis(actionInput);
  const authoritySnapshotRef = "authority-snapshot://t280/action/result";
  const resultOutput = Object.freeze({
    ...evidence[0],
    payloadRef: "payload://t280/action/result",
    payloadDigest: stableSha256Digest(decodedValue),
    authorityRef: authoritySnapshotRef,
    inputDigest: actionInputBasis.inputDigest,
    evidenceRefs: Object.freeze(["evidence://t280/action/result"]),
    projectionRef: "projection://t280/action/result"
  });
  const result = constructAdmittedOneSurfaceAuthorityResult({
    functionKind: "evaluate_action",
    stageAuthorityRef: stage.authorityRef,
    stageAuthorityDigest: stage.authorityDigest,
    replayBindingRef: "replay-binding://t280/action",
    replayBindingDigest: stableSha256Digest({ replay: "t280-action" }),
    cCallRef: "c-call://t280/action",
    authoritySnapshotRef,
    inputDigest: actionInputBasis.inputDigest,
    admittedOutput: resultOutput,
    targetCarrierValidationRef: "validation://t280/action/result",
    decodedValueDigest: stableSha256Digest(decodedValue),
    decodedValue
  });
  return Object.freeze({
    program,
    stage,
    intentRows,
    invokedEvent,
    evidence,
    assuranceSelection,
    assuranceProjection,
    result,
    input: Object.freeze({
      ...actionInput,
      result,
    })
  });
}

test("T-280 AF-16 derives one ledger and decision from the complete admitted evidence basis", async () => {
  const fixture = await af16Fixture();
  const evaluation = admitEvaluateActionResult(fixture.input);
  assert.equal(evaluation.kind, "one_surface_action_evaluation");
  assert.equal(evaluation.ledger.version, 0);
  assert.equal(evaluation.ledger.intentRef, fixture.intentRows.intent.intentId);
  assert.equal(evaluation.ledger.evidenceRefs.length, 2);
  assert.equal(evaluation.decision.disposition, "close");
  assert.equal(evaluation.decision.ledgerRef, evaluation.ledger.ledgerRef);
});

test("T-280 AF-16 refuses incomplete, duplicate, cross-basis, stale-policy, and rejected close truth", async () => {
  const fixture = await af16Fixture();
  for (const admittedOutput of [
    Object.freeze({
      ...fixture.result.admittedOutput,
      inputDigest: stableSha256Digest({ input: "foreign-result-input" })
    }),
    Object.freeze({
      ...fixture.result.admittedOutput,
      authorityRef: "authority-snapshot://t280/action/foreign"
    })
  ]) {
    assert.throws(
      () => constructAdmittedOneSurfaceAuthorityResult({
        functionKind: fixture.result.functionKind,
        stageAuthorityRef: fixture.result.stageAuthorityRef,
        stageAuthorityDigest: fixture.result.stageAuthorityDigest,
        replayBindingRef: fixture.result.replayBindingRef,
        replayBindingDigest: fixture.result.replayBindingDigest,
        cCallRef: fixture.result.cCallRef,
        authoritySnapshotRef: fixture.result.authoritySnapshotRef,
        inputDigest: fixture.result.inputDigest,
        admittedOutput,
        targetCarrierValidationRef: fixture.result.targetCarrierValidationRef,
        decodedValueDigest: fixture.result.decodedValueDigest,
        decodedValue: fixture.result.decodedValue
      }),
      /authority result seal differs/
    );
  }
  const cases = [
    {
      label: "incomplete",
      input: { ...fixture.input, admittedEvidence: fixture.evidence.slice(0, 1) }
    },
    {
      label: "duplicate",
      input: { ...fixture.input, admittedEvidence: [fixture.evidence[0], fixture.evidence[0]] }
    },
    {
      label: "cross-intent",
      input: {
        ...fixture.input,
        invokedEvent: { ...fixture.invokedEvent, intentId: "construction-intent://other" }
      }
    },
    {
      label: "cross-binding",
      input: {
        ...fixture.input,
        workspaceBinding: {
          ref: "workspace-binding://other",
          digest: stableSha256Digest({ workspace: "other" })
        }
      }
    },
    {
      label: "stale-policy",
      input: {
        ...fixture.input,
        assuranceSelection: {
          ...fixture.assuranceSelection,
          contract: {
            ...fixture.assuranceSelection.contract,
            policyRefs: ["policy://t280/stale"]
          }
        }
      }
    },
    {
      label: "obsolete-source-target-binding",
      input: {
        ...fixture.input,
        assuranceSelection: {
          ...fixture.assuranceSelection,
          contract: {
            ...fixture.assuranceSelection.contract,
            targetObligationBindingRefs: [
              fixture.intentRows.intent.selectedBindingRef
            ]
          }
        }
      }
    },
    {
      label: "cross-evidence-authority",
      input: {
        ...fixture.input,
        admittedEvidence: [
          {
            ...fixture.evidence[0],
            authorityRef: "authority://t280/other"
          },
          fixture.evidence[1]
        ]
      }
    },
    {
      label: "cross-evidence-input",
      input: {
        ...fixture.input,
        admittedEvidence: [
          {
            ...fixture.evidence[0],
            inputDigest: stableSha256Digest({ input: "other" })
          },
          fixture.evidence[1]
        ]
      }
    },
    {
      label: "cross-assurance-authority",
      input: {
        ...fixture.input,
        assuranceProjection: {
          ...fixture.assuranceProjection,
          evidenceRows: fixture.assuranceProjection.evidenceRows.map(
            (row, index) => index === 0
              ? { ...row, authorityRef: "authority://t280/other" }
              : row
          )
        }
      }
    },
    {
      label: "foreign-snapshot-same-digests",
      expectedReason: "evaluate_action_evidence_authority_mismatch",
      input: {
        ...fixture.input,
        assuranceProjection: {
          ...fixture.assuranceProjection,
          authoritySnapshot: {
            ...fixture.assuranceProjection.authoritySnapshot,
            authoritySnapshotRef:
              "authority-snapshot://t280/action/foreign-same-digests"
          },
          projectionRef:
            "assurance-projection://t280/action/foreign-same-digests"
        }
      }
    },
    {
      label: "missing-required-member",
      expectedReason: "evaluate_action_evidence_incomplete",
      input: {
        ...fixture.input,
        assuranceProjection: {
          ...fixture.assuranceProjection,
          authoritySnapshot: {
            ...fixture.assuranceProjection.authoritySnapshot,
            authorityRefs: Object.freeze(["authority://t280/other"])
          },
          projectionRef:
            "assurance-projection://t280/action/missing-required-member"
        }
      }
    },
    {
      label: "cross-assurance-digest",
      input: {
        ...fixture.input,
        assuranceProjection: {
          ...fixture.assuranceProjection,
          evidenceRows: fixture.assuranceProjection.evidenceRows.map(
            (row, index) => index === 0
              ? {
                  ...row,
                  authorityDigest: stableSha256Digest({ authority: "other" })
                }
              : row
          )
        }
      }
    },
    {
      label: "cross-assurance-input",
      input: {
        ...fixture.input,
        assuranceProjection: {
          ...fixture.assuranceProjection,
          evidenceRows: fixture.assuranceProjection.evidenceRows.map(
            (row, index) => index === 0
              ? {
                  ...row,
                  inputDigest: stableSha256Digest({ input: "other" })
                }
              : row
          )
        }
      }
    },
    {
      label: "rejected-close",
      input: {
        ...fixture.input,
        admittedEvidence: [
          { ...fixture.evidence[0], status: "rejected", reason: "typed failure" },
          fixture.evidence[1]
        ]
      }
    }
  ];
  for (const row of cases) {
    let matchingResult = fixture.result;
    try {
      const matchingBasis = oneSurfaceEvaluateActionInputBasis(row.input);
      matchingResult = authorityResultWithInputDigest(
        fixture.result,
        matchingBasis.inputDigest
      );
    } catch {
      // Structurally invalid bases must refuse before result admission.
    }
    const evaluation = admitEvaluateActionResult({
      ...row.input,
      result: matchingResult
    });
    assert.equal(
      evaluation.kind,
      "one_surface_typed_refusal",
      `${row.label} must not create closure truth`
    );
    if (row.expectedReason !== undefined) {
      assert(
        evaluation.reasonRefs.includes(row.expectedReason),
        `${row.label} must refuse through ${row.expectedReason}`
      );
    }
  }
  const first = admitEvaluateActionResult(fixture.input);
  assert.equal(first.kind, "one_surface_action_evaluation");
  const repeatedInput = Object.freeze({
    ...fixture.input,
    priorLedger: first.ledger
  });
  const repeatedBasis = oneSurfaceEvaluateActionInputBasis(repeatedInput);
  const repeated = admitEvaluateActionResult({
    ...repeatedInput,
    result: authorityResultWithInputDigest(
      fixture.result,
      repeatedBasis.inputDigest
    )
  });
  assert.equal(repeated.kind, "one_surface_typed_refusal");
  assert(repeated.reasonRefs.includes("evaluate_action_prior_ledger_stale"));
});
