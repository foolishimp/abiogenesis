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
  M04_UNTIL_KEY,
  PUBLIC_START_CONSUMED_LEVER_KEYS,
  RUNNER_RETRY_MAX_ATTEMPTS_KEY,
  resolveRunnerRetryMaxAttempts
} from "../../../shared/lever_registry/overrides.js";
import type { PublicCallableStartRequest } from "./carriers.js";
import { projectLiveCapability } from "../live_capability.js";

export function constructLeverResolutionEvent(
  request: PublicCallableStartRequest,
  context: PublicStartContext
): RuntimeEvent {
  const startIntent = request.startRequest.startIntent;
  const controlModes = request.startRequest.controlModes;
  const provenance = request.leverResolution.provenance;
  const retryResolution = resolveRunnerRetryMaxAttempts({
    bundle: context.leverOverridesBundle ?? null
  });
  const liveCapability = projectLiveCapability(context.liveCapability);
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
    runnerRetryMaxAttempts: retryResolution.maxAttempts,
    runnerRetryMaxAttemptsLeverKey: RUNNER_RETRY_MAX_ATTEMPTS_KEY,
    runnerRetryMaxAttemptsSource: retryResolution.source,
    liveCapabilityRef: liveCapability?.capabilityRef ?? null,
    liveCapabilityDigest: liveCapability?.capabilityDigest ?? null,
    executionContractDigest: liveCapability?.executionContractDigest ?? null,
    liveAgentKey: liveCapability?.agentKey ?? null,
    liveAgentKeySource: liveCapability?.agentKeySource ?? null,
    liveExecutorProfile: liveCapability?.executorProfile ?? null,
    liveExecutorProfileSource: liveCapability?.executorProfileSource ?? null,
    liveTimeoutMs: liveCapability?.timeoutMs ?? null,
    liveTimeoutMsSource: liveCapability?.timeoutMsSource ?? null,
    availableLivePluginRefs:
      liveCapability?.availableLivePluginRefs ?? Object.freeze([]),
    selectedLeverKeys: PUBLIC_START_CONSUMED_LEVER_KEYS,
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
