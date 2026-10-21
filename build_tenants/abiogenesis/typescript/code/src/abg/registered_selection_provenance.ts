import type { RuntimeEventPrefix } from "./event_prefix.js";
import { isRegisteredGraphChoice } from "../gtl/registered_selection.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { rawAdmitValue } from "../validator/raw_admission.js";
import { indexedRuntimeEvents, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix } from "./invocation_execution_truth.js";
import type { RuntimeEvent } from "./event_store.js";
import { canonicalEquals } from "../shared/value/index.js";
import { ok, type StructuralRefusal } from "../shared/refusal.js";
import { checkExactRecord, resolveExactMatch, type RecordCheck } from "../shared/select/index.js";

const record = (x: unknown): x is Readonly<Record<string, JsonValue>> =>
  x !== null && typeof x === "object" && !Array.isArray(x);
const scope = (a: RuntimeEvent, b: RuntimeEvent) =>
  a.runId === b.runId && a.basisId === b.basisId && a.graphCallId === b.graphCallId && a.frameId === b.frameId;

const CHOICE_RESULT_PROJECTION_REFUSAL: StructuralRefusal = Object.freeze({
  kind: "structural_refusal",
  stage: "validate",
  code: "registered_choice_projection",
  path: Object.freeze(["payload", "value"]),
  evidence: Object.freeze({}),
});
type CheckedChoice = Readonly<{ choice: Readonly<Record<string, JsonValue>>; valueDigest: Sha256Digest }>;
/** One success result as a checked record: its value is a registered graph
 * choice whose canonical digest is the recorded `valueDigest`. */
const CHOICE_RESULT_RECORD: RecordCheck<RuntimeEvent, CheckedChoice> = Object.freeze({
  project: (event: RuntimeEvent) =>
    record(event.payload) && isRegisteredGraphChoice(event.payload.value) && isSha256Digest(event.payload.valueDigest)
      ? ok({ choice: event.payload.value, valueDigest: event.payload.valueDigest })
      : CHOICE_RESULT_PROJECTION_REFUSAL,
  digest: Object.freeze({
    expected: (_event: RuntimeEvent, checked: CheckedChoice) => checked.valueDigest,
    actual: (checked: CheckedChoice) => sha256Canonical(checked.choice),
  }),
});

/** Extend the existing replay fact's dependency version; owns no cache. */
export function registeredSelectionInputRelationVersion(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): string;
/** @internal */
export function registeredSelectionInputRelationVersion(prefix: RuntimeEventPrefix, route: RuntimeEvent): string;
export function registeredSelectionInputRelationVersion(prefix: RuntimeEventPrefix, route: RuntimeEvent): string {
  if (!record(route.payload) || typeof route.payload.registeredSelectionApplicationRef !== "string") return "";
  return ["basis:" + route.basisId, "related:" + route.payload.cCallRef, "cursor-origin:" + route.payload.sourceCursorRef, "id:" + route.eventId]
    .map(key => key + ":" + indexedRuntimeEvents(prefix, key).map(e => e.eventId).join(",")).join("|");
}
/** @internal The existing relation's fixed dependency keys, without retaining its bound input. */
export function registeredSelectionInputDependencyKeys(route: RuntimeEvent): readonly string[] {
  return !record(route.payload) || typeof route.payload.registeredSelectionApplicationRef !== "string" ? [] :
    ["basis:" + route.basisId, "related:" + route.payload.cCallRef, "cursor-origin:" + route.payload.sourceCursorRef, "id:" + route.eventId];
}

/** Project an already admitted binding, never choose a target during replay.
 * The route's application identity is issued only after declaration/target/input
 * admission. Source lineage authenticates the raw input retained by that route. */
export function projectRegisteredSelectionInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): import("../validator/raw_admission.js").RawAdmittedValue<unknown> | null;
/** @internal */
export function projectRegisteredSelectionInputAtPrefix(prefix: RuntimeEventPrefix, route: RuntimeEvent): import("../validator/raw_admission.js").RawAdmittedValue<unknown> | null;
export function projectRegisteredSelectionInputAtPrefix(prefix: RuntimeEventPrefix, route: RuntimeEvent): import("../validator/raw_admission.js").RawAdmittedValue<unknown> | null {
  if (route.kind !== "traversal_route_admitted" || !record(route.payload) ||
    typeof route.payload.registeredSelectionApplicationRef !== "string" ||
    route.payload.registeredSelectionApplicationRef.length === 0 || route.payload.routeKind !== "advance" ||
    typeof route.basisId !== "string" || !indexedRuntimeEvents(prefix, "id:" + route.eventId).some(e => canonicalEquals(e as unknown as JsonValue, route as unknown as JsonValue))) return null;
  const payload = route.payload;
  const basis = projectExactExecutionBasisAtPrefix(prefix, route.basisId);
  if (basis === null || basis.graphRef !== payload.declarationRef || basis.graphDigest !== payload.declarationDigest ||
    basis.graphRef !== route.materializationRef || basis.graphFunctionRef !== route.graphFunctionRef ||
    !record(payload.boundInput) || typeof payload.boundInput.contractRef !== "string") return null;
  const related = indexedRuntimeEvents(prefix, "related:" + payload.cCallRef).filter(e => scope(e, route));
  const calls = related.filter(e => e.kind === "c_call_opened" && record(e.payload) && e.payload.callClass === "leaf" &&
    e.payload.cursorRef === payload.sourceCursorRef && e.payload.cursorDigest === payload.sourceCursorDigest);
  const checkedResult = checkExactRecord(resolveExactMatch(related,
    e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultClass === "success"), CHOICE_RESULT_RECORD);
  const judgments = related.filter(e => e.kind === "c_call_judged" && record(e.payload) && e.payload.judgmentRef === payload.judgmentRef);
  // Owner boundary: `absent`, `many` and `invalid` are the existing `null`.
  if (calls.length !== 1 || checkedResult.kind !== "one" || judgments.length !== 1) return null;
  const call = calls[0]!, result = checkedResult.event, judgment = judgments[0]!;
  const choice = checkedResult.value.choice;
  if (!record(result.payload) || !record(judgment.payload) ||
    choice.disposition !== "selected" || judgment.payload.judgment !== "advance" ||
    judgment.payload.resultRef !== result.payload.resultRef || judgment.payload.resultDigest !== result.payload.resultDigest ||
    !judgment.causationEventRefs.includes(result.eventId) || call.admissionOrdinal >= result.admissionOrdinal ||
    result.admissionOrdinal >= judgment.admissionOrdinal || judgment.admissionOrdinal >= route.admissionOrdinal ||
    ![basis.admissionEventRef, result.eventId, judgment.eventId].every(ref => route.causationEventRefs.includes(ref))) return null;
  if (typeof choice.graphFunctionRef !== "string" || basis.registeredSelectionDefinitionDigests?.[choice.graphFunctionRef] !== choice.definitionDigest ||
    !record(choice.input) || choice.input.contractRef !== payload.boundInput.contractRef || !record(choice.input.value)) return null;
  const admitted = rawAdmitValue(choice.input.value, "invocation_input", payload.boundInput.contractRef);
  return admitted.kind === "raw_admitted_value" && canonicalEquals(admitted as unknown as JsonValue, payload.boundInput) ? admitted : null;
}
