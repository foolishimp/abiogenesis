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
import { checkExactRecord, resolveExactMatch, type CheckedRecord, type ExactMatch, type RecordCheck } from "../../shared/select/index.js";
import { canonicalRecordDigest } from "../../shared/value/index.js";
import {
  indexedRuntimeEvents, isValidationRuntimeEventPrefix, runtimePrefixComputation,
  type RuntimeEventPrefix, type ValidatedRuntimeEventPrefix,
} from "../event_prefix.js";
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
    executionBasisRowWork.rowAdmissions++;
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
    actual: (basis: ExecutionBasisRecord) => {
      executionBasisRowWork.bodyDigests++;
      return sha256Canonical(executionBasisBody(basis));
    },
  }),
});

/** Observation-only row-law work counts for the §10.12 row-fact proof: raw
 * input admissions (admitJson plus raw digest) and basis body digests actually
 * computed. They select, cache and change no basis, event or refusal. */
const executionBasisRowWork = { rowAdmissions: 0, bodyDigests: 0 };

/** @internal A frozen snapshot of the observation-only counts. */
export function observeExecutionBasisRowWork(): Readonly<typeof executionBasisRowWork> {
  return Object.freeze({ ...executionBasisRowWork });
}

const EXECUTION_BASIS_ROW_FACTS = Symbol("execution_basis_row_facts");
/** The row law over one admitted `basis_admitted` row is an immutable fact of
 * that row. It is checked once and retained in the prefix's own authenticated
 * derivation territory, which spans every cut of one ordered lineage, under
 * the row's event id and admission ordinal. Selection membership and match
 * cardinality stay outside the fact: every call resolves its own exact match
 * at its own cut, so a later duplicate is `many`, an earlier cut lacking the
 * row is `absent`, and a foreign, copied or raw history has its own territory
 * and checks cold. Only a `one` outcome is retained, so a refused row is
 * checked again and reproduces its refusal. A validation view retains nothing. */
function checkExecutionBasisRow(
  prefix: RuntimeEventPrefix,
  match: ExactMatch<RuntimeEvent>,
): CheckedRecord<RuntimeEvent, ExecutionBasisRecord> {
  if (match.kind !== "one" || isValidationRuntimeEventPrefix(prefix)) {
    return checkExactRecord(match, EXECUTION_BASIS_RECORD);
  }
  const event = match.value;
  const facts = runtimePrefixComputation(prefix, EXECUTION_BASIS_ROW_FACTS,
    () => new Map<string, ExecutionBasisRecord>());
  const row = event.eventId + ":" + event.admissionOrdinal;
  const retained = facts.get(row);
  if (retained !== undefined) return Object.freeze({ kind: "one", event, value: retained });
  const checked = checkExactRecord(match, EXECUTION_BASIS_RECORD);
  if (checked.kind === "one") facts.set(row, checked.value);
  return checked;
}

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
  const checked = checkExecutionBasisRow(prefix,
    resolveExactMatch(indexedRuntimeEvents(prefix, "payload:basisRef:" + basisRef),
      (event) =>
        event.kind === "basis_admitted" &&
        event.basisId === basisRef &&
        isRecord(event.payload) &&
        event.payload.basisRef === basisRef),
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
