// Implements: T-184

import type {
  ConsequenceProjectionOutcome,
  EnginePluginInput,
  EngineRunnerPluginSet,
  EvaluationRuleOutcome,
  FpDispatchOutcome,
  FpEvaluationOutcome
} from "@abiogenesis/typescript-tenant";
import {
  REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF
} from "../review_grade_edge_fulfillment.js";
import { SDLC_TICKET_WORKFLOW_FD_RULE_REF } from "../../tickets/index.js";
import {
  DESIGN_DEPTH_FP_EVALUATOR_RULE_REF
} from "./evaluate/design_depth_register.js";
import {
  consequenceProjectionPluginContract,
  designDepthFpEvaluatorRuleContract,
  fpDispatchPluginContract,
  fpEvaluatorPluginContract,
  reviewGradeEdgeFulfillmentRuleContract,
  ticketWorkflowFdRuleContract
} from "./plugin_contracts.js";

export interface SdlcAbgPluginSetCallbacks {
  readonly dispatch: (input: EnginePluginInput) => Promise<FpDispatchOutcome>;
  readonly evaluateFp: (
    input: EnginePluginInput
  ) => Promise<FpEvaluationOutcome>;
  readonly projectConsequence: (
    input: EnginePluginInput
  ) => ConsequenceProjectionOutcome | Promise<ConsequenceProjectionOutcome>;
  readonly evaluateDesignDepth: (
    input: EnginePluginInput
  ) => Promise<EvaluationRuleOutcome>;
  readonly evaluateReviewGradeEdgeFulfillment: (
    input: EnginePluginInput
  ) => Promise<EvaluationRuleOutcome>;
  readonly evaluateTicketWorkflow: (
    input: EnginePluginInput
  ) => EvaluationRuleOutcome | Promise<EvaluationRuleOutcome>;
}

export function createSdlcAbgPluginSet(
  callbacks: SdlcAbgPluginSetCallbacks
): EngineRunnerPluginSet {
  return Object.freeze({
    fpDispatch: Object.freeze({
      contract: fpDispatchPluginContract(),
      dispatch: callbacks.dispatch
    }),
    fpEvaluator: Object.freeze({
      contract: fpEvaluatorPluginContract(),
      evaluate: callbacks.evaluateFp
    }),
    consequenceProjection: Object.freeze({
      contract: consequenceProjectionPluginContract(),
      project: callbacks.projectConsequence
    }),
    evaluationRules: Object.freeze([
      Object.freeze({
        contract: ticketWorkflowFdRuleContract(),
        ruleRef: SDLC_TICKET_WORKFLOW_FD_RULE_REF,
        ruleRole: "semantic_judgment" as const,
        required: true,
        outputCarrierRefs: Object.freeze(["SdlcTicketExecutionContract"]),
        evaluate: callbacks.evaluateTicketWorkflow
      }),
      Object.freeze({
        contract: designDepthFpEvaluatorRuleContract(),
        ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
        ruleRole: "semantic_judgment" as const,
        required: true,
        outputCarrierRefs: Object.freeze(["SdlcDesignDepthRegister"]),
        evaluate: callbacks.evaluateDesignDepth
      }),
      Object.freeze({
        contract: reviewGradeEdgeFulfillmentRuleContract(),
        ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
        ruleRole: "semantic_judgment" as const,
        required: true,
        outputCarrierRefs: Object.freeze([
          "SdlcReviewGradeEdgeFulfillmentAssessment"
        ]),
        evaluate: callbacks.evaluateReviewGradeEdgeFulfillment
      })
    ]),
    requiredEvaluationRuleRefs: Object.freeze([
      SDLC_TICKET_WORKFLOW_FD_RULE_REF,
      DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF
    ])
  });
}
