// Mini data-mapper redux sandbox — graph module declaration.
//
// Three-edge chain mirroring data_mapper at dramatically reduced scope:
//
//   raw_problem -> field_spec -> implementation -> validation_results
//
// This module is composed at runtime from public GTL/ABG admission helpers.
// It declares structure only. Per-edge obligations live in OBLIGATIONS_BY_EDGE.
// F_P/F_D plugins, the semantic evaluator, and the harness consume both.

import {
  admitModule,
  admitNode,
  compose,
  edge,
  graphFunctionForVector
} from "../../../build/semantic/code/src/index.js";

export const MINI_DM_TAGS = Object.freeze(["t101", "mini-dm-redux"]);

export const FIELD_OBLIGATIONS = Object.freeze([
  Object.freeze({
    id: "REQ-FIELD-DISPLAY-NAME",
    title: "display_name = First Last from first_name and last_name",
    sourceFields: Object.freeze(["first_name", "last_name"]),
    outputField: "display_name"
  }),
  Object.freeze({
    id: "REQ-FIELD-EMAIL-DOMAIN",
    title: "email_domain = part of email after the @ separator",
    sourceFields: Object.freeze(["email"]),
    outputField: "email_domain"
  }),
  Object.freeze({
    id: "REQ-FIELD-AGE",
    title: "age = 2026 - birth_year",
    sourceFields: Object.freeze(["birth_year"]),
    outputField: "age"
  })
]);

export const IMPL_COMPILE_OBLIGATION = Object.freeze({
  id: "REQ-IMPL-COMPILES",
  title: "Implementation compiles under tsc --noEmit"
});

export const EDGE_DEFS = Object.freeze([
  Object.freeze({
    name: "derive_field_spec",
    sourceKind: "raw_problem",
    sourceMarkov: "raw_problem_admitted",
    targetKind: "field_spec",
    targetMarkov: "field_spec_derived",
    relativePath: "design/field_spec.md",
    outputName: "field_spec_surface",
    outputAssetType: "Workspace.field_spec",
    obligationIds: Object.freeze([
      "REQ-FIELD-DISPLAY-NAME",
      "REQ-FIELD-EMAIL-DOMAIN",
      "REQ-FIELD-AGE"
    ])
  }),
  Object.freeze({
    name: "derive_implementation",
    sourceKind: "field_spec",
    sourceMarkov: "field_spec_derived",
    targetKind: "implementation",
    targetMarkov: "implementation_derived",
    relativePath: "code/transform.ts",
    outputName: "implementation_surface",
    outputAssetType: "Workspace.implementation",
    obligationIds: Object.freeze([
      "REQ-FIELD-DISPLAY-NAME",
      "REQ-FIELD-EMAIL-DOMAIN",
      "REQ-FIELD-AGE",
      "REQ-IMPL-COMPILES"
    ])
  }),
  Object.freeze({
    name: "derive_validation",
    sourceKind: "implementation",
    sourceMarkov: "implementation_derived",
    targetKind: "validation_results",
    targetMarkov: "validation_results_derived",
    relativePath: "validation/results.json",
    outputName: "validation_surface",
    outputAssetType: "Workspace.validation_results",
    obligationIds: Object.freeze([
      "REQ-FIELD-DISPLAY-NAME",
      "REQ-FIELD-EMAIL-DOMAIN",
      "REQ-FIELD-AGE"
    ])
  })
]);

export const OBLIGATION_CATALOG = Object.freeze({
  "REQ-FIELD-DISPLAY-NAME": FIELD_OBLIGATIONS[0],
  "REQ-FIELD-EMAIL-DOMAIN": FIELD_OBLIGATIONS[1],
  "REQ-FIELD-AGE": FIELD_OBLIGATIONS[2],
  "REQ-IMPL-COMPILES": IMPL_COMPILE_OBLIGATION
});

function buildNode(name, kind, markov) {
  return admitNode({
    id: `node:t101-mini-dm-redux/${kind}`,
    name,
    schema: { kind: "symbolic", ref: `Workspace.${kind}` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`mini-dm-redux:${kind}:standard`],
      outputContractRefs: [`mini-dm-redux:${kind}:contract`]
    },
    tags: [...MINI_DM_TAGS, kind]
  });
}

function buildGraphFunctionFor(edgeDef, sourceNode, targetNode) {
  const vector = edge([sourceNode], targetNode, {
    id: `vector:${edgeDef.name}`,
    name: edgeDef.name,
    evaluators: [
      {
        name: `${edgeDef.name}_accepted`,
        regime: "F_P",
        description: `${edgeDef.name} accepted by F_P semantic evaluator`,
        binding: `binding://t101-mini-dm-redux/${edgeDef.name}`,
        tags: [...MINI_DM_TAGS]
      }
    ],
    declarations: { entries: [] },
    tags: [...MINI_DM_TAGS]
  }).vectors[0];
  return graphFunctionForVector(vector, {
    name: edgeDef.name,
    declarations: { entries: [] },
    tags: [...MINI_DM_TAGS]
  });
}

export function buildMiniDmReduxModule() {
  const rawProblem = buildNode("RawProblem", "raw_problem", "raw_problem_admitted");
  const fieldSpec = buildNode("FieldSpec", "field_spec", "field_spec_derived");
  const implementation = buildNode(
    "Implementation",
    "implementation",
    "implementation_derived"
  );
  const validationResults = buildNode(
    "ValidationResults",
    "validation_results",
    "validation_results_derived"
  );
  const sourceByEdge = {
    derive_field_spec: rawProblem,
    derive_implementation: fieldSpec,
    derive_validation: implementation
  };
  const targetByEdge = {
    derive_field_spec: fieldSpec,
    derive_implementation: implementation,
    derive_validation: validationResults
  };
  const graphFunctions = EDGE_DEFS.map((edgeDef) =>
    buildGraphFunctionFor(
      edgeDef,
      sourceByEdge[edgeDef.name],
      targetByEdge[edgeDef.name]
    )
  );
  const lifecycle = compose(
    graphFunctions[0],
    graphFunctions[1],
    graphFunctions[2]
  );
  const module = admitModule({
    name: "t101_mini_dm_redux_module",
    graphs: [],
    graphFunctions: [lifecycle],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job:t101/mini-dm-redux",
        name: "t101_mini_dm_redux_job",
        contracts: [{ kind: "graph_function", targetId: lifecycle.id }],
        roles: [],
        tags: [...MINI_DM_TAGS]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
  return Object.freeze({
    module,
    lifecycle,
    perEdgeGraphFunctions: Object.freeze({
      derive_field_spec: graphFunctions[0],
      derive_implementation: graphFunctions[1],
      derive_validation: graphFunctions[2]
    }),
    nodes: Object.freeze({
      rawProblem,
      fieldSpec,
      implementation,
      validationResults
    })
  });
}

export const PROBLEM_STATEMENT = [
  "Build a transformer that takes input records",
  "{first_name, last_name, email, birth_year} and produces",
  "{display_name, email_domain, age} where",
  'display_name = "First Last",',
  "email_domain is everything after the @ in email,",
  "and age = 2026 - birth_year.",
  "Edge cases: trim leading/trailing whitespace from names;",
  "treat email without an @ as a missing email_domain;",
  "treat a future birth_year as a missing age."
].join(" ");

export const EXPECTED_TRANSFORM_CASES = Object.freeze([
  Object.freeze({
    label: "happy_path",
    input: Object.freeze({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      birth_year: 1990
    }),
    expected: Object.freeze({
      display_name: "Ada Lovelace",
      email_domain: "example.com",
      age: 36
    })
  }),
  Object.freeze({
    label: "trim_whitespace",
    input: Object.freeze({
      first_name: "  Grace  ",
      last_name: " Hopper",
      email: "grace@navy.mil",
      birth_year: 1906
    }),
    expected: Object.freeze({
      display_name: "Grace Hopper",
      email_domain: "navy.mil",
      age: 120
    })
  }),
  Object.freeze({
    label: "missing_email_domain",
    input: Object.freeze({
      first_name: "Alan",
      last_name: "Turing",
      email: "no-at-sign-here",
      birth_year: 1912
    }),
    expected: Object.freeze({
      display_name: "Alan Turing",
      email_domain: null,
      age: 114
    })
  })
]);
