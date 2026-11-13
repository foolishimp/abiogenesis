// Root-only installed preflight/call construction; no provider or Run admission.
import assert from 'node:assert/strict';
import {readFile,mkdir,lstat} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {execFileSync} from 'node:child_process';
import {dir,work,sha,loadSetup} from './setup-state.mjs';
assert.equal(process.argv.length,3,'usage: node --experimental-vm-modules prepare-native-call.mjs BINDING_SHA256_HEX');
const {selection,retained,workload:w,profile,local,bindingDigest}=await loadSetup(process.argv[2]);
try{await lstat(join(dir,'execution'));throw Error('attempt already exists; no automatic retry')}catch(e){if(e.code!=='ENOENT')throw e;}
const {installedModules,publicCaller,constructLifecycleCall}=await import(pathToFileURL(local[0]).href);
const {exclusiveRecord}=await import(pathToFileURL(local[1]).href);
const {assessmentSelection,consumerDeclaration,IDS}=await import(pathToFileURL(local[2]).href);
await mkdir(join(work,'rc4-scratch/native-recovery-02/tmp'),{recursive:true});
const runtime=await installedModules(retained.installedRoot),{product,gtl}=runtime;
const manifest=JSON.parse(await readFile(join(retained.installedRoot,'product-toolchain-manifest.json'),'utf8'));assert.equal(product.sha256Canonical(manifest),retained.native.request.expectedManifestDigest);
for(const install of retained.setup.installations)assert(await product.installedProductContentMatches(install),'installed Product drift');
const dry=publicCaller({root:join(dir,'../runtime-001'),runtime,native:retained.native,command:()=>{throw Error('unexpected execution')},record:()=>{throw Error('unexpected record')},config:retained.config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
const observed=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observed.kind,'worksite_context_observation',JSON.stringify(observed));assert(observed.entries.length<=w.maxContextFiles);assert(observed.entries.every(e=>e.state==='file'||e.state==='directory'));assert(w.sources.every(s=>observed.entries.some(e=>e.relativePath===s.path&&e.state==='file'&&e.digest===s.digest)));
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));assert.deepEqual(input.observations,[]);assert.equal(input.synthesis,null);
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js')).href);
const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},null);
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits={inactivityTimeoutMs:profile.inactivityTimeoutMs,absoluteTimeoutMs:profile.absoluteTimeoutMs};assert.equal(budget.requiredExecutionBudgetMs,4267250);assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));
const task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:input,context:observed};assert(product.isFramedSynthesisTask(task));
const pkg=retained.installedRoot,load=p=>import(pathToFileURL(join(pkg,'build/code/src',p+'.js')).href),source=await load('gtl/default_library');
const verified=retained.native.verified,basis={productId:verified.productId,packageName:verified.packageName,packageVersion:verified.packageVersion,
 artifactDigest:verified.artifactDigest,productContentDigest:verified.productContentDigest,productManifestDigest:verified.manifestDigest};
const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),data=consumerDeclaration(gtl,product,library,4);
const publication=gtl.modulePublication({...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,
 contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
const graph=publication.graphFunctions.find(g=>g.name===IDS.stepRef),node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select'));
const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']),role=publication.runEnvironments[0].roles.find(r=>r.role==='selector');
const call={regime:'F_P',cCallRef:'call:controlled-planning',cCallDigest:product.sha256Canonical('call'),graphFunctionRef:graph.name,programLocusRef:node.nodeRef,
 inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
const execution={programRef:IDS.programRef,basisRef:'basis:controlled-planning',basisDigest:product.sha256Canonical('basis'),invocationAdmissionRef:'invocation:controlled-planning',registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
const sourceContent=await Promise.all(role.sourceBindings.map(async binding=>{const member=publication.runEnvironments[0].contexts.find(c=>c.contextRef===binding.contextRef).members.find(m=>m.memberRef===binding.memberRef);
 const asset=Object.values(source.DEFAULT_LIBRARY_STDO_SOURCE.members).find(a=>a.path===member.path),bytes=await readFile(join(pkg,asset.assetPath));assert.equal(product.sha256Bytes(bytes),binding.memberDigest);
 const span=bytes.subarray(binding.startByte,binding.endByte);assert.equal(product.sha256Bytes(span),binding.spanDigest);return {...binding,path:member.path,sourceLocator:source.DEFAULT_LIBRARY_STDO_SOURCE.basisRef,text:new TextDecoder('utf-8',{fatal:true}).decode(span)};}));
const owner={events:[],call,execution,graph:{template:graph.template},inputValue:task,inputDigest:product.sha256Canonical(task),inputRef:'input:controlled-planning',program:publication.programs[0]};
const candidate={publication,graphFunction:graph,declarationGraphFunctions:[...publication.graphFunctions,...library.graphFunctions],executionBasis:execution,cCall:call,
 cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
const file=resolve(pkg,'build/code/src/abg/instruction_assembly.js');let src=await readFile(file,'utf8');const needle='if (Buffer.byteLength(prompt) > task.state.original.maxPromptBytes)';
assert.equal(src.split(needle).length,2);src=src.replace(needle,'globalThis.__measurePrompt = Buffer.byteLength(prompt); '+needle);
const mod=new SourceTextModule(src,{identifier:file});await mod.link(async s=>{const actual=await import(s.startsWith('node:')?s:pathToFileURL(resolve(dirname(file),s)).href);
 const replace=s==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owner}:s==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidenceAtPrefix:()=>({...role,
 invocationAdmissionRef:execution.invocationAdmissionRef,environmentRef:publication.runEnvironments[0].declarationRef,environmentDigest:product.sha256Canonical(publication.runEnvironments[0]),
 evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent,accessContent:[]})}:{};
 const values={...actual,...replace};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v)});});
await mod.evaluate();const lookup=ref=>[...publication.contracts,...library.contracts].find(c=>c.contractRef===ref)??null;globalThis.__measurePrompt=null;
const measurement=mod.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,task,lookup);assert.equal(measurement.kind,'native_instruction_assembly');
assert(globalThis.__measurePrompt<=w.maxPromptBytes);

const e=selection.eventPrefix;assert.equal(sha(await readFile(e.path)),e.sha256,'preflight mutated durable prefix');
const dep=selection.offlineDependency;const depResult=execFileSync(dep.python,['-I','-B',dep.script,'--verify'],{encoding:'utf8',timeout:120000,maxBuffer:2097152});assert.deepEqual(JSON.parse(depResult),JSON.parse(await readFile(dep.inventory,'utf8')));
const pre={kind:'rc4_native_recovery_model_free_preflight',status:'prepared_not_dispatched',sourceCommit:selection.sourceCommit,bindingDigest,contextDigest:observed.observationDigest,readRoots:w.readRoots.length,selectedPaths:subjects.length,commands:configuration.commands.length,requiredExecutionBudgetMs:budget.requiredExecutionBudgetMs,limits,controlledSelector:{classification:'actual installed RC3 renderer/current observed Context/controlled owner-role premises; predictive only',promptBytes:globalThis.__measurePrompt,promptBound:w.maxPromptBytes,resultKind:measurement.kind},eventPrefix:e,providerCalls:0,RunAdmissions:0};
await exclusiveRecord(dir,'model-free-preflight.json',pre);
const out=join(dir,'execution');await mkdir(out,{mode:0o700});const record=(p,v,raw=false)=>exclusiveRecord(out,p,v,raw);
const caller=publicCaller({root:out,runtime,native:retained.native,command:()=>{throw Error('unexpected Public execution')},record,config:retained.config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
await record('run.json',{kind:'rc4_native_recovery_prepared_call',sourceCommit:selection.sourceCommit,bindingDigest,sourceBasis:'none',status:'not_dispatched'});await record('input.json',input);
const {call:preparedCall}=await constructLifecycleCall(caller,input);assert.equal(preparedCall.resources.source.kind,'none');await record('prepared-call.json',preparedCall);
assert.equal(sha(await readFile(e.path)),e.sha256,'call preparation changed durable prefix');
const result={kind:'rc4_native_recovery_prepared_call_binding',status:'prepared_not_dispatched',bindingDigest,sourceCommit:selection.sourceCommit,workloadSha256:selection.workload.sha256,inputFileSha256:sha(await readFile(join(out,'input.json'))),inputCanonicalDigest:product.sha256Canonical(input),callFileSha256:sha(await readFile(join(out,'prepared-call.json'))),callCanonicalDigest:product.sha256Canonical(preparedCall),invocationRef:preparedCall.invocation.invocationRef,installedRoot:retained.installedRoot,eventPrefix:e,preflightSha256:sha(await readFile(join(dir,'model-free-preflight.json'))),providerCalls:0,RunAdmissions:0};await record('PREPARED_CALL.json',result);console.log(JSON.stringify({status:result.status,record:out,callCanonicalDigest:result.callCanonicalDigest,contextDigest:observed.observationDigest,promptBytes:globalThis.__measurePrompt,budget:budget.requiredExecutionBudgetMs}));
