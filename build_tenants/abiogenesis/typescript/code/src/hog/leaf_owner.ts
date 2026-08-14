import {
  invokeActorProcess,
  validateActorProcessCarrierPair,
  type ActorRuntimeBinding,
  type CCall,
  type ExecutionBasis,
  type OpenedTraversalScope,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import type {
  LeafInvocationPort,
  LeafInvocationReceipt,
  ProbabilisticLeafEffectPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  ExecutableLeafCandidate,
  ExecutableTraversalClock,
} from "./execute.js";
import type { ExecutableTraversalStopRef } from "./traversal.js";

export interface InvokeLeafOwnerInput {
  readonly store: import("../abg/index.js").AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly cCall: CCall;
  readonly traversalStop: ExecutableTraversalStopRef;
  readonly leafPort: LeafInvocationPort;
  readonly implementationResolution:
    import("../abg/index.js").AdmittedImplementationResolutionRow;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly failureValueKind: string;
  readonly validateSuccessCandidate: (
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly clock: ExecutableTraversalClock;
}

export interface LeafOwnerInvocation {
  readonly candidate: ExecutableLeafCandidate<
    Readonly<Record<string, JsonValue>>
  >;
  readonly receipt: Readonly<LeafInvocationReceipt> | null;
  readonly workerContracts: Readonly<{
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
  }> | null;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceCandidate(value: unknown, regime: "F_D" | "F_P"): boolean {
  return isRecord(value) &&
    value.schemaVersion === "5.0.0" &&
    typeof value.implementationRef === "string" &&
    typeof value.inputDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) &&
    typeof value.outputDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.outputDigest) &&
    value.kind === (regime === "F_D"
      ? "deterministic_evidence_candidate"
      : "probabilistic_transport_evidence_candidate");
}

function isLeafCandidate(
  value: unknown,
  regime: "F_D" | "F_P",
  validateSuccess: (value: unknown) => boolean,
  failureValueKind: string,
): value is ExecutableLeafCandidate<Readonly<Record<string, JsonValue>>> {
  if (!isRecord(value) || !Array.isArray(value.evidenceCandidates)) return false;
  const evidence = Array.from(value.evidenceCandidates);
  return value.kind === "leaf_realization_candidate" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "success" || value.disposition === "failure") &&
    (regime === "F_D" ? evidence.length > 0 : evidence.length === 0) &&
    evidence.every((candidate) => isEvidenceCandidate(candidate, regime)) &&
    isRecord(value.resultCandidate) &&
    value.resultCandidate.schemaVersion === "5.0.0" &&
    (value.disposition === "success"
      ? regime === "F_P" || validateSuccess(value.resultCandidate)
      : value.resultCandidate.kind === failureValueKind &&
        typeof value.diagnosticRef === "string" &&
        value.resultCandidate.diagnosticRef === value.diagnosticRef);
}

function totalizedFailure(
  input: InvokeLeafOwnerInput,
  failureClass: "implementation_exception" | "malformed_return",
): ExecutableLeafCandidate<Readonly<Record<string, JsonValue>>> {
  const diagnosticRef =
    `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = deepFreeze({
    kind: input.failureValueKind,
    schemaVersion: "5.0.0" as const,
    failureClass,
    diagnosticRef,
  }) as Readonly<Record<string, JsonValue>>;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: input.implementationResolution.implementationRef,
      inputDigest: input.inputDigest,
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
    diagnosticRef,
  });
}

function admissionBasis(
  clock: ExecutableTraversalClock,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/actor-process`,
    causationEventRefs: [],
  };
}

export async function invokeLeafOwner(
  input: InvokeLeafOwnerInput,
): Promise<LeafOwnerInvocation> {
  const regime = input.traversalStop.computeRegime;
  const workerContracts = regime === "F_P"
    ? input.leafPort.resolveProbabilisticWorkerContracts(
        input.implementationResolution,
        input.input,
      )
    : null;
  let dispatchClaimed = false;
  const effects: ProbabilisticLeafEffectPort | null = regime === "F_P" &&
      input.actorRuntimeBinding !== undefined && workerContracts !== null
    ? {
        occurrence: {
          cCallRef: input.cCall.cCallRef,
          runId: input.cCall.runId,
          graphCallId: input.cCall.graphCallId,
          frameId: input.cCall.frameId,
          programLocusRef: input.cCall.programLocusRef,
          taskOrdinal: input.cCall.taskOrdinal,
          attempt: input.cCall.attempt,
        },
        invokeWorker: async (request) => {
          if (dispatchClaimed) {
            throw new TypeError(
              "one F_P C-call may dispatch exactly one actor invocation",
            );
          }
          dispatchClaimed = true;
          const observation = await invokeActorProcess({
            store: input.store,
            executionBasis: input.executionBasis,
            scope: input.openedTraversalScope,
            cCall: input.cCall,
            expectedInputDigest: input.inputDigest,
            expectedInstructionContractRef: workerContracts.instructionContractRef,
            expectedResultContractRef: workerContracts.resultContractRef,
            runtime: input.actorRuntimeBinding!,
            request,
            dispatchOrdinal: 1,
            basis: admissionBasis(input.clock),
          });
          const pair = validateActorProcessCarrierPair(request, observation);
          if (pair.kind !== "actor_process_carrier_validation") {
            throw new TypeError(pair.message);
          }
          return pair;
        },
      }
    : null;
  try {
    if (regime === "F_P" && effects === null) {
      throw new TypeError("F_P traversal requires its ABG actor binding");
    }
    const receipt = await input.leafPort.invoke(
      input.implementationResolution,
      input.input,
      effects,
    );
    return deepFreeze({
      receipt,
      workerContracts,
      candidate: isLeafCandidate(
          receipt.candidate,
          regime,
          input.validateSuccessCandidate,
          input.failureValueKind,
        )
        ? receipt.candidate
        : totalizedFailure(input, "malformed_return"),
    });
  } catch {
    return deepFreeze({
      receipt: null,
      workerContracts,
      candidate: totalizedFailure(input, "implementation_exception"),
    });
  }
}
