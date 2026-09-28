import type { GraphTemplate, RegisteredSelectionApplication } from "./contracts.js";
import { graphFunctionApplicationRef } from "./graph_applications.js";
import { rootCSourcePath } from "./source_path.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";

type RecordValue = Readonly<Record<string, JsonValue>>;
const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const refs = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every(v => typeof v === "string" && v.length > 0) && new Set(value).size === value.length;
const keys = (value: RecordValue, expected: readonly string[]) =>
  Object.keys(value).sort().join("\0") === [...expected].sort().join("\0");

export function isRegisteredGraphChoice(value: unknown): value is RecordValue {
  if (!record(value) || value.kind !== "registered_graph_choice" || value.schemaVersion !== "5.0.0" ||
    typeof value.reason !== "string" || value.reason.trim().length === 0 || !refs(value.evidenceRefs)) return false;
  const base = ["kind", "schemaVersion", "disposition", "reason", "evidenceRefs"];
  return value.disposition === "gap"
    ? keys(value, [...base, "missingSupportRefs"]) && refs(value.missingSupportRefs) && value.missingSupportRefs.length > 0
    : value.disposition === "selected" && keys(value, [...base, "graphFunctionRef", "definitionDigest", "input"]) &&
      typeof value.graphFunctionRef === "string" && value.graphFunctionRef.length > 0 &&
      typeof value.definitionDigest === "string" && /^sha256:[a-f0-9]{64}$/.test(value.definitionDigest) &&
      record(value.input) && keys(value.input, ["contractRef", "value"]) &&
      typeof value.input.contractRef === "string" && value.input.contractRef.length > 0 &&
      record(value.input.value) && typeof value.input.value.kind === "string" && value.input.value.kind.length > 0;
}

/** Establish declaration applicability before examining any response fields. */
export function registeredSelectionAtSource(template: GraphTemplate, source: Readonly<{
  currentNodeRef: string; termPath: readonly string[];
}>, contractRef: string): RegisteredSelectionApplication | null {
  const node = template.nodes.find(n => n.nodeRef === source.currentNodeRef);
  if (node?.term.kind !== "c_of" || source.termPath.join("\0") !== rootCSourcePath(node.nodeRef).join("\0")) return null;
  const locus = node.term.programLocusRef;
  const matches = template.applications.filter((a): a is RegisteredSelectionApplication =>
    a.relationKind === "registered_selection" && a.sourceProgramLocusRef === locus);
  if (matches.length === 0) return null;
  if (matches.length !== 1 || matches[0]!.inputContractRef !== contractRef || node.term.outputCarrierRef !== contractRef ||
    matches[0]!.applicationRef !== graphFunctionApplicationRef(matches[0]!)) throw new TypeError("registered selection declaration/result contract mismatch");
  return matches[0]!;
}

export type RegisteredSelectionResolution = Readonly<{
  disposition: "selected"; applicationRef: string; nodeRef: string; termPath: readonly string[];
  graphFunctionRef: string; definitionDigest: Sha256Digest; contractRef: string; value: RecordValue;
}> | Readonly<{ disposition: "gap"; applicationRef: string }>;

/** One structural target/input relation shared by HoG proposal and ABG admission.
 * Definitions are the exact admitted catalogue/Program digest projection. */
export function resolveRegisteredSelection(template: GraphTemplate, source: Readonly<{
  currentNodeRef: string; termPath: readonly string[];
}>, contractRef: string, value: JsonValue,
definitionDigests: Readonly<Record<string, Sha256Digest>>): RegisteredSelectionResolution | null {
  const application = registeredSelectionAtSource(template, source, contractRef);
  if (application === null) return null;
  if (!isRegisteredGraphChoice(value)) throw new TypeError("registered selection result does not conform");
  if (value.disposition === "gap") return { disposition: "gap", applicationRef: application.applicationRef };
  const input = value.input as RecordValue;
  const graphFunctionRef = value.graphFunctionRef as string;
  const targets = template.edges.filter(e => e.fromNodeRef === source.currentNodeRef)
    .map(e => template.nodes.find(n => n.nodeRef === e.toNodeRef))
    .filter(n => n?.term.kind === "c_workflow" && n.term.graphFunctionRef === graphFunctionRef);
  if (targets.length !== 1 || targets[0]?.term.kind !== "c_workflow" ||
    definitionDigests[graphFunctionRef] !== value.definitionDigest ||
    input.contractRef !== application.outputContractRef || targets[0].term.inputCarrierRef !== input.contractRef) {
    throw new TypeError("registered selection target, definition or child input contract mismatch");
  }
  return { disposition: "selected", applicationRef: application.applicationRef,
    nodeRef: targets[0].nodeRef, termPath: rootCSourcePath(targets[0].nodeRef), graphFunctionRef,
    definitionDigest: value.definitionDigest as Sha256Digest, contractRef: input.contractRef as string,
    value: input.value as RecordValue };
}
