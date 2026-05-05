// Validates: REQ-R-ABG3-TRANSPORT-010
// Validates: REQ-R-ABG3-TRANSPORT-012
// Validates: REQ-R-ABG3-TRANSPORT-014
// Validates: T-087

import test from "node:test";
import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  realpath,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "../tests/support/m05-installed-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t087_supervised_actor_invocation_live"
);
const INSTALLED_ARTIFACT_RELATIVE_ROOT = path.join(
  ".abiogenesis",
  "test-runs",
  "t087-supervised-actor-live"
);

function liveEnabled() {
  return process.env["ABG_TS_T087_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "codex";
}

function assertNonEmptyString(value, label) {
  assert.equal(typeof value, "string", `${label} must be a string`);
  assert.equal(value.length > 0, true, `${label} must be non-empty`);
}

function assertActorRuntimeScope(value, label) {
  assertNonEmptyString(value.basisId, `${label}.basisId`);
  assertNonEmptyString(value.graphFunctionId, `${label}.graphFunctionId`);
  assert.equal(
    value.runId === null || typeof value.runId === "string",
    true,
    `${label}.runId must be null or string`
  );
  assert.equal(
    value.workKey === null || typeof value.workKey === "string",
    true,
    `${label}.workKey must be null or string`
  );
  assertNonEmptyString(value.graphCallId, `${label}.graphCallId`);
  assertNonEmptyString(value.frameId, `${label}.frameId`);
  assert.equal(Number.isInteger(value.vectorIndex), true);
  assertNonEmptyString(value.edge, `${label}.edge`);
  assertNonEmptyString(value.actorInvocationId, `${label}.actorInvocationId`);
  assertNonEmptyString(value.workerId, `${label}.workerId`);
  assertNonEmptyString(value.backendId, `${label}.backendId`);
  assert.equal(Array.isArray(value.causationEventRefs), true);
  assertNonEmptyString(value.correlationId, `${label}.correlationId`);
}

function assertProjectedScopeMatchesEvent(projectionRef, event, label) {
  assert.equal(projectionRef.graphFunctionId, event.graphFunctionId);
  assert.equal(projectionRef.graphCallId, event.graphCallId);
  assert.equal(projectionRef.frameId, event.frameId);
  assert.equal(projectionRef.edge, event.edge);
  assert.equal(projectionRef.runId, event.runId);
  assert.equal(projectionRef.workKey, event.workKey);
  assert.equal(projectionRef.workerId, event.workerId);
  assert.equal(projectionRef.backendId, event.backendId);
  assert.deepStrictEqual(
    projectionRef.causationEventRefs,
    event.causationEventRefs,
    `${label}.causationEventRefs`
  );
  assert.equal(projectionRef.correlationId, event.correlationId);
}

function selectedExecutorProfile() {
  const raw = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"];
  if (raw === undefined || raw.trim().length === 0) {
    return undefined;
  }
  const normalized = raw.trim();
  if (normalized === "local-spawn" || normalized === "pty-terminal") {
    return normalized;
  }
  throw new Error(
    `unsupported ABG_TS_AGENT_EXECUTOR_PROFILE=${raw}; expected local-spawn or pty-terminal`
  );
}

function timestamp() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listRelativeFiles(root) {
  if (!(await pathExists(root))) {
    return [];
  }
  const discovered = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(root, absolutePath);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }
      const stats = await stat(absolutePath);
      discovered.push({
        relativePath,
        sizeBytes: stats.size
      });
    }
  }
  return discovered.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath)
  );
}

function liveSandboxSource(agentKey, executorProfile) {
  return `
    import {
      existsSync,
      mkdirSync,
      readFileSync,
      readdirSync,
      statSync,
      writeFileSync
    } from "node:fs";
    import path from "node:path";
    import { fileURLToPath } from "node:url";
    import {
      admitExecutionBasis,
      admitModule,
      admitNode,
      admitPublicStartRequest,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      constructEnginePluginContract,
      constructFpDispatchOutcome,
      deriveRuntimeAggregateProjection,
      deriveAdvancementTransition,
      dispatchRequestsForTransition,
      edge,
      graphFunctionForVector,
      publicStartAsync,
      runAgentTransport
    } from "@abiogenesis/typescript-tenant";

    const READY_TOKEN = "ABG_TS_T087_READY";
    const agentKey = ${JSON.stringify(agentKey)};
    const executorProfile = ${JSON.stringify(executorProfile)};
    const packageEntryPath = fileURLToPath(
      import.meta.resolve("@abiogenesis/typescript-tenant")
    );
    const sandboxRoot = process.cwd();
    const artifactRoot = path.join(
      sandboxRoot,
      ".abiogenesis",
      "test-runs",
      "t087-supervised-actor-live"
    );
    const packageRootMarker = "/build/semantic/";
    const packageRootIndex = packageEntryPath.indexOf(packageRootMarker);
    const packageRoot = packageRootIndex === -1
      ? path.dirname(packageEntryPath)
      : packageEntryPath.slice(0, packageRootIndex);
    const installerManifestPath = path.join(
      sandboxRoot,
      ".abiogenesis",
      "typescript-installer-manifest.json"
    );
    mkdirSync(artifactRoot, { recursive: true });

    function listRelativeFiles(root) {
      if (!existsSync(root)) {
        return [];
      }
      const discovered = [];
      const stack = [root];
      while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of readdirSync(current, { withFileTypes: true })) {
          const absolutePath = path.join(current, entry.name);
          const relativePath = path.relative(root, absolutePath);
          if (entry.isDirectory()) {
            stack.push(absolutePath);
            continue;
          }
          const stats = statSync(absolutePath);
          discovered.push({
            relativePath,
            sizeBytes: stats.size
          });
        }
      }
      return discovered.sort((left, right) =>
        left.relativePath.localeCompare(right.relativePath)
      );
    }

    function readJsonIfPresent(targetPath) {
      if (!existsSync(targetPath)) {
        return null;
      }
      return JSON.parse(readFileSync(targetPath, "utf8"));
    }

    function buildAssetIndex() {
      return {
        sandboxRoot,
        artifactRoot,
        packageRoot,
        packageEntryPath,
        installerManifestPath,
        installerManifest: readJsonIfPresent(installerManifestPath),
        liveArtifactFiles: listRelativeFiles(artifactRoot),
        sandboxAbiogenesisFiles: listRelativeFiles(path.join(sandboxRoot, ".abiogenesis")),
        installedPackageFiles: listRelativeFiles(packageRoot)
      };
    }

    function assetIndexSummary(assetIndex) {
      return {
        liveArtifactFileCount: assetIndex.liveArtifactFiles.length,
        sandboxAbiogenesisFileCount: assetIndex.sandboxAbiogenesisFiles.length,
        installedPackageFileCount: assetIndex.installedPackageFiles.length,
        liveArtifactFiles: assetIndex.liveArtifactFiles.map((file) => file.relativePath)
      };
    }

    function extractJsonObject(text) {
      const trimmed = text.trim();
      const fenced = trimmed.match(/\\\`\\\`\\\`(?:json)?\\s*([\\s\\S]*?)\\s*\\\`\\\`\\\`/i);
      const candidate = fenced === null ? trimmed : fenced[1].trim();
      try {
        return JSON.parse(candidate);
      } catch {
        const first = candidate.indexOf("{");
        const last = candidate.lastIndexOf("}");
        if (first === -1 || last === -1 || last <= first) {
          throw new TypeError("transport response did not contain a JSON object");
        }
        return JSON.parse(candidate.slice(first, last + 1));
      }
    }

    function node(id, name, kind) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: "Vector[" + kind + "]" },
        markov: ["declared"],
        assetSurface: {
          kind,
          requiredContexts: ["workspace"],
          standardsRefs: [kind + "-standard"],
          outputContractRefs: [kind + "-contract"]
        },
        tags: [kind, "t087"]
      });
    }

    const source = node("node-t087-live-source", "LiveSource", "live_source");
    const target = node("node-t087-live-result", "LiveResult", "live_result");
    const vector = edge([source], target, {
      id: "graph-t087-live",
      name: "live_source→live_result",
      evaluators: [
        {
          name: "live_actor_result_complete",
          regime: "F_P",
          description: "live actor result accepted",
          binding: "binding://t087/live-actor",
          tags: ["fulfillment", "t087"]
        }
      ],
      declarations: { entries: [] },
      tags: ["live", "t087"]
    }).vectors[0];
    const graphFunction = graphFunctionForVector(vector, {
      name: "t087_live_actor_single_edge",
      declarations: { entries: [] },
      tags: ["live", "t087"]
    });
    const module = admitModule({
      name: "t087_supervised_actor_live_module",
      graphs: [graphFunction.template.graph],
      graphFunctions: [graphFunction],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-t087-supervised-actor-live",
          name: "t087_supervised_actor_live_job",
          contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
          roles: [],
          tags: ["semantic_work", "live", "t087"]
        }
      ],
      roles: [],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      metadata: { entries: [] }
    });
    const runtimeIdentity = admitResolvedRuntimeIdentity({
      workerId: "worker://t087-live-" + agentKey,
      backendId: "backend://" + agentKey,
      buildId: "build://typescript-t087-live",
      resolvedRuntimeRef: "runtime://typescript/t087-live"
    });
    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t087/supervised-actor-live",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://" + agentKey
    });
    const startInput = {
      scope: {
        kind: "workspace",
        workspaceRoot: sandboxRoot,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    };
    const basis = admitExecutionBasis({
      startIntent: admitPublicStartRequest(startInput).startIntent,
      module,
      runtimeIdentity,
      resolvedPolicy,
      runId: "run://t087-supervised-actor-live",
      workKey: "wk://t087-supervised-actor-live",
      frameId: null,
      frameLineageId: null
    });
    const dispatchRequest = dispatchRequestsForTransition(
      deriveAdvancementTransition(basis)
    )[0];

    async function runTransport(request, prompt, label) {
      return await runAgentTransport({
        contract: request.transportContract,
        prompt,
        cwd: sandboxRoot,
        archiveRoot: artifactRoot,
        label,
        workerRef: request.workerId,
        timeoutMs: Number.parseInt(process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "600000", 10),
        ...(executorProfile === undefined ? {} : { executorProfile }),
        outputPath: path.join(artifactRoot, label + "-output.txt")
      });
    }

    const readiness = await runTransport(
      dispatchRequest,
      "Return exactly this token and nothing else: " + READY_TOKEN,
      "readiness"
    );
    if (readiness.status !== 0 || !readiness.text.includes(READY_TOKEN)) {
      const readinessAssetIndex = buildAssetIndex();
      writeFileSync(
        path.join(artifactRoot, "asset_index.json"),
        JSON.stringify(readinessAssetIndex, null, 2),
        "utf8"
      );
      console.log(JSON.stringify({
        status: "backend_not_ready",
        agentKey,
        packageEntryPath,
        artifactRoot,
        packageRoot,
        assetIndexSummary: assetIndexSummary(readinessAssetIndex),
        readiness
      }));
      process.exit(0);
    }

    function resultPrompt(request, invocationRef) {
      return [
        "Return only a JSON object. Do not include markdown or commentary.",
        "You are satisfying a live Abiogenesis T-087 supervised actor invocation proof.",
        "This call happens inside the ABG F_P plugin while ABG owns actor invocation event truth.",
        "Expected edge: " + request.expectedEdge,
        "Required fulfillment assessment id: " + request.expectedAssessmentIds[0],
        "Actor invocation id: " + invocationRef.actorInvocationId,
        "{",
        "  \\"edge\\": " + JSON.stringify(request.expectedEdge) + ",",
        "  \\"actor\\": " + JSON.stringify(agentKey) + ",",
        "  \\"fulfillment_assessments\\": [",
        "    {",
        "      \\"id\\": " + JSON.stringify(request.expectedAssessmentIds[0]) + ",",
        "      \\"evaluator\\": " + JSON.stringify(request.expectedAssessmentIds[0]) + ",",
        "      \\"fulfillment_status\\": \\"fulfilled\\",",
        "      \\"fulfillment_detail\\": \\"live actor invocation produced a valid ABG result artifact\\",",
        "      \\"blocking_reasons\\": [],",
        "      \\"evidence_refs\\": [\\"live://t087/supervised-actor\\" ]",
        "    }",
        "  ],",
        "  \\"selected_worker_id\\": " + JSON.stringify(request.workerId) + ",",
        "  \\"selected_backend\\": " + JSON.stringify(request.backendId) + ",",
        "  \\"role_id\\": \\"role://t087-live\\",",
        "  \\"assignment_source\\": \\"policy_resolution\\",",
        "  \\"resolved_runtime_ref\\": \\"runtime://typescript/t087-live\\"",
        "}"
      ].join("\\n");
    }

    const events = [];
    const pluginInputs = [];
    const fpDispatch = Object.freeze({
      contract: constructEnginePluginContract({
        ref: "plugin://t087/live-supervised-actor",
        pluginKind: "fp_dispatch",
        authority: "effect_plugin",
        inputCarrier: "EnginePluginInput",
        outputCarrier: "FpDispatchOutcome"
      }),
      dispatch: async (input) => {
        if (input.actorInvocationRef === null) {
          throw new Error("missing ABG actor invocation ref");
        }
        pluginInputs.push({
          edge: input.edge,
          actorInvocationRef: input.actorInvocationRef,
          sourceProjectionRef: input.sourceProjectionRef
        });
        const transport = await runTransport(
          dispatchRequest,
          resultPrompt(dispatchRequest, input.actorInvocationRef),
          "live-result"
        );
        if (transport.status !== 0) {
          return constructFpDispatchOutcome({
            status: "blocked",
            reason: "live transport failed",
            resultRef: input.actorInvocationRef.resultRef,
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
        const rawArtifact = extractJsonObject(transport.text);
        writeFileSync(
          path.join(artifactRoot, "result_artifact.json"),
          JSON.stringify(rawArtifact, null, 2),
          "utf8"
        );
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: input.actorInvocationRef.resultRef,
          attachedResultArtifact: rawArtifact,
          evidenceRefs: [input.sourceProjectionRef, "live://t087/supervised-actor"]
        });
      }
    });

    const outcome = await publicStartAsync(
      startInput,
      {
        module,
        runtimeIdentity,
        resolvedPolicy,
        runId: "run://t087-supervised-actor-live",
        workKey: "wk://t087-supervised-actor-live"
      },
      (event) => events.push(event),
      { fpDispatch }
    );
    const projection = deriveRuntimeAggregateProjection(basis, events);
    const actorLedger = {
      actorInvocationRefs: projection.actorInvocationRefs,
      observedActorArtifactRefs: projection.observedActorArtifactRefs,
      actorEvents: events.filter((event) => event.kind.startsWith("actor_"))
    };
    writeFileSync(
      path.join(artifactRoot, "event_log.json"),
      JSON.stringify(events, null, 2),
      "utf8"
    );
    writeFileSync(
      path.join(artifactRoot, "runtime_projection.json"),
      JSON.stringify(projection, null, 2),
      "utf8"
    );
    writeFileSync(
      path.join(artifactRoot, "dispatch_request.json"),
      JSON.stringify(dispatchRequest, null, 2),
      "utf8"
    );
    writeFileSync(
      path.join(artifactRoot, "actor_ledger.json"),
      JSON.stringify(actorLedger, null, 2),
      "utf8"
    );
    writeFileSync(
      path.join(artifactRoot, "plugin_inputs.json"),
      JSON.stringify(pluginInputs, null, 2),
      "utf8"
    );
    writeFileSync(
      path.join(artifactRoot, "outcome.json"),
      JSON.stringify(outcome, null, 2),
      "utf8"
    );
    const provisionalAssetIndex = buildAssetIndex();
    writeFileSync(
      path.join(artifactRoot, "asset_index.json"),
      JSON.stringify(provisionalAssetIndex, null, 2),
      "utf8"
    );
    const assetIndex = buildAssetIndex();
    writeFileSync(
      path.join(artifactRoot, "asset_index.json"),
      JSON.stringify(assetIndex, null, 2),
      "utf8"
    );
    const payload = {
      status: "completed",
      agentKey,
      packageEntryPath,
      artifactRoot,
      packageRoot,
      outcome,
      dispatchRequest,
      eventKinds: events.map((event) => event.kind),
      actorEvents: events.filter((event) => event.kind.startsWith("actor_")),
      actorLedger,
      projectionSummary: {
        vectorCount: projection.vectorCount,
        plannedVectorIndexes: projection.plannedVectorIndexes,
        evaluatedVectorIndexes: projection.evaluatedVectorIndexes,
        closedVectorIndexes: projection.closedVectorIndexes,
        assessedEdges: projection.assessedEdges,
        actorInvocationRefs: projection.actorInvocationRefs,
        observedActorArtifactRefs: projection.observedActorArtifactRefs,
        nextVectorIndex: projection.nextVectorIndex
      },
      assetIndexSummary: assetIndexSummary(assetIndex),
      assessedEdges: events
        .filter((event) => event.kind === "assessed")
        .map((event) => event.edge),
      closedEdges: events
        .filter((event) => event.kind === "vector_closed")
        .map((event) => event.edge),
      pluginInputs
    };
    writeFileSync(
      path.join(artifactRoot, "payload.json"),
      JSON.stringify(payload, null, 2),
      "utf8"
    );
    console.log(JSON.stringify(payload));
  `;
}

async function writeArchive(input) {
  const archiveRoot = path.join(TEST_RUNS_ROOT, timestamp());
  await mkdir(archiveRoot, { recursive: true });
  const installedArtifactArchiveRoot = path.join(
    archiveRoot,
    "installed-live-artifacts"
  );
  if (await pathExists(input.payload.artifactRoot)) {
    await cp(input.payload.artifactRoot, installedArtifactArchiveRoot, {
      recursive: true
    });
  } else {
    await mkdir(installedArtifactArchiveRoot, { recursive: true });
  }
  await writeFile(
    path.join(archiveRoot, "payload.json"),
    JSON.stringify(input.payload, null, 2),
    "utf8"
  );
  await writeFile(
    path.join(archiveRoot, "postmortem.md"),
    [
      "# T-087 Supervised Actor Invocation Live Postmortem",
      "",
      `- target root: ${input.targetRoot}`,
      `- installed package root: ${input.packageRoot}`,
      `- package entry: ${input.payload.packageEntryPath}`,
      `- installed live artifact archive: ${installedArtifactArchiveRoot}`,
      `- status: ${input.payload.status}`,
      `- installed script status: ${input.payload.installedScriptStatus ?? "not_applicable"}`,
      `- event count: ${input.payload.eventKinds?.length ?? 0}`,
      `- actor event count: ${input.payload.actorEvents?.length ?? 0}`,
      `- live artifact files: ${input.payload.assetIndexSummary?.liveArtifactFileCount ?? 0}`,
      `- sandbox .abiogenesis files: ${input.payload.assetIndexSummary?.sandboxAbiogenesisFileCount ?? 0}`,
      `- installed package files: ${input.payload.assetIndexSummary?.installedPackageFileCount ?? 0}`,
      "",
      "## Event Kinds",
      "",
      (input.payload.eventKinds ?? []).map((kind) => `- ${kind}`).join("\n"),
      "",
      "## Archived Evidence",
      "",
      "- `installed-live-artifacts/event_log.json`",
      "- `installed-live-artifacts/runtime_projection.json`",
      "- `installed-live-artifacts/dispatch_request.json`",
      "- `installed-live-artifacts/actor_ledger.json`",
      "- `installed-live-artifacts/plugin_inputs.json`",
      "- `installed-live-artifacts/result_artifact.json`",
      "- `installed-live-artifacts/asset_index.json`",
      "- `installed-live-artifacts/readiness-transport.json`",
      "- `installed-live-artifacts/live-result-transport.json`",
      ""
    ].join("\n"),
    "utf8"
  );
  return {
    archiveRoot,
    installedArtifactArchiveRoot
  };
}

test("T-087 live: real agent transport runs inside one ABG supervised actor invocation", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T087_LIVE=1 or CODEX_LIVE_FP=1 to run T-087 live proof");
    return;
  }

  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  const artifactRoot = path.join(targetRoot, INSTALLED_ARTIFACT_RELATIVE_ROOT);
  const run = await runInstalledNodeScript(
    targetRoot,
    liveSandboxSource(liveAgentKey(), selectedExecutorProfile())
  );

  if (run.status !== 0) {
    const failurePayload = {
      status: "installed_script_failed",
      installedScriptStatus: run.status,
      installedScriptSignal: run.signal,
      targetRoot,
      packageRoot,
      artifactRoot,
      stdout: run.stdout,
      stderr: run.stderr,
      eventKinds: [],
      actorEvents: [],
      assetIndexSummary: {
        liveArtifactFileCount: (await listRelativeFiles(artifactRoot)).length,
        sandboxAbiogenesisFileCount: (
          await listRelativeFiles(path.join(targetRoot, ".abiogenesis"))
        ).length,
        installedPackageFileCount: (await listRelativeFiles(packageRoot)).length,
        liveArtifactFiles: (await listRelativeFiles(artifactRoot)).map(
          (file) => file.relativePath
        )
      }
    };
    const { archiveRoot } = await writeArchive({
      payload: failurePayload,
      targetRoot,
      packageRoot
    });
    assert.equal(run.status, 0, `${run.stderr}\narchive: ${archiveRoot}`);
  }
  const payload = JSON.parse(run.stdout);
  const { archiveRoot, installedArtifactArchiveRoot } = await writeArchive({
    payload,
    targetRoot,
    packageRoot
  });
  const realPackageRoot = await realpath(packageRoot);

  if (payload.status === "backend_not_ready") {
    t.skip(`configured live backend is not ready; archive: ${archiveRoot}`);
    return;
  }

  assert.equal(payload.packageEntryPath.startsWith(realPackageRoot), true);
  assert.equal(payload.status, "completed");
  assert.equal(payload.outcome.kind, "converged");
  assert.equal(payload.outcome.terminalKind, "converged");
  assert.deepStrictEqual(payload.eventKinds, [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fp_dispatch_requested",
    "actor_invocation_started",
    "actor_result_artifact_observed",
    "actor_invocation_closed",
    "vector_evaluated",
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "vector_closed",
    "terminal_reached"
  ]);
  assert.equal(payload.actorEvents.length, 3);
  assert.deepStrictEqual(payload.projectionSummary.plannedVectorIndexes, [0]);
  assert.deepStrictEqual(payload.projectionSummary.evaluatedVectorIndexes, [0]);
  assert.deepStrictEqual(payload.projectionSummary.closedVectorIndexes, [0]);
  assert.deepStrictEqual(payload.projectionSummary.assessedEdges, []);
  assert.equal(payload.projectionSummary.nextVectorIndex, null);
  assert.equal(payload.projectionSummary.actorInvocationRefs.length, 1);
  assert.equal(payload.projectionSummary.observedActorArtifactRefs.length, 1);
  const actorStarted = payload.actorEvents[0];
  const actorArtifactObserved = payload.actorEvents[1];
  const actorClosed = payload.actorEvents[2];
  assertActorRuntimeScope(actorStarted, "actorStarted");
  assertActorRuntimeScope(actorArtifactObserved, "actorArtifactObserved");
  assertActorRuntimeScope(actorClosed, "actorClosed");
  assertProjectedScopeMatchesEvent(
    payload.projectionSummary.actorInvocationRefs[0],
    actorStarted,
    "actorInvocationRefs[0]"
  );
  assertProjectedScopeMatchesEvent(
    payload.projectionSummary.observedActorArtifactRefs[0],
    actorArtifactObserved,
    "observedActorArtifactRefs[0]"
  );
  assert.equal(payload.pluginInputs.length, 1);
  assert.equal(
    payload.pluginInputs[0].actorInvocationRef.actorInvocationId,
    payload.actorEvents[0].actorInvocationId
  );
  assert.equal(
    payload.projectionSummary.actorInvocationRefs[0].actorInvocationId,
    payload.actorEvents[0].actorInvocationId
  );
  assert.equal(
    payload.projectionSummary.observedActorArtifactRefs[0].actorInvocationId,
    payload.actorEvents[0].actorInvocationId
  );
  assert.deepStrictEqual(payload.assessedEdges, []);
  assert.deepStrictEqual(payload.closedEdges, ["live_source→live_result"]);
  assert.equal(
    payload.assetIndexSummary.liveArtifactFiles.includes("event_log.json"),
    true
  );
  assert.equal(
    payload.assetIndexSummary.liveArtifactFiles.includes("runtime_projection.json"),
    true
  );
  assert.equal(
    payload.assetIndexSummary.liveArtifactFiles.includes("asset_index.json"),
    true
  );
  const archivedEventLog = JSON.parse(
    await readFile(
      path.join(installedArtifactArchiveRoot, "event_log.json"),
      "utf8"
    )
  );
  const archivedProjection = JSON.parse(
    await readFile(
      path.join(installedArtifactArchiveRoot, "runtime_projection.json"),
      "utf8"
    )
  );
  const archivedAssetIndex = JSON.parse(
    await readFile(
      path.join(installedArtifactArchiveRoot, "asset_index.json"),
      "utf8"
    )
  );
  assert.deepStrictEqual(
    archivedEventLog.map((event) => event.kind),
    payload.eventKinds
  );
  assert.deepStrictEqual(
    archivedProjection.actorInvocationRefs,
    payload.projectionSummary.actorInvocationRefs
  );
  assert.equal(
    archivedAssetIndex.liveArtifactFiles.some(
      (file) => file.relativePath === "result_artifact.json"
    ),
    true
  );
  assert.equal(archiveRoot.startsWith(TEST_RUNS_ROOT), true);
});
