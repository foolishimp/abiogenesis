import assert from "node:assert/strict";
import { chmod, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";
import { setupInstalledRootExecutionBasis } from
  "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACTOR_REF = "actor://abiogenesis/worksite/construction-worker@5";
const PROMPT = [
  "Return the declared worksite construction worker result.",
  "The response schema fixes the only target identity.",
  "Use the replacement bytes supplied by this deterministic proof transport.",
].join("\n");
const REPLACEMENT = Buffer.from("hello from generic worksite construction\n");

function runtimeBasis(label) {
  return {
    eventTime: "2026-09-01T00:00:00.000Z",
    correlationId: `correlation://t287/c1/${label}`,
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

async function installDeterministicClaude(environment) {
  const command = join(environment.scratch, "c1-bin", "claude");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const schemaFlag = process.argv.indexOf('--json-schema');",
    "  if (schemaFlag < 0 || process.argv[schemaFlag + 1] === undefined) throw new Error('missing task-derived result schema');",
    "  const schema = JSON.parse(process.argv[schemaFlag + 1]);",
    "  const filesSchema = schema.properties.files;",
    "  if ('prefixItems' in filesSchema || Array.isArray(filesSchema.items)) " +
      "throw new Error('unsupported tuple-array response schema');",
    "  const targetRefSchema = filesSchema.items.properties.targetRef;",
    "  const targetRefs = targetRefSchema.enum ?? [targetRefSchema.const];",
    "  if (filesSchema.minItems !== 1 || 'maxItems' in filesSchema) " +
      "throw new Error('unsupported response schema cardinality constraint');",
    "  if (filesSchema.items.properties.replacementBase64.pattern.includes('?:')) " +
      "throw new Error('unsupported response schema regex group');",
    `  const replacementBase64 = ${JSON.stringify(REPLACEMENT.toString("base64"))};`,
    "  const result = {",
    "    kind: 'worksite_construction_worker_result',",
    "    schemaVersion: '5.0.0',",
    "    files: targetRefs.map((targetRef) => ({",
    "      kind: 'worksite_candidate_file',",
    "      schemaVersion: '5.0.0',",
    "      targetRef,",
    "      replacementBase64,",
    "    })),",
    "  };",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init', model: 'deterministic-c1-proof' }));",
    "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'candidate ready' }] } }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) }));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
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

function captureLeafCalls(leafPort, retained) {
  const delegated = Object.fromEntries(
    Object.entries(leafPort).map(([key, value]) => [
      key,
      typeof value === "function" ? value.bind(leafPort) : value,
    ]),
  );
  delegated.invoke = async (call) => {
    const outcome = await leafPort.invoke(call);
    retained.push({ call, outcome });
    return outcome;
  };
  return Object.freeze(delegated);
}

test("T-287 C1 remains singular inside the C3 composite publication", async () => {
  const nonce = Date.now();
  const gtl = await import(
    `${pathToFileURL(join(root, "build/code/src/gtl/index.js")).href}?c1-publication=${nonce}`
  );
  const product = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?c1-publication=${nonce}`
  );
  const manifest = JSON.parse(
    await readFile(join(root, "product-toolchain-manifest.json"), "utf8"),
  );
  const ids = product.WORKSITE_CONSTRUCTION_IDS;
  const branchIds = product.WORKSITE_BRANCH_CONSTRUCTION_IDS;
  const publication = gtl.constructWorksiteConstructionModulePublication({
    productId: manifest.productId,
    artifactDigest: `sha256:${"0".repeat(64)}`,
    productContentDigest: manifest.productContentDigest,
    productManifestDigest: `sha256:${"0".repeat(64)}`,
    packageName: manifest.packageName,
    packageVersion: manifest.packageVersion,
  });

  assert.equal(publication.moduleRef, ids.moduleRef);
  assert.equal(publication.programs.length, 3);
  assert.equal(publication.graphFunctions.length, 7);
  assert.equal(publication.implementationBindings.length, 6);
  const constructionProgram = publication.programs.find(
    (candidate) => candidate.programRef === ids.programRef,
  );
  const c0Program = publication.programs.find(
    (candidate) => candidate.programRef === gtl.WORKSITE_C0_IDS.programRef,
  );
  assert.ok(constructionProgram);
  assert.ok(c0Program);
  assert.equal(constructionProgram.moduleRef, ids.moduleRef);
  assert.equal(c0Program.moduleRef, ids.moduleRef);
  assert.deepEqual([...constructionProgram.callableMembership].sort(), [
    ids.graphFunctionRef,
    ids.vectorApplicationGraphFunctionRef,
    ids.fileReplaceGraphFunctionRef,
    ids.reducerGraphFunctionRef,
  ].sort());
  assert.deepEqual(c0Program.callableMembership, [ids.fileReplaceGraphFunctionRef]);

  const leafCensus = Object.fromEntries(publication.graphFunctions.map(
    (graphFunction) => [
      graphFunction.name,
      graphFunction.template.nodes.reduce(
        (count, node) => count + gtl.cLeafTerms(node.term).length,
        0,
      ),
    ],
  ));
  assert.deepEqual(leafCensus, {
    [branchIds.graphFunctionRef]: 1,
    [branchIds.branchApplicationGraphFunctionRef]: 0,
    [branchIds.reducerGraphFunctionRef]: 1,
    [ids.graphFunctionRef]: 2,
    [ids.vectorApplicationGraphFunctionRef]: 0,
    [ids.fileReplaceGraphFunctionRef]: 1,
    [ids.reducerGraphFunctionRef]: 1,
  });

  const rootGraphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === ids.graphFunctionRef,
  );
  const vectorGraphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === ids.vectorApplicationGraphFunctionRef,
  );
  const c0GraphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === ids.fileReplaceGraphFunctionRef,
  );
  const reducerGraphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === ids.reducerGraphFunctionRef,
  );
  assert.ok(rootGraphFunction);
  assert.ok(vectorGraphFunction);
  assert.ok(c0GraphFunction);
  assert.ok(reducerGraphFunction);
  assert.equal(
    rootGraphFunction.declarations["abg.child_closure_contract"],
    ids.childClosureContractRef,
  );
  assert.equal(
    rootGraphFunction.declarations["abg.raw_result_contract"],
    ids.workerResultContractRef,
  );
  assert.equal(rootGraphFunction.outputs.includes(ids.workerResultContractRef), false);
  assert.equal(
    vectorGraphFunction.declarations["abg.failure_contract"],
    ids.vectorApplicationFailureContractRef,
  );
  assert.equal(
    c0GraphFunction.declarations["abg.child_closure_contract"],
    gtl.WORKSITE_C0_IDS.childClosureContractRef,
  );
  assert.equal(
    reducerGraphFunction.declarations["abg.failure_contract"],
    ids.failureContractRef,
  );
  const rawContract = publication.contracts.find(
    (candidate) => candidate.contractRef === ids.workerResultContractRef,
  );
  assert.equal(rawContract?.contractKind, "output");
  assert.notEqual(ids.workerResultContractRef, ids.candidateBundleContractRef);

  const c0Contribution = publication.contributions.find(
    (candidate) => candidate.handle === ids.fileReplaceGraphFunctionRef,
  );
  assert.ok(c0Contribution);
  assert.deepEqual(c0Contribution.programMembershipRefs, [
    branchIds.programRef,
    ids.programRef,
    gtl.WORKSITE_C0_IDS.programRef,
  ]);
  assert.equal(
    publication.contributions.filter(
      (candidate) => candidate.handle === ids.fileReplaceGraphFunctionRef,
    ).length,
    1,
  );

  const staticBindings = manifest.contributionManifest.publicationBindings
    .filter((candidate) => candidate.moduleRef === ids.moduleRef);
  assert.equal(staticBindings.length, 1);
  assert.equal(
    staticBindings[0].publicationDigest,
    product.modulePublicationSemanticDigest(publication),
  );
  assert.equal(
    manifest.contributionManifest.publicationBindings.some(
      (candidate) => candidate.moduleRef === gtl.WORKSITE_C0_IDS.moduleRef,
    ),
    false,
  );
  const staticGraphRows = manifest.contributionManifest.rows.filter(
    (row) => row.moduleRef === ids.moduleRef && row.kind === "graph_function",
  );
  assert.deepEqual(
    staticGraphRows.map((row) => row.handle).sort(),
    publication.contributions.map((row) => row.handle).sort(),
  );
});

test("T-287 C1 traverses one installed fake-Claude candidate through C0 and fresh replay", {
  timeout: 180_000,
}, async (context) => {
  const builtProduct = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?c1-input=${Date.now()}`
  );
  const ids = builtProduct.WORKSITE_CONSTRUCTION_IDS;
  let targetPath;
  let task;
  let predecessorObservation;
  const environment = await setupInstalledRootExecutionBasis(context, root, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_construction",
    authorizedActorRef: ACTOR_REF,
    actorRef: ACTOR_REF,
    programRef: ids.programRef,
    graphFunctionRef: ids.graphFunctionRef,
    inputContractRef: ids.taskContractRef,
    inputFactory: async ({ product, workspaceBinding, capabilityGrant }) => {
      const relativeRoot = "c1-proof";
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
      predecessorObservation = await product.observeWorksiteSubject(
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
  assert.equal(predecessorObservation.state, "absent");
  assert.equal(environment.product.isWorksiteConstructionTask(task), true);
  assert.equal(task.prompt, PROMPT);
  assert.equal(task.targets.length, 1);

  const oneTargetResponseSchema =
    environment.product.worksiteConstructionWorkerResultSchema(task);
  const oneTargetFilesSchema = oneTargetResponseSchema.properties.files;
  assert.equal("prefixItems" in oneTargetFilesSchema, false);
  assert.equal(Array.isArray(oneTargetFilesSchema.items), false);
  assert.equal(oneTargetFilesSchema.minItems, 1);
  assert.equal("maxItems" in oneTargetFilesSchema, false);
  assert.equal(
    oneTargetFilesSchema.items.properties.targetRef.const,
    task.targets[0].targetRef,
  );
  assert.equal(
    oneTargetFilesSchema.items.properties.replacementBase64.pattern,
    "^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
  );

  const validRawWorkerResult = {
    kind: "worksite_construction_worker_result",
    schemaVersion: "5.0.0",
    files: [{
      kind: "worksite_candidate_file",
      schemaVersion: "5.0.0",
      targetRef: task.targets[0].targetRef,
      replacementBase64: REPLACEMENT.toString("base64"),
    }],
  };
  assert.equal(
    environment.product.isWorksiteConstructionWorkerResult(validRawWorkerResult),
    true,
  );
  assert.equal(environment.product.isWorksiteCandidateBundle(validRawWorkerResult), false);
  assert.throws(
    () => environment.product.constructWorksiteConstructionWorkerResult(
      task,
      { ...validRawWorkerResult, workspaceBinding: task.workspaceBinding },
    ),
    /task-derived closed value/u,
  );
  assert.throws(
    () => environment.product.constructWorksiteConstructionWorkerResult(
      task,
      { ...validRawWorkerResult, files: [] },
    ),
    /task-derived closed value/u,
  );

  const vectorGraphFunction = environment.publication.graphFunctions.find(
    (candidate) => candidate.name === ids.vectorApplicationGraphFunctionRef,
  );
  const c0GraphFunction = environment.publication.graphFunctions.find(
    (candidate) => candidate.name === ids.fileReplaceGraphFunctionRef,
  );
  const reducerGraphFunction = environment.publication.graphFunctions.find(
    (candidate) => candidate.name === ids.reducerGraphFunctionRef,
  );
  assert.ok(vectorGraphFunction);
  assert.ok(c0GraphFunction);
  assert.ok(reducerGraphFunction);
  const installedCCall = await import(
    `${pathToFileURL(join(environment.installedRoot, "build/code/src/abg/c_call.js")).href}?c1-failure=${Date.now()}`
  );
  const resolveFailure = (childGraphFunction) =>
    installedCCall.resolveWorkflowFailureContract({
      childGraphFunction,
      programValidation: environment.programValidation,
      implementationSet: environment.implementationSet,
    });
  assert.deepEqual(resolveFailure(vectorGraphFunction), {
    kind: "workflow_failure_contract_resolution",
    schemaVersion: "5.0.0",
    disposition: "resolved",
    childGraphFunctionRef: ids.vectorApplicationGraphFunctionRef,
    childGraphFunctionDigest: environment.product.sha256Canonical(
      vectorGraphFunction,
    ),
    failureContractRef: ids.vectorApplicationFailureContractRef,
    source: "declared",
  });
  assert.equal(resolveFailure(c0GraphFunction).source, "legacy_row");
  assert.equal(resolveFailure(reducerGraphFunction).source, "declared_row_agreement");
  const missingFailureDeclaration = structuredClone(vectorGraphFunction);
  delete missingFailureDeclaration.declarations["abg.failure_contract"];
  const eventCountBeforeFailureNegative = environment.store.readAll().length;
  const failureRefusal = resolveFailure(missingFailureDeclaration);
  assert.equal(failureRefusal.kind, "workflow_failure_contract_refusal");
  assert.equal(failureRefusal.code, "workflow-failure-contract-ambiguous");
  assert.equal(environment.store.readAll().length, eventCountBeforeFailureNegative);

  const command = await installDeterministicClaude(environment);
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
  const traversalStop = environment.hog.traverse({
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversalStop.kind, "traversal_cursor", JSON.stringify(traversalStop));

  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  process.env.ABG_TS_CLAUDE_COMMAND = command;
  const retainedLeafCalls = [];
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
      leafPort: captureLeafCalls(environment.leafPort, retainedLeafCalls),
      actorRuntimeBinding: {
        workspaceBinding: environment.workspaceBinding,
        artifactTruth: environment.artifactTruth,
      },
      input: environment.input,
      inputDigest: environment.rawInput.subjectDigest,
      closureContract: environment.closureContract,
      eventTime: "2026-09-01T00:00:00.000Z",
      correlationId: "correlation://t287/c1/one-target/hog",
    });
  } finally {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
  }
  if (completion.disposition !== "closed") {
    context.diagnostic(JSON.stringify(retainedLeafCalls.map(({ call, outcome }) => ({
      cCallRef: call.occurrence.cCallRef,
      graphFunctionRef: call.occurrence.executionAuthority?.graphFunctionRef ?? null,
      implementationRef: call.resolution.implementationRef,
      inputKind: call.input.kind,
      hasExecutionAuthority: call.occurrence.executionAuthority !== null,
      outcomeDisposition: outcome.candidate?.disposition ?? outcome.code,
      outcomeFailureClass: outcome.candidate?.resultCandidate?.failureClass ?? null,
      ownerReceipt: outcome.receipt !== null,
    }))));
  }
  assert.equal(completion.disposition, "closed", JSON.stringify(completion));
  const c0OwnerReceipts = retainedLeafCalls.filter(({ call }) =>
    call.occurrence.executionAuthority?.graphFunctionRef ===
      ids.fileReplaceGraphFunctionRef
  );
  assert.equal(c0OwnerReceipts.length, 1);
  assert.notEqual(
    c0OwnerReceipts[0].call.occurrence.executionAuthority,
    null,
    "the admitted nested C0 basis must carry exact leaf execution authority",
  );
  assert.equal(c0OwnerReceipts[0].outcome.kind, "closed_leaf_owner_receipt");
  assert.equal(c0OwnerReceipts[0].outcome.computeRegime, "F_D");
  assert.equal(c0OwnerReceipts[0].outcome.candidate.disposition, "success");
  assert.notEqual(
    c0OwnerReceipts[0].outcome.receipt,
    null,
    "a successful C0 mutation must have an owner invocation receipt",
  );
  assert.equal(
    environment.product.isWorksiteConstructionResult(completion.resultValue),
    true,
    JSON.stringify(completion),
  );
  assert.equal(completion.resultValue.members.length, 1);
  assert.deepEqual(await readFile(targetPath), REPLACEMENT);
  assert.equal(
    completion.resultValue.members[0].successorObservation.subjectRef,
    task.targets[0].subject.subjectRef,
  );

  const afterFiles = await snapshotFiles(
    environment.product,
    environment.workspaceBinding.roots.productRoot,
  );
  assert.deepEqual(changedFiles(beforeFiles, afterFiles), ["c1-proof/message.txt"]);
  assert.equal(beforeFiles.has("c1-proof/message.txt"), false);
  assert.equal(
    afterFiles.get("c1-proof/message.txt"),
    environment.product.sha256Bytes(REPLACEMENT),
  );

  const events = environment.store.readAll();
  const actorResult = events.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  assert.ok(actorResult);
  assert.equal(actorResult.payload.toolCallCount, 0);
  assert.equal(actorResult.payload.promptDigest, task.promptDigest);
  const rawWorkerResult = JSON.parse(actorResult.payload.finalOutput);
  assert.deepEqual(rawWorkerResult, validRawWorkerResult);
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
  assert.equal(
    events.filter((event) => event.kind === "actor_invocation_started").length,
    1,
  );
  assert.equal(events.at(-1).kind, "run_closed");

  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg: environment.abg,
    product: environment.product,
    installedPackageRoot: environment.installedRoot,
    store: environment.store,
    requests: [{
      rowId: "c1-worksite-construction-runtime-truth",
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

test("T-287 C1 retains an exact partial prefix when a later C0 member refuses", {
  timeout: 180_000,
}, async (context) => {
  const builtProduct = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?c1-partial-input=${Date.now()}`
  );
  const ids = builtProduct.WORKSITE_CONSTRUCTION_IDS;
  const staleBytes = Buffer.from("external member-one change after O0\n");
  const targetPaths = [];
  const predecessorObservations = [];
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
      const relativeRoot = "c1-partial-proof";
      await mkdir(join(workspaceBinding.roots.productRoot, relativeRoot), {
        recursive: true,
      });
      const territory = product.constructWorksiteTerritory({
        workspaceBinding,
        territoryUri: pathToFileURL(
          join(workspaceBinding.roots.productRoot, relativeRoot),
        ).href,
        relativeRoot,
      });
      const targets = [];
      for (const ordinal of [0, 1, 2]) {
        const relativePath = `${relativeRoot}/member-${ordinal}.txt`;
        const targetPath = join(
          workspaceBinding.roots.productRoot,
          relativePath,
        );
        targetPaths.push(targetPath);
        const subject = product.constructWorksiteSubject({
          workspaceBinding,
          subjectUri: pathToFileURL(targetPath).href,
          relativePath,
        });
        const predecessorObservation = await product.observeWorksiteSubject(
          workspaceBinding,
          subject,
        );
        predecessorObservations.push(predecessorObservation);
        targets.push({ subject, territory, predecessorObservation });
      }
      task = product.constructWorksiteConstructionTask({
        workspaceBinding,
        capabilityGrant,
        prompt: PROMPT,
        targets,
      });
      return task;
    },
  });
  assert.ok(task);
  assert.equal(task.targets.length, 3);
  assert.deepEqual(
    predecessorObservations.map((observation) => observation.state),
    ["absent", "absent", "absent"],
  );

  const responseSchema =
    environment.product.worksiteConstructionWorkerResultSchema(task);
  const filesSchema = responseSchema.properties.files;
  assert.equal("prefixItems" in filesSchema, false);
  assert.equal(Array.isArray(filesSchema.items), false);
  assert.equal(filesSchema.minItems, 1);
  assert.equal("maxItems" in filesSchema, false);
  assert.deepEqual(
    filesSchema.items.properties.targetRef.enum,
    task.targets.map((target) => target.targetRef),
  );

  const validRawWorkerResult = {
    kind: "worksite_construction_worker_result",
    schemaVersion: "5.0.0",
    files: task.targets.map((target) => ({
      kind: "worksite_candidate_file",
      schemaVersion: "5.0.0",
      targetRef: target.targetRef,
      replacementBase64: REPLACEMENT.toString("base64"),
    })),
  };
  assert.doesNotThrow(() =>
    environment.product.constructWorksiteConstructionWorkerResult(
      task,
      validRawWorkerResult,
    ));
  assert.throws(
    () => environment.product.constructWorksiteConstructionWorkerResult(
      task,
      {
        ...validRawWorkerResult,
        files: validRawWorkerResult.files.slice(0, -1),
      },
    ),
    /exact target cardinality and order/u,
  );
  assert.throws(
    () => environment.product.constructWorksiteConstructionWorkerResult(
      task,
      {
        ...validRawWorkerResult,
        files: [...validRawWorkerResult.files].reverse(),
      },
    ),
    /exact target cardinality and order/u,
  );
  assert.throws(
    () => environment.product.constructWorksiteConstructionWorkerResult(
      task,
      {
        ...validRawWorkerResult,
        files: validRawWorkerResult.files.map((file, ordinal) =>
          ordinal === 0 ? { ...file, targetRef: "target://unknown" } : file),
      },
    ),
    /exact target cardinality and order/u,
  );

  await writeFile(targetPaths[1], staleBytes);
  const beforeFiles = await snapshotFiles(
    environment.product,
    environment.workspaceBinding.roots.productRoot,
  );
  const command = await installDeterministicClaude(environment);
  const opened = openRootTraversal(environment, "partial-stop/open");
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
  process.env.ABG_TS_CLAUDE_COMMAND = command;
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
      correlationId: "correlation://t287/c1/partial-stop/hog",
    });
  } finally {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
  }

  assert.equal(completion.disposition, "failed", JSON.stringify(completion));
  assert.equal(
    environment.product.isWorksiteConstructionVectorApplicationFailure(
      completion.resultValue,
    ),
    true,
    JSON.stringify(completion),
  );
  assert.deepEqual(completion.resultValue, {
    kind: "worksite_construction_vector_application_failure",
    schemaVersion: "5.0.0",
    failureClass: "child_traversal_failed",
    diagnosticRef: completion.diagnosticRef,
  });
  assert.doesNotMatch(
    completion.diagnosticRef,
    /result-contract-mismatch/u,
  );

  const events = environment.store.readAll();
  const c0Calls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === ids.fileReplaceGraphFunctionRef,
  );
  assert.equal(c0Calls.length, 2);
  assert.equal(
    events.some(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef === ids.reducerGraphFunctionRef,
    ),
    false,
    "the reducer must not open for a partial output vector",
  );
  const partial = events.find(
    (event) =>
      event.kind === "fan_out_completion_admitted" &&
      event.payload.completionKind === "partial_stop",
  );
  assert.ok(partial);
  assert.deepEqual(partial.payload.completedRows.map((row) => row.ordinal), [0]);
  assert.equal(partial.payload.stoppingRow.ordinal, 1);
  assert.deepEqual(partial.payload.unstartedRows.map((row) => row.ordinal), [2]);
  assert.equal(Object.hasOwn(partial.payload, "outputVector"), false);

  const staleChildFailure = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === environment.gtl.WORKSITE_C0_IDS.failureContractRef &&
      event.payload.value.code === "stale_observation",
  );
  assert.ok(staleChildFailure);
  const vectorFailure = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === ids.vectorApplicationFailureContractRef,
  );
  assert.ok(vectorFailure);
  assert.deepEqual(vectorFailure.payload.value, completion.resultValue);
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload.contractRef === ids.resultContractRef,
    ),
    false,
  );
  assert.equal(
    events.some((event) => event.kind === "runtime_failure_observed"),
    false,
  );
  assert.equal(events.at(-1).kind, "run_stopped");

  const afterFiles = await snapshotFiles(
    environment.product,
    environment.workspaceBinding.roots.productRoot,
  );
  assert.deepEqual(changedFiles(beforeFiles, afterFiles), [
    "c1-partial-proof/member-0.txt",
  ]);
  assert.deepEqual(await readFile(targetPaths[0]), REPLACEMENT);
  assert.deepEqual(await readFile(targetPaths[1]), staleBytes);
  await assert.rejects(readFile(targetPaths[2]), { code: "ENOENT" });

  const admittedSuccessfulOutput = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === environment.gtl.WORKSITE_C0_IDS.outputContractRef,
  );
  assert.ok(admittedSuccessfulOutput);
  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg: environment.abg,
    product: environment.product,
    installedPackageRoot: environment.installedRoot,
    store: environment.store,
    requests: [{
      rowId: "c1-worksite-construction-partial-runtime-truth",
      owner: "abg",
      exportName: "projectRuntimeTruthAtDurablePrefix",
      input: "durable_prefix",
      args: [opened.scope.runId],
    }],
  });
  const freshReplay = freshProof.retainedRows[0].projection.replayState;
  assert.equal(freshReplay.runtimeStatus, "failed");
  assert.equal(freshReplay.runStoppedDisposition, "failed");
  const replayedPartial = freshReplay.fanOutCompletions.find(
    (row) => row.applicationRef === ids.fanOutApplicationRef,
  );
  assert.ok(replayedPartial);
  assert.equal(replayedPartial.completionKind, "partial_stop");
  assert.deepEqual(replayedPartial.completedRows.map((row) => row.ordinal), [0]);
  assert.equal(replayedPartial.stoppingRow.ordinal, 1);
  assert.deepEqual(replayedPartial.unstartedRows.map((row) => row.ordinal), [2]);
  const replayedVectorFailure = freshReplay.cCalls.find(
    (row) => row.resultRef === vectorFailure.payload.resultRef,
  );
  assert.ok(replayedVectorFailure);
  assert.deepEqual(replayedVectorFailure.resultValue, completion.resultValue);
  assert.deepEqual(
    freshReplay.currentWorksiteObservations
      .map((row) => row.observation.observationRef)
      .sort(),
    [
      admittedSuccessfulOutput.payload.value.successorObservation.observationRef,
      predecessorObservations[1].observationRef,
    ].sort(),
  );
});
