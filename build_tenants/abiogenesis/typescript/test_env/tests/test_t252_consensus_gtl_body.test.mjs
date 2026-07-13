// Validates: REQ-P-CONSENSUS-001..019.
// Validates: REQ-L-GTL3-GRAPHFUNCTION, REQ-L-GTL3-HOF,
// REQ-L-GTL3-RECURSE, REQ-L-GTL3-C-ALGEBRA.

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  ABG_CONSENSUS_GTL_BODY,
  ABG_CONSENSUS_GTL_MODULE,
  CONSENSUS_GRAPH_FUNCTION_REF,
  CONSENSUS_RETRYABLE_FAILURE_CLASSES,
  CONSENSUS_REVIEW_RETRY_BUDGET,
  deriveConsensusOperatorRegistry
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import { compileCAlgebraToHog } from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import { compileExecutionDeclarations } from "../../build/semantic/code/src/abg/m03/contracts/execution_declaration_compiler.js";
import { compileGraphFunctionApplication } from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import { compileGraphVectorCProgramSelection } from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import { compileHofRelation } from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import { admitHogHandlerBindings } from "../../build/semantic/code/src/abg/m03/contracts/hog_handler_bindings.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { hogHandlerBindingsFromDeclarationAttrs } from "../../build/semantic/code/src/abg/m03/contracts/hog_program_syntax.js";
import { pluginSelectionFromDeclarationAttrs } from "../../build/semantic/code/src/abg/m03/contracts/plugin_selection.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";

function graphFunctions(moduleValue = ABG_CONSENSUS_GTL_MODULE) {
  return moduleValue.graphFunctions;
}

function vectors(graphFunction) {
  return graphFunction.template.kind === "inline_graph"
    ? graphFunction.template.graph.vectors
    : [];
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function declarationCount(graphFunction, key) {
  return graphFunction.declarations.entries.filter((entry) => entry.key === key)
    .length;
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

test("T-252 canonical body is one DS-1 module with no catalog-owner claim", () => {
  assert.equal(ABG_CONSENSUS_GTL_MODULE.name, "abg.consensus.ds1");
  assert.equal(graphFunctions().length, 7);
  assert.equal(ABG_CONSENSUS_GTL_MODULE.jobs.length, 0);
  assert.equal(ABG_CONSENSUS_GTL_MODULE.roles.length, 0);
  assert.equal(
    ABG_CONSENSUS_GTL_BODY.graphFunctions.consensus.id,
    CONSENSUS_GRAPH_FUNCTION_REF
  );
  assert.deepEqual(
    ABG_CONSENSUS_GTL_BODY.graphFunctions.consensus.inputs,
    [ABG_CONSENSUS_GTL_BODY.nodes.subject]
  );
  assert.deepEqual(
    ABG_CONSENSUS_GTL_BODY.graphFunctions.consensus.outputs,
    [ABG_CONSENSUS_GTL_BODY.nodes.result]
  );
  assert.equal(
    JSON.stringify(serializeModule(ABG_CONSENSUS_GTL_MODULE)).includes(
      "owner://abg/substrate"
    ),
    false
  );
});

test("T-252 canonical serialization round-trips through M02 without loss", () => {
  const serialized = serializeModule(ABG_CONSENSUS_GTL_MODULE);
  const admitted = admitModule(cloneJson(serialized));
  assert.deepEqual(serializeModule(admitted), serialized);

  const malformed = cloneJson(serialized);
  malformed.unknownT252Field = "must-not-survive";
  assert.throws(
    () => admitModule(malformed),
    /Module\.unknownT252Field: unknown field/u,
    "T-263 closes the previously lossy unknown-field admission gap"
  );
});

test("T-252 HOF arrays are pure and the child relation reaches only its typed runtime gap", () => {
  const { nodes, graphFunctions: bodyFunctions, nativeWitnesses } =
    ABG_CONSENSUS_GTL_BODY;
  assert.equal(
    nodes.reviewerAssignments.schema.ref,
    `Vector[${nodes.reviewerAssignment.schema.ref}]`
  );
  assert.equal(
    nodes.attributedFindings.schema.ref,
    `Vector[${nodes.reviewFindings.schema.ref}]`
  );
  assert.equal(nativeWitnesses.reviewerAssignments.member.nodeRef, nodes.reviewerAssignment.id);
  assert.equal(nativeWitnesses.attributedFindings.member.nodeRef, nodes.reviewFindings.id);

  const wrapper = vectors(bodyFunctions.reviewPanel);
  assert.equal(wrapper.length, 1);
  assert.deepEqual(wrapper[0].source, [nodes.reviewerAssignments]);
  assert.equal(wrapper[0].target.id, nodes.attributedFindings.id);
  assert.equal(wrapper[0].operators.length, 0);
  assert.equal(wrapper[0].declarations.entries.length, 0);

  const compilation = compileHofRelation({
    graphFunction: bodyFunctions.reviewPanel,
    graphFunctions: graphFunctions()
  });
  assert.equal(compilation.observed, true);
  assert.equal(compilation.accepted, false);
  assert.deepEqual(
    compilation.diagnostics.map((row) => [row.classification, row.diagnosticId]),
    [["semantic_not_realized", "gtl-hof-unrealized-fan-out"]]
  );
});

test("T-252 fan-in and recursion applications compile exact lineage before runtime gaps", () => {
  const bodyFunctions = ABG_CONSENSUS_GTL_BODY.graphFunctions;
  const rows = [
    [bodyFunctions.reducePanelFacts, "fan_in", bodyFunctions.exactPanelFacts.id],
    [bodyFunctions.boundedRounds, "recurse", bodyFunctions.round.id]
  ];
  for (const [graphFunction, operatorKind, operandRef] of rows) {
    const compilation = compileGraphFunctionApplication({
      graphFunction,
      graphFunctions: graphFunctions()
    });
    assert.equal(compilation.observed, true);
    assert.equal(compilation.accepted, false);
    assert.equal(compilation.lineage.orderedSteps[0].operatorKind, operatorKind);
    assert.equal(
      compilation.lineage.orderedSteps[0].operandGraphFunctionRef,
      operandRef
    );
    assert.deepEqual(
      compilation.diagnostics.map((row) => [row.classification, row.diagnosticId]),
      [["semantic_not_realized", "gtl-application-runtime-not-realized"]]
    );
  }
});

test("T-252 every selected GraphVector resolves one exact local C program", () => {
  let selectedVectorCount = 0;
  for (const graphFunction of graphFunctions()) {
    for (const vector of vectors(graphFunction)) {
      const compilation = compileGraphVectorCProgramSelection({
        graphFunction,
        graphVector: vector
      });
      if (!compilation.observed) continue;
      selectedVectorCount += 1;
      assert.ok(compilation.binding, `${graphFunction.name}/${vector.name}`);
      assert.equal(compilation.selectedCandidates.length, 1);
      assert.equal(compilation.selectedProgramDiagnostics.length, 0);
      assert.deepEqual(
        compilation.diagnostics.map((row) => [row.classification, row.diagnosticId]),
        [["semantic_not_realized", "gtl-c-unrealized-vector-program-selection"]]
      );
    }
  }
  assert.equal(selectedVectorCount, 34);
});

test("T-252 nested C census retains retry and workflow as typed gaps", () => {
  const rows = ABG_CONSENSUS_GTL_BODY.programs.map((program) => ({
    programRef: program.programRef,
    compilation: compileCAlgebraToHog(program)
  }));
  const invalid = rows.flatMap((row) =>
    row.compilation.diagnostics.filter(
      (diagnostic) => diagnostic.classification === "invalid_program"
    )
  );
  assert.deepEqual(invalid, []);
  const diagnosticIds = rows.flatMap((row) =>
    row.compilation.diagnostics.map((diagnostic) => diagnostic.diagnosticId)
  );
  assert.equal(
    diagnosticIds.filter((value) => value === "gtl-c-unrealized-retry").length,
    1
  );
  assert.equal(
    diagnosticIds.filter((value) => value === "gtl-c-unrealized-workflow-lift")
      .length,
    3
  );

  const reviewer = JSON.parse(
    rows.find((row) => row.programRef === "program://abg/consensus/review-one-profile")
      .compilation.canonicalSource
  );
  assert.equal(reviewer.term.kind, "c_retry");
  assert.equal(reviewer.term.budget, CONSENSUS_REVIEW_RETRY_BUDGET);
  assert.deepEqual(CONSENSUS_RETRYABLE_FAILURE_CLASSES, [
    "transport_failure",
    "no_output",
    "contract_failure"
  ]);
});

test("T-252 explicit context projections make every graph source and output derivable", () => {
  const admitted = admitModule(
    cloneJson(serializeModule(ABG_CONSENSUS_GTL_MODULE))
  );
  const report = typecheckGtlProgram({
    subjectRef: "workspace://abg/t252/consensus",
    abiPackageVersion: "5.0.0-dev.0",
    scopeKind: "submitted_structure",
    modules: [admitted]
  });
  const structuralRules = [
    "abg://gtl-program/graph-vector/source-derivable",
    "abg://gtl-program/graph/output-derivable",
    "abg://gtl-program/c-algebra/invalid-program",
    "abg://gtl-program/hof/invalid-program",
    "abg://gtl-program/graph-function-application/invalid-program",
    "abg://gtl-program/declaration/host-compatible",
    "abg://gtl-program/graph-function/unique-publication"
  ];
  assert.deepEqual(
    report.issues.filter((issue) => structuralRules.includes(issue.ruleRef)),
    []
  );

  const roundVectors = vectors(ABG_CONSENSUS_GTL_BODY.graphFunctions.round);
  const reduceRound = roundVectors.find((vector) => vector.name === "consensus.reduce-round");
  const reassessRound = roundVectors.find(
    (vector) => vector.name === "consensus.reassess-round"
  );
  assert.deepEqual(
    reduceRound.source.map((node) => node.name),
    [
      "ConsensusRoundExecution",
      "RoundExactProjection",
      "AttributedFindingsVector",
      "SemanticReducerBinding"
    ]
  );
  assert.deepEqual(
    reassessRound.source.map((node) => node.name),
    [
      "ConsensusRoundExecution",
      "RoundExactProjection",
      "AttributedFindingsVector",
      "InitialSemanticAssessment",
      "SubmitterResponse",
      "SemanticReducerBinding"
    ]
  );
});

test("T-252 effects, handlers, plugins, and domain operators remain separate", () => {
  const bodyFunctions = ABG_CONSENSUS_GTL_BODY.graphFunctions;
  assert.deepEqual(bodyFunctions.reviewPanel.effects, bodyFunctions.reviewOneProfile.effects);
  assert.deepEqual(bodyFunctions.reducePanelFacts.effects, bodyFunctions.exactPanelFacts.effects);
  assert.deepEqual(bodyFunctions.boundedRounds.effects, bodyFunctions.round.effects);
  assert.deepEqual(
    bodyFunctions.consensus.effects,
    sortedUnique([
      ...bodyFunctions.round.effects,
      "effect://abg/consensus/seed-round",
      "effect://abg/consensus/bounded-rounds",
      "effect://abg/consensus/project-result"
    ])
  );
  for (const graphFunction of graphFunctions()) {
    assert.deepEqual(graphFunction.effects, sortedUnique(graphFunction.effects));
  }

  const expectedSelectionCounts = new Map([
    [bodyFunctions.reviewOneProfile.id, 1],
    [bodyFunctions.reviewPanel.id, 0],
    [bodyFunctions.exactPanelFacts.id, 1],
    [bodyFunctions.reducePanelFacts.id, 1],
    [bodyFunctions.round.id, 1],
    [bodyFunctions.boundedRounds.id, 1],
    [bodyFunctions.consensus.id, 1]
  ]);
  for (const graphFunction of graphFunctions()) {
    assert.equal(
      declarationCount(graphFunction, "abg.plugin_selection"),
      expectedSelectionCounts.get(graphFunction.id)
    );
    const selection = pluginSelectionFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.id
    );
    if (expectedSelectionCounts.get(graphFunction.id) === 0) {
      assert.equal(selection, null);
    } else {
      assert.ok(selection);
      assert.ok(Object.keys(selection).length > 0);
    }
    const rawHandlers = hogHandlerBindingsFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.id
    );
    const handlers =
      rawHandlers === null
        ? []
        : admitHogHandlerBindings(rawHandlers, graphFunction.id);
    for (const binding of handlers) {
      assert.ok(binding.handlerRef.startsWith("handler://abg/"));
    }
    try {
      compileExecutionDeclarations(graphFunction);
    } catch (error) {
      assert.match(
        String(error),
        /(?:gtl-c-unrealized-|omits current interpreter anchors)/u,
        `${graphFunction.name} must stop only on a named realization gap`
      );
    }
  }

  for (const operator of ABG_CONSENSUS_GTL_MODULE.operators) {
    assert.equal(operator.binding.startsWith("plugin://"), false);
    assert.equal(operator.binding.startsWith("handler://"), false);
  }
});

test("T-252 module operator registry deduplicates exact copies and refuses conflict", () => {
  const graphFunctionValues = graphFunctions();
  assert.deepEqual(
    deriveConsensusOperatorRegistry(graphFunctionValues),
    ABG_CONSENSUS_GTL_MODULE.operators
  );
  assert.equal(
    new Set(ABG_CONSENSUS_GTL_MODULE.operators.map((row) => row.name)).size,
    ABG_CONSENSUS_GTL_MODULE.operators.length
  );

  const source = ABG_CONSENSUS_GTL_BODY.graphFunctions.reviewOneProfile;
  const sourceGraph = source.template.graph;
  const sourceVector = sourceGraph.vectors[0];
  const conflicting = {
    ...source,
    template: {
      ...source.template,
      graph: {
        ...sourceGraph,
        vectors: [
          {
            ...sourceVector,
            operators: [
              {
                ...sourceVector.operators[0],
                binding: "binding://abg/consensus/conflicting-review"
              }
            ]
          }
        ]
      }
    }
  };
  assert.throws(
    () => deriveConsensusOperatorRegistry([source, conflicting]),
    /operator registry conflict/u
  );
});

test("T-252 body dependency closure avoids fenced execution implementation directories", () => {
  const sourcePath = fileURLToPath(
    new URL(
      "../../code/src/abg/m03/contracts/consensus_gtl_body.ts",
      import.meta.url
    )
  );
  const closure = importClosure(sourcePath);
  const forbidden = closure.filter((path) =>
    ["/runner/", "/transport/", "/events/", "/app/", "/qualification/", "/bin/"].some(
      (segment) => path.includes(segment)
    )
  );
  assert.deepEqual(forbidden, []);
});

test("T-252 probe derives observations through the real context join without making a runtime-call claim", () => {
  const manifestPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../fixtures/t252_consensus_probe_manifest.json"
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.version, 2);
  assert.equal(
    manifest.censusDerivation.order,
    "compiler_and_structural_observations_before_ticket_ownership"
  );
  assert.equal(
    manifest.censusDerivation.observedGapFamilyCount,
    manifest.gapCensus.length
  );
  assert.equal(
    manifest.censusDerivation.ownershipJoinChangesObservedFamilySet,
    false
  );
  assert.match(
    manifest.censusDerivation.observedGapEvidenceDigest,
    /^sha256:[0-9a-f]{64}$/u
  );

  for (const gap of manifest.gapCensus) {
    assert.equal(gap.ownerStatus, "active", gap.gapFamily);
    assert.ok(gap.diagnosticIds.length > 0, gap.gapFamily);
    assert.ok(gap.canonicalBodyPaths.length > 0, gap.gapFamily);
    assert.ok(gap.observationSources.length > 0, gap.gapFamily);
    assert.equal(
      gap.observationSources.some((source) => source.startsWith("ticket:")),
      false,
      gap.gapFamily
    );
  }
  const observed = new Set(manifest.gapCensus.map((gap) => gap.gapFamily));
  assert.equal(
    manifest.ownership.activeOwnedButNotObservedFamilies.some((family) =>
      observed.has(family)
    ),
    false
  );
  assert.equal(manifest.ownership.unownedGapCount, 0);
  assert.equal(manifest.ownership.duplicateOwnerCount, 0);

  assert.ok(manifest.compiler.executionContextJoinRows.length > 0);
  assert.equal(
    manifest.compiler.executionContextJoinRows.every(
      (row) =>
        row.status === "blocked_capability" &&
        row.fieldClosureObserved === true &&
        row.protocolRoleObserved === true
    ),
    true
  );
  assert.equal(
    manifest.compiler.executionContextJoinRows.some(
      (row) =>
        row.domainStageRole === "reduce_round" &&
        row.computeStageRole === "transform"
    ),
    true
  );

  assert.equal(Object.hasOwn(manifest, "noExecutionObservation"), false);
  assert.equal(
    manifest.staticExecutionReachability.evidenceMethod,
    "static_source_import_closure"
  );
  assert.equal(
    manifest.staticExecutionReachability.runtimeCallObservation,
    "not_performed"
  );
  assert.equal(
    Object.hasOwn(manifest.staticExecutionReachability, "derivedCallCounts"),
    false
  );
});
