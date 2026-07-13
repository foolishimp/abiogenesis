import type {
  AgentTransportContract,
  SanitizedEnvironmentPolicy
} from "./carriers.js";

export const AGENT_TRANSPORT_FAILURE_CLASS_VALUES = Object.freeze([
  "transport_failure",
  "no_output",
  "contract_failure"
] as const);

export type KnownTransportAgentKey = "claude" | "codex" | "gemini" | "generic";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

// Adapter/bootstrap ingress (runtime truth rule 11; the ABG_TS_CODEX_MODEL
// precedent): the worker command line is an ENVIRONMENTAL BINDING of the
// install. Downstream installs lawfully localize argv (B-001 support/4.6.x:
// a consumer's `--append-system-prompt` operator fixture was blocked by the
// release-snapshot gate). Localization enters through one declared, bounded
// append surface per agent; protocol-owned flags remain upstream law and are
// rejected fail-closed.
export const TRANSPORT_PROTOCOL_OWNED_FLAGS: Readonly<
  Record<KnownTransportAgentKey, readonly string[]>
> = Object.freeze({
  claude: Object.freeze([
    "-p",
    "--tools",
    "--safe-mode",
    "--output-format",
    "--permission-mode",
    "--json-schema"
  ]),
  codex: Object.freeze(["exec", "--model", "--sandbox", "--full-auto", "-o"]),
  gemini: Object.freeze(["-p"]),
  generic: Object.freeze([])
});

export function transportAppendArgsEnvVar(
  agentKey: KnownTransportAgentKey
): string {
  return `ABG_TS_${agentKey.toUpperCase()}_APPEND_ARGS`;
}

function parseAppendArgsJson(
  envVar: string,
  rawValue: string | undefined
): readonly string[] {
  if (rawValue === undefined || rawValue === "") {
    return Object.freeze([]);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new TypeError(
      `${envVar} must be a JSON array of strings (governed install binding)`
    );
  }
  if (!Array.isArray(parsed)) {
    throw new TypeError(
      `${envVar} must be a JSON array of strings (governed install binding)`
    );
  }
  const entries: string[] = [];
  for (const value of parsed) {
    if (typeof value !== "string") {
      throw new TypeError(
        `${envVar} must be a JSON array of strings (governed install binding)`
      );
    }
    entries.push(value);
  }
  return Object.freeze(entries);
}

export function admitTransportAppendArgs(input: {
  readonly agentKey: KnownTransportAgentKey;
  readonly explicitArgs?: readonly string[];
}): readonly string[] {
  const envVar = transportAppendArgsEnvVar(input.agentKey);
  const fromEnv = parseAppendArgsJson(envVar, process.env[envVar]);
  const merged = [...fromEnv, ...(input.explicitArgs ?? [])];
  const bannedFlags = TRANSPORT_PROTOCOL_OWNED_FLAGS[input.agentKey];
  for (const arg of merged) {
    if (arg.length === 0) {
      throw new TypeError(`${envVar} entries must be non-empty strings`);
    }
    if (arg.includes("{prompt}") || arg.includes("{output_path}")) {
      throw new TypeError(
        `${envVar} entries must not carry template placeholders: ${arg}`
      );
    }
    const flagToken = arg.split("=", 1)[0] ?? arg;
    if (bannedFlags.includes(flagToken)) {
      throw new TypeError(
        `${envVar} must not override protocol-owned flag ${flagToken}`
      );
    }
  }
  return Object.freeze(merged);
}

// Append args land after the stable protocol prefix and before the first
// placeholder (stepping over a flag that carries the placeholder as its
// value, e.g. codex `-o {output_path}`), so positional prompt/output stay
// terminal for every agent shape.
export function withTransportAppendArgs(
  template: readonly string[],
  appendArgs: readonly string[]
): readonly string[] {
  if (appendArgs.length === 0) {
    return template;
  }
  const placeholderIndex = template.findIndex(
    (arg) => arg === "{prompt}" || arg === "{output_path}"
  );
  const insertionIndex =
    placeholderIndex === -1
      ? template.length
      : placeholderIndex > 0 &&
          template[placeholderIndex - 1]?.startsWith("-") === true
        ? placeholderIndex - 1
        : placeholderIndex;
  return [
    ...template.slice(0, insertionIndex),
    ...appendArgs,
    ...template.slice(insertionIndex)
  ];
}

export function constructSanitizedEnvironmentPolicy(
  prefixes: readonly string[]
): SanitizedEnvironmentPolicy {
  return Object.freeze({
    prefixes: freezeStringArray(prefixes.filter((prefix) => prefix.length > 0))
  });
}

export function constructAgentTransportContract(input: {
  readonly agentKey: string;
  readonly command: string;
  readonly argsTemplate: readonly string[];
  readonly sanitizedEnvironmentPolicy: SanitizedEnvironmentPolicy;
}): AgentTransportContract {
  return Object.freeze({
    agentKey: input.agentKey,
    command: input.command,
    argsTemplate: freezeStringArray(input.argsTemplate),
    sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy(
      input.sanitizedEnvironmentPolicy.prefixes
    )
  });
}

export function selectKnownTransportAgentKey(
  hints: readonly string[]
): KnownTransportAgentKey {
  for (const hint of hints) {
    const lowered = hint.toLowerCase();
    if (lowered.includes("claude")) {
      return "claude";
    }
    if (lowered.includes("codex")) {
      return "codex";
    }
    if (lowered.includes("gemini")) {
      return "gemini";
    }
  }
  return "generic";
}

export function contractForKnownAgent(
  agentKey: KnownTransportAgentKey
): AgentTransportContract {
  switch (agentKey) {
    case "claude":
      return constructAgentTransportContract({
        agentKey,
        command: "claude",
        argsTemplate: withTransportAppendArgs(
          [
            "-p",
            "--output-format",
            "text",
            "--permission-mode",
            "bypassPermissions",
            "{prompt}"
          ],
          admitTransportAppendArgs({ agentKey })
        ),
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([
          "CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL",
          "CLAUDE_CODE_SSE_",
          "CLAUDE_CODE_ENTRYPOINT",
          "CLAUDE_CODE_EXECPATH"
        ])
      });
    case "codex":
      return constructAgentTransportContract({
        agentKey,
        command: "codex",
        argsTemplate: withTransportAppendArgs(
          [
            "exec",
            "--model",
            // Adapter/bootstrap ingress (runtime truth rule 11): the codex
            // model is account-dependent; hardcoding it broke ChatGPT-account
            // workers (T-030 data-mapper campaign, builder bug #2).
            process.env["ABG_TS_CODEX_MODEL"] ?? "gpt-5.5",
            // Adapter/bootstrap ingress (runtime truth rule 11; the
            // ABG_TS_CODEX_MODEL precedent): the sandbox capability is an
            // ENVIRONMENTAL BINDING of the install. odd_glc T-032 campaign
            // BUG #6: --full-auto denies ServerSocket binding, killing
            // sbt's forked-test transport and Spark's Netty BEFORE subject
            // tests execute — the execution-default law requires workers
            // to run toolchains whose test transports bind local sockets.
            ...(process.env["ABG_TS_CODEX_SANDBOX"] !== undefined &&
            process.env["ABG_TS_CODEX_SANDBOX"] !== ""
              ? ["--sandbox", process.env["ABG_TS_CODEX_SANDBOX"]]
              : ["--full-auto"]),
            "--skip-git-repo-check",
            "-o",
            "{output_path}",
            "{prompt}"
          ],
          admitTransportAppendArgs({ agentKey })
        ),
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([])
      });
    case "gemini":
      return constructAgentTransportContract({
        agentKey,
        command: "gemini",
        argsTemplate: withTransportAppendArgs(
          ["-p", "{prompt}"],
          admitTransportAppendArgs({ agentKey })
        ),
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([])
      });
    case "generic":
      return constructAgentTransportContract({
        agentKey,
        command: "fp-transport",
        argsTemplate: withTransportAppendArgs(
          ["{prompt}"],
          admitTransportAppendArgs({ agentKey })
        ),
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([])
      });
  }
}
