import * as Effect from "effect/Effect";
import * as v from "valibot";
import { join } from "node:path";

import {
  projectRunTruthAtDurablePrefix,
  validateDurablePrefixCoordinate,
  validateExactPrefixArtifactTruthProjection,
  type DurablePrefixCoordinate,
  type ExactPrefixArtifactTruthProjection,
} from "../abg/index.js";
import { GraphCallProjectionPort as AbgGraphCallProjectionPort } from
  "../abg/project_read_ports.js";
import {
  hasAdmittedProductInstall,
  hasAdmittedWorkspaceBinding,
  projectAdmittedProductInstall,
  projectAdmittedProductInstallByAdmissionEventRef,
  projectAdmittedWorkspaceBinding,
  projectAdmittedWorkspaceBindingByInvocationRef,
  projectAdmittedWorkspaceProductInstall,
} from "../abg/environment_admission.js";
import { compareUnicodeCodeUnits } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import {
  definitionFault,
  exactDefinitionCallMatches,
  hasExactKeys,
  isRecord,
  reference,
  sameCoordinate,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import {
  admitDefinitionExecutionFault,
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
  type PreDefinitionExecutionFault,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OwnerSemanticOutput } from
  "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { bindStaticOwner } from
  "../shared/static_definition_bindings.js";
import { ABI5_SYSTEM_PRODUCT_SEMANTICS } from "./builtin_semantics.js";
import type {
  GraphFunctionCatalogView,
  ReadyGraphFunctionCatalog,
} from "./catalog.js";
import { CatalogOperationPort } from "./catalog_operations.js";
import {
  isWorkspaceAuthorityBasis,
  productInstallCoordinate,
} from "./environment.js";
import { PRODUCT_PROJECT_READ_CONTRACTS } from
  "./project_read_operation_contracts.js";
import {
  CatalogProjectionPort,
  ConsensusProjectionPort,
  InstallProjectionPort,
  WorkspaceProjectionPort,
  type CatalogDescribeProjectReadPacket,
  type CatalogListProjectReadPacket,
  type InstallEvidenceProjectReadPacket,
  type ProductProjectReadRefusal,
  type ReleaseEvidenceProjectReadPacket,
  type TicketConsensusProjectReadPacket,
  type WorkspaceStatusProjectReadPacket,
} from "./project_read_ports.js";
import {
  reconstructWorkspaceManifest,
  type WorkspaceManifest,
} from "./workspace_operations.js";

type ProjectReadPacket =
  | CatalogListProjectReadPacket
  | CatalogDescribeProjectReadPacket
  | WorkspaceStatusProjectReadPacket
  | InstallEvidenceProjectReadPacket
  | ReleaseEvidenceProjectReadPacket
  | TicketConsensusProjectReadPacket;

type ProjectReadContract =
  (typeof PRODUCT_PROJECT_READ_CONTRACTS)[keyof typeof PRODUCT_PROJECT_READ_CONTRACTS];

export interface ProductProjectReadResourceAssertion<
  TPacket extends ProjectReadPacket = ProjectReadPacket,
> {
  readonly kind: "product_project_read_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly packet: TPacket;
  readonly artifactTruth?: ExactPrefixArtifactTruthProjection;
  readonly workspaceManifest?: WorkspaceManifest;
  readonly runtime?: Readonly<{
    readonly prefix: DurablePrefixCoordinate;
    readonly runId: string;
    readonly graphCallId: string;
  }>;
}

function fault<TContract extends ProjectReadContract>(
  call: DefinitionCall<TContract, unknown>,
  code: string,
  message: string,
): PreDefinitionExecutionFault<TContract["definitionKey"]> {
  return definitionFault(
    call.invocation.definitionKey,
    "resource_admission",
    code,
    message,
  );
}

function validResources<TPacket extends ProjectReadPacket>(
  value: unknown,
  additionalKeys: readonly (
    "artifactTruth" | "runtime" | "workspaceManifest"
  )[] = [],
): value is ProductProjectReadResourceAssertion<TPacket> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "packet", "schemaVersion", ...additionalKeys]) &&
    value.kind === "product_project_read_resource_assertion" &&
    value.schemaVersion === "5.0.0" &&
    isRecord(value.packet) &&
    sameJson(value, value);
}

const CATALOG_LIST_RESOURCE_SCHEMA = v.custom<
  ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>
>(
  (candidate) => validResources<CatalogListProjectReadPacket>(candidate, [
    "artifactTruth",
  ]) &&
    candidate.packet.memberKey === "catalog_list" &&
    validateExactPrefixArtifactTruthProjection(candidate.artifactTruth),
  "catalog_list_project_read_resource",
);

const CATALOG_DESCRIBE_RESOURCE_SCHEMA = v.custom<
  ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>
>(
  (candidate) => validResources<CatalogDescribeProjectReadPacket>(candidate, [
    "artifactTruth",
  ]) &&
    candidate.packet.memberKey === "catalog_describe" &&
    validateExactPrefixArtifactTruthProjection(candidate.artifactTruth),
  "catalog_describe_project_read_resource",
);

const WORKSPACE_STATUS_RESOURCE_SCHEMA = v.custom<
  ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>
>(
  (candidate) => validResources<WorkspaceStatusProjectReadPacket>(candidate, [
    "artifactTruth",
    "workspaceManifest",
  ]) &&
    candidate.packet.memberKey === "workspace_status" &&
    validateExactPrefixArtifactTruthProjection(candidate.artifactTruth) &&
    reconstructWorkspaceManifest(candidate.workspaceManifest) !== null,
  "workspace_status_project_read_resource",
);

const INSTALL_EVIDENCE_RESOURCE_SCHEMA = v.custom<
  ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>
>(
  (candidate) => validResources<InstallEvidenceProjectReadPacket>(candidate, [
    "artifactTruth",
  ]) &&
    candidate.packet.memberKey === "install_evidence" &&
    validateExactPrefixArtifactTruthProjection(candidate.artifactTruth),
  "install_evidence_project_read_resource",
);

const TICKET_CONSENSUS_RESOURCE_SCHEMA = v.custom<
  ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>
>(
  (candidate) => validResources<TicketConsensusProjectReadPacket>(candidate, [
    "artifactTruth",
    "runtime",
  ]) &&
    candidate.packet.memberKey === "ticket_consensus" &&
    validateExactPrefixArtifactTruthProjection(candidate.artifactTruth) &&
    isRecord(candidate.runtime) &&
    hasExactKeys(candidate.runtime, ["graphCallId", "prefix", "runId"]) &&
    typeof candidate.runtime.runId === "string" &&
    candidate.runtime.runId.length > 0 &&
    typeof candidate.runtime.graphCallId === "string" &&
    candidate.runtime.graphCallId.length > 0 &&
    validateDurablePrefixCoordinate(candidate.runtime.prefix),
  "ticket_consensus_project_read_resource",
);

function admittedProjectReadFault<
  TContract extends ProjectReadContract,
  TPacket extends ProjectReadPacket,
>(
  cause: unknown,
  call: DefinitionCall<
    TContract,
    ProductProjectReadResourceAssertion<TPacket>
  >,
  additionalKeys: readonly (
    "artifactTruth" | "runtime" | "workspaceManifest"
  )[],
): DefinitionExecutionFault<
  TContract["definitionKey"],
  ProductProjectReadResourceAssertion<TPacket>
> | null {
  return admitDefinitionExecutionFault(
    cause,
    call.invocation.definitionKey,
    (candidate) =>
      validResources<TPacket>(candidate, additionalKeys) &&
        sameJson(candidate, call.resources)
        ? { resourceReceipt: candidate }
        : null,
  );
}

function baseRelationMatches<TContract extends ProjectReadContract>(
  call: DefinitionCall<TContract, ProductProjectReadResourceAssertion>,
): boolean {
  const request = call.invocation.request;
  const packet = call.resources.packet;
  return request.caseKey === packet.memberKey &&
    request.source.sourceRef === packet.sourceRef &&
    request.source.sourceDigest === packet.sourceDigest &&
    request.projectionBasis.projectionBasisRef ===
      packet.projectionBasis.basisRef &&
    request.projectionBasis.projectionBasisDigest ===
      packet.projectionBasis.basisDigest;
}

function nativeRefusal<TContract extends ProjectReadContract>(
  contract: TContract,
  refusal: ProductProjectReadRefusal,
): OwnerSemanticOutput<TContract> {
  return validatedOwnerOutput(contract, {
    outcomeKind: "refusal",
    value: {
      code: refusal.code,
      issuePaths: ["/source"],
      evidenceRefs: [],
    },
  } as OwnerSemanticOutput<TContract>, "Product project read");
}

function commonResult<TContract extends ProjectReadContract>(
  call: DefinitionCall<TContract, ProductProjectReadResourceAssertion>,
  contract: TContract,
  projection: unknown,
): OwnerSemanticOutput<TContract> {
  const request = call.invocation.request;
  return validatedOwnerOutput(contract, {
    outcomeKind: "result",
    value: {
      caseKey: request.caseKey,
      source: reference(
        request.source.sourceRef,
        request.source.sourceDigest,
      ),
      projectionBasis: reference(
        request.projectionBasis.projectionBasisRef,
        request.projectionBasis.projectionBasisDigest,
      ),
      projection,
    },
  } as OwnerSemanticOutput<TContract>, "Product project read");
}

function exactCoordinateSet(
  actual: unknown,
  expected: readonly ReferenceDigest[],
): boolean {
  return Array.isArray(actual) && actual.length === expected.length &&
    actual.every((coordinate, index) =>
      isRecord(coordinate) &&
      sameCoordinate(coordinate as unknown as ReferenceDigest, expected[index]!)
    );
}

function authoritySlots(
  call: Readonly<{ readonly invocation: unknown }>,
): Readonly<Record<string, unknown>> | null {
  if (!isRecord(call.invocation) ||
    !isRecord(call.invocation.invocationAuthority) ||
    !isRecord(call.invocation.invocationAuthority.slots)) return null;
  return call.invocation.invocationAuthority.slots;
}

function bindingAuthorityMatches(
  call: Readonly<{ readonly invocation: unknown }>,
  binding: ReferenceDigest,
  products: readonly ReferenceDigest[],
  lock: ReferenceDigest,
): boolean {
  const slots = authoritySlots(call);
  if (slots === null) return false;
  return isRecord(slots.workspace_binding) &&
    sameCoordinate(
      slots.workspace_binding as unknown as ReferenceDigest,
      binding,
    ) &&
    exactCoordinateSet(slots.product_set, products) &&
    isRecord(slots.dependency_lock) &&
    sameCoordinate(
      slots.dependency_lock as unknown as ReferenceDigest,
      lock,
    );
}

function admittedAuthorityBinding(
  call: Readonly<{ readonly invocation: unknown }>,
  artifactTruth: ExactPrefixArtifactTruthProjection,
): Readonly<{ readonly bindingId: string; readonly canonicalRoot: string }> | null {
  const slots = authoritySlots(call);
  if (slots === null) return null;
  if (
    !isRecord(slots.workspace_binding) ||
    !isRecord(slots.dependency_lock) ||
    !Array.isArray(slots.product_set)
  ) return null;
  const workspaceCoordinate =
    slots.workspace_binding as unknown as ReferenceDigest;
  const lockCoordinate = slots.dependency_lock as unknown as ReferenceDigest;
  const bindingRow = artifactTruth.rows.find((row) =>
    row.operationId === "abg.operation.workspace.bind" &&
    row.artifactRef === workspaceCoordinate.ref &&
    row.artifactDigest === workspaceCoordinate.digest
  );
  if (bindingRow === undefined || !isWorkspaceAuthorityBasis(
    bindingRow.workspaceAuthorityBasis,
  )) return null;
  const installs = bindingRow.causationEventRefs.map((eventRef) =>
    projectAdmittedProductInstallByAdmissionEventRef(artifactTruth, eventRef)
  );
  if (installs.length === 0 || installs.some((install) => install === null)) {
    return null;
  }
  const lock = installs[0]!.resolvedLock;
  if (
    installs.some((install) => !sameJson(install!.resolvedLock, lock)) ||
    !sameCoordinate(lockCoordinate, {
      ref: lock.lockId,
      digest: lock.lockDigest,
    }) ||
    !exactCoordinateSet(
      slots.product_set,
      installs.map((install) => productInstallCoordinate(install!.install)),
    )
  ) return null;
  const binding = projectAdmittedWorkspaceBindingByInvocationRef(
    artifactTruth,
    bindingRow.invocationRef,
    lock,
  );
  return binding === null ||
      binding.binding.bindingId !== workspaceCoordinate.ref ||
      binding.binding.bindingDigest !== workspaceCoordinate.digest
    ? null
    : deepFreeze({
      bindingId: binding.binding.bindingId,
      canonicalRoot: bindingRow.workspaceAuthorityBasis.canonicalRoot,
    });
}

function reconstructCatalogSelection(
  packet: CatalogListProjectReadPacket | CatalogDescribeProjectReadPacket,
): Readonly<{
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly view: GraphFunctionCatalogView | null;
}> | null {
  const candidate = packet.catalog;
  if (!("readinessBasis" in candidate) ||
    !isRecord(candidate.readinessBasis)) return null;
  const readyCandidate = candidate as ReadyGraphFunctionCatalog;
  const reconstructed = CatalogOperationPort.admit({
    kind: "catalog_admit_packet",
    schemaVersion: "5.0.0",
    memberKey: "admit",
    readinessBasis: readyCandidate.readinessBasis,
  });
  if (reconstructed.kind !== "graph_function_catalog" ||
    !sameJson(reconstructed, readyCandidate)) return null;
  if (packet.selector.visibility.kind === "workspace_catalog") {
    return deepFreeze({ catalog: reconstructed, view: null });
  }
  const candidateView = packet.selector.visibility.view;
  const reconstructedView = CatalogOperationPort.constructView({
    kind: "catalog_view_packet",
    schemaVersion: "5.0.0",
    memberKey: "allowlist",
    catalog: reconstructed,
    allowlist: candidateView.allowlist,
  });
  return reconstructedView.kind === "graph_function_catalog_view" &&
      sameJson(reconstructedView, candidateView)
    ? deepFreeze({ catalog: reconstructed, view: reconstructedView })
    : null;
}

function catalogEnvironmentMatches(
  catalog: ReadyGraphFunctionCatalog,
  artifactTruth: ExactPrefixArtifactTruthProjection,
): boolean {
  const basis = catalog.readinessBasis;
  const binding = projectAdmittedWorkspaceBinding(
    artifactTruth,
    basis.workspaceBinding,
  );
  if (
    binding === null ||
    basis.installedProducts.length === 0 ||
    catalog.workspaceBindingId !== binding.bindingId ||
    catalog.workspaceBindingDigest !== binding.bindingDigest ||
    catalog.productSetId !== binding.productSetId ||
    catalog.productSetDigest !== binding.productSetDigest ||
    catalog.lockId !== basis.resolvedLock.lockId ||
    catalog.lockDigest !== basis.resolvedLock.lockDigest ||
    binding.lockId !== basis.resolvedLock.lockId ||
    binding.lockDigest !== basis.resolvedLock.lockDigest
  ) return false;
  return basis.installedProducts.every((candidate) => {
    const admitted = projectAdmittedProductInstall(artifactTruth, candidate);
    const bound = projectAdmittedWorkspaceProductInstall(
      artifactTruth,
      binding.bindingId,
      candidate.installId,
    );
    return admitted !== null && bound !== null &&
      sameJson(admitted, bound.install) &&
      sameJson(bound.resolvedLock, basis.resolvedLock);
  });
}

function catalogAuthorityMatches(
  call: Readonly<{ readonly invocation: unknown }>,
  packet: CatalogListProjectReadPacket | CatalogDescribeProjectReadPacket,
  catalog: ReadyGraphFunctionCatalog,
  view: GraphFunctionCatalogView | null,
): boolean {
  const catalogCoordinate = reference(
    `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice("sha256:".length)}`,
    catalog.basisDigest,
  );
  if (!sameCoordinate({
    ref: packet.sourceRef,
    digest: packet.sourceDigest,
  }, catalogCoordinate)) return false;
  const products = catalog.readinessBasis.installedProducts.map((install) =>
    reference(install.installId, sha256Canonical(install as never))
  );
  if (!bindingAuthorityMatches(
    call,
    reference(
      catalog.workspaceBindingId,
      catalog.workspaceBindingDigest,
    ),
    products,
    reference(catalog.lockId, catalog.lockDigest),
  )) return false;
  const slots = authoritySlots(call);
  if (slots === null) return false;
  const scope = slots.catalog_scope;
  if (packet.selector.visibility.kind === "workspace_catalog") {
    return isRecord(scope) &&
      hasExactKeys(scope, ["digest", "ref"]) &&
      sameCoordinate(scope as unknown as ReferenceDigest, catalogCoordinate);
  }
  const request = isRecord(call.invocation) && isRecord(call.invocation.request)
    ? call.invocation.request
    : null;
  const selector = request !== null && isRecord(request.selector)
    ? request.selector
    : null;
  const visibility = selector !== null && isRecord(selector.visibility)
    ? selector.visibility
    : null;
  const viewCoordinate = request?.caseKey === "catalog_list"
    ? visibility?.kind === "session_view" && isRecord(visibility.view)
      ? visibility.view as unknown as ReferenceDigest
      : null
    : selector !== null && isRecord(selector.visibilityBasis)
    ? selector.visibilityBasis as unknown as ReferenceDigest
    : null;
  if (view === null) return false;
  const ownerViewCoordinate = reference(
    `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`,
    view.viewDigest,
  );
  return viewCoordinate !== null && isRecord(scope) &&
    isRecord(scope.catalog) && isRecord(scope.view) &&
    sameCoordinate(
      scope.catalog as unknown as ReferenceDigest,
      catalogCoordinate,
    ) &&
    sameCoordinate(viewCoordinate, ownerViewCoordinate) &&
    sameCoordinate(scope.view as unknown as ReferenceDigest, ownerViewCoordinate) &&
    sameJson(scope.allowlist, view.allowlist);
}

function catalogListOwnerPacket(
  packet: CatalogListProjectReadPacket,
  selection: NonNullable<ReturnType<typeof reconstructCatalogSelection>>,
): CatalogListProjectReadPacket {
  return deepFreeze({
    ...packet,
    catalog: selection.catalog,
    selector: packet.selector.visibility.kind === "workspace_catalog"
      ? packet.selector
      : {
        ...packet.selector,
        visibility: {
          kind: "session_view" as const,
          view: selection.view!,
        },
      },
  });
}

function catalogDescribeOwnerPacket(
  packet: CatalogDescribeProjectReadPacket,
  selection: NonNullable<ReturnType<typeof reconstructCatalogSelection>>,
): CatalogDescribeProjectReadPacket {
  return deepFreeze({
    ...packet,
    catalog: selection.catalog,
    selector: packet.selector.visibility.kind === "workspace_catalog"
      ? packet.selector
      : {
        ...packet.selector,
        visibility: {
          kind: "session_view" as const,
          view: selection.view!,
        },
      },
  });
}

function entryCoordinate(
  entry: Readonly<{ readonly handle: string; readonly entryDigest: ReferenceDigest["digest"] }>,
): ReferenceDigest {
  return reference(entry.handle, entry.entryDigest);
}

function readinessCoordinate(
  readiness: Readonly<{
    readonly handle: string;
    readonly rowDigest: ReferenceDigest["digest"];
  }> | null,
): ReferenceDigest | null {
  return readiness === null
    ? null
    : reference(readiness.handle, readiness.rowDigest);
}

function catalogViewCoordinate(
  requestSelector: Readonly<Record<string, unknown>>,
  viewDigest: ReferenceDigest["digest"] | null,
): ReferenceDigest | null {
  if (viewDigest === null) return null;
  if (
    requestSelector.kind === "catalog_list" &&
    isRecord(requestSelector.visibility) &&
    requestSelector.visibility.kind === "session_view" &&
    isRecord(requestSelector.visibility.view) &&
    typeof requestSelector.visibility.view.ref === "string"
  ) {
    return reference(requestSelector.visibility.view.ref, viewDigest);
  }
  if (
    requestSelector.kind === "catalog_describe" &&
    isRecord(requestSelector.visibilityBasis) &&
    typeof requestSelector.visibilityBasis.ref === "string"
  ) {
    return reference(requestSelector.visibilityBasis.ref, viewDigest);
  }
  return null;
}

const catalogListOwner: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_list,
  ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>,
  ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_list,
    ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>
  > => {
    if (!validResources<CatalogListProjectReadPacket>(call.resources, [
      "artifactTruth",
    ])) {
      throw fault(call, "invalid_resource_assertion", "catalog list requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const artifactTruth = call.resources.artifactTruth!;
    const request = call.invocation.request;
    if (!exactDefinitionCallMatches(
      call,
      PRODUCT_PROJECT_READ_CONTRACTS.catalog_list,
    )) {
      throw fault(call, "call_identity_mismatch", "catalog list call differs from its fixed definition, contracts, request digest, or authority topology");
    }
    const selection = reconstructCatalogSelection(packet);
    const selectorMatches = request.selector.visibility.kind ===
        packet.selector.visibility.kind &&
      (request.selector.visibility.kind === "workspace_catalog" ||
        (packet.selector.visibility.kind === "session_view" &&
          request.selector.visibility.view.ref ===
            `graph-function-catalog-view://abiogenesis/${packet.selector.visibility.view.viewDigest.slice("sha256:".length)}` &&
          request.selector.visibility.view.digest ===
            packet.selector.visibility.view.viewDigest));
    if (selection === null ||
      !catalogEnvironmentMatches(selection.catalog, artifactTruth) ||
      !baseRelationMatches(call) || !selectorMatches ||
      !catalogAuthorityMatches(
        call,
        packet,
        selection.catalog,
        selection.view,
      )) {
      throw fault(call, "resource_relation_mismatch", "catalog list packet differs from the public source, basis, or selector coordinates");
    }
    const output = CatalogProjectionPort.list(
      catalogListOwnerPacket(packet, selection),
    );
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.catalog_list, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const ownerOutput = commonResult(call, PRODUCT_PROJECT_READ_CONTRACTS.catalog_list, {
      kind: "catalog_list_projection",
      catalog: reference(packet.sourceRef, projection.catalogBasisDigest),
      visibility: projection.visibility,
      view: catalogViewCoordinate(request.selector, projection.viewDigest),
      rows: projection.rows.map((row) => ({
        handle: row.handle,
        contributionKind: row.contributionKind,
        entry: entryCoordinate(row.entry),
        readiness: readinessCoordinate(row.readiness),
      })),
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => {
    const admittedFault = admittedProjectReadFault(cause, call, [
      "artifactTruth",
    ]);
    if (admittedFault !== null) return admittedFault;
    throw cause;
  },
});

const catalogDescribeOwner: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe,
  ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>,
  ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe,
    ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>
  > => {
    if (!validResources<CatalogDescribeProjectReadPacket>(call.resources, [
      "artifactTruth",
    ])) {
      throw fault(call, "invalid_resource_assertion", "catalog describe requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const artifactTruth = call.resources.artifactTruth!;
    const request = call.invocation.request;
    if (!exactDefinitionCallMatches(
      call,
      PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe,
    )) {
      throw fault(call, "call_identity_mismatch", "catalog describe call differs from its fixed definition, contracts, request digest, or authority topology");
    }
    const selection = reconstructCatalogSelection(packet);
    const visibilityMatches = packet.selector.visibility.kind ===
      "workspace_catalog"
      ? sameCoordinate(request.selector.visibilityBasis, {
        ref: packet.sourceRef,
        digest: packet.sourceDigest,
      })
      : request.selector.visibilityBasis.digest ===
          packet.selector.visibility.view.viewDigest &&
        request.selector.visibilityBasis.ref ===
          `graph-function-catalog-view://abiogenesis/${packet.selector.visibility.view.viewDigest.slice("sha256:".length)}`;
    if (
      selection === null ||
      !catalogEnvironmentMatches(selection.catalog, artifactTruth) ||
      !baseRelationMatches(call) ||
      request.selector.handle !== packet.selector.handle ||
      !visibilityMatches ||
      !catalogAuthorityMatches(
        call,
        packet,
        selection.catalog,
        selection.view,
      )
    ) {
      throw fault(call, "resource_relation_mismatch", "catalog describe packet differs from the public source, basis, or selector coordinates");
    }
    const output = CatalogProjectionPort.describe(
      catalogDescribeOwnerPacket(packet, selection),
    );
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const ownerOutput = commonResult(call, PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe, {
      kind: "catalog_description_projection",
      catalog: reference(packet.sourceRef, projection.catalogBasisDigest),
      visibility: projection.visibility,
      view: catalogViewCoordinate(request.selector, projection.viewDigest),
      handle: projection.handle,
      contributionKind: projection.contributionKind,
      entry: entryCoordinate(projection.entry),
      readiness: readinessCoordinate(projection.readiness),
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => {
    const admittedFault = admittedProjectReadFault(cause, call, [
      "artifactTruth",
    ]);
    if (admittedFault !== null) return admittedFault;
    throw cause;
  },
});

const workspaceStatusOwner: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.workspace_status,
  ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>,
  ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.workspace_status,
    ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>
  > => {
    if (!validResources<WorkspaceStatusProjectReadPacket>(call.resources, [
      "artifactTruth",
      "workspaceManifest",
    ])) {
      throw fault(call, "invalid_resource_assertion", "workspace status requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const artifactTruth = call.resources.artifactTruth!;
    const workspaceManifest = reconstructWorkspaceManifest(
      call.resources.workspaceManifest,
    );
    if (!exactDefinitionCallMatches(
      call,
      PRODUCT_PROJECT_READ_CONTRACTS.workspace_status,
    )) {
      throw fault(call, "call_identity_mismatch", "workspace status call differs from its fixed definition, contracts, request digest, or authority topology");
    }
    const admittedProducts = packet.productSet.orderedInstallRefs.map((installId) =>
      projectAdmittedWorkspaceProductInstall(
        artifactTruth,
        packet.binding.bindingId,
        installId,
      )
    );
    const admissionRow = artifactTruth.rows.find((row) =>
      row.operationId === "abg.operation.workspace.bind" &&
      row.artifactRef === packet.binding.bindingId &&
      row.artifactDigest === packet.binding.bindingDigest &&
      row.admissionEventRef === packet.binding.admissionEventRef
    );
    const admittedEnvironmentAuthority = admissionRow !== undefined &&
        isWorkspaceAuthorityBasis(admissionRow.workspaceAuthorityBasis)
      ? admissionRow.workspaceAuthorityBasis
      : null;
    if (
      !baseRelationMatches(call) ||
      !sameJson(call.invocation.request.selector, packet.selector) ||
      !hasAdmittedWorkspaceBinding(artifactTruth, packet.binding) ||
      admittedProducts.some((product) => product === null) ||
      admissionRow === undefined ||
      workspaceManifest === null ||
      admittedEnvironmentAuthority === null ||
      workspaceManifest.workspaceRef !== packet.binding.workspaceId ||
      workspaceManifest.canonicalRoot !==
        admittedEnvironmentAuthority.canonicalRoot ||
      packet.binding.authorityBasisId !==
        admittedEnvironmentAuthority.authorityBasisId ||
      packet.binding.authorityBasisDigest !==
        admittedEnvironmentAuthority.authorityBasisDigest ||
      packet.binding.authorizedActorRef !==
        admittedEnvironmentAuthority.authorizedActorRef ||
      !bindingAuthorityMatches(
        call as DefinitionCall<ProjectReadContract, unknown>,
        reference(packet.binding.bindingId, packet.binding.bindingDigest),
        admittedProducts.map((product) =>
          productInstallCoordinate(product!.install)
        ),
        reference(packet.resolvedLock.lockId, packet.resolvedLock.lockDigest),
      )
    ) {
      throw fault(call, "resource_relation_mismatch", "workspace status packet differs from the public source, basis, or selector coordinates");
    }
    const output = WorkspaceProjectionPort.status(packet);
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.workspace_status, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const roots = Object.entries(projection.roots)
      .sort(([left], [right]) => compareUnicodeCodeUnits(left, right))
      .map(([rootKind, path]) => reference(
        path,
        sha256Canonical({ rootKind, path }),
      ));
    const ownerOutput = commonResult(call, PRODUCT_PROJECT_READ_CONTRACTS.workspace_status, {
      kind: "workspace_status_projection",
      workspace: reference(
        workspaceManifest.workspaceRef,
        workspaceManifest.workspaceDigest,
      ),
      workspaceAuthority: reference(
        projection.workspaceAuthorityRef,
        projection.workspaceAuthorityDigest,
      ),
      binding: reference(projection.bindingRef, projection.bindingDigest),
      productSet: reference(projection.productSetRef, projection.productSetDigest),
      resolvedLock: reference(
        projection.resolvedLockRef,
        projection.resolvedLockDigest,
      ),
      boundProducts: admittedProducts.map((product) =>
        productInstallCoordinate(product!.install)
      ),
      declaredRoots: roots,
      configurations: projection.configurationCoordinates,
      catalog: projection.catalogCoordinate,
      readiness: projection.readiness,
      residuals: projection.residuals,
      admissionEvent: reference(
        projection.admissionEventRef,
        admissionRow.admissionEventDigest,
      ),
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => {
    const admittedFault = admittedProjectReadFault(cause, call, [
      "artifactTruth",
      "workspaceManifest",
    ]);
    if (admittedFault !== null) return admittedFault;
    throw cause;
  },
});

const installEvidenceOwner: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.install_evidence,
  ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>,
  ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.install_evidence,
    ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>
  > => {
    if (!validResources<InstallEvidenceProjectReadPacket>(call.resources, ["artifactTruth"])) {
      throw fault(call, "invalid_resource_assertion", "install evidence requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const artifactTruth = call.resources.artifactTruth!;
    const manifestValue = packet.selector.manifest.value;
    if (!exactDefinitionCallMatches(
      call,
      PRODUCT_PROJECT_READ_CONTRACTS.install_evidence,
    )) {
      throw fault(call, "call_identity_mismatch", "install evidence call differs from its fixed definition, contracts, request digest, or authority topology");
    }
    const admissionRow = artifactTruth.rows.find((row) =>
      row.operationId === "abg.operation.product.install" &&
      row.artifactRef === packet.install.installId &&
      row.admissionEventRef === packet.install.admissionEventRef
    );
    if (
      !baseRelationMatches(call) ||
      call.invocation.request.selector.kind !== packet.selector.kind ||
      !sameCoordinate(call.invocation.request.selector.manifest, {
        ref: packet.selector.manifest.manifestRef,
        digest: packet.selector.manifest.manifestDigest,
      }) ||
      packet.selector.manifest.manifestRef !== join(
        packet.install.installedRoot,
        "product-toolchain-manifest.json",
      ) ||
      packet.selector.manifest.manifestDigest !== packet.install.manifestDigest ||
      sha256Canonical(packet.selector.manifest.value) !==
        packet.install.manifestDigest ||
      !isRecord(manifestValue) ||
      manifestValue.provenanceRef !== packet.install.provenanceRef ||
      manifestValue.productContentDigest !== packet.install.productContentDigest ||
      !hasAdmittedProductInstall(artifactTruth, packet.install) ||
      admissionRow === undefined
    ) {
      throw fault(call, "resource_relation_mismatch", "install evidence packet differs from the public source, basis, or manifest coordinates");
    }
    const output = InstallProjectionPort.evidence(packet);
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.install_evidence, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const ownerOutput = commonResult(call, PRODUCT_PROJECT_READ_CONTRACTS.install_evidence, {
      kind: "install_evidence_projection",
      subject: reference(projection.subjectRef, projection.subjectDigest),
      product: reference(projection.productId, projection.productContentDigest),
      artifact: reference(projection.artifactRef, projection.artifactDigest),
      productContent: reference(
        `product-content://abiogenesis/${projection.productContentDigest.slice("sha256:".length)}`,
        projection.productContentDigest,
      ),
      manifest: reference(
        projection.manifest.manifestRef,
        projection.manifest.manifestDigest,
      ),
      producer: projection.producer,
      basis: projection.basisRefs.map((ref) => {
        if (ref === packet.projectionBasis.basisRef) {
          return reference(ref, packet.projectionBasis.basisDigest);
        }
        if (ref === packet.install.resolvedLockId) {
          return reference(ref, packet.install.resolvedLockDigest);
        }
        throw new TypeError("Install evidence owner emitted an unknown basis coordinate");
      }),
      provenance: projection.provenanceRefs.map((ref) => {
        if (ref === packet.install.provenanceRef) {
          return reference(ref, packet.install.productContentDigest);
        }
        if (ref === packet.install.admissionEventRef) {
          return reference(ref, admissionRow.admissionEventDigest);
        }
        if (ref === packet.selector.manifest.manifestRef) {
          return reference(ref, packet.selector.manifest.manifestDigest);
        }
        throw new TypeError("Install evidence owner emitted an unknown provenance coordinate");
      }),
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => {
    const admittedFault = admittedProjectReadFault(cause, call, [
      "artifactTruth",
    ]);
    if (admittedFault !== null) return admittedFault;
    throw cause;
  },
});

const ticketConsensusOwner: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus,
  ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>,
  ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus,
    ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>
  > => {
    if (!validResources<TicketConsensusProjectReadPacket>(call.resources, [
      "artifactTruth",
      "runtime",
    ])) {
      throw fault(call, "invalid_resource_assertion", "ticket consensus requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const runtime = call.resources.runtime!;
    const artifactTruth = call.resources.artifactTruth!;
    if (!exactDefinitionCallMatches(
      call,
      PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus,
    )) {
      throw fault(call, "call_identity_mismatch", "ticket consensus call differs from its fixed definition, contracts, request digest, or authority topology");
    }
    const authorityBinding = admittedAuthorityBinding(
      call as DefinitionCall<ProjectReadContract, unknown>,
      artifactTruth,
    );
    const truth = projectRunTruthAtDurablePrefix(runtime.prefix, runtime.runId);
    const graphResult = AbgGraphCallProjectionPort.graph_call_result({
      kind: "abg_project_read_packet",
      schemaVersion: "5.0.0",
      memberKey: "graph_call_result",
      prefix: runtime.prefix,
      targetRef: runtime.graphCallId,
    });
    const graphReplay = AbgGraphCallProjectionPort.graph_call_replay({
      kind: "abg_project_read_packet",
      schemaVersion: "5.0.0",
      memberKey: "graph_call_replay",
      prefix: runtime.prefix,
      targetRef: runtime.graphCallId,
    });
    const resultValue = graphResult.kind === "abg_project_read_projection" &&
        isRecord(graphResult.value)
      ? graphResult.value
      : null;
    const admittedResult = resultValue !== null &&
        isRecord(resultValue.admittedResult)
      ? resultValue.admittedResult
      : null;
    const replayValue = graphReplay.kind === "abg_project_read_projection" &&
        isRecord(graphReplay.value)
      ? graphReplay.value
      : null;
    const runOpenAtom = replayValue !== null &&
        Array.isArray(replayValue.eventAtoms)
      ? replayValue.eventAtoms.find((atom: unknown) =>
        isRecord(atom) && atom.eventKind === "run_segment_opened" &&
        atom.aggregateId === runtime.runId
      )
      : undefined;
    const productResult = admittedResult !== null &&
        typeof admittedResult.resultRef === "string" &&
        typeof admittedResult.resultContractRef === "string" &&
        admittedResult.resultValue !== null
      ? ABI5_SYSTEM_PRODUCT_SEMANTICS.projectPublicResult({
        value: admittedResult.resultValue as never,
        admittedResultRef: admittedResult.resultRef,
        admittedResultContractRef: admittedResult.resultContractRef,
        replayRef: truth.kind === "abg_run_truth_projection"
          ? truth.replay.ref
          : "",
        projectionKind: "result",
      })
      : null;
    if (
      !baseRelationMatches(call) ||
      !sameJson(call.invocation.request.selector, packet.selector) ||
      !sameJson(artifactTruth.prefix, runtime.prefix) ||
      authorityBinding === null ||
      truth.kind !== "abg_run_truth_projection" ||
      truth.graphCall?.ref !== runtime.graphCallId ||
      truth.result === null ||
      graphResult.kind !== "abg_project_read_projection" ||
      graphReplay.kind !== "abg_project_read_projection" ||
      graphResult.prefixCoordinateDigest !== runtime.prefix.coordinateDigest ||
      graphReplay.prefixCoordinateDigest !== runtime.prefix.coordinateDigest ||
      admittedResult === null ||
      admittedResult.resultRef !== truth.result.ref ||
      admittedResult.resultDigest !== truth.result.digest ||
      resultValue?.runId !== runtime.runId ||
      replayValue?.runId !== runtime.runId ||
      replayValue?.replayRef !== truth.replay.ref ||
      replayValue?.replayDigest !== truth.replay.digest ||
      !isRecord(runOpenAtom) ||
      runOpenAtom.parentAggregateId !== authorityBinding.bindingId ||
      productResult === null ||
      !sameJson(productResult.value, packet.consensusResult) ||
      !sameCoordinate(packet.selector.outputAuthority, truth.result) ||
      !sameCoordinate(packet.selector.replayBasis, truth.replay)
    ) {
      throw fault(call, "resource_relation_mismatch", "ticket consensus packet differs from the public source, basis, or selector coordinates");
    }
    const output = ConsensusProjectionPort.ticketConsensus(packet);
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const ownerOutput = commonResult(call, PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus, {
      kind: "ticket_consensus_projection",
      ticket: call.invocation.request.selector.ticket,
      consensus: truth.result,
      outputAuthority: call.invocation.request.selector.outputAuthority,
      replayBasis: call.invocation.request.selector.replayBasis,
      evidence: [reference(projection.projectionRef, projection.projectionDigest)],
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => {
    const admittedFault = admittedProjectReadFault(cause, call, [
      "artifactTruth",
      "runtime",
    ]);
    if (admittedFault !== null) return admittedFault;
    throw cause;
  },
});

const catalog_list = bindStaticOwner(
  PRODUCT_PROJECT_READ_CONTRACTS.catalog_list,
  catalogListOwner,
  CATALOG_LIST_RESOURCE_SCHEMA,
  CATALOG_LIST_RESOURCE_SCHEMA,
);
const catalog_describe = bindStaticOwner(
  PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe,
  catalogDescribeOwner,
  CATALOG_DESCRIBE_RESOURCE_SCHEMA,
  CATALOG_DESCRIBE_RESOURCE_SCHEMA,
);
const workspace_status = bindStaticOwner(
  PRODUCT_PROJECT_READ_CONTRACTS.workspace_status,
  workspaceStatusOwner,
  WORKSPACE_STATUS_RESOURCE_SCHEMA,
  WORKSPACE_STATUS_RESOURCE_SCHEMA,
);
const install_evidence = bindStaticOwner(
  PRODUCT_PROJECT_READ_CONTRACTS.install_evidence,
  installEvidenceOwner,
  INSTALL_EVIDENCE_RESOURCE_SCHEMA,
  INSTALL_EVIDENCE_RESOURCE_SCHEMA,
);
const ticket_consensus = bindStaticOwner(
  PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus,
  ticketConsensusOwner,
  TICKET_CONSENSUS_RESOURCE_SCHEMA,
  TICKET_CONSENSUS_RESOURCE_SCHEMA,
);

export const PRODUCT_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze({
  catalog_list,
  catalog_describe,
  workspace_status,
  install_evidence,
  ticket_consensus,
});
