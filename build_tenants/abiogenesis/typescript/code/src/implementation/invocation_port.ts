import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { hasAdmittedProductInstall } from "../abg/environment_admission.js";
import {
  hasAdmittedImplementationSet,
  type AdmittedImplementationSet,
} from "../abg/execution_basis.js";
import type { AbgEventStore } from "../abg/event_store.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { ProductInstall } from "../product/environment.js";
import { installedProductContentMatches } from "../product/install_product.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type {
  LeafInvocationPort,
  LeafInvocationResolution,
  ProbabilisticLeafEffectPort,
  ProductSemanticsProvider,
} from "./contracts.js";

const admittedPorts = new WeakSet<object>();

export function isAdmittedLeafInvocationPort(value: object): boolean {
  return admittedPorts.has(value);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function loadInstalledProductSemantics(authority: {
  readonly store: AbgEventStore;
  readonly install: ProductInstall;
  readonly publication: Readonly<ModulePublication>;
}): Promise<ProductSemanticsProvider> {
  const binding = authority.publication.productSemanticsBinding;
  if (
    !hasAdmittedProductInstall(authority.store, authority.install) ||
    binding.packageName !== authority.install.packageName ||
    binding.packageVersion !== authority.install.packageVersion ||
    !(await installedProductContentMatches(authority.install))
  ) {
    throw new TypeError(
      "Product semantics requires one exact admitted install and publication binding",
    );
  }
  const exactPath = resolve(authority.install.installedRoot, binding.modulePath);
  const relation = relative(authority.install.installedRoot, exactPath);
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

export async function constructAdmittedLeafInvocationPort(authority: {
  readonly store: AbgEventStore;
  readonly install: ProductInstall;
  readonly implementationSet: AdmittedImplementationSet;
  readonly publication: Readonly<ModulePublication>;
}): Promise<LeafInvocationPort> {
  const publicationDigest = sha256Canonical(authority.publication as unknown as JsonValue);
  if (
    !hasAdmittedProductInstall(authority.store, authority.install) ||
    !hasAdmittedImplementationSet(authority.store, authority.implementationSet) ||
    authority.implementationSet.publicationDigest !== publicationDigest ||
    authority.implementationSet.rows.some(
      (row) =>
        row.packageName !== authority.install.packageName ||
        row.packageVersion !== authority.install.packageVersion,
    ) ||
    !(await installedProductContentMatches(authority.install))
  ) {
    throw new TypeError(
      "leaf invocation port requires one exact admitted install, publication, and implementation set",
    );
  }
  const semantics = await loadInstalledProductSemantics(authority);
  const modules = new Map<string, Promise<Record<string, unknown>>>();

  async function loadModule(modulePath: string): Promise<Record<string, unknown>> {
    const exactPath = resolve(authority.install.installedRoot, modulePath);
    const relation = relative(authority.install.installedRoot, exactPath);
    if (relation.length === 0 || relation.startsWith("..") || isAbsolute(relation)) {
      throw new TypeError("leaf implementation module escapes the admitted Product install");
    }
    let loaded = modules.get(exactPath);
    if (loaded === undefined) {
      loaded = import(pathToFileURL(exactPath).href) as Promise<Record<string, unknown>>;
      modules.set(exactPath, loaded);
    }
    return loaded;
  }

  const port = Object.freeze({
    kind: "admitted_leaf_invocation_port" as const,
    installId: authority.install.installId,
    implementationSetRef: authority.implementationSet.implementationSetRef,
    implementationSetDigest: authority.implementationSet.implementationSetDigest,
    publicationDigest,
    contractValueKind(
      contractRef: string,
      contractKind: "failure" | "output",
    ): string | null {
      return authority.publication.contracts.find(
        (contract) =>
          contract.contractRef === contractRef &&
          contract.contractKind === contractKind,
      )?.valueKind ?? null;
    },
    validateContractValue(
      contractRef: string,
      contractKind: "failure" | "output",
      value: unknown,
    ): value is Readonly<Record<string, JsonValue>> {
      const valueKind = authority.publication.contracts.find(
        (contract) =>
          contract.contractRef === contractRef &&
          contract.contractKind === contractKind,
      )?.valueKind;
      return valueKind !== undefined &&
        semantics.validateContractValue(valueKind, value);
    },
    resolveJudgmentRelation(predicateRef: string) {
      return semantics.resolveJudgmentRelation(predicateRef);
    },
    async invoke(
      resolution: Readonly<LeafInvocationResolution>,
      input: Readonly<Record<string, JsonValue>>,
      effects: ProbabilisticLeafEffectPort | null,
    ): Promise<unknown> {
      if (
        !admittedPorts.has(port) ||
        !hasAdmittedProductInstall(authority.store, authority.install) ||
        !hasAdmittedImplementationSet(authority.store, authority.implementationSet) ||
        !(await installedProductContentMatches(authority.install)) ||
        !authority.implementationSet.rows.some((row) => row === resolution)
      ) {
        throw new TypeError("leaf invocation differs from the admitted install-bound port");
      }
      const module = await loadModule(resolution.modulePath);
      const implementation = module[resolution.namedSymbol];
      if (typeof implementation !== "function") {
        throw new TypeError("admitted leaf implementation symbol is not callable");
      }
      if (resolution.computeRegime === "F_P") {
        if (effects === null) {
          throw new TypeError("F_P leaf invocation requires the ABG probabilistic effect port");
        }
        return implementation(input, effects);
      }
      return implementation(input);
    },
  }) satisfies LeafInvocationPort;
  admittedPorts.add(port);
  return port;
}
