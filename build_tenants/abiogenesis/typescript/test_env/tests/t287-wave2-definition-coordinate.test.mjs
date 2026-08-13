import assert from "node:assert/strict";
import test from "node:test";

import {
  constructExactOperationInvocationCoordinate,
  isExactOperationDefinitionCoordinate,
  isExactOperationInvocationCoordinate,
} from "../../build/code/src/shared/operation_definition_coordinate.js";
import { sha256Canonical } from "../../build/code/src/shared/digests.js";

test("exact definition coordinates preserve the selected intrinsic digest", () => {
  const definition = {
    operationId: "product.install",
    memberKey: "install",
    definitionDigest: sha256Canonical({
      ownerPortCoordinate: "product.installProduct",
      requestContractRef: "contract://abiogenesis/product.install/install/request@5",
      resultContractRef: "contract://abiogenesis/product.install/install/result@5",
    }),
  };
  const invocationPayloadDigest = sha256Canonical({ artifactRef: "artifact://candidate" });
  const coordinate = constructExactOperationInvocationCoordinate(
    definition,
    "invocation://coordinate-proof",
    invocationPayloadDigest,
  );

  assert.equal(isExactOperationDefinitionCoordinate(definition), true);
  assert.equal(isExactOperationDefinitionCoordinate(coordinate), false);
  assert.equal(isExactOperationInvocationCoordinate(coordinate), true);
  assert.equal(coordinate.definitionDigest, definition.definitionDigest);
  assert.equal(coordinate.memberKey, "install");

  assert.equal(isExactOperationInvocationCoordinate({
    ...coordinate,
    memberKey: "another-member",
  }), false);
  assert.equal(isExactOperationDefinitionCoordinate({
    operationId: definition.operationId,
    definitionKey: definition.operationId,
    definitionDigest: definition.definitionDigest,
  }), false);
  assert.equal(isExactOperationDefinitionCoordinate({
    ...definition,
    definitionKey: definition.operationId,
  }), false);
  assert.equal(isExactOperationDefinitionCoordinate({
    ...definition,
    extra: "undeclared",
  }), false);
  assert.equal(isExactOperationInvocationCoordinate({
    ...coordinate,
    definitionKey: coordinate.operationId,
  }), false);
  assert.equal(isExactOperationInvocationCoordinate({
    ...coordinate,
    extra: "undeclared",
  }), false);
});
