// T-032 Stage A (REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-035/-036,
// D1.4): the ADMITTED MUTATION-OUTCOME carrier. The worker's mutation
// campaign (apply mutant -> execute suite -> restore -> report) returns
// typed rows inside the attached result artifact; admission collapses
// them ONCE at the accepted-artifact ingress, and the KERNEL mints the
// kill/survived evidence refs from admitted rows. Workers never attach
// mutation-kill:// or mutant-survived:// refs directly — a raw attached
// ref of those families is not evidence (the producer resolves only
// kernel-minted refs).
//
// Kill law: a mutant is KILLED only when the suite went red under the
// mutant (suiteExit != 0) AND the restore claim holds (restoreDigest
// === baselineDigest — digest equality of WORKER-REPORTED digests;
// kernel-witnessed digests are the named successor). A digest mismatch REJECTS the row
// (typed issue), never silently downgrades. RESIDUAL (stated, not
// hidden): baseline/restore digests are worker-reported until the F_D
// materialization handler witnesses workspace digests kernel-side.
import type { RuntimeEvent } from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  canonicalizeRowsByContent,
  detachRowSnapshot
} from "./admission_hygiene.js";
import {
  latestAdmittedEventsPerEdge,
  mutantSurvivedEvidenceRef,
  mutationKillEvidenceRef
} from "./depth_proof_map.js";

export interface MutationOutcomeRow {
  readonly requirementId: string;
  readonly mutantIdentity: string;
  // T-216 D1 (CRITICAL fix, -036 refutation semantics): mutantCompiled
  // is whether the mutant COMPILED (the suite actually ran and produced
  // reports). A compile-broken mutant is not a kill — no test refuted
  // anything. failedTestIdentityRefs names the tests that ACTUALLY WENT
  // RED under the mutant (from the mutant run's report), NOT the tests
  // the worker targeted — empty means the suite ran green (survived).
  readonly mutantCompiled: boolean;
  readonly failedTestIdentityRefs: readonly string[];
  readonly suiteExit: number;
  readonly baselineDigest: string;
  readonly restoreDigest: string;
}

export type MutationOutcomesAdmissionIssueKind =
  | "section_not_object"
  | "rows_not_array"
  | "row_not_object"
  | "requirement_id_invalid"
  | "mutant_identity_invalid"
  | "failed_test_identity_refs_invalid"
  | "mutant_compiled_invalid"
  | "suite_exit_invalid"
  | "outcome_inconsistent"
  | "digest_invalid"
  | "restore_digest_mismatch";

export interface MutationOutcomesAdmissionIssue {
  readonly issueKind: MutationOutcomesAdmissionIssueKind;
  readonly at: string;
  readonly message: string;
}

const LONE_SURROGATE = /\p{Surrogate}/u;
const DIGEST_SHAPE = /^sha256:[0-9a-f]{64}$/u;

function wellFormedNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !LONE_SURROGATE.test(value);
}

export const MUTATION_OUTCOMES_PAYLOAD_KEY = "mutationOutcomes";

export interface AdmittedMutationOutcomes {
  readonly kind: "mutation_outcomes";
  readonly outcomesRef: string;
  readonly sourceResultRef: string;
  readonly rows: readonly MutationOutcomeRow[];
  readonly replayIdentity: string;
  readonly outcomesDigest: string;
}

export function admitMutationOutcomes(input: {
  readonly payloadSection: unknown;
  readonly sourceResultRef: string;
  readonly replayIdentity: string;
}): {
  readonly accepted: boolean;
  readonly issues: readonly MutationOutcomesAdmissionIssue[];
  readonly outcomes: AdmittedMutationOutcomes | undefined;
} {
  const issues: MutationOutcomesAdmissionIssue[] = [];
  const reject = (
    issueKind: MutationOutcomesAdmissionIssueKind,
    at: string,
    message: string
  ): void => {
    issues.push(Object.freeze({ issueKind, at, message }));
  };
  const rejected = () =>
    Object.freeze({ accepted: false, issues: Object.freeze([...issues]), outcomes: undefined });
  const section = input.payloadSection;
  if (section === null || typeof section !== "object" || Array.isArray(section)) {
    reject("section_not_object", "mutationOutcomes", "must be an object with a rows array");
    return rejected();
  }
  const rawRows = (section as { readonly rows?: unknown }).rows;
  if (!Array.isArray(rawRows)) {
    reject("rows_not_array", "mutationOutcomes.rows", "must be an array of rows");
    return rejected();
  }
  const rows: MutationOutcomeRow[] = [];
  rawRows.forEach((row: unknown, index: number) => {
    const at = `mutationOutcomes.rows[${index}]`;
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      reject("row_not_object", at, "must be a row object");
      return;
    }
    // T-216 D5 read-once law (codex P1): detach ONCE into a plain
    // snapshot; validate and freeze only the snapshot. A Proxy/getter
    // that passes stringify then throws/changes on a second read cannot
    // escape admission — the original row is never read again.
    const detached = detachRowSnapshot(row);
    if (detached === null || typeof detached !== "object" || Array.isArray(detached)) {
      reject("row_not_object", at, "row fields must be plain readable data");
      return;
    }
    const c = detached as {
      readonly requirementId?: unknown;
      readonly mutantIdentity?: unknown;
      readonly mutantCompiled?: unknown;
      readonly failedTestIdentityRefs?: unknown;
      readonly suiteExit?: unknown;
      readonly baselineDigest?: unknown;
      readonly restoreDigest?: unknown;
    };
    let valid = true;
    if (!wellFormedNonEmpty(c.requirementId)) {
      reject("requirement_id_invalid", `${at}.requirementId`, "must be a non-empty well-formed string");
      valid = false;
    }
    if (!wellFormedNonEmpty(c.mutantIdentity)) {
      reject("mutant_identity_invalid", `${at}.mutantIdentity`, "must be a non-empty well-formed string");
      valid = false;
    }
    if (typeof c.mutantCompiled !== "boolean") {
      reject("mutant_compiled_invalid", `${at}.mutantCompiled`, "must be a boolean (did the mutant compile and the suite run)");
      valid = false;
    }
    // failedTestIdentityRefs: the tests that WENT RED under the mutant.
    // MAY be empty (survived). Every entry must be well-formed.
    const failed = c.failedTestIdentityRefs;
    if (!Array.isArray(failed) || !failed.every((r: unknown) => wellFormedNonEmpty(r))) {
      reject("failed_test_identity_refs_invalid", `${at}.failedTestIdentityRefs`, "must be an array of well-formed strings (empty = survived)");
      valid = false;
    }
    if (typeof c.suiteExit !== "number" || !Number.isInteger(c.suiteExit) || c.suiteExit < 0) {
      reject("suite_exit_invalid", `${at}.suiteExit`, "must be a non-negative integer exit status");
      valid = false;
    }
    // D1 internal-consistency law: the row's three signals cannot
    // contradict. compile-broken -> no legitimate failures; compiled +
    // failures -> suite must be red; compiled + no failures -> green.
    if (valid) {
      const failedRefs = failed as string[];
      const compiled = c.mutantCompiled as boolean;
      const exit = c.suiteExit as number;
      if (!compiled && failedRefs.length > 0) {
        reject("outcome_inconsistent", at, "a mutant that did not compile cannot have failed tests");
        valid = false;
      } else if (compiled && failedRefs.length > 0 && exit === 0) {
        reject("outcome_inconsistent", at, "named failed tests require a non-zero suite exit");
        valid = false;
      } else if (compiled && failedRefs.length === 0 && exit !== 0) {
        reject("outcome_inconsistent", at, "a compiled mutant with no named failures must exit 0 (survived) — an unattributed red suite is not evidence");
        valid = false;
      }
    }
    for (const [field, value] of [["baselineDigest", c.baselineDigest], ["restoreDigest", c.restoreDigest]] as const) {
      if (typeof value !== "string" || !DIGEST_SHAPE.test(value)) {
        reject("digest_invalid", `${at}.${field}`, "must be a sha256:<64-hex> digest");
        valid = false;
      }
    }
    if (valid && c.baselineDigest !== c.restoreDigest) {
      reject("restore_digest_mismatch", at, "restoreDigest must equal baselineDigest — subject not verifiably restored");
      valid = false;
    }
    if (valid) {
      rows.push(Object.freeze({
        requirementId: c.requirementId as string,
        mutantIdentity: c.mutantIdentity as string,
        mutantCompiled: c.mutantCompiled as boolean,
        failedTestIdentityRefs: Object.freeze([...(failed as string[])].sort()),
        suiteExit: c.suiteExit as number,
        baselineDigest: c.baselineDigest as string,
        restoreDigest: c.restoreDigest as string
      }));
    }
  });
  if (issues.length > 0) {
    return rejected();
  }
  const canonicalRows = canonicalizeRowsByContent(rows);
  return Object.freeze({
    accepted: true,
    issues: Object.freeze([]),
    outcomes: Object.freeze({
      kind: "mutation_outcomes" as const,
      outcomesRef: `mutation-outcomes://${encodeURIComponent(input.sourceResultRef)}`,
      sourceResultRef: input.sourceResultRef,
      rows: canonicalRows,
      replayIdentity: input.replayIdentity,
      outcomesDigest: stableSha256Digest({ sourceResultRef: input.sourceResultRef, rows: canonicalRows })
    })
  });
}

// KERNEL MINT (T-216 D1, the Critical fix): the only lawful source of
// kill/survived evidence refs.
//   compile-broken mutant  -> mints NOTHING (no test refuted anything;
//                             the obligation stays a typed gap)
//   compiled + named failures -> kill evidence for EACH failed identity
//                             (only the tests that actually went red —
//                             never the full targeted list)
//   compiled + no failures -> survived (counterexample)
// The obligation cross-check (deriveUnprovenKillObligationGapRefs) then
// requires the FAILED identities to cover the map row's required
// identities: one lazy or compile-broken row can no longer discharge
// the kill topology.
export function mintMutationEvidenceRefs(
  rows: readonly MutationOutcomeRow[]
): readonly string[] {
  const refs: string[] = [];
  for (const row of rows) {
    if (!row.mutantCompiled) {
      // a mutant that did not compile is not adversarial evidence
      continue;
    }
    if (row.failedTestIdentityRefs.length > 0) {
      for (const testIdentity of row.failedTestIdentityRefs) {
        refs.push(mutationKillEvidenceRef(row.requirementId, testIdentity));
      }
    } else {
      refs.push(mutantSurvivedEvidenceRef(row.requirementId, row.mutantIdentity));
    }
  }
  return Object.freeze([...new Set(refs)].sort());
}

// Replay projection: kernel-minted mutation evidence from admitted
// mutation_outcomes_admitted events. This is the ONLY path by which
// mutation-kill:// / mutant-survived:// refs become resolvable — raw
// worker-attached refs of these families are excluded at the producer.
export function deriveKernelMintedMutationRefs(
  replayEvents: readonly RuntimeEvent[]
): ReadonlySet<string> {
  const refs = new Set<string>();
  // T-216 D2 (codex/S1): only the LAST admitted event per edge mints —
  // a superseding retry (including one that omits the outcomes) retires
  // the prior attempt's mints. No per-attempt union.
  for (const event of latestAdmittedEventsPerEdge(replayEvents, "mutation_outcomes_admitted")) {
    if (event.kind !== "mutation_outcomes_admitted" || event.accepted !== true) {
      continue;
    }
    for (const ref of mintMutationEvidenceRefs(event.rows)) {
      refs.add(ref);
    }
  }
  return refs;
}
