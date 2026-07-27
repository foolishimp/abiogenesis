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

export async function loadVerifiedInstalledModule(
  install: ProductInstall,
  modulePath: string,
): Promise<InstalledModuleLoadResult> {
  if (!(await installedProductContentMatches(install))) {
    return Object.freeze({
      kind: "refused",
      code: "content_mismatch",
    });
  }
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
