import * as v from "valibot";
export * from "./qualification_contracts.js";
export declare const SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA: v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly law: v.NullableSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"law", undefined>;
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
    readonly inventory: v.NullableSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"inventory", undefined>;
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
    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"tenant_manifest", undefined>;
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
    readonly authorityMembers: v.ArraySchema<v.StrictObjectSchema<{
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
    readonly qualification: v.OptionalSchema<v.StrictObjectSchema<{
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
        readonly proof: v.StrictObjectSchema<{
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
        readonly sourceMembers: v.ArraySchema<v.StrictObjectSchema<{
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
        readonly coverageCatalog: v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"coverage_catalog", undefined>;
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
        readonly verification: v.OptionalSchema<v.StrictObjectSchema<{
            readonly recipe: v.StrictObjectSchema<{
                readonly entryKind: v.LiteralSchema<"verification_recipe", undefined>;
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
            readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly kind: v.LiteralSchema<"self_conformance_input", undefined>;
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
    readonly applications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
}, undefined>;
export declare const SELF_CONFORMANCE_INPUT_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"self_conformance_input", undefined>;
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
    readonly law: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
    readonly inventory: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
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
    readonly authorityMembers: v.ArraySchema<v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly applications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly qualification: v.OptionalSchema<v.StrictObjectSchema<{
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
        readonly sourceMembers: v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly coverageCatalog: v.StrictObjectSchema<{
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
        readonly verification: v.OptionalSchema<v.StrictObjectSchema<{
            readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly recipe: v.StrictObjectSchema<{
                readonly contentBase64: v.StringSchema<undefined>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>;
            readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
    readonly resource: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly law: v.NullableSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"law", undefined>;
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
    readonly inventory: v.NullableSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"inventory", undefined>;
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
    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
        readonly entryKind: v.LiteralSchema<"tenant_manifest", undefined>;
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
    readonly authorityMembers: v.ArraySchema<v.StrictObjectSchema<{
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
    readonly qualification: v.OptionalSchema<v.StrictObjectSchema<{
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
        readonly proof: v.StrictObjectSchema<{
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
        readonly sourceMembers: v.ArraySchema<v.StrictObjectSchema<{
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
        readonly coverageCatalog: v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"coverage_catalog", undefined>;
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
        readonly verification: v.OptionalSchema<v.StrictObjectSchema<{
            readonly recipe: v.StrictObjectSchema<{
                readonly entryKind: v.LiteralSchema<"verification_recipe", undefined>;
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
            readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly kind: v.LiteralSchema<"self_conformance_input", undefined>;
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
    readonly applications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
}, undefined>], undefined>;
declare const selfConformanceEmbeddedDataSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"self_conformance_input", undefined>;
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
    readonly law: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
    readonly inventory: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
    readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>;
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
    readonly authorityMembers: v.ArraySchema<v.StrictObjectSchema<{
        readonly contentBase64: v.StringSchema<undefined>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly applications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly qualification: v.OptionalSchema<v.StrictObjectSchema<{
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
        readonly sourceMembers: v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly coverageCatalog: v.StrictObjectSchema<{
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
        readonly verification: v.OptionalSchema<v.StrictObjectSchema<{
            readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly recipe: v.StrictObjectSchema<{
                readonly contentBase64: v.StringSchema<undefined>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>;
            readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
}, undefined>;
export type SelfConformanceEmbeddedInput = v.InferOutput<typeof selfConformanceEmbeddedDataSchema>;
export type SelfConformanceReferenceInput = v.InferOutput<typeof SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA>;
export declare const SELF_CONFORMANCE_REFERENCE_RESULT_SCHEMA: v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
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
    readonly kind: v.LiteralSchema<"self_conformance_result", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventoryDigest: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
    readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly owner: v.StrictObjectSchema<{
        readonly installId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly installDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly artifactDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly workspaceBinding: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
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
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogAssetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly ruleApplications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly findings: v.ArraySchema<v.StrictObjectSchema<{
        readonly diagnostic: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly sourceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly surfaceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"], undefined>;
        readonly provenance: v.PicklistSchema<["C", "J", "O", "J_required", "O_required"], undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly detail: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
    readonly qualificationVerdict: v.LiteralSchema<false, undefined>;
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
            environment: import("../index.js").JsonValue;
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
            reports: import("../index.js").JsonValue;
        }[];
        lintOutcome: import("../index.js").JsonValue;
        predicateOutcomes: {
            declaration: import("../index.js").JsonValue;
            observation: import("../index.js").JsonValue;
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
            cases: import("../index.js").JsonValue[];
            summaries: import("../index.js").JsonValue[];
            complete: boolean;
        }[];
        disposition: "passed" | "failed" | "blocked_incomplete";
        diagnostics: string[];
    }>, undefined>, undefined>;
}, undefined>;
export declare const SELF_CONFORMANCE_RESULT_SCHEMA: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"self_conformance_result", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventoryDigest: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
    readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly owner: v.StrictObjectSchema<{
        readonly installId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly installDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly artifactDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly workspaceBinding: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
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
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogAssetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly ruleApplications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
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
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly findings: v.ArraySchema<v.StrictObjectSchema<{
        readonly diagnostic: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly sourceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly surfaceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"], undefined>;
        readonly provenance: v.PicklistSchema<["C", "J", "O", "J_required", "O_required"], undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly detail: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
    readonly qualificationVerdict: v.LiteralSchema<false, undefined>;
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
            environment: import("../index.js").JsonValue;
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
            reports: import("../index.js").JsonValue;
        }[];
        lintOutcome: import("../index.js").JsonValue;
        predicateOutcomes: {
            declaration: import("../index.js").JsonValue;
            observation: import("../index.js").JsonValue;
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
            cases: import("../index.js").JsonValue[];
            summaries: import("../index.js").JsonValue[];
            complete: boolean;
        }[];
        disposition: "passed" | "failed" | "blocked_incomplete";
        diagnostics: string[];
    }>, undefined>, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
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
    readonly kind: v.LiteralSchema<"self_conformance_result", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly subjectBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly lawBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly inventoryDigest: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
    readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly owner: v.StrictObjectSchema<{
        readonly installId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly installDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly artifactDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly workspaceBinding: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
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
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogAssetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly ruleApplications: v.ArraySchema<v.StrictObjectSchema<{
        readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
        readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>, undefined>;
    readonly findings: v.ArraySchema<v.StrictObjectSchema<{
        readonly diagnostic: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly sourceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly surfaceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"], undefined>;
        readonly provenance: v.PicklistSchema<["C", "J", "O", "J_required", "O_required"], undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly detail: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
    readonly qualificationVerdict: v.LiteralSchema<false, undefined>;
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
            environment: import("../index.js").JsonValue;
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
            reports: import("../index.js").JsonValue;
        }[];
        lintOutcome: import("../index.js").JsonValue;
        predicateOutcomes: {
            declaration: import("../index.js").JsonValue;
            observation: import("../index.js").JsonValue;
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
            cases: import("../index.js").JsonValue[];
            summaries: import("../index.js").JsonValue[];
            complete: boolean;
        }[];
        disposition: "passed" | "failed" | "blocked_incomplete";
        diagnostics: string[];
    }>, undefined>, undefined>;
}, undefined>], undefined>;
declare const selfConformanceDataSchemas: {
    readonly input: v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"self_conformance_input", undefined>;
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
        readonly law: v.NullableSchema<v.StrictObjectSchema<{
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
        }, undefined>, undefined>;
        readonly inventory: v.NullableSchema<v.StrictObjectSchema<{
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
        }, undefined>, undefined>;
        readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
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
        }, undefined>, undefined>;
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
        readonly authorityMembers: v.ArraySchema<v.StrictObjectSchema<{
            readonly contentBase64: v.StringSchema<undefined>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly applications: v.ArraySchema<v.StrictObjectSchema<{
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
            readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
        readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
            readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly qualification: v.OptionalSchema<v.StrictObjectSchema<{
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
            readonly sourceMembers: v.ArraySchema<v.StrictObjectSchema<{
                readonly contentBase64: v.StringSchema<undefined>;
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>, undefined>;
            readonly coverageCatalog: v.StrictObjectSchema<{
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
            readonly verification: v.OptionalSchema<v.StrictObjectSchema<{
                readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly recipe: v.StrictObjectSchema<{
                    readonly contentBase64: v.StringSchema<undefined>;
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                    readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
                    readonly byteCount: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                }, undefined>;
                readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
        readonly resource: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly law: v.NullableSchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"law", undefined>;
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
        readonly inventory: v.NullableSchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"inventory", undefined>;
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
        readonly tenantManifest: v.NullableSchema<v.StrictObjectSchema<{
            readonly entryKind: v.LiteralSchema<"tenant_manifest", undefined>;
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
        readonly authorityMembers: v.ArraySchema<v.StrictObjectSchema<{
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
        readonly qualification: v.OptionalSchema<v.StrictObjectSchema<{
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
            readonly proof: v.StrictObjectSchema<{
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
            readonly sourceMembers: v.ArraySchema<v.StrictObjectSchema<{
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
            readonly coverageCatalog: v.StrictObjectSchema<{
                readonly entryKind: v.LiteralSchema<"coverage_catalog", undefined>;
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
            readonly verification: v.OptionalSchema<v.StrictObjectSchema<{
                readonly recipe: v.StrictObjectSchema<{
                    readonly entryKind: v.LiteralSchema<"verification_recipe", undefined>;
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
                readonly executionSelectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly recipePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            }, undefined>, undefined>;
        }, undefined>, undefined>;
        readonly kind: v.LiteralSchema<"self_conformance_input", undefined>;
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
        readonly applications: v.ArraySchema<v.StrictObjectSchema<{
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
            readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
        readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
            readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>], undefined>;
    readonly result: v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"self_conformance_result", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventoryDigest: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
        readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly owner: v.StrictObjectSchema<{
            readonly installId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly installDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly artifactDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly workspaceBinding: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
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
            readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly catalogAssetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
        readonly ruleApplications: v.ArraySchema<v.StrictObjectSchema<{
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
            readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
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
        readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
            readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly findings: v.ArraySchema<v.StrictObjectSchema<{
            readonly diagnostic: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly sourceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly surfaceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly disposition: v.PicklistSchema<["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"], undefined>;
            readonly provenance: v.PicklistSchema<["C", "J", "O", "J_required", "O_required"], undefined>;
            readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly detail: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
        readonly qualificationVerdict: v.LiteralSchema<false, undefined>;
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
                environment: import("../index.js").JsonValue;
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
                reports: import("../index.js").JsonValue;
            }[];
            lintOutcome: import("../index.js").JsonValue;
            predicateOutcomes: {
                declaration: import("../index.js").JsonValue;
                observation: import("../index.js").JsonValue;
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
                cases: import("../index.js").JsonValue[];
                summaries: import("../index.js").JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }>, undefined>, undefined>;
    }, undefined>, v.StrictObjectSchema<{
        readonly representation: v.LiteralSchema<"resource_refs_v1", undefined>;
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
        readonly kind: v.LiteralSchema<"self_conformance_result", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly resultRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly resultDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly subjectBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly lawBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly inventoryDigest: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>, undefined>;
        readonly inputDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly owner: v.StrictObjectSchema<{
            readonly installId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly installDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly artifactDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly workspaceBinding: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
                readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            }, undefined>;
            readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
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
            readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly catalogAssetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
        readonly ruleApplications: v.ArraySchema<v.StrictObjectSchema<{
            readonly ruleRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly surfaceRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly applicability: v.PicklistSchema<["applicable", "inapplicable", "unknown"], undefined>;
            readonly premiseEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly evaluationEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly rulingEvidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
        readonly evidenceCitations: v.ArraySchema<v.StrictObjectSchema<{
            readonly role: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly subjectBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly lawBasisDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly scopeRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly admissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly findings: v.ArraySchema<v.StrictObjectSchema<{
            readonly diagnostic: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly ruleRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly sourceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly surfaceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly disposition: v.PicklistSchema<["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"], undefined>;
            readonly provenance: v.PicklistSchema<["C", "J", "O", "J_required", "O_required"], undefined>;
            readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly detail: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "blocked_incomplete"], undefined>;
        readonly qualificationVerdict: v.LiteralSchema<false, undefined>;
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
                environment: import("../index.js").JsonValue;
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
                reports: import("../index.js").JsonValue;
            }[];
            lintOutcome: import("../index.js").JsonValue;
            predicateOutcomes: {
                declaration: import("../index.js").JsonValue;
                observation: import("../index.js").JsonValue;
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
                cases: import("../index.js").JsonValue[];
                summaries: import("../index.js").JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }>, undefined>, undefined>;
    }, undefined>], undefined>;
    readonly owner: v.StrictObjectSchema<{
        readonly installId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly installDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly artifactDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly productContentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly manifestDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly publicationDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly workspaceBinding: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly cCallDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
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
        readonly catalogDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly catalogRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly catalogAssetPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly finding: v.StrictObjectSchema<{
        readonly diagnostic: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly ruleRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly sourceRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly surfaceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly disposition: v.PicklistSchema<["passed", "failed", "inapplicable_with_reason", "blocked_incomplete", "accepted_reentry"], undefined>;
        readonly provenance: v.PicklistSchema<["C", "J", "O", "J_required", "O_required"], undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly detail: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
};
export type SelfConformanceInput = v.InferOutput<typeof selfConformanceDataSchemas.input>;
export type SelfConformanceResult = v.InferOutput<typeof selfConformanceDataSchemas.result>;
export type SelfConformanceOwner = v.InferOutput<typeof selfConformanceDataSchemas.owner>;
export type SelfConformanceFinding = v.InferOutput<typeof selfConformanceDataSchemas.finding>;
export declare function isSelfConformanceInput(value: unknown): value is SelfConformanceInput;
export declare function isSelfConformanceResult(value: unknown): value is SelfConformanceResult;
