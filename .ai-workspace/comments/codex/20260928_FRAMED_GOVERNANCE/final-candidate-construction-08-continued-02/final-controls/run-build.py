from pathlib import Path
import subprocess,sys,json,time
D=Path(__file__).resolve().parent.parent
started=time.monotonic();statuses=[]
for label in ['clean','compile','authority-stage','manifest']:
 p=subprocess.run([sys.executable,str(D/'final-controls/execute.py'),label],cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 statuses.append({'stage':label,'supervisorExitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr})
 print(label,p.stdout.strip(),flush=True)
 if p.returncode:
  (D/'final-build-sequence-failure.json').write_text(json.dumps({'statuses':statuses,'elapsedMs':(time.monotonic()-started)*1000},indent=2)+'\n');print(p.stderr,flush=True);sys.exit(p.returncode)
p=subprocess.run([sys.executable,str(D/'final-controls/correspondence.py'),'generated'],cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
statuses.append({'stage':'generated-correspondence','supervisorExitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr})
(D/'final-build-sequence.json').write_text(json.dumps({'statuses':statuses,'elapsedMs':(time.monotonic()-started)*1000},indent=2)+'\n')
print('generated-correspondence',p.stdout.strip(),flush=True)
if p.returncode:print(p.stderr,flush=True)
sys.exit(p.returncode)
