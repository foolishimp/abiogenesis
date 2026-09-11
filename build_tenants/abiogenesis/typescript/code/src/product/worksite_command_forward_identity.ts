/** Dependency-free forward identities; not admission or execution authority. */
const scope = "abiogenesis/worksite/command-forward";
export const WORKSITE_COMMAND_FORWARD_IDS = Object.freeze({
  moduleRef: `module://${scope}@5`, programRef: `program://${scope}@5`, startRef: `start://${scope}@5`,
  graphFunctionRef: `graph-function://${scope}@5`, childGraphFunctionRef: `graph-function://${scope}/execute@5`,
  graphRef: `graph://${scope}@5`, childGraphRef: `graph://${scope}/execute@5`,
  prepareNodeRef: `node://${scope}/prepare@5`, callNodeRef: `node://${scope}/call@5`, nodeRef: `node://${scope}/execute@5`,
  prepareBindingRef: `implementation-binding://${scope}/prepare@5`, prepareImplementationRef: `implementation://${scope}/prepare@5`,
  implementationBindingRef: `implementation-binding://${scope}/execute@5`, implementationRef: `implementation://${scope}/execute@5`,
  requestContractRef: `contract://${scope}/request@5`, taskContractRef: `contract://${scope}/task@5`,
  observationContractRef: `contract://${scope}/observation@5`, workerResultContractRef: `contract://${scope}/worker-result@5`,
  closureContractRef: `contract://${scope}/closure@5`, childClosureContractRef: `contract://${scope}/child-closure@5`,
  stepPredicateRef: `predicate://${scope}/step@5`, rootPredicateRef: `predicate://${scope}/terminal@5`,
  judgmentPredicateRef: `predicate://${scope}/observation@5`, historyDependencyRef: `dependency://${scope}/historical-owners@5`,
  materializationPlanRef: `prompt-plan://${scope}@5`, rendererRef: `renderer://${scope}@5`,
  semanticsBindingRef: `product-semantics://${scope}@5`,
});

