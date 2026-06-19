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

export interface SdlcRequiredCapability {
  readonly kind: "sdlc_required_capability";
  readonly capabilityId: string;
  readonly evidenceContract: string;
  readonly requirementRefs: readonly string[];
}

export interface SdlcObservedCapability {
  readonly kind: "sdlc_observed_capability";
  readonly capabilityId: string;
  readonly evidenceRefs: readonly string[];
  readonly substantive: boolean;
  readonly evidenceQuality?:
    | "substantive"
    | "shallow"
    | "placeholder"
    | "identity_only"
    | "trace_only";
}

export function deriveCapabilityAssuranceLedger(input: {
  readonly requiredCapabilities: readonly SdlcRequiredCapability[];
  readonly observedCapabilities: readonly SdlcObservedCapability[];
  readonly inventoryRequired?: boolean;
  readonly contradictoryCapabilityIds?: readonly string[];
}): SdlcAssuranceLedger {
  if (input.requiredCapabilities.length === 0) {
    return assuranceLedger({
      dimension: "capability",
      verdict: input.inventoryRequired === true ? "blocked" : "not_applicable",
      required: input.inventoryRequired === true,
      reasons:
        input.inventoryRequired === true
          ? [
              assuranceReason({
                code: "capability_inventory_missing",
                message: "Capability assurance requires a derived capability inventory.",
                lawfulReentryPoint: "operator_blocked"
              })
            ]
          : []
    });
  }
  const observedByCapabilityId = new Map(
    input.observedCapabilities.map((capability) => [
      capability.capabilityId,
      capability
    ])
  );
  const missingCapabilities = input.requiredCapabilities.filter(
    (capability) => !observedByCapabilityId.has(capability.capabilityId)
  );
  const shallowCapabilities = input.requiredCapabilities.filter((capability) => {
    const observed = observedByCapabilityId.get(capability.capabilityId);
    return (
      observed !== undefined &&
      !observed.substantive &&
      (observed.evidenceQuality === undefined ||
        observed.evidenceQuality === "shallow")
    );
  });
  const placeholderCapabilities = input.requiredCapabilities.filter(
    (capability) =>
      observedByCapabilityId.get(capability.capabilityId)?.evidenceQuality ===
      "placeholder"
  );
  const identityOnlyCapabilities = input.requiredCapabilities.filter(
    (capability) =>
      observedByCapabilityId.get(capability.capabilityId)?.evidenceQuality ===
      "identity_only"
  );
  const traceOnlyCapabilities = input.requiredCapabilities.filter(
    (capability) =>
      observedByCapabilityId.get(capability.capabilityId)?.evidenceQuality ===
      "trace_only"
  );
  const observedWithoutEvidence = input.requiredCapabilities.filter((capability) => {
    const observed = observedByCapabilityId.get(capability.capabilityId);
    return observed !== undefined && observed.evidenceRefs.length === 0;
  });
  const observedWithoutEvidenceWithBasis = observedWithoutEvidence.filter(
    (capability) => capability.requirementRefs.length > 0
  );
  const observedWithoutEvidenceWithoutBasis = observedWithoutEvidence.filter(
    (capability) => capability.requirementRefs.length === 0
  );
  const contradictoryCapabilityIds = input.contradictoryCapabilityIds ?? [];
  const reasons = Object.freeze([
    ...missingCapabilities.map((capability) =>
      assuranceReason({
        code: `capability_missing:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} was not observed.`,
        evidenceRefs: capability.requirementRefs,
        lawfulReentryPoint: "same_edge_retry"
      })
    ),
    ...shallowCapabilities.map((capability) =>
      assuranceReason({
        code: `capability_shallow:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} has shallow evidence.`,
        evidenceRefs:
          observedByCapabilityId.get(capability.capabilityId)?.evidenceRefs ?? [],
        lawfulReentryPoint: "same_edge_retry"
      })
    ),
    ...placeholderCapabilities.map((capability) =>
      assuranceReason({
        code: `capability_placeholder:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} has placeholder evidence.`,
        evidenceRefs:
          observedByCapabilityId.get(capability.capabilityId)?.evidenceRefs ?? [],
        lawfulReentryPoint: "same_edge_retry"
      })
    ),
    ...identityOnlyCapabilities.map((capability) =>
      assuranceReason({
        code: `capability_identity_only:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} has identity-only evidence.`,
        evidenceRefs:
          observedByCapabilityId.get(capability.capabilityId)?.evidenceRefs ?? [],
        lawfulReentryPoint: "same_edge_retry"
      })
    ),
    ...traceOnlyCapabilities.map((capability) =>
      assuranceReason({
        code: `capability_trace_only:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} has trace-only evidence.`,
        evidenceRefs:
          observedByCapabilityId.get(capability.capabilityId)?.evidenceRefs ?? [],
        lawfulReentryPoint: "same_edge_retry"
      })
    ),
    ...observedWithoutEvidenceWithBasis.map((capability) =>
      assuranceReason({
        code: `capability_evidence_missing:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} has no evidence refs.`,
        evidenceRefs: capability.requirementRefs,
        lawfulReentryPoint: "repair_worker_output"
      })
    ),
    ...observedWithoutEvidenceWithoutBasis.map((capability) =>
      assuranceReason({
        code: `capability_evidence_missing_no_basis:${capability.capabilityId}`,
        message: `Required capability ${capability.capabilityId} has no evidence refs or requirement basis.`,
        lawfulReentryPoint: "operator_blocked"
      })
    ),
    ...contradictoryCapabilityIds.map((capabilityId) =>
      assuranceReason({
        code: `capability_authority_contradictory:${capabilityId}`,
        message: `Required capability ${capabilityId} has contradictory authority.`,
        lawfulReentryPoint: "requirement_reprice"
      })
    )
  ]);
  const blockedCodes = observedWithoutEvidenceWithoutBasis.map(
    (capability) => `capability_evidence_missing_no_basis:${capability.capabilityId}`
  );
  const repriceCodes = contradictoryCapabilityIds.map(
    (capabilityId) => `capability_authority_contradictory:${capabilityId}`
  );
  const openGapCodes = [
    ...missingCapabilities.map(
      (capability) => `capability_missing:${capability.capabilityId}`
    ),
    ...shallowCapabilities.map(
      (capability) => `capability_shallow:${capability.capabilityId}`
    ),
    ...placeholderCapabilities.map(
      (capability) => `capability_placeholder:${capability.capabilityId}`
    ),
    ...identityOnlyCapabilities.map(
      (capability) => `capability_identity_only:${capability.capabilityId}`
    ),
    ...traceOnlyCapabilities.map(
      (capability) => `capability_trace_only:${capability.capabilityId}`
    ),
    ...observedWithoutEvidenceWithBasis.map(
      (capability) => `capability_evidence_missing:${capability.capabilityId}`
    )
  ];

  return assuranceLedger({
    dimension: "capability",
    verdict: verdictFromReasons({
      blockedReasonCodes: blockedCodes,
      repriceReasonCodes: repriceCodes,
      openGapReasonCodes: openGapCodes
    }),
    reasons,
    evidenceRefs: uniqueSorted(
      input.observedCapabilities.flatMap((capability) => capability.evidenceRefs)
    ),
    carryForwardObligationRefs: uniqueSorted(
      reasons.map((reason) => `capability://${reason.code}`)
    )
  });
}
