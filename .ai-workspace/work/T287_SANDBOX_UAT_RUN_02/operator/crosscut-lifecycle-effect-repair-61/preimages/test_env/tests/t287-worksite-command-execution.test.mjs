import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";
import { constructInstalledPublicDefinitionCall } from "../support/installed-public-definition-call.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from "../support/fresh-process-runtime-proof.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const execFileAsync = promisify(execFile);
const OWNER_ACTOR_REF = "actor://abiogenesis/worksite/construction-worker@5";
const SOURCE_RELATIVE_PATH = "c2-source/service.mjs";
const SOURCE_BYTES = Buffer.from([
  "import http from 'node:http';",
  "import { writeFileSync } from 'node:fs';",
  "import { fileURLToPath } from 'node:url';",
  "export function answer() { return 42; }",
  "if (process.argv[1] === fileURLToPath(import.meta.url)) {",
  "  const portFile = process.argv[2];",
  "  const server = http.createServer((_request, response) => {",
  "    response.statusCode = 201;",
  "    response.end('abi-ok');",
  "    server.close();",
  "  });",
  "  server.listen(0, '127.0.0.1', () => {",
  "    const address = server.address();",
  "    if (address === null || typeof address === 'string') throw new Error('missing port');",
  "    writeFileSync(portFile, `${address.port}\\n`, { flag: 'wx' });",
  "  });",
  "}",
  "",
].join("\n"), "utf8");

test("C2 finite host timer schema and constructor share bounds without changing grace", async (t) => {
  const c2 = await import("../../build/code/src/product/worksite_command_execution.js");
  const { loadWorksiteOwner, worksiteFixture } = await import("../support/t287-generic-job-worksite.mjs");
  const { default: Ajv } = await import("ajv");
  const env = await worksiteFixture(await loadWorksiteOwner());
  t.after(() => rm(env.scratch, { recursive: true, force: true }));
  const command = { commandId: "command://c2/timer-domain", executable: "node", args: ["--version"],
    relativeCwd: ".", environment: {}, timeoutMs: 18_000_000, terminationGraceMs: 10_000, expectedReports: [] };
  const input = { ...env, commands: [command], outcomePredicates: [], protectedSubjects: [],
    allowedWriteTerritories: [{ pathKind: "subtree", relativePath: "outputs" }] };
  const validate = new Ajv({ strict: false }).compile({ type: "object", additionalProperties: false,
    required: ["commands", "outcomePredicates"], properties: c2.worksiteCommandConfigurationInputSchema() });
  const supplied = (row) => ({ commands: [row], outcomePredicates: [] });
  for (const timeoutMs of [18_000_000, 2_147_483_647]) {
    const row = { ...command, timeoutMs };
    assert.equal(validate(supplied(row)), true, String(timeoutMs));
    const bound = c2.constructWorksiteCommandConfiguration({ ...input, commands: [row] });
    assert.equal(bound.commands[0].timeoutMs, timeoutMs);
    assert.equal(c2.worksiteCommandConfigurationMatches({ ...input, commands: [row] },
      JSON.parse(JSON.stringify(bound))), true);
  }
  for (const timeoutMs of [2_147_483_648, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity, NaN]) {
    const row = { ...command, timeoutMs };
    assert.equal(validate(supplied(row)), false, String(timeoutMs));
    assert.throws(() => c2.constructWorksiteCommandConfiguration({ ...input, commands: [row] }),
      TypeError, String(timeoutMs));
  }
  for (const terminationGraceMs of [0, 1.5, 30_001]) {
    const row = { ...command, terminationGraceMs };
    assert.equal(validate(supplied(row)), false);
    assert.throws(() => c2.constructWorksiteCommandConfiguration({ ...input, commands: [row] }), TypeError);
  }
  // The existing relational grace rule is owned by construction, rather than the scalar schema.
  for (const terminationGraceMs of [10_000, 10_001]) {
    const row = { ...command, timeoutMs: 10_000, terminationGraceMs };
    assert.equal(validate(supplied(row)), true);
    assert.throws(() => c2.constructWorksiteCommandConfiguration({ ...input, commands: [row] }), TypeError);
  }
});

async function installConstructionTransport(scratch) {
  const command = join(scratch, "c2-bin", "claude-construction");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  if (prompt.length === 0) throw new Error('missing construction prompt');",
    "  const schemaIndex = process.argv.indexOf('--json-schema');",
    "  const schema = JSON.parse(process.argv[schemaIndex + 1]);",
    "  const targetSchema = schema.properties.files.items.properties.targetRef;",
    "  const targetRefs = targetSchema.enum ?? [targetSchema.const];",
    `  const replacementBase64 = ${JSON.stringify(SOURCE_BYTES.toString("base64"))};`,
    "  const result = {",
    "    kind: 'worksite_construction_worker_result',",
    "    schemaVersion: '5.0.0',",
    "    files: targetRefs.map((targetRef) => ({",
    "      kind: 'worksite_candidate_file', schemaVersion: '5.0.0',",
    "      targetRef, replacementBase64,",
    "    })),",
    "  };",
    "  process.stdout.write(`${JSON.stringify({ type: 'system', subtype: 'init', model: 'c2-c1-proof' })}\\n`);",
    "  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) })}\\n`);",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

function directOccurrence(label, nodeRef) {
  return {
    cCallRef: `c-call://t287/c2/${label}`,
    runId: `run://t287/c2/${label}`,
    graphCallId: `graph-call://t287/c2/${label}`,
    frameId: `frame://t287/c2/${label}`,
    programLocusRef: nodeRef,
    taskOrdinal: 0,
    attempt: 1,
    executionAuthority: null,
  };
}

function attemptRefForOccurrence(product, occurrence) {
  const digest = product.sha256Canonical({
    cCallRef: occurrence.cCallRef,
    runId: occurrence.runId,
    graphCallId: occurrence.graphCallId,
    frameId: occurrence.frameId,
    taskOrdinal: occurrence.taskOrdinal,
    attempt: occurrence.attempt,
  });
  return `worksite-command-attempt://abiogenesis/${digest.slice("sha256:".length)}`;
}

function helperPlanForOccurrence(product, task, occurrence) {
  return product.worksiteCommandExecutionHelperPlan(
    task,
    attemptRefForOccurrence(product, occurrence),
  );
}

function launchManifestPathForPlan(plan) {
  return join(dirname(plan.taskManifestPath), "launch.json");
}

function exactHelperExchange(product, prepared, plan, label, finalOutput = "{}") {
  const request = prepared.workerRequest;
  const emptyDigest = product.sha256Bytes(Buffer.alloc(0));
  return {
    kind: "actor_process_carrier_validation",
    schemaVersion: "5.0.0",
    disposition: "valid",
    request,
    observation: {
      actorInvocationRef: `actor-invocation://t287/c2/${label}`,
      actorRef: request.actorRef,
      workerBindingRef: request.workerBindingRef,
      implementationRef: request.implementationRef,
      inputDigest: request.inputDigest,
      materializationPlanRef: request.materializationPlanRef,
      rendererRef: request.rendererRef,
      instructionContractRef: request.instructionContractRef,
      resultContractRef: request.resultContractRef,
      processRef: `process://t287/c2/${label}`,
      transportBindingRef: `transport-binding://t287/c2/${label}`,
      transportBindingDigest: product.sha256Canonical({ label, kind: "binding" }),
      disposition: "success",
      failureClass: null,
      finalOutput,
      observedOutputDigest: product.sha256Bytes(Buffer.from(finalOutput, "utf8")),
      promptDigest: product.sha256Bytes(Buffer.from(request.prompt, "utf8")),
      transportDigest: product.sha256Canonical({ label, kind: "transport" }),
      transportLane: request.transportLane,
      processStatus: 0,
      processSignal: null,
      timeoutClass: null,
      timedOut: false,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: [],
      structuredEventCount: 2,
      progressEventCount: 0,
      toolCallCount: 1,
      toolInvocations: [{
        kind: "worker_tool_invocation_evidence",
        schemaVersion: "5.0.0",
        ordinal: 0,
        toolUseRef: `tool-use://t287/c2/${label}`,
        toolName: "Bash",
        inputDigest: plan.toolInputDigest,
        inputByteLength: plan.toolInputByteLength,
      }],
      apiRetryCount: 0,
      stdoutByteLength: 0,
      stderrByteLength: 0,
      artifactDigests: {
        output: emptyDigest,
        prompt: emptyDigest,
        stderr: emptyDigest,
        stdout: emptyDigest,
        transport: emptyDigest,
      },
    },
  };
}

async function executeHelper(plan) {
  return execFileAsync("/bin/sh", ["-c", plan.toolCommand], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

test("T-287 C2 compact acknowledgment preserves installed large-log observation and replay", {
  timeout: 180_000,
}, async (context) => {
  const builtProduct = await import(pathToFileURL(
    join(packageRoot, "build/code/src/product/index.js"),
  ).href);
  const c1 = builtProduct.WORKSITE_CONSTRUCTION_IDS;
  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  context.after(() => {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
  });
  let sourceTask;
  let sourcePath;
  const environment = await setupInstalledRootExecutionBasis(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_construction",
    authorizedActorRef: OWNER_ACTOR_REF,
    actorRef: OWNER_ACTOR_REF,
    programRef: c1.programRef,
    graphFunctionRef: c1.graphFunctionRef,
    inputContractRef: c1.taskContractRef,
    inputFactory: async ({ product, workspaceAuthority, workspaceBinding, capabilityGrant }) => {
      const relativeRoot = "c2-source";
      await mkdir(join(workspaceAuthority.canonicalRoot, relativeRoot), { recursive: true });
      sourcePath = join(workspaceAuthority.canonicalRoot, SOURCE_RELATIVE_PATH);
      const subject = product.constructWorksiteSubject({
        workspaceAuthorityBasis: workspaceAuthority,
        workspaceBinding,
        subjectUri: pathToFileURL(sourcePath).href,
        relativePath: SOURCE_RELATIVE_PATH,
      });
      const territory = product.constructWorksiteTerritory({
        workspaceAuthorityBasis: workspaceAuthority,
        workspaceBinding,
        territoryUri: pathToFileURL(join(workspaceAuthority.canonicalRoot, relativeRoot)).href,
        relativeRoot,
      });
      sourceTask = product.constructWorksiteConstructionTask({
        workspaceAuthorityBasis: workspaceAuthority,
        workspaceBinding,
        capabilityGrant,
        prompt: "Return the declared service source as the one exact target replacement.",
        targets: [{ subject, territory, predecessorObservation: await product.observeWorksiteSubject(
          workspaceAuthority, workspaceBinding, subject,
        ) }],
      });
      return sourceTask;
    },
  });
  const { product, abg, gtl, hog, workspaceBinding, artifactTruth } = environment;
  const c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  process.env.ABG_TS_CLAUDE_COMMAND = await installConstructionTransport(environment.scratch);
  const opened = abg.openTraversalScope(
    environment.store,
    abg.selectHeldEventStoreDurablePrefix(environment.store),
    { kind: "root", executionBasis: environment.executionBasis },
    { eventTime: "2026-09-09T00:00:00.000Z", correlationId: "correlation://t287/c2-ack/source", causationEventRefs: [] },
  );
  assert.equal(opened.kind, "traversal_scope_open_admission");
  const sourceCompletion = await hog.executeGraphTraversal({
    store: environment.store,
    predecessorPrefix: opened.successorPrefix,
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
    program: environment.program,
    programPublication: environment.executionResolution.programPublication,
    programValidation: environment.programValidation,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    implementationSet: environment.implementationSet,
    interactionSet: environment.executionBasisAdmission.interactionSet,
    leafPort: environment.leafPort,
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input: environment.input,
    inputDigest: environment.rawInput.subjectDigest,
    closureContract: environment.closureContract,
    eventTime: "2026-09-09T00:00:00.000Z",
    correlationId: "correlation://t287/c2-ack/source",
  });
  assert.equal(sourceCompletion.disposition, "closed", JSON.stringify(sourceCompletion));
  const sourceEvents = environment.store.readAll();
  const sourceResultEvent = sourceEvents.find((event) =>
    event.kind === "c_call_result_admitted" && event.graphFunctionRef === c1.graphFunctionRef &&
      event.payload.contractRef === c1.resultContractRef
  );
  assert.ok(sourceResultEvent);
  const sourceBasis = abg.deriveInvocationSourceResultBasisAtPrefix(
    abg.selectValidatedRuntimeEventPrefix(sourceEvents),
    {
      publicAuthorityDigest: environment.invocationAdmission.publicRequestDigest,
      runtimeInvocationRef: environment.invocationAdmission.invocationRef,
      invocationAdmissionRef: environment.invocationAdmission.invocationAdmissionRef,
      runId: opened.scope.runId,
      resultRef: sourceResultEvent.payload.resultRef,
    },
  );
  assert.ok(sourceBasis, "C2 requires the actual admitted and judged C1 result");
  assert.equal(sourceBasis.sourceResultValueDigest, product.sha256Canonical(sourceCompletion.resultValue));
  const verified = environment.verified;
  const c2Publication = gtl.constructWorksiteCommandExecutionModulePublication({
    productId: verified.productId,
    artifactDigest: verified.artifactDigest,
    productContentDigest: verified.productContentDigest,
    productManifestDigest: verified.manifestDigest,
    packageName: verified.packageName,
    packageVersion: verified.packageVersion,
  });
  const catalog = product.admitGraphFunctionCatalog({
    workspaceBinding: environment.bindingCandidate,
    resolvedLock: environment.lock,
    verifiedProducts: environment.verifiedProducts,
    installedProducts: environment.installCandidates,
    publications: [...environment.publications, c2Publication],
  });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(catalog, [c1.graphFunctionRef, c2.graphFunctionRef].sort());
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog, catalogView, admittedInstalls: environment.admittedInstalls,
    verifyInstallAdmission: (install) => abg.hasAdmittedProductInstall(artifactTruth, install),
    programRef: c2.programRef,
    selection: { kind: "direct", catalogHandle: c2.graphFunctionRef },
  });
  assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
  const policy = product.constructRootInvocationPolicy(workspaceBinding, resolution.program, [], ["F_P"]);
  const grantBasis = {
    admittedInstalls: environment.admittedInstalls, workspaceBinding,
    fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
  };
  const capabilityGrant = product.constructCapabilityGrant(
    policy, OWNER_ACTOR_REF, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis,
  );
  const sourceResult = sourceCompletion.resultValue;
  const task = product.constructWorksiteCommandExecutionTask({
    workspaceAuthorityBasis: environment.workspaceAuthority,
    workspaceBinding,
    capabilityGrant,
    sourceConstructionResultRef: sourceResult.resultRef,
    sourceConstructionResultDigest: sourceResult.resultDigest,
    sourceConstructionResult: sourceResult,
    protectedObservations: sourceResult.members.map((member, ordinal) => ({
      sourceMemberRef: member.inputMemberRef,
      subject: sourceTask.targets[ordinal].subject,
      observation: member.successorObservation,
    })),
    commands: [
      {
        commandId: "command://c2-ack/large-nonzero",
        executable: process.execPath,
        args: ["-e", "const fs=require('node:fs');fs.writeSync(1,Buffer.alloc(210000,65));fs.writeSync(2,Buffer.alloc(210000,66));process.exit(7)"],
        relativeCwd: ".", environment: {}, timeoutMs: 5_000, terminationGraceMs: 1_000,
        expectedReports: [],
      },
      {
        commandId: "command://c2-ack/small-success",
        executable: process.execPath, args: ["-e", "process.stdout.write('small\\n')"],
        relativeCwd: ".", environment: {}, timeoutMs: 5_000, terminationGraceMs: 1_000,
        expectedReports: [],
      },
    ],
    outcomePredicates: [
      { predicateId: "predicate://c2-ack/nonzero", predicateKind: "process_exit", declaration: { validationCommandId: "command://c2-ack/large-nonzero", equals: 7 } },
      { predicateId: "predicate://c2-ack/stdout", predicateKind: "stdout_exact", declaration: { validationCommandId: "command://c2-ack/small-success", equals: "small\n" } },
    ],
    allowedWriteTerritories: [{ pathKind: "subtree", relativePath: "evidence" }],
  });
  const installedPublic = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  const authority = product.constructInvocationAuthority(
    OWNER_ACTOR_REF, workspaceBinding, catalogView, resolution.program.programRef,
    resolution.selectedCatalogEntry, policy, [capabilityGrant], grantBasis,
  );
  const closeHandoff = environment.store.projectReopenAuthorityAndClose();
  const eventResource = {
    kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff),
  };
  const program = { ref: resolution.resolution.programRef, digest: resolution.resolution.programDigest };
  const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
  const view = { ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice(7)}`, digest: catalogView.viewDigest };
  const steeringDigest = product.sha256Canonical(eventResource);
  const definition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find((row) =>
    row.definitionKey.operationId === "abg.operation.run.invoke" && row.definitionKey.memberKey === "invoke"
  );
  const call = constructInstalledPublicDefinitionCall({
    product, installedPublic,
    definitionContractCoordinates: verified.definitionContractCoordinates,
    contractCatalog: verified.definitionContractCoordinates.operations.find((row) => row.operationId === "abg.operation.run.invoke")
      .members.find((row) => row.memberKey === "invoke").slots.request.contractCatalog,
    operationId: "abg.operation.run.invoke", memberKey: "invoke",
    request: {
      program, catalogHandle: c2.graphFunctionRef, inputContract, input: task,
      catalogView: view, allowlist: catalogView.allowlist,
      sourceBasis: {
        kind: "admitted_source_result",
        projectionAuthority: { ref: environment.invocationAdmission.publicRequestInvocationRef, digest: sourceBasis.publicAuthorityDigest },
        sourceResult: { ref: sourceBasis.sourceResultRef, digest: sourceBasis.sourceResultDigest },
      },
    },
    slots: {
      workspace_binding: { ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest },
      product_set: environment.admittedInstalls.map(product.productInstallCoordinate),
      dependency_lock: { ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest },
      catalog_scope: { catalog: { ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice(7)}`, digest: catalog.basisDigest }, view, allowlist: catalogView.allowlist },
      execution_program: program,
      graph_function: { graphFunction: { ref: resolution.resolution.graphFunctionRef, digest: resolution.resolution.graphFunctionDigest }, membership: resolution.resolution.programGraphFunctionMembership },
      input_contract: { contract: inputContract, valueRef: task.taskRef, valueDigest: product.sha256Canonical(task), value: task },
      session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [{ ref: capabilityGrant.grantRef, digest: capabilityGrant.grantDigest }] },
      actor: { actor: { ref: OWNER_ACTOR_REF, digest: product.sha256Canonical({ actorRef: OWNER_ACTOR_REF }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steeringDigest.slice(7)}`, digest: steeringDigest },
      verification_references: null, execution_basis: null,
    },
    resources: {
      kind: "run_invocation_resource_assertion", schemaVersion: "5.0.0",
      eventResource, catalog, catalogView, applications: [],
      source: { kind: "admitted_source_result", basis: sourceBasis },
    },
    requestRef: "request://t287/c2-ack", correlationRef: "correlation://t287/c2-ack",
    eventTime: "2026-09-09T00:00:00.000Z", provenanceRefs: ["provenance://t287/c2-ack/deterministic-fixture"],
  });
  // The fixture executes the actual installed helper once and relays only its stdout.
  const command = join(environment.scratch, "c2-bin/claude-compact-command");
  const stdoutPath = join(environment.scratch, "actual-helper-stdout.txt");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "const {spawnSync}=require('node:child_process');const fs=require('node:fs');let prompt='';",
    "process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>prompt+=chunk);",
    "process.stdin.on('end',()=>{",
    "const input=JSON.parse(prompt.split('\\n\\n')[1]);",
    "const tool={type:'tool_use',id:'toolu_c2_ack',name:'Bash',input};",
    "console.log(JSON.stringify({type:'system',subtype:'init',model:'c2-ack-proof'}));",
    "console.log(JSON.stringify({type:'assistant',message:{content:[tool]}}));",
    "const helper=spawnSync('/bin/sh',['-c',input.command],{encoding:'utf8',maxBuffer:4*1024*1024});",
    "if(helper.status!==0)throw Error(helper.stderr);",
    `fs.writeFileSync(${JSON.stringify(stdoutPath)},helper.stdout);`,
    "console.log(JSON.stringify({type:'result',subtype:'success',result:helper.stdout.trimEnd()}));",
    "});", "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  process.env.ABG_TS_CLAUDE_COMMAND = command;
  const outcome = await installedPublic.runInstalledDefinitionCallTransport({ kind: "reopen", closeHandoff }, call);
  assert.equal(outcome.kind, "installed_definition_call_transport_result", JSON.stringify(outcome));
  assert.equal(outcome.receipt.exitCode, 0, JSON.stringify(outcome));
  const c2Close = outcome.receipt.resources.eventResource.closeHandoff;
  const c2RunId = outcome.receipt.ownerOutput.value.run.ref;
  const events = abg.readRuntimeEventsAtDurablePrefix(c2Close.prefix);
  const actorResult = events.find((event) => event.kind === "actor_result_artifact_observed" && event.payload.inputDigest === product.sha256Canonical(task));
  assert.ok(actorResult);
  const helperStdout = await readFile(stdoutPath, "utf8");
  const ack = JSON.parse(helperStdout);
  const ackKeys = ["kind", "schemaVersion", "taskRef", "taskDigest", "attemptRef", "helperArtifactRef", "helperArtifactDigest"].sort();
  assert.deepEqual(Object.keys(ack).sort(), ackKeys);
  assert.equal(helperStdout, `${product.canonicalJson(ack)}\n`);
  assert.equal(Buffer.byteLength(helperStdout) < 2048, true);
  assert.equal(actorResult.payload.finalOutput, helperStdout.trimEnd());
  assert.equal(actorResult.payload.toolCallCount, 1);
  const admitted = events.find((event) => event.kind === "c_call_result_admitted" && event.payload.value?.kind === "worksite_command_execution_observation");
  assert.ok(admitted, "the full observation must pass ordinary ABG result admission");
  const observation = admitted.payload.value;
  assert.equal(product.isWorksiteCommandExecutionObservation(observation), true);
  const artifactBytes = await readFile(observation.provenance.helperArtifactPath);
  const artifact = JSON.parse(artifactBytes.toString("utf8"));
  assert.equal(artifactBytes.byteLength > 256 * 1024, true);
  assert.deepEqual(observation.commandResults, artifact.commandResults);
  assert.deepEqual(observation.predicateObservations, artifact.predicateObservations);
  assert.equal(ack.helperArtifactRef, artifact.artifactRef);
  assert.equal(ack.helperArtifactDigest, artifact.artifactDigest);
  assert.deepEqual(Buffer.from(observation.commandResults[0].stdout.payload, "base64"), Buffer.alloc(210000, 65));
  assert.deepEqual(Buffer.from(observation.commandResults[0].stderr.payload, "base64"), Buffer.alloc(210000, 66));
  assert.deepEqual(observation.commandResults.map((row) => row.exitStatus), [7, 0]);
  assert.equal(observation.predicateObservations[0].observedValue, 7);
  const reopened = abg.reopenEventStore(c2Close.reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context");
  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg, product, installedPackageRoot: environment.installedRoot, store: reopened.store,
    requests: [{ rowId: "c2-compact-ack-runtime", owner: "abg", exportName: "projectRuntimeTruthAtDurablePrefix", input: "durable_prefix", args: [c2RunId] }],
  });
  const replay = freshProof.retainedRows[0].projection.replayState;
  assert.equal(replay.runtimeStatus, "closed");
  assert.deepEqual(replay.cCalls.find((row) => row.resultValue?.kind === observation.kind).resultValue, observation);

  // These owner-local negatives reuse one actual helper artifact; they admit no events.
  const implementation = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/implementation/worksite_command_execution.js")).href);
  const commandProduct = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/product/worksite_command_execution.js")).href);
  const occurrence = directOccurrence("compact-ack-negatives", c2.nodeRef);
  const plan = helperPlanForOccurrence(product, task, occurrence);
  const prepared = await implementation.realizeWorksiteCommandExecution(task, occurrence);
  const execution = await executeHelper(plan);
  const raw = JSON.parse(execution.stdout);
  const exchange = exactHelperExchange(product, prepared, plan, "compact-ack-negatives", execution.stdout.trimEnd());
  assert.equal((await prepared.complete(exchange)).disposition, "success");
  const schema = prepared.workerRequest.responseJsonSchema;
  assert.deepEqual([...schema.required].sort(), ackKeys);
  assert.deepEqual(Object.keys(schema.properties).sort(), ackKeys);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.taskRef.const, task.taskRef);
  assert.equal(schema.properties.attemptRef.const, plan.attemptRef);
  const { default: Ajv } = await import(pathToFileURL(join(environment.installedRoot, "node_modules/ajv/dist/ajv.js")).href);
  const validateAck = new Ajv({ strict: true }).compile(schema);
  assert.equal(validateAck(raw), true, JSON.stringify(validateAck.errors));
  assert.equal(validateAck({ ...raw, commandResults: [] }), false);
  assert.equal(validateAck({ ...raw, attemptRef: `${raw.attemptRef}/wrong` }), false);
  const refusals = [];
  async function refuses(label, candidateExchange, failureClass) {
    const result = await prepared.complete(candidateExchange);
    assert.equal(result.disposition, "failure", label);
    assert.equal(result.resultCandidate.failureClass, failureClass, label);
    refusals.push({ label, failureClass });
  }
  const rawCases = [
    ["crossed-task-ref", { ...raw, taskRef: `${raw.taskRef}/wrong` }],
    ["crossed-task-digest", { ...raw, taskDigest: `sha256:${"0".repeat(64)}` }],
    ["crossed-attempt", { ...raw, attemptRef: `${raw.attemptRef}/wrong` }],
    ["crossed-artifact-ref", { ...raw, helperArtifactRef: `${raw.helperArtifactRef}/wrong` }],
    ["crossed-artifact-digest", { ...raw, helperArtifactDigest: `sha256:${"0".repeat(64)}` }],
    ["coherent-foreign-artifact", { ...raw, helperArtifactRef: `worksite-command-helper-artifact://abiogenesis/${"0".repeat(64)}`, helperArtifactDigest: `sha256:${"0".repeat(64)}` }],
    ["unknown-raw-key", { ...raw, artifactPath: plan.artifactPath }],
    ["legacy-computed-arrays", { ...raw, commandResults: artifact.commandResults, predicateObservations: artifact.predicateObservations }],
    ["missing-ack", {}],
  ];
  for (const [label, value] of rawCases) {
    await refuses(label, exactHelperExchange(product, prepared, plan, label, JSON.stringify(value)), "result_contract_failure");
  }
  await refuses("non-json-ack", exactHelperExchange(product, prepared, plan, "non-json-ack", ""), "result_contract_failure");
  for (const [label, mutate] of [
    ["missing-helper-tool", (value) => { value.observation.toolCallCount = 0; value.observation.toolInvocations = []; }],
    ["extra-tool", (value) => { value.observation.toolCallCount = 2; value.observation.toolInvocations.push({ ...value.observation.toolInvocations[0], ordinal: 1, toolUseRef: "tool-use://t287/c2/extra" }); }],
    ["wrong-tool", (value) => { value.observation.toolInvocations[0].toolName = "Read"; }],
    ["wrong-tool-input", (value) => { value.observation.toolInvocations[0].inputDigest = `sha256:${"0".repeat(64)}`; }],
  ]) {
    const value = structuredClone(exchange); mutate(value);
    await refuses(label, value, "transport_identity_mismatch");
  }
  const fullBytes = await readFile(plan.artifactPath);
  const full = JSON.parse(fullBytes.toString("utf8"));
  for (const [label, mutate] of [
    ["altered-helper-stream", (value) => { value.commandResults[0].stdout.payload = ""; }],
    ["reordered-full-command-vector", (value) => { value.commandResults.reverse(); }],
    ["reordered-full-predicate-vector", (value) => { value.predicateObservations.reverse(); }],
  ]) {
    const value = structuredClone(full); mutate(value);
    assert.equal(commandProduct.isWorksiteCommandHelperArtifact(task, value), false, label);
    assert.throws(() => commandProduct.constructWorksiteCommandHelperArtifact({ ...value, task }), undefined, label);
    await writeFile(plan.artifactPath, `${product.canonicalJson(value)}\n`);
    try { await refuses(label, exchange, "helper_artifact_contract_failure"); }
    finally { await writeFile(plan.artifactPath, fullBytes); }
  }
  for (const [label, path] of [["altered-task-manifest", plan.taskManifestPath], ["altered-launch-manifest", launchManifestPathForPlan(plan)]]) {
    const bytes = await readFile(path);
    await writeFile(path, Buffer.concat([bytes, Buffer.from("\n")]));
    try { await refuses(label, exchange, "helper_manifest_mismatch"); }
    finally { await writeFile(path, bytes); }
  }
  await rename(plan.artifactPath, `${plan.artifactPath}.retained`);
  try { await refuses("missing-helper-artifact", exchange, "helper_artifact_absent"); }
  finally { await rename(`${plan.artifactPath}.retained`, plan.artifactPath); }
  await writeFile(sourcePath, Buffer.from("altered protected source\n"));
  try { await refuses("altered-protected-source", exchange, "protected_observation_mismatch"); }
  finally { await writeFile(sourcePath, SOURCE_BYTES); }
  const { kind: observationKind, schemaVersion: observationVersion, observationDigest: _oldDigest, observationRef: _oldRef, ...observationBody } = observation;
  const reorderedBody = { ...observationBody, predicateObservations: [...observation.predicateObservations].reverse() };
  const reorderedDigest = product.sha256Canonical(reorderedBody);
  assert.equal(product.isWorksiteCommandExecutionObservation({
    kind: observationKind, schemaVersion: observationVersion, ...reorderedBody, observationDigest: reorderedDigest,
    observationRef: `worksite-command-execution-observation://abiogenesis/${reorderedDigest.slice(7)}`,
  }), false, "re-signed observations must retain full-vector validation");
  assert.equal(await product.installedProductContentMatches(environment.installCandidate), true);
  context.diagnostic(JSON.stringify({
    proof: "C2 installed compact helper stdout/full observation/fresh replay",
    artifactSha256: await product.sha256File(environment.artifactPath),
    helperStdoutBytes: Buffer.byteLength(helperStdout),
    helperArtifactBytes: artifactBytes.byteLength,
    stdoutBytes: observation.commandResults[0].stdout.byteLength,
    stderrBytes: observation.commandResults[0].stderr.byteLength,
    rawOutputDigest: product.sha256Bytes(Buffer.from(actorResult.payload.finalOutput, "utf8")),
    helperArtifactDigest: artifact.artifactDigest,
    observationDigest: observation.observationDigest,
    replayDigest: replay.replayDigest,
    subjectExitStatuses: observation.commandResults.map((row) => row.exitStatus),
    refusals,
    installedProductUnchanged: true,
  }));
});
