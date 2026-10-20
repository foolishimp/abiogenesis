import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { RuntimeLivenessObserverProjection } from "./runtime_liveness_contracts.js";
import { type TransportCapabilityLane, type WorkerTransportContract, type WorkerTransportFailureClass, type NativeWorkerResultAssessment } from "./transport_contracts.js";
export type { WorkerTransportFailureClass } from "./transport_contracts.js";
export type WorkerTransportTimeoutClass = "absolute" | "inactivity";
export interface WorkerTransportArtifact {
    readonly path: string;
    readonly byteLength: number;
    readonly digest: Sha256Digest;
}
export interface WorkerTransportRequest {
    readonly contract: WorkerTransportContract;
    readonly prompt: string;
    readonly lane: TransportCapabilityLane;
    readonly cwd: string;
    readonly archiveRoot: string;
    readonly label: string;
    readonly timeoutMs: number;
    readonly absoluteTimeoutMs?: number;
    readonly terminationGraceMs?: number;
    readonly responseJsonSchema?: unknown;
    readonly responsePresentation?: "result_text";
    readonly environment?: Readonly<Record<string, string | undefined>>;
    readonly explicitAppendArgs?: readonly string[];
    readonly observer?: WorkerProcessObserver;
}
export interface WorkerProcessObserver {
    readonly assessNativeResultArtifact?: (output: string) => NativeWorkerResultAssessment;
    /** Only the existing native owner supplies this callback. A wakeup is raw;
     * containment requires the returned already-admitted threshold identity. */
    readonly onNativeSupervisionWakeup?: () => Readonly<{
        projection: RuntimeLivenessObserverProjection;
        admittedThresholdEventRef: string | null;
        timeoutClass: WorkerTransportTimeoutClass | null;
        nextWakeDelayMs: number;
    }>;
    readonly onProcessStarted?: (pid: number) => void;
    readonly onStdoutObserved?: (chunk: string) => boolean;
    readonly onStderrObserved?: (chunk: string) => boolean;
    readonly onTimeoutObserved?: (timeoutClass: WorkerTransportTimeoutClass) => void;
    readonly onSignalRequested?: (signal: NodeJS.Signals) => void;
    readonly onProcessExited?: (status: number | null, signal: NodeJS.Signals | null) => void;
    readonly onTerminationUnconfirmed?: () => void;
    readonly onSpawnFailed?: (message: string) => void;
}
export interface WorkerTransportResult {
    readonly nativeResultAssessment?: NativeWorkerResultAssessment;
    readonly kind: "worker_transport_result_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "failure" | "success";
    readonly agentKey: WorkerTransportContract["agentKey"];
    readonly lane: TransportCapabilityLane;
    readonly command: string;
    readonly args: readonly string[];
    readonly status: number | null;
    readonly signal: NodeJS.Signals | null;
    readonly timeoutMs: number;
    readonly absoluteTimeoutMs: number;
    readonly timedOut: boolean;
    readonly timeoutClass: WorkerTransportTimeoutClass | null;
    readonly exitObserved: boolean;
    readonly terminationConfirmed: boolean;
    readonly failureClass: WorkerTransportFailureClass | null;
    readonly structuredEventCount: number;
    readonly progressEventCount: number;
    readonly toolCallCount: number;
    readonly toolInvocations: readonly WorkerToolInvocationEvidence[];
    readonly apiRetryCount: number;
    readonly stdout: string;
    readonly stderr: string;
    readonly finalOutput: string;
    readonly artifacts: Readonly<{
        output: WorkerTransportArtifact;
        prompt: WorkerTransportArtifact;
        stderr: WorkerTransportArtifact;
        stdout: WorkerTransportArtifact;
        transport: WorkerTransportArtifact;
    }>;
}
export interface WorkerToolInvocationEvidence {
    readonly [key: string]: JsonValue;
    readonly kind: "worker_tool_invocation_evidence";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly toolUseRef: string;
    readonly toolName: string;
    readonly inputDigest: Sha256Digest;
    readonly inputByteLength: number;
}
interface StructuredObservation {
    readonly structuredEventCount: number;
    readonly progressEventCount: number;
    readonly toolCallCount: number;
    readonly toolInvocations: readonly WorkerToolInvocationEvidence[];
    readonly apiRetryCount: number;
    readonly finalOutput: string;
}
/** One incremental decoder for complete protocol rows. Partial message events
 * expose received bytes, not unobservable model progress or tool execution. */
export declare function createWorkerTransportOutputObserver(structuredOutputExpected: boolean): {
    observe(chunk: string): StructuredObservation;
    finish(): StructuredObservation;
};
/** Pure existing protocol parser, shared by the native artifact observer. */
export declare function observeWorkerTransportOutput(parser: WorkerTransportContract["parser"], stdout: string, structuredRequested: boolean): StructuredObservation;
export interface PreparedWorkerTransport {
    readonly kind: "prepared_worker_transport";
    readonly schemaVersion: "5.0.0";
    readonly planDigest: Sha256Digest;
    readonly contractDigest: Sha256Digest;
    readonly agentKey: WorkerTransportContract["agentKey"];
    readonly parser: WorkerTransportContract["parser"];
    readonly promptTransport: WorkerTransportContract["promptTransport"];
    readonly lane: TransportCapabilityLane;
    readonly command: string;
    readonly args: readonly string[];
    readonly cwd: string;
    readonly archiveRoot: string;
    readonly label: string;
    readonly timeoutMs: number;
    readonly absoluteTimeoutMs: number;
    readonly terminationGraceMs: number;
    readonly promptDigest: Sha256Digest;
    readonly responseJsonSchemaDigest: Sha256Digest | null;
    readonly environmentPolicyDigest: Sha256Digest;
    readonly environmentDigest: Sha256Digest;
    readonly paths: Readonly<{
        prompt: string;
        output: string;
        stdout: string;
        stderr: string;
        transport: string;
    }>;
}
export declare function prepareWorkerTransport(input: WorkerTransportRequest): Promise<PreparedWorkerTransport>;
export declare function runPreparedWorkerTransport(plan: PreparedWorkerTransport, observer?: WorkerProcessObserver): Promise<WorkerTransportResult>;
export declare function runWorkerTransport(input: WorkerTransportRequest): Promise<WorkerTransportResult>;
