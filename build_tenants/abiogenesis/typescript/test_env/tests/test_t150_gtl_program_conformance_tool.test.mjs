// Validates: T-150
// Validates: REQ-L-GTL3-ASSET-SURFACE
// Validates: REQ-R-ABG3-INTERPRET

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  constructAssetSurface,
  constructEnginePluginContract,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructModule,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs,
  materializeGraphFunction,
  typecheckGtlProgram,
  formatGtlProgramConformanceIssues
} from "../../build/semantic/code/src/index.js";
import {
  runAbiogenesisCli
} from "../../build/semantic/code/src/cli/command.js";

const ABG_VERSION = "4.0.0-rc.2";

function assetSurface(overrides = {}) {
  return constructAssetSurface({
    kind: "prompt_invocation_asset",
    requiredContexts: ["standards"],
    standardsRefs: ["standard://stdo"],
    outputContractRefs: ["contract://prompt/invocation"],
    constructorRefs: ["constructor://prompt/invocation"],
    constructorInputAssetKinds: ["authority_packet"],
    rendererRefs: ["renderer://markdown"],
    renderedViewDigestPolicyRef: "digest-policy://prompt/rendered-view/sha256",
    sectionKindRefs: ["section-kind://prompt/purpose"],
    clauseKindRefs: ["clause-kind://prompt/declarative"],
    authoritySlots: [
      {
        authorityKindRef: "authority-kind://product",
        disposition: "normal"
      }
    ],
    proofObligationRefs: ["proof://prompt/rendered-view"],
    ...overrides
  });
}

function node(name, surface = assetSurface()) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://${name}` },
    markov: [`${name}:declared`],
    assetSurface: surface,
    tags: ["t150-program-conformance-tool"]
  });
}

function operator(name) {
  return Object.freeze({
    name,
    regime: "F_P",
    binding: `binding://${name}`,
    tags: ["t150-program-conformance-tool"]
  });
}

function evaluator(name) {
  return Object.freeze({
    name,
    regime: "F_D",
    description: "program conformance fixture evaluator",
    binding: `binding://${name}`,
    consumedFieldRefs: [],
    tags: ["t150-program-conformance-tool"]
  });
}

function graphFunctionFixture(options = {}) {
  const graphFunctionName = options.graphFunctionName ?? "construct_prompt_invocation";
  const vectorName = options.vectorName ?? graphFunctionName;
  const graphName = options.graphName ?? "PromptConstructionGraph";
  const inputName = options.inputName ?? "PromptAuthorityPacket";
  const outputName = options.outputName ?? "PromptInvocationAsset";
  const input = node(inputName);
  const output = node(outputName);
  const vector = constructGraphVector({
    name: vectorName,
    source: [input],
    target: output,
    operators: [operator(vectorName)],
    evaluators: [evaluator(`${vectorName}_shape`)],
    contexts: [
      {
        name: "standards",
        locator: "workspace://docs/stdo.md",
        digest: "sha256:standards"
      }
    ],
    rule: null,
    allowsSubwork: false,
    declarations: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
  const graph = constructGraph({
    name: graphName,
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: ["prompt-construction"],
    tags: ["t150-program-conformance-tool"]
  });
  return constructGraphFunction({
    name: graphFunctionName,
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://prompt-construction",
      graph,
      version: null
    }),
    effects: ["prompt-construction"],
    declarations: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
}

function moduleFixture(graphFunction) {
  return constructModule({
    name: "t150-program-conformance-tool",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

function graphFunctionIdentity(options = {}) {
  const graphFunction = graphFunctionFixture(options);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  return { graphFunction, graph, vector };
}

function pluginContract(overrides = {}) {
  return constructEnginePluginContract({
    ref: "plugin://t150/fp-dispatch",
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome",
    ...overrides
  });
}

function expectedCoverage(overrides = {}) {
  return {
    catalogGraphFunctionCount: 1,
    publishedGraphFunctionCount: 1,
    graphVectorCount: 1,
    targetCarrierContractCount: 1,
    edgeClosureContractCount: 1,
    overlayCount: 1,
    publicStartTargetCount: 1,
    promptAssetCount: 1,
    pluginContractCount: 1,
    sourceIdentitySurfaceCount: 1,
    ...overrides
  };
}

function compliantInput(overrides = {}, options = {}) {
  const graphFunctionName = options.graphFunctionName ?? "construct_prompt_invocation";
  const vectorName = options.vectorName ?? graphFunctionName;
  const outputName = options.outputName ?? "PromptInvocationAsset";
  const { graphFunction, graph, vector } = graphFunctionIdentity(options);
  const promptSurface = assetSurface();
  return {
    subjectRef: "workspace://t150/program-conformance-tool",
    abiPackageVersion: ABG_VERSION,
    expectedCoverage: expectedCoverage(),
    catalogGraphFunctionRefs: [graphFunctionName],
    modules: [moduleFixture(graphFunction)],
    targetCarrierContracts: [
      {
        edgeRef: graphFunctionName,
        graphVectorRef: vectorName,
        graphFunctionId: graphFunction.id,
        graphId: graph.id,
        graphVectorId: vector.id,
        targetAssetType: outputName,
        targetCarrierContractRef: "gtl://target-carrier-contract/t150/prompt-invocation"
      }
    ],
    edgeClosureContracts: [
      {
        edgeRef: graphFunctionName,
        graphFunctionId: graphFunction.id,
        graphId: graph.id,
        graphVectorId: vector.id,
        targetAssetType: outputName
      }
    ],
    overlays: [
      {
        overlayRef: "overlay://t150/default",
        graphFunctionRefs: [graphFunctionName],
        graphVectorRefs: [vectorName],
        publicStartTargets: [graphFunctionName],
        defaultStartTarget: graphFunctionName
      }
    ],
    publicStartTargets: [
      {
        name: "prompt",
        graphFunctionRef: graphFunctionName,
        overlayRefs: ["overlay://t150/default"],
        defaultForOverlayRefs: ["overlay://t150/default"]
      }
    ],
    promptAssets: [
      {
        surfaceRef: "prompt://t150/invocation",
        assetSurface: promptSurface,
        gtlNode: node(outputName, promptSurface),
        renderedViewDigest: "sha256:rendered",
        currentAbgFoldRefs: [
          `package:@abiogenesis/typescript-tenant@${ABG_VERSION}#abg/m03/iteration_state_action/deriveIterationOutcomeFromRows`
        ],
        evidenceRefs: ["test://t150/prompt"]
      }
    ],
    pluginContracts: [pluginContract()],
    sourceIdentitySurfaces: [
      {
        surfaceRef: "workspace://code/current.ts",
        text: "ABG 4.0.0-rc.2 current truth"
      }
    ],
    ...overrides
  };
}

function unsatisfiedDependencyGraphFunction() {
  const input = node("PromptAuthorityPacket");
  const missing = node("MissingDependency");
  const output = node("PromptInvocationAsset");
  const vector = constructGraphVector({
    name: "construct_prompt_from_missing_dependency",
    source: [missing],
    target: output,
    operators: [operator("construct_prompt_from_missing_dependency")],
    evaluators: [evaluator("construct_prompt_from_missing_dependency_shape")],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
  const graph = constructGraph({
    name: "PromptConstructionWithMissingDependency",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: ["prompt-construction"],
    tags: ["t150-program-conformance-tool"]
  });
  return constructGraphFunction({
    name: "construct_prompt_from_missing_dependency",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://prompt-construction-missing-dependency",
      graph,
      version: null
    }),
    effects: ["prompt-construction"],
    declarations: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
}

test("T-150 GTL program typechecker admits a complete graph prompt plugin inventory", () => {
  const report = typecheckGtlProgram(compliantInput());

  assert.equal(report.kind, "gtl_program_conformance_report");
  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.issueCount, 0);
  assert.equal(report.coverage.publishedGraphFunctionCount, 1);
  assert.equal(report.coverage.graphVectorCount, 1);
  assert.equal(report.coverage.promptAssetCount, 1);
  assert.equal(report.coverage.pluginContractCount, 1);
  assert.match(report.reportRef, /^abg:\/\/gtl-program-conformance-report\/sha256:/u);
});

test("T-150 GTL program typechecker catches graph row, prompt, plugin, and identity drift", () => {
  const { graphFunction, graph, vector } = graphFunctionIdentity();
  const badPlugin = {
    ...pluginContract(),
    mayEmitRuntimeEvents: true
  };
  const report = typecheckGtlProgram(
    compliantInput({
      targetCarrierContracts: [
        {
          edgeRef: "construct_prompt_invocation",
          graphVectorRef: "wrong_vector",
          graphFunctionId: graphFunction.id,
          graphId: graph.id,
          graphVectorId: vector.id,
          targetAssetType: "WrongTarget",
          targetCarrierContractRef: "local://target-carrier"
        }
      ],
      promptAssets: [
        {
          surfaceRef: "prompt://t150/bad",
          assetSurface: assetSurface({
            renderedViewDigestPolicyRef: null
          }),
          renderedViewDigest: "not-a-digest",
          currentAbgFoldRefs: [
            "package:@abiogenesis/typescript-tenant@3.9.0-rc.13#old/fold"
          ]
        }
      ],
      pluginContracts: [badPlugin],
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://code/stale.ts",
          text: "const policy = 'abg-3.7'; const stage = 'rc13';"
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/target-carrier/vector-ref-match"));
  assert(ruleRefs.has("abg://gtl-program/target-carrier/target-asset-match"));
  assert(ruleRefs.has("abg://gtl-program/target-carrier/gtl-ref"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest-policy"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/current-abg-fold-ref"));
  assert(ruleRefs.has("abg://gtl-program/plugin-contract/admission"));
  assert(ruleRefs.has("abg://gtl-program/source-identity/current-abg-version"));
  assert(ruleRefs.has("abg://gtl-program/source-identity/stale-stage-label"));
});

test("T-150 GTL program typechecker rejects empty inventory without expected coverage", () => {
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t150/empty",
    abiPackageVersion: ABG_VERSION
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert.equal(report.coverage.publishedGraphFunctionCount, 0);
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-coverage-required"));
});

test("T-150 GTL program typechecker rejects partial expected coverage", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: { catalogGraphFunctionCount: 0 }
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-count-required"));
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-count-nonzero"));
});

test("T-150 GTL program typechecker rejects invalid ABI package versions", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      abiPackageVersion: ""
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/version/exact-package-version"));
});

test("T-150 GTL program typechecker rejects unsatisfied graph dependencies", () => {
  const graphFunction = unsatisfiedDependencyGraphFunction();
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const report = typecheckGtlProgram(
    compliantInput({
      catalogGraphFunctionRefs: ["construct_prompt_from_missing_dependency"],
      modules: [moduleFixture(graphFunction)],
      targetCarrierContracts: [
        {
          edgeRef: "construct_prompt_from_missing_dependency",
          graphVectorRef: "construct_prompt_from_missing_dependency",
          graphFunctionId: graphFunction.id,
          graphId: graph.id,
          graphVectorId: vector.id,
          targetAssetType: "PromptInvocationAsset",
          targetCarrierContractRef: "gtl://target-carrier-contract/t150/prompt-invocation"
        }
      ],
      edgeClosureContracts: [
        {
          edgeRef: "construct_prompt_from_missing_dependency",
          graphFunctionId: graphFunction.id,
          graphId: graph.id,
          graphVectorId: vector.id,
          targetAssetType: "PromptInvocationAsset"
        }
      ],
      overlays: [
        {
          overlayRef: "overlay://t150/default",
          graphFunctionRefs: ["construct_prompt_from_missing_dependency"],
          graphVectorRefs: ["construct_prompt_from_missing_dependency"],
          publicStartTargets: ["construct_prompt_from_missing_dependency"],
          defaultStartTarget: "construct_prompt_from_missing_dependency"
        }
      ],
      publicStartTargets: [
        {
          name: "prompt",
          graphFunctionRef: "construct_prompt_from_missing_dependency",
          overlayRefs: ["overlay://t150/default"],
          defaultForOverlayRefs: ["overlay://t150/default"]
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/graph-vector/source-node-declared"));
  assert(ruleRefs.has("abg://gtl-program/graph-vector/source-derivable"));
  assert(ruleRefs.has("abg://gtl-program/graph/output-derivable"));
});

test("T-150 GTL program typechecker rejects duplicate target-carrier truth for one vector identity", () => {
  const base = compliantInput({
    expectedCoverage: expectedCoverage({
      targetCarrierContractCount: 2
    })
  });
  const firstTargetCarrier = base.targetCarrierContracts[0];
  assert.notEqual(firstTargetCarrier, undefined);
  const report = typecheckGtlProgram({
    ...base,
    targetCarrierContracts: [
      firstTargetCarrier,
      {
        ...firstTargetCarrier,
        targetCarrierContractRef:
          "gtl://target-carrier-contract/t150/prompt-invocation/duplicate"
      }
    ]
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/target-carrier/unique-vector-row"));
});

test("T-150 GTL program typechecker uses opaque vector identity, not display labels", () => {
  const first = graphFunctionIdentity({
    graphFunctionName: "construct_prompt_one",
    graphName: "PromptGraphOne",
    outputName: "PromptInvocationAssetOne",
    vectorName: "shared_prompt_vector"
  });
  const second = graphFunctionIdentity({
    graphFunctionName: "construct_prompt_two",
    graphName: "PromptGraphTwo",
    outputName: "PromptInvocationAssetTwo",
    vectorName: "shared_prompt_vector"
  });
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: expectedCoverage({
        catalogGraphFunctionCount: 2,
        publishedGraphFunctionCount: 2,
        graphVectorCount: 2,
        targetCarrierContractCount: 2,
        edgeClosureContractCount: 2
      }),
      catalogGraphFunctionRefs: [
        first.graphFunction.name,
        second.graphFunction.name
      ],
      modules: [moduleFixture(first.graphFunction), moduleFixture(second.graphFunction)],
      targetCarrierContracts: [
        {
          edgeRef: first.graphFunction.name,
          graphVectorRef: first.vector.name,
          graphFunctionId: first.graphFunction.id,
          graphId: first.graph.id,
          graphVectorId: first.vector.id,
          targetAssetType: first.vector.target.name,
          targetCarrierContractRef:
            "gtl://target-carrier-contract/t150/prompt-invocation/one"
        },
        {
          edgeRef: second.graphFunction.name,
          graphVectorRef: second.vector.name,
          graphFunctionId: second.graphFunction.id,
          graphId: second.graph.id,
          graphVectorId: second.vector.id,
          targetAssetType: second.vector.target.name,
          targetCarrierContractRef:
            "gtl://target-carrier-contract/t150/prompt-invocation/two"
        }
      ],
      edgeClosureContracts: [
        {
          edgeRef: first.graphFunction.name,
          graphFunctionId: first.graphFunction.id,
          graphId: first.graph.id,
          graphVectorId: first.vector.id,
          targetAssetType: first.vector.target.name
        },
        {
          edgeRef: second.graphFunction.name,
          graphFunctionId: second.graphFunction.id,
          graphId: second.graph.id,
          graphVectorId: second.vector.id,
          targetAssetType: second.vector.target.name
        }
      ],
      overlays: [
        {
          overlayRef: "overlay://t150/default",
          graphFunctionRefs: [
            first.graphFunction.name,
            second.graphFunction.name
          ],
          graphVectorRefs: ["shared_prompt_vector"],
          publicStartTargets: [first.graphFunction.name],
          defaultStartTarget: first.graphFunction.name
        }
      ],
      publicStartTargets: [
        {
          name: "prompt",
          graphFunctionRef: first.graphFunction.name,
          overlayRefs: ["overlay://t150/default"],
          defaultForOverlayRefs: ["overlay://t150/default"]
        }
      ]
    })
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.coverage.graphVectorCount, 2);
});

test("T-150 GTL program typechecker returns typed issues for malformed raw input", () => {
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t150/malformed",
    abiPackageVersion: ABG_VERSION,
    expectedCoverage: expectedCoverage(),
    graphFunctions: {}
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/input/array-field"));
});

test("T-150 GTL program typechecker rejects current ABG engine authority flags on plugin rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      pluginContracts: [
        {
          ...pluginContract(),
          mayWriteLedgers: true
        },
        {
          ...pluginContract({ ref: "plugin://t150/evaluate" }),
          maySelectTraversal: false
        }
      ],
      expectedCoverage: expectedCoverage({
        pluginContractCount: 2
      })
    })
  );

  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert.match(messages, /mayWriteLedgers/u);
  assert.match(messages, /maySelectTraversal/u);
});

test("T-150 GTL program typechecker rejects partial prompt asset rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      promptAssets: [
        {
          surfaceRef: "prompt://t150/partial",
          assetSurface: assetSurface({
            outputContractRefs: [],
            constructorRefs: [],
            rendererRefs: [],
            renderedViewDigestPolicyRef: null,
            authoritySlots: [],
            proofObligationRefs: []
          })
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/renderer-ref"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest-policy"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/constructor-ref"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/proof-obligation"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/output-contract"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/authority-slot"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/gtl-node"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/evidence-ref"));
});

test("T-150 GTL program typechecker report identity is bound to audited inventory", () => {
  const first = typecheckGtlProgram(compliantInput());
  const second = typecheckGtlProgram(
    compliantInput(
      {},
      {
        graphFunctionName: "construct_alternate_prompt_invocation",
        graphName: "AlternatePromptConstructionGraph",
        outputName: "AlternatePromptInvocationAsset"
      }
    )
  );

  assert.equal(first.passed, true, formatGtlProgramConformanceIssues(first.issues));
  assert.equal(second.passed, true, formatGtlProgramConformanceIssues(second.issues));
  assert.notEqual(first.inventoryDigest, second.inventoryDigest);
  assert.notEqual(first.reportRef, second.reportRef);
});

test("T-150 GTL program CLI wrapper delegates to the typechecker function", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "t150-gtl-program-"));
  const validInput = path.join(workspace, "valid-program.json");
  const invalidInput = path.join(workspace, "invalid-program.json");
  await writeFile(validInput, JSON.stringify(compliantInput()), "utf8");
  await writeFile(
    invalidInput,
    JSON.stringify({
      subjectRef: "workspace://t150/empty",
      abiPackageVersion: ABG_VERSION
    }),
    "utf8"
  );

  let validStdout = "";
  let validStderr = "";
  const validExitCode = await runAbiogenesisCli(
    ["typecheck-gtl-program", "--input", validInput],
    {
      cwd: () => workspace,
      stdout: (text) => {
        validStdout += text;
      },
      stderr: (text) => {
        validStderr += text;
      }
    }
  );
  assert.equal(validExitCode, 0, validStderr);
  const validPayload = JSON.parse(validStdout);
  assert.equal(validPayload.command, "typecheck-gtl-program");
  assert.equal(validPayload.status, "passed");
  assert.equal(validPayload.report.passed, true);

  let invalidStdout = "";
  let invalidStderr = "";
  const invalidExitCode = await runAbiogenesisCli(
    ["typecheck-gtl-program", "--input", invalidInput],
    {
      cwd: () => workspace,
      stdout: (text) => {
        invalidStdout += text;
      },
      stderr: (text) => {
        invalidStderr += text;
      }
    }
  );
  assert.equal(invalidExitCode, 1, invalidStderr);
  const invalidPayload = JSON.parse(invalidStdout);
  const ruleRefs = new Set(
    invalidPayload.report.issues.map((entry) => entry.ruleRef)
  );
  assert.equal(invalidPayload.status, "failed");
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-coverage-required"));
});
