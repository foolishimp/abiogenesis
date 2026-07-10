// The RUNTIME assembly of the standard handler set: real io bound to
// the substrate-shipped implementations. Process execution routes
// through the ONE lawful exec surface (shared/traced_process — the
// T-109 guard forbids direct child_process ownership here), which also
// earns O7: every execution archives under the declared archiveRoot.
// Tool knowledge still arrives only through declared config (-004).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { runTracedProcess } from "../../../shared/traced_process/index.js";
import type { CCallHandler, CCallHandlerInterior } from "./c_call_handlers.js";
import {
  admitTimeoutBudgetMs,
  standardFpTransportHandler,
  standardMaterializationHandler,
  standardFhGateHandler,
  STANDARD_HANDLER_REFS
} from "./standard_handlers.js";
import type { FpTransportIo } from "./standard_handlers.js";

interface TracedProcessExecutionConfig {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly archiveRoot: string;
}

function tracedProcessExecutionConfigFrom(input: unknown): TracedProcessExecutionConfig {
  const invalid = new TypeError(
    "process_execution_config_invalid: declared config must carry " +
      "{command, args, env, cwd, timeoutMs, archiveRoot}"
  );
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw invalid;
  }
  const record: Readonly<Record<string, unknown>> = { ...input };
  const command = record["command"];
  const args = record["args"];
  const cwd = record["cwd"];
  const timeoutMs = admitTimeoutBudgetMs(
    record["timeoutMs"],
    "traced_process_execution_config"
  );
  const archiveRoot = record["archiveRoot"];
  const env = record["env"];
  if (
    typeof command !== "string" ||
    command.length === 0 ||
    !Array.isArray(args) ||
    !args.every((entry): entry is string => typeof entry === "string") ||
    typeof cwd !== "string" ||
    typeof archiveRoot !== "string" ||
    archiveRoot.length === 0 ||
    typeof env !== "object" ||
    env === null ||
    Array.isArray(env)
  ) {
    throw invalid;
  }
  const envRecord: Readonly<Record<string, unknown>> = { ...env };
  const envRows: Record<string, string> = {};
  for (const [key, value] of Object.entries(envRecord)) {
    if (typeof value !== "string") {
      throw invalid;
    }
    envRows[key] = value;
  }
  const argRows: readonly string[] = args;
  return Object.freeze({
    command,
    args: Object.freeze([...argRows]),
    env: Object.freeze(envRows),
    cwd,
    timeoutMs,
    archiveRoot
  });
}

// STRICT F_D (HANDLERS-009 rider): outcomes are mechanical only —
// executed / blocked; exit status and archives are EVIDENCE for F_P.
function tracedProcessExecutionHandler(): CCallHandler {
  return async (input): Promise<CCallHandlerInterior> => {
    const config = tracedProcessExecutionConfigFrom(input.declaredConfig);
    const outcome = await runTracedProcess({
      command: config.command,
      args: config.args,
      cwd: config.cwd,
      env: config.env,
      archiveRoot: config.archiveRoot,
      label: `c-call-stage-${input.stage.stageRole}`,
      timeoutMs: config.timeoutMs
    });
    const evidenceRefs = Object.freeze([
      `exec-status:${outcome.status === null ? "null" : String(outcome.status)}`,
      `exec-archive:${config.archiveRoot}`,
      ...(outcome.error === null || outcome.error === undefined
        ? []
        : [`exec-error:${String(outcome.error).slice(0, 120)}`])
    ]);
    if ((outcome.error !== null && outcome.error !== undefined) || outcome.status === null) {
      return Object.freeze({
        outcomeStatus: "blocked",
        evidenceRefs,
        payloadRef: null,
        responseContractRef: null,
        failureReason: `process_failed: ${String(outcome.error ?? "status null")} (contract_failure)`
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

// The standard set is FOUR handlers (HANDLERS-009: F_P agent transport,
// F_D process execution, F_D materialization, F_H gate). Three bind
// ambient substrate io here; the F_P transport CANNOT default — agent
// invocation is an operator-supplied capability (which CLI, which
// account, which sandbox). The injection seam is therefore EXPLICIT in
// the API (dual-review P2 finding, 2026-07-10): pass io.fpTransport to
// receive the complete standard set; omit it and the returned map
// carries three handlers and the fpTransport ref stays unbound —
// registry admission then fails closed on any binding that names it.
export function buildStandardHandlerImplementations(io?: {
  readonly fpTransport?: FpTransportIo;
}): ReadonlyMap<string, CCallHandler> {
  const handlers = new Map<string, CCallHandler>([
    [STANDARD_HANDLER_REFS.processExecution, tracedProcessExecutionHandler()],
    [
      STANDARD_HANDLER_REFS.materialization,
      standardMaterializationHandler({
        writeFile(path, content) {
          mkdirSync(dirname(path), { recursive: true });
          writeFileSync(path, content, "utf8");
        }
      })
    ],
    [STANDARD_HANDLER_REFS.fhGate, standardFhGateHandler()]
  ]);
  if (io?.fpTransport !== undefined) {
    handlers.set(
      STANDARD_HANDLER_REFS.fpTransport,
      standardFpTransportHandler(io.fpTransport)
    );
  }
  return handlers;
}
