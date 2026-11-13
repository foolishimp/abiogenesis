from pathlib import Path
from datetime import datetime, timezone
import json, os, sys, subprocess, time, signal, hashlib
A=Path(__file__).resolve().parent
member=sys.argv[1]
assert member in ('run_result','run_replay')
grant=json.loads((A/'ROOT_ADMISSION.json').read_text())
for pin in grant['files']:
 b=Path(pin['path']).read_bytes()
 assert len(b)==pin['bytes'] and hashlib.sha256(b).hexdigest()==pin['sha256']
i=json.loads((A/'INPUT.json').read_text()); env=dict(i['config']['setupEnvironment'])
assert env['NODE_OPTIONS']=='--max-old-space-size=8192'
started=datetime.now(timezone.utc).isoformat();t=time.perf_counter();os.umask(0o077)
with (A/(member+'.stdout')).open('x') as out,(A/(member+'.stderr')).open('x') as err:
 child=subprocess.Popen([i['config']['nodePath'],str(A/'read-one.mjs'),member,hashlib.sha256((A/'INPUT.json').read_bytes()).hexdigest()],cwd=A,env=env,stdout=out,stderr=err,start_new_session=True)
 launch={'startedUtc':started,'pid':child.pid,'member':member,'automaticRetry':False,'outerTimeoutMs':900000}
 with (A/(member+'.LAUNCH.json')).open('x') as f:f.write(json.dumps(launch,indent=2)+'\n')
 print(json.dumps({'status':'READBACK_RECOVERY_LAUNCHED',**launch}),flush=True)
 timed=False
 try:code=child.wait(timeout=900)
 except subprocess.TimeoutExpired:
  timed=True;os.killpg(child.pid,signal.SIGTERM)
  try:code=child.wait(timeout=5)
  except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);code=child.wait()
 r={'startedUtc':started,'endedUtc':datetime.now(timezone.utc).isoformat(),'wallMs':(time.perf_counter()-t)*1000,'exitCode':code,'timedOut':timed}
 with (A/(member+'.RESULT.json')).open('x') as f:f.write(json.dumps(r,indent=2)+'\n')
 print(json.dumps({'status':'READBACK_RECOVERY_RETURNED','member':member,**r}),flush=True)
 sys.exit(1 if timed else code)
