import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_WAVE1_RECEIPT =
  "/private/tmp/abi5-wave1-freeze.yIRMJu/wave1-interface-receipt-v2.json";

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
  const receiptPath = resolve(
    process.env.ABI5_WAVE1_RECEIPT ?? DEFAULT_WAVE1_RECEIPT,
  );
  const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

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

  const artifactPath = resolve(receipt.artifact.artifactPath);
  const verifyPacket = jsonRoundTrip({
    kind: "product_verification_packet",
    schemaVersion: "5.0.0",
    memberKey: "verify",
    request: {
      artifactPath,
      artifactRef: basename(artifactPath),
      expectedArtifactDigest: receipt.artifact.sha256,
      expectedProductContentDigest:
        receipt.productManifest.productContentDigest,
      expectedManifestDigest:
        receipt.productManifest.manifestCanonicalDigest,
      expectedProductId: receipt.productManifest.productId,
      expectedPackageName: receipt.installedPackage.packageName,
      expectedPackageVersion: receipt.installedPackage.packageVersion,
    },
  });
  const verified = jsonRoundTrip(
    await product.ProductVerificationPort.verify(verifyPacket),
  );

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
      verified,
      resolved,
      installCandidate,
    },
  };
}
