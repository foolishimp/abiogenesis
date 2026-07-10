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
  FpDispatchPlugin,
  FpEvaluationOutcome,
  FpEvaluatorPlugin
} from "../contracts/plugins.js";
import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome
} from "../contracts/plugins.js";
import { createHash } from "node:crypto";
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

// codex round F7: the capability is SNAPSHOTTED at plugin construction —
// later mutation of the caller's object cannot change execution — and
// every path component is admitted (no separators, no traversal).
const LABEL_COMPONENT_PATTERN = /^[A-Za-z0-9_-]{1,64}$/u;

function admitLabelComponent(value: string, at: string): string {
  if (!LABEL_COMPONENT_PATTERN.test(value)) {
    throw new TypeError(
      `${at} must match ${String(LABEL_COMPONENT_PATTERN)} (path-safe label component), got ${JSON.stringify(value)}`
    );
  }
  return value;
}

function snapshotCapability(io: LiveFpDispatchCapability): LiveFpDispatchCapability {
  return Object.freeze({
    agentContract: Object.freeze({
      agentKey: io.agentContract.agentKey,
      command: io.agentContract.command,
      argsTemplate: Object.freeze([...io.agentContract.argsTemplate]),
      sanitizedEnvironmentPolicy: Object.freeze({
        prefixes: Object.freeze([...io.agentContract.sanitizedEnvironmentPolicy.prefixes])
      })
    }),
    archiveRoot: io.archiveRoot,
    cwd: io.cwd,
    timeoutMs: io.timeoutMs,
    ...(io.executorProfile === undefined ? {} : { executorProfile: io.executorProfile }),
    ...(io.terminalSessionKeyPrefix === undefined
      ? {}
      : {
          terminalSessionKeyPrefix: admitLabelComponent(
            io.terminalSessionKeyPrefix,
            "capability.terminalSessionKeyPrefix"
          )
        }),
    ...(io.labelPrefix === undefined
      ? {}
      : { labelPrefix: admitLabelComponent(io.labelPrefix, "capability.labelPrefix") })
  });
}

// codex round F2: archive and ref identities key on the INVOCATION, not
// the vector alone — attempts and concurrent invocations never collide.
// actorInvocationId + attemptIndex ride EnginePluginInput; a short
// content hash of the invocation id disambiguates across runs.
function invocationLabel(
  prefix: string,
  kind: "dispatch" | "eval",
  input: EnginePluginInput
): string {
  const invocation = input.actorInvocationRef ?? null;
  const attempt = invocation === null ? 0 : invocation.attemptIndex;
  const idSource = invocation === null ? input.basisId : invocation.actorInvocationId;
  const idHash = createHash("sha256").update(idSource).digest("hex").slice(0, 12);
  return `${prefix}-${kind}-v${String(input.vectorIndex)}-a${String(attempt)}-${idHash}`;
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
  input_io: LiveFpDispatchCapability
): FpDispatchPlugin {
  const io = snapshotCapability(input_io);
  const timeoutMs = admitTimeoutBudgetMs(io.timeoutMs, "live_fp_dispatch_capability");
  return Object.freeze({
    contract: liveFpDispatchContract,
    dispatch: async (input: EnginePluginInput): Promise<FpDispatchOutcome> => {
      // codex round F1: NOTHING before this await — a sync driver that
      // mishandles the promise must find zero side effects performed.
      await Promise.resolve();
      if (input.instructionPromptManifest === null) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason:
            "live fp dispatch requires the ABG instruction prompt manifest (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const label = invocationLabel(io.labelPrefix ?? "live-fp", "dispatch", input);
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
          // codex round F6: the failed session reconciles to its C-call —
          // archive identities ride the outcome's evidence refs.
          evidenceRefs: [
            input.sourceProjectionRef,
            `agent-output:${transport.outputPath}`,
            ...(transport.traceResultPath === null
              ? []
              : [`agent-trace:${transport.traceResultPath}`])
          ]
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
          evidenceRefs: [
            input.sourceProjectionRef,
            `agent-output:${transport.outputPath}`,
            ...(transport.traceResultPath === null
              ? []
              : [`agent-trace:${transport.traceResultPath}`])
          ]
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
  readonly liveFpEvaluator?: LiveFpDispatchCapability | undefined;
}

export function standardPluginCatalogWithCapabilities(
  capabilities: EnginePluginCapabilities | undefined
): Readonly<Record<string, StandardCatalogRow>> {
  if (
    capabilities?.liveFpDispatch === undefined &&
    capabilities?.liveFpEvaluator === undefined
  ) {
    return STANDARD_ENGINE_PLUGIN_CATALOG;
  }
  return Object.freeze({
    ...STANDARD_ENGINE_PLUGIN_CATALOG,
    ...(capabilities.liveFpDispatch === undefined
      ? {}
      : {
          [LIVE_FP_DISPATCH_PLUGIN_REF]: Object.freeze({
            seam: "fpDispatch" as const,
            plugin: standardLiveFpDispatchPlugin(capabilities.liveFpDispatch)
          })
        }),
    ...(capabilities.liveFpEvaluator === undefined
      ? {}
      : {
          [LIVE_FP_EVALUATOR_PLUGIN_REF]: Object.freeze({
            seam: "fpEvaluator" as const,
            plugin: standardLiveFpEvaluatorPlugin(capabilities.liveFpEvaluator)
          })
        })
  });
}

export const LIVE_FP_EVALUATOR_PLUGIN_REF = "plugin://abg/fp-evaluator-live";

// codex round F1: live plugins perform external transport work — the
// SYNC driver must refuse their selection typed BEFORE any invocation,
// mirroring the handler family's async-refusal law.
export const ASYNC_ONLY_PLUGIN_REFS: readonly string[] = Object.freeze([
  LIVE_FP_DISPATCH_PLUGIN_REF,
  LIVE_FP_EVALUATOR_PLUGIN_REF
]);

const liveFpEvaluatorContract = constructEnginePluginContract({
  ref: LIVE_FP_EVALUATOR_PLUGIN_REF,
  pluginKind: "fp_evaluator",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpEvaluationOutcome"
});

// The STANDARD REVIEW CONTRACT the live evaluator worker returns:
//   { accepted: boolean, closeDisposition?: "close"|"retry",
//     assessmentIds?: string[], reasons?: string[] }
// Acceptance corroboration is MECHANICAL: when the manifest declared
// expected assessment ids, the review must attest every one — a worker
// cannot accept by omission (the T-032 lesson at the evaluator seam).
interface StandardLiveReview {
  readonly accepted: boolean;
  readonly closeDisposition: "close" | "retry";
  readonly assessmentIds: readonly string[];
  readonly reasons: readonly string[];
}

function admitStandardLiveReview(
  artifact: Readonly<Record<string, unknown>>
): StandardLiveReview {
  const accepted = artifact["accepted"];
  if (typeof accepted !== "boolean") {
    throw new TypeError("review.accepted must be a boolean");
  }
  const dispositionRaw = artifact["closeDisposition"];
  const closeDisposition =
    dispositionRaw === undefined
      ? accepted
        ? "close"
        : "retry"
      : dispositionRaw === "close" || dispositionRaw === "retry"
        ? dispositionRaw
        : null;
  if (closeDisposition === null) {
    throw new TypeError(
      `review.closeDisposition must be "close" or "retry", got ${JSON.stringify(dispositionRaw)}`
    );
  }
  const idsRaw = artifact["assessmentIds"];
  const assessmentIds =
    idsRaw === undefined
      ? Object.freeze([])
      : Array.isArray(idsRaw) &&
          idsRaw.every((row): row is string => typeof row === "string")
        ? Object.freeze([...idsRaw])
        : null;
  if (assessmentIds === null) {
    throw new TypeError("review.assessmentIds must be an array of strings when present");
  }
  const reasonsRaw = artifact["reasons"];
  const reasons =
    reasonsRaw === undefined
      ? Object.freeze([])
      : Array.isArray(reasonsRaw) &&
          reasonsRaw.every((row): row is string => typeof row === "string")
        ? Object.freeze([...reasonsRaw])
        : null;
  if (reasons === null) {
    throw new TypeError("review.reasons must be an array of strings when present");
  }
  return Object.freeze({ accepted, closeDisposition, assessmentIds, reasons });
}

function sha256Hex(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function standardLiveFpEvaluatorPlugin(
  input_io: LiveFpDispatchCapability
): FpEvaluatorPlugin {
  const io = snapshotCapability(input_io);
  const timeoutMs = admitTimeoutBudgetMs(io.timeoutMs, "live_fp_evaluator_capability");
  return Object.freeze({
    contract: liveFpEvaluatorContract,
    evaluate: async (input: EnginePluginInput): Promise<FpEvaluationOutcome> => {
      // codex round F1: NOTHING before this await.
      await Promise.resolve();
      if (input.instructionPromptManifest === null) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason:
            "live fp evaluation requires the ABG instruction prompt manifest (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const label = invocationLabel(io.labelPrefix ?? "live-fp", "eval", input);
      mkdirSync(io.archiveRoot, { recursive: true });
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
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason: [
            "live fp evaluation transport failed",
            `status=${String(transport.status)}`,
            `failureClass=${transport.failureClass ?? "transport_failure"}`,
            `toolCallCount=${String(transport.toolCallCount)}`
          ].join(" "),
          // codex round F6: failed sessions reconcile to their C-call.
          evidenceRefs: [
            input.sourceProjectionRef,
            `agent-output:${transport.outputPath}`,
            ...(transport.traceResultPath === null
              ? []
              : [`agent-trace:${transport.traceResultPath}`])
          ]
        });
      }
      let review: StandardLiveReview;
      try {
        review = admitStandardLiveReview(extractJsonObjectText(transport.text));
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).slice(0, 160);
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason: `live fp evaluation review unparsable: ${message} (contract_failure)`,
          evidenceRefs: [
            input.sourceProjectionRef,
            `agent-output:${transport.outputPath}`,
            ...(transport.traceResultPath === null
              ? []
              : [`agent-trace:${transport.traceResultPath}`])
          ]
        });
      }
      // mechanical corroboration: expected assessment ids must be attested
      const missing = input.expectedAssessmentIds.filter(
        (id) => !review.assessmentIds.includes(id)
      );
      // codex round F4: ONE close-eligibility decision derives EVERY
      // closure-bearing field. A review that accepts but still asks to
      // retry is NOT close-eligible — fulfilled/close_candidate truth
      // never coexists with a retained retry.
      const closeEligible =
        review.accepted &&
        missing.length === 0 &&
        review.closeDisposition === "close";
      const accepted = closeEligible;
      const closeDisposition = closeEligible ? "close" : "retry";
      const reviewDigest = sha256Hex(JSON.stringify(review));
      const evidenceRefs = Object.freeze([
        input.sourceProjectionRef,
        `agent-output:${transport.outputPath}`
      ]);
      return constructFpEvaluationOutcome({
        status: "evaluated",
        ambiguityStatus: accepted ? "fulfilled" : "partial",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://abg/live-fp-evaluator/${label}/${reviewDigest}`,
            evaluatorRef: LIVE_FP_EVALUATOR_PLUGIN_REF,
            gainReportRef: `gain://abg/live-fp-evaluator/${label}`,
            metricRefs: [
              `metric://abg/live-fp-evaluator/${label}/accepted-${accepted ? "true" : "false"}`
            ],
            closeDisposition,
            residualPressureRefs: accepted
              ? []
              : [
                  `residual://abg/live-fp-evaluator/${label}`,
                  ...missing.map((id) => `residual://abg/live-fp-evaluator/${label}/unattested/${id}`)
                ],
            continuationRefs: accepted ? [] : [`continuation://abg/live-fp-evaluator/${label}/retry`],
            evidenceRefs,
            authorityRefs: [
              `authority://abg/live-fp-evaluator/${label}`,
              ...input.expectedAssessmentIds
            ],
            compositionContributionRef:
              input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
            compositionRef: input.selectedCompositionRef,
            compositionDigest: input.selectedCompositionDigest,
            diagnosticRefs: review.reasons.map(
              (reason, index) => `diagnostic://abg/live-fp-evaluator/${label}/${String(index)}:${reason.slice(0, 80)}`
            ),
            executiveDisposition: accepted ? "close_candidate" : "local_repair"
          })
        ],
        evidenceRefs
      });
    }
  });
}
