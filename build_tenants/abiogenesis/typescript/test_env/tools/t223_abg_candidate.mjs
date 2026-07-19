// T-223 ABG candidate pack and detached-sidecar producer.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  canonicalizeIJson
} from "../../build/semantic/code/src/index.js";
import {
  PACKAGE_ROOT,
  checkAbgProductPublication,
  prepareAbgDetachedCatalogPublication,
  prepareAbgProductPublication
} from "./publish_abg_product_contracts.mjs";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalBytes(value) {
  return Buffer.from(canonicalizeIJson(value), "utf8");
}

function packCandidate(outputRoot) {
  const artifactRoot = path.join(outputRoot, "artifacts");
  const result = spawnSync(
    "npm",
    [
      "pack",
      ".",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      artifactRoot
    ],
    {
      cwd: PACKAGE_ROOT,
      encoding: "utf8",
      env: { ...process.env, COPYFILE_DISABLE: "1", LC_ALL: "C" }
    }
  );
  if (result.status !== 0) {
    throw new TypeError(`npm pack failed: ${result.stderr || result.stdout}`);
  }
  const report = JSON.parse(result.stdout);
  const filename = report[0]?.filename;
  if (typeof filename !== "string" || filename.length === 0) {
    throw new TypeError("npm pack did not report one candidate artifact");
  }
  return path.join(artifactRoot, filename);
}

export async function prepareT223AbgCandidate(input) {
  const outputRoot = path.resolve(input.outputRoot);
  await mkdir(path.join(outputRoot, "artifacts"), { recursive: true });
  const publication = await prepareAbgProductPublication();
  await checkAbgProductPublication(publication);
  const artifactPath = packCandidate(outputRoot);
  const artifactDigest = sha256(await readFile(artifactPath));
  const sidecars = prepareAbgDetachedCatalogPublication({
    distributionArtifactDigest: artifactDigest,
    publication
  });
  const sidecarRoot = path.join(outputRoot, "sidecars");
  await mkdir(sidecarRoot, { recursive: true });
  const descriptorPath = path.join(sidecarRoot, "product-descriptor.json");
  const contributionPath = path.join(
    sidecarRoot,
    "contribution-manifest.json"
  );
  await writeFile(descriptorPath, canonicalBytes(sidecars.descriptor));
  await writeFile(contributionPath, canonicalBytes(sidecars.contribution));
  return Object.freeze({
    artifact: Object.freeze({
      format: "npm_package_tgz",
      artifactPath,
      expectedArtifactDigest: artifactDigest,
      expectedProductContentDigest:
        publication.publication.manifest.productContentDigest
    }),
    artifactPath,
    contribution: sidecars.contribution,
    contributionPath,
    descriptor: sidecars.descriptor,
    descriptorPath,
    outputRoot,
    publication
  });
}

async function main() {
  const outputFlag = process.argv.indexOf("--output");
  const outputRoot = outputFlag < 0 ? undefined : process.argv[outputFlag + 1];
  if (typeof outputRoot !== "string" || outputRoot.length === 0) {
    throw new TypeError("expected --output <directory>");
  }
  const candidate = await prepareT223AbgCandidate({ outputRoot });
  process.stdout.write(`${canonicalizeIJson({
    artifactPath: candidate.artifactPath,
    contributionPath: candidate.contributionPath,
    descriptorPath: candidate.descriptorPath
  })}\n`);
}

if (
  process.argv[1] !== undefined &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await main();
}
