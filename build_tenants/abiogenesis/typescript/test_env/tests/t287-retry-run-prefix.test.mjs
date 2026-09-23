import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import * as abg from '../../build/code/src/abg/index.js';
import {selectHeldEventStoreDurablePrefix} from '../../build/code/src/abg/event_store.js';
import {constructTraversalCursorCandidate} from '../../build/code/src/abg/traversal_cursor.js';
import {selectRuntimeEventPrefixFromAuthority} from '../../build/code/src/abg/event_prefix.js';
import {admitRetryAttempt,projectDeclaredCRetryFrontier} from '../../build/code/src/abg/retry.js';
import {materializeGraph} from '../../build/code/src/gtl/materialize.js';
import {resolveCProgramTermAtSourcePath} from '../../build/code/src/gtl/source_path.js';
import {deriveStructuralTargetCursor} from '../../build/code/src/hog/traversal.js';
import {proposeStructuralRoute} from '../../build/code/src/hog/route_proposal.js';
import {replayValidatedRuntimeEventPrefix} from '../../build/code/src/abg/replay.js';
import {sha256Canonical,sha256Bytes} from '../../build/code/src/shared/digests.js';

function fixture(t, includeFailure=false) {
  const evidence=process.env.ABI5_S02_RETRY_FIXTURE;
  assert.ok(evidence,'select the immutable s02-installed-continuation-04 carrier');
  const bytes=fs.readFileSync(join(evidence,'runtime-stop/event-prefix.jsonl'));
  assert.equal(sha256Bytes(bytes),'sha256:9181e57756023e396a9b1b1a66ba4f20c85a20db9123637945c2bc3048962199');
  const physical=bytes.toString('utf8').trimEnd().split('\n');
  const copied=physical.filter(line=>(JSON.parse(line).event??JSON.parse(line)).admissionOrdinal<(includeFailure?800:799)).join('\n')+'\n';
  const dir=fs.mkdtempSync(join(os.tmpdir(),'abi5-retry-prefix-')),path=join(dir,'events.jsonl');
  fs.writeFileSync(path,copied,{flag:'wx'});
  const stat=fs.statSync(path);
  const original=JSON.parse(fs.readFileSync(join(evidence,'episode-01/CONTINUATION-04-STOP.json'))).closeHandoff.reopenAuthority;
  const body={...original,eventLogPath:path,device:stat.dev,inode:stat.ino,durableByteLength:Buffer.byteLength(copied),eventLogDigest:sha256Bytes(copied)};
  delete body.authorityDigest;
  const owned=abg.reopenEventStore({...body,authorityDigest:sha256Canonical(body)});
  assert.equal(owned.kind,'reopened_event_store_context');
  t.after(()=>{owned.store.closeDurableLog();fs.rmSync(dir,{recursive:true,force:true});});
  const authority=abg.selectValidatedRuntimeEventPrefix(owned.store.readAll());
  const initial=owned.store.readAll().find(e=>e.admissionOrdinal===798);
  assert.equal(initial.kind,'traversal_cursor_entered');
  const basis=abg.rehydrateExecutionBasisAtPrefix(authority,initial.basisId);assert.ok(basis);
  const publications=JSON.parse(fs.readFileSync(join(evidence,'episode-01/publication-inputs.json'))).modulePublications;
  const gf=publications.flatMap(p=>p.graphFunctions).find(g=>g.name===basis.graphFunctionRef);assert.ok(gf);
  const graph=materializeGraph(gf,{invocationAdmissionRef:basis.invocationAdmissionRef,admittedInputRef:basis.rawInputAdmissionRef,admittedInputDigest:basis.rawInputDigest,admittedInput:basis.rawInputValue});
  assert.equal(graph.materializationRef,basis.graphRef);
  const p=initial.payload;
  const source=constructTraversalCursorCandidate({programRef:p.programRef,executionBasisRef:p.executionBasisRef,traversalScopeRef:p.traversalScopeRef,runId:initial.runId,graphCallId:initial.graphCallId,frameId:initial.frameId,graphRef:p.materializationRef,inputRef:p.inputRef,inputDigest:p.inputDigest,currentNodeRef:graph.template.startNodeRef,position:'at_term',termPath:p.termPath,taskOrdinal:p.taskOrdinal,attempt:p.attempt,retryPath:p.retryPath});
  assert.equal(source.cursorRef,p.cursorRef);
  const make=(cursor,prefix=selectHeldEventStoreDurablePrefix(owned.store))=>{
    const term=resolveCProgramTermAtSourcePath(graph.template,cursor.currentNodeRef,cursor.termPath);
    assert.equal(term.kind,'c_retry');
    const target=deriveStructuralTargetCursor(graph,cursor,term);assert.equal(target.kind,'traversal_cursor');
    const current=abg.selectValidatedRuntimeEventPrefix(owned.store.readAll());
    const run=selectRuntimeEventPrefixFromAuthority(current,{runId:cursor.runId});
    const replay=replayValidatedRuntimeEventPrefix(run,current);
    const route=proposeStructuralRoute(graph,cursor,target,'retry',replay);assert.equal(route.kind,'traversal_route_candidate');
    const candidate=abg.completeTraversalTransitionCandidate({kind:'traversal_transition_candidate',schemaVersion:'5.0.0',transitionClass:'retry',route,evidence:null,retryInput:basis.rawInputValue,terminalizeRun:false});
    return {predecessorPrefix:prefix,store:owned.store,executionBasis:basis,graph,graphFunction:gf,source:cursor,target,candidate,basis:{eventTime:initial.eventTime,correlationId:'component://retry-run-prefix/'+cursor.retryPath.length,causationEventRefs:[]}};
  };
  return {...owned,path,bytes:Buffer.byteLength(copied),basis,graph,gf,source,make};
}

test('retry entry conserves nested attempts in one Run while the workspace retains other stopped Runs',t=>{
  const f=fixture(t);
  assert.equal(f.store.readAll().filter(e=>e.kind==='run_stopped').length,3,'real retained neighbor stops are present');
  let cursor=f.source;
  for(const depth of [1,2]) {
    const input=f.make(cursor),before=f.store.readAll().length;
    const previousAuthority=abg.selectValidatedRuntimeEventPrefix(f.store.readAll());
    const result=abg.admitTraversalTransition(input);
    assert.equal(result.kind,'route_transition_admission',JSON.stringify(result));
    const delta=f.store.readAll().slice(before);
    assert.deepEqual(delta.map(e=>e.kind),['traversal_route_admitted','retry_attempt_opened']);
    assert.ok(delta.every(e=>e.runId===cursor.runId&&e.frameId===cursor.frameId));
    assert.deepEqual(delta[1].causationEventRefs,[delta[0].eventId]);
    assert.deepEqual(result.retryAttempt.retryPath,Array(depth).fill(1));
    assert.equal(result.retryAttempt.budget,2);
    const authority=abg.selectValidatedRuntimeEventPrefix(f.store.readAll());
    const run=selectRuntimeEventPrefixFromAuthority(authority,{runId:cursor.runId});
    const whole=projectDeclaredCRetryFrontier(authority,f.graph,input.target,f.gf);
    const selected=projectDeclaredCRetryFrontier(run,f.graph,input.target,f.gf,depth,authority);
    assert.equal(whole.state,'attempt_active');assert.equal(selected.state,'attempt_active');
    assert.deepEqual(whole.active.attempt,selected.active.attempt,'same native attempt with full authority or explicit selected Run');
    assert.equal(whole.active.attempt.attemptRef,result.retryAttempt.attemptRef);
    assert.equal(projectDeclaredCRetryFrontier(run,f.graph,input.target,f.gf,depth,previousAuthority),null,'stale authority cannot authenticate the newly admitted route');
    const committed=fs.readFileSync(f.path);
    assert.notEqual(admitRetryAttempt(f.store,authority,f.basis,f.graph,f.gf,input.target,f.basis.rawInputValue,result.route.admissionEventRef,input.basis).kind,'retry_attempt_admission','one route cannot mint a competing duplicate attempt');
    assert.deepEqual(fs.readFileSync(f.path),committed);
    cursor=input.target;
  }
  assert.equal(f.store.readAll().filter(e=>e.kind==='run_stopped').length,3);
  assert.equal(f.store.readAll().filter(e=>e.kind==='actor_invocation_started'&&e.runId===cursor.runId).length,0);
  t.diagnostic('Copied finite native prefix and disposable append ownership are supplied component premises; no installed Run or actor is executed.');
});

test('retry entry refuses foreign scope and stale source without committing a partial transition',t=>{
  const f=fixture(t),input=f.make(f.source);
  const foreign=f.store.readAll().find(e=>e.kind==='traversal_cursor_entered'&&e.runId!==f.source.runId);
  assert.ok(foreign);
  const {kind,schemaVersion,cursorRef,cursorDigest,...targetBody}=input.target;
  const wrong=constructTraversalCursorCandidate({...targetBody,runId:foreign.runId,frameId:foreign.frameId});
  const before=fs.readFileSync(f.path);
  assert.notEqual(abg.admitTraversalTransition({...input,target:wrong}).kind,'route_transition_admission');
  assert.deepEqual(fs.readFileSync(f.path),before);
  assert.equal(abg.admitTraversalTransition(input).kind,'route_transition_admission');
  const committed=fs.readFileSync(f.path);
  assert.notEqual(abg.admitTraversalTransition(input).kind,'route_transition_admission','old prefix and spent source cannot be reused');
  assert.deepEqual(fs.readFileSync(f.path),committed);
});

test('retry entry retains the failed native scope refusal and refuses an unrelated authority prefix',t=>{
  const f=fixture(t,true),input=f.make(f.source);
  const before=fs.readFileSync(f.path);
  assert.notEqual(abg.admitTraversalTransition(input).kind,'route_transition_admission');
  assert.deepEqual(fs.readFileSync(f.path),before);
  const prefix=abg.selectValidatedRuntimeEventPrefix(f.store.readAll());
  const foreignRun=f.store.readAll().find(e=>e.kind==='run_segment_opened'&&e.runId!==f.source.runId).runId;
  const foreign=selectRuntimeEventPrefixFromAuthority(prefix,{runId:foreignRun});
  assert.equal(projectDeclaredCRetryFrontier(foreign,f.graph,input.target,f.gf,1,prefix),null);
});
