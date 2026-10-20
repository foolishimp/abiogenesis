import * as v from "valibot";
import { type JsonValue } from "../shared/canonical_json.js";
import { type OwnerContractSourceDeclaration } from "../shared/public_function_contracts.js";
import type { DefinitionCall, ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type ExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type CapabilityGrant } from "./invocation.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import { type AcquiredAbgEventResource } from "../abg/definition_event_resource.js";
export declare const RESOLVED_ADMISSION_AUTHORITY_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"resolved_admission_authority", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly authorityMode: v.LiteralSchema<"trusted_developer", undefined>;
    readonly authority: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.StrictObjectSchema<{
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly authorityMode: v.LiteralSchema<"trusted_developer", undefined>;
        }, undefined>;
    }, undefined>;
    readonly approval: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.StrictObjectSchema<{
            readonly decision: v.LiteralSchema<"allow", undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly requestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly scopeDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>;
}, undefined>;
export type ResolvedAdmissionAuthority = v.InferOutput<typeof RESOLVED_ADMISSION_AUTHORITY_SCHEMA>;
declare const admissionEnvironmentSelectionSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"admission_environment_selection", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly prefix: v.CustomSchema<DurablePrefixCoordinate, v.ErrorMessage<v.CustomIssue> | undefined>;
    readonly workspaceBinding: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>;
export type AdmissionEnvironmentSelection = v.InferOutput<typeof admissionEnvironmentSelectionSchema>;
/** Pure input selection, not an admitted environment or permission. */
export declare function admissionEnvironmentSelection(prefix: DurablePrefixCoordinate, workspaceBinding: AdmissionEnvironmentSelection["workspaceBinding"]): AdmissionEnvironmentSelection;
/** Closed serialized data shape. Environment meaning is established by the
 * admission owner below, never by parsing or a caller-supplied derived body. */
export declare const ADMISSION_CAPABILITY_DATA_SCHEMA: v.StrictObjectSchema<{
    readonly ownerArtifact: v.StrictObjectSchema<{
        readonly request: v.StrictObjectSchema<{
            readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly verified: v.CustomSchema<VerifiedProductArtifact, v.ErrorMessage<v.CustomIssue> | undefined>;
    }, undefined>;
    readonly kind: v.LiteralSchema<"admission_capability_data", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly definition: v.StrictObjectSchema<{
        readonly definitionKey: v.StrictObjectSchema<{
            readonly operationId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly memberKey: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly owner: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>;
    readonly request: v.GenericSchema<JsonValue, JsonValue>;
    readonly resourceScope: v.StrictObjectSchema<{
        readonly resourcesDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly authoritySlots: v.GenericSchema<JsonValue, JsonValue>;
    }, undefined>;
    readonly boundEnvironment: v.NullableSchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"admission_environment_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly prefix: v.CustomSchema<DurablePrefixCoordinate, v.ErrorMessage<v.CustomIssue> | undefined>;
        readonly workspaceBinding: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export type AdmissionCapabilityData = v.InferOutput<typeof ADMISSION_CAPABILITY_DATA_SCHEMA>;
export interface AdmissionCapabilityGrantConstructionBasis {
    readonly kind: "admission_capability_grant_construction_basis";
    /** Native-only: never serialized or reconstructed from coordinate fields. */
    readonly fixedPacket: OwnerContractSourceDeclaration;
    readonly data: AdmissionCapabilityData;
}
export declare const ADMISSION_AUTHORITY_RESOURCE_SCHEMA: v.StrictObjectSchema<{
    readonly basis: v.StrictObjectSchema<{
        readonly ownerArtifact: v.StrictObjectSchema<{
            readonly request: v.StrictObjectSchema<{
                readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
                readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly verified: v.CustomSchema<VerifiedProductArtifact, v.ErrorMessage<v.CustomIssue> | undefined>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"admission_capability_data", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly definition: v.StrictObjectSchema<{
            readonly definitionKey: v.StrictObjectSchema<{
                readonly operationId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly memberKey: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly owner: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
        readonly request: v.GenericSchema<JsonValue, JsonValue>;
        readonly resourceScope: v.StrictObjectSchema<{
            readonly resourcesDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly authoritySlots: v.GenericSchema<JsonValue, JsonValue>;
        }, undefined>;
        readonly boundEnvironment: v.NullableSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"admission_environment_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly prefix: v.CustomSchema<DurablePrefixCoordinate, v.ErrorMessage<v.CustomIssue> | undefined>;
            readonly workspaceBinding: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly authority: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"resolved_admission_authority", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly authorityMode: v.LiteralSchema<"trusted_developer", undefined>;
        readonly authority: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly value: v.StrictObjectSchema<{
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorityMode: v.LiteralSchema<"trusted_developer", undefined>;
            }, undefined>;
        }, undefined>;
        readonly approval: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly value: v.StrictObjectSchema<{
                readonly decision: v.LiteralSchema<"allow", undefined>;
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly requestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly scopeDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
    }, undefined>;
    readonly grants: v.ArraySchema<v.GenericSchema<JsonValue, JsonValue>, undefined>;
}, undefined>;
/** Internal fixed-owner ingress; not a public semantic assertion. */
export declare const admissionAuthorityResourceStructure: v.StrictObjectSchema<{
    readonly basis: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"admission_capability_data", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly definition: v.StrictObjectSchema<{
            readonly definitionKey: v.StrictObjectSchema<{
                readonly operationId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly memberKey: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly owner: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
        readonly ownerArtifact: v.StrictObjectSchema<{
            readonly request: v.StrictObjectSchema<{
                readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
                readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly verified: v.CustomSchema<VerifiedProductArtifact, v.ErrorMessage<v.CustomIssue> | undefined>;
        }, undefined>;
        readonly request: v.GenericSchema<JsonValue, JsonValue>;
        readonly resourceScope: v.StrictObjectSchema<{
            readonly resourcesDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly authoritySlots: v.GenericSchema<JsonValue, JsonValue>;
        }, undefined>;
        readonly boundEnvironment: v.NullableSchema<v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"admission_environment_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly prefix: v.CustomSchema<DurablePrefixCoordinate, v.ErrorMessage<v.CustomIssue> | undefined>;
            readonly workspaceBinding: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly authority: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"resolved_admission_authority", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly authorityMode: v.LiteralSchema<"trusted_developer", undefined>;
        readonly authority: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly value: v.StrictObjectSchema<{
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly authorityMode: v.LiteralSchema<"trusted_developer", undefined>;
            }, undefined>;
        }, undefined>;
        readonly approval: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly value: v.StrictObjectSchema<{
                readonly decision: v.LiteralSchema<"allow", undefined>;
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly requestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly scopeDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
    }, undefined>;
    readonly grants: v.ArraySchema<v.GenericSchema<JsonValue, JsonValue>, undefined>;
}, undefined>;
export interface AdmissionAuthorityResource {
    readonly basis: AdmissionCapabilityData;
    readonly authority: ResolvedAdmissionAuthority;
    readonly grants: readonly CapabilityGrant[];
}
export type AdmissionAuthorizedResources<R> = R & {
    readonly admissionAuthority: AdmissionAuthorityResource;
};
/** Exact request/resource scope. Grant coordinates are the output, not an input. */
export declare function admissionAuthorityScope(data: AdmissionCapabilityData): Readonly<{
    ref: string;
    digest: `sha256:${string}`;
}>;
export declare function admissionAuthoritySlots(slots: unknown): JsonValue;
/** Existing environment owner over one exact selection. Historical release
 * observations authenticate their entry cut; live admission also requires the
 * current extent. Retained acquired coordinates reuse only real owner proof. */
export declare function admitCapabilityEnvironment(value: unknown, acquiredResource?: AcquiredAbgEventResource | null, requireCurrent?: boolean): ExactPrefixWorkspaceEnvironment;
/** Establish/reuse immutable owner bytes; external approval is consumed here. */
export declare function validateAdmissionCapabilityBasis(authorityInput: ResolvedAdmissionAuthority, actorRef: string, capabilityRef: string, basis: AdmissionCapabilityGrantConstructionBasis, acquiredResource?: AcquiredAbgEventResource | null): Promise<Readonly<{
    data: AdmissionCapabilityData;
    authority: ResolvedAdmissionAuthority;
    scope: ReturnType<typeof admissionAuthorityScope>;
    boundEnvironment: ExactPrefixWorkspaceEnvironment | null;
}>>;
/** Native call-local handoff; never serialized or supplied as authority data. */
export type AdmissionDefinitionOwner<P extends OwnerContractSourceDeclaration, R, O> = (call: DefinitionCall<P, R>, boundEnvironment: ExactPrefixWorkspaceEnvironment | null, acquiredResource: AcquiredAbgEventResource | null) => ReturnType<ExactDefinitionCallable<P, R, O>>;
/** Called by one fixed owner. Structural parsing establishes no environment truth. */
export declare function withAdmissionAuthority<P extends OwnerContractSourceDeclaration, R, O>(packet: P, owner: AdmissionDefinitionOwner<P, R, O>): ExactDefinitionCallable<P, AdmissionAuthorizedResources<R>, O>;
export {};
