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
import { compileExecutionDeclarations } from "../../build/semantic/code/src/abg/m03/contracts/execution_declaration_compiler.js";
import { compileGraphFunctionApplication } from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import { compileGraphVectorExecutionHandoff } from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import { compileGraphVectorCProgramSelection } from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import { compileHofRelation } from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { nodeContractKey } from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
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
const TICKET_IDS = Array.from({ length: 14 }, (_, index) => `T-${255 + index}`);

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
  tenant_conformance_manifest_consensus_coverage_missing: [
    "REQ-M-GTL3-CAPABILITY-010..015",
    "REQ-P-PUBLIC-CONTRACTS"
  ],
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
    observationSources: sortedUnique(input.observationSources),
    evidenceRefs: sortedUnique(input.evidenceRefs),
    actualRelation: bounded(input.actualRelation)
  });
}

function cTermFacts(term, facts = { fibres: [], instructionCategoryRefs: [] }) {
  switch (term.kind) {
    case "c_of":
      facts.fibres.push(term.fibre);
      facts.instructionCategoryRefs.push(...(term.instructionCategoryRefs ?? []));
      break;
    case "c_compose":
      cTermFacts(term.left, facts);
      cTermFacts(term.right, facts);
      break;
    case "c_edge":
      cTermFacts(term.transform, facts);
      cTermFacts(term.evaluate, facts);
      cTermFacts(term.consequence, facts);
      break;
    case "c_batch":
      term.tasks.forEach((task) => cTermFacts(task, facts));
      break;
    case "c_retry":
      cTermFacts(term.term, facts);
      break;
    case "c_identity":
    case "c_workflow":
      break;
  }
  return facts;
}

function conformanceRows(issues, predicate) {
  return issues.filter(predicate).map((issue) => ({
    diagnosticId: issue.ruleRef,
    path: `${issue.surfaceKind}:${issue.surfaceRef}`
  }));
}

function diagnosticRows(diagnostics, predicate) {
  return diagnostics.filter(predicate).map((row) => ({
    diagnosticId: row.diagnosticId,
    path: row.canonicalBodyPath
  }));
}

function observeGap(target, gapFamily, input) {
  const diagnosticIds = sortedUnique(input.rows.map((row) => row.diagnosticId));
  const bodyPaths = sortedUnique(input.rows.map((row) => row.path));
  if (diagnosticIds.length === 0 || bodyPaths.length === 0) return;
  if (target.has(gapFamily)) {
    throw new TypeError(`duplicate compiler observation for gap family ${gapFamily}`);
  }
  target.set(
    gapFamily,
    gapEvidenceRow({
      diagnosticIds,
      bodyPaths,
      observationSources: input.observationSources,
      evidenceRefs: input.evidenceRefs,
      actualRelation: input.actualRelation
    })
  );
}

async function buildManifest() {
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

  const bodyModule = await import(
    "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js"
  );
  const body = bodyModule.ABG_CONSENSUS_GTL_BODY;
  const serializedModule = serializeModule(body.module);
  const bodyDigest = stableSha256Digest(serializedModule);
  const admittedModule = admitModule(cloneJson(serializedModule));
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
  if (unknownFieldMutation.accepted) {
    throw new TypeError(
      "strict M02 admission must refuse the T-252 unknown-field mutation"
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

  const executionDeclarationRows = graphFunctions.map((graphFunction) => {
    const path = `module.graphFunctions[${graphFunction.name}].executionDeclarations`;
    try {
      compileExecutionDeclarations(graphFunction);
      return {
        path,
        graphFunctionName: graphFunction.name,
        accepted: true,
        diagnosticId: null,
        actualRelation: "current execution declaration compiler admitted the GraphFunction"
      };
    } catch (error) {
      const actualRelation = bounded(error, 320);
      const diagnosticId = actualRelation.includes("omits current interpreter anchors")
        ? "current-interpreter-anchor-shape"
        : actualRelation.includes("gtl-c-unrealized-retry")
          ? "gtl-c-unrealized-retry"
          : actualRelation.includes("gtl-c-unrealized-workflow-lift")
            ? "gtl-c-unrealized-workflow-lift"
            : "execution-declaration-compiler-blocked";
      return {
        path,
        graphFunctionName: graphFunction.name,
        accepted: false,
        diagnosticId,
        actualRelation
      };
    }
  });

  const nestedProgramRows = body.programs.map((program, index) => {
    const compilation = compileCAlgebraToHog(program);
    const termFacts = cTermFacts(program.term);
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
      diagnosticIds: compilation.diagnostics.map((row) => row.diagnosticId),
      fibres: sortedUnique(termFacts.fibres),
      instructionCategoryRefs: sortedUnique(termFacts.instructionCategoryRefs)
    };
  });

  const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();
  const handoffRows = graphFunctions.flatMap((graphFunction) =>
    vectors(graphFunction).map((graphVector, vectorIndex) => {
      const outcome = compileGraphVectorExecutionHandoff({
        graphFunction,
        graphVector,
        graphFunctions,
        module: admittedModule,
        targetCarrierDefaults,
        admittedTenantConformanceManifest: null
      });
      return {
        path: `module.graphFunctions[${graphFunction.name}].vectors[${vectorIndex}:${graphVector.name}]`,
        graphFunctionName: graphFunction.name,
        graphVectorName: graphVector.name,
        status: outcome.status,
        diagnosticIds: outcome.diagnostics.map((row) => row.diagnosticId),
        outcome
      };
    })
  );
  const invalidHandoffRows = handoffRows.filter(
    (row) => row.status === "invalid"
  );
  if (invalidHandoffRows.length > 0) {
    throw new TypeError(
      `T-255 handoff compilation is structurally invalid: ${JSON.stringify(invalidHandoffRows.map((row) => ({ path: row.path, diagnosticIds: row.diagnosticIds })))}`
    );
  }
  const handoffStatusCounts = Object.fromEntries(
    [...new Set(handoffRows.map((row) => row.status))]
      .sort()
      .map((status) => [
        status,
        handoffRows.filter((row) => row.status === status).length
      ])
  );
  const targetCarrierContracts = handoffRows.map(
    (row) => row.outcome.targetCarrierProjection
  );
  const edgeClosureContracts = handoffRows.map(
    (row) => row.outcome.edgeClosureBinding.conformanceRow
  );

  const conformance = typecheckGtlProgram({
    subjectRef: "workspace://abg/t252/consensus",
    abiPackageVersion: "5.0.0-dev.0",
    scopeKind: "submitted_structure",
    modules: [admittedModule],
    targetCarrierContracts,
    edgeClosureContracts
  });
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
      compilerCoverage: "exact_handoff",
      runtimeStatus: "capability_or_successor_blocked_before_traversal",
      gapFamilies: [
        "tenant_conformance_manifest_consensus_coverage_missing",
        "traversal_execution_contracts"
      ]
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
      compilerCoverage: "exact_handoff",
      runtimeStatus: "capability_or_successor_blocked_before_traversal",
      gapFamilies: [
        "tenant_conformance_manifest_consensus_coverage_missing",
        "traversal_execution_contracts"
      ]
    }
  ];

  const commonEvidenceRefs = [`body:${bodyDigest}`, "ticket:T-252"];
  const observedGapEvidence = new Map();
  const rowsForApplication = (operatorKind) =>
    applicationRows
      .filter(
        (row) =>
          row.operatorKinds.includes(operatorKind) &&
          row.diagnosticIds.includes("gtl-application-runtime-not-realized")
      )
      .map((row) => ({
        diagnosticId: "gtl-application-runtime-not-realized",
        path: `application:${row.graphFunctionName}`
      }));
  const rowsForFibre = (fibre, diagnosticId) =>
    nestedProgramRows
      .filter((row) => row.fibres.includes(fibre))
      .map((row) => ({ diagnosticId, path: row.path }));

  observeGap(
    observedGapEvidence,
    "tenant_conformance_manifest_consensus_coverage_missing",
    {
      rows: handoffRows
        .filter((row) => row.status === "blocked_capability")
        .flatMap((row) =>
          row.diagnosticIds.map((diagnosticId) => ({
            diagnosticId,
            path: row.path
          }))
        ),
      observationSources: ["compiler:compileGraphVectorExecutionHandoff"],
      evidenceRefs: [...commonEvidenceRefs, "schema:abg.schema.tenant-conformance-manifest"],
      actualRelation:
        "effect-bearing Consensus handoffs lack one M04-admitted canonical tenant-conformance manifest with exact supported capability coverage"
    }
  );
  observeGap(observedGapEvidence, "traversal_execution_contracts", {
    rows: conformanceRows(
      conformance.issues,
      (issue) =>
        issue.ruleRef.startsWith("abg://gtl-program/traversal-unit/") &&
        issue.ruleRef !== "abg://gtl-program/traversal-unit/target-carrier-required" &&
        issue.ruleRef !== "abg://gtl-program/traversal-unit/edge-closure-required"
    ),
    observationSources: ["compiler:typecheckGtlProgram"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "TraversalUnit execution, result-interface, and conservation rows are absent from the submitted structure"
  });
  const bindingCarrierRows = graphFunctions.flatMap((graphFunction) =>
    vectors(graphFunction).flatMap((vector, index) =>
      vector.source.some((node) => node.name.endsWith("Binding"))
        ? [{
            diagnosticId: "coverage-carrier-field-indirection",
            path: `module.graphFunctions[${graphFunction.name}].vectors[${index}:${vector.name}]`
          }]
        : []
    )
  );
  observeGap(observedGapEvidence, "carrier_field_indirection", {
    rows: bindingCarrierRows,
    observationSources: ["structure:graph-vector-binding-carriers"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "typed binding carriers are graph inputs while no admitted runtime field-resolution contract is present"
  });
  const fpRows = rowsForFibre("F_P", "coverage-fp-result-contract-admission");
  const fhRows = rowsForFibre("F_H", "coverage-fh-pending-runtime-hold");
  observeGap(observedGapEvidence, "declared_instruction_protocol_join", {
    rows: [...fpRows, ...fhRows].map((row) => ({
      diagnosticId: "coverage-declared-instruction-protocol-join",
      path: row.path
    })),
    observationSources: ["structure:declared-fp-fh-c-stages"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "declared F_P and F_H stages have no admitted generic instruction/protocol request join"
  });
  observeGap(observedGapEvidence, "fp_result_contract_admission", {
    rows: fpRows,
    observationSources: ["structure:declared-fp-c-stages"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "F_P stages are declared while raw output admission is absent from the runtime path"
  });
  observeGap(observedGapEvidence, "fh_pending_runtime_hold", {
    rows: fhRows,
    observationSources: ["structure:declared-fh-c-stages"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "F_H stages are declared while hold, public act, and resume remain unrealized"
  });
  observeGap(observedGapEvidence, "workflow_c_runtime", {
    rows: diagnosticRows(
      diagnostics,
      (row) => row.diagnosticId === "gtl-c-unrealized-workflow-lift"
    ),
    observationSources: ["compiler:compileCAlgebraToHog"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation: "workflow.C boundaries are compiler-visible without a runtime lowering"
  });
  const fanOutRows = hofRows
    .filter((row) => row.diagnosticIds.includes("gtl-hof-unrealized-fan-out"))
    .map((row) => ({
      diagnosticId: "gtl-hof-unrealized-fan-out",
      path: `hof:${row.graphFunctionName}`
    }));
  observeGap(observedGapEvidence, "typed_fan_out_runtime", {
    rows: fanOutRows,
    observationSources: ["compiler:compileHofRelation"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation: "canonical typed fan_out relation has no runtime consumer"
  });
  observeGap(observedGapEvidence, "typed_fan_out_batch_projection", {
    rows: fanOutRows.map((row) => ({
      diagnosticId: "coverage-fan-out-to-batch-projection",
      path: row.path
    })),
    observationSources: ["compiler:compileHofRelation", "structure:c-program-catalog"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation: "fan_out has no proved ordinal-preserving projection to C.batch task spines"
  });
  observeGap(observedGapEvidence, "typed_fan_in_structure_and_runtime", {
    rows: rowsForApplication("fan_in"),
    observationSources: ["compiler:compileGraphFunctionApplication"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation: "fan_in lineage is exact while collection runtime is absent"
  });
  observeGap(observedGapEvidence, "c_retry_runtime_and_policy_join", {
    rows: nestedProgramRows
      .filter((row) => row.diagnosticIds.includes("gtl-c-unrealized-retry"))
      .map((row) => ({ diagnosticId: "gtl-c-unrealized-retry", path: row.path })),
    observationSources: ["compiler:compileCAlgebraToHog"],
    evidenceRefs: [
      ...commonEvidenceRefs,
      "policy:transport_failure|no_output|contract_failure"
    ],
    actualRelation: "retry budget is canonical data while runtime and allowlist consumption are absent"
  });
  observeGap(observedGapEvidence, "typed_recurse_policy_and_runtime", {
    rows: rowsForApplication("recurse"),
    observationSources: ["compiler:compileGraphFunctionApplication"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation: "recurse lineage and foldback data are exact while runtime consumption is absent"
  });

  const observedFamilies = [...observedGapEvidence.keys()].sort();
  const observedGapEvidenceDigest = stableSha256Digest(
    observedFamilies.map((family) => ({
      gapFamily: family,
      evidence: observedGapEvidence.get(family)
    }))
  );
  const ownership = loadOwnership();
  const activeOwnedFamilies = [...ownership.byFamily]
    .filter(([, owner]) => owner.status === "active")
    .map(([family]) => family)
    .sort();
  const unownedObservedFamilies = observedFamilies.filter((family) => {
    const owner = ownership.byFamily.get(family);
    return owner === undefined || owner.status !== "active";
  });
  if (unownedObservedFamilies.length > 0) {
    throw new TypeError(
      `compiler-observed gaps lack one active owner: ${JSON.stringify(unownedObservedFamilies)}`
    );
  }
  const activeOwnedButNotObservedFamilies = activeOwnedFamilies.filter(
    (family) => !observedGapEvidence.has(family)
  );
  const gapCensus = observedFamilies.map((gapFamily) => {
    const owner = ownership.byFamily.get(gapFamily);
    if (owner === undefined || owner.status !== "active") {
      throw new TypeError(`${gapFamily} lacks one active successor owner`);
    }
    const evidence = observedGapEvidence.get(gapFamily);
    if (evidence === undefined || GAP_REQUIREMENTS[gapFamily] === undefined) {
      throw new TypeError(`${gapFamily} lacks compiler evidence or requirement authority`);
    }
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
      observationSources: evidence.observationSources,
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
    version: 2,
    authority: {
      ticketRef:
        ".ai-workspace/tickets/completed/T-252-design-and-probe-consensus-gtl-free-construction.md",
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
      executionDeclarationRows,
      nestedProgramRows,
      handoffStatusCounts,
      handoffRows: handoffRows.map((row) => ({
        path: row.path,
        graphFunctionName: row.graphFunctionName,
        graphVectorName: row.graphVectorName,
        status: row.status,
        diagnosticIds: row.diagnosticIds
      })),
      targetCarrierContractCount: targetCarrierContracts.length,
      edgeClosureContractCount: edgeClosureContracts.length,
      coverageRows,
      conformanceScopeKind: conformance.scopeKind,
      fullConformanceIssueCount: conformance.issues.length,
      conformanceRuleCounts: conformanceRuleCounts(conformance.issues),
      derivedConformanceInventoryCounts:
        conformance.derivedConformanceInventory.counts,
      derivedConformanceInventoryDigest:
        conformance.inventoryDigests.derivedConformanceInventory,
      capabilityCompatibilityStatus:
        conformance.derivedConformanceInventory.capabilityCompatibilityStatus
    },
    ownership: {
      loadedTicketCount: ownership.sources.length,
      sources: ownership.sources,
      observedActiveGapFamilyCount: gapCensus.length,
      activeOwnedButNotObservedFamilyCount:
        activeOwnedButNotObservedFamilies.length,
      activeOwnedButNotObservedFamilies,
      duplicateOwnerCount: 0,
      unownedGapCount: 0
    },
    censusDerivation: {
      order: "compiler_and_structural_observations_before_ticket_ownership",
      observedGapFamilyCount: observedFamilies.length,
      observedGapEvidenceDigest,
      ownershipJoinChangesObservedFamilySet: false
    },
    gapCensus,
    staticExecutionReachability: {
      claim:
        "the canonical body source dependency closure reaches none of the fenced runner, transport, events, app, qualification, or bin implementation directories",
      evidenceMethod: "static_source_import_closure",
      bodySourceClosure: sourceClosure.map((path) => relative(TENANT_ROOT, path)),
      forbiddenReachableModules,
      runtimeCallObservation: "not_performed",
      declarationCountsAreRuntimeEvidence: false
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
