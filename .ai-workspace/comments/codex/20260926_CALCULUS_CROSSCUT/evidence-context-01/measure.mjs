import fs from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
const directory=dirname(new URL(import.meta.url).pathname),repo=resolve(directory,'../../../../..'),tenant=join(repo,'build_tenants/abiogenesis/typescript');
const load=name=>import(pathToFileURL(join(tenant,'build/code/src',name+'.js')));
const {sha256Canonical:hash}=await load('shared/digests'),{canonicalJson}=await load('shared/canonical_json');
const {SEMANTIC_REVISION_IDS:R}=await load('gtl/semantic_revision_identity');
const events=JSON.parse(fs.readFileSync(join(directory,'native42-selected-events.json'))).events;
const result=events.find(e=>e.admissionOrdinal===109418),opened=events.find(e=>e.admissionOrdinal===109457);
const input=result.payload.value,stage=input.current.declaration.stages[4],roleSource=JSON.parse(fs.readFileSync(join(directory,'role-source.json')));
const publication=JSON.parse(fs.readFileSync(join(repo,roleSource.publication.path)));
const declared=roleSource.roles.author,role=declared.role;
const call={...opened.payload,graphFunctionRef:opened.graphFunctionRef,implementationRef:R.authorImplementationRef,inputContractRef:R.envelopeContractRef};
const owner={role:'author',stage,lifecycle:input.current.declaration,events:[],call,inputDigest:hash(input),inputRef:result.payload.resultRef,
 execution:{invocationAdmissionRef:'component:native42-evidence',programRef:'program://odd-glc/native-semantic-revision/from-design@5',basisRef:opened.basisId,basisDigest:hash('component-basis')}};
const stdo={invocationAdmissionRef:owner.execution.invocationAdmissionRef,environmentRef:'component:retained-evidence-role',environmentDigest:hash(role),evidenceDigest:hash('component-evidence'),
 role:'author',policy:role.policy,contextPolicy:role.contextPolicy,contextPolicyDigest:hash(role.contextPolicy),frameRefs:role.frameRefs,sourceContent:declared.sourceContent,accessContent:declared.accessContent};
let captured;
const overrides={
 './execution_basis.js':{constructNativeInstructionAssemblyBasis:b=>b},
 './semantic_job.js':{authenticateSemanticJobBasis:()=>owner},
 './semantic_revision.js':{semanticJobRevisionInputMatchesBasis:()=>true,projectJobRevisionSubject:()=>({currentWorksite:null,origins:[]})},
 './stdo_environment.js':{projectRunEnvironmentRoleEvidence:()=>stdo},
 '../gtl/c_algebra.js':{cLeafTerms:()=>[{programLocusRef:call.programLocusRef}]},
 '../gtl/stdo_run_environment.js':{nativeContextLeafFamily:()=> 'author'},
 '../shared/digests.js':{sha256Canonical:value=>{if(value?.sections?.evidence?.observed)captured=value.sections;return hash(value);}},
};
const file=join(tenant,'build/code/src/abg/instruction_assembly.js'),module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file});
await module.link(async spec=>{const imported=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec))),values={...imported,...overrides[spec]};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});await module.evaluate();
const basis={publication,graphFunction:{template:{nodes:[{term:{}}]}},cCall:call,predecessorPrefix:{component:true}};
const outcome=module.namespace.evaluateNativeInstructionAssembly(basis,input);if(!captured)throw Error('Assembly did not reach rendering');
const bytes=value=>Buffer.byteLength(canonicalJson(value)),prompt=stage.assembly.sectionOrder.map(name=>`## ${name}\n${canonicalJson(captured[name])}`).join('\n\n');
const report={scope:'Actual admitted input and exact published role/source spans; auth/prefix/role admission are component premises. No actor/current-worksite read.',inputDigest:hash(input),stageRef:stage.declarationRef,
 outcomeKind:outcome.kind,refusal:outcome.kind==='native_instruction_assembly_refusal'?outcome:null,maxPromptBytes:stage.assembly.maxPromptBytes,promptBytes:Buffer.byteLength(prompt),
 sections:Object.fromEntries(Object.entries(captured).map(([k,v])=>[k,bytes(v)])),evidenceFields:Object.fromEntries(Object.entries(captured.evidence.observed).map(([k,v])=>[k,bytes(v)])),
 commands:input.current.evidence.executionObservation.commandResults.length,predicates:input.current.evidence.executionObservation.predicateObservations.length,artifacts:input.current.evidence.artifacts.length};
const output=process.argv[2]??'measurement.json';fs.writeFileSync(join(directory,output),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
export {input,captured,hash,canonicalJson,stage,directory};
