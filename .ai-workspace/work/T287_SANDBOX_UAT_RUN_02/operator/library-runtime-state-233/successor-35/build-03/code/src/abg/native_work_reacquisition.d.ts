import { type WorksiteContextObservation } from "../product/worksite_effect.js";
import { type NativeWorksiteCommandReacquisitionRequest, type NativeWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type ExecutionBasis } from "./execution_basis.js";
import { type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { type AbgHistoricalGraphCallSourceResource } from "./terminal_result_contracts.js";
export interface NativeWorkReacquisitionBasis {
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly cCallRef: string;
}
/** The source selector is evidence. R10 owns terminal scope; the binding-cover
 * owner and current native source projection own its present applicability. */
export declare function projectNativeWorkReacquisitionTask(current: DurablePrefixCoordinate, request: NativeWorksiteCommandReacquisitionRequest, nativeBasis: NativeWorkReacquisitionBasis, historicalSource?: AbgHistoricalGraphCallSourceResource): NativeWorksiteCommandExecutionTask | null;
/** Immutable preparation facts survive ordinary Result copying only inside
 * the existing authenticated prefix lineage. Current C2 invalidators remain
 * in projectNativeWorkCommandSourceAtPrefix and its same-Run join. */
export declare function authenticateNativeWorkReacquisition(basis: NativeWorkReacquisitionBasis, input: unknown, requireCurrent?: boolean, historicalSource?: AbgHistoricalGraphCallSourceResource): {
    prefix: ValidatedRuntimeEventPrefix;
    task: NativeWorksiteCommandExecutionTask;
    call: import("./c_call.js").CCall;
    execution: ExecutionBasis;
} | null;
/** Private invoking-owner operation for the existing prepare-testing F_D leaf.
 * The explicit resource is resolved before any retained establishment facts. */
export declare function prepareGovernanceNativeWorkReacquisition(basis: NativeInstructionAssemblyBasis, input: unknown, context: WorksiteContextObservation, historicalSource?: AbgHistoricalGraphCallSourceResource): NativeWorksiteCommandExecutionTask | null;
/** Admission matching borrows already authenticated declarations through the
 * admitted covered-use fact, not a copied resource or self-certified task. */
export declare function governanceNativeWorkReacquisitionResultMatches(basis: NativeInstructionAssemblyBasis, input: unknown, value: unknown): boolean;
/** Read-only existing physical observation owner; all read-scope files, not just C2 sources. */
export declare function nativeWorkReacquisitionContextCurrent(request: NativeWorksiteCommandReacquisitionRequest): Promise<boolean>;
/** The optional owner coordinate only reidentifies an already authenticated
 * historical preparation cut; it confers no current-source or effect authority. */
export declare function nativeWorkReacquisitionResultMatches(input: unknown, value: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, historicalSource?: AbgHistoricalGraphCallSourceResource): boolean;
export declare function projectReacquiredNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
    parentBasis: ExecutionBasis;
    parentCCallRef: string;
    runId: string;
    task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate): Readonly<Readonly<{
    sourceBasis: ExecutionBasis;
    sourceResult: import("./event_store.js").RuntimeEvent;
    sourceJudgment: import("./event_store.js").RuntimeEvent;
    sourceClosedEvent: import("./event_store.js").RuntimeEvent;
}>> | null;
