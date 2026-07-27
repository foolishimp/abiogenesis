import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type {
  ModulePublication,
  ProductSemanticsBinding,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isNonBlankRef } from "../shared/references.js";
import type {
  ProductInstall,
  ResolvedProductLock,
  WorkspaceBinding,
} from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";
import type {
  AdmittedCatalog,
  CatalogApplication,
  CatalogApplicationCandidate,
  CatalogApplicationCandidateScope,
  CatalogApplicationCandidateResult,
  CatalogApplicationVariant,
  CatalogConstructionRefusal,
  CatalogNodeTypeTarget,
  CatalogNodeTypeTargetInput,
  CatalogView,
} from "./catalog.js";

export interface ProductInvocationSourceResultBasis {
  readonly kind: "invocation_source_result_basis";
  readonly schemaVersion: "5.0.0";
  readonly basisRef: string;
  readonly basisDigest: Sha256Digest;
  readonly publicAuthorityDigest: Sha256Digest;
  readonly sourceInvocationAdmissionRef: string;
  readonly sourceInvocationRef: string;
  readonly sourceRunId: string;
  readonly sourceGraphCallId: string;
  readonly sourceGraphFunctionRef: string;
  readonly sourceCCallRef: string;
  readonly sourceResultAdmissionEventRef: string;
  readonly sourceResultJudgmentEventRef: string;
  readonly sourceResultRef: string;
  readonly sourceResultDigest: Sha256Digest;
  readonly sourceResultValueDigest: Sha256Digest;
  readonly sourceResultContractRef: string;
  readonly sourceResultValue: JsonValue;
  readonly sourceReplayRef: string;
  readonly sourceReplayDigest: Sha256Digest;
  readonly sourceWorkspaceId: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
}

export interface ProductPublicResultProjection {
  readonly kind: "product_public_result_projection";
  readonly schemaVersion: "5.0.0";
  readonly contractRef: string;
  readonly value: JsonValue;
}

export interface ProductSemanticsProvider {
  readonly kind: "product_semantics_provider";
  readonly schemaVersion: "5.0.0";
  readonly bindingRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly publicResultProjectionKinds?: readonly string[];
  readonly admitInput: (
    contractRef: string,
    value: unknown,
  ) => Readonly<Record<string, JsonValue>> | null;
  readonly evaluateInteractionResponse: (
    basis: Readonly<{
      readonly requestContractRef: string;
      readonly responseContractRef: string;
      readonly requestValue: Readonly<Record<string, JsonValue>>;
      readonly actingActorRef: string;
      readonly constructionIntent: Readonly<Record<string, JsonValue>> | null;
      readonly nextActionBasis: Readonly<Record<string, JsonValue>> | null;
    }>,
    responseCandidate: unknown,
  ) => Readonly<Record<string, JsonValue>> | null;
  readonly validateContractValue: (
    valueKind: string,
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly resolveJudgmentRelation: (
    predicateRef: string,
  ) => Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown) => boolean;
  }> | null;
  readonly resolveCatalogApplicationValue?: (
    basis: Readonly<{
      readonly contractRef: string;
      readonly value: Readonly<Record<string, JsonValue>>;
    }>,
  ) => Readonly<{
    readonly valueRef: string;
    readonly programMembershipRefs: readonly string[];
    readonly productContributorAttestation?: Readonly<{
      readonly contributorRef: string;
      readonly attestationRef: string;
    }>;
  }> | null;
  readonly validateResultEvidenceLineage?: (
    basis: Readonly<{
      readonly outputContractRef: string;
      readonly value: Readonly<Record<string, JsonValue>>;
      readonly admittedEvidence: readonly Readonly<
        Record<string, JsonValue>
      >[];
    }>,
  ) => boolean;
  readonly resolveProbabilisticWorkerContracts?: (
    basis: Readonly<{
      readonly inputContractRef: string;
      readonly outputContractRef: string;
      readonly input: Readonly<Record<string, JsonValue>>;
    }>,
  ) => Readonly<{
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
  }> | null;
  readonly validateInvocationBasis?: (
    basis: Readonly<{
      readonly input: Readonly<Record<string, JsonValue>>;
      readonly workspaceBindingId: string;
      readonly workspaceBindingDigest: Sha256Digest;
      readonly workspaceId: string;
      readonly actionCatalog: JsonValue | null;
      readonly catalogView: CatalogView;
      readonly catalogApplications: readonly CatalogApplication[];
      readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
    }>,
  ) => boolean;
  readonly projectPublicResult?: (
    basis: Readonly<{
      readonly value: JsonValue;
      readonly admittedResultRef: string;
      readonly admittedResultContractRef: string;
      readonly replayRef: string;
      readonly projectionKind: string;
    }>,
  ) => ProductPublicResultProjection | null;
}

interface InstalledProductSemanticsBasisCommon {
  readonly install: ProductInstall;
  readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
}

export type InstalledProductSemanticsBasis =
  InstalledProductSemanticsBasisCommon &
    (
      | {
          readonly publication: Readonly<ModulePublication>;
        }
      | {
          readonly publicationDigest: Sha256Digest;
          readonly productSemanticsBinding:
            Readonly<ProductSemanticsBinding>;
        }
    );

export interface InstalledLeafSemanticsProjection {
  readonly kind: "installed_leaf_semantics_projection";
  readonly schemaVersion: "5.0.0";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly installId: string;
  readonly productContentDigest: Sha256Digest;
  readonly manifestDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly bindingRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
}

interface InstalledLeafSemanticsRuntime {
  readonly verifyInstalledContent: () => Promise<boolean>;
  readonly validateContractValue: (
    valueKind: string,
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly resolveJudgmentRelation: (
    predicateRef: string,
  ) => Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown) => boolean;
  }> | null;
  readonly validateResultEvidenceLineage: (
    basis: Readonly<{
      readonly outputContractRef: string;
      readonly value: Readonly<Record<string, JsonValue>>;
      readonly admittedEvidence: readonly Readonly<
        Record<string, JsonValue>
      >[];
    }>,
  ) => boolean;
  readonly resolveProbabilisticWorkerContracts: (
    basis: Readonly<{
      readonly inputContractRef: string;
      readonly outputContractRef: string;
      readonly input: Readonly<Record<string, JsonValue>>;
    }>,
  ) => Readonly<{
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
  }> | null;
}

interface LoadedProductSemanticsBasis {
  readonly install: ProductInstall;
  readonly publicationDigest: ReturnType<typeof sha256Canonical>;
  readonly publication: Readonly<ModulePublication> | null;
}

const loadedProductSemantics =
  new WeakMap<object, LoadedProductSemanticsBasis>();
const projectedLeafSemantics =
  new WeakMap<object, InstalledLeafSemanticsRuntime>();
const catalogApplicationCandidates =
  new WeakMap<object, CatalogApplicationCandidateScope>();

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function projectionBody(
  value: Omit<
    InstalledLeafSemanticsProjection,
    "kind" | "projectionDigest" | "projectionRef" | "schemaVersion"
  >,
): JsonValue {
  return value as unknown as JsonValue;
}

function mintInstalledLeafSemanticsProjection(
  basis: Omit<
    InstalledLeafSemanticsProjection,
    "kind" | "projectionDigest" | "projectionRef" | "schemaVersion"
  >,
  runtime: InstalledLeafSemanticsRuntime,
): InstalledLeafSemanticsProjection {
  const projectionDigest = sha256Canonical(projectionBody(basis));
  const projection = Object.freeze({
    kind: "installed_leaf_semantics_projection" as const,
    schemaVersion: "5.0.0" as const,
    projectionRef:
      `leaf-semantics://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
    ...basis,
  });
  projectedLeafSemantics.set(projection, runtime);
  return projection;
}

export function inspectProductLeafSemanticsProjection(
  value: unknown,
): Readonly<{
  projection: InstalledLeafSemanticsProjection;
  runtime: InstalledLeafSemanticsRuntime;
}> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const projection = value as Partial<InstalledLeafSemanticsProjection>;
  const runtime = projectedLeafSemantics.get(value);
  if (
    runtime === undefined ||
    projection.kind !== "installed_leaf_semantics_projection" ||
    projection.schemaVersion !== "5.0.0" ||
    typeof projection.projectionRef !== "string" ||
    typeof projection.projectionDigest !== "string" ||
    typeof projection.installId !== "string" ||
    typeof projection.productContentDigest !== "string" ||
    typeof projection.manifestDigest !== "string" ||
    typeof projection.publicationDigest !== "string" ||
    typeof projection.bindingRef !== "string" ||
    typeof projection.packageName !== "string" ||
    typeof projection.packageVersion !== "string"
  ) {
    return null;
  }
  const expectedDigest = sha256Canonical(projectionBody({
    installId: projection.installId,
    productContentDigest: projection.productContentDigest as Sha256Digest,
    manifestDigest: projection.manifestDigest as Sha256Digest,
    publicationDigest: projection.publicationDigest as Sha256Digest,
    bindingRef: projection.bindingRef,
    packageName: projection.packageName,
    packageVersion: projection.packageVersion,
  }));
  if (
    projection.projectionDigest !== expectedDigest ||
    projection.projectionRef !==
      `leaf-semantics://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return {
    projection: projection as InstalledLeafSemanticsProjection,
    runtime,
  };
}

export async function loadInstalledProductSemantics(
  basis: InstalledProductSemanticsBasis,
): Promise<ProductSemanticsProvider> {
  const binding = "publication" in basis
    ? basis.publication.productSemanticsBinding
    : basis.productSemanticsBinding;
  const publicationDigest = "publication" in basis
    ? sha256Canonical(basis.publication as unknown as JsonValue)
    : basis.publicationDigest;
  if (
    !basis.verifyInstallAdmission(basis.install) ||
    binding.packageName !== basis.install.packageName ||
    binding.packageVersion !== basis.install.packageVersion ||
    !(await installedProductContentMatches(basis.install))
  ) {
    throw new TypeError(
      "Product semantics requires one exact admitted install and publication binding",
    );
  }
  const exactPath = resolve(basis.install.installedRoot, binding.modulePath);
  const relation = relative(basis.install.installedRoot, exactPath);
  if (relation.length === 0 || relation.startsWith("..") || isAbsolute(relation)) {
    throw new TypeError("Product semantics module escapes the admitted Product install");
  }
  const loaded = await import(pathToFileURL(exactPath).href) as Record<string, unknown>;
  const value = loaded[binding.namedSymbol];
  if (
    !isRecord(value) ||
    value.kind !== "product_semantics_provider" ||
    value.schemaVersion !== "5.0.0" ||
    value.bindingRef !== binding.bindingRef ||
    value.packageName !== binding.packageName ||
    value.packageVersion !== binding.packageVersion ||
    typeof value.admitInput !== "function" ||
    typeof value.evaluateInteractionResponse !== "function" ||
    typeof value.validateContractValue !== "function" ||
    typeof value.resolveJudgmentRelation !== "function" ||
    (
      value.resolveCatalogApplicationValue !== undefined &&
      typeof value.resolveCatalogApplicationValue !== "function"
    ) ||
    (
      value.resolveProbabilisticWorkerContracts !== undefined &&
      typeof value.resolveProbabilisticWorkerContracts !== "function"
    ) ||
    (
      value.validateResultEvidenceLineage !== undefined &&
      typeof value.validateResultEvidenceLineage !== "function"
    ) ||
    (
      value.validateInvocationBasis !== undefined &&
      typeof value.validateInvocationBasis !== "function"
    ) ||
    (
      value.projectPublicResult !== undefined &&
      typeof value.projectPublicResult !== "function"
    ) ||
    (
      value.publicResultProjectionKinds !== undefined &&
      (
        !Array.isArray(value.publicResultProjectionKinds) ||
        value.publicResultProjectionKinds.some(
          (kind) =>
            typeof kind !== "string" ||
            kind.trim().length === 0,
        ) ||
        new Set(value.publicResultProjectionKinds).size !==
          value.publicResultProjectionKinds.length
      )
    )
  ) {
    throw new TypeError(
      "installed Product semantics provider differs from its published binding",
    );
  }
  const provider = value as unknown as ProductSemanticsProvider;
  loadedProductSemantics.set(provider, {
    install: basis.install,
    publicationDigest,
    publication: "publication" in basis ? basis.publication : null,
  });
  return provider;
}

export function admitInstalledProductInput(
  semantics: ProductSemanticsProvider,
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  if (!loadedProductSemantics.has(semantics)) {
    throw new TypeError(
      "Product input admission requires the exact loaded Product semantics provider",
    );
  }
  return semantics.admitInput(contractRef, value);
}

function catalogApplicationRefusal(
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

function exactInstallLockRow(
  install: ProductInstall,
  lock: ResolvedProductLock,
): boolean {
  const row = lock.rows.find((candidate) => candidate.installId === install.installId);
  return row !== undefined &&
    row.productId === install.productId &&
    row.packageName === install.packageName &&
    row.packageVersion === install.packageVersion &&
    row.artifactDigest === install.artifactDigest &&
    row.productContentDigest === install.productContentDigest &&
    row.manifestDigest === install.manifestDigest;
}

function isNodeTypeTargetInput(
  value: unknown,
): value is CatalogNodeTypeTargetInput {
  if (!isRecord(value) || (value.kind !== "program" && value.kind !== "node")) {
    return false;
  }
  if (value.kind === "program") {
    return Object.keys(value).sort().join("\0") ===
        ["kind", "programRef"].join("\0") &&
      isNonBlankRef(value.programRef);
  }
  return Object.keys(value).sort().join("\0") ===
      ["graphFunctionRef", "kind", "nodeRef", "programRef"].join("\0") &&
    isNonBlankRef(value.programRef) &&
    isNonBlankRef(value.graphFunctionRef) &&
    isNonBlankRef(value.nodeRef);
}

function resolveNodeTypeTarget(
  publication: Readonly<ModulePublication>,
  catalog: AdmittedCatalog,
  input: unknown,
): CatalogNodeTypeTarget | null {
  if (!isNodeTypeTargetInput(input)) return null;
  const program = publication.programs.find(
    (candidate) => candidate.programRef === input.programRef,
  );
  const validation = catalog.programValidations.find(
    (candidate) => candidate.programRef === input.programRef,
  );
  if (
    program === undefined ||
    validation === undefined ||
    validation.publicationDigest !== catalog.publicationDigest ||
    validation.programDigest !==
      sha256Canonical(program as unknown as JsonValue)
  ) {
    return null;
  }
  if (input.kind === "program") {
    return deepFreeze({
      kind: "program",
      targetRef: program.programRef,
      targetDigest: validation.programDigest,
      programRef: program.programRef,
    });
  }
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === input.graphFunctionRef,
  );
  const node = graphFunction?.template.nodes.find(
    (candidate) => candidate.nodeRef === input.nodeRef,
  );
  const graphFunctionDigest = graphFunction === undefined
    ? null
    : sha256Canonical(graphFunction as unknown as JsonValue);
  if (
    graphFunction === undefined ||
    node === undefined ||
    graphFunctionDigest === null ||
    !program.callableMembership.includes(graphFunction.name) ||
    !validation.graphFunctionDigests.includes(graphFunctionDigest)
  ) {
    return null;
  }
  return deepFreeze({
    kind: "node",
    targetRef: node.nodeRef,
    targetDigest: sha256Canonical(node as unknown as JsonValue),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
    nodeRef: node.nodeRef,
  });
}

export function isCatalogApplicationCandidate(
  value: object,
  scope: CatalogApplicationCandidateScope,
): boolean {
  return catalogApplicationCandidates.get(value) === scope;
}

export function constructCatalogApplicationCandidate(
  semantics: ProductSemanticsProvider,
  basis: Readonly<{
    readonly catalog: AdmittedCatalog;
    readonly view: CatalogView;
    readonly workspaceBinding: WorkspaceBinding;
    readonly lock: ResolvedProductLock;
    readonly handle: string;
    readonly applicationVariant: CatalogApplicationVariant;
    readonly value: unknown;
    readonly contributorRef: string;
    readonly nodeTypeTarget: unknown;
    readonly candidateScope: CatalogApplicationCandidateScope;
  }>,
): CatalogApplicationCandidateResult {
  const loaded = loadedProductSemantics.get(semantics);
  if (loaded === undefined || loaded.publication === null) {
    return catalogApplicationRefusal(
      "invalid_application_receipt",
      "catalog application requires the exact loaded Product semantics and publication",
    );
  }
  const { catalog, view, workspaceBinding, lock } = basis;
  if (
    typeof basis.candidateScope !== "object" ||
    basis.candidateScope === null ||
    basis.candidateScope.kind !== "catalog_application_candidate_scope"
  ) {
    return catalogApplicationRefusal(
      "invalid_application_receipt",
      "catalog application requires one active ABG operation-context candidate scope",
    );
  }
  const row = view.selectedRows.find(
    (candidate) => candidate.handle === basis.handle,
  );
  if (row === undefined) {
    return catalogApplicationRefusal(
      "unknown_allowlist_entry",
      `catalog application handle ${basis.handle} is not present in the admitted view`,
    );
  }
  if (row.disposition !== "admitted") {
    return catalogApplicationRefusal(
      "row_not_admitted",
      "catalog application requires an admitted row",
    );
  }
  if (row.kind === "graph_function") {
    return catalogApplicationRefusal(
      "application_not_supported",
      "GraphFunction rows remain callable through run.invoke and cannot be applied",
    );
  }
  if (
    basis.applicationVariant !== "node_type" &&
    basis.applicationVariant !== "overlay"
  ) {
    return catalogApplicationRefusal(
      "invalid_application_variant",
      "catalog.apply accepts only node_type or overlay",
    );
  }
  if (basis.applicationVariant !== row.kind) {
    return catalogApplicationRefusal(
      "invalid_application_variant",
      "catalog.apply variant differs from the selected contribution kind",
    );
  }
  const publication = loaded.publication;
  const publicationDigest = sha256Canonical(
    publication as unknown as JsonValue,
  );
  if (
    catalog.catalogId !== view.catalogId ||
    catalog.catalogDigest !== view.catalogDigest ||
    catalog.workspaceBindingId !== workspaceBinding.bindingId ||
    catalog.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
    workspaceBinding.lockId !== lock.lockId ||
    workspaceBinding.lockDigest !== lock.lockDigest ||
    catalog.lockId !== lock.lockId ||
    catalog.lockDigest !== lock.lockDigest ||
    publicationDigest !== catalog.publicationDigest ||
    publicationDigest !== loaded.publicationDigest ||
    publication.owningProductId !== row.owningProductId ||
    publication.owningProductId !== loaded.install.productId ||
    publication.moduleRef !== row.moduleRef ||
    !exactInstallLockRow(loaded.install, lock)
  ) {
    return catalogApplicationRefusal(
      "invalid_application_binding",
      "catalog application differs from its admitted workspace, lock, publication, row owner, or installed Product",
    );
  }
  const publishedContribution = publication.contributions.find(
    (candidate) => candidate.handle === row.handle,
  );
  if (
    publishedContribution === undefined ||
    publishedContribution.kind !== row.kind ||
    publishedContribution.declarationOrContractRef !==
      row.declarationOrContractRef ||
    publishedContribution.owningProductId !== row.owningProductId ||
    publishedContribution.programMembershipRefs.join("\0") !==
      row.programMembershipRefs.join("\0")
  ) {
    return catalogApplicationRefusal(
      "invalid_application_binding",
      "catalog application row differs from the exact installed Product publication",
    );
  }
  if (!isRecord(basis.value)) {
    return catalogApplicationRefusal(
      "invalid_application_binding",
      "catalog application requires one concrete object value",
    );
  }
  const admitted = deepFreeze(basis.value) as Readonly<
    Record<string, JsonValue>
  >;
  const projection = semantics.resolveCatalogApplicationValue?.({
    contractRef: row.declarationOrContractRef,
    value: admitted,
  }) ?? null;
  const productContributorAttestation =
    projection?.productContributorAttestation ?? null;
  if (
    projection === null ||
    !isNonBlankRef(projection.valueRef) ||
    projection.programMembershipRefs.some((ref) => !isNonBlankRef(ref)) ||
    new Set(projection.programMembershipRefs).size !==
      projection.programMembershipRefs.length ||
    projection.programMembershipRefs.join("\0") !==
      row.programMembershipRefs.join("\0") ||
    (
      productContributorAttestation !== null &&
      (
        !isNonBlankRef(productContributorAttestation.contributorRef) ||
        !isNonBlankRef(productContributorAttestation.attestationRef)
      )
    )
  ) {
    return catalogApplicationRefusal(
      "invalid_application_binding",
      "catalog application value is not admitted by the exact installed Product contract and Program composition",
    );
  }
  const nodeTypeTarget = row.kind === "node_type"
    ? resolveNodeTypeTarget(publication, catalog, basis.nodeTypeTarget)
    : null;
  if (
    (row.kind === "node_type" && nodeTypeTarget === null) ||
    (row.kind === "overlay" && basis.nodeTypeTarget !== null) ||
    (
      row.kind === "overlay" &&
      (
        row.programMembershipRefs.length === 0 ||
        row.programMembershipRefs.some(
          (programRef) =>
            !publication.programs.some(
              (program) => program.programRef === programRef,
            ),
        )
      )
    )
  ) {
    return catalogApplicationRefusal(
      "invalid_application_target",
      row.kind === "node_type"
        ? "node_type application requires one exact admitted node or Program target"
        : "overlay application requires only its exact published Program composition",
    );
  }
  const validatingLockRow = lock.rows.find(
    (candidate) => candidate.installId === loaded.install.installId,
  )!;
  const contributorKind =
    productContributorAttestation === null &&
      basis.contributorRef === workspaceBinding.authorizedActorRef
      ? "host" as const
      : productContributorAttestation?.contributorRef ===
            loaded.install.productId &&
          basis.contributorRef === loaded.install.productId
      ? "product" as const
      : null;
  if (contributorKind === null) {
    return catalogApplicationRefusal(
      "invalid_application_contributor",
      "catalog application contributor is neither the admitted workspace actor under trusted-developer authority nor attested by the exact row-owning installed Product",
    );
  }
  const contributorRef = contributorKind === "host"
    ? workspaceBinding.authorizedActorRef
    : loaded.install.productId;
  const contributorAuthorityKind = contributorKind === "host"
    ? "trusted_developer_attribution" as const
    : "installed_product_attestation" as const;
  const contributorAuthorityRef = contributorKind === "host"
    ? workspaceBinding.authorityBasisId
    : productContributorAttestation!.attestationRef;
  const contributorProvenanceRefs = contributorKind === "host"
    ? [
        workspaceBinding.authorityBasisId,
        workspaceBinding.bindingId,
      ]
    : [
        lock.lockId,
        validatingLockRow.installId,
        validatingLockRow.artifactDigest,
        validatingLockRow.manifestDigest,
        publication.contributionManifestRef,
        contributorAuthorityRef,
      ];
  const appliedValueDigest = sha256Canonical(
    admitted as unknown as JsonValue,
  );
  const receiptBody = {
    validatingInstallId: loaded.install.installId,
    validatingProductId: loaded.install.productId,
    validatingArtifactDigest: loaded.install.artifactDigest,
    validatingProductContentDigest: loaded.install.productContentDigest,
    validatingManifestDigest: loaded.install.manifestDigest,
    validatingPublicationDigest: publicationDigest,
    catalogId: catalog.catalogId,
    catalogDigest: catalog.catalogDigest,
    viewId: view.viewId,
    viewDigest: view.viewDigest,
    rowHandle: row.handle,
    rowDigest: row.rowDigest,
    applicationVariant: basis.applicationVariant,
    declarationOrContractRef: row.declarationOrContractRef,
    appliedValueRef: projection.valueRef,
    appliedValueDigest,
    contributorKind,
    contributorRef,
    contributorAuthorityKind,
    contributorAuthorityRef,
    contributorProvenanceRefs,
    programMembershipRefs: projection.programMembershipRefs,
    nodeTypeTarget,
  };
  const validationReceiptDigest = sha256Canonical(
    receiptBody as unknown as JsonValue,
  );
  const body = {
    catalogId: view.catalogId,
    catalogDigest: view.catalogDigest,
    viewId: view.viewId,
    viewDigest: view.viewDigest,
    rowHandle: row.handle,
    rowDigest: row.rowDigest,
    applicationVariant: basis.applicationVariant,
    validationReceiptRef:
      `catalog-application-receipt://abiogenesis/${
        validationReceiptDigest.slice("sha256:".length)
      }`,
    validationReceiptDigest,
    validatingInstallId: loaded.install.installId,
    validatingProductId: loaded.install.productId,
    validatingArtifactDigest: loaded.install.artifactDigest,
    validatingProductContentDigest: loaded.install.productContentDigest,
    validatingManifestDigest: loaded.install.manifestDigest,
    validatingPublicationDigest: publicationDigest,
    appliedHandle:
      `${row.handle}/${appliedValueDigest.slice("sha256:".length)}`,
    appliedValueRef: projection.valueRef,
    appliedValueDigest,
    appliedValue: admitted as unknown as JsonValue,
    contributorKind,
    contributorRef,
    contributorAuthorityKind,
    contributorAuthorityRef,
    contributorProvenanceRefs,
    contributionKind: row.kind,
    declarationOrContractRef: row.declarationOrContractRef,
    owningProductId: row.owningProductId,
    moduleRef: row.moduleRef,
    programMembershipRefs: projection.programMembershipRefs,
    nodeTypeTarget,
    compatibilityDisposition: row.compatibilityDisposition,
    compatibilityRefs: row.compatibilityRefs,
    provenanceRefs: row.provenanceRefs,
  };
  const applicationCandidateDigest = sha256Canonical(
    body as unknown as JsonValue,
  );
  const candidate = deepFreeze({
    kind: "catalog_application_candidate",
    schemaVersion: "5.0.0",
    disposition: "candidate",
    applicationCandidateId:
      `catalog-application-candidate://abiogenesis/${
        applicationCandidateDigest.slice("sha256:".length)
      }`,
    applicationCandidateDigest,
    ...body,
  }) as CatalogApplicationCandidate;
  catalogApplicationCandidates.set(candidate, basis.candidateScope);
  return candidate;
}

export function evaluateInstalledInteractionResponse(
  semantics: ProductSemanticsProvider,
  basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0],
  responseCandidate: unknown,
): Readonly<Record<string, JsonValue>> | null {
  if (!loadedProductSemantics.has(semantics)) {
    throw new TypeError(
      "Product response evaluation requires the exact loaded Product semantics provider",
    );
  }
  return semantics.evaluateInteractionResponse(basis, responseCandidate);
}

export function validateInstalledInvocationBasis(
  semantics: ProductSemanticsProvider,
  basis: Parameters<
    NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>
  >[0],
): boolean {
  if (!loadedProductSemantics.has(semantics)) {
    throw new TypeError(
      "Product invocation-basis validation requires the exact loaded Product semantics provider",
    );
  }
  if (
    semantics.validateInvocationBasis === undefined &&
    basis.sourceResultBasis !== null
  ) {
    return false;
  }
  return semantics.validateInvocationBasis?.(basis) ?? true;
}

export function hasInstalledPublicResultProjection(
  semantics: ProductSemanticsProvider,
): boolean {
  if (!loadedProductSemantics.has(semantics)) {
    throw new TypeError(
      "Product public-result capability requires the exact loaded Product semantics provider",
    );
  }
  return semantics.projectPublicResult !== undefined;
}

export function supportsInstalledPublicResultProjection(
  semantics: ProductSemanticsProvider,
  projectionKind: string,
): boolean {
  if (!loadedProductSemantics.has(semantics)) {
    throw new TypeError(
      "Product public-result roster requires the exact loaded Product semantics provider",
    );
  }
  const roster = semantics.publicResultProjectionKinds ?? ["result"];
  return roster.includes(projectionKind);
}

export function projectInstalledPublicResult(
  semantics: ProductSemanticsProvider,
  basis: Parameters<
    NonNullable<ProductSemanticsProvider["projectPublicResult"]>
  >[0],
): ProductPublicResultProjection | null {
  if (!loadedProductSemantics.has(semantics)) {
    throw new TypeError(
      "Product public-result projection requires the exact loaded Product semantics provider",
    );
  }
  const projector = semantics.projectPublicResult;
  return projector === undefined && basis.projectionKind === "result"
    ? {
      kind: "product_public_result_projection",
      schemaVersion: "5.0.0",
      contractRef: basis.admittedResultContractRef,
      value: basis.value,
    }
    : projector?.(basis) ?? null;
}

export function projectInstalledLeafSemantics(
  semantics: ProductSemanticsProvider,
): InstalledLeafSemanticsProjection {
  const basis = loadedProductSemantics.get(semantics);
  if (basis === undefined) {
    throw new TypeError(
      "leaf semantics projection requires the exact loaded Product semantics provider",
    );
  }
  const install = basis.install;
  const validateContractValue =
    semantics.validateContractValue.bind(semantics);
  const resolveJudgmentRelation =
    semantics.resolveJudgmentRelation.bind(semantics);
  const validateResultEvidenceLineage =
    semantics.validateResultEvidenceLineage?.bind(semantics) ??
      (() => true);
  const resolveProbabilisticWorkerContracts =
    semantics.resolveProbabilisticWorkerContracts?.bind(semantics) ??
      ((basis: Readonly<{
        readonly inputContractRef: string;
        readonly outputContractRef: string;
        readonly input: Readonly<Record<string, JsonValue>>;
      }>) => Object.freeze({
        instructionContractRef: basis.inputContractRef,
        resultContractRef: basis.outputContractRef,
      }));
  return mintInstalledLeafSemanticsProjection(
    {
      installId: install.installId,
      productContentDigest: install.productContentDigest,
      manifestDigest: install.manifestDigest,
      publicationDigest: basis.publicationDigest,
      bindingRef: semantics.bindingRef,
      packageName: semantics.packageName,
      packageVersion: semantics.packageVersion,
    },
    {
      verifyInstalledContent: () => installedProductContentMatches(install),
      validateContractValue,
      resolveJudgmentRelation,
      validateResultEvidenceLineage,
      resolveProbabilisticWorkerContracts,
    },
  );
}
