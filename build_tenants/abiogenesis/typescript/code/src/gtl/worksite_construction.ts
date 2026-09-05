import type {
  WorksiteCandidateBundle,
  WorksiteConstructionResult,
  WorksiteConstructionTask,
  WorksiteFileReplaceOutputVector,
  WorksiteFileReplaceVector,
} from "../product/worksite_construction.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction.js";
import { WORKSITE_FILE_REPLACE_EFFECT_URI } from "../product/worksite_effect.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RootModuleArtifactBasis,
} from "./contracts.js";
import {
  catalogContribution,
  closureContract,
  contractDeclaration,
  implementationBinding,
  modulePublication,
  productSemanticsBinding,
} from "./declarations.js";
import { fanInApplication, fanOutApplication } from "./graph_applications.js";
import {
  WORKSITE_C0_IDS,
  constructWorksiteC0PublicationParts,
} from "./worksite_c0.js";
import { WORKSITE_BRANCH_CONSTRUCTION_IDS } from "../product/worksite_branch_construction.js";
import { constructWorksiteBranchConstructionPublicationParts } from "./worksite_branch_construction.js";

export const WORKSITE_CONSTRUCTION_GTL_IDS = Object.freeze({
  graphRef: "graph://abiogenesis/worksite/construction@5",
  nodeRef: "node://abiogenesis/worksite/construction/root@5",
  candidateLocusRef:
    "locus://abiogenesis/worksite/construction/candidate@5",
  candidateArmId: "arm://abiogenesis/worksite/construction/candidate-fp@5",
  joinLocusRef:
    "locus://abiogenesis/worksite/construction/authority-join@5",
  joinArmId:
    "arm://abiogenesis/worksite/construction/authority-join-fd@5",
  vectorApplicationGraphRef:
    "graph://abiogenesis/worksite/construction/vector-application@5",
  vectorApplicationNodeRef:
    "node://abiogenesis/worksite/construction/vector-application@5",
  reducerGraphRef:
    "graph://abiogenesis/worksite/construction/reduce@5",
  reducerNodeRef:
    "node://abiogenesis/worksite/construction/reduce@5",
  reducerLocusRef:
    "locus://abiogenesis/worksite/construction/reduce@5",
  reducerArmId:
    "arm://abiogenesis/worksite/construction/reduce-fd@5",
  batchRef: WORKSITE_CONSTRUCTION_IDS.batchRef,
});

function constructionContract(
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

function constructionClosure(input: {
  readonly closureContractRef: string;
  readonly closureScope: ClosureContract["closureScope"];
  readonly predicateRef: string;
}): ClosureContract {
  const basis = {
    kind: "closure_contract" as const,
    closureContractRef: input.closureContractRef,
    predicateRef: input.predicateRef,
    evidenceContractRef: WORKSITE_CONSTRUCTION_IDS.evidenceContractRef,
    resultContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
    refusalContractRef: WORKSITE_CONSTRUCTION_IDS.refusalContractRef,
    refusalValueKind: "worksite_construction_refusal",
    judgmentContractRef: WORKSITE_CONSTRUCTION_IDS.judgmentContractRef,
    rejectionContractRef: WORKSITE_CONSTRUCTION_IDS.refusalContractRef,
    transitionContractRef: WORKSITE_CONSTRUCTION_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/worksite/construction@5",
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

function constructionBinding(
  artifact: RootModuleArtifactBasis,
  input: {
    readonly bindingRef: string;
    readonly implementationRef: string;
    readonly namedSymbol: string;
    readonly computeRegime: "F_D" | "F_P";
    readonly inputContractRef: string;
    readonly outputContractRef: string;
  },
): ImplementationBinding {
  return implementationBinding({
    kind: "implementation_binding",
    ...input,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/worksite_construction.js",
    failureContractRef: WORKSITE_CONSTRUCTION_IDS.failureContractRef,
    refusalContractRef: WORKSITE_CONSTRUCTION_IDS.refusalContractRef,
  });
}

function constructionContribution(
  artifact: RootModuleArtifactBasis,
  graphFunctionRef: string,
  programMembershipRefs: readonly string[] = [
    WORKSITE_CONSTRUCTION_IDS.programRef,
  ],
): CatalogContribution {
  return catalogContribution({
    handle: graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs,
    readinessPrerequisiteRefs: programMembershipRefs,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  });
}

/** One composite publication containing C1 and the exact reusable C0 parts once. */
export function constructWorksiteConstructionModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const task = cCarrier<WorksiteConstructionTask>(
    WORKSITE_CONSTRUCTION_IDS.taskContractRef,
  );
  const candidate = cCarrier<WorksiteCandidateBundle>(
    WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
  );
  const fileReplaceVector = cCarrier<WorksiteFileReplaceVector>(
    WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
  );
  const fileReplaceOutputVector = cCarrier<WorksiteFileReplaceOutputVector>(
    WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
  );
  const result = cCarrier<WorksiteConstructionResult>(
    WORKSITE_CONSTRUCTION_IDS.resultContractRef,
  );
  const c0Input = cCarrier<Readonly<Record<string, never>>>(
    WORKSITE_C0_IDS.inputContractRef,
  );
  const c0Output = cCarrier<Readonly<Record<string, never>>>(
    WORKSITE_C0_IDS.outputContractRef,
  );

  const candidateBinding = constructionBinding(artifact, {
    bindingRef:
      WORKSITE_CONSTRUCTION_IDS.candidateImplementationBindingRef,
    implementationRef: WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef,
    namedSymbol: "realizeWorksiteConstructionCandidate",
    computeRegime: "F_P",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
  });
  const joinBinding = constructionBinding(artifact, {
    bindingRef: WORKSITE_CONSTRUCTION_IDS.joinImplementationBindingRef,
    implementationRef: WORKSITE_CONSTRUCTION_IDS.joinImplementationRef,
    namedSymbol: "realizeWorksiteFileReplaceVector",
    computeRegime: "F_D",
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
  });
  const reducerBinding = constructionBinding(artifact, {
    bindingRef: WORKSITE_CONSTRUCTION_IDS.reducerImplementationBindingRef,
    implementationRef: WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef,
    namedSymbol: "reduceWorksiteConstructionResults",
    computeRegime: "F_D",
    inputContractRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
  });

  const executableRequirement = (
    binding: ImplementationBinding,
  ) => ({
    kind: "executable_leaf_requirement" as const,
    implementationBindingRef: binding.bindingRef,
    inputContractRef: binding.inputContractRef,
    outputContractRef: binding.outputContractRef,
    evidenceContractRef: WORKSITE_CONSTRUCTION_IDS.evidenceContractRef,
    failureContractRef: binding.failureContractRef,
    refusalContractRef: binding.refusalContractRef,
    judgmentContractRef: WORKSITE_CONSTRUCTION_IDS.judgmentContractRef,
  });
  const candidateRequirement = executableRequirement(candidateBinding);
  const joinRequirement = executableRequirement(joinBinding);
  const reducerRequirement = executableRequirement(reducerBinding);

  const vectorApplicationRef = cGraphFunctionRef({
    graphFunctionRef:
      WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef,
    input: fileReplaceVector,
    output: result,
  });
  const c0Ref = cGraphFunctionRef({
    graphFunctionRef: WORKSITE_C0_IDS.graphFunctionRef,
    input: c0Input,
    output: c0Output,
  });
  const reducerRef = cGraphFunctionRef({
    graphFunctionRef: WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    input: fileReplaceOutputVector,
    output: result,
  });

  const rootGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_CONSTRUCTION_IDS.taskContractRef],
      provides: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
      carries: [
        WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
        WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
        WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
      ],
    },
    inputs: [WORKSITE_CONSTRUCTION_IDS.taskContractRef],
    outputs: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_CONSTRUCTION_GTL_IDS.graphRef,
      startNodeRef: WORKSITE_CONSTRUCTION_GTL_IDS.nodeRef,
      terminalNodeRefs: [WORKSITE_CONSTRUCTION_GTL_IDS.nodeRef],
      nodes: [{
        nodeRef: WORKSITE_CONSTRUCTION_GTL_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.of({
            input: task,
            output: candidate,
            programLocusRef:
              WORKSITE_CONSTRUCTION_GTL_IDS.candidateLocusRef,
            stageRole: "candidate",
            fibre: "F_P",
            armId: WORKSITE_CONSTRUCTION_GTL_IDS.candidateArmId,
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef:
              WORKSITE_CONSTRUCTION_IDS.candidateJudgmentPredicateRef,
            resultBearing: false,
            requirement: candidateRequirement,
          }),
          C.compose(
            C.of({
              input: candidate,
              output: fileReplaceVector,
              programLocusRef: WORKSITE_CONSTRUCTION_GTL_IDS.joinLocusRef,
              stageRole: "authority_join",
              fibre: "F_D",
              armId: WORKSITE_CONSTRUCTION_GTL_IDS.joinArmId,
              compositionRef: null,
              vectorIndex: 1,
              judgmentPredicateRef:
                WORKSITE_CONSTRUCTION_IDS.joinJudgmentPredicateRef,
              resultBearing: false,
              requirement: joinRequirement,
            }),
            workflow.C(vectorApplicationRef),
          ),
        ),
      }],
      edges: [],
      applications: [],
    },
    effects: [WORKSITE_FILE_REPLACE_EFFECT_URI],
    declarations: {
      "abg.compute_regime": "mixed",
      "abg.closure_contract":
        WORKSITE_CONSTRUCTION_IDS.closureContractRef,
      "abg.child_closure_contract":
        WORKSITE_CONSTRUCTION_IDS.childClosureContractRef,
      "abg.evidence_contract": WORKSITE_CONSTRUCTION_IDS.evidenceContractRef,
      "abg.judgment_contract":
        WORKSITE_CONSTRUCTION_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef,
      "abg.raw_result_contract":
        WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
      "abg.transition_contract":
        WORKSITE_CONSTRUCTION_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "construction", "mixed"],
  };

  const fanOut = fanOutApplication({
    inputContractRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
    outputContractRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
    batchRef: WORKSITE_CONSTRUCTION_GTL_IDS.batchRef,
    elementGraphFunctionRef: WORKSITE_C0_IDS.graphFunctionRef,
    inputVectorRef: WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
    outputVectorRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
    inputMemberContractRef: WORKSITE_C0_IDS.inputContractRef,
    outputMemberContractRef: WORKSITE_C0_IDS.outputContractRef,
  });
  const fanIn = fanInApplication({
    inputContractRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
    outputContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
    reducerGraphFunctionRef:
      WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    inputVectorRef:
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
  });
  const vectorApplicationGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef],
      provides: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
      carries: [
        WORKSITE_C0_IDS.inputContractRef,
        WORKSITE_C0_IDS.outputContractRef,
        WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
      ],
    },
    inputs: [WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef],
    outputs: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_CONSTRUCTION_GTL_IDS.vectorApplicationGraphRef,
      startNodeRef:
        WORKSITE_CONSTRUCTION_GTL_IDS.vectorApplicationNodeRef,
      terminalNodeRefs: [
        WORKSITE_CONSTRUCTION_GTL_IDS.vectorApplicationNodeRef,
      ],
      nodes: [{
        nodeRef: WORKSITE_CONSTRUCTION_GTL_IDS.vectorApplicationNodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.batch(
            [workflow.C(c0Ref)],
            WORKSITE_CONSTRUCTION_IDS.batchRef,
            { input: fileReplaceVector, output: fileReplaceOutputVector },
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
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationChildClosureContractRef,
      "abg.failure_contract":
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationFailureContractRef,
      "abg.judgment_predicate":
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationJudgmentPredicateRef,
    },
    tags: ["abiogenesis", "worksite", "construction", "vector-application"],
  };

  const reducerGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [
        WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
      ],
      provides: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
      carries: [
        WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
        WORKSITE_CONSTRUCTION_IDS.resultContractRef,
      ],
    },
    inputs: [WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef],
    outputs: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_CONSTRUCTION_GTL_IDS.reducerGraphRef,
      startNodeRef: WORKSITE_CONSTRUCTION_GTL_IDS.reducerNodeRef,
      terminalNodeRefs: [WORKSITE_CONSTRUCTION_GTL_IDS.reducerNodeRef],
      nodes: [{
        nodeRef: WORKSITE_CONSTRUCTION_GTL_IDS.reducerNodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: fileReplaceOutputVector,
          output: result,
          programLocusRef: WORKSITE_CONSTRUCTION_GTL_IDS.reducerLocusRef,
          stageRole: "reducer",
          fibre: "F_D",
          armId: WORKSITE_CONSTRUCTION_GTL_IDS.reducerArmId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            WORKSITE_CONSTRUCTION_IDS.reducerJudgmentPredicateRef,
          resultBearing: true,
          requirement: reducerRequirement,
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.child_closure_contract":
        WORKSITE_CONSTRUCTION_IDS.reducerChildClosureContractRef,
      "abg.failure_contract": WORKSITE_CONSTRUCTION_IDS.failureContractRef,
      "abg.evidence_contract": WORKSITE_CONSTRUCTION_IDS.evidenceContractRef,
      "abg.judgment_contract":
        WORKSITE_CONSTRUCTION_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        WORKSITE_CONSTRUCTION_IDS.reducerJudgmentPredicateRef,
      "abg.transition_contract":
        WORKSITE_CONSTRUCTION_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "construction", "reducer", "fd"],
  };

  const constructionProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: WORKSITE_CONSTRUCTION_IDS.programRef,
    version: "5.0.0",
    moduleRef: WORKSITE_CONSTRUCTION_IDS.moduleRef,
    starts: [{
      startRef: WORKSITE_CONSTRUCTION_IDS.startRef,
      graphFunctionRef: WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
    }],
    callableMembership: [
      WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
      WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef,
      WORKSITE_C0_IDS.graphFunctionRef,
      WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
    ],
    closureContractRef: WORKSITE_CONSTRUCTION_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "mixed",
      "abg.default_start_ref": WORKSITE_CONSTRUCTION_IDS.startRef,
    },
  };

  const c0 = constructWorksiteC0PublicationParts(
    artifact,
    WORKSITE_CONSTRUCTION_IDS.moduleRef,
    [
      WORKSITE_C0_IDS.programRef,
      WORKSITE_CONSTRUCTION_IDS.programRef,
      WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef,
    ],
  );
  const c3 = constructWorksiteBranchConstructionPublicationParts(artifact);
  const contracts: readonly ContractDeclaration[] = [
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.taskContractRef,
      "input",
      "worksite_construction_task",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
      "output",
      "worksite_construction_worker_result",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
      "output",
      "worksite_candidate_bundle",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef,
      "output",
      "worksite_file_replace_vector",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef,
      "output",
      "worksite_file_replace_output_vector",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.resultContractRef,
      "output",
      "worksite_construction_result",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.failureContractRef,
      "failure",
      "worksite_construction_failure",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.vectorApplicationFailureContractRef,
      "failure",
      "worksite_construction_vector_application_failure",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.refusalContractRef,
      "refusal",
      "worksite_construction_refusal",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.evidenceContractRef,
      "evidence",
      "worksite_construction_evidence_candidate",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.judgmentContractRef,
      "judgment",
      "worksite_construction_judgment",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.transitionContractRef,
      "transition",
      "worksite_construction_transition",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.closureContractRef,
      "closure",
      "worksite_construction_closure",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.childClosureContractRef,
      "closure",
      "worksite_construction_child_closure",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.vectorApplicationChildClosureContractRef,
      "closure",
      "worksite_construction_vector_application_child_closure",
    ),
    constructionContract(
      WORKSITE_CONSTRUCTION_IDS.reducerChildClosureContractRef,
      "closure",
      "worksite_construction_reducer_child_closure",
    ),
    ...c0.contracts,
  ];
  const closureContracts: readonly ClosureContract[] = [
    constructionClosure({
      closureContractRef: WORKSITE_CONSTRUCTION_IDS.closureContractRef,
      closureScope: "run",
      predicateRef: WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef,
    }),
    constructionClosure({
      closureContractRef: WORKSITE_CONSTRUCTION_IDS.childClosureContractRef,
      closureScope: "graph_call",
      predicateRef: WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef,
    }),
    constructionClosure({
      closureContractRef:
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationChildClosureContractRef,
      closureScope: "graph_call",
      predicateRef:
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationJudgmentPredicateRef,
    }),
    constructionClosure({
      closureContractRef:
        WORKSITE_CONSTRUCTION_IDS.reducerChildClosureContractRef,
      closureScope: "graph_call",
      predicateRef: WORKSITE_CONSTRUCTION_IDS.reducerJudgmentPredicateRef,
    }),
    ...c0.closureContracts,
  ];

  return modulePublication({
    kind: "module_publication",
    moduleRef: WORKSITE_CONSTRUCTION_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef:
      `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice("sha256:".length)}`,
    contributionManifestRef:
      `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice("sha256:".length)}`,
    productSemanticsBinding: productSemanticsBinding({
      kind: "product_semantics_binding",
      bindingRef: "product-semantics://abiogenesis/conformance@5",
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js",
      namedSymbol: "ABI5_PRODUCT_SEMANTICS",
    }),
    contracts: [...contracts, ...c3.contracts],
    evaluators: [],
    rules: [],
    implementationBindings: [
      candidateBinding,
      joinBinding,
      ...c0.implementationBindings,
      reducerBinding,
      ...c3.implementationBindings,
    ],
    closureContracts: [...closureContracts, ...c3.closureContracts],
    programs: [constructionProgram, ...c0.programs, ...c3.programs],
    graphFunctions: [
      rootGraphFunction,
      vectorApplicationGraphFunction,
      ...c0.graphFunctions,
      reducerGraphFunction,
      ...c3.graphFunctions,
    ],
    contributions: [
      constructionContribution(
        artifact,
        WORKSITE_CONSTRUCTION_IDS.graphFunctionRef,
        [
          WORKSITE_CONSTRUCTION_IDS.programRef,
          WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef,
        ],
      ),
      constructionContribution(
        artifact,
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef,
        [
          WORKSITE_CONSTRUCTION_IDS.programRef,
          WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef,
        ],
      ),
      ...c0.contributions,
      constructionContribution(
        artifact,
        WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef,
        [
          WORKSITE_CONSTRUCTION_IDS.programRef,
          WORKSITE_BRANCH_CONSTRUCTION_IDS.programRef,
        ],
      ),
      ...c3.contributions,
    ],
  });
}
