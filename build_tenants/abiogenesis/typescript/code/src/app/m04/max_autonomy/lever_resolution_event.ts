// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import {
  emit,
  type RuntimeEvent,
  type RuntimeEventSink
} from "../../../abg/m03/index.js";
import type { PublicStartContext } from "../start_context.js";
import {
  M04_FH_MODE_KEY,
  M04_REQUEST_DEFAULT_LEVER_KEYS,
  M04_UNTIL_KEY
} from "../../../shared/lever_registry/overrides.js";
import type { PublicCallableStartRequest } from "./carriers.js";

export function constructLeverResolutionEvent(
  request: PublicCallableStartRequest,
  context: PublicStartContext
): RuntimeEvent {
  const startIntent = request.startRequest.startIntent;
  const controlModes = request.startRequest.controlModes;
  const provenance = request.leverResolution.provenance;
  const correlationBase =
    context.runId ?? context.workKey ?? startIntent.target.handle;
  return Object.freeze({
    kind: "lever_resolution_admitted",
    workspaceRoot: startIntent.scope.workspaceRoot,
    moduleName: startIntent.scope.moduleName,
    targetHandle: startIntent.target.handle,
    until: startIntent.until,
    fhMode: controlModes.fhMode,
    rootMode: controlModes.rootMode,
    resolvedRuntimeRef: context.runtimeIdentity.resolvedRuntimeRef,
    resolvedPolicyBundleRef: context.resolvedPolicy.resolvedPolicyBundleRef,
    runId: context.runId ?? null,
    workKey: context.workKey ?? null,
    resolutionRef: `lever-resolution:${correlationBase}`,
    bundleRef: provenance.bundleRef,
    bundleDigest: provenance.bundleDigest,
    bundlePath: provenance.bundlePath,
    untilLeverKey: M04_UNTIL_KEY,
    untilSource: provenance.selections.until,
    fhModeLeverKey: M04_FH_MODE_KEY,
    fhModeSource: provenance.selections.fhMode,
    selectedLeverKeys: M04_REQUEST_DEFAULT_LEVER_KEYS,
    causationEventRefs: Object.freeze([]),
    correlationId: `lever-resolution:${correlationBase}`
  });
}

export function emitLeverResolutionEvent(
  request: PublicCallableStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): void {
  emit(constructLeverResolutionEvent(request, context), eventSink);
}
