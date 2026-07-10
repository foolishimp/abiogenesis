// Implements: the S2.3/T-209 STANDARD LIVE F_P DISPATCH — the substrate-owned
// composition the declarations-only adoption selects by ref, retiring
// product-local dispatch bodies (T-217 closure campaign, F_H-approved
// 2026-07-10). SYSTEMS mechanics only:
// - the rendered instruction manifest IS the prompt (T-183 renders it; the
//   runner's post-transport admission judges the response against declared
//   output contracts — this plugin never invents a rival prompt shell);
// - agent identity, executor profile, and time budget are an OPERATOR
//   CAPABILITY injected at composition — never declared by the product,
//   never read from ambient env here;
// - transport failure and unparsable worker output are TYPED blocked
//   outcomes carrying the retry-allowlist grammar (transport_failure /
//   contract_failure) — a live worker fault can never kill a run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { AgentTransportContract } from "../../../shared/abg_library/index.js";
import type { TracedProcessExecutorProfile } from "../../../shared/traced_process/index.js";
import { runAgentTransport } from "../../../shared/abg_library/index.js";
import type {
  EnginePluginInput,
  FpDispatchOutcome,
  FpDispatchPlugin
} from "../contracts/plugins.js";
import {
  constructEnginePluginContract,
  constructFpDispatchOutcome
} from "../contracts/plugins.js";
import { admitTimeoutBudgetMs } from "./standard_handlers.js";
import type { StandardCatalogRow } from "../contracts/plugin_selection.js";
import { STANDARD_ENGINE_PLUGIN_CATALOG } from "../contracts/plugin_selection.js";

export const LIVE_FP_DISPATCH_PLUGIN_REF = "plugin://abg/fp-dispatch-live";

// The operator-supplied capability: which agent, under which budget and
// executor profile, archiving where. Mirrors the F_P-transport injection
// seam on the handler family — a capability, never a declaration.
export interface LiveFpDispatchCapability {
  readonly agentContract: AgentTransportContract;
  readonly archiveRoot: string;
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly executorProfile?: TracedProcessExecutorProfile | undefined;
  readonly terminalSessionKeyPrefix?: string | undefined;
  readonly labelPrefix?: string | undefined;
}

const liveFpDispatchContract = constructEnginePluginContract({
  ref: LIVE_FP_DISPATCH_PLUGIN_REF,
  pluginKind: "fp_dispatch",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpDispatchOutcome"
});

// Worker output law (T-030 builder bug #5): output is a JSON object; byte
// corruption or prose wrapping is a CONTRACT FAILURE for the retry
// allowlist — blocked truth, never a crash. The extraction is the
// first-"{"-to-last-"}" slice, matching the campaign-proven grammar.
function extractJsonObjectText(text: string): Readonly<Record<string, unknown>> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new TypeError("worker output carries no JSON object");
  }
  const parsed: unknown = JSON.parse(text.slice(start, end + 1));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new TypeError("worker output JSON is not an object");
  }
  const record: Readonly<Record<string, unknown>> = { ...parsed };
  return record;
}

export function standardLiveFpDispatchPlugin(
  io: LiveFpDispatchCapability
): FpDispatchPlugin {
  const timeoutMs = admitTimeoutBudgetMs(io.timeoutMs, "live_fp_dispatch_capability");
  return Object.freeze({
    contract: liveFpDispatchContract,
    dispatch: async (input: EnginePluginInput): Promise<FpDispatchOutcome> => {
      if (input.instructionPromptManifest === null) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason:
            "live fp dispatch requires the ABG instruction prompt manifest (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const label = `${io.labelPrefix ?? "live-fp"}-v${String(input.vectorIndex)}`;
      mkdirSync(io.archiveRoot, { recursive: true });
      // the manifest the worker saw is replay-adjacent evidence
      writeFileSync(
        join(io.archiveRoot, `${label}-instruction-manifest.json`),
        `${JSON.stringify(input.instructionPromptManifest, null, 2)}\n`,
        "utf8"
      );
      const transport = await runAgentTransport({
        contract: io.agentContract,
        prompt: input.instructionPromptManifest.renderedPrompt,
        cwd: io.cwd,
        archiveRoot: io.archiveRoot,
        label,
        timeoutMs,
        ...(io.executorProfile === undefined
          ? {}
          : { executorProfile: io.executorProfile }),
        ...(io.terminalSessionKeyPrefix === undefined
          ? {}
          : { terminalSessionKey: `${io.terminalSessionKeyPrefix}-${label}` }),
        outputPath: join(io.archiveRoot, `${label}-output.txt`),
        promptPath: join(io.archiveRoot, `${label}-prompt.txt`),
        stdoutPath: join(io.archiveRoot, `${label}-stdout.log`),
        stderrPath: join(io.archiveRoot, `${label}-stderr.log`)
      });
      if (transport.status !== 0 || transport.failureClass !== null) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: [
            "live fp dispatch transport failed",
            `status=${String(transport.status)}`,
            `failureClass=${transport.failureClass ?? "transport_failure"}`,
            `toolCallCount=${String(transport.toolCallCount)}`
          ].join(" "),
          attachedResultArtifact: {
            kind: "live_fp_transport_failure",
            failureClass: transport.failureClass ?? "transport_failure",
            status: transport.status,
            toolCallCount: transport.toolCallCount,
            outputPath: transport.outputPath,
            label
          },
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      let artifact: Readonly<Record<string, unknown>>;
      try {
        artifact = extractJsonObjectText(transport.text);
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).slice(0, 160);
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: `live fp dispatch worker output unparsable: ${message} (contract_failure)`,
          attachedResultArtifact: {
            kind: "live_fp_output_unparsable",
            textExcerpt: transport.text.slice(0, 400),
            outputPath: transport.outputPath,
            label
          },
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result:live_fp_dispatch:${label}`,
        attachedResultArtifact: artifact,
        evidenceRefs: [input.sourceProjectionRef, `agent-output:${transport.outputPath}`]
      });
    }
  });
}

// The operator's capability set for live plugin selection. Injected at the
// engine request (the CLI composes it from its declared verb steering);
// absent capabilities leave the live refs OUT of the catalog, so selecting
// one fails closed with the standard unresolvable-ref rejection.
export interface EnginePluginCapabilities {
  readonly liveFpDispatch?: LiveFpDispatchCapability | undefined;
}

export function standardPluginCatalogWithCapabilities(
  capabilities: EnginePluginCapabilities | undefined
): Readonly<Record<string, StandardCatalogRow>> {
  if (capabilities?.liveFpDispatch === undefined) {
    return STANDARD_ENGINE_PLUGIN_CATALOG;
  }
  return Object.freeze({
    ...STANDARD_ENGINE_PLUGIN_CATALOG,
    [LIVE_FP_DISPATCH_PLUGIN_REF]: Object.freeze({
      seam: "fpDispatch" as const,
      plugin: standardLiveFpDispatchPlugin(capabilities.liveFpDispatch)
    })
  });
}
