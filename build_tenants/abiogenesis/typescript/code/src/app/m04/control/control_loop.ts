// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type { RuntimeEventSink } from "../../../abg/m03/index.js";
import { assertRuntimeEventSink, publicStartFromRequest } from "../public_start.js";
import type { PublicStartContext } from "../public_start.js";
import { admitPublicControlLoopRequest } from "./admission.js";
import { constructPublicControlLoopOutcome } from "./constructors.js";
import type {
  PublicControlLoopOutcome,
  PublicControlLoopRequest
} from "./carriers.js";
import type { PublicControlModes, PublicStartOutcome } from "../contracts/carriers.js";

interface ControlLoopRouteBinding {
  readonly controlModes: PublicControlModes;
}

function constructControlLoopRouteBinding(
  controlModes: PublicControlModes
): ControlLoopRouteBinding {
  return Object.freeze({
    controlModes
  });
}

function runControlLoop(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): readonly PublicStartOutcome[] {
  const binding = constructControlLoopRouteBinding(request.startRequest.controlModes);
  const first = publicStartFromRequest(request.startRequest, context, eventSink);

  if (binding.controlModes.rootMode !== "supervised") {
    return Object.freeze([first]);
  }
  if (first.kind !== "advanced") {
    return Object.freeze([first]);
  }

  const second = publicStartFromRequest(request.startRequest, context, eventSink);
  return Object.freeze([first, second]);
}

export function publicControlLoopFromRequest(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): PublicControlLoopOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const outcomes = runControlLoop(request, context, sink);
  return constructPublicControlLoopOutcome(
    outcomes,
    request.startRequest.controlModes
  );
}

export function publicControlLoop(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): PublicControlLoopOutcome {
  const request = admitPublicControlLoopRequest(input);
  return publicControlLoopFromRequest(request, context, eventSink);
}
