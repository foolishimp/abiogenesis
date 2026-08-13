import { constants as osConstants } from "node:os";
import { resolve } from "node:path";

import type { WorkspaceBinding } from "../product/environment.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { isNonBlankRef } from "../shared/references.js";
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import type { CCall } from "./c_call.js";
import { hasAdmittedWorkspaceBinding } from "./environment_admission.js";
import type { ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import { admitRuntimeEvent, type AbgEventStore, type RootEventKind } from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { OpenedTraversalScope } from "./open_call.js";
import {
  classifyWorkerTransportFailure,
  constructKnownWorkerTransportContract,
} from "./transport_contracts.js";
import {
  prepareWorkerTransport,
  runPreparedWorkerTransport,
} from "./worker_transport.js";

const PROCESS_TIMEOUT_MS = 60_000;
const PROCESS_TERMINATION_GRACE_MS = 1_000;
const actorProcessObservations = new WeakSet<object>();

export interface ActorRuntimeBinding {
  readonly workspaceBinding: WorkspaceBinding;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
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
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
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

export type ActorProcessCarrierValidationRefusalCode =
  | "invalid_actor_process_observation"
  | "invalid_actor_process_request";

export interface ActorProcessCarrierValidation {
  readonly kind: "actor_process_carrier_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly request: Readonly<ActorProcessRequest>;
  readonly observation: Readonly<ActorProcessObservation>;
}

export interface ActorProcessCarrierValidationRefusal {
  readonly kind: "actor_process_carrier_validation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ActorProcessCarrierValidationRefusalCode;
  readonly message: string;
}

export type ActorProcessCarrierValidationResult =
  | ActorProcessCarrierValidation
  | ActorProcessCarrierValidationRefusal;

const ACTOR_PROCESS_REQUEST_FIELDS = Object.freeze([
  "actorRef",
  "implementationRef",
  "inputDigest",
  "instructionContractRef",
  "materializationPlanRef",
  "prompt",
  "rendererRef",
  "responseJsonSchema",
  "resultContractRef",
  "transportLane",
  "workerBindingRef",
]);

const ACTOR_PROCESS_OBSERVATION_FIELDS = Object.freeze([
  "actorInvocationRef",
  "actorRef",
  "apiRetryCount",
  "artifactDigests",
  "disposition",
  "exitObserved",
  "failureClass",
  "finalOutput",
  "implementationRef",
  "inputDigest",
  "instructionContractRef",
  "materializationPlanRef",
  "observedOutputDigest",
  "processRef",
  "processSignal",
  "processStatus",
  "progressEventCount",
  "promptDigest",
  "rendererRef",
  "resultContractRef",
  "signalSequence",
  "stderrByteLength",
  "stdoutByteLength",
  "structuredEventCount",
  "terminationConfirmed",
  "timedOut",
  "toolCallCount",
  "transportBindingDigest",
  "transportBindingRef",
  "transportDigest",
  "transportLane",
  "workerBindingRef",
]);

const ACTOR_PROCESS_ARTIFACT_DIGEST_FIELDS = Object.freeze([
  "output",
  "prompt",
  "stderr",
  "stdout",
  "transport",
]);

function carrierRef(value: unknown): value is string {
  return isNonBlankRef(value) && value.trim() === value;
}

function exactOrdinaryDataRecord(
  value: unknown,
  fields: readonly string[],
): Readonly<Record<string, unknown>> | null {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return null;
    }
    const prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return null;
    const keys = Reflect.ownKeys(value);
    const expected = [...fields].sort();
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== "string") ||
      (keys as string[]).sort().some((key, index) => key !== expected[index])
    ) {
      return null;
    }
    for (const key of keys as string[]) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        descriptor === undefined ||
        !Object.hasOwn(descriptor, "value") ||
        Object.hasOwn(descriptor, "get") ||
        Object.hasOwn(descriptor, "set") ||
        descriptor.enumerable !== true
      ) {
        return null;
      }
    }
    return value as Readonly<Record<string, unknown>>;
  } catch {
    return null;
  }
}

function carrierRefusal(
  code: ActorProcessCarrierValidationRefusalCode,
  message: string,
): ActorProcessCarrierValidationRefusal {
  return deepFreeze({
    kind: "actor_process_carrier_validation_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

function isNonnegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isNodeProcessSignal(value: unknown): value is NodeJS.Signals {
  return typeof value === "string" &&
    Object.hasOwn(osConstants.signals, value);
}

function isExactRequestedSignalSequence(
  timedOut: boolean,
  sequence: readonly string[],
): boolean {
  if (!timedOut) return sequence.length === 0;
  return (
    sequence.length === 1 && sequence[0] === "SIGTERM"
  ) || (
    sequence.length === 2 &&
    sequence[0] === "SIGTERM" &&
    sequence[1] === "SIGKILL"
  );
}

/**
 * Pure erased-input validation for actor request/observation carriers.
 * This proves only structural and locally decidable lifecycle law; it neither
 * emits runtime events nor establishes durable observation provenance.
 */
export function validateActorProcessCarrierPair(
  requestCandidate: unknown,
  observationCandidate: unknown,
): ActorProcessCarrierValidationResult {
  const requestRecord = exactOrdinaryDataRecord(
    requestCandidate,
    ACTOR_PROCESS_REQUEST_FIELDS,
  );
  if (requestRecord === null) {
    return carrierRefusal(
      "invalid_actor_process_request",
      "actor process request must be one exact ordinary closed data object",
    );
  }
  let request: Readonly<ActorProcessRequest>;
  try {
    request = admitIJsonValue(requestRecord) as unknown as
      Readonly<ActorProcessRequest>;
  } catch {
    return carrierRefusal(
      "invalid_actor_process_request",
      "actor process request must contain only exact I-JSON data",
    );
  }
  if (
    !carrierRef(request.actorRef) ||
    !carrierRef(request.workerBindingRef) ||
    !carrierRef(request.implementationRef) ||
    !isSha256Digest(request.inputDigest) ||
    !carrierRef(request.materializationPlanRef) ||
    !carrierRef(request.rendererRef) ||
    !carrierRef(request.instructionContractRef) ||
    !carrierRef(request.resultContractRef) ||
    (request.transportLane !== "closed_prompt_proof" &&
      request.transportLane !== "worker_executes") ||
    typeof request.prompt !== "string" ||
    request.prompt.trim().length === 0 ||
    typeof request.responseJsonSchema !== "object" ||
    request.responseJsonSchema === null ||
    Array.isArray(request.responseJsonSchema)
  ) {
    return carrierRefusal(
      "invalid_actor_process_request",
      "actor process request contains an invalid identity, digest, lane, prompt, or response schema",
    );
  }

  const observationRecord = exactOrdinaryDataRecord(
    observationCandidate,
    ACTOR_PROCESS_OBSERVATION_FIELDS,
  );
  if (observationRecord === null) {
    return carrierRefusal(
      "invalid_actor_process_observation",
      "actor process observation must be one exact ordinary closed data object",
    );
  }
  let observation: Readonly<ActorProcessObservation>;
  try {
    observation = admitIJsonValue(observationRecord) as unknown as
      Readonly<ActorProcessObservation>;
  } catch {
    return carrierRefusal(
      "invalid_actor_process_observation",
      "actor process observation must contain only exact I-JSON data",
    );
  }
  const artifacts = exactOrdinaryDataRecord(
    observation.artifactDigests,
    ACTOR_PROCESS_ARTIFACT_DIGEST_FIELDS,
  );
  const counts = [
    observation.structuredEventCount,
    observation.progressEventCount,
    observation.toolCallCount,
    observation.apiRetryCount,
    observation.stdoutByteLength,
    observation.stderrByteLength,
  ];
  const statusValid = observation.processStatus === null ||
    Number.isSafeInteger(observation.processStatus);
  const signalValid = observation.processSignal === null ||
    isNodeProcessSignal(observation.processSignal);
  if (
    !carrierRef(observation.actorInvocationRef) ||
    !carrierRef(observation.actorRef) ||
    !carrierRef(observation.workerBindingRef) ||
    !carrierRef(observation.implementationRef) ||
    !isSha256Digest(observation.inputDigest) ||
    !carrierRef(observation.materializationPlanRef) ||
    !carrierRef(observation.rendererRef) ||
    !carrierRef(observation.instructionContractRef) ||
    !carrierRef(observation.resultContractRef) ||
    !carrierRef(observation.processRef) ||
    !carrierRef(observation.transportBindingRef) ||
    !isSha256Digest(observation.transportBindingDigest) ||
    !isSha256Digest(observation.observedOutputDigest) ||
    !isSha256Digest(observation.promptDigest) ||
    !isSha256Digest(observation.transportDigest) ||
    (observation.transportLane !== "closed_prompt_proof" &&
      observation.transportLane !== "worker_executes") ||
    (observation.disposition !== "failure" &&
      observation.disposition !== "success") ||
    typeof observation.finalOutput !== "string" ||
    typeof observation.timedOut !== "boolean" ||
    typeof observation.exitObserved !== "boolean" ||
    typeof observation.terminationConfirmed !== "boolean" ||
    !statusValid ||
    !signalValid ||
    !Array.isArray(observation.signalSequence) ||
    observation.signalSequence.some((signal) =>
      signal !== "SIGTERM" && signal !== "SIGKILL"
    ) ||
    counts.some((count) => !isNonnegativeSafeInteger(count)) ||
    artifacts === null ||
    ACTOR_PROCESS_ARTIFACT_DIGEST_FIELDS.some(
      (field) => !isSha256Digest(artifacts[field]),
    )
  ) {
    return carrierRefusal(
      "invalid_actor_process_observation",
      "actor process observation contains an invalid identity, digest, value domain, count, or artifact set",
    );
  }
  const terminalPairValid = observation.exitObserved ===
      observation.terminationConfirmed &&
    (
      observation.exitObserved
        ? (
          observation.processStatus !== null &&
          observation.processStatus >= 0 &&
          observation.processSignal === null
        ) || (
          observation.processStatus === null &&
          observation.processSignal !== null
        )
        : observation.processSignal === null &&
          (
            observation.processStatus === null ||
            observation.processStatus < 0
          )
    );
  const requestedSignalSequenceValid = isExactRequestedSignalSequence(
    observation.timedOut,
    observation.signalSequence,
  );
  const timeoutTerminalValid = !observation.timedOut ||
    observation.exitObserved ||
    (
      observation.processStatus === null &&
      observation.processSignal === null &&
      !observation.terminationConfirmed &&
      observation.signalSequence.length === 2
    );
  const expectedFailureClass = classifyWorkerTransportFailure({
    parser: "claude_stream_json",
    lane: request.transportLane,
    processStatus: observation.processStatus,
    timedOut: observation.timedOut,
    terminationConfirmed: observation.terminationConfirmed,
    processSpawnFailed:
      !observation.timedOut &&
      !observation.exitObserved &&
      !observation.terminationConfirmed &&
      observation.processStatus !== null &&
      observation.processStatus < 0,
    structuredEventCount: observation.structuredEventCount,
    toolCallCount: observation.toolCallCount,
    apiRetryCount: observation.apiRetryCount,
    finalOutput: observation.finalOutput,
  });
  const transportClassificationValid =
    observation.transportLane === request.transportLane &&
    observation.failureClass === expectedFailureClass &&
    observation.disposition ===
      (expectedFailureClass === null ? "success" : "failure");
  if (
    !terminalPairValid ||
    !requestedSignalSequenceValid ||
    !timeoutTerminalValid ||
    !transportClassificationValid
  ) {
    return carrierRefusal(
      "invalid_actor_process_observation",
      "actor process observation differs from the owner-classified transport lifecycle",
    );
  }
  return deepFreeze({
    kind: "actor_process_carrier_validation" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "valid" as const,
    request,
    observation,
  });
}

export interface ActorProcessLifecycleProjection {
  readonly kind: "actor_process_lifecycle_projection";
  readonly actorInvocationRef: string;
  readonly processRef: string | null;
  readonly processTerminalEventRef: string | null;
  readonly processTerminalKind:
    | "actor_process_exited"
    | "actor_process_spawn_failed"
    | null;
  readonly actorTerminalEventRef: string | null;
  readonly processLive: boolean;
  readonly cleanupPending: boolean;
  readonly terminationUnconfirmed: boolean;
  readonly cleanupDisposition:
    | "complete"
    | "not_required"
    | "pending"
    | "termination_unconfirmed";
}

export function projectActorProcessLifecycle(
  prefix: ValidatedRuntimeEventPrefix,
  actorInvocationRef: string,
): ActorProcessLifecycleProjection {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const rows = events.filter((event) =>
    event.aggregateId === actorInvocationRef ||
    event.parentAggregateId === actorInvocationRef
  );
  const started = rows.filter((event) => event.kind === "actor_process_started");
  const processTerminals = rows.filter((event) =>
    event.kind === "actor_process_exited" ||
    event.kind === "actor_process_spawn_failed"
  );
  const actorTerminals = rows.filter((event) =>
    event.kind === "actor_invocation_closed" ||
    event.kind === "actor_invocation_failed"
  );
  if (started.length > 1 || processTerminals.length > 1 || actorTerminals.length > 1) {
    throw new TypeError("actor/process lifecycle requires exact single terminal cardinality");
  }
  const processTerminal = processTerminals[0];
  const actorTerminal = actorTerminals[0];
  if (processTerminal?.kind === "actor_process_spawn_failed" && started.length !== 0) {
    throw new TypeError("spawn-failed Process terminal cannot follow process start");
  }
  if (processTerminal?.kind === "actor_process_exited" && started.length !== 1) {
    throw new TypeError("exited Process terminal requires one process start");
  }
  if (actorTerminal !== undefined && processTerminal === undefined) {
    throw new TypeError("ActorInvocation cleanup terminal requires confirmed Process terminality");
  }
  const terminationUnconfirmed = rows.some((event) =>
    event.kind === "actor_process_termination_unconfirmed"
  );
  const processLive = started.length === 1 && processTerminal === undefined;
  const runTerminal = events.some((event) =>
    event.kind === "run_stopped" ||
    (event.kind === "runtime_failure_observed" && event.aggregateType === "run")
  );
  const cleanupPending = actorTerminal === undefined &&
    (processTerminal !== undefined || (runTerminal && started.length === 1));
  return deepFreeze({
    kind: "actor_process_lifecycle_projection" as const,
    actorInvocationRef,
    processRef: rows.find((event) => event.aggregateType === "process")?.aggregateId ?? null,
    processTerminalEventRef: processTerminal?.eventId ?? null,
    processTerminalKind: processTerminal === undefined
      ? null
      : processTerminal.kind === "actor_process_exited"
        ? "actor_process_exited" as const
        : "actor_process_spawn_failed" as const,
    actorTerminalEventRef: actorTerminal?.eventId ?? null,
    processLive,
    cleanupPending,
    terminationUnconfirmed,
    cleanupDisposition: actorTerminal !== undefined
      ? "complete" as const
      : terminationUnconfirmed && processTerminal === undefined
        ? "termination_unconfirmed" as const
        : cleanupPending || processLive
          ? "pending" as const
          : "not_required" as const,
  });
}

interface ActorProcessInvocationInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly scope: OpenedTraversalScope;
  readonly cCall: CCall;
  readonly expectedInputDigest: Sha256Digest;
  readonly expectedInstructionContractRef: string;
  readonly expectedResultContractRef: string;
  readonly runtime: ActorRuntimeBinding;
  readonly request: Readonly<ActorProcessRequest>;
  readonly dispatchOrdinal: number;
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
    input.expectedInstructionContractRef.length === 0 ||
    input.expectedResultContractRef.length === 0 ||
    input.request.instructionContractRef !==
      input.expectedInstructionContractRef ||
    input.request.resultContractRef !== input.expectedResultContractRef ||
    (input.request.transportLane !== "closed_prompt_proof" &&
      input.request.transportLane !== "worker_executes") ||
    !Number.isSafeInteger(input.dispatchOrdinal) ||
    input.dispatchOrdinal < 1 ||
    input.request.workerBindingRef.length === 0 ||
    !hasAdmittedWorkspaceBinding(
      input.runtime.artifactTruth,
      input.runtime.workspaceBinding,
    ) ||
    input.runtime.workspaceBinding.bindingId !== input.executionBasis.workspaceBindingId ||
    input.runtime.workspaceBinding.bindingDigest !== input.executionBasis.workspaceBindingDigest
  ) {
    throw new TypeError(
      "actor process request or workspace differs from the admitted execution basis",
    );
  }

  const environment = Object.freeze({ ...process.env });
  const promptDigest = sha256Canonical(input.request.prompt);
  const requestDigest = sha256Canonical(
    input.request as unknown as JsonValue,
  );
  const requestRef =
    `probabilistic-request://abiogenesis/${requestDigest.slice("sha256:".length)}`;
  const attemptDigest = sha256Canonical({
    basisRef: input.executionBasis.basisRef,
    cCallRef: input.cCall.cCallRef,
    attempt: input.cCall.attempt,
    dispatchOrdinal: input.dispatchOrdinal,
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
    lane: input.request.transportLane,
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
    transportContractDigest: plan.contractDigest,
    agentKey: plan.agentKey,
    parser: plan.parser,
    promptTransport: plan.promptTransport,
    lane: plan.lane,
    dispatchOrdinal: input.dispatchOrdinal,
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
  const stdoutEventRefs: string[] = [];
  const stderrEventRefs: string[] = [];
  let processTerminalConfirmed = false;
  const signalSequence: string[] = [];
  const append = (
    kind: RootEventKind,
    aggregateType: "actor_invocation" | "process",
    aggregateId: string,
    parentAggregateId: string,
    payload: Readonly<Record<string, JsonValue>>,
  ) => {
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
    return event;
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
      requestRef,
      requestDigest,
      dispatchOrdinal: input.dispatchOrdinal,
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
        const event = append(
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
        stdoutEventRefs.push(event.eventId);
      },
      onStderrObserved: (chunk) => {
        const byteLength = Buffer.byteLength(chunk);
        stderrByteLength += byteLength;
        const event = append(
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
        stderrEventRefs.push(event.eventId);
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
      onSpawnFailed: (message) => {
        processTerminalConfirmed = true;
        append(
          "actor_process_spawn_failed",
          "process",
          processRef,
          actorInvocationRef,
          { actorInvocationRef, processRef, diagnosticDigest: sha256Canonical(message) },
        );
      },
      onProcessExited: (status, signal) => {
        processTerminalConfirmed = true;
        append(
          "actor_process_exited",
          "process",
          processRef,
          actorInvocationRef,
          { actorInvocationRef, processRef, status, signal },
        );
      },
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
    const artifactEvent = append(
      "actor_result_artifact_observed",
      "actor_invocation",
      actorInvocationRef,
      input.cCall.cCallRef,
      {
        cCallRef: input.cCall.cCallRef,
        requestRef,
        requestDigest,
        ...observationBody,
      },
    );
    if (processTerminalConfirmed) {
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
          consumedTransportBindingRef: transportBindingRef,
          consumedStdoutEventRefs: Object.freeze([...stdoutEventRefs]),
          consumedStderrEventRefs: Object.freeze([...stderrEventRefs]),
          consumedArtifactEventRef: artifactEvent.eventId,
        },
      );
    }
    const observation = deepFreeze(observationBody) as ActorProcessObservation;
    actorProcessObservations.add(observation);
    return observation;
  } catch (error) {
    if (processTerminalConfirmed) {
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
    }
    throw error;
  }
}
