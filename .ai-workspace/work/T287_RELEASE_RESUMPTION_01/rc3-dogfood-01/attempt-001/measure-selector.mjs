// Bounded model-free discriminator: installed RC2 renderer, controlled authority
// premises, exact admitted A01 input. No native dispatch or source mutation.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {consumerDeclaration,IDS} from '../operator-client/consumer.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const retained=JSON.parse(await readFile(join(base,'setup-001/operator-resume-material.json'),'utf8'));
const pkg=retained.installedRoot,load=p=>import(pathToFileURL(join(pkg,'build/code/src',p+'.js')).href);
const [product,gtl,source]=await Promise.all(['product/index','gtl/index','gtl/default_library'].map(load));
const verified=retained.native.verified,basis={productId:verified.productId,packageName:verified.packageName,packageVersion:verified.packageVersion,
 artifactDigest:verified.artifactDigest,productContentDigest:verified.productContentDigest,productManifestDigest:verified.manifestDigest};
const lines=(await readFile(join(base,'setup-001/resources/events/runtime.events.jsonl'),'utf8')).trim().split('\n');
const event=lines.map(JSON.parse).find(e=>e.kind==='c_call_result_admitted'&&e.payload?.resultRef==='result://abiogenesis/0ea0c3ddbd421c88a68b79378164227daaad6af1fbf259893e8a9ed432f62b2e');
assert(event);const original=event.payload.value;
const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
const data=consumerDeclaration(gtl,product,library,4),publication=gtl.modulePublication({...data,
 artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,
 contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
const graph=publication.graphFunctions.find(g=>g.name===IDS.stepRef),node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select'));
const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']),role=publication.runEnvironments[0].roles.find(r=>r.role==='selector');
const call={regime:'F_P',cCallRef:'call:controlled-planning',cCallDigest:product.sha256Canonical('call'),graphFunctionRef:graph.name,
 programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
const execution={programRef:IDS.programRef,basisRef:'basis:controlled-planning',basisDigest:product.sha256Canonical('basis'),invocationAdmissionRef:'invocation:controlled-planning',
 registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
const sourceContent=await Promise.all(role.sourceBindings.map(async binding=>{
 const member=publication.runEnvironments[0].contexts.find(c=>c.contextRef===binding.contextRef).members.find(m=>m.memberRef===binding.memberRef);
 const asset=Object.values(source.DEFAULT_LIBRARY_STDO_SOURCE.members).find(a=>a.path===member.path),bytes=await readFile(join(pkg,asset.assetPath));
 assert.equal(product.sha256Bytes(bytes),binding.memberDigest);const span=bytes.subarray(binding.startByte,binding.endByte);assert.equal(product.sha256Bytes(span),binding.spanDigest);
 return {...binding,path:member.path,sourceLocator:source.DEFAULT_LIBRARY_STDO_SOURCE.basisRef,text:new TextDecoder('utf-8',{fatal:true}).decode(span)};
}));
async function measure(task){
 const owner={events:[],call,execution,graph:{template:graph.template},inputValue:task,inputDigest:product.sha256Canonical(task),inputRef:'input:controlled-planning',program:publication.programs[0]};
 const candidate={publication,graphFunction:graph,declarationGraphFunctions:[...publication.graphFunctions,...library.graphFunctions],
 executionBasis:execution,cCall:call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
 const file=resolve(pkg,'build/code/src/abg/instruction_assembly.js');let src=await readFile(file,'utf8');
 const needle='if (Buffer.byteLength(prompt) > task.state.original.maxPromptBytes)';assert.equal(src.split(needle).length,2);
 src=src.replace(needle,'globalThis.__measurePrompt = Buffer.byteLength(prompt); '+needle);
 const m=new SourceTextModule(src,{identifier:file});
 await m.link(async s=>{const actual=await import(s.startsWith('node:')?s:pathToFileURL(resolve(dirname(file),s)).href);
 const replacements=s==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owner}:
 s==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidenceAtPrefix:()=>({...role,invocationAdmissionRef:execution.invocationAdmissionRef,
 environmentRef:publication.runEnvironments[0].declarationRef,environmentDigest:product.sha256Canonical(publication.runEnvironments[0]),
 evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent,accessContent:[]})}:{};
 const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
 await m.evaluate();const lookup=ref=>[...publication.contracts,...library.contracts].find(c=>c.contractRef===ref)??null;
 globalThis.__measurePrompt=null;const result=m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,task,lookup);
 return {promptBytes:globalThis.__measurePrompt,resultKind:result.kind,cause:result.cause??null,taskProjectionBytes:Buffer.byteLength(JSON.stringify(product.projectFramedSynthesisPromptTask(task)))};
}
const revised=structuredClone(original);
const omit=path=>path==='rc3-operator-inputs/increment-a-01/stdo/manifest.json'||path.startsWith('rc3-operator-inputs/increment-a-01/stdo/standards/');
const removed=revised.state.original.sources.filter(s=>omit(s.path));revised.state.original.sources=revised.state.original.sources.filter(s=>!omit(s.path));
assert.equal(removed.length,6);assert.deepEqual(revised.state.original.testing,original.state.original.testing);
assert.deepEqual(revised.state.original.workOrders,original.state.original.workOrders);assert.deepEqual(revised.state.original.assessment,original.state.original.assessment);
assert.deepEqual(revised.state.original.readRoots,original.state.original.readRoots);assert.equal(revised.state.original.task,original.state.original.task);
const before=await measure(original),after=await measure(revised);assert(before.promptBytes>original.state.original.maxPromptBytes);assert(after.promptBytes<=revised.state.original.maxPromptBytes);
console.log(JSON.stringify({classification:'installed RC2 selector renderer with controlled authority/role premises and exact retained A01 task; no admission or model call',
 originalRef:event.payload.resultRef,promptBound:original.state.original.maxPromptBytes,original:before,revised:after,
 removedInlineSources:removed.map(x=>x.path),preserved:['full original task','all work orders and outcomes','all assessment sources and rubric','all read roots','all 904 selected testing paths','method copies and verified runtime method basis'],
 limits:['controlled authority/role premises; not actual new Run admission','current input only; later history or material changes require fresh measurement']},null,2));
