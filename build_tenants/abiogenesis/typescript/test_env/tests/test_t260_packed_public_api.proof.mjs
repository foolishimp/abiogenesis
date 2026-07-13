// Validates: T-260 packed M03 HOF and C.batch runtime surface.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const tenantRoot = path.resolve(import.meta.dirname, "../..");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  return result.stdout;
}

test("T-260 packed M03 exposes prime HOF/batch contracts without private authorities", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t260-packed-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const packRoot = path.join(root, "pack");
  const consumerRoot = path.join(root, "consumer");
  await mkdir(packRoot, { recursive: true });
  await mkdir(consumerRoot, { recursive: true });

  const packed = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", packRoot], tenantRoot)
  );
  assert.equal(packed.length, 1);
  const tarballPath = path.join(packRoot, packed[0].filename);
  await writeFile(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ name: "t260-packed-consumer", private: true, type: "module" })
  );
  run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      tarballPath
    ],
    consumerRoot
  );
  await writeFile(
    path.join(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext"
      },
      include: ["consumer.ts"]
    })
  );
  await writeFile(
    path.join(consumerRoot, "consumer.ts"),
    `import {
  admitHofVector,
  admitHofVectorCarrier,
  assertCompiledCBatchPlan,
  assertCompiledFanInReductionBinding,
  assertCompiledHofFanOutBinding,
  compileDeclaredCBatchPlan,
  compileFanInReductionBinding,
  compileHofCBatchPlan,
  compileHofFanOutBinding,
  resolveCBatch,
  resolveHofFanIn,
  type AdmittedHofVector,
  type CBatchInvocation,
  type CBatchResolution,
  type CompiledCBatchPlan,
  type CompiledFanInReductionBinding,
  type CompiledHofFanOutBinding,
  type HofFanInInvocation,
  type HofFanInResolution
} from "@abiogenesis/typescript-tenant/abg/m03";

declare const vector: AdmittedHofVector;
declare const plan: CompiledCBatchPlan;
declare const hofBinding: CompiledHofFanOutBinding;
declare const fanInBinding: CompiledFanInReductionBinding;
declare const batchInvocation: CBatchInvocation;
declare const batchResolution: CBatchResolution;
declare const fanInInvocation: HofFanInInvocation;
declare const fanInResolution: HofFanInResolution;
void vector;
void plan;
void hofBinding;
void fanInBinding;
void batchInvocation;
void batchResolution;
void fanInInvocation;
void fanInResolution;
void admitHofVector;
void admitHofVectorCarrier;
void assertCompiledCBatchPlan;
void assertCompiledFanInReductionBinding;
void assertCompiledHofFanOutBinding;
void compileDeclaredCBatchPlan;
void compileFanInReductionBinding;
void compileHofCBatchPlan;
void compileHofFanOutBinding;
void resolveCBatch;
void resolveHofFanIn;

// @ts-expect-error selected catalog authority remains runtime-internal.
import { resolveSelectedCatalogExecutionBinding } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error raw task outcome admission remains resolver-internal.
import { admitTaskOutcome } from "@abiogenesis/typescript-tenant/abg/m03";
void resolveSelectedCatalogExecutionBinding;
void admitTaskOutcome;
`
  );

  const tscBin = path.join(tenantRoot, "node_modules/typescript/bin/tsc");
  run(process.execPath, [tscBin, "-p", "tsconfig.json"], consumerRoot);

  const installedRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const m03 = await import(
    pathToFileURL(
      path.join(installedRoot, "build/semantic/code/src/abg/m03/index.js")
    ).href
  );
  for (const name of [
    "admitHofVector",
    "admitHofVectorCarrier",
    "assertCompiledCBatchPlan",
    "assertCompiledFanInReductionBinding",
    "assertCompiledHofFanOutBinding",
    "compileDeclaredCBatchPlan",
    "compileFanInReductionBinding",
    "compileHofCBatchPlan",
    "compileHofFanOutBinding",
    "resolveCBatch",
    "resolveHofFanIn"
  ]) {
    assert.equal(typeof m03[name], "function", name);
  }
  assert.equal(Object.hasOwn(m03, "resolveSelectedCatalogExecutionBinding"), false);
  assert.equal(Object.hasOwn(m03, "admitTaskOutcome"), false);
});
