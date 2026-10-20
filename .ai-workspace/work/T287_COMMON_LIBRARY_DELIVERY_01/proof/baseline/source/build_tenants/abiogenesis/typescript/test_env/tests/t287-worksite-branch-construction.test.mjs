import assert from "node:assert/strict";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { proveFreshProcessRuntimeProjectionEquality } from "../support/fresh-process-runtime-proof.mjs";
import { setupInstalledRootInvocation } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACTOR_REF = "actor://abiogenesis/worksite/construction-worker@5";
const REPLACEMENT = Buffer.from("c3 deterministic construction proof\n");

async function setupCompositeRootExecutionBasis(context, packageRoot, options) {
  const environment = await setupInstalledRootInvocation(
    context,
    packageRoot,
    options,
  );
  const {
    abg,
    product,
    gtl,
    validator,
    store,
    publication,
    program,
    programValidation,
    graphFunction,
    catalogView,
    invocationAdmission,
    durablePrefix,
    input,
    rawInput,
  } = environment;
  const node = graphFunction.template.nodes.find((candidate) =>
    candidate.nodeRef === graphFunction.template.startNodeRef
  );
  assert.ok(node, "C3 requires one exact declared graph root");
  const [selectedLeaf] = gtl.cLeafTerms(node.term);
  assert.ok(selectedLeaf, "C3 requires its one declared planning leaf");
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: input,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
      admittedInput: input,
    },
  );
  assert.equal(
    graphValidation.kind,
    "graph_validation",
    JSON.stringify(graphValidation),
  );
  const packagedImplementations =
    environment.executionResolution.packagedImplementations;
  const resolutionSetCandidate = product.resolveImplementationSet(
    catalogView,
    environment.executionResolution.declarationClosure,
    programValidation,
    packagedImplementations,
  );
  assert.equal(
    resolutionSetCandidate.kind,
    "implementation_resolution_set_candidate",
    JSON.stringify(resolutionSetCandidate),
  );
  const resolutionSetValidation = validator.validateImplementationResolutionSet(
    resolutionSetCandidate,
    catalogView,
    environment.executionResolution.declarationClosure,
    programValidation,
    packagedImplementations,
  );
  assert.equal(
    resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
    JSON.stringify(resolutionSetValidation),
  );
  const implementationRow = resolutionSetCandidate.rows.find((row) =>
    row.graphFunctionRef === graphFunction.name &&
    row.nodeRef === node.nodeRef &&
    row.programLocusRef === selectedLeaf.programLocusRef &&
    row.implementationBindingRef ===
      selectedLeaf.requirement.implementationBindingRef
  );
  assert.ok(implementationRow, "C3 planning leaf must resolve exactly");
  const closureContract = publication.closureContracts.find((value) =>
    value.closureContractRef === program.closureContractRef
  );
  assert.ok(closureContract, "C3 run closure must be published");
  const executionBasisAdmission = abg.admitExecutionBasis(
    store,
    durablePrefix,
    {
      invocationAdmission,
      executionResolution: environment.executionResolution.resolution,
      rawInputValue: input,
      program,
      programPublication: environment.publication,
      programValidation,
      graph,
      graphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      closureContract,
    },
    {
      eventTime: "2026-09-02T00:00:00.000Z",
      correlationId: "correlation://t287/c3/execution-basis",
      causationEventRefs: [],
    },
  );
  assert.equal(
    executionBasisAdmission.kind,
    "execution_basis_admission",
    JSON.stringify(executionBasisAdmission),
  );
  const admittedImplementationRow = abg.selectAdmittedImplementationResolution(
    executionBasisAdmission.implementationSet,
    {
      graphFunctionRef: graph.graphFunctionRef,
      nodeRef: graph.template.startNodeRef,
      programLocusRef: selectedLeaf.programLocusRef,
      implementationBindingRef:
        selectedLeaf.requirement.implementationBindingRef,
    },
  );
  assert.notEqual(admittedImplementationRow, null);
  const semantics = environment.executionResolution.productSemantics;
  const semanticsProjection = product.projectInstalledLeafSemantics(semantics);
  const leafPort = await environment.implementationLeafPort
    .constructAdmittedLeafInvocationPort({
      prefix: abg.selectValidatedRuntimeEventPrefix(
        abg.readRuntimeEventsAtDurablePrefix(
          executionBasisAdmission.successorPrefix,
        ),
      ),
      artifactTruth: environment.artifactTruth,
      implementationSet: executionBasisAdmission.implementationSet,
      executionResolution: environment.executionResolution,
      semanticsProjection,
    });
  return {
    ...environment,
    node,
    selectedLeaf,
    graph,
    graphValidation,
    closureContract,
    executionBasisAdmission,
    durablePrefix: executionBasisAdmission.successorPrefix,
    implementationSet: executionBasisAdmission.implementationSet,
    implementationRow: admittedImplementationRow,
    semantics,
    semanticsProjection,
    leafPort,
    implementationResolution: null,
    executionBasis: executionBasisAdmission.executionBasis,
  };
}

const PARALLEL_BRANCHES = Object.freeze([
  {
    branchRef: "territory://odd-glc/parallel-js/package",
    dependsOn: [],
    paths: ["package.json"],
  },
  {
    branchRef: "territory://odd-glc/parallel-js/hello-branch",
    dependsOn: ["territory://odd-glc/parallel-js/package"],
    paths: ["src/hello.mjs"],
  },
  {
    branchRef: "territory://odd-glc/parallel-js/world-branch",
    dependsOn: ["territory://odd-glc/parallel-js/package"],
    paths: ["src/world.mjs"],
  },
  {
    branchRef: "territory://odd-glc/parallel-js/fan-in",
    dependsOn: [
      "territory://odd-glc/parallel-js/hello-branch",
      "territory://odd-glc/parallel-js/world-branch",
    ],
    paths: ["src/index.mjs"],
  },
  {
    branchRef: "territory://odd-glc/parallel-js/proof",
    dependsOn: ["territory://odd-glc/parallel-js/fan-in"],
    paths: [
      "test/component/parallel-branches.test.mjs",
      "test/uat/parallel-fanin.uat.test.mjs",
    ],
  },
]);

const PARTIAL_BRANCHES = Object.freeze([
  { branchRef: "branch://c3/partial/zero", dependsOn: [], paths: ["zero.txt"] },
  {
    branchRef: "branch://c3/partial/one",
    dependsOn: ["branch://c3/partial/zero"],
    paths: ["one.txt"],
  },
  {
    branchRef: "branch://c3/partial/two",
    dependsOn: ["branch://c3/partial/one"],
    paths: ["two-a.txt", "two-b.txt"],
  },
  {
    branchRef: "branch://c3/partial/dependent",
    dependsOn: ["branch://c3/partial/two"],
    paths: ["dependent.txt"],
  },
  {
    branchRef: "branch://c3/partial/independent",
    dependsOn: ["branch://c3/partial/zero"],
    paths: ["independent.txt"],
  },
]);

function edgeCount(branches) {
  return branches.reduce((count, branch) => count + branch.dependsOn.length, 0);
}

function fixturePaths(branches) {
  return branches.flatMap((branch) => branch.paths);
}

function runtimeBasis(label) {
  return {
    eventTime: "2026-09-02T00:00:00.000Z",
    correlationId: `correlation://t287/c3/${label}`,
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
  const command = join(environment.scratch, "c3-bin", "claude");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  if (prompt.length === 0) throw new Error('missing C1 prompt');",
    "  const schemaIndex = process.argv.indexOf('--json-schema');",
    "  if (schemaIndex < 0) throw new Error('missing result schema');",
    "  const schema = JSON.parse(process.argv[schemaIndex + 1]);",
    "  const targetSchema = schema.properties.files.items.properties.targetRef;",
    "  const targetRefs = targetSchema.enum ?? [targetSchema.const];",
    `  const replacementBase64 = ${JSON.stringify(REPLACEMENT.toString("base64"))};`,
    "  const result = { kind: 'worksite_construction_worker_result', schemaVersion: '5.0.0', files: targetRefs.map((targetRef) => ({ kind: 'worksite_candidate_file', schemaVersion: '5.0.0', targetRef, replacementBase64 })) };",
    "  process.stdout.write(`${JSON.stringify({ type: 'system', subtype: 'init', model: 'deterministic-c3-proof' })}\\n`);",
    "  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) })}\\n`);",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function constructFixture(
  product,
  workspaceAuthority,
  workspaceBinding,
  capabilityGrant,
  branches,
  runtimeRoot,
) {
  await mkdir(join(workspaceAuthority.canonicalRoot, runtimeRoot), {
    recursive: true,
  });
  const territory = product.constructWorksiteTerritory({
    workspaceAuthorityBasis: workspaceAuthority,
    workspaceBinding,
    territoryUri: pathToFileURL(
      join(workspaceAuthority.canonicalRoot, runtimeRoot),
    ).href,
    relativeRoot: runtimeRoot,
  });
  assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));
  const targetPaths = [];
  const constructionBranches = [];
  for (const [branchOrdinal, branch] of branches.entries()) {
    const targets = [];
    for (const path of branch.paths) {
      const relativePath = `${runtimeRoot}/${path}`;
      const targetPath = join(workspaceAuthority.canonicalRoot, relativePath);
      await mkdir(dirname(targetPath), { recursive: true });
      targetPaths.push(targetPath);
      const subject = product.constructWorksiteSubject({
        workspaceAuthorityBasis: workspaceAuthority,
        workspaceBinding,
        subjectUri: pathToFileURL(targetPath).href,
        relativePath,
      });
      assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
      const predecessorObservation = await product.observeWorksiteSubject(
        workspaceAuthority,
        workspaceBinding,
        subject,
      );
      assert.equal(
        predecessorObservation.kind,
        "worksite_observation",
        JSON.stringify(predecessorObservation),
      );
      targets.push({ subject, territory, predecessorObservation });
    }
    const constructionTask = product.constructWorksiteConstructionTask({
      workspaceAuthorityBasis: workspaceAuthority,
      workspaceBinding,
      capabilityGrant,
      prompt: `Construct exact branch ${branchOrdinal}.`,
      targets,
    });
    constructionBranches.push({
      branchRef: branch.branchRef,
      dependsOn: branch.dependsOn,
      constructionTask,
    });
  }
  return {
    task: product.constructWorksiteBranchConstructionTask({
      workspaceBinding,
      capabilityGrant,
      branches: constructionBranches,
    }),
    targetPaths,
  };
}

async function setupFixture(context, branches, label) {
  const builtProduct = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?c3-${label}=${Date.now()}`
  );
  const ids = builtProduct.WORKSITE_BRANCH_CONSTRUCTION_IDS;
  let fixture;
  const environment = await setupCompositeRootExecutionBasis(context, root, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_construction",
    authorizedActorRef: ACTOR_REF,
    actorRef: ACTOR_REF,
    programRef: ids.programRef,
    graphFunctionRef: ids.graphFunctionRef,
    inputContractRef: ids.taskContractRef,
    inputFactory: async ({ product, workspaceAuthority, workspaceBinding, capabilityGrant }) => {
      fixture = await constructFixture(
        product,
        workspaceAuthority,
        workspaceBinding,
        capabilityGrant,
        branches,
        `c3-${label}`,
      );
      return fixture.task;
    },
  });
  assert.ok(fixture);
  return { environment, fixture, ids };
}

async function executeFixture(environment, label) {
  const command = await installDeterministicClaude(environment);
  const opened = openRootTraversal(environment, `${label}/open`);
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
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
  try {
    const completion = await environment.hog.executeGraphTraversal({
      store: environment.store,
      predecessorPrefix: opened.successorPrefix,
      executionBasis: environment.executionBasis,
      openedTraversalScope: opened.scope,
      program: environment.program,
      programPublication: environment.publication,
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
      eventTime: "2026-09-02T00:00:00.000Z",
      correlationId: `correlation://t287/c3/${label}/hog`,
    });
    return { completion, opened };
  } finally {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
  }
}

function assertReducerWorkflowLineage(events, ids, reducerGraphOpen) {
  const workflowOpen = events.find((event) =>
    event.kind === "c_call_opened" &&
    event.graphFunctionRef === ids.branchApplicationGraphFunctionRef &&
    event.payload.callClass === "workflow" &&
    event.payload.childGraphFunctionRef === ids.reducerGraphFunctionRef
  );
  assert.ok(workflowOpen, "missing exact branch-application reducer workflow CCall");
  const workflowFibre = events.find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === workflowOpen.aggregateId &&
    event.graphFunctionRef === ids.branchApplicationGraphFunctionRef &&
    event.payload.callClass === "workflow" &&
    event.payload.childGraphFunctionRef === ids.reducerGraphFunctionRef &&
    event.payload.compositionRef === null
  );
  assert.ok(workflowFibre, "missing exact admitted reducer workflow fibre");
  const foldback = events.find((event) =>
    event.kind === "child_foldback_admitted" &&
    event.payload.parentCCallRef === workflowOpen.aggregateId &&
    event.payload.childGraphCallId === reducerGraphOpen.graphCallId
  );
  assert.ok(foldback, "missing exact reducer workflow child foldback");
  assert.equal(workflowOpen.admissionOrdinal < workflowFibre.admissionOrdinal, true);
  assert.equal(workflowFibre.admissionOrdinal < reducerGraphOpen.admissionOrdinal, true);
  assert.equal(reducerGraphOpen.admissionOrdinal < foldback.admissionOrdinal, true);
  return { workflowOpen, workflowFibre, foldback };
}

async function assertSuccessfulFixture(
  context,
  environment,
  fixture,
  ids,
  branches,
  label,
) {
  const { completion, opened } = await executeFixture(environment, label);
  assert.equal(completion.disposition, "closed", JSON.stringify(completion));
  assert.equal(
    environment.product.isWorksiteConstructionResult(completion.resultValue),
    true,
    JSON.stringify(completion),
  );
  assert.equal(completion.resultValue.members.length, fixturePaths(branches).length);
  assert.deepEqual(
    completion.resultValue.members.map((member) => member.inputMemberRef),
    fixture.task.targetAllocation.members.map((member) => member.targetRef),
  );
  assert.deepEqual(
    completion.resultValue.members.map((member) =>
      member.successorObservation.subjectRef
    ),
    fixture.task.targetAllocation.members.map((member) => member.subjectRef),
  );
  for (const targetPath of fixture.targetPaths) {
    assert.deepEqual(await readFile(targetPath), REPLACEMENT);
  }

  const events = environment.store.readAll();
  const outerFanOut = events.find((event) =>
    event.kind === "fan_out_completion_admitted" &&
    event.payload.applicationRef === ids.fanOutApplicationRef
  );
  assert.ok(outerFanOut, JSON.stringify(events));
  assert.equal(outerFanOut.payload.completionKind, "complete_vector");
  assert.deepEqual(
    outerFanOut.payload.taskRows.map((row) => row.inputMemberRef),
    fixture.task.branches.map((branch) => branch.branchRef),
  );
  assert.deepEqual(
    outerFanOut.payload.outputVector.members.map((member) => member.ordinal),
    fixture.task.branches.map((branch) => branch.ordinal),
  );
  const c1 = environment.product.WORKSITE_CONSTRUCTION_IDS;
  const c1Opens = events.filter((event) =>
    event.kind === "graph_call_opened" &&
    event.graphFunctionRef === c1.graphFunctionRef
  );
  assert.equal(c1Opens.length, branches.length);
  const c1Closes = events.filter((event) =>
    event.kind === "graph_call_closed" &&
    event.graphFunctionRef === c1.graphFunctionRef
  );
  assert.equal(c1Closes.length, branches.length);
  for (const close of c1Closes) {
    assert.equal(close.payload.closureContractRef, c1.childClosureContractRef);
    const foldback = events.find((event) =>
      event.kind === "child_foldback_admitted" &&
      event.payload.childGraphCallId === close.graphCallId
    );
    assert.ok(foldback, `missing foldback for ${close.graphCallId}`);
    assert.equal(close.admissionOrdinal < foldback.admissionOrdinal, true);
  }
  const reducerOpens = events.filter((event) =>
    event.kind === "graph_call_opened" &&
    event.graphFunctionRef === ids.reducerGraphFunctionRef
  );
  assert.equal(reducerOpens.length, 1);
  assert.equal(
    outerFanOut.admissionOrdinal < reducerOpens[0].admissionOrdinal,
    true,
  );
  assertReducerWorkflowLineage(events, ids, reducerOpens[0]);
  const reducerResult = events.find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.graphFunctionRef === ids.reducerGraphFunctionRef &&
    event.payload.contractRef === c1.resultContractRef
  );
  assert.ok(reducerResult);
  assert.deepEqual(reducerResult.payload.value, completion.resultValue);
  assert.equal(
    events.filter((event) => event.kind === "actor_invocation_started").length,
    branches.length,
  );
  assert.equal(
    events.filter((event) =>
      event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "worksite_file_replace"
    ).length,
    fixturePaths(branches).length,
  );
  assert.equal(
    events.filter((event) => event.kind === "run_closed").length,
    1,
  );

  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg: environment.abg,
    product: environment.product,
    installedPackageRoot: environment.installedRoot,
    store: environment.store,
    requests: [{
      rowId: `c3-${label}-runtime-truth`,
      owner: "abg",
      exportName: "projectRuntimeTruthAtDurablePrefix",
      input: "durable_prefix",
      args: [opened.scope.runId],
    }],
  });
  const replay = freshProof.retainedRows[0].projection.replayState;
  assert.equal(replay.runtimeStatus, "closed");
  const replayedOuter = replay.fanOutCompletions.find((row) =>
    row.applicationRef === ids.fanOutApplicationRef
  );
  assert.ok(replayedOuter);
  assert.equal(replayedOuter.completionKind, "complete_vector");
  const replayedReducer = replay.cCalls.find((row) =>
    row.resultRef === reducerResult.payload.resultRef
  );
  assert.ok(replayedReducer);
  assert.deepEqual(replayedReducer.resultValue, completion.resultValue);
  return { completion, events, outerFanOut };
}

test("T-287 C3 Parallel topology constructs canonically and closes installed C1 children", {
  timeout: 240_000,
}, async (context) => {
  assert.equal(PARALLEL_BRANCHES.length, 5);
  assert.equal(fixturePaths(PARALLEL_BRANCHES).length, 6);
  assert.equal(edgeCount(PARALLEL_BRANCHES), 5);
  assert.deepEqual(fixturePaths(PARALLEL_BRANCHES), [
    "package.json",
    "src/hello.mjs",
    "src/world.mjs",
    "src/index.mjs",
    "test/component/parallel-branches.test.mjs",
    "test/uat/parallel-fanin.uat.test.mjs",
  ]);
  const { environment, fixture, ids } = await setupFixture(
    context,
    PARALLEL_BRANCHES,
    "parallel",
  );
  assert.equal(environment.product.isWorksiteBranchConstructionTask(fixture.task), true);
  assert.deepEqual(
    fixture.task.branches.map((branch) => branch.topologicalLevel),
    [0, 1, 1, 2, 3],
  );
  assert.equal(fixture.task.targetAllocation.members.length, 6);
  assert.equal(ids.fanOutApplicationRef,
    "graph-function-application://abiogenesis/b879a5519b642b358d3116fb46ec04a7f99806c2bad82923197c2a530c0817bf");
  assert.equal(ids.fanInApplicationRef,
    "graph-function-application://abiogenesis/b1251894aef3bb60ea93e9a98ef5d317d9517a00dbb5833ece4bc65d24473dd7");

  const branchInput = fixture.task.branches.map((branch) => ({
    branchRef: branch.branchRef,
    dependsOn: branch.dependsOn,
    constructionTask: branch.constructionTask,
  }));
  const construct = (branches) => environment.product.constructWorksiteBranchConstructionTask({
    workspaceBinding: fixture.task.workspaceBinding,
    capabilityGrant: fixture.task.capabilityGrant,
    branches,
  });
  assert.throws(() => construct([]), /requires branches/u);
  assert.throws(() => construct([
    { ...branchInput[0], branchRef: "" },
  ]), /exact branch refs/u);
  assert.throws(() => construct([
    branchInput[0],
    { ...branchInput[1], branchRef: branchInput[0].branchRef },
  ]), /branch refs must be globally unique/u);
  assert.throws(() => construct([
    branchInput[0],
    { ...branchInput[1], dependsOn: ["branch://unknown"] },
  ]), /known branches/u);
  assert.throws(() => construct([
    branchInput[0],
    { ...branchInput[1], dependsOn: [branchInput[1].branchRef] },
  ]), /cannot depend on itself/u);
  assert.throws(() => construct([
    { ...branchInput[0], dependsOn: [branchInput[1].branchRef] },
    branchInput[1],
  ]), /already be topological/u);
  const wrongLevel = structuredClone(fixture.task);
  wrongLevel.branches[1].topologicalLevel = 7;
  assert.equal(environment.product.isWorksiteBranchConstructionTask(wrongLevel), false);
  const wrongAllocation = structuredClone(fixture.task);
  wrongAllocation.targetAllocation.members[0].territoryRef =
    "territory://t287/c3/wrong-allocation";
  assert.equal(environment.product.isWorksiteBranchConstructionTask(wrongAllocation), false);
  const vector = environment.product.constructWorksiteBranchConstructionVector(
    fixture.task,
  );
  assert.equal(environment.product.isWorksiteBranchConstructionVector(vector), true);
  const reorderedVector = structuredClone(vector);
  reorderedVector.members.reverse();
  assert.equal(environment.product.isWorksiteBranchConstructionVector(reorderedVector), false);

  await assertSuccessfulFixture(
    context,
    environment,
    fixture,
    ids,
    PARALLEL_BRANCHES,
    "parallel",
  );
});

test("T-287 C3 preserves outer and nested partial prefixes and never opens fan-in", {
  timeout: 240_000,
}, async (context) => {
  const { environment, fixture, ids } = await setupFixture(
    context,
    PARTIAL_BRANCHES,
    "partial",
  );
  const stalePath = fixture.targetPaths[3];
  const staleBytes = Buffer.from("stale after admitted O0\n");
  await writeFile(stalePath, staleBytes);
  const { completion, opened } = await executeFixture(environment, "partial");
  assert.equal(completion.disposition, "failed", JSON.stringify(completion));
  assert.equal(
    environment.product.isWorksiteBranchConstructionBranchApplicationFailure(
      completion.resultValue,
    ),
    true,
    JSON.stringify(completion),
  );
  const events = environment.store.readAll();
  const outerPartial = events.find((event) =>
    event.kind === "fan_out_completion_admitted" &&
    event.payload.applicationRef === ids.fanOutApplicationRef
  );
  assert.ok(outerPartial);
  assert.equal(outerPartial.payload.completionKind, "partial_stop");
  assert.deepEqual(
    outerPartial.payload.completedRows.map((row) => row.ordinal),
    [0, 1],
  );
  assert.equal(outerPartial.payload.stoppingRow.ordinal, 2);
  assert.deepEqual(
    outerPartial.payload.unstartedRows.map((row) => row.ordinal),
    [3, 4],
  );
  assert.equal(Object.hasOwn(outerPartial.payload, "outputVector"), false);
  const stoppedRef = fixture.task.branches[2].branchRef;
  const transitiveDependents = fixture.task.branches
    .filter((branch) => branch.dependsOn.includes(stoppedRef))
    .map((branch) => branch.ordinal);
  assert.deepEqual(transitiveDependents, [3]);
  assert.deepEqual(
    outerPartial.payload.unstartedRows
      .map((row) => row.ordinal)
      .filter((ordinal) => !transitiveDependents.includes(ordinal)),
    [4],
  );
  const c1 = environment.product.WORKSITE_CONSTRUCTION_IDS;
  const innerPartial = events.find((event) =>
    event.kind === "fan_out_completion_admitted" &&
    event.payload.applicationRef === c1.fanOutApplicationRef &&
    event.payload.stoppingRow?.ordinal === 1
  );
  assert.ok(innerPartial);
  assert.deepEqual(innerPartial.payload.completedRows.map((row) => row.ordinal), [0]);
  assert.equal(innerPartial.payload.stoppingRow.ordinal, 1);
  assert.equal(Object.hasOwn(innerPartial.payload, "outputVector"), false);
  assert.equal(
    events.some((event) =>
      event.kind === "graph_call_opened" &&
      event.graphFunctionRef === ids.reducerGraphFunctionRef
    ),
    false,
  );
  assert.equal(
    events.some((event) =>
      event.kind === "c_call_result_admitted" &&
      event.graphFunctionRef === ids.reducerGraphFunctionRef
    ),
    false,
  );
  assert.equal(
    events.some((event) => event.kind === "runtime_failure_observed"),
    false,
  );
  assert.equal(events.at(-1).kind, "run_stopped");
  assert.deepEqual(await readFile(fixture.targetPaths[0]), REPLACEMENT);
  assert.deepEqual(await readFile(fixture.targetPaths[1]), REPLACEMENT);
  assert.deepEqual(await readFile(fixture.targetPaths[2]), REPLACEMENT);
  assert.deepEqual(await readFile(fixture.targetPaths[3]), staleBytes);

  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg: environment.abg,
    product: environment.product,
    installedPackageRoot: environment.installedRoot,
    store: environment.store,
    requests: [{
      rowId: "c3-partial-runtime-truth",
      owner: "abg",
      exportName: "projectRuntimeTruthAtDurablePrefix",
      input: "durable_prefix",
      args: [opened.scope.runId],
    }],
  });
  const replay = freshProof.retainedRows[0].projection.replayState;
  assert.equal(replay.runtimeStatus, "failed");
  const replayedOuter = replay.fanOutCompletions.find((row) =>
    row.applicationRef === ids.fanOutApplicationRef
  );
  const replayedInner = replay.fanOutCompletions.find((row) =>
    row.applicationRef === c1.fanOutApplicationRef &&
    row.stoppingRow?.ordinal === 1
  );
  assert.equal(replayedOuter.completionKind, "partial_stop");
  assert.equal(replayedInner.completionKind, "partial_stop");
});
