import * as v from "valibot";
import { type ExactOwnerOperationPort } from "../shared/public_function_contracts.js";
export declare const canonicalCheckerTargetIdentitySchema: v.StrictObjectSchema<{
    readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly targetPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
    readonly boundaryDeclarationWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly declarationKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly exportedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>, undefined>, v.CheckAction<{
        declarationPath: string;
        declarationDigest: `sha256:${string}`;
        declarationKind: string;
        exportedName: string;
    }[], "unique_items">]>, v.MinLengthAction<{
        declarationPath: string;
        declarationDigest: `sha256:${string}`;
        declarationKind: string;
        exportedName: string;
    }[], 1, undefined>]>;
    readonly targetIdentityDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
}, undefined>;
export declare const contractExternalOccurrenceSchema: v.StrictObjectSchema<{
    readonly occurrenceRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly sourceProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly sourceContractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly sourcePackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly sourceNamedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly sourceWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly witnessDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly selectorRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly physicalRelationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly sourceStart: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly sourceEnd: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly origin: v.UnionSchema<[v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"import_declaration", undefined>;
            readonly clause: v.PicklistSchema<["side_effect", "default", "named", "namespace"], undefined>;
            readonly declarationTypeOnly: v.BooleanSchema<undefined>;
            readonly specifierTypeOnly: v.BooleanSchema<undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"export_declaration", undefined>;
            readonly clause: v.PicklistSchema<["named", "star", "namespace"], undefined>;
            readonly declarationTypeOnly: v.BooleanSchema<undefined>;
            readonly specifierTypeOnly: v.BooleanSchema<undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"import_type_expression", undefined>;
            readonly operator: v.PicklistSchema<["type", "typeof"], undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"import_equals_declaration", undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"type_reference_directive", undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"module_augmentation", undefined>;
        }, undefined>], undefined>;
        readonly selection: v.UnionSchema<[v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"module", undefined>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"name", undefined>;
            readonly targetName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly exposedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"namespace", undefined>;
            readonly exposedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"all", undefined>;
        }, undefined>], undefined>;
    }, undefined>, undefined>, v.CheckAction<{
        witnessDigest: `sha256:${string}`;
        selectorRef: `sha256:${string}`;
        physicalRelationRef: string;
        declarationPath: string;
        declarationDigest: `sha256:${string}`;
        sourceStart: number;
        sourceEnd: number;
        origin: {
            kind: "import_declaration";
            clause: "default" | "side_effect" | "named" | "namespace";
            declarationTypeOnly: boolean;
            specifierTypeOnly: boolean;
        } | {
            kind: "export_declaration";
            clause: "named" | "namespace" | "star";
            declarationTypeOnly: boolean;
            specifierTypeOnly: boolean;
        } | {
            kind: "import_type_expression";
            operator: "type" | "typeof";
        } | {
            kind: "import_equals_declaration";
        } | {
            kind: "type_reference_directive";
        } | {
            kind: "module_augmentation";
        };
        selection: {
            kind: "module";
        } | {
            kind: "name";
            targetName: string;
            exposedName: string;
        } | {
            kind: "namespace";
            exposedName: string;
        } | {
            kind: "all";
        };
    }[], "unique_items">]>, v.MinLengthAction<{
        witnessDigest: `sha256:${string}`;
        selectorRef: `sha256:${string}`;
        physicalRelationRef: string;
        declarationPath: string;
        declarationDigest: `sha256:${string}`;
        sourceStart: number;
        sourceEnd: number;
        origin: {
            kind: "import_declaration";
            clause: "default" | "side_effect" | "named" | "namespace";
            declarationTypeOnly: boolean;
            specifierTypeOnly: boolean;
        } | {
            kind: "export_declaration";
            clause: "named" | "namespace" | "star";
            declarationTypeOnly: boolean;
            specifierTypeOnly: boolean;
        } | {
            kind: "import_type_expression";
            operator: "type" | "typeof";
        } | {
            kind: "import_equals_declaration";
        } | {
            kind: "type_reference_directive";
        } | {
            kind: "module_augmentation";
        };
        selection: {
            kind: "module";
        } | {
            kind: "name";
            targetName: string;
            exposedName: string;
        } | {
            kind: "namespace";
            exposedName: string;
        } | {
            kind: "all";
        };
    }[], 1, undefined>]>;
    readonly semanticSelection: v.StrictObjectSchema<{
        readonly derivation: v.PicklistSchema<["named", "namespace_member", "star_member", "import_equals_member", "import_type_member"], undefined>;
        readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly exposedMemberPath: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly semanticUse: v.PicklistSchema<["type_reference", "value_reference", "type_query", "namespace_reference"], undefined>;
        readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
    }, undefined>;
    readonly checkerTarget: v.StrictObjectSchema<{
        readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly targetPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
        readonly boundaryDeclarationWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly declarationKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly exportedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>, v.CheckAction<{
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[], "unique_items">]>, v.MinLengthAction<{
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[], 1, undefined>]>;
        readonly targetIdentityDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>;
export declare const pendingSelectorDispositionSchema: v.UnionSchema<[v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"semantic_occurrences", undefined>;
    readonly selectorRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly occurrenceRefs: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<`sha256:${string}`, `sha256:${string}`>, undefined>, v.CheckAction<`sha256:${string}`[], "unique_items">]>, v.MinLengthAction<`sha256:${string}`[], 1, undefined>]>;
}, undefined>, v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"no_external_contribution", undefined>;
    readonly selectorRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly reason: v.PicklistSchema<["locally_shadowed", "not_in_source_contract_meaning"], undefined>;
    readonly checkerWitnessDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
}, undefined>], undefined>;
export declare const resolvedNativeContractBindingSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"external_binding", undefined>;
    readonly sourceOccurrenceRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly directDependencyEdge: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"requires", undefined>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compatibilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiredContractRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        readonly requiredCapabilityRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetContractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetNamedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly checkerTarget: v.StrictObjectSchema<{
        readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly targetPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
        readonly boundaryDeclarationWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly declarationKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly exportedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>, v.CheckAction<{
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[], "unique_items">]>, v.MinLengthAction<{
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[], 1, undefined>]>;
        readonly targetIdentityDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>;
export declare const resolvedNativeContractBindingSetSchema: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"external_binding", undefined>;
    readonly sourceOccurrenceRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly directDependencyEdge: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"requires", undefined>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly compatibilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiredContractRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        readonly requiredCapabilityRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
    }, undefined>;
    readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetContractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly targetNamedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly checkerTarget: v.StrictObjectSchema<{
        readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly targetPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
        readonly boundaryDeclarationWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly declarationKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly exportedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>, undefined>, v.CheckAction<{
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[], "unique_items">]>, v.MinLengthAction<{
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[], 1, undefined>]>;
        readonly targetIdentityDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>, undefined>, v.CheckAction<{
    kind: "external_binding";
    sourceOccurrenceRef: `sha256:${string}`;
    directDependencyEdge: {
        kind: "requires";
        productId: string;
        packageVersion: string;
        compatibilityRef: string;
        requiredContractRefs: string[];
        requiredCapabilityRefs: string[];
    };
    targetProductContentDigest: `sha256:${string}`;
    targetContractRef: string;
    targetContractDigest: `sha256:${string}`;
    targetPackageExportPath: string;
    targetNamedSymbol: string;
    checkerTarget: {
        targetProductContentDigest: `sha256:${string}`;
        targetPackageName: string;
        targetPackageExportPath: string;
        targetExportedSymbol: string;
        requiredSymbolSpace: "value" | "type" | "namespace";
        boundaryDeclarationWitnesses: {
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            declarationKind: string;
            exportedName: string;
        }[];
        targetIdentityDigest: `sha256:${string}`;
    };
}[], "unique_items">]>;
export declare const resolvedNativeContractClosureSchema: v.StrictObjectSchema<{
    readonly selectorDispositions: v.SchemaWithPipe<readonly [v.ArraySchema<v.UnionSchema<[v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"semantic_occurrences", undefined>;
        readonly selectorRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly occurrenceRefs: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.GenericSchema<`sha256:${string}`, `sha256:${string}`>, undefined>, v.CheckAction<`sha256:${string}`[], "unique_items">]>, v.MinLengthAction<`sha256:${string}`[], 1, undefined>]>;
    }, undefined>, v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"no_external_contribution", undefined>;
        readonly selectorRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly reason: v.PicklistSchema<["locally_shadowed", "not_in_source_contract_meaning"], undefined>;
        readonly checkerWitnessDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>], undefined>, undefined>, v.CheckAction<({
        kind: "semantic_occurrences";
        selectorRef: `sha256:${string}`;
        occurrenceRefs: `sha256:${string}`[];
    } | {
        kind: "no_external_contribution";
        selectorRef: `sha256:${string}`;
        reason: "locally_shadowed" | "not_in_source_contract_meaning";
        checkerWitnessDigest: `sha256:${string}`;
    })[], "unique_items">]>;
    readonly occurrences: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly occurrenceRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly sourceProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly sourceContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly sourceContractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly sourcePackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly sourceNamedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly sourceWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly witnessDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly selectorRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly physicalRelationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly sourceStart: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly sourceEnd: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly origin: v.UnionSchema<[v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"import_declaration", undefined>;
                readonly clause: v.PicklistSchema<["side_effect", "default", "named", "namespace"], undefined>;
                readonly declarationTypeOnly: v.BooleanSchema<undefined>;
                readonly specifierTypeOnly: v.BooleanSchema<undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"export_declaration", undefined>;
                readonly clause: v.PicklistSchema<["named", "star", "namespace"], undefined>;
                readonly declarationTypeOnly: v.BooleanSchema<undefined>;
                readonly specifierTypeOnly: v.BooleanSchema<undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"import_type_expression", undefined>;
                readonly operator: v.PicklistSchema<["type", "typeof"], undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"import_equals_declaration", undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"type_reference_directive", undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"module_augmentation", undefined>;
            }, undefined>], undefined>;
            readonly selection: v.UnionSchema<[v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"module", undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"name", undefined>;
                readonly targetName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly exposedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"namespace", undefined>;
                readonly exposedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly kind: v.LiteralSchema<"all", undefined>;
            }, undefined>], undefined>;
        }, undefined>, undefined>, v.CheckAction<{
            witnessDigest: `sha256:${string}`;
            selectorRef: `sha256:${string}`;
            physicalRelationRef: string;
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            sourceStart: number;
            sourceEnd: number;
            origin: {
                kind: "import_declaration";
                clause: "default" | "side_effect" | "named" | "namespace";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "export_declaration";
                clause: "named" | "namespace" | "star";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "import_type_expression";
                operator: "type" | "typeof";
            } | {
                kind: "import_equals_declaration";
            } | {
                kind: "type_reference_directive";
            } | {
                kind: "module_augmentation";
            };
            selection: {
                kind: "module";
            } | {
                kind: "name";
                targetName: string;
                exposedName: string;
            } | {
                kind: "namespace";
                exposedName: string;
            } | {
                kind: "all";
            };
        }[], "unique_items">]>, v.MinLengthAction<{
            witnessDigest: `sha256:${string}`;
            selectorRef: `sha256:${string}`;
            physicalRelationRef: string;
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            sourceStart: number;
            sourceEnd: number;
            origin: {
                kind: "import_declaration";
                clause: "default" | "side_effect" | "named" | "namespace";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "export_declaration";
                clause: "named" | "namespace" | "star";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "import_type_expression";
                operator: "type" | "typeof";
            } | {
                kind: "import_equals_declaration";
            } | {
                kind: "type_reference_directive";
            } | {
                kind: "module_augmentation";
            };
            selection: {
                kind: "module";
            } | {
                kind: "name";
                targetName: string;
                exposedName: string;
            } | {
                kind: "namespace";
                exposedName: string;
            } | {
                kind: "all";
            };
        }[], 1, undefined>]>;
        readonly semanticSelection: v.StrictObjectSchema<{
            readonly derivation: v.PicklistSchema<["named", "namespace_member", "star_member", "import_equals_member", "import_type_member"], undefined>;
            readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly exposedMemberPath: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly semanticUse: v.PicklistSchema<["type_reference", "value_reference", "type_query", "namespace_reference"], undefined>;
            readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
        }, undefined>;
        readonly checkerTarget: v.StrictObjectSchema<{
            readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly targetPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
            readonly boundaryDeclarationWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly declarationKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly exportedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, v.CheckAction<{
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[], "unique_items">]>, v.MinLengthAction<{
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[], 1, undefined>]>;
            readonly targetIdentityDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>, undefined>, v.CheckAction<{
        occurrenceRef: `sha256:${string}`;
        sourceProductContentDigest: `sha256:${string}`;
        sourceContractRef: string;
        sourceContractDigest: `sha256:${string}`;
        sourcePackageExportPath: string;
        sourceNamedSymbol: string;
        sourceWitnesses: {
            witnessDigest: `sha256:${string}`;
            selectorRef: `sha256:${string}`;
            physicalRelationRef: string;
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            sourceStart: number;
            sourceEnd: number;
            origin: {
                kind: "import_declaration";
                clause: "default" | "side_effect" | "named" | "namespace";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "export_declaration";
                clause: "named" | "namespace" | "star";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "import_type_expression";
                operator: "type" | "typeof";
            } | {
                kind: "import_equals_declaration";
            } | {
                kind: "type_reference_directive";
            } | {
                kind: "module_augmentation";
            };
            selection: {
                kind: "module";
            } | {
                kind: "name";
                targetName: string;
                exposedName: string;
            } | {
                kind: "namespace";
                exposedName: string;
            } | {
                kind: "all";
            };
        }[];
        semanticSelection: {
            derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
            targetExportedSymbol: string;
            exposedMemberPath: string[];
            semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
            requiredSymbolSpace: "value" | "type" | "namespace";
        };
        checkerTarget: {
            targetProductContentDigest: `sha256:${string}`;
            targetPackageName: string;
            targetPackageExportPath: string;
            targetExportedSymbol: string;
            requiredSymbolSpace: "value" | "type" | "namespace";
            boundaryDeclarationWitnesses: {
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[];
            targetIdentityDigest: `sha256:${string}`;
        };
    }[], "unique_items">]>;
    readonly nativeBindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"external_binding", undefined>;
        readonly sourceOccurrenceRef: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly directDependencyEdge: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"requires", undefined>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly packageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly compatibilityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requiredContractRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
            readonly requiredCapabilityRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>;
        }, undefined>;
        readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly targetContractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetContractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly targetNamedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly checkerTarget: v.StrictObjectSchema<{
            readonly targetProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly targetPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetPackageExportPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly targetExportedSymbol: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly requiredSymbolSpace: v.PicklistSchema<["type", "value", "namespace"], undefined>;
            readonly boundaryDeclarationWitnesses: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
                readonly declarationPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly declarationDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly declarationKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly exportedName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            }, undefined>, undefined>, v.CheckAction<{
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[], "unique_items">]>, v.MinLengthAction<{
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[], 1, undefined>]>;
            readonly targetIdentityDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>, undefined>, v.CheckAction<{
        kind: "external_binding";
        sourceOccurrenceRef: `sha256:${string}`;
        directDependencyEdge: {
            kind: "requires";
            productId: string;
            packageVersion: string;
            compatibilityRef: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        };
        targetProductContentDigest: `sha256:${string}`;
        targetContractRef: string;
        targetContractDigest: `sha256:${string}`;
        targetPackageExportPath: string;
        targetNamedSymbol: string;
        checkerTarget: {
            targetProductContentDigest: `sha256:${string}`;
            targetPackageName: string;
            targetPackageExportPath: string;
            targetExportedSymbol: string;
            requiredSymbolSpace: "value" | "type" | "namespace";
            boundaryDeclarationWitnesses: {
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[];
            targetIdentityDigest: `sha256:${string}`;
        };
    }[], "unique_items">]>;
}, undefined>;
export type ResolvedNativeContractClosure = v.InferOutput<typeof resolvedNativeContractClosureSchema>;
export type ResolvedNativeContractClosureAdmission = Readonly<{
    readonly disposition: "admitted";
    readonly value: ResolvedNativeContractClosure;
}> | Readonly<{
    readonly disposition: "refused";
    readonly issuePaths: readonly string[];
}>;
/** Product-resolver semantic conservation over its structurally projected row. */
export declare function admitResolvedNativeContractClosure(verifiedPendingSelectorRefs: readonly string[], candidate: unknown): ResolvedNativeContractClosureAdmission;
declare const resolve: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.product.resolve";
    readonly memberKey: "resolve";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    requirements: {
        productId: string;
        packageVersion: string;
        requiredContractRefs: string[];
        requiredCapabilityRefs: string[];
    }[];
    verifiedCandidates: {
        invocation: {
            ref: string;
            digest: `sha256:${string}`;
        };
        outcome: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }[];
}, {
    requirements: {
        productId: string;
        packageVersion: string;
        requiredContractRefs: string[];
        requiredCapabilityRefs: string[];
    }[];
    verifiedCandidates: {
        invocation: {
            ref: string;
            digest: `sha256:${string}`;
        };
        outcome: {
            ref: string;
            digest: `sha256:${string}`;
        };
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    selections: {
        requirement: {
            productId: string;
            packageVersion: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        };
        product: {
            ref: string;
            digest: `sha256:${string}`;
        };
        verification: {
            invocation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outcome: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }[];
    dependencyEdges: {
        kind: "requires";
        fromProductId: string;
        toProductId: string;
        packageVersion: string;
        compatibilityRef: string;
        compatibilityDisposition: "compatible";
        requiredContractRefs: string[];
        requiredCapabilityRefs: string[];
    }[];
    selectorDispositions: ({
        kind: "semantic_occurrences";
        selectorRef: `sha256:${string}`;
        occurrenceRefs: `sha256:${string}`[];
    } | {
        kind: "no_external_contribution";
        selectorRef: `sha256:${string}`;
        reason: "locally_shadowed" | "not_in_source_contract_meaning";
        checkerWitnessDigest: `sha256:${string}`;
    })[];
    occurrences: {
        occurrenceRef: `sha256:${string}`;
        sourceProductContentDigest: `sha256:${string}`;
        sourceContractRef: string;
        sourceContractDigest: `sha256:${string}`;
        sourcePackageExportPath: string;
        sourceNamedSymbol: string;
        sourceWitnesses: {
            witnessDigest: `sha256:${string}`;
            selectorRef: `sha256:${string}`;
            physicalRelationRef: string;
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            sourceStart: number;
            sourceEnd: number;
            origin: {
                kind: "import_declaration";
                clause: "default" | "side_effect" | "named" | "namespace";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "export_declaration";
                clause: "named" | "namespace" | "star";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "import_type_expression";
                operator: "type" | "typeof";
            } | {
                kind: "import_equals_declaration";
            } | {
                kind: "type_reference_directive";
            } | {
                kind: "module_augmentation";
            };
            selection: {
                kind: "module";
            } | {
                kind: "name";
                targetName: string;
                exposedName: string;
            } | {
                kind: "namespace";
                exposedName: string;
            } | {
                kind: "all";
            };
        }[];
        semanticSelection: {
            derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
            targetExportedSymbol: string;
            exposedMemberPath: string[];
            semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
            requiredSymbolSpace: "value" | "type" | "namespace";
        };
        checkerTarget: {
            targetProductContentDigest: `sha256:${string}`;
            targetPackageName: string;
            targetPackageExportPath: string;
            targetExportedSymbol: string;
            requiredSymbolSpace: "value" | "type" | "namespace";
            boundaryDeclarationWitnesses: {
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[];
            targetIdentityDigest: `sha256:${string}`;
        };
    }[];
    nativeBindings: {
        kind: "external_binding";
        sourceOccurrenceRef: `sha256:${string}`;
        directDependencyEdge: {
            kind: "requires";
            productId: string;
            packageVersion: string;
            compatibilityRef: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        };
        targetProductContentDigest: `sha256:${string}`;
        targetContractRef: string;
        targetContractDigest: `sha256:${string}`;
        targetPackageExportPath: string;
        targetNamedSymbol: string;
        checkerTarget: {
            targetProductContentDigest: `sha256:${string}`;
            targetPackageName: string;
            targetPackageExportPath: string;
            targetExportedSymbol: string;
            requiredSymbolSpace: "value" | "type" | "namespace";
            boundaryDeclarationWitnesses: {
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[];
            targetIdentityDigest: `sha256:${string}`;
        };
    }[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    selections: {
        requirement: {
            productId: string;
            packageVersion: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        };
        product: {
            ref: string;
            digest: `sha256:${string}`;
        };
        verification: {
            invocation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outcome: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }[];
    dependencyEdges: {
        kind: "requires";
        fromProductId: string;
        toProductId: string;
        packageVersion: string;
        compatibilityRef: string;
        compatibilityDisposition: "compatible";
        requiredContractRefs: string[];
        requiredCapabilityRefs: string[];
    }[];
    selectorDispositions: ({
        kind: "semantic_occurrences";
        selectorRef: `sha256:${string}`;
        occurrenceRefs: `sha256:${string}`[];
    } | {
        kind: "no_external_contribution";
        selectorRef: `sha256:${string}`;
        reason: "locally_shadowed" | "not_in_source_contract_meaning";
        checkerWitnessDigest: `sha256:${string}`;
    })[];
    occurrences: {
        occurrenceRef: `sha256:${string}`;
        sourceProductContentDigest: `sha256:${string}`;
        sourceContractRef: string;
        sourceContractDigest: `sha256:${string}`;
        sourcePackageExportPath: string;
        sourceNamedSymbol: string;
        sourceWitnesses: {
            witnessDigest: `sha256:${string}`;
            selectorRef: `sha256:${string}`;
            physicalRelationRef: string;
            declarationPath: string;
            declarationDigest: `sha256:${string}`;
            sourceStart: number;
            sourceEnd: number;
            origin: {
                kind: "import_declaration";
                clause: "default" | "side_effect" | "named" | "namespace";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "export_declaration";
                clause: "named" | "namespace" | "star";
                declarationTypeOnly: boolean;
                specifierTypeOnly: boolean;
            } | {
                kind: "import_type_expression";
                operator: "type" | "typeof";
            } | {
                kind: "import_equals_declaration";
            } | {
                kind: "type_reference_directive";
            } | {
                kind: "module_augmentation";
            };
            selection: {
                kind: "module";
            } | {
                kind: "name";
                targetName: string;
                exposedName: string;
            } | {
                kind: "namespace";
                exposedName: string;
            } | {
                kind: "all";
            };
        }[];
        semanticSelection: {
            derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
            targetExportedSymbol: string;
            exposedMemberPath: string[];
            semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
            requiredSymbolSpace: "value" | "type" | "namespace";
        };
        checkerTarget: {
            targetProductContentDigest: `sha256:${string}`;
            targetPackageName: string;
            targetPackageExportPath: string;
            targetExportedSymbol: string;
            requiredSymbolSpace: "value" | "type" | "namespace";
            boundaryDeclarationWitnesses: {
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[];
            targetIdentityDigest: `sha256:${string}`;
        };
    }[];
    nativeBindings: {
        kind: "external_binding";
        sourceOccurrenceRef: `sha256:${string}`;
        directDependencyEdge: {
            kind: "requires";
            productId: string;
            packageVersion: string;
            compatibilityRef: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        };
        targetProductContentDigest: `sha256:${string}`;
        targetContractRef: string;
        targetContractDigest: `sha256:${string}`;
        targetPackageExportPath: string;
        targetNamedSymbol: string;
        checkerTarget: {
            targetProductContentDigest: `sha256:${string}`;
            targetPackageName: string;
            targetPackageExportPath: string;
            targetExportedSymbol: string;
            requiredSymbolSpace: "value" | "type" | "namespace";
            boundaryDeclarationWitnesses: {
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                declarationKind: string;
                exportedName: string;
            }[];
            targetIdentityDigest: `sha256:${string}`;
        };
    }[];
    residuals: {
        kind: "typed_residual";
        code: string;
        subjectRef: string;
        message: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
declare const bind: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
    readonly operationId: "abg.operation.workspace.bind";
    readonly memberKey: "bind";
}, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    workspaceAuthority: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installedSet: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaredRoots: {
        rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
        path: string;
    }[];
}, {
    workspaceAuthority: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installedSet: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaredRoots: {
        rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
        path: string;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installedSet: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaredRoots: {
        rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
        path: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}, {
    binding: {
        ref: string;
        digest: `sha256:${string}`;
    };
    installedSet: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
    resolvedLock: {
        ref: string;
        digest: `sha256:${string}`;
    };
    declaredRoots: {
        rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
        path: string;
    }[];
    provenance: {
        ref: string;
        digest: `sha256:${string}`;
    }[];
}>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
    code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
    issuePaths: string[];
    evidenceRefs: string[];
}, {
    code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
    issuePaths: string[];
    evidenceRefs: string[];
}>, null>;
export declare const PRODUCT_ENVIRONMENT_CONTRACTS: Readonly<{
    resolve: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.resolve";
        readonly memberKey: "resolve";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        requirements: {
            productId: string;
            packageVersion: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        }[];
        verifiedCandidates: {
            invocation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outcome: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }[];
    }, {
        requirements: {
            productId: string;
            packageVersion: string;
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        }[];
        verifiedCandidates: {
            invocation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            outcome: {
                ref: string;
                digest: `sha256:${string}`;
            };
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        selections: {
            requirement: {
                productId: string;
                packageVersion: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            };
            product: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verification: {
                invocation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                outcome: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }[];
        dependencyEdges: {
            kind: "requires";
            fromProductId: string;
            toProductId: string;
            packageVersion: string;
            compatibilityRef: string;
            compatibilityDisposition: "compatible";
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        }[];
        selectorDispositions: ({
            kind: "semantic_occurrences";
            selectorRef: `sha256:${string}`;
            occurrenceRefs: `sha256:${string}`[];
        } | {
            kind: "no_external_contribution";
            selectorRef: `sha256:${string}`;
            reason: "locally_shadowed" | "not_in_source_contract_meaning";
            checkerWitnessDigest: `sha256:${string}`;
        })[];
        occurrences: {
            occurrenceRef: `sha256:${string}`;
            sourceProductContentDigest: `sha256:${string}`;
            sourceContractRef: string;
            sourceContractDigest: `sha256:${string}`;
            sourcePackageExportPath: string;
            sourceNamedSymbol: string;
            sourceWitnesses: {
                witnessDigest: `sha256:${string}`;
                selectorRef: `sha256:${string}`;
                physicalRelationRef: string;
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                sourceStart: number;
                sourceEnd: number;
                origin: {
                    kind: "import_declaration";
                    clause: "default" | "side_effect" | "named" | "namespace";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "export_declaration";
                    clause: "named" | "namespace" | "star";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "import_type_expression";
                    operator: "type" | "typeof";
                } | {
                    kind: "import_equals_declaration";
                } | {
                    kind: "type_reference_directive";
                } | {
                    kind: "module_augmentation";
                };
                selection: {
                    kind: "module";
                } | {
                    kind: "name";
                    targetName: string;
                    exposedName: string;
                } | {
                    kind: "namespace";
                    exposedName: string;
                } | {
                    kind: "all";
                };
            }[];
            semanticSelection: {
                derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
                targetExportedSymbol: string;
                exposedMemberPath: string[];
                semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
                requiredSymbolSpace: "value" | "type" | "namespace";
            };
            checkerTarget: {
                targetProductContentDigest: `sha256:${string}`;
                targetPackageName: string;
                targetPackageExportPath: string;
                targetExportedSymbol: string;
                requiredSymbolSpace: "value" | "type" | "namespace";
                boundaryDeclarationWitnesses: {
                    declarationPath: string;
                    declarationDigest: `sha256:${string}`;
                    declarationKind: string;
                    exportedName: string;
                }[];
                targetIdentityDigest: `sha256:${string}`;
            };
        }[];
        nativeBindings: {
            kind: "external_binding";
            sourceOccurrenceRef: `sha256:${string}`;
            directDependencyEdge: {
                kind: "requires";
                productId: string;
                packageVersion: string;
                compatibilityRef: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            };
            targetProductContentDigest: `sha256:${string}`;
            targetContractRef: string;
            targetContractDigest: `sha256:${string}`;
            targetPackageExportPath: string;
            targetNamedSymbol: string;
            checkerTarget: {
                targetProductContentDigest: `sha256:${string}`;
                targetPackageName: string;
                targetPackageExportPath: string;
                targetExportedSymbol: string;
                requiredSymbolSpace: "value" | "type" | "namespace";
                boundaryDeclarationWitnesses: {
                    declarationPath: string;
                    declarationDigest: `sha256:${string}`;
                    declarationKind: string;
                    exportedName: string;
                }[];
                targetIdentityDigest: `sha256:${string}`;
            };
        }[];
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        selections: {
            requirement: {
                productId: string;
                packageVersion: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            };
            product: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verification: {
                invocation: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                outcome: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }[];
        dependencyEdges: {
            kind: "requires";
            fromProductId: string;
            toProductId: string;
            packageVersion: string;
            compatibilityRef: string;
            compatibilityDisposition: "compatible";
            requiredContractRefs: string[];
            requiredCapabilityRefs: string[];
        }[];
        selectorDispositions: ({
            kind: "semantic_occurrences";
            selectorRef: `sha256:${string}`;
            occurrenceRefs: `sha256:${string}`[];
        } | {
            kind: "no_external_contribution";
            selectorRef: `sha256:${string}`;
            reason: "locally_shadowed" | "not_in_source_contract_meaning";
            checkerWitnessDigest: `sha256:${string}`;
        })[];
        occurrences: {
            occurrenceRef: `sha256:${string}`;
            sourceProductContentDigest: `sha256:${string}`;
            sourceContractRef: string;
            sourceContractDigest: `sha256:${string}`;
            sourcePackageExportPath: string;
            sourceNamedSymbol: string;
            sourceWitnesses: {
                witnessDigest: `sha256:${string}`;
                selectorRef: `sha256:${string}`;
                physicalRelationRef: string;
                declarationPath: string;
                declarationDigest: `sha256:${string}`;
                sourceStart: number;
                sourceEnd: number;
                origin: {
                    kind: "import_declaration";
                    clause: "default" | "side_effect" | "named" | "namespace";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "export_declaration";
                    clause: "named" | "namespace" | "star";
                    declarationTypeOnly: boolean;
                    specifierTypeOnly: boolean;
                } | {
                    kind: "import_type_expression";
                    operator: "type" | "typeof";
                } | {
                    kind: "import_equals_declaration";
                } | {
                    kind: "type_reference_directive";
                } | {
                    kind: "module_augmentation";
                };
                selection: {
                    kind: "module";
                } | {
                    kind: "name";
                    targetName: string;
                    exposedName: string;
                } | {
                    kind: "namespace";
                    exposedName: string;
                } | {
                    kind: "all";
                };
            }[];
            semanticSelection: {
                derivation: "named" | "namespace_member" | "star_member" | "import_equals_member" | "import_type_member";
                targetExportedSymbol: string;
                exposedMemberPath: string[];
                semanticUse: "type_reference" | "value_reference" | "type_query" | "namespace_reference";
                requiredSymbolSpace: "value" | "type" | "namespace";
            };
            checkerTarget: {
                targetProductContentDigest: `sha256:${string}`;
                targetPackageName: string;
                targetPackageExportPath: string;
                targetExportedSymbol: string;
                requiredSymbolSpace: "value" | "type" | "namespace";
                boundaryDeclarationWitnesses: {
                    declarationPath: string;
                    declarationDigest: `sha256:${string}`;
                    declarationKind: string;
                    exportedName: string;
                }[];
                targetIdentityDigest: `sha256:${string}`;
            };
        }[];
        nativeBindings: {
            kind: "external_binding";
            sourceOccurrenceRef: `sha256:${string}`;
            directDependencyEdge: {
                kind: "requires";
                productId: string;
                packageVersion: string;
                compatibilityRef: string;
                requiredContractRefs: string[];
                requiredCapabilityRefs: string[];
            };
            targetProductContentDigest: `sha256:${string}`;
            targetContractRef: string;
            targetContractDigest: `sha256:${string}`;
            targetPackageExportPath: string;
            targetNamedSymbol: string;
            checkerTarget: {
                targetProductContentDigest: `sha256:${string}`;
                targetPackageName: string;
                targetPackageExportPath: string;
                targetExportedSymbol: string;
                requiredSymbolSpace: "value" | "type" | "namespace";
                boundaryDeclarationWitnesses: {
                    declarationPath: string;
                    declarationDigest: `sha256:${string}`;
                    declarationKind: string;
                    exportedName: string;
                }[];
                targetIdentityDigest: `sha256:${string}`;
            };
        }[];
        residuals: {
            kind: "typed_residual";
            code: string;
            subjectRef: string;
            message: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "incompatible" | "unresolved" | "ambiguous" | "invalid" | "unverified" | "cyclic";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
    bind: import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.workspace.bind";
        readonly memberKey: "bind";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        workspaceAuthority: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installedSet: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        declaredRoots: {
            rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
            path: string;
        }[];
    }, {
        workspaceAuthority: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installedSet: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        declaredRoots: {
            rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
            path: string;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        binding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installedSet: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        declaredRoots: {
            rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
            path: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        binding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installedSet: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        declaredRoots: {
            rootKind: "event_log" | "projection" | "archive" | "product" | "toolchain" | "runtime_state";
            path: string;
        }[];
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "incompatible" | "content_mismatch" | "lock_mismatch" | "workspace_mismatch" | "product_mismatch" | "root_mismatch" | "binding_conflict";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>;
}>;
export interface ProductEnvironmentPort {
    readonly resolve: ExactOwnerOperationPort<typeof resolve>;
    readonly bindWorkspace: ExactOwnerOperationPort<typeof bind>;
}
export {};
