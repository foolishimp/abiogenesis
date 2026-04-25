// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-R-ABG3-PROJECTION
// Investigates: T-064

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  admitExecutionBasis,
  admitModule,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  deriveTraversalStructureProbe
} from "../../build/semantic/code/src/index.js";
import {
  admitSdlcBootstrapInputSet,
  constructSdlcBootstrapProjectGraphFunction,
  deriveSdlcBootstrapProject,
  lineageEntriesForSourceInput,
  sdlcRuntimeProvenanceFromTraversal,
  sourceInputIdsForProjectElement
} from "../../build/semantic/code/src/qualification/m05/index.js";

const APPS_ROOT = "/Users/jim/src/apps";
const DATA_MAPPER_ROOT = path.join(
  APPS_ROOT,
  "ai_sdlc_examples/local_projects/data_mapper"
);
const TEMPLATE_ROOT = path.join(DATA_MAPPER_ROOT, "data_mapper.template");
const RECENT_GENERATIONS = ["data_mapper.test41", "data_mapper.test42", "data_mapper.test43"];

const TEMPLATE_FILES = [
  "README.md",
  ".ai-workspace/context/project_constraints.yml",
  "specification/INTENT.md",
  "specification/REQUIREMENTS.md",
  "specification/mapper_requirements.md"
];

const GENERATED_FILES = [
  ".ai-workspace/context/project_bootstrap.md",
  ".ai-workspace/runtime/odd_sdlc-analysis-manifest.json",
  ".ai-workspace/runtime/odd_sdlc-workspace-normalization.json",
  "specification/requirements/00-imported-sources.md",
  "specification/requirements/10-generated-bootstrap.md"
];

const REQUIREMENT_ID_RE = /\b(?:REQ|RF)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;

function readRequiredFile(absolutePath) {
  assert.equal(existsSync(absolutePath), true, `missing fixture file ${absolutePath}`);
  return readFileSync(absolutePath, "utf-8");
}

function sha256(text) {
  return `sha256:${createHash("sha256").update(text, "utf-8").digest("hex")}`;
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRequirementId(requirementId) {
  const parts = requirementId.toUpperCase().split("-");
  if (parts[0] === "RF") {
    parts[0] = "REQ";
  }
  return parts
    .map((part, index) =>
      index > 0 && /^\d+$/.test(part) && part.length < 3 ? part.padStart(3, "0") : part
    )
    .join("-");
}

function uniqueSorted(values) {
  return Object.freeze([...new Set(values)].sort());
}

function isAuthorityLike(relativePath) {
  return (
    relativePath.startsWith("specification/") ||
    relativePath.includes("/specification/") ||
    relativePath.endsWith("/specification/requirements/00-imported-sources.md") ||
    relativePath.endsWith("/specification/requirements/10-generated-bootstrap.md") ||
    relativePath.endsWith("/.ai-workspace/context/project_bootstrap.md")
  );
}

function projectMarkers(text) {
  const markers = [];
  for (const match of text.matchAll(/^\*\*Project\*\*:\s*(.+?)\s*$/gm)) {
    markers.push(`project:${match[1].trim()}`);
  }
  for (const match of text.matchAll(/authoritative project title:\s*`(.+?)`/g)) {
    markers.push(`project:${match[1].trim()}`);
  }
  return markers;
}

function intentMarkers(text) {
  return [...text.matchAll(/^##\s+(INT-\d+):\s*(.+?)\s*$/gm)].map(
    (match) => `intent:${match[1]} ${match[2].trim()}`
  );
}

function requirementMarkers(text) {
  return uniqueSorted(
    [...text.matchAll(REQUIREMENT_ID_RE)].map((match) =>
      `requirement:${normalizeRequirementId(match[0])}`
    )
  );
}

function authorityMarkers(relativePath, text) {
  if (!isAuthorityLike(relativePath)) {
    return Object.freeze([]);
  }
  return uniqueSorted([
    ...projectMarkers(text),
    ...intentMarkers(text),
    ...requirementMarkers(text)
  ]);
}

function mediaType(relativePath) {
  if (relativePath.endsWith(".json")) {
    return "application/json";
  }
  if (relativePath.endsWith(".yml") || relativePath.endsWith(".yaml")) {
    return "application/yaml";
  }
  return "text/markdown";
}

function inputKind(relativePath) {
  if (relativePath.endsWith(".json") || relativePath.endsWith(".yml")) {
    return "structured";
  }
  if (isAuthorityLike(relativePath)) {
    return "loosely_structured";
  }
  return "unstructured";
}

function detectedSchemas(relativePath, text) {
  const schemas = [];
  if (relativePath.endsWith(".json")) {
    const parsed = JSON.parse(text);
    if (typeof parsed.manifest_kind === "string") {
      schemas.push(`json:${parsed.manifest_kind}`);
    }
    if (typeof parsed.report_path === "string") {
      schemas.push("json:odd_sdlc_normalization_report");
    }
  }
  if (relativePath.endsWith(".yml") || relativePath.endsWith(".yaml")) {
    schemas.push("yaml:project_constraints");
  }
  if (/^#\s+/m.test(text)) {
    schemas.push("markdown:headings");
  }
  REQUIREMENT_ID_RE.lastIndex = 0;
  if (REQUIREMENT_ID_RE.test(text)) {
    schemas.push("text:requirement_markers");
  }
  REQUIREMENT_ID_RE.lastIndex = 0;
  return uniqueSorted(schemas);
}

function sourceSpecs() {
  return Object.freeze([
    ...TEMPLATE_FILES.map((relativePath) => ({
      generation: "template",
      root: TEMPLATE_ROOT,
      relativePath
    })),
    ...RECENT_GENERATIONS.flatMap((generation) =>
      GENERATED_FILES.map((relativePath) => ({
        generation,
        root: path.join(DATA_MAPPER_ROOT, generation),
        relativePath
      }))
    )
  ]);
}

function buildRealIngressRecords() {
  return sourceSpecs().map((spec) => {
    const absolutePath = path.join(spec.root, spec.relativePath);
    const text = readRequiredFile(absolutePath);
    const sourceRef = `${spec.generation}/${spec.relativePath}`;
    const markers = authorityMarkers(sourceRef, text);
    const input = {
      id: `input:t064:${slug(sourceRef)}`,
      kind: inputKind(sourceRef),
      uri: `file://${absolutePath}`,
      digest: sha256(text),
      mediaType: mediaType(sourceRef),
      authorityMarkers: markers,
      detectedSchemas: detectedSchemas(sourceRef, text),
      summary: `${sourceRef}; bytes=${Buffer.byteLength(text, "utf-8")}; markers=${markers.length}`
    };
    return Object.freeze({ ...spec, absolutePath, sourceRef, text, input });
  });
}

function moduleFor(graphFunction) {
  return admitModule({
    name: "t064_data_mapper_real_ingress_module",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job:t064/data-mapper-real-ingress",
        name: "data_mapper_real_ingress_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t064", "sdlc", "data-mapper"]
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
    workerId: "worker://t064",
    backendId: "backend://node",
    buildId: "build://typescript",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function policy() {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://t064/data-mapper-real-ingress",
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t064/data-mapper-real-ingress",
    approvalSubjectRef: null
  });
}

function basisFor(graphFunction) {
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: TEMPLATE_ROOT,
        moduleName: "t064_data_mapper_real_ingress_module"
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
    runId: "run://t064/data-mapper-real-ingress",
    workKey: "wk://t064/data-mapper-real-ingress",
    frameId: null,
    frameLineageId: null
  });
}

function realIngressInputSet(records = buildRealIngressRecords()) {
  return admitSdlcBootstrapInputSet({
    kind: "sdlc_bootstrap_input_set",
    id: "bootstrap-input-set:t064:data-mapper-real-ingress",
    inputs: records.map((record) => record.input)
  });
}

test("T-064 data mapper fixture: preserved template and recent generated runs are sampled", () => {
  const records = buildRealIngressRecords();

  assert.equal(records.length, TEMPLATE_FILES.length + RECENT_GENERATIONS.length * GENERATED_FILES.length);
  assert.deepStrictEqual(
    uniqueSorted(records.map((record) => record.generation)),
    ["data_mapper.test41", "data_mapper.test42", "data_mapper.test43", "template"]
  );
  assert.deepStrictEqual(
    TEMPLATE_FILES.map((relativePath) => `template/${relativePath}`),
    records
      .filter((record) => record.generation === "template")
      .map((record) => record.sourceRef)
  );
  assert(
    records.every((record) => /^sha256:[a-f0-9]{64}$/.test(record.input.digest)),
    "each real ingress input carries a source digest"
  );
  assert(
    records.some(
      (record) =>
        record.sourceRef === "template/specification/INTENT.md" &&
        record.input.authorityMarkers.includes(
          "project:Categorical Data Mapping & Computation Engine (CDME)"
        )
    )
  );
});

test("T-064 data mapper fixture: Python SDLC normalization evidence is present", () => {
  const reportPath = path.join(
    DATA_MAPPER_ROOT,
    "data_mapper.test43",
    ".ai-workspace/runtime/odd_sdlc-workspace-normalization.json"
  );
  const manifestPath = path.join(
    DATA_MAPPER_ROOT,
    "data_mapper.test43",
    ".ai-workspace/runtime/odd_sdlc-analysis-manifest.json"
  );
  const report = JSON.parse(readRequiredFile(reportPath));
  const manifest = JSON.parse(readRequiredFile(manifestPath));
  const actionKinds = new Set(report.actions.map((action) => action.kind));

  assert.equal(report.project_slug, "data_mapper");
  assert.equal(report.platform, "scala_spark");
  assert(actionKinds.has("create_imported_requirements_summary"));
  assert(actionKinds.has("create_project_bootstrap"));
  assert(actionKinds.has("normalize_project_constraints"));
  assert(actionKinds.has("create_analysis_manifest"));
  assert.equal(manifest.manifest_kind, "odd_sdlc.analysis_manifest");
  assert(
    manifest.source_inputs.some(
      (source) => source.path === "specification/requirements/00-imported-sources.md"
    )
  );
  assert(
    manifest.source_inputs.some((source) => source.path === "specification/REQUIREMENTS.md")
  );
});

test("T-064 data mapper fixture: TS M05 derives project identity, requirement lineage, and ambiguity", () => {
  const records = buildRealIngressRecords();
  const inputSet = realIngressInputSet(records);
  const graphFunction = constructSdlcBootstrapProjectGraphFunction();
  const basis = basisFor(graphFunction);
  const probe = deriveTraversalStructureProbe(basis);
  const runtimeProvenance = sdlcRuntimeProvenanceFromTraversal({ basis, probe });
  const project = deriveSdlcBootstrapProject(inputSet, runtimeProvenance);
  const recordByInputId = new Map(records.map((record) => [record.input.id, record]));

  assert.equal(project.name, "Categorical Data Mapping & Computation Engine (CDME)");
  assert.equal(project.inputSetId, inputSet.id);
  assert(project.authoritySurfaceIds.includes("project"));
  assert(project.authoritySurfaceIds.includes("intent_surface"));
  assert(project.authoritySurfaceIds.includes("requirement_surface"));
  assert.equal(project.derivationLedger.assetLineage.length, inputSet.inputs.length);

  const ldmRequirement = project.elements.find(
    (element) =>
      element.elementType === "requirement_candidate" &&
      element.text === "REQ-LDM-001" &&
      element.sourceInputIds.some(
        (sourceInputId) =>
          recordByInputId.get(sourceInputId)?.sourceRef ===
          "template/specification/REQUIREMENTS.md"
      )
  );
  assert.notEqual(ldmRequirement, undefined);
  assert.deepStrictEqual(sourceInputIdsForProjectElement(project, ldmRequirement.id), [
    ldmRequirement.sourceInputIds[0]
  ]);

  const lineage = lineageEntriesForSourceInput(project, ldmRequirement.sourceInputIds[0]);
  assert(lineage.some((entry) => entry.targetElementId === ldmRequirement.id));
  assert(
    lineage.every(
      (entry) =>
        entry.runtimeProvenance.graphFunctionName === "GF_BOOTSTRAP_PROJECT" &&
        entry.runtimeProvenance.vectorName === "BootstrapInputSet->Project"
    )
  );

  const runtimeReport = records.find((record) =>
    record.sourceRef.endsWith("/.ai-workspace/runtime/odd_sdlc-workspace-normalization.json")
  );
  assert.notEqual(runtimeReport, undefined);
  assert(
    project.ambiguityEntries.some((entry) => entry.sourceInputIds.includes(runtimeReport.input.id)),
    "runtime evidence remains visible without becoming semantic authority"
  );
});
