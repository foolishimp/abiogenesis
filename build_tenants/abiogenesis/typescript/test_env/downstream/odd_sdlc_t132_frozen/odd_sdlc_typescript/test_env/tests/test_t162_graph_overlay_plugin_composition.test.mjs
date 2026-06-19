// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";

import {
  hookContractByEdgeName,
  SDLC_TICKET_WORKFLOW_FD_RULE_REF
} from "../../build/semantic/code/src/index.js";
import { createSdlcAbgPluginSet } from "../../build/semantic/code/src/operator/plugins/plugin_set.js";

test("T-162 ticket workflow is a graph-function hook with F_D validation composed before F_P construction", () => {
  const contract = hookContractByEdgeName("route_ticket_work_item");

  assert.equal(contract.edgeName, "route_ticket_work_item");
  assert.equal(contract.targetAssetType, "ticket_work_item_route_surface");
  assert.deepStrictEqual(contract.transformProfile.preflightFd, [
    "ticket-workflow-authority-projection-fd",
    "ticket-execution-contract-admitted-fd",
    "ticket-review-ruling-table-fd"
  ]);
  assert.equal(
    contract.transformProfile.constructiveFp,
    "fp://odd-sdlc/ticket-workflow/route-ticket-work-item"
  );
  assert.deepStrictEqual(contract.transformProfile.capabilityFd, [
    "ticket-workflow-output-contract-fd"
  ]);
  assert.deepStrictEqual(contract.transformProfile.postflightFd, [
    "ticket-work-item-route-surface-fd",
    "ticket-continuation-pressure-preserved-fd"
  ]);
  assert.equal(contract.closurePolicy.nextTraversalSelectionAuthority, "abg_runtime");
  assert.equal(contract.closurePolicy.maySelectNextTraversal, false);
});

test("T-162 ABG plugin set includes required deterministic ticket-workflow F_D rule", () => {
  const plugins = createSdlcAbgPluginSet({
    dispatch: async () => {
      throw new Error("not invoked");
    },
    evaluateFp: async () => {
      throw new Error("not invoked");
    },
    projectConsequence: () => {
      throw new Error("not invoked");
    },
    evaluateTicketWorkflow: () => {
      throw new Error("not invoked");
    },
    evaluateDesignDepth: async () => {
      throw new Error("not invoked");
    },
    evaluateReviewGradeEdgeFulfillment: async () => {
      throw new Error("not invoked");
    }
  });
  const rule = plugins.evaluationRules.find(
    (candidate) => candidate.ruleRef === SDLC_TICKET_WORKFLOW_FD_RULE_REF
  );

  assert(rule);
  assert.equal(rule.required, true);
  assert.equal(rule.ruleRole, "semantic_judgment");
  assert.equal(rule.contract.computeStageRole, "evaluate");
  assert.equal(rule.contract.computeMeans, "F_D");
  assert.equal(rule.contract.computeStagePurpose, "candidate_evaluation");
  assert.deepStrictEqual(rule.outputCarrierRefs, [
    "SdlcTicketExecutionContract"
  ]);
  assert(plugins.requiredEvaluationRuleRefs.includes(SDLC_TICKET_WORKFLOW_FD_RULE_REF));
});
