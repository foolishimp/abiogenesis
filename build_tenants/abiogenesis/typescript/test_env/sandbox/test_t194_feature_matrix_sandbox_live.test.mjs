// Validates: T-180
// Validates: T-182
// Validates: T-183
// Validates: T-184
// Validates: T-177
// Validates: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Validates: REQ-L-GTL3-NODE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  symlink,
  writeFile
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  installAbiogenesisTypescript
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  createReleaseSnapshotBundle
} from "../../build/semantic/code/src/qualification/m05/index.js";

const SANDBOX_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(SANDBOX_DIR, "..");
const TENANT_ROOT = path.resolve(SANDBOX_DIR, "..", "..");
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, "..");
const STANDARDS_ROOT = path.join(
  WORKSPACE_ROOT,
  "specification_methodology",
  "specification",
  "standards"
);
const DOCS_ROOT = path.join(REPO_ROOT, "docs");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t194_feature_matrix_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T194_FEATURE_MATRIX_LIVE"] === "1" ||
    process.env["ABG_TS_T184_CANONICAL_HELLO_WORLD_LIVE"] === "1" ||
    process.env["ABG_TS_T182_CAUSAL_CARRY_LIVE"] === "1" ||
    process.env["ABG_TS_T180_GLC_BOOTSTRAP_LIVE"] === "1" ||
    process.env["ABG_TS_T183_INSTRUCTION_ASSEMBLY_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? TENANT_ROOT,
    encoding: "utf8",
    env: options.env ?? process.env
  });
  if (result.status !== 0) {
    throw new Error(
      `${options.label ?? command} failed with ${result.status ?? "null"}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
  return result;
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: TENANT_ROOT,
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeText(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function extractSnapshotPackage(input) {
  const extractRoot = path.join(input.runRoot, "snapshot-extract");
  await mkdir(extractRoot, { recursive: true });
  run("tar", ["-xzf", input.tarballPath, "-C", extractRoot], {
    cwd: input.runRoot,
    label: "extract release snapshot tarball"
  });
  await symlink(
    path.join(TENANT_ROOT, "node_modules"),
    path.join(extractRoot, "node_modules"),
    "dir"
  );
  return path.join(extractRoot, "package");
}

function stableList(values) {
  return `[${[...new Set(values)].sort().map((value) => JSON.stringify(value)).join(", ")}]`;
}

function runtimeBindingSource(input) {
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
    declarations: constructDefaultAbgFnCompositionDeclarations({
      scopeRef: "odd-glc/glc-hello-world-bootstrap"
    }),
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
  })
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
  instructionAssemblyStartup,
  requirementRouteDeclarationBundle: t194Bundle,
  requirementProofCarryThroughStartup: {
    entries: [
      {
        contract: t194Contract,
        classificationTable: t194Table,
        requirementIds: ["REQ-T194-001"],
        envelopeTemplate: t194EnvelopeTemplate
      }
    ]
  },
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
            fulfillment_assessments: (pluginInput.expectedAssessmentIds.length > 0
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
      fpEvaluator: defaultFpEvaluatorPlugin
    });
  }
};
`;
}

async function writeGlcRuntimeBinding(input) {
  const runtimeBindingPath = path.join(
    input.workspaceRoot,
    ".abiogenesis",
    "typescript-runtime.mjs"
  );
  await writeText(runtimeBindingPath, runtimeBindingSource(input));
  return runtimeBindingPath;
}

function parseJsonLines(text) {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

test("T-194 feature-matrix live: carry-through proves eligible+satisfied from a snapshot-installed sandbox", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T194_FEATURE_MATRIX_LIVE=1 or CODEX_LIVE_FP=1 to run the T-194 feature-matrix live proof");
    return;
  }

  const packageJson = await readJson(path.join(TENANT_ROOT, "package.json"));
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  const workspaceRoot = path.join(runRoot, "instance");
  const toolchainRoot = path.join(runRoot, "toolchain");
  const snapshotRoot = path.join(runRoot, "snapshot", packageJson.version);
  const releaseNotePath = path.join(runRoot, "release-note.md");
  await mkdir(runRoot, { recursive: true });
  await writeText(
    releaseNotePath,
    [
      "# T-180 GLC Hello World Bootstrap Snapshot",
      "",
      "Per-run dirty-source proof snapshot for installed sandbox validation.",
      ""
    ].join("\n")
  );

  const sourceCommit = gitOutput(["rev-parse", "HEAD"]) || "unknown";
  const sourceDirty = gitOutput(["status", "--porcelain", "--untracked-files=normal"]).length > 0;
  const snapshot = await createReleaseSnapshotBundle({
    releaseIdentity: packageJson.version,
    packageSourceRoot: TENANT_ROOT,
    snapshotRoot,
    sourceRef: "t180-glc-bootstrap-live-local",
    sourceCommit,
    sourceDirty,
    allowDirtySource: true,
    rcBranch: "t180/glc-bootstrap-live",
    releaseNotePath,
    expectedPackageName: packageJson.name,
    expectedPackageVersion: packageJson.version,
    runBuild: false,
    npmCacheRoot: path.join(runRoot, ".npm-cache"),
    createdAt: new Date().toISOString()
  });
  assert.equal(snapshot.kind, "created");
  assert.equal(snapshot.manifest.package.packageName, packageJson.name);
  assert.equal(snapshot.manifest.package.packageVersion, packageJson.version);

  const snapshotPackageRoot = await extractSnapshotPackage({
    runRoot,
    tarballPath: snapshot.manifest.tarball.path
  });
  const install = await installAbiogenesisTypescript({
    targetRoot: { rootPath: workspaceRoot },
    packageSourceRoot: snapshotPackageRoot,
    standardsSourceRoot: STANDARDS_ROOT,
    docsSourceRoot: DOCS_ROOT,
    installedPackageName: packageJson.name,
    toolchainRoot
  });
  assert.equal(install.kind, "installed");
  assert.equal(install.packageName, packageJson.name);
  assert.equal(install.packageVersion, packageJson.version);
  assert.equal(install.packageSourceRoot, snapshotPackageRoot);

  const runtimeBindingPath = await writeGlcRuntimeBinding({
    workspaceRoot,
    packageRoot: install.packageRoot,
    packageVersion: packageJson.version
  });

  const genesisCommand = install.commandPaths.find((commandPath) =>
    path.basename(commandPath) === "genesis-ts"
  );
  assert.equal(typeof genesisCommand, "string");
  const startedAt = Date.now();
  const start = run(
    genesisCommand,
    [
      "start",
      "--workspace",
      workspaceRoot,
      "--scope",
      "workspace",
      "--target",
      "next",
      "--until",
      "converged"
    ],
    {
      cwd: workspaceRoot,
      label: "installed genesis-ts start",
      env: {
        ...process.env,
        CODEX_LIVE_FP: "1",
        ABG_TS_T194_FEATURE_MATRIX_LIVE: "1",
        ABG_TS_LIVE_AGENT: process.env["ABG_TS_LIVE_AGENT"] ?? "claude",
        ABG_TS_LIVE_TIMEOUT_MS: process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000"
      }
    }
  );
  const durationMs = Date.now() - startedAt;
  const startOutput = JSON.parse(start.stdout.trim());
  assert.equal(startOutput.command, "start");
  assert.equal(startOutput.stopped_by, "converged");
  assert.equal(startOutput.resolved_target.includes("odd_glc"), true);
  assert.equal(startOutput.event_kinds.includes("graph_function_selected"), true);
  assert.equal(startOutput.event_kinds.includes("graph_call_opened"), true);
  assert.equal(startOutput.event_kinds.includes("instruction_prompt_manifest_projected"), true);
  assert.equal(startOutput.event_kinds.includes("instruction_response_contract_admitted"), true);

  const events = parseJsonLines(await readFile(startOutput.events_path, "utf8"));
  // T-194 rows a3: carry-through eligible chain from the installed sandbox
  const carryEvents = events.filter(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.equal(carryEvents.length > 0, true, "carry-through events must be emitted from the installed sandbox");
  const eligibleCarry = carryEvents.find(
    (event) => event.accepted === true && event.coverageStatuses?.[0] === "eligible"
  );
  assert.ok(eligibleCarry, "at least one accepted+eligible carry-through admission (typed strength via product-declared execution-evidence ref)");
  assert.deepEqual(eligibleCarry.coverageRequirementIds, ["REQ-T194-001"]);
  const foldEvents = events.filter(
    (event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldEvents.length > 0, true, "requirement fold facts must be emitted");
  assert.equal(
    foldEvents.some((event) => event.requirementPayload?.fold?.state === "satisfied"),
    true,
    "REQ-T194-001 must fold satisfied with eligible coverage threaded"
  );

  // Row b: shallow depth + stub worker in a SECOND installed instance —
  // uncovered obligation shall not close, from the installed public path.
  const workspaceRootB = path.join(runRoot, "instance-b");
  await mkdir(workspaceRootB, { recursive: true });
  const installB = await installAbiogenesisTypescript({
    targetRoot: { rootPath: workspaceRootB },
    packageSourceRoot: snapshotPackageRoot,
    standardsSourceRoot: STANDARDS_ROOT,
    docsSourceRoot: DOCS_ROOT,
    installedPackageName: packageJson.name,
    toolchainRoot
  });
  assert.equal(installB.kind, "installed");
  await writeGlcRuntimeBinding({
    workspaceRoot: workspaceRootB,
    packageRoot: installB.packageRoot,
    packageVersion: packageJson.version,
    carryDepthClassRefs: ["depth-class://positive"],
    stubDispatch: true
  });
  const genesisCommandB = installB.commandPaths.find((commandPath) =>
    path.basename(commandPath) === "genesis-ts"
  );
  const startB = spawnSync(
    genesisCommandB,
    [
      "start",
      "--workspace",
      workspaceRootB,
      "--scope",
      "workspace",
      "--target",
      "next",
      "--until",
      "converged"
    ],
    {
      cwd: workspaceRootB,
      encoding: "utf8",
      env: { ...process.env, ABG_TS_T194_FEATURE_MATRIX_LIVE: "1" }
    }
  );
  // Row b intentionally tolerates a blocked exit (no_close is the point);
  // anything OTHER than clean converge or blocked is a harness defect.
  assert.equal([0, 4].includes(startB.status), true,
    `row b start must converge or block, got ${startB.status}\n${startB.stdout}\n${startB.stderr}`);
  const eventsB = parseJsonLines(
    await readFile(path.join(workspaceRootB, ".ai-workspace", "events", "events.jsonl"), "utf8")
  );
  const carryB = eventsB.filter(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.equal(carryB.length > 0, true, "row b must emit carry-through admissions");
  assert.equal(
    carryB.some((event) => event.coverageStatuses?.[0] === "residual"),
    true,
    "shallow depth must classify coverage residual"
  );
  assert.equal(
    carryB.some((event) =>
      (event.coverageIssueKinds ?? []).includes("missing_depth_obligation_class")
    ),
    true,
    "the residual must carry the missing_depth_obligation_class issue kind"
  );
  const foldB = eventsB.filter(
    (event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldB.length > 0, true, "row b must project requirement folds");
  assert.equal(
    foldB.some((event) => event.requirementPayload?.fold?.state === "no_close_preserved"),
    true,
    "REQ-T194-001 shall NOT close with residual coverage (uncovered shall not close)"
  );
  assert.equal(
    foldB.some((event) => event.requirementPayload?.fold?.state === "satisfied"),
    false,
    "no satisfied fold may exist for the shallow branch"
  );
  const registryEvents = events.filter((event) =>
    event.kind === "registry_entry_admitted"
  );
  assert.equal(
    registryEvents.filter((event) => event.entryKind === "node_type").length,
    5
  );
  assert.equal(
    registryEvents.filter((event) => event.entryKind === "graph_function").length,
    1
  );
  const selections = events.filter((event) =>
    event.kind === "graph_function_selected"
  );
  assert.equal(selections.length, 2);
  assert.equal(
    selections.every((event) => event.selectedEntryKind === "graph_function"),
    true
  );
  assert.equal(
    selections.every((event) => event.selectedGraphFunctionRef === startOutput.graph_function_id),
    true
  );
  assert.equal(
    events.some((event) =>
      event.kind === "graph_function_selected" &&
      event.selectedEntryKind === "node_type"
    ),
    false
  );
  const firstSelectionIndex = events.findIndex((event) =>
    event.kind === "graph_function_selected"
  );
  const firstGraphCallIndex = events.findIndex((event) =>
    event.kind === "graph_call_opened"
  );
  assert.ok(firstSelectionIndex >= 0);
  assert.ok(firstGraphCallIndex > firstSelectionIndex);
  const promptManifestEvents = events.filter((event) =>
    event.kind === "instruction_prompt_manifest_projected"
  );
  const responseAdmissionEvents = events.filter((event) =>
    event.kind === "instruction_response_contract_admitted"
  );
  const actorArtifactEvents = events.filter((event) =>
    event.kind === "actor_result_artifact_observed"
  );
  // transform + evaluate stage manifests per vector (T-189 all-arms binding)
  assert.equal(promptManifestEvents.length, 4);
  assert.equal(responseAdmissionEvents.length, 2);
  assert.equal(actorArtifactEvents.length, 2);
  for (const responseEvent of responseAdmissionEvents) {
    const manifestIndex = events.findIndex((event) =>
      event.kind === "instruction_prompt_manifest_projected" &&
      event.manifestRef === responseEvent.manifestRef
    );
    const responseIndex = events.findIndex((event) => event === responseEvent);
    assert.ok(manifestIndex >= 0);
    assert.ok(responseIndex > manifestIndex);
    assert.equal(responseEvent.outputContractRefs.length, 1);
  }
  const causalEvents = events.filter((event) =>
    event.kind === "instruction_causal_context_bound"
  );
  const secondVectorCausalEvent = causalEvents.find((event) =>
    event.vectorIndex === 1
  );
  assert.ok(secondVectorCausalEvent);
  assert.equal(secondVectorCausalEvent.status, "bound");
  assert.deepEqual(secondVectorCausalEvent.contentModes, ["excerpt"]);
  assert.equal(secondVectorCausalEvent.payloadRefs.length > 0, true);
  assert.equal(secondVectorCausalEvent.payloadDigests.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentRefs.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentDigests.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentExcerpts.length > 0, true);
  assert.match(secondVectorCausalEvent.contentExcerpts[0], /Hello, world!/u);
  assert.deepEqual(secondVectorCausalEvent.missingInputRefs, []);
  assert.equal(
    secondVectorCausalEvent.requiredInputRefs.some((ref) =>
      ref.includes("asset_kind=glc_lifecycle_artifact")
    ),
    true
  );

  const programSource = await readFile(
    path.join(workspaceRoot, "generated", "hello-world.mjs"),
    "utf8"
  );
  assert.equal(programSource.includes("Hello, world!"), true);
  const liveRoot = path.join(workspaceRoot, ".ai-workspace", "glc-hello-world-live");
  const firstArtifact = await readJson(
    path.join(liveRoot, "t180-glc-bootstrap-vector-0-artifact.json")
  );
  const secondArtifact = await readJson(
    path.join(liveRoot, "t180-glc-bootstrap-vector-1-artifact.json")
  );
  assert.equal(firstArtifact.execution.stdout, "Hello, world!\n");
  assert.equal(secondArtifact.execution.stdout, "Hello, world!\n");
  assert.equal(firstArtifact.transport.status, 0);
  assert.equal(secondArtifact.transport.status, 0);
  assert.equal(firstArtifact.causalCarry.instructionCausalStatus, "empty");
  assert.equal(secondArtifact.causalCarry.instructionCausalStatus, "bound");
  assert.equal(
    secondArtifact.causalCarry.causalInputContentExcerpts.length > 0,
    true
  );
  assert.deepEqual(
    secondArtifact.causalCarry.causalInputPayloadRefs,
    secondArtifact.assessment.causalInputPayloadRefsSeen
  );
  assert.equal(
    secondArtifact.causalCarry.causalInputContentDigests[0],
    secondArtifact.assessment.causalInputContentDigestSeen
  );
  assert.match(secondArtifact.assessment.causalInputContentSummary, /Hello, world/u);
  assert.deepEqual(
    secondArtifact.causalCarry.causalInputPayloadRefs,
    secondVectorCausalEvent.payloadRefs
  );

  const eventCounts = events.reduce((accumulator, event) => {
    accumulator[event.kind] = (accumulator[event.kind] ?? 0) + 1;
    return accumulator;
  }, {});
  const proof = {
    kind: "t194_feature_matrix_live_proof",
    sourceCommit,
    sourceDirty,
    durationMs,
    installedPackage: {
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      packageRoot: install.packageRoot
    },
    snapshotRoot,
    snapshotTarball: snapshot.manifest.tarball.path,
    snapshotTarballSha256: snapshot.manifest.tarball.sha256,
    workspaceRoot,
    toolchainRoot,
    installedPackageRoot: install.packageRoot,
    runtimeBindingPath,
    genesisCommand,
    startOutput,
    eventDigest: sha256Text(JSON.stringify(events)),
    eventCounts,
    promptManifestCount: promptManifestEvents.length,
    responseAdmissionCount: responseAdmissionEvents.length,
    actorResultArtifactCount: actorArtifactEvents.length,
    registryAdmissionCount: registryEvents.length,
    graphFunctionSelectionCount: selections.length,
    causalCarry: {
      contextRef: secondVectorCausalEvent.contextRef,
      payloadRefs: secondVectorCausalEvent.payloadRefs,
      payloadDigests: secondVectorCausalEvent.payloadDigests,
      contentRefs: secondVectorCausalEvent.contentRefs,
      contentDigests: secondVectorCausalEvent.contentDigests,
      requiredInputRefs: secondVectorCausalEvent.requiredInputRefs
    },
    liveArtifacts: [
      firstArtifact.transport.outputPath,
      secondArtifact.transport.outputPath
    ],
    executionStdout: secondArtifact.execution.stdout
  };
  await writeText(
    path.join(runRoot, "canonical-hello-world-full-stack-live-proof.json"),
    `${JSON.stringify(proof, null, 2)}\n`
  );
});
