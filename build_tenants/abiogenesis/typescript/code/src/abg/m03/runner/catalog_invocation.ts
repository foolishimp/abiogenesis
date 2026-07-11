// Implements: T-223 DS-1 M03 catalog invocation ingress
// Implements: REQ-P-CATALOG-009..012, REQ-P-CATALOG-024..025

import type {
  CanonicalRuntimeEvent,
  StartInputAssetBinding
} from "../contracts/carriers.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding,
  RegistrySessionGraphFunctionEntry,
  RegistrySessionView
} from "../contracts/runtime_catalog.js";
import { deriveRegistrySessionView } from "../contracts/runtime_catalog.js";
import {
  constructRegistryLookupRequest,
  lookupRuntimeGraphFunctionRegistry,
  selectGraphFunctionFromRegistry
} from "../contracts/runtime_graph_function_registry.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
  type RuntimeEventSink
} from "../events/emit.js";
import type { EnginePluginCapabilities } from "./standard_live_plugins.js";
import {
  runEngineStartAsync,
  type EngineIterateResult,
  type EngineStartRequest
} from "./engine_runner.js";
import {
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import { admitCatalogGraphFunctionInput } from "./catalog_input_admission.js";
import { admitPublicOperationAttribution } from "./public_operation_admission.js";

export type CatalogGraphFunctionInvocationRefusalCode =
  | "catalog_stale"
  | "view_mismatch"
  | "disallowed"
  | "non_callable"
  | "unready"
  | "interface_mismatch"
  | "input_invalid"
  | "runtime_refused";

export interface CatalogInvocationAssemblyInput {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly sessionView: RegistrySessionView;
  readonly entryRef: string;
  readonly interfaceRef: string;
  readonly workspaceRoot: string;
  readonly inputBinding: StartInputAssetBinding;
  readonly inputSchema: IJsonValue;
  readonly inputValue: IJsonValue;
  readonly until: "first_traversal" | "blocked" | "converged";
  readonly runtimeIdentity: {
    readonly workerId: string;
    readonly backendId: string;
    readonly buildId: string;
    readonly resolvedRuntimeRef: string;
  };
  readonly resolvedPolicy: {
    readonly resolvedPolicyBundleRef: string;
    readonly defaultRegime: "F_D" | "F_P" | "F_H";
    readonly dispatchRef: string | null;
    readonly approvalSubjectRef: string | null;
  };
  readonly runtimeEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
  readonly pluginCapabilities?: EnginePluginCapabilities | undefined;
  readonly standardPluginRefs: readonly string[];
  readonly capabilityProvenanceRefs: readonly string[];
  readonly actorRef: string;
  readonly invocationId: string;
  readonly requestId: string;
  readonly correlationId: string;
}

export interface CatalogInvocationAssembly {
  readonly kind: "catalog_invocation_assembly";
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly sessionView: RegistrySessionView;
  readonly executionBinding: CatalogExecutionBinding;
  readonly entryRef: string;
  readonly interfaceRef: string;
  readonly actorRef: string;
  readonly standardPluginRefs: readonly string[];
  readonly capabilityProvenanceRefs: readonly string[];
  readonly invocationId: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly runtimeEvents: readonly CanonicalRuntimeEvent[];
  readonly engineStartRequest: EngineStartRequest;
}

export interface CatalogInvocationAssemblyAccepted {
  readonly kind: "catalog_invocation_assembly_accepted";
  readonly accepted: true;
  readonly assembly: CatalogInvocationAssembly;
}

export type CatalogInvocationAssemblyResult =
  | CatalogInvocationAssemblyAccepted
  | CatalogGraphFunctionInvocationRefused;

export interface CatalogGraphFunctionInvocationAccepted {
      readonly kind: "catalog_graph_function_invocation_accepted";
      readonly accepted: true;
      readonly executionBinding: CatalogExecutionBinding;
      readonly attributionEvent: CanonicalRuntimeEvent;
      readonly selectionEvent: CanonicalRuntimeEvent;
      readonly engineResult: EngineIterateResult;
}

export interface CatalogGraphFunctionInvocationRefused {
      readonly kind: "catalog_graph_function_invocation_refused";
      readonly accepted: false;
      readonly code: CatalogGraphFunctionInvocationRefusalCode;
      readonly message: string;
}

export type CatalogGraphFunctionInvocationResult =
  | CatalogGraphFunctionInvocationAccepted
  | CatalogGraphFunctionInvocationRefused;

function refused(
  code: CatalogGraphFunctionInvocationRefusalCode,
  message: string
): CatalogGraphFunctionInvocationRefused {
  return Object.freeze({
    kind: "catalog_graph_function_invocation_refused",
    accepted: false,
    code,
    message
  });
}

function coherentBasis(basis: AdmittedRuntimeCatalogBasis): boolean {
  return (
    basis.runtimeCatalogProjectionRef === basis.projection.projectionRef &&
    basis.runtimeRegistryProjectionRef ===
      basis.projection.runtimeRegistryProjection.projectionRef &&
    basis.workspaceId === basis.projection.workspaceId &&
    basis.bindingId === basis.projection.bindingId &&
    basis.catalogId === basis.projection.catalogId
  );
}

function selectedSessionEntry(input: {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly sessionView: RegistrySessionView;
  readonly entryRef: string;
}): RegistrySessionGraphFunctionEntry | CatalogGraphFunctionInvocationRefused {
  if (!coherentBasis(input.basis)) {
    return refused("catalog_stale", "runtime catalog basis is incoherent");
  }
  if (
    input.sessionView.catalogId !== input.basis.catalogId ||
    input.sessionView.catalogProjectionRef !==
      input.basis.runtimeCatalogProjectionRef
  ) {
    return refused("view_mismatch", "session view does not belong to the admitted catalog basis");
  }
  if (!input.sessionView.allowedEntryRefs.includes(input.entryRef)) {
    return refused("disallowed", "graph function is absent from the effective session view");
  }
  const entry = input.sessionView.entries.find(
    (candidate) => candidate.entryRef === input.entryRef
  );
  if (entry === undefined) {
    return refused("disallowed", "graph function is absent from the effective session entries");
  }
  if (entry.entryKind !== "graph_function" || !entry.callable) {
    return refused("non_callable", "only graph_function catalog entries are callable");
  }
  if (!entry.ready) {
    return refused("unready", "graph function catalog entry is not ready");
  }
  return entry;
}

export function assembleCatalogInvocation(
  input: CatalogInvocationAssemblyInput
): CatalogInvocationAssemblyResult {
  const derivedView = deriveRegistrySessionView({
    basis: input.basis,
    allowedEntryRefs: input.sessionView.allowedEntryRefs
  });
  if (
    !derivedView.accepted ||
    derivedView.view === null ||
    !stableJsonEquals(derivedView.view, input.sessionView)
  ) {
    return refused(
      "view_mismatch",
      "session view is not the exact narrowing of the admitted catalog basis"
    );
  }
  const sessionEntry = selectedSessionEntry({
    basis: input.basis,
    sessionView: derivedView.view,
    entryRef: input.entryRef
  });
  if (sessionEntry.kind === "catalog_graph_function_invocation_refused") {
    return sessionEntry;
  }
  if (sessionEntry.interfaceRef !== input.interfaceRef) {
    return refused("interface_mismatch", "requested interface does not match admitted catalog truth");
  }
  const executionBindings = input.basis.executionBindings.filter(
    (candidate) =>
      candidate.entryRef === input.entryRef &&
      candidate.graphFunctionHandle === sessionEntry.graphFunctionRef
  );
  const executionBinding = executionBindings[0];
  if (executionBindings.length !== 1 || executionBinding === undefined) {
    return refused("non_callable", "graph function has no admitted execution binding");
  }
  if (
    executionBinding.moduleName !== executionBinding.module.name ||
    executionBinding.moduleDigest !== stableSha256Digest(executionBinding.module) ||
    executionBinding.graphFunctionDigest !==
      stableSha256Digest(executionBinding.graphFunction)
  ) {
    return refused(
      "catalog_stale",
      "catalog execution binding content does not match its admitted identities"
    );
  }
  const inputAdmission = admitCatalogGraphFunctionInput({
    schema: input.inputSchema,
    value: input.inputValue
  });
  if (!inputAdmission.accepted) {
    return refused(
      "input_invalid",
      `catalog input admission failed: ${inputAdmission.issues
        .map((issue) => `${issue.instancePath || "/"} ${issue.message}`)
        .join("; ")}`
    );
  }
  if (input.actorRef.trim().length === 0) {
    return refused("runtime_refused", "catalog invocation requires actor attribution");
  }
  const startIntent = Object.freeze({
    scope: Object.freeze({
      kind: "workspace" as const,
      workspaceRoot: input.workspaceRoot,
      moduleName: executionBinding.moduleName
    }),
    target: Object.freeze({
      kind: "graph_function" as const,
      handle: executionBinding.graphFunctionHandle
    }),
    until: input.until,
    inputBindings: Object.freeze([input.inputBinding])
  });
  const engineStartRequest: EngineStartRequest = Object.freeze({
    startIntent,
    module: executionBinding.module,
    runtimeIdentity: input.runtimeIdentity,
    resolvedPolicy: input.resolvedPolicy,
    runtimeEvents: Object.freeze([...input.runtimeEvents]),
    eventSink: input.eventSink,
    runtimeCatalogBasis: input.basis,
    ...(input.pluginCapabilities === undefined
      ? {}
      : { pluginCapabilities: input.pluginCapabilities })
  });
  return Object.freeze({
    kind: "catalog_invocation_assembly_accepted",
    accepted: true,
    assembly: Object.freeze({
      kind: "catalog_invocation_assembly",
      basis: input.basis,
      sessionView: derivedView.view,
      executionBinding,
      entryRef: input.entryRef,
      interfaceRef: input.interfaceRef,
      actorRef: input.actorRef,
      standardPluginRefs: Object.freeze([...input.standardPluginRefs]),
      capabilityProvenanceRefs: Object.freeze([
        ...input.capabilityProvenanceRefs
      ]),
      invocationId: input.invocationId,
      requestId: input.requestId,
      correlationId: input.correlationId,
      runtimeEvents: Object.freeze([...input.runtimeEvents]),
      engineStartRequest
    })
  });
}

export async function invokeAdmittedCatalogGraphFunction(
  assembly: CatalogInvocationAssembly
): Promise<CatalogGraphFunctionInvocationResult> {
  if (assembly.kind !== "catalog_invocation_assembly") {
    return refused("runtime_refused", "M03 catalog invocation assembly is invalid");
  }

  const priorEvents = assembly.runtimeEvents;
  const attributionEvent = admitPublicOperationAttribution({
    operationId: "abg.operation.catalog.invoke",
    invocationId: assembly.invocationId,
    requestId: assembly.requestId,
    actorRef: assembly.actorRef,
    workspaceId: assembly.basis.workspaceId,
    bindingId: assembly.basis.bindingId,
    catalogId: assembly.basis.catalogId,
    capabilityProvenanceRefs: assembly.capabilityProvenanceRefs,
    causationEventRefs: assembly.basis.admissionEventRefs,
    correlationId: assembly.correlationId,
    priorEvents,
    eventSink: assembly.engineStartRequest.eventSink
  });
  const attributedEvents = Object.freeze([...priorEvents, attributionEvent]);

  const lookupRequest = constructRegistryLookupRequest({
    lookupRef: `registry-lookup:catalog-invoke:${assembly.correlationId}`,
    entryKinds: ["graph_function"],
    candidateIdentityRefs: [assembly.entryRef],
    interfaceRef: assembly.interfaceRef,
    contextRefs: [],
    authorityRefs: [],
    overlayRefs: [],
    namespaceRefs: [],
    acceptedVersions: [],
    provenanceRefs: [],
    readinessRefs: [],
    proofRefs: [],
    policyRefs: []
  });
  const lookupResult = lookupRuntimeGraphFunctionRegistry({
    projection: assembly.basis.projection.runtimeRegistryProjection,
    request: lookupRequest
  });
  const selection = selectGraphFunctionFromRegistry({
    lookupResult,
    projection: assembly.basis.projection.runtimeRegistryProjection,
    selectionRef: `graph-function-selection:catalog-invoke:${assembly.correlationId}`,
    runtimeBasisRef: assembly.basis.basisRef,
    rationaleRef: "rationale://abg/catalog-invoke/exact-handle",
    abgSelectedCandidateRef: assembly.entryRef,
    causationEventRefs: Object.freeze([attributionEvent.eventId]),
    correlationId: assembly.correlationId
  });
  if (selection.kind !== "graph_function_selected") {
    return refused(
      "runtime_refused",
      `M03 graph-function selection refused: ${selection.rejectionReason}`
    );
  }

  const canonicalSelection = emitWithContext(
    createSeededLiveEmitterContext(attributedEvents),
    selection,
    assembly.engineStartRequest.eventSink
  )[0];
  if (canonicalSelection === undefined) {
    return refused("runtime_refused", "M03 selection emitted no canonical event");
  }

  try {
    const engineResult = await runEngineStartAsync({
      ...assembly.engineStartRequest,
      runtimeEvents: Object.freeze([...attributedEvents, canonicalSelection])
    });
    if (
      engineResult.emittedEvents.some(
        (event) =>
          event.kind === "registry_entry_admitted" ||
          event.kind === "registry_entry_rejected"
      )
    ) {
      return refused(
        "runtime_refused",
        "catalog invocation attempted runtime registry startup re-admission"
      );
    }
    return Object.freeze({
      kind: "catalog_graph_function_invocation_accepted",
      accepted: true,
      executionBinding: assembly.executionBinding,
      attributionEvent,
      selectionEvent: canonicalSelection,
      engineResult
    });
  } catch (error: unknown) {
    return refused(
      "runtime_refused",
      error instanceof Error ? error.message : "catalog invocation failed"
    );
  }
}
