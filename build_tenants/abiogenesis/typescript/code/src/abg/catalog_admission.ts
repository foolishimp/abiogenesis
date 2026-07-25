import type { ProductSemanticsBinding } from "../gtl/index.js";
import {
  type CatalogApplication,
  type CatalogApplicationCandidate,
  type AdmittedCatalog,
  type CatalogAdmissionCandidate,
  type CatalogRowDisposition,
  type CatalogView,
  type CatalogViewCandidate,
  type ProductInstall,
} from "../product/index.js";
import {
  catalogApplicationContentDigest,
  catalogViewContentDigest,
  isCatalogApplicationCandidate,
  isCatalogAdmissionCandidate,
  isCatalogViewCandidate,
} from "../product/catalog.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admitArtifact,
  hasAdmittedProductInstall,
  type AbgAdmissionRefusal,
  type ArtifactAdmissionBasis,
} from "./environment_admission.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";

export interface CatalogAdmissionRefusal {
  readonly kind: "catalog_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "candidate_digest_mismatch" | "candidate_not_constructed" | "scope_mismatch";
  readonly message: string;
}

export type CatalogAdmissionResult = AdmittedCatalog | CatalogAdmissionRefusal | AbgAdmissionRefusal;
export type CatalogViewAdmissionResult = CatalogView | CatalogAdmissionRefusal | AbgAdmissionRefusal;
export type CatalogApplicationAdmissionResult =
  | CatalogApplication
  | CatalogAdmissionRefusal
  | AbgAdmissionRefusal;

export interface AdmittedProductSemanticsBasis {
  readonly install: ProductInstall;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly catalogAdmissionEventRef: string;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly catalogViewAdmissionEventRef: string;
  readonly publicationDigest: Sha256Digest;
  readonly productSemanticsBinding: Readonly<ProductSemanticsBinding>;
}

function refusal(
  code: CatalogAdmissionRefusal["code"],
  message: string,
): CatalogAdmissionRefusal {
  return {
    kind: "catalog_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function isJsonRecord(value: JsonValue | undefined): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function catalogCandidateBody(candidate: CatalogAdmissionCandidate): JsonValue {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    candidateId: _candidateId,
    candidateDigest: _candidateDigest,
    ...body
  } = candidate;
  return body as unknown as JsonValue;
}

function viewCandidateBody(candidate: CatalogViewCandidate): JsonValue {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    viewCandidateId: _viewCandidateId,
    viewCandidateDigest: _viewCandidateDigest,
    ...body
  } = candidate;
  return body as unknown as JsonValue;
}

function applicationCandidateBody(candidate: CatalogApplicationCandidate): JsonValue {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    applicationCandidateId: _applicationCandidateId,
    applicationCandidateDigest: _applicationCandidateDigest,
    ...body
  } = candidate;
  return body as unknown as JsonValue;
}

function productSemanticsBasisDigest(
  basis: Readonly<{
    readonly owningProductId: string;
    readonly artifactDigest: string;
    readonly productContentDigest: string;
    readonly productManifestDigest: string;
    readonly productSemanticsBinding: Readonly<ProductSemanticsBinding>;
  }>,
) {
  return sha256Canonical(basis as unknown as JsonValue);
}

export function admitCatalog(
  store: AbgEventStore,
  candidate: CatalogAdmissionCandidate,
  basis: ArtifactAdmissionBasis,
): CatalogAdmissionResult {
  if (!isCatalogAdmissionCandidate(candidate)) {
    return refusal("candidate_not_constructed", "catalog candidate was not constructed by the Product boundary");
  }
  if (sha256Canonical(catalogCandidateBody(candidate)) !== candidate.candidateDigest) {
    return refusal("candidate_digest_mismatch", "catalog candidate content differs from its digest");
  }
  if (
    basis.authorityScopeRef !== candidate.workspaceBindingId ||
    basis.authorityScopeDigest !== candidate.workspaceBindingDigest
  ) {
    return refusal("scope_mismatch", "catalog admission scope differs from the candidate");
  }
  const admissionEventRef = admitArtifact(
    store,
    basis,
    "abg.operation.catalog.admit",
    candidate.candidateId,
    candidate.candidateDigest,
    {
      publicationDigest: candidate.publicationDigest,
      productSemanticsBasisDigest: productSemanticsBasisDigest({
        owningProductId: candidate.modulePublication.owningProductId,
        artifactDigest: candidate.modulePublication.artifactDigest,
        productContentDigest: candidate.modulePublication.productContentDigest,
        productManifestDigest:
          candidate.modulePublication.productManifestDigest,
        productSemanticsBinding:
          candidate.modulePublication.productSemanticsBinding,
      }),
    },
  );
  if (typeof admissionEventRef !== "string") return admissionEventRef;

  const catalogId = `catalog://abiogenesis/${candidate.candidateDigest.slice("sha256:".length)}`;
  const rows: CatalogRowDisposition[] = candidate.rows.map((row) => {
    const event = admitRuntimeEvent(store, {
      kind: "registry_entry_admitted",
      eventTime: basis.eventTime,
      aggregateType: "workspace",
      aggregateId: candidate.workspaceBindingId,
      parentAggregateId: catalogId,
      causationEventRefs: [admissionEventRef],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "workspace",
      basisId: candidate.candidateId,
      payload: {
        operationId: "abg.operation.catalog.admit",
        catalogId,
        candidateId: candidate.candidateId,
        handle: row.handle,
        rowDigest: row.rowDigest,
        rowDisposition: "admitted",
      },
    });
    return {
      ...row,
      disposition: "admitted",
      admissionEventRef: event.eventId,
    };
  });
  const {
    kind: _kind,
    disposition: _disposition,
    candidateId: _candidateId,
    candidateDigest: _candidateDigest,
    rows: _rows,
    ...body
  } = candidate;
  return deepFreeze({
    kind: "admitted_catalog",
    disposition: "admitted",
    ...body,
    catalogId,
    catalogDigest: candidate.candidateDigest,
    admissionCandidateRef: candidate.candidateId,
    admissionEventRef,
    rows,
  }) as AdmittedCatalog;
}

export function narrowCatalogView(
  store: AbgEventStore,
  catalog: AdmittedCatalog,
  candidate: CatalogViewCandidate,
  basis: ArtifactAdmissionBasis,
): CatalogViewAdmissionResult {
  if (!isCatalogViewCandidate(candidate)) {
    return refusal("candidate_not_constructed", "catalog view candidate was not constructed by the Product boundary");
  }
  if (sha256Canonical(viewCandidateBody(candidate)) !== candidate.viewCandidateDigest) {
    return refusal("candidate_digest_mismatch", "catalog view candidate content differs from its digest");
  }
  if (
    !hasAdmittedCatalog(store, catalog) ||
    candidate.catalogId !== catalog.catalogId ||
    candidate.catalogDigest !== catalog.catalogDigest ||
    basis.authorityScopeRef !== catalog.catalogId ||
    basis.authorityScopeDigest !== catalog.catalogDigest
  ) {
    return refusal("scope_mismatch", "catalog view admission scope differs from the candidate");
  }
  const admissionEventRef = admitArtifact(
    store,
    basis,
    "abg.operation.catalog.view",
    candidate.viewCandidateId,
    candidate.viewCandidateDigest,
  );
  if (typeof admissionEventRef !== "string") return admissionEventRef;
  const {
    kind: _kind,
    disposition: _disposition,
    viewCandidateId: _viewCandidateId,
    viewCandidateDigest: _viewCandidateDigest,
    ...body
  } = candidate;
  return deepFreeze({
    kind: "catalog_view",
    disposition: "admitted",
    ...body,
    viewId: `catalog-view://abiogenesis/${candidate.viewCandidateDigest.slice("sha256:".length)}`,
    viewDigest: candidate.viewCandidateDigest,
    admissionCandidateRef: candidate.viewCandidateId,
    admissionEventRef,
  }) as CatalogView;
}

export function admitCatalogApplication(
  store: AbgEventStore,
  view: CatalogView,
  candidate: CatalogApplicationCandidate,
  basis: ArtifactAdmissionBasis,
): CatalogApplicationAdmissionResult {
  if (!isCatalogApplicationCandidate(candidate)) {
    return refusal(
      "candidate_not_constructed",
      "catalog application candidate was not constructed by the Product boundary",
    );
  }
  if (
    sha256Canonical(applicationCandidateBody(candidate)) !==
    candidate.applicationCandidateDigest
  ) {
    return refusal(
      "candidate_digest_mismatch",
      "catalog application candidate content differs from its digest",
    );
  }
  const row = view.selectedRows.find(
    (candidateRow) => candidateRow.handle === candidate.rowHandle,
  );
  if (
    !hasAdmittedCatalogView(store, view) ||
    candidate.catalogId !== view.catalogId ||
    candidate.catalogDigest !== view.catalogDigest ||
    candidate.viewId !== view.viewId ||
    candidate.viewDigest !== view.viewDigest ||
    row === undefined ||
    row.rowDigest !== candidate.rowDigest ||
    row.kind !== candidate.contributionKind ||
    basis.authorityScopeRef !== view.viewId ||
    basis.authorityScopeDigest !== view.viewDigest
  ) {
    return refusal(
      "scope_mismatch",
      "catalog application admission scope or selected declaration differs from the admitted view",
    );
  }
  const admissionEventRef = admitArtifact(
    store,
    basis,
    "abg.operation.catalog.apply",
    candidate.applicationCandidateId,
    candidate.applicationCandidateDigest,
  );
  if (typeof admissionEventRef !== "string") return admissionEventRef;
  const {
    kind: _kind,
    disposition: _disposition,
    applicationCandidateId,
    applicationCandidateDigest,
    ...body
  } = candidate;
  return deepFreeze({
    kind: "catalog_application",
    disposition: "admitted",
    ...body,
    applicationId: `catalog-application://abiogenesis/${
      applicationCandidateDigest.slice("sha256:".length)
    }`,
    applicationDigest: applicationCandidateDigest,
    admissionCandidateRef: applicationCandidateId,
    admissionEventRef,
  }) as CatalogApplication;
}

export function hasAdmittedCatalog(
  store: AbgEventStore,
  catalog: AdmittedCatalog,
): boolean {
  const admission = store.readAll().find((event) => event.eventId === catalog.admissionEventRef);
  const payload = admission?.payload;
  const candidateRows = catalog.rows.map((row) => {
    const { disposition: _disposition, admissionEventRef: _admissionEventRef, ...candidate } = row;
    return candidate;
  });
  const candidateDigest = sha256Canonical({
    workspaceBindingId: catalog.workspaceBindingId,
    workspaceBindingDigest: catalog.workspaceBindingDigest,
    lockId: catalog.lockId,
    lockDigest: catalog.lockDigest,
    publicationDigest: catalog.publicationDigest,
    publicationValidationRef: catalog.publicationValidationRef,
    programValidationRefs: catalog.programValidationRefs,
    modulePublication: catalog.modulePublication,
    programValidations: catalog.programValidations,
    rows: candidateRows,
  } as unknown as JsonValue);
  const rowsAdmitted = catalog.rows.every((row) => {
    const event = store.readAll().find((candidate) => candidate.eventId === row.admissionEventRef);
    return (
      event?.kind === "registry_entry_admitted" &&
      isJsonRecord(event.payload) &&
      event.payload.catalogId === catalog.catalogId &&
      event.payload.handle === row.handle &&
      event.payload.rowDigest === row.rowDigest &&
      event.payload.rowDisposition === row.disposition
    );
  });
  return (
    candidateDigest === catalog.catalogDigest &&
    admission?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(payload) &&
    payload.operationId === "abg.operation.catalog.admit" &&
    payload.artifactRef === catalog.admissionCandidateRef &&
    payload.artifactDigest === catalog.catalogDigest &&
    rowsAdmitted
  );
}

export function hasAdmittedCatalogView(
  store: AbgEventStore,
  view: CatalogView,
): boolean {
  const event = store.readAll().find((candidate) => candidate.eventId === view.admissionEventRef);
  const payload = event?.payload;
  const catalogCauseIsAdmitted = event?.causationEventRefs.some((eventRef) => {
    const cause = store.readAll().find((candidate) => candidate.eventId === eventRef);
    return (
      cause?.kind === "public_operation_artifact_admitted" &&
      isJsonRecord(cause.payload) &&
      cause.payload.operationId === "abg.operation.catalog.admit" &&
      cause.payload.artifactDigest === view.catalogDigest
    );
  }) === true;
  const viewDigest = catalogViewContentDigest(view);
  return (
    viewDigest === view.viewDigest &&
    event?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(payload) &&
    payload.operationId === "abg.operation.catalog.view" &&
    payload.artifactRef === view.admissionCandidateRef &&
    payload.artifactDigest === view.viewDigest &&
    catalogCauseIsAdmitted
  );
}

export function hasAdmittedProductSemanticsBasis(
  store: AbgEventStore,
  basis: AdmittedProductSemanticsBasis,
): boolean {
  const catalogEvent = store.readAll().find(
    (event) => event.eventId === basis.catalogAdmissionEventRef,
  );
  const catalogPayload = catalogEvent?.payload;
  const viewEvent = store.readAll().find(
    (event) => event.eventId === basis.catalogViewAdmissionEventRef,
  );
  const viewPayload = viewEvent?.payload;
  const expectedCatalogId =
    `catalog://abiogenesis/${basis.catalogDigest.slice("sha256:".length)}`;
  const expectedViewId =
    `catalog-view://abiogenesis/${basis.catalogViewDigest.slice("sha256:".length)}`;
  const expectedProductSemanticsBasisDigest = productSemanticsBasisDigest({
    owningProductId: basis.install.productId,
    artifactDigest: basis.install.artifactDigest,
    productContentDigest: basis.install.productContentDigest,
    productManifestDigest: basis.install.manifestDigest,
    productSemanticsBinding: basis.productSemanticsBinding,
  });
  return (
    hasAdmittedProductInstall(store, basis.install) &&
    basis.catalogId === expectedCatalogId &&
    basis.catalogViewId === expectedViewId &&
    basis.install.packageName ===
      basis.productSemanticsBinding.packageName &&
    basis.install.packageVersion ===
      basis.productSemanticsBinding.packageVersion &&
    catalogEvent?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(catalogPayload) &&
    catalogPayload.operationId === "abg.operation.catalog.admit" &&
    catalogPayload.authorityScopeRef === basis.workspaceBindingId &&
    catalogPayload.authorityScopeDigest === basis.workspaceBindingDigest &&
    catalogPayload.artifactDigest === basis.catalogDigest &&
    catalogPayload.publicationDigest === basis.publicationDigest &&
    catalogPayload.productSemanticsBasisDigest ===
      expectedProductSemanticsBasisDigest &&
    viewEvent?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(viewPayload) &&
    viewPayload.operationId === "abg.operation.catalog.view" &&
    viewPayload.authorityScopeRef === basis.catalogId &&
    viewPayload.authorityScopeDigest === basis.catalogDigest &&
    viewPayload.artifactDigest === basis.catalogViewDigest &&
    viewEvent.causationEventRefs.includes(basis.catalogAdmissionEventRef)
  );
}

export function hasAdmittedCatalogApplication(
  store: AbgEventStore,
  application: CatalogApplication,
): boolean {
  const event = store.readAll().find(
    (candidate) => candidate.eventId === application.admissionEventRef,
  );
  const payload = event?.payload;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    applicationId: _applicationId,
    applicationDigest: _applicationDigest,
    admissionCandidateRef: _admissionCandidateRef,
    admissionEventRef: _admissionEventRef,
    ...body
  } = application;
  const viewCauseIsAdmitted = event?.causationEventRefs.some((eventRef) => {
    const cause = store.readAll().find((candidate) => candidate.eventId === eventRef);
    return (
      cause?.kind === "public_operation_artifact_admitted" &&
      isJsonRecord(cause.payload) &&
      cause.payload.operationId === "abg.operation.catalog.view" &&
      cause.payload.artifactDigest === application.viewDigest
    );
  }) === true;
  return (
    catalogApplicationContentDigest(body) === application.applicationDigest &&
    event?.kind === "public_operation_artifact_admitted" &&
    isJsonRecord(payload) &&
    payload.operationId === "abg.operation.catalog.apply" &&
    payload.artifactRef === application.admissionCandidateRef &&
    payload.artifactDigest === application.applicationDigest &&
    viewCauseIsAdmitted
  );
}
