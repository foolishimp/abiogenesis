// Validates: REQ-L-GTL3-GRAPHFUNCTION-011/-012
// Validates: REQ-R-ABG3-FN-COMPOSITION-003

import assert from "node:assert/strict";
import test from "node:test";

import {
  edge,
  gate,
  graphFunctionForVector,
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
  constructGraph,
  constructGraphFunction,
  constructNode,
  constructTemplateRef
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  graphFunctionDeclarations,
  graphVectorDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
} from "../../build/semantic/code/src/gtl/m01/contracts/graph_function_application.js";
import {
  compileGraphFunctionApplication
} from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import {
  constructDefaultAbgFnCompositionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";

function node(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://scenario-09/${name}` },
    markov: ["admitted"],
    assetSurface: { kind: `scenario_09_${name.toLowerCase()}` },
    tags: ["scenario-09"]
  });
}

function evaluator(name) {
  return Object.freeze({
    name,
    regime: "F_D",
    description: `${name} description`,
    binding: `binding://scenario-09/${name}`,
    consumedFieldRefs: Object.freeze([`field://scenario-09/${name}`]),
    tags: Object.freeze(["scenario-09"])
  });
}

function rule(name) {
  return Object.freeze({
    name,
    kind: "scenario_09_gate",
    config: Object.freeze({ entries: Object.freeze([]) }),
    tags: Object.freeze(["scenario-09"])
  });
}

function symbolicFunction(name, input, output, options = {}) {
  return constructGraphFunction({
    id: options.id,
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
    tags: ["scenario-09"]
  });
}

function rebuildGraphFunction(graphFunction, overrides = {}) {
  return constructGraphFunction({
    name: overrides.name ?? graphFunction.name,
    environment: overrides.environment ?? graphFunction.environment,
    inputs: overrides.inputs ?? graphFunction.inputs,
    outputs: overrides.outputs ?? graphFunction.outputs,
    template: overrides.template ?? graphFunction.template,
    effects: overrides.effects ?? graphFunction.effects,
    declarations: overrides.declarations ?? graphFunction.declarations,
    tags: overrides.tags ?? graphFunction.tags
  });
}

function fixture() {
  const input = node("LabObservation");
  const output = node("NormalizedObservation");
  const base = symbolicFunction("normalize", input, output);
  const first = recurse(base, evaluator("round_done"), {
    mode: "rebind",
    binding: "binding://scenario-09/round",
    requiresParentEvaluation: true
  });
  const outer = gate(first, rule("accepted"), [evaluator("accepted")]);
  return { input, output, base, first, outer };
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

test("T-265 compiler treats declaration omission as ordinary function truth", () => {
  const { base } = fixture();
  assert.deepEqual(
    compileGraphFunctionApplication({
      graphFunction: base,
      graphFunctions: [base]
    }),
    {
      observed: false,
      accepted: true,
      declaration: null,
      lineage: null,
      fanInRelation: null,
      recurseRelation: null,
      provisionalBindings: [],
      diagnostics: []
    }
  );
});

test("T-265 compiler refuses an ordinary cross-host composition without an application path", () => {
  const input = node("OrdinaryCrossHostInput");
  const output = node("OrdinaryCrossHostOutput");
  const declarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/ordinary-cross-host",
    hostGraphFunctionRef: "graph-function://scenario-09/unrelated"
  });
  const ordinary = symbolicFunction("ordinary_cross_host", input, output, {
    declarations: graphFunctionDeclarations(declarations.entries)
  });
  const compiled = compileGraphFunctionApplication({
    graphFunction: ordinary,
    graphFunctions: [ordinary]
  });

  assert.equal(compiled.observed, true);
  assert.equal(compiled.accepted, false);
  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-composition-owner-mismatch"
  );
  assert.equal(compiled.lineage, null);

  const vectorDeclarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/ordinary-vector-cross-host",
    hostGraphFunctionRef: "graph-function://scenario-09/unrelated-vector-owner"
  });
  const vectorOwnedOrdinary = graphFunctionForVector(
    edge([input], output, {
      name: "ordinary_vector_cross_host",
      declarations: graphVectorDeclarations(vectorDeclarations.entries)
    }).vectors[0]
  );
  const vectorCompiled = compileGraphFunctionApplication({
    graphFunction: vectorOwnedOrdinary,
    graphFunctions: [vectorOwnedOrdinary]
  });
  assert.equal(vectorCompiled.observed, true);
  assert.equal(vectorCompiled.accepted, false);
  assert.equal(
    vectorCompiled.diagnostics[0]?.diagnosticId,
    "gtl-application-composition-owner-mismatch"
  );
});

test("T-265 compiler derives same-kind and mixed lineage then stops at T-255", () => {
  const { base, first, outer } = fixture();
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, first, base]
  });

  assert.equal(compiled.accepted, false);
  assert.equal(compiled.lineage?.orderedSteps.length, 2);
  assert.deepEqual(compiled.lineage?.orderedOperandGraphFunctionRefs, [
    first.id,
    base.id
  ]);
  assert.deepEqual(compiled.lineage?.eligibleCompositionOwnerGraphFunctionRefs, [
    outer.id,
    first.id,
    base.id
  ]);
  assert.equal(compiled.lineage?.ultimateBaseGraphFunctionRef, base.id);
  assert.equal(compiled.diagnostics[0]?.classification, "semantic_not_realized");
  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-runtime-not-realized"
  );
});

test("T-265 compiler rejects missing and ambiguous operands by opaque id", () => {
  const { base, first, outer } = fixture();
  const missing = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, base]
  });
  assert.equal(missing.diagnostics[0]?.diagnosticId, "gtl-application-unresolved-operand");

  const ambiguous = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, first, first, base]
  });
  assert.equal(
    ambiguous.diagnostics[0]?.diagnosticId,
    "gtl-application-ambiguous-operand"
  );

  const labelOperand = symbolicFunction(base.name, base.inputs[0], base.outputs[0], {
    id: base.name
  });
  const labelApplied = gate(
    labelOperand,
    rule("label_substitution"),
    [evaluator("label_substitution")]
  );
  const labelSubstitution = compileGraphFunctionApplication({
    graphFunction: labelApplied,
    graphFunctions: [labelApplied, base]
  });
  assert.equal(
    labelSubstitution.diagnostics[0]?.diagnosticId,
    "gtl-application-unresolved-operand"
  );
});

test("T-260 compiler admits the canonical fan-in structural relation", () => {
  const { output } = fixture();
  const member = node("LabObservation");
  const vector = node("CompilerVector");
  const admittedVector = constructNode({
    name: vector.name,
    schema: { kind: "symbolic", ref: "Vector[schema://scenario-09/LabObservation]" },
    markov: vector.markov,
    assetSurface: vector.assetSurface,
    tags: vector.tags
  });
  const reducer = symbolicFunction(
    "reduce_lab_observations",
    admittedVector,
    output
  );
  const applied = witnessedFanIn(reducer, admittedVector, member);
  const compiled = compileGraphFunctionApplication({
    graphFunction: applied,
    graphFunctions: [applied, reducer]
  });

  assert.equal(compiled.lineage?.orderedSteps.length, 1);
  assert.equal(compiled.lineage?.orderedSteps[0]?.operatorKind, "fan_in");
  assert.equal(
    compiled.lineage?.orderedSteps[0]?.operandGraphFunctionRef,
    reducer.id
  );
  assert.equal(compiled.accepted, true);
  assert.equal(compiled.diagnostics.length, 0);
  assert.equal(compiled.fanInRelation.kind, "compiled_fan_in_application_relation");
  assert.equal(compiled.fanInRelation.reducerGraphFunctionRef, reducer.id);
  assert.equal(compiled.fanInRelation.inputVectorNodeRef, admittedVector.id);
});

test("T-265 compiler validates every result equation before handoff", () => {
  const { input, output, base, first } = fixture();
  const mutations = [
    {
      path: "$.graph_function.environment",
      value: {
        environment: constructEnvRef({
          requires: [output],
          provides: first.environment.provides,
          carries: [output, ...first.environment.provides]
        }),
        inputs: [output]
      }
    },
    {
      path: "$.graph_function.template",
      value: {
        template: constructTemplateRef({
          kind: "symbolic",
          ref: "template://scenario-09/mutated",
          graph: null,
          version: null
        })
      }
    },
    {
      path: "$.graph_function.effects",
      value: { effects: [...first.effects, "effect://scenario-09/invented"] }
    }
  ];

  for (const mutation of mutations) {
    const mutated = rebuildGraphFunction(first, mutation.value);
    const compiled = compileGraphFunctionApplication({
      graphFunction: mutated,
      graphFunctions: [mutated, base]
    });
    assert.equal(
      compiled.diagnostics[0]?.diagnosticId,
      "gtl-application-result-equation-mismatch"
    );
    assert.equal(compiled.diagnostics[0]?.path, mutation.path);
  }

  assert.throws(
    () => rebuildGraphFunction(first, { inputs: [output] }),
    /GraphFunction.inputs: must match environment.requires/u
  );
  assert.throws(
    () => rebuildGraphFunction(first, { outputs: [input] }),
    /GraphFunction.outputs: must be represented in environment.provides/u
  );

  const declaredBase = symbolicFunction("declared_base", input, output, {
    declarations: graphFunctionDeclarations([
      {
        key: "abg.hog_program_ref",
        value: { kind: "scalar", value: "hog://scenario-09/declared" }
      }
    ])
  });
  const applied = gate(declaredBase, rule("declared"), [evaluator("declared")]);
  const applicationEntry = applied.declarations.entries.find(
    (entry) => entry.key === GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
  );
  assert.ok(applicationEntry);
  const missingInheritedDeclaration = rebuildGraphFunction(applied, {
    declarations: graphFunctionDeclarations([applicationEntry])
  });
  const compiled = compileGraphFunctionApplication({
    graphFunction: missingInheritedDeclaration,
    graphFunctions: [missingInheritedDeclaration, declaredBase]
  });
  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-result-equation-mismatch"
  );
  assert.equal(compiled.diagnostics[0]?.path, "$.graph_function.declarations");
});

test("T-265 compiler keeps result-local composition provisional", () => {
  const input = node("CompositionInput");
  const output = node("CompositionOutput");
  const base = graphFunctionForVector(
    edge([input], output, { name: "composition_edge" }).vectors[0]
  );
  const localComposition = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/result-local",
    owningDeclarationRef: "declaration://scenario-09/pending-t255"
  });
  const outer = gate(base, rule("composition_gate"), [evaluator("composition")], {
    declarations: graphFunctionDeclarations(localComposition.entries)
  });
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, base]
  });

  assert.equal(compiled.provisionalBindings.length, 1);
  assert.equal(
    compiled.provisionalBindings[0]?.declarationOwnerGraphFunctionRef,
    outer.id
  );
  assert.equal(
    compiled.provisionalBindings[0]?.executionSubjectGraphFunctionRef,
    outer.id
  );
  assert.equal(compiled.provisionalBindings[0]?.status, "provisional_pending_t255");
  assert.equal(
    compiled.provisionalBindings[0]?.declaredOwningDeclarationRef,
    "declaration://scenario-09/pending-t255"
  );
  assert.deepEqual(compiled.provisionalBindings[0]?.pendingJoinRefs, [
    "REQ-R-ABG3-FN-COMP-003",
    "owning_declaration_ref"
  ]);
});

test("T-265 compiler preserves inherited composition ownership", () => {
  const input = node("InheritedInput");
  const output = node("InheritedOutput");
  const ownerRef = "graph-function://scenario-09/inherited-owner";
  const declarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/inherited",
    hostGraphFunctionRef: ownerRef
  });
  const owner = constructGraphFunction({
    id: ownerRef,
    name: "inherited_owner",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://scenario-09/inherited",
      graph: edge([input], output, { name: "inherited_edge" }),
      version: null
    }),
    effects: ["effect://scenario-09/inherited"],
    declarations: graphFunctionDeclarations(declarations.entries),
    tags: ["scenario-09"]
  });
  const outer = gate(owner, rule("inherited_gate"), [evaluator("inherited")]);
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, owner]
  });

  assert.equal(compiled.provisionalBindings.length, 1);
  assert.equal(
    compiled.provisionalBindings[0]?.declarationOwnerGraphFunctionRef,
    owner.id
  );
  assert.notEqual(
    compiled.provisionalBindings[0]?.declarationOwnerGraphFunctionRef,
    compiled.provisionalBindings[0]?.executionSubjectGraphFunctionRef
  );
});

test("T-265 compiler refuses copied GraphFunction-local ownership without an explicit operand host", () => {
  const input = node("UnboundInheritedInput");
  const output = node("UnboundInheritedOutput");
  const declarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/unbound-inherited"
  });
  const owner = constructGraphFunction({
    name: "unbound_inherited_owner",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://scenario-09/unbound-inherited",
      graph: edge([input], output, { name: "unbound_inherited_edge" }),
      version: null
    }),
    effects: ["effect://scenario-09/unbound-inherited"],
    declarations: graphFunctionDeclarations(declarations.entries),
    tags: ["scenario-09"]
  });
  const outer = gate(owner, rule("unbound_gate"), [evaluator("unbound")]);
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, owner]
  });

  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-composition-owner-mismatch"
  );
  assert.equal(compiled.provisionalBindings.length, 0);
});

test("T-265 compiler preserves inherited vector-local composition ownership", () => {
  const input = node("VectorOwnerInput");
  const output = node("VectorOwnerOutput");
  const vectorDeclarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/vector-owner"
  });
  const owner = graphFunctionForVector(
    edge([input], output, {
      name: "vector_owner_edge",
      declarations: graphVectorDeclarations(vectorDeclarations.entries)
    }).vectors[0]
  );
  const outer = gate(owner, rule("vector_owner_gate"), [evaluator("vector_owner")]);
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, owner]
  });

  assert.equal(compiled.provisionalBindings.length, 1);
  assert.equal(
    compiled.provisionalBindings.every(
      (binding) => binding.compositionSource === "graph_vector_declarations"
    ),
    true
  );
  assert.deepEqual(
    compiled.provisionalBindings.map(
      (binding) => binding.declarationOwnerGraphFunctionRef
    ),
    [owner.id]
  );
  const inherited = compiled.provisionalBindings.find(
    (binding) => binding.declarationOwnerGraphFunctionRef === owner.id
  );
  assert.ok(inherited);
  assert.notEqual(
    inherited.declarationOwnerGraphFunctionRef,
    inherited.executionSubjectGraphFunctionRef
  );
});

test("T-265 compiler refuses a composition owner outside the application lineage", () => {
  const input = node("OutsideOwnerInput");
  const output = node("OutsideOwnerOutput");
  const declarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/outside-owner",
    hostGraphFunctionRef: "graph-function://scenario-09/not-in-lineage"
  });
  const owner = constructGraphFunction({
    name: "outside_owner",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://scenario-09/outside-owner",
      graph: edge([input], output, { name: "outside_owner_edge" }),
      version: null
    }),
    effects: ["effect://scenario-09/outside-owner"],
    declarations: graphFunctionDeclarations(declarations.entries),
    tags: ["scenario-09"]
  });
  const outer = gate(owner, rule("outside_gate"), [evaluator("outside")]);
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, owner]
  });

  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-composition-owner-mismatch"
  );
  assert.equal(compiled.provisionalBindings.length, 0);
});

test("T-265 compiler refuses ambiguous vector ownership before provisional selection", () => {
  const input = node("AmbiguousVectorInput");
  const output = node("AmbiguousVectorOutput");
  const sharedRef = "graph-vector://scenario-09/duplicate";
  const plain = edge([input], output, {
    id: sharedRef,
    name: "ambiguous_plain"
  }).vectors[0];
  const composition = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: "scenario-09/ambiguous-vector"
  });
  const declared = edge([input], output, {
    id: sharedRef,
    name: "ambiguous_declared",
    declarations: graphVectorDeclarations(composition.entries)
  }).vectors[0];
  const duplicateGraph = constructGraph({
    name: "ambiguous_vector_graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [plain, declared],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["scenario-09"]
  });
  const base = constructGraphFunction({
    name: "ambiguous_vector_owner",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://scenario-09/ambiguous-vector",
      graph: duplicateGraph,
      version: null
    }),
    effects: ["effect://scenario-09/ambiguous-vector"],
    declarations: graphFunctionDeclarations([]),
    tags: ["scenario-09"]
  });
  const outer = gate(base, rule("ambiguous_vector_gate"), [
    evaluator("ambiguous_vector")
  ]);
  const compiled = compileGraphFunctionApplication({
    graphFunction: outer,
    graphFunctions: [outer, base]
  });

  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-composition-owner-mismatch"
  );
  assert.match(
    compiled.diagnostics[0]?.actualRelation ?? "",
    /duplicate GraphVector id/u
  );
  assert.equal(compiled.provisionalBindings.length, 0);
});
