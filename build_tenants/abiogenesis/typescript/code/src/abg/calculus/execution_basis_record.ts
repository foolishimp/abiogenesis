// The execution basis record law (T-290 C-12c): one `basis_admitted` event as
// a checked record. The calculus reads the basis from its admitted event
// through this law; the invocation truth owner's
// `projectExactExecutionBasisAtPrefix` delegates to it and types the record as
// its ExecutionBasis, so the law has one owner.
import { admitJson, isRecord } from "../../shared/admit/index.js";
import type { JsonValue } from "../../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../../shared/digests.js";
import { deepFreeze } from "../../shared/immutable.js";
import { ok, type Outcome, type StructuralRefusal } from "../../shared/refusal.js";
import { checkExactRecord, resolveExactMatch, type RecordCheck } from "../../shared/select/index.js";
import { canonicalRecordDigest } from "../../shared/value/index.js";
import { indexedRuntimeEvents, type RuntimeEventPrefix, type ValidatedRuntimeEventPrefix } from "../event_prefix.js";
import type { RuntimeEvent } from "../event_store.js";

/** The admitted record: the `basis_admitted` payload with its admission event. */
/** @internal */
export type ExecutionBasisRecord = Readonly<Record<string, JsonValue>> & Readonly<{
  kind: "execution_basis";
  schemaVersion: "5.0.0";
  disposition: "admitted";
  basisRef: string;
  basisDigest: Sha256Digest;
  admissionEventRef: string;
  programRef: string;
  graphFunctionRef: string;
  invocationRef: string;
}>;

const EXECUTION_BASIS_PROJECTION_REFUSAL: StructuralRefusal = Object.freeze({
  kind: "structural_refusal",
  stage: "validate",
  code: "execution_basis_projection",
  path: Object.freeze(["payload"]),
  evidence: Object.freeze({}),
});

function executionBasisBody(basis: ExecutionBasisRecord): JsonValue {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    basisRef: _basisRef,
    basisDigest: _basisDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = basis;
  return body;
}

/** One `basis_admitted` event as a checked record: the projection admits the
 * raw input against its recorded digest and builds the basis; the digest leg
 * compares the basis body digest with the recorded `basisDigest` (D2). */
const EXECUTION_BASIS_RECORD: RecordCheck<RuntimeEvent, ExecutionBasisRecord> = Object.freeze({
  project: (event: RuntimeEvent): Outcome<ExecutionBasisRecord> => {
    if (!isRecord(event.payload)) return EXECUTION_BASIS_PROJECTION_REFUSAL;
    const rawInputValue = admitJson(event.payload.rawInputValue);
    if (
      rawInputValue.kind !== "ok" ||
      !isRecord(rawInputValue.value) ||
      canonicalRecordDigest(rawInputValue.value) !== event.payload.rawInputDigest
    ) return EXECUTION_BASIS_PROJECTION_REFUSAL;
    return ok(deepFreeze({
      kind: "execution_basis" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      ...event.payload,
      admissionEventRef: event.eventId,
    }) as unknown as ExecutionBasisRecord);
  },
  digest: Object.freeze({
    expected: (_event: RuntimeEvent, basis: ExecutionBasisRecord) => basis.basisDigest,
    actual: (basis: ExecutionBasisRecord) => sha256Canonical(executionBasisBody(basis)),
  }),
});

/** @internal */
export function projectExactExecutionBasisRecordAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  basisRef: string,
): ExecutionBasisRecord | null;
/** @internal */
export function projectExactExecutionBasisRecordAtPrefix(
  prefix: RuntimeEventPrefix,
  basisRef: string,
): ExecutionBasisRecord | null;
export function projectExactExecutionBasisRecordAtPrefix(
  prefix: RuntimeEventPrefix,
  basisRef: string,
): ExecutionBasisRecord | null {
  const checked = checkExactRecord(
    resolveExactMatch(indexedRuntimeEvents(prefix, "payload:basisRef:" + basisRef),
      (event) =>
        event.kind === "basis_admitted" &&
        event.basisId === basisRef &&
        isRecord(event.payload) &&
        event.payload.basisRef === basisRef),
    EXECUTION_BASIS_RECORD,
  );
  // Owner boundary: `absent`, `many` and `invalid` are the existing `null`.
  if (checked.kind !== "one") return null;
  const { event, value: basis } = checked;
  if (!isRecord(event.payload)) return null;
  // The raw input digest and the basis body digest were checked above.
  return basis.basisRef ===
        `execution-basis://abiogenesis/${basis.basisDigest.slice("sha256:".length)}` &&
      event.payload.basisRef === basis.basisRef &&
      event.payload.basisDigest === basis.basisDigest &&
      event.payload.invocationAdmissionRef === basis.invocationAdmissionRef &&
      event.payload.implementationSetRef === basis.implementationSetRef &&
      event.payload.implementationSetDigest === basis.implementationSetDigest &&
      event.payload.interactionSetRef === basis.interactionSetRef &&
      event.payload.interactionSetDigest === basis.interactionSetDigest &&
      event.payload.implementationResolutionRef ===
        basis.implementationResolutionRef
    ? basis
    : null;
}
