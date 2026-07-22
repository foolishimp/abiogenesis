import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RootModuleArtifactBasis,
  HelloWorldInput,
  HelloWorldOutput,
  NormalizedHelloInput,
} from "./contracts.js";
import { C, cCarrier } from "./c_algebra.js";
import { deepFreeze } from "../shared/immutable.js";

export const HELLO_WORLD_IDS = Object.freeze({
  moduleRef: "module://abiogenesis/conformance/hello-world@5",
  programRef: "program://abiogenesis/conformance/hello-world@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/hello-world@5",
  graphRef: "graph://abiogenesis/conformance/hello-world@5",
  nodeRef: "node://abiogenesis/conformance/hello-world/fd-leaf@5",
  inputContractRef: "contract://abiogenesis/conformance/hello-input@5",
  outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
  failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
  evidenceContractRef: "contract://abiogenesis/conformance/hello-evidence@5",
  judgmentContractRef: "contract://abiogenesis/conformance/hello-judgment@5",
  transitionContractRef: "contract://abiogenesis/conformance/hello-transition@5",
  closureContractRef: "contract://abiogenesis/conformance/hello-closure@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-world-fd@5",
  implementationRef: "implementation://abiogenesis/conformance/hello-world-fd@5",
  armId: "arm://abiogenesis/conformance/hello-world/fd@5",
  judgmentPredicateRef: "predicate://abiogenesis/conformance/hello-world-result@5",
});

export const COMPOSED_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/hello-compose@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/hello-compose@5",
  graphRef: "graph://abiogenesis/conformance/hello-compose@5",
  nodeRef: "node://abiogenesis/conformance/hello-compose@5",
  normalizeLocusRef: "locus://abiogenesis/conformance/hello-compose/normalize@5",
  renderLocusRef: "locus://abiogenesis/conformance/hello-compose/render@5",
  normalizedInputContractRef:
    "contract://abiogenesis/conformance/normalized-hello-input@5",
  normalizeImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-normalize-fd@5",
  normalizeImplementationRef:
    "implementation://abiogenesis/conformance/hello-normalize-fd@5",
  renderImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-render-fd@5",
  renderImplementationRef:
    "implementation://abiogenesis/conformance/hello-render-fd@5",
  normalizeArmId: "arm://abiogenesis/conformance/hello-compose/normalize-fd@5",
  renderArmId: "arm://abiogenesis/conformance/hello-compose/render-fd@5",
  compositionRef: "composition://abiogenesis/conformance/hello-compose@5",
  normalizeJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/hello-normalized@5",
  renderJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/hello-compose-result@5",
});

export interface ConformanceJudgmentRelation {
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: unknown, output: unknown) => boolean;
}

export function isHelloWorldInput(value: unknown): value is Readonly<HelloWorldInput> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Readonly<Record<string, unknown>>).kind === "hello_world_input" &&
    (value as Readonly<Record<string, unknown>>).schemaVersion === "5.0.0" &&
    typeof (value as Readonly<Record<string, unknown>>).subject === "string";
}

export function isNormalizedHelloInput(
  value: unknown,
): value is Readonly<NormalizedHelloInput> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Readonly<Record<string, unknown>>).kind === "normalized_hello_input" &&
    (value as Readonly<Record<string, unknown>>).schemaVersion === "5.0.0" &&
    typeof (value as Readonly<Record<string, unknown>>).subject === "string";
}

export function evaluateHelloWorldResult(
  input: Readonly<HelloWorldInput>,
  output: Readonly<HelloWorldOutput>,
): boolean {
  return output.kind === "hello_world_output" &&
    output.schemaVersion === "5.0.0" &&
    output.message === `Hello ${input.subject}`;
}

export function evaluateNormalizedHelloResult(
  input: Readonly<HelloWorldInput>,
  output: Readonly<NormalizedHelloInput>,
): boolean {
  return output.kind === "normalized_hello_input" &&
    output.schemaVersion === "5.0.0" &&
    output.subject === input.subject.trim() &&
    output.subject.length > 0;
}

export function evaluateComposedHelloResult(
  input: Readonly<NormalizedHelloInput>,
  output: Readonly<HelloWorldOutput>,
): boolean {
  return output.kind === "hello_world_output" &&
    output.schemaVersion === "5.0.0" &&
    output.message === `Hello ${input.subject}`;
}

export function resolveConformanceJudgmentRelation(
  predicateRef: string,
): Readonly<ConformanceJudgmentRelation> | null {
  switch (predicateRef) {
    case HELLO_WORLD_IDS.judgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-world-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-world-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isHelloWorldInput(input) &&
          isHelloWorldOutput(output) &&
          evaluateHelloWorldResult(input, output),
      });
    case COMPOSED_HELLO_IDS.normalizeJudgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-normalized@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-normalization-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isHelloWorldInput(input) &&
          isNormalizedHelloInput(output) &&
          evaluateNormalizedHelloResult(input, output),
      });
    case COMPOSED_HELLO_IDS.renderJudgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-compose-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-compose-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isNormalizedHelloInput(input) &&
          isHelloWorldOutput(output) &&
          evaluateComposedHelloResult(input, output),
      });
    default:
      return null;
  }
}

export function isHelloWorldOutput(value: unknown): value is Readonly<HelloWorldOutput> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Readonly<Record<string, unknown>>).kind === "hello_world_output" &&
    (value as Readonly<Record<string, unknown>>).schemaVersion === "5.0.0" &&
    typeof (value as Readonly<Record<string, unknown>>).message === "string";
}

export function constructHelloWorldInput(subject: string): Readonly<HelloWorldInput> {
  if (subject.length === 0) {
    throw new TypeError("Hello World input requires one non-empty subject");
  }
  return deepFreeze({
    kind: "hello_world_input",
    schemaVersion: "5.0.0",
    subject,
  });
}

export function constructHelloWorldModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const inputCarrier = cCarrier<HelloWorldInput>(HELLO_WORLD_IDS.inputContractRef);
  const outputCarrier = cCarrier<HelloWorldOutput>(HELLO_WORLD_IDS.outputContractRef);
  const normalizedInputCarrier = cCarrier<NormalizedHelloInput>(
    COMPOSED_HELLO_IDS.normalizedInputContractRef,
  );
  const contracts: readonly ContractDeclaration[] = [
    { contractRef: HELLO_WORLD_IDS.inputContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: "hello_world_input" },
    { contractRef: HELLO_WORLD_IDS.outputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "hello_world_output" },
    { contractRef: HELLO_WORLD_IDS.failureContractRef, contractVersion: "5.0.0", contractKind: "failure", valueKind: "hello_world_failure" },
    { contractRef: HELLO_WORLD_IDS.refusalContractRef, contractVersion: "5.0.0", contractKind: "refusal", valueKind: "hello_world_refusal" },
    { contractRef: HELLO_WORLD_IDS.evidenceContractRef, contractVersion: "5.0.0", contractKind: "evidence", valueKind: "deterministic_evidence_candidate" },
    { contractRef: HELLO_WORLD_IDS.judgmentContractRef, contractVersion: "5.0.0", contractKind: "judgment", valueKind: "hello_world_judgment" },
    { contractRef: HELLO_WORLD_IDS.transitionContractRef, contractVersion: "5.0.0", contractKind: "transition", valueKind: "hello_world_transition" },
    { contractRef: HELLO_WORLD_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "hello_world_closure" },
    { contractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "normalized_hello_input" },
  ];
  const implementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: HELLO_WORLD_IDS.implementationBindingRef,
    implementationRef: HELLO_WORLD_IDS.implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_world.js",
    namedSymbol: "realizeHelloWorld",
    computeRegime: "F_D",
    inputContractRef: HELLO_WORLD_IDS.inputContractRef,
    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const normalizeImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: COMPOSED_HELLO_IDS.normalizeImplementationBindingRef,
    implementationRef: COMPOSED_HELLO_IDS.normalizeImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "normalizeHelloInput",
    computeRegime: "F_D",
    inputContractRef: HELLO_WORLD_IDS.inputContractRef,
    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const renderImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: COMPOSED_HELLO_IDS.renderImplementationBindingRef,
    implementationRef: COMPOSED_HELLO_IDS.renderImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "renderNormalizedHello",
    computeRegime: "F_D",
    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const closureContract: ClosureContract = {
    kind: "closure_contract",
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    predicateRef: "predicate://abiogenesis/conformance/hello-world-terminal@5",
    evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
    resultContractRef: HELLO_WORLD_IDS.outputContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
    refusalValueKind: "hello_world_refusal",
    judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
    rejectionContractRef: HELLO_WORLD_IDS.refusalContractRef,
    transitionContractRef: HELLO_WORLD_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/conformance/hello-world-replay@5",
    terminalKind: "completed",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  };
  const graphFunction: GraphFunction = {
    kind: "graph_function",
    name: HELLO_WORLD_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [HELLO_WORLD_IDS.inputContractRef],
      provides: [HELLO_WORLD_IDS.outputContractRef],
      carries: [HELLO_WORLD_IDS.inputContractRef, HELLO_WORLD_IDS.outputContractRef],
    },
    inputs: [HELLO_WORLD_IDS.inputContractRef],
    outputs: [HELLO_WORLD_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: HELLO_WORLD_IDS.graphRef,
      startNodeRef: HELLO_WORLD_IDS.nodeRef,
      terminalNodeRefs: [HELLO_WORLD_IDS.nodeRef],
      nodes: [
        {
          nodeRef: HELLO_WORLD_IDS.nodeRef,
          nodeKind: "c_locus",
          term: C.of({
            input: inputCarrier,
            output: outputCarrier,
            programLocusRef: HELLO_WORLD_IDS.nodeRef,
            stageRole: "result",
            fibre: "F_D",
            armId: HELLO_WORLD_IDS.armId,
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef: HELLO_WORLD_IDS.judgmentPredicateRef,
            resultBearing: true,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef: HELLO_WORLD_IDS.implementationBindingRef,
              inputContractRef: HELLO_WORLD_IDS.inputContractRef,
              outputContractRef: HELLO_WORLD_IDS.outputContractRef,
              evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
              failureContractRef: HELLO_WORLD_IDS.failureContractRef,
              refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
              judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
            },
          }),
        },
      ],
      edges: [],
      applications: [],
    },
    effects: ["effect://abiogenesis/conformance/emit-hello-output@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": HELLO_WORLD_IDS.closureContractRef,
      "abg.evidence_contract": HELLO_WORLD_IDS.evidenceContractRef,
      "abg.judgment_contract": HELLO_WORLD_IDS.judgmentContractRef,
      "abg.judgment_predicate": HELLO_WORLD_IDS.judgmentPredicateRef,
      "abg.transition_contract": HELLO_WORLD_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "hello-world", "all-fd"],
  };
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: HELLO_WORLD_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [
      {
        startRef: "start://abiogenesis/conformance/hello-world@5",
        graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
      },
    ],
    callableMembership: [HELLO_WORLD_IDS.graphFunctionRef],
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const composedGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: COMPOSED_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [HELLO_WORLD_IDS.inputContractRef],
      provides: [HELLO_WORLD_IDS.outputContractRef],
      carries: [
        HELLO_WORLD_IDS.inputContractRef,
        COMPOSED_HELLO_IDS.normalizedInputContractRef,
        HELLO_WORLD_IDS.outputContractRef,
      ],
    },
    inputs: [HELLO_WORLD_IDS.inputContractRef],
    outputs: [HELLO_WORLD_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: COMPOSED_HELLO_IDS.graphRef,
      startNodeRef: COMPOSED_HELLO_IDS.nodeRef,
      terminalNodeRefs: [COMPOSED_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: COMPOSED_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.of({
            input: inputCarrier,
            output: normalizedInputCarrier,
            programLocusRef: COMPOSED_HELLO_IDS.normalizeLocusRef,
            stageRole: "transform",
            fibre: "F_D",
            armId: COMPOSED_HELLO_IDS.normalizeArmId,
            compositionRef: COMPOSED_HELLO_IDS.compositionRef,
            vectorIndex: 0,
            judgmentPredicateRef: COMPOSED_HELLO_IDS.normalizeJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                COMPOSED_HELLO_IDS.normalizeImplementationBindingRef,
              inputContractRef: HELLO_WORLD_IDS.inputContractRef,
              outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
              evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
              failureContractRef: HELLO_WORLD_IDS.failureContractRef,
              refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
              judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
            },
          }),
          C.of({
            input: normalizedInputCarrier,
            output: outputCarrier,
            programLocusRef: COMPOSED_HELLO_IDS.renderLocusRef,
            stageRole: "result",
            fibre: "F_D",
            armId: COMPOSED_HELLO_IDS.renderArmId,
            compositionRef: COMPOSED_HELLO_IDS.compositionRef,
            vectorIndex: 1,
            judgmentPredicateRef: COMPOSED_HELLO_IDS.renderJudgmentPredicateRef,
            resultBearing: true,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                COMPOSED_HELLO_IDS.renderImplementationBindingRef,
              inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
              outputContractRef: HELLO_WORLD_IDS.outputContractRef,
              evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
              failureContractRef: HELLO_WORLD_IDS.failureContractRef,
              refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
              judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
            },
          }),
        ),
      }],
      edges: [],
      applications: [],
    },
    effects: [
      "effect://abiogenesis/conformance/normalize-hello-input@5",
      "effect://abiogenesis/conformance/emit-hello-output@5",
    ],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": HELLO_WORLD_IDS.closureContractRef,
      "abg.evidence_contract": HELLO_WORLD_IDS.evidenceContractRef,
      "abg.transition_contract": HELLO_WORLD_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "hello-compose", "all-fd"],
  };
  const composedProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: COMPOSED_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/hello-compose@5",
      graphFunctionRef: COMPOSED_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [COMPOSED_HELLO_IDS.graphFunctionRef],
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const contribution: CatalogContribution = {
    handle: HELLO_WORLD_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: HELLO_WORLD_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [HELLO_WORLD_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const composedContribution: CatalogContribution = {
    handle: COMPOSED_HELLO_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: COMPOSED_HELLO_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [COMPOSED_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const publicationBody = {
    kind: "module_publication" as const,
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    moduleVersion: "5.0.0" as const,
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice("sha256:".length)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice("sha256:".length)}`,
    contracts,
    implementationBindings: [
      implementationBinding,
      normalizeImplementationBinding,
      renderImplementationBinding,
    ],
    closureContracts: [closureContract],
    programs: [program, composedProgram],
    graphFunctions: [graphFunction, composedGraphFunction],
    contributions: [contribution, composedContribution],
  };
  return deepFreeze(publicationBody) as Readonly<ModulePublication>;
}
