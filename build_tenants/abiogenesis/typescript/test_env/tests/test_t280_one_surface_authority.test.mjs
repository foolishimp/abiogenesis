// Validates: T-280; REQ-L-GTL3-CONTRACT-LAW-API One Surface.

import assert from "node:assert/strict";
import test from "node:test";

import {
  ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES,
  ONE_SURFACE_RESULT_CONTRACT_FAMILY,
  admitOneSurfaceResultValue,
  compileOneSurfaceGtlProgramApplication,
  constructOneSurfaceTypedRefusal,
  typecheckGtlProgram
} from "../../build/semantic/code/src/index.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

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

test("T-280 evaluate-next native admission preserves the three constitutional shapes", () => {
  assert.deepEqual(
    admitOneSurfaceResultValue("evaluate_next", {
      selectedActionRef: null,
      intentCandidate: null
    }),
    { selectedActionRef: null, intentCandidate: null }
  );
  assert.deepEqual(
    admitOneSurfaceResultValue("evaluate_next", {
      selectedActionRef: "action://t280/open-fh",
      intentCandidate: null
    }),
    {
      selectedActionRef: "action://t280/open-fh",
      intentCandidate: null
    }
  );
  assert.deepEqual(
    admitOneSurfaceResultValue("evaluate_next", {
      selectedActionRef: "action://t280/normalize",
      intentCandidate: candidate()
    }).intentCandidate,
    candidate()
  );
  assert.throws(
    () => admitOneSurfaceResultValue("evaluate_next", {
      selectedActionRef: "action://t280/other",
      intentCandidate: candidate()
    }),
    /intentCandidate must identify selectedActionRef/u
  );
  assert.throws(
    () => admitOneSurfaceResultValue("evaluate_next", {
      selectedActionRef: null,
      intentCandidate: candidate()
    }),
    /intentCandidate must identify selectedActionRef/u
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
