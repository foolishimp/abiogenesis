import type { GraphTemplate, RegisteredSelectionApplication } from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
type RecordValue = Readonly<Record<string, JsonValue>>;
export declare function isRegisteredGraphChoice(value: unknown): value is RecordValue;
/** Establish declaration applicability before examining any response fields. */
export declare function registeredSelectionAtSource(template: GraphTemplate, source: Readonly<{
    currentNodeRef: string;
    termPath: readonly string[];
}>, contractRef: string): RegisteredSelectionApplication | null;
export type RegisteredSelectionResolution = Readonly<{
    disposition: "selected";
    applicationRef: string;
    nodeRef: string;
    termPath: readonly string[];
    graphFunctionRef: string;
    definitionDigest: Sha256Digest;
    contractRef: string;
    value: RecordValue;
}> | Readonly<{
    disposition: "gap";
    applicationRef: string;
}>;
/** The application and its outgoing fixed workflows own the candidate domain. */
export declare function registeredSelectionTargets(template: GraphTemplate, source: Readonly<{
    currentNodeRef: string;
    termPath: readonly string[];
}>, contractRef: string): {
    application: RegisteredSelectionApplication;
    targets: (import("./contracts.js").GtlNode | undefined)[];
} | null;
/** One structural target/input relation shared by HoG proposal and ABG admission.
 * Definitions are the exact admitted catalogue/Program digest projection. */
export declare function resolveRegisteredSelection(template: GraphTemplate, source: Readonly<{
    currentNodeRef: string;
    termPath: readonly string[];
}>, contractRef: string, value: JsonValue, definitionDigests: Readonly<Record<string, Sha256Digest>>): RegisteredSelectionResolution | null;
export {};
