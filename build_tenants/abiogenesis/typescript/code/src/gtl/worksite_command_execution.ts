import { WORKSITE_REVISION_IDS as revision, type WorksiteRevisionCommandExecutionTask, type WorksiteRevisionCommandExecutionObservation } from "../product/worksite_revision.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction.js";
import { WORKSITE_BRANCH_CONSTRUCTION_IDS } from "../product/worksite_branch_construction.js";
import { WORKSITE_PREPARATION_IDS, worksitePreparationContractDeclarations } from "../product/worksite_preparation_contracts.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS, NATIVE_WORK_REACQUISITION_IDS as reacquire,
  renderWorksiteCommandExecutionPrompt,
  type WorksiteCommandExecutionObservation,
  type C2WorksiteCommandExecutionTask, type NativeWorksiteCommandExecutionObservation, type ObservedWorksiteCommandExecutionObservation,
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
import { constructRunEnvironmentDeclaration, RUN_ENVIRONMENT_POLICY, stdoInventoryDigest } from "./stdo_run_environment.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";

// The existing Product renderer owns the mechanical relay contract. Bind its
// packaged source, not an ambient method installation or a second policy text.
// The generator verifies these exact member/span coordinates before publication.
const commandSourceMember = { path: "build/code/src/product/worksite_command_execution.js", type: "file" as const,
  digest: "sha256:9fe600d54f8a73d54bfef4359fbf03449591978f44f1cc16ce1439b0c5a24bf4" as const, target: null };
const commandSource = { memberRef: "source-member://abiogenesis/worksite/command-execution/renderer@5",
  path: commandSourceMember.path, byteCount: 103899, digest: commandSourceMember.digest };
const commandContextRef = "context://abiogenesis/worksite/command-execution/renderer@5";
const commandSourceBasisRef = "source://abiogenesis/worksite/command-execution/renderer@5/";
const commandPolicy = renderWorksiteCommandExecutionPrompt.toString();
export const WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY = Object.freeze({
  path: "contracts/worksite/command-execution-context.inventory.json",
  content: canonicalJson({ kind: "run_environment_member_inventory", schemaVersion: "5.0.0", members: [commandSourceMember] }) + "\n",
});
const commandEnvironment = constructRunEnvironmentDeclaration({ kind: "run_environment_declaration", schemaVersion: "5.0.0",
  declarationRef: "environment://abiogenesis/worksite/command-execution@5",
  dependencies: [{ dependencyRef: "dependency://abiogenesis/worksite/command-execution/renderer@5", basisRef: commandSourceBasisRef,
    recordRef: "record://abiogenesis/worksite/command-execution/context-inventory@5",
    recordDigest: sha256Bytes(Buffer.from(WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.content)), recordFormat: "member_inventory@1",
    inventoryDigest: stdoInventoryDigest([commandSourceMember]), members: [commandSourceMember] }],
  contexts: [{ contextRef: commandContextRef, sourceLocator: commandSourceBasisRef,
    inventoryDigest: sha256Canonical([commandSource]), members: [commandSource] }], corpusAccess: null, accesses: [],
  roles: [{ graphFunctionRef: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef, programLocusRef: WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
    role: "command_executor", frameRefs: ["frame://abiogenesis/worksite/command-execution@5"],
    policy: { policyRef: WORKSITE_COMMAND_EXECUTION_IDS.rendererRef, text: commandPolicy, digest: sha256Bytes(Buffer.from(commandPolicy)) },
    accessRefs: [], contextPolicy: { policyRef: "policy://abiogenesis/worksite/command-execution/context@5",
      selectors: ["current_worksite", "admitted_execution_evidence"] },
    sourceBindings: [{ contextRef: commandContextRef, memberRef: commandSource.memberRef, memberDigest: commandSource.digest,
      startByte: 93954, endByte: 96262, spanDigest: "sha256:10916fee7c20d82621f49651753d134eb66631cd4872531b8cb635ffa2367345" }] }],
});

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

/** Effect-free closed-child authentication; ordinary consumers compose its task into C2. */
export function nativeWorkReacquisitionGraphFunction(): GraphFunction {
  const ids = WORKSITE_COMMAND_EXECUTION_IDS;
  return { kind: "graph_function", name: reacquire.graphFunctionRef, version: "5.0.0",
    environment: { requires: [reacquire.requestContractRef], provides: [ids.taskContractRef], carries: [] },
    inputs: [reacquire.requestContractRef], outputs: [ids.taskContractRef], effects: [], tags: ["deterministic-reacquisition", "worksite"],
    declarations: { "abg.compute_regime": "F_D", "abg.closure_contract": reacquire.closureContractRef,
      "abg.child_closure_contract": reacquire.childClosureContractRef, "abg.judgment_predicate": reacquire.predicateRef,
      "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
      "abg.transition_contract": ids.transitionContractRef },
    template: { kind: "inline_graph", graphRef: "graph://abiogenesis/worksite/native-command-reacquisition@5", startNodeRef: reacquire.nodeRef,
      terminalNodeRefs: [reacquire.nodeRef], edges: [], applications: [], nodes: [{ nodeRef: reacquire.nodeRef, nodeKind: "c_locus", term: C.of({
        input: cCarrier(reacquire.requestContractRef), output: cCarrier(ids.taskContractRef), programLocusRef: reacquire.nodeRef,
        stageRole: "native-command-reacquisition", fibre: "F_D", armId: "arm://abiogenesis/worksite/native-command-reacquisition@5",
        compositionRef: null, vectorIndex: 0, judgmentPredicateRef: reacquire.predicateRef, resultBearing: true,
        requirement: { kind: "executable_leaf_requirement", implementationBindingRef: reacquire.implementationBindingRef,
          inputContractRef: reacquire.requestContractRef, outputContractRef: ids.taskContractRef, failureContractRef: ids.failureContractRef,
          refusalContractRef: ids.refusalContractRef, evidenceContractRef: ids.evidenceContractRef, judgmentContractRef: ids.judgmentContractRef } }) }] } };
}

/** One public C2 GraphFunction: exact task -> one worker_executes F_P leaf -> typed observation. */
export function constructWorksiteCommandExecutionModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const input = cCarrier<C2WorksiteCommandExecutionTask>(
    WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
  );
  const output = cCarrier<WorksiteCommandExecutionObservation | NativeWorksiteCommandExecutionObservation | ObservedWorksiteCommandExecutionObservation>(
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
  const childClose = closureContract({
    ...close,
    closureContractRef: WORKSITE_COMMAND_EXECUTION_IDS.childClosureContractRef,
    closureScope: "graph_call",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"],
  });
  const revisionBinding = implementationBinding({ ...binding, bindingRef: revision.implementationBindingRef,
    implementationRef: revision.implementationRef, namedSymbol: "realizeWorksiteRevisionCommandExecution",
    inputContractRef: revision.taskContractRef, outputContractRef: revision.observationContractRef });
  const revisionChildClose = closureContract({ ...childClose, closureContractRef: revision.childClosureContractRef,
    predicateRef: revision.judgmentPredicateRef, resultContractRef: revision.observationContractRef,
    replayProjectionRef: "projection://abiogenesis/worksite/revision-command-execution@5" });
  const preparationBindings = [
    [revision.selectBindingRef, revision.selectImplementationRef, "selectWorksiteRevisionConstruction", revision.inputContractRef, WORKSITE_CONSTRUCTION_IDS.taskContractRef],
    [revision.prepareBindingRef, revision.prepareImplementationRef, "prepareWorksiteRevisionCommands", revision.boundInputContractRef, revision.taskContractRef],
    [WORKSITE_PREPARATION_IDS.selectBindingRef, WORKSITE_PREPARATION_IDS.selectImplementationRef,
      "selectWorksiteConstruction", WORKSITE_PREPARATION_IDS.inputContractRef, WORKSITE_CONSTRUCTION_IDS.taskContractRef],
    [WORKSITE_PREPARATION_IDS.prepareBindingRef, WORKSITE_PREPARATION_IDS.prepareImplementationRef,
      "prepareWorksiteCommands", WORKSITE_PREPARATION_IDS.boundInputContractRef, WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef],
    [WORKSITE_PREPARATION_IDS.selectBranchBindingRef, WORKSITE_PREPARATION_IDS.selectBranchImplementationRef,
      "selectWorksiteBranchConstruction", WORKSITE_PREPARATION_IDS.branchInputContractRef, WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef],
    [WORKSITE_PREPARATION_IDS.prepareBranchBindingRef, WORKSITE_PREPARATION_IDS.prepareBranchImplementationRef,
      "prepareWorksiteBranchCommands", WORKSITE_PREPARATION_IDS.branchBoundInputContractRef, WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef],
  ].map(([bindingRef, implementationRef, namedSymbol, inputContractRef, outputContractRef]) => implementationBinding({
    kind: "implementation_binding", bindingRef: bindingRef!, implementationRef: implementationRef!,
    packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/worksite_command_execution.js", namedSymbol: namedSymbol!,
    computeRegime: "F_D", inputContractRef: inputContractRef!, outputContractRef: outputContractRef!,
    failureContractRef: WORKSITE_COMMAND_EXECUTION_IDS.failureContractRef,
    refusalContractRef: WORKSITE_COMMAND_EXECUTION_IDS.refusalContractRef,
  }));
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
      "abg.child_closure_contract": WORKSITE_COMMAND_EXECUTION_IDS.childClosureContractRef,
      "abg.evidence_contract": WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef,
      "abg.judgment_contract": WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef,
      "abg.judgment_predicate": WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef,
      "abg.raw_result_contract": WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
      "abg.transition_contract": WORKSITE_COMMAND_EXECUTION_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "command-execution", "fp", "c2"],
  };
  const revisionGraphFunction: GraphFunction = { ...graphFunction, name: revision.graphFunctionRef,
    environment: { requires: [revision.taskContractRef], provides: [revision.observationContractRef],
      carries: [revision.workerResultContractRef] },
    inputs: [revision.taskContractRef], outputs: [revision.observationContractRef],
    template: { kind: "inline_graph", graphRef: revision.graphRef, startNodeRef: revision.nodeRef,
      terminalNodeRefs: [revision.nodeRef], edges: [], applications: [], nodes: [{
        nodeRef: revision.nodeRef, nodeKind: "c_locus", term: C.of({
          input: cCarrier<WorksiteRevisionCommandExecutionTask>(revision.taskContractRef),
          output: cCarrier<WorksiteRevisionCommandExecutionObservation>(revision.observationContractRef),
          programLocusRef: revision.nodeRef, stageRole: "revision-command-execution", fibre: "F_P",
          armId: revision.armId, compositionRef: null, vectorIndex: 0,
          judgmentPredicateRef: revision.judgmentPredicateRef, resultBearing: true,
          requirement: { kind: "executable_leaf_requirement", implementationBindingRef: revisionBinding.bindingRef,
            inputContractRef: revision.taskContractRef, outputContractRef: revision.observationContractRef,
            evidenceContractRef: WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef,
            failureContractRef: revisionBinding.failureContractRef, refusalContractRef: revisionBinding.refusalContractRef,
            judgmentContractRef: WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef },
        }),
      }] },
    declarations: { ...graphFunction.declarations, "abg.closure_contract": revision.childClosureContractRef,
      "abg.child_closure_contract": revision.childClosureContractRef, "abg.judgment_predicate": revision.judgmentPredicateRef,
      "abg.raw_result_contract": revision.workerResultContractRef },
    tags: [...graphFunction.tags, "d2", "child-only"],
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
    // Revision C2 is an authenticated child arm, retained below for consumers.
    callableMembership: [WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef],
    closureContractRef: close.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_P",
      "abg.default_start_ref": WORKSITE_COMMAND_EXECUTION_IDS.startRef,
      [RUN_ENVIRONMENT_POLICY]: commandEnvironment.declarationRef,
    },
  };
  const reacquireBinding = implementationBinding({ ...binding, bindingRef: reacquire.implementationBindingRef,
    implementationRef: reacquire.implementationRef, computeRegime: "F_D", inputContractRef: reacquire.requestContractRef,
    outputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef, modulePath: "build/code/src/implementation/native_work_reacquisition.js",
    namedSymbol: "prepareNativeWorksiteCommandReacquisition" });
  const reacquireClose = closureContract({ ...close, closureContractRef: reacquire.closureContractRef,
    predicateRef: reacquire.predicateRef, resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef });
  const reacquireChildClose = closureContract({ ...childClose, closureContractRef: reacquire.childClosureContractRef,
    predicateRef: reacquire.predicateRef, resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef });
  const reacquireProgram: GtlProgram = { kind: "gtl_program", programRef: reacquire.programRef, version: "5.0.0", moduleRef: WORKSITE_COMMAND_EXECUTION_IDS.moduleRef,
    starts: [{ startRef: "start://abiogenesis/worksite/native-command-reacquisition@5", graphFunctionRef: reacquire.graphFunctionRef }],
    callableMembership: [reacquire.graphFunctionRef], closureContractRef: reacquire.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_D" } };
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
      ...worksitePreparationContractDeclarations(),
      contract(reacquire.requestContractRef, "input", "native_worksite_command_reacquisition_request"),
      contract(reacquire.closureContractRef, "closure", "native_worksite_command_reacquisition_closure"),
      contract(reacquire.childClosureContractRef, "closure", "native_worksite_command_reacquisition_child_closure"),
      contract(revision.taskContractRef, "input", "worksite_revision_command_execution_task"),
      contract(revision.observationContractRef, "output", "worksite_revision_command_execution_observation"),
      contract(revision.workerResultContractRef, "output", "worksite_revision_command_execution_worker_result"),
      contract(revision.childClosureContractRef, "closure", "worksite_revision_command_execution_child_closure"),
      contract(WORKSITE_COMMAND_EXECUTION_IDS.childClosureContractRef, "closure", "worksite_command_execution_child_closure"),
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
    implementationBindings: [binding, revisionBinding, ...preparationBindings, reacquireBinding],
    closureContracts: [close, childClose, revisionChildClose, reacquireClose, reacquireChildClose],
    programs: [program, reacquireProgram],
    runEnvironments: [commandEnvironment],
    graphFunctions: [graphFunction, revisionGraphFunction, nativeWorkReacquisitionGraphFunction()],
    contributions: [catalogContribution({ handle: reacquire.graphFunctionRef, kind: "graph_function", declarationOrContractRef: reacquire.graphFunctionRef,
      owningProductId: artifact.productId, programMembershipRefs: [reacquire.programRef], readinessPrerequisiteRefs: [reacquire.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }), catalogContribution({
      handle: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
      owningProductId: artifact.productId,
      programMembershipRefs: [WORKSITE_COMMAND_EXECUTION_IDS.programRef],
      readinessPrerequisiteRefs: [WORKSITE_COMMAND_EXECUTION_IDS.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    }), catalogContribution({
      handle: revision.graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: revision.graphFunctionRef,
      owningProductId: artifact.productId,
      programMembershipRefs: [],
      readinessPrerequisiteRefs: [],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    })],
  });
}
