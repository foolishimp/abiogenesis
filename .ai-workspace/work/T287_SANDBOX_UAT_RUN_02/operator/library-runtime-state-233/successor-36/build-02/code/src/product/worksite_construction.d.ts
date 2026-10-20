import { WORKSITE_CONSTRUCTION_IDS } from "./worksite_construction_identity.js";
export { WORKSITE_CONSTRUCTION_IDS, WORKSITE_CONSTRUCTION_RESULT_CONTRACT } from "./worksite_construction_identity.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type CapabilityGrant } from "./invocation.js";
import { type FileWorksiteObservation, type WorksiteFileReplaceReceipt, type WorksiteFileReplaceRequest, type WorksiteObservation, type WorksiteSubject, type WorksiteTerritory } from "./worksite_effect.js";
export interface WorksiteConstructionTarget {
    readonly kind: "worksite_construction_target";
    readonly schemaVersion: "5.0.0";
    readonly targetRef: string;
    readonly subject: WorksiteSubject;
    readonly territory: WorksiteTerritory;
    readonly predecessorObservation: WorksiteObservation;
}
export interface WorksiteConstructionTargetInput {
    readonly subject: WorksiteSubject;
    readonly territory: WorksiteTerritory;
    readonly predecessorObservation: WorksiteObservation;
    readonly targetRef?: string;
}
export interface WorksiteConstructionTask {
    readonly kind: "worksite_construction_task";
    readonly schemaVersion: "5.0.0";
    readonly taskRef: string;
    readonly taskDigest: Sha256Digest;
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly materializationPlanRef: typeof WORKSITE_CONSTRUCTION_IDS.materializationPlanRef;
    readonly rendererRef: typeof WORKSITE_CONSTRUCTION_IDS.rendererRef;
    readonly instructionContractRef: typeof WORKSITE_CONSTRUCTION_IDS.taskContractRef;
    readonly resultContractRef: typeof WORKSITE_CONSTRUCTION_IDS.workerResultContractRef;
    readonly workerActorRef: typeof WORKSITE_CONSTRUCTION_IDS.workerActorRef;
    readonly workerBindingRef: typeof WORKSITE_CONSTRUCTION_IDS.workerBindingRef;
    readonly transportLane: "closed_prompt_proof";
    readonly prompt: string;
    readonly promptDigest: Sha256Digest;
    readonly targets: readonly WorksiteConstructionTarget[];
}
export interface WorksiteConstructionTaskInput {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly prompt: string;
    readonly targets: readonly WorksiteConstructionTargetInput[];
}
export interface WorksiteCandidateFile {
    readonly kind: "worksite_candidate_file";
    readonly schemaVersion: "5.0.0";
    readonly targetRef: string;
    readonly replacementBase64: string;
}
export type WorksiteConstructionWorkerFile = (WorksiteCandidateFile & {
    readonly replacementText?: never;
}) | Readonly<{
    kind: "worksite_candidate_file";
    schemaVersion: "5.0.0";
    targetRef: string;
    replacementText: string;
    replacementBase64?: never;
}>;
export interface WorksiteConstructionWorkerResult {
    readonly kind: "worksite_construction_worker_result";
    readonly schemaVersion: "5.0.0";
    readonly files: readonly WorksiteConstructionWorkerFile[];
}
export interface WorksiteCandidateBundle {
    readonly kind: "worksite_candidate_bundle";
    readonly schemaVersion: "5.0.0";
    readonly candidateBundleRef: string;
    readonly candidateBundleDigest: Sha256Digest;
    readonly task: WorksiteConstructionTask;
    readonly files: readonly WorksiteCandidateFile[];
}
export interface WorksiteFileReplaceVectorMember {
    readonly ordinal: number;
    readonly memberRef: string;
    readonly value: WorksiteFileReplaceRequest;
}
export interface WorksiteFileReplaceVector {
    readonly kind: "worksite_file_replace_vector";
    readonly schemaVersion: "5.0.0";
    readonly vectorRef: string;
    readonly vectorDigest: Sha256Digest;
    readonly sourceCandidateBundleRef: string;
    readonly sourceCandidateBundleDigest: Sha256Digest;
    readonly members: readonly WorksiteFileReplaceVectorMember[];
}
export interface WorksiteFileReplaceOutput {
    readonly kind: "worksite_file_replace_output";
    readonly schemaVersion: "5.0.0";
    readonly authorization: Readonly<Record<string, unknown>>;
    readonly receipt: WorksiteFileReplaceReceipt;
    readonly successorObservation: FileWorksiteObservation;
}
export interface WorksiteFileReplaceOutputVectorMember {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly outputMemberRef: string;
    readonly value: WorksiteFileReplaceOutput;
}
export interface WorksiteFileReplaceOutputVector {
    readonly kind: "gtl_fan_out_vector";
    readonly schemaVersion: "5.0.0";
    readonly applicationRef: string;
    readonly members: readonly WorksiteFileReplaceOutputVectorMember[];
}
export interface WorksiteConstructionResultMember {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly outputMemberRef: string;
    readonly receipt: WorksiteFileReplaceReceipt;
    readonly successorObservation: FileWorksiteObservation;
}
export interface WorksiteConstructionResult {
    readonly kind: "worksite_construction_result";
    readonly schemaVersion: "5.0.0";
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly sourceApplicationRef: string;
    readonly members: readonly WorksiteConstructionResultMember[];
}
export interface WorksiteConstructionFailure {
    readonly kind: "worksite_construction_failure";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: string;
    readonly diagnosticRef: string;
}
export interface WorksiteConstructionVectorApplicationFailure {
    readonly kind: "worksite_construction_vector_application_failure";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: string;
    readonly diagnosticRef: string;
}
export declare function constructWorksiteConstructionTask(input: WorksiteConstructionTaskInput): WorksiteConstructionTask;
export declare function isWorksiteConstructionTask(value: unknown): value is WorksiteConstructionTask;
export declare function isWorksiteConstructionWorkerResult(value: unknown): value is WorksiteConstructionWorkerResult;
export declare function constructWorksiteConstructionWorkerResult(task: WorksiteConstructionTask, rawValue: unknown): WorksiteConstructionWorkerResult;
export declare function worksiteConstructionWorkerResultSchema(task: WorksiteConstructionTask): Readonly<Record<string, JsonValue>>;
export declare function constructWorksiteCandidateBundle(task: WorksiteConstructionTask, workerResult: WorksiteConstructionWorkerResult): WorksiteCandidateBundle;
export declare function isWorksiteCandidateBundle(value: unknown): value is WorksiteCandidateBundle;
export declare function constructWorksiteFileReplaceVector(candidate: WorksiteCandidateBundle): WorksiteFileReplaceVector;
export declare function isWorksiteFileReplaceVector(value: unknown): value is WorksiteFileReplaceVector;
export declare function isWorksiteFileReplaceOutputVector(value: unknown): value is WorksiteFileReplaceOutputVector;
export declare function reduceWorksiteFileReplaceResults(input: WorksiteFileReplaceOutputVector): WorksiteConstructionResult;
export declare function isWorksiteConstructionResult(value: unknown): value is WorksiteConstructionResult;
export declare function isWorksiteConstructionFailure(value: unknown): value is WorksiteConstructionFailure;
export declare function isWorksiteConstructionVectorApplicationFailure(value: unknown): value is WorksiteConstructionVectorApplicationFailure;
export declare function resolveWorksiteConstructionJudgmentRelation(predicateRef: string): Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null;
