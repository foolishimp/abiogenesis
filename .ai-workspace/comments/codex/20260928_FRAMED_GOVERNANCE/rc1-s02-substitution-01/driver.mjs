import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {here,read,write,caller} from './ordinary-caller.mjs';
import {preflight} from './preflight.mjs';
import {setup} from './setup.mjs';
import {checkConformance,checkStart} from './owner-checks.mjs';
import {verifySubstitution} from './oracle.mjs';
const budgets=await read(join(here,'budgets.json')),began=performance.now(),deadline={deadline:began+budgets.driverBudgetMs};
await write('driver-start.json',{pid:process.pid,startedAt:new Date().toISOString(),budgetMs:budgets.driverBudgetMs,nodeOldSpaceMiB:4096,operationCount:11});
let c,started,reads,prepared;const timer=setTimeout(()=>{console.error('Finite outer driver budget exhausted');process.exit(124);},budgets.driverBudgetMs);
try{
 const preBegin=performance.now();const prepTimer=setTimeout(()=>{console.error('Pure preparation budget exhausted');process.exit(124);},budgets.purePreparationBudgetMs);
 try{prepared=await preflight();assert.ok(performance.now()-preBegin<budgets.purePreparationBudgetMs);await write('preflight-budget-result.json',{status:'passed',elapsedMs:performance.now()-preBegin,budgetMs:budgets.purePreparationBudgetMs});}finally{clearTimeout(prepTimer);}
 c=await caller('s02',prepared.items[0].verification,deadline);const s=await setup(c,prepared);console.log(JSON.stringify({phase:'SEVEN_NATIVE_SETUP_CALLS_COMPLETED',calls:c.state.calls.length,workspaceBinding:c.state.binding,prefix:c.state.closeHandoff.prefix}));assert.equal(c.state.calls.length,7);
 const row=prepared.prospect.cases[0],conformance=await c.prepareConformance(row.programRef,'conformance-hello-substitute',s.publicationInputs);await write('conformance-owner-precondition.json',checkConformance(c,conformance));
 const conform=await c.invoke(conformance.label,conformance.call,'conformance');const cv=conform.receipt.ownerOutput.value;await write('conformance-semantic-result.json',cv);assert.deepEqual(cv.program,conformance.call.invocation.request.program);assert.equal(cv.disposition,'passed');
 const input=c.gtl.constructHelloWorldInput('World');assert.deepEqual(input,{kind:'hello_world_input',schemaVersion:'5.0.0',subject:'World'});
 const selected=await c.prepareStart(row.programRef,row.graphFunctionRef,input,'substitution-root'),leafRows=[...selected.resolution.programValidation.executableLeafRows,...selected.resolution.programValidation.interactionLeafRows];assert.equal(leafRows.length,3);assert.ok(leafRows.every(x=>x.fibre==='F_D'),'all actual selected leaves must be F_D before native start');
 await write('start-resolution.json',{resolution:selected.resolution,capabilityBasis:selected.capabilityBasis,selectedLeafRows:leafRows,allSelectedLeavesFD:true});await write('start-owner-precondition.json',await checkStart(c,selected));const before=c.state.closeHandoff;await write('before-root-handoff.json',before);
 console.log(JSON.stringify({phase:'SELECTED_NATIVE_START_READY',program:row.programRef,leaves:leafRows.length,regimes:[...new Set(leafRows.map(x=>x.fibre))],input}));
 started=await c.invoke('substitution-root',selected.call,'start');const after=c.state.closeHandoff;await write('after-root-handoff.json',after);console.log(JSON.stringify({phase:'SELECTED_NATIVE_START_CLOSED',disposition:started.receipt.ownerOutput.value.disposition,run:started.receipt.ownerOutput.value.run}));
 reads=await c.freshReads('substitution-root',started);await write('native-reads.json',reads);const proof=await verifySubstitution(c,started,reads,before,after);await write('substitution-proof.json',proof);
 assert.equal(c.state.calls.length,11);const finalPhysical=await c.physical('final');await writeFile(join(here,'final-native-prefix.jsonl'),await readFile(s.eventLogPath),{flag:'wx'});await write('final-handoff.json',c.state.closeHandoff);c.refresh();await write('environment.json',{...c.state.environment,verified:prepared.items[0].verified,workspaceAuthority:s.workspaceAuthority,workspaceManifest:s.workspaceManifest,catalog:c.state.catalog,catalogView:c.state.catalogView,bootstrapInstalledRoot:prepared.identity.installedRoot,roots:s.roots,contractCatalog:c.contractCatalog,closeHandoff:c.state.closeHandoff});
 await write('native-result.json',{status:'CLOSED_native_success',subject:prepared.identity.basis,setupCalls:7,conformanceCalls:1,startCalls:1,freshReadCalls:2,nativeCalls:c.state.calls,providerCalls:0,modelCalls:0,finalPhysical,run:proof.run,elapsedMs:performance.now()-began,budgetMs:budgets.driverBudgetMs,claim:proof.claim});console.log(JSON.stringify({phase:'CLOSED_native_success',calls:c.state.calls.length,elapsedMs:performance.now()-began,rootEvents:proof.rootEventCount}));
}catch(error){
 if(c){try{await c.physical('failure-final');const f=join(here,'resources/events/runtime.events.jsonl');await writeFile(join(here,'failure-native-prefix.jsonl'),await readFile(f),{flag:'wx'});}catch(e){await write('failure-observation.json',{message:String(e)});}}
 await write('first-failure.json',{status:'CLOSED_first_failure',message:String(error),stack:error.stack,closeHandoff:c?.state.closeHandoff??null,calls:c?.state.calls??[],started:started??null,reads:reads??null,nativeCalls:c?.state.calls.length??0,retries:0});console.error(String(error));process.exitCode=1;
}finally{clearTimeout(timer);}
