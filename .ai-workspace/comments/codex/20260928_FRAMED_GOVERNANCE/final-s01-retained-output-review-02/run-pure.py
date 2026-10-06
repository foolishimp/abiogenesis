from pathlib import Path
import subprocess,time,json,sys,os,signal,hashlib
O=Path(__file__).resolve().parent
label=sys.argv[1]; command=sys.argv[2:]
assert label and all(c.isalnum() or c in '-_' for c in label)
assert command[0] in ('python3','node') and Path(command[1]).resolve().is_relative_to(O)
ledger=O/'process-ledger.jsonl'
spent=sum(json.loads(s)['elapsedMs'] for s in ledger.read_text().splitlines() if s.strip())
allowance=min(120000,600000-spent)
assert allowance>0
st=time.monotonic();out=O/(label+'.stdout');err=O/(label+'.stderr');timed=False;signalled=[]
with out.open('xb') as stdout,err.open('xb') as stderr:
 p=subprocess.Popen(command,cwd=O,stdout=stdout,stderr=stderr,start_new_session=True)
 try:p.wait(timeout=allowance/1000)
 except subprocess.TimeoutExpired:
  timed=True;os.killpg(p.pid,signal.SIGTERM);signalled.append('SIGTERM')
  try:p.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);signalled.append('SIGKILL');p.wait()
elapsed=(time.monotonic()-st)*1000
row={'process':label,'command':command,'elapsedMs':elapsed,'exitCode':p.returncode,'timedOut':timed,'ownedGroupSignals':signalled,'stdout':out.name,'stderr':err.name,'nativeCalls':0}
with ledger.open('a') as f:f.write(json.dumps(row)+'\n')
(O/(label+'-process.json')).write_text(json.dumps(row,indent=2)+'\n')
print(json.dumps(row))
print(out.read_text()[-24000:])
if err.stat().st_size:print(err.read_text()[-6000:])
sys.exit(p.returncode)
