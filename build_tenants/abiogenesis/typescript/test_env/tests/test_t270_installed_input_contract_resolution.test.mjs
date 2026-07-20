import assert from "node:assert/strict";
import test from "node:test";

import {
  exactInstalledGraphFunctionInputContract
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const PRODUCT_ID = "abiogenesis";
const CONTRACT_ID =
  "abg.contract.operation.workspace.create.clean.request";
const SCHEMA_ID = "abg.schema.operation.workspace.create.clean.request";
const ASSET_PATH =
  "contracts/schemas/operations/workspace.create/clean/request.schema.json";
const SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  properties: Object.freeze({
    targetRoot: Object.freeze({ type: "string" }),
    createPolicy: Object.freeze({ const: "clean" }),
    scaffoldPolicy: Object.freeze({ const: "no_scaffold" })
  }),
  required: Object.freeze(["targetRoot", "createPolicy", "scaffoldPolicy"])
});
const DIGEST = stableSha256Digest(SCHEMA);
const REQUEST_COORDINATE = Object.freeze({
  contractId: CONTRACT_ID,
  contractVersion: "5.0.0",
  contractDigest: DIGEST,
  schemaId: SCHEMA_ID,
  schemaVersion: "5.0.0",
  schemaDigest: DIGEST,
  assetLocator: Object.freeze({
    kind: "asset",
    relativePath: ASSET_PATH,
    mediaType: "application/schema+json",
    schemaId: SCHEMA_ID,
    schemaVersion: "5.0.0",
    digest: DIGEST
  })
});

function nestedRow(request = REQUEST_COORDINATE) {
  return Object.freeze({
    contractId: "abg.operation.workspace.create",
    contractKind: "operation",
    owningProductId: PRODUCT_ID,
    operationContract: Object.freeze({
      definitions: Object.freeze([Object.freeze({
        schemaCoordinates: Object.freeze({
          request,
          result: REQUEST_COORDINATE,
          refusal: REQUEST_COORDINATE,
          nonterminal: null
        })
      })])
    })
  });
}

function topLevelRow() {
  return Object.freeze({
    contractId: CONTRACT_ID,
    contractKind: "schema_asset",
    owningProductId: PRODUCT_ID,
    version: "5.0.0",
    digest: DIGEST,
    assetLocator: REQUEST_COORDINATE.assetLocator,
    operationContract: null
  });
}

function manifest(rows, locators = [ASSET_PATH]) {
  return Object.freeze({
    productId: PRODUCT_ID,
    productRelativeLocators: Object.freeze(locators),
    publicContractCatalog: Object.freeze({ rows: Object.freeze(rows) })
  });
}

const ENTRY = Object.freeze({ sourceContractRef: CONTRACT_ID });

test("T-270 resolves one exact nested published request schema without a second row", () => {
  const result = exactInstalledGraphFunctionInputContract({
    manifest: manifest([nestedRow()]),
    entry: ENTRY
  });
  assert.equal(result.coordinate.contractId, CONTRACT_ID);
  assert.equal(result.coordinate.contractDigest, DIGEST);
  assert.equal(result.assetRelativePath, ASSET_PATH);

  assert.throws(
    () => exactInstalledGraphFunctionInputContract({
      manifest: manifest([nestedRow(), topLevelRow()]),
      entry: ENTRY
    }),
    /not exactly installed/u
  );
  assert.throws(
    () => exactInstalledGraphFunctionInputContract({
      manifest: manifest([nestedRow()], []),
      entry: ENTRY
    }),
    /not exactly installed/u
  );
  assert.throws(
    () => exactInstalledGraphFunctionInputContract({
      manifest: manifest([nestedRow(Object.freeze({
        ...REQUEST_COORDINATE,
        contractDigest: stableSha256Digest({ malformed: true })
      }))]),
      entry: ENTRY
    }),
    /not exactly installed/u
  );
});
