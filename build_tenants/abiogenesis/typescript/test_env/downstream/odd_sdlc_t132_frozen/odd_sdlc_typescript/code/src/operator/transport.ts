// Implements: REQ-F-ODDSDLC-052
// Implements: REQ-F-ODDSDLC-053

import { readFileSync } from "node:fs";
import { basename } from "node:path";
import {
  type TracedProcessExecutorProfile,
  type TracedProcessParser
} from "@abiogenesis/typescript-tenant";
import type {
  SdlcWorkerHandoffManifest,
  SdlcWorkerTransportContract
} from "./carriers.js";

function transportAgentKey(command: string): string {
  const name = basename(command).toLowerCase();
  if (name.includes("codex")) {
    return "codex";
  }
  if (name.includes("claude")) {
    return "claude";
  }
  if (name.includes("gemini")) {
    return "gemini";
  }
  if (name.includes("node")) {
    return "node";
  }
  return "generic";
}

function parseEffort(
  rawEffort: string | null
): "low" | "medium" | "high" | "xhigh" | "max" | null {
  if (rawEffort === null || rawEffort.trim().length === 0) {
    return null;
  }
  const effort = rawEffort.trim();
  if (
    effort === "low" ||
    effort === "medium" ||
    effort === "high" ||
    effort === "xhigh" ||
    effort === "max"
  ) {
    return effort;
  }
  throw new TypeError(
    "SdlcWorkerTransportContract.effort: expected low, medium, high, xhigh, or max"
  );
}

function parseCodexSandboxMode(
  rawSandbox: string | null
): "read-only" | "workspace-write" | "danger-full-access" {
  if (rawSandbox === null || rawSandbox.trim().length === 0) {
    return "workspace-write";
  }
  const sandbox = rawSandbox.trim();
  if (
    sandbox === "read-only" ||
    sandbox === "workspace-write" ||
    sandbox === "danger-full-access"
  ) {
    return sandbox;
  }
  throw new TypeError(
    "SdlcWorkerTransportContract.codexSandboxMode: expected read-only, workspace-write, or danger-full-access"
  );
}

function normalizedWorkerTransportUrl(rawTransport: string): string {
  const trimmed = rawTransport.trim();
  const alias = /^(claude|codex|gemini|node)(\?.*)?$/u.exec(trimmed);
  if (alias !== null) {
    return `process://${alias[1]}${alias[2] ?? ""}`;
  }
  return trimmed;
}

export function admitWorkerTransport(
  rawTransport: string
): SdlcWorkerTransportContract {
  let parsed: URL;
  try {
    parsed = new URL(normalizedWorkerTransportUrl(rawTransport));
  } catch (error: unknown) {
    throw new TypeError(
      `SdlcWorkerTransportContract.url: expected process:// transport or known worker alias; ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  if (parsed.protocol !== "process:") {
    throw new TypeError("SdlcWorkerTransportContract.scheme: expected process://");
  }
  const command =
    parsed.hostname.length > 0
      ? parsed.hostname
      : decodeURIComponent(parsed.pathname);
  if (command.length === 0 || command === "/") {
    throw new TypeError("SdlcWorkerTransportContract.command: expected command");
  }
  const script = parsed.searchParams.get("script");
  const args: readonly string[] =
    script === null || script.trim().length === 0
      ? Object.freeze([])
      : Object.freeze([script]);
  const rawModel = parsed.searchParams.get("model");
  const model =
    rawModel === null || rawModel.trim().length === 0 ? null : rawModel.trim();
  const effort = parseEffort(parsed.searchParams.get("effort"));
  const codexSandboxMode = parseCodexSandboxMode(
    parsed.searchParams.get("sandbox")
  );
  const agentKey = transportAgentKey(command);
  return Object.freeze({
    kind: "sdlc_worker_transport_contract",
    raw: rawTransport,
    scheme: "process",
    agentKey,
    command,
    args,
    model,
    effort,
    codexSandboxMode,
    workerId: `worker://odd-sdlc/${agentKey}`,
    backendId: `backend://process/${agentKey}`
  });
}

function codexArgs(input: {
  readonly workspaceRoot: string;
  readonly promptPath: string;
  readonly outputLastMessagePath: string;
  readonly model: string | null;
  readonly effort: "low" | "medium" | "high" | "xhigh" | "max" | null;
  readonly sandboxMode: "read-only" | "workspace-write" | "danger-full-access";
}): readonly string[] {
  const modelArgs =
    input.model === null ? Object.freeze([]) : Object.freeze(["--model", input.model]);
  const effortArgs =
    input.effort === null
      ? Object.freeze([])
      : Object.freeze(["-c", `model_reasoning_effort="${input.effort}"`]);
  return Object.freeze([
    "exec",
    "--ignore-user-config",
    "--disable",
    "image_generation",
    ...modelArgs,
    ...effortArgs,
    "-c",
    "features.memories=false",
    "-c",
    "memories.use_memories=false",
    "-c",
    "memories.generate_memories=false",
    "--skip-git-repo-check",
    "--ephemeral",
    "--sandbox",
    input.sandboxMode,
    "--cd",
    input.workspaceRoot,
    "--output-last-message",
    input.outputLastMessagePath,
    "-"
  ]);
}

interface SdlcWorkerCapabilityArgProfile {
  readonly agentKey: "claude";
  readonly stdinPromptMode: "prompt_stdin";
  readonly parser: "claude-stream-json";
  readonly headArgs: readonly string[];
  readonly modelFlag: string;
  readonly effortFlag: string;
  readonly fixedArgs: readonly string[];
}

const SDLC_WORKER_CAPABILITY_ARG_PROFILES = Object.freeze({
  claude: Object.freeze({
    agentKey: "claude" as const,
    stdinPromptMode: "prompt_stdin" as const,
    parser: "claude-stream-json" as const,
    headArgs: Object.freeze(["-p"]),
    modelFlag: "--model",
    effortFlag: "--effort",
    fixedArgs: Object.freeze([
      "--output-format",
      "stream-json",
      "--verbose",
      "--disable-slash-commands",
      "--no-session-persistence",
      "--strict-mcp-config",
      "--mcp-config",
      "{\"mcpServers\":{}}",
      "--setting-sources",
      "project,local",
      "--permission-mode",
      "bypassPermissions"
    ])
  } satisfies SdlcWorkerCapabilityArgProfile)
});

function workerCapabilityArgsForTransport(input: {
  readonly transport: SdlcWorkerTransportContract;
}): readonly string[] | null {
  if (input.transport.agentKey !== "claude") {
    return null;
  }
  const profile = SDLC_WORKER_CAPABILITY_ARG_PROFILES.claude;
  const modelArgs =
    input.transport.model === null
      ? Object.freeze([])
      : Object.freeze([profile.modelFlag, input.transport.model]);
  const effortArgs =
    input.transport.effort === null
      ? Object.freeze([])
      : Object.freeze([profile.effortFlag, input.transport.effort]);
  return Object.freeze([
    ...profile.headArgs,
    ...modelArgs,
    ...effortArgs,
    ...profile.fixedArgs
  ]);
}

export function argsForWorker(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly manifestPath: string;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly promptPath: string;
  readonly outputLastMessagePath: string;
}): readonly string[] {
  if (input.transport.args.length === 0) {
    if (input.transport.agentKey === "codex") {
      return codexArgs({
        workspaceRoot: input.manifest.workspaceRoot,
        promptPath: input.promptPath,
        outputLastMessagePath: input.outputLastMessagePath,
        model: input.transport.model,
        effort: input.transport.effort,
        sandboxMode: input.transport.codexSandboxMode
      });
    }
    if (input.transport.agentKey === "claude") {
      const capabilityArgs = workerCapabilityArgsForTransport({
        transport: input.transport
      });
      if (capabilityArgs !== null) {
        return capabilityArgs;
      }
    }
  }
  return Object.freeze([...input.transport.args, input.manifestPath]);
}

export function stdinForWorker(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly promptPath: string;
}): string | null {
  if (
    input.transport.args.length === 0 &&
    (input.transport.agentKey === "codex" || input.transport.agentKey === "claude")
  ) {
    return readFileSync(input.promptPath, "utf8");
  }
  return null;
}

export interface SdlcWorkerProcessLaunch {
  readonly command: string;
  readonly args: readonly string[];
  readonly stdin: string | null;
}

export function constrainClaudeProcessLaunchTools(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly processLaunch: SdlcWorkerProcessLaunch;
  readonly allowedTools: string | null;
}): SdlcWorkerProcessLaunch {
  if (
    input.allowedTools === null ||
    input.transport.agentKey !== "claude" ||
    input.transport.args.length > 0
  ) {
    return input.processLaunch;
  }
  return Object.freeze({
    ...input.processLaunch,
    args: Object.freeze([
      ...input.processLaunch.args,
      "--tools",
      input.allowedTools
    ])
  });
}

export function processLaunchForWorker(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly manifestPath: string;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly promptPath: string;
  readonly outputLastMessagePath: string;
  readonly executorProfile: TracedProcessExecutorProfile;
}): SdlcWorkerProcessLaunch {
  const args = argsForWorker(input);
  const stdin = stdinForWorker({
    transport: input.transport,
    promptPath: input.promptPath
  });
  if (input.executorProfile !== "pty-terminal" || stdin === null) {
    return Object.freeze({
      command: input.transport.command,
      args,
      stdin
    });
  }
  return Object.freeze({
    command: "/bin/sh",
    args: Object.freeze([
      "-lc",
      'prompt_file=$1; shift; exec "$@" < "$prompt_file"',
      "odd-sdlc-worker-stdin",
      input.promptPath,
      input.transport.command,
      ...args
    ]),
    stdin: null
  });
}

export function parserForWorkerTransport(
  transport: SdlcWorkerTransportContract
): TracedProcessParser {
  return transport.agentKey === "claude" && transport.args.length === 0
    ? "claude-stream-json"
    : "generic-text";
}

export function selectedWorkerExecutorProfile(
  env: Readonly<Record<string, string | undefined>> = process.env
): TracedProcessExecutorProfile {
  const raw =
    env["ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE"] ??
    env["ABG_TS_AGENT_EXECUTOR_PROFILE"];
  return raw === "pty-terminal" || raw === "local-spawn" ? raw : "local-spawn";
}
