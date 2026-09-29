import { type NativeWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { ExecutionBasis } from "./execution_basis.js";
import type { DurablePrefixCoordinate, RuntimeEvent } from "./event_store.js";
type NativeSource = Readonly<{
    sourceBasis: ExecutionBasis;
    sourceResult: RuntimeEvent;
    sourceJudgment: RuntimeEvent;
    sourceClosedEvent: RuntimeEvent;
}>;
/** Existing admitted producer relation, shared by C2 and semantic native-source
 * adapters. This authenticates provenance; each consuming owner retains its
 * same-Run, current-subject and effect-scope obligations. */
export declare function projectNativeWorkspaceWorkSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, source: NativeWorksiteCommandExecutionTask["sourceNativeWork"]): Readonly<NativeSource> | null;
/** Pure projection. No caller-created observation or result gains admission. */
export declare function projectNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, task: NativeWorksiteCommandExecutionTask): Readonly<NativeSource> | null;
/** Ordinary consumer preparation may use the exported pure constructor. Its
 * selected native producer must have completed in this same admitted Run. */
export declare function projectSameRunNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
    parentBasis: ExecutionBasis;
    parentCCallRef: string;
    runId: string;
    task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate): Readonly<Readonly<{
    sourceBasis: ExecutionBasis;
    sourceResult: RuntimeEvent;
    sourceJudgment: RuntimeEvent;
    sourceClosedEvent: RuntimeEvent;
}>> | null;
export {};
