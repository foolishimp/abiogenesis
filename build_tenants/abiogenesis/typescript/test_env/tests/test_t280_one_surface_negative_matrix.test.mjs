// Validates: T-280 bounded compiler and admission refusal matrix.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitConstructionIntentCandidate,
  admitFpResultContractEnvelope,
  admitOneSurfaceResultForClose,
  assertOneSurfaceAuthorityProgramBinding,
  compileOneSurfaceGtlProgramApplication,
  constructConstructionActionRow,
  constructConstructionIntentCandidate,
  constructObservationPressureRow
} from "../../build/semantic/code/src/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

const canonicalFixture = scenario09OneSurfaceProgramFixture();
const foreignRefinementFixture = scenario09OneSurfaceProgramFixture({
  moduleName: "t280.scenario09.foreign-one-surface-program-module",
  includeRefinementBoundary: true
});

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

function compileFixture({
  fixture = canonicalFixture,
  gtlProgram = fixture.gtlProgram,
  authorities = stageAuthorities(fixture)
} = {}) {
  return compileOneSurfaceGtlProgramApplication({
    gtlProgram,
    stageAuthorities: authorities,
    recursePlan: fixture.recursePlan
  });
}

const canonicalCompilation = compileFixture();

test("T-280 stage authority membership reseals lawful re-observation", async () => {
  const original = await canonicalCompilation;
  assert.notEqual(original.authorityProgram, null);
  assert.doesNotThrow(() =>
    assertOneSurfaceAuthorityProgramBinding(original.authorityProgram)
  );

  const reobservedProgram = Object.freeze({
    ...canonicalFixture.gtlProgram,
    subjectRef: "workspace://t280/scenario09-one-surface/reobserved"
  });
  const reobserved = await compileFixture({ gtlProgram: reobservedProgram });
  assert.notEqual(reobserved.authorityProgram, null);
  assert.doesNotThrow(() =>
    assertOneSurfaceAuthorityProgramBinding(reobserved.authorityProgram)
  );
  assert.equal(
    reobserved.authorityProgram.admittedProgramRef,
    reobservedProgram.subjectRef
  );
  assert(reobserved.authorityProgram.stages.every((stage) =>
    stage.admittedProgramRef === reobservedProgram.subjectRef &&
    stage.admittedProgramDigest ===
      reobserved.authorityProgram.admittedProgramDigest &&
    /^sha256:[a-f0-9]{64}$/u.test(stage.programMembershipDigest) &&
    stage.programMembershipRef.endsWith(
      stage.programMembershipDigest.slice("sha256:".length)
    )
  ));
  assert.notDeepEqual(
    reobserved.authorityProgram.stages.map((stage) => stage.authorityDigest),
    original.authorityProgram.stages.map((stage) => stage.authorityDigest)
  );
  assert.notDeepEqual(
    reobserved.authorityProgram.stages.map(
      (stage) => stage.programMembershipDigest
    ),
    original.authorityProgram.stages.map(
      (stage) => stage.programMembershipDigest
    )
  );
});

test("T-280 compiler refuses missing, wrong-type, stale, and foreign authorities", async (t) => {
  const canonical = stageAuthorities(canonicalFixture);
  const stalePlan = Object.freeze({
    ...canonical[0].plan,
    planDigest: `sha256:${"0".repeat(64)}`
  });
  const foreign = stageAuthorities(foreignRefinementFixture);
  const cases = Object.freeze([
    Object.freeze({
      name: "missing authority",
      authorities: Object.freeze(canonical.slice(0, 3)),
      diagnosticId: "one_surface_program_join_invalid"
    }),
    Object.freeze({
      name: "wrong function type",
      authorities: Object.freeze([
        Object.freeze({ ...canonical[0], functionKind: "eval_gap" }),
        ...canonical.slice(1)
      ]),
      diagnosticId: "one_surface_authority_order_invalid"
    }),
    Object.freeze({
      name: "stale plan basis",
      authorities: Object.freeze([
        Object.freeze({ ...canonical[0], plan: stalePlan }),
        ...canonical.slice(1)
      ]),
      diagnosticId: "one_surface_program_join_invalid"
    }),
    Object.freeze({
      name: "foreign program member",
      authorities: Object.freeze([foreign[0], ...canonical.slice(1)]),
      diagnosticId: "one_surface_authority_cross_program"
    })
  ]);

  for (const row of cases) {
    await t.test(row.name, async () => {
      const result = await compileFixture({ authorities: row.authorities });
      assert.equal(result.status, "invalid");
      assert.equal(result.authorityProgram, null);
      assert(result.diagnostics.some(
        (diagnostic) => diagnostic.diagnosticId === row.diagnosticId
      ), JSON.stringify(result.diagnostics, null, 2));
    });
  }
});

test("T-280 compiler exposes incomplete nested refinement without executing it", async () => {
  const result = await compileFixture({ fixture: foreignRefinementFixture });
  assert.equal(result.status, "semantic_not_realized");
  assert.notEqual(result.authorityProgram, null);
  assert(result.diagnostics.some((diagnostic) =>
    diagnostic.diagnosticId === "one_surface_refinement_incomplete" &&
    diagnostic.classification === "semantic_not_realized"
  ), JSON.stringify(result.diagnostics, null, 2));
  assert.equal(result.authorityProgram.runtimeAddressable, false);
  assert.equal(result.authorityProgram.effectsPermitted, false);
});

test("T-280 construction-intent admission refuses hidden runtime configuration", () => {
  const actionRef = "action://t280/negative/normalize";
  const bindingRef = "binding://t280/negative/normalize";
  const outcomeRef = "outcome://t280/negative/normalized";
  const inputAssetRef = "asset://t280/negative/source";
  const outputAssetRef = "asset://t280/negative/normalized";
  const pressure = constructObservationPressureRow({
    pressureRef: "pressure://t280/negative/normalize",
    pressureKind: "open_obligation",
    sourceRef: "gap://t280/negative/normalize",
    affectedAssetRefs: [inputAssetRef],
    targetOutcomeRefs: [outcomeRef]
  });
  const candidate = constructConstructionIntentCandidate({
    candidateId: "candidate://t280/negative/normalize",
    episodeId: "episode://t280/negative",
    rank: 0,
    selectedActionRef: actionRef,
    selectedBindingRef: bindingRef,
    selectedOutcomeRef: outcomeRef,
    targetGraphFunctionRef: "graph-function://t280/negative/normalize",
    inputAssetRefs: [inputAssetRef],
    expectedOutputAssetRefs: [outputAssetRef],
    gapRefs: [pressure.sourceRef],
    obligationRefs: ["obligation://t280/negative/normalize"],
    lawfulBasisRefs: ["authority://t280/negative/normalize"],
    hiddenConfigRefs: ["hidden://t280/negative/controller"]
  });
  const action = constructConstructionActionRow({
    actionRef,
    actionKind: "invoke_graph_function",
    graphFunctionRef: candidate.targetGraphFunctionRef,
    targetOutcomeRef: outcomeRef,
    inputAssetRefs: [inputAssetRef],
    expectedOutputAssetRefs: [outputAssetRef],
    requiredAuthorityRefs: candidate.lawfulBasisRefs
  });
  const admission = admitConstructionIntentCandidate({
    candidate,
    observation: Object.freeze({
      kind: "construction_observation_snapshot",
      episodeId: candidate.episodeId,
      observationId: "observation://t280/negative/0",
      basisRef: "workspace-binding://t280/negative",
      currentProjectionRef: "projection://t280/negative/runtime",
      iterationOrdinal: 0,
      basisProjectionRef: "projection://t280/negative/basis",
      priorIntentId: null,
      causationRef: "causation://t280/negative",
      correlationId: "correlation://t280/negative",
      observedStateRefs: Object.freeze([]),
      runtimeAggregateRefs: Object.freeze([]),
      linkedAssetRefs: Object.freeze([inputAssetRef]),
      passedInputRefs: Object.freeze([]),
      gapProjectionRefs: Object.freeze([pressure.sourceRef]),
      foldbackRefs: Object.freeze([]),
      retryFrontierRefs: Object.freeze([]),
      reentryFrontierRefs: Object.freeze([]),
      assuranceRefs: Object.freeze([]),
      fhInputRefs: Object.freeze([]),
      priorIntentRefs: Object.freeze([]),
      priorProgressRefs: Object.freeze([]),
      actionCatalogRef: "catalog://t280/negative",
      authorityDigest: stableSha256Digest({ authority: "t280-negative" }),
      pressureRows: Object.freeze([pressure]),
      repairSurfaceTriageRows: Object.freeze([])
    }),
    actionCatalog: Object.freeze({
      kind: "construction_action_catalog_projection",
      catalogRef: "catalog://t280/negative",
      episodeId: candidate.episodeId,
      hookResolutionRef: "hook-resolution://t280/negative",
      fallbackConfigDigest: stableSha256Digest({ fallback: "t280-negative" }),
      rows: Object.freeze([action])
    }),
    bindingProjection: Object.freeze({
      kind: "observation_to_action_binding_projection",
      projectionRef: "binding-projection://t280/negative",
      episodeId: candidate.episodeId,
      observationId: "observation://t280/negative/0",
      catalogRef: "catalog://t280/negative",
      rows: Object.freeze([Object.freeze({
        kind: "observation_to_action_binding_row",
        bindingRef,
        pressureRef: pressure.pressureRef,
        actionRef,
        targetOutcomeRef: outcomeRef,
        providedOutputRefs: Object.freeze([outputAssetRef]),
        requiredInputRefs: Object.freeze([inputAssetRef]),
        availableInputRefs: Object.freeze([inputAssetRef]),
        missingInputRefs: Object.freeze([]),
        targetReentryRef: null,
        matchReasonRefs: Object.freeze(["exact_target_outcome"]),
        ineligibleReasonRefs: Object.freeze([]),
        bindingScore: 1
      })])
    }),
    priorityProjection: Object.freeze({
      kind: "construction_priority_projection",
      projectionRef: "priority-projection://t280/negative",
      episodeId: candidate.episodeId,
      bindingProjectionRef: "binding-projection://t280/negative",
      prioritySchemeRef: "priority-scheme://t280/negative",
      affectPolicyRefs: Object.freeze([]),
      affectAdjustments: Object.freeze([]),
      rows: Object.freeze([Object.freeze({
        kind: "construction_priority_row",
        rankInputRef: bindingRef,
        bindingRef,
        pressureRef: pressure.pressureRef,
        actionRef,
        targetOutcomeRef: outcomeRef,
        sourcePolicyRef: "policy://t280/negative",
        rankOrdinal: 0,
        baseScore: 1,
        priorityScore: 1,
        affectAdjustmentRefs: Object.freeze([]),
        finalScore: 1,
        rankReasonRefs: Object.freeze(["sole_candidate"]),
        forcedReview: false,
        fhInputRequired: false,
        escalationRequired: false,
        terminalRouteRef: null,
        reviewReasonRefs: Object.freeze([]),
        terminalDisposition: "none",
        tieBreakKey: bindingRef
      })])
    })
  });

  assert.equal(admission.decision, "rejected");
  assert.equal(admission.admittedIntent, null);
  assert.deepEqual(admission.rejectionReasonRefs, ["hidden_runtime_config"]);
});

test("T-280 malformed T-257 output cannot produce AF-16 closure admission", async () => {
  const compilation = await canonicalCompilation;
  assert.notEqual(compilation.authorityProgram, null);
  const af16 = compilation.authorityProgram.stages[3];
  const malformed = Object.freeze({
    resultContractRef: af16.targetCarrierContract.targetCarrierContractRef,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: Object.freeze([]),
    reasons: Object.freeze([]),
    closureContractRef: af16.closureContract.ref
  });
  const resultAdmission = admitFpResultContractEnvelope({
    profile: "standard_live_review",
    selectedResultContractRef:
      af16.targetCarrierContract.targetCarrierContractRef,
    rawResult: malformed
  });

  assert.equal(resultAdmission.accepted, false);
  assert.equal(resultAdmission.envelope, null);
  assert.equal(resultAdmission.failure.failureClass, "undeclared_field");
  assert.throws(
    () => admitOneSurfaceResultForClose("evaluate_action", malformed),
    /OneSurfaceResult\.evaluate_action/u
  );
  assert.equal(Object.hasOwn(resultAdmission, "admissionRef"), false);
});
