import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function jsonRoundTrip(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadProduct(root) {
  const moduleUrl = pathToFileURL(
    join(root, "build/code/src/product/index.js"),
  );
  moduleUrl.searchParams.set("wave2-owner-chain", `${Date.now()}`);
  return import(moduleUrl.href);
}

export async function runWave2OwnerCandidateChain({ root, temporaryRoot }) {
  const product = await loadProduct(root);
  const artifacts = join(temporaryRoot, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const productManifest = JSON.parse(
    await readFile(join(root, "product-toolchain-manifest.json"), "utf8"),
  );

  const createPacket = jsonRoundTrip({
    kind: "workspace_create_packet",
    schemaVersion: "5.0.0",
    memberKey: "clean",
    targetRoot: join(temporaryRoot, "workspace"),
    scaffoldPolicy: "none",
  });
  const created = jsonRoundTrip(
    await product.WorkspaceOperationPort.create(createPacket),
  );

  const openPacket = jsonRoundTrip({
    kind: "workspace_open_packet",
    schemaVersion: "5.0.0",
    memberKey: "open",
    targetRoot: created.manifest.canonicalRoot,
    expectedWorkspaceAuthorityRef: created.workspaceAuthorityRef,
    expectedWorkspaceAuthorityDigest: created.workspaceAuthorityDigest,
  });
  const manifestBytesBeforeOpen = await readFile(created.manifestPath, "utf8");
  const opened = jsonRoundTrip(
    await product.WorkspaceOperationPort.open(openPacket),
  );
  const manifestBytesAfterOpen = await readFile(created.manifestPath, "utf8");

  const verifyPacket = jsonRoundTrip({
    kind: "product_verification_packet",
    schemaVersion: "5.0.0",
    memberKey: "verify",
    targetKind: "packed_artifact",
    request: {
      artifactPath,
      artifactRef: basename(artifactPath),
      expectedArtifactDigest: await product.sha256File(artifactPath),
      expectedProductContentDigest: productManifest.productContentDigest,
      expectedManifestDigest: product.sha256Canonical(productManifest),
      expectedProductId: productManifest.productId,
      expectedPackageName: productManifest.packageName,
      expectedPackageVersion: productManifest.packageVersion,
    },
  });
  const verificationSuccess = jsonRoundTrip(
    await product.ProductVerificationPort.verify(verifyPacket),
  );
  const verified = verificationSuccess.verifiedArtifact;

  const resolvePacket = jsonRoundTrip({
    kind: "product_resolution_packet",
    schemaVersion: "5.0.0",
    memberKey: "resolve",
    verifiedArtifacts: [verified],
  });
  const resolved = jsonRoundTrip(
    product.ProductEnvironmentPort.resolve(resolvePacket),
  );

  const installPacket = jsonRoundTrip({
    kind: "product_install_packet",
    schemaVersion: "5.0.0",
    memberKey: "install",
    request: {
      artifactPath,
      targetRoot: join(temporaryRoot, "install-host"),
      verifiedArtifact: verified,
      resolvedLock: resolved,
    },
  });
  const installCandidate = jsonRoundTrip(
    await product.ProductInstallPort.install(installPacket),
  );

  return {
    product,
    packetReceipts: {
      createPacket,
      openPacket,
      verifyPacket,
      resolvePacket,
      installPacket,
    },
    ownerResults: {
      created,
      opened,
      manifestBytesBeforeOpen,
      manifestBytesAfterOpen,
      verificationSuccess,
      verified,
      resolved,
      installCandidate,
    },
  };
}
