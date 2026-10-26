import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {Script} from 'node:vm';
import ts from 'typescript';

// Mechanical caller test, not native admission or a timeout-cause profile.
// Extract each exact emitted private function with the compiler's parser.
// Native ancestry/physical/constructor inputs are explicit deterministic stubs;
// the complete dependency loop, guards, query calls and ordering are real code.
// The owner is the current build's. The D2 cut's parent build and preimage,
// named through its displaced origins.json, are not held: the parent-versus-
// candidate equivalence and the sole-source-delta claim are retired (T-290
// C-18b), and each case keeps its claim about the current owner.
const work=path.resolve(import.meta.dirname,'../..');
const relative='build/code/src/abg/semantic_revision.js';
const candidateBytes=fs.readFileSync(path.join(work,relative));
function declaration(text,name,kind=ts.ScriptKind.JS){
  const ast=ts.createSourceFile('exact-owner',text,ts.ScriptTarget.Latest,true,kind);
  const matches=ast.statements.filter(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name);
  assert.equal(matches.length,1,'one exact owning declaration');return {ast,node:matches[0]};
}
const name='revisionPreparationAtBasis';
const bodies={candidate:declaration(candidateBytes.toString(),name).node.getText()};
const normalize=value=>JSON.parse(JSON.stringify(value));
function fixture({pending=20,dependencyCount=20,pendingIndices=null,invalidAt=null,early=null,queryResult='proof',queryError=null}={}){
  const trace=[],queries=[],constructed=[];
  const row=i=>({target:{targetRef:`target:${i}`,subject:{relativePath:`subject-${i}.mjs`},predecessorObservation:{state:'file',identity:`observation:${i}`}}});
  const targets=Array.from({length:dependencyCount+2},(_,i)=>row(i));
  if(invalidAt!==null)targets[invalidAt+2].target.predecessorObservation.state='absent';
  const input={current:{worksite:{targets}},revisionBasis:{request:{parent:{ref:'historical-parent'},causes:[]},selection:{selected:'two'},retainedBindings:['kept'],basisRef:'revision:one',basisDigest:'digest:one'}};
  const basis={marker:'native-basis-assumption'},owner={prefix:{marker:'owner-prefix'}},prior={worksite:{marker:'prior-worksite'}};
  const pendingSet=new Set(pendingIndices??Array.from({length:pending},(_,i)=>i));
  const proofs=targets.map((_,i)=>i>=2&&pendingSet.has(i-2)?{kind:'pending_binding_correspondence',ordinal:i}:{kind:'admitted_input',ordinal:i});
  const coordinates={historicalWorksite:{targets:targets.map(row=>({target:{targetRef:row.target.targetRef,subject:row.target.subject}}))},
    snapshotTargetRefs:targets.map(row=>row.target.targetRef),selectedTargetRefs:targets.slice(0,2).map(row=>row.target.targetRef)};
  const scope={
    // The body authenticates through the owned stage authenticator (67c333799).
    authenticateOwnedSemanticStageBasis:value=>{trace.push(['owner',value]);return early==='owner'?null:owner;},
    admitted:(value,coordinate)=>{trace.push(['parent',value,coordinate]);return early==='parent'?null:{result:{value:prior}};},
    isSemanticRevisionEnvelope:()=>false,
    isSemanticStageEnvelope:()=>early!=='stage',
    revisionWorksiteProjection:(...args)=>{trace.push(['origins',...args]);return early==='origins'?null:proofs;},
    projectRevisionHistoricalContext:(...args)=>{trace.push(['history',...args]);return early==='history'?null:[{kept:true}];},
    projectRevisionDesignCoordinates:(...args)=>{trace.push(['coordinates',...args]);return early==='coordinates'?null:coordinates;},
    deriveSemanticWorksiteConstructionConfiguration:(...args)=>{trace.push(['configuration',...args]);return early==='configuration'?null:{constructionTask:{targets:targets.slice(0,2)}};},
    projectWorksiteRevisionBindingOrigin:(prefix,value)=>{
      queries.push([prefix,value]);trace.push(['binding',prefix,value]);if(queryError!==null)throw queryError;
      if(queryResult===null)return null;
      return {kind:'admitted_binding_projection',resultAdmissionEventRef:`result:${prefix.marker}/${value.revisionBasis.basisRef}`,judgmentEventRef:'judgment:exact'};
    },
    constructWorksiteRevisionCommandPreparationInput:value=>{trace.push(['construct']);constructed.push(value);return value;},
  };
  return {basis,input,owner,prior,proofs,coordinates,scope,trace,queries,constructed};
}
function invoke(kind,options={},cut=undefined){
  const f=fixture(options),run=new Script(`(${bodies[kind]})`).runInNewContext(f.scope);
  let value,error;try{value=run(f.basis,f.input,false,cut);}catch(cause){error=cause;}
  return {...f,run,value,error};
}
test('zero, one and 20 pending dependencies: measured query calls are 0/1/1 and the output is the full preparation',t=>{
  const counts=[];
  for(const pending of [0,1,20]){
    const now=invoke('candidate',{pending});
    assert.equal(now.queries.length,pending===0?0:1);
    assert.equal(now.value.constructionTask.targets.length,2);assert.equal(now.value.snapshotTargetRefs.length,22);
    assert.equal(now.value.dependencyObservations.length,20);
    counts.push({pending,candidateCalls:now.queries.length});
  }
  t.diagnostic(JSON.stringify({scope:'exact emitted dependency-loop caller with deterministic owner stubs, not native profiling',counts}));
});

test('empty dependency vector and selected-only pending origins never evaluate the query',()=>{
  const empty=invoke('candidate',{pending:0,dependencyCount:0});assert.equal(empty.queries.length,0);assert.equal(empty.value.dependencyObservations.length,0);
  const f=fixture({pending:0});f.proofs[0]={kind:'pending_binding_correspondence'};f.proofs[1]={kind:'pending_binding_correspondence'};
  const run=new Script(`(${bodies.candidate})`).runInNewContext(f.scope);run(f.basis,f.input,true);
  assert.equal(f.queries.length,0);
});

test('mixed histories remain ordered and non-pending origins keep their own exact proof objects',()=>{
  const options={pendingIndices:[3,9,19]},now=invoke('candidate',options);
  assert.equal(now.queries.length,1);
  for(let i=0;i<20;i++){
    const dependency=now.value.dependencyObservations[i];assert.equal(dependency.designTargetRef,`target:${i+2}`);
    if(!options.pendingIndices.includes(i))assert.strictEqual(dependency.origin,now.proofs[i+2]);
  }
  assert.strictEqual(now.queries[0][0],now.owner.prefix);assert.strictEqual(now.queries[0][1],now.input);
});

test('all upstream refusal gates and first invalid row keep the no-query boundary',()=>{
  for(const early of ['owner','parent','stage','origins','history','coordinates','configuration']){
    const now=invoke('candidate',{early});
    assert.equal(now.value,null);assert.equal(now.queries.length,0);
  }
  const now=invoke('candidate',{invalidAt:0});
  assert.equal(now.error.message,'revision dependency is not an authenticated current regular file');assert.equal(now.queries.length,0);
});

test('null and thrown query results preserve the first cause without constructor or repeated evaluation',()=>{
  const newNull=invoke('candidate',{queryResult:null});
  assert.equal(newNull.error.message,'binding correspondence has no earlier admitted projection');
  assert.equal(newNull.queries.length,1);assert.equal(newNull.constructed.length,0);
  const exactError=new RangeError('exact owner refusal');
  const newThrow=invoke('candidate',{queryError:exactError});
  assert.strictEqual(newThrow.error,exactError);
  assert.equal(newThrow.queries.length,1);assert.equal(newThrow.constructed.length,0);
});

test('a later invalid row preserves its exact first refusal after the one legitimate lazy query',()=>{
  const now=invoke('candidate',{pendingIndices:[0,1,2,3],invalidAt:2});
  assert.equal(now.queries.length,1);assert.equal(now.constructed.length,0);
  assert.equal(now.error.message,'revision dependency is not an authenticated current regular file');
});

test('the explicit replay cut wins over owner.prefix and each invocation recomputes independently',()=>{
  const f=fixture(),run=new Script(`(${bodies.candidate})`).runInNewContext(f.scope);
  const cutA={marker:'recorded-cut-a'},cutB={marker:'recorded-cut-b'};
  const first=run(f.basis,f.input,false,cutA);assert.equal(f.queries.length,1);assert.strictEqual(f.queries[0][0],cutA);
  const second=run(f.basis,f.input,false,cutB);assert.equal(f.queries.length,2);assert.strictEqual(f.queries[1][0],cutB);
  const third=run(f.basis,f.input,true);assert.equal(f.queries.length,3);assert.strictEqual(f.queries[2][0],f.owner.prefix);
  const changed=structuredClone(f.input);changed.revisionBasis.basisRef='revision:two';
  const fourth=run(f.basis,changed,false,cutA);assert.equal(f.queries.length,4);assert.strictEqual(f.queries[3][1],changed);
  const fifth=run(f.basis,f.input,false,cutA);assert.equal(f.queries.length,5);assert.deepEqual(normalize(fifth),normalize(first));
  assert.notDeepEqual(normalize(first),normalize(second));assert.notDeepEqual(normalize(second),normalize(third));assert.notDeepEqual(normalize(first),normalize(fourth));
});
