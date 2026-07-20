import type {
  ProductInstall,
  ProductInstallCandidate,
  WorkspaceBinding,
  WorkspaceBindingCandidate,
} from "../product/index.js";
import { sha256Canonical, type JsonValue, type Sha256Digest } from "../product/index.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";

export interface ArtifactAdmissionBasis {
  readonly operationId:
    | "abg.operation.product.install"
    | "abg.operation.workspace.bind"
    | "abg.operation.catalog.admit"
    | "abg.operation.catalog.view";
  readonly definitionKey: string;
  readonly definitionDigest: Sha256Digest;
  readonly authorityScopeRef: string;
  readonly authorityScopeDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly correlationId: string;
  readonly eventTime: string;
  readonly causationEventRefs: readonly string[];
}

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

export function admitArtifact(
  store: AbgEventStore,
  basis: ArtifactAdmissionBasis,
  expectedOperation: ArtifactAdmissionBasis["operationId"],
  artifactRef: string,
  artifactDigest: Sha256Digest,
): AbgAdmissionRefusal | string {
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
  });
  if (
    basis.definitionDigest !== expectedDefinitionDigest ||
    basis.invocationDigest !== expectedInvocationDigest ||
    Number.isNaN(Date.parse(basis.eventTime))
  ) {
    return refusal("operation_mismatch", "operation definition, invocation, or event-time basis is invalid");
  }
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
  return {
    kind: "product_install",
    disposition: "admitted",
    ...body,
    admissionEventRef,
  };
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
