import type { ClosureContract, GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import type { ProductInstall, WorkspaceBinding } from "../product/environment.js";
import type { GraphFunctionCatalogView } from "../product/catalog.js";
import { type CapabilityGrant } from "../product/invocation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { GraphValidation } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import { type AdmittedCCallJudgment, type AdmittedCCallResult, type CCall, type PendingInteractionAdmission, type PendingInteractionAdmissionPlan, type RehydratedAdmittedCCallState } from "./c_call.js";
import { type AdmittedInteractionSet, type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { type PublicOperationAdmissionBasis } from "./environment_admission.js";
import { type EffectfulPublicInvocationTruth } from "./effectful_invocation_truth.js";
import { AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
export declare function admitContinuationTerminal(store: AbgEventStore, continuationRef: string, disposition: "abandoned" | "superseded", candidateRef: string, candidateDigest: Sha256Digest, basis: RuntimeAdmissionBasis): RuntimeEvent;
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type InvocationAdmission } from "./invocation_admission.js";
import { type OpenedTraversalScope } from "./open_call.js";
import { type AdmittedRoute } from "./traversal_route.js";
import type { TraversalTransitionCandidate } from "./traversal_transition.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import { type ReplayContinuationState } from "./fh_continuation_projection.js";
import { type FhResumeSuccessorCarrier, type FhResumeSuccessorInput } from "./fh_resume_relation.js";
export { projectFhContinuations, type ReplayContinuationState, } from "./fh_continuation_projection.js";
export type { FhResumeSuccessorCarrier, FhResumeSuccessorInput, } from "./fh_resume_relation.js";
export interface ContinuationProductBasis {
    readonly install: ProductInstall;
    readonly workspaceBinding: WorkspaceBinding;
    readonly artifactTruth: ExactPrefixArtifactTruthProjection;
    readonly catalogView: GraphFunctionCatalogView;
    readonly programValidation: ProgramValidation;
    readonly graphValidation: GraphValidation;
}
export interface HeldInteractionCCallProjectionInput {
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly graph: Readonly<GtlGraph>;
    readonly interactionSet: AdmittedInteractionSet;
    readonly cursor: TraversalCursorCandidate;
}
export interface FhInteractionContinuation {
    readonly kind: "fh_interaction_continuation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "open";
    readonly continuationRef: string;
    readonly continuationDigest: Sha256Digest;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly actorCapabilityRef: string;
    readonly requestContractRef: string;
    readonly responseContractRef: string;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly heldCursorRef: string;
    readonly heldCursorDigest: Sha256Digest;
    readonly constructionIntentRef: string | null;
    readonly constructionIntentDigest: Sha256Digest | null;
    readonly openedEventRef: string;
}
export interface ContinuationPublicOperationAdmission {
    readonly kind: "continuation_public_operation_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly operationId: "abg.operation.interaction.respond" | "abg.operation.run.continue";
    readonly continuationRef: string;
    readonly invocationRef: string;
    readonly actorRef: string;
    readonly capabilityRef: string;
    readonly capabilityGrantRef: string;
    readonly admissionEventRef: string;
}
export interface PreparedContinuationPublicOperation {
    readonly kind: "prepared_continuation_public_operation";
    readonly schemaVersion: "5.0.0";
    readonly operation: ContinuationPublicOperationAdmission;
    readonly event: RuntimeEvent;
    readonly projectedPrefix: ValidatedRuntimeEventPrefix;
}
export type UnavailableEffectfulPublicInvocationTruth = Exclude<EffectfulPublicInvocationTruth, {
    readonly disposition: "available";
}>;
export type PreparedContinuationPublicOperationResult = PreparedContinuationPublicOperation | UnavailableEffectfulPublicInvocationTruth;
export interface FhInteractionResponseAdmission {
    readonly kind: "fh_interaction_response_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "responded";
    readonly continuationRef: string;
    readonly actorRef: string;
    readonly capabilityRef: string;
    readonly responseContractRef: string;
    readonly responseRef: string;
    readonly responseDigest: Sha256Digest;
    readonly responseValue: Readonly<Record<string, JsonValue>>;
    readonly admissionEventRef: string;
}
export interface PreparedFhInteractionResponse {
    readonly kind: "prepared_fh_interaction_response";
    readonly schemaVersion: "5.0.0";
    readonly publicOperation: PreparedContinuationPublicOperation;
    readonly response: FhInteractionResponseAdmission;
    readonly event: RuntimeEvent;
    readonly projectedPrefix: ValidatedRuntimeEventPrefix;
}
export interface CommittedFhInteractionResponse {
    readonly operation: ContinuationPublicOperationAdmission;
    readonly response: FhInteractionResponseAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type CommittedFhInteractionResponseResult = CommittedFhInteractionResponse | UnavailableEffectfulPublicInvocationTruth;
export interface FhInteractionResumeAdmission {
    readonly kind: "fh_interaction_resume_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "resolved";
    readonly continuationRef: string;
    readonly actorRef: string;
    readonly capabilityRef: string;
    readonly responseRef: string;
    readonly responseDigest: Sha256Digest;
    readonly responseValue: Readonly<Record<string, JsonValue>>;
    readonly successorInputRef: string;
    readonly successorInputDigest: Sha256Digest;
    readonly successorInputValue: Readonly<Record<string, JsonValue>>;
    readonly successorInputContractRef: string | null;
    readonly successorInputValueKind: string | null;
    readonly successorCursorRef: string;
    readonly successorCursorDigest: Sha256Digest;
    readonly admissionEventRef: string;
}
export interface PreparedFhInteractionResume {
    readonly kind: "prepared_fh_interaction_resume";
    readonly schemaVersion: "5.0.0";
    readonly publicOperation: PreparedContinuationPublicOperation;
    readonly resume: FhInteractionResumeAdmission;
    readonly event: RuntimeEvent;
    readonly projectedPrefix: ValidatedRuntimeEventPrefix;
}
export interface CommittedFhInteractionResume {
    readonly operation: ContinuationPublicOperationAdmission;
    readonly resume: FhInteractionResumeAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type CommittedFhInteractionResumeResult = CommittedFhInteractionResume | UnavailableEffectfulPublicInvocationTruth;
export interface FhContinuationRehydrationBasis {
    readonly install: ProductInstall;
    readonly workspaceBinding: WorkspaceBinding;
    readonly catalogView: GraphFunctionCatalogView;
    readonly program: Readonly<GtlProgram>;
    readonly graph: Readonly<GtlGraph>;
    readonly closureContract: Readonly<ClosureContract>;
}
export interface RehydratedFhContinuationScope {
    readonly continuation: ReplayContinuationState;
    readonly rootInvocation: InvocationAdmission;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly heldInteraction: {
        readonly cCall: CCall;
        readonly result: AdmittedCCallResult;
        readonly judgment: AdmittedCCallJudgment;
        readonly cursor: TraversalCursorCandidate;
    };
}
/**
 * Reconstructs the exact pending F_H CCall carrier from one immutable ABG
 * prefix and the admitted owner surfaces that declared its interaction locus.
 */
export declare function projectHeldInteractionCCallOutcomeAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: HeldInteractionCCallProjectionInput): RehydratedAdmittedCCallState | null;
export declare function projectFhInteractionSemanticBasis(store: AbgEventStore, continuation: ReplayContinuationState): Readonly<{
    readonly requestContractRef: string;
    readonly responseContractRef: string;
    readonly requestValue: Readonly<Record<string, JsonValue>>;
    readonly constructionIntent: Readonly<Record<string, JsonValue>> | null;
    readonly nextActionBasis: Readonly<Record<string, JsonValue>> | null;
}> | null;
export declare function projectFhInteractionSemanticBasisAtPrefix(prefix: ValidatedRuntimeEventPrefix, continuation: ReplayContinuationState): Readonly<{
    readonly requestContractRef: string;
    readonly responseContractRef: string;
    readonly requestValue: Readonly<Record<string, JsonValue>>;
    readonly constructionIntent: Readonly<Record<string, JsonValue>> | null;
    readonly nextActionBasis: Readonly<Record<string, JsonValue>> | null;
}> | null;
export declare function rehydrateFhContinuation(store: AbgEventStore, continuation: ReplayContinuationState, expected: FhContinuationRehydrationBasis, operation: ContinuationPublicOperationAdmission): RehydratedFhContinuationScope | null;
export declare function rehydrateFhContinuationAtPrefix(prefix: ValidatedRuntimeEventPrefix, continuation: ReplayContinuationState, expected: FhContinuationRehydrationBasis, operation: ContinuationPublicOperationAdmission): RehydratedFhContinuationScope | null;
export declare function prepareContinuationPublicOperation(prefix: ValidatedRuntimeEventPrefix, rootInvocation: InvocationAdmission, operation: "abg.operation.interaction.respond" | "abg.operation.run.continue", continuation: ReplayContinuationState, variant: string, actorRef: string, capabilityRef: string, basis: PublicOperationAdmissionBasis): PreparedContinuationPublicOperationResult;
export declare function resolveContinuationPublicOperationGrant(input: Readonly<{
    rootInvocation: Pick<InvocationAdmission, "actorRef" | "capabilityGrants" | "capabilityGrantRefs" | "workspaceBindingDigest" | "workspaceBindingId">;
    continuation: Pick<ReplayContinuationState, "continuationRef" | "status">;
    operation: "abg.operation.interaction.respond" | "abg.operation.run.continue";
    variant: string;
    actorRef: string;
    capabilityRef: string;
    basis: PublicOperationAdmissionBasis;
}>): CapabilityGrant | null;
export declare function admitFhInteractionOpen(store: AbgEventStore, executionBasis: ExecutionBasis, scope: OpenedTraversalScope, program: Readonly<GtlProgram>, graph: Readonly<GtlGraph>, interactionSet: AdmittedInteractionSet, cursor: TraversalCursorCandidate, pending: PendingInteractionAdmission, route: AdmittedRoute, productBasis: ContinuationProductBasis, inputValue: Readonly<Record<string, JsonValue>>, basis: RuntimeAdmissionBasis): FhInteractionContinuation;
export interface AdmitFhInteractionHoldInput {
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly store: AbgEventStore;
    readonly executionBasis: ExecutionBasis;
    readonly scope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly interactionSet: AdmittedInteractionSet;
    readonly cursor: TraversalCursorCandidate;
    readonly request: Readonly<Record<string, JsonValue>>;
    readonly expectedInputDigest: Sha256Digest;
    readonly pendingPlan: PendingInteractionAdmissionPlan;
    readonly routeCandidate: TraversalTransitionCandidate;
    readonly productBasis: ContinuationProductBasis;
    readonly inputValue: Readonly<Record<string, JsonValue>>;
    readonly pendingBasis: RuntimeAdmissionBasis;
    readonly routeBasis: RuntimeAdmissionBasis;
    readonly continuationBasis: RuntimeAdmissionBasis;
}
export interface FhInteractionHoldAdmission {
    readonly kind: "fh_interaction_hold_admission";
    readonly schemaVersion: "5.0.0";
    readonly pending: PendingInteractionAdmission;
    readonly route: AdmittedRoute;
    readonly continuation: FhInteractionContinuation;
    readonly successorPrefix: DurablePrefixCoordinate;
}
/**
 * Owns the complete pending-result, hold-route, continuation-open transaction.
 * HoG supplies the selected route candidate; ABG revalidates every event owner
 * relation and commits the conjunction at one exact durable predecessor.
 */
export declare function admitFhInteractionHold(input: Readonly<AdmitFhInteractionHoldInput>): FhInteractionHoldAdmission;
export declare function prepareFhInteractionResponse(publicOperation: PreparedContinuationPublicOperation, continuation: ReplayContinuationState, responseContractRef: string, responseValue: Readonly<Record<string, JsonValue>>, basis: RuntimeAdmissionBasis): PreparedFhInteractionResponse;
export declare function commitFhInteractionResponseAtExpectedPrefix(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, rootInvocation: InvocationAdmission, continuation: ReplayContinuationState, variant: string, actorRef: string, capabilityRef: string, operationBasis: PublicOperationAdmissionBasis, responseContractRef: string, responseValue: Readonly<Record<string, JsonValue>>, responseBasis: RuntimeAdmissionBasis): CommittedFhInteractionResponseResult;
export declare function deriveFhResumeSuccessorInput(store: AbgEventStore, continuation: ReplayContinuationState, operation: ContinuationPublicOperationAdmission, executionBasis: ExecutionBasis, closureContract: Readonly<ClosureContract>, successorCarrier: FhResumeSuccessorCarrier): FhResumeSuccessorInput;
export declare function deriveFhResumeSuccessorInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, continuation: ReplayContinuationState, operation: ContinuationPublicOperationAdmission, executionBasis: ExecutionBasis, closureContract: Readonly<ClosureContract>, successorCarrier: FhResumeSuccessorCarrier): FhResumeSuccessorInput;
export declare function prepareFhInteractionResume(publicOperation: PreparedContinuationPublicOperation, continuation: ReplayContinuationState, executionBasis: ExecutionBasis, closureContract: Readonly<ClosureContract>, successorInput: FhResumeSuccessorInput, successorCursor: TraversalCursorCandidate, durablePrefixDigest: Sha256Digest, basis: RuntimeAdmissionBasis): PreparedFhInteractionResume;
export declare function commitFhInteractionResumeAtExpectedPrefix(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, rootInvocation: InvocationAdmission, continuation: ReplayContinuationState, variant: string, actorRef: string, capabilityRef: string, operationBasis: PublicOperationAdmissionBasis, executionBasis: ExecutionBasis, closureContract: Readonly<ClosureContract>, successorInput: FhResumeSuccessorInput, successorCursor: TraversalCursorCandidate, resumeBasis: RuntimeAdmissionBasis): CommittedFhInteractionResumeResult;
