// Implements: REQ-P-POLICY
// Implements: REQ-R-ABG3-RUN

import type {
  ExecutionBasisAdmissionInput,
  EngineAssuranceProvider,
  RuntimeEvent,
  RuntimeEventSink
} from "../../abg/m03/index.js";
import type { Module } from "../../gtl/m02/contracts/carriers.js";

export interface PublicStartContext {
  readonly module: Module;
  readonly runtimeIdentity: ExecutionBasisAdmissionInput["runtimeIdentity"];
  readonly resolvedPolicy: ExecutionBasisAdmissionInput["resolvedPolicy"];
  readonly runtimeEvents?: readonly RuntimeEvent[];
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
  readonly assuranceProvider?: EngineAssuranceProvider;
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
