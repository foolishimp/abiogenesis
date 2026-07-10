// Implements: REQ-R-ABG3-HANDLERS-003/-004/-005/-008/-009 — the F_D
// standard pipeline handlers. Effects are INJECTED (the engine
// integration supplies real io at the plugin/effect layer); parameters
// come ONLY from declared config (-005). No tool name appears in this
// module (-004): commands, paths, and env are scenario/product
// declarations flowing through handlerConfig.

import type { CCallHandler, CCallHandlerInterior } from "./c_call_handlers.js";

export interface ProcessExecutionIo {
  readonly runProcess: (input: {
    readonly command: string;
    readonly args: readonly string[];
    readonly env: Readonly<Record<string, string>>;
    readonly cwd: string;
    readonly timeoutMs: number;
  }) => {
    readonly status: number | null;
    readonly stdout: string;
    readonly stderr: string;
    readonly error: string | null;
  };
}

export interface ProcessExecutionConfig {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly cwd: string;
  readonly timeoutMs: number;
}

function isPlainRecord(
  value: unknown
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function processExecutionConfigFrom(input: unknown): ProcessExecutionConfig {
  const invalid = new TypeError(
    "process_execution_config_invalid: declared config must carry " +
      "{command, args, env, cwd, timeoutMs}"
  );
  if (!isPlainRecord(input)) {
    throw invalid;
  }
  const command = input["command"];
  const args = input["args"];
  const cwd = input["cwd"];
  const timeoutMs = input["timeoutMs"];
  const env = input["env"];
  if (
    typeof command !== "string" ||
    command.length === 0 ||
    !Array.isArray(args) ||
    !args.every((entry): entry is string => typeof entry === "string") ||
    typeof cwd !== "string" ||
    typeof timeoutMs !== "number" ||
    !isPlainRecord(env) ||
    !Object.values(env).every((value) => typeof value === "string")
  ) {
    throw invalid;
  }
  const envRows: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      envRows[key] = value;
    }
  }
  const argRows: readonly string[] = args;
  return Object.freeze({
    command,
    args: Object.freeze([...argRows]),
    env: Object.freeze(envRows),
    cwd,
    timeoutMs
  });
}

// F_D process execution (-009). STRICT F_D BOUNDARY (HANDLERS-009
// rider, user law): outcomes are MECHANICAL only — "executed" (ran to
// completion, whatever the exit status) or "blocked" (spawn mechanics
// failed). Exit status is EVIDENCE for the F_P evaluate stage; mapping
// exit codes to accept/reject here is behavioral F_D, the recurring
// bug class. Evidence honesty (-003): status and error land verbatim — a spawn error is typed
// truth, never a silent null (campaign bug #11/#12 class).
export function standardProcessExecutionHandler(io: ProcessExecutionIo): CCallHandler {
  return (input): CCallHandlerInterior => {
    const config = processExecutionConfigFrom(input.declaredConfig);
    const outcome = io.runProcess({
      command: config.command,
      args: config.args,
      env: config.env,
      cwd: config.cwd,
      timeoutMs: config.timeoutMs
    });
    const evidenceRefs = Object.freeze([
      `exec-status:${outcome.status === null ? "null" : String(outcome.status)}`,
      ...(outcome.error === null ? [] : [`exec-error:${outcome.error.slice(0, 120)}`])
    ]);
    if (outcome.error !== null || outcome.status === null) {
      return Object.freeze({
        outcomeStatus: "blocked",
        evidenceRefs,
        payloadRef: null,
        responseContractRef: null,
        failureReason: `process_failed: ${outcome.error ?? "status null"} (contract_failure)`
      });
    }
    return Object.freeze({
      outcomeStatus: "executed",
      evidenceRefs,
      payloadRef: null,
      responseContractRef: null,
      failureReason: null
    });
  };
}

export interface MaterializationIo {
  readonly writeFile: (path: string, content: string) => void;
}

export interface MaterializationConfig {
  readonly writeRoot: string;
  readonly files: readonly { readonly path: string; readonly content: string }[];
}

function materializationConfigFrom(input: unknown): MaterializationConfig {
  const invalid = new TypeError(
    "materialization_config_invalid: declared config must carry {writeRoot, files}"
  );
  if (!isPlainRecord(input)) {
    throw invalid;
  }
  const writeRoot = input["writeRoot"];
  const filesRaw = input["files"];
  if (
    typeof writeRoot !== "string" ||
    writeRoot.length === 0 ||
    !Array.isArray(filesRaw)
  ) {
    throw invalid;
  }
  const files = filesRaw.map((row: unknown) => {
    if (!isPlainRecord(row)) {
      throw invalid;
    }
    const path = row["path"];
    const content = row["content"];
    if (typeof path !== "string" || typeof content !== "string") {
      throw invalid;
    }
    return Object.freeze({ path, content });
  });
  return Object.freeze({ writeRoot, files: Object.freeze(files) });
}

// F_D materialization (-009). Confinement (-005): every write resolves
// INSIDE the declared writeRoot — traversal escapes are typed failures,
// not effects (M03 output-allocation write-root law at the handler).
export function standardMaterializationHandler(io: MaterializationIo): CCallHandler {
  return (input): CCallHandlerInterior => {
    const config = materializationConfigFrom(input.declaredConfig);
    const root = config.writeRoot.endsWith("/") ? config.writeRoot : `${config.writeRoot}/`;
    for (const file of config.files) {
      const resolved = `${root}${file.path}`;
      if (file.path.includes("..") || file.path.startsWith("/")) {
        return Object.freeze({
          outcomeStatus: "blocked",
          evidenceRefs: Object.freeze([`write-escape:${file.path.slice(0, 120)}`]),
          payloadRef: null,
          responseContractRef: null,
          failureReason: "write_root_escape (contract_failure)"
        });
      }
      io.writeFile(resolved, file.content);
    }
    return Object.freeze({
      outcomeStatus: "executed",
      evidenceRefs: Object.freeze(
        config.files.map((file) => `materialized:${file.path}`)
      ),
      payloadRef: null,
      responseContractRef: null,
      failureReason: null
    });
  };
}

export const STANDARD_HANDLER_REFS = Object.freeze({
  processExecution: "handler://abg/fd/process-execution",
  materialization: "handler://abg/fd/materialization",
  fhGate: "handler://abg/fh/gate",
  fpTransport: "handler://abg/fp/agent-transport"
} as const);

// F_H gate (-009): the human fibre at an extra stage. The interior is
// ALWAYS "escalated" — a handler cannot approve on a human's behalf;
// it can only surface the declared approval subject. The stage runner
// maps escalated to the escalated judgment and stops the run lawfully
// pending F_H (approval consumption is replay re-entry, like the baked
// fh_admission arm).
export function standardFhGateHandler(): CCallHandler {
  return (input): CCallHandlerInterior => {
    const declared = input.declaredConfig;
    const approvalSubjectRef =
      isPlainRecord(declared) &&
      typeof declared["approvalSubjectRef"] === "string"
        ? declared["approvalSubjectRef"]
        : "undeclared";
    return Object.freeze({
      outcomeStatus: "escalated",
      evidenceRefs: Object.freeze([
        `approval-subject:${approvalSubjectRef}`
      ]),
      payloadRef: null,
      responseContractRef: null,
      failureReason: null
    });
  };
}

// ── F_P agent transport (-009): the probabilistic fibre at an extra
// stage. Prompt and contract come ONLY from declared config (-005);
// the agent invocation is INJECTED io (-004: no tool name here — which
// agent, which env, which command is binding-layer declaration).
//
// F_P/F_D boundary note: this handler maps the WORKER's declared-
// contract disposition mechanically. A "block" disposition is the
// WORKER's semantic judgment — lawful, because judging semantically is
// what the F_P fibre IS. The handler itself pronounces nothing; its
// own vocabulary stays mechanical (transport failed / contract
// unparseable -> blocked with the trio class).

export interface FpTransportIo {
  readonly invokeAgent: (input: {
    readonly prompt: string;
    readonly timeoutMs: number;
  }) => {
    readonly output: string | null;
    readonly sessionRef: string | null;
    readonly error: string | null;
  };
}

export interface FpTransportConfig {
  readonly prompt: string;
  readonly timeoutMs: number;
  readonly responseContract:
    | { readonly kind: "advisory_text" }
    | { readonly kind: "disposition_json" };
  readonly includeWorkProjection: boolean;
}

function fpTransportConfigFrom(input: unknown): FpTransportConfig {
  const invalid = new TypeError(
    "fp_transport_config_invalid: declared config must carry " +
      "{prompt, timeoutMs, responseContract{kind}, includeWorkProjection}"
  );
  if (!isPlainRecord(input)) {
    throw invalid;
  }
  const prompt = input["prompt"];
  const timeoutMs = input["timeoutMs"];
  const responseContract = input["responseContract"];
  const includeWorkProjection = input["includeWorkProjection"];
  if (
    typeof prompt !== "string" ||
    prompt.length === 0 ||
    typeof timeoutMs !== "number" ||
    !isPlainRecord(responseContract) ||
    typeof includeWorkProjection !== "boolean"
  ) {
    throw invalid;
  }
  const contractKind = responseContract["kind"];
  if (contractKind !== "advisory_text" && contractKind !== "disposition_json") {
    throw invalid;
  }
  return Object.freeze({
    prompt,
    timeoutMs,
    responseContract: Object.freeze({ kind: contractKind }),
    includeWorkProjection
  });
}

export function standardFpTransportHandler(io: FpTransportIo): CCallHandler {
  return (input): CCallHandlerInterior => {
    const config = fpTransportConfigFrom(input.declaredConfig);
    const prompt =
      config.includeWorkProjection && input.workProjection !== null
        ? `${config.prompt}\n\nWORK PROJECTION:\n${String(input.workProjection)}`
        : config.prompt;
    const outcome = io.invokeAgent({ prompt, timeoutMs: config.timeoutMs });
    const sessionEvidence =
      outcome.sessionRef === null ? [] : [`agent-session:${outcome.sessionRef}`];
    if (outcome.error !== null || outcome.output === null) {
      return Object.freeze({
        outcomeStatus: "blocked",
        evidenceRefs: Object.freeze([
          ...sessionEvidence,
          `transport-error:${(outcome.error ?? "no_output").slice(0, 120)}`
        ]),
        payloadRef: null,
        responseContractRef: null,
        failureReason: `agent_transport_failed: ${outcome.error ?? "no output"} (transport_failure)`
      });
    }
    if (config.responseContract.kind === "advisory_text") {
      return Object.freeze({
        outcomeStatus: "executed",
        evidenceRefs: Object.freeze([
          ...sessionEvidence,
          `agent-output-chars:${String(outcome.output.length)}`
        ]),
        payloadRef: null,
        responseContractRef: "response-contract://abg/fp/advisory-text",
        failureReason: null
      });
    }
    // disposition_json: the worker judges via the declared contract
    let parsedRaw: unknown;
    try {
      parsedRaw = JSON.parse(outcome.output);
    } catch {
      return Object.freeze({
        outcomeStatus: "blocked",
        evidenceRefs: Object.freeze([...sessionEvidence, "agent-output-unparseable"]),
        payloadRef: null,
        responseContractRef: "response-contract://abg/fp/disposition-json",
        failureReason: "agent_response_unparseable (contract_failure)"
      });
    }
    const parsedRecord = isPlainRecord(parsedRaw) ? parsedRaw : null;
    const disposition = parsedRecord?.["disposition"];
    const reasonsRaw = parsedRecord?.["reasons"];
    const reasons = Array.isArray(reasonsRaw)
      ? reasonsRaw
          .filter((entry): entry is string => typeof entry === "string")
          .join("; ")
          .slice(0, 160)
      : "";
    if (disposition === "pass") {
      return Object.freeze({
        outcomeStatus: "executed",
        evidenceRefs: Object.freeze([...sessionEvidence, "worker-disposition:pass"]),
        payloadRef: null,
        responseContractRef: "response-contract://abg/fp/disposition-json",
        failureReason: null
      });
    }
    if (disposition === "block") {
      return Object.freeze({
        outcomeStatus: "blocked",
        evidenceRefs: Object.freeze([...sessionEvidence, "worker-disposition:block"]),
        payloadRef: null,
        responseContractRef: "response-contract://abg/fp/disposition-json",
        failureReason: `worker_blocked: ${reasons.length > 0 ? reasons : "no reasons given"}`
      });
    }
    return Object.freeze({
      outcomeStatus: "blocked",
      evidenceRefs: Object.freeze([...sessionEvidence, "agent-disposition-unlawful"]),
      payloadRef: null,
      responseContractRef: "response-contract://abg/fp/disposition-json",
      failureReason: `unlawful_disposition: ${String(disposition).slice(0, 40)} (contract_failure)`
    });
  };
}
