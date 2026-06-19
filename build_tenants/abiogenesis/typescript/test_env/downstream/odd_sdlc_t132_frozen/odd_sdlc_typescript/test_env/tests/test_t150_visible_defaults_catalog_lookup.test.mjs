// Validates: T-150

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorClosedEvent,
  constructVectorTraversalPlannedEvent
} from "@abiogenesis/typescript-tenant";

import {
  admitSdlcProjectConstraints,
  constructSdlcDomainDefaultsCarrier,
  constructSdlcGtlModule,
  deriveSdlcGapDossier,
  deriveSdlcWorkspaceIngressReport,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  invokeOddSdlcSpecMethodCommandSync,
  projectSdlcQueryDomain
} from "../../build/semantic/code/src/index.js";

function moduleBasis(handle = "bootstrap_release_self_test") {
  const module = constructSdlcGtlModule();
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t150",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t150/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t150",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t150",
    workKey: "wk://odd-sdlc/t150",
    frameId: null,
    frameLineageId: null
  });
}

function ingressReport() {
  return deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t150",
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t150",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["query-domain"]
    }),
    sourceInputs: []
  });
}

function eventsAfterFirstVector(basis) {
  return Object.freeze([
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 }),
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "advanced" })
  ]);
}

function customPrioritySchemeFor(basis) {
  const vector = basis.graph.vectors[1];
  assert(vector);
  return constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://t150/custom",
    sourcePolicyRef: "policy://t150/custom",
    rules: Object.freeze([
      constructConstructionPriorityRule({
        priorityRuleRef: "priority-rule://t150/custom",
        axis: "gap_repair",
        weight: 1000,
        appliesToActionKinds: Object.freeze(["continue_graph_call"]),
        appliesToOutcomeRefs: Object.freeze([
          `outcome://odd-sdlc/${basis.graphFunction.name}/${vector.target.id}`
        ]),
        sourcePolicyRef: "policy://t150/custom",
        strategyLabel: "t150_custom_priority"
      })
    ])
  });
}

function makeConformantWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t150-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-150 Fixture", "", "REQ-T150-001: Use published catalog refs."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    ["# Goals", "", "GOAL-T150-001: Exercise catalog lookup discipline."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "**Project**: T-150 Fixture"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    ["# Product", "", "PRODUCT-T150-001: T-150 fixture product surface."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    ["# Imported Sources", "", "- README.md", "- specification/INTENT.md"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t150_fixture",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    ["# Project Bootstrap", "", "Source package: T-150 fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    ["# Tenant Registry", "", "- typescript: build_tenants/typescript"].join("\n"),
    "utf8"
  );
  return root;
}

function writeArchiveNextAction(workspace, nextGraphFunctionRef) {
  const archiveRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs",
    "20260511T015000000Z_pid150"
  );
  mkdirSync(archiveRoot, { recursive: true });
  const decisionRef = "closure-decision://t150/post-close";
  writeFileSync(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_edge_closure_decision",
        decisionRef,
        disposition: "close"
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(
    path.join(archiveRoot, "sdlc_next_action_projection.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_next_action_projection",
        choosesNextTraversal: true,
        selectedActionRef: "construction-action://t150/materialize",
        nextActionProjectionRef:
          "construction-priority-projection://t150/post-close/materialize",
        nextGraphFunctionRef,
        nextGraphVectorRef: "vector:odd_sdlc:Fg_materialize_declared_product_asset",
        predecessorRefs: [decisionRef]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

test("T-150 query-domain publishes a versioned odd_sdlc domain defaults carrier", () => {
  const projection = projectSdlcQueryDomain({
    module: constructSdlcGtlModule(),
    ingressReport: ingressReport()
  });
  const defaults = constructSdlcDomainDefaultsCarrier();

  assert.deepEqual(projection.domainDefaults, defaults);
  assert.equal(defaults.kind, "odd_sdlc_domain_defaults");
  assert.equal(defaults.defaultsVersion, "ts-domain-defaults-v1");
  assert.match(defaults.carrierRef, /^domain-defaults:\/\/odd-sdlc\//u);
  assert.match(defaults.digest, /^sha256:[a-f0-9]{64}$/u);
  assert.match(defaults.digestRef, /\/digest\/[a-f0-9]{64}$/u);
  assert.equal(defaults.substrateBoundary, "odd_sdlc_domain_policy_not_abg_defaults");
  assert.equal(defaults.carrierRef.includes("abg_defaults"), false);
});

test("T-150 public gap default ranking cites the domain defaults carrier", () => {
  const basis = moduleBasis();
  const defaults = constructSdlcDomainDefaultsCarrier();
  const dossier = deriveSdlcGapDossier({
    basis,
    events: eventsAfterFirstVector(basis),
    triageInput: "t150-default-visible",
    evidenceRefs: ["event://t150/vector-0-closed"],
    domainDefaults: defaults
  });

  assert(dossier.evidenceRefs.includes(defaults.carrierRef));
  assert(dossier.evidenceRefs.includes(defaults.digestRef));
  assert(
    dossier.rankingReasonRefs.some((ref) =>
      ref.startsWith(defaults.defaultGapPriorityPolicyRef)
    )
  );
  assert.equal(dossier.prioritySchemeRef?.startsWith(defaults.defaultGapPrioritySchemeRef), true);
});

test("T-150 explicit priority schemes do not silently inherit domain defaults", () => {
  const basis = moduleBasis();
  const defaults = constructSdlcDomainDefaultsCarrier();
  const dossier = deriveSdlcGapDossier({
    basis,
    events: eventsAfterFirstVector(basis),
    triageInput: "t150-custom-priority",
    evidenceRefs: ["event://t150/vector-0-closed"],
    domainDefaults: defaults,
    priorityScheme: customPrioritySchemeFor(basis)
  });

  assert.equal(dossier.evidenceRefs.includes(defaults.carrierRef), false);
  assert.equal(dossier.evidenceRefs.includes(defaults.digestRef), false);
  assert.equal(dossier.prioritySchemeRef, "priority-scheme://t150/custom");
  assert(dossier.rankingReasonRefs.includes("priority-rule://t150/custom"));
});

test("T-150 archive next-action lookup requires a published catalog ref", () => {
  const workspace = makeConformantWorkspace();
  writeArchiveNextAction(
    workspace,
    `unpublished-suffix-only:${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
  );

  const result = invokeOddSdlcSpecMethodCommandSync([
    "gaps",
    "--workspace",
    workspace
  ]);

  assert.equal(result.status, "ok");
  assert.equal(result.payload.blockingReason, "unknown_graph_function_boundary_ref");
  assert(
    result.payload.blockingReasonCarriers.some(
      (reason) => reason.code === "unknown_graph_function_boundary_ref"
    ),
    JSON.stringify(result.payload, null, 2)
  );
});
