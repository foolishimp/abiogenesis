// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import type {
  AffectPriorityPolicy,
  ConstructionPriorityScheme,
  ExecutionBasisAdmissionInput,
  EngineAssuranceProvider,
  PluginTraversalKind,
  RuntimeEvent,
  RuntimeEventSink
} from "../../abg/m03/index.js";
import type { AbgFallbackBundle } from "../../abg/m03/index.js";
import type { AbgLeverOverridesBundle } from "../../shared/lever_registry/overrides.js";
import type { Module } from "../../gtl/m02/contracts/carriers.js";

export interface PublicStartContext {
  readonly module: Module;
  readonly runtimeIdentity: ExecutionBasisAdmissionInput["runtimeIdentity"];
  readonly resolvedPolicy: ExecutionBasisAdmissionInput["resolvedPolicy"];
  readonly runtimeEvents?: readonly RuntimeEvent[];
  readonly constructionPriorityScheme?: ConstructionPriorityScheme;
  readonly constructionAffectPolicies?: readonly AffectPriorityPolicy[];
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
  readonly assuranceProvider?: EngineAssuranceProvider;
  readonly abgFallbackBundle?: AbgFallbackBundle | null;
  readonly leverOverridesBundle?: AbgLeverOverridesBundle | null;
  readonly pluginTraversalObserverFallbackEnabled?: boolean;
  readonly pluginTraversalObserverFallbackKinds?: readonly PluginTraversalKind[];
}

export function assertRuntimeEventSink(
  eventSink: RuntimeEventSink | undefined
): RuntimeEventSink {
  if (typeof eventSink !== "function") {
    throw new TypeError(
      "publicStart.eventSink must be provided explicitly to preserve runtime observability"
    );
  }
  return eventSink;
}
