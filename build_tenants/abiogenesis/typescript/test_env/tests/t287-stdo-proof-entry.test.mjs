import assert from "node:assert/strict";
import test from "node:test";
import {selectPreservedCatalogReceipt} from "../support/stdo-environment-pilot.mjs";
import {evidenceGate} from "../support/evidence-root.mjs";

// The retained RC7 task 1B call 9 and receipt 9 resolve through catalogue row
// stdo-proof-entry-run-nine under ABI5_EVIDENCE_ROOT.
const runNine=evidenceGate("stdo-proof-entry-run-nine");
const retained={skip:runNine.kind==="absent"&&runNine.reason};
const retainedPair=async()=>({
  call:JSON.parse(runNine.inputs.call.bytes.toString("utf8")).invocation,
  receipt:JSON.parse(runNine.inputs.receipt.bytes.toString("utf8")).receipt,
});

// Retired (T-292 TD-60): the SDK proof imports the declared export of the frozen RC7 task 1A install; input the installed package of that host recorded value gone

test("successful receipt nine is retained without changing its request or receipt",retained,async()=>{
  const {call,receipt}=await retainedPair(),before=JSON.stringify({call,receipt});
  const selected=selectPreservedCatalogReceipt(call,receipt);
  assert.equal(selected.preservedCatalogReceipt,receipt);
  assert.equal(JSON.stringify({call,receipt}),before);
});

test("retained success rejects mismatched invocation, catalog or physical handoff",retained,async()=>{
  const {call,receipt}=await retainedPair();
  for(const alter of [
    value=>value.invocationRef+="/foreign",
    value=>value.ownerOutput.value.catalog.digest="sha256:"+"0".repeat(64),
    value=>value.resources.eventResource.closeHandoff.prefix.storeIdentity.inode++,
  ]) {
    const changed=structuredClone(receipt);alter(changed);
    assert.throws(()=>selectPreservedCatalogReceipt(call,changed));
  }
});

test("the existing conservation refusal remains a non-retained catalog branch",retained,async()=>{
  const {call,receipt}=await retainedPair();
  // A synthetic negative control only, never persisted or used as runtime evidence.
  const refused=structuredClone(receipt);
  refused.exitCode=1;refused.ownerOutput={outcomeKind:"refusal",value:{code:"conservation_failure"}};
  const selected=selectPreservedCatalogReceipt(call,refused);
  assert.equal(selected.preservedCatalogReceipt,null);
  assert.deepEqual(selected.closeHandoff,receipt.resources.eventResource.closeHandoff);
  refused.ownerOutput.value.code="unexpected_failure";
  assert.throws(()=>selectPreservedCatalogReceipt(call,refused));
});

// Retired (T-292 TD-60): source evidence rehydrates through the frozen RC7 task 1A installed owners; input the installed package of that host recorded value gone
