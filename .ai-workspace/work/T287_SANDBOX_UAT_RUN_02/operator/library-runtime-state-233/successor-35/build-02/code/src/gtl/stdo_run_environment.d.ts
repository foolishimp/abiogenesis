import * as v from "valibot";
import type { ModulePublication, GtlProgram, GraphFunction } from "./contracts.js";
import { cLeafTerms } from "./c_algebra.js";
export declare const STDO_RUN_ENVIRONMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"stdo_run_environment_declaration", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly source: v.StrictObjectSchema<{
        readonly releaseUri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly manifestDigest: v.GenericSchema<string, string>;
    }, undefined>;
    readonly representation: v.StrictObjectSchema<{
        readonly program: v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly uri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteDigest: v.GenericSchema<string, string>;
            readonly canonicalDigest: v.GenericSchema<string, string>;
        }, undefined>;
        readonly map: v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly uri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteDigest: v.GenericSchema<string, string>;
            readonly canonicalDigest: v.GenericSchema<string, string>;
        }, undefined>;
        readonly productRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly releaseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly tagObject: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly recordUri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly recordDigest: v.GenericSchema<string, string>;
        readonly inventoryDigest: v.GenericSchema<string, string>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly type: v.PicklistSchema<["file", "symlink"], undefined>;
            readonly digest: v.GenericSchema<string, string>;
            readonly target: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly axiom: v.StrictObjectSchema<{
        readonly executablePath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
        readonly outputContractPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
        readonly outputContractVersion: v.LiteralSchema<"axiom-indexer.frame-projection@1", undefined>;
        readonly pythonExecutableDigest: v.GenericSchema<string, string>;
        readonly productRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly releaseRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly tagObject: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly recordUri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly recordDigest: v.GenericSchema<string, string>;
        readonly inventoryDigest: v.GenericSchema<string, string>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly type: v.PicklistSchema<["file", "symlink"], undefined>;
            readonly digest: v.GenericSchema<string, string>;
            readonly target: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[], 1, undefined>]>;
    }, undefined>;
    readonly contexts: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>, v.MinLengthAction<{
        contextRef: string;
        sourceLocator: string;
        inventoryDigest: string;
        members: {
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[];
    }[], 1, undefined>]>;
    readonly accesses: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly accessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly operation: v.LiteralSchema<"project", undefined>;
        readonly mode: v.LiteralSchema<"materialized", undefined>;
        readonly frameIndexRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly maxOutputBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, 16777216, undefined>]>;
        readonly timeoutMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, 60000, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        accessRef: string;
        operation: "project";
        mode: "materialized";
        frameIndexRefs: string[];
        maxOutputBytes: number;
        timeoutMs: number;
    }[], 1, undefined>]>;
    readonly roles: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly role: v.PicklistSchema<["author", "assessor", "constructor", "command_executor"], undefined>;
        readonly frameRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly policy: v.StrictObjectSchema<{
            readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.GenericSchema<string, string>;
        }, undefined>;
        readonly accessRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly sourceBindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        graphFunctionRef: string;
        programLocusRef: string;
        role: "author" | "assessor" | "constructor" | "command_executor";
        frameRefs: string[];
        policy: {
            policyRef: string;
            text: string;
            digest: string;
        };
        accessRefs: string[];
        sourceBindings: {
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[], 1, undefined>]>;
}, undefined>;
export type StdoRunEnvironmentDeclaration = v.InferOutput<typeof STDO_RUN_ENVIRONMENT_SCHEMA>;
export declare const STDO_ENVIRONMENT_POLICY = "abg.stdo_run_environment";
export declare function stdoInventoryDigest(members: StdoRunEnvironmentDeclaration["axiom"]["members"]): `sha256:${string}`;
export declare function isStdoRunEnvironmentDeclaration(value: unknown): value is StdoRunEnvironmentDeclaration;
export declare function constructHistoricalStdoRunEnvironmentDeclaration(value: StdoRunEnvironmentDeclaration): Readonly<StdoRunEnvironmentDeclaration>;
export declare function stdoEnvironmentForProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>): false | {
    kind: "stdo_run_environment_declaration";
    schemaVersion: "5.0.0";
    declarationRef: string;
    source: {
        releaseUri: string;
        manifestDigest: string;
    };
    representation: {
        program: {
            path: string;
            uri: string;
            byteDigest: string;
            canonicalDigest: string;
        };
        map: {
            path: string;
            uri: string;
            byteDigest: string;
            canonicalDigest: string;
        };
        productRef: string;
        releaseRef: string;
        tagObject: string;
        recordUri: string;
        recordDigest: string;
        inventoryDigest: string;
        members: {
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[];
    };
    axiom: {
        executablePath: string;
        outputContractPath: string;
        outputContractVersion: "axiom-indexer.frame-projection@1";
        pythonExecutableDigest: string;
        productRef: string;
        releaseRef: string;
        tagObject: string;
        recordUri: string;
        recordDigest: string;
        inventoryDigest: string;
        members: {
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[];
    };
    contexts: {
        contextRef: string;
        sourceLocator: string;
        inventoryDigest: string;
        members: {
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[];
    }[];
    accesses: {
        accessRef: string;
        operation: "project";
        mode: "materialized";
        frameIndexRefs: string[];
        maxOutputBytes: number;
        timeoutMs: number;
    }[];
    roles: {
        graphFunctionRef: string;
        programLocusRef: string;
        role: "author" | "assessor" | "constructor" | "command_executor";
        frameRefs: string[];
        policy: {
            policyRef: string;
            text: string;
            digest: string;
        };
        accessRefs: string[];
        sourceBindings: {
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[];
} | null;
export declare function validStdoEnvironmentPublication(publication: Readonly<ModulePublication>): boolean;
export declare function validStdoEnvironmentProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>, graphFunctions: readonly Readonly<GraphFunction>[]): boolean;
/** Closed existing leaf classes, not a role interpreter or tool registry. */
export declare function stdoRoleForDeclaredLeaf(graph: Readonly<GraphFunction>, leaf: ReturnType<typeof cLeafTerms>[number]): StdoRunEnvironmentDeclaration["roles"][number]["role"] | null;
/** One declared native family shared by publication validation, HoG and assembly.
 * Historical STDO roles remain confined to their existing declaration profile. */
export declare function nativeContextLeafFamily(graph: Readonly<GraphFunction>, leaf: ReturnType<typeof cLeafTerms>[number]): RunEnvironmentRole["role"] | null;
export declare const RUN_ENVIRONMENT_POLICY = "abg.run_environment";
export declare const CONTEXT_SELECTORS: readonly ["full_source", "declared_predecessor_semantics", "active_binding_semantics", "current_candidate", "current_worksite", "admitted_execution_evidence", "assessor_evaluation_data", "not_required"];
export declare const RUN_ENVIRONMENT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"run_environment_declaration", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly declarationRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly dependencies: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly dependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly recordRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly recordDigest: v.GenericSchema<string, string>;
        readonly recordFormat: v.PicklistSchema<["member_inventory@1", "stdo_source_manifest@1", "release_record@1"], undefined>;
        readonly inventoryDigest: v.GenericSchema<string, string>;
        readonly members: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly type: v.PicklistSchema<["file", "symlink"], undefined>;
            readonly digest: v.GenericSchema<string, string>;
            readonly target: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>, v.MinLengthAction<{
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        dependencyRef: string;
        basisRef: string;
        recordRef: string;
        recordDigest: string;
        recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
        inventoryDigest: string;
        members: {
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[];
    }[], 1, undefined>]>;
    readonly contexts: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
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
    }, undefined>, undefined>, v.MinLengthAction<{
        contextRef: string;
        sourceLocator: string;
        inventoryDigest: string;
        members: {
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[];
    }[], 1, undefined>]>;
    readonly corpusAccess: v.NullableSchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"axiom_indexer", undefined>;
        readonly sourceDependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly representationDependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly axiomDependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly program: v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly uri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteDigest: v.GenericSchema<string, string>;
            readonly canonicalDigest: v.GenericSchema<string, string>;
        }, undefined>;
        readonly map: v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
            readonly uri: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly byteDigest: v.GenericSchema<string, string>;
            readonly canonicalDigest: v.GenericSchema<string, string>;
        }, undefined>;
        readonly executablePath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
        readonly outputContractPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.RegexAction<string, undefined>]>;
        readonly pythonExecutableDigest: v.GenericSchema<string, string>;
        readonly pythonVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>, undefined>;
    readonly accesses: v.ArraySchema<v.StrictObjectSchema<{
        readonly accessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly operation: v.PicklistSchema<["validate", "project"], undefined>;
        readonly mode: v.PicklistSchema<["validation", "materialized"], undefined>;
        readonly frameIndexRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly maxOutputBytes: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, 16777216, undefined>]>;
        readonly timeoutMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>, v.MaxValueAction<number, 60000, undefined>]>;
    }, undefined>, undefined>;
    readonly roles: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly role: v.PicklistSchema<["author", "assessor", "constructor", "command_executor", "selector"], undefined>;
        readonly accessRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly contextPolicy: v.StrictObjectSchema<{
            readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly selectors: v.SchemaWithPipe<readonly [v.ArraySchema<v.PicklistSchema<readonly ["full_source", "declared_predecessor_semantics", "active_binding_semantics", "current_candidate", "current_worksite", "admitted_execution_evidence", "assessor_evaluation_data", "not_required"], undefined>, undefined>, v.MinLengthAction<("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[], 1, undefined>]>;
        }, undefined>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programLocusRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly frameRefs: v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>, v.MinLengthAction<string[], 1, undefined>]>;
        readonly policy: v.StrictObjectSchema<{
            readonly policyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly text: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly digest: v.GenericSchema<string, string>;
        }, undefined>;
        readonly sourceBindings: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly memberDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly startByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly endByte: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly spanDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[], 1, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
        accessRefs: string[];
        contextPolicy: {
            policyRef: string;
            selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
        };
        graphFunctionRef: string;
        programLocusRef: string;
        frameRefs: string[];
        policy: {
            policyRef: string;
            text: string;
            digest: string;
        };
        sourceBindings: {
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[], 1, undefined>]>;
}, undefined>;
export type RunEnvironmentDeclaration = v.InferOutput<typeof RUN_ENVIRONMENT_SCHEMA>;
export type RunEnvironmentRole = RunEnvironmentDeclaration["roles"][number];
export declare function isRunEnvironmentDeclaration(value: unknown): value is RunEnvironmentDeclaration;
export declare function constructRunEnvironmentDeclaration(value: RunEnvironmentDeclaration): Readonly<RunEnvironmentDeclaration>;
/** STDO specialization constrains data; generic declarations have no STDO release allowlist. */
export declare function constructStdoRunEnvironmentDeclaration(value: RunEnvironmentDeclaration): Readonly<RunEnvironmentDeclaration>;
export declare function runEnvironmentForProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>): false | {
    kind: "run_environment_declaration";
    schemaVersion: "5.0.0";
    declarationRef: string;
    dependencies: {
        dependencyRef: string;
        basisRef: string;
        recordRef: string;
        recordDigest: string;
        recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
        inventoryDigest: string;
        members: {
            path: string;
            type: "file" | "symlink";
            digest: string;
            target: string | null;
        }[];
    }[];
    contexts: {
        contextRef: string;
        sourceLocator: string;
        inventoryDigest: string;
        members: {
            memberRef: string;
            path: string;
            byteCount: number;
            digest: string;
        }[];
    }[];
    corpusAccess: {
        kind: "axiom_indexer";
        sourceDependencyRef: string;
        representationDependencyRef: string;
        axiomDependencyRef: string;
        program: {
            path: string;
            uri: string;
            byteDigest: string;
            canonicalDigest: string;
        };
        map: {
            path: string;
            uri: string;
            byteDigest: string;
            canonicalDigest: string;
        };
        executablePath: string;
        outputContractPath: string;
        pythonExecutableDigest: string;
        pythonVersion: string;
    } | null;
    accesses: {
        accessRef: string;
        operation: "project" | "validate";
        mode: "validation" | "materialized";
        frameIndexRefs: string[];
        maxOutputBytes: number;
        timeoutMs: number;
    }[];
    roles: {
        role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
        accessRefs: string[];
        contextPolicy: {
            policyRef: string;
            selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
        };
        graphFunctionRef: string;
        programLocusRef: string;
        frameRefs: string[];
        policy: {
            policyRef: string;
            text: string;
            digest: string;
        };
        sourceBindings: {
            contextRef: string;
            memberRef: string;
            memberDigest: string;
            startByte: number;
            endByte: number;
            spanDigest: string;
        }[];
    }[];
} | null;
/** Project already-bound declarations; acquisition/native-basis owners authenticate
 * their content. null is unselected and false is an invalid applicable binding.
 * Payloads and reconstructed runtime evidence never select or disable it. */
export declare function registeredSelectionNativeRole(publication: Readonly<ModulePublication> | undefined, programRef: string, graph: Readonly<GraphFunction>, programLocusRef: string): Readonly<RunEnvironmentRole> | null | false;
/** Narrow library profile: applicability precedes payload inspection. */
export declare function framedSynthesisAtLocus(graph: Readonly<GraphFunction>, locus: string): false | {
    node: {
        readonly nodeRef: string;
        readonly nodeKind: "c_locus";
        readonly term: import("./c_algebra.js").CProgramNode;
    };
    projection: {
        readonly nodeRef: string;
        readonly nodeKind: "c_locus";
        readonly term: import("./c_algebra.js").CProgramNode;
    };
    application: import("./contracts.js").RegisteredSelectionApplication;
} | null;
export declare function framedSynthesisNativeRole(publication: Readonly<ModulePublication> | undefined, programRef: string, graph: Readonly<GraphFunction>, locus: string): Readonly<RunEnvironmentRole> | null | false;
export declare function validRunEnvironmentPublication(publication: Readonly<ModulePublication>): boolean;
export declare function validRunEnvironmentProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>, graphFunctions: readonly Readonly<GraphFunction>[]): boolean;
