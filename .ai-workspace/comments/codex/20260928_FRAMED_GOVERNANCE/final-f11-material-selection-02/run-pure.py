from pathlib import Path
import subprocess,sys,json,time,os,signal
O=Path(__file__).resolve().parent
label,exe,script=sys.argv[1:4]
assert exe in ('python3','node') and Path(script).resolve().parent==O
ledger=O/'process-ledger.jsonl'
prior=[json.loads(x) for x in ledger.read_text().splitlines()] if ledger.exists() else []
remaining=300000-sum(x['elapsedMs'] for x in prior)
assert remaining>0
start=time.monotonic();terminated=[]
with (O/(label+'.stdout')).open('xb') as out,(O/(label+'.stderr')).open('xb') as err:
 p=subprocess.Popen([exe,script,*sys.argv[4:]],cwd=O,stdout=out,stderr=err,stdin=subprocess.DEVNULL,start_new_session=True)
 try: code=p.wait(timeout=min(120000,remaining)/1000)
 except subprocess.TimeoutExpired:
  os.killpg(p.pid,signal.SIGTERM);terminated.append('SIGTERM')
  try:code=p.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);terminated.append('SIGKILL');code=p.wait()
record={'label':label,'command':[exe,script,*sys.argv[4:]],'pid':p.pid,'elapsedMs':(time.monotonic()-start)*1000,'exitCode':code,'signals':terminated,'nativeCalls':0}
(O/(label+'.process.json')).write_text(json.dumps(record,indent=2)+'\n')
with ledger.open('a') as f:f.write(json.dumps(record)+'\n')
print(json.dumps(record));print((O/(label+'.stdout')).read_text()[-16000:]);print((O/(label+'.stderr')).read_text()[-8000:]);sys.exit(code)
