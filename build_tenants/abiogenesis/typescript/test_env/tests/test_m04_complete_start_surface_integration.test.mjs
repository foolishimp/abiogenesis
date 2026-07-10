// Validates: REQ-P-POLICY
// Validates: REQ-R-ABG3-RUN

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  defaultFpEvaluatorPlugin
} from "../../build/semantic/code/src/index.js";
import {
  publicCallableStart
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  publicCallableStartAsync
} from "../../build/semantic/code/src/app/m04/max_autonomy/index.js";
import {
  publicStartContext,
  requestPayload
} from "./support/m04-fixtures.mjs";
import {
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fulfilledAttachedArtifact(input) {
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
      fulfillment_detail: "callable plugin result accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: input.workerId,
    selected_backend: input.backendId,
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: input.resolvedRuntimeRef
  };
}

test("M04 complete-start integration: package export surface stays aligned at root, m04, and max-autonomy subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const maxAutonomy = await import(
    "@abiogenesis/typescript-tenant/app/m04/max-autonomy"
  );

  assert.equal(root.publicCallableStart, publicCallableStart);
  assert.equal(root.publicCallableStartAsync, publicCallableStartAsync);
  assert.equal(m04.publicCallableStart, publicCallableStart);
  assert.equal(m04.publicCallableStartAsync, publicCallableStartAsync);
  assert.equal(maxAutonomy.publicCallableStart, publicCallableStart);
  assert.equal(maxAutonomy.publicCallableStartAsync, publicCallableStartAsync);
});

test("M04 complete-start integration: bare callable start advances through substrate public control without wrapper flags", () => {
  const { profile, context } = publicStartContext();
  const { until: _until, ...bareStart } = requestPayload(profile.name);
  const events = [];

  const outcome = publicCallableStart(bareStart, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "resolved");
  assert.equal(outcome.request.startRequest.controlModes.rootMode, "supervised");
  assert.equal(outcome.controlOutcome.kind, "converged");
  assert.equal(outcome.stopClass.kind, "converged");
  assert.equal(outcome.stopClass.detail, "converged");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "lever_resolution_admitted",
      "basis_admitted",
      "registry_entry_admitted",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "c_call_opened",
      "c_call_fibre_selected",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_evaluated",
      "c_call_opened",
      "c_call_fibre_selected",
      "payload_observed",
      "payload_validated",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
      "vector_closed",
      "fd_advance_ready",
      "terminal_reached"
    ]
  );
});

test("M04 complete-start integration: async callable start consumes runtime plugins under ABG control", async () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://callable-plugin"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://m04/callable-start-async/fp-dispatch"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://m04-callable/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: fulfilledAttachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });

  const outcome = await publicCallableStartAsync(
    input,
    context,
    (event) => {
      events.push(event);
    },
    {
      fpDispatch,
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  );

  assert.equal(outcome.kind, "resolved");
  assert.equal(outcome.controlOutcome.kind, "converged");
  assert.equal(outcome.stopClass.kind, "converged");
  assert.equal(
    events.some((event) => event.kind === "actor_result_artifact_observed"),
    true
  );
  assert.deepStrictEqual(
    events.filter((event) => event.kind === "vector_closed").map((event) => event.edge),
    ["input_set→requirements", "requirements→design", "design→code"]
  );
});

test("M04 complete-start integration: F_P bare callable start projects worker dispatch stop taxonomy without folklore bundle", () => {
  const { profile, context } = publicStartContext({
    policyOverrides: {
      defaultRegime: "F_P",
      dispatchRef: "dispatch://codex"
    }
  });
  const { until: _until, ...bareStart } = requestPayload(profile.name);
  const events = [];

  const outcome = publicCallableStart(bareStart, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "resolved");
  assert.equal(outcome.controlOutcome.kind, "dispatch_required");
  assert.equal(outcome.liveStatus.kind, "attention");
  assert.equal(outcome.liveStatus.runStatus, "blocked");
  assert.equal(outcome.stopClass.kind, "worker_dispatch_required");
  assert.equal(outcome.stopClass.detail, "dispatch_required");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "lever_resolution_admitted",
      "basis_admitted",
      "registry_entry_admitted",
      "graph_function_selected",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "instruction_prompt_manifest_projected",
      "c_call_opened",
      "c_call_fibre_selected",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "payload_observed",
      "payload_validated",
      "actor_invocation_closed",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged"
    ]
  );
});
