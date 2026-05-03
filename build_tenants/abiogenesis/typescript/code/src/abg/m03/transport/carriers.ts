import type {
  AdvancementTransition,
  RuntimeFailureClass
} from "../contracts/carriers.js";
import type { AgentTransportContract } from "../../../shared/abg_library/index.js";

export type { RuntimeFailureClass } from "../contracts/carriers.js";

export type FulfillmentStatus =
  | "fulfilled"
  | "partial"
  | "blocked"
  | "unfulfilled";

export type TransportContract = AgentTransportContract;

export interface DispatchRequest {
  readonly kind: "fp_dispatch_request";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly jobId: string;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
  readonly expectedEdge: string | null;
  readonly expectedAssessmentIds: readonly string[];
  readonly traversalAttemptEnvelopeRef: string | null;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly requiredProgressArtifactRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly transportContract: TransportContract;
}

export interface ResultArtifact {
  readonly kind: "result_artifact";
  readonly basisId: string;
  readonly dispatchRef: string;
  readonly resultRef: string;
  readonly artifactPayload: {
    readonly edge: string;
    readonly actor: string;
    readonly fulfillmentAssessments: readonly {
      readonly id: string;
      readonly evaluator: string;
      readonly fulfillmentStatus: FulfillmentStatus;
      readonly fulfillmentDetail: string;
      readonly blockingReasons: readonly string[];
      readonly evidenceRefs: readonly string[];
    }[];
    readonly workerId: string | null;
    readonly backendId: string | null;
    readonly roleId: string | null;
    readonly assignmentSource: string | null;
    readonly resolvedRuntimeRef: string | null;
  } | null;
  readonly identityIssues: readonly string[];
  readonly runtimeFailure: {
    readonly failureClass: RuntimeFailureClass;
    readonly detail: string;
  } | null;
}

export interface AcceptedResultIngestOutcome {
  readonly kind: "accepted";
  readonly request: DispatchRequest;
  readonly artifact: ResultArtifact;
}

export interface RejectedResultIngestOutcome {
  readonly kind: "rejected";
  readonly request: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly detail: string;
}

export interface RuntimeFailedResultIngestOutcome {
  readonly kind: "runtime_failure";
  readonly request: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly failureClass: RuntimeFailureClass;
  readonly detail: string;
}

export type ResultIngestOutcome =
  | AcceptedResultIngestOutcome
  | RejectedResultIngestOutcome
  | RuntimeFailedResultIngestOutcome;

export type DispatchRequestSink = (request: DispatchRequest) => void;

export interface DispatchRequestInit {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId?: string;
  readonly frameId?: string;
  readonly vectorIndex?: number;
  readonly jobId: string;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
  readonly expectedEdge: string | null;
  readonly expectedAssessmentIds: readonly string[];
  readonly traversalAttemptEnvelopeRef?: string | null;
  readonly selectedScheduleItemRefs?: readonly string[];
  readonly orderingConstraintRefs?: readonly string[];
  readonly phaseGateRefs?: readonly string[];
  readonly requiredProgressArtifactRefs?: readonly string[];
  readonly gapPressureRefs?: readonly string[];
  readonly affectRefs?: readonly string[];
  readonly transportContract: TransportContract;
}

export interface ResultArtifactPayloadInit {
  readonly edge: string;
  readonly actor: string;
  readonly fulfillmentAssessments: readonly {
    readonly id: string;
    readonly evaluator: string;
    readonly fulfillmentStatus: FulfillmentStatus;
    readonly fulfillmentDetail: string;
    readonly blockingReasons: readonly string[];
    readonly evidenceRefs: readonly string[];
  }[];
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly roleId: string | null;
  readonly assignmentSource: string | null;
  readonly resolvedRuntimeRef: string | null;
}

export interface ResultArtifactInit {
  readonly basisId: string;
  readonly dispatchRef: string;
  readonly resultRef: string;
  readonly artifactPayload: ResultArtifactPayloadInit | null;
  readonly identityIssues: readonly string[];
  readonly runtimeFailure: {
    readonly failureClass: RuntimeFailureClass;
    readonly detail: string;
  } | null;
}

export type DispatchDerivableTransition = Extract<
  AdvancementTransition,
  { readonly kind: "fp_dispatch" }
>;
