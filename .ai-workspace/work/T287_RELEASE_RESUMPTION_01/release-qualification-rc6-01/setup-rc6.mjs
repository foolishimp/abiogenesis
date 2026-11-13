// Operator recipe: exact installed RC6 owners; maintained SDK setup, no native dispatch.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(join(dir,'SETUP_SELECTION.json'));
assert.equal(sha(raw),process.argv[2],'Exact Root-selected setup digest required');
const selection=JSON.parse(raw),c=selection.config;
assert.equal(selection.status,'ROOT_SELECTED_SETUP');
for(const pin of selection.files){const b=await readFile(pin.path);assert.equal(sha(b),pin.sha256,pin.path);assert.equal(b.length,pin.bytes,pin.path);}
const inventory=JSON.parse(await readFile(selection.installedInventory,'utf8'));
assert.equal(inventory.members,5325);
for(const row of inventory.inventory){const b=await readFile(join(c.bootstrapRoot,row.path));assert.equal(b.length,row.bytes,row.path);assert.equal('sha256:'+sha(b),row.digest,row.path);}
assert.equal(execFileSync('/usr/bin/git',['-C',c.worksiteRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),c.sourceCommit);
execFileSync('/usr/bin/git',['-C',c.worksiteRoot,'diff','--quiet']);
execFileSync('/usr/bin/git',['-C',c.worksiteRoot,'diff','--cached','--quiet']);
assert.equal(await realpath(c.bootstrapRoot),c.bootstrapRoot);
for(const p of [c.runtimeRoot,join(c.worksiteRoot,'.abiogenesis')]){try{await lstat(p);throw Error('Fresh target exists: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
const {installedModules,verifyArtifact,publicCaller,populateSandbox}=await import('./operator-client/public-setup.mjs');
const {exclusiveRecord,commandRecorder}=await import('./operator-client/runner.mjs');
const totalStart=performance.now(),startedUtc=new Date().toISOString();
const runtime=await installedModules(c.bootstrapRoot),manifest=JSON.parse(await readFile(join(c.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(runtime.product.sha256Canonical(manifest),c.builder.manifestDigest);
await mkdir(c.runtimeRoot,{mode:0o700});
const record=(p,v,raw=false)=>exclusiveRecord(c.runtimeRoot,p,v,raw);
try {
  const env=selection.environment;
  const config={...c,setupEnvironment:env};
  await record('run.json',{kind:'release_qualification_installed_rc6_setup',startedUtc,sourceCommit:c.sourceCommit,builder:c.builder,
    methodBasis:'stdo://releases/v3.0.4/',builderRuntimeMethodBasis:'stdo://releases/v3.0.4/',nativeDispatch:false,providerCalls:0});
  const verifyStart=performance.now();
  const native=await verifyArtifact(runtime,{artifactPath:c.builder.archivePath,manifest,expectedArtifactDigest:c.builder.artifactDigest},record,'abg');
  const artifactVerificationMs=performance.now()-verifyStart;
  const caller=publicCaller({root:c.runtimeRoot,runtime,native,command:commandRecorder(c.runtimeRoot,{environment:env,timeoutMs:300000}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
  // The fixture's default clean target is replaced by the existing imported
  // workspace member, as selected for this exact nonempty source worktree.
  // All later construction, invocation, SDK transport and close handoffs remain
  // the byte-identical maintained setup path. No Product implementation changes.
  const authorize=caller.authorize;let imported=0;
  caller.authorize=(packet,request,resources,slots)=>{
    if(packet===runtime.product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean){
      assert.equal(imported++,0);assert.equal(request.targetRoot,c.worksiteRoot);
      return authorize(runtime.product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.imported,
        {targetRoot:c.worksiteRoot,createPolicy:'imported',importAuthority:selection.importAuthority,preservationPolicy:'preserve_all_existing'},resources,slots);
    }
    return authorize(packet,request,resources,slots);
  };
  const setupStart=performance.now(),setupStartedUtc=new Date().toISOString();
  const setup=await populateSandbox(caller);
  const sdkSetupMs=performance.now()-setupStart;
  assert.equal(imported,1);
  await record('operator-resume-material.json',{config,native,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority,
    state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup});
  const timing={startedUtc,setupStartedUtc,endedUtc:new Date().toISOString(),artifactVerificationMs,sdkSetupMs,totalOperatorMs:performance.now()-totalStart,
    operations:caller.state.calls,workerLaunchMs:null,betweenTaskMs:null,qualification:false,providerCalls:0,
    definition:'SDK setup starts before maintained populateSandbox and ends after its completed owner calls. Imported workspace selection is explicit. Bootstrap import/artifact verification and checkout/preparation are separate.'};
  await record('SETUP_TIMING.json',timing);
  await record('summary.json',{status:'RC6_CAMPAIGN_BOUND_NO_NATIVE_DISPATCH',sourceCommit:c.sourceCommit,installedRoot:caller.installedRoot,
    workspaceBinding:caller.state.binding,catalogDigest:caller.state.catalog.basisDigest,closeHandoff:caller.state.closeHandoff,sdkSetupMs,providerCalls:0,qualification:false});
  console.log(JSON.stringify({status:'RC6_CAMPAIGN_BOUND_NO_NATIVE_DISPATCH',runtimeRoot:c.runtimeRoot,sdkSetupMs,artifactVerificationMs,providerCalls:0}));
}catch(error){await record('setup-failure.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,
  elapsedMs:performance.now()-totalStart,providerCalls:0,meaning:'Actual setup failure retained; no automatic retry or old handoff substitution.'});throw error;}
