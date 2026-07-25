import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
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
  return value as unknown as ProductSemanticsProvider;
}

export function admitInstalledProductInput(
  semantics: ProductSemanticsProvider,
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  return semantics.admitInput(contractRef, value);
}

export function evaluateInstalledInteractionResponse(
  semantics: ProductSemanticsProvider,
  basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0],
  responseCandidate: unknown,
): Readonly<Record<string, JsonValue>> | null {
  return semantics.evaluateInteractionResponse(basis, responseCandidate);
}
