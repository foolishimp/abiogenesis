from pathlib import Path
import hashlib, json, subprocess, sys, time
D=Path(__file__).resolve().parent.parent
assert not (D/'final-construction-sequence.json').exists()
start=time.monotonic();phases=[]
sequence=[('dependencies','execute.py',['dependencies']),('build','run-build.py',[]),('package','run-package.py',[]),('verify','execute.py',['verify']),('installed-readiness','run-installed-readiness.py',[]),('freeze','finalize.py',[])]
for name,script,args in sequence:
 p=subprocess.Popen([sys.executable,'-B',str(D/'final-controls'/script),*args],cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 out,err=p.communicate();phase={'phase':name,'script':script,'arguments':args,'pid':p.pid,'exitCode':p.returncode,'stdout':out,'stderr':err,'childReaped':True};phases.append(phase)
 print(name,out.strip(),flush=True)
 if p.returncode:
  with (D/'final-construction-sequence-failure.json').open('x') as f:json.dump({'status':'STOPPED_ON_FIRST_FAILURE','phases':phases,'elapsedMs':(time.monotonic()-start)*1000,'noRetry':True,'nextEffect':'Root triangulation only'},f,indent=2);f.write('\n')
  print(err,flush=True);sys.exit(p.returncode)
 # The successful finalizer is the last Writer and freezes all prior evidence.
 if name=='installed-readiness':
  with (D/'final-construction-sequence.json').open('x') as f:json.dump({'status':'TEN_COMMAND_CONSTRUCTION_PASSED_PENDING_FINAL_FREEZE','phases':phases,'elapsedMs':(time.monotonic()-start)*1000,'sourceTests':0,'runtimeProviderNetworkGit':0,'oneBuildPackInstall':True},f,indent=2);f.write('\n')
sys.exit(0)
