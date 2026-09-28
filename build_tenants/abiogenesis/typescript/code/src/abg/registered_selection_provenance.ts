import { isRegisteredGraphChoice } from "../gtl/registered_selection.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { rawAdmitValue } from "../validator/raw_admission.js";
import { indexedRuntimeEvents, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix } from "./invocation_execution_truth.js";
import type { RuntimeEvent } from "./event_store.js";

const record = (x: unknown): x is Readonly<Record<string, JsonValue>> =>
  x !== null && typeof x === "object" && !Array.isArray(x);
const same = (a: unknown, b: unknown) => canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
const scope = (a: RuntimeEvent, b: RuntimeEvent) =>
  a.runId === b.runId && a.basisId === b.basisId && a.graphCallId === b.graphCallId && a.frameId === b.frameId;

/** Extend the existing replay fact's dependency version; owns no cache. */
export function registeredSelectionInputRelationVersion(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): string {
  if (!record(route.payload) || typeof route.payload.registeredSelectionApplicationRef !== "string") return "";
  return ["basis:" + route.basisId, "related:" + route.payload.cCallRef, "cursor-origin:" + route.payload.sourceCursorRef, "id:" + route.eventId]
    .map(key => key + ":" + indexedRuntimeEvents(prefix, key).map(e => e.eventId).join(",")).join("|");
}

/** Project an already admitted binding, never choose a target during replay.
 * The route's application identity is issued only after declaration/target/input
 * admission. Source lineage authenticates the raw input retained by that route. */
export function projectRegisteredSelectionInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent) {
  if (route.kind !== "traversal_route_admitted" || !record(route.payload) ||
    typeof route.payload.registeredSelectionApplicationRef !== "string" ||
    route.payload.registeredSelectionApplicationRef.length === 0 || route.payload.routeKind !== "advance" ||
    typeof route.basisId !== "string" || !indexedRuntimeEvents(prefix, "id:" + route.eventId).some(e => same(e, route))) return null;
  const payload = route.payload;
  const basis = projectExactExecutionBasisAtPrefix(prefix, route.basisId);
  if (basis === null || basis.graphRef !== payload.declarationRef || basis.graphDigest !== payload.declarationDigest ||
    basis.graphRef !== route.materializationRef || basis.graphFunctionRef !== route.graphFunctionRef ||
    !record(payload.boundInput) || typeof payload.boundInput.contractRef !== "string") return null;
  const related = indexedRuntimeEvents(prefix, "related:" + payload.cCallRef).filter(e => scope(e, route));
  const calls = related.filter(e => e.kind === "c_call_opened" && record(e.payload) && e.payload.callClass === "leaf" &&
    e.payload.cursorRef === payload.sourceCursorRef && e.payload.cursorDigest === payload.sourceCursorDigest);
  const results = related.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultClass === "success");
  const judgments = related.filter(e => e.kind === "c_call_judged" && record(e.payload) && e.payload.judgmentRef === payload.judgmentRef);
  if (calls.length !== 1 || results.length !== 1 || judgments.length !== 1) return null;
  const call = calls[0]!, result = results[0]!, judgment = judgments[0]!;
  if (!record(result.payload) || !record(judgment.payload) ||
    !isRegisteredGraphChoice(result.payload.value) || result.payload.value.disposition !== "selected" ||
    result.payload.valueDigest !== sha256Canonical(result.payload.value) || judgment.payload.judgment !== "advance" ||
    judgment.payload.resultRef !== result.payload.resultRef || judgment.payload.resultDigest !== result.payload.resultDigest ||
    !judgment.causationEventRefs.includes(result.eventId) || call.admissionOrdinal >= result.admissionOrdinal ||
    result.admissionOrdinal >= judgment.admissionOrdinal || judgment.admissionOrdinal >= route.admissionOrdinal ||
    ![basis.admissionEventRef, result.eventId, judgment.eventId].every(ref => route.causationEventRefs.includes(ref))) return null;
  const choice = result.payload.value;
  if (typeof choice.graphFunctionRef !== "string" || basis.registeredSelectionDefinitionDigests?.[choice.graphFunctionRef] !== choice.definitionDigest ||
    !record(choice.input) || choice.input.contractRef !== payload.boundInput.contractRef || !record(choice.input.value)) return null;
  const admitted = rawAdmitValue(choice.input.value, "invocation_input", payload.boundInput.contractRef);
  return admitted.kind === "raw_admitted_value" && same(admitted, payload.boundInput) ? admitted : null;
}
