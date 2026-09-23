// Component scope: actual packaged source/context observation and assembly;
// invocation/native-owner authentication and A/W/grant are labelled premises.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import { validRunEnvironmentProgram, runEnvironmentForProgram } from '../../build/code/src/gtl/stdo_run_environment.js';
import { projectRunEnvironmentRoleEvidence } from '../../build/code/src/abg/stdo_environment.js';
import { worksiteCommandExecutionHelperPlan, renderWorksiteCommandExecutionPrompt } from '../../build/code/src/product/worksite_command_execution.js';
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
 assert.deepEqual(publication.contributions.find(c=>c.handle===revision.name).programMembershipRefs,[]);
 assert.equal(revision.declarations['abg.child_closure_contract'],p.WORKSITE_REVISION_IDS.childClosureContractRef);
 const reacquire=publication.programs.find(x=>x.programRef!==ids.programRef);assert.equal(runEnvironmentForProgram(publication,reacquire),null);
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
 const assemblyOwner=await privateOwner('abg/instruction_assembly.js',[],{'./execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>nativeOwner}});
 const basis={publication,graphFunction:publication.graphFunctions.find(g=>g.name===ids.graphFunctionRef),predecessorPrefix:{coordinateDigest:hash('component-prefix')}};
 const assembled=assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,task);assert.ok(assembled);
 const plan=worksiteCommandExecutionHelperPlan(task,worksiteCommandExecutionAttemptRef(call));
 assert.equal(assembled.envelope.sections.task.ownerPrompt,renderWorksiteCommandExecutionPrompt(task,plan));
 assert.equal(assembled.plan.runEnvironment.environmentDigest,hash(declaration));assert.equal(assembled.request.inputDigest,hash(task));
 assert.ok(Buffer.byteLength(assembled.request.prompt)<16000,'bounded mechanical relay context, no full qualification source prompt');
 const original=events[0].payload.runEnvironment;delete events[0].payload.runEnvironment;
 assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,task),null,'missing admitted environment refuses');
 events[0].payload.runEnvironment=original;
 assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,{...task,taskDigest:hash('changed')}),null);
 const foreign=structuredClone(basis);foreign.publication.programs.find(x=>x.programRef===ids.programRef).programRef='program://foreign';
 assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(foreign,task),null);
});
