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

// ─── Phase 3: the standing gate property set (enforcement after proof) ───
import { STANDING_GATE_TEMPORAL_PROPERTY_RULES } from "../../build/semantic/code/src/abg/m03/contracts/temporal_property_gates.js";

test("T-192 P3: all five standing gates admit and carry lawful shapes", () => {
  assert.equal(STANDING_GATE_TEMPORAL_PROPERTY_RULES.length, 5);
  for (const gateRule of STANDING_GATE_TEMPORAL_PROPERTY_RULES) {
    const admission = admitTemporalPropertyRule(gateRule);
    assert.equal(admission.accepted, true, `${gateRule.name}: ${JSON.stringify(admission.issues)}`);
    assert.notEqual(admission.property.witnessFormula, null, `${gateRule.name} must be implication-shaped`);
  }
});

function gateProperty(name) {
  const gateRule = STANDING_GATE_TEMPORAL_PROPERTY_RULES.find((r) => r.name === name);
  return admitTemporalPropertyRule(gateRule).property;
}

test("T-192 P3: each safety gate has mutation and vacuity differentials", () => {
  const cases = [
    ["gate_dispatch_requires_manifest", "instruction_prompt_manifest_projected", "c_call_fibre_selected", { regime: "F_P" }],
    ["gate_coverage_requires_payload_admission", "payload_validated", "requirement_proof_carry_through_admitted", {}],
    ["gate_invocation_requires_dispatch", "c_call_fibre_selected", "actor_invocation_started", {}],
    ["gate_selection_requires_registry_admission", "registry_entry_admitted", "graph_function_selected", {}]
  ];
  for (const [name, required, trigger, triggerFields] of cases) {
    const property = gateProperty(name);
    const lawful = evaluateTemporalProperty({
      property,
      trace: { events: [ev(required), ev(trigger, triggerFields)], completed: true }
    });
    assert.equal(lawful.status, "satisfied", `${name} lawful trace`);
    assert.equal(lawful.vacuous, false);
    // mutation: remove the required event -> violated
    const mutated = evaluateTemporalProperty({
      property,
      trace: { events: [ev(trigger, triggerFields)], completed: true }
    });
    assert.equal(mutated.status, "violated", `${name} mutation must flip`);
    // vacuity: no trigger -> vacuous, not gate-satisfying
    const vacuous = evaluateTemporalProperty({
      property,
      trace: { events: [ev(required)], completed: true }
    });
    assert.equal(vacuous.vacuous, true, `${name} zero-witness must be vacuous`);
  }
});

test("T-192 P3: the liveness gate routes undetermined on open prefixes and never claims early", () => {
  const property = gateProperty("gate_selection_eventually_judged");
  assert.equal(property.consequenceClass, "liveness_residual");
  const open = evaluateTemporalProperty({
    property,
    trace: { events: [ev("c_call_fibre_selected")], completed: false }
  });
  assert.equal(open.status, "undetermined", "open prefix must not decide liveness");
  const closed = evaluateTemporalProperty({
    property,
    trace: { events: [ev("c_call_fibre_selected"), ev("c_call_judged")], completed: true }
  });
  assert.equal(closed.status, "satisfied");
  const never = evaluateTemporalProperty({
    property,
    trace: { events: [ev("c_call_fibre_selected")], completed: true }
  });
  assert.equal(never.status, "violated");
});

// ─── Phase 4: runner wiring differentials ───
import {
  runEngineIterate
} from "../../build/semantic/code/src/abg/m03/contracts/../../m03/index.js";
import { m03InstructionAssemblyRequestFields } from "./support/m03-iteration-fixtures.mjs";
import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  defaultFpEvaluatorPlugin
} from "../../build/semantic/code/src/abg/m03/index.js";
import { fulfilledAttachedArtifactFor } from "./support/m03-iteration-fixtures.mjs";

function p4Run(temporalRules, pluginOverrides = {}) {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const first = Object.freeze({
    ...basis,
    startIntent: Object.freeze({ ...basis.startIntent, until: "first_traversal" })
  });
  const events = [];
  const result = runEngineIterate({
    basis: first,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(first),
    ...(temporalRules === undefined
      ? {}
      : { temporalPropertyStartup: { rules: temporalRules } }),
    plugins: {
      ...pluginOverrides,
      fpDispatch: pluginOverrides.fpDispatch ?? Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t192/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t192/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: pluginOverrides.fpEvaluator ?? defaultFpEvaluatorPlugin
    }
  });
  return { result, events };
}

test("T-192 P4: standing gates run live — verdicts at terminal, all satisfied non-vacuous, liveness decided", () => {
  const { result } = p4Run(STANDING_GATE_TEMPORAL_PROPERTY_RULES);
  const verdicts = result.replayEvents.filter(
    (event) => event.kind === "temporal_property_verdict_projected"
  );
  assert.equal(verdicts.length, 5, "one verdict per standing gate at the terminal");
  for (const verdict of verdicts) {
    assert.equal(verdict.status, "satisfied", `${verdict.propertyRef}: ${verdict.status}`);
  }
  const g1 = verdicts.find((v) => v.propertyRef.includes("dispatch-requires-manifest"));
  assert.equal(g1.vacuous, false, "dispatch happened, G1 must be witnessed");
  const g5 = verdicts.find((v) => v.propertyRef.includes("selection-eventually-judged"));
  assert.equal(g5.consequenceClass, "liveness_residual");
  // completed first_traversal terminal decides the liveness obligation
  assert.equal(g5.status, "satisfied");
  // verdicts precede the terminal event in replay order
  const terminalIndex = result.replayEvents.findIndex((e) => e.kind === "terminal_reached");
  const lastVerdictIndex = result.replayEvents
    .map((e, i) => (e.kind === "temporal_property_verdict_projected" ? i : -1))
    .reduce((a, b) => Math.max(a, b), -1);
  assert.equal(lastVerdictIndex < terminalIndex, true);
});

test("T-192 P4: the online dispatch gate blocks a violated safety property BEFORE the dispatch enters truth", () => {
  const impossible = {
    op: "historically",
    child: {
      op: "implies",
      left: { op: "atom", atom: { kind: "event", eventKind: "c_call_fibre_selected" } },
      right: { op: "once", child: { op: "atom", atom: { kind: "event", eventKind: "no_such_event_kind" } } }
    }
  };
  const gate = rule(entries({ formula: impossible, ref: "property://t192/impossible" }));
  const { result } = p4Run([gate]);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(result.transition.reason.includes("temporal property violated at dispatch"), true);
  assert.equal(
    result.replayEvents.filter((e) => e.kind === "c_call_fibre_selected").length,
    0,
    "the candidate selection must never enter truth"
  );
  assert.equal(
    result.replayEvents.filter((e) => e.kind === "fp_dispatch_requested").length,
    0,
    "no dispatch without its C call"
  );
  const violated = result.replayEvents.find(
    (e) => e.kind === "temporal_property_verdict_projected" && e.status === "violated"
  );
  assert.ok(violated, "the block must be replay-visible as a violated verdict");
  assert.equal(violated.evaluationPoint.startsWith("dispatch:"), true);
});

test("T-192 P4: unlawful property startup fails closed before any traversal", () => {
  const bad = rule(entries({ formula: { op: "sometime", child: { op: "atom", atom: { kind: "event", eventKind: "x" } } } }));
  const { result } = p4Run([bad]);
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(result.transition.reason.includes("temporal property startup rejected"), true);
  assert.equal(
    result.replayEvents.filter((e) => e.kind === "fp_dispatch_requested").length,
    0
  );
});

// ─── T-200 P4: arm-parity — a throwing plugin is blocked truth on EVERY arm ───

test("T-200 P4: throwing fp plugins become blocked outcomes, not engine deaths (arm parity)", () => {
  const throwingDispatch = {
    contract: constructEnginePluginContract({
      ref: "plugin://t200/p4/throwing-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch: () => { throw new Error("transport exploded"); }
  };
  const throwingEvaluator = {
    contract: defaultFpEvaluatorPlugin.contract,
    evaluate: () => { throw new Error("judge exploded"); }
  };
  for (const [label, overrides] of [
    ["dispatch", { fpDispatch: throwingDispatch }],
    ["evaluator", { fpEvaluator: throwingEvaluator }]
  ]) {
    const { result } = p4Run(STANDING_GATE_TEMPORAL_PROPERTY_RULES, overrides);
    assert.equal(result.transition.kind, "terminal", `${label}: lawful terminal, no crash`);
    const spineJudged = result.replayEvents.filter((e) => e.kind === "c_call_judged");
    assert.ok(spineJudged.length > 0, `${label}: the C call was judged, not abandoned`);
    const truth = JSON.stringify(result.replayEvents);
    assert.equal(truth.includes("contract_failure"), true, `${label}: typed class visible in truth`);
  }
});

// ─── T-205 B-prep (REQ-R-ABG3-HANDLERS-014 baseline): engine re-entry ───

function resumeRun(runtimeEvents, dispatchImpl) {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const converged = Object.freeze({
    ...basis,
    startIntent: Object.freeze({ ...basis.startIntent, until: "converged" })
  });
  const events = [];
  const result = runEngineIterate({
    basis: converged,
    ...(runtimeEvents === null ? {} : { runtimeEvents }),
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(converged),
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t205/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch: dispatchImpl
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });
  return { result, events };
}

test("T-205 B-prep: re-entry continues from the frontier — closed C calls stay closed; exhaustion semantics observed", () => {
  // Run 1: vector 0 succeeds; vector 1 blocks every attempt -> exhaustion.
  const dispatchCalls1 = [];
  const run1 = resumeRun(null, (input) => {
    dispatchCalls1.push(input.vectorIndex);
    if (input.vectorIndex === 0) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t205/${input.vectorIndex}`,
        attachedResultArtifact: fulfilledAttachedArtifactFor(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
    return constructFpDispatchOutcome({
      status: "blocked",
      reason: "worker down (contract_failure)",
      evidenceRefs: [input.sourceProjectionRef]
    });
  });
  assert.equal(run1.result.transition.kind, "terminal");
  assert.equal(run1.result.transition.terminalKind, "gap_stop");
  assert.equal(dispatchCalls1.includes(0), true);
  assert.equal(dispatchCalls1.filter((v) => v === 1).length >= 1, true);

  // Run 2: same replay, worker fixed. The frontier must hold: vector 0
  // is NEVER re-dispatched. The exhaustion semantic is OBSERVED and
  // pinned here as the -014 baseline.
  const dispatchCalls2 = [];
  const run2 = resumeRun(run1.result.replayEvents, (input) => {
    dispatchCalls2.push(input.vectorIndex);
    return constructFpDispatchOutcome({
      status: "dispatched",
      resultRef: `result://t205/resume/${input.vectorIndex}`,
      attachedResultArtifact: fulfilledAttachedArtifactFor(input),
      evidenceRefs: [input.sourceProjectionRef]
    });
  });
  assert.equal(
    dispatchCalls2.includes(0),
    false,
    "-014: closed C calls stay closed on re-entry (vector 0 not re-dispatched)"
  );
  // PINNED BASELINE (engine law, proven here): a fresh start over an
  // exhausted frontier opens a fresh attempt window implicitly — the
  // fixed worker re-attempts vector 1 and the run CONVERGES. Closed
  // C calls stay closed. If this ever changes, -014 must be re-ratified.
  assert.equal(
    dispatchCalls2.filter((v) => v === 1).length > 0,
    true,
    "-014 baseline: re-entry re-attempts the exhausted vector"
  );
  assert.equal(run2.result.transition.kind, "terminal");
  assert.equal(
    run2.result.transition.terminalKind,
    "converged",
    "-014 baseline: the resumed run converges once the defect is fixed"
  );
  // Spine resume-safety (HANDLERS -007 / CCALL -004 across resume):
  // every C call across BOTH runs has a unique ref (attempt identity
  // survives the process boundary) and the combined replay is
  // enclosure-clean — no duplicated or orphaned spine truth.
  const combined = run2.result.replayEvents;
  const openedRefs = combined.filter((e) => e.kind === "c_call_opened").map((e) => e.cCallRef);
  assert.equal(new Set(openedRefs).size, openedRefs.length,
    "-004: no cCallRef collision across resume (fresh attempts mint fresh identity)");
  const openedSet = new Set(openedRefs);
  for (const event of combined) {
    if (event.cCallRef !== undefined && event.kind !== "c_call_opened") {
      assert.equal(openedSet.has(event.cCallRef), true,
        "-007: no orphan spine rows in the combined resumed replay");
    }
  }
  const judged = combined.filter((e) => e.kind === "c_call_judged").length;
  assert.equal(judged, openedRefs.length,
    "every opened C call judged across the resume boundary");
});
