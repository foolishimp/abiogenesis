import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const AUTHORIZED_ARTIFACT_SHA256 =
  "sha256:ab6dd512678b873d1ef4f4a07c8286ff3621ea86b39627e6061652110238c878";
const AUTHORIZED_INSTALLED_TREE_SHA256 =
  "sha256:79eb7eff709aa276ed23cdca6a61be8273b732babc2e985862156b00e36502f4";
const ORDERED_PACKAGE_EXPORTS = ["./gtl", "./product", "./hog", "./abg"];
const PROOF_KEYS = [
  {
    key: "s1",
    assertion: "installed scalar composition",
    expectedPassCount: 1,
    testName: "ABI5-ROOT-001 composes seven installed Public owners into ABG replay",
    testSourceRef: "test_env/tests/abi5-root-installed-function-chain.test.mjs",
  },
  {
    key: "s2",
    assertion: "installed mixed composition with distinct-process replay equality",
    expectedPassCount: 1,
    testName: "Wave 1 S2 composes installed transformation, live F_P, and reopened continuation",
    testSourceRef: "test_env/tests/m5-installed-external-product.test.mjs",
  },
  {
    key: "requestLineageGuard",
    assertion: "accepted F04-A carrier rejects substituted request lineage before evidence admission",
    expectedPassCount: 1,
    testName: "F04-A exact request-bound raw result admission is pure and decision-exact",
    testSourceRef: "test_env/tests/t287-f04a-probabilistic-result-candidate.test.mjs",
  },
  {
    key: "sameLengthPredecessorGuard",
    assertion: "same-length durable predecessor mutation refuses before append",
    expectedPassCount: 2,
    testName: "M5 refuses a same-length durable predecessor mutation before expected-prefix admission",
    testSourceRef: "test_env/tests/m5-event-store-reopen.test.mjs",
  },
  {
    key: "foreignSuffixGuard",
    assertion: "foreign or ambiguous suffix is not truncated as rollback",
    expectedPassCount: 2,
    testName: "M5 preserves a foreign suffix and poisons the append context instead of truncating ambiguous bytes",
    testSourceRef: "test_env/tests/m5-event-store-reopen.test.mjs",
  },
];
const TENANT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// This is a bounded evidence selection, not a replacement contract catalog.
// Installed JavaScript and declaration bytes remain the callable/type truth.
const INTERFACE_EVIDENCE_SELECTION = [
  {
    packageExportPath: "./gtl",
    owner: "GTL",
    symbol: "resolveProgramStart",
    declarationPath: "build/code/src/gtl/public_start.d.ts",
    inputCarriers: ["GtlProgram", "ProgramStartRequest"],
    successCarriers: ["ResolvedProgramStart"],
    refusalCarriers: ["ProgramStartRefusal"],
    runtimeEventKinds: [],
    replayProjections: [],
  },
  {
    packageExportPath: "./product",
    owner: "Product",
    symbol: "constructDirectInvocation",
    declarationPath: "build/code/src/product/invocation.d.ts",
    inputCarriers: [
      "WorkspaceBinding",
      "GraphFunctionCatalogView",
      "GtlProgram",
      "GraphFunctionCatalogEntry",
      "RawAdmittedValue",
      "InvocationPolicyBasis",
      "CapabilityGrant",
      "InvocationAuthority",
    ],
    successCarriers: ["PublicInvocationCandidate"],
    refusalCarriers: ["InvocationConstructionRefusal"],
    runtimeEventKinds: ["invocation_admitted", "invocation_refused"],
    replayProjections: ["ReplayState"],
  },
  {
    packageExportPath: "./abg",
    owner: "ABG",
    symbol: "admitProbabilisticResultCandidate",
    declarationPath: "build/code/src/abg/probabilistic_result.d.ts",
    inputCarriers: ["ProbabilisticResultAdmissionInput"],
    successCarriers: ["ContractAdmittedProbabilisticResultCandidate"],
    refusalCarriers: ["ProbabilisticResultAdmissionRefusal"],
    runtimeEventKinds: [
      "actor_result_artifact_observed",
      "c_call_evidenced",
      "c_call_result_admitted",
    ],
    replayProjections: ["ReplayActorProcessState", "ReplayCCallState"],
  },
  {
    packageExportPath: "./abg",
    owner: "ABG",
    symbol: "projectExecutableRetryInput",
    declarationPath: "build/code/src/abg/retry.d.ts",
    inputCarriers: ["ProjectExecutableRetryInputRequest"],
    successCarriers: ["ExecutableRetryInput"],
    refusalCarriers: ["ExecutableRetryInputRefusal"],
    runtimeEventKinds: ["retry_attempt_opened", "retry_progress_recorded"],
    replayProjections: [
      "ReplayState",
      "RunSemanticReplayProjection",
      "projectRunSemanticReplayProjection",
    ],
  },
];

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function sha256Canonical(value) {
  return sha256Bytes(Buffer.from(canonicalJson(value), "utf8"));
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function normalizedDigest(value, label) {
  const digest = requiredString(value, label);
  const normalized = digest.startsWith("sha256:") ? digest : `sha256:${digest}`;
  if (!/^sha256:[0-9a-f]{64}$/.test(normalized)) {
    throw new TypeError(`${label} must be one lowercase SHA-256 digest`);
  }
  return normalized;
}

function pathInside(root, candidate, label) {
  const rootPath = resolve(root);
  const candidatePath = resolve(candidate);
  const offset = relative(rootPath, candidatePath);
  if (offset === "" || (!offset.startsWith(`..${sep}`) && offset !== "..")) {
    return candidatePath;
  }
  throw new TypeError(`${label} resolves outside ${rootPath}`);
}

async function fileBlob(filePath) {
  const bytes = await readFile(filePath);
  return {
    byteLength: bytes.byteLength,
    sha256: sha256Bytes(bytes),
  };
}

async function installedTreeInventory(packageRoot) {
  const rows = [];
  let totalFileBytes = 0;

  async function walk(directory, directoryRef = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
    for (const entry of entries) {
      const entryRef = directoryRef === "" ? entry.name : `${directoryRef}/${entry.name}`;
      const entryPath = join(directory, entry.name);
      const metadata = await lstat(entryPath);
      if (metadata.isSymbolicLink()) {
        rows.push({ kind: "symlink", path: entryRef, target: await readlink(entryPath) });
      } else if (metadata.isDirectory()) {
        rows.push({ kind: "directory", path: entryRef });
        await walk(entryPath, entryRef);
      } else if (metadata.isFile()) {
        const bytes = await readFile(entryPath);
        totalFileBytes += bytes.byteLength;
        rows.push({
          kind: "file",
          path: entryRef,
          byteLength: bytes.byteLength,
          sha256: sha256Bytes(bytes),
        });
      } else {
        throw new TypeError(`unsupported installed-tree entry: ${entryRef}`);
      }
    }
  }

  await walk(packageRoot);
  return {
    scope: "installed_package_root",
    entryCount: rows.length,
    fileCount: rows.filter((row) => row.kind === "file").length,
    directoryCount: rows.filter((row) => row.kind === "directory").length,
    symlinkCount: rows.filter((row) => row.kind === "symlink").length,
    totalFileBytes,
    inventoryDigest: sha256Canonical(rows),
  };
}

function exactTapSummary(stdout, label) {
  const text = stdout.toString("utf8");
  function count(name) {
    const matches = [...text.matchAll(
      new RegExp(`^# ${name} ([0-9]+)$`, "gmu"),
    )];
    if (matches.length !== 1) {
      throw new TypeError(`${label} must contain one TAP ${name} count`);
    }
    return Number(matches[0][1]);
  }
  return {
    tests: count("tests"),
    pass: count("pass"),
    fail: count("fail"),
  };
}

async function normalizeProofOutcome(
  raw,
  proof,
  artifactPath,
  artifactBlob,
  installHost,
) {
  const { key, assertion, expectedPassCount, testName, testSourceRef } = proof;
  if (
    raw === null ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    canonicalJson(Object.keys(raw).sort()) !==
      canonicalJson(["captureManifestPath"])
  ) {
    throw new TypeError(
      `proofResults.${key} must contain only captureManifestPath`,
    );
  }
  const manifestPath = pathInside(
    dirname(artifactPath),
    requiredString(
      raw.captureManifestPath,
      `proofResults.${key}.captureManifestPath`,
    ),
    `proofResults.${key} capture manifest`,
  );
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest) ||
    manifest.kind !== "wave1_proof_execution_capture" ||
    manifest.schemaVersion !== "5.0.0"
  ) {
    throw new TypeError(`proofResults.${key} has an invalid capture manifest`);
  }
  const { captureDigest, ...captureBody } = manifest;
  if (
    normalizedDigest(captureDigest, `${key} captureDigest`) !==
      sha256Canonical(captureBody)
  ) {
    throw new TypeError(`proofResults.${key} capture digest mismatch`);
  }

  const captureRoot = dirname(manifestPath);
  async function verifiedStream(streamName) {
    const coordinate = manifest.result?.[streamName];
    if (coordinate === null || typeof coordinate !== "object") {
      throw new TypeError(`${key} lacks ${streamName} coordinates`);
    }
    const path = pathInside(
      captureRoot,
      join(
        captureRoot,
        requiredString(coordinate.path, `${key} ${streamName} path`),
      ),
      `${key} ${streamName}`,
    );
    const bytes = await readFile(path);
    const blob = {
      byteLength: bytes.byteLength,
      sha256: sha256Bytes(bytes),
    };
    if (
      coordinate.byteLength !== blob.byteLength ||
      normalizedDigest(coordinate.sha256, `${key} ${streamName} sha256`) !==
        blob.sha256
    ) {
      throw new TypeError(`${key} ${streamName} bytes differ from capture`);
    }
    return { path, bytes, blob };
  }
  const stdout = await verifiedStream("stdout");
  const stderr = await verifiedStream("stderr");
  if (manifest.result?.exitCode !== 0 || manifest.result?.signal !== null) {
    throw new TypeError(`${key} capture did not exit successfully`);
  }
  if (
    manifest.executable !== resolve(process.execPath) ||
    manifest.cwd !== TENANT_ROOT
  ) {
    throw new TypeError(`${key} capture used an unexpected executable or cwd`);
  }

  const selectedPattern =
    key === "sameLengthPredecessorGuard" || key === "foreignSuffixGuard"
      ? "same-length durable predecessor mutation|foreign suffix and poisons"
      : testName;
  const expectedArgv = [
    "--test",
    "--test-reporter=tap",
    `--test-name-pattern=${selectedPattern}`,
    testSourceRef,
  ];
  if (canonicalJson(manifest.argv) !== canonicalJson(expectedArgv)) {
    throw new TypeError(`${key} capture argv differs from the selected lane`);
  }

  const expectedEnvironmentKeys = [
    "ABI5_WAVE1_FROZEN_ARTIFACT_PATH",
    "ABI5_WAVE1_FROZEN_ARTIFACT_SHA256",
    "ABI5_WAVE1_FROZEN_INSTALL_HOST",
    "HOME",
    "LANG",
    "LC_ALL",
    "NODE_OPTIONS",
    "PATH",
    "TMPDIR",
    "TZ",
  ].sort();
  if (
    manifest.environment === null ||
    typeof manifest.environment !== "object" ||
    Array.isArray(manifest.environment) ||
    canonicalJson(Object.keys(manifest.environment).sort()) !==
      canonicalJson(expectedEnvironmentKeys) ||
    manifest.environment.ABI5_WAVE1_FROZEN_ARTIFACT_PATH !== artifactPath ||
    manifest.environment.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256 !==
      AUTHORIZED_ARTIFACT_SHA256 ||
    manifest.environment.ABI5_WAVE1_FROZEN_INSTALL_HOST !== installHost ||
    manifest.environment.LANG !== "C" ||
    manifest.environment.LC_ALL !== "C" ||
    manifest.environment.NODE_OPTIONS !== "" ||
    manifest.environment.TZ !== "UTC" ||
    typeof manifest.environment.HOME !== "string" ||
    manifest.environment.HOME.length === 0 ||
    typeof manifest.environment.PATH !== "string" ||
    manifest.environment.PATH.length === 0 ||
    typeof manifest.environment.TMPDIR !== "string" ||
    manifest.environment.TMPDIR.length === 0
  ) {
    throw new TypeError(`${key} capture environment differs from the allowlist`);
  }

  const expectedTestSourcePath = join(TENANT_ROOT, testSourceRef);
  const currentTestSourceBlob = await fileBlob(expectedTestSourcePath);
  if (
    manifest.artifact?.path !== artifactPath ||
    canonicalJson(manifest.artifact.before) !== canonicalJson(artifactBlob) ||
    canonicalJson(manifest.artifact.after) !== canonicalJson(artifactBlob) ||
    manifest.testSource?.path !== expectedTestSourcePath ||
    canonicalJson(manifest.testSource.before) !==
      canonicalJson(currentTestSourceBlob) ||
    canonicalJson(manifest.testSource.after) !==
      canonicalJson(currentTestSourceBlob)
  ) {
    throw new TypeError(`${key} capture source or artifact bytes are stale`);
  }

  const tap = exactTapSummary(stdout.bytes, key);
  const selectedTestPassed = stdout.bytes.toString("utf8")
    .split(/\r?\n/u)
    .some((line) =>
      /^ok [0-9]+ - /u.test(line) &&
      line.endsWith(testName) &&
      !line.includes("# SKIP"));
  if (
    tap.tests !== expectedPassCount ||
    tap.pass !== expectedPassCount ||
    tap.fail !== 0 ||
    !selectedTestPassed
  ) {
    throw new TypeError(
      `${key} capture does not prove its selected TAP assertion`,
    );
  }

  const manifestBlob = {
    byteLength: manifestBytes.byteLength,
    sha256: sha256Bytes(manifestBytes),
  };
  const evidenceBody = {
    proofKey: key,
    assertion,
    expectedTestName: testName,
    expectedPassCount,
    captureManifestPath: manifestPath,
    captureManifestBlob: manifestBlob,
    captureDigest,
    executable: manifest.executable,
    argv: manifest.argv,
    cwd: manifest.cwd,
    environment: manifest.environment,
    exitCode: manifest.result.exitCode,
    signal: manifest.result.signal,
    stdout: { path: stdout.path, ...stdout.blob },
    stderr: { path: stderr.path, ...stderr.blob },
    testSource: { path: expectedTestSourcePath, ...currentTestSourceBlob },
    artifact: { path: artifactPath, ...artifactBlob },
    tap,
  };
  return {
    ...evidenceBody,
    disposition: "passed",
    evidenceDigest: sha256Canonical(evidenceBody),
  };
}

async function normalizeProofResults(
  proofResults,
  artifactPath,
  artifactBlob,
  installHost,
) {
  if (proofResults === null || typeof proofResults !== "object" || Array.isArray(proofResults)) {
    throw new TypeError("proofResults must contain S1, S2, and the three guard receipts");
  }
  return Promise.all(PROOF_KEYS.map((proof) =>
    normalizeProofOutcome(
      proofResults[proof.key],
      proof,
      artifactPath,
      artifactBlob,
      installHost,
    )));
}

async function resolveInstalledExport(packageRoot, packageJson, selection) {
  const exportBinding = packageJson.exports?.[selection.packageExportPath];
  if (exportBinding === null || typeof exportBinding !== "object") {
    throw new TypeError(`installed package lacks ${selection.packageExportPath}`);
  }
  const importRef = requiredString(
    exportBinding.import,
    `package.json exports ${selection.packageExportPath}.import`,
  );
  const declarationRef = requiredString(
    exportBinding.types,
    `package.json exports ${selection.packageExportPath}.types`,
  );
  const importPath = pathInside(packageRoot, join(packageRoot, importRef), "installed export");
  const exportDeclarationPath = pathInside(
    packageRoot,
    join(packageRoot, declarationRef),
    "installed export declaration",
  );
  const ownerDeclarationPath = pathInside(
    packageRoot,
    join(packageRoot, selection.declarationPath),
    "installed owner declaration",
  );
  const installedModule = await import(pathToFileURL(importPath).href);
  if (typeof installedModule[selection.symbol] !== "function") {
    throw new TypeError(
      `${selection.packageExportPath} does not resolve callable ${selection.symbol}`,
    );
  }
  for (const replayProjection of selection.replayProjections) {
    if (/^[a-z]/.test(replayProjection) && !(replayProjection in installedModule)) {
      throw new TypeError(
        `${selection.packageExportPath} lacks replay projector ${replayProjection}`,
      );
    }
  }
  const ownerDeclarationText = await readFile(ownerDeclarationPath, "utf8");
  const requiredDeclarationNames = [
    selection.symbol,
    ...selection.inputCarriers,
    ...selection.successCarriers,
    ...selection.refusalCarriers,
  ];
  for (const declarationName of requiredDeclarationNames) {
    if (!ownerDeclarationText.includes(declarationName)) {
      throw new TypeError(
        `${selection.declarationPath} does not declare ${declarationName}`,
      );
    }
  }
  return {
    packageExportPath: selection.packageExportPath,
    owner: selection.owner,
    selectedInstalledSymbol: selection.symbol,
    resolvedRuntimeType: typeof installedModule[selection.symbol],
    installedImportPath: importRef,
    exportDeclarationPath: declarationRef,
    exportDeclarationBlob: await fileBlob(exportDeclarationPath),
    ownerDeclarationPath: selection.declarationPath,
    ownerDeclarationBlob: await fileBlob(ownerDeclarationPath),
    inputCarriers: selection.inputCarriers,
    successCarriers: selection.successCarriers,
    refusalCarriers: selection.refusalCarriers,
    runtimeEventKinds: selection.runtimeEventKinds,
    replayProjections: selection.replayProjections,
  };
}

export async function constructWave1InterfaceReceipt({
  artifactPath,
  installHost,
  expectedArtifactSha256 = AUTHORIZED_ARTIFACT_SHA256,
  proofResults,
}) {
  const authorizedArtifactPath = resolve(requiredString(artifactPath, "artifactPath"));
  const authorizedInstallHost = resolve(requiredString(installHost, "installHost"));
  const expectedDigest = normalizedDigest(expectedArtifactSha256, "expectedArtifactSha256");
  if (expectedDigest !== AUTHORIZED_ARTIFACT_SHA256) {
    throw new TypeError("receipt construction is limited to the frozen Wave 1 artifact");
  }

  const artifactBlob = await fileBlob(authorizedArtifactPath);
  if (artifactBlob.sha256 !== expectedDigest) {
    throw new TypeError(
      `frozen artifact digest mismatch: expected ${expectedDigest}, received ${artifactBlob.sha256}`,
    );
  }
  const packageRoot = pathInside(
    authorizedInstallHost,
    join(authorizedInstallHost, "node_modules", "@abiogenesis", "typescript-tenant"),
    "installed package root",
  );
  const canonicalPackageRoot = await realpath(packageRoot);
  const beforeInventory = await installedTreeInventory(canonicalPackageRoot);
  if (beforeInventory.inventoryDigest !== AUTHORIZED_INSTALLED_TREE_SHA256) {
    throw new TypeError("installed package tree differs from the frozen Wave 1 subject");
  }
  const packageJsonPath = join(canonicalPackageRoot, "package.json");
  const manifestPath = join(canonicalPackageRoot, "product-toolchain-manifest.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const productManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (packageJson.name !== PACKAGE_NAME || productManifest.packageName !== PACKAGE_NAME) {
    throw new TypeError("installed package and Product manifest identity disagree");
  }
  if (packageJson.version !== productManifest.packageVersion) {
    throw new TypeError("installed package and Product manifest version disagree");
  }
  const actualOrderedExports = ORDERED_PACKAGE_EXPORTS.filter((exportPath) =>
    Object.hasOwn(packageJson.exports ?? {}, exportPath));
  if (canonicalJson(actualOrderedExports) !== canonicalJson(ORDERED_PACKAGE_EXPORTS)) {
    throw new TypeError("installed package lacks the ordered Wave 1 owner exports");
  }

  const interfaces = [];
  for (const selection of INTERFACE_EVIDENCE_SELECTION) {
    interfaces.push(await resolveInstalledExport(
      canonicalPackageRoot,
      packageJson,
      selection,
    ));
  }

  const productModule = await import(
    pathToFileURL(join(canonicalPackageRoot, packageJson.exports["./product"].import)).href
  );
  const manifestCanonicalDigest = sha256Canonical(productManifest);
  if (productModule.sha256Canonical(productManifest) !== manifestCanonicalDigest) {
    throw new TypeError("receipt canonicalization differs from installed Product canonicalization");
  }
  const eventStoreModulePath = join(canonicalPackageRoot, "build/code/src/abg/event_store.js");
  const eventStoreDeclarationPath = join(canonicalPackageRoot, "build/code/src/abg/event_store.d.ts");
  const eventStoreModule = await import(pathToFileURL(eventStoreModulePath).href);
  const eventContractDigest = normalizedDigest(
    eventStoreModule.ROOT_EVENT_CONTRACT_DIGEST,
    "installed ROOT_EVENT_CONTRACT_DIGEST",
  );
  const abgModule = await import(
    pathToFileURL(join(canonicalPackageRoot, packageJson.exports["./abg"].import)).href
  );
  for (const row of interfaces) {
    for (const eventKind of row.runtimeEventKinds) {
      if (!abgModule.ROOT_EVENT_KIND_VALUES.includes(eventKind)) {
        throw new TypeError(`${row.packageExportPath} cites unknown event kind ${eventKind}`);
      }
    }
  }

  const afterInventory = await installedTreeInventory(canonicalPackageRoot);
  if (
    canonicalJson(beforeInventory) !== canonicalJson(afterInventory) ||
    afterInventory.inventoryDigest !== AUTHORIZED_INSTALLED_TREE_SHA256
  ) {
    throw new TypeError("installed package bytes changed during receipt construction");
  }

  const receiptBody = {
    kind: "wave1_installed_interface_receipt",
    schemaVersion: "5.0.0",
    authorityClass: "derived_evidence_only",
    callableAuthority: "installed exports and declaration bytes",
    artifact: {
      artifactPath: authorizedArtifactPath,
      byteLength: artifactBlob.byteLength,
      sha256: artifactBlob.sha256,
    },
    installedPackage: {
      installHost: authorizedInstallHost,
      packageRoot: canonicalPackageRoot,
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      packageJsonBlob: await fileBlob(packageJsonPath),
      installedTreeBefore: beforeInventory,
      installedTreeAfter: afterInventory,
      installedTreeUnchanged: true,
    },
    productManifest: {
      manifestPath: "product-toolchain-manifest.json",
      manifestBlob: await fileBlob(manifestPath),
      manifestCanonicalDigest,
      productId: productManifest.productId,
      productContentDigest: productManifest.productContentDigest,
      contributionManifestRef: productManifest.contributionManifestRef,
      contributionManifestDigest: productManifest.contributionManifestDigest,
      publicContractCatalogId: productManifest.publicContractCatalog?.catalogId,
      publicContractCatalogDigest: productManifest.publicContractCatalog?.catalogDigest,
    },
    runtimeEventContract: {
      eventContractDigest,
      declarationPath: "build/code/src/abg/event_store.d.ts",
      declarationBlob: await fileBlob(eventStoreDeclarationPath),
      eventKindCount: abgModule.ROOT_EVENT_KIND_VALUES.length,
      eventKindsDigest: sha256Canonical(abgModule.ROOT_EVENT_KIND_VALUES),
    },
    orderedPackageExports: ORDERED_PACKAGE_EXPORTS,
    interfaceEvidenceSelection: interfaces,
    proofOutcomeReceipts: await normalizeProofResults(
      proofResults,
      authorizedArtifactPath,
      artifactBlob,
      authorizedInstallHost,
    ),
    wave2Exclusions: [
      "./public",
      "RootPublicInvocation and the legacy 11-operation/19-definition carrier",
      "definitionKey === operationId",
      "synthetic definitionDigest = hash({ operationId, schemaVersion })",
      "incomplete continuation/response allowlist: approve, answer_escalation, current_intent",
    ],
  };
  return {
    ...receiptBody,
    receiptDigest: sha256Canonical(receiptBody),
  };
}

export async function writeWave1InterfaceReceipt(options) {
  const receiptPath = resolve(requiredString(options.receiptPath, "receiptPath"));
  const receipt = await constructWave1InterfaceReceipt(options);
  await mkdir(dirname(receiptPath), { recursive: true });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  return { receipt, receiptPath, receiptBlob: await fileBlob(receiptPath) };
}

function parseArguments(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (value === undefined) throw new TypeError(`${flag} requires a value`);
    if (flag === "--artifact") parsed.artifactPath = value;
    else if (flag === "--install-host") parsed.installHost = value;
    else if (flag === "--expected-sha256") parsed.expectedArtifactSha256 = value;
    else if (flag === "--proof-results") parsed.proofResultsPath = value;
    else if (flag === "--receipt") parsed.receiptPath = value;
    else throw new TypeError(`unknown argument ${flag}`);
  }
  return parsed;
}

async function main() {
  const argumentsFromCli = parseArguments(process.argv.slice(2));
  const artifactPath = argumentsFromCli.artifactPath ??
    process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH;
  const installHost = argumentsFromCli.installHost ??
    process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST;
  const expectedArtifactSha256 = argumentsFromCli.expectedArtifactSha256 ??
    process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256 ?? AUTHORIZED_ARTIFACT_SHA256;
  const proofResultsPath = argumentsFromCli.proofResultsPath ??
    process.env.ABI5_WAVE1_PROOF_RESULTS_PATH;
  const receiptPath = argumentsFromCli.receiptPath ??
    process.env.ABI5_WAVE1_INTERFACE_RECEIPT_PATH;
  const proofResults = JSON.parse(await readFile(
    resolve(requiredString(proofResultsPath, "proofResultsPath")),
    "utf8",
  ));
  const written = await writeWave1InterfaceReceipt({
    artifactPath,
    installHost,
    expectedArtifactSha256,
    proofResults,
    receiptPath,
  });
  process.stdout.write(`${JSON.stringify({
    receiptPath: written.receiptPath,
    receiptSha256: written.receiptBlob.sha256,
    receiptDigest: written.receipt.receiptDigest,
    artifactSha256: written.receipt.artifact.sha256,
    installedTreeDigest: written.receipt.installedPackage.installedTreeAfter.inventoryDigest,
  })}\n`);
}

if (process.argv[1] !== undefined &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? String(error)}\n`);
    process.exitCode = 1;
  });
}
