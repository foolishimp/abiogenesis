import { resolve } from "node:path";
import test from "node:test";

import { runAxF09 } from "../falsifiers/runtime-f09.mjs";
import { setupInstalledCliHarness } from "../support/root-cli-environment.mjs";

const root = resolve(import.meta.dirname, "../..");

test("T-287 F09 retry frontier hands off to a restarted consumer", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  await runAxF09({ harness, packageRoot: root });
});
