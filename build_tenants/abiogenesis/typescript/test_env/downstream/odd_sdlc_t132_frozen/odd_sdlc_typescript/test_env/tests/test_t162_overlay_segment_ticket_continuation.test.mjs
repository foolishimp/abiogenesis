// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  admitSdlcTicketExecutionContract,
  assertTraversalIntentPackagePressure,
  conformProjectProfileFromConstraintsText,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  deriveWorkerHandoffManifest,
  deriveSdlcWorkspaceIngressReport,
  hookContractByEdgeName,
  projectSdlcQueryDomain,
  projectSdlcTicketWorkflow,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  sdlcTicketExecutionContractRefs
} from "../../build/semantic/code/src/index.js";

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-overlay-"));
  mkdirSync(join(root, ".ai-workspace", "tickets", "active"), {
    recursive: true
  });
  return root;
}

function conformedProject(root) {
  return conformProjectProfileFromConstraintsText({
    workspaceRoot: root,
    constraintsText: [
      "project:",
      "  name: t162",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
}

function queryContext(root) {
  const module = constructSdlcGtlModule();
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(root).href,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t162",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["transport_contract"]
    }),
    sourceInputs: []
  });
  return Object.freeze({
    module,
    queryDomain: projectSdlcQueryDomain({ module, ingressReport }),
    conformedProject: conformedProject(root)
  });
}

function startTicket(root, ticketId) {
  const context = queryContext(root);
  return publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: root,
      target: { kind: "asset", handle: `ticket/${ticketId}` },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module: context.module,
    queryDomain: context.queryDomain,
    conformedProject: context.conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });
}

test("T-162 overlay segment residual pressure admits as ticket continuation and handoff context", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-162.md"),
    `---
id: T-162
title: Overlay continuation ticket
type: feature
ticket_category: implementation
status: active
goal: governed-work
change_intent: preserve overlay residual pressure
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: overlay residual pressure becomes ticket intake
closure_law: continuation must be ruled before product convergence
evaluation_criteria:
  - continuation proof
non_closure_conditions:
  - productConverged false without ticket row
source_documents:
  - specification/PRODUCT.md
source_overlay_segment_completion_ref: sdlc-overlay-segment-completion://run/final
terminal_graph_function_refs:
  - graph-function://odd-sdlc/final_code_review
terminal_asset_refs:
  - asset://odd-sdlc/review-report
remaining_graph_pressure_refs:
  - pressure://graph/current-full-traversal
remaining_requirement_pressure_refs:
  - pressure://requirement/T-162
remaining_asset_pressure_refs:
  - pressure://asset/review
next_eligible_overlay_refs:
  - overlay://odd-sdlc/current-full-traversal
overlay_continuation_ruling: depth_traversal
overlay_continuation_proof_expectation: route through ticket start
---

# T-162
`,
    "utf8"
  );

  const contract = admitSdlcTicketExecutionContract({
    workflow: projectSdlcTicketWorkflow({ workspaceRoot: root }),
    ticketId: "T-162"
  });
  const continuation = contract.overlayContinuationRows[0];
  assert.equal(continuation.productConverged, false);
  assert.equal(
    continuation.selectedStartTargetRef,
    "overlay://odd-sdlc/current-full-traversal"
  );
  assert.deepStrictEqual(continuation.remainingGraphPressureRefs, [
    "pressure://graph/current-full-traversal"
  ]);
  assert.deepStrictEqual(contract.overlayContinuationRefs, [
    continuation.continuationRef
  ]);

  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: root,
    ticketExecutionContract: contract,
    graphFunctionName: "route_ticket_work_item",
    edgeName: "route_ticket_work_item",
    vectorIndex: 0,
    contract: hookContractByEdgeName("route_ticket_work_item"),
    conformedProject: conformedProject(root),
    runId: "t162-ticket-handoff"
  });
  assert.equal(manifest.ticketExecutionContract?.ticketId, "T-162");
  assert.equal(
    manifest.traversalIntentPackage.ticketExecutionContract?.executionContractRef,
    contract.executionContractRef
  );
  assertTraversalIntentPackagePressure(manifest);
});

test("T-162 final-node overlay continuation starts current-full traversal and preserves refs", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-400.md"),
    `---
id: T-400
title: Final-node code-review continuation ticket
type: feature
ticket_category: code_review_triage
status: active
goal: final-node-current-full-reentry
change_intent: preserve overlay segment pressure and re-enter current-full traversal through admitted ticket authority
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: final-node triage pressure re-enters current-full traversal through admitted ABG public start
closure_law: continuation closes only when refs are visible in start, next-action, handoff, ledger, and archive truth
evaluation_criteria:
  - current-full traversal selected
  - ticket refs preserved
non_closure_conditions:
  - local SDLC loop performs re-entry
source_documents:
  - specification/PRODUCT.md
source_overlay_segment_completion_ref: sdlc-overlay-segment-completion://run/final-node
terminal_graph_function_refs:
  - graph-function://odd-sdlc/final_code_review
terminal_asset_refs:
  - asset://odd-sdlc/review-report
remaining_graph_pressure_refs:
  - pressure://graph/current-full-traversal
remaining_requirement_pressure_refs:
  - pressure://requirement/T-162/final-node
remaining_asset_pressure_refs:
  - pressure://asset/final-review
next_eligible_overlay_refs:
  - overlay://odd-sdlc/current-full-traversal
overlay_continuation_ruling: repair
overlay_continuation_proof_expectation: route final-node pressure through admitted current-full public start
---

# T-400
`,
    "utf8"
  );

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const contract = admitSdlcTicketExecutionContract({
    workflow,
    ticketId: "T-400"
  });
  const continuation = contract.overlayContinuationRows[0];
  const ticketRefs = sdlcTicketExecutionContractRefs(contract);

  const start = startTicket(root, "T-400");
  assert.equal(start.kind, "sdlc_public_start_projected");
  assert.equal(start.executionContract.targetGraphFunction, "derive_intent_surface");
  assert.equal(start.executionContract.overlayRef, SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  assert.equal(
    start.executionContract.ticketExecutionContract?.executionContractRef,
    contract.executionContractRef
  );
  assert(start.executionContract.nextActionProjection.policyRefs.includes(contract.executionContractRef));
  assert(start.executionContract.nextActionProjection.policyRefs.includes(continuation.continuationRef));
  assert.equal(
    start.executionContract.overlayBinding.selection.selectedStartTargetRef,
    "derive_intent_surface"
  );

  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: root,
    ticketExecutionContract: contract,
    overlayRef: start.executionContract.overlayRef,
    overlayBindingRef: start.executionContract.overlayBindingRef,
    graphCatalogDigestRef:
      start.executionContract.overlayBinding.graphCatalogDigestRef,
    graphFunctionName: start.executionContract.targetGraphFunction,
    edgeName: start.executionContract.targetGraphFunction,
    vectorIndex: 0,
    contract: hookContractByEdgeName(start.executionContract.targetGraphFunction),
    conformedProject: conformedProject(root),
    runId: "t162-final-node-current-full"
  });
  mkdirSync(manifest.archiveRoot, { recursive: true });
  const archivedManifestPath = join(manifest.archiveRoot, "handoff_manifest.json");
  writeFileSync(archivedManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const archivedManifest = JSON.parse(readFileSync(archivedManifestPath, "utf8"));
  assert.equal(
    archivedManifest.ticketExecutionContract.executionContractRef,
    contract.executionContractRef
  );
  assert.equal(
    archivedManifest.traversalIntentPackage.ticketExecutionContract.executionContractRef,
    contract.executionContractRef
  );
  assert.deepStrictEqual(
    archivedManifest.ticketExecutionContract.overlayContinuationRefs,
    [continuation.continuationRef]
  );

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition:
      start.executionContract.nextActionProjection.selectedComposition,
    ledgerRef: "ledger://odd-sdlc/t162/final-node/current-full",
    ledgerVersionRef: "ledger-version://odd-sdlc/t162/final-node/current-full/1",
    overlayRef: start.executionContract.overlayRef,
    overlayBindingRef: start.executionContract.overlayBindingRef,
    graphCatalogDigestRef:
      start.executionContract.overlayBinding.graphCatalogDigestRef,
    edgeRef: "edge://odd-sdlc/t162/final-node/current-full/0",
    attemptRef: "attempt://odd-sdlc/t162/final-node/current-full/0",
    targetBindingRefs:
      start.executionContract.nextActionProjection.targetBindingRefs,
    evidenceBundleRefs: ["evidence://odd-sdlc/t162/final-node/current-full"],
    admissionRefs: ticketRefs,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    predecessorRefs: [
      contract.executionContractRef,
      continuation.continuationRef,
      continuation.sourceSegmentCompletionRef,
      ...continuation.remainingGraphPressureRefs,
      ...continuation.remainingRequirementPressureRefs,
      ...continuation.remainingAssetPressureRefs
    ]
  });
  assert(ledger.admissionRefs.includes(contract.executionContractRef));
  assert(ledger.admissionRefs.includes(continuation.continuationRef));
  assert(ledger.predecessorRefs.includes(continuation.sourceSegmentCompletionRef));
  assert(ledger.predecessorRefs.includes("pressure://graph/current-full-traversal"));
  assert(ledger.predecessorRefs.includes("pressure://requirement/T-162/final-node"));
});

test("T-162 overlay continuation blocks when remaining pressure is unruled", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-300.md"),
    `---
id: T-300
title: Unruled overlay continuation
type: feature
ticket_category: implementation
status: active
goal: governed-work
change_intent: preserve overlay residual pressure
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: overlay residual pressure becomes ticket intake
closure_law: continuation must be ruled before product convergence
evaluation_criteria:
  - continuation proof
non_closure_conditions:
  - productConverged false without ticket row
source_documents:
  - specification/PRODUCT.md
source_overlay_segment_completion_ref: sdlc-overlay-segment-completion://run/final
remaining_graph_pressure_refs:
  - pressure://graph/current-full-traversal
next_eligible_overlay_refs:
  - overlay://odd-sdlc/current-full-traversal
---

# T-300
`,
    "utf8"
  );
  assert.throws(
    () =>
      admitSdlcTicketExecutionContract({
        workflow: projectSdlcTicketWorkflow({ workspaceRoot: root }),
        ticketId: "T-300"
      }),
    /unadmitted/
  );
});
