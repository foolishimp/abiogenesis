// Validates: T-267 packed traversal-contract compiler and admission surface.

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

test("T-267 packed M03 exposes traversal contracts without row-authoring helpers", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t267-packed-"));
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
    JSON.stringify({ name: "t267-packed-consumer", private: true, type: "module" })
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
  admitDeclaredTraversalStageResultAuthority,
  admitDeterministicTraversalStageResultAuthority,
  admitProgramLocusTraversalStageResultAuthority,
  admitRuntimeAtomTraversalStageResultAuthority,
  admitTraversalExecution,
  assertCompiledTraversalExecutionContracts,
  assertTraversalExecutionRuntimeStart,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis,
  type AdmittedTraversalStageResultAuthority,
  type CompiledTraversalExecutionContracts,
  type ProjectTraversalContractSourceInput,
  type TraversalContractSourceBasis,
  type TraversalExecutionAdmissionOutcome
} from "@abiogenesis/typescript-tenant/abg/m03";

declare const sourceInput: ProjectTraversalContractSourceInput;
declare const source: TraversalContractSourceBasis;
declare const authority: AdmittedTraversalStageResultAuthority;
declare const bundle: CompiledTraversalExecutionContracts;
declare const admission: TraversalExecutionAdmissionOutcome;
void sourceInput;
void source;
void authority;
void bundle;
void admission;
void admitDeclaredTraversalStageResultAuthority;
void admitDeterministicTraversalStageResultAuthority;
void admitProgramLocusTraversalStageResultAuthority;
void admitRuntimeAtomTraversalStageResultAuthority;
void admitTraversalExecution;
void assertCompiledTraversalExecutionContracts;
void assertTraversalExecutionRuntimeStart;
void compileTraversalExecutionContracts;
void projectTraversalContractSourceBasis;

// @ts-expect-error source-basis sealing remains compiler-internal.
import { sourceBasis } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error row compilation remains compiler-internal.
import { compileRows } from "@abiogenesis/typescript-tenant/abg/m03";
void sourceBasis;
void compileRows;
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
    "admitDeclaredTraversalStageResultAuthority",
    "admitDeterministicTraversalStageResultAuthority",
    "admitProgramLocusTraversalStageResultAuthority",
    "admitRuntimeAtomTraversalStageResultAuthority",
    "admitTraversalExecution",
    "assertCompiledTraversalExecutionContracts",
    "assertTraversalExecutionRuntimeStart",
    "compileTraversalExecutionContracts",
    "projectTraversalContractSourceBasis"
  ]) {
    assert.equal(typeof m03[name], "function", name);
  }
  assert.equal(Object.hasOwn(m03, "sourceBasis"), false);
  assert.equal(Object.hasOwn(m03, "compileRows"), false);
});
