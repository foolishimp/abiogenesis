// Validates: REQ-P-POLICY-008
// Validates: REQ-P-POLICY-016
// Validates: REQ-P-POLICY-017

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  rewriteInstalledPackageImports
} from "./support/m05-installed-fixtures.mjs";

function noJobRuntimeBindingSource() {
  return `
    import {
      admitModule,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity
    } from "@abiogenesis/typescript-tenant";

    export const runtimeBinding = {
      module: admitModule({
        name: "gaps_no_job_runtime",
        graphs: [],
        graphFunctions: [],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [],
        roles: [],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        metadata: { entries: [] }
      }),
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://gaps-negative",
        backendId: "backend://node",
        buildId: "build://typescript-gaps-negative",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://gaps-negative",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://gaps-negative"
      })
    };
  `;
}

function duplicateJobRuntimeBindingSource() {
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      edge,
      graphFunctionForVector
    } from "@abiogenesis/typescript-tenant";

    const input = admitNode({
      id: "node-gaps-negative-input",
      name: "Input",
      schema: { kind: "symbolic", ref: "Vector[input]" },
      markov: ["declared"],
      assetSurface: {
        kind: "input",
        requiredContexts: ["workspace"],
        standardsRefs: ["input-standard"],
        outputContractRefs: ["input-contract"]
      },
      tags: ["input"]
    });
    const output = admitNode({
      id: "node-gaps-negative-output",
      name: "Output",
      schema: { kind: "symbolic", ref: "Vector[output]" },
      markov: ["declared"],
      assetSurface: {
        kind: "output",
        requiredContexts: ["workspace"],
        standardsRefs: ["output-standard"],
        outputContractRefs: ["output-contract"]
      },
      tags: ["output"]
    });
    const graphFunction = graphFunctionForVector(
      edge([input], output, {
        id: "graph-gaps-negative",
        name: "input_to_output",
        declarations: { entries: [] }
      }).vectors[0],
      {
        id: "graph-function-gaps-negative",
        name: "negative_flow",
        declarations: { entries: [] }
      }
    );

    export const runtimeBinding = {
      module: admitModule({
        name: "gaps_duplicate_job_runtime",
        graphs: [graphFunction.template.graph],
        graphFunctions: [graphFunction],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-gaps-negative-a",
            name: "negative_a",
            contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
            roles: [],
            tags: ["semantic_work"]
          },
          {
            id: "job-gaps-negative-b",
            name: "negative_b",
            contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
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
        workerId: "worker://gaps-negative",
        backendId: "backend://node",
        buildId: "build://typescript-gaps-negative",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://gaps-negative",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://gaps-negative"
      })
    };
  `;
}

async function installRuntime(source) {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(targetRoot, source),
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

test("T-058 negative proof: gaps fails closed when workspace scope has no semantic jobs", async () => {
  const { targetRoot, packageRoot } = await installRuntime(
    noJobRuntimeBindingSource()
  );
  const run = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(run.status, 1);
  const payload = parsePayload(run);

  assert.equal(payload.status, "error");
  assert.match(payload.reason, /at least one semantic job/i);
});

test("T-058 negative proof: gaps rejects ambiguous semantic job ownership", async () => {
  const { targetRoot, packageRoot } = await installRuntime(
    duplicateJobRuntimeBindingSource()
  );
  const run = runCli(targetRoot, packageRoot, [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(run.status, 1);
  const payload = parsePayload(run);

  assert.equal(payload.status, "error");
  assert.match(payload.reason, /multiple semantic jobs/i);
});
