// Validates: REQ-L-GTL3-MODULE, REQ-L-GTL3-ATTRS,
// REQ-L-GTL3-CONTRACT-LAW-API.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  admitModule,
  admitSerializedModuleText
} from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import * as m02Public from "../../build/semantic/code/src/gtl/m02/index.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import {
  ASSET_SURFACE_AUTHORITY_SLOT_FIELDS,
  ASSET_SURFACE_FIELDS,
  CONTEXT_FIELDS,
  ENV_REF_FIELDS,
  EVALUATOR_FIELDS,
  GRAPH_FIELDS,
  GRAPH_FUNCTION_FIELDS,
  GRAPH_VECTOR_FIELDS,
  HOOK_REF_FIELDS,
  INLINE_TEMPLATE_REF_FIELDS,
  NODE_FIELDS,
  OPERATOR_FIELDS,
  RULE_FIELDS,
  SCHEMA_REF_FIELDS,
  SERIALIZED_ATTR_ENTRY_FIELDS,
  SERIALIZED_ATTR_VALUE_FIELDS,
  SERIALIZED_ATTRS_FIELDS,
  SERIALIZED_JSON_ARRAY_FIELDS,
  SERIALIZED_JSON_OBJECT_ENTRY_FIELDS,
  SERIALIZED_JSON_OBJECT_FIELDS,
  SYMBOLIC_TEMPLATE_REF_FIELDS
} from "../../build/semantic/code/src/gtl/m01/contracts/serialized_shape.js";
import {
  CANDIDATE_FAMILY_FIELDS,
  CONTRACT_REF_FIELDS,
  JOB_FIELDS,
  MODULE_FIELDS,
  MODULE_IMPORT_FIELDS,
  REFINEMENT_BOUNDARY_FIELDS,
  ROLE_FIELDS
} from "../../build/semantic/code/src/gtl/m02/contracts/serialized_shape.js";
import { ABG_CONSENSUS_GTL_MODULE } from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = resolve(HERE, "../..");

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function attrs(entries = []) {
  return { entries };
}

function surface() {
  return {
    kind: "artifact",
    requiredContexts: ["workspace"],
    standardsRefs: ["standard://example"],
    outputContractRefs: ["contract://example/output"],
    constructorRefs: ["constructor://example"],
    constructorInputAssetKinds: ["source"],
    rendererRefs: ["renderer://example"],
    renderedViewDigestPolicyRef: "policy://rendered-view-digest",
    sectionKindRefs: ["section://body"],
    clauseKindRefs: ["clause://assertion"],
    authoritySlots: [
      {
        authorityKindRef: "authority://example",
        disposition: "bounded_fallback",
        fallbackPreconditionRefs: ["precondition://fallback"]
      }
    ],
    proofObligationRefs: ["proof://example"]
  };
}

function node(name, id) {
  return {
    name,
    schema: { kind: "symbolic", ref: `schema://${name.toLowerCase()}` },
    typeRef: `type://${name.toLowerCase()}`,
    markov: ["bounded"],
    assetSurface: surface(),
    tags: ["t263"],
    id
  };
}

function context() {
  return {
    name: "source-context",
    locator: "git://example/revision",
    digest: `sha256:${"1".repeat(64)}`
  };
}

function richAttrs() {
  return attrs([
    { key: "scalar", value: { kind: "scalar", value: "value" } },
    {
      key: "strings",
      value: { kind: "string_list", value: ["one", "two"] }
    },
    {
      key: "hook",
      value: {
        kind: "hook_ref",
        value: {
          ref: "hook://example",
          config: attrs([
            { key: "enabled", value: { kind: "scalar", value: true } }
          ])
        }
      }
    },
    {
      key: "json",
      value: {
        kind: "json_blob",
        value: {
          kind: "object",
          entries: [
            {
              key: "items",
              value: { kind: "array", items: ["one", 2, false, null] }
            }
          ]
        }
      }
    }
  ]);
}

function rule(name = "example-rule") {
  return {
    name,
    kind: "policy",
    config: richAttrs(),
    tags: ["t263"]
  };
}

function graph(input, output) {
  return {
    name: "example-graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [
      {
        name: "example-vector",
        source: [input],
        target: output,
        operators: [
          {
            name: "transform",
            regime: "F_D",
            binding: "binding://transform",
            tags: ["t263"]
          }
        ],
        evaluators: [
          {
            name: "evaluate",
            regime: "F_D",
            description: "evaluate the transformation",
            binding: "binding://evaluate",
            consumedFieldRefs: ["field://result"],
            tags: ["t263"]
          }
        ],
        contexts: [context()],
        rule: rule(),
        allowsSubwork: false,
        declarations: attrs(),
        tags: ["t263"],
        id: "vector-t263-example"
      }
    ],
    contexts: [context()],
    rules: [rule("graph-rule")],
    effects: ["effect://example"],
    tags: ["t263"],
    id: "graph-t263-example"
  };
}

function graphFunction(name, id, input, output, template) {
  return {
    name,
    environment: {
      requires: [input],
      provides: [output],
      carries: [input, output]
    },
    inputs: [input],
    outputs: [output],
    template,
    effects: ["effect://example"],
    declarations: attrs(),
    tags: ["t263"],
    id
  };
}

function maximalModulePayload() {
  const input = node("Input", "node-t263-input");
  const output = node("Output", "node-t263-output");
  const inlineGraph = graph(input, output);
  const inline = graphFunction(
    "inline-example",
    "graph-function-t263-inline",
    input,
    output,
    { kind: "inline_graph", ref: "template://inline", graph: inlineGraph, version: null }
  );
  const symbolic = graphFunction(
    "symbolic-example",
    "graph-function-t263-symbolic",
    input,
    output,
    { kind: "symbolic", ref: "template://symbolic", graph: null, version: "1.0.0" }
  );
  const role = {
    name: "reviewer",
    tags: ["t263"],
    policyHooks: richAttrs(),
    id: "role-t263-reviewer"
  };
  return {
    name: "example.strict-admission",
    graphs: [inlineGraph],
    graphFunctions: [inline, symbolic],
    refinementBoundaries: [
      {
        name: "example-boundary",
        inputs: [input],
        outputs: [output],
        hints: richAttrs(),
        tags: ["t263"],
        id: "boundary-t263-example"
      }
    ],
    candidateFamilies: [
      {
        name: "example-candidates",
        inputs: [input],
        outputs: [output],
        candidates: [inline],
        policyHints: richAttrs(),
        tags: ["t263"],
        id: "family-t263-example"
      }
    ],
    jobs: [
      {
        name: "example-job",
        contracts: [{ kind: "graph_function", targetId: inline.id }],
        roles: [role],
        tags: ["t263"],
        policyHooks: richAttrs(),
        id: "job-t263-example"
      }
    ],
    roles: [role],
    operators: [inlineGraph.vectors[0].operators[0]],
    evaluators: [inlineGraph.vectors[0].evaluators[0]],
    rules: [rule("module-rule")],
    imports: [
      { source: "example.core", names: ["base"], version: "1.0.0" }
    ],
    policyHooks: richAttrs(),
    metadata: richAttrs()
  };
}

function at(value, path) {
  return path.reduce((current, segment) => current[segment], value);
}

function keys(value) {
  return Object.keys(value).sort();
}

function profile(profileValue) {
  return [...profileValue].sort();
}

function importClosure(entryPath) {
  const visited = new Set();
  const pending = [entryPath];
  const importPattern = /(?:from\s+|import\s*)["']([^"']+)["']/gu;
  while (pending.length > 0) {
    const path = pending.pop();
    if (path === undefined || visited.has(path)) continue;
    visited.add(path);
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (specifier === undefined || !specifier.startsWith(".")) continue;
      const jsCandidate = resolve(dirname(path), specifier);
      const candidates = [
        jsCandidate.replace(/\.js$/u, ".ts"),
        resolve(jsCandidate, "index.ts")
      ];
      const resolved = candidates.find((candidate) => existsSync(candidate));
      assert.ok(resolved, `unresolved source import ${specifier} from ${path}`);
      pending.push(resolved);
    }
  }
  return [...visited].sort();
}

test("T-263 canonical native, object, and text admission converge", () => {
  const admitted = admitModule(maximalModulePayload());
  const canonical = serializeModule(admitted);
  assert.deepEqual(serializeModule(admitModule(cloneJson(canonical))), canonical);
  assert.deepEqual(
    serializeModule(admitSerializedModuleText(JSON.stringify(canonical))),
    canonical
  );
});

test("T-263 text ingress rejects duplicate decoded names before object admission", () => {
  const canonical = JSON.stringify(serializeModule(admitModule(maximalModulePayload())));
  assert.throws(
    () => admitSerializedModuleText(`{"name":"shadow",${canonical.slice(1)}`),
    /duplicate object property "name"/u
  );
  assert.throws(
    () => admitSerializedModuleText(`{"\\u006eame":"shadow",${canonical.slice(1)}`),
    /duplicate object property "name"/u
  );
});

test("T-263 composed ingress retains malformed and non-I-JSON refusal", () => {
  const canonical = JSON.stringify(serializeModule(admitModule(maximalModulePayload())));
  assert.throws(
    () => admitSerializedModuleText("{"),
    /CloseBraceExpected|malformed/u
  );
  assert.throws(() => admitSerializedModuleText(`/*comment*/${canonical}`), /InvalidCommentToken/u);
  assert.throws(
    () => admitSerializedModuleText(`${canonical.slice(0, -1)},}`),
    /PropertyNameExpected|CloseBraceExpected/u
  );
  assert.throws(
    () => admitSerializedModuleText(canonical.replace("example.strict-admission", "\\ud800")),
    /lone high surrogate/u
  );

  const accessorPayload = maximalModulePayload();
  Object.defineProperty(accessorPayload, "name", { get: () => "hidden" });
  assert.throws(() => admitModule(accessorPayload), /accessors are not I-JSON members/u);

  const sparsePayload = maximalModulePayload();
  sparsePayload.graphs = Array(1);
  assert.throws(() => admitModule(sparsePayload), /sparse arrays are not I-JSON/u);
});

test("T-263 recursively refuses unknown M01 and M02 carrier fields", () => {
  const canonical = serializeModule(admitModule(maximalModulePayload()));
  const paths = [
    [],
    ["graphs", 0],
    ["graphFunctions", 0],
    ["graphFunctions", 0, "environment"],
    ["graphFunctions", 0, "inputs", 0],
    ["graphFunctions", 0, "inputs", 0, "schema"],
    ["graphFunctions", 0, "inputs", 0, "assetSurface"],
    ["graphFunctions", 0, "inputs", 0, "assetSurface", "authoritySlots", 0],
    ["graphFunctions", 0, "template"],
    ["graphFunctions", 0, "template", "graph"],
    ["graphFunctions", 0, "template", "graph", "vectors", 0],
    ["graphFunctions", 0, "template", "graph", "vectors", 0, "operators", 0],
    ["graphFunctions", 0, "template", "graph", "vectors", 0, "evaluators", 0],
    ["graphFunctions", 0, "template", "graph", "vectors", 0, "contexts", 0],
    ["graphFunctions", 0, "template", "graph", "vectors", 0, "rule"],
    ["graphFunctions", 1, "template"],
    ["refinementBoundaries", 0],
    ["candidateFamilies", 0],
    ["jobs", 0],
    ["jobs", 0, "contracts", 0],
    ["jobs", 0, "roles", 0],
    ["roles", 0],
    ["operators", 0],
    ["evaluators", 0],
    ["rules", 0],
    ["imports", 0],
    ["metadata"],
    ["metadata", "entries", 0],
    ["metadata", "entries", 0, "value"],
    ["metadata", "entries", 2, "value", "value"],
    ["metadata", "entries", 2, "value", "value", "config"],
    ["metadata", "entries", 3, "value", "value"],
    ["metadata", "entries", 3, "value", "value", "entries", 0],
    ["metadata", "entries", 3, "value", "value", "entries", 0, "value"]
  ];

  for (const path of paths) {
    const malformed = cloneJson(canonical);
    at(malformed, path).unknownT263Field = true;
    assert.throws(
      () => admitModule(malformed),
      /unknownT263Field: unknown (?:field|SerializedAttrs key)/u,
      `unknown field was not refused at ${path.join(".") || "Module"}`
    );
  }
});

test("T-263 exact-key profiles match maximal canonical serializer shapes", () => {
  const canonical = serializeModule(admitModule(maximalModulePayload()));
  const vector = canonical.graphFunctions[0].template.graph.vectors[0];
  const rich = canonical.metadata;
  const jsonObject = rich.entries[3].value.value;
  const jsonEntry = jsonObject.entries[0];
  const cases = [
    [canonical, MODULE_FIELDS],
    [canonical.graphs[0], GRAPH_FIELDS],
    [canonical.graphFunctions[0], GRAPH_FUNCTION_FIELDS],
    [canonical.graphFunctions[0].environment, ENV_REF_FIELDS],
    [canonical.graphFunctions[0].inputs[0], NODE_FIELDS],
    [canonical.graphFunctions[0].inputs[0].schema, SCHEMA_REF_FIELDS],
    [canonical.graphFunctions[0].inputs[0].assetSurface, ASSET_SURFACE_FIELDS],
    [canonical.graphFunctions[0].inputs[0].assetSurface.authoritySlots[0], ASSET_SURFACE_AUTHORITY_SLOT_FIELDS],
    [canonical.graphFunctions[0].template, INLINE_TEMPLATE_REF_FIELDS],
    [canonical.graphFunctions[1].template, SYMBOLIC_TEMPLATE_REF_FIELDS],
    [vector, GRAPH_VECTOR_FIELDS],
    [vector.operators[0], OPERATOR_FIELDS],
    [vector.evaluators[0], EVALUATOR_FIELDS],
    [vector.contexts[0], CONTEXT_FIELDS],
    [vector.rule, RULE_FIELDS],
    [rich, SERIALIZED_ATTRS_FIELDS],
    [rich.entries[0], SERIALIZED_ATTR_ENTRY_FIELDS],
    [rich.entries[0].value, SERIALIZED_ATTR_VALUE_FIELDS],
    [rich.entries[2].value.value, HOOK_REF_FIELDS],
    [jsonObject, SERIALIZED_JSON_OBJECT_FIELDS],
    [jsonEntry, SERIALIZED_JSON_OBJECT_ENTRY_FIELDS],
    [jsonEntry.value, SERIALIZED_JSON_ARRAY_FIELDS],
    [canonical.refinementBoundaries[0], REFINEMENT_BOUNDARY_FIELDS],
    [canonical.candidateFamilies[0], CANDIDATE_FAMILY_FIELDS],
    [canonical.jobs[0], JOB_FIELDS],
    [canonical.jobs[0].contracts[0], CONTRACT_REF_FIELDS],
    [canonical.jobs[0].roles[0], ROLE_FIELDS],
    [canonical.imports[0], MODULE_IMPORT_FIELDS]
  ];
  for (const [value, expectedProfile] of cases) {
    assert.deepEqual(keys(value), profile(expectedProfile));
  }
});

test("T-263 preserves optional defaults and semantic duplicate refusals", () => {
  const payload = maximalModulePayload();
  delete payload.policyHooks;
  delete payload.jobs[0].policyHooks;
  delete payload.graphFunctions[0].inputs[0].typeRef;
  const admitted = admitModule(payload);
  assert.deepEqual(admitted.policyHooks, attrs());
  assert.deepEqual(admitted.jobs[0].policyHooks, attrs());
  assert.equal(admitted.graphFunctions[0].inputs[0].typeRef, null);

  const duplicateAttrs = maximalModulePayload();
  duplicateAttrs.metadata.entries.push(cloneJson(duplicateAttrs.metadata.entries[0]));
  assert.throws(() => admitModule(duplicateAttrs), /duplicate attr key/u);

  const duplicateRole = maximalModulePayload();
  duplicateRole.roles.push(cloneJson(duplicateRole.roles[0]));
  assert.throws(() => admitModule(duplicateRole), /duplicate declaration id/u);
});

test("T-263 leaves the canonical T-252 body digest unchanged and refuses its mutation", () => {
  const canonical = serializeModule(ABG_CONSENSUS_GTL_MODULE);
  assert.equal(
    stableSha256Digest(canonical),
    "sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695"
  );
  assert.deepEqual(serializeModule(admitModule(cloneJson(canonical))), canonical);
  const malformed = cloneJson(canonical);
  malformed.unknownT252Field = "must-not-survive";
  assert.throws(
    () => admitModule(malformed),
    /Module\.unknownT252Field: unknown field/u
  );
});

test("T-263 admission source closure reaches no runtime or product effect module", () => {
  const entry = resolve(TENANT_ROOT, "code/src/gtl/m02/admission/carriers.ts");
  const closure = importClosure(entry).map((path) => path.slice(TENANT_ROOT.length + 1));
  assert.equal(closure.some((path) => path.startsWith("code/src/abg/")), false);
  assert.equal(closure.some((path) => path.startsWith("code/src/app/")), false);
  assert.equal(closure.some((path) => path.startsWith("code/src/qualification/")), false);
});

test("T-263 publishes the text ingress through the existing M02 package barrel", () => {
  assert.equal(m02Public.admitSerializedModuleText, admitSerializedModuleText);
});
