// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import type { RuntimeEventSink } from "../../../abg/m03/index.js";
import type { PublicStartContext } from "../public_start.js";
import { publicControlLoopFromRequest } from "../control/control_loop.js";
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
  eventSink: RuntimeEventSink
): PublicCallableStartOutcome {
  emitLeverResolutionEvent(request, context, eventSink);
  const controlRequest = constructPublicControlLoopRequest(request.startRequest);
  const controlOutcome = publicControlLoopFromRequest(
    controlRequest,
    context,
    eventSink
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
  eventSink: RuntimeEventSink
): PublicCallableStartOutcome {
  const request = admitPublicCallableStartRequest(
    input,
    "PublicCallableStartRequest",
    context.leverOverridesBundle ?? null
  );
  return publicCallableStartFromRequest(request, context, eventSink);
}
