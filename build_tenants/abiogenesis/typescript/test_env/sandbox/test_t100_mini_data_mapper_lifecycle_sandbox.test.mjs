// Validates: T-082
// Validates: T-100
// Validates: REQ-R-ABG3-BINDING
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-FRAME
// Validates: REQ-R-ABG3-LINEAGE
// Validates: REQ-R-ABG3-PROVENANCE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitPublicStartRequest,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitScheduledSliceAssessment,
  admitWorkspaceAssetBinding,
  compose,
      constructDefaultAbgFnCompositionDeclarations,
      constructOutputBindingAdmittedEvent,
      constructEvalGradeVector,
      constructEvalOutcome,
      constructEvalSuiteSpec,
      constructEvalTask,
      constructEvalTrial,
      constructGraph,
      constructGraphFunction,
      constructGraphVector,
      constructOutputInstanceAllocatedEvent,
      constructOutputMaterializationObservedEvent,
      constructOutputPluginHandoffManifest,
      constructScheduledSliceAssessedEvent,
      constructScheduledSliceDispatchedEvent,
      constructScheduledSlicePluginHandoff,
      constructTemplateRef,
      constructWorkspaceObligationLedgerAdmittedEvent,
      constructWorkspaceObligationScheduleDerivedEvent,
      constructZoomFoldbackEvaluatedEvent,
  constructZoomFrameOpenedEvent,
  deriveObligationLedgerAsset,
  deriveObligationSchedule,
  deriveEvalAggregateProjection,
  deriveOuterTraversalEvaluation,
  deriveOutputAllocationProjection,
  deriveOutputInstanceAllocation,
  deriveWorkspaceSystemProjection,
  deriveWorkspaceZoomProjection,
  deriveZoomFoldbackEvaluationFromEvents,
      edge,
      emit,
      graphFunctionForVector,
      materializeGraphFunction,
      openZoomFrame
    } from "../../build/semantic/code/src/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t100_mini_data_mapper_lifecycle"
);

const REQUIREMENTS = Object.freeze([
  ["REQ-MDM-001", "Read CSV source files with headers"],
  ["REQ-MDM-002", "Infer primitive column types from sample rows"],
  ["REQ-MDM-003", "Allow explicit target field renaming"],
  ["REQ-MDM-004", "Validate required target fields before output"],
  ["REQ-MDM-005", "Record row-level reject reasons"],
  ["REQ-MDM-006", "Emit a deterministic mapping report"],
  ["REQ-MDM-007", "Preserve source row ordering"],
  ["REQ-MDM-008", "Normalize empty strings as nulls"],
  ["REQ-MDM-009", "Expose a dry-run mode"],
  ["REQ-MDM-010", "Produce an execution summary"]
].map(([id, title], index) =>
  Object.freeze({
    id,
    title,
    acceptance: `case-${String(index + 1).padStart(2, "0")} covers ${id}`
  })
));

const REQUESTED_OUTPUTS = Object.freeze([
  Object.freeze({
    output_name: "design_surface",
    output_asset_type: "Workspace.design_surface",
    relative_path: "design/mini_data_mapper_design.md",
    vectorIndex: 0
  }),
  Object.freeze({
    output_name: "implementation_surface",
    output_asset_type: "Workspace.implementation_surface",
    relative_path: "src/mini_mapper.ts",
    vectorIndex: 1
  }),
  Object.freeze({
    output_name: "test_suite_surface",
    output_asset_type: "Workspace.test_suite_surface",
    relative_path: "tests/mini_mapper.test.ts",
    vectorIndex: 2
  }),
  Object.freeze({
    output_name: "run_archive_surface",
    output_asset_type: "Workspace.run_archive_surface",
    relative_path: "archive/execution_result.json",
    vectorIndex: 3
  })
]);

const MAX_TRANSFORM_ATTEMPTS = 5;
const DEFAULT_REPEAT_COUNT = 1;
const MAX_REPEAT_COUNT = 8;
const DEFAULT_TRANSFORM_SEED = "t100-mini-random-fixed-feature-transform";

const FEATURE_CATALOG = Object.freeze(
  REQUIREMENTS.map((requirement) =>
    Object.freeze({
      obligationId: requirement.id,
      featureId: `feature:${requirement.id}`,
      marker: `Feature-For: ${requirement.id}`,
      acceptanceMarker: `Acceptance-Covers: ${requirement.acceptance}`,
      body: `${requirement.title}.`
    })
  )
);

function sha256(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function stableTimestamp() {
  return new Date().toISOString().replace(/[-:.]/g, "");
}

async function writeText(targetPath, content) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
  return targetPath;
}

async function writeJson(targetPath, value) {
  return writeText(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

function node(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `Workspace.${kind}` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`mini-data-mapper:${kind}:standard`],
      outputContractRefs: [`mini-data-mapper:${kind}:contract`]
    },
    tags: ["t100", "mini-data-mapper", kind]
  });
}

function stageGraphFunction(name, source, target, edgeName, evaluatorId) {
  const vector = edge([source], target, {
    id: `vector:${name}`,
    name: edgeName,
    evaluators: [
      {
        name: evaluatorId,
        regime: "F_P",
        description: `${edgeName} accepted`,
        binding: `binding://${name}`,
        tags: ["t100", "mini-data-mapper"]
      }
    ],
        tags: ["t100", "mini-data-mapper"]
      }).vectors[0];

  return graphFunctionForVector(vector, {
    name,
    declarations: { entries: [] },
    tags: ["t100", "mini-data-mapper"]
      });
    }

    function vectorWithCompositionDeclarations(vector) {
      return constructGraphVector({
        id: vector.id,
        name: vector.name,
        source: vector.source,
        target: vector.target,
        operators: vector.operators,
        evaluators: vector.evaluators,
        contexts: vector.contexts,
        rule: vector.rule,
        allowsSubwork: vector.allowsSubwork,
        declarations: constructDefaultAbgFnCompositionDeclarations({
          scopeRef: `t100/mini-data-mapper/${vector.id}`,
          hostGraphVectorRef: vector.id
        }),
        tags: vector.tags
      });
    }

    function graphFunctionWithVectorCompositionDeclarations(graphFunction) {
      const graph = materializeGraphFunction(graphFunction);
      const graphWithDeclarations = constructGraph({
        name: graph.name,
        inputs: graph.inputs,
        outputs: graph.outputs,
        nodes: graph.nodes,
        vectors: graph.vectors.map(vectorWithCompositionDeclarations),
        contexts: graph.contexts,
        rules: graph.rules,
        effects: graph.effects,
        tags: graph.tags
      });
      return constructGraphFunction({
        name: graphFunction.name,
        environment: graphFunction.environment,
        inputs: graphFunction.inputs,
        outputs: graphFunction.outputs,
        template: constructTemplateRef({
          kind: "inline_graph",
          ref: graphFunction.template.ref,
          graph: graphWithDeclarations,
          version: null
        }),
        effects: graphFunction.effects,
        declarations: graphFunction.declarations,
        tags: graphFunction.tags
      });
    }

    function miniLifecycleModule() {
  const bootstrap = node(
    "node:t100-mini/bootstrap",
    "BootstrapInputSet",
    "bootstrap_input_set",
    "bootstrapped"
  );
  const requirements = node(
    "node:t100-mini/requirements",
    "RequirementsSurface",
    "requirements_surface",
    "requirements_bootstrapped"
  );
  const design = node(
    "node:t100-mini/design",
    "DesignSurface",
    "design_surface",
    "designed"
  );
  const implementation = node(
    "node:t100-mini/implementation",
    "ImplementationSurface",
    "implementation_surface",
    "implemented"
  );
  const tests = node(
    "node:t100-mini/tests",
    "TestSuiteSurface",
    "test_suite_surface",
    "tested"
  );
  const archive = node(
    "node:t100-mini/archive",
    "RunArchiveSurface",
    "run_archive_surface",
    "archived"
  );

      const baseLifecycle = compose(
        stageGraphFunction(
          "bootstrap_mini_data_mapper_requirements",
          bootstrap,
      requirements,
      "bootstrap_input_to_requirements",
      "requirements_ready"
    ),
    stageGraphFunction(
      "derive_mini_data_mapper_design",
      requirements,
      design,
      "requirements_to_design",
      "design_ready"
    ),
    stageGraphFunction(
      "implement_mini_data_mapper",
      design,
      implementation,
      "design_to_implementation",
      "implementation_ready"
    ),
    stageGraphFunction(
      "test_mini_data_mapper",
      implementation,
      tests,
      "implementation_to_tests",
      "tests_ready"
    ),
    stageGraphFunction(
      "archive_mini_data_mapper_run",
      tests,
      archive,
      "tests_to_archive",
          "archive_ready"
        )
      );
      const lifecycle =
        graphFunctionWithVectorCompositionDeclarations(baseLifecycle);

  const module = admitModule({
    name: "t100_mini_data_mapper_lifecycle_module",
    graphs: [],
    graphFunctions: [lifecycle],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job:t100/mini-data-mapper-lifecycle",
        name: "t100_mini_data_mapper_lifecycle_job",
        contracts: [{ kind: "graph_function", targetId: lifecycle.id }],
        roles: [],
        tags: ["t100", "mini-data-mapper"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });

  return Object.freeze({ module, lifecycle });
}

function requirementsMarkdown() {
  return [
    "# Mini Data Mapper Requirements",
    "",
    "This compact template is intentionally small enough to use as a repeatable ABG sandbox.",
    "",
    ...REQUIREMENTS.flatMap((requirement) => [
      `## ${requirement.id}: ${requirement.title}`,
      "",
      `Acceptance: ${requirement.acceptance}.`,
      ""
    ])
  ].join("\n");
}

function implementationSource() {
  return [
    "export const miniMapperRequirements = Object.freeze([",
    ...REQUIREMENTS.map(
      (requirement) =>
        `  Object.freeze({ id: "${requirement.id}", behavior: ${JSON.stringify(requirement.title)} }),`
    ),
    "]);",
    "",
    "export function mapMiniRow(row) {",
    "  return Object.freeze({",
    "    id: String(row.id ?? \"\"),",
    "    normalizedName: String(row.name ?? \"\").trim(),",
    "    amount: Number(row.amount ?? 0)",
    "  });",
    "}",
    ""
  ].join("\n");
}

function testSuiteSource() {
  return [
    "import assert from \"node:assert/strict\";",
    "import { miniMapperRequirements, mapMiniRow } from \"../src/mini_mapper.ts\";",
    "",
    `assert.equal(miniMapperRequirements.length, ${REQUIREMENTS.length});`,
    ...REQUIREMENTS.map(
      (requirement) =>
        `assert(miniMapperRequirements.some((entry) => entry.id === "${requirement.id}"));`
    ),
    "assert.deepEqual(mapMiniRow({ id: 7, name: \" Ada \", amount: \"4\" }), {",
    "  id: \"7\",",
    "  normalizedName: \"Ada\",",
    "  amount: 4",
    "});",
    ""
  ].join("\n");
}

function transformSeed() {
  return process.env.T100_MINI_SANDBOX_SEED?.trim() || DEFAULT_TRANSFORM_SEED;
}

function repeatCount() {
  const raw = process.env.T100_MINI_SANDBOX_REPEAT?.trim();
  if (raw === undefined || raw.length === 0) {
    return DEFAULT_REPEAT_COUNT;
  }
  const parsed = Number(raw);
  assert(
    Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_REPEAT_COUNT,
    `T100_MINI_SANDBOX_REPEAT must be an integer from 1 to ${MAX_REPEAT_COUNT}`
  );
  return parsed;
}

function trialLabel(trialIndex) {
  return `trial-${String(trialIndex + 1).padStart(3, "0")}`;
}

function seedNumber(value) {
  return createHash("sha256").update(value, "utf8").digest().readUInt32LE(0);
}

function seededRandom(value) {
  let state = seedNumber(value);
  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledFeatures(features, seed) {
  const rng = seededRandom(seed);
  const shuffled = [...features];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function randomFixedFeatureTransform(input) {
  const missingFeatures = FEATURE_CATALOG.filter(
    (feature) => !input.selectedFeatureIds.has(feature.featureId)
  );
  const rng = seededRandom(`${input.seed}:attempt:${input.attemptIndex}:count`);
  const batchSize = Math.min(missingFeatures.length, 2 + Math.floor(rng() * 3));
  const selected = shuffledFeatures(
    missingFeatures,
    `${input.seed}:attempt:${input.attemptIndex}:order`
  ).slice(0, batchSize);
  return Object.freeze({
    kind: "random_fixed_feature_transform",
    transformRef: `transform://t100-mini/${input.attemptIndex}`,
    seed: input.seed,
    attemptIndex: input.attemptIndex,
    selectedFeatureCountBefore: input.selectedFeatureIds.size,
    selectedFeatureCountAfter: input.selectedFeatureIds.size + selected.length,
    featureRefs: Object.freeze(selected.map((feature) => feature.featureId)),
    obligationRefs: Object.freeze(selected.map((feature) => feature.obligationId))
  });
}

function featureForObligation(obligationId) {
  const feature = FEATURE_CATALOG.find(
    (candidate) => candidate.obligationId === obligationId
  );
  assert.notEqual(feature, undefined, `missing feature ${obligationId}`);
  return feature;
}

function designMarkdownForFeatureIds(featureIds) {
  const selected = REQUIREMENTS.map((requirement) =>
    featureForObligation(requirement.id)
  ).filter((feature) => featureIds.has(feature.featureId));
  return [
    "# Mini Data Mapper Design",
    "",
    "The F_P transform may return any bounded batch of fixed feature fragments.",
    "The domain/F_P quality evaluator closes only features materially represented in this live design artifact.",
    "",
    ...selected.flatMap((feature) => [
      `## ${feature.obligationId}`,
      "",
      feature.marker,
      feature.acceptanceMarker,
      `Design obligation: ${feature.body}`,
      ""
    ])
  ].join("\n");
}

async function domainQualityAssessDesignRequirement(input) {
  const design = await readFile(input.designPath, "utf8");
  const feature = featureForObligation(input.item.obligationId);
  const markerObserved = design.includes(feature.marker);
  const acceptanceObserved = design.includes(feature.acceptanceMarker);
  const bodyObserved = design.includes(`Design obligation: ${feature.body}`);
  const accepted = markerObserved && acceptanceObserved && bodyObserved;
  return Object.freeze({
    kind: "domain_fp_requirement_assessment",
    evaluatorRef: "fp://t100-mini/domain-quality-requirement-assessor",
    attemptIndex: input.attemptIndex,
    scheduleItemId: input.item.scheduleItemId,
    obligationId: input.item.obligationId,
    designPath: input.designPath,
    status: accepted ? "accepted" : "pending",
    markerObserved,
    acceptanceObserved,
    bodyObserved,
    evidenceRefs: accepted
      ? Object.freeze([
          `file://${input.designPath}#${feature.obligationId}`,
          `assessment://t100-mini/domain-quality/${input.attemptIndex}/${feature.obligationId}`
        ])
      : Object.freeze([]),
    detail: accepted
      ? "domain/F_P quality assessment accepted the requirement-by-requirement transform"
      : "domain/F_P quality assessment did not accept this requirement yet"
  });
}

function allocationByName(allocations, outputName) {
  const allocation = allocations.find((entry) => entry.outputName === outputName);
  assert.notEqual(allocation, undefined, `missing allocation ${outputName}`);
  return allocation;
}

function assertOk(result) {
  assert.equal(result.ok, true, result.detail);
  return result;
}

async function materializeOutput(input) {
  const filePath = input.allocation.materializationUri;
  await writeText(filePath, input.content);
  return constructOutputMaterializationObservedEvent({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    allocation: input.allocation,
    materializedRef: `materialized://t100-mini/${input.allocation.outputName}`,
    materializedPath: filePath,
    digest: sha256(input.content),
    observerRef: "observer://t100-mini/local-plugin",
    artifactRefs: [`artifact://t100-mini/${input.allocation.outputName}`]
  });
}

async function writeJsonlCollection(targetPath, values) {
  const lines = values.map((value) => JSON.stringify(value));
  await writeText(targetPath, `${lines.join("\n")}\n`);
}

async function runMiniDataMapperTrial(input) {
  const timestamp = `${input.suiteTimestamp}-${trialLabel(input.trialIndex)}`;
  const runRoot = input.trialRoot;
  const workspaceRoot = path.join(runRoot, "workspace");
  const runtimeRoot = path.join(workspaceRoot, ".ai-workspace", "runtime");
  const runtimeAssetsRoot = path.join(runtimeRoot, "assets");
  const projectionsRoot = path.join(runtimeRoot, "projections");
  const { module, lifecycle } = miniLifecycleModule();
  const trialStartedAt = new Date().toISOString();

  await mkdir(runRoot, { recursive: true });
  await writeText(
    path.join(workspaceRoot, "README.md"),
    "# Mini Data Mapper Template\n\nA compact data-mapper-shaped sandbox.\n"
  );
  await writeText(
    path.join(workspaceRoot, "specification", "INTENT.md"),
    "# Intent\n\nBuild a compact mapper from 10 bootstrapped requirements.\n"
  );
  const requirementsPath = await writeText(
    path.join(workspaceRoot, "specification", "requirements", "mini_data_mapper.md"),
    requirementsMarkdown()
  );
  await writeText(
    path.join(workspaceRoot, ".ai-workspace", "context", "project_bootstrap.md"),
    [
      "# Mini Data Mapper Bootstrap",
      "",
      `Requirement count: ${REQUIREMENTS.length}`,
      "Lifecycle: bootstrap -> requirements -> design -> implementation -> tests -> archive",
      ""
    ].join("\n")
  );

  const request = admitPublicStartRequest({
    scope: {
      kind: "workspace",
      workspaceRoot,
      moduleName: module.name
    },
    target: {
      kind: "graph_function",
      handle: lifecycle.name
    },
    until: "converged",
    input_bindings: [
      {
        asset_ref: "workspace://mini_data_mapper_template/bootstrap_input_set",
        asset_type: "Workspace.bootstrap_input_set",
        uri: requirementsPath
      }
    ],
    requested_outputs: REQUESTED_OUTPUTS
  });
  const basis = admitExecutionBasis({
    startIntent: request.startIntent,
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t100-mini/local-plugin",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t100-mini/lifecycle",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t100-mini/local-plugin",
      approvalSubjectRef: null
    }),
    runId: `run://t100/mini-data-mapper/${timestamp}`,
    workKey: "wk://t100/mini-data-mapper/lifecycle",
    frameId: null,
    frameLineageId: null
  });

  const inputBindingRaw = request.startIntent.inputBindings[0];
  assert.notEqual(inputBindingRaw, undefined);
  const inputBinding = assertOk(
    admitWorkspaceAssetBinding({
      assetRef: inputBindingRaw.assetRef,
      assetType: inputBindingRaw.assetType,
      uri: inputBindingRaw.uri,
      workspaceRoot,
      bindingRole: "input",
      source: "caller"
    })
  ).binding;

  const allocations = request.startIntent.requestedOutputs.map((requestedOutput) =>
    assertOk(
      deriveOutputInstanceAllocation({
        basis,
        outputName: requestedOutput.outputName,
        outputAssetType: requestedOutput.outputAssetType,
        relativePath: requestedOutput.relativePath
      })
    ).allocation
  );
  const designAllocation = allocationByName(allocations, "design_surface");
  const implementationAllocation = allocationByName(
    allocations,
    "implementation_surface"
  );
  const testSuiteAllocation = allocationByName(allocations, "test_suite_surface");
  const archiveAllocation = allocationByName(allocations, "run_archive_surface");

  const rows = REQUIREMENTS.map((requirement) =>
    Object.freeze({
      kind: "obligation_ledger_row",
      obligationId: requirement.id,
      authorityRef: `workspace://mini_data_mapper_template/requirements/${requirement.id}`,
      description: requirement.title,
      status: "open",
      requiredOutputRefs: [designAllocation.assetRef]
    })
  );
  const ledger = assertOk(
    deriveObligationLedgerAsset({
      basis,
      sourceAsset: inputBinding,
      authorityDigest: sha256(await readFile(requirementsPath, "utf8")),
      rows
    })
  ).ledger;
  const schedule = assertOk(deriveObligationSchedule(ledger)).schedule;
  const zoomFrame = openZoomFrame({
    basis,
    vectorIndex: 0,
    inputAsset: inputBinding,
    outputAllocation: designAllocation,
    ledger,
    schedule
  });
  const manifest = constructOutputPluginHandoffManifest({
    basis,
    manifestRef: `manifest://t100-mini/${timestamp}/local-plugin`,
    admittedInputRefs: [inputBinding.assetRef],
    allocatedOutputs: allocations,
    proofObligationRefs: REQUIREMENTS.map((requirement) => requirement.id)
  });

  const events = [];
  for (const requestedOutput of REQUESTED_OUTPUTS) {
    const allocation = allocationByName(allocations, requestedOutput.output_name);
    events.push(
      constructOutputInstanceAllocatedEvent({
        basis,
        vectorIndex: requestedOutput.vectorIndex,
        allocation
      }),
      constructOutputBindingAdmittedEvent({
        basis,
        vectorIndex: requestedOutput.vectorIndex,
        allocation,
        bindingRef: `binding://t100-mini/${requestedOutput.output_name}`
      })
    );
  }
  events.push(
    constructWorkspaceObligationLedgerAdmittedEvent({
      basis,
      vectorIndex: 0,
      ledger
    }),
    constructWorkspaceObligationScheduleDerivedEvent({
      basis,
      vectorIndex: 0,
      schedule
    }),
    constructZoomFrameOpenedEvent({
      basis,
      zoomFrame
    })
  );

  const selectedFeatureIds = new Set();
  const randomTransformSeed = `${transformSeed()}:${trialLabel(input.trialIndex)}`;
  const assessments = [];
  const domainQualityAssessments = [];
  const transformAttempts = [];
  const evalLoopFoldbacks = [];
  const dispatchAttemptByItem = new Map();

  for (
    let transformAttemptIndex = 0;
    transformAttemptIndex < MAX_TRANSFORM_ATTEMPTS;
    transformAttemptIndex += 1
  ) {
    const transform = randomFixedFeatureTransform({
      seed: randomTransformSeed,
      attemptIndex: transformAttemptIndex,
      selectedFeatureIds
    });
    assert.notEqual(
      transform.featureRefs.length,
      0,
      "random feature transform exhausted before closure"
    );
    transformAttempts.push(transform);
    for (const featureRef of transform.featureRefs) {
      selectedFeatureIds.add(featureRef);
    }
    await writeText(
      designAllocation.materializationUri,
      designMarkdownForFeatureIds(selectedFeatureIds)
    );

    for (const item of schedule.items) {
      if (
        assessments.some(
          (assessment) => assessment.scheduleItemId === item.scheduleItemId
        )
      ) {
        continue;
      }
      const attemptIndex = dispatchAttemptByItem.get(item.scheduleItemId) ?? 0;
      dispatchAttemptByItem.set(item.scheduleItemId, attemptIndex + 1);
      const dispatch = constructScheduledSlicePluginHandoff({
        manifest,
        zoomFrame,
        item,
        pluginRef: "plugin://t100-mini/random-fixed-feature-transform",
        attemptIndex
      });
      events.push(
        constructScheduledSliceDispatchedEvent({ basis, zoomFrame, dispatch })
      );
      const evaluation = await domainQualityAssessDesignRequirement({
        designPath: designAllocation.materializationUri,
        item,
        attemptIndex
      });
      domainQualityAssessments.push(evaluation);
      if (evaluation.status !== "accepted") {
        continue;
      }
      const assessment = admitScheduledSliceAssessment({
        zoomFrame,
        schedule,
        assessmentId: `assessment://t100-mini/${item.obligationId}`,
        scheduleItemId: item.scheduleItemId,
        obligationId: item.obligationId,
        attemptIndex,
        status: "fulfilled",
        assessmentRegime: "F_P",
        findingClass: "fulfilled",
        evidenceRefs: evaluation.evidenceRefs,
        outputRefs: [designAllocation.assetRef],
        runtimeFailureClass: null,
        detail: evaluation.detail
      });
      events.push(
        constructScheduledSliceAssessedEvent({ basis, zoomFrame, assessment })
      );
      assessments.push(assessment);
    }

    const attemptFoldback = deriveZoomFoldbackEvaluationFromEvents({
      basis,
      zoomFrame,
      schedule,
      events
    });
    evalLoopFoldbacks.push(
      Object.freeze({
        attemptIndex: transformAttemptIndex,
        decision: attemptFoldback.decision,
        fulfilledCount: attemptFoldback.fulfilledCount,
        missingAssessmentCount: attemptFoldback.missingAssessmentCount
      })
    );
    if (attemptFoldback.decision === "close") {
      break;
    }
  }

  const finalDesignContent = await readFile(designAllocation.materializationUri, "utf8");
  const foldback = deriveZoomFoldbackEvaluationFromEvents({
    basis,
    zoomFrame,
    schedule,
    events
  });
  const outer = deriveOuterTraversalEvaluation({ basis, zoomFrame, foldback });
  events.push(
    await materializeOutput({
      basis,
      vectorIndex: 0,
      allocation: designAllocation,
      content: finalDesignContent
    }),
    constructZoomFoldbackEvaluatedEvent({ basis, zoomFrame, foldback })
  );

  const archiveContent = JSON.stringify(
    {
      scenario: "t100_mini_data_mapper_lifecycle",
      status: "passed",
      requirementCount: REQUIREMENTS.length,
      fulfilledCount: foldback.fulfilledCount,
      transformAttemptCount: transformAttempts.length,
      domainQualityAssessmentCount: domainQualityAssessments.length,
      lifecycleStages: [
        "bootstrap",
        "requirements",
        "design",
        "implementation",
        "tests",
        "archive"
      ]
    },
    null,
    2
  );
  events.push(
    await materializeOutput({
      basis,
      vectorIndex: 1,
      allocation: implementationAllocation,
      content: implementationSource()
    }),
    await materializeOutput({
      basis,
      vectorIndex: 2,
      allocation: testSuiteAllocation,
      content: testSuiteSource()
    }),
    await materializeOutput({
      basis,
      vectorIndex: 3,
      allocation: archiveAllocation,
      content: `${archiveContent}\n`
    })
  );

  const emitted = [];
  emit(events, (event) => emitted.push(event));
  const outputProjection = deriveOutputAllocationProjection({ basis, events: emitted });
  const zoomProjection = deriveWorkspaceZoomProjection({
    basis,
    events: emitted,
    zoomFrame,
    schedule
  });
  const systemProjection = deriveWorkspaceSystemProjection({
    workspaceRoot,
    assetRefs: [
      inputBinding.assetRef,
      ledger.ledgerRef,
      schedule.scheduleRef,
      foldback.foldbackRef,
      ...outputProjection.allocatedOutputRefs,
      ...outputProjection.materializedOutputRefs
    ]
  });

  await writeText(
    path.join(runtimeRoot, "events.jsonl"),
    `${emitted.map((event) => JSON.stringify(event)).join("\n")}\n`
  );
  await writeJson(path.join(runtimeAssetsRoot, "requirements_ledger.json"), ledger);
  await writeJson(path.join(runtimeAssetsRoot, "requirements_schedule.json"), schedule);
  await writeJson(path.join(runtimeAssetsRoot, "plugin_handoff_manifest.json"), manifest);
  await writeJson(
    path.join(runtimeAssetsRoot, "random_feature_transforms.json"),
    transformAttempts
  );
  await writeJson(
    path.join(runtimeAssetsRoot, "domain_quality_assessments.json"),
    domainQualityAssessments
  );
  await writeJson(
    path.join(runtimeAssetsRoot, "eval_loop_foldbacks.json"),
    evalLoopFoldbacks
  );
  await writeJson(path.join(runtimeAssetsRoot, "foldback_evaluation.json"), foldback);
  await writeJson(path.join(runtimeAssetsRoot, "outer_evaluation.json"), outer);
  await writeJson(
    path.join(projectionsRoot, "output_allocation_projection.json"),
    outputProjection
  );
  await writeJson(
    path.join(projectionsRoot, "workspace_zoom_projection.json"),
    zoomProjection
  );
  await writeJson(
    path.join(projectionsRoot, "workspace_system_projection.json"),
    systemProjection
  );
  await writeJson(path.join(runRoot, "run.json"), {
    scenarioName: "t100_mini_data_mapper_lifecycle",
    timestamp,
    workspaceRoot,
    graphFunctionName: lifecycle.name,
    basisId: basis.id,
    runId: basis.runId,
    workKey: basis.workKey,
    randomTransformSeed
  });
  await writeJson(path.join(runRoot, "summary.json"), {
    passed:
      foldback.decision === "close" &&
      outer.closureAllowed &&
      outputProjection.materializedOutputRefs.length === REQUESTED_OUTPUTS.length,
    requirementCount: REQUIREMENTS.length,
    scheduleItemCount: schedule.items.length,
    fulfilledCount: foldback.fulfilledCount,
    foldbackDecision: foldback.decision,
    closureAllowed: outer.closureAllowed,
    randomTransformSeed,
    transformAttemptCount: transformAttempts.length,
    domainQualityAssessmentCount: domainQualityAssessments.length,
    pendingEvaluationCount: domainQualityAssessments.filter(
      (evaluation) => evaluation.status === "pending"
    ).length,
    firstEvalLoopDecision: evalLoopFoldbacks[0]?.decision ?? null,
    finalEvalLoopDecision: evalLoopFoldbacks.at(-1)?.decision ?? null,
    eventCount: emitted.length,
    materializedOutputCount: outputProjection.materializedOutputRefs.length,
    outputNames: allocations.map((allocation) => allocation.outputName).sort()
  });
  await writeText(
    path.join(runRoot, "postmortem.md"),
    [
      "# T-100 Mini Data Mapper Lifecycle Sandbox",
      "",
      `Run: ${timestamp}`,
      `Requirements: ${REQUIREMENTS.length}`,
      `Random transform seed: ${randomTransformSeed}`,
      `Transform attempts: ${transformAttempts.length}`,
      `Domain quality assessments: ${domainQualityAssessments.length}`,
      `Foldback: ${foldback.decision}`,
      `Closure allowed: ${outer.closureAllowed}`,
      "",
      "This sandbox lets the transform return bounded random fixed-feature batches while a domain/F_P quality assessor evaluates A.req_i -> B.result_i before any slice assessment is admitted.",
      ""
    ].join("\n")
  );
  await writeText(path.join(runRoot, "stdout.log"), "t100 mini lifecycle passed\n");
  await writeText(path.join(runRoot, "stderr.log"), "");

  const passed =
    foldback.decision === "close" &&
    outer.closureAllowed &&
    outputProjection.materializedOutputRefs.length === REQUESTED_OUTPUTS.length;
  const trialCompletedAt = new Date().toISOString();
  const trial = constructEvalTrial({
    trialRef: `eval-trial://t100-mini-data-mapper/${input.suiteTimestamp}/${trialLabel(input.trialIndex)}`,
    suiteId: input.suite.suiteId,
    taskRef: input.task.taskRef,
    trialIndex: input.trialIndex,
    workerRef: basis.runtimeIdentity.workerId,
    policyRef: basis.resolvedPolicy.resolvedPolicyBundleRef,
    outputRootRef: `file://${runtimeRoot}`,
    eventStreamRef: `file://${path.join(runtimeRoot, "events.jsonl")}`,
    transcriptRefs: [
      `file://${path.join(runRoot, "stdout.log")}`,
      `file://${path.join(runRoot, "stderr.log")}`
    ],
    startedAt: trialStartedAt,
    completedAt: trialCompletedAt
  });
  const projectionRefs = [
    `file://${path.join(projectionsRoot, "output_allocation_projection.json")}`,
    `file://${path.join(projectionsRoot, "workspace_zoom_projection.json")}`,
    `file://${path.join(projectionsRoot, "workspace_system_projection.json")}`
  ];
  const outcome = constructEvalOutcome({
    outcomeRef: `eval-outcome://t100-mini-data-mapper/${input.suiteTimestamp}/${trialLabel(input.trialIndex)}`,
    trialRef: trial.trialRef,
    taskRef: input.task.taskRef,
    terminalDecision: foldback.decision,
    passed,
    materializedOutputRefs: outputProjection.materializedOutputRefs,
    projectionRefs,
    foldbackRef: foldback.foldbackRef,
    admittedEvidenceRefs: [
      ledger.ledgerRef,
      schedule.scheduleRef,
      foldback.foldbackRef,
      ...assessments.map((assessment) => assessment.assessmentId)
    ],
    failureClass: passed ? null : "contract_failure"
  });
  const fdMechanicalPassed =
    outputProjection.materializedOutputRefs.length === REQUESTED_OUTPUTS.length &&
    outputProjection.allocatedOutputRefs.length === REQUESTED_OUTPUTS.length &&
    emitted.length > 0;
  const fpRows = schedule.items.map((item) => {
    const assessment = assessments.find(
      (candidate) => candidate.scheduleItemId === item.scheduleItemId
    );
    const status = assessment?.status === "fulfilled" ? "pass" : "fail";
    return {
      kind: "eval_grade_row",
      gradeRef: `eval-grade://t100-mini-data-mapper/${input.suiteTimestamp}/${trialLabel(input.trialIndex)}/fp/${item.obligationId}`,
      trialRef: trial.trialRef,
      taskRef: input.task.taskRef,
      regime: "F_P",
      subjectRef: item.scheduleItemId,
      obligationRef: item.obligationId,
      status,
      detail:
        assessment?.detail ??
        "domain/F_P semantic assessment did not produce fulfilled evidence",
      evidenceRefs: assessment?.evidenceRefs ?? []
    };
  });
  const gradeVector = constructEvalGradeVector({
    gradeVectorRef: `eval-grade-vector://t100-mini-data-mapper/${input.suiteTimestamp}/${trialLabel(input.trialIndex)}`,
    trialRef: trial.trialRef,
    taskRef: input.task.taskRef,
    rows: [
      {
        kind: "eval_grade_row",
        gradeRef: `eval-grade://t100-mini-data-mapper/${input.suiteTimestamp}/${trialLabel(input.trialIndex)}/fd/mechanical-envelope`,
        trialRef: trial.trialRef,
        taskRef: input.task.taskRef,
        regime: "F_D",
        subjectRef: `file://${runtimeRoot}`,
        obligationRef: null,
        status: fdMechanicalPassed ? "pass" : "fail",
        detail:
          "F_D mechanical envelope covers event emission plus allocated output materialization count only",
        evidenceRefs: projectionRefs
      },
      ...fpRows
    ]
  });
  await writeJson(path.join(runRoot, "eval_trial.json"), trial);
  await writeJson(path.join(runRoot, "eval_outcome.json"), outcome);
  await writeJson(path.join(runRoot, "eval_grade_vector.json"), gradeVector);

  assert.equal(request.startIntent.inputBindings.length, 1);
  assert.equal(request.startIntent.requestedOutputs.length, REQUESTED_OUTPUTS.length);
  assert.equal(schedule.items.length, REQUIREMENTS.length);
  assert.equal(assessments.length, REQUIREMENTS.length);
  assert(transformAttempts.length > 1);
  assert(domainQualityAssessments.length > REQUIREMENTS.length);
  assert(
    domainQualityAssessments.some((evaluation) => evaluation.status === "pending"),
    "live eval loop must observe at least one missing feature before closure"
  );
  assert.equal(evalLoopFoldbacks[0]?.decision, "retry_scheduled_slice");
  assert.equal(evalLoopFoldbacks.at(-1)?.decision, "close");
  assert.equal(foldback.decision, "close");
  assert.equal(outer.closureAllowed, true);
  assert.equal(zoomProjection.foldbackEvaluation.decision, "close");
  assert.equal(outputProjection.materializedOutputRefs.length, REQUESTED_OUTPUTS.length);
  assert.deepEqual(
    outputProjection.allocatedOutputRefs,
    allocations.map((allocation) => allocation.assetRef).sort()
  );
  assert(systemProjection.assetRefs.includes(ledger.ledgerRef));
  assert(systemProjection.assetRefs.includes(schedule.scheduleRef));

  const savedSummary = JSON.parse(await readFile(path.join(runRoot, "summary.json"), "utf8"));
  assert.equal(savedSummary.requirementCount, 10);
  assert.equal(savedSummary.foldbackDecision, "close");
  assert.equal(savedSummary.finalEvalLoopDecision, "close");
  assert.equal(savedSummary.materializedOutputCount, REQUESTED_OUTPUTS.length);
  assert.equal(gradeVector.verdict, "pass");

  return Object.freeze({
    trial,
    outcome,
    gradeVector,
    runRoot,
    summary: savedSummary
  });
}

test("T-100 mini data mapper lifecycle sandbox writes repeatable eval-suite evidence", async () => {
  const suiteTimestamp = stableTimestamp();
  const suiteRoot = path.join(TEST_RUNS_ROOT, suiteTimestamp);
  const k = repeatCount();
  const suiteId = "mini_data_mapper_eval";
  const task = constructEvalTask({
    taskRef: "eval-task://t100-mini-data-mapper/requirements-to-design",
    suiteId,
    graphFunctionRef: "graph-function://t100-mini-data-mapper/lifecycle",
    edgeRef: "edge://bootstrap-to-design-lifecycle",
    inputRefs: ["workspace://mini_data_mapper_template/bootstrap_input_set"],
    declaredOutputRefs: REQUESTED_OUTPUTS.map(
      (requestedOutput) => requestedOutput.output_asset_type
    ),
    referenceSolutionRefs: [
      "reference://odd-sdlc/data-mapper/test35/edge-fulfillment-ledgers"
    ],
    successCriteriaRefs: [
      "criterion://all-10-requirements-have-domain-fp-semantic-rows",
      "criterion://foldback-decision-close",
      "criterion://all-declared-outputs-materialized"
    ],
    graderRefs: [
      "fd://t100-mini/mechanical-envelope",
      "fp://t100-mini/domain-quality-requirement-assessor"
    ]
  });
  const suite = constructEvalSuiteSpec({
    suiteId,
    suiteRunRef: `eval-suite-run://t100-mini-data-mapper/${suiteTimestamp}`,
    goal: "Measure repeatable mini data-mapper A.req_i to B.result_i semantic transform quality",
    suiteClass: "capability",
    ownerRef: "ticket://T-102",
    sourceRefs: [
      "ticket://T-082",
      "ticket://T-100",
      "comment://codex/20260502T170909AEST_anthropic_eval_design_summary_for_abg"
    ],
    taskRefs: [task.taskRef],
    repeatCount: k,
    passThreshold: 1,
    saturationPolicy: "promote-to-regression-only-after-repeat-passAllK-is-stable"
  });
  await mkdir(suiteRoot, { recursive: true });
  await writeJson(path.join(suiteRoot, "eval_suite.json"), suite);
  await writeJson(path.join(suiteRoot, "eval_task.json"), task);

  const trialResults = [];
  for (let trialIndex = 0; trialIndex < k; trialIndex += 1) {
    trialResults.push(
      await runMiniDataMapperTrial({
        suiteTimestamp,
        suiteRoot,
        trialRoot: path.join(suiteRoot, "trials", trialLabel(trialIndex)),
        trialIndex,
        suite,
        task
      })
    );
  }

  const trials = trialResults.map((result) => result.trial);
  const outcomes = trialResults.map((result) => result.outcome);
  const gradeVectors = trialResults.map((result) => result.gradeVector);
  const aggregate = deriveEvalAggregateProjection({
    suite,
    tasks: [task],
    trials,
    outcomes,
    gradeVectors
  });
  await writeJsonlCollection(path.join(suiteRoot, "eval_trials.jsonl"), trials);
  await writeJsonlCollection(path.join(suiteRoot, "eval_outcomes.jsonl"), outcomes);
  await writeJsonlCollection(
    path.join(suiteRoot, "eval_grade_vectors.jsonl"),
    gradeVectors
  );
  await writeJson(
    path.join(suiteRoot, "eval_aggregate_projection.json"),
    aggregate
  );
  await writeJson(path.join(suiteRoot, "summary.json"), {
    scenarioName: "t100_mini_data_mapper_lifecycle",
    suiteId: suite.suiteId,
    suiteRunRef: suite.suiteRunRef,
    repeatCount: k,
    passAtK: aggregate.passAtK,
    passAllK: aggregate.passAllK,
    passRate: aggregate.passRate,
    verdict: aggregate.verdict,
    trialRefs: aggregate.trialRefs
  });
  await writeText(
    path.join(suiteRoot, "review_sample.md"),
    [
      "# T-100 Mini Data Mapper Eval Review Sample",
      "",
      `Suite run: ${suite.suiteRunRef}`,
      `Trials: ${aggregate.trialCount}`,
      `pass@k: ${String(aggregate.passAtK)}`,
      `pass^k: ${String(aggregate.passAllK)}`,
      `Pass rate: ${aggregate.passRate}`,
      "",
      "Failed trials:",
      ...outcomes
        .filter((outcome) => !outcome.passed)
        .map((outcome) => `- ${outcome.trialRef}: ${outcome.terminalDecision}`),
      ...(outcomes.every((outcome) => outcome.passed) ? ["- none"] : []),
      "",
      "Transcript refs:",
      ...trials.flatMap((trial) =>
        trial.transcriptRefs.map((ref) => `- ${trial.trialRef}: ${ref}`)
      ),
      "",
      "Semantic grade vectors are F_P rows. The F_D row only checks the mechanical envelope.",
      ""
    ].join("\n")
  );

  assert.equal(aggregate.trialCount, k);
  assert.equal(aggregate.passedTrialCount, k);
  assert.equal(aggregate.failedTrialCount, 0);
  assert.equal(aggregate.unknownTrialCount, 0);
  assert.equal(aggregate.passAtK, true);
  assert.equal(aggregate.passAllK, true);
  assert.equal(aggregate.gradeFailCount, 0);
  assert.equal(aggregate.verdict, "passed");
  const savedAggregate = JSON.parse(
    await readFile(path.join(suiteRoot, "eval_aggregate_projection.json"), "utf8")
  );
  assert.equal(savedAggregate.passAtK, true);
  assert.equal(savedAggregate.passAllK, true);
});
