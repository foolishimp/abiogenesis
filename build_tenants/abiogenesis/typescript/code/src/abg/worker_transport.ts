import { spawn } from "node:child_process";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  composeWorkerTransportArgs,
  sanitizeWorkerTransportEnvironment,
  type TransportCapabilityLane,
  type WorkerTransportContract,
} from "./transport_contracts.js";

export type WorkerTransportFailureClass =
  | "contract_failure"
  | "no_output"
  | "transport_failure";

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
  readonly terminationGraceMs?: number;
  readonly responseJsonSchema?: unknown;
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly explicitAppendArgs?: readonly string[];
  readonly observer?: WorkerProcessObserver;
}

export interface WorkerProcessObserver {
  readonly onProcessStarted?: (pid: number) => void;
  readonly onStdoutObserved?: (chunk: string) => void;
  readonly onStderrObserved?: (chunk: string) => void;
  readonly onTimeoutObserved?: () => void;
  readonly onSignalRequested?: (signal: NodeJS.Signals) => void;
  readonly onProcessExited?: (
    status: number | null,
    signal: NodeJS.Signals | null,
  ) => void;
  readonly onTerminationUnconfirmed?: () => void;
  readonly onSpawnFailed?: (message: string) => void;
}

export interface WorkerTransportResult {
  readonly kind: "worker_transport_result_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure" | "success";
  readonly agentKey: WorkerTransportContract["agentKey"];
  readonly lane: TransportCapabilityLane;
  readonly command: string;
  readonly args: readonly string[];
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly timedOut: boolean;
  readonly exitObserved: boolean;
  readonly terminationConfirmed: boolean;
  readonly failureClass: WorkerTransportFailureClass | null;
  readonly structuredEventCount: number;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
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

interface ProcessObservation {
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly timedOut: boolean;
  readonly exitObserved: boolean;
  readonly terminationConfirmed: boolean;
  readonly launchError: string | null;
  readonly resultBearingStdout: string;
  readonly stdout: string;
  readonly stderr: string;
}

interface StructuredObservation {
  readonly structuredEventCount: number;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
  readonly apiRetryCount: number;
  readonly finalOutput: string;
}

function artifact(path: string, bytes: Uint8Array): WorkerTransportArtifact {
  return deepFreeze({
    path,
    byteLength: bytes.byteLength,
    digest: sha256Bytes(bytes),
  });
}

function assertLabel(label: string): void {
  if (!/^[a-zA-Z0-9._-]+$/u.test(label)) {
    throw new TypeError("worker transport label must be one path-safe identity segment");
  }
}

function countToolUses(
  value: unknown,
  structuredOutputExpected: boolean,
): number {
  if (Array.isArray(value)) {
    return value.reduce(
      (count, entry) => count + countToolUses(entry, structuredOutputExpected),
      0,
    );
  }
  if (typeof value !== "object" || value === null) return 0;
  const record = value as Readonly<Record<string, unknown>>;
  // Claude emits this synthetic event to satisfy --json-schema; it has no capability effect.
  const protocolStructuredOutput = structuredOutputExpected &&
    record.type === "tool_use" &&
    record.name === "StructuredOutput";
  const current = record.type === "tool_use" && !protocolStructuredOutput ? 1 : 0;
  return Object.values(record).reduce<number>(
    (count, entry) => count + countToolUses(entry, structuredOutputExpected),
    current,
  );
}

function observeStructuredOutput(
  stdout: string,
  structuredOutputExpected: boolean,
): StructuredObservation {
  const values: unknown[] = [];
  for (const line of stdout.split(/\r?\n/u)) {
    if (line.trim().length === 0) continue;
    try {
      values.push(JSON.parse(line));
    } catch {
      continue;
    }
  }
  let finalOutput = "";
  let progressEventCount = 0;
  let toolCallCount = 0;
  let apiRetryCount = 0;
  for (const value of values) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
    const record = value as Readonly<Record<string, unknown>>;
    if (record.type !== "result") progressEventCount += 1;
    toolCallCount += countToolUses(record, structuredOutputExpected);
    if (record.type === "api_retry") apiRetryCount += 1;
    if (record.type === "result" && typeof record.result === "string") {
      finalOutput = record.result;
    }
  }
  return {
    structuredEventCount: values.length,
    progressEventCount,
    toolCallCount,
    apiRetryCount,
    finalOutput,
  };
}

function runProcess(input: {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
  readonly stdin: string | null;
  readonly timeoutMs: number;
  readonly terminationGraceMs: number;
  readonly observer?: WorkerProcessObserver;
}): Promise<ProcessObservation> {
  return new Promise((resolveProcess) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let launchError: string | null = null;
    let resultBearingStdout: string | null = null;
    let settled = false;
    let forceTimer: ReturnType<typeof setTimeout> | null = null;
    let confirmationTimer: ReturnType<typeof setTimeout> | null = null;
    let drainTimer: ReturnType<typeof setTimeout> | null = null;
    let observedExit: {
      readonly status: number | null;
      readonly signal: NodeJS.Signals | null;
    } | null = null;
    const snapshotResultBearingStdout = (): void => {
      if (resultBearingStdout === null) resultBearingStdout = stdout;
    };
    const child = spawn(input.command, input.args, {
      cwd: input.cwd,
      env: input.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const settle = (
      status: number | null,
      signal: NodeJS.Signals | null,
      exitObserved: boolean,
      terminationConfirmed: boolean,
    ): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (forceTimer !== null) clearTimeout(forceTimer);
      if (confirmationTimer !== null) clearTimeout(confirmationTimer);
      if (drainTimer !== null) clearTimeout(drainTimer);
      resolveProcess({
        status,
        signal,
        timedOut,
        exitObserved,
        terminationConfirmed,
        launchError,
        resultBearingStdout: resultBearingStdout ?? stdout,
        stdout,
        stderr,
      });
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      snapshotResultBearingStdout();
      input.observer?.onTimeoutObserved?.();
      input.observer?.onSignalRequested?.("SIGTERM");
      child.kill("SIGTERM");
      forceTimer = setTimeout(() => {
        input.observer?.onSignalRequested?.("SIGKILL");
        child.kill("SIGKILL");
        confirmationTimer = setTimeout(() => {
          input.observer?.onTerminationUnconfirmed?.();
          child.stdout.destroy();
          child.stderr.destroy();
          child.stdin.destroy();
          settle(null, null, false, false);
        }, input.terminationGraceMs);
      }, input.terminationGraceMs);
    }, input.timeoutMs);
    child.once("spawn", () => {
      if (child.pid !== undefined) input.observer?.onProcessStarted?.(child.pid);
    });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      input.observer?.onStdoutObserved?.(chunk);
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
      input.observer?.onStderrObserved?.(chunk);
    });
    child.once("error", (error) => {
      snapshotResultBearingStdout();
      launchError = error.message;
      input.observer?.onSpawnFailed?.(error.message);
    });
    child.once("exit", (status, signal) => {
      snapshotResultBearingStdout();
      observedExit = { status, signal };
      input.observer?.onProcessExited?.(status, signal);
      if (forceTimer !== null) clearTimeout(forceTimer);
      if (confirmationTimer !== null) clearTimeout(confirmationTimer);
      drainTimer = setTimeout(() => {
        child.stdout.destroy();
        child.stderr.destroy();
        child.stdin.destroy();
        settle(status, signal, true, true);
      }, Math.min(input.terminationGraceMs, 250));
    });
    child.once("close", (status, signal) => {
      snapshotResultBearingStdout();
      if (observedExit !== null) {
        settle(observedExit.status, observedExit.signal, true, true);
        return;
      }
      settle(status, signal, false, false);
    });
    if (input.stdin === null) {
      child.stdin.end();
    } else {
      child.stdin.end(input.stdin);
    }
  });
}

function classifyFailure(input: {
  readonly process: ProcessObservation;
  readonly parser: WorkerTransportContract["parser"];
  readonly lane: TransportCapabilityLane;
  readonly observation: StructuredObservation;
  readonly finalOutput: string;
}): WorkerTransportFailureClass | null {
  if (
    input.process.timedOut ||
    !input.process.terminationConfirmed ||
    input.process.launchError !== null ||
    input.process.status !== 0 ||
    input.observation.apiRetryCount > 0 ||
    (input.parser === "claude_stream_json" &&
      input.observation.structuredEventCount === 0)
  ) {
    return "transport_failure";
  }
  if (input.lane === "closed_prompt_proof" && input.observation.toolCallCount > 0) {
    return "contract_failure";
  }
  return input.finalOutput.trim().length === 0 ? "no_output" : null;
}

async function executeWorkerTransport(
  input: WorkerTransportRequest,
): Promise<WorkerTransportResult> {
  assertLabel(input.label);
  if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs < 1) {
    throw new TypeError("worker transport timeout must be one positive safe integer");
  }
  const terminationGraceMs = input.terminationGraceMs ?? 1_000;
  if (!Number.isSafeInteger(terminationGraceMs) || terminationGraceMs < 1) {
    throw new TypeError("worker transport termination grace must be one positive safe integer");
  }
  await mkdir(input.archiveRoot, { recursive: true });
  const archiveRoot = await realpath(input.archiveRoot);
  const paths = {
    prompt: resolve(archiveRoot, `${input.label}-prompt.txt`),
    output: resolve(archiveRoot, `${input.label}-output.txt`),
    stdout: resolve(archiveRoot, `${input.label}-stdout.log`),
    stderr: resolve(archiveRoot, `${input.label}-stderr.log`),
    transport: resolve(archiveRoot, `${input.label}-transport.json`),
  };
  const environment = input.environment ?? process.env;
  const args = composeWorkerTransportArgs({
    contract: input.contract,
    prompt: input.prompt,
    outputPath: paths.output,
    lane: input.lane,
    environment,
    ...(input.responseJsonSchema === undefined
      ? {}
      : { responseJsonSchema: input.responseJsonSchema }),
    ...(input.explicitAppendArgs === undefined
      ? {}
      : { explicitAppendArgs: input.explicitAppendArgs }),
  });
  const processObservation = await runProcess({
    command: input.contract.command,
    args,
    cwd: input.cwd,
    env: sanitizeWorkerTransportEnvironment(input.contract, environment) ?? {},
    stdin: input.contract.promptTransport === "stdin" ? input.prompt : null,
    timeoutMs: input.timeoutMs,
    terminationGraceMs,
    ...(input.observer === undefined ? {} : { observer: input.observer }),
  });
  const observation = input.contract.parser === "claude_stream_json"
    ? observeStructuredOutput(
        processObservation.resultBearingStdout,
        input.responseJsonSchema !== undefined,
      )
    : {
      structuredEventCount: 0,
      progressEventCount:
        processObservation.resultBearingStdout.length > 0 ? 1 : 0,
      toolCallCount: 0,
      apiRetryCount: 0,
      finalOutput: processObservation.resultBearingStdout,
    };
  const finalOutput = observation.finalOutput;
  const failureClass = classifyFailure({
    process: processObservation,
    parser: input.contract.parser,
    lane: input.lane,
    observation,
    finalOutput,
  });
  const promptBytes = Buffer.from(input.prompt, "utf8");
  const outputBytes = Buffer.from(finalOutput, "utf8");
  const stdoutBytes = Buffer.from(processObservation.stdout, "utf8");
  const stderrBytes = Buffer.from(processObservation.stderr, "utf8");
  await Promise.all([
    writeFile(paths.prompt, promptBytes),
    writeFile(paths.output, outputBytes),
    writeFile(paths.stdout, stdoutBytes),
    writeFile(paths.stderr, stderrBytes),
  ]);
  const body = {
    kind: "worker_transport_result_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: failureClass === null ? "success" as const : "failure" as const,
    agentKey: input.contract.agentKey,
    lane: input.lane,
    command: input.contract.command,
    args,
    status: processObservation.status,
    signal: processObservation.signal,
    timedOut: processObservation.timedOut,
    exitObserved: processObservation.exitObserved,
    terminationConfirmed: processObservation.terminationConfirmed,
    failureClass,
    structuredEventCount: observation.structuredEventCount,
    progressEventCount: observation.progressEventCount,
    toolCallCount: observation.toolCallCount,
    apiRetryCount: observation.apiRetryCount,
    stdout: processObservation.stdout,
    stderr: processObservation.stderr,
    finalOutput,
    artifacts: {
      prompt: artifact(paths.prompt, promptBytes),
      output: artifact(paths.output, outputBytes),
      stdout: artifact(paths.stdout, stdoutBytes),
      stderr: artifact(paths.stderr, stderrBytes),
    },
  };
  const transportBytes = Buffer.from(`${canonicalJson(body as unknown as JsonValue)}\n`, "utf8");
  await writeFile(paths.transport, transportBytes);
  const result = deepFreeze({
    ...body,
    artifacts: {
      ...body.artifacts,
      transport: artifact(paths.transport, transportBytes),
    },
  }) as WorkerTransportResult;
  const persistedTransport = await readFile(paths.transport);
  if (sha256Bytes(persistedTransport) !== result.artifacts.transport.digest) {
    throw new TypeError("worker transport artifact changed after persistence");
  }
  return result;
}

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

const preparedTransportState = new WeakMap<
  PreparedWorkerTransport,
  Omit<WorkerTransportRequest, "observer">
>();

function exactEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(
    Object.entries(environment)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
      .sort(([left], [right]) => left.localeCompare(right)),
  ));
}

export async function prepareWorkerTransport(
  input: WorkerTransportRequest,
): Promise<PreparedWorkerTransport> {
  assertLabel(input.label);
  if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs < 1) {
    throw new TypeError("worker transport timeout must be one positive safe integer");
  }
  const terminationGraceMs = input.terminationGraceMs ?? 1_000;
  if (!Number.isSafeInteger(terminationGraceMs) || terminationGraceMs < 1) {
    throw new TypeError("worker transport termination grace must be one positive safe integer");
  }
  await mkdir(input.archiveRoot, { recursive: true });
  const archiveRoot = await realpath(input.archiveRoot);
  const cwd = await realpath(input.cwd);
  const sourceEnvironment = exactEnvironment(input.environment ?? process.env);
  const contract = input.contract;
  const paths = deepFreeze({
    prompt: resolve(archiveRoot, `${input.label}-prompt.txt`),
    output: resolve(archiveRoot, `${input.label}-output.txt`),
    stdout: resolve(archiveRoot, `${input.label}-stdout.log`),
    stderr: resolve(archiveRoot, `${input.label}-stderr.log`),
    transport: resolve(archiveRoot, `${input.label}-transport.json`),
  });
  const args = composeWorkerTransportArgs({
    contract,
    prompt: input.prompt,
    outputPath: paths.output,
    lane: input.lane,
    environment: sourceEnvironment,
    ...(input.responseJsonSchema === undefined
      ? {}
      : { responseJsonSchema: input.responseJsonSchema }),
    ...(input.explicitAppendArgs === undefined
      ? {}
      : { explicitAppendArgs: input.explicitAppendArgs }),
  });
  const sanitizedEnvironment = exactEnvironment(
    sanitizeWorkerTransportEnvironment(contract, sourceEnvironment) ?? {},
  );
  const body = {
    contractDigest: sha256Canonical(contract as unknown as JsonValue),
    agentKey: contract.agentKey,
    parser: contract.parser,
    promptTransport: contract.promptTransport,
    lane: input.lane,
    command: contract.command,
    args,
    cwd,
    archiveRoot,
    label: input.label,
    timeoutMs: input.timeoutMs,
    terminationGraceMs,
    promptDigest: sha256Canonical(input.prompt),
    responseJsonSchemaDigest: input.responseJsonSchema === undefined
      ? null
      : sha256Canonical(input.responseJsonSchema as JsonValue),
    environmentPolicyDigest: sha256Canonical({
      agentKey: contract.agentKey,
      sanitizedEnvironmentPrefixes: contract.sanitizedEnvironmentPrefixes,
    }),
    environmentDigest: sha256Canonical(sanitizedEnvironment as unknown as JsonValue),
    paths,
  };
  const plan = deepFreeze({
    kind: "prepared_worker_transport" as const,
    schemaVersion: "5.0.0" as const,
    planDigest: sha256Canonical(body as unknown as JsonValue),
    ...body,
  }) as PreparedWorkerTransport;
  const request: Omit<WorkerTransportRequest, "observer"> = {
    contract,
    prompt: input.prompt,
    lane: input.lane,
    cwd,
    archiveRoot,
    label: input.label,
    timeoutMs: input.timeoutMs,
    terminationGraceMs,
    ...(input.responseJsonSchema === undefined
      ? {}
      : { responseJsonSchema: input.responseJsonSchema }),
    environment: sourceEnvironment,
    ...(input.explicitAppendArgs === undefined
      ? {}
      : { explicitAppendArgs: input.explicitAppendArgs }),
  };
  preparedTransportState.set(plan, request);
  return plan;
}

export async function runPreparedWorkerTransport(
  plan: PreparedWorkerTransport,
  observer?: WorkerProcessObserver,
): Promise<WorkerTransportResult> {
  const request = preparedTransportState.get(plan);
  if (request === undefined) {
    throw new TypeError("worker transport plan was not prepared by this ABG module");
  }
  const result = await executeWorkerTransport({
    ...request,
    ...(observer === undefined ? {} : { observer }),
  });
  if (
    result.command !== plan.command ||
    canonicalJson(result.args as unknown as JsonValue) !==
      canonicalJson(plan.args as unknown as JsonValue)
  ) {
    throw new TypeError("executed worker transport differs from the prepared binding");
  }
  return result;
}

export async function runWorkerTransport(
  input: WorkerTransportRequest,
): Promise<WorkerTransportResult> {
  const plan = await prepareWorkerTransport(input);
  return runPreparedWorkerTransport(plan, input.observer);
}
