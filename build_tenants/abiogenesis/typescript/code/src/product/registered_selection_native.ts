import { isRegisteredGraphChoice } from "../gtl/registered_selection.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

type RecordValue = Readonly<Record<string, JsonValue>>;
const record = (x: unknown): x is RecordValue => x !== null && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === "string" && x.trim().length > 0;
const refs = (x: unknown): x is readonly string[] => Array.isArray(x) && x.every(text) && new Set(x).size === x.length;
const keys = (x: RecordValue, names: readonly string[]) => Object.keys(x).sort().join("\0") === [...names].sort().join("\0");

export interface NativeRegisteredSelectionTask {
  readonly kind: "registered_selection_task";
  readonly schemaVersion: "5.0.0";
  readonly workerActorRef: string;
  readonly workerBindingRef: string;
  readonly task: string;
  readonly observations: readonly Readonly<{ observationRef: string; qualification: string; value: JsonValue }>[];
  readonly requiredSupportRefs: readonly string[];
  readonly childInput: Readonly<{ contractRef: string; value: RecordValue }>;
  readonly maxPromptBytes: number;
}
export interface NativeRegisteredSelectionTarget {
  readonly graphFunctionRef: string;
  readonly definitionDigest: Sha256Digest;
}

export function isNativeRegisteredSelectionTask(x: unknown): x is NativeRegisteredSelectionTask {
  return record(x) && keys(x, ["kind", "schemaVersion", "workerActorRef", "workerBindingRef", "task", "observations", "requiredSupportRefs", "childInput", "maxPromptBytes"]) &&
    x.kind === "registered_selection_task" && x.schemaVersion === "5.0.0" && text(x.workerActorRef) && text(x.workerBindingRef) && text(x.task) &&
    Array.isArray(x.observations) && x.observations.every(o => record(o) && keys(o, ["observationRef", "qualification", "value"]) && text(o.observationRef) && text(o.qualification)) &&
    refs(x.observations.map(o => (o as RecordValue).observationRef)) && refs(x.requiredSupportRefs) && x.requiredSupportRefs.length > 0 &&
    record(x.childInput) && keys(x.childInput, ["contractRef", "value"]) && text(x.childInput.contractRef) && record(x.childInput.value) && text(x.childInput.value.kind) &&
    Number.isSafeInteger(x.maxPromptBytes) && (x.maxPromptBytes as number) > 0 && (x.maxPromptBytes as number) <= 16_777_216;
}

/** Raw shape validation confers no candidate-domain or execution authority. */
export function isNativeRegisteredSelectionResponse(x: unknown): x is RecordValue {
  if (!record(x) || !text(x.reason) || !refs(x.evidenceRefs)) return false;
  return x.disposition === "selected"
    ? keys(x, ["disposition", "graphFunctionRef", "reason", "evidenceRefs"]) && text(x.graphFunctionRef)
    : x.disposition === "gap" && keys(x, ["disposition", "reason", "missingSupportRefs", "evidenceRefs"]) && refs(x.missingSupportRefs) && x.missingSupportRefs.length > 0;
}

export function nativeRegisteredSelectionResponseSchema(task: NativeRegisteredSelectionTask,
  targets: readonly NativeRegisteredSelectionTarget[]): Readonly<Record<string, JsonValue>> {
  const referenceArray = (domain: readonly string[], minimum = 0) => ({ type: "array", minItems: minimum, uniqueItems: true,
    items: domain.length === 0 ? false : { type: "string", enum: [...domain] } });
  const common = { reason: { type: "string", minLength: 1 }, evidenceRefs: referenceArray(task.observations.map(o => o.observationRef)) };
  // Provider shaping is deliberately an object surface. The strict raw branch
  // validator below remains authoritative and rejects inappropriate fields.
  return deepFreeze({ type: "object", additionalProperties: false, properties: {
    ...common, disposition: { type: "string", enum: ["selected", "gap"] },
    graphFunctionRef: { type: "string", enum: targets.map(t => t.graphFunctionRef),
      description: "Required only for selected; omit for gap. Choose one permitted reference." },
    missingSupportRefs: { ...referenceArray(task.requiredSupportRefs, 1),
      description: "Required only for gap; omit for selected. Name declared support that no permitted capability provides." },
  }, required: ["disposition", "reason", "evidenceRefs"] });
}

/** Pure identity binding shared by implementation completion and ABG admission.
 * Suitability comes only from the observed answer; input bytes are never repaired. */
export function materializeNativeRegisteredChoice(task: NativeRegisteredSelectionTask,
  targets: readonly NativeRegisteredSelectionTarget[], raw: unknown): RecordValue | null {
  if (!isNativeRegisteredSelectionTask(task) || !isNativeRegisteredSelectionResponse(raw) ||
    !(raw.evidenceRefs as readonly string[]).every(ref => task.observations.some(o => o.observationRef === ref))) return null;
  const base = { kind: "registered_graph_choice", schemaVersion: "5.0.0", disposition: raw.disposition!,
    reason: raw.reason!, evidenceRefs: raw.evidenceRefs! };
  if (raw.disposition === "gap") return (raw.missingSupportRefs as readonly string[]).every(ref => task.requiredSupportRefs.includes(ref))
    ? deepFreeze({ ...base, missingSupportRefs: raw.missingSupportRefs! }) : null;
  const selected = targets.filter(t => t.graphFunctionRef === raw.graphFunctionRef);
  if (selected.length !== 1) return null;
  const choice = { ...base, graphFunctionRef: selected[0]!.graphFunctionRef, definitionDigest: selected[0]!.definitionDigest, input: task.childInput };
  return isRegisteredGraphChoice(choice) ? deepFreeze(choice) : null;
}
