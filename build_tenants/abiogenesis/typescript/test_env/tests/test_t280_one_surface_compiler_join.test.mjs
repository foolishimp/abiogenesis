// Validates: T-280 One Surface semantic-compiler join conservation.

import assert from "node:assert/strict";
import test from "node:test";

import {
  assertOneSurfaceAuthorityProgramBinding,
  compileOneSurfaceGtlProgramApplication
} from "../../build/semantic/code/src/index.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

test("T-280 compiler seals the AF13 through AF16 joins without binding AF15", async () => {
  const fixture = scenario09OneSurfaceProgramFixture();
  const result = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: fixture.gtlProgram,
    stageAuthorities: stageAuthorities(fixture),
    recursePlan: fixture.recursePlan
  });

  assert.equal(result.status, "semantic_not_realized");
  assert.notEqual(result.authorityProgram, null);
  const program = result.authorityProgram;
  assert.equal(program.runtimeAddressable, false);
  assert.equal(program.effectsPermitted, false);
  assert.equal(program.runtimeAdmissionOwner, "T-270");
  assert.doesNotThrow(() => assertOneSurfaceAuthorityProgramBinding(program));

  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].path, "$.af15Slot");
  assert.equal(result.diagnostics[0].actualRelation, "external_unbound");

  const [selection, constructionIntent, actionEvaluation] = program.joins;
  assert.deepEqual(program.joins.map((join) => join.joinKind), [
    "af13_to_af14_selection",
    "af14_to_af15_construction_intent",
    "af15_to_af16_action_evaluation"
  ]);

  assert.equal(selection.ownership, "native");
  assert.equal(selection.semanticType, "NextActionProjection");
  assert.equal(selection.source.functionId, "AF-13");
  assert.equal(selection.target.functionId, "AF-14");
  assert.equal(
    selection.source.coordinateRef,
    program.stages[2].plan.outputCarrierRef
  );
  assert.equal(selection.target.coordinateRef, selection.source.coordinateRef);
  assert.deepEqual(selection.bindingIdentityContract, {
    kind: "one_surface_binding_identity_contract",
    relation: "exact_identity",
    sourceField: "NextActionProjection.selectedBindingRef",
    targetField: "TargetObligationBinding.sourceBindingRef"
  });
  assert.equal(program.af14Admission.selectionJoinRef, selection.joinRef);
  assert.equal(program.af14Admission.selectionJoinDigest, selection.joinDigest);

  assert.equal(constructionIntent.ownership, "external_t270");
  assert.equal(constructionIntent.semanticType, "ConstructionIntent");
  assert.equal(constructionIntent.source.functionId, "AF-14");
  assert.equal(constructionIntent.target.functionId, "AF-15");
  assert.equal(
    constructionIntent.source.coordinateRef,
    program.af14Admission.relationRef
  );
  assert.equal(
    constructionIntent.target.coordinateRef,
    constructionIntent.source.coordinateRef
  );
  assert.equal(
    program.af15Slot.constructionIntentInputJoinRef,
    constructionIntent.joinRef
  );
  assert.equal(
    program.af15Slot.constructionIntentInputJoinDigest,
    constructionIntent.joinDigest
  );

  assert.equal(actionEvaluation.ownership, "external_t270");
  assert.equal(actionEvaluation.semanticType, "CompleteAdmittedEvidenceView");
  assert.equal(actionEvaluation.source.functionId, "AF-15");
  assert.equal(actionEvaluation.target.functionId, "AF-16");
  assert.equal(
    actionEvaluation.source.coordinateRef,
    program.stages[3].plan.inputCarrierRef
  );
  assert.equal(
    actionEvaluation.target.coordinateRef,
    actionEvaluation.source.coordinateRef
  );
  assert.equal(
    program.af15Slot.actionEvaluationOutputJoinRef,
    actionEvaluation.joinRef
  );
  assert.equal(
    program.af15Slot.actionEvaluationOutputJoinDigest,
    actionEvaluation.joinDigest
  );
  assert(result.diagnostics[0].evidenceRefs.includes(constructionIntent.joinRef));
  assert(result.diagnostics[0].evidenceRefs.includes(actionEvaluation.joinRef));
});
