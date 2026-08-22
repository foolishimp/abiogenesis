import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import {
  ownerAuthorityDigest,
  ownerContractPacket,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
} from "../../build/code/src/shared/public_function_contracts.js";
import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
} from "../../build/code/src/shared/public_function_family.js";
import {
  PUBLIC_PROJECTION_PAYLOADS,
} from "../../build/code/src/shared/public_function_projections.js";

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

test("S01-S2 prebinding eligibility stays sparse and projected", () => {
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
        .map((definition) => keyOf(definition))
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
});

test("ownerContractPacket rejects forged prebinding metadata", () => {
  assert.throws(() => ownerContractPacket(
    { operationId: "abg.operation.test", memberKey: "forged" },
    v.strictObject({}),
    v.strictObject({}),
    v.strictObject({}),
    null,
    {
      abstractModule: "Product.Test",
      exportName: "TEST_CONTRACTS",
      memberPath: ["forged"],
      authorityRef: "authority://abiogenesis/product/test@5",
      authorityDigest: ownerAuthorityDigest(
        "authority://abiogenesis/product/test@5"
      ),
    },
    {
      authorityClass: "pure",
      effectClass: "none",
      eventAdmission: "none",
      actorRequirement: "forbidden",
      workspaceBindingRequirement: "forbidden",
      successorDevelopmentPrebindingAuthority: "forged",
      authoritySlotRequirements: ["capability_grants"],
      capabilityRefs: ["capability://abiogenesis/product/test"],
      defaults: {},
      closedDomains: {},
      sdkCoordinate: "sdk.test.forged",
      cliCoordinate: "test forged",
      adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
    },
  ), TypeError);
});
