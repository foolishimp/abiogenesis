// Pure external diagnostic regression. No Product module or resource is imported.
import assert from 'node:assert/strict';
import {actualOwnerContext} from './f11/proof-oracles.mjs';
let trapCalls=0,prepareCalls=0;
const input={probe:'opaque admitted-input premise supplied by pure fixture'};
const constructed={call:{resources:{catalog:{},catalogView:{},applications:{},source:{},
  qualificationResources:{},eventResource:{}},invocation:{request:{input:{value:input}}}}};
const run=async kind=>{
  const owner={kind,qualificationResources:{probe:true},admittedInput:input,
    toJSON(){trapCalls++;throw new Error('FULL_OWNER_SERIALIZATION_TRAP');}};
  const caller={product:{ProductRunInvocationPort:{async prepare(){prepareCalls++;return owner;}}},
    abg:{hasAdmittedProductInstall(){throw new Error('unused lower premise called');}},
    state:{environment:{productInstalls:[],workspaceBinding:{},artifactTruth:{}}}};
  return actualOwnerContext(caller,constructed);
};
const success=await run('prepared_product_run_invocation');assert.equal(success.kind,'prepared_product_run_invocation');
await assert.rejects(()=>run('refused_product_run_invocation'),error=>error.code==='ERR_ASSERTION'&&
  error.actual==='refused_product_run_invocation'&&error.expected==='prepared_product_run_invocation');
assert.equal(trapCalls,0);assert.equal(prepareCalls,2);
console.log(JSON.stringify({status:'GO_PURE_DIAGNOSTIC_TRAP_PROBE',preparedOwnerPassed:true,wrongKindRefused:true,
  fullOwnerToJSONCalls:trapCalls,pureStubPrepareCalls:prepareCalls,ProductImports:0,RunOrResourceEffects:0,
  suppliedPremises:'pure stub returns owner/input/resources; this proves only diagnostic execution and unchanged kind refusal'}));
