// Validates: T-262 packed typed-recurse contract and runtime surface.

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

test("T-262 packed M03 exposes typed recurse contracts without private admission helpers", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t262-packed-"));
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
    JSON.stringify({ name: "t262-packed-consumer", private: true, type: "module" })
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
  admitTypedRecursePolicy,
  assertAdmittedTypedRecursePolicy,
  assertCompiledTypedRecurseBinding,
  assertCompiledTypedRecursePlan,
  compileTypedRecurseBinding,
  compileTypedRecursePlan,
  resolveTypedRecurse,
  type AdmittedTypedRecursePolicy,
  type CompiledTypedRecurseBinding,
  type CompiledTypedRecursePlan,
  type TypedRecurseInvocation,
  type TypedRecurseResolution
} from "@abiogenesis/typescript-tenant/abg/m03";

declare const policy: AdmittedTypedRecursePolicy;
declare const binding: CompiledTypedRecurseBinding;
declare const plan: CompiledTypedRecursePlan;
declare const invocation: TypedRecurseInvocation;
declare const resolution: TypedRecurseResolution;
void policy;
void binding;
void plan;
void invocation;
void resolution;
void admitTypedRecursePolicy;
void assertAdmittedTypedRecursePolicy;
void assertCompiledTypedRecurseBinding;
void assertCompiledTypedRecursePlan;
void compileTypedRecurseBinding;
void compileTypedRecursePlan;
void resolveTypedRecurse;

// @ts-expect-error selected Module resolution remains runtime-internal.
import { selectedModuleAuthority } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error raw foldback candidate admission remains resolver-internal.
import { admitFoldbackOutcome } from "@abiogenesis/typescript-tenant/abg/m03";
void selectedModuleAuthority;
void admitFoldbackOutcome;
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
    "admitTypedRecursePolicy",
    "assertAdmittedTypedRecursePolicy",
    "assertCompiledTypedRecurseBinding",
    "assertCompiledTypedRecursePlan",
    "compileTypedRecurseBinding",
    "compileTypedRecursePlan",
    "resolveTypedRecurse"
  ]) {
    assert.equal(typeof m03[name], "function", name);
  }
  assert.equal(Object.hasOwn(m03, "selectedModuleAuthority"), false);
  assert.equal(Object.hasOwn(m03, "admitFoldbackOutcome"), false);
});
