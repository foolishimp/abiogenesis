import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const configBytes = readFileSync(join(root, 'launch-config.json'));
const config = JSON.parse(configBytes);
const freeze = JSON.parse(readFileSync(join(root, 'execution-freeze.json'), 'utf8'));
for (const row of freeze.files) {
  const bytes = readFileSync(join(root, row.path));
  assert.equal(bytes.byteLength, row.bytes, row.path); assert.equal(sha(bytes), row.sha256, row.path);
}
for (const row of [config.node, config.lifetime, config.grant, config.preparationConfiguration, config.preparationFreeze]) {
  const bytes = readFileSync(row.path);
  assert.equal(bytes.byteLength, row.bytes, row.path); assert.equal(sha(bytes), row.sha256, row.path);
}
assert.equal(process.execPath, config.node.path);
assert.equal(process.platform, 'darwin');
for (const name of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_COMPILE_CACHE']) assert.equal(process.env[name], undefined);
const { createOwnedProcessLifetime, createMonotonicDeadline } = await import(pathToFileURL(config.lifetime.path).href);
assert.equal(typeof createOwnedProcessLifetime, 'function'); assert.equal(typeof createMonotonicDeadline, 'function');
const save = (name, value) => writeFileSync(join(root, name), `${JSON.stringify(value, (_key, item) =>
  typeof item === 'bigint' ? item.toString() : item, 2)}\n`, { flag: 'wx' });
const errorRecord = error => error === null || error === undefined ? null : ({ name: error.name,
  code: error.code ?? null, message: error.message, stack: error.stack ?? null });
const start = process.hrtime.bigint();
const trace = [];
const event = (name, detail = {}) => trace.push({ ordinal: trace.length, event: name,
  elapsedMs: Number(process.hrtime.bigint() - start) / 1e6, ...detail });
const stdout = [], stderr = [];
const stdoutFd = openSync(join(root, 'host.stdout.bin'), 'wx');
const stderrFd = openSync(join(root, 'host.stderr.bin'), 'wx');
let child;
try {
  child = spawn(config.argv[0], config.argv.slice(1), {
    cwd: config.cwd, detached: true, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env },
  });
} catch (error) {
  closeSync(stdoutFd); closeSync(stderrFd);
  save('host-launch-failure.json', { error: errorRecord(error), launchedChild: false });
  throw error;
}
let timedOut = false;
const deadline = createMonotonicDeadline();
const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: config.bounds.terminationGraceMs }, {
  onSpawn: pid => event('owner-spawn', { pid }),
  onError: error => event('owner-launch-error', { error: errorRecord(error) }),
  onExit: (status, signal) => event('owner-direct-exit', { status, signal }),
  onSignalRequested: signal => event('owner-signal-requested', { signal }),
  onUnconfirmed: () => event('owner-scope-unconfirmed'),
});
child.on('error', error => event('child-error-channel', { error: errorRecord(error) }));
child.once('close', (status, signal) => event('child-close', { status, signal }));
for (const [name, stream, chunks, fd] of [
  ['stdout', child.stdout, stdout, stdoutFd], ['stderr', child.stderr, stderr, stderrFd],
]) {
  stream.on('data', chunk => {
    const bytes = Buffer.from(chunk); chunks.push(bytes);
    lifetime.observe(() => writeFileSync(fd, bytes));
  });
  stream.on('error', error => event(`${name}-error`, { error: errorRecord(error) }));
  stream.once('end', () => event(`${name}-end`));
  stream.once('close', () => event(`${name}-close`));
}
child.stdin.on('error', error => event('stdin-error', { error: errorRecord(error) }));
child.stdin.once('finish', () => event('stdin-finish'));
child.stdin.once('close', () => event('stdin-close'));
lifetime.observe(() => save('host-start.json', { launcherPid: process.pid, hostPid: child.pid ?? null,
  groupId: child.pid ?? null, argv: config.argv, cwd: config.cwd, launchConfigurationSha256: sha(configBytes),
  stageCommonLifetimeSha256: config.lifetime.sha256, bounds: config.bounds, fixtureChildCount: 0 }));
deadline.at(start + BigInt(config.bounds.normalWorkDeadlineMs) * 1_000_000n, () => {
  timedOut = true; event('host-work-deadline'); lifetime.requestTermination();
});
lifetime.observe(() => child.stdin.end());
const facts = await lifetime.completion;
deadline.cancel();
event('owner-completion-published');
await new Promise(resolve => setImmediate(resolve)); // collect already queued natural close/error observations
closeSync(stdoutFd); closeSync(stderrFd);
const output = Buffer.concat(stdout), errors = Buffer.concat(stderr);
writeFileSync(join(root, 'host.stdout.complete.bin'), output, { flag: 'wx' });
writeFileSync(join(root, 'host.stderr.complete.bin'), errors, { flag: 'wx' });
const probe = coordinate => {
  if (coordinate === undefined) return { state: 'not_established', coordinate: null };
  try { process.kill(coordinate, 0); return { state: 'present', coordinate }; }
  catch (error) { return { state: error.code === 'ESRCH' ? 'absent' : 'unknown', coordinate, error: errorRecord(error) }; }
};
const directPid = probe(child.pid), group = probe(child.pid === undefined ? undefined : -child.pid);
const retainedFacts = { ...facts, launchFailure: errorRecord(facts.launchFailure), firstError: errorRecord(facts.firstError) };
const physicallyClosed = facts.scopeAbsence === 'absent' && facts.directExit !== null && facts.closeObserved &&
  directPid.state === 'absent' && group.state === 'absent';
const observation = { kind: 'E04_proof_host_observation', launcherPid: process.pid, hostPid: child.pid ?? null,
  groupId: child.pid ?? null, elapsedMs: Number(process.hrtime.bigint() - start) / 1e6, timedOut,
  facts: retainedFacts, independentAbsence: { directPid, group }, physicallyClosed,
  stdout: { byteLength: output.byteLength, sha256: sha(output) }, stderr: { byteLength: errors.byteLength, sha256: sha(errors) },
  trace, successCandidate: physicallyClosed && facts.directExit.status === 0 && facts.firstError === null && !timedOut,
  boundary: 'physical host completion only; runner case evidence remains separate; no ABG admission' };
save('host-result.json', observation);
console.log(JSON.stringify(observation, (_key, item) => typeof item === 'bigint' ? item.toString() : item));
if (!observation.successCandidate) process.exitCode = 1;
