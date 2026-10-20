import * as v from "valibot";
import { type StdoRunEnvironmentDeclaration } from "../gtl/stdo_run_environment.js";
import type { ModulePublication, GtlProgram } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
export declare const STDO_ENVIRONMENT_EVIDENCE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"stdo_environment_evidence", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly declaration: v.StrictObjectSchema<{
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
    readonly environmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly authority: v.StrictObjectSchema<{
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly resources: v.GenericSchema<JsonValue, JsonValue>;
    readonly sourceManifest: v.StrictObjectSchema<{
        readonly base64: v.StringSchema<undefined>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly records: v.ArraySchema<v.StrictObjectSchema<{
        readonly base64: v.StringSchema<undefined>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly role: v.PicklistSchema<["representation", "axiom"], undefined>;
    }, undefined>, undefined>;
    readonly observedMembers: v.ArraySchema<v.StrictObjectSchema<{
        readonly rootRole: v.PicklistSchema<["source", "representation", "axiom"], undefined>;
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly type: v.PicklistSchema<["file", "symlink"], undefined>;
        readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly target: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>, undefined>;
    readonly contexts: v.ArraySchema<v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly members: v.ArraySchema<v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly accesses: v.ArraySchema<v.StrictObjectSchema<{
        readonly accessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly command: v.StrictObjectSchema<{
            readonly executablePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly executableDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly arguments: v.ArraySchema<v.StringSchema<undefined>, undefined>;
            readonly cwd: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
        readonly bindings: v.GenericSchema<JsonValue, JsonValue>;
        readonly exitCode: v.LiteralSchema<0, undefined>;
        readonly stdout: v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly projection: v.GenericSchema<JsonValue, JsonValue>;
        readonly projectionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly startedAt: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly completedAt: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly durationMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly evidenceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export type StdoEnvironmentEvidence = v.InferOutput<typeof STDO_ENVIRONMENT_EVIDENCE_SCHEMA>;
export declare function exactStdoBytes(value: {
    base64: string;
    digest: string;
}): Buffer;
/** The selected release's published inventory syntax, not a semantic interpreter. */
export declare function stdoRecordInventory(text: string): StdoRunEnvironmentDeclaration["axiom"]["members"];
export declare function stdoSourceInventory(manifest: unknown): {
    path: string;
    digest: string;
}[];
export declare function isStdoEnvironmentEvidence(value: unknown): value is StdoEnvironmentEvidence;
export declare function stdoEvidenceMatchesInvocation(evidence: unknown, publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>, authority: {
    authorityRef: string;
    authorityDigest: string;
    actorRef: string;
}): boolean;
export declare function projectStdoRoleEvidence(events: readonly {
    kind: string;
    payload: JsonValue;
}[], invocationAdmissionRef: string, publication: Readonly<ModulePublication>, programRef: string, graphFunctionRef: string, programLocusRef: string, role: string): false | Readonly<{
    invocationAdmissionRef: string;
    environmentRef: string;
    environmentDigest: string;
    evidenceDigest: string;
    role: string;
    graphFunctionRef: string;
    programLocusRef: string;
    frameRefs: string[];
    policy: {
        policyRef: string;
        text: string;
        digest: string;
    };
    sourceContent: {
        text: string;
        contextRef: string;
        memberRef: string;
        memberDigest: string;
        startByte: number;
        endByte: number;
        spanDigest: string;
    }[];
    accessContent: {
        accessRef: string;
        projectionDigest: string;
        projection: JsonValue;
    }[];
}> | null;
export declare const RUN_ENVIRONMENT_EVIDENCE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"run_environment_evidence", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly declaration: v.StrictObjectSchema<{
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
    readonly environmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly authority: v.StrictObjectSchema<{
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
    readonly resources: v.GenericSchema<JsonValue, JsonValue>;
    readonly dependencies: v.ArraySchema<v.StrictObjectSchema<{
        readonly dependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly record: v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly members: v.ArraySchema<v.StrictObjectSchema<{
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly type: v.PicklistSchema<["file", "symlink"], undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly target: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly contexts: v.ArraySchema<v.StrictObjectSchema<{
        readonly contextRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly members: v.ArraySchema<v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly memberRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>, undefined>;
    }, undefined>, undefined>;
    readonly corpusDocuments: v.NullableSchema<v.StrictObjectSchema<{
        readonly program: v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly map: v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly pythonRuntime: v.StrictObjectSchema<{
            readonly executablePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly executableDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly reportedVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
    readonly accesses: v.ArraySchema<v.StrictObjectSchema<{
        readonly output: v.NullableSchema<v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>, undefined>;
        readonly accessRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly command: v.StrictObjectSchema<{
            readonly executablePath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly executableDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly arguments: v.ArraySchema<v.StringSchema<undefined>, undefined>;
            readonly cwd: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
        readonly bindings: v.GenericSchema<JsonValue, JsonValue>;
        readonly exitCode: v.LiteralSchema<0, undefined>;
        readonly stdout: v.StrictObjectSchema<{
            readonly base64: v.StringSchema<undefined>;
            readonly digest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        }, undefined>;
        readonly projection: v.GenericSchema<JsonValue, JsonValue>;
        readonly projectionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly startedAt: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly completedAt: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly durationMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, undefined>;
    readonly evidenceDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
}, undefined>;
export type RunEnvironmentEvidence = v.InferOutput<typeof RUN_ENVIRONMENT_EVIDENCE_SCHEMA>;
export declare function isRunEnvironmentEvidence(value: unknown): value is RunEnvironmentEvidence;
export declare function runEnvironmentEvidenceMatchesInvocation(evidence: unknown, publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>, authority: {
    authorityRef: string;
    authorityDigest: string;
    actorRef: string;
}): boolean;
export declare function projectRunEnvironmentRoleEvidence(events: readonly {
    kind: string;
    payload: JsonValue;
}[], invocationAdmissionRef: string, publication: Readonly<ModulePublication>, programRef: string, graphFunctionRef: string, programLocusRef: string, role: string): false | Readonly<{
    invocationAdmissionRef: string;
    environmentRef: string;
    environmentDigest: string;
    evidenceDigest: string;
    role: string;
    graphFunctionRef: string;
    programLocusRef: string;
    frameRefs: string[];
    policy: {
        policyRef: string;
        text: string;
        digest: string;
    };
    contextPolicy: {
        policyRef: string;
        selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
    };
    contextPolicyDigest: `sha256:${string}`;
    sourceContent: {
        path: string;
        sourceLocator: string;
        text: string;
        contextRef: string;
        memberRef: string;
        memberDigest: string;
        startByte: number;
        endByte: number;
        spanDigest: string;
    }[];
    accessContent: {
        accessRef: string;
        projectionDigest: string;
        operation: "project" | "validate";
        claim: string;
        disposition: string;
        projection: JsonValue;
    }[];
}> | null;
