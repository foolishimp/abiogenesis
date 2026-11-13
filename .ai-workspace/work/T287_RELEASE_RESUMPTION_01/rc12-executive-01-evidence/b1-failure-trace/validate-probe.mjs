// RC12 B1 validation-only probe (no Run): does the validator admit a declared
// re_enter from a wrapper invoke node back to the selection preparation in
// executive-step, or a C.retry around a wrapper's workflow.C term?
import {writeFileSync} from 'node:fs';
const T='/private/tmp/abg-rc12-executive-20261111/build_tenants/abiogenesis/typescript';
const S='/private/tmp/abg-rc12-executive-20261111/qualification-scratch/rc12-executive-01/b1';
const gtl=await import(T+'/test_env/support/language-test-gtl.mjs');
const product=await import(T+'/build/code/src/product/index.js');
const validator=await import(T+'/build/code/src/validator/index.js');
const {requirePublicationValidations}=await import(T+'/test_env/support/root-installed-environment.mjs');
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
function validation(publication,program,publications){
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract:fixture');if(r.kind!=='raw_admitted_value')throw new Error(JSON.stringify(r));return r;};
  const p=raw(publication,'module_publication'),unique=(key,values)=>[...new Map(values.map(v=>[v[key],v])).values()];
  return validator.validateProgram({declarationBasisDigest:p.subjectDigest,programPublication:p,program:raw(program,'gtl_program'),
    graphFunctions:unique('name',publications.flatMap(p=>p.graphFunctions)).map(v=>raw(v,'graph_function')),
    contracts:unique('contractRef',publications.flatMap(p=>p.contracts)).map(v=>raw(v,'contract_declaration')),
    evaluators:unique('name',publications.flatMap(p=>p.evaluators)),rules:unique('name',publications.flatMap(p=>p.rules)),
    implementationBindings:unique('bindingRef',publications.flatMap(p=>p.implementationBindings)).map(v=>raw(v,'implementation_binding')),
    closureContracts:unique('closureContractRef',publications.flatMap(p=>p.closureContracts)).map(v=>raw(v,'closure_contract'))});
}
const out={};
const pubs=constructors.map(n=>gtl[n](basis)),library=pubs[0];
const stepName=product.governanceRef('graph-function','executive-step');
const summarize=r=>({kind:r.kind,disposition:r.disposition,diagnostics:(r.diagnostics??[]).map(d=>({code:d.code,path:d.path,message:d.message}))});
out.baseline=summarize(validation(library,library.programs[0],pubs));
// 1. Declared re_enter: source = construction wrapper invoke node, target = prepare-selection node.
const step=library.graphFunctions.find(g=>g.name===stepName);
const invoke=step.template.nodes.find(n=>n.nodeRef.endsWith('/construction@5/invoke'))??step.template.nodes[3];
const prepare=step.template.nodes[0];
const leafRef=t=>t.programLocusRef??t.term?.programLocusRef??null;
out.reenterDeclaration={sourceNode:invoke.nodeRef,sourceTermKind:invoke.term.kind,sourceLocus:leafRef(invoke.term),targetNode:prepare.nodeRef,targetLocus:leafRef(prepare.term)};
const state=product.governanceContract('state');
let reenter;
try{reenter=gtl.reenterApplication({inputContractRef:state,outputContractRef:state,graphFunctionRef:stepName,
  sourceProgramLocusRef:leafRef(invoke.term)??invoke.nodeRef,targetProgramLocusRef:leafRef(prepare.term)??prepare.nodeRef,maxApplications:3});out.reenterConstruct='constructed';}
catch(e){out.reenterConstruct='threw: '+e.message;}
if(reenter){
  const pub=structuredClone(library),s=pub.graphFunctions.find(g=>g.name===stepName);s.template.applications.push(reenter);
  try{out.reenterValidation=summarize(validation(pub,pub.programs[0],[pub,...pubs.slice(1)]));}catch(e){out.reenterValidation='threw: '+e.message.slice(0,1500);}
  try{requirePublicationValidations(validator,[pub]);out.reenterPublication='valid';}catch(e){out.reenterPublication='threw: '+e.message.slice(0,1500);}
}
// 2. C.retry around the construction wrapper's workflow.C term inside executive-step.
try{
  const pub=structuredClone(library),s=pub.graphFunctions.find(g=>g.name===stepName),n=s.template.nodes.find(x=>x.nodeRef===invoke.nodeRef);
  const fresh=gtl.defaultGovernanceGraphFunctions().find(g=>g.name===stepName).template.nodes.find(x=>x.nodeRef===invoke.nodeRef).term;
  n.term=JSON.parse(JSON.stringify(gtl.C.retry(fresh,2)));out.retryConstruct={kind:n.term.kind,inner:n.term.term.kind};
  try{out.retryValidation=summarize(validation(pub,pub.programs[0],[pub,...pubs.slice(1)]));}catch(e){out.retryValidation='threw: '+e.message.slice(0,1500);}
  try{requirePublicationValidations(validator,[pub]);out.retryPublication='valid';}catch(e){out.retryPublication='threw: '+e.message.slice(0,1500);}
}catch(e){out.retryConstruct='threw: '+e.message;}
// 3. C.retry around the native-work leaf inside the construction wrapper (its work call node).
try{
  const pub=structuredClone(library),w=pub.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','construction')),n=w.template.nodes[1];
  const fresh=gtl.defaultGovernanceGraphFunctions().find(g=>g.name===product.governanceRef('graph-function','construction')).template.nodes[1].term;
  n.term=JSON.parse(JSON.stringify(gtl.C.retry(fresh,2)));out.wrapperRetryConstruct={node:n.nodeRef,kind:n.term.kind,inner:n.term.term.kind};
  try{out.wrapperRetryValidation=summarize(validation(pub,pub.programs[0],[pub,...pubs.slice(1)]));}catch(e){out.wrapperRetryValidation='threw: '+e.message.slice(0,1500);}
}catch(e){out.wrapperRetryConstruct='threw: '+e.message;}
// 4. Does any library graph declare retry or re_enter today?
out.declaredToday=library.graphFunctions.map(g=>({name:g.name.replace(/^.*\//,''),applications:g.template.applications.map(a=>a.relationKind),
  termKinds:g.template.nodes.map(n=>n.term.kind),bound:g.template.applications.find(a=>a.relationKind==='recurse')?.bound??null}));
writeFileSync(S+'/validate-probe.json',JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1).slice(0,6000));
