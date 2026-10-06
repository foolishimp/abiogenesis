from pathlib import Path
import subprocess,sys,os,time,json,signal,threading,hashlib,datetime
X=Path(__file__).resolve().parent
D=X.parent/'final-f11-native-assessment-01'
activation=json.loads((X/'native-activation.json').read_bytes())
grant=Path(activation['grant']['path']).read_bytes()
assert len(grant)==5742 and hashlib.sha256(grant).hexdigest()=='54828efe64d68774fa28987c24e9cd09901afcfcd2d4ceae687a1d955023d6ec'
def put(n,v):
    with (X/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
put('worker-activation.json',{'role':'Worker','activation':'T287_F11_NATIVE_ASSESSMENT_01',
 'actor':'/root/f11_validation_path_plan','declaredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'grant':activation['grant'],'callerFreeze':activation['callerFreeze'],'boundFreeze':activation['boundFreeze'],
 'writeTerritory':str(X),'nativeTerritories':'Exact event append, original lock/archive/TMPDIR as enumerated by Root grant; no source/install/caller/binding/worksite/auth edits',
 'controlBasis':'stdo://releases/v2.5.1-rc.2/','candidateLaw':'Immutable C02/Q02 RC1',
 'calls':5,'assessmentDispatches':1,'retries':0})
argv=json.loads((D/'effect-plan.json').read_bytes())['entry']
assert argv==['python3',str(D/'observe-process.py'),str(X/'driver-process.json'),'node','--max-old-space-size=4096',str(D/'driver.mjs'),str(X)]
started=time.monotonic()
child=subprocess.Popen(argv,cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
put('outer-process-start.json',{'pid':child.pid,'processGroup':child.pid,'argv':argv,
 'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ceilingMs':2400000,'terminationGraceMs':1000})
def pump(pipe,path,target):
    with path.open('xb') as out:
        while True:
            b=pipe.readline()
            if not b:break
            out.write(b);out.flush();target.buffer.write(b);target.flush()
    pipe.close()
threads=[threading.Thread(target=pump,args=(child.stdout,X/'driver.stdout',sys.stdout)),threading.Thread(target=pump,args=(child.stderr,X/'driver.stderr',sys.stderr))]
for t in threads:t.start()
timed_out=False;signals=[]
def signal_owned_groups(sig):
    groups={child.pid}
    for p in X.glob('f11-*-process-start.json'):
        row=json.loads(p.read_bytes());groups.add(row['processGroup'])
    for pg in sorted(groups):
        try:os.killpg(pg,sig);signals.append({'group':pg,'signal':signal.Signals(sig).name})
        except ProcessLookupError:pass
try:code=child.wait(timeout=2400)
except subprocess.TimeoutExpired:
    timed_out=True;signal_owned_groups(signal.SIGTERM)
    try:code=child.wait(timeout=1)
    except subprocess.TimeoutExpired:signal_owned_groups(signal.SIGKILL);code=child.wait()
    signal_owned_groups(signal.SIGKILL)
for t in threads:t.join(timeout=5)
assert all(not t.is_alive() for t in threads),'Output pipe did not close; preserve stop evidence'
groups=[]
for p in X.glob('f11-*-process-start.json'):
    row=json.loads(p.read_bytes())
    try:os.killpg(row['processGroup'],0);alive=True
    except ProcessLookupError:alive=False
    groups.append({'label':row['label'],'processGroup':row['processGroup'],'alive':alive})
put('outer-process-result.json',{'pid':child.pid,'exitCode':code if code>=0 else None,
 'signal':signal.Signals(-code).name if code<0 else None,'timedOut':timed_out,'signals':signals,
 'elapsedMs':round((time.monotonic()-started)*1000,3),'nativeGroups':groups,'reaped':True,
 'allOwnedGroupsClosed':not any(x['alive'] for x in groups)})
print(json.dumps({'status':'NATIVE_PROCESS_REAPED','exitCode':code,'timedOut':timed_out,'groupsClosed':not any(x['alive'] for x in groups)}))
sys.exit(code if code>=0 else 128-code)
