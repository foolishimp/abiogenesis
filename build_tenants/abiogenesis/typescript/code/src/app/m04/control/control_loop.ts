// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type {
  RuntimeEventSink
} from "../../../abg/m03/index.js";
import { assertRuntimeEventSink } from "../public_start.js";
import type { PublicStartContext } from "../public_start.js";
import { admitPublicControlLoopRequest } from "./admission.js";
import { constructPublicControlLoopOutcome } from "./constructors.js";
import type {
  PublicControlLoopOutcome,
  PublicControlLoopRequest
} from "./carriers.js";
import { startFromRequest } from "../start.js";

function runControlLoop(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): readonly ReturnType<typeof startFromRequest>[] {
  return Object.freeze([
    startFromRequest(
      request.startRequest,
      {
        ...context,
        runtimeEvents: Object.freeze([...(context.runtimeEvents ?? [])])
      },
      eventSink
    )
  ]);
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
