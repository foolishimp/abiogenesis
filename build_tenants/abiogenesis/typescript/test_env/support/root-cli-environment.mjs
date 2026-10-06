import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { readCandidateBasis } from "./candidate-basis.mjs";
import { prepareLanguageSmokeFixture } from "./language-smoke-fixture.mjs";

const execFileAsync = promisify(execFile);

function selectedFrozenArtifact(options) {
  const explicit = options.frozenArtifact ?? null;
  const environment = process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH === undefined &&
      process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST === undefined &&
      process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256 === undefined
    ? null
    : {
      artifactPath: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH,
      installHost: process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST,
      artifactSha256: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256,
    };
  const selected = explicit ?? environment;
  if (selected === null) return null;
  for (const field of ["artifactPath", "installHost", "artifactSha256"]) {
    if (typeof selected[field] !== "string" || selected[field].length === 0) {
      throw new TypeError(`frozen artifact mode requires ${field}`);
    }
  }
  return {
    artifactPath: selected.artifactPath,
    installHost: selected.installHost,
    artifactSha256: selected.artifactSha256.startsWith("sha256:")
      ? selected.artifactSha256
      : `sha256:${selected.artifactSha256}`,
  };
}

export function constructClosedCatalogReadinessBasis({
  abg,
  artifactTruth,
  verifiedProducts,
  resolvedLock,
  installInvocationRefs,
  workspaceBindingInvocationRef,
  publications,
}) {
  if (
    artifactTruth?.kind !== "exact_prefix_artifact_truth_projection" ||
    !Array.isArray(installInvocationRefs) ||
    installInvocationRefs.length !== verifiedProducts.length
  ) {
    throw new TypeError(
      "closed catalog readiness requires exact ABG artifact-owner projections",
    );
  }
  const admittedInstalls = installInvocationRefs.map((invocationRef) =>
    abg.projectAdmittedProductInstallByInvocationRef(
      artifactTruth,
      invocationRef,
    ));
  if (admittedInstalls.some((projection) => projection === null)) {
    throw new TypeError("closed catalog readiness lacks one admitted ProductInstall owner");
  }
  const admittedWorkspace =
    abg.projectAdmittedWorkspaceBindingByInvocationRef(
      artifactTruth,
      workspaceBindingInvocationRef,
      resolvedLock,
    );
  if (admittedWorkspace === null) {
    throw new TypeError("closed catalog readiness lacks its admitted WorkspaceBinding owner");
  }
  const installedProducts = admittedInstalls.map((projection) =>
    projection.candidate
  );
  return {
    workspaceBinding: admittedWorkspace.candidate,
    resolvedLock,
    verifiedProducts,
    installedProducts,
    publications,
  };
}

export async function setupInstalledCliHarness(context, packageRoot, options = {}) {
  const frozenArtifact = selectedFrozenArtifact(options);
  const scratch = options.scratchPath === undefined
    ? await mkdtemp(join(tmpdir(), "abi5-root-cli-"))
    : options.scratchPath;
  if (options.scratchPath !== undefined) {
    await rm(scratch, { force: true, recursive: true });
    await mkdir(scratch, { recursive: true });
  }
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  let artifactPath;
  let cliHost;
  let installedPackageRoot;
  if (frozenArtifact === null) {
    const artifacts = join(scratch, "artifacts");
    await mkdir(artifacts);
    const { stdout: packStdout } = await execFileAsync(
      "npm",
      ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
      { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
    );
    const [packResult] = JSON.parse(packStdout);
    artifactPath = join(artifacts, packResult.filename);
    cliHost = join(scratch, "cli-host");
    await mkdir(cliHost);
    await writeFile(join(cliHost, "package.json"), `${JSON.stringify({
      name: "abiogenesis-root-cli-host",
      version: "0.0.0",
      private: true,
      type: "module",
    })}\n`, "utf8");
    await execFileAsync(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--offline",
        artifactPath,
      ],
      { cwd: cliHost, maxBuffer: 10 * 1024 * 1024 },
    );
    installedPackageRoot = join(
      cliHost,
      "node_modules",
      "@abiogenesis",
      "typescript-tenant",
    );
  } else {
    artifactPath = frozenArtifact.artifactPath;
    cliHost = frozenArtifact.installHost;
    installedPackageRoot = join(
      cliHost,
      "node_modules",
      "@abiogenesis",
      "typescript-tenant",
    );
  }
  const packageJson = JSON.parse(
    await readFile(join(installedPackageRoot, "package.json"), "utf8"),
  );
  const persistedCandidateBasis = await readCandidateBasis(packageRoot);
  const candidateManifest = JSON.parse(
    await readFile(
      join(installedPackageRoot, "product-toolchain-manifest.json"),
      "utf8",
    ),
  );
  const gtl = await importInstalledPackageExport(
    { cliHost },
    "@abiogenesis/typescript-tenant/gtl",
    `harness=${Date.now()}`,
  );
  const product = await importInstalledPackageExport(
    { cliHost },
    "@abiogenesis/typescript-tenant/product",
    `harness=${Date.now()}`,
  );
  if (frozenArtifact !== null) {
    const artifactDigest = product.sha256Bytes(await readFile(artifactPath));
    if (artifactDigest !== frozenArtifact.artifactSha256) {
      throw new TypeError(
        `frozen artifact digest differs from the authorized subject: ${artifactDigest}`,
      );
    }
  }
  const candidateBasis = options.candidateBasisSource === undefined || options.candidateBasisSource === "packed_artifact"
    ? {
        ...persistedCandidateBasis,
        artifactDigest: product.sha256Bytes(await readFile(artifactPath)),
        productContentDigest: candidateManifest.productContentDigest,
        manifestDigest: product.sha256Canonical(candidateManifest),
        productId: candidateManifest.productId,
        packageName: candidateManifest.packageName,
        packageVersion: candidateManifest.packageVersion,
      }
    : persistedCandidateBasis;
  const publicationBasis = {
    productId: candidateBasis.productId,
    artifactDigest: candidateBasis.artifactDigest,
    productContentDigest: candidateBasis.productContentDigest,
    productManifestDigest: candidateBasis.manifestDigest,
    packageName: candidateBasis.packageName,
    packageVersion: candidateBasis.packageVersion,
  };
  const publicationConstructors = {
    worksite_construction: gtl.constructWorksiteConstructionModulePublication,
    worksite_command_execution:
      gtl.constructWorksiteCommandExecutionModulePublication,
  };
  const rootPublicationKinds = options.rootPublicationKinds ?? ["worksite_construction"];
  const corePublications = rootPublicationKinds.map((kind) => {
    const construct = publicationConstructors[kind];
    if (typeof construct !== "function") {
      throw new TypeError(`unknown root publication kind: ${String(kind)}`);
    }
    return construct(publicationBasis);
  });
  const prepareFixture = options.prepareFixture ??
    (options.rootPublicationKinds === undefined ? prepareLanguageSmokeFixture : null);
  const fixture = prepareFixture === null ? null : await prepareFixture({ scratch, product, gtl, abiPublication: corePublications[0] });
  const fixturePublication = fixture === null ? null : await fixture.loadInstalledPublication({
    installedRoot: fixture.sourceRoot, gtl, product,
  });
  const rootPublications = fixturePublication === null ? corePublications : [fixturePublication, ...corePublications];
  const [rootPublication] = rootPublications;
  if (rootPublication === undefined) {
    throw new TypeError("root CLI harness requires at least one publication");
  }
  return {
    scratch,
    artifactPath,
    artifactRef: basename(artifactPath),
    packageJson,
    candidateBasis,
    candidateManifest,
    cliHost,
    installedPackageRoot,
    sourcePackageRoot: packageRoot,
    cliPath: join(cliHost, "node_modules/.bin/abg.cli"),
    codexPath: join(cliHost, "node_modules/.bin/abg.codex"),
    rootPublication,
    rootPublications,
    corePublications,
    fixture,
    product,
  };
}

export function installedCliPackageRoot(harness) {
  return harness.installedPackageRoot ??
    join(
      harness.cliHost,
      "node_modules",
      "@abiogenesis",
      "typescript-tenant",
    );
}

export async function resolveInstalledPackageExport(harness, specifier) {
  const packageRoot = installedCliPackageRoot(harness);
  const packageJson = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8"),
  );
  const packageName = packageJson.name;
  const exportKey = specifier === packageName
    ? "."
    : specifier.startsWith(`${packageName}/`)
    ? `./${specifier.slice(packageName.length + 1)}`
    : null;
  const target = exportKey === null
    ? null
    : packageJson.exports?.[exportKey]?.import;
  if (typeof target !== "string") {
    throw new TypeError(
      `${specifier} is not one declared installed package export`,
    );
  }
  const resolved = resolve(packageRoot, target);
  const relation = relative(packageRoot, resolved);
  if (
    relation.length === 0 ||
    relation === ".." ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation)
  ) {
    throw new TypeError(`${specifier} export escapes the installed package`);
  }
  return resolved;
}

export async function importInstalledPackageExport(
  harness,
  specifier,
  query = `installed=${Date.now()}`,
) {
  const resolved = await resolveInstalledPackageExport(harness, specifier);
  return import(`${pathToFileURL(resolved).href}?${query}`);
}
