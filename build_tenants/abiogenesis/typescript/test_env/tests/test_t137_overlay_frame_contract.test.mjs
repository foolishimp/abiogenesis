// Validates: T-137
// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-PROJECTION

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructObservedStateAdmittedEvent,
  constructOverlayFrameContract,
  constructOverlayFrameDeclaredEvent,
  constructOverlayFrameEvaluatedEvent,
  constructOverlayFramePredicateBinding,
  constructOverlayFrameScopeRef,
  deriveObservedStateProjection,
  deriveOverlayFrameProjection,
  deriveRuntimeAggregateProjection,
  evaluateOverlayFrameContract
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const basis = buildThreeStageBasis({
  defaultRegime: "F_D",
  runId: "run://t137",
  workKey: "work-key://t137"
});

function observedStateEvent(observedStateRef, eventWatermark = 1) {
  return constructObservedStateAdmittedEvent({
    basis,
    observedStateRef,
    sourceKind: "register_json",
    scopeRef: "scope://t137/overlay",
    sourceRef: `register://t137/${observedStateRef.split("/").at(-1)}`,
    digest: `sha256:${observedStateRef}`,
    version: `version://${eventWatermark}`,
    eventWatermark,
    freshnessPolicyRef: "freshness-policy://t137/current",
    derivationBasisRef: "basis://t137/runtime",
    basisProjectionRef: `runtime-projection://t137/${eventWatermark}`,
    derivedFromRefs: [`runtime-event://t137/${eventWatermark}`],
    causationEventRefs: ["runtime-event://t137/root"],
    correlationId: `correlation://t137/${eventWatermark}`
  });
}

function overlayContract(input = {}) {
  return constructOverlayFrameContract({
    basis,
    overlayFrameRef: input.overlayFrameRef ?? "overlay-frame://t137/lane",
    contractRef: input.contractRef ?? "overlay-frame-contract://t137/lane",
    scopeRefs: input.scopeRefs ?? [
      constructOverlayFrameScopeRef({
        basis,
        scopeKind: "graph_function"
      }),
      constructOverlayFrameScopeRef({
        basis,
        scopeKind: "graph_vector",
        vectorIndex: 1
      }),
      constructOverlayFrameScopeRef({
        basis,
        scopeKind: "graph_span",
        spanId: `graph-span:${basis.id}:0->2`,
        vectorIndex: 2
      })
    ],
    fireWhen:
      input.fireWhen ??
      constructOverlayFramePredicateBinding({
        predicateRef: "overlay-predicate://t137/fire",
        role: "fire_when",
        expressionRef: "predicate-expression://all-observed-state-present",
        observedStateRefs: ["observed-state://t137/fire"]
      }),
    terminateWhen:
      input.terminateWhen ??
      constructOverlayFramePredicateBinding({
        predicateRef: "overlay-predicate://t137/terminate",
        role: "terminate_when",
        expressionRef: "predicate-expression://all-observed-state-present",
        observedStateRefs: ["observed-state://t137/done"]
      }),
    pressureRefs: input.pressureRefs ?? ["pressure://t137/requirement/1"],
    foldbackTargetRef: input.foldbackTargetRef ?? "overlay-parent://t137/root",
    reentryTargetVectorIndex: input.reentryTargetVectorIndex ?? 1,
    noClosePolicyRef: input.noClosePolicyRef ?? null
  });
}

test("T-137 overlay frames carry pressure until terminate predicate and clearing evidence", () => {
  const contract = overlayContract();
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const fireEvent = observedStateEvent("observed-state://t137/fire", 1);
  const firedOutcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent])
  });
  const firedEvent = constructOverlayFrameEvaluatedEvent({
    basis,
    outcome: firedOutcome
  });

  assertRuntimeEvent(declared);
  assertRuntimeEvent(firedEvent);
  assert.equal(firedOutcome.fireSatisfied, true);
  assert.equal(firedOutcome.terminateSatisfied, false);
  assert.equal(firedOutcome.pressureDecision, "carry_pressure");

  const firedProjection = deriveRuntimeAggregateProjection(basis, [
    fireEvent,
    declared,
    firedEvent
  ]);
  assert.equal(firedProjection.overlayFrame.activeRows.length, 1);
  assert.deepEqual(firedProjection.overlayFrame.carriedPressureRefs, [
    "pressure://t137/requirement/1"
  ]);

  const doneEvent = observedStateEvent("observed-state://t137/done", 2);
  const noEvidenceOutcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent, doneEvent])
  });
  assert.equal(noEvidenceOutcome.pressureDecision, "carry_pressure");
  assert.deepEqual(noEvidenceOutcome.diagnosticRefs, [
    "overlay_frame_pressure_clearance_missing"
  ]);

  const clearedOutcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent, doneEvent]),
    clearingEvidenceRefs: ["evidence://t137/execution-pass"]
  });
  const clearedEvent = constructOverlayFrameEvaluatedEvent({
    basis,
    outcome: clearedOutcome
  });
  const clearedProjection = deriveOverlayFrameProjection({
    basis,
    events: [fireEvent, doneEvent, declared, clearedEvent]
  });

  assert.equal(clearedOutcome.pressureDecision, "clear_pressure");
  assert.deepEqual(clearedProjection.activeOverlayFrameRefs, []);
  assert.deepEqual(clearedProjection.clearedPressureRefs, [
    "pressure://t137/requirement/1"
  ]);
});

test("T-137 overlay projection preserves declared waiting active and closed lifecycle", () => {
  const contract = overlayContract();
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const declaredProjection = deriveOverlayFrameProjection({
    basis,
    events: [declared]
  });

  assert.equal(declaredProjection.rows[0].status, "declared");
  assert.deepEqual(declaredProjection.activeOverlayFrameRefs, [
    "overlay-frame://t137/lane"
  ]);

  const waitingOutcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([])
  });
  const waiting = constructOverlayFrameEvaluatedEvent({
    basis,
    outcome: waitingOutcome
  });
  const waitingProjection = deriveOverlayFrameProjection({
    basis,
    events: [declared, waiting]
  });

  assert.equal(waitingOutcome.fireSatisfied, false);
  assert.equal(waitingOutcome.terminateSatisfied, false);
  assert.equal(waitingOutcome.pressureDecision, "carry_pressure");
  assert.deepEqual(waitingOutcome.diagnosticRefs, [
    "overlay_frame_observed_state_missing"
  ]);
  assert.equal(waitingProjection.rows[0].status, "waiting");
  assert.deepEqual(waitingProjection.carriedPressureRefs, [
    "pressure://t137/requirement/1"
  ]);

  const fireEvent = observedStateEvent("observed-state://t137/fire", 1);
  const activeOutcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent])
  });
  const active = constructOverlayFrameEvaluatedEvent({
    basis,
    outcome: activeOutcome
  });
  const activeProjection = deriveOverlayFrameProjection({
    basis,
    events: [fireEvent, declared, active]
  });

  assert.equal(activeOutcome.fireSatisfied, true);
  assert.equal(activeOutcome.terminateSatisfied, false);
  assert.equal(activeProjection.rows[0].status, "active");
  assert.equal(activeProjection.rows[0].foldbackTargetRef, "overlay-parent://t137/root");
  assert.equal(activeProjection.rows[0].reentryTargetVectorIndex, 1);

  const doneEvent = observedStateEvent("observed-state://t137/done", 2);
  const closedOutcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent, doneEvent]),
    clearingEvidenceRefs: ["evidence://t137/execution-pass"]
  });
  const closed = constructOverlayFrameEvaluatedEvent({
    basis,
    outcome: closedOutcome
  });
  const closedProjection = deriveOverlayFrameProjection({
    basis,
    events: [fireEvent, doneEvent, declared, closed]
  });

  assert.equal(closedProjection.rows[0].status, "closed");
  assert.deepEqual(closedProjection.activeOverlayFrameRefs, []);
  assert.deepEqual(closedProjection.clearedPressureRefs, [
    "pressure://t137/requirement/1"
  ]);
});

test("T-137 overlay frame with no pressure clears when predicates terminate", () => {
  const contract = overlayContract({
    overlayFrameRef: "overlay-frame://t137/no-pressure",
    contractRef: "overlay-frame-contract://t137/no-pressure",
    pressureRefs: []
  });
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const fireEvent = observedStateEvent("observed-state://t137/fire", 1);
  const doneEvent = observedStateEvent("observed-state://t137/done", 2);
  const outcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent, doneEvent])
  });
  const evaluated = constructOverlayFrameEvaluatedEvent({ basis, outcome });
  const projection = deriveOverlayFrameProjection({
    basis,
    events: [fireEvent, doneEvent, declared, evaluated]
  });

  assert.equal(outcome.pressureDecision, "clear_pressure");
  assert.deepEqual(outcome.clearedPressureRefs, []);
  assert.equal(projection.rows[0].status, "closed");
  assert.deepEqual(projection.activeOverlayFrameRefs, []);
});

test("T-137 no-close policy terminates an overlay without clearing pressure", () => {
  const contract = overlayContract({
    noClosePolicyRef: "policy://t137/no-close"
  });
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const fireEvent = observedStateEvent("observed-state://t137/fire", 1);
  const doneEvent = observedStateEvent("observed-state://t137/done", 2);
  const outcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent, doneEvent])
  });
  const evaluated = constructOverlayFrameEvaluatedEvent({ basis, outcome });
  const projection = deriveOverlayFrameProjection({
    basis,
    events: [fireEvent, doneEvent, declared, evaluated]
  });

  assert.equal(outcome.pressureDecision, "no_close");
  assert.deepEqual(outcome.clearedPressureRefs, []);
  assert.deepEqual(projection.carriedPressureRefs, [
    "pressure://t137/requirement/1"
  ]);
  assert.equal(projection.rows[0].status, "no_close");
});

test("T-137 overlay predicate evaluation must replay from admitted observed state", () => {
  const contract = overlayContract();
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const fireEvent = observedStateEvent("observed-state://t137/fire", 1);
  const outcome = evaluateOverlayFrameContract({
    basis,
    contract,
    observedState: deriveObservedStateProjection([fireEvent])
  });
  const evaluated = constructOverlayFrameEvaluatedEvent({ basis, outcome });
  const corrupted = {
    ...evaluated,
    predicateEvaluations: evaluated.predicateEvaluations.map((row) => (
      row.role === "terminate_when"
        ? { ...row, satisfied: true, missingObservedStateRefs: [] }
        : row
    ))
  };

  assert.throws(
    () =>
      deriveOverlayFrameProjection({
        basis,
        events: [fireEvent, declared, corrupted]
      }),
    /must derive/
  );
});

test("T-137 overlay scopes bind to GTL anchors and reject rival topology kinds", () => {
  const contract = overlayContract();
  const declared = constructOverlayFrameDeclaredEvent({ basis, contract });
  const illegal = {
    ...declared,
    scopeRefs: [
      {
        ...declared.scopeRefs[0],
        scopeKind: "overlay_topology"
      }
    ]
  };

  assert.deepEqual(
    contract.scopeRefs.map((scope) => scope.scopeKind),
    ["graph_function", "graph_vector", "graph_span"]
  );
  assert.throws(
    () => assertRuntimeEvent(illegal),
    /OverlayFrameDeclaredEvent\.scopeRefs\[0\]\.scopeKind must be one of/
  );
});
