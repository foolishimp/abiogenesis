import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function loadInstalledModules(installedRoot) {
  const abgPath = join(installedRoot, "build/code/src/abg/index.js");
  const installedRequire = createRequire(
    pathToFileURL(join(installedRoot, "package.json")),
  );
  const effectPath = installedRequire.resolve("effect/Effect");
  const [abg, effect] = await Promise.all([
    import(pathToFileURL(abgPath).href),
    import(pathToFileURL(effectPath).href),
  ]);
  return {
    abg,
    effect,
    moduleRefs: Object.freeze({
      abg: pathToFileURL(abgPath).href,
      effect: pathToFileURL(effectPath).href,
    }),
  };
}

async function run() {
  const input = JSON.parse(await readFile(process.argv[2], "utf8"));
  const { abg, effect, moduleRefs } = await loadInstalledModules(
    input.installedRoot,
  );
  const outputs = [];
  for (const readCall of input.readCalls) {
    const memberKey = readCall.invocation.definitionKey.memberKey;
    const callable = abg.ABG_PROJECT_READ_DEFINITION_BINDINGS[memberKey];
    const operation = callable(readCall);
    if (input.expectation === "resource_refusal") {
      const fault = await effect.runPromise(effect.flip(operation));
      return {
        kind: "st3_fresh_process_read_refusal",
        schemaVersion: "5.0.0",
        processId: process.pid,
        moduleRefs,
        memberKey,
        fault,
      };
    }
    const result = await effect.runPromise(operation);
    outputs.push(Object.freeze({
      memberKey,
      ownerOutput: result.ownerOutput,
      resources: result.resources,
    }));
  }
  return {
    kind: "st3_fresh_process_read_result",
    schemaVersion: "5.0.0",
    processId: process.pid,
    moduleRefs,
    outputs,
  };
}

process.stdout.write(JSON.stringify(await run()));
