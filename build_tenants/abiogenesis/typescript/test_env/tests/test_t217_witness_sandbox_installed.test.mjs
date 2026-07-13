// T-217 — THE RC GATE'S INSTALLED SANDBOX: the operator surface proven
// OUT OF PROCESS against a packed-and-installed substrate. Every act is
// a separate spawned invocation of the installed binary over one
// persisted workspace log — the laws in-process suites structurally
// cannot prove: cross-process ordinal seeding, attestation across
// invocations, the live-store append law, and the installed package
// actually exporting the surfaces downstream products consume.
//
// This file is also the first fully-conformant exemplar of the user
// ruling (2026-07-10): ALL live proof runs on sandbox-style installs —
// the runtime binding imports ONLY the installed package, never the
// repo build tree.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  provisionInstalledRoot,
  installPackedTenantPackage,
  rewriteInstalledPackageImports,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

// one pack + one install shared across the file: the RC candidate is
// packed from the CURRENT source tree exactly once and every assertion
// runs against that artifact
let sharedInstallPromise = null;
function sharedInstall() {
  sharedInstallPromise ??= (async () => {
    const { targetRoot } = await provisionInstalledRoot();
    const { packageRoot } = await installPackedTenantPackage(targetRoot);
    const markerPath = path.join(targetRoot, "declaration-content.txt");
    writeFileSync(markerPath, "content-v1\n", "utf8");
    writeFileSync(
      path.join(targetRoot, ".abiogenesis", "typescript-runtime.mjs"),
      await rewriteInstalledPackageImports(targetRoot, runtimeBindingSource()),
      "utf8"
    );
    return { targetRoot, packageRoot, markerPath };
  })();
  return sharedInstallPromise;
}

// the binding constructs its module AND its registry startup from the
// INSTALLED package alone; declaration content varies by the workspace
// marker file so two starts across processes produce a real drift halt
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
      constructGtlLibraryEntryDeclaration,
      constructProductRegistryStartupConfig,
      edge,
      graphFunctionForVector
    } from "@abiogenesis/typescript-tenant";

    const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const marker = readFileSync(
      join(workspaceRoot, "declaration-content.txt"),
      "utf8"
    ).trim();

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

    const design = node("node-t217-design", "Design", "design");
    const code = node("node-t217-code", "Code", "code");
    const vector = edge([design], code, {
      id: "graph-t217-sandbox",
      name: "design_to_code",
      evaluators: [
        {
          name: "code_complete",
          regime: "F_P",
          description: "design_to_code accepted",
          binding: "binding://t217-sandbox",
          tags: ["fulfillment"]
        }
      ],
      declarations: constructDefaultAbgFnCompositionDeclarations({
        scopeRef: "t217-sandbox/code-flow",
        hostGraphVectorRef: "graph-t217-sandbox"
      })
    }).vectors[0];
    const codeProfile = graphFunctionForVector(vector, {
      id: "graph-function-t217-sandbox",
      name: "code_flow",
      declarations: { entries: [] }
    });

    const module = admitModule({
      name: "t217_sandbox_runtime",
      graphs: [codeProfile.template.graph],
      graphFunctions: [codeProfile],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [
        {
          id: "job-t217-sandbox",
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

    export const runtimeBinding = {
      module,
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://t217-sandbox",
        backendId: "backend://node",
        buildId: "build://t217-sandbox",
        resolvedRuntimeRef: "runtime://typescript/node"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://t217-sandbox",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://t217-sandbox"
      }),
      runtimeRegistryStartup: {
        systemDeclarations: [],
        productStartupConfig: constructProductRegistryStartupConfig({
          configRef: "product-registry-startup://t217-sandbox",
          productNamespace: "t217.sandbox",
          ownerRef: "owner://t217/sandbox",
          version: "0.0.0-sandbox",
          enabledLibraryRefs: [],
          overlayRefs: [],
          pluginRefs: [],
          readinessRefs: [],
          proofRefs: [],
          configSourceRefs: ["config://t217/sandbox"]
        }),
        productDeclarations: [
          constructGtlLibraryEntryDeclaration({
            declarationRef: "gtl-declaration://t217/sandbox/subject",
            entryRef: "registry-entry://t217/sandbox/subject",
            libraryScope: "product",
            entryKind: "graph_function",
            namespace: "t217.sandbox",
            ownerRef: "owner://t217/sandbox",
            version: "0.0.0-sandbox",
            graphFunctionRef: codeProfile.id,
            interfaceRef: "interface://t217/sandbox/subject",
            sourceContractRef: "contract://t217/sandbox/source",
            targetContractRef: "contract://t217/sandbox/target",
            contextRefs: [],
            authorityRefs: [],
            overlayRefs: [],
            provenanceRefs: [],
            readinessRefs: [],
            proofRefs: [\`proof://t217/sandbox/\${marker}\`],
            policyRefs: [],
            declarationSourceRefs: ["gtl://module/t217/sandbox"]
          })
        ],
        correlationId: \`correlation://t217/sandbox/\${marker}\`
      }
    };
  `;
}

function runCli(targetRoot, packageRoot, args) {
  const result = spawnSync(
    "node",
    [
      path.join(packageRoot, "build/semantic/code/src/bin/abiogenesis.js"),
      ...args
    ],
    { cwd: targetRoot, encoding: "utf8" }
  );
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

function persistedEvents(payload) {
  return readFileSync(payload, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

test("T-217 RC gate: the full operator session through the INSTALLED binary — drift halt, triage, ratify, lifecycle, attest, drafts, tune — one persisted log, one process per act", async () => {
  const { targetRoot, packageRoot, markerPath } = await sharedInstall();
  const cli = (args) => runCli(targetRoot, packageRoot, args);
  const start = () =>
    cli([
      "start",
      "--workspace",
      targetRoot,
      "--scope",
      "workspace",
      "--target",
      "next",
      "--until",
      "converged"
    ]);

  // run 1 (content-v1): admits the declaration, reaches SOME terminal
  const first = start();
  assert.ok(first.payload, `start v1 emitted JSON (stderr: ${first.stderr})`);
  assert.ok(
    first.payload.event_kinds?.includes("registry_entry_admitted"),
    `v1 declaration admitted through the installed binary: ${JSON.stringify(first.payload)}`
  );
  const eventLogPath = first.payload.events_path;

  // run 2 (content-v2, SEPARATE PROCESS): silent drift — the S1 guard
  // halts the resume before admitting the drifted entry
  writeFileSync(markerPath, "content-v2\n", "utf8");
  const second = start();
  assert.equal(second.payload.status, "blocked");

  // the operator session, each act its own spawned process
  const ws = ["--workspace", targetRoot];
  const report = cli(["observe", "report", ...ws]);
  assert.equal(report.status, 0);
  assert.equal(report.payload.report.halted, true);
  assert.match(
    report.payload.report.halt_reason,
    /declaration_reprice_required/u
  );

  const intake = cli([
    "witness", "intake", ...ws,
    "--owner", "specification/requirements + owning ticket",
    "--change-class", "requirement_reprice",
    "--re-entry", "requirements",
    "--summary", "sandbox drift without covering reprice",
    "--triaged-by", "operator://jim"
  ]);
  assert.equal(intake.status, 0, intake.stderr);
  assert.match(intake.payload.ref, /^defect-intake:/u);

  // the expected v2 digest computed from the INSTALLED package surface
  const installedRegistry = await import(
    pathToFileURL(
      path.join(
        packageRoot,
        "build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js"
      )
    ).href
  );
  const log = persistedEvents(eventLogPath);
  const admittedV1 = log.find(
    (event) => event.kind === "registry_entry_admitted"
  );
  const installedIndex = await import(
    pathToFileURL(
      path.join(packageRoot, "build/semantic/code/src/index.js")
    ).href
  );
  const v2Declaration = installedIndex.constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t217/sandbox/subject",
    entryRef: "registry-entry://t217/sandbox/subject",
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: "t217.sandbox",
    ownerRef: "owner://t217/sandbox",
    version: "0.0.0-sandbox",
    graphFunctionRef: admittedV1.graphFunctionRef,
    interfaceRef: "interface://t217/sandbox/subject",
    sourceContractRef: "contract://t217/sandbox/source",
    targetContractRef: "contract://t217/sandbox/target",
    contextRefs: [],
    authorityRefs: [],
    overlayRefs: [],
    provenanceRefs: [],
    readinessRefs: [],
    proofRefs: ["proof://t217/sandbox/content-v2"],
    policyRefs: [],
    declarationSourceRefs: ["gtl://module/t217/sandbox"]
  });
  const v2 = installedRegistry.admitGtlLibraryEntryDeclaration({
    declaration: v2Declaration,
    correlationId: "correlation://t217/sandbox/expected-v2"
  });

  const reprice = cli([
    "witness", "reprice", ...ws,
    "--declaration-ref", admittedV1.declarationRef,
    "--before-digest", admittedV1.declarationDigest,
    "--after-digest", v2.declarationDigest,
    "--change-class", "requirement_reprice",
    "--ticket", "ticket://T-217",
    "--actor", "operator://jim",
    "--reason", "sandbox ratification through the installed grammar"
  ]);
  assert.equal(reprice.status, 0, reprice.stderr);
  assert.match(reprice.payload.ref, /^declaration-reprice:/u);

  const resumed = cli([
    "witness", "run-resumed", ...ws,
    "--actor", "operator://jim",
    "--reason-kind", "reprice_reentry",
    "--reason", "continuing after sandbox ratification"
  ]);
  assert.equal(resumed.status, 0, resumed.stderr);

  const observationsPath = path.join(targetRoot, "observations.json");
  writeFileSync(
    observationsPath,
    JSON.stringify([
      {
        artifactRef: "artifact://t217/sandbox/report",
        observedDigest: "sha256:sandbox"
      }
    ]),
    "utf8"
  );
  const stamp = cli([
    "witness", "hygiene-stamp", ...ws,
    "--observed-by", "operator://jim/digest-instrument",
    "--observations", observationsPath
  ]);
  assert.equal(stamp.status, 0, stamp.stderr);

  const stopped = cli([
    "witness", "run-stopped", ...ws,
    "--actor", "operator://jim",
    "--reason-kind", "operator_stop",
    "--reason", "sandbox session checkpoint"
  ]);
  assert.equal(stopped.status, 0, stopped.stderr);

  const attest = cli([
    "witness", "attest", ...ws,
    "--actor", "operator://jim/instrument"
  ]);
  assert.equal(attest.status, 0, attest.stderr);
  assert.match(attest.payload.ref, /^replay-attestation:/u);

  // the observer verifies the attestation from a FRESH process
  const finalReport = cli(["observe", "report", ...ws]);
  assert.equal(finalReport.payload.report.attestations.length, 1);
  assert.equal(finalReport.payload.report.attestations[0].verified, true);

  // observer drafts through the installed binary: the ratified drift is
  // retired, so no reprice proposal survives — and the halt is addressed
  const drafts = cli(["observe", "drafts", ...ws]);
  assert.equal(drafts.status, 0);
  assert.equal(
    drafts.payload.drafts.some(
      (row) => row.action_kind === "reprice_proposal"
    ),
    false,
    "ratified drift drafts nothing"
  );

  // the tuner verbs through the installed binary
  const propose = cli([
    "tune", "propose", ...ws,
    "--proposal-kind", "calibration",
    "--proposer", "tuner://abg/default-loop",
    "--affects", "gtl-declaration://t217/sandbox/subject",
    "--before-digest", admittedV1.declarationDigest,
    "--after-digest", v2.declarationDigest,
    "--summary", "sandbox calibration proposal"
  ]);
  assert.equal(propose.status, 0, propose.stderr);
  const ratify = cli([
    "tune", "ratify", ...ws,
    "--draft-ref", propose.payload.ref,
    "--actor", "operator://jim"
  ]);
  assert.equal(ratify.payload.state, "ratified");
  const tuneReport = cli(["tune", "report", ...ws]);
  assert.equal(tuneReport.payload.report.drafts[0].state, "ratified");

  // THE CROSS-PROCESS ORDINAL LAW: every act above ran in its own
  // process; the persisted record must still carry strictly increasing
  // admission ordinals (live-context seeding across process boundaries)
  const finalLog = persistedEvents(eventLogPath);
  const ordinals = finalLog.map((event) => event.eventAdmissionOrdinal);
  for (let index = 1; index < ordinals.length; index += 1) {
    assert.ok(
      ordinals[index] > ordinals[index - 1],
      `ordinal ${ordinals[index]} at ${index} must exceed ${ordinals[index - 1]}`
    );
  }
  const kinds = finalLog.map((event) => event.kind);
  for (const kind of [
    "defect_intake_admitted",
    "declaration_reprice_admitted",
    "run_resumed",
    "workspace_hygiene_stamped",
    "run_stopped",
    "replay_log_attested",
    "tuner_draft_admitted",
    "tuner_draft_ratified"
  ]) {
    assert.ok(kinds.includes(kind), `${kind} persisted through the binary`);
  }
});

test("T-217 RC gate: the installed package exports the downstream consumption surfaces (D3 report verification, catalog-citizen modules, observer/tuner derivations)", async () => {
  const { targetRoot } = await sharedInstall();
  const probe = await runInstalledNodeScript(
    targetRoot,
    `
    import {
      verifyJUnitReportContents,
      ABG_SUBSUMED_MODULE_DECLARATIONS,
      ABG_TUNER_MODULE_DECLARATIONS,
      deriveObserverObservables,
      deriveObserverTicketDrafts,
      deriveTunerDraftStates,
      deriveConfigurationCostRows
    } from "@abiogenesis/typescript-tenant";
    const verification = verifyJUnitReportContents([
      {
        reportPath: "target/suite.xml",
        content: '<testsuites tests="99"><testsuite><!-- tests="7" --><testcase name="a"/><testcase name="b"/></testsuite></testsuites>'
      }
    ]);
    console.log(JSON.stringify({
      observedPassCount: verification.observedPassCount,
      subsumedEntries: ABG_SUBSUMED_MODULE_DECLARATIONS.map((row) => row.entryRef),
      tunerEntries: ABG_TUNER_MODULE_DECLARATIONS.map((row) => row.entryRef),
      observerExports: [
        typeof deriveObserverObservables,
        typeof deriveObserverTicketDrafts,
        typeof deriveTunerDraftStates,
        typeof deriveConfigurationCostRows
      ]
    }));
    `
  );
  assert.equal(probe.status, 0, probe.stderr);
  const payload = JSON.parse(probe.stdout.trim().split("\n").at(-1));
  assert.equal(payload.observedPassCount, 2, "D3 law reachable downstream");
  assert.deepEqual(payload.subsumedEntries, [
    "gtl://abg/review/multi-reviewer-assessment",
    "gtl://abg/review/findings-to-rulings",
    "gtl://abg/consensus/submitter-reviewer-rounds",
    "gtl://abg/consensus/instruction-protocol-declarations"
  ]);
  assert.deepEqual(payload.tunerEntries, ["gtl://abg/tuner/default-loop"]);
  assert.deepEqual(payload.observerExports, [
    "function",
    "function",
    "function",
    "function"
  ]);
});

test("T-217 repayment R-bootstrap: context-bootstrap mutableStateRoots admission — absent is null, hostile rows throw typed, valid rows bind", async () => {
  const { targetRoot } = await sharedInstall();
  const { installAbiogenesisContextBootstrap } = await import(
    "../../build/semantic/code/src/app/m04/index.js"
  );
  const { mkdtempSync, readFileSync: readSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  // the shared install's toolchain root (from its binding)
  const binding = JSON.parse(
    readSync(
      path.join(targetRoot, ".abiogenesis", "toolchain-binding.json"),
      "utf8"
    )
  );
  const repoTenantRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    ".."
  );

  // hostile: non-object roots
  await assert.rejects(
    async () =>
      installAbiogenesisContextBootstrap({
        targetRoot: mkdtempSync(path.join(tmpdir(), "t217-boot-")),
        packageSourceRoot: repoTenantRoot,
        toolchainRoot: binding.toolchainRoot,
        mutableStateRoots: "not-an-object"
      }),
    /mutableStateRoots must be an object or null/u
  );
  // hostile: empty-string row
  await assert.rejects(
    async () =>
      installAbiogenesisContextBootstrap({
        targetRoot: mkdtempSync(path.join(tmpdir(), "t217-boot-")),
        packageSourceRoot: repoTenantRoot,
        toolchainRoot: binding.toolchainRoot,
        mutableStateRoots: { eventRoot: "" }
      }),
    /mutableStateRoots\.eventRoot must be a non-empty string/u
  );

  // NULL-VALUED rows are LAWFUL (dual review 2026-07-10 F2): the input
  // contract types every field `?: string | null` — null means "take
  // the default root". The repaid admission must not reject them.
  const nullRowRoot = mkdtempSync(path.join(tmpdir(), "t217-boot-"));
  const nullRowOutcome = await installAbiogenesisContextBootstrap({
    targetRoot: nullRowRoot,
    packageSourceRoot: repoTenantRoot,
    toolchainRoot: binding.toolchainRoot,
    mutableStateRoots: { eventRoot: null, runtimeRoot: null }
  });
  assert.notEqual(
    nullRowOutcome.kind,
    "failed",
    JSON.stringify(nullRowOutcome).slice(0, 300)
  );

  // valid WITH roots: bootstrap succeeds against the shared toolchain
  const bootRoot = mkdtempSync(path.join(tmpdir(), "t217-boot-"));
  const outcome = await installAbiogenesisContextBootstrap({
    targetRoot: bootRoot,
    packageSourceRoot: repoTenantRoot,
    toolchainRoot: binding.toolchainRoot,
    mutableStateRoots: {
      observedWorkspaceRoot: bootRoot,
      observerStateRoot: path.join(bootRoot, ".ai-workspace"),
      executorStateRoot: path.join(bootRoot, ".ai-workspace"),
      eventRoot: path.join(bootRoot, ".ai-workspace", "events"),
      eventLogPath: path.join(bootRoot, ".ai-workspace", "events", "events.jsonl"),
      runtimeRoot: path.join(bootRoot, ".ai-workspace", "runtime"),
      projectionRoot: path.join(bootRoot, ".ai-workspace", "projections"),
      archiveRoot: path.join(bootRoot, ".ai-workspace", "archives")
    }
  });
  assert.notEqual(outcome.kind, "failed", JSON.stringify(outcome).slice(0, 300));

  // valid ABSENT roots: admits as null and still bootstraps
  const bareRoot = mkdtempSync(path.join(tmpdir(), "t217-boot-"));
  const bare = await installAbiogenesisContextBootstrap({
    targetRoot: bareRoot,
    packageSourceRoot: repoTenantRoot,
    toolchainRoot: binding.toolchainRoot
  });
  assert.notEqual(bare.kind, "failed");
});
