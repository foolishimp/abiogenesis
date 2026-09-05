import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  type WorksiteCommandExecutionObservation,
  type WorksiteCommandExecutionTask,
} from "../product/worksite_command_execution.js";
import { C, cCarrier } from "./c_algebra.js";
import type {
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

function contract(
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

/** One public C2 GraphFunction: exact task -> one worker_executes F_P leaf -> typed observation. */
export function constructWorksiteCommandExecutionModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const input = cCarrier<WorksiteCommandExecutionTask>(
    WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
  );
  const output = cCarrier<WorksiteCommandExecutionObservation>(
    WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,
  );
  const binding: ImplementationBinding = implementationBinding({
    kind: "implementation_binding",
    bindingRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef,
    implementationRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/worksite_command_execution.js",
    namedSymbol: "realizeWorksiteCommandExecution",
    computeRegime: "F_P",
    inputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,
    failureContractRef: WORKSITE_COMMAND_EXECUTION_IDS.failureContractRef,
    refusalContractRef: WORKSITE_COMMAND_EXECUTION_IDS.refusalContractRef,
  });
  const close: ClosureContract = closureContract({
    kind: "closure_contract",
    closureContractRef: WORKSITE_COMMAND_EXECUTION_IDS.closureContractRef,
    predicateRef: WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef,
    evidenceContractRef: WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef,
    resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,
    refusalContractRef: WORKSITE_COMMAND_EXECUTION_IDS.refusalContractRef,
    refusalValueKind: "worksite_command_execution_refusal",
    judgmentContractRef: WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef,
    rejectionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.failureContractRef,
    transitionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/worksite/command-execution@5",
    terminalKind: "completed",
    closureScope: "run",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  });
  const graphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef],
      provides: [WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef],
      carries: [WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef],
    },
    inputs: [WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef],
    outputs: [WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_COMMAND_EXECUTION_IDS.graphRef,
      startNodeRef: WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
      terminalNodeRefs: [WORKSITE_COMMAND_EXECUTION_IDS.nodeRef],
      nodes: [{
        nodeRef: WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input,
          output,
          programLocusRef: WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
          stageRole: "command-execution",
          fibre: "F_P",
          armId: WORKSITE_COMMAND_EXECUTION_IDS.armId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef: binding.bindingRef,
            inputContractRef: binding.inputContractRef,
            outputContractRef: binding.outputContractRef,
            evidenceContractRef: WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef,
            failureContractRef: binding.failureContractRef,
            refusalContractRef: binding.refusalContractRef,
            judgmentContractRef: WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef,
          },
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_P",
      "abg.closure_contract": WORKSITE_COMMAND_EXECUTION_IDS.closureContractRef,
      "abg.evidence_contract": WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef,
      "abg.judgment_contract": WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef,
      "abg.judgment_predicate": WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef,
      "abg.raw_result_contract": WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
      "abg.transition_contract": WORKSITE_COMMAND_EXECUTION_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "command-execution", "fp", "c2"],
  };
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: WORKSITE_COMMAND_EXECUTION_IDS.programRef,
    version: "5.0.0",
    moduleRef: WORKSITE_COMMAND_EXECUTION_IDS.moduleRef,
    starts: [{
      startRef: WORKSITE_COMMAND_EXECUTION_IDS.startRef,
      graphFunctionRef: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
    }],
    callableMembership: [WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef],
    closureContractRef: close.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_P",
      "abg.default_start_ref": WORKSITE_COMMAND_EXECUTION_IDS.startRef,
    },
  };
  return modulePublication({
    kind: "module_publication",
    moduleRef: WORKSITE_COMMAND_EXECUTION_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice("sha256:".length)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice("sha256:".length)}`,
    productSemanticsBinding: productSemanticsBinding({
      kind: "product_semantics_binding",
      bindingRef:
        "product-semantics://abiogenesis/worksite/command-execution@5",
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js",
      namedSymbol: "ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS",
    }),
    contracts: [
      contract(WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef, "input", "worksite_command_execution_task"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef, "output", "worksite_command_execution_worker_result"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef, "output", "worksite_command_execution_observation"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.failureContractRef, "failure", "worksite_command_execution_failure"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.refusalContractRef, "refusal", "worksite_command_execution_refusal"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef, "evidence", "worksite_command_execution_evidence"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef, "judgment", "worksite_command_execution_judgment"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.transitionContractRef, "transition", "worksite_command_execution_transition"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.closureContractRef, "closure", "worksite_command_execution_closure"),
    ],
    evaluators: [],
    rules: [],
    implementationBindings: [binding],
    closureContracts: [close],
    programs: [program],
    graphFunctions: [graphFunction],
    contributions: [catalogContribution({
      handle: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
      owningProductId: artifact.productId,
      programMembershipRefs: [WORKSITE_COMMAND_EXECUTION_IDS.programRef],
      readinessPrerequisiteRefs: [WORKSITE_COMMAND_EXECUTION_IDS.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    })],
  });
}
