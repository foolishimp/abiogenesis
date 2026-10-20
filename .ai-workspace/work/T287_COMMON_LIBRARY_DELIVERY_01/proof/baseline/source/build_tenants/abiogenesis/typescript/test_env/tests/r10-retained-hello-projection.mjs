import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { projectRunTruthAtDurablePrefix, RunProjectionPort, GraphCallProjectionPort } from '../../build/code/src/abg/project_read_ports.js';
import { constructRunInvocationOutcome } from '../../build/code/src/product/run_invocation_operation.js';
const retained = path.resolve(import.meta.dirname, '../../../../fixture-program-selection-01/attempt-01');
const log = path.join(retained, 'events-01/runtime.events.jsonl');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expected = 'd2a677a2201dddb5b6f14d82b1c11e5d3cf95e9d369c30742cd750dac198e56c';
assert.equal(hash(log), expected);
const physical = fs.statSync(log), request = JSON.parse(fs.readFileSync(path.join(retained,'call-11.jsonl'),'utf8'));
const prefix = request.acquisition.closeHandoff.prefix;
const events = fs.readFileSync(log,'utf8').trim().split('\n').map(JSON.parse);
assert.equal(events.length,20);
const run = events.find(e=>e.kind==='run_segment_opened').runId;
const graph = events.find(e=>e.kind==='graph_call_opened').graphCallId;
const admitted = events.find(e=>e.kind==='c_call_result_admitted').payload;
const truth = projectRunTruthAtDurablePrefix(prefix,run);
assert.equal(truth.kind,'abg_run_truth_projection',JSON.stringify(truth));
assert.equal(truth.runtimeStatus,'closed');
const terminal = truth.terminalResult;
assert.deepEqual(terminal.value,{kind:'hello_world_output',message:'Hello World',schemaVersion:'5.0.0'});
assert.deepEqual(terminal.result,{ref:admitted.resultRef,digest:admitted.resultDigest});
assert.notEqual(terminal.result.digest,terminal.valueDigest);
assert.equal(terminal.contract.digest,'sha256:2e9414ffcb7c17b056ef717d46d7cf89251e3c35b2be29f7f8741286f7b428b1');
assert.equal(terminal.producer.graphCallRef,graph);
for(const member of ['invoke','start']) {
  const output = constructRunInvocationOutcome(member,truth);
  assert.equal(output.outcomeKind,'result');
  assert.equal(output.value.disposition,'completed');
  assert.deepEqual(output.value.terminalResult,terminal);
  assert.deepEqual(output.value.result,terminal.result);
}
for(const [member,port,target] of [['run_result',RunProjectionPort.run_result,run],['run_replay',RunProjectionPort.run_replay,run],['graph_call_result',GraphCallProjectionPort.graph_call_result,graph],['graph_call_replay',GraphCallProjectionPort.graph_call_replay,graph]]) {
  const output = port({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:member,prefix,targetRef:target});
  assert.equal(output.kind,'abg_project_read_projection',JSON.stringify(output));
  assert.deepEqual(output.value.terminalResult,terminal);
}
assert.equal(hash(log),expected);
assert.equal(fs.statSync(log).ino,physical.ino);assert.equal(fs.statSync(log).dev,physical.dev);assert.equal(fs.statSync(log).size,physical.size);
console.log(JSON.stringify({kind:'r10_retained_native_projection_check',disposition:'passed',nativeExecution:false,events:20,logSha256:expected,
  sixOwnerOutputsEqual:true,rootRequiresNoProof:true,terminalResult:terminal,limits:['read-only projection of earlier admitted Hello; not new installed CLI qualification','no child history in retained Hello']}));
