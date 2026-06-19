// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import type { SdlcAssuranceLedger } from "./carriers.js";
import { assuranceLedger, assuranceReason, uniqueSorted } from "./shared.js";

export type SdlcSemanticClaimStatus =
  | "covered"
  | "restated"
  | "missing"
  | "contradicted";

export interface SdlcSemanticConvergenceClaim {
  readonly kind: "sdlc_semantic_convergence_claim";
  readonly targetRef: string;
  readonly status: SdlcSemanticClaimStatus;
  readonly evidenceRefs: readonly string[];
  readonly predecessorRefs?: readonly string[];
}

function isSemanticConvergenceClaim(
  claim: SdlcSemanticConvergenceClaim | undefined
): claim is SdlcSemanticConvergenceClaim {
  return claim !== undefined;
}

export function deriveSemanticConvergenceAssuranceLedger(input: {
  readonly targetRefs: readonly string[];
  readonly claims: readonly SdlcSemanticConvergenceClaim[];
}): SdlcAssuranceLedger {
  if (input.targetRefs.length === 0) {
    return assuranceLedger({
      dimension: "semantic_convergence",
      verdict: "reprice_required",
      reasons: [
        assuranceReason({
          code: "semantic_target_missing",
          message: "Semantic convergence requires at least one declared target.",
          lawfulReentryPoint: "requirement_reprice"
        })
      ]
    });
  }
  const claimByTargetRef = new Map(
    input.claims.map((claim) => [claim.targetRef, claim])
  );
  const missingClaims = input.targetRefs.filter(
    (targetRef) => !claimByTargetRef.has(targetRef)
  );
  const nonCoveringClaims = input.targetRefs
    .map((targetRef) => claimByTargetRef.get(targetRef))
    .filter(isSemanticConvergenceClaim)
    .filter((claim) => claim.status !== "covered");
  const reasons = Object.freeze([
    ...missingClaims.map((targetRef) =>
      assuranceReason({
        code: `semantic_claim_missing:${targetRef}`,
        message: `No semantic convergence claim exists for ${targetRef}.`,
        predecessorRefs: [targetRef],
        lawfulReentryPoint: "same_edge_retry"
      })
    ),
    ...nonCoveringClaims.map((claim) =>
      assuranceReason({
        code: `semantic_${claim.status}:${claim.targetRef}`,
        message: `Semantic convergence for ${claim.targetRef} is ${claim.status}.`,
        evidenceRefs: claim.evidenceRefs,
        predecessorRefs: Object.freeze([
          claim.targetRef,
          ...(claim.predecessorRefs ?? claim.evidenceRefs)
        ]),
        lawfulReentryPoint:
          claim.status === "contradicted" ? "design_reframe" : "same_edge_retry"
      })
    )
  ]);
  const hasContradiction = nonCoveringClaims.some(
    (claim) => claim.status === "contradicted"
  );

  return assuranceLedger({
    dimension: "semantic_convergence",
    verdict:
      hasContradiction
        ? "reprice_required"
        : reasons.length > 0
          ? "open_gap"
          : "satisfied",
    reasons,
    evidenceRefs: uniqueSorted(input.claims.flatMap((claim) => claim.evidenceRefs)),
    predecessorRefs: uniqueSorted([
      ...input.targetRefs,
      ...input.claims.flatMap((claim) => [
        ...(claim.predecessorRefs ?? claim.evidenceRefs),
        ...claim.evidenceRefs
      ])
    ]),
    carryForwardObligationRefs: uniqueSorted(
      reasons.map((reason) => `semantic://${reason.code}`)
    )
  });
}
