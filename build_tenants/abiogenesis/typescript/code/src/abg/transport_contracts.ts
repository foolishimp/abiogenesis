import type { SpawnOptionsWithoutStdio } from "node:child_process";
import { lstatSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

import { deepFreeze } from "../shared/immutable.js";
import { hasExactKeys } from "../shared/admit/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { VerifiedProbabilisticResultContractPreimage } from "../implementation/contracts.js";

export type NativeWorkerResultAssessment = {
  readonly kind: "native_worker_result_assessment";
  readonly schemaVersion: "5.0.0";
  readonly resultContractRef: string;
  readonly inputDigest: Sha256Digest;
  readonly rawOutputDigest: Sha256Digest;
  readonly disposition: "admitted" | "rejected" | "absent";
  readonly verification: VerifiedProbabilisticResultContractPreimage | null;
};
export function isNativeWorkerResultAssessment(value: unknown, output: string, resultContractRef: string, inputDigest: Sha256Digest): value is NativeWorkerResultAssessment {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const a = value as NativeWorkerResultAssessment;
  if (!hasExactKeys(a, ["kind", "schemaVersion", "resultContractRef", "inputDigest", "rawOutputDigest", "disposition", "verification"]) ||
      a.kind !== "native_worker_result_assessment" || a.schemaVersion !== "5.0.0" || a.resultContractRef !== resultContractRef ||
      a.inputDigest !== inputDigest || a.rawOutputDigest !== sha256Bytes(output)) return false;
  if (a.disposition !== "admitted") return a.verification === null &&
    (a.disposition === "absent" ? output.trim().length === 0 : a.disposition === "rejected" && output.trim().length !== 0);
  const p = a.verification;
  if (p === null || typeof p !== "object" || !hasExactKeys(p, ["kind", "schemaVersion", "verificationRef", "verificationDigest", "contractCapabilityBasis", "implementationResolutionDigest", "implementationRef", "inputContractRef", "targetOutputContractRef", "instructionContractRef", "rawResultContractRef", "inputDigest", "rawResultDigest"]) ||
      p.kind !== "verified_probabilistic_result_contract_preimage" || p.schemaVersion !== "5.0.0" ||
      p.inputDigest !== inputDigest || p.rawResultContractRef !== resultContractRef ||
      typeof p.contractCapabilityBasis !== "object" || p.contractCapabilityBasis === null ||
      !hasExactKeys(p.contractCapabilityBasis, ["installId", "implementationSetRef", "implementationSetDigest", "publicationDigest"])) return false;
  try {
    const {kind: _kind, schemaVersion: _schema, verificationRef, verificationDigest, ...body} = p;
    const parsedOutput: JsonValue = JSON.parse(output);
    return sha256Canonical(parsedOutput) === p.rawResultDigest &&
      verificationDigest === sha256Canonical(body) &&
      verificationRef === `probabilistic-result-contract-preimage://abiogenesis/${verificationDigest.slice(7)}`;
  } catch { return false; }
}

/** D5: the four lifecycle copies a current-profile durable actor observation
 * omits. The fold derives them from the primary process events; the live
 * physical observation keeps them. */
export const RETIRED_ACTOR_LIFECYCLE_COPY_KEYS = Object.freeze(
  ["exitObserved", "signalSequence", "terminationConfirmed", "timedOut"] as const);
export type RetiredActorLifecycleCopyKey = (typeof RETIRED_ACTOR_LIFECYCLE_COPY_KEYS)[number];
export type ActorLifecycleCopies = Readonly<{
  timedOut: boolean;
  exitObserved: boolean;
  terminationConfirmed: boolean;
  signalSequence: readonly string[];
}>;
export type DurableActorObservation<T extends ActorLifecycleCopies> = Readonly<Omit<T, RetiredActorLifecycleCopyKey>>;

/** The one current-profile durable representation of a full live actor
 * observation: every member, including an optional native assessment, except
 * the four lifecycle copies. Pure; the live observation is not changed. The
 * current artifact writer and the qualification source digest both take it. */
export function projectDurableActorObservation<T extends ActorLifecycleCopies>(observation: T): DurableActorObservation<T> {
  const { timedOut: _timedOut, exitObserved: _exitObserved, terminationConfirmed: _terminationConfirmed,
    signalSequence: _signalSequence, ...durable } = observation;
  return deepFreeze(durable);
}

/** The request/call coordinates an artifact event records around its
 * observation; they are joined separately and are not observation members. */
export const ACTOR_ARTIFACT_ENVELOPE_KEYS = Object.freeze(["cCallRef", "requestDigest", "requestRef"] as const);

/** The durable observation one admitted artifact payload records under its own
 * event profile. A current artifact carries none of the four copies (the
 * writer's projection above); an L artifact carries all four (its original
 * full observation). The envelope is required and removed. Any other mix is no
 * representation. The caller supplies the artifact event's actual profile. */
export function durableActorObservationOfArtifact(
  payload: Readonly<Record<string, JsonValue>>,
  currentProfile: boolean,
): Readonly<Record<string, JsonValue>> | null {
  if (!ACTOR_ARTIFACT_ENVELOPE_KEYS.every((key) => typeof payload[key] === "string")) return null;
  const copies = RETIRED_ACTOR_LIFECYCLE_COPY_KEYS.filter((key) => Object.hasOwn(payload, key)).length;
  if (copies !== (currentProfile ? 0 : RETIRED_ACTOR_LIFECYCLE_COPY_KEYS.length)) return null;
  const { cCallRef: _cCallRef, requestDigest: _requestDigest, requestRef: _requestRef, ...observation } = payload;
  return deepFreeze(observation);
}

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
  readonly nativeResultDisposition?: "admitted" | "rejected" | "absent";
}

export function classifyWorkerTransportFailure(
  observation: WorkerTransportFailureObservation,
): WorkerTransportFailureClass | null {
  if (observation.nativeResultDisposition !== undefined) {
    // Preserve process/safety facts. Only the actual exact raw-contract owner
    // can make a complete artifact available despite a later ordinary exit.
    if (observation.lane === "closed_prompt_proof" && observation.toolCallCount > 0) return "contract_failure";
    if (observation.nativeResultDisposition === "admitted" && observation.terminationConfirmed &&
        !observation.processSpawnFailed && !observation.timedOut) return null;
    if (observation.nativeResultDisposition === "rejected") return "contract_failure";
  }
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

export type WorkerTransportContract = {
  readonly kind: "worker_transport_contract";
  readonly schemaVersion: "5.0.0";
  readonly agentKey: KnownTransportAgentKey;
  readonly command: string;
  readonly prefixArgs: readonly string[];
  readonly argsTemplate: readonly string[];
  readonly parser: "claude_stream_json" | "plain_text";
  readonly promptTransport: "argv" | "stdin";
  readonly sanitizedEnvironmentPrefixes: readonly string[];
};

/** One prepared plan's configured actor/profile identity: the exact effective
 * model selection and its coordinate in the final arguments. The binding keeps
 * agent, command/args and plan/contract/environment digests as its own members.
 * This is configured selection under the trusted desktop, not remote provider
 * attestation; anything the plan does not exactly determine stays unknown. */
export type ConfiguredActorIdentity = Readonly<{
  kind: "configured_actor_identity";
  schemaVersion: "5.0.0";
  disposition: "established";
  model: string;
  source: Readonly<{ kind: "transport_argument"; argumentIndex: number }>;
}> | Readonly<{
  kind: "configured_actor_identity";
  schemaVersion: "5.0.0";
  disposition: "unknown";
  reason: ConfiguredActorIdentityUnknownReason;
}>;
/** One admitted binding's configured selection as its consumers read it: the
 * binding's own agent with its recorded identity. A binding admitted without
 * the identity member has `identity: null`, which no consumer may establish. */
export type ConfiguredActorSelection = Readonly<{
  agentKey: KnownTransportAgentKey;
  identity: ConfiguredActorIdentity | null;
}>;
export const CONFIGURED_ACTOR_IDENTITY_UNKNOWN_REASONS = Object.freeze([
  "model_selection_absent",
  "model_selection_ambiguous",
  "model_environment_conflict",
  "agent_model_selection_unsupported",
] as const);
export type ConfiguredActorIdentityUnknownReason = (typeof CONFIGURED_ACTOR_IDENTITY_UNKNOWN_REASONS)[number];

// Closed per-agent model selection grammar: the selector flags, the options
// that can replace or remap the main model, the environment keys whose
// differing value conflicts with the argument selection, and the arity of the
// options the transport and actor owners themselves compose. An `operands`
// option consumes the next argument as data; a `flags` option consumes none.
const MODEL_SELECTION: Readonly<Partial<Record<KnownTransportAgentKey, Readonly<{
  selectors: readonly string[]; displacing: readonly string[]; environment: readonly string[];
  operands: readonly string[]; flags: readonly string[];
}>>>> = deepFreeze({
  claude: { selectors: ["--model"], displacing: ["--fallback-model", "--agent", "--agents", "--settings"], environment: ["ANTHROPIC_MODEL"],
    operands: ["--output-format", "--permission-mode", "--tools", "--json-schema", "--append-system-prompt"],
    flags: ["-p", "--disable-slash-commands", "--no-session-persistence", "--include-partial-messages", "--verbose", "--safe-mode"] },
  codex: { selectors: ["--model", "-m"], displacing: ["--profile", "-p", "--config", "-c", "--oss"], environment: [],
    operands: ["--sandbox", "-o"], flags: ["--full-auto", "--skip-git-repo-check"] },
});

function unknownActorIdentity(reason: ConfiguredActorIdentityUnknownReason): ConfiguredActorIdentity {
  return deepFreeze({ kind: "configured_actor_identity" as const, schemaVersion: "5.0.0" as const, disposition: "unknown" as const, reason });
}

/** Exactly one selector in the final arguments establishes the model; none,
 * several, an empty value or a displacing option leave it unknown. An argv
 * prompt occupies the final position and is data, never an option. The
 * operand of a declared value-bearing option is data even when it is
 * selector-shaped. A selector-shaped argument directly after an option outside
 * the grammar, or anywhere after `--`, has no known role and leaves the model
 * unknown. */
function modelSelectionFromArguments(agentKey: unknown, promptTransport: unknown, args: readonly string[]): ConfiguredActorIdentity {
  const grammar = typeof agentKey === "string" && Object.hasOwn(MODEL_SELECTION, agentKey)
    ? MODEL_SELECTION[agentKey as KnownTransportAgentKey] : undefined;
  if (grammar === undefined || (promptTransport !== "argv" && promptTransport !== "stdin")) {
    return unknownActorIdentity("agent_model_selection_unsupported");
  }
  const options = promptTransport === "argv" ? args.slice(0, -1) : args;
  const selectorShaped = (arg: string | undefined) => arg !== undefined && grammar.selectors.includes(arg.split("=", 1)[0]!);
  const selections: { model: string; argumentIndex: number }[] = [];
  for (let index = 0; index < options.length; index++) {
    const arg = options[index]!, flag = arg.split("=", 1)[0]!;
    if (arg === "--") {
      if (options.slice(index + 1).some(selectorShaped)) return unknownActorIdentity("model_selection_ambiguous");
      break;
    }
    if (grammar.displacing.includes(flag)) return unknownActorIdentity("model_selection_ambiguous");
    if (grammar.selectors.includes(flag)) {
      if (arg !== flag) selections.push({ model: arg.slice(flag.length + 1), argumentIndex: index });
      else { selections.push({ model: options[index + 1] ?? "", argumentIndex: index + 1 }); index++; }
    } else if (arg === flag && grammar.operands.includes(flag)) index++;
    else if (arg === flag && arg.startsWith("-") && !grammar.flags.includes(flag) && selectorShaped(options[index + 1])) {
      return unknownActorIdentity("model_selection_ambiguous");
    }
  }
  if (selections.length === 0) return unknownActorIdentity("model_selection_absent");
  const selected = selections[0]!;
  if (selections.length !== 1 || selected.model.length === 0 || selected.model.startsWith("-")) {
    return unknownActorIdentity("model_selection_ambiguous");
  }
  return deepFreeze({ kind: "configured_actor_identity" as const, schemaVersion: "5.0.0" as const, disposition: "established" as const,
    model: selected.model, source: { kind: "transport_argument" as const, argumentIndex: selected.argumentIndex } });
}

/** The identity of one exact prepared selection: its final composed arguments
 * and the sanitized environment the process receives. */
export function deriveConfiguredActorIdentity(
  contract: Readonly<Pick<WorkerTransportContract, "agentKey" | "promptTransport">>,
  args: readonly string[],
  environment: Readonly<Record<string, string | undefined>>,
): ConfiguredActorIdentity {
  const selected = modelSelectionFromArguments(contract.agentKey, contract.promptTransport, args);
  if (selected.disposition !== "established") return selected;
  const keys = MODEL_SELECTION[contract.agentKey]?.environment ?? [];
  return keys.some(key => { const value = environment[key]; return value !== undefined && value.length > 0 && value !== selected.model; })
    ? unknownActorIdentity("model_environment_conflict") : selected;
}

export function isConfiguredActorIdentity(value: unknown): value is ConfiguredActorIdentity {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const identity = value as Record<string, unknown>;
  if (identity.kind !== "configured_actor_identity" || identity.schemaVersion !== "5.0.0") return false;
  if (identity.disposition === "unknown") {
    return hasExactKeys(identity, ["kind", "schemaVersion", "disposition", "reason"]) &&
      (CONFIGURED_ACTOR_IDENTITY_UNKNOWN_REASONS as readonly unknown[]).includes(identity.reason);
  }
  const source = identity.source as Record<string, unknown> | null;
  return identity.disposition === "established" && hasExactKeys(identity, ["kind", "schemaVersion", "disposition", "model", "source"]) &&
    typeof identity.model === "string" && identity.model.length > 0 &&
    typeof source === "object" && source !== null && !Array.isArray(source) && hasExactKeys(source, ["kind", "argumentIndex"]) &&
    source.kind === "transport_argument" && Number.isSafeInteger(source.argumentIndex) && (source.argumentIndex as number) >= 0;
}

/** A recorded identity corresponds to its own binding's agent, prompt
 * delivery and final arguments. Only the captured environment is not
 * replayable from the binding, so an argument selection may be recorded as an
 * environment conflict; nothing else differs from the argument derivation. */
export function configuredActorIdentityCorresponds(
  identity: unknown,
  binding: Readonly<{ agentKey?: unknown; promptTransport?: unknown; args?: unknown }>,
): identity is ConfiguredActorIdentity {
  if (!isConfiguredActorIdentity(identity) || !Array.isArray(binding.args) ||
      !binding.args.every((arg): arg is string => typeof arg === "string")) return false;
  const derived = modelSelectionFromArguments(binding.agentKey, binding.promptTransport, binding.args);
  if (identity.disposition === "unknown" && identity.reason === "model_environment_conflict") return derived.disposition === "established";
  return identity.disposition === derived.disposition && (identity.disposition === "unknown"
    ? derived.disposition === "unknown" && identity.reason === derived.reason
    : derived.disposition === "established" && identity.model === derived.model &&
      identity.source.argumentIndex === derived.source.argumentIndex && binding.args[identity.source.argumentIndex] !== undefined);
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
    "--include-partial-messages",
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
          "--include-partial-messages",
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
  readonly responseJsonSchema?: Readonly<Record<string, JsonValue>>;
  /** Owner-selected result text keeps the declared schema out of host dialect validation. */
  readonly responsePresentation?: "result_text";
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly explicitAppendArgs?: readonly string[];
}): readonly string[] {
  const environment = input.environment ?? process.env;
  if (input.responsePresentation !== undefined && input.responsePresentation !== "result_text") {
    throw new TypeError("unsupported worker response presentation");
  }
  const appendArgs = admitTransportAppendArgs({
    agentKey: input.contract.agentKey,
    environment,
    ...(input.explicitAppendArgs === undefined
      ? {}
      : { explicitArgs: input.explicitAppendArgs }),
  });
  const template = [...input.contract.prefixArgs, ...input.contract.argsTemplate];
  let hasOpaqueSchemaArgument = false;
  if (input.contract.agentKey === "claude") {
    if (input.lane === "closed_prompt_proof") {
      template.push("--safe-mode", "--tools", "");
    }
    if (input.responseJsonSchema !== undefined && input.responsePresentation !== "result_text") {
      template.push("--json-schema", JSON.stringify(input.responseJsonSchema));
      hasOpaqueSchemaArgument = true;
    }
  }
  const args = withTransportAppendArgs(template, appendArgs);
  // Appended arguments cannot override this protocol-owned flag. Preserve its
  // literal schema while retaining all existing template/append positions.
  const schemaArgumentIndex = hasOpaqueSchemaArgument ? args.lastIndexOf("--json-schema") + 1 : -1;
  return args.map((arg, index) =>
    index === schemaArgumentIndex ? arg : arg
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

/** The archive path relation of an admitted actor binding: one canonical,
 * in-root, regular, single-link file. Specialized authorization stays with
 * its caller. */
export function isAdmittedActorArchiveFile(archiveRoot: unknown, path: unknown): path is string {
  if (typeof archiveRoot !== "string" || typeof path !== "string") return false;
  try {
    if (resolve(path) !== path || realpathSync(path) !== path || relative(archiveRoot, path).startsWith("..") ||
      isAbsolute(relative(archiveRoot, path))) return false;
    const stat = lstatSync(path);
    return stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1;
  } catch { return false; }
}
/** The one stream-row range relation: the exact archive bytes at a row's range
 * have its length, decode as fatal UTF-8 and hash to its chunk digest. */
export function archiveRangeMatchesStreamRow(bytes: Uint8Array, byteLength: unknown, chunkDigest: unknown): boolean {
  if (!Number.isSafeInteger(byteLength) || Number(byteLength) < 0 || bytes.length !== byteLength) return false;
  try { return sha256Canonical(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) === chunkDigest; }
  catch { return false; }
}
/** The W witness of one stdout archive window (§10.10 E-C): its archive
 * offset and its actor-clock first, last and last qualifying capture times.
 * The row's `byteLength` and `chunkDigest` are its length and digest. */
export type StdoutArchiveWindowWitness = Readonly<{
  kind: "stdout_archive_window";
  archiveOffset: number;
  firstCaptureElapsedMs: number;
  lastCaptureElapsedMs: number;
  lastQualifyingElapsedMs: number | null;
}>;
const STDOUT_WINDOW_WITNESS_KEYS = ["kind", "archiveOffset", "firstCaptureElapsedMs", "lastCaptureElapsedMs", "lastQualifyingElapsedMs"] as const;
export function isStdoutArchiveWindowWitness(value: unknown): value is StdoutArchiveWindowWitness {
  if (typeof value !== "object" || value === null || Array.isArray(value) || !hasExactKeys(value, STDOUT_WINDOW_WITNESS_KEYS)) return false;
  const w = value as Record<string, unknown>;
  const clock = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0;
  return w.kind === "stdout_archive_window" && Number.isSafeInteger(w.archiveOffset) && Number(w.archiveOffset) >= 0 &&
    clock(w.firstCaptureElapsedMs) && clock(w.lastCaptureElapsedMs) && Number(w.firstCaptureElapsedMs) <= Number(w.lastCaptureElapsedMs) &&
    (w.lastQualifyingElapsedMs === null || clock(w.lastQualifyingElapsedMs) &&
      Number(w.firstCaptureElapsedMs) <= Number(w.lastQualifyingElapsedMs) && Number(w.lastQualifyingElapsedMs) <= Number(w.lastCaptureElapsedMs));
}
