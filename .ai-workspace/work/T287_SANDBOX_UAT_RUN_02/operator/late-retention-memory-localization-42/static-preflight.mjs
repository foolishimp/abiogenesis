import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL,fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
const phase=fileURLToPath(new URL('.',import.meta.url));
const prep=JSON.parse(readFileSync(phase+'preparation.json','utf8'));
const t0=performance.now();
function checked(pin){const st=lstatSync(pin.path);assert(st.isFile()&&!st.isSymbolicLink());const b=readFileSync(pin.path);assert.equal(b.length,pin.byteCount);assert.equal(createHash('sha256').update(b).digest('hex'),pin.sha256);return b;}
const previous=JSON.parse(checked(prep.owner39Preparation));
const triples=previous.ownerPins.concat(prep.extraRequiredOwnerTriples);
for(const row of triples){checked(row.source);assert(checked(row.built).equals(checked(row.installed)));}
for(const pin of Object.values(prep.closedRefs))checked(pin);
checked(prep.diagnosticPreimage);
const owner=name=>pathToFileURL(triples.find(row=>row.source.path.endsWith('/'+name+'.ts')).installed.path);
const {sha256Canonical}=await import(owner('shared/digests'));
const {resolveProgramDeclarationClosure}=await import(owner('product/declaration_closure'));
const {constructCatalogProgramValidationInput}=await import(owner('product/catalog_operations'));
const {validateProgram,isProgramValidation}=await import(owner('validator/validation'));
let report;
try{
 const request=JSON.parse(checked(prep.conformanceSource));
 const resources=request.invocation.resources, declaration=resources.declarationCatalog;
 const closure=resolveProgramDeclarationClosure(declaration.catalog,declaration.catalogView,resources.packet.program.programRef);
 assert.equal(closure.kind,'resolved_program_declaration_closure');
 const input=constructCatalogProgramValidationInput(declaration.catalog,declaration.catalogView,closure,resources.packet.program);
 assert.notEqual(input.kind,'raw_admission_refusal');
 const validation=validateProgram(input);assert(isProgramValidation(validation));assert(Array.isArray(validation.graphFunctionDigests));
 const functions=closure.publications.flatMap(publication=>publication.graphFunctions),rows=[];
 function inspect(value,path,parentRef){
  if(value===null||typeof value!=='object')return;
  if(value.kind==='c_workflow'){
   const matches=functions.filter(g=>g.name===value.graphFunctionRef&&validation.graphFunctionDigests.includes(sha256Canonical(g)));
   assert.equal(matches.length,1,'unique owned child at '+parentRef+':'+path);
   const digest=sha256Canonical(matches[0]);assert.equal(validation.graphFunctionDigests.filter(d=>d===digest).length,1);
   rows.push({parentGraphFunctionRef:parentRef,path,childGraphFunctionRef:value.graphFunctionRef,childDigest:digest});
  }
  for(const [key,child] of Object.entries(value))inspect(child,path+'/'+key,parentRef);
 }
 for(const gf of functions)inspect(gf,'',gf.name);
 assert(rows.length>0);
 const target='graph-function://abi5-tests/sandbox-uat/executive-step@5';
 assert(rows.some(row=>row.childGraphFunctionRef===target),'exact executive-step child is validated');
 assert(rows.some(row=>row.parentGraphFunctionRef===target),'exact executive-step has validated referenced children');
 const s=readFileSync(phase+'diagnostic.mjs','utf8');assert(!/\.\w*Digests\s*\[/.test(s));
 report={kind:'static_original_packet_child_join_preflight',status:'pass',wallMs:performance.now()-t0,validationRef:validation.validationRef,programRef:validation.programRef,graphFunctionCount:functions.length,referencedChildren:rows,remainingDigestKeyAssumptions:[],sameInstalledClosureAndValidationOwners:true,noFullEventRead:true,noRuntimeEffects:true};
}catch(error){report={kind:'static_original_packet_child_join_preflight',status:'stopped',wallMs:performance.now()-t0,error:{name:error.name,message:String(error),stack:error.stack},noFullEventRead:true,noRetry:true};process.exitCode=1;}
writeFileSync(phase+'static-preflight.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:report.status,wallMs:report.wallMs,childJoinCount:report.referencedChildren?.length,error:report.error}));
