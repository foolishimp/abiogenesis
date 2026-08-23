import { readFileSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ABG_CONSENSUS_GTL_PROGRAM } from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_program.js";
import { compileCAlgebraToHog } from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import {
  collectRawCProgramCandidates,
  compileGraphVectorCProgramSelection,
  rawCProgramCandidatePath
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_c_program_compiler.js";
import { compileHofRelation } from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import { resolveAbgFnCompositionSelection } from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  GTL_PROGRAM_T153_FEATURE_KINDS,
  GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS,
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { materializeGraphFunction } from "../../build/semantic/code/src/gtl/m01/index.js";
import {
  admitModule,
  serializeModule
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  stableJson,
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const CONSENSUS_BODY_DIGEST = stableSha256Digest(
  serializeModule(ABG_CONSENSUS_GTL_PROGRAM.module)
);

const CENSUS_URL = new URL(
  "../fixtures/t252_consensus_gtl_census.json",
  import.meta.url
);
const BODY_SOURCE_URL = new URL(
  "../../code/src/abg/m03/contracts/consensus_gtl_program.ts",
  import.meta.url
);
const SUCCESSOR_TICKET_DIRECTORIES = Object.freeze([
  Object.freeze({
    name: "active",
    url: new URL("../../../../../.ai-workspace/tickets/active/", import.meta.url)
  }),
  Object.freeze({
    name: "completed",
    url: new URL(
      "../../../../../.ai-workspace/tickets/completed/",
      import.meta.url
    )
  })
]);
const SUCCESSOR_TICKET_PATTERN = /^T-(?:25[5-9]|26[0-5])-[a-z0-9-]+\.md$/u;
const OWNERSHIP_SECTION_HEADING = "## T-252 Census Gap Ownership";
const ALLOWED_BODY_SOURCE_IMPORTS = Object.freeze([
  "../../../gtl/m01/index.js",
  "../../../gtl/m02/index.js",
  "./index.js"
]);
const RUNTIME_SOURCE_FENCES = Object.freeze([
  "/abg/m03/runner/",
  "/abg/m03/transport/",
  "/app/m04/public_sdk/",
  "runAgentTransport",
  "runAbg",
  "executeConsensus",
  "Promise.all"
]);
const RUNTIME_MODULE_FENCES = Object.freeze([
  "concrete_worker_identity",
  "concreteWorkerRef",
  "backendRef",
  "transportRef",
  "plugin://abg/consensus",
  "ticket_mutation"
]);

function addressDisplay(segments) {
  return segments.reduce(
    (display, segment) =>
      typeof segment === "number"
        ? `${display}[${String(segment)}]`
        : /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(segment)
          ? `${display}.${segment}`
          : `${display}[${JSON.stringify(segment)}]`,
    "$"
  );
}

function address(segments, addressSpace = "raw_module") {
  return Object.freeze({
    addressSpace,
    segments: Object.freeze([...segments]),
    display: addressDisplay(segments)
  });
}

export function resolveT252CensusAddress(root, valueAddress) {
  return valueAddress.segments.reduce((value, segment) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value !== "object" && typeof value !== "string") ||
      !(segment in Object(value))
    ) {
      throw new TypeError(
        `unresolved ${valueAddress.addressSpace} address ${valueAddress.display}`
      );
    }
    return value[segment];
  }, root);
}

function rawGraphFunctionAddress(graphFunctionIndex) {
  return address(["graphFunctions", graphFunctionIndex]);
}

function rawGraphVectorAddress(graphFunctionIndex, graphVectorIndex) {
  return address([
    "graphFunctions",
    graphFunctionIndex,
    "template",
    "graph",
    "vectors",
    graphVectorIndex
  ]);
}

function rawProgramAddress(graphFunction, graphFunctionIndex, candidate) {
  const declarationEntryIndex = graphFunction.declarations.entries.findIndex(
    (entry) => entry.key === candidate.declarationKey
  );
  if (declarationEntryIndex < 0) {
    throw new TypeError(
      `missing declaration entry ${candidate.declarationKey} in ${graphFunction.name}`
    );
  }
  const segments = [
    "graphFunctions",
    graphFunctionIndex,
    "declarations",
    "entries",
    declarationEntryIndex,
    "value",
    "value"
  ];
  if (candidate.catalogIndex !== null) {
    segments.push("items", candidate.catalogIndex);
  }
  return address(segments);
}

function diagnosticAuthorityRefs(diagnostic) {
  return uniqueInOrder([
    ...(diagnostic.axiomRef === null || diagnostic.axiomRef === undefined
      ? []
      : [`axiom:${diagnostic.axiomRef}`]),
    ...(diagnostic.requirementRef === null ||
    diagnostic.requirementRef === undefined
      ? []
      : [`requirement:${diagnostic.requirementRef}`]),
    ...diagnostic.evidenceRefs.filter((ref) =>
      /^(?:axiom|requirement|policy|standard):/u.test(ref)
    )
  ]);
}

function featureRequirementRefs(featureKind) {
  switch (featureKind) {
    case "graph_structure_interface":
      return [
        "REQ-L-GTL3-GRAPH",
        "REQ-L-GTL3-GRAPHVECTOR",
        "REQ-L-GTL3-GRAPHFUNCTION"
      ];
    case "graph_algebra_edge":
    case "graph_algebra_identity":
    case "graph_algebra_same_object":
      return ["REQ-L-GTL3-LAWS"];
    case "graph_algebra_compose":
      return ["REQ-L-GTL3-COMPOSE"];
    case "graph_algebra_substitute":
      return ["REQ-L-GTL3-SUBSTITUTE"];
    case "graph_algebra_recurse":
      return ["REQ-L-GTL3-RECURSE"];
    case "graph_algebra_fan_out":
    case "graph_algebra_fan_in":
    case "graph_algebra_gate":
    case "graph_algebra_promote":
      return ["REQ-L-GTL3-HOF"];
    case "operator_declarations":
      return ["REQ-L-GTL3-OPERATOR"];
    case "evaluator_declarations":
      return ["REQ-L-GTL3-EVALUATOR"];
    case "rule_declarations":
      return ["REQ-L-GTL3-RULE"];
    case "f_star_compute_composition":
      return ["REQ-L-GTL3-COMPUTE-NOTATION", "REQ-R-ABG3-FN-COMPOSITION"];
    case "hook_boundaries":
      return ["REQ-L-GTL3-HOOKS"];
    case "target_carrier_contract_law":
      return ["REQ-L-GTL3-GRAPHVECTOR", "REQ-L-GTL3-CONTRACT-LAW-API"];
    case "edge_closure_contract_law":
      return ["REQ-R-ABG3-ASSURANCE", "REQ-R-ABG3-INTERPRET"];
    case "prompt_typed_asset_law":
      return ["REQ-L-GTL3-ASSET-SURFACE"];
    case "selection_refinement_synthesis_subwork":
      return [
        "REQ-L-GTL3-SELECTION-BOUNDARY",
        "REQ-L-GTL3-SYNTHESIS",
        "REQ-L-GTL3-SUBWORK"
      ];
    case "module_publication":
      return ["REQ-L-GTL3-MODULE"];
    case "public_start_binding":
      return ["REQ-L-GTL3-JOB", "REQ-R-ABG3-RUN"];
    case "job_binding":
      return ["REQ-L-GTL3-JOB"];
    case "role_binding":
      return ["REQ-L-GTL3-ROLE"];
    case "external_tool_gates":
      return ["REQ-L-GTL3-HOOKS", "REQ-R-ABG3-TRANSPORT"];
    case "active_source_identity":
      return ["REQ-L-GTL3-IDENTITY"];
    default:
      throw new TypeError(`unknown GTL feature ${featureKind}`);
  }
}

function featureCoverageManifest(presentFeatures) {
  return {
    kind: "gtl_program_feature_coverage_manifest",
    manifestRef: "feature-coverage://t252/consensus-first-census",
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API",
    rows: GTL_PROGRAM_T153_FEATURE_KINDS.map((featureKind) => {
      const disposition = presentFeatures.has(featureKind)
        ? "present"
        : "not_used";
      return {
        featureKind,
        disposition,
        ownerClassification:
          GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS[featureKind],
        requirementRefs: featureRequirementRefs(featureKind),
        evidenceRefs:
          disposition === "present"
            ? [`body://${CONSENSUS_BODY_DIGEST}/${featureKind}`]
            : [],
        reasonRefs:
          disposition === "not_used"
            ? [`non-scope://T-252/${featureKind}`]
            : []
      };
    })
  };
}

function expectedCoverage() {
  return {
    catalogGraphFunctionCount: 0,
    publishedGraphFunctionCount:
      ABG_CONSENSUS_GTL_PROGRAM.submittedGraphFunctions.length,
    graphVectorCount: ABG_CONSENSUS_GTL_PROGRAM.submittedGraphFunctions.reduce(
      (count, graphFunction) =>
        count + materializeGraphFunction(graphFunction).vectors.length,
      0
    ),
    targetCarrierContractCount: 0,
    edgeClosureContractCount: 0,
    overlayCount: 0,
    publicStartTargetCount: 0,
    promptAssetCount: 0,
    pluginContractCount: 0,
    sourceIdentitySurfaceCount: 0
  };
}

function typecheckRoot(featureManifest) {
  return typecheckGtlProgram({
    subjectRef: "gtl://module/abg/consensus",
    abiPackageVersion: "5.0.0-dev.0",
    expectedCoverage: expectedCoverage(),
    featureCoverageManifest: featureManifest,
    modules: [ABG_CONSENSUS_GTL_PROGRAM.module]
  });
}

function deriveFeatureCoverageFromCompiler() {
  const provisional = typecheckRoot(featureCoverageManifest(new Set()));
  const presentFeatures = new Set(
    provisional.issues
      .filter(
        (issue) =>
          issue.ruleRef ===
          "abg://gtl-program/feature-coverage/not-used-contradiction"
      )
      .map((issue) => issue.surfaceRef)
  );
  return {
    manifest: featureCoverageManifest(presentFeatures),
    observationBasis: {
      provisionalReportDigest: stableSha256Digest(provisional),
      observedFeatureKinds: [...presentFeatures].sort()
    }
  };
}

function termChildren(term) {
  switch (term.kind) {
    case "c_retry":
      return [["term", term.term]];
    case "c_compose":
      return [
        ["left", term.left],
        ["right", term.right]
      ];
    case "c_edge":
      return [
        ["transform", term.transform],
        ["evaluate", term.evaluate],
        ["consequence", term.consequence]
      ];
    case "c_batch":
      return term.tasks.map((task, index) => [`tasks[${index}]`, task]);
    case "c_of":
    case "c_identity":
    case "c_workflow":
      return [];
    default:
      throw new TypeError(`unaccounted C constructor ${JSON.stringify(term.kind)}`);
  }
}

function normalizeCAlgebraDiagnostic(diagnostic, subject) {
  const compilerPath = diagnostic.path.startsWith("$.term")
    ? diagnostic.path.slice("$.term".length)
    : diagnostic.path === "$"
      ? ""
      : diagnostic.path.slice(1);
  return {
    source: "c_algebra",
    observationClass: "compiler_observed_gap",
    classification: diagnostic.classification,
    diagnosticId: diagnostic.diagnosticId,
    path: `${subject.bodyPath}${compilerPath}`,
    rootSurfaceRef: `${subject.rootSurfaceRef}${compilerPath}`,
    rawProgramAddress: subject.rawProgramAddress,
    decodedTermAddress: subject.decodedTermAddress,
    axiomRef: diagnostic.axiomRef,
    requirementRef: diagnostic.requirementRef,
    authorityRefs: diagnosticAuthorityRefs(diagnostic),
    expectedRelation: diagnostic.expectedRelation,
    actualRelation:
      diagnostic.actualRelation.length <= 512
        ? diagnostic.actualRelation
        : null,
    actualRelationDigest: stableSha256Digest(diagnostic.actualRelation),
    evidenceRefs: diagnostic.evidenceRefs,
    evidenceRefsDigest: stableSha256Digest(diagnostic.evidenceRefs),
    repairAffordances: diagnostic.repairAffordances
  };
}

function normalizeRelationDiagnostic(source, diagnostic, subject) {
  return {
    source,
    observationClass: "compiler_observed_gap",
    classification: diagnostic.classification,
    diagnosticId: diagnostic.diagnosticId,
    path: `${subject.bodyPath}${
      diagnostic.path === "$" ? "" : diagnostic.path.slice(1)
    }`,
    rootSurfaceRef: `${subject.rootSurfaceRef}${
      diagnostic.path === "$" ? "$" : diagnostic.path.slice(1)
    }`,
    rawBodyAddress: subject.rawBodyAddress,
    axiomRef: diagnostic.axiomRef ?? null,
    requirementRef: null,
    authorityRefs: diagnosticAuthorityRefs({
      ...diagnostic,
      requirementRef: null
    }),
    expectedRelation: diagnostic.expectedRelation,
    actualRelation:
      diagnostic.actualRelation.length <= 512
        ? diagnostic.actualRelation
        : null,
    actualRelationDigest: stableSha256Digest(diagnostic.actualRelation),
    evidenceRefs: diagnostic.evidenceRefs,
    evidenceRefsDigest: stableSha256Digest(diagnostic.evidenceRefs),
    repairAffordances: [
      diagnostic.repairAffordance ?? "realize_declared_semantics"
    ]
  };
}

function collectTermManifest(rawModule) {
  const manifest = [];
  const diagnostics = [];
  ABG_CONSENSUS_GTL_PROGRAM.submittedGraphFunctions.forEach(
    (graphFunction, graphFunctionIndex) => {
      const candidates = collectRawCProgramCandidates(
        graphFunction.declarations
      );
      if (!candidates.catalogShapeValid) {
        throw new TypeError(
          `invalid C-program catalog in ${graphFunction.name}`
        );
      }
      candidates.candidates.forEach((candidate) => {
        const program = candidate.candidate;
        if (
          typeof program !== "object" ||
          program === null ||
          typeof program.programRef !== "string" ||
          typeof program.term !== "object" ||
          program.term === null
        ) {
          throw new TypeError(
            `unaccounted program candidate in ${graphFunction.name}`
          );
        }
        const programRawAddress = rawProgramAddress(
          graphFunction,
          graphFunctionIndex,
          candidate
        );
        const rawProgramValue = resolveT252CensusAddress(
          rawModule,
          programRawAddress
        );
        const logicalProgramSuffix = rawCProgramCandidatePath(candidate).slice(1);
        const visit = (term, decodedSegments, depth) => {
          const compilerSubject = { ...program, term };
          const compilation = compileCAlgebraToHog(compilerSubject);
          const decodedTermAddress = address(
            decodedSegments,
            "decoded_c_program"
          );
          const bodyPath = `${programRawAddress.display}#decoded${decodedTermAddress.display.slice(
            1
          )}`;
          const rootSurfaceRef = `${graphFunction.name}${logicalProgramSuffix}${decodedTermAddress.display.slice(
            1
          )}`;
          const manifestRef = `term-subject://t252/${String(manifest.length)}`;
          manifest.push({
            manifestRef,
            bodyPath,
            rootSurfaceRef,
            executionDeclarationSurfaceRef: `${graphFunction.name}#execution-declarations`,
            rawProgramAddress: programRawAddress,
            rawProgramValueDigest: stableSha256Digest(rawProgramValue),
            decodedTermAddress,
            canonicalTermDigest: stableSha256Digest(term),
            compilerSubjectDigest: stableSha256Digest(compilerSubject),
            compilerSubjectRef: program.programRef,
            graphFunctionRef: graphFunction.name,
            constructorKind: term.kind,
            depth,
            compilerAccepted: compilation.accepted
          });
          diagnostics.push(
            ...compilation.diagnostics.map((diagnostic) =>
              normalizeCAlgebraDiagnostic(diagnostic, {
                bodyPath,
                rootSurfaceRef,
                rawProgramAddress: programRawAddress,
                decodedTermAddress
              })
            )
          );
          for (const [childPath, child] of termChildren(term)) {
            const childSegments = childPath.startsWith("tasks[")
              ? [
                  "tasks",
                  Number.parseInt(childPath.slice("tasks[".length, -1), 10)
                ]
              : [childPath];
            visit(child, [...decodedSegments, ...childSegments], depth + 1);
          }
        };
        visit(program.term, ["term"], 0);
      });
    }
  );
  return { manifest, diagnostics };
}

function collectRelationDiagnostics(rawModule) {
  const diagnostics = [];
  const vectorBindings = [];
  const graphOperatorManifest = [];
  const graphEdgeManifest = [];
  const vectorSelectionManifest = [];
  ABG_CONSENSUS_GTL_PROGRAM.submittedGraphFunctions.forEach(
    (graphFunction, graphFunctionIndex) => {
      const bodyPath = `$.graphFunctions[${graphFunctionIndex}]`;
      const graphFunctionRawAddress = rawGraphFunctionAddress(graphFunctionIndex);
      const rawGraphFunction = resolveT252CensusAddress(
        rawModule,
        graphFunctionRawAddress
      );
      const declarationKeys = graphFunction.declarations.entries.map(
        (entry) => entry.key
      );
      const hof = compileHofRelation({
        graphFunction,
        graphFunctions: ABG_CONSENSUS_GTL_PROGRAM.submittedGraphFunctions
      });
      diagnostics.push(
        ...hof.diagnostics.map((diagnostic) =>
          normalizeRelationDiagnostic("hof", diagnostic, {
            bodyPath,
            rootSurfaceRef: graphFunction.name,
            rawBodyAddress: graphFunctionRawAddress
          })
        )
      );
      if (declarationKeys.includes("gtl.hof_application")) {
        graphOperatorManifest.push({
          manifestRef: `operator-subject://t252/${String(
            graphOperatorManifest.length
          )}`,
          bodyPath,
          rawBodyAddress: graphFunctionRawAddress,
          rawBodyValueDigest: stableSha256Digest(rawGraphFunction),
          rootSurfaceRefs: Object.freeze([
            `${graphFunction.name}$`,
            `${graphFunction.name}#execution-declarations`
          ]),
          constructorKind: "fan_out",
          compilerSubjectRef: graphFunction.name,
          canonicalTermDigest: stableSha256Digest(graphFunction),
          structuralDeclarationStatus: "present",
          compilerObservationStatus: "semantic_not_realized"
        });
      }
      if (declarationKeys.includes("recursion")) {
        graphOperatorManifest.push({
          manifestRef: `operator-subject://t252/${String(
            graphOperatorManifest.length
          )}`,
          bodyPath,
          rawBodyAddress: graphFunctionRawAddress,
          rawBodyValueDigest: stableSha256Digest(rawGraphFunction),
          rootSurfaceRefs: Object.freeze([
            `${graphFunction.name}$`,
            `${graphFunction.name}#execution-declarations`
          ]),
          constructorKind: "recurse",
          compilerSubjectRef: graphFunction.name,
          canonicalTermDigest: stableSha256Digest(graphFunction),
          structuralDeclarationStatus: "present",
          compilerObservationStatus: "no_diagnostic_surface"
        });
      }
      if (graphFunction.name.startsWith("fan_in(")) {
        graphOperatorManifest.push({
          manifestRef: `operator-subject://t252/${String(
            graphOperatorManifest.length
          )}`,
          bodyPath,
          rawBodyAddress: graphFunctionRawAddress,
          rawBodyValueDigest: stableSha256Digest(rawGraphFunction),
          rootSurfaceRefs: Object.freeze([
            `${graphFunction.name}$`,
            `${graphFunction.name}#execution-declarations`
          ]),
          constructorKind: "fan_in",
          compilerSubjectRef: graphFunction.name,
          canonicalTermDigest: stableSha256Digest(graphFunction),
          structuralDeclarationStatus: "missing_name_only_observation",
          compilerObservationStatus: "no_diagnostic_surface"
        });
      }

      const graph = materializeGraphFunction(graphFunction);
      graph.vectors.forEach((graphVector, graphVectorIndex) => {
        const vectorPath = `${bodyPath}.template.graph.vectors[${graphVectorIndex}]`;
        const graphVectorRawAddress = rawGraphVectorAddress(
          graphFunctionIndex,
          graphVectorIndex
        );
        const rawGraphVector = resolveT252CensusAddress(
          rawModule,
          graphVectorRawAddress
        );
        const compositionEntry = graphVector.declarations.entries.find(
          (entry) => entry.key === "abg.fn_composition"
        );
        const compositionPolicyContextRefs =
          compositionEntry?.value.kind === "hook_ref"
            ? (compositionEntry.value.value.config.entries.find(
                (entry) => entry.key === "policy_context_refs"
              )?.value.value ?? [])
            : [];
        const compositionAssuranceContextRefs =
          compositionEntry?.value.kind === "hook_ref"
            ? (compositionEntry.value.value.config.entries.find(
                (entry) => entry.key === "assurance_context_refs"
              )?.value.value ?? [])
            : [];
        const compositionOwningDeclarationEntry =
          compositionEntry?.value.kind === "hook_ref"
            ? compositionEntry.value.value.config.entries.find(
                (entry) => entry.key === "owning_declaration_ref"
              )
            : undefined;
        const compositionOwningDeclarationRef =
          compositionOwningDeclarationEntry?.value.kind === "scalar"
            ? compositionOwningDeclarationEntry.value.value
            : null;
        graphEdgeManifest.push({
          manifestRef: `edge-subject://t252/${String(
            graphEdgeManifest.length
          )}`,
          bodyPath: vectorPath,
          rawBodyAddress: graphVectorRawAddress,
          rawBodyValueDigest: stableSha256Digest(rawGraphVector),
          constructorKind: "graph_edge",
          graphFunctionRef: graphFunction.name,
          graphVectorRef: graphVector.name,
          sourceNodeRefs: graphVector.source.map((node) => node.id),
          targetNodeRef: graphVector.target.id,
          operatorRefs: graphVector.operators.map((operator) => operator.name),
          operatorRegimes: graphVector.operators.map(
            (operator) => operator.regime
          ),
          evaluatorRefs: graphVector.evaluators.map((evaluator) => evaluator.name),
          ruleRef: graphVector.rule?.name ?? null,
          declarationKeys: graphVector.declarations.entries.map(
            (entry) => entry.key
          ),
          compositionPolicyContextRefs,
          compositionAssuranceContextRefs,
          compositionOwningDeclarationRef,
          canonicalEdgeDigest: stableSha256Digest(graphVector)
        });
        if (compositionEntry !== undefined) {
          try {
            resolveAbgFnCompositionSelection({
              graphFunction,
              vector: graphVector
            });
          } catch (error) {
            const actualRelation =
              error instanceof Error ? error.message : String(error);
            const hostMismatch = actualRelation.includes(
              "host_graph_function_ref mismatch"
            );
            diagnostics.push({
              source: "abg.fn_composition",
              observationClass: "compiler_observed_invalid_authoring_relation",
              classification: "invalid_program",
              diagnosticId: hostMismatch
                ? "abg-fn-composition-host-mismatch"
                : "abg-fn-composition-invalid",
              gapFamily: hostMismatch
                ? "derived_graph_function_composition_host_rebinding"
                : "unclassified_compiler_surface",
              path: `${vectorPath}.declarations["abg.fn_composition"]`,
              rootSurfaceRef: `${graphFunction.name}.template.graph.vectors[${String(
                graphVectorIndex
              )}].declarations["abg.fn_composition"]`,
              rawBodyAddress: graphVectorRawAddress,
              axiomRef: null,
              requirementRef: "REQ-R-ABG3-FN-COMPOSITION",
              authorityRefs: [
                "requirement:REQ-R-ABG3-FN-COMPOSITION",
                "requirement:REQ-L-GTL3-GRAPHFUNCTION"
              ],
              expectedRelation:
                "derived GraphFunction identity owns a composition contract rebound from its lawful source declaration without body-local rehosting",
              actualRelation:
                actualRelation.length <= 512 ? actualRelation : null,
              actualRelationDigest: stableSha256Digest(actualRelation),
              evidenceRefs: [
                `graph-function:${graphFunction.name}`,
                `graph-vector:${graphVector.name}`
              ],
              evidenceRefsDigest: stableSha256Digest([
                `graph-function:${graphFunction.name}`,
                `graph-vector:${graphVector.name}`
              ]),
              repairAffordances: [
                "realize_generic_derived_graph_function_composition_host_rebinding"
              ]
            });
          }
        }
        const compilation = compileGraphVectorCProgramSelection({
          graphFunction,
          graphVector
        });
        if (compilation.binding !== null) {
          const bindingRow = {
            bodyPath: vectorPath,
            rawBodyAddress: graphVectorRawAddress,
            rawBodyValueDigest: stableSha256Digest(rawGraphVector),
            graphFunctionRef: graphFunction.name,
            graphVectorRef: graphVector.name,
            selectedProgramRef: compilation.binding.selectedProgramRef,
            bindingDigest: compilation.binding.bindingDigest
          };
          vectorBindings.push(bindingRow);
          vectorSelectionManifest.push({
            ...bindingRow,
            manifestRef: `vector-selection://t252/${String(
              vectorSelectionManifest.length
            )}`,
            constructorKind: "graph_vector_program_selection",
            diagnosticPaths: compilation.diagnostics.map(
              (diagnostic) => `${graphFunction.name}${diagnostic.path.slice(1)}`
            )
          });
        }
        diagnostics.push(
          ...compilation.diagnostics.map((diagnostic) =>
            normalizeRelationDiagnostic(
              "graph_vector_program_selection",
              diagnostic,
              {
                bodyPath,
                rootSurfaceRef: graphFunction.name,
                rawBodyAddress: graphVectorRawAddress
              }
            )
          )
        );
      });
    }
  );
  return {
    diagnostics,
    vectorBindings,
    graphOperatorManifest,
    graphEdgeManifest,
    vectorSelectionManifest
  };
}

function countsBy(values, identity) {
  const counts = new Map();
  for (const value of values) {
    const key = identity(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right))
  );
}

function rootDiagnosticId(issue) {
  const match = /^(gtl-[a-z0-9-]+):/u.exec(issue.message);
  return match?.[1] ?? issue.ruleRef;
}

function compactRootIssue(issue, ordinal) {
  return {
    ordinal,
    kind: issue.kind,
    severity: issue.severity,
    diagnosticId: rootDiagnosticId(issue),
    ruleRef: issue.ruleRef,
    surfaceKind: issue.surfaceKind,
    surfaceRef:
      issue.surfaceRef.length <= 512 ? issue.surfaceRef : null,
    surfaceRefDigest: stableSha256Digest(issue.surfaceRef),
    message: issue.message.length <= 512 ? issue.message : null,
    messageDigest: stableSha256Digest(issue.message),
    evidenceRefsDigest: stableSha256Digest(issue.evidenceRefs),
    admissibleRepairsDigest: stableSha256Digest(issue.admissibleRepairs),
    authorityRefs: uniqueInOrder([
      `rule:${issue.ruleRef}`,
      ...issue.evidenceRefs.filter((ref) =>
        /^(?:axiom|requirement|policy|standard):/u.test(ref)
      )
    ])
  };
}

function buildRootIssuePersistence(issues) {
  const catalogs = {
    surfaceRefs: new Map(),
    evidenceRefSets: new Map(),
    admissibleRepairSets: new Map()
  };
  const intern = (catalogName, value) => {
    const digest = stableSha256Digest(value);
    const ref = `root-${catalogName}://t252/${digest.slice("sha256:".length)}`;
    catalogs[catalogName].set(ref, Object.freeze({ ref, digest, value }));
    return ref;
  };
  const ledger = issues.map((issue, ordinal) => ({
    ...compactRootIssue(issue, ordinal),
    surfaceRefCatalogRef: intern("surfaceRefs", issue.surfaceRef),
    evidenceRefsCatalogRef: intern("evidenceRefSets", issue.evidenceRefs),
    admissibleRepairsCatalogRef: intern(
      "admissibleRepairSets",
      issue.admissibleRepairs
    )
  }));
  return {
    ledger,
    catalogs: Object.fromEntries(
      Object.entries(catalogs).map(([catalogName, rows]) => [
        catalogName,
        [...rows.values()].sort((left, right) => left.ref.localeCompare(right.ref))
      ])
    )
  };
}

function gapFamilyForRootIssue(issue) {
  const diagnosticId = rootDiagnosticId(issue);
  if (diagnosticId === "gtl-c-unrealized-workflow-lift") {
    return "workflow_c_runtime";
  }
  if (diagnosticId === "gtl-c-unrealized-retry") {
    return "c_retry_runtime_and_policy_join";
  }
  if (diagnosticId === "gtl-c-unrealized-vector-program-selection") {
    return "graph_vector_program_runtime_selection";
  }
  if (diagnosticId === "gtl-hof-unrealized-fan-out") {
    return "typed_fan_out_runtime";
  }
  if (issue.ruleRef.includes("target-carrier")) {
    return "target_carrier_contract";
  }
  if (issue.ruleRef.includes("edge-closure")) {
    return "edge_closure_contract";
  }
  if (issue.ruleRef.includes("feature-coverage/present-without-inventory")) {
    return "conformance_inventory_extraction";
  }
  if (issue.ruleRef.includes("coverage/expected-count-nonzero")) {
    return "conformance_scope_proportionality";
  }
  if (
    issue.ruleRef === "abg://gtl-program/c-algebra/semantic-not-realized" &&
    issue.message.includes("omits current interpreter anchors")
  ) {
    return "c_program_runtime_shape_generalization";
  }
  if (issue.ruleRef.includes("traversal-unit/")) {
    return "traversal_execution_contracts";
  }
  return "unclassified_compiler_surface";
}

function uniqueInOrder(values) {
  return [...new Set(values)];
}

function collectRootConformanceManifest(fullRootReport, graphEdgeManifest) {
  const units = fullRootReport.traversalUnitProjection.units;
  if (units.length !== graphEdgeManifest.length) {
    throw new TypeError(
      `root traversal subject mismatch: ${String(units.length)} units for ${String(
        graphEdgeManifest.length
      )} graph edges`
    );
  }
  const vectorSurfaceRefs = uniqueInOrder(
    fullRootReport.issues
      .filter(
        (issue) =>
          issue.surfaceKind === "target_carrier_contract" ||
          issue.surfaceKind === "edge_closure_contract"
      )
      .map((issue) => issue.surfaceRef)
  );
  if (vectorSurfaceRefs.length !== graphEdgeManifest.length) {
    throw new TypeError(
      `root vector subject mismatch: ${String(
        vectorSurfaceRefs.length
      )} conformance subjects for ${String(graphEdgeManifest.length)} graph edges`
    );
  }

  return graphEdgeManifest.map((edge, index) => {
    const unit = units[index];
    const vectorSurfaceRef = vectorSurfaceRefs[index];
    if (
      unit.graphFunctionRef !== edge.graphFunctionRef ||
      unit.graphVectorRef !== edge.graphVectorRef ||
      !vectorSurfaceRef.startsWith(`${edge.graphFunctionRef}/`) ||
      !vectorSurfaceRef.includes(`/${edge.graphVectorRef}#`)
    ) {
      throw new TypeError(
        `root traversal ordering mismatch at ${edge.bodyPath}: ${unit.graphFunctionRef}::${unit.graphVectorRef}`
      );
    }
    const rootIssueOrdinals = fullRootReport.issues
      .map((issue, ordinal) => ({ issue, ordinal }))
      .filter(
        ({ issue }) =>
          issue.surfaceRef === unit.unitRef ||
          issue.surfaceRef === vectorSurfaceRef
      )
      .map(({ ordinal }) => ordinal);
    return {
      manifestRef: `root-subject://t252/${String(index)}`,
      bodyPath: edge.bodyPath,
      rawBodyAddress: edge.rawBodyAddress,
      rawBodyValueDigest: edge.rawBodyValueDigest,
      constructorKind: "full_root_graph_vector_subject",
      graphFunctionRef: edge.graphFunctionRef,
      graphVectorRef: edge.graphVectorRef,
      graphEdgeDigest: edge.canonicalEdgeDigest,
      traversalUnitRef: unit.unitRef,
      traversalUnitDigest: stableSha256Digest(unit),
      vectorSurfaceRefDigest: stableSha256Digest(vectorSurfaceRef),
      rootIssueOrdinals,
      rootIssueDigest: stableSha256Digest(
        rootIssueOrdinals.map((ordinal) =>
          compactRootIssue(fullRootReport.issues[ordinal], ordinal)
        )
      )
    };
  });
}

function probeRowSurfaceRefs(row) {
  return uniqueInOrder([
    ...(typeof row.rootSurfaceRef === "string" ? [row.rootSurfaceRef] : []),
    ...(typeof row.executionDeclarationSurfaceRef === "string"
      ? [row.executionDeclarationSurfaceRef]
      : []),
    ...(Array.isArray(row.rootSurfaceRefs) ? row.rootSurfaceRefs : []),
    ...(Array.isArray(row.diagnosticPaths) ? row.diagnosticPaths : [])
  ]);
}

function reconcileRootIssues(input) {
  const manifestRefByOrdinal = new Map();
  for (const row of input.rootConformanceManifest) {
    for (const ordinal of row.rootIssueOrdinals) {
      manifestRefByOrdinal.set(ordinal, row.manifestRef);
    }
  }
  const selectionRefBySurfaceRef = new Map();
  input.vectorSelectionManifest.forEach((row) => {
    const manifestRef = row.manifestRef;
    for (const surfaceRef of row.diagnosticPaths) {
      selectionRefBySurfaceRef.set(surfaceRef, manifestRef);
    }
  });
  input.fullRootReport.issues.forEach((issue, ordinal) => {
    if (!manifestRefByOrdinal.has(ordinal)) {
      const selectionRef = selectionRefBySurfaceRef.get(issue.surfaceRef);
      if (selectionRef !== undefined) {
        manifestRefByOrdinal.set(ordinal, selectionRef);
      }
    }
  });

  const globalGroups = new Map();
  input.fullRootReport.issues.forEach((issue, ordinal) => {
    if (manifestRefByOrdinal.has(ordinal)) {
      return;
    }
    const gapFamily = gapFamilyForRootIssue(issue);
    const key = `${issue.surfaceKind}|${issue.ruleRef}|${gapFamily}`;
    const group = globalGroups.get(key) ?? {
      surfaceKind: issue.surfaceKind,
      ruleRef: issue.ruleRef,
      diagnosticId: rootDiagnosticId(issue),
      gapFamily,
      issueOrdinals: []
    };
    group.issueOrdinals.push(ordinal);
    globalGroups.set(key, group);
  });
  const globalCoverageManifest = [...globalGroups.values()].map(
    (group, index) => {
      const manifestRef = `global-coverage://t252/${String(index)}`;
      for (const ordinal of group.issueOrdinals) {
        manifestRefByOrdinal.set(ordinal, manifestRef);
      }
      const issueProbeLinks = group.issueOrdinals.map((ordinal) => {
        const issueSurfaceRef = input.fullRootReport.issues[ordinal].surfaceRef;
        const exactRefs = input.localProbeManifest
          .filter((row) => probeRowSurfaceRefs(row).includes(issueSurfaceRef))
          .map((row) => row.manifestRef);
        return {
          rootIssueOrdinal: ordinal,
          linkBasis:
            exactRefs.length > 0
              ? "exact_root_surface_ref"
              : "module_scope_root_subjects",
          linkedProbeManifestRefs:
            exactRefs.length > 0
              ? uniqueInOrder(exactRefs)
              : input.rootConformanceManifest.map((row) => row.manifestRef)
        };
      });
      const linkedProbeManifestRefs = uniqueInOrder(
        issueProbeLinks.flatMap((row) => row.linkedProbeManifestRefs)
      );
      return {
        manifestRef,
        constructorKind: "global_compiler_coverage_subject",
        surfaceKind: group.surfaceKind,
        ruleRef: group.ruleRef,
        diagnosticId: group.diagnosticId,
        gapFamily: group.gapFamily,
        linkBasis:
          issueProbeLinks.every(
            (row) => row.linkBasis === "exact_root_surface_ref"
          )
            ? "exact_root_surface_ref"
            : "module_scope_root_subjects",
        linkedProbeManifestRefs,
        issueProbeLinks,
        issueOrdinals: group.issueOrdinals,
        issueDigest: stableSha256Digest(
          group.issueOrdinals.map((ordinal) =>
            compactRootIssue(input.fullRootReport.issues[ordinal], ordinal)
          )
        )
      };
    }
  );
  const rows = input.fullRootReport.issues.map((issue, ordinal) => ({
    rootIssueOrdinal: ordinal,
    diagnosticId: rootDiagnosticId(issue),
    gapFamily: gapFamilyForRootIssue(issue),
    manifestRef: manifestRefByOrdinal.get(ordinal) ?? null,
    linkedProbeManifestRefs:
      globalCoverageManifest.find((group) =>
        group.issueOrdinals.includes(ordinal)
      )?.issueProbeLinks.find((link) => link.rootIssueOrdinal === ordinal)
        ?.linkedProbeManifestRefs ?? []
  }));
  const total = rows.every((row) => row.manifestRef !== null);
  return { rows, globalCoverageManifest, total };
}

function reconcileDirectDiagnosticsWithRoot(diagnostics, rootIssues) {
  const rootOrdinalsByKey = new Map();
  rootIssues.forEach((issue, ordinal) => {
    const key = `${rootDiagnosticId(issue)}|${issue.surfaceRef}`;
    const ordinals = rootOrdinalsByKey.get(key) ?? [];
    ordinals.push(ordinal);
    rootOrdinalsByKey.set(key, ordinals);
  });
  const consumedByKey = new Map();
  const rows = diagnostics.map((diagnostic, diagnosticOrdinal) => {
    const key = `${diagnostic.diagnosticId}|${diagnostic.rootSurfaceRef}`;
    const consumed = consumedByKey.get(key) ?? 0;
    const rootIssueOrdinal = rootOrdinalsByKey.get(key)?.[consumed] ?? null;
    if (rootIssueOrdinal !== null) {
      consumedByKey.set(key, consumed + 1);
    }
    return {
      diagnosticOrdinal,
      diagnosticId: diagnostic.diagnosticId,
      gapFamily: diagnostic.gapFamily ?? null,
      rootIssueOrdinal,
      reconciliationStatus:
        rootIssueOrdinal === null ? "standalone_probe_gap" : "root_reconciled"
    };
  });
  return {
    rows,
    standaloneDiagnostics: rows
      .filter((row) => row.reconciliationStatus === "standalone_probe_gap")
      .map((row) => diagnostics[row.diagnosticOrdinal])
  };
}

export function deriveCompilerCoverage(input) {
  const termCounts = countsBy(
    input.termManifest,
    (row) => row.constructorKind
  );
  const operatorCounts = countsBy(
    input.graphOperatorManifest,
    (row) => row.constructorKind
  );
  const diagnosticIds = new Set(
    input.diagnostics.map((diagnostic) => diagnostic.diagnosticId)
  );
  const selectedVectorCount = input.vectorBindings.length;
  const compositionCount = input.graphEdgeManifest.filter((row) =>
    row.declarationKeys.includes("abg.fn_composition")
  ).length;
  const fhBoundaryCount = input.graphEdgeManifest.filter((row) =>
    row.operatorRegimes.includes("F_H")
  ).length;
  const fpBoundaryCount = input.graphEdgeManifest.filter((row) =>
    row.operatorRegimes.includes("F_P")
  ).length;
  const carrierFieldRefs = uniqueInOrder(
    input.graphEdgeManifest.flatMap((row) =>
      row.compositionPolicyContextRefs.filter((ref) =>
        /^[A-Z][A-Za-z0-9]*\.[A-Za-z][A-Za-z0-9]*$/u.test(ref)
      )
    )
  );
  const instructionFieldRefs = carrierFieldRefs.filter((ref) =>
    ref.endsWith(".instructionContractRef")
  );
  const fpResultAdmissionAssuranceRefs = uniqueInOrder(
    input.graphEdgeManifest.flatMap((row) =>
      row.operatorRegimes.includes("F_P")
        ? row.compositionAssuranceContextRefs.filter((ref) =>
            ref.includes("result-admission")
          )
        : []
    )
  );
  const vectorBindingByHost = new Map(
    input.vectorBindings.map((row) => [
      `${row.graphFunctionRef}|${row.graphVectorRef}`,
      row
    ])
  );
  const compositionOwningDeclarationPairs = input.graphEdgeManifest.flatMap(
    (row) => {
      const binding = vectorBindingByHost.get(
        `${row.graphFunctionRef}|${row.graphVectorRef}`
      );
      return binding === undefined || row.compositionOwningDeclarationRef === null
        ? []
        : [
            {
              graphFunctionRef: row.graphFunctionRef,
              graphVectorRef: row.graphVectorRef,
              edgeManifestRef: row.manifestRef,
              selectedProgramRef: binding.selectedProgramRef,
              compositionOwningDeclarationRef:
                row.compositionOwningDeclarationRef,
              authoredValuesEqual:
                row.compositionOwningDeclarationRef ===
                binding.selectedProgramRef,
              selectionBindingDigest: binding.bindingDigest
            }
          ];
    }
  );
  const reliedOnConstructs = [
    { construct: "C.of", authoredOccurrences: termCounts.c_of ?? 0 },
    { construct: "C.retry", authoredOccurrences: termCounts.c_retry ?? 0 },
    { construct: "workflow.C", authoredOccurrences: termCounts.c_workflow ?? 0 },
    { construct: "fan_out", authoredOccurrences: operatorCounts.fan_out ?? 0 },
    { construct: "fan_in", authoredOccurrences: operatorCounts.fan_in ?? 0 },
    { construct: "recurse", authoredOccurrences: operatorCounts.recurse ?? 0 },
    {
      construct: "graph_vector_program_selection",
      authoredOccurrences: selectedVectorCount
    },
    { construct: "abg.fn_composition", authoredOccurrences: compositionCount },
    {
      construct: "composition_owning_declaration_join",
      authoredOccurrences: compositionOwningDeclarationPairs.length
    },
    { construct: "F_H_pending_boundary", authoredOccurrences: fhBoundaryCount },
    {
      construct: "F_P_result_admission_boundary",
      authoredOccurrences: fpBoundaryCount
    },
    {
      construct: "carrier_field_indirection",
      authoredOccurrences: carrierFieldRefs.length
    }
  ].filter((row) => row.authoredOccurrences > 0);
  const admittedCOf = input.termManifest.filter(
    (row) => row.constructorKind === "c_of" && row.compilerAccepted
  );
  const compilerAcceptedConstructs = admittedCOf.length === 0
    ? []
    : [
        {
          construct: "C.of",
          authoredOccurrences: admittedCOf.length,
          observationClass: "compiler_observed_acceptance",
          evidenceDigest: stableSha256Digest(admittedCOf)
        }
      ];
  const compilerObservedBlockingConstructs = uniqueInOrder([
    ...(diagnosticIds.has("gtl-c-unrealized-workflow-lift")
      ? ["workflow.C"]
      : []),
    ...(diagnosticIds.has("gtl-c-unrealized-retry") ? ["C.retry"] : []),
    ...(diagnosticIds.has("gtl-hof-unrealized-fan-out") ? ["fan_out"] : []),
    ...(diagnosticIds.has("gtl-c-unrealized-vector-program-selection")
      ? ["graph_vector_program_selection"]
      : []),
    ...input.rootIssueFamilies,
    ...input.standaloneDiagnostics.map(
      (diagnostic) => diagnostic.gapFamily ?? "unclassified_compiler_surface"
    )
  ]);
  const nonDiagnosticGaps = [];
  for (const row of input.graphOperatorManifest) {
    if (row.compilerObservationStatus === "no_diagnostic_surface") {
      nonDiagnosticGaps.push({
        construct: row.constructorKind,
        gapFamily:
          row.constructorKind === "fan_in"
            ? "typed_fan_in_structure_and_runtime"
            : "typed_recurse_policy_and_runtime",
        observationClass: "compiler_observability_gap",
        reason: `${row.structuralDeclarationStatus}; the first-snapshot compiler exposes no diagnostic or positive judgment for this construct`,
        authorityRefs: [
          row.constructorKind === "fan_in"
            ? "requirement:REQ-L-GTL3-HOF"
            : "requirement:REQ-L-GTL3-RECURSE"
        ],
        evidenceRefs: [row.manifestRef],
        repairAffordances: ["add_generic_compiler_and_runtime_judgment"],
        evidenceDigest: stableSha256Digest(row)
      });
    }
  }
  if ((operatorCounts.fan_out ?? 0) > 0 && (termCounts.c_batch ?? 0) === 0) {
    nonDiagnosticGaps.push({
      construct: "fan_out_to_C.batch",
      gapFamily: "typed_fan_out_batch_projection",
      observationClass: "design_relation_gap",
      reason: "fan_out is present but the body and compiler expose no typed ordered-task projection",
      authorityRefs: ["requirement:REQ-L-GTL3-HOF"],
      evidenceRefs: input.graphOperatorManifest
        .filter((row) => row.constructorKind === "fan_out")
        .map((row) => row.manifestRef),
      repairAffordances: ["realize_generic_ordered_batch_projection"],
      evidenceDigest: stableSha256Digest({
        fanOutRows: input.graphOperatorManifest.filter(
          (row) => row.constructorKind === "fan_out"
        ),
        cBatchCount: termCounts.c_batch ?? 0
      })
    });
  }
  if (fhBoundaryCount > 0 && !diagnosticIds.has("gtl-fh-pending-runtime-held")) {
    nonDiagnosticGaps.push({
      construct: "F_H_pending_to_runtime_held",
      gapFamily: "fh_pending_runtime_hold",
      observationClass: "design_relation_gap",
      reason: "F_H boundary is present but no compiler judgment proves held rather than graph-success truth",
      authorityRefs: ["requirement:REQ-R-ABG3-HANDLERS"],
      evidenceRefs: input.graphEdgeManifest
        .filter((row) => row.operatorRegimes.includes("F_H"))
        .map((row) => row.manifestRef),
      repairAffordances: ["realize_public_typed_fh_hold_and_resume"],
      evidenceDigest: stableSha256Digest(
        input.graphEdgeManifest.filter((row) =>
          row.operatorRegimes.includes("F_H")
        )
      )
    });
  }
  if ((operatorCounts.recurse ?? 0) > 0) {
    nonDiagnosticGaps.push({
      construct: "recurse_policy_budget_foldback_join",
      gapFamily: "typed_recurse_policy_and_runtime",
      observationClass: "design_relation_gap",
      reason: "recurse is present but no compiler judgment joins policy budget and foldback contract",
      authorityRefs: ["requirement:REQ-L-GTL3-RECURSE"],
      evidenceRefs: input.graphOperatorManifest
        .filter((row) => row.constructorKind === "recurse")
        .map((row) => row.manifestRef),
      repairAffordances: ["realize_generic_recurse_policy_foldback_join"],
      evidenceDigest: stableSha256Digest(
        input.graphOperatorManifest.filter(
          (row) => row.constructorKind === "recurse"
        )
      )
    });
  }
  const retryFailureClassRefs = uniqueInOrder(
    input.graphEdgeManifest.flatMap((row) =>
      row.compositionPolicyContextRefs.filter((ref) =>
        ref.startsWith("failure-class://abg/")
      )
    )
  );
  if ((termCounts.c_retry ?? 0) > 0 && retryFailureClassRefs.length > 0) {
    nonDiagnosticGaps.push({
      construct: "retry_allowlist_join",
      gapFamily: "c_retry_runtime_and_policy_join",
      observationClass: "design_relation_gap",
      reason: "C.retry and declared failure classes coexist without a compiler join",
      authorityRefs: ["requirement:REQ-L-GTL3-C-ALGEBRA-008"],
      evidenceRefs: retryFailureClassRefs,
      repairAffordances: ["realize_c_retry_budget_and_allowlist_join"],
      evidenceDigest: stableSha256Digest(retryFailureClassRefs)
    });
  }
  if (carrierFieldRefs.length > 0) {
    nonDiagnosticGaps.push({
      construct: "carrier_field_indirection",
      gapFamily: "carrier_field_indirection",
      observationClass: "design_relation_gap",
      reason: "dotted carrier field refs are declared but no generic compiler/runtime resolver joins them",
      authorityRefs: ["requirement:REQ-R-ABG3-FN-COMPOSITION"],
      evidenceRefs: carrierFieldRefs,
      repairAffordances: ["realize_declared_carrier_field_resolution"],
      evidenceDigest: stableSha256Digest(carrierFieldRefs)
    });
  }
  if (compositionOwningDeclarationPairs.length > 0) {
    nonDiagnosticGaps.push({
      construct: "composition_owning_declaration_join",
      gapFamily: "composition_owning_declaration_join",
      observationClass: "compiler_observability_gap",
      reason:
        "selected program refs and fn_composition owningDeclarationRef values are authored equal, but no generic compiler/runtime judgment enforces their identity",
      authorityRefs: [
        "requirement:REQ-R-ABG3-FN-COMPOSITION",
        "requirement:REQ-L-GTL3-C-ALGEBRA-011"
      ],
      evidenceRefs: compositionOwningDeclarationPairs.flatMap((row) => [
        row.edgeManifestRef,
        `compiled-graph-vector-c-program-binding:${row.selectionBindingDigest}`
      ]),
      repairAffordances: [
        "join_composition_owning_declaration_to_selected_program_binding"
      ],
      authoredPairCount: compositionOwningDeclarationPairs.length,
      authoredEqualPairCount: compositionOwningDeclarationPairs.filter(
        (row) => row.authoredValuesEqual
      ).length,
      evidenceDigest: stableSha256Digest(compositionOwningDeclarationPairs)
    });
  }
  if (instructionFieldRefs.length > 0) {
    nonDiagnosticGaps.push({
      construct: "declared_instruction_protocol_join",
      gapFamily: "declared_instruction_protocol_join",
      observationClass: "design_relation_gap",
      reason: "instruction contract fields are declared but no compiler/runtime join proves they source the F_P request",
      authorityRefs: ["requirement:REQ-R-ABG3-HANDLERS"],
      evidenceRefs: instructionFieldRefs,
      repairAffordances: ["realize_declared_instruction_protocol_join"],
      evidenceDigest: stableSha256Digest(instructionFieldRefs)
    });
  }
  if (fpBoundaryCount > 0 && fpResultAdmissionAssuranceRefs.length > 0) {
    nonDiagnosticGaps.push({
      construct: "fp_result_contract_admission",
      gapFamily: "fp_result_contract_admission",
      observationClass: "design_relation_gap",
      reason: "F_P boundaries cite result admission but no compiler/runtime judgment proves raw-to-admitted-or-blocked flow",
      authorityRefs: ["requirement:REQ-R-ABG3-HANDLERS"],
      evidenceRefs: fpResultAdmissionAssuranceRefs,
      repairAffordances: ["realize_fp_result_contract_admission"],
      evidenceDigest: stableSha256Digest(fpResultAdmissionAssuranceRefs)
    });
  }
  if (!input.unknownFieldRejected) {
    nonDiagnosticGaps.push({
      construct: "raw_module_unknown_field_rejection",
      gapFamily: "strict_raw_module_admission",
      observationClass: "mutation_observed_gap",
      reason: "M02 admission drops an unknown module field instead of refusing it",
      authorityRefs: ["requirement:REQ-L-GTL3-MODULE"],
      evidenceRefs: [input.unknownFieldMutationDigest],
      repairAffordances: ["reject_unknown_raw_module_fields"],
      evidenceDigest: input.unknownFieldMutationDigest
    });
  }
  return {
    reliedOnConstructs,
    compilerAcceptedConstructs,
    declaredButUnjoinedConstructs: [
      ...(compositionCount > 0 &&
      input.rootIssueFamilies.includes("traversal_execution_contracts")
        ? [
            {
              construct: "abg.fn_composition",
              reason: "public declaration is present but traversal proof rows are absent",
              evidenceDigest: stableSha256Digest(
                input.graphEdgeManifest.filter((row) =>
                  row.declarationKeys.includes("abg.fn_composition")
                )
              )
            }
          ]
        : [])
    ],
    standaloneCompilerObservedGaps: input.standaloneDiagnostics.map(
      (diagnostic) => ({
        diagnosticId: diagnostic.diagnosticId,
        gapFamily: diagnostic.gapFamily ?? "unclassified_compiler_surface",
        observationClass: diagnostic.observationClass,
        evidenceRefs: diagnostic.evidenceRefs,
        evidenceDigest: diagnostic.evidenceRefsDigest
      })
    ),
    compilerObservedBlockingConstructs,
    nonDiagnosticGaps
  };
}

function countTextOccurrences(text, needle) {
  return text.split(needle).length - 1;
}

function sourceImportSpecifiers(source) {
  return [...source.matchAll(/\bfrom\s+["']([^"']+)["']/gu)].map(
    (match) => match[1]
  );
}

export function deriveRuntimeAuthorityObservation(
  rawModule,
  source = readFileSync(BODY_SOURCE_URL, "utf8")
) {
  const serializedModule = stableJson(rawModule);
  const sourceFenceCounts = Object.fromEntries(
    RUNTIME_SOURCE_FENCES.map((fence) => [
      fence,
      countTextOccurrences(source, fence)
    ])
  );
  const moduleFenceCounts = Object.fromEntries(
    RUNTIME_MODULE_FENCES.map((fence) => [
      fence,
      countTextOccurrences(serializedModule, fence)
    ])
  );
  const graphFunctions = Array.isArray(rawModule?.graphFunctions)
    ? rawModule.graphFunctions
    : null;
  const moduleJobs = Array.isArray(rawModule?.jobs) ? rawModule.jobs : null;
  const moduleRoles = Array.isArray(rawModule?.roles) ? rawModule.roles : null;
  const graphEffectArrays = graphFunctions?.map((graphFunction) =>
    Array.isArray(graphFunction?.effects) ? graphFunction.effects : null
  ) ?? null;
  const structuralShapeValid =
    graphFunctions !== null &&
    moduleJobs !== null &&
    moduleRoles !== null &&
    graphEffectArrays !== null &&
    graphEffectArrays.every((effects) => effects !== null);
  const declaredGraphEffects = structuralShapeValid
    ? graphEffectArrays.reduce((count, effects) => count + effects.length, 0)
    : null;
  const imports = sourceImportSpecifiers(source);
  const unexpectedSourceImports = imports.filter(
    (specifier) => !ALLOWED_BODY_SOURCE_IMPORTS.includes(specifier)
  );
  return {
    observationBasis: Object.freeze([
      "raw_module_structural_carriers",
      "bounded_source_import_and_call_fences"
    ]),
    observationScope:
      "bounded_sunny_day_source_and_serialized_structure_observation_not_comprehensive_static_analysis",
    sourceDigest: stableSha256Digest(source),
    moduleDigest: stableSha256Digest(rawModule),
    sourceImportSpecifiers: imports,
    unexpectedSourceImports,
    sourceFenceCounts,
    moduleFenceCounts,
    structuralShapeValid,
    declaredCarrierCounts: {
      graphEffects: declaredGraphEffects,
      moduleJobs: moduleJobs?.length ?? null,
      moduleRoles: moduleRoles?.length ?? null
    },
    noRuntimeAuthorityObserved:
      structuralShapeValid &&
      unexpectedSourceImports.length === 0 &&
      Object.values(sourceFenceCounts).every((count) => count === 0) &&
      Object.values(moduleFenceCounts).every((count) => count === 0) &&
      declaredGraphEffects === 0 &&
      moduleJobs.length === 0 &&
      moduleRoles.length === 0
  };
}

export function parseT252GapOwnership(
  ticketText,
  ticketFileName,
  ticketDirectory = "active"
) {
  const ticketId = /^(T-\d+)-/u.exec(ticketFileName)?.[1] ?? null;
  if (ticketId === null) {
    throw new TypeError(`unrecognized successor ticket ${ticketFileName}`);
  }
  const lines = ticketText.split(/\r?\n/u);
  const headingIndex = lines.findIndex(
    (line) => line.trim() === OWNERSHIP_SECTION_HEADING
  );
  if (headingIndex < 0) {
    return [];
  }
  const rows = [];
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (/^##\s/u.test(lines[index])) {
      break;
    }
    const match = /^-\s+gap_family:\s+`?([a-z][a-z0-9_]*)`?\s*$/u.exec(
      lines[index]
    );
    if (match !== null) {
      rows.push({
        gapFamily: match[1],
        ownerTicketRef: `ticket://${ticketId}`,
        sourceFileRef: `.ai-workspace/tickets/${ticketDirectory}/${ticketFileName}`,
        sourceLine: index + 1,
        sourceDigest: stableSha256Digest(ticketText)
      });
    }
  }
  return rows;
}

export function loadT252GapOwnership() {
  const ticketFiles = SUCCESSOR_TICKET_DIRECTORIES.flatMap((directory) =>
    readdirSync(directory.url)
      .filter((fileName) => SUCCESSOR_TICKET_PATTERN.test(fileName))
      .map((fileName) => ({ ...directory, fileName }))
  ).sort((left, right) => left.fileName.localeCompare(right.fileName));
  const filesByTicketId = new Map();
  for (const ticketFile of ticketFiles) {
    const ticketId = /^(T-\d+)-/u.exec(ticketFile.fileName)?.[1];
    const rows = filesByTicketId.get(ticketId) ?? [];
    rows.push(ticketFile);
    filesByTicketId.set(ticketId, rows);
  }
  const duplicates = [...filesByTicketId.entries()].filter(
    ([, rows]) => rows.length !== 1
  );
  if (duplicates.length > 0) {
    throw new TypeError(
      `duplicate T-252 successor ticket files: ${duplicates
        .map(
          ([ticketId, rows]) =>
            `${ticketId}=${rows
              .map((row) => `${row.name}/${row.fileName}`)
              .join(",")}`
        )
        .join("; ")}`
    );
  }
  return ticketFiles.flatMap((ticketFile) => {
    const ticketText = readFileSync(
      new URL(ticketFile.fileName, ticketFile.url),
      "utf8"
    );
    return parseT252GapOwnership(
      ticketText,
      ticketFile.fileName,
      ticketFile.name
    );
  });
}

export function deriveSuccessorRouting(
  input,
  ownershipDeclarations = loadT252GapOwnership()
) {
  const ownershipProjection = ownershipDeclarations.map((row) => ({
    gapFamily: row.gapFamily,
    ownerTicketRef: row.ownerTicketRef
  }));
  const counts = new Map();
  for (const row of input.rootIssueReconciliation) {
    counts.set(row.gapFamily, (counts.get(row.gapFamily) ?? 0) + 1);
  }
  for (const row of input.compilerCoverage.nonDiagnosticGaps) {
    counts.set(row.gapFamily, (counts.get(row.gapFamily) ?? 0) + 1);
  }
  for (const row of input.compilerCoverage.standaloneCompilerObservedGaps) {
    counts.set(row.gapFamily, (counts.get(row.gapFamily) ?? 0) + 1);
  }
  const declarationsByFamily = new Map();
  for (const declaration of ownershipProjection) {
    const rows = declarationsByFamily.get(declaration.gapFamily) ?? [];
    rows.push(declaration);
    declarationsByFamily.set(declaration.gapFamily, rows);
  }
  const rows = [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([gapFamily, evidenceCount]) => {
      const ownershipRows = declarationsByFamily.get(gapFamily) ?? [];
      const ownerTicketRef =
        ownershipRows.length === 1 ? ownershipRows[0].ownerTicketRef : null;
      return {
        gapFamily,
        evidenceCount,
        ownerTicketRef,
        ownershipStatus:
          ownershipRows.length === 0
            ? "unowned"
            : ownershipRows.length === 1
              ? "singular_owner"
              : "duplicate_owner",
        ownershipEvidence: ownershipRows
      };
    });
  const observedFamilies = new Set(counts.keys());
  const declaredButUnobserved = ownershipProjection.filter(
    (row) => !observedFamilies.has(row.gapFamily)
  );
  return {
    rows,
    ownershipDeclarationCount: ownershipProjection.length,
    declaredButUnobserved,
    allGapFamiliesOwned: rows.every(
      (row) => row.ownershipStatus === "singular_owner"
    ),
    ownershipDeclarationsExact:
      rows.every((row) => row.ownershipStatus === "singular_owner") &&
      declaredButUnobserved.length === 0 &&
      ownershipProjection.length === rows.length
  };
}

export function deriveT252ConsensusGtlCensus() {
  const rawModule = serializeModule(ABG_CONSENSUS_GTL_PROGRAM.module);
  const termProbe = collectTermManifest(rawModule);
  const relationProbe = collectRelationDiagnostics(rawModule);
  const diagnostics = [
    ...termProbe.diagnostics,
    ...relationProbe.diagnostics
  ];
  const featureCoverage = deriveFeatureCoverageFromCompiler();
  const fullRootReport = typecheckRoot(featureCoverage.manifest);
  const fullRootIssueCounts = countsBy(fullRootReport.issues, rootDiagnosticId);
  let baselineAdmission = null;
  try {
    baselineAdmission = admitModule(rawModule, "T-252 canonical baseline");
  } catch {
    baselineAdmission = null;
  }
  const baselineAdmittedDigest =
    baselineAdmission === null
      ? null
      : stableSha256Digest(serializeModule(baselineAdmission));
  const baselineRawAdmitted =
    baselineAdmittedDigest === CONSENSUS_BODY_DIGEST;
  const unknownFieldMutation = { ...rawModule, t252_unknown_field: true };
  const unknownFieldMutationDigest = stableSha256Digest(unknownFieldMutation);
  let unknownFieldRejected = false;
  let unknownFieldAdmission = null;
  try {
    unknownFieldAdmission = admitModule(
      unknownFieldMutation,
      "T-252 unknown-field mutation probe"
    );
  } catch {
    unknownFieldRejected = true;
  }
  const rootConformanceManifest = collectRootConformanceManifest(
    fullRootReport,
    relationProbe.graphEdgeManifest
  );
  const localProbeManifest = [
    ...termProbe.manifest,
    ...relationProbe.graphOperatorManifest,
    ...relationProbe.graphEdgeManifest,
    ...relationProbe.vectorSelectionManifest,
    ...rootConformanceManifest
  ];
  const rootReconciliation = reconcileRootIssues({
    fullRootReport,
    rootConformanceManifest,
    vectorSelectionManifest: relationProbe.vectorSelectionManifest,
    localProbeManifest
  });
  const directDiagnosticReconciliation =
    reconcileDirectDiagnosticsWithRoot(diagnostics, fullRootReport.issues);
  const probeManifest = [
    ...localProbeManifest,
    ...rootReconciliation.globalCoverageManifest
  ];
  const coverage = deriveCompilerCoverage({
    termManifest: termProbe.manifest,
    graphOperatorManifest: relationProbe.graphOperatorManifest,
    graphEdgeManifest: relationProbe.graphEdgeManifest,
    vectorBindings: relationProbe.vectorBindings,
    diagnostics,
    rootIssueFamilies: uniqueInOrder(
      rootReconciliation.rows.map((row) => row.gapFamily)
    ),
    standaloneDiagnostics:
      directDiagnosticReconciliation.standaloneDiagnostics,
    unknownFieldRejected,
    unknownFieldMutationDigest
  });
  const successorRouting = deriveSuccessorRouting({
    rootIssueReconciliation: rootReconciliation.rows,
    compilerCoverage: coverage
  });
  const runtimeAuthorityObservation =
    deriveRuntimeAuthorityObservation(rawModule);
  const rootIssuePersistence = buildRootIssuePersistence(fullRootReport.issues);
  const localManifestRefs = new Set(
    localProbeManifest.map((row) => row.manifestRef)
  );
  const rawAddressRows = localProbeManifest.filter(
    (row) => row.rawProgramAddress !== undefined || row.rawBodyAddress !== undefined
  );
  const rawAddressesResolve = rawAddressRows.every((row) => {
    const valueAddress = row.rawProgramAddress ?? row.rawBodyAddress;
    const expectedDigest =
      row.rawProgramValueDigest ?? row.rawBodyValueDigest ?? null;
    return (
      expectedDigest !== null &&
      stableSha256Digest(resolveT252CensusAddress(rawModule, valueAddress)) ===
        expectedDigest
    );
  });
  const globalRootLinksComplete =
    rootReconciliation.globalCoverageManifest.every(
      (row) =>
        row.linkedProbeManifestRefs.length > 0 &&
        row.linkedProbeManifestRefs.every((ref) => localManifestRefs.has(ref)) &&
        row.issueProbeLinks.length === row.issueOrdinals.length &&
        row.issueProbeLinks.every(
          (link) =>
            link.linkedProbeManifestRefs.length > 0 &&
            link.linkedProbeManifestRefs.every((ref) =>
              localManifestRefs.has(ref)
            )
        )
    );
  const directDiagnosticMetadataComplete = diagnostics.every(
    (diagnostic) =>
      Array.isArray(diagnostic.evidenceRefs) &&
      Array.isArray(diagnostic.authorityRefs) &&
      Array.isArray(diagnostic.repairAffordances) &&
      typeof diagnostic.actualRelationDigest === "string"
  );
  const catalogRefs = new Set(
    Object.values(rootIssuePersistence.catalogs).flatMap((catalog) =>
      catalog.map((row) => row.ref)
    )
  );
  const rootIssueMetadataComplete = rootIssuePersistence.ledger.every(
    (row) =>
      catalogRefs.has(row.surfaceRefCatalogRef) &&
      catalogRefs.has(row.evidenceRefsCatalogRef) &&
      catalogRefs.has(row.admissibleRepairsCatalogRef) &&
      Array.isArray(row.authorityRefs)
  );
  const rootOrdinals = rootReconciliation.rows.map(
    (row) => row.rootIssueOrdinal
  );
  const censusIntegrity = {
    baselineRawAdmitted,
    rawAddressRowCount: rawAddressRows.length,
    rawAddressesResolve,
    globalRootLinksComplete,
    directDiagnosticMetadataComplete,
    rootIssueMetadataComplete,
    rootIssueReconciliationExactlyOnce:
      rootOrdinals.length === fullRootReport.issues.length &&
      new Set(rootOrdinals).size === fullRootReport.issues.length &&
      rootReconciliation.total
  };
  const closureEligible =
    Object.values(censusIntegrity).every(
      (value) => typeof value !== "boolean" || value
    ) &&
    diagnostics.every(
      (diagnostic) => diagnostic.classification !== "invalid_program"
    ) &&
    runtimeAuthorityObservation.noRuntimeAuthorityObserved &&
    successorRouting.ownershipDeclarationsExact;
  const invalidDiagnosticCount = diagnostics.filter(
    (diagnostic) => diagnostic.classification === "invalid_program"
  ).length;
  const closureBlockers = {
    invalidDiagnosticCount,
    censusIntegrityFailed: !Object.values(censusIntegrity).every(
      (value) => typeof value !== "boolean" || value
    ),
    runtimeAuthorityObserved:
      !runtimeAuthorityObservation.noRuntimeAuthorityObserved,
    successorOwnershipIncomplete:
      !successorRouting.ownershipDeclarationsExact
  };
  const report = {
    kind: "t252_consensus_gtl_frontier_census",
    censusSemantics:
      "first_snapshot_observation_and_design_gap_register_not_self_updating",
    status: closureEligible
      ? "body_admitted_census_routed"
      : invalidDiagnosticCount > 0
        ? successorRouting.ownershipDeclarationsExact
          ? "body_invalid_census_routed"
          : "body_invalid_census_routing_incomplete"
        : "body_admitted_census_routing_incomplete",
    closureEligible,
    closureBlockers,
    bodyDigest: CONSENSUS_BODY_DIGEST,
    submittedRootRef:
      ABG_CONSENSUS_GTL_PROGRAM.rootGraphFunction.id,
    admissionStatus: baselineRawAdmitted ? "raw_admitted" : "raw_rejected",
    censusIntegrity,
    probeManifestDigest: stableSha256Digest(probeManifest),
    fullRootReportDigest: stableSha256Digest(fullRootReport),
    diagnostics,
    diagnosticCounts: countsBy(diagnostics, (row) => row.diagnosticId),
    fullRootIssueCount: fullRootReport.issues.length,
    fullRootIssueCounts,
    fullRootIssueLedger: rootIssuePersistence.ledger,
    fullRootIssueCatalogs: rootIssuePersistence.catalogs,
    directDiagnosticReconciliation: directDiagnosticReconciliation.rows,
    rootIssueReconciliation: rootReconciliation.rows,
    rootIssueReconciliationTotal: rootReconciliation.total,
    fullRootProjectionDigests: {
      requirementsAlgebraProjection: stableSha256Digest(
        fullRootReport.requirementsAlgebraProjection
      ),
      traversalUnitProjection: stableSha256Digest(
        fullRootReport.traversalUnitProjection
      ),
      pluginResultInterfaceCatalog: stableSha256Digest(
        fullRootReport.pluginResultInterfaceCatalog
      )
    },
    rawAdmissionCoverage: {
      baselineAdmittedDigest,
      unknownFieldMutationDigest,
      admittedBaselineDigest:
        unknownFieldAdmission === null
          ? null
          : stableSha256Digest(serializeModule(unknownFieldAdmission)),
      unknownFieldRejected,
      disposition: unknownFieldRejected
        ? "refused"
        : "compiler_observability_gap"
    },
    featureObservationBasis: featureCoverage.observationBasis,
    runtimeAuthorityObservation,
    compilerCoverage: coverage,
    probeManifest,
    vectorProgramBindings: relationProbe.vectorBindings,
    successorRouting,
    successorRoutingRequired: !successorRouting.ownershipDeclarationsExact
  };
  return { report, fullRootReport };
}

export function canonicalJson(value) {
  return `${JSON.stringify(JSON.parse(stableJson(value)), null, 2)}\n`;
}

async function main() {
  const mode = process.argv[2];
  if (mode !== "--write" && mode !== "--check") {
    throw new TypeError("expected --write or --check");
  }
  const { report } = deriveT252ConsensusGtlCensus();
  const outputs = [[CENSUS_URL, canonicalJson(report)]];
  if (mode === "--write") {
    await Promise.all(outputs.map(([url, bytes]) => writeFile(url, bytes)));
  } else {
    for (const [url, bytes] of outputs) {
      const observed = await readFile(url, "utf8");
      if (observed !== bytes) {
        throw new TypeError(`stale T-252 census artifact ${fileURLToPath(url)}`);
      }
    }
  }
  process.stdout.write(
    `${mode === "--write" ? "wrote" : "verified"} T-252 census ${report.bodyDigest} ${report.probeManifestDigest}\n`
  );
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(invokedPath).href
) {
  await main();
}
