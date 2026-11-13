// Actual RC3 constructors/current worksite observation; controlled selector premises.
// No lifecycle admission, provider invocation, or event mutation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,lstat,realpath,stat,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {loadReuse} from './reuse-state.mjs';
import {installedModules,publicCaller} from '../operator-client/public-setup.mjs';
import {assessmentSelection,consumerDeclaration,IDS} from '../operator-client/consumer.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const dir=join(base,'single-machine-p1-03'),setup=dir,work='/Users/jim/src/apps/abiogenesis-single-machine-p1';
const sha=b=>createHash('sha256').update(b).digest('hex');
const fileSha=path=>new Promise((ok,no)=>{const h=createHash('sha256'),s=createReadStream(path);s.on('data',b=>h.update(b));s.on('error',no);s.on('end',()=>ok(h.digest('hex')))});
const {selection,retained:reused}=await loadReuse();
const args=process.argv.slice(2);assert(args.length===0 || args.length===1&&args[0]==='--check-only');
const wraw=await readFile(join(dir,'workload-v2.json')),w=JSON.parse(wraw),censusRaw=await readFile(join(dir,'snapshot-census.json')),census=JSON.parse(censusRaw);
assert.equal(sha(wraw),selection.workloadSha256);assert.equal(sha(censusRaw),selection.sourceCensusSha256);
const grant=JSON.parse(await readFile(join(dir,'NATIVE_GRANT.json'),'utf8'));
assert.deepEqual(w.workOrders.construction.writeRoots,grant.Construction.writePaths);assert.equal(grant.Construction.writePaths.length,10);
assert(Object.entries(w.workOrders).every(([role,order])=>role==='construction'||order.writeRoots.length===0));
assert.equal(w.testing.selectedPaths.length,963);assert.equal(w.readRoots.length,selection.readRootCount);assert.equal(w.testing.commands.length,9);
assert.deepEqual(w.testing.commands[1].args.slice(2),[...grant.Construction.writePaths].sort());
assert.deepEqual(w.testing.commands[6].args.slice(3),grant.Testing.focusedFiles.map(p=>p.slice('build_tenants/abiogenesis/typescript/'.length)));
assert.equal(w.task,await readFile(join(work,selection.assessmentInputs.find(r=>r.role==='task').target),'utf8'));
const retained=reused,prior=reused,priorRaw=await readFile(selection.priorAfterRunResume.path);
assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:work,encoding:'utf8'}).trim(),census.sourceCommit);
const bindings=JSON.parse(await readFile(join(base,'increment-b-07/B07_SOURCE_BINDINGS.json'),'utf8'));
assert.equal(await realpath(bindings.stdo.configuredPath),bindings.stdo.resolvedEntrypoint.path);
assert.equal(await realpath('/Users/jim/.local/pipx/venvs/stdo-toolchain/bin/python'),bindings.stdo.interpreter.path);
for(const root of ['/opt/homebrew/bin','/usr/bin','/bin','/usr/sbin','/sbin'])await assert.rejects(lstat(join(root,'stdo')),{code:'ENOENT'});
for(const row of [bindings.stdo.resolvedEntrypoint,bindings.stdo.interpreter,bindings.stdo.releaseManifest,...bindings.stdo.toolchainModuleSources]){const bytes=await readFile(row.path);assert.equal(bytes.length,row.bytes);assert.equal(sha(bytes),row.sha256,'STDO toolchain drift: '+row.path)}
const affected=w.testing.commands.filter(c=>c.commandId.endsWith('/affected-owner-tests'));assert.equal(affected.length,1);
for(const [key,value] of Object.entries(bindings.stdo.explicitAffectedTestEnvironment))assert.equal(affected[0].environment[key],value,'STDO environment drift: '+key);

execFileSync('/usr/bin/git',['diff','--quiet'],{cwd:work});execFileSync('/usr/bin/git',['diff','--cached','--quiet'],{cwd:work});
assert.equal(retained.native.request.expectedArtifactDigest,'sha256:0f77694c1930b069477afd39f0f33bcd53d1e60522b45c32da75b93b1628ac2c');
assert.equal(retained.native.request.expectedManifestDigest,'sha256:14d5b7d1379ba17f6f425bbf3766c1b4ff524cfc4b25dbeedc30e64b5d03c700');
const eventPath=fileURLToPath(prior.state.closeHandoff.prefix.eventLogRef),eventStat=await stat(eventPath),eventSha=await fileSha(eventPath);
assert.equal(eventStat.size,prior.state.closeHandoff.prefix.prefixLength);assert.equal('sha256:'+eventSha,prior.state.closeHandoff.prefix.prefixDigest);
const runtime=await installedModules(retained.installedRoot),{product,gtl}=runtime;
const manifest=JSON.parse(await readFile(join(retained.installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(product.sha256Canonical(manifest),retained.native.request.expectedManifestDigest);
for(const install of retained.setup.installations)assert(await product.installedProductContentMatches(install),'installed Product drift');
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
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits={inactivityTimeoutMs:2400000,absoluteTimeoutMs:5400000};
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
const result={kind:'single_machine_p1_model_free_preflight',status:'prepared_not_dispatched',sourceCommit:census.sourceCommit,workloadSha256:sha(wraw),
 priorAfterRunSha256:sha(priorRaw),priorEvent:{bytes:eventStat.size,sha256:eventSha,coordinateDigest:prior.state.closeHandoff.prefix.coordinateDigest,unchanged:true},
 selectedPaths:subjects.length,present:census.presentFiles,absent:census.absentFiles,actualObservedEntries:observed.entries.length,contextDigest:observed.observationDigest,
 commandCount:configuration.commands.length,requiredExecutionBudgetMs:budget.requiredExecutionBudgetMs,candidateTimeoutLimits:limits,
 controlledSelector:{classification:'actual installed RC3 renderer, current real observed Context, controlled owner/role premises; no native P1 admission',promptBytes:globalThis.__measurePrompt,promptBound:w.maxPromptBytes,resultKind:measurement.kind},
 limits:['No native P1 Run or owner assembly admission created','Post-Construction C2 must observe exact new sources','Only predictive initial rendering; later content and history can change size']};
if(args[0]==='--check-only'){const previous=JSON.parse(await readFile(join(dir,'model-free-preflight.json'),'utf8'));assert.deepEqual(result,previous)}
else await writeFile(join(dir,'model-free-preflight.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
