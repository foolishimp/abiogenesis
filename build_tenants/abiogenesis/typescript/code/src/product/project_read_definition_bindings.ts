import * as Effect from "effect/Effect";

import { compareUnicodeCodeUnits } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import {
  definitionFault,
  hasExactKeys,
  isDefinitionFault,
  isRecord,
  reference,
  sameCoordinate,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import type {
  DefinitionCall,
  DefinitionExecutionFault,
  DefinitionReturn,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OwnerSemanticOutput } from
  "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { PRODUCT_PROJECT_READ_CONTRACTS } from
  "./project_read_operation_contracts.js";
import {
  CatalogProjectionPort,
  ConsensusProjectionPort,
  InstallProjectionPort,
  ReleaseProjectionPort,
  WorkspaceProjectionPort,
  type CatalogDescribeProjectReadPacket,
  type CatalogListProjectReadPacket,
  type InstallEvidenceProjectReadPacket,
  type ProductProjectReadRefusal,
  type ReleaseEvidenceProjectReadPacket,
  type TicketConsensusProjectReadPacket,
  type WorkspaceStatusProjectReadPacket,
} from "./project_read_ports.js";

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
}

function fault<TContract extends ProjectReadContract>(
  call: DefinitionCall<TContract, unknown>,
  code: string,
  message: string,
): DefinitionExecutionFault<TContract["definitionKey"]> {
  return definitionFault(
    call.invocation.definitionKey,
    "resource_admission",
    code,
    message,
  );
}

function validResources<TPacket extends ProjectReadPacket>(
  value: unknown,
): value is ProductProjectReadResourceAssertion<TPacket> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "packet", "schemaVersion"]) &&
    value.kind === "product_project_read_resource_assertion" &&
    value.schemaVersion === "5.0.0" &&
    isRecord(value.packet) &&
    sameJson(value, value);
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

function opaqueCoordinate(ref: string): ReferenceDigest {
  return reference(ref, sha256Canonical({ ref }));
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
  projection: unknown,
): OwnerSemanticOutput<TContract> {
  const request = call.invocation.request;
  return validatedOwnerOutput(callContract(call), {
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

function callContract<TContract extends ProjectReadContract>(
  call: DefinitionCall<TContract, unknown>,
): TContract {
  return PRODUCT_PROJECT_READ_CONTRACTS[
    call.invocation.definitionKey.memberKey
  ] as TContract;
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

const catalog_list: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_list,
  ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>,
  ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_list,
    ProductProjectReadResourceAssertion<CatalogListProjectReadPacket>
  > => {
    if (!validResources<CatalogListProjectReadPacket>(call.resources)) {
      throw fault(call, "invalid_resource_assertion", "catalog list requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const request = call.invocation.request;
    const selectorMatches = request.selector.visibility.kind ===
        packet.selector.visibility.kind &&
      (request.selector.visibility.kind === "workspace_catalog" ||
        (packet.selector.visibility.kind === "session_view" &&
          request.selector.visibility.view.digest ===
            packet.selector.visibility.view.viewDigest));
    if (!baseRelationMatches(call) || !selectorMatches) {
      throw fault(call, "resource_relation_mismatch", "catalog list packet differs from the public source, basis, or selector coordinates");
    }
    const output = CatalogProjectionPort.list(packet);
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.catalog_list, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const ownerOutput = commonResult(call, {
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
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<
      typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_list.definitionKey
    >
    : fault(call, "owner_execution_failure", String(cause)),
});

const catalog_describe: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe,
  ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>,
  ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe,
    ProductProjectReadResourceAssertion<CatalogDescribeProjectReadPacket>
  > => {
    if (!validResources<CatalogDescribeProjectReadPacket>(call.resources)) {
      throw fault(call, "invalid_resource_assertion", "catalog describe requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    const request = call.invocation.request;
    const visibilityMatches = packet.selector.visibility.kind ===
      "workspace_catalog"
      ? sameCoordinate(request.selector.visibilityBasis, {
        ref: packet.sourceRef,
        digest: packet.sourceDigest,
      })
      : request.selector.visibilityBasis.digest ===
        packet.selector.visibility.view.viewDigest;
    if (
      !baseRelationMatches(call) ||
      request.selector.handle !== packet.selector.handle ||
      !visibilityMatches
    ) {
      throw fault(call, "resource_relation_mismatch", "catalog describe packet differs from the public source, basis, or selector coordinates");
    }
    const output = CatalogProjectionPort.describe(packet);
    if (output.kind === "product_project_read_refusal") {
      return deepFreeze({
        ownerOutput: nativeRefusal(PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe, output),
        resources: call.resources,
      });
    }
    const projection = output.projection;
    const ownerOutput = commonResult(call, {
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
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<
      typeof PRODUCT_PROJECT_READ_CONTRACTS.catalog_describe.definitionKey
    >
    : fault(call, "owner_execution_failure", String(cause)),
});

const workspace_status: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.workspace_status,
  ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>,
  ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.workspace_status,
    ProductProjectReadResourceAssertion<WorkspaceStatusProjectReadPacket>
  > => {
    if (!validResources<WorkspaceStatusProjectReadPacket>(call.resources)) {
      throw fault(call, "invalid_resource_assertion", "workspace status requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    if (!baseRelationMatches(call) || !sameJson(call.invocation.request.selector, packet.selector)) {
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
    const ownerOutput = commonResult(call, {
      kind: "workspace_status_projection",
      workspace: opaqueCoordinate(projection.workspaceRef),
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
      boundProducts: projection.boundProductRefs.map(opaqueCoordinate),
      declaredRoots: roots,
      configurations: projection.configurationCoordinates,
      catalog: projection.catalogCoordinate,
      readiness: projection.readiness,
      residuals: projection.residuals,
      admissionEvent: opaqueCoordinate(projection.admissionEventRef),
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<
      typeof PRODUCT_PROJECT_READ_CONTRACTS.workspace_status.definitionKey
    >
    : fault(call, "owner_execution_failure", String(cause)),
});

const install_evidence: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.install_evidence,
  ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>,
  ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.install_evidence,
    ProductProjectReadResourceAssertion<InstallEvidenceProjectReadPacket>
  > => {
    if (!validResources<InstallEvidenceProjectReadPacket>(call.resources)) {
      throw fault(call, "invalid_resource_assertion", "install evidence requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    if (
      !baseRelationMatches(call) ||
      call.invocation.request.selector.kind !== packet.selector.kind ||
      !sameCoordinate(call.invocation.request.selector.manifest, {
        ref: packet.selector.manifest.manifestRef,
        digest: packet.selector.manifest.manifestDigest,
      })
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
    const ownerOutput = commonResult(call, {
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
      basis: projection.basisRefs.map((ref) =>
        ref === packet.projectionBasis.basisRef
          ? reference(ref, packet.projectionBasis.basisDigest)
          : opaqueCoordinate(ref)
      ),
      provenance: projection.provenanceRefs.map(opaqueCoordinate),
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<
      typeof PRODUCT_PROJECT_READ_CONTRACTS.install_evidence.definitionKey
    >
    : fault(call, "owner_execution_failure", String(cause)),
});

const release_evidence: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.release_evidence,
  ProductProjectReadResourceAssertion<ReleaseEvidenceProjectReadPacket>,
  ProductProjectReadResourceAssertion<ReleaseEvidenceProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.release_evidence,
    ProductProjectReadResourceAssertion<ReleaseEvidenceProjectReadPacket>
  > => {
    if (!validResources<ReleaseEvidenceProjectReadPacket>(call.resources)) {
      throw fault(call, "invalid_resource_assertion", "release evidence requires one exact typed owner packet");
    }
    if (!baseRelationMatches(call)) {
      throw fault(call, "resource_relation_mismatch", "release evidence packet differs from the public source or basis coordinates");
    }
    const output = ReleaseProjectionPort.evidence(call.resources.packet);
    return deepFreeze({
      ownerOutput: nativeRefusal(
        PRODUCT_PROJECT_READ_CONTRACTS.release_evidence,
        output,
      ),
      resources: call.resources,
    });
  },
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<
      typeof PRODUCT_PROJECT_READ_CONTRACTS.release_evidence.definitionKey
    >
    : fault(call, "owner_execution_failure", String(cause)),
});

const ticket_consensus: ExactDefinitionCallable<
  typeof PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus,
  ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>,
  ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>
> = (call) => Effect.try({
  try: (): DefinitionReturn<
    typeof PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus,
    ProductProjectReadResourceAssertion<TicketConsensusProjectReadPacket>
  > => {
    if (!validResources<TicketConsensusProjectReadPacket>(call.resources)) {
      throw fault(call, "invalid_resource_assertion", "ticket consensus requires one exact typed owner packet");
    }
    const packet = call.resources.packet;
    if (!baseRelationMatches(call) || !sameJson(call.invocation.request.selector, packet.selector)) {
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
    const ownerOutput = commonResult(call, {
      kind: "ticket_consensus_projection",
      ticket: call.invocation.request.selector.ticket,
      consensus: reference(packet.sourceRef, packet.sourceDigest),
      outputAuthority: call.invocation.request.selector.outputAuthority,
      replayBasis: call.invocation.request.selector.replayBasis,
      evidence: [reference(projection.projectionRef, projection.projectionDigest)],
    });
    return deepFreeze({ ownerOutput, resources: call.resources });
  },
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<
      typeof PRODUCT_PROJECT_READ_CONTRACTS.ticket_consensus.definitionKey
    >
    : fault(call, "owner_execution_failure", String(cause)),
});

export const PRODUCT_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze({
  catalog_list,
  catalog_describe,
  workspace_status,
  install_evidence,
  release_evidence,
  ticket_consensus,
});
