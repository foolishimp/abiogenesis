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
// mutant (suiteExit != 0) AND the subject was verifiably restored
// (restoreDigest === baselineDigest). A digest mismatch REJECTS the row
// (typed issue), never silently downgrades. RESIDUAL (stated, not
// hidden): baseline/restore digests are worker-reported until the F_D
// materialization handler witnesses workspace digests kernel-side.
import type { RuntimeEvent } from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  mutantSurvivedEvidenceRef,
  mutationKillEvidenceRef
} from "./depth_proof_map.js";

export interface MutationOutcomeRow {
  readonly requirementId: string;
  readonly mutantIdentity: string;
  readonly testIdentityRefs: readonly string[];
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
  | "test_identity_refs_invalid"
  | "suite_exit_invalid"
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
    const c = row as {
      readonly requirementId?: unknown;
      readonly mutantIdentity?: unknown;
      readonly testIdentityRefs?: unknown;
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
    const refs = c.testIdentityRefs;
    if (!Array.isArray(refs) || refs.length === 0 || !refs.every((r: unknown) => wellFormedNonEmpty(r))) {
      reject("test_identity_refs_invalid", `${at}.testIdentityRefs`, "must be a non-empty array of well-formed strings");
      valid = false;
    }
    if (typeof c.suiteExit !== "number" || !Number.isInteger(c.suiteExit) || c.suiteExit < 0) {
      reject("suite_exit_invalid", `${at}.suiteExit`, "must be a non-negative integer exit status");
      valid = false;
    }
    for (const [field, value] of [["baselineDigest", c.baselineDigest], ["restoreDigest", c.restoreDigest]] as const) {
      if (typeof value !== "string" || !DIGEST_SHAPE.test(value)) {
        reject("digest_invalid", `${at}.${field}`, "must be a sha256:<64-hex> digest");
        valid = false;
      }
    }
    if (valid && c.baselineDigest !== c.restoreDigest) {
      // the restore law: an unrestored subject invalidates the row —
      // typed rejection, never a silent downgrade to survived/killed
      reject("restore_digest_mismatch", at, "restoreDigest must equal baselineDigest — subject not verifiably restored");
      valid = false;
    }
    if (valid) {
      rows.push(Object.freeze({
        requirementId: c.requirementId as string,
        mutantIdentity: c.mutantIdentity as string,
        testIdentityRefs: Object.freeze([...(refs as string[])].sort()),
        suiteExit: c.suiteExit as number,
        baselineDigest: c.baselineDigest as string,
        restoreDigest: c.restoreDigest as string
      }));
    }
  });
  if (issues.length > 0) {
    return rejected();
  }
  const canonicalRows = Object.freeze(
    [...rows].sort((a, b) =>
      `${a.requirementId}:${a.mutantIdentity}`.localeCompare(`${b.requirementId}:${b.mutantIdentity}`)
    )
  );
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

// KERNEL MINT: the only lawful source of kill/survived evidence refs.
// killed  = suite red under the mutant (admission already proved restore)
// survived = suite green under the mutant -> counterexample
export function mintMutationEvidenceRefs(
  rows: readonly MutationOutcomeRow[]
): readonly string[] {
  const refs: string[] = [];
  for (const row of rows) {
    if (row.suiteExit !== 0) {
      for (const testIdentity of row.testIdentityRefs) {
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
  for (const event of replayEvents) {
    if (event.kind !== "mutation_outcomes_admitted" || event.accepted !== true) {
      continue;
    }
    for (const ref of mintMutationEvidenceRefs(event.rows)) {
      refs.add(ref);
    }
  }
  return refs;
}
