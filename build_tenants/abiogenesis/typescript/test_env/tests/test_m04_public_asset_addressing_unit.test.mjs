// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitOperatorAssetQueryContract,
  admitPublicAssetAddressingRequest,
  resolvePublicAssetTargetFromRequest
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  operatorAssetContractPayload,
  publicAssetAddressingPayload
} from "./support/asset-addressing-fixtures.mjs";
import { emptyModule } from "./support/m04-fixtures.mjs";

test("M04 public asset addressing unit: admitted request preserves explicit asset target truth", () => {
  const request = admitPublicAssetAddressingRequest(
    publicAssetAddressingPayload("code_surface")
  );

  assert.equal(request.target.kind, "asset");
  assert.equal(request.target.handle, "code_surface");
});

test("M04 public asset addressing unit: admitted contract preserves canonical default registry keys", () => {
  const contract = admitOperatorAssetQueryContract(
    operatorAssetContractPayload({
      command: ["node", "operator-asset-query.mjs"]
    })
  );

  assert.deepStrictEqual(contract.command, ["node", "operator-asset-query.mjs"]);
  assert.equal(contract.assetsKey, "assets");
  assert.equal(contract.handleKey, "asset_id");
  assert.equal(contract.ownerKindKey, "operator_target.kind");
  assert.equal(contract.bindingSource, "runtime_config.operator_asset_contract");
});

test("M04 public asset addressing unit: missing explicit operator asset contract stays rejected", async () => {
  const request = admitPublicAssetAddressingRequest(
    publicAssetAddressingPayload("code_surface")
  );

  const outcome = await resolvePublicAssetTargetFromRequest(request, {
    module: emptyModule(),
    workspaceRoot: "/workspace/demo",
    operatorAssetContract: null
  });

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    reason: "public asset resolution requires an explicit operator asset contract"
  });
});
