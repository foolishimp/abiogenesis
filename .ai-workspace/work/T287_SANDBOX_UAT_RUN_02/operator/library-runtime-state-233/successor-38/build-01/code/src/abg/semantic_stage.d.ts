import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import type { SemanticStageDeclaration } from "../gtl/semantic_stage.js";
import { type ExecutionBasis } from "./execution_basis.js";
import { type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import { type CCall, type RehydratedAdmittedCCallState } from "./c_call.js";
import { type SemanticStageEnvelope, type SemanticWorksiteBasis } from "../product/semantic_stage.js";
export interface SemanticStageNativeBasis {
    readonly publication: Readonly<ModulePublication>;
    readonly lifecyclePublication?: Readonly<ModulePublication>;
    readonly sourcePublication?: Readonly<ModulePublication>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly declarationGraphFunctions: readonly Readonly<GraphFunction>[];
    readonly executionBasis: Readonly<ExecutionBasis>;
    readonly cCall: Readonly<CCall>;
    readonly cursor: Readonly<TraversalCursorCandidate>;
    readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
/** Reuses the native CCall outcome projector; raw event payloads are not authority. */
export declare function projectSemanticPredecessorAtPrefix(prefix: ValidatedRuntimeEventPrefix, events: readonly RuntimeEvent[], publication: Readonly<ModulePublication>, cCallRef: string, graphFunctions?: readonly Readonly<GraphFunction>[]): RehydratedAdmittedCCallState | null;
export declare function constructSemanticStageNativeBasis(basis: SemanticStageNativeBasis): Readonly<SemanticStageNativeBasis> | null;
export declare function semanticInputValueAtBasis(basis: SemanticStageNativeBasis): unknown;
/** A read-only whole-value projector over an independently admitted prefix.
 * Individual valid assets cannot authorize a caller-spliced envelope. */
export declare function semanticEnvelopeMatchesAdmittedPredecessor(prefix: ValidatedRuntimeEventPrefix, events: readonly RuntimeEvent[], publication: Readonly<ModulePublication>, graphFunctions: readonly Readonly<GraphFunction>[], input: SemanticStageEnvelope): boolean;
/** The current input must be the actual root admission or preceding native result. */
export declare function semanticInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticStageEnvelope;
/** The current content boundary reuses the admitted input and exact environment.
 * Physical checks run only before dispatch; recorded assembly rederivation is pure. */
export declare function semanticWorksiteContextMatchesBasis(basis: SemanticStageNativeBasis, worksite: SemanticWorksiteBasis, readPhysical?: boolean): boolean;
export declare function semanticResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
/** Changes only the published wire contract. Every carried byte remains the
 * exact authenticated current input; semantic and application claims do not change. */
export declare function projectSemanticEnvelopeOutput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticStageEnvelope> | null;
export declare function projectSemanticWorksitePreparation(basis: SemanticStageNativeBasis, input: unknown): Readonly<import("../product/worksite_preparation_contracts.js").WorksiteCommandPreparationInput> | null;
/** Finds only the named leaf's admitted, judged result in this invocation. */
export declare function selectedSemanticPredecessor(basis: SemanticStageNativeBasis, implementationRef: string, value: unknown): {
    previous: RehydratedAdmittedCCallState;
    execution: ExecutionBasis;
    event: RuntimeEvent;
} | null;
/** C2's stored protected snapshot is the evidence content locus. It is derived
 * from the admitted helper plan, never a caller-selected path. */
export declare function projectSemanticEvidenceInput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticStageEnvelope> | null;
export declare function authenticateSemanticStageBasis(basis: SemanticStageNativeBasis): {
    events: readonly RuntimeEvent[];
    prefix: ValidatedRuntimeEventPrefix;
    execution: ExecutionBasis;
    graph: Readonly<GtlGraph>;
    call: CCall;
    resolution: import("./execution_basis.js").AdmittedImplementationResolutionRow;
    environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment;
    lifecycle: Readonly<import("../gtl/semantic_stage.js").SemanticLifecycleDeclaration>;
    source: Readonly<import("../index.js").GtlRequirementHandoffDeclaration>;
    sourcePublication: Readonly<ModulePublication>;
    role: "author" | "assessor" | null;
    inputRef: string;
    inputDigest: `sha256:${string}`;
    stage: SemanticStageDeclaration | undefined;
} | null;
