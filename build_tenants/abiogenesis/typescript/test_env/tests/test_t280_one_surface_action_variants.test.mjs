// Validates: T-280; REQ-R-ABG3-FPC-004A, 005, 006.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitBoundWorkspaceCatalog,
  admitOneSurfaceConstructionIntent,
  compileOneSurfaceGtlProgramApplication,
  constructConstructionIntentCandidate,
  constructConstructionObservationSnapshot,
  constructConstructionPriorityScheme,
  constructGtlLibraryEntryDeclaration,
  constructNextActionBasis,
  constructObservationPressureRow,
  constructOneSurfaceProgramMemberProjection,
  deriveConstructionPriorityProjection,
  deriveNextActionProjection,
  deriveObservationToActionBindingProjection,
  deriveProgramActionCatalog,
  deriveRegistrySessionView,
  loadGtlTargetCarrierDefaultsBundle,
  oneSurfaceEvaluateNextInputBasis,
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

const MODULE_REF = "gtl-module://t280/scenario09-one-surface";
const WORKSPACE_BINDING = Object.freeze({
  ref: "workspace-binding://t280/action-variants",
  digest: stableSha256Digest({ workspace: "t280-action-variants" })
});
const INVOCATION_AUTHORITY = Object.freeze({
  ref: "invocation-authority://t280/action-variants",
  digest: stableSha256Digest({ invocation: "t280-action-variants" })
});
const EFFECT_ACTION_KINDS = new Set([
  "invoke_graph_function",
  "invoke_prior_vector",
  "invoke_later_vector",
  "reenter_graph_span",
  "repair_same_edge"
]);
const compiledWorlds = new Map();

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

function libraryDeclaration(graphFunction, suffix) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: `declaration://t280/action-variants/${suffix}`,
    entryRef: `catalog-entry://t280/action-variants/${suffix}`,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t280",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: graphFunction.id,
    interfaceRef: `interface://t280/action-variants/${suffix}`,
    sourceContractRef: graphFunction.inputs[0].schema.ref,
    targetContractRef: graphFunction.outputs[0].schema.ref,
    contextRefs: ["context://t280/action-variants"],
    authorityRefs: [`authority://t280/action-variants/${suffix}`],
    overlayRefs: [],
    provenanceRefs: [`provenance://t280/action-variants/${suffix}`],
    readinessRefs: [`readiness://t280/action-variants/${suffix}`],
    proofRefs: [`proof://t280/action-variants/${suffix}`],
    policyRefs: ["policy://t280/action-variants"],
    declarationSourceRefs: [MODULE_REF]
  });
}

function admitCatalogView(fixture) {
  const declarations = Object.freeze([
    libraryDeclaration(fixture.callableLabFunction.finalHost, "callable"),
    libraryDeclaration(fixture.members[2].finalHost, "internal-owner")
  ]);
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t280/action-variants",
      bindingId: WORKSPACE_BINDING.ref,
      catalogId: "catalog://t280/action-variants",
      resolvedLockRef: "lock://t280/action-variants",
      systemDeclarations: declarations.map((declaration) => ({
        kind: "runtime_library_entry",
        declaration,
        moduleRef: MODULE_REF,
        module: fixture.aggregateModule
      })),
      orderedProductBatches: [],
      causationEventRefs: ["event://t280/action-variants/catalog-bound"],
      correlationId: "correlation://t280/action-variants/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  const entryRefs = declarations.map((row) => row.entryRef);
  const session = deriveRegistrySessionView({
    basis: admission.basis,
    allowedEntryRefs: entryRefs
  });
  assert.equal(session.accepted, true, JSON.stringify(session.residuals));
  assert.notEqual(session.view, null);
  return Object.freeze({
    basis: admission.basis,
    entryRefs: Object.freeze(entryRefs),
    view: session.view
  });
}

async function compileActionWorld(actionVariant) {
  let pending = compiledWorlds.get(actionVariant);
  if (pending === undefined) {
    pending = (async () => {
      const fixture = scenario09OneSurfaceProgramFixture({
        actionVariant,
        moduleName: `t280.scenario09.one-surface-program-module.${actionVariant}`,
        subjectRef: `workspace://t280/scenario09-one-surface/${actionVariant}`
      });
      const compilation = await compileOneSurfaceGtlProgramApplication({
        gtlProgram: fixture.gtlProgram,
        stageAuthorities: stageAuthorities(fixture),
        recursePlan: fixture.recursePlan
      });
      assert.notEqual(
        compilation.authorityProgram,
        null,
        JSON.stringify(compilation.diagnostics)
      );
      return Object.freeze({
        fixture,
        program: compilation.authorityProgram,
        catalog: admitCatalogView(fixture)
      });
    })();
    compiledWorlds.set(actionVariant, pending);
  }
  return pending;
}

function authorityResult({
  candidate,
  fixture,
  inputBasis,
  ordinal,
  program,
  selectedActionRef
}) {
  const stage = program.stages[2];
  const contract = resolveTargetCarrierContractBinding({
    vector: fixture.members[2].finalVector,
    defaults: loadGtlTargetCarrierDefaultsBundle()
  });
  const replay = projectOneSurfaceReplayAttempt({
    application: program,
    artifactValue: Object.freeze({
      selectedActionRef,
      intentCandidate: candidate
    }),
    contract,
    inputBasis,
    ordinal,
    stage,
    fixtureRef: `t280/action-variants/${String(ordinal)}`
  });
  assert.equal(
    replay.projection.status,
    "admitted",
    replay.projection.diagnostic?.reason
  );
  return replay.projection.result;
}

function worldForAction({
  actionKind,
  candidateMutation = (value) => value,
  catalog,
  fixture,
  ordinal,
  program
}) {
  const episodeId = `episode://t280/action-variants/${String(ordinal)}`;
  const programMembers = constructOneSurfaceProgramMemberProjection({
    admittedProgramRef: program.admittedProgramRef,
    admittedProgramDigest: program.admittedProgramDigest,
    graphFunctions: fixture.aggregateModule.graphFunctions.map(
      (graphFunction) => Object.freeze({
        graphFunctionRef: graphFunction.id,
        graphFunctionDigest: stableSha256Digest(graphFunction)
      })
    )
  });
  const actionCatalog = deriveProgramActionCatalog({
    episodeId,
    allowedCatalog: program.stages[2].allowedConsequenceCatalog,
    catalogView: catalog.view,
    programMembers
  });
  assert.equal(actionCatalog.kind, "construction_action_catalog_projection");
  const action = actionKind === null
    ? null
    : actionCatalog.rows.find((row) => row.actionKind === actionKind) ?? null;
  if (actionKind !== null) {
    assert.notEqual(action, null, `missing ${actionKind} action`);
  }
  const pressure = action === null
    ? null
    : constructObservationPressureRow({
        pressureRef: `pressure://t280/action-variants/${String(ordinal)}`,
        pressureKind: "open_obligation",
        sourceRef: `gap://t280/action-variants/${String(ordinal)}`,
        targetOutcomeRefs: [action.targetOutcomeRef],
        evidenceRefs: [`evidence://t280/action-variants/${String(ordinal)}`],
        severity: 1,
        authorityRefs: action.requiredAuthorityRefs
      });
  const observation = constructConstructionObservationSnapshot({
    episodeId,
    observationId: `observation://t280/action-variants/${String(ordinal)}`,
    basisRef: WORKSPACE_BINDING.ref,
    currentProjectionRef: `projection://t280/action-variants/${String(ordinal)}`,
    iterationOrdinal: ordinal,
    basisProjectionRef: `replay://t280/action-variants/${String(ordinal)}`,
    priorIntentId: null,
    causationRef: `causation://t280/action-variants/${String(ordinal)}`,
    correlationId: `correlation://t280/action-variants/${String(ordinal)}`,
    linkedAssetRefs: action?.inputAssetRefs ?? [],
    gapProjectionRefs: pressure === null ? [] : [pressure.sourceRef],
    actionCatalogRef: program.stages[2].allowedConsequenceCatalog.catalogRef,
    authorityDigest: stableSha256Digest({ observation: ordinal }),
    pressureRows: pressure === null ? [] : [pressure]
  });
  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  assert.equal(bindingProjection.rows.length, action === null ? 0 : 1);
  const selectedBinding = bindingProjection.rows[0] ?? null;
  const priorityScheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t280/action-variants",
    sourcePolicyRef: "policy://t280/action-variants",
    rules: []
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme
  });
  assert.equal(priorityProjection.rows.length, action === null ? 0 : 1);
  const selectedPriority = priorityProjection.rows[0] ?? null;
  const obligationRefs = action === null
    ? Object.freeze([])
    : Object.freeze([`obligation://t280/action-variants/${String(ordinal)}`]);
  const requiredEvidenceAuthorityRefs = action === null
    ? Object.freeze([])
    : Object.freeze([`evidence://t280/action-variants/required/${String(ordinal)}`]);
  const exactCandidate =
    action !== null && EFFECT_ACTION_KINDS.has(action.actionKind)
      ? constructConstructionIntentCandidate({
          candidateId: `candidate://t280/action-variants/${String(ordinal)}`,
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
          targetReentryRef: action.actionKind === "reenter_graph_span"
            ? action.publishedTraversalTargetRef
            : null,
          inputAssetRefs: selectedBinding.requiredInputRefs,
          expectedOutputAssetRefs: selectedBinding.providedOutputRefs,
          gapRefs: [pressure.sourceRef],
          obligationRefs,
          lawfulBasisRefs: action.requiredAuthorityRefs,
          expectedDelta: "the selected action produces its declared target",
          progressCondition: "required evidence is admitted",
          stopCondition: "the selected target obligation closes",
          escalationCondition: "the selected target remains blocked",
          rationale: "the only bound action is the total priority winner"
        })
      : null;
  const candidate = exactCandidate === null
    ? null
    : candidateMutation(exactCandidate);
  const nextBasis = constructNextActionBasis({
    basisKind: "initial_selection",
    causalRefs: [
      program.bindingRef,
      program.bindingDigest,
      INVOCATION_AUTHORITY.ref,
      INVOCATION_AUTHORITY.digest,
      WORKSPACE_BINDING.ref,
      WORKSPACE_BINDING.digest
    ]
  });
  const targetObligations = action === null
    ? Object.freeze([])
    : Object.freeze([Object.freeze({
        targetOutcomeRef: action.targetOutcomeRef,
        obligationRefs,
        requiredEvidenceAuthorityRefs
      })]);
  const currentObservation = currentObservationFixture({
    observation,
    program: Object.freeze({
      ref: program.admittedProgramRef,
      digest: program.admittedProgramDigest
    }),
    workspaceBinding: WORKSPACE_BINDING,
    ordinal: ordinal + 50
  }).projection;
  const evaluateNextInput = Object.freeze({
    nextBasis,
    application: program,
    programMembers,
    invocationAuthority: INVOCATION_AUTHORITY,
    catalogBasis: catalog.basis,
    allowedEntryRefs: catalog.entryRefs,
    observation,
    currentObservation,
    priorityScheme,
    targetObligations
  });
  const inputBasis = oneSurfaceEvaluateNextInputBasis(evaluateNextInput);
  const nextAction = deriveNextActionProjection({
    ...evaluateNextInput,
    authorityResult: authorityResult({
      candidate,
      fixture,
      inputBasis,
      ordinal: ordinal + 100,
      program,
      selectedActionRef: action?.actionRef ?? null
    })
  });
  if (nextAction.kind === "one_surface_typed_refusal") {
    return Object.freeze({
      action,
      actionCatalog,
      bindingProjection,
      candidate,
      intentAdmission: null,
      nextAction,
      observation,
      priorityProjection
    });
  }
  return Object.freeze({
    action,
    actionCatalog,
    bindingProjection,
    candidate,
    intentAdmission: admitOneSurfaceConstructionIntent({
      program,
      nextAction,
      observation,
      actionCatalog,
      bindingProjection,
      priorityProjection,
      workspaceBinding: WORKSPACE_BINDING,
      invocationAuthority: INVOCATION_AUTHORITY
    }),
    nextAction,
    observation,
    priorityProjection
  });
}

test("T-280 AF-13 to AF-14 admits every effect variant with exact target conservation", async () => {
  const cases = Object.freeze([
    Object.freeze({
      actionVariant: "callable",
      actionKinds: Object.freeze(["invoke_graph_function"]),
      disposition: "callable_member_action"
    }),
    Object.freeze({
      actionVariant: "internal",
      actionKinds: Object.freeze(["invoke_prior_vector", "invoke_later_vector"]),
      disposition: "internal_vector_action"
    }),
    Object.freeze({
      actionVariant: "reentry",
      actionKinds: Object.freeze(["reenter_graph_span"]),
      disposition: "refinement_reentry_action"
    }),
    Object.freeze({
      actionVariant: "repair",
      actionKinds: Object.freeze(["repair_same_edge"]),
      disposition: "repair_action"
    })
  ]);
  let ordinal = 1;
  for (const row of cases) {
    const compiled = await compileActionWorld(row.actionVariant);
    for (const actionKind of row.actionKinds) {
      const world = worldForAction({
        ...compiled,
        actionKind,
        ordinal
      });
      ordinal += 1;
      assert.equal(world.nextAction.kind, "next_action_projection");
      assert.equal(world.nextAction.disposition.variant, row.disposition);
      assert.deepEqual(world.candidate.inputAssetRefs, world.action.inputAssetRefs);
      assert.deepEqual(
        world.candidate.expectedOutputAssetRefs,
        world.action.expectedOutputAssetRefs
      );
      assert.equal(
        world.intentAdmission?.status,
        "admitted",
        JSON.stringify(world.intentAdmission?.reasonRefs ?? [])
      );
      const admitted = world.intentAdmission.constructionIntentAdmission.admittedIntent;
      assert.equal(admitted.selectedGraphFunctionRef, world.action.graphFunctionRef);
      assert.equal(admitted.selectedVectorRef, world.action.graphVectorRef);
      assert.equal(
        admitted.selectedReentryRef,
        actionKind === "reenter_graph_span"
          ? world.action.publishedTraversalTargetRef
          : null
      );
      if (row.disposition === "internal_vector_action") {
        assert.equal(
          world.action.graphFunctionRef,
          compiled.fixture.members[2].finalHost.id
        );
        assert.equal(
          world.action.graphVectorRef,
          compiled.fixture.members[2].finalVector.id
        );
      }
    }
  }
});

test("T-280 AF-14 rejects every non-effect disposition before invocation", async () => {
  const cases = Object.freeze([
    Object.freeze({
      actionVariant: "continue",
      actionKinds: Object.freeze(["continue_graph_call"]),
      disposition: "continue_current_intent"
    }),
    Object.freeze({
      actionVariant: "fh",
      actionKinds: Object.freeze(["open_fh_gate"]),
      disposition: "fh_outcome"
    }),
    Object.freeze({
      actionVariant: "ticket",
      actionKinds: Object.freeze(["create_ticket"]),
      disposition: "ticket_outcome"
    }),
    Object.freeze({
      actionVariant: "reprice",
      actionKinds: Object.freeze(["propose_reprice"]),
      disposition: "reprice_outcome"
    }),
    Object.freeze({
      actionVariant: "terminal",
      actionKinds: Object.freeze([
        "yield_progress",
        "close_episode",
        "block_episode"
      ]),
      disposition: "terminal_outcome"
    })
  ]);
  let ordinal = 20;
  for (const row of cases) {
    const compiled = await compileActionWorld(row.actionVariant);
    for (const actionKind of row.actionKinds) {
      const world = worldForAction({
        ...compiled,
        actionKind,
        ordinal
      });
      ordinal += 1;
      assert.equal(world.nextAction.kind, "next_action_projection");
      assert.equal(world.nextAction.disposition.variant, row.disposition);
      assert.equal(world.nextAction.intentCandidate, null);
      assert.equal(world.intentAdmission?.status, "refused");
      assert.deepEqual(
        world.intentAdmission.reasonRefs,
        ["construction_intent_selection_authority_mismatch"]
      );
    }
  }
  const compiled = await compileActionWorld("terminal");
  const noAction = worldForAction({
    ...compiled,
    actionKind: null,
    ordinal
  });
  assert.equal(noAction.nextAction.kind, "next_action_projection");
  assert.equal(noAction.nextAction.disposition.variant, "no_action");
  assert.equal(noAction.nextAction.intentCandidate, null);
  assert.equal(noAction.intentAdmission?.status, "refused");
  assert.deepEqual(
    noAction.intentAdmission.reasonRefs,
    ["construction_intent_selection_authority_mismatch"]
  );
});

test("T-280 AF-14 rejects missing graph-function, vector, and reentry targets exactly", async () => {
  const cases = Object.freeze([
    Object.freeze({
      actionVariant: "internal",
      actionKind: "invoke_prior_vector",
      mutate: (candidate) => Object.freeze({ ...candidate, targetVectorRef: null }),
      reason: "target_vector_contradicts_catalog"
    }),
    Object.freeze({
      actionVariant: "reentry",
      actionKind: "reenter_graph_span",
      mutate: (candidate) => Object.freeze({ ...candidate, targetReentryRef: null }),
      reason: "target_reentry_ref_contradicts_binding"
    }),
    Object.freeze({
      actionVariant: "repair",
      actionKind: "repair_same_edge",
      mutate: (candidate) => Object.freeze({
        ...candidate,
        targetGraphFunctionRef: null
      }),
      reason: "target_graph_function_contradicts_catalog"
    })
  ]);
  let ordinal = 40;
  for (const row of cases) {
    const compiled = await compileActionWorld(row.actionVariant);
    const world = worldForAction({
      ...compiled,
      actionKind: row.actionKind,
      candidateMutation: row.mutate,
      ordinal
    });
    ordinal += 1;
    assert.equal(world.nextAction.kind, "next_action_projection");
    assert.equal(world.intentAdmission?.status, "refused");
    assert.ok(
      world.intentAdmission.reasonRefs.includes(row.reason),
      JSON.stringify(world.intentAdmission.reasonRefs)
    );
  }
});

test("T-280 AF-13 rejects F_P-authored priority and asset truth", async () => {
  const cases = Object.freeze([
    Object.freeze({
      mutate: (candidate) => Object.freeze({ ...candidate, rank: candidate.rank + 1 })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        valueScore: candidate.valueScore + 1
      })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        priorityScore: candidate.priorityScore + 1
      })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        affectAdjustmentRefs: [...candidate.affectAdjustmentRefs, "affect://forged"]
      })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        inputAssetRefs: [...candidate.inputAssetRefs, "asset://forged/input"]
      })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        inputAssetRefs: []
      })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        expectedOutputAssetRefs: [
          ...candidate.expectedOutputAssetRefs,
          "asset://forged/output"
        ]
      })
    }),
    Object.freeze({
      mutate: (candidate) => Object.freeze({
        ...candidate,
        expectedOutputAssetRefs: []
      })
    })
  ]);
  const compiled = await compileActionWorld("callable");
  let ordinal = 60;
  for (const row of cases) {
    const world = worldForAction({
      ...compiled,
      actionKind: "invoke_graph_function",
      candidateMutation: row.mutate,
      ordinal
    });
    ordinal += 1;
    assert.equal(world.nextAction.kind, "one_surface_typed_refusal");
    assert.deepEqual(
      world.nextAction.reasonRefs,
      ["evaluate_next_intent_candidate_differs_from_selection"]
    );
    assert.equal(world.intentAdmission, null);
  }
});
