import {
  validateActorProcessCarrierPair,
  type ActorProcessObservation,
} from "./actor_process.js";
import type { AdmittedImplementationResolutionRow } from "./execution_basis.js";
import type {
  LeafExecutionOccurrence,
  LeafInvocationPort,
  ProbabilisticWorkerRequest,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import {
  admitIJsonText,
  admitIJsonValue,
  IJsonAdmissionError,
  type IJsonAdmissionFailureCode,
  type IJsonObject,
} from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { isNonBlankRef } from "../shared/references.js";

export type ProbabilisticResultAdmissionRefusalCode =
  | IJsonAdmissionFailureCode
  | "actor_identity_mismatch"
  | "contract_identity_mismatch"
  | "declared_contract_refused"
  | "input_identity_mismatch"
  | "non_object_result"
  | "request_basis_mismatch"
  | "transport_basis_mismatch"
  | "unadmitted_contract_capability"
  | "worker_identity_mismatch";

export interface ProbabilisticResultAdmissionInput {
  readonly leafPort: LeafInvocationPort;
  readonly occurrence: Readonly<LeafExecutionOccurrence>;
  readonly resolution: Readonly<AdmittedImplementationResolutionRow>;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly request: Readonly<ProbabilisticWorkerRequest>;
  readonly observation: Readonly<ActorProcessObservation>;
}

export interface ContractAdmittedProbabilisticResultCandidate {
  readonly kind: "contract_admitted_probabilistic_result_candidate";
  readonly schemaVersion: "5.0.0";
  readonly candidateRef: string;
  readonly candidateDigest: Sha256Digest;
  readonly contractCapabilityBasis: Readonly<{
    readonly installId: string;
    readonly implementationSetRef: string;
    readonly implementationSetDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
  }>;
  readonly occurrence: Readonly<LeafExecutionOccurrence>;
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly actorInvocationRef: string;
  readonly actorRef: string;
  readonly workerBindingRef: string;
  readonly implementationRef: string;
  readonly implementationResolutionRef: string;
  readonly implementationResolutionDigest: Sha256Digest;
  readonly inputDigest: Sha256Digest;
  readonly instructionContractRef: string;
  readonly rawResultContractRef: string;
  readonly targetOutputContractRef: string;
  readonly processRef: string;
  readonly transportBindingRef: string;
  readonly transportBindingDigest: Sha256Digest;
  readonly transportDigest: Sha256Digest;
  readonly transportDisposition: "failure" | "success";
  readonly transportFailureClass: string | null;
  readonly observationDigest: Sha256Digest;
  readonly rawOutputDigest: Sha256Digest;
  readonly valueDigest: Sha256Digest;
  readonly value: IJsonObject;
}

export interface ProbabilisticResultAdmissionRefusal {
  readonly kind: "probabilistic_result_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ProbabilisticResultAdmissionRefusalCode;
  readonly message: string;
}

export type ProbabilisticResultAdmissionResult =
  | ContractAdmittedProbabilisticResultCandidate
  | ProbabilisticResultAdmissionRefusal;

function refusal(
  code: ProbabilisticResultAdmissionRefusalCode,
  message: string,
): ProbabilisticResultAdmissionRefusal {
  return deepFreeze({
    kind: "probabilistic_result_admission_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

function exactRef(value: unknown): value is string {
  return isNonBlankRef(value) && value.trim() === value;
}

function hasExactDataFields(
  value: unknown,
  fields: readonly string[],
): boolean {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    const prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return false;
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string")) return false;
    const actual = (keys as string[]).sort();
    const expected = [...fields].sort();
    if (
      actual.length !== expected.length ||
      actual.some((field, index) => field !== expected[index])
    ) return false;
    return actual.every((field) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, field);
      return descriptor !== undefined &&
        Object.hasOwn(descriptor, "value") &&
        !Object.hasOwn(descriptor, "get") &&
        !Object.hasOwn(descriptor, "set") &&
        descriptor.enumerable === true;
    });
  } catch {
    return false;
  }
}

const ADMISSION_INPUT_FIELDS = Object.freeze([
  "input",
  "leafPort",
  "observation",
  "occurrence",
  "request",
  "resolution",
]);

const OCCURRENCE_FIELDS = Object.freeze([
  "attempt",
  "cCallRef",
  "frameId",
  "graphCallId",
  "programLocusRef",
  "runId",
  "taskOrdinal",
]);

function exactOccurrence(
  value: Readonly<LeafExecutionOccurrence>,
): boolean {
  return exactRef(value.cCallRef) &&
    exactRef(value.runId) &&
    exactRef(value.graphCallId) &&
    exactRef(value.frameId) &&
    exactRef(value.programLocusRef) &&
    Number.isSafeInteger(value.attempt) &&
    value.attempt >= 1 &&
    (value.taskOrdinal === null ||
      (Number.isSafeInteger(value.taskOrdinal) && value.taskOrdinal >= 0));
}

function asIJsonObject(value: JsonValue): IJsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as IJsonObject
    : null;
}

function canonicalObject(
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  try {
    return asIJsonObject(admitIJsonValue(value)) as
      | Readonly<Record<string, JsonValue>>
      | null;
  } catch {
    return null;
  }
}

function transportBasisMatches(
  request: Readonly<ProbabilisticWorkerRequest>,
  observation: Readonly<ActorProcessObservation>,
): boolean {
  return observation.transportLane === request.transportLane &&
    observation.promptDigest === sha256Canonical(request.prompt) &&
    observation.artifactDigests.prompt === sha256Bytes(request.prompt) &&
    observation.artifactDigests.output === sha256Bytes(observation.finalOutput) &&
    observation.artifactDigests.transport === observation.transportDigest;
}

export function admitProbabilisticResultCandidate(
  supplied: Readonly<ProbabilisticResultAdmissionInput>,
): ProbabilisticResultAdmissionResult {
  if (
    typeof supplied !== "object" ||
    supplied === null ||
    !hasExactDataFields(supplied, ADMISSION_INPUT_FIELDS)
  ) {
    return refusal(
      "request_basis_mismatch",
      "probabilistic result admission requires one exact input basis",
    );
  }

  if (
    typeof supplied.leafPort !== "object" ||
    supplied.leafPort === null ||
    typeof supplied.resolution !== "object" ||
    supplied.resolution === null ||
    supplied.leafPort.kind !== "admitted_leaf_invocation_port" ||
    typeof supplied.leafPort.verifyProbabilisticResultContractPreimage !==
      "function"
  ) {
    return refusal(
      "unadmitted_contract_capability",
      "probabilistic result admission requires one admitted installed leaf port and resolution row",
    );
  }
  const carrierValidation = validateActorProcessCarrierPair(
    supplied.request,
    supplied.observation,
  );
  if (carrierValidation.kind !== "actor_process_carrier_validation") {
    return carrierValidation.code === "invalid_actor_process_request"
      ? refusal("request_basis_mismatch", carrierValidation.message)
      : refusal("transport_basis_mismatch", carrierValidation.message);
  }
  const request = carrierValidation.request;
  const observation = carrierValidation.observation;

  const admittedInput = canonicalObject(supplied.input);
  if (admittedInput === null) {
    return refusal(
      "input_identity_mismatch",
      "probabilistic result input is not one exact I-JSON object",
    );
  }
  const admittedOccurrence = canonicalObject(supplied.occurrence);
  const occurrence = admittedOccurrence as unknown as
    Readonly<LeafExecutionOccurrence>;
  if (
    admittedOccurrence === null ||
    !hasExactDataFields(admittedOccurrence, OCCURRENCE_FIELDS) ||
    !exactOccurrence(occurrence)
  ) {
    return refusal(
      "request_basis_mismatch",
      "probabilistic result request requires one exact execution occurrence",
    );
  }
  if (supplied.resolution.computeRegime !== "F_P") {
    return refusal(
      "request_basis_mismatch",
      "probabilistic result request differs from one exact F_P implementation resolution",
    );
  }
  if (
    occurrence.programLocusRef !==
      supplied.resolution.programLocusRef
  ) {
    return refusal(
      "request_basis_mismatch",
      "execution occurrence locus differs from the admitted implementation resolution",
    );
  }
  if (
    request.resultContractRef !== observation.resultContractRef ||
    request.instructionContractRef !== observation.instructionContractRef
  ) {
    return refusal(
      "contract_identity_mismatch",
      "request, observation, and installed Product contract identities differ",
    );
  }
  const inputDigest = sha256Canonical(admittedInput as unknown as JsonValue);
  if (
    request.inputDigest !== inputDigest ||
    observation.inputDigest !== inputDigest
  ) {
    return refusal(
      "input_identity_mismatch",
      "request or observation input digest differs from the exact input",
    );
  }
  if (observation.actorRef !== request.actorRef) {
    return refusal(
      "actor_identity_mismatch",
      "actor observation differs from the requested actor",
    );
  }
  if (observation.workerBindingRef !== request.workerBindingRef) {
    return refusal(
      "worker_identity_mismatch",
      "actor observation differs from the requested worker binding",
    );
  }
  if (
    request.implementationRef !== supplied.resolution.implementationRef ||
    observation.implementationRef !== request.implementationRef ||
    observation.materializationPlanRef !== request.materializationPlanRef ||
    observation.rendererRef !== request.rendererRef
  ) {
    return refusal(
      "request_basis_mismatch",
      "actor observation differs from the exact implementation request",
    );
  }
  if (!transportBasisMatches(request, observation)) {
    return refusal(
      "transport_basis_mismatch",
      "actor observation contains an incomplete or contradictory transport basis",
    );
  }

  let parsed: JsonValue;
  try {
    parsed = admitIJsonText(
      observation.finalOutput,
      "probabilistic raw result",
    );
  } catch (error) {
    return error instanceof IJsonAdmissionError
      ? refusal(error.code, error.message)
      : refusal("malformed_json", "probabilistic raw result is not exact I-JSON");
  }
  const value = asIJsonObject(parsed);
  if (value === null) {
    return refusal(
      "non_object_result",
      "probabilistic raw result must be one I-JSON object",
    );
  }
  const valueDigest = sha256Canonical(value);
  if (observation.observedOutputDigest !== valueDigest) {
    return refusal(
      "transport_basis_mismatch",
      "observed output digest differs from the exact admitted raw object",
    );
  }
  let contractPreimage: ReturnType<
    LeafInvocationPort["verifyProbabilisticResultContractPreimage"]
  >;
  try {
    contractPreimage = supplied.leafPort
      .verifyProbabilisticResultContractPreimage({
        resolution: supplied.resolution,
        input: admittedInput,
        inputDigest,
        instructionContractRef: request.instructionContractRef,
        rawResultContractRef: request.resultContractRef,
        rawResult: value,
      });
  } catch {
    return refusal(
      "unadmitted_contract_capability",
      "installed implementation owner contract verification raised an exception",
    );
  }
  if (
    contractPreimage.kind ===
      "probabilistic_result_contract_preimage_refusal"
  ) {
    switch (contractPreimage.code) {
      case "contract_identity_mismatch":
        return refusal(
          "contract_identity_mismatch",
          "request and observation contracts differ from the exact installed Product relation",
        );
      case "input_contract_refused":
        return refusal(
          "input_identity_mismatch",
          "installed Product input contract refused the exact request input",
        );
      case "result_contract_refused":
        return refusal(
          "declared_contract_refused",
          "installed Product result contract refused the raw object",
        );
      case "owner_boundary_exception":
      case "unadmitted_resolution":
        return refusal(
          "unadmitted_contract_capability",
          "probabilistic result admission requires one exact admitted implementation-owner preimage",
        );
    }
  }
  const requestDigest = sha256Canonical(request as unknown as JsonValue);
  const observationDigest = sha256Canonical(
    observation as unknown as JsonValue,
  );
  const implementationResolutionDigest = sha256Canonical(
    supplied.resolution as unknown as JsonValue,
  );
  if (
    contractPreimage.implementationResolutionDigest !==
      implementationResolutionDigest ||
    contractPreimage.implementationRef !== supplied.resolution.implementationRef ||
    contractPreimage.inputContractRef !== supplied.resolution.inputContractRef ||
    contractPreimage.targetOutputContractRef !==
      supplied.resolution.outputContractRef ||
    contractPreimage.instructionContractRef !==
      request.instructionContractRef ||
    contractPreimage.rawResultContractRef !== request.resultContractRef ||
    contractPreimage.inputDigest !== inputDigest ||
    contractPreimage.rawResultDigest !== valueDigest
  ) {
    return refusal(
      "unadmitted_contract_capability",
      "implementation-owner preimage differs from the exact admission basis",
    );
  }
  const body = deepFreeze({
    contractCapabilityBasis: contractPreimage.contractCapabilityBasis,
    occurrence,
    requestRef:
      `probabilistic-request://abiogenesis/${requestDigest.slice("sha256:".length)}`,
    requestDigest,
    actorInvocationRef: observation.actorInvocationRef,
    actorRef: request.actorRef,
    workerBindingRef: request.workerBindingRef,
    implementationRef: request.implementationRef,
    implementationResolutionRef:
      `implementation-resolution-row://abiogenesis/${implementationResolutionDigest.slice("sha256:".length)}`,
    implementationResolutionDigest,
    inputDigest,
    instructionContractRef: contractPreimage.instructionContractRef,
    rawResultContractRef: contractPreimage.rawResultContractRef,
    targetOutputContractRef: contractPreimage.targetOutputContractRef,
    processRef: observation.processRef,
    transportBindingRef: observation.transportBindingRef,
    transportBindingDigest: observation.transportBindingDigest,
    transportDigest: observation.transportDigest,
    transportDisposition: observation.disposition,
    transportFailureClass: observation.failureClass,
    observationDigest,
    rawOutputDigest: sha256Bytes(observation.finalOutput),
    valueDigest,
    value,
  });
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "contract_admitted_probabilistic_result_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `probabilistic-result-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  });
}
