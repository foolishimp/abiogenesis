import type { GraphFunction, ModulePublication, RootModuleArtifactBasis } from "./contracts.js";
export declare const WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY: Readonly<{
    path: "contracts/worksite/command-execution-context.inventory.json";
    content: string;
}>;
/** Effect-free closed-child authentication; ordinary consumers compose its task into C2. */
export declare function nativeWorkReacquisitionGraphFunction(): GraphFunction;
/** One public C2 GraphFunction: exact task -> one worker_executes F_P leaf -> typed observation. */
export declare function constructWorksiteCommandExecutionModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
