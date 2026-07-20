import assert from "node:assert/strict";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import test from "node:test";

import {
  runAbgCli
} from "../../build/semantic/code/src/app/m04/public_cli/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const DEFINITION_DIGEST = `sha256:${"1".repeat(64)}`;

function definition(operationId, coordinate) {
  return Object.freeze({
    definitionKey: Object.freeze({
      operationId,
      memberKind: "variant",
      variant: operationId === "abg.operation.run.invoke" ? "invoke" : "assess"
    }),
    definitionDigest: DEFINITION_DIGEST,
    cliCoordinate: coordinate,
    authoritySlotRequirements: Object.freeze({ workspace: "exactly_one" }),
    adapterExitMap: Object.freeze({
      acceptedTerminal: 0,
      acceptedNonTerminal: 1,
      refused: 1,
      invalidInvocation: 2,
      adapterFailure: 70
    })
  });
}

function catalogFor(selectedDefinition) {
  return Object.freeze({
    kind: "public_contract_catalog",
    catalogId: "abg.catalog.test.t270.cli-live-steering",
    catalogVersion: "5.0.0",
    catalogDigest: `sha256:${"2".repeat(64)}`,
    rows: Object.freeze([Object.freeze({
      contractId: selectedDefinition.definitionKey.operationId,
      operationContract: Object.freeze({
        kind: "abg_public_operation_definition_family",
        definitions: Object.freeze([selectedDefinition])
      })
    })])
  });
}

function invocationFor(selectedDefinition, catalog, steeringIdentity) {
  return Object.freeze({
    definitionKey: selectedDefinition.definitionKey,
    definitionDigest: selectedDefinition.definitionDigest,
    contractCatalog: Object.freeze({
      kind: "public_contract_catalog_coordinate",
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest
    }),
    authority: Object.freeze({
      transportSteering: Object.freeze({
        state: "declared_transport_steering",
        steeringRef: steeringIdentity.steeringRef,
        steeringDigest: steeringIdentity.steeringDigest,
        provenanceRefs: Object.freeze([])
      })
    })
  });
}

function output() {
  const stdout = [];
  const stderr = [];
  return Object.freeze({
    stdout,
    stderr,
    io: Object.freeze({
      cwd: () => "/operator",
      stdout: (value) => stdout.push(value),
      stderr: (value) => stderr.push(value)
    })
  });
}

function runtimeFixture(input) {
  let contextCalls = 0;
  let sdkCalls = 0;
  return Object.freeze({
    get contextCalls() {
      return contextCalls;
    },
    get sdkCalls() {
      return sdkCalls;
    },
    runtime: Object.freeze({
      sdk: Object.freeze({
        async invoke() {
          sdkCalls += 1;
          return Object.freeze({
            outcomeKind: "result",
            value: Object.freeze({ accepted: true })
          });
        }
      }),
      async readCanonicalJsonFile(path) {
        if (path === "/operator/invocation.json") return input.invocation;
        if (path === "/operator/steering.json") return input.steeringFile;
        throw new Error(`unexpected input path ${path}`);
      },
      async readBytes() {
        return new Uint8Array();
      },
      async loadPublicContractCatalog() {
        return input.catalog;
      },
      createWorkspacePathContext() {
        throw new Error("unexpected workspace-path context");
      },
      createProductIntakeContext() {
        throw new Error("unexpected product-intake context");
      },
      async createWorkspaceBindingContext() {
        throw new Error("unexpected workspace-binding context");
      },
      async createBoundWorkspaceContext(contextInput) {
        contextCalls += 1;
        const factory =
          contextInput.operatorCapabilityFactoriesBySteeringRef?.[
            input.steeringIdentity.steeringRef
          ];
        assert.equal(typeof factory, "function");
        const binding = factory({
          workspaceRoot: "/workspace",
          archiveRoot: "/archive",
          steeringRef: input.steeringIdentity.steeringRef,
          steeringDigest: input.steeringIdentity.steeringDigest
        });
        assert.equal(binding.kind, "live_capability_binding");
        assert.notEqual(
          binding.projection.capabilityRef,
          input.steeringIdentity.steeringRef
        );
        assert.notEqual(binding.pluginCapabilities.liveFpDispatch, undefined);
        assert.notEqual(binding.pluginCapabilities.liveFpEvaluator, undefined);
        return Object.freeze({
          kind: "bound_workspace",
          effects: Object.freeze({
            async readRuntimeEventBytes() {
              return new Uint8Array();
            },
            createRuntimeEventSink() {
              return () => undefined;
            }
          })
        });
      },
      appendRuntimeEvents() {},
      createRuntimeEventLog() {
        throw new Error("unexpected runtime event log");
      }
    })
  });
}

async function withGenericTransport(t) {
  const root = await mkdtemp(join(tmpdir(), "abg-t270-cli-steering-"));
  const command = join(root, "fp-transport");
  await writeFile(command, "#!/bin/sh\nexit 0\n", "utf8");
  await chmod(command, 0o755);
  const priorPath = process.env.PATH;
  process.env.PATH = `${root}${delimiter}${priorPath ?? ""}`;
  t.after(async () => {
    if (priorPath === undefined) delete process.env.PATH;
    else process.env.PATH = priorPath;
    await rm(root, { recursive: true, force: true });
  });
}

async function liveFixture(t, steeringFile) {
  await withGenericTransport(t);
  const selectedDefinition = definition(
    "abg.operation.run.invoke",
    "run invoke"
  );
  const catalog = catalogFor(selectedDefinition);
  const admittedSteering = Object.freeze({
    agent: "generic",
    model: null,
    profile: "local-spawn",
    timeoutMs: 1_000
  });
  const steeringDigest = stableSha256Digest(admittedSteering);
  const steeringIdentity = Object.freeze({
    steeringRef: `steering:${steeringDigest}`,
    steeringDigest
  });
  return Object.freeze({
    selectedDefinition,
    catalog,
    steeringIdentity,
    steeringFile,
    invocation: invocationFor(
      selectedDefinition,
      catalog,
      steeringIdentity
    )
  });
}

test("T-270 abg.cli joins one admitted live steering body by its exact authority identity", async (t) => {
  const steering = Object.freeze({
    agent: "generic",
    model: null,
    profile: "local-spawn",
    timeoutMs: 1_000
  });
  const fixture = await liveFixture(t, steering);
  const runtime = runtimeFixture(fixture);
  const emitted = output();
  const exitCode = await runAbgCli(
    [
      "run",
      "invoke",
      "--invocation",
      "invocation.json",
      "--contract-catalog",
      "catalog.json",
      "--workspace-root",
      "/workspace",
      "--live-steering-file",
      "steering.json"
    ],
    emitted.io,
    runtime.runtime
  );

  assert.equal(exitCode, 0, emitted.stderr.join(""));
  assert.equal(runtime.contextCalls, 1);
  assert.equal(runtime.sdkCalls, 1);
  assert.deepEqual(emitted.stderr, []);
});

test("T-270 abg.cli rejects malformed live steering before context or SDK effects", async (t) => {
  const fixture = await liveFixture(t, Object.freeze({
    agent: "generic",
    model: null,
    profile: "local-spawn",
    timeoutMs: 0
  }));
  const runtime = runtimeFixture(fixture);
  const emitted = output();
  const exitCode = await runAbgCli(
    [
      "run",
      "invoke",
      "--invocation",
      "invocation.json",
      "--contract-catalog",
      "catalog.json",
      "--workspace-root",
      "/workspace",
      "--live-steering-file",
      "steering.json"
    ],
    emitted.io,
    runtime.runtime
  );

  assert.equal(exitCode, 2);
  assert.equal(runtime.contextCalls, 0);
  assert.equal(runtime.sdkCalls, 0);
  assert.match(emitted.stderr[0], /timeoutMs/u);
});

test("T-270 abg.cli rejects a live steering body that differs from admitted authority", async (t) => {
  const fixture = await liveFixture(t, Object.freeze({
    agent: "generic",
    model: null,
    profile: "local-spawn",
    timeoutMs: 2_000
  }));
  const runtime = runtimeFixture(fixture);
  const emitted = output();
  const exitCode = await runAbgCli(
    [
      "run",
      "invoke",
      "--invocation",
      "invocation.json",
      "--contract-catalog",
      "catalog.json",
      "--workspace-root",
      "/workspace",
      "--live-steering-file",
      "steering.json"
    ],
    emitted.io,
    runtime.runtime
  );

  assert.equal(exitCode, 2);
  assert.equal(runtime.contextCalls, 0);
  assert.equal(runtime.sdkCalls, 0);
  assert.match(
    emitted.stderr[0],
    /live steering body differs from admitted authority/u
  );
});

test("T-270 abg.cli confines --live-steering-file to run.invoke", async (t) => {
  const runFixture = await liveFixture(t, Object.freeze({
    agent: "generic",
    model: null,
    profile: "local-spawn",
    timeoutMs: 1_000
  }));
  const selectedDefinition = definition(
    "abg.operation.result.assess",
    "result assess"
  );
  const catalog = catalogFor(selectedDefinition);
  const fixture = Object.freeze({
    ...runFixture,
    selectedDefinition,
    catalog,
    invocation: invocationFor(
      selectedDefinition,
      catalog,
      runFixture.steeringIdentity
    )
  });
  const runtime = runtimeFixture(fixture);
  const emitted = output();
  const exitCode = await runAbgCli(
    [
      "result",
      "assess",
      "--invocation",
      "invocation.json",
      "--contract-catalog",
      "catalog.json",
      "--workspace-root",
      "/workspace",
      "--live-steering-file",
      "steering.json"
    ],
    emitted.io,
    runtime.runtime
  );

  assert.equal(exitCode, 2);
  assert.equal(runtime.contextCalls, 0);
  assert.equal(runtime.sdkCalls, 0);
  assert.match(emitted.stderr[0], /valid only for abg\.operation\.run\.invoke/u);
});
