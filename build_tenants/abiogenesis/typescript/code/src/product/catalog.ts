import type { ModulePublication } from "../gtl/contracts.js";
import type {
  ProgramValidation,
  PublicationValidation,
} from "../validator/validation.js";
import {
  isProgramValidation,
  isPublicationValidation,
} from "../validator/validation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  ResolvedProductLock,
  WorkspaceBinding,
} from "./environment.js";

export type CatalogRowDispositionKind =
  | "admitted"
  | "rejected"
  | "incompatible"
  | "conflicting"
  | "unready"
  | "unresolved";

export interface CatalogRowCandidate {
  readonly handle: string;
  readonly kind: "graph_function" | "node_type" | "overlay";
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly moduleRef: string;
  readonly programMembershipRefs: readonly string[];
  readonly readiness: "ready";
  readonly eligibility: "eligible";
  readonly callability: "callable" | "non_callable";
  readonly sessionVisibility: "workspace";
  readonly compatibilityDisposition: "compatible";
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly rowDigest: Sha256Digest;
}

export interface CatalogAdmissionCandidate {
  readonly kind: "catalog_admission_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly candidateId: string;
  readonly candidateDigest: Sha256Digest;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly lockId: string;
  readonly lockDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly publicationValidationRef: string;
  readonly programValidationRefs: readonly string[];
  readonly modulePublication: Readonly<ModulePublication>;
  readonly programValidations: readonly ProgramValidation[];
  readonly rows: readonly CatalogRowCandidate[];
}

export interface CatalogRowDisposition extends CatalogRowCandidate {
  readonly disposition: CatalogRowDispositionKind;
  readonly admissionEventRef: string;
}

export interface AdmittedCatalog
  extends Omit<CatalogAdmissionCandidate, "candidateId" | "candidateDigest" | "disposition" | "kind" | "rows"> {
  readonly kind: "admitted_catalog";
  readonly disposition: "admitted";
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly admissionCandidateRef: string;
  readonly admissionEventRef: string;
  readonly rows: readonly CatalogRowDisposition[];
}

export interface CatalogViewCandidate {
  readonly kind: "catalog_view_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly viewCandidateId: string;
  readonly viewCandidateDigest: Sha256Digest;
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly allowlist: readonly string[];
  readonly selectedRows: readonly CatalogRowDisposition[];
}

export interface CatalogView extends Omit<CatalogViewCandidate, "kind" | "disposition" | "viewCandidateId" | "viewCandidateDigest"> {
  readonly kind: "catalog_view";
  readonly disposition: "admitted";
  readonly viewId: string;
  readonly viewDigest: Sha256Digest;
  readonly admissionCandidateRef: string;
  readonly admissionEventRef: string;
}

export interface CatalogConstructionRefusal {
  readonly kind: "catalog_construction_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "binding_lock_mismatch"
    | "duplicate_allowlist_entry"
    | "invalid_validation_basis"
    | "publication_not_bound"
    | "unknown_allowlist_entry";
  readonly message: string;
}

export type CatalogAdmissionCandidateResult = CatalogAdmissionCandidate | CatalogConstructionRefusal;
export type CatalogViewCandidateResult = CatalogViewCandidate | CatalogConstructionRefusal;

const catalogAdmissionCandidates = new WeakSet<object>();
const catalogViewCandidates = new WeakSet<object>();

export function isCatalogAdmissionCandidate(value: object): boolean {
  return catalogAdmissionCandidates.has(value);
}

export function isCatalogViewCandidate(value: object): boolean {
  return catalogViewCandidates.has(value);
}

function refusal(
  code: CatalogConstructionRefusal["code"],
  message: string,
): CatalogConstructionRefusal {
  return {
    kind: "catalog_construction_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

export function constructCatalogAdmissionCandidate(
  workspaceBinding: WorkspaceBinding,
  lock: ResolvedProductLock,
  publication: Readonly<ModulePublication>,
  publicationValidation: PublicationValidation,
  programValidations: readonly ProgramValidation[],
): CatalogAdmissionCandidateResult {
  if (
    workspaceBinding.lockId !== lock.lockId ||
    workspaceBinding.lockDigest !== lock.lockDigest
  ) {
    return refusal("binding_lock_mismatch", "workspace binding and resolved lock disagree");
  }
  const productLockRow = lock.rows.find((row) => row.productId === publication.owningProductId);
  if (
    productLockRow === undefined ||
    productLockRow.artifactDigest !== publication.artifactDigest ||
    productLockRow.productContentDigest !== publication.productContentDigest ||
    productLockRow.manifestDigest !== publication.productManifestDigest
  ) {
    return refusal("publication_not_bound", "module publication is not carried by the exact bound Product lock");
  }
  const publicationDigest = sha256Canonical(publication as unknown as JsonValue);
  const validationByProgram = new Map(
    programValidations.map((validation) => [validation.programRef, validation]),
  );
  if (
    !isPublicationValidation(publicationValidation) ||
    programValidations.some((validation) => !isProgramValidation(validation)) ||
    new Set(programValidations.map((validation) => validation.programRef)).size !== programValidations.length ||
    publicationValidation.disposition !== "valid" ||
    publicationValidation.publicationDigest !== publicationDigest ||
    publicationValidation.moduleRef !== publication.moduleRef ||
    publication.programs.length !== programValidations.length ||
    publication.programs.some((program) => {
      const validation = validationByProgram.get(program.programRef);
      return validation === undefined || validation.publicationDigest !== publicationDigest;
    })
  ) {
    return refusal("invalid_validation_basis", "catalog candidate requires exact publication and Program validations");
  }
  const rows = publication.contributions.map((contribution): CatalogRowCandidate => {
    const body = {
      handle: contribution.handle,
      kind: contribution.kind,
      declarationOrContractRef: contribution.declarationOrContractRef,
      owningProductId: contribution.owningProductId,
      moduleRef: publication.moduleRef,
      programMembershipRefs: contribution.programMembershipRefs,
      readiness: "ready" as const,
      eligibility: "eligible" as const,
      callability: contribution.kind === "graph_function" ? "callable" as const : "non_callable" as const,
      sessionVisibility: "workspace" as const,
      compatibilityDisposition: "compatible" as const,
      compatibilityRefs: contribution.compatibilityRefs,
      provenanceRefs: contribution.provenanceRefs,
    };
    return { ...body, rowDigest: sha256Canonical(body as unknown as JsonValue) };
  });
  const body = {
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    lockId: lock.lockId,
    lockDigest: lock.lockDigest,
    publicationDigest,
    publicationValidationRef: publicationValidation.validationRef,
    programValidationRefs: programValidations.map((validation) => validation.validationRef),
    modulePublication: publication,
    programValidations,
    rows,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "catalog_admission_candidate",
    schemaVersion: "5.0.0",
    disposition: "candidate",
    candidateId: identity("catalog-candidate://abiogenesis", candidateDigest),
    candidateDigest,
    ...body,
  }) as CatalogAdmissionCandidate;
  catalogAdmissionCandidates.add(candidate);
  return candidate;
}

export function constructCatalogViewCandidate(
  catalog: AdmittedCatalog,
  allowlist: readonly string[],
): CatalogViewCandidateResult {
  if (new Set(allowlist).size !== allowlist.length) {
    return refusal("duplicate_allowlist_entry", "catalog allowlist cannot contain duplicate handles");
  }
  const rowsByHandle = new Map(catalog.rows.map((row) => [row.handle, row]));
  const unknown = allowlist.filter((handle) => !rowsByHandle.has(handle));
  if (unknown.length !== 0) {
    return refusal("unknown_allowlist_entry", `unknown catalog allowlist handle ${unknown[0]}`);
  }
  const selectedRows = allowlist.map((handle) => rowsByHandle.get(handle)!);
  const body = {
    catalogId: catalog.catalogId,
    catalogDigest: catalog.catalogDigest,
    allowlist: [...allowlist],
    selectedRows,
  };
  const viewCandidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "catalog_view_candidate",
    schemaVersion: "5.0.0",
    disposition: "candidate",
    viewCandidateId: identity("catalog-view-candidate://abiogenesis", viewCandidateDigest),
    viewCandidateDigest,
    ...body,
  }) as CatalogViewCandidate;
  catalogViewCandidates.add(candidate);
  return candidate;
}

export function catalogViewContentDigest(
  view: Pick<CatalogView, "catalogId" | "catalogDigest" | "allowlist" | "selectedRows">,
): Sha256Digest {
  return sha256Canonical({
    catalogId: view.catalogId,
    catalogDigest: view.catalogDigest,
    allowlist: view.allowlist,
    selectedRows: view.selectedRows,
  } as unknown as JsonValue);
}
