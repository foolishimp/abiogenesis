import * as Effect from "effect/Effect";
import * as Abg from "../abg/index.js";
import type { AbgEventStore, ActorRuntimeBinding, AdmittedImplementationSet, ExecutableCCallLocusCandidate, ExecutionBasis, OpenedTraversalScope, RetryCCallOutcomeReceipt } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ClosureContract, GraphFunction, GtlGraph, GtlProgram, ModulePublication } from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { GraphValidation } from "../validator/graph.js";
import { type ExecutionClock } from "./operator_support.js";
import { type TraversalCursor } from "./traversal.js";
import { type ExecutableTraversalCompletion } from "./traversal_completion.js";
export interface ExecutableCCallContext {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly programPublication?: Readonly<ModulePublication>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphValidation: GraphValidation;
    readonly stop: ExecutableCCallLocusCandidate;
    readonly implementationSet: AdmittedImplementationSet;
    readonly leafPort: LeafInvocationPort;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly closureContract: Readonly<ClosureContract>;
    readonly actorRuntimeBinding: ActorRuntimeBinding;
    readonly scopeClass: "root" | "child";
    readonly deferToApplication?: true;
    readonly clock: ExecutionClock;
    readonly ordinal: number;
}
export interface CCallLifecycleEvaluation {
    readonly kind: "c_call_evaluation";
    readonly completion: ExecutableTraversalCompletion;
    readonly outputValueKind: string;
    readonly outputContractRef: string;
}
export interface CCallRetryRequest {
    readonly kind: "c_call_retry";
    readonly context: ExecutableCCallContext;
    readonly outcome: RetryCCallOutcomeReceipt;
    readonly outputValueKind: string;
    readonly outputContractRef: string;
}
export type CCallLifecycleStep = CCallLifecycleEvaluation | CCallRetryRequest;
export declare function projectCCallCompletion(source: TraversalCursor, admitted: Abg.CCallCompletionAdmission, target: TraversalCursor | null): ExecutableTraversalCompletion;
export declare function evaluateExecutableCCall(input: ExecutableCCallContext): Effect.Effect<CCallLifecycleStep>;
