import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";

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

export async function setupInstalledCliHarness(context, packageRoot) {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-root-cli-"));
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
  return {
    scratch,
    artifactPath,
    artifactRef: basename(artifactPath),
    packageJson,
    cliHost,
    cliPath: join(cliHost, "node_modules/.bin/abg.cli"),
  };
}

export async function buildRootCliScenario(
  harness,
  label,
  transformRunPayload = (payload) => payload,
) {
  const scenarioRoot = join(harness.scratch, label);
  const productConsumer = join(scenarioRoot, "product-consumer");
  const workspaceRoot = join(scenarioRoot, "workspace");
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const eventLogPath = join(eventLogRoot, "abi5-root-001.json");
  await mkdir(workspaceRoot, { recursive: true });
  const prefix = `invocation://t286/${label}`;
  const refs = {
    verify: `${prefix}/product-verify`,
    install: `${prefix}/product-install`,
    bind: `${prefix}/workspace-bind`,
    catalog: `${prefix}/catalog-admit`,
    view: `${prefix}/catalog-view`,
    run: `${prefix}/run-invoke`,
  };
  const installedRoot = join(
    productConsumer,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const runPayload = transformRunPayload({
    installInvocationRef: refs.install,
    workspaceBindingInvocationRef: refs.bind,
    catalogViewInvocationRef: refs.view,
    programRef: "program://abiogenesis/conformance/hello-world@5",
    graphFunctionRef: "graph-function://abiogenesis/conformance/hello-world@5",
    actorRef: "actor://abiogenesis/t286/trusted-developer",
    input: {
      kind: "hello_world_input",
      schemaVersion: "5.0.0",
      subject: "World",
    },
    eventLogPath,
  });
  const transcript = [
    invocation("abg.operation.product.verify", "artifact", refs.verify, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      expectedProductId: `product://abiogenesis/typescript-tenant@${harness.packageJson.version}`,
      expectedPackageName: harness.packageJson.name,
      expectedPackageVersion: harness.packageJson.version,
    }),
    invocation("abg.operation.product.install", "verified_artifact", refs.install, {
      verifiedInvocationRef: refs.verify,
      artifactPath: harness.artifactPath,
      targetRoot: productConsumer,
    }),
    invocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRef: refs.install,
      workspaceId: `workspace://t286/${label}`,
      canonicalRoot: workspaceRoot,
      authorityManifestRef: `manifest://t286/${label}/workspace-authority`,
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
      verifiedInvocationRef: refs.verify,
      workspaceBindingInvocationRef: refs.bind,
    }),
    invocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogInvocationRef: refs.catalog,
      allowlist: ["graph-function://abiogenesis/conformance/hello-world@5"],
    }),
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

export function runInstalledCli(harness, scenario) {
  return new Promise((resolveRun) => {
    execFile(
      harness.cliPath,
      ["--jsonl", scenario.transcriptPath],
      {
        cwd: harness.cliHost,
        env: { ...process.env, NODE_OPTIONS: "" },
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
