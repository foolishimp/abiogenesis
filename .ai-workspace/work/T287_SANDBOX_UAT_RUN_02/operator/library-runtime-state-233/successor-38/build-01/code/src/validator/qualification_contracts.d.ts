import * as v from "valibot";
import { type Sha256Digest } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
/** Explicit declared partitions; only admitted J can justify their common meaning. */
declare const qualificationScopeSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_scope", undefined>;
    readonly scopeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly scopeDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_subject_inventory", undefined>;
        readonly inventoryRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly selectedRoots: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly coverage: v.PicklistSchema<["complete_claim", "incomplete"], undefined>;
        readonly members: v.ArraySchema<v.StrictObjectSchema<{
            readonly surfaceRoles: v.ArraySchema<v.PicklistSchema<readonly ["constitutional", "design", "code", "proof", "execution_contract", "public_contract", "manifest", "qualification", "release_claim"], undefined>, undefined>;
            readonly classificationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly ruleGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        groupRef: string;
        ruleRefs: string[];
        sourceRefs: string[];
    }[], 1, undefined>]>;
    readonly surfaceGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly memberRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly rootRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly surfaceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.PicklistSchema<readonly ["constitutional", "design", "code", "proof", "execution_contract", "public_contract", "manifest", "qualification", "release_claim"], undefined>, undefined>, v.MinLengthAction<("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[], 1, undefined>]>;
        readonly ownerRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        groupRef: string;
        memberRefs: string[];
        rootRefs: string[];
        surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
        ownerRefs: string[];
        sourceRefs: string[];
    }[], 1, undefined>]>;
    readonly applicationDomains: v.OptionalSchema<v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleGroupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly rootRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly surfaceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.PicklistSchema<readonly ["constitutional", "design", "code", "proof", "execution_contract", "public_contract", "manifest", "qualification", "release_claim"], undefined>, undefined>, v.MinLengthAction<("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[], 1, undefined>]>;
            readonly ownerRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            groupRef: string;
            memberRefs: string[];
            rootRefs: string[];
            surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
            ownerRefs: string[];
            sourceRefs: string[];
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        ruleGroupRef: string;
        surfaceGroups: {
            groupRef: string;
            memberRefs: string[];
            rootRefs: string[];
            surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
            ownerRefs: string[];
            sourceRefs: string[];
        }[];
    }[], 1, undefined>]>, undefined>;
}, undefined>;
export type QualificationScope = v.InferOutput<typeof qualificationScopeSchema>;
export declare const QUALIFICATION_SCOPE_SCHEMA: v.GenericSchema<QualificationScope>;
/** A proof resource is supplied immutable data; these guards grant no authority. */
export declare const QUALIFICATION_PREFIX_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly storeIdentity: v.StrictObjectSchema<{
        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export declare const QUALIFICATION_NATIVE_BASIS_SCHEMA: v.StrictObjectSchema<{
    readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly predecessorPrefix: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly storeIdentity: v.StrictObjectSchema<{
            readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const QUALIFICATION_MATERIAL_SCHEMA: v.StrictObjectSchema<{
    readonly contentBase64: v.StringSchema<undefined>;
    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
}, undefined>;
export declare const QUALIFICATION_COVERAGE_SCHEMA: v.StrictObjectSchema<{
    readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>;
export declare const QUALIFICATION_ROLE_SCHEMA: v.StrictObjectSchema<{
    readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
}, undefined>;
/** Immutable published role policy. Tasks select it; they cannot mint roles. */
export declare const QUALIFICATION_ROLE_POLICY: Readonly<{
    roleRefs: string[];
    actorRefs: string[];
    workerBindingRef: "worker-binding://abiogenesis/qualification/assessor@5";
    rendererRef: "renderer://abiogenesis/qualification/assessment@5";
    materializationPlanRef: "materialization-plan://abiogenesis/qualification/assessment@5";
    authorityRef: "actor-capability://abiogenesis/qualification/product-owner@5";
    authoritySourceRefs: string[];
}>;
/** Same SemanticAssetSurface shape; no lifecycle/worksite declaration is invented. */
export declare const QUALIFICATION_ASSET_SURFACE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
    readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
        readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
        readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export declare const QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA: v.VariantSchema<"kind", [v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"native_construction", undefined>;
    readonly subjectInventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly producers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        cCallRef: string;
        result: {
            ref: string;
            digest: string;
        };
        actorRef: string;
        workerBindingRef: string;
        scopeRefs: string[];
    }[], 1, undefined>]>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"external_construction", undefined>;
    readonly subjectInventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly recordSet: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly records: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        contentBase64: string;
        ref: string;
        path: string;
        digest: string;
        byteCount: number;
    }[], 1, undefined>]>;
    readonly chains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly preimageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly deltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly closureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly postimageMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly changes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly patchPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly preimageMemberRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly postimageMemberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            patchPath: string;
            preimageMemberRef: string | null;
            postimageMemberRef: string;
        }[], 1, undefined>]>;
        readonly attributionSources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            sourceRef: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        activationRef: string;
        preimageRef: string;
        deltaRef: string;
        closureRef: string;
        authorRef: string;
        actorIdentityRef: string;
        authorityRef: string;
        scopeRefs: string[];
        postimageMembers: {
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[];
        changes: {
            memberRef: string;
            patchPath: string;
            preimageMemberRef: string | null;
            postimageMemberRef: string;
        }[];
        attributionSources: {
            sourceRef: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[], 1, undefined>]>;
    readonly acknowledgmentSelectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>], undefined>;
/** Closed immutable dependencies. These schemas admit data, never runtime authority. */
export declare const QUALIFICATION_DECLARATION_SELECTION_SCHEMA: v.StrictObjectSchema<{
    readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export declare const QUALIFICATION_RESOURCE_ENTRY_KINDS: readonly ["inventory", "scope", "material", "provenance", "law", "tenant_manifest", "coverage_catalog", "verification_recipe"];
export declare const QUALIFICATION_LOCAL_ENTRY_SELECTION_SCHEMA: v.StrictObjectSchema<{
    readonly entryKind: v.PicklistSchema<readonly ["inventory", "scope", "material", "provenance", "law", "tenant_manifest", "coverage_catalog", "verification_recipe"], undefined>;
    readonly entry: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const QUALIFICATION_RESOURCE_SELECTION_SCHEMA: v.StrictObjectSchema<{
    readonly entryKind: v.PicklistSchema<readonly ["inventory", "scope", "material", "provenance", "law", "tenant_manifest", "coverage_catalog", "verification_recipe"], undefined>;
    readonly entry: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const QUALIFICATION_REFERENCE_SET_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_reference_set", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly setRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly setDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly elementKind: v.LiteralSchema<"memberRefs", undefined>;
    readonly encoding: v.LiteralSchema<"member_ordinals", undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly values: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>, v.MinLengthAction<number[], 1, undefined>]>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_reference_set", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly setRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly setDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly elementKind: v.PicklistSchema<["rootRefs", "surfaceRoles", "ownerRefs", "sourceRefs"], undefined>;
    readonly encoding: v.LiteralSchema<"refs", undefined>;
    readonly values: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
}, undefined>], undefined>;
export declare const QUALIFICATION_INTERNED_SCOPE_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly domainMode: v.LiteralSchema<"global", undefined>;
    readonly kind: v.LiteralSchema<"qualification_scope_interned", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly scopeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly scopeDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly ruleGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        groupRef: string;
        ruleRefs: string[];
        sourceRefs: string[];
    }[], 1, undefined>]>;
    readonly surfaceGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly memberSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly rootSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly roleSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly ownerSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly sourceSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        groupRef: string;
        memberSet: {
            ref: string;
            digest: string;
        };
        rootSet: {
            ref: string;
            digest: string;
        };
        roleSet: {
            ref: string;
            digest: string;
        };
        ownerSet: {
            ref: string;
            digest: string;
        };
        sourceSet: {
            ref: string;
            digest: string;
        };
    }[], 1, undefined>]>;
    readonly referenceSets: v.SchemaWithPipe<readonly [v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_reference_set", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly setRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly setDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly elementKind: v.LiteralSchema<"memberRefs", undefined>;
        readonly encoding: v.LiteralSchema<"member_ordinals", undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly values: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>, v.MinLengthAction<number[], 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_reference_set", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly setRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly setDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly elementKind: v.PicklistSchema<["rootRefs", "surfaceRoles", "ownerRefs", "sourceRefs"], undefined>;
        readonly encoding: v.LiteralSchema<"refs", undefined>;
        readonly values: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>], undefined>, undefined>, v.MinLengthAction<({
        kind: "qualification_reference_set";
        schemaVersion: "1";
        setRef: string;
        setDigest: string;
        elementKind: "memberRefs";
        encoding: "member_ordinals";
        inventory: {
            ref: string;
            digest: string;
        };
        values: number[];
    } | {
        kind: "qualification_reference_set";
        schemaVersion: "1";
        setRef: string;
        setDigest: string;
        elementKind: "surfaceRoles" | "rootRefs" | "ownerRefs" | "sourceRefs";
        encoding: "refs";
        values: string[];
    })[], 1, undefined>]>;
}, undefined>, v.StrictObjectSchema<{
    readonly domainMode: v.LiteralSchema<"per_rule", undefined>;
    readonly applicationDomains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleGroupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly rootSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly roleSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly ownerSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly sourceSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            groupRef: string;
            memberSet: {
                ref: string;
                digest: string;
            };
            rootSet: {
                ref: string;
                digest: string;
            };
            roleSet: {
                ref: string;
                digest: string;
            };
            ownerSet: {
                ref: string;
                digest: string;
            };
            sourceSet: {
                ref: string;
                digest: string;
            };
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        ruleGroupRef: string;
        surfaceGroups: {
            groupRef: string;
            memberSet: {
                ref: string;
                digest: string;
            };
            rootSet: {
                ref: string;
                digest: string;
            };
            roleSet: {
                ref: string;
                digest: string;
            };
            ownerSet: {
                ref: string;
                digest: string;
            };
            sourceSet: {
                ref: string;
                digest: string;
            };
        }[];
    }[], 1, undefined>]>;
    readonly kind: v.LiteralSchema<"qualification_scope_interned", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly scopeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly scopeDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly ruleGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        groupRef: string;
        ruleRefs: string[];
        sourceRefs: string[];
    }[], 1, undefined>]>;
    readonly surfaceGroups: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly groupRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly memberSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly rootSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly roleSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly ownerSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly sourceSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        groupRef: string;
        memberSet: {
            ref: string;
            digest: string;
        };
        rootSet: {
            ref: string;
            digest: string;
        };
        roleSet: {
            ref: string;
            digest: string;
        };
        ownerSet: {
            ref: string;
            digest: string;
        };
        sourceSet: {
            ref: string;
            digest: string;
        };
    }[], 1, undefined>]>;
    readonly referenceSets: v.SchemaWithPipe<readonly [v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_reference_set", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly setRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly setDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly elementKind: v.LiteralSchema<"memberRefs", undefined>;
        readonly encoding: v.LiteralSchema<"member_ordinals", undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly values: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>, v.MinLengthAction<number[], 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_reference_set", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly setRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly setDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly elementKind: v.PicklistSchema<["rootRefs", "surfaceRoles", "ownerRefs", "sourceRefs"], undefined>;
        readonly encoding: v.LiteralSchema<"refs", undefined>;
        readonly values: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>], undefined>, undefined>, v.MinLengthAction<({
        kind: "qualification_reference_set";
        schemaVersion: "1";
        setRef: string;
        setDigest: string;
        elementKind: "memberRefs";
        encoding: "member_ordinals";
        inventory: {
            ref: string;
            digest: string;
        };
        values: number[];
    } | {
        kind: "qualification_reference_set";
        schemaVersion: "1";
        setRef: string;
        setDigest: string;
        elementKind: "surfaceRoles" | "rootRefs" | "ownerRefs" | "sourceRefs";
        encoding: "refs";
        values: string[];
    })[], 1, undefined>]>;
}, undefined>], undefined>;
export declare const QUALIFICATION_RESOURCE_MANIFEST_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_resource_manifest", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly resourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly resourceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly entries: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly entryKind: v.PicklistSchema<readonly ["inventory", "scope", "material", "provenance", "law", "tenant_manifest", "coverage_catalog", "verification_recipe"], undefined>;
        readonly coordinate: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly value: v.GenericSchema<JsonValue, JsonValue>;
    }, undefined>, undefined>, v.MinLengthAction<{
        entryKind: "scope" | "provenance" | "inventory" | "material" | "law" | "tenant_manifest" | "coverage_catalog" | "verification_recipe";
        coordinate: {
            ref: string;
            digest: string;
        };
        value: JsonValue;
    }[], 1, undefined>]>;
    readonly declarationSelections: v.ArraySchema<v.StrictObjectSchema<{
        readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
}, undefined>;
export declare const QUALIFICATION_RESOURCE_ASSERTION_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_resource_assertion", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly manifests: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_resource_manifest", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly resourceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly catalog: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly entries: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly entryKind: v.PicklistSchema<readonly ["inventory", "scope", "material", "provenance", "law", "tenant_manifest", "coverage_catalog", "verification_recipe"], undefined>;
            readonly coordinate: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly value: v.GenericSchema<JsonValue, JsonValue>;
        }, undefined>, undefined>, v.MinLengthAction<{
            entryKind: "scope" | "provenance" | "inventory" | "material" | "law" | "tenant_manifest" | "coverage_catalog" | "verification_recipe";
            coordinate: {
                ref: string;
                digest: string;
            };
            value: JsonValue;
        }[], 1, undefined>]>;
        readonly declarationSelections: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        kind: "qualification_resource_manifest";
        schemaVersion: "1";
        resourceRef: string;
        resourceDigest: string;
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        catalog: {
            ref: string;
            digest: string;
        };
        inventory: {
            ref: string;
            digest: string;
        };
        entries: {
            entryKind: "scope" | "provenance" | "inventory" | "material" | "law" | "tenant_manifest" | "coverage_catalog" | "verification_recipe";
            coordinate: {
                ref: string;
                digest: string;
            };
            value: JsonValue;
        }[];
        declarationSelections: {
            catalogBasisDigest: string;
            readinessBasisDigest: string;
            viewDigest: string;
            proofDigest: string;
        }[];
    }[], 1, undefined>]>;
    readonly declarationProofs: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
}, undefined>;
export declare const QUALIFICATION_RESOURCE_PROVENANCE_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"native_construction", undefined>;
    readonly subjectInventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly producers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        cCallRef: string;
        result: {
            ref: string;
            digest: string;
        };
        actorRef: string;
        workerBindingRef: string;
        scopeRefs: string[];
    }[], 1, undefined>]>;
}, undefined>, v.StrictObjectSchema<{
    readonly records: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"material", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        entryKind: "material";
        entry: {
            ref: string;
            digest: string;
        };
    }[], 1, undefined>]>;
    readonly kind: v.LiteralSchema<"external_construction", undefined>;
    readonly subjectInventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly recordSet: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly chains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly preimageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly deltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly closureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly postimageMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly changes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly patchPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly preimageMemberRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly postimageMemberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            patchPath: string;
            preimageMemberRef: string | null;
            postimageMemberRef: string;
        }[], 1, undefined>]>;
        readonly attributionSources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            sourceRef: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        activationRef: string;
        preimageRef: string;
        deltaRef: string;
        closureRef: string;
        authorRef: string;
        actorIdentityRef: string;
        authorityRef: string;
        scopeRefs: string[];
        postimageMembers: {
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[];
        changes: {
            memberRef: string;
            patchPath: string;
            preimageMemberRef: string | null;
            postimageMemberRef: string;
        }[];
        attributionSources: {
            sourceRef: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[], 1, undefined>]>;
    readonly acknowledgmentSelectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>], undefined>;
export type QualificationResourceAssertion = v.InferOutput<typeof QUALIFICATION_RESOURCE_ASSERTION_SCHEMA>;
export type QualificationResourceManifest = v.InferOutput<typeof QUALIFICATION_RESOURCE_MANIFEST_SCHEMA>;
export type QualificationResourceSelection = v.InferOutput<typeof QUALIFICATION_RESOURCE_SELECTION_SCHEMA>;
export type QualificationDeclarationSelection = v.InferOutput<typeof QUALIFICATION_DECLARATION_SELECTION_SCHEMA>;
export type QualificationInternedScope = v.InferOutput<typeof QUALIFICATION_INTERNED_SCOPE_SCHEMA>;
export type QualificationReferenceSet = v.InferOutput<typeof QUALIFICATION_REFERENCE_SET_SCHEMA>;
/** Slot keys predate the producing occurrence. CCall/result identity is never a slot. */
export declare const QUALIFICATION_EMBEDDED_TASK_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly scope: v.OptionalSchema<v.GenericSchema<{
        kind: "qualification_scope";
        scopeRef: string;
        scopeDigest: string;
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        catalog: {
            ref: string;
            digest: string;
        };
        inventory: {
            kind: "qualification_subject_inventory";
            inventoryRef: string;
            inventoryDigest: string;
            selectedRoots: string[];
            coverage: "complete_claim" | "incomplete";
            members: {
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                classificationEvidenceRefs: string[];
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[];
        };
        ruleGroups: {
            groupRef: string;
            ruleRefs: string[];
            sourceRefs: string[];
        }[];
        surfaceGroups: {
            groupRef: string;
            memberRefs: string[];
            rootRefs: string[];
            surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
            ownerRefs: string[];
            sourceRefs: string[];
        }[];
        applicationDomains?: {
            ruleGroupRef: string;
            surfaceGroups: {
                groupRef: string;
                memberRefs: string[];
                rootRefs: string[];
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                ownerRefs: string[];
                sourceRefs: string[];
            }[];
        }[] | undefined;
    }>, undefined>;
    readonly role: v.StrictObjectSchema<{
        readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
    }, undefined>;
    readonly context: v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    readonly assetSurface: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
        readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
            readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
            readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly material: v.ArraySchema<v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        ref: string;
        path: string;
        digest: string;
        byteCount: number;
    }[], 1, undefined>]>;
    readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        criterionRef: string;
        ruleRef: string;
        surfaceRef: string;
        evidenceRole: string;
    }[], 1, undefined>]>;
    readonly provenance: v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"native_construction", undefined>;
        readonly subjectInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly producers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            cCallRef: string;
            result: {
                ref: string;
                digest: string;
            };
            actorRef: string;
            workerBindingRef: string;
            scopeRefs: string[];
        }[], 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"external_construction", undefined>;
        readonly subjectInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly recordSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly records: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            contentBase64: string;
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly chains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly preimageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly deltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly closureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly postimageMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[], 1, undefined>]>;
            readonly changes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly patchPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly preimageMemberRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly postimageMemberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                memberRef: string;
                patchPath: string;
                preimageMemberRef: string | null;
                postimageMemberRef: string;
            }[], 1, undefined>]>;
            readonly attributionSources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                sourceRef: string;
                startByte: number;
                endByte: number;
                spanDigest: string;
            }[], 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            activationRef: string;
            preimageRef: string;
            deltaRef: string;
            closureRef: string;
            authorRef: string;
            actorIdentityRef: string;
            authorityRef: string;
            scopeRefs: string[];
            postimageMembers: {
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[];
            changes: {
                memberRef: string;
                patchPath: string;
                preimageMemberRef: string | null;
                postimageMemberRef: string;
            }[];
            attributionSources: {
                sourceRef: string;
                startByte: number;
                endByte: number;
                spanDigest: string;
            }[];
        }[], 1, undefined>]>;
        readonly acknowledgmentSelectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>], undefined>;
    readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export declare const QUALIFICATION_REFERENCE_TASK_SCHEMA: v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly scope: v.OptionalSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"scope", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
        readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly material: v.ArraySchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"material", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly provenance: v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"provenance", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly role: v.StrictObjectSchema<{
        readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
    }, undefined>;
    readonly context: v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly assetSurface: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
        readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
            readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
            readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        ref: string;
        path: string;
        digest: string;
        byteCount: number;
    }[], 1, undefined>]>;
    readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        criterionRef: string;
        ruleRef: string;
        surfaceRef: string;
        evidenceRole: string;
    }[], 1, undefined>]>;
    readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export declare const QUALIFICATION_ASSESSMENT_TASK_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly scope: v.OptionalSchema<v.GenericSchema<{
        kind: "qualification_scope";
        scopeRef: string;
        scopeDigest: string;
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        catalog: {
            ref: string;
            digest: string;
        };
        inventory: {
            kind: "qualification_subject_inventory";
            inventoryRef: string;
            inventoryDigest: string;
            selectedRoots: string[];
            coverage: "complete_claim" | "incomplete";
            members: {
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                classificationEvidenceRefs: string[];
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[];
        };
        ruleGroups: {
            groupRef: string;
            ruleRefs: string[];
            sourceRefs: string[];
        }[];
        surfaceGroups: {
            groupRef: string;
            memberRefs: string[];
            rootRefs: string[];
            surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
            ownerRefs: string[];
            sourceRefs: string[];
        }[];
        applicationDomains?: {
            ruleGroupRef: string;
            surfaceGroups: {
                groupRef: string;
                memberRefs: string[];
                rootRefs: string[];
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                ownerRefs: string[];
                sourceRefs: string[];
            }[];
        }[] | undefined;
    }>, undefined>;
    readonly role: v.StrictObjectSchema<{
        readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
    }, undefined>;
    readonly context: v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    readonly assetSurface: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
        readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
            readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
            readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly material: v.ArraySchema<v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        ref: string;
        path: string;
        digest: string;
        byteCount: number;
    }[], 1, undefined>]>;
    readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        criterionRef: string;
        ruleRef: string;
        surfaceRef: string;
        evidenceRole: string;
    }[], 1, undefined>]>;
    readonly provenance: v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"native_construction", undefined>;
        readonly subjectInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly producers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            cCallRef: string;
            result: {
                ref: string;
                digest: string;
            };
            actorRef: string;
            workerBindingRef: string;
            scopeRefs: string[];
        }[], 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"external_construction", undefined>;
        readonly subjectInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly recordSet: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly records: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            contentBase64: string;
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly chains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly preimageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly deltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly closureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly postimageMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[], 1, undefined>]>;
            readonly changes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly patchPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly preimageMemberRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly postimageMemberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                memberRef: string;
                patchPath: string;
                preimageMemberRef: string | null;
                postimageMemberRef: string;
            }[], 1, undefined>]>;
            readonly attributionSources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                sourceRef: string;
                startByte: number;
                endByte: number;
                spanDigest: string;
            }[], 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            activationRef: string;
            preimageRef: string;
            deltaRef: string;
            closureRef: string;
            authorRef: string;
            actorIdentityRef: string;
            authorityRef: string;
            scopeRefs: string[];
            postimageMembers: {
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[];
            changes: {
                memberRef: string;
                patchPath: string;
                preimageMemberRef: string | null;
                postimageMemberRef: string;
            }[];
            attributionSources: {
                sourceRef: string;
                startByte: number;
                endByte: number;
                spanDigest: string;
            }[];
        }[], 1, undefined>]>;
        readonly acknowledgmentSelectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>], undefined>;
    readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly scope: v.OptionalSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"scope", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
        readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly material: v.ArraySchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"material", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly provenance: v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"provenance", undefined>;
        readonly entry: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly catalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly role: v.StrictObjectSchema<{
        readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
    }, undefined>;
    readonly context: v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly assetSurface: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
        readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
            readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
            readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        ref: string;
        path: string;
        digest: string;
        byteCount: number;
    }[], 1, undefined>]>;
    readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        criterionRef: string;
        ruleRef: string;
        surfaceRef: string;
        evidenceRole: string;
    }[], 1, undefined>]>;
    readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>], undefined>;
export type QualificationEmbeddedTask = v.InferOutput<typeof QUALIFICATION_EMBEDDED_TASK_SCHEMA>;
export type QualificationReferenceTask = v.InferOutput<typeof QUALIFICATION_REFERENCE_TASK_SCHEMA>;
export declare const QUALIFICATION_ASSESSMENT_PLAN_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_assessment_plan", undefined>;
    readonly planRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly planDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly slots: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly task: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly role: v.StrictObjectSchema<{
            readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
        }, undefined>;
        readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        slotRef: string;
        task: {
            ref: string;
            digest: string;
        };
        taskOrdinal: number;
        graphFunctionRef: string;
        programLocusRef: string;
        role: {
            roleRef: string;
            authorityRef: string;
            sourceBindings: {
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[];
            actorRef: string;
            workerBindingRef: string;
            rendererRef: string;
            materializationPlanRef: string;
            independence: "not_required" | "author_distinct" | "author_and_peer_distinct";
        };
        coverage: {
            criterionRef: string;
            ruleRef: string;
            surfaceRef: string;
            evidenceRole: string;
        }[];
    }[], 1, undefined>]>;
    readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
        readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly sharedCoverage: v.PicklistSchema<["disjoint", "declared_independent_peers"], undefined>;
    readonly ownerAuthorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly ownerActorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>;
export declare const QUALIFICATION_RAW_JUDGMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_raw_judgment", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly criteria: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly disposition: v.PicklistSchema<["satisfied", "falsified", "indeterminate"], undefined>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly grouping: v.OptionalSchema<v.PicklistSchema<["justified", "falsified", "unknown"], undefined>, undefined>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        disposition: "satisfied" | "falsified" | "indeterminate";
        applicability: "unknown" | "applicable" | "inapplicable";
        grouping?: "unknown" | "falsified" | "justified" | undefined;
        reason: string;
        sourceRefs: string[];
        evidenceRefs: string[];
        residuals: string[];
        criterionRef: string;
        ruleRef: string;
        surfaceRef: string;
        evidenceRole: string;
    }[], 1, undefined>]>;
    readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly attributions: v.ArraySchema<v.StrictObjectSchema<{
        readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly disposition: v.PicklistSchema<["established", "disputed", "insufficient"], undefined>;
        readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
}, undefined>;
export declare const QUALIFICATION_ASSESSMENT_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_assessment_input", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly task: v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly catalog: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly scope: v.OptionalSchema<v.GenericSchema<{
            kind: "qualification_scope";
            scopeRef: string;
            scopeDigest: string;
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            catalog: {
                ref: string;
                digest: string;
            };
            inventory: {
                kind: "qualification_subject_inventory";
                inventoryRef: string;
                inventoryDigest: string;
                selectedRoots: string[];
                coverage: "complete_claim" | "incomplete";
                members: {
                    surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                    classificationEvidenceRefs: string[];
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
            };
            ruleGroups: {
                groupRef: string;
                ruleRefs: string[];
                sourceRefs: string[];
            }[];
            surfaceGroups: {
                groupRef: string;
                memberRefs: string[];
                rootRefs: string[];
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                ownerRefs: string[];
                sourceRefs: string[];
            }[];
            applicationDomains?: {
                ruleGroupRef: string;
                surfaceGroups: {
                    groupRef: string;
                    memberRefs: string[];
                    rootRefs: string[];
                    surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                    ownerRefs: string[];
                    sourceRefs: string[];
                }[];
            }[] | undefined;
        }>, undefined>;
        readonly role: v.StrictObjectSchema<{
            readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
        }, undefined>;
        readonly context: v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                memberRef: string;
                path: string;
                byteCount: number;
                digest: string;
            }[], 1, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        readonly assetSurface: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
            readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
                readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
                readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly material: v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            criterionRef: string;
            ruleRef: string;
            surfaceRef: string;
            evidenceRole: string;
        }[], 1, undefined>]>;
        readonly provenance: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"native_construction", undefined>;
            readonly subjectInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly producers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>, v.MinLengthAction<{
                cCallRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
                actorRef: string;
                workerBindingRef: string;
                scopeRefs: string[];
            }[], 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"external_construction", undefined>;
            readonly subjectInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly recordSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly records: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly contentBase64: v.StringSchema<undefined>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                contentBase64: string;
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[], 1, undefined>]>;
            readonly chains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly preimageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly deltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly closureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly postimageMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[], 1, undefined>]>;
                readonly changes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly patchPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly preimageMemberRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                    readonly postimageMemberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    memberRef: string;
                    patchPath: string;
                    preimageMemberRef: string | null;
                    postimageMemberRef: string;
                }[], 1, undefined>]>;
                readonly attributionSources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    sourceRef: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[], 1, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                activationRef: string;
                preimageRef: string;
                deltaRef: string;
                closureRef: string;
                authorRef: string;
                actorIdentityRef: string;
                authorityRef: string;
                scopeRefs: string[];
                postimageMembers: {
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
                changes: {
                    memberRef: string;
                    patchPath: string;
                    preimageMemberRef: string | null;
                    postimageMemberRef: string;
                }[];
                attributionSources: {
                    sourceRef: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[], 1, undefined>]>;
            readonly acknowledgmentSelectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>], undefined>;
        readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly scope: v.OptionalSchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"scope", undefined>;
            readonly entry: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly material: v.ArraySchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"material", undefined>;
            readonly entry: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly provenance: v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"provenance", undefined>;
            readonly entry: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly catalog: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly role: v.StrictObjectSchema<{
            readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
        }, undefined>;
        readonly context: v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                memberRef: string;
                path: string;
                byteCount: number;
                digest: string;
            }[], 1, undefined>]>;
        }, undefined>;
        readonly assetSurface: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
            readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
                readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
                readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            criterionRef: string;
            ruleRef: string;
            surfaceRef: string;
            evidenceRole: string;
        }[], 1, undefined>]>;
        readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>], undefined>;
    readonly plan: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment_plan", undefined>;
        readonly planRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly planDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly slots: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly task: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly role: v.StrictObjectSchema<{
                readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                }, undefined>, undefined>;
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
            }, undefined>;
            readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
                readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            taskOrdinal: number;
            graphFunctionRef: string;
            programLocusRef: string;
            role: {
                roleRef: string;
                authorityRef: string;
                sourceBindings: {
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
                actorRef: string;
                workerBindingRef: string;
                rendererRef: string;
                materializationPlanRef: string;
                independence: "not_required" | "author_distinct" | "author_and_peer_distinct";
            };
            coverage: {
                criterionRef: string;
                ruleRef: string;
                surfaceRef: string;
                evidenceRole: string;
            }[];
        }[], 1, undefined>]>;
        readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
        readonly sharedCoverage: v.PicklistSchema<["disjoint", "declared_independent_peers"], undefined>;
        readonly ownerAuthorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ownerActorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const QUALIFICATION_JUDGMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_judgment", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly judgmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly task: v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly catalog: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly scope: v.OptionalSchema<v.GenericSchema<{
            kind: "qualification_scope";
            scopeRef: string;
            scopeDigest: string;
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            catalog: {
                ref: string;
                digest: string;
            };
            inventory: {
                kind: "qualification_subject_inventory";
                inventoryRef: string;
                inventoryDigest: string;
                selectedRoots: string[];
                coverage: "complete_claim" | "incomplete";
                members: {
                    surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                    classificationEvidenceRefs: string[];
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
            };
            ruleGroups: {
                groupRef: string;
                ruleRefs: string[];
                sourceRefs: string[];
            }[];
            surfaceGroups: {
                groupRef: string;
                memberRefs: string[];
                rootRefs: string[];
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                ownerRefs: string[];
                sourceRefs: string[];
            }[];
            applicationDomains?: {
                ruleGroupRef: string;
                surfaceGroups: {
                    groupRef: string;
                    memberRefs: string[];
                    rootRefs: string[];
                    surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                    ownerRefs: string[];
                    sourceRefs: string[];
                }[];
            }[] | undefined;
        }>, undefined>;
        readonly role: v.StrictObjectSchema<{
            readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
        }, undefined>;
        readonly context: v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                memberRef: string;
                path: string;
                byteCount: number;
                digest: string;
            }[], 1, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        readonly assetSurface: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
            readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
                readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
                readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly material: v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            criterionRef: string;
            ruleRef: string;
            surfaceRef: string;
            evidenceRole: string;
        }[], 1, undefined>]>;
        readonly provenance: v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"native_construction", undefined>;
            readonly subjectInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly producers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>, v.MinLengthAction<{
                cCallRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
                actorRef: string;
                workerBindingRef: string;
                scopeRefs: string[];
            }[], 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"external_construction", undefined>;
            readonly subjectInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly recordSet: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly records: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly contentBase64: v.StringSchema<undefined>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                contentBase64: string;
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[], 1, undefined>]>;
            readonly chains: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly preimageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly deltaRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly closureRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                readonly postimageMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[], 1, undefined>]>;
                readonly changes: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly patchPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly preimageMemberRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
                    readonly postimageMemberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    memberRef: string;
                    patchPath: string;
                    preimageMemberRef: string | null;
                    postimageMemberRef: string;
                }[], 1, undefined>]>;
                readonly attributionSources: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>, v.MinLengthAction<{
                    sourceRef: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[], 1, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                activationRef: string;
                preimageRef: string;
                deltaRef: string;
                closureRef: string;
                authorRef: string;
                actorIdentityRef: string;
                authorityRef: string;
                scopeRefs: string[];
                postimageMembers: {
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
                changes: {
                    memberRef: string;
                    patchPath: string;
                    preimageMemberRef: string | null;
                    postimageMemberRef: string;
                }[];
                attributionSources: {
                    sourceRef: string;
                    startByte: number;
                    endByte: number;
                    spanDigest: string;
                }[];
            }[], 1, undefined>]>;
            readonly acknowledgmentSelectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>], undefined>;
        readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly scope: v.OptionalSchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"scope", undefined>;
            readonly entry: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly material: v.ArraySchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"material", undefined>;
            readonly entry: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly provenance: v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"provenance", undefined>;
            readonly entry: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly kind: v.LiteralSchema<"qualification_resource_selection", undefined>;
            readonly schemaVersion: v.LiteralSchema<"1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly kind: v.LiteralSchema<"qualification_assessment_task", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly taskRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly catalog: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly role: v.StrictObjectSchema<{
            readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
        }, undefined>;
        readonly context: v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceLocator: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                memberRef: string;
                path: string;
                byteCount: number;
                digest: string;
            }[], 1, undefined>]>;
        }, undefined>;
        readonly assetSurface: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_assessment", undefined>;
            readonly requiredContexts: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly standardsRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly outputContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly constructorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly proofObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly authoritySlots: v.ArraySchema<v.StrictObjectSchema<{
                readonly authorityKindRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly disposition: v.PicklistSchema<["normal", "bounded_fallback", "forbidden_routine"], undefined>;
                readonly fallbackPreconditionRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly subjectMembers: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            path: string;
            digest: string;
            byteCount: number;
        }[], 1, undefined>]>;
        readonly coverage: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            criterionRef: string;
            ruleRef: string;
            surfaceRef: string;
            evidenceRole: string;
        }[], 1, undefined>]>;
        readonly priorEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>], undefined>;
    readonly plan: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_assessment_plan", undefined>;
        readonly planRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly planDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly slots: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly task: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly taskOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly role: v.StrictObjectSchema<{
                readonly roleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceBindings: v.ArraySchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                }, undefined>, undefined>;
                readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly rendererRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly materializationPlanRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly independence: v.PicklistSchema<["author_distinct", "author_and_peer_distinct", "not_required"], undefined>;
            }, undefined>;
            readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
                readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            taskOrdinal: number;
            graphFunctionRef: string;
            programLocusRef: string;
            role: {
                roleRef: string;
                authorityRef: string;
                sourceBindings: {
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
                actorRef: string;
                workerBindingRef: string;
                rendererRef: string;
                materializationPlanRef: string;
                independence: "not_required" | "author_distinct" | "author_and_peer_distinct";
            };
            coverage: {
                criterionRef: string;
                ruleRef: string;
                surfaceRef: string;
                evidenceRole: string;
            }[];
        }[], 1, undefined>]>;
        readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
        readonly sharedCoverage: v.PicklistSchema<["disjoint", "declared_independent_peers"], undefined>;
        readonly ownerAuthorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ownerActorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly raw: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_raw_judgment", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly criteria: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly disposition: v.PicklistSchema<["satisfied", "falsified", "indeterminate"], undefined>;
            readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
            readonly grouping: v.OptionalSchema<v.PicklistSchema<["justified", "falsified", "unknown"], undefined>, undefined>;
            readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly criterionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly evidenceRole: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            disposition: "satisfied" | "falsified" | "indeterminate";
            applicability: "unknown" | "applicable" | "inapplicable";
            grouping?: "unknown" | "falsified" | "justified" | undefined;
            reason: string;
            sourceRefs: string[];
            evidenceRefs: string[];
            residuals: string[];
            criterionRef: string;
            ruleRef: string;
            surfaceRef: string;
            evidenceRole: string;
        }[], 1, undefined>]>;
        readonly residuals: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly attributions: v.ArraySchema<v.StrictObjectSchema<{
            readonly activationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly disposition: v.PicklistSchema<["established", "disputed", "insufficient"], undefined>;
            readonly sourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly nativeBasis: v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly predecessorPrefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly source: v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly workerBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actorInvocationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly transportBindingRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly transportBindingDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly requestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly observationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly promptDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly rawValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const QUALIFICATION_RULING_REQUEST_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_ruling_request", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly requestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly requestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly decision: v.PicklistSchema<["external_attribution", "bounded_exclusion", "lawful_reentry"], undefined>;
    readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    readonly scopeRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    readonly recordSet: v.NullableSchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly attributedIdentities: v.ArraySchema<v.StrictObjectSchema<{
        readonly authorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actorIdentityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly retainedObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export declare const QUALIFICATION_OWNER_RULING_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_owner_ruling", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly request: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly disposition: v.PicklistSchema<["acknowledged", "disputed", "insufficient", "accepted_reentry", "justified_exclusion"], undefined>;
    readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly retainedObligationRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export declare const QUALIFICATION_SELECTION_SCHEMA: v.VariantSchema<"kind", [v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
    readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly task: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly result: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
    readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly request: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"execution_selection", undefined>;
    readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly result: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly source: v.OptionalSchema<v.StrictObjectSchema<{
        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly cCall: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly graphFunction: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
    readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly result: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
    readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly result: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>], undefined>;
export declare const QUALIFICATION_EMBEDDED_PROOF_RESOURCE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly prefix: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly storeIdentity: v.StrictObjectSchema<{
            readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly task: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly request: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"execution_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly source: v.OptionalSchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly cCall: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>], undefined>, undefined>;
    readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basis: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
            readonly projection: v.LiteralSchema<"basis", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly artifact: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productManifest: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly toolchain: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
            readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    }, undefined>, undefined>, undefined>;
}, undefined>;
export declare const QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA: v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
        readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basis: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
            readonly projection: v.LiteralSchema<"basis", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly artifact: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productManifest: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly toolchain: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
            readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>, undefined>;
    readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly prefix: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly storeIdentity: v.StrictObjectSchema<{
            readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly task: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly request: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"execution_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly source: v.OptionalSchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly cCall: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>], undefined>, undefined>;
}, undefined>;
export declare const QUALIFICATION_PROOF_RESOURCE_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly prefix: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly storeIdentity: v.StrictObjectSchema<{
            readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly task: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly request: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"execution_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly source: v.OptionalSchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly cCall: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>], undefined>, undefined>;
    readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basis: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
            readonly projection: v.LiteralSchema<"basis", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly artifact: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productManifest: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly toolchain: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
            readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    }, undefined>, undefined>, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
        readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
        readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basis: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
            readonly projection: v.LiteralSchema<"basis", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly artifact: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productManifest: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly toolchain: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
            readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>, undefined>;
    readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly prefix: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly storeIdentity: v.StrictObjectSchema<{
            readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly task: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly request: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"execution_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly source: v.OptionalSchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly cCall: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
        readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>], undefined>, undefined>;
}, undefined>], undefined>;
export type QualificationEmbeddedProofResource = v.InferOutput<typeof QUALIFICATION_EMBEDDED_PROOF_RESOURCE_SCHEMA>;
export type QualificationReferenceProofResource = v.InferOutput<typeof QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA>;
/** Coverage is source-linked claim data, never an executable roster. One
 * authenticated execution may support several independently assessed claims. */
export declare const QUALIFICATION_COVERAGE_CATALOG_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_coverage_catalog", undefined>;
    readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly authoritySources: v.ArraySchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly claims: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly coverageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly requirementRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly behaviors: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly evidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        coverageRef: string;
        requirementRefs: string[];
        behaviors: string[];
        evidenceRoles: string[];
    }[], 1, undefined>]>;
}, undefined>;
/** Declared finite cases are gate data, not a built-in pass oracle. */
export declare const MALFORMED_GTL_CASE_SCHEMA: v.VariantSchema<"operation", [v.StrictObjectSchema<{
    readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly operation: v.LiteralSchema<"raw", undefined>;
    readonly subjectKind: v.PicklistSchema<readonly ["module_publication", "catalog_contribution", "gtl_program", "graph_function", "gtl_graph", "c_program_term", "contract_declaration", "implementation_binding", "closure_contract", "invocation_input", "public_operation_request", "conformance_evaluate_packet"], undefined>;
    readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly value: v.GenericSchema<JsonValue, JsonValue>;
    readonly expected: v.StrictObjectSchema<{
        readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
        readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
        readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
            readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly operation: v.LiteralSchema<"program", undefined>;
    readonly publication: v.GenericSchema<JsonValue, JsonValue>;
    readonly program: v.GenericSchema<JsonValue, JsonValue>;
    readonly expected: v.StrictObjectSchema<{
        readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
        readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
        readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
            readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>;
}, undefined>], undefined>;
export declare const MALFORMED_GTL_ASSESSMENT_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"malformed_gtl_assessment_input", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly basis: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
        readonly projection: v.LiteralSchema<"basis", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
        readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly artifact: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productManifest: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly toolchain: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
            readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
            readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly releaseClaim: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly coverage: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_coverage_catalog", undefined>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly authoritySources: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly claims: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly coverageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly requirementRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly behaviors: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly evidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            coverageRef: string;
            requirementRefs: string[];
            behaviors: string[];
            evidenceRoles: string[];
        }[], 1, undefined>]>;
    }, undefined>;
    readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
    readonly cases: v.SchemaWithPipe<readonly [v.ArraySchema<v.VariantSchema<"operation", [v.StrictObjectSchema<{
        readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly operation: v.LiteralSchema<"raw", undefined>;
        readonly subjectKind: v.PicklistSchema<readonly ["module_publication", "catalog_contribution", "gtl_program", "graph_function", "gtl_graph", "c_program_term", "contract_declaration", "implementation_binding", "closure_contract", "invocation_input", "public_operation_request", "conformance_evaluate_packet"], undefined>;
        readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly value: v.GenericSchema<JsonValue, JsonValue>;
        readonly expected: v.StrictObjectSchema<{
            readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
            readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
            readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
                readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly operation: v.LiteralSchema<"program", undefined>;
        readonly publication: v.GenericSchema<JsonValue, JsonValue>;
        readonly program: v.GenericSchema<JsonValue, JsonValue>;
        readonly expected: v.StrictObjectSchema<{
            readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
            readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
            readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
                readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>;
    }, undefined>], undefined>, undefined>, v.MinLengthAction<({
        caseRef: string;
        operation: "raw";
        subjectKind: "graph_function" | "module_publication" | "catalog_contribution" | "gtl_program" | "implementation_binding" | "closure_contract" | "conformance_evaluate_packet" | "gtl_graph" | "c_program_term" | "contract_declaration" | "invocation_input" | "public_operation_request";
        contractRef: string;
        value: JsonValue;
        expected: {
            boundary: "raw_admission" | "program_validation";
            disposition: "refused" | "accepted";
            diagnostics: {
                code: string;
                path: string;
            }[];
        };
    } | {
        caseRef: string;
        operation: "program";
        publication: JsonValue;
        program: JsonValue;
        expected: {
            boundary: "raw_admission" | "program_validation";
            disposition: "refused" | "accepted";
            diagnostics: {
                code: string;
                path: string;
            }[];
        };
    })[], 1, undefined>]>;
}, undefined>;
export declare const MALFORMED_GTL_ASSESSMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"malformed_gtl_assessment", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly assessmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly assessmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly input: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"malformed_gtl_assessment_input", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly basis: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
            readonly projection: v.LiteralSchema<"basis", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly artifact: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productManifest: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly toolchain: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
            readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly coverage: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_coverage_catalog", undefined>;
            readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly authoritySources: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly claims: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly coverageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly requirementRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
                readonly behaviors: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
                readonly evidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                coverageRef: string;
                requirementRefs: string[];
                behaviors: string[];
                evidenceRoles: string[];
            }[], 1, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        readonly cases: v.SchemaWithPipe<readonly [v.ArraySchema<v.VariantSchema<"operation", [v.StrictObjectSchema<{
            readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly operation: v.LiteralSchema<"raw", undefined>;
            readonly subjectKind: v.PicklistSchema<readonly ["module_publication", "catalog_contribution", "gtl_program", "graph_function", "gtl_graph", "c_program_term", "contract_declaration", "implementation_binding", "closure_contract", "invocation_input", "public_operation_request", "conformance_evaluate_packet"], undefined>;
            readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly value: v.GenericSchema<JsonValue, JsonValue>;
            readonly expected: v.StrictObjectSchema<{
                readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
                readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
                readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
                    readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                }, undefined>, undefined>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly operation: v.LiteralSchema<"program", undefined>;
            readonly publication: v.GenericSchema<JsonValue, JsonValue>;
            readonly program: v.GenericSchema<JsonValue, JsonValue>;
            readonly expected: v.StrictObjectSchema<{
                readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
                readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
                readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
                    readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                }, undefined>, undefined>;
            }, undefined>;
        }, undefined>], undefined>, undefined>, v.MinLengthAction<({
            caseRef: string;
            operation: "raw";
            subjectKind: "graph_function" | "module_publication" | "catalog_contribution" | "gtl_program" | "implementation_binding" | "closure_contract" | "conformance_evaluate_packet" | "gtl_graph" | "c_program_term" | "contract_declaration" | "invocation_input" | "public_operation_request";
            contractRef: string;
            value: JsonValue;
            expected: {
                boundary: "raw_admission" | "program_validation";
                disposition: "refused" | "accepted";
                diagnostics: {
                    code: string;
                    path: string;
                }[];
            };
        } | {
            caseRef: string;
            operation: "program";
            publication: JsonValue;
            program: JsonValue;
            expected: {
                boundary: "raw_admission" | "program_validation";
                disposition: "refused" | "accepted";
                diagnostics: {
                    code: string;
                    path: string;
                }[];
            };
        })[], 1, undefined>]>;
    }, undefined>;
    readonly nativeBasis: v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly predecessorPrefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly cases: v.ArraySchema<v.StrictObjectSchema<{
        readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly actual: v.StrictObjectSchema<{
            readonly boundary: v.PicklistSchema<["raw_admission", "program_validation"], undefined>;
            readonly disposition: v.PicklistSchema<["accepted", "refused"], undefined>;
            readonly diagnostics: v.ArraySchema<v.StrictObjectSchema<{
                readonly code: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>;
        readonly matched: v.BooleanSchema<undefined>;
    }, undefined>, undefined>;
    readonly disposition: v.PicklistSchema<["green", "red"], undefined>;
}, undefined>;
export type MalformedGtlAssessmentInput = v.InferOutput<typeof MALFORMED_GTL_ASSESSMENT_INPUT_SCHEMA>;
export type MalformedGtlAssessment = v.InferOutput<typeof MALFORMED_GTL_ASSESSMENT_SCHEMA>;
export declare const NATIVE_RUNTIME_ASSESSMENT_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"native_runtime_assessment_input", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly basis: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
        readonly projection: v.LiteralSchema<"basis", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
        readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly artifact: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productManifest: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly toolchain: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
            readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
            readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly releaseClaim: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly coverage: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_coverage_catalog", undefined>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly authoritySources: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly claims: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly coverageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly requirementRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly behaviors: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly evidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            coverageRef: string;
            requirementRefs: string[];
            behaviors: string[];
            evidenceRoles: string[];
        }[], 1, undefined>]>;
    }, undefined>;
    readonly proof: v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly task: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly request: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"execution_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly source: v.OptionalSchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly cCall: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly executionBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly graphFunction: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>], undefined>, undefined>;
        readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basis: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
                readonly projection: v.LiteralSchema<"basis", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
                readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceInventory: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly artifact: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productManifest: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly toolchain: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                    readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                    readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly releaseClaim: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>, undefined>;
                readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly lawBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>;
            readonly prefix: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly storeIdentity: v.StrictObjectSchema<{
                    readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        }, undefined>, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basis: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
                readonly projection: v.LiteralSchema<"basis", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
                readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceInventory: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly artifact: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productManifest: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly toolchain: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                    readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                    readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly releaseClaim: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>, undefined>;
                readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly lawBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>;
            readonly prefix: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly storeIdentity: v.StrictObjectSchema<{
                    readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
                readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>, undefined>;
        readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly task: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly request: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"execution_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly source: v.OptionalSchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly cCall: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly executionBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly graphFunction: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>], undefined>, undefined>;
    }, undefined>], undefined>;
    readonly predecessorWitness: v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>;
    readonly applicability: v.LiteralSchema<"retained_5_0", undefined>;
    readonly applicabilitySourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    readonly cases: v.SchemaWithPipe<readonly [v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
        readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly expectedValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly substituteResultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly graphFunction: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly structure: v.StrictObjectSchema<{
            readonly kind: v.PicklistSchema<["atomic_call", "flat_composition", "edge_program"], undefined>;
            readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly termDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly steps: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly expectedValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly substituteResultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            slotRef: string;
            implementationRef: string;
            inputDigest: string;
            result: {
                ref: string;
                digest: string;
            };
            expectedValueDigest: string;
            substituteResultDigest: string;
        }[], 1, undefined>]>;
        readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly graphFunction: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>], undefined>, undefined>, v.MinLengthAction<({
        slotRef: string;
        implementationRef: string;
        inputDigest: string;
        result: {
            ref: string;
            digest: string;
        };
        expectedValueDigest: string;
        substituteResultDigest: string;
        caseRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        graphFunction: {
            ref: string;
            digest: string;
        };
    } | {
        structure: {
            kind: "atomic_call" | "flat_composition" | "edge_program";
            nodeRef: string;
            termDigest: string;
        };
        steps: {
            slotRef: string;
            implementationRef: string;
            inputDigest: string;
            result: {
                ref: string;
                digest: string;
            };
            expectedValueDigest: string;
            substituteResultDigest: string;
        }[];
        caseRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        graphFunction: {
            ref: string;
            digest: string;
        };
    })[], 1, undefined>]>;
}, undefined>;
export declare const NATIVE_RUNTIME_ASSESSMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"native_runtime_assessment", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly assessmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly assessmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly input: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"native_runtime_assessment_input", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly basis: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
            readonly projection: v.LiteralSchema<"basis", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly artifact: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productManifest: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly toolchain: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
            readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>;
        readonly coverage: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_coverage_catalog", undefined>;
            readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly authoritySources: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly claims: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly coverageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly requirementRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
                readonly behaviors: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
                readonly evidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                coverageRef: string;
                requirementRefs: string[];
                behaviors: string[];
                evidenceRoles: string[];
            }[], 1, undefined>]>;
        }, undefined>;
        readonly proof: v.UnionSchema<[v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly prefix: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly storeIdentity: v.StrictObjectSchema<{
                    readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
            readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly task: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly request: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"execution_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly source: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly cCall: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly executionBasis: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly graphFunction: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>], undefined>, undefined>;
            readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly basis: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
                    readonly projection: v.LiteralSchema<"basis", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
                    readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly sourceInventory: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly artifact: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly productManifest: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly toolchain: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                        readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                        readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly releaseClaim: v.StrictObjectSchema<{
                            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                        }, undefined>;
                    }, undefined>, undefined>;
                    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly lawBasis: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>;
                readonly prefix: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly storeIdentity: v.StrictObjectSchema<{
                        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                        readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
            }, undefined>, undefined>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
            readonly resource: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
                readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly basis: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
                    readonly projection: v.LiteralSchema<"basis", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
                    readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly sourceInventory: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly artifact: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly productManifest: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly toolchain: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                        readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                        readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly releaseClaim: v.StrictObjectSchema<{
                            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                        }, undefined>;
                    }, undefined>, undefined>;
                    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>, undefined>;
                    readonly lawBasis: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>;
                readonly prefix: v.StrictObjectSchema<{
                    readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                    readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly storeIdentity: v.StrictObjectSchema<{
                        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                        readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
                    readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
            }, undefined>, undefined>, undefined>;
            readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly prefix: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly storeIdentity: v.StrictObjectSchema<{
                    readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly task: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly request: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"execution_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly source: v.OptionalSchema<v.StrictObjectSchema<{
                    readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly cCall: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly executionBasis: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                    readonly graphFunction: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
                readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>], undefined>, undefined>;
        }, undefined>], undefined>;
        readonly predecessorWitness: v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
        readonly applicability: v.LiteralSchema<"retained_5_0", undefined>;
        readonly applicabilitySourceRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly cases: v.SchemaWithPipe<readonly [v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly expectedValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly substituteResultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly structure: v.StrictObjectSchema<{
                readonly kind: v.PicklistSchema<["atomic_call", "flat_composition", "edge_program"], undefined>;
                readonly nodeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly termDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly steps: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly implementationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly result: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly expectedValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly substituteResultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                slotRef: string;
                implementationRef: string;
                inputDigest: string;
                result: {
                    ref: string;
                    digest: string;
                };
                expectedValueDigest: string;
                substituteResultDigest: string;
            }[], 1, undefined>]>;
            readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>], undefined>, undefined>, v.MinLengthAction<({
            slotRef: string;
            implementationRef: string;
            inputDigest: string;
            result: {
                ref: string;
                digest: string;
            };
            expectedValueDigest: string;
            substituteResultDigest: string;
            caseRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            graphFunction: {
                ref: string;
                digest: string;
            };
        } | {
            structure: {
                kind: "atomic_call" | "flat_composition" | "edge_program";
                nodeRef: string;
                termDigest: string;
            };
            steps: {
                slotRef: string;
                implementationRef: string;
                inputDigest: string;
                result: {
                    ref: string;
                    digest: string;
                };
                expectedValueDigest: string;
                substituteResultDigest: string;
            }[];
            caseRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            graphFunction: {
                ref: string;
                digest: string;
            };
        })[], 1, undefined>]>;
    }, undefined>;
    readonly nativeBasis: v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly predecessorPrefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly cases: v.ArraySchema<v.StrictObjectSchema<{
        readonly terminal: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly replay: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly steps: v.OptionalSchema<v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly evidence: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>, v.MinLengthAction<{
                ref: string;
                digest: string;
            }[], 1, undefined>]>;
            readonly actualValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly matched: v.BooleanSchema<undefined>;
            readonly substituteRefused: v.BooleanSchema<undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            cCallRef: string;
            result: {
                ref: string;
                digest: string;
            };
            evidence: {
                ref: string;
                digest: string;
            }[];
            actualValueDigest: string;
            matched: boolean;
            substituteRefused: boolean;
        }[], 1, undefined>]>, undefined>;
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly evidence: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            digest: string;
        }[], 1, undefined>]>;
        readonly actualValueDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly matched: v.BooleanSchema<undefined>;
        readonly substituteRefused: v.BooleanSchema<undefined>;
        readonly caseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly disposition: v.PicklistSchema<["green", "red"], undefined>;
}, undefined>;
export type NativeRuntimeAssessmentInput = v.InferOutput<typeof NATIVE_RUNTIME_ASSESSMENT_INPUT_SCHEMA>;
export type NativeRuntimeAssessment = v.InferOutput<typeof NATIVE_RUNTIME_ASSESSMENT_SCHEMA>;
/** Mechanical projection of one complete native F11 result. Its underlying
 * judgments/evidence may be shared; this summary itself supplies no authority. */
/** Subordinate QUAL-056 data. The recipe is a frozen subject member; selected
 * native evidence and F11 judgment, never this structure, supply authority. */
export declare const QUALIFICATION_VERIFICATION_RECIPE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_verification_recipe", undefined>;
    readonly schemaVersion: v.LiteralSchema<"1", undefined>;
    readonly sourceInputs: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly relativePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        memberRef: string;
        relativePath: string;
    }[], 1, undefined>]>;
    readonly auxiliaryInputs: v.ArraySchema<v.StrictObjectSchema<{
        readonly relativePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly commandConfigurationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly predicateConfigurationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly writeTerritoriesDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly commands: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly role: v.PicklistSchema<["setup", "build", "lint", "test", "compare"], undefined>;
    }, undefined>, undefined>, v.MinLengthAction<{
        commandId: string;
        role: "setup" | "build" | "lint" | "test" | "compare";
    }[], 1, undefined>]>;
    readonly lint: v.StrictObjectSchema<{
        readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly files: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly kind: v.PicklistSchema<["mjs", "json"], undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            path: string;
            kind: "mjs" | "json";
        }[], 1, undefined>]>;
    }, undefined>;
    readonly tests: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly files: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        commandId: string;
        files: string[];
    }[], 1, undefined>]>;
    readonly skipPolicy: v.LiteralSchema<"incomplete", undefined>;
    readonly reportFormat: v.LiteralSchema<"node-test-events-jsonl@1", undefined>;
}, undefined>;
export declare const QUALIFICATION_VERIFICATION_SELECTION_SCHEMA: v.StrictObjectSchema<{
    readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly recipe: v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>;
    readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>;
declare const qualificationTestSummarySchema: v.StrictObjectSchema<{
    readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly streamDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly format: v.LiteralSchema<"node-test-events-jsonl@1", undefined>;
    readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
    readonly diagnostics: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly tests: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly passed: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly failed: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly cancelled: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly skipped: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly todo: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly suites: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly files: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly cases: v.ArraySchema<v.GenericSchema<JsonValue, JsonValue>, undefined>;
    readonly summaries: v.ArraySchema<v.GenericSchema<JsonValue, JsonValue>, undefined>;
    readonly complete: v.BooleanSchema<undefined>;
}, undefined>;
export type QualificationTestSummary = v.InferOutput<typeof qualificationTestSummarySchema>;
export declare const QUALIFICATION_TEST_SUMMARY_SCHEMA: v.GenericSchema<QualificationTestSummary>;
declare const qualificationVerificationMaterialSchema: v.StrictObjectSchema<{
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly recipe: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly execution: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly cCall: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly observation: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly commandOutcomes: v.ArraySchema<v.StrictObjectSchema<{
        readonly commandId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly role: v.PicklistSchema<["setup", "build", "lint", "test", "compare"], undefined>;
        readonly observation: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly executable: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly args: v.ArraySchema<v.StringSchema<undefined>, undefined>;
        readonly relativeCwd: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly environment: v.GenericSchema<JsonValue, JsonValue>;
        readonly timeoutMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly terminationGraceMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly exitStatus: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>]>;
        readonly timedOut: v.BooleanSchema<undefined>;
        readonly processSignal: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly signalSequence: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly terminationConfirmed: v.BooleanSchema<undefined>;
        readonly stdout: v.StrictObjectSchema<{
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
        readonly stderr: v.StrictObjectSchema<{
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
        readonly reports: v.GenericSchema<JsonValue, JsonValue>;
    }, undefined>, undefined>;
    readonly lintOutcome: v.GenericSchema<JsonValue, JsonValue>;
    readonly predicateOutcomes: v.ArraySchema<v.StrictObjectSchema<{
        readonly declaration: v.GenericSchema<JsonValue, JsonValue>;
        readonly observation: v.GenericSchema<JsonValue, JsonValue>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
        readonly diagnostics: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly testSummaries: v.ArraySchema<v.GenericSchema<{
        commandId: string;
        streamDigest: string;
        format: "node-test-events-jsonl@1";
        disposition: "passed" | "failed" | "blocked_incomplete";
        diagnostics: string[];
        tests: number;
        passed: number;
        failed: number;
        cancelled: number;
        skipped: number;
        todo: number;
        suites: number;
        files: string[];
        cases: JsonValue[];
        summaries: JsonValue[];
        complete: boolean;
    }>, undefined>;
    readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
    readonly diagnostics: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export type QualificationVerificationRecipe = v.InferOutput<typeof QUALIFICATION_VERIFICATION_RECIPE_SCHEMA>;
export type QualificationVerificationSelection = v.InferOutput<typeof QUALIFICATION_VERIFICATION_SELECTION_SCHEMA>;
export type QualificationVerificationMaterial = v.InferOutput<typeof qualificationVerificationMaterialSchema>;
export declare const QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA: v.GenericSchema<QualificationVerificationMaterial>;
export declare const QUALIFICATION_SELF_CONFORMANCE_SUMMARY_SCHEMA: v.StrictObjectSchema<{
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly assessment: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly disposition: v.PicklistSchema<["green", "red", "blocked"], undefined>;
    readonly bypassRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly verification: v.OptionalSchema<v.NullableSchema<v.GenericSchema<{
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        recipe: {
            ref: string;
            digest: string;
        };
        executionSelectionRef: string;
        execution: {
            ref: string;
            digest: string;
        };
        cCall: {
            ref: string;
            digest: string;
        };
        observation: {
            ref: string;
            digest: string;
        };
        commandOutcomes: {
            commandId: string;
            role: "setup" | "build" | "lint" | "test" | "compare";
            observation: {
                ref: string;
                digest: string;
            };
            executable: string;
            args: string[];
            relativeCwd: string;
            environment: JsonValue;
            timeoutMs: number;
            terminationGraceMs: number;
            exitStatus: number;
            timedOut: boolean;
            processSignal: string | null;
            signalSequence: string[];
            terminationConfirmed: boolean;
            stdout: {
                digest: string;
                byteLength: number;
            };
            stderr: {
                digest: string;
                byteLength: number;
            };
            reports: JsonValue;
        }[];
        lintOutcome: JsonValue;
        predicateOutcomes: {
            declaration: JsonValue;
            observation: JsonValue;
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }[];
        testSummaries: {
            commandId: string;
            streamDigest: string;
            format: "node-test-events-jsonl@1";
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
            tests: number;
            passed: number;
            failed: number;
            cancelled: number;
            skipped: number;
            todo: number;
            suites: number;
            files: string[];
            cases: JsonValue[];
            summaries: JsonValue[];
            complete: boolean;
        }[];
        disposition: "passed" | "failed" | "blocked_incomplete";
        diagnostics: string[];
    }>, undefined>, undefined>;
}, undefined>;
export declare const QUALIFICATION_VERDICT_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"qualification_verdict_input", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly basis: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
        readonly projection: v.LiteralSchema<"basis", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
        readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly artifact: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productManifest: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly toolchain: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
            readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
            readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly releaseClaim: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
    readonly coverage: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_coverage_catalog", undefined>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly authoritySources: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly claims: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly coverageRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly requirementRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly behaviors: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly evidenceRoles: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            coverageRef: string;
            requirementRefs: string[];
            behaviors: string[];
            evidenceRoles: string[];
        }[], 1, undefined>]>;
    }, undefined>;
    readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly selfConformance: v.StrictObjectSchema<{
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly assessment: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly disposition: v.PicklistSchema<["green", "red", "blocked"], undefined>;
        readonly bypassRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly verification: v.OptionalSchema<v.NullableSchema<v.GenericSchema<{
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            recipe: {
                ref: string;
                digest: string;
            };
            executionSelectionRef: string;
            execution: {
                ref: string;
                digest: string;
            };
            cCall: {
                ref: string;
                digest: string;
            };
            observation: {
                ref: string;
                digest: string;
            };
            commandOutcomes: {
                commandId: string;
                role: "setup" | "build" | "lint" | "test" | "compare";
                observation: {
                    ref: string;
                    digest: string;
                };
                executable: string;
                args: string[];
                relativeCwd: string;
                environment: JsonValue;
                timeoutMs: number;
                terminationGraceMs: number;
                exitStatus: number;
                timedOut: boolean;
                processSignal: string | null;
                signalSequence: string[];
                terminationConfirmed: boolean;
                stdout: {
                    digest: string;
                    byteLength: number;
                };
                stderr: {
                    digest: string;
                    byteLength: number;
                };
                reports: JsonValue;
            }[];
            lintOutcome: JsonValue;
            predicateOutcomes: {
                declaration: JsonValue;
                observation: JsonValue;
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            }[];
            testSummaries: {
                commandId: string;
                streamDigest: string;
                format: "node-test-events-jsonl@1";
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
                tests: number;
                passed: number;
                failed: number;
                cancelled: number;
                skipped: number;
                todo: number;
                suites: number;
                files: string[];
                cases: JsonValue[];
                summaries: JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }>, undefined>, undefined>;
    }, undefined>;
    readonly proof: v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly task: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly request: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"execution_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly source: v.OptionalSchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly cCall: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly executionBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly graphFunction: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>], undefined>, undefined>;
        readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basis: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
                readonly projection: v.LiteralSchema<"basis", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
                readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceInventory: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly artifact: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productManifest: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly toolchain: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                    readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                    readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly releaseClaim: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>, undefined>;
                readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly lawBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>;
            readonly prefix: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly storeIdentity: v.StrictObjectSchema<{
                    readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly declarations: v.ArraySchema<v.GenericSchema<import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof, import("../abg/terminal_result_contracts.js").AbgHistoricalDeclarationProof>, undefined>;
        }, undefined>, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
            readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly executionSources: v.OptionalSchema<v.ArraySchema<v.StrictObjectSchema<{
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly basis: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
                readonly projection: v.LiteralSchema<"basis", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
                readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly sourceInventory: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly artifact: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productManifest: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly toolchain: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
                    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                    readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                    readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly releaseClaim: v.StrictObjectSchema<{
                        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    }, undefined>;
                }, undefined>, undefined>;
                readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>, undefined>;
                readonly lawBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>;
            readonly prefix: v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
                readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly storeIdentity: v.StrictObjectSchema<{
                    readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                    readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly declarations: v.ArraySchema<v.StrictObjectSchema<{
                readonly catalogBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly readinessBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly viewDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly proofDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>, undefined>;
        readonly kind: v.LiteralSchema<"qualification_proof_resource", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly prefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly selections: v.ArraySchema<v.VariantSchema<"kind", [v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"judgment_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly task: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"ruling_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly request: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly continuationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"execution_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly source: v.OptionalSchema<v.StrictObjectSchema<{
                readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly cCall: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly executionBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
                readonly graphFunction: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                }, undefined>;
            }, undefined>, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"self_conformance_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"verdict_selection", undefined>;
            readonly selectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>], undefined>, undefined>;
    }, undefined>], undefined>;
}, undefined>;
export declare const EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
    readonly projection: v.LiteralSchema<"verdict", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
    readonly verdictRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly verdictDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly coverageCatalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly selfConformance: v.StrictObjectSchema<{
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly assessment: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly disposition: v.PicklistSchema<["green", "red", "blocked"], undefined>;
        readonly bypassRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly verification: v.OptionalSchema<v.NullableSchema<v.GenericSchema<{
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            recipe: {
                ref: string;
                digest: string;
            };
            executionSelectionRef: string;
            execution: {
                ref: string;
                digest: string;
            };
            cCall: {
                ref: string;
                digest: string;
            };
            observation: {
                ref: string;
                digest: string;
            };
            commandOutcomes: {
                commandId: string;
                role: "setup" | "build" | "lint" | "test" | "compare";
                observation: {
                    ref: string;
                    digest: string;
                };
                executable: string;
                args: string[];
                relativeCwd: string;
                environment: JsonValue;
                timeoutMs: number;
                terminationGraceMs: number;
                exitStatus: number;
                timedOut: boolean;
                processSignal: string | null;
                signalSequence: string[];
                terminationConfirmed: boolean;
                stdout: {
                    digest: string;
                    byteLength: number;
                };
                stderr: {
                    digest: string;
                    byteLength: number;
                };
                reports: JsonValue;
            }[];
            lintOutcome: JsonValue;
            predicateOutcomes: {
                declaration: JsonValue;
                observation: JsonValue;
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            }[];
            testSummaries: {
                commandId: string;
                streamDigest: string;
                format: "node-test-events-jsonl@1";
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
                tests: number;
                passed: number;
                failed: number;
                cancelled: number;
                skipped: number;
                todo: number;
                suites: number;
                files: string[];
                cases: JsonValue[];
                summaries: JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }>, undefined>, undefined>;
    }, undefined>;
    readonly disposition: v.PicklistSchema<["green", "red", "blocked"], undefined>;
    readonly bypassRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly nativeBasis: v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly predecessorPrefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
}, undefined>;
export declare const EXACT_CANDIDATE_QUALIFICATION_SCHEMA: v.VariantSchema<"projection", [v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
    readonly projection: v.LiteralSchema<"basis", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
    readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly sourceInventory: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly artifact: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly productManifest: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly toolchain: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
        readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
        readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly releaseClaim: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
    readonly projection: v.LiteralSchema<"verdict", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
    readonly verdictRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly verdictDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly coverageCatalog: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly selfConformance: v.StrictObjectSchema<{
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly assessment: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly disposition: v.PicklistSchema<["green", "red", "blocked"], undefined>;
        readonly bypassRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly verification: v.OptionalSchema<v.NullableSchema<v.GenericSchema<{
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            recipe: {
                ref: string;
                digest: string;
            };
            executionSelectionRef: string;
            execution: {
                ref: string;
                digest: string;
            };
            cCall: {
                ref: string;
                digest: string;
            };
            observation: {
                ref: string;
                digest: string;
            };
            commandOutcomes: {
                commandId: string;
                role: "setup" | "build" | "lint" | "test" | "compare";
                observation: {
                    ref: string;
                    digest: string;
                };
                executable: string;
                args: string[];
                relativeCwd: string;
                environment: JsonValue;
                timeoutMs: number;
                terminationGraceMs: number;
                exitStatus: number;
                timedOut: boolean;
                processSignal: string | null;
                signalSequence: string[];
                terminationConfirmed: boolean;
                stdout: {
                    digest: string;
                    byteLength: number;
                };
                stderr: {
                    digest: string;
                    byteLength: number;
                };
                reports: JsonValue;
            }[];
            lintOutcome: JsonValue;
            predicateOutcomes: {
                declaration: JsonValue;
                observation: JsonValue;
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            }[];
            testSummaries: {
                commandId: string;
                streamDigest: string;
                format: "node-test-events-jsonl@1";
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
                tests: number;
                passed: number;
                failed: number;
                cancelled: number;
                skipped: number;
                todo: number;
                suites: number;
                files: string[];
                cases: JsonValue[];
                summaries: JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }>, undefined>, undefined>;
    }, undefined>;
    readonly disposition: v.PicklistSchema<["green", "red", "blocked"], undefined>;
    readonly bypassRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly slotRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly nativeBasis: v.StrictObjectSchema<{
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly predecessorPrefix: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"durable_prefix_coordinate", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly eventLogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly prefixLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly storeIdentity: v.StrictObjectSchema<{
                readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly coordinateDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
}, undefined>], undefined>;
declare const qualificationDataSchemas: {
    readonly coordinate: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_law_basis", undefined>;
        readonly lawBasisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly releaseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly methodVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly installedManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly memberSetDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly catalog: v.StrictObjectSchema<{
            readonly ownerRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly assetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly sources: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly ruleCatalog: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_rule_catalog", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ownerRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly method: v.StrictObjectSchema<{
            readonly releaseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly methodVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly installedManifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly memberSetDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly sources: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly rules: v.ArraySchema<v.StrictObjectSchema<{
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly sourceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly governedClaim: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly applicability: v.LiteralSchema<"requires_admitted_judgment", undefined>;
            readonly requiredEvidenceRoles: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly computableRelation: v.LiteralSchema<"source_span_integrity", undefined>;
            readonly diagnostic: v.LiteralSchema<"semantic_assessment_required", undefined>;
        }, undefined>, undefined>;
        readonly coverageClaim: v.LiteralSchema<"finite_candidate_unassessed", undefined>;
        readonly requiredCatalogEvidenceRoles: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>;
    readonly inventory: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"qualification_subject_inventory", undefined>;
        readonly inventoryRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly inventoryDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly selectedRoots: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly coverage: v.PicklistSchema<["complete_claim", "incomplete"], undefined>;
        readonly members: v.ArraySchema<v.StrictObjectSchema<{
            readonly surfaceRoles: v.ArraySchema<v.PicklistSchema<readonly ["constitutional", "design", "code", "proof", "execution_contract", "public_contract", "manifest", "qualification", "release_claim"], undefined>, undefined>;
            readonly classificationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly tenantManifest: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"tenant_conformance_manifest", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly manifestRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly capabilityDefinitionGraph: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly publicContractCatalog: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly claims: v.ArraySchema<v.StrictObjectSchema<{
            readonly claimRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly capabilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly publicContractRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>;
    readonly basis: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"exact_candidate_qualification", undefined>;
        readonly projection: v.LiteralSchema<"basis", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly subjectKind: v.PicklistSchema<["pre_rc_candidate", "installed_rc"], undefined>;
        readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly sourceInventory: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly artifact: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productManifest: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly toolchain: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly installedProduct: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly workspaceBinding: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly prospectiveRelease: v.NullableSchema<v.StrictObjectSchema<{
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly namespace: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
            readonly projectSubtree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly versionLine: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
            readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly releaseClaim: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
        }, undefined>, undefined>;
        readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly coverageCatalog: v.NullableSchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
};
export type QualificationMaterial = v.InferOutput<typeof QUALIFICATION_MATERIAL_SCHEMA>;
export type QualificationCoordinate = v.InferOutput<typeof qualificationDataSchemas.coordinate>;
export type QualificationLawBasis = v.InferOutput<typeof qualificationDataSchemas.lawBasis>;
export type QualificationRuleCatalog = v.InferOutput<typeof qualificationDataSchemas.ruleCatalog>;
export type QualificationSubjectInventory = v.InferOutput<typeof qualificationDataSchemas.inventory>;
export type TenantConformanceManifest = v.InferOutput<typeof qualificationDataSchemas.tenantManifest>;
export type QualificationAssessmentTask = v.InferOutput<typeof QUALIFICATION_ASSESSMENT_TASK_SCHEMA>;
export type QualificationAssessmentInput = v.InferOutput<typeof QUALIFICATION_ASSESSMENT_INPUT_SCHEMA>;
export type QualificationAssessmentPlan = v.InferOutput<typeof QUALIFICATION_ASSESSMENT_PLAN_SCHEMA>;
export type QualificationJudgment = v.InferOutput<typeof QUALIFICATION_JUDGMENT_SCHEMA>;
export type QualificationRawJudgment = v.InferOutput<typeof QUALIFICATION_RAW_JUDGMENT_SCHEMA>;
export type QualificationOwnerRuling = v.InferOutput<typeof QUALIFICATION_OWNER_RULING_SCHEMA>;
export type QualificationRulingRequest = v.InferOutput<typeof QUALIFICATION_RULING_REQUEST_SCHEMA>;
export type QualificationConstructionProvenance = v.InferOutput<typeof QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA>;
export type QualificationEvidenceSelection = v.InferOutput<typeof QUALIFICATION_SELECTION_SCHEMA>;
export type QualificationProofResource = v.InferOutput<typeof QUALIFICATION_PROOF_RESOURCE_SCHEMA>;
export type QualificationCoverageCatalog = v.InferOutput<typeof QUALIFICATION_COVERAGE_CATALOG_SCHEMA>;
export type QualificationSelfConformanceSummary = v.InferOutput<typeof QUALIFICATION_SELF_CONFORMANCE_SUMMARY_SCHEMA>;
export type QualificationVerdictInput = v.InferOutput<typeof QUALIFICATION_VERDICT_INPUT_SCHEMA>;
export type ExactCandidateQualification<K extends "basis" | "verdict"> = K extends "basis" ? v.InferOutput<typeof qualificationDataSchemas.basis> : v.InferOutput<typeof EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA>;
export type QualificationNativeBasis = v.InferOutput<typeof QUALIFICATION_NATIVE_BASIS_SCHEMA>;
export declare function qualificationIdentityDigest(value: object, refKey: string, digestKey: string): Sha256Digest;
export declare const qualificationHash: (value: unknown) => Sha256Digest;
export declare const sameQualificationValue: (a: unknown, b: unknown) => boolean;
export declare const uniqueQualificationRefs: (refs: readonly string[]) => boolean;
export declare function qualificationIdentity(value: object, refKey: string, digestKey: string, prefix: string): boolean;
export declare function constructQualificationIdentity<T extends object>(body: T, refKey: string, digestKey: string, prefix: string): T & Record<string, string>;
export declare function isQualificationAssessmentTask(value: unknown): value is QualificationAssessmentTask;
export declare function isQualificationJudgment(value: unknown): value is QualificationJudgment;
export declare function isQualificationVerdict(value: unknown): value is ExactCandidateQualification<"verdict">;
export declare const isQualificationProofResource: (value: unknown) => value is QualificationProofResource;
export {};
