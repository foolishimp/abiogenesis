// Validates: T-280; REQ-R-ABG3-FP-CONSCIOUSNESS-002A..007, 011E.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitBoundWorkspaceCatalog,
  admitEvalGapResult,
  admitOneSurfaceConstructionIntent,
  admitSynthesizeModelResult,
  compileOneSurfaceGtlProgramApplication,
  constructAdmittedOneSurfaceAuthorityResult,
  constructConstructionIntentCandidate,
  constructConstructionPriorityScheme,
  constructGtlLibraryEntryDeclaration,
  constructNextActionBasis,
  constructObservationPressureRow,
  constructTargetObligationBinding,
  deriveConstructionPriorityProjection,
  deriveNextActionProjection,
  deriveObservationToActionBindingProjection,
  deriveProgramActionCatalog,
  deriveRegistrySessionView,
  oneSurfaceEvalGapInputBasis,
  oneSurfaceEvaluateNextInputBasis,
  oneSurfaceSynthesizeModelInputBasis
} from "../../build/semantic/code/src/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

const CATALOG_ENTRY_REF =
  "catalog-entry://t280/system/scenario09-normalize";
const CATALOG_MODULE_REF =
  "gtl-module://t280/scenario09-one-surface";

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

function admittedAuthorityResult({
  program,
  stageIndex,
  inputDigest,
  decodedValue
}) {
  const stage = program.stages[stageIndex];
  const functionKind = stage.functionKind;
  const decodedValueDigest = stableSha256Digest(decodedValue);
  const scope = Object.freeze({
    kind: "payload_ledger_scope",
    basisId: `basis://t280/scenario09/${functionKind}`,
    graphFunctionId: stage.plan.executionGraphFunctionRef,
    graphCallId: `graph-call://t280/scenario09/${functionKind}`,
    frameId: `frame://t280/scenario09/${functionKind}`,
    vectorIndex: 0,
    edge: stage.targetCarrierContract.edgeRef
  });
  const admittedOutput = Object.freeze({
    kind: "admitted_output_authority_projection",
    scope,
    targetCarrierContractRef:
      stage.targetCarrierContract.targetCarrierContractRef,
    targetCarrierContractDigest:
      stage.targetCarrierContract.targetCarrierContractDigest,
    status: "admitted",
    reason: null,
    payloadRef: `payload://t280/scenario09/${functionKind}`,
    payloadClass: stage.nativeResultSchema.schemaRef,
    payloadDigest: decodedValueDigest,
    payloadContractRef: stage.targetCarrierContract.targetCarrierContractRef,
    producerRef: "producer://t280/scenario09",
    sourceEventRef: `event://t280/scenario09/${functionKind}`,
    authorityRef: stage.authorityRef,
    inputDigest,
    validationRefs: Object.freeze([
      `validation://t280/scenario09/${functionKind}`
    ]),
    evidenceRefs: Object.freeze([
      `evidence://t280/scenario09/${functionKind}`
    ]),
    relatedPayloadRefs: Object.freeze([]),
    projectionRef: `projection://t280/scenario09/${functionKind}`
  });
  return constructAdmittedOneSurfaceAuthorityResult({
    functionKind,
    stageAuthorityRef: stage.authorityRef,
    stageAuthorityDigest: stage.authorityDigest,
    replayBindingRef: `replay-binding://t280/scenario09/${functionKind}`,
    replayBindingDigest: stableSha256Digest({
      functionKind,
      replay: "scenario09"
    }),
    cCallRef: `c-call://t280/scenario09/${functionKind}`,
    inputDigest,
    admittedOutput,
    targetCarrierValidationRef:
      `validation://t280/scenario09/${functionKind}`,
    decodedValueDigest,
    decodedValue
  });
}

function admitScenario09Catalog(fixture) {
  const callable = fixture.callableLabFunction.finalHost;
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t280/system/scenario09-normalize",
    entryRef: CATALOG_ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t280",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: callable.id,
    interfaceRef: "interface://t280/scenario09-normalize",
    sourceContractRef: "schema://t280/LabObservation",
    targetContractRef: "schema://t280/NormalizedObservation",
    contextRefs: ["context://t280/scenario09"],
    authorityRefs: ["authority://t280/scenario09/callable"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t280/scenario09"],
    readinessRefs: ["readiness://t280/scenario09"],
    proofRefs: ["proof://t280/scenario09/callable"],
    policyRefs: ["policy://t280/scenario09"],
    declarationSourceRefs: [CATALOG_MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t280/scenario09",
      bindingId: "binding://t280/scenario09",
      catalogId: "catalog://t280/scenario09",
      resolvedLockRef: "lock://t280/scenario09",
      systemDeclarations: [{
        kind: "runtime_library_entry",
        declaration,
        moduleRef: CATALOG_MODULE_REF,
        module: fixture.aggregateModule
      }],
      orderedProductBatches: [],
      causationEventRefs: ["event://t280/scenario09/catalog-bound"],
      correlationId: "correlation://t280/scenario09/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  const session = deriveRegistrySessionView({
    basis: admission.basis,
    allowedEntryRefs: [CATALOG_ENTRY_REF]
  });
  assert.equal(session.accepted, true, JSON.stringify(session.residuals));
  assert.notEqual(session.view, null);
  assert.equal(session.view.entries.length, 1);
  assert.equal(session.view.entries[0].callable, true);
  assert.equal(session.view.entries[0].graphFunctionRef, callable.id);
  return Object.freeze({ basis: admission.basis, session: session.view });
}

async function semanticChainFixture() {
  const source = scenario09OneSurfaceProgramFixture();
  const compilation = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: source.gtlProgram,
    stageAuthorities: stageAuthorities(source),
    recursePlan: source.recursePlan
  });
  assert.equal(compilation.status, "semantic_not_realized");
  assert.notEqual(compilation.authorityProgram, null);
  const program = compilation.authorityProgram;
  const catalog = admitScenario09Catalog(source);
  const episodeId = "episode://t280/scenario09";
  const workspaceBinding = Object.freeze({
    ref: "workspace-binding://t280/scenario09",
    digest: stableSha256Digest({ workspace: "t280-scenario09" })
  });
  const invocationAuthority = Object.freeze({
    ref: "invocation-authority://t280/scenario09",
    digest: stableSha256Digest({ invocation: "t280-scenario09" })
  });

  const actionCatalog = deriveProgramActionCatalog({
    episodeId,
    allowedCatalog: program.stages[2].allowedConsequenceCatalog,
    catalogView: catalog.session
  });
  assert.equal(actionCatalog.kind, "construction_action_catalog_projection");
  assert.equal(actionCatalog.rows.length, 1);
  const action = actionCatalog.rows[0];
  assert.equal(action.actionKind, "invoke_graph_function");
  assert.equal(
    action.graphFunctionRef,
    source.callableLabFunction.finalHost.id
  );

  const synthesizeInput = Object.freeze({
    program,
    intentLineageRef: "intent-lineage://t280/scenario09",
    priorModel: null,
    admittedProductTruthRefs: Object.freeze([
      "product-truth://t280/scenario09"
    ])
  });
  const synthesizeBasis = oneSurfaceSynthesizeModelInputBasis(synthesizeInput);
  const synthesizeResult = admittedAuthorityResult({
    program,
    stageIndex: 0,
    inputDigest: synthesizeBasis.inputDigest,
    decodedValue: Object.freeze({
      desiredAssetRefs: Object.freeze(["asset://t280/scenario09/normalized"]),
      knownAssetRefs: Object.freeze(["asset://t280/scenario09/source"])
    })
  });
  const model = admitSynthesizeModelResult({
    ...synthesizeInput,
    result: synthesizeResult
  });
  assert.equal(model.kind, "product_asset_model");

  const replayCursorRef = "replay://t280/scenario09/0";
  const runtimeProjectionRef = "projection://t280/scenario09/runtime";
  const observationInputRefs = Object.freeze([
    "asset://t280/scenario09/source"
  ]);
  const pressure = constructObservationPressureRow({
    pressureRef: "pressure://t280/scenario09/normalize",
    pressureKind: "open_obligation",
    sourceRef: "gap://t280/scenario09/normalize",
    targetOutcomeRefs: [action.targetOutcomeRef],
    evidenceRefs: ["evidence://t280/scenario09/gap"],
    severity: 1,
    authorityRefs: ["authority://t280/scenario09/gap"]
  });
  const evalGapInput = Object.freeze({
    program,
    workspaceBinding,
    model,
    replayCursorRef,
    runtimeProjectionRef,
    observationInputRefs
  });
  const evalGapBasis = oneSurfaceEvalGapInputBasis(evalGapInput);
  const evalGapResult = admittedAuthorityResult({
    program,
    stageIndex: 1,
    inputDigest: evalGapBasis.inputDigest,
    decodedValue: Object.freeze({
      kind: "construction_observation_snapshot",
      episodeId,
      observationId: "observation://t280/scenario09/0",
      basisRef: workspaceBinding.ref,
      currentProjectionRef: runtimeProjectionRef,
      iterationOrdinal: 0,
      basisProjectionRef: replayCursorRef,
      priorIntentId: null,
      causationRef: "causation://t280/scenario09/observe",
      correlationId: "correlation://t280/scenario09",
      observedStateRefs: Object.freeze([
        model.modelRef,
        ...observationInputRefs
      ]),
      runtimeAggregateRefs: Object.freeze([]),
      linkedAssetRefs: observationInputRefs,
      passedInputRefs: Object.freeze([]),
      gapProjectionRefs: Object.freeze([pressure.sourceRef]),
      foldbackRefs: Object.freeze([]),
      retryFrontierRefs: Object.freeze([]),
      reentryFrontierRefs: Object.freeze([]),
      assuranceRefs: Object.freeze([]),
      fhInputRefs: Object.freeze([]),
      priorIntentRefs: Object.freeze([]),
      priorProgressRefs: Object.freeze([]),
      pressureRows: Object.freeze([pressure]),
      repairSurfaceTriageRows: Object.freeze([])
    })
  });
  const observation = admitEvalGapResult({
    ...evalGapInput,
    result: evalGapResult
  });
  assert.equal(observation.kind, "construction_observation_snapshot");
  assert.equal(
    observation.actionCatalogRef,
    program.stages[2].allowedConsequenceCatalog.catalogRef
  );

  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  assert.equal(bindingProjection.rows.length, 1);
  const selectedBinding = bindingProjection.rows[0];
  const priorityScheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t280/scenario09",
    sourcePolicyRef: "policy://t280/scenario09",
    rules: []
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme
  });
  assert.equal(priorityProjection.rows.length, 1);
  const selectedPriority = priorityProjection.rows[0];
  const targetObligations = Object.freeze([Object.freeze({
    targetOutcomeRef: action.targetOutcomeRef,
    obligationRefs: Object.freeze([
      "obligation://t280/scenario09/normalize"
    ]),
    requiredEvidenceRefs: Object.freeze([
      "evidence://t280/scenario09/normalized"
    ])
  })]);
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t280/scenario09/normalize",
    episodeId,
    rank: selectedPriority.rankOrdinal,
    valueScore: selectedPriority.finalScore,
    priorityScore: selectedPriority.priorityScore,
    affectAdjustmentRefs: selectedPriority.affectAdjustmentRefs,
    selectedActionRef: action.actionRef,
    selectedBindingRef: selectedBinding.bindingRef,
    selectedOutcomeRef: selectedBinding.targetOutcomeRef,
    targetGraphFunctionRef: action.graphFunctionRef,
    targetVectorRef: action.graphVectorRef,
    targetReentryRef: selectedBinding.targetReentryRef,
    inputAssetRefs: selectedBinding.requiredInputRefs,
    expectedOutputAssetRefs: ["asset://t280/scenario09/normalized"],
    gapRefs: [pressure.sourceRef],
    obligationRefs: targetObligations[0].obligationRefs,
    lawfulBasisRefs: action.requiredAuthorityRefs,
    expectedDelta: "normalized observation appears",
    progressCondition: "normalization evidence is admitted",
    stopCondition: "normalization obligation closes",
    escalationCondition: "normalization remains blocked",
    rationale: "the sole admitted action is highest priority"
  });
  const nextBasis = constructNextActionBasis({
    basisKind: "initial_selection",
    causalRefs: [
      program.bindingRef,
      program.bindingDigest,
      invocationAuthority.ref,
      invocationAuthority.digest,
      workspaceBinding.ref,
      workspaceBinding.digest
    ]
  });
  const evaluateNextInput = Object.freeze({
    nextBasis,
    application: program,
    invocationAuthority,
    catalogBasis: catalog.basis,
    allowedEntryRefs: Object.freeze([CATALOG_ENTRY_REF]),
    observation,
    priorityScheme,
    targetObligations
  });
  const evaluateNextBasis = oneSurfaceEvaluateNextInputBasis(evaluateNextInput);
  const evaluateNextResult = admittedAuthorityResult({
    program,
    stageIndex: 2,
    inputDigest: evaluateNextBasis.inputDigest,
    decodedValue: Object.freeze({
      selectedActionRef: action.actionRef,
      intentCandidate: candidate
    })
  });
  const nextAction = deriveNextActionProjection({
    ...evaluateNextInput,
    authorityResult: evaluateNextResult
  });
  assert.equal(nextAction.kind, "next_action_projection");
  assert.equal(nextAction.disposition.variant, "callable_member_action");
  assert.equal(nextAction.selectedBindingRef, selectedBinding.bindingRef);
  assert.equal(nextAction.targetBindings.length, 1);
  assert.equal(
    nextAction.targetBindings[0].sourceBindingRef,
    selectedBinding.bindingRef
  );

  const intentAdmissionInput = Object.freeze({
    program,
    nextAction,
    observation,
    actionCatalog,
    bindingProjection,
    priorityProjection,
    workspaceBinding,
    invocationAuthority
  });
  const intentAdmission = admitOneSurfaceConstructionIntent(intentAdmissionInput);
  assert.equal(intentAdmission.status, "admitted");
  assert.equal(
    intentAdmission.constructionIntentAdmission.admittedIntent
      .selectedGraphFunctionRef,
    source.callableLabFunction.finalHost.id
  );
  return Object.freeze({
    action,
    bindingProjection,
    candidate,
    catalog,
    evaluateNextInput,
    evaluateNextResult,
    intentAdmission,
    intentAdmissionInput,
    invocationAuthority,
    nextAction,
    observation,
    priorityScheme,
    program,
    selectedBinding,
    targetObligations,
    workspaceBinding
  });
}

const chain = semanticChainFixture();

test("T-280 admits the real Scenario09 AF-11 through AF-14 semantic chain", async () => {
  const value = await chain;
  assert.equal(value.intentAdmission.status, "admitted");
  assert.equal(
    value.intentAdmission.constructionIntentAdmission.admittedIntent
      .selectedBindingRef,
    value.selectedBinding.bindingRef
  );
  assert.deepEqual(
    value.intentAdmission.targetBindingRefs,
    [value.nextAction.targetBindings[0].bindingRef]
  );
});

function assertEvaluateNextRefusal(value, reasonRef) {
  assert.equal(value.kind, "one_surface_typed_refusal");
  assert.equal(value.functionKind, "evaluate_next");
  assert(value.reasonRefs.includes(reasonRef), JSON.stringify(value.reasonRefs));
}

test("T-280 AF-13 refuses changed selector authority and duplicate outcomes", async () => {
  const value = await chain;
  const changedPolicy = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t280/scenario09/changed",
    sourcePolicyRef: "policy://t280/scenario09/changed",
    rules: []
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      priorityScheme: changedPolicy
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      targetObligations: [Object.freeze({
        ...value.targetObligations[0],
        obligationRefs: Object.freeze([
          "obligation://t280/scenario09/changed"
        ])
      })]
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      invocationAuthority: Object.freeze({
        ref: "invocation-authority://t280/scenario09/changed",
        digest: stableSha256Digest({ invocation: "changed" })
      })
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      nextBasis: constructNextActionBasis({
        basisKind: value.evaluateNextInput.nextBasis.basisKind,
        causalRefs: value.evaluateNextInput.nextBasis.causalRefs.map((ref) => {
          if (ref === value.workspaceBinding.ref) {
            return "workspace-binding://t280/scenario09/changed";
          }
          if (ref === value.workspaceBinding.digest) {
            return stableSha256Digest({ workspace: "changed" });
          }
          return ref;
        })
      })
    }),
    "evaluate_next_result_outside_admitted_program"
  );
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      targetObligations: Object.freeze([
        value.targetObligations[0],
        value.targetObligations[0]
      ])
    }),
    "evaluate_next_selector_authority_invalid"
  );
});

test("T-280 AF-14 refuses changed workspace and source-binding authority", async () => {
  const value = await chain;
  assert.throws(
    () => admitOneSurfaceConstructionIntent({
      ...value.intentAdmissionInput,
      workspaceBinding: Object.freeze({
        ref: "workspace-binding://t280/scenario09/changed",
        digest: stableSha256Digest({ workspace: "changed" })
      })
    }),
    /AF-14 input differs from the exact AF-13 selection/u
  );

  const originalTarget = value.nextAction.targetBindings[0];
  const mismatchedTarget = constructTargetObligationBinding({
    snapshotRef: originalTarget.snapshotRef,
    sourceBindingRef: "construction-binding://t280/scenario09/other",
    pressureRef: originalTarget.pressureRef,
    actionRef: originalTarget.actionRef,
    targetOutcomeRef: originalTarget.targetOutcomeRef,
    obligationRefs: originalTarget.obligationRefs,
    requiredEvidenceRefs: originalTarget.requiredEvidenceRefs
  });
  assert.throws(
    () => admitOneSurfaceConstructionIntent({
      ...value.intentAdmissionInput,
      nextAction: Object.freeze({
        ...value.nextAction,
        targetBindings: Object.freeze([mismatchedTarget])
      })
    }),
    /selected target binding differs/u
  );
});
