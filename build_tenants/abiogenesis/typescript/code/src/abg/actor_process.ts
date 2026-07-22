import type { JsonValue } from "../shared/canonical_json.js";
import { resolve } from "node:path";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { CCall } from "./c_call.js";
import type { ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import { admitRuntimeEvent, type AbgEventStore, type RootEventKind } from "./event_store.js";
import type { OpenedTraversalScope } from "./open_call.js";
import { constructKnownWorkerTransportContract } from "./transport_contracts.js";
import { runWorkerTransport } from "./worker_transport.js";

const PROCESS_TIMEOUT_MS = 60_000;
const PROCESS_TERMINATION_GRACE_MS = 1_000;

export interface ActorRuntimeBinding {
  readonly archiveRoot: string;
}

export interface ActorProcessRequest {
  readonly actorRef: string;
  readonly implementationRef: string;
  readonly inputDigest: `sha256:${string}`;
  readonly materializationPlanRef: string;
  readonly rendererRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly prompt: string;
  readonly responseJsonSchema: Readonly<Record<string, JsonValue>>;
}

export interface ActorProcessObservation {
  readonly actorInvocationRef: string;
  readonly disposition: "failure" | "success";
  readonly failureClass: string | null;
  readonly finalOutput: string;
  readonly promptDigest: `sha256:${string}`;
  readonly transportDigest: `sha256:${string}`;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly processStatus: number | null;
  readonly processSignal: string | null;
  readonly timedOut: boolean;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
  readonly artifactDigests: Readonly<{
    output: `sha256:${string}`;
    prompt: `sha256:${string}`;
    stderr: `sha256:${string}`;
    stdout: `sha256:${string}`;
    transport: `sha256:${string}`;
  }>;
}

interface ActorProcessInvocationInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly scope: OpenedTraversalScope;
  readonly cCall: CCall;
  readonly expectedInputDigest: `sha256:${string}`;
  readonly runtime: ActorRuntimeBinding;
  readonly request: Readonly<ActorProcessRequest>;
  readonly basis: RuntimeAdmissionBasis;
}

export async function invokeActorProcess(
  input: ActorProcessInvocationInput,
): Promise<Readonly<ActorProcessObservation>> {
  if (
    input.request.implementationRef !== input.cCall.implementationRef ||
    input.request.inputDigest !== input.expectedInputDigest ||
    input.request.instructionContractRef !== input.cCall.inputContractRef ||
    input.request.resultContractRef !== input.cCall.outputContractRef
  ) {
    throw new TypeError("actor process request differs from the admitted CCall");
  }
  const promptDigest = sha256Canonical(input.request.prompt);
  const identityDigest = sha256Canonical({
    basisRef: input.executionBasis.basisRef,
    cCallRef: input.cCall.cCallRef,
    actorRef: input.request.actorRef,
    implementationRef: input.request.implementationRef,
    inputDigest: input.request.inputDigest,
    promptDigest,
  });
  const actorInvocationRef =
    `actor-invocation://abiogenesis/${identityDigest.slice("sha256:".length)}`;
  const processRef =
    `process://abiogenesis/${sha256Canonical({ actorInvocationRef }).slice("sha256:".length)}`;
  let previousEventRef = input.cCall.fibreSelectedEventRef;
  let streamOrdinal = 0;
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
      cCallRef: input.cCall.cCallRef,
      implementationRef: input.request.implementationRef,
      inputDigest: input.request.inputDigest,
      promptDigest,
    },
  );

  const environment = process.env;
  const command = environment.ABG_TS_CLAUDE_COMMAND;
  try {
    if (command !== undefined && command.length === 0) {
      throw new TypeError("ABG_TS_CLAUDE_COMMAND must be a non-empty command");
    }
    const transport = await runWorkerTransport({
      contract: constructKnownWorkerTransportContract("claude", {
        command: command ?? "claude",
        environment,
      }),
      prompt: input.request.prompt,
      lane: "closed_prompt_proof",
      cwd: resolve(input.runtime.archiveRoot, "..", ".."),
      archiveRoot: input.runtime.archiveRoot,
      label: `fp-${identityDigest.slice("sha256:".length, "sha256:".length + 16)}`,
      timeoutMs: PROCESS_TIMEOUT_MS,
      terminationGraceMs: PROCESS_TERMINATION_GRACE_MS,
      responseJsonSchema: input.request.responseJsonSchema,
      environment,
      observer: {
        onProcessStarted: (pid) => append(
          "actor_process_started",
          "process",
          processRef,
          actorInvocationRef,
          { actorInvocationRef, processRef, processId: pid, cCallRef: input.cCall.cCallRef },
        ),
        onStdoutObserved: (chunk) => append(
          "actor_process_stdout_observed",
          "process",
          processRef,
          actorInvocationRef,
          {
            actorInvocationRef,
            processRef,
            streamOrdinal: ++streamOrdinal,
            byteLength: Buffer.byteLength(chunk),
            chunkDigest: sha256Canonical(chunk),
          },
        ),
        onStderrObserved: (chunk) => append(
          "actor_process_stderr_observed",
          "process",
          processRef,
          actorInvocationRef,
          {
            actorInvocationRef,
            processRef,
            streamOrdinal: ++streamOrdinal,
            byteLength: Buffer.byteLength(chunk),
            chunkDigest: sha256Canonical(chunk),
          },
        ),
        onTimeoutObserved: () => append(
          "actor_process_timeout_observed",
          "process",
          processRef,
          actorInvocationRef,
          { actorInvocationRef, processRef, timeoutMs: PROCESS_TIMEOUT_MS },
        ),
        onSignalRequested: (signal) => append(
          "actor_process_signal_requested",
          "process",
          processRef,
          actorInvocationRef,
          { actorInvocationRef, processRef, signal },
        ),
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
      },
    });
    append(
      "actor_result_artifact_observed",
      "actor_invocation",
      actorInvocationRef,
      input.cCall.cCallRef,
      {
        actorInvocationRef,
        processRef,
        cCallRef: input.cCall.cCallRef,
        outputDigest: transport.artifacts.output.digest,
        transportDigest: transport.artifacts.transport.digest,
      },
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
        transportDigest: transport.artifacts.transport.digest,
      },
    );
    return deepFreeze({
      actorInvocationRef,
      disposition: transport.disposition,
      failureClass: transport.failureClass,
      finalOutput: transport.finalOutput,
      promptDigest,
      transportDigest: transport.artifacts.transport.digest,
      transportLane: transport.lane,
      processStatus: transport.status,
      processSignal: transport.signal,
      timedOut: transport.timedOut,
      progressEventCount: transport.progressEventCount,
      toolCallCount: transport.toolCallCount,
      artifactDigests: {
        output: transport.artifacts.output.digest,
        prompt: transport.artifacts.prompt.digest,
        stderr: transport.artifacts.stderr.digest,
        stdout: transport.artifacts.stdout.digest,
        transport: transport.artifacts.transport.digest,
      },
    });
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
        diagnosticDigest: sha256Canonical(error instanceof Error ? error.message : String(error)),
      },
    );
    throw error;
  }
}
