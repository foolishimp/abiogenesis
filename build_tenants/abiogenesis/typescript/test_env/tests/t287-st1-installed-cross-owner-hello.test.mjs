import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

import * as Effect from "effect/Effect";

import { prepareOddGlcDataProduct } from
  "../support/developer-mini-product.mjs";
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

async function constructInstalledStartCall({
  environment,
  publicApi,
  eventResource,
  input,
}) {
  const {
    product,
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,
    additionalProducts: [oddGlc],
  } = environment;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: oddGlc.ids.programRef,
    selection: Object.freeze({
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
  const admittedInput = product.admitInstalledProductInput(
    resolution.productSemantics,
    resolution.resolution.inputContract.contractRef,
    input,
  );
  assert.ok(admittedInput);
  const inputContract = Object.freeze({
    ref: resolution.resolution.inputContract.contractRef,
    digest: resolution.resolution.inputContractDigest,
  });
  const contractBoundInput = Object.freeze({
    contract: inputContract,
    valueRef: "value://odd-glc/st-1/hello-input",
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
  const fixedPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
  const grants = Object.freeze([
    product.constructCapabilityGrant(
      policy,
      actorRef,
      operationId,
      product.DIRECT_INVOKE_CAPABILITY,
      {
        admittedInstalls,
        workspaceBinding,
        fixedPacket,
      },
    ),
  ]);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    resolution.program.programRef,
    resolution.selectedCatalogEntry,
    policy,
    grants,
    {
      admittedInstalls,
      workspaceBinding,
      fixedPacket,
    },
  );
  const program = Object.freeze({
    ref: resolution.resolution.programRef,
    digest: resolution.resolution.programDigest,
  });
  const view = Object.freeze({
    ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice("sha256:".length)}`,
    digest: catalogView.viewDigest,
  });
  const request = Object.freeze({
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
  const steeringDigest = product.sha256Canonical(eventResource);
  const slots = Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map((install) => Object.freeze({
      ref: install.installId,
      digest: install.productContentDigest,
    }))),
    dependency_lock: Object.freeze({
      ref: workspaceBinding.lockId,
      digest: workspaceBinding.lockDigest,
    }),
    catalog_scope: Object.freeze({
      catalog: Object.freeze({
        ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice("sha256:".length)}`,
        digest: catalog.basisDigest,
      }),
      view,
      allowlist: request.allowlist,
    }),
    execution_program: program,
    graph_function: null,
    input_contract: contractBoundInput,
    session_policy: Object.freeze({
      ref: policy.policyRef,
      digest: policy.policyDigest,
    }),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([
        ...product.RUN_OPERATION_CONTRACTS.invoke.start.metadata.capabilityRefs,
      ]),
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
  const contractCatalog = environment.verified.definitionContractCoordinates
    ?.operations.find((candidate) => candidate.operationId === operationId)
    ?.members.find((candidate) => candidate.memberKey === "start")
    ?.slots.request.contractCatalog;
  assert.ok(
    contractCatalog,
    "verified ABIogenesis truth must issue the installed start contract catalog",
  );
  const resources = Object.freeze({
    kind: "run_invocation_resource_assertion",
    schemaVersion,
    eventResource,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    source: Object.freeze({ kind: "none" }),
  });
  return {
    call: constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        environment.verified.definitionContractCoordinates,
      contractCatalog,
      operationId,
      memberKey: "start",
      request,
      slots,
      resources,
      requestRef: "public-request://odd-glc/st-1/run-start",
      correlationRef: "correlation://odd-glc/st-1/run-start",
      eventTime: "2026-08-21T00:00:00.000Z",
      provenanceRefs: ["provenance://odd-glc/st-1-worker"],
    }),
    resolution,
    capabilityBasis: Object.freeze({
      actorRef,
      capabilityGrants: grants,
      policy,
      productInstalls: admittedInstalls,
      program: resolution.program,
      programValidation: resolution.programValidation,
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

function readAuthoritySlots(environment, packet, grants) {
  const { admittedInstalls, workspaceBinding } = environment;
  return Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map((install) => Object.freeze({
      ref: install.installId,
      digest: install.productContentDigest,
    }))),
    dependency_lock: Object.freeze({
      ref: workspaceBinding.lockId,
      digest: workspaceBinding.lockDigest,
    }),
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...packet.metadata.capabilityRefs]),
      grants: Object.freeze(grants.map((grant) => Object.freeze({
        ref: grant.grantRef,
        digest: grant.grantDigest,
      }))),
    }),
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
  });
}

function constructInstalledRunReadCall({
  environment,
  publicApi,
  projectReadContracts,
  memberKey,
  selector,
  source,
  eventResource,
  identity,
  contractCatalogOverride = null,
  definitionContractCoordinatesOverride = null,
  mutateRequest = (request) => request,
  mutateSlots = (slots) => slots,
}) {
  const { product, admittedInstalls, workspaceBinding } = environment;
  const packet = projectReadContracts.ABG_PROJECT_READ_CONTRACTS[memberKey];
  const grantBasis = Object.freeze({
    admittedInstalls,
    workspaceBinding,
    fixedPacket: packet,
  });
  const grants = Object.freeze(packet.metadata.capabilityRefs.map(
    (capabilityRef) => product.constructCapabilityGrant(
      environment.workspaceAuthority,
      workspaceBinding.authorizedActorRef,
      packet.definitionKey.operationId,
      capabilityRef,
      grantBasis,
    ),
  ));
  const request = mutateRequest(Object.freeze({
    caseKey: memberKey,
    source: Object.freeze({
      sourceKind: "run",
      sourceRef: source.ref,
      sourceDigest: source.digest,
    }),
    projectionBasis: Object.freeze({
      projectionBasisRef: eventResource.closeHandoff.prefix.eventLogRef,
      projectionBasisDigest:
        eventResource.closeHandoff.prefix.coordinateDigest,
    }),
    selector,
  }));
  const slots = mutateSlots(
    readAuthoritySlots(environment, packet, grants),
    grants,
  );
  const installedContractCatalog =
    environment.verified.definitionContractCoordinates
    ?.operations.find((candidate) =>
      candidate.operationId === packet.definitionKey.operationId
    )
    ?.members.find((candidate) => candidate.memberKey === memberKey)
    ?.slots.request.contractCatalog;
  assert.ok(
    installedContractCatalog,
    `${memberKey} requires its installed contract catalog coordinate`,
  );
  const contractCatalog = contractCatalogOverride ?? installedContractCatalog;
  return Object.freeze({
    packet,
    grants,
    call: constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        definitionContractCoordinatesOverride ??
          environment.verified.definitionContractCoordinates,
      contractCatalog,
      operationId: packet.definitionKey.operationId,
      memberKey,
      request,
      slots,
      resources: Object.freeze({
        kind: "abg_project_read_resource_assertion",
        schemaVersion,
        eventResource,
      }),
      requestRef: `public-request://odd-glc/st-2b/${identity}`,
      correlationRef: `correlation://odd-glc/st-2b/${identity}`,
      eventTime: "2026-08-22T00:00:00.000Z",
      provenanceRefs: ["provenance://odd-glc/st-2b-worker"],
    }),
  });
}

test("ST-1 executes installed odd_glc data through ABI-owned F_D Hello", async (context) => {
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    workspaceProductIndex: 1,
    prepareAdditionalProducts: async (basis) => [
      await prepareOddGlcDataProduct(basis),
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
    additionalProducts: [oddGlc],
    additionalPublications: [oddPublication],
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
    ["-tzf", oddGlc.artifactPath],
  );
  const archiveFiles = archiveStdout.trim().split("\n")
    .filter((path) => !path.endsWith("/")).sort();
  assert.deepEqual(archiveFiles, [
    "package/build/publication.json",
    "package/contracts/capabilities/capability-definition-graph.json",
    "package/contracts/public-contract-catalog.schema.json",
    "package/package.json",
    "package/product-toolchain-manifest.json",
  ]);
  assert.equal(
    archiveFiles.some((path) => /\.(?:c|m)?js$|\.d\.(?:c|m)?ts$/u.test(path)),
    false,
  );
  assert.deepEqual(
    {
      contracts: oddPublication.contracts.length,
      evaluators: oddPublication.evaluators.length,
      implementationBindings: oddPublication.implementationBindings.length,
      closureContracts: oddPublication.closureContracts.length,
      programs: oddPublication.programs.length,
      graphFunctions: oddPublication.graphFunctions.length,
    },
    {
      contracts: 0,
      evaluators: 0,
      implementationBindings: 0,
      closureContracts: 0,
      programs: 1,
      graphFunctions: 1,
    },
  );
  assert.equal(publications.length, 2);
  assert.equal(catalog.kind, "graph_function_catalog");
  assert.equal(catalog.readinessBasis.verifiedProducts.length, 2);
  assert.equal(catalog.readinessBasis.installedProducts.length, 2);
  assert.equal(
    catalog.rowDispositions.find(
      (row) => row.handle === oddGlc.ids.graphFunctionRef,
    )?.disposition,
    "admitted",
  );
  assert.deepEqual(catalogView.allowlist, [oddGlc.ids.graphFunctionRef]);
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
  const input = gtl.constructHelloWorldInput("World");
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
  assert.equal(resolution.resolution.programOwner.productId, oddGlc.basis.productId);
  assert.equal(
    resolution.resolution.graphFunctionOwner.productId,
    oddGlc.basis.productId,
  );
  assert.equal(
    resolution.declarationClosure.semanticsOwner.productId,
    environment.verified.productId,
  );
  assert.equal(
    resolution.implementationSetCandidate.rows[0].implementationOwnerProductId,
    environment.verified.productId,
  );
  assert.equal(
    resolution.implementationSetCandidate.rows[0].graphFunctionOwnerProductId,
    oddGlc.basis.productId,
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
  assert.equal(invocationAdmission.payload.programRef, oddGlc.ids.programRef);
  assert.equal(
    invocationAdmission.payload.graphFunctionRef,
    oddGlc.ids.graphFunctionRef,
  );
  assert.equal(implementationAdmission.payload.implementationSet.rows.length, 1);
  assert.equal(
    implementationAdmission.payload.implementationSet.rows[0]
      .implementationOwnerProductId,
    environment.verified.productId,
  );
  assert.deepEqual(admittedResult.payload.value, {
    kind: "hello_world_output",
    schemaVersion,
    message: "Hello World",
  });
  assert.equal(
    admittedResult.payload.contractRef,
    gtl.HELLO_WORLD_IDS.outputContractRef,
  );
  assert.equal(events.some((event) => event.kind === "frame_opened"), true);
  assert.equal(events.some((event) => event.kind === "run_closed"), true);
  assert.equal(
    await readFile(
      join(installCandidates[1].installedRoot, "build/publication.json"),
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
      projectReadContracts,
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
  assert.deepEqual(replayedTruth.replay, terminalReplay);
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
  assert.deepEqual(readProjections.get("run_status").replay, terminalReplay);
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
  assert.deepEqual(readProjections.get("run_result").replay, terminalReplay);
  assert.deepEqual(readProjections.get("run_replay").subject, terminalRun);
  assert.deepEqual(readProjections.get("run_replay").replay, terminalReplay);
  assert.equal(readProjections.get("run_replay").fromOrdinal, 0);
  assert.equal(readProjections.get("run_replay").limit, 1024);
  assert.deepEqual(replayedTruth.result, {
    ref: admittedResult.payload.resultRef,
    digest: admittedResult.payload.resultDigest,
  });
  assert.equal(admittedResult.payload.contractRef, gtl.HELLO_WORLD_IDS.outputContractRef);
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
      `${pathToFileURL(environment.installedRoot).href}/`,
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
      source: Object.freeze({
        ref: "run://abiogenesis/st2b-catalog-owner-must-not-run",
        digest: readFalsifierDigest,
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
      projectReadContracts,
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

  const staleRead = constructInstalledRunReadCall({
    environment,
    publicApi,
    projectReadContracts,
    memberKey: "run_status",
    selector: Object.freeze({ kind: "none" }),
    source: terminalRun,
    eventResource: reopenedReadResource(product, setupHandoff),
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
});
