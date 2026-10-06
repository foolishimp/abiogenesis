import datetime, json, os, signal, subprocess, sys, time
from pathlib import Path
D=Path(__file__).resolve().parent
name=sys.argv[1]
assert name in ['check-01.mjs','check-02.mjs','check-03.mjs']
start=time.monotonic(); started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (D/(name+'.stdout')).open('wb') as out, (D/(name+'.stderr')).open('wb') as err:
    p=subprocess.Popen(['node',str(D/name)],cwd=D,stdout=out,stderr=err,start_new_session=True)
    timeout=False
    try: rc=p.wait(timeout=120)
    except subprocess.TimeoutExpired:
        timeout=True;os.killpg(p.pid,signal.SIGTERM)
        try:rc=p.wait(timeout=1)
        except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);rc=p.wait()
elapsed=time.monotonic()-start
record={'command':['node',str(D/name)],'startedAt':started,'pid':p.pid,'processGroup':p.pid,'timeoutMs':120000,'terminationGraceMs':1000,'elapsedSeconds':elapsed,'exitCode':rc,'timedOut':timeout,'stdout':name+'.stdout','stderr':name+'.stderr','claim':'owned process only; no provider/native execution'}
(D/(name+'.process.json')).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record))
print((D/(name+'.stdout')).read_text())
if rc:print((D/(name+'.stderr')).read_text())
sys.exit(rc)
