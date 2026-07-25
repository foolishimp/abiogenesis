import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { ProductInstall } from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";
import {
  mintInstalledLeafSemanticsProjection,
  type InstalledLeafSemanticsProjection,
} from "../shared/leaf_semantics_projection.js";
import { sha256Canonical } from "../shared/digests.js";

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

interface LoadedProductSemanticsBasis {
  readonly install: ProductInstall;
  readonly publicationDigest: ReturnType<typeof sha256Canonical>;
}

const loadedProductSemantics =
  new WeakMap<object, LoadedProductSemanticsBasis>();

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
      validateContractValue: (valueKind, value) =>
        semantics.validateContractValue(valueKind, value),
      resolveJudgmentRelation: (predicateRef) =>
        semantics.resolveJudgmentRelation(predicateRef),
    },
  );
}
