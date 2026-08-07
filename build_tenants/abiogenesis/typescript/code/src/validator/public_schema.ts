import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { GTL_PROGRAM_DIAGNOSTIC_ID_VALUES } from "./conformance.js";

type Schema = Readonly<Record<string, unknown>>;

const ref: Schema = { type: "string", minLength: 1, pattern: "\\S" };
const digest: Schema = {
  type: "string",
  pattern: "^sha256:[0-9a-f]{64}$",
};
const bool: Schema = { type: "boolean" };
const nonnegativeInteger: Schema = { type: "integer", minimum: 0 };
const positiveInteger: Schema = { type: "integer", minimum: 1 };

function arrayOf(
  items: Schema,
  options: Readonly<{
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  }> = {},
): Schema {
  return { type: "array", items, ...options };
}

function exactObject(
  properties: Readonly<Record<string, Schema>>,
  required: readonly string[] = Object.keys(properties),
): Schema {
  return {
    type: "object",
    additionalProperties: false,
    required: [...required],
    properties,
  };
}

const stringArray = arrayOf(ref);
const uniqueStringArray = arrayOf(ref, { uniqueItems: true });

const executableLeafRequirement = exactObject({
  kind: { const: "executable_leaf_requirement" },
  implementationBindingRef: ref,
  inputContractRef: ref,
  outputContractRef: ref,
  evidenceContractRef: ref,
  failureContractRef: ref,
  refusalContractRef: ref,
  judgmentContractRef: ref,
});

const interactionLeafRequirement = exactObject({
  kind: { const: "interaction_leaf_requirement" },
  interactionKind: ref,
  actorCapabilityRef: ref,
  requestContractRef: ref,
  responseContractRef: ref,
  continuationContractRef: ref,
});

const cInterface = {
  inputCarrierRef: ref,
  outputCarrierRef: ref,
};

const cProgram = {
  oneOf: [
    exactObject({
      kind: { const: "c_of" },
      ...cInterface,
      programLocusRef: ref,
      stageRole: ref,
      fibre: { enum: ["F_D", "F_P", "F_H"] },
      armId: ref,
      compositionRef: { oneOf: [ref, { type: "null" }] },
      vectorIndex: nonnegativeInteger,
      judgmentPredicateRef: ref,
      resultBearing: bool,
      requirement: {
        oneOf: [executableLeafRequirement, interactionLeafRequirement],
      },
    }),
    exactObject({
      kind: { const: "c_identity" },
      ...cInterface,
    }),
    exactObject({
      kind: { const: "c_compose" },
      ...cInterface,
      terms: arrayOf({ $ref: "#/$defs/GtlCProgram" }, { minItems: 2 }),
    }),
    exactObject({
      kind: { const: "c_edge" },
      ...cInterface,
      transform: { $ref: "#/$defs/COf" },
      evaluate: { $ref: "#/$defs/COf" },
      consequence: { $ref: "#/$defs/COf" },
    }),
    exactObject({
      kind: { const: "c_workflow" },
      ...cInterface,
      graphFunctionRef: ref,
    }),
    exactObject({
      kind: { const: "c_batch" },
      ...cInterface,
      taskInputCarrierRef: ref,
      taskOutputCarrierRef: ref,
      batchRef: ref,
      tasks: arrayOf({ $ref: "#/$defs/GtlCProgram" }, { minItems: 1 }),
    }),
    exactObject({
      kind: { const: "c_retry" },
      ...cInterface,
      budget: positiveInteger,
      term: { $ref: "#/$defs/GtlCProgram" },
    }),
  ],
} as const;

const applicationBase = {
  kind: { const: "graph_function_application" },
  applicationRef: ref,
  inputContractRef: ref,
  outputContractRef: ref,
};

function application(
  relationKind: string,
  properties: Readonly<Record<string, Schema>>,
): Schema {
  return exactObject({
    ...applicationBase,
    relationKind: { const: relationKind },
    ...properties,
  });
}

const graphFunctionApplication: Schema = {
  oneOf: [
    application("compose", {
      leftGraphFunctionRef: ref,
      rightGraphFunctionRef: ref,
    }),
    application("substitute", {
      outerGraphFunctionRef: ref,
      targetVectorRef: ref,
      innerGraphFunctionRef: ref,
    }),
    application("recurse", {
      graphFunctionRef: ref,
      terminationRuleRef: ref,
      terminationEvaluatorRefs: arrayOf(ref, { minItems: 1, uniqueItems: true }),
      terminationFieldRef: ref,
      foldbackRef: ref,
      foldback: exactObject({
        mode: { const: "rebind" },
        binding: ref,
        requiresParentEvaluation: { const: true },
      }),
      bound: positiveInteger,
    }),
    application("fan_out", {
      batchRef: ref,
      elementGraphFunctionRef: ref,
      inputVectorRef: ref,
      outputVectorRef: ref,
      inputMemberContractRef: ref,
      outputMemberContractRef: ref,
    }),
    application("fan_in", {
      reducerGraphFunctionRef: ref,
      inputVectorRef: ref,
    }),
    application("gate", {
      targetRef: ref,
      ruleRef: ref,
      evaluatorRefs: arrayOf(ref, { minItems: 1, uniqueItems: true }),
    }),
    application("re_enter", {
      graphFunctionRef: ref,
      sourceProgramLocusRef: ref,
      targetProgramLocusRef: ref,
      maxApplications: positiveInteger,
    }),
    application("promote", { sourceRef: ref, targetRef: ref }),
    application("identity", { targetRef: ref }),
    application("same_object", {
      leftRef: ref,
      rightRef: ref,
      witnessRef: ref,
    }),
  ],
};

const graphFunction = exactObject({
  kind: { const: "graph_function" },
  id: ref,
  name: ref,
  version: { const: "5.0.0" },
  environment: exactObject({
    requires: uniqueStringArray,
    provides: uniqueStringArray,
    carries: uniqueStringArray,
  }),
  inputs: arrayOf(ref, { minItems: 1 }),
  outputs: arrayOf(ref, { minItems: 1 }),
  template: exactObject({
    kind: { const: "inline_graph" },
    graphRef: ref,
    startNodeRef: ref,
    terminalNodeRefs: arrayOf(ref, { minItems: 1, uniqueItems: true }),
    nodes: arrayOf(exactObject({
      nodeRef: ref,
      nodeKind: { const: "c_locus" },
      term: { $ref: "#/$defs/GtlCProgram" },
    }), { minItems: 1 }),
    edges: arrayOf(exactObject({
      edgeRef: ref,
      fromNodeRef: ref,
      toNodeRef: ref,
    })),
    applications: arrayOf({ $ref: "#/$defs/GraphFunctionApplication" }),
  }),
  effects: uniqueStringArray,
  declarations: {
    type: "object",
    additionalProperties: ref,
  },
  tags: uniqueStringArray,
});

const actionCatalogRow = exactObject({
  kind: { const: "action_catalog_row" },
  actionRef: ref,
  actionKind: ref,
  programRef: ref,
  graphFunctionRef: ref,
  targetProgramLocusRef: ref,
  targetObligationRefs: uniqueStringArray,
  inputAssetRefs: uniqueStringArray,
  outputAssetRefs: uniqueStringArray,
  expectedDeltaRef: ref,
  progressConditionRef: ref,
  stopConditionRef: ref,
});

const constructionComposition = exactObject({
  kind: { const: "construction_composition" },
  schemaVersion: { const: "5.0.0" },
  compositionRef: ref,
  compositionDigest: digest,
  graphFunctionRef: ref,
  authorities: arrayOf(exactObject({
    kind: { const: "construction_authority_binding" },
    semanticAuthority: {
      enum: ["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"],
    },
    authorityRef: ref,
    initialProgramLocusRef: ref,
    refreshProgramLocusRef: { oneOf: [ref, { type: "null" }] },
  }), { minItems: 4, maxItems: 4 }),
  interactionProgramLocusRef: ref,
  closurePolicy: exactObject({
    kind: { const: "construction_policy" },
    policyRef: ref,
    requireCompleteEvidence: bool,
    requirePostEvidenceRefresh: bool,
  }),
});

const program = exactObject({
  kind: { const: "gtl_program" },
  programRef: ref,
  version: { const: "5.0.0" },
  moduleRef: ref,
  starts: arrayOf(exactObject({ startRef: ref, graphFunctionRef: ref }), {
    minItems: 1,
  }),
  callableMembership: arrayOf(ref, { minItems: 1 }),
  closureContractRef: ref,
  policies: { type: "object", additionalProperties: ref },
  publicAssetTargets: arrayOf(exactObject({
    kind: { const: "program_public_asset_target" },
    handle: ref,
    assetRef: ref,
    startRef: ref,
  })),
  actionCatalog: exactObject({
    kind: { const: "action_catalog" },
    schemaVersion: { const: "5.0.0" },
    catalogRef: ref,
    catalogDigest: digest,
    rows: arrayOf(actionCatalogRow),
  }),
  constructionComposition,
}, [
  "kind",
  "programRef",
  "version",
  "moduleRef",
  "starts",
  "callableMembership",
  "closureContractRef",
  "policies",
]);

const closureBasis = {
  kind: { const: "closure_contract" },
  closureContractRef: ref,
  predicateRef: ref,
  evidenceContractRef: ref,
  resultContractRef: ref,
  refusalContractRef: ref,
  refusalValueKind: ref,
  judgmentContractRef: ref,
  rejectionContractRef: ref,
  transitionContractRef: ref,
  replayProjectionRef: ref,
  terminalKind: { const: "completed" },
};

const closureContract = {
  oneOf: [
    exactObject({
      ...closureBasis,
      closureScope: { const: "run" },
      eventKindRefs: {
        type: "array",
        prefixItems: [
          { const: "terminal_reached" },
          { const: "frame_closed" },
          { const: "graph_call_closed" },
          { const: "run_closed" },
        ],
        minItems: 4,
        maxItems: 4,
      },
    }),
    exactObject({
      ...closureBasis,
      closureScope: { const: "graph_call" },
      eventKindRefs: {
        type: "array",
        prefixItems: [
          { const: "terminal_reached" },
          { const: "frame_closed" },
          { const: "graph_call_closed" },
        ],
        minItems: 3,
        maxItems: 3,
      },
    }),
  ],
};

const modulePublication = exactObject({
  kind: { const: "module_publication" },
  moduleRef: ref,
  moduleVersion: { const: "5.0.0" },
  owningProductId: ref,
  artifactDigest: digest,
  productContentDigest: digest,
  productManifestDigest: digest,
  descriptorRef: ref,
  contributionManifestRef: ref,
  productSemanticsBinding: exactObject({
    kind: { const: "product_semantics_binding" },
    bindingRef: ref,
    packageName: ref,
    packageVersion: ref,
    modulePath: ref,
    namedSymbol: ref,
  }),
  contracts: arrayOf(exactObject({
    contractRef: ref,
    contractVersion: { const: "5.0.0" },
    contractKind: {
      enum: [
        "closure",
        "evidence",
        "failure",
        "input",
        "judgment",
        "output",
        "refusal",
        "transition",
      ],
    },
    valueKind: ref,
  })),
  evaluators: arrayOf(exactObject({
    name: ref,
    regime: { enum: ["F_D", "F_P", "F_H"] },
    description: { type: "string" },
    binding: ref,
    consumedFieldRefs: uniqueStringArray,
    tags: uniqueStringArray,
  })),
  rules: arrayOf(exactObject({
    name: ref,
    kind: ref,
    config: { type: "object" },
    tags: uniqueStringArray,
  })),
  implementationBindings: arrayOf(exactObject({
    kind: { const: "implementation_binding" },
    bindingRef: ref,
    implementationRef: ref,
    packageName: ref,
    packageVersion: ref,
    modulePath: ref,
    namedSymbol: ref,
    computeRegime: { enum: ["F_D", "F_P"] },
    inputContractRef: ref,
    outputContractRef: ref,
    failureContractRef: ref,
    refusalContractRef: ref,
  })),
  closureContracts: arrayOf(closureContract),
  programs: arrayOf({ $ref: "#/$defs/GtlProgram" }, { minItems: 1 }),
  graphFunctions: arrayOf({ $ref: "#/$defs/GtlGraphFunction" }, {
    minItems: 1,
  }),
  contributions: arrayOf(exactObject({
    handle: ref,
    kind: { enum: ["graph_function", "node_type", "overlay"] },
    declarationOrContractRef: ref,
    owningProductId: ref,
    programMembershipRefs: uniqueStringArray,
    readinessPrerequisiteRefs: uniqueStringArray,
    compatibilityRefs: uniqueStringArray,
    provenanceRefs: uniqueStringArray,
  }), { minItems: 1 }),
});

const conformanceInput = exactObject({
  kind: { const: "gtl_program_conformance_input" },
  schemaVersion: { const: "5.0.0" },
  subjectRef: ref,
  programRef: ref,
  module: { $ref: "#/$defs/GtlModule" },
});

const runtimeDispositionExpectation = exactObject({
  kind: { const: "gtl_runtime_disposition_expectation" },
  selectedGraphFunctionRef: ref,
  selectedProgramLocusRef: ref,
  unavailableImplementationBindingRef: ref,
  expectedDisposition: { const: "semantic_not_realized" },
  verificationDisposition: { const: "dependency_red" },
  dependencyFeatureRef: { const: "A5-F03" },
  semanticRequirementRef: {
    const:
      "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014",
  },
  corpusRequirementRef: {
    const:
      "specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-017",
  },
});

const corpus = exactObject({
  kind: { const: "gtl_language_conformance_corpus" },
  schemaVersion: { const: "5.0.0" },
  corpusRef: ref,
  entriesDigest: digest,
  diagnosticVocabularyContractId: {
    const: "abg.vocabulary.gtl-program-diagnostic-id",
  },
  entries: arrayOf(exactObject({
    caseRef: ref,
    input: {
      oneOf: [
        { $ref: "#/$defs/GtlProgramConformanceInput" },
        { type: "string", minLength: 1 },
      ],
    },
    expectedDiagnosticIds: arrayOf({
      enum: [...GTL_PROGRAM_DIAGNOSTIC_ID_VALUES],
    }, { uniqueItems: true }),
    runtimeExpectation: runtimeDispositionExpectation,
  }, ["caseRef", "input", "expectedDiagnosticIds"]), { minItems: 1 }),
});

export const GTL_PUBLIC_SCHEMA = deepFreeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "abg.schema.gtl-language",
  title: "ABIogenesis 5.0 direct GTL language carriers",
  oneOf: [
    { $ref: "#/$defs/GtlGraphFunction" },
    { $ref: "#/$defs/GtlModule" },
    { $ref: "#/$defs/GtlCProgram" },
    { $ref: "#/$defs/GtlProgramConformanceInput" },
    { $ref: "#/$defs/GtlLanguageConformanceCorpus" },
  ],
  $defs: {
    COf: cProgram.oneOf[0],
    GtlCProgram: cProgram,
    GraphFunctionApplication: graphFunctionApplication,
    GtlGraphFunction: graphFunction,
    GtlProgram: program,
    GtlModule: modulePublication,
    GtlProgramConformanceInput: conformanceInput,
    GtlLanguageConformanceCorpus: corpus,
  },
} as unknown as JsonValue);
