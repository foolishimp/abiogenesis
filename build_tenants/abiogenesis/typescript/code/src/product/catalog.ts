import type { ModulePublication } from "../gtl/contracts.js";
import type {
  ProgramValidation,
  PublicationValidation,
} from "../validator/validation.js";
import {
  isProgramValidation,
  isPublicationValidation,
} from "../validator/validation.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  ResolvedProductLock,
  WorkspaceBinding,
} from "./environment.js";
import { resolveExactMatch } from "./exact_match.js";
import { modulePublicationSemanticDigest } from "./publication.js";

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
  readonly readinessPrerequisiteRefs: readonly string[];
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

export type CatalogApplicationVariant = "node_type" | "overlay";

export interface CatalogApplicationCandidateScope {
  readonly kind: "catalog_application_candidate_scope";
}

export type CatalogNodeTypeTargetInput =
  | Readonly<{
      readonly kind: "program";
      readonly programRef: string;
    }>
  | Readonly<{
      readonly kind: "node";
      readonly programRef: string;
      readonly graphFunctionRef: string;
      readonly nodeRef: string;
    }>;

export type CatalogNodeTypeTarget =
  | Readonly<{
      readonly kind: "program";
      readonly targetRef: string;
      readonly targetDigest: Sha256Digest;
      readonly programRef: string;
    }>
  | Readonly<{
      readonly kind: "node";
      readonly targetRef: string;
      readonly targetDigest: Sha256Digest;
      readonly programRef: string;
      readonly graphFunctionRef: string;
      readonly nodeRef: string;
    }>;

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
  readonly applicationVariant: CatalogApplicationVariant;
  readonly validationReceiptRef: string;
  readonly validationReceiptDigest: Sha256Digest;
  readonly validatingInstallId: string;
  readonly validatingProductId: string;
  readonly validatingArtifactDigest: Sha256Digest;
  readonly validatingProductContentDigest: Sha256Digest;
  readonly validatingManifestDigest: Sha256Digest;
  readonly validatingPublicationDigest: Sha256Digest;
  readonly appliedHandle: string;
  readonly appliedValueRef: string;
  readonly appliedValueDigest: Sha256Digest;
  readonly appliedValue: JsonValue;
  readonly contributorKind: "host" | "product";
  readonly contributorRef: string;
  readonly contributorAuthorityKind:
    | "installed_product_attestation"
    | "trusted_developer_attribution";
  readonly contributorAuthorityRef: string;
  readonly contributorProvenanceRefs: readonly string[];
  readonly contributionKind: "node_type" | "overlay";
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly moduleRef: string;
  readonly programMembershipRefs: readonly string[];
  readonly nodeTypeTarget: CatalogNodeTypeTarget | null;
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

export interface CatalogConstructionRefusal {
  readonly kind: "catalog_construction_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "application_not_supported"
    | "invalid_application_binding"
    | "invalid_application_contributor"
    | "invalid_application_receipt"
    | "invalid_application_target"
    | "invalid_application_variant"
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
  const productLockRowMatch = resolveExactMatch(
    lock.rows,
    (row) => row.productId === publication.owningProductId,
  );
  if (
    productLockRowMatch.kind !== "one" ||
    productLockRowMatch.value.artifactDigest !== publication.artifactDigest ||
    productLockRowMatch.value.productContentDigest !==
      publication.productContentDigest ||
    productLockRowMatch.value.manifestDigest !==
      publication.productManifestDigest ||
    productLockRowMatch.value.descriptorRef !== publication.descriptorRef ||
    productLockRowMatch.value.contributionManifestRef !==
      publication.contributionManifestRef
  ) {
    return refusal("publication_not_bound", "module publication is not carried by the exact bound Product lock");
  }
  const productLockRow = productLockRowMatch.value;
  const publicationBinding = resolveExactMatch(
    productLockRow.contributionManifest.publicationBindings,
    (binding) => binding.moduleRef === publication.moduleRef,
  );
  if (
    publicationBinding.kind !== "one" ||
    publicationBinding.value.publicationDigest !==
      modulePublicationSemanticDigest(publication)
  ) {
    return refusal(
      "publication_not_bound",
      "complete module publication differs from publisher-authored Product truth",
    );
  }
  const declaredContributionRows =
    productLockRow.contributionManifest.rows.filter(
      (row) => row.moduleRef === publication.moduleRef,
    );
  if (
    declaredContributionRows.length !== publication.contributions.length ||
    publication.contributions.some((contribution) => {
      const matches = declaredContributionRows.filter(
        (row) => row.handle === contribution.handle,
      );
      if (matches.length !== 1) return true;
      const declared = matches[0]!;
      return declared.kind !== contribution.kind ||
        declared.declarationOrContractRef !==
          contribution.declarationOrContractRef ||
        declared.owningProductId !== contribution.owningProductId ||
        declared.provenanceRef !== productLockRow.provenanceRef ||
        canonicalJson(declared.programMembershipRefs as unknown as JsonValue) !==
          canonicalJson(
            contribution.programMembershipRefs as unknown as JsonValue,
          ) ||
        canonicalJson(declared.compatibilityRefs as unknown as JsonValue) !==
          canonicalJson(contribution.compatibilityRefs as unknown as JsonValue) ||
        declared.compatibilityRefs.some(
          (compatibilityRef) =>
            !productLockRow.compatibilityRefs.includes(compatibilityRef),
        ) ||
        canonicalJson(
          declared.readinessPrerequisiteRefs as unknown as JsonValue,
        ) !== canonicalJson(
          contribution.readinessPrerequisiteRefs as unknown as JsonValue,
        ) ||
        canonicalJson(
          contribution.provenanceRefs as unknown as JsonValue,
        ) !== canonicalJson([
          productLockRow.artifactDigest,
          productLockRow.manifestDigest,
        ]);
    })
  ) {
    return refusal(
      "publication_not_bound",
      "module publication contributions differ from publisher-authored Product truth",
    );
  }
  const publicationDigest = sha256Canonical(publication as unknown as JsonValue);
  const validationMatches = publication.programs.map((program) =>
    resolveExactMatch(
      programValidations,
      (validation) => validation.programRef === program.programRef,
    )
  );
  if (
    !isPublicationValidation(publicationValidation) ||
    programValidations.some((validation) => !isProgramValidation(validation)) ||
    new Set(programValidations.map((validation) => validation.programRef)).size !== programValidations.length ||
    publicationValidation.disposition !== "valid" ||
    publicationValidation.publicationDigest !== publicationDigest ||
    publicationValidation.moduleRef !== publication.moduleRef ||
    publication.programs.length !== programValidations.length ||
    validationMatches.some(
      (match) =>
        match.kind !== "one" ||
        match.value.publicationDigest !== publicationDigest,
    )
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
      readinessPrerequisiteRefs: contribution.readinessPrerequisiteRefs,
      readiness: "ready" as const,
      eligibility: "eligible" as const,
      callability: contribution.kind === "graph_function" ? "callable" as const : "non_callable" as const,
      sessionVisibility: "workspace" as const,
      compatibilityDisposition: "compatible" as const,
      compatibilityRefs: contribution.compatibilityRefs,
      provenanceRefs: [
        productLockRow.provenanceRef,
        productLockRow.descriptorRef,
        productLockRow.contributionManifestRef,
        productLockRow.contributionManifestDigest,
        productLockRow.artifactDigest,
        productLockRow.manifestDigest,
      ],
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
  const rowMatches = allowlist.map((handle) => ({
    handle,
    match: resolveExactMatch(
      catalog.rows,
      (row) => row.handle === handle,
    ),
  }));
  const unresolved = rowMatches.find(({ match }) => match.kind !== "one");
  if (unresolved !== undefined) {
    return refusal(
      "unknown_allowlist_entry",
      unresolved.match.kind === "absent"
        ? `unknown catalog allowlist handle ${unresolved.handle}`
        : `ambiguous catalog allowlist handle ${unresolved.handle}`,
    );
  }
  const selectedRows = rowMatches.map(({ match }) => {
    if (match.kind !== "one") {
      throw new TypeError("catalog allowlist resolution changed during construction");
    }
    return match.value;
  });
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

export function catalogApplicationContentDigest(
  application: Omit<
    CatalogApplicationCandidate,
    "kind" | "schemaVersion" | "disposition" | "applicationCandidateId" | "applicationCandidateDigest"
  >,
): Sha256Digest {
  return sha256Canonical(application as unknown as JsonValue);
}
