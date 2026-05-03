// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type { EngineRunnerPluginSet, RuntimeEventSink } from "../../abg/m03/index.js";
import { admitPublicStartRequest } from "./admission/index.js";
import type { PublicStartOutcome, PublicStartRequest } from "./contracts/carriers.js";
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
  const request = admitPublicStartRequest(input);
  return publicStartFromRequest(request, context, eventSink, plugins);
}

export async function publicStartAsync(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicStartOutcome> {
  const request = admitPublicStartRequest(input);
  return await publicStartFromRequestAsync(request, context, eventSink, plugins);
}
