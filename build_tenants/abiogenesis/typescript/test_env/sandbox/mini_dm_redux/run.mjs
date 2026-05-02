// Mini data-mapper redux sandbox — per-edge runner.
//
// Usage:
//   node test_env/sandbox/mini_dm_redux/run.mjs --edge derive_field_spec      --workspace <dir>
//   node test_env/sandbox/mini_dm_redux/run.mjs --edge derive_implementation  --workspace <dir>
//   node test_env/sandbox/mini_dm_redux/run.mjs --edge derive_validation      --workspace <dir>
//   node test_env/sandbox/mini_dm_redux/run.mjs --gaps                        --workspace <dir>
//   node test_env/sandbox/mini_dm_redux/run.mjs --full                        --workspace <dir>
//   node test_env/sandbox/mini_dm_redux/run.mjs --full --workspace <dir> --output-workspace <dir>
//
// Each --edge invocation:
//   1. picks up state.json from <dir> (creates fresh on first edge)
//   2. allocates output via T-082, opens a zoom frame, derives the obligation
//      ledger and schedule
//   3. invokes the F_P worker plugin (fixture or live, depending on env)
//   4. writes the worker's body to the T-082-allocated path
//   5. invokes the F_D mechanical envelope evaluator
//   6. invokes the F_P semantic evaluator (deep, per obligation)
//   7. admits a ScheduledSliceAssessment per obligation
//   8. derives the zoom foldback and the outer evaluation
//   9. appends events.jsonl, writes ledger.json / assessments.jsonl /
//      frame.json under the run's per-edge zoom_foldback dir, updates
//      state.json
//
// Operator can `cat` the per-edge ledger / assessments / events between
// invocations. Live mode is gated by CODEX_LIVE_FP=1.

import {
  appendFile,
  mkdir,
  readFile,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitExecutionBasis,
  admitModule,
  admitOutputWorkspaceBinding,
  admitPublicStartRequest,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitScheduledSliceAssessment,
  admitWorkspaceAssetBinding,
  constructOutputBindingAdmittedEvent,
  constructOutputInstanceAllocatedEvent,
  constructOutputMaterializationObservedEvent,
  constructOutputPluginHandoffManifest,
  constructScheduledSliceAssessedEvent,
  constructScheduledSliceDispatchedEvent,
  constructScheduledSlicePluginHandoff,
  constructWorkspaceObligationLedgerAdmittedEvent,
  constructWorkspaceObligationScheduleDerivedEvent,
  constructZoomFoldbackEvaluatedEvent,
  constructZoomFrameOpenedEvent,
  deriveObligationLedgerAsset,
  deriveObligationSchedule,
  deriveOuterTraversalEvaluation,
  deriveOutputInstanceAllocation,
  deriveZoomFoldbackEvaluationFromEvents,
  emit,
  openZoomFrame
} from "../../../build/semantic/code/src/index.js";

import {
  EDGE_DEFS,
  OBLIGATION_CATALOG,
  PROBLEM_STATEMENT,
  buildMiniDmReduxModule
} from "./module.mjs";
import { evaluateEdgeArtifact } from "./fp_evaluator.mjs";
import { evaluateFdEnvelope, sha256 } from "./fd_envelope.mjs";
import { runFpWorkerForEdge } from "./fp_worker.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_TS_ROOT = path.resolve(SCRIPT_DIR, "..", "..", "..");

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function writeText(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeJsonl(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

function parseArgs(argv) {
  const out = {
    edge: null,
    workspace: null,
    outputWorkspace: null,
    outputWorkspaceRef: null,
    outputWorkspaceAuthorityRef: null,
    gaps: false,
    full: false
  };
  for (let idx = 2; idx < argv.length; idx += 1) {
    const arg = argv[idx];
    if (arg === "--edge") {
      out.edge = argv[idx + 1] ?? null;
      idx += 1;
      continue;
    }
    if (arg === "--workspace") {
      out.workspace = argv[idx + 1] ?? null;
      idx += 1;
      continue;
    }
    if (arg === "--output-workspace") {
      out.outputWorkspace = argv[idx + 1] ?? null;
      idx += 1;
      continue;
    }
    if (arg === "--output-workspace-ref") {
      out.outputWorkspaceRef = argv[idx + 1] ?? null;
      idx += 1;
      continue;
    }
    if (arg === "--output-workspace-authority-ref") {
      out.outputWorkspaceAuthorityRef = argv[idx + 1] ?? null;
      idx += 1;
      continue;
    }
    if (arg === "--gaps") {
      out.gaps = true;
      continue;
    }
    if (arg === "--full") {
      out.full = true;
      continue;
    }
  }
  return out;
}

function timestampId() {
  return new Date().toISOString().replaceAll(/[-:.]/gu, "");
}

function safeRefSegment(value) {
  const safe = value.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe.length === 0 ? "workspace" : safe;
}

function isUnderRoot(candidate, root) {
  const relative = path.relative(root, candidate);
  return relative.length === 0 || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function workspaceLayout(workspaceRoot, options = {}) {
  const outputWorkspaceRoot =
    options.outputWorkspace === undefined || options.outputWorkspace === null
      ? workspaceRoot
      : path.resolve(options.outputWorkspace);
  const explicitOutputWorkspace = outputWorkspaceRoot !== workspaceRoot;
  const outputWorkspaceRef =
    options.outputWorkspaceRef ??
    `workspace://t101-mini-dm-redux/output/${safeRefSegment(path.basename(outputWorkspaceRoot))}`;
  const aiRoot = path.join(workspaceRoot, ".ai-workspace");
  const runtimeRoot = path.join(aiRoot, "runtime");
  return {
    workspaceRoot,
    outputWorkspaceRoot,
    explicitOutputWorkspace,
    outputWorkspaceRef,
    outputWorkspaceAuthorityRef: options.outputWorkspaceAuthorityRef ?? null,
    aiRoot,
    runtimeRoot,
    eventsLogPath: path.join(runtimeRoot, "events", "events.jsonl"),
    allocationsRoot: path.join(runtimeRoot, "allocations"),
    assetsRoot: path.join(runtimeRoot, "assets"),
    zoomRoot: path.join(runtimeRoot, "zoom_foldback"),
    invocationLogsRoot: path.join(workspaceRoot, "invocation_logs"),
    statePath: path.join(workspaceRoot, "state.json"),
    manifestPath: path.join(workspaceRoot, "manifest.json"),
    readmePath: path.join(workspaceRoot, "README.md")
  };
}

async function loadOrInitState(layout, options = {}) {
  if (await pathExists(layout.statePath)) {
    const raw = await readFile(layout.statePath, "utf8");
    return JSON.parse(raw);
  }
  const runId = options.runId ?? `t101-mini-dm-redux/${timestampId()}`;
  const state = {
    runId,
    workspaceRoot: layout.workspaceRoot,
    outputWorkspaceRoot: layout.outputWorkspaceRoot,
    createdAt: new Date().toISOString(),
    edges: {},
    edgeOrder: [],
    randomSeed: "t101-mini-dm-redux-seed"
  };
  await writeJson(layout.statePath, state);
  return state;
}

async function ensureSeedInputs(layout) {
  const inputDir = path.join(layout.workspaceRoot, "input");
  const inputPath = path.join(inputDir, "raw_problem.md");
  if (!(await pathExists(inputPath))) {
    await writeText(
      inputPath,
      [
        "# Raw Problem",
        "",
        PROBLEM_STATEMENT,
        ""
      ].join("\n")
    );
  }
  return inputPath;
}

function edgeIndexByName(name) {
  return EDGE_DEFS.findIndex((entry) => entry.name === name);
}

function edgeDefByName(name) {
  const def = EDGE_DEFS.find((entry) => entry.name === name);
  if (def === undefined) {
    throw new Error(`unknown edge ${name}`);
  }
  return def;
}

function obligationLedgerRowsForEdge(edgeDef, designAllocation) {
  return edgeDef.obligationIds.map((obligationId) => {
    const catalog = OBLIGATION_CATALOG[obligationId];
    return {
      kind: "obligation_ledger_row",
      obligationId,
      authorityRef: `workspace://t101-mini-dm-redux/obligations/${obligationId}`,
      description: catalog.title,
      status: "open",
      requiredOutputRefs: [designAllocation.assetRef]
    };
  });
}

async function readPriorEdgeArtifactPath(layout, state, edgeName) {
  const prior = state.edges[edgeName];
  if (prior === undefined || prior.materializationPath === undefined) {
    return null;
  }
  return prior.materializationPath;
}

function buildPerEdgeModule(edgeDef, perEdgeGraphFunctions) {
  const graphFunction = perEdgeGraphFunctions[edgeDef.name];
  return admitModule({
    name: `t101_mini_dm_redux_${edgeDef.name}_module`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: `job:t101-mini-dm-redux/${edgeDef.name}`,
        name: `t101_mini_dm_redux_${edgeDef.name}_job`,
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t101", "mini-dm-redux"]
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

function sourceWorkspaceRootForPath(layout, inputPath) {
  const resolvedInputPath = path.resolve(inputPath);
  if (isUnderRoot(resolvedInputPath, layout.outputWorkspaceRoot)) {
    return layout.outputWorkspaceRoot;
  }
  return layout.workspaceRoot;
}

async function buildBasisForEdge(edgeDef, layout, inputPath, inputWorkspaceRoot) {
  const built = buildMiniDmReduxModule();
  const perEdgeModule = buildPerEdgeModule(edgeDef, built.perEdgeGraphFunctions);
  const requestedOutput = {
    output_name: edgeDef.outputName,
    output_asset_type: edgeDef.outputAssetType,
    relative_path: edgeDef.relativePath,
    vectorIndex: 0
  };
  const requestedOutputs = [
    layout.explicitOutputWorkspace
      ? {
          ...requestedOutput,
          output_workspace: {
            workspace_ref: layout.outputWorkspaceRef,
            workspace_root: layout.outputWorkspaceRoot,
            authority_ref: layout.outputWorkspaceAuthorityRef
          }
        }
      : requestedOutput
  ];
  const requestBody = {
    scope: {
      kind: "workspace",
      workspaceRoot: inputWorkspaceRoot,
      moduleName: perEdgeModule.name
    },
    target: {
      kind: "graph_function",
      handle: edgeDef.name
    },
    until: "converged",
    input_bindings: [
      {
        asset_ref: `workspace://t101-mini-dm-redux/${edgeDef.sourceKind}`,
        asset_type: `Workspace.${edgeDef.sourceKind}`,
        uri: inputPath
      }
    ],
    requested_outputs: requestedOutputs
  };
  const request = admitPublicStartRequest(requestBody);
  const basis = admitExecutionBasis({
    startIntent: request.startIntent,
    module: perEdgeModule,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t101-mini-dm-redux/local",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t101-mini-dm-redux/lifecycle",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t101-mini-dm-redux/local",
      approvalSubjectRef: null
    }),
    runId: `run://t101-mini-dm-redux/${edgeDef.name}`,
    workKey: `wk://t101-mini-dm-redux/${edgeDef.name}`,
    frameId: null,
    frameLineageId: null
  });
  return { request, basis };
}

function assertOk(result) {
  if (!result.ok) {
    throw new Error(`admission failure: ${result.detail ?? "unknown"}`);
  }
  return result;
}

async function appendEvents(layout, events) {
  for (const event of events) {
    await writeJsonl(layout.eventsLogPath, event);
  }
}

async function runEdge(edgeName, layout, state) {
  const edgeDef = edgeDefByName(edgeName);
  const idx = edgeIndexByName(edgeName);
  if (idx > 0) {
    const priorEdgeName = EDGE_DEFS[idx - 1].name;
    if (state.edges[priorEdgeName] === undefined) {
      throw new Error(
        `cannot run ${edgeName}: prior edge ${priorEdgeName} has not been run`
      );
    }
  }

  const seedInputPath = await ensureSeedInputs(layout);
  const priorEdge = idx === 0 ? null : EDGE_DEFS[idx - 1];
  const inputPath =
    priorEdge === null
      ? seedInputPath
      : (await readPriorEdgeArtifactPath(layout, state, priorEdge.name));
  if (inputPath === null) {
    throw new Error(
      `cannot run ${edgeName}: prior edge artifact path is missing in state`
    );
  }

  const inputWorkspaceRoot = sourceWorkspaceRootForPath(layout, inputPath);
  const { request, basis } = await buildBasisForEdge(
    edgeDef,
    layout,
    inputPath,
    inputWorkspaceRoot
  );

  const inputBindingRaw = request.startIntent.inputBindings[0];
  const inputBinding = assertOk(
    admitWorkspaceAssetBinding({
      assetRef: inputBindingRaw.assetRef,
      assetType: inputBindingRaw.assetType,
      uri: inputBindingRaw.uri,
      workspaceRoot: inputWorkspaceRoot,
      bindingRole: "input",
      source: "caller"
    })
  ).binding;

  const requestedOutput = request.startIntent.requestedOutputs[0];
  const outputWorkspaceBinding =
    requestedOutput.outputWorkspace === undefined
      ? undefined
      : assertOk(
          admitOutputWorkspaceBinding({
            workspaceRef: requestedOutput.outputWorkspace.workspaceRef,
            workspaceRoot: requestedOutput.outputWorkspace.workspaceRoot,
            authorityRef: requestedOutput.outputWorkspace.authorityRef,
            source: "caller"
          })
        ).binding;
  const allocation = assertOk(
    deriveOutputInstanceAllocation({
      basis,
      outputName: requestedOutput.outputName,
      outputAssetType: requestedOutput.outputAssetType,
      relativePath: requestedOutput.relativePath,
      ...(outputWorkspaceBinding === undefined
        ? {}
        : { outputWorkspaceBinding })
    })
  ).allocation;
  await writeJson(
    path.join(layout.allocationsRoot, `${edgeDef.name}.json`),
    allocation
  );

  const ledgerRows = obligationLedgerRowsForEdge(edgeDef, allocation);
  const sourceContent = await readFile(inputPath, "utf8");
  const ledger = assertOk(
    deriveObligationLedgerAsset({
      basis,
      sourceAsset: inputBinding,
      authorityDigest: sha256(sourceContent),
      rows: ledgerRows
    })
  ).ledger;
  const schedule = assertOk(deriveObligationSchedule(ledger)).schedule;
  const zoomFrame = openZoomFrame({
    basis,
    vectorIndex: 0,
    inputAsset: inputBinding,
    outputAllocation: allocation,
    ledger,
    schedule
  });
  const manifest = constructOutputPluginHandoffManifest({
    basis,
    manifestRef: `manifest://t101-mini-dm-redux/${edgeDef.name}`,
    admittedInputRefs: [inputBinding.assetRef],
    admittedInputBindings: [inputBinding],
    allocatedOutputs: [allocation],
    proofObligationRefs: edgeDef.obligationIds
  });

  const events = [
    constructOutputInstanceAllocatedEvent({ basis, vectorIndex: 0, allocation }),
    constructOutputBindingAdmittedEvent({
      basis,
      vectorIndex: 0,
      allocation,
      bindingRef: `binding://t101-mini-dm-redux/${edgeDef.name}`
    }),
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
    constructZoomFrameOpenedEvent({ basis, zoomFrame })
  ];

  // F_P WORKER (live or fixture). Produces the artifact body.
  const invocationLogPath = path.join(
    layout.invocationLogsRoot,
    `edge_${idx + 1}_${edgeDef.name}`
  );
  await mkdir(path.dirname(invocationLogPath), { recursive: true });
  const workerOutcome = await runFpWorkerForEdge({
    edgeName: edgeDef.name,
    priorArtifactBody: priorEdge === null ? null : sourceContent,
    invocationLogPath
  });
  await writeText(allocation.materializationUri, workerOutcome.body);
  const digest = sha256(workerOutcome.body);
  events.push(
    constructOutputMaterializationObservedEvent({
      basis,
      vectorIndex: 0,
      allocation,
      materializedRef: `materialized://t101-mini-dm-redux/${edgeDef.name}`,
      materializedPath: allocation.materializationUri,
      digest,
      observerRef: "observer://t101-mini-dm-redux/local",
      artifactRefs: [`artifact://t101-mini-dm-redux/${edgeDef.name}`]
    })
  );

  // F_D MECHANICAL ENVELOPE.
  const fdResult = await evaluateFdEnvelope({
    edgeDef,
    artifactPath: allocation.materializationUri,
    allocation,
    manifest,
    expectedDigest: digest
  });

  // F_P SEMANTIC EVALUATOR. Per-obligation deep checks.
  const fpResult = await evaluateEdgeArtifact({
    edgeDef,
    artifactPath: allocation.materializationUri,
    artifactRef: `artifact://t101-mini-dm-redux/${edgeDef.name}`,
    priorImplementationPath:
      edgeDef.name === "derive_validation"
        ? state.edges["derive_implementation"]?.materializationPath ?? null
        : null,
    invocationLogPath,
    runtimeContext: { edgeName: edgeDef.name }
  });

  // Admit a ScheduledSliceAssessment per obligation.
  const assessments = [];
  for (let itemIdx = 0; itemIdx < schedule.items.length; itemIdx += 1) {
    const item = schedule.items[itemIdx];
    const fpAssessment = fpResult.assessments.find(
      (entry) => entry.obligationId === item.obligationId
    );
    if (fpAssessment === undefined) {
      throw new Error(
        `F_P evaluator returned no assessment for ${item.obligationId}`
      );
    }
    const dispatch = constructScheduledSlicePluginHandoff({
      manifest,
      zoomFrame,
      item,
      pluginRef: "plugin://t101-mini-dm-redux/fp-worker",
      attemptIndex: 0
    });
    events.push(
      constructScheduledSliceDispatchedEvent({ basis, zoomFrame, dispatch })
    );
    const evidenceRefs =
      fpAssessment.status === "fulfilled"
        ? Array.from(
            new Set([
              ...fpAssessment.evidenceRefs,
              `materialized://t101-mini-dm-redux/${edgeDef.name}`
            ])
          )
        : [...fpAssessment.evidenceRefs];
    const outputRefs =
      fpAssessment.status === "fulfilled" ? [allocation.assetRef] : [];
    const assessment = admitScheduledSliceAssessment({
      zoomFrame,
      schedule,
      assessmentId: `assessment://t101-mini-dm-redux/${edgeDef.name}/${item.obligationId}`,
      scheduleItemId: item.scheduleItemId,
      obligationId: item.obligationId,
      attemptIndex: 0,
      status: fpAssessment.status,
      assessmentRegime: "F_P",
      findingClass: fpAssessment.findingClass,
      evidenceRefs,
      outputRefs,
      runtimeFailureClass: null,
      detail: fpAssessment.detail
    });
    events.push(
      constructScheduledSliceAssessedEvent({ basis, zoomFrame, assessment })
    );
    assessments.push(assessment);
  }

  const foldback = deriveZoomFoldbackEvaluationFromEvents({
    basis,
    zoomFrame,
    schedule,
    events
  });
  events.push(
    constructZoomFoldbackEvaluatedEvent({ basis, zoomFrame, foldback })
  );
  const outer = deriveOuterTraversalEvaluation({ basis, zoomFrame, foldback });

  const emitted = [];
  emit(events, (event) => emitted.push(event));
  await appendEvents(layout, emitted);

  // Per-edge evidence under runtime/zoom_foldback/<edge>/.
  const edgeZoomDir = path.join(layout.zoomRoot, edgeDef.name);
  await writeJson(path.join(edgeZoomDir, "ledger.json"), ledger);
  await writeJson(path.join(edgeZoomDir, "schedule.json"), schedule);
  await writeJson(path.join(edgeZoomDir, "frame.json"), zoomFrame);
  await writeJson(path.join(edgeZoomDir, "foldback.json"), foldback);
  await writeJson(path.join(edgeZoomDir, "outer.json"), outer);
  await writeJson(path.join(edgeZoomDir, "manifest.json"), manifest);
  await writeJson(path.join(edgeZoomDir, "fd_envelope.json"), fdResult);
  await writeJson(path.join(edgeZoomDir, "fp_evaluation.json"), fpResult);
  for (const assessment of assessments) {
    await writeJsonl(
      path.join(edgeZoomDir, "assessments.jsonl"),
      assessment
    );
  }

  // Update state.
  state.edges[edgeDef.name] = {
    ranAt: new Date().toISOString(),
    workerMode: workerOutcome.mode,
    materializationPath: allocation.materializationUri,
    digest,
    foldbackDecision: foldback.decision,
    fulfilledCount: foldback.fulfilledCount,
    openCount: foldback.openCount,
    blockedCount: foldback.blockedCount,
    outerClosureAllowed: outer.closureAllowed,
    fdEnvelopeOk: fdResult.ok,
    obligationStatuses: assessments.map((entry) => ({
      obligationId: entry.obligationId,
      status: entry.status,
      findingClass: entry.findingClass
    }))
  };
  if (!state.edgeOrder.includes(edgeDef.name)) {
    state.edgeOrder.push(edgeDef.name);
  }
  await writeJson(layout.statePath, state);

  // Update top-level run manifest.
  await writeJson(layout.manifestPath, {
    runId: state.runId,
    createdAt: state.createdAt,
    workspaceRoot: layout.workspaceRoot,
    outputWorkspaceRoot: layout.outputWorkspaceRoot,
    edges: state.edgeOrder.map((name) => ({
      name,
      summary: state.edges[name]
    }))
  });

  return {
    edgeName: edgeDef.name,
    foldbackDecision: foldback.decision,
    fdEnvelopeOk: fdResult.ok,
    obligationStatuses: assessments.map((entry) => ({
      obligationId: entry.obligationId,
      status: entry.status,
      findingClass: entry.findingClass
    })),
    outerClosureAllowed: outer.closureAllowed,
    workerMode: workerOutcome.mode,
    eventCount: emitted.length
  };
}

async function showGaps(layout, state) {
  const lines = [];
  lines.push(`# Gaps inspection — ${state.runId}`);
  lines.push("");
  for (const edgeDef of EDGE_DEFS) {
    const summary = state.edges[edgeDef.name];
    if (summary === undefined) {
      lines.push(`- ${edgeDef.name}: NOT RUN`);
      continue;
    }
    lines.push(
      `- ${edgeDef.name}: foldback=${summary.foldbackDecision} fd_envelope=${
        summary.fdEnvelopeOk ? "ok" : "FAILED"
      } closure_allowed=${String(summary.outerClosureAllowed)}`
    );
    for (const ob of summary.obligationStatuses) {
      lines.push(
        `    - ${ob.obligationId}: status=${ob.status} finding=${
          ob.findingClass ?? "none"
        }`
      );
    }
  }
  const text = `${lines.join("\n")}\n`;
  await writeText(path.join(layout.workspaceRoot, "gaps.md"), text);
  process.stdout.write(text);
}

async function ensureWorkspaceInfra(layout) {
  await mkdir(layout.runtimeRoot, { recursive: true });
  await mkdir(layout.allocationsRoot, { recursive: true });
  await mkdir(layout.assetsRoot, { recursive: true });
  await mkdir(layout.zoomRoot, { recursive: true });
  await mkdir(layout.invocationLogsRoot, { recursive: true });
  await mkdir(path.dirname(layout.eventsLogPath), { recursive: true });
  await mkdir(path.join(layout.outputWorkspaceRoot, ".ai-workspace", "runtime"), {
    recursive: true
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.workspace === null) {
    process.stderr.write(
      "usage: run.mjs --edge <name>|--gaps|--full --workspace <dir>\n"
    );
    process.exit(2);
  }
  const workspaceRoot = path.resolve(args.workspace);
  const layout = workspaceLayout(workspaceRoot, {
    outputWorkspace:
      args.outputWorkspace === null ? undefined : path.resolve(args.outputWorkspace),
    outputWorkspaceRef: args.outputWorkspaceRef ?? undefined,
    outputWorkspaceAuthorityRef: args.outputWorkspaceAuthorityRef
  });
  await mkdir(workspaceRoot, { recursive: true });
  await ensureWorkspaceInfra(layout);
  const state = await loadOrInitState(layout);

  if (args.gaps) {
    await showGaps(layout, state);
    return;
  }

  const targetEdges = args.full
    ? EDGE_DEFS.map((entry) => entry.name)
    : args.edge === null
      ? []
      : [args.edge];
  if (targetEdges.length === 0) {
    process.stderr.write(
      "must pass --edge <name> or --full (or --gaps)\n"
    );
    process.exit(2);
  }

  const reports = [];
  for (const edgeName of targetEdges) {
    const report = await runEdge(edgeName, layout, state);
    reports.push(report);
    process.stdout.write(`${JSON.stringify(report)}\n`);
  }

  // Final per-run manifest summary.
  await writeJson(path.join(layout.workspaceRoot, "last_run_reports.json"), reports);
}

const invokedDirectly = (() => {
  if (process.argv.length < 2) {
    return false;
  }
  const entry = path.resolve(process.argv[1] ?? "");
  const here = fileURLToPath(import.meta.url);
  return entry === here;
})();

if (invokedDirectly) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    process.exit(1);
  });
}

export { runEdge, parseArgs, workspaceLayout, loadOrInitState };

// Re-export internal constants used by tests.
export { TENANT_TS_ROOT };
