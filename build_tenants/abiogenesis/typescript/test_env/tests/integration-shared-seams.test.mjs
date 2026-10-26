import assert from 'node:assert/strict';
import test from 'node:test';
import * as abg from '../../build/code/src/abg/index.js';
import {reconstructHistoricalDeclarationCatalog} from '../../build/code/src/product/declaration_closure.js';
import {sha256Canonical as hash} from '../../build/code/src/shared/digests.js';
import {evidenceInput} from '../support/evidence-root.mjs';

// These tests compose pure declaration owners. Ready Catalog/environment data
// and negative mutations are supplied test inputs, not new native admission.
// No retained D1/D2 store, application file or native effect is observed. The
// retained Catalog is the D2 installed-continuation-09 ready record under the
// evidence root, named by path, digest and bytes (T-290 C-5).
//
// Retired (T-290 C-18b): the D2 history-guard and expanded-closure cases and
// the Source04 byte case. Their Catalog was the D2 implementation's copied
// ready record (`evidence/d2-program-ready.json` beside a displaced
// `origins.json`), which no tracked text names by path below the evidence root
// or by digest; the ic-09 ready record is not it (its root closure carries 15
// owners, not the 6 the history cases were written over, and lacks the
// GraphFunction of the ic-09 run's row-834 basis). Source04 byte equality is a
// claim about a superseded cut.
const readyInput=evidenceInput({path:'comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/attempt-01/program-ready-16.json',
  sha256:'2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02',bytes:12781893});
const skip=readyInput.kind==='absent'&&readyInput.reason;
const ready=skip?null:JSON.parse(readyInput.bytes),actual=ready&&{catalog:ready.call.resources.catalog,view:ready.call.resources.catalogView};

test('combined ABG barrel retains D1 recovery, D2 witness and R10 typed-result exports',()=>{
  for(const name of ['projectWorksitePreservedResultArtifact','projectWorksitePreservedCandidateBundle',
    'nativeWorksiteRecoverySourceAtPrefix','isAbgTypedTerminalResult'])assert.equal(typeof abg[name],'function',name);
  assert.ok(abg.WITNESS_DEFINITION_BINDINGS.admit.reprice);
  assert.ok(abg.WITNESS_OPERATION_CONTRACTS.admit.reprice);
  assert.ok(abg.WITNESS_CONTENT_CONTRACTS.reprice);
  assert.ok(abg.ABG_TYPED_TERMINAL_RESULT_SCHEMA);assert.ok(abg.ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA);
});

test('shared R10 Catalog verifier preserves exact supplied environment and narrowed View on the integrated owner',{skip},()=>{
  const environment={workspaceBinding:actual.catalog.readinessBasis.workspaceBinding,resolvedLock:actual.catalog.readinessBasis.resolvedLock,
    installedProducts:actual.catalog.readinessBasis.installedProducts};
  const supplied={catalog:actual.catalog,catalogView:actual.view};
  assert.deepEqual(reconstructHistoricalDeclarationCatalog(supplied,environment),supplied);
  assert.throws(()=>reconstructHistoricalDeclarationCatalog(supplied,{...environment,installedProducts:[...environment.installedProducts,environment.installedProducts[0]]}),/exact admitted workspace/);
  assert.throws(()=>reconstructHistoricalDeclarationCatalog(supplied,{...environment,workspaceBinding:{...environment.workspaceBinding,bindingDigest:hash('foreign W')}}),/exact admitted workspace/);
  assert.throws(()=>reconstructHistoricalDeclarationCatalog({...supplied,catalogView:{...actual.view,viewDigest:hash('wrong View')}},environment),/exact narrowing/);
});
