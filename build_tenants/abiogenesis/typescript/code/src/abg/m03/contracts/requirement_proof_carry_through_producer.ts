// T-188 carry-through PRODUCER: derives the admitted events for one
// accepted attached-result site. Extracted from the engine runner (DMM
// self-review F3) — the runner sequences and emits; derivation lives here.
// LAW (T-188): admission runs ONLY after the attached result payload is
// itself admitted (the runner calls this inside the accepted branch — a
// rejected payload must not mint coverage truth); strength refs resolve
// against the ADMITTED ledger, never list presence or startup booleans;
// coverage refs are producer-computed and carried on the event (no
// close-site reconstruction).
import type { ActorInvocation, RuntimeEvent } from "./carriers.js";
import type {
  RequirementProofCarryThroughAdmittedEvent
} from "./carriers.js";
import {
  admitRequirementProofCarryThroughOutput,
  constructRequirementProofCarryThroughOutputEnvelope,
  projectRequirementProofCoverage,
  requirementAbgTruthRefFromRequirementProofCoverage,
  type RequirementProofCandidateClassificationTable,
  type RequirementProofCarryThroughContract
} from "./requirement_proof_carry_through.js";
import {
  constructDerivedProofDepthInstructionTruth,
  type DerivedDependencyInstructionTruth,
  type DerivedProofDepthInstructionTruth
} from "./instruction_assembly.js";
import { constructRequirementProofCarryThroughAdmittedEvent } from "./event_factories.js";
import { deriveAdmittedStrengthRefSet } from "./payload_ledger.js";

export interface RequirementProofCarryThroughStartupEntry {
  readonly contract: RequirementProofCarryThroughContract;
  readonly classificationTable: RequirementProofCandidateClassificationTable;
  readonly requirementIds: readonly string[];
  readonly envelopeTemplate: Omit<
    Parameters<typeof constructRequirementProofCarryThroughOutputEnvelope>[0],
    "envelopeRef" | "evidenceRefs" | "replayIdentity" | "replayDigest"
  >;
  readonly edge?: string | undefined;
}

export interface RequirementProofCarryThroughStartupInput {
  readonly entries: readonly RequirementProofCarryThroughStartupEntry[];
}

export function deriveRequirementProofCarryThroughAdmittedEvents(input: {
  readonly startup: RequirementProofCarryThroughStartupInput | undefined;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly invocation: ActorInvocation;
  readonly frameLineageId: string | null;
  readonly resultRef: string;
  readonly planDependencyTruth: DerivedDependencyInstructionTruth | null;
  readonly planProofDepthTruth: DerivedProofDepthInstructionTruth | null;
}): readonly RequirementProofCarryThroughAdmittedEvent[] {
  if (input.startup === undefined) {
    return Object.freeze([]);
  }
  // Strength resolution consumes the ONE named replay-derived projection
  // (REQ -035 interim equivalence; full ProofStrengthAdmission carrier is
  // the named successor).
  const admittedLedgerRefs = deriveAdmittedStrengthRefSet(input.replayEvents);
  const events: RequirementProofCarryThroughAdmittedEvent[] = [];
  for (const entry of input.startup.entries) {
    if (entry.edge !== undefined && entry.edge !== input.invocation.edge) {
      continue;
    }
    const envelope = constructRequirementProofCarryThroughOutputEnvelope({
      ...entry.envelopeTemplate,
      envelopeRef: `${input.resultRef}/requirement-proof-carry-through`,
      evidenceRefs: Object.freeze([input.resultRef]),
      replayIdentity: `${input.invocation.actorInvocationId}/carry-through`
    });
    const admission = admitRequirementProofCarryThroughOutput({
      contract: entry.contract,
      classificationTable: entry.classificationTable,
      envelope
    });
    const proofDepthTruth = constructDerivedProofDepthInstructionTruth({
      admittedLedgerRefs,
      truthRef: `${envelope.envelopeRef}/proof-depth`,
      // depth policy is ADMITTED PLAN truth (compiled at startup), not
      // runner-synthesized
      depthPolicyRef: input.planProofDepthTruth?.depthPolicyRef ?? null,
      depthPolicyDigest: input.planProofDepthTruth?.depthPolicyDigest ?? null,
      targetRefs: [envelope.contractRef],
      requiredDepthClassRefs: entry.contract.requiredDepthClassRefs,
      declaredDepthClassRefs: envelope.depthClassRefs,
      declaredDepthObligationRefs: envelope.proofObligationRefs,
      notApplicableDepthClassRefs: [],
      typedDepthGapRefs: [],
      proofStrengthAdmissionRefs: envelope.proofStrengthAdmissionRefs,
      fdStrengthCriterionRefs: envelope.fdStrengthCriterionRefs,
      adversarialVerificationRefs: envelope.adversarialAttemptRefs,
      adversarialCounterexampleRefs: envelope.counterexampleRefs,
      sourceProjectionRefs: [envelope.envelopeRef],
      // Derive-only fields: the constructor ignores caller values and
      // derives internally (ledger-resolved via admittedLedgerRefs above).
      depthComplete: false,
      proofStrengthAdmitted: false
    });
    const coverageRequirementIds: string[] = [];
    const coverageStatuses: string[] = [];
    const coverageIssueKindSet = new Set<string>();
    const coverageTruthRefs: string[] = [];
    for (const requirementId of entry.requirementIds) {
      const coverage = projectRequirementProofCoverage({
        projectionRef: `${envelope.envelopeRef}/coverage/${requirementId}`,
        requirementId,
        requiredRequirementObligationRefs: Object.freeze(
          entry.contract.fulfillmentBindings.map((binding) => binding.obligationRef)
        ),
        admissions: [admission],
        dependencyInstructionTruth: input.planDependencyTruth,
        proofDepthInstructionTruth: proofDepthTruth
      });
      coverageRequirementIds.push(requirementId);
      coverageStatuses.push(coverage.status);
      for (const issueKind of coverage.issueKinds) {
        coverageIssueKindSet.add(issueKind);
      }
      coverageTruthRefs.push(
        requirementAbgTruthRefFromRequirementProofCoverage(coverage)
      );
    }
    events.push(
      constructRequirementProofCarryThroughAdmittedEvent({
        invocation: input.invocation,
        frameLineageId: input.frameLineageId,
        correlationId: input.invocation.actorInvocationId,
        envelopeRef: admission.envelope.envelopeRef,
        contractRef: entry.contract.contractRef,
        categoryKey: admission.categoryKey,
        accepted: admission.accepted,
        sourceRequirementObligationRefs:
          admission.envelope.sourceRequirementObligationRefs,
        proofObligationRefs: admission.envelope.proofObligationRefs,
        evidenceRoleRefs: admission.envelope.evidenceRoleRefs,
        issueKinds: Object.freeze(admission.issues.map((row) => row.issueKind)),
        coverageRequirementIds: Object.freeze([...coverageRequirementIds]),
        coverageStatuses: Object.freeze([...coverageStatuses]),
        coverageIssueKinds: Object.freeze([...coverageIssueKindSet]),
        coverageTruthRefs: Object.freeze([...coverageTruthRefs]),
        replayIdentity: admission.envelope.replayIdentity,
        replayDigest: admission.envelope.replayDigest
      })
    );
  }
  return Object.freeze(events);
}
