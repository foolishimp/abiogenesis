#!/usr/bin/env node
// Bounded L3 proof glue. Installed execution requires a separately frozen L4 grant.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {access,chmod,copyFile,lstat,mkdir,readFile,readdir,readlink,realpath,rename,writeFile} from 'node:fs/promises';
import {basename,dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {LANGUAGE,NATIVE_TASK,NATIVE_EXPECTED,preparationOracle,partialInstallOracle,executionOracle,nativeOracle} from '../realization/proof/oracle.mjs';

const exec=promisify(execFile), self=fileURLToPath(import.meta.url);
const lanes=['public-preparation','partial-install','declared-execution','stdo3-native-selection'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const pin=async value=>{assert.ok(value&&isAbsolute(value.path),'absolute pinned file');assert.equal(sha(await readFile(value.path)),value.sha256,value.path);return value.path;};
const within=(root,path)=>{const r=relative(root,path);return r===''||(!r.startsWith('..')&&!isAbsolute(r));};
const cleanJson=value=>JSON.parse(JSON.stringify(value)); // Callable properties are not evidence; their package coordinates are retained separately.
let evidence=null,configuration=null,lane=null,runEnvironment=null;
const measures=[],commands=[],retainedCleanup=[];
async function record(name,value,raw=false) {
  const path=join(evidence,name); assert.ok(within(evidence,path)); await mkdir(dirname(path),{recursive:true});
  await writeFile(path,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'}); return path;
}
async function measure(name,fn) {
  const wall=performance.now(),cpu=process.cpuUsage(),before=process.memoryUsage();
  try{return await fn();}finally{measures.push({name,wallMs:performance.now()-wall,cpuUs:process.cpuUsage(cpu),memoryBefore:before,memoryAfter:process.memoryUsage(),resourceUsage:process.resourceUsage(),scope:'runner process; interval includes awaited child work; CPU is parent only; samples are not heap peaks'});}
}
async function command(label,executable,args,{cwd,environment=runEnvironment}={}) {
  const before=performance.now(); let result;
  try {result={...await exec(executable,args,{cwd,env:environment,maxBuffer:64*1024*1024}),exitCode:0};}
  catch(error){result={stdout:error.stdout??'',stderr:error.stderr??'',exitCode:error.code??null,signal:error.signal??null,error:String(error)};}
  const observed={label,executable,args,cwd,wallMs:performance.now()-before,...result};
  commands.push({label,executable,args,cwd,exitCode:result.exitCode,wallMs:observed.wallMs});
  await record(`commands/${commands.length}-${label}.json`,observed);
  return result;
}
async function newRoot(path) {
  assert.ok(isAbsolute(path)); try {await lstat(path);assert.fail(`resource already exists: ${path}`);} catch(error){if(error.code!=='ENOENT')throw error;}
  await mkdir(path,{recursive:true});assert.equal(await realpath(path),path,'no resource-root symlink');
}
async function verifyInventory({path,sha256,root}) {
  await pin({path,sha256}); const inventory=await json(path);
  assert.ok(Array.isArray(inventory.files)&&inventory.files.length>0);
  for(const row of inventory.files){
    const file=join(root,row.path);assert.ok(within(root,file));const stat=await lstat(file);
    if(row.type==='symlink'){assert.equal(stat.isSymbolicLink(),true);assert.equal(await readlink(file),row.target);assert.ok(within(root,await realpath(file)),'no mutable external dependency symlink');}
    else {assert.equal(stat.isFile(),true);assert.equal(sha(await readFile(file)),row.sha256,file);if(row.bytes!==undefined)assert.equal(stat.size,row.bytes,file);}
    if(row.mode!==undefined)assert.equal(stat.mode&0o777,typeof row.mode==='string'?Number(row.mode):row.mode,file+' mode');
  }
  return inventory;
}
async function preflight(path,selectedLane) {
  const bytes=await readFile(path),c=JSON.parse(bytes); assert.equal(c.kind,'t287_installed_proof_configuration');
  assert.equal(c.status,'activated','template is not an execution grant');assert.ok(lanes.includes(selectedLane));
  const grant=await json(c.activationFile);
  assert.equal(grant.kind,'t287_installed_proof_effect_grant');assert.equal(grant.status,'granted');
  assert.equal(grant.configurationSha256,sha(bytes));assert.equal(grant.runnerSha256,sha(await readFile(self)));
  assert.equal(grant.oracleSha256,sha(await readFile(new URL('../realization/proof/oracle.mjs',import.meta.url))));
  assert.ok(grant.lanes.includes(selectedLane));assert.equal(grant.subjectId,c.subject.id);
  assert.equal(c.method.manifestSha256,'069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232');
  assert.deepEqual(c.method.composition,[]);assert.equal(c.retryCount,0);assert.equal(c.cleanup,false);
  assert.ok(isAbsolute(c.subject.stageTenant));
  assert.notEqual(c.subject.stageTenant,'/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript');
  assert.ok(!c.subject.stageTenant.includes('/proof/baseline/source/'),'immutable snapshot is not executable stage');
  for(const item of [c.subject.archive,c.subject.manifest,c.subject.packageInventory,c.externalConsumer,c.toolchains.node,c.toolchains.npm,...c.requiredEvidence])await pin(item);
  assert.equal(await realpath(process.execPath),await realpath(c.toolchains.node.path));
  assert.equal(process.version,c.toolchains.node.version);
  for(const inventory of c.subject.inventories)await verifyInventory(inventory);
  const supports=await json(await pin(c.subject.supportManifest));
  for(const row of supports.files)await pin({path:join(c.subject.stageTenant,row.path),sha256:row.sha256});
  assert.ok(supports.files.some(r=>r.path==='test_env/uat/public-setup.mjs'));
  assert.ok(supports.files.every(r=>!r.path.includes('native-registered-selection.mjs')),'historical companion helper excluded');
  const selected=c.lanes[selectedLane];assert.ok(selected);
  assert.deepEqual(grant.resources[selectedLane],selected.roots,'exact effect roots');
  for(const value of Object.values(selected.roots)) {
    assert.ok(isAbsolute(value));assert.ok(!/continuation17/i.test(value));
    assert.ok(!within(c.subject.stageTenant,value));
    try{await access(value);assert.fail('root already exists: '+value);}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  assert.ok(!within('/Users/jim/src/apps/abiogenesis',selected.roots.scratchParent),'helper/native working directories are outside the mutable source checkout');
  assert.equal(c.environment.npm_config_offline,'true');assert.equal(c.environment.npm_config_ignore_scripts,'true');
  assert.equal(c.environment.NODE_OPTIONS,undefined,'no ambient injection');
  assert.equal(c.environment.ABG_TS_CLAUDE_COMMAND,undefined,'only P4 supplies provider');
  for(const name of ['npm','node']) {
    let actual;for(const directory of c.environment.PATH.split(':')){try{const file=join(directory,name);await access(file);actual=await realpath(file);break;}catch(error){if(error.code!=='ENOENT')throw error;}}
    assert.equal(actual,await realpath(c.toolchains[name].path),'helpers select exact '+name+' through PATH');
  }
  if(selectedLane!=='public-preparation') {
    assert.ok(c.requiredEvidence.length>0,'dependent lane requires closed prerequisites');
    for(const prerequisite of c.requiredEvidence){const observed=await json(prerequisite.path);assert.equal(observed.status,'satisfied',prerequisite.path);assert.equal(observed.subjectId,c.subject.id);}
  }
  if(selectedLane==='partial-install') {
    await pin(selected.preparationResult);await pin(selected.preparationSetup);await pin(selected.verificationCall);await pin(selected.verificationOutcome);
    const prior=await json(selected.preparationResult.path);assert.equal(prior.status,'satisfied');assert.equal(prior.lane,'public-preparation');assert.equal(prior.subjectId,c.subject.id);
  }
  if(selectedLane==='stdo3-native-selection') {
    assert.equal(grant.maxNativePositiveCalls,1);assert.equal(c.subject.id,'candidate');
    assert.deepEqual(c.provider,{executable:'/Users/jim/.local/share/claude/versions/2.1.303',sha256:'d2da3b003dc08b88b7230469014fe3e1dc6fe94bc8f648e89b34175d30269370',model:'claude-opus-5-5',effort:'xhigh',inactivityTimeoutMs:120000,absoluteTimeoutMs:600000,terminationGraceMs:1000});
    await pin({path:c.provider.executable,sha256:c.provider.sha256});await pin(c.sourceManifest);
    assert.equal(c.sourceManifest.sha256,c.method.manifestSha256);
    const expectations=['P1','P2','P3','P5-physical','P5-U1'];
    assert.deepEqual([...new Set(c.requiredEvidence.flatMap(x=>x.obligations))].sort(),expectations.sort(),'each native prerequisite has its own exact evidence');
  }
  return {c,selected,grant,configurationSha256:sha(bytes)};
}
async function physical(root) {
  const expected=await json(configuration.subject.packageInventory.path);assert.ok(expected.files.length>0);
  const rows=[];
  for(const row of expected.files) {
    const path=join(root,row.path);assert.ok(within(root,path));const stat=await lstat(path);
    const observed=stat.isSymbolicLink()?{path:row.path,type:'symlink',target:await readlink(path)}:{path:row.path,sha256:sha(await readFile(path)),bytes:stat.size};
    if(row.type==='symlink'){assert.equal(observed.target,row.target);assert.ok(within(root,await realpath(path)));}
    else assert.equal(observed.sha256,row.sha256,path);
    rows.push(observed);
  }
  const actual=[];
  async function visit(path){for(const item of await readdir(path,{withFileTypes:true})){const file=join(path,item.name);if(item.isDirectory())await visit(file);else actual.push(relative(root,file).split('\\').join('/'));}}
  await visit(root);assert.deepEqual(actual.sort(),expected.files.map(row=>row.path).sort(),'exact installed package member set');
  assert.equal(sha(await readFile(join(root,'product-toolchain-manifest.json'))),configuration.subject.manifest.sha256);
  return {root,manifestMatches:true,membersMatch:true,files:rows};
}
async function bootstrap(selected) {
  await newRoot(selected.roots.host);
  await writeFile(join(selected.roots.host,'package.json'),JSON.stringify({name:'t287-proof-host',version:'1.0.0',private:true,type:'module'})+'\n',{flag:'wx'});
  const install=await command('bootstrap-offline-install',configuration.toolchains.npm.path,['install','--offline','--ignore-scripts','--no-audit','--no-fund','--bin-links=false',configuration.subject.archive.path],{cwd:selected.roots.host});
  assert.equal(install.exitCode,0,'first bootstrap installation');
  const root=join(selected.roots.host,'node_modules/@abiogenesis/typescript-tenant');
  await record('bootstrap-inventory.json',await physical(root));
  const consumer=join(selected.roots.host,'external-consumer.mts');await copyFile(configuration.externalConsumer.path,consumer);
  const declarations=await command('installed-declaration-consumer',configuration.toolchains.node.path,
    [join(configuration.subject.stageTenant,'node_modules/typescript/bin/tsc'),'--noEmit','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022','--strict','--skipLibCheck','false',
      '--typeRoots',join(configuration.subject.stageTenant,'node_modules/@types'),consumer],{cwd:selected.roots.host});
  assert.equal(declarations.exitCode,0,'external installed declarations with skipLibCheck:false');
  return root;
}
const support=path=>import(pathToFileURL(join(configuration.subject.stageTenant,path)).href);
const owner=(root,path)=>import(pathToFileURL(join(root,'build/code/src',path+'.js')).href);
async function p1(selected,bootstrapRoot) {
  const api=await support('test_env/uat/public-setup.mjs');
  const runtime=await measure('cold-installed-owner-acquisition',()=>api.installedModules(bootstrapRoot));
  const manifest=await json(configuration.subject.manifest.path);
  const native=await api.verifyArtifact(runtime,{artifactPath:configuration.subject.archive.path,manifest,expectedArtifactDigest:'sha256:'+configuration.subject.archive.sha256},record,'native');
  const caller=api.publicCaller({root:evidence,runtime,native,command,record,config:{runId:selected.runId,
    nodePath:configuration.toolchains.node.path,toolchains:{npm:{executable:configuration.toolchains.npm.path}},
    bootstrapRoot,setupEnvironment:runEnvironment,worksiteRoot:selected.roots.worksite,recursionBound:3}});
  const setup=await measure('public-preparation',()=>api.populateSandbox(caller));
  const {product,abg,validator}=runtime, state=caller.state;
  const args={catalog:state.catalog,catalogView:state.catalogView,admittedInstalls:state.environment.productInstalls,
    verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(state.environment.artifactTruth,install),
    programRef:setup.fixture.publication.programs[0].programRef,
    selection:Object.freeze({kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'})};
  const first=await measure('execution-resolution-first',()=>product.ProductExecutionResolutionPort.resolve(args));
  await record('resolution-first.json',cleanJson(first));assert.equal(first.kind,'loaded_product_execution_resolution');
  const warm=await measure('execution-resolution-warm',()=>product.ProductExecutionResolutionPort.resolve(args));
  await record('resolution-warm.json',cleanJson(warm));assert.equal(warm.kind,'loaded_product_execution_resolution');
  const copiedClosure=structuredClone(first.programDeclarationClosure),copiedProgram=structuredClone(first.program);
  const cold=product.constructCatalogProgramValidationInput(state.catalog,state.catalogView,copiedClosure,copiedProgram);
  assert.notEqual(cold.kind,'raw_admission_refusal');const copied=validator.validateProgram(cold);
  const mutated=product.constructCatalogProgramValidationInput(state.catalog,state.catalogView,{...copiedClosure,closureDigest:product.sha256Canonical({changed:'proof'})},first.program);
  const crossed=await product.ProductExecutionResolutionPort.resolve({...args,admittedInstalls:args.admittedInstalls.map(x=>({...x,lockDigest:product.sha256Canonical({crossed:'proof'})}))});
  await record('resolution-negatives.json',{copied,mutated,crossed});
  const oracle=preparationOracle({setup,first,warm,reusedValidation:first.programValidation===warm.programValidation,
    copiedValidation:{sameIdentity:copied===first.programValidation,value:copied},mutatedValidation:mutated,crossedLock:crossed});
  await record('p1-owner-state.json',{closeHandoff:state.closeHandoff,resolvedLock:state.resolvedLock,installations:setup.installations,
    native,workspaceBinding:state.binding,calls:state.calls,fixture:setup.fixture.basis,selectedProgram:first.program,resolution:first.resolution});
  await record('events.jsonl',await readFile(new URL(state.closeHandoff.prefix.eventLogRef)),true);
  return {oracle,closeHandoff:state.closeHandoff,nativeCalls:0};
}
async function p2(selected,bootstrapRoot) {
  const api=await support('test_env/uat/public-setup.mjs'),runtime=await api.installedModules(bootstrapRoot);
  const {product,abg}=runtime,setup=await json(selected.preparationSetup.path),native=setup.native;
  assert.equal(native.request.expectedArtifactDigest,'sha256:'+configuration.subject.archive.sha256);
  const beforePrefix=setup.closeHandoff.prefix,beforeTruth=abg.projectExactPrefixArtifactTruth(beforePrefix);
  const firstInvocation=setup.calls.find(x=>x.label==='product-install-0').invocationRef;
  const originalBefore=abg.projectAdmittedProductInstallByInvocationRef(beforeTruth,firstInvocation);
  assert.ok(originalBefore?.install);await record('before-owner-projection.json',{beforeTruth,originalBefore,closeHandoff:setup.closeHandoff});
  const oldVerificationCall=JSON.parse((await readFile(selected.verificationCall.path,'utf8')).trim()).invocation;
  const verificationOutcome=await json(selected.verificationOutcome.path);
  const verification={invocation:{ref:oldVerificationCall.invocation.invocationRef,digest:oldVerificationCall.invocation.invocationDigest},outcome:verificationOutcome.receipt.ownerOutput.value.verifiedArtifact};
  const caller=api.publicCaller({root:evidence,runtime,native,command,record,config:{runId:selected.runId,nodePath:configuration.toolchains.node.path,bootstrapRoot,setupEnvironment:runEnvironment}});
  caller.state.closeHandoff=setup.closeHandoff;
  const lock={ref:setup.resolvedLock.lockId,digest:setup.resolvedLock.lockDigest};
  const packed=oldVerificationCall.resources.packedArtifact;
  const call=await caller.authorize(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
    {verifiedArtifact:native.verification.coordinates.verifiedArtifact,descriptor:packed.descriptor,contributionManifest:packed.contributionManifest,resolvedLock:lock,targetRoot:selected.roots.secondInstall,installPolicy:'clean'},
    {kind:'product_install_resource_assertion',schemaVersion:'5.0.0',eventResource:caller.reopen(),packedArtifact:packed,verifiedArtifact:native.verified,resolvedLock:setup.resolvedLock},
    {dependency_lock:lock,verification_references:[verification],actor:caller.actor});
  assert.notEqual(call.invocation.invocationRef,firstInvocation);
  const execution=await measure('second-physical-install-and-admission',()=>caller.invoke('second-install',call,{expectResult:false}));
  const returned=execution.receipt.resources.eventResource.closeHandoff;
  await record('actual-returned-handoff.json',returned);
  const afterTruth=abg.projectExactPrefixArtifactTruth(returned.prefix);
  const originalAfter=abg.projectAdmittedProductInstallByInvocationRef(afterTruth,firstInvocation);
  const secondAdmission=abg.projectAdmittedProductInstallByInvocationRef(afterTruth,call.invocation.invocationRef);
  await record('after-owner-projection.json',{afterTruth,originalAfter,secondAdmission});
  const inspected=await physical(join(selected.roots.secondInstall,'node_modules/@abiogenesis/typescript-tenant'));
  await record('second-physical-inventory.json',inspected);await record('original-physical-inventory.json',await physical(originalBefore.install.installedRoot));
  await record('events.jsonl',await readFile(new URL(returned.prefix.eventLogRef)),true);
  return {oracle:partialInstallOracle({receipt:execution.receipt,originalBefore,originalAfter,secondAdmission,physical:inspected,previousPrefix:beforePrefix,returnedPrefix:returned.prefix}),closeHandoff:returned,nativeCalls:0};
}

async function keepEnvironment(environment,label='installed-environment') {
  await record(label+'.json',{scratch:environment.scratch,artifactPaths:environment.artifactPaths,installedRoots:environment.installedRoots,
    verifiedProducts:environment.verifiedProducts,lock:environment.lock,workspaceBinding:environment.workspaceBinding,
    admittedInstalls:environment.admittedInstalls,additionalProducts:cleanJson(environment.additionalProducts),
    publications:environment.publications,catalog:environment.catalog,catalogView:environment.catalogView,
    cleanup:'registered after-hook retained and intentionally never called'});
  for(const [index,artifact] of environment.artifactPaths.entries())
    await record(`artifact-${index}.json`,{path:artifact,sha256:sha(await readFile(artifact)),bytes:(await lstat(artifact)).size});
}
async function freshReads(environment,receipt,identity) {
  const helpers=await support('test_env/support/registered-graph-selection.mjs');
  const publicApi=await owner(environment.installedRoot,'public/index'),contracts=await owner(environment.installedRoot,'abg/project_read_operation_contracts');
  const handoff=receipt.resources.eventResource.closeHandoff,reads=[];
  for(const memberKey of ['run_result','run_replay']) {
    const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:environment.product.sha256Canonical(handoff)};
    const built=helpers.constructInstalledRunReadCall({environment,publicApi,projectReadContracts:contracts,memberKey,
      selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'},source:receipt.resources.run,eventResource,identity:identity+'-'+memberKey});
    const before=await readFile(new URL(handoff.prefix.eventLogRef));
    await record(`reads/${identity}-${memberKey}-call.json`,built.call);
    const read=await measure('fresh-'+memberKey,()=>helpers.runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,
      identity:identity+'-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:built.call,environment:runEnvironment,expectedExitCode:null}));
    await record(`reads/${identity}-${memberKey}.json`,read);
    const eventBytesUnchanged=before.equals(await readFile(new URL(handoff.prefix.eventLogRef)));
    assert.ok(read.output.receipt,'fresh owner receipt');
    reads.push({memberKey,call:built.call,receipt:read.output.receipt,eventBytesUnchanged});
  }
  return reads;
}
async function p3(selected) {
  const helper=await support('test_env/support/installed-language-test.mjs');
  const proof=await measure('language-setup-and-start',()=>helper.runInstalledLanguageTest({after:fn=>retainedCleanup.push(fn)},configuration.subject.stageTenant,
    {input:structuredClone(LANGUAGE.input),identity:selected.runId,readback:false,workerEnvironment:runEnvironment}));
  await keepEnvironment(proof.environment);
  await record('start.json',{call:proof.call,resolution:cleanJson(proof.resolution),execution:proof.execution,receipt:proof.receipt,handoff:proof.handoff,fixtureInstalledRoot:proof.fixtureInstalledRoot});
  assert.equal(proof.environment.additionalPublications[0].owningProductId,LANGUAGE.owner);
  assert.equal(proof.resolution.program.programRef,LANGUAGE.program);
  assert.equal(proof.resolution.resolution.programOwner.productId,LANGUAGE.owner);
  assert.equal(proof.resolution.declarationClosure.semanticsOwner.productId,LANGUAGE.owner);
  assert.equal(proof.resolution.implementationSetCandidate.rows[0].implementationOwnerProductId,LANGUAGE.owner);
  assert.notEqual(LANGUAGE.owner,proof.environment.verified.productId);
  const fixture=await support('test_env/fixtures/language-smoke/program.mjs');
  assert.equal(fixture.evaluateLanguageTestResult(LANGUAGE.input,proof.receipt.ownerOutput.value.terminalResult.value),true);
  const reads=await freshReads(proof.environment,proof.receipt,selected.runId);
  const oracle=executionOracle({receipt:proof.receipt,reads,expected:LANGUAGE.output});
  assert.equal(proof.events.filter(e=>e.kind==='actor_invocation_started').length,0,'deterministic producer invokes no native actor');
  assert.equal(proof.events.filter(e=>e.kind==='run_closed').length,1);
  assert.equal(proof.events.filter(e=>e.kind==='graph_call_opened').length,1);
  await record('events.jsonl',await readFile(new URL(proof.handoff.prefix.eventLogRef)),true);
  return {oracle,closeHandoff:proof.handoff,nativeCalls:0,fixtureInstalledRoot:proof.fixtureInstalledRoot};
}
async function sourceMirror(root,product) {
  await newRoot(root);const bytes=await readFile(configuration.sourceManifest.path);
  const members=product.runEnvironmentRecordMembers('stdo_source_manifest@1',bytes);assert.ok(members);
  await writeFile(join(root,'manifest.json'),bytes,{flag:'wx'});
  for(const member of members) {
    assert.equal(member.type,'file');const source=join(configuration.sourceRoot,member.path),target=join(root,member.path);
    assert.ok(within(configuration.sourceRoot,source));assert.ok(within(root,target));
    const content=await readFile(source);assert.equal('sha256:'+sha(content),member.digest,member.path);
    await mkdir(dirname(target),{recursive:true});await writeFile(target,content,{flag:'wx',mode:0o600});
  }
  return members;
}
async function acquisitionNegatives({environment,selectedEnvironment,selected,helpers,publicApi,eventResource}) {
  const {product,gtl}=environment,publication=environment.additionalPublications[0];
  const prepared=await helpers.constructInstalledStartCall({environment,publicApi,eventResource,input:structuredClone(NATIVE_TASK),identity:selected.runId+'-acquisition-basis',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const resources=prepared.call.resources.runEnvironmentResources;
  const authority={authorityRef:prepared.workAuthority.authorityRef,authorityDigest:prepared.workAuthority.authorityDigest,actorRef:prepared.workAuthority.actorRef};
  const input={publication,program:prepared.resolution.program,graphFunctions:publication.graphFunctions,
    authority,archiveRoot:environment.workspaceBinding.roots.archiveRoot,resources};
  const observed=await product.observeRunEnvironment(input);await record('acquisition-positive.json',observed);
  assert.equal(observed.kind,'run_environment_observed');assert.equal(observed.evidence.corpusDocuments,null);assert.deepEqual(observed.evidence.accesses,[]);
  const check=async(name,variant,cause)=>{const result=await product.observeRunEnvironment(variant);await record('acquisition-negative-'+name+'.json',{expectedCause:cause,result});assert.equal(result.kind,'run_environment_refusal');assert.equal(result.cause,cause);};
  await check('missing',{...input,resources:undefined},'missing_binding');
  const permission=structuredClone(resources);permission.permission.authorityRef='authority://t287/crossed';
  await check('permission',{...input,resources:permission},'access_not_permitted');
  const python=structuredClone(resources);python.pythonPath=python.permission.pythonPath=resources.dependencies[0].recordPath;
  await check('python',{...input,resources:python},'access_not_permitted');
  for(const [name,change,cause] of [
    ['span',d=>{d.roles[0].sourceBindings[0].spanDigest=product.sha256Canonical('changed source span');},'identity_mismatch'],
    ['role',d=>{d.roles[0].role='assessor';},'unsupported_declaration'],
    ['locus',d=>{d.roles[0].programLocusRef='node://registered-selection/nonexistent@5';},'unsupported_declaration'],
  ]) {
    const declaration=structuredClone(selectedEnvironment.declaration);change(declaration);
    const scoped=structuredClone(resources);scoped.permission.environmentDigest=product.sha256Canonical(declaration);
    await check(name,{...input,publication:{...publication,runEnvironments:[declaration]},resources:scoped},cause);
  }
  for(const [name,mirror,change,cause] of [
    ['record',selected.roots.recordMirror,async root=>writeFile(join(root,'manifest.json'),'changed manifest\n'),'identity_mismatch'],
    ['member',selected.roots.memberMirror,async root=>writeFile(join(root,'standards/EXECUTIVE_BASELINE.md'),'changed required source\n'),'identity_mismatch'],
    ['missing-member',selected.roots.missingMemberMirror,async root=>rename(join(root,'standards/EXECUTIVE_BASELINE.md'),join(root,'standards/EXECUTIVE_BASELINE.md.unavailable')),'access_unavailable'],
  ]) {
    await sourceMirror(mirror,product);await change(mirror);
    const scoped=structuredClone(resources);scoped.dependencies[0]={...scoped.dependencies[0],root:mirror,recordPath:join(mirror,'manifest.json')};scoped.permission.dependencies=structuredClone(scoped.dependencies);
    await check(name,{...input,resources:scoped},cause);
  }
  await writeFile(join(selected.roots.sourceMirror,'unselected-proof-input.txt'),'Not declared source or context.\n',{flag:'wx'});
  const coLocated=await product.observeRunEnvironment(input);await record('acquisition-unselected-colocation.json',coLocated);assert.deepEqual(coLocated,observed);
  const constructorCases=[];
  for(const [name,change] of [
    ['missing-exact-source',d=>{d.dependencies=[];}],
    ['undeclared-companion-access',d=>{d.accesses=[{accessRef:'access://t287/unselected',operation:'validate',mode:'validation',frameIndexRefs:[],maxOutputBytes:1000,timeoutMs:100}];}],
  ]) {const declaration=structuredClone(selectedEnvironment.declaration);change(declaration);assert.throws(()=>gtl.constructStdoRunEnvironmentDeclaration(declaration),TypeError);constructorCases.push({name,channel:'constructor TypeError; not runtime refusal'});}
  await record('constructor-negatives.json',constructorCases);
  await record('negative-boundary-scope.json',{claim:'actual installed Product acquisition over explicitly controlled declaration/resource inputs; no invocation admission or actor launch in these local cases',positive:observed.evidence.evidenceDigest,runAdmission:'later Public path only'});
}
async function p4(selected) {
  const helpers=await support('test_env/support/registered-graph-selection.mjs');
  const {setupInstalledRootCatalog}=await support('test_env/support/root-installed-environment.mjs');
  const {stdo3RunEnvironment,STDO3_SOURCE}=await support('test_env/support/stdo3-run-environment.mjs');
  const {declarations}=await support('test_env/fixtures/registered-selection-product/native.mjs');
  let selectedEnvironment;
  const setupAccounting={wallMs:{}};
  const environment=await measure('native-fixture-preparation',()=>setupInstalledRootCatalog({after:fn=>retainedCleanup.push(fn)},configuration.subject.stageTenant,
    {candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting,
      prepareAdditionalProducts:async basis=>{
        const members=await sourceMirror(selected.roots.sourceMirror,basis.product);await record('source-members.json',members);
        selectedEnvironment=await stdo3RunEnvironment({gtl:basis.gtl,product:basis.product,sourceRoot:selected.roots.sourceMirror});
        await record('run-environment.json',selectedEnvironment.declaration);
        return [await helpers.prepareRegisteredSelectionProduct({...basis,abiPackageArchivePath:configuration.subject.archive.path,
          declarationFactory:gtl=>declarations(gtl,selectedEnvironment.declaration),fixtureFiles:['index','native'].map(name=>({path:`build/${name}.mjs`,source:pathToFileURL(join(configuration.subject.stageTenant,`test_env/fixtures/registered-selection-product/${name}.mjs`))}))})];
      }}));
  await keepEnvironment(environment);await record('setup-accounting.json',setupAccounting);
  const {product,abg,gtl}=environment,publication=environment.additionalPublications[0];
  const ref=(kind,name)=>`${kind}://registered-selection/${name}@5`;
  const root=publication.graphFunctions.find(g=>g.name===ref('graph-function','root'));
  environment.catalogView=product.narrowGraphFunctionCatalog(environment.catalog,['root','A','B'].map(n=>ref('graph-function',n)));
  assert.equal(environment.catalogView.kind,'graph_function_catalog_view');
  const publicApi=await owner(environment.installedRoot,'public/index'),storeOwner=await owner(environment.installedRoot,'abg/event_store');
  const roleOwner=await owner(environment.installedRoot,'abg/stdo_environment');
  let handoff=environment.store.projectReopenAuthorityAndClose();await record('setup-handoff.json',handoff);
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  await acquisitionNegatives({environment,selectedEnvironment,selected,helpers,publicApi,eventResource:resource()});
  const actorEnvironment={...runEnvironment,ABG_TS_CLAUDE_COMMAND:configuration.provider.executable,
    ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(['--model','claude-opus-5-5','--effort','xhigh','--tools','']),
    ABG_TS_FP_TIMEOUT_MS:'120000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'600000',ABG_TS_FP_TERMINATION_GRACE_MS:'1000'};
  await record('native-input.json',NATIVE_TASK);await record('native-expected.json',NATIVE_EXPECTED);
  await record('native-environment.json',actorEnvironment);
  // These are actual Public preparation/assembly refusals, with a zero-launch oracle.
  // Their identities are distinct work, never retries of a failed native semantic call.
  for(const test of [{name:'missing-resources',input:structuredClone(NATIVE_TASK),resources:false,issue:'missing_binding'},
    {name:'prompt-bound',input:{...structuredClone(NATIVE_TASK),maxPromptBytes:1},resources:true,issue:null}]) {
    const start=await helpers.constructInstalledStartCall({environment,publicApi,eventResource:resource(),input:test.input,identity:selected.runId+'-'+test.name,
      ...(test.resources?{runEnvironmentResourceFactory:selectedEnvironment.resources}:{})});
    await record('negative-'+test.name+'-call.json',start.call);
    const execution=await helpers.runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:selected.runId+'-'+test.name,
      acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,environment:actorEnvironment});
    await record('negative-'+test.name+'.json',execution);
    const receipt=execution.output.receipt;assert.ok(receipt);handoff=receipt.resources.eventResource.closeHandoff;
    await record('negative-'+test.name+'-handoff.json',handoff);
    const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);await record('negative-'+test.name+'-events.json',events);
    assert.equal(events.filter(e=>e.kind==='actor_invocation_started').length,0,'negative must refuse before actor launch');
    if(test.issue){assert.equal(receipt.ownerOutput.outcomeKind,'refusal');assert.ok(receipt.ownerOutput.value.issuePaths.some(p=>p.includes(test.issue)));}
    else {assert.notEqual(receipt.ownerOutput.value?.disposition,'completed');assert.ok(JSON.stringify({receipt,events}).includes('declared_bound_overflow'),'actual owner evidence identifies the declared prompt-bound refusal');}
  }
  const beforeEvents=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),before=beforeEvents.length;
  const start=await helpers.constructInstalledStartCall({environment,publicApi,eventResource:resource(),input:structuredClone(NATIVE_TASK),identity:selected.runId+'-machine',runEnvironmentResourceFactory:selectedEnvironment.resources});
  await record('native-call.json',start.call);
  // The single native positive invocation occurs only here, after all prerequisites.
  const execution=await measure('one-native-positive',()=>helpers.runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,
    identity:selected.runId+'-machine',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,environment:actorEnvironment}));
  await record('native-execution.json',execution);const receipt=execution.output.receipt;assert.ok(receipt);
  handoff=receipt.resources.eventResource.closeHandoff;await record('native-handoff.json',handoff);
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),slice=events.slice(before);
  await record('native-events.json',slice);await record('events.jsonl',await readFile(new URL(handoff.prefix.eventLogRef)),true);
  const transport=slice.find(e=>e.kind==='actor_transport_binding_admitted'),observed=slice.find(e=>e.kind==='actor_result_artifact_observed');
  assert.ok(transport);await record('native-assembly.json',transport.payload.instructionAssembly);
  for(const [name,path] of Object.entries(transport.payload.paths))if(typeof path==='string') {
    try {await record('native-files/'+name+'-'+basename(path),await readFile(path),true);}catch(error){if(error.code!=='ENOENT')throw error;await record('native-files/'+name+'-absent.json',{path,absent:true});}
  }
  assert.equal(receipt.ownerOutput.outcomeKind,'result');assert.equal(receipt.ownerOutput.value.disposition,'completed');assert.ok(observed);
  assert.equal(slice.some(e=>e.kind==='actor_process_termination_unconfirmed'),false,'unconfirmed physical completion stops dependent reads');
  const nativeRows=(await readFile(transport.payload.paths.stdoutPath??transport.payload.paths.stdout,'utf8')).trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
  const models=[...new Set(nativeRows.flatMap(r=>[r.model,r.message?.model,...Object.keys(r.modelUsage??{})]).filter(Boolean))];
  await record('provider-observation.json',{models,promptBytes:Buffer.byteLength(transport.payload.instructionAssembly.request.prompt),invocationStarts:slice.filter(e=>e.kind==='actor_invocation_started').length});
  assert.ok(models.length>0&&models.every(m=>m==='claude-opus-5-5'));
  const validated=abg.selectValidatedRuntimeEventPrefix(events),basis=abg.rehydrateExecutionBasisAtPrefix(validated,transport.basisId);
  const args=[validated,basis.invocationAdmissionRef,publication,basis.programRef,transport.graphFunctionRef,ref('node','select'),'selector'];
  const roleBefore=roleOwner.projectRunEnvironmentRoleEvidenceAtPrefix(...args);await record('role-before.json',roleBefore);
  assert.ok(roleBefore&&roleBefore!==false);
  const sections=Object.fromEntries(transport.payload.instructionAssembly.request.prompt.split('\n\n').map(section=>{
    const newline=section.indexOf('\n');assert.ok(section.startsWith('## '));return [section.slice(3,newline),JSON.parse(section.slice(newline+1))];}));
  assert.deepEqual(sections.role.sourceContent,roleBefore.sourceContent);
  assert.deepEqual(sections.role.frameRefs,roleBefore.frameRefs);assert.deepEqual(sections.role.policy,roleBefore.policy);
  assert.deepEqual(sections.task.observations,NATIVE_TASK.observations);assert.deepEqual(sections.task.childInput,NATIVE_TASK.childInput);
  assert.equal(sections.task.task,NATIVE_TASK.task);assert.deepEqual(sections.evidence.declaredAccess,[]);
  assert.deepEqual(roleBefore.sourceContent.map(x=>[x.startByte,x.endByte,x.spanDigest]),[
    [55240,55942,'sha256:f570de4d76c017e873f390926698a04c9704c443e602092c4c13985b5eb4cd80'],
    [64650,65910,'sha256:20ec39085c7dbe19a1b7a06f00d8dcadf7b82e4cb9c163be282e7a3a53b6a68e']]);
  for(const source of roleBefore.sourceContent)assert.equal('sha256:'+sha(Buffer.from(source.text)),source.spanDigest);
  await record('actual-prompt-correspondence.json',{sections,role:roleBefore,input:NATIVE_TASK,classification:'actual supplied context correspondence; semantic oracle remains separate'});
  const targets=['A','B'].map(n=>environment.catalogView.entries.find(e=>e.definitionRef===ref('graph-function',n))).map(e=>({graphFunctionRef:e.definitionRef,definitionDigest:e.definitionDigest}));
  const rawAnswer=JSON.parse(observed.payload.finalOutput),choice=slice.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='registered_graph_choice');
  assert.ok(choice);assert.deepEqual(choice.payload.value,product.materializeNativeRegisteredChoice(NATIVE_TASK,targets,rawAnswer));
  assert.equal(rawAnswer.graphFunctionRef,NATIVE_EXPECTED.graphFunction,'wrong native choice stops this lane');
  assert.deepEqual(receipt.ownerOutput.value.terminalResult.value,NATIVE_EXPECTED.output);
  await nativeAttributionChecks({environment,publication,root,transport,choice,slice,handoff,input:NATIVE_TASK,targets});
  // Only this new mirror becomes unavailable; preserved installed STDO is never changed.
  await rename(selected.roots.sourceMirror,selected.roots.unavailableMirror);
  await record('source-unavailable.json',{before:selected.roots.sourceMirror,retainedAt:selected.roots.unavailableMirror,manifest:STDO3_SOURCE.manifestDigest});
  const coldPrefix=abg.selectValidatedRuntimeEventPrefix(storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix));
  const roleAfter=roleOwner.projectRunEnvironmentRoleEvidenceAtPrefix(coldPrefix,...args.slice(1));await record('role-after.json',roleAfter);
  const reads=await freshReads(environment,receipt,selected.runId+'-source-unavailable');
  const oracle=nativeOracle({receipt,reads,rawAnswer,roleBefore,roleAfter,provider:configuration.provider,transport:transport.payload,observation:observed.payload,
    nativeStarts:slice.filter(e=>e.kind==='actor_invocation_started').length,graphCalls:slice.filter(e=>e.kind==='graph_call_opened').map(e=>e.graphFunctionRef)});
  // New unavailable-source invocation gets a refusal; no rebuilding the mirror or retry.
  const next=await helpers.constructInstalledStartCall({environment,publicApi,eventResource:resource(),input:structuredClone(NATIVE_TASK),identity:selected.runId+'-unavailable',runEnvironmentResourceFactory:selectedEnvironment.resources});
  await record('unavailable-call.json',next.call);
  const unavailable=await helpers.runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:selected.runId+'-unavailable',acquisition:{kind:'reopen',closeHandoff:handoff},call:next.call,expectedExitCode:null,environment:actorEnvironment});
  await record('unavailable-outcome.json',unavailable);
  assert.equal(unavailable.output.receipt.ownerOutput.outcomeKind,'refusal');
  assert.ok(unavailable.output.receipt.ownerOutput.value.issuePaths.some(x=>x.includes('access_unavailable')));
  const actualFinal=unavailable.output.receipt.resources.eventResource.closeHandoff;
  assert.equal(storeOwner.readRuntimeEventsAtDurablePrefix(actualFinal.prefix).filter(e=>e.kind==='actor_invocation_started').length,1);
  await record('final-handoff.json',actualFinal);
  return {oracle,closedRunHandoff:handoff,closeHandoff:actualFinal,nativeCalls:1};
}

async function nativeAttributionChecks({environment,publication,root,transport,choice,slice,handoff,input,targets}) {
  const {abg,gtl}=environment,installedRoot=environment.installedRoot;
  const store=await owner(installedRoot,'abg/event_store'),calls=await owner(installedRoot,'abg/c_call'),cursors=await owner(installedRoot,'abg/traversal_cursor'),assembly=await owner(installedRoot,'abg/instruction_assembly');
  const close=slice.find(e=>e.kind==='actor_invocation_closed');assert.ok(close);
  const predecessorPrefix=store.durableRuntimeEventPrefixThroughEvent(handoff.prefix,close.eventId);
  const prefix=abg.selectValidatedRuntimeEventPrefix(store.readRuntimeEventsAtDurablePrefix(predecessorPrefix));
  const executionBasis=abg.rehydrateExecutionBasisAtPrefix(prefix,transport.basisId);
  const graph=gtl.materializeGraph(root,{invocationAdmissionRef:executionBasis.invocationAdmissionRef,admittedInputRef:executionBasis.rawInputAdmissionRef,admittedInputDigest:executionBasis.rawInputDigest,admittedInput:executionBasis.rawInputValue});
  const entered=slice.find(e=>e.kind==='traversal_cursor_entered'&&e.basisId===transport.basisId);assert.ok(entered);
  const cursor=cursors.constructTraversalCursorCandidate({programRef:executionBasis.programRef,executionBasisRef:executionBasis.basisRef,traversalScopeRef:entered.payload.traversalScopeRef,
    runId:transport.runId,graphCallId:transport.graphCallId,frameId:transport.frameId,graphRef:graph.materializationRef,inputRef:executionBasis.rawInputAdmissionRef,inputDigest:executionBasis.rawInputDigest,
    currentNodeRef:'node://registered-selection/select@5',position:'at_term',termPath:gtl.rootCSourcePath('node://registered-selection/select@5'),taskOrdinal:null,attempt:1,retryPath:[]});
  const cCall=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,transport.payload.cCallRef);
  const basis={publication,graph,graphFunction:root,declarationGraphFunctions:publication.graphFunctions,executionBasis,cCall,cursor,predecessorPrefix};
  assert.equal(assembly.registeredSelectionInstructionResultMatches(basis,input,choice.payload.value),true);
  const changed=structuredClone(choice.payload.value);changed.graphFunctionRef=targets[1].graphFunctionRef;changed.definitionDigest=targets[1].definitionDigest;
  assert.equal(assembly.registeredSelectionInstructionResultMatches(basis,input,changed),false);
  const changedInput=structuredClone(choice.payload.value);changedInput.input.value.record.status='changed';
  assert.equal(assembly.registeredSelectionInstructionResultMatches(basis,input,changedInput),false);
  const stale=structuredClone(publication.graphFunctions);stale[1].declarations['abg.functional_purpose']='changed';
  const staleResult=assembly.evaluateRegisteredSelectionInstructionAssembly({...basis,declarationGraphFunctions:stale},input);
  assert.equal(staleResult.kind,'native_instruction_assembly_refusal');
  await record('native-attribution.json',{scope:'controlled installed-owner checks against actual native basis; no extra semantic call',changedChoice:false,changedInput:false,staleTarget:staleResult});
}

async function footprint(root) {
  let files=0,bytes=0,symlinks=0;
  async function visit(path){for(const item of await readdir(path,{withFileTypes:true})){const p=join(path,item.name);if(item.isDirectory())await visit(p);else if(item.isSymbolicLink())symlinks++;else if(item.isFile()){files++;bytes+=(await lstat(p)).size;}}}
  await visit(root);const du=await exec('/usr/bin/du',['-sk',root],{env:runEnvironment});
  return {root,files,logicalBytes:bytes,symlinks,allocatedKiB:Number(du.stdout.split(/\s/u)[0]),scope:'owned root at retained exit; filesystem allocation can overlap on copy-on-write volumes'};
}
async function main() {
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=='--configuration'||args[2]!=='--lane')throw new Error('Usage: node run-installed.mjs --configuration ABSOLUTE_CONFIG --lane '+lanes.join('|'));
  lane=args[3];const acquired=await preflight(resolve(args[1]),lane);configuration=acquired.c;const selected=acquired.selected;
  await newRoot(selected.roots.evidence);evidence=selected.roots.evidence;
  await record('activation-preconditions.json',{...acquired,method:'exact frozen configuration, runner/oracle and grant checked before runtime effects',status:'preconditions-verified'});
  await newRoot(selected.roots.scratchParent);
  runEnvironment={...configuration.environment,TMPDIR:selected.roots.scratchParent};
  await record('effective-environment.json',runEnvironment);
  for(const key of Object.keys(process.env))delete process.env[key];Object.assign(process.env,runEnvironment);
  // Existing support requires these explicit bindings. It must never pack a fallback stage.
  process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH=configuration.subject.archive.path;
  process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST=selected.roots.host;
  process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256=configuration.subject.archive.sha256;
  const bootstrapRoot=await measure('bootstrap-install',()=>bootstrap(selected));
  const outcome=await measure('whole-lane',()=>lane==='public-preparation'?p1(selected,bootstrapRoot):lane==='partial-install'?p2(selected,bootstrapRoot):lane==='declared-execution'?p3(selected):p4(selected));
  const footprints=[];for(const path of Object.values(selected.roots)){try{await access(path);footprints.push(await footprint(path));}catch(error){if(error.code!=='ENOENT')throw error;footprints.push({root:path,present:false});}}
  await record('measurements.json',{measures,commands,footprints,archiveBytes:(await lstat(configuration.subject.archive.path)).size,
    overhead:'hash/inventory checks, evidence writes and footprint walks measured in parent whole-process scope; no diagnostic instrumentation injected',
    unobserved:['internal read/hash/encode/write byte counters','RuntimeHistorySelection body/selector/suffix/cause counters not exposed by selected caller','child CPU and peak memory for helper-internal subprocesses','native-provider token cost unless reported by retained transcript','OS-wide allocation peaks'],
    restrictions:'No speedup or heap-limit claim; sampled memory is not a peak; P4 is a capability witness, not a baseline timing ratio.'});
  await record('result.json',{status:'satisfied',lane,subjectId:configuration.subject.id,configurationSha256:acquired.configurationSha256,...outcome,
    claims:'bounded lane predicates only; required omitted measurements and P5 obligations remain separate; no L5 or release acceptance',retainedCleanupHooks:retainedCleanup.length});
  process.stdout.write(JSON.stringify({status:'satisfied',lane,evidence})+'\n');
}
try {await main();}catch(error) {
  const retainedRoots=[];
  for(const path of Object.values(configuration?.lanes?.[lane]?.roots??{})) {
    try{const stat=await lstat(path);retainedRoots.push({path,present:true,nodeKind:stat.isDirectory()?'directory':stat.isSymbolicLink()?'symlink':'file',
      immediateEntries:stat.isDirectory()?(await readdir(path)).sort():null});}
    catch(observationError){retainedRoots.push({path,present:observationError.code==='ENOENT'?false:null,error:String(observationError)});}
  }
  const failure={status:'stopped',lane,subjectId:configuration?.subject.id??null,error:{name:error.name,message:error.message,stack:error.stack,
    code:error.code??null,stage:error.stage??null,observation:error.observation??null},retainedRoots,retention:'No retry, teardown, rollback, resource repair or migration performed; inspect all allocated physical roots and actual receipt handoffs.',measures,commands};
  if(evidence){try{await record('failure.json',failure);}catch(writeError){process.stderr.write('failure record unavailable: '+String(writeError)+'\n');}}
  process.stderr.write(JSON.stringify(failure)+'\n');process.exitCode=1;
}
