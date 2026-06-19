// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import type { SdlcAssuranceLedger } from "./carriers.js";
import {
  assuranceLedger,
  assuranceReason,
  uniqueSorted,
  verdictFromReasons
} from "./shared.js";

export type SdlcAmbiguityAssuranceKind =
  | "target_asset_identity"
  | "authority_layer"
  | "candidate_evidence"
  | "transition_basis";

export interface SdlcAmbiguityFinding {
  readonly kind: "sdlc_ambiguity_finding";
  readonly ambiguityKind: SdlcAmbiguityAssuranceKind;
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
  readonly resolution?: "blocked" | "repairable" | "reprice_required";
}

function isRepriceAmbiguity(finding: SdlcAmbiguityFinding): boolean {
  if (finding.resolution !== undefined) {
    return finding.resolution === "reprice_required";
  }
  return (
    finding.ambiguityKind === "target_asset_identity" ||
    finding.ambiguityKind === "authority_layer"
  );
}

function isBlockedAmbiguity(finding: SdlcAmbiguityFinding): boolean {
  return finding.resolution === "blocked";
}

function lawfulReentryPointFor(finding: SdlcAmbiguityFinding) {
  if (isBlockedAmbiguity(finding)) {
    return "operator_blocked" as const;
  }
  if (isRepriceAmbiguity(finding)) {
    return "requirement_reprice" as const;
  }
  return "same_edge_retry" as const;
}

export function deriveAmbiguityAssuranceLedger(input: {
  readonly findings: readonly SdlcAmbiguityFinding[];
  readonly predecessorRefs?: readonly string[];
}): SdlcAssuranceLedger {
  if (input.findings.length === 0) {
    return assuranceLedger({
      dimension: "ambiguity",
      verdict: "satisfied",
      predecessorRefs: input.predecessorRefs ?? []
    });
  }
  const repriceFindings = input.findings.filter(isRepriceAmbiguity);
  const blockedFindings = input.findings.filter(isBlockedAmbiguity);
  const openGapFindings = input.findings.filter(
    (finding) => !isBlockedAmbiguity(finding) && !isRepriceAmbiguity(finding)
  );
  const reasons = Object.freeze(
    input.findings.map((finding) =>
      assuranceReason({
        code: finding.code,
        message: finding.message,
        evidenceRefs: finding.evidenceRefs,
        lawfulReentryPoint: lawfulReentryPointFor(finding)
      })
    )
  );

  return assuranceLedger({
    dimension: "ambiguity",
    verdict: verdictFromReasons({
      blockedReasonCodes: blockedFindings.map((finding) => finding.code),
      repriceReasonCodes: repriceFindings.map((finding) => finding.code),
      openGapReasonCodes: openGapFindings.map((finding) => finding.code)
    }),
    reasons,
    evidenceRefs: uniqueSorted(input.findings.flatMap((finding) => finding.evidenceRefs)),
    predecessorRefs: uniqueSorted([
      ...(input.predecessorRefs ?? []),
      ...input.findings.flatMap((finding) => finding.evidenceRefs)
    ]),
    carryForwardObligationRefs: uniqueSorted(
      input.findings.map((finding) => `ambiguity://${finding.code}`)
    )
  });
}
