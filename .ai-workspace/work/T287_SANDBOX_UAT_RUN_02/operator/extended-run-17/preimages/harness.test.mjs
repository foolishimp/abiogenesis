import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import * as product from '../../build/code/src/product/index.js';
import * as abg from '../../build/code/src/abg/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import { consumerDeclaration, IDS } from './consumer.mjs';
import { constructLifecycleCall } from './public-setup.mjs';
import { acquireArchivedScenario, acquireScenario, constructWorkloadInput, fixturePath, loadScenarios, selectScenarios, snapshotScenario } from './scenarios.mjs';
import { commandRecorder, configuration, exclusiveRecord, freshReadbacks, invokeLifecycle, newArchive } from './runner.mjs';

const fixtures=fileURLToPath(new URL('../fixtures/sandbox-uat/',import.meta.url));
const archives=fileURLToPath(new URL('../../../../../.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/',import.meta.url));
test('Seven exact original workloads authenticate source, request and independent oracle before use',async()=>{
  const {root,rows}=await loadScenarios(fixtures);
  for(const row of rows)assert.ok((await acquireScenario(root,row)).sources.length>0);
  assert.equal(selectScenarios(rows,{all:true}).length,7);
  assert.throws(()=>selectScenarios(rows,{caseKey:'invented'}));
  const altered={...rows[0],acquisitionDigests:rows[0].acquisitionDigests.map((pin,i)=>i===0?{...pin,digest:'sha256:'+'0'.repeat(64)}:pin)};
  await assert.rejects(acquireScenario(root,altered),/Acquisition digest mismatch/u);
  assert.throws(()=>fixturePath(root,'../foreign'),'Fixture paths must stay owned');
});
test('Resolved toolchain identity and configured environment flow into the canonical owner carrier',async()=>{
  const {root,rows}=await loadScenarios(fixtures),selected=await acquireScenario(root,rows.find(row=>row.key==='data-mapper-full'));
  const request=structuredClone(selected.request);request.testing.commands[0].environment.JAVA_HOME='/old/source/jdk';
  const received=[];
  const input=constructWorkloadInput({constructGovernanceWorkState:value=>{received.push(value);return value;}},{...selected,request},{},
    {sbt:{executable:'/selected/sbt',environment:{JAVA_HOME:'/selected/jdk'}}});
  assert.equal(input.testing.commands[0].executable,'/selected/sbt');
  assert.equal(input.testing.commands[0].environment.JAVA_HOME,'/selected/jdk');
  assert.deepEqual(input.sources,selected.sources.map(({path,digest})=>({path,digest})));
  assert.deepEqual(input.requiredSupportRefs,request.requiredSupportRefs);
  assert.equal(received.length,1);
});
test('Archive paths are unique and failed subprocess streams survive before any assertion or teardown',async()=>{
  const first=await newArchive(archives,'archive-negative'),second=await newArchive(archives,'archive-negative');
  assert.notEqual(first.path,second.path);
  await exclusiveRecord(first.path,'identity.json',{scenario:'archive-negative'});
  await assert.rejects(exclusiveRecord(first.path,'identity.json',{overwritten:true}),error=>error.code==='EEXIST');
  const command=commandRecorder(first.path,{environment:{PATH:process.env.PATH},timeoutMs:10000});
  const failure=await command('actual-failure',process.execPath,['-e','process.stdout.write("retained-out");process.stderr.write("retained-error");process.exit(7);']);
  assert.equal(failure.exitCode,7);
  assert.equal(await readFile(join(first.path,'commands/actual-failure.stdout'),'utf8'),'retained-out');
  assert.equal(await readFile(join(first.path,'commands/actual-failure.stderr'),'utf8'),'retained-error');
});
test('Archived judgment conserves acquired module, manifest and rubric despite later ambient edits; tampering refuses',async()=>{
  const original=await loadScenarios(fixtures),row=selectScenarios(original.rows,{caseKey:'basic-cli'})[0];
  const acquired=await acquireScenario(original.root,row);
  const archive=await newArchive(archives,'oracle-drift'),ambient=join(archive.path,'ambient'),worksiteRoot=join(archive.path,'worksite');
  await mkdir(ambient);await mkdir(worksiteRoot);
  await writeFile(join(ambient,'scenarios.json'),original.manifestBytes,{flag:'wx'});
  for(const asset of acquired.assets) {
    const path=fixturePath(ambient,asset.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,asset.bytes,{flag:'wx'});
  }
  for(const source of acquired.sources) {
    const path=fixturePath(worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});
  }
  const selectedFixtures=await loadScenarios(ambient),selected=await acquireScenario(ambient,row);
  const input={worksiteRoot,runArchive:archive.path,source:row,request:selected.request,events:[]};
  const expected=await (await import(pathToFileURL(fixturePath(original.root,row.oracleModule)).href)).evaluate(input);
  // Change every ambient acceptance reader after acquisition and before the
  // snapshot. The snapshot must use held authenticated bytes, not rereads.
  await writeFile(fixturePath(ambient,row.oracleModule),'export async function evaluate(){return {disposition:"satisfied",reason:"ambient module replacement"};}\n');
  const changedRubric=JSON.parse(selected.assets.find(asset=>asset.path===row.oracleFile).bytes.toString('utf8'));
  changedRubric.requiredArtifacts.push('ambient-only-criterion.md');
  await writeFile(fixturePath(ambient,row.oracleFile),JSON.stringify(changedRubric)+'\n');
  await writeFile(join(ambient,'scenarios.json'),'{}\n');
  const snapshot=await snapshotScenario(selectedFixtures,selected,archive.path);
  assert.deepEqual(await readFile(join(snapshot.root,'scenarios.json')),original.manifestBytes);
  assert.equal(snapshot.assets.length,row.acquisitionDigests.length);
  const archived=await acquireArchivedScenario(snapshot);
  const checker=await import(pathToFileURL(fixturePath(snapshot.root,archived.row.oracleModule)).href);
  assert.deepEqual(await checker.evaluate(input),expected);
  assert.equal(expected.criteria.some(criterion=>criterion.id==='artifact:ambient-only-criterion.md'),false);
  await assert.rejects(acquireScenario(ambient,row),/Acquisition digest mismatch/u);
  await writeFile(fixturePath(snapshot.root,row.oracleFile),JSON.stringify(changedRubric)+'\n');
  await assert.rejects(acquireArchivedScenario(snapshot),/Acquisition digest mismatch/u);

  const config=await configuration(fileURLToPath(new URL('./config.example.json',import.meta.url)));
  for(const [name,sourceCommit] of [['absent',undefined],['blank','   ']]) {
    const path=join(archive.path,name+'.config.json');await writeFile(path,JSON.stringify({...config,sourceCommit})+'\n',{flag:'wx'});
    await assert.rejects(configuration(path),/Explicit nonempty sourceCommit/u);
  }
});
test('Both retained install roots are checked before dispatch and before fresh reads; missing or false owner results refuse',async()=>{
  // Controlled Product checker outputs exercise the caller barrier. The
  // independent review separately proves the real exported byte checker.
  const installations=['abg','consumer'].map(name=>({installId:name,installedRoot:'/controlled/'+name,
    packageName:name,productId:'product://controlled/'+name,admissionEventRef:'event://controlled/'+name,
    artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),manifestDigest:'sha256:'+'3'.repeat(64)}));
  for(const failure of [null,...['before-run','after-run'].flatMap(phase=>['abg','consumer'].map(installId=>({phase,installId,value:false}))),
    {phase:'after-run',installId:'consumer',value:undefined}]) {
    const steps=[],records=[];let phase='before-run',freshReaderExecuted=false;
    const caller={installedRoot:installations[0].installedRoot,
      runtime:{product:{async installedProductContentMatches(install){
        assert.ok(installations.includes(install));steps.push('check:'+phase+':'+install.installId);
        return failure?.phase===phase&&failure.installId===install.installId?failure.value:true;
      }}},
      async record(path,record){steps.push('record:'+record.phase);records.push({path,record});},
      async invoke(label){assert.equal(label,'lifecycle-start');steps.push('dispatch');phase='after-run';return {kind:'controlled-completion'};}};
    const consume=async()=>{const result=await invokeLifecycle(caller,installations,{kind:'controlled-call'},{});steps.push('fresh-read');freshReaderExecuted=true;return result;};
    if(failure) {
      await assert.rejects(consume(),error=>error.stage==='installed-content-'+failure.phase);
      assert.equal(freshReaderExecuted,false);
      assert.equal(steps.includes('dispatch'),failure.phase==='after-run');
      assert.equal(records.at(-1).record.observations.find(row=>row.installId===failure.installId).contentMatches,false);
    }else {
      assert.deepEqual(await consume(),{kind:'controlled-completion'});
      assert.equal(freshReaderExecuted,true);
    }
    const expected=['check:before-run:abg','check:before-run:consumer','record:before-run'];
    if(failure?.phase!=='before-run')expected.push('dispatch','check:after-run:abg','check:after-run:consumer','record:after-run');
    if(!failure)expected.push('fresh-read');
    assert.deepEqual(steps,expected);
    assert.equal(records.every(row=>row.record.observations.length===2),true);
  }
});

async function rustServiceMechanicalFixture(t) {
  const scratch=await realpath(await mkdtemp(join(tmpdir(),'abi5-uat-rust-oracle-')));
  t.after(()=>rm(scratch,{recursive:true,force:true}));
  const {root,rows}=await loadScenarios(fixtures),row=rows.find(row=>row.key==='rust-service'),selected=await acquireScenario(root,row);
  const rubric=JSON.parse(selected.assets.find(asset=>asset.path===row.oracleFile).bytes.toString('utf8'));
  const joinedSource='import path from "node:path";\nconst SOURCE=path.join(WORKSITE,"src","service.rs");\n';
  for(const source of selected.sources) {
    const path=fixturePath(scratch,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});
  }
  for(const artifact of rubric.requiredArtifacts) {
    const path=fixturePath(scratch,artifact);await mkdir(dirname(path),{recursive:true});
    await writeFile(path,rubric.requiredTestFiles.includes(artifact)?joinedSource:'controlled artifact-existence premise\n',{flag:'wx'});
  }
  // Only owner validation is a controlled premise for this pure evaluator
  // test. These data are never executed or admitted, and supply no semantic
  // UAT judgment. Retained real C2 evidence is re-evaluated separately.
  const owner={graphFunctionRef:product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
    outputContractRef:product.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,resultClass:'success',runId:'run://controlled/oracle'};
  const commands=selected.request.testing.commands.map(command=>({...command,
    environment:Object.entries(command.environment??{}).map(([name,value])=>({name,value}))}));
  const value={kind:'worksite_command_execution_observation',observationRef:'worksite-command-observation://controlled/oracle',
    task:{commands},commandResults:commands.map(command=>({...command,kind:'worksite_command_result',reports:[],
      observationRef:'worksite-command-result://controlled/'+command.commandId,observationDigest:product.sha256Canonical(command),
      timedOut:false,terminationConfirmed:true,exitStatus:0,
      stdout:{encoding:'base64',payload:Buffer.from('# pass 4\n# fail 0\n').toString('base64')},stderr:{encoding:'base64',payload:''}}))};
  const cCallRef='c-call:controlled-oracle',event={kind:'c_call_result_admitted',graphFunctionRef:owner.graphFunctionRef,runId:owner.runId,
    aggregateId:cCallRef,payload:{contractRef:owner.outputContractRef,resultClass:'success',valueKind:value.kind,cCallRef,value}};
  const checker=await import(pathToFileURL(fixturePath(root,row.oracleModule)).href);
  const input={worksiteRoot:scratch,runArchive:scratch,source:row,request:selected.request,events:[event],observationOwner:owner,validateObservation:()=>true};
  return {scratch,row,selected,rubric,joinedSource,event,input,evaluate:overrides=>checker.evaluate({...input,...overrides})};
}

test('Rust-service mechanical oracle preserves coordinate spelling independence without inventing semantic UAT',async t=>{
  const fixture=await rustServiceMechanicalFixture(t),joined=await fixture.evaluate();
  assert.equal(joined.disposition,'satisfied');
  assert.equal(joined.criteria.some(row=>row.id.startsWith('service-test-contract:')),false);
  for(const path of fixture.rubric.requiredTestFiles)await writeFile(fixturePath(fixture.scratch,path),
    '// rustc src/service.rs 127.0.0.1 fetch( status Hello, world!\n'+fixture.joinedSource);
  assert.deepEqual(await fixture.evaluate(),joined);
  assert.equal(Object.hasOwn(fixture.input,'assessment'),false);
  // Magic role words cannot replace the missing admitted execution premise.
  const absent=await fixture.evaluate({events:[]});
  assert.equal(absent.disposition,'indeterminate');
  assert.equal(absent.criteria.find(row=>row.id==='original-test-floor').disposition,'indeterminate');
});

test('Rust-service mechanical oracle conserves admission, execution, source, artifact and pass-floor guards',async t=>{
  const fixture=await rustServiceMechanicalFixture(t);
  assert.equal((await fixture.evaluate()).disposition,'satisfied');
  for(const override of [{events:[]},{observationOwner:{...fixture.input.observationOwner,runId:'run://controlled/foreign'}},
    {validateObservation:()=>false}])assert.equal((await fixture.evaluate(override)).disposition,'indeterminate');
  const failed=structuredClone(fixture.event);failed.payload.value.commandResults[0].exitStatus=7;
  const failure=await fixture.evaluate({events:[failed]});
  assert.equal(failure.disposition,'unmet');
  assert.equal(failure.criteria.find(row=>row.id.startsWith('execution:')).disposition,'unmet');
  const shallow=structuredClone(fixture.event);shallow.payload.value.commandResults.at(-1).stdout.payload=Buffer.from('# pass 1\n').toString('base64');
  const belowFloor=await fixture.evaluate({events:[shallow]});
  assert.equal(belowFloor.disposition,'unmet');
  assert.equal(belowFloor.criteria.find(row=>row.id==='original-test-floor').disposition,'unmet');
  const protectedSource=fixture.selected.sources[0],sourcePath=fixturePath(fixture.scratch,protectedSource.path);
  await writeFile(sourcePath,Buffer.concat([protectedSource.bytes,Buffer.from('\nchanged\n')]));
  const changed=await fixture.evaluate();
  assert.equal(changed.disposition,'unmet');
  assert.equal(changed.criteria.find(row=>row.id==='original-source:'+protectedSource.path).disposition,'unmet');
  await writeFile(sourcePath,protectedSource.bytes);
  const missing=fixture.rubric.requiredArtifacts[0];await rm(fixturePath(fixture.scratch,missing));
  const incomplete=await fixture.evaluate();
  assert.equal(incomplete.disposition,'unmet');
  assert.equal(incomplete.criteria.find(row=>row.id==='artifact:'+missing).disposition,'unmet');
});

test('Caller run-environment support is canonical, strictly contained and admitted by the existing resource owner',async t=>{
  const scratch=await realpath(await mkdtemp(join(tmpdir(),'abi5-uat-caller-environment-')));
  t.after(()=>rm(scratch,{recursive:true,force:true}));
  const archiveRoot=join(scratch,'archive');await mkdir(archiveRoot);
  const hash=product.sha256Canonical,artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,
    packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:hash('controlled-artifact'),
    productContentDigest:hash('controlled-content'),productManifestDigest:hash('controlled-manifest')};
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(artifact);
  const publication=consumerDeclaration(gtl,product,library,12),program=publication.programs[0];
  const graphFunctions=[...publication.graphFunctions,...gtl.constructNativeWorkspaceWorkModulePublication(artifact).graphFunctions,
    ...gtl.constructWorksiteCommandExecutionModulePublication(artifact).graphFunctions];
  const actorRef='actor://controlled/uat-caller',authority={actorRef,authorityRef:'authority://controlled/uat-caller',authorityDigest:hash('controlled-authority')};
  const packet=product.RUN_OPERATION_CONTRACTS.invoke.start;
  // Resolution, authority and Public transport are controlled premises. The
  // actual caller, canonical resources constructor and containment owner run.
  let supplied;
  const caller={root:scratch,installedRoot:fileURLToPath(new URL('../../',import.meta.url)),actorRef,config:{runId:'controlled-environment'},
    state:{binding:{ref:'binding://controlled',digest:hash('binding')},resolvedLock:{lockId:'lock://controlled',lockDigest:hash('lock')},
      catalog:{basisDigest:hash('catalog'),boundPublications:[publication]},catalogView:{viewDigest:hash('view'),allowlist:[IDS.graphFunctionRef]}},
    native:{verified:{definitionContractCoordinates:{operations:[{operationId:packet.definitionKey.operationId,
      members:[{memberKey:packet.definitionKey.memberKey,slots:{request:{contractCatalog:null}}}]}]}}},
    runtime:{product:{...product,
      ProductExecutionResolutionPort:{async resolve(){return {kind:'loaded_product_execution_resolution',productSemantics:null,program,
        programValidation:{executableLeafRows:[]},selectedCatalogEntry:null,
        resolution:{inputContract:{contractRef:'contract://controlled/input'},inputContractDigest:hash('input-contract'),
          programRef:program.programRef,programDigest:hash(program)}};}},
      admitInstalledProductInput:()=>true,
      constructRootInvocationPolicy:()=>({policyRef:'policy://controlled',policyDigest:hash('policy')}),
      constructCapabilityGrant:()=>({grantRef:'grant://controlled',grantDigest:hash('grant')}),
      constructInvocationAuthority:()=>authority},
      abg:{hasAdmittedProductInstall:()=>true},api:{constructInstalledPublicDefinitionCall(value){supplied=value;return value;}}},
    refresh:()=>({productInstalls:[],workspaceBinding:{roots:{archiveRoot}}}),reopen:()=>({kind:'controlled-event-resource'})};
  await constructLifecycleCall(caller,{kind:'controlled-input'});
  const resources=supplied.resources.runEnvironmentResources,temporaryRoot=resources.temporaryRoot;
  assert.notEqual(temporaryRoot,archiveRoot);
  assert.equal(temporaryRoot,await realpath(join(archiveRoot,'run-environment-support')));
  assert.equal((await stat(temporaryRoot)).isDirectory(),true);
  assert.equal(resources.permission.temporaryRoot,temporaryRoot);
  const input={publication,program,graphFunctions,authority,archiveRoot,resources};
  assert.equal((await product.observeRunEnvironment(input)).kind,'run_environment_observed');
  for(const forbiddenRoot of [archiveRoot,scratch]) {
    const denied=structuredClone(resources);denied.temporaryRoot=forbiddenRoot;denied.permission.temporaryRoot=forbiddenRoot;
    const observed=await product.observeRunEnvironment({...input,resources:product.constructRunEnvironmentResources(denied)});
    assert.deepEqual(observed,{kind:'run_environment_refusal',cause:'access_not_permitted',issuePath:'/runEnvironmentResources/permission'});
  }
});

test('Native refusal without an admitted Run is preserved before any refresh, reopen or read',async()=>{
  const touched=()=>assert.fail('No runtime or read activity is permitted without an admitted Run');
  const caller={get runtime(){return touched();},refresh:touched,reopen:touched,invoke:touched};
  const ownerOutput={outcomeKind:'refusal',value:{code:'invalid_capability',issuePaths:['/invocationAuthority'],evidenceRefs:[]}};
  await assert.rejects(freshReadbacks(caller,{receipt:{resources:{run:null},ownerOutput}}),error=>{
    assert.equal(error.stage,'lifecycle-start');assert.deepEqual(error.observation,ownerOutput);return true;
  });
  await assert.rejects(freshReadbacks(caller,{receipt:{resources:{run:null},ownerOutput:{outcomeKind:'result',value:null}}}),error=>{
    assert.equal(error.stage,'readback-source');assert.equal(error.observation,'No admitted Run coordinate');return true;
  });
});

test('Admitted failed and blocked Runs retain both fresh reads and unchanged event bytes',async t=>{
  const scratch=await realpath(await mkdtemp(join(tmpdir(),'abi5-uat-caller-readbacks-')));
  t.after(()=>rm(scratch,{recursive:true,force:true}));
  const hash=product.sha256Canonical;
  for(const status of ['failed','blocked']) {
    const eventPath=join(scratch,status+'.events.jsonl'),bytes=Buffer.from('controlled admitted '+status+' Run premise\n');
    await writeFile(eventPath,bytes,{flag:'wx'});
    const prefix={eventLogRef:pathToFileURL(eventPath).href,coordinateDigest:hash(status)},calls=[];
    // Run admission and Public projection are controlled premises. The actual
    // two-read caller uses canonical read packets and checks physical bytes.
    const caller={root:scratch,installedRoot:'/controlled/installed',actorRef:'actor://controlled/readback',config:{runId:status},
      state:{binding:{ref:'binding://controlled',digest:hash('binding')},closeHandoff:{prefix}},native:{verified:{definitionContractCoordinates:null}},contractCatalog:null,
      runtime:{product:{...product,constructCapabilityGrant:()=>({grantRef:'grant://controlled',grantDigest:hash('grant')})},abg,
        api:{constructInstalledPublicDefinitionCall:value=>value}},
      refresh:()=>({workspaceAuthorityBasis:null,productInstalls:[],workspaceBinding:{lockId:'lock://controlled',lockDigest:hash('lock')}}),
      reopen:()=>({kind:'controlled-event-resource'}),
      async invoke(memberKey,call){
        calls.push({memberKey,call});
        return {receipt:{ownerOutput:memberKey==='run_result'?{outcomeKind:'refusal',value:{code:'absent_terminal_result'}}:
          {outcomeKind:'result',value:{projection:{status,terminalResult:null}}}}};
      }};
    const ownerOutput=status==='failed'?{outcomeKind:'refusal',value:{code:'controlled_failure'}}:
      {outcomeKind:'result',value:{kind:'governance_work_state',terminal:false}};
    const run={ref:'run://controlled/'+status,digest:hash(status)};
    const execution={receipt:{exitCode:1,resources:{run},ownerOutput},call:{invocation:{invocationAuthority:{slots:{}}}}};
    const reads=await freshReadbacks(caller,execution);
    assert.deepEqual(calls.map(row=>row.memberKey),['run_result','run_replay']);
    assert.equal(reads.length,2);assert.equal(reads[0].ownerOutput.outcomeKind,'refusal');assert.equal(reads[1].projection.status,status);
    for(const {memberKey,call}of calls) {
      assert.equal(call.operationId,abg.ABG_PROJECT_READ_CONTRACTS[memberKey].definitionKey.operationId);
      assert.deepEqual(call.request.source,{sourceKind:'run',sourceRef:run.ref,sourceDigest:run.digest});
    }
    assert.deepEqual(await readFile(eventPath),bytes);assert.deepEqual(caller.state.closeHandoff.prefix,prefix);
  }
});
