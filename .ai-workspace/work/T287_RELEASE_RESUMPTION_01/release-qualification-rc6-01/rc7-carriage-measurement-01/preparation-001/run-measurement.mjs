// Fixed one-measurement operator entry. Uses the unchanged maintained supervisor.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,realpath,access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),hex=b=>createHash('sha256').update(b).digest('hex');
async function checked(r){assert(r&&typeof r.path==='string'&&/^[a-f0-9]{64}$/.test(r.sha256),'unbound pin');assert((await lstat(r.path)).isFile());const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hex(b),r.sha256);return b;}
async function absent(p){try{await lstat(p);throw Error('preserve existing allocation: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,4,'usage: node run-measurement.mjs ROOT_BINDINGS.json SHA256_HEX');
const input=resolve(process.argv[2]),raw=await readFile(input);assert.equal(hex(raw),process.argv[3]);const b=JSON.parse(raw);
assert.equal(b.status,'ROOT_SELECTED_S4_INSTALLED_CARRIAGE_MEASUREMENT');
for(const n of ['activation','finalSourceSubject','finalSourceInventory','sourceArtifactRelation','candidateArchive','bootstrapInstallReceipt','candidateAcceptance'])await checked(b[n]);
const prep=JSON.parse(await checked(b.preparationManifest));for(const r of prep.files)await checked(r);
const refs=JSON.parse(await readFile(join(here,'OWNER_REFERENCES.json'),'utf8'));for(const r of refs.canonicalOperatorOwners)await checked(r);
assert.equal(await realpath(b.node.configuredPath),b.node.realPath);await checked({path:b.node.realPath,bytes:b.node.bytes,sha256:b.node.sha256});assert.equal(await realpath(process.execPath),b.node.realPath);
assert(Array.isArray(b.helperPins));assert.deepEqual(b.helperPins.map(x=>x.relativePath).sort(),[...refs.helperRelativePaths].sort());for(const r of b.helperPins)await checked({path:join(b.packageRoot,r.relativePath),bytes:r.bytes,sha256:r.sha256});
const install=JSON.parse(await checked(b.bootstrapInstallReceipt));assert.equal(install.disposition,'materialized');assert.equal(install.installedRoot,join(b.bootstrapInstallHost,'node_modules/@abiogenesis/typescript-tenant'));assert.equal(install.artifactDigest,'sha256:'+b.candidateArchive.sha256);
assert.deepEqual(b.contextBodyBytes,[1048576,4194304]);assert.equal(b.scriptedActorOnly,true);assert.equal(b.qualification,false);
const k=b.boundsSelectedByRoot;assert(k&&typeof k==='object','Root has not selected finite bounds');for(const key of Object.keys(b.proposedBounds))assert(Number.isSafeInteger(k[key])&&k[key]>0&&k[key]<=b.proposedBounds[key],key);assert.equal(k.nodeHeapMiB,8192);
const expected=resolve(here,'../actual-001');assert.equal(b.outputRoot,expected);assert.equal(b.tempRoot,'/private/tmp/abg-r7m');
await absent(b.outputRoot);await absent(b.tempRoot);await access(join(here,'scripted-readonly-actor.mjs'),constants.X_OK);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(refs.canonicalOperatorOwners[0].path));
await mkdir(b.outputRoot,{mode:0o700});await mkdir(b.tempRoot,{mode:0o700});await mkdir(join(b.tempRoot,'tmp'));
for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(b.tempRoot,n),'',{flag:'wx'});
const env={HOME:'/Users/jim',PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:join(b.tempRoot,'tmp'),NODE_OPTIONS:'--max-old-space-size=8192',npm_config_userconfig:join(b.tempRoot,'npm-user.npmrc'),npm_config_globalconfig:join(b.tempRoot,'npm-global.npmrc'),npm_config_cache:join(b.tempRoot,'npm-cache'),npm_config_offline:'true',npm_config_ignore_scripts:'true',npm_config_audit:'false',npm_config_fund:'false',ABG_TS_CLAUDE_COMMAND:join(here,'scripted-readonly-actor.mjs'),ABG_TS_FP_TIMEOUT_MS:String(k.actorInactivityMs),ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:String(k.actorAbsoluteMs),ABG_TS_FP_TERMINATION_GRACE_MS:'2000',ABI5_S4_BINDINGS:input,ABI5_S4_BINDINGS_SHA256:process.argv[3]};
await exclusiveRecord(b.outputRoot,'EXECUTION_STARTED.json',{at:new Date().toISOString(),input:{path:input,bytes:raw.length,sha256:process.argv[3]},environment:env,bounds:k});
const command=commandRecorder(b.outputRoot,{environment:env,timeoutMs:k.hostMs,maxOutputBytes:k.outputBytes});
const r=await command('s4-installed-carriage',b.node.configuredPath,['--test','--test-concurrency=1','--test-reporter=tap',join(here,'measurement.test.mjs')],{cwd:b.packageRoot,environment:env});
await exclusiveRecord(b.outputRoot,'HOST_SUMMARY.json',{status:r.exitCode===0&&!r.signal&&!r.timedOut&&!r.truncated&&!r.failure?'SELECTED_MEASUREMENT_CLOSED':'SELECTED_MEASUREMENT_FAILED',exitCode:r.exitCode,signal:r.signal,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure,commandReceipt:'commands/s4-installed-carriage.result.json',measurement:'MEASUREMENT.json',S6Disposition:null,qualified:false});
if(r.exitCode!==0||r.signal||r.timedOut||r.truncated||r.failure)process.exitCode=1;
