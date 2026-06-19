// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-030
// Implements: REQ-F-ODDSDLC-051

import type { SdlcRequirementClosureRegister } from "../projection/index.js";
import type { SdlcRequirementClosureEntry } from "../projection/requirement_closure.js";
import type { SdlcAssuranceLedger } from "./carriers.js";
import {
  assuranceLedger,
  assuranceReason,
  uniqueSorted,
  verdictFromReasons
} from "./shared.js";

function isRequirementClosureEntry(
  entry: SdlcRequirementClosureEntry | undefined
): entry is SdlcRequirementClosureEntry {
  return entry !== undefined;
}

export function deriveRequirementFulfillmentAssuranceLedger(input: {
  readonly closureRegister: SdlcRequirementClosureRegister | null;
  readonly requiredRequirementIds?: readonly string[];
  readonly admittedRequirementIds?: readonly string[];
  readonly ambiguousRequirementIds?: readonly string[];
  readonly contradictoryRequirementIds?: readonly string[];
}): SdlcAssuranceLedger {
  if (input.closureRegister === null) {
    return assuranceLedger({
      dimension: "requirement_fulfillment",
      verdict: "blocked",
      reasons: [
        assuranceReason({
          code: "requirement_trace_basis_missing",
          message: "Requirement fulfillment requires an admitted closure register.",
          lawfulReentryPoint: "operator_blocked"
        })
      ]
    });
  }
  const requiredRequirementIds =
    input.requiredRequirementIds ??
    input.closureRegister.entries.map((entry) => entry.requirementId);
  if (requiredRequirementIds.length === 0) {
    return assuranceLedger({
      dimension: "requirement_fulfillment",
      verdict: "not_applicable",
      required: false
    });
  }
  const entryByRequirementId = new Map(
    input.closureRegister.entries.map((entry) => [entry.requirementId, entry])
  );
  const admittedRequirementIds =
    input.admittedRequirementIds === undefined
      ? null
      : new Set(input.admittedRequirementIds);
  const missingEntries = requiredRequirementIds.filter(
    (requirementId) => !entryByRequirementId.has(requirementId)
  );
  const outsideAuthorityEntries =
    admittedRequirementIds === null
      ? []
      : input.closureRegister.entries.filter(
          (entry) =>
            !admittedRequirementIds.has(entry.requirementId) &&
            (entry.evidenceRefs.length > 0 ||
              entry.assetIds.length > 0 ||
              entry.proofKinds.length > 0)
        );
  const openEntries = requiredRequirementIds
    .map((requirementId) => entryByRequirementId.get(requirementId))
    .filter(isRequirementClosureEntry)
    .filter((entry) => entry.fulfillmentStatus !== "fulfilled");
  const repriceRequirementIds = uniqueSorted([
    ...(input.ambiguousRequirementIds ?? []).map(
      (requirementId) => `ambiguous_requirement_authority:${requirementId}`
    ),
    ...(input.contradictoryRequirementIds ?? []).map(
      (requirementId) => `contradictory_requirement_authority:${requirementId}`
    )
  ]);
  const blockedReasonCodes = [
    ...missingEntries.map(
      (requirementId) => `requirement_entry_missing:${requirementId}`
    ),
    ...outsideAuthorityEntries.map(
      (entry) => `requirement_outside_edge_authority:${entry.requirementId}`
    )
  ];
  const openGapReasonCodes = openEntries.flatMap((entry) =>
    entry.openReasons.map((openReason) => `${entry.requirementId}:${openReason}`)
  );
  const reasons = Object.freeze([
    ...missingEntries.map((requirementId) =>
      assuranceReason({
        code: `requirement_entry_missing:${requirementId}`,
        message: `Requirement ${requirementId} is missing from the closure register.`,
        lawfulReentryPoint: "operator_blocked"
      })
    ),
    ...outsideAuthorityEntries.map((entry) =>
      assuranceReason({
        code: `requirement_outside_edge_authority:${entry.requirementId}`,
        message: `Requirement ${entry.requirementId} is outside the admitted edge authority.`,
        evidenceRefs: entry.evidenceRefs,
        lawfulReentryPoint: "operator_blocked"
      })
    ),
    ...(input.ambiguousRequirementIds ?? []).map((requirementId) =>
      assuranceReason({
        code: `ambiguous_requirement_authority:${requirementId}`,
        message: `Requirement ${requirementId} has ambiguous authority.`,
        evidenceRefs: entryByRequirementId.get(requirementId)?.evidenceRefs ?? [],
        lawfulReentryPoint: "requirement_reprice"
      })
    ),
    ...(input.contradictoryRequirementIds ?? []).map((requirementId) =>
      assuranceReason({
        code: `contradictory_requirement_authority:${requirementId}`,
        message: `Requirement ${requirementId} has contradictory authority.`,
        evidenceRefs: entryByRequirementId.get(requirementId)?.evidenceRefs ?? [],
        lawfulReentryPoint: "requirement_reprice"
      })
    ),
    ...openEntries.flatMap((entry) =>
      entry.openReasons.map((openReason) =>
        assuranceReason({
          code: `${entry.requirementId}:${openReason}`,
          message: `Requirement ${entry.requirementId} remains open: ${openReason}.`,
          evidenceRefs: entry.evidenceRefs,
          lawfulReentryPoint: "same_edge_retry"
        })
      )
    )
  ]);

  return assuranceLedger({
    dimension: "requirement_fulfillment",
    verdict: verdictFromReasons({
      blockedReasonCodes,
      repriceReasonCodes: repriceRequirementIds,
      openGapReasonCodes
    }),
    reasons,
    evidenceRefs: uniqueSorted(
      input.closureRegister.entries.flatMap((entry) => entry.evidenceRefs)
    ),
    carryForwardObligationRefs: uniqueSorted(
      [
        ...openEntries.map((entry) => `requirement://${entry.requirementId}`),
        ...(input.ambiguousRequirementIds ?? []).map(
          (requirementId) => `requirement://${requirementId}`
        ),
        ...(input.contradictoryRequirementIds ?? []).map(
          (requirementId) => `requirement://${requirementId}`
        )
      ]
    )
  });
}
