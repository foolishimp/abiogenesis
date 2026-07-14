// Validates: T-277 PC-004 and PC-005 Prime contraction.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER,
  DS1_PUBLIC_OPERATION_IDS,
  publicOperationSlug,
  resolveDs1PublicOperationCliDefinition,
  resolveDs1PublicOperationDefinition
} from "../../build/semantic/code/src/app/m04/public_contracts/operations.js";
import { projectPublicOperationSchemaDefinitions } from "../tools/project_public_operation_schemas.mjs";

const TENANT_ROOT = path.resolve(import.meta.dirname, "../..");

async function source(relativePath) {
  return await readFile(path.join(TENANT_ROOT, relativePath), "utf8");
}

test("T-277 derives operation identity, CLI, and workspace policy from one register", () => {
  assert.equal(DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.length, 19);
  assert.deepEqual(
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.map(({ operationId }) => operationId),
    [...DS1_PUBLIC_OPERATION_IDS]
  );
  assert.equal(new Set(DS1_PUBLIC_OPERATION_IDS).size, 19);

  const cliCoordinates = new Set();
  for (const definition of DS1_PUBLIC_OPERATION_DEFINITION_REGISTER) {
    assert.equal(
      resolveDs1PublicOperationDefinition(definition.operationId),
      definition
    );
    assert.equal(
      resolveDs1PublicOperationCliDefinition(
        definition.cli.command,
        definition.cli.subcommand
      ),
      definition
    );
    const coordinate =
      `${definition.cli.command}\u0000${definition.cli.subcommand ?? ""}`;
    assert.equal(cliCoordinates.has(coordinate), false, coordinate);
    cliCoordinates.add(coordinate);
    assert.equal(
      publicOperationSlug(definition.operationId),
      definition.operationId.slice("abg.operation.".length)
    );
  }
  assert.equal(resolveDs1PublicOperationCliDefinition("install", ""), null);
  assert.equal(resolveDs1PublicOperationCliDefinition("catalog", null), null);

  const workspaceRequired = DS1_PUBLIC_OPERATION_DEFINITION_REGISTER
    .filter(({ cli }) => cli.workspacePolicy === "required")
    .map(({ operationId }) => operationId);
  assert.deepEqual(workspaceRequired, [
    "abg.operation.workspace.create",
    "abg.operation.workspace.open",
    "abg.operation.catalog.bind",
    "abg.operation.catalog.admit",
    "abg.operation.catalog.list",
    "abg.operation.catalog.describe",
    "abg.operation.catalog.allow",
    "abg.operation.catalog.invoke",
    "abg.operation.fh.select",
    "abg.operation.fh.approve",
    "abg.operation.fh.reject",
    "abg.operation.fh.assess",
    "abg.operation.fh.answer-escalation",
    "abg.operation.run.resume",
    "abg.operation.read.result",
    "abg.operation.read.replay"
  ]);
});

test("T-277 projects all operation schemas through one closed projector", () => {
  const projected = projectPublicOperationSchemaDefinitions(
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER
  );
  assert.equal(projected.length, 57);
  assert.equal(Object.isFrozen(projected), true);
  assert.equal(new Set(projected.map(({ contractId }) => contractId)).size, 57);
  assert.equal(new Set(projected.map(({ relativePath }) => relativePath)).size, 57);
  assert.throws(
    () => projectPublicOperationSchemaDefinitions([
      DS1_PUBLIC_OPERATION_DEFINITION_REGISTER[0],
      DS1_PUBLIC_OPERATION_DEFINITION_REGISTER[0]
    ]),
    /duplicate operation/u
  );
  assert.throws(
    () => projectPublicOperationSchemaDefinitions([{
      ...DS1_PUBLIC_OPERATION_DEFINITION_REGISTER[0],
      requestSymbol: ""
    }]),
    /requestSymbol/u
  );
});

test("T-277 retires reconstructed operation and schema rosters", async () => {
  const [
    carriers,
    admission,
    command,
    generator,
    publisher,
    sdkIndex
  ] = await Promise.all([
    source("code/src/app/m04/public_sdk/carriers.ts"),
    source("code/src/app/m04/public_sdk/operation_admission.ts"),
    source("code/src/app/m04/public_cli/command.ts"),
    source("test_env/tools/generate_public_contract_schemas.mjs"),
    source("test_env/tools/publish_abg_product_contracts.mjs"),
    source("code/src/app/m04/public_sdk/index.ts")
  ]);
  assert.doesNotMatch(carriers, /DS1_PUBLIC_OPERATION_IDS\s*=\s*\[/u);
  assert.doesNotMatch(admission, /OPERATION_SLUGS/u);
  assert.doesNotMatch(command, /switch\s*\(input\.operationId\)/u);
  assert.doesNotMatch(generator, /function operationSchemaDefinitions/u);
  assert.doesNotMatch(publisher, /function operationSchemaDefinitions/u);
  assert.doesNotMatch(sdkIndex, /constructDynamicPublicOperationInvocation/u);
});

test("T-277 retains one exact typed SDK dispatch branch per operation", async () => {
  const command = await source("code/src/app/m04/public_cli/command.ts");
  const dispatchStart = command.indexOf("async function invokeSdk");
  const dispatchEnd = command.indexOf("function exitCodeForOutcome", dispatchStart);
  assert.notEqual(dispatchStart, -1);
  assert.notEqual(dispatchEnd, -1);
  const dispatch = command.slice(dispatchStart, dispatchEnd);
  const branchIds = [...dispatch.matchAll(
    /case "(abg\.operation\.[^"]+)":/gu
  )].map((match) => match[1]);
  assert.deepEqual(branchIds, [...DS1_PUBLIC_OPERATION_IDS]);
  for (const definition of DS1_PUBLIC_OPERATION_DEFINITION_REGISTER) {
    assert.match(
      dispatch,
      new RegExp(`input\\.runtime\\.sdk\\.${definition.handlerSymbol}\\(`, "u"),
      definition.operationId
    );
  }
});
