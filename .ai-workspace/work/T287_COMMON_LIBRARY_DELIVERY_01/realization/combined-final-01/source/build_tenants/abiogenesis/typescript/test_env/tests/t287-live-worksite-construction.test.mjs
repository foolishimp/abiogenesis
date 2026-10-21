import assert from "node:assert/strict";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";
import { setupInstalledRootExecutionBasis } from
  "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LIVE_GATE = "ABI5_T287_C1_LIVE";
const LIVE_COMMAND = "ABG_TS_LIVE_CLAUDE_COMMAND";
const ACTOR_REF = "actor://abiogenesis/worksite/construction-worker@5";
const PROMPT = [
  "Return the declared worksite construction worker result for the sole schema-fixed target.",
  "Set replacementBase64 to the canonical base64 encoding of the exact UTF-8 text: hello from live generic worksite construction, followed by one LF byte.",
  "Return no prose and call no tools.",
].join("\n");

function runtimeBasis(label) {
  return {
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: `correlation://t287/c1/live/${label}`,
    causationEventRefs: [],
  };
}

function openRootTraversal(environment, label) {
  return environment.abg.openTraversalScope(
    environment.store,
    environment.abg.selectHeldEventStoreDurablePrefix(environment.store),
    { kind: "root", executionBasis: environment.executionBasis },
    runtimeBasis(label),
  );
}

async function snapshotFiles(product, directory, base = directory, rows = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await snapshotFiles(product, path, base, rows);
    } else if (entry.isFile()) {
      rows.push([
        relative(base, path),
        product.sha256Bytes(await readFile(path)),
      ]);
    }
  }
  return new Map(rows);
}

function changedFiles(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter((path) => before.get(path) !== after.get(path))
    .sort();
}

const liveRequested = process.env[LIVE_GATE] === "1";

test("T-287 C1 traverses one installed real-Claude candidate through C0 and fresh replay", {
  timeout: 300_000,
  skip: liveRequested
    ? false
    : "environment://abiogenesis/t287/c1/live-worker-not-requested",
}, async (context) => {
  const liveCommand = process.env[LIVE_COMMAND];
  assert.equal(
    typeof liveCommand === "string" && liveCommand.length > 0,
    true,
    `environment://abiogenesis/t287/c1/live-worker-command-unavailable: ${LIVE_COMMAND} must name the real Claude executable`,
  );

  const builtProduct = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?c1-live-input=${Date.now()}`
  );
  const ids = builtProduct.WORKSITE_CONSTRUCTION_IDS;
  let targetPath;
  let task;
  const environment = await setupInstalledRootExecutionBasis(context, root, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_construction",
    authorizedActorRef: ACTOR_REF,
    actorRef: ACTOR_REF,
    programRef: ids.programRef,
    graphFunctionRef: ids.graphFunctionRef,
    inputContractRef: ids.taskContractRef,
    inputFactory: async ({ product, workspaceBinding, capabilityGrant }) => {
      const relativeRoot = "c1-live-proof";
      const relativePath = `${relativeRoot}/message.txt`;
      await mkdir(join(workspaceBinding.roots.productRoot, relativeRoot), {
        recursive: true,
      });
      targetPath = join(workspaceBinding.roots.productRoot, relativePath);
      const subject = product.constructWorksiteSubject({
        workspaceBinding,
        subjectUri: pathToFileURL(targetPath).href,
        relativePath,
      });
      const territory = product.constructWorksiteTerritory({
        workspaceBinding,
        territoryUri: pathToFileURL(
          join(workspaceBinding.roots.productRoot, relativeRoot),
        ).href,
        relativeRoot,
      });
      const predecessorObservation = await product.observeWorksiteSubject(
        workspaceBinding,
        subject,
      );
      task = product.constructWorksiteConstructionTask({
        workspaceBinding,
        capabilityGrant,
        prompt: PROMPT,
        targets: [{ subject, territory, predecessorObservation }],
      });
      return task;
    },
  });
  assert.ok(targetPath);
  assert.ok(task);
  assert.equal(task.prompt, PROMPT);

  const beforeFiles = await snapshotFiles(
    environment.product,
    environment.workspaceBinding.roots.productRoot,
  );
  const opened = openRootTraversal(environment, "one-target/open");
  assert.equal(
    opened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(opened),
  );
  const traversal = environment.hog.traverse({
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversal.kind, "traversal_cursor", JSON.stringify(traversal));

  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  process.env.ABG_TS_CLAUDE_COMMAND = liveCommand;
  let completion;
  try {
    completion = await environment.hog.executeGraphTraversal({
      store: environment.store,
      predecessorPrefix: opened.successorPrefix,
      executionBasis: environment.executionBasis,
      openedTraversalScope: opened.scope,
      program: environment.program,
      programValidation: environment.programValidation,
      graphFunction: environment.graphFunction,
      graph: environment.graph,
      graphValidation: environment.graphValidation,
      implementationSet: environment.implementationSet,
      interactionSet: environment.executionBasisAdmission.interactionSet,
      leafPort: environment.leafPort,
      actorRuntimeBinding: {
        workspaceBinding: environment.workspaceBinding,
        artifactTruth: environment.artifactTruth,
      },
      input: environment.input,
      inputDigest: environment.rawInput.subjectDigest,
      closureContract: environment.closureContract,
      eventTime: "2026-09-01T00:00:00.000Z",
      correlationId: "correlation://t287/c1/live/one-target/hog",
    });
  } finally {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
  }

  assert.equal(completion.disposition, "closed", JSON.stringify(completion));
  assert.equal(
    environment.product.isWorksiteConstructionResult(completion.resultValue),
    true,
    JSON.stringify(completion),
  );
  assert.equal(completion.resultValue.members.length, 1);

  const events = environment.store.readAll();
  assert.equal(
    events.filter((event) => event.kind === "actor_invocation_started").length,
    1,
  );
  assert.equal(
    events.filter((event) => event.kind === "actor_process_started").length,
    1,
  );
  const processExit = events.find(
    (event) => event.kind === "actor_process_exited",
  );
  assert.ok(processExit);
  assert.equal(processExit.payload.status, 0);
  assert.equal(processExit.payload.signal, null);
  const binding = events.find(
    (event) => event.kind === "actor_transport_binding_admitted",
  );
  assert.ok(binding);
  assert.equal(binding.payload.command, liveCommand);
  assert.equal(binding.payload.lane, "closed_prompt_proof");
  const actorResult = events.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  assert.ok(actorResult);
  assert.equal(actorResult.payload.disposition, "success");
  assert.equal(actorResult.payload.toolCallCount, 0);
  assert.equal(actorResult.payload.promptDigest, task.promptDigest);
  const rawWorkerResult = JSON.parse(actorResult.payload.finalOutput);
  assert.equal(
    environment.product.isWorksiteConstructionWorkerResult(rawWorkerResult),
    true,
  );
  assert.equal(environment.product.isWorksiteCandidateBundle(rawWorkerResult), false);
  assert.equal(rawWorkerResult.files.length, 1);
  assert.equal(rawWorkerResult.files[0].targetRef, task.targets[0].targetRef);
  const replacement = Buffer.from(
    rawWorkerResult.files[0].replacementBase64,
    "base64",
  );
  assert.deepEqual(await readFile(targetPath), replacement);

  const admittedCandidate = events.find(
    (event) => event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === ids.candidateBundleContractRef,
  );
  assert.ok(admittedCandidate);
  assert.equal(admittedCandidate.payload.value.kind, "worksite_candidate_bundle");
  assert.deepEqual(admittedCandidate.payload.value.task, task);
  assert.deepEqual(admittedCandidate.payload.value.files, rawWorkerResult.files);
  assert.notDeepEqual(admittedCandidate.payload.value, rawWorkerResult);
  assert.equal(
    events.filter((event) =>
      event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "worksite_file_replace").length,
    1,
  );
  assert.equal(events.at(-1).kind, "run_closed");

  const afterFiles = await snapshotFiles(
    environment.product,
    environment.workspaceBinding.roots.productRoot,
  );
  assert.deepEqual(changedFiles(beforeFiles, afterFiles), [
    "c1-live-proof/message.txt",
  ]);
  assert.equal(
    afterFiles.get("c1-live-proof/message.txt"),
    environment.product.sha256Bytes(replacement),
  );

  const stdoutEvents = (await readFile(binding.payload.paths.stdout, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  const init = stdoutEvents.find(
    (event) => event.type === "system" && event.subtype === "init",
  );
  assert.equal(typeof init?.model === "string" && init.model.length > 0, true);

  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg: environment.abg,
    product: environment.product,
    installedPackageRoot: environment.installedRoot,
    store: environment.store,
    requests: [{
      rowId: "c1-live-worksite-construction-runtime-truth",
      owner: "abg",
      exportName: "projectRuntimeTruthAtDurablePrefix",
      input: "durable_prefix",
      args: [opened.scope.runId],
    }],
  });
  const freshReplay = freshProof.retainedRows[0].projection.replayState;
  assert.equal(freshReplay.runtimeStatus, "closed");
  assert.deepEqual(
    freshReplay.currentWorksiteObservations.map((row) => row.observation),
    [completion.resultValue.members[0].successorObservation],
  );
  const replayedConstructionResult = freshReplay.cCalls.find(
    (row) => row.resultValue?.kind === "worksite_construction_result",
  );
  assert.ok(replayedConstructionResult);
  assert.deepEqual(replayedConstructionResult.resultValue, completion.resultValue);
});
