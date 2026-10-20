import * as v from "valibot";
import { type RunEnvironmentDeclaration } from "../gtl/stdo_run_environment.js";
import type { ModulePublication, GtlProgram, GraphFunction } from "../gtl/contracts.js";
import { type RunEnvironmentEvidence, type StdoEnvironmentEvidence } from "../abg/stdo_environment.js";
export declare const STDO_ENVIRONMENT_RESOURCES_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"stdo_environment_resources", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly roots: v.StrictObjectSchema<{
        readonly sourceRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly representationRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly axiomRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly representationRecordPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly axiomRecordPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly pythonPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly temporaryRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
    }, undefined>;
    readonly permission: v.StrictObjectSchema<{
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly environmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly environmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly operation: v.LiteralSchema<"project", undefined>;
        readonly roots: v.StrictObjectSchema<{
            readonly sourceRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly representationRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly axiomRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly representationRecordPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly axiomRecordPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly pythonPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly temporaryRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        }, undefined>;
    }, undefined>;
}, undefined>;
export type StdoEnvironmentResources = v.InferOutput<typeof STDO_ENVIRONMENT_RESOURCES_SCHEMA>;
export type StdoEnvironmentRefusalCause = "missing_binding" | "identity_mismatch" | "access_not_permitted" | "access_unavailable" | "tool_failure" | "invalid_projection" | "declared_bound_overflow" | "unsupported_declaration";
export type StdoEnvironmentObservation = Readonly<{
    kind: "stdo_environment_observed";
    evidence: StdoEnvironmentEvidence | null;
}> | Readonly<{
    kind: "stdo_environment_refusal";
    cause: StdoEnvironmentRefusalCause;
    issuePath: string;
}>;
/** Existing Product preparation observes exact declared dependencies. No traversal or semantic judgment. */
export declare function observeStdoEnvironment(input: {
    publication: Readonly<ModulePublication>;
    program: Readonly<GtlProgram>;
    graphFunctions: readonly Readonly<GraphFunction>[];
    authority: {
        authorityRef: string;
        authorityDigest: string;
        actorRef: string;
    };
    archiveRoot: string;
    resources?: StdoEnvironmentResources;
}): Promise<StdoEnvironmentObservation>;
export declare const RUN_ENVIRONMENT_RESOURCES_SCHEMA: v.StrictObjectSchema<{
    readonly permission: v.StrictObjectSchema<{
        readonly dependencies: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
            readonly dependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly root: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
            readonly recordPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        }, undefined>, undefined>, v.MinLengthAction<{
            dependencyRef: string;
            root: string;
            recordPath: string;
        }[], 1, undefined>]>;
        readonly pythonPath: v.NullableSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>, undefined>;
        readonly temporaryRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly authorityRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly authorityDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly actorRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly environmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly environmentDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly operations: v.ArraySchema<v.PicklistSchema<["read_context", "validate", "project"], undefined>, undefined>;
    }, undefined>;
    readonly dependencies: v.SchemaWithPipe<readonly [v.ArraySchema<v.StrictObjectSchema<{
        readonly dependencyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly root: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
        readonly recordPath: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
    }, undefined>, undefined>, v.MinLengthAction<{
        dependencyRef: string;
        root: string;
        recordPath: string;
    }[], 1, undefined>]>;
    readonly pythonPath: v.NullableSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>, undefined>;
    readonly temporaryRoot: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, v.CheckAction<string, undefined>]>;
    readonly kind: v.LiteralSchema<"run_environment_resources", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
}, undefined>;
export type RunEnvironmentResources = v.InferOutput<typeof RUN_ENVIRONMENT_RESOURCES_SCHEMA>;
export declare function constructRunEnvironmentResources(value: RunEnvironmentResources): Readonly<RunEnvironmentResources>;
/** Exact record syntax adaptation only; no frame selection or constitutional interpretation. */
export declare function runEnvironmentRecordMembers(format: RunEnvironmentDeclaration["dependencies"][number]["recordFormat"], bytes: Uint8Array): RunEnvironmentDeclaration["dependencies"][number]["members"];
export type RunEnvironmentObservation = Readonly<{
    kind: "run_environment_observed";
    evidence: RunEnvironmentEvidence | null;
}> | Readonly<{
    kind: "run_environment_refusal";
    cause: StdoEnvironmentRefusalCause;
    issuePath: string;
}>;
export declare function observeRunEnvironment(input: {
    publication: Readonly<ModulePublication>;
    program: Readonly<GtlProgram>;
    graphFunctions: readonly Readonly<GraphFunction>[];
    authority: {
        authorityRef: string;
        authorityDigest: string;
        actorRef: string;
    };
    archiveRoot: string;
    resources?: RunEnvironmentResources;
}): Promise<RunEnvironmentObservation>;
