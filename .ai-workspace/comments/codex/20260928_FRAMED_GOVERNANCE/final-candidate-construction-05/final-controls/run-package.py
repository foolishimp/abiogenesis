from pathlib import Path
import subprocess,sys,json,time
D=Path(__file__).resolve().parent.parent;started=time.monotonic();statuses=[]
for label in ['pack','install']:
 p=subprocess.run([sys.executable,str(D/'final-controls/execute.py'),label],cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 statuses.append({'stage':label,'supervisorExitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr});print(label,p.stdout.strip(),flush=True)
 if p.returncode:
  (D/'final-package-sequence-failure.json').write_text(json.dumps({'statuses':statuses,'elapsedMs':(time.monotonic()-started)*1000},indent=2)+'\n');print(p.stderr,flush=True);sys.exit(p.returncode)
p=subprocess.run([sys.executable,str(D/'final-controls/correspondence.py'),'package'],cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
statuses.append({'stage':'package-correspondence','supervisorExitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr})
(D/'final-package-sequence.json').write_text(json.dumps({'statuses':statuses,'elapsedMs':(time.monotonic()-started)*1000},indent=2)+'\n');print('package-correspondence',p.stdout.strip(),flush=True)
if p.returncode:print(p.stderr,flush=True)
sys.exit(p.returncode)
