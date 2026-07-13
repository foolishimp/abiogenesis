import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compileCAlgebraToHog } from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import { compileGraphFunctionApplication } from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import { compileGraphVectorCProgramSelection } from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import { compileHofRelation } from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { nodeContractKey } from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const TOOL_PATH = fileURLToPath(import.meta.url);
const TENANT_ROOT = resolve(dirname(TOOL_PATH), "../..");
const REPO_ROOT = resolve(TENANT_ROOT, "../../..");
const BODY_SOURCE = resolve(
  TENANT_ROOT,
  "code/src/abg/m03/contracts/consensus_gtl_body.ts"
);
const OUTPUT_PATH = resolve(
  TENANT_ROOT,
  "test_env/fixtures/t252_consensus_probe_manifest.json"
);
const TICKET_ROOTS = [
  resolve(REPO_ROOT, ".ai-workspace/tickets/active"),
  resolve(REPO_ROOT, ".ai-workspace/tickets/completed")
];
const TICKET_IDS = Array.from({ length: 12 }, (_, index) => `T-${255 + index}`);

const GAP_REQUIREMENTS = Object.freeze({
  c_program_runtime_shape_generalization: [
    "REQ-L-GTL3-C-ALGEBRA",
    "REQ-R-ABG3-CCALL-016"
  ],
  graph_vector_program_runtime_selection: [
    "REQ-L-GTL3-C-ALGEBRA-011/-014/-016",
    "REQ-R-ABG3-CCALL-016"
  ],
  target_carrier_contract: ["REQ-L-GTL3-GRAPHVECTOR"],
  edge_closure_contract: ["REQ-L-GTL3-GRAPHVECTOR"],
  traversal_execution_contracts: ["REQ-R-ABG3-INTERPRET"],
  composition_owning_declaration_join: ["REQ-R-ABG3-FN-COMP-003"],
  carrier_field_indirection: ["REQ-P-CONSENSUS-004..008A"],
  declared_instruction_protocol_join: ["REQ-P-CONSENSUS-010..012"],
  fp_result_contract_admission: ["REQ-P-CONSENSUS-010..012"],
  fh_pending_runtime_hold: ["REQ-P-CONSENSUS-010..012"],
  workflow_c_runtime: ["REQ-L-GTL3-C-ALGEBRA-006"],
  typed_fan_out_runtime: ["REQ-L-GTL3-HOF"],
  typed_fan_out_batch_projection: ["REQ-L-GTL3-HOF", "REQ-L-GTL3-C-ALGEBRA-007"],
  typed_fan_in_structure_and_runtime: ["REQ-L-GTL3-HOF"],
  c_retry_runtime_and_policy_join: ["REQ-L-GTL3-C-ALGEBRA-008"],
  typed_recurse_policy_and_runtime: ["REQ-L-GTL3-RECURSE"],
  strict_raw_module_admission: ["REQ-L-GTL3-MODULE"],
  conformance_inventory_extraction: ["REQ-R-ABG3-INTERPRET"],
  conformance_scope_proportionality: ["REQ-R-ABG3-INTERPRET"],
  effect_declaration_inventory_enforcement: ["REQ-L-GTL3-GRAPHFUNCTION-005"],
  plugin_handler_declaration_inventory_enforcement: [
    "REQ-L-GTL3-C-ALGEBRA-010/-014/-016"
  ]
});

function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function vectors(graphFunction) {
  return graphFunction.template.kind === "inline_graph"
    ? graphFunction.template.graph.vectors
    : [];
}

function sourceImportClosure(entryPath) {
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
      if (resolved === undefined) {
        throw new TypeError(`unresolved source import ${specifier} from ${path}`);
      }
      pending.push(resolved);
    }
  }
  return [...visited].sort();
}

function ticketPath(ticketId) {
  const matches = TICKET_ROOTS.flatMap((root) =>
    readdirSync(root)
      .filter((name) => name.startsWith(`${ticketId}-`) && name.endsWith(".md"))
      .map((name) => resolve(root, name))
  );
  if (matches.length !== 1) {
    throw new TypeError(
      `${ticketId} must resolve to one active or completed ticket, found ${matches.length}`
    );
  }
  return matches[0];
}

function loadOwnership() {
  const sources = [];
  const byFamily = new Map();
  for (const ticketId of TICKET_IDS) {
    const path = ticketPath(ticketId);
    const source = readFileSync(path, "utf8");
    const section = /## T-252 Census Gap Ownership\n([\s\S]*?)(?=\n## |$)/u.exec(
      source
    )?.[1];
    if (section === undefined && ticketId !== "T-266") {
      throw new TypeError(`${ticketId} lacks T-252 Census Gap Ownership`);
    }
    const families = [
      ...(section ?? "").matchAll(/^- gap_family: ([a-z0-9_]+)$/gmu)
    ].map((match) => match[1]);
    if (families.length === 0 && ticketId !== "T-266") {
      throw new TypeError(`${ticketId} ownership section is empty`);
    }
    const status = path.includes("/completed/") ? "completed" : "active";
    const sourceRef = relative(REPO_ROOT, path);
    sources.push({ ticketId, status, sourceRef, families: [...families].sort() });
    for (const family of families) {
      const prior = byFamily.get(family);
      if (prior !== undefined) {
        throw new TypeError(
          `${family} has duplicate owners ${prior.ticketId} and ${ticketId}`
        );
      }
      byFamily.set(family, { ticketId, status, sourceRef });
    }
  }
  return {
    sources: sources.sort((left, right) => left.ticketId.localeCompare(right.ticketId)),
    byFamily
  };
}

function bounded(value, maxLength = 600) {
  const text = String(value);
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}

function compactRef(value) {
  const text = String(value);
  return text.length <= 240 ? text : `digest-ref:${sha256(text)}`;
}

function normalizedDiagnostic(input) {
  const diagnostic = input.diagnostic;
  const authorityRefs = sortedUnique([
    ...(diagnostic.axiomRef === undefined ? [] : [`axiom:${diagnostic.axiomRef}`]),
    ...(diagnostic.requirementRef === undefined
      ? []
      : [`requirement:${diagnostic.requirementRef}`]),
    ...input.authorityRefs
  ]);
  const evidenceRefs = sortedUnique(
    [...(diagnostic.evidenceRefs ?? []), ...input.evidenceRefs].map(compactRef)
  );
  const actualRelation = bounded(
    diagnostic.actualRelation ?? diagnostic.message ?? input.source
  );
  return Object.freeze({
    source: input.source,
    classification: diagnostic.classification,
    diagnosticId: diagnostic.diagnosticId,
    canonicalBodyPath: input.path,
    compilerPath: diagnostic.path ?? null,
    authorityRefs,
    authorityDigest: stableSha256Digest(authorityRefs),
    expectedRelation: bounded(diagnostic.expectedRelation ?? "declared relation is realized"),
    actualRelation,
    actualRelationDigest: sha256(actualRelation),
    evidenceRefs,
    evidenceDigest: stableSha256Digest(evidenceRefs),
    repairAffordances: sortedUnique([
      ...(diagnostic.repairAffordances ?? []),
      ...(diagnostic.repairAffordance === undefined
        ? []
        : [diagnostic.repairAffordance])
    ])
  });
}

function termKinds(term, counts = new Map()) {
  counts.set(term.kind, (counts.get(term.kind) ?? 0) + 1);
  switch (term.kind) {
    case "c_compose":
      termKinds(term.left, counts);
      termKinds(term.right, counts);
      break;
    case "c_edge":
      termKinds(term.transform, counts);
      termKinds(term.evaluate, counts);
      termKinds(term.consequence, counts);
      break;
    case "c_batch":
      term.tasks.forEach((task) => termKinds(task, counts));
      break;
    case "c_retry":
      termKinds(term.term, counts);
      break;
    case "c_of":
    case "c_identity":
    case "c_workflow":
      break;
  }
  return counts;
}

function conformanceRuleCounts(issues) {
  const counts = new Map();
  for (const issue of issues) {
    counts.set(issue.ruleRef, (counts.get(issue.ruleRef) ?? 0) + 1);
  }
  return [...counts]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([ruleRef, count]) => ({ ruleRef, count }));
}

function gapEvidenceRow(input) {
  return Object.freeze({
    diagnosticIds: sortedUnique(input.diagnosticIds),
    bodyPaths: sortedUnique(input.bodyPaths),
    evidenceRefs: sortedUnique(input.evidenceRefs),
    actualRelation: bounded(input.actualRelation)
  });
}

async function buildManifest() {
  const noExecution = {
    armed: true,
    armedBefore: "body_import_and_m02_admission",
    phases: []
  };
  const sourceClosure = sourceImportClosure(BODY_SOURCE);
  const forbiddenSegments = [
    "/runner/",
    "/transport/",
    "/events/",
    "/app/",
    "/qualification/",
    "/bin/"
  ];
  const forbiddenReachableModules = sourceClosure
    .filter((path) => forbiddenSegments.some((segment) => path.includes(segment)))
    .map((path) => relative(TENANT_ROOT, path));
  if (forbiddenReachableModules.length > 0) {
    throw new TypeError(
      `Consensus body reaches forbidden execution modules: ${forbiddenReachableModules.join(", ")}`
    );
  }

  noExecution.phases.push("observer_armed");
  const bodyModule = await import(
    "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js"
  );
  noExecution.phases.push("body_authored");
  const body = bodyModule.ABG_CONSENSUS_GTL_BODY;
  const serializedModule = serializeModule(body.module);
  const bodyDigest = stableSha256Digest(serializedModule);
  const admittedModule = admitModule(cloneJson(serializedModule));
  noExecution.phases.push("m02_admitted");
  const roundTrip = serializeModule(admittedModule);
  if (JSON.stringify(roundTrip) !== JSON.stringify(serializedModule)) {
    throw new TypeError("canonical Consensus module changed under M02 round-trip");
  }

  const malformedModule = cloneJson(serializedModule);
  malformedModule.unknownT252Field = "strict-admission-probe";
  let unknownFieldMutation;
  try {
    const admittedMutation = admitModule(malformedModule);
    unknownFieldMutation = {
      accepted: true,
      retained: Object.hasOwn(admittedMutation, "unknownT252Field"),
      gapFamily: "strict_raw_module_admission"
    };
  } catch (error) {
    unknownFieldMutation = {
      accepted: false,
      retained: false,
      error: bounded(error),
      gapFamily: null
    };
  }
  if (!unknownFieldMutation.accepted || unknownFieldMutation.retained) {
    throw new TypeError(
      "T-252 expects the named T-263 lossiness gap until strict M02 admission closes"
    );
  }

  const graphFunctions = admittedModule.graphFunctions;
  const diagnostics = [];
  const hofRows = [];
  const applicationRows = [];
  const vectorRows = [];
  for (const graphFunction of graphFunctions) {
    const graphFunctionIdentity = compactRef(graphFunction.id);
    const graphFunctionPath = `module.graphFunctions[${graphFunction.name}]`;
    const hof = compileHofRelation({ graphFunction, graphFunctions });
    if (hof.observed) {
      hofRows.push({
        graphFunctionName: graphFunction.name,
        graphFunctionIdentity,
        accepted: hof.accepted,
        diagnosticIds: hof.diagnostics.map((row) => row.diagnosticId)
      });
      hof.diagnostics.forEach((diagnostic) =>
        diagnostics.push(
          normalizedDiagnostic({
            source: "hof_relation_compiler",
            path: `${graphFunctionPath}.hof`,
            diagnostic,
            authorityRefs: [
              "requirement:REQ-L-GTL3-HOF",
              "constructor:gtl.hof_application"
            ],
            evidenceRefs: [
              `graph-function:${graphFunctionIdentity}`,
              `body:${bodyDigest}`
            ]
          })
        )
      );
    }

    const application = compileGraphFunctionApplication({
      graphFunction,
      graphFunctions
    });
    if (application.observed) {
      applicationRows.push({
        graphFunctionName: graphFunction.name,
        graphFunctionIdentity,
        accepted: application.accepted,
        operatorKinds:
          application.lineage?.orderedSteps.map((step) => step.operatorKind) ?? [],
        lineageRef:
          application.lineage === null
            ? null
            : compactRef(application.lineage.lineageRef),
        lineageDigest: application.lineage?.lineageDigest ?? null,
        provisionalBindingCount: application.provisionalBindings.length,
        diagnosticIds: application.diagnostics.map((row) => row.diagnosticId)
      });
      application.diagnostics.forEach((diagnostic) =>
        diagnostics.push(
          normalizedDiagnostic({
            source: "graph_function_application_compiler",
            path: `${graphFunctionPath}.application`,
            diagnostic,
            authorityRefs: [
              "requirement:REQ-L-GTL3-GRAPHFUNCTION-011/-012",
              "constructor:gtl.graph_function_application"
            ],
            evidenceRefs: [
              `graph-function:${graphFunctionIdentity}`,
              ...(application.lineage === null
                ? []
                : [`lineage:${compactRef(application.lineage.lineageRef)}`]),
              `body:${bodyDigest}`
            ]
          })
        )
      );
    }

    vectors(graphFunction).forEach((vector, vectorIndex) => {
      const compilation = compileGraphVectorCProgramSelection({
        graphFunction,
        graphVector: vector
      });
      if (!compilation.observed) return;
      const path = `${graphFunctionPath}.vectors[${vectorIndex}:${vector.name}]`;
      vectorRows.push({
        path,
        graphFunctionName: graphFunction.name,
        graphFunctionIdentity,
        graphVectorName: vector.name,
        graphVectorIdentity: compactRef(vector.id),
        selectedProgramRef: compilation.binding?.selectedProgramRef ?? null,
        bindingDigest: compilation.binding?.bindingDigest ?? null,
        accepted: compilation.accepted,
        diagnosticIds: compilation.diagnostics.map((row) => row.diagnosticId),
        selectedProgramDiagnosticIds: compilation.selectedProgramDiagnostics.map(
          (row) => row.diagnosticId
        )
      });
      compilation.diagnostics.forEach((diagnostic) =>
        diagnostics.push(
          normalizedDiagnostic({
            source: "graph_vector_c_program_compiler",
            path,
            diagnostic,
            authorityRefs: [
              `axiom:${diagnostic.axiomRef}`,
              "requirement:REQ-L-GTL3-C-ALGEBRA-011/-014/-016"
            ],
            evidenceRefs: [
              `graph-function:${graphFunctionIdentity}`,
              `graph-vector:${compactRef(vector.id)}`,
              `body:${bodyDigest}`
            ]
          })
        )
      );
      compilation.selectedProgramDiagnostics.forEach((diagnostic) =>
        diagnostics.push(
          normalizedDiagnostic({
            source: "selected_c_program_compiler",
            path: `${path}.selectedProgram`,
            diagnostic,
            authorityRefs: [],
            evidenceRefs: [
              `graph-function:${graphFunctionIdentity}`,
              `graph-vector:${compactRef(vector.id)}`,
              `body:${bodyDigest}`
            ]
          })
        )
      );
    });
  }
  noExecution.phases.push("focused_m03_compilers_completed");

  const nestedProgramRows = body.programs.map((program, index) => {
    const compilation = compileCAlgebraToHog(program);
    const path = `programs[${index}:${program.programRef}]`;
    compilation.diagnostics.forEach((diagnostic) =>
      diagnostics.push(
        normalizedDiagnostic({
          source: "c_algebra_hog_compiler",
          path,
          diagnostic,
          authorityRefs: [],
          evidenceRefs: [`program:${program.programRef}`, `body:${bodyDigest}`]
        })
      )
    );
    return {
      path,
      programRef: program.programRef,
      accepted: compilation.accepted,
      diagnosticIds: compilation.diagnostics.map((row) => row.diagnosticId)
    };
  });

  const conformance = typecheckGtlProgram({
    subjectRef: "workspace://abg/t252/consensus",
    abiPackageVersion: "5.0.0-dev.0",
    modules: [admittedModule]
  });
  noExecution.phases.push("full_conformance_completed");
  const structuralBlockingRules = new Set([
    "abg://gtl-program/graph-vector/source-derivable",
    "abg://gtl-program/graph/output-derivable",
    "abg://gtl-program/c-algebra/invalid-program",
    "abg://gtl-program/hof/invalid-program",
    "abg://gtl-program/graph-function-application/invalid-program",
    "abg://gtl-program/declaration/host-compatible",
    "abg://gtl-program/graph-function/unique-publication"
  ]);
  const structuralIssues = conformance.issues.filter((issue) =>
    structuralBlockingRules.has(issue.ruleRef)
  );
  const invalidDiagnostics = diagnostics.filter(
    (row) => row.classification === "invalid_program"
  );
  if (structuralIssues.length > 0 || invalidDiagnostics.length > 0) {
    throw new TypeError(
      `T-252 body has structural invalidity: ${JSON.stringify({ structuralIssues, invalidDiagnostics })}`
    );
  }

  const termKindCounts = new Map();
  body.programs.forEach((program) => termKinds(program.term, termKindCounts));
  const termCounts = Object.fromEntries(
    [...termKindCounts].sort(([left], [right]) => left.localeCompare(right))
  );
  const coverageRows = [
    {
      constructor: "C.of",
      authoredCount: termCounts.c_of ?? 0,
      compilerCoverage: "path_addressed",
      runtimeStatus: "partial_current_interpreter_shape_only",
      gapFamilies: ["c_program_runtime_shape_generalization"]
    },
    {
      constructor: "workflow.C",
      authoredCount: termCounts.c_workflow ?? 0,
      compilerCoverage: "path_addressed",
      runtimeStatus: "semantic_not_realized",
      gapFamilies: ["workflow_c_runtime"]
    },
    {
      constructor: "C.retry",
      authoredCount: termCounts.c_retry ?? 0,
      compilerCoverage: "path_addressed",
      runtimeStatus: "semantic_not_realized",
      gapFamilies: ["c_retry_runtime_and_policy_join"]
    },
    {
      constructor: "fan_out",
      authoredCount: hofRows.length,
      compilerCoverage: "exact_relation",
      runtimeStatus: "semantic_not_realized",
      gapFamilies: ["typed_fan_out_runtime", "typed_fan_out_batch_projection"]
    },
    {
      constructor: "fan_in",
      authoredCount: applicationRows.filter((row) => row.operatorKinds.includes("fan_in"))
        .length,
      compilerCoverage: "exact_application_lineage",
      runtimeStatus: "semantic_not_realized",
      gapFamilies: ["typed_fan_in_structure_and_runtime"]
    },
    {
      constructor: "recurse",
      authoredCount: applicationRows.filter((row) => row.operatorKinds.includes("recurse"))
        .length,
      compilerCoverage: "exact_application_lineage",
      runtimeStatus: "semantic_not_realized",
      gapFamilies: ["typed_recurse_policy_and_runtime"]
    },
    {
      constructor: "graph_vector_program_selection",
      authoredCount: vectorRows.length,
      compilerCoverage: "exact_binding",
      runtimeStatus: "semantic_not_realized",
      gapFamilies: ["graph_vector_program_runtime_selection"]
    }
  ];

  const commonEvidenceRefs = [`body:${bodyDigest}`, "ticket:T-252"];
  const directDiagnosticIds = diagnostics.map((row) => row.diagnosticId);
  const directPaths = diagnostics.map((row) => row.canonicalBodyPath);
  const activeGapEvidence = {
    c_program_runtime_shape_generalization: gapEvidenceRow({
      diagnosticIds: ["current-interpreter-anchor-shape"],
      bodyPaths: body.programs.map((program) => `program:${program.programRef}`),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "lawful single-stage and wrapper C programs exceed the current fixed interpreter anchor shape"
    }),
    graph_vector_program_runtime_selection: gapEvidenceRow({
      diagnosticIds: directDiagnosticIds.filter(
        (id) => id === "gtl-c-unrealized-vector-program-selection"
      ),
      bodyPaths: vectorRows.map((row) => row.path),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "exact vector/program bindings compile but no runtime consumer exists"
    }),
    target_carrier_contract: gapEvidenceRow({
      diagnosticIds: ["abg://gtl-program/traversal-unit/target-carrier-required"],
      bodyPaths: ["conformance.traversalUnits"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "full conformance still requires target-carrier truth for executable vectors"
    }),
    edge_closure_contract: gapEvidenceRow({
      diagnosticIds: ["abg://gtl-program/traversal-unit/edge-closure-required"],
      bodyPaths: ["conformance.traversalUnits"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "full conformance still requires edge-closure truth for executable vectors"
    }),
    traversal_execution_contracts: gapEvidenceRow({
      diagnosticIds: ["abg://gtl-program/traversal-unit/stage-binding-required"],
      bodyPaths: ["conformance.traversalUnits"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "TraversalUnit execution basis is not yet derived from the compiled vector/program relation"
    }),
    composition_owning_declaration_join: gapEvidenceRow({
      diagnosticIds: ["gtl-application-runtime-not-realized"],
      bodyPaths: applicationRows.map(
        (row) => `application:${row.graphFunctionName}`
      ),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "application lineage is compiled while the final owning-declaration execution join remains provisional"
    }),
    carrier_field_indirection: gapEvidenceRow({
      diagnosticIds: ["coverage-carrier-field-indirection"],
      bodyPaths: ["nodes.ReviewerAssignment", "nodes.SemanticReducerBinding"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "typed binding carriers exist but generic field-path resolution into runtime requests is absent"
    }),
    declared_instruction_protocol_join: gapEvidenceRow({
      diagnosticIds: ["coverage-declared-instruction-protocol-join"],
      bodyPaths: ["nodes.ReviewerAssignment", "nodes.SubmitterTurnBinding"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "instruction and protocol refs remain carrier data without a generic runtime request join"
    }),
    fp_result_contract_admission: gapEvidenceRow({
      diagnosticIds: ["coverage-fp-result-contract-admission"],
      bodyPaths: [
        "vectors.review-one-profile",
        "vectors.reduce-round",
        "vectors.submitter-response",
        "vectors.reassess-round"
      ],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "F_P result contracts are declared by typed boundaries but raw output admission is not on the runtime path"
    }),
    fh_pending_runtime_hold: gapEvidenceRow({
      diagnosticIds: ["coverage-fh-pending-runtime-hold"],
      bodyPaths: ["vectors.fh-initial", "vectors.fh-post-submitter"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "F_H vectors target pending interaction truth but hold, public act, and resume are not realized"
    }),
    workflow_c_runtime: gapEvidenceRow({
      diagnosticIds: directDiagnosticIds.filter(
        (id) => id === "gtl-c-unrealized-workflow-lift"
      ),
      bodyPaths: directPaths.filter((path) => path.includes("programs[")),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "workflow.C boundaries are authored and compiler-visible without a runtime lowering"
    }),
    typed_fan_out_runtime: gapEvidenceRow({
      diagnosticIds: ["gtl-hof-unrealized-fan-out"],
      bodyPaths: hofRows.map((row) => `hof:${row.graphFunctionName}`),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "canonical typed fan_out relation has no runtime consumer"
    }),
    typed_fan_out_batch_projection: gapEvidenceRow({
      diagnosticIds: ["coverage-fan-out-to-batch-projection"],
      bodyPaths: hofRows.map((row) => `hof:${row.graphFunctionName}`),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "fan_out has no proved ordinal-preserving projection to C.batch task spines"
    }),
    typed_fan_in_structure_and_runtime: gapEvidenceRow({
      diagnosticIds: ["gtl-application-runtime-not-realized"],
      bodyPaths: applicationRows
        .filter((row) => row.operatorKinds.includes("fan_in"))
        .map((row) => `application:${row.graphFunctionName}`),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "fan_in application lineage is exact while collection runtime is absent"
    }),
    c_retry_runtime_and_policy_join: gapEvidenceRow({
      diagnosticIds: ["gtl-c-unrealized-retry"],
      bodyPaths: nestedProgramRows
        .filter((row) => row.diagnosticIds.includes("gtl-c-unrealized-retry"))
        .map((row) => row.path),
      evidenceRefs: [
        ...commonEvidenceRefs,
        "policy:transport_failure|no_output|contract_failure"
      ],
      actualRelation: "retry budget 2 is canonical data but runtime and allowlist consumption are absent"
    }),
    typed_recurse_policy_and_runtime: gapEvidenceRow({
      diagnosticIds: ["gtl-application-runtime-not-realized"],
      bodyPaths: applicationRows
        .filter((row) => row.operatorKinds.includes("recurse"))
        .map((row) => `application:${row.graphFunctionName}`),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "recurse lineage and foldback data are exact while typed runtime consumption is absent"
    }),
    strict_raw_module_admission: gapEvidenceRow({
      diagnosticIds: ["m02-unknown-field-accepted-and-dropped"],
      bodyPaths: ["m02.unknownFieldMutation"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "M02 accepts an unknown Module field and drops it during construction"
    }),
    conformance_inventory_extraction: gapEvidenceRow({
      diagnosticIds: ["conformance-expected-coverage-not-structurally-derived"],
      bodyPaths: ["conformance.ruleCounts"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "conformance still requires caller-authored coverage beside submitted structure"
    }),
    conformance_scope_proportionality: gapEvidenceRow({
      diagnosticIds: ["conformance-universal-closeability-noise"],
      bodyPaths: ["conformance.ruleCounts"],
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "DS-1 structure receives broad closure obligations outside this probe scope"
    }),
    effect_declaration_inventory_enforcement: gapEvidenceRow({
      diagnosticIds: ["coverage-effect-inventory-enforcement"],
      bodyPaths: graphFunctions.map(
        (graphFunction) => `effects:${graphFunction.name}`
      ),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "exact transitive effects are authored but generic conformance does not derive and enforce the inventory"
    }),
    plugin_handler_declaration_inventory_enforcement: gapEvidenceRow({
      diagnosticIds: ["coverage-plugin-handler-inventory-enforcement"],
      bodyPaths: graphFunctions.map(
        (graphFunction) => `execution-declarations:${graphFunction.name}`
      ),
      evidenceRefs: commonEvidenceRefs,
      actualRelation: "local plugin selections and exact handler rows exist but generic proportional inventory enforcement is absent"
    })
  };

  const ownership = loadOwnership();
  const activeOwnedFamilies = [...ownership.byFamily]
    .filter(([, owner]) => owner.status === "active")
    .map(([family]) => family)
    .sort();
  const observedFamilies = Object.keys(activeGapEvidence).sort();
  if (JSON.stringify(activeOwnedFamilies) !== JSON.stringify(observedFamilies)) {
    throw new TypeError(
      `active ownership and observed gap census differ: ${JSON.stringify({ activeOwnedFamilies, observedFamilies })}`
    );
  }
  const gapCensus = observedFamilies.map((gapFamily) => {
    const owner = ownership.byFamily.get(gapFamily);
    if (owner === undefined || owner.status !== "active") {
      throw new TypeError(`${gapFamily} lacks one active successor owner`);
    }
    const evidence = activeGapEvidence[gapFamily];
    const authorityRefs = [
      ...GAP_REQUIREMENTS[gapFamily].map((ref) => `requirement:${ref}`),
      `ticket:${owner.ticketId}`,
      `ticket-source:${owner.sourceRef}`
    ].sort();
    return {
      gapFamily,
      ownerTicket: owner.ticketId,
      ownerStatus: owner.status,
      classification: "semantic_not_realized",
      diagnosticIds: evidence.diagnosticIds,
      canonicalBodyPaths: evidence.bodyPaths,
      authorityRefs,
      authorityDigest: stableSha256Digest(authorityRefs),
      actualRelation: evidence.actualRelation,
      actualRelationDigest: sha256(evidence.actualRelation),
      evidenceRefs: evidence.evidenceRefs,
      evidenceDigest: stableSha256Digest(evidence.evidenceRefs)
    };
  });

  const nodeContracts = Object.entries(body.nodes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, node]) => ({
      name,
      nodeRef: node.id,
      schemaRef: node.schema.ref,
      nodeContractKey: nodeContractKey(node),
      nodeContractDigest: stableSha256Digest({ nodeContractKey: nodeContractKey(node) })
    }));

  const manifestPayload = {
    kind: "t252_consensus_gtl_probe_manifest",
    version: 1,
    authority: {
      ticketRef:
        ".ai-workspace/tickets/active/T-252-design-and-probe-consensus-gtl-free-construction.md",
      designRef:
        "build_tenants/abiogenesis/typescript/design/M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md",
      abiPackageVersion: "5.0.0-dev.0"
    },
    body: {
      bodyDigest,
      canonicalTargetRef: body.graphFunctions.consensus.id,
      moduleName: body.module.name,
      graphFunctionCount: graphFunctions.length,
      uniqueGraphCount: admittedModule.graphs.length,
      authoredProgramCount: body.programs.length,
      selectedVectorPathCount: vectorRows.length,
      moduleOperatorCount: admittedModule.operators.length,
      moduleJobCount: admittedModule.jobs.length,
      moduleRoleCount: admittedModule.roles.length,
      nodeContracts
    },
    m02: {
      canonicalRoundTripExact: true,
      serializedModuleDigest: stableSha256Digest(serializedModule),
      admittedModuleDigest: stableSha256Digest(roundTrip),
      unknownFieldMutation
    },
    compiler: {
      outcome: "semantic_not_realized",
      invalidProgramCount: invalidDiagnostics.length,
      structuralBlockingIssueCount: structuralIssues.length,
      normalizedDiagnostics: diagnostics.sort((left, right) =>
        `${left.canonicalBodyPath}|${left.diagnosticId}`.localeCompare(
          `${right.canonicalBodyPath}|${right.diagnosticId}`
        )
      ),
      hofRows: hofRows.sort((left, right) =>
        left.graphFunctionName.localeCompare(right.graphFunctionName)
      ),
      applicationRows: applicationRows.sort((left, right) =>
        left.graphFunctionName.localeCompare(right.graphFunctionName)
      ),
      vectorProgramRows: vectorRows.sort((left, right) =>
        left.path.localeCompare(right.path)
      ),
      nestedProgramRows,
      coverageRows,
      fullConformanceIssueCount: conformance.issues.length,
      conformanceRuleCounts: conformanceRuleCounts(conformance.issues)
    },
    ownership: {
      loadedTicketCount: ownership.sources.length,
      sources: ownership.sources,
      observedActiveGapFamilyCount: gapCensus.length,
      duplicateOwnerCount: 0,
      unownedGapCount: 0
    },
    gapCensus,
    noExecutionObservation: {
      armedBefore: noExecution.armedBefore,
      finalizedAfter: "full_conformance_terminal_outcome",
      outcome: "semantic_not_realized",
      evidenceMethod:
        "static_source_dependency_closure_plus_probe_phase_inventory",
      phases: noExecution.phases,
      bodySourceClosure: sourceClosure.map((path) => relative(TENANT_ROOT, path)),
      forbiddenReachableModules,
      derivedCallCounts: {
        runner: 0,
        worker: 0,
        plugin: 0,
        handler: 0,
        transport: 0,
        event: 0,
        result: 0,
        replay: 0,
        archive: 0,
        workspaceMutation: 0,
        productArtifact: 0
      },
      declarationCountsAreExecutionEvidence: false
    }
  };
  return {
    ...manifestPayload,
    manifestDigest: stableSha256Digest(manifestPayload)
  };
}

async function main() {
  const mode = process.argv[2] ?? "--check";
  if (mode !== "--write" && mode !== "--check") {
    throw new TypeError("usage: t252_consensus_probe.mjs [--write|--check]");
  }
  const manifest = await buildManifest();
  const rendered = canonicalJson(manifest);
  if (mode === "--write") {
    writeFileSync(OUTPUT_PATH, rendered, "utf8");
    process.stdout.write(
      `${JSON.stringify({ status: "written", output: relative(TENANT_ROOT, OUTPUT_PATH), bodyDigest: manifest.body.bodyDigest, manifestDigest: manifest.manifestDigest })}\n`
    );
    return;
  }
  if (!existsSync(OUTPUT_PATH)) {
    throw new TypeError(`missing T-252 probe manifest ${OUTPUT_PATH}`);
  }
  const current = readFileSync(OUTPUT_PATH, "utf8");
  if (current !== rendered) {
    throw new TypeError(
      "T-252 probe manifest is stale; run npm run generate:t252-consensus-probe"
    );
  }
  process.stdout.write(
    `${JSON.stringify({ status: "passed", bodyDigest: manifest.body.bodyDigest, manifestDigest: manifest.manifestDigest, gapFamilies: manifest.gapCensus.length })}\n`
  );
}

await main();
