import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cGraphFunctionRef,
  cProgramGraphFunctionDeclarations,
  declareCProgram,
  admitGraphFunction,
  admitSerializedAttrEntry,
  admitSerializedAttrValue,
  admitSerializedJsonValue,
  admitGraphVector,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptyGraphFunctionDeclarations,
  GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER,
  GTL_EXECUTION_DECLARATION_LAWS,
  graphFunctionDeclarations,
  graphFunctionForVector,
  graphVectorDeclarations,
  hogProgramRefDeclarationEntry,
  registeredGtlExecutionDeclarationLaw,
  typedInterface,
  typedNode,
  typecheckGtlProgram
} from "../../build/semantic/code/src/index.js";
import { workflow } from "../../build/semantic/code/src/gtl/m01/algebra/c_algebra.js";

const testDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(testDir, "..", "..");

function node(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://t220/${name}` },
    markov: [`${name}:declared`],
    assetSurface: { kind: `t220_${name}` },
    tags: ["t220"]
  });
}

function typedGraphFunctionBoundary(nodes) {
  return typedInterface(
    ...nodes.map((value) => typedNode({ node: value, decode: (raw) => raw }))
  );
}

function vectorFixture(declarations = graphVectorDeclarations([])) {
  const source = node("source");
  const target = node("target");
  return constructGraphVector({
    name: "t220_source_to_target",
    source: [source],
    target,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations,
    tags: ["t220"]
  });
}

function graphFunctionFixture() {
  const vector = vectorFixture();
  const graph = constructGraph({
    name: "t220_graph",
    inputs: vector.source,
    outputs: [vector.target],
    nodes: [...vector.source, vector.target],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t220"]
  });
  return constructGraphFunction({
    name: "graph-function://t220/declaration-law",
    environment: constructEnvRef({
      requires: vector.source,
      provides: [vector.target],
      carries: [...vector.source, vector.target]
    }),
    inputs: vector.source,
    outputs: [vector.target],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t220/declaration-law",
      graph,
      version: null
    }),
    effects: [],
    declarations: emptyGraphFunctionDeclarations(),
    tags: ["t220"]
  });
}

test("T-220 raw tagged JSON rejects duplicate object keys", () => {
  assert.throws(
    () =>
      admitSerializedJsonValue({
        kind: "object",
        entries: [
          { key: "fpDispatch", value: "plugin://one" },
          { key: "fpDispatch", value: "plugin://two" }
        ]
      }),
    /duplicate serialized object key/u
  );
});

test("T-220 raw GTL admission rejects fields that would otherwise disappear", () => {
  assert.throws(
    () =>
      admitSerializedAttrValue({
        kind: "scalar",
        value: "candidate",
        valu: "typo"
      }),
    /\.valu: unknown field/u
  );
  assert.throws(
    () =>
      admitSerializedAttrEntry({
        key: "product.release_label",
        value: { kind: "scalar", value: "candidate" },
        ky: "typo"
      }),
    /\.ky: unknown field/u
  );
  assert.throws(
    () => admitSerializedJsonValue(Number.NaN),
    /canonical serialized scalar/u
  );

  const graphFunction = graphFunctionFixture();
  assert.throws(
    () => admitGraphFunction({ ...graphFunction, functonName: graphFunction.name }),
    /\.functonName: unknown field/u
  );
  assert.throws(
    () => admitGraphVector({ ...vectorFixture(), allowSubwork: false }),
    /\.allowSubwork: unknown field/u
  );
});

test("T-220 publishes precedence, composition, and owner for compiled execution declarations", () => {
  assert.deepEqual(
    GTL_EXECUTION_DECLARATION_LAWS.map((law) => law.key).sort(),
    [
      "abg.hog_handler_bindings",
      "abg.hog_handler_configs",
      "abg.hog_program",
      "abg.hog_program_catalog",
      "abg.hog_program_ladder",
      "abg.hog_program_ref",
      "abg.plugin_selection"
    ]
  );
  for (const law of GTL_EXECUTION_DECLARATION_LAWS) {
    assert.equal(
      law.interpretationOwner,
      GTL_EXECUTION_DECLARATION_INTERPRETATION_OWNER
    );
    assert.equal(registeredGtlExecutionDeclarationLaw(law.key), law);
  }
  assert.equal(
    registeredGtlExecutionDeclarationLaw("abg.hog_program")?.precedenceRule,
    "single_program_exclusive_with_catalog_mode"
  );
  assert.equal(
    registeredGtlExecutionDeclarationLaw("abg.hog_program_ref")?.precedenceRule,
    "graph_function_fixed_exclusive_with_ladder_and_graph_vector_fixed_local_exact_else_graph_function_plan"
  );
  assert.equal(
    registeredGtlExecutionDeclarationLaw("abg.plugin_selection")?.compositionRule,
    "merge_distinct_seams_only"
  );
  assert.equal(registeredGtlExecutionDeclarationLaw("abg.runtime_regime"), null);
});

test("T-220 declaration builders preserve opaque attrs and reject reserved-law drift", () => {
  const opaque = graphFunctionDeclarations([
    {
      key: "product.release_label",
      value: { kind: "scalar", value: "candidate" }
    }
  ]);
  assert.equal(opaque.entries[0]?.key, "product.release_label");

  assert.throws(
    () =>
      graphFunctionDeclarations([
        {
          key: "abg.unregistered_authority",
          value: { kind: "scalar", value: true }
        }
      ]),
    /reserved abg\.\/gtl\./u
  );
  assert.throws(
    () =>
      graphVectorDeclarations([
        {
          key: "abg.plugin_selection",
          value: {
            kind: "json_blob",
            value: { kind: "object", entries: [] }
          }
        }
      ]),
    /not registered for graph_vector/u
  );
  assert.throws(
    () =>
      graphFunctionDeclarations([
        {
          key: "abg.plugin_selection",
          value: { kind: "scalar", value: "plugin://invalid" }
        }
      ]),
    /must use json_blob/u
  );
  assert.throws(
    () =>
      graphFunctionDeclarations([
        { key: "product.label", value: { kind: "scalar", value: "one" } },
        { key: "product.label", value: { kind: "scalar", value: "two" } }
      ]),
    /duplicate declaration authority/u
  );
});

test("T-220 GraphVector admission enforces registered declaration law", () => {
  const vector = vectorFixture();
  assert.throws(
    () =>
      admitGraphVector({
        ...vector,
        declarations: {
          entries: [
            {
              key: "gtl.unregistered_contract",
              value: { kind: "scalar", value: "contract://invalid" }
            }
          ]
        }
      }),
    /reserved abg\.\/gtl\./u
  );
});

test("T-254 GraphVector admits only a non-empty existing program selector", () => {
  const declarations = graphVectorDeclarations([
    hogProgramRefDeclarationEntry("program://scenario-09/normalize")
  ]);
  assert.equal(declarations.entries[0]?.key, "abg.hog_program_ref");
  assert.equal(
    declarations.entries[0]?.value.value,
    "program://scenario-09/normalize"
  );

  assert.throws(
    () =>
      admitGraphVector({
        ...vectorFixture(),
        declarations: {
          entries: [
            {
              key: "abg.hog_program_ref",
              value: { kind: "scalar", value: "" }
            }
          ]
        }
      }),
    /gtl-c-vector-program-empty-ref/u
  );
  assert.throws(
    () =>
      admitGraphVector({
        ...vectorFixture(),
        declarations: {
          entries: [
            {
              key: "abg.hog_program_ref",
              value: { kind: "scalar", value: 1 }
            }
          ]
        }
      }),
    /gtl-c-vector-program-empty-ref/u
  );
});

test("T-220 graphFunctionForVector keeps vector declarations vector-local", () => {
  const vector = vectorFixture(
    graphVectorDeclarations([
      {
        key: "abg.runtime_regime",
        value: { kind: "scalar", value: "F_P" }
      }
    ])
  );
  const graphFunction = graphFunctionForVector(vector);
  assert.deepEqual(graphFunction.declarations.entries, []);
  assert.equal(vector.declarations.entries[0]?.key, "abg.runtime_regime");
  assert.equal(
    graphFunction.template.graph.vectors[0]?.declarations.entries[0]?.key,
    "abg.runtime_regime"
  );
});

test("T-220 semantic compiler emits stable declaration diagnostics and repairs", () => {
  const graphFunction = graphFunctionFixture();
  const vector = graphFunction.template.graph.vectors[0];
  const invalidVector = {
    ...vector,
    declarations: {
      entries: [
        {
          key: "abg.plugin_selection",
          value: {
            kind: "json_blob",
            value: { kind: "object", entries: [] }
          }
        }
      ]
    }
  };
  const invalidGraphFunction = {
    ...graphFunction,
    template: {
      ...graphFunction.template,
      graph: {
        ...graphFunction.template.graph,
        vectors: [invalidVector]
      }
    },
    declarations: {
      entries: [
        {
          key: "abg.unregistered_authority",
          value: { kind: "scalar", value: true }
        },
        {
          key: "abg.runtime_regime",
          value: { kind: "scalar", value: "F_P" }
        },
        {
          key: "abg.plugin_selection",
          value: { kind: "scalar", value: "plugin://invalid" }
        },
        {
          key: "product.duplicate",
          value: { kind: "scalar", value: "one" }
        },
        {
          key: "product.duplicate",
          value: { kind: "scalar", value: "two" }
        }
      ]
    }
  };
  const report = typecheckGtlProgram({
    subjectRef: "program://t220/declaration-law",
    abiPackageVersion: "4.0.0-rc.3",
    graphFunctions: [invalidGraphFunction]
  });
  const expectedRepairs = new Map([
    [
      "abg://gtl-program/declaration/duplicate-key",
      "remove_duplicate_declaration"
    ],
    ["abg://gtl-program/declaration/host-compatible", "correct_reference"],
    [
      "abg://gtl-program/declaration/reserved-key-registered",
      "correct_reference"
    ],
    ["abg://gtl-program/declaration/value-kind", "correct_field_shape"]
  ]);
  for (const [ruleRef, editClass] of expectedRepairs) {
    const diagnostic = report.issues.find((issue) => issue.ruleRef === ruleRef);
    assert.ok(diagnostic, `missing ${ruleRef}`);
    assert.equal(diagnostic.admissibleRepairs[0]?.editClass, editClass);
  }
  assert.ok(
    report.issues.some(
      (issue) =>
        issue.surfaceKind === "graph_vector" &&
        issue.ruleRef === "abg://gtl-program/declaration/host-compatible"
    ),
    "missing GraphVector host diagnostic"
  );

  const malformedCarrierReport = typecheckGtlProgram({
    subjectRef: "program://t220/malformed-declaration-carrier",
    abiPackageVersion: "4.0.0-rc.3",
    graphFunctions: [
      {
        ...graphFunction,
        declarations: {
          entries: [{ key: "abg.plugin_selection", value: null }]
        }
      }
    ]
  });
  assert.ok(
    malformedCarrierReport.issues.some(
      (issue) =>
        issue.ruleRef === "abg://gtl-program/declaration/value-kind" &&
        issue.admissibleRepairs[0]?.editClass === "correct_field_shape"
    )
  );
});

test("T-220 declaration-law type surface rejects impossible host states", () => {
  const tscBin = join(packageRoot, "node_modules", "typescript", "bin", "tsc");
  const tsconfigPath = join(
    packageRoot,
    "test_env",
    "type_tests",
    "tsconfig.t220.json"
  );
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, [tscBin, "-p", tsconfigPath], {
      cwd: packageRoot,
      encoding: "utf8",
      stdio: "pipe"
    });
  });
});

test("T-259 semantic compiler no longer reports direct workflow.C as unrealized", () => {
  const graphFunction = graphFunctionFixture();
  const input = typedGraphFunctionBoundary(graphFunction.inputs);
  const output = typedGraphFunctionBoundary(graphFunction.outputs);
  const program = declareCProgram({
    programRef: "gtl://t220/compiler-workflow",
    term: workflow.C(cGraphFunctionRef({ graphFunction, input, output }))
  });
  const withCProgram = constructGraphFunction({
    ...graphFunction,
    declarations: cProgramGraphFunctionDeclarations(program)
  });

  const report = typecheckGtlProgram({
    subjectRef: "program://t220/c-algebra-compiler-gap",
    abiPackageVersion: "4.0.0-rc.3",
    graphFunctions: [withCProgram]
  });
  assert.equal(
    report.issues.some(
      (row) =>
        row.ruleRef ===
          "abg://gtl-program/c-algebra/semantic-not-realized" &&
        /gtl-c-unrealized-workflow-lift/u.test(row.message)
    ),
    false,
    JSON.stringify(report.issues, null, 2)
  );
});

test("T-220 semantic compiler rejects unresolved workflow refs before realization", () => {
  const graphFunction = graphFunctionFixture();
  const input = typedGraphFunctionBoundary(graphFunction.inputs);
  const output = typedGraphFunctionBoundary(graphFunction.outputs);
  const missingGraphFunction = constructGraphFunction({
    ...graphFunction,
    name: "graph-function://t220/missing",
    id: "graph-function://t220/missing"
  });
  const program = declareCProgram({
    programRef: "gtl://t220/unresolved-workflow",
    term: workflow.C(
      cGraphFunctionRef({ graphFunction: missingGraphFunction, input, output })
    )
  });
  const authored = constructGraphFunction({
    ...graphFunction,
    declarations: cProgramGraphFunctionDeclarations(program)
  });
  const report = typecheckGtlProgram({
    subjectRef: "program://t220/unresolved-workflow",
    abiPackageVersion: "4.0.0-rc.3",
    graphFunctions: [authored]
  });
  assert.ok(
    report.issues.some(
      (row) =>
        row.ruleRef ===
        "abg://gtl-program/c-algebra/unresolved-graph-function"
    )
  );
  assert.equal(
    report.issues.some(
      (row) =>
        row.ruleRef === "abg://gtl-program/c-algebra/semantic-not-realized"
    ),
    false
  );
});

test("T-220 semantic compiler does not omit malformed or unknown HoG syntax", () => {
  const graphFunction = graphFunctionFixture();
  const malformed = constructGraphFunction({
    ...graphFunction,
    declarations: graphFunctionDeclarations([
      {
        key: "abg.hog_program",
        value: {
          kind: "json_blob",
          value: {
            kind: "object",
            entries: [
              { key: "syntaxVersion", value: "hog-syntax/unknown" },
              { key: "programRef", value: "gtl://t220/unknown" }
            ]
          }
        }
      }
    ])
  });
  const malformedCatalog = constructGraphFunction({
    ...graphFunction,
    name: "graph-function://t220/malformed-catalog",
    id: undefined,
    declarations: graphFunctionDeclarations([
      {
        key: "abg.hog_program_catalog",
        value: { kind: "json_blob", value: null }
      }
    ])
  });
  const report = typecheckGtlProgram({
    subjectRef: "program://t220/malformed-execution-declarations",
    abiPackageVersion: "4.0.0-rc.3",
    graphFunctions: [malformed, malformedCatalog]
  });
  assert.equal(
    report.issues.filter(
      (row) =>
        row.ruleRef === "abg://gtl-program/execution-declaration/invalid"
    ).length,
    2
  );
});
