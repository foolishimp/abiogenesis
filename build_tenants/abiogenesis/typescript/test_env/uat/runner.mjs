import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { access, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { acquireArchivedScenario, acquireScenario, constructWorkloadInput, digest, fixturePath, inside, loadScenarios, readJson, selectScenarios, snapshotScenario } from './scenarios.mjs';
import { assessmentSelection } from './consumer.mjs';
import { BoundaryFailure, constructLifecycleCall, installedModules, populateSandbox, publicCaller, requireKind, verifyArtifact } from './public-setup.mjs';

const tenantRoot=fileURLToPath(new URL('../..',import.meta.url));
const defaultFixtures=join(tenantRoot,'test_env/fixtures/sandbox-uat');
export async function exclusiveRecord(root,path,value,raw=false) {
  const file=fixturePath(root,path);await mkdir(dirname(file),{recursive:true});
  await writeFile(file,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  return file;
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
    const result={...observation,...closed,wallMs:performance.now()-startedMs,timedOut,truncated,failure,
      stdout:Buffer.concat(stdout).toString('utf8'),stderr:Buffer.concat(stderr).toString('utf8')};
    await exclusiveRecord(root,'commands/'+label+'.stdout',result.stdout,true);
    await exclusiveRecord(root,'commands/'+label+'.stderr',result.stderr,true);
    await exclusiveRecord(root,'commands/'+label+'.result.json',result);
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
  for(const [name,tool]of Object.entries(config.toolchains??{})) {
    tool.executable=absolute(tool.executable);
    if(!Array.isArray(tool.versionArgs)||tool.versionArgs.some(arg=>typeof arg!=='string'))throw new TypeError('Explicit versionArgs required for '+name);
  }
  if(!config.toolchains?.npm)throw new TypeError('Explicit npm toolchain binding is required');
  if(typeof config.provider?.enabled!=='boolean')throw new TypeError('Provider enabled selection must be explicit');
  if(config.provider.command)config.provider.command=absolute(config.provider.command);
  if(config.provider.enabled) {
    if(config.provider.agent!=='claude'||typeof config.provider.model!=='string'||config.provider.model.length===0)throw new TypeError('Current native lane requires an explicit Claude command/model');
    finite(config.provider.maxTurns,'provider.maxTurns');
    finite(config.provider.inactivityTimeoutMs,'provider.inactivityTimeoutMs');finite(config.provider.absoluteTimeoutMs,'provider.absoluteTimeoutMs');
    if(!(config.provider.maxBudgetUsd>0&&Number.isFinite(config.provider.maxBudgetUsd)))throw new TypeError('Finite positive provider budget required');
  }
  return {...config,configPath:path};
}
function inherited(keys){return Object.fromEntries(keys.filter(key=>typeof key==='string'&&process.env[key]!==undefined).map(key=>[key,process.env[key]]));}
function setupEnvironment(config) {
  return {...inherited(config.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']),...(config.toolchainEnvironment??{})};
}
function workerEnvironment(config) {
  const provider=config.provider;
  return {...setupEnvironment(config),...inherited(provider.inheritEnvironment??[]),
    ABG_TS_CLAUDE_COMMAND:provider.command,ABG_TS_WORKER_SANDBOX:'agent_default',
    ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(['--model',provider.model,'--max-turns',String(provider.maxTurns),'--max-budget-usd',String(provider.maxBudgetUsd),...(provider.appendArgs??[])]),
    ABG_TS_FP_TIMEOUT_MS:String(provider.inactivityTimeoutMs),ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:String(provider.absoluteTimeoutMs),ABG_TS_FP_TERMINATION_GRACE_MS:'5000'};
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

export async function freshReadbacks(caller,execution) {
  const {product,abg,api}=caller.runtime,env=caller.refresh(),hash=product.sha256Canonical;
  const receipt=execution.receipt,run=receipt.resources.run,terminal=receipt.ownerOutput.value?.terminalResult;
  if(!run)throw new BoundaryFailure('readback-source','No admitted Run coordinate');
  const prefix=caller.state.closeHandoff.prefix,bytesBefore=await readFile(fileURLToPath(prefix.eventLogRef)),reads=[];
  for(const memberKey of ['run_result','run_replay']) {
    const packet=abg.ABG_PROJECT_READ_CONTRACTS[memberKey],grants=packet.metadata.capabilityRefs.map(cap=>product.constructCapabilityGrant(
      env.workspaceAuthorityBasis,caller.actorRef,packet.definitionKey.operationId,cap,{admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:packet}));
    const slots={...Object.fromEntries(Object.keys(execution.call.invocation.invocationAuthority.slots).map(key=>[key,null])),
      workspace_binding:caller.state.binding,product_set:env.productInstalls.map(product.productInstallCoordinate),
      dependency_lock:{ref:env.workspaceBinding.lockId,digest:env.workspaceBinding.lockDigest},
      capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))}};
    const request={caseKey:memberKey,source:{sourceKind:'run',sourceRef:run.ref,sourceDigest:run.digest},
      projectionBasis:{projectionBasisRef:prefix.eventLogRef,projectionBasisDigest:prefix.coordinateDigest},
      selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'}};
    const call=api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:caller.native.verified.definitionContractCoordinates,
      contractCatalog:caller.contractCatalog,...packet.definitionKey,request,slots,resources:{kind:'abg_project_read_resource_assertion',schemaVersion:'5.0.0',eventResource:caller.reopen()},
      requestRef:'request://abi5-tests/sandbox-uat/'+caller.config.runId+'/'+memberKey,correlationRef:'correlation://abi5-tests/sandbox-uat/'+caller.config.runId,
      eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(caller.root,'run.json')).href]});
    const observed=await caller.invoke(memberKey,call,{runtimeRoot:caller.installedRoot,expectResult:false});
    const projection=observed.receipt.ownerOutput.value?.projection;
    if(hash(caller.state.closeHandoff.prefix)!==hash(prefix)||!bytesBefore.equals(await readFile(fileURLToPath(prefix.eventLogRef))))throw new BoundaryFailure(memberKey+'-read-only','Read changed event resource');
    reads.push({memberKey,projection,source:observed.receipt.ownerOutput.value?.source,ownerOutput:observed.receipt.ownerOutput});
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

async function checkInstalledIdentity(caller,installations,phase) {
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

// The trusted bootstrap owns this check; a changed installed package must not
// supply its own checker or execute a fresh reader before the check succeeds.
export async function invokeLifecycle(caller,installations,call,environment) {
  await checkInstalledIdentity(caller,installations,'before-run');
  try {
    return await caller.invoke('lifecycle-start',call,{runtimeRoot:caller.installedRoot,environment,expectResult:false});
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
    const ready=await preflight(config,[row],root);await record('preflight.json',ready);
    if(ready.disposition!=='ready')return summary={...summary,status:'blocked',reason:'Preflight obligations incomplete',issues:ready.issues};
    if(mode==='run'&&!config.provider.enabled)return summary={...summary,status:'blocked',reason:'Provider dispatch is disabled in selected configuration'};
    await mkdir(effective.bootstrapRoot,{recursive:true});
    const unpacked=await command('acquire-bootstrap','/usr/bin/tar',['-xzf',config.package.archivePath,'--strip-components=1','-C',effective.bootstrapRoot]);
    if(unpacked.exitCode!==0)throw new BoundaryFailure('bootstrap-acquisition',unpacked);
    const runtime=await installedModules(effective.bootstrapRoot),manifest=await readJson(join(effective.bootstrapRoot,'product-toolchain-manifest.json'));
    const native=await verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,expectedArtifactDigest:config.package.sha256},record,'abg');
    caller=publicCaller({root,runtime,native,command,record,config:effective});
    const {installations}=await populateSandbox(caller);
    // Protected originals and independent rubrics are baseline input, before
    // runtime dispatch. No source solution or claimed result is seeded.
    for(const source of selected.sources){const path=fixturePath(effective.worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});}
    await record('workload-source.json',{sourceMembers:selected.sources.map(({bytes,...source})=>({...source,byteCount:bytes.length})),request:selected.request,legacyInterpretation:row.legacyInterpretation});
    const input=constructWorkloadInput(runtime.product,selected,assessmentSelection,config.toolchains);
    const prepared=await constructLifecycleCall(caller,input);await record('prepared-definition-call.json',prepared.call);
    if(mode==='prepare')return summary={...summary,status:'prepared',reason:'Clean Public install and generic lifecycle request resolved; no provider dispatch or UAT result'};
    const execution=await invokeLifecycle(caller,installations,prepared.call,workerEnvironment(config));
    const events=runtime.abg.readRuntimeEventsAtDurablePrefix(caller.state.closeHandoff.prefix);
    await record('runtime-events.json',events);
    const reads=await freshReadbacks(caller,execution);await record('fresh-readback.json',reads);
    const sourceChecks=[];
    for(const source of selected.sources)sourceChecks.push({path:source.path,expected:source.digest,observed:digest(await readFile(fixturePath(effective.worksiteRoot,source.path)))});
    await record('source-conservation.json',sourceChecks);
    if(sourceChecks.some(source=>source.expected!==source.observed))throw new BoundaryFailure('source-conservation',sourceChecks);
    const terminal=execution.receipt.ownerOutput.value?.terminalResult,terminalState=terminal?.value;
    const archivedSelection=await acquireArchivedScenario(oracleSnapshot);
    const oraclePath=fixturePath(oracleSnapshot.root,archivedSelection.row.oracleModule),oracle=await import(pathToFileURL(oraclePath).href);
    const installedOwner=(await installedModules(caller.installedRoot)).product;
    const observationOwner={graphFunctionRef:installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
      outputContractRef:installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,
      resultClass:'success',runId:terminal?.producer?.runRef??null};
    const observationRelation=installedOwner.resolveWorksiteCommandExecutionJudgmentRelation(installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
    const judged=await oracle.evaluate({worksiteRoot:effective.worksiteRoot,runArchive:root,commands:caller.state.calls,events,source:archivedSelection.row,
      request:{...selected.request,testing:input.original.testing},observationOwner,
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
    if(caller?.state.closeHandoff)await record('final-close-handoff.json',caller.state.closeHandoff);
    // The archive itself owns the worksite, event file, toolchain observations
    // and actual output. Nothing is removed at teardown, on success or failure.
    await record('summary.json',summary);await record('SEALED.json',{sealedAt:new Date().toISOString(),status:summary.status,archiveRoot:root,retained:true});
  }
}

export async function main(args=process.argv.slice(2)) {
  const [mode,...rest]=args;
  if(!['list','preflight','prepare','run'].includes(mode))throw new TypeError('Usage: sandbox-uat list | preflight/prepare/run --config FILE (--case KEY | --all)');
  const options={};for(let i=0;i<rest.length;i++){if(rest[i]==='--all')options.all=true;else if(['--config','--case','--fixtures'].includes(rest[i]))options[rest[i].slice(2)]=rest[++i];else throw new TypeError('Unknown argument: '+rest[i]);}
  const config=mode==='list'&&!options.config?null:await configuration(options.config);
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
