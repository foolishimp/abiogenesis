// T-197 (REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-035/-036): the FULL
// ProofStrengthAdmission carrier, superseding the interim ref-set
// projection (payload_ledger deriveAdmittedStrengthRefSet remains the
// admitted-evidence primitive this derivation consumes; consumers of
// STRENGTH truth swap to this carrier, not to the raw set).
//
// This is an "equivalent admitted projection" in the -035 sense: it is
// a TOTAL derivation over already-admitted replay truth (the evidence
// ledger, the admitted contract/envelope, the earned-depth and
// adversarial derivations). No new event kind — the depth map needed an
// admission event because it arrives from OUTSIDE; strength admission
// has no open ingress of its own, so a derived carrier is the prime
// shape (carrier-minimalism law).
//
// -036 boundary: F_P may PROPOSE a strength judgment, but worker
// self-report, prompt shape, passing tests, or a caller-supplied label
// never become admitted proof strength. Disposition here derives only
// from admitted evidence membership — fd criteria resolved against the
// ledger, or adversarial verification evidence with no counterexample.
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

// Closed disposition vocabulary (-036): only the two verified forms are
// closure-bearing; everything else is the one typed refusal.
export type ProofStrengthDisposition =
  | "fd_checked"
  | "adversarially_verified"
  | "not_admitted";

// The -035 preserved field list, verbatim: strength ref, source
// requirement obligation refs, proof obligation refs, proof policy
// refs, expected evidence shape refs, depth class refs, verifier refs,
// adversarial attempt refs when required, counterexample refs when
// present, disposition, and replay identity.
export interface ProofStrengthAdmission {
  readonly kind: "proof_strength_admission";
  readonly admissionRef: string;
  readonly strengthRef: string;
  readonly sourceRequirementObligationRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly proofPolicyRefs: readonly string[];
  readonly expectedEvidenceShapeRefs: readonly string[];
  readonly depthClassRefs: readonly string[];
  readonly verifierRefs: readonly string[];
  readonly adversarialAttemptRefs: readonly string[];
  readonly counterexampleRefs: readonly string[];
  readonly disposition: ProofStrengthDisposition;
  readonly replayIdentity: string;
  readonly admissionDigest: string;
}

export interface ProofStrengthAdmissionDerivationInput {
  readonly envelopeRef: string;
  readonly replayIdentity: string;
  readonly strengthRefs: readonly string[];
  readonly fdStrengthCriterionRefs: readonly string[];
  readonly sourceRequirementObligationRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly proofPolicyRefs: readonly string[];
  readonly expectedEvidenceShapeRefs: readonly string[];
  // the DECLARED depth truth fed to the proof-depth carrier (earned
  // classes when a map is admitted — break 2)
  readonly depthClassRefs: readonly string[];
  // ledger-resolved adversarial truth (break 4) — already scoped to the
  // consuming entry's requirement set
  readonly adversarialAttemptRefs: readonly string[];
  readonly adversarialVerificationRefs: readonly string[];
  readonly counterexampleRefs: readonly string[];
  readonly admittedEvidenceRefs: ReadonlySet<string>;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

// Total per strength ref over the finite admitted state. The disposition
// lattice, in precedence order:
//   counterexample present            -> not_admitted (nothing outvotes it)
//   ref admitted + fd criteria total  -> fd_checked
//   ref admitted + adversarial truth  -> adversarially_verified
//   otherwise                         -> not_admitted
// Mirrors the interim boolean exactly; the carrier preserves WHY.
export function deriveProofStrengthAdmissionsForEnvelope(
  input: ProofStrengthAdmissionDerivationInput
): readonly ProofStrengthAdmission[] {
  const fdCriteriaResolved =
    input.fdStrengthCriterionRefs.length > 0 &&
    input.fdStrengthCriterionRefs.every((ref) =>
      input.admittedEvidenceRefs.has(ref)
    );
  const adversariallyVerified = input.adversarialVerificationRefs.length > 0;
  const counterexampleRefs = uniqueSorted(input.counterexampleRefs);
  const admissions = uniqueSorted(input.strengthRefs).map((strengthRef) => {
    let disposition: ProofStrengthDisposition = "not_admitted";
    let verifierRefs: readonly string[] = Object.freeze([]);
    if (
      counterexampleRefs.length === 0 &&
      input.admittedEvidenceRefs.has(strengthRef)
    ) {
      if (fdCriteriaResolved) {
        disposition = "fd_checked";
        verifierRefs = uniqueSorted(input.fdStrengthCriterionRefs);
      } else if (adversariallyVerified) {
        disposition = "adversarially_verified";
        verifierRefs = uniqueSorted(input.adversarialVerificationRefs);
      }
    }
    const withoutDigest = {
      kind: "proof_strength_admission" as const,
      admissionRef: `proof-strength-admission-truth://${encodeURIComponent(input.envelopeRef)}/${encodeURIComponent(strengthRef)}`,
      strengthRef,
      sourceRequirementObligationRefs: uniqueSorted(
        input.sourceRequirementObligationRefs
      ),
      proofObligationRefs: uniqueSorted(input.proofObligationRefs),
      proofPolicyRefs: uniqueSorted(input.proofPolicyRefs),
      expectedEvidenceShapeRefs: uniqueSorted(input.expectedEvidenceShapeRefs),
      depthClassRefs: uniqueSorted(input.depthClassRefs),
      verifierRefs,
      adversarialAttemptRefs: uniqueSorted(input.adversarialAttemptRefs),
      counterexampleRefs,
      disposition,
      replayIdentity: input.replayIdentity
    };
    return Object.freeze({
      ...withoutDigest,
      admissionDigest: stableSha256Digest(withoutDigest)
    });
  });
  return Object.freeze(admissions);
}

export function closureBearingStrengthRefs(
  admissions: readonly ProofStrengthAdmission[]
): readonly string[] {
  return Object.freeze(
    admissions
      .filter((admission) => admission.disposition !== "not_admitted")
      .map((admission) => admission.strengthRef)
  );
}
