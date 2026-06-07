// Single consolidated config file: config/abg.config.json (installed at
// .abiogenesis/config/abg.config.json). One file with three sections, each the
// full existing bundle object:
//   - levers         -> abg_lever_overrides_bundle   (T-118)
//   - fallbacks      -> abg_fallback_bundle          (T-117 plugin observer)
//   - targetCarriers -> gtl_target_carrier_defaults_bundle
//
// This is a leaf: it imports only `shared/runtime_identity` (for the section
// digest) and `shared/validation`. It returns RAW sections; each consumer hands
// its section to its own existing admitter, so admission/behavior is unchanged.
//
// Two resolution helpers, because the prior loaders had different semantics:
//   - resolveAbgConfigPath: installed -> package -> walk-up (lever, targetCarrier)
//   - loadAbgConfigSectionsFromFile: parse a known path (fallback resolves its
//     own installed-workspace path and passes it in)

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePlainObject } from "../validation/primitives.js";
import { stableSha256Digest } from "../runtime_identity.js";

export const INSTALLED_ABG_CONFIG_RELATIVE_PATH = join(
  ".abiogenesis",
  "config",
  "abg.config.json"
);
export const PACKAGE_ABG_CONFIG_RELATIVE_PATH = join("config", "abg.config.json");

export interface AbgConfigSection {
  readonly value: unknown;
  readonly bundlePath: string;
  readonly bundleDigest: string;
}

export interface AbgConfigSections {
  readonly path: string;
  readonly levers: AbgConfigSection | null;
  readonly fallbacks: AbgConfigSection | null;
  readonly targetCarriers: AbgConfigSection | null;
}

export function resolveAbgConfigPath(
  workspaceRoot: string = process.cwd()
): string | null {
  const installedPath = join(workspaceRoot, INSTALLED_ABG_CONFIG_RELATIVE_PATH);
  if (existsSync(installedPath)) {
    return installedPath;
  }
  const packagePath = join(workspaceRoot, PACKAGE_ABG_CONFIG_RELATIVE_PATH);
  if (existsSync(packagePath)) {
    return packagePath;
  }
  let current = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const modulePackagePath = join(current, PACKAGE_ABG_CONFIG_RELATIVE_PATH);
    if (existsSync(modulePackagePath)) {
      return modulePackagePath;
    }
    const parent = dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function toSection(value: unknown, path: string): AbgConfigSection | null {
  if (value === undefined || value === null) {
    return null;
  }
  return { value, bundlePath: path, bundleDigest: stableSha256Digest(value) };
}

export function loadAbgConfigSectionsFromFile(path: string): AbgConfigSections {
  const raw = readFileSync(path, "utf8");
  const parsed = parsePlainObject(JSON.parse(raw), "abg.config.json");
  return {
    path,
    levers: toSection(parsed["levers"], path),
    fallbacks: toSection(parsed["fallbacks"], path),
    targetCarriers: toSection(parsed["targetCarriers"], path)
  };
}

export function loadAbgConfigSections(
  workspaceRoot: string = process.cwd()
): AbgConfigSections | null {
  const path = resolveAbgConfigPath(workspaceRoot);
  if (path === null) {
    return null;
  }
  return loadAbgConfigSectionsFromFile(path);
}
