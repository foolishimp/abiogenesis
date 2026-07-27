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

export async function setupInstalledCliHarness(context, packageRoot, options = {}) {
  const scratch = options.scratchPath === undefined
    ? await mkdtemp(join(tmpdir(), "abi5-root-cli-"))
    : options.scratchPath;
  if (options.scratchPath !== undefined) {
    await rm(scratch, { force: true, recursive: true });
    await mkdir(scratch, { recursive: true });
  }
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);
  const { stdout: packStdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(packStdout);
  const artifactPath = join(artifacts, packResult.filename);
  const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  const candidateBasis = await readCandidateBasis(packageRoot);
  const cliHost = join(scratch, "cli-host");
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
  const installedPackageRoot = join(
    cliHost,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const gtl = await importInstalledPackageExport(
    { cliHost },
    "@abiogenesis/typescript-tenant/gtl",
    `harness=${Date.now()}`,
  );
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
    cliHost,
    installedPackageRoot,
    sourcePackageRoot: packageRoot,
    cliPath: join(cliHost, "node_modules/.bin/abg.cli"),
    codexPath: join(cliHost, "node_modules/.bin/abg.codex"),
    rootPublication,
  };
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
  const graphFunctionRef = options.graphFunctionRef ??
    "graph-function://abiogenesis/conformance/hello-world@5";
  const authorizedActorRef = options.authorizedActorRef ??
    "actor://abiogenesis/t286/trusted-developer";
  const runPayload = transformRunPayload({
    installInvocationRef: refs.install,
    workspaceBindingInvocationRef: refs.bind,
    catalogViewInvocationRef: refs.view,
    programRef,
    graphFunctionRef,
    actorRef: authorizedActorRef,
    ...(refs.applications.length === 0
      ? {}
      : {
          catalogApplicationInvocationRefs: refs.applications,
        }),
    input: options.input ?? {
      kind: "hello_world_input",
      schemaVersion: "5.0.0",
      subject: options.subject ?? "World",
    },
    eventLogPath,
  });
  const transcript = [
    invocation("abg.operation.product.verify", "artifact", refs.verify, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
    invocation("abg.operation.product.install", "verified_artifact", refs.install, {
      verifiedInvocationRef: refs.verify,
      artifactPath: harness.artifactPath,
      targetRoot: productConsumer,
    }),
    invocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRef: refs.install,
      workspaceId: options.workspaceId ?? `workspace://t286/${label}`,
      canonicalRoot: workspaceRoot,
      authorizedActorRef,
      authorityManifestRef: options.authorityManifestRef ??
        `manifest://t286/${label}/workspace-authority`,
      roots: {
        toolchainRoot: productConsumer,
        productRoot: installedRoot,
        eventLogRoot,
        runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
        projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
        archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
      },
    }),
    invocation("abg.operation.catalog.admit", "module_publication", refs.catalog, {
      publication: harness.rootPublication,
      verifiedInvocationRef: refs.verify,
      workspaceBindingInvocationRef: refs.bind,
    }),
    invocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogInvocationRef: refs.catalog,
      allowlist: options.allowlist ?? [graphFunctionRef],
    }),
    ...(options.catalogApplications ?? []).map((application, index) =>
      invocation(
        "abg.operation.catalog.apply",
        application.applicationVariant,
        refs.applications[index],
        {
          catalogViewInvocationRef: refs.view,
          contributorRef: authorizedActorRef,
          handle: application.handle,
          productInstallInvocationRef: refs.install,
          ...(application.applicationVariant === "node_type"
            ? { target: application.nodeTypeTarget }
            : {}),
          value: application.value,
        },
      )),
    invocation("abg.operation.run.invoke", "direct", refs.run, runPayload),
  ];
  const transcriptPath = join(scenarioRoot, "root-transcript.jsonl");
  await writeFile(
    transcriptPath,
    `${transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  return {
    label,
    refs,
    productConsumer,
    workspaceRoot,
    eventLogRoot,
    eventLogPath,
    installedRoot,
    transcript,
    transcriptPath,
  };
}

export function runInstalledCli(harness, scenario, options = {}) {
  return new Promise((resolveRun) => {
    execFile(
      harness.cliPath,
      ["--jsonl", scenario.transcriptPath],
      {
        cwd: harness.cliHost,
        env: { ...process.env, ...options.environment, NODE_OPTIONS: "" },
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const outcomes = stdout.trim().length === 0
          ? []
          : stdout.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
        resolveRun({
          exitCode: error === null ? 0 : Number(error.code ?? 1),
          stdout,
          stderr,
          outcomes,
        });
      },
    );
  });
}

export function runInstalledCodex(harness, scenario, options = {}) {
  return new Promise((resolveRun) => {
    execFile(
      harness.codexPath,
      [
        "--cli",
        harness.cliPath,
        "--jsonl",
        scenario.transcriptPath,
      ],
      {
        cwd: harness.cliHost,
        env: { ...process.env, ...options.environment, NODE_OPTIONS: "" },
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const outcomes = stdout.trim().length === 0
          ? []
          : stdout.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
        resolveRun({
          exitCode: error === null ? 0 : Number(error.code ?? 1),
          stdout,
          stderr,
          outcomes,
        });
      },
    );
  });
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

export async function applyInstalledTranscriptPrefix(
  harness,
  scenario,
  count = 5,
) {
  const publicApi = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `scenario=${encodeURIComponent(scenario.label)}`,
  );
  const operationContext = publicApi.createRootOperationContext();
  const outcomes = [];
  for (const invocation of scenario.transcript.slice(0, count)) {
    outcomes.push(await publicApi.applyRootPublicInvocation(operationContext, invocation));
  }
  return { operationContext, outcomes, publicApi };
}
