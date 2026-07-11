// Implements: REQ-R-ABG3-PLUGIN-SEAMS-005
// Implements: REQ-R-ABG3-WITNESS-010

import {
  CONSENSUS_FP_DISPATCH_PLUGIN_REF,
  CONSENSUS_FP_EVALUATOR_PLUGIN_REF,
  LIVE_FP_DISPATCH_PLUGIN_REF,
  LIVE_FP_EVALUATOR_PLUGIN_REF,
  type EnginePluginCapabilities,
  type LiveFpDispatchCapability
} from "../../abg/m03/index.js";
import { stableSha256Digest } from "../../shared/runtime_identity.js";

export type LiveCapabilityValueSource = "flag" | "env" | "default";

type LiveAgentKey = "claude" | "codex" | "gemini" | "generic";
type LiveExecutorProfile = "local-spawn" | "pty-terminal";

export interface LiveCapabilityProjection {
  readonly kind: "live_capability_projection";
  readonly capabilityRef: string;
  readonly capabilityDigest: string;
  readonly executionContractDigest: string;
  readonly agentKey: LiveAgentKey;
  readonly agentKeySource: LiveCapabilityValueSource;
  readonly executorProfile: LiveExecutorProfile;
  readonly executorProfileSource: LiveCapabilityValueSource;
  readonly timeoutMs: number;
  readonly timeoutMsSource: LiveCapabilityValueSource;
  readonly availableLivePluginRefs: readonly string[];
}

export interface LiveCapabilityBinding {
  readonly kind: "live_capability_binding";
  readonly projection: LiveCapabilityProjection;
  readonly pluginCapabilities: EnginePluginCapabilities;
}

interface LiveExecutionContract {
  readonly agentContract: {
    readonly agentKey: string;
    readonly command: string;
    readonly argsTemplate: readonly string[];
    readonly sanitizedEnvironmentPolicy: {
      readonly prefixes: readonly string[];
    };
  };
  readonly cwd: string;
  readonly archiveRoot: string;
  readonly executorProfile: LiveExecutorProfile;
  readonly timeoutMs: number;
  readonly terminalSessionKeyPrefix: string | null;
  readonly labelPrefix: string | null;
}

function nonEmptyString(value: unknown, at: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${at} must be a non-empty string`);
  }
  return value;
}

function stringArray(value: unknown, at: string): readonly string[] {
  if (!Array.isArray(value) || !value.every((row) => typeof row === "string")) {
    throw new TypeError(`${at} must be an array of strings`);
  }
  return Object.freeze([...value]);
}

function liveAgentKey(value: unknown, at: string): LiveAgentKey {
  if (
    value !== "claude" &&
    value !== "codex" &&
    value !== "gemini" &&
    value !== "generic"
  ) {
    throw new TypeError(`${at} must name a known live agent`);
  }
  return value;
}

function executorProfile(
  value: unknown,
  at: string
): LiveExecutorProfile {
  if (value === undefined) {
    return "local-spawn";
  }
  if (value !== "local-spawn" && value !== "pty-terminal") {
    throw new TypeError(`${at} must be local-spawn or pty-terminal`);
  }
  return value;
}

function valueSource(
  value: unknown,
  at: string
): LiveCapabilityValueSource {
  if (value !== "flag" && value !== "env" && value !== "default") {
    throw new TypeError(`${at} must be flag, env, or default`);
  }
  return value;
}

function snapshotCapabilityRow(
  input: LiveFpDispatchCapability,
  at: string
): LiveFpDispatchCapability {
  const timeoutMs = input.timeoutMs;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError(`${at}.timeoutMs must be a positive safe integer`);
  }
  const profile = executorProfile(input.executorProfile, `${at}.executorProfile`);
  return Object.freeze({
    agentContract: Object.freeze({
      agentKey: liveAgentKey(input.agentContract.agentKey, `${at}.agentContract.agentKey`),
      command: nonEmptyString(input.agentContract.command, `${at}.agentContract.command`),
      argsTemplate: stringArray(
        input.agentContract.argsTemplate,
        `${at}.agentContract.argsTemplate`
      ),
      sanitizedEnvironmentPolicy: Object.freeze({
        prefixes: stringArray(
          input.agentContract.sanitizedEnvironmentPolicy.prefixes,
          `${at}.agentContract.sanitizedEnvironmentPolicy.prefixes`
        )
      })
    }),
    cwd: nonEmptyString(input.cwd, `${at}.cwd`),
    archiveRoot: nonEmptyString(input.archiveRoot, `${at}.archiveRoot`),
    timeoutMs,
    executorProfile: profile,
    ...(input.terminalSessionKeyPrefix === undefined
      ? {}
      : {
          terminalSessionKeyPrefix: nonEmptyString(
            input.terminalSessionKeyPrefix,
            `${at}.terminalSessionKeyPrefix`
          )
        }),
    ...(input.labelPrefix === undefined
      ? {}
      : {
          labelPrefix: nonEmptyString(
            input.labelPrefix,
            `${at}.labelPrefix`
          )
        })
  });
}

function executionContractFor(
  row: LiveFpDispatchCapability
): LiveExecutionContract {
  return Object.freeze({
    agentContract: row.agentContract,
    cwd: row.cwd,
    archiveRoot: row.archiveRoot,
    executorProfile: executorProfile(
      row.executorProfile,
      "LiveExecutionContract.executorProfile"
    ),
    timeoutMs: row.timeoutMs,
    terminalSessionKeyPrefix: row.terminalSessionKeyPrefix ?? null,
    labelPrefix: row.labelPrefix ?? null
  });
}

function executionContractDigestFor(row: LiveFpDispatchCapability): string {
  return stableSha256Digest(executionContractFor(row));
}

export function liveCapabilityDigest(input: {
  readonly workspaceRoot: string;
  readonly executionContractDigest: string;
  readonly agentKey: LiveCapabilityProjection["agentKey"];
  readonly agentKeySource: LiveCapabilityValueSource;
  readonly executorProfile: LiveCapabilityProjection["executorProfile"];
  readonly executorProfileSource: LiveCapabilityValueSource;
  readonly timeoutMs: number;
  readonly timeoutMsSource: LiveCapabilityValueSource;
  readonly availableLivePluginRefs: readonly string[];
}): string {
  return stableSha256Digest({
    kind: "abg_live_plugin_capability",
    workspaceRoot: input.workspaceRoot,
    executionContractDigest: input.executionContractDigest,
    agentKey: input.agentKey,
    agentKeySource: input.agentKeySource,
    executorProfile: input.executorProfile,
    executorProfileSource: input.executorProfileSource,
    timeoutMs: input.timeoutMs,
    timeoutMsSource: input.timeoutMsSource,
    availableLivePluginRefs: input.availableLivePluginRefs
  });
}

export function constructLiveCapabilityBinding(input: {
  readonly workspaceRoot: string;
  readonly agentKey: LiveCapabilityProjection["agentKey"];
  readonly agentKeySource: LiveCapabilityValueSource;
  readonly executorProfile: LiveCapabilityProjection["executorProfile"];
  readonly executorProfileSource: LiveCapabilityValueSource;
  readonly timeoutMs: number;
  readonly timeoutMsSource: LiveCapabilityValueSource;
  readonly pluginCapabilities: EnginePluginCapabilities;
}): LiveCapabilityBinding {
  const dispatchInput = input.pluginCapabilities.liveFpDispatch;
  const evaluatorInput = input.pluginCapabilities.liveFpEvaluator;
  if (dispatchInput === undefined || evaluatorInput === undefined) {
    throw new TypeError(
      "LiveCapabilityBinding requires both standard live F_P capability rows"
    );
  }
  const dispatch = snapshotCapabilityRow(dispatchInput, "liveFpDispatch");
  const evaluator = snapshotCapabilityRow(evaluatorInput, "liveFpEvaluator");
  const executionContractDigest = executionContractDigestFor(dispatch);
  if (executionContractDigestFor(evaluator) !== executionContractDigest) {
    throw new TypeError(
      "LiveCapabilityBinding dispatch and evaluator capability rows must be execution-equivalent"
    );
  }
  const derivedAgentKey = liveAgentKey(
    dispatch.agentContract.agentKey,
    "liveFpDispatch.agentContract.agentKey"
  );
  const derivedExecutorProfile = executorProfile(
    dispatch.executorProfile,
    "liveFpDispatch.executorProfile"
  );
  if (dispatch.cwd !== input.workspaceRoot) {
    throw new TypeError(
      "LiveCapabilityBinding workspaceRoot must equal the executable capability cwd"
    );
  }
  if (input.agentKey !== derivedAgentKey) {
    throw new TypeError(
      "LiveCapabilityBinding caller agentKey does not match the executable capability row"
    );
  }
  if (input.executorProfile !== derivedExecutorProfile) {
    throw new TypeError(
      "LiveCapabilityBinding caller executorProfile does not match the executable capability row"
    );
  }
  if (input.timeoutMs !== dispatch.timeoutMs) {
    throw new TypeError(
      "LiveCapabilityBinding caller timeoutMs does not match the executable capability row"
    );
  }
  const agentKeySource = valueSource(input.agentKeySource, "agentKeySource");
  const executorProfileSource = valueSource(
    input.executorProfileSource,
    "executorProfileSource"
  );
  const timeoutMsSource = valueSource(input.timeoutMsSource, "timeoutMsSource");
  const availableLivePluginRefs = Object.freeze([
    CONSENSUS_FP_DISPATCH_PLUGIN_REF,
    CONSENSUS_FP_EVALUATOR_PLUGIN_REF,
    LIVE_FP_DISPATCH_PLUGIN_REF,
    LIVE_FP_EVALUATOR_PLUGIN_REF
  ]);
  const capabilityDigest = liveCapabilityDigest({
    workspaceRoot: input.workspaceRoot,
    executionContractDigest,
    agentKey: derivedAgentKey,
    agentKeySource,
    executorProfile: derivedExecutorProfile,
    executorProfileSource,
    timeoutMs: dispatch.timeoutMs,
    timeoutMsSource,
    availableLivePluginRefs
  });
  const projection = Object.freeze({
    kind: "live_capability_projection" as const,
    capabilityRef: `capability:live:${capabilityDigest}`,
    capabilityDigest,
    executionContractDigest,
    agentKey: derivedAgentKey,
    agentKeySource,
    executorProfile: derivedExecutorProfile,
    executorProfileSource,
    timeoutMs: dispatch.timeoutMs,
    timeoutMsSource,
    availableLivePluginRefs
  });
  return Object.freeze({
    kind: "live_capability_binding",
    projection,
    pluginCapabilities: Object.freeze({
      liveFpDispatch: dispatch,
      liveFpEvaluator: evaluator
    })
  });
}

export function projectLiveCapability(
  binding: LiveCapabilityBinding | null | undefined
): LiveCapabilityProjection | null {
  return binding?.projection ?? null;
}
