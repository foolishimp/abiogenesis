import { type Sha256Digest } from "../shared/digests.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type AbgHistoricalDeclarationProof } from "../abg/terminal_result_contracts.js";
import { type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type CapabilityGrant } from "./invocation.js";
import { type WorksiteSubject, type FileWorksiteObservation } from "./worksite_effect.js";
import { type WorksiteCommandExecutionTask, type WorksiteCommandExecutionObservation, type WorksiteCommandHelperArtifact, type WorksiteSnapshotMember } from "./worksite_command_execution.js";
import { type WorksiteExecutionTask as PriorTask, type WorksiteExecutionObservation as PriorObservation, type WorksiteExecutionHelperArtifact as PriorArtifact, type WorksiteExecutionSnapshotMember as PriorMember } from "./worksite_revision.js";
import { WORKSITE_COMMAND_FORWARD_IDS } from "./worksite_command_forward_identity.js";
export { WORKSITE_COMMAND_FORWARD_IDS } from "./worksite_command_forward_identity.js";
export interface WorksiteCommandForwardSource {
    readonly prefix: DurablePrefixCoordinate;
    readonly invocationRef: string;
    readonly invocationAdmissionRef: string;
    readonly runId: string;
    readonly failedCCallRef: string;
    readonly failureEventRef: string;
    readonly runFailureEventRef: string;
    readonly constructionGraphCallRef: string;
    readonly preparationResultEventRef: string;
    readonly preparationJudgmentEventRef: string;
    readonly declarationProof: AbgHistoricalDeclarationProof;
}
export interface WorksiteCommandForwardRequest {
    readonly kind: "worksite_command_forward_request";
    readonly schemaVersion: "5.0.0";
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly source: WorksiteCommandForwardSource;
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly protectedObservations: readonly Readonly<{
        subject: WorksiteSubject;
        observation: FileWorksiteObservation;
    }>[];
}
export interface WorksiteCommandForwardSnapshotSource {
    readonly sourceMemberRef: string;
    readonly subject: WorksiteSubject;
    readonly observation: FileWorksiteObservation;
    readonly source: Readonly<{
        kind: "retained_construction";
        resultAdmissionEventRef: string;
        evidenceEventRef: string;
        bindingCoverEventRefs: readonly string[];
    }>;
}
export interface WorksiteCommandForwardTask extends Omit<WorksiteCommandExecutionTask, "kind" | "protectedObservations" | "materializationPlanRef" | "rendererRef" | "instructionContractRef" | "resultContractRef"> {
    readonly kind: "worksite_command_forward_task";
    readonly request: WorksiteCommandForwardRequest;
    readonly originalTask: WorksiteCommandExecutionTask;
    readonly snapshotSources: readonly WorksiteCommandForwardSnapshotSource[];
    readonly bindingCoverEventRefs: readonly string[];
    readonly materializationPlanRef: typeof WORKSITE_COMMAND_FORWARD_IDS.materializationPlanRef;
    readonly rendererRef: typeof WORKSITE_COMMAND_FORWARD_IDS.rendererRef;
    readonly instructionContractRef: typeof WORKSITE_COMMAND_FORWARD_IDS.taskContractRef;
    readonly resultContractRef: typeof WORKSITE_COMMAND_FORWARD_IDS.workerResultContractRef;
}
export interface WorksiteCommandForwardSnapshotMember extends Omit<WorksiteSnapshotMember, "kind"> {
    readonly kind: "worksite_command_forward_snapshot_member";
    readonly source: WorksiteCommandForwardSnapshotSource["source"];
}
export interface WorksiteCommandForwardArtifact extends Omit<WorksiteCommandHelperArtifact, "kind" | "snapshotMembers"> {
    readonly kind: "worksite_command_forward_helper_artifact";
    readonly snapshotMembers: readonly WorksiteCommandForwardSnapshotMember[];
}
export interface WorksiteCommandForwardObservation extends Omit<WorksiteCommandExecutionObservation, "kind" | "task" | "snapshotMembers"> {
    readonly kind: "worksite_command_forward_observation";
    readonly task: WorksiteCommandForwardTask;
    readonly snapshotMembers: readonly WorksiteCommandForwardSnapshotMember[];
}
export type ExecutableWorksiteCommandTask = PriorTask | WorksiteCommandForwardTask;
export type ExecutableWorksiteCommandObservation = PriorObservation | WorksiteCommandForwardObservation;
export type ExecutableWorksiteCommandArtifact = PriorArtifact | WorksiteCommandForwardArtifact;
export type ExecutableWorksiteSnapshotMember = PriorMember | WorksiteCommandForwardSnapshotMember;
export declare function constructWorksiteCommandForwardRequest(input: Omit<WorksiteCommandForwardRequest, "kind" | "schemaVersion" | "requestRef" | "requestDigest">): WorksiteCommandForwardRequest;
export declare function isWorksiteCommandForwardRequest(value: unknown): value is WorksiteCommandForwardRequest;
export declare function constructWorksiteCommandForwardTask(input: Readonly<{
    request: WorksiteCommandForwardRequest;
    originalTask: WorksiteCommandExecutionTask;
    snapshotSources: readonly WorksiteCommandForwardSnapshotSource[];
    bindingCoverEventRefs: readonly string[];
}>): WorksiteCommandForwardTask;
export declare function isWorksiteCommandForwardTask(value: unknown): value is WorksiteCommandForwardTask;
export declare function isExecutableWorksiteCommandTask(value: unknown): value is ExecutableWorksiteCommandTask;
export declare function executableWorksiteCommandSources(task: ExecutableWorksiteCommandTask): readonly import("./worksite_revision.js").WorksiteRevisionSnapshotSource[] | readonly import("./worksite_command_execution.js").WorksiteProtectedObservation[] | readonly WorksiteCommandForwardSnapshotSource[];
export declare function executableWorksiteCommandLocus(task: ExecutableWorksiteCommandTask): string;
export declare function executableWorksiteCommandIdentityPrefix(task: ExecutableWorksiteCommandTask, suffix: "helper-artifact" | "snapshot" | "execution-observation"): string;
export declare function executableWorksiteCommandImplementationRef(task: ExecutableWorksiteCommandTask): string;
export declare function isWorksiteCommandForwardWorkerResult(value: unknown): boolean;
