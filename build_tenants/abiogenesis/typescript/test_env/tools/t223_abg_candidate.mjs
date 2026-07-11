// T-223 ABG candidate pack and detached-sidecar producer.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  CONSENSUS_REQUEST_SCHEMA_REF,
  admitCatalogContributionManifest,
  admitCatalogProductDescriptor,
  canonicalizeIJson,
  contributionManifestDigest,
  descriptorDigest
} from "../../build/semantic/code/src/index.js";
import {
  PACKAGE_ROOT,
  T223_ABG_CONSENSUS_CANONICAL_HANDLE,
  T223_ABG_CONSENSUS_GRAPH_FUNCTION_REF,
  T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
  T223_ABG_SYSTEM_MODULE_PATH,
  checkAbgProductPublication,
  prepareAbgProductPublication
} from "./publish_abg_product_contracts.mjs";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;
const PRODUCT_ID = "abiogenesis";
const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const SYSTEM_INTERFACE_REF = "abg.schema.gtl-graph-function";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalBytes(value) {
  return Buffer.from(canonicalizeIJson(value), "utf8");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
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

function systemContributionRow(input) {
  return Object.freeze({
    canonicalHandle: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
    publicKind: "graph_function",
    ownerProductId: PRODUCT_ID,
    ownerVersion: input.version,
    declarationRef: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
    contractRef: "abg.schema.gtl-graph-function",
    interfaceRef: SYSTEM_INTERFACE_REF,
    locator: {
      kind: "module_declaration",
      modulePath: T223_ABG_SYSTEM_MODULE_PATH,
      moduleDigest: input.moduleDigest,
      declarationRef: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE
    },
    compatibility: {
      abgVersionRange: input.version,
      requiredProductRefs: [PRODUCT_ID],
      requiredContractRefs: [
        "abg.schema.gtl-graph-function",
        "abg.schema.gtl-module"
      ],
      requiredCapabilityRefs: [
        "abg.capability.catalog.invoke-graph-function@5",
        "abg.capability.module.publish@5"
      ]
    },
    readinessRefs: ["readiness://abiogenesis/system-catalog/ds1"],
    proofRefs: ["proof://t223/abg-system-catalog-identity"],
    policyRefs: [input.resolvedPolicyRef],
    capabilityRefs: ["abg.capability.catalog.invoke-graph-function@5"],
    provenanceRefs: [
      "build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_DERIVATION.md"
    ],
    refinementOfHandle: null,
    overrideOfHandle: null
  });
}

function consensusContributionRow(input) {
  const systemRow = systemContributionRow(input);
  return Object.freeze({
    ...systemRow,
    canonicalHandle: T223_ABG_CONSENSUS_CANONICAL_HANDLE,
    declarationRef: T223_ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    contractRef: CONSENSUS_REQUEST_SCHEMA_REF,
    interfaceRef: "interface://abg/consensus/governed-rounds",
    locator: Object.freeze({
      ...systemRow.locator,
      declarationRef: T223_ABG_CONSENSUS_GRAPH_FUNCTION_REF
    }),
    compatibility: Object.freeze({
      ...systemRow.compatibility,
      requiredContractRefs: Object.freeze([
        ...systemRow.compatibility.requiredContractRefs,
        "abg.schema.consensus-request",
        "abg.schema.consensus-reviewer-response",
        "abg.schema.consensus-result"
      ])
    }),
    readinessRefs: Object.freeze([
      "readiness://abiogenesis/consensus/a5"
    ]),
    proofRefs: Object.freeze([
      "proof://a5/consensus/exact-claim-agreement",
      "proof://a5/consensus/system-publication"
    ]),
    policyRefs: Object.freeze([
      input.resolvedPolicyRef,
      "policy://abg/consensus/recursion-stops-by-declared-law"
    ])
  });
}

function catalogSummaries(catalog) {
  return Object.freeze({
    contractRefs: Object.freeze(
      catalog.rows
        .filter((row) => row.contractKind !== "capability")
        .map((row) => row.contractId)
        .sort(compareText)
    ),
    capabilityRefs: Object.freeze(
      catalog.rows
        .filter((row) => row.contractKind === "capability")
        .map((row) => row.contractId)
        .sort(compareText)
    )
  });
}

async function detachedSidecars(input) {
  const artifactDigest = sha256(await readFile(input.artifactPath));
  const moduleDigest = sha256(
    await readFile(path.join(PACKAGE_ROOT, T223_ABG_SYSTEM_MODULE_PATH))
  );
  const version = input.publication.packageManifest.version;
  const descriptorId = `descriptor://abiogenesis/${version}`;
  const contributionId = `contribution://abiogenesis/${version}`;
  const contributionBasis = {
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId,
    contributionDigest: ZERO_DIGEST,
    descriptorId,
    descriptorDigest: ZERO_DIGEST,
    productId: PRODUCT_ID,
    productVersion: version,
    artifactDigest,
    rows: (() => {
      const rowInput = {
        moduleDigest,
        resolvedPolicyRef:
          input.publication.publication.manifest.runtimeSystemProfile
            .resolvedPolicy.resolvedPolicyBundleRef,
        version
      };
      return [
        systemContributionRow(rowInput),
        consensusContributionRow(rowInput)
      ];
    })()
  };
  const contributionDigest = contributionManifestDigest(contributionBasis);
  const summaries = catalogSummaries(input.publication.publication.catalog);
  const descriptorBasis = {
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId,
    descriptorDigest: ZERO_DIGEST,
    publisher: PRODUCT_ID,
    productId: PRODUCT_ID,
    packageName: PACKAGE_NAME,
    version,
    distributionArtifactDigest: artifactDigest,
    productContentDigest:
      input.publication.publication.manifest.productContentDigest,
    contributionManifestId: contributionId,
    contributionManifestDigest: contributionDigest,
    dependencies: [],
    abgCompatibility: version,
    contractRefs: summaries.contractRefs,
    capabilityRefs: summaries.capabilityRefs,
    provenanceRefs: ["proof://t223/abiogenesis-packed-candidate"]
  };
  const descriptor = admitCatalogProductDescriptor({
    ...descriptorBasis,
    descriptorDigest: descriptorDigest(descriptorBasis)
  });
  const contribution = admitCatalogContributionManifest({
    ...contributionBasis,
    contributionDigest,
    descriptorDigest: descriptor.descriptorDigest
  });
  return Object.freeze({ artifactDigest, contribution, descriptor });
}

export async function prepareT223AbgCandidate(input) {
  const outputRoot = path.resolve(input.outputRoot);
  await mkdir(path.join(outputRoot, "artifacts"), { recursive: true });
  const publication = await prepareAbgProductPublication();
  await checkAbgProductPublication(publication);
  const artifactPath = packCandidate(outputRoot);
  const sidecars = await detachedSidecars({ artifactPath, publication });
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
      expectedArtifactDigest: sidecars.artifactDigest,
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
