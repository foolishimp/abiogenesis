import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import * as abg from "../../build/code/src/abg/m03.js";
import * as gtl from "../../build/code/src/gtl/m01.js";
import * as publicApi from "../../build/code/src/public/index.js";
import {
  FP_HELLO_IDS,
  GRAPH_EDGE_HELLO_IDS,
  HELLO_WORLD_IDS,
  RECURSION_HELLO_IDS,
  WORKFLOW_HELLO_IDS,
  constructHelloWorldModulePublication,
} from "../../build/code/src/gtl/index.js";

const ARTIFACT_DIGEST = `sha256:${"2".repeat(64)}`;
const CONTENT_DIGEST = `sha256:${"3".repeat(64)}`;
const MANIFEST_DIGEST = `sha256:${"4".repeat(64)}`;

const PRODUCT = "specification/PRODUCT.md";
const DESIGN =
  "build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md";
const CONSTITUTION =
  "build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md";
const REQUIREMENTS = "specification/requirements/gtl";

const EXPECTED_DIAGNOSTIC_AUTHORITY_REFS = Object.freeze({
  "abg://gtl-program/input/object": {
    axiomRef: `${PRODUCT}#validation-contract`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-013`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#9-lawful-technology-stack`,
  },
  "abg://gtl-program/input/module": {
    axiomRef: `${PRODUCT}#validation-contract`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-013`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#9-lawful-technology-stack`,
  },
  "abg://gtl-program/input/graph-function": {
    axiomRef: `${PRODUCT}#graphfunction`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-001`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/input/string-field": {
    axiomRef: `${PRODUCT}#validation-contract`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-013`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#9-lawful-technology-stack`,
  },
  "abg://gtl-program/declaration/duplicate-key": {
    axiomRef: `${PRODUCT}#validation-contract`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-LAWS.md#REQ-L-GTL3-LAWS-014`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#121-one-truth`,
  },
  "abg://gtl-program/execution-declaration/invalid": {
    axiomRef: `${PRODUCT}#compute-and-authority`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-010`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph-function/inputs-equal-environment-requires": {
    axiomRef: `${PRODUCT}#graphfunction`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-017`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph-function/materializable-template": {
    axiomRef: `${PRODUCT}#graphfunction`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-INTERFACE.md#REQ-L-GTL3-INTERFACE-006`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph-function/outputs-provided": {
    axiomRef: `${PRODUCT}#graphfunction`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-017`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph-function/unique-publication": {
    axiomRef: `${PRODUCT}#graphfunction`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-LAWS.md#REQ-L-GTL3-LAWS-014`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#121-one-truth`,
  },
  "abg://gtl-program/graph-function-application/invalid-program": {
    axiomRef: `${PRODUCT}#graph-algebra`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-GRAPHFUNCTION.md#REQ-L-GTL3-GRAPHFUNCTION-007`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph/input-node-declared": {
    axiomRef: `${PRODUCT}#graph-algebra`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-GRAPH.md#REQ-L-GTL3-GRAPH-004`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph/node-reachable-or-bound": {
    axiomRef: `${PRODUCT}#graph-algebra`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/graph/output-derivable": {
    axiomRef: `${PRODUCT}#compute-algebra`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/c-algebra/invalid-program": {
    axiomRef: `${PRODUCT}#compute-algebra`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/c-algebra/enclosing-carrier-mismatch": {
    axiomRef: `${PRODUCT}#compute-algebra`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-010`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/c-algebra/unresolved-graph-function": {
    axiomRef: `${PRODUCT}#validation-contract`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-C-ALGEBRA.md#REQ-L-GTL3-C-ALGEBRA-014`,
    designRef: `${DESIGN}#51-atomic-function-families`,
    localConstitutionRef: `${CONSTITUTION}#4-programming-model`,
  },
  "abg://gtl-program/module/no-untracked-graph-function": {
    axiomRef: `${PRODUCT}#module-catalog-and-implementation`,
    requirementRef:
      `${REQUIREMENTS}/REQ-L-GTL3-MODULE.md#REQ-L-GTL3-MODULE-001`,
    designRef: `${DESIGN}#41-entities-and-relationships`,
    localConstitutionRef: `${CONSTITUTION}#121-one-truth`,
  },
});

function publication() {
  return constructHelloWorldModulePublication({
    productId: "product://abiogenesis/a5-f02-proof@5",
    artifactDigest: ARTIFACT_DIGEST,
    productContentDigest: CONTENT_DIGEST,
    productManifestDigest: MANIFEST_DIGEST,
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  });
}

function input(module, programRef = HELLO_WORLD_IDS.programRef) {
  return {
    kind: "gtl_program_conformance_input",
    schemaVersion: "5.0.0",
    subjectRef: `subject://a5-f02/${encodeURIComponent(programRef)}`,
    programRef,
    module,
  };
}

function typecheck(module, programRef = HELLO_WORLD_IDS.programRef) {
  return abg.typecheckGtlProgram(input(module, programRef));
}

function graphFunctionFor(module, id = HELLO_WORLD_IDS.graphFunctionRef) {
  const graphFunction = module.graphFunctions.find((candidate) => candidate.id === id);
  assert.notEqual(graphFunction, undefined);
  return graphFunction;
}

function leafTerms(term, rows = []) {
  if (term.kind === "c_of") rows.push(term);
  if (term.kind === "c_compose") term.terms.forEach((child) => leafTerms(child, rows));
  if (term.kind === "c_edge") {
    leafTerms(term.transform, rows);
    leafTerms(term.evaluate, rows);
    leafTerms(term.consequence, rows);
  }
  if (term.kind === "c_batch") term.tasks.forEach((child) => leafTerms(child, rows));
  if (term.kind === "c_retry") leafTerms(term.term, rows);
  return rows;
}

function leafFor(module, graphFunctionRef, fibre) {
  const rows = graphFunctionFor(module, graphFunctionRef).template.nodes
    .flatMap((node) => leafTerms(node.term))
    .filter((leaf) => leaf.fibre === fibre);
  assert.equal(rows.length, 1, `${graphFunctionRef}/${fibre}`);
  return rows[0];
}

function fhPublication() {
  const module = structuredClone(publication());
  const leaf = leafFor(module, HELLO_WORLD_IDS.graphFunctionRef, "F_D");
  graphFunctionFor(module).template.nodes[0].term = gtl.C.of({
    input: gtl.cCarrier(leaf.inputCarrierRef),
    output: gtl.cCarrier(leaf.outputCarrierRef),
    programLocusRef: leaf.programLocusRef,
    stageRole: leaf.stageRole,
    fibre: "F_H",
    armId: leaf.armId,
    compositionRef: leaf.compositionRef,
    vectorIndex: leaf.vectorIndex,
    judgmentPredicateRef: leaf.judgmentPredicateRef,
    resultBearing: leaf.resultBearing,
    requirement: {
      kind: "interaction_leaf_requirement",
      interactionKind: "a5_f02_carrier_relation_proof",
      actorCapabilityRef: "capability://abiogenesis/a5-f02/human@5",
      requestContractRef: leaf.inputCarrierRef,
      responseContractRef: HELLO_WORLD_IDS.judgmentContractRef,
      continuationContractRef: HELLO_WORLD_IDS.transitionContractRef,
    },
  });
  return module;
}

function diagnosticIds(report) {
  return [...new Set(report.issues.map((entry) => entry.diagnosticId))].sort();
}

test("direct conformance admission is exact for native and text input", () => {
  const candidate = input(publication());
  const native = abg.admitGtlProgramConformanceInput(candidate);
  const text = abg.admitGtlProgramConformanceInput(JSON.stringify(candidate));
  assert.equal(native.accepted, true);
  assert.equal(text.accepted, true);
  assert.equal(native.inputDigest, text.inputDigest);
  assert.deepEqual(native.input, text.input);

  const widened = structuredClone(candidate);
  widened.compilerOptions = {};
  const refusal = abg.admitGtlProgramConformanceInput(widened);
  assert.equal(refusal.accepted, false);
  assert.deepEqual(diagnosticIds({ issues: refusal.issues }), [
    "abg://gtl-program/input/object",
  ]);
});

test("semantic-set permutations preserve one Program conformance identity", () => {
  const canonicalModule = structuredClone(publication());
  const permuted = structuredClone(canonicalModule);
  for (const key of [
    "contracts",
    "evaluators",
    "rules",
    "implementationBindings",
    "closureContracts",
    "programs",
    "graphFunctions",
    "contributions",
  ]) {
    permuted[key].reverse();
  }
  for (const program of permuted.programs) {
    program.starts.reverse();
    program.callableMembership.reverse();
    program.publicAssetTargets?.reverse();
    program.actionCatalog?.rows.reverse();
  }
  for (const graphFunction of permuted.graphFunctions) {
    graphFunction.environment.requires.reverse();
    graphFunction.environment.provides.reverse();
    graphFunction.environment.carries.reverse();
    graphFunction.effects.reverse();
    graphFunction.tags.reverse();
    graphFunction.template.terminalNodeRefs.reverse();
    graphFunction.template.nodes.reverse();
    graphFunction.template.edges.reverse();
    graphFunction.template.applications.reverse();
  }

  const left = typecheck(canonicalModule);
  const right = typecheck(permuted);
  assert.equal(left.passed, true, JSON.stringify(left));
  assert.equal(right.passed, true, JSON.stringify(right));
  assert.equal(left.inputDigest, right.inputDigest);
  assert.equal(left.programDigest, right.programDigest);
  assert.equal(left.programValidationRef, right.programValidationRef);
  assert.equal(left.reportRef, right.reportRef);
});

test("same GraphFunction id on different carriers is refused", () => {
  const module = structuredClone(publication());
  const graphFunction = structuredClone(graphFunctionFor(module));
  graphFunction.name = "A different human-readable label";
  module.graphFunctions.push(graphFunction);
  const report = typecheck(module);
  assert.equal(report.passed, false);
  assert.equal(
    diagnosticIds(report).includes(
      "abg://gtl-program/graph-function/unique-publication",
    ),
    true,
    JSON.stringify(report),
  );
});

test("every top-level publication identity refuses duplicates and collisions", () => {
  const families = [
    {
      name: "Contract",
      diagnosticId: "abg://gtl-program/graph-function/unique-publication",
      values: "contracts",
      mutate(carrier) {
        carrier.valueKind = `${carrier.valueKind}_collision`;
      },
    },
    {
      name: "Program",
      diagnosticId: "abg://gtl-program/graph-function/unique-publication",
      values: "programs",
      mutate(carrier) {
        carrier.policies["test.identity_collision"] = "different-carrier";
      },
    },
    {
      name: "ImplementationBinding",
      diagnosticId: "abg://gtl-program/graph-function/unique-publication",
      values: "implementationBindings",
      mutate(carrier) {
        carrier.namedSymbol = `${carrier.namedSymbol}Collision`;
      },
    },
    {
      name: "ClosureContract",
      diagnosticId: "abg://gtl-program/graph-function/unique-publication",
      values: "closureContracts",
      mutate(carrier) {
        carrier.predicateRef = `${carrier.predicateRef}/collision`;
      },
    },
  ];

  for (const family of families) {
    const duplicateModule = structuredClone(publication());
    duplicateModule[family.values].push(
      structuredClone(duplicateModule[family.values][0]),
    );
    const duplicateReport = typecheck(duplicateModule);
    assert.equal(duplicateReport.passed, false, family.name);
    assert.equal(
      diagnosticIds(duplicateReport).includes(
        "abg://gtl-program/declaration/duplicate-key",
      ),
      true,
      `${family.name}: ${JSON.stringify(duplicateReport)}`,
    );

    const collisionModule = structuredClone(publication());
    const collision = structuredClone(collisionModule[family.values][0]);
    family.mutate(collision);
    collisionModule[family.values].push(collision);
    const collisionReport = typecheck(collisionModule);
    assert.equal(collisionReport.passed, false, family.name);
    assert.equal(
      diagnosticIds(collisionReport).includes(family.diagnosticId),
      true,
      `${family.name}: ${JSON.stringify(collisionReport)}`,
    );
  }
});

test("Program collision refuses before Map-last and find-first can select rivals", () => {
  const module = structuredClone(publication());
  const first = structuredClone(
    module.programs.find(
      (candidate) => candidate.programRef === HELLO_WORLD_IDS.programRef,
    ),
  );
  assert.notEqual(first, undefined);
  const last = structuredClone(first);
  last.policies["test.identity_collision"] = "map-last-carrier";
  module.programs = module.programs.filter(
    (candidate) => candidate.programRef !== HELLO_WORLD_IDS.programRef,
  );
  module.programs.push(first, last);

  const findFirst = module.programs.find(
    (candidate) => candidate.programRef === HELLO_WORLD_IDS.programRef,
  );
  const mapLast = new Map(
    module.programs.map((candidate) => [candidate.programRef, candidate]),
  ).get(HELLO_WORLD_IDS.programRef);
  assert.notDeepEqual(findFirst, mapLast);

  const report = typecheck(module);
  assert.equal(report.passed, false);
  assert.equal(
    diagnosticIds(report).includes(
      "abg://gtl-program/graph-function/unique-publication",
    ),
    true,
    JSON.stringify(report),
  );
});

test("whole-Program topology refuses each finite structural falsifier", () => {
  const mutations = [
    {
      name: "duplicate node",
      diagnosticId: "abg://gtl-program/declaration/duplicate-key",
      mutate(graphFunction) {
        graphFunction.template.nodes.push(
          structuredClone(graphFunction.template.nodes[0]),
        );
      },
    },
    {
      name: "undeclared start",
      diagnosticId: "abg://gtl-program/graph/node-reachable-or-bound",
      mutate(graphFunction) {
        graphFunction.template.startNodeRef = "node://a5-f02/absent-start";
      },
    },
    {
      name: "empty terminal set",
      diagnosticId: "abg://gtl-program/graph/node-reachable-or-bound",
      mutate(graphFunction) {
        graphFunction.template.terminalNodeRefs = [];
      },
    },
    {
      name: "terminal with outgoing edge",
      diagnosticId: "abg://gtl-program/graph/node-reachable-or-bound",
      mutate(graphFunction) {
        const nodeRef = graphFunction.template.nodes[0].nodeRef;
        graphFunction.template.edges.push(gtl.graphEdge({
          fromNodeRef: nodeRef,
          toNodeRef: nodeRef,
        }));
      },
    },
    {
      name: "undeclared endpoint",
      diagnosticId: "abg://gtl-program/graph/node-reachable-or-bound",
      mutate(graphFunction) {
        graphFunction.template.edges.push(gtl.graphEdge({
          fromNodeRef: graphFunction.template.nodes[0].nodeRef,
          toNodeRef: "node://a5-f02/absent-target",
        }));
      },
    },
    {
      name: "unreachable declared terminal",
      diagnosticId: "abg://gtl-program/graph/node-reachable-or-bound",
      mutate(graphFunction) {
        const unreachable = structuredClone(graphFunction.template.nodes[0]);
        unreachable.nodeRef = "node://a5-f02/unreachable-terminal";
        unreachable.term.programLocusRef = "locus://a5-f02/unreachable-terminal";
        graphFunction.template.nodes.push(unreachable);
        graphFunction.template.terminalNodeRefs.push(unreachable.nodeRef);
      },
    },
    {
      name: "standalone terminal identity",
      diagnosticId: "abg://gtl-program/graph/node-reachable-or-bound",
      mutate(graphFunction) {
        const terminal = graphFunction.template.nodes[0];
        terminal.term = {
          kind: "c_identity",
          inputCarrierRef: terminal.term.inputCarrierRef,
          outputCarrierRef: terminal.term.inputCarrierRef,
        };
      },
    },
  ];

  for (const { name, diagnosticId, mutate } of mutations) {
    const module = structuredClone(publication());
    mutate(graphFunctionFor(module));
    const report = typecheck(module);
    assert.equal(report.passed, false, `${name}: ${JSON.stringify(report)}`);
    assert.equal(
      diagnosticIds(report).includes(diagnosticId),
      true,
      `${name}: ${JSON.stringify(report)}`,
    );
  }
});

test("environment and outer template wires are exact before effects", () => {
  const mutations = [
    {
      name: "inputs differ from environment requires",
      diagnosticId:
        "abg://gtl-program/graph-function/inputs-equal-environment-requires",
      message: /inputs must exactly equal environment requires/u,
      mutate(graphFunction) {
        graphFunction.environment.requires = [graphFunction.outputs[0]];
      },
    },
    {
      name: "duplicate environment requires",
      diagnosticId: "abg://gtl-program/declaration/duplicate-key",
      message: /environment requires contains duplicate/u,
      mutate(graphFunction) {
        graphFunction.environment.requires.push(graphFunction.inputs[0]);
      },
    },
    {
      name: "output absent from provides",
      diagnosticId: "abg://gtl-program/graph-function/outputs-provided",
      message: /outputs must be present in environment provides/u,
      mutate(graphFunction) {
        graphFunction.environment.provides = [];
      },
    },
    {
      name: "required binding absent from carries",
      diagnosticId: "abg://gtl-program/graph-function/outputs-provided",
      message: /carries must contain every required and provided binding/u,
      mutate(graphFunction) {
        graphFunction.environment.carries = [graphFunction.outputs[0]];
      },
    },
    {
      name: "start term differs from outer input",
      diagnosticId:
        "abg://gtl-program/graph-function/materializable-template",
      message: /start term input must equal the GraphFunction input/u,
      mutate(graphFunction) {
        graphFunction.template.nodes[0].term.inputCarrierRef =
          graphFunction.outputs[0];
      },
    },
    {
      name: "terminal term differs from outer output",
      diagnosticId:
        "abg://gtl-program/graph-function/materializable-template",
      message: /terminal term output must equal the GraphFunction output/u,
      mutate(graphFunction) {
        graphFunction.template.nodes[0].term.outputCarrierRef =
          graphFunction.inputs[0];
      },
    },
  ];

  for (const { name, diagnosticId, message, mutate } of mutations) {
    const module = structuredClone(publication());
    mutate(graphFunctionFor(module));
    const report = typecheck(module);
    assert.equal(report.passed, false, `${name}: ${JSON.stringify(report)}`);
    assert.equal(
      report.issues.some((issue) =>
        issue.diagnosticId === diagnosticId && message.test(issue.message)
      ),
      true,
      `${name}: ${JSON.stringify(report)}`,
    );
  }
});

test("C.of carriers equal executable contracts while F_H keeps response and continued output distinct", () => {
  const controls = [
    [publication(), HELLO_WORLD_IDS.programRef],
    [publication(), FP_HELLO_IDS.programRef],
  ];
  for (const [module, programRef] of controls) {
    const report = typecheck(module, programRef);
    assert.equal(report.passed, true, `${programRef}: ${JSON.stringify(report)}`);
  }

  const interactionModule = fhPublication();
  const interactionLeaf = leafFor(
    interactionModule,
    HELLO_WORLD_IDS.graphFunctionRef,
    "F_H",
  );
  assert.notEqual(
    interactionLeaf.outputCarrierRef,
    interactionLeaf.requirement.responseContractRef,
  );
  const nativeReport = typecheck(interactionModule);
  const rawReport = abg.typecheckGtlProgram(
    JSON.stringify(input(interactionModule)),
  );
  assert.equal(nativeReport.passed, true, JSON.stringify(nativeReport));
  assert.equal(rawReport.passed, true, JSON.stringify(rawReport));
  assert.deepEqual(
    nativeReport.issues.map(({ diagnosticId, path, message }) => ({
      diagnosticId,
      path,
      message,
    })),
    rawReport.issues.map(({ diagnosticId, path, message }) => ({
      diagnosticId,
      path,
      message,
    })),
  );

  const cases = [
    {
      name: "F_D input",
      module: publication,
      programRef: HELLO_WORLD_IDS.programRef,
      graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
      fibre: "F_D",
      mutate(leaf, module) {
        leaf.requirement.inputContractRef = leaf.outputCarrierRef;
        const binding = module.implementationBindings.find(
          (row) => row.bindingRef === leaf.requirement.implementationBindingRef,
        );
        assert.notEqual(binding, undefined);
        binding.inputContractRef = leaf.outputCarrierRef;
      },
    },
    {
      name: "F_D output",
      module: publication,
      programRef: HELLO_WORLD_IDS.programRef,
      graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
      fibre: "F_D",
      mutate(leaf, module) {
        leaf.requirement.outputContractRef = leaf.inputCarrierRef;
        const binding = module.implementationBindings.find(
          (row) => row.bindingRef === leaf.requirement.implementationBindingRef,
        );
        assert.notEqual(binding, undefined);
        binding.outputContractRef = leaf.inputCarrierRef;
      },
    },
    {
      name: "F_P input",
      module: publication,
      programRef: FP_HELLO_IDS.programRef,
      graphFunctionRef: FP_HELLO_IDS.graphFunctionRef,
      fibre: "F_P",
      mutate(leaf, module) {
        leaf.requirement.inputContractRef = leaf.outputCarrierRef;
        const binding = module.implementationBindings.find(
          (row) => row.bindingRef === leaf.requirement.implementationBindingRef,
        );
        assert.notEqual(binding, undefined);
        binding.inputContractRef = leaf.outputCarrierRef;
      },
    },
    {
      name: "F_P output",
      module: publication,
      programRef: FP_HELLO_IDS.programRef,
      graphFunctionRef: FP_HELLO_IDS.graphFunctionRef,
      fibre: "F_P",
      mutate(leaf, module) {
        leaf.requirement.outputContractRef = leaf.inputCarrierRef;
        const binding = module.implementationBindings.find(
          (row) => row.bindingRef === leaf.requirement.implementationBindingRef,
        );
        assert.notEqual(binding, undefined);
        binding.outputContractRef = leaf.inputCarrierRef;
      },
    },
    {
      name: "F_H request",
      module: fhPublication,
      programRef: HELLO_WORLD_IDS.programRef,
      graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
      fibre: "F_H",
      mutate(leaf) {
        leaf.requirement.requestContractRef = leaf.outputCarrierRef;
      },
    },
  ];

  for (const row of cases) {
    const module = structuredClone(row.module());
    row.mutate(leafFor(module, row.graphFunctionRef, row.fibre), module);
    const objectReport = typecheck(module, row.programRef);
    const textReport = abg.typecheckGtlProgram(
      JSON.stringify(input(module, row.programRef)),
    );
    for (const report of [objectReport, textReport]) {
      assert.equal(report.passed, false, `${row.name}: ${JSON.stringify(report)}`);
      assert.equal(
        report.issues.some((issue) =>
          issue.diagnosticId ===
            "abg://gtl-program/c-algebra/enclosing-carrier-mismatch" &&
          /C\.of (?:outer carriers|F_H input carrier) must exactly equal/u
            .test(issue.message)
        ),
        true,
        `${row.name}: ${JSON.stringify(report)}`,
      );
    }
    assert.deepEqual(
      objectReport.issues.map(({ diagnosticId, path, message }) => ({
        diagnosticId,
        path,
        message,
      })),
      textReport.issues.map(({ diagnosticId, path, message }) => ({
        diagnosticId,
        path,
        message,
      })),
      row.name,
    );
  }
});

test("Public catalog admission refuses a C.of enclosing-carrier mismatch with zero events", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-a5-f02-public-c-of-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const operationContext = publicApi.createRootOperationContext(
    join(scratch, "events.jsonl"),
  );
  context.after(() => publicApi.closeRootOperationContext(operationContext));
  const module = structuredClone(publication());
  const leaf = leafFor(module, HELLO_WORLD_IDS.graphFunctionRef, "F_D");
  leaf.requirement.inputContractRef = leaf.outputCarrierRef;
  const binding = module.implementationBindings.find(
    (row) => row.bindingRef === leaf.requirement.implementationBindingRef,
  );
  assert.notEqual(binding, undefined);
  binding.inputContractRef = leaf.outputCarrierRef;

  const outcome = await publicApi.applyRootPublicInvocation(operationContext, {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.catalog.admit",
    variant: "module_publication",
    invocationRef: "invocation://a5-f02/invalid-c-of-carriers",
    eventTime: "2026-08-07T00:00:00.000Z",
    correlationId: "correlation://a5-f02/invalid-c-of-carriers",
    payload: { readinessBasis: { publications: [module] } },
  });
  assert.equal(outcome.disposition, "refused", JSON.stringify(outcome));
  const refusal = outcome.kind === "public_invocation_refusal"
    ? outcome
    : outcome.result;
  assert.match(
    refusal.message,
    /Program validation refused: \{"kind":"static_validation_refusal"/u,
  );
  assert.match(refusal.message, /"code":"enclosing_carrier_mismatch"/u);
  assert.match(refusal.message, /C\.of outer carriers must exactly equal/u);
  assert.deepEqual(operationContext.store.readAll(), []);
});

test("workflow.C wires equal the selected child published interface", () => {
  const module = structuredClone(publication());
  const program = module.programs.find(
    (candidate) => candidate.programRef === WORKFLOW_HELLO_IDS.programRef,
  );
  assert.notEqual(program, undefined);
  program.callableMembership.push(GRAPH_EDGE_HELLO_IDS.normalizeGraphFunctionRef);
  const contribution = module.contributions.find(
    (candidate) =>
      candidate.declarationOrContractRef ===
        GRAPH_EDGE_HELLO_IDS.normalizeGraphFunctionRef,
  );
  assert.notEqual(contribution, undefined);
  contribution.programMembershipRefs.push(WORKFLOW_HELLO_IDS.programRef);
  const workflow = graphFunctionFor(module, WORKFLOW_HELLO_IDS.graphFunctionRef);
  workflow.template.nodes[0].term.graphFunctionRef =
    GRAPH_EDGE_HELLO_IDS.normalizeGraphFunctionRef;

  const report = typecheck(module, WORKFLOW_HELLO_IDS.programRef);
  assert.equal(report.passed, false, JSON.stringify(report));
  assert.equal(
    report.issues.some((issue) =>
      issue.diagnosticId === "abg://gtl-program/c-algebra/invalid-program" &&
      /workflow\.C carriers must equal the selected child GraphFunction interface/u
        .test(issue.message)
    ),
    true,
    JSON.stringify(report),
  );
});

test("Public catalog admission refuses invalid static wires with zero events", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-a5-f02-public-wire-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const operationContext = publicApi.createRootOperationContext(
    join(scratch, "events.jsonl"),
  );
  context.after(() => publicApi.closeRootOperationContext(operationContext));
  const module = structuredClone(publication());
  const graphFunction = graphFunctionFor(module);
  graphFunction.environment.requires = [graphFunction.outputs[0]];
  const outcome = await publicApi.applyRootPublicInvocation(operationContext, {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.catalog.admit",
    variant: "module_publication",
    invocationRef: "invocation://a5-f02/invalid-static-wire",
    eventTime: "2026-08-07T00:00:00.000Z",
    correlationId: "correlation://a5-f02/invalid-static-wire",
    payload: { readinessBasis: { publications: [module] } },
  });
  assert.equal(outcome.disposition, "refused", JSON.stringify(outcome));
  const refusal = outcome.kind === "public_invocation_refusal"
    ? outcome
    : outcome.result;
  assert.match(refusal.message, /Program validation refused/u);
  assert.deepEqual(operationContext.store.readAll(), []);
});

test("a GraphFunction call cycle requires the exact bounded recursion constructor", () => {
  const unauthorized = structuredClone(publication());
  const graphFunction = graphFunctionFor(unauthorized);
  const terminal = graphFunction.template.nodes[0];
  terminal.term = {
    kind: "c_workflow",
    inputCarrierRef: graphFunction.inputs[0],
    outputCarrierRef: graphFunction.outputs[0],
    graphFunctionRef: graphFunction.id,
  };
  const refused = typecheck(unauthorized);
  assert.equal(refused.passed, false);
  assert.equal(
    diagnosticIds(refused).includes(
      "abg://gtl-program/graph/node-reachable-or-bound",
    ),
    true,
    JSON.stringify(refused),
  );

  const governedCycle = structuredClone(publication());
  const recursionParent = graphFunctionFor(
    governedCycle,
    RECURSION_HELLO_IDS.graphFunctionRef,
  );
  const recursionChild = graphFunctionFor(
    governedCycle,
    RECURSION_HELLO_IDS.childGraphFunctionRef,
  );
  recursionChild.template.nodes[0].term = {
    kind: "c_workflow",
    inputCarrierRef: recursionChild.inputs[0],
    outputCarrierRef: recursionChild.outputs[0],
    graphFunctionRef: recursionParent.id,
  };
  const admitted = typecheck(
    governedCycle,
    RECURSION_HELLO_IDS.programRef,
  );
  assert.equal(admitted.passed, true, JSON.stringify(admitted));
  assert.deepEqual(admitted.issues, []);

  const unpublishedDecisionLaw = structuredClone(governedCycle);
  const evaluator = unpublishedDecisionLaw.evaluators.find(
    (candidate) => candidate.name === RECURSION_HELLO_IDS.evaluatorRef,
  );
  assert.notEqual(evaluator, undefined);
  evaluator.consumedFieldRefs = [];
  const ungoverned = typecheck(
    unpublishedDecisionLaw,
    RECURSION_HELLO_IDS.programRef,
  );
  assert.equal(ungoverned.passed, false);
  assert.equal(
    ungoverned.issues.some((entry) =>
      entry.message.includes("remains after exact bounded recurse/foldback edges")
    ),
    true,
    JSON.stringify(ungoverned),
  );
});

test("one governed edge cannot legalize another cycle in the same SCC", () => {
  const mixed = structuredClone(publication());
  const recursionProgram = mixed.programs.find(
    (candidate) => candidate.programRef === RECURSION_HELLO_IDS.programRef,
  );
  assert.notEqual(recursionProgram, undefined);
  const parent = graphFunctionFor(mixed, RECURSION_HELLO_IDS.graphFunctionRef);
  const child = graphFunctionFor(
    mixed,
    RECURSION_HELLO_IDS.childGraphFunctionRef,
  );
  assert.equal(
    parent.template.applications.some(
      (application) => application.relationKind === "recurse",
    ),
    true,
  );
  parent.template.nodes[0].term = {
    kind: "c_workflow",
    inputCarrierRef: parent.inputs[0],
    outputCarrierRef: parent.outputs[0],
    graphFunctionRef: child.id,
  };
  child.template.nodes[0].term = {
    kind: "c_workflow",
    inputCarrierRef: child.inputs[0],
    outputCarrierRef: child.outputs[0],
    graphFunctionRef: parent.id,
  };

  const report = typecheck(mixed, recursionProgram.programRef);
  assert.equal(report.passed, false);
  assert.equal(
    diagnosticIds(report).includes(
      "abg://gtl-program/graph/node-reachable-or-bound",
    ),
    true,
    JSON.stringify(report),
  );
  assert.equal(
    report.issues.some((entry) =>
      entry.message.includes("remains after exact bounded recurse/foldback edges")
    ),
    true,
    JSON.stringify(report),
  );

  const admitted = typecheck(publication(), recursionProgram.programRef);
  assert.equal(admitted.passed, true, JSON.stringify(admitted));
});

test("malformed carrier accessors are refused without invoking them", () => {
  let reads = 0;
  const candidate = {
    kind: "gtl_program_conformance_input",
    schemaVersion: "5.0.0",
    subjectRef: "subject://a5-f02/accessor",
    programRef: HELLO_WORLD_IDS.programRef,
  };
  Object.defineProperty(candidate, "module", {
    enumerable: true,
    get() {
      reads += 1;
      throw new Error("effectful accessor executed");
    },
  });
  const admission = abg.admitGtlProgramConformanceInput(candidate);
  assert.equal(admission.accepted, false);
  assert.equal(reads, 0);
});

test("diagnostic and repair identities are closed machine-readable rosters", () => {
  for (const value of abg.GTL_PROGRAM_DIAGNOSTIC_ID_VALUES) {
    assert.equal(abg.isGtlProgramDiagnosticId(value), true);
    assert.doesNotThrow(() => abg.assertGtlProgramDiagnosticId(value));
  }
  assert.equal(abg.isGtlProgramDiagnosticId("abg://gtl-program/invented"), false);
  assert.throws(
    () => abg.assertGtlProgramDiagnosticId("abg://gtl-program/invented"),
    /unknown GTL Program diagnostic identity/u,
  );
  assert.deepEqual(
    [...new Set(abg.GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES)],
    abg.GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES,
  );
  assert.deepEqual(
    Object.keys(EXPECTED_DIAGNOSTIC_AUTHORITY_REFS),
    [...abg.GTL_PROGRAM_DIAGNOSTIC_ID_VALUES],
  );
  assert.deepEqual(
    abg.GTL_PROGRAM_DIAGNOSTIC_AUTHORITY_REFS,
    EXPECTED_DIAGNOSTIC_AUTHORITY_REFS,
  );

  const invalid = structuredClone(publication());
  graphFunctionFor(invalid).environment.requires = [];
  const report = typecheck(invalid);
  assert.equal(report.passed, false);
  for (const issue of report.issues) {
    const expected = EXPECTED_DIAGNOSTIC_AUTHORITY_REFS[issue.diagnosticId];
    assert.notEqual(expected, undefined, issue.diagnosticId);
    assert.deepEqual(
      {
        axiomRef: issue.axiomRef,
        requirementRef: issue.requirementRef,
        designRef: issue.designRef,
        localConstitutionRef: issue.localConstitutionRef,
      },
      expected,
    );
    assert.deepEqual(issue.evidenceRefs, [issue.surfaceRef]);
    assert.equal(issue.admissibleRepairs.length > 0, true);
  }
});
