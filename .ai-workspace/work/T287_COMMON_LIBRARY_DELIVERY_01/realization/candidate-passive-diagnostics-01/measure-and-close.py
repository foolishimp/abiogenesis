"""Read closed passive outputs once; retain scoped comparisons without performance acceptance."""
from pathlib import Path
from collections import Counter
import datetime, hashlib, json, os, re, stat, subprocess, sys

L=Path(sys.argv[1]).resolve();R=L.parent;B=R.parent/'baseline-diagnostics-01'
sha=lambda b:hashlib.sha256(b).hexdigest()
obj=lambda p:json.loads(Path(p).read_text())
def pin(p):
    p=Path(p);b=p.read_bytes();return dict(path=str(p),sha256=sha(b),bytes=len(b),mode=oct(stat.S_IMODE(p.stat().st_mode)))
def write(p,v):
    with Path(p).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def timing(p):
    text=Path(p).read_text()
    m=re.search(r'([\d.]+) real\s+([\d.]+) user\s+([\d.]+) sys',text)
    assert m,text
    fields=dict(wallSeconds=float(m[1]),userSeconds=float(m[2]),systemSeconds=float(m[3]))
    for label,key in [('maximum resident set size','maximumResidentSetSizeBytes'),('peak memory footprint','peakMemoryFootprintBytes')]:
        match=re.search(r'(\d+)\s+'+label,text)
        if match:fields[key]=int(match[1])
    return dict(raw=pin(p),**fields,scope='macOS time -l whole command, original runner plus awaited children and passive instrumentation. No per-external-child attribution or summed memory maxima.')
def channels(s):
    api={};work=Counter();methods=Counter();scope=Counter();historyCount=0
    for p in s['processes']:
        for name,v in p['counters'].items():
            a=api.setdefault(name,{'calls':0,'total':0});a['calls']+=v['calls'];a['total']+=v['total']
        for owner in p['historyOwners']:
            historyCount+=1;work.update(owner['work']);methods.update(owner['methodCalls'])
            scope.update({k:v for k,v in owner['scopeWork'].items() if k in ['calls','newScopeRows','returnedRows']})
    native={}
    for t in s['traces']:
        for name,v in t['channels'].items():
            a=native.setdefault(name,{'calls':0,'bytes':0,'errors':0,'unsized':0})
            for k,n in v.items():a[k]+=n
    return dict(api=api,runtimeHistoryCumulativeWork=dict(work),runtimeHistoryMethodCalls=dict(methods),runtimeHistoryScopeObservations=dict(scope),historyOwnerCount=historyCount,nativeTraceChannels=native,scope='Each same-named channel summed across actual observed PIDs/owner identities. Distinct channels overlap and are never summed together. History counters count repeated work, not unique facts. Maxima are kept per PID.')

c=obj(L/'diagnostic-configuration.json');runtime=obj(c['originalConfiguration']['path']);root=Path(c['diagnosticRoot'])
coverage=obj(L/'coverage-result.json');assert coverage['status']=='satisfied'
s=obj(root/'diagnostic-summary.json');ref=obj(L/'reference-endpoint.json')
baseline=obj(B/L.name/'measurement-return.json')
baseSummaryPin=baseline.get('summary',baseline.get('nodeObservationSummary'));assert pin(baseSummaryPin['path'])['sha256']==baseSummaryPin['sha256']
bs=obj(baseSummaryPin['path'])
diagTime=timing(root/'execution.stderr');referenceTime=timing(ref['rawTime']['path'])
baseRaw=baseline.get('rawTimeEvidence',baseline.get('command',{}).get('rawTimeEvidence'))
baselineTime=timing(baseRaw['path'])
unknowns=['External tar/du per-PID CPU, memory and internal IO','Unsized native filesystem completion bytes and unprobed APIs','Cold selectScopeCold internal causal iteration counts','Later exit-handler work beyond observer snapshot','OS-wide IO/allocation peaks and CoW-exclusive bytes','Isolated instrumentation overhead, host-load causality and statistical distribution','Native provider/semantic cost: no provider runs selected']
record=dict(status='bounded_observations_with_disclosed_external_omissions',subjectId='candidate',lane=c['lane'],configuration=pin(L/'diagnostic-configuration.json'),summary=pin(root/'diagnostic-summary.json'),workloadResult=coverage['workloadResult'],coverage=pin(L/'coverage-result.json'),command=diagTime,referenceEndpointCommand=referenceTime,baselineDiagnosticCommand=baselineTime,baselineDiagnosticRecord=pin(B/L.name/'measurement-return.json'),baselineCoverageSuccessor=pin(B/'p1-coverage-successor-02/freeze.json') if L.name=='p1' else pin(B/'p3/freeze.json'),processCount=len(s['processes']),traceCount=len(s['traces']),traceBytes=s['traceBytes'],observerRecordBytes=s['observerRecordBytes'],perPidSamples=[{k:p[k] for k in ['pid','ppid','wallMs','cpuUs','maxRSSKiB']} for p in s['processes']],channels=channels(s),baselineChannels=channels(bs),footprints=pin(L/'footprints.json'),ownerHandoff=pin(L/'owner-handoff.json'),outputCorrespondence=pin(L/'observed-output-correspondence.json'),externalChildren=pin(L/'non-node-child-edges.json'),hostContext={'start':pin(L/'host-load-start.json'),'end':pin(L/'host-load-end.json'),'limit':'Other work runs concurrently; host load averages are context only, not attribution.'},observerOverhead='Native trace includes preflight, evidence and observer IO. JS probes exclude own hashing/serialization. Trace and final observer-record bytes are explicit overhead. Post-exit analysis/inventory/retention lies outside timed run. Diagnostic versus endpoint differences are observed runs, not isolated subtraction.',comparisonLimit='Exactly one diagnostic repetition per lane and one same-subject endpoint. Baseline and candidate owner/artifact/physical identities remain distinct and producer bound. Original baseline cache/environment boundary may differ. No speed threshold, speed ratio, causal regression attribution or semantic acceptance.',unobserved=unknowns,unobservedIsZero=False,nativeCalls=0,retryCount=0)
write(L/'measurement-return.json',record)
write(L/'result.json',dict(status='satisfied',subjectId='candidate',lane=c['lane'],workloadResult=coverage['workloadResult'],coverage=pin(L/'coverage-result.json'),measurements=pin(L/'measurement-return.json'),ownerHandoff=pin(L/'owner-handoff.json'),retention=pin(L/'physical-resources.json'),portableEvidence=pin(L/'portable-evidence-map.json'),scope='Original deterministic workload and bounded passive coverage; no L5 or release acceptance',nativeCalls=0,retryCount=0))
files=[pin(p) for p in sorted(L.rglob('*')) if p.is_file()]
external=obj(L/'physical-resources.json')['files']
write(L/'freeze.json',dict(status='closed_satisfied',files=files,externalFiles=external,subject=c['subjectId'],lane=c['lane'],archive=runtime['subject']['archive'],utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),retained=True,cleanup=False))
print(json.dumps(dict(status='satisfied',lane=c['lane'],wallSeconds=diagTime['wallSeconds'],userSeconds=diagTime['userSeconds'],systemSeconds=diagTime['systemSeconds'],processCount=len(s['processes']),traceBytes=s['traceBytes'],historyOwners=coverage['observedHistoryOwners'],freeze=pin(L/'freeze.json'))))
