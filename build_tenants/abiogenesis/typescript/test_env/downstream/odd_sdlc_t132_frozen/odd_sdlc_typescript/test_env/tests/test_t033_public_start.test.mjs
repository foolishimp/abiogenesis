// Validates: REQ-F-ODDSDLC-003
// Validates: REQ-F-ODDSDLC-021
// Validates: REQ-F-ODDSDLC-029
// Investigates: T-033
// Investigates: T-044

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  SDLC_PUBLIC_START_TARGET_POLICY
} from "../../build/semantic/code/src/index.js";

function startContext() {
  const module = constructSdlcGtlModule();
  const workspaceRoot = "/workspace/t033";
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: `file://${workspaceRoot}`,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t033",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["transport_contract"]
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText: [
      "project:",
      "  name: t033",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject };
}

test("T-033 public start admits closed request grammar", () => {
  const request = admitSdlcPublicStartRequest({
    workspaceRoot: "/workspace/t033",
    target: { kind: "graph_function", handle: "bootstrap_release_self_test" },
    until: "blocked",
    defaultRegime: "F_P"
  });

  assert.equal(request.kind, "sdlc_public_start_request");
  assert.equal(request.target.kind, "graph_function");
  assert.throws(
    () =>
      admitSdlcPublicStartRequest({
        workspaceRoot: "/workspace/t033",
        target: { kind: "graph_function", handle: "bootstrap_release_self_test" },
        until: "forever",
        defaultRegime: "F_P"
      }),
    /until/
  );
});

test("T-057 public start target resolution policy is declared data", () => {
  assert.deepStrictEqual(
    SDLC_PUBLIC_START_TARGET_POLICY.map((entry) => [
      entry.targetKind,
      entry.resolver
    ]),
    [
      ["next", "published_start_targets"],
      ["graph_function", "named_graph_function"],
      ["asset", "asset_published_action"],
      ["overlay", "overlay_catalog_binding"]
    ]
  );
});

test("T-033 F_P public start blocks on unattached worker after execution contract admission", () => {
  const { module, queryDomain, conformedProject } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: "/workspace/t033",
      target: { kind: "graph_function", handle: "bootstrap_release_self_test" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({ transportContract: null })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "fp_worker_unattached");
  assert.equal(outcome.stopPredicate, "worker_attachment_required");
  assert(outcome.executionContract);
  assert.equal(outcome.executionContract.targetGraphFunction, "bootstrap_release_self_test");
  assert.equal(outcome.executionContract.conformedProject.activeTenant, "typescript");
  assert.deepStrictEqual(outcome.emittedRuntimeEventKinds, []);
});

test("T-033 attached public start projects one ABI handoff without iterating internally", () => {
  const { module, queryDomain, conformedProject } = startContext();
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: "/workspace/t033",
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
  assert.equal(outcome.status, "dispatch_required");
  assert.equal(outcome.executionContract.targetGraphFunction, "prepare_release_surface");
  assert.equal(outcome.transition.kind, "fp_dispatch");
  assert.equal(outcome.transition.vectorIndex, 0);
  assert.deepStrictEqual(outcome.emittedRuntimeEventKinds, []);
});

test("T-044 worker attachment rejects empty transport contracts", () => {
  assert.throws(
    () => projectSdlcWorkerAttachment({ transportContract: "" }),
    /transportContract/
  );
  assert.throws(
    () => projectSdlcWorkerAttachment({ transportContract: "   " }),
    /transportContract/
  );

  const attached = projectSdlcWorkerAttachment({
    transportContract: "  transport://trimmed-worker  "
  });
  assert.equal(attached.status, "attached");
  assert.equal(attached.transportContract, "transport://trimmed-worker");
});

test("T-033 stale query-domain target blocks instead of throwing during ABI admission", () => {
  const { module, queryDomain, conformedProject } = startContext();
  const staleModule = {
    ...module,
    graphFunctions: module.graphFunctions.filter(
      (graphFunction) => graphFunction.name !== "bootstrap_release_self_test"
    )
  };
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: "/workspace/t033",
      target: { kind: "graph_function", handle: "bootstrap_release_self_test" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module: staleModule,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "stale_query_domain");
  assert.equal(outcome.executionContract, null);
});

test("T-033 stale asset ownership projection also blocks as stale query-domain", () => {
  const { module, queryDomain, conformedProject } = startContext();
  const staleQueryDomain = {
    ...queryDomain,
    assetOwnership: [
      {
        assetType: "fake_surface",
        producerGraphFunctions: ["missing_leaf_function"]
      }
    ],
    programs: [
      {
        kind: "sdlc_executive_program_entry",
        name: "fake_program",
        intent: "fake",
        steps: ["missing_leaf_function"],
        outputs: ["fake_surface"],
        backingGraphFunction: "missing_executive"
      }
    ]
  };
  const outcome = publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: "/workspace/t033",
      target: { kind: "asset", handle: "fake_surface" },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain: staleQueryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });

  assert.equal(outcome.kind, "sdlc_public_start_blocked");
  assert.equal(outcome.blockingReason, "stale_query_domain");
});

test("T-033 public start source has no recursive or loop-owned traversal path", () => {
  const source = readFileSync(
    new URL("../../code/src/start/public_start.ts", import.meta.url),
    "utf8"
  );
  const body = source.slice(source.indexOf("export function publicStartOnce"));

  assert.equal([...body.matchAll(/\bpublicStartOnce\s*\(/g)].length, 1);
  assert.equal(/\bfor\s*\(|\bwhile\s*\(/.test(body), false);
  assert.equal(body.includes("selectedNextGraphFunction"), false);
  assert.equal(body.includes("nextTraversal"), false);
});
