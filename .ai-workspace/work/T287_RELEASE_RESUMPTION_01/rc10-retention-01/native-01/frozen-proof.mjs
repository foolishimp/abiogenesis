// RC10 adaptation of pinned RC9 focused-proof-003: same frozen build and JSONL evidence owners.
// Stage/focused author modes and separately admitted frozen unit mode. Preparation is not admission.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {cp,mkdir,readFile,writeFile,lstat,chmod,statfs,readdir,readlink,realpath} from 'node:fs/promises';
import {join,dirname,relative,isAbsolute,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');

// UNIT_REPORTER_PARSER_START -- same summary/end contract as close-proof.mjs.
function parseUnitReporter(bytes,maxBytes){
  let rows=[],parseFailure=null;
  try{
    assert(bytes!==null,'structured reporter missing');assert(bytes.length<=maxBytes,'structured reporter output bound exceeded');
    rows=bytes.toString('utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
  }catch(error){parseFailure=String(error);}
  const summary=rows.filter(row=>row.type==='summary'&&row.file===null).at(-1)??null;
  const skips=rows.filter(row=>row.type==='case'&&(row.skip||row.todo));
  const complete=!parseFailure&&rows[0]?.type==='begin'&&summary!==null&&rows.at(-1)?.type==='end';
  if(!complete&&!parseFailure)parseFailure='structured reporter incomplete: begin/global summary/end required';
  return {rows,summary,counts:summary?.counts??null,skips,complete,parseFailure};
}
// UNIT_REPORTER_PARSER_END

const [bindingPath,bindingSha,mode,stageName]=process.argv.slice(2);
assert(bindingPath&&bindingSha&&['stage','focused','unit'].includes(mode),'usage: node frozen-proof.mjs ADMITTED_BINDING SHA stage | ADMITTED_BINDING SHA unit stage-01');
const raw=await readFile(bindingPath);assert.equal(sha(raw),bindingSha);
const b=JSON.parse(raw);assert(['PREPARED_RC10_FROZEN_PROOF','ROOT_ADMITTED_RC10_FROZEN_PROOF'].includes(b.status),'unknown proof control status');
assert(b.allowedModes.includes(mode),'this proof mode has no admitted grant');
assert.equal(b.maxStages,1);assert.equal(b.maxProofInvocations,1);assert.equal(b.stageTimeoutMs,600000);assert.equal(b.unitTimeoutMs,900000);
assert.equal(b.proofRoot,"/private/tmp/abg-rc10-retention-20261109/qualification-scratch/rc10-retention-01/proof-01/frozen-proof");
const checked=async pin=>{assert(pin&&typeof pin.path==='string'&&/^[a-f0-9]{64}$/.test(pin.sha256),'unresolved pin');const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);return bytes;};
assert(typeof b.nativeStartedReceiptPath==='string'&&isAbsolute(b.nativeStartedReceiptPath),'exact native STARTED route required');
const startedBytes=await readFile(b.nativeStartedReceiptPath);assert(startedBytes.length>0,'native dispatch has no STARTED evidence');
const nativeStartedReceipt={path:b.nativeStartedReceiptPath,bytes:startedBytes.length,sha256:sha(startedBytes)};
const started=JSON.parse(startedBytes),nativeAdmission=JSON.parse(await checked(started.admission));
assert.equal(nativeAdmission.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
assert.equal(nativeAdmission.proofBindingSha256,b.authorProofBindingSha256??bindingSha,'actual native admission must name the immutable author-proof binding');
if(mode==='unit'){
  assert(b.executionAdmission&&b.frozenStage,'separate frozen unit admission and actual frozen-stage pin required');
  const execution=JSON.parse(await checked(b.executionAdmission));assert.equal(execution.status,'ROOT_ADMITTED_RC10_FROZEN_PROOF');
  assert.equal(execution.proofBindingSha256,bindingSha);await checked(b.frozenStage);
}
for(const input of b.readOnlyInputPins??[])await checked(input);

await checked(b.node);assert.equal(await realpath(process.execPath),b.node.path);await checked(b.npmCli);
for(const p of Object.values(b.sourceHelpers))await checked(p);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(b.sourceHelpers['runner.mjs'].path));
const inventory=JSON.parse(await checked(b.sourceInventory));assert.equal(inventory.sourceCommit,b.sourceCommit);
assert.equal(execFileSync('/usr/bin/git',['-C',b.sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),b.sourceCommit);
assert(Array.isArray(b.allowedChangedPaths)&&b.allowedChangedPaths.length,'exact native write territory missing');
const safe=p=>{assert(typeof p==='string'&&!isAbsolute(p)&&!p.split('/').includes('..')&&!p.includes('\0'));return p;};
const allowed=new Set(b.allowedChangedPaths.map(safe)),extra=b.optionalNewSourceFiles.map(safe);
const exists=async p=>{try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const dep=JSON.parse(await checked(b.dependencyInventory)),seed=JSON.parse(await checked(b.contractSeedInventory));
async function verifyRows(root,rows){for(const r of rows){const p=join(root,safe(r.path)),s=await lstat(p);if(r.kind==='symlink'){assert(s.isSymbolicLink());assert.equal(await readlink(p),r.target);const real=await realpath(p),rel=relative(await realpath(root),real);assert(rel&&!rel.startsWith('..')&&!isAbsolute(rel),'dependency link escapes');}else{assert(s.isFile());const v=await readFile(p);assert.equal(v.length,r.bytes);assert.equal(sha(v),r.sha256,'input changed '+p);}}}
async function size(root){let n=0;for(const name of await readdir(root)){const p=join(root,name),s=await lstat(p);n+=s.isDirectory()?await size(p):s.size;}return n;}
async function budget(){const disk=await statfs(dirname(b.proofRoot));assert(disk.bavail*disk.bsize>=b.reserveBytes,'free-space reserve');if(await exists(b.proofRoot))assert(await size(b.proofRoot)<=b.maxOwnedBytes,'owned-byte stop');}
await budget();
const env={...b.environment};assert(!Object.keys(env).some(k=>/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/.test(k)),'proof must not receive provider environment');
let output=null;
try{
  if(mode==='stage'){
    assert(!await exists(b.proofRoot),'preserve prior proof allocation; Root re-entry required');
    await verifyRows(dep.root,dep.rows);await verifyRows(seed.root,seed.rows);
    await mkdir(b.proofRoot);await mkdir(join(b.proofRoot,'tmp'));
    for(const name of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(b.proofRoot,name),'',{flag:'wx'});
    output=join(b.proofRoot,'stage-01');await mkdir(output);
    const source=join(output,'source'),work=join(output,'work'),rows=[];
    const previous=new Map(inventory.rows.map(r=>[r.path,r]));
    for(const path of [...new Set([...previous.keys(),...extra])].sort()){
      safe(path);const from=join(b.sourceRoot,path);assert((await lstat(from)).isFile());const bytes=await readFile(from),row={path,bytes:bytes.length,sha256:sha(bytes)};
      if(previous.has(path)&&!allowed.has(path))assert.deepEqual(row,previous.get(path),'ungranted change '+path);
      if(!previous.has(path))assert(extra.includes(path)&&allowed.has(path),'ungranted new source '+path);
      const to=join(source,path);await mkdir(dirname(to),{recursive:true});await writeFile(to,bytes,{flag:'wx'});await chmod(to,(await lstat(from)).mode&0o777);rows.push(row);
    }
    const sourceDigest=sha(Buffer.from(JSON.stringify(rows)));
    await exclusiveRecord(output,'source-freeze.json',{status:'FROZEN_BEFORE_BUILD',source,sourceCommit:b.sourceCommit,sourceDigest,rows,binding:{path:resolve(bindingPath),sha256:bindingSha},nativeStartedReceipt});
    console.log(JSON.stringify({status:'FROZEN_BEFORE_BUILD',stage:'stage-01',sourceDigest,freeze:join(output,'source-freeze.json')}));
    await cp(source,work,{recursive:true});const tenant=join(work,b.tenantRelative);
    await cp(dep.root,join(tenant,'node_modules'),{recursive:true,verbatimSymlinks:true});await verifyRows(join(tenant,'node_modules'),dep.rows);
    // Source wins: immutable pinned RC9 provides only absent generator seed assets.
    const seeded=[];for(const r of seed.rows){assert.equal(r.kind,'file');const dest=join(tenant,'contracts',r.path);if(!await exists(dest)){await mkdir(dirname(dest),{recursive:true});await cp(join(seed.root,r.path),dest);seeded.push(r);}}
    await exclusiveRecord(output,'BUILD_INPUTS.json',{dependencyInventory:b.dependencyInventory,contractSeedInventory:b.contractSeedInventory,seededContracts:seeded,sourceWins:true,productRuntimeImportsFromDependencyCheckout:false});
    const command=commandRecorder(output,{environment:env,timeoutMs:b.stageTimeoutMs,maxOutputBytes:b.maxOutputBytes});const results=[],began=Date.now();
    for(const [id,args] of [['compile',['node_modules/typescript/bin/tsc','-p','tsconfig.json']],['generate',['scripts/generate-product-manifest.mjs']],['imports',['scripts/check-import-direction.mjs']],['lifecycle',['scripts/check-lifecycle-boundary.mjs']],['calculus',['scripts/check-calculus-boundary.mjs']]]){
      const remaining=b.stageTimeoutMs-(Date.now()-began);assert(remaining>0,'stage allocation exhausted');
      const r=await command(id,process.execPath,args,{cwd:tenant,timeoutMs:remaining});results.push({id,exitCode:r.exitCode,wallMs:r.wallMs,timedOut:r.timedOut});
      assert(r.exitCode===0&&!r.signal&&!r.failure&&!r.timedOut&&!r.truncated,id+' failed or incomplete');await budget();
    }
    await exclusiveRecord(output,'RESULT.json',{status:'BUILT',stage:'stage-01',sourceDigest,tenant,results,bindingSha256:bindingSha});
  }else{
    assert.equal(stageName,'stage-01');assert(!await exists(join(b.proofRoot,'HALT.json')),'failed predecessor; Root re-entry');
    const stage=JSON.parse(await readFile(join(b.proofRoot,stageName,'RESULT.json')));assert.equal(stage.status,'BUILT');assert.equal(stage.bindingSha256,b.stageBindingSha256??bindingSha);
    output=join(b.proofRoot,mode==='focused'?'focused-01':'unit-01');assert(!await exists(output),'one unit allocation only');await mkdir(output);
    const pkg=JSON.parse(await readFile(join(stage.tenant,'package.json'))),script=mode==='focused'
      ?['node','--experimental-vm-modules','--test','--test-concurrency=1',...b.focusedFiles].join(' '):pkg.scripts[b.unitScriptName],tokens=script.trim().split(/\s+/u);
    if(mode==='unit')assert.equal(script,b.expectedUnitScript,'unit source script identity changed');
    const requiredTests=mode==='focused'?b.focusedFiles:b.requiredUnitTests;
    assert.deepEqual(tokens.slice(0,4),['node','--experimental-vm-modules','--test','--test-concurrency=1']);
    assert(tokens.slice(4).every(p=>/^test_env\/tests\/[a-zA-Z0-9_.-]+\.test\.mjs$/u.test(p)),'normal finite unfiltered unit lane required');
    for(const f of requiredTests)assert(tokens.includes(f),'required owner regression missing from unit lane: '+f);
    const reporterPath=join(stage.tenant,b.unitReporter.relativePath),reporterPin={...b.unitReporter,path:reporterPath};delete reporterPin.relativePath;await checked(reporterPin);
    const events=join(output,'events.jsonl');assert(!await exists(events),'preserve prior structured output');
    const reporterOptions=['--test-reporter=spec','--test-reporter-destination=stdout','--test-reporter='+reporterPath,'--test-reporter-destination='+events];
    assert(reporterOptions.every(v=>!/[\s"'\\]/u.test(v)),'reporter option requires explicit quoting support');
    const unitEnvironment={...env,NODE_OPTIONS:[env.NODE_OPTIONS,...reporterOptions].join(' ')};
    await exclusiveRecord(output,'REPORTER_CONFIGURATION.json',{unitScript:script,unitScriptSha256:sha(Buffer.from(script)),executable:process.execPath,args:mode==='focused'?tokens.slice(1):[b.npmCli.path,'run',b.unitScriptName],cwd:stage.tenant,nodeOptions:unitEnvironment.NODE_OPTIONS,reporter:reporterPin,structuredDestination:events,stdoutReporter:'spec',population:tokens.slice(4),scope:'Unit subprocess only; source script/population/order/concurrency unchanged. Reporter configuration is explicit.'});
    const selectedArgs=mode==='focused'?tokens.slice(1):[b.npmCli.path,'run',b.unitScriptName];
    const r=await commandRecorder(output,{environment:unitEnvironment,timeoutMs:mode==='focused'?b.focusedTimeoutMs:b.unitTimeoutMs,maxOutputBytes:b.maxOutputBytes})(mode,process.execPath,selectedArgs,{cwd:stage.tenant});
    let reporterBytes=null,reporterReadFailure=null;try{const st=await lstat(events);assert(st.size<=b.maxOutputBytes,'structured reporter output bound exceeded');reporterBytes=await readFile(events);}catch(error){reporterReadFailure=String(error);}
    const evidence=parseUnitReporter(reporterBytes,b.maxOutputBytes),counts=evidence.counts;
    const observedFiles=[...new Set(evidence.rows.filter(row=>row.type==='case').map(row=>row.file).filter(Boolean))];
    const missingFiles=tokens.slice(4).filter(file=>!observedFiles.includes(file));
    const fileCompletion=tokens.slice(4).map(file=>{const summaries=evidence.rows.filter(row=>row.type==='summary'&&row.file===file);return {file,summaries:summaries.length,complete:summaries.length===1&&summaries[0].success===true};});
    const requiredCases=requiredTests.map(file=>({file,passed:evidence.rows.some(row=>row.type==='case'&&row.file===file&&row.passed&&!row.skip&&!row.todo)}));
    let resourceFailure=null;try{await budget();}catch(error){resourceFailure=String(error);}
    const passed=r.exitCode===0&&!r.signal&&!r.failure&&!r.timedOut&&!r.truncated&&!reporterReadFailure&&evidence.complete&&evidence.summary.success===true&&counts.passed>0&&counts.failed===0&&counts.cancelled===0&&counts.todo===0&&missingFiles.length===0&&fileCompletion.every(row=>row.complete)&&requiredCases.every(row=>row.passed)&&!resourceFailure;
    await exclusiveRecord(output,'RESULT.json',{status:passed?'PASSED':evidence.complete?'FAILED':'INCOMPLETE',stage:stageName,sourceDigest:stage.sourceDigest,bindingSha256:bindingSha,unitScript:script,unitScriptSha256:sha(Buffer.from(script)),requiredUnitTests:requiredTests,counts,skips:evidence.skips,reporterComplete:evidence.complete,parseFailure:reporterReadFailure??evidence.parseFailure,summarySuccess:evidence.summary?.success??null,observedFiles,missingFiles,fileCompletion,requiredCases,command:{exitCode:r.exitCode,signal:r.signal,failure:r.failure,timedOut:r.timedOut,truncated:r.truncated,wallMs:r.wallMs,receipt:'commands/'+mode+'.result.json'},reporter:reporterBytes===null?null:{path:events,bytes:reporterBytes.length,sha256:sha(reporterBytes)},resourceFailure,standing:'Actual command and reporter observations recorded before success assertion; skips are not passes. Mechanical source/component proof only.'});
    assert(passed,'unit lane failed or incomplete; actual command/reporter evidence retained in RESULT.json');

  }
}catch(error){if(output&&!await exists(join(output,'RESULT.json')))await exclusiveRecord(output,'RESULT.json',{status:'FAILED',error:String(error?.stack??error)});if(await exists(b.proofRoot)&&!await exists(join(b.proofRoot,'HALT.json')))await exclusiveRecord(b.proofRoot,'HALT.json',{output,error:String(error?.message??error),standing:'No automatic repair/retry; return Root'});throw error;}
