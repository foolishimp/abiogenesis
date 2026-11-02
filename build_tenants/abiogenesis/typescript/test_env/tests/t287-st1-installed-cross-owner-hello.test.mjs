import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, realpath, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

import * as Effect from "effect/Effect";

import { prepareLanguageSmokeFixture } from
  "../support/language-smoke-fixture.mjs";
import { prepareDeveloperMiniProduct } from
  "../support/developer-mini-product.mjs";
import * as qualification from "../qualification/dispatch.mjs";
import { installedModules, publicCaller } from "../uat/public-setup.mjs";
import { constructInstalledPublicDefinitionCall } from
  "../support/installed-public-definition-call.mjs";
import {
  publicOperationBasis,
  setupInstalledRootCatalog,
} from
  "../support/root-installed-environment.mjs";

const execFileAsync = promisify(execFile);
const packageRoot = new URL("../..", import.meta.url).pathname;
const freshProcessReadWorker = fileURLToPath(new URL(
  "../support/t287-st3-fresh-process-read-worker.mjs",
  import.meta.url,
));
const operationId = "abg.operation.run.invoke";
const schemaVersion = "5.0.0";

async function runFreshProcessRead({
  scratch,
  installedRoot,
  identity,
  readCalls,
  expectation,
}) {
  const requestPath = join(scratch, `st3-${identity}-request.json`);
  await writeFile(requestPath, JSON.stringify({
    kind: "st3_fresh_process_read_request",
    schemaVersion,
    installedRoot,
    readCalls,
    expectation,
  }));
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [freshProcessReadWorker, requestPath],
    {
      cwd: scratch,
      env: {},
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  assert.equal(stderr, "", `${identity} child must not emit stderr`);
  return JSON.parse(stdout);
}

async function runInstalledCliRequest({
  scratch,
  installedRoot,
  identity,
  acquisition,
  call,
  expectedExitCode = 0,
}) {
  const requestPath = join(scratch, `st4-${identity}-request.jsonl`);
  const cliPath = join(installedRoot, "build/code/src/public/cli.js");
  await writeFile(requestPath, `${JSON.stringify({
    kind: "abg_cli_transport_request",
    schemaVersion,
    acquisition,
    invocation: call,
  })}\n`);
  let execution;
  try {
    execution = await execFileAsync(
      process.execPath,
      [cliPath, "--jsonl", requestPath],
      { cwd: scratch, env: {}, maxBuffer: 10 * 1024 * 1024 },
    );
    assert.equal(expectedExitCode, 0, `${identity} CLI exit`);
  } catch (error) {
    assert.equal(error.code, expectedExitCode, `${identity} CLI exit`);
    execution = error;
  }
  assert.equal(execution.stderr, "", `${identity} CLI stderr`);
  const lines = execution.stdout.trim().split(/\r?\n/u);
  assert.equal(lines.length, 1, `${identity} one CLI output`);
  return Object.freeze({
    cliPath,
    requestPath,
    output: JSON.parse(lines[0]),
  });
}

function rehashGrant(product, grant, patch) {
  const {
    kind,
    schemaVersion: grantSchemaVersion,
    grantRef: _grantRef,
    grantDigest: _grantDigest,
    ...originalBody
  } = grant;
  const body = Object.freeze({ ...originalBody, ...patch });
  const grantDigest = product.sha256Canonical(body);
  return Object.freeze({
    kind,
    schemaVersion: grantSchemaVersion,
    grantRef:
      `capability-grant://abiogenesis/${grantDigest.slice("sha256:".length)}`,
    grantDigest,
    ...body,
  });
}

test("ST-4 transport refuses inherited selectors and owner traversal", async () => {
  const publicApi = await import(
    `${pathToFileURL(join(
      packageRoot,
      "build/code/src/public/index.js",
    )).href}?st4-boundary=${Date.now()}`
  );
  const eventLogPath = "/tmp/abi5-st4-boundary-falsifier.jsonl";
  const eventResource = {
    kind: "new_abg_event_resource",
    eventLogPath,
  };
  const routeCandidate = {
    invocation: {
      kind: "public_invocation",
      definitionKey: {
        operationId: "abg.operation.project.read",
        memberKey: "release_evidence",
      },
    },
    resources: { eventResource },
  };
  assert.equal(
    publicApi.isInstalledDefinitionCallCandidate(routeCandidate),
    true,
  );

  const inherited = (prototype, own) =>
    Object.assign(Object.create(prototype), own);
  const accessor = (own, property, value) =>
    Object.defineProperty(own, property, {
      configurable: true,
      enumerable: true,
      get: () => value,
    });
  const routeFalsifiers = [
    ["inherited invocation", inherited(
      { invocation: routeCandidate.invocation },
      { resources: routeCandidate.resources },
    )],
    ["inherited resources", inherited(
      { resources: routeCandidate.resources },
      { invocation: routeCandidate.invocation },
    )],
    ["inherited invocation kind", {
      invocation: inherited(
        { kind: routeCandidate.invocation.kind },
        { definitionKey: routeCandidate.invocation.definitionKey },
      ),
      resources: routeCandidate.resources,
    }],
    ["inherited definitionKey", {
      invocation: inherited(
        { definitionKey: routeCandidate.invocation.definitionKey },
        { kind: routeCandidate.invocation.kind },
      ),
      resources: routeCandidate.resources,
    }],
    ["inherited operationId", {
      invocation: {
        ...routeCandidate.invocation,
        definitionKey: inherited(
          { operationId: routeCandidate.invocation.definitionKey.operationId },
          { memberKey: routeCandidate.invocation.definitionKey.memberKey },
        ),
      },
      resources: routeCandidate.resources,
    }],
    ["inherited memberKey", {
      invocation: {
        ...routeCandidate.invocation,
        definitionKey: inherited(
          { memberKey: routeCandidate.invocation.definitionKey.memberKey },
          { operationId: routeCandidate.invocation.definitionKey.operationId },
        ),
      },
      resources: routeCandidate.resources,
    }],
    ["inherited eventResource", {
      invocation: routeCandidate.invocation,
      resources: inherited({ eventResource }, {}),
    }],
    ["accessor invocation", accessor(
      { resources: routeCandidate.resources },
      "invocation",
      routeCandidate.invocation,
    )],
    ["accessor eventResource", {
      invocation: routeCandidate.invocation,
      resources: accessor({}, "eventResource", eventResource),
    }],
  ];
  for (const [identity, candidate] of routeFalsifiers) {
    assert.equal(
      publicApi.isInstalledDefinitionCallCandidate(candidate),
      false,
      identity,
    );
  }

  const proxyOutcome = await publicApi.runInstalledDefinitionCallTransport(
    { kind: "new", eventLogPath },
    new Proxy(routeCandidate, {}),
  );
  assert.equal(proxyOutcome.kind, "installed_definition_call_transport_refusal");
  assert.equal(proxyOutcome.code, "invalid_definition_call");

  const inheritedAcquisitionOutcome =
    await publicApi.runInstalledDefinitionCallTransport(
      inherited({ kind: "new" }, { eventLogPath }),
      routeCandidate,
    );
  assert.equal(
    inheritedAcquisitionOutcome.kind,
    "installed_definition_call_transport_refusal",
  );
  assert.equal(inheritedAcquisitionOutcome.code, "acquisition_mismatch");

  const proxyAcquisitionOutcome =
    await publicApi.runInstalledDefinitionCallTransport(
      new Proxy({ kind: "new", eventLogPath }, {}),
      routeCandidate,
    );
  assert.equal(
    proxyAcquisitionOutcome.kind,
    "installed_definition_call_transport_refusal",
  );
  assert.equal(proxyAcquisitionOutcome.code, "invalid_definition_call");

  let inheritedExportRead = 0;
  Object.defineProperty(Object.prototype, "INTERACTION_DEFINITION_BINDINGS", {
    configurable: true,
    get: () => {
      inheritedExportRead += 1;
      return { respond: { select: () => undefined } };
    },
  });
  let inheritedExportOutcome;
  try {
    inheritedExportOutcome = await publicApi.runInstalledDefinitionCallTransport(
      { kind: "new", eventLogPath },
      {
        ...routeCandidate,
        invocation: {
          ...routeCandidate.invocation,
          definitionKey: {
            operationId: "abg.operation.interaction.respond",
            memberKey: "select",
          },
        },
      },
    );
  } finally {
    delete Object.prototype.INTERACTION_DEFINITION_BINDINGS;
  } // The exact invocation contract refuses the request-less call before traversal.
  assert.equal(inheritedExportRead, 0);
  assert.equal(inheritedExportOutcome.code, "invalid_definition_call");

  let inheritedMemberRead = 0;
  Object.defineProperty(Object.prototype, "release_evidence", {
    configurable: true,
    get: () => {
      inheritedMemberRead += 1;
      return () => undefined;
    },
  });
  let inheritedMemberOutcome;
  try {
    inheritedMemberOutcome = await publicApi.runInstalledDefinitionCallTransport(
      { kind: "new", eventLogPath },
      routeCandidate,
    );
  } finally {
    delete Object.prototype.release_evidence;
  }
  assert.equal(inheritedMemberRead, 0);
  assert.equal(inheritedMemberOutcome.code, "invalid_definition_call");
});

function rebaseDefinitionContractCatalog(
  coordinates,
  operationId,
  memberKey,
  contractCatalog,
) {
  return Object.freeze({
    ...coordinates,
    operations: Object.freeze(coordinates.operations.map((operation) =>
      operation.operationId !== operationId
        ? operation
        : Object.freeze({
            ...operation,
            members: Object.freeze(operation.members.map((member) =>
              member.memberKey !== memberKey
                ? member
                : Object.freeze({
                    ...member,
                    slots: Object.freeze(Object.fromEntries(
                      Object.entries(member.slots).map(([slot, coordinate]) => [
                        slot,
                        coordinate === null
                          ? null
                          : Object.freeze({
                              ...coordinate,
                              contractCatalog,
                            }),
                      ]),
                    )),
                  })
            )),
          })
    )),
  });
}

function forgeDependencyGraph(product, installs) {
  return Object.freeze(installs.map((install) => {
    const rowIndex = install.capabilityDefinitionGraph.rows.findIndex(
      (row) => row.capabilityId === product.DIRECT_INVOKE_CAPABILITY,
    );
    if (rowIndex < 0) return install;
    const originalRow = install.capabilityDefinitionGraph.rows[rowIndex];
    const originalDependency = originalRow.dependentCapabilities[0];
    const crossedDependency = originalDependency === undefined
      ? Object.freeze({
          capabilityId: "abg.capability.forged-dependency@5",
          capabilityDefinitionRef:
            "capability-definition://abiogenesis/forged-dependency",
          capabilityDefinitionDigest: product.sha256Canonical({
            dependency: "forged",
          }),
        })
      : Object.freeze({
          ...originalDependency,
          capabilityDefinitionDigest: product.sha256Canonical({
            dependency: originalDependency.capabilityId,
            crossed: true,
          }),
        });
    const rowBody = Object.freeze({
      capabilityId: originalRow.capabilityId,
      capabilityVersion: originalRow.capabilityVersion,
      owningPublicContracts: originalRow.owningPublicContracts,
      dependentCapabilities: Object.freeze([
        crossedDependency,
        ...originalRow.dependentCapabilities.slice(1),
      ]),
      effectRefs: originalRow.effectRefs,
      boundedProofRefs: originalRow.boundedProofRefs,
    });
    const capabilityDefinitionDigest = product.sha256Canonical(rowBody);
    const crossedRow = Object.freeze({
      ...rowBody,
      capabilityDefinitionRef:
        `capability-definition://abiogenesis/${capabilityDefinitionDigest.slice("sha256:".length)}`,
      capabilityDefinitionDigest,
    });
    const rows = Object.freeze(install.capabilityDefinitionGraph.rows.map(
      (row, index) => index === rowIndex ? crossedRow : row,
    ));
    const graphBody = Object.freeze({
      kind: install.capabilityDefinitionGraph.kind,
      schemaVersion: install.capabilityDefinitionGraph.schemaVersion,
      graphId: install.capabilityDefinitionGraph.graphId,
      graphVersion: install.capabilityDefinitionGraph.graphVersion,
      rows,
    });
    return Object.freeze({
      ...install,
      capabilityDefinitionGraph: Object.freeze({
        ...graphBody,
        graphDigest: product.sha256Canonical(graphBody),
      }),
    });
  }));
}

/** The ST-1 start through the shipped SDK constructor: the Product run owner
 * populates the request and authority slots; this test supplies scenario data. */
async function constructInstalledStartCall({
  environment,
  publicApi,
  eventResource,
  input,
  identity = "st-1",
}) {
  const {
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,
    additionalProducts: [languageFixture],
  } = environment;
  const constructed = await publicApi.constructInstalledStartCall({
    selection: Object.freeze({
      memberKey: "start",
      target: Object.freeze({ kind: "next" }),
      rootMode: "direct",
      fhMode: "direct",
    }),
    programRef: languageFixture.ids.programRef,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    admittedInstalls,
    workspaceBinding,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    actorRef: workspaceBinding.authorizedActorRef,
    input: Object.freeze({ value: input }),
    inputValueRef: `value://abi5-tests/${identity}/hello-input`,
    source: Object.freeze({ kind: "none" }),
    eventResource,
    envelope: Object.freeze({
      definitionContractCoordinates:
        environment.verified.definitionContractCoordinates,
      requestRef: `public-request://abi5-tests/${identity}/run-start`,
      correlationRef: `correlation://abi5-tests/${identity}/run-start`,
      eventTime: identity === "st-1"
        ? "2026-08-21T00:00:00.000Z"
        : "2026-08-22T01:00:00.000Z",
      provenanceRefs: [`provenance://abi5-tests/${identity}-worker`],
    }),
  });
  if (constructed.kind !== "installed_start_call") {
    assert.fail(JSON.stringify(constructed));
  }
  const { population } = constructed;
  return {
    call: constructed.call,
    resolution: population.resolution,
    capabilityBasis: Object.freeze({
      actorRef: workspaceBinding.authorizedActorRef,
      capabilityGrants: population.grants,
      policy: population.policy,
      productInstalls: admittedInstalls,
      program: population.resolution.program,
      programValidation: population.resolution.programValidation,
      workspaceBinding,
    }),
  };
}

function reopenedReadResource(product, closeHandoff) {
  return Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion,
    closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff),
  });
}

/** One run read through the shipped SDK constructor. A falsifier patches the
 * canonical population explicitly and re-envelopes it; a substituted event
 * resource replaces only the resource the population was constructed at. */
function constructInstalledRunReadCall({
  environment,
  publicApi,
  memberKey,
  selector,
  source,
  eventResource,
  identity,
  contractCatalogOverride = null,
  definitionContractCoordinatesOverride = null,
  mutateRequest = null,
  mutateSlots = null,
  eventResourceOverride = null,
}) {
  const { product, workspaceBinding } = environment;
  const envelope = Object.freeze({
    definitionContractCoordinates:
      environment.verified.definitionContractCoordinates,
    requestRef: `public-request://abi5-tests/st-2b/${identity}`,
    correlationRef: `correlation://abi5-tests/st-2b/${identity}`,
    eventTime: "2026-08-22T00:00:00.000Z",
    provenanceRefs: ["provenance://abi5-tests/st-2b-worker"],
  });
  const constructed = publicApi.constructInstalledRunReadCall({
    memberKey,
    workspaceBinding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    sourceRef: source.ref,
    selector,
    eventResource,
    envelope,
  });
  if (constructed.kind !== "installed_run_read_call") {
    assert.fail(`${memberKey} ${JSON.stringify(constructed)}`);
  }
  const { population } = constructed;
  assert.deepEqual(
    [population.source.ref, population.source.digest],
    [source.ref, source.digest],
    `${memberKey} populated source`,
  );
  const patched = mutateRequest !== null || mutateSlots !== null ||
    contractCatalogOverride !== null ||
    definitionContractCoordinatesOverride !== null ||
    eventResourceOverride !== null;
  return Object.freeze({
    packet: population.packet,
    grants: population.grants,
    call: !patched ? constructed.call : constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        definitionContractCoordinatesOverride ??
          envelope.definitionContractCoordinates,
      contractCatalog: contractCatalogOverride ??
        constructed.call.invocation.contractCatalog,
      operationId: population.packet.definitionKey.operationId,
      memberKey,
      request: (mutateRequest ?? ((request) => request))(population.request),
      slots: (mutateSlots ?? ((slots) => slots))(
        population.slots,
        population.grants,
      ),
      resources: eventResourceOverride === null
        ? constructed.call.resources
        : Object.freeze({
            ...constructed.call.resources,
            eventResource: eventResourceOverride,
          }),
      requestRef: envelope.requestRef,
      correlationRef: envelope.correlationRef,
      eventTime: envelope.eventTime,
      provenanceRefs: envelope.provenanceRefs,
    }),
  });
}

test("ST-1 executes an independently authored minimal GTL test through installed Public owners", async (context) => {
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    workspaceProductIndex: 1,
    prepareAdditionalProducts: async (basis) => [
      await prepareLanguageSmokeFixture(basis),
    ],
  });
  const {
    product,
    abg,
    gtl,
    verifiedProducts,
    installCandidates,
    admittedInstalls,
    catalogInstalledProducts,
    lock,
    productSet,
    bindingCandidate,
    workspaceBinding,
    publications,
    catalog,
    catalogView,
    scratch,
    additionalProducts: [languageFixture],
    additionalPublications: [fixturePublication],
  } = environment;
  const projectReadContracts = await import(
    `${pathToFileURL(join(
      environment.installedRoot,
      "build/code/src/abg/project_read_operation_contracts.js",
    )).href}?st2ac=${Date.now()}`
  );
  const projectReadPorts = await import(
    `${pathToFileURL(join(
      environment.installedRoot,
      "build/code/src/abg/project_read_ports.js",
    )).href}?st2bp=${Date.now()}`
  );
  const runStatusPacket = projectReadContracts.ABG_PROJECT_READ_CONTRACTS
    .run_status;
  const [runStatusCapabilityRef] = runStatusPacket.metadata.capabilityRefs;
  assert.equal(
    runStatusCapabilityRef,
    "abg.capability.runtime.replay-continuation@5",
  );
  const runStatusGrantBasis = Object.freeze({
    admittedInstalls,
    workspaceBinding,
    fixedPacket: runStatusPacket,
  });
  const runStatusGrant = product.constructCapabilityGrant(
    environment.workspaceAuthority,
    workspaceBinding.authorizedActorRef,
    runStatusPacket.definitionKey.operationId,
    runStatusCapabilityRef,
    runStatusGrantBasis,
  );
  assert.equal(
    runStatusGrant.policyRef,
    environment.workspaceAuthority.authorityBasisId,
  );
  assert.equal(
    runStatusGrant.policyDigest,
    environment.workspaceAuthority.authorityBasisDigest,
  );
  assert.equal(
    product.validateCapabilityGrantForProductBasis(
      runStatusGrant,
      environment.workspaceAuthority,
      workspaceBinding.authorizedActorRef,
      runStatusCapabilityRef,
      runStatusGrantBasis,
    ),
    true,
  );
  const mismatchedRunStatusGrant = rehashGrant(product, runStatusGrant, {
    policyDigest: product.sha256Canonical({
      authorityBasisDigest:
        environment.workspaceAuthority.authorityBasisDigest,
      mismatch: "workspace-authority-policy",
    }),
  });
  assert.equal(
    product.validateCapabilityGrantForProductBasis(
      mismatchedRunStatusGrant,
      environment.workspaceAuthority,
      workspaceBinding.authorizedActorRef,
      runStatusCapabilityRef,
      runStatusGrantBasis,
    ),
    false,
  );
  assert.equal(verifiedProducts.length, 2);
  assert.equal(installCandidates.length, 2);
  assert.equal(admittedInstalls.length, 2);
  assert.equal(catalogInstalledProducts.length, 2);
  assert.notEqual(installCandidates[0].installedRoot, installCandidates[1].installedRoot);
  assert.equal(lock.rows.length, 2);
  assert.equal(
    installCandidates.every((install) =>
      install.resolvedLockId === lock.lockId &&
      install.resolvedLockDigest === lock.lockDigest),
    true,
  );
  assert.equal(productSet.orderedInstallRefs.length, 2);
  assert.equal(bindingCandidate.productSetId, productSet.productSetId);
  assert.equal(workspaceBinding.bindingId, bindingCandidate.bindingId);
  assert.equal(
    admittedInstalls.every((install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install)),
    true,
  );
  for (const [index, admitted] of admittedInstalls.entries()) {
    const {
      kind: _kind,
      disposition: _disposition,
      admissionEventRef: _admissionEventRef,
      ...body
    } = admitted;
    assert.equal(admitted.kind, "product_install");
    assert.equal(catalogInstalledProducts[index].kind, "product_install_candidate");
    assert.equal(
      product.canonicalJson({
        kind: "product_install_candidate",
        disposition: "materialized",
        ...body,
      }),
      product.canonicalJson(catalogInstalledProducts[index]),
      "Catalog accepts the candidate carrier exactly reconstructed from ABG owner truth",
    );
  }
  assert.equal(
    abg.hasAdmittedWorkspaceBinding(environment.artifactTruth, workspaceBinding),
    true,
  );

  const { stdout: archiveStdout } = await execFileAsync(
    "tar",
    ["-tzf", languageFixture.artifactPath],
  );
  const archiveFiles = archiveStdout.trim().split("\n")
    .filter((path) => !path.endsWith("/")).sort();
  assert.deepEqual(archiveFiles, [
    "package/build/leaf.mjs",
    "package/build/program.mjs",
    "package/contracts/capabilities/capability-definition-graph.json",
    "package/contracts/public-contract-catalog.schema.json",
    "package/package.json",
    "package/product-toolchain-manifest.json",
  ]);
  assert.equal(
    archiveFiles.some((path) => /\.(?:c|m)?js$|\.d\.(?:c|m)?ts$/u.test(path)),
    true,
  );
  assert.deepEqual(
    {
      contracts: fixturePublication.contracts.length,
      evaluators: fixturePublication.evaluators.length,
      implementationBindings: fixturePublication.implementationBindings.length,
      closureContracts: fixturePublication.closureContracts.length,
      programs: fixturePublication.programs.length,
      graphFunctions: fixturePublication.graphFunctions.length,
    },
    {
      contracts: 9,
      evaluators: 0,
      implementationBindings: 1,
      closureContracts: 2,
      programs: 2,
      graphFunctions: 1,
    },
  );
  assert.equal(publications.length, 2);
  assert.equal(catalog.kind, "graph_function_catalog");
  assert.equal(catalog.readinessBasis.verifiedProducts.length, 2);
  assert.equal(catalog.readinessBasis.installedProducts.length, 2);
  assert.equal(
    catalog.rowDispositions.find(
      (row) => row.handle === languageFixture.ids.graphFunctionRef,
    )?.disposition,
    "admitted",
  );
  assert.deepEqual(catalogView.allowlist, [languageFixture.ids.graphFunctionRef]);
  assert.equal(catalogView.entries.length, 1);

  const publicApi = await import(
    `${pathToFileURL(join(
      environment.installedRoot,
      "build/code/src/public/index.js",
    )).href}?st1=${Date.now()}`
  );
  assert.equal(typeof product.RUN_DEFINITION_BINDINGS.invoke.start, "function");
  assert.equal(typeof product.ProductExecutionResolutionPort.resolve, "function");
  const setupHandoff = environment.store.projectReopenAuthorityAndClose();
  const eventResource = Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion,
    closeHandoff: setupHandoff,
    handoffDigest: product.sha256Canonical(setupHandoff),
  });
  const input = gtl.constructLanguageTestInput("World");
  const { call, resolution, capabilityBasis } = await constructInstalledStartCall({
    environment,
    publicApi,
    eventResource,
    input,
  });
  assert.throws(
    () => product.constructCapabilityGrant(
      capabilityBasis.policy,
      workspaceBinding.authorizedActorRef,
      runStatusPacket.definitionKey.operationId,
      runStatusCapabilityRef,
      runStatusGrantBasis,
    ),
    /exact workspace, policy, actor, and definition authority/u,
    "project.read must not accept an invocation policy basis",
  );
  assert.equal(resolution.resolution.programOwner.productId, languageFixture.basis.productId);
  assert.equal(
    resolution.resolution.graphFunctionOwner.productId,
    languageFixture.basis.productId,
  );
  assert.equal(
    resolution.declarationClosure.semanticsOwner.productId,
    languageFixture.basis.productId,
  );
  assert.equal(
    resolution.implementationSetCandidate.rows[0].implementationOwnerProductId,
    languageFixture.basis.productId,
  );
  assert.equal(
    resolution.implementationSetCandidate.rows[0].graphFunctionOwnerProductId,
    languageFixture.basis.productId,
  );
  assert.equal(
    resolution.implementationSetCandidate.rows[0].computeRegime,
    "F_D",
  );

  const [grant] = capabilityBasis.capabilityGrants;
  const forgedDigest = product.sha256Canonical({ forged: true });
  const crossedProductInstalls = capabilityBasis.productInstalls.filter(
    (install) => !install.capabilityDefinitionGraph.rows.some(
      (row) => row.capabilityId === product.DIRECT_INVOKE_CAPABILITY,
    ),
  );
  const matrix = [
    ["self-rehashed intrinsic definition", {
      capabilityGrants: [rehashGrant(product, grant, {
        definitionRef: "public-function://forged/run/start@5",
        definitionDigest: forgedDigest,
      })],
    }],
    ["graph/row", {
      capabilityGrants: [rehashGrant(product, grant, {
        capabilityDefinition: Object.freeze({
          ...grant.capabilityDefinition,
          capabilityDefinitionDigest: forgedDigest,
        }),
      })],
    }],
    ["contract/catalog", {
      capabilityGrants: [rehashGrant(product, grant, {
        operationContract: Object.freeze({
          ...grant.operationContract,
          contractCatalog: Object.freeze({
            ...grant.operationContract.contractCatalog,
            catalogDigest: forgedDigest,
          }),
        }),
      })],
    }],
    ["dependency", {
      productInstalls: forgeDependencyGraph(
        product,
        capabilityBasis.productInstalls,
      ),
    }],
    ["actor", {
      capabilityGrants: [rehashGrant(product, grant, {
        actorRef: "actor://forged",
      })],
    }],
    ["policy", {
      capabilityGrants: [rehashGrant(product, grant, {
        policyDigest: forgedDigest,
      })],
    }],
    ["scope", {
      capabilityGrants: [rehashGrant(product, grant, {
        scopeDigest: forgedDigest,
      })],
    }],
    ["basis", {
      capabilityGrants: [rehashGrant(product, grant, {
        authorityBasisDigest: forgedDigest,
      })],
    }],
    ["crossed environment", {
      productInstalls: crossedProductInstalls,
    }],
  ];
  const eventCountBeforeForgeryMatrix = abg.readRuntimeEventsAtDurablePrefix(
    eventResource.closeHandoff.prefix,
  ).length;
  for (const [label, mutation] of matrix) {
    const refusal = abg.validateInvocationCapabilityBasis({
      ...capabilityBasis,
      memberKey: "start",
      catalogApplications: [],
      ...mutation,
    });
    assert.equal(refusal?.kind, "invocation_admission_refusal", label);
    assert.equal(
      abg.readRuntimeEventsAtDurablePrefix(eventResource.closeHandoff.prefix)
        .length,
      eventCountBeforeForgeryMatrix,
      `${label} must emit zero events`,
    );
  }

  const outcome = await Effect.runPromise(
    product.RUN_DEFINITION_BINDINGS.invoke.start(call),
  );
  assert.equal(outcome.ownerOutput.outcomeKind, "result");
  assert.equal(outcome.ownerOutput.value.disposition, "completed");
  assert.equal(
    outcome.resources.productExecutionResolution.ref,
    resolution.resolution.resolutionRef,
  );
  const events = abg.readRuntimeEventsAtDurablePrefix(
    outcome.resources.eventResource.closeHandoff.prefix,
  );
  const invocationAdmission = events.find(
    (event) => event.kind === "invocation_admitted",
  );
  const implementationAdmission = events.find(
    (event) => event.kind === "implementation_admitted",
  );
  const admittedResult = events.find(
    (event) => event.kind === "c_call_result_admitted",
  );
  assert.equal(invocationAdmission.payload.programRef, languageFixture.ids.programRef);
  assert.equal(
    invocationAdmission.payload.graphFunctionRef,
    languageFixture.ids.graphFunctionRef,
  );
  assert.equal(implementationAdmission.payload.implementationSet.rows.length, 1);
  assert.equal(
    implementationAdmission.payload.implementationSet.rows[0]
      .implementationOwnerProductId,
    languageFixture.basis.productId,
  );
  assert.deepEqual(admittedResult.payload.value, {
    kind: "hello_world_output",
    schemaVersion,
    message: "Hello World",
  });
  assert.equal(
    admittedResult.payload.contractRef,
    gtl.LANGUAGE_TEST_IDS.outputContractRef,
  );
  assert.equal(events.some((event) => event.kind === "frame_opened"), true);
  assert.equal(events.some((event) => event.kind === "run_closed"), true);
  assert.equal(
    await readFile(
      join(installCandidates[1].installedRoot, "build/program.mjs"),
      "utf8",
    ).then((bytes) => bytes.length > 0),
    true,
  );

  const runTerminalHandoff = outcome.resources.eventResource.closeHandoff;
  const runTerminalPrefix = runTerminalHandoff.prefix;
  const terminalRun = outcome.resources.run;
  const terminalReplay = outcome.resources.replay;
  assert.ok(terminalRun);
  assert.ok(terminalReplay);
  const siblingManifest = {
    workspaceId: "workspace://t287/st2b/sibling",
    canonicalRoot: join(scratch, "workspace-st2b-sibling"),
    authorityMode: "trusted_developer",
    authorizedActorRef: "actor://t287/st2b/sibling",
  };
  const siblingAuthority = product.constructWorkspaceAuthorityBasis({
    ...siblingManifest,
    authorityManifestRef: "manifest://t287/st2b/sibling",
    authorityManifestDigest: product.sha256Canonical(siblingManifest),
  });
  const siblingBindingCandidate = product.constructWorkspaceBinding(
    siblingAuthority,
    productSet,
    lock,
    Object.fromEntries(Object.entries(bindingCandidate.roots).map(
      ([key, root]) => [key, join(root, "st2b-sibling")],
    )),
  );
  const siblingStore = abg.reopenEventStore(
    runTerminalHandoff.reopenAuthority,
  );
  assert.equal(siblingStore.kind, "reopened_event_store_context");
  assert.deepEqual(siblingStore.prefix, runTerminalPrefix);
  const siblingAdmission = abg.admitWorkspaceBinding(
    siblingStore.store,
    siblingBindingCandidate,
    {
      ...publicOperationBasis(
        product,
        "abg.operation.workspace.bind",
        siblingBindingCandidate.bindingId,
        siblingBindingCandidate.bindingDigest,
        "invocation://t287/st2b/sibling-bind",
        admittedInstalls.map((install) => install.admissionEventRef),
      ),
      predecessorPrefix: runTerminalPrefix,
    },
    siblingAuthority,
  );
  assert.equal(siblingAdmission.kind, "artifact_owner_result");
  const siblingHandoff = siblingStore.store.projectReopenAuthorityAndClose();
  const terminalPrefix = siblingAdmission.successorPrefix;
  assert.deepEqual(siblingHandoff.prefix, terminalPrefix);
  const siblingEnvironmentProjection =
    abg.projectExactPrefixWorkspaceEnvironment(
      terminalPrefix,
      Object.freeze({
        ref: siblingAdmission.value.bindingId,
        digest: siblingAdmission.value.bindingDigest,
      }),
    );
  assert.equal(
    siblingEnvironmentProjection.kind,
    "exact_prefix_workspace_environment",
  );
  const siblingReadEnvironment = Object.freeze({
    ...environment,
    admittedInstalls: siblingEnvironmentProjection.productInstalls,
    workspaceAuthority:
      siblingEnvironmentProjection.workspaceAuthorityBasis,
    workspaceBinding: siblingEnvironmentProjection.workspaceBinding,
  });
  const terminalLogBytes = await readFile(new URL(terminalPrefix.eventLogRef));
  const runReadRows = [
    ["run_status", Object.freeze({ kind: "none" })],
    ["run_result", Object.freeze({ kind: "none" })],
    ["run_replay", Object.freeze({
      kind: "ordinal_page",
      fromOrdinal: 0,
      limit: 1024,
    })],
  ];
  const readProjections = new Map();
  const readOwnerOutputs = new Map();
  const freshProcessReadCalls = [];
  let readHandoff = siblingHandoff;
  for (const [memberKey, selector] of runReadRows) {
    const eventResource = reopenedReadResource(product, readHandoff);
    const { packet, call: readCall } = constructInstalledRunReadCall({
      environment,
      publicApi,
      memberKey,
      selector,
      source: terminalRun,
      eventResource,
      identity: memberKey,
    });
    freshProcessReadCalls.push(readCall);
    const callable = abg.ABG_PROJECT_READ_DEFINITION_BINDINGS[memberKey];
    assert.equal(typeof callable, "function", `${memberKey} installed export`);
    assert.equal(Object.isFrozen(callable), true, `${memberKey} static binding`);
    assert.deepEqual(packet.definitionKey, {
      operationId: "abg.operation.project.read",
      memberKey,
    });
    assert.equal(packet.owner.abstractModule, "ABG.RunProjection");
    assert.deepEqual(packet.owner.memberPath, [memberKey]);
    const read = await Effect.runPromise(callable(readCall));
    assert.equal(read.ownerOutput.outcomeKind, "result", memberKey);
    assert.equal(read.ownerOutput.value.caseKey, memberKey);
    assert.deepEqual(read.ownerOutput.value.source, terminalRun);
    assert.deepEqual(read.ownerOutput.value.projectionBasis, {
      ref: terminalPrefix.eventLogRef,
      digest: terminalPrefix.coordinateDigest,
    });
    assert.equal(
      product.canonicalJson(read.resources.eventResource.entryPrefix),
      product.canonicalJson(terminalPrefix),
      `${memberKey} must reopen the exact ST-1 prefix`,
    );
    assert.equal(
      product.canonicalJson(read.resources.eventResource.closeHandoff.prefix),
      product.canonicalJson(terminalPrefix),
      `${memberKey} must close the unchanged ST-1 prefix`,
    );
    assert.equal(
      Buffer.compare(
        await readFile(new URL(terminalPrefix.eventLogRef)),
        terminalLogBytes,
      ),
      0,
      `${memberKey} must append zero bytes`,
    );
    readProjections.set(memberKey, read.ownerOutput.value.projection);
    readOwnerOutputs.set(memberKey, read.ownerOutput);
    readHandoff = read.resources.eventResource.closeHandoff;
  }

  const replayedTruth = abg.projectRunTruthAtDurablePrefix(
    terminalPrefix,
    terminalRun.ref,
  );
  assert.equal(replayedTruth.kind, "abg_run_truth_projection");
  assert.equal(replayedTruth.runtimeStatus, "closed");
  assert.deepEqual(replayedTruth.run, terminalRun);
  assert.deepEqual(replayedTruth.workspaceBinding, {
    ref: workspaceBinding.bindingId,
    digest: workspaceBinding.bindingDigest,
  });
  assert.deepEqual(replayedTruth.result, outcome.ownerOutput.value.result);
  // T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md:200-202: a Run projection
  // at its original prefix reproduces its replay shape and digest exactly. The
  // replay body carries prefix-wide members, so at the later prefix (the sibling
  // bind appended) the terminal semantics are equal and those members excluded.
  const ownPrefixTruth = abg.projectRunTruthAtDurablePrefix(
    runTerminalPrefix,
    terminalRun.ref,
  );
  assert.deepEqual(ownPrefixTruth.replay, terminalReplay);
  const runReplayAt = (prefix) => {
    const events = abg.readRuntimeEventsAtDurablePrefix(prefix);
    return abg.replayValidatedRuntimeEventPrefix(
      abg.selectValidatedRuntimeEventPrefix(events, { runId: terminalRun.ref }),
      abg.selectValidatedRuntimeEventPrefix(events),
    );
  };
  const ownPrefixReplay = runReplayAt(runTerminalPrefix);
  const laterPrefixReplay = runReplayAt(terminalPrefix);
  assert.deepEqual({
    ref: ownPrefixReplay.replayRef,
    digest: ownPrefixReplay.replayDigest,
  }, terminalReplay);
  const laterReplay = {
    ref: laterPrefixReplay.replayRef,
    digest: laterPrefixReplay.replayDigest,
  };
  assert.deepEqual(replayedTruth.replay, laterReplay);
  // Excluded: the replay coordinate, whose digest covers the whole body, and the
  // prefix-wide members.
  const prefixWideReplayMembers = [
    "replayRef",
    "replayDigest",
    "eventStoreDigest",
    "eventCount",
    "lastAdmissionOrdinal",
    "nativeLiveness",
  ];
  const terminalSemantics = (state) =>
    Object.fromEntries(
      Object.entries(state).filter(([key]) =>
        !prefixWideReplayMembers.includes(key)
      ),
    );
  assert.deepEqual(
    terminalSemantics(laterPrefixReplay),
    terminalSemantics(ownPrefixReplay),
  );
  // The Run truth's prefix coordinates (`prefixCoordinateDigest`, `replay`,
  // `terminalResult.projectionBasis`) are the same exclusion.
  const {
    prefixCoordinateDigest: _ownCut,
    replay: _ownReplay,
    terminalResult: { projectionBasis: _ownBasis, ...ownTerminalResult },
    ...ownTruth
  } = ownPrefixTruth;
  const {
    prefixCoordinateDigest: _laterCut,
    replay: _laterReplay,
    terminalResult: { projectionBasis: _laterBasis, ...laterTerminalResult },
    ...laterTruth
  } = replayedTruth;
  assert.deepEqual(
    { ...laterTruth, terminalResult: laterTerminalResult },
    { ...ownTruth, terminalResult: ownTerminalResult },
  );
  const ownerStatus = projectReadPorts.RunProjectionPort.run_status({
    kind: "abg_project_read_packet",
    schemaVersion,
    memberKey: "run_status",
    prefix: terminalPrefix,
    targetRef: terminalRun.ref,
  });
  assert.equal(ownerStatus.disposition, "projected");
  const expectedActiveFluents = ownerStatus.value.holdsAt.map((fluent) => ({
    ref: fluent.fluentRef,
    digest: product.sha256Canonical(fluent),
  }));
  assert.ok(expectedActiveFluents.length > 0);
  assert.equal(readProjections.get("run_status").status, "closed");
  assert.deepEqual(readProjections.get("run_status").subject, terminalRun);
  assert.deepEqual(readProjections.get("run_status").replay, laterReplay);
  assert.deepEqual(
    readProjections.get("run_status").activeFluents,
    expectedActiveFluents,
  );
  assert.equal(
    readProjections.get("run_status").activeFluents.some((fluent) =>
      fluent.ref.startsWith("runtime-fluent://")
    ),
    false,
  );
  assert.deepEqual(
    readProjections.get("run_result").result,
    outcome.ownerOutput.value.result,
  );
  assert.deepEqual(readProjections.get("run_result").subject, terminalRun);
  assert.deepEqual(readProjections.get("run_result").replay, laterReplay);
  assert.deepEqual(readProjections.get("run_replay").subject, terminalRun);
  assert.deepEqual(readProjections.get("run_replay").replay, laterReplay);
  assert.equal(readProjections.get("run_replay").fromOrdinal, 0);
  assert.equal(readProjections.get("run_replay").limit, 1024);
  assert.deepEqual(replayedTruth.result, {
    ref: admittedResult.payload.resultRef,
    digest: admittedResult.payload.resultDigest,
  });
  assert.equal(admittedResult.payload.contractRef, gtl.LANGUAGE_TEST_IDS.outputContractRef);
  assert.deepEqual(admittedResult.payload.value, {
    kind: "hello_world_output",
    schemaVersion,
    message: "Hello World",
  });

  const freshProcessResult = await runFreshProcessRead({
    scratch,
    installedRoot: environment.installedRoot,
    identity: "owner-equality",
    readCalls: freshProcessReadCalls,
    expectation: "owner_outputs",
  });
  assert.equal(freshProcessResult.kind, "st3_fresh_process_read_result");
  assert.notEqual(freshProcessResult.processId, process.pid);
  assert.deepEqual(
    freshProcessResult.outputs.map((output) => output.memberKey),
    runReadRows.map(([memberKey]) => memberKey),
  );
  assert.deepEqual(freshProcessResult.moduleRefs, {
    abg: pathToFileURL(join(
      environment.installedRoot,
      "build/code/src/abg/index.js",
    )).href,
    effect: freshProcessResult.moduleRefs.effect,
  });
  assert.equal(
    freshProcessResult.moduleRefs.effect.startsWith(
      `${pathToFileURL(await realpath(environment.installedRoot)).href}/`,
    ),
    true,
    "fresh child Effect must resolve from the packed installed package",
  );
  assert.equal(
    Object.values(freshProcessResult.moduleRefs).some((moduleRef) =>
      moduleRef.startsWith(pathToFileURL(packageRoot).href)
    ),
    false,
    "fresh child must not load implementation modules from the source tree",
  );
  for (const output of freshProcessResult.outputs) {
    assert.equal(
      product.canonicalJson(output.ownerOutput),
      product.canonicalJson(readOwnerOutputs.get(output.memberKey)),
      `${output.memberKey} fresh-process owner output equality`,
    );
    assert.equal(
      product.canonicalJson(output.resources.eventResource.entryPrefix),
      product.canonicalJson(terminalPrefix),
      `${output.memberKey} fresh-process entry prefix equality`,
    );
    assert.equal(
      product.canonicalJson(
        output.resources.eventResource.closeHandoff.prefix,
      ),
      product.canonicalJson(terminalPrefix),
      `${output.memberKey} fresh-process close prefix equality`,
    );
  }
  assert.equal(
    Buffer.compare(
      await readFile(new URL(terminalPrefix.eventLogRef)),
      terminalLogBytes,
    ),
    0,
    "fresh-process reads must append zero bytes",
  );
  const st3TerminalHandoff = freshProcessResult.outputs.at(-1)
    .resources.eventResource.closeHandoff;
  assert.deepEqual(st3TerminalHandoff.prefix, terminalPrefix);

  const readFalsifierDigest = product.sha256Canonical({
    kind: "st-2b-pre-owner-falsifier",
  });
  const installedReadCatalog =
    environment.verified.definitionContractCoordinates
      ?.operations.find((candidate) =>
        candidate.operationId === runStatusPacket.definitionKey.operationId
      )
      ?.members.find((candidate) => candidate.memberKey === "run_status")
      ?.slots.request.contractCatalog;
  assert.ok(installedReadCatalog);
  const alternateCatalogDigest = product.sha256Canonical({
    kind: "st-2b-alternate-contract-catalog",
    installedCatalogDigest: installedReadCatalog.catalogDigest,
  });
  const alternateContractCatalog = Object.freeze({
    ...installedReadCatalog,
    catalogId: "catalog://abiogenesis/st2b-alternate-public-contracts",
    catalogDigest: alternateCatalogDigest,
  });
  const alternateDefinitionContractCoordinates =
    rebaseDefinitionContractCatalog(
      environment.verified.definitionContractCoordinates,
      runStatusPacket.definitionKey.operationId,
      "run_status",
      alternateContractCatalog,
    );
  const kernelFalsifiers = [
    ["caller-minted-grant", {
      mutateSlots: (slots, grants) => {
        const callerMinted = rehashGrant(product, grants[0], {
          actorRef: "actor://caller-minted",
        });
        return Object.freeze({
          ...slots,
          capability_grants: Object.freeze({
            ...slots.capability_grants,
            grants: Object.freeze([Object.freeze({
              ref: callerMinted.grantRef,
              digest: callerMinted.grantDigest,
            })]),
          }),
        });
      },
      expectedCode: "projection_basis_mismatch",
    }],
    ["self-consistent-reordered-product-set", {
      mutateSlots: (slots) => Object.freeze({
        ...slots,
        product_set: Object.freeze([...slots.product_set].reverse()),
      }),
      expectedCode: "projection_basis_mismatch",
    }],
    ["wrong-prefix", {
      mutateRequest: (request) => Object.freeze({
        ...request,
        projectionBasis: Object.freeze({
          ...request.projectionBasis,
          projectionBasisDigest: readFalsifierDigest,
        }),
      }),
      expectedCode: "projection_basis_mismatch",
    }],
    ["crossed-run-source", {
      mutateRequest: (request) => Object.freeze({
        ...request,
        source: Object.freeze({
          ...request.source,
          sourceDigest: readFalsifierDigest,
        }),
      }),
      expectedCode: "source_digest_mismatch",
    }],
    ["cross-workspace-run", {
      callEnvironment: siblingReadEnvironment,
      expectedCode: "projection_basis_mismatch",
      expectedIssuePaths: [
        "/invocationAuthority/slots/workspace_binding",
      ],
    }],
    ["alternate-installed-contract-catalog", {
      contractCatalogOverride: alternateContractCatalog,
      definitionContractCoordinatesOverride:
        alternateDefinitionContractCoordinates,
      mutateRequest: (request) => Object.freeze({
        ...request,
        source: Object.freeze({
          ...request.source,
          sourceRef: "run://abiogenesis/st2b-catalog-owner-must-not-run",
          sourceDigest: readFalsifierDigest,
        }),
      }),
      expectedCode: "projection_basis_mismatch",
      expectedIssuePaths: ["/contractCatalog"],
    }],
  ];
  for (const [identity, falsifier] of kernelFalsifiers) {
    const {
      callEnvironment = environment,
      expectedCode,
      expectedIssuePaths = null,
      ...callMutation
    } = falsifier;
    const eventResource = reopenedReadResource(product, readHandoff);
    const { call: falsifiedCall } = constructInstalledRunReadCall({
      environment: callEnvironment,
      publicApi,
      memberKey: "run_status",
      selector: Object.freeze({ kind: "none" }),
      source: terminalRun,
      eventResource,
      identity,
      ...callMutation,
    });
    const refused = await Effect.runPromise(
      abg.ABG_PROJECT_READ_DEFINITION_BINDINGS.run_status(falsifiedCall),
    );
    assert.equal(refused.ownerOutput.outcomeKind, "refusal", identity);
    assert.equal(refused.ownerOutput.value.code, expectedCode, identity);
    if (expectedIssuePaths !== null) {
      assert.deepEqual(
        refused.ownerOutput.value.issuePaths,
        expectedIssuePaths,
        identity,
      );
    }
    assert.equal(
      product.canonicalJson(refused.resources.eventResource.entryPrefix),
      product.canonicalJson(terminalPrefix),
      `${identity} must refuse at the exact entry prefix`,
    );
    assert.equal(
      product.canonicalJson(refused.resources.eventResource.closeHandoff.prefix),
      product.canonicalJson(terminalPrefix),
      `${identity} must append zero events`,
    );
    assert.equal(
      Buffer.compare(
        await readFile(new URL(terminalPrefix.eventLogRef)),
        terminalLogBytes,
      ),
      0,
      `${identity} must append zero bytes`,
    );
    readHandoff = refused.resources.eventResource.closeHandoff;
  }

  // The Run is absent at the setup prefix, so canonical population at the
  // current handoff precedes the explicit stale-resource substitution.
  const staleRead = constructInstalledRunReadCall({
    environment,
    publicApi,
    memberKey: "run_status",
    selector: Object.freeze({ kind: "none" }),
    source: terminalRun,
    eventResource: reopenedReadResource(product, readHandoff),
    eventResourceOverride: reopenedReadResource(product, setupHandoff),
    identity: "stale-resource-prefix",
  });
  const staleFault = await Effect.runPromise(Effect.flip(
    abg.ABG_PROJECT_READ_DEFINITION_BINDINGS.run_status(staleRead.call),
  ));
  assert.equal(staleFault.stage, "resource_acquisition");
  assert.equal(staleFault.code, "acquisition_refused");
  assert.equal(
    Buffer.compare(
      await readFile(new URL(terminalPrefix.eventLogRef)),
      terminalLogBytes,
    ),
    0,
    "stale resource refusal must append zero bytes",
  );
  const freshProcessRefusal = await runFreshProcessRead({
    scratch,
    installedRoot: environment.installedRoot,
    identity: "stale-handoff-refusal",
    readCalls: [staleRead.call],
    expectation: "resource_refusal",
  });
  assert.equal(
    freshProcessRefusal.kind,
    "st3_fresh_process_read_refusal",
  );
  assert.notEqual(freshProcessRefusal.processId, process.pid);
  assert.equal(freshProcessRefusal.memberKey, "run_status");
  assert.equal(freshProcessRefusal.fault.stage, "resource_acquisition");
  assert.equal(freshProcessRefusal.fault.code, "acquisition_refused");
  assert.equal(Object.hasOwn(freshProcessRefusal, "outputs"), false);
  assert.equal(
    Buffer.compare(
      await readFile(new URL(terminalPrefix.eventLogRef)),
      terminalLogBytes,
    ),
    0,
    "fresh-process stale-handoff refusal must append zero bytes",
  );
  context.diagnostic(
    "ST-3: 3 exact fresh-process owner equalities, 1 pre-owner stale-handoff refusal, 0 appended bytes",
  );

  const st4Input = gtl.constructLanguageTestInput("World");
  const {
    call: st4StartCall,
    resolution: st4Resolution,
  } = await constructInstalledStartCall({
    environment,
    publicApi,
    eventResource: reopenedReadResource(product, st3TerminalHandoff),
    input: st4Input,
    identity: "st-4",
  });
  assert.notEqual(
    st4StartCall.invocation.invocationRef,
    call.invocation.invocationRef,
    "ST-4 must construct a new start invocation",
  );
  const st4CliCalls = [st4StartCall];
  const st4StartExecution = await runInstalledCliRequest({
    scratch,
    installedRoot: environment.installedRoot,
    identity: "start",
    acquisition: Object.freeze({
      kind: "reopen",
      closeHandoff: st3TerminalHandoff,
    }),
    call: st4StartCall,
  });
  const st4StartOutput = st4StartExecution.output;
  assert.equal(
    st4StartOutput.kind,
    "installed_definition_call_transport_result",
  );
  assert.equal(Object.hasOwn(st4StartOutput, "outcome"), false);
  assert.equal(Object.hasOwn(st4StartOutput, "closeHandoff"), false);
  const st4StartReceipt = st4StartOutput.receipt;
  assert.equal(st4StartReceipt.kind, "definition_host_receipt");
  assert.equal(st4StartReceipt.exitCode, 0);
  assert.equal(st4StartReceipt.failure, null);
  assert.deepEqual(st4StartReceipt.definitionKey, {
    operationId,
    memberKey: "start",
  });
  assert.equal(
    st4StartReceipt.invocationRef,
    st4StartCall.invocation.invocationRef,
  );
  assert.equal(st4StartReceipt.ownerOutput.outcomeKind, "result");
  assert.equal(st4StartReceipt.ownerOutput.value.disposition, "completed");
  const st4Run = st4StartReceipt.resources.run;
  const st4Replay = st4StartReceipt.resources.replay;
  const st4Result = st4StartReceipt.ownerOutput.value.result;
  assert.ok(st4Run);
  assert.ok(st4Replay);
  assert.ok(st4Result);
  assert.deepEqual(st4StartReceipt.ownerOutput.value.run, st4Run);
  assert.deepEqual(st4StartReceipt.ownerOutput.value.replay, st4Replay);
  assert.notEqual(st4Run.ref, terminalRun.ref, "ST-4 run must be fresh");
  const st4TerminalHandoff =
    st4StartReceipt.resources.eventResource.closeHandoff;
  const st4TerminalPrefix = st4TerminalHandoff.prefix;
  assert.deepEqual(
    st4StartReceipt.resources.eventResource.entryPrefix,
    st3TerminalHandoff.prefix,
  );
  const st4TerminalLogBytes = await readFile(
    new URL(st4TerminalPrefix.eventLogRef),
  );

  assert.deepEqual(
    {
      programRef: st4Resolution.resolution.programRef,
      programDigest: st4Resolution.resolution.programDigest,
      graphFunctionRef: st4Resolution.resolution.graphFunctionRef,
      graphFunctionDigest: st4Resolution.resolution.graphFunctionDigest,
      programOwner: st4Resolution.resolution.programOwner,
      graphFunctionOwner: st4Resolution.resolution.graphFunctionOwner,
      inputContract: st4Resolution.resolution.inputContract,
      inputContractDigest: st4Resolution.resolution.inputContractDigest,
      inputContractOwner: st4Resolution.resolution.inputContractOwner,
      outputContract: st4Resolution.resolution.outputContract,
      outputContractDigest: st4Resolution.resolution.outputContractDigest,
      outputContractOwner: st4Resolution.resolution.outputContractOwner,
    },
    {
      programRef: resolution.resolution.programRef,
      programDigest: resolution.resolution.programDigest,
      graphFunctionRef: resolution.resolution.graphFunctionRef,
      graphFunctionDigest: resolution.resolution.graphFunctionDigest,
      programOwner: resolution.resolution.programOwner,
      graphFunctionOwner: resolution.resolution.graphFunctionOwner,
      inputContract: resolution.resolution.inputContract,
      inputContractDigest: resolution.resolution.inputContractDigest,
      inputContractOwner: resolution.resolution.inputContractOwner,
      outputContract: resolution.resolution.outputContract,
      outputContractDigest: resolution.resolution.outputContractDigest,
      outputContractOwner: resolution.resolution.outputContractOwner,
    },
    "ST-3/ST-4 stable Program, GraphFunction, owner, and contract identities",
  );

  const st4ReadProjections = new Map();
  const st4ReadReceipts = new Map();
  let st4ReadHandoff = st4TerminalHandoff;
  for (const [memberKey, selector] of runReadRows) {
    const { call: st4ReadCall } = constructInstalledRunReadCall({
      environment,
      publicApi,
      memberKey,
      selector,
      source: st4Run,
      eventResource: reopenedReadResource(product, st4ReadHandoff),
      identity: `st-4-${memberKey}`,
    });
    st4CliCalls.push(st4ReadCall);
    const execution = await runInstalledCliRequest({
      scratch,
      installedRoot: environment.installedRoot,
      identity: memberKey,
      acquisition: Object.freeze({
        kind: "reopen",
        closeHandoff: st4ReadHandoff,
      }),
      call: st4ReadCall,
    });
    assert.equal(
      execution.output.kind,
      "installed_definition_call_transport_result",
      memberKey,
    );
    const receipt = execution.output.receipt;
    assert.equal(receipt.kind, "definition_host_receipt", memberKey);
    assert.equal(receipt.exitCode, 0, memberKey);
    assert.equal(receipt.failure, null, memberKey);
    assert.equal(receipt.ownerOutput.outcomeKind, "result", memberKey);
    assert.deepEqual(
      receipt.ownerOutput.value.source,
      st4Run,
      `${memberKey} ST-4 subject`,
    );
    assert.deepEqual(
      receipt.resources.eventResource.entryPrefix,
      st4TerminalPrefix,
      `${memberKey} ST-4 entry prefix`,
    );
    assert.deepEqual(
      receipt.resources.eventResource.closeHandoff.prefix,
      st4TerminalPrefix,
      `${memberKey} ST-4 unchanged prefix`,
    );
    assert.equal(
      Buffer.compare(
        await readFile(new URL(st4TerminalPrefix.eventLogRef)),
        st4TerminalLogBytes,
      ),
      0,
      `${memberKey} ST-4 positive read appends zero bytes`,
    );
    st4ReadProjections.set(memberKey, receipt.ownerOutput.value.projection);
    st4ReadReceipts.set(memberKey, receipt);
    st4ReadHandoff = receipt.resources.eventResource.closeHandoff;
  }

  assert.deepEqual(st4ReadProjections.get("run_status").subject, st4Run);
  assert.equal(st4ReadProjections.get("run_status").status, "closed");
  assert.deepEqual(st4ReadProjections.get("run_status").replay, st4Replay);
  assert.deepEqual(st4ReadProjections.get("run_result").subject, st4Run);
  assert.deepEqual(st4ReadProjections.get("run_result").result, st4Result);
  assert.deepEqual(st4ReadProjections.get("run_result").replay, st4Replay);
  assert.deepEqual(st4ReadProjections.get("run_replay").subject, st4Run);
  assert.deepEqual(st4ReadProjections.get("run_replay").replay, st4Replay);

  const flipReadCall = constructInstalledRunReadCall({
    environment,
    publicApi,
    memberKey: "run_status",
    selector: Object.freeze({ kind: "none" }),
    source: st4Run,
    eventResource: reopenedReadResource(product, st4ReadHandoff),
    identity: "st-4-one-snapshot-flip-getter",
  }).call;
  const {
    eventResource: matchingEventResource,
    ...flipResourceFields
  } = flipReadCall.resources;
  const alternateEventResource = reopenedReadResource(product, setupHandoff);
  let eventResourceReads = 0;
  const flipResources = Object.defineProperty(
    flipResourceFields,
    "eventResource",
    {
      configurable: true,
      enumerable: true,
      get: () => {
        eventResourceReads += 1;
        return eventResourceReads <= 2
          ? matchingEventResource
          : alternateEventResource;
      },
    },
  );
  const flipOutcome = await publicApi.runInstalledDefinitionCallTransport(
    Object.freeze({
      kind: "reopen",
      closeHandoff: st4ReadHandoff,
    }),
    {
      invocation: flipReadCall.invocation,
      resources: flipResources,
    },
  );
  assert.equal(eventResourceReads, 1, "caller eventResource is snapshotted once");
  assert.equal(flipOutcome.kind, "installed_definition_call_transport_result");
  assert.equal(flipOutcome.receipt.ownerOutput.outcomeKind, "result");
  assert.deepEqual(
    flipOutcome.receipt.resources.eventResource.entryPrefix,
    st4TerminalPrefix,
    "owner receives the acquisition-matched snapshot eventResource",
  );
  assert.deepEqual(
    flipOutcome.receipt.resources.eventResource.closeHandoff.prefix,
    st4TerminalPrefix,
    "snapshot read preserves the unchanged owner prefix",
  );
  assert.equal(
    Buffer.compare(
      await readFile(new URL(st4TerminalPrefix.eventLogRef)),
      st4TerminalLogBytes,
    ),
    0,
    "one-snapshot flip-getter read appends zero bytes",
  );

  let acquisitionKindReads = 0;
  const flipAcquisition = Object.defineProperty(
    { closeHandoff: st4ReadHandoff },
    "kind",
    {
      configurable: true,
      enumerable: true,
      get: () => {
        acquisitionKindReads += 1;
        return acquisitionKindReads === 1 ? "reopen" : "new";
      },
    },
  );
  const acquisitionFlipOutcome =
    await publicApi.runInstalledDefinitionCallTransport(
      flipAcquisition,
      flipReadCall,
    );
  assert.equal(
    acquisitionKindReads,
    1,
    "caller acquisition kind is snapshotted once",
  );
  assert.equal(
    acquisitionFlipOutcome.kind,
    "installed_definition_call_transport_result",
  );
  assert.equal(
    acquisitionFlipOutcome.receipt.ownerOutput.outcomeKind,
    "result",
  );
  assert.equal(acquisitionFlipOutcome.acquisitionKind, "reopen");
  assert.deepEqual(
    acquisitionFlipOutcome.receipt.resources.eventResource.entryPrefix,
    st4TerminalPrefix,
    "acquisition snapshot preserves the owner entry prefix",
  );
  assert.deepEqual(
    acquisitionFlipOutcome.receipt.resources.eventResource.closeHandoff.prefix,
    st4TerminalPrefix,
    "acquisition snapshot preserves the unchanged owner prefix",
  );
  assert.equal(
    Buffer.compare(
      await readFile(new URL(st4TerminalPrefix.eventLogRef)),
      st4TerminalLogBytes,
    ),
    0,
    "acquisition flip-getter read appends zero bytes",
  );

  const st4SemanticReplay = abg.projectRuntimeTruthAtDurablePrefix(
    st4TerminalPrefix,
    st4Run.ref,
  ).replayState;
  assert.equal(st4SemanticReplay.replayRef, st4Replay.ref);
  assert.equal(st4SemanticReplay.replayDigest, st4Replay.digest);
  const [st4TerminalRoute] = st4SemanticReplay.routes.filter(
    (route) => route.routeKind === "terminal",
  );
  assert.ok(st4TerminalRoute);
  const st4TypedResults = st4SemanticReplay.cCalls.filter((row) =>
    row.cCallRef === st4TerminalRoute.cCallRef &&
    row.resultRef === st4Result.ref &&
    row.resultDigest === st4Result.digest &&
    row.resultValue !== null
  );
  assert.equal(st4TypedResults.length, 1);
  assert.equal(
    st4TypedResults[0].resultContractRef,
    st4Resolution.resolution.outputContract.contractRef,
  );
  assert.deepEqual(st4TypedResults[0].resultValue, {
    kind: "hello_world_output",
    schemaVersion,
    message: "Hello World",
  });
  assert.deepEqual(
    {
      contractRef: st4TypedResults[0].resultContractRef,
      valueKind: st4TypedResults[0].resultValueKind,
      value: st4TypedResults[0].resultValue,
    },
    {
      contractRef: admittedResult.payload.contractRef,
      valueKind: admittedResult.payload.valueKind,
      value: admittedResult.payload.value,
    },
    "ST-3/ST-4 typed result meaning",
  );

  const crossedRead = constructInstalledRunReadCall({
    environment,
    publicApi,
    memberKey: "run_status",
    selector: Object.freeze({ kind: "none" }),
    source: st4Run,
    eventResource: reopenedReadResource(product, st4ReadHandoff),
    identity: "st-4-crossed-top-level-handoff",
  }).call;
  st4CliCalls.push(crossedRead);
  const crossedExecution = await runInstalledCliRequest({
    scratch,
    installedRoot: environment.installedRoot,
    identity: "crossed-top-level-handoff",
    acquisition: Object.freeze({ kind: "reopen", closeHandoff: setupHandoff }),
    call: crossedRead,
    expectedExitCode: 2,
  });
  assert.equal(
    crossedExecution.output.kind,
    "installed_definition_call_transport_refusal",
  );
  assert.equal(crossedExecution.output.code, "acquisition_mismatch");
  assert.equal(Object.hasOwn(crossedExecution.output, "receipt"), false);
  assert.equal(Object.hasOwn(crossedExecution.output, "ownerOutput"), false);
  assert.equal(
    Buffer.compare(
      await readFile(new URL(st4TerminalPrefix.eventLogRef)),
      st4TerminalLogBytes,
    ),
    0,
    "crossed top-level handoff must append zero bytes",
  );

  assert.equal(
    st4CliCalls.filter((candidate) =>
      candidate.invocation.definitionKey.operationId === operationId &&
      candidate.invocation.definitionKey.memberKey === "start"
    ).length,
    1,
    "ST-4 CLI episode has exactly one start",
  );
  assert.equal(
    st4ReadReceipts.size,
    3,
    "ST-4 uses one shared loop for status/result/replay",
  );
  assert.equal(
    st4StartExecution.cliPath.startsWith(`${environment.installedRoot}/`),
    true,
    "CLI must execute from the independently installed package",
  );
  assert.equal(
    st4StartExecution.cliPath.startsWith(packageRoot),
    false,
    "CLI must not execute from the source package",
  );
  for (const candidate of st4CliCalls) {
    assert.equal(Object.hasOwn(candidate.invocation, "packageExportPath"), false);
    assert.equal(Object.hasOwn(candidate.invocation, "namedExport"), false);
    assert.equal(Object.hasOwn(candidate.invocation, "memberPath"), false);
  }
  context.diagnostic(
    "ST-4: 1 fresh CLI start, 3 chained CLI reads, 1 one-snapshot flip-getter read, 1 pre-owner crossed-handoff refusal, DefinitionHostReceipt path, 0 read bytes",
  );

  // Shipped SDK constructors populate a direct GraphFunction invoke and every
  // run read from their owners; this composition supplies scenario data only.
  const sdkEnvelope = (identity) => Object.freeze({
    definitionContractCoordinates:
      environment.verified.definitionContractCoordinates,
    requestRef: `public-request://abi5-tests/sdk/${identity}`,
    correlationRef: `correlation://abi5-tests/sdk/${identity}`,
    eventTime: "2026-08-23T00:00:00.000Z",
    provenanceRefs: ["provenance://abi5-tests/sdk-worker"],
  });
  let sdkHandoff =
    acquisitionFlipOutcome.receipt.resources.eventResource.closeHandoff;
  const invokeConstruction = await publicApi.constructInstalledStartCall({
    selection: Object.freeze({
      memberKey: "invoke",
      catalogHandle: languageFixture.ids.graphFunctionRef,
    }),
    programRef: languageFixture.ids.programRef,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    admittedInstalls,
    workspaceBinding,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    actorRef: workspaceBinding.authorizedActorRef,
    input: Object.freeze({ value: gtl.constructLanguageTestInput("World") }),
    inputValueRef: "value://abi5-tests/sdk/direct-invoke-input",
    source: Object.freeze({ kind: "none" }),
    eventResource: reopenedReadResource(product, sdkHandoff),
    envelope: sdkEnvelope("direct-invoke"),
  });
  if (invokeConstruction.kind !== "installed_start_call") {
    assert.fail(JSON.stringify(invokeConstruction));
  }
  assert.deepEqual(invokeConstruction.call.invocation.definitionKey, {
    operationId,
    memberKey: "invoke",
  });
  const invokeOutcome = await publicApi.runInstalledDefinitionCallTransport(
    Object.freeze({ kind: "reopen", closeHandoff: sdkHandoff }),
    invokeConstruction.call,
  );
  assert.equal(
    invokeOutcome.kind,
    "installed_definition_call_transport_result",
    JSON.stringify(invokeOutcome).slice(0, 4000),
  );
  assert.equal(
    invokeOutcome.receipt.ownerOutput.outcomeKind,
    "result",
    JSON.stringify(invokeOutcome.receipt.ownerOutput).slice(0, 4000),
  );
  assert.equal(invokeOutcome.receipt.ownerOutput.value.disposition, "completed");
  const invokeRun = invokeOutcome.receipt.resources.run;
  assert.ok(invokeRun);
  assert.notEqual(invokeRun.ref, st4Run.ref, "direct invoke opens its own Run");
  assert.notEqual(invokeRun.ref, terminalRun.ref, "direct invoke opens its own Run");
  sdkHandoff = invokeOutcome.receipt.resources.eventResource.closeHandoff;
  // The invoke owner names its GraphCall; the durable log opens exactly that
  // one GraphCall for the direct-invoke Run.
  const invokeGraphCall = invokeOutcome.receipt.ownerOutput.value.graphCall;
  assert.ok(invokeGraphCall, "the direct invoke result names its GraphCall");
  assert.deepEqual(
    abg.readRuntimeEventsAtDurablePrefix(sdkHandoff.prefix)
      .filter((event) =>
        event.kind === "graph_call_opened" && event.runId === invokeRun.ref
      )
      .map((event) => event.graphCallId),
    [invokeGraphCall.ref],
    "the direct-invoke Run opens exactly its result GraphCall",
  );
  const declarationProof = Object.freeze({
    kind: "abg_historical_declaration_proof",
    schemaVersion,
    catalog,
    catalogView,
  });
  const sdkReadRows = [
    ["run_status", invokeRun.ref, Object.freeze({ kind: "none" })],
    ["run_result", invokeRun.ref, Object.freeze({ kind: "none" })],
    ["run_replay", invokeRun.ref, Object.freeze({
      kind: "ordinal_page",
      fromOrdinal: 0,
      limit: 1024,
    })],
    ["run_gaps", invokeRun.ref, Object.freeze({ kind: "none" })],
    ["graph_call_result", invokeGraphCall.ref, Object.freeze({
      kind: "none",
    })],
    ["graph_call_replay", invokeGraphCall.ref, Object.freeze({
      kind: "ordinal_page",
      fromOrdinal: 0,
      limit: 1024,
    })],
  ];
  assert.deepEqual(
    sdkReadRows.map(([memberKey]) => memberKey).sort(),
    [...abg.ABG_RUN_READ_MEMBER_KEYS].sort(),
    "the composition reads every run read member",
  );
  const sdkLogBytes = await readFile(new URL(sdkHandoff.prefix.eventLogRef));
  const sdkReadOutputs = new Map();
  for (const [memberKey, sourceRef, selector] of sdkReadRows) {
    const construction = publicApi.constructInstalledRunReadCall({
      memberKey,
      workspaceBinding: Object.freeze({
        ref: workspaceBinding.bindingId,
        digest: workspaceBinding.bindingDigest,
      }),
      sourceRef,
      selector,
      eventResource: reopenedReadResource(product, sdkHandoff),
      ...(memberKey.startsWith("graph_call") ? { declarationProof } : {}),
      envelope: sdkEnvelope(`read-${memberKey}`),
    });
    if (construction.kind !== "installed_run_read_call") {
      assert.fail(`${memberKey} ${JSON.stringify(construction)}`);
    }
    assert.equal(
      construction.population.source.ref,
      sourceRef,
      `${memberKey} populated source`,
    );
    const readOutcome = await publicApi.runInstalledDefinitionCallTransport(
      Object.freeze({ kind: "reopen", closeHandoff: sdkHandoff }),
      construction.call,
    );
    assert.equal(
      readOutcome.kind,
      "installed_definition_call_transport_result",
      memberKey,
    );
    const output = readOutcome.receipt.ownerOutput;
    assert.equal(
      output.outcomeKind,
      "result",
      `${memberKey} ${JSON.stringify(output).slice(0, 4000)}`,
    );
    assert.equal(output.value.caseKey, memberKey);
    assert.deepEqual(
      [output.value.source.ref, output.value.source.digest],
      [construction.population.source.ref, construction.population.source.digest],
      `${memberKey} reads its populated source`,
    );
    assert.deepEqual(
      readOutcome.receipt.resources.eventResource.closeHandoff.prefix,
      sdkHandoff.prefix,
      `${memberKey} keeps the prefix`,
    );
    sdkReadOutputs.set(memberKey, output.value.projection);
    sdkHandoff = readOutcome.receipt.resources.eventResource.closeHandoff;
  }
  assert.equal(
    Buffer.compare(
      await readFile(new URL(sdkHandoff.prefix.eventLogRef)),
      sdkLogBytes,
    ),
    0,
    "shipped-constructor reads append zero bytes",
  );
  assert.deepEqual(sdkReadOutputs.get("run_status").subject, invokeRun);
  assert.equal(sdkReadOutputs.get("run_status").status, "closed");
  assert.deepEqual(
    sdkReadOutputs.get("run_result").result,
    invokeOutcome.receipt.ownerOutput.value.result,
  );

  // The shipped start constructor populates the graph_function and asset
  // starts from the same owner. The language Program publishes no asset
  // target, so the asset start meets the existing invalid_target class.
  const sdkStart = (identity, target) => publicApi.constructInstalledStartCall({
    selection: Object.freeze({
      memberKey: "start",
      target,
      rootMode: "direct",
      fhMode: "direct",
    }),
    programRef: languageFixture.ids.programRef,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    admittedInstalls,
    workspaceBinding,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    actorRef: workspaceBinding.authorizedActorRef,
    input: Object.freeze({ value: gtl.constructLanguageTestInput("World") }),
    inputValueRef: `value://abi5-tests/sdk/${identity}-input`,
    source: Object.freeze({ kind: "none" }),
    eventResource: reopenedReadResource(product, sdkHandoff),
    envelope: sdkEnvelope(identity),
  });
  const graphStartTarget = Object.freeze({
    kind: "graph_function",
    handle: languageFixture.ids.graphFunctionRef,
  });
  const graphStart = await sdkStart("graph-function-start", graphStartTarget);
  if (graphStart.kind !== "installed_start_call") {
    assert.fail(JSON.stringify(graphStart));
  }
  assert.deepEqual(graphStart.call.invocation.definitionKey, {
    operationId,
    memberKey: "start",
  });
  assert.deepEqual(graphStart.call.invocation.request.target, graphStartTarget);
  assert.ok(
    graphStart.call.invocation.invocationAuthority.slots.graph_function,
    "a graph_function start carries its GraphFunction slot",
  );
  const graphStartOutcome = await publicApi.runInstalledDefinitionCallTransport(
    Object.freeze({ kind: "reopen", closeHandoff: sdkHandoff }),
    graphStart.call,
  );
  assert.equal(
    graphStartOutcome.kind,
    "installed_definition_call_transport_result",
    JSON.stringify(graphStartOutcome).slice(0, 4000),
  );
  assert.equal(
    graphStartOutcome.receipt.ownerOutput.outcomeKind,
    "result",
    JSON.stringify(graphStartOutcome.receipt.ownerOutput).slice(0, 4000),
  );
  assert.equal(graphStartOutcome.receipt.ownerOutput.value.disposition, "completed");
  const graphStartRun = graphStartOutcome.receipt.resources.run;
  assert.ok(graphStartRun);
  assert.notEqual(graphStartRun.ref, invokeRun.ref, "the graph_function start opens its own Run");
  sdkHandoff = graphStartOutcome.receipt.resources.eventResource.closeHandoff;
  const graphStartGraphCall = graphStartOutcome.receipt.ownerOutput.value.graphCall;
  assert.ok(graphStartGraphCall, "the graph_function start result names its GraphCall");
  assert.deepEqual(
    abg.readRuntimeEventsAtDurablePrefix(sdkHandoff.prefix)
      .filter((event) =>
        event.kind === "graph_call_opened" && event.runId === graphStartRun.ref
      )
      .map((event) => event.graphCallId),
    [graphStartGraphCall.ref],
    "the graph_function start Run opens exactly its result GraphCall",
  );
  const assetLogBytes = await readFile(new URL(sdkHandoff.prefix.eventLogRef));
  const assetStart = await sdkStart("asset-start", Object.freeze({
    kind: "asset",
    handle: "asset-handle://abi5-tests/language-smoke/unpublished@5",
  }));
  assert.equal(
    assetStart.kind,
    "product_run_invocation_preparation_refusal",
    JSON.stringify(assetStart).slice(0, 4000),
  );
  assert.equal(assetStart.ownerOutput.outcomeKind, "refusal");
  assert.equal(assetStart.ownerOutput.value.code, "invalid_target");
  assert.deepEqual(assetStart.ownerOutput.value.issuePaths, ["/program"]);
  assert.equal(
    Buffer.compare(
      await readFile(new URL(sdkHandoff.prefix.eventLogRef)),
      assetLogBytes,
    ),
    0,
    "an unpublished asset start appends zero bytes",
  );
  context.diagnostic(
    "SDK: shipped constructors populate 1 direct invoke, 1 graph_function start, 6 run reads and 1 invalid_target asset start, 0 read bytes",
  );
});

// The unchanged developer mini Product: one installed setup and two explicit
// STARTs. Its ticket graph_function START goes through the qualification
// wrapper; its published greeting asset START through the shipped factory.
// Neither patches a target or writes a fixture, publication or asset.
test("ST-1 starts the developer mini Product's graph_function and published asset targets through installed owners", async (context) => {
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    workspaceProductIndex: 1,
    prepareAdditionalProducts: async ({ scratch }) => {
      const prepared = await prepareDeveloperMiniProduct(packageRoot, scratch);
      prepared.loadInstalledPublication = async ({ installedRoot, verified }) => {
        const module = await import(
          pathToFileURL(join(installedRoot, "build/index.js")).href
        );
        return module.constructDeveloperMiniPublication({
          productId: verified.productId,
          artifactDigest: verified.artifactDigest,
          productContentDigest: verified.productContentDigest,
          productManifestDigest: verified.manifestDigest,
          packageName: verified.packageName,
          packageVersion: verified.packageVersion,
        });
      };
      return [prepared];
    },
  });
  const {
    product,
    abg,
    catalog,
    admittedInstalls,
    workspaceBinding,
    additionalProducts: [miniProduct],
  } = environment;
  const ids = miniProduct.ids;
  const catalogView = product.narrowGraphFunctionCatalog(
    catalog,
    [ids.graphFunctionRef, ids.ticketGraphFunctionRef],
  );
  assert.equal(
    catalogView.kind,
    "graph_function_catalog_view",
    JSON.stringify(catalogView),
  );
  const runtime = await installedModules(environment.installedRoot);
  const publicApi = runtime.api;
  const caller = publicCaller({
    root: environment.scratch,
    runtime,
    native: { verified: environment.verified },
    command: () => {
      throw new Error("no provider dispatch");
    },
    record: async () => {},
    config: { runId: "st-1-developer-mini" },
    actorRef: workspaceBinding.authorizedActorRef,
  });
  caller.installedRoot = environment.installedRoot;
  Object.assign(caller.state, {
    binding: {
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    },
    resolvedLock: environment.lock,
    catalog,
    catalogView,
    closeHandoff: environment.store.projectReopenAuthorityAndClose(),
  });
  const dispatch = async (identity, call) => {
    const before = caller.state.closeHandoff;
    const outcome = await publicApi.runInstalledDefinitionCallTransport(
      Object.freeze({ kind: "reopen", closeHandoff: before }),
      call,
    );
    assert.equal(
      outcome.kind,
      "installed_definition_call_transport_result",
      `${identity} ${JSON.stringify(outcome).slice(0, 4000)}`,
    );
    const { receipt } = outcome;
    assert.equal(
      receipt.ownerOutput.outcomeKind,
      "result",
      `${identity} ${JSON.stringify(receipt.ownerOutput).slice(0, 4000)}`,
    );
    assert.equal(receipt.ownerOutput.value.disposition, "completed", identity);
    caller.state.closeHandoff = receipt.resources.eventResource.closeHandoff;
    const run = receipt.resources.run;
    assert.ok(run, `${identity} admits a Run`);
    assert.deepEqual(
      abg.readRuntimeEventsAtDurablePrefix(caller.state.closeHandoff.prefix)
        .filter((event) =>
          event.kind === "graph_call_opened" && event.runId === run.ref
        )
        .map((event) => event.graphCallId),
      [receipt.ownerOutput.value.graphCall.ref],
      `${identity} Run opens exactly its result GraphCall`,
    );
    return receipt;
  };

  // The qualification wrapper's input refusal comes from the canonical
  // population, retains the resolution it observed and appends zero bytes.
  const ticketProgram = Object.freeze({
    programRef: ids.ticketProgramRef,
    graphFunctionRef: ids.ticketGraphFunctionRef,
  });
  const ticketInput = Object.freeze({
    kind: "developer_ticket_work_input",
    schemaVersion,
    ticketRef: "ticket://abi5-tests/st-1/developer-mini",
    requestedOutcome: "preserve the declared ticket outcome",
  });
  const refusedLogBytes = await readFile(
    new URL(caller.state.closeHandoff.prefix.eventLogRef),
  );
  const refusedInput = Object.freeze({ ...ticketInput, requestedOutcome: "" });
  const refusedStart = await qualification.startCall(
    caller,
    ticketProgram,
    refusedInput,
    { label: "developer-mini-ticket-refused" },
  );
  assert.equal(refusedStart.inputAdmitted, false);
  assert.equal(refusedStart.call, null);
  assert.equal(
    refusedStart.root.resolution.resolution.programRef,
    ids.ticketProgramRef,
  );
  assert.equal(
    qualification.admitsInput(caller, refusedStart.root.resolution, refusedInput),
    false,
  );
  assert.equal(
    Buffer.compare(
      await readFile(new URL(caller.state.closeHandoff.prefix.eventLogRef)),
      refusedLogBytes,
    ),
    0,
    "a refused qualification input appends zero bytes",
  );

  const ticketStart = await qualification.startCall(
    caller,
    ticketProgram,
    ticketInput,
    { label: "developer-mini-ticket" },
  );
  assert.equal(ticketStart.inputAdmitted, true);
  assert.equal(
    ticketStart.root.resolution.resolution.programRef,
    ids.ticketProgramRef,
  );
  assert.equal(
    qualification.admitsInput(caller, ticketStart.root.resolution, ticketInput),
    true,
  );
  assert.deepEqual(ticketStart.call.invocation.definitionKey, {
    operationId,
    memberKey: "start",
  });
  assert.deepEqual(ticketStart.call.invocation.request.target, {
    kind: "graph_function",
    handle: ids.ticketGraphFunctionRef,
  });
  assert.deepEqual(ticketStart.call.invocation.request.input.value, ticketInput);
  assert.ok(
    ticketStart.call.invocation.invocationAuthority.slots.graph_function,
    "a graph_function start carries its GraphFunction slot",
  );
  const ticketReceipt = await dispatch("ticket", ticketStart.call);
  assert.deepEqual(ticketReceipt.ownerOutput.value.terminalResult.value, {
    kind: "developer_ticket_work_output",
    schemaVersion,
    ticketRef: ticketInput.ticketRef,
    disposition: "completed",
    summary: `Completed: ${ticketInput.requestedOutcome}`,
  });

  // The published asset target is the Program's own predeclared handle.
  const assetTarget = Object.freeze({
    kind: "asset",
    handle: ids.greetingAssetHandle,
  });
  const greetingInput = Object.freeze({
    kind: "developer_greeting_input",
    schemaVersion,
    name: "ST1",
  });
  const assetStart = await publicApi.constructInstalledStartCall({
    selection: Object.freeze({
      memberKey: "start",
      target: assetTarget,
      rootMode: "direct",
      fhMode: "direct",
    }),
    programRef: ids.programRef,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    admittedInstalls,
    workspaceBinding,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    actorRef: workspaceBinding.authorizedActorRef,
    input: Object.freeze({ value: greetingInput }),
    inputValueRef: "value://abi5-tests/st-1-developer-mini/greeting-input",
    source: Object.freeze({ kind: "none" }),
    eventResource: reopenedReadResource(product, caller.state.closeHandoff),
    envelope: Object.freeze({
      definitionContractCoordinates:
        environment.verified.definitionContractCoordinates,
      requestRef: "public-request://abi5-tests/st-1-developer-mini/asset-start",
      correlationRef: "correlation://abi5-tests/st-1-developer-mini/asset-start",
      eventTime: "2026-08-24T00:00:00.000Z",
      provenanceRefs: ["provenance://abi5-tests/st-1-developer-mini-worker"],
    }),
  });
  if (assetStart.kind !== "installed_start_call") {
    assert.fail(JSON.stringify(assetStart));
  }
  assert.deepEqual(assetStart.call.invocation.request.target, assetTarget);
  assert.equal(assetStart.population.resolution.resolution.programRef, ids.programRef);
  assert.equal(
    assetStart.call.invocation.invocationAuthority.slots.graph_function,
    null,
    "an asset start carries no GraphFunction slot",
  );
  const assetReceipt = await dispatch("asset", assetStart.call);
  assert.notEqual(assetReceipt.resources.run.ref, ticketReceipt.resources.run.ref);
  assert.equal(
    assetReceipt.ownerOutput.value.terminalResult.value.message,
    "Welcome ST1.",
  );
  context.diagnostic(
    "ST-1 developer mini: 1 installed setup, 1 qualification graph_function START with 1 zero-byte input refusal, 1 shipped-factory published asset START",
  );
});
