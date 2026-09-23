import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as prefix from '../../build/code/src/abg/event_prefix.js';
import * as store from '../../build/code/src/abg/event_store.js';
import * as retry from '../../build/code/src/abg/retry.js';
import {WORKER_TRANSPORT_FAILURE_CLASS_VALUES} from '../../build/code/src/abg/transport_contracts.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
// Branch control over the actual compiled owner body. Eligibility is modeled;
// the nominal prefix, logical hash and append guard are real. No live retry claim.
test('retry branch preserves scoped stale typed refusal and full/staged logical guards',async()=>{
 const source=await readFile(new URL('../../build/code/src/abg/retry.js',import.meta.url),'utf8');
 const body=source.slice(source.indexOf('export function admitRetryAttempt('),source.indexOf('export function projectRetryEligibility(')).replace('export function','function');
 const helpers=source.slice(source.indexOf('function refusal('),source.indexOf('function isRecord('));
 const value={control:'retry'},cursor={cursorRef:'cursor://retry',cursorDigest:sha256Canonical('cursor'),executionBasisRef:'basis://retry',inputRef:'input://retry',inputDigest:sha256Canonical(value),attempt:2,retryPath:[2],runId:'run://retry',graphCallId:'call://retry',frameId:'frame://retry'};
 const context={budget:3,retryDepth:1,retryTermPath:['retry'],wrappedTermPath:['retry','body'],taskOrdinal:null,inputCarrierRef:'contract://retry'};
 const frontier={state:'eligible',nextAttempt:2,currentCursor:cursor,eligibilityRoute:{admissionEventRef:'event://route',targetCursorRef:cursor.cursorRef,targetCursorDigest:cursor.cursorDigest,judgmentRef:'judgment://retry',routeRef:'route://retry'},latestFailure:null,retryBoundaryRef:'boundary://retry'};
 const deps={...prefix,...store,sha256Canonical,deepFreeze,WORKER_TRANSPORT_FAILURE_CLASS_VALUES,hasAdmittedExecutionBasisAtPrefix:()=>true,hasAdmittedTraversalCursorAtPrefix:()=>true,isRecord:x=>x!==null&&typeof x==='object'&&!Array.isArray(x),contextForCursor:()=>context,projectDeclaredCRetryFrontier:()=>frontier,deriveRetryAttemptManifestRef:retry.deriveRetryAttemptManifestRef};
 const invoke=Function(...Object.keys(deps),helpers+body+'\nreturn admitRetryAttempt;')(...Object.values(deps));
 const events=deepFreeze((await readFile(process.env.ABI5_OWNER_HISTORY,'utf8')).trimEnd().split('\n').map(JSON.parse)),full=prefix.selectValidatedRuntimeEventPrefix(events),scoped=prefix.selectRuntimeEventPrefixFromAuthority(full,{runId:events.find(e=>e.runId).runId});
 assert.ok(scoped.events[0].admissionOrdinal>1);
 let calls=0,guardDigest=sha256Canonical(events);
 const facade={digest:()=>guardDigest};
 const args=p=>[facade,p,{basisRef:cursor.executionBasisRef,graphRef:'graph://retry',graphFunctionRef:'function://retry'},{materializationRef:'graph://retry'},{},cursor,value,'event://route',{eventTime:'2026-09-20T00:00:00.000Z',correlationId:'correlation://retry'}];
 const expected={kind:'retry_admission_refusal',schemaVersion:'5.0.0',disposition:'refused',code:'attempt_mismatch',message:'retry attempt authority changed after immutable-prefix validation'};
 assert.deepEqual(invoke(...args(scoped)),expected);
 // Full success stops at a controlled commit seam after the unchanged exact
 // guard; it does not create an event or bypass production admission.
 const storeSource=await readFile(new URL('../../build/code/src/abg/event_store.js',import.meta.url),'utf8');
 const start=storeSource.indexOf('export function compareAndAppendExpectedPrefix('),end=storeSource.indexOf('\n}',start)+2;
 const guard=Function('admitRuntimeEventBatch',storeSource.slice(start,end).replace('export function','function')+'\nreturn compareAndAppendExpectedPrefix;')((_s,factories)=>{calls++;return [{eventId:'event://attempt',candidate:factories[0]()}];});
 deps.compareAndAppendExpectedPrefix=guard;
 const controlled=Function(...Object.keys(deps),helpers+body+'\nreturn admitRetryAttempt;')(...Object.values(deps));
 assert.equal(controlled(...args(full)).kind,'retry_attempt_admission');assert.equal(calls,1);
 guardDigest=sha256Canonical([...events,{stagedSuffix:true}]);
 assert.deepEqual(controlled(...args(full)),expected);assert.equal(calls,1);
 assert.deepEqual(controlled(...args(scoped)),expected);assert.equal(calls,1);
 console.log(JSON.stringify({kind:'d10_scoped_retry_branch',eligibility:'modeled',scopedTypedRefusal:true,fullGuardSuccess:true,stagedStaleness:true,physicalEffects:0}));
});
