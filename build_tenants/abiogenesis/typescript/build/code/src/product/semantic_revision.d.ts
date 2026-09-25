import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { RequirementTerm, GtlContractFulfillmentBinding } from "../gtl/requirement_handoff.js";
import { type SemanticStageEnvelope, type SemanticActorSource, type SemanticWorksiteBasis } from "./semantic_stage.js";
import { type SemanticJobEnvelope, type SemanticJobAsset, type NativeSemanticOperating, type NativeSemanticRevisionConstruction } from "./semantic_job.js";
import { type NativeWorkspaceWorkObservation } from "./native_workspace_work.js";
import { type WorksiteCommandExecutionLimits } from "./worksite_command_execution.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type WorksiteContextObservation } from "./worksite_effect.js";
import { type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type CapabilityGrant } from "./invocation.js";
export interface SemanticRevisionCoordinate {
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly resultAdmissionEventRef: string;
    readonly judgmentEventRef: string;
}
export interface NativeSemanticRevisionIntake {
    readonly kind: "native_semantic_revision_intake";
    readonly schemaVersion: "5.0.0";
    readonly sourceRun: {
        readonly ref: string;
        readonly digest: Sha256Digest;
    };
    readonly sourcePrefix: DurablePrefixCoordinate;
}
export declare function isNativeSemanticRevisionIntake(value: unknown): value is NativeSemanticRevisionIntake;
export interface SemanticRevisionSelection {
    readonly kind: "semantic_revision_selection";
    readonly schemaVersion: "5.0.0";
    readonly parent: SemanticRevisionCoordinate;
    readonly causes: readonly SemanticRevisionCoordinate[];
    readonly mode: "construction_repair" | "stage_revision";
    readonly selectedStageRef: string | null;
    readonly selectedObligationRefs: readonly string[];
    readonly selectedTargetRefs: readonly string[];
    readonly reasonRef: string;
    readonly nativePhase?: "preconstruction" | "postconstruction";
}
/** Native observation evidence stays native. This is an input to authenticate,
 * not a synthetic C0/C1 worksite or a new currentness owner. */
export interface NativeSemanticRevisionWorksite {
    readonly kind: "native_semantic_revision_worksite";
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly context: WorksiteContextObservation;
    readonly commandExecutionLimits: WorksiteCommandExecutionLimits;
    readonly construction: SemanticRevisionCoordinate | null;
    readonly source: NativeSemanticRevisionIntake;
    readonly acquisition?: SemanticRevisionCoordinate;
}
export declare function isNativeSemanticRevisionWorksite(value: unknown): value is NativeSemanticRevisionWorksite;
export interface SemanticRevisionRequest {
    readonly kind: "semantic_revision_request";
    readonly schemaVersion: "5.0.0";
    readonly parent: SemanticRevisionCoordinate;
    readonly causes: readonly SemanticRevisionCoordinate[];
    readonly selection: SemanticRevisionCoordinate;
    /** Terminal-readable projection of the admitted selection; absent on historical requests. */
    readonly selectionChoice?: {
        readonly mode: "construction_repair";
        readonly selectedStageRef: null;
    } | {
        readonly mode: "stage_revision";
        readonly selectedStageRef: string;
    };
    readonly currentWorksite: SemanticWorksiteBasis | null;
    readonly nativeWorksite?: NativeSemanticRevisionWorksite;
}
export interface SemanticRevisionSelectionInput {
    readonly kind: "semantic_revision_selection_input";
    readonly schemaVersion: "5.0.0";
    readonly parent: SemanticRevisionCoordinate;
    readonly causes: readonly SemanticRevisionCoordinate[];
    readonly currentWorksite: SemanticWorksiteBasis | null;
    readonly nativeWorksite?: NativeSemanticRevisionWorksite;
}
export declare function isSemanticRevisionSelectionInput(x: unknown): x is SemanticRevisionSelectionInput;
/** Compare the selected observation, not two Programs' different permissions.
 * ABG authenticates each invocation's own operating basis separately. */
export declare function semanticRevisionSelectionInputMatchesRequest(input: unknown, request: SemanticRevisionRequest): boolean;
export declare function semanticRevisionSelectionSchema(nativePhase?: "preconstruction" | "postconstruction"): Readonly<Record<string, JsonValue>>;
export interface SemanticRevisionBasis {
    readonly basisRef: string;
    readonly basisDigest: Sha256Digest;
    readonly request: SemanticRevisionRequest;
    readonly selection: SemanticRevisionSelection;
    readonly affectedStageRefs: readonly string[];
    readonly preservedAssetRefs: readonly string[];
    readonly retainedTerms: readonly RequirementTerm[];
    readonly retainedBindings: readonly GtlContractFulfillmentBinding[];
    readonly parentRevisionRef: string | null;
}
export interface SemanticRevisionEnvelope {
    readonly kind: "semantic_revision_envelope";
    readonly schemaVersion: "5.0.0";
    readonly revisionBasis: SemanticRevisionBasis;
    readonly current: SemanticStageEnvelope;
}
export declare function isSemanticRevisionSelection(x: unknown): x is SemanticRevisionSelection;
export declare function isSemanticRevisionRequest(x: unknown): x is SemanticRevisionRequest;
export declare function isSemanticRevisionEnvelope(x: unknown): x is SemanticRevisionEnvelope;
/** Pure projection only. ABG must authenticate every input and regenerate this value before admission. */
export declare function deriveSemanticRevision(parent: SemanticStageEnvelope | SemanticRevisionEnvelope, request: SemanticRevisionRequest, selection: SemanticRevisionSelection): Readonly<SemanticRevisionEnvelope> | null;
export declare function deriveRevisionAsset(input: SemanticRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource): Readonly<{
    current: Readonly<SemanticStageEnvelope>;
    kind: "semantic_revision_envelope";
    schemaVersion: "5.0.0";
    revisionBasis: SemanticRevisionBasis;
}> | null;
export declare function deriveRevisionAssessment(input: SemanticRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource): Readonly<{
    current: Readonly<SemanticStageEnvelope>;
    kind: "semantic_revision_envelope";
    schemaVersion: "5.0.0";
    revisionBasis: SemanticRevisionBasis;
}> | null;
/** Closed job arm; legacy fixed binding equality above is unchanged. */
export interface SemanticJobRevisionEnvelope {
    readonly kind: "semantic_revision_envelope";
    readonly schemaVersion: "5.0.0";
    readonly revisionBasis: SemanticRevisionBasis & {
        readonly historicalAssets: readonly SemanticJobAsset[];
    };
    readonly current: SemanticJobEnvelope;
}
export declare function isSemanticJobRevisionEnvelope(x: unknown): x is SemanticJobRevisionEnvelope;
export declare function deriveSemanticJobRevision(parent: SemanticJobEnvelope | SemanticJobRevisionEnvelope, request: SemanticRevisionRequest, selection: SemanticRevisionSelection, worksite: SemanticWorksiteBasis | null, historicalWorksite?: SemanticWorksiteBasis | null, counterevidenceAssets?: readonly SemanticJobAsset[], counterevidence?: SemanticJobEnvelope, operationalFailedStage?: SemanticJobEnvelope["declaration"]["stages"][number]): Readonly<SemanticJobRevisionEnvelope> | null;
export declare function semanticJobRevisionNativeTargets(envelope: SemanticJobEnvelope): readonly {
    readonly relativePath: string;
    readonly role: "implementation" | "verifier" | "configuration";
    readonly obligationRefs: readonly string[];
    readonly bindingVersionRefs: readonly string[];
    readonly changeInstruction: string;
}[];
/** Affected writes derive from admitted selection and the newly assessed
 * Design. Unchanged targets stay read-only members of the native snapshot. */
export declare function nativeSemanticRevisionConstruction(input: SemanticJobRevisionEnvelope): NativeSemanticRevisionConstruction;
export declare function constructNativeRevisionConstructionTask(input: SemanticJobRevisionEnvelope, operating?: NativeSemanticOperating | undefined): Readonly<import("./native_workspace_work.js").NativeWorkspaceWorkTask>;
export declare function constructNativeRevisionExecutionTask(input: SemanticJobRevisionEnvelope, source: NativeWorkspaceWorkObservation): Readonly<import("./worksite_command_execution.js").NativeWorksiteCommandExecutionTask>;
/** Coordinates supplied here are admitted by the ABG source join, never by this pure constructor. */
export declare function deriveNativeRevisionEvidence(input: SemanticJobRevisionEnvelope, execution: unknown, construction: Pick<SemanticRevisionCoordinate, "resultRef" | "resultDigest">, command: Pick<SemanticRevisionCoordinate, "resultRef" | "resultDigest">): SemanticJobRevisionEnvelope | null;
export declare function deriveJobRevisionAsset(input: SemanticJobRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource): Readonly<{
    current: Readonly<SemanticJobEnvelope>;
    kind: "semantic_revision_envelope";
    schemaVersion: "5.0.0";
    revisionBasis: SemanticRevisionBasis & {
        readonly historicalAssets: readonly SemanticJobAsset[];
    };
}> | null;
export declare function deriveJobRevisionAssessment(input: SemanticJobRevisionEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource): Readonly<{
    current: Readonly<SemanticJobEnvelope>;
    kind: "semantic_revision_envelope";
    schemaVersion: "5.0.0";
    revisionBasis: SemanticRevisionBasis & {
        readonly historicalAssets: readonly SemanticJobAsset[];
    };
}> | null;
/** Pure carrier consequence; ABG authenticates intake, selection and native
 * producers before any of these leaves can supply advancing authority. */
export declare function evaluateNativeSemanticRevisionRelation(predicate: string, input: unknown, output: unknown): boolean | null;
