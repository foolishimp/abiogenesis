// Validates: REQ-L-GTL3-TEMPORAL-PROPERTIES-001..-012 (T-192 Phase 2)
import test from "node:test";
import assert from "node:assert/strict";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";
import {
  admitTemporalPropertyRule,
  evaluateTemporalProperty,
  evaluateSafetyGateAtStep
} from "../../build/semantic/code/src/abg/m03/contracts/temporal_properties.js";

function rule(configEntries, kind = "temporal_property") {
  return {
    name: "t192-property",
    kind,
    config: { entries: configEntries },
    tags: []
  };
}

function entries(input) {
  const rows = [];
  rows.push({ key: "property_ref", value: { kind: "scalar", value: input.ref ?? "property://t192/test" } });
  rows.push({ key: "consequence_class", value: { kind: "scalar", value: input.consequence ?? "safety_gate" } });
  rows.push({ key: "gate_point", value: { kind: "scalar", value: input.gate ?? "dispatch" } });
  rows.push({ key: "formula", value: { kind: "json_blob", value: input.formula } });
  return rows;
}

const DISPATCH_REQUIRES_MANIFEST = {
  op: "historically",
  child: {
    op: "implies",
    left: { op: "atom", atom: { kind: "event", eventKind: "fp_dispatch_requested" } },
    right: {
      op: "once",
      child: { op: "atom", atom: { kind: "event", eventKind: "instruction_prompt_manifest_projected" } }
    }
  }
};

function ev(kind, extra = {}) {
  return { kind, eventId: `evt://${kind}/${extra.n ?? 0}`, ...extra };
}

test("T-192 admission: lawful safety property admits with digest and witness formula", () => {
  const admission = admitTemporalPropertyRule(rule(entries({ formula: DISPATCH_REQUIRES_MANIFEST })));
  assert.equal(admission.accepted, true, JSON.stringify(admission.issues));
  assert.equal(admission.property.consequenceClass, "safety_gate");
  assert.equal(admission.property.formulaDigest.startsWith("sha256:"), true);
  assert.notEqual(admission.property.witnessFormula, null);
});

test("T-192 admission fails closed: unknown operator, unknown fluent, future-op safety, bad enums", () => {
  const badOp = admitTemporalPropertyRule(rule(entries({ formula: { op: "sometime", child: DISPATCH_REQUIRES_MANIFEST } })));
  assert.equal(badOp.accepted, false);
  assert.equal(badOp.issues.some((i) => i.issueKind === "unknown_operator"), true);

  const badFluent = admitTemporalPropertyRule(
    rule(entries({ formula: { op: "atom", atom: { kind: "fluent", fluent: "made_up_fluent" } } }))
  );
  assert.equal(badFluent.accepted, false);
  assert.equal(badFluent.issues.some((i) => i.issueKind === "unknown_fluent"), true);

  const futureSafety = admitTemporalPropertyRule(
    rule(entries({ formula: { op: "eventually", child: DISPATCH_REQUIRES_MANIFEST } }))
  );
  assert.equal(futureSafety.accepted, false);
  assert.equal(futureSafety.issues.some((i) => i.issueKind === "safety_requires_past_time"), true);

  const badClass = admitTemporalPropertyRule(
    rule(entries({ formula: DISPATCH_REQUIRES_MANIFEST, consequence: "advisory" }))
  );
  assert.equal(badClass.accepted, false);
  assert.equal(badClass.issues.some((i) => i.issueKind === "unknown_consequence_class"), true);

  const badKind = admitTemporalPropertyRule(rule(entries({ formula: DISPATCH_REQUIRES_MANIFEST }), "rule"));
  assert.equal(badKind.accepted, false);
  assert.equal(badKind.issues.some((i) => i.issueKind === "unknown_rule_kind"), true);
});

test("T-192 semantics: dispatch-requires-manifest satisfied / violated / vacuous", () => {
  const { property } = admitTemporalPropertyRule(rule(entries({ formula: DISPATCH_REQUIRES_MANIFEST })));

  const good = evaluateTemporalProperty({
    property,
    trace: { events: [ev("instruction_prompt_manifest_projected"), ev("fp_dispatch_requested")], completed: true }
  });
  assert.equal(good.status, "satisfied");
  assert.equal(good.vacuous, false);
  assert.equal(good.witnessCount, 1);

  const bad = evaluateTemporalProperty({
    property,
    trace: { events: [ev("fp_dispatch_requested")], completed: true }
  });
  assert.equal(bad.status, "violated");
  assert.equal(bad.implicatedEventRefs.length > 0, true);

  // REQ -005: zero-witness satisfied is VACUOUS, not gate-satisfying
  const vac = evaluateTemporalProperty({
    property,
    trace: { events: [ev("instruction_prompt_manifest_projected")], completed: true }
  });
  assert.equal(vac.status, "satisfied");
  assert.equal(vac.witnessCount, 0);
  assert.equal(vac.vacuous, true);
});

test("T-192 semantics: mutation differential flips satisfied to violated", () => {
  const { property } = admitTemporalPropertyRule(rule(entries({ formula: DISPATCH_REQUIRES_MANIFEST })));
  const trace = [ev("instruction_prompt_manifest_projected"), ev("fp_dispatch_requested")];
  assert.equal(
    evaluateTemporalProperty({ property, trace: { events: trace, completed: true } }).status,
    "satisfied"
  );
  const mutated = trace.filter((e) => e.kind !== "instruction_prompt_manifest_projected");
  assert.equal(
    evaluateTemporalProperty({ property, trace: { events: mutated, completed: true } }).status,
    "violated"
  );
});

test("T-192 semantics: liveness is undetermined on an open prefix, decided on completion (REQ -004)", () => {
  const { property } = admitTemporalPropertyRule(
    rule(
      entries({
        consequence: "liveness_residual",
        gate: "closure",
        formula: {
          op: "eventually",
          child: { op: "atom", atom: { kind: "event", eventKind: "requirement_proof_carry_through_admitted" } }
        }
      })
    )
  );
  const open = evaluateTemporalProperty({
    property,
    trace: { events: [ev("fp_dispatch_requested")], completed: false }
  });
  assert.equal(open.status, "undetermined");
  const completedWithout = evaluateTemporalProperty({
    property,
    trace: { events: [ev("fp_dispatch_requested")], completed: true }
  });
  assert.equal(completedWithout.status, "violated");
  const completedWith = evaluateTemporalProperty({
    property,
    trace: {
      events: [ev("fp_dispatch_requested"), ev("requirement_proof_carry_through_admitted")],
      completed: true
    }
  });
  assert.equal(completedWith.status, "satisfied");
});

test("T-192 semantics: fluent atoms consume the ONE event calculus", () => {
  const { property, issues } = admitTemporalPropertyRule(
    rule(
      entries({
        formula: {
          op: "historically",
          child: {
            op: "implies",
            left: { op: "atom", atom: { kind: "event", eventKind: "vector_traversal_planned" } },
            right: { op: "atom", atom: { kind: "fluent", fluent: "graph_call_open" } }
          }
        }
      })
    )
  );
  assert.equal(property !== null, true, JSON.stringify(issues));
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const good = evaluateTemporalProperty({
    property,
    trace: {
      basis,
      events: [
        ev("graph_call_opened", { graphCallId: "gc://t192", basisId: basis.id }),
        ev("vector_traversal_planned", { basisId: basis.id, vectorIndex: 0, frameId: "frame://t192", graphCallId: "gc://t192", edge: "input_set→requirements" })
      ],
      completed: true
    }
  });
  assert.equal(good.status, "satisfied", JSON.stringify(good));
  const bad = evaluateTemporalProperty({
    property,
    trace: { basis, events: [ev("vector_traversal_planned", { basisId: basis.id, vectorIndex: 0, frameId: "frame://t192", graphCallId: "gc://t192", edge: "input_set→requirements" })], completed: true }
  });
  assert.equal(bad.status, "violated");
});

test("T-192 online gate: safety verdict at the dispatch step over the prefix", () => {
  const { property } = admitTemporalPropertyRule(rule(entries({ formula: DISPATCH_REQUIRES_MANIFEST })));
  const trace = {
    events: [ev("instruction_prompt_manifest_projected"), ev("fp_dispatch_requested")],
    completed: false
  };
  assert.equal(evaluateSafetyGateAtStep({ property, trace, step: 1 }), "satisfied");
  const noManifest = { events: [ev("fp_dispatch_requested")], completed: false };
  assert.equal(evaluateSafetyGateAtStep({ property, trace: noManifest, step: 0 }), "violated");
});

test("T-192 semantics: where-guards scope event atoms", () => {
  const { property } = admitTemporalPropertyRule(
    rule(
      entries({
        formula: {
          op: "historically",
          child: {
            op: "implies",
            left: {
              op: "atom",
              atom: { kind: "event", eventKind: "fp_dispatch_requested", where: [{ field: "vectorIndex", equals: "0" }] }
            },
            right: {
              op: "once",
              child: {
                op: "atom",
                atom: { kind: "event", eventKind: "instruction_prompt_manifest_projected", where: [{ field: "vectorIndex", equals: "0" }] }
              }
            }
          }
        }
      })
    )
  );
  const crossVector = evaluateTemporalProperty({
    property,
    trace: {
      events: [
        ev("instruction_prompt_manifest_projected", { vectorIndex: 1 }),
        ev("fp_dispatch_requested", { vectorIndex: 0 })
      ],
      completed: true
    }
  });
  assert.equal(crossVector.status, "violated", "a vector-1 manifest must not satisfy vector-0 dispatch");
});
