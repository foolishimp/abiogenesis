// Prepared RC2-specific Public setup; execute only after Root selects activation.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {installedModules,verifyArtifact,publicCaller,populateSandbox} from './public-setup.mjs';
import {exclusiveRecord,commandRecorder} from './runner.mjs';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const activation=join(base,'runtime-activation-001'), setup=join(base,'setup-001');
const authorityPath=join(base,'OPERATOR.md');
const expectedAuthority='sha256:894892f17553b4c7c7781aacae7e436f92c43365edeb5399b10cfba0f7ddd896';
const installedRoot='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.2/node_modules/@abiogenesis/typescript-tenant';
const archive='/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.2/abiogenesis-typescript-tenant-5.0.0-rc.2.tgz';
const expectedDigest='sha256:36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528';
const expectedManifest='sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d';
const worksite='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
const sourceCommit='d1e4527dbbc0b9ca1a929122c62ca225184f3341';
const sha=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(await readFile(authorityPath)),expectedAuthority,'operator authority changed');
assert.equal(sha(await readFile(archive)),expectedDigest,'RC2 archive changed');
assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:worksite,encoding:'utf8'}).trim(),sourceCommit);
assert.equal(execFileSync('/usr/bin/git',['status','--porcelain=v1','-uno'],{cwd:worksite,encoding:'utf8'}),'','tracked RC3 worksite changed');
const installation=JSON.parse(await readFile(join(activation,'installation.json'),'utf8'));
const summary=JSON.parse(await readFile(join(activation,'activation-summary.json'),'utf8'));
assert.equal(installation.installedRoot,installedRoot);assert.equal(summary.installedRoot,installedRoot);
assert.equal(summary.source.artifactDigest,expectedDigest);assert.equal(summary.source.manifestDigest,expectedManifest);
const runtime=await installedModules(installedRoot);
assert(await runtime.product.installedProductContentMatches(installation),'installed RC2 content changed');
const manifest=JSON.parse(await readFile(join(installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(runtime.product.sha256Canonical(manifest),expectedManifest);
assert.equal(manifest.productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.2');
assert.equal(manifest.packageVersion,'5.0.0-rc.2');
await mkdir(setup);
const record=(path,value,raw=false)=>exclusiveRecord(setup,path,value,raw);
const environment=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const config={runId:'rc3-dogfood-01-setup-001',bootstrapRoot:installedRoot,worksiteRoot:worksite,
 nodePath:'/opt/homebrew/bin/node',toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:4,
 setupEnvironment:environment,importAuthority:{ref:pathToFileURL(authorityPath).href,digest:expectedAuthority}};
await record('run.json',{kind:'rc3_operator_workspace_preparation',classification:'Fresh RC2 exact Product through Public owners; no RC3 acceptance or native qualification',operator:'actor://abiogenesis/operator/codex-root',sourceCommit,timestamp:new Date().toISOString(),providerCalls:0,config:{...config,setupEnvironment:{keys:Object.keys(environment)}}});
try{
 const native=await verifyArtifact(runtime,{artifactPath:archive,manifest,expectedArtifactDigest:expectedDigest},record,'abg');
 const command=commandRecorder(setup,{environment,timeoutMs:300000});
 const caller=publicCaller({root:setup,runtime,native,command,record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
 const outcome=await populateSandbox(caller);
 await record('operator-resume-material.json',{config:{...config,setupEnvironment:{keys:Object.keys(environment)}},native,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup:outcome});
 await record('summary.json',{status:'workspace-prepared',providerCalls:0,canonicalRoot:worksite,installedRoot:caller.installedRoot,operations:caller.state.calls});
 console.log(JSON.stringify({status:'workspace-prepared',providerCalls:0,record:setup,installedRoot:caller.installedRoot}));
}catch(error){
 await record('failure.json',{status:'preparation-failed',providerCalls:0,name:error?.name,message:error?.message,stack:error?.stack});
 console.error(JSON.stringify({status:'preparation-failed',providerCalls:0,message:error?.message,record:setup}));process.exitCode=1;
}
