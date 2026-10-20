import type { AdmittedActorTransportProjection } from "./c_call.js";
import { type ActorProcessObservation } from "./actor_process.js";
import type { AdmittedImplementationResolutionRow } from "./execution_basis.js";
import type { LeafExecutionOccurrence, LeafInvocationPort, ProbabilisticWorkerRequest } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type IJsonAdmissionFailureCode, type IJsonObject } from "../shared/i_json.js";
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import { type AdmittedImplementationSet, type ExecutionBasis } from "./execution_basis.js";
import type { ValidatedRuntimeEventPrefix } from "./event_prefix.js";
export type ProbabilisticResultAdmissionRefusalCode = IJsonAdmissionFailureCode | "actor_identity_mismatch" | "contract_identity_mismatch" | "declared_contract_refused" | "input_identity_mismatch" | "non_object_result" | "request_basis_mismatch" | "transport_basis_mismatch" | "unadmitted_contract_capability" | "worker_identity_mismatch";
export interface ProbabilisticResultAdmissionInput {
    readonly artifactTruth: ExactPrefixArtifactTruthProjection;
    readonly executionBasis: ExecutionBasis;
    readonly implementationSet: AdmittedImplementationSet;
    readonly leafPort: LeafInvocationPort;
    readonly occurrence: Readonly<LeafExecutionOccurrence>;
    readonly prefix: ValidatedRuntimeEventPrefix;
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
export type ProbabilisticResultAdmissionResult = ContractAdmittedProbabilisticResultCandidate | ProbabilisticResultAdmissionRefusal;
export declare function admitProbabilisticResultCandidate(supplied: Readonly<ProbabilisticResultAdmissionInput>): ProbabilisticResultAdmissionResult;
/** Internal CCall composition; the callback obtains actual owner facts at the
 * selected prefix, never a supplied serialized preimage. */
export declare function admitProbabilisticResultFromActorTransport(supplied: Readonly<ProbabilisticResultAdmissionInput>, actorTransport: () => AdmittedActorTransportProjection | null): ProbabilisticResultAdmissionResult;
