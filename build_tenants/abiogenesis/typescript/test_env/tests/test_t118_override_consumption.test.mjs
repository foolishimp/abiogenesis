// T-118 acceptance-level tests: prove the override bundle is actually CONSUMED
// through the real admission path (catches the dormancy class), and encode the
// still-unmet acceptance criteria as todo so the suite documents non-closure
// instead of giving false confidence.

import test from "node:test";
import assert from "node:assert/strict";

import { admitPublicCallableStartRequest } from "../../build/semantic/code/src/app/m04/index.js";
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

// UNMET AC (T-118 §AC-3 / non-closure §2): a runtime decision that consumes a
// configurable default must record bundleRef/digest/path/selectedKey/source in
// a REPLAY-VISIBLE place (the event stream). Today resolveM04RequestDefaults
// computes that provenance but admission discards it and no run-start event
// carries it. Encoded as todo so the suite tracks the gap; flip to a real test
// when the event/carrier provenance lands.
test(
  "T-118 AC (todo): override resolution provenance is replay-visible",
  { todo: "deferred: no run-start event/carrier carries lever provenance yet" },
  () => {
    const { profile } = publicStartContext();
    const request = admitPublicCallableStartRequest(
      requestPayload(profile.name),
      "PublicCallableStartRequest",
      overrideBundle({ "abg.m04.fh_mode": "human-proxy" })
    );
    assert.ok(
      request.leverProvenance,
      "expected replay-visible lever provenance on the admitted request/event"
    );
  }
);
