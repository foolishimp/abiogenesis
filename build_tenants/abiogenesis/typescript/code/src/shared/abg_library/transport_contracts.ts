import type {
  AgentTransportContract,
  SanitizedEnvironmentPolicy
} from "./carriers.js";

export type KnownTransportAgentKey = "claude" | "codex" | "gemini" | "generic";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
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
        argsTemplate: [
          "-p",
          "--output-format",
          "text",
          "--permission-mode",
          "bypassPermissions",
          "{prompt}"
        ],
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
        argsTemplate: [
          "exec",
          "--model",
          "gpt-5.3-codex",
          "--full-auto",
          "--skip-git-repo-check",
          "-o",
          "{output_path}",
          "{prompt}"
        ],
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([])
      });
    case "gemini":
      return constructAgentTransportContract({
        agentKey,
        command: "gemini",
        argsTemplate: ["-p", "{prompt}"],
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([])
      });
    case "generic":
      return constructAgentTransportContract({
        agentKey,
        command: "fp-transport",
        argsTemplate: ["{prompt}"],
        sanitizedEnvironmentPolicy: constructSanitizedEnvironmentPolicy([])
      });
  }
}
