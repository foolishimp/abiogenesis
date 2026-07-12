// Validates: REQ-L-GTL3-HOF-001/-005/-006

import assert from "node:assert/strict";
import test from "node:test";

import {
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector
} from "../../build/semantic/code/src/gtl/m01/algebra/hof.js";
import {
  admitGraphFunction,
  admitNode
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  materializeGraphFunction,
  nodeContractKey
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  HOF_APPLICATION_CARDINALITY_LAW,
  HOF_APPLICATION_DECLARATION_KEY,
  HOF_APPLICATION_ORDERING_LAW,
  HOF_APPLICATION_SYNTAX_VERSION,
  admitHofApplicationDeclaration,
  hofApplicationDeclarationFromDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/hof_application.js";
import {
  serializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";

const HOF_FIELD_ORDER = Object.freeze([
  "syntax_version",
  "relation_ref",
  "operator_kind",
  "wrapper_graph_vector_ref",
  "child_graph_function_ref",
  "input_member_node_ref",
  "input_member_contract_key",
  "output_member_node_ref",
  "output_member_contract_key",
  "input_vector_node_ref",
  "input_vector_contract_key",
  "output_vector_node_ref",
  "output_vector_contract_key",
  "ordering_law",
  "cardinality_law"
]);

function labNode(name, schemaRef, overrides = {}) {
  return admitNode({
    id: `node-${name.toLowerCase().replaceAll("_", "-")}`,
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: ["admitted"],
    assetSurface: {
      kind: name.toLowerCase(),
      requiredContexts: ["lab"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: [],
    ...overrides
  });
}

function fixture() {
  const observation = labNode("LabObservation", "LabObservation");
  const normalized = labNode(
    "NormalizedObservation",
    "NormalizedObservation"
  );
  const observations = labNode(
    "LabObservationVector",
    "Vector[LabObservation]"
  );
  const normalizedObservations = labNode(
    "NormalizedObservationVector",
    "Vector[NormalizedObservation]"
  );
  const child = admitGraphFunction({
    id: "graph-function-lab-normalize",
    name: "normalize_lab_observation",
    environment: {
      requires: [observation],
      provides: [normalized],
      carries: [observation, normalized]
    },
    inputs: [observation],
    outputs: [normalized],
    template: {
      kind: "symbolic",
      ref: "template://lab/normalize-observation",
      version: null
    },
    effects: ["normalize_observation"],
    declarations: {
      entries: [
        {
          key: "lab.normalization_profile",
          value: { kind: "scalar", value: "default" }
        }
      ]
    },
    tags: ["lab"]
  });
  const observationContract = hofContract(observation);
  const normalizedContract = hofContract(normalized);
  const over = hofVector(observations, observationContract);
  const into = hofVector(normalizedObservations, normalizedContract);
  const childRef = hofUnaryRef(
    child,
    observationContract,
    normalizedContract
  );
  const derived = fan_out(childRef, { over, into });
  return {
    observation,
    normalized,
    observations,
    normalizedObservations,
    child,
    observationContract,
    normalizedContract,
    over,
    into,
    childRef,
    derived
  };
}

function hofEntry(rawGraphFunction) {
  return rawGraphFunction.declarations.entries.find(
    (entry) => entry.key === HOF_APPLICATION_DECLARATION_KEY
  );
}

function hofField(rawGraphFunction, key) {
  return hofEntry(rawGraphFunction).value.value.entries.find(
    (entry) => entry.key === key
  );
}

function independentlyAuthoredRawGraphFunction(native) {
  const declaration = hofApplicationDeclarationFromDeclarations(
    native.declarations
  );
  const values = {
    syntax_version: declaration.syntaxVersion,
    relation_ref: declaration.relationRef,
    operator_kind: declaration.operatorKind,
    wrapper_graph_vector_ref: declaration.wrapperGraphVectorRef,
    child_graph_function_ref: declaration.childGraphFunctionRef,
    input_member_node_ref: declaration.inputMemberNodeRef,
    input_member_contract_key: declaration.inputMemberContractKey,
    output_member_node_ref: declaration.outputMemberNodeRef,
    output_member_contract_key: declaration.outputMemberContractKey,
    input_vector_node_ref: declaration.inputVectorNodeRef,
    input_vector_contract_key: declaration.inputVectorContractKey,
    output_vector_node_ref: declaration.outputVectorNodeRef,
    output_vector_contract_key: declaration.outputVectorContractKey,
    ordering_law: declaration.orderingLaw,
    cardinality_law: declaration.cardinalityLaw
  };
  return {
    name: native.name,
    environment: structuredClone(native.environment),
    inputs: structuredClone(native.inputs),
    outputs: structuredClone(native.outputs),
    template: structuredClone(native.template),
    effects: [...native.effects],
    declarations: {
      entries: [
        {
          key: HOF_APPLICATION_DECLARATION_KEY,
          value: {
            kind: "json_blob",
            value: {
              kind: "object",
              entries: [...HOF_FIELD_ORDER]
                .reverse()
                .map((key) => ({ key, value: values[key] }))
            }
          }
        }
      ]
    },
    tags: [...native.tags]
  };
}

test("T-253 native fan_out constructs one exact typed vector wrapper", () => {
  const value = fixture();
  const graphFunction = value.derived.graphFunction;
  const graph = materializeGraphFunction(graphFunction);
  const declaration = hofApplicationDeclarationFromDeclarations(
    graphFunction.declarations
  );

  assert.deepStrictEqual(graphFunction.inputs, [value.observations]);
  assert.deepStrictEqual(graphFunction.outputs, [value.normalizedObservations]);
  assert.deepStrictEqual(graphFunction.environment.requires, [value.observations]);
  assert.deepStrictEqual(graphFunction.environment.provides, [value.normalizedObservations]);
  assert.deepStrictEqual(graphFunction.environment.carries, [
    value.observations,
    value.normalizedObservations
  ]);
  assert.deepStrictEqual(graphFunction.effects, value.child.effects);
  assert.deepStrictEqual(
    graphFunction.declarations.entries.map((entry) => entry.key),
    [HOF_APPLICATION_DECLARATION_KEY]
  );
  assert.equal(graphFunction.declarations.entries.length, 1);

  assert.equal(graph.vectors.length, 1);
  assert.deepStrictEqual(graph.contexts, []);
  assert.deepStrictEqual(graph.rules, []);
  assert.deepStrictEqual(graph.effects, value.child.effects);
  const wrapper = graph.vectors[0];
  assert.deepStrictEqual(wrapper.source, [value.observations]);
  assert.deepStrictEqual(wrapper.target, value.normalizedObservations);
  assert.deepStrictEqual(wrapper.operators, []);
  assert.deepStrictEqual(wrapper.evaluators, []);
  assert.deepStrictEqual(wrapper.contexts, []);
  assert.equal(wrapper.rule, null);
  assert.equal(wrapper.allowsSubwork, true);
  assert.deepStrictEqual(wrapper.declarations.entries, []);

  assert.equal(declaration.syntaxVersion, HOF_APPLICATION_SYNTAX_VERSION);
  assert.equal(declaration.operatorKind, "fan_out");
  assert.equal(declaration.wrapperGraphVectorRef, wrapper.id);
  assert.equal(declaration.childGraphFunctionRef, value.child.id);
  assert.equal(declaration.inputMemberNodeRef, value.observation.id);
  assert.equal(
    declaration.inputMemberContractKey,
    nodeContractKey(value.observation)
  );
  assert.equal(declaration.outputMemberNodeRef, value.normalized.id);
  assert.equal(
    declaration.outputMemberContractKey,
    nodeContractKey(value.normalized)
  );
  assert.equal(declaration.inputVectorNodeRef, value.observations.id);
  assert.equal(
    declaration.inputVectorContractKey,
    nodeContractKey(value.observations)
  );
  assert.equal(
    declaration.outputVectorNodeRef,
    value.normalizedObservations.id
  );
  assert.equal(
    declaration.outputVectorContractKey,
    nodeContractKey(value.normalizedObservations)
  );
  assert.equal(declaration.orderingLaw, HOF_APPLICATION_ORDERING_LAW);
  assert.equal(declaration.cardinalityLaw, HOF_APPLICATION_CARDINALITY_LAW);
  assert.equal(
    declaration.orderingLaw,
    "preserve_input_ordinal_when_wholly_successful"
  );
  assert.equal(
    declaration.cardinalityLaw,
    "one_slot_per_input_when_wholly_successful"
  );
  assert.match(declaration.relationRef, /^gtl:\/\/hof\/application\/[a-f0-9]{64}$/u);
  assert.deepStrictEqual(
    hofEntry(graphFunction).value.value.entries.map((entry) => entry.key),
    HOF_FIELD_ORDER
  );
  assert.equal(
    graphFunction.declarations.entries.some(
      (entry) => entry.key === "lab.normalization_profile"
    ),
    false
  );
});

test("T-253 vector witnesses require closed Vector member syntax and an exact schema join", () => {
  const member = hofContract(labNode("Sample", "Sample"));
  for (const schemaRef of [
    "VectorSample",
    "Vector[]",
    "Vector[Sample",
    "Vector[Vector[Sample]]",
    " Vector[Sample]",
    "Vector[Sample] "
  ]) {
    assert.throws(
      () => hofVector(labNode(`Rejected_${schemaRef}`, schemaRef), member),
      /expected exactly one canonical Vector\[member\] boundary/u
    );
  }
  assert.throws(
    () => hofVector(labNode("WrongVector", "Vector[Other]"), member),
    /Vector member schema does not match/u
  );
  assert.throws(
    () =>
      hofVector(
        labNode("RuntimeVector", "Vector[Sample]"),
        hofContract(
          labNode("RuntimeSample", "Sample", {
            schema: { kind: "runtime_ref", ref: "Sample" }
          })
        )
      ),
    /Vector member schema does not match/u
  );
  assert.throws(
    () =>
      hofVector(labNode("ForgedVector", "Vector[Sample]"), {
        kind: "hof_contract",
        node: member.node,
        nodeRef: member.nodeRef,
        nodeContractKey: member.nodeContractKey
      }),
    /constructor-owned HOF boundary/u
  );
});

test("T-253 raw HOF tagged objects reject unknown sibling fields", () => {
  const entry = structuredClone(
    fixture().derived.graphFunction.declarations.entries[0].value.value
  );
  const topLevelSibling = { ...entry, unowned: "not-law" };
  assert.throws(
    () => admitHofApplicationDeclaration(topLevelSibling),
    /gtl-hof-unknown-field:.*unowned/u
  );

  const nestedSibling = structuredClone(entry);
  nestedSibling.entries[0].unowned = "not-law";
  assert.throws(
    () => admitHofApplicationDeclaration(nestedSibling),
    /gtl-hof-unknown-field:.*entries\[0\]\.unowned/u
  );
});

test("T-253 native relation retains distinct node refs with equal contracts", () => {
  const memberNode = labNode("SharedMember", "SharedMember");
  const member = hofContract(memberNode);
  const overNode = labNode("SharedVector", "Vector[SharedMember]", {
    id: "node-shared-vector-over"
  });
  const intoNode = labNode("SharedVector", "Vector[SharedMember]", {
    id: "node-shared-vector-into"
  });
  const child = admitGraphFunction({
    name: "shared_member_identity",
    environment: {
      requires: [memberNode],
      provides: [memberNode],
      carries: [memberNode]
    },
    inputs: [memberNode],
    outputs: [memberNode],
    template: {
      kind: "symbolic",
      ref: "template://lab/shared-member-identity",
      version: null
    },
    effects: [],
    declarations: { entries: [] },
    tags: []
  });
  const derived = fan_out(hofUnaryRef(child, member, member), {
    over: hofVector(overNode, member),
    into: hofVector(intoNode, member)
  }).graphFunction;
  const graph = materializeGraphFunction(derived);

  assert.deepStrictEqual(
    derived.environment.carries.map((node) => node.id),
    [overNode.id, intoNode.id]
  );
  assert.deepStrictEqual(
    graph.nodes.map((node) => node.id),
    [overNode.id, intoNode.id]
  );
});

test("T-253 erased native values cannot join a child to different vector members", () => {
  const value = fixture();
  const otherOutput = hofContract(labNode("OtherOutput", "OtherOutput"));
  const wrongInto = hofVector(
    labNode("OtherOutputVector", "Vector[OtherOutput]"),
    otherOutput
  );
  assert.throws(
    () => fan_out(value.childRef, { over: value.over, into: wrongInto }),
    /child element contracts do not match/u
  );
  assert.throws(
    () => hofUnaryRef(value.child, value.normalizedContract, value.normalizedContract),
    /one exact witnessed input and output/u
  );
});

test("T-253 serialization and reordered raw admission converge on one declaration and identity", () => {
  const native = fixture().derived.graphFunction;
  const serialized = serializeGraphFunction(native);
  const roundTripped = admitGraphFunction(structuredClone(serialized));
  assert.deepStrictEqual(serializeGraphFunction(roundTripped), serialized);

  const independentlyAdmitted = admitGraphFunction(
    independentlyAuthoredRawGraphFunction(native)
  );
  assert.equal(independentlyAdmitted.id, native.id);
  assert.deepStrictEqual(
    hofEntry(independentlyAdmitted).value.value.entries.map((entry) => entry.key),
    HOF_FIELD_ORDER
  );
});

test("T-253 raw HOF admission refuses noncanonical identity and mutated relation data", () => {
  const serialized = serializeGraphFunction(fixture().derived.graphFunction);

  const staleIdentity = structuredClone(serialized);
  staleIdentity.name = `${staleIdentity.name}:changed`;
  assert.throws(
    () => admitGraphFunction(staleIdentity),
    /applied host identity must equal its canonical derived identity/u
  );

  const wrongRelation = structuredClone(serialized);
  delete wrongRelation.id;
  hofField(wrongRelation, "relation_ref").value =
    "gtl://hof/application/0000000000000000000000000000000000000000000000000000000000000000";
  assert.throws(
    () => admitGraphFunction(wrongRelation),
    /gtl-hof-contract-mismatch:.*relation_ref/u
  );

  const unknownField = structuredClone(serialized);
  delete unknownField.id;
  hofEntry(unknownField).value.value.entries.push({
    key: "undeclared_field",
    value: "not-law"
  });
  assert.throws(
    () => admitGraphFunction(unknownField),
    /gtl-hof-unknown-field/u
  );

  const missingField = structuredClone(serialized);
  delete missingField.id;
  hofEntry(missingField).value.value.entries =
    hofEntry(missingField).value.value.entries.filter(
      (entry) => entry.key !== "output_vector_contract_key"
    );
  assert.throws(
    () => admitGraphFunction(missingField),
    /gtl-hof-missing-field/u
  );

  const duplicateField = structuredClone(serialized);
  delete duplicateField.id;
  hofEntry(duplicateField).value.value.entries.push({
    ...hofField(duplicateField, "input_member_node_ref")
  });
  assert.throws(
    () => admitGraphFunction(duplicateField),
    /duplicate serialized object key/u
  );

  const wrongKind = structuredClone(serialized);
  delete wrongKind.id;
  hofField(wrongKind, "operator_kind").value = "map_by_name";
  assert.throws(
    () => admitGraphFunction(wrongKind),
    /gtl-hof-invalid-operator-kind/u
  );

  const wrongValueKind = structuredClone(serialized);
  hofEntry(wrongValueKind).value = {
    kind: "scalar",
    value: "not-a-relation"
  };
  assert.throws(
    () => admitGraphFunction(wrongValueKind),
    /must use json_blob/u
  );
});
