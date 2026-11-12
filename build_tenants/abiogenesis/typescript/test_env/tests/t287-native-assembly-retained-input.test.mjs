import assert from 'node:assert/strict';
import test from 'node:test';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.env.ABI5_GENERIC_JOB_BUILD_ROOT??resolve(import.meta.dirname,'../..');
const load=name=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
const [gtl,immutable]=await Promise.all(['gtl/index','shared/immutable'].map(load));

// Retired (T-292 TD-60): the author fold of a retained runtime_failed job consumes its admitted pair; input the closed retained native job selection not recorded

// Pre-P1 Context value-use boundary at the actual instruction-assembly and actor
// preparation owners. Basis authentication and role evidence are controlled lower
// premises (component frontier); the task, both Context identities, the assembly
// and the actor preparation are real. No Run, admission, provider or history claim.
test('pre-P1 native Context input refuses unsupported_selection before any actor; fresh format assembles',async t=>{
 const fs=await import('node:fs/promises'),{dirname}=await import('node:path'),{SourceTextModule,SyntheticModule}=await import('node:vm');
 const {loadWorksiteOwner,worksiteFixture}=await import('../support/t287-generic-job-worksite.mjs');
 const product=await loadWorksiteOwner(),nativeWork=await load('product/native_workspace_work'),ids=nativeWork.NATIVE_WORKSPACE_WORK_IDS;
 const env=await worksiteFixture(product);t.after(()=>fs.rm(env.scratch,{recursive:true,force:true}));
 await fs.writeFile(join(env.canonicalRoot,'target.txt'),'before\n');await fs.writeFile(join(env.canonicalRoot,'keep.txt'),'unchanged\n');
 const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,readRoots:['.'],maxFiles:20,maxBytes:10000});
 const task=nativeWork.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
  capabilityGrant:env.capabilityGrant,context,outcome:'Perform the declared local work',instructions:['Read the selected input.'],readFirst:['target.txt'],writeRoots:['target.txt'],checks:[]});
 // The same physical observation under its pre-P1 identity: the digest covered the inline bytes.
 const {kind:_k,schemaVersion:_s,observationRef:_r,observationDigest:_d,...body}=context,preDigest=product.sha256Canonical(body);
 assert.notEqual(preDigest,context.observationDigest);
 const preContext=immutable.deepFreeze({...context,observationDigest:preDigest,observationRef:'worksite-context-observation://abiogenesis/'+preDigest.slice(7)});
 assert.equal(product.isWorksiteContextObservation(preContext),false);
 const preTask=immutable.deepFreeze({...task,context:preContext});assert.equal(nativeWork.isNativeWorkspaceWorkTask(preTask),false);
 const digest=label=>product.sha256Canonical({label});
 const publication=gtl.constructNativeWorkspaceWorkModulePublication({productId:'product://native-owner/test',artifactDigest:digest('artifact'),
  productContentDigest:digest('content'),productManifestDigest:digest('manifest'),packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-dev.286'});
 const graphFunction=publication.graphFunctions.find(g=>g.name===nativeWork.nativeWorkspaceWorkGraphFunctionRef(task));assert.ok(graphFunction);
 const call={cCallRef:'c-call://pre-p1/native',cCallDigest:digest('call'),regime:'F_P',callClass:'leaf',runId:'run://pre-p1/native',graphCallId:'graph-call://pre-p1/native',
  frameId:'frame://pre-p1/native',programLocusRef:ids.nodeRef,taskOrdinal:null,attempt:1,implementationRef:ids.implementationRef,graphFunctionRef:graphFunction.name,
  inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef};
 const execution={basisRef:'basis://pre-p1/native',basisDigest:digest('basis'),invocationAdmissionRef:'invocation://pre-p1/native',programRef:ids.programRef};
 const predecessorPrefix={kind:'durable_prefix_coordinate',coordinateDigest:digest('prefix')};
 const basis=immutable.deepFreeze({publication,graphFunction,executionBasis:execution,cCall:call,predecessorPrefix});
 let supplied=task,roles=0,dispatches=0;
 const owner=()=>({prefix:null,call,execution,program:publication.programs[0],environment:null,inputRef:'input://pre-p1/native',
  inputDigest:product.sha256Canonical(supplied),inputValue:supplied});
 async function component(name,overrides){
  const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await fs.readFile(file,'utf8'),{identifier:file});
  await module.link(async specifier=>{const imported=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
   const values={...imported,...overrides[specifier]};return new SyntheticModule(Object.keys(values),function(){for(const [key,value] of Object.entries(values))this.setExport(key,value);});});
  await module.evaluate();return module.namespace;
 }
 const executionOwner={authenticateOwnedNativeInstructionAssemblyBasis:()=>owner(),constructNativeInstructionAssemblyBasis:value=>value};
 const assembly=await component('abg/instruction_assembly',{'./execution_basis.js':executionOwner,
  './stdo_environment.js':{projectRunEnvironmentRoleEvidenceAtPrefix:()=>{roles++;return null;}}});
 const actor=await component('abg/actor_process',{'./instruction_assembly.js':assembly,'./execution_basis.js':executionOwner,
  './worker_transport.js':{prepareWorkerTransport:async()=>{dispatches++;throw new Error('provider dispatch prohibited');},
   runPreparedWorkerTransport:()=>{dispatches++;throw new Error('provider dispatch prohibited');}}});
 const occurrence={cCallRef:call.cCallRef,runId:call.runId,graphCallId:call.graphCallId,frameId:call.frameId,programLocusRef:call.programLocusRef,
  taskOrdinal:call.taskOrdinal,attempt:call.attempt,nativeInstructionAssemblyBasis:basis};

 // Fresh current format: the same owner assembles the native work order.
 const fresh=assembly.requireDeclaredNativeInstructionAssembly(basis,task);
 assert.equal(fresh.kind,'native_instruction_assembly');assert.equal(fresh.request.implementationRef,ids.implementationRef);
 assert.equal(fresh.request.inputDigest,product.sha256Canonical(task));assert.equal(fresh.request.transportLane,'worker_executes');
 assert.equal(fresh.manifest.contextRef,context.observationRef);assert.match(fresh.request.prompt,/Perform the declared work/);
 assert.deepEqual(actor.prepareActorProcessInvocation(task,occurrence).prepareInstructionAssembly().request,fresh.request);

 // Pre-P1 format of the same physical observation: one typed refusal, no actor.
 supplied=preTask;const rolesBefore=roles;
 const typed=error=>{const refusal=JSON.parse(error.message);assert.deepEqual(refusal,{kind:'native_instruction_assembly_refusal',
  cause:'unsupported_selection',policy:null,role:'constructor',unresolvedRefs:[preContext.observationRef]});return true;};
 assert.throws(()=>assembly.requireDeclaredNativeInstructionAssembly(basis,preTask),typed);
 assert.equal(assembly.constructDeclaredNativeInstructionAssembly(basis,preTask),null);
 assert.throws(()=>assembly.requireWorksiteNativeInstructionAssembly(basis,preTask),typed);
 assert.equal(roles,rolesBefore,'refused before role evidence or prompt rendering');
 const prepared=actor.prepareActorProcessInvocation(preTask,occurrence);
 assert.throws(()=>prepared.prepareInstructionAssembly(),typed);
 const effect=await prepared.invokeActorProcess({predecessorPrefix,occurrence});
 assert.equal(effect.kind,'actor_process_effect_refusal');assert.equal(effect.code,'actor_process_invocation_refused');
 assert.equal(effect.message,'native assembly preparation did not complete');assert.equal(effect.processFacts,null);
 assert.equal(dispatches,0,'no actor transport is prepared or run');

 // A fresh observation of the same files is the current input; it is not the pre-P1 value.
 supplied=task;assert.equal(assembly.requireDeclaredNativeInstructionAssembly(basis,task).request.inputDigest,fresh.request.inputDigest);
 t.diagnostic(JSON.stringify({kind:'pre_p1_native_context_boundary',owner:'abg/instruction_assembly',cause:'unsupported_selection',
  preP1ContextRef:preContext.observationRef,currentContextRef:context.observationRef,dispatches,
  scope:'Native work task input only; no decoder, migration, schema change or generic history-read claim. Lower basis/role premises are controlled.'}));
});
