import type {
  GraphFunction,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import { resolveProgramStart } from "../gtl/public_start.js";
import {
  resolveCProgramTermAtSourcePath,
  rootCTraversalCoordinate,
  type CTraversalCoordinate,
} from "../gtl/source_path.js";
import {
  DIRECT_INVOKE_CAPABILITY,
  type CapabilityGrant,
  type DeclarationApplication,
  type GraphFunctionCatalogView,
  type InvocationAuthority,
  type InvocationInteractionCapability,
  type InvocationPolicyBasis,
  type ProductInvocationSourceResultBasis,
  type PublicInvocationCandidate,
  type RunInvocationVariant,
  type WorkspaceBinding,
} from "../product/index.js";
import type { ExactDirectRunInvocation } from "../product/invocation.js";
import {
  applyCatalogDeclaration,
  lookupGraphFunction,
  lookupGraphFunctionDefinition,
} from "../product/catalog.js";
import {
  isCapabilityGrant,
  isInvocationAuthority,
  isInvocationPolicyBasis,
  isPublicInvocationCandidate,
} from "../product/invocation.js";
import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
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
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import {
  projectEffectfulPublicInvocationTruthAtPrefix,
  type EffectfulPublicInvocationPriorAdmission,
  type EffectfulPublicInvocationTruth,
} from "./effectful_invocation_truth.js";
import {
  hasAdmittedWorkspaceBinding,
  validatePublicOperationBasis,
  type AbgAdmissionRefusal,
  type PublicOperationAdmissionBasis,
} from "./environment_admission.js";
import {
  AbgEventStore,
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  admitRuntimeEvent,
  assertHeldEventStoreAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  hasExactInvocationAdmissionAtPrefix,
  hasExactInvocationRunBindingAtPrefix,
  projectExactInvocationAdmissionAtPrefix,
} from "./invocation_execution_truth.js";
import { replayValidatedRuntimeEventPrefix } from "./replay.js";

export interface InvocationAdmissionInput {
  readonly invocation: PublicInvocationCandidate;
  readonly rawRequest: RawAdmittedValue<unknown>;
  readonly rawInput: RawAdmittedValue<unknown>;
  readonly modulePublication: Readonly<ModulePublication>;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly programValidation: ProgramValidation;
  readonly workspaceBinding: WorkspaceBinding;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly catalogView: GraphFunctionCatalogView;
  readonly catalogApplications?: readonly DeclarationApplication[];
  readonly policy: InvocationPolicyBasis;
  readonly capabilityGrants: readonly CapabilityGrant[];
  readonly authority: InvocationAuthority;
  readonly reentryBasis?: InvocationReentryBasis;
  readonly sourceResultBasis?: ProductInvocationSourceResultBasis;
}

export interface ExactInvocationAdmissionInput
  extends Omit<InvocationAdmissionInput, "rawRequest"> {
  readonly publicInvocation: ExactDirectRunInvocation;
}

type InvocationRequestBasis =
  | Readonly<{
    readonly family: "legacy_root_public";
    readonly rawRequest: RawAdmittedValue<unknown>;
  }>
  | Readonly<{
    readonly family: "exact_public_definition";
    readonly publicInvocation: ExactDirectRunInvocation;
  }>;

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
  readonly catalogBasisRef: string;
  readonly catalogBasisDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly catalogApplicationRefs: readonly string[];
  readonly catalogApplicationDigests: readonly Sha256Digest[];
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly catalogHandle: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly selectedDefinitionRef: string;
  readonly selectedDefinitionDigest: Sha256Digest;
  readonly gtlEntryCoordinate: CTraversalCoordinate;
  readonly gtlEntryTerm: Readonly<CProgramNode>;
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

export interface InvocationAdmissionReceipt {
  readonly kind: "invocation_admission_receipt";
  readonly schemaVersion: "5.0.0";
  readonly admission: InvocationAdmission;
  readonly successorPrefix: DurablePrefixCoordinate;
}

type InvocationAdmissionSemanticRefusalCode =
  | "authority_mismatch"
  | "capability_mismatch"
  | "catalog_view_not_admitted"
  | "contract_mismatch"
  | "invocation_not_constructed"
  | "selection_mismatch"
  | "validation_mismatch"
  | "workspace_not_admitted";

interface InvocationAdmissionSemanticRefusal {
  readonly kind: "invocation_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: InvocationAdmissionSemanticRefusalCode;
  readonly message: string;
}

export interface DuplicateInvocationAdmissionRefusal {
  readonly kind: "invocation_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "duplicate_invocation";
  readonly message: string;
  readonly priorAdmission: EffectfulPublicInvocationPriorAdmission;
}

export type InvocationAdmissionRefusal =
  | InvocationAdmissionSemanticRefusal
  | DuplicateInvocationAdmissionRefusal;

export type InvocationAdmissionResult =
  | InvocationAdmissionReceipt
  | InvocationAdmissionRefusal
  | AbgAdmissionRefusal
  | Extract<EffectfulPublicInvocationTruth, {
      readonly disposition: "invalid_history";
    }>;

function refusal(
  code: InvocationAdmissionSemanticRefusalCode,
  message: string,
): InvocationAdmissionSemanticRefusal {
  return {
    kind: "invocation_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function duplicateInvocationRefusal(
  priorAdmission: EffectfulPublicInvocationPriorAdmission,
): DuplicateInvocationAdmissionRefusal {
  return deepFreeze({
    kind: "invocation_admission_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code: "duplicate_invocation" as const,
    message: "the exact invocation admission already exists at the current durable prefix",
    priorAdmission,
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function catalogViewRef(view: GraphFunctionCatalogView): string {
  return `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`;
}

export interface InvocationSourceResultDerivationInput {
  readonly publicAuthorityDigest: Sha256Digest;
  readonly runtimeInvocationRef: string;
  readonly invocationAdmissionRef: string;
  readonly runId: string;
  readonly resultRef: string;
}

export function isInvocationSourceResultBasis(
  value: object,
): value is ProductInvocationSourceResultBasis {
  try {
    if (!isRecord(value)) return false;
    const expectedKeys = [
      "basisDigest",
      "basisRef",
      "kind",
      "publicAuthorityDigest",
      "schemaVersion",
      "sourceCCallRef",
      "sourceGraphCallId",
      "sourceGraphFunctionRef",
      "sourceInvocationAdmissionRef",
      "sourceInvocationRef",
      "sourceReplayDigest",
      "sourceReplayRef",
      "sourceResultAdmissionEventRef",
      "sourceResultContractRef",
      "sourceResultDigest",
      "sourceResultJudgmentEventRef",
      "sourceResultRef",
      "sourceResultValue",
      "sourceResultValueDigest",
      "sourceRunId",
      "sourceWorkspaceId",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ];
    if (Object.keys(value).sort().join("\0") !== expectedKeys.join("\0")) {
      return false;
    }
    const digestFields = [
      "basisDigest",
      "publicAuthorityDigest",
      "sourceReplayDigest",
      "sourceResultDigest",
      "sourceResultValueDigest",
      "workspaceBindingDigest",
    ] as const;
    const refFields = [
      "basisRef",
      "sourceCCallRef",
      "sourceGraphCallId",
      "sourceGraphFunctionRef",
      "sourceInvocationAdmissionRef",
      "sourceInvocationRef",
      "sourceReplayRef",
      "sourceResultAdmissionEventRef",
      "sourceResultContractRef",
      "sourceResultJudgmentEventRef",
      "sourceResultRef",
      "sourceRunId",
      "sourceWorkspaceId",
      "workspaceBindingId",
    ] as const;
    if (
      value.kind !== "invocation_source_result_basis" ||
      value.schemaVersion !== "5.0.0" ||
      digestFields.some((field) =>
        typeof value[field] !== "string" ||
        !/^sha256:[a-f0-9]{64}$/u.test(value[field] as string)
      ) ||
      refFields.some((field) =>
        typeof value[field] !== "string" ||
        (value[field] as string).length === 0
      ) ||
      value.sourceResultValueDigest !==
        sha256Canonical(value.sourceResultValue as JsonValue)
    ) return false;
    const {
      kind: _kind,
      schemaVersion: _schemaVersion,
      basisRef: _basisRef,
      basisDigest: _basisDigest,
      ...body
    } = value;
    const basisDigest = sha256Canonical(body as unknown as JsonValue);
    return value.basisDigest === basisDigest &&
      value.basisRef ===
        `invocation-source-result://abiogenesis/${basisDigest.slice("sha256:".length)}`;
  } catch {
    return false;
  }
}

export function deriveInvocationSourceResultBasisAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  input: InvocationSourceResultDerivationInput,
): ProductInvocationSourceResultBasis | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const runPrefix = selectValidatedRuntimeEventPrefix(events, {
    runId: input.runId,
  });
  const runEvents = runtimeEventsFromValidatedPrefix(runPrefix);
  const sourceInvocation = rehydrateInvocationAdmissionAtPrefix(
    prefix,
    input.invocationAdmissionRef,
  );
  const sourceReplay = replayValidatedRuntimeEventPrefix(runPrefix, prefix);
  const sourceCall = sourceReplay.cCalls.find(
    (row) => row.resultRef === input.resultRef,
  );
  const resultEvent = sourceCall === undefined
    ? undefined
    : runEvents.find(
        (event) =>
          event.kind === "c_call_result_admitted" &&
          event.aggregateId === sourceCall.cCallRef &&
          isRecord(event.payload) &&
          event.payload.resultRef === input.resultRef,
      );
  const judgmentEvent = sourceCall === undefined
    ? undefined
    : runEvents.find(
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
    hasInvocationRunBindingAtPrefix(prefix, sourceInvocation, input.runId);
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
    !sourceJudgmentMatches
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
    .sort((left, right) =>
      compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
}

export function validateInvocationCapabilityBasis(input: Readonly<{
  actorRef: string;
  capabilityGrants: readonly CapabilityGrant[];
  catalogApplications?: readonly DeclarationApplication[];
  policy: InvocationPolicyBasis;
  program: Readonly<GtlProgram>;
  programValidation: ProgramValidation;
  workspaceBinding: WorkspaceBinding;
}>): InvocationAdmissionRefusal | null {
  const exactComputeRegimes = validatedComputeRegimes(input.programValidation);
  const exactInteractionCapabilities = validatedInteractionCapabilities(
    input.programValidation,
  );
  const exactCatalogApplications = [...(input.catalogApplications ?? [])]
    .sort((left, right) =>
      compareUnicodeCodeUnits(left.applicationRef, right.applicationRef)
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
    input.policy.catalogApplicationRefs.join("\0") !==
      exactCatalogApplications.map(
        (application) => application.applicationRef,
      ).join("\0") ||
    input.policy.catalogApplicationDigests.join("\0") !==
      exactCatalogApplications.map(
        (application) => application.applicationDigest,
      ).join("\0") ||
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
  return hasAdmittedInvocationAtPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
    admission,
  );
}

export function hasAdmittedInvocationAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admission: InvocationAdmission,
): boolean {
  return hasExactInvocationAdmissionAtPrefix(prefix, admission);
}

export function hasInvocationRunBindingAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admission: InvocationAdmission,
  runId: string,
): boolean {
  return hasExactInvocationRunBindingAtPrefix(prefix, admission, runId);
}

export function rehydrateInvocationAdmissionAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  invocationAdmissionRef: string,
): InvocationAdmission | null {
  return projectExactInvocationAdmissionAtPrefix(
    prefix,
    invocationAdmissionRef,
  );
}

function admitInvocationWithRequest(
  store: AbgEventStore,
  input: Omit<InvocationAdmissionInput, "rawRequest">,
  basis: PublicOperationAdmissionBasis,
  requestBasis: InvocationRequestBasis,
): InvocationAdmissionResult {
  const catalogApplications = input.catalogApplications ?? [];
  const expectedMemberKey = input.invocation.variant === "direct"
    ? "invoke"
    : input.invocation.variant;
  const invalidBasis = validatePublicOperationBasis(
    basis,
    "abg.operation.run.invoke",
    expectedMemberKey,
  );
  if (invalidBasis !== null) return invalidBasis;
  if (!isPublicInvocationCandidate(input.invocation)) {
    return refusal("invocation_not_constructed", "invocation was not constructed by the Product boundary");
  }
  if (
    basis.invocationRef !== input.invocation.publicRequestInvocationRef ||
    basis.authorityScopeRef !== input.workspaceBinding.bindingId ||
    basis.authorityScopeDigest !== input.workspaceBinding.bindingDigest
  ) {
    return refusal("authority_mismatch", "public operation basis differs from invocation or workspace authority");
  }
  if (!hasAdmittedWorkspaceBinding(input.artifactTruth, input.workspaceBinding)) {
    return refusal("workspace_not_admitted", "invocation workspace binding lacks ABG admission truth");
  }
  let predecessorPrefix: ValidatedRuntimeEventPrefix;
  try {
    assertHeldEventStoreAtDurablePrefix(store, input.artifactTruth.prefix);
    predecessorPrefix = selectValidatedRuntimeEventPrefix(
      readRuntimeEventsAtDurablePrefix(input.artifactTruth.prefix),
    );
  } catch {
    return refusal(
      "authority_mismatch",
      "invocation admission requires the exact held artifact-truth predecessor prefix",
    );
  }
  const invocationTruth = projectEffectfulPublicInvocationTruthAtPrefix(
    input.artifactTruth.prefix,
    basis.invocationRef,
  );
  if (invocationTruth.disposition === "invalid_history") {
    return invocationTruth;
  }
  if (invocationTruth.disposition === "duplicate") {
    return duplicateInvocationRefusal(invocationTruth.priorAdmission);
  }
  const exactCatalogApplications = catalogApplications.map((application) => {
    const reconstructed = applyCatalogDeclaration(input.catalogView, {
      applicationKind: application.declaration.declarationKind,
      handle: application.declaration.handle,
      targetRef: application.targetRef,
      targetDigest: application.targetDigest,
      appliedValueRef: application.appliedValueRef,
      appliedValueDigest: application.appliedValueDigest,
    });
    return reconstructed.kind === "declaration_application" &&
      canonicalJson(reconstructed as unknown as JsonValue) ===
        canonicalJson(application as unknown as JsonValue);
  });
  if (
    new Set(catalogApplications.map((row) => row.applicationRef)).size !==
      catalogApplications.length ||
    exactCatalogApplications.some((exact) => !exact) ||
    catalogApplications.some(
      (application) =>
        application.viewDigest !== input.catalogView.viewDigest ||
        application.catalogBasisDigest !== input.catalogView.catalogBasisDigest,
    )
  ) {
    return refusal(
      "catalog_view_not_admitted",
      "invocation catalog applications must be unique exact Product reconstructions under the supplied CatalogView",
    );
  }
  if (
    input.invocation.variant === "direct" &&
    input.program.policies["abg.root_mode"] === "supervised"
  ) {
    return refusal(
      "selection_mismatch",
      "a supervised Program cannot be admitted through direct invocation",
    );
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
  const request = requestBasis.family === "legacy_root_public"
    ? requestBasis.rawRequest.value
    : requestBasis.publicInvocation.request;
  const requestPayload = requestBasis.family === "legacy_root_public" &&
      isRecord(request) && isRecord(request.payload)
    ? request.payload
    : null;
  const exactRequest = requestBasis.family === "exact_public_definition"
    ? requestBasis.publicInvocation.request
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
  const directCatalogHandle =
    input.invocation.variant === "direct" &&
      exactRequest !== null &&
      typeof exactRequest.catalogHandle === "string"
      ? exactRequest.catalogHandle
      : input.invocation.variant === "direct" &&
          requestPayload !== null &&
          typeof requestPayload.catalogHandle === "string"
      ? requestPayload.catalogHandle
      : null;
  const definitionLookup = input.invocation.variant === "start" &&
      resolvedPublicStart?.kind === "resolved_program_start"
    ? lookupGraphFunctionDefinition(
        input.catalogView,
        resolvedPublicStart.start.graphFunctionRef,
        input.program.programRef,
      )
    : null;
  const selectedRow = input.invocation.variant === "direct"
    ? directCatalogHandle === null
      ? null
      : lookupGraphFunction(input.catalogView, directCatalogHandle)
    : definitionLookup?.kind === "graph_function_definition_lookup_exact"
      ? definitionLookup.entry
      : null;
  if (
    input.invocation.variant === "start" &&
    definitionLookup?.kind !== "graph_function_definition_lookup_exact"
  ) {
    return refusal(
      "selection_mismatch",
      definitionLookup?.kind ===
          "graph_function_definition_lookup_ambiguous"
        ? "Product start revalidation found ambiguous catalog definitions"
        : "Product start revalidation found no catalog definition",
    );
  }
  if (
    input.invocation.programRef !== input.program.programRef ||
    input.invocation.programDigest !==
      sha256Canonical(input.program as unknown as JsonValue) ||
    input.invocation.graphFunctionRef !== input.graphFunction.name ||
    input.invocation.graphFunctionDigest !==
      sha256Canonical(input.graphFunction as unknown as JsonValue) ||
    input.invocation.catalogHandle !== selectedRow?.handle ||
    input.invocation.selectedDefinitionRef !== selectedRow?.definitionRef ||
    input.invocation.selectedDefinitionDigest !== selectedRow?.definitionDigest ||
    !input.program.callableMembership.includes(input.graphFunction.name) ||
    selectedRow?.kind !== "graph_function_catalog_entry" ||
    selectedRow.definitionRef !== input.graphFunction.name ||
    selectedRow.definitionDigest !== input.invocation.graphFunctionDigest ||
    !selectedRow.programMembershipRefs.includes(input.program.programRef)
  ) {
    return refusal(
      "selection_mismatch",
      "selected catalog handle, definition, and Program lack exact admitted membership",
    );
  }
  const gtlEntryCoordinate = rootCTraversalCoordinate(
    input.graphFunction.template.startNodeRef,
  );
  const gtlEntryTerm = resolveCProgramTermAtSourcePath(
    input.graphFunction.template,
    gtlEntryCoordinate.nodeRef,
    gtlEntryCoordinate.termPath,
  );
  if (gtlEntryTerm.kind === "c_source_path_refusal") {
    return refusal(
      "selection_mismatch",
      "selected GraphFunction lacks one exact HoG root C entry",
    );
  }
  const requestProgramRef = exactRequest !== null &&
      isRecord(exactRequest.program) &&
      typeof exactRequest.program.ref === "string"
    ? exactRequest.program.ref
    : requestPayload !== null && typeof requestPayload.programRef === "string"
    ? requestPayload.programRef
    : null;
  const requestTargetMatches =
    requestProgramRef === input.invocation.programRef &&
    (
      (
        input.invocation.variant === "direct" &&
        directCatalogHandle === selectedRow.handle
      ) ||
      (
        input.invocation.variant === "start" &&
        resolvedPublicStart?.kind === "resolved_program_start" &&
        resolvedPublicStart.start.graphFunctionRef ===
          input.invocation.graphFunctionRef
      )
    );
  if (
    (
      requestBasis.family === "legacy_root_public"
        ? !isRawAdmittedValue(requestBasis.rawRequest) ||
          requestBasis.rawRequest.subjectKind !== "public_operation_request" ||
          requestBasis.rawRequest.contractRef !==
            "contract://abiogenesis/public/run-invoke-request@5" ||
          requestBasis.rawRequest.admissionRef !==
            input.invocation.publicRequestAdmissionRef ||
          requestBasis.rawRequest.subjectDigest !==
            input.invocation.publicRequestDigest ||
          !isRecord(request) ||
          request.operationId !== "abg.operation.run.invoke" ||
          request.variant !== input.invocation.variant ||
          request.invocationRef !== input.invocation.publicRequestInvocationRef
        : requestBasis.publicInvocation.kind !== "public_invocation" ||
          requestBasis.publicInvocation.schemaVersion !== "5.0.0" ||
          requestBasis.publicInvocation.definitionKey.operationId !==
            "abg.operation.run.invoke" ||
          requestBasis.publicInvocation.definitionKey.memberKey !== "invoke" ||
          requestBasis.publicInvocation.requestRef !==
            input.invocation.publicRequestAdmissionRef ||
          requestBasis.publicInvocation.requestDigest !==
            input.invocation.publicRequestDigest ||
          requestBasis.publicInvocation.invocationRef !==
            input.invocation.publicRequestInvocationRef ||
          requestBasis.publicInvocation.requestDigest !==
            sha256Canonical(request as unknown as JsonValue) ||
          basis.definitionDigest !==
            requestBasis.publicInvocation.definitionDigest ||
          basis.invocationPayloadDigest !==
            requestBasis.publicInvocation.requestDigest ||
          basis.invocationDigest !==
            requestBasis.publicInvocation.invocationDigest
    ) ||
    !requestTargetMatches
  ) {
    return refusal(
      "authority_mismatch",
      "invocation target lacks exact caller-request admission",
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
    const predecessorEvents = runtimeEventsFromValidatedPrefix(
      predecessorPrefix,
    );
    const sourceInvocation = rehydrateInvocationAdmissionAtPrefix(
      predecessorPrefix,
      reentry.sourceInvocationAdmissionRef,
    );
    const sourceReplay = (() => {
      try {
        return replayValidatedRuntimeEventPrefix(
          selectValidatedRuntimeEventPrefix(predecessorEvents, {
            runId: reentry.sourceRunId,
          }),
          predecessorPrefix,
        );
      } catch {
        return null;
      }
    })();
    const sourceRoute = sourceReplay?.routes.find(
      (route) => route.admissionEventRef === reentry.sourceRouteEventRef,
    );
    const sourceProjection = sourceRoute?.nextActionProjection ?? null;
    const sourceAlreadyConsumed = predecessorEvents.some(
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
      sourceInvocation.catalogViewId !== catalogViewRef(input.catalogView) ||
      sourceInvocation.catalogViewDigest !== input.catalogView.viewDigest ||
      sourceInvocation.programRef !== input.program.programRef ||
      sourceInvocation.graphFunctionRef !== input.graphFunction.name ||
      reentry.productSetId !== input.workspaceBinding.productSetId ||
      reentry.productSetDigest !==
        input.workspaceBinding.productSetDigest ||
      reentry.lockId !== input.workspaceBinding.lockId ||
      reentry.lockDigest !== input.workspaceBinding.lockDigest ||
      sourceAlreadyConsumed ||
      sourceReplay?.runId !== reentry.sourceRunId ||
      sourceRoute?.routeKind !== "gap_stop" ||
      sourceRoute.routeRef !== reentry.sourceRouteRef ||
      sourceRoute.routeDigest !== reentry.sourceRouteDigest ||
      sourceRoute.nextActionProjectionRef !==
        reentry.nextActionProjectionRef ||
      sourceRoute.nextActionProjectionDigest !==
        reentry.nextActionProjectionDigest ||
      sourceProjection?.gapRef !== reentry.gapRef ||
      sourceReplay.runStoppedEventRef !==
        reentry.sourceRunStoppedEventRef ||
      sourceReplay.runStoppedDisposition !== "gap_stop" ||
      sourceReplay.runtimeStatus !== "gap_stopped" ||
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
  } else {
    const suppliedBasis = input.sourceResultBasis;
    const exactBasis = isInvocationSourceResultBasis(suppliedBasis)
      ? deriveInvocationSourceResultBasisAtPrefix(predecessorPrefix, {
          publicAuthorityDigest: suppliedBasis.publicAuthorityDigest,
          runtimeInvocationRef: suppliedBasis.sourceInvocationRef,
          invocationAdmissionRef:
            suppliedBasis.sourceInvocationAdmissionRef,
          runId: suppliedBasis.sourceRunId,
          resultRef: suppliedBasis.sourceResultRef,
        })
      : null;
    if (
      suppliedSourceProjectionAuthority === null ||
      suppliedSourceResultRef === null ||
      exactBasis === null ||
      canonicalJson(exactBasis as unknown as JsonValue) !==
        canonicalJson(suppliedBasis as unknown as JsonValue) ||
      suppliedSourceProjectionAuthority.authorityDigest !==
        suppliedBasis.publicAuthorityDigest ||
      suppliedSourceResultRef !== suppliedBasis.sourceResultRef
    ) {
      return refusal(
        "authority_mismatch",
        "source result basis differs from its exact predecessor events, durable public authority, or selected result",
      );
    }
  }
  const capabilityRefusal = validateInvocationCapabilityBasis({
    actorRef: input.invocation.actorAttributionRef,
    capabilityGrants: input.capabilityGrants,
    catalogApplications,
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
    input.authority.catalogBasisDigest !== input.catalogView.catalogBasisDigest ||
    input.authority.catalogViewDigest !== input.catalogView.viewDigest ||
    input.authority.catalogViewDigest !== input.catalogView.viewDigest ||
    input.authority.programRef !== input.program.programRef ||
    input.authority.catalogHandle !== selectedRow.handle ||
    input.authority.selectedDefinitionRef !== selectedRow.definitionRef ||
    input.authority.selectedDefinitionDigest !== selectedRow.definitionDigest ||
    input.authority.graphFunctionRef !== input.graphFunction.name ||
    input.authority.policyRef !== input.policy.policyRef ||
    input.authority.policyDigest !== input.policy.policyDigest ||
    input.authority.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0")
  ) {
    return refusal("authority_mismatch", "invocation authority does not cover the exact actor, environment, and target");
  }

  const programValidationDigest = sha256Canonical(
    input.programValidation as unknown as JsonValue,
  );
  const admissionBody = {
    invocationRef: input.invocation.invocationRef,
    invocationDigest: input.invocation.invocationDigest,
    invocationVariant: input.invocation.variant,
    rawInputAdmissionRef: input.rawInput.admissionRef,
    rawInputDigest: input.rawInput.subjectDigest,
    publicRequestAdmissionRef: requestBasis.family === "legacy_root_public"
      ? requestBasis.rawRequest.admissionRef
      : requestBasis.publicInvocation.requestRef,
    publicRequestDigest: requestBasis.family === "legacy_root_public"
      ? requestBasis.rawRequest.subjectDigest
      : requestBasis.publicInvocation.requestDigest,
    publicRequestInvocationRef: input.invocation.publicRequestInvocationRef,
    workspaceId: input.workspaceBinding.workspaceId,
    workspaceBindingId: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    catalogBasisRef: `graph-function-catalog://abiogenesis/${input.catalogView.catalogBasisDigest.slice("sha256:".length)}`,
    catalogBasisDigest: input.catalogView.catalogBasisDigest,
    catalogViewId: catalogViewRef(input.catalogView),
    catalogViewDigest: input.catalogView.viewDigest,
    catalogApplicationRefs: [...catalogApplications]
      .sort((left, right) =>
        compareUnicodeCodeUnits(left.applicationRef, right.applicationRef)
      )
      .map((application) => application.applicationRef),
    catalogApplicationDigests: [...catalogApplications]
      .sort((left, right) =>
        compareUnicodeCodeUnits(left.applicationRef, right.applicationRef)
      )
      .map((application) => application.applicationDigest),
    programRef: input.program.programRef,
    programDigest: input.invocation.programDigest,
    catalogHandle: selectedRow.handle,
    graphFunctionRef: input.graphFunction.name,
    graphFunctionDigest: input.invocation.graphFunctionDigest,
    selectedDefinitionRef: selectedRow.definitionRef,
    selectedDefinitionDigest: selectedRow.definitionDigest,
    gtlEntryCoordinate,
    gtlEntryTerm,
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
  const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
    store,
    input.artifactTruth.prefix,
    () => {
      const publicOperationEvent = admitRuntimeEvent(store, {
        kind: "public_operation_admitted",
        eventTime: basis.eventTime,
        aggregateType: "workspace",
        aggregateId: input.workspaceBinding.bindingId,
        parentAggregateId: input.invocation.invocationRef,
        causationEventRefs: [...basis.causationEventRefs],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: input.authority.authorityRef,
        payload: {
          operationId: "abg.operation.run.invoke",
          memberKey: basis.memberKey,
          definitionDigest: basis.definitionDigest,
          variant: input.invocation.variant,
          invocationRef: input.invocation.invocationRef,
          invocationDigest: input.invocation.invocationDigest,
          actorRef: input.authority.actorRef,
          authorityRef: input.authority.authorityRef,
          authorityDigest: input.authority.authorityDigest,
          capabilityGrantRefs:
            input.capabilityGrants.map((grant) => grant.grantRef),
          catalogApplicationRefs: admissionBody.catalogApplicationRefs,
          catalogApplicationDigests:
            admissionBody.catalogApplicationDigests,
          policyRef: input.policy.policyRef,
          policyDigest: input.policy.policyDigest,
          workspaceBindingId: input.workspaceBinding.bindingId,
          catalogBasisRef: admissionBody.catalogBasisRef,
          catalogBasisDigest: admissionBody.catalogBasisDigest,
          catalogViewId: catalogViewRef(input.catalogView),
          programRef: input.program.programRef,
          catalogHandle: admissionBody.catalogHandle,
          graphFunctionRef: input.graphFunction.name,
          selectedDefinitionRef: admissionBody.selectedDefinitionRef,
          selectedDefinitionDigest: admissionBody.selectedDefinitionDigest,
          programValidationRef: admissionBody.programValidationRef,
          programValidationDigest: admissionBody.programValidationDigest,
          gtlEntryCoordinate: admissionBody.gtlEntryCoordinate,
          gtlEntryTerm: admissionBody.gtlEntryTerm,
        } as unknown as JsonValue,
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
      return { publicOperationEvent, admissionEvent };
    },
  );
  const { publicOperationEvent, admissionEvent } = committed.value;
  const admission = deepFreeze({
    kind: "invocation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    invocationAdmissionRef,
    invocationAdmissionDigest,
    ...admissionBody,
    publicOperationEventRef: publicOperationEvent.eventId,
    admissionEventRef: admissionEvent.eventId,
  }) as InvocationAdmission;
  return deepFreeze({
    kind: "invocation_admission_receipt" as const,
    schemaVersion: "5.0.0" as const,
    admission,
    successorPrefix: committed.successorPrefix,
  });
}

export function admitInvocation(
  store: AbgEventStore,
  input: InvocationAdmissionInput,
  basis: PublicOperationAdmissionBasis,
): InvocationAdmissionResult {
  const { rawRequest, ...ownerInput } = input;
  return admitInvocationWithRequest(
    store,
    ownerInput,
    basis,
    { family: "legacy_root_public", rawRequest },
  );
}

/**
 * ABG admission for the exact Public family. It consumes the admitted
 * invocation directly; no old Public request is synthesized or parsed.
 */
export function admitExactInvocation(
  store: AbgEventStore,
  input: ExactInvocationAdmissionInput,
  basis: PublicOperationAdmissionBasis,
): InvocationAdmissionResult {
  const { publicInvocation, ...ownerInput } = input;
  return admitInvocationWithRequest(
    store,
    ownerInput,
    basis,
    { family: "exact_public_definition", publicInvocation },
  );
}
