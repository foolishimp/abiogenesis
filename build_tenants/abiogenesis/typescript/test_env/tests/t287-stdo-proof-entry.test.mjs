import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import test from "node:test";
import {resolveFreshSdkReplayModule,selectPreservedCatalogReceipt,readRetainedStdoSourceEvidence,validateRetainedStdoSourceEvidence} from "../support/stdo-environment-pilot.mjs";
import {importInstalledPackageExport} from "../support/root-cli-environment.mjs";
import {evidenceGate} from "../support/evidence-root.mjs";

const cliHost=process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST;
// The retained RC7 task 1B call 9 and receipt 9 resolve through catalogue row
// stdo-proof-entry-run-nine under ABI5_EVIDENCE_ROOT. The frozen install host
// stays a private variable (row stdo-proof-entry-install-host): its recorded
// install no longer holds the installed package.
const runNine=evidenceGate("stdo-proof-entry-run-nine");
const retained={skip:runNine.kind==="absent"&&runNine.reason};
const installed={skip:(!cliHost&&"ABI5_WAVE1_FROZEN_INSTALL_HOST unset; requires the frozen install host (evidence gate catalogue row stdo-proof-entry-install-host)")||retained.skip};
const readJson=async path=>JSON.parse(await readFile(path,"utf8"));
const retainedPair=async()=>({
  call:JSON.parse(runNine.inputs.call.bytes.toString("utf8")).invocation,
  receipt:JSON.parse(runNine.inputs.receipt.bytes.toString("utf8")).receipt,
});

test("SDK proof resolves and imports the installed declared import-only public export",installed,async()=>{
  const root=join(cliHost,"node_modules/@abiogenesis/typescript-tenant");
  const manifest=await readJson(join(root,"package.json"));
  assert.equal(manifest.exports["./abg"].require,undefined);
  const moduleUrl=await resolveFreshSdkReplayModule(cliHost);
  assert.equal(moduleUrl,pathToFileURL(join(root,manifest.exports["./abg"].import)).href);
  const abg=await import(moduleUrl);
  assert.equal(typeof abg.projectRunSemanticReplayProjection,"function");
  const {call,receipt}=await retainedPair();
  const {closeHandoff}=selectPreservedCatalogReceipt(call,receipt);
  const events=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
  assert.equal(abg.selectValidatedRuntimeEventPrefix(events).kind,"validated_runtime_event_prefix");
  assert.equal(events.length,3);
  assert.ok(events.every(row=>row.kind==="public_operation_artifact_admitted"));
});

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

test("current source evidence rehydrates through installed owners and preserves refusal scope",{skip:!process.env.ABI5_ENV_SOURCE_EVIDENCE&&"ABI5_ENV_SOURCE_EVIDENCE unset; requires the retained STDO source evidence"},async()=>{
  const [product,abg]=await Promise.all(["product","abg"].map(name=>importInstalledPackageExport({cliHost},"@abiogenesis/typescript-tenant/"+name)));
  const evidence=await readRetainedStdoSourceEvidence(process.env.ABI5_ENV_SOURCE_EVIDENCE,{product,abg});
  assert.equal(evidence.eventCount,27);
  assert.equal(evidence.source.resultBasis.sourceResultValue.coverage.obligations.length,2);
  assert.deepEqual(evidence.envelope,evidence.missing.call.invocation.request.input.value);
  for(const alter of [
    value=>value.source.resultBasis.sourceResultValueDigest="sha256:"+"0".repeat(64),
    value=>value.missing.call.invocation.request.program.ref+="/foreign",
    value=>value.missing.call.invocation.request.input.value.sourceHandoff.coverage.obligations.pop(),
    value=>value.viewReceipt.ownerOutput.value.view.digest="sha256:"+"0".repeat(64),
  ]){
    const changed=structuredClone(evidence);alter(changed);
    assert.throws(()=>validateRetainedStdoSourceEvidence(changed,{product,abg}));
  }
});
