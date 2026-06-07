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
import { assertRuntimeEvent } from "../../build/semantic/code/src/abg/m03/index.js";
import { admitAbgLeverOverridesBundle } from "../../build/semantic/code/src/shared/lever_registry/overrides.js";
import { publicStartContext, requestPayload } from "./support/m04-fixtures.mjs";

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
  assert.deepStrictEqual(event.selectedLeverKeys, [
    "abg.m04.until",
    "abg.m04.fh_mode"
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
        selectedLeverKeys: ["abg.m04.fh_mode", "abg.m04.until"]
      }),
    /selectedLeverKeys/u
  );
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
