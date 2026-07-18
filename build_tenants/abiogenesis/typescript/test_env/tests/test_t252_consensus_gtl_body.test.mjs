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
  CONSENSUS_RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
  admitConsensusRuntimeSchemaAdmissionMetadata,
  deriveConsensusRuntimeSchemaAdmissionMetadataRows,
  deriveConsensusOperatorRegistry
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import {
  CONSENSUS_DOMAIN_SCHEMAS,
  CONSENSUS_REVIEWER_ASSIGNMENT_VECTOR_SCHEMA,
  CONSENSUS_REVIEW_FINDINGS_VECTOR_SCHEMA,
  CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY,
  CONSENSUS_RUNTIME_SCHEMA_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import { defineNativeContract } from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
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
import { graphFunctionApplicationDeclarationFromDeclarations } from "../../build/semantic/code/src/gtl/m01/contracts/graph_function_application.js";
import { resolveSemanticBuildNativeSchemaSource } from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

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

function runtimeSchemaMetadataEntry(serializedModule) {
  const entries = serializedModule.metadata.entries.filter(
    (entry) => entry.key === CONSENSUS_RUNTIME_SCHEMA_ADMISSION_METADATA_KEY
  );
  assert.equal(entries.length, 1);
  assert.equal(entries[0].value.kind, "json_blob");
  assert.equal(entries[0].value.value.kind, "array");
  return entries[0];
}

function assertRuntimeSchemaMutationRefuses(mutate, expected) {
  const serialized = cloneJson(serializeModule(ABG_CONSENSUS_GTL_MODULE));
  const entry = runtimeSchemaMetadataEntry(serialized);
  mutate(entry.value.value.items);
  const admitted = admitModule(serialized);
  assert.throws(
    () => admitConsensusRuntimeSchemaAdmissionMetadata(admitted),
    expected
  );
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
  assert.equal(
    Object.hasOwn(ABG_CONSENSUS_GTL_BODY.nodes, "fhPendingInteraction"),
    false
  );
  assert.equal(
    JSON.stringify(serializeModule(ABG_CONSENSUS_GTL_MODULE)).includes(
      "schema://abg/consensus/fh-pending-interaction"
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

test("T-252 owns one closed projector-consumable native schema family", async () => {
  assert.equal(Object.keys(CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY).length, 15);
  assert.equal(CONSENSUS_RUNTIME_SCHEMA_SOURCES.length, 15);
  assert.equal(
    CONSENSUS_RUNTIME_SCHEMA_SOURCES.filter((source) =>
      source.symbolicSchemaRef.startsWith("Vector[")
    ).length,
    2
  );
  assert.equal(
    CONSENSUS_RUNTIME_SCHEMA_SOURCES.filter(
      (source) => source.publication === "existing_public_asset"
    ).length,
    3
  );
  assert.equal(
    CONSENSUS_RUNTIME_SCHEMA_SOURCES.filter(
      (source) => source.publication === "engine_private_definition"
    ).length,
    12
  );
  assert.equal(
    new Set(
      CONSENSUS_RUNTIME_SCHEMA_SOURCES.map(
        (source) => source.symbolicSchemaRef
      )
    ).size,
    15
  );
  assert.equal(
    new Set(
      CONSENSUS_RUNTIME_SCHEMA_SOURCES.map(
        (source) => `${source.contractId}@${source.contractVersion}`
      )
    ).size,
    15
  );
  assert.equal(
    CONSENSUS_RUNTIME_SCHEMA_SOURCES.some(
      (source) =>
        source.symbolicSchemaRef ===
        "schema://abg/consensus/fh-pending-interaction"
    ),
    false
  );

  const sourceByRef = new Map(
    CONSENSUS_RUNTIME_SCHEMA_SOURCES.map((source) => [
      source.symbolicSchemaRef,
      source
    ])
  );
  assert.equal(
    sourceByRef.get("schema://abg/consensus/subject").schema,
    CONSENSUS_DOMAIN_SCHEMAS.consensus_subject
  );
  assert.equal(
    sourceByRef.get("schema://abg/consensus/result").schema,
    CONSENSUS_DOMAIN_SCHEMAS.consensus_result
  );
  assert.equal(
    sourceByRef.get("schema://abg/consensus/review-findings").schema,
    CONSENSUS_DOMAIN_SCHEMAS.review_findings
  );
  assert.equal(
    sourceByRef.get(
      "Vector[schema://abg/consensus/reviewer-assignment]"
    ).schema,
    CONSENSUS_REVIEWER_ASSIGNMENT_VECTOR_SCHEMA
  );
  assert.equal(
    sourceByRef.get("Vector[schema://abg/consensus/review-findings]")
      .schema,
    CONSENSUS_REVIEW_FINDINGS_VECTOR_SCHEMA
  );

  for (const [sourceKey, source] of Object.entries(
    CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY
  )) {
    assert.equal(source.contractVersion, "5.0.0");
    assert.equal(
      source.sourceLocator.exportName,
      "CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY"
    );
    assert.deepEqual(source.sourceLocator.memberPath, [sourceKey, "schema"]);
    assert.deepEqual(source.namedChecks, {
      kind: "family_registry",
      exportName: "CONSENSUS_NATIVE_CHECK_REGISTRY",
      memberPath: []
    });
    const resolvedSource = await resolveSemanticBuildNativeSchemaSource(source);
    const definition = defineNativeContract({
      identity: {
        contractId: source.contractId,
        contractVersion: source.contractVersion,
        schemaId: source.contractId,
        schemaVersion: source.contractVersion
      },
      source: resolvedSource
    });
    assert.equal(definition.schema, source.schema);
    assert.equal(definition.schemaCoordinate.contractId, source.contractId);
    assert.equal(
      definition.schemaCoordinate.contractVersion,
      source.contractVersion
    );
  }
});

test("T-252 Module metadata covers each reachable schema tuple exactly", () => {
  const rows = admitConsensusRuntimeSchemaAdmissionMetadata(
    ABG_CONSENSUS_GTL_MODULE
  );
  assert.deepEqual(
    rows,
    deriveConsensusRuntimeSchemaAdmissionMetadataRows(graphFunctions())
  );
  assert.equal(rows.length, 34);
  assert.equal(
    new Set(
      rows.map(
        (row) =>
          `${row.graphFunctionId}\u0000${row.nodeRef}\u0000${row.symbolicSchemaRef}`
      )
    ).size,
    rows.length
  );
  assert.deepEqual(
    sortedUnique(rows.map((row) => row.symbolicSchemaRef)),
    sortedUnique(
      CONSENSUS_RUNTIME_SCHEMA_SOURCES.map(
        (source) => source.symbolicSchemaRef
      )
    )
  );
  assert.deepEqual(
    sortedUnique(rows.map((row) => row.graphFunctionId)),
    sortedUnique(graphFunctions().map((graphFunction) => graphFunction.id))
  );
  for (const row of rows) {
    assert.deepEqual(Object.keys(row), [
      "graphFunctionId",
      "nodeRef",
      "symbolicSchemaRef",
      "contractId",
      "contractVersion"
    ]);
    assert.equal(Object.values(row).every((value) => value.length > 0), true);
    assert.equal(Object.hasOwn(row, "schemaId"), false);
    assert.equal(Object.hasOwn(row, "schemaVersion"), false);
    assert.equal(Object.hasOwn(row, "digest"), false);
    assert.equal(Object.hasOwn(row, "locator"), false);
    assert.equal(Object.hasOwn(row, "projectionWitness"), false);
    assert.equal(Object.hasOwn(row, "callable"), false);
  }
});

test("T-252 runtime schema metadata refuses missing, duplicate, extra, divergent, and reordered rows", () => {
  assertRuntimeSchemaMutationRefuses(
    (rows) => rows.pop(),
    /does not exactly match Module containment/u
  );
  assertRuntimeSchemaMutationRefuses(
    (rows) => rows.push(cloneJson(rows[0])),
    /contains a duplicate tuple/u
  );
  assertRuntimeSchemaMutationRefuses(
    (rows) =>
      rows[0].entries.push({ key: "schemaId", value: "generated-not-source" }),
    /must have exact ordered keys/u
  );
  assertRuntimeSchemaMutationRefuses(
    (rows) => {
      const contractId = rows[0].entries.find(
        (entry) => entry.key === "contractId"
      );
      contractId.value = "abg.schema.divergent";
    },
    /does not exactly match Module containment/u
  );
  assertRuntimeSchemaMutationRefuses(
    (rows) => rows.reverse(),
    /does not exactly match Module containment/u
  );
});

test("T-260 HOF arrays are pure and compile one exact structural relation", () => {
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
  assert.equal(compilation.accepted, true);
  assert.equal(compilation.diagnostics.length, 0);
  assert.equal(compilation.relation.kind, "compiled_hof_fan_out_relation");
  assert.equal(compilation.relation.hostGraphFunctionRef, bodyFunctions.reviewPanel.id);
  assert.equal(compilation.relation.childGraphFunctionRef, bodyFunctions.reviewOneProfile.id);
  assert.equal(compilation.relation.inputVectorNodeRef, nodes.reviewerAssignments.id);
  assert.equal(compilation.relation.outputVectorNodeRef, nodes.attributedFindings.id);
});

test("T-262 fan-in and direct recursion compile to distinct structural relations", () => {
  const bodyFunctions = ABG_CONSENSUS_GTL_BODY.graphFunctions;
  const fanIn = compileGraphFunctionApplication({
    graphFunction: bodyFunctions.reducePanelFacts,
    graphFunctions: graphFunctions()
  });
  assert.equal(fanIn.observed, true);
  assert.equal(fanIn.accepted, true);
  assert.equal(fanIn.diagnostics.length, 0);
  assert.equal(fanIn.lineage.orderedSteps[0].operatorKind, "fan_in");
  assert.equal(fanIn.fanInRelation.reducerGraphFunctionRef, bodyFunctions.exactPanelFacts.id);

  const recursion = compileGraphFunctionApplication({
    graphFunction: bodyFunctions.boundedRounds,
    graphFunctions: graphFunctions()
  });
  assert.equal(recursion.observed, true);
  assert.equal(recursion.accepted, true);
  assert.equal(recursion.lineage.orderedSteps[0].operatorKind, "recurse");
  assert.equal(recursion.lineage.orderedSteps[0].operandGraphFunctionRef, bodyFunctions.round.id);
  assert.equal(recursion.fanInRelation, null);
  assert.equal(recursion.recurseRelation.operandGraphFunctionRef, bodyFunctions.round.id);
  assert.equal(recursion.recurseRelation.foldbackMode, "rebind");
  assert.equal(recursion.recurseRelation.foldbackRequiresParentEvaluation, true);
  assert.deepEqual(recursion.diagnostics, []);

  const recurseDeclaration =
    graphFunctionApplicationDeclarationFromDeclarations(
      bodyFunctions.boundedRounds.declarations,
      bodyFunctions.boundedRounds.id
    );
  assert.equal(recurseDeclaration.operatorKind, "recurse");
  assert.deepEqual(
    recurseDeclaration.terminationEvaluator.tags.filter((tag) =>
      tag.startsWith("terminal:")
    ),
    ["terminal:closed_done", "terminal:escalate_fh"]
  );
  assert.deepEqual(
    Object.fromEntries(
      recurseDeclaration.foldback.additional.entries.map((entry) => [
        entry.key,
        entry.value.kind === "scalar" ? entry.value.value : null
      ])
    ),
    {
      foldback_law: "append_outcome_preserve_cumulative_lineage",
      foldback_outcome: "recurse_next_round"
    }
  );
});

test("T-252 F_H leaves target the admitted round disposition, never a held-state value", () => {
  const roundVectors = vectors(ABG_CONSENSUS_GTL_BODY.graphFunctions.round);
  const rows = ["consensus.fh-initial", "consensus.fh-post-submitter"].map(
    (name) => roundVectors.find((vector) => vector.name === name)
  );
  for (const row of rows) {
    assert.ok(row);
    assert.equal(row.target.id, ABG_CONSENSUS_GTL_BODY.nodes.roundDisposition.id);
    assert.equal(row.target.schema.ref, "schema://abg/consensus/round-disposition");
    assert.equal(row.operators.length, 1);
    assert.equal(row.operators[0].regime, "F_H");
    assert.equal(row.rule.config.entries.length, 1);
    assert.equal(row.rule.config.entries[0].key, "outcome");
    assert.equal(row.rule.config.entries[0].value.kind, "scalar");
    assert.equal(row.rule.config.entries[0].value.value, "escalate_fh");
  }

  const projectResult = vectors(
    ABG_CONSENSUS_GTL_BODY.graphFunctions.consensus
  ).find((vector) => vector.name === "consensus.project-result");
  assert.ok(projectResult);
  assert.equal(projectResult.rule.config.entries.length, 1);
  assert.equal(projectResult.rule.config.entries[0].key, "outcome");
  assert.equal(projectResult.rule.config.entries[0].value.kind, "string_list");
  assert.deepEqual(projectResult.rule.config.entries[0].value.value, [
    "closed_done",
    "escalate_fh"
  ]);
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
      assert.equal(compilation.accepted, true);
      assert.ok(compilation.binding, `${graphFunction.name}/${vector.name}`);
      assert.equal(compilation.selectedCandidates.length, 1);
      assert.equal(compilation.selectedProgramDiagnostics.length, 0);
      assert.deepEqual(compilation.diagnostics, []);
    }
  }
  assert.equal(selectedVectorCount, 34);
});

test("T-261 direct retry and workflow programs lower without changing T-252", () => {
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
    0
  );
  assert.equal(
    diagnosticIds.filter((value) => value === "gtl-c-unrealized-workflow-lift")
      .length,
    0
  );
  assert.equal(
    rows.filter(
      (row) =>
        row.compilation.accepted &&
        row.compilation.program?.workflow?.kind === "hog_workflow_lift"
    ).length,
    3
  );
  assert.equal(
    rows.filter(
      (row) =>
        row.compilation.accepted &&
        row.compilation.program?.retry?.kind === "hog_retry_declaration"
    ).length,
    1
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
    assert.doesNotThrow(
      () => compileExecutionDeclarations(graphFunction),
      `${graphFunction.name} must preserve its open authored C program`
    );
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

test("T-252 probe derives compiler and isolated runtime observations without widening the static claim", () => {
  const manifestPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../fixtures/t252_consensus_probe_manifest.json"
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.version, 5);
  assert.deepEqual(
    {
      sourceCount: manifest.runtimeSchemaAdmission.sourceCount,
      directSourceCount: manifest.runtimeSchemaAdmission.directSourceCount,
      vectorSourceCount: manifest.runtimeSchemaAdmission.vectorSourceCount,
      publicSourceCount: manifest.runtimeSchemaAdmission.publicSourceCount,
      privateSourceCount: manifest.runtimeSchemaAdmission.privateSourceCount,
      metadataRowCount: manifest.runtimeSchemaAdmission.metadataRowCount,
      uniqueTupleCount: manifest.runtimeSchemaAdmission.uniqueTupleCount,
      referencedSourceCount:
        manifest.runtimeSchemaAdmission.referencedSourceCount,
      pendingInteractionSourcePresent:
        manifest.runtimeSchemaAdmission.pendingInteractionSourcePresent,
      exactContainmentCoverage:
        manifest.runtimeSchemaAdmission.exactContainmentCoverage
    },
    {
      sourceCount: 15,
      directSourceCount: 13,
      vectorSourceCount: 2,
      publicSourceCount: 3,
      privateSourceCount: 12,
      metadataRowCount: 34,
      uniqueTupleCount: 34,
      referencedSourceCount: 15,
      pendingInteractionSourcePresent: false,
      exactContainmentCoverage: true
    }
  );
  assert.match(
    manifest.runtimeSchemaAdmission.metadataRowsDigest,
    /^sha256:[0-9a-f]{64}$/u
  );
  assert.equal(manifest.structuralContracts.pendingInteractionNodePresent, false);
  assert.equal(manifest.structuralContracts.fhTargetRows.length, 2);
  assert.equal(
    manifest.structuralContracts.fhTargetRows.every(
      (row) =>
        row.targetSchemaRef ===
          "schema://abg/consensus/round-disposition" &&
        row.outcome === "escalate_fh"
    ),
    true
  );
  assert.deepEqual(manifest.structuralContracts.recursePartition, {
    terminalOutcomes: ["closed_done", "escalate_fh"],
    foldbackOutcome: "recurse_next_round",
    projectedTerminalOutcomes: ["closed_done", "escalate_fh"],
    disjointAndExhaustive: true
  });
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
  assert.deepEqual([...observed].sort(), [
    "tenant_conformance_manifest_consensus_coverage_missing"
  ]);
  assert.equal(
    manifest.compiler.completeProgramPlanCount,
    manifest.body.selectedVectorPathCount
  );
  assert.equal(
    manifest.compiler.completeProgramRows.length,
    manifest.body.selectedVectorPathCount
  );
  assert.deepEqual(manifest.compiler.t271RuntimeSurface, {
    completeProgramCompiler: true,
    completeProgramPlanAssertion: true,
    completeProgramInterpreter: true,
    everySelectedVectorHasExactPlan: true,
    everyAuthoredProgramIsSelectedAndPlanned: true
  });
  assert.equal(observed.has("complete_c_program_interpreter"), false);
  assert.equal(
    manifest.compiler.mappedFullConformanceIssueCount,
    manifest.compiler.fullConformanceIssueCount
  );
  assert.equal(manifest.compiler.unmappedFullConformanceIssueCount, 0);
  assert.equal(
    manifest.compiler.fullConformanceIssues.length,
    manifest.compiler.fullConformanceIssueCount
  );
  assert.equal(
    manifest.compiler.fullConformanceIssues.every((issue) =>
      observed.has(issue.gapFamily)
    ),
    true
  );
  assert.equal(
    manifest.compiler.mappedNormalizedSemanticIssueCount,
    manifest.compiler.normalizedSemanticIssueCount
  );
  assert.equal(manifest.compiler.unmappedNormalizedSemanticIssueCount, 0);
  assert.equal(
    manifest.compiler.normalizedSemanticIssues.every((issue) =>
      observed.has(issue.gapFamily)
    ),
    true
  );
  assert.equal(manifest.compiler.traversalExecutionContractCount, 35);
  assert.equal(manifest.compiler.traversalConformanceIssueCount, 0);
  assert.equal(manifest.compiler.traversalAdmissionRows.length, 35);
  assert.equal(
    manifest.compiler.traversalAdmissionRows.some(
      (row) => row.status === "invalid"
    ),
    false
  );
  assert.equal(
    manifest.compiler.traversalAdmissionRows.every(
      (row) => row.effectsPermitted === false
    ),
    true
  );
  assert.equal(observed.has("declared_program_conservation"), false);
  assert.equal(observed.has("traversal_execution_contracts"), false);
  assert.equal(
    manifest.ownership.activeOwnedButNotObservedFamilies.some((family) =>
      observed.has(family)
    ),
    false
  );
  assert.equal(manifest.ownership.unownedGapCount, 0);
  assert.equal(manifest.ownership.duplicateOwnerCount, 0);

  assert.equal(manifest.compiler.t262RuntimeSurface.resolveTypedRecurse, true);
  assert.equal(
    manifest.compiler.t262RuntimeSurface.uniquePostSubmitterRecurseRouteRef,
    "graph-vector://abg/consensus/recurse-post-submitter"
  );
  assert.equal(
    manifest.compiler.t262RuntimeSurface.canonicalApplicationsObserved,
    2
  );
  assert.equal(
    manifest.compiler.t262RuntimeSurface.priorEvidencePreserved,
    true
  );
  assert.equal(
    manifest.compiler.t262RuntimeSurface.publicEffectsPermitted,
    false
  );
  assert.ok(
    manifest.compiler.t262RuntimeSurface.canonicalHandoffStatuses.every(
      (status) =>
        status === "blocked_capability" ||
        status === "published_startup_blocked"
    )
  );

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
  assert.ok(manifest.compiler.fpResultContractAdmissionRows.length > 0);
  assert.equal(
    manifest.compiler.fpResultContractAdmissionRows.every(
      (row) =>
        row.profile === "standard_live_review" &&
        row.status === "admitted" &&
        row.failureClass === null &&
        /^sha256:[0-9a-f]{64}$/u.test(row.payloadDigest)
    ),
    true
  );
  assert.equal(
    observed.has("fp_result_contract_admission"),
    false
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
