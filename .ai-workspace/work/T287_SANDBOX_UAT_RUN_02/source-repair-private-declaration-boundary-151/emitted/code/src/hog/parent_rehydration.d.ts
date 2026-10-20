import { type AdmittedImplementationSet, type ExecutionBasis } from "../abg/execution_basis.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type OpenedTraversalScope } from "../abg/open_call.js";
import type { GtlProgram } from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { ProgramValidation } from "../validator/validation.js";
import { type HogReturnFrame } from "./evaluation_frame.js";
import type { HeldParentTraversalSuspension } from "./traversal_completion.js";
export interface RehydrateParentReturnFramesInput {
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly program: Readonly<GtlProgram>;
    readonly programValidation: ProgramValidation;
    readonly implementationSet: AdmittedImplementationSet;
    readonly leafPort: LeafInvocationPort;
    readonly currentChildExecutionBasis: ExecutionBasis;
    readonly currentChildTraversalScope: OpenedTraversalScope;
    readonly suspensions: readonly HeldParentTraversalSuspension[];
}
export interface ParentRehydrationRefusal {
    readonly kind: "parent_rehydration_refusal";
    readonly schemaVersion: "5.0.0";
    readonly stage: string;
    readonly diagnosticRef: string;
}
export type ParentReturnFramesRehydration = Readonly<{
    kind: "rehydrated_parent_return_frames";
    frames: readonly HogReturnFrame[];
}> | ParentRehydrationRefusal;
export declare function rehydrateParentReturnFrames(input: RehydrateParentReturnFramesInput): ParentReturnFramesRehydration;
