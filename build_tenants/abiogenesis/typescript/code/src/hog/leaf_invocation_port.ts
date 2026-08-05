import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { hasAdmittedProductInstall } from "../abg/environment_admission.js";
import {
  hasAdmittedImplementationSet,
  type AdmittedImplementationSet,
} from "../abg/execution_basis.js";
import type { AbgEventStore } from "../abg/event_store.js";
import type { ModulePublication } from "../gtl/contracts.js";
import {
  inspectProductLeafSemanticsProjection,
  type InstalledLeafSemanticsProjection,
} from "../product/semantics.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type {
  LeafInvocationPort,
  LeafInvocationResolution,
  ProbabilisticLeafEffectPort,
} from "../implementation/contracts.js";

const admittedPorts = new WeakSet<object>();

export type LeafInvocationInstall =
  Parameters<typeof hasAdmittedProductInstall>[1];

export function isAdmittedLeafInvocationPort(value: object): boolean {
  return admittedPorts.has(value);
}

export function leafInvocationBindingMatches(authority: Readonly<{
  install: Pick<
    LeafInvocationInstall,
    | "installId"
    | "manifestDigest"
    | "packageName"
    | "packageVersion"
    | "productContentDigest"
  >;
  implementationSet: Pick<
    AdmittedImplementationSet,
    "publicationDigest" | "rows"
  >;
  publication: Readonly<ModulePublication>;
  semanticsProjection: unknown;
}>): boolean {
  const publicationDigest = sha256Canonical(
    authority.publication as unknown as JsonValue,
  );
  const semanticsBinding = authority.publication.productSemanticsBinding;
  const inspected = inspectProductLeafSemanticsProjection(
    authority.semanticsProjection,
  );
  return (
    inspected !== null &&
    authority.implementationSet.publicationDigest === publicationDigest &&
    authority.implementationSet.rows.every(
      (row) =>
        row.packageName === authority.install.packageName &&
        row.packageVersion === authority.install.packageVersion,
    ) &&
    inspected.projection.installId === authority.install.installId &&
    inspected.projection.productContentDigest ===
      authority.install.productContentDigest &&
    inspected.projection.manifestDigest === authority.install.manifestDigest &&
    inspected.projection.publicationDigest === publicationDigest &&
    inspected.projection.bindingRef === semanticsBinding.bindingRef &&
    inspected.projection.packageName === semanticsBinding.packageName &&
    inspected.projection.packageVersion === semanticsBinding.packageVersion
  );
}

export async function constructAdmittedLeafInvocationPort(authority: {
  readonly store: AbgEventStore;
  readonly install: LeafInvocationInstall;
  readonly implementationSet: AdmittedImplementationSet;
  readonly publication: Readonly<ModulePublication>;
  readonly semanticsProjection: InstalledLeafSemanticsProjection;
  readonly verifyInstallAuthority?: (install: LeafInvocationInstall) => boolean;
}): Promise<LeafInvocationPort> {
  const publicationDigest = sha256Canonical(authority.publication as unknown as JsonValue);
  const inspected = inspectProductLeafSemanticsProjection(
    authority.semanticsProjection,
  );
  if (
    inspected === null ||
    !(
      hasAdmittedProductInstall(authority.store, authority.install) ||
      authority.verifyInstallAuthority?.(authority.install) === true
    ) ||
    !hasAdmittedImplementationSet(authority.store, authority.implementationSet) ||
    !leafInvocationBindingMatches(authority) ||
    !(await inspected.runtime.verifyInstalledContent())
  ) {
    throw new TypeError(
      "leaf invocation port requires one exact admitted install, publication, and implementation set",
    );
  }
  const semantics = inspected.runtime;
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
    validateResultEvidenceLineage(
      outputContractRef: string,
      value: Readonly<Record<string, JsonValue>>,
      admittedEvidence: readonly Readonly<Record<string, JsonValue>>[],
    ) {
      return semantics.validateResultEvidenceLineage({
        outputContractRef,
        value,
        admittedEvidence,
      });
    },
    resolveProbabilisticWorkerContracts(
      resolution: Readonly<LeafInvocationResolution>,
      input: Readonly<Record<string, JsonValue>>,
    ) {
      if (
        !admittedPorts.has(port) ||
        !authority.implementationSet.rows.some((row) => row === resolution)
      ) {
        return null;
      }
      return semantics.resolveProbabilisticWorkerContracts({
        inputContractRef: resolution.inputContractRef,
        outputContractRef: resolution.outputContractRef,
        input,
      });
    },
    async invoke(
      resolution: Readonly<LeafInvocationResolution>,
      input: Readonly<Record<string, JsonValue>>,
      effects: ProbabilisticLeafEffectPort | null,
    ): Promise<unknown> {
      if (
        !admittedPorts.has(port) ||
        !(
          hasAdmittedProductInstall(authority.store, authority.install) ||
          authority.verifyInstallAuthority?.(authority.install) === true
        ) ||
        !hasAdmittedImplementationSet(authority.store, authority.implementationSet) ||
        !(await semantics.verifyInstalledContent()) ||
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
