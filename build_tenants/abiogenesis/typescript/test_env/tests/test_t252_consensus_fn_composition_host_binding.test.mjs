// Validates: REQ-R-ABG3-FN-COMP-003.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  constructAbgFnCompositionDeclarations,
  RETRYABLE_RUNTIME_FAILURE_CLASSES,
  resolveAbgFnCompositionSelection
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  ABG_CONSENSUS_GRAPH_FUNCTION_REF,
  ABG_CONSENSUS_GTL_PROGRAM
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_program.js";
import {
  constructGraphVector,
  materializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/index.js";

function graphFunctionNamed(name) {
  const matches = ABG_CONSENSUS_GTL_PROGRAM.submittedGraphFunctions.filter(
    (graphFunction) => graphFunction.name === name
  );
  assert.equal(matches.length, 1, `expected one GraphFunction named ${name}`);
  return matches[0];
}

function vectorNamed(graphFunction, name) {
  const matches = materializeGraphFunction(graphFunction).vectors.filter(
    (vector) => vector.name === name
  );
  assert.equal(matches.length, 1, `expected one GraphVector named ${name}`);
  return matches[0];
}

function hasFnComposition(vector) {
  return vector.declarations.entries.some(
    (entry) => entry.key === "abg.fn_composition"
  );
}

test("T-252 body runtime dependencies are exported by the public ABG M03 entry", async () => {
  assert.equal(typeof constructAbgFnCompositionDeclarations, "function");
  assert.deepEqual(RETRYABLE_RUNTIME_FAILURE_CLASSES, [
    "transport_failure",
    "no_output",
    "contract_failure"
  ]);

  const source = await readFile(
    new URL(
      "../../code/src/abg/m03/contracts/consensus_gtl_program.ts",
      import.meta.url
    ),
    "utf8"
  );
  assert.match(source, /from "\.\/index\.js"/u);
  assert.doesNotMatch(
    source,
    /from "\.\/(?:carriers|fn_composition|review_consensus_modules)\.js"/u
  );
  assert.doesNotMatch(source, /shared\/runtime_identity|stableSha256Digest|bodyDigest/u);
});

test("T-252 binds every authored selected composition to its exact GraphFunction and GraphVector", () => {
  const authoredGraphFunctionNames = [
    ABG_CONSENSUS_GRAPH_FUNCTION_REF,
    "graph-function://abg/consensus/round",
    "graph-function://abg/consensus/review-one-profile",
    "graph-function://abg/consensus/exact-panel-facts"
  ];
  let resolvedCount = 0;
  for (const graphFunctionName of authoredGraphFunctionNames) {
    const graphFunction = graphFunctionNamed(graphFunctionName);
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      if (!hasFnComposition(vector)) {
        continue;
      }
      const selection = resolveAbgFnCompositionSelection({
        graphFunction,
        vector
      });
      assert.equal(selection.contract.host.graphFunctionRef, graphFunction.id);
      assert.equal(selection.contract.host.graphVectorRef, vector.id);
      resolvedCount += 1;
    }
  }
  assert.equal(resolvedCount, 21);
});

test("T-252 retains derived recurse and fan-in host rebinding as a generic gap", () => {
  let retainedCount = 0;
  for (const [sourceName, derivedName] of [
    [
      "graph-function://abg/consensus/round",
      "recurse(graph-function://abg/consensus/round)"
    ],
    [
      "graph-function://abg/consensus/exact-panel-facts",
      "fan_in(graph-function://abg/consensus/exact-panel-facts)"
    ]
  ]) {
    const source = graphFunctionNamed(sourceName);
    const derived = graphFunctionNamed(derivedName);
    for (const derivedVector of materializeGraphFunction(derived).vectors) {
      if (!hasFnComposition(derivedVector)) {
        continue;
      }
      const selection = resolveAbgFnCompositionSelection({
        graphFunction: source,
        vector: derivedVector
      });
      assert.equal(selection.contract.host.graphFunctionRef, source.id);
      assert.equal(selection.contract.host.graphVectorRef, derivedVector.id);
      assert.throws(
        () =>
          resolveAbgFnCompositionSelection({
            graphFunction: derived,
            vector: derivedVector
          }),
        /host_graph_function_ref mismatch/u
      );
      retainedCount += 1;
    }
  }
  assert.equal(retainedCount, 15);
});

test("T-252 refuses a selected composition under a different GraphFunction host", () => {
  const root = graphFunctionNamed(ABG_CONSENSUS_GRAPH_FUNCTION_REF);
  const round = graphFunctionNamed("graph-function://abg/consensus/round");
  const rootVector = vectorNamed(root, "seed_first_round");

  assert.throws(
    () =>
      resolveAbgFnCompositionSelection({
        graphFunction: round,
        vector: rootVector
      }),
    /host_graph_function_ref mismatch/u
  );
});

test("T-252 refuses a selected composition under a different GraphVector identity", () => {
  const root = graphFunctionNamed(ABG_CONSENSUS_GRAPH_FUNCTION_REF);
  const seed = vectorNamed(root, "seed_first_round");
  const bounded = vectorNamed(root, "run_bounded_rounds");
  const substituted = constructGraphVector({
    name: seed.name,
    source: seed.source,
    target: seed.target,
    operators: seed.operators,
    evaluators: seed.evaluators,
    contexts: seed.contexts,
    rule: seed.rule,
    allowsSubwork: seed.allowsSubwork,
    declarations: seed.declarations,
    tags: seed.tags,
    id: bounded.id
  });

  assert.throws(
    () =>
      resolveAbgFnCompositionSelection({
        graphFunction: root,
        vector: substituted
      }),
    /host_graph_vector_ref mismatch/u
  );
});
