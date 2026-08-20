import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  access,
  readFile,
  rename,
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
const remainingKeys = Object.freeze([
  "abg.operation.interaction.respond#answer_escalation",
  "abg.operation.interaction.respond#approve",
  "abg.operation.interaction.respond#assess",
  "abg.operation.interaction.respond#reject",
  "abg.operation.interaction.respond#select",
  "abg.operation.product.materialize#configuration",
  "abg.operation.product.materialize#context_bootstrap",
  "abg.operation.project.read#release_evidence",
  "abg.operation.result.assess#assess",
  "abg.operation.run.continue#current_intent",
  "abg.operation.run.continue#selected_action",
  "abg.operation.witness.admit#attest",
  "abg.operation.witness.admit#hygiene-stamp",
  "abg.operation.witness.admit#intake",
  "abg.operation.witness.admit#reprice",
  "abg.operation.witness.admit#run-resumed",
  "abg.operation.witness.admit#run-stopped",
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

async function installedCallableCensus(harness, publicApi, product) {
  const modules = new Map();
  const rows = [];
  for (const definition of publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions) {
    const callable = definition.executionBindingSpecification.callable;
    const specifier = installedSpecifier(
      callable.packageName,
      callable.packageExportPath,
    );
    let loaded = modules.get(specifier);
    if (loaded === undefined) {
      loaded = await importInstalledPackageExport(
        harness,
        specifier,
        `w2-05-run-census=${encodeURIComponent(specifier)}`,
      );
      modules.set(specifier, loaded);
    }
    const value = valueAtPath(
      loaded[callable.namedExport],
      callable.memberPath,
    );
    rows.push(Object.freeze({
      definitionKey: keyOf(definition),
      callable: typeof value === "function",
    }));
  }
  return Object.freeze({
    definitionCount: rows.length,
    callableCount: rows.filter((row) => row.callable).length,
    missingKeys: Object.freeze(rows
      .filter((row) => !row.callable)
      .map((row) => row.definitionKey)
      .sort()),
    censusSha256: product.sha256Bytes(
      `${rows.filter((row) => row.callable)
        .map((row) => row.definitionKey)
        .join("\n")}\n`,
    ),
  });
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function admittedInvocation(product, body) {
  const invocationDigest = product.sha256Canonical(body);
  return Object.freeze({
    ...body,
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
  const invocationAuthority = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    authorityDigest: product.sha256Canonical(slots),
    slots,
  });
  const catalog = Object.freeze({
    productId: "product://abiogenesis/typescript-tenant@5",
    productContentDigest: product.sha256Canonical({ product: "run-binding-proof" }),
    catalogId: "catalog://abiogenesis/public-contracts@5",
    catalogVersion: schemaVersion,
    catalogDigest: product.sha256Canonical({ catalog: "run-binding-proof" }),
  });
  const requestDigest = product.sha256Canonical(request);
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
    requestContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "request",
      member.requestContract.definitionRef,
    ),
    requestRef:
      `public-request://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest,
    request,
    expectedResultContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "result",
      member.resultContract.definitionRef,
    ),
    expectedRefusalContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "refusal",
      member.refusalContract.definitionRef,
    ),
    expectedNonTerminalContract: contractCoordinate(
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
  return admittedInvocation(product, body);
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
  const contractBoundInput = Object.freeze({
    contract: inputContract,
    valueRef: `value://w2-05/${ordinal}/input`,
    valueDigest: product.sha256Canonical(input),
    value: input,
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
    ref: resolution.program.programRef,
    digest: product.sha256Canonical(resolution.program),
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
  const membershipBody = Object.freeze({
    programRef: resolution.program.programRef,
    graphFunctionRef: resolution.selectedCatalogEntry.definitionRef,
  });
  const membershipDigest = product.sha256Canonical(membershipBody);
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
            ref: resolution.selectedCatalogEntry.definitionRef,
            digest: resolution.selectedCatalogEntry.definitionDigest,
          }),
          membership: Object.freeze({
            ref:
              `program-graph-function-membership://abiogenesis/${membershipDigest.slice("sha256:".length)}`,
            digest: membershipDigest,
          }),
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
    assert.deepEqual(resolution.program.starts, []);
    assert.deepEqual(slots.graph_function?.graphFunction, {
      ref: resolution.selectedCatalogEntry.definitionRef,
      digest: resolution.selectedCatalogEntry.definitionDigest,
    });
    assert.deepEqual(slots.graph_function?.membership, {
      ref:
        `program-graph-function-membership://abiogenesis/${membershipDigest.slice("sha256:".length)}`,
      digest: membershipDigest,
    });
  } else {
    assert.equal(slots.graph_function, null);
  }
  const invocation = runCall(
    publicApi,
    product,
    memberKey,
    ordinal,
    { request, slots },
  );
  const rawInput = validator.rawAdmitValue(
    admittedInput,
    "invocation_input",
    inputContract.ref,
  );
  assert.equal(rawInput.kind, "raw_admitted_value");
  const candidate = memberKey === "invoke"
    ? product.constructExactDirectInvocation(
        invocation,
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
        invocation,
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
  const invokeResult = await Effect.runPromise(invoke(callWithResources(
    invokeInvocation,
    admittedRunResources(
      newEventResource(product, invokeLog),
      catalog,
      catalogView,
    ),
  )));
  const startResult = await Effect.runPromise(start(callWithResources(
    startInvocation,
    admittedRunResources(
      newEventResource(product, startLog),
      catalog,
      catalogView,
    ),
  )));
  for (const [label, result, eventLogPath] of [
    ["invoke", invokeResult, invokeLog],
    ["start", startResult, startLog],
  ]) {
    assert.equal(result.ownerOutput.outcomeKind, "refusal", label);
    assert.equal(result.ownerOutput.value.code, "invalid_program", label);
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
  const directInvocation = directBasis.call.invocation;
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
  const direct = await Effect.runPromise(invoke(directBasis.call));
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
  });
  const started = await Effect.runPromise(start(startBasis.call));
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
      started.resources.eventResource.closeHandoff,
    ),
    ordinal: 12,
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
  const failedProgram = Effect.runPromise(start(failureBasis.call));
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
    started.resources.eventResource.closeHandoff.prefix,
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
  const failureSuffix = failedEvents.slice(startedEvents.length);
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
    ordinal: 13,
  });
  const recovered = await Effect.runPromise(start(recoveryBasis.call));
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

  const census = await installedCallableCensus(harness, publicApi, product);
  assert.equal(census.definitionCount, 56);
  assert.equal(census.callableCount, 39);
  assert.deepEqual(census.missingKeys, remainingKeys);
  assert.equal(
    census.censusSha256,
    "sha256:f678c07a43f273a1dab4ba414652bf3c31fd046782245a065de2ee6e97762218",
  );
  process.stdout.write(`W2_05_RUN_PROOF ${JSON.stringify({
    definitionCount: census.definitionCount,
    callableCount: census.callableCount,
    missingKeys: census.missingKeys,
    censusSha256: census.censusSha256,
    directRunRef: direct.ownerOutput.value.run.ref,
    startRunRef: started.ownerOutput.value.run.ref,
    failedRunRef: failed.ownerOutput.value.run.ref,
    recoveredRunRef: recovered.ownerOutput.value.run.ref,
    finalPrefix: recovered.resources.eventResource.closeHandoff.prefix,
  })}\n`);
});
