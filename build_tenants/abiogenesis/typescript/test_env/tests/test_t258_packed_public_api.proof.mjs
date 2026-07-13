// Validates: T-258 packed M03 interaction and M04 operation surfaces.

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

test("T-258 packed product exposes governed F_H atoms and six exact public operations", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t258-packed-"));
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
    JSON.stringify({ name: "t258-packed-consumer", private: true, type: "module" })
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
  FH_PUBLIC_OPERATION_ID_VALUES,
  admitFhInteractionResume,
  openFhInteraction,
  projectFhInteraction,
  submitFhInteractionResponse,
  type FhInteractionProjection
} from "@abiogenesis/typescript-tenant/abg/m03";
import {
  DS1_PUBLIC_OPERATION_IDS,
  abiogenesisPublicSdk,
  constructAbgCliInvocation,
  type FhApproveRequest,
  type FhApproveResult,
  type PublicFhInteractionProjection,
  type RunResumeRequest,
  type RunResumeResult
} from "@abiogenesis/typescript-tenant/app/m04";

declare const projection: FhInteractionProjection;
declare const publicProjection: PublicFhInteractionProjection;
declare const approveRequest: FhApproveRequest;
declare const approveResult: FhApproveResult;
declare const resumeRequest: RunResumeRequest;
declare const resumeResult: RunResumeResult;
void projection;
void publicProjection;
void approveRequest;
void approveResult;
void resumeRequest;
void resumeResult;
void FH_PUBLIC_OPERATION_ID_VALUES;
void DS1_PUBLIC_OPERATION_IDS;
void admitFhInteractionResume;
void openFhInteraction;
void projectFhInteraction;
void submitFhInteractionResponse;
void abiogenesisPublicSdk;
void constructAbgCliInvocation;

// @ts-expect-error interaction digest construction remains M03-owned.
import { responseBasis } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error resume digest construction remains M03-owned.
import { resumeBasis } from "@abiogenesis/typescript-tenant/abg/m03";
void responseBasis;
void resumeBasis;
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
  const m04 = await import(
    pathToFileURL(
      path.join(installedRoot, "build/semantic/code/src/app/m04/index.js")
    ).href
  );
  assert.equal(typeof m03.openFhInteraction, "function");
  assert.equal(typeof m03.submitFhInteractionResponse, "function");
  assert.equal(typeof m03.admitFhInteractionResume, "function");
  assert.equal(Object.hasOwn(m03, "responseBasis"), false);
  assert.equal(Object.hasOwn(m03, "resumeBasis"), false);
  for (const symbol of [
    "fhSelect",
    "fhApprove",
    "fhReject",
    "fhAssess",
    "fhAnswerEscalation",
    "runResume"
  ]) {
    assert.equal(typeof m04[symbol], "function", symbol);
  }

  const catalog = JSON.parse(
    await readFile(
      path.join(installedRoot, "contracts/public-contract-catalog.json"),
      "utf8"
    )
  );
  const expectedOperationIds = [
    "abg.operation.fh.select",
    "abg.operation.fh.approve",
    "abg.operation.fh.reject",
    "abg.operation.fh.assess",
    "abg.operation.fh.answer-escalation",
    "abg.operation.run.resume"
  ];
  const published = catalog.rows
    .filter((row) => expectedOperationIds.includes(row.contractId))
    .map((row) => row.contractId)
    .sort();
  assert.deepEqual(published, [...expectedOperationIds].sort());
  assert.equal(
    catalog.rows.some(
      (row) => row.contractId === "abg.capability.fh.interact@5"
    ),
    true
  );
  assert.equal(
    catalog.rows.some(
      (row) => row.contractId === "abg.schema.fh-interaction"
    ),
    true
  );
});
