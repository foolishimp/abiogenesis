// Validates: T-138
// Validates: REQ-L-GTL3-EVALUATOR-008
// Validates: REQ-R-ABG3-FPC-011

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitFdEvaluationOutcome,
  assertRuntimeEvent,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  deriveFdPressureRoutingDecision,
  runEngineIterate
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function fdEvaluatorContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome"
  });
}

function withFirstVectorConsumedFieldRefs(basis, consumedFieldRefs) {
  const vectors = [...basis.graph.vectors];
  const vector = vectors[0];
  vectors[0] = Object.freeze({
    ...vector,
    evaluators: Object.freeze(
      vector.evaluators.map((evaluator) =>
        Object.freeze({
          ...evaluator,
          consumedFieldRefs: Object.freeze([...consumedFieldRefs])
        })
      )
    )
  });
  return Object.freeze({
    ...basis,
    graph: Object.freeze({
      ...basis.graph,
      vectors: Object.freeze(vectors)
    })
  });
}

function fdRunner(input) {
  const events = [];
  const result = runEngineIterate({
    basis: input.basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract(input.contractRef),
        evaluate: input.evaluate
      })
    }
  });
  return { result, events };
}

test("T-138 F_D authority routing derives from severity and consumed fields", () => {
  assert.equal(
    deriveFdPressureRoutingDecision({
      status: "accepted",
      severityClass: null,
      affectedFieldRefs: [],
      consumedFieldRefs: []
    }),
    "continue"
  );
  assert.equal(
    deriveFdPressureRoutingDecision({
      status: "blocked",
      severityClass: "protocol_invalid",
      affectedFieldRefs: ["runtime.event.kind"],
      consumedFieldRefs: []
    }),
    "block"
  );
  assert.equal(
    deriveFdPressureRoutingDecision({
      status: "blocked",
      severityClass: "diagnostic_shape_invalid",
      affectedFieldRefs: ["display.notes"],
      consumedFieldRefs: ["routing.status"]
    }),
    "preserve_pressure"
  );
  assert.equal(
    deriveFdPressureRoutingDecision({
      status: "blocked",
      severityClass: "diagnostic_shape_invalid",
      affectedFieldRefs: ["routing.status"],
      consumedFieldRefs: ["routing.status"]
    }),
    "block"
  );
  assert.equal(
    deriveFdPressureRoutingDecision({
      status: "blocked",
      severityClass: "content_unproven",
      affectedFieldRefs: ["product.meaning"],
      consumedFieldRefs: ["routing.status"]
    }),
    "route_to_fp"
  );
});

test("T-138 F_D outcome admission rejects blocked outcomes without authority placement", () => {
  assert.throws(
    () =>
      admitFdEvaluationOutcome({
        kind: "fd_evaluation",
        status: "blocked"
      }),
    /blocked status requires severityClass/
  );
  assert.throws(
    () =>
      admitFdEvaluationOutcome({
        kind: "fd_evaluation",
        status: "accepted",
        severityClass: "content_unproven"
      }),
    /accepted F_D outcome cannot carry severity/
  );
  assert.throws(
    () =>
      admitFdEvaluationOutcome({
        kind: "fd_evaluation",
        status: "blocked",
        severityClass: "content_unproven",
        routingDecision: "block"
      }),
    /contradicts admitted F_D authority routing/
  );
});

test("T-138 diagnostic_shape_invalid preserves pressure and continues when fields are not consumed", () => {
  const basis = withFirstVectorConsumedFieldRefs(
    buildThreeStageBasis({ defaultRegime: "F_D", dispatchRef: null }),
    ["routing.status"]
  );
  let count = 0;
  const { result, events } = fdRunner({
    basis,
    contractRef: "plugin://test/t138-diagnostic-nonconsumed",
    evaluate: (input) => {
      count += 1;
      if (count === 1) {
        return constructFdEvaluationOutcome({
          status: "blocked",
          severityClass: "diagnostic_shape_invalid",
          affectedFieldRefs: ["display.notes"],
          consumedFieldRefs: input.consumedFieldRefs,
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
  const fdAuthorityEvents = events.filter(
    (event) => event.kind === "fd_authority_outcome_admitted"
  );

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.iterationCount, 3);
  assert.equal(fdAuthorityEvents[0].routingDecision, "preserve_pressure");
  assert.equal(fdAuthorityEvents[0].severityClass, "diagnostic_shape_invalid");
  assert.deepEqual(fdAuthorityEvents[0].pressureRefs, [
    "fd-pressure:preserve_pressure:diagnostic_shape_invalid:display.notes"
  ]);
  assertRuntimeEvent(fdAuthorityEvents[0]);
});

test("T-138 diagnostic_shape_invalid blocks when a consumed field is malformed", () => {
  const basis = withFirstVectorConsumedFieldRefs(
    buildThreeStageBasis({ defaultRegime: "F_D", dispatchRef: null }),
    ["routing.status"]
  );
  const { result, events } = fdRunner({
    basis,
    contractRef: "plugin://test/t138-diagnostic-consumed",
    evaluate: (input) =>
      constructFdEvaluationOutcome({
        status: "blocked",
        severityClass: "diagnostic_shape_invalid",
        affectedFieldRefs: ["routing.status"],
        consumedFieldRefs: input.consumedFieldRefs,
        evidenceRefs: [input.sourceProjectionRef]
      })
  });
  const fdAuthorityEvent = events.find(
    (event) => event.kind === "fd_authority_outcome_admitted"
  );

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(fdAuthorityEvent.routingDecision, "block");
  assert.equal(result.iterationCount, 0);
});

test("T-138 content_unproven routes to F_P pressure instead of deterministic block", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_D", dispatchRef: null });
  const { result, events } = fdRunner({
    basis,
    contractRef: "plugin://test/t138-content-unproven",
    evaluate: (input) =>
      constructFdEvaluationOutcome({
        status: "blocked",
        severityClass: "content_unproven",
        affectedFieldRefs: ["product.meaning"],
        consumedFieldRefs: input.consumedFieldRefs,
        evidenceRefs: [input.sourceProjectionRef]
      })
  });
  const fdAuthorityEvent = events.find(
    (event) => event.kind === "fd_authority_outcome_admitted"
  );

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "yielded");
  assert.match(result.transition.reason, /routed content pressure to F_P/);
  assert.equal(fdAuthorityEvent.routingDecision, "route_to_fp");
});
