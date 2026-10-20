import { type NativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { type WorksitePreservedResultArtifact } from "../product/worksite_construction_recovery.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import { type WorksiteCandidateBundle, type WorksiteConstructionTask, type WorksiteFileReplaceOutputVector, type WorksiteFileReplaceVector } from "../product/worksite_construction.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";
export declare const WORKSITE_CONSTRUCTION_CANDIDATE_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const WORKSITE_CONSTRUCTION_JOIN_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const WORKSITE_PRESERVED_RESULT_AUTHENTICATE_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const WORKSITE_PRESERVED_RESULT_DERIVE_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare function authenticateWorksitePreservedResult(input: WorksiteConstructionTask, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate>;
export declare function deriveWorksitePreservedCandidate(input: WorksitePreservedResultArtifact, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate>;
export declare const WORKSITE_CONSTRUCTION_REDUCER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
/** One governed F_P dispatch. Native assembly preserves original task text as
 * an exact section while the exchange binds the complete assembled prompt. */
export declare function realizeWorksiteConstructionCandidate(input: Readonly<WorksiteConstructionTask>, occurrence: Readonly<LeafExecutionOccurrence>, prepareAssembly?: () => Readonly<NativeInstructionAssembly>): Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>>;
/** Deterministic authority join; candidate bytes supply no request authority. */
export declare function realizeWorksiteFileReplaceVector(input: Readonly<WorksiteCandidateBundle>): Readonly<LeafRealizationCandidate>;
/** Deterministic reduction over only the complete admitted C0 output vector. */
export declare function reduceWorksiteConstructionResults(input: Readonly<WorksiteFileReplaceOutputVector>): Readonly<LeafRealizationCandidate>;
export type { WorksiteFileReplaceVector };
