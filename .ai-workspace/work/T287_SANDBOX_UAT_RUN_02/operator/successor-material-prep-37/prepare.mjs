import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,lstat,realpath,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const phase=work+'/operator/successor-material-prep-37',prior=work+'/operator/successor-continuation-prep-33',operator=work+'/operator/installed-successor-execution-34',candidate=work+'/candidate-16';
const archive=tenant+'/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-07T00-36-16-801Z-aba03409-467d-452b-a547-b87a81db6f45',worksite=archive+'/sandbox/worksite';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const pin=async path=>{const status=await lstat(path);assert(status.isFile()&&!status.isSymbolicLink(),path);assert.equal(await realpath(path),path);const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};
const record=async(path,value)=>writeFile(path,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const fixed=[
 [repo+'/stdo_abiogenesis.json','eafbb85e640bd007b1e5b94bdc13ab4eb470c8dedaa3ae1a3b586687daf6869c',4277],
 [candidate+'/identity.json','d6acfc2842b9e683fc0a3be2add5dc03f9d351c4ab3079f223c30ad2b2897ced',10843],
 [candidate+'/freeze.json','411d6cf1c31976207caa67aced69effd287c478efd4d1bdc7a99cfa971313375',14898],
 [candidate+'/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz','c6a8e51bdcfba28324b3158e5805510631548ea80af2374c41c19c2f03870ea0',10623969],
 [operator+'/return.md','3a997ee7f672242a25d910375867cbdec850f615ee753aa682d934f7990a6c0f',2280],
 [operator+'/observations.json','b0be01e49bb594b81c94d4ccd6b68727077af99683187166b8f252d758fb517a',115663],
 [operator+'/execution-freeze.json','6df05d0c60fe316ced2474e854c8856b25b33f1f655b218fe2ee09f5d89214e0',103547],
 [operator+'/stop-observation.json','ee464c05e3bd006759360276d68a478b51ea86559fe7ffcf1b6a537d989ba494',1929],
 [prior+'/config.json','97ba2c81dc29f04f2825b5a8272a73ed57980b8daf2ce49e8ec62f443b42790e',2969],
 [prior+'/freeze.json','91a2c79229387e999d6689d876ce5905552432459acae801361a4232be890cae',7300],
 [tenant+'/test_env/fixtures/sandbox-uat/scenarios.json','fae3231bad472ece6cf9e012921b73ffeb23773178f235f2762f16af05ce0d18',34763],
 [tenant+'/test_env/fixtures/sandbox-uat/independent-oracle.mjs','725134872e906561faf0f70b95091e19019aac121e36b4a86e7158de3bf71bdd',23452],
 [tenant+'/test_env/fixtures/sandbox-uat/data-mapper-full/request.json','d583dedab8ac5d7c94ccbed10431e8e078a8e3497ec6814fe75f24cd29219f43',77648]
].map(([path,sha256,byteCount])=>({path,sha256,byteCount}));
for(const expected of fixed)assert.deepEqual(await pin(expected.path),expected);
const old=await json(operator+'/observations.json'),oldFreeze=await json(operator+'/execution-freeze.json'),template=await json(prior+'/config.json');
assert.equal(old.archive,archive);assert.equal(oldFreeze.archive,archive);
const {configuration,acquireResumeMaterial,applyCommandTimeoutOverrides}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const {loadScenarios,acquireScenario,constructWorkloadInput,digest}=await import(pathToFileURL(tenant+'/test_env/uat/scenarios.mjs').href);
const {assessmentSelection}=await import(pathToFileURL(tenant+'/test_env/uat/consumer.mjs').href);
const fixtures=await loadScenarios(template.fixtureRoot),selectedCases=[];
for(const row of fixtures.rows)selectedCases.push(await acquireScenario(fixtures.root,row));
assert.equal(selectedCases.length,7);
const selected=selectedCases.find(value=>value.row.key==='data-mapper-full');
assert(selected);assert.equal(selected.sources.length,4);
const originalPaths=new Set(selected.sources.map(value=>value.path));
const granted=new Set(Object.values(selected.request.workOrders).flatMap(order=>order.writeRoots??[]));
assert.equal(old.retainedAuthorFiles.length,41);assert.equal(new Set(old.retainedAuthorFiles.map(v=>v.path)).size,41);
assert.equal(old.lastNativeAfterPhysicalChecks.length,45);
const expectedMaterial=new Set([...originalPaths,...old.retainedAuthorFiles.map(v=>v.path)]);
assert.equal(expectedMaterial.size,45);
assert.deepEqual([...expectedMaterial].sort(),old.lastNativeAfterPhysicalChecks.map(v=>v.relativePath).sort());
const materialRows=[];
for(const item of old.lastNativeAfterPhysicalChecks){
 assert.equal(item.path,worksite+'/'+item.relativePath);assert.equal(item.nativeAfterMatches,true);
 const held=await pin(item.path);assert.equal(held.sha256,item.sha256);assert.equal(held.byteCount,item.byteCount);
 const historic=oldFreeze.ledger.find(v=>v.path===item.path);assert(historic,item.path);assert.deepEqual(held,historic);
 if(originalPaths.has(item.relativePath)){
  const source=selected.sources.find(v=>v.path===item.relativePath);assert.equal('sha256:'+held.sha256,source.digest);assert.equal(held.byteCount,source.bytes.length);
 }else{
  assert(granted.has(item.relativePath),item.relativePath);
  const author=old.retainedAuthorFiles.find(v=>v.path===item.relativePath);assert.equal(author.sha256,held.sha256);assert.equal(author.byteCount,held.byteCount);
 }
 materialRows.push(held);
}
const controlPaths=['SEALED.json','run.json','workload-source.json'].map(name=>archive+'/'+name);
for(const path of controlPaths){const expected=oldFreeze.ledger.find(v=>v.path===path);assert(expected,path);const held=await pin(path);assert.deepEqual(held,expected);materialRows.push(held);}
const eventPin=oldFreeze.eventStore;
assert.equal(eventPin.path,archive+'/resources/events/runtime.events.jsonl');assert.equal(eventPin.sha256,'03147e0ec30ee4c5b935c9b6a6d6de5ed4283d6614d8658194ebe24ef9798ba9');assert.equal(eventPin.byteCount,816181362);
materialRows.push(eventPin);assert.equal(materialRows.length,49);
const workload=await json(archive+'/workload-source.json');
assert.deepEqual(workload,{sourceMembers:selected.sources.map(({bytes,...source})=>({...source,byteCount:bytes.length})),request:selected.request,legacyInterpretation:selected.row.legacyInterpretation});
const accounting=old.retainedAuthorFiles.find(v=>v.path.endsWith('/AccountingVerifier.scala'));
assert.equal(accounting.sha256,'7ff8d8b73d7acd7138f69007463b4dea869837292c78dfbf1aa91935b3e8ee9c');assert.equal(accounting.byteCount,2083);
await record(phase+'/activation.json',{role:'Writer37 supplied-material preparation only',ProductFrame:'fixed15 ABI5 5.0 GOAL035/T287; full original external DataMapper UAT',method:'STDO2.5.1-rc.2 manifest3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782',frames:['repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-worksite-causality','repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration'],packageAcceptance:'ACCEPTED by Root CLOSED Source36+Proof36 conjunction on exact candidate16 identity/freeze',closedPublicationRefs:{source:'Source36 CLOSED GO mailbox return to Root',proof:'Proof36 CLOSED GO mailbox return to Root',identity:fixed[1],freeze:fixed[2]},executionAuthorized:false,path:'frozen native after material -> existing acquireResumeMaterial -> fresh SourceNone supplied-work input; actual transfer/install/Run held',ownerRoutes:['accepted Source33+Proof33 physical-transfer mechanism','runner.mjs acquireResumeMaterial/transferResumeMaterial','public-setup.mjs constructLifecycleCall source:none','original request/grants/oracle; Root continuation decision'],effectTerritory:[phase],selectedPins:fixed,source34HashTypoResolvedToActualReceipt:true,oldStoreCopyOrReplay:false,sourceOrAppChanges:false});
await record(phase+'/material-observation.json',{role:'Writer37 external supplied-material observation',archive,retainedAuthorFiles:old.retainedAuthorFiles.map(({path,byteCount})=>({path,byteCount})),provenance:{operator34Observation:fixed[5],operator34Freeze:fixed[6],operator34Stop:fixed[7],lastNativeOrdinal:old.lastLawfulCut.nativeOrdinal,lastNativeResult:old.lastLawfulCut.nativeResult,lastParentOrdinal:old.lastLawfulCut.parentOrdinal,lastParentResult:old.lastLawfulCut.parentResult,originalGrantRequest:fixed[12],physicalAfterRowsAuthenticatedByOperator34:true},counts:{originals:4,authors:41,currentSelectedMaterial:45},accountingCurrentBytes:accounting,setupManifestExcluded:true,suppliedMaterialOnly:true,oldObservationsImported:false,oldSynthesisImported:false,oldProducerCreditImported:false,oldEightDetectionRestorationCreditImported:false});
const observation=await pin(phase+'/material-observation.json');
await record(phase+'/material-freeze.json',{role:'Writer37 literal supplied-material acquisition ledger',archive,observation,ledger:materialRows,originalCount:4,authorCount:41,sourceTruthImported:false,workloadSourceHistoricalConservationClaim:true,wholeStoreCopiedOrReplayed:false,eventStoreRevalidation:'existing acquireResumeMaterial streamed digest, before readiness closure'});
const materialFreeze=await pin(phase+'/material-freeze.json');
const config=structuredClone(template);
config.package={archivePath:fixed[3].path,sha256:'sha256:'+fixed[3].sha256};
config.resumeEvidence={observation:{path:observation.path,digest:'sha256:'+observation.sha256},freeze:{path:materialFreeze.path,digest:'sha256:'+materialFreeze.sha256}};
await record(phase+'/config.json',config);
const loaded=await configuration(phase+'/config.json');
const clock=performance.now(),material=await acquireResumeMaterial(loaded,archive,selected),acquisitionWallMs=performance.now()-clock;
assert.equal(material.originals.length,4);assert.equal(material.authorFiles.length,41);
const packaged=candidate+'/scratch/successor/package';
const product=await import(pathToFileURL(packaged+'/build/code/src/product/index.js').href);
const c2=await import(pathToFileURL(packaged+'/build/code/src/product/worksite_command_execution.js').href);
const effectiveRequest=applyCommandTimeoutOverrides(selected.request,config.commandTimeoutOverrides);
const input=constructWorkloadInput(product,{...selected,request:effectiveRequest},assessmentSelection,config.toolchains);
assert.deepEqual(input.observations,[]);assert.equal(input.synthesis,null);assert.equal(input.terminal,false);
const budget=c2.projectWorksiteCommandExecutionBudget(input.original.testing);
assert.equal(budget.requiredExecutionBudgetMs,18015000);assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,config.provider));
assert.equal(config.processTimeoutMs,18060000);assert.equal(config.maxProcessOutputBytes,268435456);assert.equal(config.recursionBound,1000);
assert.equal(config.provider.inactivityTimeoutMs,18030000);assert.equal(config.provider.absoluteTimeoutMs,18040000);assert.equal(config.provider.maxTurns,undefined);assert.equal(config.provider.maxBudgetUsd,undefined);
function diff(a,b,path=[]){
 if(Array.isArray(a)||Array.isArray(b)){assert(Array.isArray(a)&&Array.isArray(b));return JSON.stringify(a)===JSON.stringify(b)?[]:[{path,before:a,after:b}];}
 if(a&&b&&typeof a==='object'&&typeof b==='object'){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort());return Object.keys(a).flatMap(key=>diff(a[key],b[key],[...path,key]));}
 return a===b?[]:[{path,before:a,after:b}];
}
const changes=diff(template,config);
assert.deepEqual(changes.map(v=>v.path.join('.')).sort(),['package.archivePath','package.sha256','resumeEvidence.observation.path','resumeEvidence.observation.digest','resumeEvidence.freeze.path','resumeEvidence.freeze.digest'].sort());
const assetRows=new Map();for(const acquired of selectedCases)for(const asset of acquired.assets)assetRows.set(asset.path,{path:fixtures.root+'/'+asset.path,sha256:asset.digest.slice(7),byteCount:asset.byteCount});
await record(phase+'/config-acquisition.json',{configurationAccepted:true,existingAcquireResumeMaterialAccepted:true,acquisitionWallMs,material:{originals:4,authors:41,rows:49,fromArchive:archive},all49RowsLiteralRegularNonsymlink:true,streamedStoreDigestValidated:eventPin,allSevenScenarioAcquisitionsAccepted:selectedCases.map(v=>({key:v.row.key,assetCount:v.assets.length})),allAcquiredFixturePins:[...assetRows.values()],manifest:{digest:fixtures.manifestDigest,byteCount:fixtures.manifestBytes.length},onlySixSelectedConfigFieldsChanged:changes,allOtherFieldsDeepEqual:true,originalWholeWorkloadValueExact:true,freshInput:{observations:0,synthesis:null,terminal:false,originalCanonicalDigest:product.sha256Canonical(input.original)},sourceNoneOwner:'existing constructLifecycleCall request.sourceBasis kind:none + resources.source kind:none; no call constructed/admitted in preparation',budget,canonicalBudgetOwner:'packaged product/worksite_command_execution.js projectWorksiteCommandExecutionBudget/worksiteCommandExecutionBudgetFits',canonicalBudgetFits:true,accountingCurrentMutantBytesPreserved:true,transferExecuted:false,nativeEffects:false,packageAccepted:true});
const configPin=await pin(phase+'/config.json');
await record(phase+'/setup.json',{role:'Writer37 supplied-material preparation',executionAuthorized:false,publicationAcceptance:'ACCEPTED Root CLOSED Source36+Proof36 exact identity/freeze',launch:{executable:config.nodePath,args:['scripts/sandbox-uat.mjs','resume','--from',archive,'--config',configPin.path,'--case','data-mapper-full'],cwd:tenant},recording:{owner:'existing commandRecorder',timeoutMs:19260000,maxOutputBytes:536870912,basis:'setup/recording drainage only; never native execution authority extension'},executionAuthority:{overallT0:'2026-10-06T20:52:43.725Z',firstFiveHourQualityCheckpointUTC:'2026-10-07T01:52:43.725Z',rootContinuedAtUTC:'2026-10-07T01:51:28Z',operatorAcknowledgedAtUTC:'2026-10-07T01:52:06.903Z',currentExternalQualityCheckpointUTC:'2026-10-07T06:52:43.725Z',currentExternalQualityCheckpointSydney:'2026-10-07T17:52:43.725+11:00',clockReset:false,newNativeStartObservation:'NEW commands/lifecycle-start.request.json.started immediately before CLI spawn, reported without resetting originalT0',rootExternalExecutiveDecidesContinueOrStop:true},stop:{owner:'existing native C2/helper/provider process supervision',order:['While CLI lives resolve exact admitted C2 occurrence/task/attempt to launch.json/helper argv; match live helper and detached command PID/PGID via ancestry.','At Root stop/checkpoint disposition stop only exact owned helper/command first: TERM, bounded confirmation/grace, KILL only if still exact-owned; preserve real missing artifact/exit.','Resolve exact current admitted provider PID/PGID, verify identity immediately, then stop only that owned group while CLI remains alive.','Allow real exit/failure admission/drain; retain fresh-read presence/absence and raw truncation/exit truth.'],noGuessedPidsOrPrivateEvents:true},resume:{fromArchive:archive,originalFiles:4,retainedAuthorFiles:41,materialRows:49,source:'none',observations:[],synthesis:null,terminal:false,oldProducerParentCredit:false,oldEightMutationCredit:false,operatorAppEditsOrRestoration:false,oldSetupManifestCopied:false},limits:{effectiveCommandTimeoutMs:18000000,terminationGraceMs:10000,canonicalRequiredBudgetMs:18015000,inactivityMs:18030000,absoluteMs:18040000,driverMs:18060000,recorderMs:19260000,nativeMaxOutputBytes:268435456,recorderMaxOutputBytes:536870912,recursionBound:1000,optionalTurnAndUsdCapsOmitted:true},originalFullCriteriaAndOracleUnchanged:true});
for(const expected of [...fixed,...materialRows.filter(v=>v.path!==eventPin.path)])assert.deepEqual(await pin(expected.path),expected);
const evidence=Object.fromEntries(await Promise.all(['config.json','material-observation.json','material-freeze.json','setup.json','config-acquisition.json','activation.json'].map(async name=>[name,await pin(phase+'/'+name)])));
await record(phase+'/readiness.json',{role:'Writer37',status:'FROZEN_PREPARATION_PENDING_SOURCE37_PROOF37_AND_EXECUTION_RELEASE',publicationAccepted:true,executionAuthorized:false,evidence,candidateIdentity:fixed[1],candidateFreeze:fixed[2],package:fixed[3],source34:fixed.slice(4,8),checks:{configurationAccepted:true,existingAcquireResumeMaterialAccepted:true,material49Validated:true,original4Conserved:true,originalGrantAllowsAll41NativeFiles:true,allSevenScenarioAcquisitionsExact:true,onlySixConfigFieldsChanged:true,sourceNoneEmptyObservationsNullSynthesis:true,canonical18MCommandBudgetFits:true,accountingBytesPreserved:true,current06_52QualityCheckpointAndOriginalT0Retained:true},acquisitionWallMs,oldNativeProofImported:false,buildPackInstallProviderTransferNativeEffects:0,remaining:'Independent Source37/Proof37 preparation review and explicit Executive native release; no runtime/UAT/recovery credit.'});
const readinessPin=await pin(phase+'/readiness.json');
await record(phase+'/return.md',`Writer37 FROZEN preparation only; candidate16 publication accepted by Root CLOSED Source36+Proof36 exact identity/freeze conjunction; no runtime/model/deployment release or effects.\nCandidate16 ${config.package.sha256} /10623969B; exact identity ${fixed[1].sha256}.\nStopped34 supplies exactly4 protected originals+41 authorized native files,49 literal acquired rows; existing acquireResumeMaterial accepted in${acquisitionWallMs}ms with streamed816181362B store hash ${eventPin.sha256}. No whole-store copy/replay.\nAccounting mutant remains ${accounting.sha256}/${accounting.byteCount}B; current native after bytes preserved, no Operator restoration. Old8detections/8restores/21observations/parent are provenance only, no fresh-native credit.\nAll7 original acquisition rows/request/source/oracle checks pass; original whole workload exact. New input has source:none by existing Public owner,observations[],synthesis:null,terminal:false; no lifecycle call/admission.\nConfig ${configPin.sha256}/${configPin.byteCount}B differs from immutable33 ONLY package2+material selector4 fields; model/toolchains/environment/grants/original obligations remain equal.\nCanonical B18015000<I18030000<A18040000<driver18060000; command18000000/grace10000; native256MiB/recorder512MiB; recursion1000; no turn/USD cap.\nOriginalT0 2026-10-06T20:52:43.725Z and firstcheckpoint01:52:43.725Z retained as history; Root continued01:51:28Z/ACK01:52:06.903Z. CURRENT external quality checkpoint2026-10-07T06:52:43.725Z/Sydney17:52:43.725; Root may continue/stop, no clock reset.\nExact launch/owned C2-before-provider stop plan setup ${evidence['setup.json'].sha256}; recorder19260000ms is setup/drainage only.\nSource34 grant hash transcription resolved to actual frozen receipt ${fixed[6].sha256}; all selected controls/source/material freshly conserved.\nReadiness ${readinessPin.sha256}; preparation has no installed/native/UAT/quality/recovery/qualification claim. All writes STOPPED; Root owns next conjunction/release.\n`);
const ledger=[];for(const name of await readdir(phase))if((await lstat(phase+'/'+name)).isFile())ledger.push(await pin(phase+'/'+name));
await record(phase+'/freeze.json',{role:'Writer37',status:'FROZEN_STOP',at:new Date().toISOString(),return:await pin(phase+'/return.md'),readiness:readinessPin,config:configPin,setup:evidence['setup.json'],materialObservation:evidence['material-observation.json'],materialFreeze:evidence['material-freeze.json'],ledger,selectedConservedInputs:fixed,materialRows:49,materialOwnerAcquisitionAccepted:true,publicationAccepted:true,executionAuthorized:false,sourceOrNativeEffects:0,currentExternalQualityCheckpointUTC:'2026-10-07T06:52:43.725Z',stopped:true});
console.log(JSON.stringify({status:'FROZEN_STOP',return:await pin(phase+'/return.md'),readiness:readinessPin,freeze:await pin(phase+'/freeze.json'),config:configPin,setup:evidence['setup.json'],materialObservation:evidence['material-observation.json'],materialFreeze:evidence['material-freeze.json'],acquisitionWallMs,publicationAccepted:true,executionAuthorized:false}));
