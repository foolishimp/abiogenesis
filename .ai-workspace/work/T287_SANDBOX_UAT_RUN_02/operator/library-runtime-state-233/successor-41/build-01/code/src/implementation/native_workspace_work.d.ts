import { type NativeWorkspaceWorkTask } from "../product/native_workspace_work.js";
import type { NativeInstructionAssembly } from "../abg/instruction_assembly.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";
export declare const NATIVE_WORKSPACE_WORK_IMPLEMENTATION_DESCRIPTOR: Readonly<{
    implementationRef: "implementation://abiogenesis/worksite/native-work-fp@5";
    packageName: string;
    packageVersion: string;
    modulePath: string;
    namedSymbol: string;
    computeRegime: "F_P";
    inputContractRef: "contract://abiogenesis/worksite/native-work/task@5";
    outputContractRef: "contract://abiogenesis/worksite/native-work/observation@5";
    failureContractRef: "contract://abiogenesis/worksite/native-work/failure@5";
    refusalContractRef: "contract://abiogenesis/worksite/native-work/refusal@5";
    kind: "packaged_leaf_implementation_descriptor";
    schemaVersion: "5.0.0";
    descriptorDigest: `sha256:${string}`;
}>;
/** Native tools own the internal work. This selected owner observes the declared
 * worksite boundary and returns candidates; it never writes an ABG event. */
export declare function realizeNativeWorkspaceWork(input: Readonly<NativeWorkspaceWorkTask>, occurrence: Readonly<LeafExecutionOccurrence>, prepareAssembly?: () => Readonly<NativeInstructionAssembly>): Promise<Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>>>;
