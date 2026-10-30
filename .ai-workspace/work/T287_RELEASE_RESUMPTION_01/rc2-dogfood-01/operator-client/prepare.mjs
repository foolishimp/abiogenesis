import {readFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {installedModules,verifyArtifact,publicCaller,populateSandbox} from './public-setup.mjs';
import {exclusiveRecord,commandRecorder} from './runner.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const root=join(base,'setup-001'); await mkdir(root);
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
const authorityPath=join(base,'OPERATOR.md');
const authorityBytes=await readFile(authorityPath);
const installedRoot='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.1/node_modules/@abiogenesis/typescript-tenant';
const archive='/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.1/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz';
const environment=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const config={runId:'rc2-dogfood-01-setup-001',bootstrapRoot:installedRoot,
 worksiteRoot:'/Users/jim/src/apps/abiogenesis-rc2-dogfood',nodePath:'/opt/homebrew/bin/node',
 toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:4,setupEnvironment:environment,
 importAuthority:{ref:pathToFileURL(authorityPath).href,digest:'sha256:'+createHash('sha256').update(authorityBytes).digest('hex')}};
await record('run.json',{kind:'rc2_operator_workspace_preparation',classification:'Real RC2 source worksite using the frozen generic consumer declaration; no UAT or native qualification claim',operator:'actor://abiogenesis/operator/codex-root',sourceCommit:'5b793c65e5c85ad76cf7eb45bef98263f95c00cb',timestamp:new Date().toISOString(),providerCalls:0,budget:'pending',config:{...config,setupEnvironment:{keys:Object.keys(environment)}}});
try {
 const runtime=await installedModules(installedRoot);
 const manifest=JSON.parse(await readFile(join(installedRoot,'product-toolchain-manifest.json'),'utf8'));
 const native=await verifyArtifact(runtime,{artifactPath:archive,manifest,expectedArtifactDigest:'sha256:1ab469106e27a693c1720f3e0a76e605a3ba03168d89f49dd7dee4c2665696e9'},record,'abg');
 const command=commandRecorder(root,{environment,timeoutMs:300000});
 const caller=publicCaller({root,runtime,native,command,record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
 const setup=await populateSandbox(caller);
 await record('operator-resume-material.json',{config:{...config,setupEnvironment:{keys:Object.keys(environment)}},native,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup});
 await record('summary.json',{status:'workspace-prepared',providerCalls:0,canonicalRoot:config.worksiteRoot,installedRoot:caller.installedRoot,operations:caller.state.calls});
 console.log(JSON.stringify({status:'workspace-prepared',providerCalls:0,record:root,installedRoot:caller.installedRoot}));
} catch(error) {
 await record('failure.json',{status:'preparation-failed',providerCalls:0,name:error?.name,message:error?.message,stack:error?.stack});
 console.error(JSON.stringify({status:'preparation-failed',providerCalls:0,message:error?.message,record:root})); process.exitCode=1;
}
