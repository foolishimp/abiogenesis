// Validates: REQ-L-GTL3-GRAPHFUNCTION-004/-006/-007/-009/-011/-012
// Validates: REQ-L-GTL3-RECURSE-001..008

import assert from "node:assert/strict";
import test from "node:test";

import {
  compose,
  gate,
  recurse
} from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import {
  fan_in,
  hofContract,
  hofUnaryRef,
  hofVector
} from "../../build/semantic/code/src/gtl/m01/algebra/hof.js";
import {
  typedNode,
  typedVectorNode
} from "../../build/semantic/code/src/gtl/m01/algebra/native_node_witness.js";
import {
  constructEnvRef,
  constructGraphFunction,
  constructNode,
  constructTemplateRef
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  nodeContractKey
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  graphFunctionDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY,
  GraphFunctionApplicationAdmissionError,
  admitGraphFunctionApplicationDeclaration,
  graphFunctionApplicationDeclarationFromDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/graph_function_application.js";
import {
  admitGraphFunction
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  serializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";

function node(name, schemaRef = `schema://scenario-09/${name}`) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: ["admitted"],
    assetSurface: { kind: `scenario_09_${name.toLowerCase()}` },
    tags: ["scenario-09"]
  });
}

function graphFunction(name, input, output, options = {}) {
  return constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: `template://scenario-09/${name}`,
      graph: null,
      version: null
    }),
    effects: options.effects ?? ["effect://scenario-09/observe"],
    declarations: options.declarations ?? graphFunctionDeclarations([]),
    tags: options.tags ?? ["scenario-09"]
  });
}

function evaluator(name) {
  return Object.freeze({
    name,
    regime: "F_D",
    description: `${name} description`,
    binding: `binding://scenario-09/${name}`,
    consumedFieldRefs: Object.freeze([`field://scenario-09/${name}`]),
    tags: Object.freeze(["scenario-09", "termination"])
  });
}

function rule(name) {
  return Object.freeze({
    name,
    kind: "scenario_09_gate",
    config: Object.freeze({
      entries: Object.freeze([
        Object.freeze({
          key: "threshold",
          value: Object.freeze({ kind: "scalar", value: 1 })
        })
      ])
    }),
    tags: Object.freeze(["scenario-09"])
  });
}

function fixture() {
  const observation = node("Observation");
  const normalized = node("Normalized");
  const vector = node("NormalizedVector", "Vector[schema://scenario-09/Normalized]");
  const base = graphFunction("normalize", observation, normalized);
  const reducer = graphFunction("reduce_normalized", vector, normalized);
  return { observation, normalized, vector, base, reducer };
}

function witnessedFanIn(reducer, vector, member) {
  const memberWitness = typedNode({ node: member, decode: (raw) => raw });
  const over = hofVector(
    typedVectorNode({
      node: vector,
      member: memberWitness,
      decode: (raw) => raw
    })
  );
  const output = hofContract(
    typedNode({ node: reducer.outputs[0], decode: (raw) => raw })
  );
  return fan_in(
    hofUnaryRef({ graphFunction: reducer, input: over, output }),
    over
  );
}

function application(graphFunctionValue) {
  return graphFunctionApplicationDeclarationFromDeclarations(
    graphFunctionValue.declarations
  );
}

function rawApplication(graphFunctionValue) {
  const serialized = structuredClone(serializeGraphFunction(graphFunctionValue));
  const entry = serialized.declarations.entries.find(
    (candidate) => candidate.key === GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
  );
  assert.ok(entry);
  assert.equal(entry.value.kind, "json_blob");
  return { serialized, entry, value: entry.value.value };
}

function taggedField(value, key) {
  assert.equal(value.kind, "object");
  const field = value.entries.find((candidate) => candidate.key === key);
  assert.ok(field, `missing tagged field ${key}`);
  return field;
}

test("T-265 native applications own one complete immediate relation", () => {
  const { base, vector, normalized, reducer } = fixture();
  const termination = evaluator("complete");
  const recursive = recurse(base, termination, {
    binding: "binding://scenario-09/foldback",
    mode: "rebind",
    requiresParentEvaluation: true,
    additional: {
      entries: [{ key: "round_limit", value: { kind: "scalar", value: 2 } }]
    }
  });
  const reduced = witnessedFanIn(reducer, vector, normalized);
  const gated = gate(base, rule("accepted"), [termination]);

  const recurseApplication = application(recursive);
  assert.equal(recurseApplication?.operatorKind, "recurse");
  assert.equal(recurseApplication?.operandGraphFunctionRef, base.id);
  assert.equal(recurseApplication?.terminationEvaluator.consumedFieldRefs[0], "field://scenario-09/complete");
  assert.equal(recurseApplication?.foldback.additional.entries[0]?.key, "round_limit");

  const fanInApplication = application(reduced);
  assert.equal(fanInApplication?.operatorKind, "fan_in");
  assert.equal(fanInApplication?.operandGraphFunctionRef, reducer.id);
  assert.equal(fanInApplication?.overVectorNodeRef, vector.id);
  assert.equal(fanInApplication?.overVectorContractKey, nodeContractKey(vector));

  const gateApplication = application(gated);
  assert.equal(gateApplication?.operatorKind, "gate");
  assert.equal(gateApplication?.operandGraphFunctionRef, base.id);
  assert.notEqual(gateApplication?.operandGraphFunctionRef, base.name);
  assert.equal(gateApplication?.rule.config.entries[0]?.key, "threshold");
  assert.deepEqual(gateApplication?.evaluators[0]?.tags, ["scenario-09", "termination"]);

  for (const applied of [recursive, gated]) {
    assert.deepEqual(applied.environment, base.environment);
    assert.deepEqual(applied.inputs, base.inputs);
    assert.deepEqual(applied.outputs, base.outputs);
    assert.deepEqual(applied.template, base.template);
  }
  assert.deepEqual(reduced.environment.requires, [vector]);
  assert.deepEqual(reduced.environment.provides, reducer.environment.provides);
  assert.deepEqual(reduced.environment.carries, [
    vector,
    ...reducer.environment.provides
  ]);
  assert.deepEqual(reduced.inputs, [vector]);
  assert.deepEqual(reduced.outputs, reducer.outputs);
  assert.deepEqual(reduced.template, reducer.template);

  for (const applied of [recursive, gated]) {
    assert.deepEqual(applied.effects, base.effects);
  }
  assert.deepEqual(reduced.effects, reducer.effects);
  for (const applied of [recursive, reduced, gated]) {
    assert.equal(
      applied.declarations.entries.filter(
        (entry) => entry.key === GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
      ).length,
      1
    );
    assert.equal(applied.declarations.entries.some((entry) => entry.key === "recursion"), false);
    assert.equal(applied.declarations.entries.some((entry) => entry.key === "gate"), false);
  }
});

test("T-265 nested applications retain each layer on its own root object", () => {
  const { base, normalized } = fixture();
  const first = recurse(base, evaluator("first"), {
    binding: "binding://scenario-09/first",
    mode: "rebind",
    requiresParentEvaluation: true
  });
  const second = recurse(first, evaluator("second"), {
    binding: "binding://scenario-09/second",
    mode: "rebind",
    requiresParentEvaluation: true
  });
  const mixed = gate(second, rule("mixed"), [evaluator("mixed")]);
  const firstGate = gate(base, rule("first_gate"), [evaluator("first_gate")]);
  const secondGate = gate(firstGate, rule("second_gate"), [evaluator("second_gate")]);

  assert.equal(application(first)?.operandGraphFunctionRef, base.id);
  assert.equal(application(second)?.operandGraphFunctionRef, first.id);
  assert.equal(application(mixed)?.operandGraphFunctionRef, second.id);
  assert.notEqual(application(first)?.applicationRef, application(second)?.applicationRef);
  assert.equal(application(firstGate)?.operandGraphFunctionRef, base.id);
  assert.equal(application(secondGate)?.operandGraphFunctionRef, firstGate.id);
  assert.notEqual(
    application(firstGate)?.applicationRef,
    application(secondGate)?.applicationRef
  );

  const finalNode = node("Final");
  const composed = compose(
    mixed,
    graphFunction("finalize", normalized, finalNode)
  );
  assert.equal(application(composed), null);
});

test("T-265 result-local declarations cannot author a second application", () => {
  const { base } = fixture();
  const earlier = recurse(base, evaluator("earlier"), {
    binding: "binding://scenario-09/earlier",
    mode: "rebind",
    requiresParentEvaluation: true
  });

  assert.throws(
    () =>
      gate(base, rule("duplicate"), [evaluator("duplicate")], {
        declarations: earlier.declarations
      }),
    /result-local declarations cannot author graph-function application authority/u
  );
});

test("T-265 native canonical data ignores object insertion order", () => {
  const { base } = fixture();
  const reorderedEvaluator = Object.freeze({
    tags: Object.freeze(["scenario-09"]),
    consumedFieldRefs: Object.freeze(["field://scenario-09/reordered"]),
    binding: "binding://scenario-09/reordered",
    description: "reordered evaluator",
    regime: "F_D",
    name: "reordered"
  });
  const reorderedRule = Object.freeze({
    tags: Object.freeze(["scenario-09"]),
    config: Object.freeze({
      entries: Object.freeze([
        Object.freeze({
          value: Object.freeze({ value: 1, kind: "scalar" }),
          key: "threshold"
        })
      ])
    }),
    kind: "scenario_09_gate",
    name: "reordered"
  });

  const applied = gate(base, reorderedRule, [reorderedEvaluator]);
  assert.equal(application(applied)?.operatorKind, "gate");
});

test("T-265 fan-in refuses a blank Vector member", () => {
  const { normalized } = fixture();
  const blankVector = node("BlankVector", "Vector[ ]");
  const blankReducer = graphFunction(
    "blank_vector_reducer",
    blankVector,
    normalized
  );
  assert.throws(
    () => witnessedFanIn(blankReducer, blankVector, normalized),
    /expected exactly one canonical Vector\[member\] boundary/u
  );
});

test("T-265 all serialized application variants round-trip with canonical host identity", () => {
  const { base, vector, normalized, reducer } = fixture();
  const appliedValues = [
    recurse(base, evaluator("roundtrip_recurse"), {
      binding: "binding://scenario-09/roundtrip-recurse",
      mode: "rebind",
      requiresParentEvaluation: true
    }),
    witnessedFanIn(reducer, vector, normalized),
    gate(base, rule("roundtrip_gate"), [evaluator("roundtrip_gate")])
  ];

  for (const applied of appliedValues) {
    const raw = structuredClone(serializeGraphFunction(applied));
    const admitted = admitGraphFunction(raw);
    assert.equal(admitted.id, applied.id);
    assert.deepEqual(application(admitted), application(applied));
  }
});

test("T-265 raw application admission rejects field, identity, and legacy drift", () => {
  const { base } = fixture();
  const applied = gate(base, rule("negative"), [evaluator("negative")]);

  const reordered = rawApplication(applied);
  [reordered.value.entries[0], reordered.value.entries[1]] = [
    reordered.value.entries[1],
    reordered.value.entries[0]
  ];
  assert.throws(
    () => admitGraphFunctionApplicationDeclaration(reordered.value),
    (error) =>
      error instanceof GraphFunctionApplicationAdmissionError &&
      error.diagnosticId === "gtl-application-contract-mismatch"
  );

  const unknown = rawApplication(applied);
  unknown.value.entries.push({ key: "host_graph_function_ref", value: base.id });
  assert.throws(
    () => admitGraphFunction(unknown.serialized),
    /gtl-application-unknown-field/u
  );

  const staleRef = rawApplication(applied);
  staleRef.value.entries.find((field) => field.key === "application_ref").value =
    "gtl://graph-function/application/stale";
  assert.throws(() => admitGraphFunction(staleRef.serialized), /application_ref/u);

  const missing = rawApplication(applied);
  missing.value.entries = missing.value.entries.filter(
    (field) => field.key !== "operator_kind"
  );
  assert.throws(
    () => admitGraphFunction(missing.serialized),
    /gtl-application-missing-field/u
  );

  const duplicate = rawApplication(applied);
  duplicate.value.entries.push(structuredClone(taggedField(duplicate.value, "rule")));
  assert.throws(
    () => admitGraphFunctionApplicationDeclaration(duplicate.value),
    (error) =>
      error instanceof GraphFunctionApplicationAdmissionError &&
      error.diagnosticId === "gtl-application-duplicate-authority"
  );
  assert.throws(
    () => admitGraphFunction(duplicate.serialized),
    /duplicate serialized object key|gtl-application-duplicate-authority/u
  );

  const mixed = rawApplication(applied);
  mixed.value.entries.push({ key: "foldback", value: null });
  assert.throws(
    () => admitGraphFunction(mixed.serialized),
    /gtl-application-unknown-field/u
  );

  const emptyOperand = rawApplication(applied);
  taggedField(emptyOperand.value, "operand_graph_function_ref").value = "";
  assert.throws(
    () => admitGraphFunction(emptyOperand.serialized),
    /canonical non-empty string/u
  );

  const staleHost = structuredClone(serializeGraphFunction(applied));
  staleHost.id = "graph-function://scenario-09/stale";
  assert.throws(
    () => admitGraphFunction(staleHost),
    (error) =>
      error instanceof GraphFunctionApplicationAdmissionError &&
      error.diagnosticId === "gtl-application-result-identity-mismatch"
  );

  const legacy = structuredClone(serializeGraphFunction(base));
  legacy.declarations.entries.push({
    key: "gate",
    value: { kind: "json_blob", value: { kind: "object", entries: [] } }
  });
  assert.throws(() => admitGraphFunction(legacy), /duplicate-authority|legacy/u);
});

test("T-265 altered operator-specific values cannot retain application identity", () => {
  const { base, vector, normalized, reducer } = fixture();
  const recursive = rawApplication(
    recurse(base, evaluator("altered_recurse"), {
      binding: "binding://scenario-09/altered-recurse",
      mode: "rebind",
      requiresParentEvaluation: true
    })
  );
  taggedField(taggedField(recursive.value, "foldback").value, "binding").value =
    "binding://scenario-09/forged";

  const reduced = rawApplication(
    witnessedFanIn(reducer, vector, normalized)
  );
  taggedField(reduced.value, "over_vector_contract_key").value =
    "node-contract://scenario-09/forged";

  const gatedRule = rawApplication(
    gate(base, rule("altered_rule"), [evaluator("altered_rule")])
  );
  taggedField(taggedField(gatedRule.value, "rule").value, "name").value =
    "forged_rule";

  const gatedEvaluator = rawApplication(
    gate(base, rule("altered_evaluator"), [evaluator("altered_evaluator")])
  );
  const evaluatorArray = taggedField(gatedEvaluator.value, "evaluators").value;
  assert.equal(evaluatorArray.kind, "array");
  taggedField(evaluatorArray.items[0], "name").value = "forged_evaluator";

  for (const altered of [recursive, reduced, gatedRule, gatedEvaluator]) {
    assert.throws(
      () => admitGraphFunction(altered.serialized),
      /application_ref/u
    );
  }
});

test("T-265 display lookalikes remain ordinary GraphFunctions", () => {
  const { observation, normalized } = fixture();
  const lookalike = graphFunction("recurse(fake)", observation, normalized, {
    tags: ["operator:gate", "operator:fan_in"]
  });
  assert.equal(application(lookalike), null);
});
