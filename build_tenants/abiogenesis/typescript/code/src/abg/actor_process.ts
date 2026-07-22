import { resolve } from "node:path";

import type { WorkspaceBinding } from "../product/environment.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { CCall } from "./c_call.js";
import { hasAdmittedWorkspaceBinding } from "./environment_admission.js";
import type { ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import { admitRuntimeEvent, type AbgEventStore, type RootEventKind } from "./event_store.js";
import type { OpenedTraversalScope } from "./open_call.js";
import { constructKnownWorkerTransportContract } from "./transport_contracts.js";
import {
  prepareWorkerTransport,
  runPreparedWorkerTransport,
} from "./worker_transport.js";

const PROCESS_TIMEOUT_MS = 60_000;
const PROCESS_TERMINATION_GRACE_MS = 1_000;
const actorProcessObservations = new WeakSet<object>();

export interface ActorRuntimeBinding {
  readonly workspaceBinding: WorkspaceBinding;
}

export interface ActorProcessRequest {
  readonly actorRef: string;
  readonly workerBindingRef: string;
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly materializationPlanRef: string;
  readonly rendererRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly prompt: string;
  readonly responseJsonSchema: Readonly<Record<string, JsonValue>>;
}

export interface ActorProcessObservation {
  readonly actorInvocationRef: string;
  readonly actorRef: string;
  readonly workerBindingRef: string;
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly materializationPlanRef: string;
  readonly rendererRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly processRef: string;
  readonly transportBindingRef: string;
  readonly transportBindingDigest: Sha256Digest;
  readonly disposition: "failure" | "success";
  readonly failureClass: string | null;
  readonly finalOutput: string;
  readonly observedOutputDigest: Sha256Digest;
  readonly promptDigest: Sha256Digest;
  readonly transportDigest: Sha256Digest;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly processStatus: number | null;
  readonly processSignal: string | null;
  readonly timedOut: boolean;
  readonly exitObserved: boolean;
  readonly terminationConfirmed: boolean;
  readonly signalSequence: readonly string[];
  readonly structuredEventCount: number;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
  readonly apiRetryCount: number;
  readonly stdoutByteLength: number;
  readonly stderrByteLength: number;
  readonly artifactDigests: Readonly<{
    output: Sha256Digest;
    prompt: Sha256Digest;
    stderr: Sha256Digest;
    stdout: Sha256Digest;
    transport: Sha256Digest;
  }>;
}

interface ActorProcessInvocationInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly scope: OpenedTraversalScope;
  readonly cCall: CCall;
  readonly expectedInputDigest: Sha256Digest;
  readonly runtime: ActorRuntimeBinding;
  readonly request: Readonly<ActorProcessRequest>;
  readonly basis: RuntimeAdmissionBasis;
}

function positiveInteger(
  environment: Readonly<Record<string, string | undefined>>,
  key: string,
  fallback: number,
): number {
  const raw = environment[key];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(`${key} must be one positive safe integer`);
  }
  return value;
}

function transportLane(
  environment: Readonly<Record<string, string | undefined>>,
): "closed_prompt_proof" | "worker_executes" {
  const value = environment.ABG_TS_FP_TRANSPORT_LANE ?? "closed_prompt_proof";
  if (value !== "closed_prompt_proof" && value !== "worker_executes") {
    throw new TypeError(
      "ABG_TS_FP_TRANSPORT_LANE must be closed_prompt_proof or worker_executes",
    );
  }
  return value;
}

function outputDigest(output: string): Sha256Digest {
  try {
    return sha256Canonical(JSON.parse(output) as JsonValue);
  } catch {
    return sha256Canonical(output);
  }
}

export function isActorProcessObservation(value: object): boolean {
  return actorProcessObservations.has(value);
}

export async function invokeActorProcess(
  input: ActorProcessInvocationInput,
): Promise<Readonly<ActorProcessObservation>> {
  if (
    input.request.implementationRef !== input.cCall.implementationRef ||
    input.request.inputDigest !== input.expectedInputDigest ||
    input.request.instructionContractRef !== input.cCall.inputContractRef ||
    input.request.resultContractRef !== input.cCall.outputContractRef ||
    input.request.workerBindingRef.length === 0 ||
    !hasAdmittedWorkspaceBinding(input.store, input.runtime.workspaceBinding) ||
    input.runtime.workspaceBinding.bindingId !== input.executionBasis.workspaceBindingId ||
    input.runtime.workspaceBinding.bindingDigest !== input.executionBasis.workspaceBindingDigest
  ) {
    throw new TypeError(
      "actor process request or workspace differs from the admitted execution basis",
    );
  }

  const environment = Object.freeze({ ...process.env });
  const promptDigest = sha256Canonical(input.request.prompt);
  const attemptDigest = sha256Canonical({
    basisRef: input.executionBasis.basisRef,
    cCallRef: input.cCall.cCallRef,
    attempt: input.cCall.attempt,
    actorRef: input.request.actorRef,
    workerBindingRef: input.request.workerBindingRef,
    implementationBindingRef: input.cCall.implementationBindingRef,
    implementationRef: input.request.implementationRef,
    inputDigest: input.request.inputDigest,
    promptDigest,
  });
  const command = environment.ABG_TS_CLAUDE_COMMAND;
  if (command !== undefined && command.length === 0) {
    throw new TypeError("ABG_TS_CLAUDE_COMMAND must be a non-empty command");
  }
  const plan = await prepareWorkerTransport({
    contract: constructKnownWorkerTransportContract("claude", {
      command: command ?? "claude",
      environment,
    }),
    prompt: input.request.prompt,
    lane: transportLane(environment),
    cwd: resolve(input.runtime.workspaceBinding.roots.archiveRoot, "..", ".."),
    archiveRoot: input.runtime.workspaceBinding.roots.archiveRoot,
    label: `fp-${attemptDigest.slice("sha256:".length, "sha256:".length + 16)}`,
    timeoutMs: positiveInteger(
      environment,
      "ABG_TS_FP_TIMEOUT_MS",
      PROCESS_TIMEOUT_MS,
    ),
    terminationGraceMs: positiveInteger(
      environment,
      "ABG_TS_FP_TERMINATION_GRACE_MS",
      PROCESS_TERMINATION_GRACE_MS,
    ),
    responseJsonSchema: input.request.responseJsonSchema,
    environment,
  });
  const transportBindingBody = {
    cCallRef: input.cCall.cCallRef,
    actorRef: input.request.actorRef,
    workerBindingRef: input.request.workerBindingRef,
    implementationBindingRef: input.cCall.implementationBindingRef,
    implementationRef: input.request.implementationRef,
    inputDigest: input.request.inputDigest,
    transportPlanDigest: plan.planDigest,
    agentKey: plan.agentKey,
    lane: plan.lane,
    command: plan.command,
    args: plan.args,
    cwd: plan.cwd,
    archiveRoot: plan.archiveRoot,
    timeoutMs: plan.timeoutMs,
    terminationGraceMs: plan.terminationGraceMs,
    promptDigest: plan.promptDigest,
    responseJsonSchemaDigest: plan.responseJsonSchemaDigest,
    environmentPolicyDigest: plan.environmentPolicyDigest,
    environmentDigest: plan.environmentDigest,
    paths: plan.paths,
  };
  const transportBindingDigest = sha256Canonical(
    transportBindingBody as unknown as JsonValue,
  );
  const transportBindingRef =
    `transport-binding://abiogenesis/${transportBindingDigest.slice("sha256:".length)}`;
  const common = {
    eventTime: input.basis.eventTime,
    correlationId: input.basis.correlationId,
    workflowVersion: "5.0.0" as const,
    scopeClass: "run" as const,
    basisId: input.executionBasis.basisRef,
    runId: input.scope.runId,
    graphFunctionRef: input.executionBasis.graphFunctionRef,
    materializationRef: input.executionBasis.graphRef,
    graphCallId: input.scope.graphCallId,
    frameId: input.scope.frameId,
  };
  const bindingEvent = admitRuntimeEvent(input.store, {
    kind: "actor_transport_binding_admitted",
    ...common,
    aggregateType: "transport_binding",
    aggregateId: transportBindingRef,
    parentAggregateId: input.cCall.cCallRef,
    causationEventRefs: [input.cCall.fibreSelectedEventRef],
    payload: {
      transportBindingRef,
      transportBindingDigest,
      ...transportBindingBody,
    },
  });
  const identityDigest = sha256Canonical({
    attemptDigest,
    transportBindingRef,
    transportBindingDigest,
  });
  const actorInvocationRef =
    `actor-invocation://abiogenesis/${identityDigest.slice("sha256:".length)}`;
  const processRef =
    `process://abiogenesis/${sha256Canonical({ actorInvocationRef }).slice("sha256:".length)}`;
  let previousEventRef = bindingEvent.eventId;
  let streamOrdinal = 0;
  let stdoutByteLength = 0;
  let stderrByteLength = 0;
  const signalSequence: string[] = [];
  const append = (
    kind: RootEventKind,
    aggregateType: "actor_invocation" | "process",
    aggregateId: string,
    parentAggregateId: string,
    payload: Readonly<Record<string, JsonValue>>,
  ): void => {
    const event = admitRuntimeEvent(input.store, {
      kind,
      ...common,
      aggregateType,
      aggregateId,
      parentAggregateId,
      causationEventRefs: [previousEventRef],
      payload,
    });
    previousEventRef = event.eventId;
  };

  append(
    "actor_invocation_started",
    "actor_invocation",
    actorInvocationRef,
    input.cCall.cCallRef,
    {
      actorInvocationRef,
      actorRef: input.request.actorRef,
      workerBindingRef: input.request.workerBindingRef,
      cCallRef: input.cCall.cCallRef,
      implementationRef: input.request.implementationRef,
      inputDigest: input.request.inputDigest,
      promptDigest,
      transportBindingRef,
      transportBindingDigest,
    },
  );

  try {
    const transport = await runPreparedWorkerTransport(plan, {
      onProcessStarted: (pid) => append(
        "actor_process_started",
        "process",
        processRef,
        actorInvocationRef,
        { actorInvocationRef, processRef, processId: pid, cCallRef: input.cCall.cCallRef },
      ),
      onStdoutObserved: (chunk) => {
        const byteLength = Buffer.byteLength(chunk);
        stdoutByteLength += byteLength;
        append(
          "actor_process_stdout_observed",
          "process",
          processRef,
          actorInvocationRef,
          {
            actorInvocationRef,
            processRef,
            streamOrdinal: ++streamOrdinal,
            byteLength,
            chunkDigest: sha256Canonical(chunk),
          },
        );
      },
      onStderrObserved: (chunk) => {
        const byteLength = Buffer.byteLength(chunk);
        stderrByteLength += byteLength;
        append(
          "actor_process_stderr_observed",
          "process",
          processRef,
          actorInvocationRef,
          {
            actorInvocationRef,
            processRef,
            streamOrdinal: ++streamOrdinal,
            byteLength,
            chunkDigest: sha256Canonical(chunk),
          },
        );
      },
      onTimeoutObserved: () => append(
        "actor_process_timeout_observed",
        "process",
        processRef,
        actorInvocationRef,
        { actorInvocationRef, processRef, timeoutMs: plan.timeoutMs },
      ),
      onSignalRequested: (signal) => {
        signalSequence.push(signal);
        append(
          "actor_process_signal_requested",
          "process",
          processRef,
          actorInvocationRef,
          { actorInvocationRef, processRef, signal },
        );
      },
      onSpawnFailed: (message) => append(
        "actor_process_spawn_failed",
        "process",
        processRef,
        actorInvocationRef,
        { actorInvocationRef, processRef, diagnosticDigest: sha256Canonical(message) },
      ),
      onProcessExited: (status, signal) => append(
        "actor_process_exited",
        "process",
        processRef,
        actorInvocationRef,
        { actorInvocationRef, processRef, status, signal },
      ),
      onTerminationUnconfirmed: () => append(
        "actor_process_termination_unconfirmed",
        "process",
        processRef,
        actorInvocationRef,
        { actorInvocationRef, processRef },
      ),
    });
    const observedOutputDigest = outputDigest(transport.finalOutput);
    const artifactDigests = {
      output: transport.artifacts.output.digest,
      prompt: transport.artifacts.prompt.digest,
      stderr: transport.artifacts.stderr.digest,
      stdout: transport.artifacts.stdout.digest,
      transport: transport.artifacts.transport.digest,
    };
    const observationBody = {
      actorInvocationRef,
      actorRef: input.request.actorRef,
      workerBindingRef: input.request.workerBindingRef,
      implementationRef: input.request.implementationRef,
      inputDigest: input.request.inputDigest,
      materializationPlanRef: input.request.materializationPlanRef,
      rendererRef: input.request.rendererRef,
      instructionContractRef: input.request.instructionContractRef,
      resultContractRef: input.request.resultContractRef,
      processRef,
      transportBindingRef,
      transportBindingDigest,
      disposition: transport.disposition,
      failureClass: transport.failureClass,
      finalOutput: transport.finalOutput,
      observedOutputDigest,
      promptDigest,
      transportDigest: transport.artifacts.transport.digest,
      transportLane: transport.lane,
      processStatus: transport.status,
      processSignal: transport.signal,
      timedOut: transport.timedOut,
      exitObserved: transport.exitObserved,
      terminationConfirmed: transport.terminationConfirmed,
      signalSequence: Object.freeze([...signalSequence]),
      structuredEventCount: transport.structuredEventCount,
      progressEventCount: transport.progressEventCount,
      toolCallCount: transport.toolCallCount,
      apiRetryCount: transport.apiRetryCount,
      stdoutByteLength,
      stderrByteLength,
      artifactDigests,
    };
    append(
      "actor_result_artifact_observed",
      "actor_invocation",
      actorInvocationRef,
      input.cCall.cCallRef,
      { cCallRef: input.cCall.cCallRef, ...observationBody },
    );
    append(
      transport.disposition === "success"
        ? "actor_invocation_closed"
        : "actor_invocation_failed",
      "actor_invocation",
      actorInvocationRef,
      input.cCall.cCallRef,
      {
        actorInvocationRef,
        processRef,
        cCallRef: input.cCall.cCallRef,
        disposition: transport.disposition,
        failureClass: transport.failureClass,
        transportBindingRef,
        transportBindingDigest,
        transportDigest: transport.artifacts.transport.digest,
      },
    );
    const observation = deepFreeze(observationBody) as ActorProcessObservation;
    actorProcessObservations.add(observation);
    return observation;
  } catch (error) {
    append(
      "actor_invocation_failed",
      "actor_invocation",
      actorInvocationRef,
      input.cCall.cCallRef,
      {
        actorInvocationRef,
        processRef,
        cCallRef: input.cCall.cCallRef,
        disposition: "failure",
        failureClass: "transport_exception",
        transportBindingRef,
        transportBindingDigest,
        diagnosticDigest: sha256Canonical(
          error instanceof Error ? error.message : String(error),
        ),
      },
    );
    throw error;
  }
}
