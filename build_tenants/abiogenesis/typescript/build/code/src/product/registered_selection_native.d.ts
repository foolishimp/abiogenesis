import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
type RecordValue = Readonly<Record<string, JsonValue>>;
export interface NativeRegisteredSelectionTask {
    readonly kind: "registered_selection_task";
    readonly schemaVersion: "5.0.0";
    readonly workerActorRef: string;
    readonly workerBindingRef: string;
    readonly task: string;
    readonly observations: readonly Readonly<{
        observationRef: string;
        qualification: string;
        value: JsonValue;
    }>[];
    readonly requiredSupportRefs: readonly string[];
    readonly childInput: Readonly<{
        contractRef: string;
        value: RecordValue;
    }>;
    readonly maxPromptBytes: number;
}
export interface NativeRegisteredSelectionTarget {
    readonly graphFunctionRef: string;
    readonly definitionDigest: Sha256Digest;
}
export declare function isNativeRegisteredSelectionTask(x: unknown): x is NativeRegisteredSelectionTask;
/** Raw shape validation confers no candidate-domain or execution authority. */
export declare function isNativeRegisteredSelectionResponse(x: unknown): x is RecordValue;
export declare function nativeRegisteredSelectionResponseSchema(task: NativeRegisteredSelectionTask, targets: readonly NativeRegisteredSelectionTarget[]): Readonly<Record<string, JsonValue>>;
/** Pure identity binding shared by implementation completion and ABG admission.
 * Suitability comes only from the observed answer; input bytes are never repaired. */
export declare function materializeNativeRegisteredChoice(task: NativeRegisteredSelectionTask, targets: readonly NativeRegisteredSelectionTarget[], raw: unknown): RecordValue | null;
export {};
