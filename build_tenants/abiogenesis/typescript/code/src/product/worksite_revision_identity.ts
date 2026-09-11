/** Dependency-free D2 identities shared by declarations and runtime owners. */
const scope = "abiogenesis/worksite/revision-command-execution";
export const WORKSITE_REVISION_IDS = Object.freeze({
  graphFunctionRef: `graph-function://${scope}@5`, graphRef: `graph://${scope}@5`,
  nodeRef: `node://${scope}/fp@5`, armId: `arm://${scope}/fp@5`,
  taskContractRef: `contract://${scope}-task@5`, observationContractRef: `contract://${scope}-observation@5`,
  workerResultContractRef: `contract://${scope}-worker-result@5`,
  implementationRef: `implementation://${scope}-fp@5`, implementationBindingRef: `implementation-binding://${scope}-fp@5`,
  judgmentPredicateRef: `predicate://${scope}-observation@5`, childClosureContractRef: `contract://${scope}-child-closure@5`,
  materializationPlanRef: `prompt-plan://${scope}@5`, rendererRef: `renderer://${scope}@5`,
  inputContractRef: `contract://${scope}-preparation-input@5`, boundInputContractRef: `contract://${scope}-preparation-bound-input@5`,
  selectImplementationRef: `implementation://${scope}/select-construction-fd@5`, selectBindingRef: `implementation-binding://${scope}/select-construction-fd@5`,
  selectPredicateRef: `predicate://${scope}/select-construction@5`, prepareImplementationRef: `implementation://${scope}/prepare-task-fd@5`,
  prepareBindingRef: `implementation-binding://${scope}/prepare-task-fd@5`, preparePredicateRef: `predicate://${scope}/prepare-task@5`,
});
