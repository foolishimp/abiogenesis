import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as productBase from '../../build/code/src/product/index.js';
import * as command from '../../build/code/src/product/worksite_command_execution.js';
import * as effect from '../../build/code/src/product/worksite_effect.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as forward from '../../build/code/src/abg/worksite_command_forward.js';
import {readRuntimeEventsAtDurablePrefix} from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {projectExactExecutionBasisAtPrefix} from '../../build/code/src/abg/invocation_execution_truth.js';
import {projectSameRunWorksiteCommandSourceAtPrefix} from '../../build/code/src/abg/worksite_input_provenance.js';
const product={...productBase,...command,...effect};
export {product,gtl,validator,forward};
export const packageRoot=path.resolve(import.meta.dirname,'../..');
export const repo=path.resolve(packageRoot,'../../../../..');
export const hash=product.sha256Canonical;
export const bytesHash=b=>crypto.createHash('sha256').update(b).digest('hex');
const prior=path.join(repo,'.ai-workspace/comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/preserved-result-implementation-01');
export const log='/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/data-mapper-full/20260908T154515Z_full-suite-01/epochs/d1-semantic-lifecycle-04/events-01/runtime.events.jsonl';
export const expectedLog='acd37d153e70cf1e0724ba3d9d7cc6077e5d1cb30ac67481809ceecbffbedbbd';
let retained;
// The original immutable prefix, native owners and declarations are actual
// evidence. Using its old W here tests historical proof only; it does not mint
// a current forward invocation, grant, binding cover, actor or CCall.
export function retainedSource(){
  if(retained)return retained;
  const bytes=fs.readFileSync(log),stat=fs.statSync(log);
  assert.equal(bytesHash(bytes),expectedLog);assert.equal(stat.dev,16777230);assert.equal(stat.ino,448915801);
  const readyPath=path.join(prior,'installed-conformance-tail-preparation-03/native-ready-01/setup-ready.json');
  const readyBytes=fs.readFileSync(readyPath),ready=JSON.parse(readyBytes);
  const {coordinateDigest:_,...old}=ready.closeHandoff.prefix;
  const body={...old,prefixLength:bytes.length,prefixDigest:'sha256:'+bytesHash(bytes)};
  const coordinate={...body,coordinateDigest:hash(body)};
  const events=readRuntimeEventsAtDurablePrefix(coordinate),prefix=selectValidatedRuntimeEventPrefix(events);
  assert.equal(events.length,2469);
  const failedRef='c-call:sha256:3ed2f91eba344336d14fcf25e60795e8a36c21bf1b20ba12319efec51a8348f9';
  const opened=events.find(e=>e.kind==='c_call_opened'&&e.aggregateId===failedRef);assert.ok(opened);
  const basis=projectExactExecutionBasisAtPrefix(prefix,opened.basisId);assert.ok(basis);
  const originalTask=basis.rawInputValue;assert.ok(product.isWorksiteCommandExecutionTask(originalTask));
  const parent=projectExactExecutionBasisAtPrefix(prefix,basis.parentExecutionBasisRef);assert.ok(parent);
  const owner=projectSameRunWorksiteCommandSourceAtPrefix(prefix,{parentBasis:parent,parentCCallRef:basis.parentCCallRef,
    runId:opened.runId,task:originalTask});assert.ok(owner,'actual native same-Run preparation owner');
  const closes=events.filter(e=>e.kind==='graph_call_closed'&&e.basisId===owner.sourceBasis.basisRef&&e.runId===opened.runId);
  assert.equal(closes.length,1,'one actual closed construction child');
  const request=product.constructWorksiteCommandForwardRequest({source:{prefix:coordinate,invocationRef:basis.invocationRef,
    invocationAdmissionRef:basis.invocationAdmissionRef,runId:opened.runId,failedCCallRef:failedRef,
    failureEventRef:events[2459].eventId,runFailureEventRef:events[2468].eventId,constructionGraphCallRef:closes[0].graphCallId,
    preparationResultEventRef:owner.preparationResult.eventId,preparationJudgmentEventRef:owner.preparationJudgment.eventId,
    declarationProof:{kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.catalog,catalogView:ready.catalogView}},
    workspaceAuthorityBasis:originalTask.workspaceAuthorityBasis,workspaceBinding:originalTask.workspaceBinding,
    capabilityGrant:originalTask.capabilityGrant,protectedObservations:originalTask.protectedObservations.map(({subject,observation})=>({subject,observation}))});
  retained={bytes,stat,coordinate,events,prefix,ready,readyPath,readyHash:bytesHash(readyBytes),basis,parent,owner,originalTask,request};
  return retained;
}
export function declarations(){
  const artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,
    artifactDigest:hash('uninstalled forward package'),productContentDigest:hash('uninstalled forward content'),productManifestDigest:hash('uninstalled forward manifest')};
  const publication=gtl.constructWorksiteCommandForwardModulePublication(artifact),legacy=gtl.constructWorksiteCommandExecutionModulePublication(artifact);
  const program=publication.programs.find(p=>p.programRef===product.WORKSITE_COMMAND_FORWARD_IDS.programRef);assert.ok(program);
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract://mechanical/forward/raw');assert.equal(r.kind,'raw_admitted_value');return r;};
  const pub=raw(publication,'module_publication');
  const validate=(mutate=x=>x)=>validator.validateProgram(mutate({declarationBasisDigest:pub.subjectDigest,programPublication:pub,
    program:raw(program,'gtl_program'),graphFunctions:publication.graphFunctions.map(g=>raw(g,'graph_function')),
    contracts:[...legacy.contracts,...publication.contracts].map(c=>raw(c,'contract_declaration')),
    implementationBindings:publication.implementationBindings.map(b=>raw(b,'implementation_binding')),
    closureContracts:publication.closureContracts.map(c=>raw(c,'closure_contract')),rules:[],evaluators:[]}));
  return {artifact,publication,legacy,program,validate,raw};
}
// Carrier-only currentness assumptions; these coordinates are intentionally
// NOT authenticated by the native forward relation or an installed Program.
export function carrierTask(){
  const {request,originalTask}=retainedSource(),covers=['synthetic-lookup:cover'];
  const snapshotSources=originalTask.protectedObservations.map(row=>({sourceMemberRef:row.sourceMemberRef,subject:row.subject,observation:row.observation,source:{kind:'retained_construction',
    resultAdmissionEventRef:'synthetic-lookup:result:'+row.sourceMemberRef,evidenceEventRef:'synthetic-lookup:evidence:'+row.sourceMemberRef,
    bindingCoverEventRefs:covers}}));
  return product.constructWorksiteCommandForwardTask({request,originalTask,snapshotSources,bindingCoverEventRefs:covers});
}
