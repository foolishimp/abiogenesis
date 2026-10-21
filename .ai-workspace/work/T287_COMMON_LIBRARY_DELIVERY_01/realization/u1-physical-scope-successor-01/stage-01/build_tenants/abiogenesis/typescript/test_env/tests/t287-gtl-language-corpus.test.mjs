// Fixed published corpus, actual conformance owner and sole validateProgram.
// Publication-local declarations are supplied; this is not installed proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as m01 from '@abiogenesis/typescript-tenant/gtl/m01';
import * as m03 from '@abiogenesis/typescript-tenant/abg/m03';
const root=process.env.ABI5_GTL_CORE_PACKAGE_ROOT;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'contracts/conformance/gtl-language-conformance-corpus.json')));
const {isProgramValidation}=await import(pathToFileURL(path.join(root,'build/code/src/validator/validation.js')));
const {evaluateGtlProgramConformanceFromResolvedClosure}=await import(pathToFileURL(path.join(root,'build/code/src/validator/conformance_operation.js')));
const clone=x=>structuredClone(x),ids=result=>[...new Set(result.diagnostics.map(x=>x.code))].sort();
const admit=value=>{const result=m03.admitGtlProgramConformanceInput(value);assert.equal(result.kind,'raw_admitted_value',JSON.stringify(result));return result;};
function mutate(value,row){let parent=value;for(const key of row.path.slice(0,-1))parent=parent[key];const key=row.path.at(-1);
 if(row.operation==='remove')delete parent[key];else if(row.operation==='replace')parent[key]=clone(row.value);
 else if(row.operation==='append')parent[key].push(clone(row.value));else if(row.operation==='append_first')parent[key].push(clone(parent[key][0]));else assert.fail('unknown fixed mutation operation');}

test('published seven-constructor/local-refusal cases exercise exact original recursive syntax',()=>{
 for(const row of corpus.constructors){assert.equal(m01.admitCProgramSyntax(row.syntax).kind,'raw_admitted_value',row.kind);}
 for(const row of corpus.localNegatives){const syntax=clone(corpus.constructors.find(x=>x.kind===row.constructorKind).syntax);mutate(syntax,row);
  const refused=m01.admitCProgramSyntax(syntax);assert.equal(refused.kind,'raw_admission_refusal',row.caseId);assert.equal(refused.code,row.expectedCode,row.caseId);
  assert(refused.message.includes(row.expectedPath),row.caseId+': '+refused.message);
  assert.throws(()=>m01.serializeCProgramCanonical(syntax),TypeError,row.caseId);
  assert.equal(m01.admitCProgramSyntax(corpus.constructors.find(x=>x.kind===row.constructorKind).syntax).kind,'raw_admitted_value','original restoration');
 }
});

test('fixed Program mutations reach the actual sole validator and restore the original positive',t=>{
 let mutations=0,restorations=0;
 for(const fixture of corpus.programs){const original=m03.typecheckGtlProgram(admit(fixture.packet));
  assert.equal(original.disposition,fixture.expectedDisposition,JSON.stringify(original));assert(isProgramValidation(original.validation));
  assert.deepEqual(ids(original),fixture.expectedDiagnosticIds);
  for(const row of fixture.mutations){const packet=clone(fixture.packet);
   const subject=row.target==='publication'?packet.publication:packet.program;mutate(subject,row);
   if(row.target==='program_and_published_program'){
    const index=packet.publication.programs.findIndex(p=>p.programRef===fixture.packet.program.programRef);assert(index>=0);
    packet.publication.programs[index]=clone(packet.program);
   }
   // Local admission must succeed: the refusal must originate in whole law.
   const input=admit(packet),failed=m03.typecheckGtlProgram(input);assert.equal(failed.disposition,'failed',row.caseId);
   assert.equal(failed.code,'validation_failed',row.caseId+': '+JSON.stringify(failed));
   assert.deepEqual(ids(failed),[...row.expectedDiagnosticIds].sort(),row.caseId+': '+JSON.stringify(failed.diagnostics));mutations++;
   const restored=m03.typecheckGtlProgram(admit(fixture.packet));assert.equal(restored.disposition,'passed',row.caseId+' restoration');
   assert(isProgramValidation(restored.validation));assert.deepEqual(restored,original);restorations++;
  }
 }
 t.diagnostic(JSON.stringify({actualOwner:'validator/conformance_operation',soleValidator:'validator/validation',programs:corpus.programs.length,mutations,restorations,RuntimeCalls:0}));
});

test('current input is exact, owner branded and preserves actual resolved-publication matching',()=>{
 const fixture=corpus.programs[0].packet,input=admit(fixture);
 assert.deepEqual(Object.keys(input.value).sort(),['kind','memberKey','program','publication','schemaVersion']);
 assert.equal(m03.typecheckGtlProgram({...input}).code,'invalid_packet');
 const extra=clone(fixture);extra.historicalInventory=[];assert.equal(m03.admitGtlProgramConformanceInput(extra).code,'invalid_kind');
 const malformed=clone(fixture);delete malformed.publication.graphFunctions[0].template.nodes[0].term.requirement;
 assert.equal(m03.admitGtlProgramConformanceInput(malformed).code,'invalid_kind');
 // This deliberately crossed closure is only a supplied negative lower premise;
 // the exact actual publication guard must refuse before using its declarations.
 const foreign=clone(fixture.publication);foreign.descriptorRef='descriptor://crossed';
 const refusal=evaluateGtlProgramConformanceFromResolvedClosure(input.value,{programPublication:foreign});
 assert.equal(refusal.code,'invalid_packet');assert.match(refusal.diagnostics[0].message,/differs from the original/);
});
