import assert from "node:assert/strict";
import test from "node:test";

import * as abg from "../../build/code/src/abg/m03.js";
import * as gtl from "../../build/code/src/gtl/m01.js";
import {
  HELLO_WORLD_IDS,
  RECURSION_HELLO_IDS,
  constructHelloWorldModulePublication,
} from "../../build/code/src/gtl/index.js";

const DIGEST = `sha256:${"2".repeat(64)}`;

function publication() {
  return constructHelloWorldModulePublication({
    productId: "product://abiogenesis/a5-f02-proof@5",
    artifactDigest: DIGEST,
    productContentDigest: DIGEST,
    productManifestDigest: DIGEST,
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
});
