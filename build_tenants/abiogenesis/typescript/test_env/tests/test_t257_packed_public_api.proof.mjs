// Validates: T-257 packed public result-contract admission surface.

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

test("T-257 packed M03 exposes one admission atom and no profile-policy authority", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t257-packed-"));
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
    JSON.stringify({ name: "t257-packed-consumer", private: true, type: "module" })
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
  FP_RESULT_CONTRACT_FAILURE_CLASS_VALUES,
  FP_RESULT_WIRE_PROFILE_VALUES,
  admitFpResultContractEnvelope,
  type AdmittedFpResultContractEnvelope,
  type FpResultContractAdmissionOutcome,
  type FpResultContractFailure,
  type FpResultWireProfile
} from "@abiogenesis/typescript-tenant/abg/m03";

const profile: FpResultWireProfile = "standard_live_review";
// @ts-expect-error the evidence-only profile was retired without an alias.
const retiredProfile: FpResultWireProfile = "attached_result_artifact";
const outcome: FpResultContractAdmissionOutcome = admitFpResultContractEnvelope({
  profile,
  selectedResultContractRef: "contract://t257/packed",
  rawResult: {
    resultContractRef: "contract://t257/packed",
    accepted: true,
    closeDisposition: "close",
    assessmentIds: [],
    reasons: []
  }
});
if (outcome.accepted) {
  const envelope: AdmittedFpResultContractEnvelope = outcome.envelope;
  void envelope;
} else {
  const failure: FpResultContractFailure = outcome.failure;
  void failure;
}
void FP_RESULT_CONTRACT_FAILURE_CLASS_VALUES;
void FP_RESULT_WIRE_PROFILE_VALUES;
void retiredProfile;

// @ts-expect-error profile definitions remain module-owned policy.
import { PROFILE_DEFINITIONS } from "@abiogenesis/typescript-tenant/abg/m03";
// @ts-expect-error prompt profile fields remain module-owned policy.
import { internalFpResultWireProfileFields } from "@abiogenesis/typescript-tenant/abg/m03";
void PROFILE_DEFINITIONS;
void internalFpResultWireProfileFields;
`
  );

  const tscBin = path.join(tenantRoot, "node_modules/typescript/bin/tsc");
  run(process.execPath, [tscBin, "-p", "tsconfig.json"], consumerRoot);

  const installedRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const runtime = await import(
    pathToFileURL(
      path.join(installedRoot, "build/semantic/code/src/abg/m03/index.js")
    ).href
  );
  const outcome = runtime.admitFpResultContractEnvelope({
    profile: "attached_transform_result",
    selectedResultContractRef: "contract://t257/packed",
    rawResult: {
      result_contract_ref: "contract://t257/packed",
      edge: "source-to-target",
      actor: "worker://t257/packed",
      fulfillment_assessments: [],
      target_value: { message: "packed target value" }
    }
  });
  assert.equal(outcome.accepted, true);
  assert.equal(outcome.envelope.resultContractRef, "contract://t257/packed");
  assert.equal(
    outcome.envelope.targetValueCandidate.message,
    "packed target value"
  );
  assert.equal(
    Object.hasOwn(outcome.envelope.resultArtifactCandidate, "target_value"),
    false
  );
  assert.equal(Object.hasOwn(runtime, "PROFILE_DEFINITIONS"), false);
  assert.equal(Object.hasOwn(runtime, "internalFpResultWireProfileFields"), false);
});
