// Validates: REQ-P-POLICY-017
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  installPackedTenantPackage,
  provisionInstalledRoot
} from "./support/m05-installed-fixtures.mjs";

function runtimeBindingSource({ ambiguousNext = false } = {}) {
  return `
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
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
        declarations: { entries: [] }
      }).vectors[0];
      return graphFunctionForVector(vector, {
        id: \`graph-function-\${id}\`,
        name,
        declarations: { entries: [] }
      });
    }

    const design = node("node-cli-design", "Design", "design");
    const code = node("node-cli-code", "Code", "code");
    const review = node("node-cli-review", "Review", "review");
    const codeProfile = profile(
      "code-flow",
      "code_flow",
      design,
      code,
      "design_to_code",
      "code_complete"
    );
    const reviewProfile = profile(
      "review-flow",
      "review_flow",
      design,
      review,
      "design_to_review",
      "review_complete"
    );
    const graphFunctions = ${ambiguousNext ? "[codeProfile, reviewProfile]" : "[codeProfile]"};
    const jobs = ${ambiguousNext
      ? `[
          {
            id: "job-code-flow",
            name: "code_flow_job",
            contracts: [{ kind: "graph_function", targetId: codeProfile.id }],
            roles: [],
            tags: ["semantic_work"]
          },
          {
            id: "job-review-flow",
            name: "review_flow_job",
            contracts: [{ kind: "graph_function", targetId: reviewProfile.id }],
            roles: [],
            tags: ["semantic_work"]
          }
        ]`
      : `[
          {
            id: "job-code-flow",
            name: "code_flow_job",
            contracts: [{ kind: "graph_function", targetId: codeProfile.id }],
            roles: [],
            tags: ["semantic_work"]
          }
        ]`};

    export const runtimeBinding = {
      module: admitModule({
        name: "cli_binary_runtime",
        graphs: graphFunctions.map((graphFunction) => graphFunction.template.graph),
        graphFunctions,
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs,
        roles: [],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        metadata: { entries: [] }
      }),
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
      runId: "run://cli-binary",
      workKey: "wk://cli-binary"
    };
  `;
}

async function installCliPackage() {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  return { targetRoot, packageRoot };
}

async function writeRuntimeBinding(targetRoot, source) {
  await mkdir(path.join(targetRoot, ".abiogenesis"), { recursive: true });
  await writeFile(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    source,
    "utf8"
  );
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

test("T-057 negative proof: start fails closed when no app-owned TypeScript runtime binding exists", async () => {
  const { targetRoot, packageRoot } = await installCliPackage();
  await rm(path.join(targetRoot, ".abiogenesis", "cli-runtime.mjs"), {
    force: true
  });
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
  assert.equal(run.status, 1);
  const payload = parsePayload(run);

  assert.equal(payload.status, "error");
  assert.match(payload.reason, /typescript-runtime\.mjs/);
});

test("T-057 negative proof: non-default root mode remains lawful only with until converged", async () => {
  const { targetRoot, packageRoot } = await installCliPackage();
  await writeRuntimeBinding(targetRoot, runtimeBindingSource());
  const run = runCli(targetRoot, packageRoot, [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "next",
    "--until",
    "first_traversal",
    "--root-mode",
    "supervised"
  ]);
  assert.equal(run.status, 1);
  const payload = parsePayload(run);

  assert.equal(payload.status, "error");
  assert.match(payload.reason, /root_mode.*until/i);
});

test("T-057 negative proof: target next fails closed when workspace scope has multiple semantic jobs", async () => {
  const { targetRoot, packageRoot } = await installCliPackage();
  await writeRuntimeBinding(
    targetRoot,
    runtimeBindingSource({ ambiguousNext: true })
  );
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
  assert.equal(run.status, 1);
  const payload = parsePayload(run);

  assert.equal(payload.status, "error");
  assert.match(payload.reason, /exactly one published semantic job/i);
});
