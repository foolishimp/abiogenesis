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
import {
  assertCompiledCProgramPlan,
  compileCompleteCProgram
} from "../../build/semantic/code/src/abg/m03/contracts/complete_c_program.js";
import { compileGraphVectorCProgramSelection } from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import { compileHofRelation } from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import {
  compileDeclaredCBatchPlan,
  compileHofCBatchPlan
} from "../../build/semantic/code/src/abg/m03/contracts/c_batch.js";
import { deriveCRetryPolicyProjection } from "../../build/semantic/code/src/abg/m03/contracts/c_retry_policy.js";
import {
  admitTypedRecursePolicy,
  compileTypedRecurseBinding,
  compileTypedRecursePlan
} from "../../build/semantic/code/src/abg/m03/contracts/typed_recurse.js";
import {
  compileFanInReductionBinding,
  compileHofFanOutBinding
} from "../../build/semantic/code/src/abg/m03/contracts/hof_batch.js";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import {
  admitDeclaredTraversalStageResultAuthority,
  admitProgramLocusTraversalStageResultAuthority,
  admitTraversalExecution,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "../../build/semantic/code/src/abg/m03/contracts/traversal_execution_contract.js";
import {
  constructAdmittedInvocationCarrier,
  constructAdmittedInvocationCarrierSet,
  constructDeclaredCStageInvocationBasis,
  joinDeclaredExecutionContext
} from "../../build/semantic/code/src/abg/m03/contracts/declared_execution_context.js";
import { admitFpResultContractEnvelope } from "../../build/semantic/code/src/abg/m03/contracts/fp_result_contract_admission.js";
import {
  FH_PUBLIC_OPERATION_ID_VALUES,
  admitFhInteractionResume,
  openFhInteraction,
  projectFhInteraction,
  submitFhInteractionResponse
} from "../../build/semantic/code/src/abg/m03/runner/fh_interaction.js";
import { resolveCBatch } from "../../build/semantic/code/src/abg/m03/runner/c_batch_runtime.js";
import { resolveCRetry } from "../../build/semantic/code/src/abg/m03/runner/c_retry_runtime.js";
import { interpretCompleteCProgram } from "../../build/semantic/code/src/abg/m03/runner/complete_c_program_runtime.js";
import {
  deriveTypedRecurseParentRebindEvidenceRef,
  resolveTypedRecurse
} from "../../build/semantic/code/src/abg/m03/runner/typed_recurse_runtime.js";
import { resolveHofFanIn } from "../../build/semantic/code/src/abg/m03/runner/hof_fan_in_runtime.js";
import {
  ABG_CONSENSUS_INSTRUCTION_DECLARATION,
  ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE,
  CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_instruction_protocol.js";
import {
  ABG_CONSENSUS_MODULE_DECLARATIONS
} from "../../build/semantic/code/src/abg/m03/contracts/review_consensus_modules.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { nodeContractKey } from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";
import { DS1_PUBLIC_OPERATION_IDS } from "../../build/semantic/code/src/app/m04/public_sdk/carriers.js";
import { admitDs1OperationRequest } from "../../build/semantic/code/src/app/m04/public_sdk/operation_admission.js";
import { DS1_PUBLIC_OPERATION_DEFINITION_REGISTER } from "../../build/semantic/code/src/app/m04/public_contracts/operations.js";

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

const GAP_REQUIREMENTS = Object.freeze({
  consensus_topology_integrity: [
    "REQ-L-GTL3-GRAPH",
    "REQ-L-GTL3-GRAPHFUNCTION"
  ],
  complete_c_program_interpreter: [
    "REQ-L-GTL3-C-ALGEBRA-006..016",
    "REQ-R-ABG3-CCALL-016"
  ],
  declared_program_conservation: [
    "REQ-L-GTL3-C-ALGEBRA-016",
    "REQ-R-ABG3-CCALL-014"
  ],
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

const CONFORMANCE_GAP_FAMILY_BY_RULE = Object.freeze({
  "abg://gtl-program/c-algebra/semantic-not-realized":
    "complete_c_program_interpreter",
  "abg://gtl-program/graph/node-reachable-or-bound":
    "consensus_topology_integrity"
});

const NORMALIZED_DIAGNOSTIC_GAP_FAMILY = Object.freeze({
  "gtl-c-unrealized-vector-program-selection":
    "graph_vector_program_runtime_selection"
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
  const paths = TICKET_ROOTS.flatMap((root) =>
    readdirSync(root)
      .filter((name) => /^T-[0-9]+-.*\.md$/u.test(name))
      .map((name) => resolve(root, name))
  ).sort();
  for (const path of paths) {
    const source = readFileSync(path, "utf8");
    const section = /## T-252 Census Gap Ownership\n([\s\S]*?)(?=\n## |$)/u.exec(
      source
    )?.[1];
    if (section === undefined) continue;
    const ticketId = /^T-[0-9]+/u.exec(path.split("/").at(-1) ?? "")?.[0];
    if (ticketId === undefined) {
      throw new TypeError(`ownership ticket path lacks an id: ${path}`);
    }
    const families = [
      ...section.matchAll(/^- gap_family: ([a-z0-9_]+)$/gmu)
    ].map((match) => match[1]);
    if (families.length === 0) {
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

function compiledPlanKinds(node, counts = new Map()) {
  counts.set(node.kind, (counts.get(node.kind) ?? 0) + 1);
  switch (node.kind) {
    case "compiled_c_sequence":
      node.children.forEach((child) => compiledPlanKinds(child, counts));
      break;
    case "compiled_c_complete_batch":
      node.tasks.forEach((task) => compiledPlanKinds(task.child, counts));
      break;
    case "compiled_c_complete_retry":
      compiledPlanKinds(node.child, counts);
      break;
    case "compiled_c_stage_leaf":
    case "compiled_c_identity":
    case "compiled_c_workflow_lift":
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

function authoredProgramStageCount(program) {
  if (program.workflow !== undefined || program.retry !== undefined) return 1;
  if (program.batch !== undefined) return program.batch.tasks.length;
  return program.stages.length;
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

function cTermFacts(
  term,
  facts = { fibres: [], instructionCategoryRefs: [], stageRoles: [] }
) {
  switch (term.kind) {
    case "c_of":
      facts.fibres.push(term.fibre);
      facts.stageRoles.push(term.stageRole);
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
        relationRef: hof.relation?.relationBindingRef ?? null,
        relationDigest: hof.relation?.relationDigest ?? null,
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
        fanInRelationRef: application.fanInRelation?.relationRef ?? null,
        fanInRelationDigest: application.fanInRelation?.relationDigest ?? null,
        recurseRelationRef: application.recurseRelation?.relationRef ?? null,
        recurseRelationDigest: application.recurseRelation?.relationDigest ?? null,
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
      const diagnosticId = actualRelation.includes("gtl-c-unrealized-retry")
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
      stageRoles: sortedUnique(termFacts.stageRoles),
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
        graphFunction,
        graphVector,
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
  const completeProgramRows = handoffRows.flatMap((row) => {
    const carrier = row.status === "published_startup_blocked"
      ? row.outcome.handoff
      : row.status === "blocked_capability"
        ? row.outcome
        : null;
    if (carrier === null) return [];
    assertCompiledCProgramPlan(carrier.completeProgramPlan);
    const selectedRows = vectorRows.filter((candidate) => candidate.path === row.path);
    const selected = selectedRows[0];
    if (
      selectedRows.length !== 1 ||
      selected === undefined ||
      selected.accepted !== true ||
      selected.bindingDigest === null ||
      selected.selectedProgramRef === null ||
      carrier.completeProgramPlan.programBindingDigest !== selected.bindingDigest ||
      carrier.completeProgramPlan.programBindingDigest !== carrier.programBinding.bindingDigest ||
      carrier.completeProgramPlan.programRef !== selected.selectedProgramRef ||
      carrier.completeProgramPlan.executionGraphFunctionRef !== row.graphFunction.id ||
      carrier.completeProgramPlan.graphVectorRef !== row.graphVector.id
    ) {
      throw new TypeError(
        `T-271 complete-program plan does not preserve the selected vector authority: ${JSON.stringify({ path: row.path, selectedRows: selectedRows.length, planRef: carrier.completeProgramPlan.planRef })}`
      );
    }
    return [Object.freeze({
      path: row.path,
      programRef: carrier.completeProgramPlan.programRef,
      planRef: carrier.completeProgramPlan.planRef,
      planDigest: carrier.completeProgramPlan.planDigest,
      programBindingDigest: carrier.completeProgramPlan.programBindingDigest,
      authoredNodeCount: carrier.completeProgramPlan.authoredNodeCount,
      invokingLocusCount: carrier.completeProgramPlan.invokingLocusCount,
      rootKind: carrier.completeProgramPlan.root.kind,
      plan: carrier.completeProgramPlan
    })];
  });
  const selectedVectorPaths = vectorRows.map((row) => row.path).sort();
  const plannedVectorPaths = completeProgramRows.map((row) => row.path).sort();
  const authoredProgramRefs = body.programs.map((program) => program.programRef).sort();
  const plannedProgramRefs = sortedUnique(
    completeProgramRows.map((row) => row.programRef)
  );
  if (
    typeof compileCompleteCProgram !== "function" ||
    typeof interpretCompleteCProgram !== "function" ||
    JSON.stringify(plannedVectorPaths) !== JSON.stringify(selectedVectorPaths) ||
    JSON.stringify(plannedProgramRefs) !== JSON.stringify(authoredProgramRefs)
  ) {
    throw new TypeError(
      `T-271 complete-program coverage differs from the independently selected canonical programs: ${JSON.stringify({ selectedVectorPaths, plannedVectorPaths, authoredProgramRefs, plannedProgramRefs, compilerPresent: typeof compileCompleteCProgram === "function", interpreterPresent: typeof interpretCompleteCProgram === "function" })}`
    );
  }
  const selectedWorkflowPaths = vectorRows
    .filter((row) => {
      const selectedPrograms = body.programs.filter(
        (program) => program.programRef === row.selectedProgramRef
      );
      return (
        selectedPrograms.length === 1 &&
        selectedPrograms[0].term.kind === "c_workflow"
      );
    })
    .map((row) => row.path)
    .sort();
  const realizedWorkflowRows = handoffRows.filter((row) => {
    const disposition = row.status === "published_startup_blocked"
      ? row.outcome.handoff.programDisposition
      : row.outcome.programDisposition ?? null;
    return disposition === "workflow_sub_traversal";
  });
  const realizedWorkflowPaths = realizedWorkflowRows
    .map((row) => row.path)
    .sort();
  if (
    JSON.stringify(realizedWorkflowPaths) !==
      JSON.stringify(selectedWorkflowPaths) ||
    realizedWorkflowRows.some((row) => {
      const binding = row.status === "published_startup_blocked"
        ? row.outcome.handoff.workflowLiftBinding
        : row.outcome.workflowLiftBinding;
      return binding === null || binding === undefined;
    })
  ) {
    throw new TypeError(
      `T-259 workflow handoff coverage differs from independently selected workflow programs: ${JSON.stringify({ selectedWorkflowPaths, realizedWorkflowPaths })}`
    );
  }
  const selectedRetryRows = vectorRows.filter((row) => {
    const selectedPrograms = body.programs.filter(
      (program) => program.programRef === row.selectedProgramRef
    );
    return (
      selectedPrograms.length === 1 &&
      selectedPrograms[0].term.kind === "c_retry"
    );
  });
  const realizedRetryRows = handoffRows.filter((row) => {
    const disposition =
      row.status === "published_startup_blocked"
        ? row.outcome.handoff.programDisposition
        : row.outcome.programDisposition ?? null;
    return disposition === "retry_attempt_family";
  });
  const retryPolicy = deriveCRetryPolicyProjection();
  const retryCoverageMismatch = realizedRetryRows.some((row) => {
    const selected = selectedRetryRows.find(
      (candidate) => candidate.path === row.path
    );
    const sourceProgram = body.programs.find(
      (program) => program.programRef === selected?.selectedProgramRef
    );
    const binding =
      row.status === "published_startup_blocked"
        ? row.outcome.handoff.retryBinding
        : row.outcome.retryBinding;
    return (
      sourceProgram?.term.kind !== "c_retry" ||
      binding === null ||
      binding === undefined ||
      binding.maxAttempts !== sourceProgram.term.budget ||
      binding.stageRole !== sourceProgram.term.term.stageRole ||
      binding.retryPolicyRef !== retryPolicy.policyRef ||
      binding.retryPolicyDigest !== retryPolicy.policyDigest
    );
  });
  if (
    typeof resolveCRetry !== "function" ||
    JSON.stringify(realizedRetryRows.map((row) => row.path).sort()) !==
      JSON.stringify(selectedRetryRows.map((row) => row.path).sort()) ||
    retryCoverageMismatch
  ) {
    throw new TypeError(
      `T-261 retry handoff differs from the independently selected retry programs or shared policy: ${JSON.stringify({ selectedRetryPaths: selectedRetryRows.map((row) => row.path).sort(), realizedRetryPaths: realizedRetryRows.map((row) => row.path).sort(), runtimeResolverPresent: typeof resolveCRetry === "function", retryCoverageMismatch })}`
    );
  }
  const targetCarrierContracts = handoffRows.map(
    (row) => row.outcome.targetCarrierProjection
  );
  const edgeClosureContracts = handoffRows.map(
    (row) => row.outcome.edgeClosureBinding.conformanceRow
  );

  const catalogAdmission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://abg/t252/consensus-probe",
      bindingId: "binding://abg/t252/consensus-probe",
      catalogId: "catalog://abg/t252/consensus-probe",
      resolvedLockRef: "lock://abg/t252/consensus-probe",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration: ABG_CONSENSUS_MODULE_DECLARATIONS[0],
          moduleRef: "gtl://module/abg/consensus",
          module: body.module
        },
        {
          kind: "runtime_library_entry",
          declaration: ABG_CONSENSUS_INSTRUCTION_DECLARATION,
          moduleRef: CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF,
          module: ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://abg/t252/consensus-probe/catalog"],
      correlationId: "correlation://abg/t252/consensus-probe"
    },
    () => {}
  );
  if (!catalogAdmission.accepted || catalogAdmission.basis === null) {
    throw new TypeError(
      `T-252 execution-context catalog admission failed: ${JSON.stringify(catalogAdmission.diagnostics)}`
    );
  }

  const canonicalRecurseFunction = body.graphFunctions.boundedRounds;
  const canonicalRecurseCompilation = compileGraphFunctionApplication({
    graphFunction: canonicalRecurseFunction,
    graphFunctions
  });
  if (
    !canonicalRecurseCompilation.accepted ||
    canonicalRecurseCompilation.recurseRelation === null
  ) {
    throw new TypeError(
      `T-262 canonical recurse relation did not compile: ${JSON.stringify(canonicalRecurseCompilation.diagnostics)}`
    );
  }
  const canonicalRecurseBinding = compileTypedRecurseBinding({
    module: admittedModule,
    graphFunction: canonicalRecurseFunction,
    relation: canonicalRecurseCompilation.recurseRelation
  });
  const canonicalRecurseInputPayloadRef =
    "payload://abg/t252/consensus-probe/round-execution/1";
  const canonicalRecursePolicyRef =
    ABG_CONSENSUS_MODULE_DECLARATIONS[0].policyRefs[0];
  if (canonicalRecursePolicyRef === undefined) {
    throw new TypeError(
      "T-262 canonical Consensus declaration lacks recurse policy authority"
    );
  }
  const canonicalRecursePolicy = admitTypedRecursePolicy({
    kind: "typed_recurse_policy",
    policyRef: canonicalRecursePolicyRef,
    policyVersion: "1.0.0",
    sourceInputCarrierRef: canonicalRecurseBinding.inputCarrierRef,
    sourceInputPayloadRef: canonicalRecurseInputPayloadRef,
    budgetSourceFieldRef: "field://abg/consensus/round/policy-budget",
    maxApplications: 2,
    evidenceRefs: [
      `body:${bodyDigest}`,
      "graph-vector:graph-vector://abg/consensus/recurse-post-submitter",
      "context:context://abg/consensus/round-policy"
    ]
  });
  const canonicalRecursePlan = compileTypedRecursePlan({
    binding: canonicalRecurseBinding,
    policy: canonicalRecursePolicy,
    selectedCatalogEntryRef: ABG_CONSENSUS_MODULE_DECLARATIONS[0].entryRef
  });

  const routeRows = vectors(body.graphFunctions.round)
    .filter((vector) => vector.target.id === body.nodes.roundDisposition.id)
    .map((vector) => {
      const outcomeEntry = vector.rule?.config.entries.find(
        (entry) => entry.key === "outcome"
      );
      const outcome =
        outcomeEntry?.value.kind === "scalar"
          ? outcomeEntry.value.value
          : null;
      return {
        vectorRef: vector.id,
        vectorName: vector.name,
        outcome,
        sourceNodeRefs: vector.source.map((source) => source.id),
        evaluatorConsumedFieldRefs: vector.evaluators.flatMap(
          (evaluator) => evaluator.consumedFieldRefs
        )
      };
    });
  const recurseRouteRows = routeRows.filter(
    (row) => row.outcome === "recurse_next_round"
  );
  if (
    recurseRouteRows.length !== 1 ||
    recurseRouteRows[0].vectorRef !==
      "graph-vector://abg/consensus/recurse-post-submitter" ||
    !recurseRouteRows[0].sourceNodeRefs.includes(
      body.nodes.postSubmitterAssessment.id
    ) ||
    !recurseRouteRows[0].evaluatorConsumedFieldRefs.includes(
      canonicalRecursePolicy.budgetSourceFieldRef
    )
  ) {
    throw new TypeError(
      `T-262 recurse route is not uniquely post-submitter and budget-bound: ${JSON.stringify(recurseRouteRows)}`
    );
  }

  const canonicalRecurseEvents = [];
  const canonicalRecurseChildRequests = [];
  const canonicalRecurseTerminationRequests = [];
  const canonicalRecurseFoldbackRequests = [];
  const canonicalRecurseResolution = await resolveTypedRecurse({
    kind: "typed_recurse_invocation",
    binding: canonicalRecurseBinding,
    plan: canonicalRecursePlan,
    policy: canonicalRecursePolicy,
    catalogBasis: catalogAdmission.basis,
    selectedCatalogEntryRef: ABG_CONSENSUS_MODULE_DECLARATIONS[0].entryRef,
    parentBasisId: "basis://abg/t252/consensus-probe",
    parentGraphCallId: "graph-call://abg/t252/consensus-probe",
    parentFrameId: "frame://abg/t252/consensus-probe",
    inputPayloadRef: canonicalRecurseInputPayloadRef,
    causationEventRefs: ["event://abg/t252/consensus-probe/recurse-ready"],
    replayEvents: [],
    emit(events) {
      canonicalRecurseEvents.push(...events);
    },
    async invokeChild(request) {
      canonicalRecurseChildRequests.push(request);
      return {
        kind: "typed_recurse_child_outcome",
        planRef: request.planRef,
        bindingRef: request.bindingRef,
        applicationOrdinal: request.applicationOrdinal,
        childInvocationRef: request.childInvocationRef,
        childGraphCallId: request.childGraphCallId,
        childFrameId: request.childFrameId,
        disposition: "completed",
        outputCarrierRef: request.outputCarrierRef,
        outputPayloadRef:
          `payload://abg/t252/consensus-probe/round-disposition/${String(request.applicationOrdinal)}`,
        responseContractRef: request.outputCarrierRef,
        reasonRef: null,
        evidenceRefs: [
          `evidence://abg/t252/consensus-probe/round/${String(request.applicationOrdinal)}`
        ]
      };
    },
    async evaluateTermination(request) {
      canonicalRecurseTerminationRequests.push(request);
      const decision =
        request.applicationOrdinal === 1 ? "foldback" : "terminate";
      return {
        kind: "typed_recurse_termination_outcome",
        planRef: request.planRef,
        bindingRef: request.bindingRef,
        applicationOrdinal: request.applicationOrdinal,
        childInvocationRef: request.childInvocationRef,
        childGraphCallId: request.childGraphCallId,
        childFrameId: request.childFrameId,
        outputPayloadRef: request.outputPayloadRef,
        evaluatorBinding: request.evaluatorBinding,
        evaluatorDigest: request.evaluatorDigest,
        decision,
        reasonRef:
          decision === "foldback"
            ? "reason://abg/consensus/recurse-next-round"
            : "reason://abg/consensus/closed-done",
        evidenceRefs: [
          `evidence://abg/t252/consensus-probe/termination/${decision}`
        ]
      };
    },
    async applyFoldback(request) {
      canonicalRecurseFoldbackRequests.push(request);
      const outcome = {
        kind: "typed_recurse_foldback_outcome",
        planRef: request.planRef,
        bindingRef: request.bindingRef,
        applicationOrdinal: request.applicationOrdinal,
        childInvocationRef: request.childInvocationRef,
        childGraphCallId: request.childGraphCallId,
        childFrameId: request.childFrameId,
        frameLineageId: request.frameLineageId,
        foldbackBinding: request.foldbackBinding,
        sourceOutputCarrierRef: request.sourceOutputCarrierRef,
        sourceOutputPayloadRef: request.sourceOutputPayloadRef,
        targetInputCarrierRef: request.targetInputCarrierRef,
        targetInputPayloadRef:
          "payload://abg/t252/consensus-probe/round-execution/2",
        policyRef: request.policyRef,
        policyDigest: request.policyDigest,
        budgetSourceFieldRef: request.budgetSourceFieldRef,
        preservedEvidenceRefs: [...request.requiredPreservedEvidenceRefs],
      };
      return {
        ...outcome,
        foldbackEvidenceRefs: [
          "evidence://abg/t252/consensus-probe/foldback/1",
          deriveTypedRecurseParentRebindEvidenceRef({
            ...outcome,
            foldbackAdditionalDigest: request.foldbackAdditionalDigest,
            maxApplications: request.maxApplications
          })
        ]
      };
    }
  });
  const canonicalPriorEvidencePreserved =
    canonicalRecurseFoldbackRequests.length === 1 &&
    canonicalRecursePolicy.evidenceRefs.every((evidenceRef) =>
      canonicalRecurseFoldbackRequests[0].requiredPreservedEvidenceRefs.includes(
        evidenceRef
      )
    ) &&
    canonicalRecurseChildRequests.length === 2 &&
    canonicalRecurseChildRequests[1].priorEvidenceRefs.includes(
      "evidence://abg/t252/consensus-probe/foldback/1"
    );
  if (
    canonicalRecurseResolution.status !== "completed" ||
    canonicalRecurseResolution.applicationsOpened !== 2 ||
    canonicalRecurseChildRequests.length !== 2 ||
    canonicalRecurseTerminationRequests.length !== 2 ||
    canonicalRecurseFoldbackRequests.length !== 1 ||
    !canonicalPriorEvidencePreserved
  ) {
    throw new TypeError(
      `T-262 canonical recurse probe did not preserve bounded policy and evidence: ${JSON.stringify({ resolution: canonicalRecurseResolution, childCount: canonicalRecurseChildRequests.length, terminationCount: canonicalRecurseTerminationRequests.length, foldbackCount: canonicalRecurseFoldbackRequests.length, canonicalPriorEvidencePreserved })}`
    );
  }
  const expectedExecutionSlots = (regime) =>
    regime === "F_P"
      ? [
          "capability_requirement_refs",
          "configuration_digest",
          "instruction_protocol_ref",
          "result_contract_ref",
          "role_or_worker_selection_ref"
        ]
      : [
          "capability_requirement_refs",
          "instruction_protocol_ref",
          "interaction_choice_refs",
          "interaction_operation_ids",
          "interaction_resume_operation_ids",
          "interaction_subject_ref",
          "result_contract_ref"
        ];
  const executionContextContracts = [];
  const executionContextJoinRows = handoffRows.flatMap((row) => {
    if (row.status !== "blocked_capability") return [];
    const programMatches = body.programs.filter(
      (program) =>
        program.programRef === row.outcome.programBinding.selectedProgramRef
    );
    const program = programMatches[0];
    if (programMatches.length !== 1 || program === undefined) {
      throw new TypeError(
        `${row.path} selected program resolved ${programMatches.length} times`
      );
    }
    const lowered = compileCAlgebraToHog(program);
    if (!lowered.accepted || lowered.program === null) {
      throw new TypeError(`${row.path} selected program did not lower`);
    }
    return lowered.program.stages.flatMap((stage, stageIndex) => {
      if (stage.defaultRegime !== "F_P" && stage.defaultRegime !== "F_H") {
        return [];
      }
      const join = joinDeclaredExecutionContext({
        sourceOutcome: row.outcome,
        stageBasis: constructDeclaredCStageInvocationBasis({
          programBindingDigest: row.outcome.programBinding.bindingDigest,
          stageIndex,
          stageRole: stage.stageRole,
          regime: stage.defaultRegime,
          termDigest: stableSha256Digest(stage),
          instructionCategoryRefs: stage.instructionCategoryRefs
        }),
        selectedCatalogEntryRef: ABG_CONSENSUS_MODULE_DECLARATIONS[0].entryRef,
        catalogBasis: catalogAdmission.basis,
        invocationCarriers: constructAdmittedInvocationCarrierSet(
          row.graphVector.source.map((sourceNode, sourceIndex) =>
            constructAdmittedInvocationCarrier({
              sourceNodeRef: sourceNode.id,
              schemaRef: sourceNode.schema.ref,
              carrierRef: `carrier://abg/t252/consensus-probe/${encodeURIComponent(row.graphVector.name)}/${String(sourceIndex)}`,
              admissionRef: `admission://abg/t252/consensus-probe/${encodeURIComponent(row.graphVector.name)}/${String(sourceIndex)}`,
              value: {
                kind: "t252_execution_context_join_probe",
                fields: {}
              }
            })
          )
        )
      });
      const contract =
        join.status === "invalid" ? null : join.compiledContract;
      if (contract !== null) {
        executionContextContracts.push(Object.freeze({
          path: `${row.path}.stages[${String(stageIndex)}:${stage.stageRole}]`,
          handoffPath: row.path,
          graphFunctionName: row.graphFunctionName,
          graphVectorName: row.graphVectorName,
          stageIndex,
          regime: stage.defaultRegime,
          contract
        }));
      }
      const fieldSlots =
        contract === null
          ? []
          : sortedUnique(contract.fieldRows.map((fieldRow) => fieldRow.slot));
      const protocolRefs =
        contract === null
          ? []
          : sortedUnique(
              contract.protocols.map(
                (protocol) => protocol.instructionProtocolRef
              )
            );
      const fieldClosureObserved =
        JSON.stringify(fieldSlots) ===
        JSON.stringify(expectedExecutionSlots(stage.defaultRegime));
      const protocolRoleObserved =
        contract !== null &&
        contract.protocols.some((protocol) =>
          protocol.allowedStageRoles.includes(stage.stageRole)
        );
      return [
        {
          path: `${row.path}.stages[${String(stageIndex)}:${stage.stageRole}]`,
          graphFunctionName: row.graphFunctionName,
          graphVectorName: row.graphVectorName,
          stageIndex,
          domainStageRole: stage.stageRole,
          computeStageRole:
            contract === null ? null : contract.selectedComputeStageRole,
          regime: stage.defaultRegime,
          status: join.status,
          diagnosticIds: join.diagnostics.map(
            (diagnostic) => diagnostic.diagnosticId
          ),
          fieldSlots,
          protocolRefs,
          targetCompatibilityRefs:
            contract === null ? [] : [...contract.targetCompatibilityRefs],
          fieldClosureObserved,
          protocolRoleObserved
        }
      ];
    });
  });
  if (executionContextJoinRows.length === 0) {
    throw new TypeError("T-252 probe observed no F_P/F_H execution-context joins");
  }
  const fpResultContractAdmissionRows = executionContextJoinRows
    .filter((row) => row.regime === "F_P")
    .flatMap((row) =>
      row.targetCompatibilityRefs.map((selectedResultContractRef) => {
        const outcome = admitFpResultContractEnvelope({
          profile: "standard_live_review",
          selectedResultContractRef,
          rawResult: {
            resultContractRef: selectedResultContractRef,
            accepted: true,
            closeDisposition: "close",
            assessmentIds: [],
            reasons: []
          }
        });
        return {
          path: row.path,
          selectedResultContractRef,
          profile: "standard_live_review",
          status: outcome.accepted ? "admitted" : "rejected",
          payloadDigest: outcome.accepted
            ? outcome.envelope.payloadDigest
            : null,
          failureClass: outcome.accepted
            ? null
            : outcome.failure.failureClass
        };
      })
    );
  if (fpResultContractAdmissionRows.length === 0) {
    throw new TypeError(
      "T-252 probe observed no compiler-derived F_P result-contract admission"
    );
  }
  const expectedFhHandlerSymbols = Object.freeze({
    "abg.operation.fh.select": "fhSelect",
    "abg.operation.fh.approve": "fhApprove",
    "abg.operation.fh.reject": "fhReject",
    "abg.operation.fh.assess": "fhAssess",
    "abg.operation.fh.answer-escalation": "fhAnswerEscalation",
    "abg.operation.run.resume": "runResume"
  });
  const requiredFhOperationIds = Object.freeze([
    ...FH_PUBLIC_OPERATION_ID_VALUES,
    "abg.operation.run.resume"
  ]);
  const publishedFhDefinitions = DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.filter(
    (definition) => requiredFhOperationIds.includes(definition.operationId)
  );
  const publishedFhHandlersObserved = requiredFhOperationIds.every(
    (operationId) => {
      const matches = publishedFhDefinitions.filter(
        (definition) => definition.operationId === operationId
      );
      return (
        matches.length === 1 &&
        matches[0]?.handlerSymbol === expectedFhHandlerSymbols[operationId] &&
        DS1_PUBLIC_OPERATION_IDS.includes(operationId)
      );
    }
  );
  const fhAtomsObserved =
    typeof openFhInteraction === "function" &&
    typeof projectFhInteraction === "function" &&
    typeof submitFhInteractionResponse === "function" &&
    typeof admitFhInteractionResume === "function" &&
    projectFhInteraction([], "abg://fh-interaction/t252-absent") === null;
  const fhInteractionRows = executionContextJoinRows
    .filter((row) => row.regime === "F_H")
    .map((row) => {
      const interactionSlotsObserved = [
        "interaction_choice_refs",
        "interaction_operation_ids",
        "interaction_resume_operation_ids"
      ].every((slot) => row.fieldSlots.includes(slot));
      let requestAdmissionObserved = true;
      try {
        for (const operationId of FH_PUBLIC_OPERATION_ID_VALUES) {
          admitDs1OperationRequest(operationId, {
            workspaceId: "workspace:t252-consensus-probe",
            interactionRef: "abg://fh-interaction/t252-probe",
            interactionBasisDigest: stableSha256Digest({
              path: row.path,
              operationId
            }),
            responseContractRef:
              row.targetCompatibilityRefs[0] ??
              "contract://abg/t252/fh-response",
            choiceRef:
              operationId === "abg.operation.fh.select"
                ? "choice://abg/t252/probe"
                : null,
            value: { kind: "t252_fh_public_admission_probe" },
            evidenceRefs: ["evidence://abg/t252/fh-public-admission"],
            capabilityRefs: [],
            capabilityProvenanceRefs: []
          });
        }
        admitDs1OperationRequest("abg.operation.run.resume", {
          workspaceId: "workspace:t252-consensus-probe",
          interactionRef: "abg://fh-interaction/t252-probe",
          interactionBasisDigest: stableSha256Digest({ path: row.path }),
          responseRef: "abg://fh-response/t252-probe",
          continuationRef: "abg://fh-continuation/t252-probe"
        });
      } catch {
        requestAdmissionObserved = false;
      }
      const publicPathObserved =
        interactionSlotsObserved &&
        publishedFhHandlersObserved &&
        requestAdmissionObserved &&
        fhAtomsObserved;
      return {
        path: row.path,
        interactionSlotsObserved,
        publishedFhHandlersObserved,
        requestAdmissionObserved,
        fhAtomsObserved,
        operationIds: [...requiredFhOperationIds],
        status: publicPathObserved
          ? "public_interaction_path_observed"
          : "public_interaction_path_unobserved"
      };
    });
  if (fhInteractionRows.length === 0) {
    throw new TypeError("T-252 probe observed no F_H interaction joins");
  }

  const selectedHandoffCarrier = (outcome) =>
    outcome.status === "published_startup_blocked"
      ? outcome.handoff
      : outcome;
  const exactCompositionOwner = (carrier) => {
    const ownerRef = carrier.compositionSelection.contract.host.graphFunctionRef;
    const matches = graphFunctions.filter(
      (graphFunction) => graphFunction.id === ownerRef
    );
    if (matches.length !== 1) {
      throw new TypeError(
        `T-267 composition owner ${ownerRef} resolved ${matches.length} times`
      );
    }
    return matches[0];
  };
  const selectedTraversalRows = handoffRows
    .filter(
      (row) =>
        row.status === "blocked_capability" ||
        row.status === "published_startup_blocked"
    )
    .map((row) => {
      const carrier = selectedHandoffCarrier(row.outcome);
      const sourceInput = Object.freeze({
        kind: "selected_program_handoff",
        module: admittedModule,
        executionSubjectGraphFunction: row.graphFunction,
        declarationOwnerGraphFunction: exactCompositionOwner(carrier),
        graphVector: row.graphVector,
        targetCarrierDefaults,
        admittedTenantConformanceManifest: null,
        outcome: row.outcome
      });
      return Object.freeze({
        path: row.path,
        row,
        carrier,
        sourceInput,
        source: projectTraversalContractSourceBasis(sourceInput)
      });
    });
  const recurseApplicationMutationRows = selectedTraversalRows.flatMap(
    (entry) => {
      const relation = entry.carrier.recurseApplicationRelation;
      if (relation === null) return [];
      return [
        "operandGraphFunctionDigest",
        "terminationEvaluatorDigest",
        "foldbackAdditionalDigest"
      ].map((field) => {
        const mutatedRelation = Object.freeze({
          ...relation,
          [field]: stableSha256Digest({
            path: entry.path,
            field,
            mutation: "t267-recurse-authority-drift"
          })
        });
        const mutatedCarrier = Object.freeze({
          ...entry.carrier,
          recurseApplicationRelation: mutatedRelation
        });
        const mutatedOutcome =
          entry.row.outcome.status === "published_startup_blocked"
            ? Object.freeze({
                ...entry.row.outcome,
                handoff: mutatedCarrier
              })
            : mutatedCarrier;
        let rejected = false;
        try {
          projectTraversalContractSourceBasis(Object.freeze({
            ...entry.sourceInput,
            outcome: mutatedOutcome
          }));
        } catch {
          rejected = true;
        }
        if (!rejected) {
          throw new TypeError(
            `${entry.path} accepted mutated recurse field ${field}`
          );
        }
        return Object.freeze({
          path: entry.path,
          relationRef: relation.relationRef,
          mutatedField: field,
          status: "rejected"
        });
      });
    }
  );
  if (recurseApplicationMutationRows.length === 0) {
    throw new TypeError(
      "T-267 recurse authority proof observed no canonical recurse application"
    );
  }

  const structuralHandoffRows = handoffRows.filter(
    (row) => row.status === "structural_only"
  );
  if (structuralHandoffRows.length !== 1) {
    throw new TypeError(
      `T-267 expected one structural HOF source, found ${structuralHandoffRows.length}`
    );
  }
  const structuralHandoffRow = structuralHandoffRows[0];
  const structuralRelationCompilation = compileHofRelation({
    graphFunction: structuralHandoffRow.graphFunction,
    graphFunctions
  });
  if (
    !structuralRelationCompilation.accepted ||
    structuralRelationCompilation.relation === null
  ) {
    throw new TypeError(
      `T-267 structural HOF relation did not compile: ${JSON.stringify(structuralRelationCompilation.diagnostics)}`
    );
  }
  const structuralRelation = structuralRelationCompilation.relation;
  const structuralChildRows = selectedTraversalRows.filter(
    ({ row }) =>
      row.graphFunction.id === structuralRelation.childGraphFunctionRef &&
      row.graphVector.source.length === 1 &&
      row.graphVector.source[0]?.id === structuralRelation.inputMemberNodeRef &&
      row.graphVector.target.id === structuralRelation.outputMemberNodeRef
  );
  if (structuralChildRows.length !== 1) {
    throw new TypeError(
      `T-267 structural HOF child handoff resolved ${structuralChildRows.length} times`
    );
  }
  const structuralChild = structuralChildRows[0];
  const structuralBinding = compileHofFanOutBinding({
    module: admittedModule,
    relation: structuralRelation,
    childExecutionHandoff: structuralChild.row.outcome
  });
  const structuralSourceInput = Object.freeze({
    kind: "structural_hof_fan_out",
    module: admittedModule,
    executionSubjectGraphFunction: structuralHandoffRow.graphFunction,
    declarationOwnerGraphFunction:
      structuralChild.sourceInput.declarationOwnerGraphFunction,
    graphVector: structuralHandoffRow.graphVector,
    targetCarrierDefaults,
    admittedTenantConformanceManifest: null,
    outcome: structuralHandoffRow.outcome,
    relation: structuralRelation,
    binding: structuralBinding,
    childExecutionHandoff: structuralChild.row.outcome
  });
  const traversalRows = [
    ...selectedTraversalRows,
    Object.freeze({
      path: structuralHandoffRow.path,
      row: structuralHandoffRow,
      carrier: null,
      sourceInput: structuralSourceInput,
      source: projectTraversalContractSourceBasis(structuralSourceInput)
    })
  ];

  const traversalCompilations = traversalRows.map((entry) => {
    if (entry.source.workStages.length === 0) {
      throw new TypeError(
        `${entry.path} did not project any exact T-267 program locus`
      );
    }
    const authorities = Object.freeze(entry.source.workStages.map((stage) => {
      if (stage.regime === "F_P" || stage.regime === "F_H") {
        const contracts = executionContextContracts.filter(
          (candidate) =>
            candidate.handoffPath === entry.path &&
            candidate.stageIndex === stage.declaredStageIndex
        );
        const contractRow = contracts[0];
        if (contracts.length > 1) {
          throw new TypeError(
            `${entry.path} T-256 result authority resolved ${contracts.length} times for ${stage.programLocusRef}`
          );
        }
        if (contractRow !== undefined) {
          return admitDeclaredTraversalStageResultAuthority({
            source: entry.source,
            stageOrdinal: stage.ordinal,
            contract: contractRow.contract,
            selectedResultContractRef:
              stage.resultBearing
                ? entry.source.targetCarrierProjection.targetCarrierContractRef
                : stage.outputCarrierRefs[0],
            fpWireProfile:
              stage.regime === "F_P" ? "standard_live_review" : null
          });
        }
      }
      return admitProgramLocusTraversalStageResultAuthority({
        source: entry.source,
        programLocusRef: stage.programLocusRef
      });
    }));
    const bundle = compileTraversalExecutionContracts({
      source: entry.source,
      resultAuthorities: authorities
    });
    return Object.freeze({ ...entry, authorities, bundle });
  });
  if (traversalCompilations.length !== handoffRows.length) {
    throw new TypeError(
      `T-267 compiled ${traversalCompilations.length} units for ${handoffRows.length} handoffs`
    );
  }

  const conformanceInput = Object.freeze({
    subjectRef: "workspace://abg/t252/consensus",
    abiPackageVersion: "5.0.0-dev.0",
    scopeKind: "submitted_structure",
    modules: [admittedModule],
    targetCarrierContracts,
    edgeClosureContracts,
    computeCompositions: traversalCompilations.map(
      (entry) => entry.bundle.computeComposition
    ),
    computeStageBindings: traversalCompilations.flatMap(
      (entry) => entry.bundle.computeStageBindings
    ),
    pluginResultInterfaces: traversalCompilations.flatMap(
      (entry) => entry.bundle.pluginResultInterfaces
    ),
    traversalBindConservation: traversalCompilations.map(
      (entry) => entry.bundle.traversalBindConservation
    )
  });
  const conformance = typecheckGtlProgram(conformanceInput);
  const traversalConformanceIssues = conformance.issues.filter((issue) =>
    issue.ruleRef.startsWith("abg://gtl-program/traversal-unit/")
  );
  if (traversalConformanceIssues.length > 0) {
    throw new TypeError(
      `T-267 canonical traversal rows are nonconformant: ${JSON.stringify(traversalConformanceIssues.map((issue) => ({ surfaceRef: issue.surfaceRef, ruleRef: issue.ruleRef, message: issue.message })))} `
    );
  }
  const traversalAdmissionRows = traversalCompilations.map((entry) => {
    const admission = admitTraversalExecution({
      sourceInput: entry.sourceInput,
      source: entry.source,
      resultAuthorities: entry.authorities,
      bundle: entry.bundle,
      conformanceInput,
      report: conformance
    });
    if (admission.status === "invalid") {
      throw new TypeError(
        `${entry.path} T-267 admission failed: ${JSON.stringify(admission.diagnostic)}`
      );
    }
    return Object.freeze({
      path: entry.path,
      sourceKind: entry.source.sourceKind,
      sourceDigest: entry.source.sourceDigest,
      resultAuthoritySourceKinds: entry.authorities.map(
        (authority) => authority.sourceKind
      ),
      resultAuthorityDigests: entry.authorities.map(
        (authority) => authority.authorityDigest
      ),
      resultAuthorityEvidenceRefs: sortedUnique(
        entry.authorities.flatMap((authority) => authority.evidenceRefs)
      ),
      resultAuthoritySelectorRefs: sortedUnique(
        entry.authorities.flatMap((authority) => authority.selectorAuthorityRefs)
      ),
      bundleRef: entry.bundle.bundleRef,
      bundleDigest: entry.bundle.bundleDigest,
      computeStageRoles: entry.bundle.computeStageBindings.map(
        (stageBinding) => stageBinding.stageRole
      ),
      status: admission.status,
      runtimeAddressable: admission.runtimeAddressable,
      effectsPermitted: admission.effectsPermitted
    });
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
  const admittedFanOutRows = hofRows.filter(
    (row) =>
      row.accepted &&
      row.relationRef !== null &&
      row.relationDigest !== null
  );
  const admittedFanInRows = applicationRows.filter(
    (row) =>
      row.operatorKinds.includes("fan_in") &&
      row.accepted &&
      row.fanInRelationRef !== null &&
      row.fanInRelationDigest !== null
  );
  if (admittedFanOutRows.length !== 1 || admittedFanInRows.length !== 1) {
    throw new TypeError(
      `T-260 canonical relation census is not exact: ${JSON.stringify({ admittedFanOutRows, admittedFanInRows })}`
    );
  }
  const t260RuntimeSurface = Object.freeze({
    compileDeclaredCBatchPlan:
      typeof compileDeclaredCBatchPlan === "function",
    compileHofCBatchPlan: typeof compileHofCBatchPlan === "function",
    compileFanInReductionBinding:
      typeof compileFanInReductionBinding === "function",
    compileHofFanOutBinding:
      typeof compileHofFanOutBinding === "function",
    resolveCBatch: typeof resolveCBatch === "function",
    resolveHofFanIn: typeof resolveHofFanIn === "function"
  });
  if (Object.values(t260RuntimeSurface).some((observed) => !observed)) {
    throw new TypeError(
      `T-260 runtime surface is incomplete: ${JSON.stringify(t260RuntimeSurface)}`
    );
  }
  const t261RuntimeSurface = Object.freeze({
    resolveCRetry: typeof resolveCRetry === "function",
    retryPolicyRef: retryPolicy.policyRef,
    retryPolicyDigest: retryPolicy.policyDigest,
    retryableFailureClasses: retryPolicy.retryableFailureClasses,
    canonicalRetryHandoffCount: realizedRetryRows.length
  });
  const canonicalRecurseHandoffRows = handoffRows.filter(
    (row) => row.graphFunctionName === canonicalRecurseFunction.name
  );
  if (canonicalRecurseHandoffRows.length === 0) {
    throw new TypeError("T-262 observed no canonical recurse handoff rows");
  }
  const canonicalRecurseHandoffStatuses = sortedUnique(
    canonicalRecurseHandoffRows.map((row) => row.status)
  );
  const canonicalPublicEffectsPermitted = canonicalRecurseHandoffRows.some(
    (row) =>
      row.status === "published_startup_blocked" &&
      row.outcome.handoff.startupBlock.effectsPermitted
  );
  if (canonicalPublicEffectsPermitted) {
    throw new TypeError(
      "T-262 canonical recurse handoff permitted effects before T-267"
    );
  }
  const t262RuntimeSurface = Object.freeze({
    resolveTypedRecurse: typeof resolveTypedRecurse === "function",
    relationRef: canonicalRecurseCompilation.recurseRelation.relationRef,
    relationDigest: canonicalRecurseCompilation.recurseRelation.relationDigest,
    bindingRef: canonicalRecurseBinding.bindingRef,
    bindingDigest: canonicalRecurseBinding.bindingDigest,
    planRef: canonicalRecursePlan.planRef,
    planDigest: canonicalRecursePlan.planDigest,
    policyRef: canonicalRecursePolicy.policyRef,
    policyDigest: canonicalRecursePolicy.policyDigest,
    maxApplications: canonicalRecursePolicy.maxApplications,
    uniquePostSubmitterRecurseRouteRef: recurseRouteRows[0].vectorRef,
    canonicalApplicationsObserved:
      canonicalRecurseResolution.applicationsOpened,
    canonicalEventKinds: canonicalRecurseEvents.map((event) => event.kind),
    priorEvidencePreserved: canonicalPriorEvidencePreserved,
    canonicalHandoffStatuses: canonicalRecurseHandoffStatuses,
    publicEffectsPermitted: canonicalPublicEffectsPermitted,
    observationKind: "isolated_subordinate_adapter_probe"
  });

  const termKindCounts = new Map();
  body.programs.forEach((program) => termKinds(program.term, termKindCounts));
  const termCounts = Object.fromEntries(
    [...termKindCounts].sort(([left], [right]) => left.localeCompare(right))
  );
  const compiledPlanKindCountsMap = new Map();
  completeProgramRows.forEach((row) =>
    compiledPlanKinds(row.plan.root, compiledPlanKindCountsMap)
  );
  const compiledPlanKindCounts = Object.fromEntries(
    [...compiledPlanKindCountsMap].sort(([left], [right]) =>
      left.localeCompare(right)
    )
  );
  const t271RuntimeSurface = Object.freeze({
    completeProgramCompiler: typeof compileCompleteCProgram === "function",
    completeProgramPlanAssertion: typeof assertCompiledCProgramPlan === "function",
    completeProgramInterpreter: typeof interpretCompleteCProgram === "function",
    everySelectedVectorHasExactPlan:
      completeProgramRows.length === vectorRows.length,
    everyAuthoredProgramIsSelectedAndPlanned:
      JSON.stringify(plannedProgramRefs) === JSON.stringify(authoredProgramRefs)
  });
  if (Object.values(t271RuntimeSurface).some((observed) => !observed)) {
    throw new TypeError(
      `T-271 compiler/runtime surface is incomplete: ${JSON.stringify(t271RuntimeSurface)}`
    );
  }
  const coverageRows = [
    {
      constructor: "C.of",
      authoredCount: termCounts.c_of ?? 0,
      selectedPlanNodeCount: compiledPlanKindCounts.compiled_c_stage_leaf ?? 0,
      compilerCoverage: "exact_complete_program_plan",
      runtimeStatus: "structural_interpreter_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    },
    {
      constructor: "C.id",
      authoredCount: termCounts.c_identity ?? 0,
      selectedPlanNodeCount: compiledPlanKindCounts.compiled_c_identity ?? 0,
      compilerCoverage: "exact_complete_program_plan",
      runtimeStatus: "effect_free_structural_interpreter_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    },
    {
      constructor: "C.compose/C.edge",
      authoredCount: (termCounts.c_compose ?? 0) + (termCounts.c_edge ?? 0),
      selectedPlanNodeCount: compiledPlanKindCounts.compiled_c_sequence ?? 0,
      compilerCoverage: "exact_ordered_complete_program_plan",
      runtimeStatus: "structural_interpreter_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    },
    {
      constructor: "workflow.C",
      authoredCount: termCounts.c_workflow ?? 0,
      selectedHandoffCount: realizedWorkflowRows.length,
      selectedPlanNodeCount:
        compiledPlanKindCounts.compiled_c_workflow_lift ?? 0,
      compilerCoverage: "exact_complete_program_plan_and_direct_compatibility_handoff",
      runtimeStatus:
        "runtime_atom_and_structural_interpreter_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    },
    {
      constructor: "C.batch",
      authoredCount: termCounts.c_batch ?? 0,
      selectedPlanNodeCount:
        compiledPlanKindCounts.compiled_c_complete_batch ?? 0,
      compilerCoverage: "exact_task_family_complete_program_plan",
      runtimeStatus: "shared_batch_atom_and_structural_interpreter_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    },
    {
      constructor: "C.retry",
      authoredCount: termCounts.c_retry ?? 0,
      selectedHandoffCount: realizedRetryRows.length,
      selectedPlanNodeCount:
        compiledPlanKindCounts.compiled_c_complete_retry ?? 0,
      compilerCoverage: "exact_complete_program_plan_and_runtime_resolver",
      runtimeStatus:
        "shared_retry_atom_and_structural_interpreter_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    },
    {
      constructor: "fan_out",
      authoredCount: hofRows.length,
      compilerCoverage: "exact_relation_and_runtime_projector",
      runtimeStatus:
        "runtime_atom_and_static_traversal_contract_realized_capability_unresolved",
      gapFamilies: []
    },
    {
      constructor: "fan_in",
      authoredCount: applicationRows.filter((row) => row.operatorKinds.includes("fan_in"))
        .length,
      compilerCoverage: "exact_relation_and_runtime_resolver",
      runtimeStatus:
        "runtime_atom_and_static_traversal_contract_realized_capability_blocked",
      gapFamilies: []
    },
    {
      constructor: "recurse",
      authoredCount: applicationRows.filter((row) => row.operatorKinds.includes("recurse"))
        .length,
      compilerCoverage: "exact_relation_policy_binding_plan_and_runtime_resolver",
      runtimeStatus:
        "runtime_atom_realized_internal_static_units_capability_blocked",
      gapFamilies: []
    },
    {
      constructor: "graph_vector_program_selection",
      authoredCount: vectorRows.length,
      compilerCoverage: "exact_handoff",
      runtimeStatus: "static_traversal_contract_realized_capability_blocked",
      gapFamilies: ["tenant_conformance_manifest_consensus_coverage_missing"]
    }
  ];

  const commonEvidenceRefs = [`body:${bodyDigest}`, "ticket:T-252"];
  const observedGapEvidence = new Map();

  const conformanceGapRows = conformance.issues.map((issue) => {
    const gapFamily = CONFORMANCE_GAP_FAMILY_BY_RULE[issue.ruleRef];
    if (gapFamily === undefined) {
      throw new TypeError(
        `full conformance issue lacks a census mapping: ${JSON.stringify({
          ruleRef: issue.ruleRef,
          surfaceKind: issue.surfaceKind,
          surfaceRef: issue.surfaceRef
        })}`
      );
    }
    return Object.freeze({
      gapFamily,
      diagnosticId: issue.ruleRef,
      path: `${issue.surfaceKind}:${issue.surfaceRef}`,
      message: bounded(issue.message),
      evidenceRefs: sortedUnique(issue.evidenceRefs.map(compactRef))
    });
  });
  for (const gapFamily of sortedUnique(
    conformanceGapRows.map((row) => row.gapFamily)
  )) {
    const rows = conformanceGapRows.filter(
      (row) => row.gapFamily === gapFamily
    );
    observeGap(observedGapEvidence, gapFamily, {
      rows,
      observationSources: ["compiler:typecheckGtlProgram:full-report"],
      evidenceRefs: sortedUnique([
        ...commonEvidenceRefs,
        ...rows.flatMap((row) => row.evidenceRefs)
      ]),
      actualRelation:
        gapFamily === "consensus_topology_integrity"
          ? "the canonical Consensus graph contains declared nodes that are neither reachable nor explicitly carried"
          : "the admitted C program syntax contains lawful compositions that the current generic runtime interpreter cannot yet realize"
    });
  }

  const normalizedSemanticGapRows = diagnostics
    .filter((diagnostic) => diagnostic.classification === "semantic_not_realized")
    .map((diagnostic) => {
      const gapFamily =
        NORMALIZED_DIAGNOSTIC_GAP_FAMILY[diagnostic.diagnosticId];
      if (gapFamily === undefined) {
        throw new TypeError(
          `normalized semantic diagnostic lacks a census mapping: ${JSON.stringify({
            diagnosticId: diagnostic.diagnosticId,
            canonicalBodyPath: diagnostic.canonicalBodyPath,
            source: diagnostic.source
          })}`
        );
      }
      return Object.freeze({
        gapFamily,
        diagnosticId: diagnostic.diagnosticId,
        path: diagnostic.canonicalBodyPath,
        evidenceRefs: diagnostic.evidenceRefs
      });
    });
  for (const gapFamily of sortedUnique(
    normalizedSemanticGapRows.map((row) => row.gapFamily)
  )) {
    const rows = normalizedSemanticGapRows.filter(
      (row) => row.gapFamily === gapFamily
    );
    observeGap(observedGapEvidence, gapFamily, {
      rows,
      observationSources: ["compiler:normalized-diagnostics"],
      evidenceRefs: sortedUnique([
        ...commonEvidenceRefs,
        ...rows.flatMap((row) => row.evidenceRefs)
      ]),
      actualRelation:
        "a compiler-owned semantic diagnostic remains unresolved after its declared successor boundary"
    });
  }

  const programConservationRows = selectedTraversalRows.flatMap((entry) => {
    const authoredStageCount = authoredProgramStageCount(
      entry.carrier.normalizedProgram
    );
    const applicationRelationRefs = [
      entry.carrier.fanInApplicationRelation?.relationRef,
      entry.carrier.recurseApplicationRelation?.relationRef
    ].filter((value) => value !== undefined);
    const stageCountPreserved =
      entry.source.workStages.length === authoredStageCount;
    const applicationIdentityPreserved = applicationRelationRefs.every(
      (relationRef) =>
        entry.source.applicationConservationRefs.includes(relationRef)
    );
    if (stageCountPreserved && applicationIdentityPreserved) return [];
    return [{
      diagnosticId: "declared-c-program-not-conserved",
      path: entry.path,
      authoredStageCount,
      projectedStageCount: entry.source.workStages.length,
      applicationRelationRefs,
      applicationIdentityPreserved
    }];
  });
  observeGap(observedGapEvidence, "declared_program_conservation", {
    rows: programConservationRows,
    observationSources: [
      "projection:projectTraversalContractSourceBasis",
      "compiler:compileTraversalExecutionContracts"
    ],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "the traversal projection must conserve every authored C node, invoking locus, result frontier, and outer application identity"
  });

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
  const bindingCarrierRows = executionContextJoinRows
    .filter((row) => !row.fieldClosureObserved)
    .map((row) => ({
      diagnosticId:
        row.diagnosticIds[0] ?? "execution-context-field-closure-unobserved",
      path: row.path
    }));
  observeGap(observedGapEvidence, "carrier_field_indirection", {
    rows: bindingCarrierRows,
    observationSources: ["compiler:joinDeclaredExecutionContext"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "the canonical T-252 F_P/F_H consumer path did not compile exact execution-context field closure"
  });
  observeGap(observedGapEvidence, "declared_instruction_protocol_join", {
    rows: executionContextJoinRows
      .filter((row) => !row.protocolRoleObserved)
      .map((row) => ({
        diagnosticId:
          row.diagnosticIds[0] ??
          "execution-context-protocol-role-closure-unobserved",
        path: row.path
      })),
    observationSources: ["compiler:joinDeclaredExecutionContext"],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "the canonical T-252 F_P/F_H consumer path did not resolve an admitted protocol for its exact domain stage role"
  });
  observeGap(observedGapEvidence, "fp_result_contract_admission", {
    rows: fpResultContractAdmissionRows
      .filter((row) => row.status !== "admitted")
      .map((row) => ({
        diagnosticId:
          row.failureClass ?? "fp-result-contract-admission-unobserved",
        path: row.path
      })),
    observationSources: [
      "compiler:joinDeclaredExecutionContext",
      "admission:admitFpResultContractEnvelope"
    ],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "a compiler-derived F_P result-contract ref did not pass the canonical result admission atom"
  });
  observeGap(observedGapEvidence, "fh_pending_runtime_hold", {
    rows: fhInteractionRows
      .filter((row) => row.status !== "public_interaction_path_observed")
      .map((row) => ({
        diagnosticId: "fh-public-interaction-path-unobserved",
        path: row.path
      })),
    observationSources: [
      "compiler:joinDeclaredExecutionContext",
      "admission:admitDs1OperationRequest",
      "publication:DS1_PUBLIC_OPERATION_DEFINITION_REGISTER",
      "projection:projectFhInteraction"
    ],
    evidenceRefs: commonEvidenceRefs,
    actualRelation:
      "a canonical F_H join lacks the generic hold, public response, or resume admission path"
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
    version: 4,
    authority: {
      ticketRef: relative(REPO_ROOT, ticketPath("T-252")),
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
        programDisposition:
          row.status === "published_startup_blocked"
            ? row.outcome.handoff.programDisposition
            : row.outcome.programDisposition ?? null,
        workflowBindingRef:
          row.status === "published_startup_blocked"
            ? row.outcome.handoff.workflowLiftBinding?.bindingRef ?? null
            : row.outcome.workflowLiftBinding?.bindingRef ?? null,
        diagnosticIds: row.diagnosticIds
      })),
      completeProgramPlanCount: completeProgramRows.length,
      completeProgramPlanKindCounts: compiledPlanKindCounts,
      completeProgramRows: completeProgramRows.map(({ plan: _plan, ...row }) => row),
      t271RuntimeSurface,
      t260RuntimeSurface,
      t261RuntimeSurface,
      t262RuntimeSurface,
      executionContextJoinRows,
      fpResultContractAdmissionRows,
      fhInteractionRows,
      executionContextJoinStatusCounts: Object.fromEntries(
        [...new Set(executionContextJoinRows.map((row) => row.status))]
          .sort()
          .map((status) => [
            status,
            executionContextJoinRows.filter((row) => row.status === status)
              .length
          ])
      ),
      targetCarrierContractCount: targetCarrierContracts.length,
      edgeClosureContractCount: edgeClosureContracts.length,
      traversalExecutionContractCount: traversalCompilations.length,
      traversalConformanceIssueCount: traversalConformanceIssues.length,
      traversalAdmissionStatusCounts: Object.fromEntries(
        [...new Set(traversalAdmissionRows.map((row) => row.status))]
          .sort()
          .map((status) => [
            status,
            traversalAdmissionRows.filter((row) => row.status === status)
              .length
          ])
      ),
      traversalAdmissionRows: traversalAdmissionRows.sort((left, right) =>
        left.path.localeCompare(right.path)
      ),
      recurseApplicationMutationRows,
      coverageRows,
      conformanceScopeKind: conformance.scopeKind,
      fullConformanceIssueCount: conformance.issues.length,
      mappedFullConformanceIssueCount: conformanceGapRows.length,
      unmappedFullConformanceIssueCount: 0,
      fullConformanceIssues: conformanceGapRows,
      normalizedSemanticIssueCount: normalizedSemanticGapRows.length,
      mappedNormalizedSemanticIssueCount: normalizedSemanticGapRows.length,
      unmappedNormalizedSemanticIssueCount: 0,
      normalizedSemanticIssues: normalizedSemanticGapRows,
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
