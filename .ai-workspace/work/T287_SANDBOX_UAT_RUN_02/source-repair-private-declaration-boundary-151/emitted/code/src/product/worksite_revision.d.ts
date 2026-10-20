import { type Sha256Digest } from "../shared/digests.js";
import { type WorksiteSubject, type FileWorksiteObservation } from "./worksite_effect.js";
import type { WorksiteConstructionTask, WorksiteConstructionResult } from "./worksite_construction.js";
import { type NativeWorksiteCommandExecutionTask, type NativeWorksiteCommandExecutionObservation, type ObservedWorksiteCommandExecutionTask, type ObservedWorksiteCommandExecutionObservation, type WorksiteCommandExecutionTaskInput, type WorksiteCommandExecutionTask, type WorksiteCommandExecutionObservation, type WorksiteCommandHelperArtifact, type WorksiteSnapshotMember, type WorksiteDeclaredCommandInput, type WorksiteOutcomePredicateInput, type WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
export { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
export type WorksiteRevisionObservationOrigin = Readonly<{
    kind: "admitted_input";
    basisAdmissionEventRef: string;
    inputAdmissionRef: string;
    inputDigest: Sha256Digest;
}> | Readonly<{
    kind: "admitted_replacement";
    resultAdmissionEventRef: string;
    evidenceEventRef: string;
}> | Readonly<{
    kind: "admitted_binding_projection";
    resultAdmissionEventRef: string;
    judgmentEventRef: string;
}> | Readonly<{
    kind: "admitted_initial_job_bridge";
    resultAdmissionEventRef: string;
    judgmentEventRef: string;
}>;
export interface WorksiteRevisionDependencyObservation {
    readonly designTargetRef: string;
    readonly subject: WorksiteSubject;
    readonly observation: FileWorksiteObservation;
    readonly origin: WorksiteRevisionObservationOrigin;
}
export interface WorksiteRevisionCommandPreparationInput {
    readonly kind: "worksite_revision_command_preparation_input";
    readonly schemaVersion: "5.0.0";
    readonly revisionBasisRef: string;
    readonly revisionBasisDigest: Sha256Digest;
    readonly constructionTask: WorksiteConstructionTask;
    readonly snapshotTargetRefs: readonly string[];
    readonly dependencyObservations: readonly WorksiteRevisionDependencyObservation[];
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
}
export interface WorksiteRevisionCommandPreparationBoundInput {
    readonly kind: "worksite_revision_command_preparation_bound_input";
    readonly schemaVersion: "5.0.0";
    readonly entry: WorksiteRevisionCommandPreparationInput;
    readonly source: WorksiteConstructionResult;
}
export type WorksiteRevisionSnapshotSourceKind = Readonly<{
    kind: "construction_member";
    sourceMemberRef: string;
}> | Readonly<{
    kind: "retained_dependency";
    origin: WorksiteRevisionObservationOrigin;
}>;
export interface WorksiteRevisionSnapshotSource {
    readonly designTargetRef: string;
    readonly subject: WorksiteSubject;
    readonly observation: FileWorksiteObservation;
    readonly source: WorksiteRevisionSnapshotSourceKind;
}
export interface WorksiteRevisionCommandExecutionTask extends Omit<WorksiteCommandExecutionTask, "kind" | "protectedObservations" | "readDependencyBasis" | "materializationPlanRef" | "rendererRef" | "instructionContractRef" | "resultContractRef"> {
    readonly kind: "worksite_revision_command_execution_task";
    readonly revisionBasisRef: string;
    readonly revisionBasisDigest: Sha256Digest;
    readonly snapshotSources: readonly WorksiteRevisionSnapshotSource[];
    readonly materializationPlanRef: typeof WORKSITE_REVISION_IDS.materializationPlanRef;
    readonly rendererRef: typeof WORKSITE_REVISION_IDS.rendererRef;
    readonly instructionContractRef: typeof WORKSITE_REVISION_IDS.taskContractRef;
    readonly resultContractRef: typeof WORKSITE_REVISION_IDS.workerResultContractRef;
}
export interface WorksiteRevisionSnapshotMember extends Omit<WorksiteSnapshotMember, "kind" | "sourceMemberRef"> {
    readonly kind: "worksite_revision_snapshot_member";
    readonly designTargetRef: string;
    readonly source: WorksiteRevisionSnapshotSourceKind;
}
export interface WorksiteRevisionCommandHelperArtifact extends Omit<WorksiteCommandHelperArtifact, "kind" | "snapshotMembers"> {
    readonly kind: "worksite_revision_command_helper_artifact";
    readonly snapshotMembers: readonly WorksiteRevisionSnapshotMember[];
}
export interface WorksiteRevisionCommandExecutionObservation extends Omit<WorksiteCommandExecutionObservation, "kind" | "task" | "snapshotMembers"> {
    readonly kind: "worksite_revision_command_execution_observation";
    readonly task: WorksiteRevisionCommandExecutionTask;
    readonly snapshotMembers: readonly WorksiteRevisionSnapshotMember[];
}
export type WorksiteExecutionTask = WorksiteCommandExecutionTask | NativeWorksiteCommandExecutionTask | ObservedWorksiteCommandExecutionTask | WorksiteRevisionCommandExecutionTask;
export type WorksiteExecutionObservation = WorksiteCommandExecutionObservation | NativeWorksiteCommandExecutionObservation | ObservedWorksiteCommandExecutionObservation | WorksiteRevisionCommandExecutionObservation;
export type WorksiteExecutionHelperArtifact = WorksiteCommandHelperArtifact | WorksiteRevisionCommandHelperArtifact;
export type WorksiteExecutionSnapshotMember = WorksiteSnapshotMember | WorksiteRevisionSnapshotMember;
export declare function isWorksiteRevisionObservationOrigin(x: unknown): x is WorksiteRevisionObservationOrigin;
export declare function isWorksiteRevisionDependencyObservation(x: unknown): x is WorksiteRevisionDependencyObservation;
export declare function isWorksiteRevisionSnapshotSource(x: unknown): x is WorksiteRevisionSnapshotSource;
/** Authority-free view used by unchanged snapshot/command mechanics. */
export declare function worksiteExecutionSources(task: WorksiteExecutionTask): readonly import("./worksite_command_execution.js").WorksiteProtectedObservation[] | readonly WorksiteRevisionSnapshotSource[];
export declare function worksiteExecutionLocus(task: WorksiteExecutionTask): string;
export type WorksiteRevisionCommandExecutionTaskInput = Omit<WorksiteCommandExecutionTaskInput, "protectedObservations" | "readDependencyBasis"> & Readonly<{
    revisionBasisRef: string;
    revisionBasisDigest: Sha256Digest;
    snapshotSources: readonly WorksiteRevisionSnapshotSource[];
}>;
export declare function constructWorksiteRevisionCommandExecutionTask(input: WorksiteRevisionCommandExecutionTaskInput): WorksiteRevisionCommandExecutionTask;
export declare function isWorksiteRevisionCommandExecutionTask(value: unknown): value is WorksiteRevisionCommandExecutionTask;
export declare function isWorksiteExecutionTask(value: unknown): value is WorksiteExecutionTask;
export declare function worksiteExecutionIdentityPrefix(task: WorksiteExecutionTask, suffix: "helper-artifact" | "snapshot" | "execution-observation"): string;
export declare function worksiteExecutionImplementationRef(task: WorksiteExecutionTask): string;
