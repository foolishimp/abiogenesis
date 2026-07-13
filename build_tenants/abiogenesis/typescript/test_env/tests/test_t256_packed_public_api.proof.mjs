// Validates: T-256 packed public request, diagnostic, and declaration surfaces.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

test("T-256 packed M03 exposes one public join without private compiler machinery", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t256-packed-"));
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
    JSON.stringify({ name: "t256-packed-consumer", private: true, type: "module" })
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
  EXECUTION_CONTEXT_DIAGNOSTIC_ID_VALUES,
  constructAdmittedInvocationCarrier,
  constructAdmittedInvocationCarrierSet,
  constructDeclaredCStageInvocationBasis,
  constructExecutionContextProjectionRule,
  constructInstructionProtocolRule,
  joinDeclaredExecutionContext,
  ABG_CONSENSUS_INSTRUCTION_DECLARATION,
  type DeclaredExecutionContextJoinOutcome,
  type DeclaredFpExecutionRequest,
  type JoinDeclaredExecutionContextInput
} from "@abiogenesis/typescript-tenant/abg/m03";

// @ts-expect-error module-local compiler errors are not public API.
import { ExecutionContextCompilationError } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error the canonical adapter is reachable only through the public join.
import { compileCanonicalFpInstructionAssembly } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error declaration closure remains internal compiler machinery.
import { declarationClosure } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error instruction assembly truth is derived and has no public constructor.
import { constructAdmittedInstructionAssemblyRuntimeBasis } from "@abiogenesis/typescript-tenant/abg/m03";

declare const input: JoinDeclaredExecutionContextInput;
const outcome: DeclaredExecutionContextJoinOutcome = joinDeclaredExecutionContext(input);
if (outcome.status === "request_constructed" && outcome.request.regime === "F_P") {
  const request: DeclaredFpExecutionRequest = outcome.request;
  const blocked: false = request.startupBlock.effectsPermitted;
  void blocked;
}
void EXECUTION_CONTEXT_DIAGNOSTIC_ID_VALUES;
void constructAdmittedInvocationCarrier;
void constructAdmittedInvocationCarrierSet;
void constructDeclaredCStageInvocationBasis;
void constructExecutionContextProjectionRule;
void constructInstructionProtocolRule;
void ABG_CONSENSUS_INSTRUCTION_DECLARATION;
void ExecutionContextCompilationError;
void compileCanonicalFpInstructionAssembly;
void declarationClosure;
void constructAdmittedInstructionAssemblyRuntimeBasis;
`
  );

  const tscBin = path.join(tenantRoot, "node_modules/typescript/bin/tsc");
  run(process.execPath, [tscBin, "-p", "tsconfig.json"], consumerRoot);

  const installedRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const declaration = await readFile(
    path.join(installedRoot, "build/semantic/code/src/abg/m03/contracts/index.d.ts"),
    "utf8"
  );
  assert.match(declaration, /declared_execution_context/u);
  assert.match(declaration, /consensus_instruction_protocol/u);

  const runtime = await import(
    pathToFileURL(
      path.join(installedRoot, "build/semantic/code/src/abg/m03/index.js")
    ).href
  );
  assert.equal(typeof runtime.joinDeclaredExecutionContext, "function");
  assert.equal(typeof runtime.constructExecutionContextProjectionRule, "function");
  assert.equal(
    runtime.ABG_CONSENSUS_INSTRUCTION_DECLARATION.entryKind,
    "node_type"
  );
  assert.equal(Object.hasOwn(runtime, "ExecutionContextCompilationError"), false);
  assert.equal(Object.hasOwn(runtime, "compileCanonicalFpInstructionAssembly"), false);
  assert.equal(Object.hasOwn(runtime, "declarationClosure"), false);
  assert.equal(
    Object.hasOwn(runtime, "constructAdmittedInstructionAssemblyRuntimeBasis"),
    false
  );
});
