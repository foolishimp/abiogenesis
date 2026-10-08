import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, readFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder, eventResourceIdentity, exclusiveRecord} from '../../../../../build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';

const phase = dirname(fileURLToPath(import.meta.url));
const root = join(phase, 'positive-diagnostic');
await mkdir(root);
assert.equal(process.env.NODE_OPTIONS ?? '', '');
const setup = JSON.parse(await readFile(join(phase, 'execution-successor/setup.json'), 'utf8'));
const requestPath = join(setup.scratch, 'st4-81-declared-positive-request.jsonl');
const requestBytes = await readFile(requestPath);
assert.equal(requestBytes.length, 35510031);
assert.equal(createHash('sha256').update(requestBytes).digest('hex'), 'dff32deb5a29c855fe50cf1b6ca942e08a2b220ad82f813e118fa5f441873d5f');
const request = JSON.parse(requestBytes);
assert.deepEqual(request.acquisition, {kind: 'eventless'});
const logPath = fileURLToPath(setup.setupHandoff.prefix.eventLogRef);
const before = await eventResourceIdentity(logPath);
assert.equal(before.byteCount, setup.setupHandoff.prefix.prefixLength);
assert.equal(before.digest, setup.setupHandoff.prefix.prefixDigest);
assert.equal(before.device, setup.setupHandoff.prefix.storeIdentity.device);
assert.equal(before.inode, setup.setupHandoff.prefix.storeIdentity.inode);
await exclusiveRecord(root, 'before.json', {requestPath, requestSha256: createHash('sha256').update(requestBytes).digest('hex'),
  requestBytes: requestBytes.length, installedRoot: setup.installedRoot, prefix: setup.setupHandoff.prefix, physical: before,
  nodeOptions: process.env.NODE_OPTIONS ?? null, authorization: 'Root single positive-only eventless raw diagnostic; no HoG/new Run/provider dispatch'});
const command = commandRecorder(root, {environment: {}});
const result = await command('declared-positive', process.execPath,
  [join(setup.installedRoot, 'build/code/src/public/cli.js'), '--jsonl', requestPath], {cwd: setup.scratch});
const after = await eventResourceIdentity(logPath);
await exclusiveRecord(root, 'after.json', {physical: after, unchanged: JSON.stringify(before) === JSON.stringify(after)});
assert.deepEqual(after, before);
let ownerOutput = null, parseError = null;
try { ownerOutput = JSON.parse(result.stdout); } catch (error) { parseError = String(error); }
const projection = {kind: 'raw_eventless_conformance_diagnostic', exitCode: result.exitCode, signal: result.signal,
  wallMs: result.wallMs, timedOut: result.timedOut, truncated: result.truncated, failure: result.failure,
  stdoutBytes: Buffer.byteLength(result.stdout), stderrBytes: Buffer.byteLength(result.stderr), ownerOutput, parseError,
  setupPrefixUnchanged: true, noHoGOrProviderDispatch: true};
await exclusiveRecord(root, 'projection.json', projection);
console.log(JSON.stringify(projection));
