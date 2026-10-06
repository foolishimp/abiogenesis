#!/usr/bin/env python3
"""External finite process-group observation; no runtime authority or PID enumeration."""
import os,sys,json,time,signal,errno,datetime
from pathlib import Path

root=Path(__file__).resolve().parent
mode=sys.argv[1]
assert mode in ('setup','flow','cold')
command=sys.argv[2:]
assert command and Path(command[0]).name=='node'
task_environment=json.loads((root/'runtime-environment.json').read_text())
original_home=os.environ.get('HOME')
for key in ('NODE_OPTIONS','NODE_PATH','V8_OPTIONS','ABG_TS_CLAUDE_COMMAND','ABG_TS_GEMINI_COMMAND','ABG_TS_CODEX_COMMAND'):
 os.environ.pop(key,None)
os.environ.update(task_environment)
assert os.environ.get('HOME')==original_home
start=time.monotonic();started_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
budgets=json.loads((root/'budgets.json').read_text())
total_seconds=int(budgets['totalSetupBudgetMs' if mode=='setup' else 'totalFlowBudgetMs']/1000)
assert 0<total_seconds<=600
preflight_seconds=int(budgets['nominalPreflightMs']/1000)if mode=='setup'else total_seconds
phase=root/'nominal-preflight-completion.json'
def write(name,value):
 with (root/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def probe(group):
 try:os.killpg(group,0);return 'present'
 except ProcessLookupError:return 'absent'
 except PermissionError:return 'unobservable_permission'

out=os.open(root/(mode+'-supervised-stdout.log'),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
err=os.open(root/(mode+'-supervised-stderr.log'),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
ready_r,ready_w=os.pipe();gate_r,gate_w=os.pipe()
pid=os.fork()
if pid==0:
 os.close(ready_r);os.close(gate_w)
 os.setsid();os.write(ready_w,b'R');os.close(ready_w)
 os.read(gate_r,1);os.close(gate_r)
 os.dup2(out,1);os.dup2(err,2)
 null=os.open('/dev/null',os.O_RDONLY);os.dup2(null,0)
 os.close(out);os.close(err)
 os.execv(command[0],command)
os.close(ready_w);os.close(gate_r)
assert os.read(ready_r,1)==b'R';os.close(ready_r)
write(mode+'-supervisor-start.json',{'mode':mode,'command':command,'cwd':str(Path.cwd()),'pid':pid,'processGroup':pid,'groupEstablishedBeforeImports':True,'startedAt':started_at,'monotonicStart':start,'preflightDeadlineMonotonic':start+preflight_seconds,'totalDeadlineMonotonic':start+total_seconds,'preflightSeconds':preflight_seconds,'totalSeconds':total_seconds,'heap':'unchanged','HOME':original_home,'taskEnvironment':task_environment,'phaseCompletionReceipt':str(phase) if mode=='setup' else None})
os.write(gate_w,b'G');os.close(gate_w);os.close(out);os.close(err)
timed_out=False;reason=None;phase_observed=None;term_at=None;kill_at=None
while True:
 waited,status,usage=os.wait4(pid,os.WNOHANG)
 if waited==pid:break
 now=time.monotonic()
 if mode=='setup' and phase_observed is None and phase.exists():
  try:phase_observed=json.loads(phase.read_text())
  except json.JSONDecodeError:pass
 expired=now>=start+total_seconds or (phase_observed is None and now>=start+preflight_seconds)
 if expired and term_at is None:
  timed_out=True;reason='preflight_deadline' if phase_observed is None and mode=='setup' else 'total_deadline';term_at=now
  try:os.killpg(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 if term_at is not None and now>=term_at+1 and kill_at is None:
  kill_at=now
  try:os.killpg(pid,signal.SIGKILL)
  except ProcessLookupError:pass
 time.sleep(0.05)
closed_at=datetime.datetime.now(datetime.timezone.utc).isoformat();elapsed=(time.monotonic()-start)*1000
exit_code=os.waitstatus_to_exitcode(status);remaining=probe(pid)
known_groups=[]
if True:
 for p in sorted(root.glob('*-process-start.json')):
  row=json.loads(p.read_text());group=row.get('processGroup')
  if isinstance(group,int) and group!=pid:
   before=probe(group)
   if before=='present':
    try:os.killpg(group,signal.SIGTERM)
    except ProcessLookupError:pass
   known_groups.append({'source':str(p),'processGroup':group,'before':before,'afterTERM':probe(group)})
 if remaining=='present':
  try:os.killpg(pid,signal.SIGTERM)
  except ProcessLookupError:pass
  remaining=probe(pid)
receipt={'mode':mode,'command':command,'pid':pid,'processGroup':pid,'startedAt':started_at,'closedAt':closed_at,'elapsedMs':elapsed,'exitCode':exit_code,'timedOut':timed_out,'deadlineReason':reason,'termMonotonic':term_at,'killMonotonic':kill_at,'wait4ReapedMain':True,'processGroupAfterWait':remaining,'phaseCompletion':phase_observed,'rssBytes':usage.ru_maxrss,'userSeconds':usage.ru_utime,'systemSeconds':usage.ru_stime,'knownCLIProcessGroups':known_groups,'unknownChildren':'none established by enumeration; no ps dependence; group probe reports available boundary only'}
write(mode+'-supervisor-close.json',receipt)
print(json.dumps(receipt))
sys.exit(0 if exit_code==0 and not timed_out else 1)
