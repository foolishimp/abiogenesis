// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type { RuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import type {
  ReplayAdmittedRuntimeResultRelation
} from "../../../abg/m03/contracts/replay_admitted_runtime_result.js";
import type {
  DispatchRequest,
  ResultArtifact,
  RuntimeFailureClass
} from "../../../abg/m03/transport/index.js";
import type { IJsonValue } from "../../../shared/runtime_identity.js";

export interface AssessmentManifestProvenance {
  readonly specHash: string;
  readonly manifestId: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly authorityRef: string | null;
  readonly selectedWorkerId: string | null;
  readonly selectedBackend: string | null;
  readonly roleId: string | null;
  readonly assignmentSource: string | null;
  readonly resolvedRuntimeRef: string | null;
}

export interface PublishedLedgerRef {
  readonly ref: string;
}

export interface FulfillmentAssessmentRef {
  readonly obligationId: string;
}

export interface ResultAssessmentContractIdentity {
  readonly ref: string;
  readonly digest: `sha256:${string}`;
}

export interface PublicResultAssessmentRequest {
  readonly kind: "fp_assessed";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly assessmentContract: ResultAssessmentContractIdentity;
  readonly manifestProvenance: AssessmentManifestProvenance;
  readonly publishedLedgerRef: PublishedLedgerRef;
  readonly fulfillmentRefs: readonly FulfillmentAssessmentRef[];
}

/**
 * Internal semantic carrier. The public assessment payload remains evidence;
 * replay owns the runtime-result subject and public ingress owns attribution.
 */
export interface ReplayBoundPublicResultAssessmentRequest {
  readonly kind: "replay_bound_fp_assessment";
  readonly assessmentValue: IJsonValue;
  readonly assessmentContract: ResultAssessmentContractIdentity;
  readonly runtimeResultRelation: ReplayAdmittedRuntimeResultRelation;
  readonly invocationAuthority: Readonly<{
    readonly authoritySetRef: string;
    readonly authoritySetDigest: string;
    readonly authorityBasisRef: string;
    readonly authorityBasisDigest: string;
    readonly actorRef: string;
    readonly actorAttributionRef: string;
    readonly actorAttributionDigest: string;
    readonly capabilityGrantRefs: readonly string[];
  }>;
}

export interface AssessmentTraceRef {
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly emittedKinds: readonly RuntimeEvent["kind"][];
}

export interface PublicResultAssessmentAccepted {
  readonly kind: "accepted";
  readonly assessedCount: number;
  readonly trace: AssessmentTraceRef;
}

export interface PublicResultAssessmentRejected {
  readonly kind: "rejected";
  readonly ingestKind: "rejected" | "runtime_failure";
  readonly failureClass: RuntimeFailureClass | null;
  readonly reason: string;
  readonly trace: AssessmentTraceRef | null;
}

export type PublicResultAssessmentOutcome =
  | PublicResultAssessmentAccepted
  | PublicResultAssessmentRejected;
