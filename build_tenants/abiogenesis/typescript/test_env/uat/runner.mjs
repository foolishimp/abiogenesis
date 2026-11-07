import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { constants, createReadStream } from 'node:fs';
import { access, lstat, mkdir, open, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { acquireArchivedScenario, acquireScenario, constructWorkloadInput, digest, fixturePath, inside, loadScenarios, readJson, selectScenarios, snapshotScenario } from './scenarios.mjs';
import { assessmentSelection } from './consumer.mjs';
import { BoundaryFailure, cliTransportJsonl, constructLifecycleCall, installedModules, populateSandbox, publicCaller, requireKind, transportAcquisition, verifyArtifact } from './public-setup.mjs';

const tenantRoot=fileURLToPath(new URL('../..',import.meta.url));
const defaultFixtures=join(tenantRoot,'test_env/fixtures/sandbox-uat');
export async function exclusiveRecord(root,path,value,raw=false) {
  const file=fixturePath(root,path);await mkdir(dirname(file),{recursive:true});
  await writeFile(file,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  return file;
}
export async function readOracleEvents(owner,prefix,record,retainSource) {
  const source=owner.captureDurablePrefixCoordinate(prefix);
  const events=owner.readRuntimeEventsAtDurablePrefix(source);
  await record('runtime-event-prefix.json',source);
  retainSource?.(source);
  return events;
}
export async function eventResourceIdentity(path) {
  const file=await open(path,'r');
  try {
    const before=await file.stat(),namedBefore=await lstat(path),hash=createHash('sha256');
    if(!before.isFile()||!namedBefore.isFile()||before.dev!==namedBefore.dev||before.ino!==namedBefore.ino)throw new TypeError('Event resource identity changed');
    const chunk=Buffer.alloc(64*1024);let byteCount=0;
    for(;;) {
      const {bytesRead}=await file.read(chunk,0,chunk.length,byteCount);
      if(bytesRead===0)break;
      hash.update(chunk.subarray(0,bytesRead));byteCount+=bytesRead;
    }
    const after=await file.stat(),namedAfter=await lstat(path);
    if(before.dev!==after.dev||before.ino!==after.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||
      after.dev!==namedAfter.dev||after.ino!==namedAfter.ino||after.size!==namedAfter.size||after.mtimeMs!==namedAfter.mtimeMs||after.ctimeMs!==namedAfter.ctimeMs||byteCount!==after.size)throw new TypeError('Event resource changed while reading');
    return {device:after.dev,inode:after.ino,byteCount,digest:'sha256:'+hash.digest('hex')};
  }finally {await file.close();}
}
export async function newArchive(root,key) {
  if(!/^[a-z0-9][a-z0-9-]*$/u.test(key))throw new TypeError('Invalid archive scenario identity');
  const runId=new Date().toISOString().replace(/[:.]/gu,'-')+'-'+randomUUID();
  const path=join(root,key,runId);await mkdir(dirname(path),{recursive:true});await mkdir(path);
  return {path,runId};
}
export function commandRecorder(root,{environment={},timeoutMs=300000,maxOutputBytes=16*1024*1024}={}) {
  return async function command(label,executable,args,{cwd=root,environment:override=environment,timeoutMs:timeout=timeoutMs}={}) {
    const started=new Date().toISOString(),startedMs=performance.now();
    const observation={executable,args,cwd,started,environmentKeys:Object.keys(override).sort(),timeoutMs:timeout};
    await exclusiveRecord(root,'commands/'+label+'.request.json',observation);
    let bytes=0,truncated=false,timedOut=false,stdout=[],stderr=[],failure=null;
    const child=spawn(executable,args,{cwd,env:override,stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
    const stop=()=>{try{if(process.platform==='win32')child.kill('SIGTERM');else process.kill(-child.pid,'SIGTERM');}catch{}
      const force=setTimeout(()=>{try{if(process.platform==='win32')child.kill('SIGKILL');else process.kill(-child.pid,'SIGKILL');}catch{}},2000);force.unref();};
    const timer=setTimeout(()=>{timedOut=true;stop();},timeout);
    const collect=target=>chunk=>{bytes+=chunk.length;if(bytes>maxOutputBytes){truncated=true;stop();return;}target.push(chunk);};
    child.stdout.on('data',collect(stdout));child.stderr.on('data',collect(stderr));
    child.on('error',error=>{failure=String(error);});
    const closed=await new Promise(resolveClose=>child.on('close',(exitCode,signal)=>resolveClose({exitCode,signal})));
    clearTimeout(timer);
    const out=Buffer.concat(stdout),err=Buffer.concat(stderr);
    const result={...observation,...closed,wallMs:performance.now()-startedMs,timedOut,truncated,failure,
      stdout:out.toString('utf8'),stderr:err.toString('utf8')};
    // The original stream bytes have custody in their own files; the record
    // references those same bytes. The returned decoded text is a parser view.
    await exclusiveRecord(root,'commands/'+label+'.stdout',out,true);
    await exclusiveRecord(root,'commands/'+label+'.stderr',err,true);
    const retained=(suffix,bytes)=>({path:'commands/'+label+suffix,byteCount:bytes.length,digest:digest(bytes)});
    const {stdout:_out,stderr:_err,...metadata}=result;
    await exclusiveRecord(root,'commands/'+label+'.result.json',{...metadata,stdout:retained('.stdout',out),stderr:retained('.stderr',err)});
    return result;
  };
}
function finite(value,label){if(!Number.isSafeInteger(value)||value<=0)throw new TypeError(label+' must be a finite positive integer');return value;}
export async function configuration(path) {
  path=await realpath(path);const config=await readJson(path),base=dirname(path);
  const absolute=value=>isAbsolute(value)?value:resolve(base,value);
  if(typeof config.sourceCommit!=='string'||config.sourceCommit.trim().length===0)throw new TypeError('Explicit nonempty sourceCommit metadata is required');
  if(typeof config.package?.archivePath!=='string'||!/^sha256:[a-f0-9]{64}$/u.test(config.package.sha256))throw new TypeError('Explicit package archive and SHA-256 are required');
  config.package.archivePath=absolute(config.package.archivePath);
  config.archiveRoot=absolute(config.archiveRoot??join(tenantRoot,'test_env/test_runs/sandbox-uat'));
  if(inside(join(tenantRoot,'build'),config.archiveRoot)||inside(join(tenantRoot,'artifacts'),config.archiveRoot))throw new TypeError('Run archives must survive build/pack cleanup');
  config.fixtureRoot=absolute(config.fixtureRoot??defaultFixtures);
  config.nodePath=absolute(config.nodePath);
  config.recursionBound=finite(config.recursionBound,'recursionBound');
  config.processTimeoutMs=finite(config.processTimeoutMs,'processTimeoutMs');
  if(config.commandTimeoutOverrides!==undefined) {
    if(config.commandTimeoutOverrides===null||typeof config.commandTimeoutOverrides!=='object'||Array.isArray(config.commandTimeoutOverrides))throw new TypeError('Explicit command timeout overrides must be an object');
    for(const [id,value]of Object.entries(config.commandTimeoutOverrides))finite(value,'commandTimeoutOverrides.'+id);
  }
  if(config.resumeEvidence!==undefined)for(const name of ['observation','freeze']) {
    const pin=config.resumeEvidence[name];
    if(typeof pin?.path!=='string'||!/^sha256:[a-f0-9]{64}$/u.test(pin.digest))throw new TypeError('Explicit resume evidence path/digest required for '+name);
    pin.path=absolute(pin.path);
  }
  for(const [name,tool]of Object.entries(config.toolchains??{})) {
    tool.executable=absolute(tool.executable);
    if(!Array.isArray(tool.versionArgs)||tool.versionArgs.some(arg=>typeof arg!=='string'))throw new TypeError('Explicit versionArgs required for '+name);
  }
  if(!config.toolchains?.npm)throw new TypeError('Explicit npm toolchain binding is required');
  if(typeof config.provider?.enabled!=='boolean')throw new TypeError('Provider enabled selection must be explicit');
  if(config.provider.command)config.provider.command=absolute(config.provider.command);
  if(config.provider.enabled) {
    if(config.provider.agent!=='claude'||typeof config.provider.model!=='string'||config.provider.model.length===0)throw new TypeError('Current native lane requires an explicit Claude command/model');
    if(config.provider.maxTurns!==undefined)finite(config.provider.maxTurns,'provider.maxTurns');
    finite(config.provider.inactivityTimeoutMs,'provider.inactivityTimeoutMs');finite(config.provider.absoluteTimeoutMs,'provider.absoluteTimeoutMs');
    if(config.provider.maxBudgetUsd!==undefined&&!(config.provider.maxBudgetUsd>0&&Number.isFinite(config.provider.maxBudgetUsd)))throw new TypeError('Finite positive provider budget required');
  }
  return {...config,configPath:path};
}
function inherited(keys){return Object.fromEntries(keys.filter(key=>typeof key==='string'&&process.env[key]!==undefined).map(key=>[key,process.env[key]]));}
function setupEnvironment(config) {
  return {...inherited(config.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']),...(config.toolchainEnvironment??{})};
}
export function workerEnvironment(config) {
  const provider=config.provider;
  return {...setupEnvironment(config),...inherited(provider.inheritEnvironment??[]),
    ABG_TS_CLAUDE_COMMAND:provider.command,ABG_TS_WORKER_SANDBOX:'agent_default',
    ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(['--model',provider.model,
      ...(provider.maxTurns===undefined?[]:['--max-turns',String(provider.maxTurns)]),
      ...(provider.maxBudgetUsd===undefined?[]:['--max-budget-usd',String(provider.maxBudgetUsd)]),...(provider.appendArgs??[])]),
    ABG_TS_FP_TIMEOUT_MS:String(provider.inactivityTimeoutMs),ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:String(provider.absoluteTimeoutMs),ABG_TS_FP_TERMINATION_GRACE_MS:'5000'};
}

// Caller timing policy changes the effective request, never its acquired bytes
// or semantic command/predicate/report obligations. The checker uses this same
// effective request after authenticating its original acquisition again.
export function applyCommandTimeoutOverrides(request,overrides) {
  if(overrides===undefined)return request;
  const ids=new Set(request.testing.commands.map(command=>command.commandId));
  for(const [id,value]of Object.entries(overrides)) {
    if(!ids.has(id))throw new TypeError('Command timeout override has no declared command: '+id);
    finite(value,'command timeout override');
  }
  const policy='Latest user-authorized execution timing supersedes only historic operational timeout metadata in preserved inputs: '+
    JSON.stringify(overrides)+'. Preserve every original outcome, argv, cwd, environment, report, predicate, XML, depth, mutation and restoration obligation. Root controls the global five-hour execution deadline; drainage does not extend it.';
  return {...request,workOrders:Object.fromEntries(Object.entries(request.workOrders).map(([purpose,order])=>
    [purpose,{...order,instructions:[...order.instructions,policy]}])),testing:{...request.testing,commands:request.testing.commands.map(command=>
    Object.hasOwn(overrides,command.commandId)?{...command,timeoutMs:overrides[command.commandId]}:command)}};
}

async function fileDigest(path) {
  const hash=createHash('sha256');for await(const bytes of createReadStream(path))hash.update(bytes);
  return 'sha256:'+hash.digest('hex');
}

// A file transfer into a new worksite supplies material, not old ABG Results or
// a restored execution. Frozen external receipts select exact retained bytes.
export async function acquireResumeMaterial(config,fromArchive,selected) {
  const from=await realpath(fromArchive),pins=config.resumeEvidence;
  if(!pins)throw new TypeError('Resume requires explicit frozen observation and freeze coordinates');
  const records={};for(const name of ['observation','freeze']) {
    const bytes=await readFile(pins[name].path);
    if(digest(bytes)!==pins[name].digest)throw new TypeError('Resume evidence digest mismatch: '+name);
    records[name]=JSON.parse(bytes.toString('utf8'));
  }
  const observation=records.observation,ledger=records.freeze.ledger;
  if(observation.archive!==from||!Array.isArray(ledger)||new Set(ledger.map(pin=>pin.path)).size!==ledger.length)throw new TypeError('Resume archive or frozen inventory differs');
  const worksite=join(from,'sandbox/worksite');
  const readPinned=async path=>{
    const pin=ledger.find(pin=>pin.path===path),node=await lstat(path);
    if(!pin||!node.isFile()||node.isSymbolicLink()||await realpath(path)!==path)throw new TypeError('Resume material must be a pinned regular file without symlinks: '+path);
    const bytes=await readFile(path);
    if(digest(bytes)!=='sha256:'+pin.sha256||bytes.length!==pin.byteCount)throw new TypeError('Resume material digest mismatch: '+path);
    return {path,digest:'sha256:'+pin.sha256,byteCount:pin.byteCount,bytes};
  };
  const sealed=await readPinned(join(from,'SEALED.json')),seal=JSON.parse(sealed.bytes.toString('utf8'));
  const oldRun=JSON.parse((await readPinned(join(from,'run.json'))).bytes.toString('utf8'));
  const oldWorkload=JSON.parse((await readPinned(join(from,'workload-source.json'))).bytes.toString('utf8'));
  if(seal.retained!==true||seal.archiveRoot!==from||oldRun.scenario.key!==selected.row.key||!isDeepStrictEqual(oldWorkload.request,selected.request))throw new TypeError('Resume must retain the same sealed original workload');
  const originals=[];for(const source of selected.sources) {
    const held=await readPinned(fixturePath(worksite,source.path));
    if(held.digest!==source.digest||held.byteCount!==source.bytes.length)throw new TypeError('Resume original source differs: '+source.path);
    originals.push({path:source.path,digest:source.digest,byteCount:source.bytes.length});
  }
  const allowed=new Set(Object.values(selected.request.workOrders).flatMap(order=>order.writeRoots??[]));
  const protectedPaths=new Set(originals.map(source=>source.path)),inventory=observation.retainedAuthorFiles;
  if(!Array.isArray(inventory)||new Set(inventory.map(item=>item.path)).size!==inventory.length)throw new TypeError('Resume author inventory is invalid');
  const authorFiles=[];for(const item of inventory) {
    if(protectedPaths.has(item.path)||!allowed.has(item.path))throw new TypeError('Resume author path is outside its original grant: '+item.path);
    const held=await readPinned(fixturePath(worksite,item.path));
    if(held.byteCount!==item.byteCount)throw new TypeError('Resume author inventory size differs: '+item.path);
    authorFiles.push({...held,path:item.path,sourcePath:held.path});
  }
  const eventPath=join(from,'resources/events/runtime.events.jsonl'),eventPin=ledger.find(pin=>pin.path===eventPath),eventNode=await lstat(eventPath);
  if(!eventPin||!eventNode.isFile()||eventNode.isSymbolicLink()||await realpath(eventPath)!==eventPath||await fileDigest(eventPath)!=='sha256:'+eventPin.sha256||eventNode.size!==eventPin.byteCount)throw new TypeError('Resume sealed event store differs');
  return {fromArchive:from,scenarioKey:selected.row.key,evidence:pins,originals,authorFiles,
    protectedArchivePins:[{path:sealed.path,digest:sealed.digest,byteCount:sealed.byteCount},{path:eventPath,digest:'sha256:'+eventPin.sha256,byteCount:eventPin.byteCount}]};
}

export async function transferResumeMaterial(material,worksiteRoot,record) {
  const root=await realpath(worksiteRoot);
  if(inside(material.fromArchive,root)||inside(root,material.fromArchive))throw new TypeError('Resume destination must be a separate new worksite');
  for(const source of material.originals) {
    const path=fixturePath(root,source.path);
    if(await realpath(path)!==path||digest(await readFile(path))!==source.digest)throw new TypeError('Fresh original source differs before transfer: '+source.path);
  }
  // Refuse all existing destinations before copying even the first file.
  for(const item of material.authorFiles) {
    const path=fixturePath(root,item.path);
    try{await lstat(path);throw new TypeError('Resume cannot overwrite existing material: '+item.path);}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  const transferred=[];for(const item of material.authorFiles) {
    const path=fixturePath(root,item.path);await mkdir(dirname(path),{recursive:true});
    if(await realpath(dirname(path))!==dirname(path))throw new TypeError('Resume destination contains a symlink');
    await writeFile(path,item.bytes,{flag:'wx'});
    if(digest(await readFile(path))!==item.digest)throw new TypeError('Transferred material digest differs: '+item.path);
    transferred.push({path:item.path,sourcePath:item.sourcePath,digest:item.digest,byteCount:item.byteCount});
  }
  for(const pin of material.protectedArchivePins)if(await fileDigest(pin.path)!==pin.digest||(await lstat(pin.path)).size!==pin.byteCount)throw new TypeError('Resume changed its sealed source archive');
  const provenance={fromArchive:material.fromArchive,scenarioKey:material.scenarioKey,evidence:material.evidence,
    originalSources:material.originals,transferred,protectedArchivePins:material.protectedArchivePins,
    invocationSource:'none',oldObservationsImported:false,oldSynthesisImported:false,oldProducerCreditImported:false};
  await record('supplied-work-transfer.json',provenance);return provenance;
}
function redactedConfig(config) {
  const safe=structuredClone(config);
  for(const field of ['toolchainEnvironment'])for(const key of Object.keys(safe[field]??{}))if(/key|token|secret|password|credential/iu.test(key))safe[field][key]='[redacted]';
  return safe;
}
export async function preflight(config,selected,root) {
  const command=commandRecorder(root,{environment:setupEnvironment(config),timeoutMs:20000});
  const bytes=await readFile(config.package.archivePath);
  const observations=[],issues=[];
  if(digest(bytes)!==config.package.sha256)issues.push('Selected package archive SHA-256 differs');
  const required=new Set(['npm',...selected.flatMap(row=>row.toolchainObligations.requiredExecutables??[])]);
  const tools=[['node',{executable:config.nodePath,versionArgs:['--version']}],...[...required].filter(name=>name!=='node').map(name=>[name,config.toolchains[name]])];
  for(const [name,tool]of tools) {
    if(!tool){issues.push('Missing configured toolchain: '+name);continue;}
    try{await access(tool.executable,constants.X_OK);}catch{issues.push('Toolchain not executable: '+name);continue;}
    const observed=await command('preflight-'+name,tool.executable,tool.versionArgs,{environment:{...setupEnvironment(config),...(tool.environment??{})}});
    observations.push({name,...observed});if(observed.exitCode!==0||observed.timedOut||observed.truncated)issues.push('Configured toolchain version failed: '+name);
  }
  if(config.provider.enabled) {
    const observed=await command('preflight-provider',config.provider.command,config.provider.versionArgs??['--version']);
    observations.push({name:'provider',...observed});if(observed.exitCode!==0)issues.push('Configured provider version failed');
  }
  return {disposition:issues.length?'blocked':'ready',issues,observations,providerReachability:'Not dispatched or network-qualified',selectedCases:selected.map(row=>row.key)};
}

// The one explicitly named cold entry. Lifecycle supervision and fresh Run
// reads cross a fresh installed CLI process: one canonical JSONL request under
// the declared environment and one parsed outcome. Maintained setup instead
// holds one acquired event resource in its own module instance, borrows it
// through the installed SDK transport and closes it before this entry reopens.
export async function invokeColdInstalledEntry(caller,label,call,{runtimeRoot,environment=caller.config.setupEnvironment}) {
  const {root,record,command,config,state}=caller,acquisition=transportAcquisition(call);
  const requestPath=join(root,'calls',label+'.request.jsonl');
  await record('calls/'+label+'.request.jsonl',cliTransportJsonl(caller.runtime.product,call,acquisition),true);
  const execution=await command(label,config.nodePath,[join(runtimeRoot,'build/code/src/public/cli.js'),'--jsonl',requestPath],{cwd:root,environment});
  let outcome;
  try{const lines=execution.stdout.trim().split(/\r?\n/u);if(lines.length!==1)throw new Error('Expected one CLI outcome');outcome=JSON.parse(lines[0]);}
  catch(error){throw new BoundaryFailure(label+'-transport',{...execution,parseError:String(error)});}
  await record('calls/'+label+'.outcome.json',outcome);
  const receipt=outcome.receipt, handoff=receipt?.resources?.eventResource?.closeHandoff;
  if(handoff){state.closeHandoff=handoff;await record('calls/'+label+'.close.json',handoff);}
  state.calls.push({label,exitCode:execution.exitCode,definitionKey:call.invocation.definitionKey,
    outcomeKind:receipt?.ownerOutput?.outcomeKind??outcome.kind,invocationRef:call.invocation.invocationRef});
  requireKind(outcome,'installed_definition_call_transport_result',label+'-transport');
  return {call,outcome,receipt,execution};
}

// The same two run reads (§10.9 R-B): `freshReadbacks` reopens the close
// handoff in fresh CLI processes; `heldReadbacks` borrows the session's current
// selection in this module instance and completes at the unchanged prefix.
export async function freshReadbacks(caller,execution) {
  return runReadbacks(caller,execution,false);
}
export async function heldReadbacks(caller,execution) {
  return runReadbacks(caller,execution,true);
}
async function runReadbacks(caller,execution,held) {
  const receipt=execution.receipt,run=receipt.resources.run,terminal=receipt.ownerOutput.value?.terminalResult;
  if(!run) {
    if(receipt.ownerOutput.outcomeKind==='refusal')throw new BoundaryFailure('lifecycle-start',receipt.ownerOutput);
    throw new BoundaryFailure('readback-source','No admitted Run coordinate');
  }
  const {product,api,abg}=caller.runtime,hash=product.sha256Canonical;
  if(held&&caller.state.selection==null)throw new BoundaryFailure('held-readback','No held session selection');
  const prefix=held?caller.state.selection.prefix:caller.state.closeHandoff.prefix;
  const identityBefore=await eventResourceIdentity(fileURLToPath(prefix.eventLogRef)),reads=[];
  for(const memberKey of ['run_result','run_replay']) {
    // ABG populates the read request and authority at the entry prefix.
    const eventResource=held?caller.state.selection:caller.reopen(),label=held?memberKey+'-held':memberKey;
    const constructed=api.constructInstalledRunReadCall({memberKey,workspaceBinding:caller.state.binding,sourceRef:run.ref,
      selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'},eventResource,
      envelope:{definitionContractCoordinates:caller.native.verified.definitionContractCoordinates,
        requestRef:'request://abi5-tests/sandbox-uat/'+caller.config.runId+'/'+label,correlationRef:'correlation://abi5-tests/sandbox-uat/'+caller.config.runId,
        eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(caller.root,'run.json')).href]}});
    if(constructed.kind!=='installed_run_read_call')throw new BoundaryFailure(memberKey+'-read-population',constructed);
    if(constructed.population.source.ref!==run.ref||constructed.population.source.digest!==run.digest)throw new BoundaryFailure(memberKey+'-read-source',{run,source:constructed.population.source});
    const call=constructed.call;
    const observed=held?await caller.invoke(label,call,{expectResult:false})
      :await invokeColdInstalledEntry(caller,memberKey,call,{runtimeRoot:caller.installedRoot});
    const projection=observed.receipt.ownerOutput.value?.projection;
    const after=held?observed.receipt.resources?.eventResource?.successor?.prefix:caller.state.closeHandoff.prefix;
    if(!after||hash(after)!==hash(prefix)||!isDeepStrictEqual(identityBefore,await eventResourceIdentity(fileURLToPath(prefix.eventLogRef))))throw new BoundaryFailure(memberKey+'-read-only','Read changed event resource');
    reads.push({memberKey,projection,source:observed.receipt.ownerOutput.value?.source,ownerOutput:observed.receipt.ownerOutput,
      outcomePath:'calls/'+label+'.outcome.json'});
  }
  // Retain both independently observed read outcomes before checking terminal
  // agreement, including truthful absent-result refusals after incomplete work.
  for(const {memberKey,projection} of reads) {
    const readTerminal=projection?.terminalResult;
    if(terminal!==null&&terminal!==undefined) {
      if(!abg.isAbgTypedTerminalResult(readTerminal)||hash(readTerminal.result)!==hash(terminal.result)||hash(readTerminal.producer)!==hash(terminal.producer)||hash(readTerminal.value)!==hash(terminal.value)) {
        throw new BoundaryFailure(memberKey+'-terminal-identity',{original:terminal,readTerminal});
      }
    }else if(readTerminal!==null&&readTerminal!==undefined)throw new BoundaryFailure(memberKey+'-absent-terminal',{readTerminal});
  }
  return reads;
}

// The complete read outcome keeps custody in calls/<member>.outcome.json and the
// command's .stdout; this record references it once and carries the existing
// terminal selection (no value or projection basis) for the summary.
export function freshReadbackRecord(reads,hash) {
  return reads.map(({memberKey,projection,source,ownerOutput,outcomePath})=>{
    const terminal=projection?.terminalResult;
    const {value:_value,projectionBasis:_basis,...selection}=terminal??{};
    return {memberKey,outcomeKind:ownerOutput?.outcomeKind??null,outcome:outcomePath,outcomeDigest:hash(ownerOutput??null),
      source:source??null,status:projection?.status??null,
      terminal:terminal===null||terminal===undefined?null:{...selection,valueDigest:hash(terminal.value)}};
  });
}

export function commandObservationOwner(installedOwner,execution) {
  const receipt=execution.receipt,runRef=receipt.resources.run?.ref,terminal=receipt.ownerOutput.value?.terminalResult;
  if(typeof runRef!=='string'||!runRef.startsWith('run://')||runRef.length<=6)throw new BoundaryFailure('oracle-source','No admitted Run coordinate');
  if(terminal!==null&&terminal!==undefined&&terminal.producer?.runRef!==runRef)throw new BoundaryFailure('oracle-source','Terminal producer differs from admitted Run');
  return {graphFunctionRef:installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
    outputContractRef:installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,resultClass:'success',runId:runRef};
}

export function commandObservationSourceUse(runtime,prefix,events,owner) {
  const selected=new Set();
  try {
    // The nominal cold receipt already authenticated these exact event values.
    // Copied rows or a supplied JSON state cannot establish source-use credit.
    const owned=runtime.abg.readRuntimeEventsAtDurablePrefix(prefix);
    if(owned!==events)return ()=>false;
    const authority=runtime.abg.selectValidatedRuntimeEventPrefix(owned);
    const runs=owned.filter(event=>event.kind==='run_segment_opened'&&event.aggregateId===owner.runId);
    if(runs.length!==1||typeof runs[0].payload?.invocationAdmissionRef!=='string')return ()=>false;
    const admission=runtime.abg.rehydrateInvocationAdmissionAtPrefix(authority,runs[0].payload.invocationAdmissionRef);
    if(admission===null||!runtime.abg.hasInvocationRunBindingAtPrefix(authority,admission,owner.runId)||
      admission.sourceResultBasis?.sourceResultContractRef!==runtime.product.governanceContract('state'))return ()=>false;
    // Native invocation admission proved this complete immutable source basis.
    // Its existing owner transports finite original Result/call identities;
    // re-deriving historical replay here would create a second computation.
    for(const event of owned) {
      const payload=event.payload;
      if(event.kind==='c_call_result_admitted'&&event.graphFunctionRef===owner.graphFunctionRef&&
        payload?.contractRef===owner.outputContractRef&&payload.resultClass===owner.resultClass&&
        payload.valueKind==='worksite_command_execution_observation'&&payload.cCallRef===event.aggregateId&&
        runtime.invocationTruth.hasAdmittedGovernanceSourceUse(admission,event))selected.add(event);
    }
  }catch { selected.clear(); /* Absent or refused owner support earns no historical credit. */ }
  return event=>selected.has(event);
}

export async function checkInstalledIdentity(caller,installations,phase) {
  const observations=[];
  for(const install of installations) {
    let contentMatches=false,error=null;
    try{contentMatches=await caller.runtime.product.installedProductContentMatches(install)===true;}
    catch(cause){error=String(cause);}
    observations.push({installId:install.installId,admissionEventRef:install.admissionEventRef,
      productId:install.productId,packageName:install.packageName,installedRoot:install.installedRoot,
      artifactDigest:install.artifactDigest,productContentDigest:install.productContentDigest,manifestDigest:install.manifestDigest,
      contentMatches,...(error===null?{}:{error})});
  }
  await caller.record('installed-content-'+phase+'.json',{phase,observations});
  if(observations.length!==2||observations.some(row=>!row.contentMatches))throw new BoundaryFailure('installed-content-'+phase,observations);
}

// The in-process actor and worker owners read the process environment at call
// time: a held lifecycle runs under exactly the declared worker environment,
// and the ambient environment returns in finally.
async function withWorkerEnvironment(environment,body) {
  if(environment===null||typeof environment!=='object')throw new BoundaryFailure('worker-environment','Explicit worker environment required');
  const ambient={...process.env};
  const assign=values=>{for(const key of Object.keys(process.env))delete process.env[key];Object.assign(process.env,values);};
  try{assign(environment);return await body();}
  finally{assign(ambient);}
}

// The trusted bootstrap owns this check; a changed installed package must not
// supply its own checker or execute a fresh reader before the check succeeds.
// A held session borrows its current selection in this module instance; a
// caller without one keeps the one cold CLI entry.
export async function invokeLifecycle(caller,installations,call,environment) {
  await checkInstalledIdentity(caller,installations,'before-run');
  try {
    return caller.state.selection!=null
      ?await withWorkerEnvironment(environment,()=>caller.invoke('lifecycle-start',call,{expectResult:false}))
      :await invokeColdInstalledEntry(caller,'lifecycle-start',call,{runtimeRoot:caller.installedRoot,environment});
  }finally {
    await checkInstalledIdentity(caller,installations,'after-run');
  }
}

export async function runScenario(config,fixtures,row,mode) {
  const archive=await newArchive(config.archiveRoot,row.key),root=archive.path;
  const record=(path,value,raw=false)=>exclusiveRecord(root,path,value,raw);
  const effective={...config,runId:archive.runId,bootstrapRoot:join(root,'bootstrap/node_modules/@abiogenesis/typescript-tenant'),worksiteRoot:join(root,'sandbox/worksite'),setupEnvironment:setupEnvironment(config)};
  const command=commandRecorder(root,{environment:effective.setupEnvironment,timeoutMs:config.processTimeoutMs,maxOutputBytes:config.maxProcessOutputBytes??16*1024*1024});
  let caller,summary={scenario:row.key,runId:archive.runId,archive:root,mode,status:'incomplete',uatPass:false};
  await record('run.json',{timestamp:new Date().toISOString(),scenario:row,runId:archive.runId,sourceCommit:config.sourceCommit,
    interpreter:{executable:config.nodePath,version:process.version},configuration:redactedConfig(config),mode,invokedCommand:process.argv,
    classification:'ABG-owned test workload and oracle; no ABG Product scenario implementation'});
  try {
    const selected=await acquireScenario(fixtures.root,row);
    const oracleSnapshot=await snapshotScenario(fixtures,selected,root);await record('oracle-acquisition.json',oracleSnapshot);
    const resume=mode==='resume'?await acquireResumeMaterial(config,config.resumeFromArchive,selected):null;
    const effectiveRequest=applyCommandTimeoutOverrides(selected.request,config.commandTimeoutOverrides);
    if(config.commandTimeoutOverrides!==undefined)await record('effective-execution-policy.json',{
      originalRequest:{path:row.requestFile,digest:selected.assets.find(asset=>asset.path===row.requestFile).digest},
      effectiveRequestDigest:digest(Buffer.from(JSON.stringify(effectiveRequest))),
      commandTimeoutOverrides:Object.entries(config.commandTimeoutOverrides).map(([commandId,timeoutMs])=>({commandId,
        originalTimeoutMs:selected.request.testing.commands.find(command=>command.commandId===commandId).timeoutMs,timeoutMs})),
      classification:'Explicit caller timing only; acquired bytes and all other command/predicate/report fields conserved'});
    const ready=await preflight(config,[row],root);await record('preflight.json',ready);
    if(ready.disposition!=='ready')return summary={...summary,status:'blocked',reason:'Preflight obligations incomplete',issues:ready.issues};
    if(mode!=='prepare'&&!config.provider.enabled)return summary={...summary,status:'blocked',reason:'Provider dispatch is disabled in selected configuration'};
    await mkdir(effective.bootstrapRoot,{recursive:true});
    const unpacked=await command('acquire-bootstrap','/usr/bin/tar',['-xzf',config.package.archivePath,'--strip-components=1','-C',effective.bootstrapRoot]);
    if(unpacked.exitCode!==0)throw new BoundaryFailure('bootstrap-acquisition',unpacked);
    const runtime=await installedModules(effective.bootstrapRoot),manifest=await readJson(join(effective.bootstrapRoot,'product-toolchain-manifest.json'));
    const native=await verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,expectedArtifactDigest:config.package.sha256},record,'abg');
    caller=publicCaller({root,runtime,native,command,record,config:effective});
    // One held session: setup's acquisition stays held until the qualification boundary.
    const {installations}=await populateSandbox(caller,{retain:true});
    // Protected originals and independent rubrics are baseline input, before
    // runtime dispatch. No source solution or claimed result is seeded.
    for(const source of selected.sources){const path=fixturePath(effective.worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});}
    if(resume)await transferResumeMaterial(resume,effective.worksiteRoot,record);
    await record('workload-source.json',{sourceMembers:selected.sources.map(({bytes,...source})=>({...source,byteCount:bytes.length})),request:selected.request,legacyInterpretation:row.legacyInterpretation});
    const input=constructWorkloadInput(runtime.product,{...selected,request:effectiveRequest},assessmentSelection,config.toolchains);
    const prepared=await constructLifecycleCall(caller,input);await record('prepared-definition-call.json',prepared.call);
    if(mode==='prepare'){await record('session-close.json',caller.close());return summary={...summary,status:'prepared',reason:'Clean Public install and generic lifecycle request resolved; no provider dispatch or UAT result'};}
    const execution=await invokeLifecycle(caller,installations,prepared.call,workerEnvironment(config));
    const events=await readOracleEvents(runtime.abg,caller.prefix(),record);
    const installedOwner=(await installedModules(caller.installedRoot)).product;
    const observationOwner=commandObservationOwner(installedOwner,execution);
    const validateSourceObservation=commandObservationSourceUse(runtime,caller.prefix(),events,observationOwner);
    const heldReads=await heldReadbacks(caller,execution);await record('held-readback.json',freshReadbackRecord(heldReads,runtime.product.sha256Canonical));
    // Qualification boundary: the one outer resource closes once; the genuine
    // cold reads reopen its handoff with the same selectors.
    await record('session-close.json',caller.close());
    const reads=await freshReadbacks(caller,execution);await record('fresh-readback.json',freshReadbackRecord(reads,runtime.product.sha256Canonical));
    for(const read of reads) {
      const warm=heldReads.find(row=>row.memberKey===read.memberKey);
      if(!isDeepStrictEqual(warm?.ownerOutput,read.ownerOutput))throw new BoundaryFailure(read.memberKey+'-held-cold-equality',{held:warm?.outcomePath??null,cold:read.outcomePath});
    }
    const sourceChecks=[];
    for(const source of selected.sources)sourceChecks.push({path:source.path,expected:source.digest,observed:digest(await readFile(fixturePath(effective.worksiteRoot,source.path)))});
    await record('source-conservation.json',sourceChecks);
    if(sourceChecks.some(source=>source.expected!==source.observed))throw new BoundaryFailure('source-conservation',sourceChecks);
    const terminal=execution.receipt.ownerOutput.value?.terminalResult,terminalState=terminal?.value;
    const archivedSelection=await acquireArchivedScenario(oracleSnapshot);
    const oraclePath=fixturePath(oracleSnapshot.root,archivedSelection.row.oracleModule),oracle=await import(pathToFileURL(oraclePath).href);
    const observationRelation=installedOwner.resolveWorksiteCommandExecutionJudgmentRelation(installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
    const judged=await oracle.evaluate({worksiteRoot:effective.worksiteRoot,runArchive:root,commands:caller.state.calls,events,source:archivedSelection.row,
      request:{...selected.request,testing:input.original.testing},observationOwner,validateSourceObservation,
      validateObservation:observationRelation?observation=>observationRelation.evaluate(observation.task,observation):undefined});
    await record('independent-oracle.json',judged);
    const completed=execution.receipt.exitCode===0&&execution.receipt.ownerOutput.outcomeKind==='result'&&terminalState?.kind==='governance_work_state'&&terminalState.terminal===true&&terminalState.unresolvedSupportRefs.length===0;
    const oracleGreen=judged.disposition==='satisfied'||judged.status==='satisfied';
    const readGreen=reads.length===2&&reads.every(read=>read.ownerOutput.outcomeKind==='result')&&reads.find(read=>read.memberKey==='run_replay')?.projection?.status==='closed';
    summary={...summary,status:completed&&oracleGreen&&readGreen?'passed':'failed',uatPass:completed&&oracleGreen&&readGreen,
      runtimeDisposition:execution.receipt.ownerOutput.outcomeKind,terminalAvailable:terminal!==null&&terminal!==undefined,
      independentOracle:judged.disposition??judged.status,reason:completed&&oracleGreen&&readGreen?'Selected original obligations and exact terminal/readbacks agree':'Original application obligations or terminal evidence remain incomplete'};
    return summary;
  }catch(error){summary={...summary,status:error instanceof BoundaryFailure?'refused':'failed',reason:String(error),
      boundary:error.stage??null,observation:error.observation??null,stop:'First failing composition returned for Product/Design/interface/identity/effects/proof triage; no retry'};
    await record('failure.json',summary);return summary;
  }finally{
    // Session failure cleanup: close the held resource at its durable prefix,
    // or release the outer lock when that close refuses.
    const held=caller?.state.resource??null;
    if(held!==null) {
      try{await record('session-close.json',caller.close(caller.runtime.abg.selectHeldEventStoreDurablePrefix(held.store)));}
      catch(error){caller.runtime.abg.abandonAbgEventResource(held);caller.state.resource=null;caller.state.selection=null;await record('session-abandon.json',{reason:String(error)});}
    }
    if(caller?.state.closeHandoff)await record('final-close-handoff.json',caller.state.closeHandoff);
    // The archive itself owns the worksite, event file, toolchain observations
    // and actual output. Nothing is removed at teardown, on success or failure.
    await record('summary.json',summary);await record('SEALED.json',{sealedAt:new Date().toISOString(),status:summary.status,archiveRoot:root,retained:true});
  }
}

export async function main(args=process.argv.slice(2)) {
  const [mode,...rest]=args;
  if(!['list','preflight','prepare','run','resume'].includes(mode))throw new TypeError('Usage: sandbox-uat list | preflight/prepare/run --config FILE (--case KEY | --all) | resume --from SEALED_ARCHIVE --config FILE --case KEY');
  const options={};for(let i=0;i<rest.length;i++){if(rest[i]==='--all')options.all=true;else if(['--config','--case','--fixtures','--from'].includes(rest[i]))options[rest[i].slice(2)]=rest[++i];else throw new TypeError('Unknown argument: '+rest[i]);}
  if(mode==='resume'&&(!options.from||!options.case||options.all))throw new TypeError('Resume requires one --case and explicit --from; --all is not supported');
  if(mode!=='resume'&&options.from)throw new TypeError('--from is only supported for resume');
  const config=mode==='list'&&!options.config?null:await configuration(options.config);
  if(mode==='resume')config.resumeFromArchive=await realpath(options.from);
  const fixtures=await loadScenarios(options.fixtures??config?.fixtureRoot??defaultFixtures);
  if(mode==='list'){console.log(JSON.stringify(fixtures.rows.map(({key,title,scenarioId,toolchainObligations})=>({key,title,scenarioId,toolchainObligations})),null,2));return 0;}
  const selected=selectScenarios(fixtures.rows,{caseKey:options.case,all:options.all});
  if(mode==='preflight'){
    const archive=await newArchive(config.archiveRoot,'preflight');const result=await preflight(config,selected,archive.path);
    await exclusiveRecord(archive.path,'summary.json',result);await exclusiveRecord(archive.path,'SEALED.json',{sealedAt:new Date().toISOString(),retained:true});
    console.log(JSON.stringify({...result,archive:archive.path},null,2));return result.disposition==='ready'?0:2;
  }
  const results=[];
  for(const row of selected){const result=await runScenario(config,fixtures,row,mode);results.push(result);console.log(JSON.stringify(result));if(['refused','blocked'].includes(result.status))break;}
  return results.length===selected.length&&results.every(result=>mode==='prepare'?result.status==='prepared':result.uatPass)?0:1;
}
