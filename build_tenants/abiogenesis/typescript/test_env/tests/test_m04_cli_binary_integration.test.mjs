// Validates: REQ-P-POLICY-017
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  rewriteInstalledPackageImports,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

function runtimeBindingSource({
  withPlugins = false,
  withPluginFactory = false,
  withPolicyFactory = false
} = {}) {
  const includePluginSource = withPlugins || withPluginFactory;
  const pluginSource = includePluginSource
    ? `
    let factoryEventSink = null;
    let factoryWorkspaceRoot = null;
    let factoryTarget = null;

    const fpDispatchPlugin = Object.freeze({
      contract: constructEnginePluginContract({
        ref: "plugin://cli-binary/runtime-binding/fp-dispatch",
        pluginKind: "fp_dispatch",
        authority: "effect_plugin",
        inputCarrier: "EnginePluginInput",
        outputCarrier: "FpDispatchOutcome"
      }),
      dispatch: (input) => {
        if (factoryEventSink !== null) {
          factoryEventSink(constructRuntimeActivityProbeObservedEvent({
            basisId: input.basisId,
            graphFunctionId: input.graphFunctionId,
            runId: null,
            workKey: null,
            graphCallId: input.graphCallId,
            frameId: input.frameId,
            vectorIndex: input.vectorIndex,
            edge: input.edge,
            actorInvocationId: input.actorInvocationRef?.actorInvocationId ?? null,
            workerId: null,
            backendId: null,
            systemRef: "system://abiogenesis/cli/runtime-binding-plugin-factory",
            probeRef: \`probe://cli-binary/factory/\${encodeURIComponent(input.edge)}\`,
            probeSource: "runtime_event_append",
            activityRef: factoryTarget?.graphFunctionId ?? input.graphFunctionId,
            elapsedMs: 0,
            observedAtMs: 0,
            evidenceRefs: [factoryWorkspaceRoot ?? "workspace://unknown"],
            detail: "runtime binding factory supplied plugin set with ABG event sink",
            causationEventRefs: [input.sourceProjectionRef],
            correlationId: \`runtime-binding-plugin-factory:\${input.vectorIndex}\`
          }));
        }
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: \`result://cli-binary/\${encodeURIComponent(input.edge)}\`,
          attachedResultArtifact: {
            edge: input.expectedEdge ?? input.edge,
            actor: "codex",
            fulfillment_assessments: (
              input.expectedAssessmentIds.length > 0
                ? input.expectedAssessmentIds
                : ["runtime_fulfilled"]
            ).map((assessmentId) => ({
              id: assessmentId,
              evaluator: assessmentId,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "runtime binding plugin result accepted",
              blocking_reasons: [],
              evidence_refs: [\`proof://cli-binary/\${assessmentId}\`]
            })),
            selected_worker_id: input.workerId,
            selected_backend: input.backendId,
            role_id: "role://runtime",
            assignment_source: "policy_resolution",
            resolved_runtime_ref: input.resolvedRuntimeRef
          },
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
    });
    `
    : "";
  const pluginProperty = withPlugins
    ? `
      plugins: {
        fpDispatch: fpDispatchPlugin,
        fpEvaluator: defaultFpEvaluatorPlugin
      },
    `
    : withPluginFactory
      ? `
      createPlugins: ({ eventSink, workspaceRoot, target }) => {
        factoryEventSink = eventSink;
        factoryWorkspaceRoot = workspaceRoot;
        factoryTarget = target;
        return {
          fpDispatch: fpDispatchPlugin,
          fpEvaluator: defaultFpEvaluatorPlugin
        };
      },
      `
    : "";
  const policyProperty = withPolicyFactory
    ? `
      resolvePolicy: ({ target }) => admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: \`policy://cli-policy-factory/\${target.graphFunctionHandle}\`,
        defaultRegime: "F_P",
        dispatchRef: \`dispatch://cli-policy-factory/\${target.graphFunctionHandle}\`
      }),
    `
    : "";
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      constructEnginePluginContract,
      constructDefaultAbgFnCompositionDeclarations,
      constructFpDispatchOutcome,
      constructRuntimeActivityProbeObservedEvent,
      defaultFpEvaluatorPlugin,
      edge,
      graphFunctionForVector
    } from "@abiogenesis/typescript-tenant";

    function node(id, name, kind) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: \`Vector[\${kind}]\` },
        markov: ["declared"],
        assetSurface: {
          kind,
          requiredContexts: ["workspace"],
          standardsRefs: [\`\${kind}-standard\`],
          outputContractRefs: [\`\${kind}-contract\`]
        },
        tags: [kind]
      });
    }

    function profile(id, name, source, target, edgeName, evaluatorId) {
      const vector = edge([source], target, {
        id: \`graph-\${id}\`,
        name: edgeName,
        evaluators: [
          {
            name: evaluatorId,
            regime: "F_P",
            description: \`\${edgeName} accepted\`,
            binding: \`binding://\${id}\`,
            tags: ["fulfillment"]
          }
        ],
        declarations: constructDefaultAbgFnCompositionDeclarations({
          scopeRef: \`cli-binary/\${id}\`,
          hostGraphVectorRef: \`graph-\${id}\`
        })
      }).vectors[0];
      return graphFunctionForVector(vector, {
        id: \`graph-function-\${id}\`,
        name,
        declarations: { entries: [] }
      });
    }

    const design = node("node-cli-design", "Design", "design");
    const code = node("node-cli-code", "Code", "code");
    const codeProfile = profile(
      "code-flow",
      "code_flow",
      design,
      code,
      "design_to_code",
      "code_complete"
    );

    const module = admitModule({
      name: "cli_binary_runtime",
      graphs: [codeProfile.template.graph],
      graphFunctions: [codeProfile],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-code-flow",
          name: "code_flow_job",
          contracts: [{ kind: "graph_function", targetId: codeProfile.id }],
          roles: [],
          tags: ["semantic_work"]
        }
      ],
      roles: [],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      metadata: { entries: [] }
    });

    ${pluginSource}

    export const runtimeBinding = {
      module,
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://cli-binary",
        backendId: "backend://node",
        buildId: "build://typescript-cli-binary",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://cli-fp",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://cli-binary"
      }),
      ${policyProperty}
      ${pluginProperty}
      runId: "run://cli-binary",
      workKey: "wk://cli-binary",
      operatorAssetContract: {
        command: ["typescript-runtime-binding"],
        binding_source: "typescript_runtime_binding.operator_assets"
      },
      operatorAssets: {
        assets: [
          {
            asset_id: "code_surface",
            uri: "file://build/code",
            metadata: { relative_path: "build/code.ts" },
            checkpoint: { path_kind: "file", exists: true },
            operator_target: {
              kind: "graph_function",
              handle: "code_flow"
            }
          }
        ]
      }
    };
  `;
}

async function installCliRuntime() {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(targetRoot, runtimeBindingSource()),
    "utf8"
  );
  return { targetRoot, packageRoot };
}

function runCli(targetRoot, packageRoot, args) {
  return spawnSync(
    "node",
    [path.join(packageRoot, "build/semantic/code/src/bin/abiogenesis.js"), ...args],
    {
      cwd: targetRoot,
      encoding: "utf8"
    }
  );
}

function parsePayload(run) {
  assert.notEqual(run.stdout.trim(), "", run.stderr);
  return JSON.parse(run.stdout);
}

async function eventKinds(targetRoot) {
  const text = await readFile(
    path.join(targetRoot, ".ai-workspace", "events", "events.jsonl"),
    "utf8"
  );
  return text
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line).kind);
}

test("M04 CLI binary integration: installed package publishes TS binary aliases and graph_function target uses the shared suffix", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8")
  );
  assert.deepStrictEqual(packageJson.bin, {
    "abg.install": "./build/semantic/code/src/bin/abg.install.js",
    "abiogenesis-ts": "./build/semantic/code/src/bin/abiogenesis.js",
    "genesis-ts": "./build/semantic/code/src/bin/abiogenesis.js"
  });

  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "graph_function:code_flow",
    "--until",
    "first_traversal"
  ]);
  assert.equal(run.status, 2, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.command, "start");
  assert.equal(payload.status, "blocked");
  assert.equal(payload.target, "graph_function:code_flow");
  assert.equal(payload.resolved_target, "graph_function:code_flow");
  assert.equal(payload.asset_id, null);
  assert.equal(payload.edge, "design_to_code");
  assert.equal(payload.stopped_by, "dispatch_required");
  assert.equal(payload.control_outcome.stopDetail.dispatchRef, "dispatch://cli-binary");
  assert.deepStrictEqual(payload.event_kinds, [
    "lever_resolution_admitted",
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fp_dispatch_requested",
    "actor_invocation_started",
    "payload_observed",
    "payload_validated",
    "actor_invocation_closed"
  ]);
  assert.deepStrictEqual(await eventKinds(targetRoot), payload.event_kinds);
});

test("M04 CLI binary integration: target next lowers through exactly one published semantic job", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "next",
    "--until",
    "first_traversal"
  ]);
  assert.equal(run.status, 2, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.status, "blocked");
  assert.equal(payload.target, "next");
  assert.equal(payload.resolved_target, "graph_function:code_flow");
  assert.equal(payload.edge, "design_to_code");
  assert.equal(payload.stopped_by, "dispatch_required");
});

test("M04 CLI binary integration: asset target resolves through the runtime operator asset registry", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "asset:code_surface",
    "--until",
    "first_traversal"
  ]);
  assert.equal(run.status, 2, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.status, "blocked");
  assert.equal(payload.target, "asset:code_surface");
  assert.equal(payload.resolved_target, "graph_function:code_flow");
  assert.equal(payload.asset_id, "code_surface");
  assert.equal(payload.edge, "design_to_code");
  assert.equal(payload.stopped_by, "dispatch_required");
});

test("M04 CLI binary integration: runtime binding plugins execute through ABG CLI command/control", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(
      targetRoot,
      runtimeBindingSource({ withPlugins: true })
    ),
    "utf8"
  );

  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "graph_function:code_flow",
    "--until",
    "converged"
  ]);
  assert.equal(run.status, 0, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.command, "start");
  assert.equal(payload.status, "converged");
  assert.equal(payload.stopped_by, "converged");
  assert.equal(payload.control_outcome.kind, "converged");
  assert.equal(
    payload.event_kinds.includes("actor_result_artifact_observed"),
    true
  );
  assert.equal(payload.event_kinds.includes("vector_closed"), true);
  assert.deepStrictEqual(await eventKinds(targetRoot), payload.event_kinds);
});

test("M04 CLI binary integration: runtime binding plugin factory receives ABG event sink", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(
      targetRoot,
      runtimeBindingSource({ withPluginFactory: true })
    ),
    "utf8"
  );

  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "graph_function:code_flow",
    "--until",
    "converged"
  ]);
  assert.equal(run.status, 0, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.command, "start");
  assert.equal(payload.status, "converged");
  assert.equal(
    payload.event_kinds.includes("runtime_activity_probe_observed"),
    true
  );
  assert.equal(
    payload.event_kinds.includes("actor_result_artifact_observed"),
    true
  );
  assert.deepStrictEqual(await eventKinds(targetRoot), payload.event_kinds);
});

test("M04 CLI binary integration: runtime binding policy factory selects target policy", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(
      targetRoot,
      runtimeBindingSource({ withPolicyFactory: true })
    ),
    "utf8"
  );

  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "graph_function:code_flow",
    "--until",
    "first_traversal"
  ]);
  assert.equal(run.status, 2, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.command, "start");
  assert.equal(payload.status, "blocked");
  assert.equal(payload.resolved_target, "graph_function:code_flow");
  assert.equal(
    payload.control_outcome.stopDetail.dispatchRef,
    "dispatch://cli-policy-factory/code_flow"
  );
  assert.equal(payload.stopped_by, "dispatch_required");
});

test("M04 CLI binary integration: assess-result uses the shared workspace/result suffix and appends assessed event truth", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  const generator = await runInstalledNodeScript(
    targetRoot,
    `
      import { mkdir, writeFile } from "node:fs/promises";
      import {
        admitExecutionBasis,
        admitPublicStartRequest,
        deriveAdvancementTransition,
        dispatchRequestsForTransition
      } from "@abiogenesis/typescript-tenant";
      import { runtimeBinding } from "./typescript-runtime.mjs";

      const startInput = {
        scope: {
          kind: "workspace",
          workspaceRoot: process.cwd(),
          moduleName: runtimeBinding.module.name
        },
        target: {
          kind: "graph_function",
          handle: "code_flow"
        },
        until: "first_traversal"
      };
      const startRequest = admitPublicStartRequest(startInput);
      const basis = admitExecutionBasis({
        startIntent: startRequest.startIntent,
        module: runtimeBinding.module,
        runtimeIdentity: runtimeBinding.runtimeIdentity,
        resolvedPolicy: runtimeBinding.resolvedPolicy,
        runId: runtimeBinding.runId,
        workKey: runtimeBinding.workKey,
        frameId: null,
        frameLineageId: null
      });
      const dispatchRequest = dispatchRequestsForTransition(
        deriveAdvancementTransition(basis)
      )[0];
      const resultPath = ".ai-workspace/fp_results/cli-result.json";
      const assessmentRequest = {
        kind: "fp_assessed",
        dispatch_request: dispatchRequest,
        result_artifact: {
          edge: dispatchRequest.expectedEdge,
          actor: "cli_binary_test",
          fulfillment_assessments: dispatchRequest.expectedAssessmentIds.map(
            (id) => ({
              id,
              evaluator: id,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "CLI binary accepted",
              blocking_reasons: [],
              evidence_refs: ["proof://cli-binary"]
            })
          ),
          selected_worker_id: dispatchRequest.workerId,
          selected_backend: dispatchRequest.backendId,
          role_id: "role://cli-binary",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        manifest_provenance: {
          spec_hash: "spec://typescript-cli",
          manifest_id: "manifest://cli-binary",
          workflow_version: "wf://typescript-cli",
          run_id: runtimeBinding.runId,
          work_key: runtimeBinding.workKey,
          authority_ref: "authority://cli-binary",
          selected_worker_id: dispatchRequest.workerId,
          selected_backend: dispatchRequest.backendId,
          role_id: "role://cli-binary",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        published_ledger_ref: {
          ref: "ledger://cli-binary"
        }
      };
      await mkdir(".ai-workspace/fp_results", { recursive: true });
      await writeFile(resultPath, JSON.stringify(assessmentRequest), "utf8");
      console.log(JSON.stringify({ resultPath }));
    `
  );
  assert.equal(generator.status, 0, generator.stderr);
  const { resultPath } = JSON.parse(generator.stdout);

  const run = runCli(targetRoot, packageRoot, [
    "assess-result",
    "--workspace",
    ".",
    "--result",
    resultPath
  ]);
  assert.equal(run.status, 0, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.command, "assess-result");
  assert.equal(payload.status, "accepted");
  assert.deepStrictEqual(payload.event_kinds, [
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "assessed"
  ]);
  assert.deepStrictEqual(await eventKinds(targetRoot), payload.event_kinds);
});

test("M04 CLI binary integration: gaps preserves the shared suffix and returns replay-derived projection truth", async () => {
  const { targetRoot, packageRoot } = await installCliRuntime();
  const run = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(run.status, 0, run.stderr);
  const payload = parsePayload(run);

  assert.equal(payload.command, "gaps");
  assert.equal(payload.status, "blocked");
  assert.equal(payload.jobs_considered, 1);
  assert.equal(payload.total_delta, 1);
  assert.equal(payload.open_frames, 0);
  assert.equal(payload.converged, false);
  assert.equal(payload.gaps[0].edge, "design_to_code");
  assert.equal(payload.gaps[0].status, "dispatch_required");
  assert.equal(payload.gaps[0].next_step, "start");
  assert.deepStrictEqual(payload.gaps[0].failing, ["code_complete"]);
});
