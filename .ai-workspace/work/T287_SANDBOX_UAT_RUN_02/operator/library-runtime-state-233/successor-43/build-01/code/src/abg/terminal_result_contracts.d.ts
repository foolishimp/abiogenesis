import * as v from "valibot";
import type { ReadyGraphFunctionCatalog, GraphFunctionCatalogView } from "../product/catalog.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
/** This is an output carrier, not an admission or an independent result ledger. */
export declare const ABG_TYPED_TERMINAL_RESULT_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly result: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly contract: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly value: v.GenericSchema<JsonValue, JsonValue>;
    readonly producer: v.StrictObjectSchema<{
        readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly program: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly graphFunction: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminalRoute: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>;
    readonly projectionBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>;
export type AbgTypedTerminalResult = v.InferOutput<typeof ABG_TYPED_TERMINAL_RESULT_SCHEMA>;
export declare function isAbgTypedTerminalResult(value: unknown): value is AbgTypedTerminalResult;
/** Untrusted, immutable declaration evidence. Only the native projector can
 * join these bytes to the historical WorkspaceBinding, Catalog and Run. */
export interface AbgHistoricalDeclarationProof {
    readonly kind: "abg_historical_declaration_proof";
    readonly schemaVersion: "5.0.0";
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogView: GraphFunctionCatalogView;
}
export declare const ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA: v.GenericSchema<AbgHistoricalDeclarationProof, AbgHistoricalDeclarationProof>;
export declare function isAbgHistoricalDeclarationProof(value: unknown): value is AbgHistoricalDeclarationProof;
/** Selection of immutable declaration evidence, never proof of its admission. */
export declare const ABG_HISTORICAL_DECLARATION_REFERENCE_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_historical_declaration_reference", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly catalogBasisDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly readinessBasisDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly viewDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
}, undefined>;
export type AbgHistoricalDeclarationReference = v.InferOutput<typeof ABG_HISTORICAL_DECLARATION_REFERENCE_SCHEMA>;
export declare function isAbgHistoricalDeclarationReference(value: unknown): value is AbgHistoricalDeclarationReference;
export declare function constructAbgHistoricalDeclarationReference(proof: AbgHistoricalDeclarationProof): AbgHistoricalDeclarationReference;
/** Stable selection only. The result body and the read prefix remain with ABG. */
export declare const ABG_HISTORICAL_TERMINAL_SELECTION_SCHEMA: Omit<v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly result: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly contract: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    readonly value: v.GenericSchema<JsonValue, JsonValue>;
    readonly producer: v.StrictObjectSchema<{
        readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly program: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly graphFunction: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly executionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly terminalRoute: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>;
    readonly projectionBasis: v.StrictObjectSchema<{
        readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
}, undefined>, "entries" | "~types" | "~run" | "~standard"> & {
    readonly entries: Omit<{
        readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly contract: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.GenericSchema<JsonValue, JsonValue>;
        readonly producer: v.StrictObjectSchema<{
            readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly program: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalRoute: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
        readonly projectionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, "value" | "projectionBasis">;
    readonly "~standard": v.StandardProps<{
        kind: "abg_typed_terminal_result";
        schemaVersion: "5.0.0";
        result: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        valueDigest: `sha256:${string}`;
        valueKind: string;
        producer: {
            runRef: string;
            graphCallRef: string;
            invocationAdmissionRef: string;
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            graphFunction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            executionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            cCallRef: string;
            resultAdmissionEventRef: string;
            judgmentRef: string;
            judgmentAdmissionEventRef: string;
            terminalRoute: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, {
        kind: "abg_typed_terminal_result";
        schemaVersion: "5.0.0";
        result: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        valueDigest: `sha256:${string}`;
        valueKind: string;
        producer: {
            runRef: string;
            graphCallRef: string;
            invocationAdmissionRef: string;
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            graphFunction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            executionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            cCallRef: string;
            resultAdmissionEventRef: string;
            judgmentRef: string;
            judgmentAdmissionEventRef: string;
            terminalRoute: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        kind: "abg_typed_terminal_result";
        schemaVersion: "5.0.0";
        result: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        valueDigest: `sha256:${string}`;
        valueKind: string;
        producer: {
            runRef: string;
            graphCallRef: string;
            invocationAdmissionRef: string;
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            graphFunction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            executionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            cCallRef: string;
            resultAdmissionEventRef: string;
            judgmentRef: string;
            judgmentAdmissionEventRef: string;
            terminalRoute: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    }, v.BaseIssue<unknown> | v.StringIssue | v.RegexIssue<string> | v.StrictObjectIssue | v.LiteralIssue>;
    readonly "~types"?: {
        readonly input: {
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        };
        readonly output: {
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        };
        readonly issue: v.BaseIssue<unknown> | v.StringIssue | v.RegexIssue<string> | v.StrictObjectIssue | v.LiteralIssue;
    } | undefined;
};
export type AbgHistoricalTerminalSelection = v.InferOutput<typeof ABG_HISTORICAL_TERMINAL_SELECTION_SCHEMA>;
/** One explicit cold declaration dependency, separate from semantic Run input. */
declare const historicalSourceResourceSchema: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_historical_graph_call_source_resource", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly terminal: Omit<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly contract: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.GenericSchema<JsonValue, JsonValue>;
        readonly producer: v.StrictObjectSchema<{
            readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly program: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalRoute: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
        readonly projectionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>, "entries" | "~types" | "~run" | "~standard"> & {
        readonly entries: Omit<{
            readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly contract: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly value: v.GenericSchema<JsonValue, JsonValue>;
            readonly producer: v.StrictObjectSchema<{
                readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly program: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
                readonly graphFunction: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
                readonly executionBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
                readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalRoute: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
            }, undefined>;
            readonly projectionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, "value" | "projectionBasis">;
        readonly "~standard": v.StandardProps<{
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>;
        readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, v.BaseIssue<unknown> | v.StringIssue | v.RegexIssue<string> | v.StrictObjectIssue | v.LiteralIssue>;
        readonly "~types"?: {
            readonly input: {
                kind: "abg_typed_terminal_result";
                schemaVersion: "5.0.0";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                contract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                valueDigest: `sha256:${string}`;
                valueKind: string;
                producer: {
                    runRef: string;
                    graphCallRef: string;
                    invocationAdmissionRef: string;
                    program: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    graphFunction: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    cCallRef: string;
                    resultAdmissionEventRef: string;
                    judgmentRef: string;
                    judgmentAdmissionEventRef: string;
                    terminalRoute: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            };
            readonly output: {
                kind: "abg_typed_terminal_result";
                schemaVersion: "5.0.0";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                contract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                valueDigest: `sha256:${string}`;
                valueKind: string;
                producer: {
                    runRef: string;
                    graphCallRef: string;
                    invocationAdmissionRef: string;
                    program: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    graphFunction: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    cCallRef: string;
                    resultAdmissionEventRef: string;
                    judgmentRef: string;
                    judgmentAdmissionEventRef: string;
                    terminalRoute: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            };
            readonly issue: v.BaseIssue<unknown> | v.StringIssue | v.RegexIssue<string> | v.StrictObjectIssue | v.LiteralIssue;
        } | undefined;
    };
    readonly input: v.StrictObjectSchema<{
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly declarationProof: v.GenericSchema<AbgHistoricalDeclarationProof, AbgHistoricalDeclarationProof>;
    readonly declarationDependencies: v.OptionalSchema<v.ArraySchema<v.GenericSchema<AbgHistoricalDeclarationProof, AbgHistoricalDeclarationProof>, undefined>, undefined>;
}, undefined>;
export type AbgHistoricalGraphCallSourceResource = v.InferOutput<typeof historicalSourceResourceSchema>;
/** Each immutable basis/View is supplied once, including the primary source. */
export declare function hasUniqueHistoricalDeclarationDependencies(resource: AbgHistoricalGraphCallSourceResource): boolean;
export declare const ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA: v.SchemaWithPipe<readonly [v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"abg_historical_graph_call_source_resource", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly terminal: Omit<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly result: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly contract: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly value: v.GenericSchema<JsonValue, JsonValue>;
        readonly producer: v.StrictObjectSchema<{
            readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly program: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly graphFunction: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly executionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly terminalRoute: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, undefined>;
        readonly projectionBasis: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>, "entries" | "~types" | "~run" | "~standard"> & {
        readonly entries: Omit<{
            readonly kind: v.LiteralSchema<"abg_typed_terminal_result", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly result: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly contract: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly valueKind: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly valueDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly value: v.GenericSchema<JsonValue, JsonValue>;
            readonly producer: v.StrictObjectSchema<{
                readonly runRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly graphCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly invocationAdmissionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly program: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
                readonly graphFunction: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
                readonly executionBasis: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
                readonly cCallRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly resultAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly judgmentAdmissionEventRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly terminalRoute: v.StrictObjectSchema<{
                    readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                }, undefined>;
            }, undefined>;
            readonly projectionBasis: v.StrictObjectSchema<{
                readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
        }, "value" | "projectionBasis">;
        readonly "~standard": v.StandardProps<{
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, {
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }>;
        readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
            kind: "abg_typed_terminal_result";
            schemaVersion: "5.0.0";
            result: {
                ref: string;
                digest: `sha256:${string}`;
            };
            contract: {
                ref: string;
                digest: `sha256:${string}`;
            };
            valueDigest: `sha256:${string}`;
            valueKind: string;
            producer: {
                runRef: string;
                graphCallRef: string;
                invocationAdmissionRef: string;
                program: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                graphFunction: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                executionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                cCallRef: string;
                resultAdmissionEventRef: string;
                judgmentRef: string;
                judgmentAdmissionEventRef: string;
                terminalRoute: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        }, v.BaseIssue<unknown> | v.StringIssue | v.RegexIssue<string> | v.StrictObjectIssue | v.LiteralIssue>;
        readonly "~types"?: {
            readonly input: {
                kind: "abg_typed_terminal_result";
                schemaVersion: "5.0.0";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                contract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                valueDigest: `sha256:${string}`;
                valueKind: string;
                producer: {
                    runRef: string;
                    graphCallRef: string;
                    invocationAdmissionRef: string;
                    program: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    graphFunction: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    cCallRef: string;
                    resultAdmissionEventRef: string;
                    judgmentRef: string;
                    judgmentAdmissionEventRef: string;
                    terminalRoute: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            };
            readonly output: {
                kind: "abg_typed_terminal_result";
                schemaVersion: "5.0.0";
                result: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                contract: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
                valueDigest: `sha256:${string}`;
                valueKind: string;
                producer: {
                    runRef: string;
                    graphCallRef: string;
                    invocationAdmissionRef: string;
                    program: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    graphFunction: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    executionBasis: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                    cCallRef: string;
                    resultAdmissionEventRef: string;
                    judgmentRef: string;
                    judgmentAdmissionEventRef: string;
                    terminalRoute: {
                        ref: string;
                        digest: `sha256:${string}`;
                    };
                };
            };
            readonly issue: v.BaseIssue<unknown> | v.StringIssue | v.RegexIssue<string> | v.StrictObjectIssue | v.LiteralIssue;
        } | undefined;
    };
    readonly input: v.StrictObjectSchema<{
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly contractRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
    }, undefined>;
    readonly declarationProof: v.GenericSchema<AbgHistoricalDeclarationProof, AbgHistoricalDeclarationProof>;
    readonly declarationDependencies: v.OptionalSchema<v.ArraySchema<v.GenericSchema<AbgHistoricalDeclarationProof, AbgHistoricalDeclarationProof>, undefined>, undefined>;
}, undefined>, v.CheckAction<{
    kind: "abg_historical_graph_call_source_resource";
    schemaVersion: "5.0.0";
    terminal: {
        kind: "abg_typed_terminal_result";
        schemaVersion: "5.0.0";
        result: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contract: {
            ref: string;
            digest: `sha256:${string}`;
        };
        valueDigest: `sha256:${string}`;
        valueKind: string;
        producer: {
            runRef: string;
            graphCallRef: string;
            invocationAdmissionRef: string;
            program: {
                ref: string;
                digest: `sha256:${string}`;
            };
            graphFunction: {
                ref: string;
                digest: `sha256:${string}`;
            };
            executionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            cCallRef: string;
            resultAdmissionEventRef: string;
            judgmentRef: string;
            judgmentAdmissionEventRef: string;
            terminalRoute: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
    };
    input: {
        graphFunctionRef: string;
        contractRef: string;
    };
    declarationProof: AbgHistoricalDeclarationProof;
    declarationDependencies?: AbgHistoricalDeclarationProof[] | undefined;
}, "historical declaration dependencies must select unique exact bases">]>;
/** Borrowed owner values, never serialized into successor input or evidence. */
export interface AbgHistoricalGraphCallSource {
    readonly terminalResult: AbgTypedTerminalResult;
    readonly input: Readonly<{
        graphFunctionRef: string;
        contractRef: string;
        value: Readonly<Record<string, JsonValue>>;
    }>;
    readonly publication: Readonly<ModulePublication>;
}
export {};
