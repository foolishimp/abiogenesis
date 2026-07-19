// Validates: T-271 packed complete C-program compiler/interpreter surface.

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

test("T-271 packed M03 exposes the closed complete-program surface without internal fold helpers", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t271-packed-"));
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
    JSON.stringify({ name: "t271-packed-consumer", private: true, type: "module" })
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
  COMPLETE_C_PROGRAM_DIAGNOSTIC_ID_VALUES,
  assertCompiledCProgramPlan,
  compileCompleteCProgram,
  interpretCompleteCProgram,
  type CompileCompleteCProgramInput,
  type CompiledCPlanNode,
  type CompiledCProgramPlan,
  type CompleteCProgramCompilation,
  type CProgramAtomCloseBasis,
  type CProgramAtomEvidenceEvent,
  type CProgramAtomInteriorEvent,
  type CProgramAtomInvocationSubmission,
  type CProgramAtomReceipt,
  type CProgramExecutionOutcome,
  type CProgramInterpreterInvocation
} from "@abiogenesis/typescript-tenant/abg/m03";

declare const compileInput: CompileCompleteCProgramInput;
declare const plan: CompiledCProgramPlan;
declare const invocation: CProgramInterpreterInvocation;
declare const compilation: CompleteCProgramCompilation;
declare const closeBasis: CProgramAtomCloseBasis;
declare const evidenceEvent: CProgramAtomEvidenceEvent;
declare const interiorEvent: CProgramAtomInteriorEvent;
declare const submission: CProgramAtomInvocationSubmission;
declare const receipt: CProgramAtomReceipt;
declare const outcome: CProgramExecutionOutcome;
void compileInput;
void plan;
void invocation;
void compilation;
void closeBasis;
void evidenceEvent;
void interiorEvent;
void submission;
void receipt.targetCarrierContentDigest;
void receipt.targetPayloadIdentityDigest;
void outcome;
void COMPLETE_C_PROGRAM_DIAGNOSTIC_ID_VALUES;
void assertCompiledCProgramPlan;
void compileCompleteCProgram;
void interpretCompleteCProgram;

function closed(node: CompiledCPlanNode): string {
  switch (node.kind) {
    case "compiled_c_stage_leaf":
    case "compiled_c_identity":
    case "compiled_c_sequence":
    case "compiled_c_workflow_lift":
    case "compiled_c_complete_batch":
    case "compiled_c_complete_retry":
      return node.kind;
    default: {
      const impossible: never = node;
      return impossible;
    }
  }
}
void closed;

// @ts-expect-error plan construction remains compiler-internal.
import { sealNode } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error atom result admission remains interpreter-internal.
import { admitAtomResult } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error batch coordination remains subordinate to the public atom.
import { coordinateCBatchTaskFamily } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error retry decisions remain subordinate to the public atom.
import { deriveCRetryAttemptDecision } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error retry coordination remains interpreter-internal.
import { coordinateCRetryAttempt } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error plan-node projection remains compiler/interpreter-internal.
import { compiledCPlanNodesInDeclaredOrder } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error invoking-locus projection remains compiler/interpreter-internal.
import { compiledCInvokingLociInDeclaredOrder } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error subtree projection remains compiler/interpreter-internal.
import { compiledCSubtreeNodesInDeclaredOrder } from "@abiogenesis/typescript-tenant/abg/m03";
void sealNode;
void admitAtomResult;
void coordinateCBatchTaskFamily;
void deriveCRetryAttemptDecision;
void coordinateCRetryAttempt;
void compiledCPlanNodesInDeclaredOrder;
void compiledCInvokingLociInDeclaredOrder;
void compiledCSubtreeNodesInDeclaredOrder;
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
    "assertCompiledCProgramPlan",
    "compileCompleteCProgram",
    "interpretCompleteCProgram"
  ]) {
    assert.equal(typeof m03[name], "function", name);
  }
  assert.equal(Array.isArray(m03.COMPLETE_C_PROGRAM_DIAGNOSTIC_ID_VALUES), true);
  for (const name of [
    "sealNode",
    "admitAtomResult",
    "coordinateCBatchTaskFamily",
    "deriveCRetryAttemptDecision",
    "coordinateCRetryAttempt",
    "compiledCPlanNodesInDeclaredOrder",
    "compiledCInvokingLociInDeclaredOrder",
    "compiledCSubtreeNodesInDeclaredOrder"
  ]) {
    assert.equal(Object.hasOwn(m03, name), false, name);
  }
});
