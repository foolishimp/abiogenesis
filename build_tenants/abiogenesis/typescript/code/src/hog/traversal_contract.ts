import type {
  AbgEventStore,
  ActorRuntimeBinding,
  AdmittedImplementationSet,
  AdmittedInteractionSet,
  ContinuationProductBasis,
  ExecutionBasis,
  EffectfulPublicInvocationPriorAdmission,
  InvocationAdmission,
  OpenedTraversalScope,
  PreparedContinuationPublicOperation,
  PublicOperationAdmissionBasis,
  ReplayContinuationState,
  RuntimeAdmissionBasis,
  RuntimeFailureAdmissionReceipt,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { GraphValidation } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";
import type { CompleteInteractionResumeInput } from "./interaction_resume.js";
import type { TraversalCursor } from "./traversal.js";
import type {
  HeldRecursionSuspension,
  HeldWorkflowSuspension,
} from "./traversal_completion.js";
import type { ProjectedRetryResumeSuccess } from "../abg/retry.js";

/** Stable public traversal request basis. Locus operators receive projections. */
export interface ExecuteGraphTraversalCommonInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly programValidation: ProgramValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis?: ContinuationProductBasis;
  readonly leafPort: LeafInvocationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface InitialOrNonRetryResumeEntry {
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly resume?: {
    readonly cursor: TraversalCursor;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly inputDigest: `sha256:${string}`;
  };
  readonly projectedRetryResume?: never;
}

export interface ProjectedRetryResumeEntry {
  readonly projectedRetryResume: ProjectedRetryResumeSuccess;
  readonly input?: never;
  readonly inputDigest?: never;
  readonly resume?: never;
}

export type InitialOrNonRetryExecuteGraphTraversalInput =
  ExecuteGraphTraversalCommonInput & InitialOrNonRetryResumeEntry;

export type ExecuteGraphTraversalInput = ExecuteGraphTraversalCommonInput &
  (InitialOrNonRetryResumeEntry | ProjectedRetryResumeEntry);

export interface ResumeHeldInteractionInput {
  readonly current: InteractionResumeTraversalEntryInput;
  readonly interactionResume: Readonly<{
    preparedOperation: PreparedContinuationPublicOperation;
    rootInvocation: InvocationAdmission;
    continuation: ReplayContinuationState;
    heldInteraction: CompleteInteractionResumeInput["heldInteraction"];
    variant: string;
    actorRef: string;
    capabilityRef: string;
    operationBasis: PublicOperationAdmissionBasis;
    resumeBasis: RuntimeAdmissionBasis;
  }>;
  readonly parentSuspensions: readonly (
    HeldRecursionSuspension | HeldWorkflowSuspension
  )[];
}

/** Raw durable and installed carriers accepted by the single HoG resume port. */
export interface InteractionResumeTraversalEntryInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly graph: Readonly<GtlGraph>;
  readonly graphInput: Readonly<Record<string, JsonValue>>;
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis: Omit<
    ContinuationProductBasis,
    "graphValidation" | "programValidation"
  >;
  readonly leafPort: LeafInvocationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly eventTime: string;
  readonly correlationId: string;
}

export type ExecuteGraphTraversalRequest =
  | ExecuteGraphTraversalInput
  | ResumeHeldInteractionInput;

export interface GraphTraversalEntryRefusal {
  readonly kind: "graph_traversal_entry_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "duplicate_invocation"
    | "owner_refusal"
    | "target_mismatch";
  readonly message: string;
  readonly diagnosticRef: string;
  readonly candidate: JsonValue;
  readonly priorAdmission: EffectfulPublicInvocationPriorAdmission | null;
}

/** Every post-entry non-completion carries the exact last admitted prefix. */
export interface GraphTraversalFailureResult {
  readonly kind: "graph_traversal_failure_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failed";
  readonly code: "owner_refusal";
  readonly message: string;
  readonly diagnosticRef: string;
  readonly successorPrefix: DurablePrefixCoordinate;
  readonly receipt: RuntimeFailureAdmissionReceipt | null;
}
