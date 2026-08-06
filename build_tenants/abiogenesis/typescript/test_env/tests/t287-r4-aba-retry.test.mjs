import { resolve } from "node:path";
import test from "node:test";

import { runAxF09Aba } from "../falsifiers/runtime-f09.mjs";
import { setupInstalledCliHarness } from "../support/root-cli-environment.mjs";

const root = resolve(import.meta.dirname, "../..");

test("T-287 R4 A-B-A compares only the immediately preceding retry failure", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  await runAxF09Aba({ harness, packageRoot: root });
});
