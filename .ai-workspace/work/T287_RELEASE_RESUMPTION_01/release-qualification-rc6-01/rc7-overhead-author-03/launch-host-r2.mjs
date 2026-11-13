import {constants} from 'node:fs';
// Root-only bounded launcher. The existing recorder owns spawn, timeout and output.
import assert from 'node:assert/strict';
import {readFile,mkdir,access} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {commandRecorder,exclusiveRecord} from '../operator-client/runner.mjs';
const dir=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(join(dir,'HOST_MANIFEST_R2.json'));assert.equal(sha(raw),process.argv[2]);
const manifest=JSON.parse(raw);assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
for(const pin of manifest.files){const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.bytes,pin.path);assert.equal(sha(bytes),pin.sha256,pin.path);}
assert.equal(manifest.hostScript.path,join(dir,'single-host-r2.mjs'));
const hostBytes=await readFile(manifest.hostScript.path);assert.equal(hostBytes.length,manifest.hostScript.bytes);assert.equal(sha(hostBytes),manifest.hostScript.sha256);
const profile=JSON.parse(await readFile(join(dir,'PROVIDER_PROFILE.json'),'utf8'));
assert.equal(profile.outerTimeoutMs,10800000);assert.equal(profile.runtimeEnvironment.NODE_OPTIONS,'--max-old-space-size=8192');
await access(profile.provider.command,constants.X_OK);
await access(profile.realClaude,constants.X_OK); // Exact known executable metadata failure is checked before host allocation.
const environment={...Object.fromEntries(['HOME','PATH','LANG','LC_ALL',...profile.provider.inheritEnvironment].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]])),...profile.runtimeEnvironment};
const out=join(dir,'host-supervision-r2');await mkdir(out); // Retain failed/incomplete launch; create-only, no retry.
const command=commandRecorder(out,{environment,timeoutMs:10800000,maxOutputBytes:536870912});
const result=await command('native-host',process.execPath,['--max-old-space-size=8192',manifest.hostScript.path,sha(raw)],{cwd:dir});
await exclusiveRecord(out,'HOST_RETURN.json',{status:'HOST_RETURNED',at:new Date().toISOString(),exitCode:result.exitCode,signal:result.signal,
 timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,wallMs:result.wallMs,
 commandResultFile:join(out,'commands/native-host.result.json'),meaning:'Host process return only. Actual inner CLI receipt and close, source custody and selected proof determine standing; no inferred success.'});
if(result.exitCode!==0||result.signal!==null||result.timedOut||result.truncated||result.failure!==null)process.exitCode=1;
