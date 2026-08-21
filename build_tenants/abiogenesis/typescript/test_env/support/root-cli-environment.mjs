import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "./candidate-basis.mjs";

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

function invocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://t286/root-cli",
    payload,
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
  const candidateBasis = options.candidateBasisSource === "packed_artifact"
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
  const rootPublication = gtl.constructHelloWorldModulePublication({
    productId: candidateBasis.productId,
    artifactDigest: candidateBasis.artifactDigest,
    productContentDigest: candidateBasis.productContentDigest,
    productManifestDigest: candidateBasis.manifestDigest,
    packageName: candidateBasis.packageName,
    packageVersion: candidateBasis.packageVersion,
  });
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
    product,
  };
}

export function constructCliTransportRequest({
  acquisition,
  invocation,
}) {
  if (
    typeof acquisition !== "object" ||
    acquisition === null ||
    typeof invocation !== "object" ||
    invocation === null
  ) {
    throw new TypeError(
      "CLI transport request requires explicit acquisition and one Public invocation",
    );
  }
  return {
    kind: "abg_cli_transport_request",
    schemaVersion: "5.0.0",
    acquisition,
    invocation,
  };
}

export async function writeCliTransportRequest(path, input) {
  const request = constructCliTransportRequest(input);
  await writeFile(path, `${JSON.stringify(request)}\n`, "utf8");
  return request;
}

async function executeTransportProgram(
  programPath,
  programArguments,
  transcriptPath,
  options = {},
) {
  const transportRequest = JSON.parse(await readFile(transcriptPath, "utf8"));
  let exitCode = 0;
  let stdout = "";
  let stderr = "";
  try {
    const result = await execFileAsync(
      programPath,
      programArguments,
      {
        cwd: options.cwd,
        env: { ...process.env, ...options.environment, NODE_OPTIONS: "" },
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
      },
    );
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    exitCode = Number(error.code ?? 1);
    stdout = String(error.stdout ?? "");
    stderr = String(error.stderr ?? "");
  }
  const lines = stdout.trim().length === 0
    ? []
    : stdout.trim().split(/\r?\n/u);
  let transportResult = null;
  let transportRefusal = null;
  if (lines.length === 1) {
    const decoded = JSON.parse(lines[0]);
    if (decoded.kind === "abg_cli_transport_result") {
      transportResult = decoded;
    } else {
      transportRefusal = decoded;
    }
  } else if (lines.length > 1) {
    throw new TypeError("installed CLI emitted more than one transport result");
  }
  return {
    exitCode,
    stdout,
    stderr,
    transportRequest,
    transportResult,
    transportRefusal,
    transcriptPath,
    executor: options.executor,
  };
}

async function executeInstalledCliTransport(
  harness,
  transcriptPath,
  options = {},
) {
  return executeTransportProgram(
    harness.cliPath,
    ["--jsonl", transcriptPath],
    transcriptPath,
    { ...options, cwd: harness.cliHost, executor: "abg.cli" },
  );
}

async function executeInstalledCodexTransport(
  harness,
  transcriptPath,
  options = {},
) {
  return executeTransportProgram(
    harness.codexPath,
    [
      "--cli",
      options.cliPath ?? harness.cliPath,
      "--jsonl",
      transcriptPath,
    ],
    transcriptPath,
    { ...options, cwd: harness.cliHost, executor: "abg.codex" },
  );
}

function exactTransportOutcome(run) {
  const outcome = run.transportResult?.outcome;
  if (typeof outcome !== "object" || outcome === null) {
    throw new TypeError(
      `installed CLI transport did not return one Public outcome: ${run.stdout}${run.stderr}`,
    );
  }
  return outcome;
}

export async function buildRootCliScenario(
  harness,
  label,
  transformRunPayload = (payload) => payload,
  options = {},
) {
  const scenarioRoot = join(harness.scratch, label);
  const productConsumer = options.productConsumer ??
    join(scenarioRoot, "product-consumer");
  const workspaceRoot = options.workspaceRoot ??
    join(scenarioRoot, "workspace");
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const eventLogPath = join(
    eventLogRoot,
    options.eventLogFile ?? "abi5-root-001.events.jsonl",
  );
  await mkdir(scenarioRoot, { recursive: true });
  await mkdir(workspaceRoot, { recursive: true });
  const prefix = `invocation://t286/${label}`;
  const refs = {
    verify: `${prefix}/product-verify`,
    resolve: `${prefix}/product-resolve`,
    install: `${prefix}/product-install`,
    bind: `${prefix}/workspace-bind`,
    catalog: `${prefix}/catalog-admit`,
    view: `${prefix}/catalog-view`,
    applications: (options.catalogApplications ?? []).map(
      (_application, index) => `${prefix}/catalog-apply-${index}`,
    ),
    run: `${prefix}/run-invoke`,
  };
  const installedRoot = join(
    productConsumer,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const programRef = options.programRef ??
    "program://abiogenesis/conformance/hello-world@5";
  const catalogHandle = options.catalogHandle ??
    "graph-function://abiogenesis/conformance/hello-world@5";
  const authorizedActorRef = options.authorizedActorRef ??
    "actor://abiogenesis/t286/trusted-developer";
  const workspaceId = options.workspaceId ?? `workspace://t286/${label}`;
  const authorityManifestRef = options.authorityManifestRef ??
    `manifest://t286/${label}/workspace-authority`;
  const roots = {
    toolchainRoot: productConsumer,
    productRoot: installedRoot,
    eventLogRoot,
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  };
  const allowlist = options.allowlist ?? [catalogHandle];
  const transportExecutor = options.transportExecutor ?? "cli";
  if (transportExecutor !== "cli" && transportExecutor !== "codex") {
    throw new TypeError("root CLI scenario requires one explicit transport executor");
  }
  const transportRuns = [];
  const setupTranscript = [];
  const setupOutcomes = [];
  let closeHandoff = null;
  const runTransport = async (request, ordinal) => {
    const transcriptPath = join(
      scenarioRoot,
      `transport-${String(ordinal).padStart(2, "0")}.jsonl`,
    );
    const acquisition = closeHandoff === null
      ? { kind: "new", eventLogPath }
      : { kind: "reopen", closeHandoff };
    await writeCliTransportRequest(transcriptPath, {
      acquisition,
      invocation: request,
    });
    const transportRun = transportExecutor === "cli"
      ? await executeInstalledCliTransport(harness, transcriptPath)
      : await executeInstalledCodexTransport(harness, transcriptPath);
    if (transportRun.transportResult === null) {
      throw new Error(
        `root CLI transport refused: ${transportRun.stdout}${transportRun.stderr}`,
      );
    }
    closeHandoff = transportRun.transportResult.closeHandoff;
    transportRuns.push(transportRun);
    return exactTransportOutcome(transportRun);
  };

  let verifyRequest = invocation("abg.operation.product.verify", "artifact", refs.verify, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    });
  if (options.setupRequestTransform !== undefined) {
    verifyRequest = options.setupRequestTransform(
      structuredClone(verifyRequest),
      0,
    );
  }
  setupTranscript.push(verifyRequest);
  const prefixBeforeVerify = Buffer.alloc(0);
  const verifyOutcome = await runTransport(verifyRequest, 0);
  setupOutcomes.push(verifyOutcome);
  if (verifyOutcome.disposition !== "succeeded") {
    if (options.expectedSetupRefusalIndex !== 0) {
      throw new Error(JSON.stringify(verifyOutcome));
    }
    return refusedSetupScenario({
      index: 0,
      outcome: verifyOutcome,
      prefixBefore: prefixBeforeVerify,
      prefixAfter: await readFile(eventLogPath),
    });
  }
  const verifiedProduct = verifyOutcome.result;

  let resolveRequest = invocation(
      "abg.operation.product.resolve",
      "verified_product_set",
      refs.resolve,
      {
        verifiedProductInputs: [{
          artifactPath: harness.artifactPath,
          verifiedProduct,
        }],
      },
    );
  if (options.setupRequestTransform !== undefined) {
    resolveRequest = options.setupRequestTransform(
      structuredClone(resolveRequest),
      1,
    );
  }
  setupTranscript.push(resolveRequest);
  const resolvePrefixBefore = options.expectedSetupRefusalIndex === 1
    ? await readFile(eventLogPath)
    : null;
  const resolveOutcome = await runTransport(resolveRequest, 1);
  setupOutcomes.push(resolveOutcome);
  if (resolveOutcome.disposition !== "succeeded") {
    if (options.expectedSetupRefusalIndex !== 1) {
      throw new Error(JSON.stringify(resolveOutcome));
    }
    return refusedSetupScenario({
      index: 1,
      outcome: resolveOutcome,
      prefixBefore: resolvePrefixBefore,
      prefixAfter: await readFile(eventLogPath),
    });
  }
  const resolvedLock = resolveOutcome.result;

  let installRequest = invocation(
    "abg.operation.product.install",
    "verified_artifact",
    refs.install,
    {
      artifactPath: harness.artifactPath,
      verifiedProduct,
      resolvedLock,
      targetRoot: productConsumer,
    },
  );
  if (options.setupRequestTransform !== undefined) {
    installRequest = options.setupRequestTransform(
      structuredClone(installRequest),
      2,
    );
  }
  setupTranscript.push(installRequest);
  const installPrefixBefore = options.expectedSetupRefusalIndex === 2
    ? await readFile(eventLogPath)
    : null;
  const installOutcome = await runTransport(installRequest, 2);
  setupOutcomes.push(installOutcome);
  if (installOutcome.disposition !== "succeeded") {
    if (options.expectedSetupRefusalIndex !== 2) {
      throw new Error(JSON.stringify(installOutcome));
    }
    return refusedSetupScenario({
      index: 2,
      outcome: installOutcome,
      prefixBefore: installPrefixBefore,
      prefixAfter: await readFile(eventLogPath),
    });
  }

  let workspaceRequest = invocation(
    "abg.operation.workspace.bind",
    "exact_product_set",
    refs.bind,
    {
      installInvocationRef: refs.install,
      workspaceId,
      canonicalRoot: workspaceRoot,
      authorizedActorRef,
      authorityManifestRef,
      roots,
    },
  );
  if (options.setupRequestTransform !== undefined) {
    workspaceRequest = options.setupRequestTransform(
      structuredClone(workspaceRequest),
      3,
    );
  }
  setupTranscript.push(workspaceRequest);
  const workspacePrefixBefore = options.expectedSetupRefusalIndex === 3
    ? await readFile(eventLogPath)
    : null;
  const workspaceOutcome = await runTransport(workspaceRequest, 3);
  setupOutcomes.push(workspaceOutcome);
  if (workspaceOutcome.disposition !== "succeeded") {
    if (options.expectedSetupRefusalIndex !== 3) {
      throw new Error(JSON.stringify(workspaceOutcome));
    }
    return refusedSetupScenario({
      index: 3,
      outcome: workspaceOutcome,
      prefixBefore: workspacePrefixBefore,
      prefixAfter: await readFile(eventLogPath),
    });
  }
  if (options.expectedSetupRefusalIndex !== undefined) {
    throw new Error(
      `expected setup refusal at index ${options.expectedSetupRefusalIndex}`,
    );
  }

  const installedAbg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `root-cli-owner-projection=${encodeURIComponent(label)}`,
  );
  const artifactTruth = installedAbg.projectExactPrefixArtifactTruth(
    closeHandoff.prefix,
  );
  if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection") {
    throw new Error(`root CLI artifact truth refused: ${JSON.stringify(artifactTruth)}`);
  }
  const admittedInstall =
    installedAbg.projectAdmittedProductInstallByInvocationRef(
      artifactTruth,
      refs.install,
    );
  if (admittedInstall === null) {
    throw new Error("root CLI owner cannot rehydrate its admitted ProductInstall");
  }
  const admittedWorkspace =
    installedAbg.projectAdmittedWorkspaceBindingByInvocationRef(
      artifactTruth,
      refs.bind,
      resolvedLock,
    );
  if (admittedWorkspace === null) {
    throw new Error("root CLI owner cannot rehydrate its admitted WorkspaceBinding");
  }
  const installedProduct = admittedInstall.candidate;
  const workspaceBinding = admittedWorkspace.candidate;
  const readinessBasis = {
    workspaceBinding,
    resolvedLock,
    verifiedProducts: [verifiedProduct],
    installedProducts: [installedProduct],
    publications: [harness.rootPublication],
  };
  if (!Array.isArray(options.catalogApplications)) {
    throw new TypeError(
      "root CLI scenario requires an explicit catalogApplications array",
    );
  }
  let operationOrdinal = 4;
  const executionTranscript = [];
  const preRunOutcomes = [...setupOutcomes];
  const executePreRunRequest = async (request) => {
    const transformed = options.preRunRequestTransform === undefined
      ? request
      : options.preRunRequestTransform(
          structuredClone(request),
          operationOrdinal,
        );
    executionTranscript.push(transformed);
    const outcome = await runTransport(transformed, operationOrdinal);
    preRunOutcomes.push(outcome);
    operationOrdinal += 1;
    if (outcome.disposition !== "succeeded") {
      throw new Error(JSON.stringify(outcome));
    }
    return outcome;
  };
  const catalogOutcome = await executePreRunRequest(invocation(
    "abg.operation.catalog.admit",
    "module_publication",
    refs.catalog,
    { readinessBasis },
  ));
  const catalog = catalogOutcome.result;
  const viewOutcome = await executePreRunRequest(invocation(
    "abg.operation.catalog.view",
    "allowlist",
    refs.view,
    { catalog, allowlist },
  ));
  const catalogView = viewOutcome.result;
  const applications = [];
  for (const [index, application] of options.catalogApplications.entries()) {
    const applicationOutcome = await executePreRunRequest(invocation(
      "abg.operation.catalog.apply",
      application.applicationVariant,
      refs.applications[index],
      {
        catalog,
        catalogView,
        contributorRef: authorizedActorRef,
        handle: application.handle,
        ...(application.applicationVariant === "node_type"
          ? { target: application.nodeTypeTarget }
          : {}),
        value: application.value,
      },
    ));
    applications.push(applicationOutcome.result);
  }
  const runPayload = transformRunPayload({
    installInvocationRef: refs.install,
    workspaceBindingInvocationRef: refs.bind,
    catalog,
    catalogView,
    applications,
    programRef,
    catalogHandle,
    actorRef: authorizedActorRef,
    input: options.input ?? {
      kind: "hello_world_input",
      schemaVersion: "5.0.0",
      subject: options.subject ?? "World",
    },
    eventLogPath,
    runtimePrefixAuthority: closeHandoff,
  });
  const runRequest = invocation(
    "abg.operation.run.invoke",
    "direct",
    refs.run,
    runPayload,
  );
  executionTranscript.push(runRequest);
  const transcript = [...setupTranscript, ...executionTranscript];
  const transcriptPath = join(scenarioRoot, "root-transcript.jsonl");
  const finalTransportRequest = await writeCliTransportRequest(transcriptPath, {
    acquisition: { kind: "reopen", closeHandoff },
    invocation: runRequest,
  });

  return {
    label,
    refs,
    productConsumer,
    workspaceRoot,
    eventLogRoot,
    eventLogPath,
    installedRoot,
    transcript,
    executionTranscript,
    setupOutcomes,
    preRunOutcomes,
    transportRuns,
    transportExecutor,
    transportRequests: transportRuns.map((run) => run.transportRequest),
    transportResults: transportRuns.map((run) => run.transportResult),
    ownerProjections: {
      artifactTruth,
      admittedInstall,
      admittedWorkspace,
    },
    closeHandoff,
    finalTransportRequest,
    transcriptPath,
  };

  function refusedSetupScenario(setupRefusal) {
    const transcriptPath = transportRuns.at(-1).transcriptPath;
    return {
      label,
      refs,
      productConsumer,
      workspaceRoot,
      eventLogRoot,
      eventLogPath,
      installedRoot,
      transcript: setupTranscript,
      executionTranscript: [],
      setupOutcomes,
      setupRefusal,
      transportRuns,
      transportExecutor,
      transportRequests: transportRuns.map((run) => run.transportRequest),
      transportResults: transportRuns.map((run) => run.transportResult),
      closeHandoff,
      transcriptPath,
    };
  }
}

function projectTransportOutcomes(transportRuns) {
  return transportRuns.flatMap((run) =>
    run.transportResult?.outcome === undefined
      ? []
      : [run.transportResult.outcome]
  );
}

function completeTransportRun(scenario, finalRun) {
  const transportRuns = [...(scenario.transportRuns ?? []), finalRun];
  const executors = new Set(transportRuns.map((run) => run.executor));
  if (executors.size !== 1) {
    throw new TypeError(
      "one operation sequence must retain one selected installed transport",
    );
  }
  const multiTransportOutcomeProjection = projectTransportOutcomes(transportRuns);
  return {
    ...finalRun,
    transportRuns,
    transportRequests: transportRuns.map((run) => run.transportRequest),
    transportResults: transportRuns
      .map((run) => run.transportResult)
      .filter((result) => result !== null),
    multiTransportOutcomeProjection,
    outcomes: multiTransportOutcomeProjection,
  };
}

export async function runInstalledCli(harness, scenario, options = {}) {
  if (
    scenario.transportExecutor !== undefined &&
    scenario.transportExecutor !== "cli"
  ) {
    throw new TypeError("CLI tail cannot follow calls executed through another transport");
  }
  const finalRun = await executeInstalledCliTransport(
    harness,
    scenario.transcriptPath,
    options,
  );
  return completeTransportRun(scenario, finalRun);
}

export async function runInstalledCodex(harness, scenario, options = {}) {
  if (
    scenario.transportExecutor !== undefined &&
    scenario.transportExecutor !== "codex"
  ) {
    throw new TypeError("Codex tail cannot follow calls executed directly through CLI");
  }
  const finalRun = await executeInstalledCodexTransport(
    harness,
    scenario.transcriptPath,
    options,
  );
  return completeTransportRun(scenario, finalRun);
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

export async function probeInstalledDefinitionBindingInFreshProcess(
  harness,
  basis,
  label,
) {
  const requestPath = join(
    harness.scratch,
    `installed-definition-binding-${label}.json`,
  );
  await writeFile(requestPath, `${JSON.stringify(basis)}\n`, "utf8");
  const probe = [
    'import { readFile } from "node:fs/promises";',
    'import { loadVerifiedInstalledDefinitionBinding } from "@abiogenesis/typescript-tenant/installed-loader";',
    `const basis = JSON.parse(await readFile(${JSON.stringify(requestPath)}, "utf8"));`,
    "const result = await loadVerifiedInstalledDefinitionBinding(basis);",
    "const { invoke, ...receipt } = result;",
    "console.log(JSON.stringify({ ...receipt, callableType: typeof invoke }));",
  ].join("\n");
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    ["--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  if (stderr.trim().length !== 0) {
    throw new TypeError(`installed definition binding probe failed: ${stderr}`);
  }
  return JSON.parse(stdout);
}

export async function applyInstalledTranscriptPrefix(
  harness,
  scenario,
  count = 6,
) {
  if (
    count < 4 ||
    count > (scenario.preRunOutcomes?.length ?? 0) ||
    scenario.transportRuns?.[count - 1]?.transportResult === null ||
    scenario.transportRuns?.[count - 1]?.transportResult === undefined
  ) {
    throw new TypeError(
      "installed transcript prefix requires a completed CLI transport boundary",
    );
  }
  const publicApi = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `scenario=${encodeURIComponent(scenario.label)}`,
  );
  const authority =
    scenario.transportRuns[count - 1].transportResult.closeHandoff;
  const operationContext = publicApi.reopenRootOperationContext(authority);
  const outcomes = scenario.preRunOutcomes.slice(0, count);
  return { operationContext, outcomes, publicApi };
}
