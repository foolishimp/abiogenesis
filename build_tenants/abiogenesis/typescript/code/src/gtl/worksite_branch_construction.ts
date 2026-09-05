import {
  WORKSITE_BRANCH_CONSTRUCTION_IDS,
  type WorksiteBranchConstructionOutputVector,
  type WorksiteBranchConstructionTask,
  type WorksiteBranchConstructionVector,
} from "../product/worksite_branch_construction.js";
import {
  WORKSITE_CONSTRUCTION_IDS,
  type WorksiteConstructionResult,
  type WorksiteConstructionTask,
} from "../product/worksite_construction.js";
import { WORKSITE_FILE_REPLACE_EFFECT_URI } from "../product/worksite_effect.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  RootModuleArtifactBasis,
} from "./contracts.js";
import {
  catalogContribution,
  closureContract,
  contractDeclaration,
  implementationBinding,
} from "./declarations.js";
import { fanInApplication, fanOutApplication } from "./graph_applications.js";
import { WORKSITE_C0_IDS } from "./worksite_c0.js";

export const WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS = Object.freeze({
  graphRef: "graph://abiogenesis/worksite/branch-construction@5",
  nodeRef: "node://abiogenesis/worksite/branch-construction/root@5",
  planLocusRef: "locus://abiogenesis/worksite/branch-construction/plan@5",
  planArmId: "arm://abiogenesis/worksite/branch-construction/plan-fd@5",
  branchApplicationGraphRef:
    "graph://abiogenesis/worksite/branch-construction/branch-application@5",
  branchApplicationNodeRef:
    "node://abiogenesis/worksite/branch-construction/branch-application@5",
  reducerGraphRef:
    "graph://abiogenesis/worksite/branch-construction/reduce@5",
  reducerNodeRef:
    "node://abiogenesis/worksite/branch-construction/reduce@5",
  reducerLocusRef:
    "locus://abiogenesis/worksite/branch-construction/reduce@5",
  reducerArmId:
    "arm://abiogenesis/worksite/branch-construction/reduce-fd@5",
});

export interface WorksiteBranchConstructionPublicationParts {
  readonly contracts: readonly ContractDeclaration[];
  readonly implementationBindings: readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}

function branchContract(
  contractRef: string,
  contractKind: ContractDeclaration["contractKind"],
  valueKind: string,
): ContractDeclaration {
  return contractDeclaration({
    contractRef,
    contractVersion: "5.0.0",
    contractKind,
    valueKind,
  });
}

function branchClosure(input: {
  readonly closureContractRef: string;
  readonly closureScope: ClosureContract["closureScope"];
  readonly predicateRef: string;
}): ClosureContract {
  const basis = {
    kind: "closure_contract" as const,
    closureContractRef: input.closureContractRef,
    predicateRef: input.predicateRef,
    evidenceContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.evidenceContractRef,
    resultContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef,
    refusalContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.refusalContractRef,
    refusalValueKind: "worksite_branch_construction_refusal",
    judgmentContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.judgmentContractRef,
    rejectionContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.refusalContractRef,
    transitionContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.transitionContractRef,
    replayProjectionRef:
      "projection://abiogenesis/worksite/branch-construction@5",
    terminalKind: "completed" as const,
  };
  return input.closureScope === "run"
    ? closureContract({
        ...basis,
        closureScope: "run",
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
          "run_closed",
        ],
      })
    : closureContract({
        ...basis,
        closureScope: "graph_call",
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
        ],
      });
}

function branchBinding(
  artifact: RootModuleArtifactBasis,
  input: {
    readonly bindingRef: string;
    readonly implementationRef: string;
    readonly namedSymbol: string;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
  },
): ImplementationBinding {
  return implementationBinding({
    kind: "implementation_binding",
    ...input,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath:
      "build/code/src/implementation/worksite_branch_construction.js",
    computeRegime: "F_D",
    failureContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.failureContractRef,
    refusalContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.refusalContractRef,
  });
}

function branchContribution(
  artifact: RootModuleArtifactBasis,
  graphFunctionRef: string,
): CatalogContribution {
  return catalogContribution({
    handle: graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef],
    readinessPrerequisiteRefs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  });
}

export function constructWorksiteBranchConstructionPublicationParts(
  artifact: RootModuleArtifactBasis,
): Readonly<WorksiteBranchConstructionPublicationParts> {
  const task = cCarrier<WorksiteBranchConstructionTask>(
    WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef,
  );
  const branchVector = cCarrier<WorksiteBranchConstructionVector>(
    WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef,
  );
  const branchOutputVector = cCarrier<WorksiteBranchConstructionOutputVector>(
    WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
  );
  const c1Task = cCarrier<WorksiteConstructionTask>(
    WORKSITE_CONSTRUCTION_IDS.taskContractRef,
  );
  const result = cCarrier<WorksiteConstructionResult>(
    WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef,
  );

  const planBinding = branchBinding(artifact, {
    bindingRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.planImplementationBindingRef,
    implementationRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.planImplementationRef,
    namedSymbol: "realizeWorksiteBranchConstructionPlan",
    inputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef,
  });
  const reducerBinding = branchBinding(artifact, {
    bindingRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerImplementationBindingRef,
    implementationRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerImplementationRef,
    namedSymbol: "realizeWorksiteBranchConstructionReduction",
    inputContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
    outputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef,
  });
  const executableRequirement = (
    binding: ImplementationBinding,
  ) => ({
    kind: "executable_leaf_requirement" as const,
    implementationBindingRef: binding.bindingRef,
    inputContractRef: binding.inputContractRef,
    outputContractRef: binding.outputContractRef,
    evidenceContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.evidenceContractRef,
    failureContractRef: binding.failureContractRef,
    refusalContractRef: binding.refusalContractRef,
    judgmentContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.judgmentContractRef,
  });

  const branchApplicationRef = cGraphFunctionRef({
    graphFunctionRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationGraphFunctionRef,
    input: branchVector,
    output: result,
  });
  const c1RootRef = cGraphFunctionRef({
    graphFunctionRef: WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
    input: c1Task,
    output: result,
  });
  const reducerRef = cGraphFunctionRef({
    graphFunctionRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    input: branchOutputVector,
    output: result,
  });

  const rootGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef],
      provides: [WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef],
      carries: [WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef],
    },
    inputs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef],
    outputs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.graphRef,
      startNodeRef: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.nodeRef,
      terminalNodeRefs: [WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.nodeRef],
      nodes: [{
        nodeRef: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.of({
            input: task,
            output: branchVector,
            programLocusRef:
              WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.planLocusRef,
            stageRole: "aggregate_authority_and_readiness",
            fibre: "F_D",
            armId: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.planArmId,
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef:
              WORKSITE_BRANCH_CONSTRUCTION_IDS.planJudgmentPredicateRef,
            resultBearing: false,
            requirement: executableRequirement(planBinding),
          }),
          workflow.C(branchApplicationRef),
        ),
      }],
      edges: [],
      applications: [],
    },
    effects: [WORKSITE_FILE_REPLACE_EFFECT_URI],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.closureContractRef,
      "abg.evidence_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.evidenceContractRef,
      "abg.judgment_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.rootJudgmentPredicateRef,
      "abg.transition_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "branch-construction", "fd"],
  };

  const fanOut = fanOutApplication({
    inputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef,
    outputContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
    batchRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.batchRef,
    elementGraphFunctionRef: WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
    inputVectorRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef,
    outputVectorRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
    inputMemberContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    outputMemberContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
  });
  const fanIn = fanInApplication({
    inputContractRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
    outputContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef,
    reducerGraphFunctionRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    inputVectorRef:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
  });
  if (
    fanOut.applicationRef !==
      WORKSITE_BRANCH_CONSTRUCTION_IDS.fanOutApplicationRef ||
    fanIn.applicationRef !== WORKSITE_BRANCH_CONSTRUCTION_IDS.fanInApplicationRef
  ) {
    throw new TypeError("branch-construction application identity drift");
  }
  const branchApplicationGraphFunction: GraphFunction = {
    kind: "graph_function",
    name:
      WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef],
      provides: [WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef],
      carries: [
        WORKSITE_CONSTRUCTION_IDS.taskContractRef,
        WORKSITE_CONSTRUCTION_IDS.resultContractRef,
        WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
      ],
    },
    inputs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef],
    outputs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef:
        WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.branchApplicationGraphRef,
      startNodeRef:
        WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.branchApplicationNodeRef,
      terminalNodeRefs: [
        WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.branchApplicationNodeRef,
      ],
      nodes: [{
        nodeRef:
          WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.branchApplicationNodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.batch(
            [workflow.C(c1RootRef)],
            WORKSITE_BRANCH_CONSTRUCTION_IDS.batchRef,
            { input: branchVector, output: branchOutputVector },
          ),
          workflow.C(reducerRef),
        ),
      }],
      edges: [],
      applications: [fanOut, fanIn],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.child_closure_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationChildClosureContractRef,
      "abg.failure_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationFailureContractRef,
      "abg.judgment_predicate":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationJudgmentPredicateRef,
    },
    tags: [
      "abiogenesis",
      "worksite",
      "branch-construction",
      "branch-application",
    ],
  };

  const reducerGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef],
      provides: [WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef],
      carries: [
        WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
        WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef,
      ],
    },
    inputs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef],
    outputs: [WORKSITE_BRANCH_CONSTRUCTION_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.reducerGraphRef,
      startNodeRef: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.reducerNodeRef,
      terminalNodeRefs: [WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.reducerNodeRef],
      nodes: [{
        nodeRef: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.reducerNodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: branchOutputVector,
          output: result,
          programLocusRef:
            WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.reducerLocusRef,
          stageRole: "reducer",
          fibre: "F_D",
          armId: WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS.reducerArmId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerJudgmentPredicateRef,
          resultBearing: true,
          requirement: executableRequirement(reducerBinding),
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.child_closure_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerChildClosureContractRef,
      "abg.failure_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.failureContractRef,
      "abg.evidence_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.evidenceContractRef,
      "abg.judgment_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerJudgmentPredicateRef,
      "abg.transition_contract":
        WORKSITE_BRANCH_CONSTRUCTION_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "branch-construction", "reducer", "fd"],
  };

  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef,
    version: "5.0.0",
    moduleRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.moduleRef,
    starts: [{
      startRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.startRef,
      graphFunctionRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef,
    }],
    callableMembership: [
      WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef,
      WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationGraphFunctionRef,
      WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef,
      WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
      WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef,
      WORKSITE_C0_IDS.graphFunctionRef,
      WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    ],
    closureContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": WORKSITE_BRANCH_CONSTRUCTION_IDS.startRef,
    },
  };

  const contracts: readonly ContractDeclaration[] = [
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef,
      "input",
      "worksite_branch_construction_task",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef,
      "output",
      "worksite_branch_construction_vector",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef,
      "output",
      "worksite_branch_construction_output_vector",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.failureContractRef,
      "failure",
      "worksite_branch_construction_failure",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.refusalContractRef,
      "refusal",
      "worksite_branch_construction_refusal",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.evidenceContractRef,
      "evidence",
      "worksite_branch_construction_evidence_candidate",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.judgmentContractRef,
      "judgment",
      "worksite_branch_construction_judgment",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.transitionContractRef,
      "transition",
      "worksite_branch_construction_transition",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.closureContractRef,
      "closure",
      "worksite_branch_construction_closure",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationChildClosureContractRef,
      "closure",
      "worksite_branch_construction_branch_application_child_closure",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationFailureContractRef,
      "failure",
      "worksite_branch_construction_branch_application_failure",
    ),
    branchContract(
      WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerChildClosureContractRef,
      "closure",
      "worksite_branch_construction_reducer_child_closure",
    ),
  ];
  const closureContracts: readonly ClosureContract[] = [
    branchClosure({
      closureContractRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.closureContractRef,
      closureScope: "run",
      predicateRef: WORKSITE_BRANCH_CONSTRUCTION_IDS.rootJudgmentPredicateRef,
    }),
    branchClosure({
      closureContractRef:
        WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationChildClosureContractRef,
      closureScope: "graph_call",
      predicateRef:
        WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationJudgmentPredicateRef,
    }),
    branchClosure({
      closureContractRef:
        WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerChildClosureContractRef,
      closureScope: "graph_call",
      predicateRef:
        WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerJudgmentPredicateRef,
    }),
  ];

  return Object.freeze({
    contracts,
    implementationBindings: [planBinding, reducerBinding],
    closureContracts,
    programs: [program],
    graphFunctions: [
      rootGraphFunction,
      branchApplicationGraphFunction,
      reducerGraphFunction,
    ],
    contributions: [
      branchContribution(
        artifact,
        WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef,
      ),
      branchContribution(
        artifact,
        WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationGraphFunctionRef,
      ),
      branchContribution(
        artifact,
        WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef,
      ),
    ],
  });
}
