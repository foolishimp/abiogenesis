import type { ActorProcessCarrierValidation } from "../abg/actor_process.js";
import { projectQualificationConsumer, projectExactCandidateQualification, projectQualificationRulingForConsumer, projectNativeRuntimeAssessment } from "../abg/qualification_proof.js";
import { projectDurableActorObservation } from "../abg/transport_contracts.js";
import { QUALIFICATION_IDS as q, SELF_CONFORMANCE_IDS as ids } from "../gtl/self_conformance.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { qualificationHash as hash, type QualificationJudgment } from "../validator/qualification_contracts.js";
import { isQualificationAssessmentInput, prepareQualificationAssessment,
  isMalformedGtlAssessmentInput, evaluateMalformedGtlAssessment } from "../validator/qualification.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation, NativeLeafProofOperations } from "./contracts.js";
import { canonicalEquals } from "../shared/value/index.js";
// The port admits both catalogs from the owner install at its authority stage
// and passes them on the occurrence (`qualificationCatalogs`).
function descriptor(implementationRef: string, namedSymbol: string, inputContractRef: string, outputContractRef: string, computeRegime: "F_D" | "F_P") {
  const body = { implementationRef, namedSymbol, inputContractRef, outputContractRef, computeRegime,
    packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION, modulePath: "build/code/src/implementation/qualification.js",
    failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
  return deepFreeze({ kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...body,
    descriptorDigest: hash(body) }) as PackagedLeafImplementationDescriptor;
}
export const QUALIFICATION_ASSESSMENT_IMPLEMENTATION_DESCRIPTOR = descriptor(q.assessImplementation, "realizeQualificationAssessment", q.assessmentInput, q.judgment, "F_P");
export const QUALIFICATION_VERDICT_IMPLEMENTATION_DESCRIPTOR = descriptor(q.verdictImplementation, "realizeExactCandidateQualification", q.verdictInput, q.verdict, "F_D");
export const QUALIFICATION_RULING_IMPLEMENTATION_DESCRIPTOR = descriptor(q.rulingImplementation, "realizeQualificationRuling", q.rulingResponse, q.rulingResponse, "F_D");
export const MALFORMED_GTL_ASSESSMENT_IMPLEMENTATION_DESCRIPTOR = descriptor(q.malformedAssessImplementation, "realizeMalformedGtlAssessment", q.malformedInput, q.malformedAssessment, "F_D");
/** An F_D failure carries the deterministic evidence candidate over its input
 * and its failure value, as a success does; an F_P completion carries none. */
function failure(failureClass: string, deterministic?: Readonly<{ input: JsonValue; implementationRef: string }>): Readonly<LeafRealizationCandidate> {
  const diagnosticRef = "diagnostic://abiogenesis/qualification/" + failureClass + "@5";
  const resultCandidate = { kind: "self_conformance_failure", schemaVersion: "5.0.0", failureClass, diagnosticRef };
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", resultCandidate,
    evidenceCandidates: deterministic === undefined ? [] : [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0",
      implementationRef: deterministic.implementationRef, inputDigest: hash(deterministic.input), outputDigest: hash(resultCandidate) }],
    diagnosticRef });
}
function success(input: JsonValue, value: Readonly<Record<string, JsonValue>>, implementationRef: string): Readonly<LeafRealizationCandidate> {
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    resultCandidate: value, evidenceCandidates: [{ kind: "deterministic_evidence_candidate",
      schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(value) }] });
}
export function realizeQualificationAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations):
  Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  const catalogs = occurrence.qualificationCatalogs;
  if (!isQualificationAssessmentInput(input, catalogs) || occurrence.qualificationOwnerBasis === undefined ||
      (nativeProof?.qualificationPreparation === undefined && projectQualificationConsumer(occurrence.qualificationOwnerBasis, input, true, undefined, catalogs) === null)) {
    throw new TypeError("qualification assessment lacks an exact current owner and admitted task");
  }
  const nativeBasis = occurrence.qualificationOwnerBasis, preparation = nativeProof?.qualificationPreparation?.(input, occurrence) ?? prepareQualificationAssessment(input, undefined, catalogs), workerRequest = preparation.request;
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest,
    complete(exchange: Readonly<ActorProcessCarrierValidation>) {
      if (!canonicalEquals(exchange.request, workerRequest) || exchange.observation.disposition !== "success" ||
          exchange.observation.failureClass !== null || exchange.observation.inputDigest !== hash(input) ||
          exchange.observation.actorRef !== workerRequest.actorRef || exchange.observation.workerBindingRef !== workerRequest.workerBindingRef ||
          exchange.observation.implementationRef !== q.assessImplementation || exchange.observation.toolCallCount !== 0) return failure("assessment_transport_mismatch");
      try {
        const raw: JsonValue = JSON.parse(exchange.observation.finalOutput);
        const source: QualificationJudgment["source"] = { cCallRef: occurrence.cCallRef, inputDigest: hash(input),
          actorRef: exchange.observation.actorRef, workerBindingRef: exchange.observation.workerBindingRef,
          actorInvocationRef: exchange.observation.actorInvocationRef, transportBindingRef: exchange.observation.transportBindingRef,
          transportBindingDigest: exchange.observation.transportBindingDigest, requestDigest: hash(workerRequest),
          // An authenticated assessment completion follows a current-profile
          // dispatch, so its source digests the current durable artifact body.
          observationDigest: hash(projectDurableActorObservation(exchange.observation)),
          promptDigest: hash(workerRequest.prompt), rawValueDigest: hash(raw) };
        const value = preparation.complete(raw, nativeBasis, source);
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
          evidenceCandidates: [], resultCandidate: value as unknown as Record<string, JsonValue> });
      } catch { return failure("assessment_contract_mismatch"); }
    } });
}
export function realizeExactCandidateQualification(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis, evidence = { input, implementationRef: q.verdictImplementation };
  const value = nativeProof?.qualificationVerdict !== undefined ? nativeProof.qualificationVerdict(input, occurrence)
    : basis === undefined ? null : projectExactCandidateQualification(basis, input, true, undefined, occurrence.qualificationCatalogs);
  if (value === null) return failure("qualification_assessment_unadmitted", evidence);
  try { return success(input, value, q.verdictImplementation); }
  catch { return failure("qualification_assessment_invalid", evidence); }
}
export function realizeQualificationRuling(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis;
  const ruling = basis === undefined ? null : projectQualificationRulingForConsumer(basis, input, true, undefined, occurrence.qualificationCatalogs);
  return ruling === null ? failure("owner_ruling_unadmitted", { input, implementationRef: q.rulingImplementation })
    : success(input, ruling, q.rulingImplementation);
}
export function realizeMalformedGtlAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis, catalogs = occurrence.qualificationCatalogs;
  if (basis === undefined || !isMalformedGtlAssessmentInput(input, catalogs) || projectQualificationConsumer(basis, input, true, undefined, catalogs) === null)
    return failure("malformed_gtl_task_unadmitted", { input, implementationRef: q.malformedAssessImplementation });
  return success(input, evaluateMalformedGtlAssessment(input, basis, catalogs), q.malformedAssessImplementation);
}
export const NATIVE_RUNTIME_ASSESSMENT_IMPLEMENTATION_DESCRIPTOR = descriptor(q.runtimeAssessImplementation, "realizeNativeRuntimeAssessment", q.runtimeInput, q.runtimeAssessment, "F_D");
export function realizeNativeRuntimeAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis;
  const result = nativeProof?.qualificationAssessment !== undefined ? nativeProof.qualificationAssessment(input, occurrence)
    : basis === undefined ? null : projectNativeRuntimeAssessment(basis, input, true, undefined, occurrence.qualificationCatalogs);
  return result === null ? failure("native_runtime_source_unadmitted", { input, implementationRef: q.runtimeAssessImplementation })
    : success(input, result, q.runtimeAssessImplementation);
}
