// Validates: T-137

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcTargetObligationBinding,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce
} from "../../build/semantic/code/src/index.js";

function queryContext() {
  const module = constructSdlcGtlModule();
  const workspaceRoot = "/workspace/t137";
  const projectConstraints = admitSdlcProjectConstraints({
    projectSlug: "t137",
    activeTenant: "hello_world_rust",
    selectedOutputRoot: "build_tenants/hello_world_rust",
    ambiguityRiskAppetite: "medium",
    capabilityContracts: ["transport_contract"]
  });
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints,
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: t137",
      "  selected_output_root: build_tenants/hello_world_rust",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  hello_world_rust:",
      "    output_dir: build_tenants/hello_world_rust",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject };
}

test("T-137 missing Rust hello-world product files become target pressure", () => {
  const { queryDomain } = queryContext();
  const cargo = deriveSdlcTargetObligationBinding({
    queryDomain,
    targetAssetType: "rust_hello_world_product_files",
    targetAssetRefs: Object.freeze([
      "file://build_tenants/hello_world_rust/Cargo.toml",
      "file://build_tenants/hello_world_rust/src/main.rs"
    ]),
    evidenceRefs: Object.freeze(["fixture://t137/rust-hello-world"])
  });

  assert.equal(cargo.kind, "sdlc_target_obligation_binding");
  assert.equal(cargo.readOnly, true);
  assert.equal(cargo.choosesNextTraversal, false);
  assert.equal(cargo.status, "no_published_action");
  assert.equal(cargo.disposition, "no_action");
  assert.deepEqual(cargo.admissibleGraphFunctionNames, []);
  assert.equal(
    cargo.reasonRefs.includes("target_asset_has_no_published_graph_action"),
    true
  );
});

test("T-137 unpublished narrow action fails closed instead of broad fallback", () => {
  const { queryDomain } = queryContext();
  const staleQueryDomain = {
    ...queryDomain,
    assetOwnership: [
      ...queryDomain.assetOwnership,
      {
        assetType: "rust_cargo_manifest_surface",
        producerGraphFunctions: ["derive_rust_cargo_manifest_surface"]
      }
    ],
    programs: [
      ...queryDomain.programs,
      {
        kind: "sdlc_executive_program_entry",
        name: "broad_release_fallback",
        intent: "broad fallback must not satisfy narrow target",
        steps: ["derive_intent_surface", "derive_product_surface", "derive_code_surface"],
        outputs: ["release_surface"],
        backingGraphFunction: "bootstrap_release_self_test"
      }
    ]
  };
  const binding = deriveSdlcTargetObligationBinding({
    queryDomain: staleQueryDomain,
    targetAssetType: "rust_cargo_manifest_surface"
  });

  assert.equal(binding.status, "stale_action_publication");
  assert.equal(binding.disposition, "stale_query_domain");
  assert.deepEqual(binding.admissibleGraphFunctionNames, []);
  assert.equal(
    binding.publishedActionRefs.some((ref) => ref.includes("bootstrap_release_self_test")),
    false
  );
});

test("T-137 published target action is eligible only when bound to target asset", () => {
  const { queryDomain } = queryContext();
  const binding = deriveSdlcTargetObligationBinding({
    queryDomain,
    targetAssetType: "component_code_surface"
  });

  assert.equal(binding.status, "eligible");
  assert.equal(binding.disposition, "published_action_eligible");
  assert.deepEqual(binding.admissibleGraphFunctionNames, [
    "Fg_materialize_declared_product_asset",
    "derive_component_code_surface"
  ]);
  assert.equal(
    binding.publishedActionRefs.includes(
      "published-action://odd-sdlc/graph-function/Fg_materialize_declared_product_asset"
    ),
    true
  );
  assert.equal(
    binding.publishedActionRefs.includes(
      "published-action://odd-sdlc/graph-function/derive_component_code_surface"
    ),
    true
  );
  assert.equal(
    binding.admissibleGraphFunctionNames.includes("bootstrap_release_self_test"),
    false
  );
});

test("T-137 public start targets published action rather than broad executive", () => {
  const { module, queryDomain, conformedProject } = queryContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: "/workspace/t137",
      target: { kind: "asset", handle: "release_surface" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });

  assert.equal(outcome.kind, "sdlc_public_start_projected");
  assert.equal(outcome.executionContract.targetGraphFunction, "prepare_release_surface");
  assert.notEqual(outcome.executionContract.targetGraphFunction, "bootstrap_release_self_test");
});

test("T-137 public start blocks unpublished product-file target with no broad fallback", () => {
  const { module, queryDomain, conformedProject } = queryContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: "/workspace/t137",
      target: { kind: "asset", handle: "rust_hello_world_product_files" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "target_unavailable");
  assert.equal(outcome.executionContract, null);
});
