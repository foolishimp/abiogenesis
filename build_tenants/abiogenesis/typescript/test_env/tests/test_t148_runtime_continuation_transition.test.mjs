// Validates: T-148
// Validates: REQ-R-ABG3-PROJECTION-019

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorTraversalPlannedEvent,
  deriveAssuranceScopeRef,
  deriveRuntimeAggregateProjection,
  deriveRuntimeContinuationTransitionProjection,
  runEngineIterate,
  terminalTransitionForRuntimeContinuationProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

function runtimeFixture({ vectorIndex = 1 } = {}) {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t148"
  });
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex })
  ];
  const projection = deriveRuntimeAggregateProjection(basis, events);
  return { basis, vectorIndex, projection };
}

function traversalAction(runtime, action) {
  return Object.freeze({
    kind: "traversal_continuation_action_projection",
    projectionRef: `traversal-action://t148/${action}`,
    sourceCarrierRef: `traversal-carrier://t148/${action}`,
    basisId: runtime.basis.id,
    graphFunctionId: runtime.basis.graphFunction.id,
    runId: runtime.basis.runId,
    workKey: runtime.basis.workKey,
    graphCallId: runtime.projection.graphCallId,
    frameId: runtime.projection.frameId,
    frameLineageId: null,
    vectorIndex: runtime.vectorIndex,
    edge: runtime.basis.graph.vectors[runtime.vectorIndex].name,
    actorInvocationId: "actor://t148",
    action,
    publicSummaryAction: action,
    retryEligible: action === "retry_same_edge",
    terminal: action !== "retry_same_edge" && action !== "yield_same_edge_continuation",
    runtimeFailureClass: "no_output",
    retryBudget: {
      observedAttemptCount: 1,
      maxAttempts: 3,
      remainingAttempts: 2,
      stationary: false
    },
    reason: `reason:${action}`,
    reasonRefs: [`reason-ref://t148/${action}`],
    evidenceRefs: [`evidence://t148/${action}`]
  });
}

function assuranceDecision(runtime, decision) {
  const scope = deriveAssuranceScopeRef({
    basis: runtime.basis,
    projection: runtime.projection,
    vectorIndex: runtime.vectorIndex
  });
  return Object.freeze({
    kind: "assurance_closure_decision",
    decision,
    scope,
    projectionRef: `assurance://t148/${decision}`,
    blockingStatuses: decision === "close" ? [] : ["missing"],
    rowIds: decision === "close" ? [] : [`row://t148/${decision}`],
    reason: `assurance:${decision}`
  });
}

function derive(runtime, extra) {
  return deriveRuntimeContinuationTransitionProjection({
    basis: runtime.basis,
    runtimeProjection: runtime.projection,
    vectorIndex: runtime.vectorIndex,
    ...extra
  });
}

test("T-148 typed transition facts outrank terminal retry fallback", () => {
  const runtime = runtimeFixture();

  assert.deepEqual(
    derive(runtime, { terminalRetryRefs: ["terminal://retry"] }),
    {
      ...derive(runtime, { terminalRetryRefs: ["terminal://retry"] }),
      disposition: "retry_same_edge",
      reason: "terminal_retry_fallback",
      retryEligible: true,
      terminal: false,
      terminalKind: null
    }
  );

  assert.equal(
    derive(runtime, {
      typedBlockRefs: ["typed://block"],
      terminalRetryRefs: ["terminal://retry"]
    }).disposition,
    "block"
  );
  assert.equal(
    derive(runtime, {
      typedRepriceRefs: ["typed://reprice"],
      terminalRetryRefs: ["terminal://retry"]
    }).disposition,
    "reprice"
  );
  const yielded = derive(runtime, {
    traversalContinuationAction: traversalAction(runtime, "retry_same_edge"),
    typedYieldRefs: ["typed://yield"],
    terminalRetryRefs: ["terminal://retry"]
  });
  assert.equal(yielded.disposition, "yield_continuation");
  assert.equal(yielded.reason, "typed_yield");
});

test("T-148 traversal action projection maps to one runtime transition", () => {
  const runtime = runtimeFixture();
  const cases = [
    ["inspect_runtime_archive", "inspect_runtime_archive", "gap_stop"],
    ["retry_exhausted", "block", "gap_stop"],
    ["blocked", "block", "gap_stop"],
    ["reprice_runtime_policy", "reprice", "gap_stop"],
    ["yield_same_edge_continuation", "yield_continuation", "yielded"],
    ["retry_same_edge", "retry_same_edge", null]
  ];

  for (const [action, disposition, terminalKind] of cases) {
    const projection = derive(runtime, {
      traversalContinuationAction: traversalAction(runtime, action),
      terminalRetryRefs: ["terminal://fallback"]
    });
    assert.equal(projection.disposition, disposition);
    assert.equal(projection.terminalKind, terminalKind);
  }
});

test("T-148 assurance closure decision feeds transition before fallback", () => {
  const runtime = runtimeFixture();
  const cases = [
    ["block", "block", "assurance_block"],
    ["reprice", "reprice", "assurance_reprice"],
    ["qualified_defer", "yield_continuation", "assurance_qualified_defer"],
    ["retry", "retry_same_edge", "assurance_retry"],
    ["close", "close", "assurance_close"]
  ];

  for (const [decision, disposition, reason] of cases) {
    const projection = derive(runtime, {
      assuranceClosureDecision: assuranceDecision(runtime, decision),
      terminalRetryRefs: decision === "block" ? ["terminal://retry"] : []
    });
    assert.equal(projection.disposition, disposition);
    assert.equal(projection.reason, reason);
  }
});

test("T-148 terminal conversion is total for non-retry projections", () => {
  const runtime = runtimeFixture();
  const blocked = derive(runtime, { typedBlockRefs: ["typed://block"] });
  const yielded = derive(runtime, { typedYieldRefs: ["typed://yield"] });
  const retry = derive(runtime, { terminalRetryRefs: ["terminal://retry"] });

  const blockedTerminal = terminalTransitionForRuntimeContinuationProjection({
    basis: runtime.basis,
    projection: blocked
  });
  const yieldedTerminal = terminalTransitionForRuntimeContinuationProjection({
    basis: runtime.basis,
    projection: yielded
  });

  assert.equal(blockedTerminal.kind, "terminal");
  assert.equal(blockedTerminal.terminalKind, "gap_stop");
  assert.equal(
    blockedTerminal.reason,
    "runtime_continuation_transition:block:typed_block"
  );
  assert.equal(yieldedTerminal.terminalKind, "yielded");
  assert.equal(
    terminalTransitionForRuntimeContinuationProjection({
      basis: runtime.basis,
      projection: retry
    }),
    null
  );
});

test("T-148 runner path uses runtime continuation transition projection", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t148-runner"
  });
  const fpDispatch = Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "sync_compatible",
      ref: "plugin://test/t148-runner-inspect",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch: () =>
      constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t148-runner/missing-process",
        reason: "worker status unavailable"
      })
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => {},
    plugins: { fpDispatch }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(
    result.transition.reason,
    "runtime_continuation_transition:inspect_runtime_archive:inspect_runtime_archive:missing_process_evidence"
  );
});
