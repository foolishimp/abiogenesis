import { sha256Canonical } from "../shared/digests.js";
const scope = "abiogenesis/worksite/native-work";
export const NATIVE_WORKSPACE_WORK_IDS = Object.freeze({
  assessmentGraphFunctionRef: `graph-function://${scope}/assessment@5`, assessmentNodeRef: `node://${scope}/assessment@5`,
  assessmentGraphRef: `graph://${scope}/assessment@5`, assessmentStartRef: `start://${scope}/assessment@5`,
  assessmentProgramRef: `program://${scope}/assessment@5`,
  moduleRef: `module://${scope}@5`, programRef: `program://${scope}@5`, graphFunctionRef: `graph-function://${scope}@5`,
  graphRef: `graph://${scope}@5`, nodeRef: `node://${scope}@5`, startRef: `start://${scope}@5`, armId: `arm://${scope}@5`,
  implementationRef: `implementation://${scope}-fp@5`, implementationBindingRef: `implementation-binding://${scope}-fp@5`,
  taskContractRef: `contract://${scope}/task@5`, observationContractRef: `contract://${scope}/observation@5`,
  inputContractRef: `contract://${scope}/task@5`, outputContractRef: `contract://${scope}/observation@5`,
  workerReportContractRef: `contract://${scope}/worker-report@5`, failureContractRef: `contract://${scope}/failure@5`,
  refusalContractRef: `contract://${scope}/refusal@5`, evidenceContractRef: `contract://${scope}/evidence@5`,
  judgmentContractRef: `contract://${scope}/judgment@5`, transitionContractRef: `contract://${scope}/transition@5`,
  closureContractRef: `contract://${scope}/closure@5`, childClosureContractRef: `contract://${scope}/child-closure@5`,
  judgmentPredicateRef: `predicate://${scope}/observed@5`, semanticsBindingRef: `product-semantics://${scope}@5`,
  workerActorRef: `actor://${scope}@5`, workerBindingRef: `worker-binding://${scope}@5`,
  rendererRef: `renderer://${scope}@5`, materializationPlanRef: `materialization-plan://${scope}@5`,
  effectUri: `effect://${scope}/v1` as const, handlerRef: `handler://${scope}/v1` as const,
});
export const NATIVE_WORKSPACE_WORK_HANDLER_DIGEST = sha256Canonical({
  effectUri: NATIVE_WORKSPACE_WORK_IDS.effectUri, handlerRef: NATIVE_WORKSPACE_WORK_IDS.handlerRef,
  operation: "native_workspace_work", ownerClass: "selected_implementation", schemaVersion: "5.0.0",
});
