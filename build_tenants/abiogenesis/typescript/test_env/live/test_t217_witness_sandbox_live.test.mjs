// T-217 — THE LIVE WITNESS DIFFERENTIAL (the live-gate opener): a REAL
// codex worker turn through the INSTALLED substrate, then the witness
// session over the LIVE record. Born conformant with the live-install
// ruling: the binding imports only the installed package; the engine
// runs as the spawned installed binary; the worker is the configured
// codex CLI (reasoning effort from the operator's codex config; the
// executor profile from ABG_TS_AGENT_EXECUTOR_PROFILE — pty-terminal on
// this gate) under the declared sandbox capability.
//
// gate: ABG_TS_T217_WITNESS_LIVE=1 or CODEX_LIVE_FP=1
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";

// T-109 law: framework exec goes through the ONE traced surface — the
// installed-binary invocations archive their own evidence
import { runTracedProcess } from "../../build/semantic/code/src/shared/traced_process/index.js";

import {
  provisionInstalledRoot,
  installPackedTenantPackage,
  rewriteInstalledPackageImports
} from "../tests/support/m05-installed-fixtures.mjs";

function liveEnabled() {
  return (
    process.env["ABG_TS_T217_WITNESS_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1"
  );
}

function runtimeBindingSource() {
  return `
    import { readFileSync } from "node:fs";
    import { dirname, join } from "node:path";
    import { fileURLToPath } from "node:url";
    import {
      admitModule,
      admitNode,
      admitResolvedPolicyIdentity,
      admitResolvedRuntimeIdentity,
      constructDefaultAbgFnCompositionDeclarations,
      constructDefaultInstructionAssemblyStartupForBasis,
      admitExecutionBasis,
      constructEnginePluginContract,
      constructFpDispatchOutcome,
      contractForKnownAgent,
      defaultFpEvaluatorPlugin,
      edge,
      graphFunctionForVector,
      runAgentTransport
    } from "@abiogenesis/typescript-tenant";

    const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

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

    const design = node("node-t217-live-design", "Design", "design");
    const code = node("node-t217-live-code", "Code", "code");
    const vector = edge([design], code, {
      id: "graph-t217-live",
      name: "design_to_code",
      evaluators: [
        {
          name: "code_complete",
          regime: "F_P",
          description: "design_to_code accepted",
          binding: "binding://t217-live",
          tags: ["fulfillment"]
        }
      ],
      declarations: constructDefaultAbgFnCompositionDeclarations({
        scopeRef: "t217-live/code-flow",
        hostGraphVectorRef: "graph-t217-live"
      })
    }).vectors[0];
    const codeProfile = graphFunctionForVector(vector, {
      id: "graph-function-t217-live",
      name: "code_flow",
      declarations: { entries: [] }
    });

    const module = admitModule({
      name: "t217_live_runtime",
      graphs: [codeProfile.template.graph],
      graphFunctions: [codeProfile],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-t217-live",
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

    function timeoutMs() {
      const parsed = Number.parseInt(
        process.env.ABG_TS_LIVE_TIMEOUT_MS ?? "480000",
        10
      );
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 480000;
    }

    function executorProfileFields() {
      const raw = process.env.ABG_TS_AGENT_EXECUTOR_PROFILE;
      if (raw === undefined || raw.trim().length === 0) {
        return {};
      }
      const normalized = raw.trim();
      if (normalized !== "local-spawn" && normalized !== "pty-terminal") {
        throw new Error("unsupported ABG_TS_AGENT_EXECUTOR_PROFILE=" + raw);
      }
      return { executorProfile: normalized };
    }

    function extractJsonObject(text) {
      const trimmed = text.trim();
      const first = trimmed.indexOf("{");
      const last = trimmed.lastIndexOf("}");
      if (first === -1 || last === -1 || last <= first) {
        throw new Error("live worker response did not contain a JSON object");
      }
      return JSON.parse(trimmed.slice(first, last + 1));
    }

    const fpDispatchPlugin = Object.freeze({
      contract: constructEnginePluginContract({
        ref: "plugin://t217-live/fp-dispatch",
        pluginKind: "fp_dispatch",
        authority: "effect_plugin",
        inputCarrier: "EnginePluginInput",
        outputCarrier: "FpDispatchOutcome"
      }),
      dispatch: async (input) => {
        const archiveRoot = join(
          workspaceRoot,
          ".abiogenesis",
          "t217-live-archive",
          encodeURIComponent(input.edge)
        );
        const prompt = [
          "You are an F_P worker in a sandboxed ABG workspace.",
          "Task: create a file named hello-t217.md in the CURRENT working",
          "directory containing exactly one line: T-217 live witness turn.",
          "Then reply with ONLY a JSON object (no prose, no fences):",
          '{"status":"fulfilled","files":["hello-t217.md"],"note":"<one short sentence>"}',
          "If you could not create the file, reply with",
          '{"status":"blocked","files":[],"note":"<why>"} instead. Truthfulness',
          "outranks success: never claim a file you did not create."
        ].join("\\n");
        const transport = await runAgentTransport({
          contract: contractForKnownAgent("codex"),
          prompt,
          cwd: workspaceRoot,
          archiveRoot,
          label: input.edge,
          timeoutMs: timeoutMs(),
          outputPath: join(archiveRoot, "worker-output.txt"),
          ...executorProfileFields()
        });
        if (transport.status !== 0) {
          throw new Error(
            "live codex transport failed (" + String(transport.status) + "): " +
              String(transport.stderr).slice(0, 400)
          );
        }
        const parsed = extractJsonObject(transport.text);
        const fulfilled = parsed.status === "fulfilled";
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: \`result://t217-live/\${encodeURIComponent(input.edge)}\`,
          attachedResultArtifact: {
            edge: input.expectedEdge ?? input.edge,
            actor: "codex",
            worker_note: String(parsed.note ?? ""),
            worker_files: Array.isArray(parsed.files) ? parsed.files : [],
            fulfillment_assessments: (
              input.expectedAssessmentIds.length > 0
                ? input.expectedAssessmentIds
                : ["runtime_fulfilled"]
            ).map((assessmentId) => ({
              id: assessmentId,
              evaluator: assessmentId,
              fulfillment_status: fulfilled ? "fulfilled" : "blocked",
              fulfillment_detail: fulfilled
                ? "live codex worker fulfilled the turn"
                : "live codex worker truthfully blocked: " + String(parsed.note ?? ""),
              blocking_reasons: fulfilled ? [] : [String(parsed.note ?? "blocked")],
              evidence_refs: [\`archive://t217-live/\${encodeURIComponent(input.edge)}\`]
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

    const runtimeIdentity = admitResolvedRuntimeIdentity({
      workerId: "worker://codex/t217-live",
      backendId: "backend://codex-cli",
      buildId: "build://t217-live",
      resolvedRuntimeRef: "runtime://typescript/node"
    });
    const resolvedPolicy = admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t217-live",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://codex/t217-live"
    });
    // F_P dispatch requires the instruction-assembly startup (the m04
    // binding precedent): default startup for the run's own basis
    const startupFields = constructDefaultInstructionAssemblyStartupForBasis(
      admitExecutionBasis({
        startIntent: {
          scope: {
            kind: "workspace",
            workspaceRoot: process.cwd(),
            moduleName: module.name
          },
          target: { kind: "graph_function", handle: codeProfile.name },
          until: "converged"
        },
        module,
        runtimeIdentity,
        resolvedPolicy,
        runId: "run://t217-live",
        workKey: "wk://t217-live",
        frameId: null,
        frameLineageId: null
      }),
      { prefix: "t217-live-runtime" }
    );

    export const runtimeBinding = {
      module,
      runtimeIdentity,
      resolvedPolicy,
      ...startupFields,
      runId: "run://t217-live",
      workKey: "wk://t217-live",
      plugins: {
        fpDispatch: fpDispatchPlugin,
        fpEvaluator: defaultFpEvaluatorPlugin
      }
      // NOTE: no runtimeRegistryStartup here — the registry-routed flow
      // requires per-entry assembled plans beyond the default startup;
      // the drift/reprice laws are the in-suite RC gate's differential.
      // This live differential proves the WORKER TURN + witness session.
    };
  `;
}

async function runCli(targetRoot, packageRoot, args) {
  const result = await runTracedProcess({
    command: "node",
    args: [
      path.join(packageRoot, "build/semantic/code/src/bin/abiogenesis.js"),
      ...args
    ],
    cwd: targetRoot,
    env: { ...process.env },
    archiveRoot: path.join(targetRoot, ".abiogenesis", "t217-live-cli-trace"),
    label: `genesis-ts ${args[0] ?? ""}`,
    timeoutMs:
      Number.parseInt(process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "480000", 10) +
      60000
  });
  const lines = result.stdout
    .split("\n")
    .filter((line) => line.trim().length > 0);
  let payload = null;
  try {
    payload = JSON.parse(lines[lines.length - 1] ?? "null");
  } catch {
    payload = null;
  }
  return { status: result.status, payload, stderr: result.stderr };
}

test("T-217 LIVE: one codex worker turn through the installed binary, then the witness session over the live record", async (t) => {
  if (!liveEnabled()) {
    t.skip(
      "set ABG_TS_T217_WITNESS_LIVE=1 (or CODEX_LIVE_FP=1) to run the live witness differential"
    );
    return;
  }
  const { targetRoot: provisionedRoot } = await provisionInstalledRoot();
  // macOS mkdtemp returns a /var symlink while process.cwd() realpaths to
  // /private/var — the binding's basis and the CLI's basis must agree on
  // ONE workspaceRoot or the assembled plans miss the run's basis
  const targetRoot = realpathSync(provisionedRoot);
  const { packageRoot } = await installPackedTenantPackage(targetRoot);
  writeFileSync(
    path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
    await rewriteInstalledPackageImports(targetRoot, runtimeBindingSource()),
    "utf8"
  );
  const cli = async (args) => runCli(targetRoot, packageRoot, args);
  const ws = ["--workspace", targetRoot];

  // THE LIVE TURN: the installed binary dispatches the codex worker
  const started = await cli([
    "start", ...ws,
    "--scope", "workspace",
    "--target", "next",
    "--until", "converged"
  ]);
  assert.ok(started.payload, `start emitted JSON (stderr: ${started.stderr})`);
  assert.notEqual(
    started.payload.status,
    "error",
    `start must not error: ${JSON.stringify(started.payload)}`
  );
  const eventLogPath = started.payload.events_path;
  const log = readFileSync(eventLogPath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
  const kinds = log.map((event) => event.kind);
  const terminal = log.findLast((event) => event.kind === "terminal_reached");
  assert.ok(
    kinds.includes("actor_invocation_started") &&
      kinds.includes("actor_invocation_closed"),
    `the live worker invocation is replay truth: kinds=${JSON.stringify([...new Set(kinds)])} terminal=${JSON.stringify(terminal)} start=${JSON.stringify(started.payload)}`
  );
  const artifact = log.find(
    (event) => event.kind === "actor_result_artifact_observed"
  );
  assert.ok(artifact, "the worker's result artifact was admitted");
  assert.equal(artifact.workerId, "worker://codex/t217-live");

  // the worker's ACT is real: the file exists with the demanded content
  const helloPath = path.join(targetRoot, "hello-t217.md");
  assert.ok(existsSync(helloPath), "the worker created the file it claimed");
  assert.match(readFileSync(helloPath, "utf8"), /T-217 live witness turn/u);
  // and the transport archive persisted evidence
  const archiveRoot = path.join(targetRoot, ".abiogenesis", "t217-live-archive");
  assert.ok(existsSync(archiveRoot), "transport evidence archived");
  assert.ok(readdirSync(archiveRoot).length > 0);

  // THE WITNESS SESSION over the live record, one process per act
  const report = await cli(["observe", "report", ...ws]);
  assert.equal(report.status, 0);
  const attest = await cli([
    "witness", "attest", ...ws,
    "--actor", "operator://jim/instrument"
  ]);
  assert.equal(attest.status, 0, attest.stderr);
  const verified = await cli(["observe", "report", ...ws]);
  assert.equal(verified.payload.report.attestations.length, 1);
  assert.equal(verified.payload.report.attestations[0].verified, true);

  // the tuner reads REAL economics from the live record
  const tuneReport = await cli(["tune", "report", ...ws]);
  assert.equal(tuneReport.status, 0);
  const costRows = tuneReport.payload.report.cost_rows;
  assert.ok(costRows.length >= 1, "live cost rows derived");
  assert.match(costRows[0].configurationRef, /codex/u);
  assert.ok(costRows[0].totalDurationMs > 0, "the live turn took real time");

  // the observer over a healthy live record drafts nothing
  const drafts = await cli(["observe", "drafts", ...ws]);
  assert.equal(drafts.status, 0);

  // summary for the gate ledger
  console.log(
    JSON.stringify({
      t217_live: {
        status: started.payload.status,
        control: started.payload.stopped_by ?? null,
        citability: verified.payload.report.citability,
        cost_rows: costRows,
        drafts: drafts.payload.drafts.length,
        executor_profile:
          process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"] ?? "local-spawn"
      }
    })
  );
});
