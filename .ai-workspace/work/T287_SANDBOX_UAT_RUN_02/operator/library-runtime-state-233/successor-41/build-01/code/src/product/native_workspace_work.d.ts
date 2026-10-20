import { type NativeWorkspaceAssessmentSelection } from "./native_workspace_assessment.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type CapabilityGrant } from "./invocation.js";
import { type WorksiteContextObservation, type WorksiteEffectRefusal } from "./worksite_effect.js";
import type { ActorProcessCarrierValidation } from "../abg/actor_process.js";
import type { LeafExecutionAuthority } from "../implementation/contracts.js";
export { NATIVE_WORKSPACE_WORK_IDS, NATIVE_WORKSPACE_WORK_HANDLER_DIGEST } from "./native_workspace_work_identity.js";
export declare const nativeWorkspacePathWithin: (path: string, roots: readonly string[]) => boolean;
export interface NativeWorkspaceWorkTask {
    readonly kind: "native_workspace_work_task";
    readonly schemaVersion: "5.0.0";
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly context: WorksiteContextObservation;
    readonly outcome: string;
    readonly instructions: readonly string[];
    readonly readFirst: readonly string[];
    readonly writeRoots: readonly string[];
    readonly checks: readonly string[];
    readonly assessment?: NativeWorkspaceAssessmentSelection;
}
export declare function isNativeWorkspaceWorkTask(value: unknown): value is NativeWorkspaceWorkTask;
export declare function constructNativeWorkspaceWorkTask(input: Omit<NativeWorkspaceWorkTask, "kind" | "schemaVersion">): Readonly<NativeWorkspaceWorkTask>;
export interface NativeWorkspaceWorkReport {
    readonly summary: string;
    readonly gaps: readonly string[];
}
export declare const nativeWorkspaceWorkReportSchema: Readonly<{
    type: "object";
    additionalProperties: false;
    required: string[];
    properties: {
        summary: {
            type: string;
        };
        gaps: {
            type: string;
            items: {
                type: string;
            };
        };
    };
}>;
export declare function isNativeWorkspaceWorkReport(value: unknown): value is NativeWorkspaceWorkReport;
export declare function parseNativeWorkspaceWorkReport(text: string): NativeWorkspaceWorkReport | null;
export declare function nativeWorkspaceWorkGraphFunctionRef(task: NativeWorkspaceWorkTask): string;
export declare function nativeWorkspaceAssessmentBasisDigest(task: NativeWorkspaceWorkTask): Sha256Digest;
export declare function nativeWorkspaceWorkResponseSchema(task: NativeWorkspaceWorkTask): Readonly<Record<string, JsonValue>>;
export declare function nativeWorkspaceWorkResultContractRef(task: NativeWorkspaceWorkTask): string;
export declare function renderNativeWorkspaceWorkOrder(task: NativeWorkspaceWorkTask): string;
export declare function nativeWorkspaceWorkAuthorityMatches(task: NativeWorkspaceWorkTask, a: LeafExecutionAuthority): boolean;
export declare function nativeWorkspaceChangedPaths(before: WorksiteContextObservation, after: WorksiteContextObservation): readonly string[];
export declare function nativeWorkspaceScopeViolations(task: NativeWorkspaceWorkTask, after: WorksiteContextObservation): readonly string[];
export interface NativeWorkspaceWorkObservation {
    readonly kind: "native_workspace_work_observation";
    readonly schemaVersion: "5.0.0";
    readonly observationRef: string;
    readonly observationDigest: Sha256Digest;
    readonly task: NativeWorkspaceWorkTask;
    readonly before: WorksiteContextObservation;
    readonly after: WorksiteContextObservation;
    readonly changedPaths: readonly string[];
    readonly report: NativeWorkspaceWorkReport | null;
    readonly assessment?: Readonly<Record<string, JsonValue>>;
    readonly provenance: NativeWorkspaceWorkProvenance;
}
export interface NativeWorkspaceWorkProvenance {
    readonly cCallRef: string;
    readonly executionAuthorityRef: string;
    readonly executionAuthorityDigest: Sha256Digest;
    readonly actorInvocationRef: string;
    readonly transportBindingRef: string;
    readonly transportBindingDigest: Sha256Digest;
    readonly promptDigest: Sha256Digest;
    readonly transportDigest: Sha256Digest;
}
export interface NativeWorkspaceWorkFailure {
    readonly kind: "native_workspace_work_failure";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: string;
    readonly diagnosticRef: string;
    readonly task: NativeWorkspaceWorkTask;
    readonly before: WorksiteContextObservation;
    readonly after: WorksiteContextObservation | null;
    readonly changedPaths: readonly string[] | null;
    readonly observationFailure: WorksiteEffectRefusal | null;
    readonly report: NativeWorkspaceWorkReport | null;
    readonly provenance: NativeWorkspaceWorkProvenance;
}
export declare function nativeWorkspaceWorkProvenance(authority: LeafExecutionAuthority, exchange: ActorProcessCarrierValidation): NativeWorkspaceWorkProvenance;
export declare function constructNativeWorkspaceWorkObservation(task: NativeWorkspaceWorkTask, after: WorksiteContextObservation, report: NativeWorkspaceWorkReport | null, provenance: NativeWorkspaceWorkProvenance, assessment?: Readonly<Record<string, JsonValue>>): Readonly<NativeWorkspaceWorkObservation>;
export declare function isNativeWorkspaceWorkObservation(value: unknown): value is NativeWorkspaceWorkObservation;
export declare function isNativeWorkspaceWorkFailure(value: unknown): value is NativeWorkspaceWorkFailure;
export declare function nativeWorkspaceWorkResultMatches(input: unknown, output: unknown, cCallRef: string, observation: ActorProcessCarrierValidation["observation"] | null): boolean;
export declare function resolveNativeWorkspaceWorkJudgmentRelation(predicateRef: string): Readonly<{
    predicateRef: "predicate://abiogenesis/worksite/native-work/observed@5";
    advanceReasonRef: "reason://abiogenesis/worksite/native-work/observed@5";
    rejectionReasonRef: "reason://abiogenesis/worksite/native-work/not-observed@5";
    evaluate: (input: unknown, output: unknown) => boolean;
}> | null;
/** Pure current-subject check over admitted observations; never a semantic verdict or admission. */
export declare function nativeWorkspaceAssessmentMatchesContext(value: unknown, context: WorksiteContextObservation): boolean;
