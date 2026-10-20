import type { ContractDeclaration, ModulePublication } from "../gtl/contracts.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ProductInstall } from "./environment.js";
import { type WorksiteContextObservation } from "./worksite_effect.js";
/** Consumer contract and exact observed subject, not a core semantic rubric. */
export interface NativeWorkspaceAssessmentSelection {
    readonly resultContract: ContractDeclaration;
    readonly schemaAsset: {
        readonly productId: string;
        readonly contractId: string;
        readonly bytesBase64: string;
    };
    readonly sources: readonly {
        readonly path: string;
        readonly digest: Sha256Digest;
    }[];
    readonly candidate: {
        readonly path: string;
        readonly digest: Sha256Digest;
    };
    readonly rubric: {
        readonly path: string;
        readonly digest: Sha256Digest;
    };
    readonly producer: {
        readonly resultRef: string;
        readonly resultDigest: Sha256Digest;
        readonly cCallRef: string;
        readonly actorInvocationRef: string;
    };
}
export declare function nativeWorkspaceAssessmentSchema(selection: NativeWorkspaceAssessmentSelection): Readonly<Record<string, JsonValue>> | null;
export declare function nativeWorkspaceAssessmentSubjectMatches(selection: NativeWorkspaceAssessmentSelection, context: WorksiteContextObservation): boolean;
export declare function isNativeWorkspaceAssessmentSelection(value: unknown): value is NativeWorkspaceAssessmentSelection;
/** Schema identity is resolved through the same installed schema_asset convention as catalog application. */
export declare function resolveNativeWorkspaceAssessmentSchema(selection: NativeWorkspaceAssessmentSelection, publications: readonly Readonly<ModulePublication>[], installs: readonly Readonly<ProductInstall>[]): Readonly<Record<string, JsonValue>> | null;
export declare function parseNativeWorkspaceAssessmentResult(schema: Readonly<Record<string, JsonValue>>, text: string): Readonly<Record<string, JsonValue>> | null;
