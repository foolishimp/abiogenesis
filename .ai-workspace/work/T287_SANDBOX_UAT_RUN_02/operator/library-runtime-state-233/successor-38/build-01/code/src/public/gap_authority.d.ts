import { type DurablePrefixCoordinate, type EventStoreCloseHandoff, type EventStoreReopenAuthority } from "../abg/event_store.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { ReadyGraphFunctionCatalog, GraphFunctionCatalogView, ProductInstall, ProductSet, ResolvedProductLock, WorkspaceBinding } from "../product/index.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
export interface PublicGapSource {
    readonly sourceInvocationRef: string;
    readonly sourceInvocationAdmissionRef: string;
    readonly sourceRunId: string;
    readonly sourceRouteRef: string;
    readonly sourceRouteDigest: Sha256Digest;
    readonly sourceRouteEventRef: string;
    readonly sourceRunStoppedEventRef: string;
    readonly gapRef: string;
    readonly nextActionProjectionRef: string;
    readonly nextActionProjectionDigest: Sha256Digest;
    readonly nextActionProjection: Readonly<Record<string, JsonValue>>;
}
export interface PublicStartIdentity {
    readonly kind: "public_start_identity";
    readonly schemaVersion: "5.0.0";
    readonly programRef: string;
    readonly graphFunctionRef: string;
    readonly startRef: string;
    readonly scope: "program";
    readonly target: string;
    readonly until: "converged";
    readonly rootMode: "supervised";
}
export interface PublicGapAuthority {
    readonly kind: "public_gap_authority";
    readonly schemaVersion: "5.0.0";
    readonly prefix: DurablePrefixCoordinate;
    readonly reopenAuthority: EventStoreReopenAuthority;
    readonly installInvocationRef: string;
    readonly workspaceBindingInvocationRef: string;
    readonly install: ProductInstall;
    readonly resolvedProductLock: ResolvedProductLock;
    readonly productSet: ProductSet;
    readonly workspaceBinding: WorkspaceBinding;
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogView: GraphFunctionCatalogView;
    readonly publications: readonly Readonly<ModulePublication>[];
    readonly publicStart: PublicStartIdentity;
    readonly source: PublicGapSource;
    readonly authorityDigest: Sha256Digest;
}
type PublicGapAuthorityInput = Omit<PublicGapAuthority, "authorityDigest" | "kind" | "schemaVersion">;
export declare function constructPublicGapAuthority(input: PublicGapAuthorityInput): PublicGapAuthority;
export declare function updatePublicGapAuthority(authority: PublicGapAuthority, handoff: EventStoreCloseHandoff): PublicGapAuthority;
export declare function parsePublicGapAuthority(value: unknown, expectedGapRef?: string): PublicGapAuthority | null;
export {};
