import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, mkdir, readdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
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
  "  const note = (phase) => console.log(JSON.stringify({ proof: 'c2-http-process', pid: process.pid, phase }));",
  "  note('started');",
  "  const server = http.createServer((_request, response) => {",
  "    response.statusCode = 201;",
  "    response.setHeader('Connection', 'close');",
  "    response.once('finish', () => { note('response-finished'); server.close(() => note('server-closed')); });",
  "    response.end('abi-ok');",
  "  });",
  "  server.listen(0, '127.0.0.1', () => {",
  "    const address = server.address();",
  "    if (address === null || typeof address === 'string') throw new Error('missing port');",
  "    writeFileSync(portFile, `${address.port}\\n`, { flag: 'wx' });",
  "  });",
  "}",
  "",
].join("\n"), "utf8");

const proofJson = (value) => `${JSON.stringify(value, (_key, item) =>
  typeof item === "bigint" ? item.toString() : item, 2)}\n`;
const proofError = (error) => error == null ? null : ({ name: error.name,
  message: error.message, stack: error.stack, code: error.code, errno: error.errno, syscall: error.syscall });
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function selectedInstalledProof() {
  const path = process.env.ABG_T287_C2_PROOF_CONFIG;
  if (path === undefined) return null;
  const bytes = await readFile(path);
  const configuration = JSON.parse(bytes.toString("utf8"));
  assert.equal(configuration.effectGrant, "P5_INSTALLED_EXECUTION_GRANTED_BY_EXECUTIVE");
  assert.equal(configuration.proofPackageRoot, packageRoot);
  assert.equal(await realpath(packageRoot), packageRoot);
  for (const key of ["artifactPath", "installHost", "scratchParent", "evidenceRoot"])
    assert.equal(resolve(configuration[key]), configuration[key], `${key} must be absolute and canonical`);
  for (const key of ["artifactPath", "installHost", "scratchParent"])
    assert.equal(await realpath(configuration[key]), configuration[key]);
  assert.equal(await realpath(dirname(configuration.evidenceRoot)), dirname(configuration.evidenceRoot));
  assert.equal(process.env.TMPDIR, configuration.scratchParent);
  assert.equal(tmpdir(), configuration.scratchParent);
  assert.equal(process.execPath, configuration.nodeExecutable);
  assert.equal(process.env.NODE_OPTIONS ?? "", "");
  const subjects = [
    [fileURLToPath(import.meta.url), configuration.testSha256],
    [join(packageRoot, "test_env/support/fresh-process-runtime-proof.mjs"), configuration.freshSupportSha256],
    [join(packageRoot, "test_env/support/root-installed-environment.mjs"), configuration.setupSupportSha256],
    [join(packageRoot, "test_env/falsifiers/runtime-retained-projections-worker.mjs"), configuration.replayWorkerSha256],
    [configuration.artifactPath, configuration.artifactSha256],
    [join(configuration.installHost, "node_modules/@abiogenesis/typescript-tenant/product-toolchain-manifest.json"), configuration.hostManifestSha256],
    [join(packageRoot, "product-toolchain-manifest.json"), configuration.hostManifestSha256],
  ];
  for (const [subject, expected] of subjects) {
    assert.match(expected, /^[a-f0-9]{64}$/u);
    assert.equal(sha256(await readFile(subject)), expected, subject);
  }
  await mkdir(configuration.evidenceRoot);
  const root = configuration.evidenceRoot;
  const write = (name, value) => writeFile(join(root, name), proofJson(value), { flag: "wx" });
  const writeBytes = (name, value) => writeFile(join(root, name), value, { flag: "wx" });
  await writeBytes("configuration.json", bytes);
  const proof = { configuration, root, write, writeBytes, deferredHooks: [], processes: [],
    frozenArtifact: { artifactPath: configuration.artifactPath, installHost: configuration.installHost,
      artifactSha256: configuration.artifactSha256 } };
  await write("identity.json", { testPath: fileURLToPath(import.meta.url), packageRoot, subjects,
    nodeExecutable: process.execPath, controlledProvider: true, nativeSemanticCredit: false,
    testTimeoutMs: 600_000, actorInactivityTimeoutMs: 60_000, actorAbsoluteTimeoutMs: 90_000,
    replayTimeoutMs: 30_000, replayGraceMs: 1_000 });
  return proof;
}

function processPresence(pid, group = false) {
  try { process.kill(group ? -pid : pid, 0); return "present"; }
  catch (error) { return error.code === "ESRCH" ? "absent" : "unknown"; }
}

async function retainedTransportRecord(proof, name) {
  try { return JSON.parse(await readFile(join(proof.root, name), "utf8")); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    await proof.write(`${name}.absent.json`, { path: join(proof.root, name), state: "absent" });
    return null;
  }
}

async function retainProcessAbsence(proof, label, pid, ownsGroup) {
  if (proof === null) return;
  assert.equal(Number.isSafeInteger(pid) && pid > 0, true, `${label} PID`);
  const row = { label, pid, groupId: ownsGroup && process.platform !== "win32" ? pid : null,
    directChildPresence: processPresence(pid),
    ownedGroupPresence: ownsGroup && process.platform !== "win32" ? processPresence(pid, true) : null,
    observedAt: new Date().toISOString(), physicalAbsenceIsNotAdmission: true };
  proof.processes.push(row);
  await proof.write(`${label}-absence.json`, row);
  assert.equal(row.directChildPresence, "absent", `${label} direct child remains present or unknown`);
  if (row.ownedGroupPresence !== null) assert.equal(row.ownedGroupPresence, "absent", `${label} group remains present or unknown`);
}

async function retainHttp(proof, label, observation) {
  const probe = observation.predicateObservations.find((row) => row.predicateKind === "http_response_exact").observedValue;
  if (proof !== null) {
    await proof.write(`${label}-http.json`, probe);
    const notes = Buffer.from(probe.process.stdout.payload, "base64").toString("utf8")
      .trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
    await proof.write(`${label}-http-diagnostics.json`, notes);
    const started = notes.find((row) => row.proof === "c2-http-process" && row.phase === "started");
    await retainProcessAbsence(proof, `${label}-http`, started?.pid, true);
  }
  assert.equal(probe.response.status, 201);
  assert.equal(probe.response.body, "abi-ok");
  assert.equal(probe.response.byteLength, 6);
  assert.equal(probe.portFile.state, "observed");
  assert.equal(probe.portFile.relativePath, "c2-source/evidence-http-port.txt");
  assert.equal(probe.request.port, probe.portFile.port);
  assert.equal(probe.process.exitStatus, 0);
  assert.equal(probe.process.processSignal, null);
  assert.equal(probe.process.timedOut, false);
  assert.equal(probe.process.terminationConfirmed, true);
}

function installedCommandConfiguration(c2) {
  return {
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
      { predicateId: "predicate://c2-ack/http", predicateKind: "http_response_exact", declaration: {
        validationCommandId: "command://c2-ack/small-success", status: 201, body: "abi-ok",
        launch: { executable: process.execPath,
          args: [SOURCE_RELATIVE_PATH, c2.httpPortFileArgumentPlaceholder], environment: {}, relativeCwd: ".",
          portFile: { relativePath: "c2-source/evidence-http-port.txt" }, timeoutMs: 5_000, terminationGraceMs: 1_000 },
        request: { hostname: "127.0.0.1", method: "GET", path: "/", timeoutMs: 1_000 },
      } },
    ],
    allowedWriteTerritories: [
      { pathKind: "subtree", relativePath: "evidence" },
      { pathKind: "file", relativePath: "c2-source/evidence-http-port.txt" },
    ],
  };
}

// D15 whole path. A module hook, loaded in the helper process only, records the
// final facts of every lifetime the installed lifetime module creates, one file
// per process beside its spawn arguments, and binds the one lifetime the mode
// names to a host whose group probe answers 'unknown' (`helperFailureMode`).
const helperFailureConfiguration = () => ({
  commands: [{ commandId: "command://c2-ack/helper-failure", executable: process.execPath, args: ["-e", ""],
    relativeCwd: ".", environment: {}, timeoutMs: 5_000, terminationGraceMs: 1_000, expectedReports: [] }],
  outcomePredicates: [],
  allowedWriteTerritories: [],
});
const helperFailurePaths = (scratch) => ({ root: join(scratch, "c2-helper-failure"),
  facts: join(scratch, "c2-helper-failure/helper-facts"), record: join(scratch, "c2-helper-failure/helper.json"),
  exchangeFacts: join(scratch, "c2-helper-failure/helper-exchange-facts") });
const helperFailureEnvironment = (paths, facts, unconfirmed) => ({ ...process.env, ABG_T287_HELPER_UNCONFIRMED: unconfirmed,
  NODE_OPTIONS: `--import=${pathToFileURL(join(paths.root, "register.mjs")).href}`, ABG_T287_HELPER_FACTS: facts });

// The controlled worker runs the helper once under the hook, records its exit
// and streams, refuses a helper exit of 0, and relays the helper's own
// acknowledgment, its one stdout line, unchanged.
async function helperFailureTransport(scratch, mode) {
  const paths = helperFailurePaths(scratch);
  await mkdir(paths.facts, { recursive: true }); await mkdir(paths.exchangeFacts);
  await writeFile(join(paths.root, "loader.mjs"), [
    "export async function load(url, context, next) {",
    "  if (!url.endsWith('/build/code/src/shared/owned_process_lifetime.js')) return next(url, context);",
    "  const real = JSON.stringify(url + '?real'), facts = JSON.stringify(new URL('./process/index.js', url).href);",
    "  return { format: 'module', shortCircuit: true, source: [",
    "    `import * as real from ${real};`, `import { encodeOwnedProcessFacts } from ${facts};`,",
    "    `import { writeFileSync } from 'node:fs';`, `export * from ${real};`, 'let created = 0;',",
    "    'export function createOwnedProcessLifetime(child, bounds, observers) {', '  const ordinal = created++, root = process.env.ABG_T287_HELPER_FACTS, target = String(ordinal) === process.env.ABG_T287_HELPER_UNCONFIRMED;',",
    "    '  const lifetime = real.createOwnedProcessLifetime(child, !target ? bounds : { ...bounds, terminationGraceMs: 5, host: {',",
    "    '    clock: { nowNs: () => process.hrtime.bigint(), arm: (f, ms) => setTimeout(f, ms), cancel: clearTimeout },',",
    "    `    platform: 'posix', signal: () => {}, probeGroup: () => 'unknown' } }, observers);`,",
    "    `  writeFileSync(root + '/lifetime-' + ordinal + '.process.json', JSON.stringify({ ordinal, pid: child.pid ?? null, spawnargs: child.spawnargs, target }), { flag: 'wx' });`,",
    "    `  lifetime.completion.then((value) => writeFileSync(root + '/lifetime-' + ordinal + '.json', JSON.stringify(encodeOwnedProcessFacts(value)), { flag: 'wx' }), () => {});`,",
    "    '  return lifetime;', '}', ''].join('\\n') };",
    "}", "",
  ].join("\n"), "utf8");
  await writeFile(join(paths.root, "register.mjs"),
    "import { register } from 'node:module';\nregister(new URL('./loader.mjs', import.meta.url));\n", "utf8");
  const helperEnvironment = `{...process.env,NODE_OPTIONS:${JSON.stringify(`--import=${pathToFileURL(join(paths.root, "register.mjs")).href}`)},` +
    `ABG_T287_HELPER_FACTS:${JSON.stringify(paths.facts)},ABG_T287_HELPER_UNCONFIRMED:${JSON.stringify(helperFailureMode(mode).unconfirmed)}}`;
  return [
    "#!/usr/bin/env node",
    "const {spawnSync}=require('node:child_process');const fs=require('node:fs');let prompt='';",
    "process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>prompt+=chunk);",
    "process.stdin.on('end',()=>{",
    "const taskSections=prompt.split('\\n\\n').filter(section=>section.startsWith('## task\\n'));",
    "if(taskSections.length!==1)throw Error('expected one canonical task section');",
    "const input=JSON.parse(JSON.parse(taskSections[0].slice('## task\\n'.length)).ownerPrompt.split('\\n\\n')[1]);",
    "console.log(JSON.stringify({type:'system',subtype:'init',model:'c2-helper-failure-proof'}));",
    "console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_c2_failure',name:'Bash',input}]}}));",
    `const helper=spawnSync('/bin/sh',['-c',input.command],{encoding:'utf8',maxBuffer:4*1024*1024,env:${helperEnvironment}});`,
    `fs.writeFileSync(${JSON.stringify(paths.record)},JSON.stringify({status:helper.status,signal:helper.signal,stdout:helper.stdout,stderr:helper.stderr}),{flag:'wx'});`,
    "if(helper.status===0)throw Error('the helper was expected to fail after launch');",
    "const lines=helper.stdout.split('\\n');",
    "if(lines.length!==2||lines[1]!=='')throw Error('expected exactly one acknowledgment line from the helper');",
    "console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(lines[0])}));",
    "});", "",
  ].join("\n");
}

async function assertHelperFailureAdmitted(context, { environment, product, abg, task, outcome, mode }) {
  const paths = helperFailurePaths(environment.scratch), failureMode = helperFailureMode(mode);
  const helperRecord = JSON.parse(await readFile(paths.record, "utf8"));
  assert.notEqual(helperRecord.status, 0, JSON.stringify(helperRecord));
  assert.match(helperRecord.stderr, failureMode.stderr);
  // The helper prints its acknowledgment before its non-zero exit: one canonical line.
  const ackLines = helperRecord.stdout.split("\n");
  assert.equal(ackLines.length, 2, JSON.stringify(helperRecord.stdout));
  assert.equal(ackLines[1], "");
  const ack = JSON.parse(ackLines[0]);
  assert.equal(helperRecord.stdout, `${product.canonicalJson(ack)}\n`);
  assert.equal(ack.taskRef, task.taskRef);
  assert.equal(ack.taskDigest, task.taskDigest);
  const close = outcome.receipt?.resources?.eventResource?.closeHandoff;
  assert.ok(close, JSON.stringify(outcome));
  // Cold: the events are read back from the durable log through a JSON copy of the coordinate.
  const events = abg.readRuntimeEventsAtDurablePrefix(JSON.parse(JSON.stringify(close.prefix)));
  const admitted = events.filter((event) => event.kind === "c_call_result_admitted" &&
    event.payload.value?.kind === "worksite_command_execution_failure");
  assert.equal(admitted.length, 1, JSON.stringify(events.map((event) => event.kind)));
  // The worker relayed the helper's acknowledgment unchanged.
  const actorResult = events.filter((event) => event.kind === "actor_result_artifact_observed" &&
    event.payload.inputDigest === product.sha256Canonical(task));
  assert.equal(actorResult.length, 1);
  assert.equal(actorResult[0].payload.finalOutput, ackLines[0]);
  const value = admitted[0].payload.value;
  assert.equal(admitted[0].payload.resultClass, "failure");
  assert.equal(value.failureClass, "helper_failure", JSON.stringify(value));
  assert.equal(product.isWorksiteCommandExecutionFailure(value), true);
  const { readRuntimeFailureDiagnosticSubject } = await import(pathToFileURL(
    join(environment.installedRoot, "build/code/src/abg/runtime_failure.js")).href);
  const subject = readRuntimeFailureDiagnosticSubject(value.diagnosticRef);
  assert.ok(subject, value.diagnosticRef);
  assert.equal(subject.failureClass, mode);
  assert.equal(subject.taskRef, task.taskRef);
  assert.equal(subject.taskDigest, task.taskDigest);
  const lifetimes = (await readdir(paths.facts)).filter((name) => /^lifetime-\d+\.json$/u.test(name)).sort();
  assert.deepEqual(lifetimes, Array.from({ length: failureMode.lifetimes }, (_, ordinal) => `lifetime-${ordinal}.json`));
  assert.equal(subject.diagnostic.name, "TypeError");
  assert.match(subject.diagnostic.message, failureMode.diagnostic);
  const helperFacts = JSON.parse(await readFile(join(paths.facts, `lifetime-${failureMode.failed}.json`), "utf8"));
  assert.deepEqual(subject.processFacts, helperFacts, "the failed process's own facts, as the hook recorded them");
  for (const name of lifetimes.filter((name) => name !== `lifetime-${failureMode.failed}.json`))
    assert.notDeepEqual(subject.processFacts, JSON.parse(await readFile(join(paths.facts, name), "utf8")), name);
  // The acknowledgment names the admitted subject's attempt and the published artifact.
  assert.equal(ack.attemptRef, subject.attemptRef);
  const artifactBytes = await readFile(product.worksiteCommandExecutionHelperPlan(task, ack.attemptRef).artifactPath);
  const artifact = JSON.parse(artifactBytes.toString("utf8"));
  assert.equal(artifactBytes.toString("utf8"), `${product.canonicalJson(artifact)}\n`);
  const { kind: _kind, schemaVersion: _schemaVersion, artifactRef, artifactDigest, ...artifactBody } = artifact;
  const recomputedArtifactDigest = product.sha256Canonical(artifactBody);
  assert.equal(artifactDigest, recomputedArtifactDigest);
  assert.equal(artifactRef, `worksite-command-helper-artifact://abiogenesis/${recomputedArtifactDigest.slice("sha256:".length)}`);
  assert.equal(ack.helperArtifactDigest, recomputedArtifactDigest);
  assert.equal(ack.helperArtifactRef, artifactRef);
  assert.equal(artifact.disposition, "failure");
  assert.deepEqual(artifact.failure, subject);
  const identified = await assertHelperFailureMode(mode, { task, subject, artifact, paths });
  context.diagnostic(JSON.stringify({ helperFailureClass: mode, ...identified, helperFailureSubjectBytes: Buffer.byteLength(product.canonicalJson(subject)),
    diagnosticRefBytes: Buffer.byteLength(value.diagnosticRef), resultEvent: admitted[0].eventId, acknowledgmentLineSha256: product.sha256Bytes(Buffer.from(helperRecord.stdout, "utf8")),
    acknowledgmentHelperArtifactDigest: ack.helperArtifactDigest, recomputedArtifactDigest,
    artifactFileSha256: product.sha256Bytes(artifactBytes), artifactFileBytes: artifactBytes.byteLength }));
}

// Owner-local exchanges over one failed artifact: the installed helper runs once
// more, for a direct occurrence under the same hook, and prints its
// acknowledgment before its non-zero exit. The relayed acknowledgment admits the
// failure; an acknowledgment naming another artifact, and an exchange whose
// transport did not succeed, are refused before the failure is read.
async function assertHelperFailureExchanges(context, { environment, product, task, nodeRef }) {
  const paths = helperFailurePaths(environment.scratch);
  const implementation = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/implementation/worksite_command_execution.js")).href);
  const commandProduct = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/product/worksite_command_execution.js")).href);
  const { readRuntimeFailureDiagnosticSubject } = await import(pathToFileURL(
    join(environment.installedRoot, "build/code/src/abg/runtime_failure.js")).href);
  const occurrence = directOccurrence("helper-failure-exchanges", nodeRef);
  const plan = helperPlanForOccurrence(product, task, occurrence);
  context.signal.throwIfAborted();
  const prepared = await implementation.realizeWorksiteCommandExecution(task, occurrence);
  const helper = await new Promise((resolveRun) => execFile("/bin/sh", ["-c", plan.toolCommand], {
    encoding: "utf8", maxBuffer: 4 * 1024 * 1024, env: helperFailureEnvironment(paths, paths.exchangeFacts, "0"),
  }, (error, stdout, stderr) => resolveRun({ code: error === null ? 0 : error.code, stdout, stderr })));
  assert.notEqual(helper.code, 0, JSON.stringify(helper));
  assert.match(helper.stderr, /worksite command cleanup unresolved; dependent work stopped: /u);
  const artifact = JSON.parse(await readFile(plan.artifactPath, "utf8"));
  assert.equal(artifact.disposition, "failure");
  const ack = JSON.parse(helper.stdout);
  assert.equal(helper.stdout, `${product.canonicalJson(ack)}\n`);
  assert.equal(ack.attemptRef, plan.attemptRef);
  assert.equal(ack.helperArtifactRef, artifact.artifactRef);
  assert.equal(ack.helperArtifactDigest, artifact.artifactDigest);
  const outcomes = [];
  async function completes(label, exchange, failureClass) {
    context.signal.throwIfAborted();
    const result = await prepared.complete(exchange);
    assert.equal(result.disposition, "failure", label);
    assert.equal(result.resultCandidate.failureClass, failureClass, label);
    outcomes.push({ label, failureClass });
    return result;
  }
  const relayed = await completes("relayed-acknowledgment",
    exactHelperExchange(product, prepared, plan, "helper-failure-relayed", helper.stdout.trimEnd()), "helper_failure");
  assert.deepEqual(readRuntimeFailureDiagnosticSubject(relayed.resultCandidate.diagnosticRef), artifact.failure);
  // (a) A coherent acknowledgment that names another artifact: the zero-filled one
  // the earlier controlled worker manufactured.
  const zeros = "0".repeat(64);
  const foreign = { ...ack, helperArtifactRef: `${ack.helperArtifactRef.slice(0, -64)}${zeros}`, helperArtifactDigest: `sha256:${zeros}` };
  assert.equal(commandProduct.isWorksiteCommandExecutionWorkerResult(foreign), true);
  await completes("foreign-artifact-acknowledgment",
    exactHelperExchange(product, prepared, plan, "helper-failure-foreign", JSON.stringify(foreign)), "result_contract_failure");
  // (b) The fifth review's trace: a transport that did not succeed never reaches the artifact.
  const failedTransport = exactHelperExchange(product, prepared, plan, "helper-failure-transport", helper.stdout.trimEnd());
  failedTransport.observation.disposition = "failure";
  await completes("transport-not-success", failedTransport, "transport_identity_mismatch");
  context.diagnostic(JSON.stringify({ helperFailureExchanges: outcomes }));
}

test("C2 explicit zero write territory preserves array, report and HTTP port authorization", async (t) => {
  const c2 = await import("../../build/code/src/product/worksite_command_execution.js");
  const { loadWorksiteOwner, worksiteFixture } = await import("../support/t287-generic-job-worksite.mjs");
  const env = await worksiteFixture(await loadWorksiteOwner());
  t.after(() => rm(env.scratch, { recursive: true, force: true }));
  const command = { commandId: "command://c2/readonly", executable: process.execPath, args: ["--version"],
    relativeCwd: ".", environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] };
  const input = { ...env, commands: [command], outcomePredicates: [], protectedSubjects: [], allowedWriteTerritories: [] };
  const configuration = c2.constructWorksiteCommandConfiguration(input);
  assert.deepEqual(configuration.allowedWriteTerritories, []);
  assert.equal(c2.worksiteCommandConfigurationMatches(input, JSON.parse(JSON.stringify(configuration))), true);
  const { allowedWriteTerritories: _territories, ...absent } = input;
  assert.throws(() => c2.constructWorksiteCommandConfiguration(absent), TypeError);
  for (const allowedWriteTerritories of [undefined, null, {}, "", false]) {
    assert.throws(() => c2.constructWorksiteCommandConfiguration({ ...input, allowedWriteTerritories }), TypeError);
  }
  const report = { reportIdentity: "report://c2/readonly", relativePath: "evidence/report.txt" };
  const reportInput = { ...input, commands: [{ ...command, expectedReports: [report] }] };
  assert.throws(() => c2.constructWorksiteCommandConfiguration(reportInput), TypeError);
  assert.doesNotThrow(() => c2.constructWorksiteCommandConfiguration({ ...reportInput,
    allowedWriteTerritories: [{ pathKind: "file", relativePath: report.relativePath }] }));
  const http = { predicateId: "predicate://c2/readonly/http", predicateKind: "http_response_exact",
    declaration: { validationCommandId: command.commandId, body: "ok", status: 200,
      launch: { executable: process.execPath, args: [c2.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],
        environment: {}, relativeCwd: ".", portFile: { relativePath: "evidence/port.txt" }, timeoutMs: 1000, terminationGraceMs: 100 },
      request: { hostname: "127.0.0.1", method: "GET", path: "/", timeoutMs: 100 } } };
  const httpInput = { ...input, outcomePredicates: [http] };
  assert.doesNotThrow(() => c2.constructWorksiteCommandConfiguration({ ...httpInput,
    allowedWriteTerritories: [{ pathKind: "file", relativePath: "evidence/port.txt" }] }));
  assert.throws(() => c2.constructWorksiteCommandConfiguration(httpInput), TypeError);
});

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

async function installConstructionTransport(scratch, proof = null) {
  const command = join(scratch, "c2-bin", "claude-construction");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    ...(proof === null ? [] : [
      `require('node:fs').writeFileSync(${JSON.stringify(join(proof.root, "construction-process.json"))}, JSON.stringify({pid:process.pid,provider:'controlled-construction'}), {flag:'wx'});`,
    ]),
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
    "  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: result })}\\n`);",
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
      promptDigest: product.sha256Canonical(request.prompt),
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

async function executeHelper(plan, proof = null) {
  const pending = execFileAsync("/bin/sh", ["-c", plan.toolCommand], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (proof === null) return pending;
  const child = pending.child;
  let directExit = null, closeObserved = false, failure = null, result;
  child.once("exit", (status, signal) => { directExit = { status, signal }; });
  child.once("close", () => { closeObserved = true; });
  try { result = await pending; } catch (error) { failure = error; }
  try {
    await proof.writeBytes("negative-helper-stdout.txt", result?.stdout ?? failure?.stdout ?? "");
    await proof.writeBytes("negative-helper-stderr.txt", result?.stderr ?? failure?.stderr ?? "");
    await proof.write("negative-helper-process.json", { pid: child.pid ?? null,
      ownsGroup: false, directExit, closeObserved, failure: proofError(failure) });
    if (child.pid !== undefined) await retainProcessAbsence(proof, "negative-helper-shell", child.pid, false);
  } catch (error) {
    if (failure !== null) console.error("negative helper evidence failed", error);
    failure ??= error;
  }
  if (failure !== null) throw failure;
  assert.equal(closeObserved, true);
  return result;
}

async function installedC2Case(context, helperFailure = null) {
  const proof = await selectedInstalledProof();
  let environment;
  let replayStore;
  let phase = "setup";
  let firstFailure = null;
  try {
  context.signal.throwIfAborted();
  const builtProduct = await import(pathToFileURL(
    join(proof === null ? packageRoot : join(proof.configuration.installHost,
      "node_modules/@abiogenesis/typescript-tenant"), "build/code/src/product/index.js"),
  ).href);
  const c1 = builtProduct.WORKSITE_CONSTRUCTION_IDS;
  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  const priorInactivity = process.env.ABG_TS_FP_TIMEOUT_MS;
  const priorAbsolute = process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  context.after(() => {
    if (priorCommand === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND;
    else process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
    if (proof !== null) {
      if (priorInactivity === undefined) delete process.env.ABG_TS_FP_TIMEOUT_MS;
      else process.env.ABG_TS_FP_TIMEOUT_MS = priorInactivity;
      if (priorAbsolute === undefined) delete process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
      else process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = priorAbsolute;
    }
  });
  context.signal.throwIfAborted();
  if (proof !== null) {
    process.env.ABG_TS_FP_TIMEOUT_MS = "60000";
    process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = "90000";
  }
  let sourceTask;
  let sourcePath;
  environment = await setupInstalledRootExecutionBasis(
    proof === null ? context : { after: (hook) => proof.deferredHooks.push(hook) }, packageRoot, {
    ...(proof === null ? {} : { frozenArtifact: proof.frozenArtifact }),
    candidateBasisSource: "packed_artifact",
    rootPublicationKind: "worksite_construction",
    authorizedActorRef: OWNER_ACTOR_REF,
    actorRef: OWNER_ACTOR_REF,
    programRef: c1.programRef,
    graphFunctionRef: c1.graphFunctionRef,
    inputContractRef: c1.taskContractRef,
    inputFactory: async ({ product, workspaceAuthority, workspaceBinding, capabilityGrant }) => {
      context.signal.throwIfAborted();
      const relativeRoot = "c2-source";
      await mkdir(join(workspaceAuthority.canonicalRoot, relativeRoot), { recursive: true });
      context.signal.throwIfAborted();
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
  if (proof !== null) await proof.write("environment.json", {
    scratch: environment.scratch, installedRoot: environment.installedRoot,
    artifactPath: environment.artifactPath, verified: environment.verified,
    installCandidate: environment.installCandidate, workspaceBinding,
    deferredCleanupHookCount: proof.deferredHooks.length,
  });
  context.signal.throwIfAborted();
  phase = "C1 construction";
  process.env.ABG_TS_CLAUDE_COMMAND = await installConstructionTransport(environment.scratch, proof);
  context.signal.throwIfAborted();
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
  if (proof !== null) {
    await proof.write("source-completion.json", sourceCompletion);
    await proof.write("source-events.json", environment.store.readAll());
    const processRow = await retainedTransportRecord(proof, "construction-process.json");
    if (processRow !== null) await retainProcessAbsence(proof, "construction", processRow.pid, true);
  }
  assert.equal(sourceCompletion.disposition, "closed", JSON.stringify(sourceCompletion));
  context.signal.throwIfAborted();
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
  context.signal.throwIfAborted();
  const policy = product.constructRootInvocationPolicy(workspaceBinding, resolution.program, [], ["F_P"]);
  const grantBasis = {
    admittedInstalls: environment.admittedInstalls, workspaceBinding,
    fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
  };
  const capabilityGrant = product.constructCapabilityGrant(
    policy, OWNER_ACTOR_REF, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis,
  );
  const sourceResult = sourceCompletion.resultValue;
  phase = "C2 task construction";
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
    ...(helperFailure !== null ? helperFailureMode(helperFailure).configuration(c2) : installedCommandConfiguration(c2)),
  });
  if (proof !== null) {
    await proof.write("task.json", task);
    const { projectWorksiteCommandExecutionBudget } = await import(pathToFileURL(
      join(environment.installedRoot, "build/code/src/product/worksite_command_execution.js"),
    ).href);
    const budget = projectWorksiteCommandExecutionBudget(task);
    await proof.write("task-budget.json", budget);
    assert.equal(budget.requiredExecutionBudgetMs, 27_750);
  }
  const installedPublic = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  const authority = product.constructInvocationAuthority(
    OWNER_ACTOR_REF, workspaceBinding, catalogView, resolution.program.programRef,
    resolution.selectedCatalogEntry, policy, [capabilityGrant], grantBasis,
  );
  const environmentRef = resolution.program.policies[gtl.RUN_ENVIRONMENT_POLICY];
  const environmentDeclarations = resolution.programPublication.runEnvironments.filter((row) =>
    row.declarationRef === environmentRef
  );
  assert.equal(environmentDeclarations.length, 1, "C2 requires its one declared run environment");
  const environmentDeclaration = environmentDeclarations[0];
  assert.equal(environmentDeclaration.dependencies.length, 1);
  const dependencyRoot = await realpath(environment.installedRoot);
  const recordPath = await realpath(join(dependencyRoot, gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path));
  const supportRoot = join(workspaceBinding.roots.archiveRoot, "c2-run-environment-support");
  context.signal.throwIfAborted();
  await mkdir(supportRoot);
  const temporaryRoot = await realpath(supportRoot);
  const coordinates = {
    dependencies: environmentDeclaration.dependencies.map((dependency) => ({
      dependencyRef: dependency.dependencyRef, root: dependencyRoot, recordPath,
    })),
    pythonPath: null, temporaryRoot,
  };
  const runEnvironmentResources = product.constructRunEnvironmentResources({
    kind: "run_environment_resources", schemaVersion: "5.0.0", ...coordinates,
    permission: {
      authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest,
      actorRef: OWNER_ACTOR_REF, programRef: resolution.program.programRef,
      environmentRef, environmentDigest: product.sha256Canonical(environmentDeclaration),
      operations: ["read_context"], ...coordinates,
    },
  });
  if (proof !== null) await proof.write("run-environment-binding.json", {
    programRef: resolution.program.programRef, programDigest: resolution.resolution.programDigest,
    policyKey: gtl.RUN_ENVIRONMENT_POLICY, environmentRef,
    declaration: environmentDeclaration, resources: runEnvironmentResources,
  });
  context.signal.throwIfAborted();
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
  const constructCall = proof === null ? constructInstalledPublicDefinitionCall
    : installedPublic.constructInstalledPublicDefinitionCall;
  const call = constructCall({
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
      runEnvironmentResources,
    },
    requestRef: "request://t287/c2-ack", correlationRef: "correlation://t287/c2-ack",
    eventTime: "2026-09-09T00:00:00.000Z", provenanceRefs: ["provenance://t287/c2-ack/deterministic-fixture"],
  });
  if (proof !== null) {
    await proof.write("definition-call.json", call);
    await proof.write("source-close-handoff.json", closeHandoff);
  }
  // Controlled transport: actual installed helper, with no paid/native semantic credit.
  // The fixture executes the actual installed helper once and relays only its stdout.
  const command = join(environment.scratch, "c2-bin/claude-compact-command");
  const stdoutPath = join(environment.scratch, "actual-helper-stdout.txt");
  context.signal.throwIfAborted();
  await writeFile(command, helperFailure !== null ? await helperFailureTransport(environment.scratch, helperFailure) : [
    "#!/usr/bin/env node",
    "const {spawnSync}=require('node:child_process');const fs=require('node:fs');let prompt='';",
    "process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>prompt+=chunk);",
    "process.stdin.on('end',()=>{",
    ...(proof === null ? [] : [
      `fs.writeFileSync(${JSON.stringify(join(proof.root, "command-prompt.txt"))},prompt,{flag:'wx'});`,
      `fs.writeFileSync(${JSON.stringify(join(proof.root, "command-process.json"))},JSON.stringify({pid:process.pid,provider:'controlled-command'}),{flag:'wx'});`,
    ]),
    "const taskSections=prompt.split('\\n\\n').filter(section=>section.startsWith('## task\\n'));",
    "if(taskSections.length!==1)throw Error('expected one canonical task section');",
    "const taskSection=JSON.parse(taskSections[0].slice('## task\\n'.length));",
    "if(taskSection===null||typeof taskSection!=='object'||Array.isArray(taskSection)||Object.keys(taskSection).length!==1||typeof taskSection.ownerPrompt!=='string')throw Error('expected task ownerPrompt');",
    "const input=JSON.parse(taskSection.ownerPrompt.split('\\n\\n')[1]);",
    "if(input===null||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==1||typeof input.command!=='string')throw Error('expected exact semantic command input');",
    ...(proof === null ? [] : [
      `fs.writeFileSync(${JSON.stringify(join(proof.root, "command-tool-input.json"))},JSON.stringify(input),{flag:'wx'});`,
    ]),
    "const tool={type:'tool_use',id:'toolu_c2_ack',name:'Bash',input};",
    "console.log(JSON.stringify({type:'system',subtype:'init',model:'c2-ack-proof'}));",
    "console.log(JSON.stringify({type:'assistant',message:{content:[tool]}}));",
    "const helper=spawnSync('/bin/sh',['-c',input.command],{encoding:'utf8',maxBuffer:4*1024*1024});",
    ...(proof === null ? [] : [
      `fs.writeFileSync(${JSON.stringify(join(proof.root, "transport-helper-stdout.txt"))},helper.stdout??'',{flag:'wx'});`,
      `fs.writeFileSync(${JSON.stringify(join(proof.root, "transport-helper-stderr.txt"))},helper.stderr??'',{flag:'wx'});`,
      `fs.writeFileSync(${JSON.stringify(join(proof.root, "transport-helper.json"))},JSON.stringify({pid:helper.pid,status:helper.status,signal:helper.signal,error:helper.error?{name:helper.error.name,message:helper.error.message,code:helper.error.code}:null}),{flag:'wx'});`,
    ]),
    "if(helper.status!==0)throw Error(helper.stderr);",
    `fs.writeFileSync(${JSON.stringify(stdoutPath)},helper.stdout);`,
    "console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(helper.stdout)}));",
    "});", "",
  ].join("\n"), "utf8");
  context.signal.throwIfAborted();
  await chmod(command, 0o755);
  context.signal.throwIfAborted();
  process.env.ABG_TS_CLAUDE_COMMAND = command;
  phase = "installed Public C2";
  context.signal.throwIfAborted();
  const outcome = await installedPublic.runInstalledDefinitionCallTransport({ kind: "reopen", closeHandoff }, call);
  if (proof !== null) {
    await proof.write("public-outcome.json", outcome);
    const processRow = await retainedTransportRecord(proof, "command-process.json");
    if (processRow !== null) await retainProcessAbsence(proof, "command-transport", processRow.pid, true);
    const helperRow = await retainedTransportRecord(proof, "transport-helper.json");
    if (helperRow?.pid > 0) await retainProcessAbsence(proof, "helper-shell", helperRow.pid, false);
  }
  if (helperFailure !== null) {
    phase = "helper failure handoff";
    await assertHelperFailureAdmitted(context, { environment, product, abg, task, outcome, mode: helperFailure });
    phase = "helper failure owner-local exchanges";
    if (helperFailure === "command_cleanup_unresolved") await assertHelperFailureExchanges(context, { environment, product, task, nodeRef: c2.nodeRef });
    return;
  }
  assert.equal(outcome.kind, "installed_definition_call_transport_result", JSON.stringify(outcome));
  assert.equal(outcome.receipt.exitCode, 0, JSON.stringify(outcome));
  const c2Close = outcome.receipt.resources.eventResource.closeHandoff;
  const c2RunId = outcome.receipt.ownerOutput.value.run.ref;
  const events = abg.readRuntimeEventsAtDurablePrefix(c2Close.prefix);
  if (proof !== null) await proof.write("C2-events-and-close.json", { closeHandoff: c2Close, runId: c2RunId, events });
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
  if (proof !== null) {
    await proof.writeBytes("admitted-helper-artifact.json", artifactBytes);
    await proof.write("admitted-observation.json", observation);
    await proof.writeBytes("helper-ack.txt", helperStdout);
  }
  const artifact = JSON.parse(artifactBytes.toString("utf8"));
  await retainHttp(proof, "admitted", observation);
  assert.equal(artifactBytes.byteLength > 256 * 1024, true);
  assert.deepEqual(observation.commandResults, artifact.commandResults);
  assert.deepEqual(observation.predicateObservations, artifact.predicateObservations);
  assert.equal(ack.helperArtifactRef, artifact.artifactRef);
  assert.equal(ack.helperArtifactDigest, artifact.artifactDigest);
  assert.deepEqual(Buffer.from(observation.commandResults[0].stdout.payload, "base64"), Buffer.alloc(210000, 65));
  assert.deepEqual(Buffer.from(observation.commandResults[0].stderr.payload, "base64"), Buffer.alloc(210000, 66));
  assert.deepEqual(observation.commandResults.map((row) => row.exitStatus), [7, 0]);
  assert.equal(observation.predicateObservations[0].observedValue, 7);
  context.signal.throwIfAborted();
  const reopened = abg.reopenEventStore(c2Close.reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context");
  replayStore = reopened.store;
  phase = "fresh replay";
  context.signal.throwIfAborted();
  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg, product, installedPackageRoot: environment.installedRoot, store: reopened.store,
    ...(proof === null ? {} : { ownedProcessProof: { evidenceRoot: join(proof.root, "fresh-replay") } }),
    requests: [{ rowId: "c2-compact-ack-runtime", owner: "abg", exportName: "projectRuntimeTruthAtDurablePrefix", input: "durable_prefix", args: [c2RunId] }],
  });
  if (proof !== null) await proof.write("fresh-proof.json", freshProof);
  const replay = freshProof.retainedRows[0].projection.replayState;
  assert.equal(replay.runtimeStatus, "closed");
  assert.deepEqual(replay.cCalls.find((row) => row.resultValue?.kind === observation.kind).resultValue, observation);

  phase = "owner-local negatives";
  // These owner-local negatives reuse one actual helper artifact; they admit no events.
  const implementation = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/implementation/worksite_command_execution.js")).href);
  const commandProduct = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/product/worksite_command_execution.js")).href);
  const occurrence = directOccurrence("compact-ack-negatives", c2.nodeRef);
  const plan = helperPlanForOccurrence(product, task, occurrence);
  context.signal.throwIfAborted();
  const prepared = await implementation.realizeWorksiteCommandExecution(task, occurrence);
  if (proof !== null) await proof.write("negative-helper-plan.json", plan);
  context.signal.throwIfAborted();
  const execution = await executeHelper(plan, proof);
  const raw = JSON.parse(execution.stdout);
  const exchange = exactHelperExchange(product, prepared, plan, "compact-ack-negatives", execution.stdout.trimEnd());
  const fullBytes = await readFile(plan.artifactPath);
  const full = JSON.parse(fullBytes.toString("utf8"));
  if (proof !== null) await proof.writeBytes("negative-helper-artifact.json", fullBytes);
  await retainHttp(proof, "negative", full);
  context.signal.throwIfAborted();
  const initialCompletion = await prepared.complete(exchange);
  if (proof !== null) await proof.write("negative-helper-initial-completion.json", { exchange, initialCompletion });
  assert.equal(initialCompletion.disposition, "success");
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
    context.signal.throwIfAborted();
    const result = await prepared.complete(candidateExchange);
    if (proof !== null) await proof.write(`negative-${label}.json`, { candidateExchange, result });
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
  for (const [label, mutate] of [
    ["altered-helper-stream", (value) => { value.commandResults[0].stdout.payload = ""; }],
    ["reordered-full-command-vector", (value) => { value.commandResults.reverse(); }],
    ["reordered-full-predicate-vector", (value) => { value.predicateObservations.reverse(); }],
  ]) {
    const value = structuredClone(full); mutate(value);
    assert.equal(commandProduct.isWorksiteCommandHelperArtifact(task, value), false, label);
    assert.throws(() => commandProduct.constructWorksiteCommandHelperArtifact({ ...value, task }), undefined, label);
    if (proof !== null) await proof.write(`negative-input-${label}.json`, value);
    context.signal.throwIfAborted();
    await writeFile(plan.artifactPath, `${product.canonicalJson(value)}\n`);
    try { await refuses(label, exchange, "helper_artifact_contract_failure"); }
    finally { await writeFile(plan.artifactPath, fullBytes); }
  }
  for (const [label, path] of [["altered-task-manifest", plan.taskManifestPath], ["altered-launch-manifest", launchManifestPathForPlan(plan)]]) {
    const bytes = await readFile(path);
    if (proof !== null) await proof.write(`negative-input-${label}.json`, {
      path, originalBase64: bytes.toString("base64"), candidateBase64: Buffer.concat([bytes, Buffer.from("\n")]).toString("base64") });
    context.signal.throwIfAborted();
    await writeFile(path, Buffer.concat([bytes, Buffer.from("\n")]));
    try { await refuses(label, exchange, "helper_manifest_mismatch"); }
    finally { await writeFile(path, bytes); }
  }
  if (proof !== null) await proof.write("negative-input-missing-artifact.json", { path: plan.artifactPath, retainedPath: `${plan.artifactPath}.retained` });
  context.signal.throwIfAborted();
  await rename(plan.artifactPath, `${plan.artifactPath}.retained`);
  try { await refuses("missing-helper-artifact", exchange, "helper_artifact_absent"); }
  finally { await rename(`${plan.artifactPath}.retained`, plan.artifactPath); }
  if (proof !== null) await proof.write("negative-input-protected-source.json", {
    sourcePath, originalBase64: SOURCE_BYTES.toString("base64"), candidateBase64: Buffer.from("altered protected source\n").toString("base64") });
  context.signal.throwIfAborted();
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
  context.signal.throwIfAborted();
  assert.equal(await product.installedProductContentMatches(environment.installCandidate), true);
  context.signal.throwIfAborted();
  const summary = {
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
  };
  if (proof !== null) await proof.write("summary.json", summary);
  context.signal.throwIfAborted();
  context.diagnostic(JSON.stringify(summary));
  } catch (error) {
    firstFailure = error;
    if (proof !== null) {
      try { await proof.write("failure.json", { phase, error: proofError(error), scratch: environment?.scratch ?? null }); }
      catch (retentionError) { console.error("C2 proof failure retention failed", retentionError); }
    }
    throw error;
  } finally {
    if (proof !== null) {
      let closeError = null;
      for (const store of [environment?.store, replayStore]) {
        try { store?.closeDurableLog(); } catch (error) { closeError ??= error; }
      }
      try {
        await proof.write("cleanup.json", { scratch: environment?.scratch ?? null,
          scratchParent: proof.configuration.scratchParent, evidenceRoot: proof.root,
          retained: true, deferredCleanupHookCount: proof.deferredHooks.length, deferredCleanupHooksInvoked: 0,
          originalStoreCloseAttempted: environment !== undefined, closeError: proofError(closeError),
          replayStoreCloseAttempted: replayStore !== undefined,
          setupFailedBeforeStoreHandoff: environment === undefined, processes: proof.processes,
          firstFailure: proofError(firstFailure), admissionAndPhysicalAbsenceAreDistinct: true });
      } catch (error) { if (firstFailure === null) throw error; console.error("C2 cleanup retention failed", error); }
      if (firstFailure === null && closeError !== null) throw closeError;
    }
  }
}

test("T-287 C2 compact acknowledgment preserves installed large-log observation and replay", {
  timeout: process.env.ABG_T287_C2_PROOF_CONFIG === undefined ? 180_000 : 600_000,
}, (context) => installedC2Case(context));

// One C1 source admits one C2 invocation: the source basis is re-derived at the
// entry prefix and at the source Run's closure, and after a first C2 Run they
// differ. The helper-failure run therefore has its own installed setup and C1.
test("T-287 C2 helper failure after launch reaches result admission with its subject inline", {
  timeout: 180_000, skip: process.env.ABG_T287_C2_PROOF_CONFIG !== undefined,
}, (context) => installedC2Case(context, "command_cleanup_unresolved"));

test('C2 complete cleanup budget displays per-operation drain and strict enclosing boundaries', async () => {
  const { projectWorksiteCommandExecutionBudget: project, worksiteCommandExecutionBudgetFits: fits } =
    await import('../../build/code/src/product/worksite_command_execution.js');
  for (const grace of [1, 100, 250, 251, 30_000, 2_147_483_648, Number.MAX_SAFE_INTEGER]) {
    const task = { commands: [{ timeoutMs: 1000, terminationGraceMs: grace }, { timeoutMs: 2000, terminationGraceMs: 100 }],
      outcomePredicates: [1, 2].map(() => ({ predicateKind: 'http_response_exact', declaration: {
        launch: { timeoutMs: 3000, terminationGraceMs: grace }, request: { timeoutMs: 500 },
      } })) };
    const budget = project(task);
    assert.deepEqual(budget.rule.commandFields, ['timeoutMs', 'terminationGraceMs', 'terminationGraceMs']);
    assert.deepEqual(budget.rule.httpResponseFields, { launch: ['timeoutMs', 'terminationGraceMs', 'terminationGraceMs'], request: ['timeoutMs'] });
    assert.deepEqual(budget.rule.perOperationDrain, { field: 'terminationGraceMs', maximumMs: 250, operation: 'minimum' });
    assert.equal(budget.rule.ownerAllowanceMs, 5000);
    const command = 1000 + 2 * grace + Math.min(grace, 250) + 2000 + 200 + 100;
    const http = 2 * (3000 + 2 * grace + Math.min(grace, 250) + 500);
    assert.equal(budget.commandBudgetMs, command); assert.equal(budget.httpProbeBudgetMs, http);
    const required = budget.requiredExecutionBudgetMs;
    assert.equal(required, command + http + 5000);
    assert.equal(fits(required, { inactivityTimeoutMs: required - 1, absoluteTimeoutMs: required + 2 }), false);
    assert.equal(fits(required, { inactivityTimeoutMs: required, absoluteTimeoutMs: required + 2 }), false);
    assert.equal(fits(required, { inactivityTimeoutMs: required + 1, absoluteTimeoutMs: required + 2 }), Number.isSafeInteger(required + 2));
    assert.equal(fits(required, { inactivityTimeoutMs: required + 1, absoluteTimeoutMs: required + 1 }), false);
    assert.equal(fits(required, { inactivityTimeoutMs: required + 2, absoluteTimeoutMs: required + 1 }), false);
  }
});

// A failure artifact's subject names the next undone operation of its completed
// prefix: a command class the next command, with no predicate observed; an HTTP
// class, once every command is complete, the next predicate, which is an
// `http_response_exact`, through `predicate`, with any declared-request members
// it carries equal to that predicate's. The rows are synthetic, in the style of
// `forward-observation-carrier.mjs`; constructor and validator are the Product's.
test("C2 helper failure subject is bound to the next undone operation of the completed prefix", async () => {
  const { product, componentSource } = await import("../support/forward-command-harness.mjs");
  const { originalTask } = componentSource();
  const declared = (commandId) => ({ commandId, executable: "/usr/bin/true", args: [], relativeCwd: ".", environment: {},
    timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] });
  const exit = { predicateId: "component:exit", predicateKind: "process_exit",
    declaration: { validationCommandId: "component:command", equals: 0 } };
  const http = { predicateId: "component:http", predicateKind: "http_response_exact", declaration: {
    validationCommandId: "component:command", status: 200, body: "ok",
    launch: { executable: "/usr/bin/true", args: [product.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],
      environment: {}, relativeCwd: ".", portFile: { relativePath: "evidence/port.txt" }, timeoutMs: 1000, terminationGraceMs: 100 },
    request: { hostname: "127.0.0.1", method: "GET", path: "/", timeoutMs: 100 } } };
  const taskOf = (commands, outcomePredicates) => product.constructWorksiteCommandExecutionTask({ ...originalTask,
    commands: commands.map(declared), outcomePredicates });
  const oneCommand = taskOf(["component:command"], []), twoCommands = taskOf(["component:command", "component:second"], []);
  const httpOnly = taskOf(["component:command"], [http]), exitThenHttp = taskOf(["component:command"], [exit, http]);
  const empty = { kind: "worksite_observed_stream", schemaVersion: "5.0.0", encoding: "base64", payload: "", byteLength: 0,
    digest: product.sha256Bytes(Buffer.alloc(0)) };
  const identity = (prefix, digest) => `${prefix}/${digest.slice(7)}`;
  const processOf = (command) => ({ ordinal: command.ordinal, commandId: command.commandId, executable: command.executable,
    args: command.args, relativeCwd: command.relativeCwd, environment: command.environment, timeoutMs: command.timeoutMs,
    terminationGraceMs: command.terminationGraceMs });
  const resultOf = (command) => {
    const body = { ...processOf(command), exitStatus: 0, timedOut: false, processSignal: null, signalSequence: [],
      terminationConfirmed: true, stdout: empty, stderr: empty, reports: [], reportCount: 0 };
    const observationDigest = product.sha256Canonical(body);
    return { kind: "worksite_command_result", schemaVersion: "5.0.0", ...body, observationDigest,
      observationRef: identity("worksite-command-observation://abiogenesis", observationDigest) };
  };
  const subject = (task, failureClass, member) => ({ failureClass, taskRef: task.taskRef, taskDigest: task.taskDigest,
    attemptRef: "synthetic-unadmitted:attempt", ...member, diagnostic: { name: "TypeError", message: "synthetic failure after launch" },
    processFacts: { directExit: { status: 0, signal: null }, scopeAbsence: "unknown" } });
  const named = (task, ordinal) => ({ predicate: { ordinal, predicateId: task.outcomePredicates[ordinal].predicateId } });
  const commandFailed = (task, ordinal) => subject(task, "command_failed", { command: task.commands[ordinal] });
  const commandCleanup = (task, ordinal) => subject(task, "command_cleanup_unresolved", { command: {
    ...processOf(task.commands[ordinal]), exitStatus: 0, timedOut: false, processSignal: null, signalSequence: [],
    terminationConfirmed: false, stdout: empty, stderr: empty } });
  const httpProbe = (task, ordinal, request = task.outcomePredicates[ordinal].declaration.request) =>
    subject(task, "http_probe_failed", { ...named(task, ordinal), request });
  const httpCleanup = (task, ordinal, request = null) => subject(task, "http_cleanup_unresolved", { ...named(task, ordinal),
    observation: { request, portFile: { relativePath: "evidence/port.txt", port: request?.port ?? null,
      state: request === null ? "absent" : "observed", issue: request === null ? "port_file_timeout" : null, byteLength: null, digest: null },
    response: null, process: { exitStatus: 0, processSignal: null, timedOut: false, signalSequence: [], terminationConfirmed: false,
      stdout: empty, stderr: empty } } });
  // The artifact as the constructor would build it, with its digest, for the validator alone.
  const artifactOf = (task, failure, commandsDone, predicatesDone) => {
    const sources = product.executableWorksiteCommandSources(task);
    const snapshotMembers = sources.map((source, ordinal) => ({ kind: "worksite_snapshot_member", schemaVersion: "5.0.0", ordinal,
      sourceMemberRef: source.sourceMemberRef, sourceObservationRef: source.observation.observationRef,
      sourceObservationDigest: source.observation.observationDigest, relativePath: source.subject.relativePath,
      byteLength: source.observation.byteLength, digest: source.observation.fileDigest }));
    const snapshotDigest = product.sha256Canonical(snapshotMembers);
    const body = { taskRef: task.taskRef, taskDigest: task.taskDigest, disposition: "failure",
      commandResults: task.commands.slice(0, commandsDone).map(resultOf),
      predicateObservations: task.outcomePredicates.slice(0, predicatesDone).map((row) => ({ kind: "worksite_predicate_observation",
        schemaVersion: "5.0.0", ordinal: row.ordinal, predicateId: row.predicateId, predicateKind: row.predicateKind,
        observedValue: 0, evidence: [], evidenceRefs: [] })),
      worksiteDelta: [], productDelta: [], snapshotRoot: "/component/forward/sandbox",
      snapshotRef: identity(product.executableWorksiteCommandIdentityPrefix(task, "snapshot"), snapshotDigest), snapshotDigest,
      snapshotMembers, protectedBefore: sources.map((row) => row.observation), protectedAfter: sources.map((row) => row.observation),
      failure };
    const artifactDigest = product.sha256Canonical(body);
    return { kind: "worksite_command_helper_artifact", schemaVersion: "5.0.0",
      artifactRef: identity("worksite-command-helper-artifact://abiogenesis", artifactDigest), artifactDigest, ...body };
  };
  const cases = [
    // The sixth review's probe, as reported and with a predicate member: no predicate is declared.
    ["review probe: http_probe_failed, request {}, no predicate", oneCommand, subject(oneCommand, "http_probe_failed", { request: {} }), 0, 0, false],
    ["review probe with a predicate member", oneCommand, subject(oneCommand, "http_probe_failed",
      { predicate: { ordinal: 0, predicateId: "component:http" }, request: http.declaration.request }), 1, 0, false],
    ["command_failed, the next command", twoCommands, commandFailed(twoCommands, 0), 0, 0, true],
    ["command_failed, a command other than the next", twoCommands, commandFailed(twoCommands, 1), 0, 0, false],
    ["command_failed, a completed command", twoCommands, commandFailed(twoCommands, 0), 1, 0, false],
    ["command_failed, the next command after one completed", twoCommands, commandFailed(twoCommands, 1), 1, 0, true],
    ["command_cleanup_unresolved, the next command", twoCommands, commandCleanup(twoCommands, 0), 0, 0, true],
    ["command_cleanup_unresolved, a command other than the next", twoCommands, commandCleanup(twoCommands, 1), 0, 0, false],
    ["command_failed, every command complete", exitThenHttp, commandFailed(exitThenHttp, 0), 1, 1, false],
    ["http_probe_failed, a command still undone", httpOnly, httpProbe(httpOnly, 0), 0, 0, false],
    ["http_probe_failed, commands complete", httpOnly, httpProbe(httpOnly, 0), 1, 0, true],
    ["http_cleanup_unresolved, a command still undone", httpOnly, httpCleanup(httpOnly, 0), 0, 0, false],
    ["http_cleanup_unresolved, port never observed", httpOnly, httpCleanup(httpOnly, 0), 1, 0, true],
    ["http_cleanup_unresolved, port observed", httpOnly, httpCleanup(httpOnly, 0, { ...http.declaration.request, port: 4000 }), 1, 0, true],
    ["http_cleanup_unresolved, a foreign request", httpOnly, httpCleanup(httpOnly, 0, { ...http.declaration.request, path: "/other", port: 4000 }), 1, 0, false],
    ["http_probe_failed, the next predicate is process_exit", exitThenHttp, httpProbe(exitThenHttp, 1), 1, 0, false],
    ["http_probe_failed, the next predicate", exitThenHttp, httpProbe(exitThenHttp, 1), 1, 1, true],
    ["http_probe_failed, a foreign predicate id", httpOnly, { ...httpProbe(httpOnly, 0), predicate: { ordinal: 0, predicateId: "component:other" } }, 1, 0, false],
    ["http_probe_failed, a foreign request", httpOnly, httpProbe(httpOnly, 0, { ...http.declaration.request, path: "/other" }), 1, 0, false],
  ];
  for (const [label, task, failure, commandsDone, predicatesDone, admitted] of cases) {
    const artifact = artifactOf(task, failure, commandsDone, predicatesDone);
    const construct = () => product.constructWorksiteExecutionHelperArtifact({ task, disposition: "failure", failure,
      ...Object.fromEntries(["commandResults", "predicateObservations", "worksiteDelta", "productDelta", "snapshotRoot", "snapshotRef",
        "snapshotDigest", "snapshotMembers", "protectedBefore", "protectedAfter"].map((key) => [key, artifact[key]])) });
    if (admitted) {
      assert.deepEqual(construct(), artifact, label);
      assert.equal(product.isWorksiteExecutionHelperArtifact(task, artifact), true, label);
      assert.equal(product.isWorksiteExecutionHelperArtifact(task, JSON.parse(product.canonicalJson(artifact))), true, label);
    } else {
      assert.throws(construct, TypeError, label);
      assert.equal(product.isWorksiteExecutionHelperArtifact(task, artifact), false, label);
    }
  }
});

// The helper failure classes driven through the installed helper, each by its
// declared task. `unconfirmed` names the lifetime, in creation order, that the
// hook binds to its host with no signal and a group probe answering 'unknown'
// ("none": every lifetime keeps the real host); `failed` names the lifetime
// whose facts the subject carries; `lifetimes` counts the lifetimes the helper
// creates. `command_cleanup_unresolved`: the one command exits 0 and its scope
// stays unresolved. `http_probe_failed`: the validation command and its
// `process_exit` predicate complete, the launch publishes its port, and the
// declared method is no HTTP token, so the probe's request raises an owner error
// after the port that the probe hands to the launch's lifetime as its first
// error. `http_cleanup_unresolved`: the same task with method GET; the launch
// answers once and exits 0, and the hook leaves the launch's scope, and only
// the launch's, unresolved. `command_failed` has no case: no declaration makes
// a command's lifetime record a first error (post-close repair G).
function helperFailureMode(name) {
  const http = (c2, method) => ({
    commands: [{ commandId: "command://c2-ack/http-validation", executable: process.execPath, args: ["-e", ""],
      relativeCwd: ".", environment: {}, timeoutMs: 5_000, terminationGraceMs: 1_000, expectedReports: [] }],
    outcomePredicates: [
      { predicateId: "predicate://c2-ack/http-validation-exit", predicateKind: "process_exit",
        declaration: { validationCommandId: "command://c2-ack/http-validation", equals: 0 } },
      { predicateId: "predicate://c2-ack/http-failure", predicateKind: "http_response_exact", declaration: {
        validationCommandId: "command://c2-ack/http-validation", status: 201, body: "abi-ok",
        launch: { executable: process.execPath, args: [SOURCE_RELATIVE_PATH, c2.httpPortFileArgumentPlaceholder],
          environment: {}, relativeCwd: ".", portFile: { relativePath: "c2-source/evidence-http-port.txt" },
          timeoutMs: 5_000, terminationGraceMs: 1_000 },
        request: { hostname: "127.0.0.1", method, path: "/", timeoutMs: 1_000 },
      } },
    ],
    allowedWriteTerritories: [{ pathKind: "file", relativePath: "c2-source/evidence-http-port.txt" }],
  });
  const modes = {
    command_cleanup_unresolved: { configuration: helperFailureConfiguration, unconfirmed: "0", failed: 0, lifetimes: 1,
      stderr: /worksite command cleanup unresolved; dependent work stopped: /u,
      diagnostic: /ABI owned process cleanup unresolved/u },
    http_probe_failed: { configuration: (c2) => http(c2, "G ET"), unconfirmed: "none", failed: 1, lifetimes: 2,
      stderr: /worksite HTTP probe failed; dependent work stopped: /u,
      diagnostic: /^Method must be a valid HTTP token \["G ET"\]$/u },
    http_cleanup_unresolved: { configuration: (c2) => http(c2, "GET"), unconfirmed: "1", failed: 1, lifetimes: 2,
      stderr: /worksite HTTP cleanup unresolved; dependent work stopped: /u,
      diagnostic: /ABI owned process cleanup unresolved/u },
  };
  assert.ok(Object.hasOwn(modes, name), name);
  return modes[name];
}

// Per class: the subject's keys and the operation it is bound to, the completed
// prefix the artifact carries, and the failed process identified by the hook's
// record of its spawn arguments beside the facts the subject carries.
async function assertHelperFailureMode(mode, { task, subject, artifact, paths }) {
  const failureMode = helperFailureMode(mode);
  const spawned = async (ordinal) => JSON.parse(await readFile(join(paths.facts, `lifetime-${ordinal}.process.json`), "utf8"));
  const failedProcess = await spawned(failureMode.failed);
  assert.equal(failedProcess.target, failureMode.unconfirmed === String(failureMode.failed));
  const prefix = [artifact.commandResults.length, artifact.predicateObservations.length];
  if (mode === "command_cleanup_unresolved") {
    assert.deepEqual(Object.keys(subject).sort(), ["attemptRef", "command", "diagnostic", "failureClass", "processFacts", "taskDigest", "taskRef"]);
    assert.deepEqual(prefix, [0, 0]);
    assert.equal(subject.command.ordinal, 0);
    assert.equal(subject.command.commandId, "command://c2-ack/helper-failure");
    assert.equal(subject.command.terminationConfirmed, false);
    assert.equal(subject.processFacts.scopeAbsence, "unknown");
    assert.deepEqual(subject.processFacts.directExit, { status: 0, signal: null });
    assert.deepEqual(failedProcess.spawnargs, [task.commands[0].executable, ...task.commands[0].args]);
    return { prefix, boundOperation: subject.command.commandId, failedProcess, processFacts: subject.processFacts };
  }
  const predicate = task.outcomePredicates[1];
  assert.deepEqual(Object.keys(subject).sort(), ["attemptRef", "diagnostic", "failureClass",
    mode === "http_probe_failed" ? "request" : "observation", "predicate", "processFacts", "taskDigest", "taskRef"].sort());
  // Every command complete, the predicates before the HTTP one observed.
  assert.deepEqual(prefix, [task.commands.length, 1]);
  assert.equal(artifact.commandResults[0].commandId, task.commands[0].commandId);
  assert.equal(artifact.commandResults[0].exitStatus, 0);
  assert.equal(artifact.commandResults[0].terminationConfirmed, true);
  assert.equal(artifact.predicateObservations[0].predicateKind, "process_exit");
  assert.equal(artifact.predicateObservations[0].observedValue, 0);
  assert.equal(predicate.predicateKind, "http_response_exact");
  assert.deepEqual(subject.predicate, { ordinal: predicate.ordinal, predicateId: predicate.predicateId });
  assert.deepEqual(subject.predicate, { ordinal: 1, predicateId: "predicate://c2-ack/http-failure" });
  // The failed process is the launch: its arguments carry the declared port file in the snapshot.
  assert.equal(failedProcess.spawnargs[1], SOURCE_RELATIVE_PATH);
  assert.equal(failedProcess.spawnargs[2].endsWith("/c2-source/evidence-http-port.txt"), true, failedProcess.spawnargs[2]);
  const commandProcess = await spawned(0);
  assert.deepEqual(commandProcess.spawnargs, [task.commands[0].executable, ...task.commands[0].args]);
  assert.equal(commandProcess.target, false);
  const commandFacts = JSON.parse(await readFile(join(paths.facts, "lifetime-0.json"), "utf8"));
  assert.equal(commandFacts.scopeAbsence, "absent");
  assert.equal(commandFacts.firstError, null);
  const declared = predicate.declaration.request;
  if (mode === "http_probe_failed") {
    assert.deepEqual(subject.request, declared);
    assert.equal(subject.request.method, "G ET");
    assert.equal(subject.processFacts.firstError.name, "TypeError");
    assert.equal(subject.processFacts.firstError.code, "ERR_INVALID_HTTP_TOKEN");
    assert.equal(subject.processFacts.launchFailure, null);
    assert.equal(subject.processFacts.scopeAbsence, "absent");
    assert.deepEqual(subject.processFacts.directExit, { status: null, signal: "SIGKILL" });
    return { prefix, boundOperation: subject.predicate, failedProcess, processFacts: subject.processFacts };
  }
  const observation = subject.observation;
  assert.equal(observation.portFile.state, "observed");
  assert.deepEqual(observation.request, { hostname: declared.hostname, port: observation.portFile.port,
    method: declared.method, path: declared.path, timeoutMs: declared.timeoutMs });
  assert.equal(observation.response.status, 201);
  assert.equal(observation.response.body, "abi-ok");
  assert.equal(observation.process.exitStatus, 0);
  assert.equal(observation.process.terminationConfirmed, false);
  assert.equal(subject.processFacts.firstError, null);
  assert.equal(subject.processFacts.scopeAbsence, "unknown");
  assert.deepEqual(subject.processFacts.directExit, { status: 0, signal: null });
  return { prefix, boundOperation: subject.predicate, failedProcess, processFacts: subject.processFacts };
}

// Each HTTP class has its own installed setup and C1, as the cleanup case does.
test("T-287 C2 helper failure http_probe_failed through the installed helper reaches result admission with its subject inline", {
  timeout: 180_000, skip: process.env.ABG_T287_C2_PROOF_CONFIG !== undefined,
}, (context) => installedC2Case(context, "http_probe_failed"));

test("T-287 C2 helper failure http_cleanup_unresolved through the installed helper reaches result admission with its subject inline", {
  timeout: 180_000, skip: process.env.ABG_T287_C2_PROOF_CONFIG !== undefined,
}, (context) => installedC2Case(context, "http_cleanup_unresolved"));
