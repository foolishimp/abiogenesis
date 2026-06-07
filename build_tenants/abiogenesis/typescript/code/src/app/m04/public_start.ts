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
import type { PublicStartOutcome, PublicStartRequest } from "./contracts/carriers.js";
import { admitPublicCallableStartRequest } from "./max_autonomy/admission.js";
import { emitLeverResolutionEvent } from "./max_autonomy/lever_resolution_event.js";
import { startFromRequest, startFromRequestAsync } from "./start.js";
export {
  assertRuntimeEventSink,
  type PublicStartContext
} from "./start_context.js";
import type { PublicStartContext } from "./start_context.js";

export function publicStartFromRequest(
  request: PublicStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicStartOutcome {
  return startFromRequest(request, context, eventSink, plugins);
}

export async function publicStartFromRequestAsync(
  request: PublicStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicStartOutcome> {
  return await startFromRequestAsync(request, context, eventSink, plugins);
}

export function publicStart(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicStartOutcome {
  const request = admitPublicCallableStartRequest(
    input,
    "PublicStartRequest",
    context.leverOverridesBundle ?? null
  );
  emitLeverResolutionEvent(request, context, eventSink);
  return publicStartFromRequest(request.startRequest, context, eventSink, plugins);
}

export async function publicStartAsync(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicStartOutcome> {
  const request = admitPublicCallableStartRequest(
    input,
    "PublicStartRequest",
    context.leverOverridesBundle ?? null
  );
  emitLeverResolutionEvent(request, context, eventSink);
  return await publicStartFromRequestAsync(
    request.startRequest,
    context,
    eventSink,
    plugins
  );
}
