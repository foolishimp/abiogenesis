// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import type {
  SdlcPostflightGapDossier,
  SdlcWorkerHandoffManifest
} from "../operator/index.js";
import type { SdlcAssuranceLedger } from "./carriers.js";
import {
  assuranceLedger,
  assuranceReason,
  uniqueSorted,
  verdictFromReasons
} from "./shared.js";
import { canonicalSdlcPriorGapReasonCode } from "../shared/blocking_reason.js";

function dossierReasonCodes(
  dossiers: readonly SdlcPostflightGapDossier[]
): readonly string[] {
  return uniqueSorted(
    dossiers.flatMap((dossier) =>
      dossier.reasons.map((reason) =>
        canonicalSdlcPriorGapReasonCode(reason.reason)
      )
    )
  );
}

export function deriveObligationCarryAssuranceLedger(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly currentGapDossier: SdlcPostflightGapDossier | null;
  readonly currentReasonCodes?: readonly string[];
  readonly closedReasonCodes?: readonly string[];
  readonly expectedPriorGapDossiers?: readonly SdlcPostflightGapDossier[];
  readonly contradictoryReasonCodes?: readonly string[];
  readonly staleReasonCodes?: readonly string[];
  readonly unactionableReasonCodes?: readonly string[];
}): SdlcAssuranceLedger {
  const priorReasonCodes = dossierReasonCodes(
    input.manifest.retryContext.priorGapDossiers
  );
  const expectedPriorReasonCodes = dossierReasonCodes(
    input.expectedPriorGapDossiers ?? []
  );
  const missingFromHandoffReasonCodes = expectedPriorReasonCodes.filter(
    (code) => !priorReasonCodes.includes(code)
  );
  const contradictoryReasonCodes = input.contradictoryReasonCodes ?? [];
  const repriceReasonCodes = [
    ...(input.staleReasonCodes ?? []).map((code) => `stale_obligation:${code}`),
    ...(input.unactionableReasonCodes ?? []).map(
      (code) => `unactionable_obligation:${code}`
    )
  ];
  if (
    priorReasonCodes.length === 0 &&
    missingFromHandoffReasonCodes.length === 0 &&
    contradictoryReasonCodes.length === 0 &&
    repriceReasonCodes.length === 0
  ) {
    return assuranceLedger({
      dimension: "obligation_carry",
      verdict: "not_applicable",
      required: false
    });
  }
  const closedReasonCodes = new Set(input.closedReasonCodes ?? []);
  const currentReasonCodes = new Set(
    uniqueSorted([
      ...(input.currentGapDossier?.reasons.map((reason) =>
        canonicalSdlcPriorGapReasonCode(reason.reason)
      ) ?? []),
      ...(input.currentReasonCodes ?? []).map(canonicalSdlcPriorGapReasonCode)
    ])
  );
  const droppedReasonCodes = priorReasonCodes.filter(
    (code) => !closedReasonCodes.has(code) && !currentReasonCodes.has(code)
  );
  const carriedReasonCodes = priorReasonCodes.filter((code) =>
    currentReasonCodes.has(code)
  );
  const blockedReasonCodes = [
    ...missingFromHandoffReasonCodes.map(
      (code) => `missing_prior_obligation_in_handoff:${code}`
    ),
    ...contradictoryReasonCodes.map((code) => `contradictory_obligation:${code}`)
  ];
  const openGapReasonCodes = droppedReasonCodes.map(
    (code) => `dropped_prior_obligation:${code}`
  );
  const reasons = Object.freeze([
    ...missingFromHandoffReasonCodes.map((code) =>
      assuranceReason({
        code: `missing_prior_obligation_in_handoff:${code}`,
        message: `Prior retry obligation ${code} was not present in the handoff.`,
        evidenceRefs: (input.expectedPriorGapDossiers ?? []).map(
          (dossier) => dossier.currentGapDossierRef
        ),
        lawfulReentryPoint: "operator_blocked"
      })
    ),
    ...contradictoryReasonCodes.map((code) =>
      assuranceReason({
        code: `contradictory_obligation:${code}`,
        message: `Prior retry obligation ${code} has contradictory closure state.`,
        evidenceRefs: input.manifest.retryContext.priorGapDossiers.map(
          (dossier) => dossier.currentGapDossierRef
        ),
        lawfulReentryPoint: "operator_blocked"
      })
    ),
    ...repriceReasonCodes.map((code) =>
      assuranceReason({
        code,
        message: `Prior retry obligation ${code} requires repricing.`,
        evidenceRefs: input.manifest.retryContext.priorGapDossiers.map(
          (dossier) => dossier.currentGapDossierRef
        ),
        lawfulReentryPoint: "requirement_reprice"
      })
    ),
    ...droppedReasonCodes.map((code) =>
      assuranceReason({
        code: `dropped_prior_obligation:${code}`,
        message: `Prior retry obligation ${code} was not closed or carried forward.`,
        evidenceRefs: input.manifest.retryContext.priorGapDossiers.map(
          (dossier) => dossier.currentGapDossierRef
        ),
        lawfulReentryPoint: "same_edge_retry"
      })
    )
  ]);

  return assuranceLedger({
    dimension: "obligation_carry",
    verdict: verdictFromReasons({
      blockedReasonCodes,
      repriceReasonCodes,
      openGapReasonCodes
    }),
    reasons,
    evidenceRefs: uniqueSorted([
      ...input.manifest.retryContext.priorGapDossiers.map(
        (dossier) => dossier.currentGapDossierRef
      ),
      ...(input.expectedPriorGapDossiers ?? []).map(
        (dossier) => dossier.currentGapDossierRef
      ),
      ...(input.currentGapDossier === null
        ? []
        : [input.currentGapDossier.currentGapDossierRef])
    ]),
    carryForwardObligationRefs: uniqueSorted(
      carriedReasonCodes.map((code) => `gap://obligation/${code}`)
    )
  });
}
