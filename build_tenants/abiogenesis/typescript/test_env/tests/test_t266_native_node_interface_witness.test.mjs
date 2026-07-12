// Validates: REQ-L-GTL3-NODE-001/-002/-013..015
// Validates: REQ-L-GTL3-INTERFACE-001..004
// Validates: REQ-L-GTL3-C-ALGEBRA-004/-006/-012..017
// Validates: REQ-L-GTL3-HOF-001/-002/-005/-006

import assert from "node:assert/strict";
import test from "node:test";

import {
  C,
  bindGraphVectorCProgram,
  cCarrier,
  cGraphFunctionRef,
  cInterfaceCarrier,
  fan_in,
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector,
  typedInterface,
  typedNode,
  typedVectorNode,
  workflow
} from "../../build/semantic/code/src/gtl/m01/algebra/index.js";
import {
  typedInterfaceNodes
} from "../../build/semantic/code/src/gtl/m01/algebra/native_node_witness.js";
import {
  constructFanInGraphFunction
} from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import {
  admitGraphFunction
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  nodeContractKey
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  constructEnvRef,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  constructModule
} from "../../build/semantic/code/src/gtl/m02/contracts/constructors.js";
import {
  admitModule
} from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  serializeModule
} from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import {
  emptyGraphFunctionDeclarations,
  emptyGraphVectorDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  graphFunctionApplicationDeclarationFromDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/graph_function_application.js";
import {
  serializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";
import {
  compileGraphFunctionApplication
} from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

function node(name, schemaRef = `schema://scenario-09/${name}`, options = {}) {
  return constructNode({
    id: options.id,
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    typeRef: options.typeRef,
    markov: ["scenario-09", "admitted"],
    assetSurface: { kind: `scenario_09_${name.toLowerCase()}` },
    tags: ["scenario-09"]
  });
}

function vectorNode(name, member) {
  return node(name, `Vector[${member.schema.ref}]`);
}

function graphFunction(name, inputs, outputs) {
  return constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: inputs,
      provides: outputs,
      carries: [...inputs, ...outputs]
    }),
    inputs,
    outputs,
    template: constructTemplateRef({
      kind: "symbolic",
      ref: `template://scenario-09/${name}`,
      graph: null,
      version: null
    }),
    effects: ["effect://scenario-09/observe"],
    declarations: emptyGraphFunctionDeclarations(),
    tags: ["scenario-09"]
  });
}

function graphVector(name, source, target) {
  return constructGraphVector({
    name,
    source,
    target,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: emptyGraphVectorDeclarations(),
    tags: ["scenario-09"]
  });
}

function ownSymbol(value, description) {
  const symbol = Object.getOwnPropertySymbols(value).find(
    (candidate) => candidate.description === description
  );
  assert.ok(symbol, `missing private symbol ${description}`);
  return symbol;
}

function cloneWith(value, replacements) {
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const [key, replacement] of replacements) {
    const descriptor = descriptors[key];
    assert.ok(descriptor, `cannot replace absent property ${String(key)}`);
    descriptors[key] = { ...descriptor, value: replacement };
  }
  return Object.freeze(Object.defineProperties({}, descriptors));
}

function mutableClone(value) {
  const clone = {};
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    assert.ok(descriptor);
    const mutableDescriptor = { ...descriptor, configurable: true };
    if ("value" in mutableDescriptor) mutableDescriptor.writable = true;
    Object.defineProperty(clone, key, mutableDescriptor);
  }
  return clone;
}

function fixture() {
  const observationNode = node("LabObservation", undefined, {
    typeRef: "type://scenario-09/LabObservation"
  });
  const normalizedNode = node("NormalizedObservation");
  const policyNode = node("LabPolicy");
  const evidenceNode = node("LabEvidence");
  const findingNode = node("LabFinding");
  const foreignNode = node("ForeignObservation");
  const observationVectorNode = vectorNode(
    "LabObservationVector",
    observationNode
  );
  const normalizedVectorNode = vectorNode(
    "NormalizedObservationVector",
    normalizedNode
  );
  const foreignVectorNode = vectorNode("ForeignObservationVector", foreignNode);

  const observation = typedNode({
    node: observationNode,
    decode: (_raw) => ({ sample: "" })
  });
  const normalized = typedNode({
    node: normalizedNode,
    decode: (_raw) => ({ normalized: "" })
  });
  const policy = typedNode({
    node: policyNode,
    decode: (_raw) => ({ policy: "" })
  });
  const evidence = typedNode({
    node: evidenceNode,
    decode: (_raw) => ({ evidence: "" })
  });
  const finding = typedNode({
    node: findingNode,
    decode: (_raw) => ({ finding: "" })
  });
  const foreign = typedNode({
    node: foreignNode,
    decode: (_raw) => ({ foreign: true })
  });
  const observationVector = typedVectorNode({
    node: observationVectorNode,
    member: observation,
    decode: (_raw) => []
  });
  const normalizedVector = typedVectorNode({
    node: normalizedVectorNode,
    member: normalized,
    decode: (_raw) => []
  });
  const foreignVector = typedVectorNode({
    node: foreignVectorNode,
    member: foreign,
    decode: (_raw) => []
  });

  return {
    observationNode,
    normalizedNode,
    policyNode,
    evidenceNode,
    findingNode,
    foreignNode,
    observationVectorNode,
    normalizedVectorNode,
    foreignVectorNode,
    observation,
    normalized,
    policy,
    evidence,
    finding,
    foreign,
    observationVector,
    normalizedVector,
    foreignVector
  };
}

test("T-266 TypedNode and TypedInterface bind full ordinary identity without serializing authority", () => {
  const value = fixture();
  const observationInterface = typedInterface(value.observation);
  const tupleInterface = typedInterface(
    value.normalizedVector,
    value.policy,
    value.evidence
  );

  assert.equal(value.observation.nodeRef, value.observationNode.id);
  assert.equal(
    value.observation.nodeContractKey,
    nodeContractKey(value.observationNode)
  );
  assert.equal(
    value.observation.nodeContractDigest,
    stableSha256Digest({
      nodeContractKey: nodeContractKey(value.observationNode)
    })
  );
  assert.equal(observationInterface.cardinality, 1);
  assert.deepEqual(observationInterface.nodes, [value.observationNode]);
  assert.equal(tupleInterface.cardinality, 3);
  assert.deepEqual(typedInterfaceNodes(observationInterface), [
    value.observation
  ]);
  assert.deepEqual(tupleInterface.orderedNodeRefs, [
    value.normalizedVectorNode.id,
    value.policyNode.id,
    value.evidenceNode.id
  ]);
  assert.equal(Object.getOwnPropertySymbols(value.observation).length, 1);
  assert.equal(Object.getOwnPropertySymbols(observationInterface).length, 1);
  assert.deepEqual(Object.keys(value.observation), [
    "kind",
    "node",
    "nodeRef",
    "nodeContractKey",
    "nodeContractDigest"
  ]);
  assert.deepEqual(Object.keys(observationInterface), [
    "kind",
    "nodes",
    "orderedNodeRefs",
    "orderedNodeContractKeys",
    "cardinality",
    "interfaceRef"
  ]);
});

test("T-266 erased constructors reject forged witnesses and wrong vector relations", () => {
  const value = fixture();
  const forged = Object.freeze({
    kind: "typed_node",
    node: value.observationNode,
    nodeRef: value.observationNode.id,
    nodeContractKey: nodeContractKey(value.observationNode),
    nodeContractDigest: stableSha256Digest({
      nodeContractKey: nodeContractKey(value.observationNode)
    })
  });

  assert.throws(
    () => typedInterface(forged),
    /constructor-owned TypedNode/u
  );
  assert.throws(() => hofContract(value.observationNode), /TypedNode/u);
  assert.throws(
    () =>
      typedVectorNode({
        node: value.foreignVectorNode,
        member: value.observation,
        decode: (_raw) => []
      }),
    /Vector member schema does not match/u
  );
  assert.throws(
    () =>
      typedVectorNode({
        node: node("NotVector"),
        member: value.observation,
        decode: (_raw) => []
      }),
    /expected exactly one canonical Vector/u
  );
  assert.throws(
    () =>
      typedVectorNode({
        node: value.observationVectorNode,
        member: value.observationVector,
        decode: (_raw) => []
      }),
    /expected a scalar TypedNode witness/u
  );
  assert.throws(
    () => typedInterface(),
    /requires at least one TypedNode/u
  );

  const corruptNode = cloneWith(value.observation, [
    ["nodeRef", "node://scenario-09/corrupt"]
  ]);
  assert.throws(
    () => typedInterface(corruptNode),
    /does not match its witness/u
  );

  const observationInterface = typedInterface(value.observation);
  assert.throws(
    () =>
      cInterfaceCarrier(
        cloneWith(observationInterface, [["nodes", Object.freeze([])]])
      ),
    /interface must remain non-empty/u
  );
  assert.throws(
    () =>
      cInterfaceCarrier(
        cloneWith(observationInterface, [
          [
            "nodes",
            Object.freeze([value.observationNode, value.policyNode])
          ]
        ])
      ),
    /typed Node tuple cardinality does not match/u
  );
  assert.throws(
    () =>
      cInterfaceCarrier(
        cloneWith(observationInterface, [
          ["orderedNodeRefs", Object.freeze([value.policyNode.id])]
        ])
      ),
    /ordered Node refs or contract keys do not match/u
  );
  assert.throws(
    () => cInterfaceCarrier(cloneWith(observationInterface, [["cardinality", 2]])),
    /cardinality or interface ref does not match/u
  );
});

test("T-266 all seven C generators preserve one private Node-backed boundary", () => {
  const value = fixture();
  const observationInterface = typedInterface(value.observation);
  const normalizedInterface = typedInterface(value.normalized);
  const findingInterface = typedInterface(value.finding);
  const observationCarrier = cInterfaceCarrier(observationInterface);
  const normalizedCarrier = cInterfaceCarrier(normalizedInterface);
  const findingCarrier = cInterfaceCarrier(findingInterface);

  const transform = C.of({
    input: observationCarrier,
    output: normalizedCarrier,
    stageRole: "transform",
    fibre: "F_P",
    armId: "arm://scenario-09/normalize",
    resultBearing: true
  });
  const evaluate = C.of({
    input: normalizedCarrier,
    output: findingCarrier,
    stageRole: "evaluate",
    fibre: "F_D",
    armId: "arm://scenario-09/evaluate",
    resultBearing: false
  });
  const consequence = C.of({
    input: findingCarrier,
    output: findingCarrier,
    stageRole: "consequence",
    fibre: "F_D",
    armId: "arm://scenario-09/project",
    resultBearing: false
  });
  const normalize = graphFunction(
    "normalize",
    [value.observationNode],
    [value.normalizedNode]
  );
  const workflowTerm = workflow.C(
    cGraphFunctionRef({
      graphFunction: normalize,
      input: observationInterface,
      output: normalizedInterface
    })
  );

  const terms = [
    {
      name: "of",
      term: transform,
      source: observationInterface,
      target: normalizedInterface
    },
    {
      name: "id",
      term: C.id(observationCarrier),
      source: observationInterface,
      target: observationInterface
    },
    {
      name: "compose",
      term: C.compose(transform, evaluate),
      source: observationInterface,
      target: findingInterface
    },
    {
      name: "edge",
      term: C.edge({ transform, evaluate, consequence }),
      source: observationInterface,
      target: findingInterface
    },
    {
      name: "workflow",
      term: workflowTerm,
      source: observationInterface,
      target: normalizedInterface
    },
    {
      name: "batch",
      term: C.batch(
        [transform, C.retry(transform, 2)],
        "batch://scenario-09/normalize"
      ),
      source: observationInterface,
      target: normalizedInterface
    },
    {
      name: "retry",
      term: C.retry(transform, 2),
      source: observationInterface,
      target: normalizedInterface
    }
  ];

  for (const entry of terms) {
    const vector = graphVector(
      `bind_${entry.name}`,
      entry.source.nodes,
      entry.target.nodes[0]
    );
    const binding = bindGraphVectorCProgram({
      graphVector: vector,
      source: entry.source,
      target: entry.target,
      program: entry.term
    });
    assert.equal(binding.kind, "node_backed_c_program_binding");
    assert.equal(binding.graphVectorRef, vector.id);
    assert.equal(Object.keys(entry.term).includes("interface"), false);
    assert.equal(Object.getOwnPropertySymbols(entry.term).length, 2);
  }

  const ordinary = C.of({
    input: cCarrier(observationInterface.interfaceRef),
    output: cCarrier(normalizedInterface.interfaceRef),
    stageRole: "transform",
    fibre: "F_P",
    armId: "arm://scenario-09/normalize",
    resultBearing: true
  });
  const ordinaryEvaluate = C.of({
    input: cCarrier(normalizedInterface.interfaceRef),
    output: cCarrier(findingInterface.interfaceRef),
    stageRole: "evaluate",
    fibre: "F_D",
    armId: "arm://scenario-09/ordinary-evaluate",
    resultBearing: false
  });
  assert.equal(JSON.stringify(transform), JSON.stringify(ordinary));
  assert.throws(
    () =>
      C.of({
        input: observationCarrier,
        output: cCarrier(normalizedInterface.interfaceRef),
        stageRole: "transform",
        fibre: "F_P",
        armId: "arm://scenario-09/mixed-carriers",
        resultBearing: true
      }),
    /cannot mix ordinary and Node-backed/u
  );
  assert.throws(
    () => C.compose(transform, ordinaryEvaluate),
    /cannot mix ordinary and Node-backed/u
  );
  assert.throws(
    () => C.batch([transform, ordinary], "batch://scenario-09/mixed"),
    /cannot mix ordinary and Node-backed/u
  );
  assert.throws(
    () =>
      bindGraphVectorCProgram({
        graphVector: graphVector(
          "ordinary_ref_fallback",
          [value.observationNode],
          value.normalizedNode
        ),
        source: observationInterface,
        target: normalizedInterface,
        program: ordinary
      }),
    /Node-backed C constructor/u
  );
  assert.throws(
    () =>
      bindGraphVectorCProgram({
        graphVector: graphVector(
          "wrong_target",
          [value.observationNode],
          value.normalizedNode
        ),
        source: observationInterface,
        target: typedInterface(value.foreign),
        program: transform
      }),
    /GraphVector Nodes do not match/u
  );
});

test("T-266 private C authorities fail closed under erased identity drift", () => {
  const value = fixture();
  const observationInterface = typedInterface(value.observation);
  const normalizedInterface = typedInterface(value.normalized);
  const findingInterface = typedInterface(value.finding);
  const observationCarrier = cInterfaceCarrier(observationInterface);
  const normalizedCarrier = cInterfaceCarrier(normalizedInterface);
  const findingCarrier = cInterfaceCarrier(findingInterface);
  const transform = C.of({
    input: observationCarrier,
    output: normalizedCarrier,
    stageRole: "transform",
    fibre: "F_P",
    armId: "arm://scenario-09/guard-transform",
    resultBearing: true
  });
  const evaluate = C.of({
    input: normalizedCarrier,
    output: findingCarrier,
    stageRole: "evaluate",
    fibre: "F_D",
    armId: "arm://scenario-09/guard-evaluate",
    resultBearing: false
  });
  const consequence = C.of({
    input: findingCarrier,
    output: findingCarrier,
    stageRole: "consequence",
    fibre: "F_D",
    armId: "arm://scenario-09/guard-consequence",
    resultBearing: false
  });
  const bindingVector = graphVector(
    "guard_binding",
    [value.observationNode],
    value.normalizedNode
  );
  const nodeAuthority = ownSymbol(transform, "gtl.c.node_backed.authority");

  const bind = (program) =>
    bindGraphVectorCProgram({
      graphVector: bindingVector,
      source: observationInterface,
      target: normalizedInterface,
      program
    });

  assert.throws(
    () =>
      bind(
        cloneWith(transform, [
          [
            nodeAuthority,
            Object.freeze({
              input: cCarrier(observationInterface.interfaceRef),
              output: normalizedCarrier
            })
          ]
        ])
      ),
    /constructor-owned TypedInterface/u
  );

  const wrongRefCarrier = cloneWith(observationCarrier, [
    ["ref", "gtl.c.interface-contract:wrong"]
  ]);
  assert.throws(
    () =>
      bind(
        cloneWith(transform, [
          [
            nodeAuthority,
            Object.freeze({
              input: wrongRefCarrier,
              output: normalizedCarrier
            })
          ]
        ])
      ),
    /ref does not match its typed interface/u
  );
  assert.throws(
    () => bind(cloneWith(transform, [["inputCarrierRef", "carrier://wrong"]])),
    /carrier refs do not match its Node witnesses/u
  );

  const ordinaryMiddle = cCarrier(normalizedInterface.interfaceRef);
  assert.throws(
    () =>
      C.compose(
        cloneWith(transform, [
          [
            nodeAuthority,
            Object.freeze({
              input: observationCarrier,
              output: ordinaryMiddle
            })
          ]
        ]),
        evaluate
      ),
    /is not a C interface carrier/u
  );

  const missingInterfaceCarrier = cloneWith(normalizedCarrier, [
    ["interface", undefined]
  ]);
  assert.throws(
    () =>
      C.compose(
        cloneWith(transform, [
          [
            nodeAuthority,
            Object.freeze({
              input: observationCarrier,
              output: missingInterfaceCarrier
            })
          ]
        ]),
        evaluate
      ),
    /has no typed interface/u
  );

  const invalidIdentityCarrier = cloneWith(normalizedCarrier, [
    [
      "interface",
      Object.freeze({
        interfaceRef: 42,
        orderedNodeRefs: Object.freeze([]),
        orderedNodeContractKeys: Object.freeze([])
      })
    ]
  ]);
  assert.throws(
    () =>
      C.compose(
        cloneWith(transform, [
          [
            nodeAuthority,
            Object.freeze({
              input: observationCarrier,
              output: invalidIdentityCarrier
            })
          ]
        ]),
        evaluate
      ),
    /invalid typed interface identity/u
  );

  assert.throws(
    () => C.retry(cloneWith(transform, [[nodeAuthority, null]]), 2),
    /invalid Node-backed authority/u
  );
  assert.throws(
    () =>
      C.retry(
        cloneWith(transform, [
          [
            nodeAuthority,
            Object.freeze({ input: null, output: normalizedCarrier })
          ]
        ]),
        2
      ),
    /invalid Node-backed interfaces/u
  );

  const proxyTarget = mutableClone(transform);
  let nodeAuthorityChecks = 0;
  const unstableAuthority = new Proxy(proxyTarget, {
    getOwnPropertyDescriptor(target, key) {
      if (key === nodeAuthority) {
        nodeAuthorityChecks += 1;
        return nodeAuthorityChecks === 1
          ? Reflect.getOwnPropertyDescriptor(target, key)
          : undefined;
      }
      return Reflect.getOwnPropertyDescriptor(target, key);
    }
  });
  assert.throws(
    () => C.retry(unstableAuthority, 2),
    /is not a Node-backed C term/u
  );

  assert.throws(
    () => workflow.C({}),
    /requires a Node-backed ref created by cGraphFunctionRef/u
  );

  const normalizedTwinNode = node(
    "NormalizedObservation",
    value.normalizedNode.schema.ref,
    {
      id: "node://scenario-09/normalized-contract-twin",
      typeRef: value.normalizedNode.typeRef
    }
  );
  assert.equal(
    nodeContractKey(normalizedTwinNode),
    nodeContractKey(value.normalizedNode)
  );
  const normalizedTwin = typedNode({
    node: normalizedTwinNode,
    decode: (_raw) => ({ normalized: "" })
  });
  const normalizedTwinInterface = typedInterface(normalizedTwin);
  const normalizedTwinCarrier = cInterfaceCarrier(normalizedTwinInterface);
  assert.equal(
    normalizedTwinInterface.interfaceRef,
    normalizedInterface.interfaceRef
  );
  const evaluateFromTwin = C.of({
    input: normalizedTwinCarrier,
    output: findingCarrier,
    stageRole: "evaluate",
    fibre: "F_D",
    armId: "arm://scenario-09/twin-evaluate",
    resultBearing: false
  });
  const transformToTwin = C.of({
    input: observationCarrier,
    output: normalizedTwinCarrier,
    stageRole: "transform",
    fibre: "F_P",
    armId: "arm://scenario-09/twin-transform",
    resultBearing: true
  });
  assert.throws(
    () => C.compose(transform, evaluateFromTwin),
    /typed middle interfaces do not match/u
  );
  assert.throws(
    () =>
      C.edge({
        transform,
        evaluate: evaluateFromTwin,
        consequence
      }),
    /adjacent typed interfaces do not match/u
  );
  assert.throws(
    () => C.batch([transform, transformToTwin], "batch://scenario-09/twin"),
    /typed interfaces do not match tasks\[0\]/u
  );

  assert.throws(
    () =>
      bindGraphVectorCProgram({
        graphVector: structuredClone(bindingVector),
        source: observationInterface,
        target: normalizedInterface,
        program: transform
      }),
    /graphVector must be constructor-admitted/u
  );
  assert.throws(
    () =>
      bindGraphVectorCProgram({
        graphVector: bindingVector,
        source: observationInterface,
        target: typedInterface(value.normalized, value.finding),
        program: transform
      }),
    /target must contain exactly one TypedNode/u
  );
  assert.throws(
    () =>
      bindGraphVectorCProgram({
        graphVector: bindingVector,
        source: observationInterface,
        target: normalizedInterface,
        program: transformToTwin
      }),
    /program interfaces do not match the GraphVector boundary/u
  );
});

test("T-266 GraphFunction and GraphVector joins compare opaque refs, full keys, order, and cardinality", () => {
  const value = fixture();
  const observationInterface = typedInterface(value.observation);
  const normalizedInterface = typedInterface(value.normalized);
  const normalize = graphFunction(
    "normalize_exact",
    [value.observationNode],
    [value.normalizedNode]
  );
  assert.equal(
    cGraphFunctionRef({
      graphFunction: normalize,
      input: observationInterface,
      output: normalizedInterface
    }).ref,
    normalize.id
  );

  assert.throws(
    () =>
      cGraphFunctionRef({
        graphFunction: normalize,
        input: typedInterface(value.foreign),
        output: normalizedInterface
      }),
    /exact ordered input and output/u
  );
  const sameContractDifferentId = node(
    "LabObservation",
    value.observationNode.schema.ref,
    {
      id: "node://scenario-09/same-contract-different-id",
      typeRef: value.observationNode.typeRef
    }
  );
  assert.equal(
    nodeContractKey(sameContractDifferentId),
    nodeContractKey(value.observationNode)
  );
  assert.throws(
    () =>
      cGraphFunctionRef({
        graphFunction: normalize,
        input: typedInterface(
          typedNode({ node: sameContractDifferentId, decode: (raw) => raw })
        ),
        output: normalizedInterface
      }),
    /exact ordered input and output/u
  );
  const changedContractSameId = node(
    "LabObservation",
    value.observationNode.schema.ref,
    {
      id: value.observationNode.id,
      typeRef: "type://scenario-09/changed-contract"
    }
  );
  assert.notEqual(
    nodeContractKey(changedContractSameId),
    nodeContractKey(value.observationNode)
  );
  assert.throws(
    () =>
      cGraphFunctionRef({
        graphFunction: normalize,
        input: typedInterface(
          typedNode({ node: changedContractSameId, decode: (raw) => raw })
        ),
        output: normalizedInterface
      }),
    /exact ordered input and output/u
  );
  const multiInput = graphFunction(
    "normalize_with_policy",
    [value.observationNode, value.policyNode],
    [value.normalizedNode]
  );
  assert.throws(
    () =>
      cGraphFunctionRef({
        graphFunction: multiInput,
        input: typedInterface(value.policy, value.observation),
        output: normalizedInterface
      }),
    /exact ordered input and output/u
  );

  const tuple = typedInterface(
    value.normalizedVector,
    value.policy,
    value.evidence
  );
  const findingInterface = typedInterface(value.finding);
  const tupleTerm = C.of({
    input: cInterfaceCarrier(tuple),
    output: cInterfaceCarrier(findingInterface),
    stageRole: "evaluate",
    fibre: "F_D",
    armId: "arm://scenario-09/multi-source",
    resultBearing: true
  });
  const tupleVector = graphVector(
    "multi_source",
    [
      value.normalizedVectorNode,
      value.policyNode,
      value.evidenceNode
    ],
    value.findingNode
  );
  assert.equal(
    bindGraphVectorCProgram({
      graphVector: tupleVector,
      source: tuple,
      target: findingInterface,
      program: tupleTerm
    }).graphVectorRef,
    tupleVector.id
  );
  assert.throws(
    () =>
      bindGraphVectorCProgram({
        graphVector: graphVector(
          "reordered_multi_source",
          [
            value.policyNode,
            value.normalizedVectorNode,
            value.evidenceNode
          ],
          value.findingNode
        ),
        source: tuple,
        target: findingInterface,
        program: tupleTerm
      }),
    /GraphVector Nodes do not match/u
  );
});

test("T-266 HOF constructors preserve witnessed scalar/vector relations and ordinary bytes", () => {
  const value = fixture();
  const observationContract = hofContract(value.observation);
  const normalizedContract = hofContract(value.normalized);
  const findingContract = hofContract(value.finding);
  const observationVector = hofVector(value.observationVector);
  const normalizedVector = hofVector(value.normalizedVector);
  const foreignVector = hofVector(value.foreignVector);
  const normalize = graphFunction(
    "normalize_hof",
    [value.observationNode],
    [value.normalizedNode]
  );
  const fanOutRef = fan_out(
    hofUnaryRef({
      graphFunction: normalize,
      input: observationContract,
      output: normalizedContract
    }),
    { over: observationVector, into: normalizedVector }
  );
  const reducer = graphFunction(
    "reduce_hof",
    [value.normalizedVectorNode],
    [value.findingNode]
  );
  const reducerRef = hofUnaryRef({
    graphFunction: reducer,
    input: normalizedVector,
    output: findingContract
  });
  const fanInFunction = fan_in(reducerRef, normalizedVector);

  assert.deepEqual(fanOutRef.graphFunction.inputs, [value.observationVectorNode]);
  assert.deepEqual(fanOutRef.graphFunction.outputs, [value.normalizedVectorNode]);
  assert.equal(
    graphFunctionApplicationDeclarationFromDeclarations(
      fanInFunction.declarations
    )?.operatorKind,
    "fan_in"
  );
  assert.throws(
    () => fan_in(reducerRef, foreignVector),
    /exact witnessed vector boundary/u
  );
  assert.throws(
    () => hofContract(value.observationVector),
    /expected a scalar TypedNode/u
  );
  assert.throws(
    () => hofVector(value.observation),
    /expected a TypedVectorNode/u
  );
  assert.throws(
    () =>
      hofUnaryRef({
        graphFunction: normalize,
        input: cloneWith(observationContract, [
          ["nodeRef", "node://scenario-09/corrupt-hof-boundary"]
        ]),
        output: normalizedContract
      }),
    /Node ref or contract key does not match its witness/u
  );

  const nativeBytes = serializeGraphFunction(fanOutRef.graphFunction);
  const admitted = admitGraphFunction(structuredClone(nativeBytes));
  assert.deepEqual(serializeGraphFunction(admitted), nativeBytes);
  assert.equal(JSON.stringify(nativeBytes).includes("typed_node"), false);
  assert.equal(JSON.stringify(nativeBytes).includes("nodeContractDigest"), false);

  const moduleValue = constructModule({
    name: "scenario_09_native_witness_module",
    graphs: [],
    graphFunctions: [fanOutRef.graphFunction, reducer, fanInFunction],
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
  const moduleBytes = serializeModule(moduleValue);
  assert.deepEqual(
    serializeModule(admitModule(structuredClone(moduleBytes))),
    moduleBytes
  );
  assert.equal(JSON.stringify(moduleBytes).includes("typed_node"), false);
  assert.equal(JSON.stringify(moduleBytes).includes("nodeContractDigest"), false);
});

test("T-266 M03 rejects a symbolic fan-in reducer boundary contradiction before the runtime gap", () => {
  const value = fixture();
  const validReducer = graphFunction(
    "valid_symbolic_reducer",
    [value.normalizedVectorNode],
    [value.findingNode]
  );
  const valid = constructFanInGraphFunction(
    validReducer,
    value.normalizedVectorNode
  );
  const validCompilation = compileGraphFunctionApplication({
    graphFunction: valid,
    graphFunctions: [valid, validReducer]
  });
  assert.equal(validCompilation.diagnostics[0]?.classification, "semantic_not_realized");

  const mismatchedReducer = graphFunction(
    "mismatched_symbolic_reducer",
    [value.foreignVectorNode],
    [value.findingNode]
  );
  const malformed = constructFanInGraphFunction(
    mismatchedReducer,
    value.normalizedVectorNode
  );
  const compiled = compileGraphFunctionApplication({
    graphFunction: malformed,
    graphFunctions: [malformed, mismatchedReducer]
  });

  assert.equal(compiled.accepted, false);
  assert.equal(compiled.diagnostics[0]?.classification, "invalid_program");
  assert.equal(
    compiled.diagnostics[0]?.diagnosticId,
    "gtl-application-result-equation-mismatch"
  );
  assert.equal(compiled.diagnostics[0]?.path, "$.operand.inputs");
});
