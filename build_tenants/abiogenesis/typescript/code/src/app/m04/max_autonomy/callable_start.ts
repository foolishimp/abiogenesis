// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import type {
  EngineRunnerPluginSet,
  RuntimeEventSink
} from "../../../abg/m03/index.js";
import type { PublicStartContext } from "../public_start.js";
import {
  publicControlLoopFromRequest,
  publicControlLoopFromRequestAsync
} from "../control/control_loop.js";
import { constructPublicControlLoopRequest } from "../control/constructors.js";
import { projectLiveStatusFromRequest } from "../live_status/projection.js";
import { constructPublicLiveStatusRequest } from "../live_status/constructors.js";
import { admitPublicCallableStartRequest } from "./admission.js";
import {
  constructPublicCallableStartOutcome,
  projectPublicStopClass
} from "./constructors.js";
import { emitLeverResolutionEvent } from "./lever_resolution_event.js";
import type {
  PublicCallableStartOutcome,
  PublicCallableStartRequest
} from "./carriers.js";

export function publicCallableStartFromRequest(
  request: PublicCallableStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicCallableStartOutcome {
  emitLeverResolutionEvent(request, context, eventSink);
  const controlRequest = constructPublicControlLoopRequest(request.startRequest);
  const controlOutcome = publicControlLoopFromRequest(
    controlRequest,
    context,
    eventSink,
    plugins
  );
  const liveStatus = projectLiveStatusFromRequest(
    constructPublicLiveStatusRequest({
      startRequest: request.startRequest,
      startOutcome: null,
      controlRequest,
      controlOutcome,
      resultAssessmentRequest: null,
      resultAssessmentOutcome: null
    })
  );
  const stopClass = projectPublicStopClass(liveStatus);

  return constructPublicCallableStartOutcome({
    request,
    controlRequest,
    controlOutcome,
    liveStatus,
    stopClass
  });
}

export async function publicCallableStartFromRequestAsync(
  request: PublicCallableStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicCallableStartOutcome> {
  emitLeverResolutionEvent(request, context, eventSink);
  const controlRequest = constructPublicControlLoopRequest(request.startRequest);
  const controlOutcome = await publicControlLoopFromRequestAsync(
    controlRequest,
    context,
    eventSink,
    plugins
  );
  const liveStatus = projectLiveStatusFromRequest(
    constructPublicLiveStatusRequest({
      startRequest: request.startRequest,
      startOutcome: null,
      controlRequest,
      controlOutcome,
      resultAssessmentRequest: null,
      resultAssessmentOutcome: null
    })
  );
  const stopClass = projectPublicStopClass(liveStatus);

  return constructPublicCallableStartOutcome({
    request,
    controlRequest,
    controlOutcome,
    liveStatus,
    stopClass
  });
}

export function publicCallableStart(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicCallableStartOutcome {
  const request = admitPublicCallableStartRequest(
    input,
    "PublicCallableStartRequest",
    context.leverOverridesBundle ?? null
  );
  return publicCallableStartFromRequest(request, context, eventSink, plugins);
}

export async function publicCallableStartAsync(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicCallableStartOutcome> {
  const request = admitPublicCallableStartRequest(
    input,
    "PublicCallableStartRequest",
    context.leverOverridesBundle ?? null
  );
  return await publicCallableStartFromRequestAsync(
    request,
    context,
    eventSink,
    plugins
  );
}
