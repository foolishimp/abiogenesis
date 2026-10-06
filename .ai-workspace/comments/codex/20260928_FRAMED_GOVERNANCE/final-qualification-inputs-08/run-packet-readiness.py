"""One managed default-heap packet readiness process; zero Runtime dispatch."""
from pathlib import Path
import os,sys,signal,time,json,datetime
Q=Path(__file__).resolve().parent;G=Q.parent
node=G/'final-candidate-construction-06/source-freeze/toolchain/bin/node'
environment={'PATH':str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin','HOME':os.environ['HOME'],'TMPDIR':str(Q/'tmp'),'LANG':'C','LC_ALL':'C'}
command=[str(node),str(Q/'f11/packet-readiness.mjs')];limit=180
def write(name,v):
 with (Q/name).open('x')as f:json.dump(v,f,indent=2);f.write('\n')
out=os.open(Q/'packet-readiness.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600);err=os.open(Q/'packet-readiness.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
ready_r,ready_w=os.pipe();gate_r,gate_w=os.pipe();start=time.monotonic();pid=os.fork()
if pid==0:
 os.close(ready_r);os.close(gate_w);os.setsid();os.write(ready_w,b'R');os.close(ready_w);os.read(gate_r,1);os.close(gate_r)
 os.dup2(out,1);os.dup2(err,2);os.close(out);os.close(err);os.execve(command[0],command,environment)
os.close(ready_w);os.close(gate_r);assert os.read(ready_r,1)==b'R';os.close(ready_r)
write('packet-supervisor-start.json',{'command':command,'cwd':str(Q),'environment':environment,'pid':pid,'processGroup':pid,'groupEstablishedBeforeImports':True,'defaultHeap':True,'budgetSeconds':limit,'RuntimeEffects':0})
os.write(gate_w,b'G');os.close(gate_w);os.close(out);os.close(err);term=None;kill=None
while True:
 waited,status,usage=os.wait4(pid,os.WNOHANG)
 if waited==pid:break
 now=time.monotonic()
 if now-start>=limit and term is None:
  term=now
  try:os.killpg(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 if term is not None and now-term>=1 and kill is None:
  kill=now
  try:os.killpg(pid,signal.SIGKILL)
  except ProcessLookupError:pass
 time.sleep(.05)
code=os.waitstatus_to_exitcode(status)
try:os.killpg(pid,0);group='present'
except ProcessLookupError:group='absent'
write('packet-supervisor-close.json',{'command':command,'pid':pid,'processGroup':pid,'wait4Reaped':True,'groupAfterWait':group,'exitCode':code,'timedOut':term is not None,
 'elapsedMs':(time.monotonic()-start)*1000,'maxRSSBytesMacOS':usage.ru_maxrss,'userSeconds':usage.ru_utime,'systemSeconds':usage.ru_stime,'RuntimeEffects':0})
print(json.dumps({'exitCode':code,'groupAfterWait':group,'elapsedMs':(time.monotonic()-start)*1000,'maxRSSBytesMacOS':usage.ru_maxrss}))
sys.exit(0 if code==0 and term is None and group=='absent'else 2)
