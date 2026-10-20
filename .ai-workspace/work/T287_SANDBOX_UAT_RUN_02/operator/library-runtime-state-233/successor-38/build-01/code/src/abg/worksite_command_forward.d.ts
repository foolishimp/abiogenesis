/** One native forward relation. Historical coordinates never become current-Run causation. */
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { type WorksiteCommandForwardRequest, type WorksiteCommandForwardTask } from "../product/worksite_command_forward.js";
import type { WorkspaceBinding } from "../product/environment.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type CCall } from "./c_call.js";
import { type ExecutionBasis } from "./execution_basis.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
/** Actor ownership is native parent/child lineage, not a guessed payload on
 * each process/stream event. A dispatch intent alone consumes this eligibility. */
export declare function hasWorksiteCommandForwardDispatchAtPrefix(prefix: ValidatedRuntimeEventPrefix, cCallRef: string): boolean;
/** Pure authentic historical proof. No filesystem worksite observation occurs here. */
export declare function projectWorksiteCommandForwardSource(request: WorksiteCommandForwardRequest): {
    prefix: ValidatedRuntimeEventPrefix;
    events: readonly RuntimeEvent[];
    originalTask: Readonly<Record<string, JsonValue>> & import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask;
    construction: {
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
        valueKind: string;
        valueDigest: `sha256:${string}`;
        value: JsonValue;
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
        projectionBasis: {
            ref: string;
            digest: `sha256:${string}`;
        };
    };
    preparation: {
        basis: ExecutionBasis;
        resultEvent: RuntimeEvent;
        judgmentEvent: RuntimeEvent;
        cCall: CCall;
        result: import("./c_call.js").AdmittedCCallResult;
        judgment: import("./c_call.js").AdmittedCCallJudgment;
    };
    failed: {
        basis: ExecutionBasis;
        resultEvent: RuntimeEvent;
        judgmentEvent: RuntimeEvent;
        cCall: CCall;
        result: import("./c_call.js").AdmittedCCallResult;
        judgment: import("./c_call.js").AdmittedCCallJudgment;
    };
    bases: ExecutionBasis[];
    installedRoots: string[];
} | null;
/** Current-prefix consumption; coordinates in another invocation are never aliases of this one. */
export declare function worksiteCommandForwardUnconsumed(prefix: ValidatedRuntimeEventPrefix, request: WorksiteCommandForwardRequest, currentInvocationRef: string | null): boolean;
/** Reused at entry, F_D result, child/leaf and observation admission. */
export declare function projectWorksiteCommandForwardRelation(current: DurablePrefixCoordinate, request: WorksiteCommandForwardRequest, currentInvocationRef?: string | null, physical?: boolean): {
    task: WorksiteCommandForwardTask;
    source: {
        prefix: ValidatedRuntimeEventPrefix;
        events: readonly RuntimeEvent[];
        originalTask: Readonly<Record<string, JsonValue>> & import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask;
        construction: {
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
            valueKind: string;
            valueDigest: `sha256:${string}`;
            value: JsonValue;
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
            projectionBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
        };
        preparation: {
            basis: ExecutionBasis;
            resultEvent: RuntimeEvent;
            judgmentEvent: RuntimeEvent;
            cCall: CCall;
            result: import("./c_call.js").AdmittedCCallResult;
            judgment: import("./c_call.js").AdmittedCCallJudgment;
        };
        failed: {
            basis: ExecutionBasis;
            resultEvent: RuntimeEvent;
            judgmentEvent: RuntimeEvent;
            cCall: CCall;
            result: import("./c_call.js").AdmittedCCallResult;
            judgment: import("./c_call.js").AdmittedCCallJudgment;
        };
        bases: ExecutionBasis[];
        installedRoots: string[];
    };
    prefix: ValidatedRuntimeEventPrefix;
    installedRoots: string[];
} | null;
export declare function worksiteCommandForwardEntryDisposition(prefix: DurablePrefixCoordinate, gf: GraphFunction, input: unknown, binding: WorkspaceBinding, grants: readonly unknown[], sourceResultBasis: unknown): "not_applicable" | "covered" | "basis_fork_detected";
export interface WorksiteCommandForwardNativeBasis {
    readonly publication: Readonly<ModulePublication>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly executionBasis: Readonly<ExecutionBasis>;
    readonly cCall: Readonly<CCall>;
    readonly cursor: Readonly<TraversalCursorCandidate>;
    readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
export declare function authenticateWorksiteCommandForwardBasis(basis: WorksiteCommandForwardNativeBasis, physical?: boolean): {
    relation: {
        task: WorksiteCommandForwardTask;
        source: {
            prefix: ValidatedRuntimeEventPrefix;
            events: readonly RuntimeEvent[];
            originalTask: Readonly<Record<string, JsonValue>> & import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask;
            construction: {
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
                valueKind: string;
                valueDigest: `sha256:${string}`;
                value: JsonValue;
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
                projectionBasis: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
            preparation: {
                basis: ExecutionBasis;
                resultEvent: RuntimeEvent;
                judgmentEvent: RuntimeEvent;
                cCall: CCall;
                result: import("./c_call.js").AdmittedCCallResult;
                judgment: import("./c_call.js").AdmittedCCallJudgment;
            };
            failed: {
                basis: ExecutionBasis;
                resultEvent: RuntimeEvent;
                judgmentEvent: RuntimeEvent;
                cCall: CCall;
                result: import("./c_call.js").AdmittedCCallResult;
                judgment: import("./c_call.js").AdmittedCCallJudgment;
            };
            bases: ExecutionBasis[];
            installedRoots: string[];
        };
        prefix: ValidatedRuntimeEventPrefix;
        installedRoots: string[];
    };
    execution: ExecutionBasis;
    call: CCall;
    prefix: ValidatedRuntimeEventPrefix;
} | null;
export declare function constructWorksiteCommandForwardNativeBasis(basis: WorksiteCommandForwardNativeBasis): Readonly<WorksiteCommandForwardNativeBasis> | null;
export declare function worksiteCommandForwardChildSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, durable: DurablePrefixCoordinate, parentRef: string | null, parentCCallRef: string | null, input: unknown, physical?: boolean): boolean;
export declare function worksiteCommandForwardResultMatches(basis: WorksiteCommandForwardNativeBasis, input: unknown, value: unknown): boolean;
