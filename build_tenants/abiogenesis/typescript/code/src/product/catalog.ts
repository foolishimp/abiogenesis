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

export interface CatalogApplicationCandidate {
  readonly kind: "catalog_application_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly applicationCandidateId: string;
  readonly applicationCandidateDigest: Sha256Digest;
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly viewId: string;
  readonly viewDigest: Sha256Digest;
  readonly rowHandle: string;
  readonly rowDigest: Sha256Digest;
  readonly appliedHandle: string;
  readonly appliedValueRef: string;
  readonly appliedValueDigest: Sha256Digest;
  readonly appliedValue: JsonValue;
  readonly contributorKind: "host" | "product";
  readonly contributorRef: string;
  readonly contributorProvenanceRefs: readonly string[];
  readonly contributionKind: "node_type" | "overlay";
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly moduleRef: string;
  readonly programMembershipRefs: readonly string[];
  readonly compatibilityDisposition: "compatible";
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface CatalogApplication
  extends Omit<
    CatalogApplicationCandidate,
    "kind" | "disposition" | "applicationCandidateId" | "applicationCandidateDigest"
  > {
  readonly kind: "catalog_application";
  readonly disposition: "admitted";
  readonly applicationId: string;
  readonly applicationDigest: Sha256Digest;
  readonly admissionCandidateRef: string;
  readonly admissionEventRef: null;
}

export interface CatalogAppliedValue {
  readonly kind: "catalog_applied_value";
  readonly schemaVersion: "5.0.0";
  readonly contractRef: string;
  readonly valueRef: string;
  readonly valueDigest: Sha256Digest;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly programMembershipRefs: readonly string[];
}

export interface CatalogConstructionRefusal {
  readonly kind: "catalog_construction_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "application_not_supported"
    | "invalid_application_binding"
    | "invalid_application_contributor"
    | "binding_lock_mismatch"
    | "duplicate_allowlist_entry"
    | "invalid_validation_basis"
    | "publication_not_bound"
    | "row_not_admitted"
    | "unknown_allowlist_entry";
  readonly message: string;
}

export type CatalogAdmissionCandidateResult = CatalogAdmissionCandidate | CatalogConstructionRefusal;
export type CatalogViewCandidateResult = CatalogViewCandidate | CatalogConstructionRefusal;
export type CatalogApplicationCandidateResult =
  | CatalogApplicationCandidate
  | CatalogConstructionRefusal;

const catalogAdmissionCandidates = new WeakSet<object>();
const catalogViewCandidates = new WeakSet<object>();
const catalogApplicationCandidates = new WeakSet<object>();

export function isCatalogAdmissionCandidate(value: object): boolean {
  return catalogAdmissionCandidates.has(value);
}

export function isCatalogViewCandidate(value: object): boolean {
  return catalogViewCandidates.has(value);
}

export function isCatalogApplicationCandidate(value: object): boolean {
  return catalogApplicationCandidates.has(value);
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

export function constructCatalogApplicationCandidate(
  catalog: AdmittedCatalog,
  view: CatalogView,
  workspaceBinding: WorkspaceBinding,
  lock: ResolvedProductLock,
  handle: string,
  appliedValue: CatalogAppliedValue,
  contributorRef: string,
): CatalogApplicationCandidateResult {
  const row = view.selectedRows.find((candidate) => candidate.handle === handle);
  if (row === undefined) {
    return refusal(
      "unknown_allowlist_entry",
      `catalog application handle ${handle} is not present in the admitted view`,
    );
  }
  if (row.disposition !== "admitted") {
    return refusal("row_not_admitted", "catalog application requires an admitted row");
  }
  if (row.kind === "graph_function") {
    return refusal(
      "application_not_supported",
      "GraphFunction rows remain callable through run.invoke and cannot be applied",
    );
  }
  if (
    catalog.catalogId !== view.catalogId ||
    catalog.catalogDigest !== view.catalogDigest ||
    catalog.workspaceBindingId !== workspaceBinding.bindingId ||
    catalog.workspaceBindingDigest !== workspaceBinding.bindingDigest
  ) {
    return refusal(
      "invalid_application_binding",
      "catalog application workspace differs from the admitted view",
    );
  }
  if (
    workspaceBinding.lockId !== lock.lockId ||
    workspaceBinding.lockDigest !== lock.lockDigest ||
    appliedValue.kind !== "catalog_applied_value" ||
    appliedValue.schemaVersion !== "5.0.0" ||
    appliedValue.contractRef !== row.declarationOrContractRef ||
    appliedValue.valueRef.trim().length === 0 ||
    !/^sha256:[0-9a-f]{64}$/u.test(appliedValue.valueDigest) ||
    sha256Canonical(appliedValue.value as unknown as JsonValue) !==
      appliedValue.valueDigest ||
    appliedValue.programMembershipRefs.join("\0") !==
      row.programMembershipRefs.join("\0")
  ) {
    return refusal(
      "invalid_application_binding",
      "catalog application requires one Product-validated concrete value under the exact row contract and Program composition",
    );
  }
  const contributorLockRow = lock.rows.find(
    (candidate) => candidate.productId === contributorRef,
  );
  const contributorKind = contributorRef === workspaceBinding.authorizedActorRef
    ? "host" as const
    : contributorLockRow === undefined
    ? null
    : "product" as const;
  if (contributorKind === null) {
    return refusal(
      "invalid_application_contributor",
      "catalog application contributor is absent from the admitted workspace authority and Product lock",
    );
  }
  const contributorProvenanceRefs = contributorKind === "host"
    ? [
        workspaceBinding.authorityBasisId,
        workspaceBinding.bindingId,
      ]
    : [
        lock.lockId,
        contributorLockRow!.artifactDigest,
        contributorLockRow!.manifestDigest,
      ];
  const body = {
    catalogId: view.catalogId,
    catalogDigest: view.catalogDigest,
    viewId: view.viewId,
    viewDigest: view.viewDigest,
    rowHandle: row.handle,
    rowDigest: row.rowDigest,
    appliedHandle:
      `${row.handle}/${appliedValue.valueDigest.slice("sha256:".length)}`,
    appliedValueRef: appliedValue.valueRef,
    appliedValueDigest: appliedValue.valueDigest,
    appliedValue: appliedValue.value,
    contributorKind,
    contributorRef,
    contributorProvenanceRefs,
    contributionKind: row.kind,
    declarationOrContractRef: row.declarationOrContractRef,
    owningProductId: row.owningProductId,
    moduleRef: row.moduleRef,
    programMembershipRefs: row.programMembershipRefs,
    compatibilityDisposition: row.compatibilityDisposition,
    compatibilityRefs: row.compatibilityRefs,
    provenanceRefs: row.provenanceRefs,
  };
  const applicationCandidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "catalog_application_candidate",
    schemaVersion: "5.0.0",
    disposition: "candidate",
    applicationCandidateId: identity(
      "catalog-application-candidate://abiogenesis",
      applicationCandidateDigest,
    ),
    applicationCandidateDigest,
    ...body,
  }) as CatalogApplicationCandidate;
  catalogApplicationCandidates.add(candidate);
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

export function catalogApplicationContentDigest(
  application: Omit<
    CatalogApplicationCandidate,
    "kind" | "schemaVersion" | "disposition" | "applicationCandidateId" | "applicationCandidateDigest"
  >,
): Sha256Digest {
  return sha256Canonical(application as unknown as JsonValue);
}
