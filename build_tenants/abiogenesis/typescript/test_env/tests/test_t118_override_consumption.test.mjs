// T-118 acceptance-level tests: prove the override bundle is actually CONSUMED
// through the real admission path (catches the dormancy class), and prove the
// consumed default resolution is replay-visible in the runtime event stream.

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicCallableStartRequest,
  publicCallableStart,
  publicStart
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  assertRuntimeEvent,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  defaultFpEvaluatorPlugin
} from "../../build/semantic/code/src/abg/m03/index.js";
import { admitAbgLeverOverridesBundle } from "../../build/semantic/code/src/shared/lever_registry/overrides.js";
import { publicStartContext, requestPayload } from "./support/m04-fixtures.mjs";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

function overrideBundle(overrides) {
  return admitAbgLeverOverridesBundle({
    kind: "abg_lever_overrides_bundle",
    abgDefaultsFamily: "abg_defaults",
    version: 1,
    bundleRef: "lever-overrides://t118-consumption",
    overrides
  });
}

function leverResolutionEvent(events) {
  const event = events.find(
    (candidate) => candidate.kind === "lever_resolution_admitted"
  );
  assert.ok(event, "expected a replay-visible lever resolution event");
  assertRuntimeEvent(event);
  return event;
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

function attachedArtifact(input, fulfillmentStatus) {
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
      fulfillment_status: fulfillmentStatus,
      fulfillment_detail:
        fulfillmentStatus === "fulfilled"
          ? "attached worker result accepted"
          : "current edge still has open pressure",
      blocking_reasons:
        fulfillmentStatus === "fulfilled" ? [] : ["current edge still has open pressure"],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

test("T-118 AC: admission consumes the lever override for fh_mode", () => {
  const { profile } = publicStartContext();
  const input = requestPayload(profile.name); // until=converged, no fh_mode

  const overridden = admitPublicCallableStartRequest(
    input,
    "PublicCallableStartRequest",
    overrideBundle({ "abg.m04.fh_mode": "human-proxy" })
  );
  assert.equal(overridden.startRequest.controlModes.fhMode, "human-proxy");

  // No bundle -> registry default (behavior preserved).
  const baseline = admitPublicCallableStartRequest(input);
  assert.equal(baseline.startRequest.controlModes.fhMode, "direct");
});

test("T-118 AC: explicit request fh_mode still beats the override", () => {
  const { profile } = publicStartContext();
  const input = requestPayload(profile.name, { fh_mode: "direct" });

  const overridden = admitPublicCallableStartRequest(
    input,
    "PublicCallableStartRequest",
    overrideBundle({ "abg.m04.fh_mode": "human-proxy" })
  );
  assert.equal(overridden.startRequest.controlModes.fhMode, "direct");
});

test("T-118 AC: override resolution provenance is replay-visible", () => {
  const { profile, context } = publicStartContext();
  const { until: _until, ...input } = requestPayload(profile.name);
  const bundle = overrideBundle({ "abg.m04.fh_mode": "human-proxy" });
  const events = [];

  const outcome = publicCallableStart(
    input,
    {
      ...context,
      leverOverridesBundle: bundle
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "resolved");
  assert.equal(outcome.request.startRequest.controlModes.fhMode, "human-proxy");
  const event = leverResolutionEvent(events);
  assert.equal(event.bundleRef, bundle.bundleRef);
  assert.equal(event.bundleDigest, bundle.bundleDigest);
  assert.equal(event.bundlePath, null);
  assert.equal(event.untilLeverKey, "abg.m04.until");
  assert.equal(event.untilSource, "registry_default");
  assert.equal(event.fhModeLeverKey, "abg.m04.fh_mode");
  assert.equal(event.fhModeSource, "override");
  assert.equal(event.runnerRetryMaxAttemptsLeverKey, "abg.runner.retry.max_attempts");
  assert.equal(event.runnerRetryMaxAttemptsSource, "registry_default");
  assert.equal(event.runnerRetryMaxAttempts, 3);
  assert.deepStrictEqual(event.selectedLeverKeys, [
    "abg.m04.until",
    "abg.m04.fh_mode",
    "abg.runner.retry.max_attempts"
  ]);
  assert.equal(event.fhMode, "human-proxy");
  assert.equal(event.rootMode, "supervised");
});

test("T-118 AC: publicStart consumes fh_mode override and emits provenance", () => {
  const { profile, context } = publicStartContext();
  const input = requestPayload(profile.name);
  const bundle = overrideBundle({ "abg.m04.fh_mode": "human-proxy" });
  const events = [];

  const outcome = publicStart(
    input,
    {
      ...context,
      leverOverridesBundle: bundle
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "converged");
  const event = leverResolutionEvent(events);
  assert.equal(event.bundleRef, bundle.bundleRef);
  assert.equal(event.fhMode, "human-proxy");
  assert.equal(event.fhModeSource, "override");
  assert.equal(event.runnerRetryMaxAttemptsSource, "registry_default");
  assert.deepStrictEqual(
    events.slice(0, 3).map((candidate) => candidate.kind),
    ["lever_resolution_admitted", "basis_admitted", "graph_call_opened"]
  );
});

test("T-118 negative: malformed lever resolution events fail admission", () => {
  const { profile, context } = publicStartContext();
  const events = [];
  publicCallableStart(requestPayload(profile.name), context, (event) => {
    events.push(event);
  });
  const event = leverResolutionEvent(events);

  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        untilLeverKey: "abg.m04.wrong"
      }),
    /untilLeverKey/u
  );
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        fhModeSource: "folklore"
      }),
    /fhModeSource/u
  );
  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        selectedLeverKeys: [
          "abg.m04.fh_mode",
          "abg.m04.until",
          "abg.runner.retry.max_attempts"
        ]
      }),
    /selectedLeverKeys/u
  );
});

test("T-118 AC: publicStart consumes runner retry max attempts override", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t118-runner-retry"
  });

  const baselineAttempts = new Map();
  const baseline = publicStart(
    input,
    context,
    () => {},
    {
      fpDispatch: {
        contract: fpDispatchContract("plugin://test/t118-runner-retry-baseline"),
        dispatch: (pluginInput) => {
          const next = (baselineAttempts.get(pluginInput.edge) ?? 0) + 1;
          baselineAttempts.set(pluginInput.edge, next);
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t118-baseline/${encodeURIComponent(pluginInput.edge)}/${next}`,
            attachedResultArtifact: attachedArtifact(pluginInput, "blocked"),
            evidenceRefs: [pluginInput.sourceProjectionRef]
          });
        }
      },
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  );

  assert.equal(baseline.kind, "blocked");
  assert.equal(baseline.stopPredicate, "gap_stop");
  assert.equal(baselineAttempts.get("input_set→requirements"), 4);

  const overrideAttempts = new Map();
  const overrideEvents = [];
  const bundle = overrideBundle({ "abg.runner.retry.max_attempts": 5 });
  const overridden = publicStart(
    input,
    { ...context, leverOverridesBundle: bundle },
    (event) => {
      overrideEvents.push(event);
    },
    {
      fpDispatch: {
        contract: fpDispatchContract("plugin://test/t118-runner-retry-override"),
        dispatch: (pluginInput) => {
          const next = (overrideAttempts.get(pluginInput.edge) ?? 0) + 1;
          overrideAttempts.set(pluginInput.edge, next);
          const fulfillmentStatus =
            pluginInput.edge === "input_set→requirements" && next < 5
              ? "blocked"
              : "fulfilled";
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t118-override/${encodeURIComponent(pluginInput.edge)}/${next}`,
            attachedResultArtifact: attachedArtifact(pluginInput, fulfillmentStatus),
            evidenceRefs: [pluginInput.sourceProjectionRef]
          });
        }
      },
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  );

  assert.equal(overridden.kind, "converged");
  assert.equal(overridden.terminalKind, "converged");
  assert.equal(overrideAttempts.get("input_set→requirements"), 5);
  assert.equal(overrideAttempts.get("requirements→design"), 1);
  assert.equal(overrideAttempts.get("design→code"), 1);
  const event = leverResolutionEvent(overrideEvents);
  assert.equal(event.runnerRetryMaxAttempts, 5);
  assert.equal(event.runnerRetryMaxAttemptsSource, "override");
});

test("T-118 AC: lever resolution event is once per public start invocation", () => {
  const { profile, context } = publicStartContext();
  const input = requestPayload(profile.name);
  const firstEvents = [];
  const secondEvents = [];

  publicStart(input, context, (event) => {
    firstEvents.push(event);
  });
  publicStart(input, context, (event) => {
    secondEvents.push(event);
  });

  assert.equal(
    firstEvents.filter((event) => event.kind === "lever_resolution_admitted")
      .length,
    1
  );
  assert.equal(
    secondEvents.filter((event) => event.kind === "lever_resolution_admitted")
      .length,
    1
  );
  assert.deepStrictEqual(
    firstEvents.slice(0, 3).map((event) => event.kind),
    ["lever_resolution_admitted", "basis_admitted", "graph_call_opened"]
  );
  assert.deepStrictEqual(
    secondEvents.slice(0, 3).map((event) => event.kind),
    ["lever_resolution_admitted", "basis_admitted", "graph_call_opened"]
  );
});
