/** Exact identities for the bounded C2 worker-executes sibling. */
export const WORKSITE_COMMAND_EXECUTION_IDS = Object.freeze({
  moduleRef: "module://abiogenesis/worksite/command-execution@5",
  programRef: "program://abiogenesis/worksite/command-execution@5",
  startRef: "start://abiogenesis/worksite/command-execution@5",
  graphFunctionRef:
    "graph-function://abiogenesis/worksite/command-execution@5",
  graphRef: "graph://abiogenesis/worksite/command-execution@5",
  nodeRef: "node://abiogenesis/worksite/command-execution/fp@5",
  armId: "arm://abiogenesis/worksite/command-execution/fp@5",
  taskContractRef:
    "contract://abiogenesis/worksite/command-execution-task@5",
  workerResultContractRef:
    "contract://abiogenesis/worksite/command-execution-worker-result@5",
  observationContractRef:
    "contract://abiogenesis/worksite/command-execution-observation@5",
  failureContractRef:
    "contract://abiogenesis/worksite/command-execution-failure@5",
  refusalContractRef:
    "contract://abiogenesis/worksite/command-execution-refusal@5",
  evidenceContractRef:
    "contract://abiogenesis/worksite/command-execution-evidence@5",
  judgmentContractRef:
    "contract://abiogenesis/worksite/command-execution-judgment@5",
  transitionContractRef:
    "contract://abiogenesis/worksite/command-execution-transition@5",
  closureContractRef:
    "contract://abiogenesis/worksite/command-execution-closure@5",
  childClosureContractRef:
    "contract://abiogenesis/worksite/command-execution-child-closure@5",
  implementationRef:
    "implementation://abiogenesis/worksite/command-execution-fp@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/worksite/command-execution-fp@5",
  judgmentPredicateRef:
    "predicate://abiogenesis/worksite/command-execution-observation@5",
  materializationPlanRef:
    "prompt-plan://abiogenesis/worksite/command-execution@5",
  rendererRef:
    "renderer://abiogenesis/worksite/command-execution@5",
  workerActorRef:
    "actor://abiogenesis/worksite/command-execution-worker@5",
  workerBindingRef:
    "worker-binding://abiogenesis/worksite/command-execution-worker@5",
  httpPortFileArgumentPlaceholder: "{ABI_HTTP_PORT_FILE}",
  transportLane: "worker_executes" as const,
});
