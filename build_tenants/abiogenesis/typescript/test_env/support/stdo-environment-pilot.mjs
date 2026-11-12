import assert from "node:assert/strict";
// Select retained caller evidence only.
export function selectPreservedCatalogReceipt(priorCall, receipt) {
  assert.deepEqual(priorCall.invocation.definitionKey, {operationId:"abg.operation.catalog.admit",memberKey:"admit"});
  assert.deepEqual(receipt.definitionKey, priorCall.invocation.definitionKey);
  assert.equal(receipt.invocationRef, priorCall.invocation.invocationRef);
  assert.equal(receipt.resources.disposition,"read_only_unchanged");
  const closeHandoff=receipt.resources.eventResource.closeHandoff;
  assert.deepEqual(closeHandoff.prefix,receipt.resources.eventResource.entryPrefix);
  assert.deepEqual(closeHandoff,priorCall.resources.eventResource.closeHandoff);
  if(receipt.ownerOutput.outcomeKind==="result") {
    assert.equal(receipt.exitCode,0);
    assert.deepEqual(receipt.ownerOutput.value.catalog,receipt.resources.catalog);
    return {closeHandoff,preservedCatalogReceipt:receipt};
  }
  assert.equal(receipt.ownerOutput.outcomeKind,"refusal");
  assert.equal(receipt.ownerOutput.value.code,"conservation_failure");
  return {closeHandoff,preservedCatalogReceipt:null};
}
