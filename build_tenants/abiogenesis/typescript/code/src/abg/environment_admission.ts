import type {
  ProductInstall,
  ProductInstallCandidate,
  WorkspaceBinding,
  WorkspaceBindingCandidate,
} from "../product/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";

export type PublicOperationId =
  | "abg.operation.product.install"
  | "abg.operation.workspace.bind"
  | "abg.operation.catalog.admit"
  | "abg.operation.catalog.view"
  | "abg.operation.interaction.respond"
  | "abg.operation.project.read"
  | "abg.operation.run.continue"
  | "abg.operation.run.invoke";

export interface PublicOperationAdmissionBasis {
  readonly operationId: PublicOperationId;
  readonly definitionKey: string;
  readonly definitionDigest: Sha256Digest;
  readonly authorityScopeRef: string;
  readonly authorityScopeDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly invocationPayloadDigest: Sha256Digest;
  readonly invocationDigest: Sha256Digest;
  readonly correlationId: string;
  readonly eventTime: string;
  readonly causationEventRefs: readonly string[];
}

export type ArtifactAdmissionBasis = PublicOperationAdmissionBasis;

export interface AbgAdmissionRefusal {
  readonly kind: "abg_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "operation_mismatch" | "scope_mismatch";
  readonly message: string;
}

function refusal(
  code: AbgAdmissionRefusal["code"],
  message: string,
): AbgAdmissionRefusal {
  return {
    kind: "abg_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function isJsonRecord(value: JsonValue | undefined): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasAdmittedProductInstall(
  store: AbgEventStore,
  install: ProductInstall,
): boolean {
  const {
    kind: _kind,
    disposition: _disposition,
    admissionEventRef: _admissionEventRef,
    ...body
  } = install;
  const candidate = {
    kind: "product_install_candidate" as const,
    disposition: "materialized" as const,
    ...body,
  };
  const event = store.readAll().find(
    (row) => row.eventId === install.admissionEventRef,
  );
  return event?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(event.payload) &&
    event.payload.operationId === "abg.operation.product.install" &&
    event.payload.artifactRef === install.installId &&
    event.payload.artifactDigest === sha256Canonical(candidate as unknown as JsonValue);
}

export function validatePublicOperationBasis(
  basis: PublicOperationAdmissionBasis,
  expectedOperation: PublicOperationId,
): AbgAdmissionRefusal | null {
  if (basis.operationId !== expectedOperation || basis.definitionKey !== expectedOperation) {
    return refusal("operation_mismatch", "operation identity and definition key must agree");
  }
  const expectedDefinitionDigest = sha256Canonical({
    operationId: expectedOperation,
    schemaVersion: "5.0.0",
  });
  const expectedInvocationDigest = sha256Canonical({
    invocationRef: basis.invocationRef,
    operationId: expectedOperation,
    payloadDigest: basis.invocationPayloadDigest,
  });
  if (
    basis.definitionDigest !== expectedDefinitionDigest ||
    basis.invocationDigest !== expectedInvocationDigest ||
    Number.isNaN(Date.parse(basis.eventTime))
  ) {
    return refusal("operation_mismatch", "operation definition, invocation, or event-time basis is invalid");
  }
  return null;
}

export function admitArtifact(
  store: AbgEventStore,
  basis: PublicOperationAdmissionBasis,
  expectedOperation: PublicOperationId,
  artifactRef: string,
  artifactDigest: Sha256Digest,
): AbgAdmissionRefusal | string {
  const invalidBasis = validatePublicOperationBasis(basis, expectedOperation);
  if (invalidBasis !== null) return invalidBasis;
  const event = admitRuntimeEvent(store, {
    kind: "public_operation_artifact_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: basis.authorityScopeRef,
    parentAggregateId: null,
    causationEventRefs: basis.causationEventRefs,
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: basis.authorityScopeRef,
    payload: {
      operationId: basis.operationId,
      definitionKey: basis.definitionKey,
      definitionDigest: basis.definitionDigest,
      authorityScopeRef: basis.authorityScopeRef,
      authorityScopeDigest: basis.authorityScopeDigest,
      invocationRef: basis.invocationRef,
      invocationPayloadDigest: basis.invocationPayloadDigest,
      invocationDigest: basis.invocationDigest,
      ownerAdmittedDisposition: "admitted",
      artifactRef,
      artifactDigest,
      causationEventRefs: basis.causationEventRefs,
      correlationId: basis.correlationId,
    },
  });
  return event.eventId;
}

export function hasAdmittedWorkspaceBinding(
  store: AbgEventStore,
  binding: WorkspaceBinding,
): boolean {
  const event = store.readAll().find((candidate) => candidate.eventId === binding.admissionEventRef);
  const payload = event?.payload;
  const bindingDigest = sha256Canonical({
    authorityBasisId: binding.authorityBasisId,
    authorityBasisDigest: binding.authorityBasisDigest,
    productSetId: binding.productSetId,
    productSetDigest: binding.productSetDigest,
    lockId: binding.lockId,
    lockDigest: binding.lockDigest,
    roots: binding.roots,
  } as unknown as JsonValue);
  return (
    bindingDigest === binding.bindingDigest &&
    event?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(payload) &&
    payload.operationId === "abg.operation.workspace.bind" &&
    payload.artifactRef === binding.bindingId &&
    payload.artifactDigest === binding.bindingDigest
  );
}

export function admitProductInstall(
  store: AbgEventStore,
  candidate: ProductInstallCandidate,
  basis: ArtifactAdmissionBasis,
): AbgAdmissionRefusal | ProductInstall {
  if (
    basis.authorityScopeRef !== candidate.installId ||
    basis.authorityScopeDigest !== candidate.productContentDigest
  ) {
    return refusal("scope_mismatch", "install admission scope differs from the candidate");
  }
  const candidateDigest = sha256Canonical(candidate as unknown as JsonValue);
  const admissionEventRef = admitArtifact(
    store,
    basis,
    "abg.operation.product.install",
    candidate.installId,
    candidateDigest,
  );
  if (typeof admissionEventRef !== "string") {
    return admissionEventRef;
  }
  const { kind: _kind, disposition: _disposition, ...body } = candidate;
  const install = deepFreeze({
    kind: "product_install",
    disposition: "admitted",
    ...body,
    admissionEventRef,
  }) as ProductInstall;
  return install;
}

export function admitWorkspaceBinding(
  store: AbgEventStore,
  candidate: WorkspaceBindingCandidate,
  basis: ArtifactAdmissionBasis,
): AbgAdmissionRefusal | WorkspaceBinding {
  if (
    basis.authorityScopeRef !== candidate.bindingId ||
    basis.authorityScopeDigest !== candidate.bindingDigest
  ) {
    return refusal("scope_mismatch", "workspace admission scope differs from the candidate");
  }
  const admissionEventRef = admitArtifact(
    store,
    basis,
    "abg.operation.workspace.bind",
    candidate.bindingId,
    candidate.bindingDigest,
  );
  if (typeof admissionEventRef !== "string") {
    return admissionEventRef;
  }
  const { kind: _kind, ...body } = candidate;
  return {
    kind: "workspace_binding",
    ...body,
    admissionEventRef,
  };
}
