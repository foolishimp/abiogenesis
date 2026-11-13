// Root-operated setup only. Requires a later frozen Root selection; never invokes lifecycle/providers.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat,mkdir,readFile,realpath} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const carrier=join(base,'single-machine-p1-01');
const work='/Users/jim/src/apps/abiogenesis-single-machine-p1';
const target=join(carrier,'runtime-001');
const selected=join(base,'witness-001-prep/selected-c2-b11-004.json');
const selectedDigest='sha256:6f66ebb195146f727db22a983cae775b7b6bf3004207f5b51a354efff545ff83';
const source=join(carrier,'SOURCE_CHECKPOINT_14.json');
const sourceDigest='sha256:0a29c6726eee9bad810fbd5102e03265ad854bf3e94df2c6eaf46bd473f6c2f3';
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
async function pin(path,digest){assert.equal(resolve(path),path);assert(/^sha256:[0-9a-f]{64}$/.test(digest));const v=await readFile(path);assert.equal(sha(v),digest,`changed: ${path}`);return v;}
async function absent(path){try{await lstat(path);throw Error(`must be absent: ${path}`)}catch(e){if(e.code!=='ENOENT')throw e;}}
async function main(){
 assert.equal(process.argv.length,4,'usage: node prepare-rc3-builder.mjs ABSOLUTE_ROOT_SELECTION SHA256');
 const decisionPath=process.argv[2],decisionDigest=process.argv[3];
 assert.equal(decisionPath,join(carrier,'ROOT_SETUP_SELECTION.json'));
 const d=JSON.parse(await pin(decisionPath,decisionDigest));
 assert.equal(d.kind,'single_machine_p1_root_setup_selection_v1');assert.equal(d.status,'ROOT_SELECTED_SETUP');assert.equal(d.providerDispatch,false);
 await pin(join(carrier,'prepare-rc3-builder.mjs'),d.operatorScriptSha256);
 assert.equal(d.worksiteRoot,work);assert.equal(d.runtimeRoot,target);assert.equal(d.sourceCommit,'97406077c9a91e18e9425c3df55c6cd80f4c2073');
 assert.equal(d.recursionBound,4);assert.equal(d.runId,'single-machine-p1-01');
 assert.equal(d.artifactSha256,'sha256:0f77694c1930b069477afd39f0f33bcd53d1e60522b45c32da75b93b1628ac2c');
 const c=JSON.parse(await pin(source,sourceDigest));assert.equal(c.files.length,14);
 assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),d.sourceCommit);
 execFileSync('/usr/bin/git',['-C',work,'diff','--quiet']);execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
 assert.equal(await realpath(work),work);for(const r of c.files){const v=await readFile(join(work,r.path));assert.equal(v.length,r.bytes);assert.equal(sha(v),'sha256:'+r.sha256,r.path);}
 await absent(target);await absent(join(work,'.abiogenesis'));
 const required=[join(base,'operator-client/public-setup.mjs'),join(base,'operator-client/runner.mjs'),join(base,'operator-client/consumer.mjs'),join(base,'operator-client/scenarios.mjs'),join(base,'witness-001-prep/verify-c2-b07.py')];
 assert.deepEqual([...d.operatorClosure.map(x=>x.path)].sort(),[...required].sort());for(const row of d.operatorClosure)await pin(row.path,row.sha256);
 for(const row of d.executablePins)await pin(row.path,row.sha256);
 assert.equal(d.executablePins.length,3);assert.equal(new Set(d.executablePins.map(x=>x.path)).size,3);
 assert.equal(d.pythonPath,'/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12');
 assert(d.executablePins.some(r=>r.path===d.pythonPath));assert(d.executablePins.some(r=>r.path===d.nodePath));assert(d.executablePins.some(r=>r.path===d.npmPath));
 assert.equal(await realpath(process.execPath),d.nodePath);assert.equal(d.authority.path,join(carrier,'WORKSPACE_AUTHORITY.md'));await pin(d.authority.path,d.authority.sha256);
 const original=JSON.parse(await pin(selected,selectedDigest));const verifier=required[4];
 const checked=JSON.parse(execFileSync(d.pythonPath,['-B',verifier,selected,selectedDigest],{encoding:'utf8',maxBuffer:8*1024*1024}));
 assert.equal(checked.artifactSha256,d.artifactSha256);assert.equal(sha(canonical(checked.manifest)),original.artifact.manifestDigest);
 const members=new Map(checked.members.map(r=>[r.path,r.sha256]));const loc=checked.manifest.productRelativeLocators;
 assert(Array.isArray(loc)&&new Set(loc).size===loc.length);
 const inventory=loc.map(path=>{assert(members.has(path));return {path,sha256:members.get(path)}}).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 assert.equal(sha(canonical(inventory)),original.artifact.productContentDigest);
 // Existing operator modules are imported only after all transitive local module pins pass.
 const {installedModules,verifyArtifact,publicCaller,populateSandbox}=await import(pathToFileURL(required[0]).href);
 const {exclusiveRecord,commandRecorder}=await import(pathToFileURL(required[1]).href);
 await mkdir(target,{mode:0o700});const record=(p,v,raw=false)=>exclusiveRecord(target,p,v,raw);
 try{
  await record('selection.json',{decisionPath,decisionDigest,sourceDigest,builderSelection:selectedDigest,providerCalls:0});
  const ext=JSON.parse(execFileSync(d.pythonPath,['-B',verifier,selected,selectedDigest,'--extract',join(target,'bootstrap')],{encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(ext.artifactSha256,d.artifactSha256);const pkg=join(target,'bootstrap/package');
  const product=await import(pathToFileURL(join(pkg,'build/code/src/product/index.js')).href);const a=original.artifact;
  assert.equal(product.sha256Canonical(ext.manifest),a.manifestDigest);
  const verified=await product.verifyProduct({artifactPath:checked.artifactPath,artifactRef:pathToFileURL(checked.artifactPath).href,expectedArtifactDigest:a.sha256,expectedProductContentDigest:a.productContentDigest,expectedManifestDigest:a.manifestDigest,expectedProductId:a.productId,expectedPackageName:a.packageName,expectedPackageVersion:a.packageVersion});
  await record('bootstrap-verification.json',verified);assert.equal(verified.disposition,'verified');
  const lock=product.constructResolvedProductLock([verified]);await record('bootstrap-lock.json',lock);
  const installed=await product.installProduct({artifactPath:checked.artifactPath,targetRoot:join(target,'bootstrap-install'),verifiedArtifact:verified,resolvedLock:lock});
  await record('bootstrap-installation.json',installed);assert.equal(installed.disposition,'materialized');assert(product.isProductInstallCandidate(installed,lock));assert(await product.installedProductContentMatches(installed));
  const actual=await installedModules(installed.installedRoot);assert(await actual.product.installedProductContentMatches(installed));
  const manifest=JSON.parse(await readFile(join(installed.installedRoot,'product-toolchain-manifest.json'),'utf8'));assert.equal(actual.product.sha256Canonical(manifest),a.manifestDigest);
  const env={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]])),NODE_OPTIONS:'--max-old-space-size=8192'};
  const config={runId:d.runId,bootstrapRoot:installed.installedRoot,worksiteRoot:work,nodePath:d.nodePath,toolchains:{npm:{executable:d.npmPath}},recursionBound:d.recursionBound,setupEnvironment:env,importAuthority:{ref:pathToFileURL(d.authority.path).href,digest:d.authority.sha256}};
  const native=await verifyArtifact(actual,{artifactPath:checked.artifactPath,manifest,expectedArtifactDigest:a.sha256},record,'abg');
  const command=commandRecorder(target,{environment:env,timeoutMs:300000});const caller=publicCaller({root:target,runtime:actual,native,command,record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
  const setup=await populateSandbox(caller);
  await record('operator-resume-material.json',{config:{...caller.config,setupEnvironment:{keys:Object.keys(env)}},native,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup});
  await record('summary.json',{status:'fresh-rc3-builder-setup-completed',sourceCommit:d.sourceCommit,artifact:a.sha256,providerCalls:0,qualification:false,installedRoot:caller.installedRoot,operations:caller.state.calls});
  console.log(JSON.stringify({status:'fresh-rc3-builder-setup-completed',runtime:target,providerCalls:0}));
 }catch(e){await record('failure.json',{status:'setup-failed',providerCalls:0,name:e.name,message:e.message});throw e;}
}
main().catch(e=>{console.error(JSON.stringify({status:'refused-or-failed',name:e.name,message:e.message}));process.exitCode=1;});
