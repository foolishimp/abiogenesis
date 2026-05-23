// Validates: REQ-R-ABG3-TRANSPORT-010
// Validates: REQ-R-ABG3-TRANSPORT-011
// Validates: REQ-R-ABG3-TRANSPORT-012
// Validates: REQ-R-ABG3-TRANSPORT-013
// Validates: REQ-R-ABG3-TRANSPORT-014
// Validates: REQ-R-ABG3-TRANSPORT-015
// Validates: T-087

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitFpDispatchOutcome,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  defaultFpEvaluatorPlugin,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function attachedArtifact(input, options = {}) {
  const fulfillmentStatus = options.fulfillmentStatus ?? "fulfilled";
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: options.edge ?? input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: fulfillmentStatus,
      fulfillment_detail:
        fulfillmentStatus === "fulfilled"
          ? "actor result accepted"
          : "actor result still incomplete",
      blocking_reasons:
        fulfillmentStatus === "fulfilled" ? [] : ["actor result still incomplete"],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

test("T-087 actor invocation: same-edge retry creates fresh one-to-one actor identity", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://supervised-actor"
  });
  const events = [];
  const observedInputs = [];
  const attemptByEdge = new Map();
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t087-actor-identity"),
    dispatch: (input) => {
      observedInputs.push(input);
      assert.ok(input.actorInvocationRef);

      const nextAttempt = (attemptByEdge.get(input.edge) ?? 0) + 1;
      attemptByEdge.set(input.edge, nextAttempt);
      const fulfillmentStatus =
        input.edge === "input_set→requirements" && nextAttempt === 1
          ? "blocked"
          : "fulfilled";

      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t087/${encodeURIComponent(input.edge)}/${nextAttempt}`,
        attachedResultArtifact: attachedArtifact(input, { fulfillmentStatus }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");

  const firstEdgeActorRefs = observedInputs
    .filter((input) => input.edge === "input_set→requirements")
    .map((input) => input.actorInvocationRef);
  assert.equal(firstEdgeActorRefs.length, 2);
  assert.deepStrictEqual(
    firstEdgeActorRefs.map((ref) => ref.attemptIndex),
    [1, 2]
  );
  assert.notEqual(
    firstEdgeActorRefs[0].actorInvocationId,
    firstEdgeActorRefs[1].actorInvocationId
  );

  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === "actor_invocation_started")
      .map((event) => event.actorInvocationId),
    result.projection.actorInvocationRefs.map((ref) => ref.actorInvocationId)
  );
  assert.equal(result.projection.actorInvocationRefs.length, 4);
  assert.equal(result.projection.observedActorArtifactRefs.length, 4);
});

test("T-087 actor invocation: blocked transport with a valid artifact is salvaged through ABG admission", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://supervised-actor"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t087-blocked-with-artifact"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "blocked",
        reason: "transport timeout after result writeback",
        resultRef: `result://t087-salvage/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.deepStrictEqual(result.projection.closedVectorIndexes, [0, 1, 2]);
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === "actor_invocation_closed")
      .map((event) => event.closureStatus),
    ["blocked_with_artifact", "blocked_with_artifact", "blocked_with_artifact"]
  );
  assert.deepStrictEqual(
    events.filter((event) => event.kind === "vector_closed").map((event) => event.edge),
    ["input_set→requirements", "requirements→design", "design→code"]
  );
  for (const edge of ["input_set→requirements", "requirements→design", "design→code"]) {
    const authority = events.find(
      (event) => event.kind === "authority_snapshot_admitted" && event.edge === edge
    );
    const observed = events.find(
      (event) =>
        event.kind === "payload_observed" &&
        event.edge === edge &&
        event.contractRef === "contract://abg/fp-transform-evidence"
    );
    const validated = events.find(
      (event) =>
        event.kind === "payload_validated" &&
        event.edge === edge &&
        event.contractRef === "contract://abg/fp-transform-evidence"
    );
    const evidence = events.find(
      (event) => event.kind === "evidence_admitted" && event.edge === edge
    );

    assert.ok(authority, `${edge} authority snapshot missing`);
    assert.ok(observed, `${edge} observed payload missing`);
    assert.ok(validated, `${edge} validated payload missing`);
    assert.ok(evidence, `${edge} admitted evidence missing`);
    assert.equal(validated.payloadRef, observed.payloadRef);
    assert.equal(validated.digest, observed.digest);
    assert.equal(evidence.payloadRef, observed.payloadRef);
    assert.equal(evidence.authorityRef, authority.authorityRefs[0]);
    assert.equal(evidence.authorityDigest, authority.authorityDigest);
    assert.equal(evidence.inputDigest, authority.inputDigest);
  }
});

test("T-087 actor invocation: malformed observed artifact becomes terminal payload-contract failure", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://supervised-actor"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t087-malformed-artifact"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t087-malformed/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: {},
        evidenceRefs: [input.sourceProjectionRef]
      })
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.deepStrictEqual(result.projection.closedVectorIndexes, []);
  assert.equal(
    events.some((event) => event.kind === "actor_result_artifact_observed"),
    true
  );
  assert.equal(events.some((event) => event.kind === "assessed"), false);
  assert.match(
    result.transition.reason ?? "",
    /payload_contract_failure: FpDispatchOutcome\.attachedResultArtifact\.edge/u
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "retry_attempt_stopped" &&
        event.reason === "retry_budget_exhausted"
    ),
    true
  );
});

test("T-087 negative: F_P plugin output cannot carry actor invocation authority", () => {
  assert.throws(
    () =>
      admitFpDispatchOutcome({
        kind: "fp_dispatch",
        status: "dispatched",
        resultRef: "result://malicious",
        attachedResultArtifact: {},
        actorInvocationId: "actor://malicious"
      }),
    /engine authority/i
  );

  assert.throws(
    () =>
      admitFpDispatchOutcome({
        kind: "fp_dispatch",
        status: "dispatched",
        resultRef: "result://malicious",
        attachedResultArtifact: {},
        actorInvocationRef: {
          actorInvocationId: "actor://malicious"
        }
      }),
    /engine authority/i
  );
});
