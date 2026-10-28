// Component scope: actual packaged source/context observation and assembly;
// invocation/native-owner authentication and A/W/grant are labelled premises.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import { validRunEnvironmentProgram, runEnvironmentForProgram } from '../../build/code/src/gtl/stdo_run_environment.js';
import { projectRunEnvironmentRoleEvidence } from '../../build/code/src/abg/stdo_environment.js';
import { selectValidatedRuntimeEventPrefix } from '../../build/code/src/abg/event_prefix.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { worksiteCommandExecutionHelperPlan, renderWorksiteCommandExecutionPrompt, constructWorksiteCommandConfiguration } from '../../build/code/src/product/worksite_command_execution.js';
import { selectedWorksiteCommandAmbientEnvironment } from '../../build/code/src/abg/actor_process.js';
import { prepareWorksiteCommandTask, rederiveWorksiteCommandTask, resolveWorksitePreparationJudgmentRelation, WORKSITE_PREPARATION_IDS } from '../../build/code/src/product/worksite_preparation.js';
import { worksiteCommandExecutionAttemptRef } from '../../build/code/src/abg/instruction_assembly.js';
import { privateOwner } from '../support/r10-private-owner-harness.mjs';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const root=resolve(import.meta.dirname,'../..'),hash=p.sha256Canonical,ids=p.WORKSITE_COMMAND_EXECUTION_IDS;
const artifact={productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION,
  artifactDigest:hash('supplied-component-artifact'),productContentDigest:hash('supplied-component-content'),productManifestDigest:hash('supplied-component-manifest')};
const publication=gtl.constructWorksiteCommandExecutionModulePublication(artifact),program=publication.programs.find(x=>x.programRef===ids.programRef);
const declaration=runEnvironmentForProgram(publication,program),role=declaration.roles[0],member=declaration.contexts[0].members[0];
const sourceOwner=await loadWorksiteOwner();
async function fixture(t){
 const env=await worksiteFixture(sourceOwner);t.after(()=>fs.rm(env.scratch,{recursive:true,force:true}));
 const sourceRoot=join(env.scratch,'selected-product'),temporaryRoot=join(env.scratch,'archive/context');
 await fs.mkdir(dirname(join(sourceRoot,member.path)),{recursive:true});await fs.mkdir(temporaryRoot,{recursive:true});
 await fs.copyFile(join(root,member.path),join(sourceRoot,member.path));
 const recordPath=join(sourceRoot,gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path);
 await fs.mkdir(dirname(recordPath),{recursive:true});await fs.copyFile(join(root,gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path),recordPath);
 const authority={authorityRef:'authority://c2-context/component',authorityDigest:hash('supplied-authority'),actorRef:'actor://c2-context/component'};
 const coordinates={dependencies:[{dependencyRef:declaration.dependencies[0].dependencyRef,root:sourceRoot,recordPath}],temporaryRoot,pythonPath:null};
 const resources=p.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
  permission:{...authority,programRef:program.programRef,environmentRef:declaration.declarationRef,environmentDigest:hash(declaration),operations:['read_context'],...coordinates}});
 return {...env,sourceRoot,recordPath,authority,resources,input:{publication,program,graphFunctions:publication.graphFunctions,authority,archiveRoot:join(env.scratch,'archive'),resources}};
}
test('core C2 declares its exact existing Product relay source and only its lawful root callable',async()=>{
 assert.equal(validRunEnvironmentProgram(publication,program,publication.graphFunctions),true);
 assert.equal(program.programRef,ids.programRef);assert.deepEqual(program.callableMembership,[ids.graphFunctionRef]);
 assert.equal(declaration.corpusAccess,null);assert.deepEqual(declaration.accesses,[]);
 assert.deepEqual(role.contextPolicy.selectors,['current_worksite','admitted_execution_evidence']);
 assert.equal(role.role,'command_executor');assert.equal(role.policy.text,renderWorksiteCommandExecutionPrompt.toString());
 const source=await fs.readFile(join(root,member.path)),span=role.sourceBindings[0];
 assert.equal(source.length,member.byteCount);assert.equal(p.sha256Bytes(source),member.digest);
 assert.equal(p.sha256Bytes(source.subarray(span.startByte,span.endByte)),span.spanDigest);
 assert.equal(source.subarray(span.startByte,span.endByte).toString(),role.policy.text);
 assert.equal(p.sha256Bytes(await fs.readFile(join(root,gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path))),declaration.dependencies[0].recordDigest);
 const revision=publication.graphFunctions.find(g=>g.name===p.WORKSITE_REVISION_IDS.graphFunctionRef);assert.ok(revision);
 assert.ok(publication.implementationBindings.some(b=>b.bindingRef===p.WORKSITE_REVISION_IDS.implementationBindingRef));
 const revisionProgram=publication.programs.find(p=>p.callableMembership.includes(revision.name));assert.ok(revisionProgram);
 assert.deepEqual(publication.contributions.find(c=>c.handle===revision.name).programMembershipRefs,[revisionProgram.programRef]);
 assert.deepEqual(revisionProgram.starts,[]);assert.equal(revisionProgram.policies['abg.root_mode'],'supervised');
 assert.equal(revision.declarations['abg.child_closure_contract'],p.WORKSITE_REVISION_IDS.childClosureContractRef);
 const reacquire=publication.programs.find(x=>x.programRef===p.NATIVE_WORK_REACQUISITION_IDS.programRef);assert.equal(runEnvironmentForProgram(publication,reacquire),null);
 const old=structuredClone(publication);delete old.runEnvironments;delete old.programs.find(x=>x.programRef===ids.programRef).policies[gtl.RUN_ENVIRONMENT_POLICY];
 assert.equal(runEnvironmentForProgram(old,old.programs.find(x=>x.programRef===ids.programRef)),null,'retained missing-environment discriminator');
});
test('actual C2 context observation requires explicit matching resources and rejects unavailable or changed source',async t=>{
 const f=await fixture(t),missing={...f.input};delete missing.resources;
 assert.deepEqual(await p.observeRunEnvironment(missing),{kind:'run_environment_refusal',cause:'missing_binding',issuePath:'/runEnvironmentResources'});
 const actual=await p.observeRunEnvironment(f.input);assert.equal(actual.kind,'run_environment_observed');assert.ok(actual.evidence);
 const crossed=structuredClone(f.input);crossed.resources.permission.actorRef='actor://foreign';
 assert.equal((await p.observeRunEnvironment(crossed)).cause,'access_not_permitted');
 const original=await fs.readFile(join(f.sourceRoot,member.path));await fs.writeFile(join(f.sourceRoot,member.path),'changed source');
 assert.equal((await p.observeRunEnvironment(f.input)).cause,'identity_mismatch');
 await fs.unlink(join(f.sourceRoot,member.path));assert.equal((await p.observeRunEnvironment(f.input)).cause,'access_unavailable');
 await fs.writeFile(join(f.sourceRoot,member.path),original);await fs.writeFile(f.recordPath,'{}');
 assert.equal((await p.observeRunEnvironment(f.input)).cause,'identity_mismatch');
});
test('observed root C2 assembles the single exact helper request from actual context evidence',async t=>{
 const f=await fixture(t),observed=await p.observeRunEnvironment(f.input);assert.equal(observed.kind,'run_environment_observed');
 const relativePath='selected.txt';await fs.writeFile(join(f.canonicalRoot,relativePath),'frozen observed source\n');
 const subject=p.constructWorksiteSubject({...f,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
 const observation=await sourceOwner.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject);
 const task=p.constructObservedWorksiteCommandExecutionTask({...f,observedFiles:[{subject,observation}],commands:[{commandId:'command://component/check',
  executable:process.execPath,args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],
  outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'verification'}]});
 // Supplied lower-native premise only. The environment evidence above is real
 // Product observation; source projection, role selection and assembly execute.
 const invocationAdmissionRef='invocation://c2-context/component',events=[{kind:'invocation_admitted',payload:{invocationAdmissionRef,...f.authority,runEnvironment:observed.evidence}}];
 const projected=projectRunEnvironmentRoleEvidence(events,invocationAdmissionRef,publication,program.programRef,ids.graphFunctionRef,ids.nodeRef,'command_executor');
 assert.ok(projected);assert.equal(projected.sourceContent[0].text,role.policy.text);
 const call={regime:'F_P',cCallRef:'c-call://c2-context/component',cCallDigest:hash('call'),runId:'run://component',graphCallId:'graph-call://component',
  frameId:'frame://component',taskOrdinal:null,attempt:1,programLocusRef:ids.nodeRef,graphFunctionRef:ids.graphFunctionRef,
  implementationRef:ids.implementationRef,inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef};
 const nativeOwner={events,inputRef:'input://component',inputDigest:hash(task),inputValue:task,call,
  execution:{basisRef:'basis://component',basisDigest:hash('basis'),basisClass:'root',invocationAdmissionRef,programRef:program.programRef}};
 // The lower invocation/Event premise is supplied, not admitted by this
 // component test. Immutable prefix selection and indexed role projection
 // use their actual owners.
 let omitEnvironment=false;
 const selectedOwner=()=>{
  const payload=structuredClone(events[0].payload);if(omitEnvironment)delete payload.runEnvironment;
  const admitted={
   ...events[0],payload,eventTime:'2026-10-10T00:00:00.000Z',aggregateType:'invocation',aggregateId:invocationAdmissionRef,
   parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://c2-context/component',
   workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://component',eventId:'event://c2-context/component',
   admissionOrdinal:1,payloadDigest:hash(payload)};
  const {events:unused,...facts}=nativeOwner;
  return {...facts,prefix:selectValidatedRuntimeEventPrefix(deepFreeze([admitted]))};
 };
 const assemblyOwner=await privateOwner('abg/instruction_assembly.js',[],{'./execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:selectedOwner}});
 const basis={publication,graphFunction:publication.graphFunctions.find(g=>g.name===ids.graphFunctionRef),predecessorPrefix:{coordinateDigest:hash('component-prefix')}};
 const assembled=assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,task);assert.ok(assembled);
 const plan=worksiteCommandExecutionHelperPlan(task,worksiteCommandExecutionAttemptRef(call));
 assert.equal(assembled.envelope.sections.task.ownerPrompt,renderWorksiteCommandExecutionPrompt(task,plan));
 assert.equal(assembled.plan.runEnvironment.environmentDigest,hash(declaration));assert.equal(assembled.request.inputDigest,hash(task));
 assert.deepEqual(assembled.envelope.sections.role.sourceContent,projected.sourceContent,'indexed projection retains the observed policy bytes');
 assert.ok(Buffer.byteLength(assembled.request.prompt)<16000,'bounded mechanical relay context, no full qualification source prompt');
 omitEnvironment=true;
 assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,task),null,'missing admitted environment refuses');
 omitEnvironment=false;
 assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,{...task,taskDigest:hash('changed')}),null);
 const foreign=structuredClone(basis);foreign.publication.programs.find(x=>x.programRef===ids.programRef).programRef='program://foreign';
 assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(foreign,task),null);
});
test('the command environment takes the operation-boundary rows and reads no ambient process environment',async t=>{
 const f=await fixture(t),defaultChain='/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin';
 const rows=deepFreeze([{name:'HOME',value:'/rows/home'},{name:'TMPDIR',value:'/rows/tmp'},{name:'LANG',value:'C.UTF-8'},{name:'LC_ALL',value:'C'},{name:'PATH',value:'/rows/bin:/usr/bin'}]);
 const command=environment=>({commandId:'command://component/environment',executable:process.execPath,args:['--version'],relativeCwd:'.',environment,timeoutMs:1000,terminationGraceMs:100,expectedReports:[]});
 const bound=(environment,...ambient)=>constructWorksiteCommandConfiguration({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,
  commands:[command(environment)],outcomePredicates:[],protectedSubjects:[],allowedWriteTerritories:[]},...ambient).commands[0].environment;
 const named=entries=>entries.map(({name,value})=>({name,value}));
 const sorted=[...rows].sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0).map(row=>({...row}));
 // Rows for the five and a declared input without PATH: the entries are the rows, PATH normalized.
 assert.deepEqual(named(bound({},rows)),sorted);
 assert.deepEqual(named(bound({PATH_PREFIX:'/prefix/bin'},rows)),sorted.map(row=>row.name==='PATH'?{name:'PATH',value:'/prefix/bin:/rows/bin:/usr/bin'}:row));
 assert.equal(named(bound({HOME:'/declared/home'},rows)).find(row=>row.name==='HOME').value,'/declared/home','a declared variable keeps its value');
 // No rows: the default chain and no HOME/TMPDIR/LANG/LC_ALL entry, whatever the process holds.
 assert.deepEqual(named(bound({},null)),[{name:'PATH',value:defaultChain}]);
 assert.deepEqual(named(bound({PATH_PREFIX:'/prefix/bin'},null)),[{name:'PATH',value:'/prefix/bin:'+defaultChain}]);
 // An already-bound input ignores the rows, including a PATH-less bound array.
 const retained=bound({},rows),other=deepFreeze([{name:'HOME',value:'/other/home'},{name:'PATH',value:'/other/bin'}]);
 assert.deepEqual(bound(retained,other),retained);assert.deepEqual(bound(retained,null),retained);
 const pathless=[{kind:'worksite_command_environment_entry',schemaVersion:'5.0.0',name:'HOME',value:'/bound/home'}];
 assert.deepEqual(named(bound(pathless,rows)),[{name:'HOME',value:'/bound/home'},{name:'PATH',value:defaultChain}]);
 // The operation boundary passes the one reader's capture; no constructor reads it at the call.
 assert.deepEqual(named(bound({},selectedWorksiteCommandAmbientEnvironment())),named(bound({},selectedWorksiteCommandAmbientEnvironment())));
 // A call that passes no capture captures nothing, whatever the process holds.
 assert.deepEqual(named(bound({})),[{name:'PATH',value:defaultChain}]);
});
test('a recorded task re-derives under its bound rows, not the process rows, and a relative bound PATH segment refuses',async t=>{
 const f=await fixture(t),names=['HOME','TMPDIR','LANG','LC_ALL','PATH'],saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 const identity=(prefix,digest)=>prefix+'/'+digest.slice(7);
 const relativePath='prepared.txt';await fs.writeFile(join(f.canonicalRoot,relativePath),'predecessor source\n');
 const subject=p.constructWorksiteSubject({...f,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
 const predecessor=await sourceOwner.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject);
 const constructionTask=p.constructWorksiteConstructionTask({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,capabilityGrant:f.capabilityGrant,
  prompt:'Replace the prepared source.',targets:[{subject,territory:f.territory,predecessorObservation:predecessor}]});
 const entry=p.constructWorksiteCommandPreparationInput({constructionTask,commands:[{commandId:'command://component/prepared',executable:process.execPath,args:['--version'],
  relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'verification'}]});
 // Synthetic construction receipt over an actual successor observation; no
 // RuntimeEvent, actor or command runs.
 await fs.writeFile(join(f.canonicalRoot,relativePath),'successor source\n');
 const successorObservation=await sourceOwner.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject);
 const receiptBody={authorizationRef:'synthetic-unadmitted:authorization',authorizationDigest:hash('synthetic-unadmitted-authorization'),
  beforeObservationRef:predecessor.observationRef,beforeObservationDigest:predecessor.observationDigest,afterObservationRef:successorObservation.observationRef,
  afterObservationDigest:successorObservation.observationDigest,writtenDigest:successorObservation.fileDigest,committed:true},receiptDigest=hash(receiptBody);
 const receipt={kind:'worksite_file_replace_receipt',schemaVersion:'5.0.0',receiptRef:identity('worksite-file-replace-receipt://abiogenesis',receiptDigest),receiptDigest,...receiptBody};
 assert.ok(p.isWorksiteFileReplaceReceipt(receipt));
 const constructionBody={sourceApplicationRef:p.WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef,members:[{ordinal:0,inputMemberRef:constructionTask.targets[0].targetRef,
  outputMemberRef:'synthetic-unadmitted:output-0',receipt,successorObservation}]},resultDigest=hash(constructionBody);
 const source={kind:'worksite_construction_result',schemaVersion:'5.0.0',resultRef:identity('worksite-construction-result://abiogenesis',resultDigest),resultDigest,...constructionBody};
 assert.ok(p.isWorksiteConstructionResult(source));
 const input={kind:'worksite_command_preparation_bound_input',schemaVersion:'5.0.0',entry,source};
 const recordedRows=deepFreeze([{name:'HOME',value:'/recorded/home'},{name:'TMPDIR',value:'/recorded/tmp'},{name:'LANG',value:'C.UTF-8'},{name:'LC_ALL',value:'C'},{name:'PATH',value:'/recorded/bin:/usr/bin'}]);
 const recorded=prepareWorksiteCommandTask(input,recordedRows),relation=resolveWorksitePreparationJudgmentRelation(WORKSITE_PREPARATION_IDS.preparePredicateRef);
 assert.deepEqual(recorded.commands[0].environment.map(({name,value})=>({name,value})).find(row=>row.name==='PATH'),{name:'PATH',value:'/recorded/bin:/usr/bin'});
 try {
  process.env.HOME='/process/home';process.env.TMPDIR='/process/tmp';process.env.LANG='en_US.UTF-8';process.env.LC_ALL='POSIX';process.env.PATH='/process/bin:/bin';
  const processRows=selectedWorksiteCommandAmbientEnvironment();
  assert.deepEqual(processRows.map(row=>row.name),names,'the process holds all five rows');
  for(const row of processRows)assert.notEqual(row.value,recordedRows.find(r=>r.name===row.name).value,row.name+' differs from the recorded row');
  assert.notDeepEqual(prepareWorksiteCommandTask(input,processRows),recorded,'a construction under the process rows is a different task');
  // Every re-derivation takes the recorded task's bound rows, ambient null.
  assert.deepEqual(rederiveWorksiteCommandTask(input,recorded),recorded,'the recorded task re-derives equal under different process rows');
  assert.equal(relation.evaluate(input,recorded),true,'the preparation judgment admits the recorded task');
  // A recorded task whose bound PATH has a relative segment, identity recomputed.
  const relative=structuredClone(recorded),row=relative.commands[0].environment.find(entry=>entry.name==='PATH');row.value='relative/bin:/usr/bin';
  const {kind:_kind,schemaVersion:_schemaVersion,taskRef:_taskRef,taskDigest:_taskDigest,...body}=relative,taskDigest=hash(body);
  relative.taskDigest=taskDigest;relative.taskRef=identity('worksite-command-execution-task://abiogenesis',taskDigest);
  assert.throws(()=>rederiveWorksiteCommandTask(input,relative),TypeError,'a relative bound PATH segment refuses');
  assert.equal(relation.evaluate(input,relative),false,'the preparation judgment refuses a relative bound PATH segment');
 } finally {
  for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}
 }
});
test('the reader refuses a NUL in LANG and the operation boundary carries null',()=>{
 const saved=process.env;
 // The boundary expression as built in hog/ccall_lifecycle.js, evaluated with
 // the actual reader: a disclosed seam, not a driven lifecycle.
 const built=readFileSync(join(root,'build/code/src/hog/ccall_lifecycle.js'),'utf8');
 const expression=built.match(/const commandAmbientEnvironment = (\(\(\) => \{ try \{[\s\S]*?\} \}\)\(\));/);
 assert.ok(expression,'the built boundary capture is present');
 const boundary=new Function('selectedWorksiteCommandAmbientEnvironment','return '+expression[1]+';');
 try {
  process.env={...saved,LANG:'C.UTF-8\0trailing'};
  assert.equal(process.env.LANG.includes('\0'),true,'the NUL reaches the reader');
  assert.throws(()=>selectedWorksiteCommandAmbientEnvironment(),error=>error instanceof TypeError&&error.message==='ambient LANG is not one string without NUL');
  assert.equal(boundary(selectedWorksiteCommandAmbientEnvironment),null,'the boundary carries null');
  process.env={...saved,LANG:'C.UTF-8'};
  assert.deepEqual(boundary(selectedWorksiteCommandAmbientEnvironment),selectedWorksiteCommandAmbientEnvironment(),'a clean LANG is carried as the reader returns it');
 } finally {
  process.env=saved;
 }
});
test('the one ambient reader returns the present variables as frozen rows and applies no default',()=>{
 const names=['HOME','TMPDIR','LANG','LC_ALL','PATH'],saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try {
  process.env.HOME='/reader/home';delete process.env.TMPDIR;process.env.LANG='C';delete process.env.LC_ALL;process.env.PATH='/reader/bin';
  const rows=selectedWorksiteCommandAmbientEnvironment();
  assert.deepEqual(rows,[{name:'HOME',value:'/reader/home'},{name:'LANG',value:'C'},{name:'PATH',value:'/reader/bin'}]);
  assert.ok(Object.isFrozen(rows)&&rows.every(row=>Object.isFrozen(row)));
  for(const name of names)delete process.env[name];
  assert.deepEqual(selectedWorksiteCommandAmbientEnvironment(),[],'an absent variable stays absent');
 } finally {
  for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}
 }
});
