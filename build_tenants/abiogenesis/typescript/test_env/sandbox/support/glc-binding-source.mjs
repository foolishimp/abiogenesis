// ONE canonical GLC sandbox binding-source builder (DMM self-review F2/F4).
// Both sandbox lanes (t180 canonical hello-world, t194 feature matrix)
// consume THIS builder — canonical repairs land once. Variants are a
// TYPED option surface: unknown keys throw (no silent template config).
import { pathToFileURL } from "node:url";
import path from "node:path";

const KNOWN_OPTIONS = new Set([
  "packageRoot",
  "packageVersion",
  "includeCarryThrough",
  "carryDepthClassRefs",
  "stubDispatch",
  "stubArtifactVariant",
  "omitInstructionAssembly",
  "registryDecoy",
  "constrainCandidates"
]);

export function runtimeBindingSource(input) {
  for (const key of Object.keys(input)) {
    if (!KNOWN_OPTIONS.has(key)) {
      throw new Error(`unknown binding variant option: ${key}`);
    }
  }
  const packageImport = pathToFileURL(
    path.join(input.packageRoot, "build", "semantic", "code", "src", "index.js")
  ).href;
  const gtlRequirementsImport = pathToFileURL(
    path.join(input.packageRoot, "build", "semantic", "code", "src", "gtl", "requirements", "index.js")
  ).href;
  const typeRefs = {
    bootstrapContext: "node-type://odd_glc/GlcBootstrapContext",
    lifecycleArtifact: "node-type://odd_glc/GlcLifecycleArtifact",
    executableArtifact: "node-type://odd_glc/GlcExecutableArtifact",
    helloWorldProgram: "node-type://odd_glc/GlcHelloWorldProgramArtifact",
    executionEvidence: "node-type://odd_glc/GlcExecutionEvidence"
  };
  return `import {
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  composeWithTypeWiring,
  composeNodeTypes,
  compileInstructionAssemblyPlan,
  constructDerivedDependencyInstructionTruth,
  constructDerivedProofDepthInstructionTruth,
  constructDefaultAbgFnCompositionDeclarations,
  constructFpDispatchOutcome,
  constructGtlContractFulfillmentBinding,
  constructRequirementProofCandidateClassificationTable,
  constructRequirementProofCarryThroughContract,
  constructGtlLibraryEntryDeclaration,
  constructInstructionAssemblyRule,
  constructInstructionSectionDecision,
  constructNode,
  constructNodeTypeGraphFunction,
  constructProductRegistryStartupConfig,
  STANDING_GATE_TEMPORAL_PROPERTY_RULES,
  constructRuntimeBindingSlot,
  contractForKnownAgent,
  defaultFpDispatchPlugin,
  defaultFpEvaluatorPlugin,
  edge,
  graphFunctionForVector,
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  runAgentTransport,
  satisfiesNodeType
} from ${JSON.stringify(packageImport)};
import {
  declareBundle,
  declareRequirement,
  declareTraversalSpan
} from ${JSON.stringify(gtlRequirementsImport)};
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const TYPE_REFS = Object.freeze(${JSON.stringify(typeRefs, null, 2)});
const PACKAGE_VERSION = ${JSON.stringify(input.packageVersion)};
const PRODUCT_NAMESPACE = "odd_glc";
const OWNER_REF = "owner://odd_glc";
const OVERLAY_REF = "overlay://odd_glc/glc-hello-world-bootstrap";
const MODULE_REF = "gtl://module/odd-glc/glc-hello-world-bootstrap";

function uniq(values) {
  return Object.freeze([...new Set(values)].sort());
}

function assetSurface(input) {
  return Object.freeze({
    kind: input.kind,
    requiredContexts: uniq(input.requiredContexts ?? []),
    standardsRefs: uniq(input.standardsRefs ?? []),
    outputContractRefs: uniq(input.outputContractRefs ?? []),
    constructorRefs: uniq(input.constructorRefs ?? []),
    constructorInputAssetKinds: uniq(input.constructorInputAssetKinds ?? []),
    rendererRefs: uniq(input.rendererRefs ?? []),
    renderedViewDigestPolicyRef: input.renderedViewDigestPolicyRef ?? null,
    sectionKindRefs: uniq(input.sectionKindRefs ?? []),
    clauseKindRefs: uniq(input.clauseKindRefs ?? []),
    authoritySlots: Object.freeze([]),
    proofObligationRefs: uniq(input.proofObligationRefs ?? [])
  });
}

function typedNode(input) {
  return constructNode({
    name: input.name,
    schema: { kind: "symbolic", ref: input.schemaRef },
    typeRef: input.typeRef,
    markov: input.markov,
    assetSurface: assetSurface(input.assetSurface),
    tags: uniq(["odd_glc", "t180", ...(input.tags ?? [])])
  });
}

function admittedNode(input) {
  return admitNode(typedNode(input));
}

function nodeType(input) {
  return constructNodeTypeGraphFunction(typedNode(input));
}

const bootstrapContextType = nodeType({
  name: "GlcBootstrapContextType",
  schemaRef: "schema://odd_glc/glc-bootstrap-context",
  typeRef: TYPE_REFS.bootstrapContext,
  markov: ["glc:bootstrap"],
  assetSurface: {
    kind: "glc_bootstrap_context",
    requiredContexts: ["context://odd_glc/bootstrap"],
    outputContractRefs: ["contract://odd_glc/bootstrap-context"],
    proofObligationRefs: ["proof://odd_glc/bootstrap-context"]
  },
  tags: ["type"]
});

const lifecycleArtifactType = nodeType({
  name: "GlcLifecycleArtifactType",
  schemaRef: "schema://odd_glc/lifecycle-artifact",
  typeRef: TYPE_REFS.lifecycleArtifact,
  markov: ["glc:lifecycle-artifact"],
  assetSurface: {
    kind: "glc_lifecycle_artifact",
    requiredContexts: ["context://odd_glc/lifecycle"],
    outputContractRefs: ["contract://odd_glc/lifecycle-artifact"],
    proofObligationRefs: ["proof://odd_glc/lifecycle-artifact"]
  },
  tags: ["type"]
});

const executableArtifactType = nodeType({
  name: "GlcExecutableArtifactType",
  schemaRef: "schema://odd_glc/lifecycle-artifact",
  typeRef: TYPE_REFS.executableArtifact,
  markov: ["execution:capable"],
  assetSurface: {
    kind: "glc_lifecycle_artifact",
    requiredContexts: ["context://odd_glc/execution"],
    outputContractRefs: ["contract://odd_glc/lifecycle-artifact"],
    proofObligationRefs: ["proof://odd_glc/executable-artifact"]
  },
  tags: ["type"]
});

const executionEvidenceType = nodeType({
  name: "GlcExecutionEvidenceType",
  schemaRef: "schema://odd_glc/execution-evidence",
  typeRef: TYPE_REFS.executionEvidence,
  markov: ["evidence:execution"],
  assetSurface: {
    kind: "glc_execution_evidence",
    requiredContexts: ["context://odd_glc/evidence"],
    outputContractRefs: ["contract://odd_glc/execution-evidence"],
    proofObligationRefs: ["proof://odd_glc/execution-evidence"]
  },
  tags: ["type"]
});

const composedProgramType = composeNodeTypes({
  typeRef: TYPE_REFS.helloWorldProgram,
  constituentTypeRefs: [
    TYPE_REFS.lifecycleArtifact,
    TYPE_REFS.executableArtifact
  ],
  graphFunctions: [lifecycleArtifactType, executableArtifactType],
  name: "GlcHelloWorldProgramArtifactType",
  tags: ["odd_glc", "t180", "composed-type"]
});
if (!composedProgramType.satisfied || composedProgramType.graphFunction === null) {
  throw new Error("GLC composed Hello World program type failed to materialize");
}

const glcBootstrapContext = admittedNode({
  name: "GlcBootstrapContext",
  schemaRef: "schema://odd_glc/glc-bootstrap-context",
  typeRef: TYPE_REFS.bootstrapContext,
  markov: ["glc:bootstrap"],
  assetSurface: {
    kind: "glc_bootstrap_context",
    requiredContexts: ["context://odd_glc/bootstrap"],
    outputContractRefs: ["contract://odd_glc/bootstrap-context"],
    proofObligationRefs: ["proof://odd_glc/bootstrap-context"]
  },
  tags: ["source"]
});

const generatedProgram = admittedNode({
  name: "GeneratedHelloWorldProgram",
  schemaRef: "schema://odd_glc/lifecycle-artifact",
  typeRef: TYPE_REFS.helloWorldProgram,
  markov: ["glc:lifecycle-artifact", "execution:capable"],
  assetSurface: {
    kind: "glc_lifecycle_artifact",
    requiredContexts: ["context://odd_glc/lifecycle", "context://odd_glc/execution"],
    outputContractRefs: ["contract://odd_glc/lifecycle-artifact"],
    proofObligationRefs: [
      "proof://odd_glc/lifecycle-artifact",
      "proof://odd_glc/executable-artifact"
    ]
  },
  tags: ["program-output"]
});

const runnableProgram = admittedNode({
  name: "RunnableHelloWorldProgram",
  schemaRef: "schema://odd_glc/lifecycle-artifact",
  typeRef: TYPE_REFS.helloWorldProgram,
  markov: ["glc:lifecycle-artifact", "execution:capable"],
  assetSurface: {
    kind: "glc_lifecycle_artifact",
    requiredContexts: ["context://odd_glc/lifecycle", "context://odd_glc/execution"],
    outputContractRefs: ["contract://odd_glc/lifecycle-artifact"],
    proofObligationRefs: [
      "proof://odd_glc/lifecycle-artifact",
      "proof://odd_glc/executable-artifact"
    ]
  },
  tags: ["program-input"]
});

const executionEvidence = admittedNode({
  name: "GlcHelloWorldExecutionEvidence",
  schemaRef: "schema://odd_glc/execution-evidence",
  typeRef: TYPE_REFS.executionEvidence,
  markov: ["evidence:execution"],
  assetSurface: {
    kind: "glc_execution_evidence",
    requiredContexts: ["context://odd_glc/evidence"],
    outputContractRefs: ["contract://odd_glc/execution-evidence"],
    constructorInputAssetKinds: ["glc_lifecycle_artifact"],
    renderedViewDigestPolicyRef: "policy://abg/instruction-causal/excerpt",
    proofObligationRefs: ["proof://odd_glc/execution-evidence"]
  },
  tags: ["evidence-output"]
});

for (const [node, typeRef] of [
  [glcBootstrapContext, TYPE_REFS.bootstrapContext],
  [generatedProgram, TYPE_REFS.helloWorldProgram],
  [runnableProgram, TYPE_REFS.helloWorldProgram],
  [executionEvidence, TYPE_REFS.executionEvidence]
]) {
  const satisfaction = satisfiesNodeType({
    node,
    typeRef,
    graphFunctions: [
      bootstrapContextType,
      lifecycleArtifactType,
      executableArtifactType,
      composedProgramType.graphFunction,
      executionEvidenceType
    ]
  });
  if (!satisfaction.satisfied) {
    throw new Error(\`GLC node \${node.name} does not satisfy \${typeRef}: \${satisfaction.rejectionReason}\`);
  }
}

function vector(source, target, id, name) {
  return edge([source], target, {
    id,
    name,
    evaluators: [
      {
        name: \`\${name}_accepted\`,
        regime: "F_P",
        description: \`\${name} accepted by live worker plus ABG admission\`,
        binding: \`binding://odd_glc/\${name}\`,
        tags: ["odd_glc", "glc-bootstrap"]
      }
    ],
    declarations: (() => {
      const base = constructDefaultAbgFnCompositionDeclarations({
        scopeRef: "odd-glc/glc-hello-world-bootstrap"
      });
      if (!${JSON.stringify(input.constrainCandidates === true)}) {
        return base;
      }
      // typed SerializedAttrs entry — plain record keys are ignored by the
      // declaration reader (entries + string_list carrier only)
      return Object.freeze({
        entries: Object.freeze([
          ...base.entries,
          Object.freeze({
            key: "runtime_registry_candidate_refs",
            value: Object.freeze({
              kind: "string_list",
              value: Object.freeze([
                // every lawful entry EXCEPT the decoy — the vector-scoped
                // constraint governs all registry lookups on this vector
                "registry-entry://odd_glc/glc-bootstrap/graph-function/glc-hello-world-bootstrap",
                "registry-entry://odd_glc/glc-bootstrap/node-type/bootstrap-context",
                "registry-entry://odd_glc/glc-bootstrap/node-type/executable-artifact",
                "registry-entry://odd_glc/glc-bootstrap/node-type/execution-evidence",
                "registry-entry://odd_glc/glc-bootstrap/node-type/hello-world-program",
                "registry-entry://odd_glc/glc-bootstrap/node-type/lifecycle-artifact"
              ])
            })
          })
        ])
      });
    })(),
    tags: ["odd_glc", "glc-bootstrap", "t180"]
  }).vectors[0];
}

const produceProgram = graphFunctionForVector(
  vector(
    glcBootstrapContext,
    generatedProgram,
    "graph-vector://odd_glc/glc-bootstrap/produce-program",
    "glc_bootstrap_to_hello_world_program"
  ),
  {
    id: "graph-function://odd_glc/glc-bootstrap/produce-program",
    name: "odd_glc.glc_bootstrap.produce_hello_world_program",
    tags: ["odd_glc", "glc-bootstrap", "t180"]
  }
);

const proveExecution = graphFunctionForVector(
  vector(
    runnableProgram,
    executionEvidence,
    "graph-vector://odd_glc/glc-bootstrap/prove-execution",
    "glc_hello_world_program_to_execution_evidence"
  ),
  {
    id: "graph-function://odd_glc/glc-bootstrap/prove-execution",
    name: "odd_glc.glc_bootstrap.prove_hello_world_execution",
    tags: ["odd_glc", "glc-bootstrap", "t180"]
  }
);

const glcHelloWorldGraphFunction = composeWithTypeWiring(
  produceProgram,
  proveExecution,
  {
    nodeTypeGraphFunctions: [
      bootstrapContextType,
      lifecycleArtifactType,
      executableArtifactType,
      composedProgramType.graphFunction,
      executionEvidenceType
    ],
    wiring: [
      {
        providedNodeName: "GeneratedHelloWorldProgram",
        requiredNodeName: "RunnableHelloWorldProgram",
        typeRef: TYPE_REFS.helloWorldProgram
      }
    ]
  }
);

const graphFunctions = Object.freeze([
  glcHelloWorldGraphFunction,
  bootstrapContextType,
  lifecycleArtifactType,
  executableArtifactType,
  composedProgramType.graphFunction,
  executionEvidenceType
]);

const module = admitModule({
  name: "odd_glc_glc_hello_world_bootstrap",
  graphs: [glcHelloWorldGraphFunction.template.graph],
  graphFunctions,
  refinementBoundaries: [],
  candidateFamilies: [],
  jobs: [
    {
      id: "job://odd_glc/glc-hello-world-bootstrap",
      name: "odd_glc_glc_hello_world_bootstrap_job",
      contracts: [
        {
          kind: "graph_function",
          targetId: glcHelloWorldGraphFunction.id
        }
      ],
      roles: [],
      tags: ["odd_glc", "glc-bootstrap", "semantic_work"]
    }
  ],
  roles: [],
  operators: [],
  evaluators: [],
  rules: [],
  imports: [],
  metadata: { entries: [] }
});

function libraryEntry(input) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: \`gtl-declaration://odd_glc/glc-bootstrap/\${input.slug}\`,
    entryRef: \`registry-entry://odd_glc/glc-bootstrap/\${input.slug}\`,
    libraryScope: "product",
    entryKind: input.entryKind,
    namespace: PRODUCT_NAMESPACE,
    ownerRef: OWNER_REF,
    version: PACKAGE_VERSION,
    graphFunctionRef: input.graphFunctionRef,
    interfaceRef: input.interfaceRef,
    sourceContractRef: input.sourceContractRef,
    targetContractRef: input.targetContractRef,
    contextRefs: ["context://odd_glc/bootstrap"],
    authorityRefs: input.authorityRefs,
    overlayRefs: [OVERLAY_REF],
    provenanceRefs: ["provenance://odd_glc/glc-bootstrap"],
    readinessRefs: ["readiness://odd_glc/glc-bootstrap/t180"],
    proofRefs: ["proof://odd_glc/glc-bootstrap/live"],
    policyRefs: input.policyRefs,
    declarationSourceRefs: [MODULE_REF]
  });
}

const productDeclarations = Object.freeze([
  libraryEntry({
    slug: "node-type/bootstrap-context",
    entryKind: "node_type",
    graphFunctionRef: bootstrapContextType.name,
    interfaceRef: "interface://odd_glc/node-type/bootstrap-context",
    sourceContractRef: "contract://odd_glc/bootstrap-context",
    targetContractRef: "contract://odd_glc/bootstrap-context",
    authorityRefs: ["authority://gtl/typecheck"],
    policyRefs: ["policy://odd_glc/typecheck-only"]
  }),
  libraryEntry({
    slug: "node-type/lifecycle-artifact",
    entryKind: "node_type",
    graphFunctionRef: lifecycleArtifactType.name,
    interfaceRef: "interface://odd_glc/node-type/lifecycle-artifact",
    sourceContractRef: "contract://odd_glc/lifecycle-artifact",
    targetContractRef: "contract://odd_glc/lifecycle-artifact",
    authorityRefs: ["authority://gtl/typecheck"],
    policyRefs: ["policy://odd_glc/typecheck-only"]
  }),
  libraryEntry({
    slug: "node-type/executable-artifact",
    entryKind: "node_type",
    graphFunctionRef: executableArtifactType.name,
    interfaceRef: "interface://odd_glc/node-type/executable-artifact",
    sourceContractRef: "contract://odd_glc/lifecycle-artifact",
    targetContractRef: "contract://odd_glc/lifecycle-artifact",
    authorityRefs: ["authority://gtl/typecheck"],
    policyRefs: ["policy://odd_glc/typecheck-only"]
  }),
  libraryEntry({
    slug: "node-type/hello-world-program",
    entryKind: "node_type",
    graphFunctionRef: composedProgramType.graphFunction.name,
    interfaceRef: "interface://odd_glc/node-type/hello-world-program",
    sourceContractRef: "contract://odd_glc/lifecycle-artifact",
    targetContractRef: "contract://odd_glc/lifecycle-artifact",
    authorityRefs: ["authority://gtl/typecheck"],
    policyRefs: ["policy://odd_glc/typecheck-only"]
  }),
  libraryEntry({
    slug: "node-type/execution-evidence",
    entryKind: "node_type",
    graphFunctionRef: executionEvidenceType.name,
    interfaceRef: "interface://odd_glc/node-type/execution-evidence",
    sourceContractRef: "contract://odd_glc/execution-evidence",
    targetContractRef: "contract://odd_glc/execution-evidence",
    authorityRefs: ["authority://gtl/typecheck"],
    policyRefs: ["policy://odd_glc/typecheck-only"]
  }),
  libraryEntry({
    slug: "graph-function/glc-hello-world-bootstrap",
    entryKind: "graph_function",
    graphFunctionRef: glcHelloWorldGraphFunction.id,
    interfaceRef: "interface://odd_glc/glc-hello-world-bootstrap",
    sourceContractRef: "contract://odd_glc/bootstrap-context",
    targetContractRef: "contract://odd_glc/execution-evidence",
    authorityRefs: ["authority://abg/runtime"],
    policyRefs: ["policy://odd_glc/glc-bootstrap-selection"]
  })${input.registryDecoy === true ? `,
  libraryEntry({
    slug: "graph-function/decoy-boundary-test",
    entryKind: "graph_function",
    graphFunctionRef: glcHelloWorldGraphFunction.id,
    interfaceRef: "interface://odd_glc/glc-hello-world-bootstrap",
    sourceContractRef: "contract://odd_glc/bootstrap-context",
    targetContractRef: "contract://odd_glc/execution-evidence",
    authorityRefs: ["authority://abg/runtime"],
    policyRefs: ["policy://odd_glc/glc-bootstrap-selection"]
  })` : ""}
]);

const runtimeRegistryStartup = Object.freeze({
  systemDeclarations: Object.freeze([]),
  productStartupConfig: constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://odd_glc/glc-hello-world-bootstrap",
    productNamespace: PRODUCT_NAMESPACE,
    ownerRef: OWNER_REF,
    version: PACKAGE_VERSION,
    enabledLibraryRefs: productDeclarations.flatMap((entry) => [
      entry.entryRef,
      entry.declarationRef
    ]),
    overlayRefs: [OVERLAY_REF],
    pluginRefs: ["plugin://odd_glc/glc-bootstrap/live-fp-dispatch"],
    readinessRefs: ["readiness://odd_glc/glc-bootstrap/t180"],
    proofRefs: ["proof://odd_glc/glc-bootstrap/live"],
    policyRefs: ["policy://odd_glc/glc-bootstrap-selection"],
    configSourceRefs: ["config://odd_glc/glc-bootstrap/startup"]
  }),
  productDeclarations,
  causationEventRefs: ["bootstrap://odd_glc/glc-hello-world-startup"],
  correlationId: "correlation://odd_glc/glc-hello-world-bootstrap/startup"
});

function instructionRuleForVector(input) {
  return constructInstructionAssemblyRule({
    ruleRef: \`instruction-rule://odd_glc/glc-bootstrap/vector-\${input.vectorIndex}\`,
    appliesToGraphFunctionRefs: [glcHelloWorldGraphFunction.id],
    appliesToVectorRefs: [input.vector.name],
    sectionRules: [
      {
        sectionRef: \`section://odd_glc/glc-bootstrap/vector-\${input.vectorIndex}/task\`,
        required: true,
        policyRefs: ["policy://odd_glc/glc-bootstrap/instruction"]
      }
    ],
    relevanceRules: [
      {
        ruleRef: \`relevance://odd_glc/glc-bootstrap/vector-\${input.vectorIndex}\`,
        requiredInputRefs: input.requiredInputRefs,
        allowFutureStageRefs: []
      }
    ],
    compressionPolicyRef: "compression://odd_glc/glc-bootstrap/runtime-bound-excerpts",
    proportionalityPolicyRef: "proportionality://odd_glc/glc-bootstrap/live-worker",
    runtimeBindingSlotClasses: input.requiresPriorArtifact
      ? [
          "graph_call",
          "frame",
          "vector",
          "selected_graph_function",
          "source_node",
          "target_node",
          "event_log",
          "worker_invocation",
          "prior_artifact"
        ]
      : [
          "graph_call",
          "frame",
          "vector",
          "selected_graph_function",
          "source_node",
          "target_node",
          "event_log",
          "worker_invocation"
        ],
    policyRefs: ["policy://odd_glc/glc-bootstrap/live"],
    evidenceRefs: ["evidence://odd_glc/glc-bootstrap/instruction-rule"]
  });
}

function instructionSectionForVector(input) {
  const stage = input.vectorIndex === 0 ? "program" : "execution_evidence";
  return constructInstructionSectionDecision({
    sectionRef: \`section://odd_glc/glc-bootstrap/vector-\${input.vectorIndex}/task\`,
    disposition: "include",
    dependencyRefs: [input.vector.name],
    carrierRefs: input.vector.source.map((node) => node.id).concat(input.vector.target.id),
    compressionMode: input.vectorIndex === 0 ? "digest" : "excerpt",
    text: [
      "Return only one JSON object. Do not include markdown or commentary.",
      "You are the live F_P worker for an odd_glc generic lifecycle Hello World bootstrap.",
      "ABG owns registry startup, graph-function selection, traversal, instruction rendering, event truth, response admission, and closure.",
      "odd_glc supplies product GTL declarations, node types, graph overlay refs, and policy refs as data.",
      \`Current stage: \${stage}\`,
      "",
      "Use the ABG-rendered runtime bound refs section below. Do not claim to emit ABG events, select graph functions, admit responses, or close traversal.",
      "",
      "Required JSON:",
      "{",
      "  \\"stage\\": \\"program\\" | \\"execution_evidence\\",",
      "  \\"source\\": string,",
      "  \\"expectedStdout\\": \\"Hello, world!\\\\n\\",",
      "  \\"nodeTypesUsed\\": string[],",
      "  \\"causalInputPayloadRefsSeen\\": string[],",
      "  \\"causalInputContentDigestSeen\\": string | null,",
      "  \\"causalInputContentSummary\\": string | null,",
      "  \\"reason\\": string",
      "}",
      "",
      "For stage program, provide a minimal JavaScript ESM program in source.",
      \`For stage program, nodeTypesUsed must include exactly \${TYPE_REFS.bootstrapContext} and \${TYPE_REFS.helloWorldProgram}.\`,
      "For stage program, causalInputPayloadRefsSeen must be an empty list.",
      "For stage program, causalInputContentDigestSeen must be null.",
      "For stage program, causalInputContentSummary must be null.",
      "For stage execution_evidence, inspect only the ABG runtime bound_refs prior_artifact row.",
      "For stage execution_evidence, causalInputPayloadRefsSeen must echo exactly the prior_artifact ref values from bound_refs.",
      "For stage execution_evidence, causalInputContentDigestSeen must echo exactly the first prior_artifact contentDigest value.",
      "For stage execution_evidence, causalInputContentSummary must summarize the first prior_artifact contentExcerpt value and mention Hello, world.",
      \`For stage execution_evidence, nodeTypesUsed must include exactly \${TYPE_REFS.helloWorldProgram} and \${TYPE_REFS.executionEvidence}.\`
    ].join("\\n"),
    digestRef: \`sha256:odd-glc-glc-bootstrap-vector-\${input.vectorIndex}\`,
    excerptDigest: input.vectorIndex === 0
      ? null
      : \`sha256:odd-glc-glc-bootstrap-vector-\${input.vectorIndex}-excerpt\`,
    fullContentAdmitted: false,
    stageRef: \`stage://odd_glc/glc-bootstrap/\${stage}\`,
    gapRefs: []
  });
}

function instructionBindingSlots(requiresPriorArtifact) {
  const slots = [
    ["graph_call", "replay_event"],
    ["frame", "replay_event"],
    ["vector", "projection"],
    ["selected_graph_function", "replay_event"],
    ["source_node", "projection"],
    ["target_node", "projection"],
    ["event_log", "projection"],
    ["worker_invocation", "replay_event"]
  ];
  if (requiresPriorArtifact) {
    slots.push(["prior_artifact", "admitted_ref"]);
  }
  return slots.map(([slotClass, sourceTruthKind]) =>
    constructRuntimeBindingSlot({
      slotRef: \`slot://odd_glc/glc-bootstrap/\${slotClass}\${requiresPriorArtifact ? "/with-prior" : ""}\`,
      slotClass,
      required: true,
      sourceTruthKind,
      evidenceRefs: [\`evidence://odd_glc/glc-bootstrap/slot/\${slotClass}\`]
    })
  );
}

function compiledPromptPlanForVector(vectorIndex, computeStageRole = "transform") {
  const vector = glcHelloWorldGraphFunction.template.graph.vectors[vectorIndex];
  if (vector === undefined) {
    throw new Error(\`Missing GLC bootstrap vector \${vectorIndex}\`);
  }
  const requiresPriorArtifact = vectorIndex > 0;
  const requiredInputRefs = requiresPriorArtifact
    ? ["asset_kind=glc_lifecycle_artifact"]
    : [];
  const result = compileInstructionAssemblyPlan({
    planRef: \`compiled-prompt-plan://odd_glc/glc-bootstrap/vector-\${vectorIndex}/\${computeStageRole}\`,
    computeStageRole,
    // T-191: declared latitude (transform) + golden-instance calibration
    // (evaluate) on the requirement-bearing toy edge — the live pilot.
    ...(computeStageRole === "transform"
      ? {
          declaredLatitude: [
            {
              scopeRef: "scope://odd_glc/glc-bootstrap/program-shape",
              ownerRoute: "F_P",
              latitudeNote:
                "worker may choose program structure and identifier naming provided stdout is exactly Hello, world!"
            }
          ]
        }
      : {}),
    ...(computeStageRole === "evaluate"
      ? {
          goldenInstanceCalibration: [
            {
              contractRef: "contract://odd_glc/execution-evidence",
              exampleInstanceRefs: ["payload://odd_glc/golden/hello-world-stdout"],
              counterexampleInstanceRefs: ["payload://odd_glc/golden/reject-empty-stdout"],
              instanceSetDigest: "sha256:odd-glc-golden-hello-world-v1"
            }
          ]
        }
      : {}),
    rule: instructionRuleForVector({
      vector,
      vectorIndex,
      requiresPriorArtifact,
      requiredInputRefs
    }),
    graphFunctionRef: glcHelloWorldGraphFunction.id,
    vectorRef: vector.name,
    registryEntryRefs: ["registry-entry://odd_glc/glc-bootstrap/graph-function/glc-hello-world-bootstrap"],
    sourceNodeRefs: vector.source.map((node) => node.id),
    targetNodeRef: vector.target.id,
    derivedTruth: {
      kind: "derived_instruction_carrier_truth",
      sourceTypeRefs: vector.source.map((node) => node.typeRef ?? node.schema.ref),
      targetTypeRefs: [vector.target.typeRef ?? vector.target.schema.ref],
      outputContractRefs: [\`contract://odd_glc/glc-bootstrap/vector-\${vectorIndex}/output\`],
      proofRefs: [\`proof://odd_glc/glc-bootstrap/vector-\${vectorIndex}\`],
      authorityRefs: ["authority://abg/runtime", "authority://abg/instruction-assembly"],
      rendererRefs: ["renderer://abg/instruction-envelope/default"],
      activeRegime: "F_P",
      carrierClassRefs: vector.source.map((node) => node.id).concat(vector.target.id)
    },
    knownAlgebraRefs: [...INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS],
    requiredInputRefs,
    availableInputRefs: requiredInputRefs,
    sectionDecisions: [instructionSectionForVector({ vector, vectorIndex })],
    bindingSlots: instructionBindingSlots(requiresPriorArtifact),
    proportionalityClass: "P1",
    instructionWorkKind: "target_work",
    dependencyInstructionTruth: constructDerivedDependencyInstructionTruth({
      truthRef: \`dependency-instruction-truth://odd_glc/glc-bootstrap/vector-\${vectorIndex}\`,
      workKind: "target_work",
      dependencyGraphRef: null,
      dependencyGraphDigest: null,
      targetRefs: [vector.target.id],
      prerequisiteNodeRefs: [],
      prerequisiteEdgeRefs: [],
      dependencyClosed: true,
      typedPrerequisiteGapRefs: [],
      noDependencyPolicyRef: "policy://odd_glc/glc-bootstrap/no-dependency-graph-required",
      sourceProjectionRefs: ["projection://odd_glc/glc-bootstrap/no-dependency-policy"]
    }),
    proofDepthInstructionTruth: constructDerivedProofDepthInstructionTruth({
      truthRef: \`proof-depth-instruction-truth://odd_glc/glc-bootstrap/vector-\${vectorIndex}\`,
      depthPolicyRef: "proof-depth-policy://odd_glc/glc-bootstrap",
      depthPolicyDigest: "sha256:odd-glc-glc-bootstrap-proof-depth-policy",
      targetRefs: [vector.target.id],
      requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
      declaredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
      declaredDepthObligationRefs: [
        "proof-obligation://odd_glc/glc-bootstrap/positive",
        "proof-obligation://odd_glc/glc-bootstrap/negative"
      ],
      notApplicableDepthClassRefs: [],
      typedDepthGapRefs: [],
      proofStrengthAdmissionRefs: ["proof-strength-admission://odd_glc/glc-bootstrap"],
      fdStrengthCriterionRefs: ["fd-strength-criterion://odd_glc/glc-bootstrap"],
      adversarialVerificationRefs: [],
      adversarialCounterexampleRefs: [],
      sourceProjectionRefs: ["proof-coverage-projection://odd_glc/glc-bootstrap"],
      depthComplete: true,
      proofStrengthAdmitted: true
    }),
    expectedAnswerMarkers: ["release_ready"],
    fpValidationEvidenceRefs: ["semantic-review-gate://odd_glc/glc-bootstrap/instruction-plan"],
    compilerEvidenceRefs: ["evidence://odd_glc/glc-bootstrap/compiler"]
  });
  if (!result.accepted || result.plan === null) {
    throw new Error(\`GLC compiled prompt plan rejected: \${JSON.stringify(result.issues)}\`);
  }
  return result.plan;
}

const instructionAssemblyStartup = Object.freeze({
  compiledPromptPlans: Object.freeze([
    compiledPromptPlanForVector(0),
    compiledPromptPlanForVector(0, "evaluate"),
    compiledPromptPlanForVector(1),
    compiledPromptPlanForVector(1, "evaluate")
  ]),
  rendererRef: "renderer://abg/instruction-envelope/default"
});

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(new RegExp("\`\`\`(?:json)?\\\\s*([\\\\s\\\\S]*?)\\\\s*\`\`\`", "iu"));
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(\`GLC live worker did not return JSON: \${text}\`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, \`\${JSON.stringify(value, null, 2)}\\n\`, "utf8");
}

async function runNodeProgram(programPath) {
  const run = spawnSync(process.execPath, [programPath], {
    cwd: path.dirname(programPath),
    encoding: "utf8"
  });
  return Object.freeze({
    command: [process.execPath, programPath],
    status: run.status,
    stdout: run.stdout,
    stderr: run.stderr
  });
}

// T-194: requirement route bundle + carry-through startup as PRODUCT data.
const t194Vector = glcHelloWorldGraphFunction.template.graph.vectors[0];
const t194SpanId = \`span://t194/\${t194Vector.id}\`;
const t194Bundle = declareBundle({
  requirements: [
    declareRequirement({
      requirementId: "REQ-T194-001",
      termKind: "atom",
      stableId: "REQ-T194-001",
      sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md#013",
      sourceDigest: "sha256:t194-requirement",
      relationRefs: [],
      spanRefs: [t194SpanId],
      contextRefs: [],
      evidencePolicyRefs: ["policy://t194/evidence"]
    })
  ],
  spans: [
    declareTraversalSpan({
      spanId: t194SpanId,
      graphFunctionRef: glcHelloWorldGraphFunction.id,
      graphVectorRefs: [t194Vector.id],
      vectorIndexes: [0],
      sourceNodeRef: t194Vector.source[0].id,
      targetNodeRef: t194Vector.target.id
    })
  ]
});
const t194Table = constructRequirementProofCandidateClassificationTable({
  tableRef: "classification-table://t194/live",
  sourceRef: "gtl-overlay://t194/live",
  rules: [
    {
      kind: "requirement_proof_candidate_classification_rule",
      ruleRef: "classification-rule://t194/live/artifact",
      stageRole: "transform",
      outputCandidateKind: "candidate-kind://t194/artifact",
      admissionTargetKind: "admission-target://abg/payload",
      evidenceRoleRefs: ["evidence-role://t194/realization"]
    }
  ]
});
const t194Contract = constructRequirementProofCarryThroughContract({
  contractRef: "plugin-proof-contract://t194/live",
  pluginRef: "plugin://t194/live",
  stageRole: "transform",
  resultInterfaceRef: "result-interface://t194/live",
  responseContractRefs: ["response-contract://t194/live"],
  selectedCompositionRef: "composition://t194/live",
  selectedCompositionDigest: "sha256:t194-composition",
  fulfillmentBindings: [
    constructGtlContractFulfillmentBinding({
      bindingRef: "gtl-contract-fulfillment-binding://t194/r1",
      obligationRef: "requirement-obligation://t194/r1",
      requirementRef: "REQ-T194-001",
      productRequirementRef: "product-requirement://t194/r1",
      designObligationRef: "design-obligation://t194/live",
      componentRef: "component://t194/live",
      productTargetRef: "target://t194/live",
      outputSurfaceRef: "output-surface://t194/live",
      functionOrEntrypointRef: "function://t194/live",
      realizationEvidenceRefs: [TYPE_REFS.helloWorldProgram],
      testOrExecutionEvidenceRefs: ["proof-obligation://t194/execution"],
      evaluatorFindingRef: "evaluator-finding://t194/execution",
      authorityRefs: ["authority://t194/live-fp"],
      evidenceRefs: [TYPE_REFS.helloWorldProgram]
    })
  ],
  proofPolicyRefs: ["proof-policy://t194/positive-negative"],
  expectedEvidenceShapeRefs: ["evidence-shape://t194/positive", "evidence-shape://t194/negative"],
  proofStrengthRefs: ["proof-strength://t194/execution"],
  depthPolicyRefs: ["proof-depth-policy://t194/live"],
  requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
  fdStrengthCriterionRefs: [TYPE_REFS.executionEvidence],
  requiredAdversarialCheckRefs: [],
  evidenceRoleRefs: ["evidence-role://t194/realization"],
  outputCandidateKinds: ["candidate-kind://t194/artifact"],
  admissionTargetKinds: ["admission-target://abg/payload"],
  classificationTableRef: t194Table.tableRef,
  classificationTableDigest: t194Table.tableDigest
});
const t194EnvelopeTemplate = {
  contractRef: "plugin-proof-contract://t194/live",
  stageRole: "transform",
  taskRole: "task-role://t194/build",
  outputCandidateKind: "candidate-kind://t194/artifact",
  admissionTargetKind: "admission-target://abg/payload",
  sourceRequirementObligationRefs: ["requirement-obligation://t194/r1"],
  evidenceRoleRefs: ["evidence-role://t194/realization"],
  proofObligationRefs: ["proof-obligation://t194/execution"],
  proofPolicyRefs: ["proof-policy://t194/positive-negative"],
  expectedEvidenceShapeRefs: ["evidence-shape://t194/positive", "evidence-shape://t194/negative"],
  positiveEvidenceShapeRefs: ["evidence-shape://t194/positive"],
  negativeEvidenceShapeRefs: ["evidence-shape://t194/negative"],
  proofStrengthRefs: ["proof-strength://t194/execution"],
  depthPolicyRefs: ["proof-depth-policy://t194/live"],
  depthClassRefs: ${JSON.stringify(input.carryDepthClassRefs ?? ["depth-class://positive", "depth-class://negative"])},
  proofStrengthAdmissionRefs: [TYPE_REFS.executionEvidence],
  fdStrengthCriterionRefs: [TYPE_REFS.executionEvidence],
  adversarialAttemptRefs: [],
  counterexampleRefs: [],
  responseContractRef: "response-contract://t194/live",
  resultInterfaceRef: "result-interface://t194/live",
  selectedCompositionRef: "composition://t194/live",
  selectedCompositionDigest: "sha256:t194-composition"
};

export const runtimeBinding = {
  module,
  runtimeIdentity: admitResolvedRuntimeIdentity({
    workerId: "worker://odd_glc/glc-bootstrap-live",
    backendId: "backend://node",
    buildId: "build://odd_glc/glc-bootstrap-live",
    resolvedRuntimeRef: "runtime://odd_glc/glc-bootstrap-live"
  }),
  resolvedPolicy: admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://odd_glc/glc-bootstrap-live",
    defaultRegime: "F_P",
    dispatchRef: "dispatch://odd_glc/glc-bootstrap-live",
    approvalSubjectRef: null
  }),
  runtimeRegistryStartup,
  temporalPropertyStartup: { rules: STANDING_GATE_TEMPORAL_PROPERTY_RULES },
${input.omitInstructionAssembly === true ? "" : "  instructionAssemblyStartup,"}
${input.includeCarryThrough === true ? `  requirementRouteDeclarationBundle: t194Bundle,
  requirementProofCarryThroughStartup: {
    entries: [
      {
        contract: t194Contract,
        classificationTable: t194Table,
        requirementIds: ["REQ-T194-001"],
        envelopeTemplate: t194EnvelopeTemplate
      }
    ]
  },` : ""}
  runId: "run://odd_glc/glc-bootstrap-live",
  workKey: "wk://odd_glc/glc-bootstrap-live",
  createPlugins: ({ workspaceRoot }) => {
    const fpDispatch = Object.freeze({
      contract: defaultFpDispatchPlugin.contract,
      dispatch: async (pluginInput) => {
      if (${JSON.stringify(input.stubDispatch === true)}) {
        // Row b: deterministic stub worker — fold gating is the target,
        // not worker quality; zero live cost.
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: \`result://odd_glc/glc-bootstrap/stub/\${pluginInput.vectorIndex}\`,
          attachedResultArtifact: {
            edge: pluginInput.expectedEdge ?? pluginInput.edge,
            actor: "codex",
            fulfillment_assessments: ${input.stubArtifactVariant === "missing_assessments" ? "[] || " : ""}(pluginInput.expectedAssessmentIds.length > 0
              ? pluginInput.expectedAssessmentIds
              : ["runtime_fulfilled"]).map((assessmentId) => ({
              id: assessmentId,
              evaluator: assessmentId,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "stub worker artifact for fold-gating differential",
              blocking_reasons: [],
              evidence_refs: [
                "live://odd_glc/glc-bootstrap",
                TYPE_REFS.helloWorldProgram,
                TYPE_REFS.executionEvidence
              ]
            })),
            selected_worker_id: "worker://odd_glc/glc-bootstrap-live",
            selected_backend: "backend://claude",
            role_id: "role://odd_glc/live-fp",
            assignment_source: "policy://odd_glc/glc-bootstrap-live",
            resolved_runtime_ref: "runtime://odd_glc/glc-bootstrap-live"
          },
          evidenceRefs: ["live://odd_glc/glc-bootstrap"]
        });
      }
        const liveRoot = path.join(workspaceRoot, ".ai-workspace", "glc-hello-world-live");
        await mkdir(liveRoot, { recursive: true });
        const label = \`t180-glc-bootstrap-vector-\${pluginInput.vectorIndex}\`;
        if (pluginInput.instructionPromptManifest === null) {
          throw new Error("GLC live dispatch did not receive ABG instruction prompt manifest");
        }
        if (!pluginInput.instructionPromptManifest.renderedPrompt.includes("## abg.runtime.bound_refs")) {
          throw new Error("GLC live prompt is missing ABG-rendered runtime bound refs");
        }
        if (!pluginInput.instructionPromptManifest.renderedPrompt.includes("## abg.declared_latitude")) {
          throw new Error("GLC live prompt is missing the declared-latitude permission section (T-191)");
        }
        if (
          pluginInput.vectorIndex === 1 &&
          !pluginInput.instructionPromptManifest.renderedPrompt.includes("slot: prior_artifact")
        ) {
          throw new Error("GLC vector 1 prompt is missing ABG-rendered prior artifact truth");
        }
        const transport = await runAgentTransport({
          contract: contractForKnownAgent(process.env.ABG_TS_LIVE_AGENT ?? "claude"),
          prompt: pluginInput.instructionPromptManifest.renderedPrompt,
          cwd: workspaceRoot,
          archiveRoot: liveRoot,
          label,
          timeoutMs: Number.parseInt(process.env.ABG_TS_LIVE_TIMEOUT_MS ?? "180000", 10),
          outputPath: path.join(liveRoot, \`\${label}-output.txt\`),
          promptPath: path.join(liveRoot, \`\${label}-prompt.txt\`),
          stdoutPath: path.join(liveRoot, \`\${label}-stdout.log\`),
          stderrPath: path.join(liveRoot, \`\${label}-stderr.log\`)
        });
        if (transport.status !== 0) {
          throw new Error(\`GLC live worker failed: \${transport.stderr}\`);
        }
        const assessment = extractJsonObject(transport.text);
        if (assessment.expectedStdout !== "Hello, world!\\n") {
          throw new Error("GLC live worker returned wrong expectedStdout");
        }
        const expectedNodeTypes = pluginInput.vectorIndex === 0
          ? [TYPE_REFS.bootstrapContext, TYPE_REFS.helloWorldProgram]
          : [TYPE_REFS.helloWorldProgram, TYPE_REFS.executionEvidence];
        if (
          !Array.isArray(assessment.nodeTypesUsed) ||
          !expectedNodeTypes.every((typeRef) => assessment.nodeTypesUsed.includes(typeRef))
        ) {
          throw new Error(
            \`GLC live worker must cite exact GTL node type refs: \${expectedNodeTypes.join(", ")}\`
          );
        }
        const expectedCausalPayloadRefs = pluginInput.vectorIndex === 0
          ? []
          : [...pluginInput.fpTransformRequest.causalInputPayloadRefs];
        const expectedCausalContentDigest = pluginInput.vectorIndex === 0
          ? null
          : pluginInput.fpTransformRequest.causalInputContentDigests[0] ?? null;
        if (pluginInput.vectorIndex === 1) {
          if (pluginInput.fpTransformRequest.instructionCausalStatus !== "bound") {
            throw new Error("T-182 vector 1 did not receive bound causal context before F_P dispatch");
          }
          if (pluginInput.fpTransformRequest.causalRequiredInputRefs.length !== 1) {
            throw new Error("T-182 vector 1 did not receive its declared required causal input ref");
          }
          if (pluginInput.fpTransformRequest.causalInputPayloadDigests.length === 0) {
            throw new Error("T-182 vector 1 causal input lacks admitted payload digest truth");
          }
          if (pluginInput.fpTransformRequest.causalInputContentExcerpts.length === 0) {
            throw new Error("T-182 vector 1 causal input lacks admitted content excerpt truth");
          }
        }
        if (
          !Array.isArray(assessment.causalInputPayloadRefsSeen) ||
          JSON.stringify(assessment.causalInputPayloadRefsSeen) !==
            JSON.stringify(expectedCausalPayloadRefs)
        ) {
          throw new Error(
            \`GLC live worker did not echo the ABG causal payload refs: expected \${JSON.stringify(expectedCausalPayloadRefs)}, got \${JSON.stringify(assessment.causalInputPayloadRefsSeen)}\`
          );
        }
        if (assessment.causalInputContentDigestSeen !== expectedCausalContentDigest) {
          throw new Error(
            \`GLC live worker did not echo the ABG causal content digest\`
          );
        }
        if (pluginInput.vectorIndex === 0) {
          if (assessment.causalInputContentSummary !== null) {
            throw new Error("GLC live worker returned causal content summary for the first vector");
          }
        } else if (
          typeof assessment.causalInputContentSummary !== "string" ||
          !assessment.causalInputContentSummary.includes("Hello, world")
        ) {
          throw new Error(
            \`GLC live worker did not summarize the carried causal content excerpt\`
          );
        }
        const programPath = path.join(workspaceRoot, "generated", "hello-world.mjs");
        if (pluginInput.vectorIndex === 0) {
          if (typeof assessment.source !== "string" || !assessment.source.includes("Hello, world!")) {
            throw new Error("GLC live worker did not provide a Hello World program source");
          }
          await mkdir(path.dirname(programPath), { recursive: true });
          await writeFile(programPath, assessment.source, "utf8");
        } else {
          await readFile(programPath, "utf8");
        }
        const execution = await runNodeProgram(programPath);
        if (execution.status !== 0 || execution.stdout !== "Hello, world!\\n" || execution.stderr !== "") {
          throw new Error(\`GLC Hello World execution failed: \${JSON.stringify(execution)}\`);
        }
        const assessmentIds = pluginInput.expectedAssessmentIds.length > 0
          ? pluginInput.expectedAssessmentIds
          : [\`glc_bootstrap_vector_\${pluginInput.vectorIndex}_fulfilled\`];
        const artifact = Object.freeze({
          artifactKind: "odd_glc_glc_hello_world_bootstrap_live_artifact",
          edge: pluginInput.edge,
          actor: "claude",
          vectorIndex: pluginInput.vectorIndex,
          assessment,
          execution,
          programPath,
          fulfillment_assessments: assessmentIds.map((assessmentId) =>
            Object.freeze({
              id: assessmentId,
              evaluator: assessmentId,
              fulfillment_status: "fulfilled",
              fulfillment_detail:
                pluginInput.vectorIndex === 0
                  ? "Live F_P worker produced a minimal executable Hello World program and the local Node execution proof emitted the expected stdout."
                  : "Live F_P worker inspected the generated Hello World program intent and the local Node execution proof emitted the expected stdout.",
              blocking_reasons: [],
              evidence_refs: [
                "live://odd_glc/glc-bootstrap",
                \`file://\${programPath}\`,
                TYPE_REFS.helloWorldProgram,
                TYPE_REFS.executionEvidence
              ]
            })
          ),
          selected_worker_id: "worker://odd_glc/glc-bootstrap-live",
          selected_backend: "backend://claude",
          role_id: "role://odd_glc/live-fp",
          assignment_source: "policy://odd_glc/glc-bootstrap-live",
          resolved_runtime_ref: "runtime://odd_glc/glc-bootstrap-live",
          transport: Object.freeze({
            status: transport.status,
            command: transport.command,
            traceResultPath: transport.traceResultPath,
            outputPath: transport.outputPath,
            structuredEventCount: transport.structuredEventCount,
            apiRetryCount: transport.apiRetryCount
          }),
          causalCarry: Object.freeze({
            instructionCausalContextRef:
              pluginInput.fpTransformRequest.instructionCausalContextRef,
            instructionCausalStatus:
              pluginInput.fpTransformRequest.instructionCausalStatus,
            causalInputBindingRefs:
              pluginInput.fpTransformRequest.causalInputBindingRefs,
            causalInputPayloadRefs:
              pluginInput.fpTransformRequest.causalInputPayloadRefs,
            causalInputPayloadDigests:
              pluginInput.fpTransformRequest.causalInputPayloadDigests,
            causalInputContentRefs:
              pluginInput.fpTransformRequest.causalInputContentRefs,
            causalInputContentDigests:
              pluginInput.fpTransformRequest.causalInputContentDigests,
            causalInputContentExcerpts:
              pluginInput.fpTransformRequest.causalInputContentExcerpts,
            causalRequiredInputRefs:
              pluginInput.fpTransformRequest.causalRequiredInputRefs,
            causalMissingInputRefs:
              pluginInput.fpTransformRequest.causalMissingInputRefs
          })
        });
        await writeJson(path.join(liveRoot, \`\${label}-artifact.json\`), artifact);
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: \`result://odd_glc/glc-bootstrap/\${pluginInput.vectorIndex}\`,
          attachedResultArtifact: artifact,
          evidenceRefs: [
            "live://odd_glc/glc-bootstrap",
            \`file://\${programPath}\`,
            TYPE_REFS.helloWorldProgram,
            TYPE_REFS.executionEvidence
          ]
        });
      }
    });
    return Object.freeze({
      fpDispatch,
      fpEvaluator: Object.freeze({
        contract: defaultFpEvaluatorPlugin.contract,
        evaluate(evaluationInput) {
          if (
            evaluationInput.instructionPromptManifest === null ||
            !evaluationInput.instructionPromptManifest.renderedPrompt.includes(
              "## abg.golden_instance_calibration"
            )
          ) {
            throw new Error(
              "evaluator arm did not receive golden-instance calibration in its manifest (T-191 acceptance 3)"
            );
          }
          if (
            !evaluationInput.instructionPromptManifest.renderedPrompt.includes(
              "payload://odd_glc/golden/reject-empty-stdout"
            )
          ) {
            throw new Error(
              "evaluator calibration is missing the counterexample refutation material (T-191)"
            );
          }
          return defaultFpEvaluatorPlugin.evaluate(evaluationInput);
        }
      })
    });
  }
};
`;
}
