import assert from "node:assert/strict";
import test from "node:test";

import {
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const PREBINDING_CAPABILITY_REF = "abg.capability.install.bind-products@5";
const PUBLIC_CONTRACT_CAPABILITY_REF =
  "abg.capability.operator.public-contract@5";
const PREBINDING_FIXTURES = Object.freeze([
  Object.freeze({
    definitionKey: Object.freeze({
      operationId: "abg.operation.product.install",
      memberKey: "install",
    }),
    capabilityRef: PREBINDING_CAPABILITY_REF,
  }),
  Object.freeze({
    definitionKey: Object.freeze({
      operationId: "abg.operation.product.resolve",
      memberKey: "resolve",
    }),
    capabilityRef: PREBINDING_CAPABILITY_REF,
  }),
  Object.freeze({
    definitionKey: Object.freeze({
      operationId: "abg.operation.product.verify",
      memberKey: "verify",
    }),
    capabilityRef: PREBINDING_CAPABILITY_REF,
  }),
  Object.freeze({
    definitionKey: Object.freeze({
      operationId: "abg.operation.workspace.bind",
      memberKey: "bind",
    }),
    capabilityRef: PREBINDING_CAPABILITY_REF,
  }),
  Object.freeze({
    definitionKey: Object.freeze({
      operationId: "abg.operation.workspace.create",
      memberKey: "clean",
    }),
    capabilityRef: PUBLIC_CONTRACT_CAPABILITY_REF,
  }),
]);
const INVOKE_DEFINITION_KEY = Object.freeze({
  operationId: "abg.operation.run.invoke",
  memberKey: "invoke",
});

const keyOf = (definition) =>
  `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;

const expectedEligibleKeys = [
  "abg.operation.product.install#install",
  "abg.operation.product.resolve#resolve",
  "abg.operation.product.verify#verify",
  "abg.operation.workspace.bind#bind",
  "abg.operation.workspace.create#clean",
];

const sorted = (values) => [...values].sort();

test("S02-B2 constructs the five exact predecessor-bound capability grants", async (t) => {
  const environment = await setupInstalledRootCatalog(t, process.cwd(), {
    candidateBasisSource: "packed_artifact",
  });
  const {
    product,
    abg,
    durablePrefix,
    workspaceBinding,
    publicApi,
  } = environment;
  const {
    PUBLIC_FUNCTION_DEFINITION_FAMILY,
    PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
    PUBLIC_PROJECTION_PAYLOADS,
  } = publicApi;
  const predecessorEnvironment = abg.projectExactPrefixWorkspaceEnvironment(
    durablePrefix,
    {
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    },
  );
  assert.equal(
    predecessorEnvironment.kind,
    "exact_prefix_workspace_environment",
    JSON.stringify(predecessorEnvironment),
  );
  assert.equal(
    product.canonicalJson(predecessorEnvironment),
    product.canonicalJson(abg.projectExactPrefixWorkspaceEnvironment(
      predecessorEnvironment.prefix,
      {
        ref: predecessorEnvironment.workspaceBinding.bindingId,
        digest: predecessorEnvironment.workspaceBinding.bindingDigest,
      },
    )),
  );

  const actorRef = predecessorEnvironment.workspaceAuthorityBasis
    .authorizedActorRef;
  const actors = [];
  const attributions = [];
  let firstCase;

  for (const { definitionKey, capabilityRef } of PREBINDING_FIXTURES) {
    const request = {
      ref: `request://t287/s02b/${definitionKey.memberKey}`,
      digest: product.sha256Canonical({
        definitionKey,
        case: "prebinding",
      }),
    };
    const basis = {
      kind: "prebinding_development_product_basis",
      definitionKey,
      predecessorEnvironment,
      request,
    };
    const grant = product.constructCapabilityGrant(
      predecessorEnvironment.workspaceAuthorityBasis,
      actorRef,
      definitionKey.operationId,
      capabilityRef,
      basis,
    );
    const repeated = product.constructCapabilityGrant(
      predecessorEnvironment.workspaceAuthorityBasis,
      actorRef,
      definitionKey.operationId,
      capabilityRef,
      basis,
    );
    assert.deepEqual(repeated, grant);
    assert.equal(
      product.validateCapabilityGrantForProductBasis(
        grant,
        predecessorEnvironment.workspaceAuthorityBasis,
        actorRef,
        capabilityRef,
        basis,
      ),
      true,
    );
    assert.deepEqual(
      {
        approval: { ref: grant.approvalRef, digest: grant.approvalDigest },
        policy: { ref: grant.policyRef, digest: grant.policyDigest },
        scope: { ref: grant.scopeRef, digest: grant.scopeDigest },
        authorityBasis: {
          ref: grant.authorityBasisRef,
          digest: grant.authorityBasisDigest,
        },
      },
      {
        approval: {
          ref: predecessorEnvironment.workspaceBinding.bindingId,
          digest: predecessorEnvironment.workspaceBinding.bindingDigest,
        },
        policy: {
          ref: predecessorEnvironment.workspaceAuthorityBasis.authorityBasisId,
          digest:
            predecessorEnvironment.workspaceAuthorityBasis.authorityBasisDigest,
        },
        scope: request,
        authorityBasis: {
          ref: predecessorEnvironment.artifactTruth.projectionRef,
          digest: predecessorEnvironment.artifactTruth.projectionDigest,
        },
      },
    );
    const actorAttribution =
      product.projectDevelopmentSuccessorActorAttribution(
        predecessorEnvironment,
        definitionKey,
        request,
      );
    assert.ok(actorAttribution);
    assert.deepEqual(actorAttribution.actor, {
      ref: actorRef,
      digest: product.sha256Canonical({ actorRef }),
    });
    assert.deepEqual(
      product.projectDevelopmentSuccessorActorAttribution(
        predecessorEnvironment,
        definitionKey,
        request,
      ),
      actorAttribution,
    );
    const changedAttribution =
      product.projectDevelopmentSuccessorActorAttribution(
        predecessorEnvironment,
        definitionKey,
        {
          ref: `${request.ref}/changed`,
          digest: product.sha256Canonical({ request, changed: true }),
        },
      );
    assert.ok(changedAttribution);
    assert.deepEqual(changedAttribution.actor, actorAttribution.actor);
    assert.notDeepEqual(
      changedAttribution.attribution,
      actorAttribution.attribution,
    );
    actors.push(actorAttribution.actor);
    attributions.push(actorAttribution.attribution.ref);
    firstCase ??= { definitionKey, capabilityRef, request, basis, grant };
  }

  assert.equal(new Set(actors.map(({ ref }) => ref)).size, 1);
  assert.equal(new Set(actors.map(({ digest }) => digest)).size, 1);
  assert.equal(new Set(attributions).size, PREBINDING_FIXTURES.length);
  assert.ok(firstCase);

  const { definitions } = PUBLIC_FUNCTION_DEFINITION_FAMILY;
  const eligibleDefinitions = definitions.filter((definition) =>
    definition.successorDevelopmentPrebindingAuthority === "eligible"
  );
  assert.deepEqual(
    sorted(eligibleDefinitions.map(keyOf)),
    expectedEligibleKeys,
  );
  assert.ok(definitions.every((definition) =>
    definition.successorDevelopmentPrebindingAuthority === undefined ||
    definition.successorDevelopmentPrebindingAuthority === "eligible"
  ));
  for (const absentKey of [
    "abg.operation.workspace.create#imported",
    "abg.operation.workspace.open#open",
    "abg.operation.project.read#install_evidence",
    "abg.operation.project.read#release_evidence",
  ]) {
    const definition = definitions.find((candidate) => keyOf(candidate) === absentKey);
    assert.ok(definition);
    assert.equal(definition.successorDevelopmentPrebindingAuthority, undefined);
  }
  const eligibleModules = new Set(eligibleDefinitions.map((definition) =>
    definition.requestContract.source.abstractModule
  ));
  assert.deepEqual(sorted(eligibleModules), [
    "Product.EnvironmentResolution",
    "Product.Installation",
    "Product.Verification",
    "Product.WorkspaceOperations",
  ]);
  const sourceModuleCone = definitions.filter((definition) =>
    eligibleModules.has(definition.requestContract.source.abstractModule)
  );
  assert.equal(sourceModuleCone.length, 7);
  assert.equal(definitions.length - sourceModuleCone.length, 49);
  assert.deepEqual(sorted(sourceModuleCone.map(keyOf)), sorted([
    ...expectedEligibleKeys,
    "abg.operation.workspace.create#imported",
    "abg.operation.workspace.open#open",
  ]));
  assert.equal(PUBLIC_OPERATION_CONTRACT_PROJECTIONS.length, 18);
  const familyCoordinates = new Set(
    PUBLIC_OPERATION_CONTRACT_PROJECTIONS.map((projection) =>
      JSON.stringify(projection.family)
    ),
  );
  assert.equal(familyCoordinates.size, 1);
  for (const projection of PUBLIC_OPERATION_CONTRACT_PROJECTIONS) {
    assert.deepEqual(projection.family, {
      requirementAuthorityRefs:
        PUBLIC_FUNCTION_DEFINITION_FAMILY.requirementAuthorityRefs,
      familyRef: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyRef,
      familyVersion: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyVersion,
      familyDigest: PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest,
    });
  }
  assert.deepEqual(
    sorted(PUBLIC_OPERATION_CONTRACT_PROJECTIONS.flatMap((projection) =>
      projection.definitions
        .filter((definition) =>
          definition.successorDevelopmentPrebindingAuthority === "eligible"
        )
        .map(keyOf)
    )),
    expectedEligibleKeys,
  );
  const documentedEligibleKeys = PUBLIC_PROJECTION_PAYLOADS.documentationInventory
    .filter((row) =>
      row.successorDevelopmentPrebindingAuthority === "eligible"
    )
    .map(keyOf);
  assert.deepEqual(sorted(documentedEligibleKeys), expectedEligibleKeys);
  assert.ok(PUBLIC_PROJECTION_PAYLOADS.documentationInventory.every((row) =>
    expectedEligibleKeys.includes(keyOf(row))
      ? row.successorDevelopmentPrebindingAuthority === "eligible"
      : !Object.hasOwn(row, "successorDevelopmentPrebindingAuthority")
  ));

  const expectInvalidPredecessorEnvironment = (label, mutate) => {
    assert.throws(
      () => {
        const invalidPredecessorEnvironment = structuredClone(
          predecessorEnvironment,
        );
        mutate(invalidPredecessorEnvironment);
        return product.constructCapabilityGrant(
          predecessorEnvironment.workspaceAuthorityBasis,
          actorRef,
          firstCase.definitionKey.operationId,
          firstCase.capabilityRef,
          {
            ...firstCase.basis,
            predecessorEnvironment: invalidPredecessorEnvironment,
          },
        );
      },
      TypeError,
      label,
    );
  };
  expectInvalidPredecessorEnvironment("duplicate ABI5 ProductInstall", (candidate) => {
    candidate.productInstalls.push(structuredClone(candidate.productInstalls[0]));
  });
  expectInvalidPredecessorEnvironment("duplicate capability graph owner", (candidate) => {
    const rows = candidate.productInstalls[0].capabilityDefinitionGraph.rows
      .filter((row) => row.capabilityId === firstCase.capabilityRef);
    assert.equal(
      rows.length,
      1,
      "one matching ABI5 capability graph owner row",
    );
    candidate.productInstalls[0].capabilityDefinitionGraph.rows.push(
      structuredClone(rows[0]),
    );
  });
  expectInvalidPredecessorEnvironment("installed public contract digest", (candidate) => {
    const contracts = candidate.productInstalls[0].publicContracts.filter(
      (contract) => contract.contractId === firstCase.definitionKey.operationId,
    );
    assert.equal(contracts.length, 1, "one matching installed public contract");
    contracts[0].contractDigest = product.sha256Canonical({
      mutation: "public-contract-digest",
    });
  });
  expectInvalidPredecessorEnvironment("installed public contract asset locator", (candidate) => {
    const contracts = candidate.productInstalls[0].publicContracts.filter(
      (contract) => contract.contractId === firstCase.definitionKey.operationId,
    );
    assert.equal(contracts.length, 1, "one matching installed public contract");
    contracts[0].assetLocator.contentDigest = product.sha256Canonical({
      mutation: "public-contract-asset-locator",
    });
  });
  expectInvalidPredecessorEnvironment("pre-workspace-binding prefix", (candidate) => {
    candidate.prefix = environment.admittedInstallResults.at(-1).successorPrefix;
  });

  const importedDefinitionKey = Object.freeze({
    operationId: "abg.operation.workspace.create",
    memberKey: "imported",
  });
  assert.throws(
    () => product.constructCapabilityGrant(
      predecessorEnvironment.workspaceAuthorityBasis,
      actorRef,
      importedDefinitionKey.operationId,
      PREBINDING_CAPABILITY_REF,
      {
        kind: "prebinding_development_product_basis",
        definitionKey: importedDefinitionKey,
        predecessorEnvironment,
        request: firstCase.request,
      },
    ),
    TypeError,
    "imported ineligible definition",
  );

  const crossedCases = [
    ["environment", (candidate) => {
      candidate.workspaceBinding.bindingDigest = firstCase.request.digest;
    }],
    ["install", (candidate) => {
      candidate.productInstalls[0].installId += "/crossed";
    }],
    ["catalog", (candidate) => {
      candidate.productInstalls[0].catalogDigest = firstCase.request.digest;
    }],
    ["graph", (candidate) => {
      candidate.productInstalls[0].capabilityDefinitionGraph.graphDigest =
        firstCase.request.digest;
    }],
  ];
  for (const [label, cross] of crossedCases) {
    const crossedEnvironment = structuredClone(predecessorEnvironment);
    cross(crossedEnvironment);
    assert.throws(
      () => product.constructCapabilityGrant(
        predecessorEnvironment.workspaceAuthorityBasis,
        actorRef,
        firstCase.definitionKey.operationId,
        firstCase.capabilityRef,
        {
          ...firstCase.basis,
          predecessorEnvironment: crossedEnvironment,
        },
      ),
      TypeError,
      label,
    );
  }
  const secondDefinitionKey = PREBINDING_FIXTURES[1].definitionKey;
  const invalidKeys = [
    ["unknown", Object.freeze({
      operationId: "abg.operation.unknown",
      memberKey: "unknown",
    })],
    ["extra field", Object.freeze({
      ...firstCase.definitionKey,
      unexpected: true,
    })],
  ];
  for (const [label, definitionKey] of invalidKeys) {
    assert.throws(
      () => product.constructCapabilityGrant(
        predecessorEnvironment.workspaceAuthorityBasis,
        actorRef,
        definitionKey.operationId,
        firstCase.capabilityRef,
        { ...firstCase.basis, definitionKey },
      ),
      TypeError,
      label,
    );
  }
  const crossings = [
    [
      "operation",
      secondDefinitionKey.operationId,
      firstCase.capabilityRef,
      firstCase.basis,
    ],
    [
      "member",
      firstCase.definitionKey.operationId,
      firstCase.capabilityRef,
      {
        ...firstCase.basis,
        definitionKey: Object.freeze({
          operationId: firstCase.definitionKey.operationId,
          memberKey: secondDefinitionKey.memberKey,
        }),
      },
    ],
    [
      "capability",
      firstCase.definitionKey.operationId,
      "abg.capability.catalog.invoke-graph-function@5",
      firstCase.basis,
    ],
  ];
  for (const [label, operationId, capabilityRef, basis] of crossings) {
    assert.throws(
      () => product.constructCapabilityGrant(
        predecessorEnvironment.workspaceAuthorityBasis,
        actorRef,
        operationId,
        capabilityRef,
        basis,
      ),
      TypeError,
      label,
    );
  }

  for (const field of [
    "approvalRef",
    "approvalDigest",
    "policyRef",
    "policyDigest",
    "scopeRef",
    "scopeDigest",
    "authorityBasisRef",
    "authorityBasisDigest",
    "actorRef",
  ]) {
    const mutated = structuredClone(firstCase.grant);
    mutated[field] = field.endsWith("Digest")
      ? product.sha256Canonical({ field, mutation: true })
      : `${mutated[field]}/mutated`;
    assert.equal(
      product.validateCapabilityGrantForProductBasis(
        mutated,
        predecessorEnvironment.workspaceAuthorityBasis,
        actorRef,
        firstCase.capabilityRef,
        firstCase.basis,
      ),
      false,
      field,
    );
  }
  assert.throws(() => product.constructCapabilityGrant(
    predecessorEnvironment.workspaceAuthorityBasis,
    `${actorRef}/forged`,
    firstCase.definitionKey.operationId,
    firstCase.capabilityRef,
    firstCase.basis,
  ), TypeError);
  const forgedAttributionEnvironment = structuredClone(predecessorEnvironment);
  forgedAttributionEnvironment.workspaceAuthorityBasis.authorizedActorRef +=
    "/forged";
  assert.equal(
    product.projectDevelopmentSuccessorActorAttribution(
      forgedAttributionEnvironment,
      firstCase.definitionKey,
      firstCase.request,
    ),
    null,
  );

  const program = environment.publication.programs[0];
  assert.ok(program);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    [],
  );
  const boundBasis = {
    admittedInstalls: environment.admittedInstalls,
    workspaceBinding,
    definitionKey: INVOKE_DEFINITION_KEY,
  };
  const boundGrant = product.constructCapabilityGrant(
    policy,
    actorRef,
    INVOKE_DEFINITION_KEY.operationId,
    "abg.capability.catalog.invoke-graph-function@5",
    boundBasis,
  );
  assert.equal(
    product.validateCapabilityGrantForProductBasis(
      boundGrant,
      policy,
      actorRef,
      "abg.capability.catalog.invoke-graph-function@5",
      boundBasis,
    ),
    true,
  );
  assert.deepEqual(
    {
      approval: [boundGrant.approvalRef, boundGrant.approvalDigest],
      policy: [boundGrant.policyRef, boundGrant.policyDigest],
      scope: [boundGrant.scopeRef, boundGrant.scopeDigest],
      authorityBasis: [
        boundGrant.authorityBasisRef,
        boundGrant.authorityBasisDigest,
      ],
    },
    {
      approval: [workspaceBinding.authorityBasisId, workspaceBinding.authorityBasisDigest],
      policy: [policy.policyRef, policy.policyDigest],
      scope: [workspaceBinding.bindingId, workspaceBinding.bindingDigest],
      authorityBasis: [
        workspaceBinding.authorityBasisId,
        workspaceBinding.authorityBasisDigest,
      ],
    },
  );
  const startBasis = {
    ...boundBasis,
    definitionKey: {
      operationId: "abg.operation.run.invoke",
      memberKey: "start",
    },
  };
  assert.equal(
    product.validateCapabilityGrantForProductBasis(
      boundGrant,
      policy,
      actorRef,
      "abg.capability.catalog.invoke-graph-function@5",
      startBasis,
    ),
    false,
  );
});
