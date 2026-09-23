import assert from "node:assert/strict";
import test from "node:test";
import {
  canonical, closes, converge, fixture, ids, noAction, select,
  sha256Canonical, stop,
} from "../support/multi-candidate-admission-owner.mjs";

// These are source-level owner-gate tests over controlled predecessor inputs.
// They do not manufacture an installed or end-to-end runtime qualification.
function selected(result) {
  assert.ok(result?.intent, JSON.stringify(result));
  assert.equal(result.intent.kind, "construction_intent");
  assert.equal(result.intent.disposition, "admitted");
  return result;
}

function refused(result, code = "candidate_mismatch") {
  assert.equal(result?.kind, "traversal_route_admission_refusal");
  assert.equal(result.code, code);
  assert.equal(result.intent, undefined, "refusal must not construct an intent");
}

function restampBasis(f) {
  f.nextBasis = canonical(f.nextBasis, "basisRef", "basisDigest", "next-action-basis://product/");
  f.source.inputDigest = sha256Canonical(f.nextBasis);
  f.projection.nextActionBasisRef = f.nextBasis.basisRef;
  f.projection.nextActionBasisDigest = f.nextBasis.basisDigest;
  f.projection.lawfulBasisRefs[0] = f.nextBasis.basisRef;
}

for (const workflow of [false, true]) {
  for (const [candidates, obligations] of [[1, 1], [2, 1], [2, 2]]) {
    test(`owner admits ${candidates} candidates / ${obligations} obligations at ${workflow ? "workflow" : "F_H"} target`, () => {
      const f = fixture({ candidates, obligations, workflow });
      const result = selected(select(f));
      assert.equal(result.intent.selectedActionRef, ids.actionA);
      assert.deepEqual(result.projection.priorityProjection, f.projection.priorityProjection);
      assert.deepEqual(result.projection.targetObligationBindings, f.projection.targetObligationBindings);
      assert.deepEqual(result.intent.targetObligationRefs, f.nextBasis.targetObligationRefs);
      assert.equal(result.intent.actionCatalogRowDigest, sha256Canonical(f.executionBasis.actionCatalogRows[0]));
      assert.equal(result.intent.sourceCCallRef, "c-call://multi-candidate/next");
      assert.equal(result.intent.sourceResultRef, "result://multi-candidate/next");
      assert.equal(result.intent.sourceJudgmentRef, "judgment://multi-candidate/next");
      assert.equal(result.intent.targetCursorRef, f.target.cursorRef);
      assert.equal(result.intent.actionKind, workflow ? "invoke_graph_function" : "request_human_input");
      assert.deepEqual(result.intent.targetInput, workflow ? f.nextBasis.targetInput : null);
    });
  }
}

test("owner preserves Product-supplied order and does not select the ranked head", () => {
  const f = fixture();
  f.projection.priorityProjection.orderedActionRefs.reverse();
  const result = selected(select(f));
  assert.deepEqual(result.projection.priorityProjection.orderedActionRefs, [ids.actionB, ids.actionA]);
  assert.equal(result.intent.selectedActionRef, ids.actionA);
});

test("distinct alternative bindings survive; policy may rank an eligible subset", () => {
  const f = fixture({ candidates: 3, separateAlternatives: true });
  assert.deepEqual(f.projection.targetObligationBindings.map((row) => row.eligibleActionRefs), [
    [ids.actionA, ids.actionB], [ids.actionA, ids.actionC],
  ]);
  f.projection.priorityProjection.orderedActionRefs = [ids.actionA, ids.actionB];
  const result = selected(select(f));
  assert.deepEqual(result.intent.targetObligationRefs, [ids.obligationA, ids.obligationB]);
  assert.deepEqual(result.projection.targetObligationBindings, f.projection.targetObligationBindings);
});

test("binding order does not change exact obligation coverage", () => {
  const f = fixture();
  f.projection.targetObligationBindings.reverse();
  selected(select(f));
});

const selectionMutations = [
  ["selected ref absent from ranking", (f) => { f.projection.priorityProjection.orderedActionRefs = [ids.actionB]; }],
  ["unknown selected ref", (f) => { f.projection.selectedActionRef = ids.unknown; }],
  ["duplicate ranked ref", (f) => { f.projection.priorityProjection.orderedActionRefs.push(ids.actionA); }],
  ["unknown ranked ref", (f) => { f.projection.priorityProjection.orderedActionRefs.push(ids.unknown); }],
  ["ranked ref with no binding", (f) => { f.projection.targetObligationBindings.forEach((row) => { row.eligibleActionRefs = [ids.actionA]; }); }],
  ["non-string ranked ref", (f) => { f.projection.priorityProjection.orderedActionRefs.push(42); }],
  ["empty ranked ref", (f) => { f.projection.priorityProjection.orderedActionRefs.push(""); }],
  ["missing ranking", (f) => { delete f.projection.priorityProjection.orderedActionRefs; }],
  ["wrong priority scheme", (f) => { f.projection.priorityProjection.schemeRef = ids.unknown; }],
  ["missing obligation binding", (f) => { f.projection.targetObligationBindings.pop(); }],
  ["empty obligation bindings", (f) => { f.projection.targetObligationBindings = []; }],
  ["duplicate obligation binding", (f) => { f.projection.targetObligationBindings[1] = f.projection.targetObligationBindings[0]; }],
  ["surplus obligation binding", (f) => { f.projection.targetObligationBindings.push({ ...f.projection.targetObligationBindings[0], obligationRef: ids.unknown }); }],
  ["mismatched obligation binding", (f) => { f.projection.targetObligationBindings[1].obligationRef = ids.unknown; }],
  ["unbound selected obligation", (f) => { f.projection.targetObligationBindings[1].disposition = "unbound"; }],
  ["wrong binding kind", (f) => { f.projection.targetObligationBindings[1].kind = "unrelated_binding"; }],
  ["missing eligible refs", (f) => { delete f.projection.targetObligationBindings[1].eligibleActionRefs; }],
  ["duplicate eligible ref", (f) => { f.projection.targetObligationBindings[1].eligibleActionRefs.push(ids.actionA); }],
  ["unknown eligible ref even when unranked", (f) => { f.projection.targetObligationBindings[1].eligibleActionRefs.push(ids.unknown); }],
  ["non-string eligible ref", (f) => { f.projection.targetObligationBindings[1].eligibleActionRefs.push(42); }],
  ["selected ref absent from one binding", (f) => { f.projection.targetObligationBindings[1].eligibleActionRefs = [ids.actionB]; }],
  ["wrong selected obligations", (f) => { f.projection.targetObligationRefs = [ids.obligationA]; }],
  ["wrong selected Program", (f) => { f.projection.programRef = ids.unknown; }],
  ["wrong selected GraphFunction", (f) => { f.projection.graphFunctionRef = ids.unknown; }],
  ["wrong selected target locus", (f) => { f.projection.targetProgramLocusRef = ids.unknown; }],
  ["wrong selected output asset", (f) => { f.projection.outputAssetRefs = [ids.unknown]; }],
  ["wrong selected expected delta", (f) => { f.projection.expectedDeltaRef = ids.unknown; }],
  ["wrong selected basis reference", (f) => { f.projection.nextActionBasisRef = ids.unknown; }],
  ["wrong selected basis digest", (f) => { f.projection.nextActionBasisDigest = `sha256:${"0".repeat(64)}`; }],
  ["wrong workspace", (f) => { f.executionBasis.workspaceBindingId = ids.unknown; }],
  ["wrong admitted catalog ref", (f) => { f.executionBasis.actionCatalogRef = ids.unknown; }],
  ["wrong admitted catalog digest", (f) => { f.executionBasis.actionCatalogDigest = ids.unknown; }],
  ["duplicate admitted alternative identity", (f) => { f.executionBasis.actionCatalogRows.push(f.executionBasis.actionCatalogRows[1]); }],
  ["alternative with mismatched Program", (f) => { f.executionBasis.actionCatalogRows[1].programRef = ids.unknown; }],
  ["alternative with mismatched obligation", (f) => { f.executionBasis.actionCatalogRows[1].targetObligationRefs = [ids.obligationA]; }],
  ["non-string basis obligation", (f) => { f.nextBasis.targetObligationRefs = [ids.obligationA, 42]; restampBasis(f); }],
  ["duplicate basis obligation", (f) => { f.nextBasis.targetObligationRefs = [ids.obligationA, ids.obligationA]; restampBasis(f); }],
];
for (const [name, mutate] of selectionMutations) {
  test(`owner refuses ${name}`, () => {
    const f = fixture();
    mutate(f);
    refused(select(f));
  });
}

test("workflow target input remains digest-bound", () => {
  const f = fixture({ workflow: true });
  f.nextBasis.targetInput.value = "substituted";
  restampBasis(f);
  refused(select(f));
});

for (const correction of [false, true]) {
  for (const obligations of [1, 2]) {
    test(`owner admits ${correction ? "correction" : "gap stop"} for ${obligations} obligations`, () => {
      const f = fixture({ obligations });
      noAction(f, correction);
      const result = stop(f);
      assert.ok(result?.projection, JSON.stringify(result));
      assert.equal(result.intent, undefined);
      assert.equal(result.projection.targetObligationBindings.length, obligations);
      assert.deepEqual(result.projection.priorityProjection.orderedActionRefs, []);
    });
  }
  for (const [name, mutate] of [
    ["missing binding", (f) => { f.projection.targetObligationBindings.pop(); }],
    ["duplicate binding", (f) => { f.projection.targetObligationBindings[1] = f.projection.targetObligationBindings[0]; }],
    ["wrong obligation", (f) => { f.projection.targetObligationBindings[1].obligationRef = ids.unknown; }],
    ["wrong binding disposition", (f) => { f.projection.targetObligationBindings[1].disposition = "bound"; }],
    ["nonempty eligible refs", (f) => { f.projection.targetObligationBindings[1].eligibleActionRefs = [ids.actionA]; }],
    ["nonempty ranking", (f) => { f.projection.priorityProjection.orderedActionRefs = [ids.actionA]; }],
  ]) {
    test(`owner refuses ${correction ? "correction" : "gap stop"} ${name}`, () => {
      const f = fixture();
      noAction(f, correction);
      mutate(f);
      refused(stop(f), "gap_semantics_mismatch");
    });
  }
}

for (const obligations of [1, 2]) {
  test(`dependent closure gate admits ${obligations} fulfilled obligations`, () => {
    const f = fixture({ obligations });
    converge(f);
    assert.equal(closes(f), true);
  });
}
for (const [name, mutate] of [
  ["missing binding", (f) => { f.projection.targetObligationBindings.pop(); }],
  ["duplicate binding", (f) => { f.projection.targetObligationBindings[1] = f.projection.targetObligationBindings[0]; }],
  ["wrong obligation", (f) => { f.projection.targetObligationBindings[1].obligationRef = ids.unknown; }],
  ["wrong binding kind", (f) => { f.projection.targetObligationBindings[1].kind = "unrelated_binding"; }],
  ["unfulfilled obligation", (f) => { f.projection.targetObligationBindings[1].disposition = "unbound"; }],
  ["nonempty eligible refs", (f) => { f.projection.targetObligationBindings[1].eligibleActionRefs = [ids.actionA]; }],
  ["nonempty ranking", (f) => { f.projection.priorityProjection.orderedActionRefs = [ids.actionA]; }],
  ["missing delta evidence", (f) => { f.closureEvents.splice(1, 1); }],
  ["wrong closure decision", (f) => { f.projection.edgeClosureDecisionRef = ids.unknown; }],
  ["wrong refreshed basis", (f) => { f.projection.nextActionBasisRef = ids.unknown; }],
]) {
  test(`dependent closure gate refuses ${name}`, () => {
    const f = fixture();
    converge(f);
    mutate(f);
    assert.equal(closes(f), false);
  });
}
