import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  access,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import * as Effect from "effect/Effect";

import {
  buildRootCliScenario,
  importInstalledPackageExport,
  installedCliPackageRoot,
  probeInstalledDefinitionBindingInFreshProcess,
  resolveInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const operationId = "abg.operation.run.invoke";
const sentinel = Object.freeze([
  ["abg.operation.workspace.create#clean", "./product", "WORKSPACE_DEFINITION_BINDINGS", ["create", "clean"]],
  ["abg.operation.workspace.open#open", "./product", "WORKSPACE_DEFINITION_BINDINGS", ["open", "open"]],
  ["abg.operation.product.verify#verify", "./product", "PRODUCT_VERIFICATION_DEFINITION_BINDINGS", ["verify"]],
  ["abg.operation.product.resolve#resolve", "./product", "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS", ["resolve"]],
  ["abg.operation.product.install#install", "./product", "PRODUCT_INSTALL_DEFINITION_BINDINGS", ["install"]],
  ["abg.operation.workspace.bind#bind", "./product", "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS", ["bind"]],
  ["abg.operation.catalog.admit#admit", "./product", "CATALOG_DEFINITION_BINDINGS", ["admit"]],
  ["abg.operation.catalog.view#allowlist", "./product", "CATALOG_DEFINITION_BINDINGS", ["view", "allowlist"]],
  ["abg.operation.run.invoke#invoke", "./product", "RUN_DEFINITION_BINDINGS", ["invoke", "invoke"]],
  ["abg.operation.run.invoke#start", "./product", "RUN_DEFINITION_BINDINGS", ["invoke", "start"]],
  ["abg.operation.project.read#run_status", "./abg", "ABG_PROJECT_READ_DEFINITION_BINDINGS", ["run_status"]],
  ["abg.operation.project.read#run_result", "./abg", "ABG_PROJECT_READ_DEFINITION_BINDINGS", ["run_result"]],
  ["abg.operation.project.read#run_replay", "./abg", "ABG_PROJECT_READ_DEFINITION_BINDINGS", ["run_replay"]],
]);

function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function installedSpecifier(packageName, exportPath) {
  return exportPath === "."
    ? packageName
    : `${packageName}${exportPath.slice(1)}`;
}

function valueAtPath(value, path) {
  return path.reduce((selected, part) => selected?.[part], value);
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function admittedInvocation(product, body, rawRequest = body.request) {
  const invocationDigest = product.sha256Canonical(body);
  return Object.freeze({
    ...body,
    request: rawRequest,
    invocationRef:
      `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
    invocationDigest,
  });
}

function contractCoordinate(publicApi, definition, catalog, slot, definitionRef) {
  const asset = publicApi.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(
    (candidate) => candidate.operationId === definition.definitionKey.operationId,
  );
  assert.ok(asset);
  return Object.freeze({
    contractCatalog: catalog,
    flatRow: Object.freeze({
      contractId: definition.definitionKey.operationId,
      contractVersion: schemaVersion,
      contractDigest: asset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "operation_definition_slot",
      definitionKey: definition.definitionKey,
      slot,
      definitionRef,
    }),
  });
}

function runCall(publicApi, product, memberKey, ordinal, exact = {}) {
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
    (candidate) =>
      candidate.definitionKey.operationId === operationId &&
      candidate.definitionKey.memberKey === memberKey,
  );
  assert.ok(definition);
  const operation = publicApi.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(
    (candidate) => candidate.operationId === operationId,
  );
  const member = operation?.definitions.find(
    (candidate) => candidate.definitionKey.memberKey === memberKey,
  );
  assert.ok(member);
  const catalog = exact.contractCatalog ?? Object.freeze({
    productId: "product://abiogenesis/typescript-tenant@5",
    productContentDigest: product.sha256Canonical({ product: "run-binding-proof" }),
    catalogId: "catalog://abiogenesis/public-contracts@5",
    catalogVersion: schemaVersion,
    catalogDigest: product.sha256Canonical({ catalog: "run-binding-proof" }),
  });
  const program = coordinate(product, `program://w2-05/${memberKey}`);
  const catalogView = coordinate(product, `catalog-view://w2-05/${memberKey}`);
  const inputValue = Object.freeze({ admitted: memberKey });
  const inputContract = coordinate(
    product,
    `contract://w2-05/${memberKey}/input`,
  );
  const admittedInput = Object.freeze({
    contract: inputContract,
    valueRef: `value://w2-05/${memberKey}/input`,
    valueDigest: product.sha256Canonical(inputValue),
    value: inputValue,
  });
  const request = exact.request ?? (memberKey === "invoke"
    ? Object.freeze({
        program,
        catalogHandle: "graph-function://w2-05/direct",
        inputContract,
        input: inputValue,
        catalogView,
        allowlist: Object.freeze([]),
        sourceBasis: Object.freeze({ kind: "none" }),
      })
    : Object.freeze({
        program,
        scope: "program",
        target: Object.freeze({ kind: "next" }),
        until: "converged",
        catalogView,
        allowlist: Object.freeze([]),
        input: admittedInput,
        fhMode: "direct",
        rootMode: "supervised",
        sourceBasis: Object.freeze({ kind: "none" }),
      }));
  const identityRequest = exact.identityRequest ?? request;
  const slots = exact.slots ?? Object.freeze({
    workspace_binding: coordinate(product, `workspace-binding://w2-05/${memberKey}`),
    product_set: Object.freeze([coordinate(product, `product-set://w2-05/${memberKey}`)]),
    dependency_lock: coordinate(product, `product-lock://w2-05/${memberKey}`),
    catalog_scope: Object.freeze({
      catalog: coordinate(product, `catalog://w2-05/${memberKey}`),
      view: catalogView,
      allowlist: Object.freeze([]),
    }),
    execution_program: program,
    graph_function: memberKey === "invoke"
      ? Object.freeze({
          graphFunction: coordinate(product, "graph-function://w2-05/direct"),
          membership: coordinate(product, "program-membership://w2-05/direct"),
        })
      : null,
    input_contract: admittedInput,
    session_policy: coordinate(product, `session-policy://w2-05/${memberKey}`),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...definition.capabilityRefs]),
      grants: Object.freeze([coordinate(product, `capability-grant://w2-05/${memberKey}`)]),
    }),
    actor: Object.freeze({
      actor: coordinate(product, `actor://w2-05/${memberKey}`),
      attribution: coordinate(product, `attribution://w2-05/${memberKey}`),
    }),
    transport_steering: coordinate(product, `transport-steering://w2-05/${memberKey}`),
    verification_references: null,
    execution_basis: null,
  });
  const authorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: product.sha256Canonical(authorityBody),
  });
  const requestDigest = product.sha256Canonical(identityRequest);
  const body = Object.freeze({
    kind: "public_invocation",
    schemaVersion,
    invocationContract: Object.freeze({
      contractCatalog: catalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: schemaVersion,
        contractDigest:
          publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
      }),
      nestedSelector: Object.freeze({
        selectorKind: "schema_definition",
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      }),
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: catalog,
    invocationAuthority,
    requestContract: exact.definitionContracts?.request ?? contractCoordinate(
      publicApi,
      definition,
      catalog,
      "request",
      member.requestContract.definitionRef,
    ),
    requestRef:
      `public-request://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest,
    request: identityRequest,
    expectedResultContract: exact.definitionContracts?.result ??
      contractCoordinate(
        publicApi,
        definition,
        catalog,
        "result",
        member.resultContract.definitionRef,
      ),
    expectedRefusalContract: exact.definitionContracts?.refusal ??
      contractCoordinate(
        publicApi,
        definition,
        catalog,
        "refusal",
        member.refusalContract.definitionRef,
      ),
    expectedNonTerminalContract:
      exact.definitionContracts?.nonTerminal ?? contractCoordinate(
        publicApi,
        definition,
        catalog,
        "non_terminal",
        member.nonTerminalContract.definitionRef,
      ),
    correlationRef: `correlation://abiogenesis/t287/w2-05/${memberKey}`,
    eventTime: "2026-08-20T00:00:00.000Z",
    provenanceRefs: Object.freeze([
      "provenance://abiogenesis/t287/w2-05-worker",
    ]),
  });
  return admittedInvocation(product, body, request);
}

function reissueRunInvocation(product, invocation, replacement = {}) {
  const slots = replacement.slots ?? invocation.invocationAuthority.slots;
  const authorityBody = Object.freeze({
    kind: invocation.invocationAuthority.kind,
    definitionKey: invocation.invocationAuthority.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: product.sha256Canonical(authorityBody),
  });
  const rawRequest = replacement.rawRequest ?? invocation.request;
  const identityRequest = replacement.identityRequest ?? rawRequest;
  const requestDigest = product.sha256Canonical(identityRequest);
  const {
    invocationRef: _invocationRef,
    invocationDigest: _invocationDigest,
    ...priorBody
  } = invocation;
  return admittedInvocation(product, Object.freeze({
    ...priorBody,
    invocationAuthority,
    requestDigest,
    request: identityRequest,
  }), rawRequest);
}

function coordinateWithCatalog(coordinateValue, contractCatalog) {
  return coordinateValue === null
    ? null
    : Object.freeze({ ...coordinateValue, contractCatalog });
}

function reissueRunContractCatalog(
  product,
  invocation,
  contractCatalog,
  identityRequest = invocation.request,
) {
  const {
    invocationRef: _invocationRef,
    invocationDigest: _invocationDigest,
    ...priorBody
  } = invocation;
  return admittedInvocation(product, Object.freeze({
    ...priorBody,
    request: identityRequest,
    invocationContract: coordinateWithCatalog(
      invocation.invocationContract,
      contractCatalog,
    ),
    contractCatalog,
    requestContract: coordinateWithCatalog(
      invocation.requestContract,
      contractCatalog,
    ),
    expectedResultContract: coordinateWithCatalog(
      invocation.expectedResultContract,
      contractCatalog,
    ),
    expectedRefusalContract: coordinateWithCatalog(
      invocation.expectedRefusalContract,
      contractCatalog,
    ),
    expectedNonTerminalContract: coordinateWithCatalog(
      invocation.expectedNonTerminalContract,
      contractCatalog,
    ),
  }), invocation.request);
}

function recomputeCorruptResolution(product, resolution, replacement) {
  const {
    kind,
    schemaVersion: resolutionSchemaVersion,
    disposition,
    resolutionRef: _resolutionRef,
    resolutionDigest: _resolutionDigest,
    ...priorBody
  } = resolution;
  const body = Object.freeze({ ...priorBody, ...replacement });
  const resolutionDigest = product.sha256Canonical(body);
  return Object.freeze({
    kind,
    schemaVersion: resolutionSchemaVersion,
    disposition,
    resolutionRef:
      `product-execution-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}`,
    resolutionDigest,
    ...body,
  });
}

function newEventResource(product, eventLogPath) {
  return Object.freeze({
    kind: "new_abg_event_resource",
    schemaVersion,
    eventLogPath,
    locatorDigest: product.sha256Canonical({
      kind: "abg_event_log_locator",
      eventLogPath: resolve(eventLogPath),
    }),
  });
}

function reopenEventResource(product, closeHandoff, handoffDigest) {
  return Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion,
    closeHandoff,
    handoffDigest: handoffDigest ?? product.sha256Canonical(closeHandoff),
  });
}

function admittedRunResources(
  eventResource,
  catalog,
  catalogView,
  applications = Object.freeze([]),
) {
  return Object.freeze({
    kind: "run_invocation_resource_assertion",
    schemaVersion,
    eventResource,
    catalog,
    catalogView,
    applications,
    source: Object.freeze({ kind: "none" }),
  });
}

function callWithResources(invocation, resources) {
  return Object.freeze({ invocation, resources });
}

function wrongPrefixHandoff(product, closeHandoff) {
  const wrongPrefixDigest = product.sha256Bytes("wrong-prefix-byte");
  const prefixBody = Object.freeze({
    kind: closeHandoff.prefix.kind,
    schemaVersion: closeHandoff.prefix.schemaVersion,
    eventLogRef: closeHandoff.prefix.eventLogRef,
    prefixLength: 1,
    prefixDigest: wrongPrefixDigest,
    storeIdentity: closeHandoff.prefix.storeIdentity,
  });
  const reopenAuthorityBody = Object.freeze({
    kind: closeHandoff.reopenAuthority.kind,
    schemaVersion: closeHandoff.reopenAuthority.schemaVersion,
    eventLogPath: closeHandoff.reopenAuthority.eventLogPath,
    device: closeHandoff.reopenAuthority.device,
    inode: closeHandoff.reopenAuthority.inode,
    eventLogDigest: wrongPrefixDigest,
    durableByteLength: 1,
    eventContractDigest: closeHandoff.reopenAuthority.eventContractDigest,
  });
  return Object.freeze({
    prefix: Object.freeze({
      ...prefixBody,
      coordinateDigest: product.sha256Canonical(prefixBody),
    }),
    reopenAuthority: Object.freeze({
      ...reopenAuthorityBody,
      authorityDigest: product.sha256Canonical(reopenAuthorityBody),
    }),
  });
}

async function faultOf(program) {
  return Effect.runPromise(Effect.flip(program));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readEventRows(path) {
  const bytes = await readFile(path, "utf8");
  return bytes.trim().length === 0
    ? []
    : bytes.trimEnd().split("\n").map((line) => JSON.parse(line));
}

async function waitForAdditionalFrameOpen(path, baselineCount) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const rows = await readEventRows(path);
    if (rows.filter((row) => row.kind === "frame_opened").length > baselineCount) {
      return;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 2));
  }
  throw new Error("timed out waiting for the post-append frame_opened event");
}

async function invokeWithInjectedPreOpenFailure(
  harness,
  bindingBasis,
  call,
) {
  const requestPath = join(
    harness.scratch,
    "run-invoke-pre-open-failure-request.json",
  );
  const loaderPath = join(
    harness.scratch,
    "run-invoke-pre-open-failure-loader.mjs",
  );
  await writeFile(
    requestPath,
    `${JSON.stringify({ bindingBasis, call })}\n`,
    "utf8",
  );
  await writeFile(
    loaderPath,
    [
      "export async function load(url, context, nextLoad) {",
      "  const loaded = await nextLoad(url, context);",
      '  if (!url.endsWith("/build/code/src/gtl/materialize.js")) return loaded;',
      "  const source = String(loaded.source);",
      '  const declaration = "export function materializeGraph(";',
      "  if (!source.includes(declaration)) throw new TypeError(\"materialize export absent\");",
      "  return {",
      "    ...loaded,",
      "    shortCircuit: true,",
      "    source: source.replace(declaration, \"function admittedMaterializeGraph(\") +",
      '      "\\nexport function materializeGraph() { throw new TypeError(\\\"injected pre-open materialization failure\\\"); }\\n",',
      "  };",
      "}",
    ].join("\n"),
    "utf8",
  );
  const probe = [
    'import { readFile } from "node:fs/promises";',
    'import { createRequire } from "node:module";',
    'import { pathToFileURL } from "node:url";',
    'import { loadVerifiedInstalledDefinitionBinding } from "@abiogenesis/typescript-tenant/installed-loader";',
    `const request = JSON.parse(await readFile(${JSON.stringify(requestPath)}, "utf8"));`,
    "const binding = await loadVerifiedInstalledDefinitionBinding(request.bindingBasis);",
    'if (binding.kind !== "verified_installed_definition_binding") throw new TypeError(JSON.stringify(binding));',
    "const installedRequire = createRequire(pathToFileURL(binding.resolvedModulePath));",
    "const installedEffectModule = (specifier) => import(pathToFileURL(installedRequire.resolve(specifier)).href);",
    'const [Cause, Effect, Exit, Option] = await Promise.all(["effect/Cause", "effect/Effect", "effect/Exit", "effect/Option"].map(installedEffectModule));',
    "const exit = await Effect.runPromiseExit(binding.invoke(request.call));",
    'if (Exit.isSuccess(exit)) throw new TypeError("injected pre-open call unexpectedly succeeded");',
    "const failure = Cause.failureOption(exit.cause);",
    "console.log(JSON.stringify({",
    '  kind: "injected_pre_open_failure",',
    "  fault: Option.isSome(failure) ? failure.value : null,",
    "  cause: Cause.pretty(exit.cause),",
    "}));",
  ].join("\n");
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--loader", loaderPath, "--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  return JSON.parse(stdout.trim().split("\n").at(-1));
}

async function invokeWithInjectedExecutionBasisPostCommitFailure(
  harness,
  bindingBasis,
  call,
) {
  const requestPath = join(
    harness.scratch,
    "run-invoke-execution-basis-post-commit-failure-request.json",
  );
  const loaderPath = join(
    harness.scratch,
    "run-invoke-execution-basis-post-commit-failure-loader.mjs",
  );
  await writeFile(
    requestPath,
    `${JSON.stringify({ bindingBasis, call })}\n`,
    "utf8",
  );
  await writeFile(
    loaderPath,
    [
      "export async function load(url, context, nextLoad) {",
      "  const loaded = await nextLoad(url, context);",
      "  const source = String(loaded.source);",
      '  if (url.endsWith("/build/code/src/abg/execution_basis.js")) {',
      '    const declaration = "export function admitExecutionBasis(";',
      '    if (!source.includes(declaration)) throw new TypeError("execution basis export absent");',
      "    return {",
      "      ...loaded,",
      "      shortCircuit: true,",
      "      source: source.replace(declaration, \"function admittedExecutionBasis(\") +",
      '        "\\nexport function admitExecutionBasis(...args) { const result = admittedExecutionBasis(...args); assertHeldEventStoreAtDurablePrefix(args[0], result.successorPrefix); return result; }\\n",',
      "    };",
      "  }",
      '  if (url.endsWith("/build/code/src/abg/open_call.js")) {',
      '    const declaration = "export function openTraversalScope(";',
      '    if (!source.includes(declaration)) throw new TypeError("open traversal export absent");',
      "    return {",
      "      ...loaded,",
      "      shortCircuit: true,",
      "      source: source.replace(declaration, \"function admittedOpenTraversalScope(\") +",
      '        "\\nexport function openTraversalScope(...args) { assertHeldEventStoreAtDurablePrefix(args[0], args[1]); throw new TypeError(\\\"injected pre-open failure after execution-basis admission\\\"); }\\n",',
      "    };",
      "  }",
      "  return loaded;",
      "}",
    ].join("\n"),
    "utf8",
  );
  const probe = [
    'import { readFile } from "node:fs/promises";',
    'import { createRequire } from "node:module";',
    'import { pathToFileURL } from "node:url";',
    'import { loadVerifiedInstalledDefinitionBinding } from "@abiogenesis/typescript-tenant/installed-loader";',
    `const request = JSON.parse(await readFile(${JSON.stringify(requestPath)}, "utf8"));`,
    "const binding = await loadVerifiedInstalledDefinitionBinding(request.bindingBasis);",
    'if (binding.kind !== "verified_installed_definition_binding") throw new TypeError(JSON.stringify(binding));',
    "const installedRequire = createRequire(pathToFileURL(binding.resolvedModulePath));",
    "const installedEffectModule = (specifier) => import(pathToFileURL(installedRequire.resolve(specifier)).href);",
    'const [Cause, Effect, Exit, Option] = await Promise.all(["effect/Cause", "effect/Effect", "effect/Exit", "effect/Option"].map(installedEffectModule));',
    "const exit = await Effect.runPromiseExit(binding.invoke(request.call));",
    'if (Exit.isSuccess(exit)) throw new TypeError("injected execution-basis call unexpectedly succeeded");',
    "const failure = Cause.failureOption(exit.cause);",
    "console.log(JSON.stringify({",
    '  kind: "injected_execution_basis_post_commit_failure",',
    "  fault: Option.isSome(failure) ? failure.value : null,",
    "  cause: Cause.pretty(exit.cause),",
    "}));",
  ].join("\n");
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--loader", loaderPath, "--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  return JSON.parse(stdout.trim().split("\n").at(-1));
}

async function invokeWithInjectedAmbientDescendantBeforeRecovery(
  harness,
  bindingBasis,
  call,
) {
  const requestPath = join(
    harness.scratch,
    "run-invoke-ambient-descendant-request.json",
  );
  const loaderPath = join(
    harness.scratch,
    "run-invoke-ambient-descendant-loader.mjs",
  );
  await writeFile(
    requestPath,
    `${JSON.stringify({ bindingBasis, call })}\n`,
    "utf8",
  );
  await writeFile(
    loaderPath,
    [
      "export async function load(url, context, nextLoad) {",
      "  const loaded = await nextLoad(url, context);",
      "  const source = String(loaded.source);",
      '  if (url.endsWith("/build/code/src/owner_bindings/run_invocation.js")) {',
      '    const anchor = "        const recoverPostOpen = (";',
      '    if (source.indexOf(anchor) < 0 || source.indexOf(anchor) !== source.lastIndexOf(anchor)) throw new TypeError("post-open recovery anchor is not exact");',
      "    const injection = [",
      '      "        const issuedSuccessor = opened.successorPrefix;",',
      '      "        const ambientDescendant = admitRuntimeFailure({",',
      '      "            store: resource.store,",',
      '      "            predecessorPrefix: issuedSuccessor,",',
      '      "            executionBasis: execution.executionBasis,",',
      '      "            scope: opened.scope,",',
      '      "            stage: \\\"operation_application\\\",",',
      '      "            subject: { definitionKey: call.invocation.definitionKey, code: \\\"injected_ambient_descendant\\\" },",',
      '      "            diagnosticRef: \\\"diagnostic://abiogenesis/test/ambient-descendant@5\\\",",',
      '      "            basis: {",',
      '      "                eventTime: call.invocation.eventTime,",',
      '      "                correlationId: call.invocation.correlationRef + \\\"/injected-ambient-descendant\\\",",',
      '      "                causationEventRefs: [],",',
      '      "            },",',
      '      "        });",',
      '      "        if (ambientDescendant.successorPrefix.coordinateDigest === issuedSuccessor.coordinateDigest) throw new TypeError(\\\"injected ambient descendant did not advance the owner-issued successor\\\");",',
      "    ].join(\"\\n\");",
      "    return {",
      "      ...loaded,",
      "      shortCircuit: true,",
      '      source: source.replace(anchor, `${injection}\\n${anchor}`),',
      "    };",
      "  }",
      '  if (url.endsWith("/build/code/src/implementation/leaf_invocation_port.js")) {',
      '    const declaration = "export async function constructAdmittedLeafInvocationPort(";',
      '    if (!source.includes(declaration)) throw new TypeError("leaf invocation port export absent");',
      "    return {",
      "      ...loaded,",
      "      shortCircuit: true,",
      "      source: source.replace(declaration, \"async function admittedConstructAdmittedLeafInvocationPort(\") +",
      '        "\\nexport async function constructAdmittedLeafInvocationPort(...args) { throw new TypeError(\\\"injected leaf construction failure after ambient descendant\\\"); }\\n",',
      "    };",
      "  }",
      "  return loaded;",
      "}",
    ].join("\n"),
    "utf8",
  );
  const probe = [
    'import { readFile } from "node:fs/promises";',
    'import { createRequire } from "node:module";',
    'import { pathToFileURL } from "node:url";',
    'import { loadVerifiedInstalledDefinitionBinding } from "@abiogenesis/typescript-tenant/installed-loader";',
    `const request = JSON.parse(await readFile(${JSON.stringify(requestPath)}, "utf8"));`,
    "const binding = await loadVerifiedInstalledDefinitionBinding(request.bindingBasis);",
    'if (binding.kind !== "verified_installed_definition_binding") throw new TypeError(JSON.stringify(binding));',
    "const installedRequire = createRequire(pathToFileURL(binding.resolvedModulePath));",
    "const installedEffectModule = (specifier) => import(pathToFileURL(installedRequire.resolve(specifier)).href);",
    'const [Cause, Effect, Exit, Option] = await Promise.all(["effect/Cause", "effect/Effect", "effect/Exit", "effect/Option"].map(installedEffectModule));',
    "const exit = await Effect.runPromiseExit(binding.invoke(request.call));",
    "const failure = Exit.isFailure(exit) ? Cause.failureOption(exit.cause) : null;",
    "const defect = Exit.isFailure(exit) ? Cause.dieOption(exit.cause) : null;",
    "const defectValue = defect !== null && Option.isSome(defect) ? defect.value : null;",
    "console.log(JSON.stringify({",
    '  kind: "injected_ambient_descendant_before_recovery",',
    "  succeeded: Exit.isSuccess(exit),",
    "  fault: failure !== null && Option.isSome(failure) ? failure.value : null,",
    "  defect: defectValue === null ? null : { name: defectValue?.name ?? typeof defectValue, message: String(defectValue?.message ?? defectValue) },",
    "  cause: Exit.isFailure(exit) ? Cause.pretty(exit.cause) : null,",
    "}));",
  ].join("\n");
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--loader", loaderPath, "--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  return JSON.parse(stdout.trim().split("\n").at(-1));
}

async function runVerifiedInstalledDefinitionInFreshProcess(
  harness,
  bindingBasis,
  call,
  label,
) {
  const requestPath = join(
    harness.scratch,
    `verified-installed-definition-${label}.json`,
  );
  await writeFile(
    requestPath,
    `${JSON.stringify({ bindingBasis, call })}\n`,
    "utf8",
  );
  const probe = [
    'import { readFile } from "node:fs/promises";',
    'import { createRequire } from "node:module";',
    'import { pathToFileURL } from "node:url";',
    'import { loadVerifiedInstalledDefinitionBinding } from "@abiogenesis/typescript-tenant/installed-loader";',
    `const request = JSON.parse(await readFile(${JSON.stringify(requestPath)}, "utf8"));`,
    "const binding = await loadVerifiedInstalledDefinitionBinding(request.bindingBasis);",
    'if (binding.kind !== "verified_installed_definition_binding") throw new TypeError(JSON.stringify(binding));',
    "const installedRequire = createRequire(pathToFileURL(binding.resolvedModulePath));",
    'const Effect = await import(pathToFileURL(installedRequire.resolve("effect/Effect")).href);',
    "const result = await Effect.runPromise(binding.invoke(request.call));",
    "console.log(JSON.stringify(result));",
  ].join("\n");
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    ["--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  if (stderr.trim().length !== 0) {
    throw new TypeError(`verified installed definition execution failed: ${stderr}`);
  }
  return JSON.parse(stdout.trim().split("\n").at(-1));
}

async function exactInstalledRunCall({
  publicApi,
  product,
  validator,
  scenario,
  catalog,
  catalogView,
  memberKey,
  catalogHandle,
  programRef,
  eventResource,
  ordinal,
  omitFhMode = false,
}) {
  const admittedInstall = scenario.ownerProjections.admittedInstall.install;
  const workspaceBinding = scenario.ownerProjections.admittedWorkspace.binding;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls: [admittedInstall],
    verifyInstallAdmission: () => true,
    programRef,
    selection: memberKey === "invoke"
      ? Object.freeze({ kind: "direct", catalogHandle })
      : Object.freeze({
          kind: "start",
          scope: "program",
          target: "next",
          until: "converged",
          rootMode: "direct",
        }),
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
  const input = Object.freeze({
    kind: "hello_world_input",
    schemaVersion,
    subject: "W2-05 installed binding",
  });
  const inputContract = Object.freeze({
    ref: resolution.resolution.inputContract.contractRef,
    digest: resolution.resolution.inputContractDigest,
  });
  const admittedInput = product.admitInstalledProductInput(
    resolution.productSemantics,
    inputContract.ref,
    input,
  );
  assert.ok(admittedInput);
  const rawInput = validator.rawAdmitValue(
    admittedInput,
    "invocation_input",
    inputContract.ref,
  );
  assert.equal(rawInput.kind, "raw_admitted_value");
  const definitionContractMatches = catalog.readinessBasis.verifiedProducts
    .flatMap((verified) =>
      verified.definitionContractCoordinates?.operations
        .filter((operation) => operation.operationId === operationId)
        .flatMap((operation) => operation.members)
        .filter((member) => member.memberKey === memberKey) ?? []
    );
  assert.equal(definitionContractMatches.length, 1);
  const definitionContracts = definitionContractMatches[0].slots;
  const contractCatalog = definitionContracts.request.contractCatalog;
  for (const coordinate of [
    definitionContracts.result,
    definitionContracts.refusal,
    definitionContracts.nonTerminal,
  ]) {
    assert.deepEqual(coordinate?.contractCatalog ?? contractCatalog, contractCatalog);
  }
  const contractBoundInput = Object.freeze({
    contract: inputContract,
    valueRef: rawInput.admissionRef,
    valueDigest: rawInput.subjectDigest,
    value: rawInput.value,
  });
  const declaredRegimes = new Set([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
    [],
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const grants = Object.freeze([
    product.constructCapabilityGrant(policy, actorRef),
    ...[...new Set(resolution.programValidation.interactionLeafRows.map(
      (row) => row.requirement.actorCapabilityRef,
    ))].sort().flatMap((capabilityRef) => [
      product.constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.interaction.respond",
        capabilityRef,
      ),
      product.constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.run.continue",
        capabilityRef,
      ),
    ]),
  ]);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    resolution.program.programRef,
    resolution.selectedCatalogEntry,
    policy,
    grants,
  );
  assert.equal(authority.kind, "invocation_authority");
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
    (candidate) => keyOf(candidate) === `${operationId}#${memberKey}`,
  );
  assert.ok(definition);
  const program = Object.freeze({
    ref: resolution.resolution.programRef,
    digest: resolution.resolution.programDigest,
  });
  const view = Object.freeze({
    ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice("sha256:".length)}`,
    digest: catalogView.viewDigest,
  });
  const request = memberKey === "invoke"
    ? Object.freeze({
        program,
        catalogHandle,
        inputContract,
        input,
        catalogView: view,
        allowlist: Object.freeze([...catalogView.allowlist]),
        sourceBasis: Object.freeze({ kind: "none" }),
      })
    : Object.freeze({
        program,
        scope: "program",
        target: Object.freeze({ kind: "next" }),
        until: "converged",
        catalogView: view,
        allowlist: Object.freeze([...catalogView.allowlist]),
        input: contractBoundInput,
        fhMode: "direct",
        rootMode: "direct",
        sourceBasis: Object.freeze({ kind: "none" }),
      });
  const membershipPreimage = Object.freeze({
    programRef: resolution.program.programRef,
    graphFunctionRef: resolution.selectedCatalogEntry.definitionRef,
  });
  const expectedMembershipDigest = product.sha256Canonical(membershipPreimage);
  assert.equal(
    resolution.resolution.programGraphFunctionMembership.digest,
    expectedMembershipDigest,
  );
  assert.equal(
    resolution.resolution.programGraphFunctionMembership.ref,
    `program-graph-function-membership://abiogenesis/${expectedMembershipDigest.slice("sha256:".length)}`,
  );
  const steeringDigest = product.sha256Canonical(eventResource);
  const slots = Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze([Object.freeze({
      ref: admittedInstall.installId,
      digest: admittedInstall.productContentDigest,
    })]),
    dependency_lock: Object.freeze({
      ref: workspaceBinding.lockId,
      digest: workspaceBinding.lockDigest,
    }),
    catalog_scope: Object.freeze({
      catalog: Object.freeze({
        ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice("sha256:".length)}`,
        digest: catalog.basisDigest,
      }),
      view: request.catalogView,
      allowlist: request.allowlist,
    }),
    execution_program: program,
    graph_function: memberKey === "invoke"
      ? Object.freeze({
          graphFunction: Object.freeze({
            ref: resolution.resolution.graphFunctionRef,
            digest: resolution.resolution.graphFunctionDigest,
          }),
          membership: resolution.resolution.programGraphFunctionMembership,
        })
      : null,
    input_contract: contractBoundInput,
    session_policy: Object.freeze({
      ref: policy.policyRef,
      digest: policy.policyDigest,
    }),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...definition.capabilityRefs]),
      grants: Object.freeze(grants.map((grant) => Object.freeze({
        ref: grant.grantRef,
        digest: grant.grantDigest,
      }))),
    }),
    actor: Object.freeze({
      actor: Object.freeze({
        ref: actorRef,
        digest: product.sha256Canonical({ actorRef }),
      }),
      attribution: Object.freeze({
        ref: authority.authorityRef,
        digest: authority.authorityDigest,
      }),
    }),
    transport_steering: Object.freeze({
      ref: `transport-steering://abiogenesis/${steeringDigest.slice("sha256:".length)}`,
      digest: steeringDigest,
    }),
    verification_references: null,
    execution_basis: null,
  });
  if (memberKey === "invoke") {
    assert.deepEqual(slots.graph_function?.graphFunction, {
      ref: resolution.resolution.graphFunctionRef,
      digest: resolution.resolution.graphFunctionDigest,
    });
    assert.deepEqual(slots.graph_function?.membership, {
      ref: resolution.resolution.programGraphFunctionMembership.ref,
      digest: resolution.resolution.programGraphFunctionMembership.digest,
    });
  } else {
    assert.equal(slots.graph_function, null);
  }
  const rawRequest = memberKey === "start" && omitFhMode
    ? Object.freeze((({ fhMode: _fhMode, ...rest }) => rest)(request))
    : request;
  const invocation = runCall(
    publicApi,
    product,
    memberKey,
    ordinal,
    {
      request: rawRequest,
      identityRequest: request,
      slots,
      contractCatalog,
      definitionContracts,
    },
  );
  const admittedInvocation = rawRequest === request
    ? invocation
    : Object.freeze({ ...invocation, request });
  const candidate = memberKey === "invoke"
    ? product.constructExactDirectInvocation(
        admittedInvocation,
        workspaceBinding,
        catalogView,
        resolution.program,
        resolution.selectedCatalogEntry,
        rawInput,
        policy,
        grants,
        authority,
      )
    : product.constructExactStartInvocation(
        admittedInvocation,
        workspaceBinding,
        catalogView,
        resolution.program,
        resolution.selectedCatalogEntry,
        rawInput,
        policy,
        grants,
        authority,
      );
  assert.equal(
    candidate.kind,
    "public_invocation_candidate",
    JSON.stringify(candidate),
  );
  return Object.freeze({
    call: callWithResources(
      invocation,
      admittedRunResources(eventResource, catalog, catalogView),
    ),
    admittedInstall,
    workspaceBinding,
    resolution,
    rawInput,
    policy,
    grants,
    authority,
    candidate,
    admittedRequest: request,
  });
}

test("W2-05 packed run.invoke bindings are exact, source-blind, and close one prefix", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
  });
  const [publicApi, product, gtl, abg, validator] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      "w2-05-run-binding-public",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/product",
      "w2-05-run-binding-product",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/gtl",
      "w2-05-run-binding-gtl",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/abg",
      "w2-05-run-binding-abg",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/validator",
      "w2-05-run-binding-validator",
    ),
  ]);
  assert.equal(harness.packageJson.dependencies.effect, "3.22.1");
  assert.equal(harness.packageJson.dependencies.valibot, "1.4.2");
  const installedRoot = installedCliPackageRoot(harness);
  const installedRunKernelRelation =
    "build/code/src/owner_bindings/run_invocation.js";
  assert.ok(
    harness.candidateManifest.productRelativeLocators.includes(
      installedRunKernelRelation,
    ),
    "packed manifest contains the shared run invocation kernel",
  );
  const installedRunKernelSource = await readFile(
    join(installedRoot, installedRunKernelRelation),
    "utf8",
  );
  assert.doesNotMatch(
    installedRunKernelSource,
    /selectHeldEventStoreDurablePrefix/u,
    "packed run invocation consumes owner-issued successors without a store-tail selector",
  );
  const runManifestRows =
    harness.candidateManifest.publicContractCatalog.rows.filter(
      (row) => row.contractId === operationId,
    );
  assert.equal(runManifestRows.length, 1);
  const runManifestRow = runManifestRows[0];
  assert.equal(
    runManifestRow.assetLocator.path,
    "contracts/public-operations/run/invoke/operation-contract.json",
  );
  const runContractPath = resolve(
    installedRoot,
    runManifestRow.assetLocator.path,
  );
  const runContractRelation = relative(installedRoot, runContractPath);
  assert.equal(
    runContractRelation === ".." || runContractRelation.startsWith(`..${sep}`),
    false,
  );
  assert.equal(isAbsolute(runContractRelation), false);
  const runContractBytes = await readFile(runContractPath);
  assert.equal(
    product.sha256Bytes(runContractBytes),
    runManifestRow.assetLocator.contentDigest,
  );
  assert.equal(
    runManifestRow.contractDigest,
    runManifestRow.assetLocator.contentDigest,
  );
  const installedRunContract = JSON.parse(runContractBytes.toString("utf8"));
  assert.equal(installedRunContract.operationId, operationId);
  assert.equal(installedRunContract.definitions.length, 2);
  for (const serialized of installedRunContract.definitions) {
    const live = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
      (definition) => keyOf(definition) === keyOf(serialized),
    );
    assert.ok(live, keyOf(serialized));
    assert.equal(live.definitionDigest, serialized.definitionDigest);
    assert.deepEqual(
      live.executionBindingSpecification,
      serialized.executionBindingSpecification,
    );
    assert.equal(
      live.executionBindingSpecificationDigest,
      product.sha256Canonical(live.executionBindingSpecification),
    );
  }

  const catalogHandle = gtl.HELLO_WORLD_IDS.graphFunctionRef;
  const scenario = await buildRootCliScenario(
    harness,
    "t287-w2-05-run-binding",
    (payload) => payload,
    {
      allowlist: [
        gtl.HELLO_WORLD_DIRECT_IDS.handle,
        gtl.HELLO_WORLD_IDS.graphFunctionRef,
        gtl.COMPOSED_HELLO_IDS.graphFunctionRef,
      ],
      catalogApplications: [],
      catalogHandle,
      programRef: gtl.HELLO_WORLD_IDS.programRef,
    },
  );
  const catalog = scenario.preRunOutcomes.find(
    (outcome) => outcome.result?.kind === "graph_function_catalog",
  )?.result;
  const catalogView = scenario.preRunOutcomes.find(
    (outcome) => outcome.result?.kind === "graph_function_catalog_view",
  )?.result;
  assert.ok(catalog);
  assert.ok(catalogView);
  assert.deepEqual(product.admitGraphFunctionCatalog(catalog.readinessBasis), catalog);
  assert.deepEqual(
    product.narrowGraphFunctionCatalog(catalog, catalogView.allowlist),
    catalogView,
  );

  assert.deepEqual(
    sentinel.map(([key]) => key),
    [
      "abg.operation.workspace.create#clean",
      "abg.operation.workspace.open#open",
      "abg.operation.product.verify#verify",
      "abg.operation.product.resolve#resolve",
      "abg.operation.product.install#install",
      "abg.operation.workspace.bind#bind",
      "abg.operation.catalog.admit#admit",
      "abg.operation.catalog.view#allowlist",
      "abg.operation.run.invoke#invoke",
      "abg.operation.run.invoke#start",
      "abg.operation.project.read#run_status",
      "abg.operation.project.read#run_result",
      "abg.operation.project.read#run_replay",
    ],
  );
  assert.equal(catalog.readinessBasis.resolvedLock.rows.length, 1);
  assert.equal(catalog.readinessBasis.verifiedProducts.length, 1);
  assert.equal(catalog.readinessBasis.installedProducts.length, 1);
  const lockRow = catalog.readinessBasis.resolvedLock.rows[0];
  const verifiedProduct = catalog.readinessBasis.verifiedProducts[0];
  const installedProduct = catalog.readinessBasis.installedProducts[0];
  for (const [field, expected] of [
    ["productId", harness.candidateManifest.productId],
    ["packageName", harness.candidateManifest.packageName],
    ["packageVersion", harness.candidateManifest.packageVersion],
    ["productContentDigest", harness.candidateManifest.productContentDigest],
    ["manifestDigest", product.sha256Canonical(harness.candidateManifest)],
  ]) {
    assert.equal(lockRow[field], expected, `resolved lock ${field}`);
    assert.equal(verifiedProduct[field], expected, `verified Product ${field}`);
    assert.equal(installedProduct[field], expected, `installed Product ${field}`);
  }
  assert.equal(
    installedProduct.resolvedLockDigest,
    catalog.readinessBasis.resolvedLock.lockDigest,
  );
  const packedArtifactDigest = product.sha256Bytes(
    await readFile(harness.artifactPath),
  );
  for (const [label, digest] of [
    ["resolved lock", lockRow.artifactDigest],
    ["verified Product", verifiedProduct.artifactDigest],
    ["installed Product", installedProduct.artifactDigest],
  ]) {
    assert.equal(digest, packedArtifactDigest, `${label} artifact digest`);
  }
  const installedInvokeBasis = Object.freeze({
    install: scenario.ownerProjections.admittedInstall.install,
    artifactTruth: scenario.ownerProjections.artifactTruth,
    verifiedProduct,
    resolvedLock: catalog.readinessBasis.resolvedLock,
    definitionKey: Object.freeze({ operationId, memberKey: "invoke" }),
  });
  const installedStartBasis = Object.freeze({
    ...installedInvokeBasis,
    definitionKey: Object.freeze({ operationId, memberKey: "start" }),
  });
  const preconstructedInvoke = await probeInstalledDefinitionBindingInFreshProcess(
    harness,
    installedInvokeBasis,
    "invoke-positive",
  );
  assert.equal(preconstructedInvoke.kind, "verified_installed_definition_binding");
  assert.equal(preconstructedInvoke.callableType, "function");
  assert.equal(preconstructedInvoke.installId, installedProduct.installId);
  assert.equal(
    preconstructedInvoke.lockDigest,
    catalog.readinessBasis.resolvedLock.lockDigest,
  );
  assert.equal(
    preconstructedInvoke.callable.packageExportPath,
    "./product",
  );
  assert.equal(
    preconstructedInvoke.callable.namedExport,
    "RUN_DEFINITION_BINDINGS",
  );
  assert.deepEqual(preconstructedInvoke.callable.memberPath, ["invoke", "invoke"]);
  const installedProductTarget = await resolveInstalledPackageExport(
    { installedPackageRoot: installedInvokeBasis.install.installedRoot },
    "@abiogenesis/typescript-tenant/product",
  );
  const installedProductTargetBytes = await readFile(installedProductTarget);
  const constructionMarker = join(
    harness.scratch,
    "forbidden-preverified-product-construction.marker",
  );
  const markerPrelude = Buffer.from(
    `import { writeFileSync as __w2WriteMarker } from "node:fs";\n` +
      `__w2WriteMarker(${JSON.stringify(constructionMarker)}, "evaluated");\n`,
  );
  const siblingClosureDigest = product.sha256Canonical({
    sibling: "native-contract-closure",
  });
  const siblingLockBody = Object.freeze({
    rows: catalog.readinessBasis.resolvedLock.rows,
    dependencyEdges: catalog.readinessBasis.resolvedLock.dependencyEdges,
    nativeContractClosureDigest: siblingClosureDigest,
  });
  const siblingLockDigest = product.sha256Canonical(siblingLockBody);
  const siblingLock = Object.freeze({
    kind: "resolved_product_lock",
    schemaVersion,
    lockId:
      `product-lock://abiogenesis/${siblingLockDigest.slice("sha256:".length)}`,
    lockDigest: siblingLockDigest,
    ...siblingLockBody,
  });
  await writeFile(
    installedProductTarget,
    Buffer.concat([markerPrelude, installedProductTargetBytes]),
  );
  try {
    const forgedAdmission = await probeInstalledDefinitionBindingInFreshProcess(
      harness,
      {
        ...installedInvokeBasis,
        install: {
          ...installedInvokeBasis.install,
          admissionEventRef:
            "event://abiogenesis/product-install/coherent-sibling",
        },
      },
      "invoke-wrong-install-admission",
    );
    assert.equal(forgedAdmission.kind, "installed_definition_binding_load_refusal");
    assert.equal(forgedAdmission.code, "installed_product_mismatch");
    await assert.rejects(access(constructionMarker));

    const rehashedWrongLock = await probeInstalledDefinitionBindingInFreshProcess(
      harness,
      { ...installedInvokeBasis, resolvedLock: siblingLock },
      "invoke-wrong-lock",
    );
    assert.equal(rehashedWrongLock.kind, "installed_definition_binding_load_refusal");
    assert.equal(rehashedWrongLock.code, "installed_product_mismatch");
    await assert.rejects(access(constructionMarker));

    const changedExport = await probeInstalledDefinitionBindingInFreshProcess(
      harness,
      installedInvokeBasis,
      "invoke-changed-export",
    );
    assert.equal(changedExport.kind, "installed_definition_binding_load_refusal");
    assert.equal(changedExport.code, "export_digest_mismatch");
    await assert.rejects(access(constructionMarker));
  } finally {
    await writeFile(installedProductTarget, installedProductTargetBytes);
  }
  const installedModules = new Map();
  const installedTargetProofs = new Map();
  for (const [key, exportPath, namedExport, memberPath] of sentinel) {
    const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
      (candidate) => keyOf(candidate) === key,
    );
    assert.ok(definition, key);
    const [sentinelOperationId] = key.split("#");
    const manifestRows = harness.candidateManifest.publicContractCatalog.rows
      .filter((row) => row.contractId === sentinelOperationId);
    assert.equal(manifestRows.length, 1, `${key} manifest operation row`);
    const manifestRow = manifestRows[0];
    const installedContractPath = resolve(
      installedRoot,
      manifestRow.assetLocator.path,
    );
    const installedContractRelation = relative(
      installedRoot,
      installedContractPath,
    );
    assert.equal(
      installedContractRelation === ".." ||
        installedContractRelation.startsWith(`..${sep}`),
      false,
      `${key} contract containment`,
    );
    assert.equal(isAbsolute(installedContractRelation), false, key);
    for (const [label, carrier] of [
      ["resolved lock", lockRow],
      ["verified Product", verifiedProduct],
      ["installed Product", installedProduct],
    ]) {
      const carrierRows = carrier.publicContracts.filter(
        (row) => row.contractId === sentinelOperationId,
      );
      assert.equal(carrierRows.length, 1, `${key} ${label} contract row`);
      assert.deepEqual(carrierRows[0], manifestRow, `${key} ${label} contract`);
    }
    const installedContractBytes = await readFile(installedContractPath);
    assert.equal(
      product.sha256Bytes(installedContractBytes),
      manifestRow.assetLocator.contentDigest,
      `${key} installed contract digest`,
    );
    assert.equal(
      manifestRow.contractDigest,
      manifestRow.assetLocator.contentDigest,
      `${key} manifest contract/asset digest`,
    );
    const serializedOperation = JSON.parse(
      installedContractBytes.toString("utf8"),
    );
    assert.equal(serializedOperation.operationId, sentinelOperationId, key);
    const serializedMembers = serializedOperation.definitions.filter(
      (candidate) => keyOf(candidate) === key,
    );
    assert.equal(serializedMembers.length, 1, `${key} serialized member`);
    const serialized = serializedMembers[0];
    assert.equal(serialized.definitionDigest, definition.definitionDigest, key);
    assert.deepEqual(
      serialized.executionBindingSpecification,
      definition.executionBindingSpecification,
      key,
    );
    assert.equal(
      definition.executionBindingSpecificationDigest,
      product.sha256Canonical(definition.executionBindingSpecification),
      `${key} binding specification digest`,
    );
    const callable = definition.executionBindingSpecification.callable;
    assert.equal(callable.packageName, "@abiogenesis/typescript-tenant", key);
    assert.equal(callable.packageExportPath, exportPath, key);
    assert.equal(callable.namedExport, namedExport, key);
    assert.deepEqual(callable.memberPath, memberPath, key);
    assert.equal(callable.ownerAuthorityRef, definition.semanticAuthorityRef, key);
    assert.equal(
      callable.callableContractDigest,
      product.sha256Canonical({
        kind: "exact_definition_host_callable",
        schemaVersion,
        definitionKey: definition.definitionKey,
        requestSchemaRef:
          serialized.requestContract.identity.nativeSchemaIdentity.schemaRef,
        resultSchemaRef:
          serialized.resultContract.identity.nativeSchemaIdentity.schemaRef,
        refusalSchemaRef:
          serialized.refusalContract.identity.nativeSchemaIdentity.schemaRef,
        nonTerminalSchemaRef:
          serialized.nonTerminalContract?.identity.nativeSchemaIdentity.schemaRef ??
          null,
        resourceRelation: "owner_indexed_sibling_assertion_and_receipt",
      }),
      `${key} callable contract digest`,
    );
    const specifier = installedSpecifier(
      callable.packageName,
      exportPath,
    );
    let targetProof = installedTargetProofs.get(specifier);
    if (targetProof === undefined) {
      const target = await resolveInstalledPackageExport(harness, specifier);
      const targetRelation = relative(installedRoot, target);
      assert.notEqual(targetRelation, "", specifier);
      assert.equal(
        targetRelation === ".." || targetRelation.startsWith(`..${sep}`),
        false,
        specifier,
      );
      assert.equal(isAbsolute(targetRelation), false, specifier);
      assert.ok(
        harness.candidateManifest.productRelativeLocators.includes(
          targetRelation,
        ),
        `${specifier} manifest locator`,
      );
      const installedModuleBytes = await readFile(target);
      const packedModule = await execFileAsync(
        "tar",
        ["-xOf", harness.artifactPath, `package/${targetRelation}`],
        { encoding: "buffer", maxBuffer: 20 * 1024 * 1024 },
      );
      assert.deepEqual(
        installedModuleBytes,
        packedModule.stdout,
        `${specifier} installed module equals verified packed member`,
      );
      targetProof = Object.freeze({ target, targetRelation });
      installedTargetProofs.set(specifier, targetProof);
    }
    let loaded = installedModules.get(specifier);
    if (loaded === undefined) {
      loaded = await importInstalledPackageExport(
        harness,
        specifier,
        `w2-05-sentinel=${encodeURIComponent(specifier)}`,
      );
      installedModules.set(specifier, loaded);
    }
    assert.equal(
      typeof valueAtPath(loaded[namedExport], memberPath),
      "function",
      key,
    );
  }

  const runDefinitions = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions
    .filter((definition) => definition.definitionKey.operationId === operationId)
    .sort((left, right) =>
      left.definitionKey.memberKey.localeCompare(right.definitionKey.memberKey)
    );
  assert.deepEqual(
    runDefinitions.map((definition) => ({
      memberKey: definition.definitionKey.memberKey,
      definitionDigest: definition.definitionDigest,
      packageName: definition.executionBindingSpecification.callable.packageName,
      packageExportPath:
        definition.executionBindingSpecification.callable.packageExportPath,
      namedExport: definition.executionBindingSpecification.callable.namedExport,
      memberPath: definition.executionBindingSpecification.callable.memberPath,
      callableContractDigest:
        definition.executionBindingSpecification.callable.callableContractDigest,
    })),
    [
      {
        memberKey: "invoke",
        definitionDigest: "sha256:754dd3a0c571272f6d1679e1b04634e9df0ea569383a99554207f97b3ea357ec",
        packageName: "@abiogenesis/typescript-tenant",
        packageExportPath: "./product",
        namedExport: "RUN_DEFINITION_BINDINGS",
        memberPath: ["invoke", "invoke"],
        callableContractDigest: "sha256:f9fa3fa0faffe2facafa5ad712c251d8e31df126d35e5371a1a79e401b4c9629",
      },
      {
        memberKey: "start",
        definitionDigest: "sha256:36c98e15de1559f311710c6d7b23a70aebddb64804fd164ab75e0a6046d3bfd1",
        packageName: "@abiogenesis/typescript-tenant",
        packageExportPath: "./product",
        namedExport: "RUN_DEFINITION_BINDINGS",
        memberPath: ["invoke", "start"],
        callableContractDigest: "sha256:d06a48cb77631fbea6e9550848b4fcbd8aadb477af6de8ecc8f99ac72327b4fc",
      },
    ],
  );
  assert.deepEqual(Object.keys(product.RUN_DEFINITION_BINDINGS), ["invoke"]);
  assert.deepEqual(
    Object.keys(product.RUN_DEFINITION_BINDINGS.invoke).sort(),
    ["invoke", "start"],
  );
  assert.equal(product.RUN_INVOCATION_DEFINITION_BINDINGS, undefined);
  const invoke = product.RUN_DEFINITION_BINDINGS.invoke.invoke;
  const start = product.RUN_DEFINITION_BINDINGS.invoke.start;

  const invokeInvocation = runCall(publicApi, product, "invoke", 1);
  const startInvocation = runCall(publicApi, product, "start", 2);
  const invokeLog = join(harness.scratch, "run-invoke-binding.events.jsonl");
  const startLog = join(harness.scratch, "run-start-binding.events.jsonl");
  const invokeResult = await runVerifiedInstalledDefinitionInFreshProcess(
    harness,
    installedInvokeBasis,
    callWithResources(
      invokeInvocation,
      admittedRunResources(
        newEventResource(product, invokeLog),
        catalog,
        catalogView,
      ),
    ),
    "invoke-synthetic-refusal",
  );
  const startResult = await runVerifiedInstalledDefinitionInFreshProcess(
    harness,
    installedStartBasis,
    callWithResources(
      startInvocation,
      admittedRunResources(
        newEventResource(product, startLog),
        catalog,
        catalogView,
      ),
    ),
    "start-synthetic-refusal",
  );
  for (const [label, result, eventLogPath] of [
    ["invoke", invokeResult, invokeLog],
    ["start", startResult, startLog],
  ]) {
    assert.equal(result.ownerOutput.outcomeKind, "refusal", label);
    assert.equal(
      result.ownerOutput.value.code,
      "invalid_program",
      `${label} synthetic unresolved program is rejected before append`,
    );
    assert.equal(result.resources.eventResource.entryPrefix.prefixLength, 0, label);
    assert.equal(
      result.resources.eventResource.closeHandoff.prefix.prefixLength,
      0,
      label,
    );
    assert.equal((await readFile(eventLogPath)).length, 0, label);
  }

  const malformedPath = join(harness.scratch, "malformed-resource.events.jsonl");
  const malformedResources = Object.freeze({
    ...admittedRunResources(
      newEventResource(product, malformedPath),
      catalog,
      catalogView,
    ),
    unexpected: true,
  });
  const malformedFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    malformedResources,
  )));
  assert.equal(malformedFault.code, "invalid_resource_assertion");
  assert.equal(await exists(malformedPath), false);

  const malformedCatalogPath = join(
    harness.scratch,
    "malformed-catalog.events.jsonl",
  );
  const structurallyValidResources = admittedRunResources(
    newEventResource(product, malformedCatalogPath),
    catalog,
    catalogView,
  );
  const malformedCatalogFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    Object.freeze({
      ...structurallyValidResources,
      catalog: Object.freeze({
        ...structurallyValidResources.catalog,
        unexpected: true,
      }),
    }),
  )));
  assert.equal(malformedCatalogFault.code, "invalid_resource_assertion");
  assert.equal(await exists(malformedCatalogPath), false);

  const malformedDeepPath = join(
    harness.scratch,
    "malformed-installed-product.events.jsonl",
  );
  const malformedDeepCatalog = structuredClone(catalog);
  malformedDeepCatalog.readinessBasis.installedProducts = [{}];
  const malformedDeepFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    admittedRunResources(
      newEventResource(product, malformedDeepPath),
      malformedDeepCatalog,
      catalogView,
    ),
  )));
  assert.equal(malformedDeepFault.stage, "resource_admission");
  assert.equal(malformedDeepFault.code, "invalid_resource_assertion");
  assert.equal(await exists(malformedDeepPath), false);

  const semanticInvalidCatalog = structuredClone(catalog);
  semanticInvalidCatalog.basisDigest = product.sha256Canonical({
    semanticCatalog: "wrong-basis",
  });
  const semanticCatalogPrefixBytes = await readFile(scenario.eventLogPath);
  const semanticCatalogRefusal = await Effect.runPromise(invoke(
    callWithResources(
      invokeInvocation,
      admittedRunResources(
        reopenEventResource(product, scenario.closeHandoff),
        semanticInvalidCatalog,
        catalogView,
      ),
    ),
  ));
  assert.equal(semanticCatalogRefusal.ownerOutput.outcomeKind, "refusal");
  assert.equal(semanticCatalogRefusal.ownerOutput.value.code, "invalid_target");
  assert.deepEqual(
    semanticCatalogRefusal.resources.eventResource.entryPrefix,
    scenario.closeHandoff.prefix,
  );
  assert.deepEqual(
    semanticCatalogRefusal.resources.eventResource.closeHandoff.prefix,
    scenario.closeHandoff.prefix,
  );
  assert.deepEqual(
    await readFile(scenario.eventLogPath),
    semanticCatalogPrefixBytes,
  );

  const crossInvokePath = join(harness.scratch, "cross-invoke.events.jsonl");
  const crossStartPath = join(harness.scratch, "cross-start.events.jsonl");
  const invokeCoordinateFault = await faultOf(invoke(callWithResources(
    startInvocation,
    admittedRunResources(
      newEventResource(product, crossInvokePath),
      catalog,
      catalogView,
    ),
  )));
  const startCoordinateFault = await faultOf(start(callWithResources(
    invokeInvocation,
    admittedRunResources(
      newEventResource(product, crossStartPath),
      catalog,
      catalogView,
    ),
  )));
  assert.equal(invokeCoordinateFault.code, "call_identity_mismatch");
  assert.equal(startCoordinateFault.code, "call_identity_mismatch");
  assert.equal(await exists(crossInvokePath), false);
  assert.equal(await exists(crossStartPath), false);

  const closeHandoff = invokeResult.resources.eventResource.closeHandoff;
  const originalBytes = await readFile(invokeLog);
  const forgedDigestFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    admittedRunResources(
      reopenEventResource(product, closeHandoff, `sha256:${"f".repeat(64)}`),
      catalog,
      catalogView,
    ),
  )));
  assert.equal(forgedDigestFault.stage, "resource_admission");
  assert.equal(forgedDigestFault.code, "invalid_resource_assertion");
  assert.deepEqual(await readFile(invokeLog), originalBytes);

  const wrongPrefix = wrongPrefixHandoff(product, closeHandoff);
  assert.equal(wrongPrefix.prefix.prefixLength, 1);
  assert.equal(wrongPrefix.reopenAuthority.durableByteLength, 1);
  assert.notEqual(
    wrongPrefix.prefix.coordinateDigest,
    closeHandoff.prefix.coordinateDigest,
  );
  const wrongPrefixFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    admittedRunResources(
      reopenEventResource(product, wrongPrefix),
      catalog,
      catalogView,
    ),
  )));
  assert.equal(wrongPrefixFault.stage, "resource_acquisition");
  assert.equal(wrongPrefixFault.code, "acquisition_refused");
  assert.deepEqual(
    await readFile(invokeLog),
    originalBytes,
    "wrong exact prefix admission does not duplicate an append",
  );

  const directBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "invoke",
    catalogHandle: gtl.HELLO_WORLD_DIRECT_IDS.handle,
    programRef: gtl.HELLO_WORLD_DIRECT_IDS.programRef,
    eventResource: reopenEventResource(product, scenario.closeHandoff),
    ordinal: 10,
  });
  const siblingProgramBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "invoke",
    catalogHandle: gtl.HELLO_WORLD_IDS.graphFunctionRef,
    programRef: gtl.HELLO_WORLD_IDS.programRef,
    eventResource: reopenEventResource(product, scenario.closeHandoff),
    ordinal: 9,
  });
  const siblingGraphFunctionBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "invoke",
    catalogHandle: gtl.COMPOSED_HELLO_IDS.graphFunctionRef,
    programRef: gtl.COMPOSED_HELLO_IDS.programRef,
    eventResource: reopenEventResource(product, scenario.closeHandoff),
    ordinal: 8,
  });
  assert.deepEqual(directBasis.resolution.program.starts, []);
  assert.equal(
    product.isProductExecutionResolution(directBasis.resolution.resolution),
    true,
  );
  assert.equal(
    product.isProductExecutionResolution(
      siblingProgramBasis.resolution.resolution,
    ),
    true,
  );
  assert.equal(
    product.isProductExecutionResolution(
      siblingGraphFunctionBasis.resolution.resolution,
    ),
    true,
  );
  const directMembership =
    directBasis.resolution.resolution.programGraphFunctionMembership;
  const siblingMembership =
    siblingProgramBasis.resolution.resolution.programGraphFunctionMembership;
  assert.notDeepEqual(directMembership, siblingMembership);
  assert.equal(
    product.isProductExecutionResolution(Object.freeze({
      ...directBasis.resolution.resolution,
      programGraphFunctionMembership: siblingMembership,
    })),
    false,
    "membership substitution invalidates the unchanged enclosing digest",
  );
  assert.equal(
    product.isProductExecutionResolution(recomputeCorruptResolution(
      product,
      directBasis.resolution.resolution,
      { programGraphFunctionMembership: siblingMembership },
    )),
    false,
    "recomputing the enclosing resolution cannot cover a wrong membership",
  );

  const directSlots = directBasis.call.invocation.invocationAuthority.slots;
  const siblingProgramSlots =
    siblingProgramBasis.call.invocation.invocationAuthority.slots;
  const siblingGraphFunctionSlots =
    siblingGraphFunctionBasis.call.invocation.invocationAuthority.slots;
  assert.notDeepEqual(
    directSlots.execution_program,
    siblingProgramSlots.execution_program,
  );
  assert.deepEqual(
    directSlots.graph_function.graphFunction,
    siblingProgramSlots.graph_function.graphFunction,
  );
  assert.notDeepEqual(
    directSlots.graph_function.graphFunction,
    siblingGraphFunctionSlots.graph_function.graphFunction,
  );
  const directInvocation = directBasis.call.invocation;
  const preAuthorityFalsifierBytes = await readFile(scenario.eventLogPath);
  const assertPreappendRefusal = async (
    label,
    binding,
    basis,
    invocation,
    code,
    expectedBytes,
  ) => {
    const result = await Effect.runPromise(binding(Object.freeze({
      ...basis.call,
      invocation,
    })));
    assert.equal(result.ownerOutput.outcomeKind, "refusal", label);
    assert.equal(result.ownerOutput.value.code, code, label);
    assert.deepEqual(
      result.resources.eventResource.entryPrefix,
      result.resources.eventResource.closeHandoff.prefix,
      `${label} leaves the exact prefix unchanged`,
    );
    assert.deepEqual(
      await readFile(scenario.eventLogPath),
      expectedBytes,
      `${label} admits no ABG append`,
    );
  };
  const assertAuthorityRefusal = async (label, slots) => {
    const invocation = reissueRunInvocation(
      product,
      directInvocation,
      { slots: Object.freeze(slots) },
    );
    await assertPreappendRefusal(
      label,
      invoke,
      directBasis,
      invocation,
      "invalid_capability",
      preAuthorityFalsifierBytes,
    );
  };
  await assertAuthorityRefusal("coherent sibling Program", {
    ...directSlots,
    execution_program: siblingProgramSlots.execution_program,
  });
  await assertAuthorityRefusal("coherent sibling GraphFunction", {
    ...directSlots,
    graph_function: Object.freeze({
      ...directSlots.graph_function,
      graphFunction: siblingGraphFunctionSlots.graph_function.graphFunction,
    }),
  });
  await assertAuthorityRefusal("crossed membership ref", {
    ...directSlots,
    graph_function: Object.freeze({
      ...directSlots.graph_function,
      membership: Object.freeze({
        ref: siblingMembership.ref,
        digest: directMembership.digest,
      }),
    }),
  });
  await assertAuthorityRefusal("crossed membership digest", {
    ...directSlots,
    graph_function: Object.freeze({
      ...directSlots.graph_function,
      membership: Object.freeze({
        ref: directMembership.ref,
        digest: siblingMembership.digest,
      }),
    }),
  });
  const siblingInputContractDigest = product.sha256Canonical({
    contract: "coherent sibling invoke input",
  });
  const siblingInputContract = Object.freeze({
    ref: `contract://w2-05/sibling/${siblingInputContractDigest.slice("sha256:".length)}`,
    digest: siblingInputContractDigest,
  });
  await assertPreappendRefusal(
    "invoke coherent wrong input_contract authority slot",
    invoke,
    directBasis,
    reissueRunInvocation(product, directInvocation, {
      slots: Object.freeze({
        ...directSlots,
        input_contract: Object.freeze({
          ...directSlots.input_contract,
          contract: siblingInputContract,
        }),
      }),
    }),
    "invalid_input",
    preAuthorityFalsifierBytes,
  );
  await assertPreappendRefusal(
    "invoke coherent wrong request input contract",
    invoke,
    directBasis,
    reissueRunInvocation(product, directInvocation, {
      rawRequest: Object.freeze({
        ...directInvocation.request,
        inputContract: siblingInputContract,
      }),
    }),
    "invalid_input",
    preAuthorityFalsifierBytes,
  );
  const substitutedInputDigest = product.sha256Canonical({
    input: "substituted authority value",
  });
  const substitutedInputValue = Object.freeze({
    kind: "hello_world_input",
    schemaVersion,
    subject: "substituted authority value",
  });
  const coherentSubstitutedValueDigest = product.sha256Canonical(
    substitutedInputValue,
  );
  const coherentSubstitutedAdmissionDigest = product.sha256Canonical({
    contractRef: directSlots.input_contract.contract.ref,
    expectedKind: "invocation_input",
    subjectDigest: coherentSubstitutedValueDigest,
  });
  for (const [label, inputContractAuthority] of [
    [
      "invoke wrong input valueRef",
      Object.freeze({
        ...directSlots.input_contract,
        valueRef:
          `raw-admission://abiogenesis/${substitutedInputDigest.slice("sha256:".length)}`,
      }),
    ],
    [
      "invoke wrong input valueDigest",
      Object.freeze({
        ...directSlots.input_contract,
        valueDigest: substitutedInputDigest,
      }),
    ],
    [
      "invoke coherent substituted authority value",
      Object.freeze({
        ...directSlots.input_contract,
        valueRef:
          `raw-admission://abiogenesis/${coherentSubstitutedAdmissionDigest.slice("sha256:".length)}`,
        valueDigest: coherentSubstitutedValueDigest,
        value: substitutedInputValue,
      }),
    ],
  ]) {
    await assertPreappendRefusal(
      label,
      invoke,
      directBasis,
      reissueRunInvocation(product, directInvocation, {
        slots: Object.freeze({
          ...directSlots,
          input_contract: inputContractAuthority,
        }),
      }),
      "invalid_input",
      preAuthorityFalsifierBytes,
    );
  }
  const {
    catalogDigest: _installedCatalogDigest,
    ...installedCatalogBody
  } = harness.candidateManifest.publicContractCatalog;
  const siblingCatalogBody = Object.freeze({
    ...installedCatalogBody,
    catalogId: `${installedCatalogBody.catalogId}/sibling`,
  });
  const siblingCatalogDigest = product.sha256Canonical(siblingCatalogBody);
  const siblingContractCatalog = Object.freeze({
    ...directInvocation.contractCatalog,
    catalogId: siblingCatalogBody.catalogId,
    catalogDigest: siblingCatalogDigest,
  });
  await assertPreappendRefusal(
    "invoke coherent wrong installed contract catalog",
    invoke,
    directBasis,
    reissueRunContractCatalog(
      product,
      directInvocation,
      siblingContractCatalog,
    ),
    "invalid_view",
    preAuthorityFalsifierBytes,
  );
  const substitutedActorRef = "actor://w2-05/substituted";
  await assertAuthorityRefusal("invoke substituted actor", {
    ...directSlots,
    actor: Object.freeze({
      ...directSlots.actor,
      actor: Object.freeze({
        ref: substitutedActorRef,
        digest: product.sha256Canonical({ actorRef: substitutedActorRef }),
      }),
    }),
  });
  const substitutedGrantDigest = product.sha256Canonical({
    grant: "coherent substituted run grant",
  });
  await assertAuthorityRefusal("invoke substituted grant", {
    ...directSlots,
    capability_grants: Object.freeze({
      ...directSlots.capability_grants,
      grants: Object.freeze([
        Object.freeze({
          ref:
            `capability-grant://abiogenesis/${substitutedGrantDigest.slice("sha256:".length)}`,
          digest: substitutedGrantDigest,
        }),
        ...directSlots.capability_grants.grants.slice(1),
      ]),
    }),
  });
  const operationCoordinateBody = Object.freeze({
    operationId,
    memberKey: "invoke",
    definitionDigest: directInvocation.definitionDigest,
    invocationRef: directInvocation.invocationRef,
    invocationPayloadDigest: directInvocation.requestDigest,
  });
  const operationCoordinateDigest = product.sha256Canonical(
    operationCoordinateBody,
  );
  assert.notEqual(operationCoordinateDigest, directInvocation.invocationDigest);
  assert.notEqual(
    directBasis.candidate.invocationDigest,
    directInvocation.invocationDigest,
  );
  assert.notEqual(
    directBasis.candidate.invocationDigest,
    operationCoordinateDigest,
  );
  assert.equal(directBasis.candidate.kind, "public_invocation_candidate");

  const preSubstitutionBytes = await readFile(scenario.eventLogPath);
  const cForEInvocation = Object.freeze({
    ...directInvocation,
    invocationDigest: operationCoordinateDigest,
  });
  const cForEFault = await faultOf(invoke(Object.freeze({
    ...directBasis.call,
    invocation: cForEInvocation,
  })));
  assert.equal(cForEFault.code, "call_identity_mismatch");
  assert.deepEqual(await readFile(scenario.eventLogPath), preSubstitutionBytes);

  const reopenedForCoordinateRefusal = abg.reopenEventStore(
    scenario.closeHandoff.reopenAuthority,
  );
  assert.equal(
    reopenedForCoordinateRefusal.kind,
    "reopened_event_store_context",
    JSON.stringify(reopenedForCoordinateRefusal),
  );
  const coordinateArtifactTruth = abg.projectExactPrefixArtifactTruth(
    scenario.closeHandoff.prefix,
  );
  assert.equal(
    coordinateArtifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(coordinateArtifactTruth),
  );
  const eForCRefusal = abg.admitExactInvocation(
    reopenedForCoordinateRefusal.store,
    {
      invocation: directBasis.candidate,
      publicInvocation: directInvocation,
      rawInput: directBasis.rawInput,
      programPublication: directBasis.resolution.programPublication,
      executionResolution: directBasis.resolution.resolution,
      program: directBasis.resolution.program,
      graphFunction: directBasis.resolution.selectedCatalogEntry.definition,
      programValidation: directBasis.resolution.programValidation,
      workspaceBinding: directBasis.workspaceBinding,
      artifactTruth: coordinateArtifactTruth,
      catalogView,
      catalogApplications: [],
      policy: directBasis.policy,
      capabilityGrants: directBasis.grants,
      authority: directBasis.authority,
    },
    Object.freeze({
      ...operationCoordinateBody,
      invocationDigest: directInvocation.invocationDigest,
      authorityScopeRef: directBasis.workspaceBinding.bindingId,
      authorityScopeDigest: directBasis.workspaceBinding.bindingDigest,
      correlationId: directInvocation.correlationRef,
      eventTime: directInvocation.eventTime,
      causationEventRefs: Object.freeze([]),
    }),
  );
  assert.equal(eForCRefusal.code, "operation_mismatch");
  assert.deepEqual(
    reopenedForCoordinateRefusal.store.projectReopenAuthorityAndClose(),
    scenario.closeHandoff,
    "E-for-C refusal closes at the unchanged exact prefix",
  );
  assert.deepEqual(await readFile(scenario.eventLogPath), preSubstitutionBytes);

  const setupEvents = abg.readRuntimeEventsAtDurablePrefix(
    scenario.closeHandoff.prefix,
  );
  const direct = await runVerifiedInstalledDefinitionInFreshProcess(
    harness,
    installedInvokeBasis,
    directBasis.call,
    "invoke-completed",
  );
  assert.equal(direct.ownerOutput.outcomeKind, "result");
  assert.equal(direct.ownerOutput.value.disposition, "completed");
  assert.deepEqual(
    direct.resources.eventResource.entryPrefix,
    scenario.closeHandoff.prefix,
  );
  assert.ok(
    direct.resources.eventResource.closeHandoff.prefix.prefixLength >
      direct.resources.eventResource.entryPrefix.prefixLength,
  );
  const directEvents = abg.readRuntimeEventsAtDurablePrefix(
    direct.resources.eventResource.closeHandoff.prefix,
  );
  const directSuffix = directEvents.slice(setupEvents.length);
  assert.ok(directSuffix.some((row) => row.kind === "invocation_admitted"));
  assert.ok(directSuffix.some((row) => row.kind === "frame_opened"));
  assert.ok(directSuffix.some((row) => row.kind === "run_closed"));
  const directAdmission = directSuffix.find(
    (row) => row.kind === "invocation_admitted",
  );
  assert.equal(
    directAdmission?.payload.invocationDigest,
    directBasis.candidate.invocationDigest,
  );
  assert.equal(
    directAdmission?.payload.publicRequestInvocationRef,
    directInvocation.invocationRef,
  );

  const startBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "start",
    catalogHandle: gtl.HELLO_WORLD_IDS.graphFunctionRef,
    programRef: gtl.HELLO_WORLD_IDS.programRef,
    eventResource: reopenEventResource(
      product,
      direct.resources.eventResource.closeHandoff,
    ),
    ordinal: 11,
    omitFhMode: true,
  });
  assert.equal(
    Object.hasOwn(startBasis.call.invocation.request, "fhMode"),
    false,
  );
  assert.equal(startBasis.admittedRequest.fhMode, "direct");
  assert.equal(
    startBasis.call.invocation.requestDigest,
    product.sha256Canonical(startBasis.admittedRequest),
  );
  assert.notEqual(
    startBasis.call.invocation.requestDigest,
    product.sha256Canonical(startBasis.call.invocation.request),
    "the raw request is not permitted to author the admitted default identity",
  );
  const stalePrefixBytes = await readFile(scenario.eventLogPath);
  for (const [label, binding, basis] of [
    ["invoke", invoke, directBasis],
    ["start", start, startBasis],
  ]) {
    const staleFault = await faultOf(binding(Object.freeze({
      ...basis.call,
      resources: Object.freeze({
        ...basis.call.resources,
        eventResource: reopenEventResource(product, scenario.closeHandoff),
      }),
    })));
    assert.equal(staleFault.faultBoundary, "pre_acquisition_or_pre_append", label);
    assert.equal(staleFault.resourceReceipt, null, label);
    assert.equal(staleFault.stage, "resource_acquisition", label);
    assert.deepEqual(
      await readFile(scenario.eventLogPath),
      stalePrefixBytes,
      `${label} refuses a valid stale predecessor without append`,
    );
  }
  for (const [label, binding, basis, crossHandoff, crossPath] of [
    ["invoke", invoke, directBasis, closeHandoff, invokeLog],
    [
      "start",
      start,
      startBasis,
      startResult.resources.eventResource.closeHandoff,
      startLog,
    ],
  ]) {
    const crossBytes = await readFile(crossPath);
    const crossed = await Effect.runPromise(binding(Object.freeze({
      ...basis.call,
      resources: Object.freeze({
        ...basis.call.resources,
        eventResource: reopenEventResource(product, crossHandoff),
      }),
    })));
    assert.equal(crossed.ownerOutput.outcomeKind, "refusal", label);
    assert.equal(crossed.ownerOutput.value.code, "invalid_program", label);
    assert.deepEqual(
      crossed.resources.eventResource.entryPrefix,
      crossHandoff.prefix,
      label,
    );
    assert.deepEqual(
      crossed.resources.eventResource.closeHandoff.prefix,
      crossHandoff.prefix,
      label,
    );
    assert.deepEqual(
      await readFile(crossPath),
      crossBytes,
      `${label} refuses a valid cross-store prefix without append`,
    );
  }
  const startAuthorityInvocation = startBasis.call.invocation;
  const startSlots = startAuthorityInvocation.invocationAuthority.slots;
  const coherentStartAdmissionDigest = product.sha256Canonical({
    contractRef: startSlots.input_contract.contract.ref,
    expectedKind: "invocation_input",
    subjectDigest: coherentSubstitutedValueDigest,
  });
  const preStartAuthorityBytes = await readFile(scenario.eventLogPath);
  const reissueStart = ({
    slots = startSlots,
    rawRequest = startAuthorityInvocation.request,
    identityRequest = startBasis.admittedRequest,
  } = {}) => reissueRunInvocation(product, startAuthorityInvocation, {
    slots: Object.freeze(slots),
    rawRequest: Object.freeze(rawRequest),
    identityRequest: Object.freeze(identityRequest),
  });
  const startRequestWithInput = (input) => Object.freeze({
    rawRequest: Object.freeze({
      ...startAuthorityInvocation.request,
      input,
    }),
    identityRequest: Object.freeze({
      ...startBasis.admittedRequest,
      input,
    }),
  });
  const assertStartRefusal = async (label, invocation, code) =>
    assertPreappendRefusal(
      label,
      start,
      startBasis,
      invocation,
      code,
      preStartAuthorityBytes,
    );
  const wrongStartContractInput = Object.freeze({
    ...startSlots.input_contract,
    contract: siblingInputContract,
  });
  await assertStartRefusal(
    "start coherent wrong input_contract authority slot",
    reissueStart({
      slots: { ...startSlots, input_contract: wrongStartContractInput },
    }),
    "invalid_input",
  );
  await assertStartRefusal(
    "start coherent wrong request input contract",
    reissueStart(startRequestWithInput(wrongStartContractInput)),
    "invalid_input",
  );
  for (const [label, replacement] of [
    [
      "start wrong input valueRef",
      Object.freeze({
        ...startSlots.input_contract,
        valueRef:
          `raw-admission://abiogenesis/${substitutedInputDigest.slice("sha256:".length)}`,
      }),
    ],
    [
      "start wrong input valueDigest",
      Object.freeze({
        ...startSlots.input_contract,
        valueDigest: substitutedInputDigest,
      }),
    ],
    [
      "start coherent substituted input value",
      Object.freeze({
        ...startSlots.input_contract,
        valueRef:
          `raw-admission://abiogenesis/${coherentStartAdmissionDigest.slice("sha256:".length)}`,
        valueDigest: coherentSubstitutedValueDigest,
        value: substitutedInputValue,
      }),
    ],
  ]) {
    await assertStartRefusal(
      `${label} authority slot`,
      reissueStart({
        slots: { ...startSlots, input_contract: replacement },
      }),
      "invalid_input",
    );
    await assertStartRefusal(
      `${label} request input`,
      reissueStart(startRequestWithInput(replacement)),
      "invalid_input",
    );
  }
  await assertStartRefusal(
    "start coherent wrong installed contract catalog",
    reissueRunContractCatalog(
      product,
      startAuthorityInvocation,
      siblingContractCatalog,
      startBasis.admittedRequest,
    ),
    "invalid_view",
  );
  await assertStartRefusal(
    "start substituted actor",
    reissueStart({
      slots: {
        ...startSlots,
        actor: Object.freeze({
          ...startSlots.actor,
          actor: Object.freeze({
            ref: substitutedActorRef,
            digest: product.sha256Canonical({ actorRef: substitutedActorRef }),
          }),
        }),
      },
    }),
    "invalid_capability",
  );
  await assertStartRefusal(
    "start substituted grant",
    reissueStart({
      slots: {
        ...startSlots,
        capability_grants: Object.freeze({
          ...startSlots.capability_grants,
          grants: Object.freeze([
            Object.freeze({
              ref:
                `capability-grant://abiogenesis/${substitutedGrantDigest.slice("sha256:".length)}`,
              digest: substitutedGrantDigest,
            }),
            ...startSlots.capability_grants.grants.slice(1),
          ]),
        }),
      },
    }),
    "invalid_capability",
  );
  const startOperationCoordinateBody = Object.freeze({
    operationId,
    memberKey: "start",
    definitionDigest: startAuthorityInvocation.definitionDigest,
    invocationRef: startAuthorityInvocation.invocationRef,
    invocationPayloadDigest: startAuthorityInvocation.requestDigest,
  });
  const startOperationCoordinateDigest = product.sha256Canonical(
    startOperationCoordinateBody,
  );
  const startCForEFault = await faultOf(start(Object.freeze({
    ...startBasis.call,
    invocation: Object.freeze({
      ...startAuthorityInvocation,
      invocationDigest: startOperationCoordinateDigest,
    }),
  })));
  assert.equal(startCForEFault.code, "call_identity_mismatch");
  assert.deepEqual(await readFile(scenario.eventLogPath), preStartAuthorityBytes);

  const reopenedForStartCoordinateRefusal = abg.reopenEventStore(
    direct.resources.eventResource.closeHandoff.reopenAuthority,
  );
  assert.equal(
    reopenedForStartCoordinateRefusal.kind,
    "reopened_event_store_context",
    JSON.stringify(reopenedForStartCoordinateRefusal),
  );
  const startCoordinateArtifactTruth = abg.projectExactPrefixArtifactTruth(
    direct.resources.eventResource.closeHandoff.prefix,
  );
  assert.equal(
    startCoordinateArtifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(startCoordinateArtifactTruth),
  );
  const admittedStartInvocation = Object.freeze({
    ...startAuthorityInvocation,
    request: startBasis.admittedRequest,
  });
  const startEForCRefusal = abg.admitExactInvocation(
    reopenedForStartCoordinateRefusal.store,
    {
      invocation: startBasis.candidate,
      publicInvocation: admittedStartInvocation,
      rawInput: startBasis.rawInput,
      programPublication: startBasis.resolution.programPublication,
      executionResolution: startBasis.resolution.resolution,
      program: startBasis.resolution.program,
      graphFunction: startBasis.resolution.selectedCatalogEntry.definition,
      programValidation: startBasis.resolution.programValidation,
      workspaceBinding: startBasis.workspaceBinding,
      artifactTruth: startCoordinateArtifactTruth,
      catalogView,
      catalogApplications: [],
      policy: startBasis.policy,
      capabilityGrants: startBasis.grants,
      authority: startBasis.authority,
    },
    Object.freeze({
      ...startOperationCoordinateBody,
      invocationDigest: startAuthorityInvocation.invocationDigest,
      authorityScopeRef: startBasis.workspaceBinding.bindingId,
      authorityScopeDigest: startBasis.workspaceBinding.bindingDigest,
      correlationId: startAuthorityInvocation.correlationRef,
      eventTime: startAuthorityInvocation.eventTime,
      causationEventRefs: Object.freeze([]),
    }),
  );
  assert.equal(startEForCRefusal.code, "operation_mismatch");
  assert.deepEqual(
    reopenedForStartCoordinateRefusal.store.projectReopenAuthorityAndClose(),
    direct.resources.eventResource.closeHandoff,
    "start E-for-C refusal closes at the unchanged exact prefix",
  );
  assert.deepEqual(await readFile(scenario.eventLogPath), preStartAuthorityBytes);

  const started = await runVerifiedInstalledDefinitionInFreshProcess(
    harness,
    installedStartBasis,
    startBasis.call,
    "start-completed",
  );
  assert.equal(started.ownerOutput.outcomeKind, "result");
  assert.equal(started.ownerOutput.value.disposition, "completed");
  assert.deepEqual(
    started.resources.eventResource.entryPrefix,
    direct.resources.eventResource.closeHandoff.prefix,
  );
  assert.ok(
    started.resources.eventResource.closeHandoff.prefix.prefixLength >
      started.resources.eventResource.entryPrefix.prefixLength,
  );
  const startedEvents = abg.readRuntimeEventsAtDurablePrefix(
    started.resources.eventResource.closeHandoff.prefix,
  );
  const startedSuffix = startedEvents.slice(directEvents.length);
  assert.ok(startedSuffix.some((row) => row.kind === "invocation_admitted"));
  assert.ok(startedSuffix.some((row) => row.kind === "frame_opened"));
  assert.ok(startedSuffix.some((row) => row.kind === "run_closed"));
  const startedAdmission = startedSuffix.find(
    (row) => row.kind === "invocation_admitted",
  );
  assert.equal(
    startedAdmission?.payload.publicRequestDigest,
    product.sha256Canonical(startBasis.admittedRequest),
  );

  const preOpenFailureBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "invoke",
    catalogHandle: gtl.HELLO_WORLD_DIRECT_IDS.handle,
    programRef: gtl.HELLO_WORLD_DIRECT_IDS.programRef,
    eventResource: reopenEventResource(
      product,
      started.resources.eventResource.closeHandoff,
    ),
    ordinal: 12,
  });
  const preOpenFailure = await invokeWithInjectedPreOpenFailure(
    harness,
    installedInvokeBasis,
    preOpenFailureBasis.call,
  );
  assert.equal(preOpenFailure.kind, "injected_pre_open_failure");
  assert.equal(preOpenFailure.fault.kind, "definition_execution_fault");
  assert.equal(preOpenFailure.fault.faultBoundary, "post_append");
  assert.equal(preOpenFailure.fault.stage, "graph_materialization");
  assert.deepEqual(
    preOpenFailure.fault.resourceReceipt.eventResource.entryPrefix,
    started.resources.eventResource.closeHandoff.prefix,
  );
  const preOpenHandoff =
    preOpenFailure.fault.resourceReceipt.eventResource.closeHandoff;
  assert.ok(
    preOpenHandoff.prefix.prefixLength >
      started.resources.eventResource.closeHandoff.prefix.prefixLength,
  );
  const preOpenBytes = await readFile(scenario.eventLogPath);
  assert.equal(preOpenBytes.byteLength, preOpenHandoff.prefix.prefixLength);
  const preOpenEvents = abg.readRuntimeEventsAtDurablePrefix(
    preOpenHandoff.prefix,
  );
  const preOpenSuffix = preOpenEvents.slice(startedEvents.length);
  assert.deepEqual(
    preOpenSuffix.map((row) => row.kind),
    ["public_operation_admitted", "invocation_admitted"],
    "pre-open failure returns the exact latest durable invocation prefix",
  );

  const executionBasisFailureBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "invoke",
    catalogHandle: gtl.HELLO_WORLD_DIRECT_IDS.handle,
    programRef: gtl.HELLO_WORLD_DIRECT_IDS.programRef,
    eventResource: reopenEventResource(product, preOpenHandoff),
    ordinal: 13,
  });
  const executionBasisFailure =
    await invokeWithInjectedExecutionBasisPostCommitFailure(
      harness,
      installedInvokeBasis,
      executionBasisFailureBasis.call,
    );
  assert.equal(
    executionBasisFailure.kind,
    "injected_execution_basis_post_commit_failure",
  );
  assert.equal(executionBasisFailure.fault.kind, "definition_execution_fault");
  assert.equal(executionBasisFailure.fault.faultBoundary, "post_append");
  assert.equal(executionBasisFailure.fault.stage, "open_call");
  assert.deepEqual(
    executionBasisFailure.fault.resourceReceipt.eventResource.entryPrefix,
    preOpenHandoff.prefix,
  );
  const executionBasisFailureHandoff =
    executionBasisFailure.fault.resourceReceipt.eventResource.closeHandoff;
  assert.ok(
    executionBasisFailureHandoff.prefix.prefixLength >
      preOpenHandoff.prefix.prefixLength,
  );
  const executionBasisFailureEvents = abg.readRuntimeEventsAtDurablePrefix(
    executionBasisFailureHandoff.prefix,
  );
  const executionBasisFailureSuffix = executionBasisFailureEvents.slice(
    preOpenEvents.length,
  );
  assert.deepEqual(
    executionBasisFailureSuffix.map((row) => row.kind),
    [
      "public_operation_admitted",
      "invocation_admitted",
      "implementation_admitted",
      "basis_admitted",
    ],
    "the unchanged execution-basis successor reaches the next child and the fault receipt",
  );
  assert.equal(
    executionBasisFailureSuffix.some((row) => row.kind === "frame_opened"),
    false,
  );
  assert.equal(
    (await readFile(scenario.eventLogPath)).byteLength,
    executionBasisFailureHandoff.prefix.prefixLength,
  );

  const failureBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "start",
    catalogHandle: gtl.HELLO_WORLD_IDS.graphFunctionRef,
    programRef: gtl.HELLO_WORLD_IDS.programRef,
    eventResource: reopenEventResource(
      product,
      executionBasisFailureHandoff,
    ),
    ordinal: 14,
  });
  const installedManifest = JSON.parse(await readFile(
    join(
      failureBasis.admittedInstall.installedRoot,
      "product-toolchain-manifest.json",
    ),
    "utf8",
  ));
  const mutationLocator = [...installedManifest.productRelativeLocators]
    .sort()
    .at(-1);
  assert.equal(typeof mutationLocator, "string");
  const mutationTarget = join(
    failureBasis.admittedInstall.installedRoot,
    mutationLocator,
  );
  const heldMutationTarget = `${mutationTarget}.w2-05-held`;
  const baselineFrameCount = startedEvents.filter(
    (row) => row.kind === "frame_opened",
  ).length;
  const failedProgram = runVerifiedInstalledDefinitionInFreshProcess(
    harness,
    installedStartBasis,
    failureBasis.call,
    "start-post-open-failure",
  );
  await waitForAdditionalFrameOpen(scenario.eventLogPath, baselineFrameCount);
  await rename(mutationTarget, heldMutationTarget);
  let failed;
  try {
    failed = await failedProgram;
  } finally {
    await rename(heldMutationTarget, mutationTarget);
  }
  assert.equal(failed.ownerOutput.outcomeKind, "result");
  assert.equal(failed.ownerOutput.value.disposition, "runtime_failed");
  assert.deepEqual(
    failed.resources.eventResource.entryPrefix,
    executionBasisFailureHandoff.prefix,
  );
  assert.equal(
    failed.resources.eventResource.closeHandoff.reopenAuthority.durableByteLength,
    failed.resources.eventResource.closeHandoff.prefix.prefixLength,
  );
  const failedBytes = await readFile(scenario.eventLogPath);
  assert.equal(
    failedBytes.byteLength,
    failed.resources.eventResource.closeHandoff.prefix.prefixLength,
  );
  const failedEvents = abg.readRuntimeEventsAtDurablePrefix(
    failed.resources.eventResource.closeHandoff.prefix,
  );
  const failureSuffix = failedEvents.slice(executionBasisFailureEvents.length);
  assert.deepEqual(
    failureSuffix.filter((row) => row.kind === "runtime_failure_observed")
      .map((row) => row.payload.stage),
    ["implementation_load"],
  );
  assert.ok(failureSuffix.some((row) => row.kind === "invocation_admitted"));
  assert.ok(failureSuffix.some((row) => row.kind === "basis_admitted"));
  assert.ok(failureSuffix.some((row) => row.kind === "frame_opened"));
  assert.ok(
    failed.resources.eventResource.closeHandoff.prefix.prefixLength >
      failed.resources.eventResource.entryPrefix.prefixLength,
    "post-open failure preserves every already admitted append",
  );
  const recoveryBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "start",
    catalogHandle: gtl.HELLO_WORLD_IDS.graphFunctionRef,
    programRef: gtl.HELLO_WORLD_IDS.programRef,
    eventResource: reopenEventResource(
      product,
      failed.resources.eventResource.closeHandoff,
    ),
    ordinal: 15,
  });
  const recovered = await runVerifiedInstalledDefinitionInFreshProcess(
    harness,
    installedStartBasis,
    recoveryBasis.call,
    "start-recovery",
  );
  assert.equal(recovered.ownerOutput.outcomeKind, "result");
  assert.equal(recovered.ownerOutput.value.disposition, "completed");
  assert.deepEqual(
    recovered.resources.eventResource.entryPrefix,
    failed.resources.eventResource.closeHandoff.prefix,
  );
  assert.ok(
    recovered.resources.eventResource.closeHandoff.prefix.prefixLength >
      recovered.resources.eventResource.entryPrefix.prefixLength,
  );
  const recoveredEvents = abg.readRuntimeEventsAtDurablePrefix(
    recovered.resources.eventResource.closeHandoff.prefix,
  );
  const recoverySuffix = recoveredEvents.slice(failedEvents.length);
  assert.ok(recoverySuffix.some((row) => row.kind === "invocation_admitted"));
  assert.ok(recoverySuffix.some((row) => row.kind === "frame_opened"));
  assert.ok(recoverySuffix.some((row) => row.kind === "run_closed"));
  assert.equal(
    recoverySuffix.some((row) => row.kind === "runtime_failure_observed"),
    false,
  );
  assert.deepEqual(
    recoveredEvents.filter((row) => row.kind === "runtime_failure_observed")
      .map((row) => row.payload.stage),
    ["implementation_load"],
  );

  const reopenedFailure = abg.reopenEventStore(
    recovered.resources.eventResource.closeHandoff.reopenAuthority,
  );
  assert.equal(
    reopenedFailure.kind,
    "reopened_event_store_context",
    JSON.stringify(reopenedFailure),
  );
  const freshRuntimeProof = await proveFreshProcessRuntimeProjectionEquality({
    abg,
    product,
    installedPackageRoot: harness.installedPackageRoot,
    requests: [
      ["w2_05_direct_invoke_replay", direct],
      ["w2_05_start_replay", started],
      ["w2_05_post_append_failure_replay", failed],
      ["w2_05_recovery_replay", recovered],
    ].map(([rowId, outcome]) => ({
      rowId,
      exportName: "replay",
      args: [{ runId: outcome.ownerOutput.value.run.ref }],
    })),
    store: reopenedFailure.store,
  });
  assert.equal(freshRuntimeProof.retainedRows.length, 4);
  assert.deepEqual(
    freshRuntimeProof.retainedRows.map(
      (row) => row.projection.runtimeStatus,
    ),
    ["closed", "closed", "failed", "closed"],
  );

  for (const [specifier, callableExpression] of [
    [
      "@abiogenesis/typescript-tenant/product",
      "(module.RUN_DEFINITION_BINDINGS?.invoke?.start && module.RUN_DEFINITION_BINDINGS?.invoke?.invoke)",
    ],
    [
      "@abiogenesis/typescript-tenant/abg",
      "module.ABG_PROJECT_READ_DEFINITION_BINDINGS?.run_replay",
    ],
  ]) {
    const targetProof = installedTargetProofs.get(specifier);
    assert.ok(targetProof, `${specifier} sentinel target proof`);
    assert.equal(targetProof.target.startsWith(packageRoot), false, specifier);
    const probe = [
      `const module = await import(${JSON.stringify(specifier)});`,
      `console.log(typeof ${callableExpression});`,
    ].join("\n");
    const present = await execFileAsync(
      process.execPath,
      ["--input-type=module", "--eval", probe],
      {
        cwd: harness.cliHost,
        env: { ...process.env, NODE_OPTIONS: "" },
        maxBuffer: 1024 * 1024,
      },
    );
    assert.equal(present.stdout.trim(), "function", specifier);
    const heldTarget = `${targetProof.target}.source-blind-held`;
    await rename(targetProof.target, heldTarget);
    try {
      await assert.rejects(
        execFileAsync(
          process.execPath,
          ["--input-type=module", "--eval", probe],
          {
            cwd: harness.cliHost,
            env: { ...process.env, NODE_OPTIONS: "" },
            maxBuffer: 1024 * 1024,
          },
        ),
        (error) => {
          const stderr = String(error.stderr);
          assert.match(
            stderr,
            /ERR_MODULE_NOT_FOUND|Cannot find module/u,
          );
          assert.ok(
            stderr.includes(targetProof.target),
            `${specifier} rejection names its held installed target`,
          );
          return true;
        },
      );
    } finally {
      await rename(heldTarget, targetProof.target);
    }
  }

  const ambientDescendantBasis = await exactInstalledRunCall({
    publicApi,
    product,
    validator,
    scenario,
    catalog,
    catalogView,
    memberKey: "invoke",
    catalogHandle: gtl.HELLO_WORLD_DIRECT_IDS.handle,
    programRef: gtl.HELLO_WORLD_DIRECT_IDS.programRef,
    eventResource: reopenEventResource(
      product,
      recovered.resources.eventResource.closeHandoff,
    ),
    ordinal: 16,
  });
  const ambientRowsBefore = await readEventRows(scenario.eventLogPath);
  assert.equal(ambientRowsBefore.length, recoveredEvents.length);
  assert.equal(
    (await readFile(scenario.eventLogPath)).byteLength,
    recovered.resources.eventResource.closeHandoff.prefix.prefixLength,
  );
  const ambientDescendantFailure =
    await invokeWithInjectedAmbientDescendantBeforeRecovery(
      harness,
      installedInvokeBasis,
      ambientDescendantBasis.call,
    );
  assert.equal(
    ambientDescendantFailure.kind,
    "injected_ambient_descendant_before_recovery",
  );
  assert.equal(ambientDescendantFailure.succeeded, false);
  assert.equal(
    ambientDescendantFailure.fault,
    null,
    "an ambient descendant cannot be laundered into a DefinitionExecutionFault receipt",
  );
  assert.equal(ambientDescendantFailure.defect?.name, "TypeError");
  assert.match(
    ambientDescendantFailure.defect?.message ?? "",
    /ABG held store differs from the selected durable prefix/u,
  );
  const ambientRowsAfter = await readEventRows(scenario.eventLogPath);
  const ambientSuffix = ambientRowsAfter.slice(ambientRowsBefore.length);
  assert.ok(ambientSuffix.some((row) => row.kind === "frame_opened"));
  assert.equal(
    ambientSuffix.some((row) => row.kind === "run_closed"),
    false,
  );
  const ambientFailureRows = ambientSuffix.filter(
    (row) => row.kind === "runtime_failure_observed",
  );
  assert.equal(ambientFailureRows.length, 1);
  assert.equal(
    ambientFailureRows[0].payload.diagnosticRef,
    "diagnostic://abiogenesis/test/ambient-descendant@5",
  );
  assert.equal(
    ambientFailureRows[0].payload.stage,
    "operation_application",
  );
  assert.ok(
    (await readFile(scenario.eventLogPath)).byteLength >
      recovered.resources.eventResource.closeHandoff.prefix.prefixLength,
    "the owner-issued ambient descendant was durably appended on the same held resource",
  );

  process.stdout.write(`W2_05_RUN_PROOF ${JSON.stringify({
    bankedBehaviorHeld: 37,
    demonstratedConformanceHeld: 0,
    directRunRef: direct.ownerOutput.value.run.ref,
    startRunRef: started.ownerOutput.value.run.ref,
    failedRunRef: failed.ownerOutput.value.run.ref,
    recoveredRunRef: recovered.ownerOutput.value.run.ref,
    finalPrefix: recovered.resources.eventResource.closeHandoff.prefix,
  })}\n`);
});
