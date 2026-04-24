import { mkdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  constructRunArchiveFinalizationRequest,
  constructRunArchiveMetadataRef,
  constructRunArchiveNoteRef,
  constructRunArchiveSummaryRef,
  constructRunArchiveFinalizationSourceFileRef,
  constructInstalledResetPostmortemObservation,
  constructInstalledResetPostmortemRequest,
  constructInstalledLiveScenarioPortfolioRequest,
  constructInstalledLiveScenarioResult,
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

export { nodeInstallWriter };

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

function installedLiveScenarioSpec(scenarioName) {
  switch (scenarioName) {
    case "requirements_to_uat":
      return {
        scenarioName,
        authorityRefs: ["SCN-R2U-001"],
        mode: "asset_addressed",
        stages: [
          {
            handle: "requirements_to_uat_flow",
            edge: "requirements→uat_tests",
            assetHandle: "uat_surface",
            assessmentCount: 1
          }
        ]
      };
    case "intent_to_requirements":
      return {
        scenarioName,
        authorityRefs: ["SCN-I2R-001"],
        mode: "graph_function",
        stages: [
          {
            handle: "intent_to_requirements_flow",
            edge: "intent→requirements",
            assetHandle: null,
            assessmentCount: 1
          }
        ]
      };
    case "gsdlc_lite_requirements_design_code":
      return {
        scenarioName,
        authorityRefs: ["SCN-GSDLCLITE-001"],
        mode: "staged_chain",
        stages: [
          {
            handle: "requirements_to_design_flow",
            edge: "requirements→design",
            assetHandle: null,
            assessmentCount: 1
          },
          {
            handle: "design_to_code_flow",
            edge: "design→code",
            assetHandle: null,
            assessmentCount: 1
          }
        ]
      };
    case "gsdlc_lite_design_review":
      return {
        scenarioName,
        authorityRefs: ["SCN-GSDLCLITE-001"],
        mode: "review_chain",
        stages: [
          {
            handle: "requirements_to_design_review_flow",
            edge: "requirements→design",
            assetHandle: null,
            assessmentCount: 1
          },
          {
            handle: "design_review_flow",
            edge: "design→review",
            assetHandle: null,
            assessmentCount: 3
          },
          {
            handle: "review_to_code_flow",
            edge: "review→code",
            assetHandle: null,
            assessmentCount: 1
          }
        ]
      };
    case "gsdlc_lite_zoom_design":
      return {
        scenarioName,
        authorityRefs: ["SCN-GSDLCLITE-001"],
        mode: "zoom_chain",
        stages: [
          {
            handle: "requirements_to_decomposition_flow",
            edge: "requirements→decomposition",
            assetHandle: null,
            assessmentCount: 1
          },
          {
            handle: "decomposition_to_dependency_chain_flow",
            edge: "decomposition→dependency_chain",
            assetHandle: null,
            assessmentCount: 1
          },
          {
            handle: "dependency_chain_to_sequencing_flow",
            edge: "dependency_chain→sequencing",
            assetHandle: null,
            assessmentCount: 1
          },
          {
            handle: "sequencing_to_design_flow",
            edge: "sequencing→design",
            assetHandle: null,
            assessmentCount: 1
          },
          {
            handle: "requirements_to_design_parent_flow",
            edge: "requirements→design",
            assetHandle: null,
            assessmentCount: 1
          }
        ]
      };
    default:
      throw new Error(`unknown installed live scenario ${scenarioName}`);
  }
}

export function installedLiveScenarioPortfolioSource(scenarioName) {
  const scenario = installedLiveScenarioSpec(scenarioName);
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

    const scenario = ${JSON.stringify(scenario)};

    function sourceNode(id, name) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: "Vector[source]" },
        markov: ["derived"],
        assetSurface: {
          kind: "design",
          requiredContexts: ["workspace"],
          standardsRefs: ["design-standard"],
          outputContractRefs: ["design-contract"]
        },
        tags: ["input"]
      });
    }

    function targetNode(id, name) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: "Vector[target]" },
        markov: ["implemented"],
        assetSurface: {
          kind: "code",
          requiredContexts: ["workspace"],
          standardsRefs: ["code-standard"],
          outputContractRefs: ["code-contract"]
        },
        tags: ["output"]
      });
    }

    function stageProfile(stage, index) {
      const source = sourceNode(
        \`node-\${scenario.scenarioName}-source-\${index}\`,
        \`Source \${index + 1}\`
      );
      const target = targetNode(
        \`node-\${scenario.scenarioName}-target-\${index}\`,
        \`Target \${index + 1}\`
      );
      const vector = edge([source], target, {
        id: \`graph-\${scenario.scenarioName}-\${index}\`,
        name: stage.edge,
        declarations: { entries: [] }
      }).vectors[0];
      const graphFunction = graphFunctionForVector(vector, {
        id: \`graph-function-\${scenario.scenarioName}-\${index}\`,
        name: stage.handle,
        declarations: { entries: [] }
      });
      return {
        stage,
        graphFunction
      };
    }

    const profiles = scenario.stages.map(stageProfile);
    const module = admitModule({
      name: \`installed_live_\${scenario.scenarioName}\`,
      graphs: profiles.map((entry) => entry.graphFunction.template.graph),
      graphFunctions: profiles.map((entry) => entry.graphFunction),
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: profiles.map((entry, index) => ({
        id: \`job-\${scenario.scenarioName}-\${index}\`,
        name: \`\${entry.stage.handle}_job\`,
        contracts: [
          {
            kind: "graph_function",
            targetId: entry.graphFunction.id
          }
        ],
        roles: [],
        tags: ["semantic_work"]
      })),
      roles: [],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      metadata: { entries: [] }
    });

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

    const exportedSurface = Object.keys(await import("../bootstrap/index.mjs")).sort();
    const emittedEventKinds = [];
    let scenarioPassed = true;
    let finalRunStatus = "idle";
    let maxAssessmentCount = 0;

    for (let index = 0; index < profiles.length; index += 1) {
      const entry = profiles[index];
      const stage = entry.stage;
      let targetHandle = stage.handle;

      if (stage.assetHandle !== null) {
        const resolved = await resolvePublicAssetTarget(
          {
            target: {
              kind: "asset",
              handle: stage.assetHandle
            }
          },
          {
            module,
            workspaceRoot: "/workspace/installed",
            operatorAssetContract: admitOperatorAssetQueryContract({
              command: ["node", "operator-asset-query.mjs"]
            })
          },
          async () => ({
            assets: [
              {
                asset_id: stage.assetHandle,
                uri: "file://build/output",
                operator_target: {
                  kind: "graph_function",
                  handle: stage.handle
                }
              }
            ]
          })
        );

        if (resolved.kind !== "resolved") {
          scenarioPassed = false;
          break;
        }

        targetHandle = resolved.target.ownerHandle;
      }

      const startInput = {
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/installed",
          moduleName: module.name
        },
        target: {
          kind: "graph_function",
          handle: targetHandle
        },
        until: "converged"
      };

      const startOutcome = publicStart(
        startInput,
        {
          module,
          runtimeIdentity,
          resolvedPolicy,
          runId: \`run://\${scenario.scenarioName}-\${index}\`,
          workKey: \`wk://\${scenario.scenarioName}-\${index}\`
        },
        (event) => emittedEventKinds.push(event.kind)
      );

      if (
        startOutcome.kind !== "blocked" ||
        startOutcome.stopPredicate !== "dispatch_required"
      ) {
        scenarioPassed = false;
        break;
      }

      const startRequest = admitPublicStartRequest(startInput);
      const dispatchRequest = dispatchRequestsForTransition(
        deriveAdvancementTransition(
          admitExecutionBasis({
            startIntent: startRequest.startIntent,
            module,
            runtimeIdentity,
            resolvedPolicy,
            runId: \`run://\${scenario.scenarioName}-\${index}\`,
            workKey: \`wk://\${scenario.scenarioName}-\${index}\`,
            frameId: null,
            frameLineageId: null
          })
        )
      )[0];

      maxAssessmentCount = Math.max(maxAssessmentCount, stage.assessmentCount);
      const fulfillmentAssessments = Array.from(
        { length: stage.assessmentCount },
        (_, assessmentIndex) => ({
          id: \`\${stage.handle}_assessment_\${assessmentIndex + 1}\`,
          evaluator: \`\${stage.handle}_assessment_\${assessmentIndex + 1}\`,
          fulfillment_status: "fulfilled",
          fulfillment_detail: "installed scenario accepted",
          blocking_reasons: [],
          evidence_refs: ["proof://installed"]
        })
      );

      const assessmentRequest = {
        kind: "fp_assessed",
        dispatch_request: dispatchRequest,
        result_artifact: {
          edge: dispatchRequest.expectedEdge,
          actor: "codex",
          fulfillment_assessments: fulfillmentAssessments,
          selected_worker_id: dispatchRequest.workerId,
          selected_backend: dispatchRequest.backendId,
          role_id: "role://runtime",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        manifest_provenance: {
          spec_hash: "spec://typescript-dev",
          manifest_id: \`manifest://\${scenario.scenarioName}-\${index}\`,
          workflow_version: "wf://typescript-dev",
          run_id: \`run://\${scenario.scenarioName}-\${index}\`,
          work_key: \`wk://\${scenario.scenarioName}-\${index}\`,
          authority_ref: "authority://runtime",
          selected_worker_id: dispatchRequest.workerId,
          selected_backend: dispatchRequest.backendId,
          role_id: "role://runtime",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        published_ledger_ref: {
          ref: \`ledger://\${scenario.scenarioName}-\${index}\`
        }
      };

      const assessmentOutcome = resultAssessment(
        assessmentRequest,
        (event) => emittedEventKinds.push(event.kind)
      );

      if (assessmentOutcome.kind !== "accepted") {
        scenarioPassed = false;
        break;
      }

      const projection = projectLiveStatus({
        start_request: startInput,
        start_outcome: startOutcome,
        control_request: null,
        control_outcome: null,
        result_assessment_request: assessmentRequest,
        result_assessment_outcome: assessmentOutcome
      });

      if (projection.kind !== "ready" || projection.runStatus !== "assessed") {
        scenarioPassed = false;
      }

      finalRunStatus = projection.runStatus;
    }

    console.log(JSON.stringify({
      exports: exportedSurface,
      scenarioName: scenario.scenarioName,
      scenarioAuthorityRefs: scenario.authorityRefs,
      mode: scenario.mode,
      stageCount: scenario.stages.length,
      maxAssessmentCount,
      passed: scenarioPassed,
      emittedEventKinds: [...new Set(emittedEventKinds)],
      finalRunStatus
    }));
  `;
}

export function buildInstalledLiveScenarioPortfolioRequest(input) {
  return constructInstalledLiveScenarioPortfolioRequest({
    installedQualification: input.installedQualification,
    scenarios: input.scenarios.map((scenario) =>
      constructInstalledLiveScenarioResult(scenario)
    )
  });
}

export function installedResetPostmortemSource() {
  return `
    import {
      edge,
      eventIngress,
      graphFunctionForVector,
      admitModule,
      admitNode,
      admitExecutionBasis,
      deriveAdvancementTransition,
      dispatchRequestsForTransition,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      admitPublicStartRequest,
      projectLiveStatus,
      publicStart,
      resultAssessment
    } from "@abiogenesis/typescript-tenant";

    function sourceNode(id, name) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: "Vector[source]" },
        markov: ["derived"],
        assetSurface: {
          kind: "design",
          requiredContexts: ["workspace"],
          standardsRefs: ["design-standard"],
          outputContractRefs: ["design-contract"]
        },
        tags: ["input"]
      });
    }

    function targetNode(id, name) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: "Vector[target]" },
        markov: ["implemented"],
        assetSurface: {
          kind: "code",
          requiredContexts: ["workspace"],
          standardsRefs: ["code-standard"],
          outputContractRefs: ["code-contract"]
        },
        tags: ["output"]
      });
    }

    function runtimeBundle() {
      const design = sourceNode("node-reset-design", "Design");
      const code = targetNode("node-reset-code", "Code");
      const graphFunction = graphFunctionForVector(
        edge([design], code, {
          id: "graph-installed-reset",
          name: "design→code:reset",
          declarations: { entries: [] }
        }).vectors[0],
        {
          id: "graph-function-installed-reset",
          name: "installed_reset_flow",
          declarations: { entries: [] }
        }
      );

      const module = admitModule({
        name: "installed_reset_runtime",
        graphs: [graphFunction.template.graph],
        graphFunctions: [graphFunction],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-installed-reset",
            name: "installed_reset_job",
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

      return {
        module,
        runtimeIdentity,
        resolvedPolicy,
        targetHandle: graphFunction.name
      };
    }

    function makeStartInput(targetHandle) {
      return {
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/installed",
          moduleName: "installed_reset_runtime"
        },
        target: {
          kind: "graph_function",
          handle: targetHandle
        },
        until: "converged"
      };
    }

    function resetPayload(runId, workKey) {
      return {
        kind: "reset",
        scope: "workspace",
        actor: "tester",
        reason: "restart corrected execution",
        workflow_version: "wf://typescript-installed",
        run_id: runId,
        work_key: workKey,
        edge: null
      };
    }

    function activeRunObservation() {
      const { module, runtimeIdentity, resolvedPolicy, targetHandle } = runtimeBundle();
      const runId = "run://installed-reset-active";
      const workKey = "wk://installed-reset-active";
      const startInput = makeStartInput(targetHandle);
      const events = [];
      const startOutcome = publicStart(
        startInput,
        {
          module,
          runtimeIdentity,
          resolvedPolicy,
          runId,
          workKey
        },
        (event) => events.push(event)
      );
      const projection = projectLiveStatus({
        start_request: startInput,
        start_outcome: startOutcome,
        control_request: null,
        control_outcome: null,
        result_assessment_request: null,
        result_assessment_outcome: null
      });
      const resetOutcome = eventIngress(resetPayload(runId, workKey), (event) =>
        events.push(event)
      );
      return {
        caseName: "active_run_superseded",
        resetScope: "workspace",
        resetAccepted: resetOutcome.kind === "accepted",
        emittedKinds:
          resetOutcome.kind === "accepted" ? resetOutcome.trace.emittedKinds : [],
        runId: startOutcome.kind === "rejected" ? null : startOutcome.trace.runId,
        workKey: startOutcome.kind === "rejected" ? null : startOutcome.trace.workKey,
        preResetRunStatus: projection.runStatus,
        assessmentStatus: null
      };
    }

    function continuationObservation() {
      const { module, runtimeIdentity, resolvedPolicy, targetHandle } = runtimeBundle();
      const runId = "run://installed-reset-continuation";
      const workKey = "wk://installed-reset-continuation";
      const startInput = makeStartInput(targetHandle);
      const events = [];
      const startOutcome = publicStart(
        startInput,
        {
          module,
          runtimeIdentity,
          resolvedPolicy,
          runId,
          workKey
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
            runId,
            workKey,
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
              fulfillment_status: "unfulfilled",
              fulfillment_detail: "returned code does not satisfy the contract",
              blocking_reasons: ["returned code does not satisfy the contract"],
              evidence_refs: []
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
          manifest_id: "manifest://installed-reset-continuation",
          workflow_version: "wf://typescript-installed",
          run_id: runId,
          work_key: workKey,
          authority_ref: "authority://runtime",
          selected_worker_id: dispatchRequest.workerId,
          selected_backend: dispatchRequest.backendId,
          role_id: "role://runtime",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        published_ledger_ref: {
          ref: "ledger://installed-reset-continuation"
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
      const resetOutcome = eventIngress(resetPayload(runId, workKey), (event) =>
        events.push(event)
      );
      return {
        caseName: "open_continuation_abandoned",
        resetScope: "workspace",
        resetAccepted: resetOutcome.kind === "accepted",
        emittedKinds:
          resetOutcome.kind === "accepted" ? resetOutcome.trace.emittedKinds : [],
        runId,
        workKey,
        preResetRunStatus: projection.runStatus,
        assessmentStatus:
          assessmentRequest.result_artifact.fulfillment_assessments[0]?.fulfillment_status ?? null,
        manifestId: assessmentRequest.manifest_provenance.manifest_id,
        publishedLedgerRef: assessmentRequest.published_ledger_ref.ref
      };
    }

    console.log(
      JSON.stringify({
        observations: [activeRunObservation(), continuationObservation()]
      })
    );
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

export function buildInstalledResetPostmortemRequest(input) {
  return constructInstalledResetPostmortemRequest({
    installedQualification: input.installedQualification,
    observations: input.observations.map((entry) =>
      constructInstalledResetPostmortemObservation({
        caseName: entry.caseName,
        resetScope: entry.resetScope,
        resetAccepted: entry.resetAccepted,
        emittedKinds: entry.emittedKinds,
        runId: entry.runId ?? null,
        workKey: entry.workKey ?? null,
        preResetRunStatus: entry.preResetRunStatus,
        assessmentStatus: entry.assessmentStatus ?? null,
        manifestId: entry.manifestId ?? null,
        publishedLedgerRef: entry.publishedLedgerRef ?? null
      })
    )
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

export async function materializeArchiveSourceWorkspace(targetRoot, scenarioName) {
  const workspaceRoot = path.join(
    targetRoot,
    ".abiogenesis",
    "archive_sources",
    scenarioName
  );
  const eventsRoot = path.join(workspaceRoot, ".ai-workspace", "events");
  const manifestsRoot = path.join(workspaceRoot, ".ai-workspace", "fp_manifests");
  const resultsRoot = path.join(workspaceRoot, ".ai-workspace", "fp_results");
  const docsRoot = path.join(workspaceRoot, "docs");
  const capturedRoot = path.join(workspaceRoot, ".ai-workspace", "captures");

  await mkdir(eventsRoot, { recursive: true });
  await mkdir(manifestsRoot, { recursive: true });
  await mkdir(resultsRoot, { recursive: true });
  await mkdir(docsRoot, { recursive: true });
  await mkdir(capturedRoot, { recursive: true });

  const eventsPath = path.join(eventsRoot, "events.jsonl");
  const manifestPath = path.join(manifestsRoot, "m.json");
  const resultPath = path.join(resultsRoot, "m.json");
  const artifactPath = path.join(docsRoot, "artifact.md");
  const rawResponsePath = path.join(capturedRoot, "raw_response.txt");

  await writeFile(eventsPath, "{\"kind\":\"basis_admitted\"}\n");
  await writeFile(manifestPath, JSON.stringify({ manifest_id: "m" }, null, 2));
  await writeFile(resultPath, JSON.stringify({ edge: "design→code" }, null, 2));
  await writeFile(artifactPath, "# artifact\n");
  await writeFile(rawResponsePath, "example raw response\n");

  return {
    workspaceRoot,
    eventsPath,
    manifestPath,
    resultPath,
    artifactPath,
    rawResponsePath
  };
}

export async function buildArchiveFinalizationFixture(targetRoot, scenarioName) {
  const source = await materializeArchiveSourceWorkspace(targetRoot, scenarioName);
  const archiveRoot = path.join(
    targetRoot,
    ".ai-workspace",
    "test_runs",
    scenarioName,
    "20260424T000000Z"
  );

  return {
    archiveRoot,
    source,
    request: constructRunArchiveFinalizationRequest({
      scenarioName,
      archiveRoot,
      metadata: constructRunArchiveMetadataRef({
        usecaseId: scenarioName,
        testName: `test_${scenarioName}_archive_finalization`,
        timestamp: "20260424T000000Z",
        testPassed: true,
        sourceCommit: "commit://typescript-dev",
        runtimeRef: "runtime://node-test",
        notes: [
          constructRunArchiveNoteRef({
            label: "scenario",
            timestamp: "2026-04-24T00:00:00Z",
            detail: "installed archive finalization parity fixture"
          })
        ]
      }),
      summary: constructRunArchiveSummaryRef({
        workspacePath: source.workspaceRoot,
        totalEvents: 1,
        eventTypes: ["basis_admitted"],
        manifestFiles: ["m.json"],
        resultFiles: ["m.json"],
        converged: true,
        totalDelta: 0
      }),
      stdoutLog: "stdout\n",
      stderrLog: "stderr\n",
      sourceFiles: [
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: source.eventsPath,
          archiveRelativePath: "artifacts/events.jsonl",
          kind: "events"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: source.manifestPath,
          archiveRelativePath: "artifacts/manifest_m.json",
          kind: "manifest"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: source.resultPath,
          archiveRelativePath: "artifacts/result_m.json",
          kind: "result"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: source.artifactPath,
          archiveRelativePath: "workspace/docs/artifact.md",
          kind: "workspace_artifact"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: source.rawResponsePath,
          archiveRelativePath: "artifacts/raw_response.txt",
          kind: "captured_artifact"
        })
      ]
    })
  };
}
