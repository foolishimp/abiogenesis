import test from 'node:test';
import assert from 'node:assert/strict';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {constructInstalledStartCall} from '../support/registered-graph-selection.mjs';
import {prepareLanguageSmokeFixture,constructLanguageTestInput} from '../support/language-smoke-fixture.mjs';

const packageRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');

// RC10 LIFE-01 (§10.12 O1 lifetime): full execution-basis record and basis
// body retention is disposable computation of an open run operation scope.
// Mode selection is explicit: `functional` (default) runs the fast lifecycle
// assertions; `workload50` runs only the fifty-call workload, which belongs to
// the separately admitted frozen proof and not to the ordinary unit lane.
const MODE=process.env.ABG_RC10_BASIS_LIFETIME_MODE??'functional';
assert.ok(['functional','workload50'].includes(MODE),'ABG_RC10_BASIS_LIFETIME_MODE is functional or workload50: '+MODE);

async function heldEnvironment(t){
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareLanguageSmokeFixture(basis)]});
  const {installedRoot,product,store}=env;
  const load=name=>import(pathToFileURL(join(installedRoot,'build/code/src',name+'.js')).href);
  const [abg,publicApi,basisOwner,prefixOwner,historyOwner,immutable,canonical]=await Promise.all([
    'abg/index','public/index','abg/calculus/execution_basis_record','abg/event_prefix','abg/runtime_history','shared/immutable',
    'shared/canonical_json'].map(load));
  const setupHandoff=store.projectReopenAuthorityAndClose();
  const acquired=abg.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:setupHandoff,
    handoffDigest:product.sha256Canonical(setupHandoff)});
  assert.equal(acquired.kind,'acquired_abg_event_resource',JSON.stringify(acquired));
  const held={resource:acquired.resource,selection:abg.selectAcquiredAbgEventResource(acquired.resource,acquired.resource.entryPrefix)};
  t.after(()=>{if(held.resource!==null)abg.abandonAbgEventResource(held.resource);});
  const owned=()=>prefixOwner.projectOwnedRuntimeEventPrefixAtDurablePrefix(held.selection.prefix);
  const gauges=selection=>historyOwner.observeRuntimeHistoryBasisRetention(selection??owned().selection);
  const work=()=>basisOwner.observeExecutionBasisRowWork();
  const delta=(from,to)=>({rowAdmissions:to.rowAdmissions-from.rowAdmissions,bodyDigests:to.bodyDigests-from.bodyDigests});
  // Each Run borrows the held resource; only its kind and successor are kept.
  // It returns the basis row work of the actual call alone, not of its construction.
  const run=async(identity,text)=>{
    const {call}=await constructInstalledStartCall({environment:env,publicApi,eventResource:held.selection,
      input:constructLanguageTestInput(text),identity});
    const w0=work(),outcome=await publicApi.runInstalledDefinitionCallWithResource(held.selection,call),w1=work();
    assert.equal(outcome.kind,'installed_definition_call_transport_result',JSON.stringify(outcome).slice(0,2000));
    assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(outcome.receipt.ownerOutput).slice(0,2000));
    assert.equal(outcome.receipt.resources.eventResource.kind,'abg_event_resource_completion');
    held.selection=outcome.receipt.resources.eventResource.successor;
    return delta(w0,w1);
  };
  const rawBytes=row=>Buffer.byteLength(canonical.canonicalJson(row.payload.rawInputValue),'utf8');
  return {abg,basisOwner,prefixOwner,immutable,held,owned,gauges,work,delta,run,rawBytes};
}

const ZERO=Object.freeze({openHandles:0,retainedRows:0,retainedPayloadBytes:0,historyBasisBodies:0,historyBasisPayloadBytes:0});

test('RC10 LIFE-01: basis row facts and history basis bodies live only in open run operation scopes; completed, historical, overlapping and closed cases release exactly',
  {timeout:500_000,skip:MODE!=='functional'&&'workload50 mode selected'},async t=>{
  const {abg,basisOwner,prefixOwner,immutable,held,owned,gauges,work,delta,run,rawBytes}=await heldEnvironment(t);
  const observations={mode:MODE,runs:[]};
  assert.deepEqual(gauges(),ZERO,'no scope is open before any Run');

  // Basis rows admitted after one cut, read from owned selection envelope and
  // scalar metadata only; no body is read and no basis row is checked.
  const basisRowsAfter=through=>{
    const rows=owned().selection.select('kind:basis_admitted'),admitted=[];
    for(let i=0;i<rows.length;i++){const row=rows.row(i);if(row.envelope.admissionOrdinal>through)admitted.push(row);}
    return admitted;
  };
  // Completed operations: each actual Run's scope finalizer releases its rows and bodies.
  // The first Run is the integrated start reuse check and precedes every manual
  // handle, which cannot establish it: under its own scope's admitted-invocation
  // handle, the actual call of this single-root, single-deterministic-leaf
  // fixture checks its one basis row once and reuses it for the rest of the
  // call. The count is this fixture's prediction, not a general per-invocation bound.
  for(let i=0;i<2;i++){
    const through=owned().selection.through;
    const callWork=await run('rc10-life-'+i,'Lifetime '+i);
    const newBases=basisRowsAfter(through),after=gauges();observations.runs.push(after);
    if(i===0){
      observations.integrated={callWork,newBases:newBases.length,
        basisInvocationRefs:newBases.map(row=>row.scalarPayload.invocationRef??null),after};
      assert.deepEqual(callWork,{rowAdmissions:1,bodyDigests:1},
        'the actual call checks its one basis row once: '+JSON.stringify(observations.integrated));
      assert.equal(newBases.length,1,'the actual call admitted exactly one new basis: '+JSON.stringify(observations.integrated));
    }
    assert.deepEqual(after,ZERO,'a completed Run retains no basis row or body: '+JSON.stringify(after));
  }
  const prefix=owned(),events=[...prefixOwner.runtimeEventBodiesAtPrefix(prefix).materialize()];
  const basisEvents=events.filter(e=>e.kind==='basis_admitted');
  assert.ok(basisEvents.length>=2,'two Runs admitted their bases');
  const rowA=basisEvents[0],rowB=basisEvents.find(e=>e.payload.invocationRef!==rowA.payload.invocationRef);
  assert.ok(rowB!==undefined,'the two Runs have distinct invocations');
  const refA=rowA.payload.basisRef,refB=rowB.payload.basisRef,invA=rowA.payload.invocationRef,invB=rowB.payload.invocationRef;
  assert.deepEqual(gauges(),ZERO,'materializing a historical vector mints no retention');

  // Historical reads without an open scope are cold: equal, not retained.
  const h0=work(),cold1=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refA);
  const cold2=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refA),h1=work();
  assert.notEqual(cold1,null);assert.equal(cold1.basisRef,refA);assert.deepEqual(cold2,cold1);
  assert.notStrictEqual(cold2,cold1,'completed historical identity is intentionally not retained');
  assert.deepEqual(delta(h0,h1),{rowAdmissions:2,bodyDigests:2},'each historical read checks the row cold');
  assert.deepEqual(gauges(),ZERO,'historical reads mint no retention');

  // One open scope retains its own invocation's row by identity, without repeated work.
  const releaseA=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,invA);
  assert.deepEqual(gauges(),{...ZERO,openHandles:1},'opening a scope mints no row');
  const a0=work(),activeA=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refA),a1=work();
  const againA=basisOwner.projectExactExecutionBasisRecordAtPrefix(owned(),refA),a2=work();
  assert.deepEqual(activeA,cold1);assert.strictEqual(againA,activeA,'the active record is the retained owner value');
  assert.deepEqual(delta(a0,a1),{rowAdmissions:1,bodyDigests:1});
  assert.deepEqual(delta(a1,a2),{rowAdmissions:0,bodyDigests:0},'an active repeated read does no row work');
  const oneA=gauges();
  assert.equal(oneA.retainedRows,1);assert.equal(oneA.retainedPayloadBytes,rawBytes(rowA),'logical canonical raw-input bytes recorded at insertion');
  assert.ok(oneA.historyBasisBodies<=1&&oneA.historyBasisPayloadBytes===oneA.historyBasisBodies*rawBytes(rowA),
    'the history keeps at most the eligible basis body: '+JSON.stringify(oneA));
  // Membership and cardinality stay per cut; a copied history stays cold.
  const before=prefixOwner.validatedRuntimeEventPrefixBeforeEvent(prefix,rowA.eventId);
  assert.equal(basisOwner.projectExactExecutionBasisRecordAtPrefix(before,refA),null,'an earlier cut lacking the row has no basis');
  assert.equal(basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,'execution-basis://abiogenesis/absent'),null);
  const copied=prefixOwner.selectValidatedRuntimeEventPrefix(immutable.deepFreeze(structuredClone(events)));
  const c0=work(),copiedA=basisOwner.projectExactExecutionBasisRecordAtPrefix(copied,refA),c1=work();
  assert.deepEqual(copiedA,activeA);assert.notStrictEqual(copiedA,activeA);
  assert.deepEqual(delta(c0,c1),{rowAdmissions:1,bodyDigests:1},'a copied history checks cold under an open scope');
  // A historical read of another invocation does not enter the active scope.
  const otherCold=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refB);
  assert.notEqual(otherCold,null);assert.deepEqual(gauges(),oneA,'a historical read of B adds nothing while A is open');

  // Overlap: B's scope is disposed while A survives with its identity and work.
  const releaseB=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,invB);
  const activeB=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refB);
  assert.deepEqual(activeB,otherCold);assert.equal(gauges().retainedRows,2);assert.equal(gauges().openHandles,2);
  releaseB();
  const afterB=gauges();
  assert.equal(afterB.retainedRows,1);assert.equal(afterB.openHandles,1);assert.equal(afterB.retainedPayloadBytes,rawBytes(rowA));
  const o0=work(),survivor=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refA),o1=work();
  assert.strictEqual(survivor,activeA,'disposing B preserves A');assert.deepEqual(delta(o0,o1),{rowAdmissions:0,bodyDigests:0});
  // Two scopes of one invocation: releasing one keeps the other's entries.
  const releaseA2=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,invA);
  releaseA2();releaseA2();
  assert.equal(gauges().retainedRows,1,'one scope disposal preserves the other open scope');
  releaseA();releaseA();
  assert.deepEqual(gauges(),ZERO,'the last scope releases rows and bodies; a repeated release is inert');
  const r0=work(),released=basisOwner.projectExactExecutionBasisRecordAtPrefix(prefix,refA),r1=work();
  assert.deepEqual(released,activeA);assert.notStrictEqual(released,activeA);assert.deepEqual(delta(r0,r1),{rowAdmissions:1,bodyDigests:1});
  assert.deepEqual(gauges(),ZERO);

  // A third actual Run still releases after the overlap probes.
  await run('rc10-life-2','Lifetime 2');
  assert.deepEqual(gauges(),ZERO,'the third completed Run retains nothing');

  // Physical close disposes every handle and root; the closed coordinate opens nothing.
  const finalPrefix=owned(),historySelection=finalPrefix.selection;
  const releaseClosed=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,invA);
  assert.notEqual(basisOwner.projectExactExecutionBasisRecordAtPrefix(finalPrefix,refA),null);
  assert.equal(gauges(historySelection).retainedRows,1);
  const closed=abg.closeAbgEventResource(held.resource,held.selection.prefix);held.resource=null;
  assert.equal(closed.kind,'abg_event_resource_receipt');
  assert.deepEqual(gauges(historySelection),ZERO,'physical close disposes retention');
  releaseClosed();
  const reopenAttempt=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,invA);
  assert.deepEqual(gauges(historySelection),ZERO,'a closed coordinate cannot reopen retention');reopenAttempt();
  observations.historical={coldWork:delta(h0,h1),activeFirst:delta(a0,a1),activeAgain:delta(a1,a2),copied:delta(c0,c1),released:delta(r0,r1)};
  observations.gauges={oneA,afterB};
  t.diagnostic('RC10_LIFE01_OBSERVATIONS '+JSON.stringify({...observations,
    meaning:'retainedPayloadBytes/historyBasisPayloadBytes are logical UTF-8 canonical JSON bytes of rawInputValue recorded once at insertion; not heap, RSS or allocation size',
    unproved:['rollback disposal (RuntimeHistory.truncate) is not driven by an actual failed append here','duplicate rows (many before lookup) are not constructed here',
      'refusal, runtime failure, interruption and held/gap exits of an actual Run','continuation reacquisition','no heap or performance claim']}));
});

test('RC10 LIFE-01 workload: fifty sequential calls release both retaining owners after every completed call',
  {timeout:900_000,skip:MODE!=='workload50'&&'select ABG_RC10_BASIS_LIFETIME_MODE=workload50 (separately admitted frozen proof)'},async t=>{
  const {basisOwner,prefixOwner,held,owned,gauges,work,delta,run}=await heldEnvironment(t);
  const perCall=[],gc=typeof globalThis.gc==='function'?globalThis.gc:undefined;
  let sentinel=null,sentinelRef=null,maxAfter={...ZERO};
  const heap=()=>{gc?.();return process.memoryUsage().heapUsed;};
  const heapBefore=heap(),began=Date.now();
  for(let i=0;i<50;i++){
    const text=i%2===0?'Workload '+i:'Workload '+i+' '+'x'.repeat(4096);
    const w0=work(),t0=Date.now();
    await run('rc10-life-workload-'+i,text);
    const after=gauges(),w1=work();
    for(const key of Object.keys(maxAfter))maxAfter[key]=Math.max(maxAfter[key],after[key]);
    assert.deepEqual(after,ZERO,'call '+i+' released both retaining owners: '+JSON.stringify(after));
    if(sentinelRef===null){
      const first=[...prefixOwner.runtimeEventBodiesAtPrefix(owned()).materialize()].find(e=>e.kind==='basis_admitted');
      sentinelRef=first.payload.basisRef;sentinel=basisOwner.projectExactExecutionBasisRecordAtPrefix(owned(),sentinelRef);
    }else if(i%10===9){
      assert.deepEqual(basisOwner.projectExactExecutionBasisRecordAtPrefix(owned(),sentinelRef),sentinel,'historical sentinel equality');
      assert.deepEqual(gauges(),ZERO,'the historical sentinel read minted nothing');
    }
    perCall.push({i,inputChars:text.length,wallMs:Date.now()-t0,basisWork:delta(w0,w1),heapUsed:i%10===9?heap():null});
  }
  const heapAfter=heap();
  t.diagnostic('RC10_LIFE01_WORKLOAD '+JSON.stringify({mode:MODE,calls:perCall.length,wallMs:Date.now()-began,maxRetainedAfterCompletion:maxAfter,
    totals:{rowAdmissions:perCall.reduce((n,c)=>n+c.basisWork.rowAdmissions,0),bodyDigests:perCall.reduce((n,c)=>n+c.basisWork.bodyDigests,0)},
    heap:{before:heapBefore,after:heapAfter,gcExposed:gc!==undefined,meaning:'process heapUsed observation only; separate from owner gauges; no bound claimed'},
    perCall}));
});
