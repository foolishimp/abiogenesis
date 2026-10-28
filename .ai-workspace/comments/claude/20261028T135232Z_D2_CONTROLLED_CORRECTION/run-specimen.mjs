// T-287 Phase D, package D2: the mechanical lifecycle specimen through the
// installed generic lifecycle. This driver runs the sandbox harness's sequence
// (`test_env/uat/runner.mjs::runScenario`, :340-413) line for line where it
// applies, importing the harness's exports by absolute path. It omits only the
// catalog steps: the catalog acquisition (`acquireScenario`), the oracle
// snapshot (`snapshotScenario`), the archived re-acquisition
// (`acquireArchivedScenario`) and the catalog oracle (`independent-oracle.mjs`).
// The specimen's three originals and its request are acquired from this record
// directory's `specimen/` copies against the pinned digests below; the judgment
// is this directory's `specimen-oracle.mjs`, pinned by digest at acquisition.
//
// Modes: `prepare` (the admission check: stops after the prepared definition
// call, no provider dispatch), `run` (one live run), `cold-reads` (after the
// run's process has exited: the two Public reads again through fresh installed
// CLI processes with the archived close handoff, under a new scratch root).
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { applyCommandTimeoutOverrides, commandObservationOwner, commandObservationSourceUse, commandRecorder, configuration,
  eventResourceIdentity, exclusiveRecord, freshReadbacks, invokeLifecycle, newArchive, preflight, readOracleEvents, workerEnvironment }
  from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import { BoundaryFailure, constructLifecycleCall, installedModules, populateSandbox, publicCaller, verifyArtifact }
  from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
import { constructWorkloadInput, digest, fixturePath, readJson }
  from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/scenarios.mjs';
import { assessmentSelection }
  from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/consumer.mjs';

const recordDirectory=dirname(fileURLToPath(import.meta.url));
const specimenRoot=join(recordDirectory,'specimen');
const oracleModule=join(recordDirectory,'specimen-oracle.mjs');
// The activation's pins (phase_d.md, `## D2 activation`, "The specimen").
const SPECIMEN_PINS=Object.freeze([
  {path:'fixture/source.md',fixtureFile:'source.md',digest:'sha256:9a28aa248b2fbab7493ff91456331aeb1a8287de363b65fcd59f2ba0dbd3f328',byteCount:1107},
  {path:'fixture/checker.mjs',fixtureFile:'checker.mjs',digest:'sha256:5a39eff7d6082835ebc49bc9deeaf4ff1d7e01e55314bfec749cf3d018cced22',byteCount:335},
  {path:'fixture/rubric.md',fixtureFile:'rubric.md',digest:'sha256:d5efa802ff34c2847871df8b2bf81f21b05abfca70c1c4c33281ba977f54ea42',byteCount:634}]);
// The specimen's row in the harness's row shape (key, files, toolchain obligations);
// it is not a catalog row and no catalog is loaded.
export const SPECIMEN_ROW=Object.freeze({key:'d2-specimen',title:'Mechanical lifecycle specimen (T-287 Phase D, D2)',
  requestFile:'specimen/request.json',sourceFiles:SPECIMEN_PINS.map(pin=>'specimen/'+pin.fixtureFile),oracleModule:'specimen-oracle.mjs',
  toolchainObligations:{requiredExecutables:['node']}});

// Inlined verbatim from runner.mjs:109-112 and :214-218: module-private there, not exports.
function inherited(keys){return Object.fromEntries(keys.filter(key=>typeof key==='string'&&process.env[key]!==undefined).map(key=>[key,process.env[key]]));}
function setupEnvironment(config) {
  return {...inherited(config.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']),...(config.toolchainEnvironment??{})};
}
function redactedConfig(config) {
  const safe=structuredClone(config);
  for(const field of ['toolchainEnvironment'])for(const key of Object.keys(safe[field]??{}))if(/key|token|secret|password|credential/iu.test(key))safe[field][key]='[redacted]';
  return safe;
}

// In place of `acquireScenario` (catalog acquisition): the specimen's exact bytes
// against the activation's pins, the request, and the oracle module's digest.
export async function acquireSpecimen() {
  const sources=[];
  for(const pin of SPECIMEN_PINS) {
    const bytes=await readFile(fixturePath(specimenRoot,pin.fixtureFile));
    if(digest(bytes)!==pin.digest||bytes.length!==pin.byteCount)throw new TypeError('Specimen digest mismatch: '+pin.fixtureFile);
    sources.push({path:pin.path,fixtureFile:pin.fixtureFile,digest:pin.digest,bytes});
  }
  const requestBytes=await readFile(fixturePath(specimenRoot,'request.json'));
  const request=JSON.parse(requestBytes.toString('utf8'));
  if(!Array.isArray(request.sourceMembers)||request.sourceMembers.length!==sources.length||
    request.sourceMembers.some((member,i)=>member.path!==sources[i].path||member.fixtureFile!==sources[i].fixtureFile||member.digest!==sources[i].digest))
    throw new TypeError('Specimen request source members differ from the pinned originals');
  const oracleBytes=await readFile(oracleModule);
  const assets=[...sources.map(({path,fixtureFile,digest:d,bytes})=>({path:'specimen/'+fixtureFile,worksitePath:path,digest:d,byteCount:bytes.length})),
    {path:SPECIMEN_ROW.requestFile,digest:digest(requestBytes),byteCount:requestBytes.length},
    {path:SPECIMEN_ROW.oracleModule,digest:digest(oracleBytes),byteCount:oracleBytes.length}];
  return {row:SPECIMEN_ROW,request,sources,assets,acquisition:{kind:'d2_specimen_acquisition',recordDirectory,assets,
    pinsFrom:'phase_d.md ## D2 activation (the specimen digests and byte counts)',
    classification:'Specimen bytes acquired from the record directory copies against the activation pins; no catalog, snapshot or Run migration'}};
}

// The admission check only: the C2 configuration law (worksite_command_execution.ts:1462-1595) is not part of the
// lifecycle input admission (`isGovernanceWorkState`), so the request's testing block is put through the installed
// owner's pure constructor before any provider dispatch, with the activation's literal territory as the control.
async function c2ConfigurationCheck(caller,input,record) {
  const product=caller.runtime.product,environment=caller.refresh();
  const c2=await import(pathToFileURL(join(caller.config.bootstrapRoot,'build/code/src/product/worksite_command_execution.js')).href);
  const authority=environment.workspaceAuthorityBasis,binding=environment.workspaceBinding,testing=input.original.testing;
  const protectedSubjects=testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({workspaceAuthorityBasis:authority,workspaceBinding:binding,
    subjectUri:pathToFileURL(resolve(authority.canonicalRoot,relativePath)).href,relativePath}));
  const attempt=allowedWriteTerritories=>{
    try{const bound=c2.constructWorksiteCommandConfiguration({workspaceAuthorityBasis:authority,workspaceBinding:binding,commands:testing.commands,
      outcomePredicates:testing.outcomePredicates,protectedSubjects,allowedWriteTerritories},null);
      return {disposition:'constructed',commands:bound.commands.length,predicates:bound.predicates.length,allowedWriteTerritories:bound.allowedWriteTerritories};}
    catch(error){return {disposition:'refused',error:String(error)};}
  };
  const literal=[{pathKind:'file',relativePath:'fixture/value.txt'}];
  return record('c2-configuration-check.json',{protectedSubjects:protectedSubjects.map(row=>row.relativePath??row),
    request:{allowedWriteTerritories:testing.allowedWriteTerritories,result:attempt(testing.allowedWriteTerritories)},
    activationLiteral:{allowedWriteTerritories:literal,result:attempt(literal),
      protectedSubjectInsideTerritory:testing.selectedPaths.filter(path=>product.worksitePathIsAllowed(path,literal))},
    law:'constructWorksiteCommandConfiguration refuses a protected subject inside an allowed write territory (worksite_command_execution.ts:1588); Testing protected subjects are testing.selectedPaths (abg/default_library.ts:279)'});
}

export async function runSpecimen(config,mode) {
  const row=SPECIMEN_ROW;
  const archive=await newArchive(config.archiveRoot,row.key),root=archive.path;
  const record=(path,value,raw=false)=>exclusiveRecord(root,path,value,raw);
  const effective={...config,runId:archive.runId,bootstrapRoot:join(root,'bootstrap/node_modules/@abiogenesis/typescript-tenant'),worksiteRoot:join(root,'sandbox/worksite'),setupEnvironment:setupEnvironment(config)};
  const command=commandRecorder(root,{environment:effective.setupEnvironment,timeoutMs:config.processTimeoutMs,maxOutputBytes:config.maxProcessOutputBytes??16*1024*1024});
  let caller,summary={scenario:row.key,runId:archive.runId,archive:root,mode,status:'incomplete',uatPass:false};
  await record('run.json',{timestamp:new Date().toISOString(),scenario:row,runId:archive.runId,sourceCommit:config.sourceCommit,
    interpreter:{executable:config.nodePath,version:process.version},configuration:redactedConfig(config),mode,invokedCommand:process.argv,
    classification:'ABG-owned test workload and oracle; no ABG Product scenario implementation'});
  try {
    const selected=await acquireSpecimen();
    await record('specimen-acquisition.json',selected.acquisition);
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
    const {installations}=await populateSandbox(caller);
    // Protected originals are baseline input, before runtime dispatch. No candidate is seeded.
    for(const source of selected.sources){const path=fixturePath(effective.worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});}
    await record('workload-source.json',{sourceMembers:selected.sources.map(({bytes,...source})=>({...source,byteCount:bytes.length})),request:selected.request,legacyInterpretation:row.legacyInterpretation});
    const input=constructWorkloadInput(runtime.product,{...selected,request:effectiveRequest},assessmentSelection,config.toolchains);
    const prepared=await constructLifecycleCall(caller,input);await record('prepared-definition-call.json',prepared.call);
    if(mode==='prepare') {
      await c2ConfigurationCheck(caller,input,record);
      return summary={...summary,status:'prepared',reason:'Clean Public install and generic lifecycle request resolved; no provider dispatch or UAT result'};
    }
    const execution=await invokeLifecycle(caller,installations,prepared.call,workerEnvironment(config));
    const events=await readOracleEvents(runtime.abg,caller.state.closeHandoff.prefix,record,source=>caller.refresh(source));
    const reads=await freshReadbacks(caller,execution);await record('fresh-readback.json',reads);
    const sourceChecks=[];
    for(const source of selected.sources)sourceChecks.push({path:source.path,expected:source.digest,observed:digest(await readFile(fixturePath(effective.worksiteRoot,source.path)))});
    await record('source-conservation.json',sourceChecks);
    if(sourceChecks.some(source=>source.expected!==source.observed))throw new BoundaryFailure('source-conservation',sourceChecks);
    const terminal=execution.receipt.ownerOutput.value?.terminalResult,terminalState=terminal?.value;
    // In place of `acquireArchivedScenario` and the catalog oracle: the specimen oracle at its acquired digest.
    const oracleBytes=await readFile(oracleModule),oracleAsset=selected.assets.find(asset=>asset.path===row.oracleModule);
    if(digest(oracleBytes)!==oracleAsset.digest)throw new TypeError('Specimen oracle changed after acquisition');
    const oracle=await import(pathToFileURL(oracleModule).href);
    const installedOwner=(await installedModules(caller.installedRoot)).product;
    const observationOwner=commandObservationOwner(installedOwner,execution);
    const validateSourceObservation=commandObservationSourceUse(runtime,caller.state.environment.prefix,events,observationOwner);
    const observationRelation=installedOwner.resolveWorksiteCommandExecutionJudgmentRelation(installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
    const judged=await oracle.evaluate({worksiteRoot:effective.worksiteRoot,runArchive:root,commands:caller.state.calls,events,source:row,
      request:{...selected.request,testing:input.original.testing},observationOwner,validateSourceObservation,
      validateObservation:observationRelation?observation=>observationRelation.evaluate(observation.task,observation):undefined});
    await record('specimen-judgment.json',{...judged,oracleModule:oracleAsset});
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
    // The archive owns the worksite, event file, toolchain observations and actual output. Nothing is removed.
    await record('summary.json',summary);await record('SEALED.json',{sealedAt:new Date().toISOString(),status:summary.status,archiveRoot:root,retained:true});
  }
}

// After the run's process has exited: a second process rebuilds the caller from the sealed archive and repeats
// `freshReadbacks` (fresh installed CLI processes reopening the closed resource with the archived close handoff).
// Its records go to a new scratch root; the sealed archive is only read.
export async function coldReads(config,archivePath,outRoot) {
  const archived=path=>readJson(join(archivePath,path));
  const run=await archived('run.json'),setup=await archived('setup-identity.json'),closeHandoff=await archived('final-close-handoff.json');
  await mkdir(dirname(outRoot),{recursive:true});await mkdir(outRoot);
  const root=outRoot,record=(path,value,raw=false)=>exclusiveRecord(root,path,value,raw);
  const effective={...config,runId:run.runId,bootstrapRoot:join(archivePath,'bootstrap/node_modules/@abiogenesis/typescript-tenant'),worksiteRoot:join(archivePath,'sandbox/worksite'),setupEnvironment:setupEnvironment(config)};
  const command=commandRecorder(root,{environment:effective.setupEnvironment,timeoutMs:config.processTimeoutMs,maxOutputBytes:config.maxProcessOutputBytes??16*1024*1024});
  const runtime=await installedModules(effective.bootstrapRoot),manifest=await readJson(join(effective.bootstrapRoot,'product-toolchain-manifest.json'));
  const native=await verifyArtifact(runtime,{artifactPath:config.package.archivePath,manifest,expectedArtifactDigest:config.package.sha256},record,'abg');
  const caller=publicCaller({root,runtime,native,command,record,config:effective});
  caller.state.binding=setup.workspaceBinding;caller.state.closeHandoff=closeHandoff;caller.installedRoot=setup.installations[0].installedRoot;
  const execution={call:await archived('prepared-definition-call.json'),receipt:(await archived('calls/lifecycle-start.outcome.json')).receipt};
  const eventLog=fileURLToPath(closeHandoff.prefix.eventLogRef),identityBefore=await eventResourceIdentity(eventLog);
  const reads=await freshReadbacks(caller,execution);
  const identityAfter=await eventResourceIdentity(eventLog);
  await record('fresh-readback.json',reads);
  const hash=runtime.product.sha256Canonical,archivedReads=await archived('fresh-readback.json');
  // A refused read has no projection; its owner output is compared too. (Corrected after the run: `?? null`, and the owner output rows.)
  const rows=reads.map(read=>{const prior=archivedReads.find(row=>row.memberKey===read.memberKey);
    return {memberKey:read.memberKey,outcomeKind:read.ownerOutput.outcomeKind,status:read.projection?.status??null,
      ownerOutputDigest:hash(read.ownerOutput),archivedOwnerOutputDigest:hash(prior?.ownerOutput??null),ownerOutputEqual:hash(read.ownerOutput)===hash(prior?.ownerOutput??null),
      projectionDigest:hash(read.projection??null),archivedProjectionDigest:hash(prior?.projection??null),projectionEqual:hash(read.projection??null)===hash(prior?.projection??null),
      sourceDigest:hash(read.source??null),archivedSourceDigest:hash(prior?.source??null),
      terminalResult:read.projection?.terminalResult?.result??null,terminalValueDigest:read.projection?.terminalResult?.valueDigest??null}});
  const calls=await readdir(join(root,'calls'));
  return {kind:'d2_cold_reads',archive:archivePath,runId:run.runId,coldRoot:root,process:{pid:process.pid,argv:process.argv,node:process.version},
    closeHandoffDigest:hash(closeHandoff),eventLog,identityBefore,identityAfter,identityUnchanged:JSON.stringify(identityBefore)===JSON.stringify(identityAfter),
    reads:rows,allEqual:rows.length===2&&rows.every(row=>row.projectionEqual&&row.ownerOutputEqual),callRecords:calls.sort()};
}

async function main(args=process.argv.slice(2)) {
  const [mode,...rest]=args,options={};
  for(let i=0;i<rest.length;i++){if(['--config','--archive','--out','--json'].includes(rest[i]))options[rest[i].slice(2)]=rest[++i];else throw new TypeError('Unknown argument: '+rest[i]);}
  if(!['prepare','run','cold-reads'].includes(mode)||!options.config)throw new TypeError('Usage: run-specimen.mjs prepare|run --config FILE | cold-reads --config FILE --archive SEALED_ARCHIVE --out NEW_ROOT --json OUTPUT');
  const config=await configuration(options.config);
  if(mode==='cold-reads') {
    const result=await coldReads(config,resolve(options.archive),resolve(options.out));
    await writeFile(resolve(options.json),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({allEqual:result.allEqual,identityUnchanged:result.identityUnchanged}));return result.allEqual&&result.identityUnchanged?0:1;
  }
  const result=await runSpecimen(config,mode);console.log(JSON.stringify(result));
  return mode==='prepare'?(result.status==='prepared'?0:1):(result.uatPass?0:1);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await main();
