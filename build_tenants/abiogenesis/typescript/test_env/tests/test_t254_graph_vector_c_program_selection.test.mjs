// Validates: REQ-L-GTL3-C-ALGEBRA-011/-014/-016
// Validates: REQ-L-GTL3-GRAPHVECTOR-005/-007
// Validates: REQ-R-ABG3-CCALL-016

/* global structuredClone */

import assert from "node:assert/strict";
import test from "node:test";

import {
  C,
  cCarrier,
  cGraphFunctionRef,
  cInterfaceCarrier,
  cInterfaceContractRef,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  serializeCProgramCanonical,
  typedInterface,
  typedNode,
  workflow
} from "../../build/semantic/code/src/gtl/m01/algebra/index.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  admitGraphVector
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  serializeGraphVector
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";
import {
  graphFunctionDeclarations,
  graphVectorDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  hogProgramRefDeclarationEntry
} from "../../build/semantic/code/src/gtl/m01/contracts/execution_declaration_builders.js";
import {
  interfaceContract,
  nodeContractKey
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  collectRawCProgramCandidates,
  compileGraphVectorCProgramSelection
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import {
  compileExecutionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/execution_declaration_compiler.js";
import {
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";

function labNode(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://scenario-09/${name}` },
    markov: ["admitted"],
    assetSurface: { kind: `scenario_09_${name}` },
    tags: ["scenario-09"]
  });
}

function typedBoundary(nodes) {
  return typedInterface(
    ...nodes.map((node) => typedNode({ node, decode: (raw) => raw }))
  );
}

function interfaceCarrier(nodes) {
  return cInterfaceCarrier(typedBoundary(nodes));
}

function edgeProgram(input) {
  const stem = input.programRef.replaceAll(/[^a-zA-Z0-9]/gu, "_");
  const candidate = interfaceCarrier([labNode(`${stem}_Candidate`)]);
  const assessment = interfaceCarrier([labNode(`${stem}_Assessment`)]);
  return declareCProgram({
    programRef: input.programRef,
    term: C.edge({
      transform: C.of({
        input: input.input,
        output: candidate,
        stageRole: "transform",
        fibre: "F_P",
        armId: `${input.programRef}/transform`,
        resultBearing: true
      }),
      evaluate: C.of({
        input: candidate,
        output: assessment,
        stageRole: "evaluate",
        fibre: "F_D",
        armId: `${input.programRef}/evaluate`,
        resultBearing: false
      }),
      consequence: C.of({
        input: assessment,
        output: input.output,
        stageRole: "consequence",
        fibre: "F_D",
        armId: `${input.programRef}/consequence`,
        resultBearing: false
      })
    }),
    proportionalityClass: "P1"
  });
}

function vector(input) {
  return constructGraphVector({
    name: input.name,
    source: input.source,
    target: input.target,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations:
      input.programRef === null
        ? graphVectorDeclarations([])
        : graphVectorDeclarations([
            hogProgramRefDeclarationEntry(input.programRef)
          ]),
    tags: ["scenario-09"]
  });
}

function graphFunction(input) {
  const graph = constructGraph({
    name: input.name,
    inputs: input.inputs,
    outputs: input.outputs,
    nodes: input.nodes,
    vectors: input.vectors,
    contexts: [],
    rules: [],
    effects: [],
    tags: ["scenario-09"]
  });
  return constructGraphFunction({
    name: `graph-function://scenario-09/${input.name}`,
    environment: constructEnvRef({
      requires: input.inputs,
      provides: input.outputs,
      carries: input.nodes
    }),
    inputs: input.inputs,
    outputs: input.outputs,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://scenario-09/${input.name}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: input.declarations,
    tags: ["scenario-09"]
  });
}

function scenarioFixture(input = {}) {
  const observation = labNode("LabObservation");
  const normalized = labNode("NormalizedObservation");
  const finding = labNode("ResearchFinding");
  const normalizeRef = "program://scenario-09/normalize";
  const synthesizeRef = "program://scenario-09/synthesize";
  const normalize = edgeProgram({
    programRef: normalizeRef,
    input: interfaceCarrier([observation]),
    output: interfaceCarrier([normalized])
  });
  const synthesize = edgeProgram({
    programRef: synthesizeRef,
    input: interfaceCarrier([normalized]),
    output: interfaceCarrier([finding])
  });
  const normalizeVector = vector({
    name: "normalize_observation",
    source: [observation],
    target: normalized,
    programRef: input.localSelectors === false ? null : normalizeRef
  });
  const synthesizeVector = vector({
    name: "synthesize_finding",
    source: [normalized],
    target: finding,
    programRef: input.localSelectors === false ? null : synthesizeRef
  });
  const host = graphFunction({
    name: input.name ?? "lab_pipeline",
    inputs: [observation],
    outputs: [finding],
    nodes: [observation, normalized, finding],
    vectors: [normalizeVector, synthesizeVector],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([normalize, synthesize]),
      hogProgramRefDeclarationEntry(normalizeRef)
    ])
  });
  return {
    observation,
    normalized,
    finding,
    normalize,
    synthesize,
    normalizeVector,
    synthesizeVector,
    host
  };
}

function taggedJsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return {
      kind: "array",
      items: value.map(taggedJsonValue)
    };
  }
  return {
    kind: "object",
    entries: Object.entries(value).map(([key, entry]) => ({
      key,
      value: taggedJsonValue(entry)
    }))
  };
}

function withRawCatalog(host, candidates, selectionRef = candidates[0]?.programRef) {
  return {
    ...host,
    declarations: {
      entries: [
        {
          key: "abg.hog_program_catalog",
          value: {
            kind: "json_blob",
            value: taggedJsonValue(candidates)
          }
        },
        {
          key: "abg.hog_program_ref",
          value: { kind: "scalar", value: selectionRef }
        }
      ]
    }
  };
}

function plainProgram(program) {
  return JSON.parse(serializeCProgramCanonical(program));
}

function messages(report, diagnosticId) {
  return report.issues.filter((issue) =>
    issue.message.includes(`${diagnosticId}:`)
  );
}

test("T-254 Scenario 09 derives two exact vector-local program bindings", () => {
  const fixture = scenarioFixture();
  const normalize = compileGraphVectorCProgramSelection({
    graphFunction: fixture.host,
    graphVector: fixture.normalizeVector
  });
  const synthesize = compileGraphVectorCProgramSelection({
    graphFunction: fixture.host,
    graphVector: fixture.synthesizeVector
  });

  assert.equal(normalize.binding?.selectedProgramRef, fixture.normalize.programRef);
  assert.equal(
    synthesize.binding?.selectedProgramRef,
    fixture.synthesize.programRef
  );
  assert.deepEqual(
    normalize.binding?.orderedSourceNodeContractKeys,
    interfaceContract([fixture.observation])
  );
  assert.equal(
    normalize.binding?.targetNodeContractKey,
    nodeContractKey(fixture.normalized)
  );
  assert.equal(
    normalize.binding?.programInputCarrierRef,
    cInterfaceContractRef([fixture.observation])
  );
  assert.equal(
    normalize.binding?.programOutputCarrierRef,
    cInterfaceContractRef([fixture.normalized])
  );
  assert.equal(normalize.binding?.selectionSource, "graph_vector");
  assert.equal(synthesize.binding?.selectionSource, "graph_vector");
  assert.deepEqual(
    normalize.diagnostics.map((row) => row.diagnosticId),
    ["gtl-c-unrealized-vector-program-selection"]
  );
  assert.equal(normalize.diagnostics[0]?.axiomRef, "GV-C-08");
  assert.deepEqual(
    synthesize.diagnostics.map((row) => row.diagnosticId),
    ["gtl-c-unrealized-vector-program-selection"]
  );

  const report = typecheckGtlProgram({
    subjectRef: "program://scenario-09/t254",
    abiPackageVersion: "5.0.0-dev.0",
    graphFunctions: [fixture.host]
  });
  assert.equal(
    messages(report, "gtl-c-unrealized-vector-program-selection").length,
    2
  );
  assert.equal(messages(report, "gtl-c-vector-program-carrier-mismatch").length, 0);

  const foreign = scenarioFixture({ name: "foreign_catalog" });
  const hostDerived = compileGraphVectorCProgramSelection({
    graphFunction: fixture.host,
    graphVector: fixture.normalizeVector,
    rawCandidates: collectRawCProgramCandidates(foreign.host.declarations)
  });
  assert.equal(
    hostDerived.binding?.selectedProgramRef,
    fixture.normalize.programRef,
    "the exported compiler ignores a caller-supplied foreign candidate cache"
  );
});

test("T-254 native and raw GraphVector selector law are equivalent", () => {
  const fixture = scenarioFixture();
  const serialized = serializeGraphVector(fixture.normalizeVector);
  const admitted = admitGraphVector(structuredClone(serialized));
  assert.deepEqual(
    admitted.declarations.entries,
    fixture.normalizeVector.declarations.entries
  );

  const invalidEntries = [
    {
      label: "wrong selector kind",
      entry: {
        key: "abg.hog_program_ref",
        value: { kind: "json_blob", value: { kind: "array", items: [] } }
      },
      pattern: /must use scalar/u
    },
    {
      label: "empty selector",
      entry: {
        key: "abg.hog_program_ref",
        value: { kind: "scalar", value: "" }
      },
      pattern: /gtl-c-vector-program-empty-ref/u
    },
    {
      label: "non-string selector",
      entry: {
        key: "abg.hog_program_ref",
        value: { kind: "scalar", value: 3 }
      },
      pattern: /gtl-c-vector-program-empty-ref/u
    },
    {
      label: "unregistered reserved key",
      entry: {
        key: "abg.hog_program_selector_alias",
        value: { kind: "scalar", value: "program://alias" }
      },
      pattern: /reserved abg\.\/gtl\./u
    }
  ];
  for (const row of invalidEntries) {
    assert.throws(
      () =>
        admitGraphVector({
          ...serialized,
          declarations: { entries: [row.entry] }
        }),
      row.pattern,
      row.label
    );
  }
  assert.throws(
    () =>
      admitGraphVector({
        ...serialized,
        declarations: {
          entries: [
            {
              key: "abg.hog_program_ref",
              value: { kind: "scalar", value: "program://one" }
            },
            {
              key: "abg.hog_program_ref",
              value: { kind: "scalar", value: "program://two" }
            }
          ]
        }
      }),
    /duplicate (?:attr key|declaration authority)/u
  );

  const graphFunctionOnlyKeys = [
    ["abg.hog_program", { kind: "json_blob", value: { kind: "object", entries: [] } }],
    ["abg.hog_program_catalog", { kind: "json_blob", value: { kind: "array", items: [] } }],
    ["abg.hog_program_ladder", { kind: "json_blob", value: { kind: "array", items: [] } }],
    ["abg.hog_handler_bindings", { kind: "json_blob", value: { kind: "array", items: [] } }],
    ["abg.hog_handler_configs", { kind: "json_blob", value: { kind: "object", entries: [] } }],
    ["abg.plugin_selection", { kind: "json_blob", value: { kind: "object", entries: [] } }]
  ];
  for (const [key, value] of graphFunctionOnlyKeys) {
    assert.throws(
      () =>
        admitGraphVector({
          ...serialized,
          declarations: { entries: [{ key, value }] }
        }),
      /not registered for graph_vector/u,
      key
    );
  }
});

test("T-254 no local selector preserves the existing GraphFunction plan", () => {
  const fixture = scenarioFixture({ localSelectors: false, name: "no_local" });
  const compilation = compileGraphVectorCProgramSelection({
    graphFunction: fixture.host,
    graphVector: fixture.normalizeVector
  });
  assert.equal(compilation.observed, false);
  assert.equal(compilation.accepted, true);
  assert.equal(compilation.binding, null);
  assert.deepEqual(compilation.diagnostics, []);
  assert.equal(compileExecutionDeclarations(fixture.host).hogProgramPlan.mode, "catalog");

  const detached = vector({
    name: "detached_without_selector",
    source: [fixture.observation],
    target: fixture.normalized,
    programRef: null
  });
  const detachedCompilation = compileGraphVectorCProgramSelection({
    graphFunction: fixture.host,
    graphVector: detached
  });
  assert.equal(detachedCompilation.observed, false);
  assert.equal(detachedCompilation.accepted, true);
  assert.deepEqual(detachedCompilation.diagnostics, []);

  const selectedFixture = scenarioFixture({ name: "authoritative_selector" });
  const declarationErasingClone = {
    ...selectedFixture.normalizeVector,
    declarations: graphVectorDeclarations([])
  };
  const authoritativeContained = compileGraphVectorCProgramSelection({
    graphFunction: selectedFixture.host,
    graphVector: declarationErasingClone
  });
  assert.equal(authoritativeContained.observed, true);
  assert.equal(
    authoritativeContained.binding?.selectedProgramRef,
    selectedFixture.normalize.programRef
  );
});

test("T-254 refuses missing, unresolved, duplicate, malformed, and legacy selection", () => {
  const fixture = scenarioFixture();
  const noCatalog = {
    ...fixture.host,
    declarations: {
      entries: [
        {
          key: "abg.hog_program_ref",
          value: { kind: "scalar", value: fixture.normalize.programRef }
        }
      ]
    }
  };
  const missing = compileGraphVectorCProgramSelection({
    graphFunction: noCatalog,
    graphVector: fixture.normalizeVector
  });
  assert.equal(missing.diagnostics[0]?.diagnosticId, "gtl-c-vector-program-missing-catalog");

  const unresolvedVector = {
    ...fixture.normalizeVector,
    declarations: {
      entries: [
        {
          key: "abg.hog_program_ref",
          value: { kind: "scalar", value: "program://scenario-09/absent" }
        }
      ]
    }
  };
  const unresolvedHost = {
    ...fixture.host,
    template: {
      ...fixture.host.template,
      graph: {
        ...fixture.host.template.graph,
        vectors: [unresolvedVector, fixture.synthesizeVector]
      }
    }
  };
  const unresolved = compileGraphVectorCProgramSelection({
    graphFunction: unresolvedHost,
    graphVector: unresolvedVector
  });
  assert.equal(unresolved.diagnostics[0]?.diagnosticId, "gtl-c-vector-program-unresolved-ref");
  assert.equal(unresolved.diagnostics[0]?.axiomRef, "GV-C-02");

  const duplicateHost = withRawCatalog(
    fixture.host,
    [plainProgram(fixture.normalize), plainProgram(fixture.normalize)],
    fixture.normalize.programRef
  );
  const duplicate = compileGraphVectorCProgramSelection({
    graphFunction: duplicateHost,
    graphVector: fixture.normalizeVector
  });
  assert.equal(duplicate.selectedCandidates.length, 2);
  assert.equal(duplicate.diagnostics[0]?.diagnosticId, "gtl-c-vector-program-unresolved-ref");

  const malformedProgram = plainProgram(fixture.normalize);
  delete malformedProgram.term;
  const malformedHost = withRawCatalog(
    fixture.host,
    [malformedProgram, plainProgram(fixture.synthesize)],
    fixture.normalize.programRef
  );
  const malformed = compileGraphVectorCProgramSelection({
    graphFunction: malformedHost,
    graphVector: fixture.normalizeVector
  });
  assert.equal(malformed.diagnostics.length, 0);
  assert.ok(
    malformed.selectedProgramDiagnostics.some(
      (row) => row.diagnosticId === "gtl-c-invalid-syntax"
    )
  );
  const malformedReport = typecheckGtlProgram({
    subjectRef: "program://scenario-09/malformed-selected",
    abiPackageVersion: "5.0.0-dev.0",
    graphFunctions: [malformedHost]
  });
  const malformedIssues = messages(malformedReport, "gtl-c-invalid-syntax");
  assert.equal(malformedIssues.length, 1);
  assert.match(
    malformedIssues[0].surfaceRef,
    /\.declarations\["abg\.hog_program_catalog"\]\[0\]/u
  );
  assert.equal(
    messages(malformedReport, "gtl-c-unrealized-vector-program-selection").filter(
      (issue) => issue.surfaceRef.includes("vectors[0]")
    ).length,
    0
  );

  const legacyHost = withRawCatalog(
    fixture.host,
    [
      {
        syntaxVersion: "hog-syntax/1",
        programRef: fixture.normalize.programRef,
        stages: [],
        proportionalityClass: null
      },
      plainProgram(fixture.synthesize)
    ],
    fixture.normalize.programRef
  );
  const legacy = compileGraphVectorCProgramSelection({
    graphFunction: legacyHost,
    graphVector: fixture.normalizeVector
  });
  assert.equal(legacy.diagnostics[0]?.diagnosticId, "gtl-c-vector-program-interface-missing");
  assert.equal(
    legacy.diagnostics.some(
      (row) => row.diagnosticId === "gtl-c-unrealized-vector-program-selection"
    ),
    false
  );

  const mixedMalformed = plainProgram(fixture.normalize);
  delete mixedMalformed.term;
  const mixedHost = withRawCatalog(
    fixture.host,
    [
      mixedMalformed,
      {
        syntaxVersion: "hog-syntax/unknown",
        programRef: "program://scenario-09/unknown"
      }
    ],
    fixture.normalize.programRef
  );
  const mixedReport = typecheckGtlProgram({
    subjectRef: "program://scenario-09/mixed-invalid-catalog",
    abiPackageVersion: "5.0.0-dev.0",
    graphFunctions: [mixedHost]
  });
  assert.equal(messages(mixedReport, "gtl-c-invalid-syntax").length, 1);
  const mixedExecutionIssues = mixedReport.issues.filter(
    (issue) =>
      issue.ruleRef === "abg://gtl-program/execution-declaration/invalid"
  );
  assert.equal(mixedExecutionIssues.length, 1);
  assert.match(mixedExecutionIssues[0].message, /unknown program syntaxVersion/u);
});

test("T-254 exact containment and ordered multi-source interfaces fail closed", () => {
  const fixture = scenarioFixture();
  const detachedVector = vector({
    name: "detached_normalize_observation",
    source: [fixture.observation],
    target: fixture.normalized,
    programRef: fixture.normalize.programRef
  });
  const containment = compileGraphVectorCProgramSelection({
    graphFunction: fixture.host,
    graphVector: detachedVector
  });
  assert.equal(
    containment.diagnostics[0]?.diagnosticId,
    "gtl-c-vector-program-containment-mismatch"
  );

  const left = labNode("LeftObservation");
  const right = labNode("RightObservation");
  const target = labNode("JoinedObservation");
  const programRef = "program://scenario-09/join";
  const reversedProgram = edgeProgram({
    programRef,
    input: interfaceCarrier([right, left]),
    output: interfaceCarrier([target])
  });
  const joinVector = vector({
    name: "join_observations",
    source: [left, right],
    target,
    programRef
  });
  const host = graphFunction({
    name: "ordered_join",
    inputs: [left, right],
    outputs: [target],
    nodes: [left, right, target],
    vectors: [joinVector],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([reversedProgram]),
      hogProgramRefDeclarationEntry(programRef)
    ])
  });
  const order = compileGraphVectorCProgramSelection({
    graphFunction: host,
    graphVector: joinVector
  });
  assert.equal(order.diagnostics[0]?.diagnosticId, "gtl-c-vector-program-carrier-mismatch");
  assert.equal(order.diagnostics[0]?.axiomRef, "GV-C-04");
  assert.notEqual(
    cInterfaceContractRef([left, right]),
    cInterfaceContractRef([right, left])
  );
});

function batchFixture(mismatched) {
  const source = labNode("BatchSource");
  const target = labNode("BatchTarget");
  const expectedInput = interfaceCarrier([source]);
  const actualInput = mismatched
    ? cCarrier("gtl.c.interface-contract:sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    : expectedInput;
  const output = mismatched
    ? cCarrier(cInterfaceContractRef([target]))
    : interfaceCarrier([target]);
  const task = C.of({
    input: actualInput,
    output,
    stageRole: "transform",
    fibre: "F_P",
    armId: "arm://scenario-09/batch",
    resultBearing: true
  });
  const program = declareCProgram({
    programRef: "program://scenario-09/batch",
    term: C.batch([task], "batch://scenario-09/lab"),
    proportionalityClass: "P1"
  });
  const graphVector = vector({
    name: "batch_observation",
    source: [source],
    target,
    programRef: program.programRef
  });
  const host = graphFunction({
    name: mismatched ? "batch_mismatch" : "batch_lawful",
    inputs: [source],
    outputs: [target],
    nodes: [source, target],
    vectors: [graphVector],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program]),
      hogProgramRefDeclarationEntry(program.programRef)
    ])
  });
  return { host, graphVector };
}

test("T-254 stages selected nested diagnostics behind outer boundary validity", () => {
  const lawful = batchFixture(false);
  const lawfulReport = typecheckGtlProgram({
    subjectRef: "program://scenario-09/lawful-batch",
    abiPackageVersion: "5.0.0-dev.0",
    graphFunctions: [lawful.host]
  });
  assert.equal(messages(lawfulReport, "gtl-c-unrealized-batch").length, 0);
  assert.equal(
    messages(lawfulReport, "gtl-c-unrealized-vector-program-selection").length,
    1
  );

  const mismatched = batchFixture(true);
  const mismatchReport = typecheckGtlProgram({
    subjectRef: "program://scenario-09/mismatched-batch",
    abiPackageVersion: "5.0.0-dev.0",
    graphFunctions: [mismatched.host]
  });
  const carrierIssues = messages(
    mismatchReport,
    "gtl-c-vector-program-carrier-mismatch"
  );
  assert.equal(carrierIssues.length, 1);
  assert.match(
    carrierIssues[0].surfaceRef,
    /\.declarations\["abg\.hog_program_catalog"\]\[0\]/u
  );
  assert.equal(messages(mismatchReport, "gtl-c-unrealized-batch").length, 0);
  assert.equal(
    messages(mismatchReport, "gtl-c-unrealized-vector-program-selection").length,
    0
  );

  const fixture = scenarioFixture({ name: "unresolved_selected_workflow" });
  const missingGraphFunction = constructGraphFunction({
    name: "graph-function://scenario-09/missing-workflow-target",
    environment: constructEnvRef({
      requires: [fixture.observation],
      provides: [fixture.normalized],
      carries: [fixture.observation, fixture.normalized]
    }),
    inputs: [fixture.observation],
    outputs: [fixture.normalized],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: "template://scenario-09/missing-workflow-target",
      graph: null,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([]),
    tags: ["scenario-09"]
  });
  const workflowProgram = declareCProgram({
    programRef: "program://scenario-09/unresolved-workflow",
    term: workflow.C(
      cGraphFunctionRef({
        graphFunction: missingGraphFunction,
        input: typedBoundary([fixture.observation]),
        output: typedBoundary([fixture.normalized])
      })
    ),
    proportionalityClass: "P1"
  });
  const selectedWorkflowVector = vector({
    name: "selected_unresolved_workflow",
    source: [fixture.observation],
    target: fixture.normalized,
    programRef: workflowProgram.programRef
  });
  const selectedWorkflowHost = graphFunction({
    name: "selected_unresolved_workflow",
    inputs: [fixture.observation],
    outputs: [fixture.normalized],
    nodes: [fixture.observation, fixture.normalized],
    vectors: [selectedWorkflowVector],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([workflowProgram]),
      hogProgramRefDeclarationEntry(workflowProgram.programRef)
    ])
  });
  const unresolvedWorkflowReport = typecheckGtlProgram({
    subjectRef: "program://scenario-09/unresolved-selected-workflow",
    abiPackageVersion: "5.0.0-dev.0",
    graphFunctions: [selectedWorkflowHost]
  });
  assert.equal(
    unresolvedWorkflowReport.issues.filter(
      (issue) =>
        issue.ruleRef ===
        "abg://gtl-program/c-algebra/unresolved-graph-function"
    ).length,
    1
  );
  assert.equal(
    messages(
      unresolvedWorkflowReport,
      "gtl-c-unrealized-vector-program-selection"
    ).length,
    0
  );
});
