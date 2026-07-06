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

function processExecutionConfigFrom(input: unknown): ProcessExecutionConfig {
  const record = input as Partial<ProcessExecutionConfig> | null;
  if (
    record === null ||
    typeof record !== "object" ||
    typeof record.command !== "string" ||
    record.command.length === 0 ||
    !Array.isArray(record.args) ||
    typeof record.cwd !== "string" ||
    typeof record.timeoutMs !== "number" ||
    record.env === null ||
    typeof record.env !== "object"
  ) {
    throw new TypeError(
      "process_execution_config_invalid: declared config must carry " +
        "{command, args, env, cwd, timeoutMs}"
    );
  }
  return record as ProcessExecutionConfig;
}

// F_D process execution (-009). Evidence honesty (-003): the interior
// carries the exit status and error verbatim — a spawn error is typed
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
      outcomeStatus: outcome.status === 0 ? "accepted" : "rejected",
      evidenceRefs,
      payloadRef: null,
      responseContractRef: null,
      failureReason: outcome.status === 0 ? null : `exit_status:${outcome.status}`
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
  const record = input as Partial<MaterializationConfig> | null;
  if (
    record === null ||
    typeof record !== "object" ||
    typeof record.writeRoot !== "string" ||
    record.writeRoot.length === 0 ||
    !Array.isArray(record.files)
  ) {
    throw new TypeError(
      "materialization_config_invalid: declared config must carry {writeRoot, files}"
    );
  }
  return record as MaterializationConfig;
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
      outcomeStatus: "accepted",
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
  materialization: "handler://abg/fd/materialization"
} as const);
