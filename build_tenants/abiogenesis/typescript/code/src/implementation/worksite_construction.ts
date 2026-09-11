import type { ActorProcessCarrierValidation } from "../abg/actor_process.js";
import { projectWorksitePreservedResultArtifact, projectWorksitePreservedCandidateBundle } from "../abg/worksite_construction_recovery.js";
import { WORKSITE_PRESERVED_RESULT_IDS as recoveryIds, type WorksitePreservedResultArtifact } from "../product/worksite_construction_recovery.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import {
  WORKSITE_CONSTRUCTION_IDS,
  constructWorksiteCandidateBundle,
  constructWorksiteConstructionWorkerResult,
  constructWorksiteFileReplaceVector,
  isWorksiteCandidateBundle,
  isWorksiteConstructionTask,
  isWorksiteFileReplaceOutputVector,
  reduceWorksiteFileReplaceResults,
  worksiteConstructionWorkerResultSchema,
  type WorksiteCandidateBundle,
  type WorksiteConstructionResult,
  type WorksiteConstructionTask,
  type WorksiteFileReplaceOutputVector,
  type WorksiteFileReplaceVector,
} from "../product/worksite_construction.js";
import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  LeafExecutionOccurrence,
  LeafRealizationCandidate,
  PreparedProbabilisticLeafInvocation,
} from "./contracts.js";

function descriptor(input: Readonly<{
  implementationRef: string;
  namedSymbol: string;
  computeRegime: "F_D" | "F_P";
  inputContractRef: string;
  outputContractRef: string;
}>): PackagedLeafImplementationDescriptor {
  const body = {
    ...input,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/worksite_construction.js",
    failureContractRef: WORKSITE_CONSTRUCTION_IDS.failureContractRef,
    refusalContractRef: WORKSITE_CONSTRUCTION_IDS.refusalContractRef,
  };
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(body),
    ...body,
  }) as PackagedLeafImplementationDescriptor;
}

export const WORKSITE_CONSTRUCTION_CANDIDATE_IMPLEMENTATION_DESCRIPTOR =
  descriptor({
    implementationRef: WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef,
    namedSymbol: "realizeWorksiteConstructionCandidate",
    computeRegime: "F_P",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
  });

export const WORKSITE_CONSTRUCTION_JOIN_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: WORKSITE_CONSTRUCTION_IDS.joinImplementationRef,
  namedSymbol: "realizeWorksiteFileReplaceVector",
  computeRegime: "F_D",
  inputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
  outputContractRef: WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
});

export const WORKSITE_PRESERVED_RESULT_AUTHENTICATE_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: recoveryIds.authenticateImplementationRef, namedSymbol: "authenticateWorksitePreservedResult", computeRegime: "F_D",
  inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef, outputContractRef: recoveryIds.artifactContractRef,
});
export const WORKSITE_PRESERVED_RESULT_DERIVE_IMPLEMENTATION_DESCRIPTOR = descriptor({
  implementationRef: recoveryIds.deriveImplementationRef, namedSymbol: "deriveWorksitePreservedCandidate", computeRegime: "F_D",
  inputContractRef: recoveryIds.artifactContractRef, outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
});
export function authenticateWorksitePreservedResult(input: WorksiteConstructionTask, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate> {
  const value = occurrence.worksitePreservedResultBasis === undefined ? null : projectWorksitePreservedResultArtifact(occurrence.worksitePreservedResultBasis, input);
  return value === null ? failure("preserved_source_invalid") : deterministicSuccess(recoveryIds.authenticateImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>, value as unknown as Readonly<Record<string, JsonValue>>);
}
export function deriveWorksitePreservedCandidate(input: WorksitePreservedResultArtifact, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate> {
  const value = occurrence.worksitePreservedResultBasis === undefined ? null : projectWorksitePreservedCandidateBundle(occurrence.worksitePreservedResultBasis, input);
  return value === null ? failure("preserved_candidate_invalid") : deterministicSuccess(recoveryIds.deriveImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>, value as unknown as Readonly<Record<string, JsonValue>>);
}

export const WORKSITE_CONSTRUCTION_REDUCER_IMPLEMENTATION_DESCRIPTOR =
  descriptor({
    implementationRef: WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef,
    namedSymbol: "reduceWorksiteConstructionResults",
    computeRegime: "F_D",
    inputContractRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
  });

function failure(
  failureClass: string,
): Readonly<LeafRealizationCandidate> {
  const diagnosticRef =
    `diagnostic://abiogenesis/worksite/construction/${failureClass.replaceAll("_", "-")}@5`;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates: [] as const,
    resultCandidate: {
      kind: "worksite_construction_failure" as const,
      schemaVersion: "5.0.0" as const,
      failureClass,
      diagnosticRef,
    },
    diagnosticRef,
  });
}

function deterministicSuccess<
  Input extends Readonly<Record<string, JsonValue>>,
  Output extends Readonly<Record<string, JsonValue>>,
>(
  implementationRef: string,
  input: Input,
  resultCandidate: Output,
): Readonly<LeafRealizationCandidate<Output>> {
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

function exactActorExchange(
  task: WorksiteConstructionTask,
  inputDigest: `sha256:${string}`,
  expectedRequest: Readonly<Record<string, JsonValue>>,
  exchange: Readonly<ActorProcessCarrierValidation>,
): boolean {
  const observation = exchange.observation;
  return canonicalJson(exchange.request as unknown as JsonValue) ===
      canonicalJson(expectedRequest as unknown as JsonValue) &&
    observation.actorRef === WORKSITE_CONSTRUCTION_IDS.workerActorRef &&
    observation.workerBindingRef ===
      WORKSITE_CONSTRUCTION_IDS.workerBindingRef &&
    observation.implementationRef ===
      WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef &&
    observation.inputDigest === inputDigest &&
    observation.materializationPlanRef ===
      WORKSITE_CONSTRUCTION_IDS.materializationPlanRef &&
    observation.rendererRef === WORKSITE_CONSTRUCTION_IDS.rendererRef &&
    observation.instructionContractRef ===
      WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
    observation.resultContractRef ===
      WORKSITE_CONSTRUCTION_IDS.workerResultContractRef &&
    observation.transportLane === "closed_prompt_proof" &&
    observation.promptDigest === task.promptDigest &&
    observation.toolCallCount === 0;
}

/** One governed F_P dispatch; the caller-authored prompt bytes are unchanged. */
export function realizeWorksiteConstructionCandidate(
  input: Readonly<WorksiteConstructionTask>,
  _occurrence: Readonly<LeafExecutionOccurrence>,
): Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  if (!isWorksiteConstructionTask(input)) {
    throw new TypeError(
      "worksite candidate construction requires one exact admitted task",
    );
  }
  const inputDigest = sha256Canonical(input as unknown as JsonValue);
  const workerRequest = deepFreeze({
    actorRef: WORKSITE_CONSTRUCTION_IDS.workerActorRef,
    workerBindingRef: WORKSITE_CONSTRUCTION_IDS.workerBindingRef,
    implementationRef: WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef,
    inputDigest,
    materializationPlanRef: WORKSITE_CONSTRUCTION_IDS.materializationPlanRef,
    rendererRef: WORKSITE_CONSTRUCTION_IDS.rendererRef,
    instructionContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    resultContractRef: WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
    transportLane: WORKSITE_CONSTRUCTION_IDS.transportLane,
    prompt: input.prompt,
    responseJsonSchema: worksiteConstructionWorkerResultSchema(input),
  });
  return deepFreeze({
    kind: "prepared_probabilistic_leaf_invocation" as const,
    schemaVersion: "5.0.0" as const,
    workerRequest,
    complete(exchange: Readonly<ActorProcessCarrierValidation>) {
      if (!exactActorExchange(
        input,
        inputDigest,
        workerRequest as unknown as Readonly<Record<string, JsonValue>>,
        exchange,
      )) return failure("transport_identity_mismatch");
      let rawValue: unknown;
      try {
        rawValue = JSON.parse(exchange.observation.finalOutput) as unknown;
      } catch {
        return failure("result_contract_failure");
      }
      let bundle: WorksiteCandidateBundle;
      try {
        const workerResult = constructWorksiteConstructionWorkerResult(
          input,
          rawValue,
        );
        bundle = constructWorksiteCandidateBundle(input, workerResult);
      } catch {
        return failure("result_contract_failure");
      }
      const salvage = exchange.observation.disposition === "failure" &&
        exchange.observation.failureClass === "transport_failure";
      if (exchange.observation.disposition !== "success" && !salvage) {
        return failure(
          exchange.observation.failureClass ?? "transport_failure",
        );
      }
      return deepFreeze({
        kind: "leaf_realization_candidate" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "success" as const,
        evidenceCandidates: [] as const,
        resultCandidate: bundle as unknown as Readonly<
          Record<string, JsonValue>
        >,
      });
    },
  });
}

/** Deterministic authority join; candidate bytes supply no request authority. */
export function realizeWorksiteFileReplaceVector(
  input: Readonly<WorksiteCandidateBundle>,
): Readonly<LeafRealizationCandidate> {
  if (!isWorksiteCandidateBundle(input)) {
    throw new TypeError(
      "worksite authority join requires one exact admitted candidate bundle",
    );
  }
  const result = constructWorksiteFileReplaceVector(input);
  return deterministicSuccess(
    WORKSITE_CONSTRUCTION_IDS.joinImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
  );
}

/** Deterministic reduction over only the complete admitted C0 output vector. */
export function reduceWorksiteConstructionResults(
  input: Readonly<WorksiteFileReplaceOutputVector>,
): Readonly<LeafRealizationCandidate> {
  if (!isWorksiteFileReplaceOutputVector(input)) {
    throw new TypeError(
      "worksite construction reduction requires one complete admitted C0 output vector",
    );
  }
  const result: WorksiteConstructionResult =
    reduceWorksiteFileReplaceResults(input);
  return deterministicSuccess(
    WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef,
    input as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export type { WorksiteFileReplaceVector };
