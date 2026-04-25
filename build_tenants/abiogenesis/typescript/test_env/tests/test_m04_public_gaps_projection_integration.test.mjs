// Validates: REQ-P-POLICY-008
// Validates: REQ-P-POLICY-016
// Validates: REQ-P-POLICY-017

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { publicGaps } from "../../build/semantic/code/src/app/m04/index.js";
import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

function twoStageRuntimeBindingSource() {
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      compose,
      edge,
      graphFunctionForVector,
      materializeGraphFunction
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

    function stage(id, name, source, target, edgeName, evaluatorId) {
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
        declarations: { entries: [] }
      }).vectors[0];
      return graphFunctionForVector(vector, {
        id: \`graph-function-\${id}\`,
        name,
        declarations: { entries: [] }
      });
    }

    const inputSet = node("node-gaps-input", "Input", "input_set");
    const design = node("node-gaps-design", "Design", "design");
    const code = node("node-gaps-code", "Code", "code");
    const captureDesign = stage(
      "capture-design",
      "capture_design",
      inputSet,
      design,
      "input_to_design",
      "design_complete"
    );
    const implementCode = stage(
      "implement-code",
      "implement_code",
      design,
      code,
      "design_to_code",
      "code_complete"
    );
    const executive = compose(captureDesign, implementCode);
    const executiveGraph = materializeGraphFunction(executive);

    export const runtimeBinding = {
      module: admitModule({
        name: "gaps_projection_runtime",
        graphs: [executiveGraph],
        graphFunctions: [executive],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-gaps-executive",
            name: "gaps_executive_job",
            contracts: [{ kind: "graph_function", targetId: executive.id }],
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
      }),
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://gaps-projection",
        backendId: "backend://node",
        buildId: "build://typescript-gaps-projection",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://gaps-fp",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://gaps-projection"
      }),
      runId: "run://gaps-projection",
      workKey: "wk://gaps-projection"
    };
  `;
}

function closeVectorScript(vectorIndex) {
  return `
    import { appendFile, mkdir } from "node:fs/promises";
    import {
      admitExecutionBasis,
      admitPublicStartRequest,
      constructVectorClosedEvent,
      constructVectorEvaluatedEvent
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
        handle: runtimeBinding.module.graphFunctions[0].id
      },
      until: "converged"
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
    const events = [
      constructVectorEvaluatedEvent({
        basis,
        vectorIndex: ${vectorIndex},
        status: "accepted"
      }),
      constructVectorClosedEvent({
        basis,
        vectorIndex: ${vectorIndex},
        closureKind: "assessed"
      })
    ];
    await mkdir(".ai-workspace/events", { recursive: true });
    await appendFile(
      ".ai-workspace/events/events.jsonl",
      events.map((event) => JSON.stringify(event)).join("\\n") + "\\n",
      "utf8"
    );
    console.log(JSON.stringify({ appended: events.map((event) => event.kind) }));
  `;
}

async function installGapsRuntime() {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    twoStageRuntimeBindingSource(),
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

async function eventLineCount(targetRoot) {
  const text = await readFile(
    path.join(targetRoot, ".ai-workspace", "events", "events.jsonl"),
    "utf8"
  );
  return text.trim().split(/\r?\n/u).filter(Boolean).length;
}

test("M04 public gaps projection integration: package export surface stays aligned at root, m04, and gaps subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const gapsModule = await import("@abiogenesis/typescript-tenant/app/m04/gaps");

  assert.equal(root.publicGaps, publicGaps);
  assert.equal(m04.publicGaps, publicGaps);
  assert.equal(gapsModule.publicGaps, publicGaps);
});

test("M04 public gaps projection integration: installed CLI gaps is read-only and replay-derived across open, partial, and converged states", async () => {
  const { targetRoot, packageRoot } = await installGapsRuntime();

  const openRun = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(openRun.status, 0, openRun.stderr);
  const open = parsePayload(openRun);

  assert.equal(open.command, "gaps");
  assert.equal(open.status, "blocked");
  assert.equal(open.jobs_considered, 1);
  assert.equal(open.total_delta, 1);
  assert.equal(open.open_frames, 0);
  assert.equal(open.converged, false);
  assert.equal(open.event_count, 0);
  assert.equal(open.gaps[0].edge, "input_to_design");
  assert.equal(open.gaps[0].vector_count, 2);
  assert.equal(open.gaps[0].open_vector_count, 2);
  assert.equal(open.gaps[0].status, "dispatch_required");
  assert.equal(open.gaps[0].next_step, "start");
  assert.deepStrictEqual(open.gaps[0].failing, ["design_complete"]);
  assert.equal(await eventLineCount(targetRoot), 0);

  const closeFirst = await runInstalledNodeScript(targetRoot, closeVectorScript(0));
  assert.equal(closeFirst.status, 0, closeFirst.stderr);
  assert.equal(await eventLineCount(targetRoot), 2);

  const partialRun = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(partialRun.status, 0, partialRun.stderr);
  const partial = parsePayload(partialRun);

  assert.equal(partial.status, "blocked");
  assert.equal(partial.total_delta, 0.5);
  assert.equal(partial.open_frames, 1);
  assert.equal(partial.converged, false);
  assert.equal(partial.event_count, 2);
  assert.equal(partial.gaps[0].edge, "design_to_code");
  assert.equal(partial.gaps[0].closed_vector_count, 1);
  assert.equal(partial.gaps[0].open_vector_count, 1);
  assert.deepStrictEqual(partial.gaps[0].failing, ["code_complete"]);

  const closeSecond = await runInstalledNodeScript(targetRoot, closeVectorScript(1));
  assert.equal(closeSecond.status, 0, closeSecond.stderr);
  assert.equal(await eventLineCount(targetRoot), 4);

  const convergedRun = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(convergedRun.status, 0, convergedRun.stderr);
  const converged = parsePayload(convergedRun);

  assert.equal(converged.status, "converged");
  assert.equal(converged.total_delta, 0);
  assert.equal(converged.open_frames, 0);
  assert.equal(converged.converged, true);
  assert.equal(converged.event_count, 4);
  assert.equal(converged.gaps[0].edge, null);
  assert.equal(converged.gaps[0].status, "converged");
  assert.equal(converged.gaps[0].next_step, "none");
});
