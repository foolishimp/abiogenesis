import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import type { ProductInstall } from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";

export interface ProductSemanticsProvider {
  readonly kind: "product_semantics_provider";
  readonly schemaVersion: "5.0.0";
  readonly bindingRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly admitInput: (
    contractRef: string,
    value: unknown,
  ) => Readonly<Record<string, JsonValue>> | null;
  readonly evaluateInteractionResponse: (
    basis: Readonly<{
      readonly requestContractRef: string;
      readonly responseContractRef: string;
      readonly requestValue: Readonly<Record<string, JsonValue>>;
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
}

export interface InstalledProductSemanticsBasis {
  readonly install: ProductInstall;
  readonly publication: Readonly<ModulePublication>;
  readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
}

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
}

interface LoadedProductSemanticsBasis {
  readonly install: ProductInstall;
  readonly publicationDigest: ReturnType<typeof sha256Canonical>;
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
  const binding = basis.publication.productSemanticsBinding;
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
    typeof value.resolveJudgmentRelation !== "function"
  ) {
    throw new TypeError(
      "installed Product semantics provider differs from its published binding",
    );
  }
  const provider = value as unknown as ProductSemanticsProvider;
  loadedProductSemantics.set(provider, {
    install: basis.install,
    publicationDigest: sha256Canonical(
      basis.publication as unknown as JsonValue,
    ),
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
    },
  );
}
