import { spawn } from "node:child_process";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, type Sha256Digest } from "../shared/digests.js";
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
  readonly responseJsonSchema?: unknown;
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly explicitAppendArgs?: readonly string[];
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
  readonly launchError: string | null;
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

function countToolUses(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((count, entry) => count + countToolUses(entry), 0);
  }
  if (typeof value !== "object" || value === null) return 0;
  const record = value as Readonly<Record<string, unknown>>;
  const current = record.type === "tool_use" ? 1 : 0;
  return Object.values(record).reduce<number>(
    (count, entry) => count + countToolUses(entry),
    current,
  );
}

function observeStructuredOutput(stdout: string): StructuredObservation {
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
    toolCallCount += countToolUses(record);
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
}): Promise<ProcessObservation> {
  return new Promise((resolveProcess) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let launchError: string | null = null;
    let settled = false;
    const child = spawn(input.command, input.args, {
      cwd: input.cwd,
      env: input.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, input.timeoutMs);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", (error) => {
      launchError = error.message;
    });
    child.once("close", (status, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolveProcess({
        status,
        signal,
        timedOut,
        launchError,
        stdout,
        stderr,
      });
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

export async function runWorkerTransport(
  input: WorkerTransportRequest,
): Promise<WorkerTransportResult> {
  assertLabel(input.label);
  if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs < 1) {
    throw new TypeError("worker transport timeout must be one positive safe integer");
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
  });
  const observation = input.contract.parser === "claude_stream_json"
    ? observeStructuredOutput(processObservation.stdout)
    : {
      structuredEventCount: 0,
      progressEventCount: processObservation.stdout.length > 0 ? 1 : 0,
      toolCallCount: 0,
      apiRetryCount: 0,
      finalOutput: processObservation.stdout,
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
