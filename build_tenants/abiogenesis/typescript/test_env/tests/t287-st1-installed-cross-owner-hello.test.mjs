import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

import * as Effect from "effect/Effect";

import { prepareOddGlcDataProduct } from
  "../support/developer-mini-product.mjs";
import { constructInstalledPublicDefinitionCall } from
  "../support/installed-public-definition-call.mjs";
import { setupInstalledRootCatalog } from
  "../support/root-installed-environment.mjs";

const execFileAsync = promisify(execFile);
const packageRoot = new URL("../..", import.meta.url).pathname;
const operationId = "abg.operation.run.invoke";
const schemaVersion = "5.0.0";

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
    additionalProducts: [oddGlc],
    additionalPublications: [oddPublication],
  } = environment;
  const projectReadContracts = await import(
    `${pathToFileURL(join(
      environment.installedRoot,
      "build/code/src/abg/project_read_operation_contracts.js",
    )).href}?st2ac=${Date.now()}`
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
});
