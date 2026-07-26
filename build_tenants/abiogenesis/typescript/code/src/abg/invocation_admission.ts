import type {
  GraphFunction,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import { resolveProgramStart } from "../gtl/public_start.js";
import {
  DIRECT_INVOKE_CAPABILITY,
  type CapabilityGrant,
  type CatalogView,
  type InvocationAuthority,
  type InvocationInteractionCapability,
  type InvocationPolicyBasis,
  type ProductInvocationSourceResultBasis,
  type PublicInvocationCandidate,
  type RunInvocationVariant,
  type WorkspaceBinding,
} from "../product/index.js";
import {
  isCapabilityGrant,
  isInvocationAuthority,
  isInvocationPolicyBasis,
  isPublicInvocationCandidate,
} from "../product/invocation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isProgramValidation,
  type ProgramValidation,
} from "../validator/validation.js";
import {
  isRawAdmittedValue,
  type RawAdmittedValue,
} from "../validator/raw_admission.js";
import {
  hasAdmittedCatalogView,
  hasAdmittedProductSemanticsBasis,
  type AdmittedProductSemanticsBasis,
} from "./catalog_admission.js";
import {
  hasAdmittedWorkspaceBinding,
  validatePublicOperationBasis,
  type AbgAdmissionRefusal,
  type PublicOperationAdmissionBasis,
} from "./environment_admission.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";
import { replay } from "./replay.js";

export interface InvocationAdmissionInput {
  readonly invocation: PublicInvocationCandidate;
  readonly rawRequest: RawAdmittedValue<unknown>;
  readonly rawInput: RawAdmittedValue<unknown>;
  readonly modulePublication: Readonly<ModulePublication>;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly programValidation: ProgramValidation;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalogView: CatalogView;
  readonly policy: InvocationPolicyBasis;
  readonly capabilityGrants: readonly CapabilityGrant[];
  readonly authority: InvocationAuthority;
  readonly reentryBasis?: InvocationReentryBasis;
  readonly sourceResultBasis?: ProductInvocationSourceResultBasis;
}

export interface InvocationReentryBasis {
  readonly kind: "invocation_reentry_basis";
  readonly schemaVersion: "5.0.0";
  readonly publicAuthorityDigest: Sha256Digest;
  readonly sourceInvocationAdmissionRef: string;
  readonly sourceRunId: string;
  readonly sourceRouteRef: string;
  readonly sourceRouteDigest: Sha256Digest;
  readonly sourceRouteEventRef: string;
  readonly sourceRunStoppedEventRef: string;
  readonly gapRef: string;
  readonly nextActionProjectionRef: string;
  readonly nextActionProjectionDigest: Sha256Digest;
  readonly productSetId: string;
  readonly productSetDigest: Sha256Digest;
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly sourceStart: PublicStartAdmissionIdentity;
}

export interface PublicStartAdmissionIdentity {
  readonly kind: "public_start_identity";
  readonly schemaVersion: "5.0.0";
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly startRef: string;
  readonly scope: "program";
  readonly target: string;
  readonly until: "converged";
  readonly rootMode: "direct" | "supervised";
}

export interface InvocationAdmission {
  readonly kind: "invocation_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly invocationAdmissionRef: string;
  readonly invocationAdmissionDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly invocationVariant: RunInvocationVariant;
  readonly rawInputAdmissionRef: string;
  readonly rawInputDigest: Sha256Digest;
  readonly publicRequestAdmissionRef: string;
  readonly publicRequestDigest: Sha256Digest;
  readonly publicRequestInvocationRef: string;
  readonly workspaceId: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly programValidationRef: string;
  readonly programValidationDigest: Sha256Digest;
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly capabilityGrants: readonly CapabilityGrant[];
  readonly capabilityGrantRefs: readonly string[];
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
  readonly actorRef: string;
  readonly publicStart: PublicStartAdmissionIdentity | null;
  readonly reentryBasis: InvocationReentryBasis | null;
  readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
}

export interface InvocationAdmissionRefusal {
  readonly kind: "invocation_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "authority_mismatch"
    | "capability_mismatch"
    | "catalog_view_not_admitted"
    | "contract_mismatch"
    | "invocation_not_constructed"
    | "selection_mismatch"
    | "validation_mismatch"
    | "workspace_not_admitted";
  readonly message: string;
}

export type InvocationAdmissionResult =
  | InvocationAdmission
  | InvocationAdmissionRefusal
  | AbgAdmissionRefusal;

function refusal(
  code: InvocationAdmissionRefusal["code"],
  message: string,
): InvocationAdmissionRefusal {
  return {
    kind: "invocation_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const sourceResultBases = new WeakSet<object>();

export interface InvocationSourceResultDerivationInput {
  readonly publicAuthorityDigest: Sha256Digest;
  readonly runtimeInvocationRef: string;
  readonly invocationAdmissionRef: string;
  readonly runId: string;
  readonly resultRef: string;
  readonly productSemanticsBasis: AdmittedProductSemanticsBasis;
}

export function isInvocationSourceResultBasis(
  value: object,
): value is ProductInvocationSourceResultBasis {
  return sourceResultBases.has(value);
}

export function deriveInvocationSourceResultBasis(
  store: AbgEventStore,
  input: InvocationSourceResultDerivationInput,
): ProductInvocationSourceResultBasis | null {
  const sourceInvocation = rehydrateInvocationAdmission(
    store,
    input.invocationAdmissionRef,
  );
  const sourceReplay = replay(store, { runId: input.runId });
  const sourceCall = sourceReplay.cCalls.find(
    (row) => row.resultRef === input.resultRef,
  );
  const resultEvent = sourceCall === undefined
    ? undefined
    : store.readScope({ runId: input.runId }).find(
        (event) =>
          event.kind === "c_call_result_admitted" &&
          event.aggregateId === sourceCall.cCallRef &&
          isRecord(event.payload) &&
          event.payload.resultRef === input.resultRef,
      );
  const judgmentEvent = sourceCall === undefined
    ? undefined
    : store.readScope({ runId: input.runId }).find(
        (event) =>
          event.kind === "c_call_judged" &&
          event.aggregateId === sourceCall.cCallRef &&
          isRecord(event.payload) &&
          event.payload.judgmentRef === sourceCall.judgmentRef,
      );
  const sourceResultValueDigest =
    resultEvent !== undefined &&
      isRecord(resultEvent.payload) &&
      typeof resultEvent.payload.valueDigest === "string"
      ? resultEvent.payload.valueDigest
      : null;
  const sourceResultAdmissionDigest =
    resultEvent !== undefined &&
      isRecord(resultEvent.payload) &&
      typeof resultEvent.payload.resultDigest === "string"
      ? resultEvent.payload.resultDigest
      : null;
  const sourceJudgmentMatches =
    judgmentEvent !== undefined &&
      isRecord(judgmentEvent.payload) &&
      judgmentEvent.graphCallId === resultEvent?.graphCallId &&
      judgmentEvent.payload.resultRef === sourceCall?.resultRef &&
      judgmentEvent.payload.resultDigest === sourceCall?.resultDigest &&
      judgmentEvent.payload.judgment === "advance" &&
      (
        resultEvent === undefined ||
        judgmentEvent.causationEventRefs.includes(resultEvent.eventId)
      );
  const sourceRunMatchesInvocation =
    sourceInvocation !== null &&
    hasInvocationRunBinding(store, sourceInvocation, input.runId);
  if (
    sourceInvocation === null ||
    !sourceRunMatchesInvocation ||
    sourceInvocation.invocationRef !== input.runtimeInvocationRef ||
    sourceReplay.runId !== input.runId ||
    sourceReplay.runtimeStatus !== "closed" ||
    sourceReplay.runClosedEventRef === null ||
    sourceCall === undefined ||
    sourceCall.status !== "judged" ||
    sourceCall.judgment !== "advance" ||
    sourceCall.resultRef === null ||
    sourceCall.resultDigest === null ||
    sourceCall.resultContractRef === null ||
    sourceCall.resultValue === null ||
    resultEvent === undefined ||
    resultEvent.graphCallId === null ||
    sourceResultValueDigest !==
      sha256Canonical(sourceCall.resultValue) ||
    sourceResultAdmissionDigest !== sourceCall.resultDigest ||
    !sourceJudgmentMatches ||
    !hasAdmittedProductSemanticsBasis(
      store,
      input.productSemanticsBasis,
    )
  ) {
    return null;
  }
  const body = {
    publicAuthorityDigest: input.publicAuthorityDigest,
    sourceInvocationAdmissionRef: input.invocationAdmissionRef,
    sourceInvocationRef: sourceInvocation.invocationRef,
    sourceRunId: input.runId,
    sourceGraphCallId: resultEvent.graphCallId,
    sourceGraphFunctionRef: resultEvent.graphFunctionRef,
    sourceCCallRef: sourceCall.cCallRef,
    sourceResultAdmissionEventRef: resultEvent.eventId,
    sourceResultJudgmentEventRef: judgmentEvent.eventId,
    sourceResultRef: sourceCall.resultRef,
    sourceResultDigest: sourceCall.resultDigest,
    sourceResultValueDigest: sourceResultValueDigest as Sha256Digest,
    sourceResultContractRef: sourceCall.resultContractRef,
    sourceResultValue: sourceCall.resultValue,
    sourceReplayRef: sourceReplay.replayRef,
    sourceReplayDigest: sourceReplay.replayDigest,
    sourceWorkspaceId: sourceInvocation.workspaceId,
    workspaceBindingId: sourceInvocation.workspaceBindingId,
    workspaceBindingDigest: sourceInvocation.workspaceBindingDigest,
  };
  const basisDigest = sha256Canonical(body as unknown as JsonValue);
  const basis = deepFreeze({
    kind: "invocation_source_result_basis" as const,
    schemaVersion: "5.0.0" as const,
    basisRef:
      `invocation-source-result://abiogenesis/${basisDigest.slice("sha256:".length)}`,
    basisDigest,
    ...body,
  }) as ProductInvocationSourceResultBasis;
  sourceResultBases.add(basis);
  return basis;
}

function validatedComputeRegimes(
  validation: ProgramValidation,
): readonly ("F_D" | "F_H" | "F_P")[] {
  const declared = new Set<"F_D" | "F_H" | "F_P">([
    ...validation.executableLeafRows.map((row) => row.fibre),
    ...validation.interactionLeafRows.map((row) => row.fibre),
  ]);
  return (["F_D", "F_P", "F_H"] as const).filter((regime) => declared.has(regime));
}

function validatedInteractionCapabilities(
  validation: ProgramValidation,
): readonly InvocationInteractionCapability[] {
  return validation.interactionLeafRows
    .map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    }))
    .sort((left, right) => left.requirementKey.localeCompare(right.requirementKey));
}

export function validateInvocationCapabilityBasis(input: Readonly<{
  actorRef: string;
  capabilityGrants: readonly CapabilityGrant[];
  policy: InvocationPolicyBasis;
  program: Readonly<GtlProgram>;
  programValidation: ProgramValidation;
  workspaceBinding: WorkspaceBinding;
}>): InvocationAdmissionRefusal | null {
  const exactComputeRegimes = validatedComputeRegimes(input.programValidation);
  const exactInteractionCapabilities = validatedInteractionCapabilities(
    input.programValidation,
  );
  if (
    !isInvocationPolicyBasis(input.policy) ||
    input.policy.authorityMode !== "trusted_developer" ||
    input.policy.authorityBasisId !== input.workspaceBinding.authorityBasisId ||
    input.policy.authorityBasisDigest !==
      input.workspaceBinding.authorityBasisDigest ||
    input.policy.authorizedActorRef !==
      input.workspaceBinding.authorizedActorRef ||
    input.actorRef !== input.workspaceBinding.authorizedActorRef ||
    input.policy.workspaceBindingId !== input.workspaceBinding.bindingId ||
    input.policy.workspaceBindingDigest !== input.workspaceBinding.bindingDigest ||
    input.policy.programRef !== input.program.programRef ||
    input.policy.programDigest !==
      sha256Canonical(input.program as unknown as JsonValue) ||
    input.policy.allowedComputeRegimes.join("\0") !== exactComputeRegimes.join("\0") ||
    sha256Canonical(
      input.policy.interactionCapabilities as unknown as JsonValue,
    ) !== sha256Canonical(
      exactInteractionCapabilities as unknown as JsonValue,
    ) ||
    input.policy.graphMaterialization !== "after_invocation_admission"
  ) {
    return refusal(
      "capability_mismatch",
      "root invocation policy differs from the admitted workspace, Program, compute fibres, or interaction requirements",
    );
  }
  const expectedGrantRows = [
    {
      operationId: "abg.operation.run.invoke",
      capabilityRef: DIRECT_INVOKE_CAPABILITY,
      interactionRequirementKeys: [] as readonly string[],
    },
    ...[
      ...new Set(
        exactInteractionCapabilities.map((row) => row.actorCapabilityRef),
      ),
    ].sort().flatMap((capabilityRef) => {
      const interactionRequirementKeys = exactInteractionCapabilities
        .filter((row) => row.actorCapabilityRef === capabilityRef)
        .map((row) => row.requirementKey);
      return [
        {
          operationId: "abg.operation.interaction.respond",
          capabilityRef,
          interactionRequirementKeys,
        },
        {
          operationId: "abg.operation.run.continue",
          capabilityRef,
          interactionRequirementKeys,
        },
      ];
    }),
  ];
  if (
    input.capabilityGrants.length !== expectedGrantRows.length ||
    new Set(input.capabilityGrants.map((grant) => grant.grantRef)).size !==
      input.capabilityGrants.length ||
    input.capabilityGrants.some((grant, index) => {
      const expected = expectedGrantRows[index];
      return (
        expected === undefined ||
        !isCapabilityGrant(grant) ||
        grant.actorRef !== input.actorRef ||
        grant.policyRef !== input.policy.policyRef ||
        grant.policyDigest !== input.policy.policyDigest ||
        grant.operationId !== expected.operationId ||
        grant.capabilityRef !== expected.capabilityRef ||
        grant.interactionRequirementKeys.join("\0") !==
          expected.interactionRequirementKeys.join("\0")
      );
    })
  ) {
    return refusal(
      "capability_mismatch",
      "invocation capability grants are absent, surplus, reordered, or inconsistent with the exact Program requirements",
    );
  }
  return null;
}

export function hasAdmittedInvocation(
  store: AbgEventStore,
  admission: InvocationAdmission,
): boolean {
  const body = {
    invocationRef: admission.invocationRef,
    invocationDigest: admission.invocationDigest,
    invocationVariant: admission.invocationVariant,
    rawInputAdmissionRef: admission.rawInputAdmissionRef,
    rawInputDigest: admission.rawInputDigest,
    publicRequestAdmissionRef: admission.publicRequestAdmissionRef,
    publicRequestDigest: admission.publicRequestDigest,
    publicRequestInvocationRef: admission.publicRequestInvocationRef,
    workspaceId: admission.workspaceId,
    workspaceBindingId: admission.workspaceBindingId,
    workspaceBindingDigest: admission.workspaceBindingDigest,
    catalogViewId: admission.catalogViewId,
    catalogViewDigest: admission.catalogViewDigest,
    programRef: admission.programRef,
    programDigest: admission.programDigest,
    graphFunctionRef: admission.graphFunctionRef,
    graphFunctionDigest: admission.graphFunctionDigest,
    inputContractRef: admission.inputContractRef,
    outputContractRef: admission.outputContractRef,
    programValidationRef: admission.programValidationRef,
    programValidationDigest: admission.programValidationDigest,
    policyRef: admission.policyRef,
    policyDigest: admission.policyDigest,
    capabilityGrants: admission.capabilityGrants,
    capabilityGrantRefs: admission.capabilityGrantRefs,
    authorityRef: admission.authorityRef,
    authorityDigest: admission.authorityDigest,
    actorRef: admission.actorRef,
    publicStart: admission.publicStart,
    reentryBasis: admission.reentryBasis,
    sourceResultBasis: admission.sourceResultBasis,
  };
  const event = store.readAll().find((candidate) => candidate.eventId === admission.admissionEventRef);
  const publicEvent = store.readAll().find(
    (candidate) => candidate.eventId === admission.publicOperationEventRef,
  );
  return (
    sha256Canonical(body as unknown as JsonValue) === admission.invocationAdmissionDigest &&
    admission.invocationAdmissionRef === `invocation-admission://abiogenesis/${admission.invocationAdmissionDigest.slice("sha256:".length)}` &&
    publicEvent?.kind === "public_operation_admitted" &&
    isRecord(publicEvent.payload) &&
    publicEvent.payload.operationId === "abg.operation.run.invoke" &&
    publicEvent.payload.variant === admission.invocationVariant &&
    publicEvent.payload.invocationRef === admission.invocationRef &&
    publicEvent.payload.invocationDigest === admission.invocationDigest &&
    publicEvent.payload.authorityRef === admission.authorityRef &&
    event?.kind === "invocation_admitted" &&
    isRecord(event.payload) &&
    event.payload.invocationAdmissionRef === admission.invocationAdmissionRef &&
    event.payload.invocationAdmissionDigest === admission.invocationAdmissionDigest &&
    event.causationEventRefs.includes(admission.publicOperationEventRef)
  );
}

export function hasInvocationRunBinding(
  store: AbgEventStore,
  admission: InvocationAdmission,
  runId: string,
): boolean {
  if (!hasAdmittedInvocation(store, admission)) return false;
  const runOpenEvents = store.readScope({ runId }).filter(
    (event) =>
      event.kind === "run_segment_opened" &&
      event.aggregateType === "run" &&
      event.aggregateId === runId &&
      event.runId === runId,
  );
  if (runOpenEvents.length !== 1) return false;
  const runOpen = runOpenEvents[0]!;
  const payload = runOpen.payload;
  return (
    isRecord(payload) &&
    runOpen.parentAggregateId === admission.workspaceBindingId &&
    runOpen.graphFunctionRef === admission.graphFunctionRef &&
    payload.runId === runId &&
    payload.invocationAdmissionRef === admission.invocationAdmissionRef &&
    payload.invocationRef === admission.invocationRef &&
    payload.workspaceBindingId === admission.workspaceBindingId &&
    payload.programRef === admission.programRef &&
    payload.graphFunctionRef === admission.graphFunctionRef
  );
}

export function rehydrateInvocationAdmission(
  store: AbgEventStore,
  invocationAdmissionRef: string,
): InvocationAdmission | null {
  const matches = store.readAll().filter(
    (event) =>
      event.kind === "invocation_admitted" &&
      isRecord(event.payload) &&
      event.payload.invocationAdmissionRef === invocationAdmissionRef,
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  if (
    event.causationEventRefs.length !== 1 ||
    !isRecord(event.payload)
  ) {
    return null;
  }
  const publicEvent = store.readAll().find(
    (candidate) =>
      candidate.eventId === event.causationEventRefs[0] &&
      candidate.kind === "public_operation_admitted",
  );
  if (publicEvent === undefined) return null;
  const admission = deepFreeze({
    kind: "invocation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    ...event.payload,
    publicOperationEventRef: publicEvent.eventId,
    admissionEventRef: event.eventId,
  }) as unknown as InvocationAdmission;
  return hasAdmittedInvocation(store, admission) ? admission : null;
}

export function admitInvocation(
  store: AbgEventStore,
  input: InvocationAdmissionInput,
  basis: PublicOperationAdmissionBasis,
): InvocationAdmissionResult {
  const invalidBasis = validatePublicOperationBasis(basis, "abg.operation.run.invoke");
  if (invalidBasis !== null) return invalidBasis;
  if (!isPublicInvocationCandidate(input.invocation)) {
    return refusal("invocation_not_constructed", "invocation was not constructed by the Product boundary");
  }
  if (
    basis.invocationRef !== input.invocation.invocationRef ||
    basis.authorityScopeRef !== input.workspaceBinding.bindingId ||
    basis.authorityScopeDigest !== input.workspaceBinding.bindingDigest
  ) {
    return refusal("authority_mismatch", "public operation basis differs from invocation or workspace authority");
  }
  if (!hasAdmittedWorkspaceBinding(store, input.workspaceBinding)) {
    return refusal("workspace_not_admitted", "invocation workspace binding lacks ABG admission truth");
  }
  if (!hasAdmittedCatalogView(store, input.catalogView)) {
    return refusal("catalog_view_not_admitted", "invocation CatalogView lacks ABG admission truth");
  }
  if (
    !isProgramValidation(input.programValidation) ||
    input.programValidation.programRef !== input.program.programRef ||
    input.programValidation.programDigest !== input.invocation.programDigest ||
    input.programValidation.publicationDigest !== sha256Canonical(input.modulePublication as unknown as JsonValue) ||
    !input.programValidation.graphFunctionDigests.includes(input.invocation.graphFunctionDigest)
  ) {
    return refusal("validation_mismatch", "Invocation requires the exact non-lowering ProgramValidation");
  }
  const selectedRow = input.catalogView.selectedRows.find(
    (row) =>
      (
        row.handle === input.graphFunction.name ||
        row.declarationOrContractRef === input.graphFunction.name
      ) &&
      row.programMembershipRefs.includes(input.program.programRef),
  );
  if (
    input.invocation.programRef !== input.program.programRef ||
    input.invocation.programDigest !== sha256Canonical(input.program as unknown as JsonValue) ||
    input.invocation.graphFunctionRef !== input.graphFunction.name ||
    input.invocation.graphFunctionDigest !== sha256Canonical(input.graphFunction as unknown as JsonValue) ||
    !input.program.callableMembership.includes(input.graphFunction.name) ||
    selectedRow?.kind !== "graph_function" ||
    selectedRow.disposition !== "admitted" ||
    !selectedRow.programMembershipRefs.includes(input.program.programRef)
  ) {
    return refusal("selection_mismatch", "selected Program and GraphFunction lack exact admitted membership");
  }
  const inputContract = input.modulePublication.contracts.find(
    (contract) => contract.contractRef === input.invocation.inputContractRef,
  );
  const outputContract = input.modulePublication.contracts.find(
    (contract) => contract.contractRef === input.invocation.outputContractRef,
  );
  if (
    !isRawAdmittedValue(input.rawInput) ||
    input.rawInput.subjectKind !== "invocation_input" ||
    input.rawInput.admissionRef !== input.invocation.rawInputAdmissionRef ||
    input.rawInput.subjectDigest !== input.invocation.rawInputDigest ||
    input.rawInput.contractRef !== input.invocation.inputContractRef ||
    inputContract?.contractKind !== "input" ||
    outputContract?.contractKind !== "output" ||
    !isRecord(input.rawInput.value) ||
    input.rawInput.value.kind !== inputContract.valueKind
  ) {
    return refusal("contract_mismatch", "raw input or declared input/output contract differs from invocation");
  }
  const request = input.rawRequest.value;
  const requestPayload = isRecord(request) && isRecord(request.payload)
    ? request.payload
    : null;
  const suppliedReentryAuthority =
    requestPayload !== null && isRecord(requestPayload.reentryAuthority)
      ? requestPayload.reentryAuthority
      : null;
  const suppliedSourceProjectionAuthority =
    requestPayload !== null &&
      isRecord(requestPayload.sourceProjectionAuthority)
      ? requestPayload.sourceProjectionAuthority
      : null;
  const suppliedSourceResultRef =
    requestPayload !== null &&
      typeof requestPayload.sourceResultRef === "string"
      ? requestPayload.sourceResultRef
      : null;
  const resolvedPublicStart =
    input.invocation.variant === "start" &&
      requestPayload !== null &&
      typeof requestPayload.scope === "string" &&
      typeof requestPayload.target === "string" &&
      typeof requestPayload.until === "string" &&
      typeof requestPayload.rootMode === "string"
      ? resolveProgramStart(input.program, {
          scope: requestPayload.scope as "program",
          target: requestPayload.target,
          until: requestPayload.until as "converged",
          rootMode: requestPayload.rootMode as "direct" | "supervised",
          ...(typeof requestPayload.startRef === "string"
            ? { startRef: requestPayload.startRef }
            : {}),
        })
      : null;
  const rawTargetMatches =
    requestPayload !== null &&
    requestPayload.programRef === input.invocation.programRef &&
    (
      (
        input.invocation.variant === "direct" &&
        requestPayload.graphFunctionRef === input.invocation.graphFunctionRef
      ) ||
      (
        input.invocation.variant === "start" &&
        resolvedPublicStart?.kind === "resolved_program_start" &&
        resolvedPublicStart.start.graphFunctionRef ===
          input.invocation.graphFunctionRef
      )
    );
  if (
    !isRawAdmittedValue(input.rawRequest) ||
    input.rawRequest.subjectKind !== "public_operation_request" ||
    input.rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5" ||
    input.rawRequest.admissionRef !== input.invocation.publicRequestAdmissionRef ||
    input.rawRequest.subjectDigest !== input.invocation.publicRequestDigest ||
    !isRecord(request) ||
    request.operationId !== "abg.operation.run.invoke" ||
    request.variant !== input.invocation.variant ||
    request.invocationRef !== input.invocation.publicRequestInvocationRef ||
    !rawTargetMatches
  ) {
    return refusal(
      "authority_mismatch",
      "invocation target lacks exact raw caller-request admission",
    );
  }
  const priorGap =
    isRecord(input.rawInput.value) &&
      isRecord(input.rawInput.value.priorGap)
      ? input.rawInput.value.priorGap
      : null;
  const publicStart: PublicStartAdmissionIdentity | null =
    input.invocation.variant === "start" &&
      requestPayload !== null &&
      typeof requestPayload.programRef === "string" &&
      typeof requestPayload.scope === "string" &&
      typeof requestPayload.target === "string" &&
      typeof requestPayload.until === "string" &&
      typeof requestPayload.rootMode === "string" &&
      resolvedPublicStart?.kind === "resolved_program_start"
      ? {
          kind: "public_start_identity",
          schemaVersion: "5.0.0",
          programRef: requestPayload.programRef,
          graphFunctionRef: input.graphFunction.name,
          startRef: resolvedPublicStart.start.startRef,
          scope: requestPayload.scope as "program",
          target: requestPayload.target,
          until: requestPayload.until as "converged",
          rootMode: requestPayload.rootMode as "direct" | "supervised",
        }
      : null;
  if (input.reentryBasis === undefined) {
    if (suppliedReentryAuthority !== null || priorGap !== null) {
      return refusal(
        "authority_mismatch",
        "re-entry authority and prior gap must be admitted together",
      );
    }
  } else {
    const reentry = input.reentryBasis;
    const sourceInvocation = rehydrateInvocationAdmission(
      store,
      reentry.sourceInvocationAdmissionRef,
    );
    const sourceRouteEvent = store.readAll().find(
      (event) => event.eventId === reentry.sourceRouteEventRef,
    );
    const sourceStopEvent = store.readAll().find(
      (event) => event.eventId === reentry.sourceRunStoppedEventRef,
    );
    const sourceRoutePayload =
      sourceRouteEvent !== undefined && isRecord(sourceRouteEvent.payload)
        ? sourceRouteEvent.payload
        : null;
    const sourceStopPayload =
      sourceStopEvent !== undefined && isRecord(sourceStopEvent.payload)
        ? sourceStopEvent.payload
        : null;
    const sourceProjection =
      sourceRoutePayload !== null &&
        isRecord(sourceRoutePayload.nextActionProjection)
        ? sourceRoutePayload.nextActionProjection
        : null;
    const sourceAlreadyConsumed = store.readAll().some(
      (event) =>
        event.kind === "invocation_admitted" &&
        isRecord(event.payload) &&
        isRecord(event.payload.reentryBasis) &&
        event.payload.reentryBasis.sourceInvocationAdmissionRef ===
          reentry.sourceInvocationAdmissionRef &&
        event.payload.reentryBasis.sourceRunId === reentry.sourceRunId &&
        event.payload.reentryBasis.sourceRouteRef === reentry.sourceRouteRef &&
        event.payload.reentryBasis.sourceRouteDigest ===
          reentry.sourceRouteDigest &&
        event.payload.reentryBasis.sourceRunStoppedEventRef ===
          reentry.sourceRunStoppedEventRef &&
        event.payload.reentryBasis.gapRef === reentry.gapRef &&
        event.payload.reentryBasis.nextActionProjectionRef ===
          reentry.nextActionProjectionRef &&
        event.payload.reentryBasis.nextActionProjectionDigest ===
          reentry.nextActionProjectionDigest,
    );
    if (
      input.invocation.variant !== "start" ||
      publicStart === null ||
      reentry.kind !== "invocation_reentry_basis" ||
      reentry.schemaVersion !== "5.0.0" ||
      suppliedReentryAuthority?.authorityDigest !==
        reentry.publicAuthorityDigest ||
      sourceInvocation === null ||
      sourceInvocation.invocationVariant !== "start" ||
      sourceInvocation.publicStart === null ||
      sha256Canonical(
        sourceInvocation.publicStart as unknown as JsonValue,
      ) !== sha256Canonical(
        reentry.sourceStart as unknown as JsonValue,
      ) ||
      sha256Canonical(publicStart as unknown as JsonValue) !==
        sha256Canonical(reentry.sourceStart as unknown as JsonValue) ||
      sourceInvocation.workspaceBindingId !==
        input.workspaceBinding.bindingId ||
      sourceInvocation.workspaceBindingDigest !==
        input.workspaceBinding.bindingDigest ||
      sourceInvocation.catalogViewId !== input.catalogView.viewId ||
      sourceInvocation.catalogViewDigest !== input.catalogView.viewDigest ||
      sourceInvocation.programRef !== input.program.programRef ||
      sourceInvocation.graphFunctionRef !== input.graphFunction.name ||
      reentry.productSetId !== input.workspaceBinding.productSetId ||
      reentry.productSetDigest !==
        input.workspaceBinding.productSetDigest ||
      reentry.lockId !== input.workspaceBinding.lockId ||
      reentry.lockDigest !== input.workspaceBinding.lockDigest ||
      sourceAlreadyConsumed ||
      sourceRouteEvent?.kind !== "traversal_route_admitted" ||
      sourceRouteEvent.runId !== reentry.sourceRunId ||
      sourceRoutePayload?.routeKind !== "gap_stop" ||
      sourceRoutePayload.routeRef !== reentry.sourceRouteRef ||
      sourceRoutePayload.routeDigest !== reentry.sourceRouteDigest ||
      sourceRoutePayload.nextActionProjectionRef !==
        reentry.nextActionProjectionRef ||
      sourceRoutePayload.nextActionProjectionDigest !==
        reentry.nextActionProjectionDigest ||
      sourceProjection?.gapRef !== reentry.gapRef ||
      sourceStopEvent?.kind !== "run_stopped" ||
      sourceStopEvent.runId !== reentry.sourceRunId ||
      !sourceStopEvent.causationEventRefs.includes(
        reentry.sourceRouteEventRef,
      ) ||
      sourceStopPayload?.disposition !== "gap_stop" ||
      sourceStopPayload.routeRef !== reentry.sourceRouteRef ||
      priorGap?.sourceRunId !== reentry.sourceRunId ||
      priorGap.sourceRouteRef !== reentry.sourceRouteRef ||
      priorGap.gapRef !== reentry.gapRef ||
      priorGap.nextActionProjectionRef !==
        reentry.nextActionProjectionRef ||
      priorGap.nextActionProjectionDigest !==
        reentry.nextActionProjectionDigest
    ) {
      return refusal(
        "authority_mismatch",
        "re-entry requires the exact durable gap stop, Product observation, and installed invocation basis",
      );
    }
  }
  if (input.sourceResultBasis === undefined) {
    if (
      suppliedSourceProjectionAuthority !== null ||
      suppliedSourceResultRef !== null
    ) {
      return refusal(
        "authority_mismatch",
        "source result authority and its ABG-derived basis must be admitted together",
      );
    }
  } else if (
    suppliedSourceProjectionAuthority === null ||
    suppliedSourceResultRef === null ||
    !isInvocationSourceResultBasis(input.sourceResultBasis) ||
    suppliedSourceProjectionAuthority.authorityDigest !==
      input.sourceResultBasis.publicAuthorityDigest ||
    suppliedSourceResultRef !== input.sourceResultBasis.sourceResultRef
  ) {
    return refusal(
      "authority_mismatch",
      "source result basis differs from the durable public authority or selected result",
    );
  }
  const capabilityRefusal = validateInvocationCapabilityBasis({
    actorRef: input.invocation.actorAttributionRef,
    capabilityGrants: input.capabilityGrants,
    policy: input.policy,
    program: input.program,
    programValidation: input.programValidation,
    workspaceBinding: input.workspaceBinding,
  });
  if (
    capabilityRefusal !== null ||
    input.policy.policyRef !== input.invocation.sessionPolicyRef ||
    input.policy.policyDigest !== input.invocation.sessionPolicyDigest ||
    input.invocation.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0") ||
    input.invocation.capabilityGrantDigests.join("\0") !== input.capabilityGrants.map((grant) => grant.grantDigest).join("\0")
  ) {
    return capabilityRefusal ?? refusal(
      "capability_mismatch",
      "invocation candidate differs from its exact admitted policy or grants",
    );
  }
  if (
    !isInvocationAuthority(input.authority) ||
    input.authority.actorRef.length === 0 ||
    input.authority.authorityRef !== input.invocation.invocationAuthorityRef ||
    input.authority.authorityDigest !== input.invocation.invocationAuthorityDigest ||
    input.authority.actorRef !== input.invocation.actorAttributionRef ||
    input.authority.workspaceBindingId !== input.workspaceBinding.bindingId ||
    input.authority.workspaceBindingDigest !==
      input.workspaceBinding.bindingDigest ||
    input.authority.catalogViewId !== input.catalogView.viewId ||
    input.authority.catalogViewDigest !== input.catalogView.viewDigest ||
    input.authority.programRef !== input.program.programRef ||
    input.authority.graphFunctionRef !== input.graphFunction.name ||
    input.authority.policyRef !== input.policy.policyRef ||
    input.authority.policyDigest !== input.policy.policyDigest ||
    input.authority.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0")
  ) {
    return refusal("authority_mismatch", "invocation authority does not cover the exact actor, environment, and target");
  }

  const programValidationDigest = sha256Canonical(input.programValidation as unknown as JsonValue);
  const admissionBody = {
    invocationRef: input.invocation.invocationRef,
    invocationDigest: input.invocation.invocationDigest,
    invocationVariant: input.invocation.variant,
    rawInputAdmissionRef: input.rawInput.admissionRef,
    rawInputDigest: input.rawInput.subjectDigest,
    publicRequestAdmissionRef: input.rawRequest.admissionRef,
    publicRequestDigest: input.rawRequest.subjectDigest,
    publicRequestInvocationRef: input.invocation.publicRequestInvocationRef,
    workspaceId: input.workspaceBinding.workspaceId,
    workspaceBindingId: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    catalogViewId: input.catalogView.viewId,
    catalogViewDigest: input.catalogView.viewDigest,
    programRef: input.program.programRef,
    programDigest: input.invocation.programDigest,
    graphFunctionRef: input.graphFunction.name,
    graphFunctionDigest: input.invocation.graphFunctionDigest,
    inputContractRef: input.invocation.inputContractRef,
    outputContractRef: input.invocation.outputContractRef,
    programValidationRef: input.programValidation.validationRef,
    programValidationDigest,
    policyRef: input.policy.policyRef,
    policyDigest: input.policy.policyDigest,
    capabilityGrants: input.capabilityGrants,
    capabilityGrantRefs: input.capabilityGrants.map((grant) => grant.grantRef),
    authorityRef: input.authority.authorityRef,
    authorityDigest: input.authority.authorityDigest,
    actorRef: input.authority.actorRef,
    publicStart,
    reentryBasis: input.reentryBasis ?? null,
    sourceResultBasis: input.sourceResultBasis ?? null,
  };
  const invocationAdmissionDigest = sha256Canonical(admissionBody as unknown as JsonValue);
  const invocationAdmissionRef = `invocation-admission://abiogenesis/${invocationAdmissionDigest.slice("sha256:".length)}`;
  const publicOperationEvent = admitRuntimeEvent(store, {
    kind: "public_operation_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: input.workspaceBinding.bindingId,
    parentAggregateId: input.invocation.invocationRef,
    causationEventRefs: basis.causationEventRefs,
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: input.authority.authorityRef,
    payload: {
      operationId: "abg.operation.run.invoke",
      definitionKey: basis.definitionKey,
      definitionDigest: basis.definitionDigest,
      variant: input.invocation.variant,
      invocationRef: input.invocation.invocationRef,
      invocationDigest: input.invocation.invocationDigest,
      actorRef: input.authority.actorRef,
      authorityRef: input.authority.authorityRef,
      authorityDigest: input.authority.authorityDigest,
      capabilityGrantRefs: input.capabilityGrants.map((grant) => grant.grantRef),
      policyRef: input.policy.policyRef,
      policyDigest: input.policy.policyDigest,
      workspaceBindingId: input.workspaceBinding.bindingId,
      catalogViewId: input.catalogView.viewId,
      programRef: input.program.programRef,
      graphFunctionRef: input.graphFunction.name,
    },
  });
  const admissionEvent = admitRuntimeEvent(store, {
    kind: "invocation_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: input.workspaceBinding.bindingId,
    parentAggregateId: input.invocation.invocationRef,
    causationEventRefs: [publicOperationEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: invocationAdmissionRef,
    payload: {
      invocationAdmissionRef,
      invocationAdmissionDigest,
      ...admissionBody,
    } as unknown as JsonValue,
  });
  return deepFreeze({
    kind: "invocation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    invocationAdmissionRef,
    invocationAdmissionDigest,
    ...admissionBody,
    publicOperationEventRef: publicOperationEvent.eventId,
    admissionEventRef: admissionEvent.eventId,
  }) as InvocationAdmission;
}
