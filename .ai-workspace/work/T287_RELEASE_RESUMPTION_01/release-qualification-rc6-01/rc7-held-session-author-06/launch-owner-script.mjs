// Thin adaptation of the existing owner launcher; commandRecorder owns deadline/process-group termination.
import assert from 'node:assert/strict';
import {readFile,lstat,access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const dir=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(join(dir,'execution/DISPATCH_MANIFEST.json'));assert.equal(sha(raw),process.argv[2]);const manifest=JSON.parse(raw);assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
for(const p of manifest.files){const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);}
for(const suffix of ['request.json','stdout','stderr','result.json']){const path=join(dir,'commands/sdk-native-host.'+suffix);try{await lstat(path);throw Error('Actual host output occupied: '+path);}catch(e){if(e.code!=='ENOENT')throw e;}}
const binding=JSON.parse(await readFile(join(dir,'RUNTIME_BINDINGS.json'))),p=binding.operatorRunner;assert(p?.path&&p?.sha256);const rb=await readFile(p.path);assert.equal(rb.length,p.bytes);assert.equal(sha(rb),p.sha256);
const {commandRecorder}=await import(pathToFileURL(p.path));const profile=JSON.parse(await readFile(join(dir,'PROVIDER_PROFILE.json')));
assert.equal(profile.outerTimeoutMs,10800000);
for(const file of [profile.provider.command,profile.realClaude]){const st=await lstat(file);assert(st.isFile()&&!st.isSymbolicLink(),'Exact provider file required');assert((st.mode&0o111)!==0,'Provider executable mode absent');await access(file,constants.X_OK);}
const environment={...process.env,NODE_OPTIONS:profile.runtimeEnvironment.NODE_OPTIONS};
const command=commandRecorder(dir,{environment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912});
const result=await command('sdk-native-host','/opt/homebrew/Cellar/node/24.7.0/bin/node',[join(dir,'prepare-and-dispatch.mjs'),process.argv[2]],{cwd:dir});
console.log(JSON.stringify({status:'SDK_NATIVE_HOST_RETURNED',exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,wallMs:result.wallMs}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
