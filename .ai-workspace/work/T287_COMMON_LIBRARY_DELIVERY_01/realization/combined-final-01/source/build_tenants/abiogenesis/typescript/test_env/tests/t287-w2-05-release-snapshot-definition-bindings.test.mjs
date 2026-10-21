import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("W2-05 packed ./product exports both release snapshot definition bindings", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-w2-05-release-bindings-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));

  await execFileAsync("npm", ["run", "build"], {
    cwd: root,
    maxBuffer: 10 * 1024 * 1024,
  });

  const packDirectory = join(scratch, "pack");
  await mkdir(packDirectory, { recursive: true });
  const { stdout: packStdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", packDirectory],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(packStdout);
  assert.equal(typeof packResult.filename, "string");

  const extractRoot = join(scratch, "extract");
  await mkdir(extractRoot, { recursive: true });
  await execFileAsync(
    "tar",
    ["-xzf", join(packDirectory, packResult.filename), "-C", extractRoot],
  );

  const packageRoot = join(extractRoot, "package");
  const packageJson = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8"),
  );
  assert.equal(
    packageJson.exports["./product"].import,
    "./build/code/src/product/index.js",
  );

  const probePath = join(packageRoot, "release-snapshot-binding-probe.mjs");
  await writeFile(probePath, `
import * as Effect from "effect/Effect";
import {
  RELEASE_SNAPSHOT_DEFINITION_BINDINGS,
  sha256Canonical,
} from "@abiogenesis/typescript-tenant/product";

const publishedRc =
  RELEASE_SNAPSHOT_DEFINITION_BINDINGS.snapshot.published_rc;
const tappedRelease =
  RELEASE_SNAPSHOT_DEFINITION_BINDINGS.snapshot.tapped_release;

const requestedIdentity = Object.freeze({
  identityRef: "release://abiogenesis/5.0.0-rc.probe",
  identityDigest: sha256Canonical({ version: "5.0.0-rc.probe" }),
  productId: "product://abiogenesis/typescript-tenant@5",
  version: "5.0.0-rc.probe",
});
const basisValue = Object.freeze({ candidate: "final-tap-probe" });
const qualificationBasis = Object.freeze({
  kind: "release_qualification_basis",
  subjectKind: "final_tap_candidate",
  basisRef: "qualification-basis://abiogenesis/final-tap-probe",
  basisDigest: sha256Canonical(basisValue),
  prospectiveIdentity: requestedIdentity,
  basis: basisValue,
});
const law = Object.freeze({ law: "qualification://abiogenesis/5" });
const lawBasis = Object.freeze({
  kind: "release_law_basis",
  lawBasisRef: "qualification-law://abiogenesis/5",
  lawBasisDigest: sha256Canonical(law),
  law,
});
const verdictBody = Object.freeze({
  qualificationBasisRef: qualificationBasis.basisRef,
  qualificationBasisDigest: qualificationBasis.basisDigest,
  lawBasisRef: lawBasis.lawBasisRef,
  lawBasisDigest: lawBasis.lawBasisDigest,
  disposition: "green",
  bypassRefs: [],
});
const verdict = Object.freeze({
  kind: "release_qualification_verdict",
  verdictRef: "qualification-verdict://abiogenesis/final-tap-probe",
  verdictDigest: sha256Canonical(verdictBody),
  ...verdictBody,
});
const request = Object.freeze({
  qualificationBasis,
  lawBasis,
  verdict,
  requestedIdentity,
});
const direct = await Effect.runPromise(publishedRc({
  invocation: Object.freeze({
    definitionKey: Object.freeze({
      operationId: "abg.operation.release.snapshot",
      memberKey: "published_rc",
    }),
    request,
  }),
  resources: null,
}));

process.stdout.write(JSON.stringify({
  publishedRcType: typeof publishedRc,
  tappedReleaseType: typeof tappedRelease,
  direct,
}));
`, "utf8");

  const { stdout: probeStdout } = await execFileAsync(
    process.execPath,
    [probePath],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const probe = JSON.parse(probeStdout);
  assert.equal(probe.publishedRcType, "function");
  assert.equal(probe.tappedReleaseType, "function");
  assert.equal(probe.direct.resources, null);
  assert.equal(probe.direct.ownerOutput.outcomeKind, "refusal");
  assert.equal(
    probe.direct.ownerOutput.value.kind,
    "release_snapshot_refusal",
  );
  assert.equal(probe.direct.ownerOutput.value.memberKey, "published_rc");
  assert.equal(probe.direct.ownerOutput.value.code, "wrong_subject_kind");
});
