import { type WorksiteRevisionOriginProof } from "./worksite_revision.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type SemanticRevisionCoordinate, type SemanticRevisionEnvelope } from "../product/semantic_revision.js";
import { type SemanticStageEnvelope, type SemanticWorksiteBasis } from "../product/semantic_stage.js";
import { type SemanticStageNativeBasis } from "./semantic_stage.js";
import { type SemanticJobRevisionEnvelope } from "../product/semantic_revision.js";
import { type SemanticRevisionSelectionInput, type SemanticRevisionRequest } from "../product/semantic_revision.js";
export declare function prepareNativeSemanticRevisionIntake(basis: SemanticStageNativeBasis, input: unknown, commandExecutionLimits: import("../product/worksite_command_execution.js").WorksiteCommandExecutionLimits, onRefusal?: (reason: string) => void): Promise<SemanticRevisionSelectionInput | null>;
export declare function nativeSemanticRevisionIntakeMatches(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
/** The output is an ordinary terminal-readable request, derived from the one
 * admitted selection and the one admitted intake in this invocation. */
export declare function projectNativeSemanticRevisionRequest(basis: SemanticStageNativeBasis, input: unknown): SemanticRevisionRequest | null;
/** D2's job arm reuses this owner's parent/cause and physical-origin relations. */
export declare function projectJobRevisionSubject(basis: SemanticStageNativeBasis, input: unknown, readPhysical?: boolean): {
    owner: {
        publication: Readonly<import("../index.js").ModulePublication>;
        lifecycle: Readonly<import("../gtl/semantic_job.js").SemanticJobLifecycleDeclaration>;
        root: import("./execution_basis.js").ExecutionBasis;
        invocationRoot: import("./execution_basis.js").ExecutionBasis;
        environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment;
        grant: import("../index.js").CapabilityGrant;
        role: "author" | "assessor" | null;
        stage: import("../index.js").SemanticStageDeclaration | undefined;
        events: readonly import("./event_store.js").RuntimeEvent[];
        prefix: ValidatedRuntimeEventPrefix;
        execution: import("./execution_basis.js").ExecutionBasis;
        graph: Readonly<import("../index.js").GtlGraph>;
        call: import("./c_call.js").CCall;
        resolution: import("./execution_basis.js").AdmittedImplementationResolutionRow;
        program: import("../index.js").GtlProgram;
        inputRef: string;
        inputDigest: `sha256:${string}`;
        inputValue: JsonValue;
    };
    request: SemanticRevisionRequest | SemanticRevisionSelectionInput;
    parent: import("./c_call.js").RehydratedAdmittedCCallState;
    envelope: import("../product/semantic_job.js").SemanticJobEnvelope;
    nativeWorksite: import("../product/semantic_revision.js").NativeSemanticRevisionWorksite;
    acquisition: import("./c_call.js").RehydratedAdmittedCCallState;
    construction: import("./c_call.js").RehydratedAdmittedCCallState | null;
    operationalFailure: {
        readonly role: "author" | "assessor";
        readonly stageRef: string;
        readonly evidenceRef: JsonValue | undefined;
        readonly evidenceAdmissionEventRef: string;
        readonly ownerObservation: {
            readonly [key: string]: JsonValue;
        };
        readonly refusal: Record<string, JsonValue>;
    } | null;
    priorWorksite: null;
    currentWorksite: null;
    origins: import("./c_call.js").RehydratedAdmittedCCallState[];
    causes: import("./c_call.js").RehydratedAdmittedCCallState[];
    counterevidenceAssets: import("../product/semantic_job.js").SemanticJobAsset[];
} | {
    owner: {
        publication: Readonly<import("../index.js").ModulePublication>;
        lifecycle: Readonly<import("../gtl/semantic_job.js").SemanticJobLifecycleDeclaration>;
        root: import("./execution_basis.js").ExecutionBasis;
        invocationRoot: import("./execution_basis.js").ExecutionBasis;
        environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment;
        grant: import("../index.js").CapabilityGrant;
        role: "author" | "assessor" | null;
        stage: import("../index.js").SemanticStageDeclaration | undefined;
        events: readonly import("./event_store.js").RuntimeEvent[];
        prefix: ValidatedRuntimeEventPrefix;
        execution: import("./execution_basis.js").ExecutionBasis;
        graph: Readonly<import("../index.js").GtlGraph>;
        call: import("./c_call.js").CCall;
        resolution: import("./execution_basis.js").AdmittedImplementationResolutionRow;
        program: import("../index.js").GtlProgram;
        inputRef: string;
        inputDigest: `sha256:${string}`;
        inputValue: JsonValue;
    };
    request: SemanticRevisionRequest | SemanticRevisionSelectionInput;
    parent: import("./c_call.js").RehydratedAdmittedCCallState;
    envelope: import("../product/semantic_job.js").SemanticJobEnvelope;
    construction: {
        seed: import("./execution_basis.js").ExecutionBasis;
        worksite: SemanticWorksiteBasis;
        original: (JsonValue | undefined) & import("../product/semantic_job.js").SemanticJobEnvelope;
        result: import("./c_call.js").AdmittedCCallResult;
    };
    priorWorksite: SemanticWorksiteBasis;
    currentWorksite: SemanticWorksiteBasis;
    origins: readonly WorksiteRevisionOriginProof[];
    eligibleInvocationRefs: string[];
    causes: import("./c_call.js").RehydratedAdmittedCCallState[];
} | null;
export declare function jobRevisionSelectionMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
export declare function projectSemanticJobRevision(basis: SemanticStageNativeBasis, input: unknown, readPhysical?: boolean): Readonly<SemanticJobRevisionEnvelope> | null;
export declare function semanticJobRevisionInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticJobRevisionEnvelope;
export declare function projectJobRevisionPreparation(basis: SemanticStageNativeBasis, input: unknown, readPhysical?: boolean): import("../product/worksite_revision.js").WorksiteRevisionCommandPreparationInput | null;
export declare function projectNativeRevisionConstructionTask(basis: SemanticStageNativeBasis, input: unknown): Readonly<import("../product/native_workspace_work.js").NativeWorkspaceWorkTask> | null;
export declare function projectNativeRevisionExecutionTask(basis: SemanticStageNativeBasis, input: unknown): Readonly<import("../product/worksite_command_execution.js").NativeWorksiteCommandExecutionTask> | null;
export declare function projectNativeRevisionEvidence(basis: SemanticStageNativeBasis, input: unknown): SemanticJobRevisionEnvelope | null;
export declare function semanticJobRevisionResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
export declare function isSemanticRevisionCommandCause(value: unknown): boolean;
/** Resolves the actual failed result separately from valid advancing history. */
export declare function projectSemanticRevision(basis: SemanticStageNativeBasis, input: unknown, readPhysical?: boolean): Readonly<SemanticRevisionEnvelope> | null;
/** The wrapper is admitted only as a whole native projection/author/assessor result. */
export declare function semanticRevisionInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticRevisionEnvelope;
export declare function semanticRevisionResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
/** Pure mapping is reconstructed from the native parent, never caller currentness. */
export declare function projectRevisionHistoricalContext(basis: SemanticStageNativeBasis, input: SemanticRevisionEnvelope): readonly {
    parent: SemanticRevisionCoordinate;
    status: "historical_invalidated_or_preserved";
    assets: SemanticStageEnvelope["assets"];
}[] | null;
/** The retained Design names its author's worksite, not the latest observation.
 * This read-only join supplies no currentness; the existing origin projection
 * and whole revision-input admission remain required by preparation. */
export declare function projectRevisionDesignCoordinates(basis: SemanticStageNativeBasis, input: SemanticRevisionEnvelope): Readonly<{
    historicalWorksite: SemanticWorksiteBasis;
    snapshotTargetRefs: string[];
    selectedTargetRefs: string[];
}> | null;
export declare function projectRevisionWorksitePreparation(basis: SemanticStageNativeBasis, input: unknown): import("../product/worksite_revision.js").WorksiteRevisionCommandPreparationInput | null;
export declare function projectRevisionEvidenceInput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticRevisionEnvelope | SemanticJobRevisionEnvelope> | null;
export declare function projectRevisionSelectionSubject(basis: SemanticStageNativeBasis, input: unknown, readPhysical?: boolean): {
    owner: {
        events: readonly import("./event_store.js").RuntimeEvent[];
        prefix: ValidatedRuntimeEventPrefix;
        execution: import("./execution_basis.js").ExecutionBasis;
        graph: Readonly<import("../index.js").GtlGraph>;
        call: import("./c_call.js").CCall;
        resolution: import("./execution_basis.js").AdmittedImplementationResolutionRow;
        environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment;
        lifecycle: Readonly<import("../index.js").SemanticLifecycleDeclaration>;
        source: Readonly<import("../index.js").GtlRequirementHandoffDeclaration>;
        sourcePublication: Readonly<import("../index.js").ModulePublication>;
        role: "author" | "assessor" | null;
        inputRef: string;
        inputDigest: `sha256:${string}`;
        stage: import("../index.js").SemanticStageDeclaration | undefined;
    };
    envelope: SemanticStageEnvelope;
    parent: import("./c_call.js").RehydratedAdmittedCCallState;
    currentWorksite: SemanticWorksiteBasis | null;
    origins: readonly WorksiteRevisionOriginProof[];
    causes: import("./c_call.js").RehydratedAdmittedCCallState[];
} | null;
export declare function semanticRevisionSelectionMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
