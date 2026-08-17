import * as Effect from "effect/Effect";

import {
  abandonAbgEventResource,
  acquireAbgEventResource,
  closeAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "../abg/definition_event_resource.js";
import {
  hasAdmittedProductInstall,
  hasAdmittedWorkspaceBinding,
  projectAdmittedProductInstallByAdmissionEventRef,
  projectAdmittedWorkspaceBindingByInvocationRef,
} from "../abg/environment_admission.js";
import { projectExactPrefixArtifactTruth } from "../abg/artifact_truth.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  CatalogContribution,
  ModulePublication,
} from "../gtl/contracts.js";
import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
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
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  OwnerRefusalOf,
  OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type {
  CatalogConstructionRefusal,
  CatalogReadinessBasis,
  CatalogReadinessRowDisposition,
  DeclarationApplication,
  DeclarationCatalogEntry,
  GraphFunctionCatalogView,
  ReadyGraphFunctionCatalog,
} from "./catalog.js";
import {
  admitCatalogAdmissionResult,
  constructCatalogAdmissionConservationWitness,
  CATALOG_OPERATION_CONTRACTS,
  type CatalogAdmissionRow,
  type CatalogInputRowKey,
} from "./catalog_operation_contracts.js";
import {
  CatalogOperationPort,
  type CatalogAdmitPacket,
  type CatalogApplyPacket,
  type CatalogValidationRefusal,
  type CatalogViewPacket,
} from "./catalog_operations.js";
import type {
  ProductContributionManifestRow,
  VerifiedProductArtifact,
} from "./contracts.js";
import {
  isProductInstall,
  isResolvedProductLock,
  productInstallCoordinate,
  type ProductInstall,
  type ResolvedProductLock,
  type WorkspaceBinding,
} from "./environment.js";
import {
  isVerifiedProductArtifact,
  productVerificationCoordinates,
} from "./verify_product.js";
import { modulePublicationSemanticDigest } from "./publication.js";

type AdmitPacket = typeof CATALOG_OPERATION_CONTRACTS.admit;
type ViewPacket = typeof CATALOG_OPERATION_CONTRACTS.view.allowlist;
type NodeTypePacket = typeof CATALOG_OPERATION_CONTRACTS.apply.node_type;
type OverlayPacket = typeof CATALOG_OPERATION_CONTRACTS.apply.overlay;
type ApplyPacket = NodeTypePacket | OverlayPacket;

export interface CatalogAdmissionResourceAssertion {
  readonly kind: "catalog_admission_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
  readonly workspaceBinding: WorkspaceBinding;
  readonly resolvedLock: ResolvedProductLock;
  readonly verifiedProducts: readonly VerifiedProductArtifact[];
  readonly admittedInstalls: readonly ProductInstall[];
  readonly publications: readonly Readonly<ModulePublication>[];
}

export interface CatalogAdmissionResourceReceipt {
  readonly kind: "catalog_admission_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "read_only_unchanged";
  readonly eventResource: AbgEventResourceReceipt;
  readonly workspaceBinding: ReferenceDigest<"WorkspaceBinding">;
  readonly resolvedLock: ReferenceDigest<"ResolvedProductLock">;
  readonly installedProducts: readonly ReferenceDigest<"InstalledProduct">[];
  readonly descriptors: readonly ReferenceDigest<"ProductDescriptor">[];
  readonly contributionManifests:
    readonly ReferenceDigest<"ContributionManifest">[];
  readonly publishedGtl: readonly ReferenceDigest<"ModulePublication">[];
  readonly catalog: ReferenceDigest<"ProductCatalog"> | null;
}

export interface CatalogViewResourceAssertion {
  readonly kind: "catalog_view_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly catalog: ReadyGraphFunctionCatalog;
}

export interface CatalogViewResourceReceipt {
  readonly kind: "catalog_view_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "read_only_unchanged";
  readonly catalog: ReferenceDigest<"ProductCatalog">;
  readonly view: ReferenceDigest<"CatalogView"> | null;
}

export interface CatalogApplicationResourceAssertion {
  readonly kind: "catalog_application_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogRow: DeclarationCatalogEntry;
  readonly catalogView: GraphFunctionCatalogView;
  readonly applicationBasis: ReferenceDigest<"CatalogApplicationBasis">;
  readonly validationReceipt: ReferenceDigest<"ProductValidationReceipt">;
  readonly contributor: ReferenceDigest<"ProductContributorProvenance">;
}

export interface CatalogApplicationResourceReceipt {
  readonly kind: "catalog_application_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "read_only_unchanged";
  readonly catalog: ReferenceDigest<"ProductCatalog">;
  readonly catalogRow: ReferenceDigest<"CatalogContributionRow">;
  readonly catalogView: ReferenceDigest<"CatalogView">;
  readonly applicationBasis: ReferenceDigest<"CatalogApplicationBasis">;
  readonly validationReceipt: ReferenceDigest<"ProductValidationReceipt">;
  readonly contributor: ReferenceDigest<"ProductContributorProvenance">;
  readonly application: ReferenceDigest<"CatalogApplication"> | null;
}

function fault<TPacket extends AdmitPacket | ViewPacket | ApplyPacket>(
  call: DefinitionCall<TPacket, unknown>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<TPacket["definitionKey"]> {
  return definitionFault(call.invocation.definitionKey, stage, code, message);
}

function workspaceCoordinate(
  binding: WorkspaceBinding,
): ReferenceDigest<"WorkspaceBinding"> {
  return reference(binding.bindingId, binding.bindingDigest);
}

function lockCoordinate(
  lock: ResolvedProductLock,
): ReferenceDigest<"ResolvedProductLock"> {
  return reference(lock.lockId, lock.lockDigest);
}

function catalogCoordinate(
  catalog: ReadyGraphFunctionCatalog,
): ReferenceDigest<"ProductCatalog"> {
  return reference(
    `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice("sha256:".length)}`,
    catalog.basisDigest,
  );
}

function viewCoordinate(
  view: GraphFunctionCatalogView,
): ReferenceDigest<"CatalogView"> {
  return reference(
    `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`,
    view.viewDigest,
  );
}

function rowCoordinate(
  row: DeclarationCatalogEntry,
): ReferenceDigest<"CatalogContributionRow"> {
  return reference(row.handle, row.entryDigest);
}

function applicationCoordinate(
  application: DeclarationApplication,
): ReferenceDigest<"CatalogApplication"> {
  return reference(application.applicationRef, application.applicationDigest);
}

function canonicalCoordinates<T>(
  coordinates: readonly ReferenceDigest<T>[],
): readonly ReferenceDigest<T>[] {
  return [...coordinates].sort((left, right) =>
    compareUnicodeCodeUnits(left.ref, right.ref) ||
    compareUnicodeCodeUnits(left.digest, right.digest)
  );
}

function sameCoordinateSet(
  left: readonly ReferenceDigest[],
  right: readonly ReferenceDigest[],
): boolean {
  return sameJson(canonicalCoordinates(left), canonicalCoordinates(right));
}

function publicationCoordinate(
  publication: Readonly<ModulePublication>,
): ReferenceDigest<"ModulePublication"> {
  return reference(
    publication.moduleRef,
    modulePublicationSemanticDigest(publication),
  );
}

function authorityMatchesCatalogBasis(
  slots: Readonly<{
    readonly workspace_binding: ReferenceDigest | null;
    readonly dependency_lock: ReferenceDigest | null;
    readonly product_set: readonly ReferenceDigest[] | null;
  }>,
  basis: CatalogReadinessBasis,
  installedProducts: readonly ReferenceDigest<"InstalledProduct">[],
): boolean {
  return slots.workspace_binding !== null &&
    sameCoordinate(slots.workspace_binding, {
      ref: basis.workspaceBinding.bindingId,
      digest: basis.workspaceBinding.bindingDigest,
    }) &&
    slots.dependency_lock !== null &&
    sameCoordinate(slots.dependency_lock, lockCoordinate(basis.resolvedLock)) &&
    slots.product_set !== null &&
    sameCoordinateSet(
      slots.product_set,
      installedProducts,
    );
}

function candidateCoordinate(
  candidate: CatalogReadinessBasis["installedProducts"][number],
): ReferenceDigest<"InstalledProduct"> {
  return reference(
    candidate.installId,
    sha256Canonical(candidate as unknown as JsonValue),
  );
}

function validateAdmissionStructure(
  call: DefinitionCall<AdmitPacket, CatalogAdmissionResourceAssertion>,
): DefinitionExecutionFault<AdmitPacket["definitionKey"]> | null {
  const resources = call.resources;
  if (
    !isRecord(resources) ||
    !hasExactKeys(resources, [
      "admittedInstalls",
      "eventResource",
      "kind",
      "publications",
      "resolvedLock",
      "schemaVersion",
      "verifiedProducts",
      "workspaceBinding",
    ]) ||
    resources.kind !== "catalog_admission_resource_assertion" ||
    resources.schemaVersion !== "5.0.0" ||
    resources.eventResource.kind !== "reopen_abg_event_resource" ||
    !sameJson(resources, resources) ||
    !isResolvedProductLock(resources.resolvedLock) ||
    !Array.isArray(resources.verifiedProducts) ||
    resources.verifiedProducts.length === 0 ||
    resources.verifiedProducts.some((value) => !isVerifiedProductArtifact(value)) ||
    !Array.isArray(resources.admittedInstalls) ||
    resources.admittedInstalls.length === 0 ||
    resources.admittedInstalls.some((value) =>
      !isProductInstall(value, resources.resolvedLock)
    ) ||
    !Array.isArray(resources.publications) ||
    resources.publications.length === 0 ||
    !isRecord(resources.workspaceBinding) ||
    resources.workspaceBinding.kind !== "workspace_binding" ||
    typeof resources.workspaceBinding.admissionEventRef !== "string"
  ) {
    return fault(
      call,
      "resource_admission",
      "invalid_resource_assertion",
      "catalog admission requires exact admitted environment, Product, GTL, and read-only ABG-prefix resources",
    );
  }
  return null;
}

function reconstructReadinessBasis(
  call: DefinitionCall<AdmitPacket, CatalogAdmissionResourceAssertion>,
  prefix: DurablePrefixCoordinate,
): CatalogReadinessBasis | DefinitionExecutionFault<AdmitPacket["definitionKey"]> {
  const resources = call.resources;
  const truth = projectExactPrefixArtifactTruth(prefix);
  if (truth.kind !== "exact_prefix_artifact_truth_projection") {
    return fault(
      call,
      "resource_admission",
      "environment_prefix_refusal",
      canonicalJson(truth as unknown as JsonValue),
    );
  }
  if (
    !hasAdmittedWorkspaceBinding(truth, resources.workspaceBinding) ||
    resources.admittedInstalls.some((install) =>
      !hasAdmittedProductInstall(truth, install)
    )
  ) {
    return fault(
      call,
      "resource_admission",
      "unadmitted_catalog_basis",
      "catalog readiness resources are absent from the supplied exact ABG environment prefix",
    );
  }
  const workspaceRow = truth.rows.find((row) =>
    row.admissionEventRef === resources.workspaceBinding.admissionEventRef
  );
  const workspace = workspaceRow === undefined
    ? null
    : projectAdmittedWorkspaceBindingByInvocationRef(
        truth,
        workspaceRow.invocationRef,
        resources.resolvedLock,
      );
  const installs = resources.admittedInstalls.map((install) =>
    projectAdmittedProductInstallByAdmissionEventRef(
      truth,
      install.admissionEventRef,
    )
  );
  if (
    workspace === null ||
    !sameJson(workspace.binding, resources.workspaceBinding) ||
    installs.some((value) => value === null) ||
    installs.some((value, index) =>
      !sameJson(value!.install, resources.admittedInstalls[index]) ||
      !sameJson(value!.resolvedLock, resources.resolvedLock)
    )
  ) {
    return fault(
      call,
      "resource_admission",
      "catalog_basis_projection_mismatch",
      "catalog readiness inputs differ from independently reconstructed ABG artifact truth",
    );
  }
  const basis: CatalogReadinessBasis = {
    workspaceBinding: workspace.candidate,
    resolvedLock: resources.resolvedLock,
    verifiedProducts: resources.verifiedProducts,
    installedProducts: installs.map((value) => value!.candidate),
    publications: resources.publications,
  };
  const request = call.invocation.request;
  const descriptors = resources.verifiedProducts.map((verified) =>
    productVerificationCoordinates(verified).descriptor
  );
  const manifests = resources.verifiedProducts.map((verified) =>
    reference<"ContributionManifest">(
      verified.contributionManifestRef,
      verified.contributionManifestDigest,
    )
  );
  if (
    !sameCoordinate(request.workspaceBinding, workspaceCoordinate(resources.workspaceBinding)) ||
    !sameCoordinate(request.resolvedLock, lockCoordinate(resources.resolvedLock)) ||
    !sameCoordinateSet(request.descriptors, descriptors) ||
    !sameCoordinateSet(request.contributionManifests, manifests) ||
    !authorityMatchesCatalogBasis(
      call.invocation.invocationAuthority.slots,
      basis,
      resources.admittedInstalls.map(productInstallCoordinate),
    )
  ) {
    return fault(
      call,
      "resource_admission",
      "resource_relation_mismatch",
      "catalog readiness resources differ from the admitted request or invocation authority",
    );
  }
  return basis;
}

function catalogRefusal(
  code: OwnerRefusalOf<AdmitPacket>["code"],
  issuePath: string,
): OwnerSemanticOutput<AdmitPacket> {
  return validatedOwnerOutput(CATALOG_OPERATION_CONTRACTS.admit, {
    outcomeKind: "refusal",
    value: { code, issuePaths: [issuePath], evidenceRefs: [] },
  } as OwnerSemanticOutput<AdmitPacket>, "Product catalog admission");
}

function projectCatalogRefusal(
  refusal: CatalogConstructionRefusal | CatalogValidationRefusal,
): OwnerSemanticOutput<AdmitPacket> {
  if (refusal.kind === "catalog_validation_refusal") {
    return catalogRefusal("malformed_contribution", "/contributionManifests");
  }
  switch (refusal.code) {
    case "binding_lock_mismatch":
      return catalogRefusal("binding_mismatch", "/workspaceBinding");
    case "verified_product_mismatch":
      return catalogRefusal("malformed_descriptor", "/descriptors");
    case "installed_product_mismatch":
      return catalogRefusal("binding_mismatch", "/workspaceBinding");
    case "publication_not_bound":
    case "publication_owner_mismatch":
    case "graph_function_definition_missing":
    case "invalid_program_membership":
      return catalogRefusal("malformed_contribution", "/contributionManifests");
    case "canonical_handle_collision":
    case "duplicate_contribution_reference":
    case "duplicate_allowlist_entry":
    case "publication_identity_collision":
    case "unresolved_readiness_prerequisite":
    case "unknown_allowlist_entry":
      return catalogRefusal("conservation_failure", "/contributionManifests");
  }
}

const REASON_PATH = {
  publication_identity_mismatch: "/descriptors",
  manifest_row_absent: "/contributionManifests",
  manifest_or_provenance_mismatch: "/contributionManifests",
  compatibility_mismatch: "/resolvedLock",
  canonical_handle_conflict: "/contributionManifests",
  manifest_row_ambiguous: "/contributionManifests",
  readiness_declaration_mismatch: "/contributionManifests",
  missing_readiness_prerequisite: "/contributionManifests",
  publication_owner_unresolved: "/resolvedLock",
} as const;

function inputRow(
  verified: VerifiedProductArtifact,
  row: ProductContributionManifestRow,
): Readonly<{
  key: CatalogInputRowKey;
  coordinate: ReferenceDigest<"CatalogContributionManifestRow">;
}> {
  const rowDigest = sha256Canonical(row as unknown as JsonValue);
  const coordinate = reference<"CatalogContributionManifestRow">(
    `catalog-contribution-row://abiogenesis/${rowDigest.slice("sha256:".length)}`,
    rowDigest,
  );
  const descriptor = productVerificationCoordinates(verified).descriptor;
  return {
    key: {
      descriptorRef: descriptor.ref,
      descriptorDigest: descriptor.digest,
      contributionManifestRef: verified.contributionManifestRef,
      contributionManifestDigest: verified.contributionManifestDigest,
      contributionRowRef: coordinate.ref,
      contributionRowDigest: coordinate.digest,
    },
    coordinate,
  };
}

function dispositionRow(
  catalog: ReadyGraphFunctionCatalog,
  publication: Readonly<ModulePublication>,
  contribution: Readonly<CatalogContribution>,
): CatalogReadinessRowDisposition {
  const rows = catalog.rowDispositions.filter((row) =>
    row.handle === contribution.handle &&
    row.moduleRef === publication.moduleRef &&
    row.owningProductId === contribution.owningProductId
  );
  if (rows.length !== 1) {
    throw new TypeError("catalog owner omitted or duplicated an input row disposition");
  }
  return rows[0]!;
}

function projectAdmissionRows(
  resources: CatalogAdmissionResourceAssertion,
  catalog: ReadyGraphFunctionCatalog,
): readonly CatalogAdmissionRow[] | null {
  const rows: CatalogAdmissionRow[] = [];
  for (const verified of resources.verifiedProducts) {
    for (const manifestRow of verified.contributionManifest.rows) {
      const publications = resources.publications.filter((publication) =>
        publication.moduleRef === manifestRow.moduleRef &&
        publication.owningProductId === manifestRow.owningProductId
      );
      if (publications.length !== 1) return null;
      const publication = publications[0]!;
      const contributions = publication.contributions.filter((contribution) =>
        contribution.handle === manifestRow.handle &&
        contribution.owningProductId === manifestRow.owningProductId
      );
      if (contributions.length !== 1) return null;
      const contribution = contributions[0]!;
      const input = inputRow(verified, manifestRow);
      const disposition = dispositionRow(catalog, publication, contribution);
      const entry = [...catalog.entries, ...catalog.declarationEntries].find(
        (candidate) =>
          candidate.handle === contribution.handle &&
          candidate.moduleRef === publication.moduleRef &&
          candidate.owningProductId === contribution.owningProductId,
      );
      const subject = entry === undefined
        ? input.coordinate
        : reference(entry.handle, entry.entryDigest);
      const common = {
        inputRowKey: input.key,
        subject,
        readinessBasis: reference(
          `catalog-readiness-basis://abiogenesis/${catalog.readinessBasisDigest.slice("sha256:".length)}`,
          catalog.readinessBasisDigest,
        ),
        evidence: [
          workspaceCoordinate(resources.workspaceBinding),
          lockCoordinate(resources.resolvedLock),
          productInstallCoordinate(
            resources.admittedInstalls.find((install) =>
              install.productId === publication.owningProductId
            )!,
          ),
        ],
        provenance: [productVerificationCoordinates(verified).provenance],
      };
      if (disposition.disposition === "admitted") {
        rows.push(deepFreeze({ disposition: "admitted" as const, ...common }));
        continue;
      }
      const reasonCode = disposition.reason?.split(":", 1)[0] as
        keyof typeof REASON_PATH | undefined;
      if (reasonCode === undefined || !(reasonCode in REASON_PATH)) {
        throw new TypeError("catalog owner returned an unknown row-disposition reason");
      }
      rows.push(deepFreeze({
        disposition: disposition.disposition,
        ...common,
        reason: { code: reasonCode, issuePaths: [REASON_PATH[reasonCode]] },
      }) as CatalogAdmissionRow);
    }
  }
  return rows.length === catalog.rowDispositions.length ? rows : null;
}

function admissionReceipt(
  resources: CatalogAdmissionResourceAssertion,
  eventResource: AbgEventResourceReceipt,
  catalog: ReadyGraphFunctionCatalog | null,
): CatalogAdmissionResourceReceipt {
  return deepFreeze({
    kind: "catalog_admission_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "read_only_unchanged" as const,
    eventResource,
    workspaceBinding: workspaceCoordinate(resources.workspaceBinding),
    resolvedLock: lockCoordinate(resources.resolvedLock),
    installedProducts: resources.admittedInstalls.map(productInstallCoordinate),
    descriptors: resources.verifiedProducts.map((verified) =>
      productVerificationCoordinates(verified).descriptor
    ),
    contributionManifests: resources.verifiedProducts.map((verified) =>
      reference(verified.contributionManifestRef, verified.contributionManifestDigest)
    ),
    publishedGtl: resources.publications.map(publicationCoordinate),
    catalog: catalog === null ? null : catalogCoordinate(catalog),
  });
}

const admit: ExactDefinitionCallable<
  AdmitPacket,
  CatalogAdmissionResourceAssertion,
  CatalogAdmissionResourceReceipt
> = (call) => {
  const structuralFault = validateAdmissionStructure(call);
  if (structuralFault !== null) return Effect.fail(structuralFault);
  return Effect.try({
    try: (): DefinitionReturn<AdmitPacket, CatalogAdmissionResourceReceipt> => {
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      if (acquired.kind !== "acquired_abg_event_resource") {
        throw fault(call, "resource_acquisition", acquired.code, acquired.message);
      }
      const resource = acquired.resource;
      try {
        const basis = reconstructReadinessBasis(call, resource.entryPrefix);
        if (isDefinitionFault(basis)) throw basis;
        const nativePacket: CatalogAdmitPacket = {
          kind: "catalog_admit_packet",
          schemaVersion: "5.0.0",
          memberKey: "admit",
          readinessBasis: basis,
        };
        const native = CatalogOperationPort.admit(nativePacket);
        if (native.kind !== "graph_function_catalog") {
          return deepFreeze({
            ownerOutput: projectCatalogRefusal(native),
            resources: admissionReceipt(
              call.resources,
              closeAbgEventResource(resource, resource.entryPrefix),
              null,
            ),
          });
        }
        const rows = projectAdmissionRows(call.resources, native);
        if (rows === null) {
          return deepFreeze({
            ownerOutput: catalogRefusal(
              "conservation_failure",
              "/contributionManifests",
            ),
            resources: admissionReceipt(
              call.resources,
              closeAbgEventResource(resource, resource.entryPrefix),
              null,
            ),
          });
        }
        const inputKeys = rows.map((row) => row.inputRowKey);
        const candidate = {
          catalog: catalogCoordinate(native),
          rows,
          conservation: constructCatalogAdmissionConservationWitness(inputKeys),
        };
        const admitted = admitCatalogAdmissionResult(inputKeys, candidate);
        if (admitted.disposition !== "admitted") {
          throw fault(
            call,
            "owner_projection",
            "catalog_conservation_failure",
            canonicalJson(admitted.issuePaths as unknown as JsonValue),
          );
        }
        const ownerOutput = validatedOwnerOutput(
          CATALOG_OPERATION_CONTRACTS.admit,
          { outcomeKind: "result", value: admitted.value },
          "Product catalog admission",
        );
        return deepFreeze({
          ownerOutput,
          resources: admissionReceipt(
            call.resources,
            closeAbgEventResource(resource, resource.entryPrefix),
            native,
          ),
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<AdmitPacket["definitionKey"]>
      : fault(
          call,
          "owner_execution",
          "catalog_admission_execution_failure",
          String(cause),
        ),
  });
};

function reconstructCatalog(
  candidate: ReadyGraphFunctionCatalog,
): ReadyGraphFunctionCatalog | null {
  if (
    !isRecord(candidate) ||
    candidate.kind !== "graph_function_catalog" ||
    !isRecord(candidate.readinessBasis)
  ) return null;
  const reconstructed = CatalogOperationPort.admit({
    kind: "catalog_admit_packet",
    schemaVersion: "5.0.0",
    memberKey: "admit",
    readinessBasis: candidate.readinessBasis,
  });
  return reconstructed.kind === "graph_function_catalog" &&
      sameJson(reconstructed, candidate)
    ? reconstructed
    : null;
}

function viewRefusal(
  code: OwnerRefusalOf<ViewPacket>["code"],
): OwnerSemanticOutput<ViewPacket> {
  return validatedOwnerOutput(CATALOG_OPERATION_CONTRACTS.view.allowlist, {
    outcomeKind: "refusal",
    value: { code, issuePaths: ["/allowlist"], evidenceRefs: [] },
  } as OwnerSemanticOutput<ViewPacket>, "Product catalog view");
}

const allowlist: ExactDefinitionCallable<
  ViewPacket,
  CatalogViewResourceAssertion,
  CatalogViewResourceReceipt
> = (call) => Effect.try({
  try: (): DefinitionReturn<ViewPacket, CatalogViewResourceReceipt> => {
    const resources = call.resources;
    if (
      !isRecord(resources) ||
      !hasExactKeys(resources, ["catalog", "kind", "schemaVersion"]) ||
      resources.kind !== "catalog_view_resource_assertion" ||
      resources.schemaVersion !== "5.0.0" ||
      !sameJson(resources, resources)
    ) {
      throw fault(call, "resource_admission", "invalid_resource_assertion", "catalog view requires one exact immutable catalog resource");
    }
    const catalog = reconstructCatalog(resources.catalog);
    if (
      catalog === null ||
      !sameCoordinate(call.invocation.request.catalog, catalogCoordinate(catalog)) ||
      !authorityMatchesCatalogBasis(
        call.invocation.invocationAuthority.slots,
        catalog.readinessBasis,
        catalog.readinessBasis.installedProducts.map(candidateCoordinate),
      )
    ) {
      throw fault(call, "resource_admission", "resource_relation_mismatch", "catalog view resource differs from the admitted request or invocation authority");
    }
    const nativePacket: CatalogViewPacket = {
      kind: "catalog_view_packet",
      schemaVersion: "5.0.0",
      memberKey: "allowlist",
      catalog,
      allowlist: call.invocation.request.allowlist,
    };
    const native = CatalogOperationPort.constructView(nativePacket);
    if (native.kind !== "graph_function_catalog_view") {
      const code = native.code === "unknown_allowlist_entry"
        ? "unknown"
        : native.code === "duplicate_allowlist_entry"
        ? "duplicate"
        : "inadmissible";
      return deepFreeze({
        ownerOutput: viewRefusal(code),
        resources: {
          kind: "catalog_view_resource_receipt",
          schemaVersion: "5.0.0",
          disposition: "read_only_unchanged",
          catalog: catalogCoordinate(catalog),
          view: null,
        },
      });
    }
    const ownerOutput = validatedOwnerOutput(
      CATALOG_OPERATION_CONTRACTS.view.allowlist,
      {
        outcomeKind: "result",
        value: {
          view: viewCoordinate(native),
          effectiveHandles: [...native.allowlist],
          residuals: [],
        },
      },
      "Product catalog view",
    );
    return deepFreeze({
      ownerOutput,
      resources: {
        kind: "catalog_view_resource_receipt",
        schemaVersion: "5.0.0",
        disposition: "read_only_unchanged",
        catalog: catalogCoordinate(catalog),
        view: viewCoordinate(native),
      },
    });
  },
  catch: (cause) => isDefinitionFault(cause)
    ? cause as DefinitionExecutionFault<ViewPacket["definitionKey"]>
    : fault(call, "owner_execution", "catalog_view_execution_failure", String(cause)),
});

function reconstructCatalogView(
  catalogCandidate: ReadyGraphFunctionCatalog,
  viewCandidate: GraphFunctionCatalogView,
): Readonly<{
  catalog: ReadyGraphFunctionCatalog;
  view: GraphFunctionCatalogView;
}> | null {
  const catalog = reconstructCatalog(catalogCandidate);
  if (catalog === null || !isRecord(viewCandidate)) return null;
  const view = CatalogOperationPort.constructView({
    kind: "catalog_view_packet",
    schemaVersion: "5.0.0",
    memberKey: "allowlist",
    catalog,
    allowlist: viewCandidate.allowlist,
  });
  return view.kind === "graph_function_catalog_view" &&
      sameJson(view, viewCandidate)
    ? { catalog, view }
    : null;
}

function applyRefusal<TPacket extends ApplyPacket>(
  packet: TPacket,
  code: OwnerRefusalOf<TPacket>["code"],
  issuePath: string,
): OwnerSemanticOutput<TPacket> {
  return validatedOwnerOutput(packet, {
    outcomeKind: "refusal",
    value: { code, issuePaths: [issuePath], evidenceRefs: [] },
  } as OwnerSemanticOutput<TPacket>, "Product catalog application");
}

function applyReceipt(
  resources: CatalogApplicationResourceAssertion,
  application: DeclarationApplication | null,
): CatalogApplicationResourceReceipt {
  return deepFreeze({
    kind: "catalog_application_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "read_only_unchanged" as const,
    catalog: catalogCoordinate(resources.catalog),
    catalogRow: rowCoordinate(resources.catalogRow),
    catalogView: viewCoordinate(resources.catalogView),
    applicationBasis: resources.applicationBasis,
    validationReceipt: resources.validationReceipt,
    contributor: resources.contributor,
    application: application === null ? null : applicationCoordinate(application),
  });
}

function createApplyBinding<TPacket extends ApplyPacket>(
  packet: TPacket,
): ExactDefinitionCallable<
  TPacket,
  CatalogApplicationResourceAssertion,
  CatalogApplicationResourceReceipt
> {
  return (call) => Effect.try({
    try: (): DefinitionReturn<TPacket, CatalogApplicationResourceReceipt> => {
      const resources = call.resources;
      const request = call.invocation.request;
      if (
        !isRecord(resources) ||
        !hasExactKeys(resources, [
          "applicationBasis",
          "catalog",
          "catalogRow",
          "catalogView",
          "contributor",
          "kind",
          "schemaVersion",
          "validationReceipt",
        ]) ||
        resources.kind !== "catalog_application_resource_assertion" ||
        resources.schemaVersion !== "5.0.0" ||
        !sameJson(resources, resources)
      ) {
        throw fault(call, "resource_admission", "invalid_resource_assertion", "catalog application requires exact immutable catalog, view, row, application, validation, and contributor resources");
      }
      const reconstructed = reconstructCatalogView(
        resources.catalog,
        resources.catalogView,
      );
      if (
        reconstructed === null ||
        resources.catalogRow.declarationKind !== request.applicationKind ||
        !sameCoordinate(request.catalogRow, rowCoordinate(resources.catalogRow)) ||
        !sameCoordinate(request.catalogView, viewCoordinate(resources.catalogView)) ||
        request.declaration.ref !== resources.catalogRow.declarationOrContractRef ||
        request.declaration.digest !== resources.catalogRow.entryDigest ||
        !sameCoordinate(request.applicationBasis, resources.applicationBasis) ||
        !sameCoordinate(request.validationReceipt, resources.validationReceipt) ||
        !sameCoordinate(request.contributor, resources.contributor) ||
        !sameJson(
          reconstructed.view.declarationsByHandle[resources.catalogRow.handle],
          resources.catalogRow,
        )
      ) {
        throw fault(call, "resource_admission", "resource_relation_mismatch", "catalog application resources differ from the admitted request or exact CatalogView row");
      }
      const catalogScope = call.invocation.invocationAuthority.slots.catalog_scope;
      if (
        catalogScope === null ||
        !("view" in catalogScope) ||
        !sameCoordinate(
          catalogScope.catalog,
          catalogCoordinate(reconstructed.catalog),
        ) ||
        !sameCoordinate(catalogScope.view, viewCoordinate(reconstructed.view)) ||
        !sameJson(catalogScope.allowlist, reconstructed.view.allowlist)
      ) {
        throw fault(call, "resource_admission", "catalog_scope_mismatch", "catalog application resources differ from invocation catalog authority");
      }
      const nativePacket: CatalogApplyPacket = {
        kind: "catalog_apply_packet",
        schemaVersion: "5.0.0",
        memberKey: request.applicationKind,
        catalogView: reconstructed.view,
        application: {
          applicationKind: request.applicationKind,
          handle: resources.catalogRow.handle,
          targetRef: request.target === null
            ? resources.contributor.ref
            : request.target.ref,
          targetDigest: request.target === null
            ? resources.contributor.digest
            : request.target.digest,
          appliedValueRef: resources.applicationBasis.ref,
          appliedValueDigest: resources.applicationBasis.digest,
        },
      };
      const native = CatalogOperationPort.apply(nativePacket);
      if (native.kind !== "declaration_application") {
        return deepFreeze({
          ownerOutput: applyRefusal(
            packet,
            native.code === "kind_mismatch" ? "kind_mismatch" : "view_mismatch",
            native.code === "kind_mismatch" ? "/applicationKind" : "/catalogView",
          ),
          resources: applyReceipt(resources, null),
        });
      }
      const evidence = sameCoordinate(
          resources.validationReceipt,
          resources.applicationBasis,
        )
        ? [resources.validationReceipt]
        : [resources.validationReceipt, resources.applicationBasis];
      const ownerOutput = validatedOwnerOutput(packet, {
        outcomeKind: "result",
        value: {
          applicationKind: request.applicationKind,
          application: applicationCoordinate(native),
          target: request.target,
          evidence,
          provenance: [resources.contributor],
        },
      } as OwnerSemanticOutput<TPacket>, "Product catalog application");
      return deepFreeze({
        ownerOutput,
        resources: applyReceipt(resources, native),
      });
    },
    catch: (cause) => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<TPacket["definitionKey"]>
      : fault(call, "owner_execution", "catalog_application_execution_failure", String(cause)),
  });
}

const node_type = createApplyBinding(CATALOG_OPERATION_CONTRACTS.apply.node_type);
const overlay = createApplyBinding(CATALOG_OPERATION_CONTRACTS.apply.overlay);

export const CATALOG_DEFINITION_BINDINGS = Object.freeze({
  admit,
  view: Object.freeze({ allowlist }),
  apply: Object.freeze({ node_type, overlay }),
});
