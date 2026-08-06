import type { SpawnOptionsWithoutStdio } from "node:child_process";

import { deepFreeze } from "../shared/immutable.js";

export type KnownTransportAgentKey = "claude" | "codex" | "gemini" | "generic";
export type TransportCapabilityLane = "closed_prompt_proof" | "worker_executes";
export type WorkerSandboxDeclaration = "agent_default" | "external";
export const WORKER_TRANSPORT_FAILURE_CLASS_VALUES = Object.freeze([
  "contract_failure",
  "no_output",
  "transport_failure",
] as const);
export type WorkerTransportFailureClass =
  (typeof WORKER_TRANSPORT_FAILURE_CLASS_VALUES)[number];

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
}

export function classifyWorkerTransportFailure(
  observation: WorkerTransportFailureObservation,
): WorkerTransportFailureClass | null {
  if (
    observation.timedOut || !observation.terminationConfirmed ||
    observation.processSpawnFailed || observation.processStatus !== 0 ||
    observation.apiRetryCount > 0 ||
    (observation.parser === "claude_stream_json" &&
      observation.structuredEventCount === 0)
  ) return "transport_failure";
  if (
    observation.lane === "closed_prompt_proof" &&
    observation.toolCallCount > 0
  ) return "contract_failure";
  return observation.finalOutput.trim().length === 0 ? "no_output" : null;
}

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

export const TRANSPORT_PROTOCOL_OWNED_FLAGS: Readonly<
  Record<KnownTransportAgentKey, readonly string[]>
> = deepFreeze({
  claude: [
    "-p",
    "--tools",
    "--safe-mode",
    "--output-format",
    "--permission-mode",
    "--json-schema",
  ],
  codex: ["exec", "--model", "--sandbox", "--full-auto", "-o"],
  gemini: ["-p"],
  generic: [],
});

function environmentValue(
  environment: Readonly<Record<string, string | undefined>>,
  key: string,
): string | undefined {
  const value = environment[key];
  return value === undefined || value.length === 0 ? undefined : value;
}

export function transportAppendArgsEnvVar(
  agentKey: KnownTransportAgentKey,
): string {
  return `ABG_TS_${agentKey.toUpperCase()}_APPEND_ARGS`;
}

export function admitWorkerSandboxDeclaration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): WorkerSandboxDeclaration {
  const raw = environmentValue(environment, "ABG_TS_WORKER_SANDBOX");
  if (raw === undefined || raw === "agent_default") return "agent_default";
  if (raw === "external") return "external";
  throw new TypeError(
    "ABG_TS_WORKER_SANDBOX must be 'agent_default' or 'external'",
  );
}

function parseAppendArgs(
  environment: Readonly<Record<string, string | undefined>>,
  environmentKey: string,
): readonly string[] {
  const raw = environmentValue(environment, environmentKey);
  if (raw === undefined) return Object.freeze([]);
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new TypeError(`${environmentKey} must be a JSON array of strings`);
  }
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
    throw new TypeError(`${environmentKey} must be a JSON array of strings`);
  }
  return Object.freeze([...value] as string[]);
}

export function admitTransportAppendArgs(input: {
  readonly agentKey: KnownTransportAgentKey;
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly explicitArgs?: readonly string[];
}): readonly string[] {
  const environment = input.environment ?? process.env;
  const environmentKey = transportAppendArgsEnvVar(input.agentKey);
  const args = [
    ...parseAppendArgs(environment, environmentKey),
    ...(input.explicitArgs ?? []),
  ];
  const protocolFlags = TRANSPORT_PROTOCOL_OWNED_FLAGS[input.agentKey];
  for (const arg of args) {
    if (arg.length === 0) {
      throw new TypeError(`${environmentKey} entries must be non-empty strings`);
    }
    if (arg.includes("{prompt}") || arg.includes("{output_path}")) {
      throw new TypeError(
        `${environmentKey} entries must not carry template placeholders`,
      );
    }
    const flag = arg.split("=", 1)[0] ?? arg;
    if (protocolFlags.includes(flag)) {
      throw new TypeError(
        `${environmentKey} must not override protocol-owned flag ${flag}`,
      );
    }
  }
  return Object.freeze(args);
}

export function withTransportAppendArgs(
  template: readonly string[],
  appendArgs: readonly string[],
): readonly string[] {
  if (appendArgs.length === 0) return Object.freeze([...template]);
  const placeholderIndex = template.findIndex(
    (arg) => arg === "{prompt}" || arg === "{output_path}",
  );
  const insertionIndex = placeholderIndex === -1
    ? template.length
    : placeholderIndex > 0 && template[placeholderIndex - 1]?.startsWith("-") === true
      ? placeholderIndex - 1
      : placeholderIndex;
  return Object.freeze([
    ...template.slice(0, insertionIndex),
    ...appendArgs,
    ...template.slice(insertionIndex),
  ]);
}

function contract(
  agentKey: KnownTransportAgentKey,
  command: string,
  prefixArgs: readonly string[],
  argsTemplate: readonly string[],
  parser: WorkerTransportContract["parser"],
  promptTransport: WorkerTransportContract["promptTransport"],
  sanitizedEnvironmentPrefixes: readonly string[],
): WorkerTransportContract {
  return deepFreeze({
    kind: "worker_transport_contract" as const,
    schemaVersion: "5.0.0" as const,
    agentKey,
    command,
    prefixArgs: [...prefixArgs],
    argsTemplate: [...argsTemplate],
    parser,
    promptTransport,
    sanitizedEnvironmentPrefixes: [...sanitizedEnvironmentPrefixes],
  });
}

export function constructKnownWorkerTransportContract(
  agentKey: KnownTransportAgentKey,
  options: WorkerTransportContractOptions = {},
): WorkerTransportContract {
  const environment = options.environment ?? process.env;
  const prefixArgs = options.prefixArgs ?? [];
  switch (agentKey) {
    case "claude":
      return contract(
        agentKey,
        options.command ?? "claude",
        prefixArgs,
        [
          "-p",
          "--disable-slash-commands",
          "--no-session-persistence",
          "--output-format",
          "stream-json",
          "--verbose",
          "--permission-mode",
          "bypassPermissions",
        ],
        "claude_stream_json",
        "stdin",
        [
          "CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL",
          "CLAUDE_CODE_SSE_",
          "CLAUDE_CODE_ENTRYPOINT",
          "CLAUDE_CODE_EXECPATH",
        ],
      );
    case "codex": {
      const explicitSandbox = environmentValue(environment, "ABG_TS_CODEX_SANDBOX");
      const sandboxArgs = explicitSandbox !== undefined
        ? ["--sandbox", explicitSandbox]
        : admitWorkerSandboxDeclaration(environment) === "external"
          ? ["--sandbox", "danger-full-access"]
          : ["--full-auto"];
      return contract(
        agentKey,
        options.command ?? "codex",
        prefixArgs,
        [
          "exec",
          "--model",
          environmentValue(environment, "ABG_TS_CODEX_MODEL") ?? "gpt-5.5",
          ...sandboxArgs,
          "--skip-git-repo-check",
          "-o",
          "{output_path}",
          "{prompt}",
        ],
        "plain_text",
        "argv",
        [],
      );
    }
    case "gemini":
      return contract(
        agentKey,
        options.command ?? "gemini",
        prefixArgs,
        ["-p", "{prompt}"],
        "plain_text",
        "argv",
        [],
      );
    case "generic":
      return contract(
        agentKey,
        options.command ?? "fp-transport",
        prefixArgs,
        ["{prompt}"],
        "plain_text",
        "argv",
        [],
      );
  }
}

export function composeWorkerTransportArgs(input: {
  readonly contract: WorkerTransportContract;
  readonly prompt: string;
  readonly outputPath: string;
  readonly lane: TransportCapabilityLane;
  readonly responseJsonSchema?: unknown;
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly explicitAppendArgs?: readonly string[];
}): readonly string[] {
  const environment = input.environment ?? process.env;
  const appendArgs = admitTransportAppendArgs({
    agentKey: input.contract.agentKey,
    environment,
    ...(input.explicitAppendArgs === undefined
      ? {}
      : { explicitArgs: input.explicitAppendArgs }),
  });
  const template = [...input.contract.prefixArgs, ...input.contract.argsTemplate];
  if (input.contract.agentKey === "claude") {
    if (input.lane === "closed_prompt_proof") {
      template.push("--safe-mode", "--tools", "");
    }
    if (input.responseJsonSchema !== undefined) {
      template.push("--json-schema", JSON.stringify(input.responseJsonSchema));
    }
  }
  return withTransportAppendArgs(template, appendArgs).map((arg) =>
    arg
      .replaceAll("{prompt}", input.prompt)
      .replaceAll("{output_path}", input.outputPath)
  );
}

export function sanitizeWorkerTransportEnvironment(
  contract: WorkerTransportContract,
  source: Readonly<Record<string, string | undefined>> = process.env,
): SpawnOptionsWithoutStdio["env"] {
  const environment: Record<string, string> = {};
  outer: for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    for (const prefix of contract.sanitizedEnvironmentPrefixes) {
      if (key.startsWith(prefix)) continue outer;
    }
    environment[key] = value;
  }
  if (contract.agentKey === "claude") {
    delete environment.CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL;
    environment.CLAUDE_CODE_DISABLE_ADVISOR_TOOL = "1";
  }
  return environment;
}
