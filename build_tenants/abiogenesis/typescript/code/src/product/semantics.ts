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
import type {
  ProductInstall,
} from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";
import { loadVerifiedInstalledModule } from "./installed_module.js";
import type {
  DeclarationApplication,
  GraphFunctionCatalogView,
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
      readonly catalogView: GraphFunctionCatalogView;
      readonly catalogApplications: readonly DeclarationApplication[];
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
    binding.packageVersion !== basis.install.packageVersion
  ) {
    throw new TypeError(
      "Product semantics requires one exact admitted install and publication binding",
    );
  }
  const moduleResult = await loadVerifiedInstalledModule(
    basis.install,
    binding.modulePath,
  );
  if (moduleResult.kind === "refused") {
    throw new TypeError(
      moduleResult.code === "path_escape"
        ? "Product semantics module escapes the admitted Product install"
        : moduleResult.code === "content_mismatch"
        ? "Product semantics requires exact installed Product content"
        : "Product semantics module cannot be loaded from the admitted Product install",
    );
  }
  const loaded = moduleResult.module;
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
  return (semantics.publicResultProjectionKinds ?? ["result"]).includes(
    "result",
  );
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
