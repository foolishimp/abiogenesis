// Validates: REQ-P-CONSENSUS-001/-002/-006/-008/-009/-011/-017.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ABG_CONSENSUS_GRAPH_FUNCTION_REF,
  ABG_CONSENSUS_GTL_PROGRAM,
  ABG_CONSENSUS_PROGRAM_REFS,
  ABG_CONSENSUS_SCHEMA_REFS
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_program.js";
import {
  compileGraphVectorCProgramSelection,
  compileHofRelation,
  constructAbgFnCompositionDeclarations,
  resolveAbgFnCompositionSelection,
  selectedAbgFnRegimeBindingForCompute
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import { materializeGraphFunction } from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  canonicalJson,
  deriveCompilerCoverage,
  deriveRuntimeAuthorityObservation,
  deriveSuccessorRouting,
  loadT252GapOwnership,
  parseT252GapOwnership,
  resolveT252CensusAddress,
  deriveT252ConsensusGtlCensus
} from "../tools/t252_consensus_gtl_census.mjs";

const body = ABG_CONSENSUS_GTL_PROGRAM;
const bodyDigest = stableSha256Digest(serializeModule(body.module));

function functionNamed(name) {
  const matches = body.submittedGraphFunctions.filter(
    (graphFunction) => graphFunction.name === name
  );
  assert.equal(matches.length, 1, `expected one GraphFunction named ${name}`);
  return matches[0];
}

function schemaRef(node) {
  assert.equal(node.schema.kind, "symbolic");
  return node.schema.ref;
}

function routeOf(vector) {
  const entry = vector.rule?.config.entries.find(
    (candidate) => candidate.key === "consensus.route"
  );
  return entry?.value.kind === "scalar" ? entry.value.value : null;
}

function fnCompositionPolicyContextRefs(vector) {
  const entry = vector.declarations.entries.find(
    (candidate) => candidate.key === "abg.fn_composition"
  );
  assert.notEqual(entry, undefined);
  assert.equal(entry.value.kind, "hook_ref");
  const policyContextRefs = entry.value.value.config.entries.find(
    (candidate) => candidate.key === "policy_context_refs"
  );
  assert.notEqual(policyContextRefs, undefined);
  assert.equal(policyContextRefs.value.kind, "string_list");
  return policyContextRefs.value.value;
}

test("T-252 admits one canonical Consensus GTL body under the SYSTEM identity", () => {
  assert.equal(body.kind, "consensus_gtl_program");
  assert.equal(body.rootGraphFunction.id, ABG_CONSENSUS_GRAPH_FUNCTION_REF);
  assert.equal(body.rootGraphFunction.name, ABG_CONSENSUS_GRAPH_FUNCTION_REF);
  assert.deepEqual(
    body.rootGraphFunction.inputs.map(schemaRef),
    [ABG_CONSENSUS_SCHEMA_REFS.subject]
  );
  assert.deepEqual(
    body.rootGraphFunction.outputs.map(schemaRef),
    [ABG_CONSENSUS_SCHEMA_REFS.result]
  );
  assert.equal(body.submittedGraphFunctions.length, 7);
  assert.equal(body.authoringBoundaryRefs.length, 7);
  assert.equal(new Set(body.authoringBoundaryRefs).size, 7);
  assert.equal(body.cPrograms.length, 21);
  assert.equal(new Set(body.cPrograms.map((program) => program.programRef)).size, 21);

  const submittedNames = body.submittedGraphFunctions.map(
    (graphFunction) => graphFunction.name
  );
  assert.equal(
    submittedNames.filter(
      (name) => name === "graph-function://abg/consensus/review-one-profile"
    ).length,
    1
  );
  assert.equal(
    submittedNames.filter(
      (name) => name === "graph-function://abg/consensus/round"
    ).length,
    1
  );
  assert.equal(
    submittedNames.filter(
      (name) => name === "graph-function://abg/consensus/exact-panel-facts"
    ).length,
    1
  );
  assert.equal(
    submittedNames.filter(
      (name) => name === "fan_out(graph-function://abg/consensus/review-one-profile)"
    ).length,
    1
  );
});

test("T-252 native serialization and raw admission retain one immutable body digest", () => {
  const raw = serializeModule(body.module);
  const admitted = admitModule(
    globalThis.structuredClone(raw),
    "T-252 raw round trip"
  );
  assert.deepEqual(serializeModule(admitted), raw);
  assert.equal(bodyDigest, stableSha256Digest(raw));
  assert.equal(
    bodyDigest,
    "sha256:28edf21a9f68cda111308db4bb1030dda3c68441554210991f2b1c1657506b5e"
  );
  assert.match(bodyDigest, /^sha256:[0-9a-f]{64}$/u);
});

test("T-252 uses the exact typed fan-out relation without a second selector", () => {
  const child = functionNamed(
    "graph-function://abg/consensus/review-one-profile"
  );
  const host = functionNamed(
    "fan_out(graph-function://abg/consensus/review-one-profile)"
  );
  const hostGraph = materializeGraphFunction(host);
  assert.equal(hostGraph.vectors.length, 1);
  assert.deepEqual(hostGraph.vectors[0].declarations.entries, []);
  assert.deepEqual(host.inputs.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.reviewerAssignmentVector
  ]);
  assert.deepEqual(host.outputs.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.attributedFindingsVector
  ]);
  assert.deepEqual(child.inputs.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.reviewerAssignment
  ]);
  assert.deepEqual(child.outputs.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.reviewFindings
  ]);

  const compilation = compileHofRelation({
    graphFunction: host,
    graphFunctions: body.submittedGraphFunctions
  });
  assert.equal(compilation.observed, true);
  assert.equal(compilation.accepted, false);
  assert.deepEqual(
    compilation.diagnostics.map((row) => [
      row.classification,
      row.diagnosticId
    ]),
    [["semantic_not_realized", "gtl-hof-unrealized-fan-out"]]
  );
});

test("T-252 binds the exact GraphFunction/vector/program matrix", () => {
  const roundPrograms = Object.freeze({
    expand_panel: ABG_CONSENSUS_PROGRAM_REFS.expandPanel,
    review_panel: ABG_CONSENSUS_PROGRAM_REFS.reviewPanelLift,
    collect_exact_panel_facts: ABG_CONSENSUS_PROGRAM_REFS.exactPanelFactsLift,
    reduce_initial_semantics:
      ABG_CONSENSUS_PROGRAM_REFS.initialSemanticReduction,
    route_initial_closed: ABG_CONSENSUS_PROGRAM_REFS.initialClosedRoute,
    request_submitter_response: ABG_CONSENSUS_PROGRAM_REFS.submitterResponse,
    route_initial_fh: ABG_CONSENSUS_PROGRAM_REFS.initialFhRoute,
    reassess_after_submitter:
      ABG_CONSENSUS_PROGRAM_REFS.semanticReassessment,
    route_post_submitter_closed:
      ABG_CONSENSUS_PROGRAM_REFS.postSubmitterClosedRoute,
    route_post_submitter_recurse:
      ABG_CONSENSUS_PROGRAM_REFS.postSubmitterRecurseRoute,
    route_post_submitter_fh:
      ABG_CONSENSUS_PROGRAM_REFS.postSubmitterFhRoute,
    hold_pending_fh_interaction: ABG_CONSENSUS_PROGRAM_REFS.fhPending,
    admit_closed_round_disposition:
      ABG_CONSENSUS_PROGRAM_REFS.closedDispositionToRound,
    admit_recurse_round_disposition:
      ABG_CONSENSUS_PROGRAM_REFS.recurseDispositionToRound
  });
  const expected = new Map([
    [
      ABG_CONSENSUS_GRAPH_FUNCTION_REF,
      {
        seed_first_round: ABG_CONSENSUS_PROGRAM_REFS.seedRound,
        run_bounded_rounds: ABG_CONSENSUS_PROGRAM_REFS.boundedRoundsLift,
        select_closed_round_disposition:
          ABG_CONSENSUS_PROGRAM_REFS.selectClosedDisposition,
        project_closed_result: ABG_CONSENSUS_PROGRAM_REFS.projectResult,
        admit_closed_consensus_result:
          ABG_CONSENSUS_PROGRAM_REFS.closedResultToResult
      }
    ],
    ["graph-function://abg/consensus/round", roundPrograms],
    ["recurse(graph-function://abg/consensus/round)", roundPrograms],
    [
      "graph-function://abg/consensus/review-one-profile",
      { review_one_profile: ABG_CONSENSUS_PROGRAM_REFS.reviewOneProfile }
    ],
    [
      "fan_out(graph-function://abg/consensus/review-one-profile)",
      {
        "fan_out(graph-function://abg/consensus/review-one-profile):wrapper": null
      }
    ],
    [
      "graph-function://abg/consensus/exact-panel-facts",
      { project_exact_panel_facts: ABG_CONSENSUS_PROGRAM_REFS.exactPanelFacts }
    ],
    [
      "fan_in(graph-function://abg/consensus/exact-panel-facts)",
      { project_exact_panel_facts: ABG_CONSENSUS_PROGRAM_REFS.exactPanelFacts }
    ]
  ]);

  assert.deepEqual(
    body.submittedGraphFunctions.map((graphFunction) => graphFunction.name),
    [...expected.keys()]
  );
  for (const graphFunction of body.submittedGraphFunctions) {
    const expectedVectors = expected.get(graphFunction.name);
    assert.notEqual(expectedVectors, undefined);
    const graph = materializeGraphFunction(graphFunction);
    assert.deepEqual(
      graph.vectors.map((graphVector) => graphVector.name),
      Object.keys(expectedVectors)
    );
    for (const graphVector of graph.vectors) {
      const compilation = compileGraphVectorCProgramSelection({
        graphFunction,
        graphVector
      });
      const expectedProgramRef = expectedVectors[graphVector.name];
      assert.equal(
        compilation.binding?.selectedProgramRef ?? null,
        expectedProgramRef,
        `${graphFunction.name}::${graphVector.name}`
      );
      assert.equal(
        compilation.diagnostics.some(
          (diagnostic) => diagnostic.classification === "invalid_program"
        ),
        false
      );
      assert.deepEqual(
        graphVector.declarations.entries.map((entry) => entry.key),
        expectedProgramRef === null
          ? []
          : ["abg.hog_program_ref", "abg.fn_composition"]
      );
    }
  }
});

test("T-252 separates same-call retry from semantic round recursion", () => {
  const retryPrograms = body.cPrograms.filter(
    (program) => program.term.kind === "c_retry"
  );
  const workflowPrograms = body.cPrograms.filter(
    (program) => program.term.kind === "c_workflow"
  );
  assert.equal(retryPrograms.length, 1);
  assert.equal(workflowPrograms.length, 3);
  assert.equal(retryPrograms[0].programRef, ABG_CONSENSUS_PROGRAM_REFS.reviewOneProfile);
  assert.equal(retryPrograms[0].term.budget, 2);
  assert.equal(retryPrograms[0].term.term.kind, "c_of");
  assert.equal(retryPrograms[0].term.term.fibre, "F_P");
  assert.equal(
    JSON.stringify(body.cPrograms).includes('"kind":"c_batch"'),
    false
  );

  const reviewOne = functionNamed(
    "graph-function://abg/consensus/review-one-profile"
  );
  const reviewVector = materializeGraphFunction(reviewOne).vectors[0];
  assert.deepEqual(
    fnCompositionPolicyContextRefs(reviewVector).filter((ref) =>
      ref.startsWith("failure-class://abg/")
    ),
    [
      "failure-class://abg/transport_failure",
      "failure-class://abg/no_output",
      "failure-class://abg/contract_failure"
    ]
  );

  const bounded = functionNamed("recurse(graph-function://abg/consensus/round)");
  const recursion = bounded.declarations.entries.find(
    (entry) => entry.key === "recursion"
  );
  assert.notEqual(recursion, undefined);
  assert.equal(bounded.name.startsWith("recurse("), true);
});

test("T-252 surfaces generic derived-host composition rebinding before use", () => {
  const resolved = [];
  const hostMismatches = [];
  for (const graphFunction of body.submittedGraphFunctions) {
    for (const vector of materializeGraphFunction(graphFunction).vectors) {
      const programSelection = compileGraphVectorCProgramSelection({
        graphFunction,
        graphVector: vector
      });
      if (programSelection.binding === null) {
        continue;
      }
      const program = body.cPrograms.find(
        (candidate) =>
          candidate.programRef === programSelection.binding.selectedProgramRef
      );
      assert.notEqual(program, undefined);
      const leaf = program.term.kind === "c_retry" ? program.term.term : program.term;
      const stageRole = leaf.kind === "c_of" ? leaf.stageRole : "transform";
      let selection;
      try {
        selection = resolveAbgFnCompositionSelection({
          graphFunction,
          vector
        });
      } catch (error) {
        assert.match(String(error), /host_graph_function_ref mismatch/u);
        hostMismatches.push({
          graphFunctionRef: graphFunction.name,
          graphVectorRef: vector.name
        });
        continue;
      }
      const binding = selectedAbgFnRegimeBindingForCompute({
        selection,
        stageRole,
        computeMeans: vector.operators[0]?.regime ?? null
      });
      assert.notEqual(binding, null);
      resolved.push({
        graphFunctionRef: graphFunction.name,
        graphVectorRef: vector.name,
        role: binding.role,
        authority: binding.authority,
        stageRole: binding.stageRole,
        regime: binding.regime
      });
    }
  }
  assert.equal(resolved.length, 21);
  assert.equal(hostMismatches.length, 15);
  assert.deepEqual(
    [...new Set(hostMismatches.map((row) => row.graphFunctionRef))],
    [
      "recurse(graph-function://abg/consensus/round)",
      "fan_in(graph-function://abg/consensus/exact-panel-facts)"
    ]
  );
  assert.deepEqual(
    resolved
      .filter((row) => row.authority === "closure")
      .map((row) => row.graphVectorRef),
    [
      "select_closed_round_disposition",
      "route_initial_closed",
      "route_post_submitter_closed"
    ]
  );
  assert.deepEqual(
    resolved
      .filter((row) => row.regime === "F_H")
      .map((row) => [row.stageRole, row.role, row.authority]),
    [["human_callout", "escalate", "absent"]]
  );
});

test("T-252 routing makes submitter response and reassessment prerequisites to foldback", () => {
  const bounded = functionNamed("recurse(graph-function://abg/consensus/round)");
  const graph = materializeGraphFunction(bounded);
  const initialSchema = ABG_CONSENSUS_SCHEMA_REFS.initialAssessment;
  const postSchema = ABG_CONSENSUS_SCHEMA_REFS.postSubmitterAssessment;

  const initialRecurse = graph.vectors.filter(
    (vector) =>
      vector.source.some((source) => schemaRef(source) === initialSchema) &&
      routeOf(vector) === "recurse_next_round"
  );
  assert.deepEqual(initialRecurse, []);

  const submitter = graph.vectors.find(
    (vector) => vector.name === "request_submitter_response"
  );
  const reassess = graph.vectors.find(
    (vector) => vector.name === "reassess_after_submitter"
  );
  const recurseVector = graph.vectors.find(
    (vector) => vector.name === "route_post_submitter_recurse"
  );
  assert.deepEqual(submitter?.source.map(schemaRef), [initialSchema]);
  assert.equal(schemaRef(submitter.target), ABG_CONSENSUS_SCHEMA_REFS.submitterResponse);
  assert.deepEqual(reassess?.source.map(schemaRef), [
    initialSchema,
    ABG_CONSENSUS_SCHEMA_REFS.submitterResponse,
    ABG_CONSENSUS_SCHEMA_REFS.roundExactProjection,
    ABG_CONSENSUS_SCHEMA_REFS.attributedFindingsVector
  ]);
  assert.equal(schemaRef(reassess.target), postSchema);
  assert.deepEqual(recurseVector?.source.map(schemaRef), [postSchema]);
  assert.equal(routeOf(recurseVector), "recurse_next_round");
});

test("T-252 keeps F_H pending and blocked truth outside graph success", () => {
  const bounded = functionNamed("recurse(graph-function://abg/consensus/round)");
  const graph = materializeGraphFunction(bounded);
  const pending = graph.vectors.find(
    (vector) => vector.name === "hold_pending_fh_interaction"
  );
  assert.equal(pending?.operators[0]?.regime, "F_H");
  const fhProgram = body.cPrograms.find(
    (program) => program.programRef === ABG_CONSENSUS_PROGRAM_REFS.fhPending
  );
  assert.equal(fhProgram?.term.kind, "c_of");
  assert.equal(fhProgram?.term.resultBearing, true);
  assert.equal(schemaRef(pending.target), ABG_CONSENSUS_SCHEMA_REFS.fhPendingAdmission);
  assert.equal(
    graph.vectors.some((vector) =>
      vector.source.some(
        (source) => schemaRef(source) === ABG_CONSENSUS_SCHEMA_REFS.fhPendingAdmission
      )
    ),
    false
  );
  assert.deepEqual(bounded.outputs.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.roundDisposition
  ]);

  const rootGraph = materializeGraphFunction(body.rootGraphFunction);
  const selectClosed = rootGraph.vectors.find(
    (vector) => vector.name === "select_closed_round_disposition"
  );
  assert.equal(routeOf(selectClosed), "closed_done_only");
  assert.deepEqual(selectClosed?.source.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.roundDisposition
  ]);
  assert.equal(
    schemaRef(selectClosed.target),
    ABG_CONSENSUS_SCHEMA_REFS.roundClosedDisposition
  );
  const project = rootGraph.vectors.find(
    (vector) => vector.name === "project_closed_result"
  );
  assert.deepEqual(project?.source.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.roundClosedDisposition
  ]);
  assert.equal(schemaRef(project.target), ABG_CONSENSUS_SCHEMA_REFS.closedResult);
  const publish = rootGraph.vectors.find(
    (vector) => vector.name === "admit_closed_consensus_result"
  );
  assert.deepEqual(publish?.source.map(schemaRef), [
    ABG_CONSENSUS_SCHEMA_REFS.closedResult
  ]);
  assert.equal(schemaRef(publish.target), ABG_CONSENSUS_SCHEMA_REFS.result);
});

test("T-252 authored data contains no runtime worker, backend, transport, or feature plugin authority", () => {
  const raw = JSON.stringify(serializeModule(body.module));
  for (const forbidden of [
    "concrete_worker_identity",
    "concreteWorkerRef",
    "backendRef",
    "transportRef",
    "plugin://abg/consensus",
    "ticket_mutation"
  ]) {
    assert.equal(raw.includes(forbidden), false, forbidden);
  }
  assert.equal(raw.includes("reviewerExecutionSelectionRef"), true);
  assert.equal(raw.includes("submitterTurnBindingRef"), true);
  assert.equal(raw.includes("semanticReducerBindingRef"), true);
  assert.deepEqual(
    [...new Set(body.module.operators.map((operator) => operator.binding))]
      .filter((binding) => binding.startsWith("plugin://"))
      .sort(),
    ["plugin://abg/fh-admission", "plugin://abg/fp-dispatch"]
  );
});

test("T-252 stdlib body uses public construction atoms and no private runtime path", async () => {
  assert.equal(typeof constructAbgFnCompositionDeclarations, "function");
  const source = await readFile(
    new URL(
      "../../code/src/abg/m03/contracts/consensus_gtl_program.ts",
      import.meta.url
    ),
    "utf8"
  );
  assert.match(source, /from "\.\.\/\.\.\/\.\.\/gtl\/m01\/index\.js"/u);
  assert.match(source, /from "\.\.\/\.\.\/\.\.\/gtl\/m02\/index\.js"/u);
  for (const forbidden of [
    "/gtl/m01/algebra/",
    "/gtl/m01/contracts/",
    "/gtl/m02/admission/",
    "/gtl/m02/contracts/",
    "/abg/m03/runner/",
    "/abg/m03/transport/",
    "standard_live_plugins",
    "runAgentTransport",
    "Promise.all"
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }

  const probeSource = await readFile(
    new URL("../tools/t252_consensus_gtl_census.mjs", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(
    probeSource,
    /from\s+["'][^"']*\/(?:abg\/m03\/(?:runner|transport)|app\/m04\/public_sdk)\//u
  );
  assert.doesNotMatch(probeSource, /\b(?:runAgentTransport|runAbg)\s*\(/u);
});

test("T-252 raw mutation, helper omission, duplication, and order cannot preserve the oracle", () => {
  const raw = serializeModule(body.module);
  const admittedUnknown = admitModule({
    ...globalThis.structuredClone(raw),
    invented: true
  });
  assert.deepEqual(serializeModule(admittedUnknown), raw);
  assert.notEqual(
    stableSha256Digest({
      ...globalThis.structuredClone(raw),
      invented: true
    }),
    bodyDigest
  );

  const child = functionNamed(
    "graph-function://abg/consensus/review-one-profile"
  );
  const host = functionNamed(
    "fan_out(graph-function://abg/consensus/review-one-profile)"
  );
  const omitted = compileHofRelation({
    graphFunction: host,
    graphFunctions: body.submittedGraphFunctions.filter(
      (graphFunction) => graphFunction.id !== child.id
    )
  });
  assert.equal(omitted.diagnostics[0]?.diagnosticId, "gtl-hof-unresolved-ref");
  assert.equal(omitted.diagnostics[0]?.classification, "invalid_program");

  const duplicated = compileHofRelation({
    graphFunction: host,
    graphFunctions: [...body.submittedGraphFunctions, child]
  });
  assert.equal(duplicated.diagnostics[0]?.diagnosticId, "gtl-hof-unresolved-ref");
  assert.equal(duplicated.diagnostics[0]?.classification, "invalid_program");

  const reordered = globalThis.structuredClone(raw);
  reordered.graphFunctions = [...reordered.graphFunctions].reverse();
  assert.notEqual(stableSha256Digest(reordered), bodyDigest);
});

test("T-252 census coverage and runtime fences are derived from observations", () => {
  const { report } = deriveT252ConsensusGtlCensus();
  const termManifest = report.probeManifest.filter((row) =>
    row.constructorKind.startsWith("c_")
  );
  const graphOperatorManifest = report.probeManifest.filter((row) =>
    ["fan_out", "fan_in", "recurse"].includes(row.constructorKind)
  );
  const graphEdgeManifest = report.probeManifest.filter(
    (row) => row.constructorKind === "graph_edge"
  );
  const baseInput = {
    termManifest,
    graphOperatorManifest,
    graphEdgeManifest,
    vectorBindings: report.vectorProgramBindings,
    diagnostics: report.diagnostics,
    standaloneDiagnostics: report.directDiagnosticReconciliation
      .filter((row) => row.reconciliationStatus === "standalone_probe_gap")
      .map((row) => report.diagnostics[row.diagnosticOrdinal]),
    rootIssueFamilies: [
      ...new Set(report.rootIssueReconciliation.map((row) => row.gapFamily))
    ],
    unknownFieldRejected: report.rawAdmissionCoverage.unknownFieldRejected,
    unknownFieldMutationDigest:
      report.rawAdmissionCoverage.unknownFieldMutationDigest
  };
  const withoutFanIn = deriveCompilerCoverage({
    ...baseInput,
    graphOperatorManifest: graphOperatorManifest.filter(
      (row) => row.constructorKind !== "fan_in"
    )
  });
  assert.equal(
    withoutFanIn.reliedOnConstructs.some((row) => row.construct === "fan_in"),
    false
  );
  assert.equal(
    withoutFanIn.nonDiagnosticGaps.some(
      (row) => row.construct === "fan_in"
    ),
    false
  );

  const withBatch = deriveCompilerCoverage({
    ...baseInput,
    termManifest: [
      ...termManifest,
      { constructorKind: "c_batch", compilerAccepted: false }
    ]
  });
  assert.equal(
    withBatch.nonDiagnosticGaps.some(
      (row) => row.construct === "fan_out_to_C.batch"
    ),
    false
  );

  const owningJoin = report.compilerCoverage.nonDiagnosticGaps.find(
    (row) => row.gapFamily === "composition_owning_declaration_join"
  );
  assert.equal(owningJoin?.observationClass, "compiler_observability_gap");
  assert.equal(owningJoin?.authoredPairCount, 36);
  assert.equal(owningJoin?.authoredEqualPairCount, 36);
  const mismatchedOwningRef = deriveCompilerCoverage({
    ...baseInput,
    graphEdgeManifest: graphEdgeManifest.map((row, index) =>
      index === 0
        ? {
            ...row,
            compositionOwningDeclarationRef: "gtl://fixture/not-selected"
          }
        : row
    )
  }).nonDiagnosticGaps.find(
    (row) => row.gapFamily === "composition_owning_declaration_join"
  );
  assert.equal(mismatchedOwningRef?.authoredPairCount, 36);
  assert.equal(mismatchedOwningRef?.authoredEqualPairCount, 35);

  const runtimeMutation = deriveRuntimeAuthorityObservation(
    { ...serializeModule(body.module), backendRef: "backend://invented" },
    "public atom source"
  );
  assert.equal(runtimeMutation.moduleFenceCounts.backendRef, 1);
  assert.equal(runtimeMutation.noRuntimeAuthorityObserved, false);

  const raw = serializeModule(body.module);
  const structuralMutations = [
    {
      expected: { moduleJobs: 1 },
      raw: {
        ...globalThis.structuredClone(raw),
        jobs: [{ name: "job://fixture" }]
      }
    },
    {
      expected: { moduleRoles: 1 },
      raw: {
        ...globalThis.structuredClone(raw),
        roles: [{ name: "role://fixture" }]
      }
    },
    {
      expected: { graphEffects: 1 },
      raw: {
        ...globalThis.structuredClone(raw),
        graphFunctions: raw.graphFunctions.map((graphFunction, index) =>
          index === 0
            ? { ...graphFunction, effects: [{ name: "effect://fixture" }] }
            : graphFunction
        )
      }
    }
  ];
  for (const mutation of structuralMutations) {
    const observation = deriveRuntimeAuthorityObservation(
      mutation.raw,
      "public atom source"
    );
    assert.equal(observation.noRuntimeAuthorityObserved, false);
    assert.deepEqual(
      Object.fromEntries(
        Object.keys(mutation.expected).map((key) => [
          key,
          observation.declaredCarrierCounts[key]
        ])
      ),
      mutation.expected
    );
  }
  const unexpectedImport = deriveRuntimeAuthorityObservation(
    raw,
    'import { executeConsensus } from "./service.js"; executeConsensus();'
  );
  assert.deepEqual(unexpectedImport.unexpectedSourceImports, ["./service.js"]);
  assert.equal(unexpectedImport.sourceFenceCounts.executeConsensus, 2);
  assert.equal(unexpectedImport.noRuntimeAuthorityObserved, false);
});

test("T-252 persists a total path-addressed frontier census with bounded runtime observation", async () => {
  const { report, fullRootReport } = deriveT252ConsensusGtlCensus();
  const persisted = await readFile(
    new URL("../fixtures/t252_consensus_gtl_census.json", import.meta.url),
    "utf8"
  );
  assert.equal(persisted, canonicalJson(report));
  assert.equal(report.bodyDigest, bodyDigest);
  assert.equal(
    report.probeManifestDigest,
    "sha256:a79aae12b11f833ea617701affd7c5ec10511e5ba87c0701297e40d93fdf600b"
  );
  assert.deepEqual(report.diagnosticCounts, {
    "abg-fn-composition-host-mismatch": 15,
    "gtl-c-unrealized-retry": 1,
    "gtl-c-unrealized-vector-program-selection": 36,
    "gtl-c-unrealized-workflow-lift": 5,
    "gtl-hof-unrealized-fan-out": 1
  });
  assert.deepEqual(
    report.diagnostics
      .filter((diagnostic) => diagnostic.classification === "invalid_program")
      .map((diagnostic) => diagnostic.gapFamily),
    Array(15).fill("derived_graph_function_composition_host_rebinding")
  );
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(
        Object.groupBy(report.probeManifest, (row) => row.constructorKind)
      ).map(([kind, rows]) => [kind, rows.length])
    ),
    {
      c_of: 31,
      c_retry: 1,
      c_workflow: 5,
      fan_in: 1,
      fan_out: 1,
      full_root_graph_vector_subject: 37,
      global_compiler_coverage_subject: 6,
      graph_edge: 37,
      graph_vector_program_selection: 36,
      recurse: 1
    }
  );
  assert.equal(report.probeManifest.length, 156);
  assert.equal(report.vectorProgramBindings.length, 36);
  assert.equal(report.fullRootIssueCount, fullRootReport.issues.length);
  assert.equal(report.fullRootIssueLedger.length, fullRootReport.issues.length);
  assert.equal(
    report.rootIssueReconciliation.length,
    fullRootReport.issues.length
  );
  assert.equal(report.rootIssueReconciliationTotal, true);
  assert.equal(
    report.rootIssueReconciliation.every((row) => row.manifestRef !== null),
    true
  );
  assert.equal(report.fullRootReportDigest, stableSha256Digest(fullRootReport));
  assert.deepEqual(report.censusIntegrity, {
    baselineRawAdmitted: true,
    directDiagnosticMetadataComplete: true,
    globalRootLinksComplete: true,
    rawAddressRowCount: 150,
    rawAddressesResolve: true,
    rootIssueMetadataComplete: true,
    rootIssueReconciliationExactlyOnce: true
  });
  assert.equal(
    report.diagnostics.every(
      (diagnostic) =>
        Array.isArray(diagnostic.evidenceRefs) &&
        Array.isArray(diagnostic.authorityRefs) &&
        Array.isArray(diagnostic.repairAffordances) &&
        stableSha256Digest(diagnostic.evidenceRefs) ===
          diagnostic.evidenceRefsDigest &&
        /^sha256:[0-9a-f]{64}$/u.test(diagnostic.actualRelationDigest) &&
        (diagnostic.actualRelation === null ||
          stableSha256Digest(diagnostic.actualRelation) ===
            diagnostic.actualRelationDigest)
    ),
    true
  );
  assert.equal(report.runtimeAuthorityObservation.noRuntimeAuthorityObserved, true);
  assert.match(
    report.runtimeAuthorityObservation.observationScope,
    /not_comprehensive_static_analysis/u
  );
  assert.deepEqual(report.runtimeAuthorityObservation.declaredCarrierCounts, {
    graphEffects: 0,
    moduleJobs: 0,
    moduleRoles: 0
  });
  assert.deepEqual(
    Object.values(report.runtimeAuthorityObservation.sourceFenceCounts),
    [0, 0, 0, 0, 0, 0, 0]
  );
  assert.deepEqual(
    Object.values(report.runtimeAuthorityObservation.moduleFenceCounts),
    [0, 0, 0, 0, 0, 0]
  );
  assert.deepEqual(
    report.compilerCoverage.nonDiagnosticGaps.map((row) => [
      row.construct,
      row.observationClass
    ]),
    [
      ["recurse", "compiler_observability_gap"],
      ["fan_in", "compiler_observability_gap"],
      ["fan_out_to_C.batch", "design_relation_gap"],
      ["F_H_pending_to_runtime_held", "design_relation_gap"],
      ["recurse_policy_budget_foldback_join", "design_relation_gap"],
      ["retry_allowlist_join", "design_relation_gap"],
      ["carrier_field_indirection", "design_relation_gap"],
      ["composition_owning_declaration_join", "compiler_observability_gap"],
      ["declared_instruction_protocol_join", "design_relation_gap"],
      ["fp_result_contract_admission", "design_relation_gap"],
      ["raw_module_unknown_field_rejection", "mutation_observed_gap"]
    ]
  );
  assert.deepEqual(
    report.compilerCoverage.compilerAcceptedConstructs.map((row) => row.construct),
    ["C.of"]
  );
  assert.equal("runtimeConsumedConstructs" in report.compilerCoverage, false);
  assert.deepEqual(report.rawAdmissionCoverage, {
    admittedBaselineDigest: bodyDigest,
    baselineAdmittedDigest: bodyDigest,
    disposition: "compiler_observability_gap",
    unknownFieldMutationDigest:
      "sha256:51abdebf396fa4731e8a6dda906a505c359a921ce1ef9ecafff89dcf79cdce21",
    unknownFieldRejected: false
  });
  assert.equal(report.closureEligible, false);
  assert.deepEqual(report.closureBlockers, {
    censusIntegrityFailed: false,
    invalidDiagnosticCount: 15,
    runtimeAuthorityObserved: false,
    successorOwnershipIncomplete:
      !report.successorRouting.ownershipDeclarationsExact
  });
  assert.equal(
    report.censusSemantics,
    "first_snapshot_observation_and_design_gap_register_not_self_updating"
  );

  const raw = serializeModule(body.module);
  for (const row of report.probeManifest) {
    const valueAddress = row.rawProgramAddress ?? row.rawBodyAddress;
    if (valueAddress === undefined) continue;
    const observed = resolveT252CensusAddress(raw, valueAddress);
    assert.equal(
      stableSha256Digest(observed),
      row.rawProgramValueDigest ?? row.rawBodyValueDigest,
      row.manifestRef
    );
    if (row.decodedTermAddress !== undefined) {
      const program = body.cPrograms.find(
        (candidate) => candidate.programRef === row.compilerSubjectRef
      );
      assert.notEqual(program, undefined);
      assert.equal(
        stableSha256Digest(
          resolveT252CensusAddress(program, row.decodedTermAddress)
        ),
        row.canonicalTermDigest,
        row.manifestRef
      );
    }
  }

  const catalogs = new Map(
    Object.values(report.fullRootIssueCatalogs)
      .flat()
      .map((row) => [row.ref, row.value])
  );
  for (const catalog of Object.values(report.fullRootIssueCatalogs)) {
    for (const row of catalog) {
      assert.equal(stableSha256Digest(row.value), row.digest);
    }
  }
  report.fullRootIssueLedger.forEach((row, ordinal) => {
    const source = fullRootReport.issues[ordinal];
    assert.equal(catalogs.get(row.surfaceRefCatalogRef), source.surfaceRef);
    assert.deepEqual(catalogs.get(row.evidenceRefsCatalogRef), source.evidenceRefs);
    assert.deepEqual(
      catalogs.get(row.admissibleRepairsCatalogRef),
      source.admissibleRepairs
    );
    assert.equal(row.kind, source.kind);
    assert.equal(row.severity, source.severity);
    assert.equal(row.messageDigest, stableSha256Digest(source.message));
    if (row.message !== null) assert.equal(row.message, source.message);
    assert.equal(row.authorityRefs.includes(`rule:${source.ruleRef}`), true);
  });

  const globalGroups = report.probeManifest.filter(
    (row) => row.constructorKind === "global_compiler_coverage_subject"
  );
  for (const group of globalGroups) {
    assert.equal(group.issueProbeLinks.length, group.issueOrdinals.length);
    assert.equal(
      group.issueProbeLinks.every(
        (link) => link.linkedProbeManifestRefs.length > 0
      ),
      true
    );
  }
  assert.equal(
    globalGroups
      .filter((row) => !row.gapFamily.startsWith("conformance_"))
      .every((row) => row.linkBasis === "exact_root_surface_ref"),
    true
  );

  const ownership = loadT252GapOwnership();
  assert.equal(ownership.length, 20);
  const routed = deriveSuccessorRouting(
    {
      rootIssueReconciliation: report.rootIssueReconciliation,
      compilerCoverage: report.compilerCoverage
    },
    ownership
  );
  assert.deepEqual(routed, report.successorRouting);
  const mutableOwnershipEvidenceChanged = ownership.map((row, index) => ({
    ...row,
    sourceFileRef: `.ai-workspace/tickets/completed/renamed-${String(index)}.md`,
    sourceLine: row.sourceLine + 1000,
    sourceDigest: `sha256:${String(index).padStart(64, "0")}`
  }));
  const reroutedFromChangedEvidence = deriveSuccessorRouting(
    {
      rootIssueReconciliation: report.rootIssueReconciliation,
      compilerCoverage: report.compilerCoverage
    },
    mutableOwnershipEvidenceChanged
  );
  assert.equal(
    canonicalJson(reroutedFromChangedEvidence),
    canonicalJson(routed)
  );
  assert.doesNotMatch(
    canonicalJson(report.successorRouting),
    /(?:sourceFileRef|sourceLine|sourceDigest|\.ai-workspace\/tickets)/u
  );
  assert.equal(routed.allGapFamiliesOwned, true);
  assert.equal(routed.ownershipDeclarationsExact, true);
  assert.deepEqual(
    routed.rows.find(
      (row) => row.gapFamily === "composition_owning_declaration_join"
    )?.ownerTicketRef,
    "ticket://T-255"
  );
  assert.deepEqual(
    routed.rows.find(
      (row) =>
        row.gapFamily ===
        "derived_graph_function_composition_host_rebinding"
    )?.ownerTicketRef,
    "ticket://T-265"
  );
  assert.equal(
    ownership.every(
      (row) =>
        row.sourceFileRef.startsWith(".ai-workspace/tickets/") &&
        /^sha256:[0-9a-f]{64}$/u.test(row.sourceDigest)
    ),
    true
  );
  assert.equal(
    deriveSuccessorRouting(
      {
        rootIssueReconciliation: report.rootIssueReconciliation,
        compilerCoverage: report.compilerCoverage
      },
      ownership.slice(1)
    ).ownershipDeclarationsExact,
    false
  );
  assert.equal(
    deriveSuccessorRouting(
      {
        rootIssueReconciliation: report.rootIssueReconciliation,
        compilerCoverage: report.compilerCoverage
      },
      [...ownership, ownership[0]]
    ).ownershipDeclarationsExact,
    false
  );
  assert.deepEqual(
    parseT252GapOwnership(
      "## T-252 Census Gap Ownership\n\n- gap_family: sample_gap\n",
      "T-265-sample.md",
      "completed"
    ),
    [
      {
        gapFamily: "sample_gap",
        ownerTicketRef: "ticket://T-265",
        sourceFileRef: ".ai-workspace/tickets/completed/T-265-sample.md",
        sourceLine: 3,
        sourceDigest: stableSha256Digest(
          "## T-252 Census Gap Ownership\n\n- gap_family: sample_gap\n"
        )
      }
    ]
  );
});
