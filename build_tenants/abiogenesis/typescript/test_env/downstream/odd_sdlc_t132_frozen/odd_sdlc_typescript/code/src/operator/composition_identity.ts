// Implements: REQ-F-RUNTIME-006
// Implements: REQ-F-ODDSDLC-084

import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import type { EnginePluginInput } from "@abiogenesis/typescript-tenant";

export interface SdlcSelectedAbgFnCompositionIdentity {
  readonly kind: "sdlc_selected_abg_fn_composition_identity";
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function digest(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function segment(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new TypeError("composition identity segment must be non-empty");
  }
  return encodeURIComponent(trimmed);
}

function nonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
  return trimmed;
}

export function sdlcRunRefSegmentFromArchiveRoot(archiveRoot: string): string {
  return segment(pathToFileURL(archiveRoot).href);
}

export function deriveSdlcSelectedAbgFnCompositionIdentity(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly compositionSelectionScopeRef: string;
  readonly carrierContextRefs?: readonly string[];
  readonly assuranceContextRefs?: readonly string[];
}): SdlcSelectedAbgFnCompositionIdentity {
  const graphFunctionRef = input.graphFunctionRef.trim();
  const graphVectorRef = input.graphVectorRef.trim();
  const carrierContextRefs = [...(input.carrierContextRefs ?? [])].sort();
  const assuranceContextRefs = [...(input.assuranceContextRefs ?? [])].sort();
  const compositionRef = [
    "abg.fn_composition://odd-sdlc",
    segment(graphFunctionRef),
    segment(graphVectorRef)
  ].join("/");
  const compositionDigest = digest({
    graphFunctionRef,
    graphVectorRef,
    carrierContextRefs,
    assuranceContextRefs
  });
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity" as const,
    compositionRef,
    compositionDigest,
    compositionSelectionRef: [
      "abg.fn_composition_selection://odd-sdlc",
      segment(input.compositionSelectionScopeRef),
      segment(graphFunctionRef),
      segment(graphVectorRef)
    ].join("/"),
    selectedRegimeBindingRef: null,
    graphFunctionRef,
    graphVectorRef
  });
}

export function deriveSdlcPreRuntimePlanningCompositionIdentity(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly compositionSelectionScopeRef: string;
  readonly carrierContextRefs?: readonly string[];
  readonly assuranceContextRefs?: readonly string[];
}): SdlcSelectedAbgFnCompositionIdentity {
  // Public start uses this only to seed pre-runtime planning projections before
  // ABG opens the selected EnginePluginInput composition identity.
  return deriveSdlcSelectedAbgFnCompositionIdentity(input);
}

export function sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput(
  input: Pick<
    EnginePluginInput,
    | "selectedCompositionRef"
    | "selectedCompositionDigest"
    | "selectedCompositionSelectionRef"
    | "selectedRegimeBindingRef"
    | "graphFunctionId"
    | "jobId"
    | "vectorIndex"
    | "edge"
  >
): SdlcSelectedAbgFnCompositionIdentity {
  const jobId = nonEmpty(input.jobId, "EnginePluginInput.jobId");
  const edge = nonEmpty(input.edge, "EnginePluginInput.edge");
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity" as const,
    compositionRef: nonEmpty(
      input.selectedCompositionRef,
      "EnginePluginInput.selectedCompositionRef"
    ),
    compositionDigest: nonEmpty(
      input.selectedCompositionDigest,
      "EnginePluginInput.selectedCompositionDigest"
    ),
    compositionSelectionRef: nonEmpty(
      input.selectedCompositionSelectionRef,
      "EnginePluginInput.selectedCompositionSelectionRef"
    ),
    selectedRegimeBindingRef:
      input.selectedRegimeBindingRef === null ||
      input.selectedRegimeBindingRef === undefined
        ? null
        : nonEmpty(
            input.selectedRegimeBindingRef,
            "EnginePluginInput.selectedRegimeBindingRef"
          ),
    graphFunctionRef: nonEmpty(
      input.graphFunctionId,
      "EnginePluginInput.graphFunctionId"
    ),
    graphVectorRef: [
      "abg.graph_vector://selected",
      segment(jobId),
      `vector-${input.vectorIndex}`,
      segment(edge)
    ].join("/")
  });
}

export function deriveLegacyReplayOnlySdlcSelectedAbgFnCompositionIdentity(input: {
  readonly scopeRef: string;
}): SdlcSelectedAbgFnCompositionIdentity {
  return deriveSdlcSelectedAbgFnCompositionIdentity({
    graphFunctionRef: "unknown_graph_function",
    graphVectorRef: input.scopeRef,
    compositionSelectionScopeRef: input.scopeRef
  });
}
