import type { ModulePublication } from "../gtl/contracts.js";
import { type SemanticJobEnvelope, type SemanticJobContractIssue } from "../product/semantic_job.js";
import { type WorksiteFileParentsRequest, type WorksiteContextObservation } from "../product/worksite_effect.js";
import { type WorksiteReadDependencyBasis, type WorksiteCommandExecutionLimits } from "../product/worksite_command_execution.js";
import type { SemanticStageNativeBasis } from "./semantic_stage.js";
import { type ExecutionBasis } from "./execution_basis.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { SemanticWorksiteBasis } from "../product/semantic_stage.js";
/** Existing semantic-job ancestry owner; an internal projection, not Public authority. */
export declare function semanticJobRootAtPrefix(prefix: ValidatedRuntimeEventPrefix, execution: ExecutionBasis): ExecutionBasis | null;
export declare function authenticateSemanticJobBasis(basis: SemanticStageNativeBasis): {
    publication: Readonly<ModulePublication>;
    lifecycle: Readonly<import("../gtl/semantic_job.js").SemanticJobLifecycleDeclaration>;
    root: ExecutionBasis;
    invocationRoot: ExecutionBasis;
    environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment;
    grant: import("../index.js").CapabilityGrant;
    role: "author" | "assessor" | null;
    stage: import("../index.js").SemanticStageDeclaration | undefined;
    events: readonly import("./event_store.js").RuntimeEvent[];
    prefix: ValidatedRuntimeEventPrefix;
    execution: ExecutionBasis;
    graph: Readonly<import("../gtl/contracts.js").GtlGraph>;
    call: import("./c_call.js").CCall;
    resolution: import("./execution_basis.js").AdmittedImplementationResolutionRow;
    program: import("../gtl/contracts.js").GtlProgram;
    inputRef: string;
    inputDigest: `sha256:${string}`;
    inputValue: JsonValue;
} | null;
export declare function semanticJobInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticJobEnvelope;
export declare function projectSemanticJobIntake(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticJobEnvelope> | null;
export declare function semanticJobContextMatches(basis: SemanticStageNativeBasis, input: SemanticJobEnvelope, context: WorksiteContextObservation): boolean;
export declare function semanticJobContextCurrent(basis: SemanticStageNativeBasis, input: SemanticJobEnvelope): boolean;
export declare function projectSemanticJobContext(basis: SemanticStageNativeBasis, input: unknown): Promise<Readonly<{
    context: WorksiteContextObservation;
    kind: "semantic_stage_envelope";
    schemaVersion: "5.0.0";
    job: import("../product/semantic_job.js").SemanticJobInput;
    declaration: import("../gtl/semantic_job.js").SemanticJobLifecycleDeclaration;
    basis: import("../product/semantic_job.js").SemanticJobBasis;
    sourceContext: import("../index.js").ContextDeclaration;
    assets: readonly import("../product/semantic_job.js").SemanticJobAsset[];
    bindingVersions: readonly import("../product/semantic_job.js").SemanticJobBindingVersion[];
    worksite: SemanticWorksiteBasis | null;
    evidence: import("../product/semantic_stage.js").SemanticEvidenceInput | null;
    applicationCoverage: "non_closing";
    remainingGaps: readonly string[];
}> | null>;
export declare function projectSemanticJobPlan(basis: SemanticStageNativeBasis, input: unknown): Promise<WorksiteFileParentsRequest | null>;
/** Existing admitted outcome owner authenticates both ends; no raw-log acceptance. */
export declare function validateWorksiteFileParentsPlanAtPrefix(prefix: ValidatedRuntimeEventPrefix, request: WorksiteFileParentsRequest, publication: Readonly<ModulePublication>): boolean;
export declare function projectSemanticJobBridge(basis: SemanticStageNativeBasis, input: unknown): Promise<Readonly<import("../product/worksite_preparation_contracts.js").WorksiteCommandPreparationInput> | null>;
/** Saved C1 observations plus admitted context rederive the exact pre-effect request. */
export declare function semanticJobSavedWorksite(original: SemanticJobEnvelope, value: unknown): SemanticWorksiteBasis | null;
export declare function projectSemanticJobEvidence(basis: SemanticStageNativeBasis, input: unknown): SemanticJobEnvelope | null;
export declare function semanticJobResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
/** D2 recovers the actual initial worksite from the admitted bridge, not a caller layout. */
export declare function semanticJobConstructionSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, envelope: SemanticJobEnvelope): {
    seed: ExecutionBasis;
    worksite: SemanticWorksiteBasis;
    original: (JsonValue | undefined) & SemanticJobEnvelope;
    result: import("./c_call.js").AdmittedCCallResult;
} | null;
/** One admitted initial-job bridge and its actual earlier context producer.
 * A matching-looking caller basis is not an origin and never becomes current. */
export declare function semanticJobReadDependenciesAtPrefix(prefix: ValidatedRuntimeEventPrefix, readBasis: WorksiteReadDependencyBasis): {
    contextEvent: import("./event_store.js").RuntimeEvent;
    seed: ExecutionBasis;
    worksite: SemanticWorksiteBasis;
    original: (JsonValue | undefined) & SemanticJobEnvelope;
    result: import("./c_call.js").AdmittedCCallResult;
} | null;
export declare function projectNativeSemanticTask(basis: SemanticStageNativeBasis, input: unknown, selectedLimits?: WorksiteCommandExecutionLimits): Promise<Readonly<import("../product/native_workspace_work.js").NativeWorkspaceWorkTask> | null>;
export declare function projectNativeSemanticFold(basis: SemanticStageNativeBasis, input: unknown, onContractIssues?: (issues: readonly SemanticJobContractIssue[]) => void): Readonly<SemanticJobEnvelope> | null;
export declare function projectNativeSemanticExecution(basis: SemanticStageNativeBasis, input: unknown): Readonly<import("../product/worksite_command_execution.js").NativeWorksiteCommandExecutionTask> | null;
/** Native C2 alternative of the existing semantic evidence owner. Native C2
 * has already authenticated its source, protected snapshot and same-Run edge;
 * this join retains that exact evidence and the current assessed Design. */
export declare function projectNativeSemanticEvidence(basis: SemanticStageNativeBasis, input: unknown): SemanticJobEnvelope | null;
