import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import {
  type ImplementationResolutionCandidate,
  type ImplementationResolutionSetCandidate,
  type LeafImplementationResolutionCandidate,
} from "../product/index.js";
import {
  isImplementationResolutionCandidate,
  isImplementationResolutionSetCandidate,
} from "../product/implementation_resolution.js";
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
  isImplementationResolutionSetValidation,
  type ImplementationResolutionValidation,
  type ImplementationResolutionSetValidation,
} from "../validator/implementation_resolution.js";
import {
  isProgramValidation,
  type ProgramValidation,
  type ValidatedInteractionLeaf,
} from "../validator/validation.js";
import {
  hasAdmittedInvocation,
  type InvocationAdmission,
} from "./invocation_admission.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";
import type { OpenedTraversalScope } from "./open_call.js";

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

export interface AdmittedImplementationResolutionRow
  extends Omit<
    LeafImplementationResolutionCandidate,
    "disposition" | "kind" | "schemaVersion"
  > {
  readonly kind: "admitted_implementation_resolution_row";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
}

export interface AdmittedInteractionContractRow
  extends Omit<ValidatedInteractionLeaf, "kind"> {
  readonly kind: "admitted_interaction_contract_row";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
}

export interface AdmittedImplementationSet {
  readonly kind: "admitted_implementation_set";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly invocationRef: string;
  readonly resolutionSetCandidateRef: string;
  readonly resolutionSetCandidateDigest: Sha256Digest;
  readonly resolutionSetValidationRef: string;
  readonly resolutionSetValidationDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly executableLeafKeys: readonly string[];
  readonly rows: readonly AdmittedImplementationResolutionRow[];
  readonly admissionEventRef: string;
}

export interface AdmittedInteractionSet {
  readonly kind: "admitted_interaction_set";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly interactionSetRef: string;
  readonly interactionSetDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly invocationRef: string;
  readonly programValidationRef: string;
  readonly programValidationSourceDigest: Sha256Digest;
  readonly interactionLeafKeys: readonly string[];
  readonly rows: readonly AdmittedInteractionContractRow[];
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
  readonly computeRegime: "F_D" | "F_P";
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
  readonly basisClass: "child" | "root";
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
  readonly parentExecutionBasisRef: string | null;
  readonly parentTraversalScopeRef: string | null;
  readonly entryRef: string;
  readonly programValidationRef: string;
  readonly graphValidationRef: string;
  readonly graphRef: string;
  readonly graphDigest: Sha256Digest;
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly interactionSetRef: string;
  readonly interactionSetDigest: Sha256Digest;
  readonly rootImplementationSetRef: string;
  readonly rootImplementationSetDigest: Sha256Digest;
  readonly rootInteractionSetRef: string;
  readonly rootInteractionSetDigest: Sha256Digest;
  readonly localExecutableLeafKeys: readonly string[];
  readonly localImplementationSubsetDigest: Sha256Digest;
  readonly localInteractionLeafKeys: readonly string[];
  readonly localInteractionSubsetDigest: Sha256Digest;
  readonly implementationResolutionRef: string | null;
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
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly implementationResolution: AdmittedImplementationResolution | null;
  readonly executionBasis: ExecutionBasis;
}

export interface ExecutionBasisInput {
  readonly invocationAdmission: InvocationAdmission;
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly resolutionSetCandidate: ImplementationResolutionSetCandidate;
  readonly resolutionSetValidation: ImplementationResolutionSetValidation;
  readonly resolutionCandidate?: ImplementationResolutionCandidate;
  readonly resolutionValidation?: ImplementationResolutionValidation;
  readonly closureContract: Readonly<ClosureContract>;
}

export type ExecutionBasisAdmissionResult = ExecutionBasisAdmission | InvocationRefusalAdmission;

export interface ChildExecutionBasisInput {
  readonly parentExecutionBasis: ExecutionBasis;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly rootImplementationSet: AdmittedImplementationSet;
  readonly rootInteractionSet: AdmittedInteractionSet;
  readonly closureContract: Readonly<ClosureContract>;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
}

export interface ChildExecutionBasisAdmission {
  readonly kind: "child_execution_basis_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly executionBasis: ExecutionBasis;
}

export interface ChildExecutionBasisRefusal {
  readonly kind: "child_execution_basis_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "child_graph_mismatch"
    | "child_input_mismatch"
    | "child_membership_mismatch"
    | "child_subset_mismatch"
    | "parent_basis_mismatch";
  readonly message: string;
}

export type ChildExecutionBasisResult =
  | ChildExecutionBasisAdmission
  | ChildExecutionBasisRefusal;

const executionBases = new WeakSet<object>();
const implementationResolutions = new WeakSet<object>();
const implementationSets = new WeakSet<object>();
const interactionSets = new WeakSet<object>();

function isJsonRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isExecutionBasis(value: object): boolean {
  return executionBases.has(value);
}

export function isAdmittedImplementationResolution(value: object): boolean {
  return implementationResolutions.has(value);
}

export function isAdmittedImplementationSet(value: object): boolean {
  return implementationSets.has(value);
}

export function isAdmittedInteractionSet(value: object): boolean {
  return interactionSets.has(value);
}

export function hasAdmittedImplementationSet(
  store: AbgEventStore,
  set: AdmittedImplementationSet,
): boolean {
  if (!isAdmittedImplementationSet(set)) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    implementationSetRef: _implementationSetRef,
    implementationSetDigest: _implementationSetDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = set;
  const event = store.readAll().find((candidate) => candidate.eventId === set.admissionEventRef);
  return (
    sha256Canonical(body as unknown as JsonValue) === set.implementationSetDigest &&
    set.implementationSetRef ===
      `implementation-set://abiogenesis/${set.implementationSetDigest.slice("sha256:".length)}` &&
    event?.kind === "implementation_admitted" &&
    isJsonRecord(event.payload) &&
    event.payload.implementationSetRef === set.implementationSetRef &&
    event.payload.implementationSetDigest === set.implementationSetDigest &&
    event.payload.implementationSet !== undefined &&
    isJsonRecord(event.payload.implementationSet) &&
    sha256Canonical(event.payload.implementationSet) === sha256Canonical({
      implementationSetRef: set.implementationSetRef,
      implementationSetDigest: set.implementationSetDigest,
      ...body,
    } as unknown as JsonValue)
  );
}

export interface ImplementationResolutionSelection {
  readonly graphFunctionRef: string;
  readonly nodeRef: string;
  readonly programLocusRef: string;
  readonly implementationBindingRef: string;
}

export function selectAdmittedImplementationResolution(
  set: AdmittedImplementationSet,
  selection: ImplementationResolutionSelection,
): AdmittedImplementationResolutionRow | null {
  if (!isAdmittedImplementationSet(set)) return null;
  const matches = set.rows.filter(
    (row) =>
      row.graphFunctionRef === selection.graphFunctionRef &&
      row.nodeRef === selection.nodeRef &&
      row.programLocusRef === selection.programLocusRef &&
      row.implementationBindingRef === selection.implementationBindingRef,
  );
  return matches.length === 1 ? matches[0] ?? null : null;
}

export function hasAdmittedInteractionSet(
  store: AbgEventStore,
  set: AdmittedInteractionSet,
): boolean {
  if (!isAdmittedInteractionSet(set)) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    interactionSetRef: _interactionSetRef,
    interactionSetDigest: _interactionSetDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = set;
  const event = store.readAll().find((candidate) => candidate.eventId === set.admissionEventRef);
  return (
    sha256Canonical(body as unknown as JsonValue) === set.interactionSetDigest &&
    set.interactionSetRef ===
      `interaction-set://abiogenesis/${set.interactionSetDigest.slice("sha256:".length)}` &&
    event?.kind === "implementation_admitted" &&
    isJsonRecord(event.payload) &&
    event.payload.interactionSetRef === set.interactionSetRef &&
    event.payload.interactionSetDigest === set.interactionSetDigest &&
    event.payload.interactionSet !== undefined &&
    isJsonRecord(event.payload.interactionSet) &&
    sha256Canonical(event.payload.interactionSet) === sha256Canonical({
      interactionSetRef: set.interactionSetRef,
      interactionSetDigest: set.interactionSetDigest,
      ...body,
    } as unknown as JsonValue)
  );
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
    event.payload.implementationSetRef === basis.implementationSetRef &&
    event.payload.implementationSetDigest === basis.implementationSetDigest &&
    event.payload.interactionSetRef === basis.interactionSetRef &&
    event.payload.interactionSetDigest === basis.interactionSetDigest &&
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
    !isProgramValidation(input.programValidation) ||
    input.programValidation.validationRef !== input.invocationAdmission.programValidationRef ||
    input.programValidation.programRef !== input.invocationAdmission.programRef ||
    !isImplementationResolutionSetCandidate(input.resolutionSetCandidate) ||
    !isImplementationResolutionSetValidation(input.resolutionSetValidation) ||
    input.resolutionSetCandidate.programValidationRef !== input.programValidation.validationRef ||
    input.resolutionSetCandidate.catalogViewId !== input.invocationAdmission.catalogViewId ||
    input.resolutionSetCandidate.catalogViewDigest !== input.invocationAdmission.catalogViewDigest ||
    input.resolutionSetValidation.setCandidateRef !== input.resolutionSetCandidate.setCandidateRef ||
    input.resolutionSetValidation.setCandidateDigest !== input.resolutionSetCandidate.setCandidateDigest ||
    input.resolutionSetValidation.programValidationRef !== input.programValidation.validationRef ||
    sha256Canonical(input.resolutionSetCandidate.executableLeafKeys as unknown as JsonValue) !==
      sha256Canonical(input.programValidation.transitiveReachableExecutableLeafKeys as unknown as JsonValue) ||
    sha256Canonical(input.resolutionSetValidation.executableLeafKeys as unknown as JsonValue) !==
      sha256Canonical(input.programValidation.transitiveReachableExecutableLeafKeys as unknown as JsonValue) ||
    input.resolutionSetCandidate.rows.length !== input.programValidation.executableLeafRows.length ||
    new Set([
      ...input.programValidation.transitiveReachableExecutableLeafKeys,
      ...input.programValidation.transitiveReachableInteractionLeafKeys,
    ]).size !==
      input.programValidation.transitiveReachableExecutableLeafKeys.length +
        input.programValidation.transitiveReachableInteractionLeafKeys.length
  ) {
    return reject(
      input.resolutionSetCandidate.setCandidateDigest,
      "diagnostic://abiogenesis/execution-basis/resolution-set-mismatch@5",
    );
  }
  const legacyCandidate = input.resolutionCandidate;
  const legacyValidation = input.resolutionValidation;
  if ((legacyCandidate === undefined) !== (legacyValidation === undefined)) {
    return reject(
      input.resolutionSetCandidate.setCandidateDigest,
      "diagnostic://abiogenesis/execution-basis/legacy-projection-incomplete@5",
    );
  }
  if (
    legacyCandidate !== undefined &&
    legacyValidation !== undefined &&
    (
      !isImplementationResolutionCandidate(legacyCandidate) ||
      !isImplementationResolutionValidation(legacyValidation) ||
      legacyValidation.resolutionCandidateRef !== legacyCandidate.resolutionCandidateRef ||
      legacyValidation.resolutionCandidateDigest !== legacyCandidate.resolutionCandidateDigest ||
      legacyValidation.graphValidationRef !== input.graphValidation.validationRef ||
      legacyCandidate.graphValidationRef !== input.graphValidation.validationRef ||
      legacyCandidate.graphValidationDigest !== input.graphValidation.validationDigest ||
      legacyCandidate.graphFunctionRef !== input.invocationAdmission.graphFunctionRef ||
      legacyCandidate.catalogViewId !== input.invocationAdmission.catalogViewId ||
      legacyCandidate.inputContractRef !== input.invocationAdmission.inputContractRef ||
      legacyCandidate.outputContractRef !== input.invocationAdmission.outputContractRef ||
      input.resolutionSetCandidate.rows.filter((row) =>
        row.graphFunctionRef === legacyCandidate.graphFunctionRef &&
        row.nodeRef === legacyCandidate.nodeRef &&
        row.implementationBindingRef === legacyCandidate.implementationBindingRef &&
        row.implementationDescriptorDigest === legacyCandidate.implementationDescriptorDigest
      ).length !== 1
    )
  ) {
    return reject(
      legacyCandidate.resolutionCandidateDigest,
      "diagnostic://abiogenesis/execution-basis/resolution-mismatch@5",
    );
  }
  if (
    input.program.programRef !== input.invocationAdmission.programRef ||
    sha256Canonical(input.program as unknown as JsonValue) !== input.invocationAdmission.programDigest ||
    input.program.closureContractRef !== input.closureContract.closureContractRef ||
    input.closureContract.resultContractRef !== input.invocationAdmission.outputContractRef
  ) {
    return reject(sha256Canonical(input.closureContract as unknown as JsonValue), "diagnostic://abiogenesis/execution-basis/closure-mismatch@5");
  }
  const implementationRows = input.resolutionSetCandidate.rows.map((row) => {
    const {
      kind: _kind,
      schemaVersion: _schemaVersion,
      disposition: _disposition,
      ...body
    } = row;
    return deepFreeze({
      kind: "admitted_implementation_resolution_row" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      ...body,
    }) as AdmittedImplementationResolutionRow;
  });
  const implementationSetBody = {
    invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
    invocationRef: input.invocationAdmission.invocationRef,
    resolutionSetCandidateRef: input.resolutionSetCandidate.setCandidateRef,
    resolutionSetCandidateDigest: input.resolutionSetCandidate.setCandidateDigest,
    resolutionSetValidationRef: input.resolutionSetValidation.validationRef,
    resolutionSetValidationDigest: input.resolutionSetValidation.validationDigest,
    catalogViewId: input.resolutionSetCandidate.catalogViewId,
    catalogViewDigest: input.resolutionSetCandidate.catalogViewDigest,
    publicationDigest: input.resolutionSetCandidate.publicationDigest,
    programValidationRef: input.programValidation.validationRef,
    executableLeafKeys: input.programValidation.transitiveReachableExecutableLeafKeys,
    rows: implementationRows,
  };
  const implementationSetDigest = sha256Canonical(implementationSetBody as unknown as JsonValue);
  const implementationSetRef =
    `implementation-set://abiogenesis/${implementationSetDigest.slice("sha256:".length)}`;
  const interactionRows = input.programValidation.interactionLeafRows.map((row) => {
    const { kind: _kind, ...body } = row;
    return deepFreeze({
      kind: "admitted_interaction_contract_row" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      ...body,
    }) as AdmittedInteractionContractRow;
  });
  const interactionSetBody = {
    invocationAdmissionRef: input.invocationAdmission.invocationAdmissionRef,
    invocationRef: input.invocationAdmission.invocationRef,
    programValidationRef: input.programValidation.validationRef,
    programValidationSourceDigest: input.programValidation.sourceDigest,
    interactionLeafKeys: input.programValidation.transitiveReachableInteractionLeafKeys,
    rows: interactionRows,
  };
  const interactionSetDigest = sha256Canonical(interactionSetBody as unknown as JsonValue);
  const interactionSetRef =
    `interaction-set://abiogenesis/${interactionSetDigest.slice("sha256:".length)}`;
  const resolutionBody = legacyCandidate === undefined || legacyValidation === undefined
    ? null
    : {
      resolutionCandidateRef: legacyCandidate.resolutionCandidateRef,
      resolutionCandidateDigest: legacyCandidate.resolutionCandidateDigest,
      resolutionValidationRef: legacyValidation.validationRef,
      resolutionValidationDigest: legacyValidation.validationDigest,
      catalogViewId: legacyCandidate.catalogViewId,
      catalogViewDigest: legacyCandidate.catalogViewDigest,
      publicationDigest: legacyCandidate.publicationDigest,
      programValidationRef: legacyCandidate.programValidationRef,
      graphValidationRef: legacyCandidate.graphValidationRef,
      graphValidationDigest: legacyCandidate.graphValidationDigest,
      graphFunctionRef: legacyCandidate.graphFunctionRef,
      graphFunctionDigest: legacyCandidate.graphFunctionDigest,
      nodeRef: legacyCandidate.nodeRef,
      implementationBindingRef: legacyCandidate.implementationBindingRef,
      implementationRef: legacyCandidate.implementationRef,
      implementationBindingDigest: legacyCandidate.implementationBindingDigest,
      implementationDescriptorDigest: legacyCandidate.implementationDescriptorDigest,
      packageName: legacyCandidate.packageName,
      packageVersion: legacyCandidate.packageVersion,
      modulePath: legacyCandidate.modulePath,
      namedSymbol: legacyCandidate.namedSymbol,
      computeRegime: legacyCandidate.computeRegime,
      inputContractRef: legacyCandidate.inputContractRef,
      outputContractRef: legacyCandidate.outputContractRef,
      failureContractRef: legacyCandidate.failureContractRef,
      refusalContractRef: legacyCandidate.refusalContractRef,
    };
  const resolutionDigest = resolutionBody === null
    ? null
    : sha256Canonical(resolutionBody as unknown as JsonValue);
  const resolutionRef = resolutionDigest === null
    ? null
    : `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}`;
  const setEvent = admitRuntimeEvent(store, {
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
    payload: {
      implementationSetRef,
      implementationSetDigest,
      interactionSetRef,
      interactionSetDigest,
      implementationSet: {
        implementationSetRef,
        implementationSetDigest,
        ...implementationSetBody,
      },
      interactionSet: {
        interactionSetRef,
        interactionSetDigest,
        ...interactionSetBody,
      },
      ...(resolutionBody === null ? {} : { resolutionRef, resolutionDigest, ...resolutionBody }),
    } as unknown as JsonValue,
  });
  const implementationSet = deepFreeze({
    kind: "admitted_implementation_set" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    implementationSetRef,
    implementationSetDigest,
    ...implementationSetBody,
    admissionEventRef: setEvent.eventId,
  }) as AdmittedImplementationSet;
  implementationSets.add(implementationSet);
  const interactionSet = deepFreeze({
    kind: "admitted_interaction_set" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    interactionSetRef,
    interactionSetDigest,
    ...interactionSetBody,
    admissionEventRef: setEvent.eventId,
  }) as AdmittedInteractionSet;
  interactionSets.add(interactionSet);
  const implementationResolution = resolutionBody === null || resolutionRef === null || resolutionDigest === null
    ? null
    : deepFreeze({
      kind: "admitted_implementation_resolution" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      resolutionRef,
      resolutionDigest,
      ...resolutionBody,
      admissionEventRef: setEvent.eventId,
    }) as AdmittedImplementationResolution;
  if (implementationResolution !== null) implementationResolutions.add(implementationResolution);
  const closureContractDigest = sha256Canonical(input.closureContract as unknown as JsonValue);
  const entry = input.program.starts.find(
    (candidate) => candidate.graphFunctionRef === input.invocationAdmission.graphFunctionRef,
  );
  if (entry === undefined) {
    return reject(
      input.programValidation.sourceDigest,
      "diagnostic://abiogenesis/execution-basis/program-start-absent@5",
    );
  }
  const localImplementationSubsetDigest = sha256Canonical({
    rootImplementationSetRef: implementationSet.implementationSetRef,
    rootImplementationSetDigest: implementationSet.implementationSetDigest,
    executableLeafKeys: implementationSet.executableLeafKeys,
    rows: implementationSet.rows,
  } as unknown as JsonValue);
  const localInteractionSubsetDigest = sha256Canonical({
    rootInteractionSetRef: interactionSet.interactionSetRef,
    rootInteractionSetDigest: interactionSet.interactionSetDigest,
    interactionLeafKeys: interactionSet.interactionLeafKeys,
    rows: interactionSet.rows,
  } as unknown as JsonValue);
  const executionBody = {
    basisClass: "root" as const,
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
    parentExecutionBasisRef: null,
    parentTraversalScopeRef: null,
    entryRef: entry.startRef,
    programValidationRef: input.invocationAdmission.programValidationRef,
    graphValidationRef: input.graphValidation.validationRef,
    graphRef: input.graph.materializationRef,
    graphDigest: input.graph.materializationDigest,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationSetDigest: implementationSet.implementationSetDigest,
    interactionSetRef: interactionSet.interactionSetRef,
    interactionSetDigest: interactionSet.interactionSetDigest,
    rootImplementationSetRef: implementationSet.implementationSetRef,
    rootImplementationSetDigest: implementationSet.implementationSetDigest,
    rootInteractionSetRef: interactionSet.interactionSetRef,
    rootInteractionSetDigest: interactionSet.interactionSetDigest,
    localExecutableLeafKeys: implementationSet.executableLeafKeys,
    localImplementationSubsetDigest,
    localInteractionLeafKeys: interactionSet.interactionLeafKeys,
    localInteractionSubsetDigest,
    implementationResolutionRef: implementationResolution?.resolutionRef ?? null,
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
    causationEventRefs: [setEvent.eventId],
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
    implementationSet,
    interactionSet,
    implementationResolution,
    executionBasis,
  }) as ExecutionBasisAdmission;
}

function childRefusal(
  code: ChildExecutionBasisRefusal["code"],
  message: string,
): ChildExecutionBasisRefusal {
  return {
    kind: "child_execution_basis_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function sameOrderedValues(left: readonly string[], right: readonly string[]): boolean {
  return left.join("\0") === right.join("\0");
}

export function admitChildExecutionBasis(
  store: AbgEventStore,
  input: ChildExecutionBasisInput,
  basis: RuntimeAdmissionBasis,
): ChildExecutionBasisResult {
  const parent = input.parentExecutionBasis;
  const parentScope = input.parentTraversalScope;
  if (
    !hasAdmittedExecutionBasis(store, parent) ||
    parentScope.executionBasisRef !== parent.basisRef ||
    parentScope.scopeRef.length === 0 ||
    parentScope.runId.length === 0 ||
    input.rootImplementationSet.implementationSetRef !== parent.rootImplementationSetRef ||
    input.rootImplementationSet.implementationSetDigest !== parent.rootImplementationSetDigest ||
    input.rootInteractionSet.interactionSetRef !== parent.rootInteractionSetRef ||
    input.rootInteractionSet.interactionSetDigest !== parent.rootInteractionSetDigest ||
    !hasAdmittedImplementationSet(store, input.rootImplementationSet) ||
    !hasAdmittedInteractionSet(store, input.rootInteractionSet)
  ) {
    return childRefusal(
      "parent_basis_mismatch",
      "child traversal requires the exact admitted parent scope and root sets",
    );
  }
  const graphFunctionDigest = sha256Canonical(input.graphFunction as unknown as JsonValue);
  if (
    !isProgramValidation(input.programValidation) ||
    input.programValidation.validationRef !== parent.programValidationRef ||
    input.program.programRef !== parent.programRef ||
    sha256Canonical(input.program as unknown as JsonValue) !== parent.programDigest ||
    !input.program.callableMembership.includes(input.graphFunction.name)
  ) {
    return childRefusal(
      "child_membership_mismatch",
      "child GraphFunction is not a member of the exact admitted Program root",
    );
  }
  if (
    !isGraphValidation(input.graphValidation) ||
    input.graphValidation.graphRef !== input.graph.materializationRef ||
    input.graphValidation.graphDigest !== input.graph.materializationDigest ||
    input.graphValidation.graphFunctionRef !== input.graphFunction.name ||
    input.graphValidation.graphFunctionDigest !== graphFunctionDigest ||
    input.graphValidation.programValidationRef !== input.programValidation.validationRef ||
    input.graph.graphFunctionRef !== input.graphFunction.name ||
    input.graph.graphFunctionDigest !== graphFunctionDigest
  ) {
    return childRefusal(
      "child_graph_mismatch",
      "child Graph and validation do not preserve the declared GraphFunction",
    );
  }
  if (
    input.admittedInputRef.length === 0 ||
    input.graph.admittedInputRef !== input.admittedInputRef ||
    input.graph.admittedInputDigest !== input.admittedInputDigest ||
    input.graphValidation.admittedInputRef !== input.admittedInputRef ||
    input.graphValidation.admittedInputDigest !== input.admittedInputDigest ||
    input.graph.invocationAdmissionRef !== parent.invocationAdmissionRef ||
    input.graphValidation.invocationAdmissionRef !== parent.invocationAdmissionRef
  ) {
    return childRefusal(
      "child_input_mismatch",
      "child materialization requires the exact admitted parent output binding",
    );
  }
  if (
    input.graphFunction.declarations["abg.closure_contract"] !==
      input.closureContract.closureContractRef ||
    input.closureContract.resultContractRef !== input.graphFunction.outputs[0]
  ) {
    return childRefusal(
      "child_membership_mismatch",
      "child entry or closure contract is absent from admitted GTL",
    );
  }

  const localExecutableRows = input.programValidation.executableLeafRows
    .filter((row) => row.graphFunctionRef === input.graphFunction.name);
  const localExecutableLeafKeys = localExecutableRows
    .map((row) => row.requirementKey)
    .sort((left, right) => left.localeCompare(right));
  const admittedExecutableRows = input.rootImplementationSet.rows
    .filter((row) => row.graphFunctionRef === input.graphFunction.name)
    .sort((left, right) => left.requirementKey.localeCompare(right.requirementKey));
  const admittedExecutableKeys = admittedExecutableRows.map((row) => row.requirementKey);
  const localInteractionRows = input.programValidation.interactionLeafRows
    .filter((row) => row.graphFunctionRef === input.graphFunction.name);
  const localInteractionLeafKeys = localInteractionRows
    .map((row) => row.requirementKey)
    .sort((left, right) => left.localeCompare(right));
  const admittedInteractionRows = input.rootInteractionSet.rows
    .filter((row) => row.graphFunctionRef === input.graphFunction.name)
    .sort((left, right) => left.requirementKey.localeCompare(right.requirementKey));
  const admittedInteractionKeys = admittedInteractionRows.map((row) => row.requirementKey);
  if (
    !sameOrderedValues(localExecutableLeafKeys, admittedExecutableKeys) ||
    !sameOrderedValues(localInteractionLeafKeys, admittedInteractionKeys)
  ) {
    return childRefusal(
      "child_subset_mismatch",
      "child executable and interaction rows must equal exact subsets of the admitted root sets",
    );
  }

  const localImplementationSubsetDigest = sha256Canonical({
    rootImplementationSetRef: input.rootImplementationSet.implementationSetRef,
    rootImplementationSetDigest: input.rootImplementationSet.implementationSetDigest,
    executableLeafKeys: localExecutableLeafKeys,
    rows: admittedExecutableRows,
  } as unknown as JsonValue);
  const localInteractionSubsetDigest = sha256Canonical({
    rootInteractionSetRef: input.rootInteractionSet.interactionSetRef,
    rootInteractionSetDigest: input.rootInteractionSet.interactionSetDigest,
    interactionLeafKeys: localInteractionLeafKeys,
    rows: admittedInteractionRows,
  } as unknown as JsonValue);
  const closureContractDigest = sha256Canonical(input.closureContract as unknown as JsonValue);
  const entryDigest = sha256Canonical({
    parentTraversalScopeRef: parentScope.scopeRef,
    graphFunctionRef: input.graphFunction.name,
    graphRef: input.graph.materializationRef,
    admittedInputRef: input.admittedInputRef,
    admittedInputDigest: input.admittedInputDigest,
  } as unknown as JsonValue);
  const entryRef = `child-entry://abiogenesis/${entryDigest.slice("sha256:".length)}`;
  const executionBody = {
    basisClass: "child" as const,
    invocationAdmissionRef: parent.invocationAdmissionRef,
    invocationRef: parent.invocationRef,
    invocationDigest: parent.invocationDigest,
    rawInputAdmissionRef: input.admittedInputRef,
    rawInputDigest: input.admittedInputDigest,
    workspaceBindingId: parent.workspaceBindingId,
    workspaceBindingDigest: parent.workspaceBindingDigest,
    catalogViewId: parent.catalogViewId,
    catalogViewDigest: parent.catalogViewDigest,
    programRef: parent.programRef,
    programDigest: parent.programDigest,
    graphFunctionRef: input.graphFunction.name,
    graphFunctionDigest,
    actorRef: parent.actorRef,
    parentExecutionBasisRef: parent.basisRef,
    parentTraversalScopeRef: parentScope.scopeRef,
    entryRef,
    programValidationRef: input.programValidation.validationRef,
    graphValidationRef: input.graphValidation.validationRef,
    graphRef: input.graph.materializationRef,
    graphDigest: input.graph.materializationDigest,
    implementationSetRef: input.rootImplementationSet.implementationSetRef,
    implementationSetDigest: input.rootImplementationSet.implementationSetDigest,
    interactionSetRef: input.rootInteractionSet.interactionSetRef,
    interactionSetDigest: input.rootInteractionSet.interactionSetDigest,
    rootImplementationSetRef: input.rootImplementationSet.implementationSetRef,
    rootImplementationSetDigest: input.rootImplementationSet.implementationSetDigest,
    rootInteractionSetRef: input.rootInteractionSet.interactionSetRef,
    rootInteractionSetDigest: input.rootInteractionSet.interactionSetDigest,
    localExecutableLeafKeys,
    localImplementationSubsetDigest,
    localInteractionLeafKeys,
    localInteractionSubsetDigest,
    implementationResolutionRef: null,
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
  const event = admitRuntimeEvent(store, {
    kind: "basis_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: parentScope.frameId,
    parentAggregateId: parentScope.graphCallId,
    causationEventRefs: [parentScope.frameOpenEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: basisRef,
    runId: parentScope.runId,
    graphFunctionRef: input.graphFunction.name,
    materializationRef: input.graph.materializationRef,
    graphCallId: parentScope.graphCallId,
    frameId: parentScope.frameId,
    frameLineageId: parentScope.frameLineageId,
    payload: { basisRef, basisDigest, ...executionBody },
  });
  const executionBasis = deepFreeze({
    kind: "execution_basis" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    basisRef,
    basisDigest,
    ...executionBody,
    admissionEventRef: event.eventId,
  }) as ExecutionBasis;
  executionBases.add(executionBasis);
  return deepFreeze({
    kind: "child_execution_basis_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    executionBasis,
  }) as ChildExecutionBasisAdmission;
}
