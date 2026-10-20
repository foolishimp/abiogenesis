import { sha256Canonical } from "../shared/digests.js";

const APPLICATION_BASE = {
  kind: "graph_function_application" as const,
  relationKind: "fan_out" as const,
  inputContractRef:
    "contract://abiogenesis/worksite/construction/file-replace-vector@5",
  outputContractRef:
    "contract://abiogenesis/worksite/construction/file-replace-output-vector@5",
  batchRef: "batch://abiogenesis/worksite/construction/targets@5",
  elementGraphFunctionRef:
    "graph-function://abiogenesis/worksite/file-replace@5",
  inputVectorRef:
    "contract://abiogenesis/worksite/construction/file-replace-vector@5",
  outputVectorRef:
    "contract://abiogenesis/worksite/construction/file-replace-output-vector@5",
  inputMemberContractRef:
    "contract://abiogenesis/worksite/file-replace-input@5",
  outputMemberContractRef:
    "contract://abiogenesis/worksite/file-replace-output@5",
};

const fanOutApplicationDigest = sha256Canonical(APPLICATION_BASE);

/**
 * One identity surface for the C1 Product carriers and their exact packaged
 * leaf seams. GTL publishes these coordinates; Product code owns their value
 * relations.
 */
export const WORKSITE_CONSTRUCTION_IDS = Object.freeze({
  moduleRef: "module://abiogenesis/worksite/construction@5",
  programRef: "program://abiogenesis/worksite/construction@5",
  startRef: "start://abiogenesis/worksite/construction@5",
  graphFunctionRef:
    "graph-function://abiogenesis/worksite/construction@5",
  vectorApplicationGraphFunctionRef:
    "graph-function://abiogenesis/worksite/construction/vector-application@5",
  fileReplaceGraphFunctionRef:
    "graph-function://abiogenesis/worksite/file-replace@5",
  reducerGraphFunctionRef:
    "graph-function://abiogenesis/worksite/construction/reduce@5",
  batchRef: APPLICATION_BASE.batchRef,
  fanOutApplicationRef:
    `graph-function-application://abiogenesis/${fanOutApplicationDigest.slice("sha256:".length)}`,
  taskContractRef:
    "contract://abiogenesis/worksite/construction-task@5",
  workerResultContractRef:
    "contract://abiogenesis/worksite/construction-worker-result@5",
  candidateBundleContractRef:
    "contract://abiogenesis/worksite/construction-candidate-bundle@5",
  fileReplaceVectorContractRef: APPLICATION_BASE.inputContractRef,
  fileReplaceOutputVectorContractRef: APPLICATION_BASE.outputContractRef,
  resultContractRef:
    "contract://abiogenesis/worksite/construction-result@5",
  failureContractRef:
    "contract://abiogenesis/worksite/construction-failure@5",
  refusalContractRef:
    "contract://abiogenesis/worksite/construction-refusal@5",
  evidenceContractRef:
    "contract://abiogenesis/worksite/construction-evidence@5",
  judgmentContractRef:
    "contract://abiogenesis/worksite/construction-judgment@5",
  transitionContractRef:
    "contract://abiogenesis/worksite/construction-transition@5",
  closureContractRef:
    "contract://abiogenesis/worksite/construction-closure@5",
  childClosureContractRef:
    "contract://abiogenesis/worksite/construction-child-closure@5",
  vectorApplicationChildClosureContractRef:
    "contract://abiogenesis/worksite/construction/vector-application-child-closure@5",
  vectorApplicationFailureContractRef:
    "contract://abiogenesis/worksite/construction/vector-application-failure@5",
  reducerChildClosureContractRef:
    "contract://abiogenesis/worksite/construction/reducer-child-closure@5",
  candidateImplementationRef:
    "implementation://abiogenesis/worksite/construction-candidate-fp@5",
  candidateImplementationBindingRef:
    "implementation-binding://abiogenesis/worksite/construction-candidate-fp@5",
  joinImplementationRef:
    "implementation://abiogenesis/worksite/construction-authority-join-fd@5",
  joinImplementationBindingRef:
    "implementation-binding://abiogenesis/worksite/construction-authority-join-fd@5",
  reducerImplementationRef:
    "implementation://abiogenesis/worksite/construction-reducer-fd@5",
  reducerImplementationBindingRef:
    "implementation-binding://abiogenesis/worksite/construction-reducer-fd@5",
  candidateJudgmentPredicateRef:
    "predicate://abiogenesis/worksite/construction-candidate@5",
  joinJudgmentPredicateRef:
    "predicate://abiogenesis/worksite/construction-authority-join@5",
  vectorApplicationJudgmentPredicateRef:
    "predicate://abiogenesis/worksite/construction/vector-application@5",
  reducerJudgmentPredicateRef:
    "predicate://abiogenesis/worksite/construction-reducer@5",
  rootJudgmentPredicateRef:
    "predicate://abiogenesis/worksite/construction-result@5",
  materializationPlanRef:
    "prompt-plan://abiogenesis/worksite/construction@5",
  rendererRef: "renderer://abiogenesis/worksite/construction@5",
  workerActorRef:
    "actor://abiogenesis/worksite/construction-worker@5",
  workerBindingRef:
    "worker-binding://abiogenesis/worksite/construction-worker@5",
  transportLane: "closed_prompt_proof" as const,
});

/** The single owner declaration also supplies the bounded preparation source node. */
export const WORKSITE_CONSTRUCTION_RESULT_CONTRACT = Object.freeze({
  contractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
  contractVersion: "5.0.0", contractKind: "output" as const,
  valueKind: "worksite_construction_result",
});


