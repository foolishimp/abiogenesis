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
  admitFpDispatchOutcome,
  admitFpEvaluationOutcome,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome
} from "../contracts/plugins.js";
import { requireFpResultContractEnvelope } from "../contracts/fp_result_contract_admission.js";
import { createHash } from "node:crypto";
import { admitIJsonText } from "../../../shared/runtime_identity.js";
import { isPlainObject } from "../../../shared/validation/primitives.js";
import { admitTimeoutBudgetMs } from "./standard_handlers.js";
import type { StandardCatalogRow } from "../contracts/plugin_selection.js";
import { STANDARD_ENGINE_PLUGIN_CATALOG } from "../contracts/plugin_selection.js";
import {
  LivePluginArchiveError,
  openLivePluginArchive,
  type FreshLivePluginArchive,
  type LivePluginArchiveOpenResult
} from "./live_plugin_archive.js";
import { hasEngineCCallResumeAuthority } from "./c_call_resume_authority.js";

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

function archiveErrorText(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 240);
}

function archiveErrorEvidence(
  error: unknown,
  sourceProjectionRef: string
): readonly string[] {
  if (!(error instanceof LivePluginArchiveError)) {
    return Object.freeze([sourceProjectionRef]);
  }
  return Object.freeze([
    sourceProjectionRef,
    `live-plugin-archive-refusal:${error.code}`,
    ...error.evidencePaths.map((path) =>
      path.endsWith("/launch.json")
        ? `agent-launch:${path}`
        : path.endsWith("/trace/result.json")
          ? `agent-trace:${path}`
          : `agent-output:${path}`
    )
  ]);
}

function archiveCapability(io: LiveFpDispatchCapability): Readonly<Record<string, unknown>> {
  return Object.freeze({
    agentContract: io.agentContract,
    cwd: io.cwd,
    timeoutMs: io.timeoutMs,
    executorProfile: io.executorProfile ?? null,
    terminalSessionKeyPrefix: io.terminalSessionKeyPrefix ?? null,
    labelPrefix: io.labelPrefix ?? null
  });
}

function archiveEffectInput(
  input: EnginePluginInput,
  pluginRef: string
): Readonly<Record<string, unknown>> {
  // Only truth that can change the external effect or its admission belongs
  // in the idempotency digest. Replay/projection collections grow during a
  // resume and must not turn the same C-call into a conflicting request.
  return Object.freeze({
    cCallRef: input.cCallRef,
    pluginRef,
    pluginKind: input.contract?.pluginKind,
    selectedCompositionRef: input.selectedCompositionRef,
    selectedCompositionDigest: input.selectedCompositionDigest,
    selectedRegimeBindingRef: input.selectedRegimeBindingRef,
    basisId: input.basisId,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    graphFunctionId: input.graphFunctionId,
    jobId: input.jobId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    regime: input.regime,
    expectedAssessmentIds: input.expectedAssessmentIds
  });
}

function evidenceFor(
  archive: FreshLivePluginArchive,
  sourceProjectionRef: string
): readonly string[] {
  const existing = (path: string): string | null => {
    try {
      return archive.existingRegularPath(path);
    } catch {
      return null;
    }
  };
  const launchPath = existing("launch.json");
  const outputPath = existing("output.txt");
  const traceResultPath = existing("trace/result.json");
  return Object.freeze([
    sourceProjectionRef,
    ...(launchPath === null ? [] : [`agent-launch:${launchPath}`]),
    ...(outputPath === null ? [] : [`agent-output:${outputPath}`]),
    ...(traceResultPath === null ? [] : [`agent-trace:${traceResultPath}`])
  ]);
}

function openEffectArchive(
  io: LiveFpDispatchCapability,
  input: EnginePluginInput,
  seam: "dispatch" | "evaluation",
  pluginRef: string,
  cCallRef: string
): LivePluginArchiveOpenResult {
  return openLivePluginArchive({
    archiveRoot: io.archiveRoot,
    cCallRef,
    seam,
    pluginRef,
    capability: archiveCapability(io),
    manifest: input.instructionPromptManifest,
    effectInput: archiveEffectInput(input, pluginRef),
    resumeExisting: hasEngineCCallResumeAuthority(input)
  });
}

function writePrelaunchArtifacts(
  archive: FreshLivePluginArchive,
  input: EnginePluginInput
): void {
  archive.writeText(
    "instruction-manifest.json",
    `${JSON.stringify(input.instructionPromptManifest, null, 2)}\n`
  );
  // This is the final archive mutation before transport invocation. Once it
  // exists, an exception is conservatively a contract failure because the
  // external effect may have started.
  archive.writeText(
    "launch.json",
    `${JSON.stringify(
      {
        kind: "live_plugin_transport_launch",
        cCallRef: input.cCallRef,
        requestDigest: archive.requestDigest
      },
      null,
      2
    )}\n`
  );
}

function transportRequest(
  io: LiveFpDispatchCapability,
  timeoutMs: number,
  archive: FreshLivePluginArchive,
  prompt: string
) {
  return {
    contract: io.agentContract,
    prompt,
    cwd: io.cwd,
    archiveRoot: archive.bundleRoot,
    label: archive.label,
    timeoutMs,
    ...(io.executorProfile === undefined
      ? {}
      : { executorProfile: io.executorProfile }),
    ...(io.terminalSessionKeyPrefix === undefined
      ? {}
      : { terminalSessionKey: `${io.terminalSessionKeyPrefix}-${archive.bundleId}` }),
    outputPath: archive.path("output.txt"),
    promptPath: archive.path("prompt.txt"),
    stdoutPath: archive.path("stdout.log"),
    stderrPath: archive.path("stderr.log"),
    transportPath: archive.path("transport.json"),
    traceRoot: archive.path("trace")
  };
}

const liveFpDispatchContract = constructEnginePluginContract({
  ref: LIVE_FP_DISPATCH_PLUGIN_REF,
  driverRequirement: "async_required",
  pluginKind: "fp_dispatch",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpDispatchOutcome"
});

// Worker output law (T-030 builder bug #5): output is a JSON object; byte
// corruption or prose wrapping is a CONTRACT FAILURE for the retry
// allowlist — blocked truth, never a crash. Only one complete JSON object,
// surrounded by whitespace, is the standard response grammar.
function extractJsonObjectText(text: string): Readonly<Record<string, unknown>> {
  const parsed = admitIJsonText(text, "live F_P worker output");
  if (!isPlainObject(parsed)) {
    throw new TypeError("worker output JSON is not an object");
  }
  return parsed;
}

export function standardLiveFpDispatchPlugin(
  input_io: LiveFpDispatchCapability
): FpDispatchPlugin<"async_required"> {
  const io = snapshotCapability(input_io);
  const timeoutMs = admitTimeoutBudgetMs(io.timeoutMs, "live_fp_dispatch_capability");
  return Object.freeze({
    contract: liveFpDispatchContract,
    dispatch: async (input: EnginePluginInput): Promise<FpDispatchOutcome> => {
      if (input.cCallRef === null) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason:
            "live fp dispatch requires a canonical cCallRef before effects (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      if (input.instructionPromptManifest === null) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason:
            "live fp dispatch requires the ABG instruction prompt manifest (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const selectedResultContractRef =
        input.instructionPromptManifest.selectedOutputContractRef;
      if (
        typeof selectedResultContractRef !== "string" ||
        selectedResultContractRef.trim().length === 0
      ) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason:
            "live fp dispatch requires one selected result contract before effects (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const selectedResultRef = input.actorInvocationRef?.resultRef ?? null;
      if (selectedResultRef === null) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason:
            "live fp dispatch requires the admitted actor result identity (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      let archive: LivePluginArchiveOpenResult;
      try {
        archive = openEffectArchive(
          io,
          input,
          "dispatch",
          LIVE_FP_DISPATCH_PLUGIN_REF,
          input.cCallRef
        );
      } catch (error) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason: `live fp dispatch archive refused: ${archiveErrorText(error)} (contract_failure)`,
          evidenceRefs: archiveErrorEvidence(error, input.sourceProjectionRef)
        });
      }
      if (archive.state === "reused") {
        let outcome: FpDispatchOutcome | null = null;
        try {
          outcome = admitFpDispatchOutcome(
            archive.outcome,
            "live fp dispatch cached outcome"
          );
        } catch {
          // A malformed cached completion is a contract failure below.
        }
        if (outcome === null) {
          return constructFpDispatchOutcome({
            status: "blocked",
            failureClass: "contract_failure",
            reason:
              "live fp dispatch archive completion carries the wrong outcome kind (contract_failure)",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
        if (outcome.status === "dispatched") {
          if (outcome.resultRef !== selectedResultRef) {
            return constructFpDispatchOutcome({
              status: "blocked",
              failureClass: "contract_failure",
              reason:
                "live fp dispatch archive completion carries the wrong actor result identity (contract_failure)",
              evidenceRefs: [input.sourceProjectionRef]
            });
          }
          try {
            const envelope = requireFpResultContractEnvelope({
              profile: "attached_transform_result",
              selectedResultContractRef,
              rawResult: {
                ...outcome.resultArtifactCandidate,
                target_value: outcome.targetValueCandidate
              },
              label: "live fp dispatch cached result"
            });
            if (envelope.profile !== "attached_transform_result") {
              throw new TypeError(
                "live fp dispatch cached result admitted under the wrong profile"
              );
            }
            outcome = constructFpDispatchOutcome({
              status: "dispatched",
              resultRef: outcome.resultRef,
              resultArtifactCandidate: envelope.resultArtifactCandidate,
              targetValueCandidate: envelope.targetValueCandidate,
              evidenceRefs: outcome.evidenceRefs
            });
          } catch {
            return constructFpDispatchOutcome({
              status: "blocked",
              failureClass: "contract_failure",
              reason:
                "live fp dispatch archive completion carries the wrong result contract (contract_failure)",
              evidenceRefs: [input.sourceProjectionRef]
            });
          }
        }
        return outcome;
      }
      try {
        writePrelaunchArtifacts(archive, input);
      } catch (error) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason: `live fp dispatch archive preparation failed: ${archiveErrorText(error)} (contract_failure)`,
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
      }
      let transport;
      try {
        transport = await runAgentTransport(
          transportRequest(
            io,
            timeoutMs,
            archive,
            input.instructionPromptManifest.renderedPrompt
          )
        );
      } catch (transportError) {
        const outcome = constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason: `live fp dispatch transport threw after launch: ${archiveErrorText(transportError)} (contract_failure)`,
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
        try {
          archive.complete(outcome);
        } catch {
          // An incomplete bundle deliberately blocks all later repetition.
        }
        return outcome;
      }
      let outcome: FpDispatchOutcome;
      if (transport.status !== 0 || transport.failureClass !== null) {
        outcome = constructFpDispatchOutcome({
          status: "blocked",
          failureClass: transport.failureClass ?? "transport_failure",
          reason: [
            "live fp dispatch transport failed",
            `status=${String(transport.status)}`,
            `failureClass=${transport.failureClass ?? "transport_failure"}`,
            `toolCallCount=${String(transport.toolCallCount)}`
          ].join(" "),
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
      } else {
        try {
          const rawArtifact = extractJsonObjectText(transport.text);
          const envelope = requireFpResultContractEnvelope({
            profile: "attached_transform_result",
            selectedResultContractRef,
            rawResult: rawArtifact,
            label: "live fp dispatch result"
          });
          if (envelope.profile !== "attached_transform_result") {
            throw new TypeError(
              "live fp dispatch result admitted under the wrong profile"
            );
          }
          outcome = constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: selectedResultRef,
            resultArtifactCandidate: envelope.resultArtifactCandidate,
            targetValueCandidate: envelope.targetValueCandidate,
            evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
          });
        } catch (error) {
          const message = archiveErrorText(error).slice(0, 160);
          outcome = constructFpDispatchOutcome({
            status: "blocked",
            failureClass: "contract_failure",
            reason: `live fp dispatch worker output unparsable: ${message} (contract_failure)`,
            evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
          });
        }
      }
      try {
        archive.complete(outcome);
        return outcome;
      } catch (error) {
        return constructFpDispatchOutcome({
          status: "blocked",
          failureClass: "contract_failure",
          reason: `live fp dispatch archive finalization failed after launch: ${archiveErrorText(error)} (contract_failure)`,
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
      }
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


const liveFpEvaluatorContract = constructEnginePluginContract({
  ref: LIVE_FP_EVALUATOR_PLUGIN_REF,
  driverRequirement: "async_required",
  pluginKind: "fp_evaluator",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpEvaluationOutcome"
});

// The STANDARD REVIEW CONTRACT the live evaluator worker returns:
//   { resultContractRef: string, accepted: boolean,
//     closeDisposition: "close"|"retry", assessmentIds: string[],
//     reasons: string[] }
// Acceptance corroboration is MECHANICAL: when the manifest declared
// expected assessment ids, the review must attest every one — a worker
// cannot accept by omission (the T-032 lesson at the evaluator seam).
interface StandardLiveReview {
  readonly resultContractRef: string;
  readonly accepted: boolean;
  readonly closeDisposition: "close" | "retry";
  readonly assessmentIds: readonly string[];
  readonly reasons: readonly string[];
}

function admitStandardLiveReview(
  rawArtifact: Readonly<Record<string, unknown>>,
  selectedResultContractRef: string
): StandardLiveReview {
  const envelope = requireFpResultContractEnvelope({
    profile: "standard_live_review",
    selectedResultContractRef,
    rawResult: rawArtifact,
    label: "live fp evaluation review"
  });
  if (envelope.profile !== "standard_live_review") {
    throw new TypeError("live fp evaluation review admitted under the wrong profile");
  }
  const artifact = envelope.reviewCandidate;
  const accepted = artifact["accepted"];
  if (typeof accepted !== "boolean") {
    throw new TypeError("review.accepted must be a boolean");
  }
  const dispositionRaw = artifact["closeDisposition"];
  const closeDisposition =
    dispositionRaw === "close" || dispositionRaw === "retry"
      ? dispositionRaw
      : null;
  if (closeDisposition === null) {
    throw new TypeError(
      `review.closeDisposition must be "close" or "retry", got ${JSON.stringify(dispositionRaw)}`
    );
  }
  const idsRaw = artifact["assessmentIds"];
  const assessmentIds =
    Array.isArray(idsRaw) &&
    idsRaw.every(
      (row): row is string => typeof row === "string" && row.length > 0
    )
      ? Object.freeze([...idsRaw])
      : null;
  if (assessmentIds === null) {
    throw new TypeError(
      "review.assessmentIds must be an array of non-empty strings when present"
    );
  }
  if (new Set(assessmentIds).size !== assessmentIds.length) {
    throw new TypeError("review.assessmentIds must not contain duplicates");
  }
  const reasonsRaw = artifact["reasons"];
  const reasons =
    Array.isArray(reasonsRaw) &&
    reasonsRaw.every(
      (row): row is string => typeof row === "string" && row.length > 0
    )
      ? Object.freeze([...reasonsRaw])
      : null;
  if (reasons === null) {
    throw new TypeError("review.reasons must be an array of non-empty strings");
  }
  if (
    (accepted && closeDisposition !== "close") ||
    (!accepted && closeDisposition !== "retry")
  ) {
    throw new TypeError(
      "review.accepted and review.closeDisposition are contradictory"
    );
  }
  if (!accepted && reasons.length === 0) {
    throw new TypeError("review rejected result requires at least one reason");
  }
  return Object.freeze({
    resultContractRef: envelope.resultContractRef,
    accepted,
    closeDisposition,
    assessmentIds,
    reasons
  });
}

function sha256Hex(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function standardLiveFpEvaluatorPlugin(
  input_io: LiveFpDispatchCapability
): FpEvaluatorPlugin<"async_required"> {
  const io = snapshotCapability(input_io);
  const timeoutMs = admitTimeoutBudgetMs(io.timeoutMs, "live_fp_evaluator_capability");
  return Object.freeze({
    contract: liveFpEvaluatorContract,
    evaluate: async (input: EnginePluginInput): Promise<FpEvaluationOutcome> => {
      if (input.cCallRef === null) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason:
            "live fp evaluation requires a canonical cCallRef before effects (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      if (input.instructionPromptManifest === null) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason:
            "live fp evaluation requires the ABG instruction prompt manifest (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const selectedResultContractRef =
        input.instructionPromptManifest.selectedOutputContractRef;
      if (
        typeof selectedResultContractRef !== "string" ||
        selectedResultContractRef.trim().length === 0
      ) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason:
            "live fp evaluation requires one selected result contract before effects (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      let archive: LivePluginArchiveOpenResult;
      try {
        archive = openEffectArchive(
          io,
          input,
          "evaluation",
          LIVE_FP_EVALUATOR_PLUGIN_REF,
          input.cCallRef
        );
      } catch (error) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          resultContractRef: selectedResultContractRef,
          reason: `live fp evaluation archive refused: ${archiveErrorText(error)} (contract_failure)`,
          evidenceRefs: archiveErrorEvidence(error, input.sourceProjectionRef)
        });
      }
      if (archive.state === "reused") {
        let outcome: FpEvaluationOutcome | null = null;
        try {
          outcome = admitFpEvaluationOutcome(
            archive.outcome,
            "live fp evaluation cached outcome"
          );
        } catch {
          // A malformed cached completion is a contract failure below.
        }
        if (outcome === null) {
          return constructFpEvaluationOutcome({
            status: "blocked",
            resultContractRef: selectedResultContractRef,
            reason:
              "live fp evaluation archive completion carries the wrong outcome kind (contract_failure)",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
        if (outcome.resultContractRef !== selectedResultContractRef) {
          return constructFpEvaluationOutcome({
            status: "blocked",
            resultContractRef: selectedResultContractRef,
            reason:
              "live fp evaluation archive completion carries the wrong result contract (contract_failure)",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
        return outcome;
      }
      const label = archive.label;
      try {
        writePrelaunchArtifacts(archive, input);
      } catch (error) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          resultContractRef: selectedResultContractRef,
          reason: `live fp evaluation archive preparation failed: ${archiveErrorText(error)} (contract_failure)`,
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
      }
      let transport;
      try {
        transport = await runAgentTransport(
          transportRequest(
            io,
            timeoutMs,
            archive,
            input.instructionPromptManifest.renderedPrompt
          )
        );
      } catch (transportError) {
        const outcome = constructFpEvaluationOutcome({
          status: "blocked",
          resultContractRef: selectedResultContractRef,
          reason: `live fp evaluation transport threw after launch: ${archiveErrorText(transportError)} (contract_failure)`,
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
        try {
          archive.complete(outcome);
        } catch {
          // An incomplete bundle deliberately blocks all later repetition.
        }
        return outcome;
      }
      let outcome: FpEvaluationOutcome;
      if (transport.status !== 0 || transport.failureClass !== null) {
        outcome = constructFpEvaluationOutcome({
          status: "blocked",
          resultContractRef: selectedResultContractRef,
          reason: [
            "live fp evaluation transport failed",
            `status=${String(transport.status)}`,
            `failureClass=${transport.failureClass ?? "transport_failure"}`,
            `toolCallCount=${String(transport.toolCallCount)}`
          ].join(" "),
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
      } else {
        try {
          const review = admitStandardLiveReview(
            extractJsonObjectText(transport.text),
            selectedResultContractRef
          );
          const missing = input.expectedAssessmentIds.filter(
            (id) => !review.assessmentIds.includes(id)
          );
          const expectedAssessmentIds = new Set(input.expectedAssessmentIds);
          const unexpected = review.assessmentIds.filter(
            (id) => !expectedAssessmentIds.has(id)
          );
          if (unexpected.length > 0) {
            throw new TypeError(
              `review.assessmentIds contains unexpected ids: ${unexpected.join(", ")}`
            );
          }
          const closeEligible =
            review.accepted &&
            missing.length === 0 &&
            review.closeDisposition === "close";
          const accepted = closeEligible;
          const closeDisposition = closeEligible ? "close" : "retry";
          const reviewDigest = sha256Hex(JSON.stringify(review));
          const evidenceRefs = evidenceFor(archive, input.sourceProjectionRef);
          outcome = constructFpEvaluationOutcome({
            status: "evaluated",
            resultContractRef: review.resultContractRef,
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
                      ...missing.map(
                        (id) =>
                          `residual://abg/live-fp-evaluator/${label}/unattested/${id}`
                      )
                    ],
                continuationRefs: accepted
                  ? []
                  : [`continuation://abg/live-fp-evaluator/${label}/retry`],
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
                  (reason, index) =>
                    `diagnostic://abg/live-fp-evaluator/${label}/${String(index)}:${reason.slice(0, 80)}`
                ),
                executiveDisposition: accepted ? "close_candidate" : "local_repair"
              })
            ],
            evidenceRefs
          });
        } catch (error) {
          const message = archiveErrorText(error).slice(0, 160);
          outcome = constructFpEvaluationOutcome({
            status: "blocked",
            resultContractRef: selectedResultContractRef,
            reason: `live fp evaluation review unparsable: ${message} (contract_failure)`,
            evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
          });
        }
      }
      try {
        archive.complete(outcome);
        return outcome;
      } catch (error) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          resultContractRef: selectedResultContractRef,
          reason: `live fp evaluation archive finalization failed after launch: ${archiveErrorText(error)} (contract_failure)`,
          evidenceRefs: evidenceFor(archive, input.sourceProjectionRef)
        });
      }
    }
  });
}
