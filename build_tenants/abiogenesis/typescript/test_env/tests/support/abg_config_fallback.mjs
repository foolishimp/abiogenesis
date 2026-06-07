// Test helper: load the fallback bundle from the consolidated abg.config.json
// (the fallback bundle now lives under the `fallbacks` section).

import { admitAbgFallbackBundle } from "../../../build/semantic/code/src/abg/m03/index.js";
import { loadAbgConfigSectionsFromFile } from "../../../build/semantic/code/src/shared/abg_config/load.js";

export function fallbackSectionFromConfig(configPath) {
  return loadAbgConfigSectionsFromFile(configPath).fallbacks;
}

export function loadFallbackBundleFromConfig(configPath) {
  const section = fallbackSectionFromConfig(configPath);
  return admitAbgFallbackBundle(section.value, {
    bundlePath: section.bundlePath,
    bundleDigest: section.bundleDigest
  });
}
