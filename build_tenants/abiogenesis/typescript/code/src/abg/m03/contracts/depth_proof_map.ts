// T-210 break 1 (REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-033/-034/-039):
// the ADMITTED DEPTH-PROOF-MAP carrier — the worker-declared mapping
// test identity -> depth class -> requirement, delivered inside the
// attached result artifact payload and collapsed ONCE at ingress into
// this typed carrier. The map is the intermediate asset that DISCOVERS
// the proof topology: earned-depth derivation and kill-obligation
// projection consume ADMITTED maps from replay, never raw payloads.
//
// F_D totality law: admission is total over unknown payload content with
// a CLOSED issue vocabulary; consumers accept only the admitted carrier.
import type { RuntimeEvent } from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export interface DepthProofMapRow {
  readonly requirementId: string;
  readonly depthClassRef: string;
  readonly testIdentityRefs: readonly string[];
}

export interface DepthProofMap {
  readonly kind: "depth_proof_map";
  readonly mapRef: string;
  readonly sourceResultRef: string;
  readonly rows: readonly DepthProofMapRow[];
  readonly replayIdentity: string;
  readonly mapDigest: string;
}

export type DepthProofMapAdmissionIssueKind =
  | "map_not_object"
  | "rows_not_array"
  | "row_not_object"
  | "requirement_id_invalid"
  | "depth_class_invalid"
  | "test_identity_refs_invalid";

export interface DepthProofMapAdmissionIssue {
  readonly issueKind: DepthProofMapAdmissionIssueKind;
  readonly at: string;
  readonly message: string;
}

// lone surrogates would throw in downstream ref minting — reject at the
// one ingress (the carry-through startup admission precedent)
const LONE_SURROGATE = /\p{Surrogate}/u;

function wellFormedNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !LONE_SURROGATE.test(value);
}

// The one payload location: attached result artifact payloads carry the
// map under this key. Presence is optional (absence is a typed gap at
// the earned-depth derivation, never an admission error here).
export const DEPTH_PROOF_MAP_PAYLOAD_KEY = "depthProofMap";

export function admitDepthProofMap(input: {
  readonly payloadSection: unknown;
  readonly sourceResultRef: string;
  readonly replayIdentity: string;
}): {
  readonly accepted: boolean;
  readonly issues: readonly DepthProofMapAdmissionIssue[];
  readonly map: DepthProofMap | undefined;
} {
  const issues: DepthProofMapAdmissionIssue[] = [];
  const reject = (
    issueKind: DepthProofMapAdmissionIssueKind,
    at: string,
    message: string
  ): void => {
    issues.push(Object.freeze({ issueKind, at, message }));
  };
  const section = input.payloadSection;
  if (section === null || typeof section !== "object" || Array.isArray(section)) {
    reject("map_not_object", "depthProofMap", "must be an object with a rows array");
    return Object.freeze({ accepted: false, issues: Object.freeze(issues), map: undefined });
  }
  const rawRows = (section as { readonly rows?: unknown }).rows;
  if (!Array.isArray(rawRows)) {
    reject("rows_not_array", "depthProofMap.rows", "must be an array of rows");
    return Object.freeze({ accepted: false, issues: Object.freeze(issues), map: undefined });
  }
  const rows: DepthProofMapRow[] = [];
  rawRows.forEach((row: unknown, index: number) => {
    const at = `depthProofMap.rows[${index}]`;
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      reject("row_not_object", at, "must be a row object");
      return;
    }
    const candidate = row as {
      readonly requirementId?: unknown;
      readonly depthClassRef?: unknown;
      readonly testIdentityRefs?: unknown;
    };
    let valid = true;
    if (!wellFormedNonEmpty(candidate.requirementId)) {
      reject("requirement_id_invalid", `${at}.requirementId`, "must be a non-empty well-formed string");
      valid = false;
    }
    if (!wellFormedNonEmpty(candidate.depthClassRef)) {
      reject("depth_class_invalid", `${at}.depthClassRef`, "must be a non-empty well-formed string");
      valid = false;
    }
    const refs = candidate.testIdentityRefs;
    if (
      !Array.isArray(refs) ||
      refs.length === 0 ||
      !refs.every((ref: unknown) => wellFormedNonEmpty(ref))
    ) {
      reject(
        "test_identity_refs_invalid",
        `${at}.testIdentityRefs`,
        "must be a non-empty array of non-empty well-formed strings"
      );
      valid = false;
    }
    if (valid) {
      rows.push(Object.freeze({
        requirementId: candidate.requirementId as string,
        depthClassRef: candidate.depthClassRef as string,
        testIdentityRefs: Object.freeze([...(refs as string[])].sort())
      }));
    }
  });
  if (issues.length > 0) {
    return Object.freeze({ accepted: false, issues: Object.freeze(issues), map: undefined });
  }
  const canonicalRows = Object.freeze(
    [...rows].sort((left, right) =>
      `${left.requirementId}:${left.depthClassRef}`.localeCompare(
        `${right.requirementId}:${right.depthClassRef}`
      )
    )
  );
  const mapDigest = stableSha256Digest({
    sourceResultRef: input.sourceResultRef,
    rows: canonicalRows
  });
  return Object.freeze({
    accepted: true,
    issues: Object.freeze([]),
    map: Object.freeze({
      kind: "depth_proof_map" as const,
      mapRef: `depth-proof-map://${encodeURIComponent(input.sourceResultRef)}`,
      sourceResultRef: input.sourceResultRef,
      rows: canonicalRows,
      replayIdentity: input.replayIdentity,
      mapDigest
    })
  });
}

// Ledger projection (replay-derived, read-only): the admitted maps per
// requirement. Later admissions supersede earlier ones for the same
// requirement (correction shadows stale truth; history stays in replay).
export function deriveAdmittedDepthProofRowsByRequirementId(
  replayEvents: readonly RuntimeEvent[]
): ReadonlyMap<string, readonly DepthProofMapRow[]> {
  const byRequirement = new Map<string, DepthProofMapRow[]>();
  for (const event of replayEvents) {
    if (event.kind !== "depth_proof_map_admitted" || event.accepted !== true) {
      continue;
    }
    const seen = new Set<string>();
    for (const row of event.rows) {
      if (!seen.has(row.requirementId)) {
        // a newer admitted map REPLACES this requirement's rows
        byRequirement.set(row.requirementId, []);
        seen.add(row.requirementId);
      }
      byRequirement.get(row.requirementId)?.push(Object.freeze({
        requirementId: row.requirementId,
        depthClassRef: row.depthClassRef,
        testIdentityRefs: Object.freeze([...row.testIdentityRefs])
      }));
    }
  }
  const frozen = new Map<string, readonly DepthProofMapRow[]>();
  for (const [requirementId, rows] of byRequirement) {
    frozen.set(requirementId, Object.freeze(rows));
  }
  return frozen;
}
