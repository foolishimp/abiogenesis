// Proof-tool check only. Synthetic carriers below are never Product evidence.
import assert from 'node:assert/strict';
import {LANGUAGE,NATIVE_EXPECTED,executionOracle,partialInstallOracle} from './oracle.mjs';
const cases=[];
const rejected=(name,fn)=>{assert.throws(fn);cases.push({name,outcome:'oracle rejected synthetic counterexample'});};
const prefix={kind:'synthetic-prefix',ordinal:1};
const receipt={ownerOutput:{outcomeKind:'result',value:{disposition:'completed',terminalResult:{value:LANGUAGE.output}}},
  resources:{replay:{synthetic:true},eventResource:{closeHandoff:{prefix}}}};
const reads=['run_result','run_replay'].map(memberKey=>({memberKey,eventBytesUnchanged:true,receipt:{ownerOutput:{outcomeKind:'result',value:{projection:{terminalResult:receipt.ownerOutput.value.terminalResult,replay:receipt.resources.replay}}},resources:receipt.resources}}));
executionOracle({receipt,reads,expected:LANGUAGE.output});
rejected('literal greeting change',()=>executionOracle({receipt,reads,expected:{...LANGUAGE.output,message:'Hello World!'}}));
rejected('labelled renderer is not compact JSON',()=>executionOracle({receipt,reads,expected:NATIVE_EXPECTED.output}));
rejected('missing fresh replay',()=>executionOracle({receipt,reads:reads.slice(0,1),expected:LANGUAGE.output}));
rejected('fresh read appended bytes',()=>executionOracle({receipt,reads:[{...reads[0],eventBytesUnchanged:false},reads[1]],expected:LANGUAGE.output}));
const original={install:{installId:'synthetic-install'},resolvedLock:{lockId:'synthetic-lock',lockDigest:'synthetic-digest'}};
const partial={receipt:{ownerOutput:{outcomeKind:'refusal',value:{code:'target_failure'}},resources:{installCandidate:{ref:'synthetic-install'},installedProduct:null,installManifest:null,resolvedLock:{ref:'synthetic-lock',digest:'synthetic-digest'}}},originalBefore:original,originalAfter:original,secondAdmission:null,physical:{manifestMatches:true,membersMatch:true},previousPrefix:prefix,returnedPrefix:{...prefix,ordinal:2}};
assert.equal(partialInstallOracle(partial).prefixEquality,false);cases.push({name:'actual successor prefix may differ',outcome:'oracle preserves unequal prefix without asserting unchanged history'});
rejected('outer refusal lacks physical candidate',()=>partialInstallOracle({...partial,receipt:{...partial.receipt,resources:{...partial.receipt.resources,installCandidate:null}}}));
rejected('second admission exists',()=>partialInstallOracle({...partial,secondAdmission:{synthetic:true}}));
rejected('original installation lost',()=>partialInstallOracle({...partial,originalAfter:null}));
process.stdout.write(JSON.stringify({status:'passed',scope:'independent oracle fault sensitivity only; no Product/runtime/provider execution',cases},null,2)+'\n');
