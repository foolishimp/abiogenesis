import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicEventIngressRequest,
  eventIngress
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  approvedEventPayload,
  resetEventPayload
} from "./support/m04-fixtures.mjs";

test("T-016 negative proof: event-ingress rejects assessed-style payload in the first slice", () => {
  assert.throws(
    () =>
      admitPublicEventIngressRequest({
        kind: "assessed",
        approval_kind: "fp",
        edge: "design→code",
        workflow_version: "wf://typescript-dev"
      }),
    /approved|revoked|reset/i
  );
});

test("T-016 negative proof: reset ingress rejects edge scope without explicit work key", () => {
  assert.throws(
    () =>
      admitPublicEventIngressRequest(
        resetEventPayload({
          scope: "edge",
          work_key: null,
          edge: "design→code"
        })
      ),
    /work_key/i
  );
});

test("T-016 negative proof: event-ingress requires explicit sink to preserve canonical emit ownership", () => {
  assert.throws(
    () => eventIngress(approvedEventPayload(), undefined),
    /eventSink/i
  );
});
