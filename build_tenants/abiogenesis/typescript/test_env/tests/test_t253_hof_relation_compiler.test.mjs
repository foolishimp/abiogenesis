// Validates: REQ-L-GTL3-HOF-001/-005/-006.

/* global structuredClone */

import assert from "node:assert/strict";
import { test } from "node:test";

import { graphFunctionForVector } from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import {
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector
} from "../../build/semantic/code/src/gtl/m01/algebra/hof.js";
import {
  typedNode,
  typedVectorNode
} from "../../build/semantic/code/src/gtl/m01/algebra/native_node_witness.js";
import {
  admitGraphFunction
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  constructGraphVector,
  constructNode
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  emptyGraphVectorDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  HOF_APPLICATION_DECLARATION_KEY,
  constructHofApplicationDeclaration,
  constructHofApplicationDeclarationEntry
} from "../../build/semantic/code/src/gtl/m01/contracts/hof_application.js";
import {
  nodeContractKey
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  serializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";
import {
  compileHofRelation,
  graphFunctionDeclaresHofApplication,
  graphFunctionHasHofApplicationDeclarationKey
} from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import {
  GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS,
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";

function node(name, schemaRef) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: [],
    assetSurface: { kind: name.toLowerCase() },
    tags: []
  });
}

function fixture() {
  const inputMemberNode = node("LabObservation", "LabObservation");
  const outputMemberNode = node(
    "NormalizedObservation",
    "NormalizedObservation"
  );
  const inputVectorNode = node(
    "LabObservationVector",
    "Vector[LabObservation]"
  );
  const outputVectorNode = node(
    "NormalizedObservationVector",
    "Vector[NormalizedObservation]"
  );
  const childVector = constructGraphVector({
    name: "normalize-lab-observation",
    source: [inputMemberNode],
    target: outputMemberNode,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: emptyGraphVectorDeclarations(),
    tags: []
  });
  const childGraphFunction = graphFunctionForVector(childVector, {
    name: "normalize:LabObservation->NormalizedObservation"
  });
  const inputWitness = typedNode({
    node: inputMemberNode,
    decode: (raw) => raw
  });
  const outputWitness = typedNode({
    node: outputMemberNode,
    decode: (raw) => raw
  });
  const inputMember = hofContract(inputWitness);
  const outputMember = hofContract(outputWitness);
  const child = hofUnaryRef({
    graphFunction: childGraphFunction,
    input: inputMember,
    output: outputMember
  });
  const hostGraphFunction = fan_out(child, {
    over: hofVector(
      typedVectorNode({
        node: inputVectorNode,
        member: inputWitness,
        decode: (raw) => raw
      })
    ),
    into: hofVector(
      typedVectorNode({
        node: outputVectorNode,
        member: outputWitness,
        decode: (raw) => raw
      })
    )
  }).graphFunction;
  return Object.freeze({ childGraphFunction, hostGraphFunction });
}

function compile(hostGraphFunction, graphFunctions) {
  return compileHofRelation({
    graphFunction: hostGraphFunction,
    graphFunctions
  });
}

function targetManifest(disposition) {
  return {
    kind: "gtl_program_feature_coverage_manifest",
    manifestRef: `feature-coverage://t253/${disposition}`,
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API",
    rows: [
      {
        featureKind: "graph_algebra_fan_out",
        disposition,
        ownerClassification:
          GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS.graph_algebra_fan_out,
        requirementRefs: ["REQ-L-GTL3-HOF"],
        evidenceRefs: disposition === "present" ? ["test://t253/hof"] : [],
        reasonRefs: disposition === "not_used" ? ["reason://t253/not-used"] : []
      }
    ]
  };
}

function zeroCoverage() {
  return {
    catalogGraphFunctionCount: 0,
    publishedGraphFunctionCount: 0,
    graphVectorCount: 0,
    targetCarrierContractCount: 0,
    edgeClosureContractCount: 0,
    overlayCount: 0,
    publicStartTargetCount: 0,
    promptAssetCount: 0,
    pluginContractCount: 0,
    sourceIdentitySurfaceCount: 0
  };
}

function conformanceInput(graphFunctions, disposition) {
  return {
    subjectRef: "workspace://t253/hof-relation",
    abiPackageVersion: "5.0.0-dev.0",
    expectedCoverage: zeroCoverage(),
    featureCoverageManifest: targetManifest(disposition),
    graphFunctions
  };
}

test("T-260 M03 admits the exact structural HOF relation", () => {
  const { childGraphFunction, hostGraphFunction } = fixture();
  const before = JSON.stringify(hostGraphFunction);
  const result = compile(hostGraphFunction, [childGraphFunction, hostGraphFunction]);

  assert.equal(result.observed, true);
  assert.equal(result.accepted, true);
  assert.equal(result.diagnostics.length, 0);
  assert.equal(result.relation.kind, "compiled_hof_fan_out_relation");
  assert.equal(result.relation.hostGraphFunctionRef, hostGraphFunction.id);
  assert.equal(result.relation.childGraphFunctionRef, childGraphFunction.id);
  assert.equal(JSON.stringify(hostGraphFunction), before);

  const report = typecheckGtlProgram(
    conformanceInput([childGraphFunction, hostGraphFunction], "present")
  );
  const rows = report.issues.filter(
    (row) => row.ruleRef === "abg://gtl-program/hof/semantic-not-realized"
  );
  assert.equal(rows.length, 0);
});

test("T-253 M03 resolves the child id exactly once across the compilation root", () => {
  const { childGraphFunction, hostGraphFunction } = fixture();
  const missing = compile(hostGraphFunction, [hostGraphFunction]);
  assert.equal(missing.diagnostics[0].classification, "invalid_program");
  assert.equal(missing.diagnostics[0].diagnosticId, "gtl-hof-unresolved-ref");

  const duplicateChild = {
    ...childGraphFunction,
    name: `${childGraphFunction.name}:duplicate`
  };
  const duplicate = compile(hostGraphFunction, [
    childGraphFunction,
    duplicateChild,
    hostGraphFunction
  ]);
  assert.equal(duplicate.diagnostics[0].classification, "invalid_program");
  assert.equal(duplicate.diagnostics[0].diagnosticId, "gtl-hof-unresolved-ref");
});

test("T-253 M03 closes malformed declarations and wrapper contradictions without throwing", () => {
  const { childGraphFunction, hostGraphFunction } = fixture();
  const declarationEntry = hostGraphFunction.declarations.entries[0];
  const duplicateDeclarationHost = {
    ...hostGraphFunction,
    declarations: { entries: [declarationEntry, declarationEntry] }
  };
  const duplicate = compile(duplicateDeclarationHost, [
    childGraphFunction,
    duplicateDeclarationHost
  ]);
  assert.equal(duplicate.diagnostics[0].classification, "invalid_program");
  assert.equal(duplicate.diagnostics[0].diagnosticId, "gtl-hof-duplicate-field");

  const admittedDeclaration = compile(hostGraphFunction, [
    childGraphFunction,
    hostGraphFunction
  ]).declaration;
  assert.notEqual(admittedDeclaration, null);
  const mismatchedInputVector = {
    ...hostGraphFunction.inputs[0],
    schema: { kind: "symbolic", ref: "Vector[WrongObservation]" }
  };
  const mismatchedDeclaration = constructHofApplicationDeclaration({
    wrapperGraphVectorRef: admittedDeclaration.wrapperGraphVectorRef,
    childGraphFunctionRef: admittedDeclaration.childGraphFunctionRef,
    inputMemberNodeRef: admittedDeclaration.inputMemberNodeRef,
    inputMemberContractKey: admittedDeclaration.inputMemberContractKey,
    outputMemberNodeRef: admittedDeclaration.outputMemberNodeRef,
    outputMemberContractKey: admittedDeclaration.outputMemberContractKey,
    inputVectorNodeRef: mismatchedInputVector.id,
    inputVectorContractKey: nodeContractKey(mismatchedInputVector),
    outputVectorNodeRef: admittedDeclaration.outputVectorNodeRef,
    outputVectorContractKey: admittedDeclaration.outputVectorContractKey
  });
  const outputVector = hostGraphFunction.outputs[0];
  const schemaMismatch = {
    ...hostGraphFunction,
    environment: {
      requires: [mismatchedInputVector],
      provides: [outputVector],
      carries: [mismatchedInputVector, outputVector]
    },
    inputs: [mismatchedInputVector],
    declarations: {
      entries: [constructHofApplicationDeclarationEntry(mismatchedDeclaration)]
    },
    template: {
      ...hostGraphFunction.template,
      graph: {
        ...hostGraphFunction.template.graph,
        inputs: [mismatchedInputVector],
        nodes: [mismatchedInputVector, outputVector],
        vectors: [
          {
            ...hostGraphFunction.template.graph.vectors[0],
            source: [mismatchedInputVector]
          }
        ]
      }
    }
  };
  const vectorSchema = compile(schemaMismatch, [childGraphFunction, schemaMismatch]);
  assert.equal(vectorSchema.diagnostics[0].classification, "invalid_program");
  assert.equal(vectorSchema.diagnostics[0].diagnosticId, "gtl-hof-contract-mismatch");
  assert.equal(vectorSchema.diagnostics[0].path, "$.relation.vector_schema");

  const wrapperMismatch = {
    ...hostGraphFunction,
    template: {
      ...hostGraphFunction.template,
      graph: {
        ...hostGraphFunction.template.graph,
        contexts: [
          { name: "undeclared", locator: "context://undeclared", digest: "sha256:x" }
        ]
      }
    }
  };
  const wrapper = compile(wrapperMismatch, [childGraphFunction, wrapperMismatch]);
  assert.equal(wrapper.diagnostics[0].classification, "invalid_program");
  assert.equal(wrapper.diagnostics[0].diagnosticId, "gtl-hof-wrapper-mismatch");

  const graphNodesMismatch = {
    ...hostGraphFunction,
    template: {
      ...hostGraphFunction.template,
      graph: { ...hostGraphFunction.template.graph, nodes: [] }
    }
  };
  const graphNodes = compile(graphNodesMismatch, [
    childGraphFunction,
    graphNodesMismatch
  ]);
  assert.equal(graphNodes.diagnostics[0].classification, "invalid_program");
  assert.equal(graphNodes.diagnostics[0].diagnosticId, "gtl-hof-wrapper-mismatch");

  const exactNodeMutations = [
    {
      label: "environment requires",
      mutate(candidate) {
        candidate.environment.requires[0] = {
          ...candidate.environment.requires[0],
          id: "node-alias-environment-over"
        };
      }
    },
    {
      label: "inline graph input",
      mutate(candidate) {
        candidate.template.graph.inputs[0] = {
          ...candidate.template.graph.inputs[0],
          id: "node-alias-graph-over"
        };
      }
    },
    {
      label: "inline graph node",
      mutate(candidate) {
        candidate.template.graph.nodes[0] = {
          ...candidate.template.graph.nodes[0],
          id: "node-alias-graph-node-over"
        };
      }
    },
    {
      label: "wrapper source",
      mutate(candidate) {
        candidate.template.graph.vectors[0].source[0] = {
          ...candidate.template.graph.vectors[0].source[0],
          id: "node-alias-wrapper-over"
        };
      }
    },
    {
      label: "wrapper target",
      mutate(candidate) {
        candidate.template.graph.vectors[0].target = {
          ...candidate.template.graph.vectors[0].target,
          id: "node-alias-wrapper-into"
        };
      }
    }
  ];
  for (const row of exactNodeMutations) {
    const candidate = structuredClone(hostGraphFunction);
    row.mutate(candidate);
    const aliasResult = compile(candidate, [childGraphFunction, candidate]);
    assert.equal(
      aliasResult.diagnostics[0].classification,
      "invalid_program",
      row.label
    );
    assert.equal(
      aliasResult.diagnostics[0].diagnosticId,
      "gtl-hof-wrapper-mismatch",
      row.label
    );
  }

  const rawAlias = structuredClone(serializeGraphFunction(hostGraphFunction));
  delete rawAlias.id;
  rawAlias.template.graph.vectors[0].target = {
    ...rawAlias.template.graph.vectors[0].target,
    id: "node-raw-alias-wrapper-into"
  };
  const admittedRawAlias = admitGraphFunction(rawAlias);
  const rawAliasResult = compile(admittedRawAlias, [
    childGraphFunction,
    admittedRawAlias
  ]);
  assert.equal(rawAliasResult.diagnostics[0].classification, "invalid_program");
  assert.equal(
    rawAliasResult.diagnostics[0].diagnosticId,
    "gtl-hof-wrapper-mismatch"
  );

  const plausibleRaw = {
    name: "raw-hof-relation",
    id: "raw-hof-relation",
    inputs: [],
    outputs: [],
    environment: {},
    template: {},
    effects: [],
    declarations: {
      entries: [{ key: HOF_APPLICATION_DECLARATION_KEY, value: null }]
    },
    tags: []
  };
  let rawResult;
  assert.doesNotThrow(() => {
    rawResult = compile(plausibleRaw, [plausibleRaw]);
  });
  assert.equal(graphFunctionHasHofApplicationDeclarationKey(plausibleRaw), true);
  assert.equal(graphFunctionDeclaresHofApplication(plausibleRaw), false);
  assert.equal(rawResult.observed, true);
  assert.equal(rawResult.diagnostics[0].classification, "invalid_program");
  assert.equal(rawResult.diagnostics[0].diagnosticId, "gtl-hof-contract-mismatch");
});

test("T-253 M03 feature observation is structural while the existing claim law remains active", () => {
  const { childGraphFunction, hostGraphFunction } = fixture();
  const displayOnly = {
    ...childGraphFunction,
    name: "fan_out(display-only)"
  };
  assert.equal(graphFunctionDeclaresHofApplication(displayOnly), false);
  assert.equal(compile(displayOnly, [displayOnly]).observed, false);
  const tagOnly = {
    ...childGraphFunction,
    tags: [...childGraphFunction.tags, "gtl:hof_application", "operator:fan_out"]
  };
  assert.equal(graphFunctionDeclaresHofApplication(tagOnly), false);
  assert.equal(compile(tagOnly, [tagOnly]).observed, false);

  const displayOnlyPresent = typecheckGtlProgram(
    conformanceInput([displayOnly], "present")
  );
  assert.equal(
    displayOnlyPresent.issues.some(
      (row) =>
        row.ruleRef ===
        "abg://gtl-program/feature-coverage/present-without-inventory" &&
        row.surfaceRef === "graph_algebra_fan_out"
    ),
    true
  );

  const structurallyPresentButClaimedUnused = typecheckGtlProgram(
    conformanceInput([childGraphFunction, hostGraphFunction], "not_used")
  );
  assert.equal(
    structurallyPresentButClaimedUnused.issues.some(
      (row) =>
        row.ruleRef ===
        "abg://gtl-program/feature-coverage/not-used-contradiction" &&
        row.surfaceRef === "graph_algebra_fan_out"
    ),
    true
  );
});
