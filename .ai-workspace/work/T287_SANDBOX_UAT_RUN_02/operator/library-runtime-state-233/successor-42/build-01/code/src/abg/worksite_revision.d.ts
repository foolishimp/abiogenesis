import { type SemanticJobRevisionEnvelope } from "../product/semantic_revision.js";
import { type WorksiteObservation, type WorksiteSubject } from "../product/worksite_effect.js";
import { type SemanticWorksiteBasis } from "../product/semantic_stage.js";
import { type SemanticRevisionCoordinate, type SemanticRevisionEnvelope } from "../product/semantic_revision.js";
import { type WorksiteExecutionTask, type WorksiteRevisionDependencyObservation, type WorksiteRevisionObservationOrigin } from "../product/worksite_revision.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type RehydratedAdmittedCCallState } from "./c_call.js";
import type { WorkspaceBinding, WorkspaceAuthorityBasis } from "../product/environment.js";
import type { GraphFunction } from "../gtl/contracts.js";
import type { WorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import type { WorksiteCommandForwardRequest } from "../product/worksite_command_forward.js";
import type { ChildExecutionBasisInput, ExecutionBasis } from "./execution_basis.js";
/** Reconstruct the recorded native leaf carrier, then reuse CCall's outcome
 * validator. No GraphFunction is synthesized and no value-equivalent wrapper
 * is admitted as its producer. The installed resolution row owns the locus. */
export declare function projectWorksiteRevisionNativeResult(prefix: ValidatedRuntimeEventPrefix, coordinate: SemanticRevisionCoordinate): RehydratedAdmittedCCallState | null;
export declare function projectAdmittedWorkspaceBindingAtCoordinate(prefix: ValidatedRuntimeEventPrefix, ref: string, digest: string): WorkspaceBinding | null;
/** All exact covering witness occurrences, not a latest/first chosen token. */
export declare function projectWorksiteRevisionBindingCover(prefix: ValidatedRuntimeEventPrefix, before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[]): readonly string[] | null;
/** Exact witnessed cover only. Each caller still owns applicability and current
 * work permission; D2's stricter authority continuity remains above. */
export declare function projectWitnessedWorkspaceBindingCover(prefix: ValidatedRuntimeEventPrefix, before: WorkspaceBinding, after: WorkspaceBinding, historicalBases: readonly ExecutionBasis[]): readonly string[] | null;
/** Binding coordinates may change; domain meaning and effect bounds may not. */
export declare function worksiteRevisionMeaningMatches(prior: SemanticWorksiteBasis, current: SemanticWorksiteBasis): boolean;
export type WorksiteRevisionOriginProof = WorksiteRevisionObservationOrigin | Readonly<{
    kind: "pending_binding_correspondence";
    source: WorksiteRevisionObservationOrigin;
}>;
/** One selected native D2 admission gate, shared by new actions, child bases
 * and later assembly. Raw kind strings cannot select an owner or grant. */
export declare function worksiteRevisionEntryBindingDisposition(prefix: ValidatedRuntimeEventPrefix, graphFunction: Readonly<GraphFunction>, input: unknown, currentBinding: WorkspaceBinding, admittedInput?: Pick<ChildExecutionBasisInput, "admittedInputRef" | "admittedInputDigest">): "not_applicable" | "covered" | "basis_fork_detected";
/** Actual already admitted projection, selected by its revision identity.
 * This is used only when serializing a pending correspondence into E_D. */
export declare function projectWorksiteRevisionBindingOrigin(prefix: ValidatedRuntimeEventPrefix, envelope: SemanticRevisionEnvelope | SemanticJobRevisionEnvelope): WorksiteRevisionObservationOrigin | null;
/** The root seed is an exact earlier input, never the current revision request. */
export declare function worksiteRevisionSeedMatches(seedBasis: ExecutionBasis, ancestor: unknown, current: SemanticWorksiteBasis): boolean;
/** Closed construction seed, separate from D2's semantic-stage seed. Reuses
 * the same native C0 currentness, physical-alias invalidation and cover owners. */
export declare function projectClosedConstructionRetainedVector(prefix: ValidatedRuntimeEventPrefix, task: WorksiteCommandExecutionTask, request: WorksiteCommandForwardRequest, bases: readonly ExecutionBasis[]): {
    snapshotSources: {
        source: {
            bindingCoverEventRefs: readonly string[];
            kind: "retained_construction";
            resultAdmissionEventRef: string;
            evidenceEventRef: string;
        };
        sourceMemberRef: string;
        subject: WorksiteSubject;
        observation: import("../product/worksite_effect.js").FileWorksiteObservation;
    }[];
    bindingCoverEventRefs: readonly string[];
} | null;
/** Rehydrates the exact recorded origin and rejects all native supersession. */
export declare function worksiteRevisionOriginSurvives(prefix: ValidatedRuntimeEventPrefix, row: WorksiteRevisionDependencyObservation): boolean;
export declare function projectWorksiteRevisionOrigins(prefix: ValidatedRuntimeEventPrefix, seedBasis: ExecutionBasis, historical: SemanticWorksiteBasis, current: SemanticWorksiteBasis, eligibleInvocationRefs: readonly string[]): readonly WorksiteRevisionOriginProof[] | null;
/** Exact physical observation is a check, never a replacement origin. */
export declare function worksiteRevisionPhysicalMatches(current: SemanticWorksiteBasis): boolean;
/** Read-only, non-minting currentness check for a receipt-backed retained vector. */
export declare function retainedWorksitePhysicalMatches(authority: WorkspaceAuthorityBasis, rows: readonly Readonly<{
    subject: WorksiteSubject;
    observation: WorksiteObservation;
}>[]): boolean;
export declare function worksiteExecutionSourcesCurrent(prefix: ValidatedRuntimeEventPrefix, task: WorksiteExecutionTask): boolean;
