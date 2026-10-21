import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import {authenticateNativeWorkReacquisition,nativeWorkReacquisitionContextCurrent} from '../../build/code/src/abg/native_work_reacquisition.js';
const h=p.sha256Canonical;
const artifact={productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION,
 artifactDigest:h('uninstalled-component'),productContentDigest:h('uninstalled-component-content'),productManifestDigest:h('uninstalled-component-manifest')};
test('reacquisition constructor has exactly its ordinary normalized publication identity',()=>{
 const raw=gtl.nativeWorkReacquisitionGraphFunction();
 const published=gtl.constructWorksiteCommandExecutionModulePublication(artifact).graphFunctions.find(g=>g.name===raw.name);
 assert.deepEqual(raw,published);assert.equal(h(raw),h(published));
 assert.equal(h(raw),'sha256:4db979fdea94b4413938b9b82e81fe8909f13a4ae382b9eb6bb4bf74d5dff613');
 const prior={...raw,tags:['worksite','deterministic-reacquisition']};
 assert.equal(h(prior),'sha256:9c9af1b591a53d9df49d43bd90c8c05819a2dd41db8370781cfe7fcce61c5b0a');
 assert.notEqual(h(prior),h(published));
});
test('actual historical pre-result occurrence authenticates with unchanged source and all current physical context',async t=>{
 const root=process.env.ABG_REACQUISITION_NORMALIZATION_RETAINED_ROOT;
 assert.ok(root,'explicit retained continuation root is required; this check never admits or executes a Run');
 const read=name=>readFileSync(join(root,name),'utf8');
 const retained=JSON.parse(read('reacquisition-diagnostic-01.log').split('\n')[0]);assert.equal(retained.selectedOrdinal,8112);
 const input=JSON.parse(read('execution-01/run-start.jsonl')).invocation.invocation.request.input.value;
 assert.equal(input.kind,'native_worksite_command_reacquisition_request');
 const basis={predecessorPrefix:retained.prefix,cCallRef:'c-call:sha256:cd48200362ff98985cb4b87f190ad229186ce8b259eb328eff8146cff3c6f187'};
 const eventPath=fileURLToPath(retained.prefix.eventLogRef),before=statSync(eventPath),beforeHash=p.sha256Bytes(readFileSync(eventPath));
 const started=performance.now();
 // Historical discrimination only: requireCurrent is explicitly false. The
 // live Run has already failed; this call cannot change or reopen that history.
 const authenticated=authenticateNativeWorkReacquisition(basis,input,false);
 assert.ok(authenticated,'all actual native owner joins at the genuine historical pre-result prefix');
 assert.equal(p.isNativeWorksiteCommandExecutionTask(authenticated.task),true);
 assert.deepEqual(authenticated.task.sourceNativeWork,input.sourceNativeWork);
 assert.deepEqual(authenticated.task.sourceReacquisition.request,input);
 assert.deepEqual(authenticated.task.workspaceBinding,input.workspaceBinding);
 assert.deepEqual(authenticated.task.capabilityGrant,input.capabilityGrant);
 assert.ok(authenticated.task.sourceReacquisition.bindingCoverEventRefs.length>0,'actual changed-binding witness is required');
 assert.equal(input.currentContext.entries.filter(e=>e.state==='file').length,35);
 assert.equal(await nativeWorkReacquisitionContextCurrent(input),true,'read-only complete 35-file actual worksite check');
 const after=statSync(eventPath);assert.equal(after.dev,before.dev);assert.equal(after.ino,before.ino);assert.equal(after.size,before.size);assert.equal(after.mtimeMs,before.mtimeMs);assert.equal(p.sha256Bytes(readFileSync(eventPath)),beforeHash);
 t.diagnostic(JSON.stringify({historicalOnly:true,requireCurrent:false,selectedOrdinal:8112,prefix:retained.prefix,requestDigest:h(input),graphFunctionDigest:authenticated.execution.graphFunctionDigest,
  cCallRef:basis.cCallRef,sourceObservationDigest:h(input.sourceNativeWork),sourceAuthor:input.sourceNativeWork.provenance,bindingCoverEventRefs:authenticated.task.sourceReacquisition.bindingCoverEventRefs,
  contextFiles:35,elapsedMs:performance.now()-started,unchangedLiveEventResource:{device:after.dev,inode:after.ino,bytes:after.size,mtimeMs:after.mtimeMs,sha256:beforeHash},
  limit:'Historical owner authentication and present physical observation only; no fresh installed current occurrence, C2/assessment, admission or Run success.'}));
});
