import type { ActorProcessCarrierValidation } from "../abg/actor_process.js";
import { projectQualificationConsumer, projectExactCandidateQualification, projectQualificationRulingForConsumer, projectNativeRuntimeAssessment } from "../abg/qualification_proof.js";
import { QUALIFICATION_IDS as q, SELF_CONFORMANCE_IDS as ids } from "../gtl/self_conformance.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { qualificationHash as hash, sameQualificationValue as same, type QualificationJudgment } from "../validator/qualification_contracts.js";
import { isQualificationAssessmentInput, qualificationWorkerRequest, constructQualificationJudgment,
  isMalformedGtlAssessmentInput, evaluateMalformedGtlAssessment, isMalformedGtlAssessment } from "../validator/qualification.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation, NativeLeafProofOperations } from "./contracts.js";
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
function failure(failureClass: string): Readonly<LeafRealizationCandidate> {
  const diagnosticRef = "diagnostic://abiogenesis/qualification/" + failureClass + "@5";
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure",
    resultCandidate: { kind: "self_conformance_failure", schemaVersion: "5.0.0", failureClass, diagnosticRef },
    evidenceCandidates: [], diagnosticRef });
}
function success(input: unknown, value: unknown, implementationRef: string): Readonly<LeafRealizationCandidate> {
  return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    resultCandidate: value as Record<string, JsonValue>, evidenceCandidates: [{ kind: "deterministic_evidence_candidate",
      schemaVersion: "5.0.0", implementationRef, inputDigest: hash(input), outputDigest: hash(value) }] });
}
export function realizeQualificationAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence):
  Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  if (!isQualificationAssessmentInput(input) || occurrence.qualificationOwnerBasis === undefined ||
      projectQualificationConsumer(occurrence.qualificationOwnerBasis, input, true) === null) {
    throw new TypeError("qualification assessment lacks an exact current owner and admitted task");
  }
  const nativeBasis = occurrence.qualificationOwnerBasis, workerRequest = qualificationWorkerRequest(input);
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest,
    complete(exchange: Readonly<ActorProcessCarrierValidation>) {
      if (!same(exchange.request, workerRequest) || exchange.observation.disposition !== "success" ||
          exchange.observation.failureClass !== null || exchange.observation.inputDigest !== hash(input) ||
          exchange.observation.actorRef !== workerRequest.actorRef || exchange.observation.workerBindingRef !== workerRequest.workerBindingRef ||
          exchange.observation.implementationRef !== q.assessImplementation || exchange.observation.toolCallCount !== 0) return failure("assessment_transport_mismatch");
      try {
        const raw: unknown = JSON.parse(exchange.observation.finalOutput);
        const source: QualificationJudgment["source"] = { cCallRef: occurrence.cCallRef, inputDigest: hash(input),
          actorRef: exchange.observation.actorRef, workerBindingRef: exchange.observation.workerBindingRef,
          actorInvocationRef: exchange.observation.actorInvocationRef, transportBindingRef: exchange.observation.transportBindingRef,
          transportBindingDigest: exchange.observation.transportBindingDigest, requestDigest: hash(workerRequest),
          observationDigest: hash(exchange.observation), promptDigest: hash(workerRequest.prompt), rawValueDigest: hash(raw) };
        const value = constructQualificationJudgment(input, raw, nativeBasis, source);
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
          evidenceCandidates: [], resultCandidate: value as unknown as Record<string, JsonValue> });
      } catch { return failure("assessment_contract_mismatch"); }
    } });
}
export function realizeExactCandidateQualification(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis;
  const value = nativeProof?.qualificationVerdict !== undefined ? nativeProof.qualificationVerdict(input, occurrence)
    : basis === undefined ? null : projectExactCandidateQualification(basis, input, true);
  if (value === null) return failure("qualification_assessment_unadmitted");
  try { return success(input, value, q.verdictImplementation); }
  catch { return failure("qualification_assessment_invalid"); }
}
export function realizeQualificationRuling(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis;
  const ruling = basis === undefined ? null : projectQualificationRulingForConsumer(basis, input, true);
  return ruling === null ? failure("owner_ruling_unadmitted") : success(input, ruling, q.rulingImplementation);
}
export function realizeMalformedGtlAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis;
  if (basis === undefined || !isMalformedGtlAssessmentInput(input) || projectQualificationConsumer(basis, input, true) === null)
    return failure("malformed_gtl_task_unadmitted");
  return success(input, evaluateMalformedGtlAssessment(input, basis), q.malformedAssessImplementation);
}
export const NATIVE_RUNTIME_ASSESSMENT_IMPLEMENTATION_DESCRIPTOR = descriptor(q.runtimeAssessImplementation, "realizeNativeRuntimeAssessment", q.runtimeInput, q.runtimeAssessment, "F_D");
export function realizeNativeRuntimeAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations): Readonly<LeafRealizationCandidate> {
  const basis = occurrence.qualificationOwnerBasis;
  const result = nativeProof?.qualificationAssessment !== undefined ? nativeProof.qualificationAssessment(input, occurrence)
    : basis === undefined ? null : projectNativeRuntimeAssessment(basis, input, true);
  return result === null ? failure("native_runtime_source_unadmitted") : success(input, result, q.runtimeAssessImplementation);
}
