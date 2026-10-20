import * as v from "valibot";
import type { PublishedReleaseOperationArtifact, TappedReleaseSnapshotRequest } from "./release_snapshot_operations.js";
/** Original O/source, never an agent interpretation or a runtime F_H response. */
export declare const RELEASE_OWNER_RULING_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"external_release_owner_ruling", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly owner: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly channel: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly request: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly presentation: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly contentBase64: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly response: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly contentBase64: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly inReplyTo: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
}, undefined>;
export type ReleaseOwnerRuling = v.InferOutput<typeof RELEASE_OWNER_RULING_SCHEMA>;
/** External origin/attribution premise, selected independently by the operator
 * and covered by the existing exact admission approval. Its hash proves only
 * correspondence. The Product neither manufactures nor authenticates humanity. */
export declare const RELEASE_RULING_SOURCE_APPROVAL_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"trusted_operator_ruling_source", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly authority: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly owner: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly channel: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly request: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly ruling: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly presentation: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly response: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>;
export type ReleaseRulingSourceApproval = v.InferOutput<typeof RELEASE_RULING_SOURCE_APPROVAL_SCHEMA>;
export declare function releaseOwnerRulingCoordinate(ruling: ReleaseOwnerRuling): {
    ref: string;
    digest: `sha256:${string}`;
};
export declare function releaseAcceptanceRequest(request: TappedReleaseSnapshotRequest, publication: PublishedReleaseOperationArtifact, owner: ReleaseOwnerRuling["owner"], evidence: readonly ReleaseOwnerRuling["owner"][]): {
    value: {
        kind: string;
        schemaVersion: string;
        owner: {
            ref: string;
            digest: `sha256:${string}`;
        };
        scope: string;
        conditions: string[];
        identity: {
            productId: string;
            namespace: "abiogenesis";
            profile: "one_project_unqualified";
            projectSubtree: ".";
            versionLine: "5.0.0";
            ordinal: number;
            version: string;
            releaseClaim: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
        publication: {
            ref: string;
            digest: `sha256:${string}`;
        };
        predecessor: {
            ref: string;
            digest: `sha256:${string}`;
        } | null;
        publishedCut: {
            sourceCommit: string | null;
            sourceTree: string | null;
            refs: {
                ref: string;
                object: string;
                peeled: string;
            }[];
            snapshotManifest: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            snapshotFiles: {
                path: string;
                digest: `sha256:${string}`;
            }[];
        };
        qualificationBasis: {
            kind: "exact_candidate_qualification";
            projection: "basis";
            schemaVersion: "5.0.0";
            subjectKind: "pre_rc_candidate" | "installed_rc";
            basisRef: string;
            basisDigest: string;
            productId: string;
            productVersion: string;
            sourceInventory: {
                ref: string;
                digest: string;
            };
            artifact: {
                ref: string;
                digest: string;
            };
            productManifest: {
                ref: string;
                digest: string;
            };
            productContentDigest: string;
            toolchain: {
                ref: string;
                digest: string;
            };
            installedProduct: {
                ref: string;
                digest: string;
            } | null;
            workspaceBinding: {
                ref: string;
                digest: string;
            } | null;
            prospectiveRelease: {
                productId: string;
                namespace: string;
                profile: "one_project_unqualified";
                projectSubtree: string;
                versionLine: string;
                ordinal: number;
                version: string;
                releaseClaim: {
                    ref: string;
                    digest: string;
                };
            } | null;
            tenantManifest: {
                ref: string;
                digest: string;
            } | null;
            coverageCatalog: {
                ref: string;
                digest: string;
            } | null;
            lawBasis: {
                ref: string;
                digest: string;
            };
        };
        verdict: {
            ref: string;
            digest: `sha256:${string}`;
        };
        lawBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
        evidence: readonly {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    };
    coordinate: {
        ref: string;
        digest: `sha256:${string}`;
    };
    presentation: string;
};
/** C checks the retained O against its original context. No natural-language J
 * can turn ambiguous/conditional wording into the owner's unconditional grant. */
export declare function resolveReleaseOwnerRuling(request: ReturnType<typeof releaseAcceptanceRequest>, ruling: ReleaseOwnerRuling | null, source: ReleaseRulingSourceApproval | null): "accept" | "withhold" | null;
