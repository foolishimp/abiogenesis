import * as v from "valibot";
import { type AbgEventResourceAssertion, type AbgEventResourceReceipt } from "../abg/definition_event_resource.js";
import { type JsonValue } from "../shared/canonical_json.js";
import type { ExactDefinitionCallable } from "../shared/effect_definition.js";
import { type AdmissionAuthorizedResources } from "./admission_authority.js";
export declare const RELEASE_PUBLICATION_RESOURCE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"release_publication_resources", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly eventResource: v.CustomSchema<AbgEventResourceAssertion, v.ErrorMessage<v.CustomIssue> | undefined>;
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
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../index.js").AbgHistoricalDeclarationProof, import("../index.js").AbgHistoricalDeclarationProof>, undefined>;
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
            readonly declarations: v.ArraySchema<v.GenericSchema<import("../index.js").AbgHistoricalDeclarationProof, import("../index.js").AbgHistoricalDeclarationProof>, undefined>;
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
    readonly selection: v.VariantSchema<"kind", [v.StrictObjectSchema<{
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
    readonly effectGrant: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"release_publication_grant", undefined>;
        readonly sourceRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly sourceCommit: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly sourceTree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly sourceInventory: v.StrictObjectSchema<{
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
        readonly artifact: v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly snapshotName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly manifestPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly releaseClaimPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly remote: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly pushMode: v.LiteralSchema<"atomic", undefined>;
        readonly expectedRemoteRefs: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly object: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly expectedLocalRefs: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly object: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly carrierRefs: v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedObject: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
        }, undefined>, undefined>;
        readonly snapshotRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly artifactOutputRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly tagger: v.StrictObjectSchema<{
            readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly email: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly date: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly tagMessage: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly buildCommand: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packCommand: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
}, undefined>;
export type ReleasePublicationResources = v.InferOutput<typeof RELEASE_PUBLICATION_RESOURCE_SCHEMA>;
export declare const RELEASE_PUBLICATION_RECEIPT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"release_publication_receipt", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly eventResource: v.CustomSchema<AbgEventResourceReceipt, v.ErrorMessage<v.CustomIssue> | undefined>;
    readonly artifact: v.NullableSchema<v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>, undefined>;
    readonly artifactPath: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
    readonly admissionEventRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
}, undefined>;
export type ReleasePublicationReceipt = v.InferOutput<typeof RELEASE_PUBLICATION_RECEIPT_SCHEMA>;
export declare const RELEASE_ACCEPTANCE_RESOURCE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"release_acceptance_resources", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly eventResource: v.CustomSchema<AbgEventResourceAssertion, v.ErrorMessage<v.CustomIssue> | undefined>;
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
        readonly declarations: v.ArraySchema<v.GenericSchema<import("../index.js").AbgHistoricalDeclarationProof, import("../index.js").AbgHistoricalDeclarationProof>, undefined>;
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
            readonly declarations: v.ArraySchema<v.GenericSchema<import("../index.js").AbgHistoricalDeclarationProof, import("../index.js").AbgHistoricalDeclarationProof>, undefined>;
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
    readonly selection: v.VariantSchema<"kind", [v.StrictObjectSchema<{
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
    readonly effectGrant: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"release_acceptance_grant", undefined>;
        readonly humanAuthority: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly sourceAuthority: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly sourceApproval: v.NullableSchema<v.StrictObjectSchema<{
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
        }, undefined>, undefined>;
        readonly requiredEvidence: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>, undefined>, v.MinLengthAction<{
            ref: string;
            digest: `sha256:${string}`;
        }[], 1, undefined>]>;
        readonly addendumRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly artifactOutputRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
    }, undefined>;
    readonly publication: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"release_operation_observation", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly memberKey: v.LiteralSchema<"published_rc", undefined>;
        readonly scope: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly invocation: v.StrictObjectSchema<{
            readonly operationId: v.LiteralSchema<"abg.operation.release.snapshot", undefined>;
            readonly memberKey: v.LiteralSchema<"published_rc", undefined>;
            readonly definitionDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly invocationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly invocationPayloadDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly invocationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly entryPrefix: v.StrictObjectSchema<{
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
        readonly grants: v.ArraySchema<v.GenericSchema<JsonValue, JsonValue>, undefined>;
        readonly admissionAuthority: v.GenericSchema<JsonValue, JsonValue>;
        readonly eventResource: v.GenericSchema<JsonValue, JsonValue>;
        readonly publicInvocation: v.GenericSchema<JsonValue, JsonValue>;
        readonly resourceDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly capabilityGrants: v.GenericSchema<JsonValue, JsonValue>;
        readonly workspaceBinding: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly productSet: v.GenericSchema<JsonValue, JsonValue>;
        readonly dependencyLock: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly request: v.StrictObjectSchema<{
            readonly qualificationBasis: v.StrictObjectSchema<{
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
            readonly lawBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly verdict: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly requestedIdentity: v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly namespace: v.LiteralSchema<"abiogenesis", undefined>;
                readonly profile: v.LiteralSchema<"one_project_unqualified", undefined>;
                readonly projectSubtree: v.LiteralSchema<".", undefined>;
                readonly versionLine: v.LiteralSchema<"5.0.0", undefined>;
                readonly ordinal: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.MinValueAction<number, 1, undefined>]>;
                readonly version: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly releaseClaim: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
            }, undefined>;
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
            readonly declarations: v.ArraySchema<v.GenericSchema<import("../index.js").AbgHistoricalDeclarationProof, import("../index.js").AbgHistoricalDeclarationProof>, undefined>;
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
                readonly declarations: v.ArraySchema<v.GenericSchema<import("../index.js").AbgHistoricalDeclarationProof, import("../index.js").AbgHistoricalDeclarationProof>, undefined>;
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
        readonly selection: v.VariantSchema<"kind", [v.StrictObjectSchema<{
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
        readonly effectGrant: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"release_publication_grant", undefined>;
            readonly sourceRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly sourceCommit: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly sourceTree: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly sourceInventory: v.StrictObjectSchema<{
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
            readonly artifact: v.StrictObjectSchema<{
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly snapshotName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly packageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly manifestPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly releaseClaimPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly remote: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly pushMode: v.LiteralSchema<"atomic", undefined>;
            readonly expectedRemoteRefs: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly object: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly expectedLocalRefs: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly object: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly carrierRefs: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly expectedObject: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
            }, undefined>, undefined>;
            readonly snapshotRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly artifactOutputRoot: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly tagger: v.StrictObjectSchema<{
                readonly name: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly email: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly date: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>;
            readonly tagMessage: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly buildCommand: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packCommand: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>;
        readonly observation: v.StrictObjectSchema<{
            readonly disposition: v.PicklistSchema<["complete", "refused", "incomplete_effect"], undefined>;
            readonly phase: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly message: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly effects: v.ArraySchema<v.StrictObjectSchema<{
                readonly kind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            }, undefined>, undefined>;
            readonly unknownEffects: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>;
            readonly sourceCommit: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
            readonly sourceTree: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
            readonly refs: v.ArraySchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly object: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly peeled: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>, undefined>;
            readonly snapshotManifest: v.NullableSchema<v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>, undefined>;
            readonly snapshotFiles: v.ArraySchema<v.StrictObjectSchema<{
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>, undefined>;
        }, undefined>;
    }, undefined>;
    readonly ruling: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
}, undefined>;
export type ReleaseAcceptanceResources = v.InferOutput<typeof RELEASE_ACCEPTANCE_RESOURCE_SCHEMA>;
export declare const RELEASE_SNAPSHOT_DEFINITION_BINDINGS: Readonly<{
    snapshot: Readonly<{
        published_rc: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.release.snapshot";
            readonly memberKey: "published_rc";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
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
            lawBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verdict: {
                ref: string;
                digest: `sha256:${string}`;
            };
            requestedIdentity: {
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
        }, {
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
            lawBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verdict: {
                ref: string;
                digest: `sha256:${string}`;
            };
            requestedIdentity: {
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            kind: "release_snapshot_result";
            schemaVersion: "5.0.0";
            memberKey: "published_rc";
            disposition: "complete";
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
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
        }, {
            kind: "release_snapshot_result";
            schemaVersion: "5.0.0";
            memberKey: "published_rc";
            disposition: "complete";
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
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            kind: "release_snapshot_refusal";
            schemaVersion: "5.0.0";
            memberKey: "published_rc" | "tapped_release";
            disposition: "refused" | "incomplete_effect";
            code: "basis_mismatch" | "identity_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
            message: string;
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
            } | null;
        }, {
            kind: "release_snapshot_refusal";
            schemaVersion: "5.0.0";
            memberKey: "published_rc" | "tapped_release";
            disposition: "refused" | "incomplete_effect";
            code: "basis_mismatch" | "identity_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
            message: string;
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
            } | null;
        }>, null>, AdmissionAuthorizedResources<{
            kind: "release_publication_resources";
            schemaVersion: "5.0.0";
            eventResource: AbgEventResourceAssertion;
            proof: {
                kind: "qualification_proof_resource";
                schemaVersion: "5.0.0";
                prefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                declarations: import("../index.js").AbgHistoricalDeclarationProof[];
                selections: ({
                    kind: "judgment_selection";
                    selectionRef: string;
                    slotRef: string;
                    task: {
                        ref: string;
                        digest: string;
                    };
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "ruling_selection";
                    selectionRef: string;
                    slotRef: string;
                    request: {
                        ref: string;
                        digest: string;
                    };
                    continuationRef: string;
                } | {
                    kind: "execution_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                    source?: {
                        sourceRef: string;
                        cCall: {
                            ref: string;
                            digest: string;
                        };
                        executionBasis: {
                            ref: string;
                            digest: string;
                        };
                        graphFunction: {
                            ref: string;
                            digest: string;
                        };
                    } | undefined;
                } | {
                    kind: "self_conformance_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "verdict_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                })[];
                executionSources?: {
                    sourceRef: string;
                    basis: {
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
                    prefix: {
                        kind: "durable_prefix_coordinate";
                        schemaVersion: "5.0.0";
                        eventLogRef: string;
                        prefixLength: number;
                        prefixDigest: string;
                        storeIdentity: {
                            device: number;
                            inode: number;
                            eventContractDigest: string;
                        };
                        coordinateDigest: string;
                    };
                    declarations: import("../index.js").AbgHistoricalDeclarationProof[];
                }[] | undefined;
            } | {
                representation: "resource_refs_v1";
                resource: {
                    ref: string;
                    digest: string;
                };
                declarations: {
                    catalogBasisDigest: string;
                    readinessBasisDigest: string;
                    viewDigest: string;
                    proofDigest: string;
                }[];
                executionSources?: {
                    sourceRef: string;
                    basis: {
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
                    prefix: {
                        kind: "durable_prefix_coordinate";
                        schemaVersion: "5.0.0";
                        eventLogRef: string;
                        prefixLength: number;
                        prefixDigest: string;
                        storeIdentity: {
                            device: number;
                            inode: number;
                            eventContractDigest: string;
                        };
                        coordinateDigest: string;
                    };
                    declarations: {
                        catalogBasisDigest: string;
                        readinessBasisDigest: string;
                        viewDigest: string;
                        proofDigest: string;
                    }[];
                }[] | undefined;
                kind: "qualification_proof_resource";
                schemaVersion: "5.0.0";
                prefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                selections: ({
                    kind: "judgment_selection";
                    selectionRef: string;
                    slotRef: string;
                    task: {
                        ref: string;
                        digest: string;
                    };
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "ruling_selection";
                    selectionRef: string;
                    slotRef: string;
                    request: {
                        ref: string;
                        digest: string;
                    };
                    continuationRef: string;
                } | {
                    kind: "execution_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                    source?: {
                        sourceRef: string;
                        cCall: {
                            ref: string;
                            digest: string;
                        };
                        executionBasis: {
                            ref: string;
                            digest: string;
                        };
                        graphFunction: {
                            ref: string;
                            digest: string;
                        };
                    } | undefined;
                } | {
                    kind: "self_conformance_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "verdict_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                })[];
            };
            selection: {
                kind: "judgment_selection";
                selectionRef: string;
                slotRef: string;
                task: {
                    ref: string;
                    digest: string;
                };
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "ruling_selection";
                selectionRef: string;
                slotRef: string;
                request: {
                    ref: string;
                    digest: string;
                };
                continuationRef: string;
            } | {
                kind: "execution_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
                source?: {
                    sourceRef: string;
                    cCall: {
                        ref: string;
                        digest: string;
                    };
                    executionBasis: {
                        ref: string;
                        digest: string;
                    };
                    graphFunction: {
                        ref: string;
                        digest: string;
                    };
                } | undefined;
            } | {
                kind: "self_conformance_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "verdict_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            };
            effectGrant: {
                kind: "release_publication_grant";
                sourceRoot: string;
                sourceCommit: string;
                sourceTree: string;
                sourceInventory: {
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
                artifact: {
                    path: string;
                    ref: string;
                    digest: `sha256:${string}`;
                    snapshotName: string;
                    packageName: string;
                };
                manifestPath: string;
                releaseClaimPath: string;
                remote: string;
                pushMode: "atomic";
                expectedRemoteRefs: {
                    ref: string;
                    object: string;
                }[];
                expectedLocalRefs: {
                    ref: string;
                    object: string;
                }[];
                carrierRefs: {
                    ref: string;
                    expectedObject: string | null;
                }[];
                snapshotRoot: string;
                artifactOutputRoot: string;
                tagger: {
                    name: string;
                    email: string;
                    date: string;
                };
                tagMessage: string;
                buildCommand: string;
                packCommand: string;
            };
        }>, {
            kind: "release_publication_receipt";
            schemaVersion: "5.0.0";
            eventResource: AbgEventResourceReceipt;
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            artifactPath: string | null;
            admissionEventRef: string | null;
        }>;
        tapped_release: ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
            readonly operationId: "abg.operation.release.snapshot";
            readonly memberKey: "tapped_release";
        }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            acceptedRc: {
                ref: string;
                digest: `sha256:${string}`;
            };
            acceptance: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            predecessor: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
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
            lawBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verdict: {
                ref: string;
                digest: `sha256:${string}`;
            };
            requestedIdentity: {
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
        }, {
            acceptedRc: {
                ref: string;
                digest: `sha256:${string}`;
            };
            acceptance: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            predecessor: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
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
            lawBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verdict: {
                ref: string;
                digest: `sha256:${string}`;
            };
            requestedIdentity: {
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            memberKey: "tapped_release";
            decision: "accept";
            publication: {
                ref: string;
                digest: `sha256:${string}`;
            };
            acceptance: {
                ref: string;
                digest: `sha256:${string}`;
            };
            addendum: {
                ref: string;
                digest: `sha256:${string}`;
            };
            kind: "release_snapshot_result";
            schemaVersion: "5.0.0";
            disposition: "complete";
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
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
        }, {
            memberKey: "tapped_release";
            decision: "accept";
            publication: {
                ref: string;
                digest: `sha256:${string}`;
            };
            acceptance: {
                ref: string;
                digest: `sha256:${string}`;
            };
            addendum: {
                ref: string;
                digest: `sha256:${string}`;
            };
            kind: "release_snapshot_result";
            schemaVersion: "5.0.0";
            disposition: "complete";
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
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            };
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
        }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
            kind: "release_snapshot_refusal";
            schemaVersion: "5.0.0";
            memberKey: "published_rc" | "tapped_release";
            disposition: "refused" | "incomplete_effect";
            code: "basis_mismatch" | "identity_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
            message: string;
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
            } | null;
        }, {
            kind: "release_snapshot_refusal";
            schemaVersion: "5.0.0";
            memberKey: "published_rc" | "tapped_release";
            disposition: "refused" | "incomplete_effect";
            code: "basis_mismatch" | "identity_mismatch" | "wrong_subject_kind" | "law_basis_mismatch" | "verdict_not_green" | "bypass_nonempty" | "publication_failure" | "not_implemented" | "duplicate_invocation" | "artifact_conflict" | "acceptance_unavailable" | "acceptance_withheld";
            message: string;
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            observation: {
                disposition: "refused" | "complete" | "incomplete_effect";
                phase: string;
                message: string;
                effects: {
                    kind: string;
                    ref: string;
                    digest: string | null;
                }[];
                unknownEffects: string[];
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
            } | null;
        }>, null>, AdmissionAuthorizedResources<{
            kind: "release_acceptance_resources";
            schemaVersion: "5.0.0";
            eventResource: AbgEventResourceAssertion;
            proof: {
                kind: "qualification_proof_resource";
                schemaVersion: "5.0.0";
                prefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                declarations: import("../index.js").AbgHistoricalDeclarationProof[];
                selections: ({
                    kind: "judgment_selection";
                    selectionRef: string;
                    slotRef: string;
                    task: {
                        ref: string;
                        digest: string;
                    };
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "ruling_selection";
                    selectionRef: string;
                    slotRef: string;
                    request: {
                        ref: string;
                        digest: string;
                    };
                    continuationRef: string;
                } | {
                    kind: "execution_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                    source?: {
                        sourceRef: string;
                        cCall: {
                            ref: string;
                            digest: string;
                        };
                        executionBasis: {
                            ref: string;
                            digest: string;
                        };
                        graphFunction: {
                            ref: string;
                            digest: string;
                        };
                    } | undefined;
                } | {
                    kind: "self_conformance_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "verdict_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                })[];
                executionSources?: {
                    sourceRef: string;
                    basis: {
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
                    prefix: {
                        kind: "durable_prefix_coordinate";
                        schemaVersion: "5.0.0";
                        eventLogRef: string;
                        prefixLength: number;
                        prefixDigest: string;
                        storeIdentity: {
                            device: number;
                            inode: number;
                            eventContractDigest: string;
                        };
                        coordinateDigest: string;
                    };
                    declarations: import("../index.js").AbgHistoricalDeclarationProof[];
                }[] | undefined;
            } | {
                representation: "resource_refs_v1";
                resource: {
                    ref: string;
                    digest: string;
                };
                declarations: {
                    catalogBasisDigest: string;
                    readinessBasisDigest: string;
                    viewDigest: string;
                    proofDigest: string;
                }[];
                executionSources?: {
                    sourceRef: string;
                    basis: {
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
                    prefix: {
                        kind: "durable_prefix_coordinate";
                        schemaVersion: "5.0.0";
                        eventLogRef: string;
                        prefixLength: number;
                        prefixDigest: string;
                        storeIdentity: {
                            device: number;
                            inode: number;
                            eventContractDigest: string;
                        };
                        coordinateDigest: string;
                    };
                    declarations: {
                        catalogBasisDigest: string;
                        readinessBasisDigest: string;
                        viewDigest: string;
                        proofDigest: string;
                    }[];
                }[] | undefined;
                kind: "qualification_proof_resource";
                schemaVersion: "5.0.0";
                prefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                selections: ({
                    kind: "judgment_selection";
                    selectionRef: string;
                    slotRef: string;
                    task: {
                        ref: string;
                        digest: string;
                    };
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "ruling_selection";
                    selectionRef: string;
                    slotRef: string;
                    request: {
                        ref: string;
                        digest: string;
                    };
                    continuationRef: string;
                } | {
                    kind: "execution_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                    source?: {
                        sourceRef: string;
                        cCall: {
                            ref: string;
                            digest: string;
                        };
                        executionBasis: {
                            ref: string;
                            digest: string;
                        };
                        graphFunction: {
                            ref: string;
                            digest: string;
                        };
                    } | undefined;
                } | {
                    kind: "self_conformance_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "verdict_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                })[];
            };
            selection: {
                kind: "judgment_selection";
                selectionRef: string;
                slotRef: string;
                task: {
                    ref: string;
                    digest: string;
                };
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "ruling_selection";
                selectionRef: string;
                slotRef: string;
                request: {
                    ref: string;
                    digest: string;
                };
                continuationRef: string;
            } | {
                kind: "execution_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
                source?: {
                    sourceRef: string;
                    cCall: {
                        ref: string;
                        digest: string;
                    };
                    executionBasis: {
                        ref: string;
                        digest: string;
                    };
                    graphFunction: {
                        ref: string;
                        digest: string;
                    };
                } | undefined;
            } | {
                kind: "self_conformance_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "verdict_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            };
            effectGrant: {
                kind: "release_acceptance_grant";
                humanAuthority: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                sourceAuthority: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                sourceApproval: {
                    kind: "trusted_operator_ruling_source";
                    schemaVersion: "5.0.0";
                    authority: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    owner: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    channel: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    request: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    ruling: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    presentation: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    response: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                } | null;
                requiredEvidence: {
                    ref: string;
                    digest: `sha256:${string}`;
                }[];
                addendumRoot: string;
                artifactOutputRoot: string;
            };
            publication: {
                kind: "release_operation_observation";
                schemaVersion: "5.0.0";
                memberKey: "published_rc";
                scope: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                invocation: {
                    operationId: "abg.operation.release.snapshot";
                    memberKey: "published_rc";
                    definitionDigest: `sha256:${string}`;
                    invocationRef: string;
                    invocationPayloadDigest: `sha256:${string}`;
                    invocationDigest: `sha256:${string}`;
                };
                entryPrefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                grants: JsonValue[];
                admissionAuthority: JsonValue;
                eventResource: JsonValue;
                publicInvocation: JsonValue;
                resourceDigest: `sha256:${string}`;
                actorRef: string;
                capabilityGrants: JsonValue;
                workspaceBinding: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                productSet: JsonValue;
                dependencyLock: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                request: {
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
                    lawBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    verdict: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    requestedIdentity: {
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
                };
                proof: {
                    kind: "qualification_proof_resource";
                    schemaVersion: "5.0.0";
                    prefix: {
                        kind: "durable_prefix_coordinate";
                        schemaVersion: "5.0.0";
                        eventLogRef: string;
                        prefixLength: number;
                        prefixDigest: string;
                        storeIdentity: {
                            device: number;
                            inode: number;
                            eventContractDigest: string;
                        };
                        coordinateDigest: string;
                    };
                    declarations: import("../index.js").AbgHistoricalDeclarationProof[];
                    selections: ({
                        kind: "judgment_selection";
                        selectionRef: string;
                        slotRef: string;
                        task: {
                            ref: string;
                            digest: string;
                        };
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                    } | {
                        kind: "ruling_selection";
                        selectionRef: string;
                        slotRef: string;
                        request: {
                            ref: string;
                            digest: string;
                        };
                        continuationRef: string;
                    } | {
                        kind: "execution_selection";
                        selectionRef: string;
                        slotRef: string;
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                        source?: {
                            sourceRef: string;
                            cCall: {
                                ref: string;
                                digest: string;
                            };
                            executionBasis: {
                                ref: string;
                                digest: string;
                            };
                            graphFunction: {
                                ref: string;
                                digest: string;
                            };
                        } | undefined;
                    } | {
                        kind: "self_conformance_selection";
                        selectionRef: string;
                        slotRef: string;
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                    } | {
                        kind: "verdict_selection";
                        selectionRef: string;
                        slotRef: string;
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                    })[];
                    executionSources?: {
                        sourceRef: string;
                        basis: {
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
                        prefix: {
                            kind: "durable_prefix_coordinate";
                            schemaVersion: "5.0.0";
                            eventLogRef: string;
                            prefixLength: number;
                            prefixDigest: string;
                            storeIdentity: {
                                device: number;
                                inode: number;
                                eventContractDigest: string;
                            };
                            coordinateDigest: string;
                        };
                        declarations: import("../index.js").AbgHistoricalDeclarationProof[];
                    }[] | undefined;
                } | {
                    representation: "resource_refs_v1";
                    resource: {
                        ref: string;
                        digest: string;
                    };
                    declarations: {
                        catalogBasisDigest: string;
                        readinessBasisDigest: string;
                        viewDigest: string;
                        proofDigest: string;
                    }[];
                    executionSources?: {
                        sourceRef: string;
                        basis: {
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
                        prefix: {
                            kind: "durable_prefix_coordinate";
                            schemaVersion: "5.0.0";
                            eventLogRef: string;
                            prefixLength: number;
                            prefixDigest: string;
                            storeIdentity: {
                                device: number;
                                inode: number;
                                eventContractDigest: string;
                            };
                            coordinateDigest: string;
                        };
                        declarations: {
                            catalogBasisDigest: string;
                            readinessBasisDigest: string;
                            viewDigest: string;
                            proofDigest: string;
                        }[];
                    }[] | undefined;
                    kind: "qualification_proof_resource";
                    schemaVersion: "5.0.0";
                    prefix: {
                        kind: "durable_prefix_coordinate";
                        schemaVersion: "5.0.0";
                        eventLogRef: string;
                        prefixLength: number;
                        prefixDigest: string;
                        storeIdentity: {
                            device: number;
                            inode: number;
                            eventContractDigest: string;
                        };
                        coordinateDigest: string;
                    };
                    selections: ({
                        kind: "judgment_selection";
                        selectionRef: string;
                        slotRef: string;
                        task: {
                            ref: string;
                            digest: string;
                        };
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                    } | {
                        kind: "ruling_selection";
                        selectionRef: string;
                        slotRef: string;
                        request: {
                            ref: string;
                            digest: string;
                        };
                        continuationRef: string;
                    } | {
                        kind: "execution_selection";
                        selectionRef: string;
                        slotRef: string;
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                        source?: {
                            sourceRef: string;
                            cCall: {
                                ref: string;
                                digest: string;
                            };
                            executionBasis: {
                                ref: string;
                                digest: string;
                            };
                            graphFunction: {
                                ref: string;
                                digest: string;
                            };
                        } | undefined;
                    } | {
                        kind: "self_conformance_selection";
                        selectionRef: string;
                        slotRef: string;
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                    } | {
                        kind: "verdict_selection";
                        selectionRef: string;
                        slotRef: string;
                        programRef: string;
                        invocationAdmissionRef: string;
                        result: {
                            ref: string;
                            digest: string;
                        };
                    })[];
                };
                selection: {
                    kind: "judgment_selection";
                    selectionRef: string;
                    slotRef: string;
                    task: {
                        ref: string;
                        digest: string;
                    };
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "ruling_selection";
                    selectionRef: string;
                    slotRef: string;
                    request: {
                        ref: string;
                        digest: string;
                    };
                    continuationRef: string;
                } | {
                    kind: "execution_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                    source?: {
                        sourceRef: string;
                        cCall: {
                            ref: string;
                            digest: string;
                        };
                        executionBasis: {
                            ref: string;
                            digest: string;
                        };
                        graphFunction: {
                            ref: string;
                            digest: string;
                        };
                    } | undefined;
                } | {
                    kind: "self_conformance_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                } | {
                    kind: "verdict_selection";
                    selectionRef: string;
                    slotRef: string;
                    programRef: string;
                    invocationAdmissionRef: string;
                    result: {
                        ref: string;
                        digest: string;
                    };
                };
                effectGrant: {
                    kind: "release_publication_grant";
                    sourceRoot: string;
                    sourceCommit: string;
                    sourceTree: string;
                    sourceInventory: {
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
                    artifact: {
                        path: string;
                        ref: string;
                        digest: `sha256:${string}`;
                        snapshotName: string;
                        packageName: string;
                    };
                    manifestPath: string;
                    releaseClaimPath: string;
                    remote: string;
                    pushMode: "atomic";
                    expectedRemoteRefs: {
                        ref: string;
                        object: string;
                    }[];
                    expectedLocalRefs: {
                        ref: string;
                        object: string;
                    }[];
                    carrierRefs: {
                        ref: string;
                        expectedObject: string | null;
                    }[];
                    snapshotRoot: string;
                    artifactOutputRoot: string;
                    tagger: {
                        name: string;
                        email: string;
                        date: string;
                    };
                    tagMessage: string;
                    buildCommand: string;
                    packCommand: string;
                };
                observation: {
                    disposition: "refused" | "complete" | "incomplete_effect";
                    phase: string;
                    message: string;
                    effects: {
                        kind: string;
                        ref: string;
                        digest: string | null;
                    }[];
                    unknownEffects: string[];
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
            };
            ruling: {
                kind: "external_release_owner_ruling";
                schemaVersion: "5.0.0";
                owner: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                channel: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                request: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                presentation: {
                    ref: string;
                    digest: `sha256:${string}`;
                    byteCount: number;
                    contentBase64: string;
                };
                response: {
                    ref: string;
                    digest: `sha256:${string}`;
                    byteCount: number;
                    contentBase64: string;
                };
                inReplyTo: string;
            } | null;
        }>, {
            kind: "release_publication_receipt";
            schemaVersion: "5.0.0";
            eventResource: AbgEventResourceReceipt;
            artifact: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            artifactPath: string | null;
            admissionEventRef: string | null;
        }>;
    }>;
}>;
