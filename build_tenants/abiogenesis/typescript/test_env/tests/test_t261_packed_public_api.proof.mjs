// Validates: T-261 packed M03 C.retry policy and runtime surface.

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

test("T-261 packed M03 exposes retry contracts without private authorities", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t261-packed-"));
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
    JSON.stringify({ name: "t261-packed-consumer", private: true, type: "module" })
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
  C_RETRY_POLICY_REF,
  assertCRetryPolicyProjection,
  assertCompiledCRetryBinding,
  assertCompiledCRetryPlan,
  compileCRetryBinding,
  compileCRetryPlan,
  deriveCRetryPolicyProjection,
  isRetryableRuntimeFailureClass,
  resolveCRetry,
  type CRetryAttemptOutcome,
  type CRetryInvocation,
  type CRetryPolicyProjection,
  type CRetryResolution,
  type CompiledCRetryBinding,
  type CompiledCRetryPlan
} from "@abiogenesis/typescript-tenant/abg/m03";

declare const policy: CRetryPolicyProjection;
declare const binding: CompiledCRetryBinding;
declare const plan: CompiledCRetryPlan;
declare const invocation: CRetryInvocation;
declare const outcome: CRetryAttemptOutcome;
declare const resolution: CRetryResolution;
void policy;
void binding;
void plan;
void invocation;
void outcome;
void resolution;
void C_RETRY_POLICY_REF;
void assertCRetryPolicyProjection;
void assertCompiledCRetryBinding;
void assertCompiledCRetryPlan;
void compileCRetryBinding;
void compileCRetryPlan;
void deriveCRetryPolicyProjection;
void isRetryableRuntimeFailureClass;
void resolveCRetry;

// @ts-expect-error selected catalog resolution remains runtime-internal.
import { selectedModuleAuthority } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error raw attempt admission remains resolver-internal.
import { admitAttemptOutcome } from "@abiogenesis/typescript-tenant/abg/m03";
void selectedModuleAuthority;
void admitAttemptOutcome;
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
    "assertCRetryPolicyProjection",
    "assertCompiledCRetryBinding",
    "assertCompiledCRetryPlan",
    "compileCRetryBinding",
    "compileCRetryPlan",
    "deriveCRetryPolicyProjection",
    "isRetryableRuntimeFailureClass",
    "resolveCRetry"
  ]) {
    assert.equal(typeof m03[name], "function", name);
  }
  assert.equal(typeof m03.C_RETRY_POLICY_REF, "string");
  assert.equal(Object.hasOwn(m03, "selectedModuleAuthority"), false);
  assert.equal(Object.hasOwn(m03, "admitAttemptOutcome"), false);
});
