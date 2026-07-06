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
  runEngineIterate,
  runEngineIterateAsync
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

test("T-205 B2: a DECLARED program drives the engine — selection rows carry its programRef and armIds", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const declaredSyntax = {
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: "gtl://t205/declared-lean" },
      { key: "proportionalityClass", value: "P1" },
      { key: "stages", value: { kind: "array", items: [
        { kind: "object", entries: [
          { key: "stageRole", value: "transform" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://t205/transform" },
          { key: "resultBearing", value: true }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "evaluate" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://t205/evaluate" },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "consequence" },
          { key: "defaultRegime", value: "F_D" },
          { key: "armId", value: "arm://t205/consequence" },
          { key: "resultBearing", value: false }
        ] }
      ] } }
    ]
  };
  const declaredBasis = Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...basis.graphFunction.declarations.entries,
          Object.freeze({
            key: "abg.hog_program",
            value: Object.freeze({ kind: "json_blob", value: declaredSyntax })
          })
        ])
      })
    })
  });
  const events = [];
  const result = runEngineIterate({
    basis: declaredBasis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(declaredBasis),
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t205/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t205/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });
  const selections = result.replayEvents.filter((e) => e.kind === "c_call_fibre_selected");
  assert.equal(selections.length > 0, true, "spine present");
  // every selection row carries the DECLARED program identity
  for (const row of selections) {
    assert.equal(row.programRef, "gtl://t205/declared-lean", `row arm=${row.armId}`);
  }
  // triple-stage arms come from the DECLARED program, not the baked constant
  const arms = new Set(selections.map((r) => r.armId));
  assert.equal(arms.has("arm://t205/transform"), true, JSON.stringify([...arms]));
  assert.equal(arms.has("arm://abg/hog/transform"), false, "baked arm must NOT appear");
});

test("T-205 B2 (codex HIGH): an unexecutable declared program is TYPED TRUTH — gap_stop + runtime_failure_observed, no host exception, no spine", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const deepSyntax = {
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: "gtl://t205/deep-seven" },
      { key: "proportionalityClass", value: "P3" },
      { key: "stages", value: { kind: "array", items: [
        { kind: "object", entries: [
          { key: "stageRole", value: "plan" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://d/p" },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "transform" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://d/t" },
          { key: "resultBearing", value: true }
        ] }
      ] } }
    ]
  };
  const declaredBasis = Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...basis.graphFunction.declarations.entries,
          Object.freeze({
            key: "abg.hog_program",
            value: Object.freeze({ kind: "json_blob", value: deepSyntax })
          })
        ])
      })
    })
  });
  const events = [];
  // must NOT throw (the codex probe threw here before the fix)
  const result = runEngineIterate({
    basis: declaredBasis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(declaredBasis),
    plugins: {}
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /hog_program_unresolvable/);
  assert.match(result.transition.reason, /unsupported_stage_set/);
  const failure = result.replayEvents.find((e) => e.kind === "runtime_failure_observed");
  assert.notEqual(failure, undefined, "typed failure event present");
  assert.equal(failure.surface, "hog_program_resolution");
  assert.equal(failure.failureClass, "contract_failure");
  // no half-opened spine: zero c_call rows
  assert.equal(result.replayEvents.filter((e) => e.kind.startsWith("c_call_")).length, 0);
  // and the terminal is judged by the property engine like any other
  const terminal = result.replayEvents.find((e) => e.kind === "terminal_reached");
  assert.notEqual(terminal, undefined);
});

test("T-205 B3 KEYSTONE: a declared 4-stage program EXECUTES — admit stage runs spine-enclosed at anchor A; blocked admit stops the run lawfully", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const fourStage = {
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: "gtl://t205/four" },
      { key: "proportionalityClass", value: "P2" },
      { key: "stages", value: { kind: "array", items: [
        { kind: "object", entries: [
          { key: "stageRole", value: "transform" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://f/t" },
          { key: "resultBearing", value: true }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "admit" },
          { key: "defaultRegime", value: "F_D" },
          { key: "armId", value: "arm://f/a" },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "evaluate" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://f/e" },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "consequence" },
          { key: "defaultRegime", value: "F_D" },
          { key: "armId", value: "arm://f/c" },
          { key: "resultBearing", value: false }
        ] }
      ] } }
    ]
  };
  const declaredBasis = Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...basis.graphFunction.declarations.entries,
          Object.freeze({ key: "abg.hog_program", value: Object.freeze({ kind: "json_blob", value: fourStage }) })
        ])
      })
    })
  });
  const admitCalls = [];
  const runFour = (admitOutcome) => {
    const events = [];
    const result = runEngineIterate({
      basis: declaredBasis,
      eventSink: (event) => events.push(event),
      ...m03InstructionAssemblyRequestFields(declaredBasis),
      plugins: {
        handlerRegistry: {
          bindings: [{
            programRef: "gtl://t205/four", stageRole: "admit", armId: "arm://f/a",
            regime: "F_D", handlerRef: "handler://t205/admit",
            handlerClass: "pipeline", handlerConfigRef: null
          }],
          handlers: new Map([["handler://t205/admit", (input) => {
            admitCalls.push(input.stage.stageRole);
            return admitOutcome;
          }]])
        },
        fpDispatch: Object.freeze({
          contract: constructEnginePluginContract({
            ref: "plugin://t205/fp-dispatch", pluginKind: "fp_dispatch",
            authority: "effect_plugin", inputCarrier: "EnginePluginInput",
            outputCarrier: "FpDispatchOutcome"
          }),
          dispatch(input) {
            return constructFpDispatchOutcome({
              status: "dispatched",
              resultRef: `result://t205/four/${input.vectorIndex}`,
              attachedResultArtifact: fulfilledAttachedArtifactFor(input),
              evidenceRefs: [input.sourceProjectionRef]
            });
          }
        }),
        fpEvaluator: defaultFpEvaluatorPlugin
      }
    });
    return result;
  };
  // POSITIVE: admit executes; run proceeds; spine complete
  const ok = runFour({ outcomeStatus: "executed", evidenceRefs: ["admit://ok"], payloadRef: null, responseContractRef: null, failureReason: null });
  assert.equal(admitCalls.length > 0, true, "the handler actually ran");
  const admitSelections = ok.replayEvents.filter((e) => e.kind === "c_call_fibre_selected" && e.armId === "arm://f/a");
  assert.equal(admitSelections.length > 0, true, "admit spine present");
  assert.equal(admitSelections[0].programRef, "gtl://t205/four");
  assert.equal(admitSelections[0].regime, "F_D");
  const admitRef = admitSelections[0].cCallRef;
  const admitJudged = ok.replayEvents.find((e) => e.kind === "c_call_judged" && e.cCallRef === admitRef);
  assert.equal(admitJudged.judgment, "advance");
  // order: admit opened AFTER transform judged, BEFORE evaluate opened
  const kindsInOrder = ok.replayEvents
    .filter((e) => e.kind === "c_call_opened")
    .map((e) => e.stageRole);
  const ti = kindsInOrder.indexOf("transform");
  const ai = kindsInOrder.indexOf("admit");
  const ei = kindsInOrder.indexOf("evaluate");
  assert.equal(ti < ai && ai < ei, true, `order: ${JSON.stringify(kindsInOrder)}`);
  // NEGATIVE: blocked admit -> lawful gap_stop, admit judged blocked
  const bad = runFour({ outcomeStatus: "blocked", evidenceRefs: ["admit://reject"], payloadRef: null, responseContractRef: null, failureReason: "envelope check failed" });
  assert.equal(bad.transition.kind, "terminal");
  assert.equal(bad.transition.terminalKind, "gap_stop");
  assert.match(bad.transition.reason, /hog_stage_blocked: admit/);
  const badAdmitSel = bad.replayEvents.filter((e) => e.kind === "c_call_fibre_selected" && e.armId === "arm://f/a").pop();
  const badJudged = bad.replayEvents.find((e) => e.kind === "c_call_judged" && e.cCallRef === badAdmitSel.cCallRef);
  assert.equal(badJudged.judgment, "blocked");
});

test("T-205 B3 TRIAD: a 6-stage program runs all three fibres at the anchors — F_D executes, F_P worker passes, F_H escalates the run", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const stageRow = (role, regime, arm, resultBearing = false) => ({
    kind: "object", entries: [
      { key: "stageRole", value: role },
      { key: "defaultRegime", value: regime },
      { key: "armId", value: arm },
      { key: "resultBearing", value: resultBearing }
    ]
  });
  const sixStage = {
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: "gtl://t205/triad" },
      { key: "proportionalityClass", value: "P3" },
      { key: "stages", value: { kind: "array", items: [
        stageRow("transform", "F_P", "arm://x/t", true),
        stageRow("admit", "F_D", "arm://x/a"),
        stageRow("evaluate", "F_P", "arm://x/e"),
        stageRow("critique", "F_P", "arm://x/k"),
        stageRow("approve", "F_H", "arm://x/h"),
        stageRow("consequence", "F_D", "arm://x/c")
      ] } }
    ]
  };
  const declaredBasis = Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...basis.graphFunction.declarations.entries,
          Object.freeze({ key: "abg.hog_program", value: Object.freeze({ kind: "json_blob", value: sixStage }) })
        ])
      })
    })
  });
  const bindingRow = (role, regime, arm, ref) => ({
    programRef: "gtl://t205/triad", stageRole: role, armId: arm,
    regime, handlerRef: ref, handlerClass: "pipeline", handlerConfigRef: null
  });
  const events = [];
  const result = runEngineIterate({
    basis: declaredBasis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(declaredBasis),
    plugins: {
      handlerRegistry: {
        bindings: [
          bindingRow("admit", "F_D", "arm://x/a", "handler://triad/admit"),
          bindingRow("critique", "F_P", "arm://x/k", "handler://triad/critique"),
          bindingRow("approve", "F_H", "arm://x/h", "handler://triad/approve")
        ],
        handlers: new Map([
          ["handler://triad/admit", () => ({ outcomeStatus: "executed", evidenceRefs: ["exec-status:0"], payloadRef: null, responseContractRef: null, failureReason: null })],
          ["handler://triad/critique", () => ({ outcomeStatus: "executed", evidenceRefs: ["worker-disposition:pass"], payloadRef: null, responseContractRef: null, failureReason: null })],
          ["handler://triad/approve", () => ({ outcomeStatus: "escalated", evidenceRefs: ["approval-subject:subject://triad"], payloadRef: null, responseContractRef: null, failureReason: null })]
        ])
      },
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t205/fp-dispatch", pluginKind: "fp_dispatch",
          authority: "effect_plugin", inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://triad/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });
  // the run stops at the human gate with ESCALATED truth, not blocked
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /hog_stage_escalated: approve/);
  // all three extra fibres ran, in declared order, each spine-judged
  const opened = result.replayEvents.filter((e) => e.kind === "c_call_opened").map((e) => e.stageRole);
  const ti = opened.indexOf("transform"), ai = opened.indexOf("admit"),
        ei = opened.indexOf("evaluate"), ki = opened.indexOf("critique"), hi = opened.indexOf("approve");
  assert.equal(ti < ai && ai < ei && ei < ki && ki < hi, true, JSON.stringify(opened));
  const judgmentFor = (role) => {
    const sel = result.replayEvents.filter((e) => e.kind === "c_call_opened" && e.stageRole === role).pop();
    return result.replayEvents.find((e) => e.kind === "c_call_judged" && e.cCallRef === sel.cCallRef).judgment;
  };
  assert.equal(judgmentFor("admit"), "advance");
  assert.equal(judgmentFor("critique"), "advance");
  assert.equal(judgmentFor("approve"), "escalated");
  // regimes on the selection rows match the declared fibres
  const regimeFor = (arm) => result.replayEvents.find((e) => e.kind === "c_call_fibre_selected" && e.armId === arm).regime;
  assert.equal(regimeFor("arm://x/a"), "F_D");
  assert.equal(regimeFor("arm://x/k"), "F_P");
  assert.equal(regimeFor("arm://x/h"), "F_H");
});

test("T-205 -017 ESCALATION: retry descends the ladder — attempt 1 runs the lean rung, attempt 2 runs the deep rung, per-call replay truth", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const rungSyntax = (ref, armPrefix) => ({
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: ref },
      { key: "proportionalityClass", value: "P1" },
      { key: "stages", value: { kind: "array", items: [
        { kind: "object", entries: [
          { key: "stageRole", value: "transform" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: `${armPrefix}/t` },
          { key: "resultBearing", value: true }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "evaluate" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: `${armPrefix}/e` },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "consequence" },
          { key: "defaultRegime", value: "F_D" },
          { key: "armId", value: `${armPrefix}/c` },
          { key: "resultBearing", value: false }
        ] }
      ] } }
    ]
  });
  const declaredBasis = Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...basis.graphFunction.declarations.entries,
          Object.freeze({ key: "abg.hog_program_catalog", value: Object.freeze({ kind: "json_blob", value: {
            kind: "array", items: [rungSyntax("gtl://t205/lean", "arm://lean"), rungSyntax("gtl://t205/deep", "arm://deep")]
          } }) }),
          Object.freeze({ key: "abg.hog_program_ladder", value: Object.freeze({ kind: "json_blob", value: {
            kind: "array", items: [
              { kind: "object", entries: [ { key: "programRef", value: "gtl://t205/lean" }, { key: "fromAttempt", value: 1 } ] },
              { kind: "object", entries: [ { key: "programRef", value: "gtl://t205/deep" }, { key: "fromAttempt", value: 2 } ] }
            ]
          } }) })
        ])
      })
    })
  });
  const runLadder = (runtimeEvents, dispatchImpl) => {
    const events = [];
    const result = runEngineIterate({
      basis: declaredBasis,
      ...(runtimeEvents === null ? {} : { runtimeEvents }),
      eventSink: (event) => events.push(event),
      ...m03InstructionAssemblyRequestFields(declaredBasis),
      plugins: {
        fpDispatch: Object.freeze({
          contract: constructEnginePluginContract({
            ref: "plugin://t205/fp-dispatch", pluginKind: "fp_dispatch",
            authority: "effect_plugin", inputCarrier: "EnginePluginInput",
            outputCarrier: "FpDispatchOutcome"
          }),
          dispatch: dispatchImpl
        }),
        fpEvaluator: defaultFpEvaluatorPlugin
      }
    });
    return result;
  };
  // the worker is down (pre-spawn trio class) -> the retry lane now
  // escalates IN-RUN (run-18 fix): attempt 1 lean, attempt 2+ deep —
  // compression descent without leaving the run.
  const run1 = runLadder(null, (input) => constructFpDispatchOutcome({
    status: "blocked",
    reason: "worker down (contract_failure)",
    evidenceRefs: [input.sourceProjectionRef]
  }));
  assert.equal(run1.transition.kind, "terminal");
  const run1Transforms = run1.replayEvents.filter(
    (e) => e.kind === "c_call_fibre_selected" && e.armId.endsWith("/t")
  );
  assert.equal(run1Transforms.length >= 2, true, "in-run retry after pre-spawn failure");
  assert.equal(run1Transforms[0].programRef, "gtl://t205/lean", "attempt 1 runs the LEAN rung");
  assert.equal(run1Transforms[0].armId, "arm://lean/t");
  assert.equal(run1Transforms[1].programRef, "gtl://t205/deep", "attempt 2 escalates IN-RUN");
  assert.equal(run1Transforms[1].armId, "arm://deep/t");
  // operator fixes the worker; resume: the frontier holds and the run
  // completes on the escalated rung (attempts stay replay-global)
  const run2 = runLadder(run1.replayEvents, (input) => constructFpDispatchOutcome({
    status: "dispatched",
    resultRef: `result://esc/${input.vectorIndex}`,
    attachedResultArtifact: fulfilledAttachedArtifactFor(input),
    evidenceRefs: [input.sourceProjectionRef]
  }));
  const run2Transforms = run2.replayEvents.filter(
    (e) => e.kind === "c_call_fibre_selected" && e.armId.endsWith("/t") &&
      !run1.replayEvents.some((r) => r.cCallRef === e.cCallRef)
  );
  assert.equal(run2Transforms.length >= 1, true, "resumed attempt ran");
  // COMPRESSION DESCENT across the resume boundary (-017)
  assert.equal(run2Transforms[0].programRef, "gtl://t205/deep", "attempt 2 runs the DEEP rung");
  assert.equal(run2Transforms[0].armId, "arm://deep/t");
  // coherence: attempt-2 evaluate carries the same rung
  const deepEvaluate = run2.replayEvents.find(
    (e) => e.kind === "c_call_fibre_selected" && e.armId === "arm://deep/e"
  );
  assert.notEqual(deepEvaluate, undefined, "attempt-2 evaluate runs the deep rung");
  assert.equal(deepEvaluate.programRef, "gtl://t205/deep");
});

test("T-205 COVERAGE g2: DECLARED handler bindings drive the engine — abg.hog_handler_bindings/_configs assemble the registry; declared config reaches the handler; async impls refuse on the sync driver and run on the async driver", async () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const fourStage = {
    kind: "object",
    entries: [
      { key: "syntaxVersion", value: "hog-syntax/1" },
      { key: "programRef", value: "gtl://t205/declared-bindings" },
      { key: "proportionalityClass", value: "P2" },
      { key: "stages", value: { kind: "array", items: [
        { kind: "object", entries: [
          { key: "stageRole", value: "transform" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://db/t" },
          { key: "resultBearing", value: true }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "admit" },
          { key: "defaultRegime", value: "F_D" },
          { key: "armId", value: "arm://db/a" },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "evaluate" },
          { key: "defaultRegime", value: "F_P" },
          { key: "armId", value: "arm://db/e" },
          { key: "resultBearing", value: false }
        ] },
        { kind: "object", entries: [
          { key: "stageRole", value: "consequence" },
          { key: "defaultRegime", value: "F_D" },
          { key: "armId", value: "arm://db/c" },
          { key: "resultBearing", value: false }
        ] }
      ] } }
    ]
  };
  const declaredBasis = Object.freeze({
    ...basis,
    graphFunction: Object.freeze({
      ...basis.graphFunction,
      declarations: Object.freeze({
        entries: Object.freeze([
          ...basis.graphFunction.declarations.entries,
          Object.freeze({ key: "abg.hog_program", value: Object.freeze({ kind: "json_blob", value: fourStage }) }),
          // THE WRITE SURFACE: bindings + configs as declarations
          Object.freeze({ key: "abg.hog_handler_bindings", value: Object.freeze({ kind: "json_blob", value: {
            kind: "array", items: [ { kind: "object", entries: [
              { key: "programRef", value: "gtl://t205/declared-bindings" },
              { key: "stageRole", value: "admit" },
              { key: "armId", value: "arm://db/a" },
              { key: "regime", value: "F_D" },
              { key: "handlerRef", value: "handler://t205/declared-admit" },
              { key: "handlerClass", value: "pipeline" },
              { key: "handlerConfigRef", value: "config://t205/admit" }
            ] } ]
          } }) }),
          Object.freeze({ key: "abg.hog_handler_configs", value: Object.freeze({ kind: "json_blob", value: {
            kind: "object", entries: [
              { key: "config://t205/admit", value: { kind: "object", entries: [
                { key: "expectedMarker", value: "declared-config-arrived" }
              ] } }
            ]
          } }) })
        ])
      })
    })
  });
  const seenConfigs = [];
  const mkPlugins = (impl) => ({
    // impls arrive by ref through the plugin seam; BINDINGS come from declarations
    handlerRegistry: { bindings: [], handlers: new Map([["handler://t205/declared-admit", impl]]) },
    fpDispatch: Object.freeze({
      contract: constructEnginePluginContract({
        ref: "plugin://t205/fp-dispatch", pluginKind: "fp_dispatch",
        authority: "effect_plugin", inputCarrier: "EnginePluginInput",
        outputCarrier: "FpDispatchOutcome"
      }),
      dispatch(input) {
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: `result://db/${input.vectorIndex}`,
          attachedResultArtifact: fulfilledAttachedArtifactFor(input),
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
    }),
    fpEvaluator: defaultFpEvaluatorPlugin
  });
  // SYNC impl on the SYNC driver: declared config threads through
  const syncImpl = (input) => {
    seenConfigs.push(input.declaredConfig);
    return { outcomeStatus: "executed", evidenceRefs: ["db://ok"], payloadRef: null, responseContractRef: null, failureReason: null };
  };
  const okRun = runEngineIterate({
    basis: declaredBasis,
    eventSink: () => {},
    ...m03InstructionAssemblyRequestFields(declaredBasis),
    plugins: mkPlugins(syncImpl)
  });
  const admitSel = okRun.replayEvents.find((e) => e.kind === "c_call_fibre_selected" && e.armId === "arm://db/a");
  assert.notEqual(admitSel, undefined, "declared-binding stage ran");
  assert.equal(seenConfigs.length > 0, true);
  assert.deepEqual(seenConfigs[0], { expectedMarker: "declared-config-arrived" }, "-005: declared config reached the handler");
  // ASYNC impl on the SYNC driver: typed refusal, judged blocked, lawful stop
  const asyncImpl = async () => ({ outcomeStatus: "executed", evidenceRefs: [], payloadRef: null, responseContractRef: null, failureReason: null });
  const refused = runEngineIterate({
    basis: declaredBasis,
    eventSink: () => {},
    ...m03InstructionAssemblyRequestFields(declaredBasis),
    plugins: mkPlugins(asyncImpl)
  });
  assert.equal(refused.transition.terminalKind, "gap_stop");
  assert.match(refused.transition.reason, /hog_stage_blocked: admit/);
  const refusedSel = refused.replayEvents.filter((e) => e.kind === "c_call_fibre_selected" && e.armId === "arm://db/a").pop();
  const refusedJudged = refused.replayEvents.find((e) => e.kind === "c_call_judged" && e.cCallRef === refusedSel.cCallRef);
  assert.equal(refusedJudged.judgment, "blocked");
  const refusedEvidenced = refused.replayEvents.find((e) => e.kind === "c_call_evidenced" && e.cCallRef === refusedSel.cCallRef);
  assert.equal(refusedEvidenced.evidenceRefs.some((r) => r.includes("handler_requires_async_driver")), true, "typed refusal in evidence");
  // the SAME async impl on the ASYNC driver: advances
  const asyncRun = await runEngineIterateAsync({
    basis: declaredBasis,
    eventSink: () => {},
    ...m03InstructionAssemblyRequestFields(declaredBasis),
    plugins: mkPlugins(asyncImpl)
  });
  const asyncSel = asyncRun.replayEvents.find((e) => e.kind === "c_call_fibre_selected" && e.armId === "arm://db/a");
  const asyncJudged = asyncRun.replayEvents.find((e) => e.kind === "c_call_judged" && e.cCallRef === asyncSel.cCallRef);
  assert.equal(asyncJudged.judgment, "advance", "async handlers run on the async driver");
});

test("T-205 run-18 mirror: a PRE-SPAWN dispatch contract_failure retries in-run — never missing_process_evidence", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  let dispatches = 0;
  const events = [];
  const result = runEngineIterate({
    basis: Object.freeze({
      ...basis,
      startIntent: Object.freeze({ ...basis.startIntent, until: "converged" })
    }),
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t205/prespawn-dispatch", pluginKind: "fp_dispatch",
          authority: "effect_plugin", inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          dispatches += 1;
          if (dispatches === 1) {
            // the vector-21 shape: the plugin THROWS on a malformed plan;
            // the P4 guard converts it to typed blocked (contract_failure)
            throw new Error("Malformed execution plan command: {\"scenario\":\"...\"}");
          }
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://prespawn/${input.vectorIndex}/${dispatches}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });
  // the fix: NEVER the archive-inspection dead end for a pre-spawn failure
  if (result.transition.kind === "terminal") {
    assert.doesNotMatch(
      String(result.transition.reason ?? ""),
      /missing_process_evidence/,
      `pre-spawn failures must not dead-end: ${result.transition.reason}`
    );
  }
  // the retry lane re-dispatched after the typed conversion
  assert.equal(dispatches >= 2, true, `expected an in-run retry, got ${dispatches} dispatch(es); terminal=${JSON.stringify(result.transition.kind === "terminal" ? result.transition.terminalKind + ":" + result.transition.reason : result.transition.kind).slice(0, 160)}`);
});

test("T-205 campaign #16: invocation attempt identity is replay-global — a resumed fresh window continues numbering; resume never dead-ends in archive inspection", () => {
  const basis0 = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({ ...basis0, startIntent: Object.freeze({ ...basis0.startIntent, until: "converged" }) });
  const throwing = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://t205/c16-dispatch", pluginKind: "fp_dispatch",
      authority: "effect_plugin", inputCarrier: "EnginePluginInput", outputCarrier: "FpDispatchOutcome"
    }),
    dispatch() { throw new Error("Malformed execution plan: c16"); }
  });
  const runOnce = (runtimeEvents) => runEngineIterate({
    basis, ...(runtimeEvents === null ? {} : { runtimeEvents }),
    eventSink: () => {}, ...m03InstructionAssemblyRequestFields(basis),
    plugins: { fpDispatch: throwing, fpEvaluator: defaultFpEvaluatorPlugin }
  });
  const r1 = runOnce(null);
  assert.match(String(r1.transition.reason), /retry_exhausted|stationary/);
  const r2 = runOnce(r1.replayEvents);
  // the fix: lawful exhaustion verdict, never the inspection dead end
  assert.doesNotMatch(String(r2.transition.reason), /missing_process_evidence/);
  assert.match(String(r2.transition.reason), /retry_exhausted|stationary/);
  // attempt identity continued across the window: no duplicate invocation ids
  const ids = r2.replayEvents.filter((e) => e.kind === "actor_invocation_started").map((e) => e.actorInvocationId);
  assert.equal(new Set(ids).size, ids.length, "no invocation id collision across resume");
});

test("T-205 campaign #17: a null-basis runtime_failure_observed in the shared log does not poison projection — resume proceeds", () => {
  const basis0 = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({ ...basis0, startIntent: Object.freeze({ ...basis0.startIntent, until: "converged" }) });
  const good = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://t205/c17-dispatch", pluginKind: "fp_dispatch",
      authority: "effect_plugin", inputCarrier: "EnginePluginInput", outputCarrier: "FpDispatchOutcome"
    }),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://c17/${input.vectorIndex}`,
        attachedResultArtifact: fulfilledAttachedArtifactFor(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
  const r1 = runEngineIterate({
    basis, eventSink: () => {}, ...m03InstructionAssemblyRequestFields(basis),
    plugins: { fpDispatch: good, fpEvaluator: defaultFpEvaluatorPlugin }
  });
  assert.equal(r1.transition.terminalKind, "converged");
  // the CLI-observability event lands in the shared log with basisId null
  const poisoned = Object.freeze([
    ...r1.replayEvents,
    Object.freeze({
      kind: "runtime_failure_observed",
      basisId: null,
      surface: "cli:start",
      failureClass: "runtime_failure",
      message: "campaign #17 shape",
      stackExcerpt: null,
      eventId: "runtime-event:c17:poison",
      eventTime: new Date(1783400000000).toISOString(),
      eventTimeUnixMs: 1783400000000,
      eventAdmissionOrdinal: 999999
    })
  ]);
  const r2 = runEngineIterate({
    basis, runtimeEvents: poisoned, eventSink: () => {}, ...m03InstructionAssemblyRequestFields(basis),
    plugins: { fpDispatch: good, fpEvaluator: defaultFpEvaluatorPlugin }
  });
  assert.equal(r2.transition.kind, "terminal");
  assert.doesNotMatch(String(r2.transition.reason ?? r2.transition.terminalKind), /belongs to null/);
});

test("T-205 F5 (run-19 #21 shape): a consequence-plugin THROW is a typed blocked projection — the run never dies as a host failure", () => {
  const basis0 = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({ ...basis0, startIntent: Object.freeze({ ...basis0.startIntent, until: "converged" }) });
  const events = [];
  // must NOT throw out of the engine
  const result = runEngineIterate({
    basis, eventSink: (event) => events.push(event), ...m03InstructionAssemblyRequestFields(basis),
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t205/f5-dispatch", pluginKind: "fp_dispatch",
          authority: "effect_plugin", inputCarrier: "EnginePluginInput", outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://f5/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: defaultFpEvaluatorPlugin,
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t205/f5-consequence", pluginKind: "consequence_projection",
          authority: "effect_plugin", inputCarrier: "EnginePluginInput", outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project() { throw new Error("Cannot read properties of undefined (reading '12')"); }
      })
    }
  });
  assert.equal(result.transition.kind, "terminal");
  // the throw became typed truth in replay, not a host escape
  const blockedConsequence = result.replayEvents.some((e) =>
    typeof e.reason === "string" && e.reason.includes("consequence projection plugin threw (contract_failure)"));
  const evidenced = result.replayEvents.some((e) =>
    Array.isArray(e.evidenceRefs) && e.evidenceRefs.some((r) => String(r).startsWith("consequence-plugin-error:")));
  assert.equal(blockedConsequence || evidenced, true, "typed consequence failure visible in replay");
});
