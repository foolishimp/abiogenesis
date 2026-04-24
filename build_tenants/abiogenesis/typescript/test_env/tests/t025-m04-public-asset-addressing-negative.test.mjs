import test from "node:test";
import assert from "node:assert/strict";

import {
  admitOperatorAssetQueryContract,
  admitPublicAssetAddressingRequest,
  resolvePublicAssetTarget
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  assetAddressingStartContext,
  operatorAssetContractPayload,
  operatorAssetRegistryPayload,
  publicAssetAddressingPayload,
  registryRunnerFromPayload
} from "./support/asset-addressing-fixtures.mjs";

test("T-025 negative proof: public asset addressing rejects non-asset target kinds at ingress", () => {
  assert.throws(
    () =>
      admitPublicAssetAddressingRequest({
        target: {
          kind: "graph_function",
          handle: "code_flow"
        }
      }),
    /expected "asset"/i
  );
});

test("T-025 negative proof: public asset addressing rejects empty registry command contracts at ingress", () => {
  assert.throws(
    () =>
      admitOperatorAssetQueryContract({
        command: []
      }),
    /command/i
  );
});

test("T-025 negative proof: ambiguous asset ownership fails closed", async () => {
  const { module } = assetAddressingStartContext();
  const contract = admitOperatorAssetQueryContract(
    operatorAssetContractPayload()
  );

  const outcome = await resolvePublicAssetTarget(
    publicAssetAddressingPayload("code_surface"),
    {
      module,
      workspaceRoot: "/workspace/demo",
      operatorAssetContract: contract
    },
    registryRunnerFromPayload(
      operatorAssetRegistryPayload([
        {
          asset_id: "code_surface",
          uri: "file://build/code",
          operator_target: {
            kind: "graph_function",
            handle: "code_flow"
          }
        },
        {
          asset_id: "code_surface",
          uri: "file://build/code-v2",
          operator_target: {
            kind: "graph_function",
            handle: "review_flow"
          }
        }
      ])
    )
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    reason: "operator asset query publishes ambiguous asset handle \"code_surface\""
  });
});

test("T-025 negative proof: unknown published asset handles fail closed", async () => {
  const { module } = assetAddressingStartContext();
  const contract = admitOperatorAssetQueryContract(
    operatorAssetContractPayload()
  );

  const outcome = await resolvePublicAssetTarget(
    publicAssetAddressingPayload("missing_surface"),
    {
      module,
      workspaceRoot: "/workspace/demo",
      operatorAssetContract: contract
    },
    registryRunnerFromPayload(
      operatorAssetRegistryPayload([
        {
          asset_id: "code_surface",
          uri: "file://build/code",
          operator_target: {
            kind: "graph_function",
            handle: "code_flow"
          }
        }
      ])
    )
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    reason: "unknown published asset handle \"missing_surface\""
  });
});

test("T-025 negative proof: asset entries without governing graph-function ownership fail closed", async () => {
  const { module } = assetAddressingStartContext();
  const contract = admitOperatorAssetQueryContract(
    operatorAssetContractPayload()
  );

  const outcome = await resolvePublicAssetTarget(
    publicAssetAddressingPayload("code_surface"),
    {
      module,
      workspaceRoot: "/workspace/demo",
      operatorAssetContract: contract
    },
    registryRunnerFromPayload(
      operatorAssetRegistryPayload([
        {
          asset_id: "code_surface",
          uri: "file://build/code"
        }
      ])
    )
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    reason:
      "operator asset handle \"code_surface\" must publish operator_target.kind=\"graph_function\""
  });
});
