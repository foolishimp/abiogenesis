import { type NativeInstructionAssembly } from "./instruction_assembly.js";
import { type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { type SemanticStageNativeBasis } from "./semantic_stage.js";
import type { WorkspaceBinding } from "../product/environment.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import type { CCall } from "./c_call.js";
import type { ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import { type AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { OpenedTraversalScope } from "./open_call.js";
import { type NativeWorkerResultAssessment } from "./transport_contracts.js";
import { type WorkerToolInvocationEvidence } from "./worker_transport.js";
import type { LeafInvocationPort, LeafInvocationResolution } from "../implementation/contracts.js";
export interface ActorRuntimeBinding {
    readonly workspaceBinding: WorkspaceBinding;
    readonly artifactTruth: ExactPrefixArtifactTruthProjection;
}
export interface ActorProcessRequest {
    readonly actorRef: string;
    readonly workerBindingRef: string;
    readonly implementationRef: string;
    readonly inputDigest: Sha256Digest;
    readonly materializationPlanRef: string;
    readonly rendererRef: string;
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
    readonly transportLane: "closed_prompt_proof" | "worker_executes";
    readonly prompt: string;
    readonly responseJsonSchema: Readonly<Record<string, JsonValue>>;
}
export interface ActorProcessObservation {
    readonly nativeResultAssessment?: NativeWorkerResultAssessment;
    readonly actorInvocationRef: string;
    readonly actorRef: string;
    readonly workerBindingRef: string;
    readonly implementationRef: string;
    readonly inputDigest: Sha256Digest;
    readonly materializationPlanRef: string;
    readonly rendererRef: string;
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
    readonly processRef: string;
    readonly transportBindingRef: string;
    readonly transportBindingDigest: Sha256Digest;
    readonly disposition: "failure" | "success";
    readonly failureClass: string | null;
    readonly finalOutput: string;
    readonly observedOutputDigest: Sha256Digest;
    readonly promptDigest: Sha256Digest;
    readonly transportDigest: Sha256Digest;
    readonly transportLane: "closed_prompt_proof" | "worker_executes";
    readonly processStatus: number | null;
    readonly processSignal: string | null;
    readonly timeoutClass: "absolute" | "inactivity" | null;
    readonly timedOut: boolean;
    readonly exitObserved: boolean;
    readonly terminationConfirmed: boolean;
    readonly signalSequence: readonly string[];
    readonly structuredEventCount: number;
    readonly progressEventCount: number;
    readonly toolCallCount: number;
    readonly toolInvocations: readonly WorkerToolInvocationEvidence[];
    readonly apiRetryCount: number;
    readonly stdoutByteLength: number;
    readonly stderrByteLength: number;
    readonly artifactDigests: Readonly<{
        output: Sha256Digest;
        prompt: Sha256Digest;
        stderr: Sha256Digest;
        stdout: Sha256Digest;
        transport: Sha256Digest;
    }>;
}
export type ActorProcessCarrierValidationRefusalCode = "invalid_actor_process_observation" | "invalid_actor_process_request";
export interface ActorProcessCarrierValidation {
    readonly kind: "actor_process_carrier_validation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "valid";
    readonly request: Readonly<ActorProcessRequest>;
    readonly observation: Readonly<ActorProcessObservation>;
}
export interface ActorProcessCarrierValidationRefusal {
    readonly kind: "actor_process_carrier_validation_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ActorProcessCarrierValidationRefusalCode;
    readonly message: string;
}
export type ActorProcessCarrierValidationResult = ActorProcessCarrierValidation | ActorProcessCarrierValidationRefusal;
export type ActorProcessEffectRefusalCode = "actor_process_carrier_refused" | "actor_process_invocation_refused";
export interface ActorProcessEffectReceipt {
    readonly kind: "actor_process_effect_receipt";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly successorPrefix: DurablePrefixCoordinate;
    readonly exchange: Readonly<ActorProcessCarrierValidation>;
}
export interface ActorProcessEffectRefusal {
    readonly kind: "actor_process_effect_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ActorProcessEffectRefusalCode;
    readonly diagnosticRef: string;
    readonly message: string;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type ActorProcessEffectResult = ActorProcessEffectReceipt | ActorProcessEffectRefusal;
/**
 * Pure erased-input validation for actor request/observation carriers.
 * This proves only structural and locally decidable lifecycle law; it neither
 * emits runtime events nor establishes durable observation provenance.
 */
export declare function validateActorProcessCarrierPair(requestCandidate: unknown, observationCandidate: unknown): ActorProcessCarrierValidationResult;
export interface ActorProcessLifecycleProjection {
    readonly kind: "actor_process_lifecycle_projection";
    readonly actorInvocationRef: string;
    readonly processRef: string | null;
    readonly processTerminalEventRef: string | null;
    readonly processTerminalKind: "actor_process_exited" | "actor_process_spawn_failed" | null;
    readonly actorTerminalEventRef: string | null;
    readonly processLive: boolean;
    readonly cleanupPending: boolean;
    readonly terminationUnconfirmed: boolean;
    readonly cleanupDisposition: "complete" | "not_required" | "pending" | "termination_unconfirmed";
}
export declare function projectActorProcessLifecycle(prefix: ValidatedRuntimeEventPrefix, actorInvocationRef: string): ActorProcessLifecycleProjection;
export interface ActorProcessInvocationInput {
    readonly rawResultOwner?: Readonly<{
        port: LeafInvocationPort;
        resolution: LeafInvocationResolution;
        input: Readonly<Record<string, JsonValue>>;
    }>;
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly scope: OpenedTraversalScope;
    readonly cCall: CCall;
    readonly expectedInputDigest: Sha256Digest;
    readonly occurrence: Readonly<{
        readonly nativeInstructionAssemblyBasis?: Readonly<NativeInstructionAssemblyBasis>;
        readonly semanticStageBasis?: Readonly<SemanticStageNativeBasis>;
        readonly cCallRef: string;
        readonly runId: string;
        readonly graphCallId: string;
        readonly frameId: string;
        readonly programLocusRef: string;
        readonly taskOrdinal: number | null;
        readonly attempt: number;
    }>;
    readonly workerContracts: Readonly<{
        readonly instructionContractRef: string;
        readonly resultContractRef: string;
    }>;
    readonly runtime: ActorRuntimeBinding;
    readonly request: Readonly<ActorProcessRequest>;
    readonly dispatchOrdinal: number;
    readonly basis: RuntimeAdmissionBasis;
}
/** One preparation and dispatch composition. The implementation may request
 * the assembly, but cannot supply or replace the value retained by this owner.
 * Only the existing immutable native basis permits reuse; raw/copy callers
 * retain the standalone cold dispatch authentication path. */
export declare function prepareActorProcessInvocation(value: Readonly<Record<string, JsonValue>>, occurrence: ActorProcessInvocationInput["occurrence"], contractByRef?: NonNullable<LeafInvocationPort["contractByRef"]>): Readonly<{
    prepareInstructionAssembly(): Readonly<NativeInstructionAssembly>;
    invokeActorProcess(input: ActorProcessInvocationInput): Promise<Readonly<ActorProcessEffectResult>>;
}>;
/** Standalone callers authenticate the complete assembly from durable input. */
export declare function invokeActorProcess(input: ActorProcessInvocationInput): Promise<Readonly<ActorProcessEffectResult>>;
