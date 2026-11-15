import { isQualificationAssessmentInput, prepareQualificationAssessment, type PreparedQualificationAssessment,
  type AdmittedQualificationCatalogs } from "../validator/qualification.js";
import { admitQualificationCatalogsOnce } from "../validator/qualification_catalogs.js";
import type { ResultEvidenceLineage } from "../abg/result_evidence_lineage_contracts.js";
import type { QualificationResources } from "../validator/qualification_resources.js";
import { graphFunctionSemanticsOwner } from "../product/execution_resolution.js";
import { projectHistoricalGraphCallSourceAtDurablePrefix } from "../abg/project_read_ports.js";
import type { AbgHistoricalGraphCallSourceResource } from "../abg/terminal_result_contracts.js";
import type { NativeLeafProofOperations, NativeJudgmentProofOperations } from "./contracts.js";
import { authenticateOwnedNativeWorkReacquisition, nativeWorkReacquisitionResultMatches,
  prepareGovernanceNativeWorkReacquisition } from "../abg/native_work_reacquisition.js";
import { governanceRef } from "../product/default_library.js";
import { QUALIFICATION_IDS as qualificationIds } from "../gtl/self_conformance.js";
import type { QualificationNativeBasis } from "../validator/qualification_contracts.js";
import { NATIVE_WORK_REACQUISITION_IDS as reacquireIds } from "../product/worksite_command_execution.js";
import { resolveNativeWorkspaceAssessmentDependency, parseNativeWorkspaceAssessmentResult,
  type NativeWorkspaceAssessmentSelection } from "../product/native_workspace_assessment.js";
import { types } from "node:util";
import { rehydrateInvocationAdmissionAtPrefix } from "../abg/invocation_admission.js";
import { isNativeWorkspaceWorkTask, nativeWorkspaceWorkAuthorityMatches, nativeWorkspaceWorkGraphFunctionRef, NATIVE_WORKSPACE_WORK_IDS as nativeIds } from "../product/native_workspace_work.js";
import { isRecord } from "../shared/admission_predicates.js";
import { pathRelation, pathStrictlyWithin } from "../shared/path_confinement.js";
import { SELF_CONFORMANCE_IDS } from "../gtl/self_conformance.js";
import { QUALIFICATION_IMPLEMENTATION_REFS, projectQualificationConsumer, projectNativeRuntimeAssessment, projectExactCandidateQualification, qualificationAssessorEligibility } from "../abg/qualification_proof.js";
import { qualificationResultRelation } from "../validator/self_conformance_semantics.js";
import { evaluateSelfConformance } from "../validator/self_conformance.js";
import { resolveSelfConformanceOwner } from "../validator/self_conformance_basis.js";
import { isSelfConformanceInput, isSelfConformanceResult } from "../validator/self_conformance_contracts.js";
import { SEMANTIC_IMPLEMENTATION_REFS } from "../gtl/semantic_stage_identity.js";
import { WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS } from "../product/worksite_construction_recovery.js";
import { authenticateWorksitePreservedResultBasis } from "../abg/worksite_construction_recovery.js";
import type { GraphFunction } from "../gtl/contracts.js";
import { authenticateOwnedSemanticStageBasis } from "../abg/semantic_stage.js";
import { authenticateOwnedSemanticJobBasis, validateWorksiteFileParentsPlanAtPrefix } from "../abg/semantic_job.js";
import { isWorksiteFileParentsRequest } from "../product/worksite_effect.js";
import { REQUIREMENT_HANDOFF_IDS } from "../gtl/requirement_handoff.js";
import { projectRequirementHandoffCandidate } from "../abg/requirement_handoff.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { WORKSITE_REVISION_IDS } from "../product/worksite_revision.js";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { hasAdmittedProductInstall } from "../abg/environment_admission.js";
import type { ExactPrefixArtifactTruthProjection } from "../abg/artifact_truth.js";
import { projectCCallCarrierPhaseAtPrefix } from "../abg/c_call.js";
// Kept for this module's load order; the worksite leaf gate uses it.
import {} from "../abg/event_calculus.js";
import {
  authenticateOwnedNativeInstructionAssemblyBasis,
  hasAdmittedExecutionBasisAtPrefix,
  hasExactWorksiteCommandLeafSourceAtDurablePrefix,
  hasAdmittedImplementationSetAtPrefix,
  type AdmittedImplementationSet,
} from "../abg/execution_basis.js";
import {
  readOwnedRuntimeEventPrefixAtDurablePrefix,
  selectRuntimeEventPrefixFromAuthority,
  type RuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "../abg/event_prefix.js";
import {
  reidentifyHistoricalDurablePrefixCoordinate, type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type {
  ExecutionDeclarationOwnerCoordinate,
  LoadedProductExecutionResolution,
} from "../product/index.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import {
  inspectProductLeafSemanticsProjection,
  loadInstalledProductSemantics,
  projectInstalledLeafSemantics,
  type InstalledLeafSemanticsProjection,
} from "../product/semantics.js";
import { isWorksiteFileReplaceRequest } from "../product/worksite_effect.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { retainCaughtCause, sanitizeUndispatchedOwnerError, undispatchedOwnerDiagnosticRef,
  type UndispatchedOwnerObservation, type UndispatchedOwnerStage, type UndispatchedOwnerReason } from "../abg/event_contract_profiles.js";
import { constructRuntimeFailureDiagnosticRef } from "../abg/runtime_failure.js";
import { admitJson } from "../shared/admit/index.js";
import {
  validateActorProcessCarrierPair,
  prepareActorProcessInvocation,
} from "../abg/actor_process.js";
import type {
  ClosedLeafInvocationReceipt,
  ClosedLeafOwnerReceipt,
  ClosedProbabilisticLeafOwnerReceipt,
  LeafExecutionOccurrence,
  LeafInvocationPort,
  LeafInvocationOwnerRefusal,
  LeafInvocationOwnerResult,
  LeafInvocationResolution,
  LeafRealizationCandidate,
  LeafRealizationFailureCandidate,
  PreparedProbabilisticLeafInvocation,
  PreparedProbabilisticLeafOwnerInvocation,
  ProbabilisticLeafInvocationReceipt,
  ProbabilisticResultContractPreimageRefusal,
  ProbabilisticResultContractPreimageVerification,
  ProbabilisticWorkerContracts,
} from "./contracts.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import {
  constructLeafExecutionAuthority,
  isLeafExecutionAuthority,
  openWorksiteLeafGate,
} from "./leaf_execution_authority.js";
import { canonicalEquals } from "../shared/value/index.js";

export {
  constructLeafExecutionAuthority,
  isLeafExecutionAuthority,
};

export type LeafInvocationInstall =
  Parameters<typeof hasAdmittedProductInstall>[1];

type LoadedLeafExecutionAuthority = Pick<
  LoadedProductExecutionResolution,
  | "declarationClosure"
  | "declarationPublications"
  | "ownerInstalls"
  | "admittedCatalog"
  | "admittedInstalls"
  | "resolution"
  | "programPublication"
>;

export function isClosedProbabilisticLeafInvocation(
  value: unknown,
): value is Readonly<ProbabilisticLeafInvocationReceipt<unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const receipt = value as Partial<ProbabilisticLeafInvocationReceipt<unknown>>;
  const exchange = receipt.actorProcessExchange;
  const receiptKeys = Reflect.ownKeys(value);
  const exchangeKeys = typeof exchange === "object" && exchange !== null
    ? Reflect.ownKeys(exchange)
    : [];
  if (
    receiptKeys.length !== 5 ||
    !["actorProcessExchange", "candidate", "computeRegime", "kind", "schemaVersion"]
      .every((key) => receiptKeys.includes(key)) ||
    exchangeKeys.length !== 5 ||
    !["disposition", "kind", "observation", "request", "schemaVersion"]
      .every((key) => exchangeKeys.includes(key)) ||
    !isDeeplyFrozen(value)
  ) return false;
  const validated = validateActorProcessCarrierPair(
    exchange?.request,
    exchange?.observation,
  );
  return receipt.kind === "leaf_invocation_receipt" &&
    receipt.schemaVersion === "5.0.0" &&
    receipt.computeRegime === "F_P" &&
    Object.hasOwn(receipt, "candidate") &&
    typeof exchange === "object" && exchange !== null &&
    exchange.kind === "actor_process_carrier_validation" &&
    exchange.schemaVersion === "5.0.0" &&
    exchange.disposition === "valid" &&
    validated.kind === "actor_process_carrier_validation" &&
    canonicalEquals(
      validated,
      exchange,
    );
}

function hasExactDataFields(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
): boolean {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string")) return false;
  const actual = (keys as string[]).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]) &&
    actual.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined &&
        Object.hasOwn(descriptor, "value") &&
        descriptor.enumerable === true;
    });
}

function isDeterministicEvidenceCandidate(value: unknown): boolean {
  return isRecord(value) &&
    hasExactDataFields(value, [
      "implementationRef",
      "inputDigest",
      "kind",
      "outputDigest",
      "schemaVersion",
    ]) &&
    value.kind === "deterministic_evidence_candidate" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.implementationRef === "string" &&
    typeof value.inputDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) &&
    typeof value.outputDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.outputDigest);
}

function isLeafRealizationCandidate(
  value: unknown,
  regime: "F_D" | "F_P",
  validateSuccess: (value: unknown) => boolean,
  failureValueKind: string,
): value is Readonly<LeafRealizationCandidate> {
  if (!isRecord(value) || !Array.isArray(value.evidenceCandidates)) return false;
  if (!hasExactDataFields(
    value,
    value.disposition === "failure"
      ? [
        "diagnosticRef",
        "disposition",
        "evidenceCandidates",
        "kind",
        "resultCandidate",
        "schemaVersion",
      ]
      : [
        "disposition",
        "evidenceCandidates",
        "kind",
        "resultCandidate",
        "schemaVersion",
      ],
  )) return false;
  const evidence = Array.from(value.evidenceCandidates);
  return value.kind === "leaf_realization_candidate" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "success" || value.disposition === "failure") &&
    (regime === "F_D" ? evidence.length > 0 : evidence.length === 0) &&
    evidence.every(isDeterministicEvidenceCandidate) &&
    isRecord(value.resultCandidate) &&
    value.resultCandidate.schemaVersion === "5.0.0" &&
    (value.disposition === "success"
      ? regime === "F_P" || validateSuccess(value.resultCandidate)
      : value.resultCandidate.kind === failureValueKind &&
        typeof value.diagnosticRef === "string" &&
        value.resultCandidate.diagnosticRef === value.diagnosticRef);
}

export function totalizeLeafImplementationFailure(input: Readonly<{
  resolution: Readonly<LeafInvocationResolution>;
  inputDigest: `sha256:${string}`;
  failureValueKind: string;
  failureClass: "implementation_exception" | "malformed_return";
}>,
): Readonly<LeafRealizationCandidate> {
  const { resolution, inputDigest, failureValueKind, failureClass } = input;
  const diagnosticRef =
    `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = deepFreeze({
    kind: failureValueKind,
    schemaVersion: "5.0.0" as const,
    failureClass,
    diagnosticRef,
  });
  const evidenceCandidates = resolution.computeRegime === "F_D"
    ? [{
        kind: "deterministic_evidence_candidate" as const,
        schemaVersion: "5.0.0" as const,
        implementationRef: resolution.implementationRef,
        inputDigest,
        outputDigest: sha256Canonical(resultCandidate),
      }]
    : [];
  const candidate = deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates,
    resultCandidate,
    diagnosticRef,
  });
  if (!isLeafRealizationCandidate(
    candidate,
    resolution.computeRegime,
    () => false,
    failureValueKind,
  )) {
    throw new TypeError(
      "leaf implementation failure totalization violated its regime contract",
    );
  }
  return candidate;
}

function closedInvocationReceipt(
  regime: "F_D",
  candidate: Readonly<LeafRealizationCandidate>,
  exchange: null,
): Readonly<Extract<ClosedLeafInvocationReceipt, { computeRegime: "F_D" }>>;
function closedInvocationReceipt(
  regime: "F_P",
  candidate: Readonly<LeafRealizationCandidate>,
  exchange: Readonly<ProbabilisticLeafInvocationReceipt<unknown>>["actorProcessExchange"],
): Readonly<Extract<ClosedLeafInvocationReceipt, { computeRegime: "F_P" }>>;
function closedInvocationReceipt(
  regime: "F_D" | "F_P",
  candidate: Readonly<LeafRealizationCandidate>,
  exchange: Readonly<ProbabilisticLeafInvocationReceipt<unknown>>["actorProcessExchange"] | null,
): Readonly<ClosedLeafInvocationReceipt> {
  return regime === "F_P"
    ? deepFreeze({
        kind: "leaf_invocation_receipt" as const,
        schemaVersion: "5.0.0" as const,
        computeRegime: "F_P" as const,
        candidate,
        actorProcessExchange: exchange!,
      })
    : deepFreeze({
        kind: "leaf_invocation_receipt" as const,
        schemaVersion: "5.0.0" as const,
        computeRegime: "F_D" as const,
        candidate,
        actorProcessExchange: null,
      });
}

function closedDeterministicOwnerReceipt(
  candidate: Readonly<LeafRealizationCandidate>,
  invoked: boolean,
): Readonly<ClosedLeafOwnerReceipt> {
  return deepFreeze({
    kind: "closed_leaf_owner_receipt" as const,
    schemaVersion: "5.0.0" as const,
    computeRegime: "F_D" as const,
    candidate,
    receipt: invoked ? closedInvocationReceipt("F_D", candidate, null) : null,
    workerContracts: null,
  });
}

function closedUndispatchedProbabilisticOwnerReceipt(
  candidate: Readonly<LeafRealizationFailureCandidate>,
  ownerObservation: UndispatchedOwnerObservation,
): Readonly<ClosedLeafOwnerReceipt> {
  return deepFreeze({
    kind: "closed_leaf_owner_receipt" as const,
    schemaVersion: "5.0.0" as const,
    computeRegime: "F_P" as const,
    effectDisposition: "not_dispatched" as const,
    ownerObservation,
    candidate,
    receipt: null,
    workerContracts: null,
  });
}

function closedProbabilisticOwnerReceipt(
  candidate: Readonly<LeafRealizationCandidate>,
  workerContracts: Readonly<ProbabilisticWorkerContracts>,
  exchange: Readonly<ProbabilisticLeafInvocationReceipt<unknown>>["actorProcessExchange"],
): Readonly<ClosedProbabilisticLeafOwnerReceipt> {
  return deepFreeze({
    kind: "closed_leaf_owner_receipt" as const,
    schemaVersion: "5.0.0" as const,
    computeRegime: "F_P" as const,
    effectDisposition: "completed" as const,
    candidate,
    receipt: closedInvocationReceipt(
      "F_P",
      candidate,
      exchange,
    ),
    workerContracts,
  });
}

function ownerRefusal(
  code: LeafInvocationOwnerRefusal["code"],
): Readonly<LeafInvocationOwnerRefusal> {
  return deepFreeze({
    kind: "leaf_invocation_owner_refusal" as const,
    schemaVersion: "5.0.0" as const,
    code,
    diagnosticRef:
      `diagnostic://abiogenesis/implementation/${code.replaceAll("_", "-")}@5`,
  });
}

type WorkerContracts = ProbabilisticWorkerContracts;

const PROBABILISTIC_WORKER_REQUEST_FIELDS = Object.freeze([
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

function isPreparedProbabilisticLeafInvocation(
  value: unknown,
): value is Readonly<PreparedProbabilisticLeafInvocation<unknown>> {
  return isRecord(value) &&
    hasExactDataFields(value, ["complete", "kind", "schemaVersion", "workerRequest"]) &&
    value.kind === "prepared_probabilistic_leaf_invocation" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.complete === "function" &&
    isRecord(value.workerRequest) &&
    hasExactDataFields(value.workerRequest, Object.hasOwn(value.workerRequest, "responsePresentation")
      ? [...PROBABILISTIC_WORKER_REQUEST_FIELDS, "responsePresentation"] : PROBABILISTIC_WORKER_REQUEST_FIELDS) &&
    (!Object.hasOwn(value.workerRequest, "responsePresentation") || value.workerRequest.responsePresentation === "result_text") &&
    isDeeplyFrozen(value);
}

function preimageRefusal(
  code: ProbabilisticResultContractPreimageRefusal["code"],
): Readonly<ProbabilisticResultContractPreimageRefusal> {
  return deepFreeze({
    kind: "probabilistic_result_contract_preimage_refusal" as const,
    schemaVersion: "5.0.0" as const,
    code,
    diagnosticRef:
      `diagnostic://abiogenesis/implementation/${code.replaceAll("_", "-")}@5`,
  });
}

// These closures stay at the invoking owner. Installed modules execute their
// declared realization/relation without acquiring a second copy of its history.
function nativeLeafProofOperations(
  implementationRef: string, value: unknown, occurrence: LeafExecutionOccurrence,
  historicalSource?: AbgHistoricalGraphCallSourceResource, resources?: QualificationResources, preparation?: PreparedQualificationAssessment,
): Readonly<NativeLeafProofOperations> {
  const exact = (input: unknown, supplied: LeafExecutionOccurrence) => {
    if (input !== value || supplied !== occurrence) throw new TypeError("native proof operation differs from its exact admitted input/occurrence");
  };
  const basis = occurrence.qualificationOwnerBasis, native = occurrence.nativeWorkReacquisitionBasis;
  return Object.freeze({
    ...(implementationRef === governanceRef("implementation", "prepare-testing") && occurrence.nativeInstructionAssemblyBasis !== undefined &&
      occurrence.nativeInstructionAssemblyBasis.cCall.cCallRef === occurrence.cCallRef
      ? { governanceTestingReacquisition: (input: unknown, supplied: LeafExecutionOccurrence,
          context: import("../product/worksite_effect.js").WorksiteContextObservation,
          refusal?: Parameters<NonNullable<NativeLeafProofOperations["governanceTestingReacquisition"]>>[3]) => {
          exact(input, supplied);
          return prepareGovernanceNativeWorkReacquisition(occurrence.nativeInstructionAssemblyBasis!, input, context, historicalSource, refusal,
            occurrence.commandAmbientEnvironment);
        } } : {}),
    ...(implementationRef === qualificationIds.assessImplementation && preparation !== undefined ? { qualificationPreparation: (input: unknown, supplied: LeafExecutionOccurrence) => { exact(input, supplied); return preparation; } } : {}),
    ...(implementationRef === SELF_CONFORMANCE_IDS.implementationRef && basis?.cCallRef === occurrence.cCallRef
      ? { qualificationSelfConformance: (input: unknown, supplied: LeafExecutionOccurrence) => {
          exact(input, supplied);
          if (!isSelfConformanceInput(value)) return null;
          const owner = resolveSelfConformanceOwner(basis, value, true, resources, occurrence.qualificationCatalogs);
          return owner === null ? null : evaluateSelfConformance(value, owner, resources, occurrence.qualificationCatalogs);
        } } : {}),
    ...(implementationRef === qualificationIds.verdictImplementation && basis?.cCallRef === occurrence.cCallRef
      ? { qualificationVerdict: (input: unknown, supplied: LeafExecutionOccurrence) => {
          exact(input, supplied); return projectExactCandidateQualification(basis, value, true, resources, occurrence.qualificationCatalogs);
        } } : {}),
    ...(implementationRef === qualificationIds.runtimeAssessImplementation && basis?.cCallRef === occurrence.cCallRef
      ? { qualificationAssessment: (input: unknown, supplied: LeafExecutionOccurrence) => {
          exact(input, supplied); return projectNativeRuntimeAssessment(basis, value, true, resources, occurrence.qualificationCatalogs);
        } } : {}),
    ...(implementationRef === reacquireIds.implementationRef && native?.cCallRef === occurrence.cCallRef
      ? { nativeOwnedWorkReacquisition: (input: unknown, supplied: LeafExecutionOccurrence) => {
          exact(input, supplied); return authenticateOwnedNativeWorkReacquisition(native, value, true, historicalSource);
        } } : {}),
  });
}
function nativeOccurrenceVerifier(occurrence: Readonly<LeafExecutionOccurrence>) {
  return (supplied: Readonly<LeafExecutionOccurrence>): boolean => {
    if (supplied !== occurrence) return false;
    const basis = occurrence.nativeInstructionAssemblyBasis;
    const owner = basis === undefined ? null : authenticateOwnedNativeInstructionAssemblyBasis(basis);
    return owner !== null && (["cCallRef", "runId", "graphCallId", "frameId", "programLocusRef", "taskOrdinal", "attempt"] as const)
      .every(key => owner.call[key] === occurrence[key]);
  };
}
// `catalogs` yields the install's admitted catalogs when a qualification
// relation first needs them, or null when the admission refused them; the
// port always supplies it.
function nativeJudgmentProofOperations(
  predicateRef: string, input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate,
  historicalSource?: AbgHistoricalGraphCallSourceResource, resources?: QualificationResources, preparation?: PreparedQualificationAssessment,
  catalogs?: () => Readonly<AdmittedQualificationCatalogs> | null,
): Readonly<NativeJudgmentProofOperations> {
  const historical = historicalSource === undefined ? {} : { historicalGraphCallSource: () =>
    currentOwnerPrefix === undefined ? null : projectHistoricalGraphCallSourceAtDurablePrefix(currentOwnerPrefix, historicalSource) };
  if (predicateRef === qualificationIds.assessPredicate) {
    const preparedFor = (owned: PreparedQualificationAssessment) => {
      const admittedInput = admitJson(input);
      return admittedInput.kind === "ok" && sha256Canonical(admittedInput.value) === owned.request.inputDigest && owned.matches(owned.input, output);
    };
    return Object.freeze({ ...historical,
      qualificationJudgment: () => preparation !== undefined && preparedFor(preparation),
      qualificationRequest: () => preparation !== undefined && preparedFor(preparation) ? preparation.request : null,
    });
  }
  if (predicateRef === SELF_CONFORMANCE_IDS.judgmentPredicateRef) return Object.freeze({ ...historical,
    qualificationSelfConformance: () => {
      if (!isSelfConformanceInput(input) || !isSelfConformanceResult(output)) return null;
      const admitted = catalogs?.();
      if (admitted === null) return null;
      const owner = resolveSelfConformanceOwner(output.owner.nativeBasis, input, false, resources, admitted);
      return owner === null ? null : evaluateSelfConformance(input, owner, resources, admitted);
    },
  });
  if (predicateRef === reacquireIds.predicateRef) return Object.freeze({ ...historical,
    nativeWorkReacquisition: () => nativeWorkReacquisitionResultMatches(input, output, currentOwnerPrefix, historicalSource),
  });
  if (predicateRef === qualificationIds.verdictPredicate) return Object.freeze({ ...historical,
    qualificationVerdict: () => {
      const admitted = catalogs?.();
      if (admitted === null || !isRecord(output) || !isRecord(output.nativeBasis)) return null;
      const original = output.nativeBasis as unknown as QualificationNativeBasis;
      const basis = currentOwnerPrefix === undefined ? original : { ...original,
        predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix as DurablePrefixCoordinate) };
      return projectExactCandidateQualification(basis, input, false, resources, admitted);
    },
  });
  if (predicateRef !== qualificationIds.runtimeAssessPredicate) return Object.freeze(historical);
  return Object.freeze({ ...historical,
    qualificationAssessment: () => {
      const admitted = catalogs?.();
      if (admitted === null || !isRecord(output) || !isRecord(output.nativeBasis)) return null;
      const original = output.nativeBasis as unknown as QualificationNativeBasis;
      const basis = currentOwnerPrefix === undefined ? original : { ...original,
        predecessorPrefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, original.predecessorPrefix as DurablePrefixCoordinate) };
      const selected = currentOwnerPrefix === undefined || !isRecord(input) || !isRecord(input.proof) ? input : { ...input,
        proof: { ...input.proof, prefix: reidentifyHistoricalDurablePrefixCoordinate(currentOwnerPrefix, input.proof.prefix as unknown as DurablePrefixCoordinate) } };
      return projectNativeRuntimeAssessment(basis, selected, false, resources, admitted);
    },
  });
}

export async function invokeLeafOwnerBoundary(input: Readonly<{
  resolution: Readonly<LeafInvocationResolution>;
  value: Readonly<Record<string, JsonValue>>;
  inputDigest: `sha256:${string}`;
  failureValueKind: string;
  verifyAuthority: () => boolean | Promise<boolean>;
  validateSuccess: (value: unknown) => boolean;
  resolveWorkerContracts: (
    resolution: Readonly<LeafInvocationResolution>,
    value: Readonly<Record<string, JsonValue>>,
  ) => Readonly<WorkerContracts> | null;
  occurrence: Readonly<LeafExecutionOccurrence>;
  historicalSource?: AbgHistoricalGraphCallSourceResource;
  qualificationResources?: QualificationResources;
  qualificationPreparation?: PreparedQualificationAssessment;
  /** The qualification owner's eligibility, bound by the invoking port to this call. */
  dispatchEligibility?: import("../abg/actor_process.js").ActorDispatchEligibility;
  /** A refusal the invoking owner's admission decided for this stage. */
  authorityRefusal?: Readonly<{ at: string; reason: string }>;
  contractByRef?: NonNullable<LeafInvocationPort["contractByRef"]>;
  loadImplementation: () => Promise<unknown>;
}>): Promise<Readonly<LeafInvocationOwnerResult>> {
  const { resolution, inputDigest, failureValueKind } = input;
  const totalizedFailure = (
    failureClass: "implementation_exception" | "malformed_return",
  ): Readonly<LeafRealizationFailureCandidate> =>
    totalizeLeafImplementationFailure({
      resolution,
      inputDigest,
      failureValueKind,
      failureClass,
    }) as Readonly<LeafRealizationFailureCandidate>;
  // The F_D boundary's failures, the F_P completion's, and both regimes'
  // malformed returns; the regime is the resolution's. A refused return's cause
  // is the refusal's `at` (bounded as a caught message is) and `reason`.
  const deterministicFailure = (
    failureClass: "implementation_exception" | "malformed_return",
    stage: "authority_verification" | "implementation_load" | "implementation_invocation" | "implementation_completion",
    reason: "refused" | "thrown" | "rejected" | "missing_export",
    error?: unknown,
    refusal?: Readonly<{ at: string; reason: string }>,
  ): Readonly<LeafRealizationFailureCandidate> => {
    const original = totalizedFailure(failureClass);
    const caught = reason === "thrown" || reason === "rejected" ? error : null;
    const diagnosticRef = constructRuntimeFailureDiagnosticRef({
      diagnosticClassRef: original.diagnosticRef,
      computeRegime: resolution.computeRegime,
      implementationRef: resolution.implementationRef,
      inputDigest,
      stage,
      reason,
      cause: refusal === undefined
        ? retainCaughtCause(caught)
        : { at: refusal.at.slice(0, 8192), atTruncated: refusal.at.length > 8192, reason: refusal.reason },
    });
    const resultCandidate = { ...original.resultCandidate, diagnosticRef };
    return deepFreeze({
      ...original,
      diagnosticRef,
      resultCandidate,
      evidenceCandidates: original.evidenceCandidates.map(evidence => ({
        ...evidence,
        outputDigest: sha256Canonical(resultCandidate),
      })),
    });
  };
  // A returned candidate is admitted, then validated; a refusal, a rejection or
  // a validator throw is the `malformed_return` failure carrying its cause.
  const malformedOrAdmitted = (
    output: unknown,
    regime: "F_D" | "F_P",
    stage: "implementation_invocation" | "implementation_completion",
  ): Readonly<LeafRealizationCandidate> => {
    const admitted = admitJson(output);
    if (admitted.kind !== "ok") {
      const { at, reason } = admitted.evidence;
      return deterministicFailure("malformed_return", stage, "refused", undefined,
        { at: String(at), reason: String(reason) });
    }
    let candidate: Readonly<LeafRealizationCandidate> | null;
    try {
      candidate = isLeafRealizationCandidate(admitted.value, regime, input.validateSuccess, failureValueKind)
        ? admitted.value : null;
    } catch (error) {
      return deterministicFailure("malformed_return", stage, "thrown", error);
    }
    return candidate ?? deterministicFailure("malformed_return", stage, "refused", undefined,
      { at: "", reason: `the admitted output is not an ${regime} leaf realization candidate` });
  };
  const undispatched = (
    failureClass: "implementation_exception" | "malformed_return",
    stage: UndispatchedOwnerStage,
    reason: UndispatchedOwnerReason,
    error?: unknown,
  ) => {
    const diagnosticRef = undispatchedOwnerDiagnosticRef(stage, reason, error);
    const original = totalizedFailure(failureClass);
    const candidate = deepFreeze({ ...original, diagnosticRef,
      resultCandidate: { ...original.resultCandidate, diagnosticRef } });
    const o = input.occurrence;
    const ownerObservation: UndispatchedOwnerObservation = deepFreeze({
      kind: "undispatched_owner_observation", schemaVersion: "5.0.0",
      cCallRef: o.cCallRef, runId: o.runId, graphCallId: o.graphCallId, frameId: o.frameId,
      programLocusRef: o.programLocusRef, taskOrdinal: o.taskOrdinal, attempt: o.attempt,
      implementationRef: resolution.implementationRef, inputContractRef: resolution.inputContractRef,
      outputContractRef: resolution.outputContractRef, inputDigest, stage, reason,
      ...sanitizeUndispatchedOwnerError(reason === "thrown" ? error : null), diagnosticRef,
    });
    return closedUndispatchedProbabilisticOwnerReceipt(candidate, ownerObservation);
  };
  const carriesWorksiteAuthority = resolution.implementationRef === nativeIds.implementationRef ||
    isWorksiteFileReplaceRequest(input.value) || isWorksiteFileParentsRequest(input.value) ||
    input.occurrence.executionAuthority !== null;
  // A refused admission is the stage's first step and carries its cause. The
  // F_P undispatched observation admits a cause only for a throw, so there the
  // refusal is observed as the TypeError naming it.
  const refusal = input.authorityRefusal;
  if (refusal !== undefined) {
    return resolution.computeRegime === "F_D"
      ? closedDeterministicOwnerReceipt(
          deterministicFailure("implementation_exception", "authority_verification", "refused", undefined, refusal),
          false,
        )
      : undispatched("implementation_exception", "authority_verification", "thrown", new TypeError(refusal.reason));
  }
  let authorityValid = false;
  let authorityThrew = false;
  let authorityError: unknown;
  try {
    authorityValid = await input.verifyAuthority() &&
      sha256Canonical(input.value) === inputDigest &&
      (resolution.implementationRef !== REQUIREMENT_HANDOFF_IDS.implementationRef ||
        (input.occurrence.requirementHandoffBasis !== undefined &&
         input.occurrence.requirementHandoffBasis.cCall.cCallRef === input.occurrence.cCallRef &&
         projectRequirementHandoffCandidate(input.occurrence.requirementHandoffBasis, input.value) !== null)) &&
      (!SEMANTIC_IMPLEMENTATION_REFS.includes(resolution.implementationRef) ||
        (input.occurrence.semanticStageBasis !== undefined &&
          ((input.occurrence.semanticStageBasis.lifecyclePublication ?? input.occurrence.semanticStageBasis.publication).semanticJobLifecycle !== undefined
            ? authenticateOwnedSemanticJobBasis(input.occurrence.semanticStageBasis) : authenticateOwnedSemanticStageBasis(input.occurrence.semanticStageBasis)) !== null)) &&
      (!WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS.includes(resolution.implementationRef) ||
        (input.occurrence.worksitePreservedResultBasis !== undefined &&
          input.occurrence.worksitePreservedResultBasis.cCall.cCallRef === input.occurrence.cCallRef &&
          authenticateWorksitePreservedResultBasis(input.occurrence.worksitePreservedResultBasis) !== null)) &&
      (!carriesWorksiteAuthority ||
        isLeafExecutionAuthority(input.occurrence.executionAuthority));
  } catch (error) {
    authorityValid = false;
    authorityThrew = true;
    authorityError = error;
  }
  if (!authorityValid) {
    return resolution.computeRegime === "F_D"
      ? closedDeterministicOwnerReceipt(
          deterministicFailure("implementation_exception", "authority_verification",
            authorityThrew ? "thrown" : "refused", authorityError),
          false,
        )
      : undispatched("implementation_exception", "authority_verification",
          authorityThrew ? "thrown" : "refused", authorityError);
  }

  if (resolution.computeRegime === "F_D") {
    let implementation: unknown;
    try {
      implementation = await input.loadImplementation();
    } catch (error) {
      return closedDeterministicOwnerReceipt(
        deterministicFailure("implementation_exception", "implementation_load", "thrown", error),
        false,
      );
    }
    if (typeof implementation !== "function") {
      return closedDeterministicOwnerReceipt(
        deterministicFailure("implementation_exception", "implementation_load", "missing_export"),
        false,
      );
    }
    let implementationOutput: unknown;
    try {
      implementationOutput = await implementation(
        input.value,
        input.occurrence,
        resolution,
        inputDigest,
        nativeLeafProofOperations(resolution.implementationRef, input.value, input.occurrence, input.historicalSource, input.qualificationResources, input.qualificationPreparation),
      );
    } catch (error) {
      return closedDeterministicOwnerReceipt(
        deterministicFailure("implementation_exception", "implementation_invocation", "thrown", error),
        false,
      );
    }
    return closedDeterministicOwnerReceipt(
      malformedOrAdmitted(implementationOutput, "F_D", "implementation_invocation"),
      true,
    );
  }

  let workerContracts: Readonly<WorkerContracts> | null;
  try {
    workerContracts = input.resolveWorkerContracts(resolution, input.value);
  } catch (error) {
    return undispatched("implementation_exception", "worker_contract_resolution", "thrown", error);
  }
  if (workerContracts === null) {
    return undispatched("implementation_exception", "worker_contract_resolution", "missing_contracts");
  }
  let implementation: unknown;
  try {
    implementation = await input.loadImplementation();
  } catch (error) {
    return undispatched("implementation_exception", "implementation_load", "thrown", error);
  }
  if (typeof implementation !== "function") {
    return undispatched("implementation_exception", "implementation_load", "missing_export");
  }
  const actorPreparation = prepareActorProcessInvocation(input.value, input.occurrence, input.contractByRef, input.dispatchEligibility);
  let preparedOutput: unknown;
  try {
    preparedOutput = await implementation(
      input.value,
      input.occurrence,
      actorPreparation.prepareInstructionAssembly,
      [WORKSITE_COMMAND_EXECUTION_IDS.implementationRef as string, WORKSITE_REVISION_IDS.implementationRef].includes(resolution.implementationRef)
        ? nativeOccurrenceVerifier(input.occurrence) : undefined,
      nativeLeafProofOperations(resolution.implementationRef, input.value, input.occurrence, input.historicalSource, input.qualificationResources, input.qualificationPreparation),
    );
  } catch (error) {
    return undispatched("implementation_exception", "preparation", "thrown", error);
  }
  if (!isPreparedProbabilisticLeafInvocation(preparedOutput)) {
    return undispatched("malformed_return", "preparation", "malformed_preparation");
  }
  const prepared = preparedOutput;
  return deepFreeze({
    kind: "prepared_probabilistic_leaf_owner_invocation" as const,
    invokeActorProcess: actorPreparation.invokeActorProcess,
    schemaVersion: "5.0.0" as const,
    workerRequest: prepared.workerRequest,
    workerContracts,
    complete(exchange) {
      let completedOutput: unknown;
      try {
        completedOutput = prepared.complete(exchange);
      } catch (error) {
        return closedProbabilisticOwnerReceipt(
          deterministicFailure("implementation_exception", "implementation_completion", "thrown", error),
          workerContracts,
          exchange,
        );
      }
      const finalize = (candidateOutput: unknown) =>
        closedProbabilisticOwnerReceipt(
          malformedOrAdmitted(candidateOutput, "F_P", "implementation_completion"),
          workerContracts,
          exchange,
        );
      if (completedOutput instanceof Promise) {
        return completedOutput.then(finalize, (error: unknown) =>
          closedProbabilisticOwnerReceipt(
            deterministicFailure("implementation_exception", "implementation_completion", "rejected", error),
            workerContracts,
            exchange,
          ));
      }
      return finalize(completedOutput);
    },
  }) satisfies Readonly<PreparedProbabilisticLeafOwnerInvocation>;
}

export function isAdmittedLeafInvocationPort(value: object): boolean {
  const candidate = value as Partial<LeafInvocationPort>;
  let exactLoadedCapability = false;
  try {
    exactLoadedCapability =
      typeof candidate.isExactLoadedCapability === "function" &&
      candidate.isExactLoadedCapability.call(value) === true;
  } catch {
    exactLoadedCapability = false;
  }
  return exactLoadedCapability &&
    candidate.kind === "admitted_leaf_invocation_port" &&
    Array.isArray(candidate.ownerInstallIds) &&
    candidate.ownerInstallIds.length > 0 &&
    candidate.ownerInstallIds.every(
      (installId) => typeof installId === "string" && installId.length > 0,
    ) &&
    typeof candidate.implementationSetRef === "string" &&
      candidate.implementationSetRef.length > 0 &&
    typeof candidate.implementationSetDigest === "string" &&
      candidate.implementationSetDigest.startsWith("sha256:") &&
    Array.isArray(candidate.publicationDigests) &&
    candidate.publicationDigests.length > 0 &&
    candidate.publicationDigests.every(
      (digest) => typeof digest === "string" && digest.startsWith("sha256:"),
    ) &&
    typeof candidate.hasOwnerCapability === "function" &&
    typeof candidate.isAdmittedResolution === "function" &&
    typeof candidate.forGraphFunction === "function" &&
    typeof candidate.graphFunctionByRef === "function" &&
    typeof candidate.closureContractByRef === "function" &&
    typeof candidate.contractValueKindByRef === "function" &&
    typeof candidate.validateContractValueByRef === "function" &&
    typeof candidate.contractValueKind === "function" &&
    typeof candidate.validateContractValue === "function" &&
    typeof candidate.resolveJudgmentRelation === "function" &&
    typeof candidate.validateResultEvidenceLineage === "function" &&
    typeof candidate.verifyProbabilisticResultContractPreimage === "function" &&
    typeof candidate.invoke === "function";
}

function exactOwnerPublication(
  resolution: LoadedLeafExecutionAuthority,
  coordinate: ExecutionDeclarationOwnerCoordinate,
): Readonly<ModulePublication> | null {
  const matches = resolution.declarationPublications.filter((publication) =>
    publication.owningProductId === coordinate.productId &&
    publication.moduleRef === coordinate.moduleRef &&
    modulePublicationSemanticDigest(publication) ===
      coordinate.publicationDigest
  );
  return matches.length === 1 ? matches[0]! : null;
}

function exactOwnerInstall(
  resolution: LoadedLeafExecutionAuthority,
  coordinate: ExecutionDeclarationOwnerCoordinate,
): LeafInvocationInstall | null {
  const matches = resolution.ownerInstalls.filter((install) =>
    install.installId === coordinate.installId &&
    install.productId === coordinate.productId
  );
  return matches.length === 1 ? matches[0]! : null;
}

function exactOwnerBinding(
  resolution: LoadedLeafExecutionAuthority,
  coordinate: ExecutionDeclarationOwnerCoordinate,
): Readonly<{
  install: LeafInvocationInstall;
  publication: Readonly<ModulePublication>;
}> | null {
  const install = exactOwnerInstall(resolution, coordinate);
  const publication = exactOwnerPublication(resolution, coordinate);
  return install !== null && publication !== null &&
      install.productContentDigest === publication.productContentDigest &&
      install.manifestDigest === publication.productManifestDigest
    ? { install, publication }
    : null;
}

// Optional identity evidence for these two immutable declaration lookups only.
// Foreign/raw callbacks always retain a fresh physical acquisition.
function isFixedDeclarationData(value: unknown, seen = new Set<object>()): boolean {
  if (typeof value === "function") return false;
  if (typeof value !== "object" || value === null) return true;
  if (types.isProxy(value) || !Object.isFrozen(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) return false;
  if (seen.has(value)) return true;
  seen.add(value);
  return Reflect.ownKeys(value).every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    return "value" in descriptor && isFixedDeclarationData(descriptor.value, seen);
  });
}

const declarationLookupPairs = new WeakMap<object, object>();
export function hasOwnedDeclarationLookups(
  graphFunctionByRef: object, closureContractByRef: object,
): boolean {
  return declarationLookupPairs.get(graphFunctionByRef) === closureContractByRef;
}

type AdmittedLeafPortAuthority<P> = {
  readonly historicalSource?: AbgHistoricalGraphCallSourceResource;
  readonly qualificationResources?: QualificationResources;
  readonly prefix: P;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly implementationSet: AdmittedImplementationSet;
  readonly executionResolution: LoadedLeafExecutionAuthority;
  readonly semanticsProjection: InstalledLeafSemanticsProjection;
  readonly graphFunctionRef?: string;
};
export function constructAdmittedLeafInvocationPort(authority: AdmittedLeafPortAuthority<ValidatedRuntimeEventPrefix>): Promise<LeafInvocationPort>;
/** @internal The owner's own prefix, owned or validated. */
export function constructAdmittedLeafInvocationPort(authority: AdmittedLeafPortAuthority<RuntimeEventPrefix>): Promise<LeafInvocationPort>;
export async function constructAdmittedLeafInvocationPort(authority: AdmittedLeafPortAuthority<RuntimeEventPrefix>): Promise<LeafInvocationPort> {
  const inspected = inspectProductLeafSemanticsProjection(
    authority.semanticsProjection,
  );
  const selectedGraphFunctionRef = authority.graphFunctionRef ??
    authority.executionResolution.declarationClosure.selectedGraphFunctionRef;
  const semanticsOwner = graphFunctionSemanticsOwner(authority.executionResolution.declarationClosure, selectedGraphFunctionRef, coordinate => exactOwnerBinding(authority.executionResolution, coordinate));
  if (semanticsOwner === null) throw new TypeError("leaf semantics lacks its declared GraphFunction owner");
  const semanticsBinding = exactOwnerBinding(
    authority.executionResolution,
    semanticsOwner,
  );
  const everyOwnerIsAdmitted = authority.executionResolution.ownerInstalls
    .every((install) =>
      hasAdmittedProductInstall(authority.artifactTruth, install)
    );
  if (
    inspected === null ||
    semanticsBinding === null ||
    !everyOwnerIsAdmitted ||
    !hasAdmittedImplementationSetAtPrefix(
      authority.prefix,
      authority.implementationSet,
    ) ||
    inspected.projection.installId !== semanticsBinding.install.installId ||
    inspected.projection.productContentDigest !==
      semanticsBinding.install.productContentDigest ||
    inspected.projection.manifestDigest !==
      semanticsBinding.install.manifestDigest ||
    inspected.projection.publicationDigest !==
      semanticsOwner.publicationDigest ||
    inspected.projection.bindingRef !== semanticsOwner.declarationRef ||
    inspected.projection.packageName !==
      semanticsBinding.install.packageName ||
    inspected.projection.packageVersion !==
      semanticsBinding.install.packageVersion ||
    !(await inspected.runtime.verifyInstalledContent())
  ) {
    throw new TypeError(
      "leaf invocation port requires the exact owner-selected admitted execution closure",
    );
  }
  const semantics = inspected.runtime;
  const modules = new Map<string, Promise<Record<string, unknown>>>();
  // A judgment-time relation evaluates under the semantics owner's install.
  // Catalogs are admitted once per owner install identity per process
  // (`admitQualificationCatalogsOnce`); a refused admission is not retained.
  const judgmentCatalogs = () => {
    const admission = admitQualificationCatalogsOnce(semanticsBinding.install);
    return admission.kind === "admitted" ? admission.value : null;
  };

  function uniqueContractByRef(contractRef: string) {
    const ownerMatches = authority.executionResolution.declarationClosure
      .contractOwners.filter((owner) => owner.declarationRef === contractRef);
    if (ownerMatches.length !== 1) return null;
    const owner = exactOwnerBinding(
      authority.executionResolution,
      ownerMatches[0]!,
    );
    if (owner === null) return null;
    const matches = owner.publication.contracts.filter(
      (contract) => contract.contractRef === contractRef,
    );
    const contract = matches.length === 1 ? matches[0] : undefined;
    return contract !== undefined && contract.valueKind.length > 0
      ? contract
      : null;
  }

  function contractForLeafSlot(contractRef: string, contractKind: "failure" | "output") {
    const contract = uniqueContractByRef(contractRef);
    if (contract === null) return null;
    // C<A,B> binds its output carrier by exact admitted reference. Its original
    // declaration may also serve as another stage's input; failure stays distinct.
    return contractKind === "output"
      ? authority.implementationSet.rows.some((row) => row.outputContractRef === contractRef)
        ? contract
        : null
      : contract.contractKind === "failure" ? contract : null;
  }

  function graphFunctionByRef(graphFunctionRef: string) {
    const ownerMatches = authority.executionResolution.declarationClosure
      .graphFunctionOwners.filter(
        (owner) => owner.declarationRef === graphFunctionRef,
      );
    if (ownerMatches.length !== 1) return null;
    const owner = exactOwnerBinding(
      authority.executionResolution,
      ownerMatches[0]!,
    );
    if (owner === null) return null;
    const matches = owner.publication.graphFunctions.filter(
      (candidate) => candidate.name === graphFunctionRef,
    );
    return matches.length === 1 ? matches[0]! : null;
  }

  function closureContractByRef(closureContractRef: string) {
    const ownerMatches = authority.executionResolution.declarationClosure
      .closureContractOwners.filter(
        (owner) => owner.declarationRef === closureContractRef,
      );
    if (ownerMatches.length !== 1) return null;
    const owner = exactOwnerBinding(
      authority.executionResolution,
      ownerMatches[0]!,
    );
    if (owner === null) return null;
    const matches = owner.publication.closureContracts.filter(
      (candidate) =>
        candidate.closureContractRef === closureContractRef,
    );
    return matches.length === 1 ? matches[0]! : null;
  }

  function implementationOwner(
    resolution: AdmittedImplementationSet["rows"][number],
  ): Readonly<{
    coordinate: ExecutionDeclarationOwnerCoordinate;
    install: LeafInvocationInstall;
    publication: Readonly<ModulePublication>;
  }> | null {
    const coordinates = authority.executionResolution.declarationClosure
      .implementationBindingOwners.filter((coordinate) =>
        coordinate.declarationRef === resolution.implementationBindingRef &&
        coordinate.productId === resolution.implementationOwnerProductId &&
        coordinate.publicationDigest ===
          resolution.implementationPublicationDigest
      );
    if (coordinates.length !== 1) return null;
    const binding = exactOwnerBinding(
      authority.executionResolution,
      coordinates[0]!,
    );
    if (binding === null) return null;
    const publishedBindings = binding.publication.implementationBindings.filter(
      (candidate) =>
        candidate.bindingRef === resolution.implementationBindingRef &&
        candidate.implementationRef === resolution.implementationRef &&
        candidate.packageName === resolution.packageName &&
        candidate.packageVersion === resolution.packageVersion &&
        candidate.modulePath === resolution.modulePath &&
        candidate.namedSymbol === resolution.namedSymbol,
    );
    return publishedBindings.length === 1 &&
        binding.install.packageName === resolution.packageName &&
        binding.install.packageVersion === resolution.packageVersion
      ? { coordinate: coordinates[0]!, ...binding }
      : null;
  }

  async function loadModule(
    resolution: AdmittedImplementationSet["rows"][number],
  ): Promise<Record<string, unknown>> {
    const owner = implementationOwner(resolution);
    if (owner === null) {
      throw new TypeError("leaf implementation lacks its selected owner");
    }
    const exactPath = resolve(owner.install.installedRoot, resolution.modulePath);
    if (!pathStrictlyWithin(pathRelation(owner.install.installedRoot, exactPath))) {
      throw new TypeError("leaf implementation module escapes the admitted Product install");
    }
    let loaded = modules.get(exactPath);
    if (loaded === undefined) {
      loaded = import(pathToFileURL(exactPath).href) as Promise<Record<string, unknown>>;
      modules.set(exactPath, loaded);
    }
    return loaded;
  }

  function exactAdmittedResolution(
    resolution: Readonly<LeafInvocationResolution>,
  ): AdmittedImplementationSet["rows"][number] | null {
    const resolutionDigest = sha256Canonical(
      resolution,
    );
    const matches = authority.implementationSet.rows.filter(
      (row) =>
        sha256Canonical(row) === resolutionDigest,
    );
    return matches.length === 1 ? matches[0]! : null;
  }

  // Only the canonical assessment's inner response dependency, through the one
  // shared relation over this resolution's authenticated Catalog, admitted
  // installs and Catalog lock, and the loaded execution resolution's exact
  // Program coordinate and publication as the declaration of use. Static
  // contract lookup stays closure-scoped.
  function nativeAssessmentDependency(
    selection: NativeWorkspaceAssessmentSelection,
    resolution: Readonly<LeafInvocationResolution>,
  ) {
    try {
      const admitted = exactAdmittedResolution(resolution);
      const { admittedCatalog: catalog, admittedInstalls: installs, resolution: loaded,
        programPublication, declarationClosure } = authority.executionResolution;
      if (admitted === null || admitted.computeRegime !== "F_P" || admitted.implementationRef !== nativeIds.implementationRef ||
        admitted.graphFunctionRef !== nativeIds.assessmentGraphFunctionRef ||
        declarationClosure.programRef !== loaded.programRef ||
        !canonicalEquals(declarationClosure.programPublication, programPublication)) return null;
      const dependency = resolveNativeWorkspaceAssessmentDependency(selection, { publications: catalog.boundPublications,
        installs, resolvedLock: catalog.readinessBasis.resolvedLock, assessorOwnerProductId: admitted.graphFunctionOwnerProductId,
        program: { publication: programPublication, programRef: loaded.programRef, programDigest: loaded.programDigest } });
      return dependency !== null && dependency.use.install.installId === loaded.programOwner.installId &&
        hasAdmittedProductInstall(authority.artifactTruth, dependency.install) &&
        hasAdmittedProductInstall(authority.artifactTruth, dependency.use.install) ? dependency : null;
    } catch { return null; }
  }

  // The leaf port's pre-check of a worksite leaf's authority: the native work
  // task's own check here, and the worksite leaf gate for file replace and
  // file parents, with this port's owner, graph function and set.
  function hasExactWorksiteLeafExecutionAuthority(
    call: Parameters<LeafInvocationPort["invoke"]>[0],
    resolution: AdmittedImplementationSet["rows"][number],
  ): boolean {
    const executionAuthority = call.occurrence.executionAuthority;
    const parents = isWorksiteFileParentsRequest(call.input);
    const native = isNativeWorkspaceWorkTask(call.input);
    if (
      (!native && !parents && !isWorksiteFileReplaceRequest(call.input)) ||
      !isLeafExecutionAuthority(executionAuthority)
    ) {
      return false;
    }
    const owner = implementationOwner(resolution);
    const graphFunction = graphFunctionByRef(resolution.graphFunctionRef);
    if (owner === null || graphFunction === null) return false;

    if (!native) {
      const port = { resolution, owner, graphFunction, implementationSet: authority.implementationSet };
      const common = { authority: executionAuthority, occurrence: call.occurrence, resolution, inputDigest: call.inputDigest, port };
      const gate = parents
        ? openWorksiteLeafGate({ ...common, effect: "file_parents", request: call.input })
        : openWorksiteLeafGate({ ...common, effect: "file_replace", request: call.input });
      // The reads come first, so a read that throws is the recorded cause.
      return gate.current(validateWorksiteFileParentsPlanAtPrefix) !== null && gate.coordinates() && gate.remaining();
    }
    let authorityPrefix: RuntimeEventPrefix;
    let runtimePrefix: RuntimeEventPrefix;
    try {
      authorityPrefix = readOwnedRuntimeEventPrefixAtDurablePrefix(
        executionAuthority.predecessorPrefix,
        { requireCurrent: true },
      );
      runtimePrefix = selectRuntimeEventPrefixFromAuthority(authorityPrefix, {
        runId: executionAuthority.cCall.runId,
      });
    } catch {
      return false;
    }
    const invocation = rehydrateInvocationAdmissionAtPrefix(authorityPrefix, executionAuthority.executionBasis.invocationAdmissionRef);
    return invocation !== null && invocation.capabilityGrants.some(grant =>
      call.input.capabilityGrant !== undefined && canonicalEquals(grant, call.input.capabilityGrant)) &&
    nativeWorkspaceWorkAuthorityMatches(call.input, executionAuthority) &&
    graphFunction.name === nativeWorkspaceWorkGraphFunctionRef(call.input) && graphFunction.effects.includes(nativeIds.effectUri) &&
    projectCCallCarrierPhaseAtPrefix(runtimePrefix, executionAuthority.cCall)?.phase === "selected_no_evidence" &&
    hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionAuthority.executionBasis) &&
    hasAdmittedImplementationSetAtPrefix(authorityPrefix, executionAuthority.implementationSet) &&
    sha256Canonical(resolution) === executionAuthority.implementationResolutionDigest &&
    call.occurrence.cCallRef === executionAuthority.cCallRef &&
    call.occurrence.runId === executionAuthority.cCall.runId &&
    call.occurrence.graphCallId === executionAuthority.cCall.graphCallId &&
    call.occurrence.frameId === executionAuthority.cCall.frameId &&
    call.occurrence.programLocusRef === executionAuthority.cCall.programLocusRef &&
    call.occurrence.taskOrdinal === executionAuthority.cCall.taskOrdinal &&
    call.occurrence.attempt === executionAuthority.cCall.attempt;
  }

  function resolveWorkerContracts(
    resolution: Readonly<LeafInvocationResolution>,
    input: Readonly<Record<string, JsonValue>>,
  ): Readonly<WorkerContracts> | null {
    const admittedResolution = exactAdmittedResolution(resolution);
    if (admittedResolution === null) return null;
    return semantics.resolveProbabilisticWorkerContracts({
      inputContractRef: admittedResolution.inputContractRef,
      outputContractRef: admittedResolution.outputContractRef,
      input,
    });
  }

  function verifyContractPreimage(
    receiver: unknown,
    input: Parameters<LeafInvocationPort["verifyProbabilisticResultContractPreimage"]>[0],
    verified: Parameters<LeafInvocationPort["revalidateProbabilisticResultContractPreimage"]>[1] | null,
  ): Readonly<ProbabilisticResultContractPreimageVerification> {
    try {
      const admittedResolution = exactAdmittedResolution(input.resolution);
      if (
        receiver !== port ||
        !isAdmittedLeafInvocationPort(port) ||
        input.resolution.computeRegime !== "F_P" ||
        !everyOwnerIsAdmitted ||
        !hasAdmittedImplementationSetAtPrefix(
          authority.prefix,
          authority.implementationSet,
        ) ||
        admittedResolution === null
      ) {
        return preimageRefusal("unadmitted_resolution");
      }
      if (
        sha256Canonical(input.input) !==
          input.inputDigest ||
        !port.validateContractValueByRef(
          input.resolution.inputContractRef,
          input.input,
        )
      ) {
        return preimageRefusal("input_contract_refused");
      }
      const workerContracts = resolveWorkerContracts(
        input.resolution,
        input.input,
      );
      if (
        workerContracts === null ||
        workerContracts.instructionContractRef !==
          input.instructionContractRef ||
        workerContracts.resultContractRef !== input.rawResultContractRef
      ) {
        return preimageRefusal("contract_identity_mismatch");
      }
      const assessment = admittedResolution.implementationRef === nativeIds.implementationRef && isNativeWorkspaceWorkTask(input.input)
        ? input.input.assessment : undefined;
      const assessmentSchema = assessment === undefined || workerContracts.resultContractRef !== assessment.resultContract.contractRef
        ? null : nativeAssessmentDependency(assessment, input.resolution)?.schema ?? null;
      const rawValid = assessment === undefined
        ? verified !== null || port.validateContractValueByRef(workerContracts.resultContractRef, input.rawResult)
        : admittedResolution.implementationRef === nativeIds.implementationRef && assessmentSchema !== null &&
          (verified !== null || parseNativeWorkspaceAssessmentResult(assessmentSchema, JSON.stringify(input.rawResult)) !== null);
      if (!rawValid) {
        return preimageRefusal("result_contract_refused");
      }
      const owner = implementationOwner(admittedResolution);
      if (owner === null) {
        return preimageRefusal("unadmitted_resolution");
      }
      const body = deepFreeze({
        contractCapabilityBasis: {
          installId: owner.install.installId,
          implementationSetRef: port.implementationSetRef,
          implementationSetDigest: port.implementationSetDigest,
          publicationDigest: owner.coordinate.publicationDigest,
        },
        implementationResolutionDigest: sha256Canonical(
          admittedResolution,
        ),
        implementationRef: admittedResolution.implementationRef,
        inputContractRef: admittedResolution.inputContractRef,
        targetOutputContractRef: admittedResolution.outputContractRef,
        instructionContractRef: workerContracts.instructionContractRef,
        rawResultContractRef: workerContracts.resultContractRef,
        inputDigest: input.inputDigest,
        rawResultDigest: sha256Canonical(
          input.rawResult,
        ),
      });
      const verificationDigest = sha256Canonical(body);
      const result = deepFreeze({
        kind: "verified_probabilistic_result_contract_preimage" as const,
        schemaVersion: "5.0.0" as const,
        verificationRef:
          `probabilistic-result-contract-preimage://abiogenesis/${verificationDigest.slice("sha256:".length)}`,
        verificationDigest,
        ...body,
      });
      return verified === null || canonicalEquals(verified, result)
        ? result : preimageRefusal("contract_identity_mismatch");
    } catch {
      return preimageRefusal("owner_boundary_exception");
    }
  }
  const qualificationPreparations = new Map<string, PreparedQualificationAssessment>();
  const preparationOf = (value: unknown) => isRecord(value) && isRecord(value.source) && typeof value.source.cCallRef === "string" ? qualificationPreparations.get(value.source.cCallRef) : undefined;
  const port = Object.freeze({
    kind: "admitted_leaf_invocation_port" as const,
    isExactLoadedCapability(): boolean {
      return this === port;
    },
    ownerInstallIds: Object.freeze(
      authority.executionResolution.ownerInstalls.map(
        (install) => install.installId,
      ),
    ),
    implementationSetRef: authority.implementationSet.implementationSetRef,
    implementationSetDigest: authority.implementationSet.implementationSetDigest,
    publicationDigests: Object.freeze(
      authority.executionResolution.declarationPublications.map(
        modulePublicationSemanticDigest,
      ),
    ),
    hasOwnerCapability(
      installId: string,
      publicationDigest: `sha256:${string}`,
    ): boolean {
      return authority.executionResolution.declarationClosure.publications.some(
        (publication) =>
          modulePublicationSemanticDigest(publication) === publicationDigest &&
          authority.executionResolution.ownerInstalls.some((install) =>
            install.installId === installId &&
            install.productId === publication.owningProductId &&
            install.productContentDigest === publication.productContentDigest &&
            install.manifestDigest === publication.productManifestDigest &&
            hasAdmittedProductInstall(authority.artifactTruth, install)
          ),
      );
    },
    isAdmittedResolution(
      resolution: Readonly<LeafInvocationResolution>,
    ): boolean {
      return exactAdmittedResolution(resolution) !== null;
    },
    async forGraphFunction(graphFunctionRef: string): Promise<LeafInvocationPort | null> {
      if (this !== port) return null;
      if (graphFunctionRef === selectedGraphFunctionRef) return port;
      const selectedOwner = graphFunctionSemanticsOwner(authority.executionResolution.declarationClosure, graphFunctionRef, coordinate => exactOwnerBinding(authority.executionResolution, coordinate));
      const selected = selectedOwner === null ? null : exactOwnerBinding(authority.executionResolution, selectedOwner);
      if (selected === null) return null;
      try {
        const provider = await loadInstalledProductSemantics({
          install: selected.install, publicationDigest: selectedOwner!.publicationDigest,
          productSemanticsBinding: selected.publication.productSemanticsBinding,
          verifyInstallAdmission: install => hasAdmittedProductInstall(authority.artifactTruth, install),
        });
        return await constructAdmittedLeafInvocationPort({ ...authority, graphFunctionRef,
          semanticsProjection: projectInstalledLeafSemantics(provider) });
      } catch { return null; }
    },
    sourcePublicationByDeclarationRef(declarationRef: string) {
      const matches = authority.executionResolution.declarationClosure.publications.filter(p => p.requirementHandoffs?.some(d => d.declarationRef === declarationRef));
      if (matches.length !== 1) return null;
      const publication = matches[0]!;
      const source = publication.requirementHandoffs!.find(d => d.declarationRef === declarationRef)!;
      const coordinates = authority.executionResolution.declarationClosure.graphFunctionOwners.filter(c => c.declarationRef === source.graphFunctionRef && c.moduleRef === publication.moduleRef);
      if (coordinates.length !== 1) return null;
      const bound = exactOwnerBinding(authority.executionResolution, coordinates[0]!);
      return bound !== null && canonicalEquals(bound.publication, publication) ? bound.publication : null;
    },
    semanticPublicationByDeclarationRef(declarationRef: string) {
      const matches = authority.executionResolution.declarationClosure.publications.filter(p => (p.semanticLifecycle ?? p.semanticJobLifecycle)?.declarationRef === declarationRef);
      if (matches.length !== 1) return null;
      const publication = matches[0]!;
      const lifecycle = publication.semanticLifecycle ?? publication.semanticJobLifecycle!;
      const functionRefs = [...lifecycle.stages.map(stage => stage.graphFunctionRef),
        ...(publication.semanticJobLifecycle === undefined ? [] : [publication.semanticJobLifecycle.intakeGraphFunctionRef])];
      for (const graphFunctionRef of functionRefs) {
        const coordinates = authority.executionResolution.declarationClosure.graphFunctionOwners.filter(c =>
          c.declarationRef === graphFunctionRef && c.moduleRef === publication.moduleRef);
        if (coordinates.length !== 1) return null;
        const bound = exactOwnerBinding(authority.executionResolution, coordinates[0]!);
        if (bound === null || !canonicalEquals(bound.publication, publication)) return null;
      }
      return publication;
    },
    contractByRef: uniqueContractByRef,
    contractPublicationByRef(contractRef: string) {
      const rows = authority.executionResolution.declarationClosure.contractOwners.filter(owner => owner.declarationRef === contractRef);
      return rows.length === 1 ? exactOwnerBinding(authority.executionResolution, rows[0]!)?.publication ?? null : null;
    },
    nativeAssessmentDependency,
    declarationGraphFunctions() {
      return Object.freeze(authority.executionResolution.declarationClosure.graphFunctionOwners.map(owner => graphFunctionByRef(owner.declarationRef))
        .filter((g): g is Readonly<GraphFunction> => g !== null));
    },
    graphFunctionByRef,
    closureContractByRef,
    contractValueKindByRef(contractRef: string): string | null {
      return uniqueContractByRef(contractRef)?.valueKind ?? null;
    },
    validateContractValueByRef(
      contractRef: string,
      value: unknown,
    ): value is Readonly<Record<string, JsonValue>> {
      const contract = uniqueContractByRef(contractRef);
      return contract !== null &&
        semantics.validateContractValue(contract.valueKind, value);
    },
    contractValueKind(
      contractRef: string,
      contractKind: "failure" | "output",
    ): string | null {
      return contractForLeafSlot(contractRef, contractKind)?.valueKind ?? null;
    },
    validateContractValue(
      contractRef: string,
      contractKind: "failure" | "output",
      value: unknown,
    ): value is Readonly<Record<string, JsonValue>> {
      const valueKind = contractForLeafSlot(contractRef, contractKind)?.valueKind;
      return valueKind !== undefined &&
        semantics.validateContractValue(valueKind, value);
    },
    resolveJudgmentRelation(predicateRef: string) {
      const relation = semantics.resolveJudgmentRelation(predicateRef);
      if (relation === null) return null;
      return Object.freeze({ ...relation,
        evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate) =>
          relation.evaluate(input, output, currentOwnerPrefix,
            nativeJudgmentProofOperations(predicateRef, input, output, currentOwnerPrefix, authority.historicalSource, authority.qualificationResources, preparationOf(output), judgmentCatalogs)),
      });
    },
    validateResultEvidenceLineage(
      outputContractRef: string,
      value: Readonly<Record<string, JsonValue>>,
      admittedEvidence: readonly ResultEvidenceLineage[],
    ) {
      return semantics.validateResultEvidenceLineage({
        outputContractRef,
        value,
        admittedEvidence,
        nativeProof: nativeJudgmentProofOperations(qualificationIds.assessPredicate, preparationOf(value)?.input, value, undefined, authority.historicalSource, authority.qualificationResources, preparationOf(value), judgmentCatalogs),
      });
    },
    verifyProbabilisticResultContractPreimage(input: Parameters<LeafInvocationPort["verifyProbabilisticResultContractPreimage"]>[0]) {
      return verifyContractPreimage(this, input, null);
    },
    revalidateProbabilisticResultContractPreimage(
      input: Parameters<LeafInvocationPort["verifyProbabilisticResultContractPreimage"]>[0],
      verified: Parameters<LeafInvocationPort["revalidateProbabilisticResultContractPreimage"]>[1],
    ) {
      return verifyContractPreimage(this, input, verified);
    },
    async invoke(
      call: Parameters<LeafInvocationPort["invoke"]>[0],
    ): Promise<Readonly<LeafInvocationOwnerResult>> {
      try {
        if (this !== port) return ownerRefusal("owner_boundary_exception");
        const admittedResolution = exactAdmittedResolution(call.resolution);
        if (
          admittedResolution === null ||
          call.failureContractRef !== admittedResolution.failureContractRef
        ) {
          return ownerRefusal("owner_boundary_exception");
        }
        const failureValueKind = port.contractValueKind(
          admittedResolution.failureContractRef,
          "failure",
        );
        if (failureValueKind === null) {
          return ownerRefusal("failure_contract_absent");
        }
        const isSelfQualification = admittedResolution.implementationRef === SELF_CONFORMANCE_IDS.implementationRef;
        const isQualification = QUALIFICATION_IMPLEMENTATION_REFS.includes(admittedResolution.implementationRef);
        // The authority stage's first step for a qualification leaf: one read of
        // both catalogs from the owner install's root, admitted against what that
        // verified install records. A refusal is decided at the stage; the owner
        // projection and the F_P preparation follow an admission and take it. With
        // no owner install the stage refuses as it always has.
        const catalogOwner = isQualification ? implementationOwner(admittedResolution) : null;
        const catalogAdmission = catalogOwner === null ? null : admitQualificationCatalogsOnce(catalogOwner.install);
        const qualificationCatalogs = catalogAdmission?.kind === "admitted" ? catalogAdmission.value : undefined;
        const authorityRefusal = catalogAdmission?.kind === "refused" ? { at: catalogAdmission.at, reason: catalogAdmission.reason } : undefined;
        const qualificationOwnerBasis = isQualification && call.predecessorPrefix !== undefined
          ? { predecessorPrefix: call.predecessorPrefix, cCallRef: call.occurrence.cCallRef } : null;
        const qualificationOwner = qualificationOwnerBasis === null || qualificationCatalogs === undefined ? null : isSelfQualification
          ? resolveSelfConformanceOwner(qualificationOwnerBasis, call.input, true, authority.qualificationResources, qualificationCatalogs)
          : projectQualificationConsumer(qualificationOwnerBasis, call.input, true, authority.qualificationResources, qualificationCatalogs);
        if (isQualification && qualificationCatalogs !== undefined && qualificationOwner === null) return ownerRefusal("owner_boundary_exception");
        const qualificationPreparation = admittedResolution.implementationRef === qualificationIds.assessImplementation &&
            qualificationCatalogs !== undefined && isQualificationAssessmentInput(call.input, qualificationCatalogs)
          ? prepareQualificationAssessment(call.input, authority.qualificationResources, qualificationCatalogs) : undefined;
        if (qualificationPreparation !== undefined) qualificationPreparations.set(call.occurrence.cCallRef, qualificationPreparation);
        // The assessment's dispatch eligibility is bound here to this exact
        // authenticated call; actor_process applies it to the prepared selection.
        const dispatchEligibility = admittedResolution.implementationRef === qualificationIds.assessImplementation &&
            qualificationOwnerBasis !== null && qualificationOwner !== null && qualificationCatalogs !== undefined
          ? qualificationAssessorEligibility(qualificationOwnerBasis, call.input, authority.qualificationResources, qualificationCatalogs) : undefined;
        const qualifiedOccurrence = qualificationOwnerBasis === null ? call.occurrence : deepFreeze({ ...call.occurrence, qualificationOwnerBasis,
          ...(qualificationCatalogs === undefined ? {} : { qualificationCatalogs }) });
        const occurrence = admittedResolution.implementationRef !== reacquireIds.implementationRef || call.predecessorPrefix === undefined ? qualifiedOccurrence
          : deepFreeze({ ...qualifiedOccurrence, nativeWorkReacquisitionBasis: { predecessorPrefix: call.predecessorPrefix, cCallRef: call.occurrence.cCallRef } });
        // A native task may also be ordinary data for a pure consumer leaf.
        const requiresWorksiteAuthority =
          admittedResolution.implementationRef === nativeIds.implementationRef || isWorksiteFileReplaceRequest(call.input) || isWorksiteFileParentsRequest(call.input) ||
          call.occurrence.executionAuthority !== null;
        return invokeLeafOwnerBoundary({
          ...(authority.historicalSource === undefined ? {} : { historicalSource: authority.historicalSource }),
          ...(authority.qualificationResources === undefined ? {} : { qualificationResources: authority.qualificationResources }),
          ...(qualificationPreparation === undefined ? {} : { qualificationPreparation }),
          ...(dispatchEligibility === undefined ? {} : { dispatchEligibility }),
          ...(authorityRefusal === undefined ? {} : { authorityRefusal }),
          resolution: admittedResolution,
          value: call.input,
          inputDigest: call.inputDigest,
          failureValueKind,
          verifyAuthority: async () => {
            const installedContentValid =
              await semantics.verifyInstalledContent();
            return isAdmittedLeafInvocationPort(port) &&
              implementationOwner(admittedResolution) !== null &&
              hasAdmittedImplementationSetAtPrefix(
                authority.prefix,
                authority.implementationSet,
              ) &&
              installedContentValid &&
              (![WORKSITE_COMMAND_EXECUTION_IDS.implementationRef as string, WORKSITE_REVISION_IDS.implementationRef].includes(admittedResolution.implementationRef) ||
                call.predecessorPrefix !== undefined && hasExactWorksiteCommandLeafSourceAtDurablePrefix(
                  call.predecessorPrefix, call.occurrence.cCallRef, call.input)) &&
              (!requiresWorksiteAuthority ||
                hasExactWorksiteLeafExecutionAuthority(
                  call,
                  admittedResolution,
                ));
          },
          validateSuccess: (value) => (!isQualification || (isSelfQualification ? isSelfConformanceResult(value) &&
            canonicalEquals(value.owner, qualificationOwner)
            : qualificationOwner !== null && qualificationResultRelation((qualificationOwner as NonNullable<ReturnType<typeof projectQualificationConsumer>>).call.judgmentPredicateRef, call.input, value, call.predecessorPrefix,
              nativeJudgmentProofOperations((qualificationOwner as NonNullable<ReturnType<typeof projectQualificationConsumer>>).call.judgmentPredicateRef, call.input, value, call.predecessorPrefix, authority.historicalSource, authority.qualificationResources, qualificationPreparation,
                () => qualificationCatalogs ?? null), qualificationCatalogs))) && port.validateContractValue(
            admittedResolution.outputContractRef,
            "output",
            value,
          ),
          contractByRef: uniqueContractByRef,
          resolveWorkerContracts: (_resolution, value) =>
            resolveWorkerContracts(admittedResolution, value),
          occurrence,
          loadImplementation: async () => {
            const module = await loadModule(admittedResolution);
            return module[admittedResolution.namedSymbol];
          },
        });
      } catch {
        return ownerRefusal("owner_boundary_exception");
      }
    },
  }) satisfies LeafInvocationPort;
  // Certify the closure's actual immutable data, not just its callable shape.
  const resolutionDescriptor = types.isProxy(authority)
    ? undefined : Object.getOwnPropertyDescriptor(authority, "executionResolution");
  const resolution = resolutionDescriptor?.value as LoadedLeafExecutionAuthority | undefined;
  if (resolution !== undefined && !types.isProxy(resolution) &&
      Object.isFrozen(authority) && Object.isFrozen(resolution) &&
      ["declarationClosure", "declarationPublications", "ownerInstalls"].every(key => {
        const descriptor = Object.getOwnPropertyDescriptor(resolution, key);
        return descriptor !== undefined && "value" in descriptor && isFixedDeclarationData(descriptor.value);
      })) declarationLookupPairs.set(graphFunctionByRef, closureContractByRef);
  return port;
}
