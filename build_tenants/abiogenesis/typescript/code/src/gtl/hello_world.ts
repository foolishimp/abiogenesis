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
} from "./contracts.js";
import { deepFreeze } from "../product/immutable.js";

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
  closureContractRef: "contract://abiogenesis/conformance/hello-closure@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-world-fd@5",
  implementationRef: "implementation://abiogenesis/conformance/hello-world-fd@5",
});

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
  const contracts: readonly ContractDeclaration[] = [
    { contractRef: HELLO_WORLD_IDS.inputContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: "hello_world_input" },
    { contractRef: HELLO_WORLD_IDS.outputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "hello_world_output" },
    { contractRef: HELLO_WORLD_IDS.failureContractRef, contractVersion: "5.0.0", contractKind: "failure", valueKind: "hello_world_failure" },
    { contractRef: HELLO_WORLD_IDS.refusalContractRef, contractVersion: "5.0.0", contractKind: "refusal", valueKind: "hello_world_refusal" },
    { contractRef: HELLO_WORLD_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "hello_world_closure" },
  ];
  const implementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: HELLO_WORLD_IDS.implementationBindingRef,
    implementationRef: HELLO_WORLD_IDS.implementationRef,
    computeRegime: "F_D",
    inputContractRef: HELLO_WORLD_IDS.inputContractRef,
    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const closureContract: ClosureContract = {
    kind: "closure_contract",
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    predicateRef: "predicate://abiogenesis/conformance/hello-world-terminal@5",
    resultContractRef: HELLO_WORLD_IDS.outputContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
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
          computeRegime: "F_D",
          implementationBindingRef: HELLO_WORLD_IDS.implementationBindingRef,
          inputContractRef: HELLO_WORLD_IDS.inputContractRef,
          outputContractRef: HELLO_WORLD_IDS.outputContractRef,
        },
      ],
      edges: [],
    },
    effects: ["effect://abiogenesis/conformance/emit-hello-output@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": HELLO_WORLD_IDS.closureContractRef,
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
  const contribution: CatalogContribution = {
    handle: HELLO_WORLD_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: HELLO_WORLD_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [HELLO_WORLD_IDS.programRef],
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
    implementationBindings: [implementationBinding],
    closureContracts: [closureContract],
    programs: [program],
    graphFunctions: [graphFunction],
    contributions: [contribution],
  };
  return deepFreeze(publicationBody) as Readonly<ModulePublication>;
}
