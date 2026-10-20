// Pure actual-owner graph law. Fixture declarations and invocation/input basis
// are supplied static premises, never installed/admitted runtime evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {constructStructuralPublication,constructMemberVector,FAN_OUT_IDS} from '../fixtures/language-structural/program.mjs';
import {declarations as selectionPublication,ref as selectionRef,contract as selectionContract,select} from '../fixtures/registered-selection-product/index.mjs';

const tenant=fileURLToPath(new URL('../..',import.meta.url));
const core=process.env.ABI5_GTL_GRAPH_OWNER_CORE ?? resolve(tenant,'build/code/src');
const baselineCore=process.env.ABI5_GTL_GRAPH_BASELINE_CORE;
const load=(base,name)=>import(pathToFileURL(resolve(base,name)));
async function owners(base){
  const [gtl,raw,validator,materialization,graphValidator,paths,construction,serialization,digests]=await Promise.all([
    'gtl/index.js','validator/raw_admission.js','validator/validation.js','gtl/materialize.js','validator/graph.js',
    'gtl/source_path.js','gtl/graph_construction.js','gtl/serialization.js','shared/digests.js',
  ].map(name=>load(base,name)));
  return {gtl,raw,validator,materialization,graphValidator,paths,construction,serialization,digests};
}
const current=await owners(core),previous=baselineCore===undefined?null:await owners(baselineCore);
const corpus=JSON.parse(readFileSync(resolve(tenant,'contracts/conformance/gtl-language-conformance-corpus.json')));
const original=corpus.programs[0].packet.publication,clone=value=>structuredClone(value);
const artifact={productId:'product://abiogenesis/graph-law-fixture@5',artifactDigest:`sha256:${'1'.repeat(64)}`,
  productContentDigest:`sha256:${'2'.repeat(64)}`,productManifestDigest:`sha256:${'3'.repeat(64)}`,
  packageName:'@abiogenesis/graph-law-fixture',packageVersion:'5.0.0'};
function raw(o,value,kind){const r=o.raw.rawAdmitValue(value,kind,`contract://graph-law/${kind}`);
  assert.equal(r.kind,'raw_admitted_value',JSON.stringify(r));return r;}
function publishable(o){const pub=clone(original),graph=pub.graphFunctions[0];
  pub.contributions=[o.gtl.catalogContribution({handle:graph.name,kind:'graph_function',declarationOrContractRef:graph.name,
    owningProductId:pub.owningProductId,programMembershipRefs:[pub.programs[0].programRef],
    readinessPrerequisiteRefs:[pub.programs[0].programRef],compatibilityRefs:[],provenanceRefs:[pub.artifactDigest]})];return pub;}
function validate(o,source,programRef=source.programs[0].programRef,graphRef,input){
  const admitted=raw(o,source,'module_publication'),pub=admitted.value;
  const program=pub.programs.find(p=>p.programRef===programRef);assert(program);
  const publication=o.validator.validatePublication(admitted,pub.contributions.map(c=>raw(o,c,'catalog_contribution')));
  const whole=o.validator.validateProgram({declarationBasisDigest:admitted.subjectDigest,programPublication:admitted,
    program:raw(o,program,'gtl_program'),graphFunctions:pub.graphFunctions.map(g=>raw(o,g,'graph_function')),
    contracts:pub.contracts.map(c=>raw(o,c,'contract_declaration')),evaluators:pub.evaluators,rules:pub.rules,
    implementationBindings:pub.implementationBindings.map(b=>raw(o,b,'implementation_binding')),
    closureContracts:pub.closureContracts.map(c=>raw(o,c,'closure_contract'))});
  assert.equal(whole.kind,'program_validation',JSON.stringify(whole));
  const start=program.starts.find(s=>s.startRef===program.policies['abg.default_start_ref'])??program.starts[0];
  // A callable-only fixture Program may have no Public start. Materialize the
  // explicitly selected callable in that case; this supplies no entry credit.
  const graphFunction=pub.graphFunctions.find(g=>g.name===(graphRef??start?.graphFunctionRef??program.callableMembership[0]));assert(graphFunction);
  const value=input??{kind:pub.contracts.find(c=>c.contractRef===graphFunction.inputs[0]).valueKind};
  const basis={invocationAdmissionRef:'invocation://graph-law/supplied',admittedInputRef:'input://graph-law/supplied',
    admittedInputDigest:o.digests.sha256Canonical(value),admittedInput:value};
  const graph=o.materialization.materializeGraph(graphFunction,basis);
  const graphValidation=o.graphValidator.validateGraph(graph,whole,graphFunction,basis);
  assert.equal(graphValidation.kind,'graph_validation',JSON.stringify(graphValidation));
  return {pub,publication,whole,graphFunction,graph,basis,graphValidation};
}
function equivalent(a,b){for(const field of ['pub','publication','whole','graphFunction','graph','basis','graphValidation'])
  assert.deepEqual(a[field],b[field],`complete ${field}`);}
function addNode(pub,label,duplicate=false){const graph=pub.graphFunctions[0],seed=graph.template.nodes[0],node=clone(seed);
  node.nodeRef=duplicate?seed.nodeRef:`${seed.nodeRef}/${label}`;node.term.programLocusRef+=`/${label}`;node.term.armId+=`/${label}`;
  if(!duplicate){const binding=pub.implementationBindings.find(b=>b.bindingRef===seed.term.requirement.implementationBindingRef);
    const extra={...binding,bindingRef:`${binding.bindingRef}/${label}`,implementationRef:`${binding.implementationRef}/${label}`,
      inputContractRef:seed.term.outputCarrierRef};pub.implementationBindings.push(extra);
    node.term.inputCarrierRef=seed.term.outputCarrierRef;node.term.requirement.inputContractRef=seed.term.outputCarrierRef;
    node.term.requirement.implementationBindingRef=extra.bindingRef;}
  graph.template.nodes.push(node);return node;}
const mutants=[
  {name:'duplicate node identities with distinct C loci',code:'duplicate_identity',message:/duplicate node identities/,
    mutate:pub=>{addNode(pub,'duplicate',true);}},
  {name:'terminal node with outgoing edge',code:'topology_mismatch',message:/terminal GTL node cannot declare/,
    mutate:pub=>{const g=pub.graphFunctions[0],node=addNode(pub,'after-terminal');
      g.template.edges=[current.gtl.graphEdge({fromNodeRef:g.template.startNodeRef,toNodeRef:node.nodeRef})];g.template.terminalNodeRefs.push(node.nodeRef);}},
  {name:'two ordinary edges without registered selection',code:'topology_mismatch',message:/exactly one declared graph edge/,
    mutate:pub=>{const g=pub.graphFunctions[0],a=addNode(pub,'branch-a'),b=addNode(pub,'branch-b');
      g.template.edges=[a,b].map(n=>current.gtl.graphEdge({fromNodeRef:g.template.startNodeRef,toNodeRef:n.nodeRef}));
      g.template.terminalNodeRefs=[a.nodeRef,b.nodeRef];}},
];

test('released original corpus and owner-contributed baseline preserve complete producer/validation/materialization values',()=>{
  const untouched=validate(current,clone(original));assert.equal(untouched.publication.kind,'static_validation_refusal');
  assert(untouched.publication.diagnostics.every(d=>d.code==='invalid_contribution'));
  const good=validate(current,publishable(current));assert.equal(good.publication.kind,'publication_validation');
  assert.equal(current.paths.deriveCSourceContinuation(good.graph.template,good.graph.template.startNodeRef,
    current.paths.rootCSourcePath(good.graph.template.startNodeRef)).relation,'root_complete');
  if(previous){equivalent(untouched,validate(previous,clone(original)));equivalent(good,validate(previous,publishable(previous)));}
});
for(const row of mutants)test(`nearest static and materialization refusal: ${row.name}`,()=>{
  const pub=publishable(current);row.mutate(pub);const g=pub.graphFunctions[0];
  if(previous){const accepted=validate(previous,clone(pub));assert.equal(accepted.publication.kind,'publication_validation');
    if(row.code==='duplicate_identity')assert.equal(accepted.whole.executableLeafRows.length,2);
    assert.equal(current.materialization.rehydrateMaterializedGtlGraph(clone(accepted.graph)),null,'copied malformed graph cannot regain materialization identity');}
  for(const [subject,kind] of [[pub,'module_publication'],[g,'graph_function'],
    [{...clone(corpus.programs[0].packet),publication:pub},'conformance_evaluate_packet']]){
    const refused=current.raw.rawAdmitValue(subject,kind,`contract://graph-law/${kind}`);
    assert.equal(refused.kind,'raw_admission_refusal');assert.equal(refused.code,'invalid_kind');assert.match(refused.message,row.message);}
  assert(current.construction.graphTemplateDiagnostics(g.template).some(d=>d.code===row.code&&row.message.test(d.message)));
  assert.throws(()=>current.serialization.serializeGraphFunction(g),row.message);
  assert.throws(()=>current.construction.promoteGraphFunction({name:`${g.name}/promoted`,source:g,
    sourceRef:g.inputs[0],targetRef:g.outputs[0]}),row.message);
  assert.throws(()=>current.materialization.materializeGraph(g,{invocationAdmissionRef:'invocation://graph-law/supplied',
    admittedInputRef:'input://graph-law/supplied',admittedInputDigest:current.digests.sha256Canonical({kind:'supplied'}),admittedInput:{kind:'supplied'}}),row.message);
  const refused=current.paths.deriveCSourceContinuation(g.template,g.template.startNodeRef,current.paths.rootCSourcePath(g.template.startNodeRef));
  assert.equal(refused.kind,'c_source_path_refusal');assert.match(refused.message,row.message);
  assert.equal(validate(current,publishable(current)).whole.kind,'program_validation','unchanged baseline restored');
});

test('existing constructor and source-path guards retain their earlier refusal precedence',()=>{
  const pub=publishable(current);addNode(pub,'duplicate',true);const g=pub.graphFunctions[0];
  assert.throws(()=>current.construction.promoteGraphFunction({name:g.name,source:g,sourceRef:g.inputs[0],targetRef:g.outputs[0]}),/distinct identity/);
  const malformed=current.paths.resolveCProgramTermAtSourcePath(g.template,g.template.startNodeRef,['wrong-root']);
  assert.match(malformed.message,/rooted at the exact declared node/);
  const missing=current.paths.resolveCProgramTermAtSourcePath(g.template,'node://missing',current.paths.rootCSourcePath('node://missing'));
  assert.equal(missing.code,'term_path_missing');
  const local=clone(pub);local.graphFunctions[0].template.nodes[0].term.vectorIndex=-1;
  const first=current.raw.rawAdmitValue(local,'module_publication','contract://graph-law/module');
  assert.equal(first.kind,'raw_admission_refusal');assert(!/duplicate node identities/.test(first.message),'prior C-local refusal remains first');
});

test('authored composition, substitution, recursion and fan-out retain full static and materialized owner results',()=>{
  const pub=constructStructuralPublication(current.gtl,artifact);
  const old=previous===null?null:constructStructuralPublication(previous.gtl,artifact);
  for(const program of pub.programs){const input=program.programRef===FAN_OUT_IDS.programRef?constructMemberVector(['Alpha','Beta','Gamma']):undefined;
    const actual=validate(current,pub,program.programRef,undefined,input);assert.equal(actual.publication.kind,'publication_validation');
    assert.equal(current.materialization.rehydrateMaterializedGtlGraph(clone(actual.graph)).kind,'gtl_graph');
    if(old){const expected=validate(previous,old,program.programRef,undefined,input);equivalent(actual,expected);
      for(const node of actual.graph.template.nodes){const source=current.paths.rootCSourcePath(node.nodeRef);
        assert.deepEqual(current.paths.deriveCSourceContinuation(actual.graph.template,node.nodeRef,source),
          previous.paths.deriveCSourceContinuation(expected.graph.template,node.nodeRef,source));}}
  }
  const fan=validate(current,pub,FAN_OUT_IDS.programRef,FAN_OUT_IDS.graphFunctionRef,constructMemberVector(['Alpha','Beta','Gamma']));
  assert.equal(fan.graph.fanOutMaterializations[0].members.length,3);
  assert.equal(fan.graph.template.nodes[0].term.terms[0].tasks.length,3);
});

function selectionModule(o){const declared=selectionPublication(o.gtl);
  return o.gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...declared,
    artifactDigest:artifact.artifactDigest,productContentDigest:artifact.productContentDigest,productManifestDigest:artifact.productManifestDigest,
    contributions:declared.contributions.map(c=>({...c,provenanceRefs:[artifact.artifactDigest,artifact.productManifestDigest]}))});}
test('declared registered selection keeps its multi-edge workflow domain and separate whole-law checks',()=>{
  const pub=selectionModule(current),program=pub.programs[0];
  const actual=validate(current,pub,program.programRef,selectionRef('graph-function','root'));
  // The existing fixture repeats child-input in each child's carried environment.
  // Preserve that independent publication refusal; this positive exercises the
  // complete whole-Program/Graph and registered-selection owners, not publication.
  assert.equal(actual.publication.kind,'static_validation_refusal');
  assert.deepEqual(actual.publication.diagnostics.map(d=>[d.code,d.path]),['A','B'].map(name=>[
    'duplicate_identity',`$.graphFunctions[${selectionRef('graph-function',name)}].environment.carries`]));
  assert(actual.publication.diagnostics.every(d=>/duplicate GraphFunction carried environment ref/.test(d.message)));
  const g=actual.graphFunction,source={currentNodeRef:selectionRef('node','select'),termPath:current.paths.rootCSourcePath(selectionRef('node','select'))};
  assert.equal(g.template.edges.filter(e=>e.fromNodeRef===source.currentNodeRef).length,2);
  const definitions=Object.fromEntries(actual.pub.graphFunctions.map(g=>[g.name,current.digests.sha256Canonical(g)]));
  const catalog=['A','B'].map(name=>({name,graphFunctionRef:selectionRef('graph-function',name),definitionDigest:definitions[selectionRef('graph-function',name)]}));
  const choice=select({choice:'A',catalog,payload:'supplied-static-premise'}).resultCandidate;
  const selected=current.gtl.resolveRegisteredSelection(g.template,source,selectionContract('choice'),choice,definitions);
  assert.equal(selected.graphFunctionRef,selectionRef('graph-function','A'));
  if(previous){const expected=validate(previous,selectionModule(previous),program.programRef,g.name);equivalent(actual,expected);
    assert.deepEqual(selected,previous.gtl.resolveRegisteredSelection(expected.graph.template,source,selectionContract('choice'),choice,definitions));}
  const ordinary=clone(g);ordinary.template.applications=[];
  const refusal=current.raw.rawAdmitValue(ordinary,'graph_function','contract://graph-law/graph');assert.equal(refusal.kind,'raw_admission_refusal');
  assert.match(refusal.message,/exactly one declared graph edge/);
  const missingPolicy=clone(pub);missingPolicy.rules=[];const admitted=raw(current,missingPolicy,'module_publication');
  const p=admitted.value.programs[0],value=admitted.value;
  const failed=current.validator.validateProgram({declarationBasisDigest:admitted.subjectDigest,programPublication:admitted,
    program:raw(current,p,'gtl_program'),graphFunctions:value.graphFunctions.map(g=>raw(current,g,'graph_function')),
    contracts:value.contracts.map(c=>raw(current,c,'contract_declaration')),evaluators:value.evaluators,rules:value.rules,
    implementationBindings:value.implementationBindings.map(b=>raw(current,b,'implementation_binding')),
    closureContracts:value.closureContracts.map(c=>raw(current,c,'closure_contract'))});
  assert.equal(failed.kind,'static_validation_refusal');assert(failed.diagnostics.some(d=>d.code==='invalid_application'));
});
