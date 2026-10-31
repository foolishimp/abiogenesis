// Actual RC2 constructors/current worksite observation; controlled selector premises.
// No lifecycle admission, provider invocation, or event mutation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,lstat,stat,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {installedModules,publicCaller} from '../operator-client/public-setup.mjs';
import {assessmentSelection,consumerDeclaration,IDS} from '../operator-client/consumer.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const dir=join(base,'increment-b-03'),setup=join(base,'setup-001'),work='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
const sha=b=>createHash('sha256').update(b).digest('hex');
const fileSha=path=>new Promise((ok,no)=>{const h=createHash('sha256'),s=createReadStream(path);s.on('data',b=>h.update(b));s.on('error',no);s.on('end',()=>ok(h.digest('hex')))});
const args=process.argv.slice(2);assert(args.length===0 || args.length===1&&args[0]==='--check-only');
const wraw=await readFile(join(dir,'workload.json')),w=JSON.parse(wraw),census=JSON.parse(await readFile(join(dir,'snapshot-census.json'),'utf8'));
const retained=JSON.parse(await readFile(join(setup,'operator-resume-material.json'),'utf8'));
const priorRaw=await readFile(join(base,'attempt-004/after-run-resume.json')),prior=JSON.parse(priorRaw);
const priorExecution=JSON.parse(await readFile(join(base,'attempt-004/execution.json'),'utf8'));assert.equal(priorExecution.receipt.ownerOutput.outcomeKind,'result');
assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:work,encoding:'utf8'}).trim(),census.sourceCommit);
const partial=JSON.parse(await readFile(join(dir,'B02_SOURCE_CUSTODY.json'),'utf8'));
const status=execFileSync('/usr/bin/git',['status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],{cwd:work,encoding:'utf8'}).split('\0').filter(Boolean).map(s=>s.slice(3)).sort();
assert.deepEqual(status,partial.rows.filter(r=>r.gitStatus!=='  ').map(r=>r.path).sort());
assert.equal(retained.native.request.expectedArtifactDigest,'sha256:36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528');
assert.equal(retained.native.request.expectedManifestDigest,'sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d');
const eventPath=fileURLToPath(prior.state.closeHandoff.prefix.eventLogRef),eventStat=await stat(eventPath),eventSha=await fileSha(eventPath);
assert.equal(eventStat.size,prior.state.closeHandoff.prefix.prefixLength);
const runtime=await installedModules(retained.installedRoot),{product,gtl}=runtime;
const manifest=JSON.parse(await readFile(join(retained.installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(product.sha256Canonical(manifest),retained.native.request.expectedManifestDigest);
const caller=publicCaller({root:setup,runtime,native:retained.native,command:()=>{throw Error('unexpected execution')},record:()=>{throw Error('unexpected record')},config:retained.config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,prior.state);caller.installedRoot=prior.installedRoot;caller.workspaceAuthority=prior.workspaceAuthority;
const env=caller.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
for(const [path,row] of Object.entries(census.rows)){
 if(row.state==='absent'){await assert.rejects(lstat(join(work,path)),{code:'ENOENT'});continue}
 const data=await readFile(join(work,path));assert.equal(data.length,row.bytes,path);assert.equal(sha(data),row.sha256,path);
}
const observed=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observed.kind,'worksite_context_observation',JSON.stringify(observed));
for(const [path,row] of Object.entries(census.rows)){
 const actual=observed.entries.find(e=>e.relativePath===path);assert(actual,path);assert.equal(actual.state,row.state,path);
 if(row.state==='file')assert.equal(actual.digest,'sha256:'+row.sha256,path);
}
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js')).href);
const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},null);
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits={inactivityTimeoutMs:1800000,absoluteTimeoutMs:2100000};
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));
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
assert.equal((await stat(eventPath)).size,eventStat.size);assert.equal(await fileSha(eventPath),eventSha);
const result={kind:'rc3_b03_model_free_preflight',status:'prepared_not_dispatched',sourceCommit:census.sourceCommit,workloadSha256:sha(wraw),
 priorAfterRunSha256:sha(priorRaw),priorEvent:{bytes:eventStat.size,sha256:eventSha,coordinateDigest:prior.state.closeHandoff.prefix.coordinateDigest,unchanged:true},
 selectedPaths:subjects.length,present:census.presentFiles,absent:census.absentFiles,actualObservedEntries:observed.entries.length,contextDigest:observed.observationDigest,
 commandCount:configuration.commands.length,requiredExecutionBudgetMs:budget.requiredExecutionBudgetMs,candidateTimeoutLimits:limits,
 controlledSelector:{classification:'actual installed RC2 renderer, current real observed Context, controlled owner/role premises; no native B admission',promptBytes:globalThis.__measurePrompt,promptBound:w.maxPromptBytes,resultKind:measurement.kind},
 limits:['No native B03 Run or owner assembly admission created','Current B02 partial Result is not accepted B outcome; post-Construction C2 must observe exact sources','Only predictive initial rendering; later content and history can change size']};
if(args[0]==='--check-only'){const previous=JSON.parse(await readFile(join(dir,'model-free-preflight.json'),'utf8'));assert.deepEqual(result,previous)}
else await writeFile(join(dir,'model-free-preflight.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
