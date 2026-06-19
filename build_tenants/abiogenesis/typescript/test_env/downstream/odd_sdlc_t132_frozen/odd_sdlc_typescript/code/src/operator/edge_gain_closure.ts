// Implements: REQ-F-ODDSDLC-063
// Implements: REQ-F-ODDSDLC-064
// Implements: REQ-F-ODDSDLC-065
// Implements: REQ-F-ODDSDLC-066
// Implements: REQ-F-ODDSDLC-068
// Owns: evaluate_action per ODD_METHOD 11.5D
// Investigates: T-164

import { createHash } from "node:crypto";
import {
  indexSdlcEdgeGainClosureContracts,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  type SdlcEdgeGainClosureContract,
  type SdlcTargetCarrierCandidateAdmission
} from "../graph/index.js";
import { uniquePresentSorted as uniqueSorted } from "../shared/collections.js";

export type SdlcTargetCarrierClosureStatus =
  | SdlcTargetCarrierCandidateAdmission["status"]
  | "not_required";

export type SdlcEdgeEvidenceSourceKind =
  | "worker_assessment"
  | "review_grade_assessment"
  | "runtime_event"
  | "product_artifact"
  | "execution_result"
  | "ledger_row"
  | "replay_evidence"
  | "artifact_presence"
  | "worker_percent_complete";

export interface SdlcEdgeDerivedObligation {
  readonly kind: "sdlc_edge_derived_obligation";
  readonly obligationRef: string;
  readonly sourceRef: string;
  readonly required: boolean;
  readonly thresholdRef: string;
}

export interface SdlcEdgeEvidenceCandidate {
  readonly kind: "sdlc_edge_evidence_candidate";
  readonly evidenceRef: string;
  readonly sourceKind: SdlcEdgeEvidenceSourceKind;
  readonly obligationRefs: readonly string[];
  readonly evidencePolicyRef?: string | null;
  readonly supportsBehavioralFulfillment?: boolean;
}

export interface SdlcAdmittedEdgeEvidence {
  readonly kind: "sdlc_admitted_edge_evidence";
  readonly evidenceRef: string;
  readonly sourceKind: SdlcEdgeEvidenceSourceKind;
  readonly obligationRefs: readonly string[];
  readonly evidencePolicyRef: string;
}

export interface SdlcRejectedEdgeEvidence {
  readonly kind: "sdlc_rejected_edge_evidence";
  readonly evidenceRef: string;
  readonly sourceKind: SdlcEdgeEvidenceSourceKind;
  readonly reasonRef: string;
  readonly detail: string;
}

export interface SdlcEdgeEvidenceAdmission {
  readonly kind: "sdlc_edge_evidence_admission";
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus;
  readonly targetCarrierAdmissionRef: string | null;
  readonly admittedEvidence: readonly SdlcAdmittedEdgeEvidence[];
  readonly rejectedEvidence: readonly SdlcRejectedEdgeEvidence[];
}

export interface SdlcEdgeLedgerInputRef {
  readonly kind: "sdlc_edge_ledger_input_ref";
  readonly ledgerInputKind: string;
  readonly ledgerRef: string;
}

export interface SdlcEdgeObligationGain {
  readonly kind: "sdlc_edge_obligation_gain";
  readonly obligationRef: string;
  readonly thresholdRef: string;
  readonly required: boolean;
  readonly score: 0 | 1;
  readonly thresholdMet: boolean;
  readonly evidenceRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
}

export interface SdlcEdgeGain {
  readonly kind: "sdlc_edge_gain";
  readonly gainRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly edgeRef: string;
  readonly category: SdlcEdgeGainClosureContract["category"];
  readonly metricFunctionRef: string;
  readonly thresholdPolicyRef: string;
  readonly closureFunctionRef: string;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus;
  readonly targetCarrierAdmissionRef: string | null;
  readonly obligationGains: readonly SdlcEdgeObligationGain[];
  readonly expectedCount: number;
  readonly fulfilledCount: number;
  readonly missingCount: number;
  readonly requiredLedgerInputKinds: readonly string[];
  readonly admittedLedgerRefs: readonly string[];
  readonly missingLedgerInputKinds: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly obligationsAndLedgersComplete: boolean;
}

export interface SdlcEdgeResidualPressure {
  readonly kind: "sdlc_edge_residual_pressure";
  readonly pressureRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly edgeRef: string;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus;
  readonly requiredPressureRefs: readonly string[];
  readonly informationalPressureRefs: readonly string[];
  readonly clear: boolean;
}

export interface SdlcEdgeAssuranceCloseDecision {
  readonly kind: "sdlc_edge_assurance_close_decision";
  readonly decisionRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly edgeRef: string;
  readonly disposition: "close" | "retry" | "block";
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus;
  readonly gainRef: string;
  readonly residualPressureRef: string;
  readonly basisRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface SdlcCompoundTraversalGain {
  readonly kind: "sdlc_compound_traversal_gain";
  readonly pathRef: string;
  readonly edgeGainRefs: readonly string[];
  readonly closedEdgeRefs: readonly string[];
  readonly openEdgeRefs: readonly string[];
  readonly bottleneckEdgeRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly closeReady: boolean;
}

function stableJson(input: unknown): string {
  if (input === undefined) {
    return "undefined";
  }
  if (input === null || typeof input !== "object") {
    return JSON.stringify(input);
  }
  if (Array.isArray(input)) {
    return `[${input.map((entry) => stableJson(entry)).join(",")}]`;
  }
  return `{${Object.entries(input)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`)
    .join(",")}}`;
}

function digestForValue(input: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(input)).digest("hex")}`;
}

function decodedRefForPressureClassification(input: string): string {
  let decoded = input;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        return decoded;
      }
      decoded = next;
    } catch {
      return decoded;
    }
  }
  return decoded;
}

function refRequiresRepairReentry(ref: string): boolean {
  const decoded = decodedRefForPressureClassification(ref);
  return (
    decoded.includes("component_repair_schedule_repair_required") ||
    decoded.includes("component_repair_schedule_row:") ||
    decoded.includes("test_execution_result_failed")
  );
}

function edgeScopedRef(input: {
  readonly prefix: string;
  readonly edgeRef: string;
  readonly suffix: string;
}): string {
  return [
    input.prefix,
    encodeURIComponent(input.edgeRef),
    encodeURIComponent(input.suffix)
  ].join("/");
}

export function sdlcEdgeAssuranceContractRef(
  contract: SdlcEdgeGainClosureContract
): string {
  return edgeScopedRef({
    prefix: "edge-assurance-contract://odd-sdlc",
    edgeRef: contract.edgeRef,
    suffix: contract.targetAssetType
  });
}

export function digestSdlcEdgeGainClosureContract(
  contract: SdlcEdgeGainClosureContract
): string {
  return digestForValue(contract);
}

export function resolveSdlcEdgeGainClosureContract(
  edgeRef: string
): SdlcEdgeGainClosureContract {
  const contract = indexSdlcEdgeGainClosureContracts({
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  }).get(edgeRef);
  if (contract === undefined) {
    throw new TypeError(`${edgeRef}: missing SDLC edge gain/closure contract`);
  }
  return contract;
}

export function deriveSdlcEdgeObligations(input: {
  readonly contract: SdlcEdgeGainClosureContract;
  readonly obligationRefs: readonly string[];
}): readonly SdlcEdgeDerivedObligation[] {
  const refs = uniqueSorted(input.obligationRefs);
  if (refs.length === 0) {
    throw new TypeError(
      `${input.contract.edgeRef}: edge obligation derivation requires explicit obligation refs`
    );
  }
  return Object.freeze(
    refs.map((ref) =>
      Object.freeze({
        kind: "sdlc_edge_derived_obligation" as const,
        obligationRef: ref,
        sourceRef: input.contract.obligationDerivationRef,
        required: true,
        thresholdRef: input.contract.thresholdPolicyRef
      })
    )
  );
}

export function admitSdlcEdgeEvidence(input: {
  readonly contract: SdlcEdgeGainClosureContract;
  readonly obligations: readonly SdlcEdgeDerivedObligation[];
  readonly candidates: readonly SdlcEdgeEvidenceCandidate[];
  readonly targetCarrierAdmission?: SdlcTargetCarrierCandidateAdmission | null;
}): SdlcEdgeEvidenceAdmission {
  const obligationRefs = new Set(input.obligations.map((obligation) => obligation.obligationRef));
  const admitted: SdlcAdmittedEdgeEvidence[] = [];
  const rejected: SdlcRejectedEdgeEvidence[] = [];
  for (const candidate of input.candidates) {
    const evidenceRef = candidate.evidenceRef.trim();
    const candidateObligationRefs = uniqueSorted(candidate.obligationRefs);
    const unknownObligationRefs = candidateObligationRefs.filter(
      (ref) => !obligationRefs.has(ref)
    );
    const evidencePolicyRef = candidate.evidencePolicyRef ?? input.contract.evidencePolicyRef;
    const rejection = (() => {
      if (evidenceRef.length === 0) {
        return "blank_evidence_ref";
      }
      if (candidateObligationRefs.length === 0) {
        return "no_obligation_binding";
      }
      if (unknownObligationRefs.length > 0) {
        return `unknown_obligation:${unknownObligationRefs.join(",")}`;
      }
      if (evidencePolicyRef !== input.contract.evidencePolicyRef) {
        return "evidence_policy_mismatch";
      }
      if (candidate.sourceKind === "worker_percent_complete") {
        return "worker_percent_complete_is_not_metric_authority";
      }
      if (
        candidate.sourceKind === "artifact_presence" &&
        candidate.supportsBehavioralFulfillment !== true
      ) {
        return "artifact_presence_without_behavioral_fulfillment";
      }
      return null;
    })();
    if (rejection !== null) {
      rejected.push(
        Object.freeze({
          kind: "sdlc_rejected_edge_evidence" as const,
          evidenceRef: evidenceRef.length === 0 ? "<blank>" : evidenceRef,
          sourceKind: candidate.sourceKind,
          reasonRef: `evidence-rejection://odd-sdlc/${input.contract.edgeRef}/${rejection}`,
          detail: rejection
        })
      );
      continue;
    }
    admitted.push(
      Object.freeze({
        kind: "sdlc_admitted_edge_evidence" as const,
        evidenceRef,
        sourceKind: candidate.sourceKind,
        obligationRefs: candidateObligationRefs,
        evidencePolicyRef: input.contract.evidencePolicyRef
      })
    );
  }
  return Object.freeze({
    kind: "sdlc_edge_evidence_admission" as const,
    contractRef: sdlcEdgeAssuranceContractRef(input.contract),
    contractDigest: digestSdlcEdgeGainClosureContract(input.contract),
    targetCarrierContractRef: input.targetCarrierAdmission?.contractRef ?? null,
    targetCarrierContractDigest:
      input.targetCarrierAdmission?.contractDigest ?? null,
    targetCarrierAdmissionStatus:
      input.targetCarrierAdmission?.status ?? "not_required",
    targetCarrierAdmissionRef:
      input.targetCarrierAdmission?.status === "admitted"
        ? input.targetCarrierAdmission.validationRef
        : null,
    admittedEvidence: Object.freeze(admitted),
    rejectedEvidence: Object.freeze(rejected)
  });
}

export function measureSdlcEdgeGain(input: {
  readonly contract: SdlcEdgeGainClosureContract;
  readonly obligations: readonly SdlcEdgeDerivedObligation[];
  readonly admittedEvidence: readonly SdlcAdmittedEdgeEvidence[];
  readonly ledgerInputs: readonly SdlcEdgeLedgerInputRef[];
  readonly targetCarrierAdmission?: SdlcTargetCarrierCandidateAdmission | null;
  readonly targetCarrierRequired?: boolean;
  readonly requiredEvidenceSourceKinds?: readonly SdlcEdgeEvidenceSourceKind[];
}): SdlcEdgeGain {
  const contractRef = sdlcEdgeAssuranceContractRef(input.contract);
  const contractDigest = digestSdlcEdgeGainClosureContract(input.contract);
  const ledgerInputByKind = new Map(
    input.ledgerInputs.map((ledger) => [ledger.ledgerInputKind, ledger.ledgerRef])
  );
  const missingLedgerInputKinds = input.contract.ledgerInputKinds.filter(
    (kind) => !ledgerInputByKind.has(kind)
  );
  const obligationGains = input.obligations.map((obligation) => {
    const evidenceRefs = uniqueSorted(
      input.admittedEvidence.flatMap((evidence) =>
        evidence.obligationRefs.includes(obligation.obligationRef)
          ? [evidence.evidenceRef]
          : []
      )
    );
    const thresholdMet = evidenceRefs.length > 0;
    const residualPressureRefs = thresholdMet
      ? Object.freeze([])
      : Object.freeze([
          edgeScopedRef({
            prefix: "pressure://odd-sdlc/edge-obligation",
            edgeRef: input.contract.edgeRef,
            suffix: obligation.obligationRef
          })
        ]);
    return Object.freeze({
      kind: "sdlc_edge_obligation_gain" as const,
      obligationRef: obligation.obligationRef,
      thresholdRef: obligation.thresholdRef,
      required: obligation.required,
      score: thresholdMet ? 1 : 0,
      thresholdMet,
      evidenceRefs,
      residualPressureRefs
    });
  });
  const missingObligationPressureRefs = obligationGains.flatMap(
    (gain) => gain.residualPressureRefs
  );
  const missingLedgerPressureRefs = missingLedgerInputKinds.map((kind) =>
    edgeScopedRef({
      prefix: "pressure://odd-sdlc/missing-ledger-input",
      edgeRef: input.contract.edgeRef,
      suffix: kind
    })
  );
  const targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus =
    input.targetCarrierAdmission?.status ??
    (input.targetCarrierRequired === true ? "missing" : "not_required");
  const targetCarrierPressureRefs =
    input.targetCarrierAdmission?.status === "rejected"
      ? Object.freeze([
          edgeScopedRef({
            prefix: "pressure://odd-sdlc/target-carrier",
            edgeRef: input.contract.edgeRef,
            suffix: input.targetCarrierAdmission.rejectionClass
          })
        ])
      : targetCarrierAdmissionStatus === "missing"
        ? Object.freeze([
            edgeScopedRef({
              prefix: "pressure://odd-sdlc/target-carrier",
              edgeRef: input.contract.edgeRef,
              suffix: "missing_admission"
            })
          ])
        : Object.freeze([] as const);
  const requiredEvidenceSourceKinds: readonly SdlcEdgeEvidenceSourceKind[] =
    Object.freeze([...(new Set(input.requiredEvidenceSourceKinds ?? []))]);
  const admittedEvidenceSourceKinds = new Set(
    input.admittedEvidence.map((evidence) => evidence.sourceKind)
  );
  const missingRequiredEvidenceSourceKindPressureRefs =
    requiredEvidenceSourceKinds
      .filter((sourceKind) => !admittedEvidenceSourceKinds.has(sourceKind))
      .map((sourceKind) =>
        edgeScopedRef({
          prefix: "pressure://odd-sdlc/missing-evidence-source",
          edgeRef: input.contract.edgeRef,
          suffix: sourceKind
        })
      );
  const residualPressureRefs = uniqueSorted([
    ...missingObligationPressureRefs,
    ...missingLedgerPressureRefs,
    ...targetCarrierPressureRefs,
    ...missingRequiredEvidenceSourceKindPressureRefs,
    ...(missingObligationPressureRefs.length === 0 &&
    missingLedgerPressureRefs.length === 0 &&
    targetCarrierPressureRefs.length === 0 &&
    missingRequiredEvidenceSourceKindPressureRefs.length === 0
      ? []
      : input.contract.residualPressureRefs)
  ]);
  const fulfilledCount = obligationGains.filter((gain) => gain.thresholdMet).length;
  const expectedCount = obligationGains.filter((gain) => gain.required).length;
  const missingCount = obligationGains.filter(
    (gain) => gain.required && !gain.thresholdMet
  ).length;
  return Object.freeze({
    kind: "sdlc_edge_gain" as const,
    gainRef: edgeScopedRef({
      prefix: "edge-gain://odd-sdlc",
      edgeRef: input.contract.edgeRef,
      suffix: contractDigest
    }),
    contractRef,
    contractDigest,
    edgeRef: input.contract.edgeRef,
    category: input.contract.category,
    metricFunctionRef: input.contract.metricFunctionRef,
    thresholdPolicyRef: input.contract.thresholdPolicyRef,
    closureFunctionRef: input.contract.closureFunctionRef,
    targetCarrierContractRef: input.targetCarrierAdmission?.contractRef ?? null,
    targetCarrierContractDigest:
      input.targetCarrierAdmission?.contractDigest ?? null,
    targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef:
      input.targetCarrierAdmission?.status === "admitted"
        ? input.targetCarrierAdmission.validationRef
        : null,
    obligationGains: Object.freeze(obligationGains),
    expectedCount,
    fulfilledCount,
    missingCount,
    requiredLedgerInputKinds: input.contract.ledgerInputKinds,
    admittedLedgerRefs: uniqueSorted([...ledgerInputByKind.values()]),
    missingLedgerInputKinds: uniqueSorted(missingLedgerInputKinds),
    evidenceRefs: uniqueSorted(
      input.admittedEvidence.map((evidence) => evidence.evidenceRef)
    ),
    residualPressureRefs,
    obligationsAndLedgersComplete:
      missingCount === 0 && missingLedgerInputKinds.length === 0
  });
}

export function deriveSdlcEdgeResidualPressure(
  gain: SdlcEdgeGain
): SdlcEdgeResidualPressure {
  return Object.freeze({
    kind: "sdlc_edge_residual_pressure" as const,
    pressureRef: edgeScopedRef({
      prefix: "edge-residual-pressure://odd-sdlc",
      edgeRef: gain.edgeRef,
      suffix: gain.contractDigest
    }),
    contractRef: gain.contractRef,
    contractDigest: gain.contractDigest,
    edgeRef: gain.edgeRef,
    targetCarrierContractRef: gain.targetCarrierContractRef,
    targetCarrierContractDigest: gain.targetCarrierContractDigest,
    targetCarrierAdmissionStatus: gain.targetCarrierAdmissionStatus,
    requiredPressureRefs: gain.residualPressureRefs,
    informationalPressureRefs: Object.freeze([]),
    clear: gain.residualPressureRefs.length === 0
  });
}

export function withAdditionalSdlcEdgeResidualPressureRefs(input: {
  readonly residualPressure: SdlcEdgeResidualPressure;
  readonly requiredPressureRefs?: readonly string[];
  readonly informationalPressureRefs?: readonly string[];
}): SdlcEdgeResidualPressure {
  const requiredPressureRefs = uniqueSorted([
    ...input.residualPressure.requiredPressureRefs,
    ...(input.requiredPressureRefs ?? [])
  ]);
  return Object.freeze({
    ...input.residualPressure,
    requiredPressureRefs,
    informationalPressureRefs: uniqueSorted([
      ...input.residualPressure.informationalPressureRefs,
      ...(input.informationalPressureRefs ?? [])
    ]),
    clear: requiredPressureRefs.length === 0
  });
}

export function deriveSdlcEdgeAssuranceCloseDecision(input: {
  readonly gain: SdlcEdgeGain;
  readonly residualPressure: SdlcEdgeResidualPressure;
}): SdlcEdgeAssuranceCloseDecision {
  const closeReady =
    input.gain.obligationsAndLedgersComplete && input.residualPressure.clear;
  const hasBlockingProtocolPressure =
    input.gain.missingLedgerInputKinds.length > 0 ||
    input.residualPressure.requiredPressureRefs.some(
      (ref) =>
        ref.startsWith("pressure://odd-sdlc/target-carrier/") ||
        ref.includes("triage_gap") ||
        refRequiresRepairReentry(ref)
    );
  const disposition =
    closeReady ? "close" : hasBlockingProtocolPressure ? "block" : "retry";
  return Object.freeze({
    kind: "sdlc_edge_assurance_close_decision" as const,
    decisionRef: edgeScopedRef({
      prefix: "edge-assurance-close://odd-sdlc",
      edgeRef: input.gain.edgeRef,
      suffix: input.gain.contractDigest
    }),
    contractRef: input.gain.contractRef,
    contractDigest: input.gain.contractDigest,
    edgeRef: input.gain.edgeRef,
    disposition,
    targetCarrierContractRef: input.gain.targetCarrierContractRef,
    targetCarrierContractDigest: input.gain.targetCarrierContractDigest,
    targetCarrierAdmissionStatus: input.gain.targetCarrierAdmissionStatus,
    gainRef: input.gain.gainRef,
    residualPressureRef: input.residualPressure.pressureRef,
    basisRefs: uniqueSorted([
      input.gain.contractRef,
      input.gain.contractDigest,
      input.gain.gainRef,
      input.residualPressure.pressureRef,
      input.gain.metricFunctionRef,
      input.gain.closureFunctionRef,
      ...(input.gain.targetCarrierContractRef === null
        ? []
        : [input.gain.targetCarrierContractRef]),
      ...(input.gain.targetCarrierContractDigest === null
        ? []
        : [input.gain.targetCarrierContractDigest])
    ]),
    reasonRefs: input.residualPressure.requiredPressureRefs
  });
}

export function composeSdlcPathGain(input: {
  readonly pathRef: string;
  readonly edgeGains: readonly SdlcEdgeGain[];
}): SdlcCompoundTraversalGain {
  if (input.edgeGains.length === 0) {
    throw new TypeError("compound path gain requires at least one edge gain");
  }
  const openEdgeRefs = input.edgeGains
    .filter((gain) => !edgeGainCloses(gain))
    .map((gain) => gain.edgeRef);
  return Object.freeze({
    kind: "sdlc_compound_traversal_gain" as const,
    pathRef: input.pathRef,
    edgeGainRefs: uniqueSorted(input.edgeGains.map((gain) => gain.gainRef)),
    closedEdgeRefs: uniqueSorted(
      input.edgeGains
        .filter((gain) => edgeGainCloses(gain))
        .map((gain) => gain.edgeRef)
    ),
    openEdgeRefs: uniqueSorted(openEdgeRefs),
    bottleneckEdgeRefs: uniqueSorted(openEdgeRefs),
    residualPressureRefs: uniqueSorted(
      input.edgeGains.flatMap((gain) => gain.residualPressureRefs)
    ),
    closeReady: openEdgeRefs.length === 0
  });
}

function edgeGainCloses(gain: SdlcEdgeGain): boolean {
  return (
    gain.obligationsAndLedgersComplete && gain.residualPressureRefs.length === 0
  );
}
