// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type {
  EngineRunnerPluginSet,
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
import { startFromRequest, startFromRequestAsync } from "../start.js";

function runControlLoop(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): readonly ReturnType<typeof startFromRequest>[] {
  return Object.freeze([
    startFromRequest(
      request.startRequest,
      {
        ...context,
        runtimeEvents: Object.freeze([...(context.runtimeEvents ?? [])])
      },
      eventSink,
      plugins
    )
  ]);
}

async function runControlLoopAsync(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<readonly Awaited<ReturnType<typeof startFromRequestAsync>>[]> {
  return Object.freeze([
    await startFromRequestAsync(
      request.startRequest,
      {
        ...context,
        runtimeEvents: Object.freeze([...(context.runtimeEvents ?? [])])
      },
      eventSink,
      plugins
    )
  ]);
}

export function publicControlLoopFromRequest(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicControlLoopOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const outcomes = runControlLoop(request, context, sink, plugins);
  return constructPublicControlLoopOutcome(
    outcomes,
    request.startRequest.controlModes
  );
}

export async function publicControlLoopFromRequestAsync(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicControlLoopOutcome> {
  const sink = assertRuntimeEventSink(eventSink);
  const outcomes = await runControlLoopAsync(request, context, sink, plugins);
  return constructPublicControlLoopOutcome(
    outcomes,
    request.startRequest.controlModes
  );
}

export function publicControlLoop(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicControlLoopOutcome {
  const request = admitPublicControlLoopRequest(input);
  return publicControlLoopFromRequest(request, context, eventSink, plugins);
}

export async function publicControlLoopAsync(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicControlLoopOutcome> {
  const request = admitPublicControlLoopRequest(input);
  return await publicControlLoopFromRequestAsync(
    request,
    context,
    eventSink,
    plugins
  );
}
