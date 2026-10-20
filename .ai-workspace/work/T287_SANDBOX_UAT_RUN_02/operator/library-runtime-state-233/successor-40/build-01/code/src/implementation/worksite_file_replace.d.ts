import { type JsonValue } from "../shared/canonical_json.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import type { FileWorksiteObservation, WorksiteFileReplaceReceipt, WorksitePostPublicationFailure } from "../product/worksite_effect.js";
import { type WorksiteFileParentsFailure, type WorksiteFileParentsSuccess } from "../product/worksite_effect.js";
import type { LeafExecutionOccurrence, LeafInvocationResolution, LeafRealizationCandidate } from "./contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
export declare const WORKSITE_C0_IMPLEMENTATION: Readonly<{
    implementationRef: "implementation://abiogenesis/worksite/file-replace-fd@5";
    implementationBindingRef: "implementation-binding://abiogenesis/worksite/file-replace-fd@5";
    inputContractRef: "contract://abiogenesis/worksite/file-replace-input@5";
    outputContractRef: "contract://abiogenesis/worksite/file-replace-output@5";
    failureContractRef: "contract://abiogenesis/worksite/file-replace-failure@5";
    refusalContractRef: "contract://abiogenesis/worksite/file-replace-refusal@5";
}>;
export declare const WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
interface UnadmittedCompletedWorksiteCommit {
    readonly kind: "unadmitted_physical_commit";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "unadmitted_physical_commit";
    readonly cCallRef: string;
    readonly receipt: Readonly<WorksiteFileReplaceReceipt>;
    readonly receiptRef: string;
    readonly receiptDigest: `sha256:${string}`;
    readonly successorObservation: Readonly<FileWorksiteObservation>;
    readonly successorObservationRef: string;
    readonly successorObservationDigest: `sha256:${string}`;
    readonly refusedExpectedPrefix: Readonly<DurablePrefixCoordinate>;
    readonly diagnosticRef: string;
}
export type UnadmittedPhysicalCommit = UnadmittedCompletedWorksiteCommit | Readonly<{
    kind: "unadmitted_physical_commit";
    schemaVersion: "5.0.0";
    disposition: "unadmitted_physical_commit";
    cCallRef: string;
    ownerOutcome: WorksitePostPublicationFailure;
    refusedExpectedPrefix: Readonly<DurablePrefixCoordinate>;
    diagnosticRef: string;
}> | Readonly<{
    kind: "unadmitted_physical_commit";
    schemaVersion: "5.0.0";
    disposition: "unadmitted_physical_commit";
    cCallRef: string;
    ownerOutcome: WorksiteFileParentsSuccess | WorksiteFileParentsFailure;
    refusedExpectedPrefix: Readonly<DurablePrefixCoordinate>;
    diagnosticRef: string;
}>;
export declare function unadmittedPhysicalCommit(cCallRef: string, value: unknown, refusedExpectedPrefix: unknown): Readonly<UnadmittedPhysicalCommit> | null;
/**
 * The selected packaged F_D leaf.  It has no ambient filesystem authority:
 * the Product owner receives only the exact values carried by the HoG-built
 * LeafExecutionAuthority.
 */
export declare function realizeWorksiteFileReplace(value: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>, resolution: Readonly<LeafInvocationResolution>, inputDigest: `sha256:${string}`): Promise<Readonly<LeafRealizationCandidate> | null>;
export declare const WORKSITE_FILE_PARENTS_IMPLEMENTATION: Readonly<{
    implementationRef: "implementation://abiogenesis/worksite/file-parents-fd@5";
    implementationBindingRef: "implementation-binding://abiogenesis/worksite/file-parents-fd@5";
    inputContractRef: "contract://abiogenesis/worksite/file-parents-input@5";
    outputContractRef: "contract://abiogenesis/worksite/file-parents-output@5";
    failureContractRef: "contract://abiogenesis/worksite/file-parents-failure@5";
    refusalContractRef: "contract://abiogenesis/worksite/file-parents-refusal@5";
}>;
export declare const WORKSITE_FILE_PARENTS_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
/** Selected native C0 entry, never a host directory-creation convenience. */
export declare function realizeWorksiteFileParents(value: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>, resolution: Readonly<LeafInvocationResolution>, inputDigest: `sha256:${string}`): Promise<Readonly<LeafRealizationCandidate> | null>;
export {};
