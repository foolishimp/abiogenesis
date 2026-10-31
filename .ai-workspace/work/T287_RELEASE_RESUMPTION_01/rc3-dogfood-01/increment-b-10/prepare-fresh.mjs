// Root-only fresh RC2 setup, same existing canonical worksite.
// No lifecycle invocation or provider dispatch. Root reviews exact selection before operation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat,mkdir,readFile,realpath} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {installedModules,verifyArtifact,publicCaller,populateSandbox} from './public-setup.mjs';
import {exclusiveRecord,commandRecorder} from '../operator-client/runner.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const setup=join(base,'setup-005'),work='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
const install='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.2/node_modules/@abiogenesis/typescript-tenant';
const archive='/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.2/abiogenesis-typescript-tenant-5.0.0-rc.2.tgz';
const artifact='sha256:36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528';
const manifestDigest='sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d';
const sourceCommit='927b8c0b84915ea2c926115902c2ceeef6df26a3',actorRef='actor://abiogenesis/operator/codex-root';
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
async function pinned(path,digest){assert(typeof path==='string'&&resolve(path)===path&&/^sha256:[a-f0-9]{64}$/u.test(digest));const b=await readFile(path);assert.equal(sha(b),digest,'selected input drift: '+path);return b;}
async function absent(path){try{await lstat(path);throw Error('already exists: '+path)}catch(e){if(e.code!=='ENOENT')throw e;}}
async function main(){
 assert.equal(process.argv.length,4,'usage: node prepare-fresh.mjs /absolute/selection.json sha256:<selection-bytes>');
 const s=JSON.parse(await pinned(process.argv[2],process.argv[3]));assert.equal(s.kind,'b10_root_selected_fresh_setup_v1');assert.equal(s.status,'PREPARED_FOR_ROOT_OPERATION');
 const decision=JSON.parse(await pinned(s.operatorDecision.path,s.operatorDecision.sha256));assert.equal(decision.kind,'b10_fresh_store_executive_selection');assert.equal(decision.status,'PREPARED_FOR_ROOT_OPERATION');assert.equal(decision.sourceCommit,sourceCommit);assert.equal(decision.recursionBound,4);assert.equal(decision.providerDispatch,false);
 for(const key of ['selectedTask','selectedHow','selectedRubric','sourceBinding'])await pinned(decision[key].path,decision[key].sha256);
 // Root materializes only these4 new declaration inputs; they are not C2 protected sources.
 for(const name of ['task.md','HOW.md','rubric.json','COUNTEREXAMPLE.json']){const selected=await readFile(join(base,'increment-b-10',name));await pinned(join(work,'rc3-operator-inputs/increment-b-10',name),sha(selected));}
 assert.deepEqual(decision.ProductWriteRoots,[
 'build_tenants/abiogenesis/typescript/code/src/abg/governed_context.ts',
 'build_tenants/abiogenesis/typescript/test_env/tests/t287-governed-context.test.mjs',
 'build_tenants/abiogenesis/typescript/design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md']);
 const priorRoot=join(base,'attempt-011');
 for(const [key,file] of Object.entries({execution:'execution.json',afterRun:'after-run-resume.json',outcome:'outcome-summary.json',freshReads:'fresh-reads.json',started:'STARTED.json'}))
  assert.equal(s.previous?.[key]?.path,join(priorRoot,file),'wrong prior native record: '+key);
 // Both actual native closure and completed fresh readbacks must precede setup;
 // they are old-store evidence, not Results imported into the fresh store.
 const execution=JSON.parse(await pinned(s.previous.execution.path,s.previous.execution.sha256));
 const handoff=JSON.parse(await pinned(s.previous.afterRun.path,s.previous.afterRun.sha256));
 const summary=JSON.parse(await pinned(s.previous.outcome.path,s.previous.outcome.sha256));
 await pinned(s.previous.freshReads.path,s.previous.freshReads.sha256);
 const started=JSON.parse(await pinned(s.previous.started.path,s.previous.started.sha256));
 assert.equal(execution.receipt.ownerOutput.outcomeKind,summary.outcomeKind);assert.equal(execution.receipt.ownerOutput.value?.disposition,summary.disposition);
 assert(handoff.state?.closeHandoff?.prefix && handoff.workspaceAuthority);assert(Number.isSafeInteger(started.pid)&&started.pid>1);
 try{process.kill(started.pid,0);throw Error('previous Root dispatcher is still alive or PID is reused');}catch(e){if(e.code!=='ESRCH')throw e;}
 const custody=JSON.parse(await pinned(s.sourceCustody.path,s.sourceCustody.sha256));assert.equal(custody.baseCommit,sourceCommit);assert.equal(custody.rows.length,23);
 const grant=JSON.parse(await readFile(join(base,'increment-b-01/grant.json'),'utf8'));const exactPaths=[...grant.existingPaths,...grant.newPaths].sort();
 assert.equal(new Set(exactPaths).size,23);assert.deepEqual(custody.rows.map(r=>r.path).sort(),exactPaths,'source custody does not match the exact grant');
 assert.equal(sha(await readFile(join(work,'stdo_abiogenesis.json'))),'sha256:6d4caf2b6c6dd4c6e6386aba751e0967749103f2d19d96dfba36eaa68f8f7d28','Product definition changed');
 assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:work,encoding:'utf8'}).trim(),sourceCommit);
 const changes=execFileSync('/usr/bin/git',['status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],{cwd:work,encoding:'utf8'}).split('\0').filter(Boolean).map(x=>x.slice(3)).sort();
 assert.deepEqual(changes,custody.rows.filter(r=>r.gitStatus!=='  ').map(r=>r.path).sort());
 for(const r of custody.rows){const p=join(work,r.path),st=await lstat(p);assert(st.isFile()&&!st.isSymbolicLink());assert.equal(await realpath(p),p,'source path is not canonical');const bytes=await readFile(p),after=await lstat(p);assert.equal(st.ino,after.ino);assert.equal(st.size,after.size);assert.equal(st.mtimeMs,after.mtimeMs);assert.equal(bytes.length,r.current.bytes,r.path);assert.equal(sha(bytes),'sha256:'+r.current.sha256,r.path);}
 const rawManifest=await pinned(s.workspaceManifest.path,s.workspaceManifest.sha256);assert.equal(s.workspaceManifest.path,join(work,'.abiogenesis/workspace-manifest.json'));
 const wm=JSON.parse(rawManifest);assert.equal(wm.canonicalRoot,work);assert.equal(wm.workspaceRef,s.workspaceRef);
 assert.deepEqual({ref:wm.authorityBasis.authorityRef,digest:wm.authorityBasis.authorityDigest},s.expectedManifestAuthority);
 const basis=handoff.workspaceAuthority;assert.equal(basis.workspaceId,wm.workspaceRef);assert.equal(basis.canonicalRoot,work);assert.equal(basis.authorizedActorRef,actorRef);
 assert.deepEqual({ref:basis.authorityBasisId,digest:basis.authorityBasisDigest},s.selectedWorkspaceBasis);
 assert.equal(s.authority.path,join(base,'OPERATOR.md'));assert.equal(s.authority.sha256,'sha256:894892f17553b4c7c7781aacae7e436f92c43365edeb5399b10cfba0f7ddd896');
 await pinned(s.authority.path,s.authority.sha256);assert.equal(sha(await readFile(archive)),artifact);
 const activation=join(base,'runtime-activation-001');const installRecord=JSON.parse(await pinned(join(activation,'installation.json'),s.builder.installationSha256));
 const summaryRecord=JSON.parse(await pinned(join(activation,'activation-summary.json'),s.builder.summarySha256));
 const inventory=JSON.parse(await pinned(join(activation,'payload-correspondence.json'),s.builder.payloadCorrespondenceSha256));
 assert.equal(installRecord.installedRoot,install);assert.equal(summaryRecord.installedRoot,install);assert.equal(inventory.installedRoot,install);assert.equal(inventory.artifactDigest,artifact);
 assert.equal(installRecord.artifactDigest,artifact);assert.equal(installRecord.manifestDigest,manifestDigest);assert.equal(installRecord.productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.2');
 assert.equal(summaryRecord.source.artifactDigest,artifact);assert.equal(summaryRecord.source.manifestDigest,manifestDigest);
 assert.equal(await realpath(install),install);assert.equal(inventory.inventory.length,inventory.members);
 assert.equal(sha(await readFile(join(install,'contracts/default-library/stdo/manifest.json'))),'sha256:f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477','installed method basis changed');
 // Validate the installed artifact bytes against the retained selected inventory
 // before importing any installed RC2 module. This does not scan the old event log.
 for(const row of inventory.inventory){assert(typeof row.path==='string'&&!row.path.startsWith('/')&&!row.path.split('/').some(x=>x===''||x==='.'||x==='..'));
  const file=join(install,row.path),st=await lstat(file);assert(st.isFile()&&!st.isSymbolicLink());assert.equal(await realpath(file),file,'installed path is not canonical');const bytes=await readFile(file);assert.equal(bytes.length,row.bytes,row.path);assert.equal(sha(bytes),row.digest,row.path);}
 await absent(setup);const runtime=await installedModules(install);assert(await runtime.product.installedProductContentMatches(installRecord));
 assert(runtime.product.isWorkspaceAuthorityBasis(basis),'selected workspace authority is invalid');
 const manifest=JSON.parse(await readFile(join(install,'product-toolchain-manifest.json'),'utf8'));assert.equal(runtime.product.sha256Canonical(manifest),manifestDigest);
 assert.equal(manifest.productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.2');assert.equal(manifest.packageVersion,'5.0.0-rc.2');
 await mkdir(setup,{mode:0o700});const record=(p,v,raw=false)=>exclusiveRecord(setup,p,v,raw);
 const env={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]])),NODE_OPTIONS:'--max-old-space-size=8192'};
 const config={runId:'rc3-dogfood-01-b10-fresh-setup',bootstrapRoot:install,worksiteRoot:work,nodePath:'/opt/homebrew/bin/node',toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},
  recursionBound:4,setupEnvironment:env,workspaceManifestPath:s.workspaceManifest.path,workspaceManifestSha256:s.workspaceManifest.sha256,workspaceRef:s.workspaceRef,
  expectedManifestAuthority:s.expectedManifestAuthority,workspaceAuthority:basis,selectedWorkspaceBasis:s.selectedWorkspaceBasis};
 await record('run.json',{kind:'b10_fresh_store_workspace_open',selectionDigest:process.argv[3],previousRun:summary.run,sourceCustody:s.sourceCustody,
  classification:'fresh local RC2 setup only; no inherited native Results or provider call',environmentNames:Object.keys(env).sort(),recursionBound:4});
 try{
  const native=await verifyArtifact(runtime,{artifactPath:archive,manifest,expectedArtifactDigest:artifact},record,'abg');
  const command=commandRecorder(setup,{environment:env,timeoutMs:300000});
  const caller=publicCaller({root:setup,runtime,native,command,record,config,actorRef});const result=await populateSandbox(caller);
  await record('operator-resume-material.json',{config:{...config,setupEnvironment:{keys:Object.keys(env)}},native,installedRoot:caller.installedRoot,
   workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup:result});
  await record('summary.json',{status:'fresh-store-setup-completed',sourceCommit,providerCalls:0,qualification:false,installedRoot:caller.installedRoot,operations:caller.state.calls});
  console.log(JSON.stringify({status:'fresh-store-setup-completed',record:setup,installedRoot:caller.installedRoot,providerCalls:0}));
 }catch(e){await record('failure.json',{status:'setup-failed',name:e.name,message:e.message,providerCalls:0});throw e;}
}
main().catch(e=>{console.error(JSON.stringify({status:'refused-or-failed',name:e.name,message:e.message}));process.exitCode=1;});
