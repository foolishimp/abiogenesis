import type { ClosureContract, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import {
  type ImplementationResolutionCandidate,
  type JsonValue,
  type Sha256Digest,
} from "../product/index.js";
import { isImplementationResolutionCandidate } from "../product/implementation_resolution.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import {
  isGraphValidation,
  type GraphValidation,
} from "../validator/graph.js";
import {
  isImplementationResolutionValidation,
  type ImplementationResolutionValidation,
} from "../validator/implementation_resolution.js";
import {
  hasAdmittedInvocation,
  type InvocationAdmission,
} from "./invocation_admission.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";

export interface RuntimeAdmissionBasis {
  readonly eventTime: string;
  readonly correlationId: string;
  readonly causationEventRefs: readonly string[];
}

export interface InvocationRefusalAdmission {
  readonly kind: "invocation_refusal_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly refusalRef: string;
  readonly refusalDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly stage: "execution_basis" | "graph_validation" | "implementation_resolution";
  readonly subjectDigest: Sha256Digest;
  readonly contractOrDiagnosticRefs: readonly string[];
  readonly admissionEventRef: string;
}

export interface AdmittedImplementationResolution {
  readonly kind: "admitted_implementation_resolution";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly resolutionRef: string;
  readonly resolutionDigest: Sha256Digest;
  readonly resolutionCandidateRef: string;
  readonly resolutionCandidateDigest: Sha256Digest;
  readonly resolutionValidationRef: string;
  readonly resolutionValidationDigest: Sha256Digest;
  readonly implementationBindingRef: string;
  readonly implementationRef: string;
  readonly implementationDescriptorDigest: Sha256Digest;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly admissionEventRef: string;
}

export interface ExecutionBasis {
  readonly kind: "execution_basis";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly basisRef: string;
  readonly basisDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly programValidationRef: string;
  readonly graphValidationRef: string;
  readonly graphRef: string;
  readonly graphDigest: Sha256Digest;
  readonly implementationResolutionRef: string;
  readonly closureContractRef: string;
  readonly closureContractDigest: Sha256Digest;
  readonly admissionEventRef: string;
}

export interface ExecutionBasisAdmission {
  readonly kind: "execution_basis_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly implementationResolution: AdmittedImplementationResolution;
  readonly executionBasis: ExecutionBasis;
}

export interface ExecutionBasisInput {
  readonly invocationAdmission: InvocationAdmission;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly resolutionCandidate: ImplementationResolutionCandidate;
  readonly resolutionValidation: ImplementationResolutionValidation;
  readonly closureContract: Readonly<ClosureContract>;
}

export type ExecutionBasisAdmissionResult = ExecutionBasisAdmission | InvocationRefusalAdmission;

export function admitInvocationRefusal(
  store: AbgEventStore,
  invocationAdmission: InvocationAdmission,
  stage: InvocationRefusalAdmission["stage"],
  subjectDigest: Sha256Digest,
  contractOrDiagnosticRefs: readonly string[],
  basis: RuntimeAdmissionBasis,
): InvocationRefusalAdmission {
  if (!hasAdmittedInvocation(store, invocationAdmission)) {
    throw new TypeError("invocation refusal requires one exact admitted InvocationAdmission");
  }
  if (contractOrDiagnosticRefs.length === 0) {
    throw new TypeError("invocation refusal requires at least one contract or diagnostic reference");
  }
  const body = {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    stage,
    subjectDigest,
    contractOrDiagnosticRefs,
  };
  const refusalDigest = sha256Canonical(body as unknown as JsonValue);
  const refusalRef = `invocation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "invocation_refused",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: invocationAdmission.workspaceBindingId,
    parentAggregateId: invocationAdmission.invocationRef,
    causationEventRefs: [invocationAdmission.admissionEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: invocationAdmission.invocationAdmissionRef,
    payload: { refusalRef, refusalDigest, ...body },
  });
  return deepFreeze({
    kind: "invocation_refusal_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    refusalRef,
    refusalDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as InvocationRefusalAdmission;
}

export function admitExecutionBasis(
  store: AbgEventStore,
  input: ExecutionBasisInput,
  basis: RuntimeAdmissionBasis,
): ExecutionBasisAdmissionResult {
  const reject = (subjectDigest: Sha256Digest, diagnosticRef: string): InvocationRefusalAdmission =>
    admitInvocationRefusal(
      store,
      input.invocationAdmission,
      "execution_basis",
      subjectDigest,
      [diagnosticRef],
      basis,
    );
  if (!hasAdmittedInvocation(store, input.invocationAdmission)) {
    throw new TypeError("ExecutionBasis requires one exact admitted invocation");
  }
  if (
    !isMaterializedGtlGraph(input.graph) ||
    !isGraphValidation(input.graphValidation) ||
    input.graphValidation.graphRef !== input.graph.materializationRef ||
    input.graphValidation.graphDigest !== input.graph.materializationDigest ||
    input.graphValidation.invocationAdmissionRef !== input.invocationAdmission.invocationAdmissionRef ||
    input.graphValidation.programValidationRef !== input.invocationAdmission.programValidationRef
  ) {
    return reject(input.graph.materializationDigest, "diagnostic://abiogenesis/execution-basis/graph-mismatch@5");
  }
  if (
    !isImplementationResolutionCandidate(input.resolutionCandidate) ||
    !isImplementationResolutionValidation(input.resolutionValidation) ||
    input.resolutionValidation.resolutionCandidateRef !== input.resolutionCandidate.resolutionCandidateRef ||
    input.resolutionValidation.resolutionCandidateDigest !== input.resolutionCandidate.resolutionCandidateDigest ||
    input.resolutionCandidate.graphFunctionRef !== input.invocationAdmission.graphFunctionRef ||
    input.resolutionCandidate.catalogViewId !== input.invocationAdmission.catalogViewId ||
    input.resolutionCandidate.inputContractRef !== input.invocationAdmission.inputContractRef ||
    input.resolutionCandidate.outputContractRef !== input.invocationAdmission.outputContractRef
  ) {
    return reject(input.resolutionCandidate.resolutionCandidateDigest, "diagnostic://abiogenesis/execution-basis/resolution-mismatch@5");
  }
  if (
    input.program.programRef !== input.invocationAdmission.programRef ||
    sha256Canonical(input.program as unknown as JsonValue) !== input.invocationAdmission.programDigest ||
    input.program.closureContractRef !== input.closureContract.closureContractRef ||
    input.closureContract.resultContractRef !== input.invocationAdmission.outputContractRef ||
    input.closureContract.refusalContractRef !== input.resolutionCandidate.refusalContractRef
  ) {
    return reject(sha256Canonical(input.closureContract as unknown as JsonValue), "diagnostic://abiogenesis/execution-basis/closure-mismatch@5");
  }
  const resolutionBody = {
    resolutionCandidateRef: input.resolutionCandidate.resolutionCandidateRef,
    resolutionCandidateDigest: input.resolutionCandidate.resolutionCandidateDigest,
    resolutionValidationRef: input.resolutionValidation.validationRef,
    resolutionValidationDigest: input.resolutionValidation.validationDigest,
    implementationBindingRef: input.resolutionCandidate.implementationBindingRef,
    implementationRef: input.resolutionCandidate.implementationRef,
    implementationDescriptorDigest: input.resolutionCandidate.implementationDescriptorDigest,
    packageName: input.resolutionCandidate.packageName,
    packageVersion: input.resolutionCandidate.packageVersion,
    modulePath: input.resolutionCandidate.modulePath,
    namedSymbol: input.resolutionCandidate.namedSymbol,
    inputContractRef: input.resolutionCandidate.inputContractRef,
    outputContractRef: input.resolutionCandidate.outputContractRef,
    failureContractRef: input.resolutionCandidate.failureContractRef,
    refusalContractRef: input.resolutionCandidate.refusalContractRef,
  };
  const resolutionDigest = sha256Canonical(resolutionBody as unknown as JsonValue);
  const resolutionRef = `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}`;
  const resolutionEvent = admitRuntimeEvent(store, {
    kind: "implementation_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: input.invocationAdmission.workspaceBindingId,
    parentAggregateId: input.invocationAdmission.invocationRef,
    causationEventRefs: [input.invocationAdmission.admissionEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: input.invocationAdmission.invocationAdmissionRef,
    payload: { resolutionRef, resolutionDigest, ...resolutionBody },
  });
  const implementationResolution = deepFreeze({
    kind: "admitted_implementation_resolution" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    resolutionRef,
    resolutionDigest,
    ...resolutionBody,
    admissionEventRef: resolutionEvent.eventId,
  }) as AdmittedImplementationResolution;
  const closureContractDigest = sha256Canonical(input.closureContract as unknown as JsonValue);
  const executionBody = {
    invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
    programValidationRef: input.invocationAdmission.programValidationRef,
    graphValidationRef: input.graphValidation.validationRef,
    graphRef: input.graph.materializationRef,
    graphDigest: input.graph.materializationDigest,
    implementationResolutionRef: implementationResolution.resolutionRef,
    closureContractRef: input.closureContract.closureContractRef,
    closureContractDigest,
  };
  const basisDigest = sha256Canonical(executionBody as unknown as JsonValue);
  const basisRef = `execution-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`;
  const basisEvent = admitRuntimeEvent(store, {
    kind: "basis_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: input.invocationAdmission.workspaceBindingId,
    parentAggregateId: input.invocationAdmission.invocationRef,
    causationEventRefs: [resolutionEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: basisRef,
    payload: { basisRef, basisDigest, ...executionBody },
  });
  const executionBasis = deepFreeze({
    kind: "execution_basis" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    basisRef,
    basisDigest,
    ...executionBody,
    admissionEventRef: basisEvent.eventId,
  }) as ExecutionBasis;
  return deepFreeze({
    kind: "execution_basis_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    implementationResolution,
    executionBasis,
  }) as ExecutionBasisAdmission;
}
