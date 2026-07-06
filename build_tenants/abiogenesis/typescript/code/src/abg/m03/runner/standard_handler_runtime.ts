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
  standardMaterializationHandler,
  standardFhGateHandler,
  STANDARD_HANDLER_REFS
} from "./standard_handlers.js";

interface TracedProcessExecutionConfig {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly archiveRoot: string;
}

function tracedProcessExecutionConfigFrom(input: unknown): TracedProcessExecutionConfig {
  const record = input as Partial<TracedProcessExecutionConfig> | null;
  if (
    record === null ||
    typeof record !== "object" ||
    typeof record.command !== "string" ||
    record.command.length === 0 ||
    !Array.isArray(record.args) ||
    typeof record.cwd !== "string" ||
    typeof record.timeoutMs !== "number" ||
    typeof record.archiveRoot !== "string" ||
    record.archiveRoot.length === 0 ||
    record.env === null ||
    typeof record.env !== "object"
  ) {
    throw new TypeError(
      "process_execution_config_invalid: declared config must carry " +
        "{command, args, env, cwd, timeoutMs, archiveRoot}"
    );
  }
  return record as TracedProcessExecutionConfig;
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

export function buildStandardHandlerImplementations(): ReadonlyMap<string, CCallHandler> {
  return new Map<string, CCallHandler>([
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
}
