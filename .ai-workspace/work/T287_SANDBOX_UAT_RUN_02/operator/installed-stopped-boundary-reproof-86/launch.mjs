import assert from 'node:assert/strict';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exclusiveRecord, commandRecorder} from '../../../../../build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root = fileURLToPath(new URL('.', import.meta.url));
assert.equal(process.env.NODE_OPTIONS ?? '', '');
const keys = ['HOME', 'PATH', 'TMPDIR', 'LANG', 'LC_ALL'];
const environment = Object.fromEntries(keys.filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]));
await exclusiveRecord(root, 'launch-observation.json', {kind: 'single_stock_heap_boundary_reproof_launch',
  startedAt: new Date().toISOString(), executable: process.execPath, args: [join(root, 'reproof.mjs')],
  environmentKeys: Object.keys(environment).sort(), nodeOptions: null, timeoutMs: 19260000,
  defaultRecorderCaptureUnraised: true, noProviderOrNewRun: true});
const command = commandRecorder(root, {environment, timeoutMs: 19260000});
const result = await command('boundary-reproof', process.execPath, [join(root, 'reproof.mjs')]);
await exclusiveRecord(root, 'process-closure.json', {exitCode: result.exitCode, signal: result.signal,
  wallMs: result.wallMs, timedOut: result.timedOut, truncated: result.truncated, failure: result.failure,
  stdoutBytes: Buffer.byteLength(result.stdout), stderrBytes: Buffer.byteLength(result.stderr),
  firstFailureStops: true});
console.log(JSON.stringify({exitCode: result.exitCode, signal: result.signal, wallMs: result.wallMs,
  timedOut: result.timedOut, truncated: result.truncated, failure: result.failure,
  stdoutBytes: Buffer.byteLength(result.stdout), stderrBytes: Buffer.byteLength(result.stderr)}));
