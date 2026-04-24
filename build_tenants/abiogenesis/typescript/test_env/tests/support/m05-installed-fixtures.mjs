import { mkdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  constructInstalledRootObservation,
  constructInstalledSandboxQualificationRequest,
  constructRunArchiveFileRef,
  constructRunArchiveQualificationRequest
} from "../../../build/semantic/code/src/qualification/m05/index.js";
import {
  deliverBootloader,
  installBootstrap
} from "../../../build/semantic/code/src/app/m04/index.js";
import {
  bootloaderPayload,
  installedRuntimePayload
} from "./bootloader-fixtures.mjs";
import {
  makeInstallTargetRoot,
  nodeInstallWriter
} from "./install-bootstrap-fixtures.mjs";

const SUPPORT_DIR = path.dirname(fileURLToPath(import.meta.url));

async function pathExists(targetPath) {
  try {
    await import("node:fs/promises").then(({ access }) => access(targetPath));
    return true;
  } catch {
    return false;
  }
}

async function locateRepoRoot() {
  let current = SUPPORT_DIR;
  while (current !== path.dirname(current)) {
    if (
      await pathExists(path.join(current, "specification")) &&
      await pathExists(path.join(current, "build_tenants"))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  throw new Error("unable to locate abiogenesis repo root from installed M05 support path");
}

export async function provisionInstalledRoot() {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  const installOutcome = await installBootstrap(
    installedRuntimePayload(targetRoot),
    writer
  );
  await writer.writeTextFile(path.join(targetRoot, "AGENTS.md"), "# local agents\n");
  await writer.writeTextFile(path.join(targetRoot, "CLAUDE.md"), "# local claude\n");
  const bootloaderOutcome = await deliverBootloader(
    bootloaderPayload(targetRoot),
    writer
  );

  return {
    targetRoot,
    writer,
    installOutcome,
    bootloaderOutcome
  };
}

export async function linkInstalledTenantPackage(targetRoot) {
  const repoRoot = await locateRepoRoot();
  const tenantRoot = path.join(
    repoRoot,
    "build_tenants",
    "abiogenesis",
    "typescript"
  );
  const packageScopeRoot = path.join(
    targetRoot,
    "node_modules",
    "@abiogenesis"
  );
  const packageRoot = path.join(packageScopeRoot, "typescript-tenant");
  await mkdir(packageScopeRoot, { recursive: true });
  try {
    await symlink(tenantRoot, packageRoot, "dir");
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "EEXIST")) {
      throw error;
    }
  }
  return packageRoot;
}

export function runInstalledNodeScript(targetRoot, source) {
  const scriptPath = path.join(targetRoot, ".abiogenesis", "installed-proof.mjs");
  return writeFile(scriptPath, source, "utf8").then(() =>
    spawnSync("node", [scriptPath], {
      cwd: targetRoot,
      encoding: "utf8"
    })
  );
}

export function bootstrapExportProbeSource() {
  return `
    const mod = await import("../bootstrap/index.mjs");
    console.log(JSON.stringify({ exports: Object.keys(mod).sort() }));
  `;
}

export function installedLiveLaneSource() {
  return `
    import {
      edge,
      graphFunctionForVector,
      admitModule,
      admitNode,
      admitExecutionBasis,
      deriveAdvancementTransition,
      dispatchRequestsForTransition,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      admitOperatorAssetQueryContract,
      admitPublicStartRequest,
      projectLiveStatus,
      publicStart,
      resolvePublicAssetTarget,
      resultAssessment
    } from "@abiogenesis/typescript-tenant";

    const design = admitNode({
      id: "node-installed-design",
      name: "Design",
      schema: { kind: "symbolic", ref: "Vector[design]" },
      markov: ["derived"],
      assetSurface: {
        kind: "design",
        requiredContexts: ["workspace"],
        standardsRefs: ["design-standard"],
        outputContractRefs: ["design-contract"]
      },
      tags: ["input"]
    });
    const code = admitNode({
      id: "node-installed-code",
      name: "Code",
      schema: { kind: "symbolic", ref: "Vector[code]" },
      markov: ["implemented"],
      assetSurface: {
        kind: "code",
        requiredContexts: ["workspace"],
        standardsRefs: ["code-standard"],
        outputContractRefs: ["code-contract"]
      },
      tags: ["output"]
    });

    const graphFunction = graphFunctionForVector(
      edge([design], code, {
        id: "graph-installed-code",
        name: "design→code:installed",
        declarations: { entries: [] }
      }).vectors[0],
      {
        id: "graph-function-installed-code",
        name: "installed_code_flow",
        declarations: { entries: [] }
      }
    );

    const module = admitModule({
      name: "installed_runtime",
      graphs: [graphFunction.template.graph],
      graphFunctions: [graphFunction],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-installed-code",
          name: "installed_code_job",
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
    });

    const contract = admitOperatorAssetQueryContract({
      command: ["node", "operator-asset-query.mjs"]
    });
    const resolved = await resolvePublicAssetTarget(
      {
        target: {
          kind: "asset",
          handle: "installed_code_surface"
        }
      },
      {
        module,
        workspaceRoot: "/workspace/installed",
        operatorAssetContract: contract
      },
      async () => ({
        assets: [
          {
            asset_id: "installed_code_surface",
            uri: "file://build/code",
            operator_target: {
              kind: "graph_function",
              handle: "installed_code_flow"
            }
          }
        ]
      })
    );

    const runtimeIdentity = admitResolvedRuntimeIdentity({
      workerId: "worker://installed-runtime",
      backendId: "backend://node",
      buildId: "build://typescript-installed",
      resolvedRuntimeRef: "runtime://typescript/node"
    });
    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://installed-fp",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://installed"
    });

    const startInput = {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/installed",
        moduleName: "installed_runtime"
      },
      target: {
        kind: "graph_function",
        handle: resolved.target.ownerHandle
      },
      until: "converged"
    };

    const events = [];
    const startOutcome = publicStart(
      startInput,
      {
        module,
        runtimeIdentity,
        resolvedPolicy,
        runId: "run://installed-live",
        workKey: "wk://installed-live"
      },
      (event) => events.push(event)
    );

    const startRequest = admitPublicStartRequest(startInput);
    const dispatchRequest = dispatchRequestsForTransition(
      deriveAdvancementTransition(
        admitExecutionBasis({
          startIntent: startRequest.startIntent,
          module,
          runtimeIdentity,
          resolvedPolicy,
          runId: "run://installed-live",
          workKey: "wk://installed-live",
          frameId: null,
          frameLineageId: null
        })
      )
    )[0];

    const assessmentRequest = {
      kind: "fp_assessed",
      dispatch_request: dispatchRequest,
      result_artifact: {
        edge: dispatchRequest.expectedEdge,
        actor: "codex",
        fulfillment_assessments: [
          {
            id: "code_complete",
            evaluator: "code_complete",
            fulfillment_status: "fulfilled",
            fulfillment_detail: "installed line accepted",
            blocking_reasons: [],
            evidence_refs: ["proof://installed"]
          }
        ],
        selected_worker_id: dispatchRequest.workerId,
        selected_backend: dispatchRequest.backendId,
        role_id: "role://runtime",
        assignment_source: "policy_resolution",
        resolved_runtime_ref: "runtime://typescript/node"
      },
      manifest_provenance: {
        spec_hash: "spec://typescript-dev",
        manifest_id: "manifest://installed-live",
        workflow_version: "wf://typescript-dev",
        run_id: "run://installed-live",
        work_key: "wk://installed-live",
        authority_ref: "authority://runtime",
        selected_worker_id: dispatchRequest.workerId,
        selected_backend: dispatchRequest.backendId,
        role_id: "role://runtime",
        assignment_source: "policy_resolution",
        resolved_runtime_ref: "runtime://typescript/node"
      },
      published_ledger_ref: {
        ref: "ledger://installed-live"
      }
    };

    const assessmentOutcome = resultAssessment(
      assessmentRequest,
      (event) => events.push(event)
    );

    const projection = projectLiveStatus({
      start_request: startInput,
      start_outcome: startOutcome,
      control_request: null,
      control_outcome: null,
      result_assessment_request: assessmentRequest,
      result_assessment_outcome: assessmentOutcome
    });

    console.log(JSON.stringify({
      exports: Object.keys(await import("../bootstrap/index.mjs")).sort(),
      liveScenarioPassed:
        resolved.kind === "resolved" &&
        startOutcome.kind === "blocked" &&
        assessmentOutcome.kind === "accepted" &&
        projection.kind === "ready" &&
        projection.runStatus === "assessed",
      eventKinds: events.map((event) => event.kind),
      projectionKind: projection.kind,
      runStatus: projection.runStatus
    }));
  `;
}

export function buildInstalledSandboxRequest(input) {
  return constructInstalledSandboxQualificationRequest({
    lane: input.lane,
    installOutcome: input.installOutcome,
    bootloaderOutcome: input.bootloaderOutcome,
    runtimeRoot: constructInstalledRootObservation({
      rootPath: input.rootPath,
      packageBinding: input.packageBinding,
      bootstrapImportPassed: input.bootstrapImportPassed,
      exportedSurface: input.exportedSurface,
      liveScenarioPassed: input.liveScenarioPassed
    })
  });
}

export async function materializeArchiveFixture(targetRoot, scenarioName) {
  const archiveRoot = path.join(
    targetRoot,
    ".ai-workspace",
    "test_runs",
    scenarioName,
    "20260424T000000Z"
  );
  const artifactsRoot = path.join(archiveRoot, "artifacts");
  const workspaceDocsRoot = path.join(archiveRoot, "workspace", "docs");
  await mkdir(artifactsRoot, { recursive: true });
  await mkdir(workspaceDocsRoot, { recursive: true });
  await writeFile(path.join(archiveRoot, "run.json"), JSON.stringify({ scenarioName }, null, 2));
  await writeFile(path.join(archiveRoot, "summary.json"), JSON.stringify({ converged: true }, null, 2));
  await writeFile(path.join(archiveRoot, "stdout.log"), "stdout");
  await writeFile(path.join(archiveRoot, "stderr.log"), "stderr");
  await writeFile(path.join(artifactsRoot, "events.jsonl"), "{\"kind\":\"basis_admitted\"}\n");
  await writeFile(path.join(artifactsRoot, "manifest_m.json"), JSON.stringify({ manifest_id: "m" }, null, 2));
  await writeFile(path.join(artifactsRoot, "result_m.json"), JSON.stringify({ edge: "design→code" }, null, 2));
  await writeFile(path.join(workspaceDocsRoot, "artifact.md"), "# artifact\n");

  return {
    archiveRoot,
    request: constructRunArchiveQualificationRequest({
      scenarioName,
      archiveRoot,
      immutablePath: true,
      files: [
        constructRunArchiveFileRef({
          path: path.join(archiveRoot, "run.json"),
          kind: "run_meta",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(archiveRoot, "summary.json"),
          kind: "summary",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(archiveRoot, "stdout.log"),
          kind: "stdout",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(archiveRoot, "stderr.log"),
          kind: "stderr",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(artifactsRoot, "events.jsonl"),
          kind: "events",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(artifactsRoot, "manifest_m.json"),
          kind: "manifest",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(artifactsRoot, "result_m.json"),
          kind: "result",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: path.join(workspaceDocsRoot, "artifact.md"),
          kind: "workspace_artifact",
          exists: true
        })
      ]
    })
  };
}
