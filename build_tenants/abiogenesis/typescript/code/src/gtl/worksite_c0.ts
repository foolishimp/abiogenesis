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
import { C, cCarrier } from "./c_algebra.js";
import {
  closureContract,
  implementationBinding,
  modulePublication,
  productSemanticsBinding,
} from "./declarations.js";
import {
  isWorksiteEffectAuthorization,
  isWorksiteFileReplaceReceipt,
  isWorksiteFileReplaceRequest,
  isWorksiteObservation,
  WORKSITE_FILE_REPLACE_EFFECT_URI,
} from "../product/worksite_effect.js";
import { deepFreeze } from "../shared/immutable.js";

const WORKSITE_C0_IMPLEMENTATION = Object.freeze({
  implementationRef: "implementation://abiogenesis/worksite/file-replace-fd@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/worksite/file-replace-fd@5",
  inputContractRef: "contract://abiogenesis/worksite/file-replace-input@5",
  outputContractRef: "contract://abiogenesis/worksite/file-replace-output@5",
  failureContractRef: "contract://abiogenesis/worksite/file-replace-failure@5",
  refusalContractRef: "contract://abiogenesis/worksite/file-replace-refusal@5",
});

export const WORKSITE_C0_IDS = Object.freeze({
  moduleRef: "module://abiogenesis/worksite/c0@5",
  programRef: "program://abiogenesis/worksite/file-replace@5",
  startRef: "start://abiogenesis/worksite/file-replace@5",
  graphFunctionRef: "graph-function://abiogenesis/worksite/file-replace@5",
  graphRef: "graph://abiogenesis/worksite/file-replace@5",
  nodeRef: "node://abiogenesis/worksite/file-replace/fd-leaf@5",
  armId: "arm://abiogenesis/worksite/file-replace/fd@5",
  inputContractRef: WORKSITE_C0_IMPLEMENTATION.inputContractRef,
  outputContractRef: WORKSITE_C0_IMPLEMENTATION.outputContractRef,
  failureContractRef: WORKSITE_C0_IMPLEMENTATION.failureContractRef,
  refusalContractRef: WORKSITE_C0_IMPLEMENTATION.refusalContractRef,
  evidenceContractRef: "contract://abiogenesis/worksite/file-replace-evidence@5",
  judgmentContractRef: "contract://abiogenesis/worksite/file-replace-judgment@5",
  transitionContractRef: "contract://abiogenesis/worksite/file-replace-transition@5",
  closureContractRef: "contract://abiogenesis/worksite/file-replace-closure@5",
  childClosureContractRef:
    "contract://abiogenesis/worksite/file-replace-child-closure@5",
  judgmentPredicateRef: "predicate://abiogenesis/worksite/file-replace-result@5",
});

export interface WorksiteC0PublicationParts {
  readonly contracts: readonly ContractDeclaration[];
  readonly implementationBindings: readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}

export function isWorksiteFileReplaceOutput(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Readonly<Record<string, unknown>>;
  const authorization = record.authorization;
  const receipt = record.receipt;
  const successorObservation = record.successorObservation;
  return Object.keys(record).sort().join("\0") ===
      ["authorization", "kind", "receipt", "schemaVersion", "successorObservation"].join("\0") &&
    record.kind === "worksite_file_replace_output" &&
    record.schemaVersion === "5.0.0" &&
    isWorksiteEffectAuthorization(authorization) &&
    isWorksiteFileReplaceReceipt(receipt) &&
    isWorksiteObservation(successorObservation) &&
    successorObservation.state === "file" &&
    authorization.workspaceBindingIdentity ===
      successorObservation.workspaceBindingIdentity &&
    authorization.subjectRef === successorObservation.subjectRef &&
    authorization.subjectDigest === successorObservation.subjectDigest &&
    receipt.authorizationRef === authorization.authorizationRef &&
    receipt.authorizationDigest === authorization.authorizationDigest &&
    receipt.afterObservationRef === successorObservation.observationRef &&
    receipt.afterObservationDigest === successorObservation.observationDigest &&
    receipt.writtenDigest === successorObservation.fileDigest;
}

export function resolveWorksiteC0JudgmentRelation(predicateRef: string) {
  return predicateRef === WORKSITE_C0_IDS.judgmentPredicateRef
    ? Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/worksite/file-replace-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/worksite/file-replace-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isWorksiteFileReplaceRequest(input) &&
          isWorksiteFileReplaceOutput(output) &&
          (output.authorization as { predecessorObservationRef: string }).predecessorObservationRef ===
            input.predecessorObservation.observationRef &&
          (output.authorization as { predecessorObservationDigest: string }).predecessorObservationDigest ===
            input.predecessorObservation.observationDigest &&
          (output.authorization as { capabilityGrantRef: string }).capabilityGrantRef === input.capabilityGrant.grantRef &&
          (output.authorization as { capabilityGrantDigest: string }).capabilityGrantDigest === input.capabilityGrant.grantDigest,
      })
    : null;
}

/** Reusable C0 authority parts; callers still require normal catalog/basis admission. */
export function constructWorksiteC0PublicationParts(
  artifact: RootModuleArtifactBasis,
  moduleRef: string,
  programMembershipRefs: readonly string[] = [WORKSITE_C0_IDS.programRef],
): Readonly<WorksiteC0PublicationParts> {
  const input = cCarrier<Readonly<Record<string, never>>>(
    WORKSITE_C0_IDS.inputContractRef,
  );
  const output = cCarrier<Readonly<Record<string, never>>>(
    WORKSITE_C0_IDS.outputContractRef,
  );
  const contracts: readonly ContractDeclaration[] = [
    { contractRef: WORKSITE_C0_IDS.inputContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: "worksite_file_replace_request" },
    { contractRef: WORKSITE_C0_IDS.outputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "worksite_file_replace_output" },
    { contractRef: WORKSITE_C0_IDS.failureContractRef, contractVersion: "5.0.0", contractKind: "failure", valueKind: "worksite_effect_refusal" },
    { contractRef: WORKSITE_C0_IDS.refusalContractRef, contractVersion: "5.0.0", contractKind: "refusal", valueKind: "worksite_effect_refusal" },
    { contractRef: WORKSITE_C0_IDS.evidenceContractRef, contractVersion: "5.0.0", contractKind: "evidence", valueKind: "worksite_file_replace_evidence_candidate" },
    { contractRef: WORKSITE_C0_IDS.judgmentContractRef, contractVersion: "5.0.0", contractKind: "judgment", valueKind: "worksite_file_replace_judgment" },
    { contractRef: WORKSITE_C0_IDS.transitionContractRef, contractVersion: "5.0.0", contractKind: "transition", valueKind: "worksite_file_replace_transition" },
    { contractRef: WORKSITE_C0_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "worksite_file_replace_closure" },
    { contractRef: WORKSITE_C0_IDS.childClosureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "worksite_file_replace_child_closure" },
  ];
  const close: ClosureContract = closureContract({
    kind: "closure_contract",
    closureContractRef: WORKSITE_C0_IDS.closureContractRef,
    predicateRef: WORKSITE_C0_IDS.judgmentPredicateRef,
    evidenceContractRef: WORKSITE_C0_IDS.evidenceContractRef,
    resultContractRef: WORKSITE_C0_IDS.outputContractRef,
    refusalContractRef: WORKSITE_C0_IDS.refusalContractRef,
    refusalValueKind: "worksite_effect_refusal",
    judgmentContractRef: WORKSITE_C0_IDS.judgmentContractRef,
    rejectionContractRef: WORKSITE_C0_IDS.refusalContractRef,
    transitionContractRef: WORKSITE_C0_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/worksite/file-replace@5",
    terminalKind: "completed",
    closureScope: "run",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  });
  const childClose: ClosureContract = closureContract({
    kind: "closure_contract",
    closureContractRef: WORKSITE_C0_IDS.childClosureContractRef,
    predicateRef: WORKSITE_C0_IDS.judgmentPredicateRef,
    evidenceContractRef: WORKSITE_C0_IDS.evidenceContractRef,
    resultContractRef: WORKSITE_C0_IDS.outputContractRef,
    refusalContractRef: WORKSITE_C0_IDS.refusalContractRef,
    refusalValueKind: "worksite_effect_refusal",
    judgmentContractRef: WORKSITE_C0_IDS.judgmentContractRef,
    rejectionContractRef: WORKSITE_C0_IDS.refusalContractRef,
    transitionContractRef: WORKSITE_C0_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/worksite/file-replace@5",
    terminalKind: "completed",
    closureScope: "graph_call",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"],
  });
  const binding: ImplementationBinding = implementationBinding({
    kind: "implementation_binding",
    bindingRef: WORKSITE_C0_IMPLEMENTATION.implementationBindingRef,
    implementationRef: WORKSITE_C0_IMPLEMENTATION.implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/worksite_file_replace.js",
    namedSymbol: "realizeWorksiteFileReplace",
    computeRegime: "F_D",
    inputContractRef: WORKSITE_C0_IDS.inputContractRef,
    outputContractRef: WORKSITE_C0_IDS.outputContractRef,
    failureContractRef: WORKSITE_C0_IDS.failureContractRef,
    refusalContractRef: WORKSITE_C0_IDS.refusalContractRef,
  });
  const graphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKSITE_C0_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [WORKSITE_C0_IDS.inputContractRef],
      provides: [WORKSITE_C0_IDS.outputContractRef],
      carries: [WORKSITE_C0_IDS.inputContractRef, WORKSITE_C0_IDS.outputContractRef],
    },
    inputs: [WORKSITE_C0_IDS.inputContractRef],
    outputs: [WORKSITE_C0_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKSITE_C0_IDS.graphRef,
      startNodeRef: WORKSITE_C0_IDS.nodeRef,
      terminalNodeRefs: [WORKSITE_C0_IDS.nodeRef],
      nodes: [{
        nodeRef: WORKSITE_C0_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input,
          output,
          programLocusRef: WORKSITE_C0_IDS.nodeRef,
          stageRole: "file-replace",
          fibre: "F_D",
          armId: WORKSITE_C0_IDS.armId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: WORKSITE_C0_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef: binding.bindingRef,
            inputContractRef: binding.inputContractRef,
            outputContractRef: binding.outputContractRef,
            evidenceContractRef: WORKSITE_C0_IDS.evidenceContractRef,
            failureContractRef: binding.failureContractRef,
            refusalContractRef: binding.refusalContractRef,
            judgmentContractRef: WORKSITE_C0_IDS.judgmentContractRef,
          },
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [WORKSITE_FILE_REPLACE_EFFECT_URI],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": close.closureContractRef,
      "abg.child_closure_contract": childClose.closureContractRef,
      "abg.evidence_contract": WORKSITE_C0_IDS.evidenceContractRef,
      "abg.judgment_contract": WORKSITE_C0_IDS.judgmentContractRef,
      "abg.judgment_predicate": WORKSITE_C0_IDS.judgmentPredicateRef,
      "abg.transition_contract": WORKSITE_C0_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "worksite", "c0"],
  };
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: WORKSITE_C0_IDS.programRef,
    version: "5.0.0",
    moduleRef,
    starts: [{ startRef: WORKSITE_C0_IDS.startRef, graphFunctionRef: graphFunction.name }],
    callableMembership: [graphFunction.name],
    closureContractRef: close.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": WORKSITE_C0_IDS.startRef,
    },
  };
  const contribution: CatalogContribution = {
    handle: graphFunction.name,
    kind: "graph_function",
    declarationOrContractRef: graphFunction.name,
    owningProductId: artifact.productId,
    programMembershipRefs,
    readinessPrerequisiteRefs: programMembershipRefs,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  return deepFreeze({
    contracts,
    implementationBindings: [binding],
    closureContracts: [close, childClose],
    programs: [program],
    graphFunctions: [graphFunction],
    contributions: [contribution],
  });
}

/** One declared Product leaf; retained as an isolated C0 proof helper. */
export function constructWorksiteC0ModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const parts = constructWorksiteC0PublicationParts(
    artifact,
    WORKSITE_C0_IDS.moduleRef,
  );
  return modulePublication({
    kind: "module_publication",
    moduleRef: WORKSITE_C0_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice("sha256:".length)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice("sha256:".length)}`,
    productSemanticsBinding: productSemanticsBinding({
      kind: "product_semantics_binding",
      bindingRef: "product-semantics://abiogenesis/conformance@5",
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js",
      namedSymbol: "ABI5_PRODUCT_SEMANTICS",
    }),
    contracts: parts.contracts,
    evaluators: [],
    rules: [],
    implementationBindings: parts.implementationBindings,
    closureContracts: parts.closureContracts,
    programs: parts.programs,
    graphFunctions: parts.graphFunctions,
    contributions: parts.contributions,
  });
}
