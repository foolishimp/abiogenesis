import os,sys,json,time,signal,subprocess
from pathlib import Path
p=Path(__file__).resolve().parent
env={**os.environ,**json.loads((p/'runtime-environment.json').read_text())}
command=['node','--max-old-space-size=4096',str(p/'driver.mjs')]
started=time.monotonic();stdout=(p/'driver-stdout.log').open('xb');stderr=(p/'driver-stderr.log').open('xb')
child=subprocess.Popen(command,cwd=p,env=env,stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,start_new_session=True)
(p/'driver-process-start.json').write_text(json.dumps({'pid':child.pid,'processGroup':child.pid,'command':command,'cwd':str(p),'budgetMs':2400000,'startedAt':time.time(),'environment':env if False else json.loads((p/'runtime-environment.json').read_text())},indent=2)+'\n')
print(json.dumps({'phase':'NATIVE_DRIVER_STARTED','pid':child.pid,'processGroup':child.pid}),flush=True)
timedOut=False;termAt=None
while True:
 pid,status,usage=os.wait4(child.pid,os.WNOHANG)
 if pid:break
 if time.monotonic()-started>2400 and termAt is None:
  timedOut=True;termAt=time.monotonic();os.killpg(child.pid,signal.SIGTERM)
 if termAt is not None and time.monotonic()-termAt>1:
  try:os.killpg(child.pid,signal.SIGKILL)
  except ProcessLookupError:pass
 time.sleep(.1)
stdout.close();stderr.close();code=os.waitstatus_to_exitcode(status)
value={'pid':pid,'processGroup':pid,'command':command,'elapsedMs':round((time.monotonic()-started)*1000,3),'exitCode':code if code>=0 else None,'signal':signal.Signals(-code).name if code<0 else None,'timedOut':timedOut,'peakRSSBytes':usage.ru_maxrss,'userSeconds':usage.ru_utime,'systemSeconds':usage.ru_stime,'observation':'wait4 actual driver; macOS ru_maxrss bytes; native children independently observed'}
(p/'driver-process.json').write_text(json.dumps(value,indent=2)+'\n');print(json.dumps({'phase':'NATIVE_DRIVER_CLOSED',**value}),flush=True)
sys.exit(code if code>=0 else 128-code)
