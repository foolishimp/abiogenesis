// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-L-GTL3-OPERATOR
// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-PROJECTION
// Investigates: T-063

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitModule,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  deriveTraversalStructureProbe,
  materializeGraphFunction
} from "../../build/semantic/code/src/index.js";
import {
  admitSdlcBootstrapInputSet,
  constructSdlcBootstrapProjectGraphFunction,
  deriveSdlcBootstrapProject,
  lineageEntriesForSourceInput,
  sdlcRuntimeProvenanceFromTraversal,
  sourceInputIdsForProjectElement
} from "../../build/semantic/code/src/qualification/m05/index.js";

function moduleFor(graphFunction) {
  return admitModule({
    name: "t063_sdlc_bootstrap_lineage_module",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job:t063/sdlc-bootstrap-lineage",
        name: "sdlc_bootstrap_lineage_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t063", "sdlc", "bootstrap"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
}

function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://t063",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function policy() {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://t063/sdlc-bootstrap-lineage",
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t063/sdlc-bootstrap-lineage",
    approvalSubjectRef: null
  });
}

function basisFor(graphFunction) {
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t063",
        moduleName: "t063_sdlc_bootstrap_lineage_module"
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    }),
    module: moduleFor(graphFunction),
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: policy(),
    runId: "run://t063/sdlc-bootstrap-lineage",
    workKey: "wk://t063/sdlc-bootstrap-lineage",
    frameId: null,
    frameLineageId: null
  });
}

function admittedBootstrapInputSet() {
  return admitSdlcBootstrapInputSet({
    kind: "sdlc_bootstrap_input_set",
    id: "bootstrap-input-set:t063",
    inputs: [
      {
        id: "input:raw-note",
        kind: "unstructured",
        uri: "memory://t063/raw-note",
        digest: "sha256:raw-note",
        mediaType: "text/plain",
        authorityMarkers: [],
        detectedSchemas: [],
        summary: "A freeform project note with no explicit authority marker."
      },
      {
        id: "input:loose-requirements",
        kind: "loosely_structured",
        uri: "memory://t063/loose-requirements",
        digest: "sha256:loose-requirements",
        mediaType: "text/markdown",
        authorityMarkers: [
          "intent:bring imported material under governed bootstrap",
          "requirement:lineage answers which source input produced each project element"
        ],
        detectedSchemas: ["markdown-list"],
        summary: "A loose markdown list of intent and requirement statements."
      },
      {
        id: "input:project-hint",
        kind: "structured",
        uri: "memory://t063/project-hint",
        digest: "sha256:project-hint",
        mediaType: "application/json",
        authorityMarkers: ["project:Bootstrap Ledger"],
        detectedSchemas: ["json:project_hint"],
        summary: "A structured project identity hint."
      }
    ]
  });
}

test("T-063 SDLC bootstrap lineage: graph function declares BootstrapInputSet->Project without ABG semantic widening", () => {
  const graphFunction = constructSdlcBootstrapProjectGraphFunction();
  const graph = materializeGraphFunction(graphFunction);

  assert.equal(graphFunction.name, "GF_BOOTSTRAP_PROJECT");
  assert.deepStrictEqual(
    graphFunction.inputs.map((node) => node.schema.ref),
    ["schema://sdlc/BootstrapInputSet"]
  );
  assert.deepStrictEqual(
    graphFunction.outputs.map((node) => node.schema.ref),
    ["schema://sdlc/Project"]
  );
  assert.deepStrictEqual(graph.vectors.map((vector) => vector.name), [
    "BootstrapInputSet->Project"
  ]);

  const vector = graph.vectors[0];
  assert.equal(vector.allowsSubwork, true);
  assert.deepStrictEqual(
    vector.operators.map((operator) => `${operator.regime}:${operator.name}`),
    ["F_D:bootstrap_project_fd_inventory", "F_P:bootstrap_project_fp_normalize"]
  );
  assert.deepStrictEqual(
    vector.evaluators.map((evaluator) => `${evaluator.regime}:${evaluator.name}`),
    [
      "F_D:project_output_contract",
      "F_D:derived_element_lineage_contract"
    ]
  );

  const probe = deriveTraversalStructureProbe(basisFor(graphFunction));
  assert.equal(probe.structureKind, "defined_constructive_morphism");
  assert.equal(probe.edge, "BootstrapInputSet->Project");
  assert.equal(probe.transitionKind, "fp_dispatch");
  assert.deepStrictEqual(probe.declaredOperatorRegimes, ["F_D", "F_P"]);
  assert.deepStrictEqual(probe.declaredEvaluatorRegimes, ["F_D"]);
  assert(probe.allowedClaims.includes("declared_compute_surface_visible"));
  assert(probe.notAllowedClaims.includes("identity_not_implied"));
  assert(probe.notAllowedClaims.includes("domain_completion_not_implied"));
});

test("T-063 SDLC bootstrap lineage: project derivation joins semantic lineage to ABG runtime provenance", () => {
  const graphFunction = constructSdlcBootstrapProjectGraphFunction();
  const basis = basisFor(graphFunction);
  const probe = deriveTraversalStructureProbe(basis);
  const runtimeProvenance = sdlcRuntimeProvenanceFromTraversal({ basis, probe });
  const inputSet = admittedBootstrapInputSet();
  const project = deriveSdlcBootstrapProject(inputSet, runtimeProvenance);

  assert.equal(project.kind, "sdlc_project");
  assert.equal(project.name, "Bootstrap Ledger");
  assert.equal(project.inputSetId, inputSet.id);
  assert.deepStrictEqual(project.authoritySurfaceIds, [
    "intent_surface",
    "project",
    "requirement_surface"
  ]);
  assert.deepStrictEqual(
    project.elements.map((element) => element.elementType),
    ["intent_candidate", "requirement_candidate", "project_identity"]
  );
  assert.equal(project.derivationLedger.assetLineage.length, 3);
  assert.equal(project.derivationLedger.elementLineage.length, 3);
  assert.equal(project.ambiguityEntries.length, 1);
  assert.equal(project.ambiguityEntries[0].sourceInputIds[0], "input:raw-note");

  const requirement = project.elements.find(
    (element) => element.elementType === "requirement_candidate"
  );
  assert.notEqual(requirement, undefined);
  assert.deepStrictEqual(
    sourceInputIdsForProjectElement(project, requirement.id),
    ["input:loose-requirements"]
  );
  assert.deepStrictEqual(
    lineageEntriesForSourceInput(project, "input:loose-requirements").map(
      (entry) => entry.targetElementId
    ),
    project.elements
      .filter((element) => element.sourceInputIds.includes("input:loose-requirements"))
      .map((element) => element.id)
  );
  assert.equal(runtimeProvenance.graphFunctionName, "GF_BOOTSTRAP_PROJECT");
  assert.equal(runtimeProvenance.vectorName, "BootstrapInputSet->Project");
  assert.equal(runtimeProvenance.transitionKind, "fp_dispatch");
  assert(
    project.derivationLedger.elementLineage.every(
      (entry) =>
        entry.runtimeProvenance.graphFunctionId === graphFunction.id &&
        entry.runtimeProvenance.vectorName === "BootstrapInputSet->Project"
    )
  );
});

test("T-063 SDLC bootstrap lineage: invalid weak ingress fails before semantic derivation", () => {
  assert.throws(
    () =>
      admitSdlcBootstrapInputSet({
        kind: "sdlc_bootstrap_input_set",
        id: "bootstrap-input-set:empty",
        inputs: []
      }),
    /requires at least one input/
  );

  assert.throws(
    () =>
      admitSdlcBootstrapInputSet({
        kind: "sdlc_bootstrap_input_set",
        id: "bootstrap-input-set:duplicate",
        inputs: [
          {
            id: "input:duplicate",
            kind: "structured",
            uri: "memory://duplicate/a",
            digest: "sha256:a",
            mediaType: "application/json",
            authorityMarkers: ["project:A"],
            detectedSchemas: ["json"],
            summary: "first"
          },
          {
            id: "input:duplicate",
            kind: "structured",
            uri: "memory://duplicate/b",
            digest: "sha256:b",
            mediaType: "application/json",
            authorityMarkers: ["project:B"],
            detectedSchemas: ["json"],
            summary: "second"
          }
        ]
      }),
    /duplicate input ids input:duplicate/
  );
});
