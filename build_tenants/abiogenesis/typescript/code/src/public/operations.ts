import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as abg from "../abg/index.js";
import * as gtl from "../gtl/index.js";
import * as hog from "../hog/index.js";
import * as product from "../product/index.js";
import * as validator from "../validator/index.js";
import { resolveExactMatch } from "../product/exact_match.js";
import type {
  CatalogContribution,
  ClosureContract,
  GtlGraph,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import { constructAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import { compareUnicodeCodeUnits } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { validateEventStoreCloseHandoff } from "../abg/event_store.js";
import type {
  PublicInvocationResult,
  PublicOutcome,
  RootPublicInvocation,
} from "./contracts.js";
import { parseRootPublicInvocation } from "./contracts.js";
import { bindChildTraversalPreparationPort } from "./child_traversal_port.js";
import {
  constructPublicContinuationAuthority,
  parsePublicContinuationAuthority,
  updatePublicContinuationAuthority,
  type PublicContinuationAuthority,
} from "./continuation_authority.js";
import {
  constructPublicGapAuthority,
  parsePublicGapAuthority,
  updatePublicGapAuthority,
  type PublicGapAuthority,
} from "./gap_authority.js";
import {
  attachContinuationAuthority,
  attachProjectionAuthority,
  projectOutcome,
} from "./outcome.js";
import {
  constructPublicRunProjectionAuthority,
  parsePublicRunProjectionAuthority,
  updatePublicRunProjectionAuthority,
  type PublicRunProjectionAuthority,
} from "./run_projection_authority.js";

type RootInvocationFor<
  O extends RootPublicInvocation["operationId"],
> = Extract<RootPublicInvocation, Readonly<{ readonly operationId: O }>>;

type RootInvocationVariantFor<
  O extends RootPublicInvocation["operationId"],
  V extends RootInvocationFor<O>["variant"],
> = Extract<RootInvocationFor<O>, Readonly<{ readonly variant: V }>>;

export interface RootOperationContext {
  readonly store: abg.AbgEventStore;
  prefix: abg.DurablePrefixCoordinate;
}

class ApplicationRefusal extends Error {
  constructor(
    readonly code:
      | "duplicate_invocation"
      | "invalid_request"
      | "missing_prerequisite"
      | "owner_refusal"
      | "target_mismatch",
    message: string,
    readonly priorAdmission:
      | abg.EffectfulPublicInvocationPriorAdmission
      | null = null,
  ) {
    super(message);
  }
}

type ProductResolutionDisposition =
  | "unresolved"
  | "incompatible"
  | "ambiguous"
  | "cyclic";

type TypedPublicRefusalDisposition =
  | ProductResolutionDisposition
  | "unready";

function productResolutionDisposition(
  code: product.EnvironmentRefusalCode,
): ProductResolutionDisposition | null {
  switch (code) {
    case "invalid_dependency":
    case "unresolved_dependency":
      return "unresolved";
    case "incompatible_dependency":
      return "incompatible";
    case "ambiguous_dependency":
    case "duplicate_install":
      return "ambiguous";
    case "cyclic_dependency":
      return "cyclic";
    default:
      return null;
  }
}

export function createRootOperationContext(
  eventLogPath: string,
): RootOperationContext {
  if (typeof eventLogPath !== "string" || eventLogPath.length === 0) {
    throw new TypeError("new Public episode requires one explicit durable event-log coordinate");
  }
  const acquired = abg.createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath: resolve(eventLogPath),
  });
  if (!("store" in acquired)) {
    throw new TypeError(
      `Public episode acquisition refused: ${acquired.code}: ${acquired.message}`,
    );
  }
  return {
    store: acquired.store,
    prefix: acquired.prefix,
  };
}

export function reopenRootOperationContext(
  handoff: abg.EventStoreCloseHandoff,
): RootOperationContext {
  const reopened = abg.reopenEventStore(handoff.reopenAuthority);
  if (reopened.kind !== "reopened_event_store_context") {
    throw new TypeError(
      `Public episode reopen refused: ${reopened.code}: ${reopened.message}`,
    );
  }
  if (
    product.sha256Canonical(reopened.prefix as unknown as product.JsonValue) !==
      product.sha256Canonical(handoff.prefix as unknown as product.JsonValue)
  ) {
    reopened.store.closeDurableLog();
    throw new TypeError("Public episode reopen returned a different durable prefix");
  }
  return {
    store: reopened.store,
    prefix: reopened.prefix,
  };
}

export function projectRootOperationContextAuthority(
  context: RootOperationContext,
): abg.EventStoreCloseHandoff {
  const handoff = context.store.projectReopenAuthorityAndClose();
  context.prefix = handoff.prefix;
  return handoff;
}

export function closeRootOperationContext(context: RootOperationContext): void {
  context.store.closeDurableLog();
}

function closeDurableContext(
  context: RootOperationContext,
): abg.EventStoreCloseHandoff {
  const handoff = context.store.projectReopenAuthorityAndClose();
  context.prefix = handoff.prefix;
  return handoff;
}

function requireExactRootOperationContextPrefix(
  context: RootOperationContext,
  prefix: abg.DurablePrefixCoordinate,
  authorityName: string,
): void {
  if (
    sha256Canonical(context.prefix as unknown as product.JsonValue) !==
      sha256Canonical(prefix as unknown as product.JsonValue)
  ) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      `${authorityName} prefix differs from the explicitly acquired Public episode`,
    );
  }
}

function isCoreRunProjectionVariant(variant: string): boolean {
  return ["gaps", "lawful-actions", "replay", "status"].includes(variant);
}

function stringField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): string {
  const value = payload[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be one explicit non-empty string`);
  }
  return value;
}

function stringArrayField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): readonly string[] {
  const value = payload[key];
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be an explicit string array`);
  }
  return value as readonly string[];
}

function recordField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): Readonly<Record<string, product.JsonValue>> {
  const value = payload[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be an explicit object`);
  }
  return value as Readonly<Record<string, product.JsonValue>>;
}

function recordArrayField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): readonly Readonly<Record<string, product.JsonValue>>[] {
  const value = payload[key];
  if (
    !Array.isArray(value) ||
    value.some((row) => typeof row !== "object" || row === null || Array.isArray(row))
  ) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be an explicit object array`);
  }
  return value as readonly Readonly<Record<string, product.JsonValue>>[];
}

interface ExactCatalogCarriers {
  readonly publications: readonly Readonly<ModulePublication>[];
  readonly catalog: product.ReadyGraphFunctionCatalog;
  readonly view: product.GraphFunctionCatalogView;
  readonly applications: readonly product.DeclarationApplication[];
}

function publicationForProgram(
  publications: readonly Readonly<ModulePublication>[],
  programRef: string,
): Readonly<ModulePublication> {
  const matches = publications.filter((publication) =>
    publication.programs.some((program) => program.programRef === programRef)
  );
  if (matches.length !== 1) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "durable authority does not carry one exact publication for its Program",
    );
  }
  return matches[0]!;
}

type RunProjectionProductBasis = Readonly<{
  install: product.ProductInstall;
  workspaceId: string;
  workspaceBindingId: string;
  workspaceBindingDigest: product.Sha256Digest;
  catalogBasisDigest: product.Sha256Digest;
  catalogReadinessBasis: product.CatalogReadinessBasis;
  catalogViewDigest: product.Sha256Digest;
  publicationDigests: readonly product.Sha256Digest[];
  publications: readonly Readonly<ModulePublication>[];
}>;

function revalidateExactCatalog(
  payload: Readonly<Record<string, product.JsonValue>>,
): product.ReadyGraphFunctionCatalog {
  const supplied = recordField(payload, "catalog") as unknown as
    product.ReadyGraphFunctionCatalog;
  const readinessBasis = recordField(
    supplied as unknown as Readonly<Record<string, product.JsonValue>>,
    "readinessBasis",
  ) as unknown as
    product.CatalogReadinessBasis;
  const catalog = product.admitGraphFunctionCatalog(readinessBasis);
  if (catalog.kind !== "graph_function_catalog") {
    throw new ApplicationRefusal(
      "target_mismatch",
      `exact catalog reconstruction refused: ${catalog.message}`,
    );
  }
  if (
    product.canonicalJson(catalog as unknown as product.JsonValue) !==
      product.canonicalJson(supplied as unknown as product.JsonValue)
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "supplied catalog differs from the exact Product reconstruction",
    );
  }
  return catalog;
}

function revalidateExactCatalogView(
  payload: Readonly<Record<string, product.JsonValue>>,
  catalog: product.ReadyGraphFunctionCatalog,
): product.GraphFunctionCatalogView {
  const supplied = recordField(payload, "catalogView") as unknown as
    product.GraphFunctionCatalogView;
  const view = product.narrowGraphFunctionCatalog(
    catalog,
    stringArrayField(
      supplied as unknown as Readonly<Record<string, product.JsonValue>>,
      "allowlist",
    ),
  );
  if (view.kind !== "graph_function_catalog_view") {
    throw new ApplicationRefusal(
      "target_mismatch",
      `exact catalog view reconstruction refused: ${view.message}`,
    );
  }
  if (
    product.canonicalJson(view as unknown as product.JsonValue) !==
      product.canonicalJson(supplied as unknown as product.JsonValue)
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "supplied catalog view differs from the exact Product reconstruction",
    );
  }
  return view;
}

function revalidateExactCatalogApplications(
  payload: Readonly<Record<string, product.JsonValue>>,
  catalog: product.ReadyGraphFunctionCatalog,
  view: product.GraphFunctionCatalogView,
): readonly product.DeclarationApplication[] {
  const suppliedApplications = recordArrayField(
    payload,
    "applications",
  ) as unknown as readonly product.DeclarationApplication[];
  return suppliedApplications.map((application) => {
    if (
      application.kind !== "declaration_application" ||
      application.catalogBasisDigest !== catalog.basisDigest ||
      application.viewDigest !== view.viewDigest
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "catalog application differs from its exact catalog and view",
      );
    }
    const reconstructed = product.applyCatalogDeclaration(view, {
      applicationKind: application.declaration.declarationKind,
      handle: application.declaration.handle,
      targetRef: application.targetRef,
      targetDigest: application.targetDigest,
      appliedValueRef: application.appliedValueRef,
      appliedValueDigest: application.appliedValueDigest,
    });
    if (
      reconstructed.kind !== "declaration_application" ||
      product.sha256Canonical(reconstructed as unknown as product.JsonValue) !==
        product.sha256Canonical(application as unknown as product.JsonValue)
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "catalog application is not the exact Product reconstruction",
      );
    }
    return reconstructed;
  });
}

function consumeExactCatalogCarriers(
  payload: Readonly<Record<string, product.JsonValue>>,
): ExactCatalogCarriers {
  const catalog = revalidateExactCatalog(payload);
  const view = revalidateExactCatalogView(payload, catalog);
  const applications = revalidateExactCatalogApplications(
    payload,
    catalog,
    view,
  );
  return {
    publications: catalog.readinessBasis.publications,
    catalog,
    view,
    applications,
  };
}

function isJsonRecord(
  value: product.JsonValue,
): value is Readonly<Record<string, product.JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactPayloadKeys(
  payload: Readonly<Record<string, product.JsonValue>>,
  allowed: readonly string[],
  operation: string,
): void {
  const allowedKeys = new Set(allowed);
  const undeclared = Object.keys(payload).filter((key) => !allowedKeys.has(key));
  if (undeclared.length !== 0) {
    throw new ApplicationRefusal(
      "invalid_request",
      `${operation} payload contains undeclared fields: ${undeclared.sort().join(", ")}`,
    );
  }
}

function operationBasis(
  invocation: RootPublicInvocation,
  scopeRef: string,
  scopeDigest: product.Sha256Digest,
  causationEventRefs: readonly string[],
  selectedMemberKey: string = invocation.variant,
): abg.PublicOperationAdmissionBasis {
  if (
    invocation.operationId === "abg.operation.product.verify" ||
    invocation.operationId === "abg.operation.product.resolve"
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "pure Product operations have no ABG admission basis",
    );
  }
  const invocationPayloadDigest = product.sha256Canonical(invocation.payload);
  const memberKey = selectedMemberKey;
  const definitionDigest = product.sha256Canonical({
    operationId: invocation.operationId,
    memberKey,
    schemaVersion: "5.0.0",
  });
  return {
    operationId: invocation.operationId,
    memberKey,
    definitionDigest,
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef: invocation.invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      operationId: invocation.operationId,
      memberKey,
      definitionDigest,
      invocationRef: invocation.invocationRef,
      invocationPayloadDigest,
    }),
    correlationId: invocation.correlationId,
    eventTime: invocation.eventTime,
    causationEventRefs,
  };
}

function artifactOperationBasis(
  context: RootOperationContext,
  invocation: RootInvocationFor<
    | "abg.operation.product.install"
    | "abg.operation.workspace.bind"
  >,
  scopeRef: string,
  scopeDigest: product.Sha256Digest,
  causationEventRefs: readonly string[],
  selectedMemberKey: "bind" | "install",
): abg.ArtifactAdmissionBasis {
  return {
    ...operationBasis(
      invocation,
      scopeRef,
      scopeDigest,
      causationEventRefs,
      selectedMemberKey,
    ),
    predecessorPrefix: context.prefix,
  };
}

function exactArtifactTruth(
  prefix: abg.DurablePrefixCoordinate,
): abg.ExactPrefixArtifactTruthProjection {
  const projection = abg.projectExactPrefixArtifactTruth(prefix);
  if (projection.kind === "exact_prefix_artifact_truth_projection_refusal") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `exact artifact-truth projection refused: ${projection.code}`,
    );
  }
  return projection;
}

function requireAvailableEffectfulInvocation(
  context: RootOperationContext,
  invocationRef: string,
): void {
  const truth = abg.projectEffectfulPublicInvocationTruthAtPrefix(
    context.prefix,
    invocationRef,
  );
  if (truth.disposition === "invalid_history") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `effectful invocation truth refused: ${truth.code}`,
    );
  }
  if (truth.disposition === "duplicate") {
    throw new ApplicationRefusal(
      "duplicate_invocation",
      `effectful Public invocation ${invocationRef} already has one owning admission`,
      truth.priorAdmission,
    );
  }
}

function requireEffectfulOwnerResult<Value>(
  value: Value | abg.UnavailableEffectfulPublicInvocationTruth,
): Value {
  const truth = value as abg.UnavailableEffectfulPublicInvocationTruth;
  if (truth.disposition === "duplicate") {
    throw new ApplicationRefusal(
      "duplicate_invocation",
      `effectful Public invocation ${truth.invocationRef} already has one owning admission`,
      truth.priorAdmission,
    );
  }
  if (truth.disposition === "invalid_history") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `effectful invocation truth refused: ${truth.code}`,
    );
  }
  return value as Value;
}

interface DurablePrefixProjection {
  readonly fullPrefix: abg.ValidatedRuntimeEventPrefix;
  readonly scopedPrefix: abg.ValidatedRuntimeEventPrefix;
  readonly replayState: abg.ReplayState;
  readonly eventLog: abg.PersistedEventLog;
}

function projectDurablePrefix(
  prefix: abg.DurablePrefixCoordinate,
  scope?: abg.RuntimeEventScope,
): DurablePrefixProjection {
  const events = abg.readRuntimeEventsAtDurablePrefix(prefix);
  const fullPrefix = abg.selectValidatedRuntimeEventPrefix(events);
  const scopedPrefix = scope === undefined
    ? fullPrefix
    : abg.selectValidatedRuntimeEventPrefix(events, scope);
  const scopedEvents = scopedPrefix.events;
  return deepFreeze({
    fullPrefix,
    scopedPrefix,
    replayState: abg.replayValidatedRuntimeEventPrefix(
      scopedPrefix,
      fullPrefix,
    ),
    eventLog: {
      kind: "persisted_abg_event_log" as const,
      schemaVersion: "5.0.0" as const,
      eventLogPath: fileURLToPath(prefix.eventLogRef),
      eventLogDigest: prefix.prefixDigest,
      durableByteLength: prefix.prefixLength,
      eventCount: scopedEvents.length,
      durableEventCount: events.length,
      events: scopedEvents,
    },
  });
}

function rawAdmission<S>(
  value: unknown,
  kind: validator.RawSubjectKind,
  contractRef: string,
): validator.RawAdmittedValue<S> {
  const admitted = validator.rawAdmitValue<S>(value, kind, contractRef);
  if (admitted.kind !== "raw_admitted_value") {
    throw new ApplicationRefusal("owner_refusal", `GTL raw admission refused: ${JSON.stringify(admitted)}`);
  }
  return admitted;
}

function rawProgramInput(
  publicationAdmission: validator.RawAdmittedValue<ModulePublication>,
  program: Readonly<GtlProgram>,
): validator.ProgramValidationInput {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: rawAdmission(
      program,
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: publication.graphFunctions
      .filter((value) => program.callableMembership.includes(value.name))
      .map((value) => rawAdmission(
        value,
        "graph_function",
        "contract://abiogenesis/gtl/graph-function@5",
      )),
    contracts: publication.contracts.map((value) => rawAdmission(
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    )),
    implementationBindings: publication.implementationBindings.map((value) => rawAdmission(
      value,
      "implementation_binding",
      "contract://abiogenesis/gtl/implementation-binding@5",
    )),
    closureContracts: publication.closureContracts.map((value) => rawAdmission(
      value,
      "closure_contract",
      "contract://abiogenesis/gtl/closure-contract@5",
    )),
  };
}

function successOutcome(
  invocation: RootPublicInvocation,
  result: product.JsonValue,
  metadata: {
    readonly runtimeInvocationRef?: string;
    readonly runId?: string;
    readonly graphCallId?: string;
    readonly frameId?: string;
    readonly replayRef?: string;
    readonly replayDigest?: product.Sha256Digest;
    readonly eventLogPath?: string;
    readonly eventLogDigest?: product.Sha256Digest;
    readonly eventLogByteLength?: number;
    readonly durableEventCount?: number;
    readonly continuationRef?: string;
    readonly continuationStatus?: "abandoned" | "open" | "responded" | "resolved" | "superseded";
  } = {},
): PublicOutcome {
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef: metadata.runtimeInvocationRef ?? null,
    disposition: "succeeded" as const,
    result,
    diagnosticRef: null,
    runId: metadata.runId ?? null,
    graphCallId: metadata.graphCallId ?? null,
    frameId: metadata.frameId ?? null,
    cCallRef: null,
    resultRef: null,
    judgmentRef: null,
    outputContractRef: null,
    admittedResultContractRef: null,
    replayRef: metadata.replayRef ?? null,
    replayDigest: metadata.replayDigest ?? null,
    replayAgreement: metadata.replayDigest === undefined ? null : true,
    eventLogPath: metadata.eventLogPath ?? null,
    eventLogDigest: metadata.eventLogDigest ?? null,
    eventLogByteLength: metadata.eventLogByteLength ?? null,
    durableEventCount: metadata.durableEventCount ?? null,
    continuationRef: metadata.continuationRef ?? null,
    continuationStatus: metadata.continuationStatus ?? null,
  };
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest: product.sha256Canonical(body as unknown as product.JsonValue),
    ...body,
  }) as PublicOutcome;
}

function refusalOutcome(
  invocation: RootPublicInvocation,
  code: string,
  message: string,
  metadata: {
    readonly runtimeInvocationRef?: string;
    readonly runId?: string;
    readonly graphCallId?: string;
    readonly frameId?: string;
    readonly replayRef?: string;
    readonly replayDigest?: product.Sha256Digest;
    readonly eventLogPath?: string;
    readonly eventLogDigest?: product.Sha256Digest;
    readonly eventLogByteLength?: number;
    readonly durableEventCount?: number;
    readonly continuationRef?: string;
    readonly continuationStatus?: "abandoned" | "open" | "responded" | "resolved" | "superseded";
    readonly resultKind?:
      | "catalog_admission_refusal"
      | "product_resolution_refusal";
    readonly resultDisposition?: TypedPublicRefusalDisposition;
    readonly priorAdmission?: abg.EffectfulPublicInvocationPriorAdmission;
  } = {},
): PublicOutcome {
  const diagnosticRef = `diagnostic://abiogenesis/public/${code}@5`;
  const result = {
    kind: metadata.resultKind ?? "public_operation_refusal",
    schemaVersion: "5.0.0",
    ...(metadata.resultDisposition === undefined
      ? {}
      : { disposition: metadata.resultDisposition }),
    code,
    message,
    ...(metadata.priorAdmission === undefined
      ? {}
      : {
        priorOperationId: metadata.priorAdmission.operationId,
        priorPublicInvocationRef:
          metadata.priorAdmission.publicInvocationRef,
        priorOwnerInvocationRef:
          metadata.priorAdmission.ownerInvocationRef,
        priorOwnerInvocationDigest:
          metadata.priorAdmission.ownerInvocationDigest,
        priorPublicOperationEventRef:
          metadata.priorAdmission.publicOperationEventRef,
        priorAdmissionEventRef: metadata.priorAdmission.admissionEventRef,
      }),
  } as const;
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef: metadata.runtimeInvocationRef ?? null,
    disposition: "refused" as const,
    result,
    diagnosticRef,
    runId: metadata.runId ?? null,
    graphCallId: metadata.graphCallId ?? null,
    frameId: metadata.frameId ?? null,
    cCallRef: null,
    resultRef: null,
    judgmentRef: null,
    outputContractRef: null,
    admittedResultContractRef: null,
    replayRef: metadata.replayRef ?? null,
    replayDigest: metadata.replayDigest ?? null,
    replayAgreement: metadata.replayDigest === undefined ? null : true,
    eventLogPath: metadata.eventLogPath ?? null,
    eventLogDigest: metadata.eventLogDigest ?? null,
    eventLogByteLength: metadata.eventLogByteLength ?? null,
    durableEventCount: metadata.durableEventCount ?? null,
    continuationRef: metadata.continuationRef ?? null,
    continuationStatus: metadata.continuationStatus ?? null,
  };
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest: product.sha256Canonical(body as unknown as product.JsonValue),
    ...body,
  }) as PublicOutcome;
}

function continuationRefusalOutcome(
  invocation: RootPublicInvocation,
  authority: PublicContinuationAuthority,
  error: unknown,
): PublicOutcome {
  const outcome = refusalOutcome(
    invocation,
    error instanceof ApplicationRefusal ? error.code : "owner_refusal",
    error instanceof Error ? error.message : String(error),
    {
      runtimeInvocationRef: authority.runtimeInvocationRef,
      runId: authority.runId,
      continuationRef: authority.continuationRef,
      ...(error instanceof ApplicationRefusal &&
          error.priorAdmission !== null
        ? { priorAdmission: error.priorAdmission }
        : {}),
    },
  );
  return attachContinuationAuthority(
    outcome,
    authority as unknown as product.JsonValue,
  );
}

async function applyVerify(
  invocation: RootInvocationFor<"abg.operation.product.verify">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "artifact") {
    throw new ApplicationRefusal("invalid_request", "product.verify requires variant artifact");
  }
  requireExactPayloadKeys(invocation.payload, [
    "artifactPath",
    "artifactRef",
    "expectedArtifactDigest",
    "expectedManifestDigest",
    "expectedPackageName",
    "expectedPackageVersion",
    "expectedProductContentDigest",
    "expectedProductId",
  ], "product.verify");
  const verified = await product.verifyProduct({
    artifactPath: stringField(invocation.payload, "artifactPath"),
    artifactRef: stringField(invocation.payload, "artifactRef"),
    expectedArtifactDigest: stringField(invocation.payload, "expectedArtifactDigest") as product.Sha256Digest,
    expectedProductContentDigest: stringField(invocation.payload, "expectedProductContentDigest") as product.Sha256Digest,
    expectedManifestDigest: stringField(invocation.payload, "expectedManifestDigest") as product.Sha256Digest,
    expectedProductId: stringField(invocation.payload, "expectedProductId"),
    expectedPackageName: stringField(invocation.payload, "expectedPackageName"),
    expectedPackageVersion: stringField(invocation.payload, "expectedPackageVersion"),
  });
  if (verified.disposition !== "verified") {
    throw new ApplicationRefusal("owner_refusal", `Product verification refused: ${verified.code}`);
  }
  return successOutcome(
    invocation,
    verified as unknown as product.JsonValue,
  );
}

async function applyResolve(
  invocation: RootInvocationFor<"abg.operation.product.resolve">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "verified_product_set") {
    throw new ApplicationRefusal(
      "invalid_request",
      "product.resolve requires variant verified_product_set",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["verifiedProductInputs"],
    "product.resolve",
  );
  const verifiedProductInputs = invocation.payload.verifiedProductInputs;
  if (
    verifiedProductInputs.length === 0 ||
    verifiedProductInputs.some((input) => {
      try {
        requireExactPayloadKeys(
          input,
          ["artifactPath", "verifiedProduct"],
          "product.resolve verifiedProductInputs",
        );
        return typeof input.artifactPath !== "string" ||
          input.artifactPath.trim().length === 0 ||
          !isJsonRecord(input.verifiedProduct as product.JsonValue);
      } catch {
        return true;
      }
    })
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "product.resolve requires complete verified Product carriers paired with explicit artifact paths",
    );
  }
  const verifiedProducts = await Promise.all(
    verifiedProductInputs.map(async (input) => {
      const supplied = input.verifiedProduct;
      if (!product.isVerifiedProductArtifact(supplied)) {
        throw new ApplicationRefusal(
          "target_mismatch",
          "product.resolve received an internally invalid verified Product carrier",
        );
      }
      const current = await product.verifyProduct({
        artifactPath: input.artifactPath as string,
        artifactRef: supplied.artifactRef,
        expectedArtifactDigest: supplied.artifactDigest,
        expectedProductContentDigest: supplied.productContentDigest,
        expectedManifestDigest: supplied.manifestDigest,
        expectedProductId: supplied.productId,
        expectedPackageName: supplied.packageName,
        expectedPackageVersion: supplied.packageVersion,
      });
      if (
        current.kind !== "verified_product_artifact" ||
        product.canonicalJson(current as unknown as product.JsonValue) !==
          product.canonicalJson(supplied as unknown as product.JsonValue)
      ) {
        throw new ApplicationRefusal(
          "target_mismatch",
          "product.resolve artifact bytes differ from the complete verified Product carrier",
        );
      }
      return current;
    }),
  );
  if (
    new Set(verifiedProducts.map((verified) => verified.productId)).size !==
      verifiedProducts.length
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "product.resolve requires one verified carrier per Product identity",
    );
  }
  const lock = product.constructResolvedProductLock(verifiedProducts);
  if (lock.kind !== "resolved_product_lock") {
    const disposition = productResolutionDisposition(lock.code);
    if (disposition === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        `Product lock resolution refused: ${lock.message}`,
      );
    }
    return refusalOutcome(
      invocation,
      disposition,
      `Product lock resolution refused: ${lock.message}`,
      {
        resultKind: "product_resolution_refusal",
        resultDisposition: disposition,
      },
    );
  }
  return successOutcome(invocation, lock as unknown as product.JsonValue);
}

async function applyInstall(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.product.install">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "verified_artifact") {
    throw new ApplicationRefusal("invalid_request", "product.install requires variant verified_artifact");
  }
  requireAvailableEffectfulInvocation(context, invocation.invocationRef);
  requireExactPayloadKeys(invocation.payload, [
    "artifactPath",
    "resolvedLock",
    "targetRoot",
    "verifiedProduct",
  ], "product.install");
  const verifiedProduct = invocation.payload.verifiedProduct;
  const lock = invocation.payload.resolvedLock;
  if (
    !product.isVerifiedProductArtifact(verifiedProduct) ||
    !product.isResolvedProductLock(lock) ||
    !product.verifiedArtifactMatchesResolvedLock(verifiedProduct, lock)
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "product.install requires one complete verified Product member of the exact resolved lock",
    );
  }
  const candidate = await product.installProduct({
    artifactPath: stringField(invocation.payload, "artifactPath"),
    targetRoot: stringField(invocation.payload, "targetRoot"),
    verifiedArtifact: verifiedProduct,
    resolvedLock: lock,
  });
  if (candidate.disposition !== "materialized") {
    throw new ApplicationRefusal("owner_refusal", `Product installation refused: ${candidate.code}`);
  }
  const admitted = abg.admitProductInstall(
    context.store,
    candidate,
    artifactOperationBasis(
      context,
      invocation,
      candidate.installId,
      candidate.productContentDigest,
      [],
      "install",
    ),
    lock,
  );
  if (admitted.kind !== "artifact_owner_result") {
    if (
      admitted.kind === "artifact_owner_refusal" &&
      admitted.refusal.code === "duplicate_invocation"
    ) {
      throw new ApplicationRefusal(
        "duplicate_invocation",
        admitted.refusal.message,
        admitted.refusal.priorAdmission,
      );
    }
    throw new ApplicationRefusal(
      "owner_refusal",
      `ProductInstall admission refused: ${JSON.stringify(admitted.refusal)}`,
    );
  }
  context.prefix = admitted.successorPrefix;
  const install = admitted.value;
  return successOutcome(
    invocation,
    install as unknown as product.JsonValue,
  );
}

async function applyWorkspaceBind(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.workspace.bind">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "exact_product_set") {
    throw new ApplicationRefusal("invalid_request", "workspace.bind requires variant exact_product_set");
  }
  requireAvailableEffectfulInvocation(context, invocation.invocationRef);
  requireExactPayloadKeys(invocation.payload, [
    "authorityManifestRef",
    "authorizedActorRef",
    "canonicalRoot",
    "installInvocationRef",
    "installInvocationRefs",
    "roots",
    "workspaceId",
  ], "workspace.bind");
  const singularInstallRef = invocation.payload.installInvocationRef;
  const pluralInstallRefs = invocation.payload.installInvocationRefs;
  if ((singularInstallRef === undefined) === (pluralInstallRefs === undefined)) {
    throw new ApplicationRefusal(
      "invalid_request",
      "workspace.bind requires exactly one of installInvocationRef or installInvocationRefs",
    );
  }
  const installInvocationRefs = singularInstallRef === undefined
    ? stringArrayField(invocation.payload, "installInvocationRefs")
    : [stringField(invocation.payload, "installInvocationRef")];
  if (
    installInvocationRefs.length === 0 ||
    new Set(installInvocationRefs).size !== installInvocationRefs.length
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "workspace.bind installInvocationRefs must be non-empty and unique",
    );
  }
  const artifactTruth = exactArtifactTruth(context.prefix);
  const installStates = installInvocationRefs.map((installInvocationRef) => {
    const installState =
      abg.projectAdmittedProductInstallByInvocationRef(
        artifactTruth,
        installInvocationRef,
      );
    if (installState === null) {
      throw new ApplicationRefusal(
        "missing_prerequisite",
        `ProductInstall invocation ${installInvocationRef} does not select exactly one admitted fact at the supplied prefix`,
      );
    }
    return installState;
  });
  const lock = installStates[0]!.resolvedLock;
  if (
    installStates.some(
      (state) =>
        product.canonicalJson(
          state.resolvedLock as unknown as product.JsonValue,
        ) !== product.canonicalJson(lock as unknown as product.JsonValue),
    )
  ) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "workspace.bind requires installs materialized under one exact resolved lock",
    );
  }
  const orderedInstallStates = lock.rows.map((row) => {
    const matches = installStates.filter(
      (state) => state.install.productId === row.productId,
    );
    if (matches.length !== 1) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "workspace.bind durable installs do not form the exact resolved Product order",
      );
    }
    return matches[0]!;
  });
  const productSet = product.constructProductSet(
    orderedInstallStates.map((state) => state.install),
    lock,
  );
  if (productSet.kind !== "product_set") {
    throw new ApplicationRefusal("owner_refusal", `ProductSet construction refused: ${productSet.message}`);
  }
  const workspaceId = stringField(invocation.payload, "workspaceId");
  const canonicalRoot = stringField(invocation.payload, "canonicalRoot");
  const authorityManifest = {
    workspaceId,
    canonicalRoot,
    authorityMode: "trusted_developer" as const,
    authorizedActorRef: stringField(
      invocation.payload,
      "authorizedActorRef",
    ),
  };
  const authority = product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: stringField(invocation.payload, "authorityManifestRef"),
    authorityManifestDigest: product.sha256Canonical(authorityManifest),
  });
  if (authority.kind !== "workspace_authority_basis") {
    throw new ApplicationRefusal("owner_refusal", `Workspace authority refused: ${authority.message}`);
  }
  const rootsValue = recordField(invocation.payload, "roots");
  requireExactPayloadKeys(rootsValue, [
    "archiveRoot",
    "eventLogRoot",
    "productRoot",
    "projectionRoot",
    "runtimeStateRoot",
    "toolchainRoot",
  ], "workspace.bind roots");
  const roots: product.WorkspaceDeclaredRoots = {
    toolchainRoot: stringField(rootsValue, "toolchainRoot"),
    productRoot: stringField(rootsValue, "productRoot"),
    eventLogRoot: stringField(rootsValue, "eventLogRoot"),
    runtimeStateRoot: stringField(rootsValue, "runtimeStateRoot"),
    projectionRoot: stringField(rootsValue, "projectionRoot"),
    archiveRoot: stringField(rootsValue, "archiveRoot"),
  };
  const candidate = product.constructWorkspaceBinding(authority, productSet, lock, roots);
  if (candidate.kind !== "workspace_binding_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Workspace binding construction refused: ${candidate.message}`);
  }
  const admitted = abg.admitWorkspaceBinding(
    context.store,
    candidate,
    artifactOperationBasis(
      context,
      invocation,
      candidate.bindingId,
      candidate.bindingDigest,
      orderedInstallStates.map((state) => state.install.admissionEventRef),
      "bind",
    ),
    authority,
  );
  if (admitted.kind !== "artifact_owner_result") {
    if (
      admitted.kind === "artifact_owner_refusal" &&
      admitted.refusal.code === "duplicate_invocation"
    ) {
      throw new ApplicationRefusal(
        "duplicate_invocation",
        admitted.refusal.message,
        admitted.refusal.priorAdmission,
      );
    }
    throw new ApplicationRefusal(
      "owner_refusal",
      `Workspace binding admission refused: ${JSON.stringify(admitted.refusal)}`,
    );
  }
  context.prefix = admitted.successorPrefix;
  const binding = admitted.value;
  return successOutcome(
    invocation,
    binding as unknown as product.JsonValue,
  );
}

async function applyCatalogAdmit(
  _context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.catalog.admit">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "module_publication") {
    throw new ApplicationRefusal("invalid_request", "catalog.admit requires variant module_publication");
  }
  requireExactPayloadKeys(invocation.payload, ["readinessBasis"], "catalog.admit");
  const readinessBasis = recordField(
    invocation.payload,
    "readinessBasis",
  ) as unknown as product.CatalogReadinessBasis;
  for (const publication of readinessBasis.publications ?? []) {
    const publicationAdmission = rawAdmission<ModulePublication>(
      publication,
      "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    const contributionAdmissions = publication.contributions.map((value) =>
      rawAdmission<CatalogContribution>(
        value,
        "catalog_contribution",
        "contract://abiogenesis/gtl/catalog-contribution@5",
      ));
    const publicationValidation = validator.validatePublication(
      publicationAdmission,
      contributionAdmissions,
    );
    if (publicationValidation.kind !== "publication_validation") {
      throw new ApplicationRefusal("owner_refusal", `Publication validation refused: ${JSON.stringify(publicationValidation)}`);
    }
    const invalidProgram = publication.programs
      .map((program) => validator.validateProgram(
        rawProgramInput(publicationAdmission, program),
      ))
      .find((validation) => validation.kind !== "program_validation");
    if (invalidProgram !== undefined) {
      throw new ApplicationRefusal("owner_refusal", `Program validation refused: ${JSON.stringify(invalidProgram)}`);
    }
  }
  const catalog = product.admitGraphFunctionCatalog(readinessBasis);
  if (catalog.kind !== "graph_function_catalog") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `Catalog construction refused: ${catalog.message}`,
    );
  }
  return successOutcome(
    invocation,
    catalog as unknown as product.JsonValue,
  );
}

async function applyCatalogView(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.catalog.view">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "allowlist") {
    throw new ApplicationRefusal("invalid_request", "catalog.view requires variant allowlist");
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["allowlist", "catalog"],
    "catalog.view",
  );
  const catalog = revalidateExactCatalog(invocation.payload);
  const view = product.narrowGraphFunctionCatalog(
    catalog,
    stringArrayField(invocation.payload, "allowlist"),
  );
  if (view.kind !== "graph_function_catalog_view") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `Catalog view construction refused: ${view.message}`,
    );
  }
  return successOutcome(
    invocation,
    view as unknown as product.JsonValue,
  );
}

async function applyCatalogApplication(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.catalog.apply">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "node_type" && invocation.variant !== "overlay") {
    throw new ApplicationRefusal(
      "invalid_request",
      "catalog.apply requires variant node_type or overlay",
    );
  }
  requireExactPayloadKeys(invocation.payload, [
    "catalog",
    "catalogView",
    "contributorRef",
    "handle",
    ...(invocation.variant === "node_type" ? ["target"] : []),
    "value",
  ], "catalog.apply");
  const catalog = revalidateExactCatalog(invocation.payload);
  const view = revalidateExactCatalogView(invocation.payload, catalog);
  const publications = catalog.readinessBasis.publications;
  const handle = stringField(invocation.payload, "handle");
  const target = invocation.variant === "node_type"
    ? recordField(invocation.payload, "target")
    : { contributorRef: stringField(invocation.payload, "contributorRef") };
  const value = recordField(invocation.payload, "value");
  const declaration = view.declarationEntries.find((entry) => entry.handle === handle);
  if (declaration === undefined) {
    throw new ApplicationRefusal("target_mismatch", "catalog.apply handle is absent from its exact view");
  }
  const publicationMatches = publications.filter(
    (candidate) =>
      candidate.owningProductId === declaration.owningProductId &&
      candidate.moduleRef === declaration.moduleRef &&
      product.modulePublicationSemanticDigest(candidate) ===
        declaration.publicationDigest,
  );
  if (publicationMatches.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "catalog.apply row owner has no unique exact declaration publication",
    );
  }
  const publication = publicationMatches[0]!;
  const installs = catalog.readinessBasis.installedProducts.filter(
    (candidate) => candidate.productId === declaration.owningProductId,
  );
  if (installs.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "catalog.apply row owner has no unique exact installed Product",
    );
  }
  const install = installs[0]! as unknown as product.ProductInstall;
  let resolvedValue: ReturnType<NonNullable<product.ProductSemanticsProvider["resolveCatalogApplicationValue"]>>;
  try {
    const semantics = await product.loadInstalledProductSemantics({
      install,
      publication,
      verifyInstallAdmission: (candidate) =>
        product.sha256Canonical(candidate as unknown as product.JsonValue) ===
          product.sha256Canonical(install as unknown as product.JsonValue),
    });
    resolvedValue = semantics.resolveCatalogApplicationValue?.({
      contractRef: declaration.declarationOrContractRef,
      value,
    }) ?? null;
  } catch (error) {
    throw new ApplicationRefusal(
      "owner_refusal",
      `catalog.apply Product semantics resolution refused: ${String(error)}`,
    );
  }
  if (
    resolvedValue === null ||
    product.sha256Canonical(resolvedValue.programMembershipRefs as unknown as product.JsonValue) !==
      product.sha256Canonical(declaration.programMembershipRefs as unknown as product.JsonValue) ||
    (
      resolvedValue.productContributorAttestation !== undefined &&
      resolvedValue.productContributorAttestation.contributorRef !==
        stringField(invocation.payload, "contributorRef")
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "catalog.apply value or contributor differs from Product-owned declaration semantics",
    );
  }
  if (
    invocation.variant === "overlay" &&
    resolvedValue.productContributorAttestation !== undefined &&
    target.contributorRef !== resolvedValue.productContributorAttestation.contributorRef
  ) {
    throw new ApplicationRefusal("target_mismatch", "catalog.apply overlay target differs from Product contributor");
  }
  if (
    invocation.variant === "node_type" &&
    (
      target.kind !== "program" ||
      typeof target.programRef !== "string" ||
      !publication.programs.some((program) => program.programRef === target.programRef)
    )
  ) {
    throw new ApplicationRefusal("target_mismatch", "catalog.apply node target is not a Program in the owning publication");
  }
  const targetDigest = product.sha256Canonical(target as product.JsonValue);
  const valueDigest = product.sha256Canonical(value as product.JsonValue);
  const application = product.applyCatalogDeclaration(view, {
    applicationKind: invocation.variant,
    handle,
    targetRef: `catalog-target://abiogenesis/${targetDigest.slice("sha256:".length)}`,
    targetDigest,
    appliedValueRef: resolvedValue.valueRef,
    appliedValueDigest: valueDigest,
  });
  if (application.kind !== "declaration_application") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `Catalog application refused: ${application.message}`,
    );
  }
  return successOutcome(
    invocation,
    application as unknown as product.JsonValue,
  );
}

async function applyRunInvoke(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.run.invoke">,
  rawRequest: validator.RawAdmittedValue<RootPublicInvocation>,
): Promise<PublicOutcome> {
  if (invocation.variant !== "direct" && invocation.variant !== "start") {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.invoke requires the declared direct or start variant",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    invocation.variant === "direct"
      ? [
          "actorRef",
          "applications",
          "catalog",
          "catalogView",
          "eventLogPath",
          "catalogHandle",
          "input",
          "installInvocationRef",
          "programRef",
          "runtimePrefixAuthority",
          "sourceProjectionAuthority",
          "sourceResultRef",
          "workspaceBindingInvocationRef",
        ]
      : [
          "actorRef",
          "applications",
          "catalog",
          "catalogView",
          "eventLogPath",
          "input",
          "installInvocationRef",
          "programRef",
          "runtimePrefixAuthority",
          "reentryAuthority",
          "rootMode",
          "scope",
          "sourceProjectionAuthority",
          "sourceResultRef",
          "startRef",
          "target",
          "until",
          "workspaceBindingInvocationRef",
        ],
    "run.invoke",
  );
  const suppliedReentry = invocation.variant === "start"
    ? invocation.payload.reentryAuthority
    : undefined;
  const reentryState = suppliedReentry === undefined
    ? null
    : parsePublicGapAuthority(suppliedReentry);
  if (
    suppliedReentry !== undefined &&
    (
      invocation.variant !== "start" ||
      reentryState === null
    )
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.invoke re-entry requires one exact public gap authority on the start variant",
    );
  }
  const suppliedSourceProjectionAuthority =
    invocation.payload.sourceProjectionAuthority;
  const suppliedSourceResultRef = invocation.payload.sourceResultRef;
  const sourceProjectionState =
    suppliedSourceProjectionAuthority === undefined
      ? null
      : parsePublicRunProjectionAuthority(
          suppliedSourceProjectionAuthority,
        );
  if (
    (suppliedSourceProjectionAuthority === undefined) !==
      (suppliedSourceResultRef === undefined) ||
    (
      suppliedSourceProjectionAuthority !== undefined &&
      (
        sourceProjectionState === null ||
        typeof suppliedSourceResultRef !== "string" ||
        suppliedSourceResultRef.length === 0
      )
    )
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.invoke source result requires one exact public projection authority and result identity",
    );
  }
  if (
    reentryState !== null &&
    (
      reentryState.source.nextActionProjection.disposition !== "no_action" ||
      reentryState.source.nextActionProjection.noActionDisposition !==
        "gap_stop" ||
      stringField(invocation.payload, "installInvocationRef") !==
        reentryState.installInvocationRef ||
      stringField(invocation.payload, "workspaceBindingInvocationRef") !==
        reentryState.workspaceBindingInvocationRef
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke re-entry setup references differ from the durable gap authority",
    );
  }
  if (reentryState !== null) {
    requireExactRootOperationContextPrefix(
      context,
      reentryState.prefix,
      "run.invoke reentryAuthority",
    );
    projectGapAuthority(reentryState);
  } else {
    const runtimeHandoff = recordField(
      invocation.payload,
      "runtimePrefixAuthority",
    ) as unknown as abg.EventStoreCloseHandoff;
    if (!validateEventStoreCloseHandoff(runtimeHandoff)) {
      throw new ApplicationRefusal(
        "missing_prerequisite",
        "run.invoke runtimePrefixAuthority differs from the explicitly reopened Public episode",
      );
    }
    requireExactRootOperationContextPrefix(
      context,
      runtimeHandoff.prefix,
      "run.invoke runtimePrefixAuthority",
    );
  }
  requireAvailableEffectfulInvocation(context, invocation.invocationRef);
  const artifactTruth = exactArtifactTruth(context.prefix);
  const reconstructedCatalog = consumeExactCatalogCarriers(invocation.payload);
  if (
    reentryState !== null &&
    (
      reentryState.catalog.basisDigest !==
        reconstructedCatalog.catalog.basisDigest ||
      reentryState.catalogView.viewDigest !==
        reconstructedCatalog.view.viewDigest
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke catalog carriers differ from the durable gap authority",
    );
  }
  const programRef = stringField(invocation.payload, "programRef");
  const publicationMatches = reconstructedCatalog.publications.filter(
    (publication) => publication.programs.some(
      (program) => program.programRef === programRef,
    ),
  );
  if (publicationMatches.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke program must belong to one exact catalog publication",
    );
  }
  const publication = publicationMatches[0]!;
  const readinessBasis = reconstructedCatalog.catalog.readinessBasis;
  const readinessInstallMatches = readinessBasis.installedProducts.filter(
    (candidate) => candidate.productId === publication.owningProductId,
  );
  if (readinessInstallMatches.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke publication must resolve one exact ProductInstall from catalog readiness",
    );
  }
  const installInvocationRef = stringField(
    invocation.payload,
    "installInvocationRef",
  );
  const workspaceBindingInvocationRef = stringField(
    invocation.payload,
    "workspaceBindingInvocationRef",
  );
  if (!product.isResolvedProductLock(readinessBasis.resolvedLock)) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke catalog readiness lacks one exact resolved Product lock",
    );
  }
  const projectedWorkspace =
    abg.projectAdmittedWorkspaceBindingByInvocationRef(
      artifactTruth,
      workspaceBindingInvocationRef,
      readinessBasis.resolvedLock,
    );
  if (projectedWorkspace === null) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      "run.invoke workspaceBindingInvocationRef does not select exactly one admitted fact at the supplied prefix",
    );
  }
  const causalInstallStates = projectedWorkspace.installAdmissionEventRefs.map(
    (eventRef) =>
      abg.projectAdmittedProductInstallByAdmissionEventRef(
        artifactTruth,
        eventRef,
      ),
  );
  if (
    causalInstallStates.length !== readinessBasis.installedProducts.length ||
    causalInstallStates.some((state) => state === null) ||
    new Set(projectedWorkspace.installAdmissionEventRefs).size !==
      projectedWorkspace.installAdmissionEventRefs.length
  ) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      "run.invoke workspace binding does not name one exact admitted install fact per readiness Product",
    );
  }
  const exactInstallStates = causalInstallStates as readonly abg.RehydratedProductInstallTruth[];
  const orderedInstallStates = readinessBasis.resolvedLock.rows.map(
    (row) => {
      const readinessCandidates = readinessBasis.installedProducts.filter(
        (candidate) => candidate.productId === row.productId,
      );
      if (readinessCandidates.length !== 1) {
        throw new ApplicationRefusal(
          "target_mismatch",
          "run.invoke readiness Products do not form the exact resolved Product order",
        );
      }
      const candidate = readinessCandidates[0]!;
      const matches = exactInstallStates.filter((state) =>
        state.candidate.installId === candidate.installId &&
        product.canonicalJson(
          state.candidate as unknown as product.JsonValue,
        ) === product.canonicalJson(candidate as unknown as product.JsonValue)
      );
      if (
        matches.length !== 1 ||
        product.canonicalJson(
          matches[0]!.resolvedLock as unknown as product.JsonValue,
        ) !== product.canonicalJson(
          readinessBasis.resolvedLock as unknown as product.JsonValue,
        )
      ) {
        throw new ApplicationRefusal(
          "target_mismatch",
          "run.invoke readiness Product differs from exact install event metadata",
        );
      }
      return matches[0]!;
    },
  );
  const declaredInstall =
    abg.projectAdmittedProductInstallByInvocationRef(
      artifactTruth,
      installInvocationRef,
    );
  if (
    declaredInstall === null ||
    !orderedInstallStates.some((state) =>
      state.install.admissionEventRef === declaredInstall.install.admissionEventRef
    ) ||
    product.canonicalJson(
      declaredInstall.candidate as unknown as product.JsonValue,
    ) !== product.canonicalJson(
      readinessInstallMatches[0]! as unknown as product.JsonValue,
    )
  ) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      "run.invoke installInvocationRef does not select the exact publication-owning admitted install",
    );
  }
  const readinessProductSet = product.constructProductSet(
    orderedInstallStates.map((state) => state.install),
    readinessBasis.resolvedLock,
  );
  if (readinessProductSet.kind !== "product_set") {
    throw new ApplicationRefusal(
      "target_mismatch",
      `run.invoke catalog readiness ProductSet refused: ${readinessProductSet.message}`,
    );
  }
  if (
    !product.isWorkspaceBindingCandidate(
      projectedWorkspace.candidate,
      readinessBasis.resolvedLock,
      readinessProductSet,
    ) ||
    product.canonicalJson(
      projectedWorkspace.candidate as unknown as product.JsonValue,
    ) !== product.canonicalJson(
      readinessBasis.workspaceBinding as unknown as product.JsonValue,
    ) ||
    projectedWorkspace.installAdmissionEventRefs.join("\0") !==
      orderedInstallStates
        .map((state) => state.install.admissionEventRef)
        .join("\0")
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke readiness workspace differs from exact binding event metadata",
    );
  }
  const installState = declaredInstall;
  const workspaceState = {
    lock: readinessBasis.resolvedLock,
    productSet: readinessProductSet,
    binding: projectedWorkspace.binding,
  };
  if (
    reentryState !== null &&
    (
      product.canonicalJson(
        reentryState.install as unknown as product.JsonValue,
      ) !== product.canonicalJson(
        installState.install as unknown as product.JsonValue,
      ) ||
      product.canonicalJson(
        reentryState.resolvedProductLock as unknown as product.JsonValue,
      ) !== product.canonicalJson(
        workspaceState.lock as unknown as product.JsonValue,
      ) ||
      product.canonicalJson(
        reentryState.productSet as unknown as product.JsonValue,
      ) !== product.canonicalJson(
        workspaceState.productSet as unknown as product.JsonValue,
      ) ||
      product.canonicalJson(
        reentryState.workspaceBinding as unknown as product.JsonValue,
      ) !== product.canonicalJson(
        workspaceState.binding as unknown as product.JsonValue,
      )
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke durable gap setup differs from exact reopened artifact truth",
    );
  }
  const publicationAdmission = rawAdmission<ModulePublication>(
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const viewState = {
    catalogState: {
      publication,
      catalog: reconstructedCatalog.catalog,
    },
    view: reconstructedCatalog.view,
  };
  const catalogApplications = reconstructedCatalog.applications;
  const runProjectionProductBasis = {
    install: installState.install,
    workspaceId: workspaceState.binding.workspaceId,
    workspaceBindingId: workspaceState.binding.bindingId,
    workspaceBindingDigest: workspaceState.binding.bindingDigest,
    catalogBasisDigest: viewState.catalogState.catalog.basisDigest,
    catalogReadinessBasis: viewState.catalogState.catalog.readinessBasis,
    catalogViewDigest: viewState.view.viewDigest,
    publicationDigests: viewState.catalogState.catalog.publicationDigests,
    publications: reconstructedCatalog.publications,
  };
  if (
    !workspaceState.productSet.orderedInstallRefs.includes(installState.install.installId) ||
    workspaceState.binding.roots.productRoot !== installState.candidate.installedRoot ||
    !viewState.catalogState.catalog.publicationDigests.includes(
      product.modulePublicationSemanticDigest(publication),
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke ProductInstall, WorkspaceBinding, and CatalogView do not share one exact environment",
    );
  }
  const programMatch = resolveExactMatch(
    viewState.catalogState.publication.programs,
    (value) => value.programRef === programRef,
  );
  if (programMatch.kind !== "one") {
    throw new ApplicationRefusal(
      "target_mismatch",
      programMatch.kind === "absent"
        ? "run.invoke Program is absent from the admitted publication"
        : "run.invoke Program is ambiguous in the admitted publication",
    );
  }
  const programValue = programMatch.value;
  const selectedProgramValidation = validator.validateProgram(
    rawProgramInput(publicationAdmission, programValue),
  );
  if (selectedProgramValidation.kind !== "program_validation") {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke selected Program is not valid under its complete callable inventory",
    );
  }
  const resolvedStart = invocation.variant === "start"
    ? gtl.resolveProgramStart(programValue, {
        scope: stringField(invocation.payload, "scope") as "program",
        target: stringField(invocation.payload, "target"),
        until: stringField(invocation.payload, "until") as "converged",
        rootMode: stringField(invocation.payload, "rootMode") as
          | "direct"
          | "supervised",
        ...(typeof invocation.payload.startRef === "string"
          ? { startRef: invocation.payload.startRef }
          : {}),
      })
    : null;
  const start =
    resolvedStart?.kind === "resolved_program_start"
      ? resolvedStart.start
      : undefined;
  if (
    invocation.variant === "start" &&
    resolvedStart?.kind !== "resolved_program_start"
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      resolvedStart?.message ??
        "run.invoke start requires one Product-resolved Program start",
    );
  }
  if (
    reentryState !== null &&
    (
      invocation.variant !== "start" ||
      start === undefined ||
      reentryState.publicStart.programRef !== programValue.programRef ||
      reentryState.publicStart.graphFunctionRef !== start.graphFunctionRef ||
      reentryState.publicStart.startRef !== start.startRef ||
      reentryState.publicStart.scope !==
        stringField(invocation.payload, "scope") ||
      reentryState.publicStart.target !==
        stringField(invocation.payload, "target") ||
      reentryState.publicStart.until !==
        stringField(invocation.payload, "until") ||
      reentryState.publicStart.rootMode !==
        stringField(invocation.payload, "rootMode")
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke re-entry must preserve the exact admitted public start identity",
    );
  }
  const definitionLookup = invocation.variant === "start"
    ? product.lookupGraphFunctionDefinition(
        viewState.view,
        start!.graphFunctionRef,
        programRef,
      )
    : null;
  const selectedRow = invocation.variant === "direct"
    ? product.lookupGraphFunction(
        viewState.view,
        stringField(invocation.payload, "catalogHandle"),
      )
    : definitionLookup?.kind === "graph_function_definition_lookup_exact"
      ? definitionLookup.entry
      : null;
  if (
    selectedRow === null ||
    !selectedRow.programMembershipRefs.includes(programRef) ||
    !programValue.callableMembership.includes(selectedRow.definitionRef)
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      invocation.variant === "direct"
        ? "run.invoke canonical catalog handle must select one readiness-qualified callable in the exact Program"
        : definitionLookup?.kind ===
            "graph_function_definition_lookup_ambiguous"
          ? "run.invoke Program start ambiguously selects multiple readiness-qualified catalog definitions"
          : "run.invoke Program start has no exact readiness-qualified catalog definition",
    );
  }
  const graphFunction = selectedRow.definition;
  let programValidation: validator.ProgramValidation =
    selectedProgramValidation;
  if (reentryState !== null) {
    const publicationAdmission = rawAdmission<ModulePublication>(
      viewState.catalogState.publication,
      "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    const revalidated = validator.validateProgram(
      rawProgramInput(publicationAdmission, programValue),
    );
    if (
      revalidated.kind !== "program_validation" ||
      product.sha256Canonical(
        revalidated as unknown as product.JsonValue,
      ) !==
        product.sha256Canonical(
          selectedProgramValidation as unknown as product.JsonValue,
        )
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "run.invoke re-entry could not reproduce its admitted non-lowering Program validation",
      );
    }
    programValidation = revalidated;
  }
  const inputValue = recordField(invocation.payload, "input");
  if (graphFunction.inputs.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input must satisfy the selected GraphFunction's exact admitted input contract",
    );
  }
  const inputContractRef = graphFunction.inputs[0]!;
  let productSemantics: product.ProductSemanticsProvider;
  let admittedInput: Readonly<Record<string, product.JsonValue>> | null;
  let sourceResultBasis: product.ProductInvocationSourceResultBasis | null;
  try {
    productSemantics = await product.loadInstalledProductSemantics(
      {
        install: installState.install,
        publication: viewState.catalogState.publication,
        verifyInstallAdmission: (install) =>
          abg.hasAdmittedProductInstall(artifactTruth, install),
      },
    );
    admittedInput = product.admitInstalledProductInput(
      productSemantics,
      inputContractRef,
      inputValue,
    );
    sourceResultBasis = sourceProjectionState === null
      ? null
      : deriveInvocationSourceResultBasis(
          sourceProjectionState,
          suppliedSourceResultRef as string,
          runProjectionProductBasis,
        );
  } catch {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke selected Product semantics binding is not carried by the exact admitted install",
    );
  }
  if (admittedInput === null) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input is refused by the selected Product-owned contract semantics",
    );
  }
  if (
    !product.validateInstalledInvocationBasis(productSemantics, {
      input: admittedInput,
      workspaceBindingId: workspaceState.binding.bindingId,
      workspaceBindingDigest: workspaceState.binding.bindingDigest,
      workspaceId: workspaceState.binding.workspaceId,
      actionCatalog: programValue.actionCatalog === undefined
        ? null
        : programValue.actionCatalog as unknown as product.JsonValue,
      catalogView: viewState.view,
      catalogApplications,
      sourceResultBasis,
    })
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input is outside the exact Product-owned workspace or Program basis",
    );
  }
  if (
    !abg.hasExactInvocationObservationBasis(
      admittedInput as unknown as Readonly<
        Record<string, product.JsonValue>
      >,
      workspaceState.binding.bindingId,
      workspaceState.binding.bindingDigest,
      programValue,
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke observation does not bind the exact admitted workspace and Program action catalog",
    );
  }
  const rawInput = rawAdmission<Readonly<Record<string, product.JsonValue>>>(
    admittedInput,
    "invocation_input",
    inputContractRef,
  );
  const projectRunResult =
    product.hasInstalledPublicResultProjection(productSemantics);
  const declaredRegimes = new Set<gtl.ComputeRegime>([
    ...programValidation.executableLeafRows.map((row) => row.fibre),
    ...programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const interactionCapabilities =
    programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    }));
  const policy = product.constructRootInvocationPolicy(
    workspaceState.binding,
    programValue,
    interactionCapabilities,
    (["F_D", "F_P", "F_H"] as const).filter((regime) => declaredRegimes.has(regime)),
    catalogApplications,
  );
  const actorRef = stringField(invocation.payload, "actorRef");
  const interactionCapabilityRefs = [
    ...new Set(
      programValidation.interactionLeafRows.map(
        (row) => row.requirement.actorCapabilityRef,
      ),
    ),
  ].sort();
  const grants = [
    product.constructCapabilityGrant(policy, actorRef),
    ...interactionCapabilityRefs.flatMap((capabilityRef) => [
      product.constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.interaction.respond",
        capabilityRef,
      ),
      product.constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.run.continue",
        capabilityRef,
      ),
    ]),
  ];
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceState.binding,
    viewState.view,
    programValue.programRef,
    selectedRow,
    policy,
    grants,
  );
  if (authority.kind !== "invocation_authority") {
    throw new ApplicationRefusal("owner_refusal", `Invocation authority refused: ${authority.message}`);
  }
  const candidate = (invocation.variant === "direct"
    ? product.constructDirectInvocation
    : product.constructStartInvocation)(
    workspaceState.binding,
    viewState.view,
    programValue,
    selectedRow,
    rawRequest,
    rawInput,
    policy,
    grants,
    authority,
  );
  if (candidate.kind !== "public_invocation_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Invocation construction refused: ${candidate.message}`);
  }
  const durableEventLogPath = eventLogPath(invocation, workspaceState.binding);
  if (pathToFileURL(durableEventLogPath).href !== context.prefix.eventLogRef) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke must append to the explicitly acquired durable source log",
    );
  }
  const invocationAdmission = abg.admitInvocation(
    context.store,
    {
      invocation: candidate,
      rawRequest,
      rawInput,
      modulePublication: viewState.catalogState.publication,
      program: programValue,
      graphFunction,
      programValidation,
      workspaceBinding: workspaceState.binding,
      artifactTruth,
      catalogView: viewState.view,
      catalogApplications,
      policy,
      capabilityGrants: grants,
      authority,
      ...(reentryState === null
        ? {}
        : {
            reentryBasis: {
              kind: "invocation_reentry_basis" as const,
              schemaVersion: "5.0.0" as const,
              publicAuthorityDigest: reentryState.authorityDigest,
              sourceInvocationAdmissionRef:
                reentryState.source.sourceInvocationAdmissionRef,
              sourceRunId: reentryState.source.sourceRunId,
              sourceRouteRef: reentryState.source.sourceRouteRef,
              sourceRouteDigest: reentryState.source.sourceRouteDigest,
              sourceRouteEventRef:
                reentryState.source.sourceRouteEventRef,
              sourceRunStoppedEventRef:
                reentryState.source.sourceRunStoppedEventRef,
              gapRef: reentryState.source.gapRef,
              nextActionProjectionRef:
                reentryState.source.nextActionProjectionRef,
              nextActionProjectionDigest:
                reentryState.source.nextActionProjectionDigest,
              productSetId: reentryState.productSet.productSetId,
              productSetDigest: reentryState.productSet.productSetDigest,
              lockId: reentryState.resolvedProductLock.lockId,
              lockDigest: reentryState.resolvedProductLock.lockDigest,
              sourceStart: reentryState.publicStart,
            },
          }),
      ...(sourceResultBasis === null
        ? {}
        : { sourceResultBasis }),
    },
    operationBasis(
      invocation,
      workspaceState.binding.bindingId,
      workspaceState.binding.bindingDigest,
      reentryState === null
        ? []
        : [workspaceState.binding.admissionEventRef],
    ),
  );
  if (invocationAdmission.kind !== "invocation_admission") {
    if (invocationAdmission.code === "duplicate_invocation") {
      throw new ApplicationRefusal(
        "duplicate_invocation",
        invocationAdmission.message,
        invocationAdmission.priorAdmission,
      );
    }
    if (invocationAdmission.disposition === "invalid_history") {
      throw new ApplicationRefusal(
        "owner_refusal",
        `Invocation admission predecessor history refused: ${invocationAdmission.code}`,
      );
    }
    throw new ApplicationRefusal("owner_refusal", `Invocation admission refused: ${invocationAdmission.message}`);
  }
  let activeRefusalStage: abg.InvocationRefusalAdmission["stage"] = "graph_validation";
  let failureExecutionBasis: abg.ExecutionBasis | null = null;
  let failureScope: abg.OpenedTraversalScope | null = null;
  try {
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: rawInput.value as unknown as Readonly<
      Record<string, product.JsonValue>
    >,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
      admittedInput: rawInput.value as unknown as Readonly<
        Record<string, product.JsonValue>
      >,
    },
  );
  if (graphValidation.kind !== "graph_validation") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "graph_validation",
      graphValidation.subjectDigest,
      graphValidation.diagnostics.map((row) => `diagnostic://abiogenesis/validator/${row.code}@5`),
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/graph-validation`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  activeRefusalStage = "implementation_resolution";
  const packagedImplementations = await product.loadInstalledImplementationDescriptors(
    installState.install,
    viewState.catalogState.publication,
  );
  if (!Array.isArray(packagedImplementations)) {
    const descriptorRefusal = packagedImplementations as product.ImplementationResolutionSetRefusal;
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      product.sha256Canonical(descriptorRefusal as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/implementation-resolution/${descriptorRefusal.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/implementation-load`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  const resolutionSetCandidate = product.resolveImplementationSet(
    viewState.view,
    viewState.catalogState.publication,
    programValidation,
    packagedImplementations,
  );
  if (resolutionSetCandidate.kind !== "implementation_resolution_set_candidate") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      product.sha256Canonical(resolutionSetCandidate as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/implementation-resolution/${resolutionSetCandidate.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/resolution-set`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  const resolutionSetValidation = validator.validateImplementationResolutionSet(
    resolutionSetCandidate,
    viewState.view,
    viewState.catalogState.publication,
    programValidation,
    packagedImplementations,
  );
  if (resolutionSetValidation.kind !== "implementation_resolution_set_validation") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      resolutionSetValidation.subjectDigest,
      resolutionSetValidation.diagnostics.map((row) =>
        `diagnostic://abiogenesis/validator/${row.code}@5`),
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/resolution-set-validation`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  const closureContractMatch = resolveExactMatch(
    viewState.catalogState.publication.closureContracts,
    (value) => value.closureContractRef === programValue.closureContractRef,
  );
  if (closureContractMatch.kind !== "one") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "execution_basis",
      product.sha256Canonical(programValue as unknown as product.JsonValue),
      ["diagnostic://abiogenesis/execution-basis/closure-contract-absent@5"],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/missing-closure-contract`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  const closureContract = closureContractMatch.value;
  activeRefusalStage = "execution_basis";
  const executionAdmission = abg.admitExecutionBasis(
    context.store,
    {
      invocationAdmission,
      rawInputValue: admittedInput as unknown as Readonly<
        Record<string, product.JsonValue>
      >,
      program: programValue,
      programValidation,
      graph,
      graphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      closureContract,
    },
    { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/execution-basis`, causationEventRefs: [] },
  );
  if (executionAdmission.kind !== "execution_basis_admission") {
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  failureExecutionBasis = executionAdmission.executionBasis;
  const implementationSet = executionAdmission.implementationSet;
  activeRefusalStage = "open_call";
  const opened = abg.openCall(
    context.store,
    executionAdmission.executionBasis,
    { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/open`, causationEventRefs: [] },
  );
  if (opened.kind !== "open_call_admission") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "open_call",
      product.sha256Canonical(opened as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/open-call/${opened.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/open-refusal`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
    );
  }
  failureScope = opened.scope;
  const leafPort = await constructAdmittedLeafInvocationPort({
    prefix: abg.selectValidatedRuntimeEventPrefix(context.store.readAll()),
    artifactTruth,
    install: installState.install,
    implementationSet,
    publication: viewState.catalogState.publication,
    semanticsProjection:
      product.projectInstalledLeafSemantics(productSemantics),
  });
  const childTraversalPreparationPort = bindChildTraversalPreparationPort({
    store: context.store,
    publication: viewState.catalogState.publication,
    program: programValue,
    programValidation,
    rootImplementationSet: implementationSet,
    rootInteractionSet: executionAdmission.interactionSet,
  });
  const traversalCompletion = await hog.executeGraphTraversal({
    store: context.store,
    executionBasis: executionAdmission.executionBasis,
    openedTraversalScope: opened.scope,
    program: programValue,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionAdmission.interactionSet,
    continuationProductBasis: {
      install: installState.install,
      workspaceBinding: workspaceState.binding,
      artifactTruth,
      catalogView: viewState.view,
      programValidation,
      graphValidation,
    },
    leafPort,
    childTraversalPreparationPort,
    closureContract,
    actorRuntimeBinding: {
      workspaceBinding: workspaceState.binding,
      artifactTruth,
    },
    input: admittedInput as unknown as Readonly<Record<string, product.JsonValue>>,
    inputDigest: rawInput.subjectDigest,
    eventTime: invocation.eventTime,
    correlationId: `${invocation.correlationId}/hog`,
  });
  const replayScope = {
    invocationRef: candidate.invocationRef,
    runId: opened.scope.runId,
  };
  const firstReplay = abg.replay(context.store, replayScope);
  const secondReplay = abg.replay(context.store, replayScope);
  if (traversalCompletion.replayState.replayDigest !== firstReplay.replayDigest) {
    throw new ApplicationRefusal("owner_refusal", "HoG completion and ABG replay disagree");
  }
  const persisted = await abg.persistEventLog(
    context.store,
    durableEventLogPath,
    replayScope,
  );
  let outcome = projectOutcome(
    invocation,
    firstReplay,
    secondReplay,
    graphFunction.outputs[0] ?? "",
    candidate.invocationRef,
    persisted,
  );
  const noActionStop =
    isJsonRecord(outcome.result) &&
    (
      outcome.result.kind === "construction_gap_stop" ||
      outcome.result.kind === "construction_no_action_stop"
    );
  const supervisedGapStart =
    invocationAdmission.publicStart?.until === "converged" &&
    invocationAdmission.publicStart.rootMode === "supervised" &&
    invocationAdmission.publicStart.target ===
      invocationAdmission.publicStart.startRef;
  if (noActionStop && supervisedGapStart) {
    const gapRoute = firstReplay.routes.find(
      (route) =>
        route.routeKind === "gap_stop" &&
        route.cCallRef === traversalCompletion.cCallRef &&
        route.judgmentRef === traversalCompletion.judgmentRef,
    );
    if (
      traversalCompletion.disposition !== "gap_stop" ||
      firstReplay.runId === null ||
      firstReplay.runStoppedEventRef === null ||
      gapRoute?.nextActionProjection?.disposition !== "no_action"
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "stopped traversal lacks its exact replayed no-action route",
      );
    }
    const handoff = closeDurableContext(context);
    const gapAuthority = constructPublicGapAuthority({
      ...handoff,
      installInvocationRef:
        stringField(invocation.payload, "installInvocationRef"),
      workspaceBindingInvocationRef:
        stringField(invocation.payload, "workspaceBindingInvocationRef"),
      install: installState.install,
      resolvedProductLock: workspaceState.lock,
      productSet: workspaceState.productSet,
      workspaceBinding: workspaceState.binding,
      catalog: viewState.catalogState.catalog,
      catalogView: viewState.view,
      publications: reconstructedCatalog.publications,
      publicStart: {
        kind: "public_start_identity",
        schemaVersion: "5.0.0",
        programRef: programValue.programRef,
        graphFunctionRef: graphFunction.name,
        startRef: start!.startRef,
        scope: "program",
        target: start!.startRef,
        until: "converged",
        rootMode: "supervised",
      },
      source: {
        sourceInvocationRef: candidate.invocationRef,
        sourceInvocationAdmissionRef:
          invocationAdmission.invocationAdmissionRef,
        sourceRunId: firstReplay.runId,
        sourceRouteRef: gapRoute.routeRef,
        sourceRouteDigest: gapRoute.routeDigest,
        sourceRouteEventRef: gapRoute.admissionEventRef,
        sourceRunStoppedEventRef: firstReplay.runStoppedEventRef,
        gapRef: gapRoute.nextActionProjection.gapRef,
        nextActionProjectionRef:
          gapRoute.nextActionProjection.projectionRef,
        nextActionProjectionDigest:
          gapRoute.nextActionProjection.projectionDigest,
        nextActionProjection:
          gapRoute.nextActionProjection as unknown as Readonly<
            Record<string, product.JsonValue>
          >,
      },
    });
    outcome = projectOutcome(
      invocation,
      firstReplay,
      secondReplay,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      persisted,
      null,
      gapAuthority as unknown as product.JsonValue,
    );
  } else if (outcome.disposition === "held") {
    if (
      traversalCompletion.continuationRef === null ||
      traversalCompletion.heldInteraction === null ||
      traversalCompletion.heldGraph === null ||
      traversalCompletion.heldClosureContract === null ||
      outcome.continuationRef !== traversalCompletion.continuationRef
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "held traversal is missing its exact continuation basis",
      );
    }
    const handoff = closeDurableContext(context);
    const continuationAuthority = constructPublicContinuationAuthority({
      continuationRef: traversalCompletion.continuationRef,
      ...handoff,
      runtimeInvocationRef: candidate.invocationRef,
      outputContractRef: graphFunction.outputs[0] ?? "",
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      runId: traversalCompletion.heldInteraction.cCall.runId,
      install: installState.install,
      workspaceBinding: workspaceState.binding,
      catalog: viewState.catalogState.catalog,
      catalogView: viewState.view,
      publications: reconstructedCatalog.publications,
      program: programValue,
      graph,
      heldGraph: traversalCompletion.heldGraph,
      heldClosureContract: traversalCompletion.heldClosureContract,
      parentSuspensions: traversalCompletion.parentSuspensions,
      invocationInput:
        admittedInput as unknown as Readonly<Record<string, product.JsonValue>>,
      closureContract,
    });
    outcome = projectOutcome(
      invocation,
      firstReplay,
      secondReplay,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      persisted,
      continuationAuthority as unknown as product.JsonValue,
    );
  } else if (outcome.runId !== null && projectRunResult) {
    const handoff = closeDurableContext(context);
    const projectionAuthority = constructPublicRunProjectionAuthority({
      ...handoff,
      runtimeInvocationRef: candidate.invocationRef,
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      runId: outcome.runId,
      graphCallId: outcome.graphCallId,
      resultRef: outcome.resultRef,
      outputContractRef: graphFunction.outputs[0] ?? "",
      ...runProjectionProductBasis,
    });
    outcome = attachProjectionAuthority(
      outcome,
      projectionAuthority as unknown as product.JsonValue,
    );
  }
  return outcome;
  } catch (error) {
    const failureSubject = {
      errorClass: error instanceof Error ? error.name : typeof error,
      stage: activeRefusalStage,
    };
    const diagnosticRef =
      `diagnostic://abiogenesis/operation-application/${activeRefusalStage}-exception@5`;
    if (failureExecutionBasis !== null && failureScope !== null) {
      const replayState = abg.replay(context.store, { runId: failureScope.runId });
      if (replayState.runtimeStatus === "active") {
        abg.admitRuntimeFailure(
          context.store,
          failureExecutionBasis,
          failureScope,
          "operation_application",
          failureSubject,
          diagnosticRef,
          {
            eventTime: invocation.eventTime,
            correlationId: `${invocation.correlationId}/operation-application-failure`,
            causationEventRefs: [],
          },
        );
      }
      return projectCurrentOutcome(
        context,
        invocation,
        graphFunction.outputs[0] ?? "",
        candidate.invocationRef,
        durableEventLogPath,
        runProjectionProductBasis,
        projectRunResult,
        failureScope.runId,
        invocationAdmission.invocationAdmissionRef,
      );
    }
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      activeRefusalStage,
      product.sha256Canonical(failureSubject),
      [diagnosticRef],
      {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/operation-application-refusal`,
        causationEventRefs: [],
      },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      runProjectionProductBasis,
      projectRunResult,
      undefined,
      invocationAdmission.invocationAdmissionRef,
    );
  }
}

async function projectCurrentOutcome(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
  outputContractRef: string,
  runtimeInvocationRef: string,
  durableEventLogPath: string,
  productBasis: RunProjectionProductBasis,
  projectRunResult: boolean,
  runId?: string,
  invocationAdmissionRef?: string,
): Promise<PublicOutcome> {
  const scope = runId === undefined
    ? { invocationRef: runtimeInvocationRef }
    : { invocationRef: runtimeInvocationRef, runId };
  const first = abg.replay(context.store, scope);
  const second = abg.replay(context.store, scope);
  const eventLog = await abg.persistEventLog(context.store, durableEventLogPath, scope);
  const outcome = projectOutcome(
    invocation,
    first,
    second,
    outputContractRef,
    runtimeInvocationRef,
    eventLog,
  );
  if (
    !projectRunResult ||
    outcome.runId === null ||
    invocationAdmissionRef === undefined
  ) {
    return outcome;
  }
  const projectionAuthority = constructPublicRunProjectionAuthority({
    ...closeDurableContext(context),
    runtimeInvocationRef,
    invocationAdmissionRef,
    runId: outcome.runId,
    graphCallId: outcome.graphCallId,
    resultRef: outcome.resultRef,
    outputContractRef,
    ...productBasis,
  });
  return attachProjectionAuthority(
    outcome,
    projectionAuthority as unknown as product.JsonValue,
  );
}

function eventLogPath(
  invocation: RootPublicInvocation,
  binding: product.WorkspaceBinding,
): string {
  const requested = resolve(stringField(invocation.payload, "eventLogPath"));
  const root = resolve(binding.roots.eventLogRoot);
  const relation = relative(root, requested);
  if (relation.startsWith("..") || isAbsolute(relation) || relation.length === 0) {
    throw new ApplicationRefusal("invalid_request", "eventLogPath must name a file below the admitted eventLogRoot");
  }
  return requested;
}

function requireContinuationAuthority(
  continuationRef: string,
  payload: Readonly<Record<string, product.JsonValue>>,
): PublicContinuationAuthority {
  const supplied = payload.continuationAuthority;
  if (supplied === undefined) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      `continuation ${continuationRef} requires its durable public authority`,
    );
  }
  const parsed = parsePublicContinuationAuthority(
    supplied,
    continuationRef,
  );
  if (parsed === null) {
    throw new ApplicationRefusal(
      "invalid_request",
      "continuationAuthority is not the exact self-consistent public carrier",
    );
  }
  return parsed;
}

function projectContinuationAuthority(
  state: PublicContinuationAuthority,
): Readonly<{
  artifactTruth: abg.ExactPrefixArtifactTruthProjection;
  rootInvocation: abg.InvocationAdmission;
  replayState: abg.ReplayState;
  eventLog: abg.PersistedEventLog;
  fullPrefix: abg.ValidatedRuntimeEventPrefix;
}> {
  const durable = projectDurablePrefix(state.prefix, { runId: state.runId });
  const artifactTruth = exactArtifactTruth(state.prefix);
  const rootInvocation = abg.rehydrateInvocationAdmissionAtPrefix(
    durable.fullPrefix,
    state.invocationAdmissionRef,
  );
  if (
    rootInvocation === null ||
    rootInvocation.invocationRef !== state.runtimeInvocationRef ||
    rootInvocation.outputContractRef !== state.outputContractRef ||
    rootInvocation.workspaceBindingId !== state.workspaceBinding.bindingId ||
    rootInvocation.workspaceBindingDigest !==
      state.workspaceBinding.bindingDigest ||
    rootInvocation.programRef !== state.program.programRef ||
    rootInvocation.graphFunctionRef !== state.graph.graphFunctionRef ||
    state.catalog.basisDigest !== state.catalogView.catalogBasisDigest ||
    state.graph.admittedInputDigest !==
      product.sha256Canonical(state.invocationInput) ||
    !abg.hasAdmittedProductInstall(artifactTruth, state.install) ||
    !abg.hasAdmittedWorkspaceBinding(artifactTruth, state.workspaceBinding) ||
    gtl.rehydrateMaterializedGtlGraph(state.graph) === null ||
    gtl.rehydrateMaterializedGtlGraph(state.heldGraph) === null ||
    state.parentSuspensions.some(
      (suspension) =>
        gtl.rehydrateMaterializedGtlGraph(suspension.parentGraph) === null,
    )
  ) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "durable continuation authority differs from its admitted Product and invocation basis",
    );
  }
  return {
    artifactTruth,
    rootInvocation,
    replayState: durable.replayState,
    eventLog: durable.eventLog,
    fullPrefix: durable.fullPrefix,
  };
}

function closeContinuationContext(
  context: RootOperationContext,
  state: PublicContinuationAuthority,
): PublicContinuationAuthority {
  return updatePublicContinuationAuthority(
    state,
    closeDurableContext(context),
  );
}

function continuationMetadata(
  state: PublicContinuationAuthority,
  replayState: abg.ReplayState,
  eventLog: abg.PersistedEventLog,
  status: "abandoned" | "open" | "responded" | "resolved" | "superseded",
) {
  return {
    runtimeInvocationRef: state.runtimeInvocationRef,
    ...(replayState.runId === null ? {} : { runId: replayState.runId }),
    ...(replayState.graphCallId === null
      ? {}
      : { graphCallId: replayState.graphCallId }),
    ...(replayState.frameId === null ? {} : { frameId: replayState.frameId }),
    replayRef: replayState.replayRef,
    replayDigest: replayState.replayDigest,
    eventLogPath: eventLog.eventLogPath,
    eventLogDigest: eventLog.eventLogDigest,
    eventLogByteLength: eventLog.durableByteLength,
    durableEventCount: eventLog.durableEventCount,
    continuationRef: state.continuationRef,
    continuationStatus: status,
  } as const;
}

function projectGapAuthority(
  state: PublicGapAuthority,
): {
  readonly artifactTruth: abg.ExactPrefixArtifactTruthProjection;
  readonly rootInvocation: abg.InvocationAdmission;
  readonly replayState: abg.ReplayState;
  readonly route: abg.ReplayRouteState;
  readonly eventLog: abg.PersistedEventLog;
} {
  const durable = projectDurablePrefix(state.prefix, {
    runId: state.source.sourceRunId,
  });
  const artifactTruth = exactArtifactTruth(state.prefix);
  const rootInvocation = abg.rehydrateInvocationAdmissionAtPrefix(
    durable.fullPrefix,
    state.source.sourceInvocationAdmissionRef,
  );
  const replayState = durable.replayState;
  const route = replayState.routes.find(
    (candidate) =>
      candidate.routeKind === "gap_stop" &&
      candidate.routeRef === state.source.sourceRouteRef &&
      candidate.routeDigest === state.source.sourceRouteDigest &&
      candidate.admissionEventRef === state.source.sourceRouteEventRef,
  );
  const selectedLockRowMatch = resolveExactMatch(
    state.resolvedProductLock.rows,
    (row) => row.productId === state.install.productId,
  );
  const noActionDisposition =
    route?.nextActionProjection?.disposition === "no_action"
      ? route.nextActionProjection.noActionDisposition
      : null;
  const expectedRuntimeStatus = noActionDisposition === "gap_stop"
    ? "gap_stopped"
    : "stopped";
  if (
    rootInvocation === null ||
    rootInvocation.invocationRef !== state.source.sourceInvocationRef ||
    rootInvocation.invocationVariant !== "start" ||
    rootInvocation.publicStart === null ||
    product.sha256Canonical(
      rootInvocation.publicStart as unknown as product.JsonValue,
    ) !== product.sha256Canonical(
      state.publicStart as unknown as product.JsonValue,
    ) ||
    !product.isResolvedProductLock(state.resolvedProductLock) ||
    !product.isProductSet(state.productSet, state.resolvedProductLock) ||
    state.workspaceBinding.productSetId !== state.productSet.productSetId ||
    state.workspaceBinding.productSetDigest !==
      state.productSet.productSetDigest ||
    state.workspaceBinding.lockId !== state.resolvedProductLock.lockId ||
    state.workspaceBinding.lockDigest !==
      state.resolvedProductLock.lockDigest ||
    !state.productSet.orderedInstallRefs.includes(state.install.installId) ||
    selectedLockRowMatch.kind !== "one" ||
    selectedLockRowMatch.value.productId !== state.install.productId ||
    selectedLockRowMatch.value.packageName !== state.install.packageName ||
    selectedLockRowMatch.value.packageVersion !== state.install.packageVersion ||
    selectedLockRowMatch.value.artifactDigest !== state.install.artifactDigest ||
    selectedLockRowMatch.value.productContentDigest !==
      state.install.productContentDigest ||
    selectedLockRowMatch.value.manifestDigest !== state.install.manifestDigest ||
    rootInvocation.workspaceBindingId !== state.workspaceBinding.bindingId ||
    rootInvocation.workspaceBindingDigest !==
      state.workspaceBinding.bindingDigest ||
    state.install.installedRoot !== state.workspaceBinding.roots.productRoot ||
    state.catalog.basisDigest !== state.catalogView.catalogBasisDigest ||
    !abg.hasAdmittedProductInstall(artifactTruth, state.install) ||
    !abg.hasAdmittedWorkspaceBinding(artifactTruth, state.workspaceBinding) ||
    route === undefined ||
    route.nextActionProjectionRef !==
      state.source.nextActionProjectionRef ||
    route.nextActionProjectionDigest !==
      state.source.nextActionProjectionDigest ||
    route.nextActionProjection?.disposition !== "no_action" ||
    route.nextActionProjection.gapRef !== state.source.gapRef ||
    product.sha256Canonical(
      route.nextActionProjection as unknown as product.JsonValue,
    ) !== product.sha256Canonical(
      state.source.nextActionProjection as unknown as product.JsonValue,
    ) ||
    noActionDisposition === null ||
    replayState.runStoppedDisposition !== noActionDisposition ||
    replayState.runtimeStatus !== expectedRuntimeStatus ||
    replayState.runStoppedEventRef !==
      state.source.sourceRunStoppedEventRef
  ) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "durable gap authority differs from its admitted Product, route, stop, or invocation basis",
    );
  }
  return {
    artifactTruth,
    rootInvocation,
    replayState,
    route,
    eventLog: durable.eventLog,
  };
}

function closeGapAuthority(
  context: RootOperationContext,
  state: PublicGapAuthority,
): PublicGapAuthority {
  return updatePublicGapAuthority(
    state,
    closeDurableContext(context),
  );
}

function projectRunProjectionAuthority(
  state: PublicRunProjectionAuthority,
): {
  readonly rootInvocation: abg.InvocationAdmission;
  readonly replayState: abg.ReplayState;
  readonly eventLog: abg.PersistedEventLog;
  readonly fullPrefix: abg.ValidatedRuntimeEventPrefix;
} {
  const durable = projectDurablePrefix(state.prefix, { runId: state.runId });
  const artifactTruth = exactArtifactTruth(state.prefix);
  const rootInvocation = abg.rehydrateInvocationAdmissionAtPrefix(
    durable.fullPrefix,
    state.invocationAdmissionRef,
  );
  const replayState = durable.replayState;
  const reconstructedCatalog = product.admitGraphFunctionCatalog(
    state.catalogReadinessBasis,
  );
  const resultExists = state.resultRef === null ||
    replayState.cCalls.some((cCall) => cCall.resultRef === state.resultRef);
  if (
    rootInvocation === null ||
    state.workspaceId !== rootInvocation.workspaceId ||
    rootInvocation.invocationRef !== state.runtimeInvocationRef ||
    rootInvocation.outputContractRef !== state.outputContractRef ||
    rootInvocation.workspaceBindingId !== state.workspaceBindingId ||
    rootInvocation.workspaceBindingDigest !==
      state.workspaceBindingDigest ||
    rootInvocation.catalogBasisDigest !== state.catalogBasisDigest ||
    rootInvocation.catalogViewDigest !== state.catalogViewDigest ||
    reconstructedCatalog.kind !== "graph_function_catalog" ||
    reconstructedCatalog.basisDigest !== state.catalogBasisDigest ||
    product.sha256Canonical(
      reconstructedCatalog.publicationDigests as unknown as product.JsonValue,
    ) !== product.sha256Canonical(
      state.publicationDigests as unknown as product.JsonValue,
    ) ||
    !abg.hasAdmittedProductInstall(artifactTruth, state.install) ||
    !abg.hasInvocationRunBindingAtPrefix(
      durable.fullPrefix,
      rootInvocation,
      state.runId,
    ) ||
    replayState.runId !== state.runId ||
    replayState.graphCallId !== state.graphCallId ||
    !resultExists
  ) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "durable run projection authority differs from its admitted invocation, Run, GraphCall, or result basis",
    );
  }
  return {
    rootInvocation,
    replayState,
    eventLog: durable.eventLog,
    fullPrefix: durable.fullPrefix,
  };
}

function deriveInvocationSourceResultBasis(
  state: PublicRunProjectionAuthority,
  resultRef: string,
  currentProductBasis: RunProjectionProductBasis,
): product.ProductInvocationSourceResultBasis {
  if (
    state.install.packageName !== currentProductBasis.install.packageName ||
    state.install.packageVersion !== currentProductBasis.install.packageVersion ||
    state.install.productContentDigest !==
      currentProductBasis.install.productContentDigest ||
    state.install.manifestDigest !== currentProductBasis.install.manifestDigest ||
    product.sha256Canonical(state.publicationDigests as unknown as product.JsonValue) !==
      product.sha256Canonical(currentProductBasis.publicationDigests as unknown as product.JsonValue) ||
    state.catalogBasisDigest !== currentProductBasis.catalogBasisDigest ||
    state.catalogViewDigest !== currentProductBasis.catalogViewDigest
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "source result authority belongs to a different Product publication or semantics basis",
    );
  }
  const projected = projectRunProjectionAuthority(state);
  const basis = abg.deriveInvocationSourceResultBasisAtPrefix(
    projected.fullPrefix,
    {
      publicAuthorityDigest: state.authorityDigest,
      runtimeInvocationRef: state.runtimeInvocationRef,
      invocationAdmissionRef: state.invocationAdmissionRef,
      runId: state.runId,
      resultRef,
    },
  );
  if (basis === null) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "source result is not closed admitted truth under the supplied projection authority",
    );
  }
  return basis;
}

function closeRunProjectionAuthority(
  context: RootOperationContext,
  state: PublicRunProjectionAuthority,
): PublicRunProjectionAuthority {
  return updatePublicRunProjectionAuthority(
    state,
    closeDurableContext(context),
  );
}

async function applyRunProjectionRead(
  _context: RootOperationContext,
  invocation: Exclude<
    RootInvocationFor<"abg.operation.project.read">,
    RootInvocationVariantFor<
      "abg.operation.project.read",
      "gaps" | "lawful-actions"
    >
  >,
): Promise<PublicOutcome> {
  requireExactPayloadKeys(
    invocation.payload,
    ["projectionAuthority", "targetRef"],
    "project.read",
  );
  const state = parsePublicRunProjectionAuthority(
    invocation.payload.projectionAuthority,
  );
  if (state === null) {
    throw new ApplicationRefusal(
      "invalid_request",
      "project.read requires one exact self-consistent public run projection authority",
    );
  }
  const artifactTruth = exactArtifactTruth(state.prefix);
  const targetRef = stringField(invocation.payload, "targetRef");
  const authorityProjection = projectRunProjectionAuthority(state);
  const replayState = authorityProjection.replayState;
  const secondReplay = projectDurablePrefix(state.prefix, {
    runId: state.runId,
  }).replayState;
  const eventLog = authorityProjection.eventLog;
    let productSemantics: product.ProductSemanticsProvider | null = null;
    if (!isCoreRunProjectionVariant(invocation.variant)) {
      try {
        productSemantics = await product.loadInstalledProductSemantics({
          install: state.install,
          publication: publicationForProgram(
            state.publications,
            authorityProjection.rootInvocation.programRef,
          ),
          verifyInstallAdmission: (install) =>
            abg.hasAdmittedProductInstall(artifactTruth, install),
        });
      } catch {
        throw new ApplicationRefusal(
          "owner_refusal",
          "project.read Product result projection is not carried by the exact admitted install",
        );
      }
      if (
        !product.supportsInstalledPublicResultProjection(
          productSemantics,
          invocation.variant,
        )
      ) {
        throw new ApplicationRefusal(
          "invalid_request",
          `project.read variant ${invocation.variant} is absent from the Product-declared result projection roster`,
        );
      }
    }
    const isResultRead = productSemantics !== null;
    const selectedResultRef = isResultRead
      ? targetRef === state.graphCallId
        ? state.resultRef
        : targetRef
      : null;
    const selectedResult = selectedResultRef === null
      ? undefined
      : replayState.cCalls.find(
          (cCall) => cCall.resultRef === selectedResultRef,
        );
    const targetMatches = isResultRead
      ? selectedResult !== undefined
      : targetRef === state.runId || targetRef === state.graphCallId;
    if (!targetMatches) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read target is outside the admitted Run or subordinate result authority",
      );
    }
    if (
      eventLog.eventCount !== replayState.eventCount ||
      eventLog.eventLogDigest !== state.prefix.prefixDigest ||
      replayState.replayDigest !== secondReplay.replayDigest
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "project.read run projection differs from its exact durable prefix",
      );
    }
    const projected = projectOutcome(
      invocation,
      replayState,
      secondReplay,
      state.outputContractRef,
      state.runtimeInvocationRef,
      eventLog,
    );
    if (
      isResultRead &&
      (
        selectedResult === undefined ||
        selectedResult.status !== "judged" ||
        selectedResult.judgment !== "advance" ||
        selectedResult.resultRef === null ||
        selectedResult.resultContractRef === null ||
        selectedResult.resultValue === null ||
        replayState.runtimeStatus !== "closed" ||
        replayState.runClosedEventRef === null
      )
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read result requires one replay-closed admitted result",
      );
    }
    const scopedEvents = eventLog.events;
    let publicResultValue = isResultRead
      ? selectedResult!.resultValue!
      : projected.result;
    let publicResultContractRef = selectedResult?.resultContractRef ?? null;
    if (isResultRead) {
      const publicProjection = product.projectInstalledPublicResult(
        productSemantics!,
        {
          value: selectedResult!.resultValue!,
          admittedResultRef: selectedResult!.resultRef!,
          admittedResultContractRef:
            selectedResult!.resultContractRef!,
          replayRef: replayState.replayRef,
          projectionKind: invocation.variant,
        },
      );
      publicResultValue = publicProjection?.value ?? null;
      publicResultContractRef = publicProjection?.contractRef ?? null;
      if (publicResultValue === null) {
        throw new ApplicationRefusal(
          "owner_refusal",
          "project.read Product result projection refused the admitted result and replay basis",
        );
      }
    }
    const readResult = invocation.variant === "status"
      ? {
          kind: "public_run_status_projection",
          schemaVersion: "5.0.0",
          runId: state.runId,
          graphCallId: replayState.graphCallId,
          runtimeStatus: replayState.runtimeStatus,
          resultRef: projected.resultRef,
          resultContractRef: projected.admittedResultContractRef,
          replayRef: replayState.replayRef,
          replayDigest: replayState.replayDigest,
        }
      : isResultRead
        ? {
            kind: "public_result_projection",
            schemaVersion: "5.0.0",
            disposition: projected.disposition,
            resultRef: selectedResult!.resultRef,
            resultContractRef: publicResultContractRef,
            outputContractRef: publicResultContractRef,
            value: publicResultValue,
            closureEligible: true,
            residuals: [],
            replayRef: replayState.replayRef,
            replayDigest: replayState.replayDigest,
          }
        : {
            kind: "public_replay_projection",
            schemaVersion: "5.0.0",
            runId: state.runId,
            ordering: "admission_ordinal",
            fromOrdinal: scopedEvents.at(0)?.admissionOrdinal ?? null,
            toOrdinal: scopedEvents.at(-1)?.admissionOrdinal ?? null,
            eventCount: scopedEvents.length,
            events: scopedEvents,
            replayRef: replayState.replayRef,
            replayDigest: replayState.replayDigest,
            eventStoreDigest: replayState.eventStoreDigest,
          };
    return attachProjectionAuthority(
      successOutcome(
        invocation,
        {
          ...readResult,
          projectionAuthority: state as unknown as product.JsonValue,
        } as unknown as product.JsonValue,
        {
          runtimeInvocationRef: state.runtimeInvocationRef,
          runId: state.runId,
          ...(replayState.graphCallId === null
            ? {}
            : { graphCallId: replayState.graphCallId }),
          ...(replayState.frameId === null
            ? {}
            : { frameId: replayState.frameId }),
          replayRef: replayState.replayRef,
          replayDigest: replayState.replayDigest,
          eventLogPath: eventLog.eventLogPath,
          eventLogDigest: eventLog.eventLogDigest,
          eventLogByteLength: eventLog.durableByteLength,
          durableEventCount: eventLog.durableEventCount,
        },
      ),
      state as unknown as product.JsonValue,
    );
}

async function applyGapRead(
  _context: RootOperationContext,
  invocation: RootInvocationVariantFor<
    "abg.operation.project.read",
    "gaps"
  >,
): Promise<PublicOutcome> {
  requireExactPayloadKeys(
    invocation.payload,
    ["gapAuthority", "gapRef"],
    "project.read",
  );
  const gapRef = stringField(invocation.payload, "gapRef");
  const state = parsePublicGapAuthority(
    invocation.payload.gapAuthority,
    gapRef,
  );
  if (state === null) {
    throw new ApplicationRefusal(
      "invalid_request",
      "project.read gaps requires the exact self-consistent public gap authority",
    );
  }
  const projection = projectGapAuthority(state);
  const replayState = projection.replayState;
  const eventLog = projection.eventLog;
    if (
      eventLog.eventCount !== replayState.eventCount ||
      eventLog.eventLogDigest !== state.prefix.prefixDigest
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "project.read gaps must remain a pure projection over one exact durable prefix",
      );
    }
    return successOutcome(
      invocation,
      {
        kind: "public_gap_projection",
        schemaVersion: "5.0.0",
        constructionStatus:
          state.source.nextActionProjection.noActionDisposition ===
              "reprice_required"
            ? "reprice_required"
            : "construction_stalled",
        gapRef,
        sourceRunId: state.source.sourceRunId,
        sourceRouteRef: state.source.sourceRouteRef,
        nextActionProjection:
          state.source.nextActionProjection as unknown as product.JsonValue,
        gapAuthority: state as unknown as product.JsonValue,
      },
      {
        runtimeInvocationRef: state.source.sourceInvocationRef,
        runId: state.source.sourceRunId,
        replayRef: replayState.replayRef,
        replayDigest: replayState.replayDigest,
        eventLogPath: eventLog.eventLogPath,
        eventLogDigest: eventLog.eventLogDigest,
        eventLogByteLength: eventLog.durableByteLength,
        durableEventCount: eventLog.durableEventCount,
      },
    );
}

async function applyProjectRead(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.project.read">,
): Promise<PublicOutcome> {
  if (invocation.variant === "gaps") {
    return applyGapRead(context, invocation);
  }
  if (
    invocation.variant !== "lawful-actions" &&
    invocation.payload.projectionAuthority !== undefined
  ) {
    return applyRunProjectionRead(context, invocation);
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["continuationAuthority", "continuationRef"],
    "project.read",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationAuthority(
    continuationRef,
    invocation.payload,
  );
  try {
  const artifactTruth = exactArtifactTruth(state.prefix);
  const authorityProjection = projectContinuationAuthority(state);
  const replayState = authorityProjection.replayState;
  const eventLog = authorityProjection.eventLog;
    const continuation = replayState.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    if (continuation === undefined) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read requires the exact admitted continuation",
      );
    }
    const intentRoute = continuation.constructionIntentRef === null
      ? undefined
      : replayState.routes.find(
          (route) =>
            route.constructionIntentRef ===
              continuation.constructionIntentRef,
        );
    const latestActionRoute = [...replayState.routes].reverse().find(
      (route) => route.nextActionProjection !== undefined,
    );
    const actionCalls = replayState.cCalls.filter(
      (cCall) =>
        cCall.status === "judged" &&
        cCall.judgmentRef !== null &&
        replayState.routes.some(
          (route) =>
            route.cCallRef === cCall.cCallRef &&
            route.judgmentRef === cCall.judgmentRef,
        ) &&
        typeof cCall.resultValue === "object" &&
        cCall.resultValue !== null &&
        !Array.isArray(cCall.resultValue) &&
        (
          cCall.resultValue as Readonly<
            Record<string, product.JsonValue>
          >
        ).kind === "next_action_projection",
    );
    const latestActionCall = actionCalls.at(-1);
    const latestConstructionDelta =
      replayState.constructionDeltas.at(-1) ?? null;
    const scopedEvents = eventLog.events;
    const constructionStatus = replayState.runtimeStatus === "closed"
      ? "construction_closed"
      : replayState.runtimeStatus === "blocked"
        ? "construction_blocked"
        : replayState.runtimeStatus === "failed"
          ? "construction_stalled"
          : replayState.runtimeStatus === "stopped" &&
              [
                "repair",
                "inspect_runtime_archive",
                "reprice",
                "escalate",
              ].includes(String(replayState.runStoppedDisposition))
            ? `construction_${replayState.runStoppedDisposition}`
          : continuation.status === "open"
            ? "fh_input_required"
            : "construction_progressing_yield";
    let productSemantics: product.ProductSemanticsProvider | null = null;
    if (!isCoreRunProjectionVariant(invocation.variant)) {
      try {
        productSemantics = await product.loadInstalledProductSemantics({
          install: state.install,
          publication: publicationForProgram(
            state.publications,
            state.program.programRef,
          ),
          verifyInstallAdmission: (install) =>
            abg.hasAdmittedProductInstall(artifactTruth, install),
        });
      } catch {
        throw new ApplicationRefusal(
          "owner_refusal",
          "project.read Product result projection is not carried by the exact admitted install",
        );
      }
      if (
        !product.supportsInstalledPublicResultProjection(
          productSemantics,
          invocation.variant,
        )
      ) {
        throw new ApplicationRefusal(
          "invalid_request",
          `project.read variant ${invocation.variant} is absent from the Product-declared result projection roster`,
        );
      }
    }
    const isResultRead = productSemantics !== null;
    const projectedResult = isResultRead
      ? projectOutcome(
          invocation,
          replayState,
          projectDurablePrefix(state.prefix, { runId: state.runId }).replayState,
          state.outputContractRef,
          state.runtimeInvocationRef,
          eventLog,
        )
      : null;
    if (
      isResultRead &&
      (
        continuation.status !== "resolved" ||
        projectedResult?.disposition !== "succeeded" ||
        projectedResult.resultRef === null
      )
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read result requires one replay-closed resolved continuation",
      );
    }
    let publicResultValue = projectedResult?.result ?? null;
    let publicResultContractRef =
      projectedResult?.admittedResultContractRef ?? null;
    if (isResultRead) {
      const publicProjection = product.projectInstalledPublicResult(
        productSemantics!,
        {
          value: projectedResult!.result,
          admittedResultRef: projectedResult!.resultRef!,
          admittedResultContractRef:
            projectedResult!.admittedResultContractRef!,
          replayRef: replayState.replayRef,
          projectionKind: invocation.variant,
        },
      );
      publicResultValue = publicProjection?.value ?? null;
      publicResultContractRef = publicProjection?.contractRef ?? null;
      if (publicResultValue === null) {
        throw new ApplicationRefusal(
          "owner_refusal",
          "project.read Product result projection refused the admitted result and replay basis",
        );
      }
    }
    const readResult = invocation.variant === "status"
      ? {
          kind: "continuation_status",
          schemaVersion: "5.0.0",
          continuationRef,
          status: continuation.status,
          constructionStatus,
          runtimeStatus: replayState.runtimeStatus,
          requestRef: continuation.requestRef,
          requestDigest: continuation.requestDigest,
          responseContractRef: continuation.responseContractRef,
          responseRef: continuation.responseRef,
          constructionIntentRef: continuation.constructionIntentRef,
          constructionIntentDigest: continuation.constructionIntentDigest,
          runStoppedDisposition: replayState.runStoppedDisposition,
          actionEvaluation:
            latestConstructionDelta?.actionEvaluation ?? null,
          runtimeArchiveInspection:
            latestConstructionDelta?.actionEvaluation
              .runtimeArchiveInspection ?? null,
          nextActionProjection:
            intentRoute?.nextActionProjection === undefined
              ? null
              : intentRoute.nextActionProjection as unknown as product.JsonValue,
          replayRef: replayState.replayRef,
          replayDigest: replayState.replayDigest,
        }
      : isResultRead
        ? {
            kind: "public_result_projection",
            schemaVersion: "5.0.0",
            constructionStatus,
            disposition: projectedResult!.disposition,
            resultRef: projectedResult!.resultRef,
            resultContractRef: publicResultContractRef,
            outputContractRef: publicResultContractRef,
            value: publicResultValue,
            closureEligible: true,
            residuals: [],
            replayRef: replayState.replayRef,
            replayDigest: replayState.replayDigest,
          }
        : invocation.variant === "replay"
          ? {
              kind: "public_replay_projection",
              schemaVersion: "5.0.0",
              runId: state.runId,
              ordering: "admission_ordinal",
              fromOrdinal:
                scopedEvents.at(0)?.admissionOrdinal ?? null,
              toOrdinal:
                scopedEvents.at(-1)?.admissionOrdinal ?? null,
              eventCount: scopedEvents.length,
              events: scopedEvents,
              replayRef: replayState.replayRef,
              replayDigest: replayState.replayDigest,
              eventStoreDigest: replayState.eventStoreDigest,
            }
          : {
              kind: "public_lawful_actions_projection",
              schemaVersion: "5.0.0",
              constructionStatus,
              current: latestActionCall?.resultValue ??
                latestActionRoute?.nextActionProjection ??
                null,
              rows: actionCalls
                .map((cCall) => ({
                  cCallRef: cCall.cCallRef,
                  resultRef: cCall.resultRef,
                  judgmentRef: cCall.judgmentRef,
                  projection: cCall.resultValue,
                })),
              replayRef: replayState.replayRef,
              replayDigest: replayState.replayDigest,
            };
    return successOutcome(
      invocation,
      {
        ...readResult,
        continuationAuthority: state as unknown as product.JsonValue,
      } as unknown as product.JsonValue,
      continuationMetadata(
        state,
        replayState,
        eventLog,
        continuation.status,
      ),
    );
  } catch (error) {
    return continuationRefusalOutcome(invocation, state, error);
  }
}

async function applyInteractionRespond(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.interaction.respond">,
): Promise<PublicOutcome> {
  if (
    invocation.variant !== "approve" &&
    invocation.variant !== "answer_escalation"
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "interaction.respond requires the declared approve or answer_escalation variant",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    [
      "actorRef",
      "capabilityRef",
      "continuationAuthority",
      "continuationRef",
      "response",
    ],
    "interaction.respond",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationAuthority(
    continuationRef,
    invocation.payload,
  );
  let latestAuthority = state;
  try {
  requireExactRootOperationContextPrefix(
    context,
    state.prefix,
    "interaction.respond continuationAuthority",
  );
  const authorityProjection = projectContinuationAuthority(state);
  requireEffectfulOwnerResult(
    abg.projectEffectfulPublicInvocationTruthAtPrefix(
      authorityProjection.fullPrefix,
      invocation.invocationRef,
    ),
  );
  const continuation = authorityProjection.replayState.continuations.find(
    (row) => row.continuationRef === continuationRef,
  );
  if (continuation === undefined || continuation.status !== "open") {
    throw new ApplicationRefusal(
      "target_mismatch",
      "interaction.respond requires the exact open continuation",
    );
  }
  const actorRef = stringField(invocation.payload, "actorRef");
  const capabilityRef = stringField(invocation.payload, "capabilityRef");
  const publicOperationBasis = operationBasis(
    invocation,
    state.workspaceBinding.bindingId,
    state.workspaceBinding.bindingDigest,
    [],
  );
  const responseBasis = {
    eventTime: invocation.eventTime,
    correlationId: invocation.correlationId,
    causationEventRefs: [],
  } as const;
  let response: Readonly<Record<string, product.JsonValue>>;
  try {
    const preparedOperation = requireEffectfulOwnerResult(
      abg.prepareContinuationPublicOperation(
        authorityProjection.fullPrefix,
        authorityProjection.rootInvocation,
        "abg.operation.interaction.respond",
        continuation,
        invocation.variant,
        actorRef,
        capabilityRef,
        publicOperationBasis,
      ),
    );
    const responseCandidate = recordField(invocation.payload, "response");
    const interactionBasis = abg.projectFhInteractionSemanticBasisAtPrefix(
      authorityProjection.fullPrefix,
      continuation,
    );
    if (interactionBasis === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "interaction response could not reproduce its exact pending Product basis",
      );
    }
    const productSemantics = await product.loadInstalledProductSemantics({
      install: state.install,
      publication: publicationForProgram(state.publications, state.program.programRef),
      verifyInstallAdmission: (install) =>
        abg.hasAdmittedProductInstall(authorityProjection.artifactTruth, install),
    });
    const evaluated = product.evaluateInstalledInteractionResponse(
      productSemantics,
      {
        ...interactionBasis,
        actingActorRef: preparedOperation.operation.actorRef,
      },
      responseCandidate,
    );
    if (evaluated === null) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "interaction response differs from the Product-owned pending choice or response contract",
      );
    }
    const correctionDisposition = evaluated.correctionDisposition;
    if (
      (
        correctionDisposition !== undefined &&
        (
          invocation.variant !== "answer_escalation" ||
          ![
            "repair",
            "inspect_runtime_archive",
            "reprice",
            "escalate",
          ].includes(String(correctionDisposition))
        )
      )
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "interaction response variant differs from its Product-owned correction decision",
      );
    }
    abg.prepareFhInteractionResponse(
      preparedOperation,
      continuation,
      continuation.responseContractRef,
      evaluated,
      responseBasis,
    );
    response = evaluated;
  } catch (error) {
    const code =
      error instanceof ApplicationRefusal ? error.code : "owner_refusal";
    const message =
      error instanceof Error ? error.message : String(error);
    const outcome = refusalOutcome(
      invocation,
      code,
      message,
      {
        ...continuationMetadata(
          state,
          authorityProjection.replayState,
          authorityProjection.eventLog,
          continuation.status,
        ),
        ...(error instanceof ApplicationRefusal &&
            error.priorAdmission !== null
          ? { priorAdmission: error.priorAdmission }
          : {}),
      },
    );
    return attachContinuationAuthority(
      outcome,
      state as unknown as product.JsonValue,
    );
  }

  let heldContext: RootOperationContext | null = context;
  const effectContext = context;
  try {
    const committed = requireEffectfulOwnerResult(
      abg.commitFhInteractionResponseAtExpectedPrefix(
        effectContext.store,
        state.prefix,
        authorityProjection.rootInvocation,
        continuation,
        invocation.variant,
        actorRef,
        capabilityRef,
        publicOperationBasis,
        continuation.responseContractRef,
        response,
        responseBasis,
      ),
    );
    effectContext.prefix = committed.successorPrefix;
    const updated = closeContinuationContext(effectContext, state);
    heldContext = null;
    latestAuthority = updated;
    const successorProjection = projectContinuationAuthority(updated);
    return successOutcome(
      invocation,
      {
        kind: committed.response.kind,
        schemaVersion: committed.response.schemaVersion,
        disposition: committed.response.disposition,
        continuationRef,
        responseRef: committed.response.responseRef,
        responseDigest: committed.response.responseDigest,
        continuationAuthority: updated as unknown as product.JsonValue,
      },
      continuationMetadata(
        updated,
        successorProjection.replayState,
        successorProjection.eventLog,
        "responded",
      ),
    );
  } catch (error) {
    const updated = heldContext === null
      ? latestAuthority
      : closeContinuationContext(heldContext, state);
    heldContext = null;
    latestAuthority = updated;
    const successorProjection = projectContinuationAuthority(updated);
    const continuationAfter = successorProjection.replayState.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    const outcome = refusalOutcome(
      invocation,
      error instanceof ApplicationRefusal ? error.code : "owner_refusal",
      error instanceof Error ? error.message : String(error),
      continuationMetadata(
        updated,
        successorProjection.replayState,
        successorProjection.eventLog,
        continuationAfter?.status ?? "open",
      ),
    );
    return attachContinuationAuthority(
      outcome,
      updated as unknown as product.JsonValue,
    );
  } finally {
    if (heldContext !== null) {
      latestAuthority = closeContinuationContext(heldContext, state);
    }
  }
  } catch (error) {
    return continuationRefusalOutcome(invocation, latestAuthority, error);
  }
}

async function applyRunContinue(
  context: RootOperationContext,
  invocation: RootInvocationFor<"abg.operation.run.continue">,
): Promise<PublicOutcome> {
  if (invocation.variant !== "current_intent") {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.continue requires variant current_intent",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    [
      "actorRef",
      "capabilityRef",
      "continuationAuthority",
      "continuationRef",
    ],
    "run.continue",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationAuthority(
    continuationRef,
    invocation.payload,
  );
  let latestAuthority = state;
  try {
  requireExactRootOperationContextPrefix(
    context,
    state.prefix,
    "run.continue continuationAuthority",
  );
  const authorityProjection = projectContinuationAuthority(state);
  requireEffectfulOwnerResult(
    abg.projectEffectfulPublicInvocationTruthAtPrefix(
      authorityProjection.fullPrefix,
      invocation.invocationRef,
    ),
  );
  const artifactTruth = authorityProjection.artifactTruth;
  const continuation = authorityProjection.replayState.continuations.find(
    (row) => row.continuationRef === continuationRef,
  );
  if (
    continuation === undefined ||
    continuation.status !== "responded" ||
    continuation.responseRef === null ||
    continuation.responseDigest === null
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.continue requires the exact responded continuation",
    );
  }
  const actorRef = stringField(invocation.payload, "actorRef");
  const capabilityRef = stringField(invocation.payload, "capabilityRef");
  const publicOperationBasis = operationBasis(
    invocation,
    state.workspaceBinding.bindingId,
    state.workspaceBinding.bindingDigest,
    [],
  );
  const preparedOperation = requireEffectfulOwnerResult(
    abg.prepareContinuationPublicOperation(
      authorityProjection.fullPrefix,
      authorityProjection.rootInvocation,
      "abg.operation.run.continue",
      continuation,
      invocation.variant,
      actorRef,
      capabilityRef,
      publicOperationBasis,
    ),
  );
  const rehydrated = abg.rehydrateFhContinuationAtPrefix(
    preparedOperation.projectedPrefix,
    continuation,
    {
      install: state.install,
      workspaceBinding: state.workspaceBinding,
      catalogView: state.catalogView,
      program: state.program,
      graph: state.heldGraph,
      closureContract: state.heldClosureContract,
    },
    preparedOperation.operation,
  );
  if (rehydrated === null) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "run continuation durable authority reconstruction failed",
    );
  }
  const heldCursor = hog.rehydrateHeldInteractionCursor(
    preparedOperation.projectedPrefix,
    rehydrated.heldInteraction.cursor,
  );
  if (heldCursor === null) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "run continuation could not rehydrate its exact HoG cursor",
    );
  }
  const publication = publicationForProgram(
    state.publications,
    state.program.programRef,
  );
  const publicationAdmission = rawAdmission<ModulePublication>(
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const programValidation = validator.validateProgram(
    rawProgramInput(publicationAdmission, state.program),
  );
  const implementationSet = abg.rehydrateAdmittedImplementationSetAtPrefix(
    authorityProjection.fullPrefix,
    rehydrated.executionBasis.rootImplementationSetRef,
  );
  const interactionSet = abg.rehydrateAdmittedInteractionSetAtPrefix(
    authorityProjection.fullPrefix,
    rehydrated.executionBasis.rootInteractionSetRef,
  );
  if (
    programValidation.kind !== "program_validation" ||
    programValidation.validationRef !==
      rehydrated.executionBasis.programValidationRef ||
    implementationSet === null ||
    interactionSet === null
  ) {
    throw new ApplicationRefusal(
      "owner_refusal",
      "continued run could not reproduce its admitted Program and execution sets",
    );
  }
  const productSemantics = await product.loadInstalledProductSemantics({
    install: state.install,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(artifactTruth, install),
  });
  const leafPort = await constructAdmittedLeafInvocationPort({
    prefix: authorityProjection.fullPrefix,
    artifactTruth,
    install: state.install,
    implementationSet,
    publication,
    semanticsProjection:
      product.projectInstalledLeafSemantics(productSemantics),
  });
  let successorInputContractRef: string | null;
  try {
    successorInputContractRef =
      hog.deriveInteractionSuccessorInputCarrierRef(
        state.heldGraph,
        heldCursor,
      );
  } catch (error) {
    throw new ApplicationRefusal(
      "owner_refusal",
      `run continuation successor carrier derivation failed: ${String(error)}`,
    );
  }
  const successorInputValueKind = successorInputContractRef === null
    ? null
    : leafPort.contractValueKindByRef(successorInputContractRef);
  if (
    (successorInputContractRef === null) !==
      (successorInputValueKind === null) ||
    (continuation.constructionIntentRef !== null &&
      (
        successorInputContractRef === null ||
        successorInputValueKind !== "action_evaluation_basis"
      )) ||
    (continuation.constructionIntentRef === null &&
      successorInputContractRef !== null &&
      (
        successorInputContractRef !== continuation.responseContractRef ||
        typeof continuation.responseValue !== "object" ||
        continuation.responseValue === null ||
        Array.isArray(continuation.responseValue) ||
        !leafPort.validateContractValueByRef(
          successorInputContractRef,
          continuation.responseValue,
        )
      ))
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run continuation target carrier, response contract, or admitted value kind differs",
    );
  }
  const successorInput = abg.deriveFhResumeSuccessorInputAtPrefix(
    preparedOperation.projectedPrefix,
    continuation,
    preparedOperation.operation,
    rehydrated.executionBasis,
    state.heldClosureContract,
    {
      inputContractRef: successorInputContractRef,
      inputValueKind: successorInputValueKind,
    },
  );
  if (
    successorInputContractRef !== null &&
    !leafPort.validateContractValueByRef(
      successorInputContractRef,
      successorInput.inputValue,
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run continuation successor value fails its exact admitted contract",
    );
  }
  const successorCursor = hog.deriveInteractionResumeCursor(
    heldCursor,
    {
      inputRef: successorInput.inputRef,
      inputDigest: successorInput.inputDigest,
    },
  );
  if (successorCursor.kind !== "traversal_cursor") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `interaction resume cursor refused: ${successorCursor.message}`,
    );
  }
  const resumeBasis = {
    eventTime: invocation.eventTime,
    correlationId: invocation.correlationId,
    causationEventRefs: [],
  } as const;
  abg.prepareFhInteractionResume(
    preparedOperation,
    continuation,
    rehydrated.executionBasis,
    state.heldClosureContract,
    successorInput,
    successorCursor,
    state.prefix.prefixDigest,
    resumeBasis,
  );
  const prepareTraversalRuntime = (
    executionBasis: abg.ExecutionBasis,
    openedTraversalScope: abg.OpenedTraversalScope,
    graph: Readonly<GtlGraph>,
    closureContract: Readonly<ClosureContract>,
    graphInput: Readonly<Record<string, product.JsonValue>>,
    terminalMode: "close_run" | "return_to_parent",
    correlationId: string,
  ) => {
    const graphFunctionMatch = resolveExactMatch(
      publication.graphFunctions,
      (value) => value.name === graph.graphFunctionRef,
    );
    const graphValidation = graphFunctionMatch.kind !== "one"
      ? null
      : validator.validateGraph(
          graph,
          programValidation,
          graphFunctionMatch.value,
          {
            invocationAdmissionRef:
              authorityProjection.rootInvocation.invocationAdmissionRef,
            admittedInputRef: graph.admittedInputRef,
            admittedInputDigest: graph.admittedInputDigest,
            admittedInput: graphInput,
          },
        );
    if (
      graphFunctionMatch.kind !== "one" ||
      graphValidation === null ||
      graphValidation.kind !== "graph_validation" ||
      graphValidation.validationRef !== executionBasis.graphValidationRef ||
      executionBasis.graphRef !== graph.materializationRef ||
      executionBasis.graphDigest !== graph.materializationDigest ||
      executionBasis.closureContractRef !==
        closureContract.closureContractRef ||
      sha256Canonical(graphInput as unknown as product.JsonValue) !==
        graph.admittedInputDigest
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "continued run could not reproduce an admitted Graph boundary",
      );
    }
    return {
      executionBasis,
      openedTraversalScope,
      graph,
      closureContract,
      graphInput,
      terminalMode,
      correlationId,
      graphFunction: graphFunctionMatch.value,
      graphValidation,
    } as const;
  };
  const immediateSuspension = state.parentSuspensions[0];
  const heldGraphInput = immediateSuspension === undefined
    ? state.invocationInput
    : immediateSuspension.childInput;
  const heldRuntime = prepareTraversalRuntime(
    rehydrated.executionBasis,
    rehydrated.openedTraversalScope,
    state.heldGraph,
    state.heldClosureContract,
    heldGraphInput,
    state.parentSuspensions.length === 0
      ? "close_run"
      : "return_to_parent",
    `${invocation.correlationId}/hog/resumed`,
  );
  let expectedChildExecutionBasis = rehydrated.executionBasis;
  let expectedChildTraversalScope = rehydrated.openedTraversalScope;
  const parentRuntimes = state.parentSuspensions.map((suspension, ordinal) => {
    const parentExecutionBasis = abg.rehydrateExecutionBasisAtPrefix(
      authorityProjection.fullPrefix,
      suspension.parentExecutionBasisRef,
    );
    const parentTraversalScope = abg.rehydrateOpenedTraversalScopeAtPrefix(
      authorityProjection.fullPrefix,
      suspension.parentTraversalScope as unknown as Readonly<
        Record<string, product.JsonValue>
      >,
    );
    const sourceCursor = hog.rehydrateHeldInteractionCursor(
      authorityProjection.fullPrefix,
      suspension.sourceCursor,
    );
    if (
      parentExecutionBasis === null ||
      parentTraversalScope === null ||
      sourceCursor === null ||
      suspension.childExecutionBasisRef !==
        expectedChildExecutionBasis.basisRef ||
      suspension.childTraversalScopeRef !== expectedChildTraversalScope.scopeRef
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "continued run could not rehydrate its suspended workflow lineage",
      );
    }
    const runtime = prepareTraversalRuntime(
      parentExecutionBasis,
      parentTraversalScope,
      suspension.parentGraph,
      suspension.parentClosureContract,
      suspension.parentGraphInput,
      suspension.terminalMode,
      `${invocation.correlationId}/hog/parent/${ordinal}`,
    );
    const parentCCall = suspension.kind === "held_workflow_suspension"
      ? abg.rehydrateWorkflowCCallAtPrefix(
          authorityProjection.fullPrefix,
          parentExecutionBasis,
          implementationSet,
          parentTraversalScope,
          runtime.graphFunction,
          suspension.parentGraph,
          sourceCursor,
          suspension.parentCCall as unknown as Readonly<
            Record<string, product.JsonValue>
          >,
        )
      : null;
    if (
      suspension.kind === "held_workflow_suspension" &&
      parentCCall === null
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "continued run could not rehydrate its parent workflow call",
      );
    }
    expectedChildExecutionBasis = parentExecutionBasis;
    expectedChildTraversalScope = parentTraversalScope;
    return {
      suspension,
      runtime,
      sourceCursor,
      parentCCall,
    } as const;
  });
  let heldContext: RootOperationContext | null = context;
  const effectContext = context;
  let resumedFailureBasis: {
    readonly executionBasis: abg.ExecutionBasis;
    readonly scope: abg.OpenedTraversalScope;
    readonly resumeEventRef: string;
  } | null = null;
  try {
    const committedTransition = requireEffectfulOwnerResult(
      abg.commitFhInteractionResumeAtExpectedPrefix(
        effectContext.store,
        state.prefix,
        authorityProjection.rootInvocation,
        continuation,
        invocation.variant,
        actorRef,
        capabilityRef,
        publicOperationBasis,
        rehydrated.executionBasis,
        state.heldClosureContract,
        successorInput,
        successorCursor,
        resumeBasis,
      ),
    );
    effectContext.prefix = committedTransition.successorPrefix;
    const resume = committedTransition.resume;
    resumedFailureBasis = {
      executionBasis: rehydrated.executionBasis,
      scope: rehydrated.openedTraversalScope,
      resumeEventRef: resume.admissionEventRef,
    };
    const childTraversalPreparationPort = bindChildTraversalPreparationPort({
      store: effectContext.store,
      publication,
      program: state.program,
      programValidation,
      rootImplementationSet: implementationSet,
      rootInteractionSet: interactionSet,
    });
    const traversalInput = (
      runtime: typeof heldRuntime,
    ) => {
      return {
        store: effectContext.store,
        executionBasis: runtime.executionBasis,
        openedTraversalScope: runtime.openedTraversalScope,
        program: state.program,
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
        graphValidation: runtime.graphValidation,
        implementationSet,
        interactionSet,
        continuationProductBasis: {
          install: state.install,
          workspaceBinding: state.workspaceBinding,
          artifactTruth,
          catalogView: state.catalogView,
          programValidation,
          graphValidation: runtime.graphValidation,
        },
        leafPort,
        childTraversalPreparationPort,
        closureContract: runtime.closureContract,
        actorRuntimeBinding: {
          workspaceBinding: state.workspaceBinding,
          artifactTruth,
        },
        input: runtime.graphInput,
        inputDigest: runtime.graph.admittedInputDigest,
        eventTime: invocation.eventTime,
        correlationId: runtime.correlationId,
        ...(runtime.terminalMode === "return_to_parent"
          ? { terminalMode: runtime.terminalMode }
          : {}),
      };
    };
    let completion = await hog.executeGraphTraversal({
      parent: traversalInput(heldRuntime),
      interaction: {
        store: effectContext.store,
        executionBasis: rehydrated.executionBasis,
        openedTraversalScope: rehydrated.openedTraversalScope,
        program: state.program,
        graphFunction: heldRuntime.graphFunction,
        graph: state.heldGraph,
        interactionSet,
        heldInteraction: {
          ...rehydrated.heldInteraction,
          cursor: heldCursor,
        },
        successorCursor,
        resume,
        closureContract: state.heldClosureContract,
        clock: {
          eventTime: invocation.eventTime,
          correlationId: `${invocation.correlationId}/hog`,
        },
      },
    });
    let childExecutionBasis = rehydrated.executionBasis;
    let childTraversalScope = rehydrated.openedTraversalScope;
    for (const preparedParent of parentRuntimes) {
      const {
        suspension,
        runtime,
        sourceCursor,
        parentCCall,
      } = preparedParent;
      const parentRuntime = traversalInput(runtime);
      const parentExecutionBasis = runtime.executionBasis;
      const parentTraversalScope = runtime.openedTraversalScope;
      resumedFailureBasis = {
        executionBasis: parentExecutionBasis,
        scope: parentTraversalScope,
        resumeEventRef: resume.admissionEventRef,
      };
      completion = await hog.executeGraphTraversal({
        parent: parentRuntime,
        suspension,
        parentCCall,
        sourceCursor,
        childExecutionBasis,
        childTraversalScope,
        childCompletion: completion,
      });
      childExecutionBasis = parentExecutionBasis;
      childTraversalScope = parentTraversalScope;
    }
    const updatedAuthority = closeContinuationContext(effectContext, state);
    heldContext = null;
    latestAuthority = updatedAuthority;
    const successorProjection = projectContinuationAuthority(updatedAuthority);
    const firstReplay = successorProjection.replayState;
    const secondReplay = projectDurablePrefix(updatedAuthority.prefix, {
      runId: state.runId,
    }).replayState;
    if (completion.replayState.replayDigest !== firstReplay.replayDigest) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "continued HoG completion and ABG replay disagree",
      );
    }
    const eventLog = successorProjection.eventLog;
    const outcome = projectOutcome(
      invocation,
      firstReplay,
      secondReplay,
      state.outputContractRef,
      state.runtimeInvocationRef,
      eventLog,
    );
    let completedOutcome = attachContinuationAuthority(
      outcome,
      updatedAuthority as unknown as product.JsonValue,
    );
    if (outcome.disposition === "succeeded" && outcome.runId !== null) {
      const projectionAuthority = constructPublicRunProjectionAuthority({
        prefix: updatedAuthority.prefix,
        reopenAuthority: updatedAuthority.reopenAuthority,
        runtimeInvocationRef: state.runtimeInvocationRef,
        invocationAdmissionRef: state.invocationAdmissionRef,
        runId: outcome.runId,
        graphCallId: outcome.graphCallId,
        resultRef: outcome.resultRef,
        outputContractRef: state.outputContractRef,
        install: state.install,
        workspaceId: state.workspaceBinding.workspaceId,
        workspaceBindingId: state.workspaceBinding.bindingId,
        workspaceBindingDigest: state.workspaceBinding.bindingDigest,
        catalogBasisDigest: state.catalog.basisDigest,
        catalogReadinessBasis: state.catalog.readinessBasis,
        catalogViewDigest: state.catalogView.viewDigest,
        publicationDigests: state.catalog.publicationDigests,
        publications: state.publications,
      });
      completedOutcome = attachProjectionAuthority(
        completedOutcome,
        projectionAuthority as unknown as product.JsonValue,
      );
    }
    return completedOutcome;
  } catch (error) {
    if (heldContext !== null && resumedFailureBasis !== null) {
      try {
        abg.admitRuntimeFailure(
          heldContext.store,
          resumedFailureBasis.executionBasis,
          resumedFailureBasis.scope,
          "operation_application",
          {
            continuationRef,
            error: String(error),
          },
          "diagnostic://abiogenesis/continuation/post-resume-failure@5",
          {
            eventTime: invocation.eventTime,
            correlationId: `${invocation.correlationId}/post-resume-failure`,
            causationEventRefs: [resumedFailureBasis.resumeEventRef],
          },
        );
      } catch {
        // Preserve the primary post-resume failure and close the exact suffix.
      }
    }
    const updatedAuthority = heldContext === null
      ? latestAuthority
      : closeContinuationContext(heldContext, state);
    heldContext = null;
    latestAuthority = updatedAuthority;
    const successorProjection = projectContinuationAuthority(updatedAuthority);
    const replayAfterFailure = successorProjection.replayState;
    const continuationAfterFailure = replayAfterFailure.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    const code =
      error instanceof ApplicationRefusal ? error.code : "owner_refusal";
    const message =
      error instanceof Error ? error.message : String(error);
    const outcome = refusalOutcome(
      invocation,
      code,
      message,
      {
        ...continuationMetadata(
          updatedAuthority,
          replayAfterFailure,
          successorProjection.eventLog,
          continuationAfterFailure?.status ?? "responded",
        ),
        ...(error instanceof ApplicationRefusal &&
            error.priorAdmission !== null
          ? { priorAdmission: error.priorAdmission }
          : {}),
      },
    );
    return attachContinuationAuthority(
      outcome,
      updatedAuthority as unknown as product.JsonValue,
    );
  } finally {
    if (heldContext !== null) {
      latestAuthority = closeContinuationContext(heldContext, state);
    }
  }
  } catch (error) {
    return continuationRefusalOutcome(invocation, latestAuthority, error);
  }
}

export async function applyRootPublicInvocation(
  context: RootOperationContext,
  value: unknown,
): Promise<PublicInvocationResult> {
  const parsed = parseRootPublicInvocation(value);
  if (parsed.kind === "public_invocation_refusal") return parsed;
  const invocation = parsed;
  const rawRequest = rawAdmission<RootPublicInvocation>(
    invocation,
    "public_operation_request",
    invocation.operationId === "abg.operation.run.invoke"
      ? "contract://abiogenesis/public/run-invoke-request@5"
      : `contract://abiogenesis/public/${invocation.operationId}@5`,
  );
  try {
    switch (invocation.operationId) {
      case "abg.operation.product.verify":
        return await applyVerify(invocation);
      case "abg.operation.product.resolve":
        return await applyResolve(invocation);
      case "abg.operation.product.install":
        return await applyInstall(context, invocation);
      case "abg.operation.workspace.bind":
        return await applyWorkspaceBind(context, invocation);
      case "abg.operation.catalog.admit":
        return await applyCatalogAdmit(context, invocation);
      case "abg.operation.catalog.apply":
        return await applyCatalogApplication(context, invocation);
      case "abg.operation.catalog.view":
        return await applyCatalogView(context, invocation);
      case "abg.operation.project.read":
        return await applyProjectRead(context, invocation);
      case "abg.operation.interaction.respond":
        return await applyInteractionRespond(context, invocation);
      case "abg.operation.run.continue":
        return await applyRunContinue(context, invocation);
      case "abg.operation.run.invoke":
        return await applyRunInvoke(context, invocation, rawRequest);
    }
  } catch (error) {
    if (error instanceof ApplicationRefusal) {
      return refusalOutcome(invocation, error.code, error.message, {
        ...(error.priorAdmission === null
          ? {}
          : { priorAdmission: error.priorAdmission }),
      });
    }
    return refusalOutcome(invocation, "owner_refusal", String(error));
  }
}
