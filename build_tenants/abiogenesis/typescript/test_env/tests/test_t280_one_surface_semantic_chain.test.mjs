// Validates: T-280; REQ-R-ABG3-FP-CONSCIOUSNESS-002A..007, 011E.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitBoundWorkspaceCatalog,
  admitEvalGapResult,
  admitOneSurfaceConstructionIntent,
  admitSynthesizeModelResult,
  compileOneSurfaceGtlProgramApplication,
  constructConstructionIntentCandidate,
  constructConstructionPriorityScheme,
  constructGtlLibraryEntryDeclaration,
  constructNextActionBasis,
  constructObservationPressureRow,
  constructOneSurfaceProgramMemberProjection,
  constructTargetObligationBinding,
  deriveConstructionPriorityProjection,
  deriveNextActionProjection,
  deriveObservationToActionBindingProjection,
  deriveProgramActionCatalog,
  deriveRegistrySessionView,
  loadGtlTargetCarrierDefaultsBundle,
  oneSurfaceEvalGapInputBasis,
  oneSurfaceEvaluateNextInputBasis,
  oneSurfaceSynthesizeModelInputBasis,
  resolveTargetCarrierContractBinding
} from "../../build/semantic/code/src/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";
import {
  projectOneSurfaceReplayAttempt
} from "./support/t280-one-surface-replay-fixtures.mjs";
import {
  currentObservationFixture
} from "./support/t270-current-observation-fixtures.mjs";

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
  source,
  program,
  stageIndex,
  inputBasis,
  decodedValue
}) {
  const stage = program.stages[stageIndex];
  const functionKind = stage.functionKind;
  const contract = resolveTargetCarrierContractBinding({
    vector: source.members[stageIndex].finalVector,
    defaults: loadGtlTargetCarrierDefaultsBundle()
  });
  assert.equal(contract.contractRef, stage.resultAuthority.selectedResultContractRef);
  assert.equal(
    contract.configDigest,
    stage.targetCarrierContract.targetCarrierContractDigest
  );
  const replay = projectOneSurfaceReplayAttempt({
    application: program,
    artifactValue: decodedValue,
    contract,
    inputBasis,
    ordinal: stageIndex + 1,
    stage,
    fixtureRef: `t280/scenario09/${functionKind}`
  });
  assert.equal(
    replay.projection.status,
    "admitted",
    replay.projection.diagnostic?.reason
  );
  return replay.projection.result;
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
  const programMembers = constructOneSurfaceProgramMemberProjection({
    admittedProgramRef: program.admittedProgramRef,
    admittedProgramDigest: program.admittedProgramDigest,
    graphFunctions: source.aggregateModule.graphFunctions.map(
      (graphFunction) => Object.freeze({
        graphFunctionRef: graphFunction.id,
        graphFunctionDigest: stableSha256Digest(graphFunction)
      })
    )
  });
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
    catalogView: catalog.session,
    programMembers
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
    source,
    program,
    stageIndex: 0,
    inputBasis: synthesizeBasis,
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
    ...action.inputAssetRefs
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
    source,
    program,
    stageIndex: 1,
    inputBasis: evalGapBasis,
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
  const currentObservation = currentObservationFixture({
    observation,
    program: Object.freeze({
      ref: program.admittedProgramRef,
      digest: program.admittedProgramDigest
    }),
    workspaceBinding,
    ordinal: 100
  }).projection;

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
    requiredEvidenceAuthorityRefs: Object.freeze([
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
    expectedOutputAssetRefs: selectedBinding.providedOutputRefs,
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
    programMembers,
    invocationAuthority,
    catalogBasis: catalog.basis,
    allowedEntryRefs: Object.freeze([CATALOG_ENTRY_REF]),
    observation,
    currentObservation,
    priorityScheme,
    targetObligations
  });
  const evaluateNextBasis = oneSurfaceEvaluateNextInputBasis(evaluateNextInput);
  const targetBindings = Object.freeze([
    constructTargetObligationBinding({
      snapshotRef: observation.observationId,
      snapshotDigest: observation.snapshotDigest,
      sourceBindingRef: selectedBinding.bindingRef,
      pressureRef: selectedBinding.pressureRef,
      actionRef: selectedBinding.actionRef,
      targetOutcomeRef: selectedBinding.targetOutcomeRef,
      obligationRefs: targetObligations[0].obligationRefs,
      requiredEvidenceAuthorityRefs:
        targetObligations[0].requiredEvidenceAuthorityRefs
    })
  ]);
  const evaluateNextProjectionValue = Object.freeze({
    nextBasis,
    admittedProgram: Object.freeze({
      ref: program.admittedProgramRef,
      digest: program.admittedProgramDigest
    }),
    catalogView: Object.freeze({
      ref: catalog.session.sessionViewRef,
      digest: stableSha256Digest(catalog.session)
    }),
    observationRef: observation.observationId,
    currentObservationRef: currentObservation.projectionRef,
    currentObservationDigest: currentObservation.projectionDigest,
    actionCatalogRef: actionCatalog.catalogRef,
    bindingProjectionRef: bindingProjection.projectionRef,
    priorityProjectionRef: priorityProjection.projectionRef,
    selectedBindingRef: selectedBinding.bindingRef,
    selectedOutcomeRef: selectedBinding.targetOutcomeRef,
    intentCandidate: candidate,
    disposition: Object.freeze({
      variant: "callable_member_action",
      actionKind: "invoke_graph_function",
      actionRef: action.actionRef,
      targetRef: action.graphFunctionRef
    })
  });
  const evaluateNextResult = admittedAuthorityResult({
    source,
    program,
    stageIndex: 2,
    inputBasis: evaluateNextBasis,
    decodedValue: Object.freeze({
      targetBindings,
      priorityProjection,
      nextActionProjection: evaluateNextProjectionValue
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
    currentObservation,
    evaluateNextInput,
    evaluateNextProjectionValue,
    evaluateNextResult,
    intentAdmission,
    intentAdmissionInput,
    invocationAuthority,
    nextAction,
    observation,
    priorityProjection,
    priorityScheme,
    program,
    selectedBinding,
    source,
    targetObligations,
    targetBindings,
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
  assert.equal(
    value.nextAction.currentObservationRef,
    value.currentObservation.projectionRef
  );
  assert.equal(
    value.nextAction.currentObservationDigest,
    value.currentObservation.projectionDigest
  );
  assert.equal(
    value.nextAction.targetBindings[0].snapshotDigest,
    value.observation.snapshotDigest
  );
  assert.deepEqual(value.intentAdmission.nextAction, {
    ref: value.nextAction.projectionRef,
    digest: value.nextAction.projectionDigest
  });
});

test("T-280 AF-13 admits evaluator-owned total truth only after exact-input corroboration", async () => {
  const value = await chain;
  assert.deepEqual(
    value.evaluateNextResult.decodedValue.targetBindings,
    value.targetBindings
  );
  assert.deepEqual(
    value.evaluateNextResult.decodedValue.priorityProjection,
    value.priorityProjection
  );
  assert.deepEqual(
    value.evaluateNextResult.decodedValue.nextActionProjection,
    value.evaluateNextProjectionValue
  );

  const changedBinding = constructTargetObligationBinding({
    ...value.targetBindings[0],
    requiredEvidenceAuthorityRefs: Object.freeze([
      "authority://t280/scenario09/foreign"
    ])
  });
  const changedBindingResult = admittedAuthorityResult({
    source: value.source,
    program: value.program,
    stageIndex: 2,
    inputBasis: oneSurfaceEvaluateNextInputBasis(value.evaluateNextInput),
    decodedValue: Object.freeze({
      ...value.evaluateNextResult.decodedValue,
      targetBindings: Object.freeze([changedBinding])
    })
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: changedBindingResult
    }),
    "evaluate_next_target_bindings_differ_from_exact_inputs"
  );

  const changedPriorityResult = admittedAuthorityResult({
    source: value.source,
    program: value.program,
    stageIndex: 2,
    inputBasis: oneSurfaceEvaluateNextInputBasis(value.evaluateNextInput),
    decodedValue: Object.freeze({
      ...value.evaluateNextResult.decodedValue,
      priorityProjection: Object.freeze({
        ...value.priorityProjection,
        prioritySchemeRef: "priority-scheme://t280/scenario09/foreign"
      })
    })
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: changedPriorityResult
    }),
    "evaluate_next_priority_differs_from_exact_inputs"
  );

  const changedProjectionResult = admittedAuthorityResult({
    source: value.source,
    program: value.program,
    stageIndex: 2,
    inputBasis: oneSurfaceEvaluateNextInputBasis(value.evaluateNextInput),
    decodedValue: Object.freeze({
      ...value.evaluateNextResult.decodedValue,
      nextActionProjection: Object.freeze({
        ...value.evaluateNextProjectionValue,
        currentObservationRef:
          "current-observation://t280/scenario09/foreign"
      })
    })
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: changedProjectionResult
    }),
    "evaluate_next_projection_differs_from_exact_inputs"
  );
});

function assertEvaluateNextRefusal(value, reasonRef) {
  assert.equal(value.kind, "one_surface_typed_refusal");
  assert.equal(value.functionKind, "evaluate_next");
  assert(value.reasonRefs.includes(reasonRef), JSON.stringify(value.reasonRefs));
}

test("T-280 AF-13 refuses changed selector authority and duplicate outcomes", async () => {
  const value = await chain;
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: value.evaluateNextResult,
      currentObservation: Object.freeze({
        ...value.currentObservation,
        materializedEventRef: "event://t280/scenario09/mutated"
      })
    }),
    "evaluate_next_current_observation_invalid"
  );
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
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      authorityResult: admittedAuthorityResult({
        source: value.source,
        program: value.program,
        stageIndex: 2,
        inputBasis: oneSurfaceEvaluateNextInputBasis({
          ...value.evaluateNextInput,
          targetObligations: Object.freeze([
            ...value.targetObligations,
            Object.freeze({
              targetOutcomeRef: "outcome://t280/scenario09/unbound",
              obligationRefs: Object.freeze([
                "obligation://t280/scenario09/unbound"
              ]),
              requiredEvidenceAuthorityRefs: Object.freeze([
                "evidence://t280/scenario09/unbound"
              ])
            })
          ])
        }),
        decodedValue: value.evaluateNextResult.decodedValue
      }),
      targetObligations: Object.freeze([
        ...value.targetObligations,
        Object.freeze({
          targetOutcomeRef: "outcome://t280/scenario09/unbound",
          obligationRefs: Object.freeze([
            "obligation://t280/scenario09/unbound"
          ]),
          requiredEvidenceAuthorityRefs: Object.freeze([
            "evidence://t280/scenario09/unbound"
          ])
        })
      ])
    }),
    "target_obligation_set_mismatch"
  );
  const alteredStages = [...value.program.stages];
  alteredStages[2] = Object.freeze({
    ...alteredStages[2],
    allowedConsequenceCatalog: Object.freeze({
      ...alteredStages[2].allowedConsequenceCatalog,
      rows: Object.freeze(alteredStages[2].allowedConsequenceCatalog.rows.map(
        (row, index) => index === 0
          ? Object.freeze({
              ...row,
              requiredAuthorityRefs: Object.freeze([
                ...row.requiredAuthorityRefs,
                "authority://t280/scenario09/altered-after-admission"
              ])
            })
          : row
      ))
    })
  });
  assertEvaluateNextRefusal(
    deriveNextActionProjection({
      ...value.evaluateNextInput,
      application: Object.freeze({
        ...value.program,
        stages: Object.freeze(alteredStages)
      }),
      authorityResult: value.evaluateNextResult
    }),
    "evaluate_next_result_outside_admitted_program"
  );
});

test("T-280 AF-13 canonicalizes unordered target-obligation sets", async () => {
  const value = await chain;
  const first = Object.freeze({
    ...value.targetObligations[0],
    obligationRefs: Object.freeze([
      "obligation://t280/scenario09/z",
      "obligation://t280/scenario09/a"
    ]),
    requiredEvidenceAuthorityRefs: Object.freeze([
      "evidence://t280/scenario09/z",
      "evidence://t280/scenario09/a"
    ])
  });
  const second = Object.freeze({
    targetOutcomeRef: "outcome://t280/scenario09/second",
    obligationRefs: Object.freeze(["obligation://t280/scenario09/second"]),
    requiredEvidenceAuthorityRefs: Object.freeze([
      "evidence-authority://t280/scenario09/second"
    ])
  });
  const forward = oneSurfaceEvaluateNextInputBasis({
    ...value.evaluateNextInput,
    targetObligations: Object.freeze([first, second])
  });
  const reversed = oneSurfaceEvaluateNextInputBasis({
    ...value.evaluateNextInput,
    targetObligations: Object.freeze([
      second,
      Object.freeze({
        ...first,
        obligationRefs: Object.freeze([...first.obligationRefs].reverse()),
        requiredEvidenceAuthorityRefs: Object.freeze(
          [...first.requiredEvidenceAuthorityRefs].reverse()
        )
      })
    ])
  });
  assert.equal(forward.inputDigest, reversed.inputDigest);
});

test("T-280 AF-14 returns typed refusal for changed workspace and source-binding authority", async () => {
  const value = await chain;
  const changedWorkspace = admitOneSurfaceConstructionIntent({
      ...value.intentAdmissionInput,
      workspaceBinding: Object.freeze({
        ref: "workspace-binding://t280/scenario09/changed",
        digest: stableSha256Digest({ workspace: "changed" })
      })
    });
  assert.equal(changedWorkspace.kind, "one_surface_construction_intent_refusal");
  assert.deepEqual(
    changedWorkspace.reasonRefs,
    ["construction_intent_selection_authority_mismatch"]
  );

  const originalTarget = value.nextAction.targetBindings[0];
  const mismatchedTarget = constructTargetObligationBinding({
    snapshotRef: originalTarget.snapshotRef,
    snapshotDigest: originalTarget.snapshotDigest,
    sourceBindingRef: "construction-binding://t280/scenario09/other",
    pressureRef: originalTarget.pressureRef,
    actionRef: originalTarget.actionRef,
    targetOutcomeRef: originalTarget.targetOutcomeRef,
    obligationRefs: originalTarget.obligationRefs,
    requiredEvidenceAuthorityRefs:
      originalTarget.requiredEvidenceAuthorityRefs
  });
  const changedBinding = admitOneSurfaceConstructionIntent({
      ...value.intentAdmissionInput,
      nextAction: Object.freeze({
        ...value.nextAction,
        targetBindings: Object.freeze([mismatchedTarget])
      })
    });
  assert.equal(changedBinding.kind, "one_surface_construction_intent_refusal");
  assert.deepEqual(
    changedBinding.reasonRefs,
    ["construction_intent_authority_invalid:NextActionProjection selected target binding differs"]
  );
});
