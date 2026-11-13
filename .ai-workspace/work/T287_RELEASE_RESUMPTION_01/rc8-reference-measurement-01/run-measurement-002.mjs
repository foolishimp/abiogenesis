// Operator envelope only: delegates subprocess custody to the existing runner.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,realpath,access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),hex=b=>createHash('sha256').update(b).digest('hex');
const inside=p=>{const r=relative(here,p);return r!==''&&!r.startsWith('..')&&!isAbsolute(r);};
async function checked(r){assert(r&&typeof r.path==='string'&&/^[a-f0-9]{64}$/.test(r.sha256),'unbound pin');assert((await lstat(r.path)).isFile());const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hex(b),r.sha256);return b;}
async function absent(p){try{await lstat(p);throw Error('preserve existing allocation: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,6,'usage: node run-measurement-002.mjs BINDINGS CONFIG_SHA256 ROOT_ADMISSION ADMISSION_SHA256');
const input=resolve(process.argv[2]),raw=await readFile(input);assert.equal(hex(raw),process.argv[3]);const b=JSON.parse(raw);
assert.equal(b.status,'PREPARED_MATCHED_REFERENCE_MEASUREMENT');assert(['before','after'].includes(b.subject?.phase));assert(/^[a-f0-9]{40}$/.test(b.subject.sourceCommit));
const admissionPath=resolve(process.argv[4]);assert(inside(admissionPath),'Root admission must reside in this measurement territory');const admissionBytes=await readFile(admissionPath);assert.equal(hex(admissionBytes),process.argv[5]);const admission=JSON.parse(admissionBytes);
assert.equal(admission.status,'ROOT_ADMITTED_REFERENCE_MEASUREMENT');assert.equal(admission.bindingsSha256,process.argv[3]);assert.equal(admission.firstRc7WorkerLaunchObserved,true,'Root must first observe the real RC7 Worker launch');
const prepBytes=await readFile(join(here,'PREPARATION_MANIFEST_002.json'));assert.equal(hex(prepBytes),admission.preparationManifestSha256);const prep=JSON.parse(prepBytes);for(const r of prep.files)await checked(r);
const refs=JSON.parse(await readFile(join(here,'OWNER_REFERENCES.json'),'utf8'));for(const r of refs.canonicalOperatorOwners)await checked(r);await checked(refs.scriptedActor);await access(refs.scriptedActor.path,constants.X_OK);
assert.equal(await realpath(b.node.configuredPath),b.node.realPath);await checked({path:b.node.realPath,bytes:b.node.bytes,sha256:b.node.sha256});assert.equal(await realpath(process.execPath),b.node.realPath);
await checked(b.candidateArchive);const install=JSON.parse(await checked(b.installReceipt));if(b.cutRecord){const cut=JSON.parse(await checked(b.cutRecord));assert.equal(cut.archive,b.candidateArchive.path);assert.equal(cut.source.artifactDigest,'sha256:'+b.candidateArchive.sha256);assert.equal(cut.source.sourceCommit,b.subject.sourceCommit);assert.equal(cut.installedRoot,b.installRoot);assert.equal(cut.installHost,b.bootstrapInstallHost);}
assert.equal(b.installRoot,join(b.bootstrapInstallHost,'node_modules/@abiogenesis/typescript-tenant'));
assert.equal(install.installedOwnerRead?.installedRoot??install.installedRoot,b.installRoot);
assert(install.checksums?.some(r=>r.path===b.candidateArchive.path&&r.sha256===b.candidateArchive.sha256)||install.artifactDigest==='sha256:'+b.candidateArchive.sha256,'installed receipt/archive identity mismatch');
assert(Array.isArray(b.helperPins));assert.deepEqual(b.helperPins.map(x=>x.relativePath).sort(),[...refs.helperRelativePaths].sort());for(const r of b.helperPins)await checked({path:join(b.packageRoot,r.relativePath),bytes:r.bytes,sha256:r.sha256});for(const r of b.installIdentityPins)await checked(r);
assert.deepEqual(b.contextBodyBytes,[1048576,4194304]);assert.equal(b.scriptedActorOnly,true);assert.equal(b.qualification,false);assert(Array.isArray(b.additionalCounterSources));assert([null,'4MiB-profile'].includes(b.cpuProfileCall));if(b.cpuProfileCall!==null)assert.equal(b.subject.phase,'after');
const k=b.bounds;assert.equal(k.hostMs,600000);assert.equal(k.aggregateBytes,1073741824);assert.equal(k.outputBytes,16777216);assert.equal(k.rawCliRequestBytes,67108864);assert.equal(k.nodeHeapMiB,8192);assert(k.coldReadMs>0&&k.coldReadMs<=120000);assert(k.actorInactivityMs>0&&k.actorInactivityMs<=30000);assert(k.actorAbsoluteMs>=k.actorInactivityMs&&k.actorAbsoluteMs<=60000);
assert(inside(b.outputRoot)&&b.outputRoot===resolve(b.outputRoot));assert(/^\/private\/tmp\/abg-r8m-[a-z0-9-]{1,35}$/.test(b.tempRoot));await absent(b.outputRoot);await absent(b.tempRoot);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(refs.canonicalOperatorOwners[0].path));
await mkdir(b.outputRoot,{mode:0o700});await mkdir(b.tempRoot,{mode:0o700});await mkdir(join(b.tempRoot,'tmp'));
for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(b.tempRoot,n),'',{flag:'wx'});
const env={HOME:process.env.HOME,PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:join(b.tempRoot,'tmp'),NODE_OPTIONS:'--max-old-space-size=8192',npm_config_userconfig:join(b.tempRoot,'npm-user.npmrc'),npm_config_globalconfig:join(b.tempRoot,'npm-global.npmrc'),npm_config_cache:join(b.tempRoot,'npm-cache'),npm_config_offline:'true',npm_config_ignore_scripts:'true',npm_config_audit:'false',npm_config_fund:'false',ABG_TS_CLAUDE_COMMAND:refs.scriptedActor.path,ABG_TS_FP_TIMEOUT_MS:String(k.actorInactivityMs),ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:String(k.actorAbsoluteMs),ABG_TS_FP_TERMINATION_GRACE_MS:'2000',ABI5_REFERENCE_BINDINGS:input,ABI5_REFERENCE_BINDINGS_SHA256:process.argv[3]};
await exclusiveRecord(b.outputRoot,'EXECUTION_STARTED.json',{at:new Date().toISOString(),input:{path:input,bytes:raw.length,sha256:process.argv[3]},admission:{path:admissionPath,bytes:admissionBytes.length,sha256:process.argv[5]},environment:env,bounds:k,aggregateEnforcement:'Monitored phase-boundary operational stop; not a quota; overshoot possible between checks.',providerCallsSelected:0});
const command=commandRecorder(b.outputRoot,{environment:env,timeoutMs:k.hostMs,maxOutputBytes:k.outputBytes});
let result=null,failure=null;
try{result=await command('matched-reference',b.node.configuredPath,['--test','--test-concurrency=1','--test-reporter=tap',join(here,'measurement-002.test.mjs')],{cwd:b.packageRoot,environment:env});}catch(error){failure=String(error?.stack??error);await exclusiveRecord(b.outputRoot,'HOST_FAILURE.json',{failure});}
const closed=result?.exitCode===0&&!result.signal&&!result.timedOut&&!result.truncated&&!result.failure&&!failure;
await exclusiveRecord(b.outputRoot,'HOST_SUMMARY.json',{status:closed?'MATCHED_REFERENCE_MEASUREMENT_CLOSED':'MATCHED_REFERENCE_MEASUREMENT_FAILED',exitCode:result?.exitCode??null,signal:result?.signal??null,wallMs:result?.wallMs??null,timedOut:result?.timedOut??null,truncated:result?.truncated??null,failure:failure??result?.failure??null,commandReceipt:'commands/matched-reference.result.json',measurement:'MEASUREMENT.json',actualClose:'ACTUAL_CLOSE.json',qualified:false,providerCallsSelected:0});
if(!closed)process.exitCode=1;
