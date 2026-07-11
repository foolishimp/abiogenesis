// Validates: T-223 DS-1 source-blind abg.cli adapter
// Validates: REQ-P-POLICY, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  admitPublicContractCatalog,
  constructAbgCliInvocation,
  constructPublicOperationInvocation,
  resolveAbgCliOperationId,
  runAbgCli
} from "../../build/semantic/code/src/app/m04/index.js";

const tenantRoot = path.resolve(import.meta.dirname, "../..");
const catalogPath = path.join(
  tenantRoot,
  "contracts",
  "public-contract-catalog.json"
);
const workspaceRoot = "/tmp/abg-t223-public-cli";

async function contractCatalog() {
  return admitPublicContractCatalog(
    JSON.parse(await readFile(catalogPath, "utf8"))
  );
}

function sdkWith(overrides) {
  const unexpected = async () => {
    throw new Error("unexpected SDK operation");
  };
  return {
    workspaceCreate: unexpected,
    workspaceOpen: unexpected,
    catalogResolve: unexpected,
    catalogVerify: unexpected,
    installProduct: unexpected,
    catalogBind: unexpected,
    catalogAdmit: unexpected,
    catalogList: unexpected,
    catalogDescribe: unexpected,
    catalogAllow: unexpected,
    catalogInvoke: unexpected,
    readResult: unexpected,
    readReplay: unexpected,
    ...overrides
  };
}

function io() {
  const stdout = [];
  const stderr = [];
  return {
    stdout,
    stderr,
    value: {
      cwd: () => "/operator",
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text)
    }
  };
}

test("abg.cli exposes exactly the DS-1 grammar", () => {
  assert.deepEqual(
    [
      ["workspace", "create"],
      ["workspace", "open"],
      ["catalog", "resolve"],
      ["catalog", "verify"],
      ["catalog", "bind"],
      ["catalog", "admit"],
      ["catalog", "list"],
      ["catalog", "describe"],
      ["catalog", "allow"],
      ["catalog", "invoke"],
      ["install", null],
      ["result", null],
      ["replay", null]
    ].map(([command, subcommand]) =>
      resolveAbgCliOperationId(command, subcommand)
    ),
    [
      "abg.operation.workspace.create",
      "abg.operation.workspace.open",
      "abg.operation.catalog.resolve",
      "abg.operation.catalog.verify",
      "abg.operation.catalog.bind",
      "abg.operation.catalog.admit",
      "abg.operation.catalog.list",
      "abg.operation.catalog.describe",
      "abg.operation.catalog.allow",
      "abg.operation.catalog.invoke",
      "abg.operation.install.install",
      "abg.operation.read.result",
      "abg.operation.read.replay"
    ]
  );
  assert.throws(
    () => resolveAbgCliOperationId("catalog", "start"),
    /outside the DS-1 abg\.cli grammar/u
  );
});

test("abg.cli constructs the bound SDK envelope and renders its exact outcome", async () => {
  const catalog = await contractCatalog();
  const request = { targetRoot: workspaceRoot };
  const expected = constructAbgCliInvocation({
    operationId: "abg.operation.workspace.open",
    request,
    publicContractCatalog: catalog,
    actorRef: null,
    identity: "expected"
  });
  const accepted = Object.freeze({
    kind: "accepted",
    operationId: "abg.operation.workspace.open",
    disposition: "unbound",
    value: Object.freeze({
      manifest: Object.freeze({ kind: "fixture" }),
      disposition: "unbound",
      bindingRef: null,
      configurationRefs: Object.freeze([])
    }),
    provenanceRefs: Object.freeze([]),
    exitClassification: "accepted_terminal"
  });
  let observedInvocation = null;
  let contextCalls = 0;
  const runtime = {
    sdk: sdkWith({
      async workspaceOpen(_context, invocation) {
        observedInvocation = invocation;
        return accepted;
      }
    }),
    readCanonicalJsonFile: async (absolutePath) => {
      assert.equal(absolutePath, "/operator/open.request.json");
      return request;
    },
    loadPublicContractCatalog: async (absolutePath) => {
      assert.equal(absolutePath, "/operator/contracts.json");
      return catalog;
    },
    createWorkspacePathContext(input) {
      contextCalls += 1;
      assert.equal(input.targetRoot, workspaceRoot);
      return { kind: "workspace_path" };
    },
    createProductIntakeContext() {
      throw new Error("unexpected product context");
    },
    async createWorkspaceBindingContext() {
      throw new Error("unexpected binding context");
    },
    async createBoundWorkspaceContext() {
      throw new Error("unexpected bound context");
    }
  };
  const output = io();
  const exitCode = await runAbgCli(
    [
      "workspace",
      "open",
      "--request",
      "open.request.json",
      "--contract-catalog",
      "contracts.json",
      "--workspace-root",
      workspaceRoot
    ],
    output.value,
    runtime
  );

  assert.equal(exitCode, 0, output.stderr.join(""));
  assert.equal(contextCalls, 1);
  assert.notEqual(observedInvocation, null);
  assert.equal(observedInvocation.operationId, expected.operationId);
  assert.equal(
    observedInvocation.operationContractDigest,
    expected.operationContractDigest
  );
  assert.equal(observedInvocation.requestSchemaDigest, expected.requestSchemaDigest);
  assert.deepEqual(observedInvocation.request, expected.request);
  assert.deepEqual(observedInvocation.adapter, {
    kind: "abg_cli",
    ref: "abg.cli"
  });
  assert.deepEqual(JSON.parse(output.stdout[0]), accepted);
  assert.deepEqual(output.stderr, []);
});

test("T-223 native SDK and CLI construct the same catalog-bound operation contract", async () => {
  const catalog = await contractCatalog();
  const request = { targetRoot: workspaceRoot };
  const native = constructPublicOperationInvocation({
    operationId: "abg.operation.workspace.open",
    request,
    publicContractCatalog: catalog,
    invocationId: "sdk-invocation:t223",
    requestId: "sdk-request:t223",
    actorRef: null,
    adapter: { kind: "native_sdk", ref: "sdk://t223/consumer" },
    provenanceRefs: ["proof://t223/native-constructor"]
  });
  const cli = constructAbgCliInvocation({
    operationId: "abg.operation.workspace.open",
    request,
    publicContractCatalog: catalog,
    actorRef: null,
    identity: "cli-constructor-t223"
  });

  assert.deepEqual(
    {
      operationId: native.operationId,
      operationContractVersion: native.operationContractVersion,
      operationContractDigest: native.operationContractDigest,
      requestSchemaId: native.requestSchemaId,
      requestSchemaVersion: native.requestSchemaVersion,
      requestSchemaDigest: native.requestSchemaDigest,
      resultSchemaId: native.resultSchemaId,
      resultSchemaVersion: native.resultSchemaVersion,
      resultSchemaDigest: native.resultSchemaDigest,
      refusalSchemaId: native.refusalSchemaId,
      refusalSchemaVersion: native.refusalSchemaVersion,
      refusalSchemaDigest: native.refusalSchemaDigest,
      request: native.request
    },
    {
      operationId: cli.operationId,
      operationContractVersion: cli.operationContractVersion,
      operationContractDigest: cli.operationContractDigest,
      requestSchemaId: cli.requestSchemaId,
      requestSchemaVersion: cli.requestSchemaVersion,
      requestSchemaDigest: cli.requestSchemaDigest,
      resultSchemaId: cli.resultSchemaId,
      resultSchemaVersion: cli.resultSchemaVersion,
      resultSchemaDigest: cli.resultSchemaDigest,
      refusalSchemaId: cli.refusalSchemaId,
      refusalSchemaVersion: cli.refusalSchemaVersion,
      refusalSchemaDigest: cli.refusalSchemaDigest,
      request: cli.request
    }
  );
  assert.deepEqual(native.adapter, {
    kind: "native_sdk",
    ref: "sdk://t223/consumer"
  });
  assert.deepEqual(native.provenanceRefs, ["proof://t223/native-constructor"]);
});

test("abg.cli rejects malformed request truth before context or SDK effects", async () => {
  const catalog = await contractCatalog();
  let contextCalls = 0;
  let sdkCalls = 0;
  const runtime = {
    sdk: sdkWith({
      async workspaceOpen() {
        sdkCalls += 1;
        throw new Error("must not execute");
      }
    }),
    readCanonicalJsonFile: async () => ({
      targetRoot: workspaceRoot,
      inventedDefault: true
    }),
    loadPublicContractCatalog: async () => catalog,
    createWorkspacePathContext() {
      contextCalls += 1;
      return { kind: "workspace_path" };
    },
    createProductIntakeContext() {
      contextCalls += 1;
      return { kind: "product_intake" };
    },
    async createWorkspaceBindingContext() {
      contextCalls += 1;
      return { kind: "workspace_binding" };
    },
    async createBoundWorkspaceContext() {
      contextCalls += 1;
      return { kind: "bound_workspace" };
    }
  };
  const output = io();
  const exitCode = await runAbgCli(
    [
      "workspace",
      "open",
      "--request",
      "bad.json",
      "--contract-catalog",
      "contracts.json",
      "--workspace-root",
      workspaceRoot
    ],
    output.value,
    runtime
  );

  assert.equal(exitCode, 2);
  assert.equal(contextCalls, 0);
  assert.equal(sdkCalls, 0);
  assert.deepEqual(output.stdout, []);
  assert.match(output.stderr[0], /"exitClassification":"invalid_invocation"/u);
});

test("abg.cli never infers a workspace from cwd", async () => {
  const output = io();
  const exitCode = await runAbgCli(
    [
      "workspace",
      "open",
      "--request",
      "open.json",
      "--contract-catalog",
      "contracts.json"
    ],
    output.value,
    {
      sdk: sdkWith({}),
      readCanonicalJsonFile: async () => {
        throw new Error("must not read request");
      },
      loadPublicContractCatalog: async () => {
        throw new Error("must not read catalog");
      },
      createWorkspacePathContext() {
        throw new Error("must not create context");
      },
      createProductIntakeContext() {
        throw new Error("must not create context");
      },
      async createWorkspaceBindingContext() {
        throw new Error("must not create context");
      },
      async createBoundWorkspaceContext() {
        throw new Error("must not create context");
      }
    }
  );
  assert.equal(exitCode, 2);
  assert.match(output.stderr[0], /--workspace-root is required/u);
});

test("abg.cli workspace create and open use the real Node SDK contexts", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-cli-workspace-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = path.join(root, "workspace");
  const createRequestPath = path.join(root, "create.json");
  const openRequestPath = path.join(root, "open.json");
  await writeFile(
    createRequestPath,
    JSON.stringify({
      targetRoot: workspace,
      authorityMode: "clean_no_project_authority"
    }),
    "utf8"
  );
  await writeFile(
    openRequestPath,
    JSON.stringify({ targetRoot: workspace }),
    "utf8"
  );

  const created = io();
  assert.equal(
    await runAbgCli(
      [
        "workspace",
        "create",
        "--request",
        createRequestPath,
        "--contract-catalog",
        catalogPath,
        "--workspace-root",
        workspace,
        "--actor",
        "actor://t223/cli"
      ],
      created.value
    ),
    0,
    created.stderr.join("")
  );
  const createOutcome = JSON.parse(created.stdout[0]);
  assert.equal(createOutcome.operationId, "abg.operation.workspace.create");
  assert.equal(createOutcome.value.root, workspace);

  const opened = io();
  assert.equal(
    await runAbgCli(
      [
        "workspace",
        "open",
        "--request",
        openRequestPath,
        "--contract-catalog",
        catalogPath,
        "--workspace-root",
        workspace
      ],
      opened.value
    ),
    0,
    opened.stderr.join("")
  );
  const openOutcome = JSON.parse(opened.stdout[0]);
  assert.equal(openOutcome.operationId, "abg.operation.workspace.open");
  assert.equal(openOutcome.disposition, "unbound");
});
