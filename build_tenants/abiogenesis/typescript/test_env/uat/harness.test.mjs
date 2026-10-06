import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import { acquireArchivedScenario, acquireScenario, constructWorkloadInput, fixturePath, loadScenarios, selectScenarios, snapshotScenario } from './scenarios.mjs';
import { commandRecorder, configuration, exclusiveRecord, invokeLifecycle, newArchive } from './runner.mjs';

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
