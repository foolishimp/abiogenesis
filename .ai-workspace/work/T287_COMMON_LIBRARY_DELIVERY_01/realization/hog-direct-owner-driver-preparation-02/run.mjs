#!/usr/bin/env node
// Preparation only until an exact, separately frozen Executive execution grant exists.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {access,chmod,copyFile,lstat,mkdir,readFile,readdir,readlink,realpath,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {CASES,outcomeOracle,readOracle} from './oracle.mjs';

const exec=promisify(execFile), self=fileURLToPath(import.meta.url);
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const inside=(r,p)=>{const x=relative(r,p);return x===''||(!x.startsWith('..')&&!isAbsolute(x));};
const plain=x=>JSON.parse(JSON.stringify(x)); // callable fields omitted only in evidence copy, never owner inputs
const mode=x=>typeof x==='string'?Number(x):x;
let config, output, active=null, commandNo=0;
const completed=[], cleanupHooks=[];
async function pin(p) {
  assert.ok(p&&isAbsolute(p.path)&&/^[a-f0-9]{64}$/u.test(p.sha256),'exact mandatory file pin');
  const b=await readFile(p.path),s=await lstat(p.path);
  assert.ok(s.isFile());assert.equal(sha(b),p.sha256,p.path);
  if(p.bytes!==undefined)assert.equal(s.size,p.bytes,p.path);
  if(p.mode!==undefined)assert.equal(s.mode&0o777,mode(p.mode),p.path);
  return b;
}
async function inventory(binding) {
  assert.ok(isAbsolute(binding.root));
  const inv=JSON.parse(await pin(binding));assert.ok(inv.files.length>0);
  for(const row of inv.files) {
    const p=resolve(binding.root,row.path);assert.ok(inside(binding.root,p));
    const s=await lstat(p);assert.equal(s.mode&0o777,mode(row.mode),p);
    if(row.type==='symlink') {
      assert.ok(s.isSymbolicLink());assert.equal(await readlink(p),row.target);
      assert.ok(inside(binding.root,await realpath(p)),p+' dependency link containment');
    } else {assert.equal(row.type,'file');assert.ok(s.isFile());assert.equal(s.size,row.bytes,p);assert.equal(sha(await readFile(p)),row.sha256,p);}
  }
  return inv;
}
async function absent(p) {try{await lstat(p);assert.fail('resource already exists: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
async function allocate(p) {await absent(p);await mkdir(p,{recursive:true});assert.equal(await realpath(p),p);}
async function save(name,value,raw=false) {
  const p=join(output,name);assert.ok(inside(output,p));await mkdir(dirname(p),{recursive:true});
  await writeFile(p,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});return p;
}
async function command(label,executable,args,cwd,environment) {
  const wall=performance.now(),cpu=process.cpuUsage();let result;
  try{result={...await exec(executable,args,{cwd,env:environment,maxBuffer:64*1024*1024}),exitCode:0,signal:null};}
  catch(e){result={stdout:e.stdout??'',stderr:e.stderr??'',exitCode:typeof e.code==='number'?e.code:null,signal:e.signal??null,error:String(e)};}
  const receipt={label,executable,args,cwd,environment,wallMs:performance.now()-wall,parentCpuUs:process.cpuUsage(cpu),
    parentResourceUsage:process.resourceUsage(),...result};
  await save(`commands/${++commandNo}-${label}.json`,receipt);
  assert.notEqual(result.exitCode,null,'unconfirmed child exit');assert.equal(result.signal,null,'signalled child');
  return receipt;
}
async function tree(root) {
  const files=[];
  async function visit(p) {for(const e of await readdir(p,{withFileTypes:true})) {
    const f=join(p,e.name),s=await lstat(f),path=relative(root,f);
    if(s.isDirectory())await visit(f);
    else if(s.isSymbolicLink())files.push({path,type:'symlink',mode:s.mode&0o777,target:await readlink(f)});
    else {assert.ok(s.isFile(),'unexpected physical node kind');files.push({path,type:'file',mode:s.mode&0o777,bytes:s.size,sha256:sha(await readFile(f))});}
  }}
  await visit(root);files.sort((a,b)=>a.path.localeCompare(b.path));
  return {root,files,logicalFileBytes:files.reduce((n,x)=>n+(x.bytes??0),0),fileCount:files.length};
}
async function packageAt(root) {
  const expected=JSON.parse(await pin(config.subject.packageInventory));
  const actual=await tree(root);
  assert.deepEqual(actual.files.map(x=>x.path).sort(),expected.files.map(x=>x.path).sort(),'exact package members');
  for(const e of expected.files) {
    const a=actual.files.find(x=>x.path===e.path);assert.equal(a.type,e.type,e.path);assert.equal(a.mode,mode(e.mode),e.path);
    if(e.type==='symlink')assert.equal(a.target,e.target,e.path);
    else {assert.equal(a.sha256,e.sha256,e.path);assert.equal(a.bytes,e.bytes,e.path);}
  }
  assert.equal(sha(await readFile(join(root,'product-toolchain-manifest.json'))),config.subject.manifest.sha256);
  return actual;
}
async function preflight(path) {
  const bytes=await readFile(path),c=JSON.parse(bytes);assert.equal(c.status,'activated');
  assert.equal(c.kind,'t287_hog_ordinary_owner_configuration');assert.equal(c.subject.id,'candidate');
  const grant=await json(c.activationFile);assert.equal(grant.status,'granted');
  assert.equal(grant.kind,'t287_hog_ordinary_owner_effect_grant');
  assert.equal(grant.configurationSha256,sha(bytes));assert.equal(grant.runnerSha256,sha(await readFile(self)));
  assert.equal(grant.oracleSha256,sha(await readFile(new URL('./oracle.mjs',import.meta.url))));
  assert.equal(grant.subjectId,'candidate');assert.equal(grant.maxNativeCalls,0);assert.equal(grant.retryCount,0);assert.equal(grant.cleanup,false);
  assert.deepEqual(grant.cases,CASES.map(x=>x.id));assert.deepEqual(grant.resources,c.resources);
  assert.equal(c.method.manifestSha256,'069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232');assert.deepEqual(c.method.composition,[]);
  assert.ok(isAbsolute(c.subject.stageTenant));assert.equal(await realpath(c.subject.stageTenant),c.subject.stageTenant);
  assert.ok(!/\/combined-final-01\/|\/proof\/baseline\/|\/Users\/jim\/src\/apps\/abiogenesis\/build_tenants\//u.test(c.subject.stageTenant),'new final isolated subject required');
  for(const p of [c.subject.freeze,c.subject.candidateRecord,c.subject.archive,c.subject.manifest,c.subject.packageInventory,c.toolchains.node,c.toolchains.npm,...c.prerequisites])await pin(p);
  const candidate=await json(c.subject.candidateRecord.path),manifest=await json(c.subject.manifest.path);
  assert.equal(candidate.status,'ready_for_separately_granted_L4');
  assert.equal(candidate.archive.sha256,c.subject.archive.sha256);assert.equal(candidate.manifest.sha256,c.subject.manifest.sha256);
  assert.equal(candidate.productContentDigest,c.subject.productContentDigest);assert.equal(manifest.productContentDigest,c.subject.productContentDigest);
  assert.equal(candidate.archiveMembers,(await json(c.subject.packageInventory.path)).files.length);
  assert.equal(process.version,c.toolchains.node.version);assert.equal(await realpath(process.execPath),await realpath(c.toolchains.node.path));
  assert.ok(c.prerequisites.length>0,'Executive-selected exact predecessor proof');
  for(const p of c.prerequisites){const r=await json(p.path);assert.equal(r.status,'satisfied');assert.equal(r.subjectId,'candidate');}
  const roles=c.subject.inventories.map(x=>x.role);
  for(const role of ['source','emitted','dependencies','support'])assert.ok(roles.includes(role),'mandatory final '+role+' inventory');
  for(const x of c.subject.inventories){assert.equal(x.root,c.subject.stageTenant);await inventory(x);}
  const inspected=await json(fileURLToPath(new URL('./inspected-inputs.json',import.meta.url)));
  assert.equal(grant.inspectedInputsSha256,sha(await readFile(new URL('./inspected-inputs.json',import.meta.url))));
  for(const row of inspected.support)await pin({...row,path:join(c.subject.stageTenant,row.tenantRelativePath)});
  for(const row of inspected.owners)await pin({...row,path:join(c.subject.stageTenant,row.tenantRelativePath)});
  await inventory(c.protectedMain);
  assert.ok(isAbsolute(c.resources.parent)&&dirname(c.resources.parent)==='/private/tmp');
  assert.equal(await realpath('/private/tmp'),'/private/tmp');
  await absent(c.resources.parent);
  const paths=[c.resources.evidence,...Object.values(c.resources.cases).flatMap(Object.values)];
  assert.equal(new Set(paths).size,paths.length);
  for(const p of paths){assert.ok(isAbsolute(p)&&resolve(p)===p&&inside(c.resources.parent,p)&&p!==c.resources.parent);await absent(p);}
  for(const a of paths)for(const b of paths)if(a!==b)assert.ok(!inside(a,b),'disjoint resource roots');
  assert.deepEqual(Object.keys(c.resources.cases),CASES.map(x=>x.id));
  assert.deepEqual(grant.npmCacheSeed,c.npmCacheSeed);await inventory(c.npmCacheSeed);
  assert.equal(c.environment.npm_config_offline,'true');assert.equal(c.environment.npm_config_ignore_scripts,'true');
  assert.equal(c.environment.npm_config_audit,'false');assert.equal(c.environment.npm_config_fund,'false');
  assert.equal(c.environment.NODE_OPTIONS,undefined);assert.equal(c.environment.ABG_TS_CLAUDE_COMMAND,undefined);
  assert.equal(c.environment.npm_config_cache,undefined,'case-owned cache assigned explicitly');
  for(const name of ['node','npm']){
    let selected;for(const p of c.environment.PATH.split(':'))try{const f=join(p,name);await access(f);selected=await realpath(f);break;}catch(e){if(e.code!=='ENOENT')throw e;}
    assert.equal(selected,await realpath(c.toolchains[name].path));
  }
  return c;
}
const support=p=>import(pathToFileURL(join(config.subject.stageTenant,p)).href);
const owner=(root,p)=>import(pathToFileURL(join(root,'build/code/src',p+'.js')).href);
async function cli(environment,identity,acquisition,call,env) {
  const path=join(output,identity+'-request.jsonl');
  await writeFile(path,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition,invocation:call})+'\n',{flag:'wx'});
  const result=await command(identity,config.toolchains.node.path,[join(environment.installedRoot,'build/code/src/public/cli.js'),'--jsonl',path],environment.scratch,env);
  assert.equal(result.stderr,'');const lines=result.stdout.trim().split(/\r?\n/u);assert.equal(lines.length,1);
  const transport=JSON.parse(lines[0]);await save(identity+'-transport.json',transport);
  assert.equal(transport.kind,'installed_definition_call_transport_result');
  assert.equal(transport.receipt.kind,'definition_host_receipt');
  assert.equal(result.exitCode,transport.receipt.exitCode,'actual CLI/host receipt exit correspondence');
  return transport.receipt;
}
async function seedCache(root) {
  await allocate(root);const inv=JSON.parse(await pin(config.npmCacheSeed));
  for(const row of inv.files){assert.equal(row.type,'file');assert.ok(row.path.startsWith('_cacache/'),'only declared npm content/index seed');
    const p=join(root,row.path);await mkdir(dirname(p),{recursive:true});await copyFile(join(config.npmCacheSeed.root,row.path),p);await chmod(p,mode(row.mode));}
}
async function runCase(selected) {
  const roots=config.resources.cases[selected.id];active={case:selected.id,roots,phase:'allocate',environment:null};
  output=roots.evidence;await allocate(output);await allocate(roots.host);await allocate(roots.scratchParent);await seedCache(roots.cache);
  const env={...config.environment,TMPDIR:roots.scratchParent,npm_config_cache:roots.cache};
  for(const k of Object.keys(process.env))delete process.env[k];Object.assign(process.env,env);
  await save('effect-scope.json',{roots,env,worksite:'actual setup-owned workspace beneath scratchParent; reserved worksite path not allocated',cleanup:'captured, not invoked'});
  await writeFile(join(roots.host,'package.json'),JSON.stringify({name:'t287-hog-proof-host',version:'1.0.0',private:true,type:'module'})+'\n',{flag:'wx'});
  active.phase='offline-bootstrap';
  const installed=await command('bootstrap',config.toolchains.npm.path,['install','--offline','--ignore-scripts','--no-audit','--no-fund','--bin-links=false',config.subject.archive.path],roots.host,env);
  assert.equal(installed.exitCode,0);
  await save('bootstrap-members.json',await packageAt(join(roots.host,'node_modules/@abiogenesis/typescript-tenant')));
  const {setupInstalledRootCatalog}=await support('test_env/support/root-installed-environment.mjs');
  const {prepareLanguageStructuralFixture}=await support('test_env/support/language-structural-fixture.mjs');
  const fixture=await support('test_env/fixtures/language-structural/program.mjs');const ids=fixture[selected.selector];assert.ok(ids);
  const calls=await support('test_env/support/registered-graph-selection.mjs');
  active.phase='installed-catalog-setup';
  const context={after:fn=>{cleanupHooks.push({case:selected.id,fn});}};
  const e=await setupInstalledRootCatalog(context,config.subject.stageTenant,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    frozenArtifact:{artifactPath:config.subject.archive.path,artifactSha256:config.subject.archive.sha256,installHost:roots.host},
    programRef:ids.programRef,graphFunctionRef:ids.graphFunctionRef,
    prepareAdditionalProducts:async basis=>[await prepareLanguageStructuralFixture(basis)]});
  active.environment=e;assert.ok(inside(roots.scratchParent,e.scratch));
  await save('installed-members.json',await packageAt(e.installedRoot));
  const pub=e.additionalPublications[0],program=pub.programs.find(x=>x.programRef===ids.programRef);assert.ok(program);
  e.catalogView=e.product.narrowGraphFunctionCatalog(e.catalog,program.callableMembership);assert.equal(e.catalogView.kind,'graph_function_catalog_view');
  await save('setup-owner-carriers.json',plain(Object.fromEntries(['artifactPath','artifactPaths','scratch','consumerRoot','installedRoot','installedRoots',
    'verified','verifiedProducts','installCandidate','installCandidates','admittedInstalls','admittedInstallResults','lock','productSet','workspaceAuthority',
    'bindingCandidate','workspaceBinding','publication','publications','publicationValidation','selectedProgramRef','programValidation','programValidations',
    'catalog','catalogView'].map(k=>[k,e[k]]))));
  await save('fixture-physical.json',await tree(e.additionalProducts[0].sourceRoot));
  await save('fixture-installed.json',await tree(e.additionalInstallCandidates[0].installedRoot));
  const publicApi=await owner(e.installedRoot,'public/index'),contracts=await owner(e.installedRoot,'abg/project_read_operation_contracts');
  const setupHandoff=e.store.projectReopenAuthorityAndClose();await save('setup-close-handoff.json',setupHandoff);
  const setupEvents=e.abg.readRuntimeEventsAtDurablePrefix(setupHandoff.prefix);
  const setupRaw=await readFile(new URL(setupHandoff.prefix.eventLogRef));
  assert.equal(setupRaw.length,setupHandoff.prefix.prefixLength);
  assert.equal('sha256:'+sha(setupRaw),setupHandoff.prefix.prefixDigest);
  await save('setup-events.jsonl',setupRaw,true);
  const setupLogicalBoundary={prefix:setupHandoff.prefix,eventCount:setupEvents.length,
    lastEventId:setupEvents.at(-1)?.eventId??null,lastAdmissionOrdinal:setupEvents.at(-1)?.admissionOrdinal??null};
  await save('setup-logical-boundary.json',setupLogicalBoundary);
  const resource=h=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h,handoffDigest:e.product.sha256Canonical(h)});
  active.phase='start-call-preparation';
  const {call,resolution}=await calls.constructInstalledStartCall({environment:e,publicApi,eventResource:resource(setupHandoff),input:selected.input,
    identity:selected.id,programRef:ids.programRef});
  await save('start-call-and-resolution.json',plain({call,resolution}));
  assert.equal(resolution.program.programRef,ids.programRef,'exact authored Program');
  assert.equal(resolution.program.policies['abg.root_mode'],'direct');
  assert.equal(resolution.program.policies['abg.default_start_ref'],ids.startRef);
  assert.equal(resolution.resolvedProgramStart?.kind,'resolved_program_start');
  assert.equal(resolution.resolvedProgramStart.targetKind,'next','owner applies declared default');
  assert.equal(resolution.resolvedProgramStart.start.startRef,ids.startRef);
  assert.equal(resolution.resolvedProgramStart.start.graphFunctionRef,ids.graphFunctionRef);
  assert.ok(resolution.programValidation.executableLeafRows.length>0);
  assert.ok(resolution.programValidation.executableLeafRows.every(x=>x.fibre==='F_D'));
  assert.equal(resolution.programValidation.interactionLeafRows.length,0);
  active.phase='public-start';
  const receipt=await cli(e,selected.id,{kind:'reopen',closeHandoff:setupHandoff},call,env);
  let handoff=receipt.resources?.eventResource?.closeHandoff;assert.ok(handoff);await save('start-close-handoff.json',handoff);
  const raw=await readFile(new URL(handoff.prefix.eventLogRef));await save('events.jsonl',raw,true);
  assert.deepEqual(raw.subarray(0,setupRaw.length),setupRaw,'actual setup physical prefix conserved');
  const events=e.abg.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  assert.deepEqual(events.slice(0,setupLogicalBoundary.eventCount),setupEvents,'decoded setup logical prefix conserved');
  const slice=events.slice(setupLogicalBoundary.eventCount);
  await save('start-events.json',slice);
  await save('event-boundary-correspondence.json',{setup:setupLogicalBoundary,returnedPrefix:handoff.prefix,
    totalLogicalEvents:events.length,startLogicalEvents:slice.length,setupRawBytes:setupRaw.length,
    returnedRawBytes:raw.length,setupPhysicalPrefixConserved:true,setupLogicalPrefixConserved:true,
    decodingOwner:'installed ABG readRuntimeEventsAtDurablePrefix; no proof-owned decoding'});
  const prefixOwner=await owner(e.installedRoot,'abg/event_prefix'),routeOwner=await owner(e.installedRoot,'abg/traversal_route');
  const foldOwner=await owner(e.installedRoot,'abg/graph_application'),fanOwner=await owner(e.installedRoot,'abg/fan_out_projection');
  const prefix=prefixOwner.selectValidatedRuntimeEventPrefix(events);
  const cut=ev=>prefixOwner.validatedRuntimeEventPrefixThroughEvent(prefix,ev.eventId);
  const owners={routes:slice.filter(x=>x.kind==='traversal_route_admitted').map(ev=>routeOwner.projectHistoricalTraversalRouteAtPrefix(prefix,ev.eventId)),
    foldbacks:slice.filter(x=>x.kind==='child_foldback_admitted').map(ev=>foldOwner.projectApplicationChildFoldbackAtPrefix(cut(ev),{runId:ev.runId,foldbackRef:ev.payload.foldbackRef})),
    fanouts:slice.filter(x=>x.kind==='fan_out_completion_admitted').map(ev=>fanOwner.projectExactFanOutCompletion(cut(ev),{mode:'event_canonical',admissionEventRef:ev.eventId}))};
  await save('actual-owner-projections.json',owners);active.phase='outcome-oracle';
  const outcome=outcomeOracle({selected,ids,receipt,events:slice,owners});await save('outcome-oracle.json',outcome);
  const reads=[];
  for(const memberKey of selected.disposition==='completed'?['run_result','run_replay']:['run_replay']) {
    active.phase=memberKey;const before={prefix:handoff.prefix,bytes:await readFile(new URL(handoff.prefix.eventLogRef))};
    const {call:readCall}=calls.constructInstalledRunReadCall({environment:e,publicApi,projectReadContracts:contracts,memberKey,
      selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'},source:receipt.resources.run,eventResource:resource(handoff),identity:selected.id+'-'+memberKey});
    const read=await cli(e,selected.id+'-'+memberKey,{kind:'reopen',closeHandoff:handoff},readCall,env);
    const next=read.resources?.eventResource?.closeHandoff;assert.ok(next);await save(memberKey+'-returned-handoff.json',next);
    const bytes=await readFile(new URL(next.prefix.eventLogRef));
    reads.push(readOracle({selected,startReceipt:receipt,memberKey,readReceipt:read,actualBefore:before,actualAfter:{bytes}}));
    handoff=next; // Only the actual returned authority is used by a later read.
  }
  active.phase='preservation';await packageAt(e.installedRoot);
  const result={status:'satisfied',subjectId:'candidate',case:selected.id,archiveSha256:config.subject.archive.sha256,outcome,reads,closeHandoff:handoff,
    nativeCalls:0,cleanupHooksCaptured:cleanupHooks.filter(x=>x.case===selected.id).length,cleanupHooksInvoked:0};
  await save('result.json',result);await save('retained-physical.json',await tree(roots.scratchParent));
  const du=await command('footprint-du','/usr/bin/du',['-sk',roots.host,roots.scratchParent,roots.evidence,roots.cache],roots.evidence,env);assert.equal(du.exitCode,0);
  completed.push(result);active=null;
}
async function main() {
  assert.equal(process.argv.length,3,'usage: node run.mjs active-configuration.json');
  config=await preflight(resolve(process.argv[2]));output=config.resources.evidence;await allocate(output);
  await save('active-configuration.json',config);await save('preflight.json',{status:'satisfied',nativeCalls:0,importsBeforePreflight:'Node builtins and frozen pure oracle only'});
  for(const selected of CASES)await runCase(selected);
  output=config.resources.evidence;for(const i of config.subject.inventories)await inventory(i);await inventory(config.protectedMain);
  await pin(config.subject.archive);await pin(config.subject.freeze);
  await save('result.json',{status:'satisfied',subjectId:'candidate',archiveSha256:config.subject.archive.sha256,cases:completed,nativeCalls:0,
    cleanupHooksCaptured:cleanupHooks.length,cleanupHooksInvoked:0,measurementScope:'command wall, parent CPU/resourceUsage; no internal phase/byte counters or speed claim'});
}
main().catch(async error=>{
  if(output) {
    try{await save('first-failure.json',{status:'failed',subjectId:config?.subject?.id,phase:active?.phase,case:active?.case,
      error:{name:error.name,message:error.message,stack:error.stack},completedCases:completed,cleanupHooksCaptured:cleanupHooks.length,cleanupHooksInvoked:0,
      action:'stopped; no repair, retry, reopen, close or cleanup attempted'});}catch(recordError){process.stderr.write('failure record error: '+String(recordError)+'\n');}
    if(active?.roots)try{await save('failure-physical.json',await tree(dirname(active.roots.host)));}catch(recordError){process.stderr.write('residue record error: '+String(recordError)+'\n');}
    if(config) {
      const checks=[];
      for(const i of [...config.subject.inventories,config.protectedMain])try{await inventory(i);checks.push({path:i.path,status:'unchanged'});}catch(e){checks.push({path:i.path,status:'mismatch',error:String(e)});}
      try{await save('failure-preservation.json',checks);}catch(e){process.stderr.write('preservation record error: '+String(e)+'\n');}
    }
  }
  process.stderr.write(String(error.stack??error)+'\n');process.exitCode=1;
});
