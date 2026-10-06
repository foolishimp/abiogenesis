from pathlib import Path
import json,subprocess,sys,time
D=Path(__file__).resolve().parent.parent;began=time.monotonic();phases=[]
for label in ['installed-publications','wrapper-preparation','wrapper-compatibility']:
 command=[sys.executable,str(D/'final-controls/prepare-wrapper-comparison.py')] if label=='wrapper-preparation' else [sys.executable,str(D/'final-controls/execute.py'),label]
 completed=subprocess.run(command,cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 phases.append({'phase':label,'exitCode':completed.returncode,'stdout':completed.stdout,'stderr':completed.stderr})
 print(label,completed.stdout.strip(),flush=True)
 if completed.returncode:break
with (D/'final-installed-readiness-sequence.json').open('x') as output:json.dump({'phases':phases,'elapsedMs':(time.monotonic()-began)*1000,'stoppedOnFirstFailure':completed.returncode!=0},output,indent=2);output.write('\n')
if completed.returncode:print(completed.stderr,flush=True)
sys.exit(completed.returncode)
