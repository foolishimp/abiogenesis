import type { CCall } from "../abg/c_call.js";
import type { AdmittedImplementationSet, ExecutionBasis } from "../abg/execution_basis.js";
import type { WorkspaceAuthorityBasis, WorkspaceBinding } from "./environment.js";
import { WORKSITE_FILE_REPLACE_EFFECT_URI, type FileWorksiteObservation, type WorksiteEffectAuthorization, type WorksiteEffectRefusal, type WorksiteFileReplaceReceipt, type WorksiteFileReplaceRequest, type WorksiteObservation, type WorksiteSubject, type WorksiteFileParentsRequestInput, type WorksiteFileParentsRequest, type WorksiteFileParentsAuthorization, type WorksiteFileParentsResult, type WorksiteContextObservation } from "./worksite_effect.js";
export interface WorksiteFileReplaceInput {
    /** Admitted owner roots supplied only by the guarded internal writer. */
    readonly protectedInstallRoots?: readonly string[];
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly request: WorksiteFileReplaceRequest;
    readonly executionBasis: ExecutionBasis;
    readonly cCall: CCall;
    readonly implementationSet: AdmittedImplementationSet;
    readonly authorization: WorksiteEffectAuthorization;
}
export interface WorksiteFileReplaceSuccess {
    readonly kind: "worksite_file_replace_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "committed";
    readonly effectUri: typeof WORKSITE_FILE_REPLACE_EFFECT_URI;
    readonly receipt: WorksiteFileReplaceReceipt;
    readonly successorObservation: FileWorksiteObservation;
}
export type WorksiteFileReplaceResult = WorksiteEffectRefusal | WorksiteFileReplaceSuccess;
export declare function observeWorksiteSubject(workspaceAuthorityBasis: WorkspaceAuthorityBasis, workspaceBinding: WorkspaceBinding, subject: WorksiteSubject): Promise<WorksiteEffectRefusal | WorksiteObservation>;
export declare function isWorksiteFileReplaceInput(value: unknown): value is WorksiteFileReplaceInput;
export declare function replaceWorksiteFile(input: WorksiteFileReplaceInput): Promise<WorksiteFileReplaceResult>;
interface WorksiteReadBasis {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly protectedInstallRoots?: readonly string[];
}
/** Read only: no directory prerequisite is manufactured by observation. */
export declare function observeWorksiteFileParents(input: Omit<WorksiteFileParentsRequestInput, "ancestorObservations"> & {
    readonly protectedInstallRoots?: readonly string[];
}): Promise<WorksiteFileParentsRequest | WorksiteEffectRefusal>;
export interface WorksiteFileParentsInput extends WorksiteReadBasis {
    readonly request: WorksiteFileParentsRequest;
    readonly executionBasis: ExecutionBasis;
    readonly cCall: CCall;
    readonly implementationSet: AdmittedImplementationSet;
    readonly authorization: WorksiteFileParentsAuthorization;
}
/** Internal physical owner; the guarded selected C0 leaf is the runtime entry. */
export declare function createWorksiteFileParents(input: WorksiteFileParentsInput): Promise<WorksiteFileParentsResult>;
export interface WorksiteContextInput extends WorksiteReadBasis {
    readonly readRoots: readonly string[];
    /** Bounds every observed entry, including directories and absent roots. */
    readonly maxFiles: number;
    readonly maxBytes: number;
}
/** Complete for its declared read roots or refused; replay consumes these bytes. */
export declare function observeWorksiteContext(input: WorksiteContextInput): Promise<WorksiteContextObservation | WorksiteEffectRefusal>;
export {};
