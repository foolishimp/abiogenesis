import {
  sha256Canonical,
  type AdmittedCatalog,
  type CatalogAdmissionCandidate,
  type CatalogRowDisposition,
  type CatalogView,
  type CatalogViewCandidate,
  type JsonValue,
} from "../product/index.js";
import {
  catalogViewContentDigest,
  isCatalogAdmissionCandidate,
  isCatalogViewCandidate,
} from "../product/catalog.js";
import { deepFreeze } from "../product/immutable.js";
import { admitArtifact, type AbgAdmissionRefusal, type ArtifactAdmissionBasis } from "./environment_admission.js";
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
