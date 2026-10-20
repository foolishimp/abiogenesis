import assert from "node:assert/strict";
import { chmod, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";
import {
  buildRootCliScenario,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
  writeCliTransportRequest,
} from "../support/root-cli-environment.mjs";
import { setupInstalledRootInvocation } from
  "../support/root-installed-environment.mjs";

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

const DATA_MAPPER_BRANCHES = Object.freeze([
  {
    branchRef: "territory://odd-glc/data-mapper-full/config",
    dependsOn: [],
    paths: [
      "build_tenants/scala_spark/build.sbt",
      "build_tenants/scala_spark/project/plugins.sbt",
      "build_tenants/scala_spark/project/build.properties",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-core",
    dependsOn: ["territory://odd-glc/data-mapper-full/config"],
    paths: [
      "build_tenants/scala_spark/cdme-core/src/main/scala/com/cdme/core/package.scala",
      "build_tenants/scala_spark/cdme-core/src/test/scala/com/cdme/core/CoreContractsSpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-compiler",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-compiler/src/main/scala/com/cdme/compiler/TopologyCompiler.scala",
      "build_tenants/scala_spark/cdme-compiler/src/main/scala/com/cdme/compiler/package.scala",
      "build_tenants/scala_spark/cdme-compiler/src/test/scala/com/cdme/compiler/TopologyCompilerSpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-executor",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-executor/src/main/scala/com/cdme/executor/DataFrameExecutor.scala",
      "build_tenants/scala_spark/cdme-executor/src/main/scala/com/cdme/executor/ErrorSink.scala",
      "build_tenants/scala_spark/cdme-executor/src/test/scala/com/cdme/executor/DataFrameExecutorSpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-adjoint",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-adjoint/src/main/scala/com/cdme/adjoint/AdjointRegistry.scala",
      "build_tenants/scala_spark/cdme-adjoint/src/test/scala/com/cdme/adjoint/AdjointRegistrySpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-accounting",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-accounting/src/main/scala/com/cdme/accounting/AccountingVerifier.scala",
      "build_tenants/scala_spark/cdme-accounting/src/test/scala/com/cdme/accounting/AccountingVerifierSpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-assurance",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-assurance/src/main/scala/com/cdme/assurance/AssuranceService.scala",
      "build_tenants/scala_spark/cdme-assurance/src/test/scala/com/cdme/assurance/AssuranceServiceSpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-fidelity",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-fidelity/src/main/scala/com/cdme/fidelity/FidelityService.scala",
      "build_tenants/scala_spark/cdme-fidelity/src/test/scala/com/cdme/fidelity/FidelityServiceSpec.scala",
    ],
  },
  {
    branchRef: "territory://odd-glc/data-mapper-full/cdme-engine",
    dependsOn: [
      "territory://odd-glc/data-mapper-full/config",
      "territory://odd-glc/data-mapper-full/cdme-core",
      "territory://odd-glc/data-mapper-full/cdme-compiler",
      "territory://odd-glc/data-mapper-full/cdme-executor",
      "territory://odd-glc/data-mapper-full/cdme-adjoint",
      "territory://odd-glc/data-mapper-full/cdme-accounting",
      "territory://odd-glc/data-mapper-full/cdme-assurance",
      "territory://odd-glc/data-mapper-full/cdme-fidelity",
    ],
    paths: [
      "build_tenants/scala_spark/cdme-engine/src/main/scala/com/cdme/engine/CdmeEngineImpl.scala",
      "build_tenants/scala_spark/cdme-engine/src/main/scala/com/cdme/engine/CdmeEngineRunner.scala",
      "build_tenants/scala_spark/cdme-engine/src/test/scala/com/cdme/engine/CdmeEngineIntegrationSpec.scala",
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

function publicInvocation(invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.run.invoke",
    variant: "direct",
    invocationRef,
    eventTime: "2026-09-02T00:00:00.000Z",
    correlationId: "correlation://t287/c3/public-chain",
    payload,
  };
}

function publicProjectReadInvocation(invocationRef, variant, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.project.read",
    variant,
    invocationRef,
    eventTime: "2026-09-02T00:00:00.000Z",
    correlationId: "correlation://t287/c3/public-chain/read",
    payload,
  };
}

function closeHandoff(authority) {
  return {
    prefix: authority.prefix,
    reopenAuthority: authority.reopenAuthority,
  };
}

async function readPublicProjection(
  harness,
  label,
  authority,
  variant,
  targetRef,
) {
  const transcriptPath = join(
    harness.scratch,
    "t287-c3-public-chain",
    `${label}-${variant}.jsonl`,
  );
  await writeCliTransportRequest(transcriptPath, {
    acquisition: { kind: "reopen", closeHandoff: closeHandoff(authority) },
    invocation: publicProjectReadInvocation(
      `invocation://t287/c3/${label}/${variant}`,
      variant,
      { projectionAuthority: authority, targetRef },
    ),
  });
  return runInstalledCli(harness, { transcriptPath });
}

function replayPublicRun(abg, authority) {
  const durableEvents = abg.readRuntimeEventsAtDurablePrefix(authority.prefix);
  const exactPrefix = abg.selectValidatedRuntimeEventPrefix(durableEvents);
  const runPrefix = abg.selectValidatedRuntimeEventPrefix(durableEvents, {
    runId: authority.runId,
  });
  return abg.replayValidatedRuntimeEventPrefix(runPrefix, exactPrefix);
}

async function constructInvocationCapabilityGrant({
  product,
  workspaceBinding,
  admittedInstall,
  catalog,
  catalogView,
  actorRef,
  programRef,
  graphFunctionRef,
}) {
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls: [admittedInstall],
    verifyInstallAdmission: () => true,
    programRef,
    selection: { kind: "direct", catalogHandle: graphFunctionRef },
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
  const declaredRegimes = new Set([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
  );
  return product.constructCapabilityGrant(
    policy,
    actorRef,
    "abg.operation.run.invoke",
    product.DIRECT_INVOKE_CAPABILITY,
    {
      admittedInstalls: [admittedInstall],
      workspaceBinding,
      fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
    },
  );
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

async function installCommandTransport(scratch) {
  const command = join(scratch, "c3-bin", "claude-command");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    "import { spawnSync } from 'node:child_process';",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const blocks = prompt.split('\\n\\n');",
    "  const toolCommand = blocks[1];",
    "  if (typeof toolCommand !== 'string') throw new Error('missing exact helper plan');",
    "  const toolUse = { type: 'tool_use', id: 'toolu_c3_c2_001', name: 'Bash', input: { command: toolCommand, description: 'Run the exact ABI helper once' } };",
    "  process.stdout.write(`${JSON.stringify({ type: 'system', subtype: 'init', model: 'c3-c2-command-proof' })}\\n`);",
    "  process.stdout.write(`${JSON.stringify({ type: 'assistant', message: { content: [toolUse] } })}\\n`);",
    "  const helper = spawnSync('/bin/sh', ['-c', toolCommand], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });",
    "  if (helper.status !== 0) throw new Error(`helper failed: ${helper.status}: ${helper.stderr}`);",
    "  const result = JSON.parse(helper.stdout);",
    "  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) })}\\n`);",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function runPublicC2Invocation({
  harness,
  predecessor,
  scenario,
  c2,
  task,
  sourceAuthority,
  runtimeAuthority = sourceAuthority,
  sourceResultRef,
  label,
  commandTransport,
}) {
  const request = publicInvocation(`invocation://t287/c3/${label}`, {
    installInvocationRef: scenario.refs.install,
    workspaceBindingInvocationRef: scenario.refs.bind,
    catalog: scenario.catalog,
    catalogView: scenario.catalogView,
    applications: [],
    programRef: c2.programRef,
    catalogHandle: c2.graphFunctionRef,
    actorRef: ACTOR_REF,
    input: task,
    eventLogPath: scenario.eventLogPath,
    runtimePrefixAuthority: closeHandoff(runtimeAuthority),
    sourceProjectionAuthority: sourceAuthority,
    sourceResultRef,
  });
  const transcriptPath = join(
    harness.scratch,
    "t287-c3-public-chain",
    `${label}.jsonl`,
  );
  await writeCliTransportRequest(transcriptPath, {
    acquisition: {
      kind: "reopen",
      closeHandoff: closeHandoff(runtimeAuthority),
    },
    invocation: request,
  });
  const run = await runInstalledCli(
    harness,
    { ...predecessor, transcriptPath },
    commandTransport === undefined
      ? { timeoutMs: 120_000 }
      : {
          timeoutMs: 120_000,
          environment: {
            ABG_TS_CLAUDE_COMMAND: commandTransport,
            ABG_TS_FP_TIMEOUT_MS: undefined,
            ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: undefined,
          },
        },
  );
  return { request, run, outcome: run.outcomes.at(-1) };
}

function assertPublicSourceRefusal(attempt, expectedHandoff) {
  assert.equal(attempt.run.exitCode, 2, attempt.run.stderr);
  assert.equal(attempt.outcome.disposition, "refused");
  assert.equal(attempt.outcome.result.kind, "public_operation_refusal");
  assert.equal(attempt.outcome.result.code, "target_mismatch");
  assert.equal(
    attempt.outcome.diagnosticRef,
    "diagnostic://abiogenesis/public/target_mismatch@5",
  );
  assert.equal(attempt.outcome.runId, null);
  assert.deepEqual(attempt.run.transportResult.closeHandoff, expectedHandoff);
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

test("T-287 C3 Data Mapper topology closes 9 C1 branches and a 22-member flat result", {
  timeout: 1_200_000,
}, async (context) => {
  assert.equal(DATA_MAPPER_BRANCHES.length, 9);
  assert.equal(fixturePaths(DATA_MAPPER_BRANCHES).length, 22);
  assert.equal(edgeCount(DATA_MAPPER_BRANCHES), 21);
  assert.deepEqual(fixturePaths(DATA_MAPPER_BRANCHES), [
    "build_tenants/scala_spark/build.sbt",
    "build_tenants/scala_spark/project/plugins.sbt",
    "build_tenants/scala_spark/project/build.properties",
    "build_tenants/scala_spark/cdme-core/src/main/scala/com/cdme/core/package.scala",
    "build_tenants/scala_spark/cdme-core/src/test/scala/com/cdme/core/CoreContractsSpec.scala",
    "build_tenants/scala_spark/cdme-compiler/src/main/scala/com/cdme/compiler/TopologyCompiler.scala",
    "build_tenants/scala_spark/cdme-compiler/src/main/scala/com/cdme/compiler/package.scala",
    "build_tenants/scala_spark/cdme-compiler/src/test/scala/com/cdme/compiler/TopologyCompilerSpec.scala",
    "build_tenants/scala_spark/cdme-executor/src/main/scala/com/cdme/executor/DataFrameExecutor.scala",
    "build_tenants/scala_spark/cdme-executor/src/main/scala/com/cdme/executor/ErrorSink.scala",
    "build_tenants/scala_spark/cdme-executor/src/test/scala/com/cdme/executor/DataFrameExecutorSpec.scala",
    "build_tenants/scala_spark/cdme-adjoint/src/main/scala/com/cdme/adjoint/AdjointRegistry.scala",
    "build_tenants/scala_spark/cdme-adjoint/src/test/scala/com/cdme/adjoint/AdjointRegistrySpec.scala",
    "build_tenants/scala_spark/cdme-accounting/src/main/scala/com/cdme/accounting/AccountingVerifier.scala",
    "build_tenants/scala_spark/cdme-accounting/src/test/scala/com/cdme/accounting/AccountingVerifierSpec.scala",
    "build_tenants/scala_spark/cdme-assurance/src/main/scala/com/cdme/assurance/AssuranceService.scala",
    "build_tenants/scala_spark/cdme-assurance/src/test/scala/com/cdme/assurance/AssuranceServiceSpec.scala",
    "build_tenants/scala_spark/cdme-fidelity/src/main/scala/com/cdme/fidelity/FidelityService.scala",
    "build_tenants/scala_spark/cdme-fidelity/src/test/scala/com/cdme/fidelity/FidelityServiceSpec.scala",
    "build_tenants/scala_spark/cdme-engine/src/main/scala/com/cdme/engine/CdmeEngineImpl.scala",
    "build_tenants/scala_spark/cdme-engine/src/main/scala/com/cdme/engine/CdmeEngineRunner.scala",
    "build_tenants/scala_spark/cdme-engine/src/test/scala/com/cdme/engine/CdmeEngineIntegrationSpec.scala",
  ]);
  const harness = await setupInstalledCliHarness(context, root, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKinds: [
      "worksite_construction",
      "worksite_command_execution",
    ],
  });
  const ids = harness.product.WORKSITE_BRANCH_CONSTRUCTION_IDS;
  const c1 = harness.product.WORKSITE_CONSTRUCTION_IDS;
  const c2 = harness.product.WORKSITE_COMMAND_EXECUTION_IDS;
  const canonicalScratch = await realpath(harness.scratch);
  const c3Program = harness.rootPublications
    .flatMap((publication) => publication.programs)
    .find((program) => program.programRef === ids.programRef);
  assert.ok(c3Program, "the installed composite publication must carry C3");
  const allowlist = [...new Set([
    ...c3Program.callableMembership,
    c2.graphFunctionRef,
  ])].sort();
  let fixture;
  const scenario = await buildRootCliScenario(
    harness,
    "t287-c3-public-chain",
    (payload) => payload,
    {
      authorizedActorRef: ACTOR_REF,
      programRef: ids.programRef,
      catalogHandle: ids.graphFunctionRef,
      allowlist,
      catalogApplications: [],
      productConsumer: join(
        canonicalScratch,
        "t287-c3-public-chain",
        "product-consumer",
      ),
      workspaceRoot: join(
        canonicalScratch,
        "t287-c3-public-chain",
        "workspace",
      ),
      inputContractRef: ids.taskContractRef,
      inputFactory: async ({
        product,
        workspaceAuthority,
        workspaceBinding,
        admittedInstall,
        catalog,
        catalogView,
      }) => {
        const capabilityGrant = await constructInvocationCapabilityGrant({
          product,
          workspaceBinding,
          admittedInstall,
          catalog,
          catalogView,
          actorRef: ACTOR_REF,
          programRef: ids.programRef,
          graphFunctionRef: ids.graphFunctionRef,
        });
        fixture = await constructFixture(
          product,
          workspaceAuthority,
          workspaceBinding,
          capabilityGrant,
          DATA_MAPPER_BRANCHES,
          "c3-data-mapper",
        );
        return fixture.task;
      },
    },
  );
  assert.ok(fixture);
  assert.deepEqual(
    fixture.task.branches.map((branch) => branch.topologicalLevel),
    [0, 1, 2, 2, 2, 2, 2, 2, 3],
  );
  const catalog = scenario.preRunOutcomes.find((outcome) =>
    outcome.result?.kind === "graph_function_catalog"
  )?.result;
  const catalogView = scenario.preRunOutcomes.find((outcome) =>
    outcome.result?.kind === "graph_function_catalog_view"
  )?.result;
  assert.ok(catalog);
  assert.ok(catalogView);
  const chainScenario = { ...scenario, catalog, catalogView };
  const constructionCommand = await installDeterministicClaude(harness);
  const c3Run = await runInstalledCli(harness, scenario, {
    timeoutMs: 840_000,
    environment: { ABG_TS_CLAUDE_COMMAND: constructionCommand },
  });
  assert.equal(c3Run.exitCode, 0, JSON.stringify({
    exitCode: c3Run.exitCode,
    stderr: c3Run.stderr,
    outcome: c3Run.outcomes?.at(-1),
  }));
  const c3Outcome = c3Run.outcomes.at(-1);
  assert.equal(c3Outcome.disposition, "succeeded", JSON.stringify(c3Outcome));
  assert.equal(
    c3Outcome.projectionAuthority.kind,
    "public_run_projection_authority",
  );
  assert.equal(c3Outcome.resultRef, c3Outcome.projectionAuthority.resultRef);
  assert.equal(c3Outcome.runId, c3Outcome.projectionAuthority.runId);
  assert.equal(
    c3Outcome.projectionAuthority.catalogViewDigest,
    catalogView.viewDigest,
  );
  assert.equal(
    harness.product.isWorksiteConstructionResult(c3Outcome.result),
    true,
  );
  assert.equal(c3Outcome.result.members.length, 22);
  assert.deepEqual(
    c3Outcome.result.members.map((member) => member.inputMemberRef),
    fixture.task.targetAllocation.members.map((member) => member.targetRef),
  );
  assert.deepEqual(
    c3Outcome.result.members.map((member) =>
      member.successorObservation.subjectRef
    ),
    fixture.task.targetAllocation.members.map((member) => member.subjectRef),
  );
  for (const targetPath of fixture.targetPaths) {
    assert.deepEqual(await readFile(targetPath), REPLACEMENT);
  }

  const abg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `c3-public-chain=${Date.now()}`,
  );
  const c3Authority = c3Outcome.projectionAuthority;
  const c3DurableEvents = abg.readRuntimeEventsAtDurablePrefix(
    c3Authority.prefix,
  );
  const c3ExactPrefix = abg.selectValidatedRuntimeEventPrefix(c3DurableEvents);
  const c3Events = c3DurableEvents.filter((event) =>
    event.runId === c3Outcome.runId
  );
  const c3Replay = replayPublicRun(abg, c3Authority);
  assert.equal(c3Replay.runtimeStatus, "closed");
  assert.equal(c3Replay.runId, c3Outcome.runId);
  assert.equal(c3Replay.replayRef, c3Outcome.replayRef);
  assert.equal(c3Replay.replayDigest, c3Outcome.replayDigest);
  const rootGraphOpen = c3Events.find((event) =>
    event.kind === "graph_call_opened" &&
    event.graphCallId === c3Authority.graphCallId &&
    event.graphFunctionRef === ids.graphFunctionRef
  );
  assert.ok(rootGraphOpen, JSON.stringify(c3Events));
  const outerFanOut = c3Events.find((event) =>
    event.kind === "fan_out_completion_admitted" &&
    event.payload.applicationRef === ids.fanOutApplicationRef
  );
  assert.ok(outerFanOut, JSON.stringify(c3Events));
  assert.equal(outerFanOut.payload.completionKind, "complete_vector");
  assert.deepEqual(
    outerFanOut.payload.taskRows.map((row) => row.inputMemberRef),
    fixture.task.branches.map((branch) => branch.branchRef),
  );
  assert.deepEqual(
    outerFanOut.payload.outputVector.members.map((member) => member.ordinal),
    fixture.task.branches.map((branch) => branch.ordinal),
  );
  const c1GraphOpens = c3Events.filter((event) =>
    event.kind === "graph_call_opened" &&
    event.graphFunctionRef === c1.graphFunctionRef
  );
  const c1GraphCloses = c3Events.filter((event) =>
    event.kind === "graph_call_closed" &&
    event.graphFunctionRef === c1.graphFunctionRef
  );
  assert.equal(c1GraphOpens.length, 9);
  assert.equal(c1GraphCloses.length, 9);
  for (const close of c1GraphCloses) {
    assert.equal(close.payload.closureContractRef, c1.childClosureContractRef);
    const foldback = c3Events.find((event) =>
      event.kind === "child_foldback_admitted" &&
      event.payload.childGraphCallId === close.graphCallId
    );
    assert.ok(foldback, `missing foldback for ${close.graphCallId}`);
    assert.equal(close.admissionOrdinal < foldback.admissionOrdinal, true);
  }
  const reducerGraphOpens = c3Events.filter((event) =>
    event.kind === "graph_call_opened" &&
    event.graphFunctionRef === ids.reducerGraphFunctionRef
  );
  assert.equal(reducerGraphOpens.length, 1);
  assert.equal(
    outerFanOut.admissionOrdinal < reducerGraphOpens[0].admissionOrdinal,
    true,
  );
  const resultEvents = c3Events.filter((event) =>
    event.kind === "c_call_result_admitted"
  );
  const flatValueDigest = harness.product.sha256Canonical(c3Outcome.result);
  const oneFlatResult = (graphFunctionRef) => {
    const rows = resultEvents.filter((event) =>
      event.graphFunctionRef === graphFunctionRef &&
      event.payload.contractRef === c1.resultContractRef &&
      event.payload.valueDigest === flatValueDigest
    );
    assert.equal(rows.length, 1, graphFunctionRef);
    return rows[0];
  };
  const reducerResult = oneFlatResult(ids.reducerGraphFunctionRef);
  const branchApplicationResult = oneFlatResult(
    ids.branchApplicationGraphFunctionRef,
  );
  const rootResult = oneFlatResult(ids.graphFunctionRef);
  const c1RootResults = resultEvents.filter((event) =>
    event.graphFunctionRef === c1.graphFunctionRef &&
    event.payload.contractRef === c1.resultContractRef
  );
  assert.equal(c1RootResults.length, 9);
  assert.equal(c3Outcome.resultRef, reducerResult.payload.resultRef);
  assert.deepEqual(reducerResult.payload.value, c3Outcome.result);
  assertReducerWorkflowLineage(c3Events, ids, reducerGraphOpens[0]);
  assert.equal(
    c3Events.filter((event) => event.kind === "actor_invocation_started").length,
    9,
  );
  assert.equal(
    c3Events.filter((event) =>
      event.kind === "c_call_evidenced" &&
      event.payload.evidenceClass === "worksite_file_replace"
    ).length,
    22,
  );
  assert.equal(
    c3Events.filter((event) => event.kind === "run_closed").length,
    1,
  );

  const sourceResultBasis = abg.deriveInvocationSourceResultBasisAtPrefix(
    c3ExactPrefix,
    {
      publicAuthorityDigest: c3Authority.authorityDigest,
      runtimeInvocationRef: c3Authority.runtimeInvocationRef,
      invocationAdmissionRef: c3Authority.invocationAdmissionRef,
      runId: c3Authority.runId,
      resultRef: c3Outcome.resultRef,
    },
  );
  assert.ok(sourceResultBasis);
  assert.deepEqual({
    publicAuthorityDigest: sourceResultBasis.publicAuthorityDigest,
    sourceInvocationRef: sourceResultBasis.sourceInvocationRef,
    sourceInvocationAdmissionRef:
      sourceResultBasis.sourceInvocationAdmissionRef,
    sourceRunId: sourceResultBasis.sourceRunId,
    sourceGraphCallId: sourceResultBasis.sourceGraphCallId,
    sourceGraphFunctionRef: sourceResultBasis.sourceGraphFunctionRef,
    sourceCCallRef: sourceResultBasis.sourceCCallRef,
    sourceResultAdmissionEventRef:
      sourceResultBasis.sourceResultAdmissionEventRef,
    sourceResultRef: sourceResultBasis.sourceResultRef,
    sourceResultDigest: sourceResultBasis.sourceResultDigest,
    sourceResultValueDigest: sourceResultBasis.sourceResultValueDigest,
    sourceResultContractRef: sourceResultBasis.sourceResultContractRef,
    sourceReplayRef: sourceResultBasis.sourceReplayRef,
    sourceReplayDigest: sourceResultBasis.sourceReplayDigest,
    sourceWorkspaceId: sourceResultBasis.sourceWorkspaceId,
    workspaceBindingId: sourceResultBasis.workspaceBindingId,
    workspaceBindingDigest: sourceResultBasis.workspaceBindingDigest,
  }, {
    publicAuthorityDigest: c3Authority.authorityDigest,
    sourceInvocationRef: c3Authority.runtimeInvocationRef,
    sourceInvocationAdmissionRef: c3Authority.invocationAdmissionRef,
    sourceRunId: c3Outcome.runId,
    sourceGraphCallId: reducerGraphOpens[0].graphCallId,
    sourceGraphFunctionRef: ids.reducerGraphFunctionRef,
    sourceCCallRef: reducerResult.aggregateId,
    sourceResultAdmissionEventRef: reducerResult.eventId,
    sourceResultRef: c3Outcome.resultRef,
    sourceResultDigest: reducerResult.payload.resultDigest,
    sourceResultValueDigest: flatValueDigest,
    sourceResultContractRef: c1.resultContractRef,
    sourceReplayRef: c3Outcome.replayRef,
    sourceReplayDigest: c3Outcome.replayDigest,
    sourceWorkspaceId: fixture.task.workspaceBinding.workspaceId,
    workspaceBindingId: fixture.task.workspaceBinding.bindingId,
    workspaceBindingDigest: fixture.task.workspaceBinding.bindingDigest,
  });
  assert.deepEqual(sourceResultBasis.sourceResultValue, c3Outcome.result);
  assert.equal(
    sourceResultBasis.sourceResultJudgmentEventRef,
    c3Events.find((event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === reducerResult.aggregateId &&
      event.payload.resultRef === c3Outcome.resultRef
    )?.eventId,
  );

  const c3PublicResultRead = await readPublicProjection(
    harness,
    "c3",
    c3Authority,
    "result",
    c3Outcome.resultRef,
  );
  assert.equal(c3PublicResultRead.exitCode, 0, c3PublicResultRead.stderr);
  const c3PublicResult = c3PublicResultRead.outcomes.at(-1);
  assert.equal(c3PublicResult.disposition, "succeeded");
  assert.equal(c3PublicResult.result.kind, "public_result_projection");
  assert.equal(c3PublicResult.result.resultRef, c3Outcome.resultRef);
  assert.deepEqual(c3PublicResult.result.value, c3Outcome.result);
  assert.equal(c3PublicResult.replayRef, c3Outcome.replayRef);
  assert.equal(c3PublicResult.replayDigest, c3Outcome.replayDigest);
  const c3PublicReplayRead = await readPublicProjection(
    harness,
    "c3",
    c3Authority,
    "replay",
    c3Outcome.runId,
  );
  assert.equal(c3PublicReplayRead.exitCode, 0, c3PublicReplayRead.stderr);
  const c3PublicReplay = c3PublicReplayRead.outcomes.at(-1);
  assert.equal(c3PublicReplay.disposition, "succeeded");
  assert.equal(c3PublicReplay.result.kind, "public_replay_projection");
  assert.equal(c3PublicReplay.result.replayRef, c3Outcome.replayRef);
  assert.equal(c3PublicReplay.result.replayDigest, c3Outcome.replayDigest);
  assert.deepEqual(c3PublicReplay.projectionAuthority, c3Authority);

  const admittedInstall = scenario.ownerProjections.admittedInstall.install;
  const c2CapabilityGrant = await constructInvocationCapabilityGrant({
    product: harness.product,
    workspaceBinding: fixture.task.workspaceBinding,
    admittedInstall,
    catalog,
    catalogView,
    actorRef: ACTOR_REF,
    programRef: c2.programRef,
    graphFunctionRef: c2.graphFunctionRef,
  });
  const flatTargets = fixture.task.branches.flatMap((branch) =>
    branch.constructionTask.targets
  );
  const c2Task = harness.product.constructWorksiteCommandExecutionTask({
    workspaceAuthorityBasis: fixture.task.branches[0].constructionTask.workspaceAuthorityBasis,
    workspaceBinding: fixture.task.workspaceBinding,
    capabilityGrant: c2CapabilityGrant,
    sourceConstructionResultRef: c3Outcome.result.resultRef,
    sourceConstructionResultDigest: c3Outcome.result.resultDigest,
    sourceConstructionResult: c3Outcome.result,
    commands: [{
      commandId: "command://c3/source-proof",
      executable: process.execPath,
      args: ["-e", "process.exit(0)"],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 5_000,
      terminationGraceMs: 1_000,
      expectedReports: [],
    }],
    outcomePredicates: [],
    protectedObservations: c3Outcome.result.members.map((member, ordinal) => ({
      sourceMemberRef: member.inputMemberRef,
      subject: flatTargets[ordinal].subject,
      observation: member.successorObservation,
    })),
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "c3-data-mapper/c2-evidence",
    }],
  });
  assert.equal(harness.product.isWorksiteCommandExecutionTask(c2Task), true);
  const commandTransport = await installCommandTransport(harness.scratch);
  const c2Attempt = await runPublicC2Invocation({
    harness,
    predecessor: c3Run,
    scenario: chainScenario,
    c2,
    task: c2Task,
    sourceAuthority: c3Authority,
    sourceResultRef: c3Outcome.resultRef,
    label: "c2-from-c3-reducer",
    commandTransport,
  });
  assert.equal(c2Attempt.run.exitCode, 0, JSON.stringify({
    exitCode: c2Attempt.run.exitCode,
    stderr: c2Attempt.run.stderr,
    outcome: c2Attempt.outcome,
  }));
  const c2Outcome = c2Attempt.outcome;
  assert.equal(c2Outcome.disposition, "succeeded", JSON.stringify(c2Outcome));
  assert.equal(
    c2Outcome.projectionAuthority.kind,
    "public_run_projection_authority",
  );
  assert.equal(
    c2Outcome.projectionAuthority.catalogViewDigest,
    c3Authority.catalogViewDigest,
  );
  assert.equal(
    harness.product.canonicalJson(c2Attempt.request.payload.catalogView),
    harness.product.canonicalJson(catalogView),
  );
  const c2Replay = replayPublicRun(abg, c2Outcome.projectionAuthority);
  assert.equal(c2Replay.runtimeStatus, "closed");
  const observationCall = c2Replay.cCalls.find((row) =>
    row.resultRef === c2Outcome.resultRef
  );
  assert.ok(observationCall, JSON.stringify(c2Replay));
  assert.equal(
    harness.product.isWorksiteCommandExecutionObservation(c2Outcome.result),
    true,
  );
  assert.deepEqual(c2Outcome.result, observationCall.resultValue);
  assert.equal(c2Outcome.result.commandResults.length, 1);
  assert.equal(c2Outcome.result.commandResults[0].exitStatus, 0);
  assert.equal(c2Outcome.result.commandResults[0].terminationConfirmed, true);
  assert.deepEqual(c2Outcome.result.predicateObservations, []);
  const c2DurableEvents = abg.readRuntimeEventsAtDurablePrefix(
    c2Outcome.projectionAuthority.prefix,
  );
  const c2RunEvents = c2DurableEvents.filter((event) =>
    event.runId === c2Outcome.runId
  );
  const c2InvocationAdmissions = c2DurableEvents.filter((event) =>
    event.kind === "invocation_admitted" &&
    event.payload?.publicRequestInvocationRef ===
      c2Attempt.request.invocationRef
  );
  assert.equal(c2InvocationAdmissions.length, 1);
  assert.deepEqual(
    c2InvocationAdmissions[0].payload.sourceResultBasis,
    sourceResultBasis,
  );
  assert.equal(
    c2RunEvents.filter((event) => event.kind === "run_closed").length,
    1,
  );

  const c2PublicResultRead = await readPublicProjection(
    harness,
    "c2",
    c2Outcome.projectionAuthority,
    "result",
    c2Outcome.resultRef,
  );
  assert.equal(c2PublicResultRead.exitCode, 0, c2PublicResultRead.stderr);
  const c2PublicResult = c2PublicResultRead.outcomes.at(-1);
  assert.equal(c2PublicResult.disposition, "succeeded");
  assert.equal(c2PublicResult.result.kind, "public_result_projection");
  assert.equal(c2PublicResult.result.resultRef, c2Outcome.resultRef);
  assert.deepEqual(c2PublicResult.result.value, c2Outcome.result);
  assert.equal(c2PublicResult.replayRef, c2Outcome.replayRef);
  assert.equal(c2PublicResult.replayDigest, c2Outcome.replayDigest);
  const c2PublicReplayRead = await readPublicProjection(
    harness,
    "c2",
    c2Outcome.projectionAuthority,
    "replay",
    c2Outcome.runId,
  );
  assert.equal(c2PublicReplayRead.exitCode, 0, c2PublicReplayRead.stderr);
  const c2PublicReplay = c2PublicReplayRead.outcomes.at(-1);
  assert.equal(c2PublicReplay.disposition, "succeeded");
  assert.equal(c2PublicReplay.result.kind, "public_replay_projection");
  assert.equal(c2PublicReplay.result.replayRef, c2Outcome.replayRef);
  assert.equal(c2PublicReplay.result.replayDigest, c2Outcome.replayDigest);
  assert.deepEqual(
    c2PublicReplay.projectionAuthority,
    c2Outcome.projectionAuthority,
  );

  const forbiddenSources = [
    ["root-result-refused", rootResult, ids.graphFunctionRef],
    [
      "branch-application-result-refused",
      branchApplicationResult,
      ids.branchApplicationGraphFunctionRef,
    ],
    ["c1-root-result-refused", c1RootResults[0], c1.graphFunctionRef],
  ];
  for (const [label, sourceEvent, expectedGraphFunctionRef] of forbiddenSources) {
    const derived = abg.deriveInvocationSourceResultBasisAtPrefix(
      c3ExactPrefix,
      {
        publicAuthorityDigest: c3Authority.authorityDigest,
        runtimeInvocationRef: c3Authority.runtimeInvocationRef,
        invocationAdmissionRef: c3Authority.invocationAdmissionRef,
        runId: c3Authority.runId,
        resultRef: sourceEvent.payload.resultRef,
      },
    );
    assert.ok(derived, label);
    assert.equal(derived.sourceGraphFunctionRef, expectedGraphFunctionRef);
    const refusal = await runPublicC2Invocation({
      harness,
      predecessor: c2Attempt.run,
      scenario: chainScenario,
      c2,
      task: c2Task,
      sourceAuthority: c3Authority,
      runtimeAuthority: c2Outcome.projectionAuthority,
      sourceResultRef: sourceEvent.payload.resultRef,
      label,
    });
    assertPublicSourceRefusal(
      refusal,
      closeHandoff(c2Outcome.projectionAuthority),
    );
  }

  const wrongRunRefusal = await runPublicC2Invocation({
    harness,
    predecessor: c2Attempt.run,
    scenario: chainScenario,
    c2,
    task: c2Task,
    sourceAuthority: c3Authority,
    runtimeAuthority: c2Outcome.projectionAuthority,
    sourceResultRef: c2Outcome.resultRef,
    label: "wrong-run-result-refused",
  });
  assertPublicSourceRefusal(
    wrongRunRefusal,
    closeHandoff(c2Outcome.projectionAuthority),
  );
  assert.equal(
    abg.deriveInvocationSourceResultBasisAtPrefix(c3ExactPrefix, {
      publicAuthorityDigest: c3Authority.authorityDigest,
      runtimeInvocationRef: c3Authority.runtimeInvocationRef,
      invocationAdmissionRef: c3Authority.invocationAdmissionRef,
      runId: c2Outcome.runId,
      resultRef: c3Outcome.resultRef,
    }),
    null,
  );

  const rootJudgment = c3Events.find((event) =>
    event.kind === "c_call_judged" &&
    event.aggregateId === rootResult.aggregateId &&
    event.payload.resultRef === rootResult.payload.resultRef
  );
  assert.ok(rootJudgment);
  const rehashBasis = (patch) => {
    const {
      kind,
      schemaVersion,
      basisRef: _basisRef,
      basisDigest: _basisDigest,
      ...body
    } = sourceResultBasis;
    const crossedBody = { ...body, ...patch };
    const basisDigest = harness.product.sha256Canonical(crossedBody);
    return {
      kind,
      schemaVersion,
      basisRef:
        `invocation-source-result://abiogenesis/${basisDigest.slice("sha256:".length)}`,
      basisDigest,
      ...crossedBody,
    };
  };
  const crossedBases = [
    rehashBasis({
      publicAuthorityDigest: c2Outcome.projectionAuthority.authorityDigest,
      sourceInvocationAdmissionRef:
        c2Outcome.projectionAuthority.invocationAdmissionRef,
      sourceInvocationRef:
        c2Outcome.projectionAuthority.runtimeInvocationRef,
      sourceRunId: c2Outcome.runId,
    }),
    rehashBasis({ sourceGraphCallId: rootResult.graphCallId }),
    rehashBasis({ sourceGraphFunctionRef: rootResult.graphFunctionRef }),
    rehashBasis({ sourceCCallRef: rootResult.aggregateId }),
    rehashBasis({ sourceResultAdmissionEventRef: rootResult.eventId }),
    rehashBasis({ sourceResultJudgmentEventRef: rootJudgment.eventId }),
    rehashBasis({ sourceResultRef: rootResult.payload.resultRef }),
    rehashBasis({ sourceResultDigest: rootResult.payload.resultDigest }),
    rehashBasis({ sourceResultContractRef: c2.observationContractRef }),
    rehashBasis({
      sourceResultValue: c1RootResults[0].payload.value,
      sourceResultValueDigest: c1RootResults[0].payload.valueDigest,
    }),
    rehashBasis({
      sourceReplayRef: c2Outcome.replayRef,
      sourceReplayDigest: c2Outcome.replayDigest,
    }),
    rehashBasis({
      sourceWorkspaceId: "workspace://t287/c3/crossed",
      workspaceBindingId: "workspace-binding://t287/c3/crossed",
      workspaceBindingDigest:
        harness.product.sha256Canonical({ crossed: "workspace" }),
    }),
  ];
  for (const crossedBasis of crossedBases) {
    assert.equal(abg.isInvocationSourceResultBasis(crossedBasis), true);
    assert.equal(
      abg.rehydrateInvocationSourceResultBasisAtDurablePrefix(
        c3Authority.prefix,
        crossedBasis,
      ),
      null,
    );
  }
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
