// Implements: T-223 DS-1 M04 installed catalog SDK runtime operations
// Implements: REQ-P-CATALOG, REQ-P-PUBLIC-CONTRACTS

import { join } from "node:path";

import {
  admitBoundWorkspaceCatalog,
  deriveRegistrySessionView,
  type AdmittedRuntimeCatalogBasis,
  type RegistrySessionEntry,
  type RegistrySessionView
} from "../../../abg/m03/contracts/runtime_catalog.js";
import {
  assertCanonicalRuntimeEventSequence
} from "../../../abg/m03/contracts/event_admission.js";
import {
  sortReplayByAdmissionOrdinalFailClosed
} from "../../../abg/m03/contracts/admission_hygiene.js";
import {
  admitWorkspaceRuntimeEventBytes,
  admitFhInteractionResume,
  admitCatalogGraphFunctionInput,
  assembleCatalogInvocation,
  admitPublicOperationAttribution,
  invokeAdmittedCatalogGraphFunction,
  projectRuntimePublicReplay,
  projectRuntimePublicResult,
  submitFhInteractionResponse,
  FhInteractionAdmissionError,
  type FhPublicOperationId,
  type AdmittedWorkspaceReplay
} from "../../../abg/m03/runner/index.js";
import {
  stableJson,
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  admitPublicCatalogDescription,
  admitPublicCatalogRow,
  admitPublicSessionCatalogView,
  resolvePublicOperationContract
} from "./carrier_admission.js";
import {
  admitHostInvocationDescriptor,
  admitPublicOperationInvocationEnvelope
} from "./operation_admission.js";
import type {
  AbiogenesisPublicSdk,
  AnyPublicOperationInvocationEnvelope,
  BoundWorkspaceContext,
  CatalogAdmitRefusal,
  CatalogAdmitResult,
  CatalogAllowRefusal,
  CatalogAllowResult,
  CatalogDescribeRefusal,
  CatalogDescribeResult,
  CatalogInvokeRefusal,
  CatalogInvokeResult,
  CatalogListRefusal,
  CatalogListResult,
  FhInteractionRefusal,
  FhInteractionResult,
  PublicCatalogDescription,
  PublicCatalogRow,
  PublicContractCatalog,
  PublicOperationId,
  PublicOperationInvocationEnvelope,
  PublicResultProjection,
  PublicSessionCatalogView,
  ReadReplayRefusal,
  ReadReplayResult,
  ReadResultRefusal,
  ReadResultResult,
  RunResumeRefusal,
  RunResumeResult
} from "./carriers.js";
import {
  assertBoundCatalogContext as admitBoundContext,
  assertBoundRuntimeCatalogStateContract as assertStateContractCatalog,
  buildBoundRuntimeCatalogState as buildBoundCatalogState,
  BoundCatalogFailure,
  rehydrateBoundRuntimeCatalogStateBasis as rehydrateBasis,
  requireBoundCatalogRecord as requireRecord,
  type BoundRuntimeCatalogState as BoundCatalogState
} from "../public_contracts/private_runtime_catalog_authority.js";

function refusal<K extends PublicOperationId, C extends string>(input: {
  readonly operationId: K;
  readonly code: C;
  readonly message: string;
  readonly residualRefs?: readonly string[];
  readonly provenanceRefs?: readonly string[];
}) {
  return Object.freeze({
    kind: "refused" as const,
    operationId: input.operationId,
    code: input.code,
    message: input.message,
    residualRefs: Object.freeze([...(input.residualRefs ?? [])]),
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "refused" as const
  });
}

function accepted<K extends PublicOperationId, D extends string, V>(input: {
  readonly operationId: K;
  readonly disposition: D;
  readonly value: V;
  readonly provenanceRefs?: readonly string[];
}) {
  return Object.freeze({
    kind: "accepted" as const,
    operationId: input.operationId,
    disposition: input.disposition,
    value: input.value,
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "accepted_terminal" as const
  });
}

function acceptedNonTerminal<K extends PublicOperationId, D extends string, V>(input: {
  readonly operationId: K;
  readonly disposition: D;
  readonly value: V;
  readonly provenanceRefs?: readonly string[];
}) {
  return Object.freeze({
    kind: "accepted" as const,
    operationId: input.operationId,
    disposition: input.disposition,
    value: input.value,
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "accepted_non_terminal" as const
  });
}

async function readAdmittedReplay(
  context: BoundWorkspaceContext
): Promise<AdmittedWorkspaceReplay> {
  return admitWorkspaceRuntimeEventBytes(
    await context.effects.readRuntimeEventBytes()
  );
}

function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.admit"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.list">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.list"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.list">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.describe"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.allow"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.invoke"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.fh.select">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.fh.select"
): PublicOperationInvocationEnvelope<"abg.operation.fh.select">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.fh.approve">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.fh.approve"
): PublicOperationInvocationEnvelope<"abg.operation.fh.approve">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.fh.reject">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.fh.reject"
): PublicOperationInvocationEnvelope<"abg.operation.fh.reject">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.fh.assess">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.fh.assess"
): PublicOperationInvocationEnvelope<"abg.operation.fh.assess">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.fh.answer-escalation">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.fh.answer-escalation"
): PublicOperationInvocationEnvelope<"abg.operation.fh.answer-escalation">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.run.resume">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.run.resume"
): PublicOperationInvocationEnvelope<"abg.operation.run.resume">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.read.result">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.read.result"
): PublicOperationInvocationEnvelope<"abg.operation.read.result">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.read.replay">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.read.replay"
): PublicOperationInvocationEnvelope<"abg.operation.read.replay">;
function admittedEnvelope<K extends PublicOperationId>(
  input: PublicOperationInvocationEnvelope<K>,
  catalog: PublicContractCatalog,
  operationId: K
): PublicOperationInvocationEnvelope<K>;
function admittedEnvelope(
  input: unknown,
  catalog: PublicContractCatalog,
  operationId: PublicOperationId
): AnyPublicOperationInvocationEnvelope {
  const envelope = admitPublicOperationInvocationEnvelope(
    input,
    resolvePublicOperationContract(catalog, operationId)
  );
  if (envelope.operationId !== operationId) {
    throw new BoundCatalogFailure(
      "binding_mismatch",
      `expected ${operationId} invocation`
    );
  }
  return envelope;
}

function publicRow(input: {
  readonly state: BoundCatalogState;
  readonly entry: RegistrySessionEntry;
  readonly sessionVisible: boolean;
}): PublicCatalogRow {
  const sourceRow = input.state.rowsByHandle.get(input.entry.entryRef);
  if (sourceRow === undefined) {
    throw new BoundCatalogFailure(
      "catalog_stale",
      `runtime entry ${input.entry.entryRef} has no bound contribution row`
    );
  }
  const locator = sourceRow.row.locator;
  return admitPublicCatalogRow({
    canonicalHandle: sourceRow.row.canonicalHandle,
    runtimeEntryRef: input.entry.entryRef,
    kind: sourceRow.row.publicKind,
    ownerProductId: sourceRow.source.binding.productId,
    ownerVersion: sourceRow.source.binding.version,
    descriptorId: sourceRow.source.binding.descriptorId,
    contributionId: sourceRow.source.contribution.contributionId,
    artifactDigest: sourceRow.source.binding.artifactDigest,
    resolvedLockId: input.state.batch.resolvedLockRef,
    compatible: sourceRow.source.binding.compatibility.compatible,
    ready: input.entry.ready,
    readinessBlockers: input.entry.ready ? [] : ["readiness_unsatisfied"],
    eligible: input.entry.ready && input.sessionVisible,
    callable: input.entry.callable,
    sessionVisible: input.sessionVisible,
    contractRef: sourceRow.row.contractRef,
    schemaRefs:
      locator.kind === "opaque_overlay_asset"
        ? [locator.schemaId, locator.schemaDigest]
        : ["abg.schema.gtl-module", locator.moduleDigest],
    provenanceRefs: [
      ...new Set([
        ...sourceRow.row.provenanceRefs,
        ...input.entry.sourceEventRefs
      ])
    ]
  });
}

function publicDescription(input: {
  readonly state: BoundCatalogState;
  readonly entry: RegistrySessionEntry;
}): PublicCatalogDescription {
  const row = publicRow({ state: input.state, entry: input.entry, sessionVisible: true });
  const sourceRow = input.state.rowsByHandle.get(input.entry.entryRef);
  if (sourceRow === undefined) {
    throw new BoundCatalogFailure("catalog_stale", "catalog source row disappeared");
  }
  return admitPublicCatalogDescription({
    ...row,
    declarationRef: sourceRow.row.declarationRef,
    interfaceRef: sourceRow.row.interfaceRef,
    dependencyRefs: [
      ...sourceRow.row.compatibility.requiredProductRefs,
      ...sourceRow.row.compatibility.requiredContractRefs,
      ...sourceRow.row.compatibility.requiredCapabilityRefs
    ],
    policyRefs: sourceRow.row.policyRefs,
    capabilityRefs: sourceRow.row.capabilityRefs,
    proofRefs: sourceRow.row.proofRefs
  });
}

function publicSessionView(input: {
  readonly state: BoundCatalogState;
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly view: RegistrySessionView;
}): PublicSessionCatalogView {
  const rows = input.view.entries.map((entry) =>
    publicRow({ state: input.state, entry, sessionVisible: true })
  );
  return admitPublicSessionCatalogView({
    kind: "public_session_catalog_view",
    workspaceId: input.basis.workspaceId,
    catalogId: input.state.catalogId,
    catalogVersion: input.state.catalogVersion,
    catalogDigest: input.state.catalogDigest,
    runtimeCatalogProjectionRef: input.basis.runtimeCatalogProjectionRef,
    effectiveSessionViewId: input.view.sessionViewRef,
    allowedHandles: rows.map((row) => row.canonicalHandle),
    allowedEntryRefs: input.view.allowedEntryRefs,
    rows
  });
}

function derivePublicSession(input: {
  readonly state: BoundCatalogState;
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly allowedHandles: readonly string[] | null;
  readonly suppliedView: PublicSessionCatalogView | null;
}): PublicSessionCatalogView {
  const allowedEntryRefs =
    input.suppliedView !== null
      ? input.suppliedView.allowedEntryRefs
      : input.allowedHandles === null
        ? undefined
        : input.allowedHandles.map((handle) =>
            input.state.rowsByHandle.has(handle) ? handle : handle
          );
  const derived = deriveRegistrySessionView({
    basis: input.basis,
    ...(allowedEntryRefs === undefined ? {} : { allowedEntryRefs })
  });
  if (!derived.accepted || derived.view === null) {
    const residual = derived.residuals[0];
    throw new BoundCatalogFailure(
      residual?.reason ?? "catalog_stale",
      residual === undefined
        ? "session view could not be derived"
        : `${residual.reason}: ${residual.entryRef}`
    );
  }
  const view = publicSessionView({
    state: input.state,
    basis: input.basis,
    view: derived.view
  });
  if (input.suppliedView !== null && !stableJsonEquals(view, input.suppliedView)) {
    throw new BoundCatalogFailure(
      "view_mismatch",
      "supplied public session view does not match current replay truth"
    );
  }
  return view;
}

function stateIdentityMatches(input: {
  readonly context: BoundWorkspaceContext;
  readonly state: BoundCatalogState;
  readonly workspaceId: string;
  readonly catalogId?: string | undefined;
  readonly bindingId?: string | undefined;
  readonly resolvedLockId?: string | undefined;
}): boolean {
  return (
    input.workspaceId === input.context.binding.workspaceId &&
    (input.catalogId === undefined || input.catalogId === input.state.catalogId) &&
    (input.bindingId === undefined || input.bindingId === input.context.binding.bindingId) &&
    (input.resolvedLockId === undefined ||
      input.resolvedLockId === input.context.binding.resolvedLockId)
  );
}

export async function catalogAdmit(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">
): Promise<CatalogAdmitResult | CatalogAdmitRefusal> {
  admitBoundContext(context);
  const admittedInvocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.admit"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      admittedInvocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    const request = admittedInvocation.request;
    if (
      !stateIdentityMatches({
        context,
        state,
        workspaceId: request.workspaceId,
        bindingId: request.bindingId,
        resolvedLockId: request.resolvedLockId
      }) ||
      request.productSetDigest !== context.binding.productSetDigest
    ) {
      return refusal({
        operationId: "abg.operation.catalog.admit",
        code: "binding_mismatch",
        message: "catalog admission request does not match the bound workspace"
      });
    }
    const replay = await readAdmittedReplay(context);
    if (admittedInvocation.actorRef === null) {
      throw new BoundCatalogFailure(
        "binding_mismatch",
        "catalog admission requires actor attribution"
      );
    }
    const eventSink = context.effects.createRuntimeEventSink();
    const attributionEvent = admitPublicOperationAttribution({
      operationId: "abg.operation.catalog.admit",
      invocationId: admittedInvocation.invocationId,
      requestId: admittedInvocation.requestId,
      actorRef: admittedInvocation.actorRef,
      workspaceId: context.binding.workspaceId,
      bindingId: context.binding.bindingId,
      catalogId: state.catalogId,
      capabilityProvenanceRefs: Object.freeze([]),
      causationEventRefs: Object.freeze([]),
      correlationId: admittedInvocation.correlationId,
      priorEvents: replay.orderedEvents,
      eventSink
    });
    const result = admitBoundWorkspaceCatalog(
      Object.freeze({
        ...state.batch,
        causationEventRefs: Object.freeze([attributionEvent.eventId])
      }),
      eventSink,
      Object.freeze([...replay.orderedEvents, attributionEvent])
    );
    const rows = result.rowDispositions.map((row) => Object.freeze({
      canonicalHandle: row.entryRef,
      disposition:
        row.disposition === "rejected" ? ("rejected" as const) : ("admitted" as const),
      reason: row.rejectionReason,
      eventRefs: Object.freeze(row.eventRef === null ? [] : [row.eventRef])
    }));
    if (!result.accepted || result.basis === null) {
      return refusal({
        operationId: "abg.operation.catalog.admit",
        code: "required_row_rejected",
        message: "one or more required catalog rows were rejected",
        residualRefs: result.rejectedDeclarationRefs
      });
    }
    return accepted({
      operationId: "abg.operation.catalog.admit",
      disposition: "admitted",
      value: Object.freeze({
        catalogId: state.catalogId,
        catalogVersion: state.catalogVersion,
        catalogDigest: state.catalogDigest,
        rows: Object.freeze(rows)
      }),
      provenanceRefs: [
        ...(admittedInvocation.actorRef === null
          ? []
          : [admittedInvocation.actorRef]),
        ...admittedInvocation.provenanceRefs,
        attributionEvent.eventId,
        ...result.admissionEvents.map((event) => event.eventId)
      ]
    });
  } catch (error: unknown) {
    const failure = error instanceof BoundCatalogFailure ? error : null;
    const code =
      failure?.code === "unbound"
        ? "unbound"
        : failure?.code === "binding_mismatch"
          ? "binding_mismatch"
          : failure?.code === "product_conflict"
            ? "product_conflict"
            : failure?.code === "malformed_declaration"
              ? "malformed_declaration"
              : "lock_mismatch";
    return refusal({
      operationId: "abg.operation.catalog.admit",
      code,
      message: error instanceof Error ? error.message : "catalog admission failed"
    });
  }
}

export async function catalogList(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.list">
): Promise<CatalogListResult | CatalogListRefusal> {
  admitBoundContext(context);
  const admittedInvocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.list"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      admittedInvocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    if (!stateIdentityMatches({
      context,
      state,
      workspaceId: admittedInvocation.request.workspaceId,
      catalogId: admittedInvocation.request.catalogId
    })) {
      throw new BoundCatalogFailure("catalog_missing", "catalog identity is not bound");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, priorEvents: replay.orderedEvents });
    const view = derivePublicSession({
      state,
      basis,
      allowedHandles: admittedInvocation.request.allowedHandles,
      suppliedView: admittedInvocation.request.sessionView
    });
    return accepted({
      operationId: "abg.operation.catalog.list",
      disposition: "listed",
      value: Object.freeze(
        view.rows.filter((row) =>
          admittedInvocation.request.kinds.includes(row.kind)
        )
      ),
      provenanceRefs: [basis.runtimeCatalogProjectionRef]
    });
  } catch (error: unknown) {
    const code =
      error instanceof BoundCatalogFailure && error.code === "catalog_missing"
        ? "catalog_missing"
        : error instanceof BoundCatalogFailure && error.code === "view_mismatch"
          ? "view_mismatch"
          : "catalog_stale";
    return refusal({
      operationId: "abg.operation.catalog.list",
      code,
      message: error instanceof Error ? error.message : "catalog list failed"
    });
  }
}

export async function catalogDescribe(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">
): Promise<CatalogDescribeResult | CatalogDescribeRefusal> {
  admitBoundContext(context);
  const admittedInvocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.describe"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      admittedInvocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    if (!stateIdentityMatches({
      context,
      state,
      workspaceId: admittedInvocation.request.workspaceId,
      catalogId: admittedInvocation.request.catalogId
    })) {
      throw new BoundCatalogFailure("catalog_missing", "catalog identity is not bound");
    }
    if (!state.rowsByHandle.has(admittedInvocation.request.handle)) {
      throw new BoundCatalogFailure("unknown_handle", "catalog handle is unknown");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, priorEvents: replay.orderedEvents });
    const view = derivePublicSession({
      state,
      basis,
      allowedHandles: admittedInvocation.request.allowedHandles,
      suppliedView: admittedInvocation.request.sessionView
    });
    const row = view.rows.find(
      (candidate) =>
        candidate.canonicalHandle === admittedInvocation.request.handle
    );
    if (row === undefined) {
      throw new BoundCatalogFailure("hidden_by_view", "catalog handle is hidden by the effective view");
    }
    const sessionEntry = deriveRegistrySessionView({
      basis,
      allowedEntryRefs: [row.runtimeEntryRef]
    }).view?.entries[0];
    if (sessionEntry === undefined) {
      throw new BoundCatalogFailure("stale", "catalog description basis is stale");
    }
    return accepted({
      operationId: "abg.operation.catalog.describe",
      disposition: "described",
      value: publicDescription({ state, entry: sessionEntry }),
      provenanceRefs: [basis.runtimeCatalogProjectionRef]
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "stale";
    const code =
      known === "catalog_missing" ||
      known === "unknown_handle" ||
      known === "hidden_by_view"
        ? known
        : "stale";
    return refusal({
      operationId: "abg.operation.catalog.describe",
      code,
      message: error instanceof Error ? error.message : "catalog describe failed"
    });
  }
}

export async function catalogAllow(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">
): Promise<CatalogAllowResult | CatalogAllowRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.allow"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      invocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    if (!stateIdentityMatches({
      context,
      state,
      workspaceId: invocation.request.workspaceId,
      catalogId: invocation.request.catalogId
    })) {
      throw new BoundCatalogFailure("unknown_handle", "catalog identity is not bound");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, priorEvents: replay.orderedEvents });
    const view = derivePublicSession({
      state,
      basis,
      allowedHandles: invocation.request.handles,
      suppliedView: null
    });
    return accepted({
      operationId: "abg.operation.catalog.allow",
      disposition: "allowed",
      value: view,
      provenanceRefs: [basis.runtimeCatalogProjectionRef]
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "inadmissible";
    const code =
      known === "duplicate_handle" ||
      known === "unknown_handle" ||
      known === "unready"
        ? known
        : "inadmissible";
    return refusal({
      operationId: "abg.operation.catalog.allow",
      code,
      message: error instanceof Error ? error.message : "catalog allow failed"
    });
  }
}

function publicResult(
  value: ReturnType<typeof projectRuntimePublicResult>
): PublicResultProjection {
  if (value === null) {
    throw new BoundCatalogFailure("unknown_identity", "runtime result is unknown");
  }
  return Object.freeze({ ...value });
}

function catalogInvokeRefusalCode(
  input: string
): CatalogInvokeRefusal["code"] {
  switch (input) {
    case "catalog_stale":
    case "view_mismatch":
    case "disallowed":
    case "non_callable":
    case "unready":
    case "interface_mismatch":
    case "input_invalid":
    case "missing_capability":
    case "preflight_failure":
    case "runtime_refused":
      return input;
    default:
      return "runtime_refused";
  }
}

export async function catalogInvoke(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">
): Promise<CatalogInvokeResult | CatalogInvokeRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.invoke"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      invocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    const request = invocation.request;
    if (
      !stateIdentityMatches({
        context,
        state,
        workspaceId: request.workspaceId,
        catalogId: request.catalogId,
        bindingId: request.bindingId,
        resolvedLockId: request.resolvedLockId
      }) ||
      request.catalogVersion !== state.catalogVersion ||
      request.catalogDigest !== state.catalogDigest
    ) {
      throw new BoundCatalogFailure("catalog_stale", "catalog invoke request identity is stale");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, priorEvents: replay.orderedEvents });
    const session = derivePublicSession({
      state,
      basis,
      allowedHandles: request.allowedHandles,
      suppliedView: request.sessionView
    });
    if (!session.allowedHandles.includes(request.graphFunctionHandle)) {
      throw new BoundCatalogFailure(
        "disallowed",
        "selected GraphFunction is outside the effective session view"
      );
    }
    const hostSchema = state.abg.manifest.publicContractCatalog.rows.find(
      (row) => row.contractId === "abg.schema.host-invocation"
    );
    if (hostSchema === undefined) {
      throw new BoundCatalogFailure(
        "catalog_stale",
        "bound ABG product has no host-invocation schema contract"
      );
    }
    const descriptorInput = Object.freeze({
      ...invocation,
      contractCatalogVersion:
        state.abg.manifest.publicContractCatalog.catalogVersion,
      contractCatalogDigest:
        state.abg.manifest.publicContractCatalog.catalogDigest,
      workspaceId: request.workspaceId,
      workspaceManifestDigest: context.binding.workspaceManifestDigest,
      productSetDigest: context.binding.productSetDigest,
      productBindingRefs: context.binding.productBindingRefs,
      bindingId: request.bindingId,
      resolvedLockId: request.resolvedLockId,
      catalogId: request.catalogId,
      catalogVersion: request.catalogVersion,
      catalogDigest: request.catalogDigest,
      runtimeCatalogProjectionRef: session.runtimeCatalogProjectionRef,
      effectiveSessionViewId: session.effectiveSessionViewId,
      allowedHandles: session.allowedHandles,
      allowedEntryRefs: session.allowedEntryRefs,
      graphFunctionHandle: request.graphFunctionHandle,
      interfaceRef: request.interfaceRef,
      inputId: request.inputId,
      inputSchemaId: request.inputSchemaId,
      inputSchemaVersion: request.inputSchemaVersion,
      inputSchemaDigest: request.inputSchemaDigest,
      requiredCapabilityRefs: request.requiredCapabilityRefs,
      transportSteering: request.transportSteering,
      mode: "invoke",
      scope: "graph_function",
      target: request.graphFunctionHandle,
      until: "converged",
      ...(request.inputRef === undefined
        ? { input: request.input }
        : { inputRef: request.inputRef })
    });
    const descriptor = admitHostInvocationDescriptor(
      descriptorInput,
      resolvePublicOperationContract(
        context.publicContractCatalog,
        "abg.operation.catalog.invoke"
      ),
      hostSchema
    );
    const profile = state.abg.manifest.runtimeSystemProfile;
    if (profile === null) {
      throw new BoundCatalogFailure("runtime_refused", "ABG runtime profile is absent");
    }
    const selectedRow = state.rowsByHandle.get(descriptor.graphFunctionHandle);
    if (selectedRow === undefined) {
      throw new BoundCatalogFailure("disallowed", "selected catalog handle is unresolved");
    }
    const selectedPublicRow = session.rows.find(
      (row) => row.canonicalHandle === descriptor.graphFunctionHandle
    );
    if (selectedPublicRow === undefined) {
      throw new BoundCatalogFailure(
        "disallowed",
        "selected GraphFunction is outside the effective session view"
      );
    }
    if (!selectedPublicRow.callable) {
      throw new BoundCatalogFailure(
        "non_callable",
        "only an admitted GraphFunction contribution may be invoked"
      );
    }
    if (selectedRow.row.interfaceRef !== descriptor.interfaceRef) {
      throw new BoundCatalogFailure(
        "interface_mismatch",
        "requested interface does not match admitted catalog truth"
      );
    }
    const undeclaredCapabilityRefs = selectedRow.row.capabilityRefs.filter(
      (ref) => !descriptor.requiredCapabilityRefs.includes(ref)
    );
    if (undeclaredCapabilityRefs.length > 0) {
      throw new BoundCatalogFailure(
        "missing_capability",
        `invoke omits contribution-required capabilities: ${undeclaredCapabilityRefs.join(",")}`
      );
    }
    const inputContract = selectedRow.source.manifest.publicContractCatalog.rows.find(
      (row) => row.contractId === selectedRow.row.contractRef
    );
    if (
      inputContract?.assetLocator === null ||
      inputContract?.assetLocator === undefined ||
      inputContract.assetLocator.schemaId !== descriptor.inputSchemaId ||
      inputContract.assetLocator.schemaVersion !== descriptor.inputSchemaVersion ||
      inputContract.assetLocator.digest !== descriptor.inputSchemaDigest
    ) {
      throw new BoundCatalogFailure(
        "input_invalid",
        "input schema identity does not match the selected contribution contract"
      );
    }
    const inputSchema = await requireRecord(
      context,
      join(
        selectedRow.source.binding.productRoot,
        inputContract.assetLocator.relativePath
      ),
      `input schema for ${descriptor.graphFunctionHandle}`
    );
    if (stableSha256Digest(inputSchema) !== descriptor.inputSchemaDigest) {
      throw new BoundCatalogFailure(
        "input_invalid",
        "installed input schema content does not match its bound digest"
      );
    }
    const inputValue = "input" in descriptor
      ? descriptor.input
      : await context.effects.readInputAsset(descriptor.inputRef);
    if (inputValue === null) {
      throw new BoundCatalogFailure(
        "input_invalid",
        `input reference is unreadable: ${descriptor.inputRef}`
      );
    }
    const inputAdmission = admitCatalogGraphFunctionInput({
      schema: inputSchema,
      value: inputValue
    });
    if (!inputAdmission.accepted) {
      throw new BoundCatalogFailure(
        "input_invalid",
        `catalog input admission failed: ${inputAdmission.issues
          .map((issue) => `${issue.instancePath || "/"} ${issue.message}`)
          .join("; ")}`
      );
    }
    let pluginCapabilities;
    let availableLivePluginRefs: readonly string[] = Object.freeze([]);
    let capabilityProvenanceRefs: readonly string[] = Object.freeze([]);
    if (descriptor.requiredCapabilityRefs.length > 0) {
      if (descriptor.transportSteering === null) {
        throw new BoundCatalogFailure(
          "missing_capability",
          "requested live capabilities require declared transport steering"
        );
      }
      const factories = descriptor.requiredCapabilityRefs.map((ref) => {
        const factory = context.effects.operatorCapabilityFactories[ref];
        if (factory === undefined) {
          throw new BoundCatalogFailure(
            "missing_capability",
            `operator capability factory is unavailable for ${ref}`
          );
        }
        return factory;
      });
      const steering = descriptor.transportSteering;
      if (steering === null) {
        throw new BoundCatalogFailure(
          "missing_capability",
          "capability factories require admitted transport steering"
        );
      }
      let bindings;
      try {
        bindings = factories.map((factory) => factory({
          workspaceRoot: context.workspaceManifest.root,
          archiveRoot: context.binding.mutableStateRoots.archiveRoot,
          steering
        }));
      } catch (error: unknown) {
        throw new BoundCatalogFailure(
          "preflight_failure",
          `operator capability preflight failed: ${
            error instanceof Error ? error.message : "capability construction failed"
          }`
        );
      }
      const first = bindings[0];
      if (
        first === undefined ||
        bindings.some((binding) =>
          !stableJsonEquals(binding.projection, first.projection)
        )
      ) {
        throw new BoundCatalogFailure(
          "preflight_failure",
          "requested capability refs do not resolve to one execution-equivalent binding"
        );
      }
      pluginCapabilities = first.pluginCapabilities;
      availableLivePluginRefs = first.projection.availableLivePluginRefs;
      capabilityProvenanceRefs = Object.freeze([
        first.projection.capabilityRef,
        first.projection.capabilityDigest,
        first.projection.executionContractDigest
      ]);
    }
    const foreignPluginRefs = availableLivePluginRefs.filter(
      (ref) => !profile.standardPluginRefs.includes(ref)
    );
    if (foreignPluginRefs.length > 0) {
      throw new BoundCatalogFailure(
        "preflight_failure",
        `live capability exposes plugin refs outside the bound ABG profile: ${foreignPluginRefs.join(",")}`
      );
    }
    const inputUri =
      `data:application/json;charset=utf-8,${encodeURIComponent(stableJson(inputValue))}`;
    const runtimeSession = deriveRegistrySessionView({
      basis,
      allowedEntryRefs: session.allowedEntryRefs
    });
    if (!runtimeSession.accepted || runtimeSession.view === null) {
      throw new BoundCatalogFailure(
        "view_mismatch",
        "public session view cannot be reconstructed as M03 session truth"
      );
    }
    const assemblyResult = assembleCatalogInvocation({
      basis,
      sessionView: runtimeSession.view,
      entryRef: descriptor.graphFunctionHandle,
      interfaceRef: descriptor.interfaceRef,
      workspaceRoot: context.workspaceManifest.root,
      inputBinding: Object.freeze({
        assetRef: descriptor.inputId,
        assetType: descriptor.inputSchemaId,
        uri: inputUri
      }),
      inputSchema,
      inputValue,
      until: descriptor.until,
      runtimeIdentity: profile.runtimeIdentity,
      resolvedPolicy: profile.resolvedPolicy,
      runtimeEvents: replay.orderedEvents,
      eventSink: context.effects.createRuntimeEventSink(),
      ...(pluginCapabilities === undefined ? {} : { pluginCapabilities }),
      standardPluginRefs: profile.standardPluginRefs,
      capabilityProvenanceRefs,
      actorRef: descriptor.actorRef,
      invocationId: descriptor.invocationId,
      requestId: descriptor.requestId,
      correlationId: descriptor.correlationId
    });
    if (!assemblyResult.accepted) {
      return refusal({
        operationId: "abg.operation.catalog.invoke",
        code: catalogInvokeRefusalCode(assemblyResult.code),
        message: assemblyResult.message
      });
    }
    const runtimeInvocation = await invokeAdmittedCatalogGraphFunction(
      assemblyResult.assembly
    );
    if (!runtimeInvocation.accepted) {
      return refusal({
        operationId: "abg.operation.catalog.invoke",
        code: runtimeInvocation.code,
        message: runtimeInvocation.message
      });
    }
    const combinedReplay = Object.freeze(
      sortReplayByAdmissionOrdinalFailClosed(
        [
      ...replay.orderedEvents,
      runtimeInvocation.attributionEvent,
      runtimeInvocation.selectionEvent,
      ...runtimeInvocation.engineResult.emittedEvents
        ],
        "CatalogInvoke.combinedReplay"
      )
    );
    assertCanonicalRuntimeEventSequence(
      combinedReplay,
      "CatalogInvoke.combinedReplay"
    );
    const graphCall = runtimeInvocation.engineResult.emittedEvents.find(
      (event) => event.kind === "graph_call_opened"
    );
    if (graphCall?.kind !== "graph_call_opened") {
      throw new BoundCatalogFailure("runtime_refused", "runtime emitted no GraphCall truth");
    }
    const projection = projectRuntimePublicResult({
      replay: Object.freeze({
        kind: "admitted_workspace_replay",
        orderedEvents: combinedReplay
      }),
      graphCallId: graphCall.graphCallId
    });
    const value = publicResult(projection);
    if (value.disposition === "converged") {
      return Object.freeze({
        kind: "accepted",
        operationId: "abg.operation.catalog.invoke",
        disposition: "converged",
        value,
        provenanceRefs: [
          descriptor.actorRef,
          ...capabilityProvenanceRefs,
          runtimeInvocation.attributionEvent.eventId,
          ...value.replayRefs
        ],
        exitClassification: "accepted_terminal"
      });
    }
    return Object.freeze({
      kind: "accepted",
      operationId: "abg.operation.catalog.invoke",
      disposition: value.disposition,
      value,
      provenanceRefs: [
        descriptor.actorRef,
        ...capabilityProvenanceRefs,
        runtimeInvocation.attributionEvent.eventId,
        ...value.replayRefs
      ],
      exitClassification: "accepted_non_terminal"
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "runtime_refused";
    return refusal({
      operationId: "abg.operation.catalog.invoke",
      code: catalogInvokeRefusalCode(known),
      message: error instanceof Error ? error.message : "catalog invoke failed"
    });
  }
}

async function boundOperationState(
  context: BoundWorkspaceContext,
  correlationId: string
): Promise<BoundCatalogState> {
  const state = await buildBoundCatalogState(context, correlationId, Object.freeze([]));
  assertStateContractCatalog(context, state);
  return state;
}

function fhResponseRefusalCode(
  error: unknown
): FhInteractionRefusal<FhPublicOperationId>["code"] {
  if (error instanceof BoundCatalogFailure) {
    return error.code === "workspace_mismatch" ? "workspace_mismatch" : "stale_basis";
  }
  if (error instanceof FhInteractionAdmissionError) {
    switch (error.code) {
      case "unknown_interaction":
      case "ambiguous_interaction":
      case "stale_basis":
      case "interaction_not_pending":
      case "operation_not_declared":
      case "choice_not_declared":
      case "response_contract_mismatch":
      case "capability_mismatch":
      case "capability_provenance_missing":
      case "evidence_missing":
      case "replay_invalid":
        return error.code;
      case "response_mismatch":
      case "continuation_mismatch":
      case "response_not_resume_eligible":
        return "replay_invalid";
    }
  }
  return "replay_invalid";
}

async function submitPublicFhResponse<K extends FhPublicOperationId>(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<K>,
  operationId: K
): Promise<FhInteractionResult<K> | FhInteractionRefusal<K>> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    operationId
  );
  try {
    if (invocation.request.workspaceId !== context.binding.workspaceId) {
      throw new BoundCatalogFailure(
        "workspace_mismatch",
        "F_H response workspace differs from the bound workspace"
      );
    }
    if (invocation.actorRef === null) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "F_H response requires an admitted actor"
      );
    }
    const replay = await readAdmittedReplay(context);
    const mutation = submitFhInteractionResponse({
      interactionRef: invocation.request.interactionRef,
      interactionBasisDigest: invocation.request.interactionBasisDigest,
      operationId,
      invocationId: invocation.invocationId,
      requestId: invocation.requestId,
      actorRef: invocation.actorRef,
      responseContractRef: invocation.request.responseContractRef,
      choiceRef: invocation.request.choiceRef,
      value: invocation.request.value,
      evidenceRefs: invocation.request.evidenceRefs,
      capabilityRefs: invocation.request.capabilityRefs,
      capabilityProvenanceRefs: invocation.request.capabilityProvenanceRefs,
      correlationId: invocation.correlationId,
      priorEvents: replay.orderedEvents,
      eventSink: context.effects.createRuntimeEventSink()
    });
    return acceptedNonTerminal({
      operationId,
      disposition: mutation.projection.status === "held" ? "held" : "responded",
      value: mutation.projection,
      provenanceRefs: mutation.projection.replayRefs
    });
  } catch (error: unknown) {
    return refusal({
      operationId,
      code: fhResponseRefusalCode(error),
      message: error instanceof Error ? error.message : "F_H response admission failed"
    });
  }
}

export async function fhSelect(
  context: BoundWorkspaceContext,
  invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.select">
) {
  return submitPublicFhResponse(context, invocation, "abg.operation.fh.select");
}

export async function fhApprove(
  context: BoundWorkspaceContext,
  invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.approve">
) {
  return submitPublicFhResponse(context, invocation, "abg.operation.fh.approve");
}

export async function fhReject(
  context: BoundWorkspaceContext,
  invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.reject">
) {
  return submitPublicFhResponse(context, invocation, "abg.operation.fh.reject");
}

export async function fhAssess(
  context: BoundWorkspaceContext,
  invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.assess">
) {
  return submitPublicFhResponse(context, invocation, "abg.operation.fh.assess");
}

export async function fhAnswerEscalation(
  context: BoundWorkspaceContext,
  invocation: PublicOperationInvocationEnvelope<"abg.operation.fh.answer-escalation">
) {
  return submitPublicFhResponse(
    context,
    invocation,
    "abg.operation.fh.answer-escalation"
  );
}

function runResumeRefusalCode(error: unknown): RunResumeRefusal["code"] {
  if (error instanceof BoundCatalogFailure) {
    return error.code === "workspace_mismatch" ? "workspace_mismatch" : "stale_basis";
  }
  if (error instanceof FhInteractionAdmissionError) {
    switch (error.code) {
      case "unknown_interaction":
      case "ambiguous_interaction":
      case "stale_basis":
      case "interaction_not_pending":
      case "response_mismatch":
      case "continuation_mismatch":
      case "response_not_resume_eligible":
      case "replay_invalid":
        return error.code;
      case "operation_not_declared":
      case "choice_not_declared":
      case "response_contract_mismatch":
      case "capability_mismatch":
      case "capability_provenance_missing":
      case "evidence_missing":
        return "replay_invalid";
    }
  }
  return "replay_invalid";
}

export async function runResume(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.run.resume">
): Promise<RunResumeResult | RunResumeRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.run.resume"
  );
  try {
    if (invocation.request.workspaceId !== context.binding.workspaceId) {
      throw new BoundCatalogFailure(
        "workspace_mismatch",
        "resume workspace differs from the bound workspace"
      );
    }
    if (invocation.actorRef === null) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "run.resume requires an admitted actor"
      );
    }
    const replay = await readAdmittedReplay(context);
    const mutation = admitFhInteractionResume({
      interactionRef: invocation.request.interactionRef,
      interactionBasisDigest: invocation.request.interactionBasisDigest,
      responseRef: invocation.request.responseRef,
      continuationRef: invocation.request.continuationRef,
      invocationId: invocation.invocationId,
      requestId: invocation.requestId,
      actorRef: invocation.actorRef,
      correlationId: invocation.correlationId,
      priorEvents: replay.orderedEvents,
      eventSink: context.effects.createRuntimeEventSink()
    });
    return acceptedNonTerminal({
      operationId: "abg.operation.run.resume",
      disposition: "resume_admitted",
      value: mutation.projection,
      provenanceRefs: mutation.projection.replayRefs
    });
  } catch (error: unknown) {
    return refusal({
      operationId: "abg.operation.run.resume",
      code: runResumeRefusalCode(error),
      message: error instanceof Error ? error.message : "resume admission failed"
    });
  }
}

export async function readResult(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.read.result">
): Promise<ReadResultResult | ReadResultRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.read.result"
  );
  try {
    await boundOperationState(
      context,
      invocation.correlationId
    );
    if (invocation.request.workspaceId !== context.binding.workspaceId) {
      throw new BoundCatalogFailure("stale_basis", "result request workspace is stale");
    }
    const replay = await readAdmittedReplay(context);
    const value = publicResult(projectRuntimePublicResult({
      replay,
      ...(invocation.request.resultId === undefined
        ? { graphCallId: invocation.request.graphCallId }
        : { resultId: invocation.request.resultId })
    }));
    return accepted({
      operationId: "abg.operation.read.result",
      disposition: "projected",
      value,
      provenanceRefs: value.replayRefs
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "malformed_replay";
    const code =
      known === "unknown_identity" || known === "stale_basis"
        ? known
        : error instanceof TypeError && /ambiguous/u.test(error.message)
          ? "ambiguous_identity"
          : "malformed_replay";
    return refusal({
      operationId: "abg.operation.read.result",
      code,
      message: error instanceof Error ? error.message : "result projection failed"
    });
  }
}

export async function readReplay(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.read.replay">
): Promise<ReadReplayResult | ReadReplayRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.read.replay"
  );
  try {
    await boundOperationState(
      context,
      invocation.correlationId
    );
    if (invocation.request.workspaceId !== context.binding.workspaceId) {
      throw new BoundCatalogFailure("stale_basis", "replay request workspace is stale");
    }
    if (
      invocation.request.subject.kind === "workspace" &&
      invocation.request.subject.workspaceId !== context.binding.workspaceId
    ) {
      throw new BoundCatalogFailure("unknown_identity", "replay workspace subject is unknown");
    }
    const replay = await readAdmittedReplay(context);
    const value = projectRuntimePublicReplay({
      replay,
      subject: invocation.request.subject,
      fromOrdinal: invocation.request.fromOrdinal,
      limit: invocation.request.limit
    });
    if (value === null) {
      throw new BoundCatalogFailure("unknown_identity", "replay subject is unknown");
    }
    return accepted({
      operationId: "abg.operation.read.replay",
      disposition: "projected",
      value: Object.freeze({ ...value }),
      provenanceRefs: value.events.flatMap((event) => {
        if (
          typeof event === "object" &&
          event !== null &&
          !Array.isArray(event)
        ) {
          const record: Readonly<Record<string, unknown>> = Object.fromEntries(
            Object.entries(event)
          );
          return typeof record["eventId"] === "string"
            ? [record["eventId"]]
            : [];
        }
        return [];
      })
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "corrupt_event";
    const code =
      known === "unknown_identity" || known === "stale_basis"
        ? known
        : error instanceof TypeError && /ordinal.*collision/u.test(error.message)
          ? "ordinal_collision"
          : "corrupt_event";
    return refusal({
      operationId: "abg.operation.read.replay",
      code,
      message: error instanceof Error ? error.message : "replay projection failed"
    });
  }
}

export type BoundRuntimeSdkMethods = Pick<
  AbiogenesisPublicSdk,
  | "catalogAdmit"
  | "catalogList"
  | "catalogDescribe"
  | "catalogAllow"
  | "catalogInvoke"
  | "fhSelect"
  | "fhApprove"
  | "fhReject"
  | "fhAssess"
  | "fhAnswerEscalation"
  | "runResume"
  | "readResult"
  | "readReplay"
>;
