import os,sys,json,time,signal,datetime
from pathlib import Path
root=Path(__file__).resolve().parent;mode=sys.argv[1];assert mode in ('compile','readiness');command=sys.argv[2:];assert command
config=json.loads((root/'environment.json').read_text());prior_home=os.environ.get('HOME')
for k in ('NODE_OPTIONS','NODE_PATH','V8_OPTIONS'):os.environ.pop(k,None)
os.environ.update(config['environment']);assert prior_home==os.environ.get('HOME')
start=time.monotonic();started_at=datetime.datetime.now(datetime.timezone.utc).isoformat();cap=180 if mode=='compile' else 600;phase_cap=180
phase_nominal=root/'readiness-nominal-completion.json';phase_install=root/'readiness-install-completion.json'
def write(n,v):
 with (root/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def probe(group):
 try:os.killpg(group,0);return 'present'
 except ProcessLookupError:return 'absent'
 except PermissionError:return 'unobservable_permission'
out=os.open(root/(mode+'-stdout.log'),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);err=os.open(root/(mode+'-stderr.log'),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
rr,rw=os.pipe();gr,gw=os.pipe();pid=os.fork()
if pid==0:
 os.close(rr);os.close(gw);os.setsid();os.write(rw,b'R');os.close(rw);os.read(gr,1);os.close(gr);os.dup2(out,1);os.dup2(err,2);null=os.open('/dev/null',os.O_RDONLY);os.dup2(null,0);os.close(out);os.close(err);os.execv(command[0],command)
os.close(rw);os.close(gr);assert os.read(rr,1)==b'R';os.close(rr)
write(mode+'-supervisor-start.json',{'pid':pid,'processGroup':pid,'mode':mode,'command':command,'cwd':str(Path.cwd()),'startedAt':started_at,'monotonicStart':start,'deadlineMonotonic':start+cap,'capSeconds':cap,'phaseCapSeconds':phase_cap,'groupEstablishedBeforeImports':True,'heap':'unchanged','HOMEUnchanged':True,'environment':config['environment']});os.write(gw,b'G');os.close(gw);os.close(out);os.close(err)
nominal_at=None;install_at=None;timed=False;term=None;kill=None;reason=None
while True:
 waited,status,usage=os.wait4(pid,os.WNOHANG)
 if waited==pid:break
 now=time.monotonic()
 if mode=='readiness' and nominal_at is None and phase_nominal.exists():nominal_at=now
 if mode=='readiness' and install_at is None and phase_install.exists():install_at=now
 expired=now>=start+cap or (mode=='readiness' and nominal_at is None and now>=start+phase_cap) or (mode=='readiness' and nominal_at is not None and install_at is None and now>=nominal_at+phase_cap)
 if expired and term is None:
  timed=True;reason='total_or_selected_phase_deadline';term=now
  try:os.killpg(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 if term is not None and now>=term+1 and kill is None:
  kill=now
  try:os.killpg(pid,signal.SIGKILL)
  except ProcessLookupError:pass
 time.sleep(.05)
code=os.waitstatus_to_exitcode(status);receipt={'mode':mode,'command':command,'pid':pid,'processGroup':pid,'startedAt':started_at,'closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedMs':(time.monotonic()-start)*1000,'exitCode':code,'timedOut':timed,'deadlineReason':reason,'termMonotonic':term,'killMonotonic':kill,'parentWait4Reaped':True,'processGroupAfterWait':probe(pid),'peakRSSBytes':usage.ru_maxrss,'userSeconds':usage.ru_utime,'systemSeconds':usage.ru_stime,'nominalCompletionObserved':nominal_at is not None,'installCompletionObserved':install_at is not None,'unknownChildren':'npm is awaited by unchanged owner execFile completion; individual npm PID not enumerated; process group probe records entire observed group boundary'};write(mode+'-supervisor-close.json',receipt);print(json.dumps(receipt));sys.exit(0 if code==0 and not timed else 1)
