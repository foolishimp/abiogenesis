import {
  GTL_DECLARATION_CONSTRUCTORS,
} from "@abiogenesis/typescript-tenant/gtl";

import {
  FLAVORED_CATALOG_IDS,
  PACKAGE_NAME,
  PACKAGE_VERSION,
} from "./index.js";

export type FlavoredDeclarationConstructors =
  typeof GTL_DECLARATION_CONSTRUCTORS;
type FlavoredArtifactBasis = Readonly<{
  productId: string;
  artifactDigest: `sha256:${string}`;
  productContentDigest: `sha256:${string}`;
  productManifestDigest: `sha256:${string}`;
  packageName: string;
  packageVersion: string;
}>;

export function constructFlavoredCatalogPublication(
  artifact: FlavoredArtifactBasis,
  declarations: FlavoredDeclarationConstructors =
    GTL_DECLARATION_CONSTRUCTORS,
): Readonly<object> {
  if (
    artifact.packageName !== PACKAGE_NAME ||
    artifact.packageVersion !== PACKAGE_VERSION
  ) {
    throw new TypeError(
      "flavored catalog publication requires its own exact package basis",
    );
  }
  const ids = FLAVORED_CATALOG_IDS;
  const contractRows = [
    ["input", ids.inputContractRef, "flavored_text_input"],
    ["output", ids.outputContractRef, "flavored_text_output"],
    ["evidence", ids.evidenceContractRef, "deterministic_evidence_candidate"],
    ["failure", ids.failureContractRef, "flavored_text_failure"],
    ["refusal", ids.refusalContractRef, "flavored_text_refusal"],
    ["judgment", ids.judgmentContractRef, "flavored_text_judgment"],
    ["transition", ids.transitionContractRef, "flavored_text_transition"],
    ["closure", ids.closureContractRef, "flavored_text_closure"],
    ["input", ids.nodeTypeRef, "flavored_node_type"],
    ["input", ids.overlayRef, "flavored_overlay"],
  ] as const;
  const contracts = contractRows.map((
    [contractKind, contractRef, valueKind],
  ) => declarations.contractDeclaration({
    contractRef: contractRef!,
    contractVersion: "5.0.0",
    contractKind: contractKind!,
    valueKind: valueKind!,
  }));
  const graphFunction = {
    kind: "graph_function",
    name: ids.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [ids.inputContractRef],
      provides: [ids.outputContractRef],
      carries: [ids.inputContractRef, ids.outputContractRef],
    },
    inputs: [ids.inputContractRef],
    outputs: [ids.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: ids.graphRef,
      startNodeRef: ids.nodeRef,
      terminalNodeRefs: [ids.nodeRef],
      nodes: [{
        nodeRef: ids.nodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: ids.inputContractRef,
          outputCarrierRef: ids.outputContractRef,
          programLocusRef: ids.nodeRef,
          stageRole: "render",
          fibre: "F_D",
          armId: "arm://flavor.example/text/render-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: ids.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef: ids.implementationBindingRef,
            inputContractRef: ids.inputContractRef,
            outputContractRef: ids.outputContractRef,
            evidenceContractRef: ids.evidenceContractRef,
            failureContractRef: ids.failureContractRef,
            refusalContractRef: ids.refusalContractRef,
            judgmentContractRef: ids.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://flavor.example/text/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": ids.closureContractRef,
      "abg.evidence_contract": ids.evidenceContractRef,
      "abg.judgment_contract": ids.judgmentContractRef,
      "abg.judgment_predicate": ids.judgmentPredicateRef,
      "abg.transition_contract": ids.transitionContractRef,
    },
    tags: ["external-product", "flavored-catalog", "all-fd"],
  } as const;
  const program = {
    kind: "gtl_program",
    programRef: ids.programRef,
    version: "5.0.0",
    moduleRef: ids.moduleRef,
    starts: [{
      startRef: ids.startRef,
      graphFunctionRef: ids.graphFunctionRef,
    }],
    callableMembership: [ids.graphFunctionRef],
    closureContractRef: ids.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": ids.startRef,
      "abg.root_mode": "direct",
    },
  } as const;
  const contributionBasis = {
    owningProductId: artifact.productId,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  } as const;
  const contributions = [{
    handle: ids.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: ids.graphFunctionRef,
    programMembershipRefs: [ids.programRef],
    readinessPrerequisiteRefs: [ids.programRef],
    ...contributionBasis,
  }, {
    handle: ids.nodeTypeHandle,
    kind: "node_type",
    declarationOrContractRef: ids.nodeTypeRef,
    programMembershipRefs: [],
    readinessPrerequisiteRefs: [],
    ...contributionBasis,
  }, {
    handle: ids.overlayHandle,
    kind: "overlay",
    declarationOrContractRef: ids.overlayRef,
    programMembershipRefs: [ids.programRef],
    readinessPrerequisiteRefs: [ids.programRef],
    ...contributionBasis,
  }] as const;
  return declarations.modulePublication({
    kind: "module_publication",
    moduleRef: ids.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://flavor.example/text@5",
    contributionManifestRef:
      "contribution-manifest://flavor.example/text@5",
    productSemanticsBinding: declarations.productSemanticsBinding({
      kind: "product_semantics_binding",
      bindingRef: ids.semanticsBindingRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "FLAVORED_CATALOG_PRODUCT_SEMANTICS",
    }),
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [declarations.implementationBinding({
      kind: "implementation_binding",
      bindingRef: ids.implementationBindingRef,
      implementationRef: ids.implementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeFlavoredText",
      computeRegime: "F_D",
      inputContractRef: ids.inputContractRef,
      outputContractRef: ids.outputContractRef,
      failureContractRef: ids.failureContractRef,
      refusalContractRef: ids.refusalContractRef,
    })],
    closureContracts: [declarations.closureContract({
      kind: "closure_contract",
      closureContractRef: ids.closureContractRef,
      predicateRef: "predicate://flavor.example/text/terminal@5",
      evidenceContractRef: ids.evidenceContractRef,
      resultContractRef: ids.outputContractRef,
      refusalContractRef: ids.refusalContractRef,
      refusalValueKind: "flavored_text_refusal",
      judgmentContractRef: ids.judgmentContractRef,
      rejectionContractRef: ids.refusalContractRef,
      transitionContractRef: ids.transitionContractRef,
      replayProjectionRef: "projection://flavor.example/text/replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    })],
    programs: [program],
    graphFunctions: [graphFunction],
    contributions: contributions.map((contribution) =>
      declarations.catalogContribution(contribution)
    ),
  });
}
