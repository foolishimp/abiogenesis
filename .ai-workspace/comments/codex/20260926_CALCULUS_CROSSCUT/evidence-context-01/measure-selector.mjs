import fs from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
const directory=import.meta.dirname,repo=resolve(directory,'../../../../..'),tenant=join(repo,'build_tenants/abiogenesis/typescript');
const load=name=>import(pathToFileURL(join(tenant,'build/code/src',name+'.js')));
const {sha256Canonical:hash}=await load('shared/digests'),{canonicalJson}=await load('shared/canonical_json');
const {SEMANTIC_REVISION_IDS:R}=await load('gtl/semantic_revision_identity');
const fixture=JSON.parse(fs.readFileSync(join(directory,'../evidence-recovery-01/native42-selector-component-fixture.json')));
const sources=JSON.parse(fs.readFileSync(join(directory,'role-source.json'))),selected=sources.roles.selector;
const publication=JSON.parse(fs.readFileSync(join(repo,sources.publication.path)));
const call={graphFunctionRef:selected.role.graphFunctionRef,programLocusRef:selected.role.programLocusRef,
 cCallRef:'component:selector-c-call',cCallDigest:hash('component:selector-c-call'),implementationRef:R.selectionImplementationRef,inputContractRef:R.selectionInputContractRef};
const owner={call,lifecycle:fixture.subject.envelope.declaration,events:[],inputRef:'component:selector-input',inputDigest:hash(fixture.input),
 execution:{invocationAdmissionRef:'component:selector-invocation',programRef:'program://odd-glc/native-semantic-revision/native-intake@5',basisRef:'component:selector-basis',basisDigest:hash('component:selector-basis')}};
const stdo={invocationAdmissionRef:owner.execution.invocationAdmissionRef,environmentRef:'component:selector-environment',environmentDigest:hash(selected.role),evidenceDigest:hash('component:selector-role-evidence'),
 role:'assessor',policy:selected.role.policy,contextPolicy:selected.role.contextPolicy,contextPolicyDigest:hash(selected.role.contextPolicy),frameRefs:selected.role.frameRefs,sourceContent:selected.sourceContent,accessContent:selected.accessContent};
const overrides={
 './execution_basis.js':{constructNativeInstructionAssemblyBasis:b=>b},
 './semantic_revision.js':{projectJobRevisionSubject:()=>({...fixture.subject,owner})},
 './stdo_environment.js':{projectRunEnvironmentRoleEvidence:()=>stdo},
 '../gtl/c_algebra.js':{cLeafTerms:()=>[{programLocusRef:call.programLocusRef}]},
 '../gtl/stdo_run_environment.js':{nativeContextLeafFamily:()=> 'assessor'},
};
const file=join(tenant,'build/code/src/abg/instruction_assembly.js'),module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file});
await module.link(async spec=>{const imported=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec))),values={...imported,...overrides[spec]};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await module.evaluate();
const basis={publication,graphFunction:{template:{nodes:[{term:{}}]}},cCall:call,predecessorPrefix:{component:true}};
const assembly=module.namespace.evaluateNativeInstructionAssembly(basis,fixture.input);
if(assembly.kind!=='native_instruction_assembly')throw Error(JSON.stringify(assembly));
const sections=assembly.envelope.sections,bytes=v=>Buffer.byteLength(canonicalJson(v));
const report={scope:fixture.claim,roleSource:'exact native42 selector declaration and complete source spans; role/execution admission are component premises',
 inputDigest:hash(fixture.input),parentDigest:hash(fixture.subject.parent.result.value),outcome:assembly.kind,promptBytes:Buffer.byteLength(assembly.request.prompt),
 selectorAssemblyMaxPromptBytes:null,boundExplanation:'constructRevisionSelectionAssembly has no maxPromptBytes check; the 1 MiB stage bound belongs to later Evidence author/assessor.',
 sections:Object.fromEntries(Object.entries(sections).map(([k,v])=>[k,bytes(v)])),
 evidenceFields:Object.fromEntries(Object.entries(sections.evidence).map(([k,v])=>[k,bytes(v)])),worksiteFields:Object.fromEntries(Object.entries(sections.worksite).map(([k,v])=>[k,bytes(v)]))};
fs.writeFileSync(join(directory,process.argv[2]??'selector-measurement.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
