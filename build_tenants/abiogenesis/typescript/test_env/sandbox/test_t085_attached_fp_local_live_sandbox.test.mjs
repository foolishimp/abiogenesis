// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS
// Validates: REQ-R-ABG3-RUN
// Validates: REQ-R-ABG3-RETRY
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: T-085

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "../tests/support/m05-installed-fixtures.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(TEST_DIR, "../..");
const TEST_RUNS_ROOT = path.join(
  TENANT_ROOT,
  "test_env",
  "test_runs",
  "t085_attached_fp_local_live"
);

function timestamp() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

function attachedFpLocalLiveSandboxSource() {
  return `
    import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
    import path from "node:path";
    import { fileURLToPath } from "node:url";
    import {
      admitModule,
          admitNode,
          admitResolvedPolicyIdentity,
          admitResolvedRuntimeIdentity,
          compose,
          constructDefaultAbgFnCompositionDeclarations,
          constructEnginePluginContract,
          constructFpDispatchOutcome,
          constructFpEvaluationFinding,
          constructFpEvaluationOutcome,
          constructGraph,
          constructGraphFunction,
          constructGraphVector,
          constructTemplateRef,
          edge,
          graphFunctionForVector,
          materializeGraphFunction,
          publicStart
        } from "@abiogenesis/typescript-tenant";

    const packageEntryPath = fileURLToPath(
      import.meta.resolve("@abiogenesis/typescript-tenant")
    );
    const sandboxRoot = process.cwd();
    const artifactRoot = path.join(
      sandboxRoot,
      ".abiogenesis",
      "test-runs",
      "t085-attached-fp-local-live"
    );
    mkdirSync(artifactRoot, { recursive: true });

    function node(id, name, kind, markov) {
      return admitNode({
        id,
        name,
        schema: { kind: "symbolic", ref: "Vector[" + kind + "]" },
        markov: [markov],
        assetSurface: {
          kind,
          requiredContexts: ["workspace"],
          standardsRefs: [kind + "-standard"],
          outputContractRefs: [kind + "-contract"]
        },
        tags: [kind, "t085"]
      });
    }

    function stageGraphFunction(name, source, target, edgeName, evaluatorId) {
      const vector = edge([source], target, {
        id: "graph-t085-" + name,
        name: edgeName,
        evaluators: [
          {
            name: evaluatorId,
            regime: "F_P",
            description: edgeName + " accepted",
            binding: "binding://t085/" + name,
            tags: ["fulfillment", "t085"]
          }
        ],
            tags: ["sandbox", "attached_fp", "t085"]
          }).vectors[0];

          return graphFunctionForVector(vector, {
        name,
        declarations: { entries: [] },
        tags: ["sandbox", "attached_fp", "t085"]
      });
    }

    const inputSet = node("node-t085-input-set", "InputSet", "input_set", "declared");
        const requirements = node("node-t085-requirements", "Requirements", "requirements", "captured");
        const design = node("node-t085-design", "Design", "design", "derived");
        const code = node("node-t085-code", "Code", "code", "implemented");

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
              scopeRef: "t085/attached-fp/" + vector.id,
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

        const baseExecutive = compose(
          stageGraphFunction(
            "capture_requirements",
            inputSet,
        requirements,
        "input_set→requirements",
        "requirements_ready"
      ),
      stageGraphFunction(
        "synthesize_design",
        requirements,
        design,
        "requirements→design",
        "design_ready"
      ),
      stageGraphFunction(
        "implement_code",
        design,
        code,
        "design→code",
            "code_ready"
          )
        );
        const executive = graphFunctionWithVectorCompositionDeclarations(baseExecutive);
        const executiveGraph = materializeGraphFunction(executive);

    const module = admitModule({
      name: "t085_attached_fp_local_live_sandbox",
      graphs: [executiveGraph],
      graphFunctions: [executive],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-t085-attached-fp-local-live",
          name: "attached_fp_local_live_job",
          contracts: [{ kind: "graph_function", targetId: executive.id }],
          roles: [],
          tags: ["semantic_work", "sandbox", "t085"]
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
      workerId: "worker://t085-local-live",
      backendId: "backend://node",
      buildId: "build://typescript-installed",
      resolvedRuntimeRef: "runtime://typescript/node"
    });
    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t085/attached-fp-local-live",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t085/attached-fp-local-live"
    });
    const startInput = {
      scope: {
        kind: "workspace",
        workspaceRoot: sandboxRoot,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: executive.name
      },
      until: "converged"
    };

    function writeArtifact(name, content) {
      const target = path.join(artifactRoot, name);
      writeFileSync(target, content, "utf8");
      return "file://" + target;
    }

    function artifactFor(input, fulfillmentStatus, detail, evidenceRefs) {
      const assessmentIds = input.expectedAssessmentIds.length > 0
        ? input.expectedAssessmentIds
        : ["t085_fulfilled"];
      return {
        edge: input.expectedEdge ?? input.edge,
        actor: "t085_local_live_attached_worker",
        fulfillment_assessments: assessmentIds.map((assessmentId) => ({
          id: assessmentId,
          evaluator: assessmentId,
          fulfillment_status: fulfillmentStatus,
          fulfillment_detail: detail,
          blocking_reasons:
            fulfillmentStatus === "fulfilled" ? [] : ["missing generated asset"],
          evidence_refs: evidenceRefs
        })),
        selected_worker_id: "worker://t085-local-live",
        selected_backend: "backend://node",
        role_id: "role://runtime",
        assignment_source: "policy_resolution",
        resolved_runtime_ref: "runtime://typescript/node"
      };
    }

    const events = [];
    const workerInputs = [];
    const attemptByEdge = new Map();
    const partialRequirementsRef = writeArtifact(
      "requirements.partial.md",
      "# Partial requirements\\nstate=created-before-first-dispatch\\n"
    );

        const fpDispatch = Object.freeze({
          contract: constructEnginePluginContract({
            ref: "plugin://t085/local-live-attached-worker",
        pluginKind: "fp_dispatch",
        authority: "effect_plugin",
        inputCarrier: "EnginePluginInput",
        outputCarrier: "FpDispatchOutcome"
      }),
      dispatch: (input) => {
        const attempt = (attemptByEdge.get(input.edge) ?? 0) + 1;
        attemptByEdge.set(input.edge, attempt);
        const retryProgressRefs = input.retryProgressRefs.flatMap(
          (entry) => entry.progressSignalRefs
        );
        workerInputs.push({
          edge: input.edge,
          attempt,
          closedVectorIndexes: input.closedVectorIndexes,
          retryAttemptRefs: input.retryAttemptRefs,
          retryProgressRefs,
          sourceProjectionRef: input.sourceProjectionRef
        });

        if (input.edge === "input_set→requirements" && attempt === 1) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: "result://t085/input-set-requirements/attempt-1",
            attachedResultArtifact: artifactFor(
              input,
              "blocked",
              "requirements missing acceptance criteria",
              [partialRequirementsRef]
            ),
            evidenceRefs: [input.sourceProjectionRef, partialRequirementsRef]
          });
        }

        if (input.edge === "input_set→requirements" && attempt === 2) {
          const partial = readFileSync(
            fileURLToPath(partialRequirementsRef),
            "utf8"
          );
          if (!partial.includes("state=created-before-first-dispatch")) {
            throw new Error("second attempt did not see prior workspace state");
          }
          if (input.retryAttemptRefs.length !== 1) {
            throw new Error("second attempt did not receive retry attempt truth");
          }
          if (!retryProgressRefs.some((ref) => ref.includes("missing generated asset"))) {
            throw new Error("second attempt did not receive retry progress truth");
          }
        }

        const evidenceRef = writeArtifact(
          input.edge.replace(/[^a-z0-9]+/giu, "-") + "-attempt-" + attempt + ".md",
          "# Fulfilled " + input.edge + "\\nattempt=" + attempt + "\\n"
        );
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef:
            "result://t085/" + encodeURIComponent(input.edge) + "/attempt-" + attempt,
          attachedResultArtifact: artifactFor(
            input,
            "fulfilled",
            input.edge + " fulfilled by local live attached worker",
            [evidenceRef]
          ),
          evidenceRefs: [input.sourceProjectionRef, evidenceRef]
        });
          }
        });

        const fpEvaluator = Object.freeze({
          contract: constructEnginePluginContract({
            ref: "plugin://t085/local-live-fp-evaluator",
            pluginKind: "fp_evaluator",
            authority: "effect_plugin",
            inputCarrier: "EnginePluginInput",
            outputCarrier: "FpEvaluationOutcome"
          }),
          evaluate: (input) => {
            const attempt = attemptByEdge.get(input.edge) ?? 0;
            return constructFpEvaluationOutcome({
              status: "evaluated",
              findings: [
                constructFpEvaluationFinding({
                  findingRef:
                    "finding://t085/" +
                    encodeURIComponent(input.edge) +
                    "/attempt-" +
                    attempt,
                  evaluatorRef: "plugin://t085/local-live-fp-evaluator",
                  gainReportRef:
                    "gain://t085/" +
                    encodeURIComponent(input.edge) +
                    "/attempt-" +
                    attempt,
                  metricRefs: [
                    "metric://t085/" +
                      encodeURIComponent(input.edge) +
                      "/attempt-" +
                      attempt
                  ],
                  closeDisposition: "close",
                  evidenceRefs: [input.sourceProjectionRef],
                  authorityRefs:
                    input.expectedAssessmentIds.length > 0
                      ? input.expectedAssessmentIds
                      : ["authority://t085/local-live-fp-evaluator"],
                  compositionContributionRef:
                    input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
                  compositionRef: input.selectedCompositionRef,
                  compositionDigest: input.selectedCompositionDigest
                })
              ],
              evidenceRefs: [input.sourceProjectionRef]
            });
          }
        });

        const outcome = publicStart(
          startInput,
      {
        module,
        runtimeIdentity,
        resolvedPolicy,
        runId: "run://t085-attached-fp-local-live",
        workKey: "wk://t085-attached-fp-local-live"
          },
          (event) => events.push(event),
          { fpDispatch, fpEvaluator }
        );

        const eventKinds = events.map((event) => event.kind);
        const assessedEdges = events
          .filter(
            (event) =>
              event.kind === "assessed" ||
              (event.kind === "vector_closed" && event.closureKind === "assessed")
          )
          .map((event) => event.edge);
    const payload = {
      passed:
        outcome.kind === "converged" &&
        outcome.terminalKind === "converged" &&
        workerInputs.length === 4 &&
        workerInputs[1].retryAttemptRefs.length === 1 &&
        workerInputs[1].retryProgressRefs.some((ref) =>
          ref.includes("missing generated asset")
        ) &&
        eventKinds.includes("retry_repair_planned") &&
        eventKinds.includes("continuation_reopened") &&
        eventKinds.includes("retry_progress_recorded") &&
        assessedEdges.length === 3,
      sandboxKind: "local_live_installed_attached_fp",
      packageEntryPath,
      sandboxRoot,
      artifactRoot,
      graphFunctionName: executive.name,
      vectorNames: executiveGraph.vectors.map((vector) => vector.name),
      outcome,
      eventKinds,
      assessedEdges,
      retryEventKinds: eventKinds.filter((kind) => kind.startsWith("retry_")),
      continuationEventKinds: eventKinds.filter((kind) =>
        kind.startsWith("continuation_")
      ),
      workerInputs
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
  await writeFile(
    path.join(archiveRoot, "payload.json"),
    JSON.stringify(input.payload, null, 2),
    "utf8"
  );
  await writeFile(
    path.join(archiveRoot, "postmortem.md"),
    [
      "# T-085 Attached F_P Local Live Sandbox Postmortem",
      "",
      "The installed TypeScript package ran a composed graph function through an attached F_P worker loop.",
      "",
      `- target root: ${input.targetRoot}`,
      `- installed package root: ${input.packageRoot}`,
      `- package entry: ${input.payload.packageEntryPath}`,
      `- sandbox artifact root: ${input.payload.artifactRoot}`,
      `- event count: ${input.payload.eventKinds.length}`,
      `- worker calls: ${input.payload.workerInputs.length}`,
      `- passed: ${input.payload.passed}`,
      "",
      "## Event Kinds",
      "",
      input.payload.eventKinds.map((kind) => `- ${kind}`).join("\n"),
      ""
    ].join("\n"),
    "utf8"
  );
  return archiveRoot;
}

test("T-085 local live sandbox: installed package proves attached F_P retry and convergence", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  const { packageRoot } = await installPackedTenantPackage(targetRoot);

  const run = await runInstalledNodeScript(
    targetRoot,
    attachedFpLocalLiveSandboxSource()
  );

  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);
  const realPackageRoot = await realpath(packageRoot);
  const archiveRoot = await writeArchive({ payload, targetRoot, packageRoot });

  assert.equal(payload.passed, true);
  assert.equal(payload.packageEntryPath.startsWith(realPackageRoot), true);
  assert.equal(payload.outcome.kind, "converged");
  assert.equal(payload.outcome.terminalKind, "converged");
  assert.deepStrictEqual(payload.vectorNames, [
    "input_set→requirements",
    "requirements→design",
    "design→code"
  ]);
  assert.deepStrictEqual(payload.assessedEdges, payload.vectorNames);
  assert.deepStrictEqual(
    payload.workerInputs.map((input) => input.edge),
    [
      "input_set→requirements",
      "input_set→requirements",
      "requirements→design",
      "design→code"
    ]
  );
  assert.equal(payload.workerInputs[1].retryAttemptRefs.length, 1);
  assert.equal(
    payload.workerInputs[1].retryProgressRefs.some((ref) =>
      ref.includes("missing generated asset")
    ),
    true
  );
  assert.deepStrictEqual(
    payload.eventKinds.filter((kind) => kind === "retry_repair_planned"),
    ["retry_repair_planned"]
  );
  assert.deepStrictEqual(
    payload.eventKinds.filter((kind) => kind === "continuation_reopened"),
    ["continuation_reopened"]
  );
  assert.equal(payload.eventKinds.at(-1), "terminal_reached");
  assert.equal(archiveRoot.startsWith(TEST_RUNS_ROOT), true);
});
