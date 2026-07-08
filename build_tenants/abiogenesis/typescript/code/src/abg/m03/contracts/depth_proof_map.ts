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

// ── T-210 break 2: EARNED-DEPTH DERIVATION (-034/-039) ──────────────────
// Severs plan-declared depth authority for map-bearing requirements: when
// an ADMITTED depth-proof map covers a requirement, declared depth truth
// derives from the map and from admitted test-identity evidence — never
// from declaration equality. Requirements without an admitted map retain
// the transitional plan-declared path (the -038 pattern).

// Test identities are admitted through the EXISTING evidence machinery:
// the executing worker attaches one evidence ref per executed test
// identity; the derivation checks map rows against the admitted set.
export const TEST_IDENTITY_EVIDENCE_PREFIX = "test-identity://";

export function testIdentityEvidenceRef(testIdentity: string): string {
  return `${TEST_IDENTITY_EVIDENCE_PREFIX}${encodeURIComponent(testIdentity)}`;
}

function depthGapRef(requirementId: string, depthClassRef: string, gapKind: string): string {
  return [
    "depth-gap:/",
    encodeURIComponent(requirementId),
    encodeURIComponent(depthClassRef),
    gapKind
  ].join("/");
}

export interface EarnedDepthTruth {
  readonly mapped: boolean;
  readonly declaredDepthClassRefs: readonly string[];
  readonly typedDepthGapRefs: readonly string[];
}

// Total over the finite admitted state: admitted map rows (replay) x
// required classes (admitted contract) x admitted evidence refs. The
// per-(requirement, class) cell lattice is
//   { unmapped, mapped_identity_unverified, earned }
// — unmapped and unverified map to typed gap refs; earned classes become
// declared truth; depthComplete then derives in the existing constructor.
export function deriveEarnedDepthTruth(input: {
  readonly replayEvents: readonly RuntimeEvent[];
  readonly requirementId: string;
  readonly requiredDepthClassRefs: readonly string[];
  readonly admittedEvidenceRefs: ReadonlySet<string>;
}): EarnedDepthTruth {
  const rowsByRequirement = deriveAdmittedDepthProofRowsByRequirementId(input.replayEvents);
  const rows = rowsByRequirement.get(input.requirementId);
  if (rows === undefined) {
    return Object.freeze({
      mapped: false,
      declaredDepthClassRefs: Object.freeze([]),
      typedDepthGapRefs: Object.freeze([])
    });
  }
  const rowsByClass = new Map<string, DepthProofMapRow[]>();
  for (const row of rows) {
    const bucket = rowsByClass.get(row.depthClassRef) ?? [];
    bucket.push(row);
    rowsByClass.set(row.depthClassRef, bucket);
  }
  const declared: string[] = [];
  const gaps: string[] = [];
  for (const depthClassRef of [...new Set(input.requiredDepthClassRefs)].sort()) {
    const classRows = rowsByClass.get(depthClassRef);
    if (classRows === undefined) {
      gaps.push(depthGapRef(input.requirementId, depthClassRef, "unmapped"));
      continue;
    }
    const verified = classRows.some((row) =>
      row.testIdentityRefs.some((testIdentity) =>
        input.admittedEvidenceRefs.has(testIdentityEvidenceRef(testIdentity))
      )
    );
    if (!verified) {
      gaps.push(depthGapRef(input.requirementId, depthClassRef, "identity-unverified"));
      continue;
    }
    declared.push(depthClassRef);
  }
  return Object.freeze({
    mapped: true,
    declaredDepthClassRefs: Object.freeze(declared),
    typedDepthGapRefs: Object.freeze(gaps)
  });
}

// Entry-level combination over an entry's full requirement set. The
// migration law "mixed old/new depth authority is non-closure" binds
// here: once ANY requirement in the entry has an admitted map, EVERY
// requirement is held to earned truth — an unmapped sibling contributes
// unmapped gaps for all required classes, and a class is declared only
// when every requirement in the entry has earned it.
export function deriveEarnedDepthTruthForRequirements(input: {
  readonly replayEvents: readonly RuntimeEvent[];
  readonly requirementIds: readonly string[];
  readonly requiredDepthClassRefs: readonly string[];
  readonly admittedEvidenceRefs: ReadonlySet<string>;
}): EarnedDepthTruth {
  const perRequirement = input.requirementIds.map((requirementId) => ({
    requirementId,
    earned: deriveEarnedDepthTruth({
      replayEvents: input.replayEvents,
      requirementId,
      requiredDepthClassRefs: input.requiredDepthClassRefs,
      admittedEvidenceRefs: input.admittedEvidenceRefs
    })
  }));
  if (!perRequirement.some((entry) => entry.earned.mapped)) {
    return Object.freeze({
      mapped: false,
      declaredDepthClassRefs: Object.freeze([]),
      typedDepthGapRefs: Object.freeze([])
    });
  }
  const requiredClasses = [...new Set(input.requiredDepthClassRefs)].sort();
  const gaps = new Set<string>();
  let declared = new Set<string>(requiredClasses);
  for (const { requirementId, earned } of perRequirement) {
    if (!earned.mapped) {
      declared = new Set<string>();
      for (const depthClassRef of requiredClasses) {
        gaps.add(depthGapRef(requirementId, depthClassRef, "unmapped"));
      }
      continue;
    }
    declared = new Set<string>(
      [...declared].filter((depthClassRef) =>
        earned.declaredDepthClassRefs.includes(depthClassRef)
      )
    );
    for (const gap of earned.typedDepthGapRefs) {
      gaps.add(gap);
    }
  }
  return Object.freeze({
    mapped: true,
    declaredDepthClassRefs: Object.freeze([...declared].sort()),
    typedDepthGapRefs: Object.freeze([...gaps].sort())
  });
}

// ── T-210 break 3: KILL-OBLIGATION PROJECTION (-039, the Gödel break) ────
// Proof obligations whose cardinality is DISCOVERED, never declared: each
// admitted map row in a contract-declared adversarial depth class projects
// one kill obligation. The topology could not be enumerated up front — the
// intermediate computation (the map delivery) discovers it. Kill evidence
// rides the existing evidence machinery per test identity; an obligation
// without complete kill evidence is a typed gap, not silence.
export const MUTATION_KILL_EVIDENCE_PREFIX = "mutation-kill://";

// Kill evidence is OBLIGATION-SCOPED (review HIGH 2026-07-09): the same
// test identity may appear on rows of several requirements, and a kill
// claim is about one requirement's mutant surface — an unscoped ref
// would let one admitted kill satisfy every obligation naming that
// identity. The requirement id is part of the evidence identity.
// (Test-identity evidence stays unscoped by design: it attests that a
// named test EXECUTED, a fact about the test, not about a requirement.)
export function mutationKillEvidenceRef(
  requirementId: string,
  testIdentity: string
): string {
  return `${MUTATION_KILL_EVIDENCE_PREFIX}${encodeURIComponent(requirementId)}/${encodeURIComponent(testIdentity)}`;
}

export interface DerivedKillObligation {
  readonly obligationRef: string;
  readonly requirementId: string;
  readonly depthClassRef: string;
  readonly testIdentityRefs: readonly string[];
}

export function deriveKillObligations(input: {
  readonly replayEvents: readonly RuntimeEvent[];
  readonly requirementIds: readonly string[];
  readonly adversarialDepthClassRefs: readonly string[];
}): readonly DerivedKillObligation[] {
  const adversarialClasses = new Set(input.adversarialDepthClassRefs);
  if (adversarialClasses.size === 0) {
    return Object.freeze([]);
  }
  const rowsByRequirement = deriveAdmittedDepthProofRowsByRequirementId(input.replayEvents);
  const obligations: DerivedKillObligation[] = [];
  for (const requirementId of [...new Set(input.requirementIds)].sort()) {
    for (const row of rowsByRequirement.get(requirementId) ?? []) {
      if (!adversarialClasses.has(row.depthClassRef)) {
        continue;
      }
      // content-derived identity: the same admitted row always projects
      // the same obligation ref across replays
      const rowDigest = stableSha256Digest({
        requirementId: row.requirementId,
        depthClassRef: row.depthClassRef,
        testIdentityRefs: row.testIdentityRefs
      });
      obligations.push(Object.freeze({
        obligationRef: [
          "kill-obligation:/",
          encodeURIComponent(row.requirementId),
          encodeURIComponent(row.depthClassRef),
          rowDigest.replace(/^sha256:/u, "").slice(0, 12)
        ].join("/"),
        requirementId: row.requirementId,
        depthClassRef: row.depthClassRef,
        testIdentityRefs: row.testIdentityRefs
      }));
    }
  }
  return Object.freeze(obligations);
}

// The break-3 gap law: an obligation is proven only when EVERY test
// identity on its row has admitted kill evidence; anything less is a
// typed gap carrying the obligation identity.
export function deriveUnprovenKillObligationGapRefs(input: {
  readonly obligations: readonly DerivedKillObligation[];
  readonly admittedEvidenceRefs: ReadonlySet<string>;
}): readonly string[] {
  const gaps: string[] = [];
  for (const obligation of input.obligations) {
    const proven = obligation.testIdentityRefs.every((testIdentity) =>
      input.admittedEvidenceRefs.has(
        mutationKillEvidenceRef(obligation.requirementId, testIdentity)
      )
    );
    if (!proven) {
      gaps.push(`${obligation.obligationRef}/kill-unproven`);
    }
  }
  return Object.freeze([...gaps].sort());
}

// ── T-210 break 4: LEDGER-RESOLVED ADVERSARIAL TRUTH (-035/-036) ─────────
// Survived mutants arrive as admitted evidence and become counterexample
// truth for the EXISTING adversarial_counterexample_found gate; admitted
// mutation-kill evidence doubles as adversarial verification. Template
// declarations never masquerade as either.
export const MUTANT_SURVIVED_EVIDENCE_PREFIX = "mutant-survived://";

// Requirement-scoped for the same reason as kill evidence: a survived
// mutant is a counterexample against ONE requirement's proof — an
// unscoped ref would block every entry in the run.
export function mutantSurvivedEvidenceRef(
  requirementId: string,
  mutantIdentity: string
): string {
  return `${MUTANT_SURVIVED_EVIDENCE_PREFIX}${encodeURIComponent(requirementId)}/${encodeURIComponent(mutantIdentity)}`;
}

export interface AdmittedAdversarialTruth {
  readonly verificationRefs: readonly string[];
  readonly counterexampleRefs: readonly string[];
}

// Resolution is scoped to the consuming entry's requirement set: only
// evidence minted against one of THESE requirements resolves here. A
// foreign entry's kill evidence is not verification for this one, and a
// foreign entry's survived mutant does not block it.
export function deriveAdmittedAdversarialTruth(input: {
  readonly admittedEvidenceRefs: ReadonlySet<string>;
  readonly requirementIds: readonly string[];
}): AdmittedAdversarialTruth {
  const killPrefixes = input.requirementIds.map(
    (requirementId) =>
      `${MUTATION_KILL_EVIDENCE_PREFIX}${encodeURIComponent(requirementId)}/`
  );
  const survivedPrefixes = input.requirementIds.map(
    (requirementId) =>
      `${MUTANT_SURVIVED_EVIDENCE_PREFIX}${encodeURIComponent(requirementId)}/`
  );
  const verificationRefs: string[] = [];
  const counterexampleRefs: string[] = [];
  for (const ref of input.admittedEvidenceRefs) {
    if (killPrefixes.some((prefix) => ref.startsWith(prefix))) {
      verificationRefs.push(ref);
    } else if (survivedPrefixes.some((prefix) => ref.startsWith(prefix))) {
      counterexampleRefs.push(ref);
    }
  }
  return Object.freeze({
    verificationRefs: Object.freeze(verificationRefs.sort()),
    counterexampleRefs: Object.freeze(counterexampleRefs.sort())
  });
}
