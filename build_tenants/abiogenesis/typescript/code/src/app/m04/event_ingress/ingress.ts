// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import {
  emit,
  type RuntimeEventSink
} from "../../../abg/m03/index.js";
import { admitPublicEventIngressRequest } from "./admission.js";
import {
  constructPublicEventIngressOutcome,
  constructRuntimeEventsForEventIngress
} from "./constructors.js";
import type {
  PublicEventIngressOutcome,
  PublicEventIngressRequest
} from "./carriers.js";

function assertRuntimeEventSink(
  eventSink: RuntimeEventSink | undefined
): RuntimeEventSink {
  if (typeof eventSink !== "function") {
    throw new TypeError(
      "eventIngress.eventSink must be provided explicitly to preserve runtime observability"
    );
  }
  return eventSink;
}

export function eventIngressFromRequest(
  request: PublicEventIngressRequest,
  eventSink: RuntimeEventSink
): PublicEventIngressOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const emitted = emit(constructRuntimeEventsForEventIngress(request), sink);
  return constructPublicEventIngressOutcome(request, emitted);
}

export function eventIngress(
  input: unknown,
  eventSink: RuntimeEventSink
): PublicEventIngressOutcome {
  const request = admitPublicEventIngressRequest(input);
  return eventIngressFromRequest(request, eventSink);
}
