// Validates: T-135
// Validates: REQ-L-GTL3-GRAPHVECTOR-017
// Validates: REQ-L-GTL3-GRAPHVECTOR-018
// Validates: REQ-R-ABG3-FN-COMPOSITION

import test from "node:test";
import assert from "node:assert/strict";

import {
  VECTOR_RUNTIME_REGIME_DECLARATION_KEY,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  defaultFpEvaluatorPlugin,
  deriveAdvancementTransition,
  deriveEffectiveVectorRegime,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection,
  emit,
  runEngineIterate,
  runtimeEventsForIterationDecision
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fdEvaluatorContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome"
  });
}

function attachedArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "attached worker result accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function withFirstVectorDeclarations(basis, entries) {
  const vectors = [...basis.graph.vectors];
  vectors[0] = Object.freeze({
    ...vectors[0],
    declarations: Object.freeze({ entries: Object.freeze(entries) })
  });
  return Object.freeze({
    ...basis,
    graph: Object.freeze({
      ...basis.graph,
      vectors: Object.freeze(vectors)
    })
  });
}

test("T-135 vector-local F_P regime overrides basis F_D default and is emitted in traversal plan", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: "dispatch://t135/vector-local",
    vectorRegimes: ["F_P", "F_D", "F_D"]
  });
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const decision = deriveIterationAdvanceDecision(basis, projection);
  const transition = deriveAdvancementTransition(basis, []);
  const plannedEvent = runtimeEventsForIterationDecision(decision).find(
    (event) => event.kind === "vector_traversal_planned"
  );

  assert.equal(decision.kind, "advance_vector");
  assert.equal(decision.regime, "F_P");
  assert.equal(decision.effectiveRegime.source, "graph_vector_runtime_surface");
  assert.equal(transition.kind, "fp_dispatch");
  assert.equal(transition.effectiveRegime.regime, "F_P");
  assert.equal(plannedEvent.regime, "F_P");
  assert.equal(plannedEvent.regimeSource, "graph_vector_runtime_surface");
});

test("T-135 mixed F_P then F_D graph drains under one ABG runner", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: "dispatch://t135/mixed",
    vectorRegimes: ["F_P", "F_D", "F_D"]
  });
  const events = [];
  const observedFpEdges = [];
  const observedFdEdges = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t135-fp"),
    dispatch: (input) => {
      observedFpEdges.push(input.edge);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t135/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
  const fdEvaluator = Object.freeze({
    contract: fdEvaluatorContract("plugin://test/t135-fd"),
    evaluate: (input) => {
      observedFdEdges.push(input.edge);
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin, fdEvaluator }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(result.iterationCount, 3);
  assert.deepStrictEqual(observedFpEdges, ["input_set→requirements"]);
  assert.deepStrictEqual(observedFdEdges, [
    "requirements→design",
    "design→code"
  ]);
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === "vector_traversal_planned")
      .map((event) => event.regime),
    ["F_P", "F_D", "F_D"]
  );
  assert.equal(
    events.filter((event) => event.kind === "fp_dispatch_requested").length,
    1
  );
  assert.equal(
    events.filter((event) => event.kind === "fd_advance_ready").length,
    2
  );
});

test("T-135 F_H vector routing is explicit and requires an approval subject", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    approvalSubjectRef: "approval://t135",
    vectorRegimes: ["F_H", "F_D", "F_D"]
  });

  const transition = deriveAdvancementTransition(basis, []);

  assert.equal(transition.kind, "fh_escalation");
  assert.equal(transition.approvalSubjectRef, "approval://t135");
  assert.equal(transition.effectiveRegime.source, "graph_vector_runtime_surface");
  assert.throws(
    () =>
      deriveAdvancementTransition(
        buildThreeStageBasis({
          defaultRegime: "F_D",
          vectorRegimes: ["F_H", "F_D", "F_D"]
        }),
        []
      ),
    /requires approvalSubjectRef for F_H/
  );
});

test("T-135 F_P vector routing fails closed without dispatch authority", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_P", "F_D", "F_D"]
  });

  assert.throws(
    () => deriveAdvancementTransition(basis, []),
    /requires dispatchRef for F_P/
  );
});

test("T-135 vector-local regime declarations reject contradiction and duplicates", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_D", "F_D", "F_D"]
  });
  const contradictory = withFirstVectorDeclarations(basis, [
    {
      key: VECTOR_RUNTIME_REGIME_DECLARATION_KEY,
      value: { kind: "scalar", value: "F_P" }
    }
  ]);
  const duplicate = withFirstVectorDeclarations(basis, [
    {
      key: VECTOR_RUNTIME_REGIME_DECLARATION_KEY,
      value: { kind: "scalar", value: "F_D" }
    },
    {
      key: VECTOR_RUNTIME_REGIME_DECLARATION_KEY,
      value: { kind: "scalar", value: "F_P" }
    }
  ]);

  assert.throws(
    () => deriveEffectiveVectorRegime({ basis: contradictory, vectorIndex: 0 }),
    /declares F_P but its operators\/evaluators declare F_D/
  );
  assert.throws(
    () => deriveEffectiveVectorRegime({ basis: duplicate, vectorIndex: 0 }),
    /Duplicate vector runtime regime declaration/
  );
});

test("T-135 replay advances from the effective regime selected after first vector close", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: "dispatch://t135/replay",
    vectorRegimes: ["F_P", "F_D", "F_D"]
  });
  const firstProjection = deriveRuntimeAggregateProjection(basis, []);
  const firstDecision = deriveIterationAdvanceDecision(basis, firstProjection);
  const replayEvents = [
    ...emit(runtimeEventsForIterationDecision(firstDecision), () => {}),
    constructVectorEvaluatedEvent({
      basis,
      vectorIndex: 0,
      status: "accepted"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    })
  ];

  const secondTransition = deriveAdvancementTransition(basis, replayEvents);

  assert.equal(secondTransition.kind, "fd_advance");
  assert.equal(secondTransition.vectorIndex, 1);
  assert.equal(secondTransition.effectiveRegime.regime, "F_D");
});
