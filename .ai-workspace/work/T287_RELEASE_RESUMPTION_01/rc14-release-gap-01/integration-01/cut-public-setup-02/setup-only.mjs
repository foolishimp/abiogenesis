// External setup entry only; Product owners and maintained setup remain unchanged.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir,lstat} from 'node:fs/promises';
import {dirname,join,relative,isAbsolute} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const b=JSON.parse(await readFile(process.argv[2],'utf8'));
assert.equal(b.executionAuthorized,true);assert(b.executionGrant);
const control=b.retainedControlRoot, successorControl=dirname(fileURLToPath(import.meta.url));
const tenant=join(b.controlSourceRoot,'build_tenants/abiogenesis/typescript');
const load=path=>import(pathToFileURL(join(tenant,path)).href);
const R=await load('test_env/uat/runner.mjs'),P=await load('test_env/uat/public-setup.mjs');
const root=join(b.rawRoot,'public-setup');await mkdir(root);
const record=(path,value,raw=false)=>R.exclusiveRecord(root,path,value,raw);
const config={runId:b.runId,worksiteRoot:b.worksiteRoot,setupEnvironment:b.setupEnvironment,
  recursionBound:12,toolchains:{npm:{executable:b.toolchains.npm.path}}};
const executionDeadline=b.hostDeadlineUtc;

// Same accepted bridge/owned-command route as basic04, with no credential source.
async function command(label,executable,args,{cwd=root,environment=b.setupEnvironment,timeoutMs=300000,maxBytes=16777216}={}) {
  assert(/^[A-Za-z0-9_-]+$/.test(label));assert.deepEqual(environment,b.setupEnvironment);
  assert(timeoutMs>0&&timeoutMs<=300000);assert(maxBytes>0&&maxBytes<=16777216);
  const folder=join(root,'commands',label);await mkdir(join(root,'commands'),{recursive:true});
  const job={folder,argv:[executable,...args],cwd,environment,deadlineUtc:executionDeadline,capMs:timeoutMs,maxBytes};
  const child=spawn(b.toolchains.python.path,[join(control,'command-owner.py')],{cwd:root,
    env:{...b.setupEnvironment,PYTHONDONTWRITEBYTECODE:'1'},stdio:['pipe','pipe','pipe']});
  const out=[],err=[];let captured=0,truncated=false,launchError=null;
  const collect=target=>chunk=>{captured+=chunk.length;if(captured<=65536)target.push(chunk);else truncated=true;};
  child.stdout.on('data',collect(out));child.stderr.on('data',collect(err));child.on('error',e=>{launchError=String(e);});
  const closing=new Promise(resolve=>child.on('close',(exitCode,signal)=>resolve({exitCode,signal})));
  child.stdin.on('error',e=>{launchError??=String(e);});child.stdin.end(JSON.stringify(job));
  await record('commands/'+label+'.bridge-launch.json',{pid:child.pid??null,enclosingHostPid:process.pid,
    commandOwner:join(control,'command-owner.py'),deadlineUtc:executionDeadline});
  const closed=await closing;
  await record('commands/'+label+'.bridge-close.json',{...closed,launchError,truncated,captured});
  await record('commands/'+label+'.bridge.stdout',Buffer.concat(out),true);await record('commands/'+label+'.bridge.stderr',Buffer.concat(err),true);
  if(launchError||truncated)throw new P.BoundaryFailure(label+'-command-bridge',{launchError,truncated,folder});
  const result=JSON.parse(await readFile(join(folder,'result.json'),'utf8'));
  const finalCapture=JSON.parse(await readFile(join(root,'commands',label+'.final-capture.json'),'utf8'));
  if(result.exitCode!==0||result.stopReason||!result.cleanup.ownedProcessGroupAbsent||!finalCapture.withinLimit)
    throw new P.BoundaryFailure(label+'-command-custody',{result,finalCapture});
  return {...result,stdout:await readFile(join(folder,'stdout.raw'),'utf8'),stderr:await readFile(join(folder,'stderr.raw'),'utf8'),timedOut:false,truncated:false};
}

// Reuse basic04's authenticated import-condition resolution; no private owner import.
const packageJsonPath=join(b.candidate.bootstrapPackageRoot,'package.json');
const packageJson=JSON.parse(await readFile(packageJsonPath,'utf8'));
assert.equal(packageJson.name,'@abiogenesis/typescript-tenant');assert.equal(packageJson.version,'5.0.0-rc.14');
const packageUrl=pathToFileURL(packageJsonPath),runtime={};
for(const [name,key] of [['product','product'],['abg','abg'],['gtl','gtl'],['validator','validator'],['public','api']]) {
  const declared=packageJson.exports?.['./'+name];assert(declared&&typeof declared==='object'&&!Array.isArray(declared));
  const target=declared.import;assert(typeof target==='string'&&target.startsWith('./'));
  const url=new URL(target,packageUrl);assert.equal(url.protocol,'file:');assert.equal(url.search,'');assert.equal(url.hash,'');
  const entry=fileURLToPath(url),rel=relative(b.candidate.bootstrapPackageRoot,entry);
  assert(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'));
  assert((await lstat(entry)).isFile());runtime[key]=await import(pathToFileURL(entry).href);
}

// The accepted two-role partition; no overlap-driven filtering or observer change.
function topologyLayouts(environment) {
  const binding=environment.workspaceBinding,roots=Object.values(binding.roots);
  assert(roots.every(value=>typeof value==='string'));
  const installRoots=environment.productInstalls.map(row=>row.installedRoot);assert.equal(installRoots.length,2);
  const unique=values=>[...new Set(values)].sort();
  const external=unique([b.candidate.bootstrapPackageRoot,b.candidate.archivePath,b.controlSourceRoot,
    control,successorControl,...b.protectedRoots]);
  assert(![...roots,...installRoots,...external].includes(b.rawRoot));
  const completeProtectedRoots=unique([...roots,...installRoots,...external,b.rawRoot]);
  const writePaths=[join(b.worksiteRoot,'.abiogenesis/workspace-manifest.json')];
  const layouts=[
    {role:'operator-custody',layout:{worksite:b.worksiteRoot,writePaths,protectedRoots:unique([b.rawRoot,...external]),archiveRoot:b.rawRoot}},
    {role:'runtime-owner',layout:{worksite:b.worksiteRoot,writePaths,protectedRoots:unique([...roots,...installRoots,...external]),archiveRoot:binding.roots.archiveRoot}},
  ];
  assert.equal(layouts[0].layout.writePaths,layouts[1].layout.writePaths);
  assert.deepEqual(unique(layouts.flatMap(row=>row.layout.protectedRoots)),completeProtectedRoots);
  return {bindingId:binding.bindingId??null,installRoots,completeProtectedRoots,layouts};
}

let caller;
try {
  await record('run.json',{runId:b.runId,controlSourceCommit:b.controlSourceCommit,candidate:b.candidate,
    claim:'Prospective RC14 Public installation and closed setup only; no Run, provider or qualification.'});
  const manifest=JSON.parse(await readFile(join(b.candidate.bootstrapPackageRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await P.verifyArtifact(runtime,{artifactPath:b.candidate.archivePath,manifest,
    expectedArtifactDigest:b.candidate.archiveSha256},record,'abg');
  caller=P.publicCaller({root,runtime,native,command,record,config});
  await P.populateSandbox(caller,{retain:false,program:'consumer'});
  assert.equal(caller.state.resource,null);assert.equal(caller.state.selection,null);assert(caller.state.closeHandoff);
  const environment=caller.refresh(),prepared=topologyLayouts(environment);
  await record('topology-after-setup.roles.json',{bindingId:prepared.bindingId,installRoots:prepared.installRoots,
    completeProtectedRoots:prepared.completeProtectedRoots,roles:prepared.layouts.map(row=>({role:row.role,archiveRoot:row.layout.archiveRoot}))});
  for(const {role,layout} of prepared.layouts) {
    const label='topology-after-setup-'+role,layoutPath=await record(label+'.layout.json',layout);
    const observed=await command(label,b.toolchains.python.path,[join(control,'physical-topology.py'),layoutPath],{timeoutMs:30000,maxBytes:4194304});
    const value=JSON.parse(observed.stdout);assert.equal(value.ok,true);assert.equal(value.disposition,'separated');
    await record(label+'.observation.json',{role,layout,observed:value});
  }
  const identityPath=join(root,'installed/0/identity.json');
  const identity=JSON.parse(await readFile(identityPath,'utf8')),installed=identity.install;
  assert.equal(installed.installedRoot,join(root,'sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant'));
  assert.equal(installed.artifactDigest,b.candidate.archiveSha256);assert.equal(installed.packageVersion,'5.0.0-rc.14');
  await record('HANDOFF.json',{kind:'public_install_setup_handoff',installedPackageRoot:installed.installedRoot,
    installRecord:identityPath,archivePath:b.candidate.archivePath,archiveSha256:b.candidate.archiveSha256,
    sourceCommit:b.candidate.sourceCommit,installId:installed.installId,admissionEventRef:installed.admissionEventRef,
    setupClose:join(root,'setup-close.json'),setupIdentity:join(root,'setup-identity.json'),
    claim:'Admitted install and actual setup close; archive/install comparison and final custody belong to outer Return.',qualified:false});
}catch(error) {
  await record('FAILURE.json',{name:error.name,message:error.message,stage:error.stage??null,qualified:false});
  throw error;
}
