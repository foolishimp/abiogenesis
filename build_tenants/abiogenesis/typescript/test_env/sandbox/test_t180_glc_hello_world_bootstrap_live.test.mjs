// Validates: T-180
// Validates: T-177
// Validates: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Validates: REQ-L-GTL3-NODE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  rm,
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
  "t180_glc_hello_world_bootstrap_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T180_GLC_BOOTSTRAP_LIVE"] === "1" ||
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
  constructDefaultAbgFnCompositionDeclarations,
  constructFpDispatchOutcome,
  constructGtlLibraryEntryDeclaration,
  constructNode,
  constructNodeTypeGraphFunction,
  constructProductRegistryStartupConfig,
  contractForKnownAgent,
  defaultFpDispatchPlugin,
  defaultFpEvaluatorPlugin,
  edge,
  graphFunctionForVector,
  runAgentTransport,
  satisfiesNodeType
} from ${JSON.stringify(packageImport)};
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
    renderedViewDigestPolicyRef: null,
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

function promptFor(input) {
  return [
    "Return only one JSON object. Do not include markdown or commentary.",
    "You are the live F_P worker for an odd_glc generic lifecycle Hello World bootstrap.",
    "ABG owns registry startup, graph-function selection, traversal, event truth, and closure.",
    "odd_glc supplies GTL declarations, product-library node types, and policy/overlay refs only.",
    "",
    \`Current edge: \${input.edge}\`,
    \`Vector index: \${input.vectorIndex}\`,
    "",
    "Declared GTL node type refs:",
    \`- bootstrap context: \${TYPE_REFS.bootstrapContext}\`,
    \`- lifecycle artifact: \${TYPE_REFS.lifecycleArtifact}\`,
    \`- executable artifact: \${TYPE_REFS.executableArtifact}\`,
    \`- composed Hello World program artifact: \${TYPE_REFS.helloWorldProgram}\`,
    \`- execution evidence: \${TYPE_REFS.executionEvidence}\`,
    "",
    "Required JSON:",
    "{",
    "  \\"stage\\": \\"program\\" | \\"execution_evidence\\",",
    "  \\"source\\": string,",
    "  \\"expectedStdout\\": \\"Hello, world!\\\\n\\",",
    "  \\"nodeTypesUsed\\": string[],",
    "  \\"reason\\": string",
    "}",
    "",
    "For stage program, provide a minimal JavaScript ESM program in source.",
    \`For stage program, nodeTypesUsed must include exactly \${TYPE_REFS.bootstrapContext} and \${TYPE_REFS.helloWorldProgram}.\`,
    "For stage execution_evidence, inspect the existing program intent and return a short evidence summary in source.",
    \`For stage execution_evidence, nodeTypesUsed must include exactly \${TYPE_REFS.helloWorldProgram} and \${TYPE_REFS.executionEvidence}.\`,
    "Do not claim to emit ABG events, select graph functions, or close traversal."
  ].join("\\n");
}

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
  runId: "run://odd_glc/glc-bootstrap-live",
  workKey: "wk://odd_glc/glc-bootstrap-live",
  createPlugins: ({ workspaceRoot }) => {
    const fpDispatch = Object.freeze({
      contract: defaultFpDispatchPlugin.contract,
      dispatch: async (pluginInput) => {
        const liveRoot = path.join(workspaceRoot, ".ai-workspace", "glc-hello-world-live");
        await mkdir(liveRoot, { recursive: true });
        const label = \`t180-glc-bootstrap-vector-\${pluginInput.vectorIndex}\`;
        const transport = await runAgentTransport({
          contract: contractForKnownAgent(process.env.ABG_TS_LIVE_AGENT ?? "claude"),
          prompt: promptFor(pluginInput),
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

test("T-180 GLC Hello World live bootstrap runs from a snapshot-installed sandbox instance", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T180_GLC_BOOTSTRAP_LIVE=1 or CODEX_LIVE_FP=1 to run the GLC bootstrap live proof");
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
        ABG_TS_T180_GLC_BOOTSTRAP_LIVE: "1",
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

  const events = parseJsonLines(await readFile(startOutput.events_path, "utf8"));
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

  const proof = {
    kind: "t180_glc_hello_world_bootstrap_live_proof",
    sourceCommit,
    sourceDirty,
    durationMs,
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
    liveArtifacts: [
      firstArtifact.transport.outputPath,
      secondArtifact.transport.outputPath
    ]
  };
  await writeText(
    path.join(runRoot, "t180-glc-hello-world-bootstrap-live-proof.json"),
    `${JSON.stringify(proof, null, 2)}\n`
  );
});
