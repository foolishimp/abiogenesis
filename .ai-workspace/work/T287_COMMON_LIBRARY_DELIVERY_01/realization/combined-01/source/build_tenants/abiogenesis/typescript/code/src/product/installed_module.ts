import { isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import type { ProductInstall } from "./environment.js";
import { installedProductContentMatches } from "./install_product.js";

export type InstalledModuleLoadResult =
  | Readonly<{
      kind: "loaded";
      module: Readonly<Record<string, unknown>>;
    }>
  | Readonly<{
      kind: "refused";
      code: "content_mismatch" | "load_failed" | "path_escape";
    }>;

/** Physical content established for one resolution lifetime only. The caller
 * retains this derived result, never serializes it or uses it as admission. */
export interface InstalledProductModuleLoading {
  readonly kind: "installed_product_module_loading";
  readonly install: ProductInstall;
  readonly load: (modulePath: string) => Promise<InstalledModuleLoadResult>;
}

export type InstalledProductModulePreparation = InstalledProductModuleLoading |
  Readonly<{ readonly kind: "refused"; readonly code: "content_mismatch" }>;

export async function prepareInstalledProductModules(
  install: ProductInstall,
): Promise<InstalledProductModulePreparation> {
  if (!(await installedProductContentMatches(install))) {
    return Object.freeze({ kind: "refused", code: "content_mismatch" });
  }
  return Object.freeze({
    kind: "installed_product_module_loading",
    install,
    load: (modulePath: string) => loadModuleWithinProduct(install, modulePath),
  });
}

export async function loadVerifiedInstalledModule(
  install: ProductInstall,
  modulePath: string,
): Promise<InstalledModuleLoadResult> {
  const prepared = await prepareInstalledProductModules(install);
  return prepared.kind === "refused" ? prepared : prepared.load(modulePath);
}

async function loadModuleWithinProduct(
  install: ProductInstall,
  modulePath: string,
): Promise<InstalledModuleLoadResult> {
  const exactPath = resolve(install.installedRoot, modulePath);
  const relation = relative(install.installedRoot, exactPath);
  if (
    relation.length === 0 ||
    relation === ".." ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation)
  ) {
    return Object.freeze({
      kind: "refused",
      code: "path_escape",
    });
  }
  try {
    const loaded = await import(pathToFileURL(exactPath).href) as Record<
      string,
      unknown
    >;
    return Object.freeze({
      kind: "loaded",
      module: loaded,
    });
  } catch {
    return Object.freeze({
      kind: "refused",
      code: "load_failed",
    });
  }
}
