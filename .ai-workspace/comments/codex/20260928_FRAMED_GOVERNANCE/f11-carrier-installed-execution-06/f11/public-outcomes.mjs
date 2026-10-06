// Project the existing owner/host sum. This reader grants no execution authority.
import assert from 'node:assert/strict';
export function classifyInstalledOutcome({transport,terminal,call,installedPublic}){
 assert.equal(terminal.signal,null);assert.equal(terminal.timedOut,false);assert.equal(terminal.spawnError,null);
 if(transport.kind==='installed_definition_call_transport_refusal'){
  assert.equal(terminal.code,2);return {kind:'transport_refusal',receipt:null,transport,proceed:false};
 }
 assert.equal(transport.kind,'installed_definition_call_transport_result');
 const receipt=transport.receipt;
 assert.equal(receipt.kind,'definition_host_receipt');assert.equal(receipt.schemaVersion,'5.0.0');
 assert.deepEqual(receipt.definitionKey,call.invocation.definitionKey);
 assert.equal(receipt.invocationRef,call.invocation.invocationRef);assert.equal(terminal.code,receipt.exitCode);
 const definition=installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>
  d.definitionKey.operationId===receipt.definitionKey.operationId&&d.definitionKey.memberKey===receipt.definitionKey.memberKey);
 assert.ok(definition);
 if(receipt.exitCode===70){assert.equal(receipt.ownerOutput,null);assert.equal(receipt.resources,null);assert.ok(receipt.failure);
  return {kind:'execution_failure',receipt,transport,proceed:false};}
 assert.equal(receipt.failure,null);assert.ok(receipt.ownerOutput);
 const {outcomeKind,value}=receipt.ownerOutput;
 if(outcomeKind==='result'){assert.equal(receipt.exitCode,0);return {kind:'result',receipt,transport,proceed:true};}
 if(outcomeKind==='refusal'){assert.equal(receipt.exitCode,1);assert.ok(definition.refusalContract);
  const cold=receipt.definitionKey.operationId==='abg.operation.project.read'&&receipt.definitionKey.memberKey==='run_result'&&value?.code==='not_ready';
  return {kind:cold?'no_current_run_result':value?.code==='not_ready'?'not_ready':'refusal',receipt,transport,proceed:false};}
 assert.equal(outcomeKind,'nonterminal');assert.equal(receipt.exitCode,3);assert.ok(definition.nonTerminalContract);
 return {kind:'nonterminal',receipt,transport,proceed:false};
}
export function requirePublicResult(returned){
 if(returned.disposition.kind!=='result')throw Error('actual Public boundary '+returned.disposition.kind+'; retained receipt, no fallback');
 return returned.receipt.ownerOutput.value;
}
