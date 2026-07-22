import type { ClosureContract, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import {
  type ImplementationResolutionCandidate,
} from "../product/index.js";
import { isImplementationResolutionCandidate } from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
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
  readonly stage:
    | "execution_basis"
    | "graph_validation"
    | "implementation_resolution"
    | "open_call";
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
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly graphValidationRef: string;
  readonly graphValidationDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly nodeRef: string;
  readonly implementationBindingRef: string;
  readonly implementationRef: string;
  readonly implementationBindingDigest: Sha256Digest;
  readonly implementationDescriptorDigest: Sha256Digest;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly computeRegime: "F_D" | "F_H" | "F_P";
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
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly rawInputAdmissionRef: string;
  readonly rawInputDigest: Sha256Digest;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly actorRef: string;
  readonly programValidationRef: string;
  readonly graphValidationRef: string;
  readonly graphRef: string;
  readonly graphDigest: Sha256Digest;
  readonly implementationResolutionRef: string;
  readonly closureContractRef: string;
  readonly closureContractDigest: Sha256Digest;
  readonly terminalPredicateRef: string;
  readonly evidenceContractRef: string;
  readonly resultContractRef: string;
  readonly refusalContractRef: string;
  readonly refusalValueKind: string;
  readonly judgmentContractRef: string;
  readonly rejectionContractRef: string;
  readonly transitionContractRef: string;
  readonly replayProjectionRef: string;
  readonly terminalKind: "completed";
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

const executionBases = new WeakSet<object>();
const implementationResolutions = new WeakSet<object>();

function isJsonRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isExecutionBasis(value: object): boolean {
  return executionBases.has(value);
}

export function isAdmittedImplementationResolution(value: object): boolean {
  return implementationResolutions.has(value);
}

export function hasAdmittedImplementationResolution(
  store: AbgEventStore,
  resolution: AdmittedImplementationResolution,
): boolean {
  if (!isAdmittedImplementationResolution(resolution)) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    resolutionRef: _resolutionRef,
    resolutionDigest: _resolutionDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = resolution;
  const event = store.readAll().find(
    (candidate) => candidate.eventId === resolution.admissionEventRef,
  );
  return (
    sha256Canonical(body as unknown as JsonValue) === resolution.resolutionDigest &&
    resolution.resolutionRef ===
      `implementation-resolution://abiogenesis/${resolution.resolutionDigest.slice("sha256:".length)}` &&
    event?.kind === "implementation_admitted" &&
    isJsonRecord(event.payload) &&
    event.payload.resolutionRef === resolution.resolutionRef &&
    event.payload.resolutionDigest === resolution.resolutionDigest &&
    event.payload.resolutionValidationRef === resolution.resolutionValidationRef
  );
}

export function hasAdmittedExecutionBasis(
  store: AbgEventStore,
  basis: ExecutionBasis,
): boolean {
  if (!isExecutionBasis(basis)) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    basisRef: _basisRef,
    basisDigest: _basisDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = basis;
  const event = store.readAll().find((candidate) => candidate.eventId === basis.admissionEventRef);
  return (
    sha256Canonical(body as unknown as JsonValue) === basis.basisDigest &&
    basis.basisRef === `execution-basis://abiogenesis/${basis.basisDigest.slice("sha256:".length)}` &&
    event?.kind === "basis_admitted" &&
    event.basisId === basis.basisRef &&
    isJsonRecord(event.payload) &&
    event.payload.basisRef === basis.basisRef &&
    event.payload.basisDigest === basis.basisDigest &&
    event.payload.invocationAdmissionRef === basis.invocationAdmissionRef &&
    event.payload.implementationResolutionRef === basis.implementationResolutionRef
  );
}

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
    input.resolutionValidation.graphValidationRef !== input.graphValidation.validationRef ||
    input.resolutionCandidate.graphValidationRef !== input.graphValidation.validationRef ||
    input.resolutionCandidate.graphValidationDigest !== input.graphValidation.validationDigest ||
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
    catalogViewId: input.resolutionCandidate.catalogViewId,
    catalogViewDigest: input.resolutionCandidate.catalogViewDigest,
    publicationDigest: input.resolutionCandidate.publicationDigest,
    programValidationRef: input.resolutionCandidate.programValidationRef,
    graphValidationRef: input.resolutionCandidate.graphValidationRef,
    graphValidationDigest: input.resolutionCandidate.graphValidationDigest,
    graphFunctionRef: input.resolutionCandidate.graphFunctionRef,
    graphFunctionDigest: input.resolutionCandidate.graphFunctionDigest,
    nodeRef: input.resolutionCandidate.nodeRef,
    implementationBindingRef: input.resolutionCandidate.implementationBindingRef,
    implementationRef: input.resolutionCandidate.implementationRef,
    implementationBindingDigest: input.resolutionCandidate.implementationBindingDigest,
    implementationDescriptorDigest: input.resolutionCandidate.implementationDescriptorDigest,
    packageName: input.resolutionCandidate.packageName,
    packageVersion: input.resolutionCandidate.packageVersion,
    modulePath: input.resolutionCandidate.modulePath,
    namedSymbol: input.resolutionCandidate.namedSymbol,
    computeRegime: input.resolutionCandidate.computeRegime,
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
  implementationResolutions.add(implementationResolution);
  const closureContractDigest = sha256Canonical(input.closureContract as unknown as JsonValue);
  const executionBody = {
    invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
    invocationRef: input.invocationAdmission.invocationRef,
    invocationDigest: input.invocationAdmission.invocationDigest,
    rawInputAdmissionRef: input.invocationAdmission.rawInputAdmissionRef,
    rawInputDigest: input.invocationAdmission.rawInputDigest,
    workspaceBindingId: input.invocationAdmission.workspaceBindingId,
    workspaceBindingDigest: input.invocationAdmission.workspaceBindingDigest,
    catalogViewId: input.invocationAdmission.catalogViewId,
    catalogViewDigest: input.invocationAdmission.catalogViewDigest,
    programRef: input.invocationAdmission.programRef,
    programDigest: input.invocationAdmission.programDigest,
    graphFunctionRef: input.invocationAdmission.graphFunctionRef,
    graphFunctionDigest: input.invocationAdmission.graphFunctionDigest,
    actorRef: input.invocationAdmission.actorRef,
    programValidationRef: input.invocationAdmission.programValidationRef,
    graphValidationRef: input.graphValidation.validationRef,
    graphRef: input.graph.materializationRef,
    graphDigest: input.graph.materializationDigest,
    implementationResolutionRef: implementationResolution.resolutionRef,
    closureContractRef: input.closureContract.closureContractRef,
    closureContractDigest,
    terminalPredicateRef: input.closureContract.predicateRef,
    evidenceContractRef: input.closureContract.evidenceContractRef,
    resultContractRef: input.closureContract.resultContractRef,
    refusalContractRef: input.closureContract.refusalContractRef,
    refusalValueKind: input.closureContract.refusalValueKind,
    judgmentContractRef: input.closureContract.judgmentContractRef,
    rejectionContractRef: input.closureContract.rejectionContractRef,
    transitionContractRef: input.closureContract.transitionContractRef,
    replayProjectionRef: input.closureContract.replayProjectionRef,
    terminalKind: input.closureContract.terminalKind,
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
  executionBases.add(executionBasis);
  return deepFreeze({
    kind: "execution_basis_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    implementationResolution,
    executionBasis,
  }) as ExecutionBasisAdmission;
}
