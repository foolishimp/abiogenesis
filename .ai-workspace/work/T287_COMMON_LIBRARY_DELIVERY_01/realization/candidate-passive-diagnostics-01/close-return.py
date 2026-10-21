from pathlib import Path
import collections, datetime, hashlib, json, os, stat, subprocess, traceback
R=Path(__file__).resolve().parent;B=R.parent/'baseline-diagnostics-01';W=R.parent.parent
sha=lambda b:hashlib.sha256(b).hexdigest();obj=lambda p:json.loads(Path(p).read_text())
def pin(p):
    p=Path(p);b=p.read_bytes();return dict(path=str(p),sha256=sha(b),bytes=len(b),mode=oct(stat.S_IMODE(p.stat().st_mode)))
def write(p,x):
    with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
try:
    lanes={};table=[]
    for lane in ['p1','p3']:
        L=R/lane;m=obj(L/'measurement-return.json');coverage=obj(L/'coverage-result.json');result=obj(L/'result.json');assert coverage['status']==result['status']=='satisfied'
        cfg=obj(L/'runtime-configuration.json');evidence=Path(cfg['lanes'][m['lane']]['roots']['evidence']);actual=obj(evidence/'result.json')
        lanes[lane]=dict(result=pin(L/'result.json'),freeze=pin(L/'freeze.json'),measurements=pin(L/'measurement-return.json'),coverage=pin(L/'coverage-result.json'),ownerHandoff=pin(L/'owner-handoff.json'),prefix=obj(L/'owner-handoff.json')['closeHandoff']['prefix'],rawProcess=pin(L/'process-result.json'),processCount=m['processCount'],traceCount=m['traceCount'],traceBytes=m['traceBytes'],observerRecordBytes=m['observerRecordBytes'],historyOwners=coverage['observedHistoryOwners'],instrumentedChildEdges=coverage['instrumentedChildEdges'],externalChildEdges=coverage['externalChildEdges'],cleanupHooksCaptured=actual['retainedCleanupHooks'],cleanupHooksExecuted=0,nativeCalls=0,retryCount=0)
        table.append(dict(lane=lane,candidateEndpoint=m['referenceEndpointCommand'],candidateDiagnostic=m['command'],baselineDiagnostic=m['baselineDiagnosticCommand'],candidateWork=m['channels'],baselineWork=m['baselineChannels'],candidateFootprints=pin(L/'footprints.json'),baselineFootprints=pin(B/lane/'footprints.json')))
    p1=obj(R/'p1/evidence/p1-owner-state.json');b1=obj(B/'p1/evidence/p1-owner-state.json')
    ops=lambda s:[{k:x[k] for k in ['label','definitionKey','exitCode','outcomeKind']} for x in s['calls']]
    assert p1['selectedProgram']==b1['selectedProgram'] and ops(p1)==ops(b1)
    p3=obj(R/'p3/evidence/start.json');b3=obj(B/'p3/evidence/start.json')
    output=lambda s:s['receipt']['ownerOutput']['value']['terminalResult']['value']
    assert output(p3)==output(b3)=={'kind':'hello_world_output','schemaVersion':'5.0.0','message':'Hello World'}
    e3=obj(R/'p3/evidence/installed-environment.json');be3=obj(B/'p3/evidence/installed-environment.json')
    assert e3['additionalProducts'][0]['ids']==be3['additionalProducts'][0]['ids']
    write(R/'baseline-candidate-comparison.json',dict(status='bounded_correspondence_and_observations',lanes=table,exactCrossSubject={'P1FullProgram':True,'P1TenOperationContractsAndOutcomes':True,'P3LiteralHelloWorld':True,'P3FixtureLogicalIds':True},producerBoundIdentities='Archive, fixture, install, event, prefix and physical identities retain actual producer relations and differ by subject. No global normalization.',baselineClosure={'P1OriginalWorkload':pin(B/'p1/result.json'),'P1CoverageSuccessor':pin(B/'p1-coverage-successor-02/freeze.json'),'P3':pin(B/'p3/freeze.json')},limits=['Single endpoint and passive repetition per lane; no isolated overhead, statistical comparison, speed ratio or regression attribution','Host workloads, scheduling and original baseline cache boundary are not controlled','Byte/API/history channels retain individual scope and overlap; zeros in a measured channel do not represent unobserved channels','External tar/du CPU/memory/IO, unsized native bytes and cold-scope internal iterations remain unobserved','No native or semantic-quality comparison; no acceptance decision']))
    footprint=[]
    for root in [R,Path('/private/tmp/abg-stdo3-candidate-diag-947f3a62d1ce48b0')]:
        files=[p for p in root.rglob('*') if p.is_file() and not p.is_symlink()]
        du=subprocess.run(['/usr/bin/du','-sk',str(root)],capture_output=True,text=True,check=True)
        footprint.append(dict(root=str(root),files=len(files),logicalBytes=sum(p.stat().st_size for p in files),allocatedKiB=int(du.stdout.split()[0]),scope='Pre-return/final-freeze retained roots, excluding only these final small metadata records; no unique/CoW-exclusive allocation claim'))
    total=sum(x['logicalBytes'] for x in footprint);assert total<10*1024**3
    write(R/'retained-storage.json',dict(roots=footprint,totalLogicalBytes=total,maximumAdditionalRetainedBytes=10*1024**3,cleanup=False,selectedOriginalStageAndArchivesReferencedNotCopied=True))
    unknowns=obj(R/'p3/measurement-return.json')['unobserved']
    answer=dict(status='satisfied_bounded_diagnostics',activation='FINAL-CANDIDATE-DIAGNOSTICS-01',subjectId='candidate',archive=obj(R/'p1/runtime-configuration.json')['subject']['archive'],lanes=lanes,comparison=pin(R/'baseline-candidate-comparison.json'),retainedStorage=pin(R/'retained-storage.json'),unobserved=unknowns,effects={'P1Repetitions':1,'P3Repetitions':1,'baselineRepetitions':0,'nativeProviderCalls':0,'sourceChanges':0,'builds':0,'packs':0,'GitActions':0,'retryCount':0,'cleanup':False,'continuation17Access':0},resultConsumer='/root',scope='Frozen original deterministic workload/oracle plus passive coverage and scoped cost observations. No L5, Product acceptance or release decision.',stopAfterReturn=True)
    write(R/'return.json',answer)
    with (R/'return.md').open('x') as f:
        f.write('''# Final06 passive diagnostic return\n\nProduct Frame: fixed ABI5.0 fifteen-family Product; T287 common-library L4 proof/cost slice. Original GTL, HoG, owner, ABG admission and replay authority is conserved. This return is evidence, not L5 or release acceptance.\n\nBoth original deterministic workloads and their unchanged independent oracles passed. P1 preserves the exact selected Program and ten Public operation contracts/outcomes against both its final06 endpoint and the baseline. P3 returns literal Hello World and passes fresh result/replay under the original oracle; fixture logical IDs match baseline. Archive/install/event/prefix identities remain actual producer-bound coordinates.\n\n| Lane | Final06 uninstrumented command, s | Final06 diagnostic command, s | Baseline diagnostic command, s | Node/trace pairs | External tar/du edges |\n|---|---:|---:|---:|---:|---:|\n''')
        for row in table:
            k=row['lane'];v=lanes[k]
            f.write(f"| {k.upper()} | {row['candidateEndpoint']['wallSeconds']:.2f} | {row['candidateDiagnostic']['wallSeconds']:.2f} | {row['baselineDiagnostic']['wallSeconds']:.2f} | {v['processCount']} | {v['externalChildEdges']} |\n")
        f.write('''\nThese are observed runs, not controlled estimates of overhead or refactor performance. P1 diagnostic wall time is higher than its endpoint; P3 diagnostic wall time is much lower than its 417.89 s endpoint. Concurrent host workloads and scheduling are uncontrolled. No speed ratio, threshold or cause is asserted. Per-phase clocks, per-PID CPU/RSS samples, separate API/native byte channels, actual history/index counters and complete retained footprints are in the linked records. Maxima and overlapping channels are not summed.\n\nThe same frozen launcher, preload, probes, original runner, oracle and analyser were used. Each lane had fresh canonical roots, an explicit empty offline npm cache and distinct empty npmrc files. Outer NODE_OPTIONS was cleared; the explicit runtime environment omitted it as the immutable protocol requires. No provider, baseline repetition, source/build/package change, retry, cleanup or Git operation occurred. The original runner performed its own preflight; no extra whole-stage inventory was performed merely to bind metadata.\n\nThe baseline P1 workload remains its successful original execution, conjoined with the closed analysis-only coverage successor. No baseline runtime was repeated. External tar/du per-PID CPU/memory/IO, unsized native completion bytes, cold causal iterations and isolated observer cost remain unobserved. Captured cleanup hooks were not invoked, and all task resources remain retained. Physical/log identity and raw trace records are linked by the lane freezes.\n\nExecutive alone conjoins this bounded return with other library obligations and independent L5.\n''')
    files=[pin(p) for p in sorted(R.iterdir()) if p.is_file()]
    files += [pin(p) for p in sorted((R/'operations').rglob('*')) if p.is_file()]
    files += [pin(R/l/'freeze.json') for l in ['p1','p3']]
    write(R/'freeze.json',dict(status='closed_satisfied',files=files,transitiveLaneFreezes=[pin(R/l/'freeze.json') for l in ['p1','p3']],utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),scope='Compact root records plus exact transitive lane evidence and original physical inventories; no acceptance',retained=True))
    print(json.dumps({'status':answer['status'],'return':pin(R/'return.json'),'freeze':pin(R/'freeze.json'),'retainedLogicalBytes':total,'lanes':{k:{j:v[j] for j in ['processCount','traceCount','historyOwners','externalChildEdges','traceBytes']} for k,v in lanes.items()}}))
except Exception as e:
    write(R/'closure-stop.json',dict(status='stopped',firstCause=repr(e),traceback=traceback.format_exc(),stop='Return to Root before repair/retry; P1/P3 workload outputs and prior closed evidence remain retained'))
    raise
