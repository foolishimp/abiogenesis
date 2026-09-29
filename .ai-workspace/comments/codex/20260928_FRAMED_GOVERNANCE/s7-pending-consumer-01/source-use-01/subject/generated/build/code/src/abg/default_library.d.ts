import { type FramedSynthesisTask } from "../product/default_library.js";
import { type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { type GovernanceWorkState } from "../product/default_library.js";
import type { JsonValue } from "../shared/canonical_json.js";
export declare function projectGovernanceChoice(basis: NativeInstructionAssemblyBasis, input: unknown): {
    disposition: string;
    graphFunctionRef: string;
    definitionDigest: `sha256:${string}` | undefined;
    input: {
        contractRef: string;
        value: Readonly<Record<string, JsonValue>>;
    };
    kind: string;
    schemaVersion: string;
    reason: string;
    evidenceRefs: string[];
} | {
    evidenceRefs: string[];
    disposition: string;
    missingSupportRefs: string[];
    kind: string;
    schemaVersion: string;
    reason: string;
} | null;
export declare function projectGovernanceSelection(basis: NativeInstructionAssemblyBasis, input: unknown): Promise<FramedSynthesisTask | null>;
export declare function projectGovernanceNativeTask(basis: NativeInstructionAssemblyBasis, input: unknown): Promise<Readonly<import("../product/native_workspace_work.js").NativeWorkspaceWorkTask> | null>;
/** Shared pure task/input relation for preparation admission and observed child provenance. */
export declare function observedGovernanceTaskMatches(state: unknown, task: unknown): boolean;
export declare function projectGovernanceTestingTask(basis: NativeInstructionAssemblyBasis, input: unknown): Promise<import("../product/worksite_command_execution.js").NativeWorksiteCommandExecutionTask | import("../product/worksite_command_execution.js").ObservedWorksiteCommandExecutionTask | null>;
export declare function projectGovernanceFold(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null;
export declare function projectGovernanceParent(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null;
/** Reuses the exact constructed occurrence; admission adds no second definition authentication. */
export declare function governanceResultMatches(basis: NativeInstructionAssemblyBasis, input: unknown, output: unknown): boolean;
