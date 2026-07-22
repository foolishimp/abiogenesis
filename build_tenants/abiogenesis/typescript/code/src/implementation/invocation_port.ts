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
} from "./contracts.js";

const admittedPorts = new WeakSet<object>();

export function isAdmittedLeafInvocationPort(value: object): boolean {
  return admittedPorts.has(value);
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
