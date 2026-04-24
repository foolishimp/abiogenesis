// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type { RuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import type {
  DispatchRequest,
  ResultArtifact
} from "../../../abg/m03/transport/index.js";

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

export interface PublicResultAssessmentRequest {
  readonly kind: "fp_assessed";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly manifestProvenance: AssessmentManifestProvenance;
  readonly publishedLedgerRef: PublishedLedgerRef;
  readonly fulfillmentRefs: readonly FulfillmentAssessmentRef[];
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
  readonly ingestKind: "rejected" | "transport_failure";
  readonly reason: string;
  readonly trace: AssessmentTraceRef | null;
}

export type PublicResultAssessmentOutcome =
  | PublicResultAssessmentAccepted
  | PublicResultAssessmentRejected;
