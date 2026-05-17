// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitOperatorAssetQueryContract,
  publicStart,
  resolvePublicAssetTarget
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  assetAddressingStartContext,
  operatorAssetContractPayload,
  operatorAssetRegistryPayload,
  publicAssetAddressingPayload,
  registryRunnerFromPayload
} from "./support/asset-addressing-fixtures.mjs";

test("M04 public asset addressing integration: package export surface stays aligned at root, m04, and asset-addressing subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const assetAddressingModule = await import(
    "@abiogenesis/typescript-tenant/app/m04/asset-addressing"
  );

  assert.equal(root.resolvePublicAssetTarget, resolvePublicAssetTarget);
  assert.equal(m04.resolvePublicAssetTarget, resolvePublicAssetTarget);
  assert.equal(assetAddressingModule.resolvePublicAssetTarget, resolvePublicAssetTarget);
});

test("M04 public asset addressing integration: explicit registry resolves one published asset target over one governing graph-function owner", async () => {
  const { module, codeProfile } = assetAddressingStartContext();
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
          metadata: {
            relative_path: "build/code.py"
          },
          checkpoint: {
            path_kind: "file",
            exists: true
          },
          operator_target: {
            kind: "graph_function",
            handle: "code_flow"
          }
        }
      ])
    )
  );

  assert.deepStrictEqual(outcome, {
    kind: "resolved",
    target: {
      publicRef: "asset:code_surface",
      assetHandle: "code_surface",
      assetId: "code_surface",
      assetUri: "file://build/code",
      assetRelativePath: "build/code.py",
      assetPathKind: "file",
      assetExists: true,
      bindingSource: "runtime_config.operator_asset_contract",
      ownerKind: "graph_function",
      ownerHandle: "code_flow",
      ownerTargetId: codeProfile.id
    }
  });
});

test("M04 public asset addressing integration: resolved asset ownership drives the existing public-start chain without widening M03", async () => {
  const { module, codeProfile, publicStartContext, publicStartInput } =
    assetAddressingStartContext();
  const contract = admitOperatorAssetQueryContract(
    operatorAssetContractPayload()
  );

  const resolved = await resolvePublicAssetTarget(
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
        }
      ])
    )
  );

  assert.equal(resolved.kind, "resolved");

  const events = [];
  const outcome = publicStart(
    publicStartInput(resolved.target.ownerHandle),
    publicStartContext,
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.terminalKind, "converged");
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fd_authority_outcome_admitted",
    "vector_evaluated",
    "vector_closed",
    "fd_advance_ready",
    "terminal_reached"
  ]);
  assert.deepStrictEqual(events[0], {
    kind: "basis_admitted",
    basisId: events[0].basisId,
    graphFunctionId: codeProfile.id,
    jobId: "job-m04-asset-code",
    resolvedRuntimeRef: "runtime://typescript/node",
    resolvedPolicyBundleRef: "policy://public-fd",
    runId: "run://m04-asset-addressing",
    workKey: "wk://m04-asset-addressing"
  });
});
