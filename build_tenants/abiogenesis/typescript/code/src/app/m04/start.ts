// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import {
  runEngineStart,
  runEngineStartAsync,
  type EngineRunnerPluginSet,
  type RuntimeEventSink
} from "../../abg/m03/index.js";
import { admitPublicStartRequest } from "./admission/index.js";
import {
  constructPublicStartOutcome,
  constructRejectedPublicStartOutcome
} from "./contracts/index.js";
import type { PublicStartOutcome, PublicStartRequest } from "./contracts/carriers.js";
import {
  assertRuntimeEventSink,
  type PublicStartContext
} from "./start_context.js";
import { resolveRunnerRetryMaxAttempts } from "../../shared/lever_registry/overrides.js";

function selectorMismatchReason(
  request: PublicStartRequest,
  runtimeIdentity: PublicStartContext["runtimeIdentity"]
): string | null {
  const selector = request.runtimeSelector;
  if (selector === null) {
    return null;
  }
  if (
    selector.workerRef !== null &&
    selector.workerRef !== runtimeIdentity.workerId
  ) {
    return "configured worker selector does not match resolved runtime identity";
  }
  if (
    selector.runtimeRef !== null &&
    selector.runtimeRef !== runtimeIdentity.resolvedRuntimeRef
  ) {
    return "configured runtime selector does not match resolved runtime identity";
  }
  return null;
}

export function startFromRequest(
  request: PublicStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicStartOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const mismatchReason = selectorMismatchReason(request, context.runtimeIdentity);

  if (mismatchReason !== null) {
    return constructRejectedPublicStartOutcome(
      mismatchReason,
      context.runtimeIdentity
    );
  }

  const result = runEngineStart({
    startIntent: request.startIntent,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: context.runtimeEvents ?? Object.freeze([]),
    eventSink: sink,
    maxAttachedFpAttempts: resolveRunnerRetryMaxAttempts({
      bundle: context.leverOverridesBundle ?? null
    }).maxAttempts,
    ...(plugins === undefined ? {} : { plugins }),
    ...(context.assuranceProvider === undefined
      ? {}
      : { assuranceProvider: context.assuranceProvider }),
    ...(context.abgFallbackBundle === undefined
      ? {}
      : { abgFallbackBundle: context.abgFallbackBundle }),
    ...(context.pluginTraversalObserverFallbackEnabled === undefined
      ? {}
      : {
          pluginTraversalObserverFallbackEnabled:
            context.pluginTraversalObserverFallbackEnabled
        }),
    ...(context.pluginTraversalObserverFallbackKinds === undefined
      ? {}
      : {
          pluginTraversalObserverFallbackKinds:
            context.pluginTraversalObserverFallbackKinds
        }),
    ...(context.runId === undefined ? {} : { runId: context.runId }),
    ...(context.workKey === undefined ? {} : { workKey: context.workKey }),
    ...(context.frameId === undefined ? {} : { frameId: context.frameId }),
    ...(context.frameLineageId === undefined
      ? {}
      : { frameLineageId: context.frameLineageId })
  });

  return constructPublicStartOutcome(
    result.basis,
    result.transition,
    result.emittedEvents,
    request.startIntent.until,
    context.assuranceProvider === undefined ? undefined : result.assuranceGate
  );
}

export async function startFromRequestAsync(
  request: PublicStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicStartOutcome> {
  const sink = assertRuntimeEventSink(eventSink);
  const mismatchReason = selectorMismatchReason(request, context.runtimeIdentity);

  if (mismatchReason !== null) {
    return constructRejectedPublicStartOutcome(
      mismatchReason,
      context.runtimeIdentity
    );
  }

  const result = await runEngineStartAsync({
    startIntent: request.startIntent,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runtimeEvents: context.runtimeEvents ?? Object.freeze([]),
    eventSink: sink,
    maxAttachedFpAttempts: resolveRunnerRetryMaxAttempts({
      bundle: context.leverOverridesBundle ?? null
    }).maxAttempts,
    ...(plugins === undefined ? {} : { plugins }),
    ...(context.assuranceProvider === undefined
      ? {}
      : { assuranceProvider: context.assuranceProvider }),
    ...(context.abgFallbackBundle === undefined
      ? {}
      : { abgFallbackBundle: context.abgFallbackBundle }),
    ...(context.pluginTraversalObserverFallbackEnabled === undefined
      ? {}
      : {
          pluginTraversalObserverFallbackEnabled:
            context.pluginTraversalObserverFallbackEnabled
        }),
    ...(context.pluginTraversalObserverFallbackKinds === undefined
      ? {}
      : {
          pluginTraversalObserverFallbackKinds:
            context.pluginTraversalObserverFallbackKinds
        }),
    ...(context.runId === undefined ? {} : { runId: context.runId }),
    ...(context.workKey === undefined ? {} : { workKey: context.workKey }),
    ...(context.frameId === undefined ? {} : { frameId: context.frameId }),
    ...(context.frameLineageId === undefined
      ? {}
      : { frameLineageId: context.frameLineageId })
  });

  return constructPublicStartOutcome(
    result.basis,
    result.transition,
    result.emittedEvents,
    request.startIntent.until,
    context.assuranceProvider === undefined ? undefined : result.assuranceGate
  );
}

export function start(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): PublicStartOutcome {
  const request = admitPublicStartRequest(input);
  return startFromRequest(request, context, eventSink, plugins);
}

export async function startAsync(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  plugins?: EngineRunnerPluginSet
): Promise<PublicStartOutcome> {
  const request = admitPublicStartRequest(input);
  return await startFromRequestAsync(request, context, eventSink, plugins);
}
