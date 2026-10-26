import assert from 'node:assert/strict';
import test from 'node:test';
import {product,gtl,recovery,selector,sourceObservationSkip,staticDeclarations} from '../support/d1-preserved-result-harness.mjs';
const ids=product.WORKSITE_PRESERVED_RESULT_IDS;
const clone=structuredClone;

test('closed recovery constructor validates as a whole Program and borrowed native closure (unadmitted readiness assumptions)',{skip:sourceObservationSkip},()=>{
  const d=staticDeclarations();
  assert.equal(d.validate().kind,'program_validation',JSON.stringify(d.validate()));
  assert.equal(d.closure().kind,'resolved_program_declaration_closure',JSON.stringify(d.closure()));
  assert.deepEqual(gtl.worksitePreservedResultSourceOfGraphFunction(d.graph),selector);
  for(const mutate of [
    g=>{delete g.declarations['abg.preserved_result_source'];},
    g=>{const source=JSON.parse(g.declarations['abg.preserved_result_source']);source.callerBytes='forbidden';g.declarations['abg.preserved_result_source']=JSON.stringify(source);},
    g=>{g.declarations['abg.compute_regime']='F_P';},
    g=>{g.declarations['abg.failure_contract']='contract://mechanical/crossed';},
    g=>{g.template.nodes[0].term.terms[0].requirement.implementationBindingRef=ids.deriveBindingRef;},
  ]){
    const bad=staticDeclarations(graph=>{const next=clone(graph);mutate(next);return next;});
    assert.equal(gtl.worksitePreservedResultSourceOfGraphFunction(bad.graph),null);
    assert.equal(bad.validate().kind,'static_validation_refusal');
    const closed=bad.closure();assert.equal(closed.kind,'execution_declaration_closure_refusal');
    assert.equal(closed.code,'wrong_owner');
  }
});

// Retired (T-290 C-5): 'C0/C1/C3 algorithms, closed identities and old
// publication rows are conserved'. Its inputs are the D2 implementation-04
// predecessor build (comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-04/
// work/build/code/src/gtl/worksite_construction.js, sha256:bc1891c25cdf…, 23816
// bytes) and the nine D1 source preimages under
// comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/
// preserved-result-implementation-01/preimages/source/ (worksite_construction.ts
// sha256:4a81e0d6a5d3…, worksite_effect.ts sha256:efc956ddde88…). The claim is
// false today: all nine current sources differ from their preimages, and the
// current publication's graphFunctions, programs, closureContracts,
// contributions, contracts and implementationBindings differ from the
// predecessor's. A conservation claim against a superseded cut cannot be met
// without weakening it.

test('complete protocol records select one acknowledged proposal and reject ambiguity without normalizing bytes',()=>{
  const input={kind:'worksite_construction_worker_result',schemaVersion:'5.0.0',files:[]};
  const proposal={type:'assistant',session_id:'session-one',message:{content:[{type:'tool_use',id:'tool-one',name:'StructuredOutput',input}]}};
  const ack={type:'user',session_id:'session-one',message:{content:[{type:'tool_result',tool_use_id:'tool-one',content:'Structured output provided successfully'}]}};
  const line=value=>JSON.stringify(value)+'\n',valid=line(proposal)+line(ack),project=value=>recovery.projectPreservedStructuredProposal(Buffer.from(value));
  assert.deepEqual(project(valid+'{"type":"result","incomplete":').workerCandidate,input);
  const failures=[
    ['missing ack',line(proposal)],['duplicate proposal',line(proposal)+valid],['duplicate ack',valid+line(ack)],
    ['reversed ack',line(ack)+line(proposal)],['foreign session',line(proposal)+line({...ack,session_id:'other'})],
    ['foreign tool id',line(proposal)+line({...ack,message:{content:[{...ack.message.content[0],tool_use_id:'other'}]}})],
    ['ordinary tool',line({...proposal,message:{content:[{...proposal.message.content[0],name:'Read'}]}})+line(ack)],
    ['ordinary streamed tool',line({type:'stream_event',event:{content_block:{type:'tool_use',name:'Read'}}})+valid],
    ['failed ack',line(proposal)+line({...ack,message:{content:[{...ack.message.content[0],is_error:true}]}})],
    ['contradictory result',valid+line({type:'result',subtype:'success'})],['protocol error',valid+line({type:'error'})],
    ['nested protocol error',valid+line({type:'stream_event',event:{type:'error'}})],
    ['duplicate JSON key',valid.replace('"type":"assistant"','"type":"user","type":"assistant"')],
    ['complete malformed JSON',valid+'{"type":"result",}\n'],
  ];
  for(const [name,bytes]of failures)assert.throws(()=>project(bytes),name);
  assert.throws(()=>recovery.projectPreservedStructuredProposal(Buffer.from([0xff,10])),'invalid UTF8');
});

// Retired (T-290 C-18b): 'actual proposal rebinds through real Product
// identities ...', 'current-call, admitted predecessor, independent
// regeneration and replay owner joins ...' and 'historical proof rejects
// missing chunks, crossed dispatch/prompt/attempt and late bytes ...'. Each
// read the native event store the D1 source observation names: another
// repository's test run (odd_glc .../d1-semantic-lifecycle-04/events-01/
// runtime.events.jsonl, 38903576 bytes, sha256:54910ff6e8d2..., store identity
// device 16777230 inode 448915801), outside ABI5_EVIDENCE_ROOT and held by no
// tracked record. Making it real under the root is an evidence copy, which
// TD-19 forbids, so the three cases skipped in every configuration.
