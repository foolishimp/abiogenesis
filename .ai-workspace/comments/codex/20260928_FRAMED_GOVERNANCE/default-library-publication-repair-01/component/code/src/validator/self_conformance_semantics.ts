import type { NativeJudgmentProofOperations } from "../implementation/contracts.js";
import { isDeepStrictEqual } from "node:util";
import * as v from "valibot";
import { resolveSelfConformanceOwner, type QualificationOwnerBasis } from "./self_conformance_basis.js";
import { SELF_CONFORMANCE_IDS as ids, QUALIFICATION_IDS as q } from "../gtl/self_conformance.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { type ProductSemanticsProvider } from "../product/semantics.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isSelfConformanceInput, isSelfConformanceResult } from "./self_conformance_contracts.js";
import { evaluateSelfConformance } from "./self_conformance.js";
import { QUALIFICATION_RAW_JUDGMENT_SCHEMA, QUALIFICATION_RULING_REQUEST_SCHEMA, QUALIFICATION_OWNER_RULING_SCHEMA,
  QUALIFICATION_VERDICT_INPUT_SCHEMA, isQualificationJudgment, isQualificationVerdict,
  qualificationHash as hash, sameQualificationValue as same, type QualificationVerdictInput } from "./qualification_contracts.js";
import { isQualificationAssessmentInput, qualificationRawMatches, qualificationRulingMatches, qualificationWorkerRequest,
  isQualificationVerdictInput, qualificationCoverageIsPublished, isQualificationBasisReady,
  constructQualificationJudgment, isMalformedGtlAssessmentInput,
  isNativeRuntimeAssessmentInput, isNativeRuntimeAssessment,
  isMalformedGtlAssessment, evaluateMalformedGtlAssessment } from "./qualification.js";
import { projectQualificationConsumer, projectExactCandidateQualification, projectNativeRuntimeAssessment } from "../abg/qualification_proof.js";
import { reidentifyHistoricalDurablePrefixCoordinate, type DurablePrefixCoordinate } from "../abg/event_store.js";
const record = (x: unknown): x is Record<string, JsonValue> => x !== null && typeof x === "object" && !Array.isArray(x);
export function isQualificationContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
  switch (valueKind) {
    case "self_conformance_input": return isSelfConformanceInput(value);
    case "self_conformance_result": return isSelfConformanceResult(value);
    case "qualification_assessment_input": return isQualificationAssessmentInput(value);
    case "qualification_raw_judgment": return v.is(QUALIFICATION_RAW_JUDGMENT_SCHEMA, value);
    case "qualification_judgment": return isQualificationJudgment(value);
    case "qualification_ruling_request": return v.is(QUALIFICATION_RULING_REQUEST_SCHEMA, value);
    case "qualification_owner_ruling": return v.is(QUALIFICATION_OWNER_RULING_SCHEMA, value);
    case "qualification_verdict_input": return isQualificationVerdictInput(value);
    case "exact_candidate_qualification": return isQualificationVerdict(value);
    case "native_runtime_assessment_input": return isNativeRuntimeAssessmentInput(value);
    case "native_runtime_assessment": return isNativeRuntimeAssessment(value);
    case "malformed_gtl_assessment_input": return isMalformedGtlAssessmentInput(value);
    case "malformed_gtl_assessment": return isMalformedGtlAssessment(value);
    case "self_conformance_failure": return record(value) && Object.keys(value).length === 4 &&
      value.kind === valueKind && value.schemaVersion === "5.0.0" && typeof value.failureClass === "string" && typeof value.diagnosticRef === "string";
    default: return false;
  }
}
export function qualificationResultRelation(predicateRef: string, input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations): boolean {
  try {
    if (predicateRef === q.runtimeAssessPredicate) {
      if (!isNativeRuntimeAssessment(output) || !isNativeRuntimeAssessmentInput(input)) return false;
      // Only the current native owner can recover these exact historical cuts.
      // Their logical bytes and all assessment/source predicates stay unchanged.
      const basis = currentOwnerPrefix === undefined || nativeProof?.qualificationAssessment !== undefined ? output.nativeBasis : { ...output.nativeBasis,
        predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, output.nativeBasis.predecessorPrefix as DurablePrefixCoordinate) };
      const selected = currentOwnerPrefix === undefined || nativeProof?.qualificationAssessment !== undefined ? input : { ...input, proof: { ...input.proof,
        prefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, input.proof.prefix as DurablePrefixCoordinate) } };
      const expected = nativeProof?.qualificationAssessment !== undefined ? nativeProof.qualificationAssessment()
        : projectNativeRuntimeAssessment(basis, selected);
      return isDeepStrictEqual(expected, output) || same(expected, output);
    }
    if (predicateRef === q.malformedAssessPredicate) return isMalformedGtlAssessmentInput(input) && isMalformedGtlAssessment(output) &&
      projectQualificationConsumer(output.nativeBasis, input) !== null && same(evaluateMalformedGtlAssessment(input, output.nativeBasis), output);
    if (predicateRef === ids.judgmentPredicateRef) {
      if (!isSelfConformanceInput(input) || !isSelfConformanceResult(output)) return false;
      const owner = resolveSelfConformanceOwner(output.owner.nativeBasis as QualificationOwnerBasis, input);
      return owner !== null && same(owner, output.owner) && same(evaluateSelfConformance(input, owner), output);
    }
    if (predicateRef === q.assessPredicate) {
      if (!isQualificationAssessmentInput(input) || !isQualificationJudgment(output) ||
          projectQualificationConsumer(output.nativeBasis, input) === null || !qualificationRawMatches(input, output.raw)) return false;
      return same(constructQualificationJudgment(input, output.raw, output.nativeBasis, output.source), output);
    }
    if (predicateRef === q.verdictPredicate) {
      if (!isQualificationVerdict(output)) return false;
      const basis = currentOwnerPrefix === undefined || nativeProof?.qualificationVerdict !== undefined ? output.nativeBasis : { ...output.nativeBasis,
        predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, output.nativeBasis.predecessorPrefix as DurablePrefixCoordinate) };
      const expected = nativeProof?.qualificationVerdict !== undefined ? nativeProof.qualificationVerdict()
        : projectExactCandidateQualification(basis, input);
      return isDeepStrictEqual(expected, output) || same(expected, output);
    }
    if (predicateRef === q.rulingPredicate) return v.is(QUALIFICATION_RULING_REQUEST_SCHEMA, input)
      ? qualificationRulingMatches(input, output, input.actorRef)
      : v.is(QUALIFICATION_OWNER_RULING_SCHEMA, input) && same(input, output);
    return false;
  } catch { return false; }
}
const inputs = new Map<string, string>([[ids.inputContractRef, "self_conformance_input"], [q.assessmentInput, "qualification_assessment_input"],
  [q.runtimeInput, "native_runtime_assessment_input"], [q.runtimeAssessment, "native_runtime_assessment"],
  [q.malformedInput, "malformed_gtl_assessment_input"], [q.malformedAssessment, "malformed_gtl_assessment"],
  [q.rulingRequest, "qualification_ruling_request"], [q.rulingResponse, "qualification_owner_ruling"], [q.verdictInput, "qualification_verdict_input"]]);
export const ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze<ProductSemanticsProvider>({
  kind: "product_semantics_provider", schemaVersion: "5.0.0", bindingRef: "product-semantics://abiogenesis/qualification/self-conformance@5",
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    const kind = inputs.get(contractRef);
    return kind !== undefined && isQualificationContractValue(kind, value) ? deepFreeze(value) : null;
  },
  evaluateInteractionResponse(basis, value) {
    return basis.requestContractRef === q.rulingRequest && basis.responseContractRef === q.rulingResponse &&
      qualificationRulingMatches(basis.requestValue, value, basis.actingActorRef) ? deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>> : null;
  },
  validateContractValue: isQualificationContractValue,
  resolveProbabilisticWorkerContracts(basis) {
    return basis.inputContractRef === q.assessmentInput && isQualificationAssessmentInput(basis.input)
      ? { instructionContractRef: q.assessmentInput, resultContractRef: q.assessmentRaw } : null;
  },
  validateResultEvidenceLineage(basis) {
    if (basis.outputContractRef !== q.judgment) return true;
    if (!isQualificationJudgment(basis.value)) return false;
    const value = basis.value, rows = basis.admittedEvidence.filter(e => e.evidenceClass === "probabilistic_transport");
    const e = rows.length === 1 ? rows[0]! : null;
    const request = qualificationWorkerRequest({ kind: "qualification_assessment_input", schemaVersion: "5.0.0", task: value.task, plan: value.plan });
    return e !== null && e.cCallRef === value.source.cCallRef && e.inputDigest === value.source.inputDigest &&
      e.actorInvocationRef === value.source.actorInvocationRef && e.actorRef === value.source.actorRef &&
      e.workerBindingRef === value.source.workerBindingRef && e.transportBindingRef === value.source.transportBindingRef &&
      e.transportBindingDigest === value.source.transportBindingDigest && e.requestDigest === value.source.requestDigest &&
      e.requestDigest === hash(request) && e.promptDigest === hash(request.prompt) && e.transportDisposition === "success" &&
      e.transportFailureClass === null && e.outputDigest === hash(value);
  },
  validateInvocationBasis(basis) {
    const runtime = isNativeRuntimeAssessmentInput(basis.input) ? basis.input : isNativeRuntimeAssessment(basis.input) ? basis.input.input : null;
    if (runtime !== null) return basis.sourceResultBasis === null && runtime.basis.workspaceBinding !== null &&
      runtime.basis.workspaceBinding.ref === basis.workspaceBindingId && runtime.basis.workspaceBinding.digest === basis.workspaceBindingDigest;
    const malformed = isMalformedGtlAssessmentInput(basis.input) ? basis.input : isMalformedGtlAssessment(basis.input) ? basis.input.input : null;
    if (malformed !== null) return malformed.basis.workspaceBinding?.ref === basis.workspaceBindingId &&
      malformed.basis.workspaceBinding.digest === basis.workspaceBindingDigest;
    if (isSelfConformanceInput(basis.input)) {
      const selected = basis.input.basis.workspaceBinding;
      return selected !== null && selected.ref === basis.workspaceBindingId && selected.digest === basis.workspaceBindingDigest;
    }
    if (v.is(QUALIFICATION_VERDICT_INPUT_SCHEMA, basis.input)) {
      const selected = basis.input.basis.workspaceBinding;
      return selected !== null && selected.ref === basis.workspaceBindingId && selected.digest === basis.workspaceBindingDigest;
    }
    return isQualificationAssessmentInput(basis.input) || v.is(QUALIFICATION_RULING_REQUEST_SCHEMA, basis.input) || v.is(QUALIFICATION_OWNER_RULING_SCHEMA, basis.input);
  },
  resolveJudgmentRelation(predicateRef: string) {
    return ([ids.judgmentPredicateRef, q.assessPredicate, q.rulingPredicate, q.verdictPredicate,
      q.runtimeAssessPredicate, q.malformedAssessPredicate] as string[]).includes(predicateRef)
      ? { predicateRef, advanceReasonRef: "reason://abiogenesis/qualification/evaluated@5",
        rejectionReasonRef: "reason://abiogenesis/qualification/result-mismatch@5",
        evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations) => qualificationResultRelation(predicateRef, input, output, currentOwnerPrefix, nativeProof) } : null;
  },
});
