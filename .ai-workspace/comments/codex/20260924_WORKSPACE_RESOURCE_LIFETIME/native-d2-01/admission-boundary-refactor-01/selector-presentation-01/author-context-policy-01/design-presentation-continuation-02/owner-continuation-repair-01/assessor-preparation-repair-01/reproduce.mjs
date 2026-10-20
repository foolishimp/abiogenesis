import fs from 'node:fs';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
const OUT=process.argv[2], N=process.argv[3], core=N+'/preparation/products/core38/node_modules/@abiogenesis/typescript-tenant/build/code/src';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const {sha256Canonical:hash,sha256Bytes}=await import(pathToFileURL(core+'/shared/digests.js'));
const {canonicalJson}=await import(pathToFileURL(core+'/shared/canonical_json.js'));
const {SEMANTIC_REVISION_IDS:R}=await import(pathToFileURL(core+'/gtl/semantic_revision_identity.js'));
const source=fs.readFileSync(core+'/abg/instruction_assembly.js','utf8');
const marker='if (bytes.length > stage.assembly.maxPromptBytes)';
if(source.split(marker).length!==2)throw Error('expected one existing job bound');
const parsePrompt=name=>{const parts=fs.readFileSync(N+'/preparation/invocation/archives/'+name+'-prompt.txt','utf8').split(/^## (\w+)\n/m);return Object.fromEntries(Array.from({length:(parts.length-1)/2},(_,i)=>[parts[i*2+1],JSON.parse(parts[i*2+2])]));};
const authorPrompt=parsePrompt('fp-d63439a0a2870c79'),selector=parsePrompt('fp-5ad0d2741602da0e');
const publication=read(resolve(N,'../../../publication-01/prospective-publication.json'));
const prior=read(N+'/first-cause-suffix/80934-c_call_result_admitted.jsonl').payload;
const admitted=read(N+'/first-cause-suffix/87788-c_call_result_admitted.jsonl').payload;
if(hash(admitted.value)!==admitted.valueDigest || hash(prior.value)!==prior.valueDigest)throw Error('retained body digest');
const allContent=[...authorPrompt.role.environment.sourceContent,...selector.task.runEnvironment.sourceContent];
let owner,supplied,stdo,captured;
globalThis.__captureAssessorDraft=(value)=>{captured=value;};
const overrides={
 './execution_basis.js':{constructNativeInstructionAssemblyBasis:b=>b},
 './semantic_job.js':{authenticateSemanticJobBasis:()=>owner,semanticJobInputMatchesBasis:(_b,x)=>hash(x)===hash(supplied)},
 './semantic_revision.js':{semanticJobRevisionInputMatchesBasis:(_b,x)=>hash(x)===hash(supplied),projectJobRevisionSubject:()=>({currentWorksite:null,origins:[]})},
 './stdo_environment.js':{projectRunEnvironmentRoleEvidence:()=>stdo},
 '../gtl/c_algebra.js':{cLeafTerms:()=>[{programLocusRef:owner.call.programLocusRef}]},
 '../gtl/stdo_run_environment.js':{nativeContextLeafFamily:()=>owner.role}
};
const path=core+'/abg/instruction_assembly.js';
const mod=new SourceTextModule(source.replace(marker,'globalThis.__captureAssessorDraft({sections,prompt,bytes:bytes.length,plan});\n    '+marker),{identifier:path});
await mod.link(async specifier=>{const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(path),specifier)).href);const values={...native,...overrides[specifier]};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await mod.evaluate();
function run(role,payload,openedFile){
 supplied=payload.value;const opened=read(N+'/first-cause-suffix/'+openedFile),stage=supplied.current.declaration.stages.find(s=>s.declarationRef==='stage://odd-glc/generic-lifecycle/design@5');
 const call={...opened.payload,graphFunctionRef:opened.graphFunctionRef,inputContractRef:R.envelopeContractRef,implementationRef:role==='author'?R.authorImplementationRef:R.assessorImplementationRef};
 const matches=publication.runEnvironments.flatMap(e=>e.roles).filter(r=>r.graphFunctionRef===call.graphFunctionRef&&r.programLocusRef===call.programLocusRef&&r.role===role);
 if(!matches.length||!matches.every(r=>hash(r)===hash(matches[0])))throw Error('role correspondence');
 const r=matches[0],sourceContent=r.sourceBindings.filter((b,i,rows)=>rows.findIndex(x=>hash(x)===hash(b))===i).map(b=>{
  const row=allContent.find(x=>Object.entries(b).every(([k,v])=>x[k]===v));if(!row||sha256Bytes(Buffer.from(row.text))!==b.spanDigest)throw Error('missing exact span '+b.spanDigest);return row;
 });
 owner={role,stage,lifecycle:supplied.current.declaration,events:[],call,inputDigest:hash(supplied),inputRef:payload.resultRef,execution:{invocationAdmissionRef:'component:retained-role',programRef:'program://odd-glc/native-semantic-revision/from-design@5',basisRef:opened.basisId,basisDigest:hash(opened.basisId)}};
 stdo={invocationAdmissionRef:owner.execution.invocationAdmissionRef,environmentRef:'component:retained-role',environmentDigest:hash(r),evidenceDigest:hash('component-role-evidence'),role,policy:r.policy,contextPolicy:r.contextPolicy,contextPolicyDigest:hash(r.contextPolicy),frameRefs:r.frameRefs,sourceContent,accessContent:authorPrompt.evidence.environmentAccess};
 const basis={publication,graphFunction:{template:{nodes:[{term:{}}]}},cCall:call,predecessorPrefix:{component:true}};
 const result=mod.namespace.evaluateNativeInstructionAssembly(basis,supplied);if(!captured)throw Error('draft did not reach bound');
 return{captured,result,sourceContent:sourceContent.map(({text,...identity})=>({...identity,textBytes:Buffer.byteLength(text)})),inputDigest:hash(supplied)};
}
const author=run('author',prior,'80973-c_call_opened.jsonl'),assessor=run('assessor',admitted,'87794-c_call_opened.jsonl');
const bytes=x=>Buffer.byteLength(canonicalJson(x));
const sections=assessor.captured.sections;
const inventory=Object.fromEntries(Object.entries(sections).map(([k,v])=>[k,{bytes:bytes(v),members:Array.isArray(v)?v.map((x,i)=>({index:i,bytes:bytes(x)})):v&&typeof v==='object'?Object.entries(v).map(([name,x])=>({name,bytes:bytes(x)})):[]}]));
fs.writeFileSync(OUT+'/reproduced-sections.json',canonicalJson(sections)+'\n');
const info={scope:'Pure retained-input component reproduction; not a retained historical draft or newly authenticated runtime assembly',premises:['Exact native38 inline input/output Result bodies and real declared stage/role/source spans.','Existing instruction-assembly implementation executes with disclosed basis/role/current-context authentication premises, as existing focused component fixture.','Only an in-memory observation hook before unchanged byte guard; no cap change.','Source content comes from exact retained author/selector prompt span identities; STDO access projection reused from same invocation.','Current native target/origin projection is empty preconstruction as retained author prompt; no physical/history acquisition.'],installedOwnerSha256:sha256Bytes(Buffer.from(source)),inputDigest:assessor.inputDigest,authorControl:{promptBytes:author.captured.bytes,retainedPromptBytes:fs.statSync(N+'/preparation/invocation/archives/fp-d63439a0a2870c79-prompt.txt').size,sectionsEqual:hash(author.captured.sections)===hash(authorPrompt),resultKind:author.result?.kind},assessor:{promptBytes:assessor.captured.bytes,maxPromptBytes:1048576,overflowBytes:assessor.captured.bytes-1048576,result:assessor.result,promptDigest:sha256Bytes(Buffer.from(assessor.captured.prompt)),sectionFramingBytes:assessor.captured.bytes-Object.values(sections).reduce((sum,x)=>sum+bytes(x),0)},inventory,selectedSourceSpans:assessor.sourceContent};
fs.writeFileSync(OUT+'/reproduction.json',JSON.stringify(info,null,2)+'\n');
console.log(JSON.stringify({authorControl:info.authorControl,assessor:info.assessor,inventory},null,2));
