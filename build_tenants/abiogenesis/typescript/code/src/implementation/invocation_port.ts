import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { JsonValue } from "../shared/canonical_json.js";
import type {
  LeafInvocationPort,
  LeafInvocationResolution,
  ProbabilisticLeafEffectPort,
} from "./contracts.js";

export function constructLeafInvocationPort(installedRoot: string): LeafInvocationPort {
  const modules = new Map<string, Promise<Record<string, unknown>>>();

  async function loadModule(modulePath: string): Promise<Record<string, unknown>> {
    const exactPath = resolve(installedRoot, modulePath);
    const relation = relative(installedRoot, exactPath);
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

  return Object.freeze({
    async invoke(
      resolution: Readonly<LeafInvocationResolution>,
      input: Readonly<Record<string, JsonValue>>,
      effects: ProbabilisticLeafEffectPort | null,
    ): Promise<unknown> {
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
  });
}
