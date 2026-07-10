// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import {
  type EngineRunnerPluginSet,
  type RuntimeEventSink
} from "../../abg/m03/index.js";
import type { PublicStartOutcome } from "./contracts/carriers.js";
import { admitPublicCallableStartRequest } from "./max_autonomy/admission.js";
import { emitLeverResolutionEvent } from "./max_autonomy/lever_resolution_event.js";
import { startFromRequest, startFromRequestAsync } from "./start.js";
export {
  assertRuntimeEventSink,
  type PublicStartContext
} from "./start_context.js";
import type { PublicStartContext } from "./start_context.js";

export function publicStart(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicStartOutcome {
  const callableRequest = admitPublicCallableStartRequest(
    input,
    "PublicStartRequest",
    context.leverOverridesBundle ?? null
  );
  emitLeverResolutionEvent(callableRequest, context, eventSink);
  const request = callableRequest.startRequest;
  return startFromRequest(request, context, eventSink, plugins);
}

export async function publicStartAsync(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicStartOutcome> {
  const callableRequest = admitPublicCallableStartRequest(
    input,
    "PublicStartRequest",
    context.leverOverridesBundle ?? null
  );
  emitLeverResolutionEvent(callableRequest, context, eventSink);
  const request = callableRequest.startRequest;
  return await startFromRequestAsync(request, context, eventSink, plugins);
}
