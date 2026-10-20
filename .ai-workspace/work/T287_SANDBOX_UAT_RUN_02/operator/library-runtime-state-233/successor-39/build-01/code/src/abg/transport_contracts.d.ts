import type { SpawnOptionsWithoutStdio } from "node:child_process";
import { type Sha256Digest } from "../shared/digests.js";
import type { VerifiedProbabilisticResultContractPreimage } from "../implementation/contracts.js";
export interface NativeWorkerResultAssessment {
    readonly kind: "native_worker_result_assessment";
    readonly schemaVersion: "5.0.0";
    readonly resultContractRef: string;
    readonly inputDigest: Sha256Digest;
    readonly rawOutputDigest: Sha256Digest;
    readonly disposition: "admitted" | "rejected" | "absent";
    readonly verification: VerifiedProbabilisticResultContractPreimage | null;
}
export declare function isNativeWorkerResultAssessment(value: unknown, output: string, resultContractRef: string, inputDigest: Sha256Digest): value is NativeWorkerResultAssessment;
export type KnownTransportAgentKey = "claude" | "codex" | "gemini" | "generic";
export type TransportCapabilityLane = "closed_prompt_proof" | "worker_executes";
export type WorkerSandboxDeclaration = "agent_default" | "external";
export declare const WORKER_TRANSPORT_FAILURE_CLASS_VALUES: readonly ["contract_failure", "no_output", "transport_failure"];
export type WorkerTransportFailureClass = (typeof WORKER_TRANSPORT_FAILURE_CLASS_VALUES)[number];
export interface WorkerTransportFailureObservation {
    readonly parser: WorkerTransportContract["parser"];
    readonly lane: TransportCapabilityLane;
    readonly processStatus: number | null;
    readonly timedOut: boolean;
    readonly terminationConfirmed: boolean;
    readonly processSpawnFailed: boolean;
    readonly structuredEventCount: number;
    readonly toolCallCount: number;
    readonly apiRetryCount: number;
    readonly finalOutput: string;
    readonly nativeResultDisposition?: "admitted" | "rejected" | "absent";
}
export declare function classifyWorkerTransportFailure(observation: WorkerTransportFailureObservation): WorkerTransportFailureClass | null;
export interface WorkerTransportContract {
    readonly kind: "worker_transport_contract";
    readonly schemaVersion: "5.0.0";
    readonly agentKey: KnownTransportAgentKey;
    readonly command: string;
    readonly prefixArgs: readonly string[];
    readonly argsTemplate: readonly string[];
    readonly parser: "claude_stream_json" | "plain_text";
    readonly promptTransport: "argv" | "stdin";
    readonly sanitizedEnvironmentPrefixes: readonly string[];
}
export interface WorkerTransportContractOptions {
    readonly command?: string;
    readonly prefixArgs?: readonly string[];
    readonly environment?: Readonly<Record<string, string | undefined>>;
}
export declare const TRANSPORT_PROTOCOL_OWNED_FLAGS: Readonly<Record<KnownTransportAgentKey, readonly string[]>>;
export declare function transportAppendArgsEnvVar(agentKey: KnownTransportAgentKey): string;
export declare function admitWorkerSandboxDeclaration(environment?: Readonly<Record<string, string | undefined>>): WorkerSandboxDeclaration;
export declare function admitTransportAppendArgs(input: {
    readonly agentKey: KnownTransportAgentKey;
    readonly environment?: Readonly<Record<string, string | undefined>>;
    readonly explicitArgs?: readonly string[];
}): readonly string[];
export declare function withTransportAppendArgs(template: readonly string[], appendArgs: readonly string[]): readonly string[];
export declare function constructKnownWorkerTransportContract(agentKey: KnownTransportAgentKey, options?: WorkerTransportContractOptions): WorkerTransportContract;
export declare function composeWorkerTransportArgs(input: {
    readonly contract: WorkerTransportContract;
    readonly prompt: string;
    readonly outputPath: string;
    readonly lane: TransportCapabilityLane;
    readonly responseJsonSchema?: unknown;
    /** Owner-selected result text keeps the declared schema out of host dialect validation. */
    readonly responsePresentation?: "result_text";
    readonly environment?: Readonly<Record<string, string | undefined>>;
    readonly explicitAppendArgs?: readonly string[];
}): readonly string[];
export declare function sanitizeWorkerTransportEnvironment(contract: WorkerTransportContract, source?: Readonly<Record<string, string | undefined>>): SpawnOptionsWithoutStdio["env"];
