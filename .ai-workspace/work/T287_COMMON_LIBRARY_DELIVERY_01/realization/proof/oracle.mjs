// Independent finite expectations from accepted L2 proof, not from lane output.
import assert from 'node:assert/strict';

export const LANGUAGE = Object.freeze({
  input: Object.freeze({kind:'hello_world_input',schemaVersion:'5.0.0',subject:'World'}),
  output: Object.freeze({kind:'hello_world_output',schemaVersion:'5.0.0',message:'Hello World'}),
  owner:'product://abi5-tests/language-fixtures@5.0.0',
  program:'program://abi5-tests/language-smoke@5',
  graphFunction:'graph-function://abi5-tests/language-smoke@5',
});
const ref=(kind,name)=>`${kind}://registered-selection/${name}@5`;
export const NATIVE_TASK=Object.freeze({
  kind:'registered_selection_task',schemaVersion:'5.0.0',
  workerActorRef:ref('actor','executive'),workerBindingRef:ref('worker','native-selection'),
  task:'Choose a permitted registered capability that serves the current recipient requirement, or preserve an explicit gap.',
  observations:[
    {observationRef:ref('observation','record'),qualification:'Current record supplied for this invocation; not independently verified workspace state.',value:{service:'Atlas',status:'healthy'}},
    {observationRef:ref('observation','recipient'),qualification:'Current recipient requirement supplied for this invocation.',value:'The receiving service consumes a single JSON object and rejects labels, Markdown and prose. Preserve both field names and values.'},
  ],
  requiredSupportRefs:[ref('support','recipient-output')],
  childInput:{contractRef:ref('contract','child-input'),value:{kind:'selection_record_input',record:{service:'Atlas',status:'healthy'}}},
  maxPromptBytes:65536,
});
export const NATIVE_EXPECTED=Object.freeze({
  graphFunction:ref('graph-function','A'),
  output:Object.freeze({kind:'selection_rendered_record',schemaVersion:'5.0.0',child:'A',rendered:'{"service":"Atlas","status":"healthy"}'}),
});
export const PREPARATION=Object.freeze({
  fixtureOwner:'product://abi5-tests/sandbox-uat@5.0.0',
  program:'program://abi5-tests/sandbox-uat/lifecycle@5',
  root:'graph-function://abi5-tests/sandbox-uat/executive@5',
  ownedMembers:['graph-function://abi5-tests/sandbox-uat/executive@5','graph-function://abi5-tests/sandbox-uat/executive-step@5'],
});

// Inputs to these predicates are acquired owner values. No event folding occurs here.
export function preparationOracle({setup,first,warm,reusedValidation,copiedValidation,mutatedValidation,crossedLock}) {
  assert.equal(setup.installations.length,2);
  assert.equal(setup.fixture.publication.owningProductId,PREPARATION.fixtureOwner);
  const program=setup.fixture.publication.programs[0];
  assert.equal(program.programRef,PREPARATION.program);
  assert.deepEqual(setup.fixture.publication.graphFunctions.map(g=>g.name).sort(),[...PREPARATION.ownedMembers].sort());
  assert.equal(first.kind,'loaded_product_execution_resolution');
  assert.equal(first.program.programRef,PREPARATION.program);
  assert.equal(first.graphFunction.name,PREPARATION.root);
  assert.deepEqual(first.resolution,warm.resolution);
  assert.deepEqual(first.programValidation,warm.programValidation);
  assert.equal(reusedValidation,true,'same immutable Program validation identity');
  assert.equal(copiedValidation.sameIdentity,false,'copied raw carrier is revalidated');
  assert.deepEqual(copiedValidation.value,first.programValidation);
  assert.equal(mutatedValidation.kind,'raw_admission_refusal');
  assert.equal(crossedLock.kind,'product_execution_resolution_refusal');
  assert.equal(crossedLock.code,'incompatible_or_unproven');
  return {predicate:'P1 preparation and resolution',satisfied:true};
}
export function partialInstallOracle({receipt,originalBefore,originalAfter,secondAdmission,physical,previousPrefix,returnedPrefix}) {
  assert.equal(receipt.ownerOutput.outcomeKind,'refusal');
  assert.equal(receipt.ownerOutput.value.code,'target_failure');
  assert.ok(receipt.resources.installCandidate,'physical candidate coordinate was returned');
  assert.equal(receipt.resources.installedProduct,null);
  assert.equal(receipt.resources.installManifest,null);
  assert.equal(secondAdmission,null,'no second owner-admitted installation');
  assert.ok(originalBefore?.install); assert.deepEqual(originalAfter,originalBefore);
  assert.equal(receipt.resources.installCandidate.ref,originalBefore.install.installId,'same actual install scope');
  assert.deepEqual(receipt.resources.resolvedLock,{ref:originalBefore.resolvedLock.lockId,digest:originalBefore.resolvedLock.lockDigest});
  assert.equal(physical.manifestMatches,true); assert.equal(physical.membersMatch,true);
  assert.ok(returnedPrefix,'retain actual successor even when it differs');
  return {predicate:'P2 physical success and admission refusal',satisfied:true,
    prefixEquality:JSON.stringify(previousPrefix)===JSON.stringify(returnedPrefix),
    prefixRule:'Equality is an observation of actual owner coordinates, never inferred from target_failure.'};
}
export function executionOracle({receipt,reads,expected}) {
  assert.equal(receipt.ownerOutput.outcomeKind,'result');
  assert.equal(receipt.ownerOutput.value.disposition,'completed');
  assert.deepEqual(receipt.ownerOutput.value.terminalResult.value,expected);
  assert.deepEqual(reads.map(r=>r.memberKey).sort(),['run_replay','run_result']);
  for(const read of reads) {
    assert.equal(read.receipt.ownerOutput.outcomeKind,'result');
    assert.deepEqual(read.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);
    assert.deepEqual(read.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
    assert.deepEqual(read.receipt.resources.eventResource.closeHandoff.prefix,receipt.resources.eventResource.closeHandoff.prefix);
    assert.equal(read.eventBytesUnchanged,true);
  }
  return {predicate:'closed result and fresh owner reads',satisfied:true};
}
export function nativeOracle({receipt,reads,rawAnswer,roleBefore,roleAfter,provider,transport,observation,nativeStarts,graphCalls}) {
  const result=executionOracle({receipt,reads,expected:NATIVE_EXPECTED.output});
  assert.equal(rawAnswer.disposition,'selected');
  assert.equal(rawAnswer.graphFunctionRef,NATIVE_EXPECTED.graphFunction);
  assert.equal(nativeStarts,1);
  assert.deepEqual(graphCalls,[ref('graph-function','root'),ref('graph-function','A')]);
  assert.ok(roleBefore&&roleBefore!==false); assert.deepEqual(roleAfter,roleBefore);
  assert.equal(transport.command,provider.executable);
  for(const [flag,value] of [['--model','claude-opus-5-5'],['--effort','xhigh'],['--tools','']])
    assert.equal(transport.args[transport.args.indexOf(flag)+1],value);
  assert.equal(transport.args.includes('--fallback-model'),false);
  assert.equal(transport.args.includes('--no-session-persistence'),true);
  assert.equal(observation.toolCallCount,0);
  return {...result,predicate:'P4 one native machine recipient and retained source context',population:1};
}
