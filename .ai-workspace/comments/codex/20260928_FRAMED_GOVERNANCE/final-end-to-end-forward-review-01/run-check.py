import datetime,json,os,signal,subprocess,time
from pathlib import Path
d=Path(__file__).resolve().parent;start=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (d/'check.stdout').open('wb') as out,(d/'check.stderr').open('wb') as err:
 p=subprocess.Popen(['node',str(d/'check.mjs')],cwd=d,stdout=out,stderr=err,start_new_session=True);timedout=False
 try:rc=p.wait(timeout=120)
 except subprocess.TimeoutExpired:
  timedout=True;os.killpg(p.pid,signal.SIGTERM)
  try:rc=p.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);rc=p.wait()
r={'command':['node',str(d/'check.mjs')],'startedAt':started,'pid':p.pid,'processGroup':p.pid,'elapsedSeconds':time.monotonic()-start,'exitCode':rc,'timedOut':timedout,'capMs':120000,'graceMs':1000,'stdout':'check.stdout','stderr':'check.stderr','scope':'owned pure contract check process only'}
(d/'check-process.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));print((d/'check.stdout').read_text());print((d/'check.stderr').read_text());raise SystemExit(rc)
