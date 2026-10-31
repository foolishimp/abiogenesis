// Operator-selected C2 bootstrap and Public setup. No lifecycle/provider call.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat,mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,verifyArtifact,publicCaller,populateSandbox} from './public-setup-b07.mjs';
import {exclusiveRecord,commandRecorder} from '../operator-client/runner.mjs';
import {IDS} from '../operator-client/consumer.mjs';
async function main(){
const here=fileURLToPath(new URL('.',import.meta.url));
const runtime=join(here,'runtime-b07-001'),python='/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12';
const sha=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
// Same JSON primitive/array/key ordering used by the installed Product digest.
const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
if(process.argv.length!==4)throw Error('usage: node bootstrap.mjs /absolute/selected-c2.json sha256:<selection-bytes>');
const selectionPath=process.argv[2],selectionDigest=process.argv[3];
assert.equal(resolve(selectionPath),selectionPath);assert(/^sha256:[a-f0-9]{64}$/u.test(selectionDigest));
const raw=await readFile(selectionPath);assert.equal(sha(raw),selectionDigest,'selected input changed');const selection=JSON.parse(raw);
// No mutation or RC3 import until C2 producer and all selected bytes/identities pass.
assert.equal(sha(await readFile(python)),'sha256:a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539','pinned verifier Python changed');
const verifier=join(here,'verify-c2-b07.py');
const checked=JSON.parse(execFileSync(python,['-B',verifier,selectionPath,selectionDigest],{encoding:'utf8',maxBuffer:8*1024*1024}));
assert.equal(sha(canonical(checked.manifest)),selection.artifact.manifestDigest,'selected canonical manifest mismatch');
const members=new Map(checked.members.map(row=>[row.path,row.sha256]));
const locators=checked.manifest.productRelativeLocators;assert(Array.isArray(locators)&&new Set(locators).size===locators.length);
const inventory=locators.map(path=>{assert.equal(typeof path,'string');assert(members.has(path),'missing declared payload: '+path);return {path,sha256:members.get(path)};}).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
assert.equal(sha(canonical(inventory)),selection.artifact.productContentDigest,'selected Product content mismatch');
const authority=await readFile(selection.operator.authorityPath);assert.equal(sha(authority),selection.operator.authoritySha256);
assert.equal(selection.operator.consumerModulePath,join(here,'consumer-b07.mjs'),'B07 witness requires this exact consumer');
assert.equal(selection.operator.policyRef,'member://abi5-tests/gc03/private-policy@5');
const consumerBytes=await readFile(selection.operator.consumerModulePath);assert.equal(sha(consumerBytes),selection.operator.consumerModuleSha256);
assert.equal(await (await import('node:fs/promises')).realpath(process.execPath),selection.operator.nodePath,'selected Node executable mismatch');
assert.equal(sha(await readFile(join(here,'task.md'))),selection.operator.taskSha256);
assert.equal(sha(await readFile(join(here,'rubric.json'))),selection.operator.rubricSha256);
const fixtureFiles=['task.md','rubric.json','fixture.txt'];
assert.equal(sha(await readFile(join(here,'fixture.txt'))),'sha256:bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6');
try{await lstat(runtime);throw Error('witness runtime already exists: '+runtime)}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(runtime,{mode:0o700});const record=(path,value,rawValue=false)=>exclusiveRecord(runtime,path,value,rawValue);
await record('selected-producer.json',{selectionDigest,selection,externalValidation:checked.nativeAdmission,providerCalls:0});
try{
 const extracted=JSON.parse(execFileSync(python,['-B',verifier,selectionPath,selectionDigest,'--extract',join(runtime,'bootstrap')],{encoding:'utf8',maxBuffer:8*1024*1024}));
 assert.equal(extracted.artifactSha256,checked.artifactSha256);assert.equal(extracted.manifestByteSha256,checked.manifestByteSha256);
 const pkg=join(runtime,'bootstrap/package');const product=await import(pathToFileURL(join(pkg,'build/code/src/product/index.js')).href);
 assert.equal(product.sha256Canonical(extracted.manifest),selection.artifact.manifestDigest,'canonical manifest mismatch');
 const a=selection.artifact,verified=await product.verifyProduct({artifactPath:checked.artifactPath,artifactRef:pathToFileURL(checked.artifactPath).href,
  expectedArtifactDigest:a.sha256,expectedProductContentDigest:a.productContentDigest,expectedManifestDigest:a.manifestDigest,
  expectedProductId:a.productId,expectedPackageName:a.packageName,expectedPackageVersion:a.packageVersion});
 await record('bootstrap-verification.json',verified);assert.equal(verified.disposition,'verified');
 const lock=product.constructResolvedProductLock([verified]);assert.equal(lock.kind,'resolved_product_lock');await record('bootstrap-lock.json',lock);
 const installed=await product.installProduct({artifactPath:checked.artifactPath,targetRoot:join(runtime,'bootstrap-install'),verifiedArtifact:verified,resolvedLock:lock});
 await record('bootstrap-installation.json',installed);assert.equal(installed.disposition,'materialized');assert(product.isProductInstallCandidate(installed,lock));
 assert(await product.installedProductContentMatches(installed));assert.equal(sha(await readFile(checked.artifactPath)),a.sha256);
 const actual=await installedModules(installed.installedRoot);assert(await actual.product.installedProductContentMatches(installed));
 const manifest=JSON.parse(await readFile(join(installed.installedRoot,'product-toolchain-manifest.json'),'utf8'));
 assert.equal(actual.product.sha256Canonical(manifest),a.manifestDigest);
 // This module is operator-selected and byte-pinned. It is trusted executable operator code,
 // not a model choice, capability grant, or proof that the resulting policy is admitted.
 const adapter=join(installed.installedRoot,'build/code/support/governed-context/host_adapter.py');
 const adapterDigest=sha(await readFile(adapter)).slice(7),policyRoot=join(runtime,'gc03-policy');
 const generated=JSON.parse(execFileSync(python,['-B',join(here,'make-gc03-candidate-b07.py'),'--adapter',adapter,'--adapter-sha256',adapterDigest,'--out-dir',policyRoot],{encoding:'utf8'}));
 execFileSync(python,['-B',join(here,'make-activation-template-b07.py'),policyRoot],{encoding:'utf8'});
 await writeFile(join(policyRoot,'operator-binding.json'),JSON.stringify({installedRoot:installed.installedRoot,adapter,adapterDigest,generated},null,2)+'\n',{flag:'wx'});
 await record('generated-policy.json',generated);
 const consumer=await import(pathToFileURL(selection.operator.consumerModulePath).href);
 assert.equal(typeof consumer.prepareConsumer,'function');assert.deepEqual(consumer.IDS,IDS);
 const worksite=join(runtime,'worksite');await mkdir(worksite);for(const f of fixtureFiles)await writeFile(join(worksite,f),await readFile(join(here,f)),{flag:'wx'});
 const env=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
 const config={runId:'rc3-governed-lookup-witness-b07-001',bootstrapRoot:installed.installedRoot,worksiteRoot:worksite,nodePath:selection.operator.nodePath,
  toolchains:{npm:{executable:selection.operator.npmPath}},recursionBound:3,setupEnvironment:env,
  importAuthority:{ref:pathToFileURL(selection.operator.authorityPath).href,digest:selection.operator.authoritySha256}};
 await record('run.json',{kind:'rc3_witness_public_setup',classification:'local setup only; no native witness, Product release or qualification',
  operator:'actor://abiogenesis/operator/codex-root',producer:{runRef:selection.producer.runRef,resultRef:selection.producer.resultRef,resultDigest:selection.producer.resultDigest},
  consumerModuleSha256:selection.operator.consumerModuleSha256,policyRef:selection.operator.policyRef,environmentNames:Object.keys(env).sort(),providerCalls:0});
 const native=await verifyArtifact(actual,{artifactPath:checked.artifactPath,manifest,expectedArtifactDigest:a.sha256},record,'abg');
 const command=commandRecorder(runtime,{environment:env,timeoutMs:300000});
 const caller=publicCaller({root:runtime,runtime:actual,native,command,record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
 const setup=await populateSandbox(caller,{witnessConsumer:{prepareConsumer:consumer.prepareConsumer,policyRef:selection.operator.policyRef}});
 await record('operator-resume-material.json',{config:{...caller.config,setupEnvironment:{keys:Object.keys(env)}},native,installedRoot:caller.installedRoot,
  workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,
  catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup});
 await record('summary.json',{status:'local-public-setup-completed',providerCalls:0,source:checked.producer,installedRoot:caller.installedRoot,
  operations:caller.state.calls,qualification:false,limits:['Selected producer admission is verified separately by the native owner','Actual lookup witness remains pending']});
 console.log(JSON.stringify({status:'local-public-setup-completed',record:runtime,installedRoot:caller.installedRoot,providerCalls:0}));
}catch(error){await record('failure.json',{status:'setup-failed',providerCalls:0,name:error.name,message:error.message});throw error;}

}
main().catch(error=>{console.error(JSON.stringify({status:'bootstrap-refused-or-failed',name:error?.name,message:error?.message}));process.exitCode=1;});
